import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { getWorkspaceContext } from './_workspace.mjs';

function exists(p) {
  return fs.existsSync(p);
}

function parseSource(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function listFeatureNames(featuresDir) {
  if (!exists(featuresDir)) return [];
  return fs
    .readdirSync(featuresDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function getPropName(nameNode) {
  if (ts.isIdentifier(nameNode)) return nameNode.text;
  if (ts.isStringLiteral(nameNode)) return nameNode.text;
  return null;
}

function findExportedRoutesArrays(sf) {
  const exportedArrays = [];
  function visit(node) {
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!isExported) return;

      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue;
        if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) continue;
        exportedArrays.push({ name: decl.name.text, arrayNode: decl.initializer });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return exportedArrays;
}

function objectHasProp(obj, propName) {
  return obj.properties.some((p) => ts.isPropertyAssignment(p) && getPropName(p.name) === propName);
}

function getPropInitializer(obj, propName) {
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    if (getPropName(p.name) === propName) return p.initializer;
  }
  return null;
}

function getStringLiteral(node) {
  return ts.isStringLiteral(node) ? node.text : null;
}

function loadComponentImportsPage(init) {
  let ok = false;
  function visit(node) {
    if (ok) return;
    if (ts.isCallExpression(node) && ts.isImportKeyword(node.expression)) {
      const arg0 = node.arguments[0];
      if (arg0 && ts.isStringLiteral(arg0) && arg0.text.endsWith('.page')) ok = true;
    }
    ts.forEachChild(node, visit);
  }
  visit(init);
  return ok;
}

function validateFeatureRoutesFile(filePath) {
  const sf = parseSource(filePath);
  const exported = findExportedRoutesArrays(sf);

  const errors = [];
  if (!exported.length) {
    errors.push(`${filePath} must export at least one Routes array: export const X = [ ... ]`);
    return errors;
  }

  for (const ex of exported) {
    if (!ex.arrayNode.elements.length) {
      errors.push(`${filePath} export "${ex.name}" must not be empty.`);
      continue;
    }

    ex.arrayNode.elements.forEach((el, idx) => {
      if (!ts.isObjectLiteralExpression(el)) {
        errors.push(`${filePath} export "${ex.name}" has a non-object route at index ${idx}.`);
        return;
      }

      if (objectHasProp(el, 'component')) {
        errors.push(
          `${filePath} export "${ex.name}" must not use "component:". Use loadComponent/loadChildren.`,
        );
      }

      if (idx === 0) {
        const p = getPropInitializer(el, 'path');
        const pv = p ? getStringLiteral(p) : null;
        if (pv !== '')
          errors.push(`${filePath} export "${ex.name}" first route must have path: ''`);

        if (!objectHasProp(el, 'providers')) {
          errors.push(
            `${filePath} export "${ex.name}" first route must declare providers: [ ... ]`,
          );
        }

        const hasLC = objectHasProp(el, 'loadComponent');
        const hasLCh = objectHasProp(el, 'loadChildren');
        if (!hasLC && !hasLCh) {
          errors.push(
            `${filePath} export "${ex.name}" first route must use loadComponent or loadChildren`,
          );
        }

        if (hasLC) {
          const init = getPropInitializer(el, 'loadComponent');
          if (init && !loadComponentImportsPage(init)) {
            errors.push(
              `${filePath} export "${ex.name}" first route loadComponent should import a *.page file`,
            );
          }
        }
      }

      const lc = getPropInitializer(el, 'loadComponent');
      if (lc && !loadComponentImportsPage(lc)) {
        errors.push(
          `${filePath} export "${ex.name}" has loadComponent not importing a *.page file`,
        );
      }
    });
  }

  return errors;
}

function main() {
  const ctx = getWorkspaceContext();
  const { workspaceRoot, featuresDir } = ctx;

  const features = listFeatureNames(featuresDir);
  const errors = [];

  for (const f of features) {
    const routesFile = path.join(featuresDir, f, `${f}.routes.ts`);
    if (!exists(routesFile)) {
      errors.push(`Missing feature routes file: ${routesFile}`);
      continue;
    }
    errors.push(...validateFeatureRoutesFile(routesFile));
  }

  if (errors.length) {
    console.error(`Feature routes verification failed (${errors.length} issue(s)):\n`);
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  console.log(
    `OK: feature routes verified (${features.length} feature(s)) for ${path.relative(workspaceRoot, featuresDir)}.`,
  );
}

main();
