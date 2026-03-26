import React from "react"
import clsx from "clsx"
import Typography from "../typography"

type CardSize = 'sm' | 'md' | 'lg'

interface Props {
  icon: React.ReactNode
  iconTheme?: "green" | "blue" | "white"
  title?: string
  description?: string
  size?: CardSize
  iconFull?: boolean
  className?: string
}

const iconThemeClasses = {
  green: "bg-green-100 text-primary-green",
  blue:  "bg-blue-100 text-primary-blue",
  white: "bg-white"
}

const sizeClasses: Record<CardSize, {
  card: string
  icon: string
  iconSize: string
}> = {
  sm: {
    card:     "p-4 rounded-xl gap-2",
    icon:     "w-9 h-9 rounded-lg",
    iconSize: "text-base",
  },
  md: {
    card:     "p-6 rounded-card gap-3",
    icon:     "w-12 h-12 rounded-xl",
    iconSize: "text-xl",
  },
  lg: {
    card:     "p-8 rounded-2xl gap-4",
    icon:     "w-16 h-16 rounded-2xl",
    iconSize: "text-2xl",
  },
}

export default function Card({
  icon,
  iconTheme = "green",
  title = '',
  description = '',
  size = 'md',
  iconFull = false,
}: Props) {

  const s = sizeClasses[size]

  if (iconFull) {
    return (
      <div className={clsx(
        "flex items-center justify-center shadow-card border border-gray-200 bg-linear-to-br from-blue-200 via-teal-100 to-green-100",
        "hover:shadow-card-hover transition-shadow duration-200",
        iconThemeClasses[iconTheme],
        s.card
      )}>
        {icon}
      </div>
    )
  }

  return (
    <div className={clsx(
      "flex flex-col shadow-card border border-gray-200",
      "hover:shadow-card-hover transition-shadow duration-200",
      s.card
    )}>
      <div className={clsx(
        "flex items-center justify-center",
        iconThemeClasses[iconTheme],
        s.iconSize,
        s.icon,
        "shrink-0"
      )}>
        {icon}
      </div>

      <Typography variant="h4" weight="medium" Component="h3">
        {title}
      </Typography>
      <Typography variant="p" weight="light" Component="p" theme="grey">
        {description}
      </Typography>
    </div>
  )
}