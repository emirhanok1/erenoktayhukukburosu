const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesToOptimize = [
    { input: 'img/slider-8.webp', output: 'img/slider-8-optimized.webp' },
    { input: 'img/slider-7.webp', output: 'img/slider-7-optimized.webp' },
    { input: 'img/slider-2.webp', output: 'img/slider-2-optimized.webp' },
    { input: 'img/slider-3.webp', output: 'img/slider-3-optimized.webp' }
];

async function optimizeImages() {
    for (const img of imagesToOptimize) {
        try {
            console.log(`Optimizing ${img.input}...`);

            await sharp(img.input)
                .resize(1920, 1080, { fit: 'cover', position: 'center' })
                .webp({ quality: 80, effort: 6 })
                .toFile(img.output);

            const inputStats = fs.statSync(img.input);
            const outputStats = fs.statSync(img.output);
            const savedMB = ((inputStats.size - outputStats.size) / 1024 / 1024).toFixed(2);

            console.log(`✅ ${img.input}: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB → ${(outputStats.size / 1024 / 1024).toFixed(2)} MB (Saved ${savedMB} MB)`);
        } catch (error) {
            console.error(`❌ Error optimizing ${img.input}:`, error.message);
        }
    }

    console.log('\n🎉 Optimization complete! Review optimized files before replacing originals.');
}

optimizeImages();
