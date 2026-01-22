#Requires -Version 7.0

<#
.SYNOPSIS
Upgrade an existing deployed Angular app to the latest bootstrap templates.

.DESCRIPTION
Compares files in a deployed Angular app against the bootstrap templates and
identifies files that have changed. Allows selective upgrading of files while
preserving local customizations and git history.

.PARAMETER DeploymentPath
Path to the deployed application to upgrade (e.g., E:\workspace\demo-v21-app)

.PARAMETER TemplatePath
Path to the bootstrap templates (defaults to current directory's templates/web-app)

.PARAMETER Action
- 'compare': Show differences without making changes (default)
- 'report': Generate a detailed HTML report
- 'upgrade': Apply updates (requires confirmation for each file)
- 'upgrade-force': Apply all updates without confirmation

.EXAMPLE
.\upgrade-deployment.ps1 -DeploymentPath E:\workspace\demo-v21-app -Action compare

.EXAMPLE
.\upgrade-deployment.ps1 -DeploymentPath E:\workspace\demo-v21-app -Action report

.EXAMPLE
.\upgrade-deployment.ps1 -DeploymentPath E:\workspace\demo-v21-app -Action upgrade
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$DeploymentPath,

  [string]$TemplatePath = (Join-Path -Path $PSScriptRoot -ChildPath 'templates\web-app'),

  [ValidateSet('compare', 'report', 'upgrade', 'upgrade-force')]
  [string]$Action = 'compare'
)

# Configuration
$ErrorActionPreference = 'Stop'
$skipPatterns = @(
  '*node_modules*',
  '*\.git*',
  '*dist*',
  '*\.angular*',
  '*.env*',
  '*\.cache*',
  '*coverage*',
  '*.log'
)

# Helper function to get file hash
function Get-FileHashSimple {
  param([string]$FilePath)
  if (Test-Path $FilePath) {
    return (Get-FileHash -Path $FilePath -Algorithm SHA256).Hash
  }
  return $null
}

# Helper function to check if path should be skipped
function Test-SkipPath {
  param([string]$RelativePath)

  foreach ($pattern in $skipPatterns) {
    if ($RelativePath -like $pattern) {
      return $true
    }
  }

  # Also skip if path contains any of these segments
  $skipSegments = @('node_modules', '.git', 'dist', '.angular', 'coverage')
  foreach ($segment in $skipSegments) {
    if ($RelativePath -match [regex]::Escape($segment)) {
      return $true
    }
  }

  return $false
}

# Helper function to get relative path
function Get-RelativePath {
  param([string]$FullPath, [string]$BasePath)

  $relative = $FullPath -replace [regex]::Escape($BasePath), ''
  return $relative.TrimStart('\', '/')
}

# Validate paths
if (-not (Test-Path $DeploymentPath)) {
  Write-Error "Deployment path not found: $DeploymentPath"
  exit 1
}

if (-not (Test-Path $TemplatePath)) {
  Write-Error "Template path not found: $TemplatePath"
  exit 1
}

Write-Host "Deployment Upgrade Tool" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Deployment: $DeploymentPath" -ForegroundColor White
Write-Host "Templates:  $TemplatePath" -ForegroundColor White
Write-Host "Action:     $Action" -ForegroundColor White
Write-Host ""

# Collect files from templates
$templateFiles = @()
Get-ChildItem -Path $TemplatePath -Recurse -File | ForEach-Object {
  $relativePath = Get-RelativePath -FullPath $_.FullName -BasePath $TemplatePath

  if (-not (Test-SkipPath -RelativePath $relativePath)) {
    $templateFiles += @{
      FullPath = $_.FullName
      RelativePath = $relativePath
      Name = $_.Name
    }
  }
}

Write-Host "Found $($templateFiles.Count) template files to compare" -ForegroundColor Yellow

# Compare files
$changes = @{
  New = @()
  Modified = @()
  Deleted = @()
  Unchanged = @()
}

foreach ($templateFile in $templateFiles) {
  $deploymentFile = Join-Path -Path $DeploymentPath -ChildPath $templateFile.RelativePath

  if (-not (Test-Path $deploymentFile)) {
    $changes.New += $templateFile
  }
  else {
    $templateHash = Get-FileHashSimple -FilePath $templateFile.FullPath
    $deploymentHash = Get-FileHashSimple -FilePath $deploymentFile

    if ($templateHash -ne $deploymentHash) {
      $changes.Modified += @{
        FullPath = $templateFile.FullPath
        DeploymentPath = $deploymentFile
        RelativePath = $templateFile.RelativePath
        Name = $templateFile.Name
      }
    }
    else {
      $changes.Unchanged += $templateFile
    }
  }
}

# Check for files in deployment not in templates
Get-ChildItem -Path $DeploymentPath -Recurse -File | ForEach-Object {
  $relativePath = Get-RelativePath -FullPath $_.FullName -BasePath $DeploymentPath

  if (-not (Test-SkipPath -RelativePath $relativePath)) {
    $templateEquivalent = Join-Path -Path $TemplatePath -ChildPath $relativePath

    if (-not (Test-Path $templateEquivalent)) {
      $changes.Deleted += @{
        FullPath = $_.FullName
        RelativePath = $relativePath
        Name = $_.Name
      }
    }
  }
}

# Display summary
Write-Host ""
Write-Host "Comparison Results" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✓ Unchanged: $($changes.Unchanged.Count) files" -ForegroundColor Green
Write-Host "⚠ Modified:  $($changes.Modified.Count) files" -ForegroundColor Yellow
Write-Host "✚ New:       $($changes.New.Count) files" -ForegroundColor Blue
Write-Host "✗ Deleted:   $($changes.Deleted.Count) files (exist in deployment only)" -ForegroundColor Red
Write-Host ""

# Show modified files
if ($changes.Modified.Count -gt 0) {
  Write-Host "Modified Files:" -ForegroundColor Yellow

  foreach ($file in $changes.Modified) {
    $displayPath = $file.RelativePath

    # Check if this is package.json and analyze dependencies
    if ($file.Name -eq 'package.json') {
      Write-Host "  · $displayPath" -ForegroundColor White -NoNewline
      Write-Host "  ⚠ DEPENDENCY CHANGES" -ForegroundColor Magenta

      try {
        $templatePkg = Get-Content -Path $file.FullPath -Raw | ConvertFrom-Json
        $deploymentPkg = Get-Content -Path $file.DeploymentPath -Raw | ConvertFrom-Json

        # Compare dependencies
        $templateDeps = @{}
        $deploymentDeps = @{}

        if ($templatePkg.dependencies) {
          $templatePkg.dependencies.PSObject.Properties | ForEach-Object {
            $templateDeps[$_.Name] = $_.Value
          }
        }

        if ($deploymentPkg.dependencies) {
          $deploymentPkg.dependencies.PSObject.Properties | ForEach-Object {
            $deploymentDeps[$_.Name] = $_.Value
          }
        }

        # Find additions
        $added = @()
        foreach ($key in $templateDeps.Keys) {
          if (-not $deploymentDeps.ContainsKey($key)) {
            $added += "      + $key@$($templateDeps[$key])"
          }
        }

        # Find updates
        $updated = @()
        foreach ($key in $templateDeps.Keys) {
          if ($deploymentDeps.ContainsKey($key) -and $templateDeps[$key] -ne $deploymentDeps[$key]) {
            $updated += "      ~ $key`: $($deploymentDeps[$key]) → $($templateDeps[$key])"
          }
        }

        # Find removals
        $removed = @()
        foreach ($key in $deploymentDeps.Keys) {
          if (-not $templateDeps.ContainsKey($key)) {
            $removed += "      - $key"
          }
        }

        # Display changes
        if ($added.Count -gt 0) {
          Write-Host "    Added dependencies:" -ForegroundColor Green
          $added | ForEach-Object { Write-Host $_ -ForegroundColor Green }
        }

        if ($updated.Count -gt 0) {
          Write-Host "    Updated dependencies:" -ForegroundColor Cyan
          $updated | ForEach-Object { Write-Host $_ -ForegroundColor Cyan }
        }

        if ($removed.Count -gt 0) {
          Write-Host "    Removed dependencies:" -ForegroundColor Red
          $removed | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        }
      }
      catch {
        Write-Host "    (Could not parse package.json for detailed analysis)" -ForegroundColor DarkGray
      }
    }
    else {
      Write-Host "  · $displayPath" -ForegroundColor White
    }
  }
  Write-Host ""
}

# Show new files
if ($changes.New.Count -gt 0) {
  Write-Host "New Files:" -ForegroundColor Blue
  $changes.New | ForEach-Object {
    Write-Host "  · $($_.RelativePath)" -ForegroundColor White
  }
  Write-Host ""
}

# Show deleted files
if ($changes.Deleted.Count -gt 0) {
  Write-Host "Files Only in Deployment:" -ForegroundColor Red
  $changes.Deleted | ForEach-Object {
    Write-Host "  · $($_.RelativePath)" -ForegroundColor White
  }
  Write-Host ""
}

# Generate report
if ($Action -eq 'report') {
  $reportPath = Join-Path -Path $DeploymentPath -ChildPath 'UPGRADE_REPORT.html'

  $html = @"
<!DOCTYPE html>
<html>
<head>
  <title>Deployment Upgrade Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #0066cc; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .stat { padding: 15px; border-radius: 8px; text-align: center; }
    .stat-unchanged { background: #e8f5e9; color: #2e7d32; }
    .stat-modified { background: #fff3e0; color: #e65100; }
    .stat-new { background: #e3f2fd; color: #1565c0; }
    .stat-deleted { background: #ffebee; color: #c62828; }
    .stat-number { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    tr:hover { background: #fafafa; }
    .file-path { font-family: monospace; color: #666; }
    .timestamp { color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Deployment Upgrade Report</h1>
    <p class="timestamp">Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>

    <div class="summary">
      <div class="stat stat-unchanged">
        <div class="stat-number">$($changes.Unchanged.Count)</div>
        <div class="stat-label">Unchanged</div>
      </div>
      <div class="stat stat-modified">
        <div class="stat-number">$($changes.Modified.Count)</div>
        <div class="stat-label">Modified</div>
      </div>
      <div class="stat stat-new">
        <div class="stat-number">$($changes.New.Count)</div>
        <div class="stat-label">New</div>
      </div>
      <div class="stat stat-deleted">
        <div class="stat-number">$($changes.Deleted.Count)</div>
        <div class="stat-label">Deployment Only</div>
      </div>
    </div>

    <h2>Modified Files</h2>
    <table>
      <tr><th>File Path</th></tr>
      $(if ($changes.Modified.Count -gt 0) {
        $changes.Modified | ForEach-Object { "<tr><td class='file-path'>$($_.RelativePath)</td></tr>" }
      } else {
        "<tr><td>No modified files</td></tr>"
      })
    </table>

    <h2>New Files</h2>
    <table>
      <tr><th>File Path</th></tr>
      $(if ($changes.New.Count -gt 0) {
        $changes.New | ForEach-Object { "<tr><td class='file-path'>$($_.RelativePath)</td></tr>" }
      } else {
        "<tr><td>No new files</td></tr>"
      })
    </table>

    <h2>Files in Deployment Only</h2>
    <table>
      <tr><th>File Path</th></tr>
      $(if ($changes.Deleted.Count -gt 0) {
        $changes.Deleted | ForEach-Object { "<tr><td class='file-path'>$($_.RelativePath)</td></tr>" }
      } else {
        "<tr><td>No deployment-only files</td></tr>"
      })
    </table>
  </div>
</body>
</html>
"@

  $html | Out-File -Path $reportPath -Encoding UTF8
  Write-Host "Report saved to: $reportPath" -ForegroundColor Green
  Write-Host ""
}

# Upgrade
if ($Action -in @('upgrade', 'upgrade-force')) {
  $totalUpdates = $changes.Modified.Count + $changes.New.Count

  if ($totalUpdates -eq 0) {
    Write-Host "✓ Deployment is already up to date!" -ForegroundColor Green
    exit 0
  }

  Write-Host "Preparing to apply $totalUpdates updates..." -ForegroundColor Cyan
  Write-Host ""

  $confirmAll = $Action -eq 'upgrade-force'
  $applied = 0

  # Apply modified files
  foreach ($file in $changes.Modified) {
    $shouldApply = $confirmAll

    if (-not $confirmAll) {
      Write-Host "Update: $($file.RelativePath)?" -ForegroundColor Yellow
      $response = Read-Host "  [Y]es / [N]o / [A]ll / [S]kip remaining (Y/N/A/S)"

      switch ($response.ToUpper()) {
        'Y' { $shouldApply = $true }
        'A' { $shouldApply = $true; $confirmAll = $true }
        'S' { break }
      }
    }

    if ($shouldApply) {
      Copy-Item -Path $file.FullPath -Destination $file.DeploymentPath -Force
      Write-Host "✓ Updated: $($file.RelativePath)" -ForegroundColor Green
      $applied++
    }
  }

  # Apply new files
  foreach ($file in $changes.New) {
    $shouldApply = $confirmAll

    if (-not $confirmAll) {
      Write-Host "Add: $($file.RelativePath)?" -ForegroundColor Blue
      $response = Read-Host "  [Y]es / [N]o / [A]ll / [S]kip remaining (Y/N/A/S)"

      switch ($response.ToUpper()) {
        'Y' { $shouldApply = $true }
        'A' { $shouldApply = $true; $confirmAll = $true }
        'S' { break }
      }
    }

    if ($shouldApply) {
      $destinationFile = Join-Path -Path $DeploymentPath -ChildPath $file.RelativePath
      $destinationDir = Split-Path -Parent $destinationFile

      if (-not (Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
      }

      Copy-Item -Path $file.FullPath -Destination $destinationFile -Force
      Write-Host "✓ Added: $($file.RelativePath)" -ForegroundColor Blue
      $applied++
    }
  }

  Write-Host ""
  Write-Host "Upgrade Complete" -ForegroundColor Green
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
  Write-Host "Applied: $applied files" -ForegroundColor Green
  Write-Host ""

  # Check if package.json was modified
  $pkgJsonModified = $changes.Modified | Where-Object { $_.Name -eq 'package.json' }

  if ($pkgJsonModified) {
    Write-Host "⚠ Dependency Changes Detected" -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "package.json was updated. Next steps:" -ForegroundColor Yellow
    Write-Host "  1. cd $DeploymentPath" -ForegroundColor White
    Write-Host "  2. git diff package.json           # Review dependency changes" -ForegroundColor White
    Write-Host "  3. pnpm install                    # Install new/updated dependencies" -ForegroundColor White
    Write-Host "  4. pnpm test                       # Verify compatibility" -ForegroundColor White
    Write-Host "  5. pnpm dev                        # Test in development" -ForegroundColor White
    Write-Host "  6. git add . && git commit         # Commit when satisfied" -ForegroundColor White
    Write-Host ""
  }

  Write-Host "Next steps:" -ForegroundColor Cyan
  Write-Host "  1. Review changes: git diff" -ForegroundColor White

  if (-not $pkgJsonModified) {
    Write-Host "  2. Test deployment: npm install && npm start" -ForegroundColor White
  }
  else {
    Write-Host "  2. Install dependencies: pnpm install" -ForegroundColor White
    Write-Host "  3. Test deployment: pnpm test && pnpm dev" -ForegroundColor White
  }

  Write-Host "  $(if ($pkgJsonModified) { '4' } else { '3' }). Commit changes: git add . && git commit -m 'chore: upgrade to latest templates'" -ForegroundColor White
  Write-Host ""
}
