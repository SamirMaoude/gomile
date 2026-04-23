import * as React from 'react'
import { Html, Head, Preview, Body, Container } from 'react-email'
import { sharedBody, sharedContainer } from './shared-styles'

interface EmailShellProps {
  preview: string;
  maxWidth?: string;
  children: React.ReactNode;
}
// email format
export function EmailShell({ preview, maxWidth = '520px', children }: EmailShellProps) {
  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');');`}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={sharedBody}>
        <Container style={sharedContainer(maxWidth)}>
          {children}
        </Container>
      </Body>
    </Html>
  )
}
