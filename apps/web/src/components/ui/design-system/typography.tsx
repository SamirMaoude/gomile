// src/components/ui/Typography.tsx
import React from 'react'
import clsx from 'clsx'

interface Props {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
  theme?: 'black' | 'white' | 'grey' | 'primaryG' | 'secondaryG' | 'tertiaryG' | 'primaryB' | 'secondaryB' | 'tertiaryB' 
  | "heading" | "body" | "bodyStrong" | "link"
  | "danger" | "success";
  Component?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'li' | 'div'
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  h1: 'font-display text-5xl leading-tight',
  h2: 'font-display text-4xl leading-tight',
  h3: 'font-display text-3xl leading-snug',
  h4: 'font-display text-2xl leading-snug',
  h5: 'font-display text-xl leading-normal',
  h6: 'font-display text-lg leading-normal',
  p:  'font-body text-base leading-relaxed',
  span: 'font-body text-base leading-normal',
}

const weightClasses: Record<NonNullable<Props['weight']>, string> = {
  light:    'font-light',
  normal:   'font-normal',
  medium:   'font-medium',
  semibold: 'font-semibold',
  bold:     'font-bold',
}

const themeClasses: Record<NonNullable<Props['theme']>, string> = {
  black:     'text-text',
  white:     'text-white',
  grey:      'text-text-muted',
  primaryG:   'text-primary-green',
  secondaryG: 'text-primary-green-light',
  tertiaryG:  'text-primary-green-hover',
  primaryB: 'text-primary-blue',
  secondaryB: 'text-primary-blue-light',
  tertiaryB: 'text-primary-blue-hover',
  heading:   'text-heading',
  body:      'text-body',
  bodyStrong: 'text-body-strong',
  link:      'text-link',
  danger:    'text-danger',
  success:   'text-success',
}

export function Typography({
  variant = 'p',
  weight,
  theme = 'black',
  Component = 'p',
  children,
  className = '',
}: Props) {

  const defaultWeight: Record<NonNullable<Props['variant']>, string> = {
    h1: 'font-bold',
    h2: 'font-bold',
    h3: 'font-bold',
    h4: 'font-semibold',
    h5: 'font-semibold',
    h6: 'font-medium',
    p:  'font-normal',
    span: 'font-normal',
  }

  return (
    <Component
      className={clsx(
        variantClasses[variant],
        weight ? weightClasses[weight] : defaultWeight[variant],
        themeClasses[theme],
        className,
      )}
    >
      {children}
    </Component>
  )
}

export default Typography
