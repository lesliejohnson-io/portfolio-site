/**
 * messageScheduler.ts
 *
 * Emission scheduler for the hero node field.
 *
 * Solves four problems with a purely random emitter:
 *   1. Lanes        — messages never stack in the same vertical band.
 *   2. Rotation     — the "needs a person" state is guaranteed early, not left to chance.
 *   3. Jitter       — regular cadence that still breathes, instead of clustering.
 *   4. Lifetimes    — automation fades out on its own; human-required holds until it exits.
 *
 * Framework-agnostic. No Three.js import. Drive it with update(dt) from your
 * render loop and map the result onto whatever geometry you already have:
 *
 *     lane     -> y position  (pick from a fixed array of bands)
 *     progress -> x position  (0 = spawn edge, 1 = exit edge)
 *     opacity  -> material opacity / CSS opacity
 *
 * All tuning lives in DEFAULT_CONFIG at the bottom. Start there.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type MessageKind = 'human' | 'auto';

export interface MessageCopy {
  text: string;
  kind: MessageKind;
}

export interface ActiveMessage {
  id: number;
  text: string;
  kind: MessageKind;
  /** Which vertical band this message occupies. Map to a y position. */
  lane: number;
  /** Seconds since spawn. */
  age: number;
  /** Total seconds this message will live. */
  lifetime: number;
  /** 0 at the spawn edge, 1 at the exit edge. Map to an x position. */
  progress: number;
  /** 0..1, already shaped by the fade curve for this kind. */
  opacity: number;
  /**
   * Per-instance vertical nudge, -1..1. Multiply by a fraction of your lane
   * spacing so messages sit near their band rather than exactly on it.
   * Without this, five fixed lanes at one speed read as rails.
   */
  laneOffset: number;
}

export interface SchedulerConfig {
  /** Seconds between emissions, before jitter. */
  baseInterval: number;
  /** Fractional jitter on the interval. 0.15 = +/- 15%. */
  jitter: number;
  /**
   * The state cycle, walked in order and looped. This is what guarantees a
   * full-white message lands early instead of waiting on a coin flip.
   */
  rotation: MessageKind[];
  /** Number of vertical bands. */
  lanes: number;
  /** Seconds a lane stays blocked after a message spawns in it. */
  laneCooldown: number;
  /** Seconds to cross the field, per kind. */
  travelTime: Record<MessageKind, number>;
  /**
   * Variation applied to each message individually, so they don't move in
   * lockstep. Separate from `jitter`, which only affects emission spacing.
   */
  instanceJitter: {
    /** Fractional variation on travel time. 0.12 = +/- 12%. */
    travel: number;
    /** Max vertical nudge off the lane centre, as -1..1 in `laneOffset`. */
    laneOffset: number;
  };
  /** Fade shape, per kind. */
  fade: Record<
    MessageKind,
    {
      /** Seconds to reach peak opacity. */
      in: number;
      /** Fraction of lifetime at which the fade-out begins. */
      holdUntil: number;
      /** Peak opacity. */
      peak: number;
    }
  >;
  /** Hard cap on simultaneous messages. */
  maxActive: number;
  /** Don't repeat a string until this many others have gone by. */
  noRepeatWindow: number;
  /** Time multiplier while the user is hovering. <1 slows the field. */
  hoverTimeScale: number;
  /** Optional seed. Same seed = same first few seconds on every load. */
  seed?: number;
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

/**
 * Plain language, both states.
 *
 * Rule: a 'human' message says what a person has to decide, in words.
 * No bare probabilities — "p = 0.69" is the machine-speak your positioning
 * says you translate away. A number appears only where the number is the point.
 */
export const DEFAULT_MESSAGES: MessageCopy[] = [
  // needs a person — full white, holds
  { kind: 'human', text: 'Out of contact for 30 minutes. Needs a person.' },
  { kind: 'human', text: 'Path blocked and no safe reroute. Operator decides.' },
  { kind: 'human', text: 'Two readings disagree. Someone should look.' },
  { kind: 'human', text: 'This falls outside what I can verify.' },
  { kind: 'human', text: 'Confidence dropped below the line you set.' },
  { kind: 'human', text: 'I can hold here, but not for another shift.' },

  // automation handling it — dim, clears on its own
  { kind: 'auto', text: 'Rerouting around debris.' },
  { kind: 'auto', text: 'Connection came back. Retrying the upload.' },
  { kind: 'auto', text: 'Reordered the queue by urgency.' },
  { kind: 'auto', text: 'Flagged for review at end of shift.' },
  { kind: 'auto', text: 'Handed off to the next unit.' },
  { kind: 'auto', text: 'Logged it and moved on.' },
  { kind: 'auto', text: 'Battery at reserve. Returning to base.' },
];

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

export const DEFAULT_CONFIG: SchedulerConfig = {
  baseInterval: 2.8,
  jitter: 0.15,

  // auto, auto, human, auto, human
  // First human-required message lands at roughly 8s, second at ~14s.
  // Shorten to ['auto','human','auto','auto','human'] if the hero is
  // getting less attention than that.
  rotation: ['auto', 'auto', 'human', 'auto', 'human'],

  lanes: 5,
  laneCooldown: 4.5,

  travelTime: {
    human: 11, // lingers — it is waiting on someone
    auto: 7,
  },

  instanceJitter: {
    travel: 0.12,
    laneOffset: 0.35,
  },

  fade: {
    human: { in: 0.5, holdUntil: 0.92, peak: 1.0 },
    auto: { in: 0.8, holdUntil: 0.3, peak: 0.45 },
  },

  maxActive: 4,
  noRepeatWindow: 5,
  hoverTimeScale: 0.25,
};

/* ------------------------------------------------------------------ */
/* Implementation                                                      */
/* ------------------------------------------------------------------ */

/** Small seeded PRNG so a given seed replays the same opening sequence. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeOpacity(m: ActiveMessage, cfg: SchedulerConfig): number {
  const f = cfg.fade[m.kind];
  const holdEnd = m.lifetime * f.holdUntil;

  if (m.age < f.in) {
    return f.peak * (m.age / f.in);
  }
  if (m.age < holdEnd) {
    return f.peak;
  }
  const outDuration = Math.max(0.0001, m.lifetime - holdEnd);
  const t = (m.age - holdEnd) / outDuration;
  return f.peak * Math.max(0, 1 - t);
}

export function createMessageScheduler(
  userConfig: Partial<SchedulerConfig> = {},
  messages: MessageCopy[] = DEFAULT_MESSAGES
) {
  const cfg: SchedulerConfig = { ...DEFAULT_CONFIG, ...userConfig };
  const rand =
    cfg.seed !== undefined ? mulberry32(cfg.seed) : Math.random;

  const byKind: Record<MessageKind, MessageCopy[]> = {
    human: messages.filter((m) => m.kind === 'human'),
    auto: messages.filter((m) => m.kind === 'auto'),
  };

  if (!byKind.human.length || !byKind.auto.length) {
    throw new Error(
      'messageScheduler: need at least one message of each kind.'
    );
  }

  let active: ActiveMessage[] = [];
  let recentTexts: string[] = [];
  let laneFreeAt: number[] = new Array(cfg.lanes).fill(0);
  let lanePointer = 0;
  let rotationIndex = 0;
  let nextId = 1;
  let clock = 0;
  let nextEmitAt = 0;
  let hovered = false;

  function nextInterval(): number {
    const spread = cfg.baseInterval * cfg.jitter;
    return cfg.baseInterval - spread + rand() * spread * 2;
  }

  /** Round-robin, skipping lanes still cooling down. Returns -1 if none free. */
  function claimLane(): number {
    for (let i = 0; i < cfg.lanes; i++) {
      const lane = (lanePointer + i) % cfg.lanes;
      if (laneFreeAt[lane] <= clock) {
        lanePointer = (lane + 1) % cfg.lanes;
        laneFreeAt[lane] = clock + cfg.laneCooldown;
        return lane;
      }
    }
    return -1;
  }

  function pickCopy(kind: MessageKind): MessageCopy {
    const pool = byKind[kind];
    const eligible = pool.filter((m) => !recentTexts.includes(m.text));
    const source = eligible.length ? eligible : pool;
    return source[Math.floor(rand() * source.length)];
  }

  function emit(): void {
    const kind = cfg.rotation[rotationIndex % cfg.rotation.length];
    const lane = claimLane();

    // No free lane. Hold the rotation where it is and try again shortly,
    // rather than stacking two messages in one band.
    if (lane === -1) {
      nextEmitAt = clock + 0.4;
      return;
    }

    const copy = pickCopy(kind);
    rotationIndex++;

    recentTexts.push(copy.text);
    if (recentTexts.length > cfg.noRepeatWindow) recentTexts.shift();

    // Per-instance variation. The fade curve is driven by age/lifetime, so
    // varying lifetime varies speed and fade timing together — they stay
    // in step rather than drifting apart.
    const ij = cfg.instanceJitter;
    const speedVariance = 1 - ij.travel + rand() * ij.travel * 2;

    active.push({
      id: nextId++,
      text: copy.text,
      kind,
      lane,
      age: 0,
      lifetime: cfg.travelTime[kind] * speedVariance,
      progress: 0,
      opacity: 0,
      laneOffset: (rand() * 2 - 1) * ij.laneOffset,
    });

    nextEmitAt = clock + nextInterval();
  }

  return {
    /** Call once per frame with seconds elapsed. */
    update(dt: number): ActiveMessage[] {
      const scaled = dt * (hovered ? cfg.hoverTimeScale : 1);
      clock += scaled;

      for (const m of active) {
        m.age += scaled;
        m.progress = Math.min(1, m.age / m.lifetime);
        m.opacity = computeOpacity(m, cfg);
      }
      active = active.filter((m) => m.age < m.lifetime);

      if (clock >= nextEmitAt && active.length < cfg.maxActive) {
        emit();
      }
      return active;
    },

    /**
     * Hover slows the field so a message can be read. It does NOT spawn
     * messages — people don't hover over empty space, and if hover is the
     * only trigger most visitors never see the mechanic at all.
     */
    setHovered(value: boolean): void {
      hovered = value;
    },

    /** Currently live messages. Same array update() returns. */
    get active(): ActiveMessage[] {
      return active;
    },

    reset(): void {
      active = [];
      recentTexts = [];
      laneFreeAt = new Array(cfg.lanes).fill(0);
      lanePointer = 0;
      rotationIndex = 0;
      clock = 0;
      nextEmitAt = 0;
    },

    config: cfg,
  };
}

export type MessageScheduler = ReturnType<typeof createMessageScheduler>;
