$ErrorActionPreference = "Stop"

function Require-Cmd($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw "Missing required command: $name"
  }
}

Require-Cmd git
Require-Cmd node
Require-Cmd pnpm

Write-Host ("OK: " + (git --version))
Write-Host ("OK: node=" + (node --version))
Write-Host ("OK: pnpm=" + (pnpm --version))
