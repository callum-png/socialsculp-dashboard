/**
 * Wipe all placeholder/demo data — keeps the admin user and CRM leads/sales deals.
 * Run with: DATABASE_URL=... npx tsx prisma/cleanup.ts
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaPg({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🧹 Cleaning placeholder data…')

  // Order matters — child records first
  const deletedPosts = await db.post.deleteMany()
  console.log(`  ✓ Posts deleted: ${deletedPosts.count}`)

  const deletedDeliverables = await db.deliverable.deleteMany()
  console.log(`  ✓ Deliverables deleted: ${deletedDeliverables.count}`)

  const deletedStageEvents = await db.dealStageEvent.deleteMany()
  console.log(`  ✓ Deal stage events deleted: ${deletedStageEvents.count}`)

  const deletedDeals = await db.deal.deleteMany()
  console.log(`  ✓ Deals deleted: ${deletedDeals.count}`)

  const deletedSnapshots = await db.analyticsSnapshot.deleteMany()
  console.log(`  ✓ Analytics snapshots deleted: ${deletedSnapshots.count}`)

  const deletedReports = await db.campaignReport.deleteMany()
  console.log(`  ✓ Campaign reports deleted: ${deletedReports.count}`)

  const deletedCampaignCreators = await db.campaignCreator.deleteMany()
  console.log(`  ✓ Campaign creators deleted: ${deletedCampaignCreators.count}`)

  const deletedTasks = await db.adminTask.deleteMany()
  console.log(`  ✓ Admin tasks deleted: ${deletedTasks.count}`)

  const deletedCampaigns = await db.campaign.deleteMany()
  console.log(`  ✓ Campaigns deleted: ${deletedCampaigns.count}`)

  const deletedPlatformStats = await db.platformStat.deleteMany()
  console.log(`  ✓ Platform stats deleted: ${deletedPlatformStats.count}`)

  const deletedCreators = await db.creatorProfile.deleteMany()
  console.log(`  ✓ Creator profiles deleted: ${deletedCreators.count}`)

  const deletedBrands = await db.brandProfile.deleteMany()
  console.log(`  ✓ Brand profiles deleted: ${deletedBrands.count}`)

  // Delete placeholder users (seed users, not the real admin)
  const deleted = await db.user.deleteMany({
    where: {
      clerkId: { startsWith: 'seed_' },
    },
  })
  console.log(`  ✓ Placeholder users deleted: ${deleted.count}`)

  console.log('\n✅ Done. Only admin user and CRM leads remain.')
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
