"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

/*
  Ported from reference/hero-waves.js (CodePen prototype). The field settings,
  STATES, SIGNALS and the label behaviour are carried over unchanged; what
  changed is ownership. The prototype owned the whole window: it mounted into
  #main, sized itself to innerWidth/innerHeight, and hung its labels and blur
  bands off document.body as position:fixed. Here everything lives inside one
  ref'd container that is sized by a ResizeObserver, so the field is a band on
  the page rather than a background behind the whole document, and every node
  it creates is removed again on unmount.

  Loaded by HeroField.tsx through next/dynamic with ssr:false — it builds a
  WebGLRenderer and reads getComputedStyle on mount, neither of which exists
  on the server.
*/

// ---- Machine-state kit tokens: swap in the exact values from your machine-ui repo ----
type StateName = "OPERATIONAL" | "WARNING" | "DEGRADED" | "FAULT" | "OFFLINE"

const STATES: Record<StateName, { color: string; shape: string }> = {
  OPERATIONAL: { color: "#3ddc84", shape: "circle" },
  WARNING: { color: "#f5c04a", shape: "triangle" },
  DEGRADED: { color: "#f08a4b", shape: "diamond" },
  FAULT: { color: "#f06a6a", shape: "square" },
  OFFLINE: { color: "#7a8594", shape: "ring" },
}

// Plain-language signals for each state
const SIGNALS: Record<StateName, string[]> = {
  OPERATIONAL: [
    "On route, no action needed",
    "Picking in Aisle 4",
    "Path clear",
    "Delivery on schedule",
    "Docked and ready",
  ],
  WARNING: [
    "Battery low, returning to dock",
    "Path blocked, rerouting",
    "Running 3 min behind",
    "Check before next shift",
  ],
  DEGRADED: [
    "Running on backup sensor",
    "Slowed down near people",
    "Weak signal, using last known position",
  ],
  FAULT: [
    "Stopped, needs your input",
    "Arm jammed, handing off to you",
    "Holding position, awaiting operator",
  ],
  OFFLINE: ["No signal, last seen 12s ago", "Data is stale, don’t act on this"],
}

function stateFor(c: number): StateName {
  if (c >= 0.75) return "OPERATIONAL"
  if (c >= 0.6) return "WARNING"
  if (c >= 0.47) return "DEGRADED"
  return "FAULT"
}

function shapeSVG(shape: string, color: string) {
  let s: string
  if (shape === "circle") s = '<circle cx="6" cy="6" r="5" fill="' + color + '"/>'
  else if (shape === "triangle") s = '<polygon points="6,1 11.5,11 0.5,11" fill="' + color + '"/>'
  else if (shape === "diamond") s = '<polygon points="6,0.5 11.5,6 6,11.5 0.5,6" fill="' + color + '"/>'
  else if (shape === "square") s = '<rect x="1" y="1" width="10" height="10" fill="' + color + '"/>'
  else s = '<circle cx="6" cy="6" r="4.5" fill="none" stroke="' + color + '" stroke-width="1.5"/>'
  return '<svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">' + s + "</svg>"
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function makeGlowTexture() {
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  const ctx = canvas.getContext("2d")!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0.0, "rgba(255,255,255,1)")
  g.addColorStop(0.2, "rgba(255,255,255,0.85)")
  g.addColorStop(0.5, "rgba(255,255,255,0.2)")
  g.addColorStop(1.0, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/*
  The prototype's colour literals, read from globals.css instead. THREE parses
  the CSS hex strings directly, so the band, the WebGL clear colour and the fog
  cannot drift apart. Unlike --wave-hero-* these are NOT redefined per theme —
  the nodes use additive blending, which only reads as a lit lamp against a
  dark field — so there is no theme observer here either.
*/
const readPalette = (el: HTMLElement) => {
  const cs = getComputedStyle(el)
  const v = (name: string) => cs.getPropertyValue(name).trim()
  return {
    bg: v("--hero-field-bg"),
    line: v("--hero-field-line"),
    node: v("--hero-field-node"),
    heroNode: v("--hero-field-node-hero"),
  }
}

type LineSet = {
  geo: THREE.BufferGeometry
  mat: THREE.LineBasicMaterial
  pos: Float32Array
  idx: Int32Array
  count: number
}

type Label = {
  el: HTMLDivElement
  shape: HTMLSpanElement
  msg: HTMLSpanElement
  metric: HTMLSpanElement
  state: string
  msgText: string
  metricText: string
  opacity: number
  w: number
}

type Screen = { sx: number; sy: number; d: number; confidence: number; t: number }

const MOBILE_MAX = 768

export default function HeroFieldCanvas() {
  const ref = useRef<HTMLDivElement>(null)

  /*
    Which mode the field runs in, measured off the container rather than the
    window. Seeded from innerWidth because this module is only ever loaded
    with ssr:false, so `window` is there on the very first render and the
    canvas does not have to wait a frame to find out which mode it is in.
    The ResizeObserver below then corrects it from the real container width.
  */
  const [mobile, setMobile] = useState(() => window.innerWidth < MOBILE_MAX)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setMobile(el.clientWidth < MOBILE_MAX)
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /*
    Keyed on `mobile`, so crossing the breakpoint tears the whole scene down
    and builds the other one. The two modes differ in grid resolution, node
    spacing and whether a label layer exists at all, none of which can be
    retrofitted onto a running scene — and the teardown below is thorough, so
    rebuilding is both the simplest and the cleanest way to switch.
  */
  useEffect(() => {
    const container = ref.current
    if (!container) return

    // --- Field settings ---
    // Mobile runs a coarser grid: ~3.4x fewer vertices to rewrite per frame.
    const cols = mobile ? 48 : 80 // vertical lines (fewer = more space between them)
    const rows = mobile ? 80 : 140 // horizontal lines (more = closer together)
    const x_half = 260000
    const y_near = 2000
    const y_far = 310000
    const wave_amp = 6000
    const vertical_strength = 0.4 // 0 = invisible, 1 = same as horizontal lines
    const look_y = 7900 // lower number = waves reach higher up the hero

    // --- Node settings ---
    let node_count = 60
    // pixels between nodes on screen: higher = more spread out
    const min_spacing = mobile ? 56 : 70
    const offline_count = 3
    const node_size = 4500
    const hero_node_size = 9000
    const node_lift = 300

    // --- Label settings ---
    const reveal_radius = 170
    const max_labels = 4
    const label_gap = 6 // pixels of clearance between labels
    const idle_ms = 3000

    const reduce_motion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const palette = readPalette(document.documentElement)

    /*
      Sized from the container, not the window. Width and height are read off
      the element and kept in `size`, which the ResizeObserver refreshes; the
      camera aspect, the blur bands and the node screen positions all read
      from there, so the field tracks the band through a window resize or a
      font-driven reflow without touching window.innerWidth.
    */
    const size = { w: container.clientWidth || 1, h: container.clientHeight || 1 }

    const camera = new THREE.PerspectiveCamera(45, size.w / size.h, 1, 400000)
    camera.position.set(0, 10000, 10000)
    camera.lookAt(new THREE.Vector3(0, look_y, 0))
    /*
      Both matrices are forced up to date here because node placement below
      projects grid points to the screen at build time, before the first
      render has run. Without this they would still be identity and every
      candidate would land in the same spot.
    */
    camera.updateMatrixWorld()

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(palette.bg, 1, 300000)

    const field = new THREE.Group()
    field.rotation.x = -Math.PI / 2
    scene.add(field)
    field.updateMatrixWorld()

    const renderer = new THREE.WebGLRenderer({ alpha: false })
    /*
      Not in the prototype, which left this at 1 and aliased the lines on a
      retina screen. Capped so the cost stays bounded on a dense grid, and
      capped harder on phones, where the device pixel ratio is usually 3 and
      the fill cost of the glow sprites is what actually hurts.
    */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2))
    renderer.setSize(size.w, size.h, false)
    renderer.setClearColor(palette.bg, 1)
    renderer.domElement.style.display = "block"
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    container.appendChild(renderer.domElement)

    // --- Height grid ---
    const W = cols + 1
    const gx = new Float32Array(W)
    const gy = new Float32Array(rows + 1)
    const H = new Float32Array((rows + 1) * W)
    for (let c = 0; c <= cols; c++) gx[c] = -x_half + (2 * x_half * c) / cols
    for (let r = 0; r <= rows; r++) gy[r] = y_near + ((y_far - y_near) * r) / rows

    // Smooth swells instead of random spikes
    function heightAt(x: number, y: number, t: number) {
      return (
        2600 * Math.sin(x / 52000 + t * 0.45) +
        2000 * Math.sin(y / 38000 - t * 0.32) +
        1400 * Math.sin((x - y) / 70000 + t * 0.22)
      )
    }

    function computeHeights(t: number) {
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          H[r * W + c] = heightAt(gx[c], gy[r], t)
        }
      }
    }

    // Lines fade into the background at the front edge and at the horizon
    const bg = new THREE.Color(palette.bg)
    const lc = new THREE.Color(palette.line)

    function fadeAt(y: number) {
      const depth = 10000 + y
      return smoothstep(12000, 45000, depth) * (1 - smoothstep(190000, 300000, depth))
    }

    function setColor(arr: Float32Array, i: number, y: number, strength: number) {
      const f = fadeAt(y) * strength
      arr[i * 3] = bg.r + (lc.r - bg.r) * f
      arr[i * 3 + 1] = bg.g + (lc.g - bg.g) * f
      arr[i * 3 + 2] = bg.b + (lc.b - bg.b) * f
    }

    function buildLines(
      count: number,
      fill: (put: (i: number, c: number, r: number) => void) => void,
      strength: number,
    ): LineSet {
      const posArr = new Float32Array(count * 3)
      const colArr = new Float32Array(count * 3)
      const idx = new Int32Array(count)
      fill(function (i, c, r) {
        posArr[i * 3] = gx[c]
        posArr[i * 3 + 1] = gy[r]
        idx[i] = r * W + c
        setColor(colArr, i, gy[r], strength)
      })
      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3))
      geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3))
      const mat = new THREE.LineBasicMaterial({ vertexColors: true })
      const lines = new THREE.LineSegments(geo, mat)
      lines.frustumCulled = false
      field.add(lines)
      return { geo, mat, pos: posArr, idx, count }
    }

    // Horizontal lines only: no diagonals
    const horiz = buildLines(
      (rows + 1) * cols * 2,
      function (put) {
        let i = 0
        for (let r = 0; r <= rows; r++) {
          for (let c = 0; c < cols; c++) {
            put(i++, c, r)
            put(i++, c + 1, r)
          }
        }
      },
      1,
    )

    // Softer vertical lines
    const vert = buildLines(
      W * rows * 2,
      function (put) {
        let i = 0
        for (let c = 0; c <= cols; c++) {
          for (let r = 0; r < rows; r++) {
            put(i++, c, r)
            put(i++, c, r + 1)
          }
        }
      },
      vertical_strength,
    )

    function updateLines(set: LineSet) {
      for (let i = 0; i < set.count; i++) set.pos[i * 3 + 2] = H[set.idx[i]]
      set.geo.attributes.position.needsUpdate = true
    }

    /*
      --- Nodes: spread evenly across the screen, so more land in the front ---
      Placement is decided in screen space rather than in the grid, which is
      what keeps the field from clumping: the old version picked grid points
      at random, and because perspective crushes the far rows together, most
      of them landed in a band near the horizon.

      Every grid point is projected, the ones outside the readable area are
      dropped, the rest are shuffled, and a point is only accepted if it is
      at least min_spacing pixels from everything accepted so far. Measured
      against the container, not the window.
    */
    const pv = new THREE.Vector3()

    pv.set(0, y_far, 0)
    field.localToWorld(pv)
    pv.project(camera)
    const horizon_y = ((1 - pv.y) / 2) * size.h

    type Candidate = { gi: number; sx: number; sy: number }
    const candidates: Candidate[] = []
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        pv.set(gx[c], gy[r], 0)
        field.localToWorld(pv)
        pv.project(camera)
        if (pv.z >= 1) continue
        const sx = ((pv.x + 1) / 2) * size.w
        const sy = ((1 - pv.y) / 2) * size.h
        if (sx < size.w * 0.04 || sx > size.w * 0.96) continue
        // stay out of the horizon haze and the front blur
        if (sy < horizon_y + 30 || sy > size.h * 0.74) continue
        candidates.push({ gi: r * W + c, sx, sy })
      }
    }
    for (let k = candidates.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1))
      const tmp = candidates[k]
      candidates[k] = candidates[j]
      candidates[j] = tmp
    }
    const accepted: Candidate[] = []
    for (let k = 0; k < candidates.length && accepted.length < node_count; k++) {
      const cand = candidates[k]
      let ok = true
      for (let a = 0; a < accepted.length; a++) {
        if (Math.hypot(cand.sx - accepted[a].sx, cand.sy - accepted[a].sy) < min_spacing) {
          ok = false
          break
        }
      }
      if (ok) accepted.push(cand)
    }
    const node_grid: number[] = accepted.map((a) => a.gi)
    node_count = node_grid.length

    function gridX(gi: number) {
      return gx[gi % W]
    }
    function gridY(gi: number) {
      return gy[Math.floor(gi / W)]
    }

    const offline: Record<number, boolean> = {}
    for (let k = 0; k < offline_count; k++) {
      offline[Math.floor(Math.random() * node_count)] = true
    }

    const glow = makeGlowTexture()

    function glowMaterial(opts: THREE.PointsMaterialParameters) {
      return new THREE.PointsMaterial(
        Object.assign(
          {
            map: glow,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
          },
          opts,
        ),
      )
    }

    const node_positions = new Float32Array(node_count * 3)
    const node_colors = new Float32Array(node_count * 3)
    const node_geometry = new THREE.BufferGeometry()
    node_geometry.setAttribute("position", new THREE.BufferAttribute(node_positions, 3))
    node_geometry.setAttribute("color", new THREE.BufferAttribute(node_colors, 3))
    const node_material = glowMaterial({ size: node_size, vertexColors: true })
    const nodes = new THREE.Points(node_geometry, node_material)
    nodes.frustumCulled = false
    field.add(nodes)

    const hero_grid = node_grid.reduce(function (best, gi) {
      const d = Math.hypot(gridX(gi), gridY(gi) - 60000)
      const bd = Math.hypot(gridX(best), gridY(best) - 60000)
      return d < bd ? gi : best
    }, node_grid[0])
    const hero_positions = new Float32Array(3)
    const hero_geometry = new THREE.BufferGeometry()
    hero_geometry.setAttribute("position", new THREE.BufferAttribute(hero_positions, 3))
    const hero_material = glowMaterial({ size: hero_node_size, color: palette.heroNode })
    const hero_node = new THREE.Points(hero_geometry, hero_material)
    hero_node.frustumCulled = false
    field.add(hero_node)

    const base_color = new THREE.Color(palette.node)
    const offline_color = new THREE.Color(STATES.OFFLINE.color)
    const state_color = new THREE.Color()

    /*
      --- Blur bands at the horizon and front edge ---
      position:absolute inside the container, not position:fixed on the body,
      so they scroll with the band and are torn down with it. Their offsets
      are measured from the top of the container rather than the viewport.
    */
    const makeBand = (blur: number, mask: string) => {
      const d = document.createElement("div")
      d.style.cssText =
        "position:absolute;left:0;width:100%;pointer-events:none;z-index:1;" +
        "backdrop-filter:blur(" +
        blur +
        "px);-webkit-backdrop-filter:blur(" +
        blur +
        "px);" +
        "mask-image:" +
        mask +
        ";-webkit-mask-image:" +
        mask +
        ";"
      container.appendChild(d)
      return d
    }
    const horizon_band = makeBand(
      3,
      "linear-gradient(to bottom, transparent 0%, #000 50%, transparent 100%)",
    )
    const front_band = makeBand(6, "linear-gradient(to bottom, transparent 0%, #000 100%)")
    const hv = new THREE.Vector3()

    function placeBands() {
      hv.set(0, y_far, 0)
      field.localToWorld(hv)
      hv.project(camera)
      const hy = ((1 - hv.y) / 2) * size.h
      horizon_band.style.top = Math.round(hy - 80) + "px"
      horizon_band.style.height = "160px"
      front_band.style.top = Math.round(size.h * 0.76) + "px"
      front_band.style.height = Math.round(size.h * 0.24) + "px"
    }

    /*
      --- Labels ---
      The @keyframes the prototype injected into document.head live in
      globals.css as .sig-fault, so nothing is appended to the head here.
      The label divs are still built imperatively: they are written to on
      every frame from the render loop, and routing 60 of them through React
      state would re-render the tree at 60fps.
    */
    /*
      None of this exists on mobile. A signal that only appears within 170px
      of a pointer has nothing to reveal it on a touch screen, and reading a
      12px caption over a moving field on a phone was never going to work —
      so rather than render labels nobody can trigger, the overlay is never
      built, and the focus point, the pointer listeners and the whole label
      pass below are skipped with it. The nodes keep their crest-and-valley
      glow, which carries the idea on its own.
    */
    let overlay: HTMLDivElement | null = null
    const labels: Label[] = []

    if (!mobile) {
      overlay = document.createElement("div")
      overlay.style.cssText =
        "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:2;"
      container.appendChild(overlay)
    }

    for (let n = 0; !mobile && n < node_count; n++) {
      const el = document.createElement("div")
      el.style.cssText =
        "position:absolute;left:0;top:0;white-space:nowrap;display:flex;align-items:center;gap:7px;" +
        "opacity:0;transition:opacity 220ms ease;will-change:transform,opacity;"
      const shape = document.createElement("span")
      shape.style.cssText = "display:inline-flex;"
      const msg = document.createElement("span")
      /*
        DM Sans and DM Mono are not loaded on this site, so the label takes
        the site's own faces instead: Source Sans 3 for the signal, JetBrains
        Mono for the metric, per the type rules in CLAUDE.md.
      */
      msg.style.cssText =
        "font:500 12px/1.2 var(--font-sans), system-ui, sans-serif;color:var(--hero-field-label);"
      const metric = document.createElement("span")
      metric.style.cssText =
        "font:500 11px/1.2 var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;" +
        "letter-spacing:0.04em;color:var(--hero-field-metric);"
      el.appendChild(shape)
      el.appendChild(msg)
      el.appendChild(metric)
      overlay!.appendChild(el)
      labels.push({ el, shape, msg, metric, state: "", msgText: "", metricText: "", opacity: 0, w: 0 })
    }

    /*
      Write a label's contents, and cache how wide it ended up. The collision
      test below needs a box to compare, and the only honest source for the
      width is the laid-out element. offsetWidth forces a synchronous layout,
      so it is read only when the text actually changed — doing it for every
      candidate on every frame would be the most expensive thing in the loop.
    */
    const fillLabel = (label: Label, n: number, state: StateName, confidence: number) => {
      let changed = false
      if (state !== label.state) {
        label.shape.innerHTML = shapeSVG(STATES[state].shape, STATES[state].color)
        label.shape.className = state === "FAULT" ? "sig-fault" : ""
        label.state = state
        changed = true
      }
      const list = SIGNALS[state]
      const msgText = list[n % list.length]
      if (msgText !== label.msgText) {
        label.msg.textContent = msgText
        label.msgText = msgText
        changed = true
      }
      // Confidence % and p-score, intermixed across nodes
      const metricText = offline[n]
        ? "stale"
        : n % 2 === 0
          ? Math.round(confidence * 100) + "%"
          : "p = " + confidence.toFixed(2)
      if (metricText !== label.metricText) {
        label.metric.textContent = metricText
        label.metricText = metricText
        changed = true
      }
      if (changed || !label.w) label.w = label.el.offsetWidth
    }

    // --- Focus point ---
    const focus = { x: -9999, y: -9999 }
    let last_pointer = -Infinity

    /*
      Pointer coordinates are viewport-based and the field is not, so they are
      rebased onto the container here — once per pointer event, where the
      prototype read a bounding rect on every frame.
    */
    const onPointer = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      focus.x = e.clientX - rect.left
      focus.y = e.clientY - rect.top
      last_pointer = performance.now()
    }
    if (!mobile) {
      window.addEventListener("pointermove", onPointer)
      window.addEventListener("pointerdown", onPointer)
    }

    function updateFocus(now: number) {
      if (now - last_pointer > idle_ms) {
        if (reduce_motion) {
          focus.x = size.w * 0.68
          focus.y = size.h * 0.55
        } else {
          focus.x = size.w * (0.68 + Math.sin(now * 0.00017) * 0.2)
          focus.y = size.h * (0.55 + Math.cos(now * 0.00011) * 0.12)
        }
      }
    }

    const v = new THREE.Vector3()
    const scr: Screen[] = new Array(node_count)

    /*
      The one place a node's colour is decided, shared by both modes. Offline
      nodes are a dim grey wherever they are; everything else glows with the
      wave, dark in the valleys and bright at the crests, and only leans
      toward its state colour when a label is pulling it (`near` > 0, which
      is never the case on mobile).
    */
    const paintNode = (n: number, t: number, near: number, state: StateName | null) => {
      if (offline[n]) {
        node_colors[n * 3] = offline_color.r * 0.35
        node_colors[n * 3 + 1] = offline_color.g * 0.35
        node_colors[n * 3 + 2] = offline_color.b * 0.35
        return
      }
      const b = 0.12 + 0.88 * t * t
      let cr = base_color.r * b
      let cg = base_color.g * b
      let cb = base_color.b * b
      if (near > 0 && state) {
        state_color.set(STATES[state].color)
        cr += (state_color.r - cr) * near
        cg += (state_color.g - cg) * near
        cb += (state_color.b - cb) * near
      }
      node_colors[n * 3] = cr
      node_colors[n * 3 + 1] = cg
      node_colors[n * 3 + 2] = cb
    }

    function updateNodes(now: number) {
      if (!mobile) updateFocus(now)
      field.updateMatrixWorld()

      const ranked: number[] = []
      for (let n = 0; n < node_count; n++) {
        const gi = node_grid[n]
        const nx = gridX(gi)
        const ny = gridY(gi)
        const h = H[gi]
        const nz = h + node_lift
        node_positions[n * 3] = nx
        node_positions[n * 3 + 1] = ny
        node_positions[n * 3 + 2] = nz

        const t = Math.max(0, Math.min(1, (h + wave_amp) / (2 * wave_amp)))

        /*
          Mobile stops here. With no labels there is nothing that needs a
          node's screen position, so the per-node project() — the expensive
          part of this loop — is skipped outright rather than computed and
          thrown away.
        */
        if (mobile) {
          paintNode(n, t, 0, null)
          continue
        }

        const confidence = 0.35 + 0.6 * t

        v.set(nx, ny, nz)
        field.localToWorld(v)
        v.project(camera)
        const visible = v.z < 1 && v.x > -1.1 && v.x < 1.1 && v.y > -1.1 && v.y < 1.1
        const sx = ((v.x + 1) / 2) * size.w
        const sy = ((1 - v.y) / 2) * size.h
        const d = visible ? Math.hypot(sx - focus.x, sy - focus.y) : Infinity
        scr[n] = { sx, sy, d, confidence, t }
        ranked.push(n)
      }

      ranked.sort(function (a, b) {
        return scr[a].d - scr[b].d
      })

      /*
        A label is no longer shown just because its node is one of the nearest
        few. It has to earn the space: the box is tested against everything
        already placed this frame, and `shown` only counts the ones that made
        it, so a label suppressed for overlapping does not use up a slot.
      */
      const placed: { x: number; y: number; w: number; h: number }[] = []
      let shown = 0

      for (let r = 0; r < ranked.length; r++) {
        const n = ranked[r]
        const s = scr[n]
        const label = labels[n]
        const state: StateName = offline[n] ? "OFFLINE" : stateFor(s.confidence)
        let near = shown < max_labels && s.d < reveal_radius ? 1 - s.d / reveal_radius : 0

        // Only show a label if it doesn't overlap one already placed
        if (near > 0) {
          fillLabel(label, n, state, s.confidence)
          const bx = s.sx + 10
          const by = s.sy - 18
          const bw = label.w
          const bh = 16
          for (let p = 0; p < placed.length; p++) {
            const q = placed[p]
            if (
              bx < q.x + q.w + label_gap &&
              bx + bw + label_gap > q.x &&
              by < q.y + q.h + label_gap &&
              by + bh + label_gap > q.y
            ) {
              near = 0
              break
            }
          }
          if (near > 0) {
            placed.push({ x: bx, y: by, w: bw, h: bh })
            shown++
            label.el.style.transform =
              "translate(" + Math.round(bx) + "px," + Math.round(by) + "px)"
          }
        }

        paintNode(n, s.t, near, state)

        const target_opacity = near > 0 ? Math.min(1, 0.35 + near) : 0
        if (target_opacity !== label.opacity) {
          label.el.style.opacity = target_opacity.toFixed(2)
          label.opacity = target_opacity
        }
      }

      node_geometry.attributes.position.needsUpdate = true
      node_geometry.attributes.color.needsUpdate = true

      hero_positions[0] = gridX(hero_grid)
      hero_positions[1] = gridY(hero_grid)
      hero_positions[2] = H[hero_grid] + node_lift
      hero_geometry.attributes.position.needsUpdate = true
    }

    let time = 0
    let did_first_frame = false
    let raf = 0

    function render() {
      raf = requestAnimationFrame(render)
      const now = performance.now()
      if (!reduce_motion || !did_first_frame) {
        if (!reduce_motion) time += 0.016
        computeHeights(time)
        updateLines(horiz)
        updateLines(vert)
        did_first_frame = true
      }
      updateNodes(now)
      renderer.render(scene, camera)
    }

    const resize = () => {
      size.w = container.clientWidth || 1
      size.h = container.clientHeight || 1
      camera.aspect = size.w / size.h
      camera.updateProjectionMatrix()
      renderer.setSize(size.w, size.h, false)
      placeBands()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    placeBands()

    /*
      The prototype ran its loop for the life of the page. Rewriting tens of
      thousands of vertices every frame is not worth doing while the band is
      scrolled out of sight, and on a phone it is battery burnt for nothing.

      Two gates, both of which must be open: the band is on screen, and the
      tab is in the foreground. requestAnimationFrame already stops in a
      hidden tab in most browsers, but not in all of them and not when the
      window is merely occluded, so the visibility gate is explicit.
    */
    let running = false
    let onScreen = false
    const start = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(render)
      }
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const sync = () => {
      if (onScreen && !document.hidden) start()
      else stop()
    }
    const onVisibility = () => sync()
    document.addEventListener("visibilitychange", onVisibility)
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    io.observe(container)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pointermove", onPointer)
      window.removeEventListener("pointerdown", onPointer)
      horiz.geo.dispose()
      horiz.mat.dispose()
      vert.geo.dispose()
      vert.mat.dispose()
      node_geometry.dispose()
      node_material.dispose()
      hero_geometry.dispose()
      hero_material.dispose()
      glow.dispose()
      renderer.dispose()
      overlay?.remove()
      horizon_band.remove()
      front_band.remove()
      renderer.domElement.remove()
    }
  }, [mobile])

  return <div ref={ref} aria-hidden="true" className="absolute inset-0 overflow-hidden" />
}
