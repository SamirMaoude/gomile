import type { SVGProps } from "react";

export default function CircleIcon({
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
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v4.5l3 2" />
    </svg>
  );
}
