import Script from "next/script";

/**
 * Runs before hydration to set data-theme on <html>, so there's no flash of
 * the wrong theme. The theme follows the system preference. (There is no
 * toggle any more, so a choice saved by the old one is ignored: with no
 * button to change it, a visitor would be stuck with it.) Built from scratch —
 * no theme library — to keep the colophon's claim honest.
 */
const script = `(function(){try{var t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {script}
    </Script>
  );
}
