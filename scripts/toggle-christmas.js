const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '../frontend/pages/index.html');
const ENCODING = 'utf8';

// The HTML for the snow container (30 flakes) to restore when enabling
const SNOW_CONTAINER_HTML = `    <!-- Global Snow Container -->
    <div class="global-snow-container">
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div> <!-- 20 -->
        <!-- More Snowflakes 21-30 -->
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
    </div>`;

function toggleChristmas() {
    if (!fs.existsSync(INDEX_PATH)) {
        console.error('Error: index.html not found at', INDEX_PATH);
        return;
    }

    let content = fs.readFileSync(INDEX_PATH, ENCODING);

    // Check current state by looking for the DISABLED marker we add
    const isDisabled = content.includes('<!-- 🎄 Christmas Theme DISABLED 🎄 -->');

    if (!isDisabled) {
        console.log('🎄 Disabling Christmas Theme...');
        disableChristmas(content);
    } else {
        console.log('🎅 Enabling Christmas Theme...');
        enableChristmas(content);
    }
}

function disableChristmas(content) {
    let newContent = content;

    // 1. Disable CSS Link
    newContent = newContent.replace(
        /<!-- 🎄 Christmas Theme 🎄 -->\s*<link rel="stylesheet" href="\.\.\/theme\/christmas\/theme\.css">/,
        `<!-- 🎄 Christmas Theme DISABLED 🎄 -->
    <!-- <link rel="stylesheet" href="../theme/christmas/theme.css"> -->`
    );

    // 2. Disable Santa Climber
    newContent = newContent.replace(
        /<!-- 🎅 Climbing Santa 🎅 -->\s*<img src="\.\.\/theme\/christmas\/santa\.svg" class="santa-climber" alt="Santa Climbing">/,
        `<!-- 🎅 Climbing Santa DISABLED 🎅 -->
    <!-- <img src="../theme/christmas/santa.svg" class="santa-climber" alt="Santa Climbing"> -->`
    );

    // 3. Disable Garland
    newContent = newContent.replace(
        /<!-- 🎄 Navbar Garland Decoration 🎄 -->\s*<div class="navbar-garland"><\/div>/,
        `<!-- 🎄 Navbar Garland Decoration DISABLED 🎄 -->
    <!-- <div class="navbar-garland"></div> -->`
    );

    // 4. Disable Separator
    newContent = newContent.replace(
        /<!-- 🎄 Christmas Separator \(Snow Waves & Sled\) 🎄 -->\s*<div class="christmas-separator"><\/div>/,
        `<!-- 🎄 Christmas Separator DISABLED 🎄 -->
    <!-- <div class="christmas-separator"></div> -->`
    );

    // 5. Remove Snow Container (Replace with placeholder)
    // Regex matches indent, comments, start tag, content, and the closing div that has matching indentation
    const snowRegex = /\s*<!-- Global Snow Container -->\s*<div class="global-snow-container">[\s\S]*?    <\/div>/;
    newContent = newContent.replace(snowRegex, '\n    <!-- CHRISTMAS_SNOW_REMOVED -->');

    fs.writeFileSync(INDEX_PATH, newContent, ENCODING);
    console.log('✅ Christmas decorations removed!');
}

function enableChristmas(content) {
    let newContent = content;

    // 1. Enable CSS Link
    newContent = newContent.replace(
        /<!-- 🎄 Christmas Theme DISABLED 🎄 -->\s*<!-- (<link rel="stylesheet" href="\.\.\/theme\/christmas\/theme\.css">) -->/,
        `<!-- 🎄 Christmas Theme 🎄 -->
    $1`
    );

    // 2. Enable Santa
    newContent = newContent.replace(
        /<!-- 🎅 Climbing Santa DISABLED 🎅 -->\s*<!-- (<img src="\.\.\/theme\/christmas\/santa\.svg" class="santa-climber" alt="Santa Climbing">) -->/,
        `<!-- 🎅 Climbing Santa 🎅 -->
    $1`
    );

    // 3. Enable Garland
    newContent = newContent.replace(
        /<!-- 🎄 Navbar Garland Decoration DISABLED 🎄 -->\s*<!-- (<div class="navbar-garland"><\/div>) -->/,
        `<!-- 🎄 Navbar Garland Decoration 🎄 -->
    $1`
    );

    // 4. Enable Separator
    newContent = newContent.replace(
        /<!-- 🎄 Christmas Separator DISABLED 🎄 -->\s*<!-- (<div class="christmas-separator"><\/div>) -->/,
        `<!-- 🎄 Christmas Separator (Snow Waves & Sled) 🎄 -->
    $1`
    );

    // 5. Restore Snow Container
    newContent = newContent.replace(
        /\s*<!-- CHRISTMAS_SNOW_REMOVED -->/,
        '\n' + SNOW_CONTAINER_HTML
    );

    fs.writeFileSync(INDEX_PATH, newContent, ENCODING);
    console.log('✅ Christmas decorations restored!');
}

toggleChristmas();
