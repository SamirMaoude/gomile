import type { SVGProps } from "react";

export default function PhoneIcon({
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
      <path d="M7.5 4.5h2l1 4-1.5 1.5a13 13 0 0 0 5 5L15.5 13l4 1v2A2.5 2.5 0 0 1 17 18.5h-1A12.5 12.5 0 0 1 3.5 6v-1A2.5 2.5 0 0 1 6 2.5h1.5Z" />
    </svg>
  );
}
