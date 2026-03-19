"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import { logout } from "@/lib/auth-client";
import GrenobleDeliveryMap, {
  type DeliveryMapMarkerData,
} from "@/components/dashboard/grenoble-delivery-map";
import Footer from "@/components/ui/design-system/header_footer/footer";

type ThemeMode = "light" | "dark";
type DeliveryStatus = "En route" | "En retard";
type IncidentState = "EN COURS" | "ANNULE";

type MenuItem = {
  label: string;
  href: string;
  icon: () => ReactElement;
  active?: boolean;
};

type DeliveryItem = {
  id: string;
  destination: string;
  status: DeliveryStatus;
  eta: string;
  note?: string;
  initials: string;
  avatarClass: string;
};

type IncidentItem = {
  id: string;
  type: string;
  description: string;
  state: IncidentState;
};

const menuItems: MenuItem[] = [
  { label: "Vue d'ensemble", href: "/client/dashboard", icon: HomeIcon },
  { label: "Mes commandes", href: "/client/dashboard", icon: ShopIcon },
  {
    label: "Suivi livraisons",
    href: "/client/dashboard",
    icon: DeliveryTruckIcon,
    active: true,
  },
  { label: "Alertes client", href: "/client/dashboard", icon: AlertIcon },
  { label: "Parametres", href: "/client/dashboard", icon: SettingsIcon },
];

const activeDeliveries: DeliveryItem[] = [
  {
    id: "#4101",
    destination: "14 rue de l'Opera",
    status: "En route",
    eta: "11:30 h",
    initials: "AD",
    avatarClass: "bg-sky-100 text-sky-900",
  },
  {
    id: "#4102",
    destination: "8 Pl. de la Bastille",
    status: "En retard",
    eta: "11:46 h",
    note: "(etait 11:30)",
    initials: "SM",
    avatarClass: "bg-amber-100 text-amber-900",
  },
  {
    id: "#4103",
    destination: "21 avenue Victor Hugo",
    status: "En route",
    eta: "12:05 h",
    initials: "LN",
    avatarClass: "bg-emerald-100 text-emerald-900",
  },
];

const incidents: IncidentItem[] = [
  {
    id: "#4102",
    type: "Retard planifie",
    description: "Preparation plus longue que prevu cote commercant.",
    state: "EN COURS",
  },
  {
    id: "#4099",
    type: "Livraison annulee",
    description: "Produit indisponible avant recuperation de la commande.",
    state: "ANNULE",
  },
];

const deliveryMapMarkers: DeliveryMapMarkerData[] = [
  {
    id: "#4101",
    lat: 45.1908,
    lng: 5.7199,
    tone: "green",
    destination: "14 rue de l'Opera",
    eta: "11:30 h",
    status: "En route",
  },
  {
    id: "#4102",
    lat: 45.1862,
    lng: 5.7348,
    tone: "amber",
    destination: "8 Pl. de la Bastille",
    eta: "11:46 h",
    status: "En retard",
  },
  {
    id: "#4103",
    lat: 45.1945,
    lng: 5.7146,
    tone: "green",
    destination: "21 avenue Victor Hugo",
    eta: "12:05 h",
    status: "En route",
  },
  {
    id: "#4115",
    lat: 45.1918,
    lng: 5.7424,
    tone: "green",
    destination: "Cours Jean Jaures",
    eta: "12:12 h",
    status: "En route",
  },
  {
    id: "#992",
    lat: 45.1788,
    lng: 5.7212,
    tone: "green",
    destination: "Place Championnet",
    eta: "12:18 h",
    status: "En route",
  },
  {
    id: "#98",
    lat: 45.1808,
    lng: 5.7308,
    tone: "red",
    destination: "Quai Saint-Laurent",
    eta: "Incident",
    status: "Incident",
  },
  {
    id: "#499",
    lat: 45.1735,
    lng: 5.7131,
    tone: "red",
    destination: "Secteur Berriat",
    eta: "Incident",
    status: "Incident",
  },
  {
    id: "#12",
    lat: 45.1796,
    lng: 5.7459,
    tone: "amber",
    destination: "Ile Verte",
    eta: "12:24 h",
    status: "Attention",
  },
];

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13V10.5" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path d="M4 9.5 5.5 5h13L20 9.5" />
      <path d="M5 10h14v9.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5V10Z" />
      <path d="M9 14h6" />
    </svg>
  );
}

function DeliveryTruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path d="M3 7h10v8H3Z" />
      <path d="M13 10h4l3 3v2h-7Z" />
      <circle cx="8" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <path d="M12 3 21 19H3L12 3Z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.3M12 18.9v2.3M21.2 12h-2.3M5.1 12H2.8M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M20.2 14.2A8.7 8.7 0 1 1 9.8 3.8a7.1 7.1 0 1 0 10.4 10.4Z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.2 2.4 2.4 4.8-5.2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5l3 2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4">
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 16l4-4-4-4" />
      <path d="M14 12H4" />
    </svg>
  );
}

function MenuLink({
  href,
  label,
  active,
  icon: Icon,
  compact = false,
  onNavigate,
  isDarkMode,
}: {
  href: string;
  label: string;
  active?: boolean;
  icon: () => ReactElement;
  compact?: boolean;
  onNavigate?: () => void;
  isDarkMode: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "flex items-center gap-3 rounded-[1.05rem] border font-semibold transition",
        compact ? "px-3 py-3 text-sm" : "px-4 py-4 text-[1.05rem]",
        active
          ? isDarkMode
            ? "border-emerald-700 bg-emerald-900/40 text-white shadow-[0_6px_18px_rgba(0,0,0,0.2)]"
            : "border-[#8cb83f] bg-[#f7fbe9] text-slate-950 shadow-[0_6px_18px_rgba(136,176,56,0.12)]"
          : isDarkMode
            ? "border-transparent text-slate-200 hover:border-slate-700 hover:bg-slate-800"
            : "border-transparent text-slate-800 hover:border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      <span
        className={
          active
            ? isDarkMode
              ? "text-emerald-300"
              : "text-[#628e20]"
            : isDarkMode
              ? "text-slate-400"
              : "text-slate-500"
        }
      >
        <Icon />
      </span>
      <span>{label}</span>
    </Link>
  );
}

function StatusBadge({
  status,
  isDarkMode,
}: {
  status: DeliveryStatus;
  isDarkMode: boolean;
}) {
  const isLate = status === "En retard";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
        isLate
          ? isDarkMode
            ? "bg-amber-950/60 text-amber-300"
            : "bg-amber-50 text-amber-700"
          : isDarkMode
            ? "bg-emerald-950/60 text-emerald-300"
            : "bg-emerald-50 text-emerald-700",
      ].join(" ")}
    >
      <span className={isLate ? "text-amber-500" : "text-emerald-500"}>
        {isLate ? <ClockIcon /> : <CheckCircleIcon />}
      </span>
      {status}
    </span>
  );
}

function IncidentBadge({ state }: { state: IncidentState }) {
  return (
    <span
      className={[
        "inline-flex min-w-[7rem] items-center justify-center rounded-full px-4 py-2 text-sm font-bold tracking-[0.05em] text-white",
        state === "ANNULE"
          ? "bg-[linear-gradient(180deg,#d95757_0%,#b92d2d_100%)]"
          : "bg-[linear-gradient(180deg,#f5b34b_0%,#d8901f_100%)]",
      ].join(" ")}
    >
      {state}
    </span>
  );
}

function ModeToggle({
  theme,
  onChange,
  isDarkMode,
}: {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
  isDarkMode: boolean;
}) {
  return (
    <div
      className={[
        "inline-flex items-center rounded-full border p-1 shadow-sm",
        isDarkMode
          ? "border-slate-700 bg-slate-900"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onChange("light")}
        aria-label="Mode lumiere"
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
          theme === "light"
            ? "bg-[#86ba2f] text-white shadow-[0_8px_18px_rgba(134,186,47,0.28)]"
            : isDarkMode
              ? "text-slate-300 hover:bg-slate-800"
              : "text-slate-600 hover:bg-slate-100",
        ].join(" ")}
      >
        <SunIcon />
      </button>
      <button
        type="button"
        onClick={() => onChange("dark")}
        aria-label="Mode sombre"
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
          theme === "dark"
            ? "bg-slate-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.35)]"
            : isDarkMode
              ? "text-slate-300 hover:bg-slate-800"
              : "text-slate-600 hover:bg-slate-100",
        ].join(" ")}
      >
        <MoonIcon />
      </button>
    </div>
  );
}

function SurfaceCard({
  children,
  className,
  isDarkMode,
}: {
  children: ReactNode;
  className?: string;
  isDarkMode: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[2rem] border p-5 shadow-[0_18px_50px_rgba(88,117,52,0.08)] lg:p-6",
        isDarkMode
          ? "border-slate-800 bg-slate-900"
          : "border-[#d9e7cf] bg-white",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function ClientDashboardShell() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [username, setUsername] = useState("Client");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isDarkMode = theme === "dark";
  const initials =
    username
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk.charAt(0).toUpperCase())
      .join("") || "CL";

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("dashboardTheme");
    const storedUsername = window.localStorage.getItem("username");

    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }

    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("dashboardTheme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();

      const Swal = (await import("sweetalert2")).default;

      window.localStorage.removeItem("username");
      setUsername("Client");
      setProfileMenuOpen(false);

      await Swal.fire({
        icon: "success",
        title: "Vous etes deconnecte",
        text: "Vous etes deconnectes.",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      router.replace("/");
      router.refresh();
    } catch (error) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "error",
        title: "Deconnexion impossible",
        text:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue pendant la deconnexion.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div
      className={[
        "flex min-h-screen flex-col transition-colors",
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-[#edf3e7] text-slate-900",
      ].join(" ")}
    >
      <div className="flex flex-1">
        <aside
          className={[
            "hidden border-r lg:flex lg:w-[19rem] lg:flex-col",
            isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white",
          ].join(" ")}
        >
          <div
            className={[
              "border-b px-6 py-6",
              isDarkMode ? "border-slate-800" : "border-slate-200",
            ].join(" ")}
          >
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/svg/Logo2.svg"
                alt="Logo GoMile"
                width={190}
                height={72}
                className="h-auto w-[10.8rem]"
                priority
              />
            </Link>
          </div>

          <nav className="grid gap-3 px-4 py-5">
            {menuItems.map((item) => (
              <MenuLink
                key={item.label}
                href={item.href}
                label={item.label}
                active={item.active}
                icon={item.icon}
                isDarkMode={isDarkMode}
              />
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="lg:hidden">
                <Link href="/" className="inline-flex items-center rounded-[1.2rem] px-2 py-1">
                  <Image
                    src="/svg/Logo2.svg"
                    alt="Logo GoMile"
                    width={170}
                    height={64}
                    className="h-auto w-[9.6rem]"
                    priority
                  />
                </Link>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <ModeToggle
                  theme={theme}
                  onChange={setTheme}
                  isDarkMode={isDarkMode}
                />

                <div ref={menuRef} className="relative">
                  <div
                    className={[
                      "flex items-center gap-3 rounded-full border px-2 py-1.5 shadow-sm",
                      isDarkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => setProfileMenuOpen((value) => !value)}
                      aria-haspopup="menu"
                      aria-expanded={profileMenuOpen}
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold transition",
                        isDarkMode
                          ? "bg-emerald-700 text-white hover:bg-emerald-600"
                          : "bg-[#86ba2f] text-white hover:bg-[#79ab29]",
                      ].join(" ")}
                    >
                      {initials}
                    </button>

                    <div className="hidden pr-2 sm:block">
                      <p
                        className={[
                          "text-sm font-semibold",
                          isDarkMode ? "text-slate-100" : "text-slate-900",
                        ].join(" ")}
                      >
                        {username}
                      </p>
                    </div>
                  </div>

                  {profileMenuOpen ? (
                    <div
                      className={[
                        "absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[18rem] rounded-[1.4rem] border p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)]",
                        isDarkMode
                          ? "border-slate-800 bg-slate-900"
                          : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "mb-3 rounded-[1rem] px-3 py-3",
                          isDarkMode ? "bg-slate-800" : "bg-slate-50",
                        ].join(" ")}
                      >
                        <p className="text-sm font-semibold">{username}</p>
                      </div>

                      <div className="grid gap-2">
                        {menuItems.map((item) => (
                          <MenuLink
                            key={`dropdown-${item.label}`}
                            href={item.href}
                            label={item.label}
                            active={item.active}
                            icon={item.icon}
                            compact={true}
                            onNavigate={() => setProfileMenuOpen(false)}
                            isDarkMode={isDarkMode}
                          />
                        ))}

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className={[
                            "flex items-center gap-3 rounded-[1.05rem] border px-3 py-3 text-left text-sm font-semibold transition",
                            isDarkMode
                              ? "border-slate-700 text-rose-300 hover:bg-slate-800"
                              : "border-slate-200 text-rose-600 hover:bg-rose-50",
                            isLoggingOut ? "cursor-not-allowed opacity-70" : "",
                          ].join(" ")}
                        >
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-current/10">
                            <LogoutIcon />
                          </span>
                          <span>
                            {isLoggingOut ? "Deconnexion..." : "Deconnexion"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <SurfaceCard isDarkMode={isDarkMode}>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(23rem,0.95fr)]">
                <section
                  className={[
                    "relative min-h-[42rem] overflow-hidden rounded-[1.75rem] border shadow-[0_16px_40px_rgba(15,23,42,0.06)]",
                    isDarkMode
                      ? "border-slate-800 bg-slate-950"
                      : "border-[#d6dfcf] bg-[#f8f8f1]",
                  ].join(" ")}
                >
                  <GrenobleDeliveryMap markers={deliveryMapMarkers} />
                </section>

                <section
                  className={[
                    "rounded-[1.75rem] border shadow-[0_16px_40px_rgba(15,23,42,0.06)]",
                    isDarkMode
                      ? "border-slate-800 bg-slate-900"
                      : "border-[#d6dfcf] bg-white",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "border-b px-5 py-5",
                      isDarkMode ? "border-slate-800" : "border-slate-200",
                    ].join(" ")}
                  >
                    <h3 className="font-display text-[2rem] font-bold">
                      Liste des livraisons actives
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[44rem]">
                      <div
                        className={[
                          "grid grid-cols-[8rem_1.4fr_1.1fr_1fr] gap-3 border-b px-5 py-4 text-[1.05rem] font-semibold",
                          isDarkMode
                            ? "border-slate-800 text-slate-300"
                            : "border-slate-200 text-slate-700",
                        ].join(" ")}
                      >
                        <span>ID</span>
                        <span>Destination</span>
                        <span>Statut</span>
                        <span>Heure prevue</span>
                      </div>

                      <div className={isDarkMode ? "divide-y divide-slate-800" : "divide-y divide-slate-200"}>
                        {activeDeliveries.map((delivery) => (
                          <div
                            key={delivery.id}
                            className="grid grid-cols-[8rem_1.4fr_1.1fr_1fr] gap-3 px-5 py-4 text-[1.02rem]"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={[
                                  "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold",
                                  delivery.avatarClass,
                                ].join(" ")}
                              >
                                {delivery.initials}
                              </div>
                              <span className="font-display text-[1.9rem] font-bold leading-none">
                                {delivery.id}
                              </span>
                            </div>

                            <div className="flex items-center font-medium">
                              {delivery.destination}
                            </div>

                            <div className="flex items-center">
                              <StatusBadge
                                status={delivery.status}
                                isDarkMode={isDarkMode}
                              />
                            </div>

                            <div className="flex items-center text-[1.08rem] font-semibold">
                              <div>
                                {delivery.eta}
                                {delivery.note ? (
                                  <span className={isDarkMode ? "block text-sm font-medium text-slate-400" : "block text-sm font-medium text-slate-500"}>
                                    {delivery.note}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </SurfaceCard>

            <SurfaceCard className="mt-6" isDarkMode={isDarkMode}>
              <div className={isDarkMode ? "border-b border-slate-800 pb-4" : "border-b border-slate-200 pb-4"}>
                <h2 className="font-display text-[2rem] font-bold">
                  Incidents et Alertes de Course (Client)
                </h2>
              </div>

              <div className={isDarkMode ? "mt-5 overflow-x-auto rounded-[1.5rem] border border-slate-800" : "mt-5 overflow-x-auto rounded-[1.5rem] border border-slate-200"}>
                <div className="min-w-[48rem]">
                  <div
                    className={[
                      "grid grid-cols-[8rem_10rem_minmax(0,1fr)_10rem] gap-4 px-5 py-4 text-[1.05rem] font-semibold",
                      isDarkMode
                        ? "bg-slate-950 text-slate-300"
                        : "bg-slate-50 text-slate-700",
                    ].join(" ")}
                  >
                    <span>ID Course</span>
                    <span>Type d'Alerte</span>
                    <span>Description</span>
                    <span className="text-right">Statut</span>
                  </div>

                  <div className={isDarkMode ? "divide-y divide-slate-800 bg-slate-900" : "divide-y divide-slate-200 bg-white"}>
                    {incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="grid grid-cols-[8rem_10rem_minmax(0,1fr)_10rem] gap-4 px-5 py-5 text-[1.05rem]"
                      >
                        <span className="font-display text-[1.9rem] font-bold leading-none">
                          {incident.id}
                        </span>
                        <span className={isDarkMode ? "font-semibold text-slate-300" : "font-semibold text-slate-700"}>
                          {incident.type}
                        </span>
                        <span className={isDarkMode ? "font-medium text-slate-300" : "font-medium text-slate-700"}>
                          {incident.description}
                        </span>
                        <div className="flex justify-end">
                          <IncidentBadge state={incident.state} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
