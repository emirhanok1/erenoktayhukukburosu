# PNG to WebP Converter Script
# Converts PNG files to WebP format using PowerShell

param(
    [string]$SourceDir = ".\img"
)

Write-Host "=== PNG to WebP Converter ===" -ForegroundColor Cyan
Write-Host "Searching for PNG files in: $SourceDir" -ForegroundColor Yellow
Write-Host ""

# Check if cwebp is available
$cwebpPath = Get-Command cwebp -ErrorAction SilentlyContinue

if (-not $cwebpPath) {
    Write-Host "[INFO] cwebp tool not found in PATH" -ForegroundColor Yellow
    Write-Host "[INFO] Attempting to use online conversion or manual process" -ForegroundColor Yellow
    Write-Host ""
    
    # Get all PNG files
    $pngFiles = Get-ChildItem -Path $SourceDir -Filter "*.png"
    
    if ($pngFiles.Count -eq 0) {
        Write-Host "[WARNING] No PNG files found to convert" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "Found $($pngFiles.Count) PNG files:" -ForegroundColor Green
    foreach ($file in $pngFiles) {
        Write-Host "  - $($file.Name)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "MANUAL CONVERSION REQUIRED:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://convertio.co/png-webp/" -ForegroundColor White
    Write-Host "2. Upload all PNG files from: $SourceDir" -ForegroundColor White
    Write-Host "3. Download converted WebP files" -ForegroundColor White
    Write-Host "4. Save WebP files to: $SourceDir" -ForegroundColor White
    Write-Host ""
    Write-Host "OR use Windows built-in tools:" -ForegroundColor Yellow
    Write-Host "Download cwebp from: https://developers.google.com/speed/webp/download" -ForegroundColor White
    
}
else {
    Write-Host "[OK] cwebp tool found: $($cwebpPath.Source)" -ForegroundColor Green
    
    # Get all PNG files
    $pngFiles = Get-ChildItem -Path $SourceDir -Filter "*.png"
    
    if ($pngFiles.Count -eq 0) {
        Write-Host "[WARNING] No PNG files found to convert" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "Converting $($pngFiles.Count) PNG files to WebP..." -ForegroundColor Green
    Write-Host ""
    
    $converted = 0
    foreach ($pngFile in $pngFiles) {
        $webpFile = $pngFile.FullName -replace '\.png$', '.webp'
        
        try {
            # Convert with quality 90
            & cwebp -q 90 $pngFile.FullName -o $webpFile | Out-Null
            
            if (Test-Path $webpFile) {
                Write-Host "[OK] Converted: $($pngFile.Name) -> $(Split-Path $webpFile -Leaf)" -ForegroundColor Green
                $converted++
                
                # Optionally delete PNG file
                # Remove-Item $pngFile.FullName -Force
            }
        }
        catch {
            Write-Host "[ERROR] Failed to convert: $($pngFile.Name) - $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "=== Conversion Complete ===" -ForegroundColor Cyan
    Write-Host "Successfully converted: $converted files" -ForegroundColor Green
}

Write-Host ""
Write-Host "[DONE] Script completed!" -ForegroundColor Green
