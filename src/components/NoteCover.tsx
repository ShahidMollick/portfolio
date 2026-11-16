import type { Note } from "@/content/notes";

// A note's cover: its image if it has one, otherwise a placeholder in the note's colour, with the same soft
// wash as the work placeholders and the note's number set large.
export default function NoteCover({ note, n, className = "" }: { note: Note; n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`relative block overflow-hidden [container-type:size] ${className}`}
      style={{ backgroundColor: note.tone }}
    >
      {note.cover ? (
        // eslint-disable-next-line @next/next/no-img-element -- a plain cover, sized by its box
        <img src={note.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,0.28),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(0,0,0,0.22),transparent_50%)]" />
          <span className="absolute inset-0 flex items-center justify-center text-[56cqh] leading-none font-medium tracking-[-0.05em] text-white/85">
            {String(n).padStart(2, "0")}
          </span>
        </>
      )}
    </span>
  );
}
