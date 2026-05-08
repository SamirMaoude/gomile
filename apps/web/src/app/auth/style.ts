export const styles = {
  pageShell: "flex min-h-dvh flex-col",
  main:
    "flex flex-1 flex-col items-center px-3 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-7 md:pb-8 lg:px-6",
  content:
    "mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center",
  title:
    "relative top-8 text-center text-[clamp(1.8rem,5vw,3.4rem)] leading-tight sm:top-6 md:top-7",
  optionsGrid: "grid w-full gap-3 sm:gap-5 md:grid-cols-2",
  optionCard:
    "relative isolate flex min-h-[9.5rem] flex-col items-center justify-center gap-2 overflow-hidden rounded-card border-2 border-white/80 p-3 shadow-lg backdrop-blur-sm sm:min-h-[13rem] sm:gap-4 md:min-h-[20rem]",
  optionImage:
    "aspect-square w-[clamp(5.5rem,26vw,16rem)] bg-contain bg-center bg-no-repeat sm:w-40 md:w-56 lg:w-64",
  merchantButton:
    "w-full max-w-64 px-3 text-center text-xs sm:text-sm md:text-base [&>span]:min-w-0 [&>span]:whitespace-nowrap",
  driverButton:
    "w-full max-w-64 px-3 text-center text-xs sm:text-sm md:text-base [&>span]:min-w-0 [&>span]:break-words",
};
