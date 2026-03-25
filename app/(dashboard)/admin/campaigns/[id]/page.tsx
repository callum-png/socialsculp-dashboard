import CampaignDetailClient from './_components/CampaignDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params

  return <CampaignDetailClient campaignId={id} />
}
