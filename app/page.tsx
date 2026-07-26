import WorkGrid from "@/components/WorkGrid";

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <h1
          style={{ fontWeight: 400 }}
          className="font-serif text-5xl leading-[1.05] text-fg sm:text-7xl"
        >
          Intelligent systems
          <br />
          <em className="italic">meet human design.</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-secondary">
          I turn complex machine behavior into interfaces people can read, trust, and act on.
        </p>
      </section>

      <WorkGrid />
    </>
  );
}
