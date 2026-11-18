---
name: etchwp-build
description: Build and maintain EtchWP sites (Etch on WordPress, 1.5.0+) through the window.etch Public API and EtchWP dynamic data - blocks, loops over WordPress queries, custom fields, components, styles, stylesheets, and saving. Use for WordPress-hosted Etch pages and templates. For ACSS token and class work, also use automaticcss-etch.
---

# EtchWP build

EtchWP runs inside WordPress. Scripts reach it through the Public API on `window.etch`. Its contract is `0.x` and experimental. Feature-detect it and do not pin a version.

## Acquire the API

- `import { getEtch, isEtchAvailable } from "@digital-gravy/etch-public-api";`, then guard with `isEtchAvailable()` and call `getEtch()`.
- Branch on capabilities, not on the product name: `etch.environment?.capabilities.<name> === true`. Names include `loops`, `fields`, `templates`, `wpMedia`, `assets`, `routes`, `acss`.
- Check block types with `etch.environment?.blockTypes.includes(...)` before you author one.
- For one method, check `typeof etch.blocks.someMethod === "function"`.
- A namespace that is not backed here throws `NOT_AVAILABLE`.

## Persistence

- `blocks`, `styles` and `loops` are buffered. Call `await etch.saveAsync()` to persist them.
- `stylesheets`, `components`, `fields` and `assets` persist at once.
- Never write `etch_styles` or `etch_global_stylesheets` options directly. The Public API is the only supported entry point.

## Errors

- Every failure is an `EtchApiError` with a `code`. Narrow with `isEtchApiError(err)`.
- Codes: `BLOCK_NOT_FOUND`, `WRONG_BLOCK_TYPE`, `READONLY`, `INVALID_ARGUMENT`, `LOOP_NOT_FOUND`, `STYLE_NOT_FOUND`, `STYLESHEET_NOT_FOUND`, `COMPONENT_NOT_FOUND`, `POST_NOT_FOUND`, `OPERATION_FAILED`, `NOT_AVAILABLE`.

## CSS placement

- Class rules: `etch.styles.create(selector, css)` returns an id. Attach it with `etch.blocks.addClass(blockId, styleId)`. Styles are buffered.
- Find a rule with `etch.styles.list().find(s => s.selector === ".lead")`.
- Stylesheets: `etch.stylesheets.createAsync({ name, css, type? })`, `appendAsync(id, css)`, `updateAsync`, `deleteAsync`. They persist at once. Use them for `@keyframes` (in the `Animations` sheet) and for custom media, for example `addCustomMediaAsync("--md", "(min-width: 768px)")`.
- `:root` variables: `etch.styles.setVariable(name, value)`. ACSS owns design tokens, so override them in ACSS, not here.

## Dynamic data (brace syntax)

- Namespaces: templates use `this.`, loop items use the alias (`item.`), terms use `term.` and `taxonomy.`.
- Post keys include `id`, `title`, `slug`, `content`, `excerpt`, `permalink.relative`, `permalink.full`, `image`, `image.url`, `image.alt`, `date`, `modified`, `status`, `type`, `thumbnail`, `author.displayName`, `readingTime`.
- User keys: `user.id`, `user.displayName`, `user.loggedIn`. Site keys: `site.name`, `site.home_url`, `site.isMultisite`.
- Custom fields: `item.etch.<field_id>` for Etch fields, `item.meta.<field_id>` for WordPress meta, and the integration namespace for ACF.
- Dot notation takes only letters, digits and underscores. Use brackets for the rest: `{item["full name"]}`.
- Arrays are zero-based. Guard an array before you index it, because a post can have none.
- Environment check: `{#if environment.current === "etch"}`.
- Literal braces: `{"{text}"}`.
- Modifiers `.at(n)`, `.length()` and `.equal(...)` are documented only by example. Test before you rely on them.
- Empty state: a second loop over `posts.length().equal(0, [1], [])` that renders a "no results" message. The docs call this a workaround.

## Loops

- Syntax: `{#loop name as item, index}...{/loop}`. The source can be a named loop, an inline array literal, or a data path.
- Loop the `<li>`, not the card inside it. Put `data-etch-element="container"` on the list.
- Custom query args use the PHP array form. Templates usually pick up the main query automatically.
- Image keys conflict between docs pages. The loops page uses `item.featuredImage.url`. The keys page uses `image.url`. Dump a real loop item and use what it shows.

## Components

- A component is a reusable block with editable props. It is not a template.
- Prop types: text, boolean, select, media, loop, object, class, group. Each has a Name (label) and a Key (code identifier).
- Create with `etch.components.createAsync(name)`, then define with `updateAsync(id, { ... })`. Both persist at once.
- The docs read so far do not give the markup syntax for prop references, slots, or instances. Confirm with `Object.keys(etch.components)` and a test on a scratch page before you build on it.

## Build checklist

1. Acquire the API and read `etch.environment`.
2. Confirm the capabilities you need.
3. Read the data shape with a dump, not from memory.
4. Write block trees, then styles.
5. `await etch.saveAsync()`.
6. Check the page visually in the browser.

## Known gaps

- Pages on docs.etchwp.com not read: blocks, components, loops, fields, navigation, ui-and-history, types-reference, and the integrations. Their signatures are unverified.
- The `doc.etchwp.com/studio` host does not resolve. Studio docs are the live `get_guide` and `etch.skills`.
- Whether `etch.fields` is backed depends on the `fields` capability. Check it per site before you author fields.
