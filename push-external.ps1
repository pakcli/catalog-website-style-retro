<#
===================================================================================
  🚀 RETRO IT KNOWLEDGE ARCADE -- ISOLATED DEPLOYMENT TOOL (push-external.ps1)
===================================================================================
  - Runs Pre-Flight Sanitizer (Rule #4 & zero-hardcoded-sensitive-variables)
  - Enforces Zero Secrets / Zero Machine Root Paths in public/
  - Pushes clean static distribution (./public) to gh-pages branch
===================================================================================
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$Remote = "origin",

    [Parameter(Mandatory = $false)]
    [string]$Branch = "gh-pages",

    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild = $false,

    [Parameter(Mandatory = $false)]
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PublicDir = Join-Path $ScriptDir "public"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  🚀  RETRO IT KNOWLEDGE ARCADE -- EXTERNAL DEPLOY RUNNER" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Target Remote : $Remote" -ForegroundColor DarkGray
Write-Host "Target Branch : $Branch" -ForegroundColor DarkGray
Write-Host ""

# 1. RUN BUILD IF NOT SKIPPED
if (-not $SkipBuild) {
    Write-Host "[1/3] Compiling fresh static distribution..." -ForegroundColor Yellow
    $buildScript = Join-Path $ScriptDir "src\modules\build-bundle.js"
    & node $buildScript
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build compilation failed. Deployment halted."
        exit $LASTEXITCODE
    }
} else {
    Write-Host "[1/3] Skipping build step (as requested)..." -ForegroundColor DarkGray
}

# 2. PRE-FLIGHT SANITIZER SCAN (RULE #4)
Write-Host "[2/3] Running pre-flight privacy & secrets sanitizer..." -ForegroundColor Yellow
$forbiddenPatterns = @(
    "ghp_[A-Za-z0-9_]{30,}",
    "sk-[A-Za-z0-9_]{30,}",
    "Bearer\s+[A-Za-z0-9_.-]{30,}",
    "BEGIN\s+PRIVATE\s+KEY",
    "[A-Za-z]:\\Users\\[A-Za-z0-9_-]+\\"
)

$leakFound = $false
$filesToCheck = Get-ChildItem -Path $PublicDir -Recurse -File -Include *.html, *.js, *.json, *.css

foreach ($f in $filesToCheck) {
    $content = Get-Content -Path $f.FullName -Raw
    foreach ($pattern in $forbiddenPatterns) {
        if ($content -match $pattern) {
            Write-Host " [SECURITY ALERT] Forbidden pattern '$pattern' detected in: $($f.FullName)" -ForegroundColor Red
            $leakFound = $true
        }
    }
}

if ($leakFound) {
    Write-Error "Sanitizer pre-flight failed! Private keys, tokens, or raw machine user paths detected in public distribution."
    exit 1
}
Write-Host "      -> Pre-flight sanitizer check passed cleanly! [OK]" -ForegroundColor Green

# 3. ISOLATED CLEAN PUSH TO GH-PAGES
Write-Host "[3/3] Deploying ./public to remote $Remote ($Branch)..." -ForegroundColor Yellow
Push-Location $ScriptDir
try {
    # Check git status
    $gitStatus = & git status --porcelain
    if ($gitStatus) {
        Write-Host "      -> Uncommitted workspace changes detected. Committing locally..." -ForegroundColor Cyan
        & git add public/
        & git commit -m "chore: compile static arcade distribution for deploy [skip ci]"
    }

    # Perform subtree push of public/
    Write-Host "      -> Pushing public/ via git subtree push..." -ForegroundColor Cyan
    & git subtree push --prefix public $Remote $Branch
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "git subtree push failed or branch diverged. You can re-run with custom branch flags."
    } else {
        Write-Host "      -> Successfully pushed to $Remote/$Branch! [SUCCESS]" -ForegroundColor Green
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  ✨  DEPLOYMENT PIPELINE COMPLETED" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
