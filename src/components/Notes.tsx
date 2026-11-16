import Link from "next/link";
import { NOTES } from "@/content/notes";
import { Arrow } from "./Icon";
import NoteCover from "./NoteCover";

// Notes, as a sheet of the About page: a short heading on the left, then the newest three across the rest
// of the grid, each a link to its own page.
export function NotesSheet({ className = "" }: { className?: string }) {
  const notes = NOTES.slice(0, 3);
  return (
    <div className={className}>
      <p className="col-span-12 text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">(03) About · Notes</p>
      <div className="col-span-12 self-center md:col-span-3">
        <h3 className="text-[clamp(28px,2.6vw,46px)] leading-[1.02] font-medium tracking-[-0.03em]">What I&apos;m seeing</h3>
        <p className="mt-4 max-w-xs text-[14px] leading-snug text-black/60">
          Short opinions on where design is heading: how the landscape is changing, how fast work moves now, and
          what founders should ask for.
        </p>
        <p className="mt-6 text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">
          {String(NOTES.length).padStart(2, "0")} notes
        </p>
      </div>
      <div className="col-span-12 mt-8 grid grid-cols-1 gap-4 self-center sm:grid-cols-3 sm:gap-6 md:col-span-9 md:col-start-4 md:mt-0">
        {notes.map((note, i) => (
          <Link key={note.slug} href={`/notes/${note.slug}`} className="group block">
            <NoteCover note={note} n={i + 1} className="aspect-[4/3] w-full" />
            <span className="mt-4 flex justify-between border-t border-black/15 pt-3 text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">
              <span>{note.tag}</span>
              <span>{note.minutes} min read</span>
            </span>
            <span className="mt-3 block text-[clamp(18px,1.5vw,26px)] leading-[1.1] font-medium tracking-[-0.02em] transition-opacity group-hover:opacity-60">
              {note.title} <Arrow />
            </span>
            <span className="mt-2 block text-[14px] leading-snug text-black/60">{note.dek}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
