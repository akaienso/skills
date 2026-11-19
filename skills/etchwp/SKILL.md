---
name: etchwp
description: Use when building or maintaining a WordPress site that runs the Etch plugin (EtchWP) — templates and the template hierarchy, Loop Manager queries (WP Query, terms, users, JSON), nested loops, the main query, custom fields (Etch fields, ACF, Meta Box), options pages, facets, Gutenberg passthrough, the Etch theme, Etch AI, or `etch.loops` / `etch.fields` scripts.
---

# EtchWP (Etch for WordPress)

EtchWP is a WordPress plugin used with the Etch theme. Etch authors pages and
templates as WordPress blocks, and its templates are saved into WordPress's Full
Site Editing template system. Pair with `etch-authoring` (shared build rules) and
`automaticcss` when ACSS is on.

On WordPress, `etch.skills.list()` currently returns only `acss`: there is no live
`etchwp` skill inside the builder, so the ACSS reference is the only live authority
and the rest of this skill stands on its own.

## How EtchWP models a site

| Need | EtchWP way |
|---|---|
| Layout shell | Template `index` (mandatory catch-all); recommended `single`, `archive`, `author`, `404`; also page and search templates. Call `listTemplatesAsync()` before assuming any of them: real sites often have only `index` plus `404` and a `home` template, with no `single` |
| A page's own content inside a template | Post content slot / `etch/render` |
| Repeat content on a page | Loop element + a Loop Manager query (a custom query is required on pages) |
| Repeat on an archive template | The **main query** (no custom query); the docs say it is meant for archive templates and may be empty elsewhere |
| Query format | PHP-style `$query_args = [...]` with `$variable` tokens and `?? default` |
| Loop types | WP Query, WP Terms, WP Users, JSON |
| Loop with parameters | `{#loop posts($count: 3) as post}`; nested loops pass parent values as arguments |
| Etch's own fields | `this.etch.field_id` / `item.etch.field_id`; script via `etch.fields` (persists immediately) |
| ACF / Meta Box / raw meta | `this.acf.field`, `this.meta.field`; options via `options.*` (paths differ per integration) |
| Global data | `site.*`, `user.*` (e.g. `user.loggedIn`) |
| Filtering / search UI | Etch facets, or the FacetWP / WP Grid Builder integrations (most Etch facet pages still say "Coming soon") |
| Feature detection in scripts | `etch.environment.capabilities` (since 1.6.7) |
| Custom fonts | See the custom-fonts how-to in `references/install-theme-gutenberg.md` |

Saving in the builder writes to the WordPress database, so on a live site a save
is a live change.

## References

- `references/install-theme-gutenberg.md` — requirements, Etch theme, Gutenberg authoring/passthrough, feature flags, known issues, troubleshooting, v1 migration, fonts
- `references/templates.md` — template types, hierarchy, post content slot, template manager
- `references/loops-and-queries.md` — Loop Manager, query args, arguments, nested loops, main query, attachments, `etch.loops`
- `references/custom-fields-and-dynamic-data.md` — Etch fields, ACF/Meta Box field types, repeaters, relationships, options pages, post/term/user/option keys, hooks
- `references/facets.md` — Etch facets, FacetWP, WP Grid Builder
- `references/etch-ai.md` — Etch Intelligence (ask/build modes)

## Common mistakes

| Mistake | Instead |
|---|---|
| A custom Loop Manager query on an archive template | Use the main query there |
| `this.field_key` for an Etch field | `this.etch.field_key` |
| Assuming Studio concepts (`data('x')`, routes, `etch.content`) | WP templates, Loop Manager, fields |
