import type { SVGProps } from "react";

export default function GmailIcon({
  className = "h-9 w-9",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.7 14.6 3 12 3a9 9 0 1 0 0 18c5.2 0 8.7-3.7 8.7-8.9 0-.6-.1-1.1-.2-1.9H12Z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.7 7 10c.8-2.3 2.9-4 5-4 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.7 14.6 3 12 3 8.5 3 5.4 5 3.9 7.7Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21c2.5 0 4.6-.8 6.1-2.3l-2.8-2.2c-.8.5-1.8.9-3.3.9-3.7 0-5-2.6-5.3-3.8l-3 .2A9 9 0 0 0 12 21Z"
      />
      <path
        fill="#4285F4"
        d="M3.7 13.8a9 9 0 0 1 .2-6.1L7 10c-.2.6-.3 1.2-.3 2s.1 1.4.3 2l-3.1 2.4A8.8 8.8 0 0 1 3.7 13.8Z"
      />
    </svg>
  );
}