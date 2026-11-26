# Hero message scheduler — wiring notes

## What it does

Replaces random emission with a deterministic cycle. Verified over a 30-second
simulation (seed 7):

```
spawns in 30s:      11
lane collisions:     0
first human message: 5.4s

  0.00s  lane 0  auto    Rerouting around debris.
  2.43s  lane 1  auto    Battery at reserve. Returning to base.
  5.42s  lane 2  human   This falls outside what I can verify.
  8.15s  lane 3  auto    Flagged for review at end of shift.
 10.73s  lane 4  human   Two readings disagree. Someone should look.
```

At 5.4s the white message appears while two dim ones are still alive — so the
contrast between the states is on screen together, which is the whole point.
Without that overlap the mechanic doesn't read.

## Wiring

```tsx
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { createMessageScheduler, type ActiveMessage } from './messageScheduler';

// Vertical bands, in world units. Keep them clear of the headline column.
const LANE_Y = [2.1, 1.1, 0.0, -1.1, -2.1];
// How far a message may sit off its lane centre. Keep it under half the
// lane gap or the bands stop being bands.
const LANE_NUDGE = 0.4;

// Spawn left of the viewport, exit right.
const X_START = -14;
const X_END = 16;

export function MessageField() {
  const scheduler = useRef(createMessageScheduler());
  const [, force] = useReducer((n) => n + 1, 0);

  useFrame((_, dt) => {
    scheduler.current.update(dt);
    force();
  });

  return (
    <group
      onPointerOver={() => scheduler.current.setHovered(true)}
      onPointerOut={() => scheduler.current.setHovered(false)}
    >
      {scheduler.current.active.map((m) => (
        <MessageLabel
          key={m.id}
          text={m.text}
          x={X_START + (X_END - X_START) * m.progress}
          y={LANE_Y[m.lane] + m.laneOffset * LANE_NUDGE}
          opacity={m.opacity}
          kind={m.kind}
        />
      ))}
    </group>
  );
}
```

`MessageLabel` is whatever you already use — a `<Text>` from drei, an
`<Html>` overlay, or a sprite. The scheduler doesn't care.

If your messages are attached to existing nodes rather than free-floating,
ignore `progress` and instead assign each new message to the nearest
unclaimed node in `LANE_Y[m.lane]`'s band, then let the node carry it.

## Tuning order

Change these first, in this order:

1. **`rotation`** — currently `['auto','auto','human','auto','human']`.
   If the hero gets less than 8 seconds of attention, move the first human
   earlier: `['auto','human','auto','auto','human']`.
2. **`baseInterval`** (2.8s) — raise it if the field feels busy, lower it
   if it feels empty. Jitter scales with it automatically.
3. **`fade.auto.peak`** (0.45) — this is the contrast dial. If the two
   states aren't reading as different, widen the gap here before touching
   anything else.
4. **`travelTime.human`** (11s) — how long the unresolved one lingers.
   It should feel slightly too long. That's the message.
5. **`instanceJitter.travel`** (0.12) — per-message speed variation. Raise it
   if the field still looks like a conveyor belt; drop it toward 0 if the
   staggering reads as sloppy rather than organic.
6. **`lanes` / `laneCooldown`** — only if you change the hero's height.

## Two kinds of jitter

`jitter` (0.15) varies the gap *between* emissions. `instanceJitter` varies
each message individually — travel time by ±12%, and a small vertical nudge
off the lane centre via `laneOffset`. Without the second one, every message
of a given kind crosses at identical speed on a perfectly straight line, and
five fixed lanes read as rails.

Speed variation works by varying `lifetime`, and the fade curve is driven by
`age / lifetime` — so a slower message also fades more slowly. They stay in
step instead of drifting apart.

Sampled from the same 30s run:

```
   t    lane  offset  life   kind
     0s   0     0.33   6.26  auto
  2.98s   1    -0.02   6.84  auto
  5.57s   2    -0.17  11.61  human
  8.08s   3    -0.21   7.03  auto
 10.78s   4    -0.14  11.09  human

auto lifetimes spread: 6.19 → 7.78 (base 7)
```

## Reproducible opening

Pass a seed to replay the same first few seconds on every load:

```ts
createMessageScheduler({ seed: 7 });
```

Useful while tuning, and worth keeping in production if you want the opening
sequence to be a designed thing rather than a different accident each visit.

## Hover

`setHovered(true)` slows the field to 25% so a message can actually be read.
It deliberately does **not** spawn messages. People don't hover over empty
space — if hover is the trigger, most visitors never see the mechanic.

## The legend

Replacing the logo row. Sits in the space below the CTAs, small and quiet —
it should read as a caption, not a component.

```html
<dl class="hero-legend">
  <div>
    <dt><span class="dot dot--human" aria-hidden="true"></span>needs a person</dt>
    <dd>holds until someone acts</dd>
  </div>
  <div>
    <dt><span class="dot dot--auto" aria-hidden="true"></span>automation handling it</dt>
    <dd>clears on its own</dd>
  </div>
</dl>
```

```css
.hero-legend {
  display: flex;
  gap: 2.5rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgb(255 255 255 / 0.55);
}
.hero-legend dt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(255 255 255 / 0.85);
}
.hero-legend dd {
  margin: 0 0 0 1.25rem;
  color: rgb(255 255 255 / 0.45);
}
.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex: none;
}
.dot--human { background: rgb(255 255 255 / 0.95); }
.dot--auto  { background: rgb(255 255 255 / 0.35); }
```

Keep the dot opacities in step with `fade.*.peak` in the config — if the
legend's dim dot doesn't match the dim messages, the legend stops teaching
anything.

## A copy note

The message pool in `DEFAULT_MESSAGES` drops the `p = 0.69` notation.
A bare probability is the machine-speak your positioning says you translate
away, so the human-required lines say what a person has to decide, in words.
A number appears only where the number is the point. Swap in your own, but
keep that rule — it's the difference between the hero demonstrating the
thesis and just decorating it.
