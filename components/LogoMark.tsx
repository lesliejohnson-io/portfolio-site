"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { animate, frame, cancelFrame } from "motion"

// ---- Tunables (tuned for a small nav mark) ----
const P = 600            // camera distance: lower = stronger perspective
const STRETCH = 0.10     // arms lengthen/shorten ±10% (tighter)
const BREATHE = 0.04     // hub swell
const LIFE_RATE = 3.6    // how fast the arms breathe
const SPIN = { x: 1.0, y: 1.7, z: 0.65 }  // radians/sec per axis at full energy
const NAME_PULL = 5      // px the name slides toward the mark on hover
const ARM = 9           // arm thickness (original logo = 7; thicker reads better small)

// Mesh colors, solid (no transparency): near parts teal, far parts deep blue — like the wave peaks and valleys
const THEMES = {
  light: { near: [18, 165, 148], far: [31, 63, 143] },   // #12A594 teal → #1F3F8F blue (deeper for contrast on light)
  dark:  { near: [46, 230, 200], far: [58, 99, 201] },   // #2EE6C8 teal → #3A63C9 blue (brighter for contrast on dark)
}

// Your logo's hub + five nodes, centered on the hub, each with depth and its own rhythm
const HUB = { x: 0, y: 0, z: 0, r: 29.5 }
const SATS = [
  { x: -64.5, y: -35.5, z:  45, r: 15, rate: 1.10, phase: 0.0 },
  { x: -84.5, y:  76.5, z: -35, r: 15, rate: 0.80, phase: 1.9 },
  { x:   0.5, y:  68.5, z:  30, r: 15, rate: 1.35, phase: 3.4 },
  { x:  65.5, y:  29.5, z: -50, r: 15, rate: 0.95, phase: 4.6 },
  { x:  70.5, y: -59.5, z:  35, r: 15, rate: 1.20, phase: 2.7 },
]

type Props = {
  size?: number          // rendered width/height in px
  theme?: "light" | "dark" | "auto"
  href?: string
  name?: string | null   // set to null to show the mark alone
}

export default function LogoMark({ size = 40, theme = "auto", href = "/", name = "Leslie Johnson" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const trigger = svg?.closest("a")
    if (!svg || !trigger) return

    const NS = "http://www.w3.org/2000/svg"
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const darkMq = window.matchMedia("(prefers-color-scheme: dark)")
    const palette = () =>
      THEMES[theme === "auto" ? (darkMq.matches ? "dark" : "light") : theme]
    const tone = (k: number) => {
      const { near, far } = palette()
      return `rgb(${near.map((n, i) => Math.round(far[i] + (n - far[i]) * k)).join(",")})`
    }
    const depthK = (z: number) => Math.max(0, Math.min(1, (z + 90) / 180))

    const nameEl = trigger.querySelector<HTMLElement>(".logo-mark-name")

    svg.replaceChildren()
    const links = SATS.map(() => {
      const l = document.createElementNS(NS, "line")
      l.setAttribute("stroke-linecap", "round")
      return l
    })
    const circles = [HUB, ...SATS].map(() => document.createElementNS(NS, "circle"))

    const angle = { x: 0.35, y: 0.5, z: 0.1 }
    const state = { energy: 0 }
    let life = 0

    type Pt = { x: number; y: number; z: number }
    const rotate = ({ x, y, z }: Pt) => {
      let c = Math.cos(angle.x), s = Math.sin(angle.x)
      ;[y, z] = [y * c - z * s, y * s + z * c]
      c = Math.cos(angle.y); s = Math.sin(angle.y)
      ;[x, z] = [x * c + z * s, -x * s + z * c]
      c = Math.cos(angle.z); s = Math.sin(angle.z)
      ;[x, y] = [x * c - y * s, x * s + y * c]
      const k = P / (P - z)
      return { x: x * k, y: y * k, z, k }
    }

    const draw = () => {
      const e = state.energy
      const hub = { ...HUB, r: HUB.r * (1 + BREATHE * e * Math.sin(life * 1.3)) }
      const sats = SATS.map(n => {
        const f = 1 + STRETCH * e * Math.sin(life * n.rate + n.phase)
        return { ...n, x: n.x * f, y: n.y * f, z: n.z * f }
      })
      const nodes = [hub, ...sats]
      const pts = nodes.map(rotate)

      const items: { z: number; el: Element; set: () => void }[] = []
      sats.forEach((_, i) => {
        const a = pts[0], b = pts[i + 1], zMid = (a.z + b.z) / 2
        items.push({ z: zMid - 0.5, el: links[i], set: () => {
          const l = links[i]
          l.setAttribute("x1", `${a.x}`); l.setAttribute("y1", `${a.y}`)
          l.setAttribute("x2", `${b.x}`); l.setAttribute("y2", `${b.y}`)
          l.setAttribute("stroke-width", `${ARM * (a.k + b.k) / 2}`)
          l.setAttribute("stroke", tone(depthK(zMid)))
        }})
      })
      nodes.forEach((n, i) => {
        const p = pts[i]
        items.push({ z: p.z, el: circles[i], set: () => {
          const c = circles[i]
          c.setAttribute("cx", `${p.x}`); c.setAttribute("cy", `${p.y}`)
          c.setAttribute("r", `${n.r * p.k}`)
          c.setAttribute("fill", tone(depthK(p.z)))
        }})
      })
      items.sort((a, b) => a.z - b.z)   // far first, near on top
      for (const it of items) { it.set(); svg.appendChild(it.el) }

      // Name: shifts toward the mark and warms to teal, in step with the same energy
      if (nameEl) {
        nameEl.style.transform = `translateX(${-NAME_PULL * e}px)`
        nameEl.style.color = `color-mix(in srgb, ${tone(1)} ${Math.round(e * 100)}%, currentColor)`
      }
    }

    draw()
    darkMq.addEventListener("change", draw)
    if (reduce) return () => darkMq.removeEventListener("change", draw)

    // Loop on Motion's frame clock; runs only while there's energy
    let running = false
    let target = 0
    const step = ({ delta }: { delta: number }) => {
      const dt = Math.min(delta, 50) / 1000
      const e = state.energy
      life += dt * e * LIFE_RATE
      angle.x += SPIN.x * dt * e
      angle.y += SPIN.y * dt * e
      angle.z += SPIN.z * dt * e
      draw()
      if (target === 0 && e < 0.001) { cancelFrame(step); running = false }
    }
    const start = () => { if (!running) { running = true; frame.update(step, true) } }

    let anim: ReturnType<typeof animate> | undefined
    const setEnergy = (t: number) => {
      target = t
      anim?.stop()
      start()
      anim = animate(state, { energy: t },
        t ? { type: "spring", stiffness: 300, damping: 26 } : { duration: 0.45, ease: "easeOut" })
    }

    const wake = () => setEnergy(1)
    const settle = () => setEnergy(0)
    const onEnter = (e: PointerEvent) => { if (e.pointerType === "mouse") wake() }
    const onLeave = (e: PointerEvent) => { if (e.pointerType === "mouse") settle() }

    trigger.addEventListener("pointerenter", onEnter)
    trigger.addEventListener("pointerleave", onLeave)
    trigger.addEventListener("focus", wake)    // keyboard users get it too
    trigger.addEventListener("blur", settle)

    return () => {
      anim?.stop()
      cancelFrame(step)
      darkMq.removeEventListener("change", draw)
      trigger.removeEventListener("pointerenter", onEnter)
      trigger.removeEventListener("pointerleave", onLeave)
      trigger.removeEventListener("focus", wake)
      trigger.removeEventListener("blur", settle)
    }
  }, [theme])

  return (
    // The whole link is the hover target, so hovering the mark OR the name wakes it
    <Link
      href={href}
      aria-label={name ? undefined : "Leslie Johnson, home"}
      className="logo-mark"
      style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="-130 -130 260 260"
        // Lets the tumbling arms reach past the box instead of being clipped
        style={{ overflow: "visible", display: "block" }}
        aria-hidden="true"
        focusable="false"
      />
      {name && (
        <span
          className="logo-mark-name"
          style={{ fontFamily: "var(--font-archivo, Archivo), system-ui, sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em", lineHeight: 1 }}
        >
          {/* First name at 600, last name at 800 */}
          {name.includes(" ") ? (
            <>
              {name.slice(0, name.lastIndexOf(" ") + 1)}
              <span style={{ fontWeight: 800 }}>{name.slice(name.lastIndexOf(" ") + 1)}</span>
            </>
          ) : name}
        </span>
      )}
    </Link>
  )
}
