import './landing-v2.css'
import { V2PageWrapper } from './V2Client'

const caseStudies = [
  { num: '01', title: 'Cal AI — 400M+ Impressions', tags: ['Creator Seeding', 'TikTok', 'Instagram'], metric: '400M+', metricLbl: 'Impressions' },
  { num: '02', title: 'GoWish — Viral Launch Campaign', tags: ['Narrative Engineering', 'Multi-Platform'], metric: '120+', metricLbl: 'Creators Seeded' },
  { num: '03', title: 'StealthGPT — Organic Growth Drive', tags: ['Creator Strategy', 'Short-Form Video'], metric: '$2', metricLbl: 'Blended CPM' },
  { num: '04', title: 'Alpha Lion — Sports Nutrition Seeding', tags: ['Fitness Vertical', 'UGC Strategy'], metric: '3.7M', metricLbl: 'Views Delivered' },
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

export default function V2Page() {
  return <V2PageWrapper caseStudies={caseStudies} services={services} brands={brands} />
}
