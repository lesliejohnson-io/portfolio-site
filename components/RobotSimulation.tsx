"use client";

import { useEffect, useRef } from "react";

/**
 * Small drones on a grid, after masahito's "robot simulation"
 * (codepen.io/Ma5a/pen/LYQoLNR): "movements and behaviour based on simple
 * rules … robots move about the page, and tries to destroy and gain energy
 * from weaker robots or robots that have stopped for charging. When there are
 * no threats nearby, robots will charge, and when it meets certain conditions,
 * multiplies. When it gains too much energy, robots can sometimes explode."
 *
 * The rules are his and are reproduced here; the drawing is not — his robots
 * are original pixel-art sprite sheets, so those are left where they belong
 * and these use Leslie's own drone art instead. The badge links to the pen.
 *
 * Decisions on the grid: the simulation still *thinks* in discrete 220ms
 * steps, exactly as the original does, but rendering interpolates between the
 * cell it left and the cell it is heading to, so the drones drift rather than
 * teleport. A wrap across an edge sets `snap`, which skips interpolation for
 * that step — otherwise a drone would fly the whole width of the canvas.
 *
 * Decorative and hidden from assistive tech. Pauses off-screen, and renders
 * one settled frame under prefers-reduced-motion.
 */
const CELL = 32;
const TICK = 220;
const START = 10;
const MAX_BOTS = 34;
/*
  Dead band. A drone only hunts something clearly weaker and only flees
  something clearly stronger; between those it does neither. Without the gap,
  two drones of near-equal energy swap hunter and prey every tick as decay and
  charging cross their totals, and oscillate on the spot.
*/
const MARGIN = 1.3;
/** Ticks a hunt is committed for, so a target isn't re-picked every step. */
const COMMIT = 10;

const GROUND = "#14161a";
const GRID = "#1e2128";
const IDLE = "#c9ccd2";
const CHARGING = "#00bfa6";
const HUNTING = "#e8a33d";

type State = "walk" | "charge" | "hunt" | "boom";
type Bot = {
  id: number;
  huntId: number | null;
  commit: number;
  x: number; y: number;
  fromX: number; fromY: number;
  snap: boolean;
  energy: number;
  state: State;
  boom: number;
};

export default function RobotSimulation({
  className = "",
}: {
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const counts = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0, height = 0, cols = 0, rows = 0;
    let bots: Bot[] = [];
    let sprites: Record<string, HTMLCanvasElement> | null = null;
    let spriteW = 0, spriteH = 0;

    let nextId = 1;

    const spawn = (): Bot => {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      return {
        id: nextId++, huntId: null, commit: 0,
        x, y, fromX: x, fromY: y, snap: true,
        energy: 25 + Math.random() * 25,
        state: "walk",
        boom: 0,
      };
    };

    /*
      The art is white on transparent, so each state colour is baked into its
      own offscreen canvas once with `source-in`. Tinting per frame would mean
      a composite operation per drone, every frame.
    */
    const makeSprites = (img: HTMLImageElement) => {
      spriteW = CELL - 4;
      spriteH = Math.round(spriteW * (img.naturalHeight / img.naturalWidth));
      const out: Record<string, HTMLCanvasElement> = {};
      for (const [key, colour] of Object.entries({
        idle: IDLE, charge: CHARGING, hunt: HUNTING,
      })) {
        const c = document.createElement("canvas");
        c.width = spriteW;
        c.height = spriteH;
        const cc = c.getContext("2d")!;
        cc.drawImage(img, 0, 0, spriteW, spriteH);
        cc.globalCompositeOperation = "source-in";
        cc.fillStyle = colour;
        cc.fillRect(0, 0, spriteW, spriteH);
        out[key] = c;
      }
      sprites = out;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      cols = Math.max(4, Math.floor(width / CELL));
      rows = Math.max(4, Math.floor(height / CELL));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bots = Array.from({ length: START }, spawn);
    };

    const step = () => {
      const next: Bot[] = [];
      const alive = new Map(bots.map((b) => [b.id, b]));

      for (const b of bots) {
        if (b.state === "boom") {
          b.boom++;
          if (b.boom < 3) next.push(b);
          continue;
        }

        b.fromX = b.x;
        b.fromY = b.y;
        b.snap = false;

        // Stay on a committed target while it lives, rather than re-picking.
        let target: Bot | null = null;
        if (b.huntId !== null && b.commit > 0) {
          const held = alive.get(b.huntId);
          if (held && held.state !== "boom") target = held;
          else { b.huntId = null; b.commit = 0; }
        }

        let best = target
          ? Math.abs(target.x - b.x) + Math.abs(target.y - b.y)
          : Infinity;

        if (!target) {
          for (const o of bots) {
            if (o === b || o.state === "boom") continue;
            const d = Math.abs(o.x - b.x) + Math.abs(o.y - b.y);
            if (d < best) { best = d; target = o; }
          }
        }

        const weaker = target && b.energy > target.energy * MARGIN;
        const stronger = target && target.energy > b.energy * MARGIN;
        // A drone stopped to charge is prey even without the full margin.
        const sitting = target && target.state === "charge" && b.energy > target.energy;

        if (target && best <= 6 && (weaker || sitting)) {
          b.state = "hunt";
          if (b.huntId !== target.id) { b.huntId = target.id; b.commit = COMMIT; }
          else b.commit--;

          if (best <= 1) {
            b.energy += target.energy * 0.5;
            target.energy = 0;
            target.state = "boom";
            target.boom = 0;
            b.huntId = null;
            b.commit = 0;
          } else {
            b.x += Math.sign(target.x - b.x);
            b.y += Math.sign(target.y - b.y);
          }
        } else if (target && best <= 3 && stronger) {
          b.state = "walk";
          b.huntId = null;
          b.commit = 0;
          b.x -= Math.sign(target.x - b.x);
          b.y -= Math.sign(target.y - b.y);
        } else if (Math.random() < 0.55) {
          b.state = "charge";
          b.huntId = null;
          b.commit = 0;
          b.energy += 4;
        } else {
          b.state = "walk";
          b.huntId = null;
          b.commit = 0;
          b.x += Math.round(Math.random() * 2 - 1);
          b.y += Math.round(Math.random() * 2 - 1);
        }

        const wrappedX = b.x < 0 || b.x >= cols;
        const wrappedY = b.y < 0 || b.y >= rows;
        if (wrappedX || wrappedY) b.snap = true;
        b.x = (b.x + cols) % cols;
        b.y = (b.y + rows) % rows;

        b.energy = Math.max(0, b.energy - 0.6);

        if (b.energy > 100) {
          if (bots.length + next.length < MAX_BOTS && Math.random() < 0.7) {
            b.energy /= 2;
            const cx = (b.x + 1) % cols;
            next.push({
              ...b, id: nextId++, huntId: null, commit: 0,
              x: cx, fromX: cx, fromY: b.y, snap: true, state: "walk",
            });
          } else {
            b.state = "boom";
            b.boom = 0;
          }
        }

        if (b.energy <= 0) { b.state = "boom"; b.boom = 0; }
        next.push(b);
      }

      bots = next.filter((b) => !(b.state === "boom" && b.boom >= 3));
      while (bots.length < 4) bots.push(spawn());
    };

    /** `t` is progress through the current tick, 0–1. */
    const render = (t: number) => {
      ctx.fillStyle = GROUND;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = GRID;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        ctx.moveTo(c * CELL + 0.5, 0);
        ctx.lineTo(c * CELL + 0.5, rows * CELL);
      }
      for (let r = 0; r <= rows; r++) {
        ctx.moveTo(0, r * CELL + 0.5);
        ctx.lineTo(cols * CELL, r * CELL + 0.5);
      }
      ctx.stroke();

      // Ease so a drone settles into its cell rather than arriving at speed.
      const e = t * t * (3 - 2 * t);
      const tally: Record<string, number> = { idle: 0, charge: 0, hunt: 0 };

      for (const b of bots) {
        const gx = b.snap ? b.x : b.fromX + (b.x - b.fromX) * e;
        const gy = b.snap ? b.y : b.fromY + (b.y - b.fromY) * e;
        const px = gx * CELL;
        const py = gy * CELL;

        if (b.state === "boom") {
          ctx.globalAlpha = 1 - b.boom / 3;
          ctx.fillStyle = IDLE;
          const g = b.boom * 3;
          ctx.fillRect(px + 2 - g, py + 2 - g, CELL - 4 + g * 2, CELL - 4 + g * 2);
          ctx.globalAlpha = 1;
          continue;
        }

        const key =
          b.state === "charge" ? "charge" : b.state === "hunt" ? "hunt" : "idle";
        tally[key]++;
        const sprite = sprites?.[key];
        if (sprite) {
          ctx.drawImage(sprite, px + 2, py + (CELL - spriteH) / 2);
        } else {
          ctx.fillStyle =
            b.state === "charge" ? CHARGING : b.state === "hunt" ? HUNTING : IDLE;
          ctx.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
        }
      }

      for (const k of ["idle", "charge", "hunt"] as const) {
        const el = counts.current[k];
        const v = String(tally[k]);
        if (el && el.textContent !== v) el.textContent = v;
      }
    };

    resize();

    const art = new Image();
    art.src = "/resources/drone.png";
    art.decode().then(() => { makeSprites(art); render(1); }).catch(() => {});

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      for (let i = 0; i < 40; i++) step();
      render(1);
      const ro = new ResizeObserver(() => {
        resize();
        for (let i = 0; i < 40; i++) step();
        render(1);
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    let raf = 0;
    let running = false;
    let acc = 0;
    let last = 0;

    const frame = (now: number) => {
      if (!last) last = now;
      // Clamp, so returning to a backgrounded tab doesn't fast-forward.
      acc += Math.min(now - last, TICK * 3);
      last = now;
      while (acc >= TICK) { step(); acc -= TICK; }
      render(acc / TICK);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(canvas);
    const ro = new ResizeObserver(() => { resize(); render(1); });
    ro.observe(canvas);

    return () => { stop(); io.disconnect(); ro.disconnect(); };
  }, []);

  const legend = [
    { key: "charge", label: "Charging", colour: CHARGING },
    { key: "hunt", label: "Hunting", colour: HUNTING },
    { key: "idle", label: "Drifting", colour: IDLE },
  ];

  return (
    /*
      Decorative as a whole — the canvas conveys nothing to assistive tech, so
      a legend naming its colours would be noise there too.
    */
    <div aria-hidden="true" className={`relative ${className}`}>
      <canvas ref={ref} className="block h-full w-full" />

      <ul className="absolute bottom-3 left-3 flex flex-col gap-1">
        {legend.map((row) => (
          <li
            key={row.key}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-white/55"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: row.colour }}
            />
            {row.label}
            <span
              ref={(el) => {
                counts.current[row.key] = el;
              }}
              className="tabular-nums text-white/75"
            >
              0
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
