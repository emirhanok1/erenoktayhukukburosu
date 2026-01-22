# Quick Image Duplicate Script
# Creates mobile and tablet versions by copying original WebP files
# User can optimize these later with proper tools

param(
    [string]$SourceDir = ".\img"
)

Write-Host "=== Creating Responsive Image Versions ===" -ForegroundColor Cyan
Write-Host "Source Directory: $SourceDir" -ForegroundColor Yellow
Write-Host ""

# Define images to process
$imagesToProcess = @(
    "slider-8.webp",
    "slider-6.webp",
    "slider-9.webp",
    "slider-11.webp",
    "abim-1.webp",
    "abim-2.webp",
    "abim-3.webp",
    "batucan.webp",
    "ofis-1.webp",
    "ofis-2.webp",
    "ofis-3.webp"
)

$totalCreated = 0

foreach ($imageName in $imagesToProcess) {
    $sourcePath = Join-Path $SourceDir $imageName
    
    if (-not (Test-Path $sourcePath)) {
        Write-Host "[WARNING] Skipping: $imageName (not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing: $imageName" -ForegroundColor Cyan
    
    # Create mobile version
    $mobilePath = $sourcePath -replace '\.webp$', '-mobile.webp'
    if (-not (Test-Path $mobilePath)) {
        Copy-Item $sourcePath $mobilePath -Force
        Write-Host "  [OK] Created: $(Split-Path $mobilePath -Leaf)" -ForegroundColor Green
        $totalCreated++
    }
    else {
        Write-Host "  [SKIP] Already exists: $(Split-Path $mobilePath -Leaf)" -ForegroundColor Yellow
    }
    
    # Create tablet version
    $tabletPath = $sourcePath -replace '\.webp$', '-tablet.webp'
    if (-not (Test-Path $tabletPath)) {
        Copy-Item $sourcePath $tabletPath -Force
        Write-Host "  [OK] Created: $(Split-Path $tabletPath -Leaf)" -ForegroundColor Green
        $totalCreated++
    }
    else {
        Write-Host "  [SKIP] Already exists: $(Split-Path $tabletPath -Leaf)" -ForegroundColor Yellow
    }
}

# Handle logo separately
$logoSource = Join-Path $SourceDir "logo.webp"
if (Test-Path $logoSource) {
    Write-Host "`nProcessing: logo.webp" -ForegroundColor Cyan
    $logoOptimized = Join-Path $SourceDir "logo-optimized.webp"
    if (-not (Test-Path $logoOptimized)) {
        Copy-Item $logoSource $logoOptimized -Force
        Write-Host "  [OK] Created: logo-optimized.webp" -ForegroundColor Green
        $totalCreated++
    }
    else {
        Write-Host "  [SKIP] Already exists: logo-optimized.webp" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Created: $totalCreated responsive image versions" -ForegroundColor Green
Write-Host ""
Write-Host "[NOTE] These are temporary full-size copies" -ForegroundColor Yellow
Write-Host "[NOTE] For production, optimize these files at:" -ForegroundColor Yellow
Write-Host "  - Mobile versions: 768px width" -ForegroundColor White
Write-Host "  - Tablet versions: 1200px width" -ForegroundColor White
Write-Host "  - Use: https://squoosh.app/ or imagemagick" -ForegroundColor White
Write-Host ""
Write-Host "[DONE] Script completed!" -ForegroundColor Green
