import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { random } from 'lodash';
import { COFFEE_MENU, getRandomCoffee, getRandomCoffees } from './data/coffee-menu';

test.describe('Home Page', { tag: '@homePage' }, () => {
  test(
    'Should update cart count and total price when a coffee is added',
    {
      tag: ['@smoke', '@regression'],
      annotation: { type: 'TestId', description: 'TC-HOME-01' },
    },
    async ({ page }) => {
      const coffee = getRandomCoffee();
      const cartLink = page.getByRole('link', { name: 'Cart page' });
      const checkoutButton = page.getByTestId('checkout');

      await test.step('Open the app with an empty cart', async () => {
        await page.goto('https://coffee-cart.app/');

        await expect(cartLink).toHaveText('cart (0)');
        await expect(checkoutButton).toHaveText('Total: $0.00');
      });

      await test.step(`Add ${coffee.name} to the cart`, async () => {
        await page.getByTestId(coffee.testId).click();
      });

      await test.step('Verify cart count is updated', async () => {
        await expect(cartLink).toHaveText('cart (1)');
      });

      await test.step('Verify total price reflects the added coffee', async () => {
        const totalText = await checkoutButton.textContent();
        const totalValue = Number(totalText?.replace(/[^\d.]/g, ''));

        expect(totalValue).toBe(coffee.price);
      });
    },
  );

  test(
    'Should show correct total price when several different coffees are added',
    {
      tag: ['@regression'],
      annotation: { type: 'TestId', description: 'TC-HOME-02' },
    },
    async ({ page }) => {
      const coffees = getRandomCoffees(random(2, COFFEE_MENU.length));
      const checkoutButton = page.getByTestId('checkout');
      const cartLink = page.getByRole('link', { name: 'Cart page' });
      const expectedTotal = coffees.reduce((sum, coffee) => sum + coffee.price, 0);

      await test.step('Open the app with an empty cart', async () => {
        await page.goto('https://coffee-cart.app/');

        await expect(cartLink).toHaveText('cart (0)');
        await expect(checkoutButton).toHaveText('Total: $0.00');
      });

      for (const coffee of coffees) {
        await test.step(`Add ${coffee.name} to the cart`, async () => {
          await page.getByTestId(coffee.testId).click();
        });
      }

      await test.step(`Verify cart count reflects all ${coffees.length} added coffees`, async () => {
        await expect(cartLink).toHaveText(`cart (${coffees.length})`);
      });

      await test.step(`Verify total price reflects all ${coffees.length} added coffees`, async () => {
        await expect(checkoutButton).toHaveText(`Total: $${expectedTotal.toFixed(2)}`);
      });
    },

  );


  test(
    'Should show a promo offer after adding three coffees',
    {
      tag: ['@smoke', '@regression'],
      annotation: { type: 'TestId', description: 'TC-HOME-03' },
    },
    async ({ page }) => {
      const coffee = getRandomCoffee();
      const cartLink = page.getByRole('link', { name: 'Cart page' });
      const checkoutButton = page.getByTestId('checkout');

      await test.step('Open the app with an empty cart', async () => {
        await page.goto('https://coffee-cart.app/');

        await expect(cartLink).toHaveText('cart (0)');
        await expect(checkoutButton).toHaveText('Total: $0.00');
      });

      await test.step(`Add ${coffee.name} x3 to the cart`, async () => {
        for (let i = 0; i < 3; i++) {
          await page.getByTestId(coffee.testId).click();
        }
      });

      await test.step('Verify cart count is updated', async () => {
        await expect(cartLink).toHaveText('cart (3)');
      });

      await test.step('Verify total price reflects the added coffee', async () => {
        const totalText = await checkoutButton.textContent();
        const totalValue = Number(totalText?.replace(/[^\d.]/g, ''));

        expect(totalValue).toBe(coffee.price * 3);
      });

      await test.step('Verify the promo offer is shown', async () => {
        const promo = page.locator('.promo');

        await expect(promo).toContainText("It's your lucky day! Get an extra cup of Mocha for $4.");
        await expect(promo.getByRole('button', { name: 'Yes, of course!' })).toBeVisible();
        await expect(promo.getByRole('button', { name: "Nah, I'll skip." })).toBeVisible();
      });
    },
  );
});


test.describe('Checkout Page', { tag: '@checkout' }, () => {

test('Should complete checkout and show the success message',
  {
    tag: ['@smoke', '@regression'],
    annotation: { type: 'TestId', description: 'TC-CHECKOUT-01' },
  }, async ({ page }) => {
    const coffee = getRandomCoffee();
    const cartLink = page.getByRole('link', { name: 'Cart page' });
    const checkoutButton = page.getByTestId('checkout');

    await test.step('Open the app with an empty cart', async () => {
      await page.goto('https://coffee-cart.app/');

      await expect(cartLink).toHaveText('cart (0)');
      await expect(checkoutButton).toHaveText('Total: $0.00');
    });

    await test.step(`Add ${coffee.name} to the cart`, async () => {
      await page.getByTestId(coffee.testId).click();
    });

    await test.step('Verify cart count is updated', async () => {
      await expect(cartLink).toHaveText('cart (1)');
    });

    await test.step('Verify total price reflects the added coffee', async () => {
      const totalText = await checkoutButton.textContent();
      const totalValue = Number(totalText?.replace(/[^\d.]/g, ''));

      expect(totalValue).toBe(coffee.price);
    });

    await test.step('Open the checkout form', async () => {
      await checkoutButton.click();
    });

    await test.step('Fill in the checkout form', async () => {
      await page.getByRole('textbox', { name: 'Name' }).fill(faker.person.fullName());
      await page.getByRole('textbox', { name: 'Email' }).fill(faker.internet.email());
      await page.getByRole('button', { name: 'Submit' }).click();
    });

    await test.step('Verify the success message is shown', async () => {
      await expect(page.locator('#app')).toContainText(
        'Thanks for your purchase. Please check your email for payment.',
      );
    });

  });
});






test.describe('Cart Page', { tag: '@cart' }, () => {
  test(
    'Should list every added coffee with its correct unit and total price',
    {
      tag: ['@smoke', '@regression'],
      annotation: { type: 'TestId', description: 'TC-CART-01' },
    },
    async ({ page }) => {
      const coffees = getRandomCoffees(random(2, COFFEE_MENU.length));
      const cartLink = page.getByRole('link', { name: 'Cart page' });
      const checkoutButton = page.getByTestId('checkout');
      const expectedTotal = coffees.reduce((sum, coffee) => sum + coffee.price, 0);

      await test.step('Open the app with an empty cart', async () => {
        await page.goto('https://coffee-cart.app/');

        await expect(cartLink).toHaveText('cart (0)');
      });

      for (const coffee of coffees) {
        await test.step(`Add ${coffee.name} to the cart`, async () => {
          await page.getByTestId(coffee.testId).click();
        });
      }

         await test.step(`Verify cart count reflects all ${coffees.length} added coffees`, async () => {
        await expect(cartLink).toHaveText(`cart (${coffees.length})`);
      });

      await test.step(`Verify total price reflects all ${coffees.length} added coffees`, async () => {
        await expect(checkoutButton).toHaveText(`Total: $${expectedTotal.toFixed(2)}`);
      });

      await test.step('Open the cart page', async () => {
        await cartLink.click();
      });

      await test.step(`Verify the cart page lists all ${coffees.length} added coffees`, async () => {
        const cartRows = page
          .getByRole('listitem')
          .filter({ has: page.getByRole('button', { name: /^Remove all/ }) });

        await expect(cartRows).toHaveCount(coffees.length);
      });

      for (const coffee of coffees) {
        await test.step(`Verify ${coffee.name} row shows the correct unit and total price`, async () => {
          const itemRow = page
            .getByRole('listitem')
            .filter({
              has: page.getByRole('button', { name: `Remove all ${coffee.name}`, exact: true }),
            });

          await expect(itemRow.locator('> div').nth(0)).toHaveText(coffee.name);
          await expect(itemRow.locator('.unit-desc')).toHaveText(`$${coffee.price.toFixed(2)} x 1`);
          await expect(itemRow.locator('> div').nth(2)).toHaveText(`$${coffee.price.toFixed(2)}`);
        });
      }
    },
  );
});