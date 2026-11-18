# EtchWP: facets (native and third-party)

## Native Etch facets: docs are stubs
Every native facet page in the corpus says only "Coming soon..." (as of 2026-11-17):

| Page | URL | Status |
|---|---|---|
| Apply | https://docs.etchwp.com/facets/apply | stub |
| Filter | https://docs.etchwp.com/facets/filter | stub |
| Load | https://docs.etchwp.com/facets/load | stub |
| Map | https://docs.etchwp.com/facets/map | stub |
| Pagination | https://docs.etchwp.com/facets/pagination | stub |
| Reset | https://docs.etchwp.com/facets/reset | stub |
| Sort | https://docs.etchwp.com/facets/sort | stub |
| Search | (no `facets/search` page in the downloaded corpus) | missing |

- Agent rule: there is **no documented native Etch facet API, element, attribute or block**. Don't invent one. For filtering/pagination on an Etch site today, use FacetWP or WP Grid Builder (below), or whatever facet layer the site already runs (check before choosing; e.g. a component library). Anything about native facet markup is unverified.
- Third-party facet blocks dropped into content render through **passthrough** (Etch shows a placeholder; the block works on the front end).

Source: the URLs above ; https://docs.etchwp.com/gutenberg/passthrough

## FacetWP
Pattern: FacetWP's "custom WP_Query" mode. One FacetWP-enabled query per page.

1. FacetWP → Facets → Add New; configure and save.
2. Add `'facetwp' => 'true'` to the Etch loop's query args (Loop Manager).
3. Put class **`facetwp-template`** on the **direct parent** of the loop element.
4. Place facet shortcodes **outside** that wrapper.

```php
$query_args = [
  'post_type' => 'post',
  'posts_per_page' => $posts_per_page ?? 6,   // keep finite: pagination derives from it
  'post_status' => 'publish',
  'orderby' => 'date',
  'order' => 'DESC',
  'facetwp' => 'true',
];
```

```html
<section data-etch-element="section">
  <div data-etch-element="container">
    [facetwp facet="categories"]
    <div class="posts-grid facetwp-template">
      {#loop blogPosts as item}
        <article>
          <h2><a href="{item.permalink.relative}">{item.title}</a></h2>
          <p>{item.excerpt}</p>
        </article>
      {/loop}
    </div>
    [facetwp facet="pagination"]   <!-- Pager facet type -->
  </div>
</section>
```

- FacetWP updates the loop by AJAX.
- Facets inside the `facetwp-template` container break: disappearing facets and console error "Facets should not be inside the 'facetwp-template' container".
- Multiple independent filtered listings on one page: not supported by this pattern. Use FacetWP Listing Templates, or WP Grid Builder.
- Troubleshooting: no effect → missing `facetwp => 'true'`; no pagination → infinite `posts_per_page` or no Pager facet; loop not updating → class on wrong element or shortcodes inside it; shortcode issues → re-copy from FacetWP and match names.
- Reference: https://facetwp.com/help-center/listing-templates/custom-wp-query/

Source: https://docs.etchwp.com/facets/third-party-facets/facetwp

## WP Grid Builder (WPGB)
Pattern: one selector string, identical in **three places**. Supports multiple independent loops per page.

Selector rule: must start with `wpgb-content-` (e.g. `wpgb-content-posts`), unique per loop, used in:
1. query arg `'wp_grid_builder' => 'wpgb-content-posts'`
2. CSS class on the **direct parent** of the loop element (not the loop itself)
3. facet shortcode `grid="wpgb-content-posts"`

```php
$query_args = [
  'post_type' => 'post',
  'posts_per_page' => $posts_per_page ?? 12,
  'post_status' => 'publish',
  'orderby' => 'date',
  'order' => 'DESC',
  'wp_grid_builder' => 'wpgb-content-posts',
];
```

```html
<section data-etch-element="section">
  [wpgb_facet id="3" grid="wpgb-content-posts"]          <!-- e.g. search/filter -->
  <div class="posts-grid wpgb-content-posts">
    {#loop blogPosts as item}
      <article><h2><a href="{item.permalink.relative}">{item.title}</a></h2></article>
    {/loop}
  </div>
  [wpgb_facet id="7" grid="wpgb-content-posts"]          <!-- pagination -->
</section>
```

- Create facets: WP Grid Builder → All Facets → Add New. Shortcode: All Facets → item menu → Shortcode, then add the `grid` attribute.
- Pagination = facet action **Load Content**, load type **Pagination** (optional Scroll to Top; set a Facet Slug for URL state).
- Same pattern for search, filter, sort, reset facets; several facets can target one selector.
- Troubleshooting: no effect → `wp_grid_builder` value ≠ parent class; wrong grid updates → selectors not unique; no pagination → infinite `posts_per_page` or facet not Load Content → Pagination; shortcode → `grid` mismatch.
- Reference: https://docs.wpgridbuilder.com/resources/guide-filter-custom-queries/

Source: https://docs.etchwp.com/facets/third-party-facets/wp-grid-builder

## Choosing (agent heuristics, derived from the two pages above)
- One filtered listing, site already licensed for FacetWP → FacetWP.
- Several independently filtered listings on one page → WP Grid Builder (or FacetWP Listing Templates).
- Archive templates: both vendor pages show WP Query loops (`blogPosts`). Combining `facetwp`/`wp_grid_builder` args with the `mainQuery` preset is not documented: unverified.
- Facet shortcodes placed in Etch HTML: the docs show them inline in loop markup; confirm they render on the front end after save.

Source: https://docs.etchwp.com/facets/third-party-facets/facetwp ; https://docs.etchwp.com/facets/third-party-facets/wp-grid-builder ; https://docs.etchwp.com/loops/main-query
