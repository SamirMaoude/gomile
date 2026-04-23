import type { SVGProps } from "react";

export default function TransportIcon({
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
      <path d="M3.5 16.5V9.5a2 2 0 0 1 2-2h9v9h-11Z" />
      <path d="M14.5 10.5h3l2 2.5v3.5h-5" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="17.5" cy="17" r="2" />
    </svg>
  );
}
