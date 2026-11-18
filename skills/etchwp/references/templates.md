# EtchWP: templates

Templates built in Etch are authored to WordPress **Full Site Editing (FSE)** templates automatically, so they stay synced with core WP and survive outside Etch.

## Model and hierarchy
- Create a template whenever multiple URLs render the same layout and content type.
- WordPress resolves the most specific template first, then generic, then `index`:
  1. Specific (e.g. `single-post.php`-level), 2. generic (`single`, `archive`), 3. `index` (final fallback).
- Mandatory: **`index`** (catch-all). Recommended: `single` (if blog), `archive`, `author` (if blog), `404`.
- The Etch theme supplies the FSE plumbing; templates are not theme files you edit by hand.

Source: https://docs.etchwp.com/templates/intro-to-templates ; https://docs.etchwp.com/templates/index-template-catch-all

## Template Manager
- Column layout of the site's templates. New CPTs/taxonomies add new columns automatically, meaning templates can be created for them.
- Columns referenced in the docs: Posts/Pages (page templates), Miscellaneous (Search Results, 404), plus one per CPT/taxonomy.
- Every template created here is written to FSE.
- Public API: `etch.navigation.goTo("templates")`, `listTemplatesAsync(): Promise<{id,title,slug}[]>`, `openTemplateAsync(templateId)`, `isEditingTemplate()`. Gate on `etch.environment?.capabilities.templates === true`.

Source: https://docs.etchwp.com/templates/template-manager ; https://docs.etchwp.com/public-api/navigation ; https://docs.etchwp.com/public-api

## Index template (catch-all)
- Already exists; just edit it (Template Manager → Index → edit).
- Used when nothing more specific matches: missing single/archive templates, CPTs and taxonomies without templates, search (no search template), 404 (no 404 template).
- Minimum build:
  1. Header saved as a component. 2. Footer saved as a component. 3. A Div between them, tag changed to `main`. 4. A Post Content element inside it. 5. Save.

```html
<!-- header component -->
<main>
  {@post-content}
</main>
<!-- footer component -->
```

- Test: visit the home page; header and footer should render.

Source: https://docs.etchwp.com/templates/index-template-catch-all

## Post Content (`{@post-content}`)
- Pulls the Gutenberg content of the current post into a template. Use it **instead of** `{this.content}` in templates.
- Insert from the Element Bar icon while editing a template. Block type: `etch/post-content` (no extra fields).
- Placement: inside `<main>` on the index template; inside `<article>` on a blog post template. Placement is the developer's call.
- Called a "slot" informally, but it is a specialized dynamic-data tag: **slot logic does not apply** to it.

Source: https://docs.etchwp.com/templates/post-content-slot ; https://docs.etchwp.com/public-api/types-reference

## Single post templates
- Used for individual post URLs. All standard post keys are available via `this.` (e.g. `{this.title}`); full key list in the dynamic-data keys reference.

```html
<article>
  <h1>{this.title}</h1>
  {@post-content}
</article>
```

Source: https://docs.etchwp.com/templates/single-post-templates

## Archive templates
- Used for post type archives (e.g. `/services/`), category/tag archives, date archives, any "collection" view.
- Build them with the **Main Query** loop (`mainQuery`): it inherits WP's current query (category, CPT, date range) and **pagination works automatically**.
- Warning: the built-in `post` type has no native archive in Etch's model. For a blog index, create a page ("Blog"/"Articles") with a standard WP Query post loop.

```html
<main>
  {#loop mainQuery as item}
    <article><h2><a href="{item.permalink.relative}">{item.title}</a></h2></article>
  {/loop}
</main>
```

Source: https://docs.etchwp.com/templates/archive-templates ; https://docs.etchwp.com/loops/main-query

## Search results template
1. Template Manager → "+" next to **Miscellaneous** → **Search Results**; then hover its thumbnail → edit.
2. The generated markup is `<main>{@post-content}</main>`: **replace** it with a `mainQuery` loop. WP already ran the search from the `s` URL parameter.
3. Optional loop args: `mainQuery($count: 10)`.
4. Add a search form. Vendor recommendation: WS Form (has a 1-click search results form template). (Standard WordPress behaviour, not from the Etch docs: any GET form that submits `s` to the home URL triggers search.)

```html
<main>
  <section data-etch-element="section" class="search">
    <div data-etch-element="container" class="search__header">
      <h1 class="search__title">Search results for: {url.parameter.s}</h1>
    </div>
    <div data-etch-element="container" class="search__results">
      {#loop mainQuery as item}
        <article class="search-card">
          <h2 class="search-card__title"><a href={item.permalink.relative}>{item.title}</a></h2>
          <div class="search-card__description">{item.excerpt}</div>
        </article>
      {/loop}
    </div>
  </section>
</main>
```

- `url.parameter.*` is sanitized with `sanitize_text_field()` and is case-sensitive.

Source: https://docs.etchwp.com/templates/search-results-template ; https://docs.etchwp.com/dynamic-data/dynamic-data-keys

## Page templates
- Vendor stance: WP page templates are "dinosaur architecture". Prefer a CPT plus CPT templates, components and patterns.
- Created from the Posts/Pages column. Currently the only option is a template that overrides `index` for **all** page content.

Source: https://docs.etchwp.com/templates/page-templates

## 404 template
- Shown for URLs that match nothing (deleted content, typos, stale inbound links).
- Create it in the Template Manager's **Miscellaneous** area (the docs also call it "Template Hub").

Source: https://docs.etchwp.com/templates/template

## Author template
- **Stub page** ("More to come..."). No vendor guidance yet. Anything about author-template keys (beyond the general `user.*`/`author.*` keys) is unverified.

Source: https://docs.etchwp.com/templates/author-template

## Agent checklist
- New site: edit `index` first (header component, `<main>{@post-content}</main>`, footer component), then add `single`, `archive`/CPT archives, `404`, and Search Results.
- Archive/search: `mainQuery`, never a hand-built WP Query that re-implements the archive conditions.
- Page listings of posts (blog page, homepage "latest 3"): a saved WP Query loop, not `mainQuery`.
- Build templates in Etch, not in the block/site editor (vendor: "The block editor is NOT a development environment"). Whether Site Editor edits to an Etch template sync back is not documented: unverified.

Source: https://docs.etchwp.com/templates/intro-to-templates ; https://docs.etchwp.com/loops/basic-loops ; https://docs.etchwp.com/gutenberg/block-authoring
