# EtchWP: install, Etch theme, Gutenberg, flags, troubleshooting

Scope: what is specific to the WordPress plugin. Element/component/dynamic-data syntax lives in the shared Etch authoring references.

## Requirements
- WordPress 5.9+, PHP 8.1+, WP memory limit 64 MB (128 MB recommended).
- Builder UI uses modern CSS (color-mix, relative color syntax, OKLCH): keep the browser current.
- Prefer Chromium or WebKit. Firefox may have bugs (little debug time spent on it).
- Safari has known OKLCH / relative-color rendering bugs: expect off-brand interface color shifts in the builder UI (not the built site).

Source: https://docs.etchwp.com/getting-started/requirements

## Installation and licence
1. Upload and activate the **Etch plugin**.
2. Upload and activate the **Etch theme**.
3. Claim the free Etch Theme licence: log in at `etchwp.com/account/customer-dashboard/` → "Reclaim Etch Theme Now" → licence key is in the SureCart dashboard → download the theme there. The theme licence key enables auto-updates.
4. Open any page/post → "Edit with Etch" → build → save/publish.

Source: https://docs.etchwp.com/getting-started/installation

## The Etch theme
- Etch **requires** its companion block theme: a minimal, blank block theme that supplies the hooks/structure for Auto Block Authoring and Gutenberg compatibility, nothing more.
- **Do not switch themes** during development or after launch. Vendor-listed risks: lost layouts/content, broken functionality, incompatibilities, data corruption.
- Vendor stance: install the Etch theme and "never think about themes again"; don't consider other block themes.

Source: https://docs.etchwp.com/getting-started/etch-theme

## Release cadence (why versions move fast)
- Weekly releases (sometimes more); bug fixes ship as soon as ready; features often land in partial releases.
- Practical impact: pin nothing to "latest behaviour" from memory; check the changelog and feature flags after updates.

Source: https://docs.etchwp.com/getting-started/development-strategy

## Core principles that affect WP work
- Default styles have **0,0,0 specificity** (easy to override).
- Etch never generates elements you can't select/edit (no hidden wrappers).

Source: https://docs.etchwp.com/getting-started/core-principles

## Gutenberg: Auto Block Authoring
- Everything built in Etch is authored to **custom Gutenberg blocks** (not core blocks). Content is stored in WordPress, not Etch.
- **Bi-directional sync** runs automatically: block-editor edits sync back to Etch and the front end on save; Etch saves flow into the block editor. No manual sync step.
- Block-editor view mirrors Etch structure-panel names/labels.
- Patterns → WP pattern library; components → WP synced pattern library; templates → WP templates area (FSE).
- Rule: **Etch is the development environment; the block editor is only for client content editing.** Don't build in Gutenberg.
- Future (not shipped): per-client edit locking of patterns/components; "Phase 2" distribution of blocks/libraries to non-Etch users.
- Block type names (from the Public API types): `etch/element`, `etch/text`, `etch/dynamic-element`, `etch/dynamic-image`, `etch/svg`, `etch/loop`, `etch/condition`, `etch/component`, `etch/slot-content`, `etch/slot-placeholder`, `etch/post-content`, `etch/raw-html`, `etch/passthrough`.

Source: https://docs.etchwp.com/gutenberg/block-authoring ; https://docs.etchwp.com/public-api/types-reference

## Passthrough blocks
- Any block that is **not** a core Gutenberg block (forms, checkout, facets…) is passed through to the front end unparsed; in Etch you see a placeholder element.
- Public API representation: `etch/passthrough` with `gutenbergBlock` holding the wrapped block. Check `etch.environment?.blockTypes.includes("etch/passthrough")` before authoring one programmatically.
- Future: plugin authors will map their blocks to native Etch elements.

Source: https://docs.etchwp.com/gutenberg/passthrough ; https://docs.etchwp.com/public-api

## Feature flags
- File: `/wp-content/uploads/etch/flags.user.json`. Must be **valid JSON**; an empty file errors (use `{}` for "all defaults").
- Values are `"on"` / `"off"`. Unlisted flags use defaults. Your overrides persist across updates, so remove them to pick up new defaults.

```json
{ "RETURN_ACF_DYNAMIC_DATA": "on", "ENABLE_DEBUG_LOG": "off" }
```

| Flag | Purpose | Default |
|---|---|---|
| `ENABLE_DEBUG_LOG` | Debug logging | off |
| `ENABLE_SERVER_TIMING` | Server-Timing headers | off |
| `RETURN_ACF_DYNAMIC_DATA` | Return ACF data per the field's configured return format (e.g. Post ID instead of Post Object) | off |
| `ENABLE_CLEAR_BUFFER_IN_STREAM_REQUEST` | Force-clear PHP output buffers on AI streaming requests (fix for empty AI replies on some hosts) | off |
| `ENABLE_METABOX_LEGACY_MOE` | Legacy Meta Box data format; off = standard Meta Box format | **on** |

Source: https://docs.etchwp.com/feature-flags

## Known issues
- **Content Hub / CPTs / Custom Fields (Etch-native)**: functional proof of concept; treat as proof-of-concept only unless needs are very basic. (Content Manager page repeats: not recommended for production.)
- **Partial selectors**: the HTML editor debounces class typing; slow typing creates partial selectors in the Style Manager. Add classes via the attribute bar instead.
- Mini GUI / CSS Quick Actions bar is V1 (WIP).

Source: https://docs.etchwp.com/known-issues ; https://docs.etchwp.com/interface/content-manager

## Troubleshooting: activity log
- File: `wp-content/uploads/etch/activity.log` (rotates to `.log.1`, `.log.2`). One event per request; errors always logged, successes sampled. No passwords/PII/tokens. Safe to delete.
- Apache/LiteSpeed: Etch writes an `.htaccess` that blocks HTTP access automatically.
- **Nginx: manual rule required** (check the site's web server before assuming Apache):

```nginx
location ~* /wp-content/uploads/etch/.*\.log$ { deny all; }
```

- IIS: add a `<location path="wp-content/uploads/etch">` `requestFiltering` rule denying `.log` in `web.config`.
- For support: download `activity.log` plus rotated files via SFTP/file manager.

Source: https://docs.etchwp.com/troubleshooting/activity-log

## Troubleshooting: performance
Symptoms: 5xx while building, host rate limits (Kinsta, WP Engine, Cloudways named), slow wp-admin for others, DB connection errors.
- Since 1.4.20: cap builder API concurrency in `wp-config.php` (unlimited by default; start at 5):

```php
define( 'ETCH_API_CONCURRENCY_LIMIT', 5 );
```

- Or raise workers: Apache `MaxRequestWorkers`; PHP-FPM `pm.max_children`; xCloud "PM Max Children". Raise gradually and watch RAM.

Source: https://docs.etchwp.com/troubleshooting/performance-issues

## Migrating to 1.0.0 (pre-1.0 sites only)
- Back up first. Step through releases in order; skipping can lose data.
- Pre-alpha/alpha → **`1.0.0-alpha-15`** (mandatory; a modal runs the migration, including the move to custom Gutenberg blocks).
- Then → latest beta **`1.0.0-beta-15`**, then beta/RC → **`1.0.0`**.
- Expect breakage from early versions: custom-block data migration, dynamic-data handling changes, internal API/block-definition changes.

Source: https://docs.etchwp.com/migration-guides/v1-migration

## Custom fonts (since 1.0.0-rc-5)
- Local files preferred over CDN (performance, GDPR). ACSS users follow ACSS font instructions instead (see the ACSS reference).
- WordPress blocks font uploads by default: enable the **custom font upload toggle in Etch Settings**, save, refresh the builder, then drag files into the media library and copy their URLs.
- Add `@font-face` in a global stylesheet (Style Manager; docs suggest a "Typography" stylesheet) or deploy the `?font-face` recipe. One block per family/weight; variable fonts declare once with a range:

```css
@font-face {
  font-family: "Inter";
  src: url("/wp-content/uploads/2026/11/inter-var.woff2") format("woff2");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
:root { --heading-font-family: "Inter"; --text-font-family: "Inter"; }
```

- CDN alternative: put the provider's `@import url(...)` at the top of the stylesheet.

Source: https://docs.etchwp.com/how-to/basics/how-to-install-custom-fonts
