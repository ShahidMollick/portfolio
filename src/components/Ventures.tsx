import { Arrow } from "./Icon";

// The companies I've started, newest first. (Also listed in the corner of the "What I do" screen.)
export const VENTURES: {
  name: string;
  status: string;
  short: string; // a few words, for the corner of the "What I do" screen
  line: string;
  role: string;
  tone: string;
  href?: string;
}[] = [
  {
    name: "Zlice",
    status: "Live",
    short: "Campus commerce, IIT KGP",
    line: "Campus-native infrastructure at IIT Kharagpur: payments, identity and delivery for 25,000+ residents. ₹7.2L+ GMV and 3.5k+ users so far.",
    role: "Founder · 2026",
    tone: "#2b1d8f",
    href: "https://www.zlice.in",
  },
  {
    name: "CareQ",
    status: "2024–26",
    short: "Shorter OPD queues",
    line: "Cutting wait times at hospital OPDs: a B2B SaaS for hospitals and diagnostic centres, with 12% faster service at AIIMS Jodhpur.",
    role: "Founder · 2024–26",
    tone: "#2f8a55",
    href: "https://www.careq.in",
  },
  {
    name: "Untitled",
    status: "Coming soon",
    short: "Something in design, soon",
    line: "Something new in the design space. More soon.",
    role: "Founder",
    tone: "#141414",
  },
];

// Startups, as a sheet of the About page: a short heading on the left, then one card per company across
// the rest of the grid, its name on a field of colour.
export function VenturesSheet({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="col-span-12 text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">(03) About · Startups</p>
      <div className="col-span-12 self-center md:col-span-3">
        <h3 className="text-[clamp(28px,2.6vw,46px)] leading-[1.02] font-medium tracking-[-0.03em]">What I&apos;m building</h3>
        <p className="mt-4 max-w-xs text-[14px] leading-snug text-black/60">
          Companies I&apos;ve started. Building my own is why I design like an owner: every choice has to earn its
          place.
        </p>
      </div>
      <div className="col-span-12 mt-8 grid grid-cols-1 gap-4 self-center sm:grid-cols-3 sm:gap-6 md:col-span-9 md:col-start-4 md:mt-0">
        {VENTURES.map(({ name, status, line, role, tone, href }) => {
          const inner = (
            <>
              <span
                className="relative flex aspect-[4/3] items-end overflow-hidden p-5"
                style={{ backgroundColor: tone }}
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,0.22),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(0,0,0,0.25),transparent_50%)]" />
                <span className="absolute top-4 right-4 rounded-full border border-white/50 px-2.5 py-1 text-[11px] font-medium tracking-[0.02em] text-white uppercase">
                  {status}
                </span>
                <span className="relative text-[clamp(30px,2.8vw,50px)] leading-none font-medium tracking-[-0.04em] text-white">
                  {name}
                </span>
              </span>
              <span className="mt-4 flex items-baseline justify-between gap-4 border-t border-black/15 pt-3 text-[11px] font-medium tracking-[0.02em] text-black/50 uppercase">
                <span>{role}</span>
                {href && (
                  <span className="text-black/80">
                    Visit <Arrow direction="up-right" />
                  </span>
                )}
              </span>
              <span className="mt-2 block text-[14px] leading-snug text-black/70">{line}</span>
            </>
          );
          return href ? (
            <a key={name} href={href} target="_blank" rel="noreferrer" className="group block transition-opacity hover:opacity-80">
              {inner}
            </a>
          ) : (
            <div key={name}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
