'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useLanguage, LANGUAGES } from '@/components/language-provider';

const navLinks = [
  { href: '/', label: 'Panchang' },
  { href: '/choghadiya', label: 'Choghadiya' },
  { href: '/kundali', label: 'Kundali' },
  { href: '/matching', label: 'Matching' },
  { href: '/transits', label: 'Transits' },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-foreground transition-colors hover:text-foreground/80">
          <Sparkles className="size-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">Jyotish</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Language selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLangOpen(!langOpen)}
              aria-label="Change language"
            >
              <Globe className="size-4" />
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-md border bg-popover shadow-md z-50">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm first:rounded-t-md last:rounded-b-md ${
                      lang === l.code
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {!mounted ? (
              <span className="size-4" />
            ) : isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                      isActive ? 'bg-muted text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
