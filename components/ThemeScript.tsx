import Script from "next/script";

/**
 * Runs before hydration to set data-theme on <html>, so there's no flash of
 * the wrong theme. First visit falls back to the system preference; an explicit
 * choice persisted in localStorage always wins after that. Built from scratch —
 * no theme library — to keep the colophon's claim honest.
 */
const script = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {script}
    </Script>
  );
}
