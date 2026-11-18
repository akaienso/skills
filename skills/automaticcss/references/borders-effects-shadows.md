# ACSS 4: Borders, Dividers, Effects, Shadows, Overlays, Icons, Forms

Scope: AutomaticCSS 4.x with Etch (EtchWP and Etch Studio). Names come from docs.automaticcss.com (4.0 docs, read 2026-11-17) unless marked. In Etch Studio, the project's generated `tokens.md` / `classes.md` win: a feature switched off in the dashboard generates no tokens or classes.

## Global border system

- Radius: `var(--radius)` everywhere. Set it to `0` if the design has no radius. Size variants such as `var(--radius-l)` appear in examples (blockquote, border mixin); the full list belongs to the project's `tokens.md`.
- Border: `var(--border)` = width + style + color, light or dark by dashboard choice. The other variant: `var(--border-light)` (and by symmetry `var(--border-dark)`, unverified).
- Granular tokens: `--border-size` (width), `--border-style`, `--border-color-light`, `--border-color-dark`.
- `--border` doesn't include radius; declare both:

```css
.feature-card {
  border: var(--border);
  border-radius: var(--radius);
}
.feature-card--accent {
  border-block-start: var(--border-size) var(--border-style) var(--accent);
}
```

- Auto Radius: "Add Radius Automatically" with quoted, comma-separated selectors; default targets `img` and `figure` without images.
- Concentric radius: no token; use the `?concentric-radius` recipe (outer = `--inner-radius` + full padding since 4.0.2; children get `--inner-radius`) or `?concentric-radius-reverse` (4.0.2+; Etch also lists it).
- Removed in 4.0: `.border`, `.border-dark`, `.border-light` utility classes. Border colors use `color-mix()`.

> Conflict: the page lists width as `var(--border-size)` but its override example sets `--border-width`. The toolkit uses `--border-size`. Confirm in `tokens.md`.

Source: https://docs.automaticcss.com/borders-dividers/global-border-system, https://docs.automaticcss.com/recipes/border-radius-recipes

## Divider system

- `var(--divider)`: a `border` shorthand value. Alternates: `var(--divider-dark)` (light counterpart presumably `--divider-light`, unverified).
- Tokens: `--divider-inline-size`, `--divider-size`, `--divider-style`, `--divider-color-light`, `--divider-color-dark`, `--divider-gap`.

```css
.section-heading {
  padding-block-end: var(--divider-gap);
  border-block-end: var(--divider);
}
#special-heading { --divider: var(--divider-size) var(--divider-style) var(--accent); }
```

- Pseudo-element dividers: `inline-size: var(--divider-inline-size); block-size: var(--divider-size); background-color: var(--divider-color-dark);` (no style variants without `border`).
- ACSS recipes: `?divider-top`, `?divider-bottom`, `?divider-all` (parent; uses margins, so set `gap: 0`). Since 4.0.2 they have fallbacks (`1px`, `solid`, `#ddd`) and no extra space at the ends.
- Removed in 4.0: `.divider-top`, `.divider-bottom`, `.divider--all`.
- Etch: its recipe docs list no divider recipes. Write `border-block-*: var(--divider)` by hand.

Source: https://docs.automaticcss.com/borders-dividers/global-divider-system, https://docs.automaticcss.com/recipes/divider-recipes

## Inverted radius framework

- Off by default: Borders & Dividers > Additional Radius Options > Inverted Radius Support.
- Data attributes on the box the curves bend away from (max two corners): `data-inverted-radius-1-position`, `data-inverted-radius-1-slice`, `data-inverted-radius-2-position`, `data-inverted-radius-2-slice`.
- Position values (16): `top-left`, `top-outside-left`, `top-left-outside`, `top-outside-left-outside`, `top-right`, `top-outside-right`, `top-right-outside`, `top-outside-right-outside`, and the same 8 with `bottom`. "outside" follows the direction that is outside.
- Slice values: `top-left`, `top-right`, `bottom-left`, `bottom-right`.
- Needs `--bg` defined on an ancestor and used as its background:

```css
.promo { --bg: var(--primary-light); background-color: var(--bg); }
```

```html
<div class="promo__panel"
  data-inverted-radius-1-position="bottom-left-outside" data-inverted-radius-1-slice="bottom-right"
  data-inverted-radius-2-position="bottom-right-outside" data-inverted-radius-2-slice="bottom-left"></div>
```

- Responsive changes: set `--inverted-radius-[#]-position: var(--position-…)`, `--inverted-radius-[#]-slice: var(--slice-…)`, `--inverted-radius-[#]-shadow: var(--shadow-…)` (slice and shadow sides match).
- Shadow technique: no gradient or texture backgrounds on the parent. Hairline artifact fix: `transform: translate3d(0,0,0)` on the offending child.
- With clickable parent: the link must wrap the radius box, must not be on or inside it, and must not be positioned.

Source: https://docs.automaticcss.com/borders-dividers/inverted-radius-framework

## Effects overview

- All effects are opt-in (Effects > Options enables each; only enabled ones ship) and honor `prefers-reduced-motion`.
- Families: `.on-hover--*`, `.on-enter--*` (scroll-driven, `animation-timeline: view()`, Chrome/Edge 115+, else shown statically), `.on-exit--*`, `.on-visible--*` (Intersection Observer JS, plays once).
- Children: `-all` variants (`.on-enter-all--fade`). Stagger: `.on-enter--stagger`, `.on-exit--stagger`, `.on-visible--stagger` on the parent (uses `sibling-index()`; unsupported browsers animate together). Composable: several classes per element.

Source: https://docs.automaticcss.com/effects/effects-overview

## Easing presets

Five nameable slots (Effects > Options > Easing Presets): `--ease-smooth` (UI), `--ease-snappy` (reveals), `--ease-gentle` (A-to-B moves), `--ease-bouncy` (playful), `--ease-elastic` (`linear()` spring). Renaming a slot renames the variable (`--ease-{name}`).

```css
.card { transition: translate 0.3s var(--ease-smooth), box-shadow 0.3s var(--ease-smooth); }
```

Source: https://docs.automaticcss.com/effects/easing-presets

## Entrance, exit, visible

- Entrance classes: `.on-enter--fade`, `--float`, `--sink`, `--slide-left`, `--slide-right`, `--grow`, `--shrink`, `--blur`, `--parallax`. Vars: `--animate-range-start` (`entry 20%`), `--animate-range-end` (`entry 100%`), `--enter-opacity-start`, `--enter-float-distance`, `--enter-sink-distance`, `--enter-slide-distance`, `--enter-scale-start`, `--enter-scale-shrink`, `--enter-blur-amount`, `--enter-parallax-distance`. Parallax: parent needs `overflow: hidden`; other enter/exit classes on the same element are ignored, so put them on a wrapper.
- Exit classes: `.on-exit--fade`, `--float`, `--sink`, `--slide-left`, `--slide-right`, `--grow`, `--shrink`, `--blur`. Vars: `--exit-range-start` (`cover 50%`), `--exit-range-end` (`cover 100%`), `--exit-opacity-target`, `--exit-float-distance`, `--exit-sink-distance`, `--exit-slide-distance`, `--exit-blur-amount`, `--exit-scale-grow`, `--exit-scale-amount`.
- On Visible classes: `.on-visible--fade`, `--float`, `--sink`, `--slide-left`, `--slide-right`, `--grow`, `--shrink`, `--blur`. Vars: `--visible-duration` (`0.6s`), `--visible-timing` (`var(--ease-smooth)`), `--visible-delay`, `--visible-threshold` (`0.2`), `--visible-opacity-start`, `--visible-float-distance`, `--visible-sink-distance`, `--visible-slide-distance`, `--visible-scale-start`, `--visible-scale-shrink`, `--visible-blur-amount`. JS adds `acss-visible`; `data-skip-acss-visible` lets your own JS toggle `acss-visible` (menus, dialogs, tabs).

```html
<ul class="team__grid on-visible-all--fade on-visible-all--float on-visible--stagger">…</ul>
```

Source: https://docs.automaticcss.com/effects/entrance-effects, https://docs.automaticcss.com/effects/exit-effects, https://docs.automaticcss.com/effects/visible-effects

## Hover effects

- Transform: `.on-hover--grow`, `--shrink`, `--float`, `--sink`, `--slide-right`, `--slide-left` (`--hover-grow-amount`, `--hover-float-amount`).
- Shadow: `.on-hover--shadow` (`--hover-shadow`), `.on-hover--glow` (`--hover-glow-color`, `--hover-glow-spread`, `--hover-glow-opacity`).
- Filter/opacity: `.on-hover--brighten`, `.on-hover--fade` (80%).
- Border: `.on-hover--ripple-out`, `--ripple-in`, `--outline-out`, `--outline-in`, `--underline-left`, `--underline-center`, `--underline-right`. Vars `--border-ripple-{color,width,duration,distance}`, `--border-outline-{color,width,duration}`, `--border-underline-{color,width,duration}`. They reset the element's `border`/`outline`.
- Timing: `--hover-duration` (`var(--transition-duration, 0.3s)`), `--hover-timing`.

> Note: hover examples use `class="btn on-hover--glow"`; `.btn` isn't a documented ACSS 4 class. Use `.btn--primary` or your own class.

Source: https://docs.automaticcss.com/effects/hover-effects

## Transitions, sticky, selection, gradient fades

- Transition: `transition: background-color var(--transition), color var(--transition);`. Granular `--transition-duration`, `--transition-timing`, `--transition-delay`. `--transition` is precomputed; local overrides must use the granular vars. Buttons and links use it by default. Removed: `.transition` class.
- Sticky: `.sticky` → `position: sticky; inset-block-start: var(--sticky-offset, 0)`. Offsets `.sticky-top--s`, `--m`, `--l` (Additional Styling > Sticky Settings; per-breakpoint values). Removed: `.relative` etc., `.z--*` classes.
- Selection: default and alternate colors under Additional Styling > Selection Styling; `.selection--alt` on a box switches it and its children. Use color tokens.
- Gradient fades (background-agnostic): classes `.fade--block`, `--inline`, `--top`, `--right`, `--bottom`, `--left` (enable Options > Utility Classes > Fade Classes); `--fade-amount` (default 25%); since 4.0.2 `--fade-softness` (default `1`) and `?fade-all`. Etch lists its own fade recipes: `fade-block`, `fade-inline`, `fade-top`, `fade-right`, `fade-bottom`, `fade-left`.

Source: https://docs.automaticcss.com/effects/transition, https://docs.automaticcss.com/effects/sticky, https://docs.automaticcss.com/effects/selection-styling, https://docs.automaticcss.com/effects/gradient-fades, https://docs.etchwp.com/utilities/recipes/fade-recipes

## Shadows

- Five nameable slots per type (Shadows panel). Renaming slot 1 "subtle" yields `--box-shadow-subtle`.
- Box: `--box-shadow-1` … `--box-shadow-5` (1 subtle, 2 medium, 3 heavy; 4–5 empty). `box-shadow: var(--box-shadow-1);`
- Drop: `--drop-shadow-1` … `--drop-shadow-5`; already wrapped in `drop-shadow()`, so `filter: var(--drop-shadow-1);`. For SVG, transparent PNG, clip-path/mask shapes.
- Text: `--text-shadow-1` … `--text-shadow-5`. `text-shadow: var(--text-shadow-2);`
- Each type can be disabled under Options. Removed in 4.0: `.box-shadow--m` etc. and the old `m`/`l`/`xl` names.

Source: https://docs.automaticcss.com/shadow-filters/shadows-overview, https://docs.automaticcss.com/shadow-filters/box-shadows, https://docs.automaticcss.com/shadow-filters/drop-shadows, https://docs.automaticcss.com/shadow-filters/text-shadows

## Overlays

- Basic (Surfaces & Overlays > Basic Overlays): `.overlay` or any class containing `overlay--` (e.g. `.overlay--dark`). Vars: `--overlay-color` (default `rgba(0,0,0,.7)`), `--overlay-z-index` (default `-1`; auto `0` on a `figure` with media). Pseudo element `::before` or `::after` (dashboard). Parent gets `position: relative; isolation: isolate`.
- Custom (up to 5): `.overlay-1` … `.overlay-5`, plus `.overlay-{name}` when named. Options: bg color, type (gradient/image/none), asset, size, position, attachment, repeat, backdrop blur, blend mode, opacity (0.7), radius, animation, inset.
- Custom overlay vars (global and per-slot `--overlay-[n]-*`): `--overlay-bg-color`, `--overlay-background`, `--overlay-background-size`, `--overlay-background-position`, `--overlay-background-repeat`, `--overlay-background-attachment`, `--overlay-background-blur`, `--overlay-opacity`, `--overlay-blend-mode`, `--overlay-border-radius`, `--overlay-animation`, `--overlay-inset`, `--overlay-z-index`.

```css
.hero { --overlay-color: color-mix(in oklch, var(--black) 55%, transparent); }
```

Source: https://docs.automaticcss.com/overlays/overlay-classes, https://docs.automaticcss.com/overlays/custom-overlays

## Icons

- On by default (Icons screen). Add the `data-icon` attribute directly on the `<svg>` (no wrapper).
- Themes: Light/Dark (name the theme after the icon color). Styles: boxed or plain (default in Icon Framework Options).
- Overrides on an icon or a parent: `.icon--light` / `.icon--dark` or `data-icon-theme="light|dark"`; `.icon--boxed` / `.icon--plain` or `data-icon-style="boxed|plain"`; `.icon--{size}` or `data-icon-size="{size}"` (three sizes by default, M default; "Expand Icon Sizes" adds more; exact size list unverified).
- Icon lists: `.icon-list` or `[data-icon-list]` on `ul`/`ol`; settings for boxed list icons, size, gap, inline/block offset. Pseudo-element icons aren't supported.
- Mixin `@include icon($style, $box-style)` is ACSS Custom SCSS only (see mixins-functions-recipes.md). Cards style icons only with `[data-icon]`.

Source: https://docs.automaticcss.com/icons/icon-framework, https://docs.automaticcss.com/icons/icon-mixin

## Forms

- Supports **WS Form only** (WordPress plugin). Turn on Load Forms on the Forms screen; WS Form's Styler must be enabled; save WS Form settings to regenerate.
- Colors adapt via `light-dark()` and `color-scheme`; force with `.form--light` / `.form--dark` on the form or a parent.
- 4.0.1+: Floating Label Background (Form Styling > Label > Label Colors, default `--white`) for "Inside" labels.
- Etch Studio: no WS Form, so ACSS form styling has nothing to target there (inference from "compatible with WS Form" only); style Studio forms with your own BEM classes and tokens.

Source: https://docs.automaticcss.com/forms/form-styling-basics
