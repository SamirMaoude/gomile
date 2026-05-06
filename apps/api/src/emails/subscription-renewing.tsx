import * as React from 'react'
import { Section, Text, Hr } from 'react-email'
import { EmailShell } from './components/email-shell'
import { EmailFooter } from './components/email-footer'
import { EmailHeader } from './components/email-header'
import { ActionButton } from './components/action-button'
import { InfoBox } from './components/info-box'
import { colors } from './components/email-tokens'
import { TIER_PRICING } from '../subscription/subscription.config'
import { sharedBodySection, sharedGreeting, sharedPara, sharedDivider, sharedFootnote } from './components/shared-styles'
import { Tier } from '@prisma/client'

export interface SubscriptionRenewingProps {
  email: string;
  name: string;
  plan: Tier;
  renewalDate: Date;
  portalUrl: string;
}

const PLAN_PRICE: Record<Tier, string> = {
  FREE: '€0',
  PRO: `€${TIER_PRICING.PRO}`,
  BUSINESS: `€${TIER_PRICING.BUSINESS}`,
}

export function SubscriptionRenewing(dto: SubscriptionRenewingProps) {
  const renewalDateStr = dto.renewalDate.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <EmailShell preview={`Your Gomile ${dto.plan} plan renews on ${renewalDateStr}`} maxWidth="720px">

      <EmailHeader
        eyebrow="Upcoming renewal"
        titleLine1={`Your ${dto.plan} plan`}
        titleAccent="renews soon."
        subtitle={`We'll automatically renew your subscription on ${renewalDateStr}. No action needed.`}
      />

      <Section style={sharedBodySection}>
        <Text style={sharedGreeting}>Hi <strong>{dto.name}</strong>,</Text>
        <Text style={sharedPara}>
          Your <strong>{dto.plan}</strong> plan will automatically renew on{' '}
          <strong>{renewalDateStr}</strong> at <strong>{PLAN_PRICE[dto.plan]}/month</strong>.
          Your card on file will be charged, no action needed on your end.
        </Text>
        <Text style={sharedPara}>
          If you'd like to change your plan or update your payment method, you can do so
          from your subscription portal.
        </Text>

        <ActionButton href={dto.portalUrl} label="Manage subscription" subtitle={`Renews on ${renewalDateStr}`} />

        <InfoBox
          left={{ label: 'Current plan', value: dto.plan }}
          right={{ label: 'Next charge', value: PLAN_PRICE[dto.plan] }}
        />

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

SubscriptionRenewing.PreviewProps = {
  email: 'merchant@example.com',
  name: 'Riku',
  plan: Tier.PRO,
  renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  portalUrl: 'https://app.gomile.delivery/subscription/portal',
} satisfies SubscriptionRenewingProps;

export default SubscriptionRenewing
