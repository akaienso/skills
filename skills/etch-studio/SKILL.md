---
name: etch-studio
description: Use when building or maintaining a site in Etch Studio (the standalone, non-WordPress Etch product) — content types, data sources, `queryContent`, routes, templates, SEO, redirects, 404 pages, assets, forms, client editing, Download Site or Deploy — or when using the Etch Studio MCP tools (`list_projects`, `open_project`, `eval`, `upload_assets`, `request_control`, `close_project`).
---

# Etch Studio

Studio renders a project to a static site (HTML, CSS, JS, assets). It is **not
WordPress**: no PHP, post types, taxonomies, `WP_Query`, Loop Manager, hooks or
`etch.fields`. Pair with `etch-authoring` (shared build rules) and
`automaticcss` when ACSS is on.

## Session protocol (MCP)

1. `list_projects` → `open_project { tenant, project }`, where `project` is the
   project **id** from that list, not its name: a name comes back as the bare
   string `No such project`, with no error code. Keep the handle — it can expire
   mid-session (seen after ~2.5 minutes of continuous calls, well inside the idle
   window), and the fix is to `open_project` again and carry on.
2. Read `othersPresent`. Someone else in: ask the user before `request_control`.
   Only the user's own tab (`isYou`): call it. Taking control reloads the builder,
   so take it **before** editing. Your own session also appears there as
   `{ name: "OpenBot", isYou: true }`, which is not someone else.
3. `get_guide` once; then read every `etch.skills.list()` entry. Read
   `etch.environment.capabilities` and branch on them. On the current Studio build
   `capabilities.loops` and `capabilities.fields` are `false`: the namespaces exist
   but every call throws `EtchApiError NOT_AVAILABLE`. Loops and fields belong to
   EtchWP, not Studio.
4. Work in `eval` scripts that return compact summaries. Builder idles out after
   ~10 minutes without a call; unsaved buffered edits are lost.
5. `await etch.saveAsync()` for blocks and styles. Finish with
   `close_project { handle, save: true }` (or `hand_over_control`) unless told not
   to save. Then report what was saved.

Via a person's tab (Etch Connector) instead: don't save unless they ask. Details:
`references/connector-and-mcp.md`.

## How Studio models a site

| Need | Studio way |
|---|---|
| Repeat content | Data source (`json`, `api`, `js`) + `etch/loop` with `target: "data('key')"` |
| Structured records | Content type (a kind of page) via `etch.content`; auto-creates `data('<type>')` |
| Query own content | `js` source: `return await queryContent({ type, where, orderBy, limit, omit: ['content'], relationDepth })` |
| Shape of data | `await etch.dataSources.resolveAsync(key)` before writing property paths |
| URLs | Route tree (`etch.routes`): static `about`, group `(marketing)`, dynamic `{this.title.toSlug()}` |
| Layout shell | Template = page of a template content type, with `etch/render target:'this.content'` inside `<main>`, named `index` |
| SEO | On the route: `title`, `description`, `canonical`, `socialImage`, `searchVisibility`, `redirect`, `notFoundId` |
| Old URL moved | Route redirect `{ to, status: 301 }` (default is 302); max 2,000 per site; destination literal, no expressions |
| Old URL a route can't hold | Static segments allow only lowercase letters and digits joined by `-`/`_`, so a path like `/about-us.html` can't be a route and can't carry a Studio redirect. The Studio docs don't cover this case: it has to be handled at the host, outside Studio |
| 404 page | `etch.routes.updateAsync(rootId, { notFoundId: pageId })`; sections may set their own |
| Images/files | `etch.assets` (or MCP `upload_assets` with a file path); always `alt`; put every asset in a collection |
| Forms | No forms API: `<form action>` to a third-party endpoint (Formspree, Basin, Web3Forms, embed providers) |
| Publish | Deploy button (Cloudflare Worker) or Download Site (`site.zip`) |

Everything dynamic is resolved **at build time**: API data and new records reach
the live site only on the next deploy.

## Rules that bite

- Links: never from `slug` (empty on dynamic routes). Spell paths from the route
  segment and confirm with `etch.routes.getPathsAsync()`; `shadowed`, `conflict`,
  `invalid` paths are not published.
- A route serving a data source needs a template, or its paths are `invalid`. A
  data source that fails to resolve fails the build.
- Inline loop arrays must be JSON (`["a","b"]`); index with brackets
  (`data('x')[0].title`).
- Don't write `<title>` or meta description in `etch/head` (overrides route SEO),
  except on the 404 page.
- Slug field convention (toolkit): a content field holding a URL segment is named
  **Slug**, key `slug`, used as `{this.fields.slug}`.
- Block `script.code` is plain JS; never base64 it (toolkit).
- Deploy size: the whole site must stay under 25 MB (Cloudflare Workers static
  assets); a deploy over the limit is refused with the actual size. Compress large
  images in the Asset Manager.
- Saving is not publishing. Deploy (or Download Site) is what puts changes live.
- ACSS settings apply to every page of the site (see `automaticcss`).

## References

- Studio's own agent guide is not copied here: read it live in the project with `etch.skills.get('etch-studio').content` (it wins over these files)
- `references/content-and-data.md` — content types, fields, data sources, `queryContent`
- `references/routing-seo-templates.md` — routes, templates, SEO, redirects, 404s
- `references/assets-forms-deploy.md` — assets, forms, deploy, client editing
- `references/connector-and-mcp.md` — MCP server, Etch Connector CLI, toolkit runner
- `references/native-components.md` — Studio native components
- `references/public-api-studio.md` — Studio namespaces, signatures, error codes

## Common mistakes

| Mistake | Instead |
|---|---|
| "Studio can't loop" / looking for Loop Manager | Data source + `etch/loop` |
| `etch.fields`, `etch.loops`, post types, taxonomies | `etch.content` types and fields; data sources |
| Writing server code for a form | Studio handles no submissions: point the form at a third-party endpoint |
| A moved page left without a redirect | Route redirect `{ to, status: 301 }` |
| Editing before `request_control` | Take control first; it reloads the builder |
| Assuming a page is live after saving | Deploy, then check the published URL |
