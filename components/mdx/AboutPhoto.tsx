import Image from "next/image";

/**
 * The About portrait: one square frame, half photograph and half machine
 * reading of the same person.
 *
 * It sits at the reading column's measure rather than running wide. A square
 * at full container width would be taller than the viewport and would push the
 * opening paragraphs off the screen, which is the opposite of what the image
 * is doing there.
 */
export default function AboutPhoto() {
  return (
    <figure className="about-portrait">
      <Image
        src="/images/operator-portrait.webp"
        alt="Leslie Johnson against a technical grid, the left half a photograph and the right half a machine's wireframe reading of her, labelled HUMAN and MACHINE, with a readout giving state operational, attention high, and trust calibrated."
        width={1024}
        height={1024}
        sizes="(min-width: 768px) 680px, 100vw"
        className="w-full rounded-lg"
        priority
      />
    </figure>
  );
}
