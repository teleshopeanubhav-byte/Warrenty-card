import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | number) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function calculateExpiryDate(purchaseDate: string, warrantyPeriod: string): string {
  if (warrantyPeriod === 'Lifetime') return 'Lifetime';
  
  const date = new Date(purchaseDate);
  const [value, unit] = warrantyPeriod.split(' ');
  const num = parseInt(value);
  
  if (unit.toLowerCase().includes('month')) {
    date.setMonth(date.getMonth() + num);
  } else if (unit.toLowerCase().includes('year')) {
    date.setFullYear(date.getFullYear() + num);
  }
  
  return date.toISOString().split('T')[0];
}
