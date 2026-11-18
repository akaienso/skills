# Etch template syntax (shared by EtchWP and Etch Studio)

Etch markup is HTML plus a Svelte-inspired expression layer. Everything below works the same in both products unless a "WP vs Studio" note says otherwise. Docs read 2026-11-17. Never invent syntax; if something isn't here, probe it live (output `{this}` / `{item}`) or say it is unverified.

## 1. Expressions `{…}`

- `{path}` outputs a value: `{this.title}`, `{item.permalink.relative}`, `{props.heading}`, `{site.name}`.
- Same syntax in text and in attribute values: `href="{props.linkUrl}"`, `class="card {props.cardStyle}"`.
- Inside an existing expression (`{#if …}`, `{#loop …}`, loop args) do **not** add another pair of braces: `{#loop props.items as item}`, never `{#loop {props.items} as item}`.
- Debug: output `{this}` (or `{item}` inside a loop) to see the full JSON object and its real keys.
- Literal braces: put them in a string inside an expression: `{"{This will be output as is}"}`. Recipes `?brace-left`, `?brace-right`, `?brace-contain` expand to the same.
- Unknown modifier → `null` → empty string. Unknown expression function name → treated as a data path.

Source: https://docs.etchwp.com/dynamic-data/dynamic-data-keys, https://docs.etchwp.com/components/mapping-component-props, https://docs.etchwp.com/utilities/recipes/miscellaneous-recipes

## 2. Scopes and keys

| Scope | Where | Notes |
|---|---|---|
| `this.*` | templates/pages | current record |
| `item.*` (any name) | inside `{#loop … as item}` | you choose the name |
| `props.*` | inside a component | only what was passed in |
| `component.*` | inside a component | `id`, `name`, `key`, `defaults.<propKey>` (since 1.4.15) |
| `slots.<name>.empty` | inside a component | boolean |
| `site.*`, `url.*`, `environment.*` | everywhere | global |

Components see only global data (`this`, `site`, `url`) plus their props. Loop/template keys like `{item.title}` do **not** resolve inside a component; pass them as prop values (see components.md).

**WP vs Studio — keys differ (real difference):**
- EtchWP record keys: `id, title, slug, content, excerpt, permalink.relative, permalink.full, image, image.url, image.alt, date, modified, status, type, thumbnail, author(.id/.displayName), template(.slug/.id/.title), readingTime` plus raw `post_*` columns. Also `user.*` (incl. `user.loggedIn`, `user.userRoles`), `site.name/description/home_url/url/admin_url/version/language/isMultisite/currentDate`, `options.*`, custom fields `this.etch.*`, `this.meta.*`, `this.acf.*` (custom fields are covered by the EtchWP skill).
- Etch Studio record keys: `id, title, slug, content, createdAt, updatedAt`; custom fields `this.fields.<key>`; `site.name`, `site.url`, `site.locale`; data sources via `data('key')` (Studio skill). No `user.*`, no `options.*`.
- Both: `url.full`, `url.relative`, `url.parameter.<Name>` (case-sensitive; WP sanitizes with `sanitize_text_field()`).
- `environment.current`: WP `"etch" | "gutenberg" | "frontend"`; Studio `"etch" | "frontend"`. `environment.context` = `"componentEditor"` inside the component editor, else unset. Studio only: `environment.clientEditor` (true while a client edits, or while you preview as a client; always false on the published site).
- Studio built-in guide: a page served by a dynamic route has no slug (`''` reads as the homepage), so don't build links from `slug`; spell links from the route segment, e.g. `/locations/{loc.title.toSlug()}/`.
- Image keys conflict: the WP keys table lists `image`/`image.url`/`image.alt`; WP doc examples also use `{item.featuredImage}`, `{this.featuredImage}`, `{item.image.id}` and `{props.post.featuredImage.id}` (Object prop page). Gearyco toolkit says `.featuredImage` = URL, `.image.id` = ID, and `.featuredImage.id`/`.featuredImage.url` do not exist. Treat as **unverified**: dump `{item}` before binding.

Source: https://docs.etchwp.com/dynamic-data/dynamic-data-keys, https://docs.etchwp.com/studio/dynamic-data/dynamic-data-keys, https://docs.etchwp.com/components/component-namespace, `etch-studio/references/Etch Studio built-in guide (`etch.skills.get('etch-studio')`)`, toolkit `agent-docs/etch-markup.md`

## 3. Property names and bracket notation

- Dot notation only for names of letters, digits, underscore: `{this.category_name}`.
- Anything else needs brackets with quotes (single or double): `{item["full name"]}`, `{item['post-meta']}`, `{item["author-info"]["email"]}`, `{props['my-loop']}`.
- Arrays: `{this.categories[0].name}` or `{this.categories.at(0).name}` (equivalent); zero-based; `-1` = last, `-2` = second to last.
- The old dash/space-in-dot syntax is no longer supported.
- Studio built-in guide: index arrays with brackets, never dots: `data('courses')[0].title`. An inline literal loop `target` array must be valid JSON (double quotes): `["a","b"]` works, `['a','b']` fails ("Loop initialization failed").
- Studio changelog 2026-10-29: new Content Hub field keys are camelCase and can no longer contain hyphens.

Source: https://docs.etchwp.com/dynamic-data/dynamic-data-keys, https://docs.etchwp.com/studio/changelog, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 4. Modifiers (method calls on a value; chainable left to right)

Identical lists in WP and Studio docs (only the WP `.keys()` page has one extra `this.acf.keys()` example). `.dateFormat()` uses PHP date format strings in both.

**Basic**
- `.dateFormat("F j, Y")` format a date/Unix timestamp (PHP format; invalid input returned unchanged). `.format()` = deprecated alias.
- `.numberFormat(decimals=0, ".", ",")` grouped thousands; non-numeric unchanged.
- `.toUpperCase()` / `.toLowerCase()` strings only.
- `.toString()` booleans → "true"/"false"; arrays/objects → JSON.
- `.toInt()` numeric (incl. numeric strings) → integer; others unchanged.
- `.toSlug()` URL slug ("Über Theme" → "uber-theme").
- `.toBool()` common truthy/falsy inputs ("yes") → boolean.
- `.trim()` / `.ltrim()` / `.rtrim()` whitespace.
- `.stripTags()` remove HTML tags.
- `.urlEncode()` / `.urlDecode()`.
- `.htmlEncode()` / `.htmlDecode()` entities.
- `.truncateChars(count, ellipsis="...")` / `.truncateWords(count, ellipsis="...")`.
- `.round(precision=0)` / `.ceil()` / `.floor()`.
- `.concat(...)` strings: append args; arrays: merge arrays / append values.
- `.length()` string or array length.
- `.reverse()` string or array.
- `.at(index)` array element.
- `.slice(start, end?)` array portion (end exclusive).
- `.indexOf(x)` index in string/array, -1 if absent.
- `.pluck("key")` property from each object → array.
- `.keys()` / `.values()` object keys/values as array; non-objects pass through.
- `.split(sep=",")` string → array.
- `.join(sep)` array → string.
- `.replace(search, repl)` first occurrence; `.replaceAll(search, repl)` all.
- `.applyData()` re-applies dynamic data inside a stored string ("Hello {user.name}").
- `.unserializePhp()` serialized PHP string → value.

**Arithmetic** (since 1.4.20; non-numeric returns original value)
- `.add(n)`, `.subtract(n)`, `.multiply(n)`, `.divide(n)` (÷0 returns original), `.mod(n)` (÷0 returns original).

**Comparison** — all accept optional `(…, trueValue, falseValue)`; default return is boolean.
- `.startsWith(s)`, `.endsWith(s)`, `.includes(x)` (substring or array member), `.intersects(array)` (since 1.1.0).
- `.less(n)`, `.lessOrEqual(n)`, `.greater(n)`, `.greaterOrEqual(n)`, `.equal(v)`.
- `.isTruthy(t?, f?)` / `.isFalsy(t?, f?)` (WP: since 1.6.8). JS truthiness: falsy = `false`, `0`, `""`, `null`, missing. The string `"0"`, the string `"false"` and empty arrays are **truthy**. For `.isFalsy(a, b)`, `a` is returned when the value is falsy.

Inline if/else lives here, because `{#if}` cannot be used inside an attribute:
```html
<div class="{product.price.greater(10, 'product--expensive', 'product--affordable')}">
<div class="{index.mod(2).equal(0, 'row--even', 'row--odd')}">
<div style="gap: var({props.gap.isFalsy('--gap-default', '--gap-custom')});">
```
Caution (Gearyco toolkit): Etch only creates and links selectors for literal classes, so a class produced by an expression may never get its CSS output. Prefer `data-variant="{…}"` styled with `&[data-variant="…"]` (see components.md). The docs themselves show the class pattern; this conflict is flagged, not resolved.

Source: https://docs.etchwp.com/dynamic-data/dynamic-data-modifiers/basic-modifiers, …/arithmetic-modifiers, …/comparison-modifiers (and the `/studio/` equivalents), toolkit `AGENTS.md`

## 5. Expression functions (Studio docs only)

Return values directly; chain modifiers onto them; arguments may be dynamic.
- `range(end)` / `range(start, end)` integers, end exclusive; invalid → `[]`. `{#loop range(1, 13) as month}`.
- `rand()` float 0–<1; `rand(max)` int 0..max; `rand(min, max)` inclusive (swapped if reversed); non-numeric → 0. Re-evaluated every render.
- `uuid()` random v4 UUID, new per call.
- `lorem(count=8)` placeholder words, ends with a period; ≤0 → "".

WP vs Studio: only the Studio tree has an expression-functions page; there is no EtchWP page. Availability in EtchWP is **unverified**.

Source: https://docs.etchwp.com/studio/dynamic-data/expression-functions

## 6. Fallbacks `??` and `||`

- Studio changelog 2026-10-29 ("Fallbacks in expressions"): `??` or `||` in a dynamic expression falls back when the first value is empty, e.g. `{this.fields.metaTitle || this.title}`.
- EtchWP: no doc page shows it → **unverified**. Gearyco toolkit says there is no inline `??` fallback in dynamic data (written before or apart from that Studio change). In EtchWP, `??` is documented only inside Loop Manager query args (`$count ?? 10`), which is PHP-side, not template syntax.

Source: https://docs.etchwp.com/studio/changelog, https://docs.etchwp.com/loops/loop-arguments, toolkit `agent-docs/etch-markup.md`

## 7. Conditions

```html
{#if user.loggedIn} … {/if}
{#if !user.loggedIn} … {/if}
{#if props.productCategory === "featured"} … {/if}
{#if props.rating >= 2} … {/if}
{#if this.categories.pluck("name").includes("ABCs")} … {/if}
{#if (props.isActive || props.isHighlighted) && props.rating >= 4.5} … {/if}
{#if this.author.id === user.id} … {/if}
```
- Operators documented: `!`, `===`, `!==`, `==`, `!=` (loose, type-converting), `>`, `<`, `>=`, `<=`, `&&`, `||`, parentheses. Prefer strict. Quote text values; never quote numbers or booleans (`>= "2"` compares strings).
- Conditions are block-level (the `etch/condition` ghost block, `conditionString`). Not usable inline: use comparison modifiers.
- **Else — verified finding:** the current conditional-logic docs (basic, advanced, intro, both trees) show only `{#if …}…{/if}`. `{:else}` and `{:else if}` appear **nowhere** in the docs corpus. `{#else}` appears only in three EtchWP custom-field integration pages (text, image, gallery fields) as one-line tips, not in the conditional-logic section. The Gearyco toolkit contradicts itself: `AGENTS.md` lists `{#if}…{:else if}…{:else}…{/if}`, while `agent-docs/etch-markup.md` says there is no `{#else}` and to use paired blocks. Safe rule: write paired `{#if x}…{/if}{#if !x}…{/if}` or use a comparison modifier; treat any else form as unverified until tested live.
- Toolkit: don't add conditions defensively; assume content exists unless asked.

Source: https://docs.etchwp.com/conditional-logic/basic-conditions, https://docs.etchwp.com/conditional-logic/advanced-conditions, https://docs.etchwp.com/integrations/custom-fields/text-fields, toolkit `AGENTS.md`, `agent-docs/etch-markup.md`

## 8. Loops (syntax common to both)

```html
{#loop source as item} … {/loop}
{#loop items as item, index} … {/loop}
{#loop this.categories as category} … {/loop}
{#loop this.title.split(" ") as word} … {/loop}
{#loop props.myLoop as item} … {/loop}                         <!-- loop/repeater prop -->
{#loop props['my-loop'].slice(0, 3) as item} … {/loop}
{#loop props.myLoop($count: props.myCount.toInt()) as item} … {/loop}   <!-- loop args -->
{#loop range(1, 6) as n} … {/loop}                             <!-- Studio -->
{#loop data('courses') as course} … {/loop}                    <!-- Studio data source -->
```
- Prop keys used as loop sources must be camelCase or bracket notation; `props.your-loop-prop` is wrong.
- A loop and everything it renders must stay on one side of a component boundary.
- WP vs Studio: in EtchWP the source is a named loop from the Loop Manager (block JSON `loopId`/`loopParams`; covered by the EtchWP skill). In Studio there is no loop registry (`etch.loops` throws `NOT_AVAILABLE`); the loop `target` is an expression, usually `data('key')` (Studio skill).

Source: https://docs.etchwp.com/loops/basic-loops, https://docs.etchwp.com/components/props/prop-loop, https://docs.etchwp.com/studio/elements/loop, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 9. Other tags

- `{@slot name}` defines a slot in a component; `{#slot name}…{/slot}` fills it on an instance (components.md).
- `{@render expr}` renders an Etch JSON block tree (Studio; elements-and-markup.md).
- Environment checks: `{#if environment.current === "etch"}` editor-only content (WP also `"gutenberg"`); Studio: add `&& !environment.clientEditor` to hide from clients.
- `data-etch-note="…"` on any element = builder-only Quick Note, stripped on the frontend.

Source: https://docs.etchwp.com/components/slots, https://docs.etchwp.com/studio/elements/render, https://docs.etchwp.com/utilities/quick-notes
