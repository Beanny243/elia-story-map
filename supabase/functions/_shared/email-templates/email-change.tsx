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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

const SITE_NAME = 'Eliamap'

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>🌍 {SITE_NAME}</Text>
        </Section>
        <Heading style={h1}>Confirm email change</Heading>
        <Text style={text}>
          You requested to change your {SITE_NAME} email from{' '}
          <strong>{email}</strong> to <strong>{newEmail}</strong>.
        </Text>
        <Text style={text}>
          Tap below to confirm this change:
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email Change
          </Button>
        </Section>
        <Text style={smallText}>
          If you didn't request this change, please secure your account immediately.
        </Text>
        <Section style={divider} />
        <Text style={footer}>
          © {SITE_NAME} · Every journey becomes a story.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#f5f0eb', fontFamily: "'Plus Jakarta Sans', 'Outfit', Arial, sans-serif" }
const container = { backgroundColor: '#ffffff', borderRadius: '16px', padding: '0', margin: '40px auto', maxWidth: '480px', border: '1px solid #e5e2de' }
const header = { backgroundColor: '#1D5A9E', borderRadius: '16px 16px 0 0', padding: '24px 32px', textAlign: 'center' as const }
const logo = { color: '#ffffff', fontSize: '22px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#141D2B', margin: '32px 32px 12px', letterSpacing: '-0.5px' }
const text = { fontSize: '15px', color: '#646D7D', lineHeight: '1.6', margin: '0 32px 16px' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 32px' }
const button = { backgroundColor: '#EA6530', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '14px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const smallText = { fontSize: '13px', color: '#999999', lineHeight: '1.5', margin: '0 32px 24px' }
const divider = { borderTop: '1px solid #e5e2de', margin: '0 32px' }
const footer = { fontSize: '12px', color: '#999999', margin: '16px 32px 24px', textAlign: 'center' as const }
