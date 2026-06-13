import type {
  PostVedicAstrologyTransitMonthlyResponse,
  PostVedicAstrologyAspectsMonthlyResponse,
} from '@roxyapi/sdk';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateShort, titleCase } from '@/lib/format';
import { groupByDate } from '@/lib/group-by-date';

type Transits = PostVedicAstrologyTransitMonthlyResponse;
type Aspects = PostVedicAstrologyAspectsMonthlyResponse;

/**
 * Monthly Vedic transit and aspect renderer. There is no dedicated Roxy UI component
 * for Vedic monthly transits (`RoxyTransitsTable` is Western), so this small table
 * renders the typed response directly. Server component, no client cost.
 */
export function TransitsView({ transits, aspects }: { transits: Transits; aspects: Aspects }) {
  const signChanges = groupByDate(transits.transitEvents);
  const aspectDays = groupByDate(aspects.events);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Starting Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {transits.startingPositions.map((pos) => (
              <div
                key={pos.planet}
                className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground">{pos.planet}</span>
                <span className="text-xs text-muted-foreground">{pos.sign}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Sign Changes</h2>
        {signChanges.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No sign changes this month.</p>
        ) : (
          signChanges.map(([date, events]) => (
            <Card key={date}>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {formatDateShort(date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.map((e, i) => (
                  <div key={`${e.planet}-${e.toSign}-${i}`} className="flex items-center gap-3">
                    <Badge>{e.planet}</Badge>
                    <p className="flex-1 text-sm text-foreground">
                      {e.fromSign} <span className="text-muted-foreground">to</span> {e.toSign}
                    </p>
                    {e.isRetrograde && (
                      <Badge variant="outline" className="text-xs">
                        Rx
                      </Badge>
                    )}
                    <span className="text-xs tabular-nums text-muted-foreground">{e.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {aspectDays.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Planetary Aspects</h2>
            {aspectDays.map(([date, events]) => (
              <Card key={date}>
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {formatDateShort(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {events.map((e, i) => (
                    <div
                      key={`${e.planet1}-${e.planet2}-${e.aspect}-${i}`}
                      className="flex items-center gap-3"
                    >
                      <Badge>{e.planet1}</Badge>
                      <Badge variant="outline">{titleCase(e.aspect)}</Badge>
                      <Badge>{e.planet2}</Badge>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {e.orb.toFixed(2)} orb
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">{e.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
