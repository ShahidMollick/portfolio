"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollForX, setDetents, setTrackHold, totalHold, trackAt } from "@/lib/track";
import About from "./About";
import Contact from "./Contact";
import Hero, { heroHold } from "./Hero";
import { PER, workMotion } from "./work-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The whole page as one horizontal track: every section sits side by side, the page pins, and scrolling
// down carries the track sideways. The hero plays its own sequence first (the eyes settling into the line)
// while the track holds still; then the track moves, stopping once more at About, where scrolling runs its
// story past a needle instead before the page carries on. Everything on the panels is timed to that movement
// (in page scroll, through lib/track, so the stop is allowed for).
export default function HorizontalPage() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const page = root.current!;
      const track = page.querySelector<HTMLElement>(".page-track")!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const distance = () => track.scrollWidth - window.innerWidth;

      // About, and the stop it gets: once About fills the screen, the track holds while scrolling runs its
      // ruler past the needle, straight from the scroll. Every chapter gets the same scroll, so one flick is
      // one chapter: the needle rests on each chapter's month at the middle of its stretch, and the ruler runs
      // evenly from one to the next. A chapter is told as it arrives, quickly, word by word, and fades as the
      // next comes near. (Wherever the scroll stops, the page stays: no gliding on to a chapter by itself.)
      const about = page.querySelector<HTMLElement>("#about")!;
      const work = page.querySelector<HTMLElement>("#work");
      const drawWork = work ? workMotion(work, reduce) : () => {};
      // and once its story's told, still on the same screen: the timeline fades away, the last chapter's words
      // move over to the left half, and the work comes up in the right, held there while its projects go by
      const fading = [...about.querySelectorAll<HTMLElement>("[data-ab-fade]")];
      const today = about.querySelector<HTMLElement>("[data-tl-today]");
      let merged = -1;
      const ease = (t: number) => {
        const c = gsap.utils.clamp(0, 1, t);
        return c * c * c * (c * (c * 6 - 15) + 10); // smootherstep
      };
      // in turn, so nothing crosses anything: the timeline fades first, then the words move over, then the work
      // comes up
      const merge = (t: number) => {
        const r = Math.round(t * 1000) / 1000;
        if (r === merged) return;
        merged = r;
        const gone = ease(t / 0.45), over = ease((t - 0.3) / 0.5), up = ease((t - 0.55) / 0.45);
        fading.forEach((el) => { el.style.opacity = gone === 0 ? "" : String(1 - gone); });
        // (from just right of the needle to the same air from the left edge)
        if (today) today.style.transform = over === 0 ? "" : `translate3d(${-midX * over}px, 0, 0)`;
        if (work) {
          work.style.opacity = String(up);
          work.style.visibility = up > 0 ? "visible" : "hidden";
          work.style.pointerEvents = up > 0.5 ? "auto" : "none";
        }
      };
      const ppm = Number(about.dataset.tlPpm ?? 44);
      const months = (about.dataset.tlStops ?? "0").split(",").map(Number); // the prologue, then each chapter
      const designed = (about.dataset.tlDesign ?? "").split(",").filter(Boolean).map(Number);
      // the chapters being told (by index, the prologue first): the whole journey, or only the design
      let active = months.map((_, i) => i);
      let stops = months;
      const totalEl = about.querySelector<HTMLElement>("[data-tl-total]");
      const ruler = about.querySelector<HTMLElement>("[data-tl-ruler]");
      const count = about.querySelector<HTMLElement>("[data-tl-count]");
      const time = about.querySelector<HTMLElement>("[data-tl-time]");
      const ticks = [...about.querySelectorAll<HTMLElement>("[data-tl-tick]")].map((el) => ({
        el,
        x: Number(el.dataset.tlTick),
        o: Number(el.dataset.o),
        near: true,
      }));
      const marks = [...about.querySelectorAll<HTMLElement>("[data-tl-mark]")];
      // the pictures and films: which chapter's, which of them, and their frames' shapes
      const media = [...about.querySelectorAll<HTMLElement>("[data-tl-media]")].map((el) => ({
        el,
        j: Number(el.dataset.j),
        k: Number(el.dataset.k),
        ratio: Number(el.dataset.ratio),
        video: el.querySelector("video"),
        w: 0, // its frame at the most magnified (it's scaled down from there)
        h: 0,
        a: 0, // its two edges along the strip, unmagnified
        b: 0,
        used: false, // on the strip (a filler past the ruler's end isn't)
        shown: false,
      }));
      // The filmstrip, under a magnifying glass: the pictures run edge to edge along the ruler, and the
      // needle is a lens over them. The one under it is biggest; the farther one is from it the smaller,
      // gradually, back down to a thumbnail; and the strip stays unbroken, each picture as wide as the room
      // the lens gives it, so they never overlap or part. They stand just above the ruler and grow upward only.
      // THUMB is a picture's height on the strip; LENS the glass's reach, in px along the strip.
      const THUMB = 22, LENS = 46;
      let midX = 0, line = 0, roomTop = 0, room = 0, power = 1, stripEnd = 0;
      // erf, for the lens (Abramowitz and Stegun 7.1.26)
      const erf = (x: number) => {
        const t = 1 / (1 + 0.3275911 * Math.abs(x));
        const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
        return x < 0 ? -y : y;
      };
      // where a point u px along the strip from the needle shows through the lens: the integral of the
      // magnification (power at the needle, easing to 1), so each picture's width is exactly what the lens
      // makes of it, and the strip stays whole
      const lens = (u: number) => u + (power - 1) * LENS * (Math.sqrt(Math.PI) / 2) * erf(u / LENS);
      const logos = [...about.querySelectorAll<HTMLElement>("[data-tl-logo]")];
      const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      // each chapter's words, with when each comes in as it's told: a beat between words, a breath at a
      // comma, a pause at a stop. Quick, so it's said almost at once
      // (a chapter told differently in the design journey has both tellings; only the journey's own is said)
      let journey = "whole";
      const says = [...about.querySelectorAll<HTMLElement>("[data-tl-say]")].map((el) => ({
        el,
        lines: [...el.querySelectorAll<HTMLElement>("[data-l]")],
        spoken: () => {
          const words = [...el.querySelectorAll<HTMLElement>("[data-w]")].filter((w) => {
            const v = w.closest<HTMLElement>("[data-variant]")?.dataset.variant;
            return !v || v === journey;
          });
          let t = 0;
          const at = words.map((w) => {
            const here = t;
            const end = (w.textContent ?? "").trim().slice(-1);
            t += 0.022 + (end === "," ? 0.06 : end && ":;".includes(end) ? 0.09 : end && ".!?".includes(end) ? 0.14 : 0);
            return here;
          });
          return { words, at };
        },
      }));
      // the scroll each chapter gets, and the stop's whole length
      let step = 0, span = 0, tail = 0, workSpan = 0;
      const measureHold = () => {
        // the needle stands at the middle of the screen as seen, not of the section (which counts the scrollbar)
        about.style.setProperty("--mid", `${document.documentElement.clientWidth / 2}px`);
        step = window.innerHeight * 0.9;
        stops = active.map((i) => months[i]);
        span = (stops.length - 1) * step;
        // then, on the same screen, the move over to the work (half a screen's scroll), and the work itself
        tail = window.innerHeight * 0.6;
        workSpan = work ? Number(work.dataset.wkSteps ?? 0) * window.innerHeight * PER : 0;
        setTrackHold(about.offsetLeft, span + tail + workSpan);
        // where the work begins, for the dial and "Check my work"
        if (work) work.dataset.scrollAt = String(Math.round(scrollForX(about.offsetLeft) + span + tail));
        if (work) work.dataset.scrollEnd = String(Number(work.dataset.scrollAt) + Math.round(workSpan));
        // and a little friction at the start of the sections after: a moment's scroll before it moves on
        setDetents(
          ["contact"].flatMap((id) => {
            const el = page.querySelector<HTMLElement>(`#${id}`);
            return el ? [el.offsetLeft] : [];
          }),
          window.innerHeight * 0.4,
        );
        // the room above the ruler, under the needle's tag
        midX = document.documentElement.clientWidth / 2;
        const vh = about.clientHeight;
        line = vh * 0.54;
        roomTop = gsap.utils.clamp(170, 220, vh * 0.22) + 24;
        room = line - 16 - roomTop;
        // the lens's power: the picture under the needle as tall as the room above the ruler
        power = Math.max(2, (room * 0.95) / THUMB);
        // the strip: from the ruler's start, pictures between the chapters until each chapter's month comes,
        // then that chapter's own, edge to edge all the way, to the ruler's end
        const end = months[months.length - 1] * ppm; // now: the strip ends at the needle on the last chapter
        const fillers = media.filter((md) => md.j === 0);
        let x = 0, fi = 0;
        const lay = (md: (typeof media)[number]) => {
          md.a = x;
          md.b = x + THUMB * md.ratio;
          md.used = true;
          x = md.b;
        };
        media.forEach((md) => { md.used = false; });
        months.forEach((m, j) => {
          if (j === 0) return; // the prologue has no pictures
          const own = media.filter((md) => md.j === j).sort((p, q) => p.k - q.k);
          const width = own.reduce((sum, md) => sum + THUMB * md.ratio, 0);
          // (around its month; the last chapter's ending at it, so the strip runs out at the needle)
          const from = j === months.length - 1 ? m * ppm - width : m * ppm - width / 2;
          while (fi < fillers.length && x + THUMB * fillers[fi].ratio <= from) lay(fillers[fi++]);
          own.forEach(lay);
        });
        while (fi < fillers.length && x + THUMB * fillers[fi].ratio <= end) lay(fillers[fi++]);
        stripEnd = x;
        media.forEach((md) => {
          md.h = THUMB * power;
          md.w = md.h * md.ratio;
          md.el.style.width = `${md.w}px`;
          md.el.style.height = `${md.h}px`;
          if (!md.used) md.el.style.visibility = "hidden";
        });
      };
      let told = -1;
      let telling: gsap.core.Timeline | null = null;
      // a chapter arriving, told: when and where rise into place, then the words come in, one after another
      const tell = (j: number) => {
        told = j;
        telling?.kill();
        says.forEach((t, i) => { t.el.style.visibility = i === j ? "visible" : "hidden"; });
        const t = says[j];
        if (t) {
          const { words, at } = t.spoken();
          if (reduce) gsap.set([...t.lines, ...words], { clearProps: "transform,opacity,filter" });
          else {
            telling = gsap.timeline();
            telling.fromTo(t.lines, { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.05, ease: "power4.out" }, 0);
            words.forEach((w, i) => {
              // a masked word (the last chapter's line, set large) rises up into its slot, upright as it lands
              if (w.parentElement?.dataset.mask) {
                telling!.fromTo(
                  w,
                  { yPercent: 115, rotate: 7, opacity: 1, transformOrigin: "0% 100%" },
                  { yPercent: 0, rotate: 0, duration: 1.1, ease: "expo.out" },
                  0.05 + i * 0.075,
                );
                return;
              }
              telling!.fromTo(
                w,
                { opacity: 0, y: "0.3em", filter: "blur(4px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out", clearProps: "filter" },
                0.1 + at[i],
              );
            });
          }
        }
        marks.forEach((el, i) => {
          el.dataset.on = String(i === j - 1);
          el.style.opacity = active.includes(i + 1) ? "" : "0"; // the chapters not in this journey leave the ruler
        });
        logos.forEach((el, i) => {
          gsap.to(el, { autoAlpha: i === j - 1 ? 1 : 0, y: i === j - 1 ? 0 : 8, duration: reduce ? 0 : 0.6, ease: "power3.out", overwrite: true });
        });
        if (count) count.textContent = String(active.indexOf(j)).padStart(2, "0");
        if (totalEl) totalEl.textContent = String(active.length - 1).padStart(2, "0");
      };
      // The feel of the scroll: how fast the ruler is running, eased, fed to everything as it moves. The
      // ticks lean back against the run and stretch, the month's tag blurs and widens, pictures on their way
      // lean with it; and all of it settles when the scroll does. (Carried in two CSS variables, --lean and
      // --stretch, on About, so a frame only sets those.)
      const FEEL = "skewX(var(--lean, 0deg)) scaleY(var(--stretch, 1))";
      const tag = time?.parentElement ?? null;
      let lastP = 0, lastT = 0, lastDraw = 0, pace = 0, felt = 0, feeling = false;
      const feel = () => {
        const now = performance.now();
        if (now - lastDraw > 90) pace = 0; // the scroll has stopped
        felt += (pace - felt) * 0.16;
        if (Math.abs(felt) < 0.02 && pace === 0) felt = 0;
        const speed = Math.abs(felt);
        about.style.setProperty("--lean", `${gsap.utils.clamp(-22, 22, -felt * 0.9)}deg`);
        about.style.setProperty("--stretch", String(1 + Math.min(speed * 0.05, 1.4)));
        if (tag) {
          tag.style.filter = speed > 0.3 ? `blur(${Math.min(speed * 0.12, 3)}px)` : "";
          tag.style.transform = `scaleX(${1 + Math.min(speed * 0.012, 0.2)})`;
        }
        if (felt === 0) { gsap.ticker.remove(feel); feeling = false; }
      };
      // how fast the ruler's running, in px a frame
      const sense = (p: number) => {
        const now = performance.now();
        if (lastT && step) pace = (((p - lastP) * (stops.length - 1) * step) / Math.max(8, now - lastT)) * 16 * 0.35;
        lastP = p;
        lastT = now;
        lastDraw = now;
        if (!feeling && !reduce && pace !== 0) { feeling = true; gsap.ticker.add(feel); }
      };
      // About at a point through the stop (0 to 1)
      const drawTimeline = (p: number) => {
        if (!ruler || !step) return;
        sense(p);
        const f = p * (stops.length - 1); // in chapters: whole at each chapter's resting point
        const k = Math.min(stops.length - 2, Math.floor(f));
        const q = gsap.utils.clamp(0, 1, f - k);
        const m = stops[k] + (stops[k + 1] - stops[k]) * q; // the month at the needle
        // where along the ruler the needle is: at each chapter's month, except the last, where it's the strip's
        // very end, so the story runs out exactly at the needle
        const atStop = (i: number) => (i === stops.length - 1 && stripEnd ? stripEnd : stops[i] * ppm);
        const at = atStop(k) + (atStop(k + 1) - atStop(k)) * q;
        ruler.style.transform = `translate3d(${-at}px, 0, 0)`;
        if (time) {
          const t = Math.round(m);
          time.textContent = `${MONTHS[t % 12]} ${2022 + Math.floor(t / 12)}`;
        }
        // the ruler under glass: ticks swell as they near the needle (only those near it need touching)
        ticks.forEach((t) => {
          const d = t.x - at;
          if (Math.abs(d) > 700) {
            if (t.near) { t.near = false; t.el.style.transform = `translate(-50%, -50%) ${FEEL}`; t.el.style.opacity = String(t.o); }
            return;
          }
          t.near = true;
          const g = 1 / (1 + (d / 70) ** 2);
          t.el.style.transform = `translate(-50%, -50%) ${FEEL} scaleY(${1 + 2.4 * g})`;
          t.el.style.opacity = String(t.o + (1 - t.o) * g);
        });

        // the strip through the lens: each picture from where its edges fall, standing on the ruler
        const vw = document.documentElement.clientWidth;
        media.forEach((md) => {
          if (!md.used) return;
          const left = midX + lens(md.a - at), right = midX + lens(md.b - at);
          const on = right > -40 && left < vw + 40;
          if (on !== md.shown) { md.shown = on; md.el.style.visibility = on ? "visible" : "hidden"; }
          if (!on) return;
          const scale = (right - left) / md.w;
          // (standing just above the ruler, so its ticks show)
          md.el.style.transform = `translate3d(${left}px, ${line - 10 - md.h}px, 0) scale(${scale})`;
          // films play only while they're up close
          if (md.video) {
            const big = scale * power;
            if (big > power * 0.5 && md.video.paused) md.video.play().catch(() => {});
            else if (big < power * 0.3 && !md.video.paused) md.video.pause();
          }
        });
        // the chapter nearest the needle is the one told; whole near its resting point, fading as the
        // scroll nears the next, gone at the halfway mark, where the next takes over
        const n = Math.round(f), j = active[n];
        if (j !== told) tell(j);
        const off = Math.abs(f - n);
        if (says[j]) says[j].el.style.opacity = String(reduce ? 1 : gsap.utils.clamp(0, 1, (0.5 - off) / 0.25));
      };


      // About through its whole stop (0 to 1): the story, then the move over, then the work
      const drawAbout = (h: number) => {
        const pos = h * (span + tail + workSpan);
        if (pos <= span || !tail) { drawTimeline(span ? Math.min(1, pos / span) : 0); merge(0); drawWork(0); return; }
        drawTimeline(1);
        merge(gsap.utils.clamp(0, 1, (pos - span) / tail));
        drawWork(workSpan ? gsap.utils.clamp(0, 1, (pos - span - tail) / workSpan) : 0);
      };

      // the corner's choice of journey: tell only those chapters, from the start of the story
      const onJourney = (e: Event) => {
        const mode = (e as CustomEvent<string>).detail;
        journey = mode;
        about.dataset.journey = mode; // which telling shows, and which mark is on the ruler
        active = mode === "design" ? [0, ...designed] : months.map((_, i) => i);
        told = -1;
        ScrollTrigger.refresh(); // the stop's length changes with the chapters in it
        const to = scrollForX(about.offsetLeft);
        if (window.__lenis) window.__lenis.scrollTo(to, { immediate: true, force: true });
        else window.scrollTo(0, to);
        ScrollTrigger.update();
        ScrollTrigger.getById("track")?.getTween()?.progress(1); // skip the scrub's catch-up
        drawTimeline(0);
      };
      window.addEventListener("about:journey", onJourney);
      measureHold();
      drawTimeline(0);
      ScrollTrigger.addEventListener("refreshInit", measureHold);


      const total = () => distance() + totalHold();

      ScrollTrigger.create({
        trigger: page,
        start: "top top",
        end: () => `+=${heroHold() + total()}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      // the track follows a scrubbed copy of the scroll: sideways, except through the stop
      const at = { scroll: 0 };
      gsap.fromTo(at, { scroll: () => heroHold() }, {
        scroll: () => heroHold() + total(),
        ease: "none",
        onUpdate: () => {
          const { x, hold } = trackAt(at.scroll);
          gsap.set(track, { x: -x });
          drawAbout(hold);
        },
        scrollTrigger: {
          id: "track",
          // absolute scroll positions (the page starts at the top): measured off the pinned page itself,
          // the pin's own spacing would be counted twice
          start: () => heroHold(),
          end: () => heroHold() + total(),
          scrub: reduce ? true : 0.8,
          invalidateOnRefresh: true,
        },
      });

      // where on the track something is, and the page scroll at which it reaches a point across the screen
      const along = (el: Element) => el.getBoundingClientRect().left - track.getBoundingClientRect().left;
      const arrives = (el: Element, across: number) => () => scrollForX(along(el) - window.innerWidth * across);

      if (!reduce) {
        // blocks fade and rise as they slide into view
        gsap.utils.toArray<HTMLElement>(".reveal", page).forEach((el) => {
          gsap.from(el, { autoAlpha: 0, y: 28, duration: 1, ease: "power3.out", scrollTrigger: { start: arrives(el, 0.88) } });
        });
        // lines of type rise out of their masks
        gsap.utils.toArray<HTMLElement>(".reveal-line", page).forEach((el) => {
          gsap.from(el, { yPercent: 110, duration: 1.1, ease: "power4.out", scrollTrigger: { start: arrives(el, 0.85) } });
        });
        // rules draw across
        gsap.utils.toArray<HTMLElement>(".reveal-rule", page).forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "0 50%",
            duration: 1.4,
            ease: "expo.inOut",
            scrollTrigger: { start: arrives(el, 0.9) },
          });
        });
      }

      // the hero's sequence and the reveals were set up before this pin existed: measure everything again
      ScrollTrigger.refresh();

      // arriving from another page with a section in the address (e.g. "Let's collaborate" from a note):
      // go straight to it along the track, once everything is measured
      const arrive = document.getElementById(location.hash.slice(1));
      if (arrive && page.contains(arrive) && arrive.id !== "index") {
        requestAnimationFrame(() => {
          const to = scrollForX(arrive.offsetLeft);
          if (window.__lenis) window.__lenis.scrollTo(to, { immediate: true, force: true });
          else window.scrollTo(0, to);
        });
      }

      return () => {
        gsap.ticker.remove(feel);
        if ("kill" in drawWork) drawWork.kill();
        window.removeEventListener("about:journey", onJourney);
        ScrollTrigger.removeEventListener("refreshInit", measureHold);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} data-track-root className="relative h-svh overflow-hidden bg-white">
      <div className="page-track relative flex h-full w-max">
        <Hero />
        <About />
        <Contact />
      </div>
    </div>
  );
}
