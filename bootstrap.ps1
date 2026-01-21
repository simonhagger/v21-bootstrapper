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

Write-Host ""
Write-Host "==> Scaffold and ng add complete"
Write-Host "App ready at: $(Get-Location)"
Write-Host ""
