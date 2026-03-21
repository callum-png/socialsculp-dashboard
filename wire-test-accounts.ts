import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const db = new PrismaClient({ adapter } as any)

async function main() {
  // ── Admin ──────────────────────────────────────────────────────────────────
  await db.user.upsert({
    where: { clerkId: 'user_3BElnhhq6F6gYdfg2aMtTQNPIbY' },
    update: { role: 'ADMIN', email: 'admin@demo.socialsculp.io', name: 'Admin Demo' },
    create: { clerkId: 'user_3BElnhhq6F6gYdfg2aMtTQNPIbY', email: 'admin@demo.socialsculp.io', name: 'Admin Demo', role: 'ADMIN' },
  })
  console.log('✓ Admin wired')

  // ── Brand — link to Cal AI ─────────────────────────────────────────────────
  const brandUser = await db.user.upsert({
    where: { clerkId: 'user_3BEqjYgXkXxPa7liqTkAOSXKudy' },
    update: { role: 'BRAND', email: 'brand@demo.socialsculp.io', name: 'Cal AI (Demo)' },
    create: { clerkId: 'user_3BEqjYgXkXxPa7liqTkAOSXKudy', email: 'brand@demo.socialsculp.io', name: 'Cal AI (Demo)', role: 'BRAND' },
  })
  // Find Cal AI brand profile and reassign to this user
  const calAIBrand = await db.brandProfile.findFirst({ where: { companyName: 'Cal AI' } })
  if (calAIBrand) {
    await db.brandProfile.update({ where: { id: calAIBrand.id }, data: { userId: brandUser.id } })
    console.log('✓ Brand wired → Cal AI')
  } else {
    await db.brandProfile.create({ data: { userId: brandUser.id, companyName: 'Cal AI', industry: 'Technology', website: 'https://cal.ai' } })
    console.log('✓ Brand created → Cal AI')
  }

  // ── Creator — link to @ashtonhall ─────────────────────────────────────────
  const creatorUser = await db.user.upsert({
    where: { clerkId: 'user_3BErP18DIZDR3nra18pNZqoZQfi' },
    update: { role: 'CREATOR', email: 'creator@demo.socialsculp.io', name: 'Ashton Hall (Demo)' },
    create: { clerkId: 'user_3BErP18DIZDR3nra18pNZqoZQfi', email: 'creator@demo.socialsculp.io', name: 'Ashton Hall (Demo)', role: 'CREATOR' },
  })
  const ashton = await db.creatorProfile.findUnique({ where: { handle: '@ashtonhall' } })
  if (ashton) {
    await db.creatorProfile.update({ where: { id: ashton.id }, data: { userId: creatorUser.id } })
    console.log('✓ Creator wired → @ashtonhall')
  } else {
    await db.creatorProfile.create({ data: { userId: creatorUser.id, handle: '@ashtonhall', niche: ['Fitness','Lifestyle'], tiktokFollowers: 4200000, tiktokEngRate: 6.2, instagramFollowers: 1800000, instagramEngRate: 2.5, totalReach: 6000000, avgEngagement: 4.35 } })
    console.log('✓ Creator created → @ashtonhall')
  }

  // ── Agent ─────────────────────────────────────────────────────────────────
  await db.user.upsert({
    where: { clerkId: 'user_3BErP63z5sqONLzdjIKwbZKtPyz' },
    update: { role: 'AGENT', email: 'agent@demo.socialsculp.io', name: 'Agent Demo' },
    create: { clerkId: 'user_3BErP63z5sqONLzdjIKwbZKtPyz', email: 'agent@demo.socialsculp.io', name: 'Agent Demo', role: 'AGENT' },
  })
  console.log('✓ Agent wired')

  console.log('\n✅ All test accounts wired to DB.')
  await db.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
