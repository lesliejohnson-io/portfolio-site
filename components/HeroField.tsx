"use client"

import dynamic from "next/dynamic"
import { motion, MotionConfig, type Variants } from "motion/react"
import { sendGAEvent } from "@next/third-parties/google"
import { CONTACT_MAILTO } from "@/lib/contact"

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
          <style>{`.hero-field-panel>*{opacity:1!important;filter:none!important;transform:none!important}`}</style>
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
            The headline block is the motion element itself, so the headline
            and the line under it fade and rise as one object rather than
            drifting independently. Its measure lives in .hero-field-panel in
            globals.css, which is all that is left of the glass card that
            used to sit behind this text.
          */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hero-field-panel flex flex-col gap-5"
          >
            {/*
              The line breaks are set by hand from md up, so the headline
              always reads in the same three phrases. Below md they are
              hidden and the text wraps naturally to the phone's width.
            */}
            <motion.h1
              variants={item}
              className="font-display text-[clamp(32px,8.5vw,46px)] font-bold leading-[1.05] tracking-[-0.02em] text-hero-field-label md:text-[clamp(32px,3.2vw,46px)]"
            >
              Designing the moment <br className="hidden md:inline" />
              an operator decides whether to <br className="hidden md:inline" />
              trust the machine.
            </motion.h1>
            <motion.div
              variants={item}
              className="flex max-w-[520px] flex-col gap-3 text-[clamp(16px,1.2vw,18px)] leading-[1.5] text-hero-field-subline"
            >
              <p>
                Health research, financial services, command-and-control autonomy. IC designer
                experienced working on teams or solo.
              </p>
              <p className="font-semibold text-hero-field-label">I design it, build it, and ship it.</p>
            </motion.div>
            {/*
              pointer-events-auto because the text layer above the field is
              pointer-events:none on desktop (so the field can track the
              pointer through it); the button has to opt back in to be clicked.
            */}
            <motion.div variants={item} className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#work"
                className="pointer-events-auto inline-flex items-center gap-2 rounded-md border border-hero-field-cta bg-hero-field-cta px-4 py-2.5 text-[15px] font-semibold text-hero-field-cta-fg transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-field-label"
              >
                See the work
              </a>
              {/*
                The secondary action: an outline in the button's fill colour,
                the same size as "See the work" but unfilled, so it reads as
                second to it. On hover it fills, like the outline buttons
                further down the page. Opens a mail draft, as
                the About page's "Get in touch" does, and fires the same
                `email_click` event tagged location: "hero". The arrow nudges
                right on hover; motion-safe skips that under reduced motion.
              */}
              <a
                href={CONTACT_MAILTO}
                onClick={() => sendGAEvent("event", "email_click", { location: "hero" })}
                className="group pointer-events-auto inline-flex items-center gap-2 rounded-md border border-hero-field-cta px-4 py-2.5 text-[15px] font-semibold text-hero-field-cta transition-colors hover:bg-hero-field-cta hover:text-hero-field-cta-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hero-field-cta"
              >
                Let’s talk
                <span
                  aria-hidden="true"
                  className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </motion.div>
          </motion.div>
        </div>
        <div className="hero-field-stage">
          <HeroFieldCanvas />
        </div>
      </section>
    </MotionConfig>
  )
}
