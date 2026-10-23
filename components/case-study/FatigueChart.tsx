"use client";

import { useEffect, useRef, useState } from "react";
import { useChartWidth } from "./useChartWidth";

/**
 * Answer time per question against the participant's own pace band, drawn as
 * a card from the same family as the journey and service maps earlier in the
 * page: slate panel, teal ramp, sans labels. It was previously styled as an
 * instrument readout, which read as machinery beside artwork that is warm.
 *
 * Bars, not a line: each question is a discrete event the tablet timed, and a
 * bar reads as "this one took longer" where a line implies a continuous
 * quantity drifting between readings.
 *
 * One data series, so there is no legend of competing colours to decode: the
 * bars are the accent, and the other marks are different shapes — a triangle
 * for the check-in, a tick for a replay — rather than different hues. The key
 * below names every mark, so nothing rests on telling two colours apart.
 *
 * Thresholds mirror the tablet's own rules: baseline is the median of the
 * first five answers, "slow" is twice that, and the check-in fires after
 * three slow answers in a row.
 */
export type SessionPoint = {
  question: number;
  seconds: number;
  replayed?: boolean;
  checkIn?: boolean;
};

/*
  Sample data for illustration, not study data — hence the caption, which
  should stay whatever else changes here. Transcribed from the demo session
  export; replace with a real session from the Vercel demo.
*/
const SECONDS = [
  3.2, 4.7, 2.8, 6.3, 3.2, 4.3, 4.8, 4.8, 5.3, 6.4, 5.7, 8.7, 8.7, 9.8, 11.5,
  14.0, 5.8, 4.9, 5.4, 4.4, 5.7, 4.9, 4.1, 4.2,
];

export const SAMPLE_SESSION: SessionPoint[] = SECONDS.map((seconds, i) => ({
  question: i + 1,
  seconds,
  replayed: i + 1 === 13 || i + 1 === 16,
  checkIn: i + 1 === 16,
}));

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

type Props = {
  session?: SessionPoint[];
  baselineQuestions?: number;
  slowFactor?: number;
  caption?: string;
};

export default function FatigueChart({
  session = SAMPLE_SESSION,
  baselineQuestions = 5,
  slowFactor = 2,
  caption = "Demo session · sample data",
}: Props) {
  const { ref, width } = useChartWidth();

  /*
    Progressive enhancement, as elsewhere on the page: the bars are drawn at
    full height on the server and only animate once this component has
    mounted and motion is allowed. With JavaScript off, or under
    prefers-reduced-motion, the chart is simply there.
  */
  const figureRef = useRef<HTMLElement>(null);
  const [animate, setAnimate] = useState(false);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setAnimate(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setGrown(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const height = 260;
  const pad = { top: 14, right: 14, bottom: 46, left: 34 };
  const plotW = Math.max(160, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;

  const baseline = median(
    session.slice(0, baselineQuestions).map((p) => p.seconds)
  );
  const bandTop = baseline * slowFactor;
  const max = Math.max(...session.map((p) => p.seconds), bandTop);
  const yMax = Math.ceil(max / 5) * 5;

  const y = (seconds: number) => pad.top + plotH - (seconds / yMax) * plotH;
  const slot = plotW / session.length;
  /*
    Columns with a soft top, matching the bars in the maps, rather than the
    narrow crisp ticks this used to draw. 11px, except where the slot itself
    is narrower on a phone — there the bars would touch, so they give up 3px
    to keep the gaps.
  */
  const barW = Math.min(11, slot - 3);
  /* Capped at half the width so a very short bar never reads as a lozenge. */
  const barR = Math.min(3, barW / 2);
  const x = (i: number) => pad.left + slot * i + (slot - barW) / 2;

  const yTicks = Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5);
  /* On a narrow column every question number would collide, so thin them. */
  const labelEvery = slot < 16 ? 4 : slot < 24 ? 2 : 1;

  const average = round1(
    session.reduce((sum, p) => sum + p.seconds, 0) / session.length
  );
  const slowest = session.reduce((a, b) => (b.seconds > a.seconds ? b : a));
  const flags = session.filter((p) => p.checkIn).length;

  return (
    <figure
      ref={figureRef}
      className="fatigue-panel"
      data-animate={animate ? "true" : undefined}
      data-grown={grown ? "true" : undefined}
    >
      <div className="fatigue-panel-head">
        <div>
          <p className="fatigue-eyebrow">Researcher · fatigue detection</p>
          <p className="fatigue-title">Answer time, question by question</p>
        </div>

        {/*
          The same three readings the dashboard puts beside the chart. All
          three are computed from the series on screen, so they cannot drift
          away from it.
        */}
        <dl className="fatigue-readings">
          <div>
            <dt>Pace</dt>
            <dd>{average}s</dd>
          </div>
          <div>
            <dt>Slowest</dt>
            <dd>{round1(slowest.seconds)}s</dd>
          </div>
          <div>
            <dt>Flags</dt>
            <dd>{flags}</dd>
          </div>
        </dl>
      </div>

      <ul className="chart-key">
        <li>
          <span className="chart-key-bar" aria-hidden="true" />
          Seconds to answer
        </li>
        <li>
          <span className="chart-key-band" aria-hidden="true" />
          Personal pace band
        </li>
        <li>
          <span className="chart-key-triangle" aria-hidden="true" />
          Check-in offered
        </li>
        <li>
          <span className="chart-key-tick" aria-hidden="true" />
          Replay
        </li>
      </ul>

      <div ref={ref} className="chart-canvas">
        <svg
          width={width}
          height={height}
          role="img"
          aria-labelledby="fc-title fc-desc"
        >
          <title id="fc-title">
            Fatigue detection across one survey session
          </title>
          <desc id="fc-desc">
            Answer time per question compared with the participant’s own
            pace. The first eleven questions sit inside the pace band at three
            to six seconds. Times then climb through questions twelve to
            sixteen, from about nine seconds to a peak of fourteen, with
            replays at questions thirteen and sixteen. The tablet offers a
            check-in at question sixteen, and times return to four to six
            seconds for the rest of the session.
          </desc>

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={pad.left + plotW}
                y1={y(tick)}
                y2={y(tick)}
                className="chart-grid-line"
              />
              <text
                x={pad.left - 8}
                y={y(tick) + 4}
                textAnchor="end"
                className="chart-axis-text"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* The pace band: everything under twice the participant's baseline. */}
          <rect
            x={pad.left}
            y={y(bandTop)}
            width={plotW}
            height={y(0) - y(bandTop)}
            className="chart-band"
          />
          <line
            x1={pad.left}
            x2={pad.left + plotW}
            y1={y(bandTop)}
            y2={y(bandTop)}
            className="chart-band-edge"
          />

          {session.map((point, i) => {
            const barH = Math.max(1, y(0) - y(point.seconds));
            return (
              <rect
                key={point.question}
                x={x(i)}
                y={y(point.seconds)}
                width={barW}
                height={barH}
                rx={barR}
                className="chart-bar"
                /* Each bar grows from its own baseline, left to right. */
                style={
                  {
                    transformOrigin: `${x(i) + barW / 2}px ${y(0)}px`,
                    "--bar-i": i,
                  } as React.CSSProperties
                }
              />
            );
          })}

          {/*
            Check-in: a triangle above the bar that triggered it, pointing
            down at it. The key's swatch is flipped to match.
          */}
          {session.map((point, i) =>
            point.checkIn ? (
              <polygon
                key={`checkin-${point.question}`}
                className="chart-checkin"
                points={[
                  `${x(i) + barW / 2},${y(point.seconds) - 5}`,
                  `${x(i) + barW / 2 - 5},${y(point.seconds) - 13}`,
                  `${x(i) + barW / 2 + 5},${y(point.seconds) - 13}`,
                ].join(" ")}
              />
            ) : null
          )}

          {/* Replays: a tick below the axis, clear of the bars. */}
          {session.map((point, i) =>
            point.replayed ? (
              <line
                key={`replay-${point.question}`}
                className="chart-replay-tick"
                x1={x(i) + barW / 2}
                x2={x(i) + barW / 2}
                y1={y(0) + 4}
                y2={y(0) + 11}
              />
            ) : null
          )}

          {session.map((point, i) =>
            (i + 1) % labelEvery === 0 || labelEvery === 1 ? (
              <text
                key={`label-${point.question}`}
                x={x(i) + barW / 2}
                y={y(0) + 24}
                textAnchor="middle"
                className="chart-axis-text"
              >
                {point.question}
              </text>
            ) : null
          )}

          <text
            x={pad.left + plotW / 2}
            y={height - 6}
            textAnchor="middle"
            className="chart-axis-label"
          >
            Question
          </text>
        </svg>
      </div>

      <figcaption className="fatigue-caption">{caption}</figcaption>
    </figure>
  );
}
