#!/usr/bin/env node
// Checks every skill under skills/ before it can be merged:
//  - SKILL.md exists and starts with YAML front matter holding `name` and `description`
//  - `name` matches the folder, uses only lowercase letters, digits and hyphens, max 64 chars
//  - `description` is 1–1024 characters
//  - every `references/...` path a skill mentions exists in that skill's folder
//  - every .js file parses (syntax check only; nothing is executed)
// Exits non-zero with one line per problem.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const skillsDir = join(root, 'skills');
const problems = [];

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

if (!existsSync(skillsDir)) {
  console.error('No skills/ folder.');
  process.exit(1);
}

const skills = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory());
for (const name of skills) {
  const dir = join(skillsDir, name);
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) {
    problems.push(`${name}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(file, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) {
    problems.push(`${name}: SKILL.md must start with --- front matter ---`);
    continue;
  }
  const field = (key) => fm[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim();
  const fmName = field('name');
  const desc = field('description');
  if (fmName !== name) problems.push(`${name}: front matter name "${fmName}" must match the folder name`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64) problems.push(`${name}: folder name must be lowercase letters, digits and hyphens, max 64 chars`);
  if (!desc) problems.push(`${name}: front matter needs a description`);
  else if (desc.length > 1024) problems.push(`${name}: description is ${desc.length} chars (max 1024)`);

  const files = walk(dir);
  for (const f of files.filter((f) => f.endsWith('.md'))) {
    const body = readFileSync(f, 'utf8');
    for (const [, ref] of body.matchAll(/`(references\/[\w./-]+)`/g)) {
      if (!existsSync(join(dir, ref))) problems.push(`${name}: ${f.slice(dir.length + 1)} links to missing ${ref}`);
    }
  }
  for (const f of files.filter((f) => f.endsWith('.js'))) {
    try {
      // Skill scripts are bodies of async functions (Etch eval), so parse them that way.
      new (Object.getPrototypeOf(async () => {}).constructor)(readFileSync(f, 'utf8'));
    } catch (e) {
      problems.push(`${name}: ${f.slice(dir.length + 1)} does not parse: ${e.message}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`OK: ${skills.length} skills checked (${skills.join(', ')})`);
