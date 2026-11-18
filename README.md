# skills

Agent skills for building and maintaining sites in **Etch Studio** and **EtchWP**, with **Automatic.css 4** on both.

**Status: early.** The skills are version 1 and were written from the developers' docs and Etch Studio's live builder guide. Read-only checks ran against a live Etch Studio project. Write paths (blocks, routes, settings, components) have not been tested. Each skill lists what it could not verify.

## Skills

| Skill | Use it for |
|---|---|
| `etch-shared-rules` | Markup, BEM names, where class CSS goes, keyframes, images and conditions, on both platforms |
| `etch-studio-build` | Building sites in Etch Studio through `window.etch`: data sources, loops, routes, content types, components, assets, saving |
| `etchwp-build` | Building sites on WordPress with EtchWP through the Public API and dynamic data |
| `automaticcss-etch` | Using Automatic.css 4 tokens and classes, and changing ACSS settings, on both platforms |
| `etch-site-audit` | A read-only audit of an Etch Studio project: routes, SEO, assets, empty class selectors |

Each skill is one folder under `skills/` with a single `SKILL.md`. The file starts with `name` and `description` front matter, then the instructions.

## Use the skills

Copy or symlink a skill folder into your agent's skills folder. For Claude Code:

```sh
ln -s "$PWD/skills/etch-studio-build" ~/.claude/skills/etch-studio-build
```

Repeat for each skill you want. Other agent tools read skills from their own folders, so check that tool's documentation for the path.

Read a skill's **Known conflicts** section before you rely on it. The developers' sources disagree on several points, and each skill says which source it follows.

## Sources

- EtchWP documentation: https://docs.etchwp.com
- Automatic.css documentation: https://docs.automaticcss.com
- Etch Studio: the live builder guide, read with `get_guide` and `etch.skills.list()` inside a project. The public Studio docs host did not resolve when these skills were written.

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. In short:

1. Open an issue for a large change or a change to a skill's rules.
2. Branch with a semantic name, such as `fix/studio-redirects`.
3. Open a pull request into `main`, with a Conventional Commit title.
4. Mark any claim you could not verify, and name the source for each fact.

## Keep secrets and client data out

This repository is public. Never commit:

- API keys, tokens, passwords, certificates or any file that holds them
- Client, project or site names, tenant IDs, project IDs, URLs or account IDs
- Copies of third-party guides or docs, unless their licence allows it

Run a secret scan before you push:

```sh
gitleaks detect --source . --redact
```

The `.gitignore` blocks common secret and build files. It does not replace the scan.

## Licence

No licence has been chosen yet. Until one is added, the default copyright rules apply and nobody has permission to reuse the content.
