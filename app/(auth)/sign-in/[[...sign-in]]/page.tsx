import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <a href="https://www.socialsculp.io" className="flex items-center gap-1 no-underline mb-1">
          <span className="font-syne text-4xl font-bold text-foreground tracking-tight">
            SocialSculp
          </span>
          <span className="text-4xl font-bold text-[#008cff]">.</span>
        </a>
        <p className="text-sm font-syne tracking-[0.2em] uppercase text-muted-foreground">
          Campaign Intelligence Platform
        </p>
      </div>

      <SignIn
        forceRedirectUrl="/auth-redirect"
        appearance={{
          variables: {
            colorBackground: '#111111',
            colorInputBackground: '#1A1A1A',
            colorInputText: '#EDE8DE',
            colorText: '#EDE8DE',
            colorTextSecondary: '#6B6860',
            colorPrimary: '#008cff',
            colorDanger: '#FF4747',
            borderRadius: '0px',
            fontFamily: 'Syne, sans-serif',
          },
          elements: {
            card: 'bg-card border border-border shadow-none rounded-none',
            headerTitle: 'text-foreground font-syne font-bold',
            headerSubtitle: 'text-muted-foreground font-syne',
            socialButtonsBlockButton:
              'bg-background border border-border text-foreground hover:bg-muted rounded-none font-syne',
            socialButtonsBlockButtonText: 'text-foreground font-syne',
            dividerLine: 'bg-border',
            dividerText: 'text-muted-foreground font-syne',
            formFieldLabel: 'text-muted-foreground font-syne text-xs uppercase tracking-widest',
            formFieldInput:
              'bg-background border border-border text-foreground rounded-none focus:border-[#008cff] focus:ring-0 font-syne',
            formButtonPrimary:
              'bg-[#008cff] text-[#090909] hover:bg-[#0077dd] rounded-none font-syne font-bold tracking-wide',
            footerActionLink: 'text-[#008cff] hover:text-[#0077dd] font-syne',
            footerActionText: 'text-muted-foreground font-syne',
            identityPreviewText: 'text-foreground font-syne',
            identityPreviewEditButton: 'text-[#008cff] font-syne',
            alertText: 'text-[#FF4747] font-syne',
            formFieldErrorText: 'text-[#FF4747] font-syne',
          },
        }}
      />
    </div>
  )
}
