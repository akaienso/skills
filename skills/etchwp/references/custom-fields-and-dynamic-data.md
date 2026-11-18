# EtchWP: custom fields, WP dynamic data, hooks, controls

Modifier/condition syntax is in the shared authoring reference. This file covers where WordPress data comes from and how to extend it.

## Roots and field namespaces
- Roots: `this.*` (current post/template context), `item.*` (loop alias; you choose the name), `term.*` / `taxonomy.*` (taxonomy context), `user.*` (current user), `site.*`, `options.*`, `url.*`, `environment.*`.
- Field namespaces hang off a post root:

| Source | Template | Loop |
|---|---|---|
| Etch native fields | `{this.etch.field_id}` | `{item.etch.field_id}` |
| Any registered WP meta | `{this.meta.field_id}` | `{item.meta.field_id}` |
| ACF | `{this.acf.field_id}` | `{item.acf.field_id}` |
| Meta Box | `{this.metabox.field_id}` | `{item.metabox.field_id}` |
| JetEngine | `{this.jetengine.field_id}` | `{item.jetengine.field_id}` |

- Discover the real shape: output `{this}` temporarily, or read the Loop Manager preview JSON.
- Etch-native CPTs/fields (Content Manager) are a **proof of concept, not for production** per the vendor.

Source: https://docs.etchwp.com/integrations ; https://docs.etchwp.com/integrations/custom-fields ; https://docs.etchwp.com/dynamic-data/dynamic-data-keys ; https://docs.etchwp.com/interface/content-manager ; https://docs.etchwp.com/known-issues

## Post keys (on `this` / `item`)
`id, title, slug, content, excerpt, permalink.relative, permalink.full, image, image.url, image.alt, date, modified, status, type, thumbnail, author, author.id, author.displayName, template{slug,id,title}, readingTime` (200 wpm), plus raw `WP_Post` columns: `post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_password, post_name, to_ping, pinged, post_modified, post_modified_gmt, guid, menu_order, post_type, post_mime_type, post_parent, comment_count`.
- Examples elsewhere in the docs also use `featuredImage.url/.alt` and `categories` (e.g. `this.categories.at(0).id`); `featuredImage` is not in the keys table. Verify per site.

Source: https://docs.etchwp.com/dynamic-data/dynamic-data-keys ; https://docs.etchwp.com/loops/basic-loops ; https://docs.etchwp.com/loops/loop-arguments

## User, site, URL, environment keys
- `user.`: `id, login, email, displayName, firstName, lastName, nickname, fullName, description, userUrl, avatar, registered, userRoles, userRole, capabilities, loggedIn`.
- `site.`: `name, description, home_url, url, admin_url, version, language, isMultisite, currentDate` (unix timestamp).
- `url.`: `full, relative, parameter.<Name>` (case-sensitive; sanitized with `sanitize_text_field()`).
- `environment.current`: `"etch" | "gutenberg" | "frontend"`; `environment.context` = `"componentEditor"` inside the component editor, otherwise unset.

```html
{#if user.loggedIn}<a href="{site.admin_url}">Dashboard</a>{/if}
{#if environment.current === "etch" || environment.current === "gutenberg"}<div class="dev-note">Editor only</div>{/if}
```

Source: https://docs.etchwp.com/dynamic-data/dynamic-data-keys

## ACF specifics
- Since alpha-3, fields with a configurable return format (Post, Taxonomy, User, Relationship, Link) return a **full object** by default.
- Flag `RETURN_ACF_DYNAMIC_DATA` = `"on"` (in `wp-content/uploads/etch/flags.user.json`) honours ACF's configured return format (e.g. Post ID).
- Meta Box: flag `ENABLE_METABOX_LEGACY_MOE` defaults **on** (legacy format); turn off for the standard Meta Box format.

Source: https://docs.etchwp.com/integrations/custom-fields ; https://docs.etchwp.com/feature-flags

## Field types
**Text / textarea / WYSIWYG**: `{this.acf.headline}`; WYSIWYG HTML is rendered. Fallback: `{#if this.acf.headline}{this.acf.headline}{#else}Default{/if}`.

**Image** (ACF, Meta Box, JetEngine all return the same object): `id, url, alt, title, caption, description, filename, sizes.{thumbnail,medium,large,full}.{url,width,height}, srcset, width, height, filesize, mime_type`.
```html
<img src="{this.acf.photo.url}" alt="{this.acf.photo.alt}" width="{this.acf.photo.width}" height="{this.acf.photo.height}" />
```

**Gallery** = array of image objects (Meta Box: Image Advanced or cloneable image fields). Extra props listed: `date, modified`. Single image without a loop: `{this.acf.gallery.at(0).url}`.
```html
<ul class="gallery">{#loop this.acf.gallery as image}<li><img src="{image.url}" alt="{image.alt}" loading="lazy" /></li>{/loop}</ul>
```

**Repeater** (ACF repeater; Meta Box = any cloneable field; JetEngine repeater). Loop the element that repeats (`<li>`). Nesting repeaters is supported.
```html
<ul class="faq-list">{#loop this.acf.faq as faq}<li class="faq"><h3>{faq.question}</h3><div>{faq.answer}</div></li>{/loop}</ul>
```

**Relationship**
- ACF: stored in post meta. Set the field to return **Post Object** (Post ID returns only `[38]`). Items expose post keys (`id, title, permalink.relative, ...`). For deeper meta on related posts, run a nested query on the ID.
```html
{#loop authors as author}{#loop author.acf.author_books as book}<a href="{book.permalink.relative}">{book.title}</a>{/loop}{/loop}
```
- Meta Box (MB Relationships): separate table, so **not** on `this`. Create two reusable utility loops and query them:
```php
// mbFrom (use 'to' => $to_id for the reverse loop mbTo)
$query_args = [ 'post_type' => $related_cpt, 'posts_per_page' => 10, 'post_status' => 'publish',
  'relationship' => [ 'id' => $rel_field, 'from' => $from_id ] ];
```
```html
{#loop mbFrom($related_cpt: 'my_cpt', $rel_field: 'relationship_field', $from_id: this.id) as related}...{/loop}
<!-- inside another loop pass post.id, not this.id -->
```

**ACF Flexible Content**: each row has `acf_fc_layout`; branch with `#if`.
```html
{#loop this.acf.page_sections as section}
  {#if section.acf_fc_layout == 'hero_banner'}<h1>{section.title}</h1>{/if}
  {#if section.acf_fc_layout == 'text_block'}<h2>{section.heading}</h2>{/if}
{/loop}
```
Note: the vendor's own example uses `<img src="{image.sizes.medium}">`, but per the image structure above `sizes.medium` is an object; use `{image.sizes.medium.url}`.

Source: https://docs.etchwp.com/integrations/custom-fields/text-fields ; .../image-fields ; .../gallery-fields ; .../repeater-fields ; .../relationship-fields ; .../flexible-content-fields (all under https://docs.etchwp.com/integrations/custom-fields/)

## Options pages (global, no post context)
| Provider | Syntax |
|---|---|
| ACF | `{options.acf.field_name}` |
| Meta Box | `{options.metabox.option_page_slug.field_name}` |
| JetEngine | `{options.jetengine.option_page_slug.field_name}` |

- Groups: dot notation (`options.acf.address.city`). Repeaters: `{#loop options.acf.hours as hour}`.
- Empty output checklist: field is on an Options Page (not a post), exact name/key, saved value exists, page slug included for Meta Box/JetEngine.

Source: https://docs.etchwp.com/integrations/custom-fields/options-pages

## PHP filters: extending dynamic data
Always return an array, or Etch ignores the filter and keeps the previous data.

| Filter | Args | Exposes |
|---|---|---|
| `etch/dynamic_data/post` | `$data, $post_id` | `{this.KEY}`, `{item.KEY}` |
| `etch/dynamic_data/term` | `$data, $term_id, $taxonomy` | `{term.KEY}`, `{item.KEY}` in term loops |
| `etch/dynamic_data/user` | `$data, $user_id` | `{user.KEY}` |
| `etch/dynamic_data/option` | `$data` | `{options.KEY}` |

```php
add_filter( 'etch/dynamic_data/post', function ( $data, $post_id ) {
    $data['custom'] = [ 'member_count' => (int) get_post_meta( $post_id, 'member_count', true ) ];
    return $data;
}, 10, 2 ); // {this.custom.member_count}
```
- Pass `10, 2` (post/user) or `10, 3` (term) as on the Hooks page. The per-key integration pages omit them; WordPress then passes one argument and a closure requiring two throws `ArgumentCountError` under PHP 8 (standard WP/PHP behaviour, not stated by Etch).

Source: https://docs.etchwp.com/integrations/hooks ; https://docs.etchwp.com/dynamic-data/dynamic-data-integration/post-dynamic-data-integration ; .../term-dynamic-data-integration ; .../user-dynamic-data-integration ; .../option-dynamic-data-integration

## PHP action: canvas assets
```php
add_action( 'etch/canvas/enqueue_assets', function () {
    wp_enqueue_style( 'site-canvas', content_url( '/uploads/site-canvas.css' ) ); // example URL
} );
```
Loads extra CSS/JS **inside the builder canvas** only. These five hooks are the complete documented list; any other `etch/*` hook is unverified.

Source: https://docs.etchwp.com/integrations/hooks

## JS: builder controls (`window.etchControls`)
- `window.etchControls.builder.settingsBar.{top|center|bottom}` with `addBefore(control)`, `addAfter(control)`, `remove(id)`.
- Control: `{ icon (Iconify id, required), tooltip (required), callback (required), id? }`.
```js
window.addEventListener('load', () => {
  window.etchControls.builder.settingsBar.bottom.addAfter({
    id: 'site-docs', icon: 'ph:book-open', tooltip: 'Site docs', callback: () => window.open('/wp-admin/')
  });
});
```

Source: https://docs.etchwp.com/integrations/controls

## Public API: `etch.fields` (every method `*Async`, persists immediately; no `saveAsync()`)
```ts
listGroupsAsync(); getGroupAsync(id); createGroupAsync(def): Promise<string>; updateGroupAsync(id, def); deleteGroupAsync(id);
addFieldAsync(groupId, field); updateFieldAsync(groupId, fieldKey, field); removeFieldAsync(groupId, fieldKey);
getValuesAsync(postId); getValueAsync(postId, key); setValueAsync(postId, key, value); setValuesAsync(postId, values); deleteValueAsync(postId, key);
// CustomFieldGroup { label, description?, fields: CustomField[], assigned_to }
// assigned_to: { post_types: string[] | post_ids: number[] | taxonomies: string[], op: "isIn" | "isNotIn" }
// CustomField { label, key, type: "text"|"textarea"|"number"|"boolean"|(string), description?, required? }
```
```ts
if (etch.environment?.capabilities.fields === true) {
  const id = await etch.fields.createGroupAsync({ label: "Event details",
    assigned_to: { post_types: ["event"], op: "isIn" },
    fields: [{ label: "Location", key: "location", type: "text" }] });
  await etch.fields.setValueAsync(42, "location", "Berlin"); // render: {this.etch.location}
}
```
- `etch.fields` manages **Etch-native** fields only; it is not documented as reading/writing ACF, Meta Box or JetEngine.

Source: https://docs.etchwp.com/public-api/fields ; https://docs.etchwp.com/public-api
