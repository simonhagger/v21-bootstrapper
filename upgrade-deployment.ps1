#Requires -Version 7.0

<#
.SYNOPSIS
Upgrade an existing deployed Angular app to the latest bootstrap templates.

.DESCRIPTION
Compares files in a deployed Angular app against the bootstrap templates from multiple sources
and intelligently upgrades files while preserving user customizations. Uses git history to
distinguish between user-modified files and upgrade-only modifications.

.PARAMETER DeploymentPath
Path to the deployed application to upgrade (e.g., E:\workspace\demo-v21-app)

.PARAMETER BootstrapPath
Path to the bootstrap root (defaults to script directory)

.PARAMETER Action
- 'compare': Show differences without making changes (default)
- 'report': Generate a detailed HTML report
- 'upgrade': Apply updates (requires confirmation for each file)
- 'upgrade-force': Apply all updates without confirmation (skip user-modified files)
- 'upgrade-all': Apply ALL updates including user-modified files (dangerous)

.PARAMETER IncludeUserModified
If true, will prompt to upgrade even user-modified files

.EXAMPLE
.\upgrade-deployment-v2.ps1 -DeploymentPath E:\workspace\demo-v21-app -Action compare

.EXAMPLE
.\upgrade-deployment-v2.ps1 -DeploymentPath E:\workspace\demo-v21-app -Action upgrade-force

.EXAMPLE
.\upgrade-deployment-v2.ps1 -DeploymentPath E:\workspace\demo-v21-app -Action upgrade -IncludeUserModified
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$DeploymentPath,

  [string]$BootstrapPath = $PSScriptRoot,

  [ValidateSet('compare', 'report', 'upgrade', 'upgrade-force', 'upgrade-all')]
  [string]$Action = 'compare',

  [switch]$IncludeUserModified
)

# Configuration
$ErrorActionPreference = 'Stop'

# Template source mappings
# Map from bootstrap template folders to deployment targets
$templateMappings = @(
  @{
    Source      = 'templates\web-app'
    Target      = '.'
    Description = 'Angular application files'
  },
  @{
    Source      = 'templates\root'
    Target      = '.'
    Description = 'Root configuration files'
    Exclude     = @('README.md', 'AI_AGENT_GUIDE.md', 'API_GUIDE.md', 'ARCHITECTURE.md', 
      'DEVELOPMENT_GUIDE.md', 'PATTERNS.md', 'POST_BOOTSTRAP_GUIDE.md', 
      'TESTING_GUIDE.md', 'THEMING_GUIDE.md', 'VERIFICATION_QUICK_REF.md', 
      'VERIFICATION_SYSTEM.md', 'commitlint.config.cjs')
  }
)

$skipPatterns = @(
  '*node_modules*',
  '*\.git*',
  '*dist*',
  '*\.angular*',
  '*.env*',
  '*\.cache*',
  '*coverage*',
  '*.log',
  '*pnpm-lock.yaml',
  '*package-lock.json',
  '*playwright-report*',
  '*test-results*'
)

# Helper functions
function Get-FileHashSimple {
  param([string]$FilePath)
  if (Test-Path $FilePath) {
    return (Get-FileHash -Path $FilePath -Algorithm SHA256).Hash
  }
  return $null
}

function Test-SkipPath {
  param([string]$RelativePath)

  foreach ($pattern in $skipPatterns) {
    if ($RelativePath -like $pattern) {
      return $true
    }
  }

  $skipSegments = @('node_modules', '.git', 'dist', '.angular', 'coverage', 'playwright-report', 'test-results')
  foreach ($segment in $skipSegments) {
    if ($RelativePath -match [regex]::Escape($segment)) {
      return $true
    }
  }

  return $false
}

function Get-RelativePath {
  param([string]$FullPath, [string]$BasePath)
  $relative = $FullPath -replace [regex]::Escape($BasePath), ''
  return $relative.TrimStart('\', '/')
}

function Test-FileUserModified {
  param([string]$FilePath, [string]$RepoPath)

  # Check if file is in a git repo
  Push-Location $RepoPath
  try {
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -ne 0) {
      # Not a git repo
      Pop-Location
      return $false
    }

    # Get relative path from repo root
    $repoRoot = git rev-parse --show-toplevel 2>&1
    if ($LASTEXITCODE -ne 0) {
      Pop-Location
      return $false
    }

    $relativePath = Get-RelativePath -FullPath $FilePath -BasePath $repoRoot
    $relativePath = $relativePath -replace '\\', '/'

    # Check git log for commits that modified this file
    # Exclude commits with messages containing "chore: upgrade" or "chore: bootstrap"
    $userCommits = git log --all --format="%H|%s" -- $relativePath 2>&1 | Where-Object {
      $_ -match '\|' -and 
      $_ -notmatch 'chore:\s*(upgrade|bootstrap)' -and
      $_ -notmatch 'chore\(upgrade\):' -and
      $_ -notmatch 'chore\(bootstrap\):'
    }

    Pop-Location
    return ($null -ne $userCommits -and $userCommits.Count -gt 0)
  }
  catch {
    Pop-Location
    return $false
  }
}

function Copy-FilePreservingEncoding {
  param(
    [string]$SourcePath,
    [string]$DestinationPath
  )

  # Ensure destination directory exists
  $destDir = Split-Path -Parent $DestinationPath
  if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
  }

  # Read source file as raw bytes to preserve exact encoding
  $content = [System.IO.File]::ReadAllBytes($SourcePath)
  
  # Write to destination as raw bytes
  [System.IO.File]::WriteAllBytes($DestinationPath, $content)
}

# Validate paths
if (-not (Test-Path $DeploymentPath)) {
  Write-Error "Deployment path not found: $DeploymentPath"
  exit 1
}

if (-not (Test-Path $BootstrapPath)) {
  Write-Error "Bootstrap path not found: $BootstrapPath"
  exit 1
}

Write-Host "Deployment Upgrade Tool v2" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Deployment: $DeploymentPath" -ForegroundColor White
Write-Host "Bootstrap:  $BootstrapPath" -ForegroundColor White
Write-Host "Action:     $Action" -ForegroundColor White
Write-Host ""

# Collect files from all template sources
$allTemplateFiles = @()
$sourceStats = @{}

foreach ($mapping in $templateMappings) {
  $sourcePath = Join-Path -Path $BootstrapPath -ChildPath $mapping.Source
  
  if (-not (Test-Path $sourcePath)) {
    Write-Warning "Template source not found: $sourcePath (skipping)"
    continue
  }

  Write-Host "Scanning: $($mapping.Description)..." -ForegroundColor DarkGray

  $count = 0
  Get-ChildItem -Path $sourcePath -Recurse -File | ForEach-Object {
    $relativeFromSource = Get-RelativePath -FullPath $_.FullName -BasePath $sourcePath
    
    # Check if file is excluded
    $isExcluded = $false
    if ($mapping.Exclude) {
      foreach ($excludePattern in $mapping.Exclude) {
        if ($_.Name -like $excludePattern) {
          $isExcluded = $true
          break
        }
      }
    }

    if (-not $isExcluded -and -not (Test-SkipPath -RelativePath $relativeFromSource)) {
      $targetRelativePath = if ($mapping.Target -eq '.') {
        $relativeFromSource
      }
      else {
        Join-Path -Path $mapping.Target -ChildPath $relativeFromSource
      }

      $allTemplateFiles += @{
        FullPath            = $_.FullName
        RelativePath        = $targetRelativePath
        Name                = $_.Name
        SourceDescription   = $mapping.Description
        SourceMapping       = $mapping.Source
      }
      $count++
    }
  }

  $sourceStats[$mapping.Description] = $count
}

Write-Host ""
Write-Host "Template Statistics:" -ForegroundColor Cyan
foreach ($key in $sourceStats.Keys) {
  Write-Host "  $key`: $($sourceStats[$key]) files" -ForegroundColor DarkGray
}
Write-Host "  Total: $($allTemplateFiles.Count) files" -ForegroundColor Yellow
Write-Host ""

# Compare files
$changes = @{
  New            = @()
  Modified       = @()
  UserModified   = @()
  Deleted        = @()
  Unchanged      = @()
}

foreach ($templateFile in $allTemplateFiles) {
  $deploymentFile = Join-Path -Path $DeploymentPath -ChildPath $templateFile.RelativePath

  if (-not (Test-Path $deploymentFile)) {
    $changes.New += $templateFile
  }
  else {
    $templateHash = Get-FileHashSimple -FilePath $templateFile.FullPath
    $deploymentHash = Get-FileHashSimple -FilePath $deploymentFile

    if ($templateHash -ne $deploymentHash) {
      $fileInfo = @{
        FullPath          = $templateFile.FullPath
        DeploymentPath    = $deploymentFile
        RelativePath      = $templateFile.RelativePath
        Name              = $templateFile.Name
        SourceDescription = $templateFile.SourceDescription
      }

      # Check if file has user modifications
      $isUserModified = Test-FileUserModified -FilePath $deploymentFile -RepoPath $DeploymentPath

      if ($isUserModified) {
        $fileInfo.UserModified = $true
        $changes.UserModified += $fileInfo
      }
      else {
        $changes.Modified += $fileInfo
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
    # Check if file exists in any template source
    $foundInTemplate = $false
    foreach ($mapping in $templateMappings) {
      $sourcePath = Join-Path -Path $BootstrapPath -ChildPath $mapping.Source
      if (Test-Path $sourcePath) {
        $templateEquivalent = Join-Path -Path $sourcePath -ChildPath $relativePath
        if (Test-Path $templateEquivalent) {
          $foundInTemplate = $true
          break
        }
      }
    }

    if (-not $foundInTemplate) {
      $changes.Deleted += @{
        FullPath     = $_.FullName
        RelativePath = $relativePath
        Name         = $_.Name
      }
    }
  }
}

# Display summary
Write-Host "Comparison Results" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✓ Unchanged:      $($changes.Unchanged.Count) files" -ForegroundColor Green
Write-Host "⚠ Modified:       $($changes.Modified.Count) files (safe to upgrade)" -ForegroundColor Yellow
Write-Host "⚠ User-Modified:  $($changes.UserModified.Count) files (has custom changes)" -ForegroundColor Magenta
Write-Host "✚ New:            $($changes.New.Count) files" -ForegroundColor Blue
Write-Host "✗ Deleted:        $($changes.Deleted.Count) files (exist in deployment only)" -ForegroundColor Red
Write-Host ""

# Show modified files (safe to upgrade)
if ($changes.Modified.Count -gt 0) {
  Write-Host "Modified Files (Safe to Upgrade):" -ForegroundColor Yellow
  foreach ($file in $changes.Modified) {
    Write-Host "  · $($file.RelativePath)" -ForegroundColor White -NoNewline
    Write-Host " [$($file.SourceDescription)]" -ForegroundColor DarkGray
  }
  Write-Host ""
}

# Show user-modified files (caution required)
if ($changes.UserModified.Count -gt 0) {
  Write-Host "User-Modified Files (Caution - Has Custom Changes):" -ForegroundColor Magenta
  foreach ($file in $changes.UserModified) {
    Write-Host "  ⚠ $($file.RelativePath)" -ForegroundColor Magenta -NoNewline
    Write-Host " [$($file.SourceDescription)]" -ForegroundColor DarkGray
  }
  Write-Host ""
}

# Show new files
if ($changes.New.Count -gt 0) {
  Write-Host "New Files:" -ForegroundColor Blue
  foreach ($file in $changes.New) {
    Write-Host "  · $($file.RelativePath)" -ForegroundColor White -NoNewline
    Write-Host " [$($file.SourceDescription)]" -ForegroundColor DarkGray
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
  # Create .upgrade directory for reports
  $upgradeDir = Join-Path -Path $DeploymentPath -ChildPath '.upgrade'
  if (-not (Test-Path $upgradeDir)) {
    New-Item -ItemType Directory -Path $upgradeDir -Force | Out-Null
  }
  
  $reportPath = Join-Path -Path $upgradeDir -ChildPath 'report.html'

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
    .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin: 20px 0; }
    .stat { padding: 15px; border-radius: 8px; text-align: center; }
    .stat-unchanged { background: #e8f5e9; color: #2e7d32; }
    .stat-modified { background: #fff3e0; color: #e65100; }
    .stat-user { background: #f3e5f5; color: #7b1fa2; }
    .stat-new { background: #e3f2fd; color: #1565c0; }
    .stat-deleted { background: #ffebee; color: #c62828; }
    .stat-number { font-size: 24px; font-weight: bold; }
    .stat-label { font-size: 12px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    tr:hover { background: #fafafa; }
    .file-path { font-family: monospace; color: #666; }
    .source-tag { background: #e3f2fd; padding: 2px 6px; border-radius: 3px; font-size: 11px; color: #1565c0; }
    .timestamp { color: #999; font-size: 12px; }
    .warning { background: #fff3e0; padding: 15px; border-left: 4px solid #f57c00; margin: 15px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Deployment Upgrade Report</h1>
    <p class="timestamp">Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    <p><strong>Deployment:</strong> $DeploymentPath</p>
    <p><strong>Bootstrap:</strong> $BootstrapPath</p>

    <div class="summary">
      <div class="stat stat-unchanged">
        <div class="stat-number">$($changes.Unchanged.Count)</div>
        <div class="stat-label">Unchanged</div>
      </div>
      <div class="stat stat-modified">
        <div class="stat-number">$($changes.Modified.Count)</div>
        <div class="stat-label">Modified (Safe)</div>
      </div>
      <div class="stat stat-user">
        <div class="stat-number">$($changes.UserModified.Count)</div>
        <div class="stat-label">User-Modified</div>
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

    $(if ($changes.UserModified.Count -gt 0) {
      "<div class='warning'><strong>⚠ Warning:</strong> $($changes.UserModified.Count) files have user modifications. Upgrading these files may overwrite your customizations. Review carefully before upgrading.</div>"
    })

    <h2>Modified Files (Safe to Upgrade)</h2>
    <table>
      <tr><th>File Path</th><th>Source</th></tr>
      $(if ($changes.Modified.Count -gt 0) {
        $changes.Modified | ForEach-Object { 
          "<tr><td class='file-path'>$($_.RelativePath)</td><td><span class='source-tag'>$($_.SourceDescription)</span></td></tr>" 
        }
      } else {
        "<tr><td colspan='2'>No modified files</td></tr>"
      })
    </table>

    <h2>User-Modified Files (Caution Required)</h2>
    <table>
      <tr><th>File Path</th><th>Source</th></tr>
      $(if ($changes.UserModified.Count -gt 0) {
        $changes.UserModified | ForEach-Object { 
          "<tr><td class='file-path'>⚠ $($_.RelativePath)</td><td><span class='source-tag'>$($_.SourceDescription)</span></td></tr>" 
        }
      } else {
        "<tr><td colspan='2'>No user-modified files</td></tr>"
      })
    </table>

    <h2>New Files</h2>
    <table>
      <tr><th>File Path</th><th>Source</th></tr>
      $(if ($changes.New.Count -gt 0) {
        $changes.New | ForEach-Object { 
          "<tr><td class='file-path'>$($_.RelativePath)</td><td><span class='source-tag'>$($_.SourceDescription)</span></td></tr>" 
        }
      } else {
        "<tr><td colspan='2'>No new files</td></tr>"
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
if ($Action -in @('upgrade', 'upgrade-force', 'upgrade-all')) {
  $filesToUpgrade = @()
  
  # Always include modified and new files
  $filesToUpgrade += $changes.Modified
  $filesToUpgrade += $changes.New

  # Include user-modified files based on action
  if ($Action -eq 'upgrade-all' -or $IncludeUserModified) {
    $filesToUpgrade += $changes.UserModified
  }
  elseif ($changes.UserModified.Count -gt 0) {
    Write-Host "⚠ Skipping $($changes.UserModified.Count) user-modified files" -ForegroundColor Magenta
    Write-Host "  Use -Action upgrade-all or -IncludeUserModified to upgrade these files" -ForegroundColor DarkGray
    Write-Host ""
  }

  $totalUpdates = $filesToUpgrade.Count

  if ($totalUpdates -eq 0) {
    Write-Host "✓ Deployment is already up to date!" -ForegroundColor Green
    exit 0
  }

  Write-Host "Preparing to apply $totalUpdates updates..." -ForegroundColor Cyan
  Write-Host ""

  $confirmAll = $Action -in @('upgrade-force', 'upgrade-all')
  $applied = 0
  $skipped = 0

  foreach ($file in $filesToUpgrade) {
    $shouldApply = $confirmAll
    $isNew = $changes.New -contains $file
    $isUserModified = $file.UserModified -eq $true

    if (-not $confirmAll) {
      $verb = if ($isNew) { "Add" } else { "Update" }
      $warning = if ($isUserModified) { " (⚠ USER-MODIFIED)" } else { "" }
      
      Write-Host "$verb`: $($file.RelativePath)$warning" -ForegroundColor $(if ($isUserModified) { 'Magenta' } else { 'Yellow' })
      Write-Host "  Source: $($file.SourceDescription)" -ForegroundColor DarkGray
      $response = Read-Host "  [Y]es / [N]o / [A]ll / [S]kip remaining (Y/N/A/S)"

      switch ($response.ToUpper()) {
        'Y' { $shouldApply = $true }
        'A' { $shouldApply = $true; $confirmAll = $true }
        'S' { break }
        default { $skipped++ }
      }
    }

    if ($shouldApply) {
      try {
        if ($isNew) {
          $destinationFile = Join-Path -Path $DeploymentPath -ChildPath $file.RelativePath
          Copy-FilePreservingEncoding -SourcePath $file.FullPath -DestinationPath $destinationFile
          Write-Host "✓ Added: $($file.RelativePath)" -ForegroundColor Blue
        }
        else {
          Copy-FilePreservingEncoding -SourcePath $file.FullPath -DestinationPath $file.DeploymentPath
          Write-Host "✓ Updated: $($file.RelativePath)" -ForegroundColor Green
        }
        $applied++
      }
      catch {
        Write-Host "✗ Failed: $($file.RelativePath)" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor DarkRed
      }
    }
  }

  Write-Host ""
  Write-Host "Upgrade Complete" -ForegroundColor Green
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
  Write-Host "Applied: $applied files" -ForegroundColor Green
  if ($skipped -gt 0) {
    Write-Host "Skipped: $skipped files" -ForegroundColor Yellow
  }
  Write-Host ""

  Write-Host "Next steps:" -ForegroundColor Cyan
  Write-Host "  1. cd $DeploymentPath" -ForegroundColor White
  Write-Host "  2. git diff                            # Review all changes" -ForegroundColor White
  Write-Host "  3. pnpm install                        # Install any new dependencies" -ForegroundColor White
  Write-Host "  4. pnpm test                           # Verify tests pass" -ForegroundColor White
  Write-Host "  5. pnpm dev                            # Test in development" -ForegroundColor White
  Write-Host "  6. git add . && git commit             # Commit when satisfied" -ForegroundColor White
  Write-Host ""
}
