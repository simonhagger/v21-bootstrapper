import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { getWorkspaceContext } from './_workspace.mjs';

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function parseSource(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function findExportedRoutesArray(sf) {
  let routesArray = null;

  function visit(node) {
    if (routesArray) return;
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!isExported) return;

      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue;
        if (decl.name.text !== 'routes') continue;
        if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) continue;
        routesArray = decl.initializer;
        return;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return routesArray;
}

function getPropName(propNameNode) {
  if (ts.isIdentifier(propNameNode)) return propNameNode.text;
  if (ts.isStringLiteral(propNameNode)) return propNameNode.text;
  return null;
}

function getPropInitializer(obj, propName) {
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const n = getPropName(p.name);
    if (n === propName) return p.initializer;
  }
  return null;
}

function getStringValue(node) {
  return ts.isStringLiteral(node) ? node.text : null;
}

function objectHasProp(obj, propName) {
  return obj.properties.some((p) => ts.isPropertyAssignment(p) && getPropName(p.name) === propName);
}

function loadChildrenLooksLikeFeaturesImport(init) {
  let ok = false;
  function visit(node) {
    if (ok) return;
    if (ts.isCallExpression(node) && ts.isImportKeyword(node.expression)) {
      const arg0 = node.arguments[0];
      if (arg0 && ts.isStringLiteral(arg0)) {
        if (arg0.text.startsWith('./features/') && arg0.text.endsWith('.routes')) ok = true;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(init);
  return ok;
}

function loadComponentLooksLikeNotFound(init) {
  let ok = false;
  function visit(node) {
    if (ok) return;
    if (ts.isCallExpression(node) && ts.isImportKeyword(node.expression)) {
      const arg0 = node.arguments[0];
      if (arg0 && ts.isStringLiteral(arg0)) {
        if (arg0.text === './shared/pages/not-found.page') ok = true;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(init);
  return ok;
}

function main() {
  const ctx = getWorkspaceContext();
  const { workspaceRoot, appRoutesFile } = ctx;

  if (!fs.existsSync(appRoutesFile)) die(`Missing app.routes.ts at: ${appRoutesFile}`);

  const sf = parseSource(appRoutesFile);
  const arr = findExportedRoutesArray(sf);
  if (!arr) die(`app.routes.ts must export const routes = [ ... ] (Angular CLI convention)`);

  const errors = [];
  let wildcardCount = 0;

  for (const el of arr.elements) {
    if (!ts.isObjectLiteralExpression(el)) {
      errors.push(`APP_ROUTES must contain only route objects.`);
      continue;
    }

    if (objectHasProp(el, 'component')) {
      errors.push(`app.routes.ts must not use "component:"; use loadChildren/loadComponent only.`);
    }

    const pathInit = getPropInitializer(el, 'path');
    const pathValue = pathInit ? getStringValue(pathInit) : null;
    if (pathValue == null) {
      errors.push(`Every app route must have a literal string "path".`);
      continue;
    }

    if (pathValue === '') {
      if (!objectHasProp(el, 'redirectTo') || !objectHasProp(el, 'pathMatch')) {
        errors.push(`Empty path route must be a redirect with redirectTo + pathMatch.`);
      }
      continue;
    }

    if (pathValue === '**') {
      wildcardCount++;
      const lc = getPropInitializer(el, 'loadComponent');
      if (!lc || !loadComponentLooksLikeNotFound(lc)) {
        errors.push(`Wildcard route must loadComponent from './shared/pages/not-found.page'.`);
      }
      continue;
    }

    const loadChildren = getPropInitializer(el, 'loadChildren');
    if (!loadChildren) {
      errors.push(`Route "${pathValue}" must use loadChildren for feature routes.`);
      continue;
    }

    if (!loadChildrenLooksLikeFeaturesImport(loadChildren)) {
      errors.push(
        `Route "${pathValue}" loadChildren must import './features/<feature>/<feature>.routes'.`,
      );
    }
  }

  if (wildcardCount !== 1) {
    errors.push(
      `APP_ROUTES must contain exactly one wildcard '**' route (found ${wildcardCount}).`,
    );
  }

  if (errors.length) {
    console.error(`App routes verification failed (${errors.length} issue(s)):\n`);
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  console.log(`OK: app.routes.ts verified (${path.relative(workspaceRoot, appRoutesFile)}).`);
}

main();
