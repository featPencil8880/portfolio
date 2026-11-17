# Substantial improvements

Status of the publishing, rendering, notes, testing, photo and survey work.
Remaining ideas are listed below the completed items.

---

## 1. Give the editor a real publishing path — **implemented; OAuth setup required**

Added Decap CMS at `/admin/`, configured to edit `content.json` in the GitHub
repository's `main` branch. Successful CMS changes are committed by Decap and
the GitHub Pages workflow rebuilds the site. The browser-local editor and JSON
export remain available as a backup.

GitHub Pages does not host a GitHub OAuth server. Deploy a Decap-compatible
OAuth provider and configure `base_url` (and, if needed, `auth_endpoint`) in
`admin/config.yml` before using CMS login. Never place a GitHub token or OAuth
client secret in client-side files.

## 2. Render content at build time — **implemented**

`npm run build` runs `scripts/build.mjs` and writes the static site to `dist/`.
The generator prerenders the profile, education, experience, skills, notes
archive and individual note articles. It also writes per-note canonical/Open
Graph/JSON-LD metadata, `sitemap.xml`, and `rss.xml`. Browser JavaScript remains
available for interactions and as progressive enhancement.

`SITE_URL` can override the URL derived from the GitHub remote; set it for
custom-domain deployments.

## 3. Add real note URLs and an index — **implemented**

Notes now have shareable routes at `/notes/<slug>/`, full article HTML, metadata,
pagination, and links from the archive and note cards. The build derives a slug
when one is missing and fails on duplicate slugs. The reading overlay remains a
fast preview.

## 4. Break `portfolio.js` into modules — **feature split implemented; ESM migration remains**

The former monolithic file is split into ordered feature files in
`js/portfolio/`. `portfolio.js` is now a small loader. The files remain classic
scripts to preserve existing cross-section shared state; converting them to
isolated ES modules requires a separate dependency/API refactor.

## 5. Test the important paths — **implemented**

Playwright tests cover static HTML without JavaScript, primary-page startup,
clean note routes and metadata, Formspree survey submission, CMS configuration,
and generated image variants. The GitHub Pages workflow runs the browser tests
before deployment.

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

## 7. Upgrade the photo pipeline — **implemented**

The Node build generates AVIF and WebP size variants for local gallery images
and records them in `photos/manifest.json`. Gallery markup uses `<picture>`,
`srcset`, and `sizes`, with the original file as fallback. The editor and Decap
schema have a separate required alternative-text field; captions are no longer
used as alt text. Existing content needs meaningful alt text entered by the
site owner.

## 8. Replace `mailto:` survey submission — **implemented; Formspree ID required**

The survey posts JSON to the Formspree endpoint configured by the build-time
`FORMSPREE_ID` environment variable. A thank-you state appears only after a
successful response. If the endpoint is missing or unreachable, the site offers
the existing mailto path as a fallback; HTTP errors remain visible and preserve
the visitor's answers. Set the GitHub Actions secret `FORMSPREE_ID` to enable
delivery after deployment.

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

## What was fixed in the previous cleanup

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
