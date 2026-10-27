"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { motion, MotionConfig, type Variants } from "motion/react"

// ---- Mesh tunables ----
const SIZE = 4000          // plane size (world units)
const SEGMENTS = 110       // smoothness along each line
const LINE_COUNT = 260     // number of lines — higher = closer together
const AMP = 45             // wave height
const SPEED = 0.09         // drift speed
const SWAY = 40            // camera side-to-side sway
/*
  Two lit palettes, not one inverted, and both live in globals.css with the
  rest of the colour system rather than as hex in here. On dark the mesh is
  light lines thrown onto a near-black field; on light it inverts to dark ink
  on the page's own background, which needs both deeper colour and more
  opacity to carry the same weight — a line that reads at 0.42 against black
  is a grey haze against near-white.

  THREE parses the CSS hex strings directly, so the band, the WebGL clear
  colour and the fog cannot drift apart: there is one value per theme.
*/
type Palette = {
  bg: THREE.Color
  low: THREE.Color
  high: THREE.Color
  strong: number
  soft: number
}

const readPalette = (el: HTMLElement): Palette => {
  const cs = getComputedStyle(el)
  const v = (name: string) => cs.getPropertyValue(name).trim()
  return {
    bg: new THREE.Color(v("--wave-hero-bg")),
    low: new THREE.Color(v("--wave-hero-low")),
    high: new THREE.Color(v("--wave-hero-high")),
    strong: parseFloat(v("--wave-hero-line-strong")),
    soft: parseFloat(v("--wave-hero-line-soft")),
  }
}

const LUMPS = [
  { x: 0.42, y: 0.55, r: 0.08, h: 1.4, vx:  0.010, vy:  0.004 },
  { x: 0.60, y: 0.48, r: 0.06, h: 1.1, vx: -0.008, vy:  0.006 },
  { x: 0.52, y: 0.62, r: 0.10, h: 1.7, vx:  0.006, vy: -0.005 },
  { x: 0.35, y: 0.45, r: 0.07, h: 1.0, vx: -0.007, vy: -0.004 },
]

function surface(u: number, v: number, t: number) {
  let z =
    Math.sin(u * 14 + t * 0.9) * 0.25 +
    Math.sin(v * 11 - t * 0.7) * 0.25 +
    Math.sin((u + v) * 7 + t * 0.4) * 0.35
  for (const L of LUMPS) {
    const lx = L.x + Math.sin(t * L.vx * 40) * 0.08
    const ly = L.y + Math.cos(t * L.vy * 40) * 0.06
    const dx = (u - lx) / L.r
    const dy = (v - ly) / L.r
    z += L.h * Math.exp(-(dx * dx + dy * dy))
  }
  return z
}

function WaveMesh() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const root = document.documentElement
    let palette = readPalette(root)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(palette.bg, 1)
    renderer.domElement.style.display = "block"
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(palette.bg, 300, 2600)
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 6000)

    // Grid of points shared by both line sets
    const COLS = SEGMENTS + 1
    const ROWS = LINE_COUNT
    const positions = new Float32Array(ROWS * COLS * 3)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = (r * COLS + c) * 3
        positions[i] = (c / (COLS - 1) - 0.5) * SIZE
        positions[i + 1] = (0.5 - r / (ROWS - 1)) * SIZE
      }
    }
    const pos = new THREE.BufferAttribute(positions, 3)
    const colors = new Float32Array(ROWS * COLS * 3)
    const col = new THREE.BufferAttribute(colors, 3)

    const hIdx: number[] = []
    const vIdx: number[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c
        if (c < COLS - 1) hIdx.push(i, i + 1)
        if (r < ROWS - 1) vIdx.push(i, i + COLS)
      }
    }

    const makeLines = (idx: number[], opacity: number) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute("position", pos)
      g.setAttribute("color", col)
      g.setIndex(idx)
      const m = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity, fog: true })
      const lines = new THREE.LineSegments(g, m)
      lines.rotation.x = -Math.PI / 2
      scene.add(lines)
      return { g, m }
    }
    const h = makeLines(hIdx, palette.strong)
    const v = makeLines(vIdx, palette.soft)

    const tmp = new THREE.Color()
    const update = (t: number) => {
      for (let i = 0; i < pos.count; i++) {
        const z = surface(pos.getX(i) / SIZE + 0.5, pos.getY(i) / SIZE + 0.5, t)
        pos.setZ(i, z * AMP)
        tmp.copy(palette.low).lerp(palette.high, Math.max(0, Math.min(1, (z + 0.6) / 2.2)))
        colors[i * 3] = tmp.r
        colors[i * 3 + 1] = tmp.g
        colors[i * 3 + 2] = tmp.b
      }
      pos.needsUpdate = true
      col.needsUpdate = true
      camera.position.set(Math.sin(t * 0.15) * SWAY, 180 + Math.sin(t * 0.1) * 6, 900)
      camera.lookAt(0, 0, -400)
    }

    const resize = () => {
      const w = container.clientWidth
      const hgt = container.clientHeight
      renderer.setSize(w, hgt, false)
      camera.aspect = w / hgt
      camera.updateProjectionMatrix()
      if (reduce) { update(0); renderer.render(scene, camera) }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()

    // Only animate while the band is on screen
    let visible = true
    let raf = 0
    const loop = (ms: number) => {
      update((ms / 1000) * SPEED * 5)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !reduce) raf = requestAnimationFrame(loop)
    })
    io.observe(container)
    if (reduce) { update(0); renderer.render(scene, camera) }

    /*
      Repaint when the theme toggle flips data-theme. The running loop picks
      the new vertex colours up on its next frame, but the clear colour, the
      fog and the reduced-motion still frame all have to be pushed by hand.
    */
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(root)
      renderer.setClearColor(palette.bg, 1)
      ;(scene.fog as THREE.Fog).color.copy(palette.bg)
      h.m.opacity = palette.strong
      v.m.opacity = palette.soft
      if (reduce || !visible) { update(0); renderer.render(scene, camera) }
    })
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] })

    return () => {
      cancelAnimationFrame(raf)
      themeObserver.disconnect()
      io.disconnect()
      ro.disconnect()
      h.g.dispose(); h.m.dispose()
      v.g.dispose(); v.m.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        /*
          Anchored to the foot of the band rather than floating in the middle
          of it, so the mesh reads as ground the headline stands on.

          Masked at both ends. The plane's near edge is a hard curved
          boundary where the geometry simply stops, and left visible it draws
          a line across the page right where the next section begins; fading
          the last quarter dissolves it into the band instead, so the hero
          hands off to the case studies without an edge between them.
        */
        position: "absolute", left: 0, right: 0, bottom: 0, height: "62%",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 38%, #000 74%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, #000 38%, #000 74%, transparent 100%)",
      }}
    />
  )
}

// ---- Text entrance (Motion) ----
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
}

export default function WaveHero() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        className="wave-hero"
        style={{
          position: "relative", minHeight: "40vh", overflow: "hidden", color: "var(--fg)",
          /*
            The band fades out over its last fifth instead of ending on a
            colour change. On light it is the page colour anyway, but on dark
            the band is deeper than --bg, and a straight edge across the full
            width lands exactly where the case studies begin. Fading it lets
            the hero dissolve into the page, in step with the mesh mask above,
            which clears at the same edge.
          */
          background: "linear-gradient(to bottom, var(--wave-hero-bg) 0%, var(--wave-hero-bg) 80%, transparent 100%)",
        }}
      >
        <WaveMesh />
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          style={{
            position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 24px",
            minHeight: "40vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8,
            /*
              Nudged off true centre so the headline clears the crest of the
              mesh below it. A transform rather than a margin: it shifts the
              painted text without changing the band's height or the
              centring maths, and it composes with the entrance springs on
              the children rather than fighting them.
            */
            transform: "translateY(-15px)",
          }}
        >
          <motion.h1
            className="wave-hero-headline"
            variants={item}
            style={{ fontFamily: "var(--font-archivo, Archivo), system-ui, sans-serif", fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 0.96, letterSpacing: "-0.02em", fontWeight: 700 }}
          >
            Intelligent systems
            <br />
            meet human design.
          </motion.h1>
          <motion.p
            className="wave-hero-subline"
            variants={item}
            style={{ color: "var(--fg-secondary)", fontSize: 18 }}
          >
            I turn complex systems into interfaces people can read, trust, and act on.
          </motion.p>
        </motion.div>
      </section>
    </MotionConfig>
  )
}
