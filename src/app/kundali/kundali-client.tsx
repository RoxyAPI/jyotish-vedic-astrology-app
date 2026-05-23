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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CitySearch } from '@/components/city-search';
import { DEFAULT_CITY, todayString, type City, type Coords } from '@/lib/location';
import type { Lang } from '@/lib/lang';
import { generateKundali, fetchDivisionalChart } from './actions';

type Kundali = Awaited<ReturnType<typeof generateKundali>>;

const VARGA_CHARTS = [
  { division: 9, name: 'D9 Navamsa', desc: 'Marriage and dharma' },
  { division: 2, name: 'D2 Hora', desc: 'Wealth' },
  { division: 3, name: 'D3 Drekkana', desc: 'Siblings' },
  { division: 4, name: 'D4 Chaturthamsa', desc: 'Property' },
  { division: 7, name: 'D7 Saptamsa', desc: 'Children' },
  { division: 10, name: 'D10 Dasamsa', desc: 'Career' },
  { division: 12, name: 'D12 Dwadasamsa', desc: 'Parents' },
  { division: 16, name: 'D16 Shodasamsa', desc: 'Vehicles' },
  { division: 20, name: 'D20 Vimsamsa', desc: 'Spirituality' },
  { division: 24, name: 'D24 Chaturvimsamsa', desc: 'Education' },
  { division: 27, name: 'D27 Bhamsa', desc: 'Strengths' },
  { division: 30, name: 'D30 Trimsamsa', desc: 'Misfortunes' },
  { division: 40, name: 'D40 Khavedamsa', desc: 'Maternal legacy' },
  { division: 45, name: 'D45 Akshavedamsa', desc: 'Character' },
  { division: 60, name: 'D60 Shashtiamsa', desc: 'Past karma' },
] as const;

/**
 * Kundali generator. A Server Action fans out one birth input to every Vedic endpoint; this client renders each typed response with its matching Roxy UI component. The active language comes from the server so dosha and chart interpretations localize without a client provider.
 */
export function KundaliClient({ lang }: { lang: Lang }) {
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState('10:00');
  const [coords, setCoords] = useState<Coords>(DEFAULT_CITY);
  const [result, setResult] = useState<Kundali | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [division, setDivision] = useState(9);
  const [varga, setVarga] = useState<RoxyDivisionalChartProps['data']>(undefined);
  const [vargaPending, startVarga] = useTransition();

  function onCity(city: City) {
    setCoords({ latitude: city.latitude, longitude: city.longitude, timezone: city.utcOffset });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const data = await generateKundali({ date, time: `${time}:00`, ...coords, lang });
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
        setVarga(await fetchDivisionalChart({ date, time: `${time}:00`, ...coords, division: next }));
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

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Birth Details</CardTitle>
          <CardDescription>Enter your date, time, and place of birth</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date of Birth</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time of Birth</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <CitySearch onSelect={onCity} defaultValue={DEFAULT_CITY.label} />
              </div>
            </div>
            <div className="mt-6">
              <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
                {pending ? 'Generating...' : 'Generate Kundali'}
              </Button>
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>

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
              <CardHeader>
                <CardTitle>Divisional Charts</CardTitle>
                <CardDescription>Select a varga chart to analyze a specific life area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full max-w-xs space-y-2">
                  <Label>Divisional chart</Label>
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
