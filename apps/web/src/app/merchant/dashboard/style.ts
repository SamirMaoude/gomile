export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const styles = {
  page: "flex min-h-screen flex-col transition-colors",
  pageLight: "bg-[#edf3e7] text-slate-900",
  pageDark: "bg-slate-950 text-slate-100",

  layout: "flex flex-1 flex-col lg:flex-row",
  layoutFooterBelowViewport: "flex min-h-screen flex-col lg:flex-row",

  sidebar: "shrink-0 transition-[width] duration-300 lg:flex lg:flex-col lg:border-r",
  sidebarExpanded: "flex w-full flex-col border-b lg:w-[19rem] lg:border-b-0",
  sidebarCollapsed: "hidden lg:flex lg:w-[5.75rem]",
  sidebarLight: "border-slate-200 bg-white",
  sidebarDark: "border-slate-800 bg-slate-900",

  sidebarHeader: "flex min-h-[5.6rem] items-center justify-center border-b px-6 py-6",
  sidebarHeaderCollapsed: "justify-center px-3",
  sidebarHeaderLight: "border-slate-200",
  sidebarHeaderDark: "border-slate-800",

  sidebarToggle:
    "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-offset-2",
  sidebarToggleLight:
    "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-[#86ba2f]/30",
  sidebarToggleDark:
    "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 focus:ring-emerald-500/30",
  sidebarNav: "grid justify-items-start gap-3 px-4 py-4 lg:py-6",
  sidebarNavCollapsed: "justify-items-center px-3",
  sidebarNavItems: "grid w-full gap-3",

  mainPanel: "min-w-0 flex-1",
  main: "min-w-0 px-3 py-4 sm:px-6 lg:px-8 lg:py-6",

  topBar: "mb-6 flex flex-wrap items-center gap-3",
  mobileLogoWrapper: "lg:hidden",
  mobileLogoLink: "inline-flex items-center rounded-[1.2rem] px-2 py-1",

  toolbar: "ml-auto flex items-center gap-3",
  headerActions: "relative z-[2100] ml-auto flex items-center gap-2 sm:gap-3",
  upgradeLink:
    "inline-flex min-h-12 items-center gap-2 rounded-full border px-2 py-1 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 max-[380px]:hidden",
  subscriptionPill:
    "inline-flex min-h-12 items-center gap-2 rounded-full border px-2 py-1 shadow-sm max-[380px]:hidden",
  upgradeLinkLight:
    "border-[#d6e7b9] bg-[linear-gradient(135deg,#f6fbeb_0%,#ebf6d4_100%)] text-slate-900 shadow-[0_12px_30px_rgba(112,146,47,0.12)] hover:border-[#bfd98f] hover:shadow-[0_16px_34px_rgba(112,146,47,0.18)] focus:ring-[#86ba2f]/30",
  upgradeLinkDark:
    "border-emerald-700 bg-[linear-gradient(135deg,#0f2b22_0%,#12382b_100%)] text-emerald-50 shadow-[0_12px_30px_rgba(0,0,0,0.26)] hover:border-emerald-500 hover:shadow-[0_16px_34px_rgba(16,185,129,0.14)] focus:ring-emerald-500/30",
  subscriptionPillLight:
    "border-[#d6e7b9] bg-white text-slate-900 shadow-[0_12px_30px_rgba(112,146,47,0.1)]",
  subscriptionPillDark:
    "border-emerald-800 bg-slate-900 text-emerald-50 shadow-[0_12px_30px_rgba(0,0,0,0.22)]",
  upgradeIconWrap:
    "inline-flex h-10 w-10 items-center justify-center rounded-full border shrink-0",
  upgradeIconWrapLight: "border-[#cfe4a8] bg-white text-[#6a9722]",
  upgradeIconWrapDark: "border-emerald-600/70 bg-emerald-500/10 text-emerald-300",
  upgradeIcon: "h-5 w-5",
  upgradeCopy: "flex min-w-0 flex-col items-start justify-center",
  upgradeTitle: "hidden font-display text-[0.9rem] font-bold leading-none sm:block",
  upgradeArrow: "hidden h-4 w-4 shrink-0 opacity-75 sm:block",

  modeToggle: "inline-flex items-center rounded-full border p-1 shadow-sm",
  modeToggleLight: "border-slate-200 bg-white",
  modeToggleDark: "border-slate-700 bg-slate-900",

  modeButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
  modeButtonActiveLight:
    "bg-[#86ba2f] text-white shadow-[0_8px_18px_rgba(134,186,47,0.28)]",
  modeButtonActiveDark:
    "bg-slate-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.35)]",
  modeButtonInactiveLight: "text-slate-600 hover:bg-slate-100",
  modeButtonInactiveDark: "text-slate-300 hover:bg-slate-800",

  profileMenuWrapper: "relative z-[2200]",

  profileTrigger:
    "flex items-center rounded-full border p-1 shadow-sm",
  profileTriggerLight: "border-slate-200 bg-white",
  profileTriggerDark: "border-slate-700 bg-slate-900",

  profileAvatar:
    "flex min-h-11 min-w-11 max-w-[9rem] items-center justify-center rounded-full px-3 text-xs font-bold transition sm:text-sm",
  profileAvatarLight: "bg-[#86ba2f] text-white hover:bg-[#79ab29]",
  profileAvatarDark: "bg-emerald-700 text-white hover:bg-emerald-600",

  profileNameWrapper: "hidden",
  profileName: "text-sm font-semibold",
  profileNameLight: "text-slate-900",
  profileNameDark: "!text-white",

  dropdown:
    "absolute right-0 top-[calc(100%+0.75rem)] z-[2300] w-[18rem] rounded-[1.4rem] border p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)]",
  dropdownLight: "border-slate-200 bg-white",
  dropdownDark: "border-slate-800 bg-slate-900",

  dropdownHeader: "mb-3 rounded-[1rem] px-3 py-3",
  dropdownHeaderLight: "bg-slate-50",
  dropdownHeaderDark: "bg-slate-800",

  dropdownNav: "grid gap-2",

  profileLink:
    "flex items-center gap-3 rounded-[1.05rem] border px-3 py-3 text-left text-sm font-semibold transition",
  profileLinkLight:
    "border-transparent text-slate-800 hover:border-slate-200 hover:bg-slate-50",
  profileLinkDark:
    "border-transparent text-slate-200 hover:border-slate-700 hover:bg-slate-800",
  profileLinkIconWrapper:
    "inline-flex h-8 w-8 items-center justify-center rounded-full",
  profileLinkIconWrapperLight: "bg-[#f7fbe9] text-[#628e20]",
  profileLinkIconWrapperDark: "bg-emerald-900/40 text-emerald-300",

  logoutButton:
    "flex items-center gap-3 rounded-[1.05rem] border px-3 py-3 text-left text-sm font-semibold transition",
  logoutButtonLight: "border-slate-200 text-rose-600 hover:bg-rose-50",
  logoutButtonDark: "border-slate-700 text-rose-300 hover:bg-slate-800",
  logoutButtonDisabled: "cursor-not-allowed opacity-70",
  logoutIconWrapper:
    "inline-flex h-8 w-8 items-center justify-center rounded-full bg-current/10",

  surfaceCard:
    "rounded-[1.25rem] border p-3 shadow-[0_18px_50px_rgba(88,117,52,0.08)] sm:rounded-[2rem] sm:p-5 lg:p-6",
  surfaceCardLight: "border-[#d9e7cf] bg-white",
  surfaceCardDark: "border-slate-800 bg-slate-900",

  mapGrid:
    "grid gap-5 xl:grid-cols-[minmax(0,1.95fr)_minmax(18rem,0.68fr)]",

  mapSection:
    "relative z-0 min-h-[22rem] overflow-hidden rounded-[1.25rem] border shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:min-h-[32rem] sm:rounded-[1.75rem] lg:min-h-[42rem]",
  mapSectionLight: "border-[#d6dfcf] bg-[#f8f8f1]",
  mapSectionDark: "border-slate-800 bg-slate-950",

  deliveriesSection:
    "rounded-[1.75rem] border shadow-[0_16px_40px_rgba(15,23,42,0.06)]",
  deliveriesSectionLight: "border-[#d6dfcf] bg-white",
  deliveriesSectionDark: "border-slate-800 bg-slate-900",

  handshakeSection:
    "rounded-[1.75rem] border shadow-[0_16px_40px_rgba(15,23,42,0.06)]",
  handshakeSectionLight: "border-[#d6dfcf] bg-white",
  handshakeSectionDark: "border-slate-800 bg-slate-900",
  handshakeHeader: "border-b px-4 py-4",
  handshakeHeaderLight: "border-slate-200",
  handshakeHeaderDark: "border-slate-800",
  handshakeDescription: "mt-2 text-sm leading-6",
  handshakeForm: "grid gap-3 px-4 py-4",
  handshakeFieldGroup: "grid gap-2",
  handshakeLabel: "text-sm font-semibold",
  handshakeSelect:
    "min-h-[3rem] rounded-[0.85rem] border px-3 text-[0.95rem] outline-none transition",
  handshakeInput:
    "min-h-[3rem] rounded-[0.85rem] border px-3 text-[0.95rem] outline-none transition",
  handshakeControlLight:
    "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#86ba2f] focus:ring-4 focus:ring-[#86ba2f]/10",
  handshakeControlDark:
    "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10",
  handshakeFeedback: "rounded-[1rem] border px-4 py-3 text-sm font-medium",
  handshakeSuccessLight: "border-emerald-200 bg-emerald-50 text-emerald-700",
  handshakeSuccessDark:
    "border-emerald-900 bg-emerald-950/60 text-emerald-300",
  handshakeErrorLight: "border-rose-200 bg-rose-50 text-rose-700",
  handshakeErrorDark: "border-rose-900 bg-rose-950/60 text-rose-300",
  handshakeButton: "!w-full !justify-center !text-sm",

  activityPanelBody: "grid max-h-[36rem] gap-5 overflow-y-auto px-4 py-4",
  activityTitle: "font-display text-[1.25rem] font-bold sm:text-[1.55rem]",
  activityGroup: "grid gap-3",
  activityGroupTitle: "text-base font-bold",
  activityList: "grid gap-2.5",
  activityItem:
    "grid gap-1 rounded-[1rem] border px-3 py-3",
  notificationItem:
    "flex gap-3 rounded-[1rem] border px-3 py-3",
  notificationIcon:
    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
  notificationIconSvg: "h-[1.125rem] w-[1.125rem]",
  notificationContent: "grid min-w-0 flex-1 gap-1",
  activityItemHeader: "flex flex-wrap items-center justify-between gap-2",
  activityPill:
    "rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[#5f8f1f]",
  activityText:
    "line-clamp-2 text-sm leading-5 !text-inherit",
  activityMeta: "text-xs leading-5",
  overviewListsGrid: "mt-6 grid gap-5 xl:grid-cols-2",
  topListCard: "!p-0 overflow-hidden",
  topListBody: "px-4 py-4",

  deliveriesHeader: "border-b px-5 py-5",
  deliveriesHeaderLight: "border-slate-200",
  deliveriesHeaderDark: "border-slate-800",

  sectionTitle: "font-display text-[1.45rem] font-bold sm:text-[2rem]",

  tableOverflow: "overflow-x-auto",
  deliveriesTableMin: "min-w-[44rem]",

  deliveriesTableHead:
    "grid grid-cols-[9.5rem_1.4fr_1.1fr_1fr] gap-3 border-b px-5 py-4 text-sm font-semibold xl:text-[1.05rem]",
  deliveriesTableHeadLight: "border-slate-200 text-slate-700",
  deliveriesTableHeadDark: "border-slate-800 text-slate-300",

  deliveriesDividerLight: "divide-y divide-slate-200",
  deliveriesDividerDark: "divide-y divide-slate-800",

  deliveryRow:
    "grid grid-cols-[9.5rem_1.4fr_1.1fr_1fr] gap-3 px-5 py-4 text-sm xl:text-[1.02rem]",
  deliveryIdentity: "flex items-center gap-3",
  deliveryAvatar:
    "flex h-12 w-12 items-center justify-center rounded-full text-base font-bold",
  deliveryId: "font-display text-[1.2rem] font-bold leading-none",
  deliveryDestination: "flex items-center font-medium",
  deliveryStatusWrap: "flex items-center",
  deliveryEtaWrap: "flex items-center text-[1.08rem] font-semibold",
  deliveryNoteLight: "block text-sm font-medium text-slate-500",
  deliveryNoteDark: "block text-sm font-medium text-slate-400",

  statusBadge:
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
  statusLateLight: "bg-amber-50 text-amber-700",
  statusLateDark: "bg-amber-950/60 text-amber-300",
  statusOnTimeLight: "bg-emerald-50 text-emerald-700",
  statusOnTimeDark: "bg-emerald-950/60 text-emerald-300",
  statusLateIcon: "text-amber-500",
  statusOnTimeIcon: "text-emerald-500",

  deliveriesCard: "mt-6",
  deliveriesHandshakeBlock: "mb-6",

  navbarItemBase:
    "flex items-center gap-3 rounded-[1.05rem] border font-semibold transition",
  navbarItemCompact: "px-3 py-3 text-sm",
  navbarItemDefault: "px-4 py-4 text-sm xl:text-[1.05rem]",
  navbarItemCollapsed: "justify-center px-3 py-3",
  navbarLabelCollapsed: "sr-only",

  navbarItemActiveLight:
    "border-[#8cb83f] bg-[#f7fbe9] text-slate-950 shadow-[0_6px_18px_rgba(136,176,56,0.12)]",
  navbarItemActiveDark:
    "border-emerald-700 bg-emerald-900/40 text-white shadow-[0_6px_18px_rgba(0,0,0,0.2)]",

  navbarItemInactiveLight:
    "border-transparent text-slate-800 hover:border-slate-200 hover:bg-slate-50",
  navbarItemInactiveDark:
    "border-transparent text-slate-200 hover:border-slate-700 hover:bg-slate-800",

  navbarIconActiveLight: "text-[#628e20]",
  navbarIconActiveDark: "text-emerald-300",
  navbarIconInactiveLight: "text-slate-500",
  navbarIconInactiveDark: "text-slate-400",

  iconLarge: "h-6 w-6",
  iconMedium: "h-5 w-5",
};
