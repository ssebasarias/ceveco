const { test } = require('@playwright/test');

test('Debug Navbar Loading', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    // Navigate to index
    await page.goto('/pages/index.html');
    await page.waitForLoadState('networkidle');

    // Check Root
    const navbarRoot = page.locator('#navbar-root');
    await navbarRoot.waitFor({ state: 'attached' });

    // Wait for content (simple check)
    await page.waitForTimeout(2000);

    const html = await navbarRoot.innerHTML();
    console.log('--- NAVBAR HTML START ---');
    console.log(html);
    console.log('--- NAVBAR HTML END ---');

    // Check Visibility of Nav
    const nav = page.locator('nav');
    const isVisible = await nav.isVisible();
    const isHidden = await nav.isHidden();
    const boundingBox = await nav.boundingBox();

    console.log('Nav visible:', isVisible);
    console.log('Nav hidden:', isHidden);
    console.log('Nav box:', boundingBox);

    // Check Styles
    const className = await nav.getAttribute('class');
    console.log('Nav class:', className);

    // Viewport
    console.log('Viewport:', page.viewportSize());
});
