"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// The navigation: a thread across the bottom of the screen with the sections along it, and a bindi (a dot
// of kumkum red) that marks where you are. Scrolling carries the bindi along the thread; hovering a section
// plucks the thread there like a sitar string; choosing one glides the page there as the bindi follows.

const SECTIONS = [
  { id: "index", label: "Index" },
  { id: "view", label: "Point of view" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];
const POINTS = 140; // string resolution
const TENSION = 0.38; // wave speed along the string (< 0.5 to stay stable)
const DAMPING = 0.986; // how quickly a pluck dies away
const PLUCK = 7; // px the string is pulled at a hovered section
const BASE = 14; // the string's resting height inside its svg

// where on the page each section begins, as a scroll position
function sectionTargets() {
  return SECTIONS.map(({ id }) => {
    if (id === "index") return 0;
    // the point of view is the end of the hero's pinned scroll, where the eyes have settled in the line
    if (id === "view") return ScrollTrigger.getById("hero")?.end ?? 0;
    // the rest sit along the horizontal track, which moves one px sideways per px scrolled: a section is
    // reached when the track has carried it to the left edge
    const track = ScrollTrigger.getById("track"), el = document.getElementById(id);
    return track && el ? track.start + el.offsetLeft : 0;
  });
}

export default function ThreadNav() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nav = root.current!;
    const svg = nav.querySelector("svg")!;
    const path = svg.querySelector("path")!;
    const bindi = nav.querySelector<HTMLElement>(".bindi")!;
    const ghost = nav.querySelector<HTMLElement>(".bindi-ghost")!;
    const labels = [...nav.querySelectorAll<HTMLElement>("[data-thread-label]")];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0, xs: number[] = [], targets: number[] = [];
    const y = new Float32Array(POINTS), v = new Float32Array(POINTS);
    // the labels' centres along the thread, in px from its left end
    const measure = () => {
      const box = svg.getBoundingClientRect();
      width = box.width;
      xs = labels.map((l) => {
        const r = l.getBoundingClientRect();
        return r.left + r.width / 2 - box.left;
      });
      targets = sectionTargets();
      place();
    };

    const draw = () => {
      let d = `M0 ${BASE + y[0]}`;
      for (let i = 1; i < POINTS; i++) d += `L${((i / (POINTS - 1)) * width).toFixed(1)} ${(BASE + y[i]).toFixed(2)}`;
      path.setAttribute("d", d);
    };
    const yAt = (x: number) => y[Math.max(0, Math.min(POINTS - 1, Math.round((x / width) * (POINTS - 1))))];

    // the bindi's place: between the two sections the scroll is between, in proportion
    let bx = 0;
    const place = () => {
      if (!xs.length) return;
      const s = window.scrollY;
      let i = 0;
      while (i < targets.length - 1 && s >= targets[i + 1]) i++;
      const a = targets[i], b = targets[i + 1] ?? a;
      const t = b > a ? Math.min(1, Math.max(0, (s - a) / (b - a))) : 0;
      bx = xs[i] + ((xs[i + 1] ?? xs[i]) - xs[i]) * t;
      // the current section is the one the bindi is nearest to
      setActive(t > 0.5 && i < xs.length - 1 ? i + 1 : i);
      bindi.style.transform = `translate(${bx}px, ${BASE + yAt(bx)}px)`;
    };

    // pull the string down at x, as a soft bump, and let it go
    const pluck = (x: number, amount = PLUCK) => {
      if (reduce || !width) return;
      const c = (x / width) * (POINTS - 1), spread = POINTS * 0.05;
      for (let i = 1; i < POINTS - 1; i++) y[i] += amount * Math.exp(-((i - c) ** 2) / (2 * spread * spread));
      wake();
    };

    let raf = 0, running = false;
    const step = () => {
      let energy = 0;
      for (let i = 1; i < POINTS - 1; i++) {
        v[i] = (v[i] + (y[i - 1] + y[i + 1] - 2 * y[i]) * TENSION) * DAMPING;
        energy += Math.abs(v[i]) + Math.abs(y[i]) * 0.02;
      }
      for (let i = 1; i < POINTS - 1; i++) y[i] += v[i];
      draw();
      bindi.style.transform = `translate(${bx}px, ${BASE + yAt(bx)}px)`;
      if (energy > 0.02) raf = requestAnimationFrame(step);
      else {
        y.fill(0); v.fill(0); draw();
        running = false;
      }
    };
    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };

    const enter = (i: number) => {
      pluck(xs[i]);
      ghost.style.transform = `translate(${xs[i]}px, ${BASE}px)`;
      ghost.style.opacity = "1";
    };
    const out = () => { ghost.style.opacity = "0"; };
    const go = (i: number) => (e: Event) => {
      // handled here, not by Lenis' anchor links: those would aim at a pinned section's moving box
      e.preventDefault();
      e.stopPropagation();
      const to = sectionTargets()[i];
      if (window.__lenis) window.__lenis.scrollTo(to, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top: to, behavior: reduce ? "auto" : "smooth" });
      pluck(xs[i], PLUCK * 1.6);
    };
    const handlers = labels.map((l, i) => {
      const h = { enter: () => enter(i), click: go(i) };
      l.addEventListener("pointerenter", h.enter);
      l.addEventListener("pointerleave", out);
      l.addEventListener("focus", h.enter);
      l.addEventListener("blur", out);
      l.addEventListener("click", h.click);
      return h;
    });

    measure();
    draw();
    // a single soft pluck once everything has arrived, so the thread is noticed
    const hello = setTimeout(() => pluck(xs[0] ?? 0, PLUCK * 0.8), 6000);
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", measure);
    ScrollTrigger.addEventListener("refresh", measure);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hello);
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", measure);
      ScrollTrigger.removeEventListener("refresh", measure);
      labels.forEach((l, i) => {
        l.removeEventListener("pointerenter", handlers[i].enter);
        l.removeEventListener("pointerleave", out);
        l.removeEventListener("focus", handlers[i].enter);
        l.removeEventListener("blur", out);
        l.removeEventListener("click", handlers[i].click);
      });
    };
  }, []);

  return (
    <div ref={root} data-nav-item>
      {/* the thread and its labels: white with difference blending (on the fixed layer itself, so it blends
          with the page beneath), so they read on the white page and over the footage alike */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-50 px-6 pb-4 font-(family-name:--font-inter-tight) text-white mix-blend-difference sm:px-10 sm:pb-6"
      >
        <ul className="flex justify-between text-[11px] tracking-[-0.01em] sm:text-[13px]">
          {SECTIONS.map(({ id, label }, i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                data-thread-label
                aria-current={active === i ? "location" : undefined}
                className={`block px-1 pb-1 transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-55 hover:opacity-100"}`}
              >
                <span className="mr-1.5 hidden text-[9px] opacity-60 sm:inline">0{i + 1}</span>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <svg className="block h-7 w-full overflow-visible" aria-hidden="true">
          <path fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </nav>
      {/* the bindi, on its own layer lined up with the thread, so it stays kumkum red over anything */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-6 pb-4 sm:px-10 sm:pb-6">
        <div className="relative h-7">
          <span className="bindi-ghost absolute top-0 left-0 -mt-[3px] -ml-[3px] h-1.5 w-1.5 rounded-full bg-[#c8241f]/40 opacity-0 transition-opacity duration-300" />
          <span className="bindi absolute top-0 left-0 -mt-[5px] -ml-[5px] h-2.5 w-2.5 rounded-full bg-[#c8241f] shadow-[0_0_0_3px_rgba(200,36,31,0.15)]" />
        </div>
      </div>
    </div>
  );
}
