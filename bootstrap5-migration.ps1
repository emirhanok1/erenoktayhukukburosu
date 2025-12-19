# Bootstrap 5 Batch Update Script
# This script automates the Bootstrap 4 -> 5 migration for multiple HTML files

$projectPath = "c:\Users\Monster\Documents\GitHub\erenoktayhukukburosu"

# Define file groups to process
$publicPages = @(
    "about.html",
    "service.html",
    "team.html",
    "blog.html",
    "single.html",
    "portfolio.html",
    "kvkk.html",
    "404.html",
    "infaz-hesaplama.html",
    "is-kazasi-tazminat.html"
)

Write-Host "Bootstrap 5 Migration Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

foreach ($file in $publicPages) {
    $filePath = Join-Path $projectPath $file
    
    if (Test-Path $filePath) {
        Write-Host "`nProcessing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        
        # Bootstrap CDN replacements
        $content = $content -replace 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous'
        
        $content = $content -replace 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous'
        
        # Data attribute conversions
        $content = $content -replace 'data-toggle="', 'data-bs-toggle="'
        $content = $content -replace 'data-target="', 'data-bs-target="'
        $content = $content -replace 'data-dismiss="', 'data-bs-dismiss="'
        $content = $content -replace 'data-slide="', 'data-bs-slide="'
        $content = $content -replace 'data-slide-to="', 'data-bs-slide-to="'
        $content = $content -replace 'data-ride="', 'data-bs-ride="'
        $content = $content -replace 'data-interval="', 'data-bs-interval="'
        
        # Class conversions
        $content = $content -replace '\bmr-auto\b', 'me-auto'
        $content = $content -replace '\bml-auto\b', 'ms-auto'
        $content = $content -replace '\bml-2\b', 'ms-2'
        $content = $content -replace '\bmr-2\b', 'me-2'
        $content = $content -replace '\bml-3\b', 'ms-3'
        $content = $content -replace '\bmr-3\b', 'me-3'
        
        # Modal close button conversion
        $content = $content -replace '<button\s+type="button"\s+class="close"\s+data-bs-dismiss="modal"\s+aria-label="Close">\s*<span\s+aria-hidden="true">&times;</span>\s*</button>', '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
        
        # sr-only -> visually-hidden
        $content = $content -replace '\bsr-only\b', 'visually-hidden'
        
        # Add WhatsApp button before closing div wrapper
        $whatsappHtml = @"
        <a href="https://wa.me/905074007140" class="whatsapp-float" target="_blank" aria-label="WhatsApp ile İletişim">
            <i class="fab fa-whatsapp"></i>
        </a>
"@
        
        if ($content -notmatch 'whatsapp-float' -and $content -match '<a href="#" class="back-to-top">') {
            $content = $content -replace '(<a href="#" class="back-to-top"><i class="fa fa-chevron-up"></i></a>)', "`$1`r`n$whatsappHtml"
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  Success - Updated successfully" -ForegroundColor Green
        } else {
            Write-Host "  Info - No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "`nFile not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n`nBatch update completed!" -ForegroundColor Cyan
