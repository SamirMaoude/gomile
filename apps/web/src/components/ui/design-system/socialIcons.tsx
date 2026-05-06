import React from "react"
import clsx from "clsx"
import {
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaTiktok
} from "react-icons/fa"
import { Mail } from "lucide-react"

type SocialIconName =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "x"
  | "youtube"
  | "tiktok"
  | "mail"

interface SocialIconProps {
  href: string
  name: SocialIconName
  label?: string
  className?: string
  size?: number
}

const iconsMap: Record<SocialIconName, React.ComponentType<{ size?: number }>> = {
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  x: FaTwitter,
  youtube: FaYoutube,
  mail: Mail,
  tiktok: FaTiktok,
}

export default function SocialIcon({
  href,
  name,
  label,
  className,
  size = 18,
}: SocialIconProps) {
  const Icon = iconsMap[name]

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ?? name}
      className={clsx(
        "flex h-10 w-10 items-center justify-center",
        className
      )}
    >
      <Icon size={size} />
    </a>
  )
}