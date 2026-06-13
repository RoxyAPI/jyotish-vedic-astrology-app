// Adapter: Utility function from src/lib/utils.ts
// Source of truth is always src/lib/utils.ts.

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind class names with clsx + twMerge. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
