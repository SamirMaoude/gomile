import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'

type ButtonVariant = 'filled' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'
type IconPosition = 'left' | 'right'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  href?: string
  /** Icône affichée dans le bouton */
  icon?: React.ReactNode
  /** Position de l'icône : 'left' (défaut) ou 'right' */
  iconPosition?: IconPosition
  /** Si true, affiche uniquement l'icône dans un bouton carré */
  iconOnly?: boolean
  /** Si true, désactive le bouton */
  disabled?: boolean
  children?: React.ReactNode
}

export default function Button({
  variant = 'filled',
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

  /* ─── Tailles ─────────────────────────────────────────── */
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-1 py-1.5 text-sm ',
    md: 'px-5 py-3 text-base ',
    lg: 'px-10 py-5 text-lg ',
  }

  /* ─── Variantes ───────────────────────────────────────── */
  const variantClasses: Record<ButtonVariant, string> = {
    filled: [
      'bg-primary-light text-white',
      'border-2 border-primary-light',
      'hover:bg-primary-hover hover:border-primary-hover',
    ].join(' '),

    outline: [
      'bg-transparent text-primary-light',
      'border-2 border-primary-light',
      'hover:bg-primary-light hover:text-white',
    ].join(' '),

    ghost: [
      'bg-transparent text-primary-light',
      'border-2 border-transparent',
      'hover:bg-primary-light/10',
    ].join(' '),
  }

  /* ─── Icône ───────────────────────────────────────────── */
  const iconEl = icon ? (
    <span className="text-[1.1em] shrink-0">{icon}</span>
  ) : null

  return (
    href ? (
      <Link
        href={href}
        className={clsx(
          'flex items-center justify-center gap-2',
          'font-display font-bold uppercase tracking-wider',
          'rounded-btn cursor-pointer',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2',
          disabled
            ? 'opacity-40 cursor-not-allowed pointer-events-none saturate-0'
            : 'active:scale-95',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && !iconOnly ? 'w-full' : '',
          iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
          className,
        )}
        aria-label={iconOnly && typeof children === 'string' ? children : undefined}
        aria-disabled={disabled}
      >
        {iconOnly && iconEl}

        {!iconOnly && (
          <>
            {iconEl}
            {children && <span>{children}</span>}
          </>
        )}
      </Link>
    ) : (
      <button
        disabled={disabled}
        className={clsx(
          'flex items-center justify-center gap-2',
          'font-display font-bold uppercase tracking-wider',
          'rounded-btn cursor-pointer',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2',
          /* Désactivé */
          disabled
            ? 'opacity-40 cursor-not-allowed pointer-events-none saturate-0'
            : 'active:scale-95',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && !iconOnly ? 'w-full' : '',
          /* Inverser l'ordre si icône à droite */
          iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
          className,
        )}
        aria-label={iconOnly && typeof children === 'string' ? children : undefined}
        aria-disabled={disabled}
        {...props}
      >
        {/* Icône seule */}
        {iconOnly && iconEl}

        {/* Icône + texte */}
        {!iconOnly && (
          <>
            {iconEl}
            {children && <span>{children}</span>}
          </>
        )}
      </button>
    )
  )
}
