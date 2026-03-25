'use client'
import { useEffect, useState, useRef } from 'react'

export function V2Loader() {
  const [hidden, setHidden] = useState(false)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    // Count up 0 → 100 over ~1.4s
    let start: number | null = null
    const duration = 1400
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setPct(Math.round(progress * 100))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setTimeout(() => setHidden(true), 400)
      }
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (hidden) return null

  return (
    <div className={`v2-loader${pct === 100 ? ' hidden' : ''}`}>
      <div className="v2-loader-inner">
        <div className="v2-loader-mark">
          Social<em>Sculp</em>
        </div>
        <div className="v2-loader-line" />
        <div className="v2-loader-pct">{String(pct).padStart(3, '0')}</div>
      </div>
    </div>
  )
}

export function V2RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll('.v2-reveal')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}

export function V2Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let frame = 0
        const total = 70
        const tick = () => {
          frame++
          const progress = frame / total
          const eased = 1 - Math.pow(1 - progress, 3)
          setVal(parseFloat((eased * target).toFixed(1)))
          if (frame < total) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      }
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  const display = Number.isInteger(target) ? Math.round(val) : val.toFixed(1)

  return <span ref={ref}>{display}{suffix}</span>
}
