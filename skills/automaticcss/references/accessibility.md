# ACSS 4: Accessibility

Scope: AutomaticCSS 4.x with Etch (EtchWP and Etch Studio). Names come from docs.automaticcss.com (4.0 docs, read 2026-11-17) and docs.etchwp.com unless marked. In Etch Studio the project's generated `classes.md` / `tokens.md` win.

## Quick map

| Need | Use |
|---|---|
| Visible focus ring | Global focus styling (dashboard), local `--focus-color` |
| Whole card clickable | `?clickable-parent` recipe (Etch and ACSS both list it) |
| Card shows focus as a unit | `?focus-parent` recipe |
| Text for screen readers only | `.hidden-accessible` (no `.sr-only`, no `.visually-hidden`) |
| Skip link | `.skip-link` class (Studio built-in skill), `?skip-link` recipe (Etch; ACSS 4.0.2+) |
| Motion | Reduce Motion setting, on by default; never turn off |
| New-tab links | External link indication (see buttons-links-cards.md) |

## Focus styling

- Dashboard: Additional Styling > Focus (renamed from "Accessibility" in 4.0).
- Focus Style: Outline (can be offset from the element) or Shadow (follows rounded corners).
- Focus Color (default: primary), Focus Width (rem suggested), Focus Offset (outline style only).
- All focus styling reads `--focus-color`. Reassign it where the default color would vanish against the background; it cascades to children:

```css
.site-footer { --focus-color: var(--white); }
.cta-band--primary { --focus-color: var(--primary-ultra-light); }
```

- Buttons have a per-color focus color setting and expose `--focus-color` in the `--btn-*` set.
- Removed in 4.0: `.focus--{color}` classes (`.focus--primary`, …). Set `--focus-color` instead.
- Don't remove outlines in Etch element CSS; if a custom component needs its own ring, build it from tokens:

```css
.tabs__tab:focus-visible {
  outline: var(--focus-width, 2px) solid var(--focus-color);
  outline-offset: 2px;
}
```

`--focus-width` is not listed by name in the ACSS docs (unverified; hence the fallback). Check `tokens.md`.

Source: https://docs.automaticcss.com/accessibility/focus-styling

## Clickable parent

Problem: wrapping a whole card in `<a>` nests block content in a link and makes screen readers announce everything or nothing. Fix: keep one real link (normally in the heading) and stretch its hit area with an absolutely positioned pseudo-element.

- ACSS 4 tools: `?clickable-parent` recipe (recommended) and `@include clickable-parent` mixin (SCSS only, applied to the actual `a` or `button`).
- Etch tools: Etch's own `clickable-parent` recipe: "expanding the clickable area of a child link to the entire parent element."
- Requirements: the card (parent) is `position: relative`; everything inside stays `position: static` (positioned children rise above the hit area and break it); one link per card. Multiple links: avoid, or modify the expansion by hand.
- Removed in 4.0: `.clickable-parent` class.

Plain-CSS equivalent for Etch when you write styles programmatically (recipes expand only when typed in the editor, see mixins-functions-recipes.md):

```css
.service-card {
  position: relative;
}
.service-card__link::after {
  content: "";
  position: absolute;
  inset: 0;
}
```

The expanded recipe may add more than this (for example z-index or focus handling): unverified, so read the expansion in the editor when you can.

> Conflict: the ACSS clickable-parent page says to apply the recipe to the parent (the card). The ACSS accessibility-recipes page says to apply it to the heading element that contains the link, with the parent set to `position: relative`. Etch's description doesn't say which element. Expand it once in the Etch editor and check which selector it targets before relying on either.

Source: https://docs.automaticcss.com/accessibility/clickable-parent, https://docs.automaticcss.com/mixins/clickable-parent, https://docs.automaticcss.com/recipes/accessibility-recipes, https://docs.etchwp.com/utilities/recipes/accessibility-recipes

## Focus parent

- Moves the focus indicator from the inner link to the card, so keyboard users get the same "whole card" cue. Uses `:focus` and `:focus-within`.
- `?focus-parent` recipe on the parent (the same element that is `position: relative`). Etch lists a `focus-parent` recipe with the same purpose.
- Mixin (ACSS SCSS only): `@include focus-parent(shadow)` or `@include focus-parent(outline)`.
- Removed in 4.0: `.focus-parent`, `.focus-parent--shadow`, `.focus-parent--outline`.

Plain-CSS sketch (my own construction, not from the docs):

```css
.service-card:focus-within {
  outline: 2px solid var(--focus-color);
  outline-offset: 4px;
}
.service-card__link:focus-visible { outline: none; }
```

Source: https://docs.automaticcss.com/accessibility/focus-parent, https://docs.automaticcss.com/mixins/focus-parent, https://docs.etchwp.com/utilities/recipes/accessibility-recipes

## Hidden accessible text

- `.hidden-accessible`: hides text visually, keeps it for assistive tech and search engines. In builders, ACSS shows an accessibility icon next to hidden text so editors remember it.
- Use it for icon-only links and buttons, especially where `aria-label` is hard to add, isn't translated, or gets forgotten.

```html
<a class="social__link" href="https://facebook.com/example">
  <svg data-icon aria-hidden="true">…</svg>
  <span class="hidden-accessible">Follow us on Facebook</span>
</a>
```

- Etch Studio built-in skill: the class is `.hidden-accessible`; there is no `.visually-hidden` or `.sr-only`.

Source: https://docs.automaticcss.com/accessibility/hidden-accessible-class; Etch Studio built-in `acss` skill (`etch.skills.get('acss')`)

## Skip link

- Etch Studio built-in skill names a `.skip-link` class ("the skip-to-content link"). Check `classes.md`.
- Etch recipe `skip-link`: hidden off-screen until focused, then slides into view. ACSS lists `?skip-link` among recipes new in 4.0.2 (Bricks and Gutenberg).
- Markup: first focusable element in the body, pointing at the main landmark: `<a class="skip-link" href="#main">Skip to content</a>` with `<main id="main">`.

Source: https://docs.etchwp.com/utilities/recipes/accessibility-recipes, https://docs.automaticcss.com/recipes; Etch Studio built-in `acss` skill (`etch.skills.get('acss')`)

## Reduce motion

- Options > Defaults & Misc > Reduce Motion (moved from Options > Accessibility in 4.0). On by default; turning it off "will technically make your site inaccessible."
- With `prefers-reduced-motion: reduce`: On Enter/On Exit get `animation: none`; On Visible gets `transition: none`; hover effects get `transition: none` and `translate`/`scale` reset to `none`. Elements appear immediately.
- It's an OS setting: if your own OS prefers reduced motion you won't see your animations. Don't switch the ACSS setting off to test.
- Your own animations in Etch CSS are not covered automatically. Guard them:

```css
.promo__badge {
  transition: scale var(--transition-duration) var(--ease-bouncy);
  @media (prefers-reduced-motion: reduce) { transition: none; }
}
```

Source: https://docs.automaticcss.com/accessibility/reduce-motion, https://docs.automaticcss.com/effects/effects-overview

## Related accessibility features elsewhere

- External link indication: visual indicator plus default screen-reader text "Link to external site" (buttons-links-cards.md).
- Blockquotes: use real `<blockquote>`, `<footer>`/`<figcaption>`, `<cite>` (buttons-links-cards.md).
- Inverted radius with clickable parent: the link must wrap the radius box and must not be positioned (borders-effects-shadows.md).

> Conflict: the ACSS docs home page still describes clickable parent as "a single utility class" and focus styling as applied "with simple utility classes". The 4.0 pages say those classes were removed in favor of recipes and `--focus-color`. Follow the 4.0 pages.

Source: https://docs.automaticcss.com/ (index), https://docs.automaticcss.com/links/external-link-indication
