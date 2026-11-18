---
name: etch-shared-rules
description: Cross-platform rules for building Etch sites on Etch Studio and EtchWP - section and container markup, BEM names, where class CSS goes, flat rules, rem values, keyframes, images, and conditions. Use before writing any Etch markup or CSS on either platform.
---

# Etch shared rules (Etch Studio and EtchWP)

These rules hold on both platforms. Platform APIs live in `etch-studio-build` and `etchwp-build`. Styling tokens live in `automaticcss-etch`.

## Markup

- The top level of each page is `section`. No `<main>` or other wrapper around sections. Build a full page section by section.
- Each section holds one container: `data-etch-element="container"`. Sections and containers already flex-column and centre their content, so do not duplicate that CSS.
- Cards are a BEM block with a semantic tag: `<article>` when standalone, `<li>` inside a list. Never default to `<div>`, and never use the deprecated `flex-div`.
- Collections are `<ul>`/`<ol>`. Loop the `<li>`, not the card inside it. The wrapper is a block (`posts-list`), never `section__grid`.
- Anything repeated or reusable is a component with props. Do not paste instance after instance by hand.
- A component that can be a list item takes a `tag` select prop (`li`, `article`, `div`). In a list, set `tag` to `li`. Never add an extra `li` wrapper.
- Never build a class from a prop (`card--{props.variant}`). Use `data-variant="{props.variant}"` and style `&[data-variant="featured"]` inside the base rule.
- Images: use the image element, not a plain `img`. In Studio that is `etch/dynamic-image` with `mediaId`. In EtchWP, `<etch:img>`.
- Conditions: no defensive checks by default. Use paired `{#if x}` and `{#if !x}` blocks. There is no `{#else}` block in the docs read so far. Inline `??` and `||` fallbacks are unconfirmed: one source says Studio added them in a 2026-10-29 changelog entry, and the toolkit says they are not supported. Check the live guide for the product and version you are on.

## Naming

- BEM: `block`, `block__element`, `block--modifier`.
- Name a block for what it is, never where it sits. No `home-hero`, `top-section`, `sidebar-box`. `site-` is only for site-wide singletons (`site-header`).
- A modifier sits beside its base class: `class="card card--featured"`.
- An element belongs to one block. Do not chain (`card__body__title`); write `card__title`.

## Where CSS goes

- Class CSS belongs on that class's own selector record. In Studio that is `etch.styles`. In EtchWP, the per-class CSS box or `etch.styles`.
- Do not put class CSS in a global stylesheet. Those are for `@keyframes` and other CSS tied to no class.
- Toolkit rule (`AGENTS.md`): the only global CSS allowed is `@keyframes`. The Studio guide also allows `@property`, a global reduced-motion rule, and `@font-face` when ACSS does not manage fonts. Use those extras only when the project owner agrees.
- Do not write resets or base element rules. Etch ships a reset and ACSS owns base styles.
- Flat BEM: every BEM class gets its own top-level rule. Nest only `&:hover`, `&::before`, `@media` and `@container` inside the selector they change.
- Never nest `&__x` or `&--x` inside a parent rule. Never put a root-level `@media` around a component selector.
- Use `to-rem(768px)`, not raw `rem`. `to-rem()` takes no negatives: write `calc(to-rem(48px) * -1)`.
- Prefer logical properties (`max-inline-size`, `padding-block`).
- If an element is under 20px wide or max-width, set `--empty-element-size: 0` on it.
- `@keyframes` go in one global stylesheet named `Animations`. Never nest them in a class. Classes only reference them through `animation`.
- No Tailwind (classes or workflow). No vendor prefixes unless asked.
- When delivering CSS into a per-class CSS box, send bare declarations with no outer selector.

## Before you write

- Read the platform's own guide first. In Studio, `get_guide`, then `etch.skills.list()`. On EtchWP, the Public API docs.
- If the project runs ACSS, read `automaticcss-etch` before any colour, space, type, width or button value.

## Known conflicts (verify before you write)

- Image keys: the toolkit says `.featuredImage` for the URL and `.image.id` for the ID. The EtchWP keys page lists `image`, `image.url`, `image.alt`, `thumbnail`, and does not list `featuredImage`. Dump the real loop item first and use the key it shows.
- Studio data keys: Studio data shapes come from its own data sources, not WordPress posts. Read the real shape with `etch.dataSources.resolveAsync(key)` before you write a path. Checked read-only on a test project: the `news` source returns records with `id`, `title`, `excerpt`, `imageId`, `isoDate`, `date`. There the image key is `imageId`, not `featuredImage`.
