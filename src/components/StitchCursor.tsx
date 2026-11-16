"use client";

import { useEffect, useRef } from "react";

// The cursor, embroidered: a lazy-daisy rosette in kumkum red thread (six looped petal stitches around a
// French knot, inside a ring of running stitch). It follows the pointer a little behind, as if on a thread,
// and turns slowly; over anything clickable it grows and its petals open; a click makes it bloom. Only for a
// mouse or trackpad: touch screens keep their own.

const THREAD = "#c8241f";
const FOLLOW = 0.22; // how quickly it catches up with the pointer, per frame
const CLICKABLE = "a, button, [role=button], input, textarea, select, label";
const REACH = 120; // px: within this of something clickable, a petal reaches toward it
// one lazy-daisy petal: a loop of thread from the centre out (the tie stitch at its tip is drawn after)
const PETAL = "M0 -3.2C-3.4 -6 -3 -11 0 -12.6C3 -11 3.4 -6 0 -3.2Z";

export default function StitchCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("stitch-cursor");

    const at = { x: -100, y: -100 }, to = { x: -100, y: -100 };
    let spin = 0, scale = 1, target = 1, shown = false, raf = 0, prev = performance.now();

    // Near something clickable (but not on it), the petal facing it reaches out and opens its diamond, more
    // the closer you are, and the flower turns so that petal points straight at it.
    const petals = [...el.querySelectorAll<SVGGElement>(".stitch-petal")];
    let reach: { angle: number; amount: number } | null = null;
    const findReach = (x: number, y: number) => {
      let best: { d: number; angle: number } | null = null;
      for (const c of document.querySelectorAll(CLICKABLE)) {
        const r = c.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
        // the nearest point of the link's box
        const nx = Math.max(r.left, Math.min(x, r.right)), ny = Math.max(r.top, Math.min(y, r.bottom));
        const d = Math.hypot(nx - x, ny - y);
        if (d > 0 && d < REACH && (!best || d < best.d)) best = { d, angle: Math.atan2(ny - y, nx - x) };
      }
      return best ? { angle: best.angle, amount: 1 - best.d / REACH } : null;
    };

    const over = (e: PointerEvent) => {
      to.x = e.clientX;
      to.y = e.clientY;
      if (!shown) { at.x = to.x; at.y = to.y; shown = true; el.style.opacity = "1"; }
      const hot = (e.target as Element | null)?.closest(CLICKABLE);
      el.classList.toggle("is-hot", !!hot);
      target = hot ? 1.6 : 1;
      reach = hot ? null : findReach(e.clientX, e.clientY);
    };
    // a click makes it bloom: the petals spring out around the cursor, a diamond at each tip, then settle
    let bloom = 0;
    const press = () => {
      scale *= 0.82;
      el.classList.remove("is-bloom");
      void el.offsetWidth; // restart the bloom on a quick second click
      el.classList.add("is-bloom");
      clearTimeout(bloom);
      bloom = window.setTimeout(() => el.classList.remove("is-bloom"), 520);
    };
    const hide = () => { shown = false; el.style.opacity = "0"; };

    const frame = (now: number) => {
      const f = Math.min(3, (now - prev) / 16.7);
      prev = now;
      const k = reduce ? 1 : 1 - (1 - FOLLOW) ** f;
      at.x += (to.x - at.x) * k;
      at.y += (to.y - at.y) * k;
      scale += (target - scale) * (reduce ? 1 : 1 - 0.8 ** f);
      let reaching = -1;
      if (reach && !el.classList.contains("is-bloom")) {
        // the petal nearest the link (petal i points at screen angle spin + 60i - 90 degrees)
        const want = (reach.angle * 180) / Math.PI + 90;
        reaching = (((Math.round((want - spin) / 60) % 6) + 6) % 6);
        // turn so it points exactly at the link, the short way round
        const aim = want - reaching * 60;
        const diff = ((((aim - spin) % 360) + 540) % 360) - 180;
        spin += diff * (reduce ? 1 : 1 - 0.85 ** f);
      } else if (!reduce) spin = (spin + (el.classList.contains("is-hot") ? 1.6 : 0.35) * f) % 360;
      // set directly (and cleared to "" when not reaching, so the hover and bloom styles take over)
      petals.forEach((p, i) => {
        const a = i === reaching ? reach!.amount : 0;
        if (p.dataset.reach === a.toFixed(2)) return;
        p.dataset.reach = a.toFixed(2);
        const diamond = p.querySelector<SVGElement>(".stitch-diamond")!;
        p.style.transform = a ? `translateY(${-8 * a}px) scale(${1 + 0.28 * a})` : "";
        diamond.style.transform = a ? `scale(${1.7 * a})` : "";
      });
      el.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, -50%) scale(${scale}) rotate(${spin}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("pointermove", over, { passive: true });
    window.addEventListener("pointerdown", press);
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bloom);
      document.documentElement.classList.remove("stitch-cursor");
      window.removeEventListener("pointermove", over);
      window.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, []);

  // six lazy-daisy petals: a white loop outlined in thread, caught at its tip by a tiny tie stitch
  const petals = Array.from({ length: 6 }, (_, i) => i * 60);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="stitch pointer-events-none fixed top-0 left-0 z-[200] h-9 w-9 opacity-0 transition-opacity duration-300"
    >
      <svg viewBox="-20 -20 40 40" className="h-full w-full overflow-visible" fill="none" stroke={THREAD} strokeLinecap="round">
        {/* a pale halo under the thread, so it reads on the footage as well as on white */}
        {/* a solid white ground inside the ring, so nothing behind shows through the flower */}
        <circle r="16" fill="#fff" stroke="none" />
        <g className="stitch-ring-wrap">
          <circle r="16" stroke="#fff" strokeOpacity="0.85" strokeWidth="3.4" strokeDasharray="2.2 2.6" />
        {/* running stitch around the edge */}
        <circle className="stitch-ring" r="16" strokeWidth="1.3" strokeDasharray="2.2 2.6" />
        </g>
        {/* the petals, each its own little group so it can open */}
        {petals.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <g className="stitch-petal">
              {/* filled white, outlined in the red thread */}
              <path d={PETAL} fill="#fff" strokeWidth="1.3" />
              <path d="M0 -12.6V-14.2" strokeWidth="1.3" />
              {/* the diamond that appears at the tip when it blooms */}
              <path className="stitch-diamond" d="M0 -18.6L1.6 -16.4L0 -14.2L-1.6 -16.4Z" fill={THREAD} stroke="#fff" strokeWidth="0.8" />
            </g>
          </g>
        ))}
        {/* the French knot */}
        <circle r="2.2" fill={THREAD} stroke="#fff" strokeOpacity="0.85" strokeWidth="1" />
      </svg>
    </div>
  );
}
