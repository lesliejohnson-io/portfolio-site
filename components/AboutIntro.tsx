import Image from "next/image";
import MailtoLink from "@/components/MailtoLink";

/**
 * A short about-me on the home page: a claim-led heading, two paragraphs,
 * and a "Let’s talk" link, beside a portrait. The full story stays on /about.
 *
 * To change the portrait, replace /public/images/leslie-johnson.jpg (or
 * point `src` at a new file) and update the alt text to match.
 */
export default function AboutIntro() {
  return (
    <section aria-labelledby="about-intro-title" className="bg-bg py-16 sm:py-20">
      <div className="container-wide">
        {/*
          Text column capped at 36rem (a comfortable line length at 17px) and
          a fixed 20rem photo column, the pair centred in the container.
        */}
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,36rem)_20rem] md:justify-center md:gap-16">
          <div>
            <h2
              id="about-intro-title"
              className="font-display text-[clamp(24px,2.3vw,30px)] font-bold leading-tight tracking-[-0.02em] text-fg"
            >
              Minding the gap.
            </h2>
            <div className="mt-5 flex flex-col gap-5 text-[17px] leading-relaxed text-fg-secondary">
              <p>
                In grad school I read about a radiation therapy machine that burned a patient, over
                and over, because the operator in the next room couldn’t see what the machine was
                doing. That idea has stayed with me: the distance between what a system knows and
                what the person responsible for it can see.
              </p>
              <p>
                I’ve worked on it in a rural clinic, where the brief was one sentence and the answer
                took a month in the field. I’ve worked on it in regulated fintech, as the only
                designer on the product. Now I work on it in autonomy, where a wrong read costs
                more.
              </p>
              <p>
                Somewhere along the way I started writing the gaps down. Calibrate is that library.
                Each pattern starts with a real failure and gives a structure for closing the gap
                that caused it.
              </p>
            </div>
            <MailtoLink
              location="about-intro"
              // Same outline button as "Read the case study" in ShippedWork,
              // minus the stretched-link overlay: this one is only the button.
              className="group mt-7 inline-flex items-center gap-3 rounded-md border border-accent px-4 py-2.5 text-[15px] font-medium text-fg transition-colors hover:bg-accent hover:text-accent-fg motion-reduce:transition-none"
            >
              Let’s talk
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </MailtoLink>
          </div>

          {/*
            A circle: a square frame (aspect-square) with fully rounded
            corners (rounded-full); overflow-hidden clips the photo to it.
            The photo is square too, so the whole picture fits; the circle
            only trims its corners.
          */}
          <div className="relative aspect-square w-full max-w-[20rem] overflow-hidden rounded-full">
            <Image
              src="/images/leslie-johnson.jpg"
              alt="Leslie Johnson, smiling with her arms crossed, in a black shirt in front of a glass-walled building."
              fill
              sizes="320px"
              className="object-cover object-[50%_30%] grayscale"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
