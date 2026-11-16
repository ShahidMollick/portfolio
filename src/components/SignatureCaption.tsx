import { SIGNATURE_CAPTION } from "./preloader/signature-paths";

type SignatureCaptionProps = {
  className?: string;
  fill?: string;
};

// The caption under the signature, as SVG text so it scales with it.
export default function SignatureCaption({ className, fill = "currentColor" }: SignatureCaptionProps) {
  return (
    <text
      className={className}
      x={SIGNATURE_CAPTION.x}
      textAnchor={SIGNATURE_CAPTION.anchor}
      y={SIGNATURE_CAPTION.baseline}
      fontSize={SIGNATURE_CAPTION.size}
      letterSpacing={SIGNATURE_CAPTION.size * SIGNATURE_CAPTION.tracking}
      fill={fill}
      style={{ fontFamily: "var(--font-inter-tight)", fontWeight: 400 }}
    >
      {SIGNATURE_CAPTION.text}
    </text>
  );
}
