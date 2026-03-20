-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_deliverableId_fkey";

-- AlterTable
ALTER TABLE "campaign_reports" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "playing_with_neon";

-- CreateIndex
CREATE INDEX "campaign_reports_campaignId_idx" ON "campaign_reports"("campaignId");

-- CreateIndex
CREATE INDEX "posts_campaignId_idx" ON "posts"("campaignId");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

