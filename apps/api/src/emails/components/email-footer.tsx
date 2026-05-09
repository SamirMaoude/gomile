import * as React from 'react'
import { Section, Row, Column, Text } from 'react-email'
import { GomileLogo } from './gomile-logo'

interface EmailFooterProps {
  email: string;
}

const footer: React.CSSProperties = {
  backgroundColor: '#f7f9fb',
  borderTop: '1px solid #e2e8f0',
  padding: '18px 44px',
}

const footerBrand: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
}

const footerMeta: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#94a3b8',
  margin: '0',
}

const footerLinks: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#94a3b8',
  margin: '0',
  textAlign: 'right',
}

const footerLink: React.CSSProperties = {
  color: '#94a3b8',
  textDecoration: 'none',
}

export function EmailFooter({ email }: EmailFooterProps) {
  return (
    <Section style={footer}>
      <Row>
        <Column>
          <div style={footerBrand}>
            <GomileLogo />
            <Text style={footerMeta}>{email}</Text>
          </div>
        </Column>
        <Column align="right">
          <Text style={footerLinks}>
            <a href="{process.env.APP_URL}/faq" style={footerLink}>FAQ</a>
          </Text>
        </Column>
      </Row>
    </Section>
  )
}
