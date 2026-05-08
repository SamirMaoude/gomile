export const styles = {
  card:
    "w-full max-w-[22rem] overflow-hidden rounded-[1.8rem] shadow-[0_26px_90px_rgba(24,58,92,0.5)] sm:max-w-[34rem] lg:max-w-[72rem]",
  splitCard: "grid lg:grid-cols-[0.92fr_1.08fr]",

  brandPanel:
    "relative isolate hidden overflow-hidden lg:flex",
  brandContent: "flex min-h-full flex-col justify-center px-10 py-12 xl:px-12",
  brandLogoWrapper: "mb-8 inline-flex w-fit",
  brandLogoImage: "h-28 w-28 object-contain xl:h-32 xl:w-32",
  brandTitle:
    "text-left text-[2.35rem] leading-[1.05] !text-white xl:text-[2.9rem]",
  brandTitleBreak: "mt-1 block !text-white",
  brandDescription:
    "mt-6 max-w-[28rem] text-[1rem] leading-7 !text-black/90 xl:text-[1.3rem]",

  formPanel:
    "bg-white/96 px-5 py-6 sm:px-7 sm:py-7 lg:px-10 lg:py-10 xl:px-12",
  header: "flex flex-col items-center lg:items-start",
  title:
    "text-center text-[2rem] leading-[1.08] !text-slate-950 sm:text-[2.35rem] lg:text-left lg:text-[2.7rem]",
  loginDescription:
    "mt-3 text-center text-[1rem] leading-6 !text-slate-600 lg:text-left lg:text-[1.2rem]",

  form: "mt-6 space-y-4 lg:mt-7 lg:space-y-5",

  fieldContainer: "w-full",
  phoneInputRoot:
    "!flex !w-full [--react-international-phone-height:3.75rem] lg:[--react-international-phone-height:4.35rem] [--react-international-phone-border-radius:1.4rem] [--react-international-phone-border-color:rgba(15,23,42,0.85)] [--react-international-phone-background-color:#fff] [--react-international-phone-text-color:#020617] [--react-international-phone-dropdown-item-text-color:#0f172a] [--react-international-phone-dropdown-item-background-color:#fff] [--react-international-phone-dropdown-item-hover-background-color:#f1f5f9] [--react-international-phone-dropdown-item-dial-code-color:#475569] [--react-international-phone-country-selector-background-color:#fff] [--react-international-phone-country-selector-background-color-hover:#f8fafc] [--react-international-phone-country-selector-border-color:rgba(15,23,42,0.85)] [--react-international-phone-country-selector-border-radius:1.4rem_0_0_1.4rem] [--react-international-phone-input-border-color:rgba(15,23,42,0.85)] [--react-international-phone-input-border-radius:0_1.4rem_1.4rem_0] [--react-international-phone-dropdown-shadow:0_18px_50px_rgba(15,23,42,0.16)]",
  phoneInputField:
    "!h-[3.75rem] !min-h-[3.75rem] !w-full !flex-1 !text-[1.05rem] !text-slate-950 placeholder:!text-slate-700 lg:!h-[4.35rem] lg:!min-h-[4.35rem] lg:!text-[1.2rem]",
  phoneCountryButton:
    "!h-[3.75rem] !min-h-[3.75rem] !shrink-0 !border-2 !border-slate-700/85 focus:!border-primary-light lg:!h-[4.35rem] lg:!min-h-[4.35rem]",
  phoneCountryArrow: "!text-slate-700",
  fieldWrapper:
    "h-[3.75rem] rounded-[1.4rem] border-2 border-slate-700/85 bg-white px-4 focus-within:!border-primary-light focus-within:ring-4 focus-within:ring-emerald-100 lg:h-[4.35rem]",
  fieldInput:
    "text-[1.05rem] !text-slate-950 placeholder:!text-slate-700 lg:text-[1.2rem]",
  fieldIcon: "h-6 w-6 text-slate-700",

  toggleButton:
    "inline-flex items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100",

  forgotRow: "pt-1 text-right",
  forgotLink: "transition hover:text-sky-950",
  forgotLinkText: "text-[1rem] !text-sky-800 lg:text-[1.1rem]",

  message: "",

  submitButton:
    "!h-[3.75rem] !rounded-[1.25rem] !border-0 !bg-[linear-gradient(180deg,#a7d84e_0%,#7ebb2b_100%)] px-6 !text-[1rem] font-bold uppercase tracking-[0.08em] !text-white shadow-[0_18px_40px_rgba(126,187,43,0.34)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_50px_rgba(126,187,43,0.42)] disabled:cursor-not-allowed disabled:opacity-70 lg:!h-[4.4rem] lg:!text-[1.28rem]",

  divider: "mt-6 flex items-center gap-4 sm:text-base lg:mt-7",
  dividerLine: "h-px flex-1 bg-slate-200",
  dividerText: "!text-sm !text-slate-500 sm:!text-base",

  socialGrid: "mt-5 flex items-center justify-center gap-6 lg:mt-6",
  socialButton: "rounded-full transition hover:-translate-y-0.5",
  socialIcon: "h-9 w-9",

  footer: "mt-6 text-center lg:mt-7",
  footerText: "text-[1rem] !text-slate-800 lg:text-[1.12rem]",
  registerLink: "font-semibold text-sky-800 transition hover:text-sky-950",
};
