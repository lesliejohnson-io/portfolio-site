"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live conditions readout, after yaochangyang's "Data Viz - Air Quality Index
 * Demo" (codepen.io/yaochangyang/pen/xexZxp): city and coordinates and
 * timestamp down the left, temperature and humidity and AQI down the right,
 * on a near-black field.
 *
 * The original hardcodes a Shanghai reading. This one is Pittsburgh and the
 * numbers are real, pulled from Open-Meteo — a free, keyless, CORS-enabled
 * API, so the fetch happens in the browser with no proxy and no secret to
 * leak. The clock ticks every second; the readings refresh every ten minutes,
 * which is well inside the API's own update interval.
 *
 * Set in JetBrains Mono rather than the pen's Inconsolata, so it matches the
 * rest of the site's metadata.
 */
/*
  The pen's AQI bands. Particle spacing is 440/AQI, so worse air packs the
  field tighter — the density *is* the reading. The gradient steps with the
  same bands; the top band's red is genuine hazard signalling, which is the
  one use of red the site's colour rule allows.
*/
const BANDS: [number, string, string][] = [
  [50, "#73f3fe", "#69b5ff"],
  [100, "#69b5ff", "#477cff"],
  [150, "#477cff", "#5943de"],
  [200, "#5943de", "#a41d99"],
  [Infinity, "#a41d99", "#ec2f4b"],
];

const THICKNESS = 80 * 80;
/** Closest approach used for the force, so it can't blow up. */
const MIN_D = 18 * 18;
/*
  The pen uses DRAG = 1 — no damping at all — and survives because its field is
  a whole browser window, so a kicked particle still lands somewhere visible.
  In a 365px card the grid empties within seconds. Damping below 1 sheds the
  kick so particles actually return to their origin.
*/
const DRAG = 0.9;
/** Hard ceiling on speed, so a single close pass can't launch a particle. */
const MAX_V = 10;
const EASE = 0.15;
const COLOR = 220;

const LAT = 40.4406;
const LON = -79.9959;
const TZ = "America/New_York";

type Reading = { temp: number; humidity: number; aqi: number | null };

export default function AirQuality({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set on the client only — rendering a clock on the server would ship a
    // build-time timestamp and then mismatch on hydration.
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [w, a] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m&timezone=${encodeURIComponent(TZ)}`
          ).then((r) => r.json()),
          // Air quality is a separate service and fails independently, so a
          // missing AQI shouldn't take the temperature down with it.
          fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=us_aqi&timezone=${encodeURIComponent(TZ)}`
          )
            .then((r) => r.json())
            .catch(() => null),
        ]);
        if (cancelled) return;
        setReading({
          temp: w.current.temperature_2m,
          humidity: w.current.relative_humidity_2m,
          aqi: a?.current?.us_aqi ?? null,
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    load();
    const refresh = setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, []);

  const aqi = reading?.aqi ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || aqi === null) return;

    let raf = 0;
    let running = false;
    let w = 0;
    let h = 0;
    let cols = 0;
    let list: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[] = [];
    let tog = true;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      // 1:1 with CSS pixels on purpose — the original draws single-pixel
      // particles straight into ImageData, and scaling for DPR would blur them.
      w = canvas.width = Math.round(rect.width);
      h = canvas.height = Math.round(rect.height);
      const spacing = 440 / Math.max(aqi, 1);
      cols = Math.ceil(w / spacing);
      const rows = Math.ceil(h / spacing);
      list = [];
      for (let i = 0; i < rows * cols; i++) {
        const x = spacing * (i % cols);
        const y = spacing * Math.floor(i / cols);
        list.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
      }
    };

    const physics = () => {
      const t = Date.now() * 0.001;
      // The pen's attractor path — no mouse needed, it wanders on its own.
      const mx = w * 0.5 + Math.cos(t * 2.1) * Math.cos(t * 0.9) * w * 0.45;
      const my =
        h * 0.5 + Math.sin(t * 3.2) * Math.tan(Math.sin(t * 0.8)) * h * 0.45;

      for (const p of list) {
        const dx = mx - p.x;
        const dy = my - p.y;
        const d = dx * dx + dy * dy;
        if (d < THICKNESS && d > 0) {
          /*
            Floor the divisor. `-THICKNESS / d` goes to infinity as a particle
            passes through the attractor, and with DRAG at 1 that velocity is
            never shed — the particle leaves and never returns. The pen gets
            away with it on a full-window field; in a card the attractor covers
            everything within seconds and empties the grid.
          */
          const f = -THICKNESS / Math.max(d, MIN_D);
          const a = Math.atan2(dy, dx);
          p.vx += f * Math.cos(a);
          p.vy += f * Math.sin(a);
        }
        p.vx *= DRAG;
        p.vy *= DRAG;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > MAX_V) {
          p.vx = (p.vx / sp) * MAX_V;
          p.vy = (p.vy / sp) * MAX_V;
        }
        p.x += p.vx + (p.ox - p.x) * EASE;
        p.y += p.vy + (p.oy - p.y) * EASE;
      }
    };

    const paint = () => {
      const img = ctx.createImageData(w, h);
      const b = img.data;
      for (const p of list) {
        const x = p.x | 0;
        const y = p.y | 0;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const n = (x + y * w) * 4;
        b[n] = b[n + 1] = b[n + 2] = COLOR;
        b[n + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };

    const step = () => {
      // The pen alternates physics and paint frames; keeping that halves the
      // per-frame cost at this particle count.
      if ((tog = !tog)) physics();
      else paint();
      raf = requestAnimationFrame(step);
    };

    build();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint();
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(step);
        } else if (!e.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => { build(); paint(); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [aqi]);

  const band = BANDS.find(([max]) => (aqi ?? 0) < max) ?? BANDS[0];

  const date = now
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now)
    : "";
  const time = now
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)
    : "";

  const value = (v: number | null, suffix = "") =>
    failed ? "—" : v === null ? "—" : `${v}${suffix}`;

  return (
    <div
      style={{
        backgroundImage: aqi === null
          ? undefined
          : `linear-gradient(${band[1]}, ${band[2]})`,
      }}
      className={`relative flex flex-col justify-between overflow-hidden bg-[#111121] p-6 font-mono text-white ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[28px] font-light uppercase tracking-[0.04em] leading-none">
            Pittsburgh
          </p>
          <p className="mt-3 text-[10px] leading-relaxed text-white/60">
            Location
            <br />
            {LAT}, {LON}
          </p>
        </div>

        <dl className="space-y-3 text-right text-[10px] text-white/60">
          <div>
            <dd className="text-sm text-white">
              {reading ? value(Math.round(reading.temp), "°") : "··"}
            </dd>
            <dt>Temperature (Celsius)</dt>
          </div>
          <div>
            <dd className="text-sm text-white">
              {reading ? value(reading.humidity, "%") : "··"}
            </dd>
            <dt>Humidity</dt>
          </div>
          <div>
            <dd className="text-sm text-white">
              {reading ? value(reading.aqi) : "··"}
            </dd>
            <dt>Air Quality Index</dt>
          </div>
        </dl>
      </div>

      <p className="relative mt-6 text-[10px] leading-relaxed text-white/60">
        Current Time
        <br />
        <span className="tabular-nums text-white">
          {date} {time}
        </span>
      </p>
    </div>
  );
}
