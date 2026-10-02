"use client";

import { useEffect } from "react";

// Elements whose CSS animations loop forever (see "off-screen pause" in globals.css).
const SELECTOR = ".gradient-text, .cta-primary, .aurora, .marquee, .orbit";

/**
 * One shared IntersectionObserver that marks infinitely-looping decorative
 * animations `data-offscreen` while they're out of view, so the browser stops
 * ticking them. They resume (from where they paused) just before re-entering.
 */
export default function PauseOffscreen() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.removeAttribute("data-offscreen");
          else e.target.setAttribute("data-offscreen", "");
        }
      },
      { rootMargin: "150px 0px" }
    );
    document.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
