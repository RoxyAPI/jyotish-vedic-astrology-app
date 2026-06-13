'use client';

import { useState, useTransition } from 'react';
import {
  RoxyVedicKundli,
  RoxyVedicPlanetsTable,
  RoxyDivisionalChart,
  RoxyDashaTimeline,
  RoxyDoshaCard,
  RoxyAshtakavargaGrid,
  RoxyShadbalaTable,
  type RoxyDivisionalChartProps,
} from '@roxyapi/ui-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BirthDetailsForm } from '@/components/birth-details-form';
import { DEFAULT_CITY } from '@/lib/location';
import type { BirthDetails, Coords } from '@/lib/types';
import type { Lang } from '@/lib/lang';
import { todayString } from '@/lib/format';
import { generateKundali, fetchDivisionalChart } from './actions';
import { VARGA_CHARTS } from './varga-charts';

type Kundali = Awaited<ReturnType<typeof generateKundali>>;

/**
 * Kundali generator. A Server Action fans out one birth input to every Vedic endpoint;
 * this client renders each typed response with its matching Roxy UI component.
 * The active language comes from the server so dosha and chart interpretations
 * localize without a client provider.
 */
export function KundaliClient({ lang }: { lang: Lang }) {
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    date: todayString(),
    time: '10:00',
    ...DEFAULT_CITY,
  });
  const [coords, setCoords] = useState<Coords>(DEFAULT_CITY);
  const [result, setResult] = useState<Kundali | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [division, setDivision] = useState(9);
  const [varga, setVarga] = useState<RoxyDivisionalChartProps['data']>(undefined);
  const [vargaPending, startVarga] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateKundali({ ...birthDetails, time: `${birthDetails.time}:00`, ...coords, lang });
        setResult(data);
        setVarga(data.navamsa);
        setDivision(9);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate kundali');
        setResult(null);
      }
    });
  }

  function loadVarga(next: number) {
    setDivision(next);
    startVarga(async () => {
      try {
        setVarga(await fetchDivisionalChart({ date: birthDetails.date, time: `${birthDetails.time}:00`, ...coords, division: next }));
      } catch {
        setVarga(undefined);
      }
    });
  }

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Kundali</h1>
        <p className="mt-2 text-muted-foreground">
          Vedic birth chart with planetary positions, dashas, doshas, and strengths
        </p>
      </div>

      <form onSubmit={submit}>
        <BirthDetailsForm
          title="Birth Details"
          description="Enter your date, time, and place of birth"
          value={birthDetails}
          onChange={setBirthDetails}
        />
        <div className="mt-6">
          <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
            {pending ? 'Generating...' : 'Generate Kundali'}
          </Button>
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </form>

      {result && (
        <Tabs defaultValue="chart">
          <TabsList className="w-full">
            <TabsTrigger value="chart">Rashi (D1)</TabsTrigger>
            <TabsTrigger value="planets">Planets</TabsTrigger>
            <TabsTrigger value="varga">Varga</TabsTrigger>
            <TabsTrigger value="dasha">Dasha</TabsTrigger>
            <TabsTrigger value="doshas">Doshas</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-6">
            <RoxyVedicKundli data={result.chart} />
          </TabsContent>

          <TabsContent value="planets" className="mt-6">
            <RoxyVedicPlanetsTable data={result.chart} />
          </TabsContent>

          <TabsContent value="varga" className="mt-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="w-full max-w-xs space-y-2">
                  <span className="text-sm font-medium text-foreground">Divisional chart</span>
                  <Select value={String(division)} onValueChange={(v) => loadVarga(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VARGA_CHARTS.map((v) => (
                        <SelectItem key={v.division} value={String(v.division)}>
                          {v.name} - {v.desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            {vargaPending ? (
              <p className="py-8 text-center text-muted-foreground">Loading chart...</p>
            ) : (
              varga && <RoxyDivisionalChart data={varga} />
            )}
          </TabsContent>

          <TabsContent value="dasha" className="mt-6">
            <RoxyDashaTimeline data={result.dashas} />
          </TabsContent>

          <TabsContent value="doshas" className="mt-6 space-y-6">
            <RoxyDoshaCard type="manglik" data={result.manglik} />
            <RoxyDoshaCard type="kalsarpa" data={result.kalsarpa} />
            <RoxyDoshaCard type="sadhesati" data={result.sadhesati} />
          </TabsContent>

          <TabsContent value="strength" className="mt-6 space-y-6">
            <RoxyAshtakavargaGrid data={result.ashtakavarga} />
            <RoxyShadbalaTable data={result.shadbala} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
