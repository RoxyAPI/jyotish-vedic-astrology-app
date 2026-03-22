import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Panchang</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/kundali">Generate Kundali</Link>
        </Button>
      </div>
    </div>
  );
}
