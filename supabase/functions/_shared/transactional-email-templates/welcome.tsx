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
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Eliamap'
const LOGO_URL = 'https://rzidgauuxcaymdjjqvlk.supabase.co/storage/v1/object/public/email-assets/eliamap-logo.png'
const SITE_URL = 'https://eliamap.site'

interface WelcomeEmailProps {
  displayName?: string
}

const WelcomeEmail = ({ displayName }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — your adventure starts now! 🌍✈️</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO_URL} alt={SITE_NAME} width="48" height="48" style={logoImg} />
          <Text style={logo}>{SITE_NAME}</Text>
        </Section>
        <Heading style={h1}>
          {displayName ? `Hey ${displayName}, welcome aboard! 🎉` : 'Welcome aboard, explorer! 🎉'}
        </Heading>
        <Text style={text}>
          You've just joined a community of travelers who turn every journey into a story worth telling.
        </Text>
        <Text style={text}>
          Here's what you can do with {SITE_NAME}:
        </Text>
        <Section style={featureList}>
          <Text style={featureItem}>🗺️ <strong>Plan your trips</strong> — add stops, set dates, and organize your itinerary</Text>
          <Text style={featureItem}>📸 <strong>Capture memories</strong> — save photos and moments from every destination</Text>
          <Text style={featureItem}>🌍 <strong>Track your map</strong> — see everywhere you've been on your personal world map</Text>
          <Text style={featureItem}>👥 <strong>Join the community</strong> — share tips and discover hidden gems from fellow explorers</Text>
        </Section>
        <Section style={buttonContainer}>
          <Button style={button} href={SITE_URL}>
            Start Exploring
          </Button>
        </Section>
        <Text style={smallText}>
          Every journey becomes a story. We can't wait to see yours.
        </Text>
        <Section style={divider} />
        <Text style={footer}>
          © {SITE_NAME} · Every journey becomes a story.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to Eliamap — your adventure starts now! 🌍',
  displayName: 'Welcome email',
  previewData: { displayName: 'Explorer' },
} satisfies TemplateEntry

const main = { backgroundColor: '#f5f0eb', fontFamily: "'Plus Jakarta Sans', 'Outfit', Arial, sans-serif" }
const container = { backgroundColor: '#ffffff', borderRadius: '16px', padding: '0', margin: '40px auto', maxWidth: '480px', border: '1px solid #e5e2de' }
const header = { backgroundColor: '#1D5A9E', borderRadius: '16px 16px 0 0', padding: '24px 32px', textAlign: 'center' as const }
const logoImg = { margin: '0 auto 8px', display: 'block' as const }
const logo = { color: '#ffffff', fontSize: '22px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#141D2B', margin: '32px 32px 12px', letterSpacing: '-0.5px' }
const text = { fontSize: '15px', color: '#646D7D', lineHeight: '1.6', margin: '0 32px 16px' }
const featureList = { margin: '8px 32px 24px' }
const featureItem = { fontSize: '14px', color: '#646D7D', lineHeight: '1.6', margin: '0 0 10px', paddingLeft: '4px' }
const buttonContainer = { textAlign: 'center' as const, margin: '24px 32px' }
const button = { backgroundColor: '#EA6530', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '14px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const smallText = { fontSize: '13px', color: '#999999', lineHeight: '1.5', margin: '0 32px 24px', textAlign: 'center' as const, fontStyle: 'italic' as const }
const divider = { borderTop: '1px solid #e5e2de', margin: '0 32px' }
const footer = { fontSize: '12px', color: '#999999', margin: '16px 32px 24px', textAlign: 'center' as const }
