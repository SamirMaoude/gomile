import * as React from 'react'
import { Section, Text, Hr } from 'react-email'
import { EmailShell } from './components/email-shell'
import { EmailFooter } from './components/email-footer'
import { EmailHeader } from './components/email-header'
import { ActionButton } from './components/action-button'
import { colors } from './components/email-tokens'
import { sharedBodySection, sharedGreeting, sharedPara, sharedDivider, sharedFootnote } from './components/shared-styles'

export interface PaymentFailedProps {
  email: string;
  name: string;
  billingUrl: string;
}

export function PaymentFailed(dto: PaymentFailedProps) {
  return (
    <EmailShell preview="Payment failed — update your billing details to keep your store active" maxWidth="720px">

      <EmailHeader
        eyebrow="Payment failed"
        titleLine1="We couldn't process"
        titleAccent="your payment."
        subtitle="Your store is still active for now, but please update your billing details to avoid interruption."
      />

      <Section style={sharedBodySection}>
        <Text style={sharedGreeting}>Hi <strong>{dto.name}</strong>,</Text>
        <Text style={sharedPara}>
          We attempted to charge your payment method but the transaction didn't go through.
          Your subscription is now past due.
        </Text>
        <Text style={sharedPara}>
          Your store remains accessible while Stripe retries the payment, but if the issue
          isn't resolved your account will be locked. Update your billing details now to stay uninterrupted.
        </Text>

        <ActionButton href={dto.billingUrl} label="Update billing details" subtitle="Takes less than a minute" />

        <div style={alertBox}>
          <Text style={alertText}>
            Stripe will automatically retry the payment. If all retries fail, your store will be locked.
          </Text>
        </div>

        <Hr style={sharedDivider} />

        <Text style={sharedFootnote}>
          Sent to <strong style={{ color: '#475569' }}>{dto.email}</strong>.{' '}
          Need help?{' '}
          <a href="mailto:support@gomile.delivery" style={{ color: colors.textBody }}>support@gomile.delivery</a>
        </Text>
      </Section>

      <EmailFooter email={dto.email} />

    </EmailShell>
  )
}

PaymentFailed.PreviewProps = {
  email: 'merchant@example.com',
  name: 'Riku',
  billingUrl: 'https://app.gomile.delivery/subscription',
} satisfies PaymentFailedProps;

export default PaymentFailed

const alertBox: React.CSSProperties = {
  backgroundColor: '#fff8f0',
  border: '1px solid #fed7aa',
  borderRadius: '10px',
  padding: '14px 18px',
  margin: '20px 0',
}

const alertText: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#92400e',
  lineHeight: '1.5',
  margin: '0',
}
