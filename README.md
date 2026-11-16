# IAN — Portfolio

A personal portfolio and journal built with plain HTML, CSS, and JavaScript.
The design is a paper-and-ink "field journal": typewriter display type, a warm
paper canvas, a colour-coded section rail, and a desk panel with a clock and
calendar.

No framework, no build step, no dependencies. Open a local server and it runs.

---

## Quick start

The site loads `content.json` with `fetch()`, so it must be served over HTTP
(`file://` will not work).

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then visit <http://localhost:8000>.

### Admin access

Append `?admin=1` to any page to unlock the editor:

```
http://localhost:8000/index.html?admin=1
```

In admin mode a lightbulb button appears in the desk panel and an **Admin** link
appears in the footer. The editor is a browser-local draft until you export it.

---

## What is in the box

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero + field notes |
| `profile.html` | About, details and profile notes |
| `education.html` | Education timeline |
| `experience.html` | Experience timeline, with document links |
| `skills.html` | Skills and hobbies |
| `survey.html` | Multi-step feedback form (mailto) |
| `games.html` | Three browser experiments |
| `games/*.html` | Reaction time, Stroop test, memory match |
| `404.html` | Not-found page |
| `chrome.js` | Shared header, rail, desk widget, footer and overlays |
| `portfolio.js` | Content loading, rendering, editor and interactions |
| `style.css` | Design system and all page styles |
| `games/game.css` | Self-contained dark "lab" styles for the games |
| `content.json` | Published content |
| `favicon.svg`, `icons/`, `photos/` | Assets |

Every page is a small skeleton:

```html
<body data-page="education">
  <header id="site-header"></header>
  <div class="layout-container">
    <aside class="left-panel" id="leftPanel"><div id="site-rail"></div></aside>
    <div class="content">
      <main id="main">…page content…</main>
      <div id="site-widget"></div>
      <footer id="site-footer"></footer>
    </div>
  </div>
  <div id="site-overlays"></div>
</body>
```

`chrome.js` fills the mount points, so the chrome lives in exactly one place.
To add a section, add an entry to the `NAV` array in `chrome.js` and create the
matching page.

---

## Editing content

There are two layers:

1. **Published content** — `content.json`, committed with the site.
2. **Local draft** — `localStorage`, created by the editor.

The editor writes to the local draft so you can work offline and preview changes
before publishing. To publish:

1. Open `?admin=1` → **Export JSON**.
2. Replace `content.json` in the project folder.
3. Commit and push (or upload to your host).
4. Reload the live site and press **Reset** in the editor to re-sync the browser.

### Content model

```jsonc
{
  "profile": {
    "name": "IAN",
    "pronouns": "XY",
    "greeting": "Hello there!",
    "title": "Psychology Graduate & Educator",
    "tagline": "",
    "bio": "…",
    "about": "Optional longer copy, blank line between paragraphs.",
    "location": "Winnipeg, MB",
    "email": "…",
    "linkedin": "",
    "actions": [{ "label": "Explore My Profile", "href": "profile.html", "style": "primary" }]
  },
  "education":  [{ "institution": "…", "degree": "…", "years": "…", "sortYear": 2026,
                   "location": "…", "description": "…", "highlights": ["…"] }],
  "experience": [{ "position": "…", "organization": "…", "years": "…", "sortYear": 2023,
                   "location": "…", "description": "…", "highlights": ["…"],
                   "documents": [{ "title": "…", "path": "documents/…" }] }],
  "skills": ["…"],
  "hobbies": ["…"],
  "posts": [{
    "id": "p_…", "date": "2026-11-15", "tab": "home", "label": "introspection",
    "author": "Me", "photos": [],
    "fields": [{ "name": "Abstract", "blocks": [
      { "type": "title",     "content": "…" },
      { "type": "subtitle",  "content": "…" },
      { "type": "paragraph", "content": "…" },
      { "type": "actions",   "content": "Label | href | primary" }
    ]}]
  }],
  "photos": [{ "date": "…", "memo": "…", "image": "photos/polaroid/…jpg", "labels": ["memory"] }],
  "labels": { "introspection": { "color": "#A8C9E8" } },
  "site": { "projectName": "IAN — Portfolio", "theme": "retro", "heroPostIds": { "home": null } },
  "surveys": [{ "id": "…", "title": "…", "active": true, "fields": [ … ] }]
}
```

Notes:

- `tab` decides which page a note belongs to (`home`, `profile`, `education`,
  `experience`, `skills`, `survey`).
- `sortYear` powers timeline ordering; the editor derives it from `years`.
- `site.heroPostIds.home` can promote a note into the home hero. Leave it `null`
  to use the profile copy (recommended, so profile edits appear immediately).
- A survey field is one page of the form; blocks inside a field can be
  `heading`, `paragraph`, `text`, `textarea`, `select`, `radio` or `rating`.

---

## The editor

Available at `?admin=1`:

- **Notes** — create, edit, duplicate, feature, delete and search notes per page.
- **Profile** — name, pronouns, greeting, role, tagline, bio, about, contact
  details and hero buttons.
- **Education / Experience** — timeline entries, highlights and document links.
- **Skills** — skills and hobbies, one per line.
- **Photos** — polaroid gallery entries, with a file picker that resizes images
  and saves them into `photos/polaroid/` (File System Access API) or downloads
  them as a fallback.
- **Survey** — intro and thank-you copy, multi-page fields and blocks, active
  survey switch.
- **Labels** — colour palette used by note chips and the calendar.
- **Site** — site title, theme and the featured home note.
- **Data** — storage usage, backup download, copy JSON, validation checklist and
  reset.

The editor never writes to disk directly: export `content.json` and commit it.
That is deliberate for a static host, and it is the main thing a small backend
would improve (see `IMPROVEMENTS.md`).

---

## Design system

`style.css` is organised into numbered sections and driven by custom properties:

- Paper and ink colours, section accents, rules, shadows, radii and a type scale
  live in `:root`.
- Each page sets `--page-accent` and `--page-tint` from `body[data-page="…"]`.
- Type: `Courier Prime` for display/labels, a Palatino/Georgia stack for prose,
  and the system UI font for form controls.
- Themes:
  - `retro` — thin rules, soft shadows (default).
  - `retro-bold` — heavy ink rules and hard offset shadows.
- Reading preferences (reduce motion, sound, text size, clock style) are in the
  settings drawer and stored per browser.

---

## Games

The three experiments are self-contained and load only `games/game.css` and
their own script. They use a dark "psych lab" palette that intentionally
contrasts with the paper site.

---

## Deployment

Any static host works: GitHub Pages, Netlify, Cloudflare Pages, S3, etc.

- Serve from the repository root (all asset paths are relative).
- Make sure `404.html` is used for unknown paths (GitHub Pages does this
  automatically; Netlify needs a `_redirects` rule).
- Set long cache headers for `/icons`, `/photos`, `/googleFonts` and a short one
  for `content.json`.

---

## Notes for future work

- `portfolio.js` is still a single classic script. It is organised in numbered
  sections, but it would benefit from ES modules and a bundler.
- The admin gate is cosmetic. Content is browser-local and unauthenticated by
  design; do not store anything private in `content.json`.
- Content is rendered client-side, so search engines and social previews see the
  static skeleton rather than the notes. See `IMPROVEMENTS.md` for the fix.

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for the prioritised roadmap.
