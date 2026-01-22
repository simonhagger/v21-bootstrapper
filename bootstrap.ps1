param(
  [string]$Name = "acme-web",
  [int]$Cli = 21,
  [switch]$Force,
  [string]$TargetPath = "E:\ANGULAR\bootstrapped"
)

$ErrorActionPreference = "Stop"

# Normalize TargetPath to prevent redundant nesting
# If TargetPath ends with the app Name, use its parent directory instead
$targetBaseName = Split-Path -Leaf $TargetPath
if ($targetBaseName -eq $Name) {
  $TargetPath = Split-Path -Parent $TargetPath
}

function Require-Cmd($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Missing required command: $name" }
}

Require-Cmd node
Require-Cmd pnpm

# Prepare target directory
# Only delete the specific app folder if it already exists, not the entire TargetPath
$appPath = Join-Path $TargetPath $Name

if (Test-Path $appPath) {
  if ($Force) {
    Write-Host "==> Removing existing app folder: $appPath"
    try {
      Remove-Item -Path $appPath -Recurse -Force -ErrorAction Stop
    } catch {
      Write-Error "Failed to remove existing app folder: $_"
      exit 1
    }
  } else {
    throw "App folder already exists at $appPath. Use -Force to overwrite"
  }
} else {
  # Ensure parent TargetPath exists
  if (-not (Test-Path $TargetPath)) {
    New-Item -ItemType Directory -Force -Path $TargetPath | Out-Null
  }
}
Push-Location $TargetPath

Write-Host "==> Scaffolding Angular workspace v$Cli with pnpm"
npx -y "@angular/cli@$Cli" new $Name `
  --defaults `
  --skip-git `
  --skip-tests `
  --style=scss `
  --package-manager=pnpm 2>&1 | Out-Null

Push-Location (Join-Path $TargetPath $Name)

Write-Host "==> Adding Tailwind CSS"
pnpm exec ng add tailwindcss --skip-confirmation 2>&1 | Out-Null

Write-Host "==> Adding Angular Material"
pnpm exec ng add @angular/material `
  --skip-confirmation `
  --theme=custom `
  --typography=true `
  --animations=true 2>&1 | Out-Null

Write-Host "==> Adding Playwright for E2E testing"
pnpm add -D @playwright/test 2>&1 | Out-Null

# Post-scaffold: copy curated templates (app core, features/, shared/, config files)
try {
  $tplRoot = Join-Path $PSScriptRoot "templates\\web-app\\src"
  $rootTpl = Join-Path $PSScriptRoot "templates\\root"
  $appRoot = Join-Path (Get-Location) "src"
  $projRoot = Get-Location

  Write-Host "==> Applying curated templates"

  # Copy src-level files (styles, tailwind config)
  $srcFiles = @('styles.scss', 'tailwind.css')
  foreach ($f in $srcFiles) {
    $srcFile = Join-Path $tplRoot $f
    $dstFile = Join-Path $appRoot $f
    if (Test-Path $srcFile) {
      Copy-Item -Path $srcFile -Destination $dstFile -Force
      Write-Host "   - $f updated"
    }
  }

  # Copy core app files (app.ts has layout integration, app.routes.ts has feature routing)
  $coreFiles = @('app.ts','app.routes.ts')
  foreach ($f in $coreFiles) {
    $srcFile = Join-Path $tplRoot (Join-Path "app" $f)
    $dstFile = Join-Path $appRoot (Join-Path "app" $f)
    if (Test-Path $srcFile) {
      Copy-Item -Path $srcFile -Destination $dstFile -Force
      Write-Host "   - app/$f updated"
    }
  }

  # Copy features/ and shared/
  $dirs = @('features','shared')
  foreach ($d in $dirs) {
    $srcDir = Join-Path $tplRoot (Join-Path "app" $d)
    $dstDir = Join-Path $appRoot (Join-Path "app" $d)
    if (Test-Path $srcDir) {
      Copy-Item -Path $srcDir -Destination $dstDir -Recurse -Force
      Write-Host "   - app/$d copied"
    }
  }

  # Copy root config files (Prettier, ESLint, VSCode settings, git config, Playwright)
  $rootFiles = @('.prettierrc.json', 'eslint.config.mjs', 'commitlint.config.cjs', '.gitattributes', '.gitignore', 'playwright.config.ts')
  foreach ($f in $rootFiles) {
    $srcFile = Join-Path $rootTpl $f
    $dstFile = Join-Path $projRoot $f
    if (Test-Path $srcFile) {
      Copy-Item -Path $srcFile -Destination $dstFile -Force
      Write-Host "   - $f copied"
    }
  }

  # Copy .vscode directory (settings, extensions)
  $vscodeSrc = Join-Path $rootTpl ".vscode"
  $vscodeDst = Join-Path $projRoot ".vscode"
  if (Test-Path $vscodeSrc) {
    Copy-Item -Path $vscodeSrc -Destination $vscodeDst -Recurse -Force
    Write-Host "   - .vscode/ copied"
  }

  # Copy .github directory (workflows, PR template, CODEOWNERS)
  $githubSrc = Join-Path $rootTpl ".github"
  $githubDst = Join-Path $projRoot ".github"
  if (Test-Path $githubSrc) {
    Copy-Item -Path $githubSrc -Destination $githubDst -Recurse -Force
    Write-Host "   - .github/ copied (CI workflows, PR template, CODEOWNERS)"
  }

  # Copy tools/scripts directory (verification and generation scripts)
  $toolsScriptsSrc = Join-Path $PSScriptRoot "templates\\tools-scripts"
  $toolsScriptsDst = Join-Path $projRoot "tools\\scripts"
  if (Test-Path $toolsScriptsSrc) {
    New-Item -ItemType Directory -Force -Path $toolsScriptsDst | Out-Null
    Copy-Item -Path (Join-Path $toolsScriptsSrc "*") -Destination $toolsScriptsDst -Recurse -Force
    Write-Host "   - tools/scripts/ copied (verification + generation scripts)"
  }

  # Copy e2e directory (Playwright tests)
  $e2eSrc = Join-Path $rootTpl "e2e"
  $e2eDst = Join-Path $projRoot "e2e"
  if (Test-Path $e2eSrc) {
    Copy-Item -Path $e2eSrc -Destination $e2eDst -Recurse -Force
    Write-Host "   - e2e/ copied (Playwright E2E test examples and fixtures)"
  }

} catch {
  Write-Warning "Template copy step encountered an issue: $_"
}

# Install Prettier and ESLint dev dependencies
try {
  Write-Host "==> Installing Prettier and ESLint"
  pnpm add -D prettier prettier-plugin-tailwindcss eslint @eslint/js typescript-eslint angular-eslint | Out-Null
  Write-Host "   - Dev dependencies installed"
} catch {
  Write-Warning "Failed to install Prettier/ESLint dependencies: $_"
}

# Initialize git repository and configure pre-commit hooks
try {
  $projRoot = Get-Location

  Write-Host "==> Initializing git repository"
  git init -b main | Out-Null
  git branch -M main | Out-Null
  git config user.email "dev@workspace.local" | Out-Null
  git config user.name "Dev Setup" | Out-Null
  git config core.safecrlf false | Out-Null
  git config core.eol lf | Out-Null

  Write-Host "==> Installing Husky and commitlint"
  pnpm add -D husky @commitlint/cli @commitlint/config-conventional | Out-Null

  Write-Host "==> Initializing Husky"
  pnpm exec husky init | Out-Null

  Write-Host "==> Applying pre-commit hooks"
  $huskyTpl = Join-Path $PSScriptRoot "templates\\root\\.husky"
  $huskyDst = Join-Path $projRoot ".husky"

  if (Test-Path $huskyTpl) {
    # Copy hook files (pre-commit, commit-msg, pre-push)
    Get-ChildItem -Path $huskyTpl -File | ForEach-Object {
      $srcHook = $_.FullName
      $dstHook = Join-Path $huskyDst $_.Name
      Copy-Item -Path $srcHook -Destination $dstHook -Force
      Write-Host "   - $($_.Name) installed"
    }

    # Stage hooks and git config files
    git add .husky/pre-commit .husky/commit-msg .husky/pre-push | Out-Null
    git add .gitignore .gitattributes | Out-Null

    # Normalize line endings according to .gitattributes rules
    Write-Host "==> Normalizing line endings according to .gitattributes"
    git add --renormalize . | Out-Null
    Write-Host "   - All files normalized to configured line endings (LF for shell scripts, auto for others)"
  } else {
    Write-Warning "Husky templates not found at $huskyTpl (skipping hook setup)"
  }

} catch {
  Write-Warning "Git/Husky initialization encountered an issue: $_"
}

# Install and configure testing framework
try {
  $projRoot = Get-Location

  Write-Host "==> Installing Vitest and testing utilities"
  pnpm add -D vitest @vitest/coverage-v8 jsdom | Out-Null
  Write-Host "   - Testing dependencies installed"

  Write-Host "==> Applying test configuration"
  $vitestSrc = Join-Path $PSScriptRoot "templates\\root\\vitest.config.ts"
  $vitestDst = Join-Path $projRoot "vitest.config.ts"
  if (Test-Path $vitestSrc) {
    Copy-Item -Path $vitestSrc -Destination $vitestDst -Force
    Write-Host "   - vitest.config.ts copied (50% coverage thresholds)"
  }

  # Copy test.ts setup file
  $testSetupSrc = Join-Path $PSScriptRoot "templates\\root\\src\\test.ts"
  $testSetupDst = Join-Path $projRoot "src\\test.ts"
  if (Test-Path $testSetupSrc) {
    Copy-Item -Path $testSetupSrc -Destination $testSetupDst -Force
    Write-Host "   - src/test.ts setup file copied"
  }

  # Copy home.page.spec.ts example test
  $homeSpecSrc = Join-Path $PSScriptRoot "templates\\web-app\\src\\app\\features\\home\\home.page.spec.ts"
  $homeSpecDst = Join-Path $projRoot "src\\app\\features\\home\\home.page.spec.ts"
  if (Test-Path $homeSpecSrc) {
    Copy-Item -Path $homeSpecSrc -Destination $homeSpecDst -Force
    Write-Host "   - home.page.spec.ts example copied"
  }

  # Add test scripts to package.json
  Write-Host "==> Adding test and verification scripts to package.json"
  node -e @'
  const fs = require('fs');
  const pkgPath = 'package.json';
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (!pkg.scripts) pkg.scripts = {};

  // Build and dev scripts
  pkg.scripts.dev = 'ng serve';
  pkg.scripts.build = 'ng build';
  pkg.scripts.typecheck = 'tsc --noEmit';

  // Format and lint scripts
  pkg.scripts.format = 'prettier --write . --ignore-unknown';
  pkg.scripts['format:check'] = 'prettier --check . --ignore-unknown';
  pkg.scripts.lint = 'eslint .';
  pkg.scripts['lint:fix'] = 'eslint . --fix';

  // Test scripts
  pkg.scripts.test = 'vitest run';
  pkg.scripts['test:watch'] = 'vitest';
  pkg.scripts['test:coverage'] = 'vitest run --coverage';

  // E2E test scripts
  pkg.scripts.e2e = 'playwright test';
  pkg.scripts['e2e:ui'] = 'playwright test --ui';
  pkg.scripts['e2e:debug'] = 'playwright test --debug';
  pkg.scripts['e2e:report'] = 'playwright show-report';

  // Verification scripts (run tools/scripts/*.mjs)
  pkg.scripts['verify:structure'] = 'node tools/scripts/verify-structure.mjs';
  pkg.scripts['verify:app-routes'] = 'node tools/scripts/verify-app-routes.mjs';
  pkg.scripts['verify:feature-routes'] = 'node tools/scripts/verify-feature-routes.mjs';
  pkg.scripts['verify:no-cross-feature-imports'] = 'node tools/scripts/verify-no-cross-feature-imports.mjs';
  pkg.scripts['verify:no-raw-colors'] = 'node tools/scripts/verify-no-raw-colors.mjs';
  pkg.scripts.verify = 'pnpm run verify:structure && pnpm run verify:app-routes && pnpm run verify:feature-routes && pnpm run verify:no-cross-feature-imports && pnpm run verify:no-raw-colors';

  // Feature generation script
  pkg.scripts['gen:feature'] = 'node tools/scripts/generate-feature.mjs';

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
'@
  Write-Host "   - Build/dev scripts: dev, build, typecheck"
  Write-Host "   - Format/lint scripts: format, format:check, lint, lint:fix"
  Write-Host "   - Test scripts: test, test:watch, test:coverage"
  Write-Host "   - E2E scripts: e2e, e2e:ui, e2e:debug, e2e:report"
  Write-Host "   - Verification scripts: verify (all), verify:structure, verify:app-routes, verify:feature-routes, verify:no-cross-feature-imports, verify:no-raw-colors"
  Write-Host "   - Feature generation: gen:feature"

} catch {
  Write-Warning "Testing setup encountered an issue: $_"
}

# Copy developer documentation
try {
  Write-Host "==> Copying developer documentation"
  $projRoot = Get-Location
  $rootTemplateSrc = Join-Path $PSScriptRoot "templates\\root"
  $docsTemplateSrc = Join-Path $rootTemplateSrc "docs"
  $docsDst = Join-Path $projRoot "docs"

  # Create docs folder
  New-Item -ItemType Directory -Force -Path $docsDst | Out-Null

  # Copy consolidated 9-document set from templates/root/docs/
  $docFiles = @('GETTING_STARTED.md', 'ARCHITECTURE.md', 'DEVELOPMENT.md', 'TESTING.md', 'E2E_TESTING.md', 'STYLING.md', 'API.md', 'VERIFICATION.md', 'TROUBLESHOOTING.md')

  foreach ($doc in $docFiles) {
    $srcPath = Join-Path $docsTemplateSrc $doc
    $dstPath = Join-Path $docsDst $doc
    if (Test-Path $srcPath) {
      Copy-Item -Path $srcPath -Destination $dstPath -Force
      Write-Host "   - $doc"
    }
  }

  # Copy README.md to project root (from templates/root/)
  $readmeSrc = Join-Path $rootTemplateSrc "README.md"
  $readmeDst = Join-Path $projRoot "README.md"
  if (Test-Path $readmeSrc) {
    Copy-Item -Path $readmeSrc -Destination $readmeDst -Force
    Write-Host "   - README.md (root)"
  }

  Write-Host "   Total: 10 documentation files (1 in root + 9 in docs/)"
} catch {
  Write-Warning "Documentation copy encountered an issue: $_"
}

# Run post-bootstrap verification
try {
  $projRoot = Get-Location
  $postBootstrapVerify = Join-Path $PSScriptRoot "templates\\tools-scripts\\post-bootstrap-verify.mjs"

  if (Test-Path $postBootstrapVerify) {
    Write-Host ""
    Write-Host "==> Running post-bootstrap verification"
    Write-Host "   Validating bootstrap success, build, linting, tests, and architecture gates..."
    Write-Host ""

    $verifyOutput = & node $postBootstrapVerify 2>&1
    $verifyExitCode = $LASTEXITCODE

    Write-Host $verifyOutput

    if ($verifyExitCode -ne 0) {
      Write-Warning "Post-bootstrap verification encountered issues (exit code: $verifyExitCode)"
      Write-Host "   Review the output above to resolve any issues."
      Write-Host "   Once fixed, you can run 'pnpm verify:*' commands to check specific areas."
      Write-Host ""
    } else {
      Write-Host ""
      Write-Host "✓ All verification gates passed!"
      Write-Host ""
    }
  }
} catch {
  Write-Warning "Post-bootstrap verification step encountered an issue: $_"
}

# Final line ending normalization to ensure absolutely clean state
try {
  git add --renormalize . 2>$null | Out-Null
  git config core.safecrlf false 2>$null | Out-Null
} catch {
  # Silently ignore any git normalization issues at this point
}

Write-Host ""
Write-Host "==> Scaffold, configuration, and verification complete"
Write-Host "App ready at: $(Get-Location)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  cd $(Split-Path -Leaf (Get-Location))"
Write-Host "  pnpm dev          # Start development server"
Write-Host "  pnpm test         # Run tests"
Write-Host "  pnpm gen:feature  # Generate new feature"
Write-Host "  pnpm verify:*     # Run verification gates"
Write-Host ""
