import * as React from 'react'
import { Section, Row, Column, Text, Hr } from 'react-email'
import { EmailShell } from './components/email-shell'
import { EmailFooter } from './components/email-footer'
import { LogoLockup } from './components/logo-lockup'
import { ActionButton } from './components/action-button'
import { sharedBodySection, sharedGreeting, sharedPara, sharedDivider, sharedFootnote } from './components/shared-styles'

export interface VerifyEmailProps {
  email: string;
  name: string;
  verifyUrl: string;
}

export function VerifyEmail(dto: VerifyEmailProps) {
  return (
    <EmailShell preview="Welcome to Gomile ! Please confirm your email address" maxWidth="720px">

      {/* Header */}
      <Section style={header}>
        <Row>
          <Column>
            <div style={{ marginBottom: '28px' }}>
              <LogoLockup />
            </div>
            <Text style={eyebrow}>Welcome aboard</Text>
            <Text style={title}>
              You're almost<br />
              <span style={{ color: '#90C440' }}>there.</span>
            </Text>
            <div style={greenRule} />
            <Text style={headerSub}>
              One tap to confirm your email and unlock everything Gomile has to offer.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Body */}
      <Section style={sharedBodySection}>
        <Text style={sharedGreeting}>Hi <strong>{dto.name}</strong>,</Text>
        <Text style={sharedPara}>
          Thanks for joining Gomile. To finish setting up your account,
          please verify your email address by clicking the button below.
        </Text>

        <ActionButton href={dto.verifyUrl} label="Verify my email" expiry="Link expires in 24 hours" />

        {/* Feature strip */}
        <Row style={featuresRow}>
          <Column style={featCol}>
            <div style={featIcon}>
              <img src="https://amzn-3-backend-kyc-gomiile-731322152450-eu-north-1-an.s3.eu-north-1.amazonaws.com/emails/icon-house.png" width="16" height="16" alt="" />
            </div>
            <Text style={featTitle}>Real-time tracking</Text>
            <Text style={featDesc}>Live updates on every delivery</Text>
          </Column>
          <Column style={featColMid}>
            <div style={featIcon}>
              <img src="https://amzn-3-backend-kyc-gomiile-731322152450-eu-north-1-an.s3.eu-north-1.amazonaws.com/emails/icon-clock.png" width="16" height="16" alt="" />
            </div>
            <Text style={featTitle}>On-time, every time</Text>
            <Text style={featDesc}>Smart routing saves you hours</Text>
          </Column>
          <Column style={featCol}>
            <div style={featIcon}>
              <img src="https://amzn-3-backend-kyc-gomiile-731322152450-eu-north-1-an.s3.eu-north-1.amazonaws.com/emails/icon-shield.png" width="16" height="16" alt="" />
            </div>
            <Text style={featTitle}>Secure by default</Text>
            <Text style={featDesc}>End-to-end encrypted data</Text>
          </Column>
        </Row>

        {/* Link fallback */}
        <div style={linkFallback}>
          <Text style={linkFallbackLabel}>Button not working? Copy and paste this link into your browser:</Text>
          <Text style={linkUrl}>{dto.verifyUrl}</Text>
        </div>

        <Hr style={sharedDivider} />

        <Text style={sharedFootnote}>
          Sent to <strong style={{ color: '#475569' }}>{dto.email}</strong>.{' '}
          If you didn't create a Gomile account, you can safely ignore this email.
          Questions?{' '}
          <a href="mailto:support@gomile.fr" style={{ color: '#64748b' }}>support@gomile.fr</a>
        </Text>
      </Section>

      <EmailFooter email={dto.email} />

    </EmailShell>
  )
}

VerifyEmail.PreviewProps = {
  email: 'rikuloulou@example.com',
  name: 'Riku',
  verifyUrl: 'https://app.gomile.fr/verify',
} satisfies VerifyEmailProps;

export default VerifyEmail

// Styles

const header: React.CSSProperties = {
  backgroundColor: '#07101e',
  padding: '32px 44px 40px',
}

const eyebrow: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.20em',
  textTransform: 'uppercase',
  color: '#90C440',
  margin: '0 0 12px',
}

const title: React.CSSProperties = {
  fontSize: '42px',
  fontWeight: 700,
  color: '#ffffff',
  letterSpacing: '-0.04em',
  lineHeight: '0.95',
  margin: '0 0 16px',
}

const greenRule: React.CSSProperties = {
  width: '40px',
  height: '2px',
  backgroundColor: '#90C440',
  borderRadius: '2px',
  marginBottom: '14px',
}

const headerSub: React.CSSProperties = {
  fontSize: '13.5px',
  color: 'rgba(255,255,255,0.4)',
  lineHeight: '1.6',
  margin: '0',
}

const featuresRow: React.CSSProperties = {
  margin: '28px 0',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
}

const featCol: React.CSSProperties = {
  backgroundColor: '#f7f9fb',
  padding: '20px 18px',
  textAlign: 'center',
  verticalAlign: 'top',
}

const featColMid: React.CSSProperties = {
  ...featCol,
  borderLeft: '1px solid #e2e8f0',
  borderRight: '1px solid #e2e8f0',
}

const featIcon: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  backgroundColor: '#07101e',
  textAlign: 'center',
  lineHeight: '36px',
  margin: '0 auto 10px',
}

const featTitle: React.CSSProperties = {
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#0f1e34',
  margin: '0 0 3px',
  letterSpacing: '-0.01em',
}

const featDesc: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#94a3b8',
  lineHeight: '1.5',
  margin: '0',
}

const linkFallback: React.CSSProperties = {
  backgroundColor: '#f7f9fb',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '20px 0',
}

const linkFallbackLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 6px',
}

const linkUrl: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '11px',
  color: '#263C65',
  wordBreak: 'break-all',
  lineHeight: '1.5',
  margin: '0',
}
