// Fades/slides [data-reveal] elements in as they enter the viewport.
// No dependency — a plain IntersectionObserver, ~30 lines.
// Exposed as window.initReveal so dynamically-inserted cards (render-cards.js)
// can be picked up after the initial page load pass.
(function () {
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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
  }

  function init() {
    const targets = document.querySelectorAll(
      "[data-reveal]:not(.is-visible)"
    );
    targets.forEach((el) => {
      if (observer) {
        observer.observe(el);
      } else {
        el.classList.add("is-visible");
      }
    });
  }

  window.initReveal = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
