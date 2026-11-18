# Etch Studio: routes, templates, SEO, redirects, 404s

Read the project's built-in `etch-studio` guide (Routes and templates, SEO) first. This file adds the web-doc detail.

## Core rule

**Only content a route serves is published.** A page or record that no route serves is not in the build and not in `sitemap.xml`. Routes, and any new records they pick up, take effect **on the next deploy**. The Content Hub shows each item's **Served under** value: an exact path for static routes, the route *pattern* for dynamic ones, or "Nowhere yet".

Source: https://docs.etchwp.com/studio/routing

## Route kinds (the segment text alone decides the kind)

| Segment | Kind | Serves | Notes |
|---|---|---|---|
| `''` / `/` row | root | one page (the homepage) | Exactly one. Can't be created, deleted or redirected. |
| `about` | static | **at most one** page | Lowercase letters and digits joined by `-`/`_`. With no content it answers 404 and only holds its children (e.g. `/brands/` 404 while `/brands/vantara/` exists). |
| `(marketing)` | group | nothing | Adds no URL part (`/(marketing)/pricing` → `/pricing/`). Used to share a template. Has no 404 setting and can't be redirected. |
| `{this.title.toSlug()}` | dynamic | one page per record | Sources can mix `postIds`, `postTypes` (whole types) and `dataSources`. Full dynamic-data syntax, mixed with text: `{this.fields.year}-{this.title.toSlug()}`. |

- **Always `.toSlug()`.** A bare `this.title` gives capitals and spaces. URLs that differ only in case **fail the deploy**.
- A segment can't use `this.slug` or `this.isHomepage`, because the routes decide those.
- A record whose segment resolves to empty is skipped (not published). A segment that resolves to something containing `/` stops the deploy.
- **Nested dynamic routes:** every expression in a path resolves against **the record served by the deepest route**. Parent routes don't pass records down, so a dynamic route with no content of its own produces no pages.

Source: https://docs.etchwp.com/studio/routing, https://docs.etchwp.com/studio/public-api/routes

## Pages from a data source (dynamic routes only)

- An array source gives one page per element. Anything else gives one page. Nothing (e.g. an API source with no URL) gives no page.
- The element is `this` in the segment and in the template: `{this.sku}` under `shop` → `/shop/abc-123/`, and the template reads `{this.name}`.
- **A template is required** (own or inherited). Without one the Routes Manager shows an error, the paths are `invalid`, and the deploy stops.
- **A failing source fails the deploy** rather than unpublishing pages.
- The Routes Manager re-runs the source on every route edit (an API source sends one request per edit).
- A value has no title. Set a route SEO title or a template `<title>`. Errors name such pages like *Products #3*. Sitemap entries for them have no lastmod.
- In `updateAsync`, a `source` without `dataSources` **keeps** the existing ones. Pass `dataSources: []` to clear them.

Source: https://docs.etchwp.com/studio/routing#pages-from-a-data-source, https://docs.etchwp.com/studio/public-api/routes

## Templates

- A template is an item of a **template content type** (Content Hub → Templates, or `content.createTypeAsync({ name, isTemplate: true })`). A template type has no fields, and `isTemplate` can't be changed later.
- When a route renders through a template, `this` is the record being served. The editor lets you pick a preview record.
- **Inherited:** a route without a template uses the nearest ancestor's (shown dimmed, "Inherited"). In the UI, "Inherit from parent" clears it. In the API, `templateId: null` does.
- **Templates don't stack.** Only the nearest one applies. Share the header and footer through components.
- Templates are never published themselves and can't be assigned as a route's content.
- With no template, a record renders its own blocks.
- Render the record's own blocks with the Render element: `{@render this.content}` (API block: `{ type:'etch/render', version:1, context:{}, children:[], target:'this.content' }`). It takes no children, its output can't be selected or styled, and it stops at self-reference or after 16 levels of nesting. It takes Etch JSON, not HTML (use the HTML element for HTML strings).

### Recommended conventions (from the Gearyco agentic toolkit)

- Name the primary site template **`index`**. It holds the shared header and footer and renders the current record.
- Wrap the render block in `<main>` between the header and footer. Never leave `@render` as a bare sibling of them.
- Reuse `index` for standard routes. Don't create equivalents named `Default Page` or `Main`.
- The toolkit helper `buildIndexTemplate(headerKey, footerKey)` builds `[Site Header instance, <main>{@render this.content}</main>, Site Footer instance]` and assigns it to the root route.

> Note: the toolkit's AGENTS.md says "no `<main>` or other wrapper around sections" for **pages**. The `<main>` belongs in the `index` **template**, so the two rules don't conflict.

Source: https://docs.etchwp.com/studio/routing#templates, https://docs.etchwp.com/studio/elements/render, https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch/blob/main/agent-docs/etch-studio.md, https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch/blob/main/shared-helpers/etch/upsert.js

## Overlaps, conflicts and path statuses

- The more specific route wins: static text beats an expression, and a longer fixed part beats a shorter one (`team/careers` beats a member called "Careers").
- Two records that resolve to the same URL **fail the deploy**, with an error naming both. Disambiguate the segment, e.g. `{this.title.toSlug()}-{this.fields.role.toSlug()}`.
- `etch.routes.getPathsAsync()` returns `{ routeId, postId?, title?, path, status, reason? }`, where `status` is one of:
  - `published`
  - `shadowed`: a more specific route takes the URL
  - `conflict`: two records want the same URL
  - `invalid`: the segment can't resolve; `reason` explains

  Only `published` paths ship. **Check it after every route change.**
- Published URLs always have a trailing slash. `/team/john` redirects to `/team/john/`. `sitemap.xml` lists every published, indexable URL.

Source: https://docs.etchwp.com/studio/routing, https://docs.etchwp.com/studio/public-api/routes

## `this.slug` / `this.isHomepage`

These are read from the **static** routes that serve a record. They are never typed in.

| Published at | `slug` | `isHomepage` |
|---|---|---|
| `/` | `''` | true |
| `/about/` | `about` | false |
| `/docs/intro/` | `docs/intro` | false |
| nowhere | absent | false |

A record served **only** by a dynamic route has no slug (known limitation). Build links from the route's segment expression: `/team/{member.title.toSlug()}/`. To move a page, rename its route.

Source: https://docs.etchwp.com/studio/routing#thisslug-and-thisishomepage

## SEO (route panel → SEO tab; the root row = site-wide "Root settings")

| Field | Output | Inherited? | Expressions? |
|---|---|---|---|
| Title | `<title>` + `og:title` | yes | yes |
| Meta description | `meta description` + `og:description` | yes | yes |
| Canonical URL | canonical | **no** (default "Automatic" = its own address) | yes |
| Search visibility | `robots noindex` + removal from the sitemap | Inherit / Index / Noindex (the root offers only Index/Noindex) | n/a |
| Language | `<html lang>` | yes | n/a |
| Social image | `og:image`, from an asset, a URL or an expression (changelog 2026-10-29) | yes | yes |
| Favicon | icon | root only | n/a |

- Expressions resolve per record (`{this.title} | Acme`). New routes under the root start with a title that puts the page's own title before the site's (changelog 2026-10-28).
- Noindex is not access control: `robots.txt` still allows fetching.
- **A tag written by hand in an `etch:head` (page, template or component) wins.** That tag stays and the route value is not added, and `og:title` follows whichever title won.
- A per-section favicon is possible only through `<link rel="icon">` in `etch:head`.
- Changes are stored immediately and go live on the next deploy.
- API: `etch.routes.updateAsync(id, { title, description, language, canonical, socialImage, faviconId, searchVisibility: 'inherit'|'hidden'|'visible', redirect, notFoundId })`. `null` clears a value back to inheriting. `listSeoAsync()` gives a whole-site view, so use it before and after an SEO pass instead of looping `getSeoAsync(path)`. (These come from the built-in guide. The web Routes API page doesn't document them yet.)

> Conflict: the web Head Element page presents `<title>` and meta in `etch:head` as a normal override. The built-in guide says **never** write `<title>` or a meta description in `etch/head`, because it overrides route SEO (except on the 404 page). The built-in guide wins. Set SEO on routes.

Source: https://docs.etchwp.com/studio/routing/seo, https://docs.etchwp.com/studio/elements/head, https://docs.etchwp.com/studio/changelog

## Redirects & error pages (route panel → second tab)

**404 pages**
- Any page can be the 404. It renders through the template of the route that sets it.
- Inheritance walks **the requested URL path**, not the route tree: `/docs/guides/missing` uses `/docs/`'s 404 if `guides` sets none.
- With nothing set at the root, you get the host's default unstyled 404. Groups have no 404 setting.
- API: `notFoundId`.

**Redirects**
- Toggle on, then set a destination **and** a type. The redirect is live only when both are set.
- Temporary (302) is the UI default. Permanent (301) is cached by browsers, so a wrong 301 outlives the fix.
- The page stays published but is shadowed, and leaves the sitemap. Turning the redirect off brings the page back on the next deploy.
- A redirect doesn't apply to child routes: set one per route.
- A dynamic route redirects every one of its records to the same destination.
- Destinations are a literal path or a full URL. **No expressions yet**, so per-record redirects aren't possible.
- The root and groups can't be redirected.
- **The deploy stops** on a route redirected to its own address, or on **more than 2,000 redirects**.
- API: `redirect: { to, status: 301|302 }`, never on the root.
- Redirects now take effect on published sites (fix, changelog 2026-10-22).

Source: https://docs.etchwp.com/studio/routing/redirects-and-errors

## Worked examples (condensed)

**Team pages**
```
/                              serves: Homepage
└── team                       serves: page "Team" (a loop over Employee)
    └── {this.title.toSlug()}  serves: all Employee   template: Single Employee (<h1>Meet {this.title}</h1>)
```
Add an Employee and deploy, and `/team/<name>/` appears with no route edits.

**Cars and brands** (nested dynamic routes spelt through a relationship)
```
/
└── brands                                   no content → /brands/ is 404
    ├── {this.title.toSlug()}                serves: all Car Brand   template: Single Car Brand
    └── {this.fields.brand.title.toSlug()}   no content
        └── {this.title.toSlug()}            serves: all Car         template: Single Car
```
The two dynamic routes under `brands` are **siblings**. The car route spells the brand segment from each car's `brand` relationship, so cars group under the right brand with no filtering.

Source: https://docs.etchwp.com/studio/routing/team-pages, https://docs.etchwp.com/studio/routing/cars-and-brands

## Scripting notes

The create example is in the built-in guide. After any change, list the paths that won't ship: `(await etch.routes.getPathsAsync()).filter(p => p.status !== 'published')`.

> Conflict: the toolkit's `upsert.js` says "`routes.createAsync` ignores most fields, so always follow with `updateAsync`". The web API page and the built-in guide pass `source` and `templateId` to `createAsync`. Either confirm with `listAsync()` after creating, or use the toolkit's `upsertRoute(parentId, match, segment, def)`, which does create-then-update and is safe both ways.

Source: https://docs.etchwp.com/studio/public-api/routes, https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch/blob/main/shared-helpers/etch/upsert.js
