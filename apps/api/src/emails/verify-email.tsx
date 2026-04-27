import * as React from 'react'
import { Section, Row, Column, Text, Hr } from 'react-email'
import { EmailShell } from './components/email-shell'
import { EmailFooter } from './components/email-footer'
import { EmailHeader } from './components/email-header'
import { ActionButton } from './components/action-button'
import { colors } from './components/email-tokens'
import { sharedBodySection, sharedGreeting, sharedPara, sharedDivider, sharedFootnote } from './components/shared-styles'

const S3 = 'https://amzn-3-backend-kyc-gomiile-731322152450-eu-north-1-an.s3.eu-north-1.amazonaws.com/emails'

export interface VerifyEmailProps {
  email: string;
  name: string;
  verifyUrl: string;
}

export function VerifyEmail(dto: VerifyEmailProps) {
  return (
    <EmailShell preview="Welcome to Gomile ! Please confirm your email address" maxWidth="720px">

      <EmailHeader
        eyebrow="Welcome aboard"
        titleLine1="You're almost"
        titleAccent="there."
        subtitle="One tap to confirm your email and unlock everything Gomile has to offer."
      />

      <Section style={sharedBodySection}>
        <Text style={sharedGreeting}>Hi <strong>{dto.name}</strong>,</Text>
        <Text style={sharedPara}>
          Thanks for joining Gomile. To finish setting up your account,
          please verify your email address by clicking the button below.
        </Text>

        <ActionButton href={dto.verifyUrl} label="Verify my email" subtitle="Link expires in 24 hours" />

        <Row style={featuresRow}>
          <Column style={featCol}>
            <div style={featIcon}>
              <img src={`${S3}/icon-house.png`} width="16" height="16" alt="" />
            </div>s="Lin
            <Text style={featTitle}>Real-time tracking</Text>
            <Text style={featDesc}>Live updates on every delivery</Text>
          </Column>
          <Column style={featColMid}>
            <div style={featIcon}>
              <img src={`${S3}/icon-clock.png`} width="16" height="16" alt="" />
            </div>
            <Text style={featTitle}>On-time, every time</Text>
            <Text style={featDesc}>Smart routing saves you hours</Text>
          </Column>
          <Column style={featCol}>
            <div style={featIcon}>
              <img src={`${S3}/icon-shield.png`} width="16" height="16" alt="" />
            </div>
            <Text style={featTitle}>Secure by default</Text>
            <Text style={featDesc}>End-to-end encrypted data</Text>
          </Column>
        </Row>

        <div style={linkFallback}>
          <Text style={linkFallbackLabel}>Button not working? Copy and paste this link into your browser:</Text>
          <Text style={linkUrl}>{dto.verifyUrl}</Text>
        </div>

        <Hr style={sharedDivider} />

        <Text style={sharedFootnote}>
          Sent to <strong style={{ color: '#475569' }}>{dto.email}</strong>.{' '}
          If you didn't create a Gomile account, you can safely ignore this email.
          Questions?{' '}
          <a href="mailto:support@gomile.delivery" style={{ color: colors.textBody }}>support@gomile.delivery</a>
        </Text>
      </Section>

      <EmailFooter email={dto.email} />

    </EmailShell>
  )
}

VerifyEmail.PreviewProps = {
  email: 'rikuloulou@example.com',
  name: 'Riku',
  verifyUrl: 'https://app.gomile.delivery/verify',
} satisfies VerifyEmailProps;

export default VerifyEmail

const featuresRow: React.CSSProperties = {
  margin: '28px 0',
  borderRadius: '12px',
  overflow: 'hidden',
  border: `1px solid ${colors.border}`,
}

const featCol: React.CSSProperties = {
  backgroundColor: colors.bgLight,
  padding: '20px 18px',
  textAlign: 'center',
  verticalAlign: 'top',
}

const featColMid: React.CSSProperties = {
  ...featCol,
  borderLeft: `1px solid ${colors.border}`,
  borderRight: `1px solid ${colors.border}`,
}

const featIcon: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  backgroundColor: colors.dark,
  textAlign: 'center',
  lineHeight: '36px',
  margin: '0 auto 10px',
}

const featTitle: React.CSSProperties = {
  fontSize: '12.5px',
  fontWeight: 600,
  color: colors.textPrimary,
  margin: '0 0 3px',
  letterSpacing: '-0.01em',
}

const featDesc: React.CSSProperties = {
  fontSize: '11.5px',
  color: colors.textMuted,
  lineHeight: '1.5',
  margin: '0',
}

const linkFallback: React.CSSProperties = {
  backgroundColor: colors.bgLight,
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  padding: '16px 18px',
  margin: '20px 0',
}

const linkFallbackLabel: React.CSSProperties = {
  fontSize: '12px',
  color: colors.textBody,
  margin: '0 0 6px',
}

const linkUrl: React.CSSProperties = {
  fontSize: '11px',
  color: '#263C65',
  wordBreak: 'break-all',
  lineHeight: '1.5',
  margin: '0',
}
