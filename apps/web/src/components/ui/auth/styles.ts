export const backgroundImageStyle = {
  backgroundImage: "url('/images/bg.png')",
};

export const styles = {
  page: "relative isolate min-h-screen overflow-hidden bg-cover bg-center",
  overlay:
    "absolute inset-0 bg-[linear-gradient(135deg,rgba(191,217,229,0.14),rgba(255,255,255,0.16))]",
  container:
    "relative z-10 flex min-h-screen items-center justify-center py-4 !px-4 sm:!px-6 lg:!px-10",
  backLink:
    "absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/45 text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur transition hover:bg-white/60 sm:left-6 sm:top-6 lg:h-auto lg:w-auto lg:gap-2 lg:px-4 lg:py-2",
  backLinkIcon: "h-5 w-5 lg:hidden",
  backLinkText: "hidden text-sm !text-slate-800 lg:inline",
};
