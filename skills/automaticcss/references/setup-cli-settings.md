# ACSS 4 — setup, settings, import files and WP-CLI

Studio equivalents are in "Platform differences" at the end.

## Install and licence (WordPress)

- Plugins > Add New > Upload > choose ZIP > Activate. An **Automatic CSS** item then appears in wp-admin.
- In your automaticcss.com account, use the key named **"–Automatic.css"**. Don't use the bundle key or the plan-named key.
- Licence tab buttons: **Save & Activate**, **Delete & Deactivate**, **Check for updates now**. Update check colours: green = OK, yellow = needs attention, red = server unreachable (firewall or Cloudflare).
- A licence covers one address. After a domain move, click **Save & Activate** again; free the old address in the account.
- 4.0.2+: `define( 'ACSS_LICENSE_KEY', '…' );` in `wp-config.php`, above "That's all, stop editing".
  - ACSS activates the key on the next admin page load and re-activates it after a key or domain change. It deactivates the key it replaced.
  - The Licence tab shows only the last 4 characters and no Deactivate button.
  - `wp acss license set` and `wp acss license deactivate` refuse to run.
  - Multisite: the constant applies to every site, and each site uses one activation.
- If activation fails, look in the Activity Log. ACSS won't retry a rejected key until you change it. If the server couldn't be reached, it retries after 10 minutes.

Sources: https://docs.automaticcss.com/setup/how-to-install-acss, https://docs.automaticcss.com/setup/license

## Configuring ACSS for Etch

- Etch needs **zero configuration**: install both plugins and build.
- First site: set Content Width and Minimum Width (Layout > Website Dimensions), and the builder container width to `var(--content-width)`. Leave builder breakpoints alone, check the **Cheat Sheet**, and build with BEM classes, variables and `?` recipes.
- Etch layer order (Studio built-in skill): published pages load Etch class styles **before** ACSS. An ACSS class with the same specificity as yours wins, so raise yours where they meet (`&.section--xs {…}`). Section defaults use `:where()`, so any class overrides them.

Sources: https://docs.automaticcss.com/setup/builder-configuration/etch, https://docs.automaticcss.com/setup/working-in-acss-4

## What's new in 4 and upgrade notes

- v4 is **not backward compatible** with 3.x. Keep 3.x sites on 3.x; 3.x is supported for 5 years.
- **Utility modules removed.** v4 is variable-first and BEM-first. Grid, flex, column, masonry, gap and responsive classes are gone; use variables or recipes instead.
- **Remaining classes** include `.btn--*`, `.section--*`, `.text--{size}`, `.width--*`, `.bg--{ultra-light|light|dark|ultra-dark}`, `.smart-spacing`, `.content-grid`, `.scheme--*`, `.is-bg` and `.hidden-accessible`.
- **Recipes** use `?` (`?btn;`, `?auto-grid;`), expanded in builder CSS or Global SCSS.
- **No breakpoint presets.** Type and spacing are fluid; write your own `@media` or `@container` queries. The only threshold left is the buttons' Full-Width Breakpoint.
- **Other v4 changes:**
  - CSS layers; OKLCH colours.
  - Dark mode via `color-scheme` + `light-dark()`; "Alt" colours removed.
  - Transparency tokens removed (use `color-mix()` or relative colour syntax).
  - Widths are `--width-10…90` / `.width--10…90`.
  - Header height is fluid.
  - Surfaces and overlays separated (5 + 5).
  - New Effects section (selection styling moved there); forms refactored.
- **XXL → 2XL rename** ("for better clarity").
  > Conflict: the topic docs still use `xxl` for space, text, section, header and button sizes; the toolkit's example export uses `2xl` only for icon settings (`icon-size-2xl`, `icon-padding-2xl`). Confirm against the project's generated ACSS token/class list (Studio: `etch.skills.getReference('acss','tokens.md' | 'classes.md')`; WordPress: the generated stylesheet or `wp acss settings`).
- **Prerelease → 4.0.0 upgrade:**
  - 4.0.0 is a separate plugin (`automatic-css`); the prerelease is `automaticcss-plugin`.
  - Back up, save the old key, and get a new v4 key.
  - Activate 4.0.0, activate the v4 key, regenerate CSS, clear caches, verify, then delete the prerelease.
  - Multisite: one site at a time (4.0.1+ refuses network activation while the prerelease is active).
  - Roll back: `wp plugin deactivate automatic-css && wp plugin activate automaticcss-plugin`.
  - A 3.x settings import only converts the file; it doesn't migrate the site.

Sources: https://docs.automaticcss.com/setup/whats-new-in-4, https://docs.automaticcss.com/setup/working-in-acss-4, https://docs.automaticcss.com/setup/upgrading-to-acss-4

## Import, export, reset (dashboard, 4.0.2+)

- Open the dashboard with **Cmd/Ctrl+Shift+O** and use the header menu:
  - **Export settings** downloads `acss-settings-YYYY-MM-DD.json`, unsaved values included.
  - **Import settings** stages the values; click **Save** to keep them (a reload discards). Missing keys are kept, unknown keys skipped, 3.x files converted.
  - **Reset to defaults** needs a 1.5 s hold and is also staged until **Save**.
- Dots: a square dot by the title means unsaved changes (click it to discard). A dot by a setting means it differs from the default (× resets that setting).
- CLI `import` and `reset` **save immediately**.

Source: https://docs.automaticcss.com/setup/import-export-settings

### Rules for generating an import file (toolkit, tested in practice)

- **Never change the neutral palette** (`neutral-*` keys). Copy them unchanged from the source file.
- Enable only the palette colours the design uses. Don't fill secondary, tertiary or accent by duplicating another colour; set `option-{color}-clr` off. Status colours (success, danger, warning, info) stay off unless used.
- Enable only the button styles the design uses: `option-{color}-btn`, `option-{color}-btn-outline`, `option-{color}-btn-shades`.
- Settings that name a colour must name an enabled one. Examples: `bg-{context}-button` (e.g. `bg-light-button`), `card-button-style`, form button styles.
- Body and muted text reference **base**, not neutral.
- "Dark" tokens must render dark and "light" tokens light. **Light-only sites: `auto-color-scheme` off.** Otherwise inverted alternates make `--base-dark` render light and `--white` render black in a dark UI.
- > Conflict: the toolkit also says to turn off `option-{color}-*-trans` (`-main-trans`, `-light-trans`, `-dark-trans`, `-ultra-dark-trans`). Those keys exist in its sample export, but v4 docs say transparency tokens were removed. They're probably inert leftovers. Harmless to set off; unverified whether 4.0.x still reads them.
- Toggle values: export JSON uses `"on"`/`"off"`; Studio `updateSettingsAsync` uses `true`/`false`.
- Setting-id families: `color-{color}`, `{color}-{shade}-{l|c|h}-oklch`, `option-*`, `bg-*`, `text-*`, `heading-*`, `h{n}-*`, `font-{n}-*`. Spacing, colour and type ids are listed in the topic files.

Sources: toolkit `agent-docs/automatic-css.md` and `agent-docs/acss/example-json.md`.

## Global SCSS imports

- Global SCSS compiles with ACSS; mixins and functions need no import. Plain `@import url(...)` passes through.
- Importing your own SCSS partials needs `unfiltered_html`. On multisite (4.0.2+) and when `DISALLOW_UNFILTERED_HTML` is set, non-Super Admins can import ACSS files only. Anything else fails with "CSS generation failed" and the old CSS stays.
- Breakpoint mixins are gone; write `@media`. Other mixins (`@include auto-grid(4)`) still work.

Sources: https://docs.automaticcss.com/setup/global-scss-imports, https://docs.automaticcss.com/setup/working-in-acss-4

## Website width and breakpoints

- **Layout > Website Dimensions:**
  - **Content Width** (setting id `vp-max`, output `var(--content-width)`).
  - **Minimum Width** (setting id `vp-min`).
  - Fluid type, spacing and auto grids interpolate between the two.
- There are no breakpoints to map. Your builder's breakpoints don't have to match anything in ACSS.

Source: https://docs.automaticcss.com/setup/website-width-breakpoints (setting ids from the toolkit's `agent-docs/acss/example-json.md`)

## Activity log

- Location: wp-admin > Automatic CSS > **Activity Log** (admins only). Last 50 events, newest first.
- Columns: Timestamp, Method (`GET`/`POST`/`CLI`), Trigger (`web`/`ajax`/`rest`/`cron`/`cli`), Status (`success`/`failure`), URI, Duration.
- Every error is logged but only some successes, so a short log is normal.
- Diagnose a failure by opening the row: `result.status` and `failure_messages[].message`. Typical case: an SCSS compile error such as an undefined `$var` in Global SCSS.
- 4.0.2+ licence errors: `key: "license"` plus `action`, `source`, `edd_error` (e.g. `no_activations_left`), `http_code`, `cf_ray`, `transport_error`.
- 4.0.2+ **Download log** saves a redacted `acss-activity-log-YYYY-MM-DD.log`. **Clear log** also removes rotated files.
  - Before 4.0.2: `wp-content/uploads/automatic-css/activity.log`.
- "No activity log file found": check that the `ENABLE_ACTIVITY_LOG` flag is on (the default).

Source: https://docs.automaticcss.com/setup/activity-log

## WP-CLI reference (`wp acss`)

Requirements: WP-CLI, ACSS 4.x active, and shell access. Get help with `wp help acss [group] [subcommand]`. Most read commands take `--format=json`. On multisite, add `--url=<site>` to any command.

| Command | Flags / args | Notes |
|---|---|---|
| `wp acss settings get [<key>]` | `--format=json\|yaml\|var_export` | No key returns all as JSON. One key prints the raw value. An unknown key is an error. |
| `wp acss settings set <key> <value>` | `--force` (skip schema validation), `--skip-css` | Validates, saves and regenerates CSS. Errors exit non-zero. |
| `wp acss settings list` | `--search=<pattern>`, `--format=table\|json\|csv\|yaml\|count` | Substring filter on keys. |
| `wp acss settings export` | `--file=<path>` | Without `--file`, writes pretty JSON to stdout. |
| `wp acss settings import <file>` | `--force`, `--skip-css`, `--yes` | **Replaces** all settings with no backup. 4.0.2+ converts 3.x files and prints "Detected an ACSS 3.x settings file…". |
| `wp acss settings reset` | `--skip-css`, `--yes` | Wipes all configuration. |
| `wp acss css regenerate` | none | Rebuilds `uploads/automatic-css/automatic.css` and `automatic-variables.css` from saved settings. Errors if nothing has been saved yet. Safe to repeat. |
| `wp acss status` | `--format=text\|json\|yaml`, `--section=plugin\|integrations\|css\|settings\|flags` | Settings live in option `automatic_css_settings`. |
| `wp acss logs tail` | `--type=activity\|debug`, `--events=<n>` (default 20), `--lines=<n>` (debug, default 100), `--follow` | Activity entries are JSON; pipe to `jq`. |
| `wp acss logs clear` | `--type=activity\|debug\|all`, `--yes` | Also removes `activity.log.1-3`. |
| `wp acss logs path` | `--format=table\|json\|yaml` | |
| `wp acss doctor` | `--format=text\|json`, `--fix` | PHP 8.1+/WP 5.9+, files, locks, config, CSS staleness (>7 days), integrations, recent errors. `--fix` creates the CSS directory. |
| `wp acss flags list` | `--format=table\|json\|yaml` | Precedence: `flags.user.json` (uploads) > `flags.dev.json` > `flags.json` (plugin `config/`). |
| `wp acss flags get <flag>` | none | Case-insensitive. Errors if undeclared. |
| `wp acss flags set <flag> <on\|off>` | none | Writes `flags.user.json`. Only flags declared in `flags.json` are accepted. Then reload or regenerate CSS. |
| `wp acss flags unset <flag>` | none | Deletes the file when it becomes empty. |
| `wp acss flags path` | `--format=table\|json` | |
| `wp acss license get` | `--format=table\|json`, `--show-key` | Contacts the licence server. 4.0.2+ output includes `key_source` (`wp-config`, `database` or `none`) and `activated_site`. |
| `wp acss license set` | none (hidden prompt or **stdin** only) | Never pass the key as an argument. Stores the key without activating and clears the saved status. |
| `wp acss license activate` | none | Activates the stored key. |
| `wp acss license deactivate` | none | Frees the activation and deletes the stored key. |
| `wp acss license deactivate --product=v3` | `--product=v3` | Prerelease-upgrade only: releases the legacy (v3-system) licence. |

```bash
# deploy: settings then CSS
wp acss settings export --file=/tmp/acss-before.json
wp acss settings import ./config/acss-settings.json --yes --skip-css
wp acss css regenerate
# licence from secret store
printf '%s' "$ACSS_LICENSE_KEY" | wp acss license set && wp acss license activate
# fail deploy on any doctor error
wp acss doctor --format=json | jq -e '[.. | objects | select(.status=="error")] | length == 0'
```

Sources: https://docs.automaticcss.com/cli/, https://docs.automaticcss.com/cli/settings, https://docs.automaticcss.com/cli/css, https://docs.automaticcss.com/cli/status, https://docs.automaticcss.com/cli/logs, https://docs.automaticcss.com/cli/doctor, https://docs.automaticcss.com/cli/flags, https://docs.automaticcss.com/cli/license

## Platform differences

| Task | EtchWP (WordPress) | Etch Studio |
|---|---|---|
| Install / licence | Plugin ZIP, Licence tab or `ACSS_LICENSE_KEY`, `wp acss license …` | Built in (`capabilities.acss: true`). No licence step is exposed (unverified). |
| Is ACSS active? | `wp acss status`; the Etch plugin reports `integrations.acss.version` (toolkit) | `open_project` returns `capabilities.acss` |
| Read settings | Dashboard (Cmd/Ctrl+Shift+O), `wp acss settings get/list` | `await etch.acss.listSettingsAsync('query')` (matches id, label or screen) |
| Change settings | Dashboard + Save, or `wp acss settings set <key> <value>` | `await etch.acss.updateSettingsAsync({ id: value })`. All or nothing; read `warnings`. Toggles are booleans. |
| Bulk import | Dashboard import (staged) or `wp acss settings import --yes` (immediate) | Unverified. Use `updateSettingsAsync` with a filtered object. |
| Regenerate CSS | Automatic on save, or `wp acss css regenerate` | `updateSettingsAsync` saves and regenerates |
| What exists | Dashboard **Cheat Sheet** | Live `await etch.skills.getReference('acss','tokens.md')` and `'classes.md'`. Re-read after any settings change. These win over docs. |
| Diagnostics | Activity Log tab, `wp acss logs`, `wp acss doctor`, `wp acss flags` | None exposed. Check `warnings` from `updateSettingsAsync`. |
| Global SCSS / mixins | Dashboard Global SCSS screen | Not documented. Studio examples use `to-rem()` in class CSS. |
| Ask first | Settings are site-wide | The same: ask the user before changing settings they set themselves |

Sources: Etch Studio built-in `acss` skill (`etch.skills.get('acss')`); toolkit `agent-docs/automatic-css.md`.
