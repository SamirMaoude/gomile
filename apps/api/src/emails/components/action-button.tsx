import * as React from 'react'
import { Link, Text } from 'react-email'

interface ActionButtonProps {
  href: string;
  label: string;
  subtitle?: string;
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
  display: 'inline-block',
  width: '24px',
  height: '24px',
  lineHeight: '24px',
  textAlign: 'center',
  backgroundColor: 'rgba(7,16,30,0.12)',
  borderRadius: '50%',
}

const actionExpiry: React.CSSProperties = {
  marginTop: '10px',
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center',
}

export function ActionButton({ href, label, subtitle }: ActionButtonProps) {
  return (
    <div style={actionWrap}>
      <Link href={href} style={actionBtn}>
        {label}&nbsp;&nbsp;
        <span style={actionArrow}>
          <img src="https://amzn-3-backend-kyc-gomiile-731322152450-eu-north-1-an.s3.eu-north-1.amazonaws.com/emails/icon-arrow.png" width="12" height="12" alt="" style={{ verticalAlign: 'middle' }} />
        </span>
      </Link>
      {subtitle && <Text style={actionExpiry}>{subtitle}</Text>}
    </div>
  )
}
