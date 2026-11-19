# Etch Studio: MCP server and Etch Connector CLI

There are two ways an agent can drive Studio. Both run scripts against `window.etch` (the Public API). They differ in where the builder runs.

| | Etch Studio MCP server | Etch Connector (`npx @digital-gravy/etch-connector`) |
|---|---|---|
| Builder | Headless, in the cloud, signed in as you | A builder tab open in your browser |
| Install | None (remote HTTP MCP) | `npx`, plus a local daemon on 127.0.0.1 |
| Saving | The agent saves (`close_project { save:true }`) | Saving is left to the person unless they ask |
| Clients (Client role) | n/a | Not available to clients |

Source: https://docs.etchwp.com/studio/mcp-server, https://docs.etchwp.com/studio/etch-connector/introduction, https://docs.etchwp.com/studio/getting-started/client-editing

## MCP server (early state; tools may change)

- Address: `https://studio.etchbuilder.io/mcp`.
  - Claude Code: `claude mcp add --transport http etch-studio https://studio.etchbuilder.io/mcp`.
  - Claude apps: Settings → Connectors → Add custom connector.
- Sign in with your Etch Studio account. The agent reaches exactly your workspaces and projects.

**Tools:**

| Tool | Purpose |
|---|---|
| `list_projects` | Workspaces and projects. |
| `open_project { tenant, project }` | Returns a handle, `othersPresent`, and `etch.environment`. |
| `request_control { handle }` | Waits about 30 s for the answer. |
| `get_guide` | Authoritative agent notes. Call it before the first `eval`. |
| `eval { handle, code, timeoutMs? }` | Runs `code` as an async function body with `etch` in scope. Returns the result, errors and console logs. |
| `screenshot` | A PNG of the builder or of one element. |
| `close_project { handle, save }` | With `save: true`, saves first, and stays open if the save fails. |
| `upload_assets` | Takes local file paths. |
| `hand_over_control { handle }` | Saves and gives control back while staying open. |

> Conflict: the web MCP page's tool table omits `upload_assets` and `hand_over_control`. Both exist on the live server: its own instructions on 2026-11-17 list them, and the built-in guide mentions `upload_assets`. The live server wins.

**Session rules (web docs, server instructions and built-in guide agree):**
1. Call `list_projects`, then `open_project`, then `get_guide`. Then read **every** skill: `etch.skills.list()`, and `etch.skills.get(name).content` for each one (`etch-studio`, `bem`, and `acss` when it's active).
2. If `othersPresent` lists anyone **other than your own session** (`isYou: true`), call `request_control` **before any edit**, because taking control reloads the builder and discards earlier edits. Your own session shows up there after the first open, so a non-empty list is not by itself a reason to take control.
   - Ask the user first, unless the only entry is `isYou: true`.
   - If the answer is `granted: false`, tell the user and don't ask again unless they say so.
   - The other person sees **Save + Accept**, **Undo changes + Accept** or **Decline**. If they don't answer within 30 s, control passes and their unsaved changes are discarded.
3. Without control, every write and save is refused.
4. If saves start failing mid-session, a person took control: the builder saved and handed over after 30 s. Ask the user before requesting control again.
5. `blocks` and `styles` live in memory until `await etch.saveAsync()`. Components, stylesheets, content, routes, data sources and assets are written immediately, even if the user says "don't save".
6. **Idle timeout ≈ 10 minutes** with no call. After that the builder shuts down and unsaved work is lost. Save before pausing. A handle can also expire while you are still working — seen after ~2.5 minutes of continuous calls, returning `Unknown or expired handle: open the project again`. Reopen the project and continue; the old session stays listed in `othersPresent`.
7. Finish with `close_project { save: true }` (or `hand_over_control` if staying open), then tell the user what was saved and what was already written.
8. Branch on `etch.environment.capabilities`, not on the product name. Call `resolveAsync` on a data source before using its paths. Make every change through `etch.*`: no canvas DOM, no `<style>` injection.

Source: https://docs.etchwp.com/studio/mcp-server, Etch Studio built-in guide (`etch.skills.get('etch-studio')`)

## Etch Connector

### Setup

1. **Once:** in the builder, go to Settings → AI and turn on **AI Connector** (experimental).
2. Open the page or template **in the builder** (not the front end) and keep that tab open.
3. Click the **AI sparkles** button ("Connect external AI agent").
4. Have the agent run `npx @digital-gravy/etch-connector serve` (in the background, because it blocks). The button lights up when connected. Click it again to disconnect.

- The connection lives as long as the chat or process that ran `serve` **and** the builder tab. Other chats can reuse it.
- Several sites at once is fine. **Never connect two tabs on the same site.**
- Read `etch-connector --help` in full before driving a tab. It is the connector's own agent manual: backends, flags, stdout/stderr/exit codes, and how to pull current docs.

### CLI reference

```
etch-connector serve    [--ws-port 7331] [--control-port 7332] [--ws-host 127.0.0.1]
etch-connector tabs     [--json] [--control-port 7332] [--cdp]
etch-connector eval     [code] [-t|--tab name] [-f|--file path] [--timeout ms] [--cdp]
etch-connector upload   <file…> [-t name] [--alt text] [--collection id] [--compress webp:80[:maxWidth]] [--cdp]
etch-connector download <id…>   [-t name] [-o|--out dir|file] [--force] [--cdp]
etch-connector shot     [-t name] [-s|--selector css] [--full] [--jpeg] [-o|--out file] [--freeze=false]   (CDP)
etch-connector html     <selector> [-t name]                 (CDP)
etch-connector computed <selector> [-t name] [--props a,b,c] (CDP)
```

- **`eval`:**
  - `-t` is optional when one tab is connected.
  - The body is an async function: `await`, then `return` the value. The result prints to stdout as JSON, and logs print separately.
  - Exit codes: `0` = ok, `2` = script error, `1` = operational failure (no tab, timeout, connector unreachable, or upload/download refused).
- **`upload`:**
  - `--alt` means **one file per command**.
  - `--compress fmt[:quality[:maxWidth]]`, where fmt is `webp`, `avif`, `jpeg` or `png`. It never enlarges.
  - Default timeout is 4 minutes. Refused over 24.9 MiB, measured after compression.
  - Prints the asset, whose `id` goes in `mediaId`.
- **`download`:**
  - `-o dir/` (a trailing slash creates the folder) or a file path for one id.
  - Refuses to overwrite without `--force`, and refuses names starting with `.`.
- `upload` and `download` work only where the runtime backs `assets` (today, Studio). Elsewhere they stop with "this runtime has no etch.assets".
- **CDP mode** is for inspection only (screenshots, rendered HTML, computed CSS). It needs Chrome started with `--remote-debugging-port=9222`, plus `--cdp` on each command. Example: `etch-connector computed --cdp -t etch -s .orbit__chip --props transform,animation-duration`.
- **Tab naming:** the CLI reference doesn't document how tabs are named; its examples use `-t etch`. The toolkit says clicking the AI button registers the tab **under the site name**, and `tabs` lists one tab per line, name first. Run `tabs` (or `tabs --json`) and use the exact name.

> Unverified: the toolkit runs `etch-connector tabs --quiet` and says `tabs` without `--quiet` prints the tab's authoring rules. `--quiet` is not in the web CLI reference. Check `--help`.

Source: https://docs.etchwp.com/studio/etch-connector/usage, https://docs.etchwp.com/studio/etch-connector/cli-reference, https://docs.etchwp.com/studio/etch-connector/ai-agent-guide

### AI agent guide rules (connector)

- Tabs run in **safe mode**: only `etch` plus standard JS. No `window`, `document`, network or storage.
- Persistence:
  - Buffered (need `saveAsync()`): `blocks` and `styles`.
  - Immediate: `components`, `stylesheets`, `assets`, `content`, `routes`, `dataSources`.
  - With a person's tab, leave saving to them unless asked.
- For local images, use `upload … --alt … --compress webp:80`, then bind the `id` to `etch/dynamic-image` `mediaId`. Never paste file bytes into `eval`.
- Use `etch.ai.setState('working' | 'thinking' | 'waiting')` to show the presence overlay, and `etch.ai.hide()` in a `finally` block. Nothing clears it for you.

> Conflict: the web agent guide lists `etch.loops` as buffered. In Studio, `etch.loops` is not implemented (`NOT_AVAILABLE`, built-in guide). Ignore loops on Studio.

Source: https://docs.etchwp.com/studio/etch-connector/ai-agent-guide, https://docs.etchwp.com/studio/public-api/ai

### Security

- Listens on `127.0.0.1` only. It refuses requests from web pages (browser-marked) and accepts JSON commands only.
- `download` never overwrites files and never writes dotfiles without `--force`.
- Safe mode is **"a guardrail, not a vault"**. It doesn't contain deliberately hostile scripts, so run only trusted agents and scripts and never expose the ports.

Source: https://docs.etchwp.com/studio/etch-connector/security

### Training & guidance

- The connector itself injects **no** conventions. The project's skills (`etch.skills`) carry Etch's own rules, plus anything switched on under Settings → AI:
  - BEM class names: default on, and forced on while ACSS is enabled (changelog 2026-11-10).
- Put house conventions in the agent's rules file (`AGENTS.md` / `CLAUDE.md`).
- Since 2026-11-10, agents connected through the AI Connector are taught the Etch way (sections and containers, dynamic images, styles, components, SEO). They get a clear error on a misspelt setting instead of a silent no-op.

> Conflict: the Training page says no built-in guidance. The MCP page and the changelog say the project's skills carry Etch's own build rules. Both hold: there is no *house-style* guidance, but Etch's own rules are present. Read the skills.

Source: https://docs.etchwp.com/studio/etch-connector/training-and-guidance, https://docs.etchwp.com/studio/changelog

## Option: the Gearyco toolkit runner (connector backend only)

Toolkit: https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch (read `AGENTS.md`; don't modify it).

```
node shared-helpers/run.mjs <project> <task.js …> [-e "code"] [-t tab] [--timeout ms] [--no-kit|--kit] [--check]
```

- Run it from the toolkit root. It prepends the shared kit (`shared-helpers/etch/blocks.js`, `upsert.js`, `audit.js`) and the project's `helpers.js`, then syntax-checks locally (`--check` stops there).
- It runs `npx @digital-gravy/etch-connector eval -t <tab> -f <tmp> --timeout <ms>`, with a 120000 ms default timeout, and prints the decoded result. The tab comes from `projects/<project>/etch/etch.json` (`{ "tab": "…" }`) or `-t`.
- Kit helpers:
  - `task(fn)` wraps the work and sets the AI presence state.
  - Upserts: `upsertStyle`/`applyStyles`, `upsertComponent`, `upsertDataSource`/`apiSource`/`jsSource`, `ensurePage`, `ensureTemplate`, `buildPage`, `buildTemplate` (these two save for you), `buildIndexTemplate`, `upsertRoute`/`dataSourceRoute`, `ensureCollection`.
  - Read-only audits: `siteAudit()` (data-source usage, component usage, unused selectors, uncollected assets, route path statuses), `auditRoutes()`, `auditAssets()`.
- Write scripts so they can be re-run (find-or-create, then update) and return compact summaries. Never run two agents against the same tab.
- **The runner doesn't apply to the MCP backend.** There, inline the helpers you need into `eval`.
- Toolkit flow:
  1. Run `tabs`.
  2. If no tab is connected, use the MCP server.
  3. Only if the MCP isn't available, ask the user to enable the AI Connector and click the AI button.

Source: https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch/blob/main/AGENTS.md, https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch/blob/main/shared-helpers/run.mjs
