import { sample, sampleSize } from 'lodash';

export interface CoffeeItem {
  testId: string;
  name: string;
  price: number;
}

export const COFFEE_MENU: CoffeeItem[] = [
  { testId: 'Espresso', name: 'Espresso', price: 10 },
  { testId: 'Espresso_Macchiato', name: 'Espresso Macchiato', price: 12 },
  { testId: 'Cappuccino', name: 'Cappuccino', price: 19 },
  { testId: 'Mocha', name: 'Mocha', price: 8 },
  { testId: 'Flat_White', name: 'Flat White', price: 18 },
  { testId: 'Americano', name: 'Americano', price: 7 },
  { testId: 'Cafe_Latte', name: 'Cafe Latte', price: 16 },
  { testId: 'Espresso_Con Panna', name: 'Espresso Con Panna', price: 14 },
  { testId: 'Cafe_Breve', name: 'Cafe Breve', price: 15 },
];


export function getRandomCoffee(): CoffeeItem {
    return sample(COFFEE_MENU)!;
}

export function getRandomCoffees(count: number): CoffeeItem[] {
  return sampleSize(COFFEE_MENU, count);
}

