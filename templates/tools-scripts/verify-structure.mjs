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

function getImports(sourceFile) {
  const imports = [];
  sourceFile.forEachChild((node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push(node.moduleSpecifier.text);
    }
  });
  return imports;
}

function fileContainsIdentifier(sourceFile, identifierText) {
  let found = false;
  function visit(node) {
    if (found) return;
    if (ts.isIdentifier(node) && node.text === identifierText) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function fileContainsLiteral(sourceFile, literalText) {
  let found = false;
  function visit(node) {
    if (found) return;
    if (ts.isStringLiteral(node) && node.text === literalText) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function listDirs(dir) {
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function listFilesRecursive(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.angular') continue;
      listFilesRecursive(fp, out);
    } else if (e.isFile()) {
      out.push(fp);
    }
  }
  return out;
}

function findExportedRoutesArrays(sf) {
  const exports = [];

  function visit(node) {
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!isExported) return;

      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue;
        if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) continue;
        exports.push({ name: decl.name.text, arrayNode: decl.initializer });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return exports;
}

function routeObjectHasProviders(routeObj) {
  for (const prop of routeObj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const n = prop.name;
    const name = ts.isIdentifier(n) ? n.text : ts.isStringLiteral(n) ? n.text : null;
    if (name === 'providers') return true;
  }
  return false;
}

function verifyFeatureFolder(featureDir, featureName) {
  const required = [
    `${featureName}.routes.ts`,
    `${featureName}.page.ts`,
    `${featureName}.data.ts`,
    `${featureName}.state.ts`,
  ];
  const missing = required.filter((f) => !exists(path.join(featureDir, f)));
  return missing;
}

function verifyNoStaticPageImportsInAppRoutes(appRoutesFile) {
  if (!exists(appRoutesFile)) return [`Missing ${appRoutesFile}`];

  const sf = parseSource(appRoutesFile);
  const imports = getImports(sf);

  const bad = imports.filter((s) => s.includes('.page'));
  if (bad.length) {
    return [
      `app.routes.ts must not statically import pages. Found:\n` +
        bad.map((b) => `  - ${b}`).join('\n'),
    ];
  }
  return [];
}

function verifyNoHttpClientInDisallowedFiles(files) {
  const errors = [];
  for (const fp of files) {
    if (
      fp.endsWith('.page.ts') ||
      fp.endsWith('.state.ts') ||
      fp.endsWith('.guard.ts') ||
      fp.endsWith('.guards.ts')
    ) {
      const sf = parseSource(fp);
      const imports = getImports(sf);
      const importsHttp = imports.includes('@angular/common/http');
      const mentionsHttpClient = fileContainsIdentifier(sf, 'HttpClient');
      if (importsHttp && mentionsHttpClient) {
        errors.push(`HttpClient is not allowed in ${fp} (use *.data.ts or core/api).`);
      }
    }
  }
  return errors;
}

function verifyNoProvidedInRootInFeatures(files, featuresDir) {
  const errors = [];
  for (const fp of files) {
    if (!fp.startsWith(featuresDir + path.sep)) continue;
    if (!fp.endsWith('.ts')) continue;

    const sf = parseSource(fp);
    const hasProvidedIn = fileContainsIdentifier(sf, 'providedIn');
    const hasRootLiteral = fileContainsLiteral(sf, 'root');

    if (hasProvidedIn && hasRootLiteral) {
      errors.push(
        `Avoid providedIn: 'root' in features: ${fp}. Provide via route-level providers.`,
      );
    }
  }
  return errors;
}

function verifyFeatureRouteProviders(featureDir, featureName) {
  const filePath = path.join(featureDir, `${featureName}.routes.ts`);
  if (!exists(filePath)) return [`Missing ${filePath}`];

  const sf = parseSource(filePath);
  const exportedArrays = findExportedRoutesArrays(sf);
  if (!exportedArrays.length) {
    return [`${filePath} must export a Routes array: export const ... = [ ... ]`];
  }

  const errors = [];
  for (const ex of exportedArrays) {
    const first = ex.arrayNode.elements[0];
    if (!first || !ts.isObjectLiteralExpression(first)) {
      errors.push(`${filePath} export "${ex.name}" must start with a route object.`);
      continue;
    }
    if (!routeObjectHasProviders(first)) {
      errors.push(`${filePath} export "${ex.name}" first route must declare providers: [ ... ].`);
    }
  }

  return errors;
}

function main() {
  const ctx = getWorkspaceContext();
  const { workspaceRoot, appRoot, featuresDir, appRoutesFile } = ctx;

  const errors = [];

  if (!exists(appRoot)) errors.push(`App root not found: ${appRoot}`);
  if (!exists(featuresDir)) errors.push(`Features dir not found: ${featuresDir}`);

  const featureNames = listDirs(featuresDir);
  if (!featureNames.length) {
    errors.push(
      `No feature folders found in ${featuresDir}. Create at least one feature via pnpm gen:feature.`,
    );
  }

  for (const f of featureNames) {
    const featureDir = path.join(featuresDir, f);
    const missing = verifyFeatureFolder(featureDir, f);
    if (missing.length) {
      errors.push(
        `Feature "${f}" missing required files:\n` +
          missing.map((m) => `  - ${path.join(featureDir, m)}`).join('\n'),
      );
    }
  }

  errors.push(...verifyNoStaticPageImportsInAppRoutes(appRoutesFile));

  if (exists(appRoot)) {
    const appFiles = listFilesRecursive(appRoot).filter((fp) => fp.endsWith('.ts'));
    errors.push(...verifyNoHttpClientInDisallowedFiles(appFiles));
    errors.push(...verifyNoProvidedInRootInFeatures(appFiles, featuresDir));

    for (const f of featureNames) {
      errors.push(...verifyFeatureRouteProviders(path.join(featuresDir, f), f));
    }
  }

  if (errors.length) {
    console.error(`Structure verification failed (${errors.length} issue(s)):\n`);
    for (const e of errors) console.error(`- ${e}\n`);
    process.exit(1);
  }

  console.log(
    `OK: structure verified for appRoot=${path.relative(workspaceRoot, appRoot)} (${featureNames.length} feature(s)).`,
  );
}

main();
