import LocalTime from "./LocalTime";
import { Arrow } from "./Icon";

// Placeholder contact details: replace with your own.
const EMAIL = "hello@shahidmollick.com";
const ELSEWHERE = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Read.cv", href: "#" },
];

// The last panel on the horizontal track. (Its reveals are timed by the page's track.)
export default function Contact() {
  return (
    <section
      id="contact"
      className="grid h-full w-screen shrink-0 grid-cols-12 grid-rows-[auto_1fr_auto] gap-x-4 bg-white px-6 pt-32 pb-32 font-(family-name:--font-inter-tight) text-[#141414] sm:gap-x-6 sm:px-10 md:pt-36 md:pb-36"
    >
      <p className="reveal col-span-12 text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">
        (05) Contact
      </p>

      <div className="col-span-12 self-center">
        <h2 className="font-(family-name:--font-serif-display) text-[clamp(44px,9vw,180px)] leading-[0.92] tracking-[-0.02em] uppercase">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="reveal-line block">Let&apos;s look</span>
          </span>
          <span className="block overflow-hidden pb-[0.06em] pl-[calc((100%-11*1.5rem)/12*3+3*1.5rem)]">
            <span className="reveal-line block">closer.</span>
          </span>
        </h2>
        <a
          href={`mailto:${EMAIL}`}
          className="reveal mt-10 inline-block border-b border-current pb-1 font-(family-name:--font-serif-display) text-[clamp(22px,2.6vw,44px)] tracking-[-0.01em] transition-opacity hover:opacity-60"
        >
          {EMAIL} <Arrow className="ml-2" />
        </a>
      </div>

      <div className="reveal col-span-12 grid grid-cols-12 gap-x-4 border-t border-black/15 pt-4 text-[12px] leading-snug sm:gap-x-6">
        <p className="col-span-6 text-black/70 md:col-span-3">
          Tell me about your project, your timeline and what you&apos;d like people to feel. I reply within two
          working days.
        </p>
        <p className="col-span-6 text-black/50 md:col-span-3 md:col-start-5">
          <LocalTime />
          <br />
          Based in India, working worldwide
        </p>
        <ul className="col-span-6 mt-4 text-black/50 md:col-span-2 md:col-start-9 md:mt-0">
          {ELSEWHERE.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className="transition-colors hover:text-black">
                {label} <Arrow direction="up-right" />
              </a>
            </li>
          ))}
        </ul>
        <p className="col-span-6 mt-4 text-right text-black/50 md:col-span-2 md:col-start-11 md:mt-0">
          © Shahid Mollick
        </p>
      </div>
    </section>
  );
}
