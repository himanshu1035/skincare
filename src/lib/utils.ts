import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_SYMBOL = '₹';
export const SHIPPING_THRESHOLD = 1000;

export function formatPrice(price: number) {
  if (price === undefined || price === null) return `${CURRENCY_SYMBOL}0.00`;
  const numPrice = Number(price);
  return `${CURRENCY_SYMBOL}${numPrice.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
