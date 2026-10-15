/**
 * How long a survey took to reach researchers: paper carried between sites and
 * keyed in by hand, against tablets that synced within eight hours.
 *
 * Built from HTML and CSS rather than SVG. The two long arrival notes have to
 * wrap, and SVG text does not wrap — in SVG they would need hand-broken lines
 * per breakpoint. As plain elements they reflow, stay selectable, and scale
 * with the reader's own font size.
 *
 * The two tracks are an emphasis pair, not a categorical palette: the tablet
 * carries the accent because it is the point, and paper sits in neutral grey
 * as the baseline it beats. Identity never rests on colour — each track is
 * named on its own row — which matters because the accent and a neutral grey
 * are near-indistinguishable under deuteranopia.
 */
type Segment = {
  label?: string;
  startDay: number;
  endDay: number;
};

type Track = {
  name: string;
  segments: Segment[];
  arrivesDay: number;
  arrivesLabel: string;
  /** Phase names for the narrow layout, where they will not fit in the bar. */
  phaseNote?: string;
  tone: "muted" | "accent";
};

const MAX_DAYS = 8;
const TICKS = [0, 2, 4, 6, 8];

const TRACKS: Track[] = [
  {
    name: "Paper",
    tone: "muted",
    segments: [
      { startDay: 0, endDay: 0.15 },
      { label: "Carried between sites", startDay: 0.2, endDay: 6 },
      { label: "Typed in", startDay: 6.05, endDay: 7 },
    ],
    phaseNote: "Carried between sites, then typed in by hand.",
    arrivesDay: 7,
    arrivesLabel: "Reaches researchers, day 7 or later",
  },
  {
    name: "Tablet",
    tone: "accent",
    /* Eight hours is a third of a day on this scale. */
    segments: [{ startDay: 0, endDay: 8 / 24 }],
    arrivesDay: 8 / 24,
    arrivesLabel:
      "Synced within 8 hours of completion, available immediately",
  },
];

const pct = (day: number) => `${(day / MAX_DAYS) * 100}%`;

export default function SurveyTimeline() {
  return (
    <figure className="chart-figure survey-timeline">
      <figcaption className="chart-title">
        How long a survey took to reach researchers
      </figcaption>

      <div className="survey-timeline-tracks">
        {TRACKS.map((track) => (
          <div key={track.name} className="survey-timeline-track">
            <p className="survey-timeline-name">{track.name}</p>

            <div className="survey-timeline-bar" data-tone={track.tone}>
              {track.segments.map((segment) => (
                <div
                  key={`${segment.startDay}-${segment.endDay}`}
                  className="survey-timeline-segment"
                  style={{
                    left: pct(segment.startDay),
                    width: pct(segment.endDay - segment.startDay),
                  }}
                >
                  {segment.label && (
                    <span className="survey-timeline-segment-label">
                      {segment.label}
                    </span>
                  )}
                </div>
              ))}

              {/* Where the data actually lands, marked on the same scale. */}
              <div
                className="survey-timeline-arrives"
                style={{ left: pct(track.arrivesDay) }}
                aria-hidden="true"
              />
            </div>

            <p className="survey-timeline-note">
              {/*
                The phase names live in the bar at full width and move down
                here when the segments get too narrow to hold them — a label
                that does not fit is dropped, never clipped.
              */}
              {track.phaseNote && (
                <span className="survey-timeline-phases">
                  {track.phaseNote}{" "}
                </span>
              )}
              {track.arrivesLabel}
            </p>
          </div>
        ))}
      </div>

      <div className="survey-timeline-axis" aria-hidden="true">
        {TICKS.map((day) => (
          <span
            key={day}
            className="survey-timeline-tick"
            style={{ left: pct(day) }}
          >
            {day === 0 ? "Day 0" : `Day ${day}`}
          </span>
        ))}
      </div>
    </figure>
  );
}
