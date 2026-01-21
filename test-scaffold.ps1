param(
  [string]$TargetPath = "E:\ANGULAR\test-sandbox",
  [string]$AppName = "acme-web",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

function Require-Cmd($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) { throw "Missing required command: $name" }
}

Require-Cmd npx
Require-Cmd pnpm

# Prepare target directory
if (Test-Path $TargetPath) {
  if ($Force) {
    Remove-Item -Recurse -Force $TargetPath
  } else {
    throw "TargetPath exists. Use -Force to overwrite: $TargetPath"
  }
}
New-Item -ItemType Directory -Force -Path $TargetPath | Out-Null
Push-Location $TargetPath

# 1) Scaffold Angular v21 app (non-interactive)
Write-Host "==> Scaffolding Angular app $AppName"
npx -y @angular/cli@21 new $AppName `
  --defaults `
  --skip-git `
  --skip-tests `
  --style=scss `
  --package-manager=pnpm

Push-Location (Join-Path $TargetPath $AppName)

# 2) Add Tailwind via Angular integration (non-interactive)
Write-Host "==> Adding Tailwind"
pnpm exec ng add tailwindcss --skip-confirmation

# 3) Add Angular Material (non-interactive)
Write-Host "==> Adding Angular Material"
pnpm exec ng add @angular/material `
  --skip-confirmation `
  --theme=custom `
  --typography=true `
  --animations=true

# 4) Ensure Material Icons font (schematic normally adds; enforce for safety)
Write-Host "==> Ensuring Material Icons font"
node -e @'
const fs = require('fs');
const path = require('path');
const indexPath = path.join('src', 'index.html');
const linkTag = '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />';
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8');
  if (!html.includes('fonts.googleapis.com/icon')) {
    const updated = html.replace('</head>', `  ${linkTag}\n</head>`);
    fs.writeFileSync(indexPath, updated);
  }
}
'@

# 5) Replace default app files with sandbox smoke test
Write-Host "==> Applying sandbox app template"
$sandboxDir = Join-Path $PSScriptRoot "templates/web-app/sandbox"
$appDir = Join-Path (Join-Path $TargetPath $AppName) "src/app"
if (Test-Path $sandboxDir) {
  Copy-Item -Path (Join-Path $sandboxDir "app.ts") -Destination (Join-Path $appDir "app.ts") -Force
  Copy-Item -Path (Join-Path $sandboxDir "app.html") -Destination (Join-Path $appDir "app.html") -Force
  Copy-Item -Path (Join-Path $sandboxDir "app.scss") -Destination (Join-Path $appDir "app.scss") -Force
  Write-Host "  - Sandbox app applied"
} else {
  Write-Host "  - Sandbox template not found; skipped"
}

Pop-Location
Pop-Location

Write-Host "==> Done. App scaffolded at $TargetPath\$AppName"
