var bg_color = "#0a0f16";
var line_color = "#010101";
var node_color = "#2dd4bf";
var hero_node_color = "#38bdf8";
var label_text_color = "#e8edf3";
var label_metric_color = "#8fa3b8";

// Machine-state kit tokens: swap in the exact values from your machine-ui repo
var STATES = {
  OPERATIONAL: { color: "#3ddc84", shape: "circle" },
  WARNING: { color: "#f5c04a", shape: "triangle" },
  DEGRADED: { color: "#f08a4b", shape: "diamond" },
  FAULT: { color: "#f06a6a", shape: "square" },
  OFFLINE: { color: "#7a8594", shape: "ring" }
};

// Plain-language signals for each state
var SIGNALS = {
  OPERATIONAL: [
    "On route, no action needed",
    "Picking in Aisle 4",
    "Path clear",
    "Delivery on schedule",
    "Docked and ready"
  ],
  WARNING: [
    "Battery low, returning to dock",
    "Path blocked, rerouting",
    "Running 3 min behind",
    "Check before next shift"
  ],
  DEGRADED: [
    "Running on backup sensor",
    "Slowed down near people",
    "Weak signal, using last known position"
  ],
  FAULT: [
    "Stopped, needs your input",
    "Arm jammed, handing off to you",
    "Holding position, awaiting operator"
  ],
  OFFLINE: [
    "No signal, last seen 12s ago",
    "Data is stale, don't act on this"
  ]
};

function stateFor(c) {
  if (c >= 0.75) return "OPERATIONAL";
  if (c >= 0.6) return "WARNING";
  if (c >= 0.47) return "DEGRADED";
  return "FAULT";
}

function shapeSVG(shape, color) {
  var s;
  if (shape === "circle") s = '<circle cx="6" cy="6" r="5" fill="' + color + '"/>';
  else if (shape === "triangle") s = '<polygon points="6,1 11.5,11 0.5,11" fill="' + color + '"/>';
  else if (shape === "diamond") s = '<polygon points="6,0.5 11.5,6 6,11.5 0.5,6" fill="' + color + '"/>';
  else if (shape === "square") s = '<rect x="1" y="1" width="10" height="10" fill="' + color + '"/>';
  else s = '<circle cx="6" cy="6" r="4.5" fill="none" stroke="' + color + '" stroke-width="1.5"/>';
  return '<svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">' + s + "</svg>";
}

function smoothstep(a, b, x) {
  var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function makeGlowTexture() {
  var size = 128,
    canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  var ctx = canvas.getContext("2d");
  var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,255,255,0.85)");
  g.addColorStop(0.5, "rgba(255,255,255,0.2)");
  g.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function wavesBackground() {
  // --- Field settings ---
  var cols = 80,
    rows = 140,
    x_half = 260000,
    y_near = 2000,
    y_far = 310000,
    wave_amp = 6000,
    vertical_strength = 0.4,
    look_y = 7900; // lower number = waves reach higher up the hero

  // --- Node settings ---
  var node_count = 60,
    min_spacing = 70, // pixels between nodes on screen: higher = more spread out
    offline_count = 3,
    node_size = 4500,
    hero_node_size = 9000,
    node_lift = 300;

  // --- Label settings ---
  var reveal_radius = 170,
    max_labels = 4,
    label_gap = 6, // pixels of clearance between labels
    idle_ms = 3000;

  var reduce_motion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var container = document.getElementById("main");
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 400000);
  camera.position.set(0, 10000, 10000);
  camera.lookAt(new THREE.Vector3(0, look_y, 0));
  camera.updateMatrixWorld();

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(bg_color, 1, 300000);

  var field = new THREE.Group();
  field.rotation.x = -Math.PI / 2;
  scene.add(field);
  field.updateMatrixWorld();

  var renderer = new THREE.WebGLRenderer({ alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(bg_color, 1);
  container.appendChild(renderer.domElement);

  // --- Height grid ---
  var W = cols + 1;
  var gx = new Float32Array(W),
    gy = new Float32Array(rows + 1),
    H = new Float32Array((rows + 1) * W);
  for (var c = 0; c <= cols; c++) gx[c] = -x_half + (2 * x_half * c) / cols;
  for (var r = 0; r <= rows; r++) gy[r] = y_near + ((y_far - y_near) * r) / rows;

  function heightAt(x, y, t) {
    return (
      2600 * Math.sin(x / 52000 + t * 0.45) +
      2000 * Math.sin(y / 38000 - t * 0.32) +
      1400 * Math.sin((x - y) / 70000 + t * 0.22)
    );
  }

  function computeHeights(t) {
    for (var r = 0; r <= rows; r++) {
      for (var c = 0; c <= cols; c++) {
        H[r * W + c] = heightAt(gx[c], gy[r], t);
      }
    }
  }

  var bg = new THREE.Color(bg_color),
    lc = new THREE.Color(line_color);

  function fadeAt(y) {
    var depth = 10000 + y;
    return smoothstep(12000, 45000, depth) * (1 - smoothstep(190000, 300000, depth));
  }

  function setColor(arr, i, y, strength) {
    var f = fadeAt(y) * strength;
    arr[i * 3] = bg.r + (lc.r - bg.r) * f;
    arr[i * 3 + 1] = bg.g + (lc.g - bg.g) * f;
    arr[i * 3 + 2] = bg.b + (lc.b - bg.b) * f;
  }

  function buildLines(count, fill, strength) {
    var posArr = new Float32Array(count * 3),
      colArr = new Float32Array(count * 3),
      idx = new Int32Array(count);
    fill(function (i, c, r) {
      posArr[i * 3] = gx[c];
      posArr[i * 3 + 1] = gy[r];
      idx[i] = r * W + c;
      setColor(colArr, i, gy[r], strength);
    });
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
    var lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true }));
    lines.frustumCulled = false;
    field.add(lines);
    return { geo: geo, pos: posArr, idx: idx, count: count };
  }

  var horiz = buildLines((rows + 1) * cols * 2, function (put) {
    var i = 0;
    for (var r = 0; r <= rows; r++) {
      for (var c = 0; c < cols; c++) {
        put(i++, c, r);
        put(i++, c + 1, r);
      }
    }
  }, 1);

  var vert = buildLines(W * rows * 2, function (put) {
    var i = 0;
    for (var c = 0; c <= cols; c++) {
      for (var r = 0; r < rows; r++) {
        put(i++, c, r);
        put(i++, c, r + 1);
      }
    }
  }, vertical_strength);

  function updateLines(set) {
    for (var i = 0; i < set.count; i++) set.pos[i * 3 + 2] = H[set.idx[i]];
    set.geo.attributes.position.needsUpdate = true;
  }

  // --- Nodes: spread evenly across the screen, so more land in the front ---
  var vw = window.innerWidth,
    vh = window.innerHeight,
    pv = new THREE.Vector3();

  pv.set(0, y_far, 0);
  field.localToWorld(pv);
  pv.project(camera);
  var horizon_y = ((1 - pv.y) / 2) * vh;

  var candidates = [];
  for (var r = 0; r <= rows; r++) {
    for (var c = 0; c <= cols; c++) {
      pv.set(gx[c], gy[r], 0);
      field.localToWorld(pv);
      pv.project(camera);
      if (pv.z >= 1) continue;
      var sx = ((pv.x + 1) / 2) * vw,
        sy = ((1 - pv.y) / 2) * vh;
      if (sx < vw * 0.04 || sx > vw * 0.96) continue;
      if (sy < horizon_y + 30 || sy > vh * 0.74) continue; // stay out of the horizon haze and front blur
      candidates.push({ gi: r * W + c, sx: sx, sy: sy });
    }
  }
  for (var k = candidates.length - 1; k > 0; k--) {
    var j = Math.floor(Math.random() * (k + 1)),
      tmp = candidates[k];
    candidates[k] = candidates[j];
    candidates[j] = tmp;
  }
  var accepted = [];
  for (var k = 0; k < candidates.length && accepted.length < node_count; k++) {
    var cand = candidates[k],
      ok = true;
    for (var a = 0; a < accepted.length; a++) {
      if (Math.hypot(cand.sx - accepted[a].sx, cand.sy - accepted[a].sy) < min_spacing) {
        ok = false;
        break;
      }
    }
    if (ok) accepted.push(cand);
  }
  var node_grid = accepted.map(function (a) { return a.gi; });
  node_count = node_grid.length;

  function gridX(gi) { return gx[gi % W]; }
  function gridY(gi) { return gy[Math.floor(gi / W)]; }

  var offline = {};
  for (var k = 0; k < offline_count; k++) {
    offline[Math.floor(Math.random() * node_count)] = true;
  }

  var glow = makeGlowTexture();

  function glowMaterial(opts) {
    return new THREE.PointsMaterial(
      Object.assign(
        {
          map: glow,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
        },
        opts
      )
    );
  }

  var node_positions = new Float32Array(node_count * 3),
    node_colors = new Float32Array(node_count * 3);
  var node_geometry = new THREE.BufferGeometry();
  node_geometry.setAttribute("position", new THREE.BufferAttribute(node_positions, 3));
  node_geometry.setAttribute("color", new THREE.BufferAttribute(node_colors, 3));
  var nodes = new THREE.Points(node_geometry, glowMaterial({ size: node_size, vertexColors: true }));
  nodes.frustumCulled = false;
  field.add(nodes);

  var hero_grid = node_grid.reduce(function (best, gi) {
    var d = Math.hypot(gridX(gi), gridY(gi) - 60000);
    var bd = Math.hypot(gridX(best), gridY(best) - 60000);
    return d < bd ? gi : best;
  }, node_grid[0]);
  var hero_positions = new Float32Array(3);
  var hero_geometry = new THREE.BufferGeometry();
  hero_geometry.setAttribute("position", new THREE.BufferAttribute(hero_positions, 3));
  var hero_node = new THREE.Points(hero_geometry, glowMaterial({ size: hero_node_size, color: hero_node_color }));
  hero_node.frustumCulled = false;
  field.add(hero_node);

  var base_color = new THREE.Color(node_color),
    offline_color = new THREE.Color(STATES.OFFLINE.color),
    state_color = new THREE.Color();

  // --- Blur bands at the horizon and front edge ---
  function makeBand(blur, mask) {
    var d = document.createElement("div");
    d.style.cssText =
      "position:fixed;left:0;width:100%;pointer-events:none;z-index:1;" +
      "backdrop-filter:blur(" + blur + "px);-webkit-backdrop-filter:blur(" + blur + "px);" +
      "mask-image:" + mask + ";-webkit-mask-image:" + mask + ";";
    document.body.appendChild(d);
    return d;
  }
  var horizon_band = makeBand(3, "linear-gradient(to bottom, transparent 0%, #000 50%, transparent 100%)");
  var front_band = makeBand(6, "linear-gradient(to bottom, transparent 0%, #000 100%)");
  var hv = new THREE.Vector3();

  function placeBands() {
    var rect = renderer.domElement.getBoundingClientRect();
    hv.set(0, y_far, 0);
    field.localToWorld(hv);
    hv.project(camera);
    var hy = rect.top + ((1 - hv.y) / 2) * rect.height;
    horizon_band.style.top = Math.round(hy - 80) + "px";
    horizon_band.style.height = "160px";
    front_band.style.top = Math.round(rect.top + rect.height * 0.76) + "px";
    front_band.style.height = Math.round(rect.height * 0.24) + "px";
  }

  // --- Labels ---
  var style = document.createElement("style");
  style.textContent =
    "@keyframes sigFault{0%,100%{opacity:1}50%{opacity:0.35}}" +
    ".sig-fault{animation:sigFault 1.2s ease-in-out infinite}" +
    "@media (prefers-reduced-motion: reduce){.sig-fault{animation:none}}";
  document.head.appendChild(style);

  var overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:2;";
  document.body.appendChild(overlay);

  var labels = [];
  for (var n = 0; n < node_count; n++) {
    var el = document.createElement("div");
    el.style.cssText =
      "position:absolute;left:0;top:0;white-space:nowrap;display:flex;align-items:center;gap:7px;" +
      "opacity:0;transition:opacity 220ms ease;will-change:transform,opacity;";
    var shape = document.createElement("span");
    shape.style.cssText = "display:inline-flex;";
    var msg = document.createElement("span");
    msg.style.cssText =
      'font:500 12px/1.2 "DM Sans", system-ui, sans-serif;color:' + label_text_color + ";";
    var metric = document.createElement("span");
    metric.style.cssText =
      'font:500 11px/1.2 "DM Mono", ui-monospace, SFMono-Regular, Menlo, monospace;letter-spacing:0.04em;color:' +
      label_metric_color + ";";
    el.appendChild(shape);
    el.appendChild(msg);
    el.appendChild(metric);
    overlay.appendChild(el);
    labels.push({
      el: el, shape: shape, msg: msg, metric: metric,
      state: "", msgText: "", metricText: "", opacity: 0, w: 0
    });
  }

  function fillLabel(label, n, state, confidence) {
    var changed = false;
    if (state !== label.state) {
      label.shape.innerHTML = shapeSVG(STATES[state].shape, STATES[state].color);
      label.shape.className = state === "FAULT" ? "sig-fault" : "";
      label.state = state;
      changed = true;
    }
    var list = SIGNALS[state];
    var msgText = list[n % list.length];
    if (msgText !== label.msgText) {
      label.msg.textContent = msgText;
      label.msgText = msgText;
      changed = true;
    }
    // Confidence % and p-score, intermixed across nodes
    var metricText = offline[n]
      ? "stale"
      : n % 2 === 0
      ? Math.round(confidence * 100) + "%"
      : "p = " + confidence.toFixed(2);
    if (metricText !== label.metricText) {
      label.metric.textContent = metricText;
      label.metricText = metricText;
      changed = true;
    }
    if (changed || !label.w) label.w = label.el.offsetWidth;
  }

  // --- Focus point ---
  var focus = { x: -9999, y: -9999 },
    last_pointer = -Infinity;

  function onPointer(e) {
    focus.x = e.clientX;
    focus.y = e.clientY;
    last_pointer = performance.now();
  }
  window.addEventListener("pointermove", onPointer);
  window.addEventListener("pointerdown", onPointer);

  function updateFocus(now, rect) {
    if (now - last_pointer > idle_ms) {
      if (reduce_motion) {
        focus.x = rect.left + rect.width * 0.68;
        focus.y = rect.top + rect.height * 0.55;
      } else {
        focus.x = rect.left + rect.width * (0.68 + Math.sin(now * 0.00017) * 0.2);
        focus.y = rect.top + rect.height * (0.55 + Math.cos(now * 0.00011) * 0.12);
      }
    }
  }

  var v = new THREE.Vector3(),
    scr = new Array(node_count);

  function updateNodes(now) {
    var rect = renderer.domElement.getBoundingClientRect();
    updateFocus(now, rect);
    field.updateMatrixWorld();

    var ranked = [];
    for (var n = 0; n < node_count; n++) {
      var gi = node_grid[n];
      var nx = gridX(gi),
        ny = gridY(gi),
        h = H[gi],
        nz = h + node_lift;
      node_positions[n * 3] = nx;
      node_positions[n * 3 + 1] = ny;
      node_positions[n * 3 + 2] = nz;

      var t = Math.max(0, Math.min(1, (h + wave_amp) / (2 * wave_amp)));
      var confidence = 0.35 + 0.6 * t;

      v.set(nx, ny, nz);
      field.localToWorld(v);
      v.project(camera);
      var visible = v.z < 1 && v.x > -1.1 && v.x < 1.1 && v.y > -1.1 && v.y < 1.1;
      var sx = rect.left + ((v.x + 1) / 2) * rect.width,
        sy = rect.top + ((1 - v.y) / 2) * rect.height;
      var d = visible ? Math.hypot(sx - focus.x, sy - focus.y) : Infinity;
      scr[n] = { sx: sx, sy: sy, d: d, confidence: confidence, t: t };
      ranked.push(n);
    }

    ranked.sort(function (a, b) { return scr[a].d - scr[b].d; });

    var placed = [],
      shown = 0;

    for (var r = 0; r < ranked.length; r++) {
      var n = ranked[r],
        s = scr[n],
        label = labels[n];
      var state = offline[n] ? "OFFLINE" : stateFor(s.confidence);
      var near = shown < max_labels && s.d < reveal_radius ? 1 - s.d / reveal_radius : 0;

      // Only show a label if it doesn't overlap one already placed
      if (near > 0) {
        fillLabel(label, n, state, s.confidence);
        var bx = s.sx + 10,
          by = s.sy - 18,
          bw = label.w,
          bh = 16;
        for (var p = 0; p < placed.length; p++) {
          var q = placed[p];
          if (
            bx < q.x + q.w + label_gap &&
            bx + bw + label_gap > q.x &&
            by < q.y + q.h + label_gap &&
            by + bh + label_gap > q.y
          ) {
            near = 0;
            break;
          }
        }
        if (near > 0) {
          placed.push({ x: bx, y: by, w: bw, h: bh });
          shown++;
          label.el.style.transform = "translate(" + Math.round(bx) + "px," + Math.round(by) + "px)";
        }
      }

      if (offline[n]) {
        node_colors[n * 3] = offline_color.r * 0.35;
        node_colors[n * 3 + 1] = offline_color.g * 0.35;
        node_colors[n * 3 + 2] = offline_color.b * 0.35;
      } else {
        var b = 0.12 + 0.88 * s.t * s.t;
        var cr = base_color.r * b,
          cg = base_color.g * b,
          cb = base_color.b * b;
        if (near > 0) {
          state_color.set(STATES[state].color);
          cr += (state_color.r - cr) * near;
          cg += (state_color.g - cg) * near;
          cb += (state_color.b - cb) * near;
        }
        node_colors[n * 3] = cr;
        node_colors[n * 3 + 1] = cg;
        node_colors[n * 3 + 2] = cb;
      }

      var target_opacity = near > 0 ? Math.min(1, 0.35 + near) : 0;
      if (target_opacity !== label.opacity) {
        label.el.style.opacity = target_opacity.toFixed(2);
        label.opacity = target_opacity;
      }
    }

    node_geometry.attributes.position.needsUpdate = true;
    node_geometry.attributes.color.needsUpdate = true;

    hero_positions[0] = gridX(hero_grid);
    hero_positions[1] = gridY(hero_grid);
    hero_positions[2] = H[hero_grid] + node_lift;
    hero_geometry.attributes.position.needsUpdate = true;
  }

  var time = 0,
    did_first_frame = false;

  function render() {
    requestAnimationFrame(render);
    var now = performance.now();
    if (!reduce_motion || !did_first_frame) {
      if (!reduce_motion) time += 0.016;
      computeHeights(time);
      updateLines(horiz);
      updateLines(vert);
      did_first_frame = true;
    }
    updateNodes(now);
    renderer.render(scene, camera);
  }

  placeBands();
  render();

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    placeBands();
  }
  window.addEventListener("resize", resize, false);
}
wavesBackground();

// --- Fonts + headline overlay (glass panel) ---
(function addHeadline() {
  var fonts = document.createElement("link");
  fonts.rel = "stylesheet";
  fonts.href =
    "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=DM+Sans:wght@400;500&family=DM+Mono:wght@500&display=swap";
  document.head.appendChild(fonts);

  var hero = document.createElement("div");
  hero.style.cssText =
    "position:fixed;left:8vw;top:26vh;z-index:3;pointer-events:none;" +
    "max-width:560px;box-sizing:border-box;padding:36px 40px;border-radius:16px;" +
    "background:linear-gradient(135deg,rgba(255,255,255,0.035),rgba(255,255,255,0.005));" +
    "backdrop-filter:blur(6px) saturate(120%);-webkit-backdrop-filter:blur(6px) saturate(120%);" +
    "border:1px solid rgba(255,255,255,0.10);" +
    "box-shadow:inset 0 1px 0 rgba(255,255,255,0.10),0 20px 50px rgba(0,0,0,0.25);";

  var h1 = document.createElement("h1");
  h1.innerHTML = "Intelligent systems<br>meet human design.";
  h1.style.cssText =
    'margin:0;font-family:"Archivo",system-ui,sans-serif;font-weight:700;' +
    "font-size:50px;line-height:1.02;letter-spacing:-0.02em;" +
    "color:#f4efe6;";

  var sub = document.createElement("p");
  sub.textContent =
    "I translate what complex systems are doing into language people can read, trust, and act on.";
  sub.style.cssText =
    'margin:20px 0 0;font-family:"DM Sans",system-ui,sans-serif;font-weight:400;' +
    "font-size:clamp(16px,1.4vw,20px);line-height:1.5;color:#c4cdd6;max-width:480px;";

  hero.appendChild(h1);
  hero.appendChild(sub);
  document.body.appendChild(hero);
})();