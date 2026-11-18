# Contributing

Thanks for helping. Each change here affects what agents do on live client sites, so keep claims exact.

## Workflow

1. Open an issue first if the change is large or changes a skill's rules.
2. Create a branch with a semantic name: `type/short-description`. Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `revert`. Examples: `feat/forms-guidance`, `fix/redirect-status`.
3. Make the change. Run the checks below.
4. Open a pull request into `main`. Give it a Conventional Commit title, for example `fix: correct the image key note in etchwp-build`.
5. Pull requests are squash-merged, and the title becomes the commit message.

`main` is protected. Direct pushes are not allowed, and every change needs a pull request.

## Commit and PR title types

| Type | Effect |
|---|---|
| `feat` | A new skill, or a new section in a skill |
| `fix` | A corrected fact, rule or command |
| `docs` | README or this file |
| `chore` | Repository housekeeping: `.gitignore`, folder layout |

## Writing a skill

- One folder per skill under `skills/`, containing one `SKILL.md`.
- Front matter: `name` (matches the folder name) and `description` (say when to use the skill, in one or two sentences).
- Keep the file small. Put only what an agent needs for the job. Link to an external source rather than copying it.
- State the source for each fact. If you could not check a fact on a live project, say so in a **Known conflicts** or **Unverified** section.
- Do not copy another vendor's guide into a skill. Summarise it and link to it.
- Use the platform's live guide and API output as the authority. A written doc comes second.

## Checks before a pull request

- Each `SKILL.md` starts with valid front matter (`name`, `description`).
- Run a secret scan: `gitleaks detect --source . --redact`.
- Search your change for client or project names, tenant IDs, project IDs and personal details. Remove any you find.
- If you changed a rule, say what you tested and on which product and version. A read-only probe is enough when it is labelled as one.

## Security

Do not open a public issue for a leaked secret. Tell the repository owner privately, then rotate the secret.

## Licence

No licence has been chosen yet. Contributions will be licensed under the same terms as the rest of the repository once one is added.
