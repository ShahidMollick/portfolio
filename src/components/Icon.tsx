// The icon set, drawn in the site's line: a fine stem, two slim lotus petals meeting at the tip as the
// arrowhead, and a four-point spark ahead of it. One default hover for all of them (see .lotus in globals.css): whenever the link or
// button around an icon is hovered or focused, the stem reaches, the petals open and the spark turns.

type Direction = "right" | "left" | "down" | "up" | "up-right";
const TURN: Record<Direction, number> = { right: 0, down: 90, left: 180, up: -90, "up-right": -45 };

type ArrowProps = {
  direction?: Direction;
  className?: string;
};

// An arrow: stem, petals and spark. Sized in em, so it follows the text it sits in.
export function Arrow({ direction = "right", className = "" }: ArrowProps) {
  const turned = TURN[direction] !== 0;
  return (
    <span
      aria-hidden="true"
      // a turned arrow keeps a square footprint, so it sits in a line of text like a glyph
      className={`inline-flex shrink-0 items-center justify-center align-[-0.2em] ${turned ? "h-[1.6em] w-[1.6em]" : "h-[1em] w-[2.4em]"} ${className}`}
    >
      <svg
        viewBox="0 0 48 20"
        className="lotus h-[1em] w-[2.4em] overflow-visible"
        style={turned ? { transform: `rotate(${TURN[direction]}deg)` } : undefined}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line className="lotus-stem" x1="1" y1="10" x2="33.5" y2="10" />
        <g className="lotus-head">
          <path className="lotus-petal-up" d="M34 10C33.6 5.8 30.4 2.4 25.4 0.8C27 4.6 29.8 8 34 10Z" />
          <path className="lotus-petal-down" d="M34 10C33.6 14.2 30.4 17.6 25.4 19.2C27 15.4 29.8 12 34 10Z" />
          <Spark x={40.5} y={10} r={3} />
        </g>
      </svg>
    </span>
  );
}

// The spark on its own, for list markers and small accents.
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className={`lotus inline-block h-[0.7em] w-[0.7em] overflow-visible ${className}`}>
      <Spark x={6} y={6} r={5} />
    </svg>
  );
}

// a four-point star: long points, pinched waist
function Spark({ x, y, r }: { x: number; y: number; r: number }) {
  const w = r * 0.13;
  return (
    <path
      className="lotus-spark"
      fill="currentColor"
      stroke="none"
      d={`M${x} ${y - r}Q${x + w} ${y - w} ${x + r} ${y}Q${x + w} ${y + w} ${x} ${y + r}Q${x - w} ${y + w} ${x - r} ${y}Q${x - w} ${y - w} ${x} ${y - r}Z`}
      style={{ transformOrigin: `${x}px ${y}px` }}
    />
  );
}
