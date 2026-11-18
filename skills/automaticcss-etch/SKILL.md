---
name: automaticcss-etch
description: Use Automatic.css 4.x on Etch Studio and EtchWP - choose palette, spacing, type, width, grid, button and border tokens and classes correctly, change ACSS settings through etch.acss (Studio) or wp acss (WordPress), and never invent token names. Use when styling any Etch page on a project that runs ACSS.
---

# Automatic.css 4.x on Etch

## Is ACSS on?

- Studio: ACSS is on when `etch.skills.list()` includes `acss`. If it is off, ask the user before `etch.acss.setEnabledAsync(true)`.
- EtchWP: ACSS is on when the ACSS plugin is active and the Etch integration reports an ACSS version. If it is not reported, use plain CSS and say so.

## Rules

- Variables first, BEM second. Most utility classes were removed in 4.x. Write your own BEM class and reference ACSS variables inside it.
- Never invent a token or class name. Confirm it against the live list first:
  - Studio: `etch.skills.getReference('acss', 'tokens.md')` and `classes.md`. These are generated for this project and win over every other source.
  - EtchWP: the ACSS Cheat Sheet in the dashboard.
- Do not redefine ACSS tokens inside Etch styles. Change the value in ACSS settings.
- Do not hardcode px or hex values that match a token. Translate a design into tokens, not pixel-exact numbers.
- Use logical properties (`max-inline-size`, `padding-block`).
- Sections take their padding from ACSS. Never add padding or margin to a `section`. The top-level tag must be `section`.
- Headings and body text take their size, font and colour from ACSS. Set a size only when the design deliberately differs.
- A wrapper around rich content (post body, WYSIWYG) gets `smart-spacing` next to its BEM class, for example `article__body smart-spacing`. Do not space its children by hand.
- Do not write reset CSS. Etch ships a reset.
- Light-only site: turn auto colour-scheme off, so ACSS does not generate inverted dark tokens. On EtchWP, that setting is under Color Scheme.

## Tokens

Colours (names confirmed in the live list and the docs):
- Palette roles: `primary`, `secondary`, `tertiary`, `accent`, `base`, `neutral`. Enable only roles the design uses. Never change neutral values when importing settings.
- Shades: `--{role}-{shade}` with `ultra-light`, `light`, `semi-light`, `semi-dark`, `dark`, `ultra-dark`, and `hover`. Confirmed examples: `--primary-dark`, `--primary-ultra-dark`, `--base-hover`, `--base-semi-dark`.
- Semantic: `success`, `danger`, `warning`, `info`, with the same shades.
- Context: `--bg-ultra-light`, `--bg-light`, `--bg-dark`, `--bg-ultra-dark`, `--text-light`, `--text-light-muted`, `--text-dark`, `--text-dark-muted`, `--body-bg-color`.
- Constants: `--white`, `--black`. Use these when you need pure white or black.
- Transparency has no token. Use `color-mix(in oklch, var(--primary) 50%, transparent)`.

Spacing:
- `--space-{xs|s|m|l|xl|xxl}`. Bridge form for a range: `--space-xl-to-m`.
- Sections: `--section-space-{size}` and bridge forms, plus `--gutter`.
- Contextual gaps: `--content-gap`, `--container-gap`, `--grid-gap`.
- Gap first: use `gap` for spacing between siblings, and margins only when gap cannot express it.
- The largest size is `xxl` in the live tokens, but the 4.x what's-new page says `2xl`. Check the live list.

Typography:
- Sizes: `--h1` to `--h6`, `--text-xxl` to `--text-xs`. Bridge forms: `--h1-to-h4`, `--text-xxl-to-m`.
- Styles: `--heading-*` and `--text-*`, for example `--heading-font-family`.
- Classes: `.text--{size}`.

Width:
- `--content-width` always exists. `--content-width-safe` is the gutter-aware version.
- `--width-10` to `--width-90` exist only when Width Variables is on.
- Classes: `.content-width`, `.content-width--safe`, `.width--{10..90}`, `.width--full`, `.width--auto`.
- Containers are already content width. Do not set random max widths.

Grids:
- `--grid-1` to `--grid-12`. Ratio grids: `--grid-1-2`, `--grid-2-3`, and so on.
- Auto grids: `--grid-auto-2` to `--grid-auto-12`. Use them only with a gap of `--grid-gap` or less.
- Prefer grid tokens over flex for structural layouts.
- Mobile first: write the one-column default, then add `@media (min-width: to-rem(768px))`.

Borders:
- `--radius`, `--border`, `--border-light`, `--border-dark`, `--border-size`, `--border-style`, `--border-color-light`, `--border-color-dark`.
- Set both `border` and `border-radius`. Radius is not part of `--border`.

Buttons:
- Classes: `.btn--{primary|secondary|tertiary|accent|base|neutral}`, with `-light` or `-dark` variants, `.btn--outline`, and sizes `.btn--xs` to the largest size.
- Use the class first. Do not write custom button CSS. For a custom button, use `--btn-*` tokens.
- `.unrelate` stops automatic colour relationships from changing a button.

## Changing ACSS settings

Settings apply to every page of the site. Ask the user before you change one they set themselves.

- Studio: `await etch.acss.listSettingsAsync('primary')` finds settings and their options. Checked read-only on a test project: it returns an array of 53 settings, each with `id`, `type`, `label`, `screen`, `value` and `default`. `await etch.acss.updateSettingsAsync({ 'color-primary': '#1e6bd6' })` saves and regenerates. The call is all or nothing. Read `warnings` in the result. Afterwards, reload the `tokens.md` and `classes.md` references.
- Studio colours other than primary, base and neutral stay off until their toggle is set: `'option-secondary-clr': true`.
- EtchWP, WP-CLI: `wp acss settings get|set|list|export|import|reset`, then `wp acss css regenerate`. The docs example is `settings set color-primary <value>`. Get the value format from the dashboard first. `import` replaces every setting with no backup, so confirm first.
- Command groups `status`, `logs`, `doctor`, `flags` and `license` are listed but not read. Check their help before use.

## Unverified or conflicting

- Shade suffixes beyond the confirmed examples: check the live list.
- `--border-size` (token list) and `--border-width` (one docs example) conflict. Use `--border-size` unless the live list says otherwise.
- Whether `.grid--*` classes survive in 4.x is unclear. Use the grid tokens.
- Fluid typography docs returned 404. Do not write fluid-scale math from memory.
