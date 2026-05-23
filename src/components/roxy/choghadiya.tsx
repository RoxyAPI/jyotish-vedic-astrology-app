'use client';

import { RoxyChoghadiyaGrid, type RoxyChoghadiyaGridProps } from '@roxyapi/ui-react';

/** Client boundary for {@link RoxyChoghadiyaGrid}. The Server Component fetches the choghadiya and passes the unwrapped `data`. */
export function ChoghadiyaView({ data }: { data: RoxyChoghadiyaGridProps['data'] }) {
  return <RoxyChoghadiyaGrid data={data} />;
}
