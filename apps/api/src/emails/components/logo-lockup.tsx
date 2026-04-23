import * as React from 'react'
import { GomileLogo } from './gomile-logo'

const logoRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '11px',
}

const wordmark: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  letterSpacing: '-0.02em',
}

export function LogoLockup() {
  return (
    <div style={logoRow}>
      <GomileLogo />
      <span style={wordmark}>
        <span style={{ color: '#ffffff' }}>Go</span>
        <span style={{ color: '#90C440' }}>mile</span>
      </span>
    </div>
  )
}
