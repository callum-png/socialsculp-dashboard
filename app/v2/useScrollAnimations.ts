'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// Safe DOM-based character split
function splitChars(el: HTMLElement): HTMLElement[] {
  const text = el.textContent || ''
  // Clear the element safely
  while (el.firstChild) el.removeChild(el.firstChild)

  const chars: HTMLElement[] = []
  for (const ch of text) {
    const outer = document.createElement('span')
    outer.style.cssText = 'display:inline-block;overflow:hidden'
    const inner = document.createElement('span')
    inner.style.display = 'inline-block'
    inner.textContent = ch === ' ' ? '\u00A0' : ch
    outer.appendChild(inner)
    el.appendChild(outer)
    chars.push(inner)
  }
  return chars
}

export function useScrollAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // ── Lenis smooth scroll ─────────────────────────────────
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    })

    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    const ctx = gsap.context(() => {
      // ── Headline split reveals ────────────────────────────
      document.querySelectorAll<HTMLElement>('.v2-split-reveal').forEach(el => {
        const chars = splitChars(el)
        gsap.from(chars, {
          y: '110%',
          opacity: 0,
          duration: 0.75,
          stagger: 0.028,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        })
      })

      // ── Section fade-up reveals ───────────────────────────
      document.querySelectorAll<HTMLElement>('.v2-reveal').forEach(el => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: el.dataset.delay ? parseFloat(el.dataset.delay) : 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
        })
      })

      // ── Stats count-up ────────────────────────────────────
      document.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count || '0')
        const isFloat = el.dataset.float === 'true'
        const suffix = el.dataset.suffix || ''
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = (isFloat ? obj.v.toFixed(1) : Math.round(obj.v).toString()) + suffix
          },
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })

      // ── Case study rows stagger ───────────────────────────
      const rows = document.querySelectorAll<HTMLElement>('.v2-case-row')
      if (rows.length) {
        gsap.from(rows, {
          x: -32,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: rows[0].parentElement, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      }

      // ── Service cards scale in ────────────────────────────
      const cards = document.querySelectorAll<HTMLElement>('.v2-svc-card')
      if (cards.length) {
        gsap.from(cards, {
          scale: 0.94,
          opacity: 0,
          duration: 0.65,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: { trigger: cards[0].parentElement, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      }

      // ── About visual parallax ─────────────────────────────
      const aboutVisual = document.querySelector<HTMLElement>('.v2-about-visual')
      if (aboutVisual) {
        gsap.to(aboutVisual, {
          y: -40,
          ease: 'none',
          scrollTrigger: { trigger: '.v2-about', start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        })
      }

      // ── Marquee velocity effect ───────────────────────────
      const track = document.querySelector<HTMLElement>('.v2-marquee-track')
      if (track) {
        ScrollTrigger.create({
          trigger: '.v2-marquee-wrap',
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const speed = Math.max(10, Math.min(60, 28 - self.getVelocity() * 0.003))
            track.style.animationDuration = `${speed}s`
          },
        })
      }
    })

    return () => {
      ctx.revert()
      lenis.destroy()
      ScrollTrigger.killAll()
    }
  }, [])
}
