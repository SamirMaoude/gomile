import type { SVGProps } from "react";

export default function FacebookIcon({
  className = "h-9 w-9",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.3 20v-6h2l.3-2.4h-2.3V10c0-.7.2-1.2 1.2-1.2H16V6.6c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.2v1.8H9.1V14h2.1v6h2.1Z"
      />
    </svg>
  );
}