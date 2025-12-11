const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Configuration
const ASSETS_DIR = path.join(__dirname, '../../frontend/assets/img');
const MAX_WIDTH = 1000; // Max width for product images
const QUALITY = 80;
const FORMAT = 'webp'; // Convert to webp for better performance

// Check for sharp
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: "sharp" library not found.');
    console.error('Please run: npm install sharp --save-dev');
    console.error('In the backend directory.');
    process.exit(1);
}

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

async function optimizeImages() {
    console.log(`\x1b[36mStarting image optimization in: ${ASSETS_DIR}\x1b[0m`);

    try {
        const files = await getFiles(ASSETS_DIR);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

        console.log(`Found ${imageFiles.length} images to check.`);

        for (const file of imageFiles) {
            const relativePath = path.relative(ASSETS_DIR, file);

            try {
                const image = sharp(file);
                const metadata = await image.metadata();

                let shouldOptimize = false;
                let reasons = [];

                if (metadata.width > MAX_WIDTH) {
                    shouldOptimize = true;
                    reasons.push(`Width ${metadata.width}px > ${MAX_WIDTH}px`);
                }

                if (path.extname(file).toLowerCase() !== '.webp') {
                    // Start conversion process
                    // We will create a new .webp file
                    const newFile = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');

                    console.log(`Optimizing: ${relativePath} [Format Change -> WebP]`);

                    await image
                        .resize({ width: metadata.width > MAX_WIDTH ? MAX_WIDTH : undefined, withoutEnlargement: true })
                        .webp({ quality: QUALITY })
                        .toFile(newFile);

                    console.log(`\x1b[32m  ✓ Created: ${path.relative(ASSETS_DIR, newFile)}\x1b[0m`);

                    // Optional: Delete original if you want to enforce webp, but maybe risky.
                    // For now, we prefer to keep original as source or just warn user.
                    // Let's just say we create the optimized version.
                } else if (shouldOptimize) {
                    // It is already webp but too big? (Unlikely given filter above excludes webp sources)
                }

            } catch (err) {
                console.error(`\x1b[31m  ✗ Error processing ${relativePath}: ${err.message}\x1b[0m`);
            }
        }
        console.log('\x1b[36mOptimization complete.\x1b[0m');

    } catch (err) {
        console.error('Error scanning directory:', err);
    }
}

optimizeImages();
