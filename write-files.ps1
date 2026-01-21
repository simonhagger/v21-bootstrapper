param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$templatesDir = Join-Path $scriptDir "templates"

function Copy-TemplateFile {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
  )

  $destDir = Split-Path $Destination -Parent
  if ($destDir -and -not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
  }

  if ((Test-Path $Destination) -and -not $Force) {
    Write-Host " - exists (skip): $Destination"
    return
  }

  Copy-Item -Force -Path $Source -Destination $Destination
  Write-Host " - copied: $Destination"
}

function Copy-TemplateFolder {
  param(
    [Parameter(Mandatory=$true)][string]$SourceFolder,
    [Parameter(Mandatory=$true)][string]$DestinationFolder
  )

  if (-not (Test-Path $SourceFolder)) {
    throw "Missing template folder: $SourceFolder"
  }

  $files = Get-ChildItem -Path $SourceFolder -File -Recurse
  foreach ($f in $files) {
    $rel = $f.FullName.Substring($SourceFolder.Length).TrimStart("\","/")
    $dest = Join-Path $DestinationFolder $rel
    Copy-TemplateFile -Source $f.FullName -Destination $dest
  }
}

# --- Root files -------------------------------------------------------------
$rootTemplate = Join-Path $templatesDir "root"
$rootConfigs = @(
  ".editorconfig", ".gitattributes", ".gitmessage.txt", ".lint-stagedrc.json",
  ".postcssrc.json", ".prettierignore", ".prettierrc.json", ".releaserc.cjs",
  "commitlint.config.cjs", "eslint.config.mjs"
)
$docFiles = @(
  "AI_AGENT_GUIDE.md", "API_GUIDE.md", "ARCHITECTURE.md", "DEVELOPMENT_GUIDE.md",
  "PATTERNS.md", "POST_BOOTSTRAP_GUIDE.md", "TESTING_GUIDE.md", "THEMING_GUIDE.md",
  "VERIFICATION_QUICK_REF.md", "VERIFICATION_SYSTEM.md"
)

if (-not (Test-Path $rootTemplate)) { throw "Missing root templates: $rootTemplate" }

# Copy config files to root
foreach ($f in $rootConfigs) {
  Copy-TemplateFile -Source (Join-Path $rootTemplate $f) -Destination $f
}

# Copy .vscode folder
Copy-TemplateFolder -SourceFolder (Join-Path $rootTemplate ".vscode") -DestinationFolder ".vscode"

# Copy README.md to root only
Copy-TemplateFile -Source (Join-Path $rootTemplate "README.md") -Destination "README.md"

# Copy documentation into docs/
$docsDest = "docs"
if (-not (Test-Path $docsDest)) { New-Item -ItemType Directory -Force $docsDest | Out-Null }
foreach ($doc in $docFiles) {
  Copy-TemplateFile -Source (Join-Path $rootTemplate $doc) -Destination (Join-Path $docsDest $doc)
}

# --- GitHub files -----------------------------------------------------------
Copy-TemplateFolder -SourceFolder (Join-Path $templatesDir "github") -DestinationFolder ".github"

# --- Tool scripts -----------------------------------------------------------
Copy-TemplateFolder -SourceFolder (Join-Path $templatesDir "tools-scripts") -DestinationFolder "tools/scripts"

# --- package.json scripts & lint-staged ------------------------------------
# Use pnpm pkg set to avoid clobbering formatting
pnpm pkg set scripts.prepare="husky" 2>$null | Out-Null

pnpm pkg set scripts.format="prettier --write ." 2>$null | Out-Null
pnpm pkg set scripts.format:check="prettier --check ." 2>$null | Out-Null
pnpm pkg set scripts.lint="eslint . --max-warnings 0" 2>$null | Out-Null
pnpm pkg set scripts.lint:fix="eslint . --fix" 2>$null | Out-Null

pnpm pkg set scripts.build="pnpm tokens:build && ng build acme-web" 2>$null | Out-Null
pnpm pkg set scripts.start="pnpm tokens:build && ng serve acme-web" 2>$null | Out-Null
pnpm pkg set scripts.watch="pnpm tokens:build && ng build --watch --configuration development" 2>$null | Out-Null
pnpm pkg set scripts.typecheck="pnpm tokens:build && ng build acme-web --configuration development --no-progress" 2>$null | Out-Null

pnpm pkg set scripts.test="pnpm tokens:build && ng test acme-web --watch=false" 2>$null | Out-Null
pnpm pkg set scripts.test:watch="pnpm tokens:build && ng test acme-web" 2>$null | Out-Null
pnpm pkg set scripts.test:ci="ng test acme-web --watch=false" 2>$null | Out-Null

pnpm pkg set scripts.tokens:build="node projects/tokens/src/generators/build-tokens.ts" 2>$null | Out-Null
pnpm pkg set scripts.verify:theme-contract="node tools/scripts/verify-theme-contract.mjs" 2>$null | Out-Null
pnpm pkg set scripts.verify:no-raw-colors="node tools/scripts/verify-no-raw-colors.mjs" 2>$null | Out-Null
pnpm pkg set scripts.verify:tokens="node tools/scripts/verify-tokens.mjs" 2>$null | Out-Null
pnpm pkg set scripts.verify:structure="node tools/scripts/verify-structure.mjs" 2>$null | Out-Null
pnpm pkg set scripts.verify:app-routes="node tools/scripts/verify-app-routes.mjs" 2>$null | Out-Null
pnpm pkg set scripts.verify:feature-routes="node tools/scripts/verify-feature-routes.mjs" 2>$null | Out-Null
pnpm pkg set scripts.verify:no-cross-feature-imports="node tools/scripts/verify-no-cross-feature-imports.mjs" 2>$null | Out-Null

pnpm pkg set scripts.gen:feature="node tools/scripts/generate-feature.mjs" 2>$null | Out-Null

pnpm pkg set scripts.release="semantic-release" 2>$null | Out-Null
pnpm pkg set scripts.release:dry="semantic-release --dry-run" 2>$null | Out-Null

pnpm pkg set scripts.verify="pnpm format:check && pnpm lint && pnpm verify:structure && pnpm verify:app-routes && pnpm verify:feature-routes && pnpm verify:no-cross-feature-imports && pnpm verify:theme-contract && pnpm verify:no-raw-colors && pnpm verify:tokens && pnpm typecheck && pnpm test:ci" 2>$null | Out-Null

pnpm pkg set scripts.verify:post-bootstrap="node tools/scripts/post-bootstrap-verify.mjs" 2>$null | Out-Null

# Configure lint-staged in package.json using Node to properly set nested JSON
node -e @"
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg['lint-staged'] = {
  '*.{ts,tsx,js,mjs,cjs,html,css,scss,md,json,yml,yaml}': ['prettier --write'],
  '*.{ts,tsx,js,mjs,cjs}': ['eslint --fix']
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');
"@

Write-Host "==> Configuration files written successfully"
