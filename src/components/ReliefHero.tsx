"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FOLK_SHAPES, FOLK_VIEWBOX } from "./folk-shapes";

gsap.registerPlugin(useGSAP);

const PLASTER = "#f4f1ec";
// The artwork's frame (viewBox units); "slice" scaling covers the screen with it.
const RELIEF_VIEWBOX = FOLK_VIEWBOX.split(" ").map(Number);

// Indian folk motifs pressed into plaster, lit from the top left: a soft shadow below-right of each stroke, a
// highlight above-left, and the raised face in the plaster colour on top. Flat areas are exactly PLASTER,
// so the relief only shows where the motifs raise the surface. Built as an image once, so moving the
// reveal never re-runs the filter.
const reliefSvg = (() => {
  const [x, y, w, h] = RELIEF_VIEWBOX;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid slice">
<filter id="p" filterUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}" color-interpolation-filters="sRGB">
<feMorphology in="SourceAlpha" operator="dilate" radius="1.5" result="fat"/>
<feGaussianBlur in="fat" stdDeviation="1.6" result="form"/>
<feOffset in="form" dx="4" dy="5" result="s0"/><feGaussianBlur in="s0" stdDeviation="4" result="s1"/>
<feFlood flood-color="#5a5248" flood-opacity="0.38"/><feComposite in2="s1" operator="in" result="shadow"/>
<feOffset in="form" dx="-2.5" dy="-3" result="h0"/><feGaussianBlur in="h0" stdDeviation="2.5" result="h1"/>
<feFlood flood-color="#ffffff" flood-opacity="0.95"/><feComposite in2="h1" operator="in" result="light"/>
<feFlood flood-color="#f7f5f1"/><feComposite in2="form" operator="in" result="face"/>
<feFlood flood-color="${PLASTER}" result="wall"/>
<feMerge><feMergeNode in="wall"/><feMergeNode in="shadow"/><feMergeNode in="light"/><feMergeNode in="face"/></feMerge>
</filter>
<g filter="url(#p)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000" fill-opacity="0"/>${FOLK_SHAPES}</g>
</svg>`;
})();
const RELIEF_IMAGE = `url("data:image/svg+xml,${encodeURIComponent(reliefSvg)}")`;

// Reveal radius in px: resting size, and how much it swells with pointer speed.
const RADIUS = 210;
const SWELL = 120;

export default function ReliefHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const relief = el.querySelector<HTMLDivElement>(".relief")!;
      // where the pointer is, and where the reveal currently is (eased toward it every frame)
      const target = { x: 0, y: 0, on: 0 };
      const pos = { x: 0, y: 0, r: 0, v: 0 };
      let seen = false;

      const move = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        target.x = e.clientX - b.left;
        target.y = e.clientY - b.top;
        target.on = 1;
        if (!seen) { pos.x = target.x; pos.y = target.y; seen = true; }
      };
      const leave = () => { target.on = 0; };

      const tick = () => {
        const dx = target.x - pos.x, dy = target.y - pos.y;
        pos.x += dx * 0.12;
        pos.y += dy * 0.12;
        // speed swells the reveal a little, then it settles back
        pos.v += (Math.min(1, Math.hypot(dx, dy) / 120) - pos.v) * 0.08;
        pos.r += ((RADIUS + SWELL * pos.v) * target.on - pos.r) * 0.1;
        relief.style.setProperty("--x", `${pos.x}px`);
        relief.style.setProperty("--y", `${pos.y}px`);
        relief.style.setProperty("--r", `${pos.r}px`);
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerdown", move);
      el.addEventListener("pointerleave", leave);
      gsap.ticker.add(tick);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerdown", move);
        el.removeEventListener("pointerleave", leave);
        gsap.ticker.remove(tick);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-svh overflow-hidden" style={{ backgroundColor: PLASTER }}>
      {/* the relief, shown only inside a soft circle that trails the pointer */}
      <div
        aria-hidden="true"
        className="relief pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: RELIEF_IMAGE,
          maskImage: "radial-gradient(circle var(--r, 0px) at var(--x, 50%) var(--y, 50%), #000 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle var(--r, 0px) at var(--x, 50%) var(--y, 50%), #000 35%, transparent 100%)",
        }}
      />
    </section>
  );
}
