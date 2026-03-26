/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const SITE_NAME = 'Eliamap'
const LOGO_URL = 'https://rzidgauuxcaymdjjqvlk.supabase.co/storage/v1/object/public/email-assets/eliamap-logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {SITE_NAME} verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="48" height="48" style={logoImg} />
          <Text style={logo}>{SITE_NAME}</Text>
        </Section>
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Section style={codeContainer}>
          <Text style={codeStyle}>{token}</Text>
        </Section>
        <Text style={smallText}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
        <Section style={divider} />
        <Text style={footer}>
          © {SITE_NAME} · Every journey becomes a story.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f5f0eb', fontFamily: "'Plus Jakarta Sans', 'Outfit', Arial, sans-serif" }
const container = { backgroundColor: '#ffffff', borderRadius: '16px', padding: '0', margin: '40px auto', maxWidth: '480px', border: '1px solid #e5e2de' }
const header = { backgroundColor: '#1D5A9E', borderRadius: '16px 16px 0 0', padding: '24px 32px', textAlign: 'center' as const }
const logoImg = { margin: '0 auto 8px', display: 'block' as const }
const logo = { color: '#ffffff', fontSize: '22px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#141D2B', margin: '32px 32px 12px', letterSpacing: '-0.5px' }
const text = { fontSize: '15px', color: '#646D7D', lineHeight: '1.6', margin: '0 32px 16px' }
const codeContainer = { textAlign: 'center' as const, margin: '16px 32px 24px', backgroundColor: '#f5f0eb', borderRadius: '14px', padding: '16px' }
const codeStyle = { fontFamily: "'Courier New', Courier, monospace", fontSize: '28px', fontWeight: 'bold' as const, color: '#1D5A9E', margin: '0', letterSpacing: '4px' }
const smallText = { fontSize: '13px', color: '#999999', lineHeight: '1.5', margin: '0 32px 24px' }
const divider = { borderTop: '1px solid #e5e2de', margin: '0 32px' }
const footer = { fontSize: '12px', color: '#999999', margin: '16px 32px 24px', textAlign: 'center' as const }
