"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MachineStatePanel.module.css";

/**
 * UNIT-01: the live panel from the Machine State UI library, rebuilt here as
 * a work row visual.
 *
 * Ported from Leslie's own source at github.com/lesliejohnson-io/machine-ui
 * (src/states.js, src/sim/useMachineSim.js, src/components/StatusIndicator.jsx
 * and the hero-machine block in src/App.jsx). The state model, the five
 * shapes, the escalation rules and the simulation's thresholds are hers,
 * unchanged. What differs is noted at each divergence below.
 *
 * It is a copy, so it can drift from the library. The state names, colours
 * and shapes are the library's public vocabulary and should be changed here
 * only by re-porting from that repo.
 */

/* The state model — single source of truth in the library, transcribed. */
type StateKey = "OPERATIONAL" | "WARNING" | "DEGRADED" | "FAULT" | "OFFLINE";

type StateDef = {
  label: string;
  shape: "circle" | "triangle" | "diamond" | "square" | "slash";
};

const STATES: Record<StateKey, StateDef> = {
  OPERATIONAL: { label: "Operational", shape: "circle" },
  WARNING: { label: "Warning", shape: "triangle" },
  DEGRADED: { label: "Degraded", shape: "diamond" },
  FAULT: { label: "Fault", shape: "square" },
  OFFLINE: { label: "Offline", shape: "slash" },
};

const TICK_MS = 1200;

type Reading = {
  state: StateKey;
  temperature: number;
  throughput: number;
  battery: number;
  staleness: number;
};

/*
  The seed reading. Deterministic on purpose: the server renders this exact
  panel, so the first client paint matches it and React logs no hydration
  mismatch. It is also what the panel shows for good under reduced motion.
*/
const SEED: Reading = {
  state: "OPERATIONAL",
  temperature: 42,
  throughput: 96,
  battery: 88,
  staleness: 0,
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const irand = (a: number, b: number) => Math.floor(rand(a, b + 1));
const chance = (p: number) => Math.random() < p;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

type Sim = {
  state: StateKey;
  stateAge: number;
  temp: number;
  tput: number;
  batt: number;
  dropout: number;
};

function transition(m: Sim, next: StateKey) {
  if (m.state !== next) {
    m.state = next;
    m.stateAge = 0;
  }
}

/** One tick of the library's simulator, thresholds and odds unchanged. */
function step(m: Sim): Reading {
  m.stateAge += 1;

  m.temp = clamp(m.temp + rand(-0.8, 1.1), 20, 95);
  m.tput = clamp(m.tput + rand(-3, 3), 0, 100);
  m.batt = clamp(m.batt - rand(0, 0.4), 0, 100);

  if (m.dropout > 0) {
    m.dropout -= 1;
    m.state = "OFFLINE";
    if (m.dropout === 0) m.state = "OPERATIONAL";
  } else if (chance(0.02)) {
    m.dropout = irand(3, 6); // lose telemetry for a few ticks
  } else {
    if (m.state === "FAULT") {
      if (m.stateAge > 6 && chance(0.35)) transition(m, "OPERATIONAL");
    } else if (m.temp > 78 || m.tput < 35) {
      transition(m, chance(0.25) ? "FAULT" : "DEGRADED");
    } else if (m.temp > 68 || m.tput < 60 || m.batt < 20) {
      transition(m, "WARNING");
    } else if (m.state !== "OPERATIONAL" && m.stateAge > 4) {
      transition(m, "OPERATIONAL");
    }
    if (m.state === "OPERATIONAL" && chance(0.015)) transition(m, "FAULT");
  }

  return {
    state: m.state,
    temperature: round1(m.temp),
    throughput: Math.round(m.tput),
    battery: Math.round(m.batt),
    staleness: m.dropout > 0 ? (irand(3, 6) - m.dropout + 1) * TICK_MS : 0,
  };
}

/**
 * The library's docs run the simulation from mount and never stop, which is
 * right for a page whose whole subject is the machine. On a portfolio home
 * page it would tick forever in a row the reader has scrolled past, so this
 * copy runs only while the panel is actually on screen, and not at all under
 * prefers-reduced-motion — a value changing every 1.2 seconds is motion.
 */
function useMachineSim(enabled: boolean) {
  const [reading, setReading] = useState<Reading>(SEED);
  const sim = useRef<Sim>({
    state: SEED.state,
    stateAge: 0,
    temp: SEED.temperature,
    tput: SEED.throughput,
    batt: SEED.battery,
    dropout: 0,
  });

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setReading(step(sim.current)), TICK_MS);
    return () => clearInterval(id);
  }, [enabled]);

  return reading;
}

/** Unique glyph per state — the library's colourblind-safety layer. */
function Shape({ shape }: { shape: StateDef["shape"] }) {
  const props = {
    width: "1em",
    height: "1em",
    viewBox: "0 0 20 20",
    "aria-hidden": true,
  } as const;

  switch (shape) {
    case "circle":
      return (
        <svg {...props}>
          <circle cx="10" cy="10" r="7" fill="var(--c)" />
        </svg>
      );
    case "triangle":
      return (
        <svg {...props}>
          <path d="M10 3 L18 17 L2 17 Z" fill="var(--c)" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...props}>
          <path d="M10 2 L18 10 L10 18 L2 10 Z" fill="var(--c)" />
        </svg>
      );
    case "square":
      return (
        <svg {...props}>
          <rect x="3.5" y="3.5" width="13" height="13" fill="var(--c)" />
        </svg>
      );
    case "slash":
      return (
        <svg {...props}>
          <circle
            cx="10"
            cy="10"
            r="6.5"
            fill="none"
            stroke="var(--c)"
            strokeWidth="2.4"
          />
          <line
            x1="5.4"
            y1="14.6"
            x2="14.6"
            y2="5.4"
            stroke="var(--c)"
            strokeWidth="2.4"
          />
        </svg>
      );
  }
}

function Vital({
  label,
  value,
  dim = false,
}: {
  label: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <div className={`${styles.vital} ${dim ? styles.vitalDim : ""}`}>
      <span className={styles.vitalLabel}>{label}</span>
      <span className={styles.vitalValue}>{value}</span>
    </div>
  );
}

export default function MachineStatePanel() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  /*
    Motion is read after mount, not during render, for the same reason as
    WorkRowVisual: the server has no media queries, and the first client
    paint has to match the HTML it hydrates.
  */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const live = useMachineSim(running);
  const state = STATES[live.state];

  return (
    <div
      ref={frameRef}
      className={styles.frame}
      /*
        One static description instead of the library's aria-live region. In
        the docs, announcing each new reading is the point; in a card on a
        portfolio page it would interrupt a screen reader every 1.2 seconds
        with telemetry nobody asked to follow. The panel is described once,
        and its churning internals are hidden.
      */
      role="img"
      aria-label="A wall-mounted industrial control panel, its screen running UNIT-01, a simulated machine: a large state badge with its own shape and colour, above temperature, throughput, battery and link readings that drift, fault and drop offline."
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/work/machine-ui/industrial-panel.png"
        alt=""
        className={styles.enclosure}
        aria-hidden="true"
      />

      <div className={styles.screen} aria-hidden="true">
        <div className={styles.panel}>
            <div className={styles.id}>
              <span className={styles.name}>UNIT-01</span>
              <span className={styles.meta}>simulated · tick 1.2s</span>
            </div>

            <span
              className={`${styles.badge} ${
                live.state === "FAULT" ? styles.pulse : ""
              }`}
              data-state={live.state}
            >
              <Shape shape={state.shape} />
              <span className={styles.badgeLabel}>{state.label}</span>
            </span>

            <div className={styles.vitals}>
              <Vital label="TEMP" value={`${live.temperature}°C`} />
              <Vital label="THROUGHPUT" value={`${live.throughput}%`} />
              <Vital label="BATTERY" value={`${live.battery}%`} />
              <Vital
                label="LINK"
                value={
                  live.staleness > 0
                    ? `stale ${(live.staleness / 1000).toFixed(1)}s`
                    : "live"
                }
                dim={live.staleness > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
