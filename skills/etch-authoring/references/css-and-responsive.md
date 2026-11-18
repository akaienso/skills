# CSS and responsive development in Etch

Responsive, utilities, recipes and how-to pages are identical in the EtchWP and Studio trees (only link prefixes differ; Quick Notes drops a Gutenberg mention in Studio). AutomaticCSS specifics belong to the ACSS skill.

## 1. Where CSS goes

| API | What | Persistence |
|---|---|---|
| `etch.styles` | Per-selector rules **attached to blocks** (CSS panel, Style Manager → Selectors) and `:root` variables | buffered: `await etch.saveAsync()` |
| `etch.stylesheets` | Global raw CSS files, not linked to blocks (Style Manager → Stylesheets) | immediate |

- Docs: "Attached CSS": a selector's styles travel with the element (copy/import/export keeps them) and load only when the element is on the page. The CSS panel always wraps your CSS in the selected selector; you write declarations + nested rules.
- Studio built-in guide (authoritative for Studio): class/id CSS belongs in `etch.styles`, **never** a stylesheet. Giving a block a class auto-creates an empty linked selector; writing that class into a stylesheet produces a duplicate empty `.x {}` plus the real rule on deploy, and the Style Manager shows every class empty while the canvas still looks right. Reserve stylesheets for `@keyframes`, `@property`, a global `prefers-reduced-motion` rule, and `@font-face` only when ACSS isn't managing fonts. No resets or base element rules.
- Toolkit (stricter): no CSS in global stylesheets except `@keyframes`.
- Docs-sanctioned stylesheet uses also include the **Custom Media Definitions** stylesheet (`@custom-media`). Global element defaults (headings, top-level sections) are documented as **selectors** (`{h1}`, `{:where(section:not(section section))}` via the Attributes Bar), i.e. `etch.styles`, not stylesheets.

```js
// styles: create/update by selector (buffered)
const s = etch.styles.list().find(x => x.selector === '.hero__title');
s ? etch.styles.update(s.id, { css }) : etch.styles.create('.hero__title', css);
await etch.saveAsync();
```
Studio guide: `create` fills an empty existing selector but refuses one that already has CSS; use `update(id, { css })`. `StyleSelectorType`: `class | id | tag | element | attribute | custom`.

Source: https://docs.etchwp.com/interface/css-panel, https://docs.etchwp.com/public-api/styles, https://docs.etchwp.com/public-api/stylesheets, https://docs.etchwp.com/interface/style-manager, Etch Studio built-in guide (`etch.skills.get('etch-studio')`) ("Styling", "Classes and nesting"), toolkit `AGENTS.md`

## 2. Selectors in the UI (Attributes Bar, Cmd/Ctrl+Enter)

`.my-class`, `#my-id`, `.rand` / `#rand` (auto-unique), `.my-class:hover`, `[data-attribute="x"]` (brackets create a selector; bare `data-x="y"` only adds the attribute), complex selectors in braces `{.hero h1}`, tags `{h1} {h2}`.

Source: https://docs.etchwp.com/interface/attributes-bar

## 3. Flat BEM, nested states and queries

**Rule (Studio guide + toolkit):** every BEM class gets its **own** style record / top-level rule. Inside it, nest only states (`&:hover`, `&:focus-visible`), pseudo-elements (`&::before`), contexts (`.card--featured &`, `.hero &`), attribute variants (`&[data-variant="x"]`) and `@media`/`@container` queries. Never root-level `@media` blocks for component selectors.

```css
.hero__title {
  font-size: to-rem(48px);
  &:hover { color: var(--accent); }
  @media (width <= to-rem(768px)) { font-size: to-rem(32px); }
}
.hero__button--primary { background: var(--primary); }
```
Wrong: `.hero { .hero__title {…} }`, `.hero__button { &--primary {…} }`.

**Conflict:** the docs' CSS panel page promotes SCSS-like stemming (`.card { &__heading {…} &--x {…} }`; `&__`, `&_`, `&--`, `&-` all parse). The Studio built-in guide says nesting `&__title` inside `.card` compiles to `.card .card__title` and leaves the element's own record empty; the toolkit forbids it. Follow the flat rule when writing through the API.

- Use BEM `block__element--modifier`; name blocks for what they are; no Tailwind; logical properties, custom properties, `clamp()`, `:is()`, `:where()`, `gap`; set every important visual property explicitly (e.g. text color on dark backgrounds); prefer custom properties over hard-coded values; no `_` in custom property names; no resets, vendor prefixes or boilerplate unless asked (toolkit).
- CSS panel conveniences: typing `--primary` expands to `var(--primary)` (several at once: `--space-m --space-l`); `100px + 2rem` auto-wraps in `calc()`. Styling inputs and CSS panel sync both ways.

Source: https://docs.etchwp.com/interface/css-panel, Etch Studio built-in guide (`etch.skills.get('etch-studio')`), toolkit `agent-docs/etch-css.md`, `AGENTS.md`

## 4. `to-rem()` and other functions

- `to-rem(800px)` → `50rem` on the front end (base 16px), keeps px in the editor; works anywhere (queries included). Renamed from `rem()` in 1.0.0-alpha-4.
- Toolkit: never write raw rem; always `to-rem(px)`. `to-rem()` doesn't accept negatives: `calc(to-rem(48px) * -1)` (toolkit-only; not in docs).

Source: https://docs.etchwp.com/utilities/functions, toolkit `agent-docs/etch-css.md`

## 5. Recipes (`?name` expands in the CSS editor)

`?` triggers auto-suggest/expansion. Native only; custom recipes "stay tuned".
- Flex: `flex-row`, `flex-column`, `center-all`, `center-left`, `center-right`, `center-top`, `center-bottom`, `flex-grid` (`--columns`, `--gap`, `--stretch`).
- Grid: `auto-grid` (`--column-count`, `--auto-grid-aggressiveness`, uses `--content-width`, `--grid-gap`), `variable-grid`, `grid-1`…`grid-12`, `grid-1-2`, `grid-1-3`, `grid-2-1`, `grid-2-3`, `grid-3-1`, `grid-3-2`, `content-grid`.
- Accessibility: `clickable-parent`, `focus-parent`, `skip-link`. Color: `color-mix`.
- Fade: `fade-block`, `fade-inline`, `fade-top/right/bottom/left`.
- Gradients: `gradient-linear/radial/conic/sharp/fade/vignette/text/border` (`--color-1..3`, `--stop`).
- Pseudo: `::before`, `::after`, `::before, ::after`, `:hover`, `:focus-visible`, `:hover, :focus-visible`, `hover-exclude-touch`.
- Misc: `columns`, `line-clamp`, `concentric-radius`, `concentric-radius-reverse`, `font-face`, `is-bg`, `brace-contain`, `brace-left`, `brace-right`, `footer-reveal`.
- Ribbons: `corner-ribbon` + `data-ribbon-position="top-left|top-right"`, vars `--ribbon-width/offset/background-color/text-color/text-size/shadow/padding`.

Recipes expand in the editor UI; whether `?recipe` is expanded when CSS is written through `etch.styles` is **unverified**: write the expanded CSS in scripts.

Source: https://docs.etchwp.com/utilities/recipes/intro and the recipe pages under /utilities/recipes/

## 6. The reset (`@layer etch-reset`) — don't re-declare

From the Gearyco toolkit (the docs don't publish it): unlayered CSS always beats it, so never use `!important` against it. It sets `box-sizing: border-box`; `margin: 0` on everything; `text-size-adjust: none` and `scrollbar-gutter: stable` on `html`; `body` flex column, `min-block-size: 100svh`, `main { flex-grow: 1 }`; list styles off for `ul/ol[role=list]` and classed lists except `.list`, `.wp-block-list`, `[class*='marker']`; `img, picture, video, canvas, svg` and standalone `a` (not inside `p`, `span`, headings, `li`, `em`, `q`, `label`, `strong`, `figcaption`) → `max-inline-size:100%; height:auto; display:block`; form controls inherit font; `button` pointer, transparent, borderless, `currentColor`; `textarea:not([rows])` `min-height: 10em`; `overflow-wrap: break-word` on `p, h1–h6`; `figure > img { inline-size:100% }`; restores `.has-text-align-*`, `.has-fit-text`, `.aligncenter`, `.items-justified-*`, `.screen-reader-text`. Keep list markers with class `.list`.

Source: toolkit `agent-docs/etch-css-reset.md`

## 7. Keyframes → "Animations" stylesheet

- `@keyframes` can't be nested in a class rule and don't belong on `etch.styles` (toolkit: `etch.styles.create('@keyframes …')` is rejected). Classes only reference them (`animation: hero-slide 50s linear infinite;`).
- Find or create a global stylesheet named exactly **Animations**; append one block per name; read it first and skip names that exist.
```js
let sheet = etch.stylesheets.list().find(s => s.name === 'Animations');
if (!sheet) sheet = etch.stylesheets.get(await etch.stylesheets.createAsync({ name: 'Animations', css: '' }));
if (!/@keyframes\s+hero-slide\b/.test(etch.stylesheets.get(sheet.id).css))
  await etch.stylesheets.appendAsync(sheet.id, '@keyframes hero-slide { to { transform: translateY(-50%); } }');
```
Stylesheet writes persist immediately. Toolkit kit: `addKeyframes(name, body)`.

Source: toolkit `agent-docs/etch-keyframes.md`, `shared-helpers/etch/upsert.js`; https://docs.etchwp.com/public-api/stylesheets; Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 8. Small elements: `--empty-element-size`

Builder-only 35px minimum on empty elements. Set `--empty-element-size: 0` on the specific element (toolkit: whenever width/max-width < 20px); not globally.

Source: https://docs.etchwp.com/elements/empty-elements, toolkit `agent-docs/etch-css.md`

## 9. Responsive approach

- Etch has **no device breakpoints** and no preset preview sizes; the canvas is fluid (drag handles), shows canvas and element measurements, and auto-inserts queries with the exact measured value; the CSS Quick Actions Bar then resets so you style inside the query.
- **Container-query-first.** Media queries only for viewport/device concerns: top-level page layout, global typography, showing/hiding global UI, `print`, orientation, `hover`, `prefers-reduced-motion`, `prefers-color-scheme`.
- Intrinsic first: `clamp()` fluid type and spacing, `repeat(auto-fit, minmax(…))`, viewport units, relative units, `min()/max()`, `flex-wrap`, `aspect-ratio`, `object-fit`.

**Workflow (docs):** 1) build structure and attach selectors; 2) style mobile-first (recommended, not required); 3) drag the canvas, find where it breaks, auto-insert the query (add "Has Me" first for container queries); 4) put recurring conditions into `@custom-media` tokens.

**Container queries:** "Has Me" makes the parent the container from the component itself:
```css
.card {
  display: grid;
  :has(> &) { container-type: inline-size; }
  @container (width >= 500px) { grid-template-columns: 200px 1fr; }
}
```
Range syntax preferred (`width >= 600px`, `400px <= width <= 800px`); `min-width` also works.

**Custom media (since 1.2.0):** WP docs: gated behind the experimental settings toggle; enabling it creates a global stylesheet **Custom Media Definitions** (the same text appears in the Studio tree; whether Studio needs the toggle is unverified).
```css
@custom-media --nav-collapse (width <= 820px);
@custom-media --news-card-wide (width >= 421px);
.nav { @media (--nav-collapse) { … } }
.news-card { @container (--news-card-wide) { … } }
```
Use intent names (`--nav-collapse`, `--sidebar-stacks`). Multiple `and` conditions can't combine with a token; define the whole compound condition as one token. Copying an element carries its custom media definitions along. API: `etch.stylesheets.addCustomMediaAsync('--md', '(min-width: 768px)')`, `listCustomMedia()`; stylesheet `type: '@custom-media'`.

Source: https://docs.etchwp.com/responsive-development/philosophy, …/workflow, …/container-queries, …/using-media-queries, …/custom-media, …/intrinsic-responsiveness, https://docs.etchwp.com/interface/responsive-controls

## 10. Global basics without ACSS (how-to)

- Content width: Style Manager → Variables → `--content-width: 1280px;` (container default fallback is 1366px).
- Headings: add selectors `{h1} {h2} {h3} {h4} {h5} {h6}` in the Attributes Bar, style each via its selector pill; shared rules on `{:where(h1,h2,h3,h4,h5,h6)}`.
- Top-level sections: selector `{:where(section:not(section section))}` with `padding-inline: var(--gutter); padding-block: clamp(30px, 5dvw, 80px);` and variable `--gutter: clamp(16px, 10dvw, 80px);`.
- ACSS users skip all three (ACSS manages them).

Source: https://docs.etchwp.com/how-to/basics/how-to-set-content-width, …/how-to-set-global-heading-styles, …/how-to-set-global-section-styles

## 11. Variables

`etch.styles.listVariables(collection?)`, `getVariable(name, c?)`, `setVariable(name, value, c?)`, `removeVariable(name, c?)` manage `:root` custom properties (optional named collections). Part of `etch.styles`, so presumably buffered (the docs say the styles namespace is buffered).

Source: https://docs.etchwp.com/public-api/styles
