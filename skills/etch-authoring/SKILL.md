---
name: etch-authoring
description: Use when writing or editing anything inside an Etch builder (Etch Studio or EtchWP) — blocks, sections, components, props, slots, loops, conditions, dynamic data, classes and CSS — or scripting `window.etch` through the Etch Studio MCP, the Etch Connector (`npx @digital-gravy/etch-connector`) or the Gearyco agentic toolkit runner.
---

# Etch authoring (shared by Etch Studio and EtchWP)

Both products share one scripting contract, `window.etch`. This skill covers what
is the same in both. Platform specifics: `etch-studio` or `etchwp`. Styling with
tokens: `automaticcss`.

## The non-negotiables

1. **Every change goes through the public `etch.*` API.** Never touch the canvas
   DOM, iframes or injected `<style>` tags. CDP / screenshots are for inspecting.
2. **Read the live skills first:** `etch.skills.list()` then
   `etch.skills.get(name).content`. They are authoritative over these references.
3. **Never invent API or syntax.** Explore with `Object.keys(etch)`,
   `Object.keys(etch.blocks)`, `etch.apiVersion`, `etch.environment`. If you can't
   confirm it, say so.
4. **Know what persists.** `etch.blocks` and `etch.styles` are buffered and need
   `await etch.saveAsync()`. Components, stylesheets, content, routes, data
   sources, assets and (on WP) fields persist immediately. Report both at the end.
5. **Smallest change; never remove content you weren't asked to remove.**

## Build pattern

- Page = top-level `<section data-etch-element="section">` blocks, each with one
  `<div data-etch-element="container">`. No `<main>` or wrapper around sections
  (the template supplies `<main>`). Don't re-declare the section/container
  defaults (full width, flex column, centred, `--content-width`).
- Block JSON: every block has `type`, `version: 1`, `context` (`{ name }` for the
  Structure panel), `children`; text is its own `etch/text` block.
- Images: `etch/dynamic-image` (`<etch:img>`) with `mediaId`, real `sizes`, and
  `alt` (omit = asset alt, `''` = decorative). Never a plain `img` for library
  media.
- Anything reused (cards, rows, CTAs, section intros) is a **component** with
  props; repeated items come from a **loop** over data, not pasted instances.
- Cards and lists are their own BEM blocks (`.team-card`, `.team-list`, never
  `.team__card`). Collections are `<ul role="list">` looping the `<li>`. A
  component that can be a list item takes a `tag` select prop on an
  `etch/dynamic-element` root.
- Variants: `data-variant="{props.variant}"` styled with `&[data-variant="x"]`;
  never build class names from props.

## CSS rules

- Class CSS goes in `etch.styles` (one record per class, linked to blocks).
  `etch.stylesheets` only for `@keyframes` (in a stylesheet named **Animations**),
  `@property`, a global reduced-motion rule.
- Flat BEM: every class its own record. Nest only its states (`&:hover`),
  pseudo-elements, contexts (`.card--featured & {}`), `@media`/`@container`.
  Never nest `&__el` or `&--mod` into the block's record; never root-level
  `@media` for a component.
- `css` argument = declarations + nested rules, no outer selector wrapper.
  `create` refuses a selector that already has CSS: use `update(id, { css })`.
  Re-runnable upsert:
  ```js
  const upsertStyle = (selector, css) => {
    const s = etch.styles.list().find((x) => x.selector === selector);
    return s?.css ? etch.styles.update(s.id, { css }) : etch.styles.create(selector, css);
  };
  ```
  `update` replaces the record's CSS: read `s.css` first and merge when adding to it.
- `to-rem(768px)` instead of raw rem; negatives via `calc(to-rem(48px) * -1)`.
- Logical properties; mobile-first `min-width` queries; no Tailwind; no resets
  (Etch ships `@layer etch-reset`); no `!important` to beat the reset.
- Very small elements: Etch gives empty elements a builder minimum size (docs:
  35px; the toolkit uses a 20px threshold). When an element must be smaller,
  add `--empty-element-size: 0`.
- Conditions: the docs show only `{#if …}…{/if}`; don't use `{:else}`/`{#else}`.
  Use paired `{#if x}` / `{#if !x}` blocks or comparison modifiers.

## Example: a reusable card in a looped list (works in both products)

```js
// 1. component (persists immediately); key is stored PascalCase — re-read it
const id = await etch.components.createAsync('Team Card');
await etch.components.updateAsync(id, {
  properties: [
    { key: 'tag', name: 'Tag', type: { primitive: 'string', specialized: 'select' }, selectOptionsString: 'li\narticle\ndiv' },
    { key: 'name', name: 'Name', type: { primitive: 'string' }, default: '' },
    { key: 'photo', name: 'Photo', type: { primitive: 'string', specialized: 'wpMediaId' }, default: '' },
  ],
  blocks: [{ type: 'etch/dynamic-element', version: 1, context: { name: 'Team Card' },
    attributes: { tag: '{props.tag}', class: 'team-card' }, children: [
      { type: 'etch/dynamic-image', version: 1, context: {}, children: [], attributes: { mediaId: '{props.photo}', class: 'team-card__photo' } },
      { type: 'etch/element', version: 1, context: {}, tag: 'h3', attributes: { class: 'team-card__name' },
        children: [{ type: 'etch/text', version: 1, context: {}, children: [], text: '{props.name}' }] },
    ] }],
});
// 2. styles: one record per class (buffered → saveAsync)
etch.styles.create('.team-list', 'display: grid; gap: var(--grid-gap);\n@media (min-width: to-rem(768px)) { grid-template-columns: var(--grid-3); }');
etch.styles.create('.team-card__name', 'color: var(--text-dark);\n&:hover { color: var(--primary); }');
await etch.saveAsync();
```

The loop `target` differs by platform: `data('team')` in Studio, a Loop Manager
loop in EtchWP. See the platform skill.

## References (load on demand)

- `references/template-syntax.md` — `{…}` dynamic data, keys, modifiers, conditions, loops
- `references/elements-and-markup.md` — every block type and its JSON, markup rules
- `references/components.md` — props (all types), slots, variations
- `references/css-and-responsive.md` — styles vs stylesheets, reset, keyframes, container queries
- `references/public-api-core.md` — shared `etch.*` namespaces, persistence, errors
- `references/toolkit-kit.md` — the Gearyco toolkit runner, builders, upserts, audits
- `references/cross-site-copy.md` — copying blocks between sites

## Common mistakes

| Mistake | Instead |
|---|---|
| `etch.blocks.append(pageId, '<section>…')` with HTML strings | Block JSON via `etch.blocks.create(tree, parentId)` |
| Class CSS appended to a stylesheet | `etch.styles.create('.x', css)` |
| `@keyframes` inside a class record | Animations stylesheet; class only references it |
| `.team__grid` / `.section__card` | Own blocks: `.team-list`, `.team-card` |
| Assuming fallback syntax from memory | Studio added `??` and `\|\|` in expressions (changelog, 2026-10-29); older notes say they don't exist. Check `template-syntax.md` and the live skill for the product and version you're on |
| Hand-pasted repeated markup | Component + loop |
| Forgetting `saveAsync()` (or saving a user's tab unasked) | Follow the connection's save rule; report unsaved work |
