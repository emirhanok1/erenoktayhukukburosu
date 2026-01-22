# Image Resize Script for Performance Optimization
# Resizes images to mobile (768px) and tablet (1200px) versions
# Requires: .NET Framework (built-in on Windows)

param(
    [string]$SourceDir = ".\img",
    [int]$MobileWidth = 768,
    [int]$TabletWidth = 1200,
    [int]$LogoWidth = 150
)

Write-Host "=== Image Resize Script for Performance Optimization ===" -ForegroundColor Cyan
Write-Host "Source Directory: $SourceDir" -ForegroundColor Yellow
Write-Host "Mobile Width: ${MobileWidth}px" -ForegroundColor Yellow
Write-Host "Tablet Width: ${TabletWidth}px" -ForegroundColor Yellow
Write-Host ""

# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [int]$TargetWidth
    )
    
    try {
        # Load the source image
        $srcImage = [System.Drawing.Image]::FromFile($SourcePath)
        
        # Calculate new height maintaining aspect ratio
        $aspectRatio = $srcImage.Height / $srcImage.Width
        $targetHeight = [int]($TargetWidth * $aspectRatio)
        
        # Create new bitmap
        $destImage = New-Object System.Drawing.Bitmap($TargetWidth, $targetHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($destImage)
        
        # Set high quality rendering
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Draw resized image
        $graphics.DrawImage($srcImage, 0, 0, $TargetWidth, $targetHeight)
        
        # Save as PNG first (WebP conversion would require additional tools)
        $tempPng = $DestPath -replace '\.webp$', '.png'
        $destImage.Save($tempPng, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Clean up
        $graphics.Dispose()
        $destImage.Dispose()
        $srcImage.Dispose()
        
        Write-Host "  [OK] Created: $tempPng (${TargetWidth}x${targetHeight})" -ForegroundColor Green
        
        return $tempPng
    }
    catch {
        Write-Host "  [ERROR] Error: $_" -ForegroundColor Red
        return $null
    }
}

# Define images to process
$imagesToProcess = @(
    # Hero sliders (priority)
    @{Name = "slider-8.webp"; ProcessFor = @("mobile", "tablet") },
    @{Name = "slider-6.webp"; ProcessFor = @("mobile", "tablet") },
    @{Name = "slider-9.webp"; ProcessFor = @("mobile", "tablet") },
    @{Name = "slider-11.webp"; ProcessFor = @("mobile", "tablet") },
    
    # Team photos
    @{Name = "abim-1.webp"; ProcessFor = @("mobile", "tablet") },
    @{Name = "abim-2.webp"; ProcessFor = @("mobile", "tablet") },
    @{Name = "abim-3.webp"; ProcessFor = @("mobile", "tablet") },
    @{Name = "batucan.webp"; ProcessFor = @("mobile", "tablet") },
    
    # Office images
    @{Name = "ofis-1.webp"; ProcessFor = @("mobile", "tablet") },
    @{Name = "ofis-2.webp"; ProcessFor = @("mobile", "tablet") },
    @{Name = "ofis-3.webp"; ProcessFor = @("mobile", "tablet") },
    
    # Logo (special case - only one size)
    @{Name = "logo.webp"; ProcessFor = @("logo") }
)

$totalProcessed = 0
$totalCreated = 0
$pngFiles = @()

foreach ($imageInfo in $imagesToProcess) {
    $imageName = $imageInfo.Name
    $sourcePath = Join-Path $SourceDir $imageName
    
    if (-not (Test-Path $sourcePath)) {
        Write-Host "[WARNING] Skipping: $imageName (not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`nProcessing: $imageName" -ForegroundColor Cyan
    $totalProcessed++
    
    foreach ($size in $imageInfo.ProcessFor) {
        if ($size -eq "mobile") {
            $suffix = "-mobile"
            $width = $MobileWidth
            $destPath = $sourcePath -replace '\.webp$', "$suffix.webp"
            $result = Resize-Image -SourcePath $sourcePath -DestPath $destPath -TargetWidth $width
            if ($result) { 
                $totalCreated++
                $pngFiles += $result
            }
        }
        elseif ($size -eq "tablet") {
            $suffix = "-tablet"
            $width = $TabletWidth
            $destPath = $sourcePath -replace '\.webp$', "$suffix.webp"
            $result = Resize-Image -SourcePath $sourcePath -DestPath $destPath -TargetWidth $width
            if ($result) { 
                $totalCreated++
                $pngFiles += $result
            }
        }
        elseif ($size -eq "logo") {
            $suffix = "-optimized"
            $width = $LogoWidth
            $destPath = $sourcePath -replace '\.webp$', "$suffix.webp"
            $result = Resize-Image -SourcePath $sourcePath -DestPath $destPath -TargetWidth $width
            if ($result) { 
                $totalCreated++
                $pngFiles += $result
            }
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Processed: $totalProcessed images" -ForegroundColor Green
Write-Host "Created: $totalCreated PNG files" -ForegroundColor Green

Write-Host "`n[IMPORTANT] NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Convert PNG files to WebP format using an online tool or cwebp command" -ForegroundColor White
Write-Host "2. Recommended: https://squoosh.app/ or use cwebp CLI" -ForegroundColor White
Write-Host "3. PNG files created in: $SourceDir" -ForegroundColor White
Write-Host ""
Write-Host "PNG files to convert:" -ForegroundColor Yellow
foreach ($png in $pngFiles) {
    Write-Host "  - $png" -ForegroundColor White
}

Write-Host "`n[DONE] Script completed!" -ForegroundColor Green
