'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Month and year picker for the transits page. Pushes the selection into the URL so the Server Component re-fetches. */
export function MonthYearControls({ month, year }: { month: number; year: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [m, setM] = useState(String(month));
  const [y, setY] = useState(String(year));
  const [pending, startTransition] = useTransition();

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  function update() {
    startTransition(() => router.push(`${pathname}?month=${m}&year=${y}`));
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Month</span>
            <Select value={m} onValueChange={setM}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((name, i) => (
                  <SelectItem key={name} value={String(i + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Year</span>
            <Select value={y} onValueChange={setY}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((yr) => (
                  <SelectItem key={yr} value={String(yr)}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={update} disabled={pending}>
            {pending ? 'Loading...' : 'View Transits'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
