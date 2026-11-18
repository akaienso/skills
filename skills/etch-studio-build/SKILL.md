---
name: etch-studio-build
description: Build and maintain sites in Etch Studio (the standalone product, not WordPress) through window.etch - open a project, read the builder's skills, write block trees, data-source loops, components, routes, content types, assets and styles, then save. Use for any Etch Studio page, template, route or component task.
---

# Etch Studio build

Etch Studio is not WordPress. There are no post types, taxonomies, `WP_Query`, loop sources, WP logic, hooks or PHP. Studio's API still uses WordPress names (`postType`, `postId`), but the concepts behind them are Studio's own.

## Session flow (Etch Studio MCP)

1. `list_projects`, then `open_project { tenant, project }`. Keep the `handle` for every later call.
2. If `othersPresent` is not empty, ask the user before `request_control`.
3. Call `get_guide` once per session. Then read every skill: `etch.skills.list()`, and `etch.skills.get(name).content` for each, before the first write. The `acss` skill is present only when ACSS is on.
4. `eval` takes `{ handle, code }`. The argument is named `code`. Return compact summaries, not raw trees.
5. Blocks and styles are buffered until `await etch.saveAsync()`. Components, stylesheets, content, routes, data sources and assets persist at once.
6. Buffered work is lost after about 10 idle minutes. Save before long pauses.
7. Finish with `close_project { handle, save: true }` unless the user said not to save. Tell the user what was saved.

## Connector flow (open browser tab)

- `npx @digital-gravy/etch-connector tabs`, then `node shared-helpers/run.mjs <project> <task.js>`.
- Saving in an open tab is left to the user unless they ask for it.

## Data, loops and templates

- A loop is an `etch/loop` block. Its `target` is a data expression, for example `data('courses')`. In markup: `{#loop data('courses') as course}...{/loop}`.
- Data source types: `json` (`metadata: { data }`), `api` (`{ url, method?, headers: [[name, value]] }`), `js` (`{ code }`, extra args arrive as `args`).
- `etch.dataSources.createAsync`, `updateAsync` and `deleteAsync` persist at once. `list`, `get` and `findDataSource` read synchronously.
- Call `etch.dataSources.resolveAsync(key)` before you write property paths. Do not guess a response shape.
- Index with brackets: `data('courses')[0].title`, `item['full-name']`. Never `.0.`.
- Inline literal arrays must be valid JSON with double quotes. `['a']` fails.
- `queryContent()` in a js source: pass `omit: ['content']` for listings, and `relationDepth` (0 to 5) to limit linked records.
- `etch.loops` is not implemented. There is no loop manager. `etch.fields` is not implemented either. Calling them fails: the guide says `NOT_AVAILABLE`, and in this build `etch.loops.list` is "not a function". Catch both.

## Content types and routes

- A content type is a kind of page with field definitions. Use `etch.content.createTypeAsync({ name, fields: [{ key, name, type }] })`.
- Field types: `text`, `textarea`, `number`, `link`, `email`, `boolean`, `select`, `relationship`, `relationshipList`, `image`. Field keys start lowercase and hold letters, digits and underscores.
- Templates are content types created with `isTemplate: true`. Templates take no fields.
- Routes: `etch.routes.createAsync({ parentId?, segment, source?, templateId? })`. Dynamic segments look like `{this.title.toSlug()}`. Source is `{ postTypes }`, `{ postIds }` or `{ dataSources }`.
- After any route change, call `etch.routes.getPathsAsync()`. Paths with status `shadowed`, `conflict` or `invalid` are not published. A route that serves one page needs a template.
- Do not build links from `slug` on dynamic pages. Those pages have no stored slug. Use the route segment, for example `/locations/{loc.title.toSlug()}/`.
- SEO lives on the route: `etch.routes.updateAsync(id, { title, description, ... })`. Read it with `listSeoAsync()`.
- Head tags: put nothing in `etch/head` that sets `<title>` or a meta description. A hand-written tag overrides the route SEO. The 404 page is the one exception.
- Template body: an `etch/render` block with `target: 'this.content'`. Put the shared header and footer around it.

## Block JSON

- Every block needs `type`, `version: 1`, `context` (`{}` or `{ name }` for the Structure panel) and `children`.
- Text is its own `etch/text` block with a `text` field.
- `etch.blocks.update` cannot change `tag`. Use `etch.blocks.replace` for that.
- Sections: `attributes: { 'data-etch-element': 'section' }`. Put one container inside it with `data-etch-element="container"`.
- Images: `etch/dynamic-image` with `attributes: { mediaId: String(asset.id), alt, sizes }`. Use `alt: ''` for decorative images. Set `sizes` to the real render width.
- `<svelte:element>` does not exist in Studio. Do not use it.
- Check `etch.environment.blockTypes` before creating a type.

## Classes and CSS

- Giving a block a class creates a linked, empty selector. Fill it with `etch.styles.create('.class', css)`. It also fills an existing empty selector.
- Never append a class's CSS to a stylesheet. That leaves a linked empty selector plus an unlinked copy, and the deploy emits both.
- Nest inside a class's own record only for that class's states: `&:hover`, `@media`, and `.card--featured & { ... }`.
- Use `etch.stylesheets` only for CSS tied to no class: `@keyframes` in `Animations`, `@property`, and similar.
- To change an existing rule, use `etch.styles.update(id, { css })`, with the id from `etch.styles.list()`.

## Components

- `createAsync(name)` returns an id. `updateAsync(id, { properties, blocks })` sets the rest and persists at once. The stored key is PascalCase, so look it up again.
- Prop shape: `{ key, name, type: { primitive: 'string' }, default }`. Use `specialized: 'wpMediaId'` only for an image prop. In Studio that value holds an asset id.
- Slots: `etch/slot-placeholder` (with `slotName`) in the component. `etch/slot-content` in the instance.
- Instance: `etch/component` with `componentId` and `attributes` for its props.
- Change an instance: `etch.blocks.update(instanceId, { attributes: { ... } })`.

## Assets

- `etch.assets.uploadAsync({ data (base64, no data: prefix), fileName, alt, compress? })`. Always set `alt`.
- Put every asset in a collection. List collections with `listCollectionsAsync()` and reuse one that fits. Assign with `updateAsync(id, { collectionIds: [id] })`. Then check that no asset has empty `collectionIds`.
- Deleting an asset still used by an image field fails with `ASSET_IN_USE`.
- Upload from the MCP with `upload_assets` (file paths). From a terminal, use `etch-connector upload <file> --collection <id>`.

## Styling tokens

- With ACSS on, use `automaticcss-etch`. Change ACSS settings only when the user asks, because a settings change applies to the whole site.

## Forms

- Studio has no forms API. Point the form `action` at a third-party endpoint.

## Report back

- Say what was saved with `saveAsync` or `close_project`, and what is still unsaved.
