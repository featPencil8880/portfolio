# Substantial improvements

A prioritised list for turning this from a very good static portfolio into a
site that is easier to publish, easier to find, and safer to grow. Each item has
an impact/effort read so you can pick by the time you have.

---

## 1. Give the editor a real publishing path — **high impact / medium effort**

Today the editor is a beautiful local draft: changes live in `localStorage`, and
publishing means export → replace `content.json` → commit → reset. Every step is
a chance to publish the wrong file.

Options, cheapest first:

1. **GitHub API commits from the editor.** A small serverless function holds a
   fine-grained token; the editor posts the new `content.json` and the function
   opens a commit. GitHub Pages redeploys automatically. ~150 lines of code.
2. **Git-based CMS** (Decap CMS, Keystatic, Sveltia). Keep the JSON shape, get a
   real login and editorial workflow. Least custom code, but a new UI to learn.
3. **Hosted CMS + API** (Sanity, Contentful, Supabase). Best if the site grows
   beyond one author or needs scheduling, roles or drafts.

Whichever you choose, keep the current export as an escape hatch.

## 2. Render content at build time — **high impact / medium effort**

Every visitor currently downloads the skeleton and waits for `content.json`
before the portfolio appears. Search engines index the skeleton, not the notes;
link previews are generic. That is a real cost for a portfolio whose job is to
be found.

Move to a small static-site generator (Astro, Eleventy, or a ~100-line Node
script) that turns `content.json` into HTML at build time:

- Education, experience, skills and every note become real HTML.
- Per-note pages (`/notes/where-do-we-exist`) with their own title, description
  and Open Graph tags.
- A sitemap and RSS feed fall out for free.
- The JavaScript becomes progressive enhancement instead of a requirement.

Astro is the closest fit: it keeps plain HTML/CSS/JS, ships zero JS by default,
and can still hydrate the calendar, games and editor.

## 3. Add real note URLs and an index — **high impact / low effort**

Right now a note opens in a reading overlay on the page that contains it. You
cannot link to a specific note, bookmark it, or share it.

- Give each note a slug (`/notes/<slug>` or `?note=<id>` with a server rewrite).
- Add `/notes` with full-text search and tag pages.
- Add `rel="canonical"`, `og:title`, `og:description` per note.
- The reading overlay can stay as a fast preview.

This is the single highest-leverage content change: it turns the journal into a
publishable body of writing rather than a set of cards.

## 4. Break `portfolio.js` into modules — **medium impact / medium effort**

The file is well sectioned but 4,400 lines in one scope. That makes every change
riskier than it needs to be.

A natural split:

```
src/
  core/       state, storage, escaping, formatting
  content/    load, migrate, validate, save
  render/     hero, notes, education, experience, skills, survey
  editor/     posts, profile, resume, photos, survey, labels, site, data
  ui/         clock, calendar, settings, dialogs, sound
  main.js     boot
```

Introduce Vite or esbuild for bundling and a 30-second dev server. Add ESLint +
Prettier so formatting stops being a manual concern. Keep the build output as
plain files for the static host.

## 5. Test the important paths — **medium impact / low effort**

A handful of Playwright tests would have caught the empty education/skills/
survey pages and the broken admin tab wiring:

- every page renders its section (one assertion per page);
- editor opens, adds an education entry, exports valid JSON;
- note opens, paginates and closes;
- survey advances, validates and builds a mailto;
- no console errors and no horizontal overflow at 390/768/1440.

Run them in CI on push. This is cheap insurance and documents intent.

## 6. Finish the accessibility pass — **medium impact / low effort**

Good footing already: skip link, focus-visible styles, dialog focus trap,
keyboard-activatable note cards and calendar days, focus restoration after
reading mode, an `aria-live` editor toast, contrast-checked palette and reduced
motion.

Still to do:

- **Calendar keyboard travel.** Days respond to Enter/Space; add arrow-key
  movement between days and announce the selected date.
- **Reading mode** should also set the document title to the note title.
- Check the survey rating group with a screen reader: five unlabelled radios
  need a `fieldset`/`legend` or `aria-labelledby`.
- Add `autocomplete` and `inputmode` hints to email/text fields.
- Run `axe-core` or Lighthouse against every page once and fix the remainder.

## 7. Upgrade the photo pipeline — **medium impact / medium effort**

The gallery is charming but the images are served as full-size JPEGs.

- Resize to a max edge (the editor already does this) and export **WebP/AVIF**
  with a JPEG fallback via `<picture>`.
- Generate `srcset`/`sizes` so phones do not download desktop images.
- Add an **alt text** field to the photo editor (currently the memo is reused).
- Read EXIF orientation and write the capture date automatically.
- Consider a single `photos/manifest.json` or a build step so the gallery does
  not need to be listed by hand.

## 8. Replace `mailto:` survey submission — **medium impact / medium effort**

`mailto:` depends on the visitor having a desktop mail client and gives you no
confirmation that anything arrived. A tiny endpoint (Netlify Forms, Formspree,
Cloudflare Worker + Resend) gives you:

- reliable delivery and a copy in your inbox;
- spam protection (honeypot + rate limit);
- a real thank-you state instead of a hopeful one;
- basic metrics (completions, drop-off per field).

Keep `mailto:` as a fallback when the endpoint is unreachable.

## 9. Make the games feel part of the site — **low impact / low effort**

The dark lab is a deliberate contrast; keep it, but connect it:

- Link the game results back to the relevant note ("why reaction time matters").
- Show a short "what this measures / what it doesn't" panel after each game.
- Add a shared footer link back to the portfolio and the same `Courier Prime`
  type scale (already done).
- Consider recording anonymous aggregate results (no accounts, no PII) for a
  small "community data" chart. That would be a genuinely distinctive portfolio
  piece.

## 10. Performance and delivery — **low/medium impact / low effort**

- Preload the two Courier Prime faces used above the fold; drop the italic/bold
  italic files if unused.
- Subset the fonts to Latin.
- Add `loading="lazy"` and `decoding="async"` to gallery images (partly done).
- Minify CSS/JS at deploy time; serve Brotli.
- Set `Cache-Control: max-age=31536000, immutable` for `/googleFonts`, `/icons`
  and `/photos`; keep `content.json` at `no-cache`.
- Measure with Lighthouse on a throttled connection; the current design should
  land in the high 90s once content is server-rendered.

## 11. Add privacy-friendly analytics — **low impact / low effort**

You cannot improve what you do not measure. A cookieless tool (Plausible,
Fathom, Umami, or a Cloudflare Worker counter) gives page views, referrers and
outbound clicks without a consent banner. Track: note opens, survey starts and
completions, résumé/document downloads, game plays.

## 12. Content and positioning — **high impact / ongoing**

The design now looks like a portfolio; the content can carry more weight.

- Add **two or three case studies** (a mentoring programme, a research project,
  a classroom intervention) with problem → approach → outcome.
- Add a downloadable **PDF résumé** next to the profile actions.
- Add a short **"now"** section (what you are reading, building, looking for) and
  keep it current; it is the cheapest way to make a portfolio feel alive.
- Replace placeholder dates (`20XX–20XX`) and the temporary email address before
  sharing the site.
- Write note titles for humans and search: a question or a concrete claim beats
  "Introduction".
- Add a **contact call to action** that states what you want (roles, coffee,
  collaboration) instead of "Leave feedback".

## 13. Security and privacy — **medium impact / low effort**

- The `?admin=1` gate is cosmetic. If the editor ever gets a write endpoint, put
  real authentication and CSRF protection in front of it.
- Never put private data in `content.json`; it is public by definition.
- Add a Content Security Policy once third-party scripts are known. The current
  site is compatible with a strict `script-src 'self'` policy except for inline
  event handlers (there are none) and the data-URI CSS (allowed via `style-src`).
- Add `Referrer-Policy: strict-origin-when-cross-origin` and
  `X-Content-Type-Options: nosniff` at the host.

## 14. PWA and offline — **low impact / low/medium effort**

A small service worker that caches the shell, fonts and the last `content.json`
makes the site installable and readable on a plane. The editor could then work
fully offline, which fits the field-journal concept nicely.

## 15. Print stylesheet for the résumé — **low impact / low effort**

A `@media print` pass is already stubbed. Turn the education, experience and
skills pages into a clean one-page PDF via the browser's print dialog. That
gives you a résumé that never drifts from the site.

---

## What was fixed in this pass

- Restored the education, experience, skills, profile and survey renderers that
  were silently doing nothing (missing containers and a boot-order bug).
- Moved the shared chrome into `chrome.js`; pages dropped from ~38 KB to ~4 KB.
- Rebuilt `style.css` around design tokens; removed duplicated rules, the
  unused "neobrutalism" naming and the specificity war between button styles.
- Added the missing admin tabs and forms (profile, education, experience,
  skills, site, data) plus search, duplicate, featured-note control, storage
  meter, validation, backup and copy tools.
- Fixed refresh redirecting every subpage back to home; fixed settings not
  working outside the home page; fixed duplicate element IDs.
- Made the calendar, notes, dialogs and editor keyboard-accessible, and raised
  the palette to WCAG AA contrast.
- Added the 404 page, favicon, meta/Open Graph tags and a local-font typeface.
