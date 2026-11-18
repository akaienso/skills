# Contributing

Thanks for helping. These skills tell agents how to change real websites, so every claim has to
be exact and sourced.

## Workflow

1. Open an issue first for a new skill or a change to a skill's rules.
2. Create a branch from `main` with a semantic name, `type/short-description`. Allowed types:
   `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `revert`, `style`.
   Examples: `feat/forms-guidance`, `fix/redirect-status`.
3. Make the change and run the checks below.
4. Open a pull request into `main` with a Conventional Commit title, for example
   `fix: correct the image key note in etchwp`.
5. Wait for CI. Pull requests are squash-merged, and the title becomes the commit message.

`main` is protected: no direct pushes, every change needs a pull request.

## Title types and versions

| Type | Version effect |
|---|---|
| `feat` | Minor: a new skill, or something a skill never covered before |
| `fix` | Patch: a corrected fact, rule, command or example |
| `feat!` or a `BREAKING CHANGE:` footer | Major: a renamed or removed skill, or incompatible rules |
| `perf`, `revert` | Patch |
| `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `style` | No release on their own |

Never edit `CHANGELOG.md` or `.release-please-manifest.json`; Release Please writes
them. See [docs/RELEASE-WORKFLOW.md](docs/RELEASE-WORKFLOW.md).

## Writing a skill

- One folder per skill under `skills/`, holding `SKILL.md` and, if needed, a `references/` folder.
- Front matter: `name` (the folder name; lowercase letters, digits, hyphens) and `description`
  (when to use the skill: triggers and symptoms, max 1024 characters).
- Keep `SKILL.md` short: what an agent needs every time. Put long reference material in
  `references/` and link to it with a backtick path, e.g. `references/routing.md`.
- Give the source for every fact: a vendor docs URL or a public repository. Mark anything you
  couldn't check as **unverified**. When sources disagree, add a `> Conflict:` line saying what
  each says and which one wins.
- Don't copy vendor documentation or in-product guides. Summarise and link.
- Don't invent API methods, CLI flags, class names or tokens.
- Skills are generic: no client names, project names, site URLs, account or tenant IDs, local
  paths, or one team's house rules.

## Checks before a pull request

```bash
node scripts/validate-skills.mjs   # front matter, names, reference links, script syntax
gitleaks git . --redact            # secret scan
```

Then search your change for client or project names, IDs and personal details. If you changed a
rule, say in the PR which product and version you checked it against.

No AI or assistant attribution in commits, titles or PR bodies (no `Co-Authored-By` trailers for
assistants, no "Generated with…" footers).

## Security

Never open a public issue for a leaked secret or a vulnerability. Use private vulnerability
reporting (see [SECURITY.md](SECURITY.md)), and rotate any exposed secret straight away.

## Licence

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
