import React from "react"
import clsx from "clsx"
import Typography from "../typography"

type CardSize = 'sm' | 'md' | 'lg'
type CardDimension = 'sm' | 'md' | 'lg' | 'xl' | 'fit'

interface Props {
  icon: React.ReactNode
  iconTheme?: "green" | "blue" | "white" | "gray" | "linear"
  title?: string
  description?: string
  size?: CardSize
  iconFull?: boolean
  width?: CardDimension
  height?: CardDimension
  className?: string
  iconClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

const iconThemeClasses = {
  green: "bg-green-100 text-primary-green",
  blue:  "bg-blue-100 text-primary-blue",
  white: "bg-white",
  gray: "bg-gray-500 text-white",
  linear: "bg-linear-to-br from-blue-200 via-teal-100 to-green-100 text-gray-700",
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

const widthClasses: Record<CardDimension, string> = {
  sm: "w-48",
  md: "w-64",
  lg: "w-80",
  xl: "w-96",
  fit: "w-fit",
}

const heightClasses: Record<CardDimension, string> = {
  sm: "h-48",
  md: "h-64",
  lg: "h-80",
  xl: "h-96",
  fit: "h-fit",
}

export default function Card({
  icon,
  iconTheme = "green",
  title = '',
  description = '',
  size = 'md',
  iconFull = false,
  width,
  height,
  className = '',
  iconClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  children,
  style,
}: Props) {

  const s = sizeClasses[size]
  const widthClass = width ? widthClasses[width] : ""
  const heightClass = height ? heightClasses[height] : ""

  if (iconFull) {
    return (
      <div className={clsx(
        "flex items-center justify-center shadow-card border border-gray-200 bg-linear-to-br from-blue-200 via-teal-100 to-green-100",
        "hover:shadow-card-hover transition-shadow duration-200",
        iconThemeClasses[iconTheme],
        s.card,
        widthClass,
        heightClass,
        className
      )}
      style={style}
      >
        {icon}
      </div>
    )
  }

  return (
    <div className={clsx(
      "flex flex-col shadow-card border border-gray-200",
      "hover:shadow-card-hover transition-shadow duration-200",
      s.card,
      widthClass,
      heightClass,
      className
    )}
    style={style}
    >
      <div className={clsx(
        "flex items-center justify-center",
        iconThemeClasses[iconTheme],
        s.iconSize,
        s.icon,
        "shrink-0",
        iconClassName
      )}>
        {icon}
      </div>

      <Typography variant="h4" weight="medium" Component="h3" className={titleClassName}>
        {title}
      </Typography>
      <Typography
        variant="p"
        weight="light"
        Component="p"
        theme="grey"
        className={descriptionClassName}
      >
        {description}
      </Typography>
      {children}
    </div>
  )
}
