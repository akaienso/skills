# Copying blocks between Etch tabs and sites

## 1. The documented API

```ts
etch.blocks.copy(blockId: string): CopyObject                                   // sync
etch.blocks.pasteAsync(payload: CopyObject, targetId?: string | null, index?: number): Promise<string>  // new block id
```
- `copy()` serializes a block and its subtree **together with the global styles, loops, components and `@custom-media` definitions it references** into a plain-JSON `CopyObject`. `pasteAsync()` re-creates those and re-maps them to fresh ids.
- Neither touches the system clipboard: no user gesture or permission needed. The payload is the same one Cmd-C would produce, so it can be stored and pasted later, on another page, or on another site.
- Placement: no `targetId` → appended at document root (or at `index`); `targetId` + `index` → child of target at `index` (throws `WRONG_BLOCK_TYPE` if the target can't hold it); `targetId` without `index` → into the target if it accepts children, otherwise immediately after it. `index` is clamped; negative counts from the end (`-1` appends).
- Pasted blocks are buffered like other block edits; the docs example ends with `await etch.saveAsync()`.
- `CopyObject` = `{ type: "block", version, styles?, loops?, components?, customMediaDefinitions?, timestamp? }` plus, on EtchWP, `gutenbergBlock`. Treat it as an **opaque token**: never read or build its internals (WP warns the `gutenbergBlock` shape is unstable and will be replaced by an Etch-native representation).

**WP vs Studio:** the `copy`/`pasteAsync` signatures are identical. The WP `CopyObject` carries `gutenbergBlock`; Studio's type has no such field. Pasting a **WP-produced payload into Studio (or the reverse) is undocumented and unverified**; probe on a scratch page first. Loops in a payload are WP Loop Manager definitions; Studio has no loop registry (`etch.loops` → `NOT_AVAILABLE`), so loop bindings won't carry over to Studio as-is (inference from the docs; unverified).

Source: https://docs.etchwp.com/public-api/blocks#copy-paste, https://docs.etchwp.com/public-api/types-reference#copy-payload (and `/studio/` equivalents)

## 2. Other documented copy/paste behaviour

- Copying an element that uses `@custom-media` tokens brings the definitions along.
- Native components (e.g. Basic Nav) are distributed as "Copy/Paste JSON": copy from the docs page button, then Cmd/Ctrl+V anywhere in the builder.
- Studio Content Hub (changelog 2026-11-03): copy fields from one content type to another via the ··· menu (fields, not blocks).
- Patterns (unsynced saved markup) are an alternative to components when you don't need sync.

Source: https://docs.etchwp.com/responsive-development/custom-media, https://docs.etchwp.com/components-native/basic-nav, https://docs.etchwp.com/studio/changelog, https://docs.etchwp.com/components/props/prop-object

## 3. Hard rules (Gearyco toolkit)

1. Use the blocks copy/paste API for every cross-site content move: the programmatic Cmd-C / Cmd-V.
2. **No custom export/import scripts**: no `getJson()` + recursive `create()` + `addClass()` loops, no repo-local migration scripts for standard copies.
3. Don't treat legacy migration scripts in a repo as the pattern unless `AGENTS.md` points to them.
4. Don't migrate styles, components or loops by hand alongside a copy. Paste brings them; only fix by hand if paste fails and the user asks for a fallback.
5. **Verify the live API before scripting**: method names change. Probe the tab:
   ```bash
   npx @digital-gravy/etch-connector eval -t TAB "return Object.keys(etch.blocks).filter(k => /copy|paste/i.test(k)).sort();"
   ```
   If you can't confirm the API, say so; never fall back to a custom script.
6. Toolkit: don't call `etch.saveAsync()` unless the user asks to save. (Docs example saves after paste; follow the user's instruction and report unsaved state.)

Source: toolkit `agent-docs/etch-copy-paste.md`, `AGENTS.md`

## 4. Cross-tab workflow (connector)

1. Confirm `copy`/`pasteAsync` exist on both tabs (probe above).
2. `npx @digital-gravy/etch-connector tabs` to list tabs.
3. On the **source** tab, find the block (`etch.blocks.find({ class })`, `getTree()`, or by structure name) and `return etch.blocks.copy(id)`.
4. Save the returned JSON to a temp file outside the workspace (host side).
5. On the **destination** tab, run a script (`eval -f`) that embeds the payload and calls `await etch.blocks.pasteAsync(payload, targetId?, index?)`; optionally `etch.blocks.select(newId)`.
6. Save only if asked; report what is unsaved.

With the toolkit runner: `node shared-helpers/run.mjs <source-project> -e "return etch.blocks.copy(etch.blocks.find({class:'feature-section'})[0])" > /tmp/payload.json`, then a destination task file that inlines the payload. Never run two scripts against one tab at the same time.

Through the Studio MCP: open both projects (two handles), `eval` `copy` on the source handle, pass the returned JSON into an `eval` on the destination handle, then save/close per the MCP rules. (Payload size limits of MCP `eval`: unverified.)

Source: toolkit `agent-docs/etch-copy-paste.md`, `agent-docs/etch-build-examples.md` (Example 3), `agent-docs/etch-shared-helpers.md`; https://docs.etchwp.com/etch-connector/cli-reference

## 5. When paste isn't enough (only if it fails or the user asks)

- **Media:** image references are attachment/asset ids; they aren't listed among the bundled definitions. If ids differ on the destination, re-bind `mediaId` (upload the file there first: Studio skill / `etch-connector upload`).
- **Loops (WP):** check the Loop Manager if loops break at runtime after a successful paste.
- **Components:** manual component work is for editing one component in isolation, not for standard migrations. Remember component keys are PascalCase on both sides.
- **Classes:** run the toolkit's `auditSelectors()` afterwards to find classes with no selector.

Source: toolkit `agent-docs/etch-copy-paste.md`, `shared-helpers/etch/audit.js`; https://docs.etchwp.com/public-api/types-reference#copy-payload
