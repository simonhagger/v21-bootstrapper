import fs from 'node:fs';
import path from 'node:path';
import { getWorkspaceContext } from './_workspace.mjs';

function die(msg) {
  console.error(msg);
  process.exit(1);
}

function toKebab(input) {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toPascal(input) {
  const kebab = toKebab(input);
  return kebab
    .split('-')
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
}

function toConst(input) {
  return toKebab(input).toUpperCase().replace(/-/g, '_');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFileSafe(fp, content, overwrite) {
  if (fs.existsSync(fp) && !overwrite) {
    die(`Refusing to overwrite existing file: ${fp}\nUse --overwrite to force.`);
  }
  fs.writeFileSync(fp, content, 'utf8');
}

function renderTemplates({ featureKebab, featurePascal, featureConst }) {
  const f = featureKebab;

  return {
    routes: `import { Routes } from '@angular/router';
import { provideFeatureState } from './${f}.state';
import { provideFeatureData } from './${f}.data';

export const ${featureConst}_ROUTES: Routes = [
  {
    path: '',
    providers: [provideFeatureData(), provideFeatureState()],
    loadComponent: () => import('./${f}.page').then((m) => m.${featurePascal}Page),
    title: '${featurePascal}',
  },
];
`,
    page: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ${featurePascal}Store } from './${f}.state';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: \`
    <section class="bg-background text-on-background">
      <h1 class="text-xl font-semibold text-on-surface">${featurePascal}</h1>

      <div class="mt-4">
        <p class="text-sm text-on-surface-variant">Status: {{ store.status() }}</p>
      </div>
    </section>
  \`,
})
export class ${featurePascal}Page {
  readonly store = inject(${featurePascal}Store);

  constructor() {
    void this.store.init();
  }
}
`,
    models: `export interface ${featurePascal}Summary {
  updatedAt: string;
}
`,
    data: `import { Injectable, Provider } from '@angular/core';
import { of, delay } from 'rxjs';
import type { Observable } from 'rxjs';

import type { ${featurePascal}Summary } from './${f}.models';

@Injectable()
export class ${featurePascal}Data {
  getSummary(): Observable<${featurePascal}Summary> {
    // TODO: Replace with actual HTTP call when backend is ready
    // Example: return this.http.get<${featurePascal}Summary>('/api/${f}/summary');
    return of({ updatedAt: new Date().toISOString() }).pipe(delay(300));
  }
}

export function provideFeatureData(): Provider {
  return ${featurePascal}Data;
}
`,
    state: `import { inject, Injectable, Provider, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ${featurePascal}Data } from './${f}.data';

export type ${featurePascal}Status = 'idle' | 'loading' | 'ready' | 'error';

@Injectable()
export class ${featurePascal}Store {
  private readonly data = inject(${featurePascal}Data);

  readonly status = signal<${featurePascal}Status>('idle');

  async init() {
    if (this.status() !== 'idle') return;
    this.status.set('loading');
    try {
      await firstValueFrom(this.data.getSummary());
      this.status.set('ready');
    } catch {
      this.status.set('error');
    }
  }
}

export function provideFeatureState(): Provider {
  return ${featurePascal}Store;
}
`,
    readme: `# ${featurePascal} Feature

Conventions:
- Route definition: \`${f}.routes.ts\`
- Routed component: \`${f}.page.ts\`
- Data access: \`${f}.data.ts\`
- Feature state/store: \`${f}.state.ts\`

This folder is a vertical slice and must not be imported from other feature folders.
`,
  };
}

function addRouteToAppRoutes(appRoutesFile, { routePath, featureKebab, featureConst }) {
  if (!fs.existsSync(appRoutesFile)) die(`Cannot find app.routes.ts at ${appRoutesFile}`);
  const src = fs.readFileSync(appRoutesFile, 'utf8');

  const needle = `path: '${routePath}'`;
  if (src.includes(needle)) {
    console.log(`app.routes.ts already contains route "${routePath}". Skipping insertion.`);
    return;
  }

  const insertion = `  {
    path: '${routePath}',
    loadChildren: () =>
      import('./features/${featureKebab}/${featureKebab}.routes').then((m) => m.${featureConst}_ROUTES),
  },
`;

  const wildcardIndex = src.indexOf("path: '**'");
  if (wildcardIndex !== -1) {
    const before = src.slice(0, wildcardIndex);
    const after = src.slice(wildcardIndex);
    const insertPos = before.lastIndexOf('  {');
    if (insertPos === -1) {
      fs.writeFileSync(appRoutesFile, before + insertion + after, 'utf8');
      return;
    }
    fs.writeFileSync(
      appRoutesFile,
      before.slice(0, insertPos) + insertion + before.slice(insertPos) + after,
      'utf8',
    );
    return;
  }

  const closing = src.lastIndexOf('];');
  if (closing === -1) die(`Could not locate end of APP_ROUTES array in app.routes.ts`);
  fs.writeFileSync(appRoutesFile, src.slice(0, closing) + insertion + src.slice(closing), 'utf8');
}

function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    die(
      `Usage:
  node tools/scripts/generate-feature.mjs <name> [--route <path>] [--register] [--overwrite]

Examples:
  node tools/scripts/generate-feature.mjs Settings --route settings --register
  node tools/scripts/generate-feature.mjs UserProfile --route settings/profile --register
`,
    );
  }

  const ctx = getWorkspaceContext();
  const { workspaceRoot, featuresDir, appRoutesFile } = ctx;

  const nameRaw = args[0];
  const overwrite = args.includes('--overwrite');
  const register = args.includes('--register');

  const routeIndex = args.indexOf('--route');
  const routePath = routeIndex !== -1 ? args[routeIndex + 1] : null;

  const featureKebab = toKebab(nameRaw);
  const featurePascal = toPascal(nameRaw);
  const featureConst = toConst(nameRaw);

  ensureDir(featuresDir);
  const featureDir = path.join(featuresDir, featureKebab);
  ensureDir(featureDir);

  const tpl = renderTemplates({ featureKebab, featurePascal, featureConst });

  writeFileSafe(path.join(featureDir, `${featureKebab}.routes.ts`), tpl.routes, overwrite);
  writeFileSafe(path.join(featureDir, `${featureKebab}.page.ts`), tpl.page, overwrite);
  writeFileSafe(path.join(featureDir, `${featureKebab}.data.ts`), tpl.data, overwrite);
  writeFileSafe(path.join(featureDir, `${featureKebab}.state.ts`), tpl.state, overwrite);
  writeFileSafe(path.join(featureDir, `${featureKebab}.models.ts`), tpl.models, overwrite);
  writeFileSafe(path.join(featureDir, `README.md`), tpl.readme, overwrite);

  console.log(`Created feature: ${featureKebab} at ${path.relative(workspaceRoot, featureDir)}`);

  if (register) {
    const route = routePath ?? featureKebab;
    addRouteToAppRoutes(appRoutesFile, { routePath: route, featureKebab, featureConst });
    console.log(`Registered route: /${route} in ${path.relative(workspaceRoot, appRoutesFile)}`);
  } else if (routePath) {
    console.log(`Note: --route provided but --register not set. No route registration performed.`);
  }
}

main();
