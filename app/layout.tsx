import type { Metadata } from 'next'
import { Syne, Fraunces } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SocialSculp Dashboard',
    template: '%s | SocialSculp',
  },
  description:
    'The all-in-one influencer marketing platform for brands and creators. Manage campaigns, track deals, and measure performance.',
  keywords: ['influencer marketing', 'creator campaigns', 'brand deals', 'social media analytics'],
  authors: [{ name: 'SocialSculp' }],
  creator: 'SocialSculp',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'SocialSculp Dashboard',
    description: 'The all-in-one influencer marketing platform for brands and creators.',
    siteName: 'SocialSculp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialSculp Dashboard',
    description: 'The all-in-one influencer marketing platform for brands and creators.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${syne.variable} ${fraunces.variable}`}
        suppressHydrationWarning
      >
        <body
          className={`${syne.variable} ${fraunces.variable} antialiased min-h-screen`}
          style={{ fontFamily: 'var(--font-syne), Syne, sans-serif' }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
