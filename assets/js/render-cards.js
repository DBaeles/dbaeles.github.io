// Renders project/post cards from JSON data files into a container.
// Vanilla JS, no templating engine — just string building.
window.renderCards = (function () {
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function cardMarkup(item, href) {
    const cover = item.cover
      ? `<img class="card__cover" src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.coverAlt || "")}" loading="lazy" />`
      : "";
    const tags = (item.tags || [])
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join("");
    return `
      <a class="card" href="${escapeHtml(href)}" data-reveal>
        ${cover}
        <div class="card__body">
          <span class="meta">${formatDate(item.date)}</span>
          <h3 class="card__title">${escapeHtml(item.title)}</h3>
          <p class="card__description">${escapeHtml(item.description)}</p>
          <div class="card__meta">${tags}</div>
        </div>
      </a>
    `;
  }

  async function renderInto(selector, url, hrefFor, opts) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const res = await fetch(url);
      let items = await res.json();
      items = items.filter((i) => !i.draft);
      if (opts.featuredOnly) items = items.filter((i) => i.featured);
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      if (opts.limit) items = items.slice(0, opts.limit);
      el.innerHTML = items.map((i) => cardMarkup(i, hrefFor(i))).join("");
      if (window.initReveal) window.initReveal();
    } catch (err) {
      console.error("Failed to render cards from", url, err);
    }
  }

  return {
    projects(selector, opts = {}) {
      return renderInto(
        selector,
        "/content/projects.json",
        (i) => `/projects/${i.slug}.html`,
        opts
      );
    },
    posts(selector, opts = {}) {
      return renderInto(
        selector,
        "/blog/posts.json",
        (i) => `/blog/${i.slug}.html`,
        opts
      );
    },
  };
})();
