import { test, expect } from '../fixtures/auth';
import { faker } from '@faker-js/faker';

test.describe('Registration', { tag: '@auth' }, () => {
  test('REG-1: successful registration of a new user', async ({ page }) => {
    const username = faker.internet.username();
    const email = faker.internet.email();
    const password = faker.internet.password({ length: 14 });

    await page.goto('/register');

    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Repeat password').fill(password);
    await page.getByLabel('I agree to the terms of use').check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/articles');
    await expect(page.getByTestId('nav-profile')).toContainText(username);
  });

  test('REG-2: registration with an already used email shows a specific error', async ({ page, registeredUser }) => {
    const username = faker.internet.username();
    const password = faker.internet.password({ length: 14 });

    await page.goto('/register');

    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Email').fill(registeredUser.email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Repeat password').fill(password);
    await page.getByLabel('I agree to the terms of use').check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByTestId('error-messages')).toHaveText('body email або username вже зайняті');
    await expect(page).toHaveURL('/articles/register');
    await expect(page.getByTestId('nav-profile')).toHaveCount(0);
  });

  test('REG-3: registration with an empty username shows a validation error', async ({ page }) => {
    const email = faker.internet.email();
    const password = faker.internet.password({ length: 14 });

    await page.goto('/register');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Repeat password').fill(password);
    await page.getByLabel('I agree to the terms of use').check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByTestId('error-messages')).toHaveText("username ім'я має містити щонайменше 3 символи");
    await expect(page).toHaveURL('/articles/register');
    await expect(page.getByTestId('nav-profile')).toHaveCount(0);
  });
});

test.describe('Login', { tag: '@auth' }, () => {
  test('LOGIN-1: successful login with an existing user', async ({ page, registeredUser }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(registeredUser.email);
    await page.getByLabel('Password', { exact: true }).fill(registeredUser.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/articles');
    await expect(page.getByTestId('nav-profile')).toContainText(registeredUser.username);
  });

  test('LOGIN-2: login with a wrong password stays unauthenticated and shows an error', async ({ page, registeredUser }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(registeredUser.email);
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByTestId('error-messages')).toHaveText('email or password неправильні');
    await expect(page).toHaveURL('/articles/login');
    await expect(page.getByTestId('nav-profile')).toHaveCount(0);
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
  });

  test('LOGIN-3: login with a non-existent email is rejected without creating a session', async ({ page }) => {
    const password = faker.internet.password({ length: 14 });
    const email = faker.internet.email();

    await page.goto('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByTestId('error-messages')).toHaveText('email or password неправильні');
    await expect(page).toHaveURL('/articles/login');
    await expect(page.getByTestId('nav-profile')).toHaveCount(0);
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
  });
});
