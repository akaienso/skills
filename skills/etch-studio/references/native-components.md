# Etch Studio: native components catalogue

The web docs list 32 native components. In practice there are three states:

- **Prebuilt JSON** (2): copy the component JSON from the docs page and press ⌘/Ctrl+V in the builder.
- **Pattern** (16): "waiting on our Components API". A simple working version can be pasted from `patterns.etchwp.com`.
- **Planned** (13): "not currently available, but is planned". Nothing to use.

Search is listed but has no page in the corpus (1).

General gotchas:
- None of these is a built-in block type. Pasting creates normal Etch components, CSS and JS in the project, which you then own and edit.
- Patterns live on an external site. Read the pasted markup before relying on it.
- Agents should paste through `etch.blocks.pasteAsync()` (copy payload) or rebuild with the API. Never touch the canvas DOM.

Source: https://docs.etchwp.com/studio/components-native/overview

## Prebuilt (copy/paste JSON)

- **Basic Nav** (Navigation + Burger components)
  - What it is: a JSON-driven menu where `children` become dropdowns and grandchildren become flyouts. Use relative URLs.
  - Props: `jsonNav` (loop), `navAriaLabel` ("Menu"), `mouseSubmenu` (`hover` | `click` | `click-sub-hover`). Burger: `ariaLabel`.
  - Styling: CSS variables on `.etch-nav` / `.etch-burger`. The breakpoint is 768px in both components' CSS (search `/* Set the desired breakpoint */`).
  - JS: `aria-current` via `instantiateNavClass({ ariaCurrentPage: { homePage: false } })`.
  - Setup: put a slot (e.g. `{#slot right}`) in your Header component and paste both components into it.
  - **Studio gotcha:** the page says to configure the menu in the **Loop Manager** (a preinstalled `basicNav` loop). Studio has no Loop Manager (`goTo('loop-manager')` and `etch.loops` throw `NOT_AVAILABLE`, built-in guide). Inferred, unverified: on Studio, feed the `jsonNav` prop from a JSON data source (`data('nav')`) with the same `[{ label, url, children }]` shape, and verify after pasting.
- **Off Canvas** (drawer)
  - What it is: a drawer component with one slot, `drawerContent`. If the slot is missing, add it from the slot icon in the bottom elements bar.
  - Props: `triggerSelector` (default `.open-drawer`, a `.class` or `#id` on the page), `drawerPlacement` (left/right/top/bottom), `drawerDisplayMethod` (`overlap` | `pushBody`), `closeButtonVariant` / `closeButtonLabel`, `drawerId`, `maxWidth` (400px), `maxHeight` (100px), `drawerBackgroundColor`, `drawerBackdropColor`, `drawerPadding`, `cloneSelector` (moves an element into the drawer while open), `isInLoop`, `showEditor` (editor-only toggle).
  - Gotcha: `drawerId` must be **unique and alphanumeric** for multiple drawers on one page. Set `isInLoop` when it's used inside a loop.

Source: https://docs.etchwp.com/studio/components-native/basic-nav, https://docs.etchwp.com/studio/components-native/off-canvas

## Pattern (paste from patterns.etchwp.com)

| Component | Pattern URL |
|---|---|
| Accordion | https://patterns.etchwp.com/layouts/accordion/ |
| Advanced Nav | /layouts/navigation/ (JSON loop-driven) and /layouts/flex-nav/ (manual, mega-menu support) |
| Banner | /layouts/banner-alpha/ |
| Carousel | /layouts/carousel-alpha/ |
| Dev Note | /layouts/dev-note/ |
| Dialog | /layouts/dialog/ |
| Drawer | /layouts/drawer/ (the Off Canvas prebuilt above is the documented one) |
| Gallery | /layouts/gallery-alpha/ |
| Greeter | /layouts/greeter-alpha/ |
| Icon Menu Bar | /layouts/menu-bar-alpha/ |
| Logo Carousel | /layouts/logo-carousel-alpha/ |
| Read More | /layouts/revealer-alpha/ |
| Reading Progress | /layouts/reading-progress-alpha/ |
| Scroll Snap | /layouts/scroll-snap-alpha/ |
| Skip Link | /layouts/skip-link-alpha/ |
| Star Rating | /layouts/star-rating-alpha/ and /layouts/star-rating-bravo/ |

All URLs are on `https://patterns.etchwp.com`. Each page is one line: "waiting on our Components API". No props or gotchas are documented.

> Gotcha: Advanced Nav's "JSON loop-driven" pattern was written for loop sources. On Studio, point its loop at a data source (`data('…')`). Unverified.

Source: https://docs.etchwp.com/studio/components-native/ (accordion, advanced-nav, banner, carousel, dev-note, dialog, drawer, gallery, greeter, icon-menu-bar, logo-carousel, read-more, reading-progress, scroll-snap, skip-link, star-rating)

## Planned (not available)

Alert, Before/After, Copy to Clipboard, Countdown, Hotspot, Lightbox, Map, Slide Menu, Switch, Table, Table of Contents, Tabs, Tooltip.

Each page says only "not currently available, but is planned". Build these yourself as Etch components if you need them.

Source: https://docs.etchwp.com/studio/components-native/ (alert, before-after, copy-to-clipboard, countdown, hotspot, lightbox, map, slide-menu, switch, table, table-of-contents, tabs, tooltip)

## Missing

- **Search** is linked from the overview (`/studio/components-native/search`), but no page exists in the 2026-11-17 corpus. Status unknown.

Source: https://docs.etchwp.com/studio/components-native/overview
