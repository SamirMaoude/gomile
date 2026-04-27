import React from 'react'
import clsx from 'clsx'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string         
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, { wrapper: string; text: string }> = {
  xs: { wrapper: 'w-8 h-8',   text: 'text-xs'  },
  sm: { wrapper: 'w-10 h-10', text: 'text-sm'  },
  md: { wrapper: 'w-14 h-14', text: 'text-lg'  },
  lg: { wrapper: 'w-20 h-20', text: 'text-2xl' },
  xl: { wrapper: 'w-28 h-28', text: 'text-4xl' },
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const { wrapper, text } = sizeClasses[size]

  return (
    <div
      aria-label={name}
      className={clsx(
        'rounded-full flex centered shrink-0 select-none',
        'bg-gradient-to-br from-primary-blue-light to-primary-green',
        wrapper,
        className,
      )}
    >
      <span className={clsx('font-display font-bold text-white tracking-wide', text)}>
        {getInitials(name)}
      </span>
    </div>
  )
}