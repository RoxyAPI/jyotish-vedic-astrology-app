import type { PostVedicAstrologyPanchangHoraResponse } from '@roxyapi/sdk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTimeRange } from '@/lib/format';

type HoraData = PostVedicAstrologyPanchangHoraResponse;
type Hora = HoraData['dayHoras'][number];

function HoraColumn({ title, subtitle, horas }: { title: string; subtitle: string; horas: Hora[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {horas.map((h) => (
            <div
              key={h.number}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs text-muted-foreground">{h.number}</span>
                <span className="font-medium text-foreground">{h.planet}</span>
              </div>
              <span className="tabular-nums text-muted-foreground">
                {formatTimeRange(h.start, h.end)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hora (planetary hours) table. RoxyAPI has no dedicated Hora component, so this small bespoke table sits beside `RoxyChoghadiyaGrid`. The 24 horas (12 day, 12 night) follow the Chaldean planetary order.
 */
export function HoraTable({ data }: { data: HoraData }) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">Hora</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        24 planetary hours, each ruled by a planet in the Chaldean sequence
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <HoraColumn title="Day Horas" subtitle="Sunrise to sunset" horas={data.dayHoras} />
        <HoraColumn title="Night Horas" subtitle="Sunset to next sunrise" horas={data.nightHoras} />
      </div>
    </div>
  );
}
