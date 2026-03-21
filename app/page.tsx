import './landing.css'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Script from 'next/script'
import { CanvasBackground } from '@/app/components/CanvasBackground'
import { ServiceModal } from '@/app/components/ServiceModal'
import { LoadingScreen } from '@/app/components/LoadingScreen'
import { HeroSparkles } from '@/app/components/HeroSparkles'

export default async function Home() {
  const { userId } = await auth()
  if (userId) {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string | undefined
    const status = user.publicMetadata?.status as string | undefined
    if (role && status !== 'PENDING') {
      switch (role) {
        case 'ADMIN': redirect('/admin')
        case 'AGENT': redirect('/agent')
        case 'CREATOR': redirect('/creator')
        case 'BRAND': redirect('/brand')
      }
    }
  }

  return (
    <>
      <LoadingScreen />

      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Figtree:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* ==========================================
           PREMIUM BACKGROUND (canvas-based)
           ========================================== */}
      <canvas id="bg-canvas" aria-hidden="true"></canvas>
      <div className="bg-dots" aria-hidden="true"></div>
      <div className="bg-grain" aria-hidden="true"></div>

      <main>

        {/* ==========================================
             NAVIGATION
             ========================================== */}
        <nav id="nav">
          <a href="#" className="nav-logo">SOCIAL<span>SCULP</span></a>
          <ul className="nav-links">
            <li><a href="#work">Work</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#creators">Talent</a></li>
            <li><a href="#proof">Clients</a></li>
          </ul>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <a href="/sign-in" className="btn btn-portal" style={{padding:'9px 18px',fontSize:'10.5px'}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Sign In
            </a>
            <a href="/sign-up" className="btn btn-ghost" style={{padding:'9px 18px',fontSize:'10.5px'}}>Get Started</a>
          </div>
        </nav>

        {/* ==========================================
             HERO
             ========================================== */}
        <section id="hero" style={{position:'relative'}}>
          <HeroSparkles />
          <div style={{maxWidth:'460px',marginLeft:'auto',marginRight:'auto'}}>
            <div className="hero-eyebrow">
              <div className="live-dot"></div>
              <span className="t-label">Social Media Sculptors</span>
            </div>

            <h1 className="hero-headline">
              We Engineer Narratives.<br />
              We Seed <span className="accent">Creators.</span><br />
              We Move Culture at Scale.
            </h1>

            <p className="hero-sub">
              SocialSculp is a data-driven narrative engineering agency. We turn consumer psychology into viral reach through strategic creator seeding - influencer marketing, elevated. We empower brands and consumer apps to grow at scale.
            </p>

            <div className="hero-ctas">
              <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Book a Call</a>
              <a href="#work" className="btn btn-ghost">View Case Studies</a>
            </div>
          </div>

          {/* Campaign explosion visual */}
          <div className="hero-visual">
            <div className="hero-visual-glow" aria-hidden="true"></div>
            <div className="explosion-hub">
              {/* Ripple rings */}
              <div className="ripple r1"></div>
              <div className="ripple r2"></div>
              <div className="ripple r3"></div>

              {/* SVG connector lines hub to orbs */}
              <svg className="hub-lines" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <line x1="140" y1="140" x2="262" y2="28"  stroke="rgba(0,140,255,0.15)" strokeWidth="1" strokeDasharray="3 5"/>
                <line x1="140" y1="140" x2="268" y2="248" stroke="rgba(0,140,255,0.12)" strokeWidth="1" strokeDasharray="3 5"/>
                <line x1="140" y1="140" x2="18"  y2="46"  stroke="rgba(0,140,255,0.15)" strokeWidth="1" strokeDasharray="3 5"/>
                <line x1="140" y1="140" x2="14"  y2="242" stroke="rgba(0,140,255,0.12)" strokeWidth="1" strokeDasharray="3 5"/>
              </svg>

              {/* Mini content tiles (floating video posts) */}
              <div className="content-tile ct1"><div className="ct-thumb"></div><div className="ct-engage">2.1M</div></div>
              <div className="content-tile ct2"><div className="ct-thumb"></div><div className="ct-engage">890K</div></div>
              <div className="content-tile ct3"><div className="ct-thumb"></div><div className="ct-engage">3.7M</div></div>

              {/* Rotating orbit dot */}
              <div className="hub-orbit" aria-hidden="true"></div>

              {/* Core stat sphere */}
              <div className="hub-core">
                <div className="hub-val"><span id="hub-counter">1.9</span><span className="hub-suffix">B+</span></div>
                <div className="hub-lbl">All-Time Views</div>
              </div>

              {/* Floating stat chips */}
              <div className="orb orb-cpm"><div className="orb-val">$2</div><div className="orb-lbl">Blended CPM</div></div>
              <div className="orb orb-creators"><div className="orb-val">50+</div><div className="orb-lbl">Creators</div></div>
              <div className="orb orb-reach"><div className="orb-val">20+</div><div className="orb-lbl">Brands Served</div></div>
              <div className="orb orb-brands"><div className="orb-val">&#8734;</div><div className="orb-lbl">Scale</div></div>

              {/* Live indicator */}
              <div className="exp-live">
                <div className="live-badge-dot"></div>
                Live Campaigns
              </div>
            </div>
          </div>

          <div className="scroll-hint">
            <div className="scroll-line"></div>
            <span className="t-label" style={{fontSize:'8.5px'}}>Scroll</span>
          </div>

          <CanvasBackground />
        </section>

        {/* Brand marquee — directly below hero */}
        <div className="brands-marquee-wrap" style={{marginTop:'48px'}}>
          <div className="brands-marquee">
            <span className="brand-item">Whop</span>
            <span className="brand-item">BKFC</span>
            <span className="brand-item">Snapchat</span>
            <span className="brand-item">TikTok</span>
            <span className="brand-item">Cal AI</span>
            <span className="brand-item">Block Blast</span>
            <span className="brand-item">StealthGPT</span>
            <span className="brand-item">Quizard</span>
            <span className="brand-item">Unstuck</span>
            <span className="brand-item">Haven</span>
            <span className="brand-item">Alpha Lion</span>
            <span className="brand-item">Bucked Up</span>
            <span className="brand-item">C4</span>
            <span className="brand-item">Based Body Works</span>
            <span className="brand-item">Sweatcoin</span>
            <span className="brand-item">GoWish</span>
            <span className="brand-item">Fitbod</span>
            <span className="brand-item">PrizePicks</span>
            <span className="brand-item">Olive</span>
            <span className="brand-item">MenuFit</span>
            <span className="brand-item">1st Phorm</span>
            {/* Duplicate for seamless loop */}
            <span className="brand-item">Whop</span>
            <span className="brand-item">BKFC</span>
            <span className="brand-item">Snapchat</span>
            <span className="brand-item">TikTok</span>
            <span className="brand-item">Cal AI</span>
            <span className="brand-item">Block Blast</span>
            <span className="brand-item">StealthGPT</span>
            <span className="brand-item">Quizard</span>
            <span className="brand-item">Unstuck</span>
            <span className="brand-item">Haven</span>
            <span className="brand-item">Alpha Lion</span>
            <span className="brand-item">Bucked Up</span>
            <span className="brand-item">C4</span>
            <span className="brand-item">Based Body Works</span>
            <span className="brand-item">Sweatcoin</span>
            <span className="brand-item">GoWish</span>
            <span className="brand-item">Fitbod</span>
            <span className="brand-item">PrizePicks</span>
            <span className="brand-item">Olive</span>
            <span className="brand-item">MenuFit</span>
            <span className="brand-item">1st Phorm</span>
          </div>
        </div>

        {/* ==========================================
             SERVICES
             ========================================== */}
        <section id="services">
          <div className="svc-header reveal">
            <div>
              <div className="eyebrow"><span className="t-label">What We Offer</span></div>
              <h2 className="section-title">Strategy. Seeding.<br />Results.</h2>
            </div>
            <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Work With Us</a>
          </div>

          <div className="svc-big-grid reveal d1">
            {/* Creator Seeding (primary) — Creator Network Visualization */}
            <div className="svc-big">
              <div className="svc-art">
                <svg viewBox="0 0 560 280" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="cg1" cx="50%" cy="50%" r="55%">
                      <stop offset="0%" stopColor="#008CFF" stopOpacity="0.32"/>
                      <stop offset="70%" stopColor="#008CFF" stopOpacity="0.08"/>
                      <stop offset="100%" stopColor="#008CFF" stopOpacity="0"/>
                    </radialGradient>
                    <radialGradient id="cg1b" cx="50%" cy="50%" r="40%">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.18"/>
                      <stop offset="100%" stopColor="#00D4FF" stopOpacity="0"/>
                    </radialGradient>
                    <filter id="glow1">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect width="560" height="280" fill="#060C1C"/>
                  <ellipse cx="280" cy="140" rx="220" ry="150" fill="url(#cg1)"/>
                  <ellipse cx="280" cy="140" rx="120" ry="90" fill="url(#cg1b)"/>
                  <circle cx="280" cy="140" r="100" fill="none" stroke="#008CFF" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="4 8"/>
                  <circle cx="280" cy="140" r="65"  fill="none" stroke="#008CFF" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 6"/>
                  <line x1="298" y1="124" x2="428" y2="60" stroke="#008CFF" strokeWidth="1.5" strokeOpacity="0.75" strokeDasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="0.9s" repeatCount="indefinite"/>
                  </line>
                  <line x1="308" y1="140" x2="464" y2="140" stroke="#008CFF" strokeWidth="1.5" strokeOpacity="0.68" strokeDasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.2s" repeatCount="indefinite"/>
                  </line>
                  <line x1="298" y1="156" x2="428" y2="220" stroke="#008CFF" strokeWidth="1.5" strokeOpacity="0.75" strokeDasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.0s" repeatCount="indefinite"/>
                  </line>
                  <line x1="262" y1="124" x2="138" y2="60" stroke="#00D4FF" strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="22" dur="1.3s" repeatCount="indefinite"/>
                  </line>
                  <line x1="252" y1="140" x2="100" y2="140" stroke="#00D4FF" strokeWidth="1.2" strokeOpacity="0.45" strokeDasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="22" dur="1.6s" repeatCount="indefinite"/>
                  </line>
                  <line x1="262" y1="156" x2="138" y2="220" stroke="#00D4FF" strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="22" dur="1.1s" repeatCount="indefinite"/>
                  </line>
                  <circle cx="280" cy="140" r="44" fill="none" stroke="#008CFF" strokeOpacity="0.22" strokeWidth="1.5">
                    <animate attributeName="r" values="44;58;44" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="stroke-opacity" values="0.22;0;0.22" dur="3s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="280" cy="140" r="30" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.8" strokeWidth="1.5"/>
                  <circle cx="280" cy="140" r="20" fill="#008CFF" opacity="0.95" filter="url(#glow1)"/>
                  <text x="280" y="144" fontFamily="Syne" fontWeight="800" fontSize="9" fill="white" textAnchor="middle">SS</text>
                  <circle cx="440" cy="60"  r="24" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.75" strokeWidth="1.5"/>
                  <circle cx="440" cy="52"  r="10" fill="#1E3558"/>
                  <path d="M424 65 Q440 75 456 65" stroke="#1E3558" strokeWidth="2.5" fill="none"/>
                  <circle cx="457" cy="44" r="8" fill="#008CFF" opacity="0.95">
                    <animate attributeName="opacity" values="0.95;0.5;0.95" dur="2.2s" repeatCount="indefinite"/>
                  </circle>
                  <path d="M453 44 L456 47 L463 40" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                  <circle cx="475" cy="140" r="22" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.65" strokeWidth="1.5"/>
                  <circle cx="475" cy="132" r="9"  fill="#1E3558"/>
                  <path d="M461 145 Q475 155 489 145" stroke="#1E3558" strokeWidth="2" fill="none"/>
                  <circle cx="440" cy="220" r="24" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.75" strokeWidth="1.5"/>
                  <circle cx="440" cy="212" r="10" fill="#1E3558"/>
                  <path d="M424 225 Q440 235 456 225" stroke="#1E3558" strokeWidth="2.5" fill="none"/>
                  <circle cx="120" cy="60"  r="20" fill="#0A1828" stroke="#00D4FF" strokeOpacity="0.55" strokeWidth="1.2"/>
                  <circle cx="120" cy="53"  r="8"  fill="#142434"/>
                  <circle cx="85"  cy="140" r="18" fill="#0A1828" stroke="#00D4FF" strokeOpacity="0.45" strokeWidth="1.2"/>
                  <circle cx="120" cy="220" r="20" fill="#0A1828" stroke="#00D4FF" strokeOpacity="0.55" strokeWidth="1.2"/>
                  <circle cx="120" cy="213" r="8"  fill="#142434"/>
                  <circle r="4" fill="#008CFF" opacity="0.95" filter="url(#glow1)">
                    <animateMotion path="M280,140 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0" dur="6s" repeatCount="indefinite"/>
                  </circle>
                  <circle r="2.5" fill="#00D4FF" opacity="0.75">
                    <animateMotion path="M280,140 m-100,0 a100,100 0 1,1 200,0 a100,100 0 1,1 -200,0" dur="9s" repeatCount="indefinite"/>
                  </circle>
                  <circle r="2" fill="#ffffff" opacity="0.5">
                    <animateMotion path="M280,140 m-65,0 a65,65 0 1,0 130,0 a65,65 0 1,0 -130,0" dur="4s" repeatCount="indefinite"/>
                  </circle>
                  <rect x="168" y="228" width="136" height="38" rx="6" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.55" strokeWidth="1"/>
                  <text x="236" y="245" fontFamily="Syne" fontWeight="700" fontSize="13" fill="#008CFF" textAnchor="middle">50+ Creators</text>
                  <text x="236" y="258" fontFamily="Syne" fontWeight="600" fontSize="8.5" fill="#6A8FA8" textAnchor="middle">ACTIVE NETWORK</text>
                </svg>
                <div className="svc-fade"></div>
              </div>
              <div className="svc-body">
                <div className="svc-num">01 - Service</div>
                <div className="svc-name">Creator Seeding</div>
                <ServiceModal num="01 — Creator Seeding" name="Creator Seeding" description="We don't just connect you with creators — we engineer the narrative. Our data-driven seeding strategy matches your brand with the right creators at the right moment, turning consumer psychology into measurable viral reach. Influencer marketing, elevated." />
              </div>
            </div>

            {/* Media Buying (primary) — Omnichannel Media Grid */}
            <div className="svc-big">
              <div className="svc-art">
                <svg viewBox="0 0 560 240" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="mg2" cx="50%" cy="46%" r="52%">
                      <stop offset="0%" stopColor="#008CFF" stopOpacity="0.28"/>
                      <stop offset="65%" stopColor="#008CFF" stopOpacity="0.07"/>
                      <stop offset="100%" stopColor="#008CFF" stopOpacity="0"/>
                    </radialGradient>
                    <radialGradient id="mg2b" cx="50%" cy="50%" r="35%">
                      <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="#00D4FF" stopOpacity="0"/>
                    </radialGradient>
                    <filter id="glow2">
                      <feGaussianBlur stdDeviation="2.5" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect width="560" height="240" fill="#050A16"/>
                  <ellipse cx="280" cy="120" rx="240" ry="130" fill="url(#mg2)"/>
                  <ellipse cx="280" cy="108" rx="140" ry="80" fill="url(#mg2b)"/>
                  <line x1="280" y1="182" x2="0"   y2="240" stroke="#008CFF" strokeOpacity="0.1" strokeWidth="1"/>
                  <line x1="280" y1="182" x2="120" y2="240" stroke="#008CFF" strokeOpacity="0.1" strokeWidth="1"/>
                  <line x1="280" y1="182" x2="220" y2="240" stroke="#008CFF" strokeOpacity="0.1" strokeWidth="1"/>
                  <line x1="280" y1="182" x2="340" y2="240" stroke="#008CFF" strokeOpacity="0.1" strokeWidth="1"/>
                  <line x1="280" y1="182" x2="440" y2="240" stroke="#008CFF" strokeOpacity="0.1" strokeWidth="1"/>
                  <line x1="280" y1="182" x2="560" y2="240" stroke="#008CFF" strokeOpacity="0.1" strokeWidth="1"/>
                  <rect x="192" y="42" width="176" height="122" rx="10" fill="none" stroke="#008CFF" strokeOpacity="0.07" strokeWidth="12"/>
                  <rect x="200" y="48" width="160" height="110" rx="6" fill="#0C1E36" stroke="#008CFF" strokeOpacity="0.88" strokeWidth="2"/>
                  <rect x="208" y="56" width="144" height="80" rx="3" fill="#060E1E"/>
                  <rect x="215" y="84" width="12" height="52" rx="2" fill="#008CFF" opacity="0.45">
                    <animate attributeName="height" values="52;36;60;52" dur="2.2s" repeatCount="indefinite"/>
                    <animate attributeName="y" values="84;100;76;84" dur="2.2s" repeatCount="indefinite"/>
                  </rect>
                  <rect x="231" y="74" width="12" height="62" rx="2" fill="#008CFF" opacity="0.62">
                    <animate attributeName="height" values="62;78;46;62" dur="1.9s" repeatCount="indefinite"/>
                    <animate attributeName="y" values="74;58;90;74" dur="1.9s" repeatCount="indefinite"/>
                  </rect>
                  <rect x="247" y="62" width="12" height="74" rx="2" fill="#008CFF" opacity="0.80">
                    <animate attributeName="height" values="74;56;82;74" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="y" values="62;80;54;62" dur="2.5s" repeatCount="indefinite"/>
                  </rect>
                  <rect x="263" y="56" width="12" height="80" rx="2" fill="#008CFF" opacity="1" filter="url(#glow2)">
                    <animate attributeName="height" values="80;62;86;80" dur="2.0s" repeatCount="indefinite"/>
                    <animate attributeName="y" values="56;74;50;56" dur="2.0s" repeatCount="indefinite"/>
                  </rect>
                  <rect x="279" y="64" width="12" height="72" rx="2" fill="#008CFF" opacity="0.88">
                    <animate attributeName="height" values="72;54;80;72" dur="1.7s" repeatCount="indefinite"/>
                    <animate attributeName="y" values="64;82;56;64" dur="1.7s" repeatCount="indefinite"/>
                  </rect>
                  <rect x="295" y="72" width="12" height="64" rx="2" fill="#008CFF" opacity="0.72">
                    <animate attributeName="height" values="64;80;50;64" dur="2.7s" repeatCount="indefinite"/>
                    <animate attributeName="y" values="72;56;86;72" dur="2.7s" repeatCount="indefinite"/>
                  </rect>
                  <rect x="311" y="80" width="12" height="56" rx="2" fill="#008CFF" opacity="0.55">
                    <animate attributeName="height" values="56;40;64;56" dur="2.3s" repeatCount="indefinite"/>
                    <animate attributeName="y" values="80;96;72;80" dur="2.3s" repeatCount="indefinite"/>
                  </rect>
                  <rect x="327" y="88" width="12" height="48" rx="2" fill="#008CFF" opacity="0.40">
                    <animate attributeName="height" values="48;64;36;48" dur="2.1s" repeatCount="indefinite"/>
                    <animate attributeName="y" values="88;72;100;88" dur="2.1s" repeatCount="indefinite"/>
                  </rect>
                  <rect x="272" y="158" width="16" height="8"  rx="2" fill="#0C1E36" stroke="#1A3050"/>
                  <rect x="256" y="165" width="48" height="3"  rx="2" fill="#1A3050"/>
                  <rect x="406" y="72" width="88" height="52" rx="4" fill="#0C1E36" stroke="#008CFF" strokeOpacity="0.65" strokeWidth="1.5"/>
                  <rect x="412" y="78" width="76" height="38" rx="3" fill="#060E1E"/>
                  <text x="450" y="95"  fontFamily="Syne" fontWeight="600" fontSize="6.5" fill="#5A8FBB" textAnchor="middle" letterSpacing="1">SOCIAL</text>
                  <text x="450" y="106" fontFamily="Syne" fontWeight="800" fontSize="8"   fill="#008CFF" textAnchor="middle" letterSpacing="0.5">PR</text>
                  <line x1="432" y1="124" x2="426" y2="168" stroke="#1A3050" strokeWidth="2"/>
                  <line x1="468" y1="124" x2="474" y2="168" stroke="#1A3050" strokeWidth="2"/>
                  <line x1="426" y1="148" x2="474" y2="148" stroke="#1A3050" strokeWidth="1.5"/>
                  <line x1="406" y1="100" x2="360" y2="104" stroke="#00D4FF" strokeWidth="1.2" strokeOpacity="0.6" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="0" to="16" dur="1.1s" repeatCount="indefinite"/>
                  </line>
                  <circle r="2.5" fill="#00D4FF" opacity="0.9" filter="url(#glow2)">
                    <animateMotion path="M406,100 L360,104" dur="1.1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <div className="svc-fade" style={{background: 'linear-gradient(to top, var(--clr-bg) 6%, rgba(4,6,14,0.03) 38%, transparent 100%)'}}></div>
              </div>
              <div className="svc-body">
                <div className="svc-num">02 - Service</div>
                <div className="svc-name">Media Buying</div>
                <ServiceModal num="02 — Media Buying" name="Media Buying" description="Strategic media buying and PPV/CPM campaigns optimized for ROI. We connect every channel — from social to billboard — with data-driven targeting and conversion mechanics that turn reach into measurable revenue." />
              </div>
            </div>
          </div>

          <div className="svc-big-grid reveal d2">
            {/* Creative Production */}
            <div className="svc-big">
              <div className="svc-art">
                <svg viewBox="0 0 560 280" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="cg3" cx="50%" cy="45%" r="60%">
                      <stop offset="0%" stopColor="#008CFF" stopOpacity="0.18"/>
                      <stop offset="100%" stopColor="#008CFF" stopOpacity="0"/>
                    </radialGradient>
                    <filter id="glow3">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <pattern id="cp-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="12" cy="12" r="0.75" fill="#008CFF" fillOpacity="0.18"/>
                    </pattern>
                  </defs>
                  <rect width="560" height="280" fill="#060C1C"/>
                  <rect width="560" height="280" fill="url(#cp-dots)"/>
                  <ellipse cx="280" cy="120" rx="230" ry="140" fill="url(#cg3)"/>
                  {/* Circuit traces */}
                  <line x1="38" y1="55" x2="38" y2="195" stroke="#008CFF" strokeOpacity="0.07" strokeWidth="1"/>
                  <line x1="38" y1="55" x2="80" y2="55" stroke="#008CFF" strokeOpacity="0.07" strokeWidth="1"/>
                  <circle cx="38" cy="55" r="2" fill="#008CFF" fillOpacity="0.14"/>
                  <line x1="522" y1="75" x2="522" y2="200" stroke="#008CFF" strokeOpacity="0.07" strokeWidth="1"/>
                  <line x1="480" y1="75" x2="522" y2="75" stroke="#008CFF" strokeOpacity="0.07" strokeWidth="1"/>
                  <circle cx="522" cy="75" r="2" fill="#008CFF" fillOpacity="0.14"/>
                  <line x1="65" y1="205" x2="200" y2="205" stroke="#008CFF" strokeOpacity="0.05" strokeWidth="1"/>
                  <line x1="360" y1="205" x2="495" y2="205" stroke="#008CFF" strokeOpacity="0.05" strokeWidth="1"/>
                  {/* Animated connection line: Briefcase → Camera */}
                  <line x1="162" y1="116" x2="236" y2="116" stroke="#008CFF" strokeWidth="1.5" strokeOpacity="0.65" strokeDasharray="5 4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.1s" repeatCount="indefinite"/>
                  </line>
                  <circle r="3.5" fill="#008CFF" opacity="0.9" filter="url(#glow3)">
                    <animateMotion path="M162,116 L236,116" dur="1.1s" repeatCount="indefinite"/>
                  </circle>
                  {/* Animated connection line: Camera → Sparkle */}
                  <line x1="326" y1="116" x2="398" y2="116" stroke="#008CFF" strokeWidth="1.5" strokeOpacity="0.65" strokeDasharray="5 4">
                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.0s" repeatCount="indefinite"/>
                  </line>
                  <circle r="3.5" fill="#008CFF" opacity="0.9" filter="url(#glow3)">
                    <animateMotion path="M326,116 L398,116" dur="1.0s" repeatCount="indefinite"/>
                  </circle>
                  {/* === BRIEFCASE ICON === */}
                  <circle cx="128" cy="116" r="38" fill="#008CFF" fillOpacity="0.05"/>
                  <rect x="104" y="100" width="50" height="36" rx="3" fill="#0C1E36" stroke="#008CFF" strokeOpacity="0.75" strokeWidth="1.5"/>
                  <path d="M118 100 L118 96 Q129 92 140 96 L140 100" stroke="#008CFF" strokeOpacity="0.7" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                  <line x1="104" y1="116" x2="154" y2="116" stroke="#008CFF" strokeOpacity="0.3" strokeWidth="1"/>
                  <rect x="123" y="112" width="12" height="8" rx="1" fill="#0C1E36" stroke="#008CFF" strokeOpacity="0.5" strokeWidth="1"/>
                  <text x="129" y="153" fontFamily="Syne" fontWeight="700" fontSize="7.5" fill="#008CFF" textAnchor="middle" letterSpacing="1">BRIEF</text>
                  {/* === VIDEO CAMERA ICON === */}
                  <circle cx="281" cy="116" r="40" fill="#008CFF" fillOpacity="0.06"/>
                  <rect x="236" y="100" width="66" height="40" rx="3" fill="#0C1E36" stroke="#008CFF" strokeOpacity="0.75" strokeWidth="1.5"/>
                  <circle cx="260" cy="120" r="12" fill="#080F1E" stroke="#008CFF" strokeOpacity="0.65" strokeWidth="1.5"/>
                  <circle cx="260" cy="120" r="6" fill="#008CFF" opacity="0.35" filter="url(#glow3)"/>
                  <circle cx="260" cy="120" r="2.5" fill="#008CFF" opacity="0.8"/>
                  <circle cx="260" cy="120" r="9" fill="none" stroke="#008CFF" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3"/>
                  <path d="M302 105 L326 116 L302 127 Z" fill="#0C1E36" stroke="#008CFF" strokeOpacity="0.65" strokeWidth="1.5"/>
                  <text x="281" y="157" fontFamily="Syne" fontWeight="700" fontSize="7.5" fill="#008CFF" textAnchor="middle" letterSpacing="1">PRODUCE</text>
                  {/* === SPARKLE / DEPLOY ICON === */}
                  <circle cx="432" cy="116" r="38" fill="#008CFF" fillOpacity="0.05"/>
                  <path d="M432 92 L437 110 L456 116 L437 122 L432 140 L427 122 L408 116 L427 110 Z" fill="#0C1E36" stroke="#008CFF" strokeOpacity="0.75" strokeWidth="1.5"/>
                  <circle cx="432" cy="116" r="8" fill="#008CFF" opacity="0.4" filter="url(#glow3)">
                    <animate attributeName="opacity" values="0.4;0.75;0.4" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="432" cy="116" r="3" fill="#008CFF" opacity="0.9"/>
                  <circle cx="416" cy="102" r="1.5" fill="#00D4FF" opacity="0.6"/>
                  <circle cx="448" cy="130" r="1.5" fill="#00D4FF" opacity="0.6"/>
                  <text x="432" y="157" fontFamily="Syne" fontWeight="700" fontSize="7.5" fill="#008CFF" textAnchor="middle" letterSpacing="1">DEPLOY</text>
                  {/* Stat chips */}
                  <rect x="74" y="200" width="118" height="28" rx="5" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.52" strokeWidth="1"/>
                  <text x="133" y="213" fontFamily="Syne" fontWeight="700" fontSize="9" fill="#008CFF" textAnchor="middle">20+ FORMATS</text>
                  <text x="133" y="223" fontFamily="Syne" fontWeight="600" fontSize="7" fill="#6A8FA8" textAnchor="middle">CONTENT TYPES</text>
                  <rect x="207" y="200" width="128" height="28" rx="5" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.42" strokeWidth="1"/>
                  <text x="271" y="213" fontFamily="Syne" fontWeight="700" fontSize="9" fill="#008CFF" textAnchor="middle">CONCEPT → LIVE</text>
                  <text x="271" y="223" fontFamily="Syne" fontWeight="600" fontSize="7" fill="#6A8FA8" textAnchor="middle">END-TO-END</text>
                  <rect x="350" y="200" width="122" height="28" rx="5" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.42" strokeWidth="1"/>
                  <text x="411" y="213" fontFamily="Syne" fontWeight="700" fontSize="9" fill="#008CFF" textAnchor="middle">NARRATIVE-LED</text>
                  <text x="411" y="223" fontFamily="Syne" fontWeight="600" fontSize="7" fill="#6A8FA8" textAnchor="middle">STORYTELLING</text>
                </svg>
                <div className="svc-fade"></div>
              </div>
              <div className="svc-body">
                <div className="svc-num">03 - Service</div>
                <div className="svc-name">Creative Production</div>
                <ServiceModal num="03 — Creative Production" name="Creative Production" description="End-to-end content creation from concept to distribution. We engineer narratives that align with consumer sentiment and brand ICP for maximum organic integration across 20+ content formats." />
              </div>
            </div>

            {/* Performance Marketing */}
            <div className="svc-big">
              <div className="svc-art">
                <svg viewBox="0 0 560 260" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="cg4" cx="50%" cy="42%" r="60%">
                      <stop offset="0%" stopColor="#008CFF" stopOpacity="0.18"/>
                      <stop offset="100%" stopColor="#008CFF" stopOpacity="0"/>
                    </radialGradient>
                    <filter id="glow4">
                      <feGaussianBlur stdDeviation="2.5" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <pattern id="pm-diag" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                      <line x1="0" y1="0" x2="0" y2="28" stroke="#008CFF" strokeOpacity="0.07" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="560" height="260" fill="#060C1C"/>
                  <rect width="560" height="260" fill="url(#pm-diag)"/>
                  <ellipse cx="280" cy="118" rx="210" ry="130" fill="url(#cg4)"/>
                  {/* Chart axes */}
                  <line x1="118" y1="30" x2="118" y2="192" stroke="#008CFF" strokeOpacity="0.18" strokeWidth="1"/>
                  <line x1="118" y1="192" x2="448" y2="192" stroke="#008CFF" strokeOpacity="0.15" strokeWidth="1"/>
                  {/* Ascending bars */}
                  <rect x="128" y="158" width="28" height="34" rx="2" fill="#008CFF" opacity="0.22"/>
                  <rect x="168" y="140" width="28" height="52" rx="2" fill="#008CFF" opacity="0.30"/>
                  <rect x="208" y="120" width="28" height="72" rx="2" fill="#008CFF" opacity="0.40"/>
                  <rect x="248" y="104" width="28" height="88" rx="2" fill="#008CFF" opacity="0.52"/>
                  <rect x="288" y="84" width="28" height="108" rx="2" fill="#008CFF" opacity="0.64"/>
                  <rect x="328" y="66" width="28" height="126" rx="2" fill="#008CFF" opacity="0.78"/>
                  <rect x="368" y="50" width="28" height="142" rx="2" fill="#008CFF" opacity="0.90"/>
                  <rect x="408" y="36" width="28" height="156" rx="2" fill="#008CFF" opacity="1" filter="url(#glow4)"/>
                  {/* Cyan trend line overlay */}
                  <polyline points="142,154 182,136 222,116 262,100 302,80 342,62 382,46 422,32" stroke="#00D4FF" strokeWidth="2" fill="none" filter="url(#glow4)"/>
                  <circle cx="142" cy="154" r="2.5" fill="#00D4FF"/>
                  <circle cx="182" cy="136" r="2.5" fill="#00D4FF"/>
                  <circle cx="222" cy="116" r="2.5" fill="#00D4FF"/>
                  <circle cx="262" cy="100" r="2.5" fill="#00D4FF"/>
                  <circle cx="302" cy="80" r="2.5" fill="#00D4FF"/>
                  <circle cx="342" cy="62" r="2.5" fill="#00D4FF"/>
                  <circle cx="382" cy="46" r="3" fill="#00D4FF"/>
                  <circle cx="422" cy="32" r="4" fill="#00D4FF" filter="url(#glow4)">
                    <animate attributeName="r" values="4;6;4" dur="1.8s" repeatCount="indefinite"/>
                  </circle>
                  {/* Connection nodes on left */}
                  <circle cx="50" cy="72" r="3" fill="#008CFF" opacity="0.5"/>
                  <line x1="53" y1="72" x2="72" y2="72" stroke="#008CFF" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3"/>
                  <circle cx="50" cy="118" r="2.5" fill="#008CFF" opacity="0.4"/>
                  <line x1="53" y1="118" x2="72" y2="118" stroke="#008CFF" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3"/>
                  <circle cx="50" cy="158" r="2" fill="#008CFF" opacity="0.35"/>
                  <line x1="53" y1="158" x2="72" y2="158" stroke="#008CFF" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3"/>
                  {/* Floating metric chips */}
                  <rect x="58" y="54" width="78" height="34" rx="4" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.5" strokeWidth="1"/>
                  <text x="97" y="68" fontFamily="Syne" fontWeight="800" fontSize="13" fill="#008CFF" textAnchor="middle">3.2×</text>
                  <text x="97" y="80" fontFamily="Syne" fontWeight="600" fontSize="6" fill="#6A8FA8" textAnchor="middle">AVG ROAS</text>
                  <rect x="58" y="100" width="78" height="28" rx="4" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.42" strokeWidth="1"/>
                  <text x="97" y="112" fontFamily="Syne" fontWeight="700" fontSize="10" fill="#008CFF" textAnchor="middle">REACH</text>
                  <text x="97" y="122" fontFamily="Syne" fontWeight="600" fontSize="6" fill="#6A8FA8" textAnchor="middle">1.9B+ VIEWS</text>
                  <rect x="58" y="142" width="78" height="28" rx="4" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.38" strokeWidth="1"/>
                  <text x="97" y="154" fontFamily="Syne" fontWeight="700" fontSize="10" fill="#008CFF" textAnchor="middle">ENGAGE</text>
                  <text x="97" y="164" fontFamily="Syne" fontWeight="600" fontSize="6" fill="#6A8FA8" textAnchor="middle">DATA-LED</text>
                  {/* Bottom stat bar */}
                  <rect x="170" y="210" width="220" height="34" rx="6" fill="#0D1E38" stroke="#008CFF" strokeOpacity="0.55" strokeWidth="1"/>
                  <text x="280" y="224" fontFamily="Syne" fontWeight="700" fontSize="9" fill="#008CFF" textAnchor="middle">PPV · CPM · PERFORMANCE</text>
                  <text x="280" y="236" fontFamily="Syne" fontWeight="600" fontSize="7" fill="#6A8FA8" textAnchor="middle">EVERY CHANNEL CONNECTED</text>
                </svg>
                <div className="svc-fade"></div>
              </div>
              <div className="svc-body">
                <div className="svc-num">04 - Service</div>
                <div className="svc-name">Performance Marketing</div>
                <ServiceModal num="04 — Performance Marketing" name="Performance Marketing" description="PPV and CPM-based campaigns optimized for ROI. We use data-driven targeting and conversion mechanics to turn reach into measurable revenue — from first impression to conversion, every channel connected." />
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
             STATS
             ========================================== */}
        <section id="stats">
          <div className="stats-grid">
            <div className="stat-col reveal">
              <span className="stat-val"><span className="cnt" data-target="50">0</span><span className="stat-sfx">M+</span></span>
              <div className="stat-lbl">Engaged Customers</div>
            </div>
            <div className="stat-col reveal d1">
              <span className="stat-val">4.3<span className="stat-sfx">x</span></span>
              <div className="stat-lbl">Avg ROAS Increase</div>
            </div>
            <div className="stat-col reveal d2">
              <span className="stat-val"><span className="cnt" data-target="50">0</span><span className="stat-sfx">+</span></span>
              <div className="stat-lbl">Creators</div>
            </div>
            <div className="stat-col reveal d3">
              <span className="stat-val"><span className="cnt" data-target="20">0</span><span className="stat-sfx">+</span></span>
              <div className="stat-lbl">Brands</div>
            </div>
          </div>
        </section>

        {/* ==========================================
             CASE STUDIES
             ========================================== */}
        <section id="work">
          <div className="work-header reveal">
            <div>
              <div className="eyebrow"><span className="t-label">Case Studies</span></div>
              <h2 className="section-title">Campaigns That<br />Moved the Needle</h2>
            </div>
            <a href="#" className="btn btn-ghost">View All Work</a>
          </div>

          <div className="cases-wrap reveal d1">

            {/* Snapchat */}
            <div className="case-card">
              <div className="case-bg">
                <img src="/1-snapchat.jpg" alt="Snapchat" />
              </div>
              <div className="case-layer">
                <span className="case-tag">Talent Placement - Platform Partnership</span>
                <div className="case-client">Snapchat</div>
                <div className="case-desc">Delivered a creator network to Snapchat directly, facilitating monetization, verification, and town activations that strengthened the platform&apos;s creator economy.</div>
                <div className="case-result">Dozens of<br /><span style={{fontSize:'16px',color:'var(--clr-muted)'}}>creators placed</span></div>
                <div className="case-result-sub">Monetization + Verification - Direct Platform Partnership</div>
              </div>
            </div>

            {/* StealthGPT */}
            <div className="case-card">
              <div className="case-bg">
                <img src="/stealthgpt-logo.jpg" alt="StealthGPT" className="logo-dark" style={{objectPosition:'center'}} />
              </div>
              <div className="case-layer">
                <span className="case-tag">Creator Seeding - AI Education</span>
                <div className="case-client">StealthGPT</div>
                <div className="case-desc">Activated nearly a dozen talking-head creators with engineered narratives in the AI-in-education sector, aligned with consumer sentiment and brand ICP.</div>
                <div className="case-result">10.1M <span style={{fontSize:'16px',color:'var(--clr-muted)'}}>views</span></div>
                <div className="case-result-sub">$1.50 blended CPM across all creators</div>
              </div>
            </div>

            {/* Quizard */}
            <div className="case-card">
              <div className="case-bg">
                <img src="/quizard-bg.png" alt="Quizard" style={{objectFit:'contain', objectPosition:'center', background:'#2a1a5e'}} />
              </div>
              <div className="case-layer">
                <span className="case-tag">Creator Seeding - AI Education</span>
                <div className="case-client">Quizard AI</div>
                <div className="case-desc">Narrative-driven creator campaign for an AI school app. Engineered emotional consumer stories to drive traffic, app downloads, and conversions at scale.</div>
                <div className="case-result">8M <span style={{fontSize:'16px',color:'var(--clr-muted)'}}>views</span></div>
                <div className="case-result-sub">$3.00 blended CPM - conversion-optimized</div>
              </div>
            </div>

          </div>
        </section>

        {/* ==========================================
             CREATOR ROSTER
             ========================================== */}
        <section id="creators">
          <div className="roster-grid reveal">
            {/* Tall left: @carterfolian */}
            <div className="roster-card">
              <img src="/creators/carterfolian.png" alt="@carterfolian" />
              <div className="roster-overlay"></div>
              <div className="roster-handle">@carterfolian</div>
            </div>
            {/* Top right: @prestonjacoobs */}
            <div className="roster-card preston-card">
              <img src="/creators/creator2.jpg" alt="@prestonjacoobs" />
              <div className="roster-overlay"></div>
              <div className="roster-handle">@prestonjacoobs</div>
            </div>
            {/* Mid right: @ishowspeed */}
            <div className="roster-card speed-card">
              <img src="/creators/creator3.jpg" alt="@ishowspeed" />
              <div className="roster-overlay"></div>
              <div className="roster-handle">@ishowspeed</div>
            </div>
            {/* Wide bottom: @ashtonhall */}
            <div className="roster-card ashton-card">
              <img src="/hq720.jpg" alt="@ashtonhall" />
              <div className="roster-overlay"></div>
              <div className="roster-handle">@ashtonhall</div>
            </div>
          </div>

          <div className="roster-copy reveal d2">
            <div className="eyebrow"><span className="t-label">For Creators</span></div>
            <h2 className="section-title">Are You a<br /><span style={{color:'var(--clr-accent)'}}>Creator?</span></h2>
            <p className="roster-sub">Join a roster built on performance, not follower counts. We match creators with brands that fit their voice and negotiate deals that reflect their real value.</p>
            <ul className="roster-perks">
              <li>Brand partnership matching and negotiation</li>
              <li>Platform monetization and verification support</li>
              <li>Contract handling and payment management</li>
              <li>Access to exclusive campaign opportunities</li>
              <li>Direct partnerships with Snapchat, TikTok, and more</li>
            </ul>
            <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Join the Roster</a>
          </div>
        </section>

        {/* ==========================================
             TRUSTED BY (animated marquee)
             ========================================== */}
        <section id="proof">
          <div className="testimonial reveal d2">
            <span className="q-mark">&#8220;</span>
            <p className="q-text">&#8220;SocialSculp actually got results - which is very rare in this space. We were extremely pleased with the CPM and the overall quality of influencer performance across the campaign.&#8221;</p>
            <div className="q-by">
              <div className="q-line"></div>
              <span>Brand Partner - Consumer Tech</span>
              <div className="q-line"></div>
            </div>
          </div>
        </section>

        {/* ==========================================
             CTA
             ========================================== */}
        <section id="cta">
          <div className="cta-word-bg" aria-hidden="true">SCALE</div>
          <div className="eyebrow cta-eye reveal"><span className="t-label">Ready to Scale?</span></div>
          <h2 className="cta-headline reveal d1">
            Work with the agency<br />that <span>moves culture.</span>
          </h2>
          <div className="cta-chips reveal d1">
            <div className="cta-chip">50M+ <span>Engaged</span></div>
            <div className="cta-chip">4.3x <span>Avg ROAS</span></div>
            <div className="cta-chip">50+ <span>Creators</span></div>
            <div className="cta-chip">20+ <span>Brands</span></div>
          </div>
          <div className="cta-btns reveal d2">
            <a href="https://calendar.app.google/4wcPnasps28aBHTJ9" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{padding:'14px 36px',fontSize:'12px'}}>Book a Call</a>
            <a href="#work" className="btn btn-ghost" style={{padding:'14px 36px',fontSize:'12px'}}>View Case Studies</a>
          </div>
        </section>

      </main>

      {/* ==========================================
           FOOTER
           ========================================== */}
      <footer>
        <a href="#" className="footer-logo">SOCIAL<span>SCULP</span></a>
        <ul className="footer-nav">
          <li><a href="#">Home</a></li>
          <li><a href="#work">Case Studies</a></li>
          <li><a href="#creators">Talent</a></li>
          <li><a href="mailto:business@socialsculp.io">Contact</a></li>
          <li><a href="/terms">Terms</a></li>
          <li><a href="/privacy">Privacy</a></li>
        </ul>
        <div className="footer-right">
          <span>2026 SocialSculp LLC</span>
          <span className="footer-sep">-</span>
          <span>All Rights Reserved</span>
        </div>
      </footer>

      {/* ==========================================
           JAVASCRIPT
           ========================================== */}
      <Script strategy="afterInteractive">{`
        /* ---- Always start at top ---- */
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);

        /* ---- Nav scroll ---- */
        const nav = document.getElementById('nav');
        addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 48), { passive: true });

        /* ---- Premium canvas background ---- */
        (function() {
          const canvas = document.getElementById('bg-canvas');
          const ctx = canvas.getContext('2d');
          let W, H, t = 0;

          const blobs = [
            { x: 0.72, y: 0.18, r: 0.42, vx:  0.00012, vy:  0.00008, color: [0, 80, 210]  },
            { x: 0.18, y: 0.72, r: 0.36, vx: -0.00009, vy: -0.00012, color: [0, 40, 170]  },
            { x: 0.50, y: 0.50, r: 0.28, vx:  0.00006, vy:  0.00015, color: [0, 110, 230] },
            { x: 0.85, y: 0.65, r: 0.22, vx: -0.00014, vy:  0.00006, color: [0, 60, 190]  },
          ];

          function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
          }
          resize();
          addEventListener('resize', resize);

          function draw() {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#04060E';
            ctx.fillRect(0, 0, W, H);

            blobs.forEach(b => {
              const ox = Math.sin(t * b.vx * 6000 + b.r * 10) * 0.08;
              const oy = Math.cos(t * b.vy * 6000 + b.r * 7)  * 0.08;
              const cx = (b.x + ox) * W;
              const cy = (b.y + oy) * H;
              const radius = b.r * Math.min(W, H);

              const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
              grad.addColorStop(0,   'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',0.18)');
              grad.addColorStop(0.5, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',0.07)');
              grad.addColorStop(1,   'rgba(0,0,0,0)');

              ctx.beginPath();
              ctx.arc(cx, cy, radius, 0, Math.PI * 2);
              ctx.fillStyle = grad;
              ctx.fill();
            });

            t += 0.016;
            requestAnimationFrame(draw);
          }
          draw();
        })();

        /* ---- Scroll reveal + count-up ---- */
        const io = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            e.target.querySelectorAll('.cnt').forEach(el => {
              const target = +el.dataset.target;
              const step = target / (1600 / 16);
              let cur = 0;
              const timer = setInterval(() => {
                cur = Math.min(cur + step, target);
                el.textContent = Math.floor(cur);
                if (cur >= target) clearInterval(timer);
              }, 16);
            });
          });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));

        /* Count-up animation for hub counter */
        (function() {
          const el = document.getElementById('hub-counter');
          if (!el) return;
          const target = 1.9;
          const duration = 1800;
          const start = performance.now();
          el.textContent = '0.0';
          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = (ease * target).toFixed(1);
            el.textContent = val;
            if (p < 1) requestAnimationFrame(tick);
          }
          setTimeout(() => requestAnimationFrame(tick), 400);
        })();
      `}</Script>
    </>
  )
}
