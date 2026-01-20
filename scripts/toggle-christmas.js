const fs = require('fs');
const path = require('path');

/**
 * Toggle Christmas Theme Script
 * 
 * 1. Renames frontend/theme/christmas/loader.js -> loader.js.disabled (Global Kill Switch)
 * 2. Scans ALL HTML files in frontend/pages/ and comments out direct references
 */

const FRONTEND_DIR = path.join(__dirname, '../frontend');
const PAGES_DIR = path.join(FRONTEND_DIR, 'pages');
const THEME_LOADER_PATH = path.join(FRONTEND_DIR, 'theme/christmas/loader.js');
const THEME_LOADER_DISABLED_PATH = path.join(FRONTEND_DIR, 'theme/christmas/loader.js.disabled');
const ENCODING = 'utf8';

// Helper to find all HTML files
function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getHtmlFiles(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

function toggleChristmas() {
    // Check if we are checking status or toggling based on file existence
    const isCurrentlyEnabled = fs.existsSync(THEME_LOADER_PATH);
    const isCurrentlyDisabled = fs.existsSync(THEME_LOADER_DISABLED_PATH);

    // If neither exists, something is wrong, or maybe just HTMLs have it
    // We assume if loader.js exists, it's enabled.

    if (isCurrentlyEnabled) {
        console.log('🎄 Disabling Christmas Theme globally...');
        disableChristmas();
    } else if (isCurrentlyDisabled) {
        console.log('🎅 Enabling Christmas Theme globally...');
        enableChristmas();
    } else {
        // Fallback: If loader files are missing/confusing, assume disabled and try to enable? 
        // Or assume enabled (maybe implied) and try to disable?
        // Let's check the content of index.html to guess
        console.log('⚠️ Loader file state unclear. Checking index.html...');
        const indexFile = path.join(PAGES_DIR, 'index.html');
        if (fs.existsSync(indexFile)) {
            const content = fs.readFileSync(indexFile, ENCODING);
            if (content.includes('<!-- 🎄 Christmas Theme DISABLED 🎄 -->')) {
                console.log('🎅 Detected DISABLED state in HTML. Enabling...');
                enableChristmas();
            } else {
                console.log('🎄 Defaulting to Disable...');
                disableChristmas();
            }
        } else {
            console.error('❌ Could not determine state. Please check frontend/theme/christmas/');
        }
    }
}

function disableChristmas() {
    // 1. Rename loader.js to loader.js.disabled (Force disable even if script tag remains)
    if (fs.existsSync(THEME_LOADER_PATH)) {
        try {
            fs.renameSync(THEME_LOADER_PATH, THEME_LOADER_DISABLED_PATH);
            console.log('✅ Renamed loader.js to loader.js.disabled');
        } catch (e) {
            console.error('❌ Failed to rename loader.js:', e.message);
        }
    }

    // 2. Scan ALL HTML files and comment out the script/css if present
    const htmlFiles = getHtmlFiles(PAGES_DIR);
    let modifiedCount = 0;

    htmlFiles.forEach(file => {
        let content = fs.readFileSync(file, ENCODING);
        let originalContent = content;

        // Comment out loader script
        // Matches: <script src="../theme/christmas/loader.js"></script> or similar
        content = content.replace(
            /(\s*)<script src="[^"]*theme\/christmas\/loader\.js"><\/script>/g,
            '$1<!-- 🎄 Christmas Loader DISABLED 🎄 -->\n$1<!-- <script src="../theme/christmas/loader.js"></script> -->'
        );

        // Comment out CSS if linked directly
        content = content.replace(
            /(\s*)<link rel="stylesheet" href="[^"]*theme\/christmas\/theme\.css">/g,
            '$1<!-- 🎄 Christmas CSS DISABLED 🎄 -->\n$1<!-- <link rel="stylesheet" href="../theme/christmas/theme.css"> -->'
        );

        // Remove/Comment specific decorations if they exist as static HTML
        // Santa
        content = content.replace(
            /(\s*)<img src="[^"]*santa-hanging\.png"[^>]*>/g,
            '$1<!-- 🎅 Santa DISABLED 🎅 -->\n$1<!-- $& -->'
        );
        // Navbar Garland
        content = content.replace(
            /(\s*)<div class="navbar-garland"><\/div>/g,
            '$1<!-- 🎄 Garland DISABLED 🎄 -->\n$1<!-- $& -->'
        );


        if (content !== originalContent) {
            fs.writeFileSync(file, content, ENCODING);
            modifiedCount++;
            console.log(`   Processed: ${path.basename(file)}`);
        }
    });

    console.log(`✅ Christmas decorations removed from ${modifiedCount} pages.`);
}

function enableChristmas() {
    // 1. Rename loader.js.disabled back to loader.js
    if (fs.existsSync(THEME_LOADER_DISABLED_PATH)) {
        try {
            fs.renameSync(THEME_LOADER_DISABLED_PATH, THEME_LOADER_PATH);
            console.log('✅ Renamed loader.js.disabled to loader.js');
        } catch (e) {
            console.error('❌ Failed to restore loader.js:', e.message);
        }
    }

    // 2. Scan ALL HTML files and uncomment
    const htmlFiles = getHtmlFiles(PAGES_DIR);
    let modifiedCount = 0;

    htmlFiles.forEach(file => {
        let content = fs.readFileSync(file, ENCODING);
        let originalContent = content;

        // Restore Script
        content = content.replace(
            /<!-- 🎄 Christmas Loader DISABLED 🎄 -->\s*<!-- (<script src="\.\.\/theme\/christmas\/loader\.js"><\/script>) -->/g,
            '$1'
        );

        // Restore CSS
        content = content.replace(
            /<!-- 🎄 Christmas CSS DISABLED 🎄 -->\s*<!-- (<link rel="stylesheet" href="\.\.\/theme\/christmas\/theme\.css">) -->/g,
            '$1'
        );

        // Restore Santa
        content = content.replace(
            /<!-- 🎅 Santa DISABLED 🎅 -->\s*<!-- (<img src="[^"]*santa-hanging\.png"[^>]*>) -->/g,
            '$1'
        );

        // Restore Garland
        content = content.replace(
            /<!-- 🎄 Garland DISABLED 🎄 -->\s*<!-- (<div class="navbar-garland"><\/div>) -->/g,
            '$1'
        );

        if (content !== originalContent) {
            fs.writeFileSync(file, content, ENCODING);
            modifiedCount++;
            console.log(`   Restored: ${path.basename(file)}`);
        }
    });

    console.log(`✅ Christmas decorations restored in ${modifiedCount} pages.`);
}

toggleChristmas();
