import './v2/landing-v2.css'
import { V2PageWrapper } from './v2/V2Client'

const caseStudies = [
  {
    num: '01',
    title: 'Quizard AI',
    logo: 'quizard.ai',
    tags: ['Creator Seeding', 'TikTok', 'Education'],
    metric: '8M',
    metricLbl: 'Views',
    campaignType: 'Creator Seeding — AI Education',
    description: 'Narrative-driven creator campaign for an AI school app. Engineered emotional consumer stories to drive traffic, app downloads, and conversions at scale.',
    highlights: [
      { label: 'Total Views', value: '8M' },
      { label: 'Blended CPM', value: '$3.00' },
      { label: 'Campaign Focus', value: 'Conversion-optimised' },
      { label: 'Platform', value: 'TikTok' },
    ],
  },
  {
    num: '02',
    title: 'StealthGPT',
    logo: 'stealthgpt.app',
    tags: ['Organic Growth', 'AI Tools', 'Short-Form'],
    metric: '10.1M',
    metricLbl: 'Views',
    campaignType: 'Creator Seeding — AI Education',
    description: 'Activated nearly a dozen talking-head creators with engineered narratives in the AI-in-education sector, aligned with consumer sentiment and brand ICP.',
    highlights: [
      { label: 'Total Views', value: '10.1M' },
      { label: 'Blended CPM', value: '$1.50' },
      { label: 'Videos Tracked', value: '36' },
      { label: 'Avg. Engagement', value: '8.82%' },
    ],
  },
  {
    num: '03',
    title: 'Ryne AI',
    logo: 'ryne.ai',
    tags: ['Viral Launch', 'TikTok', 'AI'],
    metric: '10M',
    metricLbl: 'Views',
    campaignType: 'Creator Seeding — AI Productivity',
    description: 'Full-scale seeding campaign for an AI productivity tool. Rapid creator activation across TikTok with narrative hooks engineered for virality and app-install intent.',
    highlights: [
      { label: 'Total Views', value: '10M+' },
      { label: 'Platform', value: 'TikTok' },
      { label: 'Campaign Type', value: 'Viral Launch' },
      { label: 'Creator Tier', value: 'Mid — Macro' },
    ],
  },
  {
    num: '04',
    title: 'Haven',
    logo: 'haven.app',
    tags: ['Creator Seeding', 'TikTok', 'Faith & Wellness'],
    metric: '7M',
    metricLbl: 'Views',
    campaignType: 'Creator Seeding — Faith & Wellness',
    description: 'Seeded Haven\'s Bible app with faith and wellness creators on TikTok — organic integration into daily routine content that drove installs and sustained engagement.',
    highlights: [
      { label: 'Total Views', value: '7M' },
      { label: 'Platform', value: 'TikTok' },
      { label: 'Campaign Type', value: 'App Install' },
      { label: 'Creator Tier', value: 'Micro — Mid' },
    ],
  },
  {
    num: '05',
    title: 'Snapchat',
    logo: 'snapchat.com',
    tags: ['Brand Partnership', 'Multi-Platform', 'Talent Placement'],
    metric: '15+',
    metricLbl: 'Creators Placed',
    campaignType: 'Talent Placement — Platform Partnership',
    description: 'Delivered a creator network directly to Snapchat, facilitating monetization, verification, and town activations that strengthened the platform\'s creator economy.',
    highlights: [
      { label: 'Creators Placed', value: 'Dozens' },
      { label: 'Services', value: 'Monetization + Verification' },
      { label: 'Partnership Type', value: 'Direct Platform' },
      { label: 'Scope', value: 'Town Activations' },
    ],
  },
]

const services = [
  { num: '01', name: 'Creator Seeding', desc: "We engineer seeding campaigns that place your product in front of the right audience through an authentic creator voice. Data-driven, psychologically informed, virally engineered.", tags: ['TikTok', 'Instagram', 'YouTube'], geo: 'seeding' as const },
  { num: '02', name: 'Narrative Engineering', desc: "We don't write ads — we build narratives. Every campaign has a story architecture that guides how audiences discover, relate to, and share your brand.", tags: ['Scripting', 'Hooks', 'Storyboarding'], geo: 'narrative' as const },
  { num: '03', name: 'Media Buying', desc: "Precision media buying across TikTok, Meta, and Snap. We optimize for blended CPM below $2 and measurable ROAS, not vanity metrics.", tags: ['TikTok Ads', 'Meta', 'Snap'], geo: 'media' as const },
  { num: '04', name: 'Creator Management', desc: "Full-service talent coordination across our 50+ creator network — briefing, contract, content approval, and performance tracking in one pipeline.", tags: ['Talent', 'Contracts', 'Pipeline'], geo: 'mgmt' as const },
  { num: '05', name: 'Brand Strategy', desc: "From positioning to platform-specific playbooks. We help brands understand where they sit in culture, and how to move it.", tags: ['Positioning', 'Playbooks', 'Platform'], geo: 'strategy' as const },
  { num: '06', name: 'Campaign Analytics', desc: "Real-time dashboards, creator performance scoring, and transparent reporting. Know exactly where every dollar went and what it earned.", tags: ['Dashboard', 'Reporting', 'ROAS'], geo: 'analytics' as const },
]

const brands = [
  'Cal AI', 'StealthGPT', 'Quizard', 'Alpha Lion', 'Bucked Up',
  'PrizePicks', 'Sweatcoin', 'Fitbod', 'GoWish', 'BKFC',
  'Block Blast', '1st Phorm', 'Based Body Works', 'Plutus Gaming',
]

export default function Home() {
  // Everyone sees the landing page — sign in via nav button
  return <V2PageWrapper caseStudies={caseStudies} services={services} brands={brands} />
}
