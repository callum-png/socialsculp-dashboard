import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090909] px-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="font-syne text-4xl font-bold text-[#EDE8DE] tracking-tight">
            S23
          </span>
          <span className="text-4xl font-bold text-[#C9FF47]">.</span>
        </div>
        <p className="text-sm font-syne tracking-[0.2em] uppercase text-[#6B6860]">
          Campaign Intelligence Platform
        </p>
      </div>

      <SignUp
        appearance={{
          variables: {
            colorBackground: '#111111',
            colorInputBackground: '#1A1A1A',
            colorInputText: '#EDE8DE',
            colorText: '#EDE8DE',
            colorTextSecondary: '#6B6860',
            colorPrimary: '#C9FF47',
            colorDanger: '#FF4747',
            borderRadius: '0px',
            fontFamily: 'Syne, sans-serif',
          },
          elements: {
            card: 'bg-[#111111] border border-[#222222] shadow-none rounded-none',
            headerTitle: 'text-[#EDE8DE] font-syne font-bold',
            headerSubtitle: 'text-[#6B6860] font-syne',
            socialButtonsBlockButton:
              'bg-[#1A1A1A] border border-[#222222] text-[#EDE8DE] hover:bg-[#222222] rounded-none font-syne',
            socialButtonsBlockButtonText: 'text-[#EDE8DE] font-syne',
            dividerLine: 'bg-[#222222]',
            dividerText: 'text-[#6B6860] font-syne',
            formFieldLabel: 'text-[#6B6860] font-syne text-xs uppercase tracking-widest',
            formFieldInput:
              'bg-[#1A1A1A] border border-[#222222] text-[#EDE8DE] rounded-none focus:border-[#C9FF47] focus:ring-0 font-syne',
            formButtonPrimary:
              'bg-[#C9FF47] text-[#090909] hover:bg-[#b8ee36] rounded-none font-syne font-bold tracking-wide',
            footerActionLink: 'text-[#C9FF47] hover:text-[#b8ee36] font-syne',
            footerActionText: 'text-[#6B6860] font-syne',
            identityPreviewText: 'text-[#EDE8DE] font-syne',
            identityPreviewEditButton: 'text-[#C9FF47] font-syne',
            alertText: 'text-[#FF4747] font-syne',
            formFieldErrorText: 'text-[#FF4747] font-syne',
          },
        }}
      />
    </div>
  )
}
