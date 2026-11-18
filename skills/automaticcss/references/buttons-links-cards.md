# ACSS 4: Buttons, Links, Cards, Blockquotes

Scope: AutomaticCSS 4.x with Etch (EtchWP and Etch Studio). Names below come from docs.automaticcss.com (4.0 docs, read 2026-11-17) unless marked otherwise. In Etch Studio, the project's generated `tokens.md` / `classes.md` (`await etch.skills.getReference('acss', 'tokens.md')`) win over this file.

## Buttons: classes

- Prefix is abbreviated: `.btn--` (never `.button`). Works on `<a>` and `<button>`.
- Solid: `.btn--{color}` for every active palette color: `primary`, `secondary`, `tertiary`, `accent`, `base`, `neutral`. Default to `.btn--primary`.
- Light/dark variants: `.btn--{color}-light`, `.btn--{color}-dark` (e.g. `.btn--primary-light`). Use them alone, never together with `.btn--primary`.
- Outline: add `.btn--outline` next to a color class: `.btn--primary btn--outline`. Works with light/dark variants. Needs "Outline Variants" on in Buttons & Links > Options.
- Sizes (t-shirt): `.btn--xs`, `.btn--s`, `.btn--m`, `.btn--l`, `.btn--xl`, `.btn--xxl`.
- Combine freely, order doesn't matter: `class="btn--primary btn--outline btn--s"`.
- `.unrelate` on a button stops automatic color relationships from recoloring it on colored backgrounds.
- Removed in 4.0: action, white, black and shade button styles.
- Button styles only load for colors that are on in the palette and whose button group is on (Options per color: solid, outline, light/dark).

> Conflict: the third-party toolkit (`agent-docs/acss/buttons.md`) lists sizes as "xs, s, l, xl, xxl" (no `m`). ACSS docs list xs–xxl including `m`.

Source: https://docs.automaticcss.com/buttons/button-classes, https://docs.automaticcss.com/buttons/outline-buttons, https://docs.automaticcss.com/buttons/button-styling

## Buttons: global styling (dashboard: Buttons & Links)

- Defaults apply to all buttons: padding block/inline (em preferred), min width, line height, letter spacing, font weight/family/style, text transform, text decoration (+ hover), custom text size (else "M" text size), border width (shared by solid and outline since 4.0), border style, radius (defaults to global `--radius`), transition (global or manual).
- Per color group: background, background hover, text color, text hover, border color, border hover, focus color. Use color tokens.
- Don't put `.rounded`-style classes or radius tokens on buttons; set button radius in the dashboard.
- Etch Studio: change button settings with `etch.acss.listSettingsAsync('btn')` then `etch.acss.updateSettingsAsync({...})`. Exact setting ids: read them live (not listed in ACSS docs).

Source: https://docs.automaticcss.com/buttons/button-styling

## Buttons: `--btn-*` variables

Locally scoped, override on any selector (a button, a section, a body class):

`--btn-background`, `--btn-background-hover`, `--btn-text-color`, `--btn-text-color-hover`, `--btn-text-transform`, `--btn-text-decoration`, `--btn-text-decoration-hover`, `--btn-letter-spacing`, `--btn-line-height`, `--btn-font-size`, `--btn-font-weight`, `--btn-font-family`, `--btn-font-style`, `--btn-padding-block`, `--btn-padding-inline`, `--btn-min-width`, `--btn-align-items`, `--btn-transition`, `--btn-border-color`, `--btn-border-color-hover`, `--btn-border-style`, `--btn-radius`, `--btn-border-width`, `--focus-color`.

```css
.pricing-card .btn--primary {
  --btn-padding-block: 1.25em;
  --btn-font-weight: 700;
  --btn-background: var(--primary-dark);
  --btn-background-hover: var(--primary-ultra-dark);
}
```

- Removed in 4.0: `--btn-outline-border-width` and all other `--btn-outline-*`; outline buttons use the same `--btn-*` set on `.btn--outline`.
- Custom button in plain CSS (Etch) by referencing tokens:

```css
.hero__cta {
  padding-block: var(--btn-padding-block);
  padding-inline: var(--btn-padding-inline);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  line-height: var(--btn-line-height);
  border: var(--btn-border-width) var(--btn-border-style) transparent;
  border-radius: var(--btn-radius);
  min-inline-size: var(--btn-min-width);
  transition: var(--btn-transition, var(--transition));
}
```

> Conflict: the variable list says `--btn-radius`; the same page's example uses `--btn-border-radius`. The toolkit lists both. Prefer `--btn-radius`; confirm in `tokens.md`.
> Conflict: the toolkit also lists `--btn-width`, `--btn-justify-content`, `--btn-text-align`, which the ACSS 4 docs don't list. Unverified.

Source: https://docs.automaticcss.com/buttons/button-variables

## Auto button styling and exclusions

- ACSS applies the default button framework to every class starting with `.btn--`, including third-party ones.
- Exclude selectors in Buttons & Links > Options > Additional Options, comma separated: `.btn--third-party-example, .btn--another`. Excluded selectors get no button styling at all.
- ACSS docs suggest custom buttons named `.btn--custom` plus the `?btn` recipe or `@include btn` mixin (see mixins-functions-recipes.md).

> Conflict: Etch Studio's built-in skill says "Don't name your own classes `btn--*` or `section--*`." In Etch, follow Studio: use a BEM class (`.hero__cta`) and reference `--btn-*` tokens, or put `.btn--primary` on the element.

Source: https://docs.automaticcss.com/buttons/auto-button-styling-exclusions, https://docs.automaticcss.com/recipes/button-recipes; Etch Studio built-in `acss` skill (`etch.skills.get('acss')`)

## Gradient outline buttons (recipe from docs)

- Set the Primary button background and background-hover fields to `linear-gradient(var(--gradient-angle), var(--gradient-color-1), var(--gradient-color-2))`.
- Register `--gradient-color-1` and `--gradient-color-2` with `@property` (`syntax: "<color>"; inherits: false; initial-value: transparent`) so they can transition.
- On `.btn--primary.btn--primary` (doubled for specificity): `position: relative; border: none !important;` padding = `calc(var(--btn-padding-block) + <border width>)`, transition on the two custom properties.
- `::before`: `content: ''; position: absolute; inset: 0; border-radius: inherit; padding: <border width>;` gradient background, `mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude;` (+ `-webkit-mask-composite: xor`). Swap the colors on `:hover` and `:hover::before`.

> Conflict: the page uses `--btn-outline-border-width`, which 4.0 removed. Use `--btn-border-width`.
> Etch: `@property` must sit at the top level, but Etch element CSS can't be written outside the selector. Where to put it in Etch (ACSS Global SCSS on EtchWP; the `custom-global-css` ACSS setting in Studio) is unverified.

Source: https://docs.automaticcss.com/buttons/gradient-outline-buttons

## Links

- Global link styling in Buttons & Links > Links: color, weight, decoration, decoration color, decoration thickness, underline offset, use global transition.
- "Add Link Default Exclusions": a textarea of quoted, comma-separated selectors fed into `:not()`: `"header a", "footer a", ".nav a"`.
- Removed in 4.0: `.link--primary`, `.link--secondary`, etc. Use custom properties or your own classes.
- The ACSS 4 docs list no `--link-*` variables. The toolkit lists `--link-color`, `--link-color-hover`, `--link-transition`, `--link-decoration`, `--link-decoration-hover`, `--link-underline-offset`, `--link-weight`: unverified, check `tokens.md` before use.
- Don't restyle links globally in element CSS; links are handled by ACSS.

Source: https://docs.automaticcss.com/links/link-styling; toolkit `agent-docs/acss/links.md`

## External link indication

- Turn on: Buttons & Links > Links > External Links > "Indicate External Links". Applies to links that open a new tab or window.
- Controls: indicator (any HTML entity), position (before/after), gap, size, alignment, color and hover color, weight, offset (Y/X).
- Exclusions: default `:has(> img, > figure, > picture, > svg)`; append comma-separated selectors, e.g. `:has(> img, > figure, > picture, > svg), .exclude-this-link, #exclude-this-link`.
- Screen-reader text defaults to "Link to external site", read after the link text. Editable; a per-link `aria-label` overrides it.
- Only use new tabs for links to other domains.

Source: https://docs.automaticcss.com/links/external-link-indication

## Card framework

Philosophy: every card reads shared `--card-*` tokens, so one dashboard change restyles all cards. Off by default; ACSS "highly recommends" turning it on (Cards screen).

Workflow:
1. Enable the framework at project start.
2. Add each card's wrapper selector to Cards > Card Options > Card Selectors (comma separated): `.service-card, .team-card`. Automatic targeting was removed in 4.0; unlisted cards get nothing.
3. Use the recognized child patterns: class containing `__media`, class containing `__avatar`, `[data-icon]` attribute (required for icons), and h1–h6.
4. Override with tokens, not hard values. Write manual CSS only for genuinely unique properties.

Styling options (Cards > Card Styling): background, heading color, text color, padding, content gap, heading size, text size, Concentric Radius (Off / Standard: outer = `--radius + --card-padding` / Reverse: inner = `--radius - --card-padding`, floored by Minimum Radius, default `4px`), border width/style/color/radius, link color/hover, button style, button text size, icon size/color, boxed icon options, avatar size/border/radius/aspect ratio, media radius/aspect ratio/object fit, card shadow. Cards are `display: flex; flex-direction: column` by default; "Default Cards to Display Grid" switches to grid.

Variables: `--card-padding`, `--card-gap`, `--card-radius`, `--card-min-radius`, `--card-border-width`, `--card-border-style`, `--card-border-color`, `--card-background`, `--card-heading-size`, `--card-heading-color`, `--card-text-size`, `--card-text-color`, `--card-link-color`, `--card-link-color-hover`, `--card-button-font-size`, `--card-icon-size`, `--card-icon-color`, `--card-avatar-size`, `--card-avatar-radius`, `--card-media-radius`, `--card-media-aspect-ratio`, `--card-shadow`.

```css
.pricing-card {
  --card-padding: var(--space-l);
  --card-heading-size: var(--h2);
  --card-radius: var(--radius-l);
}
/* move padding to an inner wrapper */
.article-card { padding: 0; gap: 0; }
.article-card__content { padding: var(--card-padding); gap: var(--card-gap); }
```

- Color scheme (needs Colors > Color Scheme support on): Default Card Scheme = Inherit / Light / Dark. Per card: a class name containing `--light` or `--dark` (e.g. `service-card--dark`) sets `color-scheme`. In Etch keep the BEM pair: `class="service-card service-card--dark"`.
- Container queries: `?card-container` recipe or `@include card-container(...)` mixin; ACSS 4 doesn't create the container, so add `container: card / inline-size;` to the card's wrapper.
- `@include card;` applies the framework to an unlisted selector, ACSS Custom SCSS only (not Etch CSS).

Source: https://docs.automaticcss.com/cards/card-framework-philosophy, https://docs.automaticcss.com/cards/card-workflow, https://docs.automaticcss.com/cards/card-styling, https://docs.automaticcss.com/cards/card-targeting, https://docs.automaticcss.com/cards/card-color-scheme

## Blockquotes

- Dashboard: Additional Styling > Blockquotes. "Blockquote Styling" master toggle (off = no variables generated). "Auto Style Blockquotes" (default on) styles every `<blockquote>`; off = only `.blockquote`. "Exclude Selectors" (comma separated) is applied as `:where(:not(:is(...)))`.
- Required DOM: text inside `<p>` (text styles target `p`), attribution in `<footer>` with `<cite>`:

```html
<blockquote>
  <p>Quote text.</p>
  <footer>— Name, <cite>Source</cite></footer>
</blockquote>
```

- Figure pattern: `<figure>` gets the container styling, `<figcaption>` gets footer styles. With auto style off, put `.blockquote` on the `<figure>`.

```html
<figure>
  <blockquote cite="https://example.com"><p>Quote text.</p></blockquote>
  <figcaption>— Name, <cite>Source</cite></figcaption>
</figure>
```

- Defaults: padding `var(--space-m)`, gap `1em`, border width `0 0 0 3px`, solid, color `var(--primary)`, radius `var(--radius)`, background `var(--neutral-ultra-light)`, text size `var(--text-l)`, footer size `var(--text-s)`.
- Variables. Main: `--blockquote-padding`, `--blockquote-gap`, `--blockquote-border-width`, `--blockquote-border-style`, `--blockquote-border-color`, `--blockquote-border-radius`, `--blockquote-background`, `--blockquote-box-shadow`, `--blockquote-max-inline-size`. Text (on `p`): `--blockquote-text-color`, `--blockquote-text-font-family`, `--blockquote-text-font-style`, `--blockquote-text-font-size`, `--blockquote-text-font-weight`, `--blockquote-text-line-height`, `--blockquote-text-text-align`, `--blockquote-text-text-transform`. Footer: `--blockquote-footer-padding`, `--blockquote-footer-margin-block`, `--blockquote-footer-font-family`, `--blockquote-footer-font-size`, `--blockquote-footer-font-weight`, `--blockquote-footer-font-style`, `--blockquote-footer-line-height`, `--blockquote-footer-text-transform`, `--blockquote-footer-color`. Cite: `--blockquote-cite-font-size`, `--blockquote-cite-font-weight`, `--blockquote-cite-font-style`, `--blockquote-cite-line-height`, `--blockquote-cite-text-transform`, `--blockquote-cite-color`.

```css
.testimonial__quote {
  --blockquote-background: var(--primary-ultra-light);
  --blockquote-border-width: 0 0 0 4px;
  --blockquote-padding: var(--space-l);
  --blockquote-max-inline-size: 60ch;
}
```

> Conflict: ACSS docs name `--blockquote-text-text-align` and `--blockquote-text-text-transform`; the toolkit names them `--blockquote-text-align` and `--blockquote-text-transform`. Confirm in `tokens.md`.

Source: https://docs.automaticcss.com/elements/blockquotes; toolkit `agent-docs/acss/blockquotes.md`
