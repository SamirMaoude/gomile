import React from 'react'
import Typography from '../typography'
import { Target } from 'lucide-react'
import clsx from 'clsx'
 
type BadgeVariant = 'green' | 'blue' | 'muted' 

interface BadgeProps {
  label: string
  icon?: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, { wrapper: string; iconTheme: string; textTheme: NonNullable<React.ComponentProps<typeof Typography>['theme']> }> = {
  green: { wrapper: 'bg-primary-green-light border-primary-green-dark', iconTheme: 'text-primary-green', textTheme: 'primaryG' },
  blue:  { wrapper: 'bg-primary-blue-light border-primary-blue-dark', iconTheme: 'text-primary-blue', textTheme: 'primaryB' },
  muted: { wrapper: 'bg-[#F5F5F5] border-[#E0E0E0]', iconTheme: 'grey', textTheme: 'grey' },  
}

export default function Badge({
  label,
  icon,
  variant = 'green',
  className = '',
}: BadgeProps) {
  const { wrapper, iconTheme, textTheme} = variantStyles[variant]
 
  return (
    <div
      className={clsx("inline-flex items-center gap-2 rounded-full border px-4 py-2", wrapper, className)}
    >
      <span className={clsx("flex shrink-0 items-center", iconTheme)}>
        {icon}
      </span>
 
      <Typography variant="span" weight="medium" theme={textTheme}>
        {label}
      </Typography>
    </div>
  )
}