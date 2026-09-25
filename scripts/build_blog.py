#!/usr/bin/env python3
"""Converts content/blog/*.md into blog/<slug>.html + blog/posts.json.

Standard library only — nothing to pip install.

Usage: python3 scripts/build_blog.py
"""
import html
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "content" / "blog"
OUT_DIR = ROOT / "blog"

FRONT_MATTER_RE = re.compile(r"^---\n(.*?)\n---\n?(.*)$", re.DOTALL)
HEADING_RE = re.compile(r"^(#{1,3})\s+(.*)$")
LIST_ITEM_RE = re.compile(r"^[-*]\s+")
CODE_RE = re.compile(r"`([^`]+)`")
BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")
ITALIC_RE = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def parse_front_matter(raw):
    match = FRONT_MATTER_RE.match(raw)
    if not match:
        return {}, raw

    fm_block, body = match.groups()
    data = {}
    for line in fm_block.split("\n"):
        if not line.strip() or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()

        if value.startswith("[") and value.endswith("]"):
            value = [v.strip() for v in value[1:-1].split(",") if v.strip()]
        elif value in ("true", "false"):
            value = value == "true"
        else:
            value = value.strip("\"'")
        data[key] = value

    return data, body.strip()


def esc(text):
    return html.escape(text, quote=False)


def inline(text):
    out = esc(text)
    out = CODE_RE.sub(r"<code>\1</code>", out)
    out = BOLD_RE.sub(r"<strong>\1</strong>", out)
    out = ITALIC_RE.sub(r"<em>\1</em>", out)
    out = LINK_RE.sub(r'<a class="link-underline" href="\2">\1</a>', out)
    return out


def markdown_to_html(md):
    lines = md.split("\n")
    out = []
    i = 0
    n = len(lines)

    while i < n:
        line = lines[i]

        if line.strip() == "":
            i += 1
            continue

        if line.strip().startswith("```"):
            code_lines = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1  # skip closing fence
            out.append(f"<pre><code>{esc(chr(10).join(code_lines))}</code></pre>")
            continue

        heading = HEADING_RE.match(line)
        if heading:
            level = len(heading.group(1))
            out.append(f"<h{level}>{inline(heading.group(2))}</h{level}>")
            i += 1
            continue

        if line.strip().startswith(">"):
            quote_lines = []
            while i < n and lines[i].strip().startswith(">"):
                quote_lines.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            out.append(f"<blockquote><p>{inline(' '.join(quote_lines))}</p></blockquote>")
            continue

        if LIST_ITEM_RE.match(line.strip()):
            items = []
            while i < n and LIST_ITEM_RE.match(lines[i].strip()):
                item_text = LIST_ITEM_RE.sub("", lines[i].strip(), count=1)
                items.append(f"<li>{inline(item_text)}</li>")
                i += 1
            out.append(f"<ul>{''.join(items)}</ul>")
            continue

        para_lines = []
        while (
            i < n
            and lines[i].strip() != ""
            and not lines[i].strip().startswith("```")
            and not HEADING_RE.match(lines[i])
            and not lines[i].strip().startswith(">")
            and not LIST_ITEM_RE.match(lines[i].strip())
        ):
            para_lines.append(lines[i].strip())
            i += 1
        out.append(f"<p>{inline(' '.join(para_lines))}</p>")

    return "\n".join(out)


def format_date_long(iso):
    return datetime.fromisoformat(iso).strftime("%B %-d, %Y")


PAGE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} &mdash; Daniel Hales</title>
  <meta name="description" content="{description}" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/assets/css/fonts.css" />
  <link rel="stylesheet" href="/assets/css/tokens.css" />
  <link rel="stylesheet" href="/assets/css/global.css" />
  <link rel="stylesheet" href="/assets/css/components.css" />
  <link rel="stylesheet" href="/assets/css/motion.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div data-include="/partials/header.html"></div>

  <main id="main">
    <article class="container section prose stack" data-reveal>
      <p><a class="link-underline" href="/blog/">&larr; All posts</a></p>
      <span class="meta">{date_long}</span>
      <h1>{title}</h1>
      <div class="card__meta">
        {tags_html}
      </div>
      {content_html}
    </article>
  </main>

  <div data-include="/partials/footer.html"></div>

  <script src="/assets/js/include.js"></script>
  <script src="/assets/js/reveal.js"></script>
</body>
</html>
"""


def build():
    if not SRC_DIR.exists():
        raise SystemExit(f"No source directory at {SRC_DIR}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    manifest = []

    for md_file in sorted(SRC_DIR.glob("*.md")):
        slug = md_file.stem
        raw = md_file.read_text(encoding="utf-8")
        data, body = parse_front_matter(raw)

        if not data.get("title") or not data.get("date"):
            print(f'Skipping {md_file.name}: missing required "title" or "date" front matter.')
            continue

        tags = data.get("tags", [])
        content_html = markdown_to_html(body)
        tags_html = "\n        ".join(f'<span class="tag">{esc(t)}</span>' for t in tags)

        html_out = PAGE_TEMPLATE.format(
            title=esc(data["title"]),
            description=esc(data.get("description", "")),
            date_long=format_date_long(data["date"]),
            tags_html=tags_html,
            content_html=content_html,
        )
        (OUT_DIR / f"{slug}.html").write_text(html_out, encoding="utf-8")

        manifest.append({
            "slug": slug,
            "title": data["title"],
            "description": data.get("description", ""),
            "date": data["date"],
            "tags": tags,
            "cover": data.get("cover"),
            "coverAlt": data.get("coverAlt", ""),
            "draft": bool(data.get("draft", False)),
        })

    manifest.sort(key=lambda p: p["date"], reverse=True)
    (OUT_DIR / "posts.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"Built {len(manifest)} post(s) into {OUT_DIR.relative_to(ROOT)}/")


if __name__ == "__main__":
    build()
