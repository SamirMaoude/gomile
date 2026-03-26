import React from "react"

interface Props {
  children: React.ReactNode;
  landingpage?: boolean
  blur?: boolean;
}

export default function BackGround({ children, blur = false, landingpage=false }: Props) {
  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden">

      {/* Calque image de fond */}
      <div
        className={`absolute inset-0 -z-10 bg-cover bg-center ${blur ? "blur-sm scale-105" : ""}`}
        style={{ backgroundImage: `${landingpage ? "url('/images/bgLanding.png')": "url('/images/bg.png)"}` }}
      />

      {/* Contenu net par-dessus */}
      {children}

    </div>
  );
}