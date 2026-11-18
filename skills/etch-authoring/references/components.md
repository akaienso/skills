# Components: props, slots, variations

Component docs are word-for-word the same in the EtchWP and Studio trees (only link prefixes differ). The one textual difference is in the `component` namespace page: WP lists Gutenberg among the places it renders, Studio doesn't. The Media prop page says "WordPress media library" in both trees; in Studio, image props hold an **asset id** (Studio built-in guide).

## 1. Model

- A component is a self-contained, reusable chunk with its own **scope**: inside it you only see global data (`this`, `site`, `url`), `props.*`, `component.*` and `slots.*`. Loop/template keys (`{item.title}`, `{post.title}`) never resolve inside it; pass them in as prop values.
- Build the static version first, then right-click its root in the Structure panel → **Create Component**, name it, add props, **Save** (the purple button; Exit before Save abandons it).
- Variations are never duplicate "snapshot" components: one component plus Boolean/Select props, conditional logic and conditional styles.
- In HTML, an instance is written with the component key as a tag: `<PostCard post="{post}" />`. Block JSON: `{ type:'etch/component', version:1, context:{name}, componentId:<number>, attributes:{<propKey>: '<value>'}, children:[…slot-content…] }`.
- Gearyco toolkit: anything reusable (cards, list rows, section intros, timelines, CTAs, anything used twice) must be a component with editable props, never repeated hand-built markup. Every piece of content is a prop.

Source: https://docs.etchwp.com/components/intro-components, https://docs.etchwp.com/components/creating-a-component, https://docs.etchwp.com/components/creating-component-variations, https://docs.etchwp.com/components/using-a-component-dynamic, https://docs.etchwp.com/components/props/prop-object, toolkit `AGENTS.md`

## 2. Prop types and their JSON shapes

Every prop has a **Name/Label** (UI) and a **Key** (code, `{props.key}`). Shapes from the Public API `ComponentProperty` union (identical in both products):

| UI prop | `type` JSON | Extra fields | Notes |
|---|---|---|---|
| Text | `{ primitive:'string' }` | `default?: string` | text or textarea content |
| URL | `{ primitive:'string', specialized:'url' }` | `default?` | |
| Color | `{ primitive:'string', specialized:'color' }` | `default?` | |
| Select | `{ primitive:'string', specialized:'select' }` | `selectOptionsString` (newline list `Label : Value`), `options?: string[]` | first line is the default; spaces around ` : ` are mandatory; a line with no `:` is both label and value; output is the value |
| Media / Image | `{ primitive:'string', specialized:'image' }` or `'wpMediaId'` | `default?` | Media prop has ID or URL mode. Studio guide: use `specialized:'wpMediaId'` (historical name, holds an asset id) |
| Boolean | `{ primitive:'boolean' }` | `default?: boolean \| string` | string allows an expression default |
| Object | `{ primitive:'object', specialized?: string }` | `default?: object \| array` | the default is fallback/preview data only |
| Class | `{ primitive:'array', specialized:'class' }` | `default?: string[]` | since 1.3.0 |
| Group | `{ primitive:'object', specialized:'group' }` | `properties: ComponentProperty[]` | since 1.4.0; `{props.hero.title}` |
| Repeater | `{ primitive:'array', specialized:'repeater' }` | `properties: ComponentProperty[]` | Group with Repeater on (since 1.4.6); loop it |
| Condition | `{ primitive:'string', specialized:'condition' }` | `properties`, `default?: string` (the condition) | since 1.4.8; no key, no data |
| Array | `{ primitive:'array', specialized?: string }` | `default?: unknown[]` | |
| Number | `{ primitive:'number' }` | | reserved; **not implemented** in the builder |
| Loop | — | — | Loop prop JSON shape is **not documented**; read one from `components.getJson()` before authoring |

Base fields on every prop: `name`, `key`, `description?`.

```js
const tagProp = { name:'Tag', key:'tag', type:{ primitive:'string', specialized:'select' },
  selectOptionsString: ['li','article','div'].join('\n') };
const headingProp = { name:'Heading Level', key:'headingLevel', type:{ primitive:'string', specialized:'select' },
  selectOptionsString: ['h3','h2','h4'].join('\n') };
const features = { name:'Features', key:'features', type:{ primitive:'array', specialized:'repeater' },
  properties: [ { name:'Title', key:'title', type:{ primitive:'string' } } ] };
```

Prop behaviour (docs):
- **Class prop:** `class="card {props.cardStyle}"`. Defaults (e.g. `.card--rounded`) are greyed on instances; adding your own classes replaces the defaults. Typing a class creates a linked Etch style if missing. `component.defaults.<key>` resolves style ids to class names.
- **Select:** referencing outputs the value; outputting the label isn't possible yet.
- **Loop prop:** lets the instance pick the loop source: `{#loop props.myLoop as item}`, with args `{#loop props.myLoop($count: props.myCount.toInt()) as item}`, modifiers `props.myLoop.slice(0, 3)`. Key must be camelCase or bracket notation. (Loop sources are an EtchWP Loop Manager concept; Studio uses data sources.)
- **Group/Repeater:** preview data is built from nested defaults; repeater instance panel has Add/Delete per item; groups can nest inside repeaters (`{member.social.twitter}`).
- **Condition prop:** shows/hides the nested prop inputs in the editor only (WP: also in Gutenberg); nested props sit at the same level as outside ones. Condition strings use the same syntax as `{#if}`, and may reference other props or dynamic data. Keep nesting ≤2 levels.
- **Object prop:** for components whose job is to render one item (post/product/team card). Key `post` → `{props.post.title}`. Put a real sample (copied from `{item}` output) in the code editor as preview data. Instance input is a combobox that auto-fills from the nearest ancestor loop; pick the innermost loop that matches the shape; you can also type a JSON object for static use.

Source: https://docs.etchwp.com/public-api/components, https://docs.etchwp.com/components/creating-component-props, https://docs.etchwp.com/components/props/prop-text … prop-select, prop-media, prop-loop, prop-object, prop-class, prop-group, prop-condition, Etch Studio built-in guide (`etch.skills.get('etch-studio')`) ("Components and slots")

## 3. Mapping props

- Visual: target icon next to the prop → click the element; its text becomes `{props.key}`.
- Copy & paste: copy icon gives `props.key`; wrap in braces unless already inside an expression: `{props.heading}`, `href="{props.linkUrl}"`, `{#if props.isFeatured}`, `{#loop props.items as item}`.
- "Coming soon" on that page: auto-suggest when mapping props.

Source: https://docs.etchwp.com/components/mapping-component-props

## 4. Static vs dynamic use

- **Static:** fill each prop by hand (Text field, Boolean toggle, Select dropdown, Image picker or URL, Array input, Slot drop area). Insert with Cmd+I.
- **Dynamic:** put the instance inside a loop/template and give props keys: `{item.title}`, `{item.permalink.relative}`, `{item.image.id}`; in templates `{this.title}`. Or pass the whole item through an Object prop.
- The same component can be used both ways.
- Rule: a loop and all it renders stay on one side of the component boundary. Moving markup with a nested loop into a component breaks it; pass the item via an Object prop and move the nested loop inside: `{#loop props.product.terms as term}`.
- Docs tip: if a component doesn't need edit-once-update-everywhere, save it as an unsynced **Pattern** instead; patterns keep outer loop scope.

Source: https://docs.etchwp.com/components/using-a-component-static, https://docs.etchwp.com/components/using-a-component-dynamic, https://docs.etchwp.com/components/props/prop-object

## 5. Slots

- Define: `{@slot name}` (Slot icon in the component editor's Elements Bar). Fill on an instance: `{#slot name}…{/slot}`. JSON: `etch/slot-placeholder {slotName}` in the definition, `etch/slot-content {slotName}` as an instance child.
- Unlimited slots; anything can go in; content is per instance; empty slots render nothing.
- `slots.<name>.empty` for defaults and conditional wrappers:
```html
{#if slots.default.empty}<p>Default content</p>{/if}
{@slot default}
{#if !slots.footer.empty}<div class="card__footer">{@slot footer}</div>{/if}
```
- Don't fill slots inside the component editor. Removing `{@slot old}` deletes empty slot instances but keeps ones with content.
- A slot never receives per-iteration loop data (fill content is resolved once, outside the loop). Put a component with an Object prop inside the loop instead.
- Doc inconsistency: the Basic Nav page says "Add a `{#slot}` inside the Header (e.g. `{#slot right}`)" for a definition; the Slots page says definitions are `{@slot name}`. Follow the Slots page.
- Set instance props via API: `etch.blocks.update(instanceId, { attributes: { title: 'Second' } })`.

Source: https://docs.etchwp.com/components/slots, https://docs.etchwp.com/components-native/basic-nav, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## 6. Variations

Docs give three techniques:
1. **Boolean + condition** to show/hide parts: `{#if props.showLede}<p>{props.lede}</p>{/if}`.
2. **Inline tokens** for cosmetic per-instance values: `style="--card-bg: {props.cardBg};"`, CSS reads `var(--card-bg)`.
3. **Data attribute from a Select prop** for multi-property variants: `data-theme="{props.theme}"`, CSS `.card[data-theme="dark"] {…}`.

**Gearyco toolkit rules (adopt):**
- Never build class names from props (`card--{props.variant}`): Etch only creates and links selectors for literal classes, so that modifier's CSS may never be output. Use `data-variant="{props.variant}"` and style it **nested in the base selector**: `.card { &[data-variant="featured"] {…} }`, or let the parent set a scoped custom property.
- Heading levels are a `select` prop on a dynamic element: `<etch:element tag={props.headingLevel}>`.
- **Tag prop pattern:** a component that may be a list item gets a `tag` select prop (`li`, `article`, `div`, most common first) on an `<etch:element tag={props.tag}>` root (`etch/dynamic-element`, `attributes:{ tag:'{props.tag}', class:'…' }`). In a list, set `tag` to `li` directly inside the `ul`/`ol`; never wrap the instance in another `li`.
- Conflict: official docs (Class prop page, comparison modifiers, `.toSlug()` "generate CSS class names") do show class names produced from values. The toolkit's warning is a practical one about selector output; it is not stated in the docs. Prefer data attributes or Class props (which do create linked styles).

Source: https://docs.etchwp.com/components/creating-component-variations, https://docs.etchwp.com/elements/element, toolkit `AGENTS.md`, `agent-docs/etch-markup.md`

## 7. `component` namespace (since 1.4.15)

`{component.id}` (number; may be empty when unsaved), `{component.name}`, `{component.key}` (e.g. `"BlogCard"`), `{component.defaults.<propKey>}` (resolved defaults; nested groups by dot; class defaults as class names). Only inside the component's own HTML. Use it to detect overrides: `{#if props.title !== component.defaults.title}`.

Source: https://docs.etchwp.com/components/component-namespace

## 8. API: create, update, upsert by key

```ts
etch.components.list(): PublicComponentSummary[]        // {id:number, name, key, description?, properties}
etch.components.getJson(id: number): PublicComponentJson // + blocks
await etch.components.createAsync(name): Promise<number>
await etch.components.updateAsync(id, { name?, key?, description?, properties?, blocks? })
await etch.components.deleteAsync(id)
```
- All three mutations **persist immediately** (no `saveAsync`). `properties` and `blocks` in a patch **replace** the existing ones.
- `key` is **auto-converted to PascalCase** ("Stored key is converted to PascalCase — look it up again", Studio guide). So an upsert that finds by `c.key === def.key` must use the PascalCase form (e.g. `SiteHeader`, not `site-header`), or it will miss and create a duplicate. The toolkit's `upsertComponent` matches `key` **or** `name`, and `componentId(key)` throws if the PascalCase key isn't found.
- Upsert pattern: find by PascalCase key (or name) → `createAsync(name)` if missing → `updateAsync(id, definition)`.
- Edit an instance's internal tree: `etch.blocks.enterComponentEditMode(instanceId)` → mutate via `etch.blocks` → `await etch.blocks.saveComponentEditModeAsync()` → `await etch.saveAsync()` → `exitComponentEditMode()` (or `{ revert: true }`).
- Instance props are a closed schema: unknown key → `INVALID_ARGUMENT` (`OPERATION_FAILED` if the definition hasn't loaded). Class/repeater/group values must be passed in the component's internal format.

Source: https://docs.etchwp.com/public-api/components, https://docs.etchwp.com/public-api/blocks, Etch Studio built-in guide (`etch.skills.get('etch-studio')`), toolkit `shared-helpers/etch/upsert.js`

## 9. Component CSS

The component's classes follow BEM; its CSS lives on its own Etch selectors (`etch.styles`), one record per class (css-and-responsive.md).

Source: toolkit `agent-docs/etch-markup.md`, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)
