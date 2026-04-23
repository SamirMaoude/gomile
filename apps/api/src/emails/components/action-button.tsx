import * as React from 'react'
import { Link, Text } from 'react-email'

interface ActionButtonProps {
  href: string;
  label: string;
  expiry?: string;
}

const actionWrap: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0',
}

const actionBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: '#90C440',
  color: '#07101e',
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '15px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  padding: '16px 36px',
  borderRadius: '100px',
  textDecoration: 'none',
  boxShadow: '0 4px 20px rgba(144,196,64,0.35), 0 1px 3px rgba(0,0,0,0.12)',
}

const actionArrow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  backgroundColor: 'rgba(7,16,30,0.12)',
  borderRadius: '50%',
  flexShrink: 0,
}

const actionExpiry: React.CSSProperties = {
  marginTop: '10px',
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center',
}

export function ActionButton({ href, label, expiry }: ActionButtonProps) {
  return (
    <div style={actionWrap}>
      <Link href={href} style={actionBtn}>
        {label}&nbsp;&nbsp;
        <span style={actionArrow}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </Link>
      {expiry && <Text style={actionExpiry}>{expiry}</Text>}
    </div>
  )
}
