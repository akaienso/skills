# Etch Studio: Public API, Studio namespaces

Contract: `@digital-gravy/etch-public-api` (MIT, types plus a thin accessor). `etch.apiVersion` is `0.x`: experimental and may change without a major bump. **Feature-detect** instead of comparing versions. Shared namespaces (`blocks`, `styles`, `stylesheets`, `components`) are covered in the authoring reference.

Source: https://docs.etchwp.com/studio/public-api

## Availability on Studio

| Namespace | On Studio | Persistence |
|---|---|---|
| `blocks`, `styles` | yes | **buffered**: `await etch.saveAsync()` |
| `stylesheets`, `components` | yes | immediate |
| `content`, `routes`, `dataSources`, `assets` | yes (optional, capability-gated) | immediate |
| `navigation`, `ui`, `history`, `skills`, `ai` | yes | n/a (UI or read-only) |
| `loops` | **no**: throws `NOT_AVAILABLE` | n/a |
| `fields` | **no**: throws `NOT_AVAILABLE` | n/a |
| `deploy`, `presence`, `acss` | not documented | not documented. For `acss`, the built-in ACSS skill shows `listSettingsAsync` and `updateSettingsAsync` (ACSS has its own reference) |

- Capabilities on Studio (documented): `dataSources`, `templates`, `content`, `routes`, `assets` are `true`; `loops`, `fields`, `wpMedia` are `false`. `deploy`, `presence`, `acss`: not documented.
- Test with `=== true`. A capability missing from the map counts as unavailable. A missing `environment` means an old runtime (treat everything as available).
- `etch.environment.blockTypes` is the live list of constructible block types.
- `navigation.goTo('loop-manager')` → `NOT_AVAILABLE`.
- Every error is an `EtchApiError` with a `.code`: `BLOCK_NOT_FOUND, WRONG_BLOCK_TYPE, READONLY, INVALID_ARGUMENT, LOOP_NOT_FOUND, DATA_SOURCE_NOT_FOUND, STYLE_NOT_FOUND, STYLESHEET_NOT_FOUND, COMPONENT_NOT_FOUND, POST_NOT_FOUND, ROUTE_NOT_FOUND, CONTENT_TYPE_NOT_FOUND, FIELD_NOT_FOUND, ASSET_NOT_FOUND, COLLECTION_NOT_FOUND, ASSET_IN_USE, OPERATION_FAILED, NOT_AVAILABLE` (open-ended).

> Conflict: the web Public API intro lists `fields` among the immediately-persisting namespaces. In Studio, `etch.fields` is not implemented. Use `etch.content` fields instead (built-in guide wins).

Source: https://docs.etchwp.com/studio/public-api, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## etch.content (contract 0.13.0): all async, all persist immediately

| Method | Returns | Notes |
|---|---|---|
| `listTypesAsync()` | `EtchContentType[]` | Template types included, in creation order. |
| `getTypeAsync(key)` | type | |
| `createTypeAsync({ name, key?, isTemplate?, fields? })` | type | The key is slugged from the name. A non-template type also creates a same-key `js` data source. |
| `updateTypeAsync(key, { name?, key? })` | type | Items follow a key change. |
| `deleteTypeAsync(key)` | void | Deletes the type and **all its items**. `page` is refused. |
| `addFieldAsync(typeKey, field)` | type | |
| `updateFieldAsync(typeKey, fieldKey, patch)` | type | A new `key` keeps the values. Changing a relation's `target`, or changing it to a non-relation type, drops its links. |
| `removeFieldAsync(typeKey, fieldKey)` | type | |
| `listItemsAsync(postType?)` | `EtchContentItem[]` | `{ id, title, postType, slug?, fields }` |
| `getItemAsync(id)` / `createItemAsync({ postType, title, fields? })` | item | A new item is unpublished until a route serves it. |
| `updateItemAsync(id, { title?, fields? })` | item | `fields` merge per key. `null` clears a key. |
| `deleteItemAsync(id)` | void | |

- Field object: `{ key, name, type, required?, helpText?, placeholder?, defaultValue?, min?, max?, options?[{label,value}], trueLabel?, falseLabel?, showLabels?, target?, source? }`.
- Field types: `text, textarea, number, link, email, boolean, select, image, relationship, relationshipList`, plus `relationshipBacklink` (written by Etch, rename only).
- An image is not a fixed field: some types use an `image` field, others a plain `text` field holding an asset id (seen: `image_id` on the `news` type of mmpro/Rotary Blueprint). Call `listTypesAsync()` and read a type's fields before binding an image.
- Items carry **no blocks**. To edit their blocks, open them with `navigation.openPostAsync(id)` / `openTemplateAsync(id)` and use `etch.blocks`.

Errors:
- `CONTENT_TYPE_NOT_FOUND`
- `FIELD_NOT_FOUND`
- `POST_NOT_FOUND`
- `READONLY`: a backlink write
- `INVALID_ARGUMENT`:
  - a bad or duplicate key
  - fields on a template type
  - an unavailable field type (e.g. `image` while its experimental flag is off)
  - a relation to a template type
  - deleting `page`
  - changing `postType`
  - a refused value: required, bounds, email/link/image, or a link to the wrong type

Source: https://docs.etchwp.com/studio/public-api/content

## etch.routes (contract 0.12.0): async, persist immediately

| Method | Returns |
|---|---|
| `listAsync()` | `EtchRoute[]` (`{ id, parentId?, segment, kind, source:{postIds,postTypes,dataSources}, templateId? }`) |
| `getPathsAsync()` | `EtchRoutedPath[]` (`{ routeId, postId?, title?, path, status: published\|shadowed\|conflict\|invalid, reason? }`) |
| `createAsync({ segment, parentId?, source?, templateId? })` | route (goes under the root by default) |
| `updateAsync(id, patch)` | route. The patch takes `segment` (subtree moves), `parentId` (moves after the new siblings), `source` (replaced whole, **except that a missing `dataSources` keeps them**), and `templateId` (`null` = inherit) |
| `deleteAsync(id)` | void, removes the subtree (the root is refused) |
| `listSeoAsync()` / `getSeoAsync(path)` | **Built-in guide only.** Return shapes unverified. |

- SEO keys on `updateAsync` (built-in guide): `title, description, language, canonical, socialImage, faviconId` (asset id, root only), `searchVisibility: 'inherit'|'hidden'|'visible'`, `redirect: { to, status: 301|302 }` (never on the root), and `notFoundId`. `null` clears a key back to inheriting.
- Replacing a dynamic route's `source` keeps any records the author excluded in the Routes Manager.

Errors:
- `ROUTE_NOT_FOUND`
- `INVALID_ARGUMENT`:
  - a malformed segment
  - a source the route kind forbids
  - a sibling name clash
  - an unknown type or data-source key
  - a non-template `templateId`
  - a move into its own subtree
  - deleting the root
- `OPERATION_FAILED`

Source: https://docs.etchwp.com/studio/public-api/routes, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## etch.dataSources (contract 0.11.0)

| Method | Sync/async | Persists |
|---|---|---|
| `list()` / `get(key)` / `findDataSource(query)` (fuzzy, best match first) | **sync** | n/a |
| `createAsync({ key, name, type, metadata })` | async | immediately |
| `updateAsync(key, patch)` (a `key` change breaks every `data('old')`) | async | immediately |
| `deleteAsync(key)` | async | immediately |
| `resolveAsync(key, ...args)` | async | n/a. Returns what `data(key, ...args)` returns. A failing source gives `undefined`, not a rejection. |

- `metadata` by type: `json {data}`, `api {url?, method?, headers?: [name,value][]}`, `js {code?}`. Unknown keys are refused.
- A write drops the cached value.

Errors:
- `DATA_SOURCE_NOT_FOUND`
- `INVALID_ARGUMENT`: a malformed source, an unserved type, bad `metadata`, or a taken key

Source: https://docs.etchwp.com/studio/public-api/data-sources

## etch.assets (contract 0.14.0): async, persist immediately

| Method | Notes |
|---|---|
| `listAsync({ collectionId?, mimeType? }?)` | `collectionId` includes nested collections. `mimeType` may be a prefix like `"image/"`. |
| `getAsync(id)` | |
| `uploadAsync({ data, fileName, mimeType?, alt?, collectionIds?, compress? })` | `data` is base64 with no `data:` prefix, or a Blob in-page. The file name is slugified. |
| `updateAsync(id, { fileName?, alt?, collectionIds? })` | `alt: null` clears it. `collectionIds` replaces the list; `[]` removes it from all collections. |
| `replaceAsync(id, { data, fileName?, mimeType? })` | Pass `mimeType` when the format changes. |
| `compressAsync(id, { format?, quality?, resize?, keepOriginal? })` | `format` defaults to webp, `quality` to 75. `resize` is `{type:'axis',axis,pixels}`, `{type:'side',side:'long'\|'short',pixels}` or `{type:'scale',factor≤1}`. Replaces in place (the extension changes) unless `keepOriginal`. |
| `downloadAsync(id)` | `{ fileName, mimeType, data (base64) }` |
| `deleteAsync(id)` | `ASSET_IN_USE` while an image field holds it. |
| `listCollectionsAsync()` / `createCollectionAsync(name, parentId?)` / `updateCollectionAsync(id, { name?, parentId? })` / `deleteCollectionAsync(id)` | `parentId: null` moves a collection to the top level. Deleting keeps its assets. |

- Asset object: `{ id, fileName, path ("/", read-only), url ("/assets/…"), mimeType, fileSize, width?, height?, alt?, collectionIds, responsiveWidths?, createdAt, updatedAt }`.

Errors:
- `ASSET_NOT_FOUND`
- `COLLECTION_NOT_FOUND`
- `ASSET_IN_USE`
- `INVALID_ARGUMENT`: bad base64, over 24.9 MiB, a taken name, a bad compress option, a non-raster compress, or a self-nesting collection
- `OPERATION_FAILED`

Source: https://docs.etchwp.com/studio/public-api/assets

## etch.navigation

| Method | Sync/async |
|---|---|
| `goTo(place)`, `getCurrentPlace()`, `getPlaces()` | sync |
| `openPostAsync(postId)`, `openTemplateAsync(templateId)` | async (switches the canvas document) |
| `getActivePostId()`, `isEditingTemplate()` | sync |
| `listPostsAsync(postType?)` → `{ id, title, slug, status, postType }[]`, `listTemplatesAsync()` → `{ id, title, slug }[]` | async |

> Conflict: the web page lists places `builder, templates, content-hub, style-manager, loop-manager, asset-manager`. On Studio, `getPlaces()` returns `builder, templates, style-manager, content-hub, data-manager, asset-manager, routes`, and `loop-manager` → `NOT_AVAILABLE` (built-in guide wins).

- Run `saveAsync()` before `openPostAsync` / `openTemplateAsync` to another document, as the toolkit's `buildPage` and `buildTemplate` do. Whether unsaved block edits survive a document switch is unverified.

Source: https://docs.etchwp.com/studio/public-api/navigation, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## etch.skills: sync, read-only, never throws on unknown names

- `list()` → `{ name, description, metadata, references[] }[]`.
- `get(name)` → that object plus `content` (Markdown), or `undefined`.
- `getReference(name, file)` → Markdown, or `undefined`.
- `name` is the frontmatter name (e.g. `acss`).
- The set depends on the runtime. The ACSS skill's `tokens.md` and `classes.md` are generated from the project's settings (Etch Studio built-in `acss` skill (`etch.skills.get('acss')`)). **Read them all at session start.**

Source: https://docs.etchwp.com/studio/public-api/skills

## etch.ai: sync, in-memory

- `getState()`, `setState('idle'|'working'|'waiting'|'thinking')` (anything else → `INVALID_ARGUMENT`), and `hide()` (= idle).
- Shows a presence overlay to the person watching the tab. Always clear it in a `finally` block.

Source: https://docs.etchwp.com/studio/public-api/ai

## etch.ui / etch.history (brief)

- `ui`: `getColorScheme()`, `setColorScheme('light'|'dark')` (persisted locally), `toggleColorScheme()`, `isInterfaceHidden()`, `setInterfaceHidden(bool)`, `toggleInterface()`.
- `history`: `undo()` and `redo()`. API mutations go through the same stack.

Source: https://docs.etchwp.com/studio/public-api/ui-and-history

## Top level

- `saveAsync()` persists the buffered `blocks` and `styles`.
- Also on `etch`: `apiVersion`, `version`, `environment { product, capabilities, blockTypes }`.
- `connectAs`: not documented.
- Packaging: `getEtch(options?)` throws `NOT_AVAILABLE` when there is no builder, and `isEtchAvailable()` checks for one. Both are for in-page plugins. Connector and MCP scripts already have `etch` in scope.

Source: https://docs.etchwp.com/studio/public-api, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)
