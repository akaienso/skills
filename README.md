# skills

A curated collection of skills for AI coding agents: Claude Code, Codex, Gemini CLI,
Antigravity, Cursor, GitHub Copilot and any other tool that reads `SKILL.md` folders.

A skill is a folder with a `SKILL.md` file. Its front matter (`name`, `description`) tells the
agent when to load it; the body tells it how to do the job. Longer material sits in a
`references/` folder that the agent opens only when it needs it, so a skill costs little until
it's used.

## Skills

| Skill | Use it when |
|---|---|
| [`etch-authoring`](skills/etch-authoring/SKILL.md) | Writing anything inside an Etch builder (Etch Studio or EtchWP): blocks, sections, components, props, slots, loops, conditions, dynamic data, classes and CSS, or scripting `window.etch` |
| [`etch-studio`](skills/etch-studio/SKILL.md) | Building or maintaining an Etch Studio site: content types, data sources, routes, templates, SEO, redirects, 404s, assets, forms, deploys, the Etch Studio MCP |
| [`etchwp`](skills/etchwp/SKILL.md) | Building or maintaining a WordPress site with Etch: templates, Loop Manager queries, custom fields, facets, Gutenberg, Etch AI |
| [`automaticcss`](skills/automaticcss/SKILL.md) | Styling an Etch site with AutomaticCSS 4: tokens, classes, colours and dark mode, spacing, typography, grids, buttons, settings, the `wp acss` CLI |
| [`etch-site-maintenance`](skills/etch-site-maintenance/SKILL.md) | Auditing, cleaning up, migrating or launch-checking an Etch site, with a read-only audit script |

The Etch skills are written from the developers' own documentation:
[docs.etchwp.com](https://docs.etchwp.com) (EtchWP, and Etch Studio under
[/studio](https://docs.etchwp.com/studio)) and [docs.automaticcss.com](https://docs.automaticcss.com),
plus the public [Gearyco Agentic Toolkit for Etch](https://github.com/kevingeary/gearyco-agentic-toolkit-for-etch).
Inside an Etch Studio project, the project's own built-in guides
(`etch.skills.list()`, `etch.skills.get(name)`) are newer than any copy, and the skills tell the
agent to read them first. Where sources disagree, the reference files say so in `> Conflict:` lines.

Etch and Etch Studio are products of Digital Gravy. AutomaticCSS is a product of its own
developers. This repository is not affiliated with either.

## Install

### Every agent tool on your machine (recommended)

```bash
git clone https://github.com/akaienso/skills.git
cd skills
bash scripts/install.sh --dry-run   # see what it will do
bash scripts/install.sh             # do it
```

The script links each `skills/<name>` folder into the personal skills folder of every tool it
finds:

| Tool | Folder |
|---|---|
| Claude Code | `~/.claude/skills` |
| Cross-tool alias (read by Codex and others) | `~/.agents/skills` |
| Codex | `~/.codex/skills` |
| Gemini CLI | `~/.gemini/skills` |
| Antigravity | `~/.gemini/antigravity/skills` |
| Cursor | `~/.cursor/skills` |
| GitHub Copilot | `~/.copilot/skills` |

A tool is skipped when its folder isn't there. The script never overwrites a folder or a link it
didn't create; it reports them instead. Check your tool's documentation if it reads skills from a
different place.

Options:

```bash
bash scripts/install.sh --only claude,codex   # some tools only
bash scripts/install.sh --copy                # copy instead of link, for a tool that won't follow links
bash scripts/install.sh --uninstall           # remove the links this script created
```

### One skill, one tool

```bash
ln -s "$PWD/skills/etch-studio" ~/.claude/skills/etch-studio
```

### Claude apps (claude.ai, Claude Desktop)

These use skills uploaded to your Claude account. Zip a skill folder (the folder itself at the
top of the zip) and upload it under **Settings → Capabilities → Skills**.

## Use

Nothing to call by hand. Once installed, an agent loads a skill when your request matches its
`description`: for example, "add a team section to my Etch Studio site" loads `etch-studio`,
`etch-authoring` and, if the project uses AutomaticCSS, `automaticcss`. You can also name a skill
in your request.

## Update

```bash
git pull
```

Linked installs pick up the change immediately. For copied installs, run
`bash scripts/install.sh --uninstall`, delete the copies, then run `--copy` again. Releases and
their notes are under [Releases](https://github.com/akaienso/skills/releases).

## Contribute

Fixes and new skills are welcome. The short version (details in [CONTRIBUTING.md](CONTRIBUTING.md)):

1. Open an issue first for a new skill or a change to a skill's rules.
2. Branch from `main` with a semantic name: `fix/acss-token-names`, `feat/new-skill`.
3. Run `node scripts/validate-skills.mjs` and `gitleaks git . --redact`.
4. Open a pull request with a Conventional Commit title, e.g. `fix: correct the redirect limit in etch-studio`.
5. CI checks the branch name, the title, every skill's structure, and scans for secrets.

`main` is protected, every change goes through a pull request, and pull requests are squash-merged.
Versions and the changelog are written by Release Please ([docs/RELEASE-WORKFLOW.md](docs/RELEASE-WORKFLOW.md)).
Agents working in this repository follow [AGENTS.md](AGENTS.md).

## Security

This repository is public. Never commit secrets, client or project details, or copies of
third-party documentation. To report a security problem, use GitHub's private vulnerability
reporting ([SECURITY.md](SECURITY.md)), not a public issue.

## Licence

No licence has been chosen yet. Until one is added, normal copyright applies and the content may
not be reused.
