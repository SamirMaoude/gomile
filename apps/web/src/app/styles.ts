export const backgroundImageStyle = {
  backgroundImage: "url('/images/bg.png')",
};

export const merchantImageStyle = {
  backgroundImage: "url('/images/commercant.png')",
};

export const driverImageStyle = {
  backgroundImage: "url('/images/livreur.png')",
};

export const styles = {
  page: "flex h-screen w-full flex-col overflow-hidden bg-cover bg-center",
  main:
    "grid min-h-0 flex-1 place-items-center overflow-y-auto px-4 py-5 sm:px-6 sm:py-6",
  content:
    "mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 rounded-card border-2 border-gray-200 bg-bg-card p-3 shadow-lg sm:p-4 lg:min-h-[37.5rem]",
  title: "text-center text-[2rem] leading-tight sm:text-[2.6rem]",
  cardsGrid: "grid w-full gap-4 md:grid-cols-2 lg:flex-1 lg:gap-5",
  choiceCard:
    "flex min-h-[28rem] flex-col items-center justify-between gap-4 rounded-card border-2 border-gray-200 bg-white py-5 shadow sm:min-h-[31rem]",
  choiceHeader: "flex flex-col gap-2",
  choiceTitle: "text-center",
  choiceImage:
    "h-40 w-40 shrink-0 bg-cover bg-center sm:h-56 sm:w-56 lg:h-64 lg:w-64",
  merchantActions: "flex w-full max-w-xs flex-col gap-3",
  driverActions: "flex w-full max-w-xs justify-center",
};
