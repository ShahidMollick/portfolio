"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRELOADER_DONE } from "./preloader/Preloader";
import { Arrow } from "./Icon";
import LogoMarquee from "./LogoMarquee";
import LatestNote from "./LatestNote";
import { VENTURES } from "./Ventures";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// How much scrolling the hero's own sequence takes before the page starts travelling sideways (room enough
// for each of its steps to happen on its own, one after the other).
export const heroHold = () => window.innerHeight * 2;

// The intro's window, as clip-path insets in % (top, right, bottom, left): a box framing the eyes.
const BOX = { t: 36, r: 13, b: 33, l: 13 };

// The eyes in the footage, as fractions of the frame: the band they sit in (a little wider than the eyes,
// so neither is clipped), and its centre.
const EYE_BAND = { w: 0.8, h: 0.31, x: 0.5, y: 0.515 };

// What I design, rotating in the statement. (It ends its line, so a shorter word never leaves a gap; and
// kept short, so the line fits the screen.)
const SERVICES = ["brand identities", "websites", "digital products", "UI/UX experiences", "pitch decks", "launch campaigns"];

// Where, in the hero's scroll sequence, the statement's words have all risen (the rotating word starts then).
const WORDS_UP = 0.6 + 0.24 + 0.045 * 4;

// The loop's eyes are closed at this point and open over the next second, so playback starts here
// as the window opens: the performer opens their eyes as the page does.
const EYES_OPEN_FROM = 2.9;

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // Size the bottom statement so it fills exactly the width inside the margins, whatever the screen
  // (and again once the serif has loaded, since its width depends on it).
  useEffect(() => {
    const line = root.current?.querySelector<HTMLElement>(".hero-fit");
    if (!line) return;
    const fit = () => {
      const room = root.current!.querySelector<HTMLElement>(".hero-fit-box")!.clientWidth;
      line.style.fontSize = "100px";
      line.style.fontSize = `${(100 * room) / line.getBoundingClientRect().width}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.current!.querySelector("video")?.pause(); // hold on the poster frame
        return;
      }

      const section = root.current!;
      const video = section.querySelector("video")!;
      const frame = section.querySelector<HTMLElement>(".hero-frame")!;
      const zoom = section.querySelector<HTMLElement>(".hero-zoom")!;
      const slot = section.querySelector<HTMLElement>(".hero-slot")!;
      const navItems = document.querySelectorAll("[data-nav-item]");
      const navMark = document.querySelector("[data-nav-mark]");
      const afterPreloader = !window.__preloaderDone;

      // Intro, straight out of the preloader's white: the footage swipes in from the left across a box
      // framing the eyes, then the box expands into the full hero as the type and nav arrive. Tweened as
      // plain numbers and drawn each frame: `box` is the window, `fill` how far across it the footage is.
      let introDone = false;
      const box = { ...BOX };
      const fill = { p: 0 };
      const drawIntro = () => {
        const right = box.r + (100 - box.l - box.r) * (1 - fill.p);
        frame.style.clipPath = `inset(${box.t}% ${right}% ${box.b}% ${box.l}%)`;
      };
      drawIntro();
      gsap.set(".hero-image", { scale: 1.18 });
      gsap.set(".hero-title-line", { yPercent: 110 });
      gsap.set(navItems, { autoAlpha: 0 });
      if (navMark && afterPreloader) gsap.set(navMark, { autoAlpha: 0 });
      if (afterPreloader) {
        video.pause();
        video.currentTime = EYES_OPEN_FROM;
      }

      const intro = gsap
        .timeline({ paused: true, onComplete: () => { introDone = true; drawShrink(); } })
        .add(() => { video.play().catch(() => {}); })
        .to(fill, { p: 1, duration: 0.9, ease: "power3.inOut", onUpdate: drawIntro })
        .to(box, { t: 0, r: 0, b: 0, l: 0, duration: 1.3, ease: "expo.inOut", onUpdate: drawIntro }, "+=0.25")
        .add(() => { frame.style.clipPath = "none"; })
        .to(".hero-image", { scale: 1, duration: 2.6, ease: "power3.out" }, 0.2)
        .to(".hero-title-line", { yPercent: 0, duration: 1.2, ease: "power4.out", stagger: 0.09 }, 2.0)
        .to([navMark, ...navItems].filter(Boolean), { autoAlpha: 1, duration: 0.8, ease: "power2.out", stagger: 0.05 }, "<0.3");
      const start = () => intro.play();
      if (!afterPreloader) start();
      else window.addEventListener(PRELOADER_DONE, start, { once: true });

      // Scroll: the hero pins and the full-screen gaze shrinks into the gap inside the statement, so the eyes
      // end up set in the line like a word: "Different [eyes] faces. One way of seeing." The window and the
      // footage are drawn from one progress value, measured against the gap's place on screen.
      const shrink = { p: 0 };
      let to = { t: 0, r: 0, b: 0, l: 0, s: 1, x: 0, y: 0 };
      const measure = () => {
        const sec = section.getBoundingClientRect(), r = slot.getBoundingClientRect();
        const vw = sec.width, vh = sec.height;
        const left = r.left - sec.left, top = r.top - sec.top;
        // the eye band, from the footage's own (untransformed) box: on tall screens it reaches past the
        // edges, which is why the whole frame is kept rather than cropped to the screen
        const band = {
          w: EYE_BAND.w * video.offsetWidth,
          h: EYE_BAND.h * video.offsetHeight,
          // (offsetLeft/Top are its centre: it's placed at 50% and pulled back by half its size)
          x: video.offsetLeft + (EYE_BAND.x - 0.5) * video.offsetWidth,
          y: video.offsetTop + (EYE_BAND.y - 0.5) * video.offsetHeight,
        };
        // scale the footage so its eye band covers the gap, centred on it
        const s = Math.max(r.width / band.w, r.height / band.h);
        to = {
          t: (top / vh) * 100,
          r: ((vw - left - r.width) / vw) * 100,
          b: ((vh - top - r.height) / vh) * 100,
          l: (left / vw) * 100,
          s,
          x: left + r.width / 2 - band.x,
          y: top + r.height / 2 - band.y,
        };
        gsap.set(zoom, { transformOrigin: `${band.x}px ${band.y}px` });
      };
      const drawShrink = () => {
        if (!introDone) return; // the intro owns the window until it has played
        const p = shrink.p;
        // measure the gap afresh as it moves in, so the window lands on it whatever the font has done since
        if (p > 0) measure();
        frame.style.clipPath = p ? `inset(${to.t * p}% ${to.r * p}% ${to.b * p}% ${to.l * p}%)` : "none";
        gsap.set(zoom, { scale: 1 + (to.s - 1) * p, x: to.x * p, y: to.y * p });
      };

      // The word rotates: each slides up out of its line as the next rises in from below.
      // It only runs once the line has risen (see the hero's onUpdate): while the line is still below its mask,
      // a word leaving upwards would cross the mask's window, over the footage.
      const rotate = gsap.timeline({ repeat: -1, paused: true });
      ["b"].forEach((name, r) => {
        const words = gsap.utils.toArray<HTMLElement>(`.hero-rotor-${name} .hero-lens`, section);
        // (the markup's own offset is read as px; clear it so only yPercent moves them)
        gsap.set(words, { y: 0, yPercent: 0 });
        gsap.set(words.slice(1), { yPercent: 110 });
        words.forEach((w, i) => {
          const next = words[(i + 1) % words.length], at = i * 2.6 + 1.8 + r * 0.18;
          rotate
            .to(w, { yPercent: -110, duration: 0.7, ease: "power3.inOut" }, at)
            // (not applied up front: the first word's own entry here would otherwise hide it from the start)
            .fromTo(next, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power3.inOut", immediateRender: false }, at);
        });
      });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            // the page holds still (pinned by the horizontal page around this) while this plays, then
            // the whole track starts moving sideways
            id: "hero",
            trigger: section.closest("[data-track-root]") ?? section,
            start: "top top",
            end: () => `+=${heroHold()}`,
            scrub: 1,
            onRefresh: () => { measure(); drawShrink(); },
          },
          // rotate only while the line is up (the scrubbed playhead, not the scroll, so the lag can't outrun
          // it); back to its first word whenever the line drops below the mask again
          onUpdate() {
            const up = this.time() >= WORDS_UP;
            if (up && rotate.paused()) rotate.play();
            else if (!up && !rotate.paused()) rotate.pause(0);
          },
        })
        // One thing at a time, each starting as the last settles, so the eye always has one place to be (and
        // scrolling back plays it all in reverse, back to the full gaze):
        // 1. the line sinks back into its masks, the way it rose, the small lead-in first; the shade lifts
        .fromTo(".hero-title-out", { yPercent: 0 }, { yPercent: 110, duration: 0.14, ease: "power2.in", stagger: 0.03 }, 0)
        .fromTo(".hero-shade", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2 }, 0)
        // 2. with the screen clear, the gaze draws in to its place in the statement, slowly and evenly
        .fromTo(shrink, { p: 0 }, { p: 1, duration: 0.6, ease: "power3.inOut", onUpdate: drawShrink }, 0.12)
        // 3. as it settles, the words rise around it in reading order
        .fromTo(".hero-word", { yPercent: 110 }, { yPercent: 0, duration: 0.24, ease: "power3.out", stagger: 0.045 }, 0.6)
        // 4. and then what's around them: the label and ventures, the subline, the bottom row
        .fromTo(".hero-meta", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out", stagger: 0.07 }, WORDS_UP - 0.08)
        .to({}, { duration: 0.3 }); // a beat on the finished page before it moves on

      // the bottom corners step aside as soon as the page starts moving on: they belong to this screen
      gsap.fromTo(".hero-corner", { autoAlpha: 1, y: 0 }, {
        autoAlpha: 0,
        y: 24,
        ease: "power1.in",
        immediateRender: false,
        // absolute scroll positions: the first stretch of the sideways travel, which starts as the hero's ends
        scrollTrigger: { start: () => heroHold(), end: () => heroHold() + window.innerWidth * 0.12, scrub: true },
      });

      // the gap's place depends on the serif, so measure again once it has loaded
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => window.removeEventListener(PRELOADER_DONE, start);
    },
    { scope: root },
  );

  // a rotating word: every option sits in the same cell (so the line keeps the widest one's width), all but
  // the first starting below the mask so they stay hidden if the rotation doesn't run
  // (in the sans, each word underlined, so the underline travels with it and always fits it; the mask
  // leaves room below for the underline)
  const rotor = (name: string, options: string[]) => (
    <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.18em] align-bottom">
      <span className="hero-word inline-block">
        <span className={`hero-rotor-${name} inline-grid font-(family-name:--font-inter-tight) font-medium tracking-[-0.045em]`}>
          {options.map((o, i) => (
            <span
              key={o}
              className="hero-lens col-start-1 row-start-1 justify-self-start underline decoration-[0.045em] underline-offset-[0.12em]"
              aria-hidden={i !== 0}
              style={i ? { transform: "translateY(110%)" } : undefined}
            >
              {o}
            </span>
          ))}
        </span>
      </span>
    </span>
  );

  const word = (text: string) => (
    <span className="inline-block overflow-hidden pb-[0.04em] align-bottom">
      <span className="hero-word inline-block">{text}</span>
    </span>
  );

  return (
    <section ref={root} id="index" className="relative h-full w-screen shrink-0 overflow-hidden font-(family-name:--font-inter-tight) text-[#141414]">
      {/* the gaze, full-bleed */}
      <div className="hero-frame absolute inset-0 overflow-hidden bg-[#1a0d06]" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
        <div className="hero-zoom absolute inset-0">
          <video
            // sized to cover the screen but kept whole (not cropped by object-fit), so on tall screens both
            // eyes still exist off to the sides for the shrink to bring in
            className="hero-image absolute top-1/2 left-1/2 aspect-[1364/768] w-[max(100vw,calc(100svh*1364/768))] max-w-none -translate-x-1/2 -translate-y-1/2"
            poster="/hero/eyes.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Close-up of a performer's eyes framed by ritual face paint, silver ornaments and marigolds, blinking slowly"
          >
            {/* AV1 where supported (same look at well under the size), H.264 everywhere else */}
            <source src="/hero/eyes-av1.mp4" type='video/mp4; codecs="av01.0.08M.10"' />
            <source src="/hero/eyes.mp4" type="video/mp4" />
          </video>
        </div>
        {/* black fades at the top (under the navbar) and bottom (under the line) */}
        <div className="hero-shade pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7),rgba(0,0,0,0.25)_14%,transparent_28%,transparent_58%,rgba(0,0,0,0.35)_76%,rgba(0,0,0,0.85))]" />

        {/* along the bottom: "I design experiences that", small, over the statement in serif capitals, filling the width exactly */}
        <div className="hero-bottom absolute inset-x-0 bottom-0 flex items-end gap-6 px-6 pb-6 text-white sm:gap-10 sm:px-10 sm:pb-8">
          <h1 className="hero-fit-box min-w-0 flex-1 font-(family-name:--font-serif-display) leading-[0.9] tracking-[-0.01em] whitespace-nowrap uppercase">
            {/* a small lead-in over its left edge, in the sans, read into the line under it */}
            <span className="mb-[clamp(10px,1.2vw,20px)] block overflow-hidden font-(family-name:--font-inter-tight) text-[clamp(13px,1.05vw,18px)] leading-none font-medium tracking-[0.04em]">
              <span className="hero-title-out inline-block">
                <span className="hero-title-line inline-block">I design experiences that</span>
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.04em]">
              <span className="hero-title-out inline-block">
                <span className="hero-title-line hero-fit inline-block">Hold the gaze</span>
              </span>
            </span>
          </h1>
        </div>
      </div>

      {/* The statement the gaze shrinks into, set as an editorial page on the 12-column grid: a section label,
          the line flush left with its second half stepped in three columns, and an information row along the
          bottom. The eyes land in the gap, set in the line like a word. */}
      <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-12 grid-rows-[auto_1fr_auto] gap-x-4 px-6 pt-32 pb-32 sm:gap-x-6 sm:px-10 md:pt-36 md:pb-10">
        <div className="hero-meta relative col-span-12">
          <p className="text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">(02) What I do</p>
          {/* the companies I've started, in the opposite corner (pinned there, so the line below keeps its
              place): name and a few words, each to its site */}
          <div className="pointer-events-auto absolute top-0 right-0 hidden w-[clamp(300px,26vw,440px)] md:block">
            <p className="flex justify-between border-b border-black/80 pb-2 text-[11px] font-medium tracking-[0.02em] uppercase">
              <span>My ventures</span>
              <span className="text-black/40 tabular-nums">0{VENTURES.length}</span>
            </p>
            <ul>
              {VENTURES.map(({ name, short, status, href }, i) => {
                const row = (
                  <>
                    <span className="w-6 shrink-0 text-[11px] text-black/35 tabular-nums">0{i + 1}</span>
                    <span className="w-[5.5em] shrink-0 text-[clamp(16px,1.25vw,20px)] font-medium tracking-[-0.02em] text-[#141414]">
                      {name}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-black/55">{short}</span>
                    <span className="shrink-0 text-[11px] text-black/40">
                      {href ? <Arrow direction="up-right" /> : status}
                    </span>
                  </>
                );
                const cls = "flex items-baseline gap-3 border-b border-black/15 py-2.5";
                return (
                  <li key={name}>
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer" className={`${cls} transition-opacity hover:opacity-60`}>
                        {row}
                      </a>
                    ) : (
                      <span className={cls}>{row}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="col-span-12 self-center">
        <h2 className="font-(family-name:--font-serif-display) text-[clamp(20px,5.2vw,104px)] leading-[1.02] tracking-[-0.02em] uppercase">
          {/* what I design (rotating), and for whom: the eyes sit right before "visionaries" */}
          <span className="block whitespace-nowrap">
            {word("I")} {word("design")} {rotor("b", SERVICES)}
          </span>
          {/* stepped in three of twelve columns, so the two lines lock to the grid, not to each other */}
          <span className="block whitespace-nowrap pl-[calc((100%-11*1.5rem)/12*3+3*1.5rem)]">
            {word("for")}{" "}
            <span className="hero-slot mx-[0.1em] inline-block h-[0.74em] w-[3.3em] align-[-0.02em]" aria-hidden="true" />{" "}
            {word("visionaries.")}
          </span>
        </h2>
        {/* the subline, stepped in with the second line */}
        <p className="hero-meta mt-[clamp(16px,2.2vw,36px)] ml-[calc((100%-11*1.5rem)/12*3+3*1.5rem)] max-w-[34em] font-(family-name:--font-inter-tight) text-pretty text-[clamp(14px,1.25vw,20px)] leading-snug text-black/60">
          I&apos;m a multidisciplinary designer: trained as an engineer, shaped by strategy and product, and
          now a founder. So the work is made for the business, not just the eye.
        </p>
        </div>

        <div className="hero-meta col-span-12 grid grid-cols-12 gap-x-4 text-[12px] leading-snug sm:gap-x-6">
          {/* the bottom corners, either side of the dial and the same width: the brands so far, running
              endlessly, and the newest notes */}
          <div className="hero-corner col-span-12 border-t border-black/15 pt-4 md:col-span-4">
            <p className="text-black/50">Brands so far</p>
            <LogoMarquee className="mt-1 text-[clamp(17px,1.45vw,23px)]" />
          </div>
          {/* the newest notes, taking turns, so the page shows its thinking as well as its work */}
          <LatestNote className="hero-corner pointer-events-auto hidden text-black/50 border-t border-black/15 pt-4 md:col-span-4 md:col-start-9 md:block" />
        </div>
      </div>
    </section>
  );
}
