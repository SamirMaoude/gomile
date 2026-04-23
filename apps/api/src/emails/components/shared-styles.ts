import type { CSSProperties } from 'react'

export const sharedBody: CSSProperties = {
  backgroundColor: '#eef0f3',
  fontFamily: "'Space Grotesk', -apple-system, sans-serif",
  padding: '48px 16px',
}

export const sharedContainer = (maxWidth: string): CSSProperties => ({
  maxWidth,
  margin: '0 auto',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 6px 20px rgba(0,0,0,0.09)',
})

export const sharedBodySection: CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '36px 44px 40px',
}

export const sharedGreeting: CSSProperties = {
  fontSize: '15px',
  fontWeight: 500,
  color: '#0f1e34',
  margin: '0 0 10px',
}

export const sharedPara: CSSProperties = {
  fontSize: '14.5px',
  color: '#64748b',
  lineHeight: '1.75',
  margin: '0 0 10px',
}

export const sharedDivider: CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

export const sharedFootnote: CSSProperties = {
  fontSize: '12.5px',
  color: '#94a3b8',
  lineHeight: '1.65',
  margin: '0',
}
