"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NOTES } from "@/content/notes";
import { Arrow } from "./Icon";
import NoteCover from "./NoteCover";

const SHOWN = 3; // how many of the newest notes take turns
const EVERY = 5000; // ms each one stays

// The newest notes, taking turns in one spot: each with its cover, title and first lines. The next one rises
// in as the last leaves upwards; it holds still while you're pointing at it.
export default function LatestNote({ className = "" }: { className?: string }) {
  const notes = NOTES.slice(0, SHOWN);
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (held || notes.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setAt((i) => (i + 1) % notes.length), EVERY);
    return () => window.clearInterval(t);
  }, [held, notes.length]);

  return (
    <div
      className={className}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <p className="flex items-center gap-2">
        Latest notes
        {/* where in the turn it is: one tick per note */}
        <span className="flex gap-1" aria-hidden="true">
          {notes.map((n, i) => (
            <span key={n.slug} className={`h-px w-3 transition-colors duration-500 ${i === at ? "bg-black/70" : "bg-black/15"}`} />
          ))}
        </span>
      </p>
      <div className="mt-2 grid overflow-hidden">
        {notes.map((note, i) => {
          const state = i === at ? "translate-y-0 opacity-100" : i === (at - 1 + notes.length) % notes.length ? "-translate-y-full opacity-0" : "translate-y-full opacity-0";
          return (
            <Link
              key={note.slug}
              href={`/notes/${note.slug}`}
              aria-hidden={i !== at}
              tabIndex={i === at ? 0 : -1}
              className={`group col-start-1 row-start-1 flex gap-3 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${state} ${i === at ? "" : "pointer-events-none"}`}
            >
              <NoteCover note={note} n={i + 1} className="h-[66px] w-[88px] shrink-0" />
              <span className="min-w-0">
                <span className="block text-[15px] leading-tight text-black/80 transition-colors group-hover:text-black">
                  {note.title} <Arrow />
                </span>
                <span className="mt-1 line-clamp-2 max-w-[46ch] text-[13px] leading-snug text-black/50">{note.body[0]}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
