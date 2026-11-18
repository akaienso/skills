# AGENTS.md

Rules for any AI agent (Codex, Claude Code, Cursor, Copilot, Gemini and others) working in this
repository. `CLAUDE.md` only points here. Rules are stated once, in this file.

## What this repository is

A public collection of agent skills. Each skill is a folder under `skills/` with a `SKILL.md`
(YAML front matter `name` and `description`, then instructions) and optional `references/`
files that the skill links to. `scripts/install.sh` links the skills into each agent tool's
skills folder.

## This repository is public

Never commit, in any file, commit message, PR title or PR body:

- secrets: API keys, tokens, passwords, private keys, certificates, `.env` files, session handles
- names, IDs or URLs of the clients, sites and projects the skills are used on (tenants,
  accounts, site URLs)
- personal details of anyone: email addresses, phone numbers, home addresses, private messages
- absolute paths from someone's machine (`/Users/<name>/…`, `C:\Users\…`)
- copies of third-party documentation or in-product guides; summarise and link instead
- notes from a working session, test runs against a real project, or house rules of one team

This repository's own public identity is not covered by these rules: its URL, issue and PR
numbers, commit links in `CHANGELOG.md`, commit authorship, and the copyright holder named in the
repository's licence.

Run `gitleaks git . --redact` before every push.

## Writing skills

- `name` matches the folder name: lowercase letters, digits and hyphens.
- `description` says when to use the skill (triggers and symptoms), max 1024 characters.
- Every fact has a source: a vendor docs URL, or a named public repository. Mark anything you
  couldn't verify as **unverified**. Where sources disagree, add a `> Conflict:` line saying what
  each says and which wins.
- The live platform (an API's own built-in guide, generated token lists) beats written docs; newer
  docs beat older ones.
- Keep `SKILL.md` short; put long reference material in `references/` and link it with a
  backtick path such as `references/routing.md`.
- Never invent API methods, CLI flags, class names or tokens.

## Versioning and releases

Full procedure: docs/RELEASE-WORKFLOW.md. The rules below are binding.

Versions and CHANGELOG.md are written by Release Please, never by hand. Do not edit any
version string, CHANGELOG.md, or .release-please-manifest*.json.

Branch flow: feat/* → PR → main. main is not a working branch. Direct pushes to protected
branches are blocked.

Every PR title must be a Conventional Commit; merges are squashed, so the title becomes the
commit Release Please reads. fix: = restoring or completing promised behaviour (any size).
feat: = a capability never promised before. When the computed bump is wrong and commits are
already merged, add an empty commit with a `Release-As: X.Y.Z` footer — never rewrite history.

Do not merge the release PR, or any PR, unless the maintainer tells you to.

No AI/assistant attribution in commits or PRs — no Co-Authored-By trailers, no "generated
with" footers, no session links, from any agent.

Before opening a PR, run the checks listed under "Commands" in this file; the PR title must
be a Conventional Commit or CI rejects it.

## Commands

```bash
node scripts/validate-skills.mjs     # front matter, names, reference links, script syntax
bash scripts/install.sh --dry-run    # what installing would do on this machine
gitleaks git . --redact              # secret scan of the whole history
```
