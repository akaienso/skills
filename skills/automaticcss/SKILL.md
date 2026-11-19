---
name: automaticcss
description: Use when styling an Etch Studio or EtchWP site that has AutomaticCSS (ACSS) 4 — choosing tokens for color, spacing, typography, widths, grids, borders, buttons, links, cards, effects, shadows; dark mode / color scheme; utility classes like `.bg--dark`, `.btn--primary`, `.smart-spacing`, `.hidden-accessible`; changing ACSS settings or brand colors; `wp acss` CLI; `etch.acss`; ACSS import/export files; or any `var(--…)` question.
---

# AutomaticCSS 4 on Etch

ACSS is **variable-first**: semantic BEM classes styled with ACSS tokens. Utility
classes are the exception (buttons, `.bg--*`, `.smart-spacing`, a few others).
With Etch, ACSS needs no Etch-side configuration on WordPress — the plugin
generates the CSS — and is a project toggle in Studio. Reading its tokens still
needs the list below. Pair with `etch-authoring` for where CSS goes.

## Step 0: is ACSS on, and what does this project generate?

| | Etch Studio | EtchWP |
|---|---|---|
| On? | `acss` listed in `etch.skills.list()` (none listed = off; `etch.acss.setEnabledAsync(true)` turns it on, after asking) | ACSS plugin active; Etch reports `integrations.acss.version` (toolkit) |
| Live token/class list | `etch.skills.getReference('acss','tokens.md')` and `'classes.md'` | ACSS dashboard → **Cheat Sheet** (lists every class, variable and recipe the current settings generate); `wp acss settings list`; driving a live builder through the Etch Connector, `etch.skills.getReference('acss','tokens.md' \| 'classes.md')` |
| Change settings | `etch.acss.listSettingsAsync(q)`, `etch.acss.updateSettingsAsync({...})` (all-or-nothing; read `warnings`) | ACSS dashboard, or `wp acss settings set <key> <value>` (validates and regenerates CSS; `--skip-css` defers to `wp acss css regenerate`) |
| Import/export | via settings API | `wp acss settings export/import` |
| Health | — | `wp acss status`, `wp acss doctor` |

ACSS off → plain CSS with custom properties; never reference ACSS names.
Never invent a token or class: confirm it in the live list or the references; if
you can't, say so and use a locally scoped property (`--_gap: to-rem(24px)`).

A site can also shadow ACSS names in a local variable collection — seen: `--primary`,
`--primary-dark` and `--accent` redefined, and `--radius-s`, `--radius-xs`,
`--space-2xs`, `--space-3xs` invented. Read the collection with
`etch.styles.listVariables()` before assuming a name comes from ACSS.

## Token-first rules

- Spacing: `var(--space-{xs|s|m|l|xl|xxl})`, jumps `var(--space-xl-to-m)`; gap-first
  with contextual `--content-gap`, `--container-gap`, `--grid-gap`. No manual
  padding on sections (ACSS spaces top-level `<section>` tags; use
  `.section--{size}` to change one). Gutter is `--gutter`, applied automatically.
- Rich content wrappers (`{this.content}`, WYSIWYG, post bodies) get
  `.smart-spacing` next to their BEM class; don't space their children yourself.
- Color: contextual first (`--bg-light`, `--bg-dark`, `--text-dark`,
  `--text-light-muted`…), then palette `--{primary|secondary|tertiary|accent|base|neutral}`
  and shades `-{ultra-dark|dark|semi-dark|semi-light|light|ultra-light|hover}`;
  `--white`/`--black` for pure. `.bg--{ultra-light|light|dark|ultra-dark}` sets
  background and matching text.
- Type: headings and text are styled globally and fluid; don't set `font-size`
  unless deviating. Tokens `--h1…--h6`, `--text-{xs…xxl}`; jump sizing sparingly.
- Layout: `grid-template-columns: var(--grid-3)` / ratios `var(--grid-1-2)`,
  mobile-first `min-width` queries; widths `var(--width-10…90)` (output only when
  **Width Variables** is on: Options → Variable Manager),
  `var(--content-width)`; `inline-size: 100%` + `max-inline-size`.
- Borders: `border: var(--border); border-radius: var(--radius)`.
- Buttons: `.btn--primary` (+ `-light`, `-dark`), `.btn--outline`, sizes
  `.btn--{xs|s|m|l|xl|xxl}`; configure styles in settings, never write button
  classes. Don't name your own classes `btn--*` or `section--*` (Studio rule; it
  overrides the ACSS docs' `.btn--custom` suggestion).
- **No SCSS in Etch.** ACSS mixins, SCSS functions and ACSS recipes do not run in
  Etch's CSS panel or through `etch.styles` (EtchWP or Studio). Write plain CSS
  with tokens; Etch adds native nesting and `to-rem()` (it also supports
  `&__`/`&--` stemming, but don't use it: one record per BEM class). ACSS
  mixins work only in the ACSS dashboard's Global SCSS screen on WordPress.
- Accessibility: `.hidden-accessible` (no `.sr-only`), `.skip-link`.
- Logical properties; no hard-coded hex or px that duplicates a token; no Tailwind.

## Cascade gotcha (Etch)

Published Etch pages load Etch class styles **before** ACSS, so an ACSS class of
equal specificity wins. Raise yours where they meet (`&.section--xs { … }`).

## Brand changes

Change the setting, not the output: e.g. Studio
`await etch.acss.updateSettingsAsync({ 'color-primary': '#1f5c3a' })`, then
re-read `tokens.md`; WordPress `wp acss settings export --file=<backup>.json`, then
`wp acss settings set color-primary "#1f5c3a"` (validates and regenerates CSS).
Shades regenerate from the new color automatically; any shade someone overrode by
hand in the dashboard needs checking. Then search `etch.styles.list()` for hard-coded
colors and replace them with tokens. Settings are site-wide: ask before changing
ones someone else set (Studio's built-in ACSS guide says the same).

## Import files (toolkit rules)

Never change the `neutral-*` palette; enable only the colors and button styles
the design uses (turn others off, don't duplicate); body/muted text reference
**base**; for light-only sites set `auto-color-scheme` off.

## References

- Studio's own `acss` and `bem` skills are not copied here: read them live with `etch.skills.get('acss' | 'bem')`
- `references/setup-cli-settings.md` — install, v4 changes, import/export, `wp acss` CLI, platform table
- `references/colors.md` — palette, shades, transparencies, contextual tokens, color scheme / dark mode
- `references/typography.md` — fluid headings/text, typography variables, text and marker classes
- `references/spacing-and-layout.md` — spacing, sections, smart spacing, widths, grids, flex, columns
- `references/buttons-links-cards.md` — buttons, links, cards, blockquotes
- `references/borders-effects-shadows.md` — borders, dividers, effects, shadows, overlays, icons, forms
- `references/accessibility.md` — focus, clickable parent, hidden-accessible, reduced motion
- `references/mixins-functions-recipes.md` — mixins, functions, recipes, and whether Etch's CSS accepts them

## Common mistakes

| Mistake | Instead |
|---|---|
| `padding: 40px; color: #1a1a1a` | `padding: var(--space-l); color: var(--text-dark)` |
| `grid--3`, `gap--m`, `.sr-only` from memory | Check the live class list; `.hidden-accessible` |
| `repeat(3, 1fr)` with a max-width breakpoint | `var(--grid-3)` inside a `min-width` query |
| Overriding generated CSS to rebrand | Change the ACSS setting |
| Pixel-matching a comp | Nearest token; semblance over pixel-perfection |
