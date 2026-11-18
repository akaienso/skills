// Read-only Etch site audit. Paste as the body of an Etch Studio MCP `eval`, or run
// through the Etch Connector (`etch-connector eval -t "<tab>" -f audit-script.js`).
// It never writes or saves. It opens each page/template to read its blocks, then
// returns the editor to where it was. Works on Etch Studio and EtchWP: namespaces
// the host does not back are skipped by capability, not by product name, and each
// check runs on its own so one failure does not hide the others.

const caps = etch.environment?.capabilities ?? {};
const out = { product: etch.environment?.product, version: etch.version, apiVersion: etch.apiVersion };
const check = async (key, fn) => {
  try { out[key] = await fn(); } catch (e) { out[key] = { error: e?.code ?? e?.message ?? String(e) }; }
};

const walk = (v, visit) => {
  if (Array.isArray(v)) v.forEach((x) => walk(x, visit));
  else if (v && typeof v === 'object') { visit(v); Object.values(v).forEach((x) => walk(x, visit)); }
};

// 1. Documents: every page/record and template, block trees read one at a time.
const docs = {};
await check('documents', async () => {
  const place = etch.navigation.getCurrentPlace?.();
  try {
    if (caps.content) {
      for (const type of await etch.content.listTypesAsync()) {
        if (type.isTemplate) continue;
        for (const item of await etch.content.listItemsAsync(type.key)) {
          await etch.navigation.openPostAsync(item.id);
          docs[`${type.key}:${item.title}`] = etch.blocks.getTree();
        }
      }
    }
    if (caps.templates) {
      for (const t of await etch.navigation.listTemplatesAsync()) {
        await etch.navigation.openTemplateAsync(t.id);
        docs[`template:${t.title}`] = etch.blocks.getTree();
      }
    }
  } finally {
    if (place) await etch.navigation.goTo(place);
  }
  for (const c of etch.components.list()) docs[`component:${c.name}`] = etch.components.getJson(c.id);
  return Object.keys(docs).length;
});

// 2. Markup findings.
const used = new Set();
await check('markup', async () => {
  const plainImgs = new Set();
  const componentUse = {};
  for (const [where, tree] of Object.entries(docs)) {
    walk(tree, (b) => {
      const cls = b.attributes?.class;
      if (typeof cls === 'string') cls.split(/\s+/).filter((c) => c && !c.includes('{')).forEach((c) => used.add(c));
      if (b.type === 'etch/element' && b.tag === 'img') plainImgs.add(where);
      if (b.type === 'etch/component') componentUse[b.componentId] = (componentUse[b.componentId] ?? 0) + 1;
    });
  }
  return {
    plainImgElements: [...plainImgs],
    unusedComponents: etch.components.list().filter((c) => !componentUse[c.id]).map((c) => c.name),
  };
});

// 3. Styles: unused selectors, empty selectors, classes with no selector, hard-coded values.
await check('styles', async () => {
  const styles = etch.styles.list();
  const cssOf = (s) => s.css ?? etch.styles.get?.(s.id)?.css ?? '';
  const classSelectors = styles.filter((s) => /^\.[\w-]+$/.test(s.selector));
  const defined = new Set(classSelectors.map((s) => s.selector.slice(1)));
  return {
    total: styles.length,
    unusedSelectors: classSelectors.filter((s) => !used.has(s.selector.slice(1))).map((s) => s.selector),
    emptySelectors: classSelectors.filter((s) => !cssOf(s).trim()).map((s) => s.selector),
    classesWithoutSelector: [...used].filter((c) => !defined.has(c)).sort(), // usually ACSS utilities: confirm each
    hardCodedColors: styles.filter((s) => /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(cssOf(s))).map((s) => s.selector),
    rawRemOrPx: styles.filter((s) => /(?<![\w-])\d*\.?\d+(rem|px)\b/.test(cssOf(s).replace(/to-rem\([^)]*\)/g, ''))).map((s) => s.selector),
  };
});

// 4. Stylesheets: class rules in a stylesheet are a deploy bug (duplicate empty selectors).
await check('stylesheets', async () => etch.stylesheets.list().map((sh) => {
  const css = etch.stylesheets.get(sh.id)?.css ?? '';
  return { name: sh.name, bytes: css.length, classRules: (css.match(/(^|\})\s*\.[\w-]+[^{]*\{/g) ?? []).length };
}));

// 5. Surfaces only some hosts back.
if (caps.routes) {
  await check('paths', async () => {
    const paths = await etch.routes.getPathsAsync();
    const byStatus = {};
    for (const p of paths) byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    return { total: paths.length, byStatus, notPublished: paths.filter((p) => p.status !== 'published').slice(0, 25).map((p) => `${p.path} (${p.status})`) };
  });
  await check('seo', async () => {
    const seo = await etch.routes.listSeoAsync();
    return {
      pages: seo.length,
      noTitle: seo.filter((p) => !p.title).slice(0, 25).map((p) => p.path),
      noDescription: seo.filter((p) => !p.description).slice(0, 25).map((p) => p.path),
      noindex: seo.filter((p) => p.noindex).map((p) => p.path), // confirm intended; a noindex home page is serious
    };
  });
}
if (caps.assets) {
  await check('assets', async () => {
    const assets = await etch.assets.listAsync();
    return {
      total: assets.length,
      uncollected: assets.filter((a) => !a.collectionIds?.length).map((a) => `${a.id} ${a.fileName}`).slice(0, 50),
      imagesWithoutAlt: assets.filter((a) => /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(a.fileName ?? '') && !a.alt).length,
    };
  });
}
if (caps.dataSources) await check('dataSources', async () => etch.dataSources.list().map((d) => `${d.key} (${d.type})`));
if (caps.templates) await check('templates', async () => (await etch.navigation.listTemplatesAsync()).map((t) => t.title));
await check('acssEnabled', async () => etch.skills.list().some((k) => (k.name ?? k) === 'acss'));

return out;
