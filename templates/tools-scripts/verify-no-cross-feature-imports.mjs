import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { getWorkspaceContext } from './_workspace.mjs';

function listFilesRecursive(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'dist' || e.name === 'node_modules' || e.name === '.angular') continue;
      listFilesRecursive(fp, out);
    } else if (e.isFile() && fp.endsWith('.ts')) {
      out.push(fp);
    }
  }
  return out;
}

function parseSource(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function getImports(sf) {
  const imports = [];
  sf.forEachChild((node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push(node.moduleSpecifier.text);
    }
  });
  return imports;
}

function featureOfFile(filePath) {
  const parts = filePath.split(path.sep);
  const idx = parts.lastIndexOf('features');
  if (idx === -1) return null;
  return parts[idx + 1] ?? null;
}

function resolveRelative(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  return path.resolve(path.dirname(fromFile), spec);
}

function main() {
  const ctx = getWorkspaceContext();
  const { workspaceRoot, featuresDir } = ctx;

  if (!fs.existsSync(featuresDir)) {
    console.log(
      `OK: no features directory found at ${path.relative(workspaceRoot, featuresDir)} (nothing to check).`,
    );
    return;
  }

  const featureFiles = listFilesRecursive(featuresDir);
  const errors = [];

  for (const fp of featureFiles) {
    const fromFeature = featureOfFile(fp);
    if (!fromFeature) continue;

    const sf = parseSource(fp);
    const imports = getImports(sf);

    for (const spec of imports) {
      const resolved = resolveRelative(fp, spec);
      if (!resolved) continue;

      if (!resolved.includes(path.join('features') + path.sep)) continue;

      const toFeature = featureOfFile(resolved);
      if (toFeature && toFeature !== fromFeature) {
        errors.push(
          `Cross-feature import is not allowed:\n` +
            `  from: ${path.relative(workspaceRoot, fp)} (feature=${fromFeature})\n` +
            `  import: ${spec}\n` +
            `  to-feature: ${toFeature}`,
        );
      }
    }
  }

  if (errors.length) {
    console.error(`Cross-feature import verification failed (${errors.length} issue(s)):\n`);
    for (const e of errors) console.error(`- ${e}\n`);
    process.exit(1);
  }

  console.log(
    `OK: no cross-feature relative imports detected in ${path.relative(workspaceRoot, featuresDir)}.`,
  );
}

main();
