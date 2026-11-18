# Etch Studio: assets, forms, deploying, client editing

## Assets

- Studio has its own asset store (Asset Manager, `etch.assets`). There is no WordPress media library. An asset's numeric `id` is what `etch/dynamic-image` `mediaId` and `image` content fields take.
- Upload limit: **24.9 MiB per stored file**. With compression, the limit applies to the result: through the CLI, an original up to 60 MiB may go.
- Raster images (JPEG, PNG, WebP, AVIF) get responsive variants on upload (`responsiveWidths`).
- File names are slugified (`My Photo.JPG` → `my-photo.jpg`). A duplicate name is refused (`INVALID_ARGUMENT`).
- Supported uploads include JPG, PNG, WebP, AVIF, SVG, MP4, MOV, PDF, CSV and XLS. Files that aren't images, video, audio or PDF **download** instead of opening when you visit their URL. They still work when a page uses them as a stylesheet, script or font.
- **Collections** = folders. An asset can be in several. The UI allows one nesting level (the API takes a `parentId`). Deleting a collection keeps its assets and moves its sub-collections to the top level. The sidebar has an "Uncategorized" filter.
- **Compression:** formats WebP, AVIF, JPEG and PNG. Resize modes are fixed (width or height), relative (long or short side) and percentage, all downscale-only. Crop presets: Freeform, 1:1, 4:3, 3:2, 16:9, 2:3, 9:16, Original. Save options are **Overwrite** (keeps the URL) or **Save as new**. Bulk compression and saved **presets** (level, format, resize, overwrite preference) are available.
- API `compressAsync(id)` replaces the asset in place. The id stays, but **the extension follows the new format** (`hero.png` → `hero.webp`), so hard-coded `/assets/…` URLs break and `mediaId` bindings survive. Pass `keepOriginal: true` for a copy.
- `deleteAsync` → `ASSET_IN_USE` while an `image` field holds the asset.
- Agents: upload with the MCP `upload_assets` tool (takes file paths) or `etch-connector upload <file>`. Never paste base64 into eval unless neither can work. If an upload times out, check the list before retrying, because it may have been stored.

### Recommended conventions (from the Gearyco agentic toolkit)

- **Every asset belongs to a collection.** Never leave one uncollected.
- First call `etch.assets.listCollectionsAsync()` and reuse a match. Create a collection only if none fits.
- Use plural, what-it-is names: `Fonts`, `Graphics` (decorative SVGs, patterns, textures), `Icons`, `Logos`, `Photos`, `Documents`.
- Assign the collection in the same step as the upload: `etch-connector upload … --collection <id>`, or `etch.assets.updateAsync(id, { collectionIds: [cid] })` straight after `uploadAsync`. Helper: `ensureCollection(name)`.
- `createCollectionAsync(name)` takes the name as a plain string.
- Afterwards, confirm that no asset in `etch.assets.listAsync()` has an empty `collectionIds` (or run the toolkit's `auditAssets()`).
- **Block scripts: never `btoa()` `script.code`.** Studio's static export ships the code verbatim inside `<script type="module">`, so base64 becomes a syntax error and the script silently never runs.

Source: https://docs.etchwp.com/studio/interface/asset-manager, https://docs.etchwp.com/studio/public-api/assets, https://docs.etchwp.com/studio/etch-connector/cli-reference, https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch/blob/main/agent-docs/etch-studio.md

## Forms

Studio builds a static site, **has no forms API and handles no submissions** (built-in guide). Submissions go from the visitor's browser to a third party at submit time.

- The endpoint must allow your origin (CORS).
- **Everything in the page is public**: endpoints, webhook URLs and keys. Never put a secret in a form.
- Every field needs a `name`. Unnamed fields aren't sent.
- Test on the deployed or downloaded site, not the canvas: many provider scripts run only on the published page.

### The three routes

1. **Embed a provider form.** Paste the embed into the HTML panel. If the provider wants the script in the head, wrap it in `<etch:head>`.
   - For an iframe: add a class, remove the `width`/`height` attributes, and size it in CSS (`width:100%; height:…; border:0`).
   - For script + container: leave the container's `id`, `class` and `data-*` untouched.
2. **Your own form + a form backend.**
   - Option A, plain HTML: `action` plus `method="POST"`, with the key in a hidden field.
   - Option B, stay on the page: a `fetch` handler in the Javascript panel.
   - Worked example: Web3Forms (`https://api.web3forms.com/submit`, hidden `access_key`, optional `subject`, `redirect` as a full `https://` URL on the same site, and a `botcheck` honeypot). 250 free submissions a month.
   - Others: Formspree (`formspree.io/f/<id>`), Basin (`usebasin.com/f/<id>`), Getform (`getform.io/f/<id>`).
3. **Your own form + an automation webhook.**
   - **Make** is recommended. Have the scenario respond with JSON: `{ "success": true }`, or `{ "success": false, "errors": { field: msg } }`.
   - The scenario must validate everything it receives: client-side validation is not security, and the webhook URL is public.
   - **Zapier:** send FormData, not JSON (JSON gets a CORS error). It returns a fixed response.
   - **Pipedream:** choose "Return a custom response" and answer with `$.respond()` (a 400 means it never reached `$.respond`).
   - **n8n:** set Allowed Origins (CORS) to your site, use the **Production URL**, and publish the workflow.

### Embed providers (one line each)

- **Google Forms:** iframe. Set the height in CSS. Theme it in Google's Customize theme.
- **Microsoft Forms:** iframe. Remove `style` (its `max-height:100vh` cuts the form off). Start higher than the copied 480px. Keep it ≥320px and visible on load, or it shows as a link.
- **Tally:** iframe with `data-tally-src` plus a helper script. The **script goes in the Javascript panel without the `<script>` tags**. It auto-resizes.
- **Typeform:** script + container. Requires HTTPS (deployed sites are). Style it in Typeform's Design panel.
- **Jotform:** a single script tag that writes the form where it sits. There's an iFrame alternative if scripts conflict.
- **HubSpot Forms:** script + container. Renders in the canvas and on the live site. Style it in HubSpot.
- **Fillout:** script + container. Turn on "Auto-resize height". The form shows only on the deployed page; in the canvas it's an empty block.

Source: https://docs.etchwp.com/studio/forms, https://docs.etchwp.com/studio/forms/custom-forms, https://docs.etchwp.com/studio/forms/custom-forms/form-backends, https://docs.etchwp.com/studio/forms/custom-forms/make, https://docs.etchwp.com/studio/forms/custom-forms/other-platforms, https://docs.etchwp.com/studio/forms/embedding (plus each provider page under /studio/forms/embedding/)

## Deploying

- Studio renders every routed page to static HTML, CSS, JS and assets. **Studio never hosts the site.**
- **Download Site** produces `site.zip` for any static host.
- **Deploy** (the cloud-upload button) publishes to the connected target. **The only target today is a Cloudflare Worker with static assets** on your own Cloudflare account.
- Connect under Settings → Deployment:
  - **OAuth** ("Connect Cloudflare", recommended; fills Worker Name from the project name), or
  - **API token** (Account ID + a token with Account → Workers Scripts → Edit + Worker Name).
  - The connection is **per project**: authorize each project, even when they share an account.
- Worker names are normalised to lowercase with hyphens. The Worker is created on first deploy, served at `https://<worker>.<subdomain>.workers.dev`. If you enter an existing Worker's name, Studio deploys into it.
- The deploy button stays disabled until credentials **and** a Worker name are set ("Configure Cloudflare settings first").
- **Size limit: the total site must be under 25 MB.** Over that, the deploy is refused before upload. Large images are the usual cause, so compress them.
- **What a deploy freezes:** routes, data sources (API calls run at build) and content. To publish changes, deploy again. "The site deployed but the data is stale" is expected behaviour.
- Things that **stop a deploy:**
  - a data-source route with no template
  - a failing route source
  - a URL conflict, or URLs that differ only in case
  - a segment that resolves to `/`
  - a self-redirect
  - more than 2,000 redirects
  - a site over 25 MB
- Agents connected through the AI Connector can deploy (changelog 2026-11-02). `etch.deploy` and its methods are **not documented** in the web docs. Unverified: feature-detect it and inspect its keys in-session before calling anything.
- Custom domains: **not documented** in the Studio web docs (gap).
- Troubleshooting: for an auth error, use **Reconnect Cloudflare** (OAuth) or check that the token has Workers Scripts: Edit on the right account.
- Route redirects count toward the 2,000-redirect cap, and destinations are written literally (path or full URL).

Source: https://docs.etchwp.com/studio/deploying, https://docs.etchwp.com/studio/getting-started, https://docs.etchwp.com/studio/changelog, https://docs.etchwp.com/studio/routing/redirects-and-errors.

## Client editing

- Only the **workspace owner** invites. Go to Members → Invite member → Role **Client**, then choose websites (or **Every website**, which includes future sites; at least one choice is required). Members → **Edit access** changes it later.
- Clients can:
  - edit text on the canvas
  - change a link's text or destination
  - replace images and alt text
  - replace SVG icons from the media library
  - edit the props exposed on a component instance
  - create, edit and duplicate Content Hub items
  - upload media
  - save and publish (when publishing is set up)
- Clients can't:
  - add, delete, move, duplicate or copy-paste elements
  - use the code or design panels
  - edit component definitions
  - delete items
  - manage types or templates
  - open the design or route managers or settings
- **Etch Connector is not available to clients.**
- **Content rendered in a loop can't be edited on the canvas.** Clients edit it in the Content Hub. To give clients something to edit, expose it as component props or Content Hub items.
- A client can't add elements to an empty page, but can duplicate an existing item.
- Client-only notes: `{#if environment.clientEditor}…{/if}` never reaches the published site. Team-only editor notes: `environment.current === "etch" && !environment.clientEditor`.
- **View as client** previews this experience from the action bar (changelog 2026-11-11).

Source: https://docs.etchwp.com/studio/getting-started/client-editing, https://docs.etchwp.com/studio/dynamic-data/dynamic-data-keys, https://docs.etchwp.com/studio/changelog

## Misc platform facts

- Studio lives at `studio.etchbuilder.io`. There is **no self-serve sign-up**: the Etch team creates accounts.
- Website names must be unique per account.
- Deleting a project from its dashboard card deletes its pages, styles, assets and data sources.
- **No autosave.** Save with Save or ⌘/Ctrl+S. Agents save with `await etch.saveAsync()`.
- The homepage (the house icon in the Content Hub) becomes `index.html`.
- Etch ships weekly, often partial, releases, so re-read the live built-in guide each session. Priorities (as of 2026-09-24): Client Editing and Basic SEO.

Source: https://docs.etchwp.com/studio/getting-started, https://docs.etchwp.com/studio/getting-started/development-strategy, https://docs.etchwp.com/studio/top-priorities
