"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type Brand = { name: string; src?: string; h?: number; mark?: boolean };

// The brands so far, as one endless strip: the big names first (the teams I've worked in), then the
// clients. A logo file where there is one (in public/clients, shown in one ink so the strip reads as a set);
// the rest are set as plain wordmarks until their files are in. `h` is the logo's height in em, set so each
// covers about the same area (wide marks shorter, compact ones taller, allowing for any padding in the file); `mark` is a symbol with no name in it, so the name is set beside it.
const BRANDS: Brand[] = [
  { name: "Bosch", src: "/clients/bosch.svg", h: 1.0 },
  { name: "Cambridge Judge Business School", src: "/clients/cambridge-judge.png", h: 1.5 },
  { name: "Rapido", src: "/clients/rapido.svg", h: 1.25 },
  { name: "Piramal Foundation", src: "/clients/piramal-foundation.svg", h: 1.67 },
  { name: "Quaintel", src: "/clients/quaintel.svg", h: 1.06 },
  { name: "PayNXT360", src: "/clients/paynxt360.svg", h: 1.41 },
  { name: "Heltar", src: "/clients/heltar.png", h: 0.95 },
  { name: "Shastra VC", src: "/clients/shastra-vc.png", h: 2.0 },
  { name: "Marquet Media", src: "/clients/marquet-media.png", h: 1.5 },
  { name: "Maison Reve" },
  { name: "Nurona", src: "/clients/nurona.png", h: 1.44, mark: true },
  { name: "Talmyra", src: "/clients/talmyra.png", h: 1.21, mark: true },
];

const SPEED = 28; // px per second

function Strip({ brands, label, reverse = false }: { brands: Brand[]; label: string; reverse?: boolean }) {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = track.current!;
    // the strip is two copies of the list, so moving it by one copy's width loops without a seam
    const loop = gsap.fromTo(el, { xPercent: reverse ? -50 : 0 }, {
      xPercent: reverse ? 0 : -50, ease: "none", repeat: -1, duration: el.scrollWidth / 2 / SPEED,
    });
    return () => loop.kill();
  });

  const row = (copy: number) =>
    brands.map(({ name, src, h = 1, mark }) => (
      <li key={`${copy}-${name}`} className="flex shrink-0 items-center gap-[0.35em] px-[clamp(10px,1vw,16px)]">
        {src && (
          // eslint-disable-next-line @next/next/no-img-element -- small static marks, sized in em
          <img src={src} alt={copy || mark ? "" : name} style={{ height: `${h}em` }} className="w-auto opacity-70 brightness-0" />
        )}
        {(!src || mark) && <span className="text-[0.9em] font-medium tracking-[-0.02em] whitespace-nowrap text-black/70">{name}</span>}
      </li>
    ));

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_88%,transparent)]">
      <div ref={track} className="flex w-max">
        <ul className="flex h-[2.4em] items-center" aria-label={label}>{row(0)}</ul>
        <ul className="flex h-[2.4em] items-center" aria-hidden="true">{row(1)}</ul>
      </div>
    </div>
  );
}

export default function LogoMarquee({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Strip brands={BRANDS} label="Brands I've worked with" />
    </div>
  );
}
