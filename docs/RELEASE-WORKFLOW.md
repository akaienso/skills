# Release workflow (Tier A: `main` only)

This repository follows Rob Moore's Git release standard, trimmed to a single channel.
`AGENTS.md` states the binding rules; this page explains them.

## The non-negotiables

1. **Release Please owns every version number and `CHANGELOG.md`.** Nobody hand-edits a
   version string, a changelog entry, a tag, `version.txt`, or `.release-please-manifest.json`.
2. **Conventional Commits are required on everything mergeable.** Release Please reads commit
   messages to decide the version bump and the changelog. A commit that doesn't conform is
   invisible to the release.
3. **Merges are squashed, so the PR title is the commit message.** CI rejects a PR whose title
   is not a Conventional Commit.
4. **Merging a release PR ships nothing to anyone's machine.** It creates a tag and a GitHub
   Release. People pick up changes when they `git pull`.
5. **`main` is protected.** Everything reaches it through a pull request.
6. **No AI or assistant attribution** in commits, PR titles or PR bodies: no `Co-Authored-By`
   trailers for assistants, no "Generated with…" footers, no session links.

## Branch model

```
feat/*  ─PR─>  main
```

Work branches are cut from `main` and return by PR. Name them `<type>/<short-kebab-description>`,
where `<type>` is the Conventional Commit type of the work: `feat/wordpress-skill`,
`fix/acss-token-names`, `docs/install-guide`, `ci/secret-scan`.

## Commit and PR title types

| Type | Version effect | Use for |
|---|---|---|
| `feat:` | minor | a new skill, or a capability a skill never covered before |
| `fix:` | patch | a corrected fact, rule, command or example; finishing something a skill already promised |
| `perf:`, `revert:` | patch | |
| `docs:` `refactor:` `test:` `build:` `ci:` `chore:` `style:` | none | README, tooling, housekeeping |
| `feat!:` / `fix!:` or a `BREAKING CHANGE:` footer | major | renaming or removing a skill, or changing its rules incompatibly |

`fix:` vs `feat:`: restoring or completing behaviour a skill already promised is `fix:`, whatever
its size. `feat:` is for something never offered before. When unsure, ask the maintainer.

Overriding a computed version after commits are merged: never rewrite history. Add an empty
commit with a footer instead:

```bash
git commit --allow-empty -m "chore: release as 1.2.3" -m "Release-As: 1.2.3"
```

## Release Please

- `release-please-config.json`: `simple` release type, tags `vX.Y.Z`, changelog in `CHANGELOG.md`.
- `.release-please-manifest.json`: the current version.
- `.github/workflows/release-please.yml` runs on every push to `main`, opens or updates one release
  PR, and merging that PR creates the tag and the GitHub Release.
- Release Please needs its own identity, because events created by `GITHUB_TOKEN` don't trigger
  other workflows: CI would never run on the release PR, and the ruleset would block it. Add either
  `RELEASE_APP_ID` + `RELEASE_APP_PRIVATE_KEY` (a GitHub App, preferred) or `RELEASE_PLEASE_TOKEN`
  as repository secrets.
- The release PR is merged by hand (the standard's default for a new repository).

## Checks on every pull request (`.github/workflows/pr-quality.yml`)

| Check | What it enforces |
|---|---|
| `branch-name` | `type/short-description` |
| `pr-title` | Conventional Commit title |
| `validate-skills` | Front matter, folder names, links to `references/`, script syntax (`scripts/validate-skills.mjs`) |
| `secret-scan` | gitleaks over the full history |

The `Protect Main` ruleset requires all four, a pull request, resolved review threads and linear
history; it blocks deletion and force-pushes, with no bypass.

## Release procedure

1. Open a PR from `type/*` into `main` with a Conventional Commit title. Squash-merge it when the
   checks pass.
2. Release Please opens or updates the release PR.
3. Merge the release PR. It writes `CHANGELOG.md`, the manifest and `version.txt`, then tags.
