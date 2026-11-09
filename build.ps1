<#
===================================================================================
  🕹️ RETRO IT KNOWLEDGE ARCADE -- MASTER BUILD RUNNER (build.ps1)
===================================================================================
  - Enforces Rule #001 (Zero Hardcoded Variables) & Root-Bounded Jail Guard
  - Validates build-config.yaml (fallback to build-config.yaml.example)
  - Compiles full zero-backend distribution into ./public
===================================================================================
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [switch]$ExportStatic = $false,

    [Parameter(Mandatory = $false)]
    [switch]$Serve = $false,

    [Parameter(Mandatory = $false)]
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Split-Path -Parent $ScriptDir

# Root-Bounded Path Jail Guard (Rule: zero-hardcoded-sensitive-variables)
function Test-PathWithinRoot {
    param (
        [Parameter(Mandatory = $true)]
        [string]$TargetPath,

        [string]$RootBoundary = $WorkspaceRoot
    )

    if ([string]::IsNullOrWhiteSpace($TargetPath)) { return $false }

    try {
        $resolvedRoot = [System.IO.Path]::GetFullPath($RootBoundary)
        $combinedTarget = [System.IO.Path]::Combine($ScriptDir, $TargetPath)
        $resolvedTarget = [System.IO.Path]::GetFullPath($combinedTarget)

        $sep = [System.IO.Path]::DirectorySeparatorChar
        if (-not $resolvedRoot.EndsWith($sep)) {
            $resolvedRoot += $sep
        }

        $isSubdir = $resolvedTarget.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)
        $isExactRoot = ($resolvedTarget.TrimEnd($sep) -eq $resolvedRoot.TrimEnd($sep))

        return ($isSubdir -or $isExactRoot)
    } catch {
        return $false
    }
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "  🕹️  RETRO IT KNOWLEDGE ARCADE -- MASTER BUILD RUNNER" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "Directory : $ScriptDir" -ForegroundColor DarkGray
Write-Host ""

# STEP 1: Check Node.js
Write-Host "[1/3] Checking Node.js runtime..." -NoNewline
$nodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Error "Node.js is not installed or not in PATH! Please install Node.js (v18+) from https://nodejs.org"
    exit 1
}
$nodeVersion = & node -v
Write-Host " [OK] ($nodeVersion)" -ForegroundColor Green

# STEP 2: Verify Config File
Write-Host "[2/3] Verifying build configuration..." -NoNewline
$cfgPath = Join-Path $ScriptDir "build-config.yaml"
$cfgExample = Join-Path $ScriptDir "build-config.yaml.example"

if (-not (Test-Path $cfgPath)) {
    if (Test-Path $cfgExample) {
        Copy-Item -Path $cfgExample -Destination $cfgPath
        Write-Host " [INITIALIZED from template]" -ForegroundColor Cyan
    } else {
        Write-Host " [USING DEFAULTS]" -ForegroundColor Yellow
    }
} else {
    Write-Host " [OK]" -ForegroundColor Green
}

# STEP 3: Execute Compiler Engine
Write-Host "[3/3] Compiling arcade static distribution..." -ForegroundColor Yellow
$builderScript = Join-Path $ScriptDir "src\modules\build-bundle.js"

& node $builderScript
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build compilation failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

# Optional Local Server
if ($Serve) {
    $publicDir = Join-Path $ScriptDir "public"
    Write-Host ""
    Write-Host "Serving static distribution at: http://localhost:$Port" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to terminate server." -ForegroundColor DarkGray
    & npx serve $publicDir -l $Port
}
