import type { SVGProps } from "react";

export default function CityIcon({
  className = "h-6 w-6",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 20.5h17" />
      <path d="M5.5 20.5V9.5l4-2v13" />
      <path d="M9.5 20.5V5.5l5-2v17" />
      <path d="M14.5 20.5v-9l4-2v11" />
      <path d="M7.5 12h.01" />
      <path d="M11.5 8.5h.01" />
      <path d="M11.5 12h.01" />
      <path d="M11.5 15.5h.01" />
      <path d="M16.5 14h.01" />
    </svg>
  );
}
