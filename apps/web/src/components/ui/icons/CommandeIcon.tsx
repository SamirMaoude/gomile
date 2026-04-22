import { IconProps } from "./types";

export default function CommandeIcon({
  className = "h-6 w-6",
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 4.5h8l3 3V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V6a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M15 4.5V8h3" />
      <path d="M9 11h6M9 14h6M9 17h4" />
    </svg>
  );
}
