param(
  [string]$Name = "acme-web",
  [int]$Cli = 21,
  [switch]$Force,
  [string]$TargetPath = "E:\ANGULAR\bootstrapped"
)

$ErrorActionPreference = "Stop"

function Require-Cmd($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Missing required command: $name" }
}

Require-Cmd node
Require-Cmd pnpm

# Prepare target directory
if (Test-Path $TargetPath) {
  if ($Force) {
    Write-Host "==> Clearing target directory: $TargetPath"
    try {
      Get-ChildItem -Path $TargetPath -Recurse -Force | Remove-Item -Recurse -Force -ErrorAction Stop
      $remainingItems = @(Get-ChildItem -Path $TargetPath -Recurse -Force)
      if ($remainingItems.Count -gt 0) {
        throw "Unable to clear all items from $TargetPath. Found $($remainingItems.Count) remaining items."
      }
    } catch {
      Write-Error "Failed to clear target directory: $_"
      exit 1
    }
  } else {
    throw "TargetPath exists. Use -Force to overwrite: $TargetPath"
  }
} else {
  New-Item -ItemType Directory -Force -Path $TargetPath | Out-Null
}
Push-Location $TargetPath

Write-Host "==> Scaffolding Angular workspace v$Cli with pnpm"
npx -y "@angular/cli@$Cli" new $Name `
  --defaults `
  --skip-git `
  --skip-tests `
  --style=scss `
  --package-manager=pnpm

Push-Location (Join-Path $TargetPath $Name)

Write-Host "==> Adding Tailwind CSS"
pnpm exec ng add tailwindcss --skip-confirmation

Write-Host "==> Adding Angular Material"
pnpm exec ng add @angular/material `
  --skip-confirmation `
  --theme=custom `
  --typography=true `
  --animations=true

# Post-scaffold: copy curated templates (app core, features/, shared/, config files)
try {
  $tplRoot = Join-Path $PSScriptRoot "templates\\web-app\\src"
  $rootTpl = Join-Path $PSScriptRoot "templates\\root"
  $appRoot = Join-Path (Get-Location) "src"
  $projRoot = Get-Location

  Write-Host "==> Applying curated templates"

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

  # Copy root config files (Prettier, ESLint, VSCode settings)
  $rootFiles = @('.prettierrc.json', 'eslint.config.mjs', 'commitlint.config.cjs', '.gitattributes')
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

  # Copy tools/scripts directory (verification and generation scripts)
  $toolsScriptsSrc = Join-Path $PSScriptRoot "templates\\tools-scripts"
  $toolsScriptsDst = Join-Path $projRoot "tools\\scripts"
  if (Test-Path $toolsScriptsSrc) {
    New-Item -ItemType Directory -Force -Path $toolsScriptsDst | Out-Null
    Copy-Item -Path (Join-Path $toolsScriptsSrc "*") -Destination $toolsScriptsDst -Recurse -Force
    Write-Host "   - tools/scripts/ copied (verification + generation scripts)"
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

    # Stage hooks in git
    git add .husky/pre-commit .husky/commit-msg .husky/pre-push | Out-Null
    git add .gitignore .gitattributes | Out-Null
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
  
  // Verification scripts (run tools/scripts/*.mjs)
  pkg.scripts['verify:structure'] = 'node tools/scripts/verify-structure.mjs';
  pkg.scripts['verify:app-routes'] = 'node tools/scripts/verify-app-routes.mjs';
  pkg.scripts['verify:feature-routes'] = 'node tools/scripts/verify-feature-routes.mjs';
  pkg.scripts['verify:no-cross-feature-imports'] = 'node tools/scripts/verify-no-cross-feature-imports.mjs';
  pkg.scripts['verify:no-raw-colors'] = 'node tools/scripts/verify-no-raw-colors.mjs';
  
  // Feature generation script
  pkg.scripts['gen:feature'] = 'node tools/scripts/generate-feature.mjs';

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
'@
  Write-Host "   - Build/dev scripts: dev, build, typecheck"
  Write-Host "   - Format/lint scripts: format, format:check, lint, lint:fix"
  Write-Host "   - Test scripts: test, test:watch, test:coverage"
  Write-Host "   - Verification scripts: verify:structure, verify:app-routes, verify:feature-routes, verify:no-cross-feature-imports, verify:no-raw-colors"
  Write-Host "   - Feature generation: gen:feature"

} catch {
  Write-Warning "Testing setup encountered an issue: $_"
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
