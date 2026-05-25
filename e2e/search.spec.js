const { test, expect } = require('@playwright/test');

test.describe('Búsqueda autocomplete', () => {
    test('typing en navbar muestra dropdown con sugerencias', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const search = page.locator('#search-input');
        await search.click();
        await search.fill('suzu');
        await page.waitForTimeout(500); // debounce
        const dropdown = page.locator('.search-autocomplete-dropdown.open');
        await expect(dropdown).toBeVisible();
        await expect(dropdown.locator('.search-autocomplete-item')).not.toHaveCount(0);
    });
});
