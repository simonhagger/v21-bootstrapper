param(
  [string]$Name = "acme-web",
  [int]$Cli = 21,
  [switch]$Force,
  [string]$TargetPath = ""
)

$ErrorActionPreference = "Stop"

function Require-Cmd($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Missing required command: $name" }
}

Require-Cmd git
Require-Cmd node
Require-Cmd pnpm

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Determine target directory
if ($TargetPath) {
  $repoRoot = $TargetPath
  if (-not (Test-Path $repoRoot)) {
    Write-Host "==> Creating target directory: $repoRoot"
    New-Item -ItemType Directory -Force -Path $repoRoot | Out-Null
  }
  Push-Location $repoRoot
} else {
  $repoRoot = (Get-Location).Path
}

if (-not (Test-Path ".git")) {
  Write-Host "==> Initializing git repository"
  git init -b main | Out-Null
  # Ensure branch name is set to main even if init flag unsupported
  git branch -M main | Out-Null
}

# Create Angular workspace at repo root (Angular creates a subfolder by default)
if (-not (Test-Path "angular.json")) {
  Write-Host "==> Creating Angular CLI workspace (v$Cli) with pnpm + strict"

  $tmp = New-Item -ItemType Directory -Force -Path ([System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString()))
  $tmpPath = $tmp.FullName

  Push-Location $tmpPath
  try {
    # Create minimal workspace (no default app)
    pnpm dlx "@angular/cli@$Cli" new $Name --package-manager=pnpm --strict --skip-git --skip-install --style=css --ssr=false --defaults --create-application=false
  } finally {
    Pop-Location
  }

  $workspace = Join-Path $tmpPath $Name
  if (-not (Test-Path $workspace)) { throw "Angular workspace was not created at $workspace" }

  # Copy workspace files (excluding node_modules) to target directory
  Write-Host "==> Copying workspace files to target directory"
  Get-ChildItem -Path $workspace -Force | Where-Object { $_.Name -ne 'node_modules' } | ForEach-Object {
    $dest = Join-Path $repoRoot $_.Name
    if (Test-Path $dest) {
      Remove-Item -Recurse -Force $dest
    }
    Copy-Item -Path $_.FullName -Destination $repoRoot -Recurse -Force
  }
  
  Push-Location $repoRoot
  try {
    # Generate the app directly in projects/web with correct structure
    Write-Host "==> Generating application in projects/web"
    pnpm exec ng generate application $Name --project-root=projects/web --style=css --ssr=false --routing=false --skip-git --skip-install | Out-Null
  } finally {
    Pop-Location
  }
  Remove-Item -Recurse -Force $tmpPath
}

# Fix app.routes.ts export name and initial route structure (run always)
Write-Host "==> Aligning app.routes.ts with architecture"
$routesFile = Join-Path $repoRoot "projects/web/src/app/app.routes.ts"
if (Test-Path $routesFile) {
  $newContent = @"
import type { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found.page').then((m) => m.NotFoundPage),
  },
];
"@
  Set-Content $routesFile $newContent -Encoding UTF8
}

# Fix app.config.ts to import APP_ROUTES instead of routes (run always)
Write-Host "==> Aligning app.config.ts with routes export"
$configFile = Join-Path $repoRoot "projects/web/src/app/app.config.ts"
if (Test-Path $configFile) {
  $content = Get-Content $configFile -Raw
  $content = $content -replace 'import { routes } from', 'import { APP_ROUTES } from'
  $content = $content -replace 'provideRouter\(routes\)', 'provideRouter(APP_ROUTES)'
  Set-Content $configFile $content -Encoding UTF8
}

# Create shared folder structure with not-found page (run always)
Write-Host "==> Creating shared structure with not-found page"
New-Item -ItemType Directory -Force -Path (Join-Path $repoRoot "projects/web/src/app/shared/pages") | Out-Null
node -e @'
const fs = require('fs');
const path = require('path');

const notFoundPageContent = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="p-8 text-center"><h1 class="text-2xl font-bold mb-4">Page Not Found</h1><p class="text-gray-600">The page you are looking for does not exist.</p></div>',
})
export class NotFoundPage {}
`;

fs.writeFileSync(
  path.join('projects/web/src/app/shared/pages/not-found.page.ts'),
  notFoundPageContent,
  'utf8'
);
'@

# Setup tsconfig files for the correctly placed app (run always if needed)
if (-not (Test-Path (Join-Path $repoRoot "projects/web/tsconfig.app.json"))) {
  Write-Host "==> Configuring TypeScript for projects/web"
  node -e @'
  const fs = require('fs');
  const path = require('path');

  // Create local tsconfig files inside projects/web for tooling discovery
  const webTsconfig = path.join('projects/web', 'tsconfig.json');
  const webTsconfigSpec = path.join('projects/web', 'tsconfig.spec.json');
  fs.writeFileSync(
    webTsconfig,
    JSON.stringify({ extends: '../../tsconfig.app.json' }, null, 2) + '\n'
  );
  fs.writeFileSync(
    webTsconfigSpec,
    JSON.stringify({ extends: '../../tsconfig.spec.json' }, null, 2) + '\n'
  );

  // Parse JSONC helper
  function parseJsonc(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    let result = '';
    let inString = false;
    let escaped = false;
    for (let i = 0; i < raw.length; i += 1) {
      const ch = raw[i];
      const next = raw[i + 1];
      if (inString) {
        result += ch;
        if (!escaped && ch === '"') inString = false;
        escaped = !escaped && ch === '\\';
        continue;
      }
      if (ch === '"') {
        inString = true;
        result += ch;
        continue;
      }
      if (ch === '/' && next === '/') {
        while (i < raw.length && raw[i] !== '\n') i += 1;
        result += '\n';
        continue;
      }
      if (ch === '/' && next === '*') {
        i += 2;
        while (i < raw.length - 1 && !(raw[i] === '*' && raw[i + 1] === '/')) {
          i += 1;
        }
        i += 1;
        continue;
      }
      result += ch;
    }
    return JSON.parse(result);
  }

  // Update tsconfig.app.json to explicitly include projects/web
  if (fs.existsSync('tsconfig.app.json')) {
    const appConfig = parseJsonc('tsconfig.app.json');
    appConfig.files = ['projects/web/src/main.ts'];
    appConfig.include = ['projects/web/src/**/*.ts', 'projects/web/src/**/*.d.ts'];
    appConfig.exclude = ['projects/web/src/**/*.spec.ts', 'projects/web/src/**/*.test.ts'];
    fs.writeFileSync('tsconfig.app.json', JSON.stringify(appConfig, null, 2) + '\n');
  }

  // Update tsconfig.spec.json to explicitly include projects/web
  if (fs.existsSync('tsconfig.spec.json')) {
    const specConfig = parseJsonc('tsconfig.spec.json');
    specConfig.include = [
      'projects/web/src/**/*.spec.ts',
      'projects/web/src/**/*.test.ts',
      'projects/web/src/**/*.d.ts'
    ];
    fs.writeFileSync('tsconfig.spec.json', JSON.stringify(specConfig, null, 2) + '\n');
  }
'@
}

# Install dependencies in target directory (run always)
Write-Host "==> Installing dependencies"
pnpm install

# Generate libraries
$libs = @("core","ui","tokens","a11y","shell")
Write-Host "==> Generating libraries (if missing)"
foreach ($lib in $libs) {
  if (Test-Path ("projects\" + $lib)) {
    Write-Host " - $lib exists; skipping"
  } else {
    pnpm exec ng generate library $lib
  }
}

# Install Material + Tailwind + theming dependencies
Write-Host "==> Installing Material Design + Tailwind dependencies"
pnpm add `
  "@angular/material" "@angular/cdk"

# Install tooling
Write-Host "==> Installing dev tooling dependencies"
pnpm add -D `
  tailwindcss "@tailwindcss/postcss" `
  eslint "@eslint/js" typescript-eslint angular-eslint `
  prettier prettier-plugin-tailwindcss `
  husky lint-staged `
  "@commitlint/cli" "@commitlint/config-conventional" `
  semantic-release `
  "@semantic-release/commit-analyzer" `
  "@semantic-release/release-notes-generator" `
  "@semantic-release/github" `
  "@semantic-release/changelog" `
  "@semantic-release/git" `
  "@vitest/coverage-v8"

# Write repo files/configs
Write-Host "==> Writing repo configuration files"
$writeArgs = @("-Force")
if ($Force) { $writeArgs += "-Force" }
pwsh (Join-Path $scriptDir "write-files.ps1") @writeArgs

# Create token source structure for M3 + Tailwind theming
Write-Host "==> Setting up token generation structure"
$tokenTemplateDir = Join-Path $scriptDir "templates/token-structure"

if (Test-Path $tokenTemplateDir) {
  # Ensure destination directories exist before copying
  New-Item -ItemType Directory -Force -Path "projects/tokens/src" | Out-Null
  New-Item -ItemType Directory -Force -Path "projects/tokens/src/source" | Out-Null
  New-Item -ItemType Directory -Force -Path "projects/tokens/src/mappings" | Out-Null
  New-Item -ItemType Directory -Force -Path "projects/tokens/src/generators" | Out-Null

  Copy-Item -Path (Join-Path $tokenTemplateDir "source/*") -Destination "projects/tokens/src/source" -Recurse -Force
  Copy-Item -Path (Join-Path $tokenTemplateDir "mappings/*") -Destination "projects/tokens/src/mappings" -Recurse -Force
  Copy-Item -Path (Join-Path $tokenTemplateDir "generators/*") -Destination "projects/tokens/src/generators" -Recurse -Force
  Copy-Item -Path (Join-Path $tokenTemplateDir "DIST_STRATEGY.md") -Destination "projects/tokens/" -Force
  Write-Host " - Token structure deployed"
} else {
  Write-Host " - Token structure templates not found (skipping)"
}

# Create core theme service
Write-Host "==> Setting up theme service"
$themeTemplateDir = Join-Path $scriptDir "templates/core-theme"

if (Test-Path $themeTemplateDir) {
  New-Item -ItemType Directory -Force -Path "projects/core/src/lib/theme" | Out-Null
  Copy-Item -Path (Join-Path $themeTemplateDir "*") -Destination "projects/core/src/lib/theme/" -Force
  Write-Host " - Theme service deployed"
} else {
  Write-Host " - Theme service templates not found (skipping)"
}

# Husky hooks (deterministic policy)
Write-Host "==> Initializing Husky hooks"
pnpm exec husky init | Out-Null

# Write hook files
if (-not (Test-Path ".husky")) { New-Item -ItemType Directory -Force ".husky" | Out-Null }

@"
#!/bin/sh
. "`$(dirname "`$0")/_/husky.sh"

pnpm exec lint-staged --allow-empty
"@ | Set-Content -Encoding Ascii ".husky/pre-commit"

@"
#!/bin/sh
. "`$(dirname "`$0")/_/husky.sh"

pnpm exec commitlint --edit "`$1"
"@ | Set-Content -Encoding Ascii ".husky/commit-msg"

@"
#!/bin/sh
. "`$(dirname "`$0")/_/husky.sh"

pnpm verify:structure
pnpm verify:app-routes
pnpm verify:feature-routes
pnpm verify:no-cross-feature-imports
pnpm verify:theme-contract
pnpm verify:no-raw-colors
pnpm verify:tokens
pnpm lint
pnpm typecheck
"@ | Set-Content -Encoding Ascii ".husky/pre-push"

# Ensure executable bit is set in git
git add .husky/pre-commit .husky/commit-msg .husky/pre-push | Out-Null

# Smoke checks
Write-Host "==> Running baseline gates"
pnpm format
pnpm typecheck
pnpm test:ci

Write-Host ""
Write-Host "==> Bootstrap complete! Now verifying the workspace..."
Write-Host ""
Write-Host "Running post-bootstrap verification..."
Write-Host ""

try {
  pnpm verify:post-bootstrap
  if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==> ✓ Workspace is ready for development!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1) Read the documentation:"
    Write-Host "     - README.md (project overview)"
    Write-Host "     - AI_AGENT_GUIDE.md (quick orientation)"
    Write-Host "     - POST_BOOTSTRAP_GUIDE.md (verification details)"
    Write-Host ""
    Write-Host "  2) Start development:"
    Write-Host "     pnpm start"
    Write-Host ""
    Write-Host "  3) Generate your first feature:"
    Write-Host "     pnpm gen:feature Dashboard --route dashboard --register"
    Write-Host ""
    Write-Host "  4) Review these guides:"
    Write-Host "     - DEVELOPMENT_GUIDE.md (daily workflows)"
    Write-Host "     - PATTERNS.md (common patterns)"
    Write-Host "     - API_GUIDE.md (backend integration)"
    Write-Host "     - ARCHITECTURE.md (architecture rules)"
    Write-Host ""
  } else {
    throw "Post-bootstrap verification failed with exit code $LASTEXITCODE"
  }
} catch {
  Write-Host "==> ⚠ Post-bootstrap verification had issues."
  Write-Host ""
  Write-Host "Please fix errors above and try:"
  Write-Host "  pnpm verify:post-bootstrap"
  Write-Host ""
  Write-Host "See POST_BOOTSTRAP_GUIDE.md for troubleshooting."
  exit 1
}
# Return to original directory if we changed it
if ($TargetPath) {
  Pop-Location
}