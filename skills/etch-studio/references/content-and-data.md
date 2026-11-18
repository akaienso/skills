# Etch Studio: content types, data sources, queryContent()

Studio-specific. Shared expression and loop syntax belongs to the authoring reference. Read the project's built-in `etch-studio` guide first (`etch.skills.get('etch-studio').content`). This file adds what the web docs say beyond it.

## Model in one paragraph

- A **content type is a kind of page**, not a separate table. "Course" items are pages: they have blocks, can be the homepage, render and get URLs (but only through a route).
- The **type holds field definitions**. The **page (item) holds values**. Change a definition once and every item picks it up.
- Every project has type `page`. It can't be deleted (deleting a type deletes its items).
- **Data is a data source**, and a loop is one consumer of it. In Studio, `data('key')` works anywhere an expression is allowed: text, attributes, loop targets, component props and conditions.
- All data resolves **at build time**. The deployed site is static. To publish new content or fresh API data, deploy again.

Source: https://docs.etchwp.com/studio/content-types, https://docs.etchwp.com/studio/data-sources

## Content types (UI facts)

- Create a type in Content Hub → Content tab → **+** next to "Content Types". **Key** = machine name. It must start with a letter, use lowercase letters, digits, `-` and `_`, and be unique.
- WIP (web docs): a type can't be renamed or deleted **from the UI** yet. Treat the name and key as permanent there. The API has `updateTypeAsync` / `deleteTypeAsync` (see `public-api-studio.md`).
- Create an item with the footer row: a title plus an optional slug (blank = derived from the title). "Create <Type>" is named after the type.
- UI field types (web docs): Text, Number, Boolean, Dropdown, Checkbox, Radio. For Dropdown, Checkbox and Radio, enter one choice per line as `Label : value` (a line with no colon uses its text as both). Boolean has a default value. The Validation and Conditions tabs are not enabled yet.
- Field presets, copying fields between types and "delete all fields" are in the ··· menu next to the type name in the Fields view (changelog 2026-11-03).
- New Content Hub fields get **camelCase keys** (`heroImage`). Hyphens are no longer allowed in field keys (changelog 2026-10-29).

> Conflict: the web Content Types page lists 6 UI field types. The built-in guide and the API list `text, textarea, number, link, email, boolean, select, relationship, relationshipList, image` (plus the read-only `relationshipBacklink`). The built-in guide wins for scripting.
> Conflict: the web docs say renaming a field key orphans every item's value. The built-in guide (`updateFieldAsync(..., { key })`, "values follow") and the Content API page ("keeps every item's value under the new key") say values follow. The built-in guide wins. The UI path may still behave as the web page says (unverified).
> Conflict: the API page allows `-` in field keys. The built-in guide (letters, numbers, underscores) and the changelog (no hyphens) disagree with it. Use camelCase or underscores.
> Conflict: the web docs WIP note says an item's own field values don't reach its render context yet (no `{this.fields.level}` on its own page). The routing docs use `{this.fields.*}` in route segments and templates, and the built-in guide reads `data('firm').fields.name`. Verify on the canvas before relying on `this.fields` in a page's own blocks.
> Note (Content API page): the `image` field type is available only when **Settings → Experimental → Image Content Field** is on. The built-in guide lists `image` without that caveat.

Source: https://docs.etchwp.com/studio/content-types, https://docs.etchwp.com/studio/public-api/content, https://docs.etchwp.com/studio/changelog

### Recommended conventions (from the Gearyco agentic toolkit)

- A field that stores a URL path segment is named **Slug**, with key `slug`, and is read in a route as `{this.fields.slug}`. Don't use `url_segment`, `url` or `permalink`. Inspect the type first and reuse or rename an equivalent field instead of adding a duplicate.
- Be aware that the routes decide `this.slug` (see `routing-seo-templates.md`). A `fields.slug` is a separate custom field, and the two can disagree.

Source: https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch/blob/main/agent-docs/etch-studio.md

## Data sources

| Type | metadata (API) | Notes |
|---|---|---|
| `json` | `{ data }` (required, any shape) | Only valid JSON is saved. A half-typed edit keeps the last good value. Stored with the project, so no external call at build. |
| `api` | `{ url?, method?, headers? }`, with headers as `[name, value]` pairs | GET or POST (POST has **no body field**). The response is parsed as JSON and served as-is (no unwrapping). Non-2xx = failure. No URL = empty, not an error. The UI can import a cURL command. |
| `js` | `{ code? }` (a function body) | Sandboxed. Inputs are only `args` and `queryContent()`. |

- The key is auto-derived in camelCase from the name. Renaming the **name** is free. Changing the **key** breaks every `data('old')` until you update them (they resolve to `undefined`).
- The Data Manager sidebar groups sources as JSON DATA / EXTERNAL APIS / JAVASCRIPT. Right-click a source to Rename (display name only), Duplicate or Delete. The preview tree copies a path when you click a row. **Reload** clears the cache and re-resolves.
- **API source in the builder** is fetched by your browser, so CORS applies and localhost-only endpoints are unreachable. **At deploy or download** it is fetched on the server and baked into the HTML.
- **API headers are stored unencrypted and visible to anyone who can open the project.** Use read-only, narrowly scoped keys. Never store secrets.
- A JS source **cannot** make HTTP requests, so it can't wrap or reshape an API source. `data()` is not available inside a source.
- Arguments: `data('key', a, b)` passes them to JS sources as `args`. JSON and API sources ignore them, but each distinct argument set is cached separately.
- **Caching:** resolved once per key + args per render. Saving the source or clicking Reload invalidates it.
- **Failure on a page is survivable:** a throwing source resolves to nothing, the page renders with that value empty, and the Data Manager shows why.

> Conflict: the data sources page says failure is "survivable". The routing docs and the built-in guide say that **a source served by a dynamic route that fails to resolve fails the deploy**. Both hold: a failure in page content renders empty, while a failure in a route's source stops the build.

### JS sandbox limits

| Limit | Value |
|---|---|
| Execution time | 1 s (time spent waiting on `queryContent()` isn't counted) |
| Memory | 16 MB |
| Stack | 512 KB |

There is no `fetch`, XHR, `window`, `document`, storage, `require` or `import`. Standard JS (`Array`, `Date`, `JSON`, async/await) is available. The return value must be JSON-serialisable: a function or symbol is rejected. Empty code = empty value, not a failure. Every keystroke in the editor is saved, even code that doesn't run yet. The editor's snippets are "Query Pages" and "Query by Type".

Source: https://docs.etchwp.com/studio/data-sources, https://docs.etchwp.com/studio/data-sources/json, https://docs.etchwp.com/studio/data-sources/api, https://docs.etchwp.com/studio/data-sources/javascript

## queryContent(options)

Available **only inside a JS data source**. Async. It runs in the database, so `limit` is cheap.

| Option | Type | Default / notes |
|---|---|---|
| `type` | string | Content type key. Default `page`. |
| `where` | object | Bare value = equals. Operators: `not`, `in` (≥1 value), `contains` (string), `gt`/`gte`/`lt`/`lte` (numbers). Multiple keys combine with AND. |
| `orderBy` | string | Column or `fields.<key>` |
| `order` | `'asc'` \| `'desc'` | |
| `limit` | number | `-1` = all |
| `offset` | number | |
| `relationDepth` | 0–5 | Default 3. `0` = ids only. >5 = `invalid query`. |
| `omit` | string[] | Drop own keys from every item, linked items included. `id` always stays. Omitting `fields` also skips relation resolving. Omitted keys still work in `where` and `orderBy`. |

- Filterable and sortable: the columns `id, slug, title, contentTypeId, createdAt, updatedAt`, plus `fields.<key>`. **A field without the `fields.` prefix is an error.** A misspelt `fields.x` returns an empty result, not an error.
- An item with no value for a field matches nothing, not even `not`.
- Returns an array of `{ id, slug, title, contentTypeId, content, fields:{…}, createdAt, updatedAt }`. Read fields as `item.fields.level`, never `item.level`. `content` is the decoded block tree: render it with `{@render item.content}`, otherwise `omit: ['content']`.
- Relationship fields come back as full records (block trees included), 3 levels deep by default. On a dense model that can exhaust the 16 MB sandbox, so **always pass `omit: ['content']` and a low `relationDepth` for menus and listings, and return a compact projection.**
- Error messages: `content type "x" does not exist`, `invalid query: Unknown field "level" — available fields: …`, `invalid query: limit: …`, and `queryContent failed: …`. Wrap the call in try/catch to degrade to `[]`.

```js
// listing: compact projection
const rows = await queryContent({ type: 'course', relationDepth: 1, omit: ['content'],
  where: { 'fields.duration': { lte: 60 } }, orderBy: 'fields.duration' });
return rows.map(c => ({ title: c.title, instructor: c.fields.instructor?.title }));
```
```js
// one record by argument, used as data('pageBySlug','about').title
const [slug] = args; const [page] = await queryContent({ where: { slug } }); return page;
```

> Doc bug: the web "grouping for nested loops" example groups by `course.level`. Per the same docs it must be `course.fields.level`.
> Conflict: the querying page links with `href="/{course.slug}"`. The built-in guide says **do not build links from `slug`**, because items served only by a dynamic route have no slug. Build links from the route's segment expression (e.g. `/team/{m.title.toSlug()}/`) and check them against `etch.routes.getPathsAsync()`. The built-in guide wins.

Source: https://docs.etchwp.com/studio/content-types/querying-content

## How data reaches pages and loops

- In an expression: `{data('siteConfig').tagline}`. Loop: `{#loop data('courses') as course, index}…{/loop}`. Nested data loops directly: `{#loop category.courses as c}`.
- Path syntax: the web docs show `data('courses').0.title`. **The built-in guide says index with brackets: `data('courses')[0].title`, and use `item['full-name']` for non-identifier keys. The built-in guide wins.**
- For a page that reads one record, have the source return that record (`data('firm').fields.name`).
- In the loop properties panel, "Select Data Source" inserts `data('…')`. A team-pages walkthrough loops a content type directly. Creating a type auto-creates a same-key JS source, so `data('employee')` works.
- Programmatic loops: an `etch/loop` block with `target` (expression), `itemId`, and optional `indexId`. An inline literal array target must be valid JSON (double quotes). `range(1, 10)` and paths like `item.tags` are valid targets.
- Fallbacks in expressions: `{this.fields.metaTitle || this.title}` and `??` are supported (changelog 2026-10-29).
- A route can turn a data source into pages (one per array element). See `routing-seo-templates.md`.
- Run `etch.dataSources.resolveAsync(key, ...args)` **before** authoring property paths. Never guess a shape.

> Conflict: the toolkit's AGENTS.md says "no inline `??` fallback in dynamic data". The Studio changelog (2026-10-29) added `??` and `||`. On Studio, the changelog wins.

Source: https://docs.etchwp.com/studio/data-sources, https://docs.etchwp.com/studio/public-api/data-sources, https://docs.etchwp.com/studio/routing/team-pages, https://docs.etchwp.com/studio/changelog
