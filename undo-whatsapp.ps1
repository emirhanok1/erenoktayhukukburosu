$projectPath = "c:\Users\Monster\Documents\GitHub\erenoktayhukukburosu"

# 1. Revert js/main.js
$jsFile = Join-Path $projectPath "js\main.js"
if (Test-Path $jsFile) {
    Write-Host "Reverting main.js..." -ForegroundColor Yellow
    $jsContent = Get-Content $jsFile -Raw -Encoding UTF8
    
    # Remove the appended global injection
    $jsContent = $jsContent -replace '(?s)// Global WhatsApp Button Injection.*?}\);\s*$', ''
    
    # Restore the original block
    $origBlock = @"
    // --- WhatsApp ---
    const whatsappBtn = document.createElement('a');
    whatsappBtn.href = "https://wa.me/905074007140";
    whatsappBtn.target = "_blank";
    whatsappBtn.className = "whatsapp-btn";
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    whatsappBtn.style.cssText = `
        position: fixed; bottom: 20px; left: 20px;
        background-color: #25D366; color: white; width: 60px; height: 60px;
        border-radius: 50%; text-align: center; line-height: 60px; font-size: 30px;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.3); z-index: 10000000;
        transition: all 0.3s ease;
    `;
    whatsappBtn.onmouseover = () => whatsappBtn.style.transform = 'scale(1.1)';
    whatsappBtn.onmouseout = () => whatsappBtn.style.transform = 'scale(1)';
    document.body.appendChild(whatsappBtn);
"@
    
    # Replace the placeholder we left
    $jsContent = $jsContent -replace '// --- WhatsApp Logic Removed \(Moved to Global Injection\) ---', $origBlock
    
    Set-Content $jsFile $jsContent -Encoding UTF8 -NoNewline
    Write-Host "  > main.js Reverted." -ForegroundColor Green
}

# 2. Restore HTMLs
# about.html & contact.html -> Inline Button
$inlineBtn = '<a href="https://wa.me/905074007140" target="_blank" class="whatsapp-btn" style="position: fixed; bottom: 20px; left: 20px; background-color: rgb(37, 211, 102); color: white; width: 60px; height: 60px; border-radius: 50%; text-align: center; line-height: 60px; font-size: 30px; box-shadow: rgba(0, 0, 0, 0.3) 2px 2px 10px; z-index: 10000000; transition: 0.3s;"><i class="fab fa-whatsapp"></i></a>'

# blog.html -> Float Button (Old style, outside wrapper normally)
$floatBtn = '<a href="https://wa.me/905074007140" class="whatsapp-float" target="_blank" aria-label="WhatsApp ile İletişim"><i class="fab fa-whatsapp"></i></a>'

$filesToRestore = @("about.html", "contact.html", "blog.html")

foreach ($fname in $filesToRestore) {
    $path = Join-Path $projectPath $fname
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding UTF8
        $orig = $content
        
        # Check if button exists. If not, append it (after back-to-top or before body end)
        if ($content -notmatch 'whatsapp-(float|btn)') {
            Write-Host "Restoring button in $fname..." -ForegroundColor Yellow
            
            # Determine which button
            $btnCode = if ($fname -eq "blog.html") { $floatBtn } else { $inlineBtn }
            
            # Insert after back-to-top if exists, else before body end
            if ($content -match 'class="back-to-top".*?</a>') {
                 $content = $content -replace '(class="back-to-top".*?</a>)', "`$1`n    $btnCode"
            } else {
                 $content = $content -replace '</body>', "$btnCode`n</body>"
            }
            
            Set-Content $path $content -Encoding UTF8 -NoNewline
            Write-Host "  > Restored." -ForegroundColor Green
        } else {
            Write-Host "$fname already has a button." -ForegroundColor Gray
        }
    }
}
