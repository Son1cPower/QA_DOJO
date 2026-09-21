import { test as base, expect, APIRequestContext, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

const TOKEN_STORAGE_KEY = 'qa-dojo.token';

export type NewUser = {
  username: string;
  email: string;
  password: string;
};

export type RegisteredUser = NewUser & {
  token: string;
  bio: string;
  image: string;
};

type AuthFixtures = {
  newUser: NewUser;
  registeredUser: RegisteredUser;
  authorizedPage: Page;
};

async function registerUser(request: APIRequestContext, user: NewUser) {
  const response = await request.post('/api/users', { data: { user } });
  if (!response.ok()) {
    throw new Error(`Failed to register user via API: ${response.status()} ${await response.text()}`);
  }
  const { user: created } = await response.json();
  return created as Omit<RegisteredUser, 'password'>;
}

export const test = base.extend<AuthFixtures>({
  newUser: async ({}, use) => {
    await use({
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password({ length: 14 }),
    });
  },

  registeredUser: async ({ request, newUser }, use) => {
    const created = await registerUser(request, newUser);
    await use({ ...created, password: newUser.password });
  },

  authorizedPage: async ({ page, registeredUser }, use) => {
    await page.addInitScript(
      ({ key, token }) => localStorage.setItem(key, token),
      { key: TOKEN_STORAGE_KEY, token: registeredUser.token },
    );

    await page.goto('/articles');
    await expect(page.getByTestId('nav-profile')).toContainText(registeredUser.username);

    await use(page);
  },
});

export { expect };
