# Elements, block JSON and semantic markup

Applies to EtchWP and Etch Studio. Before authoring, read `etch.environment.blockTypes` (the live list of constructible types) instead of assuming a type exists.

## 1. Block JSON basics

Every block: `type` (`etch/…`), `version: 1`, `context` (`{}` or `{ name, structureState?, hidden? }`), `children: []`; optional `script: { code }` and `options: {}`. Text is always its own `etch/text` child block. Reads (`getJson`, `getTree`) add `id`, `parentId`, and a **read-only** `styles: string[]` on styled blocks; sending `styles` when authoring is rejected. `blocks.update()` cannot change a `tag`; swap the block with `blocks.replace()`. Creating a child under a block that cannot hold it (text block, void element like `img`, block-level child in a text container) throws `WRONG_BLOCK_TYPE`. `<svelte:element>` does not exist in Etch.

Block `script.code` is enqueued in `<head>` as a deferred `type="module"`, with no link to its element: target elements by selector. Toolkit: never `btoa()` the code; Studio's export ships it verbatim.

Source: https://docs.etchwp.com/public-api/types-reference, https://docs.etchwp.com/public-api/blocks, Etch Studio built-in guide (`etch.skills.get('etch-studio')`) ("Block JSON"), toolkit `agent-docs/etch-studio.md`

## 2. Element → markup → block JSON

| Element | HTML-panel markup | Block JSON (key fields) |
|---|---|---|
| Section | `<section data-etch-element="section">` | `etch/element`, `tag:"section"`, `attributes:{"data-etch-element":"section", class}` |
| Container | `<div data-etch-element="container">` | `etch/element`, `tag:"div"`, `attributes:{"data-etch-element":"container"}` |
| Div | `<div>` (no default styling; `display:block`, add `flex` yourself) | `etch/element`, `tag:"div"` |
| Text | `<p>` by default; retag to `span`, `li`… Not for rich text | `etch/element` + child `etch/text {text}` |
| Heading | `<h2>` by default; pick the level for semantics, not size | `etch/element`, `tag:"h2"` |
| Anchor | `<a href="#">` (href mandatory) | `etch/element`, `tag:"a"`, `attributes:{href}` |
| Image | `<img src alt>` | `etch/element`, `tag:"img"` (void) |
| Dynamic Image | `<etch:img mediaId="…" />` | `etch/dynamic-image`, `attributes:{mediaId, alt?, useSrcSet?, maximumSize?, sizes?}` |
| SVG | `<etch:svg src="…" stripColors="true" />` | `etch/svg`, `attributes:{src, stripColors}` |
| HTML | `<etch:html content={…} unsafe="false" />` (self-closing) | `etch/raw-html`, `content`, `unsafe` (see note) |
| Dynamic Element | `<etch:element tag={props.headingLevel}>` | `etch/dynamic-element`, `attributes:{tag, …}` (no `tag` field) |
| Condition | `{#if …}…{/if}` (ghost, no DOM) | `etch/condition`, `conditionString` |
| Loop | `{#loop src as item}…{/loop}` (ghost) | `etch/loop`, `itemId`, `target?`, `indexId?`, `loopId?`, `loopParams?` |
| Component instance | `<CardKey prop="…" />` | `etch/component`, `componentId:number`, `attributes:{propKey: value}` |
| Slot (definition) | `{@slot name}` | `etch/slot-placeholder`, `slotName` |
| Slot (instance fill) | `{#slot name}…{/slot}` | `etch/slot-content`, `slotName` |
| Render (Studio) | `{@render post.content}` | `etch/render`, `target:"this.content"` |
| Head (Studio) | `<etch:head>…</etch:head>` (not self-closing) | `etch/head` with children; other fields unverified |
| Post content (WP) | — | `etch/post-content` (no extra fields) |
| Passthrough (WP) | wrapped Gutenberg block | `etch/passthrough`, `gutenbergBlock` |
| iFrame | stub page ("More to come…") | Studio guide: default full width, 16:9 |

Notes:
- **Dynamic Image:** renders `<img>` with `alt`, `src`, `srcset`, `sizes`. `alt` defaults to the media/asset alt; set `alt` to override, `alt=""` = decorative (Studio guide). `useSrcSet="false"` disables srcset. `src`, `maximumSize`, `useSrcSet` are not output. Any other attribute passes through to `<img>`. Studio guide: `mediaId` must be an asset id, not a URL; set `sizes` to the real rendered width; plain `img` gets no srcset, intrinsic size or asset alt. Works with a media prop or a text prop holding an id; in a gallery, loop over ids.
- **SVG:** front end outputs the raw SVG. `src` takes any URL (also external icon libraries) or a media-library pick; `stripColors="true"` converts hard-coded colors to `currentColor`. In components, use an Image/Media prop: `src="{props.icon}"`. Pasting raw `<svg>` markup is also allowed (Etch parses it into elements).
- **HTML element:** for HTML strings from data (rich text, API markup). Parent must be a `div` (or other block container), never `p`/`span`. `unsafe="false"` (default) sanitizes but keeps rich-content tags (WP: `wp_kses_allowed_html('post')`); `unsafe="true"` passes scripts/iframes: avoid. Doc conflict: the types reference describes `etch/raw-html` as `content: string // sanitized HTML` and `unsafe: string // original, unsanitized HTML`, which doesn't match the element page's boolean attribute. Read an existing block with `getJson()` before authoring one by hand.
- **Render vs HTML (Studio):** Render takes Etch JSON (a block, block array, or JSON string of one, every `type` starting `etch/`); HTML takes an HTML string. Render output isn't selectable/stylable in the builder; failures show `Render failed: …` in place. Loop protection stops self-rendering and nesting deeper than 16. A template shows its page with `target: 'this.content'`.
- **Head (Studio):** children go into the document `<head>`. Exported pages already get charset, viewport, `<title>` + `og:title`, `og:type`; description/language/canonical/social image come from the route SEO tab. A hand-written `<title>` or meta replaces the route's value; Studio guide: don't write `<title>`/meta description in `etch/head` except on the 404 page. Good for third-party loader scripts.
- **Dynamic Element:** the Tag input is a combobox (any value). Its icon shows only in the component editor, but it works anywhere.
- **Condition, Loop, Head, Render** output nothing themselves.
- Anchors navigate; on-page actions use `<button>` (retag a Text/Div). There is no Button element.

**WP vs Studio:** Studio adds Head and Render; WP has `etch/post-content` and `etch/passthrough`. The Studio types reference still lists `etch/post-content`; check `etch.environment.blockTypes` before authoring a type. Dynamic Image: WP = WordPress media ID, registered WP image sizes, `Maximum Size`; Studio = asset id. Image element: WP media library / `/wp-content/uploads/…`; Studio asset picker / `/uploads/…`; the Studio page drops the srcset/`size` section. The HTML element's WP-only line about `wp_kses` is absent in Studio.

Source: https://docs.etchwp.com/elements/overview and every page under /elements/ (and /studio/elements/), https://docs.etchwp.com/studio/elements/head, https://docs.etchwp.com/studio/elements/render, https://docs.etchwp.com/public-api/types-reference, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 3. Sections and containers

```html
<section data-etch-element="section">
  <div data-etch-element="container">…</div>
</section>
```
- Defaults are applied by the `data-etch-element` attribute at 0,0,0 specificity (`:where()`); any class overrides them; removing the attribute removes them.
- Docs: section = `display:flex; flex-direction:column; align-items:center`. Container = `display:flex; flex-direction:column; width:100%; max-width:var(--content-width); align-self:center`. `--content-width` falls back to `1366px`; set it as a variable (Style Manager → Variables) or override per container with `--content-width: 460px`, not `max-width`.
- Toolkit wording differs: section `inline-size:100%`, container `max-inline-size`, `margin-inline:auto`. Studio guide: section full width, flex column, centred; container full width, flex column, max `--content-width`, centred. Same intent; don't duplicate any of it.
- Pattern: section > container > content. Several sibling containers are fine (e.g. intro group + grid). Content outside a container only when it must span full width (backgrounds, banners).
- Containers have no gutter: use them inside section-like elements (`section`, `header`, `footer`). Without ACSS, add gutter and block padding yourself on `:where(section:not(section section))` (css-and-responsive.md). Studio guide: with ACSS active, section spacing and gutter come from the top-level `<section>` tag; don't hand-roll wrapper widths, side padding or margins between sections. Containers stack children; set `flex-direction: row` in your own class for a row.
- Every section starts with a heading (first section `h1`, then `h2`); a section that needs no heading should be a `div`. One topic per section. `flex-div` is deprecated: never use it.

Source: https://docs.etchwp.com/elements/section, https://docs.etchwp.com/elements/container, https://docs.etchwp.com/how-to/basics/how-to-set-content-width, toolkit `agent-docs/etch-markup.md`, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 4. Empty elements

Empty elements (no text, children, or background image) get a **35px** minimum width and height in the builder only (live site unaffected). Override with `--empty-element-size` on the element or a section; `:root { --empty-element-size: 0 }` is documented but not recommended. Toolkit rule: if an element's width/max-width is under 20px, set `--empty-element-size: 0` on that element. Note the docs' threshold is 35px, so anything smaller than 35px can be affected.

Source: https://docs.etchwp.com/elements/empty-elements, toolkit `agent-docs/etch-css.md`

## 5. Semantic markup rules (Gearyco toolkit; consistent with docs)

- **No page wrappers.** Build a full page section by section; no `<main>` (or other wrapper) around sections. Exception (toolkit `etch-studio.md`, Studio): the shared `index` template wraps `{@render this.content}` in `<main>` between header and footer.
- **Cards are their own BEM block** (`.post-card`, never `.section__card`); children are `.post-card__title` etc. Tag by meaning: `<article>` for standalone content, `<li>` inside a list. Never default to `<div>`.
- **Grids/lists are their own block** (`.posts-list`, `.fx-spotlight-grid`, never `.section__grid`). Collections of similar items = `<ul>`/`<ol>` with `role="list"`, looping the `<li>`; `<div>` only for unrelated panels sharing a layout.
- **Reusable things are components** with props (components.md); repeated items come from a loop, never pasted instances.
- **Images:** prefer `<etch:img>` over `<img>`.
- **Name blocks for what they are,** not where they sit: no `home-hero`, `top-section`; `site-` only for singletons (`site-header`).
- **Rich text** never goes in a single Text element; use the HTML element inside a `div`.
- Smallest change that satisfies the request; never remove content unless told.

```html
<ul class="posts-list" role="list">
  {#loop posts as post}
  <li class="post-card">
    <h3 class="post-card__title">{post.title}</h3>
  </li>
  {/loop}
</ul>
```

Source: toolkit `AGENTS.md`, `agent-docs/etch-markup.md`; https://docs.etchwp.com/elements/text, https://docs.etchwp.com/elements/html

## 6. Programmatic authoring (minimal)

```js
const sectionId = etch.blocks.create({
  type: 'etch/element', version: 1, context: { name: 'Hero' }, tag: 'section',
  attributes: { class: 'hero', 'data-etch-element': 'section' },
  children: [{ type: 'etch/element', version: 1, context: {}, tag: 'div',
    attributes: { class: 'hero__inner', 'data-etch-element': 'container' },
    children: [{ type: 'etch/element', version: 1, context: {}, tag: 'h1', attributes: { class: 'hero__title' },
      children: [{ type: 'etch/text', version: 1, context: {}, children: [], text: 'Hello' }] }] }]
}, null);
await etch.saveAsync(); // blocks are buffered
```
Special attributes via `setAttribute`: `mediaId`, `useSrcSet` (dynamic-image); `src`, `stripColors` (svg). Gearyco kit builders (`el`, `section`, `container`, `dyn`, `cond`, `loop`, `instance`, `slot`, `render`, `image`, `img`, `svg`) produce exactly these shapes; see toolkit-kit.md.

Source: https://docs.etchwp.com/public-api/blocks, toolkit `shared-helpers/etch/blocks.js`

## Stubs
- https://docs.etchwp.com/elements/iframe and /studio/elements/iframe: "More to come..."
