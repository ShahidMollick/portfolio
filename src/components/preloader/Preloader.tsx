"use client";

import { useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SignatureCaption from "../SignatureCaption";
import { SIGNATURE_INK, SIGNATURE_PEN, SIGNATURE_PEN_WIDTH, SIGNATURE_VIEWBOX } from "./signature-paths";

gsap.registerPlugin(useGSAP);

// userSpaceOnUse masks default to a region measured from 0,0, which would clip this offset viewBox.
const [VB_X, VB_Y, VB_W, VB_H] = SIGNATURE_VIEWBOX.split(" ").map(Number);


// Seconds spent with the pen down across the whole signature.
const WRITE_DURATION = 2.1;
// Seconds the pen spends in the air between strokes.
const PEN_LIFT = 0.04;
// Strokes longer than this (viewBox units) are sweeps: eased, rather than a steady hand.
const SWEEP = 600;

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// Fired when the signature has gone and the page underneath may take over (the hero opens from here).
export const PRELOADER_DONE = "preloader:done";
declare global {
  interface Window { __preloaderDone?: boolean }
}

type PreloaderProps = {
  onComplete?: () => void;
};

export default function Preloader({ onComplete }: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const maskId = useId();

  useGSAP(
    () => {
      const el = root.current!;
      const strokes = gsap.utils.toArray<SVGPathElement>(".stroke", el);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      document.documentElement.style.overflow = "hidden";
      // a fresh run: the page waits for this handoff
      window.__preloaderDone = false;
      // hand over to the page: the hero starts opening underneath (the sheet's white matches the page)
      const handoff = () => {
        if (window.__preloaderDone) return;
        window.__preloaderDone = true;
        window.dispatchEvent(new Event(PRELOADER_DONE));
      };
      const finish = () => {
        document.documentElement.style.overflow = "";
        handoff();
        setDone(true);
        onComplete?.();
      };

      const lengths = strokes.map((p) => p.getTotalLength());
      strokes.forEach((p, i) => {
        // hidden until the pen reaches it
        gsap.set(p, { strokeDasharray: lengths[i], strokeDashoffset: lengths[i], autoAlpha: 0 });
      });

      if (reduceMotion) {
        gsap
          .timeline({ onComplete: finish })
          .set(el, { autoAlpha: 1 })
          .set(strokes, { strokeDashoffset: 0, autoAlpha: 1 })
          .set(".preloader-meta", { autoAlpha: 1 })
          .to(el, { autoAlpha: 0, duration: 0.5, delay: 1.2 });
        return;
      }

      const total = lengths.reduce((a, b) => a + b, 0);
      const tl = gsap.timeline();

      tl.set(el, { autoAlpha: 1 }).fromTo(
        ".signature-wrap",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
      );

      // one pen, stroke after stroke: steady through the letters, eased on the long sweeps
      strokes.forEach((p, i) => {
        const duration = Math.max(0.06, (lengths[i] / total) * WRITE_DURATION);
        tl.set(p, { autoAlpha: 1 }, `+=${PEN_LIFT}`).to(p, {
          strokeDashoffset: 0,
          duration,
          ease: lengths[i] > SWEEP ? "power2.inOut" : "none",
        });
      });

      tl.fromTo(
          ".preloader-meta",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.3",
        )
        // Hold on the finished signature, then hand over: the sheet goes see-through (the page behind is the
        // same white) and the signature lifts away as the hero's box swipes in beneath it.
        .add(() => {
          handoff();
          gsap.set(el, { backgroundColor: "transparent", pointerEvents: "none" });
          gsap.set(".preloader-grain", { autoAlpha: 0 });
        }, "+=0.7")
        .to(".signature-wrap", { autoAlpha: 0, y: -16, duration: 0.6, ease: "power2.in", onComplete: finish }, "<");
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white text-black"
    >
      {/* film grain */}
      <div
        className="preloader-grain pointer-events-none absolute -inset-1/2 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative flex w-[min(80vw,560px)] flex-col items-center">
        {/* the white sheet is in the server HTML, so the page never flashes before this script runs */}
        <div className="signature-wrap w-full" style={{ opacity: 0 }}>
          <svg viewBox={SIGNATURE_VIEWBOX} className="w-full overflow-visible">
            {/* the ink is revealed by its pen centrelines being "written" into this mask */}
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x={VB_X} y={VB_Y} width={VB_W} height={VB_H}>
                {SIGNATURE_PEN.map((d, i) => (
                  <path
                    key={i}
                    className="stroke"
                    d={d}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={SIGNATURE_PEN_WIDTH[i]}
                    // flat caps: a round cap would flash a dot at each stroke's start before the pen moves
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                  />
                ))}
              </mask>
            </defs>
            <path d={SIGNATURE_INK} fill="#111111" fillRule="evenodd" mask={`url(#${maskId})`} />
            <SignatureCaption className="preloader-meta invisible" fill="#111111" />
          </svg>
        </div>
      </div>
    </div>
  );
}
