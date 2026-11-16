import SignatureCaption from "./SignatureCaption";
import { SIGNATURE_INK, SIGNATURE_VIEWBOX } from "./preloader/signature-paths";

type WordmarkProps = {
  className?: string;
  // the line of text under the signature; turn off where the name is set alongside instead
  caption?: boolean;
  // extra ink weight in screen pixels, so hairlines hold up when the mark is small
  weight?: number;
};

// Static signature for headers, footers and favicons; takes its colour from `color`.
export default function Wordmark({ className, caption = true, weight = 0 }: WordmarkProps) {
  return (
    <svg viewBox={SIGNATURE_VIEWBOX} role="img" aria-label="Shahid Mollick & Co." className={className}>
      <path
        d={SIGNATURE_INK}
        fill="currentColor"
        fillRule="evenodd"
        stroke={weight ? "currentColor" : undefined}
        strokeWidth={weight || undefined}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {caption && <SignatureCaption />}
    </svg>
  );
}
