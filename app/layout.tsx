import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.socialsculp.io'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: 'SocialSculp — Creator Seeding & Narrative Engineering Agency',
    template: '%s | SocialSculp',
  },

  description:
    'SocialSculp is a performance-driven creator seeding agency. We deliver 1.9B+ views at a $2 blended CPM through 50+ vetted creators across TikTok, Instagram, YouTube & Snapchat. Influencer marketing, elevated.',

  keywords: [
    'creator seeding agency',
    'influencer marketing agency',
    'narrative engineering',
    'social media agency',
    'TikTok influencer marketing',
    'Instagram creator campaigns',
    'UGC marketing',
    'viral marketing agency',
    'performance influencer marketing',
    'creator management agency',
    'media buying agency',
    'brand seeding',
    'social media growth',
    'TikTok ads agency',
    'content creator agency',
    'micro influencer marketing',
    'blended CPM optimization',
    'SocialSculp',
  ],

  authors: [{ name: 'SocialSculp', url: 'https://www.socialsculp.io' }],
  creator: 'SocialSculp',
  publisher: 'S23 Operations Ltd',
  category: 'Marketing Agency',

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#008CFF' }],
  },

  manifest: '/site.webmanifest',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.socialsculp.io',
    siteName: 'SocialSculp',
    title: 'SocialSculp — Creator Seeding & Narrative Engineering Agency',
    description:
      'We engineer narratives. We seed creators. We move culture at scale. 1.9B+ views, $2 blended CPM, 50+ creators, 20+ brands served.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SocialSculp — Creator Seeding & Narrative Engineering Agency',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@socialsculp',
    creator: '@socialsculp',
    title: 'SocialSculp — Creator Seeding & Narrative Engineering',
    description:
      '1.9B+ views at a $2 blended CPM. We engineer viral narratives through 50+ vetted creators on TikTok, Instagram & YouTube.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://www.socialsculp.io',
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
        className={jakarta.variable}
        suppressHydrationWarning
      >
        <head>
          <meta name="theme-color" content="#008CFF" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'SocialSculp',
                url: 'https://www.socialsculp.io',
                logo: 'https://www.socialsculp.io/favicon.svg',
                description:
                  'Performance-driven creator seeding agency. 1.9B+ views at a $2 blended CPM through 50+ vetted creators across TikTok, Instagram, YouTube & Snapchat.',
                foundingDate: '2024',
                sameAs: [
                  'https://twitter.com/socialsculp',
                  'https://instagram.com/socialsculp',
                ],
                contactPoint: {
                  '@type': 'ContactPoint',
                  email: 'business@socialsculp.io',
                  contactType: 'sales',
                },
              }),
            }}
          />
          <meta name="color-scheme" content="dark light" />
        </head>
        <body
          className={`${jakarta.variable} antialiased min-h-screen`}
          style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif' }}
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
