import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const BackIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M15 18l-6-6 6-6" /></svg>
);
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12l5 5 9-10" /></svg>
);
export const InfoIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
);
export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
);
export const TimerIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" /></svg>
);
export const HourglassIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 2h12M6 22h12M7 2v4a5 5 0 0 0 10 0V2M7 22v-4a5 5 0 0 1 10 0v4" /></svg>
);
export const CardIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></svg>
);
export const PhoneIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></svg>
);
export const BankIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" /></svg>
);
export const MusicIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
export const FilmIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 9h20M7 5v4M12 5v4M17 5v4" /></svg>
);
export const BallIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 3c3 3 3 15 0 18M3 12h18" /></svg>
);
export const MaskIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 4h16v6a8 8 0 0 1-16 0z" /><path d="M9 9h.01M15 9h.01M9 13c1.5 1.5 4.5 1.5 6 0" /></svg>
);
export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);

/** Decorative concentric rings used on hero panels. */
export function Rings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 420" fill="none" stroke="#8B7BFF" strokeWidth={1.2} aria-hidden className={className}>
      <circle cx="210" cy="210" r="60" />
      <circle cx="210" cy="210" r="110" />
      <circle cx="210" cy="210" r="160" />
      <circle cx="210" cy="210" r="205" />
    </svg>
  );
}
