# EtchWP: Etch Intelligence (built-in AI assistant)

Experimental. A builder panel with two modes: **Build** (default, makes changes) and **Ask** (answers only). Not the same thing as the Etch Connector or the `etch.ai` Public API presence namespace (covered elsewhere).

## Activation
- Provider: **OpenAI only** (other providers and a native subscription model are "planned"). Needs an OpenAI **API** key with billing; a ChatGPT subscription does not cover API usage. Set usage limits in the OpenAI account.
- Builder → **Settings** (gear) → **Experimental** tab → toggle **AI Assistant** → paste **OpenAI API Key** → **Save**.
- The panel then appears automatically; hiding it does not disable the feature.
- Empty AI replies on some hosts: set feature flag `ENABLE_CLEAR_BUFFER_IN_STREAM_REQUEST` to `"on"` in `wp-content/uploads/etch/flags.user.json`.
- Key hygiene: never commit or share the key; a leaked key bills the account.

Source: https://docs.etchwp.com/etch-intelligence/activating-ai ; https://docs.etchwp.com/etch-intelligence/introduction ; https://docs.etchwp.com/feature-flags

## Ask mode
- Toggle at the top of the chat input: **Ask** (chat-bubble icon).
- For Etch questions (components, loops, conditions), general web dev (CSS layout, semantics, JS, accessibility), how-tos, troubleshooting.
- Returns explanations and copy-paste code (HTML, CSS, dynamic-data expressions). Makes no changes; suggests switching to Build when asked to build.

Source: https://docs.etchwp.com/etch-intelligence/ask-mode

## Build mode
- Default mode (magic-wand icon; placeholder "Ask the AI to build something..."). The last-used mode is remembered.
- **Generates code**: Etch HTML (dynamic data, `{#loop}`, `{#if}`), CSS (flat BEM, logical properties, custom properties, `clamp()`, container queries), minimal vanilla JS.
- **Acts on the site** (shown as steps in the chat): creates loop definitions (incl. WP query loops), registers custom post types, creates field groups/fields and reads/sets values, creates posts/pages and inserts data.
- **Reads the site**: media library, blocks on the current page, existing posts, post types and loop definitions.
- Code block actions: **Insert** (HTML → new element on canvas), **Replace** (HTML → swaps the selected element), **Copy**.
- **Element context** (surgical edits): select an element and click the AI sparkles on its badge, or right-click (canvas or Structure panel) → **Add to AI context** / **Add N elements to AI context**. Context items show as pills; remove with × or **Remove from AI context**. Add context *before* describing the change.
- **Files**: paste/drag/drop, max **10 MB each**. Screenshots/mockups as build references; CSV for bulk post/page/field creation; structured files to scaffold a CPT + fields + content.
- Vendor tips: be specific, build from a screenshot, add the target element as context, review generated code and structural changes before relying on them.

Source: https://docs.etchwp.com/etch-intelligence/build-mode

## Agent cautions (inferences from the docs above, not vendor statements)
- Build mode can create CPTs and Etch-native custom fields. The vendor calls Etch-native CPTs/fields a proof of concept not for production (https://docs.etchwp.com/known-issues). Prefer the site's established CPT/field tooling for real data.
- Build mode writes posts, pages and field values directly. Use it on staging, not production.

Source: https://docs.etchwp.com/known-issues ; https://docs.etchwp.com/etch-intelligence/build-mode
