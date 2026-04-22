import * as React from 'react'
import { Section, Row, Column, Text, Hr } from 'react-email'
import { EmailShell } from './components/email-shell'
import { EmailFooter } from './components/email-footer'
import { LogoLockup } from './components/logo-lockup'
import { sharedBodySection, sharedGreeting, sharedPara, sharedDivider, sharedFootnote } from './components/shared-styles'

export interface ResetPasswordEmailProps {
  email: string;
  name: string;
  resetOtp: string;
}

export function ResetPasswordEmail(dto: ResetPasswordEmailProps) {
  // Generate a random 6 digits otp
  const digits = (dto.resetOtp ?? '000000').padEnd(6, ' ').slice(0, 6).split('')

  return (
    <EmailShell preview={`Your Gomile password reset code: ${dto.resetOtp}`}>

      {/* Header */}
      <Section style={header}>
        <Row>
          <Column>
            <div style={{ marginBottom: '32px' }}>
              <LogoLockup />
            </div>
            <Text style={kicker}>Security</Text>
            <Text style={title}>Reset your<br /><span style={{ color: '#90C440' }}>password.</span></Text>
            <Text style={metaText}>Requested · expires in 1 hour</Text>
          </Column>
        </Row>
      </Section>

      {/* Body */}
      <Section style={sharedBodySection}>
        <Text style={sharedGreeting}>Hi <strong>{dto.name}</strong>,</Text>
        <Text style={sharedPara}>
          Use the one-time code below to reset your Gomile password.
          Valid for <strong>1 hour</strong>, single use only.
        </Text>

        {/* OTP block */}
        <div style={otpWrap}>
          <Text style={otpEyebrow}>Verification code</Text>
          <div style={otpRow}>
            {digits.map((d, i) => (
              <span key={i} style={{ ...otpDigit, marginRight: i === 2 ? '16px' : '7px' }}>{d}</span>
            ))}
          </div>
          <div style={timerPill}>
            <span style={timerDot} />
            Expires in 1 hour
          </div>
        </div>

        {/* Security banner */}
        <div style={secBanner}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a8028" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <Text style={secText}>
            <strong>Never share this code.</strong> Gomile will never ask for it by phone or chat.
          </Text>
        </div>

        <Text style={{ ...sharedPara, fontSize: '13px' }}>
          Didn't request this? No action needed — your account is safe and this code will expire automatically.
        </Text>

        <Hr style={sharedDivider} />

        <Text style={sharedFootnote}>
          Sent to <strong style={{ color: '#475569' }}>{dto.email}</strong>.{' '}
          Questions? Email <a href="mailto:support@gomile.fr" style={{ color: '#64748b' }}>support@gomile.fr</a>
        </Text>
      </Section>

      <EmailFooter email={dto.email} />

    </EmailShell>
  )
}

ResetPasswordEmail.PreviewProps = {
  email: 'rikuloulou@example.com',
  name: 'Riku',
  resetOtp: '482917',
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail

// Styles

const header: React.CSSProperties = {
  backgroundColor: '#07101e',
  padding: '36px 44px 40px',
}

const kicker: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#90C440',
  margin: '0 0 10px',
}

const title: React.CSSProperties = {
  fontSize: '38px',
  fontWeight: 700,
  color: '#ffffff',
  letterSpacing: '-0.04em',
  lineHeight: '1.0',
  margin: '0 0 14px',
  paddingBottom: '20px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}

const metaText: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.32)',
  margin: '0',
}

const otpWrap: React.CSSProperties = {
  backgroundColor: '#07101e',
  borderRadius: '14px',
  padding: '26px 24px 22px',
  textAlign: 'center',
  margin: '28px 0',
}

const otpEyebrow: React.CSSProperties = {
  fontSize: '9.5px',
  fontWeight: 600,
  letterSpacing: '0.20em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.25)',
  margin: '0 0 18px',
}

const otpRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '14px',
}

const otpDigit: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '26px',
  fontWeight: 500,
  color: '#ffffff',
  width: '48px',
  height: '58px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '10px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  lineHeight: '58px',
}

const timerPill: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  backgroundColor: 'rgba(144,196,64,0.12)',
  border: '1px solid rgba(144,196,64,0.22)',
  borderRadius: '20px',
  padding: '3px 10px 3px 7px',
  color: '#90C440',
  fontSize: '11px',
  fontWeight: 500,
}

const timerDot: React.CSSProperties = {
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  backgroundColor: '#90C440',
  display: 'inline-block',
}

const secBanner: React.CSSProperties = {
  display: 'flex',
  gap: '11px',
  padding: '14px 16px',
  backgroundColor: '#f0f7e7',
  border: '1px solid rgba(144,196,64,0.28)',
  borderRadius: '10px',
  marginBottom: '24px',
  alignItems: 'flex-start',
}

const secText: React.CSSProperties = {
  fontSize: '13px',
  color: '#3d5a1a',
  lineHeight: '1.6',
  margin: '0',
}
