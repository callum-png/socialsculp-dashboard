import './landing-v2.css'
import { V2PageWrapper } from './V2Client'

const caseStudies = [
  { num: '01', title: 'Quizard', tags: ['Creator Seeding', 'TikTok', 'Education'], metric: '62M+', metricLbl: 'Views' },
  { num: '02', title: 'StealthGPT', tags: ['Organic Growth', 'AI Tools', 'Short-Form'], metric: '28M', metricLbl: 'Views' },
  { num: '03', title: 'Ryne AI', tags: ['Viral Launch', 'TikTok', 'AI'], metric: '11M', metricLbl: 'Views' },
  { num: '04', title: 'Haven', tags: ['Lifestyle', 'Instagram', 'Creator Strategy'], metric: '8.4M', metricLbl: 'Views' },
  { num: '05', title: 'Snapchat', tags: ['Brand Partnership', 'Multi-Platform', 'UGC'], metric: '50+', metricLbl: 'Creators Seeded' },
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
