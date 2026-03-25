import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090909] px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <a href="/" className="flex items-center gap-1 no-underline mb-1">
          <span className="font-syne text-4xl font-bold text-white tracking-tight">
            SocialSculp
          </span>
          <span className="text-4xl font-bold text-[#008cff]">.</span>
        </a>
        <p className="text-sm font-syne tracking-[0.1em] uppercase text-[#8a8a8a]">
          Campaign Intelligence Platform
        </p>
      </div>

      <SignIn
        forceRedirectUrl="/auth-redirect"
        appearance={{
          variables: {
            colorBackground: '#0f0f0f',
            colorInputBackground: '#161616',
            colorInputText: '#f0f0f0',
            colorText: '#f0f0f0',
            colorTextSecondary: '#888888',
            colorPrimary: '#008cff',
            colorDanger: '#FF4747',
            borderRadius: '0px',
            fontFamily: 'Syne, sans-serif',
          },
          elements: {
            card: 'border border-[#1e1e1e] shadow-none rounded-none',
            headerTitle: 'font-syne font-bold text-white',
            headerSubtitle: 'font-syne text-[#999]',
            socialButtonsBlockButton:
              'bg-[#111] border border-[#222] text-white hover:bg-[#1a1a1a] rounded-none font-syne',
            socialButtonsBlockButtonText: 'text-white font-syne',
            dividerLine: 'bg-[#222]',
            dividerText: 'text-[#666] font-syne',
            formFieldLabel: 'text-[#999] font-syne text-xs uppercase tracking-widest',
            formFieldInput:
              'bg-[#111] border border-[#222] text-white rounded-none focus:border-[#008cff] focus:ring-0 font-syne placeholder:text-[#444]',
            formButtonPrimary:
              'bg-[#008cff] text-white hover:bg-[#0077dd] rounded-none font-syne font-bold tracking-wide',
            footerActionLink: 'text-[#008cff] hover:text-[#33a3ff] font-syne',
            footerActionText: 'text-[#777] font-syne',
            identityPreviewText: 'text-white font-syne',
            identityPreviewEditButton: 'text-[#008cff] font-syne',
            alertText: 'text-[#FF4747] font-syne',
            formFieldErrorText: 'text-[#FF4747] font-syne',
          },
        }}
      />
    </div>
  )
}
