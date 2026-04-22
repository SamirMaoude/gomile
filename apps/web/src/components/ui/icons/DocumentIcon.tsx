import type { SVGProps } from "react";

export default function DocumentIcon({
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
      <path d="M7 3.5h7l4 4V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
      <path d="M14 3.5V8h4" />
      <path d="M8.5 12h7" />
      <path d="M8.5 15.5h7" />
    </svg>
  );
}
