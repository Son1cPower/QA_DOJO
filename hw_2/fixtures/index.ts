import { test as base, expect, Locator } from '@playwright/test';

type CoffeeCartFixtures = {
  cartLink: Locator;
  checkoutButton: Locator;
};

export const test = base.extend<CoffeeCartFixtures>({
  page: async ({ page }, use) => {
    await test.step('Open the app with an empty cart', async () => {
      await page.goto('/');
    });

    await test.step('Verify the cart and total price start empty', async () => {
      await expect(page.getByRole('link', { name: 'Cart page' })).toHaveText('cart (0)');
      await expect(page.getByTestId('checkout')).toHaveText('Total: $0.00');
    });

    await use(page);
  },

  cartLink: async ({ page }, use) => {
    await use(page.getByRole('link', { name: 'Cart page' }));
  },

  checkoutButton: async ({ page }, use) => {
    await use(page.getByTestId('checkout'));
  },
});
