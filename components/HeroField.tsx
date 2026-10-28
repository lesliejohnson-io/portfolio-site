"use client"

import dynamic from "next/dynamic"
import { motion, MotionConfig, type Variants } from "motion/react"

/*
  The WebGL field is split into its own module and loaded with ssr:false: it
  builds a WebGLRenderer and reads getComputedStyle on mount, so there is
  nothing for the server to render.

  Two notes on the shape of this.

  `ssr: false` only works inside a Client Component — Next throws if a Server
  Component passes it — which is why this file carries "use client" and
  app/page.tsx imports it as a normal component.

  The dynamic boundary is drawn around the canvas rather than around the whole
  hero on purpose. The headline is the page's only h1; dynamic-importing the
  section as a unit would keep it out of the server HTML entirely, so the
  document would ship with no h1 for crawlers and nothing for a visitor with
  JavaScript off. Split this way the text prerenders as ordinary markup and
  only the field waits for the client.

  The band keeps its height and background while the field loads, so there is
  no layout shift when the canvas arrives.
*/
const HeroFieldCanvas = dynamic(() => import("./HeroFieldCanvas"), { ssr: false })

// ---- Text entrance (Motion), carried over from WaveHero ----
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
}

export default function HeroField() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="hero-field relative overflow-hidden bg-hero-field-bg">
        {/*
          Motion writes its `hidden` variant into the server HTML as inline
          opacity:0, so without JavaScript the headline would ship in the
          markup and then never become visible. This puts it back, per the
          site's rule that nothing is hidden when JavaScript does not run.
          Inline rather than in globals.css because a stylesheet cannot tell
          whether scripts ran.
        */}
        <noscript>
          <style>{`.hero-field h1,.hero-field p{opacity:1!important;filter:none!important;transform:none!important}`}</style>
        </noscript>
        {/*
          The field is a sibling of the text rather than a backdrop behind it,
          because the two swap relationship at the breakpoint: below 768px the
          panel sits above the field in normal flow, at and above it the panel
          goes back to floating over the field. Both arrangements live in
          .hero-field-stage / .hero-field-text in globals.css, since a custom
          class cannot be switched with a Tailwind md: prefix.

          The text comes first in the DOM because that is the mobile order —
          headline, then field beneath it. Above the breakpoint both are taken
          out of flow and z-index decides instead, so the order stops mattering
          there.

          Left-aligned over the field, as in the prototype, but laid out on the
          site's own container so it shares a left margin with the nav and the
          case study rows below instead of the prototype's bare 8vw.

          pointer-events-none (desktop only, set in CSS) so the text does not
          swallow the pointer the field tracks to reveal the labels under it.
        */}
        <div className="hero-field-text container-wide">
          {/*
            The glass panel is the motion element itself, so it fades and
            rises as one object rather than the type sliding around inside a
            frame that is already there. Its own geometry — width, padding,
            blur, border — lives in .hero-field-panel in globals.css.
          */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hero-field-panel flex flex-col gap-5"
          >
            <motion.h1
              variants={item}
              className="font-display text-[clamp(32px,9vw,50px)] font-bold leading-[1.02] tracking-[-0.02em] text-hero-field-label md:text-[clamp(32px,5vw,50px)]"
            >
              Intelligent systems
              <br />
              meet human design.
            </motion.h1>
            <motion.p
              variants={item}
              className="max-w-[480px] text-[clamp(16px,1.4vw,20px)] leading-[1.5] text-hero-field-subline"
            >
              I turn complex systems into interfaces people can read, trust, and act on.
            </motion.p>
          </motion.div>
        </div>
        <div className="hero-field-stage">
          <HeroFieldCanvas />
        </div>
      </section>
    </MotionConfig>
  )
}
