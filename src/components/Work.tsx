"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollForX } from "@/lib/track";
import { Arrow } from "./Icon";
import { DrawerRig, rigOf } from "./work-motion";

// The work, a project to a drawer: its screens are the cards filed inside, the first a still of its opening
// (its recording, the site in use, when you take that card out), the rest stills from further down the site,
// in public/work. `tint` is the drawer's label and lining, `ink` its keyhole and the chips beside its screens.
// (`href`, when set, adds a link to the live site.)
type Project = {
  name: string;
  kind: string;
  blurb: string;
  what: string;
  tint: string;
  ink: string;
  href?: string;
  site: string;
  screens: { src: string; caption: string }[];
};

const CAPTIONS = ["Opening", "Scrolling on", "Further down", "Toward the end"];
const screens = (slug: string) =>
  [`/work/${slug}.jpg`, `/work/${slug}-2.jpg`, `/work/${slug}-3.jpg`, `/work/${slug}-4.jpg`].map((src, i) => ({ src, caption: CAPTIONS[i] }));

export const PROJECTS: Project[] = [
  {
    name: "Quaintel",
    kind: "Market intelligence",
    blurb: "Tracks what companies do, from expansion and partnerships to patents and hiring, and turns those signals into a clear view of how they compete.",
    what: "Website",
    tint: "#e4e9f6",
    ink: "#2b44d4",
    site: "/work/quaintel.mp4",
    screens: screens("quaintel"),
  },
  {
    name: "Shastra VC",
    kind: "Venture capital",
    blurb: "Backs founders in frontier tech, climate tech and AI at the stage where belief comes before proof.",
    what: "Website",
    tint: "#f4e3e0",
    ink: "#a3171d",
    site: "/work/shastra-vc.mp4",
    screens: screens("shastra-vc"),
  },
  {
    name: "PayNXT360",
    kind: "Fintech research",
    blurb: "Market sizing, forecasts and performance indicators for fintech segments across 50+ countries.",
    what: "Website",
    tint: "#dfe9e2",
    ink: "#1f4d3a",
    site: "/work/paynxt360.mp4",
    screens: screens("paynxt360"),
  },
];

// where the recordings are worth watching from, in seconds (past each site's own loading screen)
export const FILM_FROM = 2.4;

// the last drawer: empty, kept for the next project, with a tag tied to its knob (it goes to Contact)
const YOURS = { name: "Yours, next", kind: "Open", tint: "#f3efe6", ink: "#c8241f" };
const THREAD = "#c8241f";

const pad = (n: number) => String(n).padStart(2, "0");
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The cabinet's thread: everything in it is drawn as embroidery, in running stitch (dashes of thread with
// round ends) with a faint sheen along each stitch, the way twisted cotton catches the light.
const THREAD_INK = "#34302b";
const STITCH = "5 3.6";

// A box's outline, sewn: its four edges each stitched the same way (top to bottom, left to right), so where
// two boxes meet their stitches fall in exactly the same places and read as one seam; a French knot at each
// corner.
function StitchedBox() {
  const edges: [string, string, string, string][] = [
    ["0", "0", "100%", "0"],
    ["0", "0", "0", "100%"],
    ["100%", "0", "100%", "100%"],
    ["0", "100%", "100%", "100%"],
  ];
  const corners: [string, string][] = [["0", "0"], ["100%", "0"], ["0", "100%"], ["100%", "100%"]];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
      {edges.map(([x1, y1, x2, y2], i) => (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={THREAD_INK} strokeOpacity="0.72" strokeWidth="1.5" strokeDasharray={STITCH} strokeLinecap="round" />
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeOpacity="0.45" strokeWidth="0.45" strokeDasharray={STITCH} strokeLinecap="round" />
        </g>
      ))}
      {corners.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.9" fill={THREAD_INK} fillOpacity="0.85" />
      ))}
    </svg>
  );
}

// the drawer's pull: a loop of thread in back stitch, a French knot at each end where it's sewn on
function Pull({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 14" className="absolute top-[56%] left-1/2 w-[10cqw] -translate-x-1/2 overflow-visible" aria-hidden="true">
      <path d="M6 10C10 1.5 30 1.5 34 10" fill="none" stroke={color} strokeWidth="1.3" strokeDasharray="3.2 1.6" strokeLinecap="round" />
      <circle cx="6" cy="10" r="1.9" fill={color} />
      <circle cx="34" cy="10" r="1.9" fill={color} />
    </svg>
  );
}

// a drawer's front, kept quiet: its stitched outline, its number in the corner, the name, the pull
function Front({ name, ink, index, children }: { name: string; ink: string; index: string; children?: React.ReactNode }) {
  return (
    <>
      <StitchedBox />
      <span className="absolute top-[5cqw] left-[5cqw] font-mono text-[1.5cqw] leading-none text-black/35 tabular-nums">{index}</span>
      <span className="absolute top-[33%] left-1/2 -translate-x-1/2 font-(family-name:--font-serif-display) text-[2.7cqw] leading-none tracking-[0.18em] whitespace-nowrap text-black/80 uppercase">
        {name}
      </span>
      <Pull color={ink} />
      {children}
    </>
  );
}

// a card filed in a drawer: a tab with the project and the screen's number, and the screen under it
function Card({ p, k, onPick, onPull }: { p: Project; k: number; onPick?: (k: number) => void; onPull?: (k: number) => void }) {
  const n = p.screens.length;
  const s = p.screens[k];
  const live = !!onPull;
  return (
    <div
      data-dr-card={k}
      role={live ? "button" : undefined}
      tabIndex={live ? 0 : undefined}
      aria-label={live ? `${p.name}, ${s.caption}: take it out` : undefined}
      onPointerEnter={() => onPick?.(k)}
      onPointerLeave={() => onPick?.(-1)}
      onFocus={() => onPick?.(k)}
      onBlur={() => onPick?.(-1)}
      onClick={() => onPull?.(k)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPull?.(k); } }}
      className="absolute top-0 left-0 flex flex-col overflow-hidden rounded-[0.5cqw] border border-black/12 bg-white will-change-transform"
      style={{ zIndex: 10 - k }}
    >
      <span
        className="flex h-[5.2cqw] shrink-0 items-center justify-between px-[2.4cqw] text-[1.6cqw] leading-none font-medium tracking-[0.06em] text-black/60 uppercase"
        style={{ background: `color-mix(in srgb, ${p.tint} ${100 - k * 16}%, white)` }}
      >
        <span>{s.caption}</span>
        <span className="font-mono tabular-nums">{pad(k + 1)} / {pad(n)}</span>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- a still of the site, sized by its card */}
      <img src={s.src} alt="" draggable={false} className="min-h-0 w-full flex-1 object-cover object-top" />
    </div>
  );
}

// the empty drawer's one card: a blank brief
function BriefCard() {
  return (
    <div data-dr-card={0} className="absolute top-0 left-0 flex flex-col overflow-hidden rounded-[0.5cqw] border border-black/12 bg-white">
      <span className="flex h-[5.2cqw] shrink-0 items-center px-[2.4cqw] text-[1.6cqw] leading-none font-medium tracking-[0.06em] text-black/60 uppercase" style={{ background: YOURS.tint }}>
        Brief
      </span>
      <span className="grid flex-1 grid-cols-2 gap-[3cqw] p-[2.6cqw] text-[1.7cqw] text-black/55">
        {["From", "To"].map((l) => (
          <span key={l} className="block">
            {l}
            <span className="mt-[1.4cqw] block h-px w-4/5 bg-black/15" />
            <span className="mt-[1.4cqw] block h-px w-3/5 bg-black/15" />
          </span>
        ))}
      </span>
    </div>
  );
}

// The drawer's box behind its front: the open top, lined in the project's tint and shaded toward the back,
// the cards, then the right side (drawn by DrawerRig). Its front goes last, over all of it.
function Box({ tint, cabinet, children }: { tint: string; cabinet: boolean; children: React.ReactNode }) {
  const id = useId().replace(/[^\w-]/g, "");
  return (
    <>
      <svg data-dr-svg className="pointer-events-none absolute top-0 left-0 overflow-visible opacity-0" aria-hidden="true">
        <defs>
          <linearGradient id={`shade-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.12" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon data-dr-floor fill={tint} stroke={THREAD_INK} strokeOpacity="0.72" strokeWidth="1.5" strokeDasharray={STITCH} strokeLinecap="round" strokeLinejoin="round" />
        <polygon data-dr-shade fill={`url(#shade-${id})`} />
      </svg>
      {/* (in the cabinet, the cards only ever rise up behind the shut front, so their tabs show over it) */}
      <div className={`absolute inset-0 isolate ${cabinet ? "pointer-events-none" : ""}`}>{children}</div>
      <svg data-dr-svg className="pointer-events-none absolute top-0 left-0 overflow-visible opacity-0" aria-hidden="true">
        <polygon data-dr-side fill="#fff" stroke={THREAD_INK} strokeOpacity="0.72" strokeWidth="1.5" strokeDasharray={STITCH} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
}

const frontFace = "absolute inset-0 block bg-white text-left outline-none will-change-transform";

type Opened = { i: number; from: DOMRect; t: number; lifts: number[] };

// Selected work, on About's last screen: once the story's told and its last words have moved over, this comes
// up over the whole screen, the page holding still while you scroll on (driven from HorizontalPage, by the
// data-wk-* hooks; the drawers' motion is in work-motion.ts). A cabinet, a drawer to a project: scrolling
// on leaves them shut; the cursor lifts the files of the one it's over, and a click takes it out
// and opens it, its screens filed inside as cards, with its index card beside it. The last drawer is empty,
// kept for the next one.
export default function Work() {
  const [open, setOpen] = useState<Opened | null>(null);
  const [settling, setSettling] = useState(false); // on its way back in

  const take = (i: number, el: HTMLElement) => {
    setSettling(false);
    const r = rigOf.get(el);
    setOpen({ i, from: el.getBoundingClientRect(), t: r?.t ?? 0, lifts: r?.lifts.map((l) => l.v) ?? [] });
    // the one in the cabinet goes back to shut, so it's flush when this one's put back in its place
    r?.set(0);
    el.dispatchEvent(new Event("drawer:reset"));
  };

  // the empty drawer: on to Contact, along the track
  const toContact = () => {
    const el = document.getElementById("contact");
    if (!el || !ScrollTrigger.getById("track")) return;
    const y = scrollForX(el.offsetLeft);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 2.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const total = PROJECTS.length;

  return (
    <div
      id="work"
      data-wk-steps={3}
      data-open={open ? open.i : undefined}
      aria-label="Selected work"
      className="pointer-events-none invisible absolute inset-0 z-30 overflow-hidden bg-white font-(family-name:--font-inter-tight) text-[#141414] opacity-0"
    >
      {/* a faint dot grid, like a cutting mat */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.075)_1px,transparent_1.3px)] bg-[length:24px_24px] [mask-image:radial-gradient(ellipse_75%_70%_at_50%_50%,#000_45%,transparent_100%)]" />

      <div
        inert={!!open}
        className={`absolute inset-0 transition-[filter,opacity] duration-300 ease-in-out ${open && !settling ? "opacity-35 blur-[6px]" : ""}`}
      >
        <p className="absolute top-32 right-6 left-6 flex justify-between text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase sm:right-10 sm:left-10 md:top-36">
          <span>(04) Selected work</span>
          <span className="tabular-nums">{pad(total)} projects · open a drawer</span>
        </p>

        <div className="absolute inset-x-6 top-44 bottom-36 flex flex-col items-center justify-center sm:inset-x-10 md:top-48">
          {/* the cabinet: just its four drawers, side by side, sewn */}
          <div className="w-[min(84vw,calc((100svh-380px)/2))] sm:w-[min(1000px,84vw,calc((100svh-400px)*2))]">
            <div className="relative grid grid-cols-1 sm:grid-cols-2">
              {PROJECTS.map((p, i) => (
                <div key={p.name} data-wk-drawer={i} className={`@container relative aspect-[2/1] ${open?.i === i ? "invisible" : ""}`}>
                  <Box tint={p.tint} cabinet>
                    {p.screens.map((_, k) => <Card key={k} p={p} k={k} />)}
                  </Box>
                  <button
                    type="button"
                    data-dr-front
                    onClick={(e) => take(i, e.currentTarget.parentElement!)}
                    aria-label={`Open ${p.name}`}
                    className={`${frontFace} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]`}
                  >
                    <Front name={p.name} ink={p.ink} index={`${pad(i + 1)}/${pad(total)}`} />
                  </button>
                </div>
              ))}
              {/* the empty drawer */}
              <div data-wk-drawer={total} className="@container relative aspect-[2/1]">
                <Box tint={YOURS.tint} cabinet>
                  <BriefCard />
                </Box>
                <button
                  type="button"
                  data-dr-front
                  onClick={toContact}
                  aria-label="Your project next: get in touch"
                  className={`${frontFace} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]`}
                >
                  <Front name={YOURS.name} ink={YOURS.ink} index="—">
                    {/* a red thread tied to the pull's knot, and a tag on it */}
                    <svg viewBox="0 0 60 50" className="absolute top-[calc(56%+2.5cqw)] left-[calc(50%+3.5cqw)] w-[13cqw] overflow-visible" aria-hidden="true">
                      <path d="M0 0C9 6 7 20 15 26S30 28 34 34" fill="none" stroke={THREAD} strokeWidth="1" strokeLinecap="round" />
                      <g transform="rotate(-10 34 34)">
                        <rect x="32" y="30" width="26" height="13" rx="1.5" fill="#fff" stroke="rgba(20,20,20,0.35)" strokeWidth="0.7" />
                        <circle cx="35.5" cy="36.5" r="1.2" fill="none" stroke={THREAD} strokeWidth="0.7" />
                        <text x="46" y="38.6" textAnchor="middle" fontSize="5.4" fill="rgba(20,20,20,0.7)" letterSpacing="0.2">Say hi</text>
                      </g>
                    </svg>
                  </Front>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <Focus
          key={open.i}
          opened={open}
          onSettling={() => setSettling(true)}
          onClosed={() => { setOpen(null); setSettling(false); }}
        />
      )}
    </div>
  );
}

// The drawer, taken out: it flies from its place in the cabinet to the right, pulled all the way open, its
// cards standing up out of it; its index card comes up on the left. A card (or its line on the index card)
// lifts when you point at it, and comes out to be looked at when clicked. "Put it back", Escape or a click
// outside returns the drawer to the cabinet.
function Focus({ opened, onSettling, onClosed }: { opened: Opened; onSettling: () => void; onClosed: () => void }) {
  const p = PROJECTS[opened.i];
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const rig = useRef<DrawerRig | null>(null);
  const closing = useRef(false);
  const putBack = useRef<(() => void) | null>(null);
  const [pulled, setPulled] = useState<number | null>(null);

  const pick = (k: number) => {
    rig.current?.pick(k, reduced());
  };

  useLayoutEffect(() => {
    const el = box.current!;
    const reduce = reduced();
    const d = (s: number) => (reduce ? 0 : s);
    const r = new DrawerRig(el);
    rig.current = r;
    // from just as it was in the cabinet; then, while it flies over, it slides all the way out, and once
    // it's open its cards lift up out of it one by one, from the back, each easing to a stop
    r.set(opened.t, opened.lifts);
    r.pull(1, d(0.5), "power3.inOut", d(0.12));
    r.raise((i) => 0.2 + 0.05 * i, { duration: d(0.45), ease: "power3.inOut", stagger: d(0.045), delay: d(0.5), backFirst: true });

    const to = el.getBoundingClientRect();
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.from(el, {
          x: opened.from.left - to.left,
          y: opened.from.top - to.top,
          scale: opened.from.width / to.width,
          transformOrigin: "0 0",
          duration: 0.6,
          ease: "power3.inOut",
        });
      }
      gsap.from("[data-fx]", { autoAlpha: 0, y: reduce ? 0 : 16, duration: reduce ? 0.01 : 0.4, ease: "power2.inOut", stagger: 0.025, delay: reduce ? 0 : 0.2 });
    }, root);

    window.__lenis?.stop();
    root.current?.querySelector<HTMLElement>("[data-fx-close]")?.focus({ preventScroll: true });

    return () => {
      ctx.revert();
      r.destroy();
      window.__lenis?.start();
    };
  }, [opened]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const el = box.current!, r = rig.current!;
    const reduce = reduced();
    const home = document.querySelector<HTMLElement>(`[data-wk-drawer="${opened.i}"]`)!.getBoundingClientRect();
    const now = el.getBoundingClientRect();
    onSettling();
    // the reverse: the cards sink back in, front first, the drawer slides shut, and it flies home
    const d = (s: number) => (reduce ? 0 : s);
    r.pick(-1, reduce);
    r.raise(() => 0, { duration: d(0.3), ease: "power2.inOut", stagger: d(0.03) });
    r.pull(0, d(0.4), "power3.inOut", d(0.18));
    gsap.to(root.current!.querySelectorAll("[data-fx]"), { autoAlpha: 0, duration: reduce ? 0.01 : 0.2, ease: "power2.inOut" });
    // (from where it is now, which includes any transform still on it)
    const x = Number(gsap.getProperty(el, "x")), y = Number(gsap.getProperty(el, "y")), s = Number(gsap.getProperty(el, "scale"));
    gsap.to(el, {
      x: x + home.left - now.left,
      y: y + home.top - now.top,
      scale: s * (home.width / now.width),
      transformOrigin: "0 0",
      duration: reduce ? 0.01 : 0.55,
      ease: "power3.inOut",
      delay: reduce ? 0 : 0.25,
      onComplete: onClosed,
    });
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (putBack.current) putBack.current();
      else close();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const n = p.screens.length;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${p.name}, opened`}
      className="absolute inset-0 z-20"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="pointer-events-none absolute inset-x-6 top-28 bottom-28 grid grid-rows-[auto_minmax(0,1fr)] items-center gap-10 sm:inset-x-10 md:top-32 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1 md:gap-[5vw]"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        {/* the index card */}
        <div
          data-lenis-prevent
          className="pointer-events-auto order-2 max-h-full self-stretch overflow-y-auto border border-dashed border-black/25 bg-white px-6 py-7 md:order-1 md:self-center md:px-9 md:py-9"
        >
          <p data-fx className="flex items-baseline justify-between text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">
            <span className="tabular-nums">Drawer {pad(opened.i + 1)} / {pad(PROJECTS.length)}</span>
            <span>{p.kind}</span>
          </p>
          <div data-fx className="mt-3 h-px bg-black/15" />
          <h3 data-fx className="mt-6 font-(family-name:--font-serif-display) text-[clamp(34px,3.2vw,56px)] leading-[0.95] tracking-[-0.01em] uppercase">
            {p.name}
          </h3>
          <p data-fx className="mt-4 max-w-[30em] text-[15px] leading-[1.55] text-black/60">{p.blurb}</p>
          <dl data-fx className="mt-6 grid grid-cols-3 gap-4 border-t border-black/10 pt-4 text-[12px]">
            {[["What", p.what], ["Sector", p.kind], ["Screens", pad(n)]].map(([k, v]) => (
              <div key={k}>
                <dt className="text-black/45">{k}</dt>
                <dd className="mt-1 tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-6">
            {p.screens.map((s, k) => (
              <li data-fx key={s.src}>
                <button
                  type="button"
                  onPointerEnter={() => pick(k)}
                  onPointerLeave={() => pick(-1)}
                  onFocus={() => pick(k)}
                  onBlur={() => pick(-1)}
                  onClick={() => setPulled(k)}
                  className="group flex w-full items-center gap-4 border-t border-black/10 py-3.5 text-left"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/30 font-mono text-[10px] text-black/60 tabular-nums">{pad(k + 1)}</span>
                  <span className="flex-1 text-[17px] tracking-[-0.01em]">{s.caption}</span>
                  <span className="rounded-[3px] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] uppercase" style={{ background: p.tint, color: p.ink }}>
                    • {k === 0 ? "Film" : "Still"}
                  </span>
                  <Arrow direction="up-right" className="text-black/35 transition-colors group-hover:text-black" />
                </button>
              </li>
            ))}
          </ul>
          {p.href && (
            <a data-fx href={p.href} target="_blank" rel="noreferrer" className="mt-6 inline-block border-b border-current pb-0.5 text-[14px] transition-opacity hover:opacity-60">
              Visit the site <Arrow direction="up-right" />
            </a>
          )}
        </div>

        {/* the drawer, out of the cabinet */}
        <div className="order-1 flex items-center justify-center pt-[17vw] pb-[14vw] pl-[8vw] md:order-2 md:p-0">
          <div
            ref={box}
            className="@container pointer-events-auto relative aspect-[2/1] w-[min(72vw,max(200px,calc((100svh-560px)*2)))] will-change-transform md:w-[min(100%,calc(100svh-300px))]"
          >
            <Box tint={p.tint} cabinet={false}>
              {p.screens.map((_, k) => <Card key={k} p={p} k={k} onPick={pick} onPull={setPulled} />)}
            </Box>
            <div data-dr-front className={frontFace}>
              <Front name={p.name} ink={p.ink} index={`${pad(opened.i + 1)}/${pad(PROJECTS.length)}`} />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        data-fx
        data-fx-close
        onClick={close}
        className="absolute right-6 bottom-10 rounded-full bg-[#f1f0ec] sm:right-10 px-6 py-3 text-[14px] text-black/70 transition-colors hover:bg-[#141414] hover:text-white"
      >
        Put it back <span className="ml-2 font-mono text-[10px] tracking-[0.06em] uppercase opacity-50">Esc</span>
      </button>

      {pulled !== null && <Pulled p={p} k={pulled} putBackRef={putBack} onBack={setPulled} />}
    </div>
  );
}

// A card taken out of the drawer, held up to look at: the screen whole, or for the first, the site in use.
// A click anywhere (or Escape) files it back.
function Pulled({ p, k, putBackRef, onBack }: { p: Project; k: number; putBackRef: React.RefObject<(() => void) | null>; onBack: (k: null) => void }) {
  const veil = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const s = p.screens[k];

  useLayoutEffect(() => {
    const reduce = reduced();
    const card = document.querySelector<HTMLElement>(`[role=dialog] [data-dr-card="${k}"]`);
    const flip = () => {
      if (!card) return { x: 0, y: 0, scale: 1 };
      const a = card.getBoundingClientRect(), b = big.current!.getBoundingClientRect();
      return { x: a.left - b.left, y: a.top - b.top, scale: a.width / b.width };
    };
    const from = flip();
    if (card) card.style.visibility = "hidden";
    const ctx = gsap.context(() => {
      gsap.fromTo(veil.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0.01 : 0.3, ease: "power2.inOut" });
      if (!reduce) gsap.from(big.current, { ...from, transformOrigin: "0 0", duration: 0.5, ease: "power3.inOut" });
    });

    let going = false;
    putBackRef.current = () => {
      if (going) return;
      going = true;
      gsap.to(veil.current, { autoAlpha: 0, duration: reduce ? 0.01 : 0.35, ease: "power2.inOut" });
      gsap.to(big.current, {
        ...(reduce ? {} : flip()),
        transformOrigin: "0 0",
        duration: reduce ? 0.01 : 0.45,
        ease: "power3.inOut",
        onComplete: () => {
          if (card) card.style.visibility = "";
          putBackRef.current = null;
          onBack(null);
        },
      });
    };
    return () => {
      ctx.revert();
      if (card) card.style.visibility = "";
      putBackRef.current = null;
    };
  }, [k, putBackRef, onBack]);

  return (
    <div className="absolute inset-0 z-30" onClick={() => putBackRef.current?.()}>
      <div ref={veil} className="absolute inset-0 bg-white/75 backdrop-blur-[3px]" />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6">
        <p className="mb-5 text-[11px] font-medium tracking-[0.02em] text-black/45 uppercase">Click anywhere to file it back</p>
        <div
          ref={big}
          className="@container flex w-[min(84vw,calc((100svh-330px)*1.6))] flex-col overflow-hidden rounded-[0.5cqw] border border-black/12 bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.35)] will-change-transform"
        >
          <span
            className="flex h-[3.4cqw] shrink-0 items-center justify-between px-[1.6cqw] text-[1.05cqw] leading-none font-medium tracking-[0.06em] text-black/60 uppercase"
            style={{ background: p.tint }}
          >
            <span>{p.name} · {s.caption}</span>
            <span className="font-mono tabular-nums">{pad(k + 1)} / {pad(p.screens.length)}</span>
          </span>
          {k === 0 ? (
            <video
              className="aspect-[16/10] w-full object-cover object-top"
              src={`${p.site}#t=${FILM_FROM}`}
              poster={s.src}
              autoPlay
              muted
              playsInline
              onEnded={(e) => {
                e.currentTarget.currentTime = FILM_FROM;
                e.currentTarget.play().catch(() => {});
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- the still, whole
            <img src={s.src} alt={`${p.name}: ${s.caption}`} className="aspect-[16/10] w-full object-cover object-top" />
          )}
        </div>
      </div>
    </div>
  );
}
