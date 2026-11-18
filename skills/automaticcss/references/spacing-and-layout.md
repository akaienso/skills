# ACSS 4 — spacing, dimension and layout

Principles:

- Spacing is **gap-first**: flex or grid plus `gap`; margins are rare.
- All tokens are fluid between Minimum Width (`vp-min`) and Content Width (`vp-max`). Don't change spacing at breakpoints.
- Use logical properties (`padding-block`, `max-inline-size`).
- No hard-coded px that duplicates a token.

## Standard spacing setup (Spacing panel)

- **Base value:** `base-space` (desktop, at Content Width) and `base-space-min` (mobile, at Minimum Width). This is **M**. Change it to make all spacing bigger or smaller.
- **Ratio:** `space-scale` (desktop) and `mob-space-scale` (mobile). Sizes above M are multiplied by the ratio and sizes below are divided. Change it to adjust the spread between sizes.
- Affects spacing variables, section classes, contextual gaps and header classes.

Source: https://docs.automaticcss.com/spacing/standard-spacing-setup

## Spacing variables

- **Standard:** `--space-{xs|s|m|l|xl|xxl}`. Use them for padding, gap, margin and offsets. There is no `--pad-*` token: spacing is spacing.
- **Section:** `--section-space-{xs|s|m|l|xl|xxl}`, plus `--gutter` (inline gutter).
- **Bridge:** `--space-{large}-to-{small}` and `--section-space-{large}-to-{small}`. A bridge goes from the desktop max of the larger size to the mobile min of the smaller one. Every larger → smaller pair exists:
  - from xxl: `-xxl-to-xl`, `-xxl-to-l`, `-xxl-to-m`, `-xxl-to-s`, `-xxl-to-xs`
  - from xl: `-xl-to-l`, `-xl-to-m`, `-xl-to-s`, `-xl-to-xs`
  - from l: `-l-to-m`, `-l-to-s`, `-l-to-xs`
  - from m: `-m-to-s`, `-m-to-xs`
  - from s: `-s-to-xs`
- **"Tweener" sizes:** use `calc()` and stay within about ±(scale midpoint), e.g. `calc(var(--space-l) / 1.1)`. If you'd need `calc(var(--space-m) * 1.5)`, that's just `--space-l`.

> Conflict: whats-new-in-4 announces XXL → 2XL. The spacing docs use `xxl` everywhere. Confirm against the project's generated ACSS token/class list (Studio: `etch.skills.getReference('acss','tokens.md' | 'classes.md')`; WordPress: the generated stylesheet or `wp acss settings`).

```css
.testimonial-card {
  display: flex; flex-direction: column;
  gap: var(--content-gap);
  padding: var(--space-m);
}
.hero { padding-block: var(--section-space-xl-to-s); }
.ad-band { padding-block: var(--section-space-m); padding-inline: var(--gutter); } /* non-section that behaves like one */
.overlap-img { margin-block-start: calc((var(--section-space-m) + var(--space-l)) * -1); }
```

Source: https://docs.automaticcss.com/spacing/spacing-variables

## Section spacing

- Settings:

| Dashboard setting | Setting id | What it does |
|---|---|---|
| Desktop Multiplier / Mobile Multiplier | `space-adjust-section` / `mob-space-adjust-section` | Multiply base spacing for sections (fluid) |
| Gutter | `gutter-min` / `gutter-max` | Inline padding, output as `--gutter` |
| Block Padding | `section-padding-block` | Default is `--section-space-m`. One value sets both ends; two values set top and bottom. |

- **Defaults:** top-level `section` elements get M block padding and gutter inline padding automatically (default section styles use `:where()`). **Never hand-pad sections.**
- **Structure:** a `section` with a gutter, containing an inner div at content width, auto-centred, with no inline padding.
- **Section classes:**
  - `.section--{xs|s|m|l|xl|xxl}` changes **block padding only** and keeps the gutter.
  - Don't name your own classes `section--*`.
  - In Etch, ACSS loads after your class styles. To beat a `.section--*` with your own rule, raise specificity: `&.section--xs {…}`.
- **Header padding classes:** `.header--{xs|s|m|l|xl|xxl}` adjust block padding on the site header and keep the inline gutter. They use the **standard** spacing scale, not the section scale.

Sources: https://docs.automaticcss.com/spacing/section-spacing, https://docs.automaticcss.com/spacing/section-padding-classes, https://docs.automaticcss.com/spacing/header-padding-classes

## Contextual spacing

| Token | Use for | Setting (default in the toolkit's example export) |
|---|---|---|
| `--container-gap` | Gap between containers (direct child divs) inside a `section` | `contextual-container-gap` (`--space-xxl`) |
| `--content-gap` | Gap between content items (headings, text, media) in a container | `contextual-content-gap` (`--space-m`) |
| `--grid-gap` | Gap between grid and column items | `contextual-grid-gap` (`--space-m`) |

- Keep the context and scale it: `gap: calc(var(--grid-gap) * 2)`. Don't switch to an unrelated `--space-*`.
- **Padding never uses contextual gap tokens**; use `--space-*` (toolkit rule).
- Docs mention the classes `.container-gap`, `.content-gap` and `.grid-gap`.
  > Conflict: the contextual-spacing doc uses these classes; the toolkit's example export has `option-gaps` **off**. Confirm against the project's generated ACSS token/class list (Studio: `etch.skills.getReference('acss','tokens.md' | 'classes.md')`; WordPress: the generated stylesheet or `wp acss settings`).
- **Automatic Spacing** applies these at zero specificity, and each part can be toggled:
  - `option-container-gap`: section → direct child divs.
  - `option-content-gap`: direct child divs of sections.
  - `option-grid-gap`: "grids that use grid utility classes", which v4 no longer has, so this effect is unverified in v4.

Sources: https://docs.automaticcss.com/spacing/contextual-spacing, https://docs.automaticcss.com/spacing/automatic-spacing

## Smart Spacing (rich content)

- Toggle: `option-smart-spacing` (Spacing > Smart Spacing).
- **What it does:** zeroes default margins on headings, `p`, lists and `li`, so `gap` works evenly. It re-adds spacing between adjacent siblings only inside rich-text/post content, `.smart-spacing`, `smart-spacing-selectors` (quoted, comma-separated) and WooCommerce content.
- **Toolkit rule:** every wrapper around rich content (`{this.content}`, WYSIWYG fields, legal pages) gets `.smart-spacing` next to its BEM class: `class="article__body smart-spacing"`.
  - Don't add gap, flex/grid or margins to space its children.
  - Layout *around* the wrapper is still gap-first.
- It applies to **direct children only**. With an extra wrapper, move the class to that wrapper or add a target selector.
- Opt out with `.smart-spacing--off` (box, section or page). This removes **all** spacing, so use gaps instead.
- "Avoid Duplicate Margins" (`smart-spacing-duplicate-margin-elements`) defaults to `:is(figure, blockquote, ul, ol):where(:not(:first-child))`.
- **Tokens:**
  - Text: `--paragraph-spacing`, `--heading-spacing`, `--h{2-6}-spacing`
  - Lists: `--list-spacing`, `--list-indent-spacing`, `--list-item-spacing`, `--nested-list-spacing`, `--nested-list-indent-spacing`, `--nested-list-item-spacing`
  - Other: `--flow-spacing` (catch-all), `--figure-spacing`, `--figcaption-spacing`, `--blockquote-spacing`
  - Settings marked "(block)" accept two values.

Source: https://docs.automaticcss.com/spacing/smart-spacing

## Dimension

- **Content width:** `--content-width` (setting `vp-max`) is always output; `.content-width` sets it as `max-inline-size` and centres.
  - Etch section containers already get content width, so don't add random `max-inline-size` values.
  - A fraction such as `calc(var(--content-width) * .75)` stays 100% wide on mobile, unlike a percentage.
- **Content width safe:**
  - `--content-width-safe` = `min(var(--content-width), calc(100% - var(--gutter) * 2))`.
  - `.content-width--safe` sets `inline-size: 100%`, `max-inline-size` and `margin-inline: auto`.
  - Use it where no parent provides a gutter. Never inside a guttered parent, or you get a double gutter.
- **Width utilities:**
  - Variables `--width-{10…90}` (`calc(var(--content-width) * .N)`; toggle `option-width-variables`).
  - Classes `.width--{10…90}`, `.width--full`, `.width--auto`, `.width--max-content`, `.width--min-content`, `.width--fit-content` (toggle `option-width`). Each sets `inline-size` + `max-inline-size`.
- **Boxed layout** (`option-boxed-layout`): `html` is the canvas, `body` the box. Settings: `body-max-width`, `body-margin-top`, `body-border-*`, `body-box-shadow`, plus Device Background.
- **Header height** (Layout > Header):
  - `header-height-min` / `header-height-max` (px) produce a fluid `--header-height`.
  - `option-offset-page-content` adds `margin-block-start: var(--header-height)`. Exclusions: `offset-content-header-exclusion` (default `[data-sticky-header='0'], .content-offset--off`) and `offset-content-page-exclusions`.
  - `option-use-header-height-for-scroll-offset` uses the header height for scroll margins.
  - Sticky offset (Additional Styling > Sticky) can be overridden with `--sticky-offset`.
- **Scroll offsets:** `scroll-margin-max` / `scroll-margin-min` (px) add on top of the header height.
- **Auto object fit** (`option-auto-object-fit`, off by default): every `img` gets `object-fit: var(--object-fit, cover)` and `object-position: var(--object-position, 50% 50%)`. Override the variables on a parent.

```css
.article__body { inline-size: 100%; max-inline-size: var(--width-60); margin-inline: auto; }
.banner__inner { inline-size: 100%; max-inline-size: var(--content-width-safe); margin-inline: auto; }
```

Sources: https://docs.automaticcss.com/dimension/content-width, https://docs.automaticcss.com/dimension/content-width-safe, https://docs.automaticcss.com/dimension/width-utilities, https://docs.automaticcss.com/dimension/boxed-layout, https://docs.automaticcss.com/dimension/header-height, https://docs.automaticcss.com/dimension/scroll-offsets, https://docs.automaticcss.com/dimension/auto-object-fit

## Grids

v4 has **no grid utility classes**. `.grid--N`, `.grid--1-2`, `.grid--auto-N`, breakpoint variants and `.col-span--N` were all removed. Prefer grid over flex for structural layout.

- **Grid variables** (`option-grid-variables`):
  - Equal columns: `--grid-1` … `--grid-12`.
  - Ratio columns: `--grid-1-2`, `--grid-1-3`, `--grid-2-1`, `--grid-2-3`, `--grid-3-1`, `--grid-3-2`.
  - Spans: `grid-column: span 2`.
- **Auto grids:**
  - Variables `--grid-auto-2` … `--grid-auto-12` (toggle `option-auto-grid-variables`). They stack when items get narrow, need no breakpoints, and calculate from `--grid-gap`, so use that gap. Setting `--min` has no effect on them.
  - Global defaults (Layout > Auto Grid): `auto-grid-flow-option` (`auto-fit` or `auto-fill`) and `auto-grid-aggressiveness` (0–1, default `.7`).
  - Recipe `?auto-grid;`: edit `--column-count`, `--auto-grid-aggressiveness` or `--min`. It contains an optional "force even columns" block.
  - Mixin: `@include auto-grid($column-count, $min, $flow)` (Global SCSS only).
  - Spans aren't practical in auto grids, and there are no auto ratio grids.
- **Variable grid:** recipe `?variable-grid;` sets `--min: 350px`; change `--min`, or set it inline or from JS. The `.variable-grid` class is gone. The toolkit's expansion is `repeat(auto-fit, minmax(min(var(--min), 100%), 1fr))` with `gap: var(--grid-gap, 1em)`.
- **Fixed-count recipes:** `?grid-3`, `?grid-1-2` and similar (see the recipes reference).
- **Responsive:** use your own query in the class.
  - The docs show a desktop-first `@media (max-width: 768px)`. The toolkit prefers mobile-first `@media (min-width: to-rem(768px))` to reduce CSS. Both are valid.
  - Use container queries for components placed in varied widths.

```css
.service-grid {
  display: grid;
  gap: var(--grid-gap);
  @media (min-width: to-rem(768px)) { grid-template-columns: var(--grid-3); }
}
.card-grid { display: grid; grid-template-columns: var(--grid-auto-3); gap: var(--grid-gap); }
```

- **Content grid** (`option-content-grid`):
  - `.content-grid` on any box (nestable) creates the zones content, feature, feature-max and full.
  - Items go in the content zone by default.
  - Item classes: `.content--feature`, `.content--feature-max`, `.content--full`, `.content--full-safe`. Or set `grid-column: feature | feature-max | full`.
  - Zone widths (per side): settings `content-feature` / `content-feature-max`, or locally `--feature-width` / `--feature-max-width` / `--content-width`.
  - `option-content-grid-sections` makes every section a content grid; opt out with `.content-grid--off` or `content-grid-exclusions`. On a `section`, the grid supplies the gutter itself.
- **Auto-alternating grids:**
  > Conflict: the doc (2025) uses `.grid--*` + `.grid-alternate--{bp}`, which rely on removed classes and breakpoints. Treat them as unavailable in v4; alternate with `:nth-child(even)` + `order` inside a `@media (min-width: …)`.
- **Masonry:**
  > Conflict: `grids/masonry-layouts` (2025) lists `.masonry--1…5`; `columns/masonry-layouts` (v4) says they were removed. Use `?columns`.

Sources: https://docs.automaticcss.com/grids/grid-variables, https://docs.automaticcss.com/grids/grid-classes-standard, https://docs.automaticcss.com/grids/auto-grids, https://docs.automaticcss.com/grids/auto-grid-mixin, https://docs.automaticcss.com/grids/variable-grid, https://docs.automaticcss.com/grids/content-grid, https://docs.automaticcss.com/grids/auto-alternating-grids, https://docs.automaticcss.com/grids/masonry-layouts

## Flexbox: flex grids and flex recipes

- **`?flex-grid;`** (4.0.2+, replaces `.flex-grid--N`): items in an unfinished last row are centred (or stretched). Locals: `--gap` (`var(--grid-gap, 1.5rem)`), `--columns` (3), `--stretch` (0/1). Built-in queries go to 2 columns at ≤900px and 1 at ≤600px.
- **Other recipes:** `?flex-row`, `?flex-column`, and (4.0.2+) `?center-all`, `?center-left`, `?center-right`, `?center-top`, `?center-bottom`.
  > Conflict: the docs say `?flex-grid` and the centring recipes are available "in Bricks and Gutenberg" since 4.0.2. Their availability in Etch and Etch Studio isn't stated (unverified). If a recipe doesn't expand, write the plain CSS.

Sources: https://docs.automaticcss.com/flexbox/flex-grids, https://docs.automaticcss.com/flexbox/flex-recipes

## CSS columns and masonry

- Column classes (`.col-count--`, `.col-width--`, `.col-rule--`, `.col-span--`) were removed. Use the **`?columns`** recipe.
- Recipe locals: `--col-count`, `--col-min-width`, `--col-gap`, `--row-gap` (applied as child margin), `--col-rule-style`, `--col-rule-width`, `--col-rule-color`.
- Global tokens:
  - Column widths: `--col-width-{s|m|l}` (settings `col-width-*`; toolkit example defaults 13 / 25 / 38rem).
  - Rule widths: `--col-rule-width-{s|m|l}`.
- Masonry: `?columns` + `--col-count`, or `--col-min-width` for responsive stacking.

```css
.gallery { /* after ?columns; */
  --col-min-width: var(--col-width-m);
  --col-gap: var(--grid-gap);
  --row-gap: var(--grid-gap);
}
```

Sources: https://docs.automaticcss.com/columns/css-columns, https://docs.automaticcss.com/columns/masonry-layouts
