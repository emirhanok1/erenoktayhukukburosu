const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Image resize configuration
const config = {
    mobile: { width: 768, suffix: '-mobile' },
    tablet: { width: 1200, suffix: '-tablet' },
    logo: { width: 150, suffix: '-optimized', file: 'logo.webp' }
};

// Images to process
const imagesToProcess = [
    'slider-8', 'slider-6', 'slider-9', 'slider-11',
    'abim-1', 'abim-2', 'abim-3', 'batucan',
    'ofis-1', 'ofis-2', 'ofis-3'
];

const imgDir = path.join(__dirname, 'img');
const results = [];

async function resizeImage(inputPath, outputPath, width) {
    try {
        const info = await sharp(inputPath)
            .resize(width, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality: 85 })
            .toFile(outputPath);

        return {
            success: true,
            width: info.width,
            height: info.height,
            size: info.size
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function processImages() {
    console.log('🚀 Starting image resize process...\n');

    // Process regular images (mobile + tablet)
    for (const imageName of imagesToProcess) {
        const originalFile = path.join(imgDir, `${imageName}.webp`);

        if (!fs.existsSync(originalFile)) {
            console.log(`⚠️  Skipping ${imageName}.webp (not found)`);
            continue;
        }

        const originalStats = fs.statSync(originalFile);
        const originalSize = originalStats.size;

        console.log(`\n📸 Processing: ${imageName}.webp (${(originalSize / 1024).toFixed(2)} KB)`);

        // Mobile version
        const mobileFile = path.join(imgDir, `${imageName}${config.mobile.suffix}.webp`);
        console.log(`   → Creating mobile version (${config.mobile.width}px)...`);
        const mobileResult = await resizeImage(originalFile, mobileFile, config.mobile.width);

        if (mobileResult.success) {
            console.log(`   ✅ Mobile: ${mobileResult.width}x${mobileResult.height} (${(mobileResult.size / 1024).toFixed(2)} KB)`);
        }

        // Tablet version
        const tabletFile = path.join(imgDir, `${imageName}${config.tablet.suffix}.webp`);
        console.log(`   → Creating tablet version (${config.tablet.width}px)...`);
        const tabletResult = await resizeImage(originalFile, tabletFile, config.tablet.width);

        if (tabletResult.success) {
            console.log(`   ✅ Tablet: ${tabletResult.width}x${tabletResult.height} (${(tabletResult.size / 1024).toFixed(2)} KB)`);
        }

        // Store results
        results.push({
            name: imageName,
            original: { size: originalSize },
            mobile: mobileResult.success ? { size: mobileResult.size, width: mobileResult.width, height: mobileResult.height } : null,
            tablet: tabletResult.success ? { size: tabletResult.size, width: tabletResult.width, height: tabletResult.height } : null
        });
    }

    // Process logo separately
    const logoOriginal = path.join(imgDir, config.logo.file);
    if (fs.existsSync(logoOriginal)) {
        const logoStats = fs.statSync(logoOriginal);
        console.log(`\n🏷️  Processing: logo.webp (${(logoStats.size / 1024).toFixed(2)} KB)`);
        console.log(`   → Creating optimized version (${config.logo.width}px)...`);

        const logoOptimized = path.join(imgDir, `logo${config.logo.suffix}.webp`);
        const logoResult = await resizeImage(logoOriginal, logoOptimized, config.logo.width);

        if (logoResult.success) {
            console.log(`   ✅ Optimized: ${logoResult.width}x${logoResult.height} (${(logoResult.size / 1024).toFixed(2)} KB)`);
            results.push({
                name: 'logo',
                original: { size: logoStats.size },
                optimized: { size: logoResult.size, width: logoResult.width, height: logoResult.height }
            });
        }
    }

    // Generate comparison table
    console.log('\n\n📊 SIZE COMPARISON TABLE\n');
    console.log('═'.repeat(80));
    console.log('Image Name          | Original      | Mobile (768px) | Tablet (1200px) | Savings');
    console.log('─'.repeat(80));

    let totalOriginal = 0;
    let totalMobile = 0;
    let totalTablet = 0;

    for (const result of results) {
        if (result.name === 'logo') {
            const originalKB = (result.original.size / 1024).toFixed(2);
            const optimizedKB = (result.optimized.size / 1024).toFixed(2);
            const savings = (((result.original.size - result.optimized.size) / result.original.size) * 100).toFixed(1);
            console.log(`${result.name.padEnd(20)}| ${originalKB.padStart(10)} KB | ${'Logo 150px'.padEnd(14)} | ${optimizedKB.padStart(11)} KB | ${savings}%`);
        } else {
            const originalKB = (result.original.size / 1024).toFixed(2);
            const mobileKB = result.mobile ? (result.mobile.size / 1024).toFixed(2) : 'N/A';
            const tabletKB = result.tablet ? (result.tablet.size / 1024).toFixed(2) : 'N/A';

            totalOriginal += result.original.size;
            if (result.mobile) totalMobile += result.mobile.size;
            if (result.tablet) totalTablet += result.tablet.size;

            const mobileSavings = result.mobile ? (((result.original.size - result.mobile.size) / result.original.size) * 100).toFixed(1) : 'N/A';
            const tabletSavings = result.tablet ? (((result.original.size - result.tablet.size) / result.original.size) * 100).toFixed(1) : 'N/A';

            console.log(`${result.name.padEnd(20)}| ${originalKB.padStart(10)} KB | ${(mobileKB + ' KB').padStart(14)} | ${(tabletKB + ' KB').padStart(15)} | M:${mobileSavings}% T:${tabletSavings}%`);
        }
    }

    console.log('═'.repeat(80));
    console.log(`\n📈 TOTAL SAVINGS:`);
    console.log(`   Original Total:  ${(totalOriginal / 1024).toFixed(2)} KB`);
    console.log(`   Mobile Total:    ${(totalMobile / 1024).toFixed(2)} KB (${(((totalOriginal - totalMobile) / totalOriginal) * 100).toFixed(1)}% reduction)`);
    console.log(`   Tablet Total:    ${(totalTablet / 1024).toFixed(2)} KB (${(((totalOriginal - totalTablet) / totalOriginal) * 100).toFixed(1)}% reduction)`);

    console.log('\n✅ All images processed successfully!\n');
}

processImages().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
