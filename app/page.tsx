import HeroField from "@/components/HeroField";
import FeaturedPrototype from "@/components/FeaturedPrototype";
import ShippedWork from "@/components/ShippedWork";
import CalibrateSection from "@/components/CalibrateSection";
import AboutIntro from "@/components/AboutIntro";

export default function Home() {
  return (
    <>
      {/*
        HeroField carries its own band, column and headline, so it sits outside
        container-wide and replaces the tinted hero that used to be here.

        The band runs up under the sticky nav (negative margin on .hero-field
        in globals.css), so the nav's glass, filled with the field's own
        colour, sits over the field and the two read as one dark surface. The
        nav is dark on both themes, so this holds in light mode too.
      */}
      <HeroField />
      <FeaturedPrototype />

      <ShippedWork />
      <AboutIntro />
      <CalibrateSection />
    </>
  );
}
