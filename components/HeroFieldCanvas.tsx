"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { createMessageScheduler, type ActiveMessage } from "@/lib/messageScheduler"

/*
  Ported from reference/hero-waves.js (CodePen prototype). The wave and the
  ambient stream are carried over; the messages are not. They used to be
  random signals revealed under the pointer; they are now emitted on a fixed,
  seeded cycle by lib/messageScheduler.ts (notes in lib/messageScheduler.md), so the
  "needs a person" state is guaranteed to appear early instead of by luck.

  What changed in the port is ownership. The prototype owned the whole window: it mounted into
  #main, sized itself to innerWidth/innerHeight, and hung its labels and blur
  bands off document.body as position:fixed. Here everything lives inside one
  ref'd container that is sized by a ResizeObserver, so the field is a band on
  the page rather than a background behind the whole document, and every node
  it creates is removed again on unmount.

  Loaded by HeroField.tsx through next/dynamic with ssr:false — it builds a
  WebGLRenderer and reads getComputedStyle on mount, neither of which exists
  on the server.
*/

/*
  The occasional stale node in the ambient stream. These carry no message;
  they are texture, a reminder that not every light on the field is live.
*/
const OFFLINE_COLOR = "#7a8594"

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
    label: v("--hero-field-label"),
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

/*
  One label element per scheduler slot. The scheduler caps how many messages
  are alive at once (maxActive), so the pool is that size and a slot is handed
  to each new message and given back when it leaves.
*/
type Slot = {
  id: number // message id, 0 when free
  el: HTMLDivElement
  dot: HTMLSpanElement
  text: HTMLSpanElement
  w: number
  h: number
  opacity: number
  side: 0 | 1 // which candidate spot it took last frame
  downUntil: number // ms; stood down for a collision until then
}

type Box = { x: number; y: number; w: number; h: number }

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

      The lines running into the field are at 0 too, so the grid is gone
      altogether and the field is read from the nodes alone. Same rule: at 0
      the set is skipped, not drawn invisibly. Set either back above 0 (0.4
      was the old value for these) to bring its lines back.
    */
    const horizontal_strength = 0
    const vertical_strength = 0
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

    // --- Message settings ---
    /*
      When, what and how bright is decided by lib/messageScheduler.ts; this
      file only decides where. Tune the rhythm there (see lib/messageScheduler.md), not here.

      The seed makes the opening a designed thing: the same few seconds play
      on every load, with the first "needs a person" message landing at about
      5.4s while two dim ones are still on screen.

      Phones get three lanes and three live messages instead of five and four:
      the band is a third of the width, and a fourth message only crowds the
      ones that matter.
    */
    const scheduler = createMessageScheduler({
      seed: 7,
      ...(mobile ? { lanes: 3, maxActive: 3 } : {}),
    })
    const cfg = scheduler.config
    /*
      The depth a message travels, in world units. It starts once the ambient
      stream around it has come up out of the haze and ends just short of the
      front taper, so `progress` 0..1 is the stretch of the field that is
      actually legible. Messages ride toward the viewer like everything else
      on the field, which is why lanes are bands across the width here rather
      than the vertical bands in the lib/messageScheduler.md example: depth already keeps two
      messages apart vertically, and lanes keep them apart sideways.
    */
    const msg_y_from = 108000
    const msg_y_to = 7000
    // How far a message may sit off its lane centre, as a fraction of the
    // lane width. Under half, or the lanes stop being lanes.
    const lane_nudge = 0.4
    const label_gap = 8 // pixels of clearance between labels

    // Field speed eases toward this: 1 normally, cfg.hoverTimeScale on hover.
    let time_scale = 1
    let time_scale_target = 1

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

    // Softer lines running into the field. Off by default, see above.
    const vert =
      vertical_strength > 0
        ? buildLines(
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
        : null

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
    const offline_color = new THREE.Color(OFFLINE_COLOR)

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
      --- Message nodes ---
      Each live message gets its own light on the field, separate from the
      ambient stream: bright for one that needs a person, dim for one the
      automation is handling. Two Points sets rather than one, because a
      PointsMaterial has a single size and the two kinds glow at different
      sizes. Both are sized to the scheduler's cap and indexed by slot; a slot
      not in use in a set is painted black, which under additive blending is
      nothing at all.

      Both glow in --hero-field-label, the same near-white as the label text
      and the legend dots, so the legend describes exactly what is on the
      field. The kinds differ only in brightness and size, which is the
      scheduler's fade peak doing its job as the contrast dial.
    */
    const slots = cfg.maxActive
    const label_color = new THREE.Color(palette.label)

    const makeMessagePoints = (glowSize: number) => {
      const pos = new Float32Array(slots * 3)
      const col = new Float32Array(slots * 3)
      const geo = new THREE.BufferGeometry()
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3))
      const mat = glowMaterial({ size: glowSize, vertexColors: true })
      const points = new THREE.Points(geo, mat)
      points.frustumCulled = false
      field.add(points)
      return { pos, col, geo, mat }
    }
    const human_points = makeMessagePoints(node_size * 1.7)
    const auto_points = makeMessagePoints(node_size * 1.15)

    /*
      --- Labels ---
      Built imperatively rather than through React: they are written to on
      every frame from the render loop, and routing that through React state
      would re-render the tree at 60fps.
    */
    const overlay = document.createElement("div")
    overlay.style.cssText =
      "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:2;"
    container.appendChild(overlay)

    const pool: Slot[] = []
    for (let i = 0; i < slots; i++) {
      const el = document.createElement("div")
      /*
        Labels wrap rather than run on, so a long line stays near its light
        instead of reaching across the neighbouring lanes. The short opacity
        transition only smooths a label standing down for a collision; the
        fade itself comes from the scheduler, frame by frame.
      */
      el.style.cssText =
        "position:absolute;left:0;top:0;display:flex;align-items:flex-start;gap:7px;" +
        "max-width:" +
        (mobile ? "calc(100% - 16px)" : "260px") +
        ";opacity:0;transition:opacity 160ms linear;will-change:transform,opacity;"
      const dot = document.createElement("span")
      const text = document.createElement("span")
      text.style.cssText =
        "font:500 12px/1.35 var(--font-sans), system-ui, sans-serif;color:var(--hero-field-label);"
      el.appendChild(dot)
      el.appendChild(text)
      overlay.appendChild(el)
      pool.push({ id: 0, el, dot, text, w: 0, h: 0, opacity: 0, side: 0, downUntil: 0 })
    }

    /*
      Same marks as the legend under the CTAs: a filled dot for "needs a
      person", a ring for "automation handling it". The label's own opacity
      carries the kind's brightness, so a ring at the auto peak matches the
      legend's ring.
    */
    const DOT_BASE =
      "flex:none;width:8px;height:8px;border-radius:50%;margin-top:4px;box-sizing:border-box;"
    const fillSlot = (slot: Slot, m: ActiveMessage) => {
      slot.id = m.id
      slot.side = 0
      slot.downUntil = 0
      const human = m.kind === "human"
      slot.dot.style.cssText =
        DOT_BASE +
        (human
          ? "background:var(--hero-field-label);"
          : "border:1.5px solid var(--hero-field-label);")
      slot.text.style.fontWeight = human ? "600" : "500"
      slot.text.textContent = m.text
      /*
        offsetWidth forces a layout, so the box is measured once, when the
        text is set, not on every frame. The collision test below reads it.
      */
      slot.w = slot.el.offsetWidth
      slot.h = slot.el.offsetHeight
    }

    /*
      --- Keep-out box for the headline ---
      The headline sits directly on the field, so a label that wandered under
      the type would collide with it. Its box (legend included) is measured in
      container coordinates; it bounds the lanes on the left and is seeded
      into the collision test, so a label can never land on it.

      Desktop only: on mobile the headline is above the field, not over it.
      Measured on resize rather than per frame because both move together.
    */
    const panel = container.closest(".hero-field")?.querySelector(".hero-field-panel")
    /*
      The legend is pinned to the band's bottom-right corner on desktop, out
      of the panel's flow, so the panel's box no longer covers it. It gets a
      keep-out box of its own.
    */
    const legend = container.closest(".hero-field")?.querySelector(".hero-legend")
    let text_box: Box | null = null
    let legend_box: Box | null = null

    const measurePanel = () => {
      if (mobile || !panel) {
        text_box = null
        legend_box = null
        return
      }
      const cr = container.getBoundingClientRect()
      if (legend) {
        const lr = legend.getBoundingClientRect()
        legend_box = {
          x: lr.left - cr.left - 12,
          y: lr.top - cr.top - 12,
          w: lr.width + 24,
          h: lr.height + 24,
        }
      }
      const pr = panel.getBoundingClientRect()
      // Inflated a little so a label stops short of the type, not against it.
      text_box = {
        x: pr.left - cr.left - 12,
        y: pr.top - cr.top - 12,
        w: pr.width + 24,
        h: pr.height + 24,
      }
    }

    /*
      The horizontal stretch the lanes divide up: everything right of the
      headline on desktop, the whole band on a phone. On a narrow desktop the
      headline leaves too little room, so the lanes take the right half and
      the collision test keeps labels off the type.
    */
    const laneRegion = () => {
      const right = size.w - 40
      if (!text_box) return { left: 24, right: size.w - 24 }
      const left = text_box.x + text_box.w + 24
      return right - left >= 260 ? { left, right } : { left: size.w * 0.5, right }
    }

    /*
      --- Hover ---
      Hovering the hero slows the whole field (wave, stream and messages) so
      a message can actually be read. Mouse and pen only: a touch has no
      hover, and a tap would leave the field stuck slow with nothing to end
      it. Hover never spawns a message; the cycle runs on its own whether or
      not anyone points at it.
    */
    const section = container.closest<HTMLElement>(".hero-field")
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") {
        time_scale_target = cfg.hoverTimeScale
      }
    }
    const onLeave = () => {
      time_scale_target = 1
    }
    section?.addEventListener("pointerenter", onEnter)
    section?.addEventListener("pointerleave", onLeave)

    /*
      Ambient node colour. The stream glows with the wave, dark in the
      valleys and bright at the crests, and carries no message; offline
      nodes are a dim grey wherever they are.
    */
    const paintNode = (n: number, t: number, fade: number) => {
      if (offline[n]) {
        node_colors[n * 3] = offline_color.r * 0.35 * fade
        node_colors[n * 3 + 1] = offline_color.g * 0.35 * fade
        node_colors[n * 3 + 2] = offline_color.b * 0.35 * fade
        return
      }
      /*
        The fade multiply is the node's own run: full while it is out in the
        field, tapering to nothing at the front edge and just after it rises
        at the horizon. With additive blending a fade to zero is a fade into
        the background, leaving nothing behind.
      */
      const b = (0.12 + 0.88 * t * t) * fade
      node_colors[n * 3] = base_color.r * b
      node_colors[n * 3 + 1] = base_color.g * b
      node_colors[n * 3 + 2] = base_color.b * b
    }

    const v = new THREE.Vector3()

    function updateNodes() {
      field.updateMatrixWorld()
      const step = node_speed * dt * time_scale

      for (let n = 0; n < node_count; n++) {
        // Nodes hold still under prefers-reduced-motion, as the wave does.
        if (!reduce_motion) node_y[n] -= step

        const nx = node_x[n]
        const ny = node_y[n]
        // Sampled from the wave directly: a node is not on a vertex.
        const h = heightAt(nx, ny, time)
        const nz = h + node_lift
        node_positions[n * 3] = nx
        node_positions[n * 3 + 1] = ny
        node_positions[n * 3 + 2] = nz

        v.set(nx, ny, nz)
        field.localToWorld(v)
        v.project(camera)

        /*
          The node has run out the front of the field, so it goes back to the
          start. Tested in world depth, because the fade below has already
          taken the node to nothing by the time it gets there, so the jump is
          never visible.
        */
        const gone = v.z >= 1 || ny <= y_near || v.x < -1.3 || v.x > 1.3
        if (gone) respawn(n)

        /*
          A node's run: it comes up out of the distance, holds across the
          field, then dies away over the last stretch. Both ends are the same
          smoothstep, so nothing pops in or out at either end.
        */
        const fade = gone
          ? 0
          : smoothstep(spawn_y, spawn_y - fade_in_span, ny) *
            smoothstep(y_near, y_near + fade_out_span, ny)

        const t = Math.max(0, Math.min(1, (h + wave_amp) / (2 * wave_amp)))
        paintNode(n, t, fade)
      }

      node_geometry.attributes.position.needsUpdate = true
      node_geometry.attributes.color.needsUpdate = true

      if (!reduce_motion) hero.y -= step
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

    /*
      Screen x (CSS pixels) of a point on the field. Used to solve for the
      world x that puts a message on its lane: at a given depth, screen x is
      linear in world x, so two projections give the line and one division
      inverts it. Exact, unlike halfWidthAt, which ignores the camera's pitch.
    */
    const screenX = (x: number, y: number) => {
      v.set(x, y, node_lift)
      field.localToWorld(v)
      v.project(camera)
      return ((v.x + 1) / 2) * size.w
    }

    const overlaps = (b: Box, placed: Box[]) => {
      for (const q of placed) {
        if (
          b.x < q.x + q.w + label_gap &&
          b.x + b.w + label_gap > q.x &&
          b.y < q.y + q.h + label_gap &&
          b.y + b.h + label_gap > q.y
        )
          return true
      }
      return false
    }

    function updateMessages() {
      const active = scheduler.active

      // Give back the slots of messages that have left the field.
      for (const slot of pool) {
        if (slot.id && !active.some((m) => m.id === slot.id)) {
          slot.id = 0
          slot.opacity = 0
          slot.el.style.opacity = "0"
        }
      }

      human_points.col.fill(0)
      auto_points.col.fill(0)

      /*
        Placement order is priority order: anything that needs a person goes
        first, then oldest first. If two labels would collide, the one that
        gives way is the routine one, never the one waiting on someone.
      */
      const ordered = active
        .slice()
        .sort((a, b) => (a.kind === b.kind ? a.id - b.id : a.kind === "human" ? -1 : 1))

      const region = laneRegion()
      const lane_w = (region.right - region.left) / cfg.lanes
      const placed: Box[] = []
      if (text_box) placed.push(text_box)
      if (legend_box) placed.push(legend_box)

      for (const m of ordered) {
        let i = pool.findIndex((s) => s.id === m.id)
        if (i === -1) {
          i = pool.findIndex((s) => s.id === 0)
          if (i === -1) continue
          fillSlot(pool[i], m)
        }
        const slot = pool[i]

        /*
          Depth from progress, screen x from the lane. Progress is eased
          before it becomes depth: perspective packs the far half of the field
          into a thin strip under the horizon, so a linear run would spend
          most of a message's life up there. Covering the far distance fast
          and the near distance slowly spreads its time evenly down the band.
        */
        const p = 1 - (1 - m.progress) * (1 - m.progress)
        const wy = msg_y_from + (msg_y_to - msg_y_from) * p
        const lane_x = region.left + lane_w * (m.lane + 0.5 + m.laneOffset * lane_nudge)
        /*
          A slight outward drift as it comes on, so a message reads as
          travelling toward you rather than sliding down a rail.
        */
        const target_x = lane_x + (lane_x - size.w / 2) * 0.12 * m.progress
        const x0 = screenX(0, wy)
        const x1 = screenX(10000, wy)
        const wx = ((target_x - x0) / (x1 - x0)) * 10000
        const wz = heightAt(wx, wy, time) + node_lift

        const set = m.kind === "human" ? human_points : auto_points
        set.pos[i * 3] = wx
        set.pos[i * 3 + 1] = wy
        set.pos[i * 3 + 2] = wz
        set.col[i * 3] = label_color.r * m.opacity
        set.col[i * 3 + 1] = label_color.g * m.opacity
        set.col[i * 3 + 2] = label_color.b * m.opacity

        v.set(wx, wy, wz)
        field.localToWorld(v)
        v.project(camera)
        const sx = ((v.x + 1) / 2) * size.w
        const sy = ((1 - v.y) / 2) * size.h

        /*
          Two candidate spots, tried in order; the first that is clear wins.
          Desktop hangs the label off the light's shoulder with the dot level
          with it: on the right unless that runs off the edge, else the left.
          A phone has no shoulder to spare, so the label is a caption centred
          under its light, or above it if under is taken.
        */
        const w = slot.w
        const h = slot.h
        const mx = Math.min(Math.max(8, sx - w / 2), Math.max(8, size.w - 8 - w))
        const right: Box = { x: sx + 12, y: sy - 8, w, h }
        const left: Box = { x: sx - 12 - w, y: sy - 8, w, h }
        const candidates: Box[] = mobile
          ? [
              { x: mx, y: sy + 12, w, h },
              { x: mx, y: sy - 12 - h, w, h },
            ]
          : sx + 12 + w <= size.w - 8
            ? [right, left]
            : [left, right]
        /*
          Hysteresis, so a crowded label does not flicker. It tries the side
          it used last frame first, and once it has had to stand down it
          stays down for a moment rather than blinking back the next frame.
        */
        const now_ms = performance.now()
        const order = slot.side === 1 ? [1, 0] : [0, 1]
        let spot: Box | undefined
        if (now_ms >= slot.downUntil) {
          for (const k of order) {
            const b = candidates[k]
            if (b.x >= 0 && b.x + b.w <= size.w && !overlaps(b, placed)) {
              spot = b
              slot.side = k as 0 | 1
              break
            }
          }
          if (!spot) slot.downUntil = now_ms + 900
        }

        if (spot) {
          placed.push(spot)
          slot.el.style.transform =
            "translate(" + Math.round(spot.x) + "px," + Math.round(spot.y) + "px)"
        }
        const target = spot ? m.opacity : 0
        if (Math.abs(target - slot.opacity) > 0.005) {
          slot.el.style.opacity = target.toFixed(3)
          slot.opacity = target
        }
      }

      human_points.geo.attributes.position.needsUpdate = true
      human_points.geo.attributes.color.needsUpdate = true
      auto_points.geo.attributes.position.needsUpdate = true
      auto_points.geo.attributes.color.needsUpdate = true
    }

    /*
      Under reduced motion nothing travels, so the field shows one designed
      still instead: the seeded cycle is run forward off-screen to the first
      moment a "needs a person" message is at full strength while an
      automated one is still visible, and held there. Both states side by
      side, matching the legend, so the point survives without the motion.
    */
    if (reduce_motion) {
      for (let k = 0; k < 60 * 30; k++) {
        const a = scheduler.update(1 / 60)
        if (
          a.some((m) => m.kind === "human" && m.opacity >= cfg.fade.human.peak) &&
          a.some((m) => m.kind === "auto" && m.opacity >= cfg.fade.auto.peak * 0.6)
        )
          break
      }
    }

    let time = 0
    let did_first_frame = false
    let raf = 0
    // Timestamp of the previous frame; 0 when the loop has just (re)started.
    let last = 0

    function render(now: number) {
      raf = requestAnimationFrame(render)
      /*
        The scheduler runs on real seconds, clamped so a long gap (the loop
        paused off-screen, a backgrounded tab) does not land as one huge step.
      */
      const elapsed = last ? Math.min(0.1, (now - last) / 1000) : 0
      last = now
      // Eased rather than switched, so hover reads as the field slowing down.
      time_scale += (time_scale_target - time_scale) * 0.08

      if (!reduce_motion || !did_first_frame) {
        if (!reduce_motion) time += dt * time_scale
        computeHeights(time)
        if (horiz) updateLines(horiz)
        if (vert) updateLines(vert)
        did_first_frame = true
      }
      if (!reduce_motion) scheduler.update(elapsed * time_scale)
      updateNodes()
      updateMessages()
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
      if (vert) recolor(vert)
      placeBands()
      measurePanel()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    placeBands()
    measurePanel()

    /*
      The loop only runs while the band is on screen and the tab is in the
      foreground. Rewriting the field every frame is not worth doing while it
      is scrolled out of sight, and on a phone it is battery burnt for nothing.
      requestAnimationFrame already stops in a hidden tab in most browsers,
      but not in all of them and not when the window is merely occluded, so
      the visibility gate is explicit.
    */
    let running = false
    let onScreen = false
    const start = () => {
      if (!running) {
        running = true
        last = 0
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
      section?.removeEventListener("pointerenter", onEnter)
      section?.removeEventListener("pointerleave", onLeave)
      horiz?.geo.dispose()
      horiz?.mat.dispose()
      vert?.geo.dispose()
      vert?.mat.dispose()
      node_geometry.dispose()
      node_material.dispose()
      hero_geometry.dispose()
      hero_material.dispose()
      human_points.geo.dispose()
      human_points.mat.dispose()
      auto_points.geo.dispose()
      auto_points.mat.dispose()
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
