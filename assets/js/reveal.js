// Reveals [data-reveal] elements as they scroll into view. A plain
// IntersectionObserver, no dependency. Exposed as window.initReveal so
// render-list.js can register grid items it inserts after fetch.
window.initReveal = (function () {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let observer = null;
  if (!reduceMotion && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
  }

  return function initReveal(elements) {
    const targets =
      elements || document.querySelectorAll("[data-reveal]:not(.is-visible)");
    targets.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${Math.min(i * 70, 420)}ms`);
      if (observer) {
        observer.observe(el);
      } else {
        el.classList.add("is-visible");
      }
    });
  };
})();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => window.initReveal());
} else {
  window.initReveal();
}
