import type { RefObject } from "react";
import Link from "next/link";
import { CircleHelp, Info, Mail } from "lucide-react";

import type { DashboardMenuItem } from "@/components/dashboard/navbar-items";
import Typography from "@/components/ui/design-system/typography";
import LogoutIcon from "@/components/ui/icons/LogoutIcon";
import { cn, styles } from "./style";

type ProfileSlotProps = {
  avatarLabel: string;
  isDarkMode: boolean;
  isLoggingOut: boolean;
  menuItems: DashboardMenuItem[];
  menuRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onLogout: () => Promise<void>;
  onToggle: () => void;
  profileMenuOpen: boolean;
  username: string;
};

const profileLinks = [
  {
    href: "/#contact",
    label: "Contact",
    icon: Mail,
  },
  {
    href: "/faq",
    label: "FAQ",
    icon: CircleHelp,
  },
  {
    href: "/enSavoirPlus",
    label: "En savoir plus",
    icon: Info,
  },
];

export default function ProfileSlot({
  avatarLabel,
  isDarkMode,
  isLoggingOut,
  menuRef,
  onClose,
  onLogout,
  onToggle,
  profileMenuOpen,
  username,
}: ProfileSlotProps) {
  return (
    <div ref={menuRef} className={styles.profileMenuWrapper}>
      <div
        className={cn(
          styles.profileTrigger,
          isDarkMode ? styles.profileTriggerDark : styles.profileTriggerLight,
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          className={cn(
            styles.profileAvatar,
            isDarkMode ? styles.profileAvatarDark : styles.profileAvatarLight,
          )}
        >
          <Typography
            variant="span"
            Component="span"
            weight="bold"
            className="max-w-full truncate !text-inherit"
          >
            {avatarLabel}
          </Typography>
        </button>

        <div className={styles.profileNameWrapper}>
          <Typography
            variant="span"
            Component="span"
            weight="semibold"
            className={cn(
              styles.profileName,
              isDarkMode ? styles.profileNameDark : styles.profileNameLight,
            )}
          >
            {username}
          </Typography>
        </div>
      </div>

      {profileMenuOpen ? (
        <div
          className={cn(
            styles.dropdown,
            isDarkMode ? styles.dropdownDark : styles.dropdownLight,
          )}
        >
          <div
            className={cn(
              styles.dropdownHeader,
              isDarkMode ? styles.dropdownHeaderDark : styles.dropdownHeaderLight,
            )}
          >
            <Typography
              variant="p"
              Component="p"
              weight="semibold"
              className={cn(
                styles.profileName,
                isDarkMode ? styles.profileNameDark : styles.profileNameLight,
              )}
            >
              {username}
            </Typography>
          </div>

          <div className={styles.dropdownNav}>
            {profileLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={cn(
                  styles.profileLink,
                  isDarkMode ? styles.profileLinkDark : styles.profileLinkLight,
                )}
              >
                <span
                  className={cn(
                    styles.profileLinkIconWrapper,
                    isDarkMode
                      ? styles.profileLinkIconWrapperDark
                      : styles.profileLinkIconWrapperLight,
                  )}
                >
                  <Icon className={styles.iconMedium} aria-hidden />
                </span>

                <Typography
                  variant="span"
                  Component="span"
                  weight="semibold"
                  className="!text-inherit"
                >
                  {label}
                </Typography>
              </Link>
            ))}
          </div>

          <div className={styles.dropdownNav}>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className={cn(
                styles.logoutButton,
                isDarkMode ? styles.logoutButtonDark : styles.logoutButtonLight,
                isLoggingOut && styles.logoutButtonDisabled,
              )}
            >
              <span className={styles.logoutIconWrapper}>
                <LogoutIcon />
              </span>

              <Typography
                variant="span"
                Component="span"
                weight="semibold"
                className="!text-inherit"
              >
                {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
              </Typography>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
