"use client";

import { useRef, useState } from "react";
import gsap from "gsap";

// The two ways to read About's story, in its corner: the whole of it, or only the design. Choosing one tells
// the timeline (HorizontalPage listens for "about:journey"). Hovering either brings up a note that follows
// the cursor, saying what it shows.
const MODES = [
  {
    id: "whole",
    label: "Check my whole journey",
    tip: "Everything: engineering, strategy, the companies I've built, and design. How each one changed the way I see.",
  },
  {
    id: "design",
    label: "Check only my design journey",
    tip: "Only the design: from my first brands to designing for founders today.",
  },
] as const;

export default function JourneyToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("whole");
  const [tip, setTip] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const note = useRef<HTMLDivElement>(null);
  const follow = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  // the note trails the cursor a little, placed from the corner (the page around it moves, so not fixed)
  const move = (e: React.PointerEvent) => {
    if (!root.current || !note.current) return;
    follow.current ??= {
      x: gsap.quickTo(note.current, "x", { duration: 0.35, ease: "power3.out" }),
      y: gsap.quickTo(note.current, "y", { duration: 0.35, ease: "power3.out" }),
    };
    const r = root.current.getBoundingClientRect();
    follow.current.x(e.clientX - r.left);
    follow.current.y(e.clientY - r.top);
  };

  const choose = (id: (typeof MODES)[number]["id"]) => {
    if (id === mode) return;
    setMode(id);
    window.dispatchEvent(new CustomEvent("about:journey", { detail: id }));
  };

  return (
    // (placed by the caller; positioned either way, so the note can be placed inside it)
    <div ref={root} className={className || "relative"} onPointerMove={move} onPointerLeave={() => setTip(null)}>
      {/* two rows, each a square radio and its line; the chosen one filled */}
      <div role="radiogroup" aria-label="Which journey" className="flex flex-col items-start gap-2 text-[11px] font-medium tracking-[0.02em] uppercase">
        {MODES.map((m) => {
          const on = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-describedby={`journey-tip-${m.id}`}
              onClick={() => choose(m.id)}
              onPointerEnter={() => setTip(m.tip)}
              onFocus={() => setTip(m.tip)}
              onBlur={() => setTip(null)}
              className={`group flex cursor-pointer items-center gap-2.5 whitespace-nowrap uppercase transition-colors duration-300 ${
                on ? "text-[#141414]" : "text-black/40 hover:text-[#141414]"
              }`}
            >
              <span aria-hidden="true" className="grid h-[11px] w-[11px] place-items-center border border-current">
                <span className={`h-[5px] w-[5px] bg-current transition-transform duration-300 ${on ? "scale-100" : "scale-0"}`} />
              </span>
              {m.label}
              <span id={`journey-tip-${m.id}`} className="sr-only">
                {m.tip}
              </span>
            </button>
          );
        })}
      </div>

      {/* the note: below and to the left of the cursor, so it never runs off the corner */}
      <div ref={note} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-10">
        <p
          className={`w-[16rem] -translate-x-[calc(100%+12px)] translate-y-4 bg-[#141414] px-3 py-2.5 text-[12px] leading-snug text-white normal-case transition-opacity duration-200 ${
            tip ? "opacity-100" : "opacity-0"
          }`}
        >
          {tip}
        </p>
      </div>
    </div>
  );
}
