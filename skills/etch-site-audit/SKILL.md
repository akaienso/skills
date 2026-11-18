---
name: etch-site-audit
description: Read-only maintenance audit of an Etch Studio project - unpublished or conflicting routes, SEO gaps, assets without collections or alt text, and empty class selectors. Use when the user asks to check, maintain or tidy an Etch Studio site before or after changes. Reports only; it never edits.
---

# Etch site audit (Etch Studio)

Reports problems. It writes nothing. Fix only what the user asks you to fix.

## Steps

1. Open the project with `open_project`, then call `get_guide` once.
2. Run the audit below with `eval { handle, code }`.
3. Report counts and a few sample ids. Name each finding and say what it may cause.
4. Close with `close_project { handle, save: false }` when nothing was edited. Use `save: true` only after real changes.

## Audit script

This script runs as the body of an async function with `etch` in scope. Each check runs alone, so one failing check does not hide the others.

```js
const out = {};
const tryIt = async (k, fn) => { try { out[k] = await fn(); } catch (e) { out[k] = { error: e.code ?? e.message }; } };

// Classes that ACSS or Oh My Etch generate. They show up as empty selectors but are not authored by the project.
const generated = /^\.(btn|text|bg|link|section|width|icon|header|ome)(--|-)/;

await tryIt("paths", async () => {
  const p = await etch.routes.getPathsAsync();
  const problems = p.filter(x => ["shadowed", "conflict", "invalid"].includes(x.status));
  return { total: p.length, problems: problems.slice(0, 20).map(x => ({ path: x.path, status: x.status })) };
});

await tryIt("seo", async () => {
  const s = await etch.routes.listSeoAsync();
  return {
    pages: s.length,
    noTitle: s.filter(x => !x.title).map(x => x.path).slice(0, 20),
    noDescription: s.filter(x => !x.description).map(x => x.path).slice(0, 20),
    noindex: s.filter(x => x.noindex).map(x => x.path)
  };
});

await tryIt("assets", async () => {
  const a = await etch.assets.listAsync();
  return {
    total: a.length,
    uncollected: a.filter(x => !x.collectionIds || x.collectionIds.length === 0).map(x => ({ id: x.id, fileName: x.fileName })).slice(0, 50),
    missingAlt: a.filter(x => !x.alt).length
  };
});

await tryIt("emptyClassSelectors", async () => {
  const s = etch.styles.list();
  const empty = s.filter(x => String(x.selector).startsWith(".") && !generated.test(x.selector) && !String(x.css || "").trim());
  return { total: s.length, emptyAuthored: empty.length, sample: empty.map(x => x.selector).slice(0, 30) };
});

await tryIt("dataSources", async () => {
  const d = etch.dataSources.list();
  return { count: d.length, keys: d.map(x => x.key) };
});

await tryIt("templates", async () => (await etch.navigation.listTemplatesAsync()).map(t => ({ id: t.id, name: t.name })));

return out;
```

## Reading the result

- `paths.problems`: a `shadowed` path is hidden by another route. A `conflict` path clashes with a sibling. An `invalid` path has a bad segment or no template. None of them publish.
- `seo.noindex`: pages set to noindex. Confirm that is intended. A home page set to noindex is a serious finding.
- `seo.noTitle` and `seo.noDescription`: check the ancestor route first, because the value may be inherited from it.
- `assets.uncollected`: each asset should sit in a collection. `assets.missingAlt` counts images without alt text. Set alt on images that are content, and leave decorative ones empty.
- `emptyClassSelectors.emptyAuthored`: an authored class with no CSS is not always a bug. Report the count and the sample. The real risk is a selector that is empty in `etch.styles` but also written into a stylesheet. That duplicate breaks the deploy.
- The `generated` filter hides ACSS and Oh My Etch classes, which are linked to blocks and empty by design.

## Tested

Run on a live test project, with no edits. Results:
- Paths: 5, none with a problem.
- SEO: 5 pages, all 5 `noindex`, and all 5 with no description.
- Assets: 40, none uncollected, all 40 without alt text.
- Classes: 340 selectors, 36 authored and empty after the ACSS/OME filter (52 before it).
- Data sources: 6 (`archive`, `test`, `global`, `news`, `events`, `board`). Templates: 1 (`Index`).

Failure case: `etch.loops.list()` is not a function in this build. The guide says the call should throw `NOT_AVAILABLE`. Catch both, because the error is a TypeError here.

## Not covered

- Block scripts with base64 `script.code`. Reading block trees was not verified, so this check is not in the script.
- Visual problems. Use `screenshot` for those.
