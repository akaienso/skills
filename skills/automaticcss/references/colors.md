# ACSS 4 — colors, backgrounds, color assignments, color scheme (dark mode)

Think in roles, not hex codes (main-colors): use ACSS custom properties rather than hard-coded values that duplicate a token. For translucency, use `color-mix()` or relative colour syntax on a token (transparencies). The project's generated `tokens.md` / `classes.md` are authoritative for whatever project you're in.

## Palette

### Main colours

| Slot | Role |
|---|---|
| `primary` | Main brand and action colour: key CTAs, links |
| `secondary` | Supporting brand colour |
| `tertiary` | Third brand colour; use sparingly |
| `accent` | Rarest colour: badges, one-off emphasis |
| `base` | Workhorse for backgrounds and body text |
| `neutral` | Greys, white to black: borders, dividers, subtle backgrounds |

- Configure them under Palette > Main Colors. Enable only the slots you use.
  - Setting ids: `option-{color}-clr` turns a slot on; `color-{color}` takes a hex input.
  - Studio: only primary, base and neutral are on by default. Turn others on with `option-{color}-clr: true`.
- ACSS stores colours in **OKLCH**. You type hex; ACSS converts.
- **Shades.** Each enabled colour generates:

  ```
  --{color}
  --{color}-ultra-light  --{color}-light  --{color}-semi-light
  --{color}-semi-dark    --{color}-dark   --{color}-ultra-dark
  --{color}-hover        (reserved for hover states)
  ```

  Every shade can be overridden in the dashboard.
- **Constants:** use `var(--white)` and `var(--black)`. For greys, use the `--neutral-*` shades.
- **Unified Lightness** (Palette > Palette Options):

  | Dashboard toggle | Setting id |
  |---|---|
  | Unify Brand Lightness | `option-palette-unify-brand-lightness` |
  | Unify Semantic Lightness | `option-palette-unify-status-lightness` |
  | Unified Lightness (0–1, default `0.65`) | `unified-lightness-value` |

  It forces the OKLCH **L** of each base swatch only. Shades and hover keep their own L.

Sources: https://docs.automaticcss.com/colors/palette-intro, https://docs.automaticcss.com/colors/main-colors, https://docs.automaticcss.com/colors/unified-lightness

### Semantic (status) colours

- The slots are `success`, `danger`, `warning` and `info`, configured under Palette > Semantic Colors. They take the same `-{shade}` pattern: `var(--success)`, `var(--warning-light)`.
- Docs list the class prefixes `.text--`, `.bg--` and `.link--` + `{color}[-{shade}]` (e.g. `.text--warning-light`). The docs also list the partials `{color}-hex`, `-hsl`, `-h`, `-s`, `-l`, `-rgb`, `-r`, `-g`, `-b`.
  > Conflict: semantic-colors lists HSL/RGB-era partials and palette `.bg--{color}`, `.text--{color}`, `.link--*` classes; palette-intro and what's-new-in-4 say v4 builds the palette in OKLCH, and the transparencies page uses relative colour syntax instead of partials. Confirm against the project's generated ACSS token/class list (Studio: `etch.skills.getReference('acss','tokens.md' | 'classes.md')`; WordPress: the generated stylesheet or `wp acss settings`).
- Toolkit rule: status colours stay off unless the design uses them.

Source: https://docs.automaticcss.com/colors/semantic-colors

### Transparencies (no tokens in v4)

`--primary-trans-50`-style tokens are gone. Use one of these:

```css
.card__overlay {
  background: color-mix(in oklch, var(--primary) 20%, transparent);  /* X% of colour */
  border-color: oklch(from var(--base) l c h / 0.1);                  /* keep hue, change alpha */
}
```

Source: https://docs.automaticcss.com/colors/transparencies

## Contextual colours (assignments)

Use these first. The palette is for when no contextual token expresses the intent.

| Token | Class | Meaning |
|---|---|---|
| `--body-bg-color` | (none) | Site background (default `var(--white)`) |
| `--bg-ultra-light` | `.bg--ultra-light` | Ultra-light background |
| `--bg-light` | `.bg--light` | Light background |
| `--bg-dark` | `.bg--dark` | Dark background |
| `--bg-ultra-dark` | `.bg--ultra-dark` | Ultra-dark background |
| `--text-dark` | `.text--dark` | Main text on light backgrounds |
| `--text-dark-muted` | `.text--dark-muted` | Lower-contrast text on light backgrounds |
| `--text-light` | `.text--light` | Main text on dark backgrounds |
| `--text-light-muted` | `.text--light-muted` | Lower-contrast text on dark backgrounds |

- Configure them under **Backgrounds & Text** > Backgrounds / Text.
  - Setting ids: `body-bg-color`, `bg-{ultra-light|light|dark|ultra-dark}`, `body-color` (default text), `text-dark`, `text-dark-muted`, `text-light`, `text-light-muted`.
  - The default text colour is itself a contextual variable (default `var(--text-dark)`).
- Typography variables also include `--heading-color` and `--text-color` (only if declared in the dashboard settings; typography-variables). Don't invent siblings.
- Toolkit: body and muted text reference **base**, not neutral. "Dark" contexts must render dark and "light" contexts light.

```css
.promo { /* text colours only; use a .bg-- class for the background so relationships fire */
  color: var(--text-light-muted);
}
.promo__title { color: var(--text-light); }
```

> Conflict (docs only, dashboard path): contextual-background-colors says "Color Assignments > Backgrounds", while background-text-assignments says **Backgrounds & Text**. Check the dashboard (or the setting's `screen` in `listSettingsAsync()`).

Sources: https://docs.automaticcss.com/color-assignments/background-text-assignments, https://docs.automaticcss.com/backgrounds/contextual-background-colors

## Automatic colour relationships

- Toggle: **Automatic Color Relationships** (`option-relate-bg-text`, screen Backgrounds & Text > Options).
  > Conflict: one doc says Options > Defaults & Misc. Check the dashboard (or the setting's `screen` in `listSettingsAsync()`).
- With it on, `.bg--{ctx}` also flips heading, text, link, link-hover, button, icon and focus colours.
  - Settings: `bg-{ctx}-heading`, `-text`, `-link`, `-link-hover`, `-button` (a style name such as `primary`, or `primary.btn--outline`), `-icon` (`dark`, `light` or `inherit`), `-focus-color`.
  - Leave a field blank to keep the default.
- **The class is required.** `background: var(--bg-dark)` does **not** trigger relationships. Put `.bg--dark` on the element, next to its BEM class: `class="cta bg--dark"`.
- Text classes and variables do work with relationships.
- Add `.unrelate` to a button to stop relationships changing its colours (button-styling).
- To override one button inside a relationship, add a BEM class and use `@include btn(secondary);` in Global SCSS.

Source: https://docs.automaticcss.com/color-assignments/automatic-color-relationships

## Surfaces and `.is-bg`

- **Surfaces** (Surfaces & Overlays > Custom Surfaces) give up to 5 reusable backgrounds:
  - Class `.surface-{name}` (default `.surface-1`…`.surface-5`), or `@include surface(1);` in SCSS.
  - Fields: background colour fallback, asset (URL or any `background-image` value; "Asset is URL" adds `url()`), size, position, attachment, repeat, animation (define `@keyframes` yourself), and an optional overlay (colour, opacity).
  - A **Color Relationship** (ultra-light, light, dark or ultra-dark) makes the surface fire the same foreground flips as `.bg--*`.
  - Overlays are configured separately in v4 (5 custom overlays).
- **`.is-bg`** turns a real `img` (or any box) into the parent's background. It sets absolute position, inset 0, z-index -2, and gives the parent `position: relative` + `isolation`.
  - Tokens you can override: `--bg-position`, `--bg-inset`, `--bg-width`, `--bg-height`, `--bg-radius`, `--bg-z-index`, `--bg-object-fit` (cover), `--bg-object-position` (center).

Sources: https://docs.automaticcss.com/backgrounds/surfaces, https://docs.automaticcss.com/backgrounds/is-background-is-bg

## Colour scheme (light/dark) — v4 workflow

### Mechanism

- With support on, every palette variable is output as `light-dark(light, dark)`.
- `color-scheme` on `:root` or any ancestor picks which value applies.
- One set of names (`--primary`, `--base-dark`) works in both schemes. There are no "alt" tokens and no `prefers-color-scheme` CSS from ACSS.

### Settings (screen `color-scheme`)

| Setting | Id | Effect |
|---|---|---|
| Enable Color Scheme Support | `auto-color-scheme` | Converts the palette to `light-dark()`, auto-inverts shades (ultra-light ↔ ultra-dark, light ↔ dark, semi-light ↔ semi-dark), and activates `.scheme--light` / `.scheme--dark` |
| Website Scheme | `website-color-scheme` | `light only`, `dark only`, `light dark` or `normal`. Sets `color-scheme` on `:root`. |
| Main / Hover overrides per colour | `{color}-{l\|c}-alt-oklch`, `{color}-hover-{l\|c}-alt-oklch` | Dark-mode L/C for the main and hover swatches. These are **not** auto-inverted; blank = same as light. |
| Force Dark Scheme / Force Light Scheme | `color-scheme-force-dark-selectors`, `color-scheme-force-light-selectors` | Selectors that always get `color-scheme: dark` or `light` |
| Generate Reference Color Tokens | `option-ref-color-tokens` | In the toolkit's example export; not documented in these sources (unverified) |

- Toolkit rule: a **light-only site keeps `auto-color-scheme` off**. Otherwise inverted alternates make dark tokens render light.
- The toolkit's export also has `option-color-scheme-switcher-enable`. No doc describes it (unverified).

### Implementation patterns

1. **Follow the OS** (no toggle): support on + Website Scheme `light dark`. This is best for accessibility, and form controls and scrollbars follow automatically.
2. **Default plus a manual toggle**:
   - Turn support on and set Website Scheme to `light only` (or `dark only` for a dark-first design).
   - A button sets `color-scheme` on `<html>`, and `localStorage` remembers the choice.

   ```css
   :root[data-scheme="dark"]  { color-scheme: dark; }
   :root[data-scheme="light"] { color-scheme: light; }
   ```

   ```js
   const root = document.documentElement;
   const stored = localStorage.getItem('scheme');
   const initial = stored ?? 'light'; // the site's default scheme
   root.dataset.scheme = initial;
   toggle.addEventListener('click', () => {
     const next = root.dataset.scheme === 'dark' ? 'light' : 'dark';
     root.dataset.scheme = next; localStorage.setItem('scheme', next);
     toggle.setAttribute('aria-pressed', String(next === 'dark'));
   });
   ```

   The docs describe the root `color-scheme` swap and storing the choice in `localStorage`. The data-attribute wiring is only an example; any mechanism that sets root `color-scheme` works.
3. **Fixed default, inverted areas**: add `.scheme--dark` or `.scheme--light` on a wrapper, or use the Force Scheme selectors.
   - Inverted areas need **explicit** background and text colours. A section that inherits the body background won't invert. Set heading and text colours in the Typography settings.
4. **One-off values**: write `light-dark(a, b)` yourself in CSS or in dashboard fields, using tokens:

   ```css
   .card { border-color: light-dark(var(--neutral-light), var(--neutral-dark)); }
   ```

Sources: https://docs.automaticcss.com/color-scheme/modern-color-scheme-workflow, https://docs.automaticcss.com/color-scheme/color-scheme-setup, https://docs.automaticcss.com/color-scheme/implementing-color-scheme

## Quick do / don't

- **Do:**
  - `class="hero bg--ultra-dark"`
  - `color: var(--text-dark-muted)`
  - `border-color: var(--neutral-light)`
  - `color-mix(in oklch, var(--primary) 15%, transparent)`
- **Don't:**
  - `background: var(--bg-dark)` when you expect text to flip.
  - `#1a1a1a`.
  - `--primary-trans-20` (removed).
  - Inventing `--primary-hex` or `.bg--primary` without checking `classes.md` or `tokens.md`.
