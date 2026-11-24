# IAN — Portfolio

A personal portfolio and journal built with HTML, CSS, JavaScript, and a small
Node build pipeline.
The design is a paper-and-ink "field journal": typewriter display type, a warm
paper canvas, a colour-coded section rail, and a desk panel with a clock and
calendar.

The published site stays framework-free. Node is used to pre-render content,
generate note pages and feeds, and optimize gallery images.

---

## Quick start

Use Node 22 or newer. Install dependencies, build the static site, and preview
the generated output:

```powershell
npm ci
npm run build
npm run preview
```

Then visit <http://localhost:4173>. For a quick source-only preview, run
`python -m http.server 8000`; clean note URLs and generated SEO files are only
available after `npm run build`.

### Admin access

The local draft editor is available by appending `?admin=1`:

```
http://localhost:4173/index.html?admin=1
```

The GitHub-backed Decap CMS is at `/admin/`. It needs a separately configured
GitHub OAuth authentication service; do not put an OAuth client secret or
personal access token in this repository or browser code. The local editor and
its JSON export remain available as a fallback.

---

## What is in the box

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero + field notes |
| `profile.html` | About, details and profile notes |
| `education.html` | Education timeline |
| `experience.html` | Experience timeline, with document links |
| `skills.html` | Skills and hobbies |
| `survey.html` | Multi-step feedback form (Formspree, with mailto fallback) |
| `games.html` | Three browser experiments |
| `games/*.html` | Reaction time, Stroop test, memory match |
| `notes.html` | Searchable, category-filtered archive grouped by year |
| `notes/<slug>/index.html` | Build-generated, shareable note pages |
| `404.html` | Not-found page |
| `chrome.js` | Shared header, rail, desk widget, footer and overlays |
| `portfolio.js` | Ordered loader for the browser feature files |
| `js/portfolio/` | Browser content, rendering, editor and interaction files |
| `style.css` | Design system and all page styles |
| `games/game.css` | Self-contained dark "lab" styles for the games |
| `content.json` | Published content |
| `scripts/build.mjs` | Static HTML, sitemap/RSS and responsive image generator |
| `admin/` | Decap CMS entry point and GitHub backend configuration |
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

There are two editing paths:

1. **Decap CMS** — edit `content.json` in `/admin/`; after OAuth is configured,
   CMS changes commit to the GitHub `main` branch and trigger the Pages build.
2. **Local draft** — edit in `?admin=1`, stored in `localStorage` until exported.

The local editor remains useful for offline drafting and as an export/backup
path. To publish a local draft:

1. Open `?admin=1` → **Export JSON**.
2. Replace `content.json` in the project folder.
3. Commit and push to `main`.
4. After the build deploys, press **Reset** in the editor to re-sync the browser.

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
  "photos": [{ "date": "…", "memo": "…", "alt": "…", "image": "photos/polaroid/…jpg", "labels": ["memory"] }],
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
- Each note should have a unique, URL-safe `slug`; the build derives one when
  omitted. Individual notes are published at `/notes/<slug>/`.
- A survey field is one page of the form; blocks inside a field can be
  `heading`, `paragraph`, `text`, `textarea`, `select`, `radio` or `rating`.
- Gallery images require descriptive `alt` text separate from the caption.

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
  them as a fallback. The build generates responsive AVIF/WebP variants.
- **Survey** — intro and thank-you copy, multi-page fields and blocks, active
  survey switch.
- **Labels** — colour palette used by note chips and the calendar.
- **Site** — site title, theme and the featured home note.
- **Data** — storage usage, backup download, copy JSON, validation checklist and
  reset.

The local editor never writes to disk directly. Decap CMS at `/admin/` is the
online publishing path; the GitHub backend is connected through Decap Turbo.

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

The included GitHub Actions workflow builds and deploys `dist/` to GitHub Pages
when changes reach `main`. Enable **GitHub Pages → Build and deployment →
GitHub Actions** in repository settings.

- Set the repository secret `FORMSPREE_ID` to your Formspree form ID. Until it
  is configured, or if the network request fails, survey submission falls back
  to a mail draft.
- `SITE_URL` defaults from the GitHub remote for local builds. Set it explicitly
  for custom domains; it is used for canonical tags, sitemap, RSS URLs, and the
  generated Decap `site_url` and `display_url`.
- The Decap CMS GitHub backend needs an OAuth service; GitHub Pages does not
  provide one. A standard option is Netlify's OAuth gateway: register a GitHub
  OAuth app with callback `https://api.netlify.com/auth/done`, then install the
  GitHub provider with that app's client ID and secret in Netlify's project
  security settings. Decap's GitHub backend uses Netlify by default. For a
  different self-hosted provider, configure `base_url` and, if needed,
  `auth_endpoint` in `admin/config.yml`. Never commit the client secret.
- `npm test` builds the site and runs Playwright smoke tests. CI installs
  Chromium and runs the same suite before deploying.

Other static hosts can serve `dist/`; configure their build command as
`npm ci && npm run build` and publish directory as `dist`.

---

## Notes for future work

- Browser behavior is split into feature files under `js/portfolio/`, loaded in
  order to preserve shared legacy state. Converting those scripts to isolated
  ES modules is a separate follow-up.
- The admin gate is cosmetic. Content is browser-local and unauthenticated by
  design; do not store anything private in `content.json`.
- The build outputs pre-rendered page and note content, canonical/Open Graph
  metadata, `sitemap.xml`, and `rss.xml`.

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for the prioritised roadmap.
