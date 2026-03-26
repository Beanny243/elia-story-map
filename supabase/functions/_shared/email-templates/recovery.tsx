/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL = 'https://rzidgauuxcaymdjjqvlk.supabase.co/storage/v1/object/public/email-assets/eliamap-logo.png'

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your {SITE_NAME} password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="48" height="48" style={logoImg} />
          <Text style={logo}>{SITE_NAME}</Text>
        </Section>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your {SITE_NAME} password. Tap the button below to choose a new one:
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Reset Password
          </Button>
        </Section>
        <Text style={smallText}>
          This link will expire shortly. If you didn't request a password reset, you can safely ignore this email — your password won't change.
        </Text>
        <Section style={divider} />
        <Text style={footer}>
          © {SITE_NAME} · Every journey becomes a story.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#f5f0eb', fontFamily: "'Plus Jakarta Sans', 'Outfit', Arial, sans-serif" }
const container = { backgroundColor: '#ffffff', borderRadius: '16px', padding: '0', margin: '40px auto', maxWidth: '480px', border: '1px solid #e5e2de' }
const header = { backgroundColor: '#1D5A9E', borderRadius: '16px 16px 0 0', padding: '24px 32px', textAlign: 'center' as const }
const logoImg = { margin: '0 auto 8px', display: 'block' as const }
const logo = { color: '#ffffff', fontSize: '22px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#141D2B', margin: '32px 32px 12px', letterSpacing: '-0.5px' }
const text = { fontSize: '15px', color: '#646D7D', lineHeight: '1.6', margin: '0 32px 16px' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 32px' }
const button = { backgroundColor: '#EA6530', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '14px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const smallText = { fontSize: '13px', color: '#999999', lineHeight: '1.5', margin: '0 32px 24px' }
const divider = { borderTop: '1px solid #e5e2de', margin: '0 32px' }
const footer = { fontSize: '12px', color: '#999999', margin: '16px 32px 24px', textAlign: 'center' as const }
