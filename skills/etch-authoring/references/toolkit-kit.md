# Using the Gearyco agentic toolkit's runner and kit

The Gearyco Agentic Toolkit for Etch is an **unofficial**, third-party agent workspace built on `@digital-gravy/etch-connector` (not affiliated with Digital Gravy). Local copy, read-only: https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch (3 commits, latest "small improvements"). Use it **from that path**. Don't copy its code into this skill or into other repos, and don't edit it. Project folders under `projects/` (except `example/`) are git-ignored, so client work stays local.

Source: toolkit `README.md`, `AGENTS.md`

## 1. When it applies: connector tab vs Etch Studio MCP

| Situation | Use |
|---|---|
| A live Etch tab (EtchWP or Studio) is connected through `npx @digital-gravy/etch-connector serve` and shows in `etch-connector tabs` | the toolkit **runner** (`node shared-helpers/run.mjs …`) with the kit |
| No connector tab, but the Etch Studio MCP server is available | MCP `eval`. The runner does **not** apply; **inline** the few kit helpers you need (copy the function bodies into the eval script, read from `shared-helpers/etch/*.js` at run time) |
| Neither | ask the user to enable Settings → AI → AI Connector (experimental) and click the AI sparkles button in the builder toolbar |

Connector setup the toolkit automates (AGENTS.md "Getting started"):
1. `npx @digital-gravy/etch-connector tabs --quiet` (each line starts with a tab name).
2. If the daemon isn't reachable: start `npx @digital-gravy/etch-connector serve` as a **background** process; check again.
3. No tab → switch to the Studio MCP (`get_guide` once per session, `list_projects` → `open_project`, `request_control` if someone else has it open (ask the user first unless it's only their own tab), `eval`, `await etch.saveAsync()`, `close_project { save: true }` or `hand_over_control`).
4. Bridge by default; `--cdp` only for screenshots/rendered HTML/computed styles, and ask first (needs Chrome with `--remote-debugging-port`).
5. Match the tab to `projects/<project>/etch/etch.json` (`"tab"`). New site: copy `projects/example/` to `projects/<site>/`, set `tab`.
6. Run `npx @digital-gravy/etch-connector tabs` once **without** `--quiet` and read the authoring rules it prints.
7. Confirm: `node shared-helpers/run.mjs <project> -e "return etch.apiVersion"`.

The connector `deploy` path is the Studio skill's business, not this one.

Source: toolkit `AGENTS.md`; https://docs.etchwp.com/etch-connector/usage, https://docs.etchwp.com/etch-connector/ai-agent-guide

## 2. The runner (`shared-helpers/run.mjs`)

Run from the toolkit root:
```bash
git clone https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch.git && cd gearyco-agentic-toolkit-for-etch
node shared-helpers/run.mjs <project> <task.js> [more.js …]
node shared-helpers/run.mjs <project> -e "return task(siteAudit)"
node shared-helpers/run.mjs <project> task.js --check     # local syntax check only, no round trip
```
What it does: concatenates `etch/blocks.js`, `etch/upsert.js`, `etch/audit.js` (the kit), then the project prelude (`etch.json` `"prelude"`, default `helpers.js`), then task files and `-e` snippets into one async-function body; syntax-checks it locally (duplicate `const` names fail here); writes a temp file and runs `npx @digital-gravy/etch-connector eval -t <tab> -f <file> --timeout <ms>`; decodes the JSON result and drops `[etch-studio]` banner lines.

Options: `-t "<tab>"` (override), `--timeout <ms>` (default 120000), `--kit` / `--no-kit` (default: kit loads only if the project has `etch.json`), `--check`. Task files resolve in `projects/<project>/etch/` first, then the cwd. `<project>` may also be a path.

`projects/<project>/etch/etch.json`: `{ "tab": "My Site", "kit": true, "prelude": ["helpers.js"] }` (only `tab` required). Projects without `etch.json` are unmigrated: no kit, need `-t`.

Rules: one project at a time; scope reads to `projects/<active>/`, `shared-helpers/`, `agent-docs/`; never read other projects' class names/content. Exclude ACSS settings files (`acss-import.json`, `acss-export.json`, ~90 KB single lines) from searches. Never run two agents against the **same tab** at once (navigation and saves hit whatever document is open). Keep only re-runnable scripts in the project; one-offs via `-e` or a temp file.

Source: toolkit `shared-helpers/run.mjs`, `agent-docs/etch-shared-helpers.md`, `AGENTS.md`

## 3. Kit reference (names only; read the source for signatures when needed)

**`blocks.js`: builders returning plain block JSON** (no canvas access)
`txt`, `el(tag, name, children, attributes)`, `dyn(name, tag, children, attributes)` (dynamic element), `cond(name, conditionString, children)`, `loop(target, itemId, children, name)`, `instance(name, componentId, attributes, children)` (name first: older scripts that pass `componentId` first need updating), `slot(slotName, children)` (slot-content), `render(target='this.content')`, `image(mediaId, alt, attrs)` (`etch/dynamic-image`, `useSrcSet:'true'`), `img(name, src, attrs)` (plain `<img>`, lazy/async), `svg(name, viewBox, shapes, attrs)` (inline `<svg>` built from element blocks, not `etch/svg`), `section(cls, name, children, extra)`, `container(…)`, `prop.text/url/image/select/object/repeater`, `tagProp(options)`, `headingProp(options)`.
Note: `prop.image` uses `specialized:'image'`; the Studio built-in guide says image props should be `specialized:'wpMediaId'` (holds an asset id). Check against a live component before relying on either.

**`upsert.js`: idempotent create-or-update**
`task(fn)` (sets `etch.ai` to `working`, restores `thinking`), `upsertStyle`, `applyStyles({selector: css})`, `deleteStyles`, `addKeyframes(name, body)` (Animations stylesheet), `upsertComponent(def)` (match by `key` or `name`; keys are stored PascalCase), `componentId(key)`, `componentIds([keys])`, `upsertDataSource` + `apiSource`/`jsSource`, `deleteDataSources`, `ensurePage(title, postType)`, `ensureTemplate(title)`, `replaceTree(blocks)` (deletes every top-level block, recreates, saves), `buildPage`, `buildTemplate`, `buildIndexTemplate(headerKey, footerKey)` (header, `<main>` around `this.content`, footer; assigns to the root route), `rootRoute()`, `upsertRoute(parentId, match, segment, def)`, `dataSourceRoute(keys, templateId, extra)`, `ensureCollection(name)`.
Data-source, route, content and collection helpers are Studio-only (they call `etch.dataSources`, `etch.routes`, `etch.content`, `etch.assets`).

**`audit.js`: read-only, compact output**
`treeSummary(blocks, depth)`, `collectDocuments()` (opens every page and template, then returns to the starting place), `auditDataSources`, `auditComponents`, `auditSelectors` (unused selectors; classes with no selector, usually ACSS utilities), `auditAssets` (uncollected assets), `auditRoutes`, `siteAudit()`. Pass one `collectDocuments()` result to several audits.

Source: toolkit `shared-helpers/etch/blocks.js`, `upsert.js`, `audit.js`, `agent-docs/etch-shared-helpers.md`

## 4. Writing task scripts

```js
return task(async () => {
  const C = componentIds(['SiteHeader', 'SiteFooter']);          // PascalCase keys
  applyStyles({ '.hero': 'background-color: var(--bg-dark);' });
  const id = await buildPage('Home', [section('hero', 'Hero', [container('hero__inner', 'Inner',
    [el('h1', 'Title', 'Hello', { class: 'hero__title' })])])]);
  return { id, tree: treeSummary(etch.blocks.getTree(), 2) };
});
```
- Wrap in `task()`, make it re-runnable (find-or-create, then update), return a small summary, never full trees.
- `applyStyles` doesn't save: call `await etch.saveAsync()` unless a `build*`/`replaceTree` helper already saved.
- `replaceTree`/`buildPage` **replace the whole document** and save. That conflicts with "smallest change; never remove content unless told". Use them only for pages you own end to end, never on an existing client page without explicit instruction.
- Project `helpers.js` holds only site-specific code (fonts, icons, data expressions); never redeclare a kit name. Add to the kit only helpers proven on a live site, idempotent, compact.
- MCP path: paste only the helper bodies a script needs (e.g. `el`, `section`, `container`, `upsertStyle`) at the top of the `eval` body; `task()` and `etch.ai` presence are optional there.

Source: toolkit `agent-docs/etch-shared-helpers.md`, `AGENTS.md`

## 5. Hard rules the toolkit enforces (both backends)

- Every change goes through `etch.*`; never touch the DOM/canvas/iframes. CDP access is for inspection only.
- Styling only via `etch.styles` + `etch.blocks.addClass()`; global CSS only via `etch.stylesheets`, and only `@keyframes` (Animations sheet).
- No page wrappers; sections are top level.
- Cross-site content moves use the blocks copy/paste API only (cross-site-copy.md).
- Read the live guide: `etch.skills.list()` / `etch.skills.get(name)`; flag syntax you can't verify. (The toolkit points at `docs.etchbuilder.io`; current docs live at `docs.etchwp.com`.)

Source: toolkit `AGENTS.md`
