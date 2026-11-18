# ACSS 4 — typography

ACSS styles headings and text globally: size (fluid), line height, family, colour, weight, letter spacing, style, transform and wrap. Write `font-size` or other type CSS only when an element deliberately differs from the global style. You never need to resize type at breakpoints.

## Default styling (Typography panel: Headings / Text tabs)

Per tab (headings or text):

- **Root Font Size**: `root-font-size`, a percentage, default **100%**. 62.5% isn't needed because the builder has auto rem conversion (Options > Workflow Enhancements).
- **Base size** (mobile and desktop):
  - Headings: `base-heading-mob` / `base-heading-desk`. This is the desktop **H4** size and the start of the heading scale.
  - Text: `base-text-mob` / `base-text-desk`. This is the desktop **M** text size.
  - Values are typed in px and output in rem.
- **Type scale** (desktop and mobile ratio):
  - Headings: `heading-scale` / `mob-heading-scale`.
  - Text: `text-scale` / `mob-text-scale`.
  - The ratio must be greater than 1. Use a tighter scale on mobile; set both equal for no change.
- **"All" defaults:**
  - Colour: `heading-color`, `body-color`.
  - Font family: `heading-font-family`, `text-font-family`.
  - Line height (default line height): `base-heading-lh`, `base-text-lh`.
  - Weight: `heading-weight`, `text-font-weight`.
  - Letter spacing, max-width, font style, text transform.
  - Text wrap: `heading-text-wrap`, `text-wrap`.
- **Smart Line Height** is the default: `calc(<leading> + 2ex)`. The toolkit's example export uses `calc(4px + 2ex)` for headings and `calc(8px + 2ex)` for text. To tune it, change the `ex` coefficient in decimal steps.
- **Text wrap**: the default is `pretty` (prevents orphans). `balance` suits headings and stops working above 4 lines. `wrap` turns the feature off.
  - The toolkit's example export sets headings to `balance` and text to `pretty`.
- The "All: Max-Width" setting is skipped in Bricks; this doesn't matter in Etch.
- **Per-level overrides** (H1–H6 and each text size), with setting ids `h{n}-*` / `text-{size}-*`:
  - font family, colour, weight, letter spacing, line height, max-width, style, transform;
  - size overrides `h{n}-min` / `h{n}-max` and `text-{size}-min` / `text-{size}-max` (mobile and desktop px).
  - An overridden size leaves the scale. Other sizes aren't affected.
  - H5/H6 and text S/XS have default minimums for accessibility.

Sources: https://docs.automaticcss.com/typography/default-typography-styling, https://docs.automaticcss.com/typography/fluid-headings, https://docs.automaticcss.com/typography/fluid-text (setting ids from the toolkit's `agent-docs/acss/example-json.md`)

## Fluid size tokens

- **Heading sizes:** `--h1` `--h2` `--h3` `--h4` `--h5` `--h6`
- **Text sizes:** `--text-xs` `--text-s` `--text-m` `--text-l` `--text-xl` `--text-xxl`
  - S and XS scale **down** from M; L, XL and XXL scale up.
- Each token is a clamp between Minimum Width and Content Width.

> Conflict: "What's new in 4" announces XXL → 2XL. The typography docs and the toolkit use `--text-xxl` / `.text--xxl`. Confirm against the project's generated ACSS token/class list (Studio: `etch.skills.getReference('acss','tokens.md' | 'classes.md')`; WordPress: the generated stylesheet or `wp acss settings`).

### Jump ("bridge") sizes

A bridge size uses the desktop max of the larger size and the mobile min of the smaller one.

- **Headings:** `--h{a}-to-h{b}` for every a < b. The full list:
  - from h1: `--h1-to-h2`, `-to-h3`, `-to-h4`, `-to-h5`, `-to-h6`
  - from h2: `--h2-to-h3`, `-to-h4`, `-to-h5`, `-to-h6`
  - from h3: `--h3-to-h4`, `-to-h5`, `-to-h6`
  - from h4: `--h4-to-h5`, `-to-h6`
  - from h5: `--h5-to-h6`
- **Text:** `--text-{large}-to-{small}` for every larger → smaller pair:
  - `--text-xxl-to-xl` / `-l` / `-m` / `-s` / `-xs`
  - `--text-xl-to-l` / `-m` / `-s` / `-xs`
  - `--text-l-to-m` / `-s` / `-xs`
  - `--text-m-to-s` / `-xs`
  - `--text-s-to-xs`

> Conflict: the toolkit's `typography.md` writes the text form as `var(--text-xxl-to-text-m)`. The docs give **`--text-xxl-to-m`** (no second `text-`). Confirm against the project's generated ACSS token/class list (Studio: `etch.skills.getReference('acss','tokens.md' | 'classes.md')`; WordPress: the generated stylesheet or `wp acss settings`).

Use bridge sizes sparingly: only when a size must shrink harder on mobile than its own clamp allows.

```css
.hero__title   { font-size: var(--h1-to-h3); }    /* h1 on desktop, h3 on mobile */
.hero__lede    { font-size: var(--text-xl-to-m); }
.card__title   { font-size: var(--h4); }          /* semantic h2 that looks like h4 */
```

For custom sizes, use the `fluid()` function (Global SCSS; see the functions reference).

Sources: https://docs.automaticcss.com/typography/fluid-headings, https://docs.automaticcss.com/typography/fluid-text

## Typography variables (for custom components)

**Headings, all levels:**

| Variable | When it exists |
|---|---|
| `--heading-line-height` | Always |
| `--heading-font-weight` | Always |
| `--heading-text-wrap` | Always |
| `--heading-font-family` | When declared in settings |
| `--heading-color` | When declared in settings |
| `--heading-font-style` | When declared in settings |
| `--heading-letter-spacing` | When declared in settings |
| `--heading-text-transform` | When declared in settings |

**Heading levels**, `n` = 1–6:

| Variable | When it exists |
|---|---|
| `--h{n}-max-width` | Always |
| `--h{n}-font-family` | When that level is overridden |
| `--h{n}-color` | When that level is overridden |
| `--h{n}-line-height` | When that level is overridden |
| `--h{n}-font-weight` | When that level is overridden |
| `--h{n}-font-style` | When that level is overridden |
| `--h{n}-letter-spacing` | When that level is overridden |
| `--h{n}-text-transform` | When that level is overridden |

**Text, all sizes:**

| Variable | When it exists |
|---|---|
| `--text-line-height` | Always |
| `--text-text-wrap` | Always |
| `--text-font-family` | When declared in settings |
| `--text-color` | When declared in settings |
| `--text-font-weight` | When declared in settings |
| `--text-font-style` | When declared in settings |
| `--text-letter-spacing` | When declared in settings |
| `--text-text-transform` | When declared in settings |
| `--text-max-width` | When declared in settings |

**Text sizes**, `size` = xs–xxl:

| Variable | When it exists |
|---|---|
| `--text-{size}-max-width` | Always |
| `--text-{size}-line-height` | When that size is overridden |
| `--text-{size}-font-weight` | When that size is overridden |
| `--text-{size}-font-style` | When that size is overridden |
| `--text-{size}-letter-spacing` | When that size is overridden |
| `--text-{size}-text-transform` | When that size is overridden |

**Also in the docs:** `--root-font-size` (builder setup) and `--heading-spacing` (smart spacing).

Because the "if declared" variables may not exist, check `tokens.md` before relying on one, or give `var()` a fallback that is also a token.

```css
.eyebrow {
  font-family: var(--heading-font-family);
  font-size: var(--text-s);
  letter-spacing: 0.1em;            /* no token for this; deliberate one-off */
  text-transform: uppercase;
}
.fancy-heading {                    /* re-scope heading vars locally */
  --heading-color: var(--accent);
  font-size: var(--h1);
}
```

Source: https://docs.automaticcss.com/typography/typography-variables

## Text classes

- **Size:** `.text--{xs|s|m|l|xl|xxl}`. It works on the element or on a container. Toggle: `option-text-size-classes`.
- **Contextual colour:** `.text--{dark|dark-muted|light|light-muted}` (see `colors.md`).
- Docs also list:
  - `.text--{color}`
  - weight `.text--{100…900}`
  - style `.text--{italic|oblique}`
  - decoration `.text--{none|underline|underline-wavy|underline-dotted|underline-double|underline-dashed|overline|line-through}`
  - transform `.text--{none|uppercase|lowercase|capitalize}`
  - alignment `.text--{left|center|right|justify}`

  > Conflict: the text-classes page (labelled 4.0.0+, last updated Aug 2025) lists these; what's-new-in-4 says v4 removed most utility class modules and is variable-first, BEM-first. Confirm against the project's generated ACSS token/class list (Studio: `etch.skills.getReference('acss','tokens.md' | 'classes.md')`; WordPress: the generated stylesheet or `wp acss settings`).
- **Marker classes:** `.marker--{color}[-{shade}]` colours list bullets. Or use `li::marker { color: var(--primary); }` in your class.
  > Conflict: the marker-classes page (labelled 4.0.0+) lists them; what's-new-in-4 says v4 removed most utility class modules. Confirm against the project's generated ACSS token/class list (Studio: `etch.skills.getReference('acss','tokens.md' | 'classes.md')`; WordPress: the generated stylesheet or `wp acss settings`).
- Etch reset: a classed `ul`/`ol` loses its bullets unless it also has `.list` or a class containing `marker` (Studio built-in skill).

Sources: https://docs.automaticcss.com/typography/text-classes, https://docs.automaticcss.com/typography/marker-classes

## Line length

- Each heading and text size has a Max-Width setting (`h{n}-max-width`, `text-{size}-max-width`). It's blank by default, accepts any unit, and is usually set in `ch` (e.g. `48ch`; 50–60 characters is optimal for body text).
- It applies to paragraphs, list content and `.text--{size}` elements.
- Read it in CSS through `--h{n}-max-width` and `--text-{size}-max-width`.
- Prefer layout-based caps (columns) where the layout provides them. Use `max-inline-size` when capping manually.

Source: https://docs.automaticcss.com/typography/text-heading-line-length

## Custom fonts (self-hosted)

- Location: Typography > **Fonts** tab, up to **5** fonts. ACSS writes the `@font-face` rules.
- Setting ids `font-{1-5}-*`:

| Id suffix | Field | Notes |
|---|---|---|
| `type` | Font Type | `static` or `variable` |
| `family-name` | Font Family | Any label |
| `src` | Font File Path | **Relative** path such as `/wp-content/uploads/…/x.woff2` |
| `format` | Font Format | `woff2`, `woff`, `truetype` or `opentype` |
| `style` | Font Style | |
| `weight` | Font Weight | Static fonts only; must match the file |
| `display` | Font Display | `swap` recommended |
| `stretch` | Font Stretch | Variable fonts only |
| `variation-settings` | Font Variation Settings | Variable fonts only |
| `src-fallback`, `format-fallback` | Fallbacks | Optional second file |

- Prefer `.woff2` (best compression, broad support). The docs recommend self-hosting over loading from Google Fonts.
- For several static weights, register each file under the **same** family name with different weights.
- Registering only declares the font. To apply it, set the Headings/Text **Default Font Family** (`heading-font-family`, `text-font-family`) or a per-level family. In component CSS, reference `var(--heading-font-family)` or `var(--text-font-family)` rather than the literal name.
- Studio paths: the docs assume WordPress uploads. In Studio, upload the file to the Asset Manager (`upload_assets`) and use its path. Exact path form is unverified.

Source: https://docs.automaticcss.com/typography/custom-fonts
