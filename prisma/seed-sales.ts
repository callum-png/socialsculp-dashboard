/**
 * Seed sales data: Plutus Gaming call prep
 *
 * Run with: npx tsx prisma/seed-sales.ts
 *
 * Requires a user with role ADMIN to exist in the DB.
 * Idempotent — skips if a CallPrep for Plutus Gaming already exists.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any)

async function main() {
  // Find first ADMIN user to use as createdBy
  const admin = await db.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) {
    console.error('No ADMIN user found — sign in as admin first, then re-run this seed.')
    process.exit(1)
  }

  const existing = await db.callPrep.findFirst({
    where: { prospect: 'Plutus Gaming' },
  })

  if (existing) {
    console.log('Plutus Gaming call prep already exists — skipping.')
    return
  }

  const callPrep = await db.callPrep.create({
    data: {
      prospect: 'Plutus Gaming',
      company: 'plutus.gg',
      callType: 'Discovery Call',
      scheduledAt: new Date('2026-03-24T15:00:00Z'),
      sections: [
        {
          title: 'About Plutus Gaming',
          body: 'Gaming platform — research their product and recent activity before the call.',
        },
        {
          title: 'Agenda',
          body: '1. Intro & rapport\n2. Learn about their marketing goals\n3. Present SocialSculp creator network\n4. Discuss fit + next steps',
        },
        {
          title: 'Key Questions',
          body: '- What platforms are you currently active on?\n- Have you run creator campaigns before?\n- What does success look like for Q2?\n- Who else is involved in the decision?',
        },
        {
          title: 'Objection Handling',
          body: 'Budget too high → emphasise ROI + flexible package options\nAlready have an agency → highlight our creator-native approach\nNot the right time → ask what would make it the right time',
        },
        {
          title: 'Close',
          body: 'Aim for a follow-up proposal call or send a tailored deck post-call.',
        },
      ],
      createdById: admin.id,
    },
  })

  console.log(`✓ Created Plutus Gaming call prep: ${callPrep.id}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
