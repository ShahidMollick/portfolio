"use client";

import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollForX } from "@/lib/track";
import { Arrow } from "./Icon";

// "Let's collaborate": to the contact panel. On the home page it glides there along the track (an anchor
// would scroll the page down, not across); from any other page it goes home to it (see HorizontalPage).
// (Also a link to any other section: `to` is its id, `peek` how much of the screen before it to keep in view,
// as a share of the screen's width.)
export default function CollaborateLink({
  className = "",
  to = "contact",
  peek = 0,
  children,
}: {
  className?: string;
  to?: string;
  peek?: number;
  children?: React.ReactNode;
}) {
  const go = (e: React.MouseEvent) => {
    const el = document.getElementById(to);
    if (!ScrollTrigger.getById("track") || !el) return; // not on the home page: let the link go there
    e.preventDefault();
    e.stopPropagation(); // handled here, not by Lenis' anchor links
    // (a part that plays inside another's screen says where it begins, in data-scroll-at)
    const y = el.dataset.scrollAt ? Number(el.dataset.scrollAt) : scrollForX(el.offsetLeft - window.innerWidth * peek);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 2.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <Link href={`/#${to}`} onClick={go} className={className}>
      {children ?? <>Let&apos;s collaborate</>} <Arrow className="ml-1" />
    </Link>
  );
}
