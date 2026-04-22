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
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-10 py-5 text-lg',
}

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 w-9 p-0',
  md: 'h-11 w-11 p-0',
  lg: 'h-14 w-14 p-0',
}

export default function Button({
  variant = 'filled',
  theme = 'green',
  shade = 'normal',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2',
        'font-display font-bold uppercase tracking-wider',
        'rounded-btn',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        disabled
          ? 'pointer-events-none cursor-not-allowed opacity-40 saturate-0'
          : 'cursor-pointer active:scale-95',
        iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
        variantClasses[theme][shade][variant],
        fullWidth && !iconOnly && 'w-full',
        className,
      )}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
