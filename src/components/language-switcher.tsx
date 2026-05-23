'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setLang } from '@/app/actions/lang';
import { LANGUAGES, type Lang } from '@/lib/lang';

/**
 * Language selector. Writes the lang cookie through the {@link setLang} Server Action, then refreshes the router so every Server Component re-fetches its interpretation in the chosen language. The active language is supplied by the server layout, so the first paint is already correct (no flash, no client provider).
 */
export function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function choose(code: Lang) {
    setOpen(false);
    if (code === current) return;
    startTransition(async () => {
      await setLang(code);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-label="Change language"
      >
        <Globe className="size-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-md border bg-popover shadow-md">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`w-full px-3 py-2 text-left text-sm first:rounded-t-md last:rounded-b-md ${
                l.code === current
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => choose(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
