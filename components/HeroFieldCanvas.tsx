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
  col: Float32Array
  idx: Int32Array
  count: number
  strength: number
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

type Screen = {
  sx: number
  sy: number
  d: number
  confidence: number
  t: number
  fade: number
}

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
    spacing, pixel ratio and how many labels they allow, none of which can be
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
    // The height the five terms in heightAt can reach together, used to
    // normalize a node's glow between trough and crest.
    const wave_amp = 9400
    /*
      One knob for how fast the whole field moves: the wave and the signals
      riding it advance by `dt` per frame, so changing this keeps the two in
      step instead of letting the nodes drift across the crests. 0.016 was
      the prototype's rate; 0.765 of it is the current pace.
    */
    const dt = 0.016 * 0.765
    /*
      How far each set of lines is lerped from the field colour toward
      --hero-field-line. 0 leaves a set exactly the colour of the field,
      which is to say invisible.

      The lines running across the field are at 0: the forward-rolling swell
      is read from the lit nodes and the lines running INTO the field, and
      the cross lines were banding the wave into stripes. At 0 the set is not
      built at all rather than drawn in the background colour — an invisible
      line still paints, and these lines sit at the same depth as the ones
      going the other way, so drawing them would punch gaps in those and
      cost a few thousand vertices a frame for the privilege.
    */
    const horizontal_strength = 0
    const vertical_strength = 0.4
    const look_y = 7900 // lower number = waves reach higher up the hero

    // --- Node settings ---
    // How many signals are in the stream at once. They recycle, so this is
    // the steady count on the field, not a budget that runs out. Fewer on a
    // phone, where the band is a third of the width.
    const node_count = mobile ? 16 : 34
    /*
      Where a signal enters and how far it travels. It is seeded well short
      of the grid's far edge on purpose: at y_far a node is a sub-pixel speck
      that would take twenty seconds to reach the front, so the stream would
      drain faster than it refilled. From here the run takes about nine
      seconds, which keeps the field populated at every depth.
    */
    const spawn_y = 132000
    const fade_in_span = 34000 // distance over which a new signal comes up
    const fade_out_span = 16000 // distance over which it dies at the front
    const offline_count = 3
    /*
      Point size is attenuated by distance and scaled by the height of the
      drawing buffer, so the same world size reads much smaller on a short
      band. Bumped on mobile to land back at roughly the same lamp on screen.
    */
    const node_size = mobile ? 7000 : 4500
    const hero_node_size = 9000
    const node_lift = 300

    // --- Label settings ---
    /*
      Mobile shows at most two signals at once: the band is short, so a third
      label only crowds the two that matter. The tighter radius keeps a label
      close to the node that owns it on a narrow screen.
    */
    const reveal_radius = mobile ? 120 : 170
    const max_labels = mobile ? 2 : 4
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

    /*
      Smooth swells instead of random spikes, and they travel forward: the
      crests run across the field and roll toward the viewer rather than
      sliding sideways.

      Two things make that happen. The dominant terms vary with y (depth)
      rather than x, so a crest is a ridge spanning the width of the field
      instead of a column running into it. And their phase advances with +t,
      which puts a line of constant phase at a smaller y every frame, and
      smaller y is nearer the camera — so the ridge moves toward the front
      edge. (The old -t term did the reverse and drifted to the horizon.)

      The third term keeps a slight diagonal lean and a cross-swell along x,
      so the ridges do not read as perfectly parallel bars.

      The last two are the lumps: each is a ridge multiplied by a standing
      wave across the width, which breaks the ridge into a row of swells
      instead of one unbroken bar, with flat lanes where the x factor passes
      through zero. Only the y phase advances, so a lump rolls toward the
      viewer without sliding sideways, and the two lattices are at different
      scales and offsets so they do not line up into a tidy grid.

      Their wavelengths are deliberately much shorter than the swell's, and
      their phases advance more slowly. A node travels at the swell's speed,
      so it keeps its place on the swell all the way in — but the lumps pass
      under it at a different rate, and that difference is what makes a node
      climb and drop as it comes: roughly one rise every four to six seconds,
      rather than gliding in at a fixed height. The lumps carry most of the
      amplitude for the same reason: with the cross lines gone, a node's rise
      and fall is where the surface is read.
    */
    function heightAt(x: number, y: number, t: number) {
      return (
        2400 * Math.sin(y / 26000 + t * 0.55) +
        1300 * Math.sin(y / 12000 + x / 90000 + t * 0.9) +
        900 * Math.sin((y + x * 0.35) / 44000 + t * 0.35) +
        3000 * Math.sin(y / 7000 + t * 0.5) * Math.sin(x / 38000 + 0.6) +
        1800 * Math.sin(y / 4500 + t * 0.9 + 1.7) * Math.cos(x / 24000 - 0.4)
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

    /*
      How much of the band the front taper gets, in CSS pixels, measured up
      from the bottom edge — the field's visible front edge, since the grid's
      own near edge (y_near) projects below the band.

      Pixels, where this used to fade over world units. The field is in
      perspective, so a fixed world distance covers a third of the band near
      the front and a few pixels at the horizon: the old 33000-unit ramp
      started taking the lines out from halfway down the band. Reading the
      taper in screen space holds it at the same thickness whatever the band
      measures, so the swell stays lit almost all the way in, then goes.
    */
    const front_fade_px = 80
    const pv = new THREE.Vector3()

    /*
      Screen y, in CSS pixels from the top of the band, of a row at depth y.
      Taken on the flat plane (height 0) — the swell carries a vertex a few
      pixels either side of this, which a taper this soft will not show.
    */
    function screenYAt(y: number) {
      pv.set(0, y, 0)
      field.localToWorld(pv)
      pv.project(camera)
      return ((1 - pv.y) / 2) * size.h
    }

    function fadeAt(y: number) {
      const depth = 10000 + y
      return (
        smoothstep(0, front_fade_px, size.h - screenYAt(y)) *
        (1 - smoothstep(190000, 300000, depth))
      )
    }

    /*
      Every vertex in a row fades the same amount, and a row only moves on
      screen when the band is resized, so the fade is cached per row rather
      than projected for each of the 22,000 vertices.
    */
    const row_fade = new Float32Array(rows + 1)
    function computeFades() {
      for (let r = 0; r <= rows; r++) row_fade[r] = fadeAt(gy[r])
    }
    computeFades()

    function setColor(arr: Float32Array, i: number, r: number, strength: number) {
      const f = row_fade[r] * strength
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
        setColor(colArr, i, r, strength)
      })
      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3))
      geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3))
      const mat = new THREE.LineBasicMaterial({ vertexColors: true })
      const lines = new THREE.LineSegments(geo, mat)
      lines.frustumCulled = false
      field.add(lines)
      return { geo, mat, pos: posArr, col: colArr, idx, count, strength }
    }

    // Lines across the field: no diagonals. Off by default, see above.
    const horiz =
      horizontal_strength > 0
        ? buildLines(
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
            horizontal_strength,
          )
        : null

    // Softer lines running into the field
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
      Vertex colours are written once at build, since they only depend on
      depth — but the front taper is measured in pixels, so a band that
      changes height moves it. Rewritten on resize, not per frame.
    */
    function recolor(set: LineSet) {
      for (let i = 0; i < set.count; i++) {
        setColor(set.col, i, (set.idx[i] / W) | 0, set.strength)
      }
      set.geo.attributes.color.needsUpdate = true
    }

    /*
      --- Nodes: a stream, not a constellation ---
      A node is no longer tied to a grid vertex. Each one holds its own
      continuous (x, y), rides the wave forward, dims to nothing as it
      reaches the front edge, and starts again at the back of the run in a
      new lane.

      That makes the seeding simple: spread them evenly through the depth
      they will travel, which is exactly the distribution the stream settles
      into anyway, so the first second looks like every second after it. The
      field no longer needs the old screen-space spacing pass, whose job was
      to keep a set of fixed points from clumping.
    */
    const node_x = new Float32Array(node_count)
    const node_y = new Float32Array(node_count)

    /*
      Forward speed, matched to the dominant term in heightAt: a crest there
      holds y / 26000 + 0.55t constant, so it advances 26000 * 0.55 world
      units per unit of t. Moving the nodes at exactly that rate keeps each
      one on the same part of its swell the whole way in, rather than sliding
      through crests and valleys as it travels.
    */
    const node_speed = 26000 * 0.55

    const offline: Record<number, boolean> = {}
    /*
      Which signal a node is carrying. Re-rolled with the lane, so a node
      coming back does not read out the same line it just left with, and two
      nodes on screen together are less likely to say the same thing.
    */
    const signal_seed = new Int32Array(node_count)

    /*
      How wide the camera can see at a given depth. The vertical field of
      view is 45°, so the frame is about tan(22.5°) of the distance tall and
      that times the aspect ratio wide. Approximate — the camera is pitched
      down a little — but it is what decides where a node is worth putting.
    */
    const halfWidthAt = (y: number) => (y + 10000) * 0.414 * (size.w / size.h)

    /*
      Lanes are chosen against the width near the FRONT of the run, not at
      the back. The frustum narrows toward the camera, so a node placed at
      the back edge of the far frame would slide out of frame long before it
      arrived; placed this way it starts near the middle and drifts outward
      as it comes on, which is what travelling toward someone looks like. The
      1.5 lets a few pass out of frame at the sides on the way, so the stream
      does not read as a tidy cone. On a narrow phone frame this is the whole
      difference between a populated field and three specks.
    */
    const laneSpread = () => Math.min(x_half * 0.92, halfWidthAt(y_near + 40000) * 1.5)

    /*
      Back to the start of the run in a new lane. The offline flag is
      re-rolled at the rate it was seeded with, so the stream keeps turning
      up the occasional stale node instead of the same three forever.
    */
    const respawn = (n: number) => {
      node_y[n] = spawn_y
      node_x[n] = (Math.random() * 2 - 1) * laneSpread()
      offline[n] = Math.random() < offline_count / node_count
      signal_seed[n] = Math.floor(Math.random() * 97)
    }

    for (let n = 0; n < node_count; n++) {
      respawn(n)
      // Evenly through the run rather than all at the start line.
      node_y[n] = y_near + ((spawn_y - y_near) * (n + Math.random())) / node_count
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

    /*
      The hero node travels with the rest: a brighter lamp rolling in down
      the middle of the field instead of a fixed highlight near the front. It
      starts mid-field so one is on screen immediately, and follows the same
      recycle rule as the stream.
    */
    const hero = { x: (Math.random() * 2 - 1) * halfWidthAt(y_near) * 0.6, y: spawn_y * 0.55 }
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
      The label layer runs in both modes. A touch screen has no hovering
      pointer, so on mobile the labels ride the idle drift that already moves
      the focus point when nothing has touched the field: the signals surface
      on their own, two at a time, and a tap moves the focus to where it
      landed.
    */
    const overlay = document.createElement("div")
    overlay.style.cssText =
      "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:2;"
    container.appendChild(overlay)

    const labels: Label[] = []

    for (let n = 0; n < node_count; n++) {
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
        "font:500 12px/1.2 var(--font-sans), system-ui, sans-serif;color:var(--hero-field-signal);"
      const metric = document.createElement("span")
      metric.style.cssText =
        "font:500 11px/1.2 var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;" +
        "letter-spacing:0.04em;color:var(--hero-field-metric);"
      el.appendChild(shape)
      el.appendChild(msg)
      el.appendChild(metric)
      overlay.appendChild(el)
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
      const msgText = list[(n + signal_seed[n]) % list.length]
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

    /*
      --- Keep-out box for the headline ---
      The headline used to sit on a glass card, which both separated it from
      the field and blurred whatever drifted under it. With the card gone
      there is nothing between the two, so a label that wandered under the
      type would simply collide with it.

      The headline's box is measured in container coordinates and seeded into
      the collision test below, which already knows how to suppress a label
      that overlaps something — a label is dropped for landing on the
      headline exactly as it is for landing on another label, and the slot it
      would have used goes to the next node instead.

      Desktop only: on mobile the headline is above the field, not over it,
      so there is nothing to keep out of. Measured on resize rather than per
      frame because both elements move together — scrolling cannot change
      their offset.
    */
    const panel = container.closest(".hero-field")?.querySelector(".hero-field-panel")
    let text_box: { x: number; y: number; w: number; h: number } | null = null

    const measurePanel = () => {
      if (mobile || !panel) {
        text_box = null
        return
      }
      const cr = container.getBoundingClientRect()
      const pr = panel.getBoundingClientRect()
      // Inflated a little so a label stops short of the type, not against it.
      text_box = {
        x: pr.left - cr.left - 12,
        y: pr.top - cr.top - 12,
        w: pr.width + 24,
        h: pr.height + 24,
      }
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
    window.addEventListener("pointermove", onPointer)
    window.addEventListener("pointerdown", onPointer)

    /*
      The drift sweeps the right half of a wide field, clear of the headline
      panel floating over it. On mobile the panel is above the field rather
      than on top of it, so the whole band is fair game and the sweep is
      centred instead — a label pinned to one side of a 390px field would
      always be reaching for the same two nodes.
    */
    const drift_x = mobile ? 0.5 : 0.68
    const drift_amp = mobile ? 0.26 : 0.2

    function updateFocus(now: number) {
      if (now - last_pointer > idle_ms) {
        if (reduce_motion) {
          focus.x = size.w * drift_x
          focus.y = size.h * 0.55
        } else {
          focus.x = size.w * (drift_x + Math.sin(now * 0.00017) * drift_amp)
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
      toward its state colour when a label is pulling it (`near` > 0).
    */
    const paintNode = (
      n: number,
      t: number,
      near: number,
      state: StateName | null,
      fade: number,
    ) => {
      if (offline[n]) {
        node_colors[n * 3] = offline_color.r * 0.35 * fade
        node_colors[n * 3 + 1] = offline_color.g * 0.35 * fade
        node_colors[n * 3 + 2] = offline_color.b * 0.35 * fade
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
      /*
        The last multiply is the node's own run: full while it is out in the
        field, tapering to nothing as it reaches the front edge and again
        just after it rises at the horizon. With additive blending a fade to
        zero is a fade into the background, leaving nothing behind.
      */
      node_colors[n * 3] = cr * fade
      node_colors[n * 3 + 1] = cg * fade
      node_colors[n * 3 + 2] = cb * fade
    }

    function updateNodes(now: number) {
      updateFocus(now)
      field.updateMatrixWorld()

      const ranked: number[] = []
      for (let n = 0; n < node_count; n++) {
        // Nodes hold still under prefers-reduced-motion, as the wave does.
        if (!reduce_motion) node_y[n] -= node_speed * dt

        const nx = node_x[n]
        const ny = node_y[n]
        // Sampled from the wave directly: a node is no longer on a vertex.
        const h = heightAt(nx, ny, time)
        const nz = h + node_lift
        node_positions[n * 3] = nx
        node_positions[n * 3 + 1] = ny
        node_positions[n * 3 + 2] = nz

        const t = Math.max(0, Math.min(1, (h + wave_amp) / (2 * wave_amp)))
        const confidence = 0.35 + 0.6 * t

        v.set(nx, ny, nz)
        field.localToWorld(v)
        v.project(camera)
        const sx = ((v.x + 1) / 2) * size.w
        const sy = ((1 - v.y) / 2) * size.h

        /*
          The node has run out the front of the field, so it goes back to the
          start. Tested in world depth rather than on screen, because the
          front edge of the field is a depth — y_near — and the fade below
          has already taken the node to nothing by the time it gets there, so
          the jump is never visible.
        */
        const gone = v.z >= 1 || ny <= y_near || v.x < -1.3 || v.x > 1.3
        if (gone) respawn(n)

        /*
          A node's run: it comes up out of the distance, holds across the
          field, then dies away over the last stretch and falls off the front
          edge. Both ends are the same smoothstep, measured in distance
          travelled, so nothing pops in or out at either end.
        */
        const fade = gone
          ? 0
          : smoothstep(spawn_y, spawn_y - fade_in_span, ny) *
            smoothstep(y_near, y_near + fade_out_span, ny)

        const visible = fade > 0 && v.x > -1.1 && v.x < 1.1
        const d = visible ? Math.hypot(sx - focus.x, sy - focus.y) : Infinity
        scr[n] = { sx, sy, d, confidence, t, fade }
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
      if (text_box) placed.push(text_box)
      let shown = 0

      for (let r = 0; r < ranked.length; r++) {
        const n = ranked[r]
        const s = scr[n]
        const label = labels[n]
        const state: StateName = offline[n] ? "OFFLINE" : stateFor(s.confidence)
        /*
          A label is only offered to a node that is well into its run. One on
          a node about to dissolve would be read halfway and then taken away,
          and one on a node still rising out of the haze would arrive before
          the light it belongs to.
        */
        let near =
          shown < max_labels && s.d < reveal_radius && s.fade > 0.6
            ? 1 - s.d / reveal_radius
            : 0

        // Only show a label if it doesn't overlap one already placed
        if (near > 0) {
          fillLabel(label, n, state, s.confidence)
          const bw = label.w
          /*
            Desktop hangs the label off the node's right shoulder, as the
            prototype did, and flips it to the left shoulder near the right
            edge so the text is never clipped.

            On a phone a signal is nearly as wide as the field itself, so
            there is no shoulder to hang it from. The label centres under its
            node and is held inside the band, which reads as a caption for
            the light above it rather than a line running off the edge.
          */
          const bx = mobile
            ? Math.min(Math.max(8, s.sx - bw / 2), Math.max(8, size.w - 8 - bw))
            : s.sx + 10 + bw > size.w - 8
              ? Math.max(8, s.sx - 10 - bw)
              : s.sx + 10
          const by = mobile ? s.sy + 12 : s.sy - 18
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

        paintNode(n, s.t, near, state, s.fade)

        const target_opacity = near > 0 ? Math.min(1, 0.35 + near) * s.fade : 0
        if (target_opacity !== label.opacity) {
          label.el.style.opacity = target_opacity.toFixed(2)
          label.opacity = target_opacity
        }
      }

      node_geometry.attributes.position.needsUpdate = true
      node_geometry.attributes.color.needsUpdate = true

      if (!reduce_motion) hero.y -= node_speed * dt
      hero_positions[0] = hero.x
      hero_positions[1] = hero.y
      hero_positions[2] = heightAt(hero.x, hero.y, time) + node_lift
      hero_geometry.attributes.position.needsUpdate = true

      /*
        The hero sprite has one colour for the whole point rather than a
        per-vertex one, so its run is carried on the material's opacity
        instead of in the colour buffer. Same two-ended fade, same recycle.
      */
      if (hero.y <= y_near) {
        hero.y = spawn_y
        hero.x = (Math.random() * 2 - 1) * halfWidthAt(y_near) * 0.6
        hero_material.opacity = 0
      } else {
        hero_material.opacity =
          smoothstep(spawn_y, spawn_y - fade_in_span, hero.y) *
          smoothstep(y_near, y_near + fade_out_span, hero.y)
      }
    }

    let time = 0
    let did_first_frame = false
    let raf = 0

    function render() {
      raf = requestAnimationFrame(render)
      const now = performance.now()
      if (!reduce_motion || !did_first_frame) {
        if (!reduce_motion) time += dt
        computeHeights(time)
        if (horiz) updateLines(horiz)
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
      computeFades()
      if (horiz) recolor(horiz)
      recolor(vert)
      placeBands()
      measurePanel()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    placeBands()
    measurePanel()

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
      horiz?.geo.dispose()
      horiz?.mat.dispose()
      vert.geo.dispose()
      vert.mat.dispose()
      node_geometry.dispose()
      node_material.dispose()
      hero_geometry.dispose()
      hero_material.dispose()
      glow.dispose()
      renderer.dispose()
      overlay.remove()
      horizon_band.remove()
      front_band.remove()
      renderer.domElement.remove()
    }
  }, [mobile])

  return <div ref={ref} aria-hidden="true" className="absolute inset-0 overflow-hidden" />
}
