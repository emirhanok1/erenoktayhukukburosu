const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Image Optimization Script
 * Optimizes slider images to WebP format with target size < 200KB
 */

const IMG_DIR = path.join(__dirname, 'img');

const TARGETS = [
    { input: 'slider-1.jpg', outputWebp: 'slider-1-opt.webp', outputJpg: 'slider-1-opt.jpg' },
    { input: 'slider-2.jpg', outputWebp: 'slider-2-opt.webp', outputJpg: 'slider-2-opt.jpg' },
    { input: 'slider-3.jpg', outputWebp: 'slider-3-opt.webp', outputJpg: 'slider-3-opt.jpg' }
];

const TARGET_SIZE_KB = 200;
const MAX_WIDTH = 1920; // Full HD width for hero images

async function optimizeImage(config) {
    const inputPath = path.join(IMG_DIR, config.input);
    const outputWebpPath = path.join(IMG_DIR, config.outputWebp);
    const outputJpgPath = path.join(IMG_DIR, config.outputJpg);

    console.log(`\n📸 Processing: ${config.input}`);

    try {
        // Get original file size
        const originalStats = fs.statSync(inputPath);
        const originalSizeKB = (originalStats.size / 1024).toFixed(2);
        console.log(`   Original size: ${originalSizeKB} KB`);

        // Optimize to WebP with quality adjustment
        let quality = 80;
        let webpBuffer;
        let finalQuality = quality;

        // Iteratively reduce quality until target size is met
        while (quality > 40) {
            webpBuffer = await sharp(inputPath)
                .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                .webp({ quality })
                .toBuffer();

            const sizeKB = webpBuffer.length / 1024;

            if (sizeKB <= TARGET_SIZE_KB) {
                finalQuality = quality;
                break;
            }

            quality -= 5;
        }

        // Write optimized WebP
        await sharp(webpBuffer).toFile(outputWebpPath);
        const webpStats = fs.statSync(outputWebpPath);
        const webpSizeKB = (webpStats.size / 1024).toFixed(2);
        console.log(`   ✅ WebP created: ${webpSizeKB} KB (quality: ${finalQuality}%)`);

        // Create optimized JPG fallback (slightly higher quality)
        await sharp(inputPath)
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .jpeg({ quality: Math.min(finalQuality + 10, 90) })
            .toFile(outputJpgPath);

        const jpgStats = fs.statSync(outputJpgPath);
        const jpgSizeKB = (jpgStats.size / 1024).toFixed(2);
        console.log(`   ✅ JPG fallback created: ${jpgSizeKB} KB`);

        const savings = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);
        console.log(`   💾 Size reduction: ${savings}%`);

    } catch (error) {
        console.error(`   ❌ Error processing ${config.input}:`, error.message);
    }
}

async function main() {
    console.log('🚀 Starting Image Optimization...\n');
    console.log(`Target: < ${TARGET_SIZE_KB} KB per image\n`);

    for (const config of TARGETS) {
        await optimizeImage(config);
    }

    console.log('\n✨ Optimization complete!');
}

main().catch(console.error);
