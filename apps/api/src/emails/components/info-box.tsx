import * as React from 'react'
import { Row, Column, Text } from 'react-email'
import { colors } from './email-tokens'

interface InfoBoxProps {
  left: { label: string; value: string };
  right: { label: string; value: string };
}

export function InfoBox({ left, right }: InfoBoxProps) {
  return (
    <div style={box}>
      <Row>
        <Column style={col}>
          <Text style={label}>{left.label}</Text>
          <Text style={value}>{left.value}</Text>
        </Column>
        <Column style={colRight}>
          <Text style={label}>{right.label}</Text>
          <Text style={value}>{right.value}</Text>
        </Column>
      </Row>
    </div>
  )
}

const box: React.CSSProperties = {
  backgroundColor: colors.bgLight,
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  padding: '16px 20px',
  margin: '20px 0',
}

const col: React.CSSProperties = {
  width: '50%',
}

const colRight: React.CSSProperties = {
  width: '50%',
  textAlign: 'right',
}

const label: React.CSSProperties = {
  fontSize: '11px',
  color: colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '0 0 2px',
}

const value: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: colors.textPrimary,
  margin: '0',
}
