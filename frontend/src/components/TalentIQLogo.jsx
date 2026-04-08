/**
 * TalentIQ Brand Logo — SVG icon + wordmark
 *
 * Props:
 *   size       – icon height in px (default 36)
 *   showText   – render "TalentIQ" wordmark (default true)
 *   variant    – "light" (for light backgrounds) | "dark" (for dark backgrounds, inverse)
 *   className  – extra classes on wrapper
 */
export function TalentIQIcon({ size = 36, className = "" }) {
  // Scale factor relative to the 36px base
  const s = size / 36;
  const w = Math.round(36 * s);
  const h = Math.round(36 * s);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="9" fill="#0a66c2" />
      <rect x="16" y="13.5" width="4.5" height="15" rx="2.25" fill="white" />
      <rect x="7" y="7.5" width="22" height="4.5" rx="2.25" fill="white" />
      <circle cx="7" cy="9.75" r="3.5" fill="#FFB800" />
      <circle cx="29" cy="9.75" r="3.5" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

export function TalentIQWordmark({ variant = "dark", className = "" }) {
  const talentFill =
    variant === "dark"
      ? "rgba(255,255,255,0.55)"
      : "rgba(0,0,0,0.45)";
  const iqFill = variant === "dark" ? "#ffffff" : "#0d1117";

  return (
    <svg
      width="110"
      height="22"
      viewBox="0 0 110 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <text
        x="0"
        y="17"
        fontFamily="'Inter', sans-serif"
        fontSize="20"
        letterSpacing="-0.5"
      >
        <tspan fontWeight="400" fill={talentFill}>
          Talent
        </tspan>
        <tspan fontWeight="800" fill={iqFill}>
          IQ
        </tspan>
      </text>
    </svg>
  );
}

export default function TalentIQLogo({
  size = 36,
  showText = true,
  variant = "dark",
  className = "",
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <TalentIQIcon size={size} />
      {showText && <TalentIQWordmark variant={variant} />}
    </span>
  );
}
