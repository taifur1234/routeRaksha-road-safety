import { useEffect } from "react";

const REVEAL_SELECTOR = "main section, main .motion-card, main footer";

function ScrollRevealProvider({ children, watchKey }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer;

    function setupReveal() {
      observer?.disconnect();

      const elements = Array.from(document.querySelectorAll(REVEAL_SELECTOR)).filter(
        (element) => !element.closest(".auth-page"),
      );
      const firstSections = new Set(
        Array.from(document.querySelectorAll("main"))
          .map((main) => main.querySelector("section"))
          .filter(Boolean),
      );

      elements.forEach((element, index) => {
        element.classList.remove("scroll-reveal", "is-visible");
        element.style.removeProperty("--reveal-delay");

        if (firstSections.has(element)) {
          element.classList.add("is-visible");
          return;
        }

        element.classList.add("scroll-reveal");
        element.style.setProperty("--reveal-delay", `${Math.min((index % 5) * 60, 240)}ms`);
      });

      if (prefersReducedMotion) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.12,
        },
      );

      elements
        .filter((element) => !firstSections.has(element))
        .forEach((element) => observer.observe(element));
    }

    const frame = requestAnimationFrame(setupReveal);
    const timer = window.setTimeout(setupReveal, 150);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [watchKey]);

  return children;
}

export default ScrollRevealProvider;
