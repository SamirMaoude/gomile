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

export interface TrialExpiringProps {
  email: string;
  name: string;
  trialEndsAt: Date;
  upgradeUrl: string;
}

export function TrialExpiring(dto: TrialExpiringProps) {
  const expiryDate = dto.trialEndsAt.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <EmailShell preview="Your Gomile free trial expires in 10 days — upgrade to keep your store running" maxWidth="720px">

      <EmailHeader
        eyebrow="Trial ending soon"
        titleLine1="Your free trial"
        titleAccent="expires soon."
        subtitle={`Upgrade before ${expiryDate} to keep your store running without interruption.`}
      />

      <Section style={sharedBodySection}>
        <Text style={sharedGreeting}>Hi <strong>{dto.name}</strong>,</Text>
        <Text style={sharedPara}>
          Your free Gomile trial ends on <strong>{expiryDate}</strong>. After that date,
          your store will be locked and you won't be able to accept orders.
        </Text>
        <Text style={sharedPara}>
          Upgrade to PRO (€{TIER_PRICING.PRO}/month) or BUSINESS (€{TIER_PRICING.BUSINESS}/month) to keep everything running.
          You can cancel at any time.
        </Text>

        <ActionButton href={dto.upgradeUrl} label="Upgrade my plan" subtitle="Act before your trial ends" />

        <InfoBox
          left={{ label: 'Trial ends', value: expiryDate }}
          right={{ label: 'PRO plan', value: `€${TIER_PRICING.PRO} / month` }}
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

TrialExpiring.PreviewProps = {
  email: 'merchant@example.com',
  name: 'Riku',
  trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  upgradeUrl: 'https://app.gomile.delivery/upgrade',
} satisfies TrialExpiringProps;

export default TrialExpiring
