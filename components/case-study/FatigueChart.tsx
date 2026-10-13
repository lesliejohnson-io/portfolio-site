"use client";

import { useChartWidth } from "./useChartWidth";

/**
 * Answer time per question against the participant's own pace band, with the
 * replays and the check-in marked.
 *
 * One data series, so there is no legend of competing colours to decode: the
 * line is the accent, and the other marks are different shapes — a diamond for
 * the check-in, a tick for a replay — rather than different hues. That matters
 * because the site's accent and its neutral grey are nearly identical under
 * deuteranopia, so shape, position and the key below carry identity instead.
 *
 * Thresholds mirror the tablet's own rules: baseline is the median of the
 * first five answers, "slow" is twice that, and the check-in fires after three
 * slow answers in a row.
 */
export type SessionPoint = {
  question: number;
  seconds: number;
  replayed?: boolean;
  checkIn?: boolean;
};

/*
  Sample data for illustration, not study data — hence the caption, which
  should stay whatever else changes here. Replace with a session exported from
  the demo.
*/
export const SAMPLE_SESSION: SessionPoint[] = [
  4, 5, 4, 6, 5, 5, 6, 5, 6, 7, 6, 8, 11, 12, 13, 6, 5, 6, 5, 5,
].map((seconds, i) => ({
  question: i + 1,
  seconds,
  replayed: i + 1 === 12 || i + 1 === 14,
  checkIn: i + 1 === 15,
}));

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

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

  const height = 300;
  const pad = { top: 16, right: 16, bottom: 56, left: 36 };
  const plotW = Math.max(120, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;

  const baseline = median(
    session.slice(0, baselineQuestions).map((p) => p.seconds)
  );
  const bandTop = baseline * slowFactor;
  const yMax =
    Math.max(
      15,
      Math.ceil(Math.max(...session.map((p) => p.seconds), bandTop) / 5) * 5
    );
  const n = session.length;

  const x = (i: number) =>
    pad.left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (seconds: number) => pad.top + plotH - (seconds / yMax) * plotH;

  const linePath = session
    .map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.seconds)}`)
    .join(" ");
  const yTicks = Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5);
  const replayY = pad.top + plotH + 26;

  /*
    Every question number at 680px, every fifth on a phone — 20 labels in a
    327px column would collide into a grey smear.
  */
  const labelStep = width < 420 ? 5 : width < 560 ? 2 : 1;

  return (
    <figure className="chart-figure fatigue-chart">
      <figcaption className="chart-title">
        Fatigue detection in one survey session
      </figcaption>

      <ul className="chart-key">
        <li>
          <span className="chart-key-line" aria-hidden="true" />
          Seconds to answer
        </li>
        <li>
          <span className="chart-key-band" aria-hidden="true" />
          Personal pace band
        </li>
        <li>
          <span className="chart-key-diamond" aria-hidden="true" />
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
          <title id="fc-title">Fatigue detection in one survey session</title>
          <desc id="fc-desc">
            Answer time per question compared with the participant&apos;s own
            pace. The first eleven questions sit inside the pace band at four to
            six seconds. Times then climb to eleven, twelve and thirteen seconds
            over questions thirteen to fifteen, with replays at questions twelve
            and fourteen. The tablet offers a check-in after question fifteen,
            and times return to five or six seconds for the rest of the session.
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

          <path d={linePath} className="chart-line" />

          {session.map((p, i) => (
            <circle
              key={p.question}
              cx={x(i)}
              cy={y(p.seconds)}
              r={4}
              className="chart-dot"
            >
              <title>{`Question ${p.question}: ${p.seconds} seconds`}</title>
            </circle>
          ))}

          {session.map((p, i) =>
            p.checkIn ? (
              <rect
                key={`checkin-${p.question}`}
                x={x(i) - 7}
                y={y(p.seconds) - 7}
                width={14}
                height={14}
                transform={`rotate(45 ${x(i)} ${y(p.seconds)})`}
                className="chart-checkin"
              >
                <title>{`Check-in offered after question ${p.question}`}</title>
              </rect>
            ) : null
          )}

          {session.map((p, i) => (
            <g key={`axis-${p.question}`}>
              {(p.question - 1) % labelStep === 0 && (
                <text
                  x={x(i)}
                  y={pad.top + plotH + 18}
                  textAnchor="middle"
                  className="chart-axis-text"
                >
                  {p.question}
                </text>
              )}
              {p.replayed && (
                <line
                  x1={x(i)}
                  x2={x(i)}
                  y1={replayY - 5}
                  y2={replayY + 5}
                  className="chart-replay-tick"
                >
                  <title>{`Question ${p.question} was replayed`}</title>
                </line>
              )}
            </g>
          ))}

          <text
            x={pad.left + plotW / 2}
            y={height - 6}
            textAnchor="middle"
            className="chart-axis-text"
          >
            Question
          </text>
          <text
            x={10}
            y={pad.top + plotH / 2}
            textAnchor="middle"
            transform={`rotate(-90 10 ${pad.top + plotH / 2})`}
            className="chart-axis-text"
          >
            Seconds
          </text>
        </svg>
      </div>

      {caption && <p className="chart-caption">{caption}</p>}
    </figure>
  );
}
