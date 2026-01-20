param(
  [switch]$Global
)

$ErrorActionPreference = "Stop"

$scope = "--local"
if ($Global) { $scope = "--global" }

git config $scope core.autocrlf false
git config $scope core.eol lf
git config $scope pull.rebase true
git config $scope fetch.prune true
git config $scope init.defaultBranch main

Write-Host "Git environment configured ($scope)."
