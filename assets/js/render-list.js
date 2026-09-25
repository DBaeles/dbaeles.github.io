// Renders project/post rows from JSON data files into a menu-list.
// Vanilla JS, no templating engine — just string building.
window.renderList = (function () {
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function rowMarkup(item, href) {
    const tags = (item.tags || []).join(", ");
    return `
      <li class="menu-row">
        <a class="menu-row__link" href="${escapeHtml(href)}">
          <span class="menu-row__title">${escapeHtml(item.title)}</span>
          <span class="menu-row__leader" aria-hidden="true"></span>
          <span class="menu-row__meta">${escapeHtml(tags)}</span>
        </a>
        <p class="menu-row__description">${escapeHtml(item.description)}</p>
      </li>
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
      el.innerHTML = items.map((i) => rowMarkup(i, hrefFor(i))).join("");
    } catch (err) {
      console.error("Failed to render list from", url, err);
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
