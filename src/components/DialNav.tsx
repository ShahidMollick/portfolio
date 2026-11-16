"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { scrollForX } from "@/lib/track";

// The navigation, as a half dial at the bottom of the screen: the sections sit around a hairline arc, and a
// needle of black running stitch points to where you are, moving as you scroll. Choosing a
// section changes page with a radial swipe: a white sweep turns across the screen from the dial's centre,
// the page moves under it, and the sweep carries on round to uncover the new section.

// (the opening screen counts as a place for the needle, but isn't named on the dial: the
// dial only arrives once you've left it)
const SECTIONS = [
  { id: "index", label: "Index", onDial: false },
  { id: "view", label: "What I do" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];
const R = 72; // the arc's radius, px
const W = 2 * (R + 84), H = R + 26; // the dial's box; its centre sits at the middle of the bottom edge
const CX = W / 2, CY = H - 4;
// each section's angle around the arc, in degrees (180 is far left, 0 far right)
const NAMED = SECTIONS.filter((s) => s.onDial !== false);
const ANGLE = SECTIONS.map((s) => {
  const j = Math.max(0, NAMED.indexOf(s)); // the opening screen shares the first named one's place
  return 180 - (180 * j) / (NAMED.length - 1);
});
const polar = (deg: number, r: number) => [CX + r * Math.cos((deg * Math.PI) / 180), CY - r * Math.sin((deg * Math.PI) / 180)];

// where on the page each section ends, if it holds the screen a while (data-scroll-end, like the work's run
// through its projects), else where it begins: the needle stays on it till then
function sectionEnds(starts: number[]) {
  return SECTIONS.map(({ id }, i) => Number(document.getElementById(id)?.dataset.scrollEnd ?? starts[i]) || starts[i]);
}

// where on the page each section begins, as a scroll position
function sectionTargets() {
  return SECTIONS.map(({ id }) => {
    if (id === "index") return 0;
    // the point of view is the end of the hero's pinned scroll, where the eyes have settled in the line
    if (id === "view") return ScrollTrigger.getById("hero")?.end ?? 0;
    // the rest sit along the horizontal track: a section is reached when the track has carried it to the
    // left edge (or, for one that shares the screen with the one before, data-peek of the screen short of it)
    const el = document.getElementById(id);
    // (one that plays inside another's screen, like the work in About's, says where it begins: data-scroll-at)
    if (el?.dataset.scrollAt) return Number(el.dataset.scrollAt);
    const peek = Number(el?.dataset.peek ?? 0) * window.innerWidth;
    return ScrollTrigger.getById("track") && el ? scrollForX(el.offsetLeft - peek) : 0;
  });
}

export default function DialNav() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  // not on the opening screen: the dial arrives once you're on your way into the page
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const needle = el.querySelector<SVGGElement>(".dial-needle")!;
    const sweep = el.querySelector<HTMLElement>(".dial-sweep")!;
    const edge = el.querySelector<HTMLElement>(".dial-edge")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let targets: number[] = [], ends: number[] = [], current = 0, busy = false;

    const point = (deg: number) => needle.setAttribute("transform", `rotate(${-deg} ${CX} ${CY})`);
    // the needle's angle: between the two sections the scroll is between, in proportion
    const place = () => {
      if (!targets.length || busy) return;
      const s = window.scrollY;
      let i = 0;
      while (i < targets.length - 1 && s >= targets[i + 1]) i++;
      const a = Math.max(targets[i], ends[i] ?? targets[i]), b = targets[i + 1] ?? a;
      const t = b > a ? Math.min(1, Math.max(0, (s - a) / (b - a))) : 0;
      point(ANGLE[i] + ((ANGLE[i + 1] ?? ANGLE[i]) - ANGLE[i]) * t);
      current = t > 0.5 && i < targets.length - 1 ? i + 1 : i;
      setActive(current);
      setShown(s > (targets[1] ?? 0) * 0.5);
    };
    const measure = () => { targets = sectionTargets(); ends = sectionEnds(targets); place(); };

    // (the page stays wherever the scroll leaves it: no settling on a section by itself)
    const onScroll = () => place();

    // The radial swipe. The sweep is a white layer masked by a cone from the dial's centre: it opens round
    // from one side to cover the screen, the page jumps under it, then it closes round to uncover.
    const cone = (from: number, span: number) => {
      const m = `conic-gradient(from ${from}deg at 50% 100%, #000 0deg ${span}deg, transparent ${span}deg)`;
      sweep.style.maskImage = m;
      sweep.style.webkitMaskImage = m;
    };
    const go = (i: number) => (e: Event) => {
      e.preventDefault();
      e.stopPropagation(); // handled here, not by Lenis' anchor links
      const to = sectionTargets()[i];
      const jump = () => {
        if (window.__lenis) window.__lenis.scrollTo(to, { immediate: true, force: true });
        else window.scrollTo(0, to);
        // skip the scroll-driven animations' catch-up, so the new section is already in place
        ScrollTrigger.update();
        ScrollTrigger.getAll().forEach((t) => {
          const tw = t.getTween?.(); // only scrubbed triggers have a catch-up tween
          if (tw && typeof tw.progress === "function") tw.progress(1);
        });
      };
      if (reduce || i === current || busy) { jump(); return; }
      busy = true;
      const forward = i > current;
      // css cone angles: 0 is up, 270 the left, 90 the right; the sweep turns the way the needle will
      const s = { a: 0 };
      const show = () => {
        sweep.style.visibility = "visible";
        edge.style.visibility = "visible";
      };
      const edgeAt = (deg: number) => { edge.style.transform = `rotate(${deg}deg)`; };
      gsap
        .timeline({
          onComplete: () => {
            sweep.style.visibility = "hidden";
            edge.style.visibility = "hidden";
            busy = false;
            measure();
          },
        })
        .add(show)
        // close over the page: the cone opens from the side the needle leaves
        .to(s, {
          a: 180,
          duration: 0.55,
          ease: "power2.in",
          onUpdate: () => {
            if (forward) { cone(270, s.a); edgeAt(270 + s.a); } else { cone(90 - s.a, s.a); edgeAt(90 - s.a); }
            point(ANGLE[current] + (ANGLE[i] - ANGLE[current]) * (s.a / 180) * 0.5);
          },
        })
        .add(jump)
        // and open again on the new section, carrying on round the same way
        .to(s, {
          a: 360,
          duration: 0.65,
          ease: "power3.out",
          onUpdate: () => {
            const d = s.a - 180;
            if (forward) { cone(270 + d, 180 - d); edgeAt(270 + d); } else { cone(270, 180 - d); edgeAt(90 - d); }
            point(ANGLE[current] + (ANGLE[i] - ANGLE[current]) * (0.5 + (d / 180) * 0.5));
          },
        });
    };
    const links = [...el.querySelectorAll<HTMLAnchorElement>("[data-dial-link]")];
    const handlers = links.map((l) => {
      const h = go(Number(l.dataset.dialLink));
      l.addEventListener("click", h);
      return h;
    });

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    ScrollTrigger.addEventListener("refresh", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ScrollTrigger.removeEventListener("refresh", measure);
      links.forEach((l, i) => l.removeEventListener("click", handlers[i]));
    };
  }, []);

  // the arc
  const [ax0, ay0] = polar(180, R), [ax1, ay1] = polar(0, R);
  // the needle: fletched tail, running-stitch shaft, a lotus-petal head and a spark beyond it
  const PL = 12, PW = 8.2; // petal length and spread
  const SR = 4.2; // the spark's radius
  const TIP = R - 2 * SR - 6; // the head's point, leaving room for the spark inside the arc
  const hx = CX + TIP, sx = hx + SR + 2;

  return (
    <div ref={root} data-nav-item>
      {/* the radial swipe: a white sweep turning from the dial's centre, with a fine leading edge */}
      <div aria-hidden="true" className="dial-sweep pointer-events-none fixed inset-0 z-[60] invisible bg-white" />
      <div
        aria-hidden="true"
        className="dial-edge pointer-events-none fixed bottom-0 left-1/2 z-[61] invisible h-[150vmax] w-px origin-bottom -translate-x-1/2 bg-[#141414]/60"
      />

      {/* the dial: white with difference blending, on the fixed layer itself so it blends with the page */}
      <nav
        aria-label="Sections"
        className={`fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 font-(family-name:--font-inter-tight) text-white mix-blend-difference transition-opacity duration-500 ${shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ width: W, height: H }}
      >
        <svg width={W} height={H} className="absolute inset-0 overflow-visible" aria-hidden="true">
          <path d={`M${ax0} ${ay0}A${R} ${R} 0 0 1 ${ax1} ${ay1}`} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.75" />
        </svg>
        <ul>
          {SECTIONS.map(({ id, label, onDial }, i) => {
            if (onDial === false) return null;
            const [x, y] = polar(ANGLE[i], R + 16);
            const side = ANGLE[i] > 100 ? "right" : ANGLE[i] < 80 ? "left" : "center";
            const on = active === i;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  data-dial-link={i}
                  aria-current={active === i ? "location" : undefined}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  // the name around the arc: the current one larger and full strength
                  className="absolute block py-1 leading-none whitespace-nowrap"
                  style={{
                    left: x,
                    top: y,
                    transform: `translate(${side === "right" ? "-100%" : side === "left" ? "0" : "-50%"}, -50%)`,
                  }}
                >
                  <span
                    className={`block text-[13px] tracking-[-0.01em] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? "scale-[1.35] opacity-100" : hover === i ? "opacity-100" : "opacity-45"}`}
                    style={{ transformOrigin: side === "right" ? "100% 50%" : side === "left" ? "0 50%" : "50% 50%" }}
                  >
                    {label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* the needle, in black thread on its own layer, with a faint white glow so it still reads over the footage */}
      <svg
        aria-hidden="true"
        width={W}
        height={H}
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 overflow-visible drop-shadow-[0_0_1.5px_rgba(255,255,255,0.9)] transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
      >
        <g className="dial-needle" stroke="#141414" strokeLinecap="round" strokeLinejoin="round">
          {/* the tail: two short stitches, like fletching */}
          <path d={`M${CX + 11} ${CY}l-4.2 -3.2M${CX + 11} ${CY}l-4.2 3.2`} strokeWidth="1.2" fill="none" />
          {/* the shaft, in running stitch */}
          <line x1={CX + 11} y1={CY} x2={CX + TIP - PL + 2} y2={CY} strokeWidth="1.2" strokeDasharray="2.6 2.2" />
          {/* the head: two lotus petals meeting at the tip, white inside a red thread */}
          {[-1, 1].map((side) => (
            <path
              key={side}
              d={`M${hx} ${CY}C${hx - 2.4} ${CY + side * 4.4} ${hx - 6.8} ${CY + side * 7.4} ${hx - PL} ${CY + side * PW}C${hx - PL * 0.82} ${CY + side * PW * 0.6} ${hx - PL * 0.45} ${CY + side * PW * 0.22} ${hx} ${CY}Z`}
              fill="#fff"
              strokeWidth="1.1"
            />
          ))}
          {/* and the spark just beyond it */}
          <path
            d={`M${sx} ${CY - SR}Q${sx + SR * 0.14} ${CY - SR * 0.14} ${sx + SR} ${CY}Q${sx + SR * 0.14} ${CY + SR * 0.14} ${sx} ${CY + SR}Q${sx - SR * 0.14} ${CY + SR * 0.14} ${sx - SR} ${CY}Q${sx - SR * 0.14} ${CY - SR * 0.14} ${sx} ${CY - SR}Z`}
            fill="#141414"
            stroke="none"
          />
        </g>
        {/* the hub: a French knot */}
        <circle cx={CX} cy={CY} r="3.4" fill="#141414" stroke="#fff" strokeWidth="1" />
      </svg>
    </div>
  );
}
