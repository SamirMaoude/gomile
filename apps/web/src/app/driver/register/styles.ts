import { styles as authStyles } from "@/app/merchant/login/styles";

export const styles = {
  ...authStyles,
  card:
    "w-full max-w-[22rem] overflow-hidden rounded-[1.8rem] shadow-[0_26px_90px_rgba(24,58,92,0.18)] sm:max-w-[38rem] lg:max-w-[76rem]",
  splitCard: "grid lg:grid-cols-[0.72fr_1.28fr]",
  stepper: "mt-6 rounded-[1.4rem] border border-slate-200 bg-slate-50/85 p-4",
  stepperList: "grid gap-3 md:grid-cols-2 xl:grid-cols-4",
  stepperItem:
    "flex flex-col items-center gap-3 rounded-[1rem] px-3 py-3 text-center transition",
  stepperItemActive: "bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)]",
  stepperItemDone: "bg-emerald-50",
  stepperItemPending: "bg-transparent",
  stepBadge:
    "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
  stepBadgeActive: "border-primary-light bg-primary-light text-white",
  stepBadgeDone: "border-emerald-200 bg-emerald-500 text-white",
  stepBadgePending: "border-slate-300 bg-white text-slate-600",
  stepCopy: "min-w-0 text-center",
  stepTitle: "text-sm font-semibold text-slate-900",
  stepDescription: "mt-1 text-xs leading-5 text-slate-500",

  stepSection: "mt-6",
  stepHeading: "text-left text-[1.25rem] !text-slate-900",
  stepText: "mt-2 text-sm leading-6 !text-slate-600",
  stepGrid: "mt-5 grid gap-4 md:grid-cols-2",
  stepGridSingle: "mt-5 grid gap-4",
  stepNote:
    "mt-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600",

  selectContainer: "",
  selectLabel:
    "mb-2 block text-sm font-medium leading-5 text-[var(--foreground)]",
  selectWrapper:
    "flex h-[3.75rem] items-center rounded-[1.4rem] border-2 border-slate-700/85 bg-white px-4 focus-within:!border-primary-light focus-within:ring-4 focus-within:ring-emerald-100 lg:h-[4.35rem]",
  selectWrapperError:
    "!border-[var(--color-danger)] focus-within:!border-[var(--color-danger)] focus-within:!ring-[rgba(185,28,28,0.12)]",
  selectField:
    "h-full w-full bg-transparent text-[1.05rem] text-slate-950 outline-none lg:text-[1.2rem]",
  nativeInput:
    "h-[3.75rem] w-full rounded-[1.4rem] border-2 border-slate-700/85 bg-white px-4 text-[1.05rem] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-light focus:ring-4 focus:ring-emerald-100 lg:h-[4.35rem] lg:text-[1.2rem]",
  selectIcon: "mr-3 flex shrink-0 items-center justify-center text-slate-700",
  selectError:
    "mt-2 text-sm font-medium leading-5 text-[var(--color-danger)]",
  fieldError:
    "mt-2 text-sm font-medium leading-5 text-[var(--color-danger)]",
  phoneInputErrorRoot:
    "[--react-international-phone-border-color:var(--color-danger)] [--react-international-phone-country-selector-border-color:var(--color-danger)] [--react-international-phone-input-border-color:var(--color-danger)]",

  stepActions: "mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between",
  secondaryActionButton:
    "!h-[3.75rem] !min-w-[13rem] !rounded-[1.25rem] !border-2 !border-slate-200 !bg-white px-6 !text-[1rem] !font-bold uppercase tracking-[0.08em] !text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-[1px] hover:!bg-white hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)] lg:!h-[4.4rem] lg:!text-[1.08rem]",
  primaryActionButton:
    "!min-w-[13rem]",

  footerLink:
    "font-semibold text-sky-800 transition hover:text-sky-950",
  uploadField:
    "relative",
  uploadTrigger:
    "flex h-[3.75rem] cursor-pointer items-center gap-3 rounded-[1.4rem] border-2 border-slate-700/85 bg-white px-4 transition hover:border-primary-light focus-within:border-primary-light focus-within:ring-4 focus-within:ring-emerald-100 lg:h-[4.35rem]",
  uploadIcon:
    "flex shrink-0 items-center justify-center text-slate-700",
  uploadCopy: "min-w-0",
  uploadLabel: "block text-sm font-medium text-slate-900",
  uploadValue:
    "truncate text-sm leading-6 !text-slate-500 lg:text-[1rem]",
  uploadHelp: "mt-2 text-sm leading-6 text-slate-500",
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
