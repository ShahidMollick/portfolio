import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Arrow } from "@/components/Icon";
import NoteCover from "@/components/NoteCover";
import { NOTES } from "@/content/notes";

export function generateStaticParams() {
  return NOTES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const note = NOTES.find((n) => n.slug === slug);
  return note ? { title: `${note.title} · Shahid Mollick`, description: note.dek } : {};
}

// One note, read top to bottom: an ordinary vertical page, set in the same type as the site, with the next
// note at the end.
export default async function NotePage(props: PageProps<"/notes/[slug]">) {
  const { slug } = await props.params;
  const i = NOTES.findIndex((n) => n.slug === slug);
  if (i < 0) notFound();
  const note = NOTES[i];
  const { title, dek, tag, minutes, body } = note;
  const next = NOTES[(i + 1) % NOTES.length];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white px-6 pt-36 pb-24 font-(family-name:--font-inter-tight) text-[#141414] sm:px-10 md:pt-44">
        <article className="mx-auto grid max-w-[1400px] grid-cols-12 gap-x-4 sm:gap-x-6">
          <p className="col-span-12 text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">
            <Link href="/" className="transition-colors hover:text-black">
              <Arrow direction="left" className="mr-2" /> Notes
            </Link>
            <span className="mx-3">/</span>
            {tag} · {minutes} min read
          </p>

          <h1 className="col-span-12 mt-10 font-(family-name:--font-serif-display) text-[clamp(40px,6.4vw,120px)] leading-[0.96] tracking-[-0.02em] text-balance uppercase lg:col-span-10">
            {title}
          </h1>

          <NoteCover note={note} n={i + 1} className="col-span-12 mt-12 aspect-[21/9] w-full" />

          <div className="col-span-12 mt-12 border-t border-black/15 pt-8 md:col-span-7 md:col-start-4">
            <p className="text-[clamp(18px,1.6vw,24px)] leading-snug text-pretty">{dek}</p>
            <div className="mt-10 space-y-6 text-[16px] leading-relaxed text-pretty text-black/75">
              {body.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
            <p className="mt-12 text-[13px] text-black/50">Shahid Mollick</p>
          </div>

          <Link
            href={`/notes/${next.slug}`}
            className="group col-span-12 mt-24 border-t border-black/15 pt-6 md:col-span-7 md:col-start-4"
          >
            <span className="text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">Next note</span>
            <span className="mt-3 block font-(family-name:--font-serif-display) text-[clamp(26px,2.6vw,44px)] leading-[1.04] tracking-[-0.01em] uppercase transition-opacity group-hover:opacity-60">
              {next.title} <Arrow className="ml-2" />
            </span>
          </Link>
        </article>
      </main>
    </>
  );
}
