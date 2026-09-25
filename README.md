# dbaeles.github.io

Personal site: plain HTML/CSS/vanilla JS, no npm, no build framework, no
node_modules. Deploys as-is — GitHub Pages serves directly from `main`.

## Structure

- `index.html`, `about.html` — hand-written pages
- `projects/` — `index.html` (card grid) + one `.html` per project
- `blog/` — generated from `content/blog/*.md` (see below)
- `content/projects.json` — data source for project cards
- `content/blog/*.md` — blog post source (Markdown + front matter)
- `partials/header.html`, `partials/footer.html` — injected into every
  page at runtime by `assets/js/include.js`, so nav/footer only live in
  one place
- `assets/css/` — `tokens.css` (palette/type/spacing variables),
  `global.css` (reset + base type), `components.css` (nav, cards,
  buttons, prose), `motion.css` (page transitions, hero entrance,
  scroll-reveal for grid listings)
- `assets/js/` — `include.js` (partials), `reveal.js` (scroll-reveal),
  `render-list.js` (renders project/post cards from JSON)
- `assets/fonts/` — self-hosted woff2 (Lora, Archivo, Courier Prime), no
  Google Fonts CDN request

## Writing a blog post

Add a file to `content/blog/`, e.g. `content/blog/my-post.md`:

```
---
title: My Post
description: One sentence for the card/description meta tag.
date: 2026-07-01
tags: [tag-one, tag-two]
draft: false
---

Post body in Markdown. Supports headings (# ## ###), **bold**, *italic*,
`code`, fenced code blocks, [links](url), blockquotes (> ...), and
single-line list items (- item).
```

Then run:

```
python3 scripts/build_blog.py
```

This regenerates `blog/<slug>.html` for every post and `blog/posts.json`
(consumed by the blog index and the homepage's "latest posts" teaser).
Requires only Python 3's standard library — nothing to install.

## Adding a project

Add an entry to `content/projects.json` and hand-write the matching
`projects/<slug>.html` detail page (copy an existing one as a starting
point).

## Local preview

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. A local server is required (not
`file://`) because pages fetch partials/JSON at runtime.

## Deploying

Just commit and push to `main` — GitHub Pages is already configured to
serve straight from the branch root, no build step or Actions workflow
involved.
