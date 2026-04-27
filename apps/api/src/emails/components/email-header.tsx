import * as React from 'react'
import { Section, Row, Column, Text } from 'react-email'
import { LogoLockup } from './logo-lockup'
import { colors } from './email-tokens'

interface EmailHeaderProps {
  eyebrow: string;
  titleLine1: string;
  titleAccent: string;
  subtitle: string;
}

export function EmailHeader({ eyebrow, titleLine1, titleAccent, subtitle }: EmailHeaderProps) {
  return (
    <Section style={header}>
      <Row>
        <Column>
          <div style={{ marginBottom: '28px' }}>
            <LogoLockup />
          </div>
          <Text style={headerEyebrow}>{eyebrow}</Text>
          <Text style={headerTitle}>
            {titleLine1}<br />
            <span style={{ color: colors.green }}>{titleAccent}</span>
          </Text>
          <div style={headerRule} />
          <Text style={headerSubtitle}>{subtitle}</Text>
        </Column>
      </Row>
    </Section>
  )
}

const header: React.CSSProperties = {
  backgroundColor: colors.dark,
  padding: '32px 44px 40px',
}

const headerEyebrow: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.20em',
  textTransform: 'uppercase',
  color: colors.green,
  margin: '0 0 12px',
}

const headerTitle: React.CSSProperties = {
  fontSize: '42px',
  fontWeight: 700,
  color: colors.white,
  letterSpacing: '-0.04em',
  lineHeight: '0.95',
  margin: '0 0 16px',
}

const headerRule: React.CSSProperties = {
  width: '40px',
  height: '2px',
  backgroundColor: colors.green,
  borderRadius: '2px',
  marginBottom: '14px',
}

const headerSubtitle: React.CSSProperties = {
  fontSize: '13.5px',
  color: 'rgba(255,255,255,0.4)',
  lineHeight: '1.6',
  margin: '0',
}
