import { MONOGRAM_INK, MONOGRAM_VIEWBOX } from "./monogram-path";

type MonogramProps = {
  className?: string;
  // extra ink weight in screen pixels, so hairlines hold up when the mark is small
  weight?: number;
};

// The signature's "S.M" on its own, for spaces too small for the full signature; takes its colour from `color`.
export default function Monogram({ className, weight = 0 }: MonogramProps) {
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} role="img" aria-label="Shahid Mollick & Co." className={className}>
      <path
        d={MONOGRAM_INK}
        fill="currentColor"
        fillRule="evenodd"
        stroke={weight ? "currentColor" : undefined}
        strokeWidth={weight || undefined}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
