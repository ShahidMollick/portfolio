import CollaborateLink from "./CollaborateLink";
import JourneyToggle from "./JourneyToggle";
import Work from "./Work";

// About, as one still screen, told as a story. A ruler of weeks runs across the middle and a needle
// stands through it; scrolling runs the ruler past the needle, from the start to now, chapter by chapter.
// The pictures and films ride the ruler as one unbroken filmstrip, with a magnifying glass over it at the
// needle: biggest there, smaller the farther from it, always edge to edge. Under the ruler, the chapter is told: when and where to the left of the
// needle, what happened to the right. The company's logo sits in the corner. (Driven from
// HorizontalPage, by the data-tl-* hooks.)

const START = { year: 2022, month: 1 }; // the ruler's first month
const month = (year: number, m: number) => (year - START.year) * 12 + m - START.month;
const RANGE = month(2026, 10); // the ruler runs to here, now: the last chapter, Today, ends it at the needle
const PPM = 44; // px per month along the ruler

const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longLabel = (i: number) => `${FULL[(START.month - 1 + i) % 12]} ${START.year + Math.floor((START.month - 1 + i) / 12)}`;

// logo: the company's, in public/clients, at a height that matches the others (em); else its name is set.
// head: the chapter in a line, said casually; sub: the rest of it
type Chapter = {
  at: number;
  when?: string; // when the month alone won't do
  until?: string;
  mark: string; // a word or two, on the ruler
  place: string;
  logo?: { src: string; h: number };
  head: string;
  sub: string;
  design?: boolean; // part of the design journey, too
  // how it's told in the design journey, where that differs: its mark on the ruler, and the design side of it
  asDesign?: { mark: string; head: string; sub: string };
};
const CHAPTERS: Chapter[] = [
  {
    at: month(2022, 7),
    mark: "Engineering",
    place: "IIT Kharagpur",
    head: "I joined IIT Kharagpur in India, as a metallurgical engineer.",
    sub: "Metallurgical and materials engineering: learning to look past the surface, at the structure that holds a thing together.",
  },
  {
    at: month(2022, 8),
    when: "Summer 2022",
    mark: "Design",
    design: true,
    place: "First brands",
    head: "Then I started designing.",
    sub: "That same summer I made my first brands, and I haven't stopped since: 8+ so far, for clients in India and abroad.",
  },
  {
    at: month(2024, 5),
    until: "Jul 2024",
    mark: "Strategy",
    place: "Piramal Foundation",
    logo: { src: "/clients/piramal-foundation.svg", h: 1.67 },
    head: "I joined Piramal Foundation, in the CEO's office.",
    sub: "Healthcare strategy for more than ten million underserved people across Chhattisgarh. It's where I learned how decisions really get made.",
  },
  {
    at: month(2024, 12),
    until: "Jan 2026",
    mark: "First company",
    place: "CareQ",
    design: true,
    asDesign: {
      mark: "CareQ brand",
      head: "I designed CareQ's brand myself.",
      sub: "As its founder, I designed the brand too. Building the company behind it is how I learned to design like an owner.",
    },
    head: "Then I started my first company, CareQ.",
    sub: "Software for hospitals and diagnostic centres, to cut the queues at their OPDs. At AIIMS Jodhpur, service got 12% faster.",
  },
  {
    at: month(2025, 5),
    until: "Jul 2025",
    mark: "Product",
    place: "Bosch",
    logo: { src: "/clients/bosch.svg", h: 1.0 },
    head: "I joined Bosch, in product strategy.",
    sub: "The roadmap and go-to-market for Bosch's document AI platform, across India, the US, the UK and the UAE.",
  },
  {
    // date to confirm
    at: month(2025, 9),
    mark: "Research",
    place: "Cambridge Judge Business School",
    logo: { src: "/clients/cambridge-judge.png", h: 1.5 },
    head: "I did research at Cambridge.",
    sub: "At the University of Cambridge's Judge Business School, looking at how businesses work, from the outside in.",
  },
  {
    at: month(2026, 2),
    until: "Now",
    mark: "Zlice",
    place: "Zlice",
    design: true,
    asDesign: {
      mark: "Zlice brand",
      head: "And I designed Zlice's brand, too.",
      sub: "A brand for 25,000+ people on my own campus, that had to earn their trust with payments, identity and delivery.",
    },
    head: "I founded Zlice, for my own campus.",
    sub: "Payments, identity and delivery for 25,000+ people at IIT Kharagpur. So far, ₹7.2L+ in GMV and 3.5k+ users.",
  },
  {
    at: month(2026, 5),
    until: "Jul 2026",
    mark: "Discovery",
    place: "Rapido",
    logo: { src: "/clients/rapido.svg", h: 1.25 },
    head: "I joined Rapido, in product.",
    sub: "Zero-to-one discovery: working out what new bus, auto and e-rickshaw rides should be.",
  },
  {
    at: month(2026, 10),
    mark: "Today",
    design: true,
    place: "Shahid Mollick & Company",
    head: "Now I design for founders.",
    sub: "An engineer, a strategist, a founder and a designer, all at once. And there's something new in the design space on the way.",
  },
];

// Each chapter's pictures and films: tiny on the filmstrip along the ruler, grown as their chapter nears
// the needle. PLACEHOLDERS for now, from the internet: photos from Lorem Picsum
// (Unsplash pictures, free to use) and open sample clips (MDN's CC0 videos, samplelib, test-videos.co.uk,
// Pexels); swap in your own files in public/about as they're ready. ratio: the frame's width over height.
type Media = { src: string; ratio: number; video?: boolean };
const pic = (seed: string, ratio: number): Media => ({ src: `https://picsum.photos/seed/sm-${seed}/800/${Math.round(800 / ratio)}`, ratio });
const film = (src: string, ratio = 16 / 9): Media => ({ src, ratio, video: true });
const own = (src: string, ratio = 4 / 3): Media => ({ src, ratio });
const CLIP = {
  flower: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  friday: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
  jelly: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4",
  five: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  ten: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
  city: "https://videos.pexels.com/video-files/856973/856973-hd_1920_1080_25fps.mp4",
};
const MEDIA: Record<string, Media[]> = {
  "IIT Kharagpur": [own("/about/journey/iit-kharagpur.jpg"), pic("iit-lab", 3 / 4), film(CLIP.jelly)],
  "First brands": [pic("brand-a", 1), pic("brand-b", 4 / 5), film(CLIP.flower), pic("brand-c", 3 / 2), pic("brand-d", 4 / 3)],
  "Piramal Foundation": [own("/about/journey/piramal.jpg"), pic("piramal-field", 3 / 2), film(CLIP.friday)],
  CareQ: [own("/about/journey/careq.jpg"), pic("careq-ui", 4 / 5), pic("careq-mark", 1), film(CLIP.five)],
  Bosch: [own("/about/journey/bosch.jpg"), pic("bosch-doc", 3 / 2), film(CLIP.city)],
  "Cambridge Judge Business School": [own("/about/journey/cambridge-judge.jpg"), pic("cam-library", 3 / 4)],
  Zlice: [own("/about/journey/zlice.jpg"), pic("zlice-app", 4 / 5), film(CLIP.ten), pic("zlice-campus", 3 / 2)],
  Rapido: [own("/about/journey/rapido.jpg"), pic("rapido-road", 16 / 9), pic("rapido-auto", 4 / 5)],
  "Shahid Mollick & Company": [own("/about/shahid.jpg", 4 / 5), pic("today-desk", 3 / 2), film(CLIP.flower)],
};

// the pictures between the chapters, so the filmstrip runs unbroken from end to end: PLACEHOLDERS too
const FILLERS: Media[] = Array.from({ length: 110 }, (_, i) => {
  const ratio = [4 / 3, 1, 3 / 2, 4 / 5, 16 / 9, 4 / 3, 3 / 4][i % 7];
  return { src: `https://picsum.photos/seed/sm-strip-${i}/480/${Math.round(480 / ratio)}`, ratio };
});

const kicker = "text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase";

// the last chapter, told in the right half once the whole story has run past
const TODAY = CHAPTERS[CHAPTERS.length - 1];

// a line of told text, in a mask, so it can rise in and out
const Line = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <span className="block overflow-hidden pb-[0.1em]">
    <span data-l className={`block will-change-transform ${className}`}>
      {children}
    </span>
  </span>
);

// a line said aloud: its words, each ready to be spoken in turn (see HorizontalPage)
// (masked: each word in a slot of its own, so it can rise up into it from below)
const Said = ({ className = "", text, masked = false }: { className?: string; text: string; masked?: boolean }) => (
  <p className={className}>
    {text.split(" ").map((w, i) => (
      <span key={i}>
        <span data-mask={masked || undefined} className={masked ? "-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom" : "inline"}>
          <span data-w className="inline-block will-change-[opacity,transform,filter]">
            {w}
          </span>
        </span>{" "}
      </span>
    ))}
  </p>
);

export default function About() {
  return (
    <section
      id="about"
      data-tl-ppm={PPM}
      data-tl-stops={[0, ...CHAPTERS.map((c) => c.at)].join(",")}
      data-tl-design={CHAPTERS.flatMap((c, i) => (c.design ? [i + 1] : [])).join(",")}
      // --mid: the middle of the screen as seen (the section is 100vw, which counts the scrollbar)
      className="group/about relative h-full w-screen shrink-0 overflow-hidden bg-white font-(family-name:--font-inter-tight) text-[#141414] [--mid:50%]"
    >
      <p data-ab-fade className={`absolute top-32 left-6 sm:left-10 md:top-36 ${kicker}`}>(03) About</p>
      {/* which journey to tell, in the corner */}
      <div data-ab-fade className="absolute top-32 right-6 z-10 sm:right-10 md:top-36">
        <JourneyToggle />
      </div>

      {/* the ruler, run sideways under the needle: a tick a week, longer for months, quarters and years; the
          years under it, the chapters over it */}
      <div data-ab-fade aria-hidden="true" className="absolute top-[54%] left-(--mid) z-20">
        <div data-tl-ruler className="absolute top-0 left-0 will-change-transform">
          {Array.from({ length: RANGE * 4 + 1 }, (_, w) => {
            const i = w / 4;
            const year = w % 48 === 0, quarter = w % 12 === 0, month = w % 4 === 0;
            const o = year ? 0.5 : quarter ? 0.28 : month ? 0.16 : 0.08;
            return (
              <span key={w} className="absolute top-0" style={{ left: i * PPM }}>
                <span
                  data-tl-tick={i * PPM}
                  data-o={o}
                  className="absolute top-0 block w-px bg-[#141414] will-change-transform"
                  style={{ height: year ? 14 : quarter ? 9 : month ? 6 : 3, opacity: o, transform: "translate(-50%, -50%)" }}
                />
                {year && (
                  <span className="absolute top-4 -translate-x-1/2 text-[10px] text-black/35 tabular-nums">
                    {START.year + i / 12}
                  </span>
                )}
              </span>
            );
          })}
          {/* (under the ruler, clear of the pictures, on two rows in turn so chapters close together don't collide) */}
          {CHAPTERS.map((c, i) => (
            <span
              key={c.place}
              data-tl-mark
              className={`absolute ${i % 2 ? "top-12" : "top-8"} -translate-x-1/2 text-[11px] whitespace-nowrap text-black/35 transition-[color,opacity] duration-500 data-[on=true]:text-[#141414]`}
              style={{ left: c.at * PPM }}
            >
              {c.asDesign ? (
                <>
                  <span className="group-data-[journey=design]/about:hidden">{c.mark}</span>
                  <span className="hidden group-data-[journey=design]/about:inline">{c.asDesign.mark}</span>
                </>
              ) : (
                c.mark
              )}
            </span>
          ))}
        </div>
      </div>

      {/* the pictures and films: one unbroken filmstrip on the ruler, magnified under the needle (placed by
          HorizontalPage). j is the chapter a picture belongs to; 0, one between chapters */}
      <div data-ab-fade aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[
          ...CHAPTERS.flatMap((c, i) => (MEDIA[c.place] ?? []).map((m, k) => ({ m, j: i + 1, k, key: `${c.place}-${k}` }))),
          ...FILLERS.map((m, k) => ({ m, j: 0, k, key: `fill-${k}` })),
        ].map(({ m, j, k, key }) => (
            <div
              key={key}
              data-tl-media
              data-j={j}
              data-k={k}
              data-ratio={m.ratio}
              className="invisible absolute top-0 left-0 origin-bottom-left overflow-hidden bg-[#ecebe7] will-change-transform"
            >
              {m.video ? (
                <video src={m.src} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- placed and scaled by hand, frame by frame
                <img src={m.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
          ))}
      </div>

      {/* the needle, dead centre, over everything: drawn by difference, so it's dark on white and light on a
          dark picture, never lost; and its head, with the month it's reading on a tag */}
      <span data-ab-fade aria-hidden="true" className="pointer-events-none absolute top-[clamp(170px,22svh,220px)] bottom-[clamp(150px,19svh,190px)] left-(--mid) z-30 w-px -translate-x-1/2 bg-white mix-blend-difference" />
      <div data-ab-fade aria-hidden="true" className="pointer-events-none absolute top-[clamp(170px,22svh,220px)] left-(--mid) z-30 w-px -translate-x-1/2">
        <span className="absolute -top-px left-1/2 -translate-x-1/2 border-x-[4px] border-t-[6px] border-x-transparent border-t-[#141414]" />
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-[#141414] px-2 py-1 text-[11px] leading-none font-medium tracking-[0.04em] whitespace-nowrap text-white uppercase tabular-nums">
          <span data-tl-time>Jan 2022</span>
        </span>
      </div>

      {/* the told: under the ruler, when and where to the left of the needle, the story to the right. One set
          per chapter (and the prologue first), stacked, the one at the needle showing */}
      <div className="absolute inset-x-6 top-[calc(54%+84px)] grid sm:inset-x-10 md:right-auto md:left-0 md:w-[calc(var(--mid)*2)]">
        <div data-tl-say={0} className="col-start-1 row-start-1 grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-16">
          <div className="md:text-right">
            <Line className="font-(family-name:--font-serif-display) text-[clamp(30px,3vw,52px)] leading-[0.95] tracking-[-0.01em] uppercase">
              How I learned to see.
            </Line>
          </div>
          <div className="max-w-[34em]">
            <Said
              className="text-[clamp(16px,1.3vw,20px)] leading-[1.45] text-black/70"
              text="Four years, four ways of looking at a brand. Scroll, and I'll tell you how I got here."
            />
          </div>
        </div>
        {CHAPTERS.slice(0, -1).map((c, i) => (
          <div
            key={c.place}
            data-tl-say={i + 1}
            className="invisible col-start-1 row-start-1 grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-16"
          >
            <div className="md:text-right">
              <Line className="text-[clamp(22px,1.9vw,30px)] font-medium tracking-[-0.02em] tabular-nums">
                {c.when ?? longLabel(c.at)}
                {c.until && <span className="font-normal text-black/35"> – {c.until}</span>}
              </Line>
              <Line className={`mt-1 ${kicker}`}>{c.place}</Line>
            </div>
            <div className="max-w-[34em]">
              {/* told one way in the whole journey, and its design side in the design journey */}
              {[
                { variant: "whole", head: c.head, sub: c.sub, show: c.asDesign ? "group-data-[journey=design]/about:hidden" : "" },
                ...(c.asDesign ? [{ variant: "design", ...c.asDesign, show: "hidden group-data-[journey=design]/about:block" }] : []),
              ].map((v) => (
                <div key={v.variant} data-variant={c.asDesign ? v.variant : undefined} className={v.show}>
                  <Said className="text-[clamp(24px,2.3vw,38px)] leading-[1.12] font-medium tracking-[-0.02em] text-balance" text={v.head} />
                  <Said className="mt-4 text-[clamp(16px,1.3vw,20px)] leading-[1.45] text-black/60" text={v.sub} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* the last chapter, Today: the whole story run out to the left of the needle, its date under the ruler
          to the left as every chapter's is, and the rest told across the right half; scrolling on, this half
          carries on as the first half of the work */}
      <div data-tl-say={CHAPTERS.length} className="pointer-events-none invisible absolute inset-0 z-30">
        <div data-ab-fade className="absolute top-[calc(54%+84px)] right-[calc(100%-var(--mid)+32px)] text-right">
          <Line className="text-[clamp(22px,1.9vw,30px)] font-medium tracking-[-0.02em] tabular-nums">{longLabel(TODAY.at)}</Line>
          <Line className={`mt-1 ${kicker}`}>{TODAY.place}</Line>
        </div>
        {/* (with air around it: well clear of the needle and the edge, a narrow measure, quiet sizes) */}
        <div data-tl-today className="pointer-events-auto absolute top-[31%] right-6 left-[calc(var(--mid)+48px)] will-change-transform sm:right-10 md:right-[9vw] md:left-[calc(var(--mid)+7vw)]">
          <Said className="max-w-[12em] font-(family-name:--font-serif-display) text-[clamp(32px,3.1vw,54px)] leading-[1.02] tracking-[-0.015em] text-balance" text={TODAY.head} masked />
          <Said className="mt-6 max-w-[24em] text-[clamp(15px,1.15vw,18px)] leading-[1.55] text-black/55" text={TODAY.sub} />
          <Line className="mt-14 text-[14px]">
            <CollaborateLink to="work" className="underline decoration-black/30 underline-offset-4 transition-colors hover:decoration-black">
              Check my work
            </CollaborateLink>
          </Line>
        </div>
      </div>

      {/* the work, coming up in the right half once the story's told */}
      <Work />

      {/* the corner: the company's logo (or its name), changing with the chapter */}
      <div data-ab-fade className="absolute bottom-10 left-6 grid h-10 items-end sm:left-10">
        {CHAPTERS.map((c, i) => (
          <div key={c.place} data-tl-logo={i} className="col-start-1 row-start-1 opacity-0 will-change-[opacity,transform]">
            {c.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- a logo, sized by its own height
              <img src={c.logo.src} alt={c.place} className="w-auto max-w-[180px] object-contain object-left" style={{ height: `${c.logo.h * 18}px` }} />
            ) : (
              <span className="text-[18px] font-semibold tracking-[-0.03em] whitespace-nowrap">{c.place}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
