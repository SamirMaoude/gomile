import Image from "next/image"
import React from "react"

interface Props {
  children: React.ReactNode;
  blur?: boolean;
  className?: string;
}

export default function BackGround({
  children,
  blur = false,
  className = "",
}: Props) {
  return (
    <div className={`relative isolate flex min-h-dvh w-full flex-col overflow-x-hidden ${className}`}>

      {/* Calque image de fond */}
      <div
        className={`absolute inset-0 -z-10 overflow-hidden ${blur ? "scale-105 blur-sm" : ""}`}
      >
        <Image
          src="/images/bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[52%_center] sm:object-center"
          aria-hidden
        />
      </div>

      {/* Contenu net par-dessus */}
      {children}

    </div>
  );
}
