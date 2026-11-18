---
name: etch-site-maintenance
description: Use when auditing, cleaning up, QA-testing, migrating content into, copying sections between, updating, or preparing to launch or deploy an existing Etch Studio or EtchWP site — unused components or selectors, hard-coded colors, missing alt text or SEO, unpublished or conflicting paths, old-site redirects, ACSS upgrades, or "is this site ready?" questions.
---

# Etch site maintenance, QA and launch

Read-only first, then the smallest fix, then proof. Pair with `etch-authoring`
and the platform skill (`etch-studio` or `etchwp`).

## 1. Audit (read-only)

Run `references/audit-script.js` as an Etch Studio MCP `eval` body, or through
the connector (`npx @digital-gravy/etch-connector eval -t "<tab>" -f
references/audit-script.js`). It never saves. It returns: documents scanned,
plain `img` elements, unused components, unused and empty class selectors,
classes with no selector, selectors with hard-coded colors or raw px/rem,
stylesheets holding class rules, and, where the host supports them: path
statuses, routes missing title/description, `noindex` pages, uncollected assets,
images without alt, data sources, templates, ACSS state. Each check runs on its
own: a failing one reports `{ error }` and the rest still run.

Read the output with judgment:

- `unusedSelectors` includes framework selectors registered in Etch (ACSS
  `.btn--*`, `.link--*`, `.section--*`, and any component library's classes).
  They aren't dead code.
- `hardCodedColors` / `rawRemOrPx` include vendor and Etch default styles
  (`:where([data-etch-element…])`). Fix only the project's own classes.
- `classesWithoutSelector` is usually ACSS utilities; confirm each in the ACSS
  class list before calling it a problem.
- A component counted as unused may sit in a document the audit couldn't open:
  check before deleting.

More inventory helpers (tree summaries, data-source and component usage maps):
the toolkit's `shared-helpers/etch/audit.js` (see
`etch-authoring/references/toolkit-kit.md`).

## 2. Fix

- Fix only what the request covers; report the rest.
- Hard-coded values → ACSS tokens (`automaticcss`). Class rules found in a
  stylesheet → move them into `etch.styles` records, then remove them from the sheet.
- Missing alt → `etch.assets.updateAsync(id, { alt })` (describe the image; `''`
  only for decorative).
- Copying between sites → the blocks copy/paste API only
  (`etch-authoring/references/cross-site-copy.md`); no hand-rolled export/import.
- Content migration from an old site: inventory every old page and URL first, and
  map each to a new path or a redirect.

## 3. Launch checklist

Etch Studio:
- [ ] `etch.routes.getPathsAsync()`: no `shadowed`, `conflict` or `invalid` paths.
- [ ] Every moved URL has a route redirect (`{ to, status: 301 }`; default is
      302; 2,000 max). Paths a route can't hold (dots, capitals) aren't covered by
      Studio and must be redirected at the host.
- [ ] 404 page set on `/` (`notFoundId`); per-section 404s where useful.
- [ ] `listSeoAsync()`: titles, descriptions, canonical, social image, favicon,
      `searchVisibility` set as intended.
- [ ] Forms submit end to end to their third-party endpoint.
- [ ] Site under the 25 MB deploy limit; compress large images.
- [ ] After deploy, check key URLs and a sample of redirects on the published site.

EtchWP:
- [ ] `wp acss doctor` / `wp acss status` clean.
- [ ] Templates cover `index`, `single`, `archive`, `404` as the site needs.
- [ ] Redirects for moved URLs; permalinks and sitemap correct.
- [ ] Forms submit and deliver.

## 4. Prove

Done = checked on the published result: HTTP status codes, a screenshot (MCP
`screenshot`), and the audit re-run showing the finding gone.

## Common mistakes

| Mistake | Instead |
|---|---|
| Deleting "unused" framework selectors | Clean the project's own classes only |
| Calling it done after `saveAsync()` on Studio | Saving isn't publishing; deploy and check the live URL |
| Fixing everything the audit found | Fix what was asked; report the rest |
