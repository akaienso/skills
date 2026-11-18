# ACSS 4: Mixins, Functions, Recipes (and what works in Etch)

## Etch compatibility: answer first

- **ACSS mixins (`@include …`) and ACSS SCSS functions do not work in Etch's CSS panel, on EtchWP or in Etch Studio.**
  - ACSS: "Functions and mixins are designed for use in the Custom SCSS area of the Automatic.css dashboard. They will not work in the builder inputs or builder CSS." and "most page builders don't include a SCSS pre-processor."
  - Etch: "Even though Etch isn't SCSS-powered, we've enabled SCSS-like stemming." Etch CSS is native CSS plus nesting, `&__` / `&--` / `&_` / `&-` stemming, auto `var()` and `calc()` wrapping, and the Etch function `to-rem()`. Nothing in the Etch docs mentions `@include` or SCSS functions.
- **Where mixins do work:** EtchWP only, in the ACSS WordPress dashboard's Global SCSS screen ("Automatic.css's mixins and functions are available there without any import"). That CSS is global: it targets your Etch class names but is not attached to Etch elements.
- **Etch Studio:** SCSS support is not documented. The docs say Etch isn't SCSS-powered, and ACSS mixins work only in the Global SCSS screen of the WordPress dashboard, so treat mixins as unavailable in Studio.
- **Recipes:** ACSS: "Etch has its own built-in recipes and doesn't use the ones on these pages." In Etch, type `?` in the CSS panel to get Etch's recipe list (same list on EtchWP and Studio). ACSS-only recipes (`?btn`, `?divider-*`, `?overlap`, `?{color}-clr`, …) are unverified in Etch.
- **Agents writing CSS by API** (`etch.styles`, Public API, Studio `eval`): recipes are editor expansions. ACSS: "you can't paste these recipe strings. They'll only expand when the semicolon on the end is actually typed." A literal `?flex-grid;` written by API almost certainly stays literal (not tested). Write the expanded CSS yourself.
- `to-rem()` is Etch's own function (`to-rem(800px)` → `50rem`, 16px base) and works anywhere in Etch's interface. It is not an ACSS function.

Source: https://docs.automaticcss.com/mixins/what-are-mixins, https://docs.automaticcss.com/setup/global-scss-imports, https://docs.automaticcss.com/recipes, https://docs.etchwp.com/interface/css-panel, https://docs.etchwp.com/studio/interface/css-panel, https://docs.etchwp.com/utilities/functions

> Conflict: ACSS docs call the SCSS area both "Custom SCSS" (most mixin pages) and "Global SCSS" (auto-grid mixin, setup pages). Same screen; 4.x setup pages use "Global SCSS".

## What mixins are

- SCSS blocks ACSS uses internally, exposed for your selectors with `@include name(args)`.
- Arguments are positional and must be answered in order; to set a later one, set the earlier ones or name it (`$flow: auto-fill`). Most have defaults.
- Typical use: give third-party or unclassable markup ACSS styling (e.g. WooCommerce buttons) from Global SCSS.

Source: https://docs.automaticcss.com/mixins/what-are-mixins

## Mixin reference (ACSS Global SCSS only)

- `auto-grid($column-count, $min, $flow)`: responsive auto grid. `$column-count` default `1`; `$min` scaled by Layout > Auto Grid Aggressiveness (default `.7`); `$flow` `auto-fit`/`auto-fill`. `.logos { @include auto-grid(4, $flow: auto-fill); }`
- `border($style, $position, $radius)`: global border. Defaults: site border style, all sides, `var(--radius)`; `$radius: no` drops radius. `.panel { @include border(light, block-start, var(--radius-l)); }`
- `btn($style, $props)`: a full button style. `$style` default `primary`; values `{color}`, `{color}-light`, `{color}-dark`, or quoted outline `"primary.btn--outline"`. `$props: no` outputs only the variables (for `.btn--` classes, which already get the property keys). Double the selector if specificity loses. `.woocommerce a.button.button { @include btn(primary); }`
- `card`: card framework styles on an unlisted selector. `.promo-tile { @include card; }`
- `card-container("range")`: card container query; needs Card Framework on, card container query support on, the range in quotes. `.svc-card { @include card-container("inline-size > 767px") { … } }`
- `center($alignment, $output)`: `$alignment` `all` (default) / `left` / `right` / `top` / `bottom`; `$output` `full` / `core` / `tokens`. Outputs a doubled selector on purpose. `.hero__inner { @include center(left); }`
- `clickable-parent`: on the actual `a`/`button`; parent must be `position: relative`. `.card__title a { @include clickable-parent; }`
- `content-grid`: no arguments; then place children with `grid-column: feature;` etc.
- `fade($axis, $amount)`: `$axis` `block` / `inline` / `top` / `right` / `bottom` / `left`; `$amount` default 25%. `.hero__media { @include fade(block, 35%); }`
- `focus-parent(shadow | outline)`: on the card. `.card { position: relative; @include focus-parent(shadow); }`
- `heading-style(h1…h6)` and `text-style(size)`: copy global heading or text-level styles; null properties are skipped. `.eyebrow { @include text-style(l); }`
- `icon($style, $box-style)`: `$style` `light`/`dark`; `$box-style` `box` = boxed, anything else = plain; `$style` required if `$box-style` is given (`icon(box)` is invalid). Features switched off in the dashboard can't be called this way.
- `line-clamp($line-count)`: `.excerpt { @include line-clamp(3); }`
- `texture($number)`, `texture-overlay($number)`: numbered textures only. These link to a "Textures & Overlays" page; whether textures still exist in ACSS 4 (now "Surfaces & Overlays") is unverified.
- Removed in 4.0: `breakpoint()`, `breakpoint-up()`; compiling fails if they remain. Write `@media (max-width: 768px) { … }`.

> Conflict: the center mixin page still shows `@include breakpoint(l) { @include center(left, tokens); }`. Breakpoint mixins were removed in 4.0; use a media query.

Source: https://docs.automaticcss.com/mixins/auto-grid-mixin, https://docs.automaticcss.com/mixins/border-mixin, https://docs.automaticcss.com/mixins/button-mixins, https://docs.automaticcss.com/cards/card-targeting, https://docs.automaticcss.com/mixins/card-container-mixin, https://docs.automaticcss.com/mixins/center-mixin, https://docs.automaticcss.com/mixins/clickable-parent, https://docs.automaticcss.com/mixins/content-grid-mixin, https://docs.automaticcss.com/mixins/gradient-fades, https://docs.automaticcss.com/mixins/focus-parent, https://docs.automaticcss.com/mixins/heading-text-style-mixins, https://docs.automaticcss.com/mixins/icon-mixin, https://docs.automaticcss.com/mixins/line-clamp-utilities, https://docs.automaticcss.com/mixins/texture-overlay-mixins, https://docs.automaticcss.com/mixins/breakpoint-mixins

## Functions (gap: pages empty)

- The 4.0 function pages converted to empty files: `functions/calc`, `functions/ctr`, `functions/fluid-function`, `functions/pow-function`, `functions/rem-function`. Signatures are unverified. No `percent` function page exists.
- From other pages: typography and section-spacing pages say custom sizes can be made "using the fluid() function"; the docs home says "Automatic REM Conversion – Use pixel values followed by 'ctr' and ACSS converts them to proper REM units" (exact syntax unverified); "String Expansion" turns `--x` into `var(--x)` and `1 + 1` into `calc(1 + 1)`.
- All are ACSS SCSS features (Global SCSS / dashboard inputs), not Etch CSS. In Etch use `to-rem()`, native `calc()`, `clamp()`, and ACSS tokens. For fluid sizes prefer existing tokens (`--h2`, `--text-l`, `--space-l`).

Source: https://docs.automaticcss.com/functions/fluid-function (empty), https://docs.automaticcss.com/typography/fluid-text, https://docs.automaticcss.com/ (index), https://docs.etchwp.com/utilities/functions

## Recipes: how they work

- Type `?name;` in a CSS field. The `?` opens auto-suggest; the typed `;` (Enter in single-line inputs) expands it. Pasted strings don't expand. 4.0 changed the prefix from `@` to `?`.
- Three shapes (ACSS, Bricks/Gutenberg): declaration recipes go inside a rule (`?center-all;`); selector recipes expand a whole `%root% { … }` block (`?auto-grid`, `?flex-grid`, `?fade-top`, `?list-none`); value recipes go after a property (`background: ?color-mix;`).
- Etch has no `%root%` (its CSS panel is locked to the element's selector, and nesting does the rest). Etch's example: `.foo { ?auto-grid; }` expands to the full declarations plus a nested `> *` rule.
- Recipes expose real CSS with local variables; edit the variables (`--column-count`, `--gap`, …), not the formulas.
- Custom recipes: not available yet in Etch ("only … native recipes provided by the Etch team").

Source: https://docs.automaticcss.com/recipes, https://docs.etchwp.com/utilities/recipes/intro, https://docs.etchwp.com/utilities/recipes/custom

## Recipe list by category

[E] = listed in Etch's recipe docs (EtchWP and Studio pages are identical). Everything else is an ACSS recipe, unverified in Etch.

Layout / flex / grid
- `?flex-row` [E], `?flex-column` [E]: flex direction shortcuts.
- `?center-all`, `?center-left`, `?center-right`, `?center-top`, `?center-bottom` [E]: centering.
- `?flex-grid` [E]: flex grid with centered unbalanced items; `--columns` (3), `--gap`, `--stretch` (0/1). Etch's version reduces columns at 900px and 600px.
- `?grid-1` … `?grid-12`, `?grid-1-2`, `?grid-1-3`, `?grid-2-1`, `?grid-2-3`, `?grid-3-1`, `?grid-3-2` [E]: fixed grids.
- `?auto-grid` [E]: `--column-count`, `--auto-grid-aggressiveness` (.7).
- `?variable-grid` [E]: `--min` (350px in ACSS 4.0.2).
- `?content-grid` [E]: content-grid zones (`grid-column: feature`).
- `?columns` [E]: text columns; `--col-count`, `--col-min-width` (350px), `--col-rule-style` (none), `--col-rule-width`, `--col-rule-color`, `--col-gap`, `--row-gap`.
- `?overlap`, `?overlap-alt`: overlap backgrounds; `--background`, `--foreground`, `--overlap-amount`, `--overlay`.
- `?container`, `?card-container`: empty `@container card (…)` query; add `container: card / inline-size;` to the wrapper yourself.

Borders / dividers
- `?concentric-radius` [E]: `--padding`, `--inner-radius`. `?concentric-radius-reverse` [E]: Etch lists `--minimum-inner-radius`.
- `?divider-top`, `?divider-bottom`, `?divider-all`: global divider (not in Etch's list).
- `?border-check`: listed as new in 4.0.2, no description.

Color / gradient / effects
- `?{color}-clr`, `?{color}-{shade}-clr`: expands to `oklch(from var(--primary) l c h / 1)` (4.0.2+).
- `?color-mix` [E], `?transparency` (4.0.2, undescribed).
- Gradients: ACSS mentions `?linear-gradient` as a value recipe; Etch lists `gradient-linear`, `gradient-radial`, `gradient-conic`, `gradient-sharp`, `gradient-fade`, `gradient-vignette`, `gradient-text`, `gradient-border` [E] (`--color-1`, `--color-2`, `--color-3`, `--stop`).
- `?fade-block`, `?fade-inline`, `?fade-top`, `?fade-right`, `?fade-bottom`, `?fade-left` [E]; `?fade-all` (ACSS 4.0.2); `--fade-softness`.

Accessibility
- `?clickable-parent` [E], `?focus-parent` [E], `?skip-link` [E]. See accessibility.md.

Components / misc
- `?btn`: custom button variables (ACSS suggests `.btn--custom`; Studio says don't name classes `btn--*`).
- `?corner-ribbon` [E]: plus `data-ribbon-position="top-left|top-right"`; `--ribbon-width`, `--ribbon-offset`, `--ribbon-background-color`, `--ribbon-text-color`, `--ribbon-text-size`, `--ribbon-shadow`, `--ribbon-padding`.
- `?tooltip`: new in 4.0.2, undescribed.
- `?footer-reveal` [E]: sticky reveal footer next to `main`.
- `?is-bg` [E]: element becomes a layered background.
- `?font-face` [E]: `@font-face` template.
- `?line-clamp` [E]: `--line-count`.
- `?list-none`: list reset (`.list--none` is gone in 4.x).
- `?property`: `@property` declaration template.
- `?ipsum-short`: dummy paragraph. `?script`: `<script type="module">` wrapper. `?query-children`: nested query loop children (builders that support it).
- Pseudo recipes [E]: `?::before`, `?::after`, `?::before,::after`, `?:hover`, `?:focus-visible`, `?:hover,:focus-visible`, `?hover-exclude-touch`.
- Etch-only [E]: `brace-contain`, `brace-left`, `brace-right` (literal braces in dynamic data).
- Removed in 4.0.2: all `?breakpoint-*` recipes.

> Conflict: the ACSS recipes intro says `?btn` works "in the CSS input of an element in the builder". The same intro says Etch doesn't use ACSS recipes, and Etch's list has no `btn`. In Etch, reference `--btn-*` tokens by hand.

Source: https://docs.automaticcss.com/recipes and its sub-pages (`recipes/accessibility-recipes`, `border-radius-recipes`, `button-recipes`, `card-container-recipe`, `color-recipes`, `column-recipes`, `content-grid-recipe`, `custom-property-recipes`, `divider-recipes`, `flex-recipes`, `gradient-fades`, `grid-recipes`, `ipsum-recipes`, `javascript-recipes`, `list-recipes`, `media-query-recipes`, `overlap-recipes`, `query-loop-recipes`, `ribbon-recipes`, `text-recipes`); https://docs.etchwp.com/utilities/recipes/ (`flex-recipes`, `grid-recipes`, `miscellaneous-recipes`, `pseudo-selector-recipes`, `fade-recipes`, `color-recipes`, `gradients-recipes`, `ribbons-recipes`, `accessibility-recipes`)
