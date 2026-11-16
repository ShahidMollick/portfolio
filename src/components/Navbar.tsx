import Link from "next/link";
import CollaborateLink from "./CollaborateLink";
import LocalTime from "./LocalTime";
import Monogram from "./Monogram";

type NavbarProps = {
  // invert against whatever is behind (for imagery); off where it would sit over strong colour
  blend?: boolean;
};

export default function Navbar({ blend = true }: NavbarProps) {
  // White with difference blending: reads black on the white page and inverts over imagery.
  // Laid on the same 12-column grid and margins as the page: your local time on the left, the S.M lockup
  // at the centre, the way to get in touch on the right.
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${blend ? "text-white mix-blend-difference" : "text-[#141414]"}`}
    >
      <nav className="grid grid-cols-12 items-center gap-x-4 px-6 py-5 font-(family-name:--font-inter-tight) sm:gap-x-6 sm:px-10">
        <p
          data-nav-item
          className="col-span-3 hidden text-[12px] leading-[1.2] tracking-[-0.01em] opacity-80 md:col-span-4 md:block"
        >
          <LocalTime />
          <br />
          Available for new projects
        </p>

        {/* the lockup, centred: the monogram with the name in two lines beside it */}
        <Link
          href="/"
          aria-label="Shahid Mollick & Company, home"
          className="col-span-8 flex items-center gap-2.5 transition-opacity hover:opacity-70 sm:gap-3 md:col-span-4 md:justify-center"
        >
          <span data-nav-mark className="flex">
            <Monogram weight={1.3} className="h-10 w-auto sm:h-14 md:h-16" />
          </span>
          <span
            data-nav-item
            aria-hidden="true"
            className="font-(family-name:--font-serif-display) text-[14px] leading-[1.05] tracking-[-0.01em] whitespace-nowrap sm:text-[18px]"
          >
            Shahid Mollick
            <br />
            &amp; Company
          </span>
        </Link>

        {/* the one call to action up here; the section links live on the dial along the bottom */}
        {/* (it steps aside while the work's showing, where it's set large at the foot of the screen) */}
        <p data-nav-item className="col-span-4 text-right">
          {/* (on its own wrapper: the opening's animation sets the item's opacity) */}
          <span
            data-nav-collab
            className="inline-block transition-opacity duration-300"
          >
            <CollaborateLink className="inline-block border-b border-current pb-0.5 font-(family-name:--font-serif-display) text-[13px] leading-none tracking-[-0.01em] whitespace-nowrap uppercase transition-opacity hover:opacity-60 sm:text-[16px]" />
          </span>
        </p>
      </nav>
    </header>
  );
}
