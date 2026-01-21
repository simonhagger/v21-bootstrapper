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

# Post-scaffold: copy curated templates (main.ts, app core, features/, shared/)
try {
  $tplRoot = Join-Path $PSScriptRoot "templates\\web-app\\src"
  $appRoot = Join-Path (Get-Location) "src"

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

} catch {
  Write-Warning "Template copy step encountered an issue: $_"
}

Write-Host ""
Write-Host "==> Scaffold and ng add complete"
Write-Host "App ready at: $(Get-Location)"
Write-Host ""
