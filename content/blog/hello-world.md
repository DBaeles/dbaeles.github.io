---
title: Hello, World
description: The first post on this site, and a quick tour of how the blog pipeline works.
date: 2026-05-10
tags: [meta]
draft: false
---

This is the first post on the new site. It's written in **Markdown** in
`content/blog/`, and turned into a real page by running:

```
python3 scripts/build_blog.py
```

That script reads every file in this folder, converts the Markdown to
HTML, and writes out:

- a page at `blog/<slug>.html`
- an entry in `blog/posts.json`, used by the blog index and homepage

No npm install, no framework — just a small script and some plain files.

Note: this converter is intentionally minimal, not full CommonMark. Keep
each list item on a single line (no wrapped continuation lines) and it
will render correctly.

> Replace this post with something real once you're ready.

Links work too, like a [link back to the homepage](/).
