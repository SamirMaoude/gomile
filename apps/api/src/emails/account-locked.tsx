import * as React from 'react'
import { Section, Text, Hr } from 'react-email'
import { EmailShell } from './components/email-shell'
import { EmailFooter } from './components/email-footer'
import { EmailHeader } from './components/email-header'
import { ActionButton } from './components/action-button'
import { colors } from './components/email-tokens'
import { sharedBodySection, sharedGreeting, sharedPara, sharedDivider, sharedFootnote } from './components/shared-styles'

export interface AccountLockedProps {
  email: string;
  name: string;
  upgradeUrl: string;
}

export function AccountLocked(dto: AccountLockedProps) {
  return (
    <EmailShell preview="Your Gomile trial has ended — upgrade to reactivate your store" maxWidth="720px">

      <EmailHeader
        eyebrow="Account suspended"
        titleLine1="Your store has"
        titleAccent="been locked."
        subtitle="Your free trial has ended. Upgrade to reactivate your store and resume taking orders."
      />

      <Section style={sharedBodySection}>
        <Text style={sharedGreeting}>Hi <strong>{dto.name}</strong>,</Text>
        <Text style={sharedPara}>
          Your 30-day free trial has ended and your store has been locked.
          You won't be able to accept new orders until you upgrade your plan.
        </Text>
        <Text style={sharedPara}>
          Your store data is safe — nothing has been deleted. Simply upgrade to
          PRO or BUSINESS to reactivate everything instantly.
        </Text>

        <ActionButton href={dto.upgradeUrl} label="Reactivate my store" subtitle="Upgrade anytime to resume" />

        <div style={warningBox}>
          <Text style={warningText}>
            Your store and order history are preserved. Upgrade at any time to restore access.
          </Text>
        </div>

        <Hr style={sharedDivider} />

        <Text style={sharedFootnote}>
          Sent to <strong style={{ color: '#475569' }}>{dto.email}</strong>.{' '}
          Questions?{' '}
          <a href="mailto:support@gomile.delivery" style={{ color: colors.textBody }}>support@gomile.delivery</a>
        </Text>
      </Section>

      <EmailFooter email={dto.email} />

    </EmailShell>
  )
}

AccountLocked.PreviewProps = {
  email: 'merchant@example.com',
  name: 'Riku',
  upgradeUrl: 'https://app.gomile.delivery/upgrade',
} satisfies AccountLockedProps;

export default AccountLocked

const warningBox: React.CSSProperties = {
  backgroundColor: '#fff8f0',
  border: '1px solid #fed7aa',
  borderRadius: '10px',
  padding: '14px 18px',
  margin: '20px 0',
}

const warningText: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#92400e',
  lineHeight: '1.5',
  margin: '0',
}
