import type { SVGProps } from "react";

export default function EquipmentIcon({
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
      <path d="M4.5 9.5h15a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
      <path d="M8 9.5V7.75A2.25 2.25 0 0 1 10.25 5.5h3.5A2.25 2.25 0 0 1 16 7.75V9.5" />
      <path d="M10 13.5h4" />
      <path d="M12 11.5v4" />
    </svg>
  );
}
