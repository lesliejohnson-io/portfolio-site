import type { WorkLogo } from "@/lib/work";

/**
 * The marks in the band under the home hero, left to right.
 *
 * Add a logo by dropping white-on-transparent artwork (2x PNG or SVG) into
 * /public/logos and adding a line here. `scale` shrinks a mark that reads too
 * heavy next to the others (0.85 = 85% of the default size).
 *
 * The first four are reused from the Field Guide case study. Carnegie Mellon,
 * the National Speakers Association and Global Payments are in /public/logos,
 * trimmed to their artwork like the others (the NSA mark with its
 * "Pittsburgh" line cropped off).
 */
export const PARTNER_LOGOS: WorkLogo[] = [
  { src: "/work/field-guide/nih.png", alt: "National Institutes of Health" },
  { src: "/work/field-guide/wvu.png", alt: "West Virginia University", scale: 0.85 },
  { src: "/work/field-guide/pitt.png", alt: "University of Pittsburgh", scale: 0.85 },
  { src: "/work/field-guide/ccdg.png", alt: "Center for Craniofacial and Dental Genetics", scale: 0.85 },
  { src: "/logos/cmu.png", alt: "Carnegie Mellon University" },
  { src: "/logos/nsa.png", alt: "National Speakers Association" },
  { src: "/logos/global-payments.png", alt: "Global Payments", scale: 0.75 },
];
