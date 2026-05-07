import { styles as authStyles } from "@/app/merchant/login/styles";

export const styles = {
  ...authStyles,
  card:
    "w-full max-h-[calc(100dvh-5rem)] max-w-[22rem] overflow-y-auto overflow-x-hidden rounded-[1.5rem] shadow-[0_26px_90px_rgba(24,58,92,0.18)] sm:max-h-[calc(100dvh-7rem)] sm:max-w-[38rem] sm:rounded-[1.8rem] lg:max-h-none lg:max-w-[76rem] lg:overflow-hidden",
  splitCard: "grid lg:grid-cols-[0.72fr_1.28fr]",
  formPanel:
    "bg-white/96 px-4 py-4 sm:px-7 sm:py-7 lg:px-10 lg:py-10 xl:px-12",
  title:
    "text-center text-[clamp(1.35rem,6vw,2.35rem)] leading-[1.08] !text-slate-950 lg:text-left lg:text-[2.7rem]",
  form: "mt-4 space-y-3 sm:mt-6 sm:space-y-4 lg:mt-7 lg:space-y-5",
  phoneInputRoot:
    "!flex !w-full [--react-international-phone-height:3.25rem] [--react-international-phone-border-radius:1.15rem] [--react-international-phone-border-color:rgba(15,23,42,0.85)] [--react-international-phone-background-color:#fff] [--react-international-phone-text-color:#020617] [--react-international-phone-dropdown-item-text-color:#0f172a] [--react-international-phone-dropdown-item-background-color:#fff] [--react-international-phone-dropdown-item-hover-background-color:#f1f5f9] [--react-international-phone-dropdown-item-dial-code-color:#475569] [--react-international-phone-country-selector-background-color:#fff] [--react-international-phone-country-selector-background-color-hover:#f8fafc] [--react-international-phone-country-selector-border-color:rgba(15,23,42,0.85)] [--react-international-phone-country-selector-border-radius:1.15rem_0_0_1.15rem] [--react-international-phone-input-border-color:rgba(15,23,42,0.85)] [--react-international-phone-input-border-radius:0_1.15rem_1.15rem_0] [--react-international-phone-dropdown-shadow:0_18px_50px_rgba(15,23,42,0.16)] sm:[--react-international-phone-height:3.75rem] sm:[--react-international-phone-border-radius:1.4rem] sm:[--react-international-phone-country-selector-border-radius:1.4rem_0_0_1.4rem] sm:[--react-international-phone-input-border-radius:0_1.4rem_1.4rem_0] lg:[--react-international-phone-height:4.35rem]",
  phoneInputField:
    "!h-[3.25rem] !min-h-[3.25rem] !w-full !flex-1 !text-[clamp(0.9rem,3.6vw,1.05rem)] !text-slate-950 placeholder:!text-slate-700 sm:!h-[3.75rem] sm:!min-h-[3.75rem] lg:!h-[4.35rem] lg:!min-h-[4.35rem] lg:!text-[1.2rem]",
  phoneCountryButton:
    "!h-[3.25rem] !min-h-[3.25rem] !shrink-0 !border-2 !border-slate-700/85 focus:!border-primary-light sm:!h-[3.75rem] sm:!min-h-[3.75rem] lg:!h-[4.35rem] lg:!min-h-[4.35rem]",
  fieldWrapper:
    "h-[3.25rem] rounded-[1.15rem] border-2 border-slate-700/85 bg-white px-3 focus-within:!border-primary-light focus-within:ring-4 focus-within:ring-emerald-100 sm:h-[3.75rem] sm:rounded-[1.4rem] sm:px-4 lg:h-[4.35rem]",
  fieldInput:
    "text-[clamp(0.9rem,3.6vw,1.05rem)] !text-slate-950 placeholder:!text-slate-700 lg:text-[1.2rem]",
  fieldIcon: "h-5 w-5 text-slate-700 sm:h-6 sm:w-6",
  stepper: "mt-4 rounded-[1.1rem] border border-slate-200 bg-slate-50/85 p-2.5 sm:mt-5 sm:rounded-[1.4rem] sm:p-4 lg:mt-6",
  stepperList: "grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4",
  stepperItem:
    "flex min-w-0 items-center gap-2 rounded-[0.9rem] px-2 py-2 text-left transition sm:flex-col sm:gap-3 sm:rounded-[1rem] sm:px-3 sm:py-3 sm:text-center",
  stepperItemActive: "bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)]",
  stepperItemDone: "bg-emerald-50",
  stepperItemPending: "bg-transparent",
  stepBadge:
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold sm:mt-0.5 sm:h-9 sm:w-9 sm:text-sm",
  stepBadgeActive: "border-primary-light bg-primary-light text-white",
  stepBadgeDone: "border-emerald-200 bg-emerald-500 text-white",
  stepBadgePending: "border-slate-300 bg-white text-slate-600",
  stepCopy: "min-w-0 text-left sm:text-center",
  stepTitle: "break-words text-[clamp(0.68rem,2.6vw,0.875rem)] font-semibold leading-tight text-slate-900",
  stepDescription: "mt-1 text-xs leading-5 text-slate-500",

  stepSection: "mt-4 sm:mt-5 lg:mt-6",
  stepHeading: "text-left text-[clamp(1rem,4vw,1.25rem)] !text-slate-900",
  stepText: "mt-2 text-[clamp(0.82rem,3vw,0.95rem)] leading-6 !text-slate-600",
  stepGrid: "mt-4 grid gap-3 sm:mt-5 sm:gap-4 md:grid-cols-2",
  stepGridSingle: "mt-4 grid gap-3 sm:mt-5 sm:gap-4",
  stepNote:
    "mt-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600",

  selectContainer: "",
  selectLabel:
    "mb-2 block text-[clamp(0.78rem,2.8vw,0.875rem)] font-medium leading-5 text-[var(--foreground)]",
  selectWrapper:
    "flex h-[3.25rem] items-center rounded-[1.15rem] border-2 border-slate-700/85 bg-white px-3 focus-within:!border-primary-light focus-within:ring-4 focus-within:ring-emerald-100 sm:h-[3.75rem] sm:rounded-[1.4rem] sm:px-4 lg:h-[4.35rem]",
  selectWrapperError:
    "!border-[var(--color-danger)] focus-within:!border-[var(--color-danger)] focus-within:!ring-[rgba(185,28,28,0.12)]",
  selectField:
    "h-full w-full bg-transparent text-[clamp(0.9rem,3.6vw,1.05rem)] text-slate-950 outline-none lg:text-[1.2rem]",
  nativeInput:
    "h-[3.25rem] w-full rounded-[1.15rem] border-2 border-slate-700/85 bg-white px-3 text-[clamp(0.9rem,3.6vw,1.05rem)] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-light focus:ring-4 focus:ring-emerald-100 sm:h-[3.75rem] sm:rounded-[1.4rem] sm:px-4 lg:h-[4.35rem] lg:text-[1.2rem]",
  selectIcon: "mr-3 flex shrink-0 items-center justify-center text-slate-700",
  selectError:
    "mt-2 text-sm font-medium leading-5 text-[var(--color-danger)]",
  fieldError:
    "mt-2 text-sm font-medium leading-5 text-[var(--color-danger)]",
  phoneInputErrorRoot:
    "[--react-international-phone-border-color:var(--color-danger)] [--react-international-phone-country-selector-border-color:var(--color-danger)] [--react-international-phone-input-border-color:var(--color-danger)]",

  stepActions: "mt-4 flex items-center justify-between gap-3 sm:mt-6",
  secondaryActionButton:
    "!h-11 !w-11 !min-w-0 !rounded-full !border-2 !border-slate-200 !bg-white !p-0 !text-[1rem] !font-bold uppercase tracking-[0.08em] !text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-[1px] hover:!bg-white hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)] sm:!h-[3.75rem] sm:!w-auto sm:!min-w-[13rem] sm:!rounded-[1.25rem] sm:!px-6 lg:!h-[4.4rem] lg:!text-[1.08rem]",
  primaryActionButton:
    "!h-11 !w-11 !min-w-0 !rounded-full !p-0 sm:!h-[3.75rem] sm:!w-auto sm:!min-w-[13rem] sm:!rounded-[1.25rem] sm:!px-6 lg:!h-[4.4rem]",
  finalActionButton:
    "w-full px-4 sm:w-auto sm:min-w-[13rem]",
  submitButton:
    "!h-11 !rounded-full !border-0 !bg-[linear-gradient(180deg,#a7d84e_0%,#7ebb2b_100%)] !text-[0.95rem] font-bold uppercase tracking-[0.08em] !text-white shadow-[0_18px_40px_rgba(126,187,43,0.34)] transition hover:-translate-y-[1px] hover:shadow-[0_22px_50px_rgba(126,187,43,0.42)] disabled:cursor-not-allowed disabled:opacity-70 sm:!h-[3.75rem] sm:!rounded-[1.25rem] sm:!px-6 sm:!text-[1rem] lg:!h-[4.4rem] lg:!text-[1.28rem]",
  actionLabel: "hidden sm:inline",
  actionIcon: "h-5 w-5 sm:hidden",

  footerLink:
    "font-semibold text-sky-800 transition hover:text-sky-950",
  footer: "mt-4 text-center sm:mt-6 lg:mt-7",
  footerText: "text-[clamp(0.78rem,3vw,1rem)] leading-5 !text-slate-800 lg:text-[1.12rem]",
  uploadField:
    "relative",
  uploadTrigger:
    "flex h-[3.25rem] cursor-pointer items-center gap-3 rounded-[1.15rem] border-2 border-slate-700/85 bg-white px-3 transition hover:border-primary-light focus-within:border-primary-light focus-within:ring-4 focus-within:ring-emerald-100 sm:h-[3.75rem] sm:rounded-[1.4rem] sm:px-4 lg:h-[4.35rem]",
  uploadIcon:
    "flex shrink-0 items-center justify-center text-slate-700",
  uploadCopy: "min-w-0",
  uploadLabel: "block text-[clamp(0.78rem,2.8vw,0.875rem)] font-medium text-slate-900",
  uploadValue:
    "truncate text-[clamp(0.78rem,2.8vw,0.875rem)] leading-6 !text-slate-500 lg:text-[1rem]",
  uploadHelp: "mt-2 text-[clamp(0.78rem,2.8vw,0.875rem)] leading-6 text-slate-500",
  uploadMeta: "mt-2 break-all text-xs font-medium leading-5 text-emerald-700",
  uploadRemoveButton:
    "absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-900",
  documentToolbar: "mt-5 grid gap-4 md:grid-cols-2",
  documentUploadGrid: "mt-4 grid gap-4 md:grid-cols-2",
  documentSelectedList: "mt-4 flex flex-wrap gap-3",
  documentChip:
    "inline-flex items-center gap-2 rounded-full bg-transparent px-0 py-0 text-sm text-emerald-700",
  documentChipName: "max-w-[12rem] truncate font-semibold",
  documentChipRemove:
    "inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200 hover:text-emerald-950",
};
