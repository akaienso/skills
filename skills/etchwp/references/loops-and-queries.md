# EtchWP: loops, queries, Loop Manager, `etch.loops`

Loop **markup** syntax (`{#loop}`, conditions, modifiers) is covered in the shared authoring reference. This file covers WordPress data sources and loop definitions.

## Data sources
| Loop Manager source | `config.type` (Public API) | Backed by |
|---|---|---|
| WP Query | `wp-query` | `WP_Query` args |
| WP Terms | `wp-terms` | term query args |
| WP Users | `wp-users` | user query args |
| Main Query | `main-query` | the request's main query (archives, search) |
| JSON | `json` | static array |

- The **Loop element** is a ghost element: provides loop context and controls, outputs nothing itself.
- Inline data also works: `{#loop [1,2,3,4,5] as item}`. Field data works as a source: `{#loop this.acf.faq as faq}`.
- A custom query (saved in the Loop Manager) is **required** for looping posts on a regular page; templates use `mainQuery`.

Source: https://docs.etchwp.com/loops/basic-loops ; https://docs.etchwp.com/elements/loop ; https://docs.etchwp.com/public-api/loops

## Loop Manager (UI)
- Three columns: (1) saved loops + basic config (**name, key, source, type**), (2) query parameters, (3) **output preview** (JSON of what each item exposes; use it to discover field keys).
- `esc` or the arrow returns to building.
- The loop **key** is what markup references: `{#loop blogPosts as item}`. Docs use camelCase/underscore keys (`mainQuery`, `blogPosts`, `relatedPosts`, `recent_posts`). Whether hyphenated keys (e.g. the Public API example `recent-posts`) work in markup is unverified: prefer camelCase.
- UI shortcut: select the element to repeat (e.g. the `<li>`, not the `<ul>` or inner `<article>`), hold Cmd/Ctrl and click **Loop** to insert the loop as a sibling, then drag the element in.

Source: https://docs.etchwp.com/interface/loop-manager ; https://docs.etchwp.com/loops/basic-loops

## Query-args format (Loop Manager parameters column)
Write a PHP-style `$query_args` array. Any `WP_Query` arg is allowed.

```php
$query_args = [
  'post_type' => 'post',
  'posts_per_page' => $count ?? 10,   // loop argument with default
  'orderby' => 'date',
  'order' => 'DESC',
  'post_status' => 'publish',
  'ignore_sticky_posts' => 1,
];
```

- `$name` = loop argument (placeholder). Just write it; no declaration needed.
- `$name ?? default` = default when the caller doesn't pass it. **First declared default wins** if the same arg appears twice with different defaults; use separate names (`$count`, `$offset`).
- Arrays where WP expects arrays: `'post__not_in' => [$post_id]`, `'terms' => [$term_id]`.
- Keep `$taxonomy`-style args **unquoted** in the definition; quote string values at the call site (`$taxonomy: "category"`).

Source: https://docs.etchwp.com/loops/loop-arguments

## Passing loop arguments
```html
{#loop blogPosts as item}                                   <!-- defaults -->
{#loop blogPosts($count: 3) as item}                        <!-- override -->
{#loop relatedPosts($count: 3, $post_id: this.id) as post}  <!-- several, dynamic -->
{#loop recent_posts($count: props.numberOfPosts) as item}   <!-- from a component prop -->
```

Related posts in the same first category:

```php
$query_args = [
  'post_type' => 'post', 'posts_per_page' => 3, 'post_status' => 'publish',
  'orderby' => 'date', 'order' => 'DESC',
  'post__not_in' => [$post_id],
  'tax_query' => [[ 'taxonomy' => $taxonomy, 'field' => 'term_id', 'terms' => [$term_id] ]],
];
```

```html
{#loop relatedPosts($post_id: this.id, $taxonomy: "category", $term_id: this.categories.at(0).id) as post}
  <li class="related-post-card"><h3>{post.title}</h3></li>
{/loop}
```

Source: https://docs.etchwp.com/loops/loop-arguments

## Main Query loops
- Built-in global preset: name `Main Query`, key **`mainQuery`**, type `main-query`. You may create your own main-query presets with other defaults.
- Preset defaults: `posts_per_page` = `$count ?? 10`, `orderby` = `$orderby ?? 'date'`, `order` = `$order ?? 'DESC'`, `offset` = `$offset ?? 0`.
- Use on: post type archives, taxonomy archives, search. Not for static listings (use WP Query). Outside an archive-like context, results "may be empty or surprising".

```html
{#loop mainQuery($orderby: "title", $order: "ASC") as item} ... {/loop}
{#loop mainQuery($count: -1) as item} ... {/loop}
```

- `item.main.*`: raw, un-normalized main-query item data (fields third-party plugins attach). Advanced escape hatch; varies by plugins. Prefer `item.*`.

Source: https://docs.etchwp.com/loops/main-query

## Nested loops
- Pass the parent item's ID into the child loop's argument.

```php
// categories (wp-terms)
$category_args = [ 'taxonomy' => 'category', 'hide_empty' => false ];
// posts (wp-query)
$post_args = [ 'post_type' => 'post', 'posts_per_page' => 5, 'post_status' => 'publish', 'cat' => $cat ];
```

```html
{#loop categories as category}
  <!-- term label key not documented here: check the Loop Manager preview -->
  {#loop posts($cat: category.id) as post}<p>{post.title}</p>{/loop}
{/loop}
```

- Custom taxonomies use `tax_query` (`'terms' => $status`) instead of `cat`: `{#loop projects($status: status.id) as project}`.
- JSON children: `{#loop author.books as book}`.
- **Since 1.6.8:** an inner loop with the same alias as the outer (`item` / `item`) fully shadows it; missing fields no longer fall back to the outer item. Always give nested loops distinct aliases.

Source: https://docs.etchwp.com/loops/nested-loops

## Looping attachments
```php
$query_args = [
  'post_type' => 'attachment',
  'post_parent' => $id,            // pass this.id or item.id
  'posts_per_page' => -1,
  'post_status' => 'inherit',      // attachments need 'inherit'
  'post_mime_type' => 'image',     // optional type filter
  'orderby' => 'menu_order',
  'order' => 'ASC',
];
```
- Taxonomized media (e.g. HappyFiles): drop `post_parent`, add `tax_query` on the media taxonomy (docs example: `happyfiles_category`).

Source: https://docs.etchwp.com/loops/looping-attachments

## Empty state and index
```html
{#loop posts as item}<p>{item.title}</p>{/loop}
{#loop posts.length().equal(0, [1], []) as item}<p>No results</p>{/loop}  <!-- vendor workaround -->
{#loop recentPosts as post, index} ... {/loop}  <!-- index starts at 0 -->
```

Source: https://docs.etchwp.com/loops/basic-loops

## Item keys: inconsistency to watch
- Docs examples use both `{item.featuredImage.url}` (basic loops, facet pages) and `{item.image.url}` (keys page, main query). Before shipping, check the Loop Manager preview or dump `{item}` to confirm which key the site exposes.

Source: https://docs.etchwp.com/loops/basic-loops ; https://docs.etchwp.com/dynamic-data/dynamic-data-keys

## Public API: `etch.loops` (buffered: persist with `await etch.saveAsync()`)
```ts
interface EtchLoopsApi {
  getAll(): Record<string, EtchLoop>;               // keyed by id
  add(loop: EtchLoop): string;                      // returns id
  update(loopId: string, loop: EtchLoop): void;
  delete(loopId: string): void;
  findLoop(query: string): (EtchLoop & { id: string })[]; // fuzzy name/key
  setForBlock(blockId: string, loop: BlockLoopBinding): void;
}
interface EtchLoop { key: string; name: string; global: boolean; config: EtchLoopConfig; }
type EtchLoopConfig =
  | { type: "wp-query"; args: WpQueryArgs } | { type: "wp-terms"; args: WpTermsArgs }
  | { type: "wp-users"; args: WpUsersArgs } | { type: "main-query"; args: WpQueryArgs }
  | { type: "json"; data: unknown[] };
interface BlockLoopBinding { loopId?: string; target?: string; itemId?: string; indexId?: string; loopParams?: Record<string, unknown>; }
```

```ts
if (etch.environment?.capabilities.loops !== true) throw new Error("no loop registry");
const loopId = etch.loops.add({
  key: "recentPosts", name: "Recent posts", global: true,
  config: { type: "wp-query", args: { post_type: "post", posts_per_page: "$count ?? 6", orderby: "date", order: "DESC" } },
});
const [blockId] = etch.blocks.find({ type: "etch/loop" });
etch.loops.setForBlock(blockId, { loopId, itemId: "post", indexId: "i", loopParams: { count: 3 } });
await etch.saveAsync();
```
- `global: true` = reusable; `false` = local to the document.
- Enumerate with `getAll()`, never `list()`: there is no `etch.loops.list`, and calling it throws a bare `TypeError: etch.loops.list is not a function` — not an `EtchApiError`, so no code to catch on. `getAll()` returns an object keyed by loop id, not an array; iterate with `Object.entries()`.
- Param expressions: `NumericParam = number | "$x" | "$x ?? 10"`; `BooleanParam = boolean | 0 | 1 | "$x" | "$x ?? true"`. Note `loopParams` keys drop the `$` (`{ count: 3 }`).
- Typed `WpQueryArgs`: `post_type, posts_per_page, offset, paged, page, orderby, order, post_status, ignore_sticky_posts, author, author_name, category, category_name, tag, tax_query, meta_query, s` (open-ended).
- `TaxQueryItem`: `taxonomy, field ("term_id"|"slug"|"name"), terms, operator?, include_children?`. `MetaQueryItem`: `key, value, compare?, type?`.
- `WpTermsArgs`: `taxonomy, orderby, order`. `WpUsersArgs`: `role, include, exclude, search, search_columns, orderby, order, number, offset, paged`.
- Errors: `LOOP_NOT_FOUND`, `INVALID_ARGUMENT`; namespace may throw `NOT_AVAILABLE` when not backed.

Source: https://docs.etchwp.com/public-api/loops ; https://docs.etchwp.com/public-api

## Third-party: Agentic Toolkit for Etch (not vendor docs)
- Its `create_etch_loop_definition` tool takes a **flat** shape `{ key, name, type, args }`, not the Public API's `{ key, name, global, config: { type, args } }`. Don't mix them.
- Its worked example defines key `posts-by-title` but the markup loops `latestPosts`, and sets `ignore_sticky_posts: -1`. Treat that example as illustrative, not correct.

Source: https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch/blob/main/agent-docs/etch-build-examples.md
