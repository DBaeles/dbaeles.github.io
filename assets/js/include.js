// Injects shared HTML partials (header/footer) into pages marked with
// data-include, and marks the active nav link. No build step, no framework —
// just fetch + innerHTML.
(function () {
  async function loadIncludes() {
    const nodes = document.querySelectorAll("[data-include]");
    await Promise.all(
      Array.from(nodes).map(async (node) => {
        const url = node.getAttribute("data-include");
        try {
          const res = await fetch(url);
          node.innerHTML = await res.text();
        } catch (err) {
          console.error("Failed to load partial:", url, err);
        }
      })
    );
    markActiveNavLink();
    setFooterYear();
    document.dispatchEvent(new CustomEvent("partials:loaded"));
  }

  function markActiveNavLink() {
    const links = document.querySelectorAll(".site-nav__links a");
    const current = window.location.pathname;
    links.forEach((link) => {
      const href = link.getAttribute("href");
      const isHome = href === "/" && current === "/";
      const isSection = href !== "/" && current.startsWith(href);
      if (isHome || isSection) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function setFooterYear() {
    const el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadIncludes);
  } else {
    loadIncludes();
  }
})();
