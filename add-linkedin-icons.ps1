# Add LinkedIn Icons Script
# Adds LinkedIn icons to top-bar social and footer social sections

$projectPath = "c:\Users\Monster\Documents\GitHub\erenoktayhukukburosu"

$filesToUpdate = @(
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

Write-Host "Adding LinkedIn Icons" -ForegroundColor Cyan

foreach ($file in $filesToUpdate) {
    $filePath = Join-Path $projectPath $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # LinkedIn icon for top-bar
        $linkedInTop = @"
                                <a href="https://www.linkedin.com/in/eren-oktay-4585a1343" target="_blank"><i class="fab fa-linkedin-in"></i></a>
"@
        
        # LinkedIn icon for footer
        $linkedInFooter = @"
                                            <a href="https://www.linkedin.com/in/eren-oktay-4585a1343"><i class="fab fa-linkedin-in"></i></a>
"@
        
        # Add LinkedIn to top-bar social (if not already present)
        if ($content -notmatch 'linkedin-in.*top-bar|top-bar.*linkedin-in') {
            $content = $content -replace '(<a href="https://www\.facebook\.com/Av\.ErenOktay/" target="_blank"><i\s+class="fab fa-facebook-f"></i></a>)', "`$1`r`n$linkedInTop"
        }
        
        # Update footer social links with correct URLs and add LinkedIn
        $footerPattern = '<div class="footer-social">\s*<a href="#"><i class="fab fa-facebook-f"></i></a>\s*<a href="#"><i class="fab fa-instagram"></i></a>\s*</div>'
        $footerReplacement = @"
<div class="footer-social">
                                            <a href="https://www.facebook.com/Av.ErenOktay/"><i class="fab fa-facebook-f"></i></a>
                                            <a href="https://www.linkedin.com/in/eren-oktay-4585a1343"><i class="fab fa-linkedin-in"></i></a>
                                            <a href="https://www.instagram.com/av.erenoktay/"><i class="fab fa-instagram"></i></a>
                                        </div>
"@
        if ($content -match '<div class="footer-social">') {
            $content = $content -replace '<div class="footer-social">\s*<a href="#"><i class="fab fa-facebook-f"></i></a>\s*<a href="#"><i class="fab fa-instagram"></i></a>\s*</div>', $footerReplacement
        }
        
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Success - LinkedIn icons added" -ForegroundColor Green
    }
}

Write-Host "" -ForegroundColor White
Write-Host "LinkedIn icons update completed!" -ForegroundColor Cyan
