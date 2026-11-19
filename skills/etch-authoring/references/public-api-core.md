# `window.etch` Public API: shared core

Both products expose one scripting contract on `window.etch` (npm `@digital-gravy/etch-public-api`, MIT, types + thin accessor). Contract version `0.x`: experimental, may change without a major bump. **Detect features; don't compare versions or branch on product.** Namespace pages for Studio-only (`content`, `dataSources`, `routes`, `assets`, deploy) and WP-only (`loops`, `fields`) surfaces are covered by the product skills.

## 1. Which namespace exists where

| Namespace / member | EtchWP | Etch Studio | Persistence |
|---|---|---|---|
| `blocks` | yes | yes | buffered → `saveAsync()` |
| `styles` | yes | yes | buffered |
| `stylesheets` | yes | yes | immediate (`*Async`) |
| `components` | yes | yes | immediate |
| `navigation` | yes | yes (places differ) | n/a (UI) |
| `ui`, `history` | yes (`ui.exitToWordPress()` WP only) | yes | local UI state |
| `skills` | yes | yes | read-only, sync |
| `ai` | yes | yes | in-memory, sync |
| `environment`, `saveAsync`, `apiVersion`, `version` | yes | yes | — |
| `assets` | partial ("EtchWP's partial implementation"; WP media + collections) | full asset store | immediate |
| `loops` | yes (`capabilities.loops` is true; the registry is fully backed) | stub → `NOT_AVAILABLE` | buffered |
| `fields` | yes | stub → `NOT_AVAILABLE` | immediate |
| `dataSources`, `content`, `routes` | no | yes | immediate |
| `deploy`, `presence`, `acss`, `connectAs` | not documented | not documented | unverified |

Studio built-in guide: buffered = `blocks`, `styles`; immediate = `components`, `stylesheets`, `content`, `routes`, `dataSources`, `assets`. WP docs: buffered = `blocks`, `styles`, `loops`; immediate = `stylesheets`, `components`, `fields`, `assets`. Through the MCP (own headless builder) save when work is done; on a person's tab via the connector, leave saving to them unless asked. Always end by reporting what is unsaved and what was already written.

`saveAsync()` resolves to `undefined`: it gives no confirmation, so verify a save another way — re-read the tree, or fetch the front end and look for the change. Removing a block is also not a one-step undo: deleting a block leaves behind the style record its class created (verified on a WordPress build: reverting an added section moved the style count 1,212 → 1,213). Delete that record too (`etch.styles.delete(id)`) and save again, or the revert leaves an orphan.

Source: https://docs.etchwp.com/public-api, https://docs.etchwp.com/studio/public-api, https://docs.etchwp.com/etch-connector/ai-agent-guide, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 2. Acquiring the API (npm / plugin code)

```ts
import { getEtch, isEtchAvailable, isEtchApiError, EtchApiError, ETCH_API_VERSION } from "@digital-gravy/etch-public-api";
isEtchAvailable(): boolean            // window.etch present
getEtch(options?: { apiVersion?: string; id?: string }): Etch   // throws NOT_AVAILABLE if builder not loaded
```
On `0.x`, `getEtch()` warns (doesn't throw) on major mismatch. `connect?()` is reserved. Through the connector/MCP, scripts run as an async function body with `etch` in scope (safe mode: no `window`/`document`); `return` a compact value.

Source: https://docs.etchwp.com/public-api, https://docs.etchwp.com/etch-connector/ai-agent-guide

## 3. `etch.environment` (since 1.6.7; contract 0.10.0)

```ts
interface EtchEnvironment { product; capabilities: Partial<Record<EtchCapability, boolean>>; blockTypes: readonly string[] }
```
- Test with `=== true`; an absent key means unavailable.
- Capabilities: `loops` (WP loop registry; superseded by `dataSources`), `fields`, `templates`, `wpMedia`, `assets` (+ WP granular `assetsRead`, `assetsUpload`, `assetsDownload`, `assetsUpdate`, `assetsDelete`, `assetsCollections`, `assetsCompressInPlace`), Studio: `dataSources`, `content`, `routes`. Studio docs: `dataSources`, `templates`, `content`, `routes`, `assets` are `true`; `loops`, `fields`, `wpMedia` are `false`.
- `blockTypes` is read live from the block registry: check it before authoring a type.
- **WP vs Studio conflict:** WP docs: if `environment` is missing, don't assume optional asset ops exist. Studio docs: treat a missing `environment` as everything available. Studio also says namespaces tied to optional capabilities (`routes`, `assets`, …) are left off `etch` entirely when not backed.
- Single methods: `typeof etch.blocks.someNewMethod === "function"`.

Source: https://docs.etchwp.com/public-api#feature-detection, https://docs.etchwp.com/studio/public-api#feature-detection, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 4. `etch.blocks` (buffered)

```ts
select(id): void; deselect(): void; getSelectedId(): string | null
getJson(id): PublicBlockJson; getTree(): PublicBlockJson[]
find({ type?, class?, attribute? }): string[]
create(json, parentId?: string | null, index?): string        // null/omitted = document root
delete(id); duplicate(id): string; move(id, newParentId | null, index?)
replace(id, json): string; update(id, { name?, hidden?, attributes?, text? })  // attrs merge; undefined removes
copy(id): CopyObject; pasteAsync(payload, targetId?, index?): Promise<string>
setText(id, text); rename(id, name)
getAttribute(id, key); setAttribute(id, key, value?); removeAttribute(id, key)
addClass(id, className); removeClass(id, className); hasClass(id, className)
enterComponentEditMode(id); exitComponentEditMode({ revert? }); isInComponentEditMode(); saveComponentEditModeAsync()
```
- Component instances: attributes are props (closed schema; unknown key → `INVALID_ARGUMENT`).
- Doc inconsistency: `addClass(blockId, className)` takes a class name per its signature, but the Styles page tip says the style **id** from `styles.create()` is "the value you pass to `etch.blocks.addClass()`". Unverified which is accepted; test on one block.
- Studio guide: `update` can't change `tag` → `replace`.

Source: https://docs.etchwp.com/public-api/blocks (identical in Studio)

## 5. `etch.styles` (buffered)

```ts
list(filter?: { type? }): { id, selector, type, collection: "default", css }[]
create(selector, css?): string; update(id, { selector?, css? }); delete(id)
listVariables(collection?); getVariable(name, c?); setVariable(name, value, c?); removeVariable(name, c?)
```
Source: https://docs.etchwp.com/public-api/styles

## 6. `etch.stylesheets` (immediate)

```ts
list(): { id, name, css, type: "default" | "@custom-media" }[]; get(id)
createAsync({ name, css, type? }): Promise<string>; updateAsync(id, { name?, css?, type? })
appendAsync(id, css)   // inserts a newline
deleteAsync(id)
listCustomMedia(): Record<string, string>; addCustomMediaAsync(name, query)
```
Source: https://docs.etchwp.com/public-api/stylesheets

## 7. `etch.components` (immediate)

`list()`, `getJson(id:number)`, `createAsync(name): Promise<number>`, `updateAsync(id, { name?, key?, description?, properties?, blocks? })` (key auto-PascalCased; properties/blocks replace), `deleteAsync(id)`. Prop union: components.md.

Source: https://docs.etchwp.com/public-api/components

## 8. `etch.navigation`

```ts
goTo(place); getCurrentPlace(); getPlaces()
openPostAsync(postId: number); openTemplateAsync(templateId: number)
getActivePostId(): number | null; isEditingTemplate(): boolean
listPostsAsync(postType?): Promise<{ id, title, slug, status, postType }[]>
listTemplatesAsync(): Promise<{ id, title, slug }[]>
```
Documented places (both trees): `builder`, `templates`, `content-hub`, `style-manager`, `loop-manager`, `asset-manager`. Studio built-in guide: `builder`, `templates`, `style-manager`, `content-hub`, `data-manager`, `asset-manager`, `routes`; `goTo('loop-manager')` → `NOT_AVAILABLE`. Call `getPlaces()`.

Source: https://docs.etchwp.com/public-api/navigation, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 9. `etch.ui` / `etch.history`

`ui`: `getColorScheme()`, `setColorScheme('light'|'dark')` (persisted locally), `toggleColorScheme()`, `isInterfaceHidden()`, `setInterfaceHidden(b)`, `toggleInterface()`; WP only `exitToWordPress()`. `history`: `undo()`, `redo()`, `canUndo()`, `canRedo()`; script mutations join the same undo stack.

Source: https://docs.etchwp.com/public-api/ui-and-history (Studio page lacks `exitToWordPress`)

## 10. `etch.skills` (sync, read-only)

```ts
list(): { name, description, metadata, references: string[] }[]
get(name): (summary & { content: string }) | undefined        // SKILL.md body
getReference(name, file): string | undefined
```
Progressive disclosure: `list()` → `get()` → `getReference()` only when needed. `name` = frontmatter name (e.g. `acss`), not the folder. Integration skills appear only when the integration is active; some references are generated from live state. Unknown names return `undefined`. In Studio, the `acss` skill's `tokens.md` and `classes.md` are generated from the project's settings (`automaticcss/references/Etch Studio built-in `acss` skill (`etch.skills.get('acss')`)`). **Read these at session start; the live guide beats any snapshot.**

Source: https://docs.etchwp.com/public-api/skills, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 11. `etch.ai` (presence overlay; sync, in-memory)

`getState()`, `setState('idle'|'working'|'waiting'|'thinking')` (other values → `INVALID_ARGUMENT`), `hide()` (= idle). Docs: always clear presence in `finally`. Note: the toolkit's `task()` restores `'thinking'` in `finally` rather than hiding; call `etch.ai.hide()` when the session ends.

Source: https://docs.etchwp.com/public-api/ai, toolkit `shared-helpers/etch/upsert.js`

## 12. Errors

`EtchApiError { code, name: "EtchApiError" }`; guard with `isEtchApiError`. Shared codes: `BLOCK_NOT_FOUND`, `WRONG_BLOCK_TYPE`, `READONLY`, `INVALID_ARGUMENT`, `LOOP_NOT_FOUND`, `STYLE_NOT_FOUND`, `STYLESHEET_NOT_FOUND`, `COMPONENT_NOT_FOUND`, `POST_NOT_FOUND`, `OPERATION_FAILED`, `NOT_AVAILABLE` (declared-but-unbacked namespace). Studio adds `DATA_SOURCE_NOT_FOUND`, `ROUTE_NOT_FOUND`, `CONTENT_TYPE_NOT_FOUND`, `FIELD_NOT_FOUND`, `ASSET_NOT_FOUND`, `COLLECTION_NOT_FOUND`, `ASSET_IN_USE`. The union is open-ended (`string & {}`).

Source: https://docs.etchwp.com/public-api#error-handling, https://docs.etchwp.com/studio/public-api/types-reference

## 13. Types reference highlights (WP vs Studio)

- Block union and `EtchBlockCommon` are the same in both; see elements-and-markup.md for each variant.
- `EtchLoopBlockJson`: `itemId`, `target?`, `indexId?`, `loopId?`, `loopParams?` (WP binds `loopId`; Studio uses `target` expressions).
- WP only: `etch/passthrough` (`gutenbergBlock`), the `GutenbergBlock` type, and `CopyObject.gutenbergBlock` (WP warns that shape is unstable; treat CopyObject as opaque). Studio's `CopyObject` has no `gutenbergBlock`. Studio's page drops the "HTML and Gutenberg types" section (`EtchHtmlAttributes = Record<string, string | undefined>` still applies).
- `etch/head` and `etch/render` are in Studio's live `blockTypes` but not in either types reference page.

Source: https://docs.etchwp.com/public-api/types-reference, https://docs.etchwp.com/studio/public-api/types-reference

## 14. Interface map (one line each; for UI instructions to humans)

- **Structure panel:** tree view; drag/drop, rename labels, quick tag edits, Auto-BEM, Generate List, Create/Edit Component.
- **HTML panel:** CodeMirror editor of the page's HTML, two-way sync with canvas.
- **CSS panel:** CodeMirror editor bound to the selected selector pill; nesting, var/calc auto-wrap.
- **JS panel:** stub page (no content).
- **Attributes Bar** (Cmd/Ctrl+Enter): add attributes and selectors in CSS syntax.
- **Selector pills:** pick which selector the CSS panel styles; double-click to rename.
- **Elements Bar:** bottom bar to insert elements (Dynamic Element, Slot, HTML only in component/template editing).
- **Style Manager:** Selectors, Variables (collections), Stylesheets tabs.
- **Command Bar:** jump between contexts (Builder, Content Hub, Styles Manager…) and run actions.
- **Responsive controls:** fluid canvas, measurements, auto media/container query and "Has Me" insertion.
- **Modular interface:** show/hide/resize/rearrange panels.
- **Canvas color scheme:** light/dark toggle in the Settings Bar.
- **Asset Manager:** media hub (replaces WP Media Library in EtchWP; Studio's own store); scriptable via `etch.assets`.
- **Quick Notes:** `data-etch-note` hover notes, toggled in Structure panel settings; stripped on the front end.

Source: https://docs.etchwp.com/interface/ (each page) and /studio/interface/, https://docs.etchwp.com/utilities/quick-notes

## Stubs
- https://docs.etchwp.com/interface/js-panel and /studio/interface/js-panel: title only.
