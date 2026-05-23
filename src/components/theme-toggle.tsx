'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

/**
 * Light/dark toggle. Both icons are rendered and CSS shows the right one based on the `.dark` class on `<html>` (next-themes adds it before paint, so there is no hydration mismatch and no `mounted` gate). next-themes flips `.dark`, which Roxy UI components also honor, so charts and tables re-theme with the rest of the page.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  );
}
