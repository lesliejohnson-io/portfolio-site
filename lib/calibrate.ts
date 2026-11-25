/**
 * Calibrate: design patterns for human-machine trust. The home page section
 * renders this list in order, so adding or reordering a pattern is an edit
 * here, not in the component.
 *
 * `icon` names one of the line drawings in CalibrateSection.tsx.
 */

export const CALIBRATE_URL = "https://calibrate.lesliejohnson.io";

/** A pattern's own page on the Calibrate site. */
export const patternUrl = (slug: string) => `${CALIBRATE_URL}/patterns/${slug}`;

export type CalibrateIcon =
  | "glass-box"
  | "shared-model"
  | "alert-triage"
  | "friction"
  | "intent-preview"
  | "capability";

export type CalibratePattern = {
  title: string;
  description: string;
  icon: CalibrateIcon;
  /** The last part of its address: calibrate.lesliejohnson.io/patterns/<slug>. */
  slug: string;
};

export const CALIBRATE_PATTERNS: CalibratePattern[] = [
  {
    title: "The Glass Box",
    description:
      "The machine shows its reasoning, not just its output, so operators can trust or override it with context.",
    icon: "glass-box",
    slug: "glass-box",
  },
  {
    title: "Shared Mental Model",
    description:
      "The operator’s mental model and the machine’s state stay in sync, so nobody is working from a stale picture.",
    icon: "shared-model",
    slug: "shared-mental-model",
  },
  {
    title: "Alert Triage",
    description:
      "Alerts are ranked by how urgently a human must act, so the critical one isn’t buried.",
    icon: "alert-triage",
    slug: "alert-triage",
  },
  {
    title: "Appropriate Friction",
    description:
      "Before a high-stakes action, the interface makes the operator slow down and confirm.",
    icon: "friction",
    slug: "appropriate-friction",
  },
  {
    title: "Intent Preview",
    description:
      "The machine shows what it’s about to do, so a wrong plan gets caught before it becomes a wrong action.",
    icon: "intent-preview",
    slug: "intent-preview",
  },
  {
    title: "Capability Disclosure",
    description:
      "The machine says what it cannot do and where it will not run, then refuses to engage outside those limits.",
    icon: "capability",
    slug: "capability-disclosure",
  },
];
