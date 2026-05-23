'use client';

import { RoxyPanchangTable, type RoxyPanchangTableProps } from '@roxyapi/ui-react';

/**
 * Client boundary for {@link RoxyPanchangTable}. Roxy UI components mount custom elements, so any file that imports one must be a Client Component. The Server Component fetches the panchang and passes the unwrapped `data` straight in.
 */
export function PanchangView({ data }: { data: RoxyPanchangTableProps['data'] }) {
  return <RoxyPanchangTable data={data} />;
}
