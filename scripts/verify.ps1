param()

$ErrorActionPreference = 'Stop'

$packageJson = Get-Content package.json -Raw | ConvertFrom-Json

Write-Host '==> Optional type check'
$hasTsconfig = Test-Path 'tsconfig.app.json'

if ($hasTsconfig) {
  & npx tsc -p tsconfig.app.json --noEmit
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host 'No tsconfig.app.json found. Skipping type check.'
}

Write-Host ''
Write-Host '==> Production build'
& npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host '==> Test check'
$hasTestScript = $null -ne $packageJson.scripts.test -and [string]::IsNullOrWhiteSpace($packageJson.scripts.test) -eq $false

if (-not $hasTestScript) {
  Write-Host 'No test script found. Skipping tests.'
  exit 0
}

Write-Host 'Test script detected, but this repo does not run automated tests by default in this helper.'
Write-Host 'Run npm test manually if you want to validate the configured test environment.'
