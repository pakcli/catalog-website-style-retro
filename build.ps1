<#
===================================================================================
  🕹️ RETRO TEMPLATE CATALOG WEBSITE -- INTERACTIVE BUILD RUNNER (build.ps1)
===================================================================================
  - Checks & auto-installs required devDependencies (only Playwright)
  - Guided interactive setup for build-config.yaml if unconfigured / placeholder
  - Interactively asks where your cartridge apps are located
  - Compiles full zero-backend distribution into ./public
===================================================================================
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$AppsDir = "",

    [Parameter(Mandatory = $false)]
    [switch]$NoPrompt = $false,

    [Parameter(Mandatory = $false)]
    [switch]$Serve = $false
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "  🕹️  RETRO TEMPLATE CATALOG WEBSITE -- BUILD RUNNER" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "Directory : $ScriptDir" -ForegroundColor DarkGray
Write-Host ""

# -----------------------------------------------------------------------------
# STEP 1: CHECK NODE.JS RUNTIME
# -----------------------------------------------------------------------------
Write-Host "[1/5] Checking Node.js runtime..." -NoNewline
$nodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Error "Node.js is not installed or not in PATH! Please install Node.js (v18+) from https://nodejs.org"
    exit 1
}
$nodeVersion = & node -v
Write-Host " [OK] ($nodeVersion)" -ForegroundColor Green

# -----------------------------------------------------------------------------
# STEP 2: CHECK & INSTALL NEEDED MODULES (ONLY PLAYWRIGHT)
# -----------------------------------------------------------------------------
Write-Host "[2/5] Checking required dependencies..." -NoNewline
$playwrightPath = Join-Path $ScriptDir "node_modules\playwright"

if (-not (Test-Path $playwrightPath)) {
    Write-Host " [MISSING]" -ForegroundColor Yellow
    Write-Host "      -> Installing required devDependencies (Playwright only)..." -ForegroundColor Cyan
    Push-Location $ScriptDir
    try {
        & npm install
    } finally {
        Pop-Location
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "npm install returned non-zero code. Continuing with core build engine..."
    } else {
        Write-Host "      -> Dependencies installed successfully!" -ForegroundColor Green
    }
} else {
    Write-Host " [OK] (Playwright ready)" -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# STEP 3: CONFIGURATION VALIDATION & GUIDED SETUP (build-config.yaml)
# -----------------------------------------------------------------------------
Write-Host "[3/5] Checking Engine Configuration (build-config.yaml)..." -NoNewline

$configYamlPath = Join-Path $ScriptDir "build-config.yaml"
$configExamplePath = Join-Path $ScriptDir "build-config.yamlexample"

$needsConfig = $false
$reason = ""

if (-not (Test-Path $configYamlPath)) {
    $needsConfig = $true
    $reason = "file 'build-config.yaml' does not exist yet"
} else {
    $yamlContent = Get-Content -Path $configYamlPath -Raw -ErrorAction SilentlyContinue
    $exampleContent = if (Test-Path $configExamplePath) { Get-Content -Path $configExamplePath -Raw -ErrorAction SilentlyContinue } else { "" }

    if ($yamlContent -and $exampleContent -and ($yamlContent.Trim() -eq $exampleContent.Trim())) {
        $needsConfig = $true
        $reason = "identical to template example 'build-config.yamlexample'"
    } elseif ($yamlContent -match "YOUR-URL-DOMAIN\.COM" -or $yamlContent -match "your-username") {
        $needsConfig = $true
        $reason = "contains unconfigured template placeholders"
    }
}

if ($needsConfig -and -not $NoPrompt) {
    Write-Host " [ACTION NEEDED]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   ⚠️  Configuration Notice: $reason" -ForegroundColor Yellow
    Write-Host "   How would you like to configure build-config.yaml?" -ForegroundColor White
    Write-Host "     [1] Guided Setup (answer step-by-step questions in PowerShell) [DEFAULT]" -ForegroundColor Cyan
    Write-Host "     [2] Edit manually in text editor" -ForegroundColor Cyan
    Write-Host "     [3] Keep current template and continue build" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Select option [1/2/3, Press ENTER for 1]: " -NoNewline -ForegroundColor Yellow
    $cfgChoice = Read-Host
    if (-not $cfgChoice -or $cfgChoice.Trim() -eq "") { $cfgChoice = "1" }

    if ($cfgChoice.Trim() -eq "1") {
        Write-Host ""
        Write-Host "   === 🛠️ GUIDED CONFIGURATION SETUP ===" -ForegroundColor Yellow
        Write-Host "   Press ENTER to accept the default value shown in brackets []." -ForegroundColor DarkGray
        Write-Host ""

        # Q1: Project Title
        Write-Host "   [1/6] Project Title [Default: mywebsite]: " -NoNewline -ForegroundColor White
        $inTitle = Read-Host
        $cfgTitle = if ($inTitle -and $inTitle.Trim() -ne "") { $inTitle.Trim() } else { "mywebsite" }
        $cfgName = ($cfgTitle.ToLower() -replace '[^a-z0-9_-]+', '-').Trim('-')

        # Q2: Website Base URL
        Write-Host "   [2/6] Base URL / Domain [Default: https://mywebsite.com]: " -NoNewline -ForegroundColor White
        $inUrl = Read-Host
        $cfgUrl = if ($inUrl -and $inUrl.Trim() -ne "") { $inUrl.Trim() } else { "https://mywebsite.com" }

        # Q3: GitHub Repository URL
        Write-Host "   [3/6] GitHub Repository URL [Default: https://github.com/mywebsite/mywebsite]: " -NoNewline -ForegroundColor White
        $inRepo = Read-Host
        $cfgRepo = if ($inRepo -and $inRepo.Trim() -ne "") { $inRepo.Trim() } else { "https://github.com/mywebsite/mywebsite" }

        # Q4: Author Name
        Write-Host "   [4/6] Author / Creator Name [Default: mywebsite]: " -NoNewline -ForegroundColor White
        $inAuthor = Read-Host
        $cfgAuthor = if ($inAuthor -and $inAuthor.Trim() -ne "") { $inAuthor.Trim() } else { "mywebsite" }

        # Q5: Default Accent
        Write-Host "   [5/6] Theme Accent [olive / amber / phosphor-green / cyan] [Default: olive]: " -NoNewline -ForegroundColor White
        $inAccent = Read-Host
        $cfgAccent = if ($inAccent -and $inAccent.Trim() -ne "") { $inAccent.Trim() } else { "olive" }

        # Q6: Features
        Write-Host "   [6/6] Enable Voice Synthesis (TTS)? (Y/n) [Default: Y]: " -NoNewline -ForegroundColor White
        $inTts = Read-Host
        $cfgTts = if ($inTts -and $inTts.Trim().ToLower() -eq "n") { "false" } else { "true" }

        $newConfigYaml = @"
# ==============================================================================
# RETRO TEMPLATE CATALOG WEBSITE -- ENGINE CONFIGURATION (build-config.yaml)
# ==============================================================================
# Generated via Guided Setup (build.ps1) on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ==============================================================================

# 1. Project Metadata
project:
  name: "$cfgName"
  title: "$cfgTitle"
  version: "1.1"
  description: "Tactile retro computing catalog template & dual-panel Bento playground"
  author: "$cfgAuthor"
  license: "MIT"

# 2. Deployment & URLs
urls:
  base: "$cfgUrl"
  github: "$cfgRepo"
  author_github: "https://github.com/$cfgAuthor"

# 3. Path Directories (Dynamic & Configurable)
paths:
  apps: "apps"          # Cartridge directory (apps/)
  source: "src"         # Core source engine (src/)
  output: "public"      # Compiled distribution (public/)

# 4. Engine Features & Preferences
features:
  theme_accent_default: "$cfgAccent"    # Default accent theme
  theme_mode_default: "theme-dark"       # Authentic Dark CRT Phosphor Mode
  bento_split_default: "60/40"           # 60% Left Stage / 40% Right Slidev Deck
  enable_tts: $cfgTts                    # 3-Stage Hybrid Text-to-Speech Engine
  enable_slidev: true                    # Interactive Slide Presentation Deck
"@
        Set-Content -Path $configYamlPath -Value $newConfigYaml -Encoding UTF8
        Write-Host ""
        Write-Host "      -> Successfully saved guided configuration to 'build-config.yaml'!" -ForegroundColor Green
    } elseif ($cfgChoice.Trim() -eq "2") {
        if (-not (Test-Path $configYamlPath) -and (Test-Path $configExamplePath)) {
            Copy-Item -Path $configExamplePath -Destination $configYamlPath -Force
        }
        Write-Host "   Opening '$configYamlPath' in text editor..." -ForegroundColor Cyan
        $editor = Get-Command "code" -ErrorAction SilentlyContinue
        if ($editor) {
            & code $configYamlPath
        } else {
            Start-Process notepad.exe -ArgumentList "`"$configYamlPath`""
        }
        Write-Host "   Press ENTER after you have saved and closed the file to proceed with build: " -NoNewline -ForegroundColor Yellow
        $null = Read-Host
    } else {
        Write-Host "      -> Continuing with existing configuration." -ForegroundColor DarkGray
    }
} else {
    Write-Host " [OK] (Configured)" -ForegroundColor Green
}

# -----------------------------------------------------------------------------
# STEP 4: PROMPT FOR APPS DIRECTORY
# -----------------------------------------------------------------------------
Write-Host "[4/5] Resolving Cartridge Directory (apps/)..." -ForegroundColor Cyan

# Default fallback
$defaultApps = "apps"

# Read from build-config.yaml if available
$configPaths = @(
    (Join-Path $ScriptDir "build-config.yaml"),
    (Join-Path $ScriptDir "build\build-config.yaml"),
    (Join-Path $ScriptDir "build-config.yamlexample"),
    (Join-Path $ScriptDir "build\build-config.yamlexample")
)
foreach ($cfg in $configPaths) {
    if (Test-Path $cfg) {
        $match = Select-String -Path $cfg -Pattern '^\s*apps:\s*["'']?([^"'']+)["'']?' | Select-Object -First 1
        if ($match -and $match.Matches.Groups.Count -gt 1) {
            $defaultApps = $match.Matches.Groups[1].Value.Trim()
            break
        }
    }
}

if (-not $AppsDir -and -not $NoPrompt) {
    Write-Host "      Where are your cartridge apps located?" -ForegroundColor White
    Write-Host "      [Default: $defaultApps (Press ENTER) or enter custom path]: " -NoNewline -ForegroundColor Yellow
    $userInput = Read-Host
    if ($userInput -and $userInput.Trim() -ne "") {
        $AppsDir = $userInput.Trim()
    } else {
        $AppsDir = $defaultApps
    }
} elseif (-not $AppsDir) {
    $AppsDir = $defaultApps
}

# Validate path
$resolvedAppsPath = if ([System.IO.Path]::IsPathRooted($AppsDir)) { $AppsDir } else { Join-Path $ScriptDir $AppsDir }

if (-not (Test-Path $resolvedAppsPath)) {
    Write-Host "      [NOTICE] Cartridge directory '$resolvedAppsPath' does not exist yet." -ForegroundColor Yellow
    Write-Host "      Creating directory with default structure..." -ForegroundColor DarkGray
    New-Item -ItemType Directory -Path $resolvedAppsPath -Force | Out-Null
}

Write-Host "      -> Target Apps Directory: $resolvedAppsPath" -ForegroundColor Green

# -----------------------------------------------------------------------------
# STEP 5: EXECUTE ZERO-DEPENDENCY COMPILER ENGINE
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[5/5] Executing compiler engine (src/modules/build-bundle.js)..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

$buildScript = Join-Path $ScriptDir "src\modules\build-bundle.js"
Push-Location $ScriptDir
try {
    & node $buildScript "--apps=$resolvedAppsPath"
} finally {
    Pop-Location
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  ✨ BUILD COMPLETE! Compiled distribution ready in ./public" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  Live Output : $ScriptDir\public\index.html" -ForegroundColor White
    Write-Host "  Apps Catalog: $ScriptDir\public\page-apps.html" -ForegroundColor White
    Write-Host "  Playground  : $ScriptDir\public\page-playground.html" -ForegroundColor White
    Write-Host ""

    if ($Serve -or (-not $NoPrompt -and (Read-Host "Start local preview server now? (y/N)") -eq "y")) {
        Write-Host "Starting local preview server on http://localhost:8080 ..." -ForegroundColor Cyan
        npx --yes serve public -p 8080
    }
} else {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Red
    Write-Host "  ❌ BUILD FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "======================================================================" -ForegroundColor Red
    exit $LASTEXITCODE
}
