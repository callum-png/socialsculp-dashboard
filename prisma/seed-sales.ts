/**
 * Seed sales data: Plutus Gaming call prep + company research
 *
 * Run with: npx tsx prisma/seed-sales.ts
 *
 * Requires a user with role ADMIN to exist in the DB.
 * Idempotent — updates research if call prep already exists.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any)

const PLUTUS_SECTIONS = [
  {
    title: 'About Plutus Gaming',
    body: 'AI-powered casual gaming platform. Users prompt AI to generate playable games, compete in skill-based head-to-head tournaments for real money. Dual currency: XP (free) + Coins (100 coins = $1 USD). Available on iOS + Android. Chance element capped below 5% — skill-based.',
  },
  {
    title: 'Agenda',
    body: '1. Intro & rapport\n2. Learn about their current UA mix and marketing goals\n3. Present SocialSculp creator seeding approach\n4. Walk through 3-phase playbook\n5. Discuss fit + next steps',
  },
  {
    title: 'Key Questions',
    body: '- What\'s your current user acquisition mix — where are you spending right now?\n- How has paid social performed for you? TikTok Ads, Meta?\n- Have you worked with creators or influencers before?\n- Who\'s your ideal player right now — specific segment you\'re trying to reach first?\n- What does a good new user look like — what actions matter in the first 7 days?\n- What\'s your rough UA budget per month, and is there flexibility to test new channels?\n- Do you have a timeline you\'re working toward — a launch campaign, seasonal push, funding milestone?\n- On the decision-making side — is it just you or are there other stakeholders involved?',
  },
  {
    title: 'Objection Handling',
    body: '"We\'ve tried influencer marketing before and it didn\'t work." → Most influencer campaigns are one-off placements. We do Phase 1 as a controlled test — 5–10 creators, small spend, multiple angles. You only scale what\'s proven.\n\n"Your CPM seems too good to be true." → $1–1.50 is at scale (Phase 3). Phase 1 runs slightly higher but still 5–10× more efficient than paid social. Creator content keeps earning views after the campaign ends.\n\n"We can build this in-house." → Sourcing vetted creators, managing briefs, tracking deliverables, monitoring 24/7 is a full-time team. Our 20+ AI agents do the monitoring. The question is whether your time is better spent on that or your product.\n\n"We don\'t have the budget right now." → At $15–30 CPM vs our $1–1.50, even reallocating $5K from paid ads would fund Phase 1. Small, controlled test.\n\n"We need proof in gaming specifically." → Gaming is one of our highest-performing categories. Plutus is a natural product fit — competitive real-money gaming, AI game creation, income potential. The brief writes itself.',
  },
  {
    title: 'Close',
    body: 'Goal: leave with a clear next action — either a proposal scope or a booked follow-up.\n\nIf interested: "I\'d love to put together a Phase 1 proposal specific to Plutus. What budget range are you comfortable starting with for a test?"\n\nIf not ready: "What would you need to see to feel confident moving forward?"\n\nIf needs sign-off: "Who else is involved — worth getting them on a short follow-up call?"\n\nBefore hanging up: Confirm next step. Book follow-up before the call ends. Send follow-up email within 2 hours with deck link (socialsculp.io/plutus).',
  },
]

const PLUTUS_RESEARCH = [
  {
    title: 'Company Snapshot',
    body: 'Plutus Gaming (plutus.gg) — AI-powered casual gaming platform. Users prompt AI to generate playable games, then compete in skill-based head-to-head tournaments for real money. Dual currency system: XP (free) + Coins (100 coins = $1 USD). Available on iOS and Android. Fair play: chance element capped below 5% (skill-based). Withdrawals: min $50, max $1,000 rolling 7-day via Card, Cash App, Apple Pay, Metamask, USDC. Unique angle: "Type idea → get game → tweak → done" — democratises game creation for non-coders.',
  },
  {
    title: 'Funding & Investors',
    body: 'Backed by a16z (Andreessen Horowitz) and Konvoy Ventures — both tier-1 gaming/tech investors. Well-capitalised for growth-stage marketing spend. a16z backing signals strong product and market confidence.',
  },
  {
    title: 'Product & Market',
    body: 'Competes with Skillz, Mistplay, and other casual gaming platforms. Key differentiator: AI-first game creation — users generate games via prompts rather than selecting from a fixed catalogue. Target audience: casual gamers, would-be game creators, and people seeking income streams through gaming. The AI generation angle is unique in the competitive gaming space.',
  },
  {
    title: 'Key People / Decision Makers',
    body: 'Research founders and leadership team via LinkedIn before the call. Identify who the marketing/growth lead is — likely the person on this call or their direct report. Check for CTO, CMO, Head of Growth roles. Note: with a16z backing, there may be board-level stakeholders in major marketing decisions.',
  },
  {
    title: 'Pain Points & Opportunities',
    body: '- Core pain: growing a player base against established casual game platforms without burning on ad-resistant gaming audiences\n- Gaming audiences are the most ad-resistant demographic online — paid social backfires\n- Paid social CPM runs $15–30+ for gaming audiences before a single conversion\n- Creator seeding is a natural fit: gaming audiences trust creators they follow\n- AI gaming is a hot vertical — creators will want to cover it organically\n- Likely haven\'t scaled creator partnerships yet (opportunity for SocialSculp to own that channel)\n- If a16z wants to see traction by Q2, there\'s urgency to find efficient UA channels',
  },
  {
    title: 'Platform & Monetisation Details',
    body: '- Platforms: iOS + Android\n- Currency: XP (free) + Coins (real money, 100 = $1)\n- Withdrawals: Min $50, Max $1,000 rolling 7-day\n- Payment methods: Card, Cash App, Apple Pay, Metamask, USDC\n- Fair play: Chance capped below 5% — skill-based gaming\n- Game creation: AI-powered, prompt-based ("type idea → get game → tweak → done")',
  },
  {
    title: 'Target Audience Segments',
    body: '- Casual mobile gamers looking for competitive play\n- Would-be game creators who can\'t code\n- People seeking income streams through gaming\n- Gen Z and younger millennials who are mobile-first\n- Crypto-adjacent audience (USDC/Metamask withdrawal support suggests web3 awareness)',
  },
]

async function main() {
  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) {
    console.error('No ADMIN user found — sign in as admin first, then re-run this seed.')
    process.exit(1)
  }

  const existing = await db.callPrep.findFirst({
    where: { prospect: 'Plutus Gaming' },
  })

  if (existing) {
    // Update with latest sections + research data
    await db.callPrep.update({
      where: { id: existing.id },
      data: {
        sections: PLUTUS_SECTIONS,
        research: PLUTUS_RESEARCH,
      },
    })
    console.log(`✓ Updated Plutus Gaming call prep with research: ${existing.id}`)
    return
  }

  const callPrep = await db.callPrep.create({
    data: {
      prospect: 'Plutus Gaming',
      company: 'plutus.gg',
      callType: 'Discovery Call',
      scheduledAt: new Date('2026-03-24T16:30:00Z'),
      sections: PLUTUS_SECTIONS,
      research: PLUTUS_RESEARCH,
      createdById: admin.id,
    },
  })

  console.log(`✓ Created Plutus Gaming call prep: ${callPrep.id}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
