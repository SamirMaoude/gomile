import type { IconProps } from "./types";

export default function KeyIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.5 7.5a4.5 4.5 0 1 0-8.273 2.487L2 14.214V17h2.786v-1.5h1.5V14h1.5v-1.5h1.999A4.5 4.5 0 0 0 14.5 7.5Zm-4.5-1.5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
