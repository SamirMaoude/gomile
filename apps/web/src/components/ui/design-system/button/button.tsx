import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'

type ButtonVariant = 'filled' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonTheme = 'green' | 'blue'
type ButtonShade = 'normal' | 'light'
type IconPosition = 'left' | 'right'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  theme?: ButtonTheme
  shade?: ButtonShade
  size?: ButtonSize
  fullWidth?: boolean
  href?: string
  /** Icône affichée dans le bouton */
  icon?: React.ReactNode
  iconPosition?: IconPosition
  iconOnly?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

/* ─── Variantes par thème et shade ───────────────────── */
const variantClasses: Record<ButtonTheme, Record<ButtonShade, Record<ButtonVariant, string>>> = {
  green: {
    normal: {
      filled: [
        'bg-primary-green text-white',
        'border-2 border-primary-green',
        'hover:bg-primary-green-hover hover:border-primary-green-hover',
      ].join(' '),
      outline: [
        'bg-transparent text-primary-green',
        'border-2 border-primary-green',
        'hover:bg-primary-green hover:text-white',
      ].join(' '),
      ghost: [
        'bg-transparent text-primary-green',
        'border-2 border-transparent',
        'hover:bg-primary-green/10',
      ].join(' '),
    },
    light: {
      filled: [
        'bg-primary-green-light text-white',
        'border-2 border-primary-green-light',
        'hover:bg-primary-green-hover hover:border-primary-green-hover',
      ].join(' '),
      outline: [
        'bg-transparent text-primary-green-light',
        'border-2 border-primary-green-light',
        'hover:bg-primary-green-light hover:text-white',
      ].join(' '),
      ghost: [
        'bg-transparent text-primary-green-light',
        'border-2 border-transparent',
        'hover:bg-primary-green-light/10',
      ].join(' '),
    },
  },
  blue: {
    normal: {
      filled: [
        'bg-primary-blue text-white',
        'border-2 border-primary-blue',
        'hover:bg-primary-blue-hover hover:border-primary-blue-hover',
      ].join(' '),
      outline: [
        'bg-transparent text-primary-blue',
        'border-2 border-primary-blue',
        'hover:bg-primary-blue hover:text-white',
      ].join(' '),
      ghost: [
        'bg-transparent text-primary-blue',
        'border-2 border-transparent',
        'hover:bg-primary-blue/10',
      ].join(' '),
    },
    light: {
      filled: [
        'bg-primary-blue-light text-white',
        'border-2 border-primary-blue-light',
        'hover:bg-primary-blue-hover hover:border-primary-blue-hover',
      ].join(' '),
      outline: [
        'bg-transparent text-primary-blue-light',
        'border-2 border-primary-blue-light',
        'hover:bg-primary-blue-light hover:text-white',
      ].join(' '),
      ghost: [
        'bg-transparent text-primary-blue-light',
        'border-2 border-transparent',
        'hover:bg-primary-blue-light/10',
      ].join(' '),
    },
  },
}

/* ─── Tailles ─────────────────────────────────────────── */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-1 py-1.5 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-10 py-5 text-lg',
}

export default function Button({
  variant = 'filled',
  theme = 'green',
  shade = 'normal',      
  size = 'md',
  fullWidth = false,
  href,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {

  const iconEl = icon ? (
    <span className="text-[1.1em] shrink-0">{icon}</span>
  ) : null

  return (
    <button
      disabled={disabled}
      className={clsx(
        'flex items-center justify-center gap-2',
        'font-display font-bold uppercase tracking-wider',
        'rounded-btn cursor-pointer',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        disabled
          ? 'opacity-40 cursor-not-allowed pointer-events-none saturate-0'
          : 'active:scale-95',
        sizeClasses[size],
        variantClasses[theme][shade][variant],  
        fullWidth && !iconOnly ? 'w-full' : '',
        iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
        className,
      )}
      aria-label={iconOnly && typeof children === 'string' ? children : undefined}
      aria-disabled={disabled}
      {...props}
    >
      {iconOnly && iconEl}
      {!iconOnly && (
        <>
          {iconEl}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  )
}
