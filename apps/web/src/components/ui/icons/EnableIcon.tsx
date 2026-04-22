import { IconProps } from "./types";

export default function EnableIcon({
  className = "h-4 w-4",
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
      <circle cx="12" cy="12" r="8.5" />
      <path d="m10 8 5 4-5 4V8Z" />
    </svg>
  );
}
