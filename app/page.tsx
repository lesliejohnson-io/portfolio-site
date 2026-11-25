import HeroField from "@/components/HeroField";
import LogoBand from "@/components/LogoBand";
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

        WaveHero's band extension above the nav is deliberately gone with it.
        That strip painted --wave-hero-bg behind the floating nav so the band
        reached the top of the page, which worked because on the light theme
        that token WAS the page background. The field band is dark on both
        themes, so the same strip would put the nav's translucent pill and its
        dark link text on near-black in light mode. The field starts below the
        nav instead, and the nav keeps the page background under it.
      */}
      <HeroField />
      <LogoBand />
      <FeaturedPrototype />

      <ShippedWork />
      <AboutIntro />
      <CalibrateSection />
    </>
  );
}
