import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SocialSculp — Creator Seeding & Narrative Engineering',
    template: '%s | SocialSculp',
  },
  description:
    'SocialSculp is a Louisiana-based influencer marketing and narrative engineering agency. We drive viral reach through strategic creator seeding, media buying, and performance campaigns. 1.9B+ views managed.',
  keywords: [
    'influencer marketing',
    'creator seeding',
    'narrative engineering',
    'social media agency',
    'TikTok marketing',
    'Instagram influencers',
    'media buying',
    'performance marketing',
    'Louisiana agency',
    'creator management',
  ],
  authors: [{ name: 'SocialSculp' }],
  creator: 'SocialSculp',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.socialsculp.io'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.socialsculp.io',
    title: 'SocialSculp — Creator Seeding & Narrative Engineering',
    description:
      'We engineer narratives. We seed creators. We move culture at scale. 1.9B+ views managed, $2 blended CPM, 50+ creators, 20+ brands.',
    siteName: 'SocialSculp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SocialSculp — Creator Seeding & Narrative Engineering',
    description:
      'We engineer narratives. We seed creators. We move culture at scale. 1.9B+ views, $2 CPM.',
    site: '@socialsculp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
        <body
          className={`${jakarta.variable} antialiased min-h-screen`}
          style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif' }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
