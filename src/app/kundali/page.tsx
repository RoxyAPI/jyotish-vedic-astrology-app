'use client';

import { useState } from 'react';
import { generateKundali, fetchDivisionalChart, fetchStrengthAnalysis } from './actions';
import { PLANET_ABBR, RASHI_NAMES } from '@/lib/constants';
import { BirthChart } from '@/components/birth-chart';
import { CitySearch, type CityResult } from '@/components/city-search';
import { useLanguage } from '@/components/language-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BirthChartData, DivisionalChartResponse, DoshaResponse } from '@/api/types';

type KundaliResult = Awaited<ReturnType<typeof generateKundali>>;
type StrengthResult = Awaited<ReturnType<typeof fetchStrengthAnalysis>>;

const SIGN_KEYS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

const VARGA_CHARTS = [
  { division: 2, name: 'D2 Hora', desc: 'Wealth' },
  { division: 3, name: 'D3 Drekkana', desc: 'Siblings' },
  { division: 4, name: 'D4 Chaturthamsa', desc: 'Property' },
  { division: 7, name: 'D7 Saptamsa', desc: 'Children' },
  { division: 9, name: 'D9 Navamsa', desc: 'Marriage' },
  { division: 10, name: 'D10 Dasamsa', desc: 'Career' },
  { division: 12, name: 'D12 Dwadasamsa', desc: 'Parents' },
  { division: 16, name: 'D16 Shodasamsa', desc: 'Vehicles' },
  { division: 20, name: 'D20 Vimsamsa', desc: 'Spirituality' },
  { division: 24, name: 'D24 Chaturvimsamsa', desc: 'Education' },
  { division: 27, name: 'D27 Bhamsa', desc: 'Strength' },
  { division: 30, name: 'D30 Trimsamsa', desc: 'Misfortunes' },
  { division: 40, name: 'D40 Khavedamsa', desc: 'Merit' },
  { division: 45, name: 'D45 Akshavedamsa', desc: 'Character' },
  { division: 60, name: 'D60 Shashtiamsa', desc: 'Past karma' },
] as const;

function todayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(years: number): string {
  const y = Math.floor(years);
  const m = Math.round((years - y) * 12);
  if (m === 0) return `${y} years`;
  return `${y}y ${m}m`;
}

function transformChartToHouses(
  chartData: BirthChartData,
): { house: number; sign: string; planets: string[] }[] {
  if (!chartData.meta) return [];

  // Find lagna rashi index (0-based)
  const lagnaInfo = chartData.meta['Lagna'] ?? chartData.meta['Ascendant'];
  const lagnaRashi = lagnaInfo?.rashi ?? 'Aries';
  const lagnaIndex = RASHI_NAMES.findIndex(
    (r) => r.toLowerCase() === lagnaRashi.toLowerCase(),
  );
  const lagnaIdx = lagnaIndex >= 0 ? lagnaIndex : 0;

  // Build houses from sign data
  return SIGN_KEYS.map((key, signIndex) => {
    const signData = chartData[key] as BirthChartData['aries'] | undefined;

    const houseNumber = ((signIndex - lagnaIdx + 12) % 12) + 1;
    const signName = RASHI_NAMES[signIndex];
    const planets = (signData?.signs ?? [])
      .map((p) => p.graha)
      .filter((g) => g !== 'Lagna' && g !== 'Ascendant');

    return { house: houseNumber, sign: signName, planets };
  });
}

function transformNavamsaToHouses(
  navamsaData: KundaliResult['navamsa'] & {},
): { house: number; sign: string; planets: string[] }[] {
  const chart = navamsaData.chart;
  if (!chart?.meta) return [];

  const lagnaInfo = chart.meta['Lagna'] ?? chart.meta['Ascendant'];
  const lagnaRashi = lagnaInfo?.rashi ?? 'Aries';
  const lagnaIndex = RASHI_NAMES.findIndex(
    (r) => r.toLowerCase() === lagnaRashi.toLowerCase(),
  );
  const lagnaIdx = lagnaIndex >= 0 ? lagnaIndex : 0;

  return SIGN_KEYS.map((key, signIndex) => {
    const signData = chart[key] as
      | { rashi: string; signs: { graha: string }[] }
      | undefined;

    const houseNumber = ((signIndex - lagnaIdx + 12) % 12) + 1;
    const signName = RASHI_NAMES[signIndex];
    const planets = (signData?.signs ?? [])
      .map((p) => p.graha)
      .filter((g) => g !== 'Lagna' && g !== 'Ascendant');

    return { house: houseNumber, sign: signName, planets };
  });
}

export default function KundaliPage() {
  const { lang } = useLanguage();
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState({ latitude: 19.076, longitude: 72.8777, timezone: 5.5 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KundaliResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<number>(9);
  const [vargaResult, setVargaResult] = useState<DivisionalChartResponse | null>(null);
  const [vargaLoading, setVargaLoading] = useState(false);
  const [strengthResult, setStrengthResult] = useState<StrengthResult | null>(null);
  const [strengthLoading, setStrengthLoading] = useState(false);

  function handleCitySelect(city: CityResult) {
    setLocation({ latitude: city.latitude, longitude: city.longitude, timezone: city.utcOffset });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await generateKundali({
        date,
        time: time + ':00',
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        lang,
      });
      setResult(data);
    } catch {
      setError('Failed to generate kundali. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadVarga() {
    setVargaLoading(true);
    try {
      const data = await fetchDivisionalChart({
        date,
        time: time + ':00',
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        division: selectedDivision,
      });
      setVargaResult(data);
    } catch {
      setVargaResult(null);
    } finally {
      setVargaLoading(false);
    }
  }

  async function handleLoadStrength() {
    setStrengthLoading(true);
    try {
      const data = await fetchStrengthAnalysis({
        date,
        time: time + ':00',
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
      });
      setStrengthResult(data);
    } catch {
      setStrengthResult(null);
    } finally {
      setStrengthLoading(false);
    }
  }

  return (
    <div className="space-y-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Kundali
          </h1>
          <p className="mt-2 text-muted-foreground">
            Generate your Vedic birth chart with planetary positions, dashas, and doshas
          </p>
        </div>

        {/* Birth Details Form */}
        <Card className="mb-10 overflow-visible">
          <CardHeader>
            <CardTitle>Birth Details</CardTitle>
            <CardDescription>
              Enter your date, time, and place of birth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Birth</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time of Birth</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <CitySearch onSelect={handleCitySelect} defaultValue="Mumbai, India" />
                </div>
              </div>

              <div className="mt-6">
                <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto">
                  {loading ? 'Generating...' : 'Generate Kundali'}
                </Button>
              </div>

              {error && (
                <p className="mt-4 text-sm text-destructive">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Tabs defaultValue="rashi">
            <TabsList className="w-full">
              <TabsTrigger value="rashi">Rashi (D1)</TabsTrigger>
              <TabsTrigger value="navamsa">Navamsa (D9)</TabsTrigger>
              <TabsTrigger value="varga">Varga</TabsTrigger>
              <TabsTrigger value="planets">Planets</TabsTrigger>
              <TabsTrigger value="dasha">Dasha</TabsTrigger>
              <TabsTrigger value="doshas">Doshas</TabsTrigger>
              <TabsTrigger value="strength">Strength</TabsTrigger>
            </TabsList>

            {/* Rashi Chart Tab */}
            <TabsContent value="rashi" className="mt-6">
              {result.chart ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <BirthChart
                        houses={transformChartToHouses(result.chart as BirthChartData)}
                        title="Rashi Chart (D1)"
                      />
                    </CardContent>
                  </Card>

                  {/* Planet Positions Summary */}
                  {(() => {
                    const meta = result.chart?.meta;
                    if (!meta) return null;

                    const order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle>Planet Positions</CardTitle>
                          <CardDescription>
                            Sidereal positions with Lahiri ayanamsa
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Planet</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Sign</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Degree</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Nakshatra</th>
                                  <th className="py-3 text-left font-medium text-muted-foreground">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order
                                  .filter((name) => meta[name])
                                  .map((name) => {
                                    const planet = meta[name];
                                    const degInSign = planet.longitude % 30;
                                    return (
                                      <tr key={name} className="border-b border-border last:border-0">
                                        <td className="py-3 pr-4 font-medium text-foreground">
                                          {PLANET_ABBR[name] ?? name}
                                          <span className="ml-1.5 text-muted-foreground font-normal">
                                            {name}
                                          </span>
                                        </td>
                                        <td className="py-3 pr-4 text-foreground">{planet.rashi}</td>
                                        <td className="py-3 pr-4 tabular-nums text-foreground">
                                          {degInSign.toFixed(2)}&deg;
                                        </td>
                                        <td className="py-3 pr-4 text-foreground">
                                          {planet.nakshatra?.name}
                                          <span className="ml-1 text-muted-foreground">
                                            P{planet.nakshatra?.pada}
                                          </span>
                                        </td>
                                        <td className="py-3">
                                          {planet.isRetrograde ? (
                                            <Badge variant="destructive">Retro</Badge>
                                          ) : (
                                            <span className="text-muted-foreground">&mdash;</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Combustion Warnings */}
                  {(() => {
                    const chartData = result.chart as BirthChartData;
                    const combustion = chartData?.combustion;
                    if (!combustion?.length) return null;

                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle>Combustion</CardTitle>
                          <CardDescription>
                            Planets too close to the Sun lose strength
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {combustion.map((c) => (
                              <Badge key={c.planet} variant="outline">
                                {c.planet} &mdash; {c.distanceFromSun.toFixed(2)}&deg; from Sun
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Interpretations */}
                  {(() => {
                    const chartData = result.chart as BirthChartData;
                    const interpretations = chartData?.interpretations;
                    if (!interpretations) return null;

                    const order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
                    const planets = order.filter((name) => interpretations[name]);
                    if (!planets.length) return null;

                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle>Interpretations</CardTitle>
                          <CardDescription>
                            Rashi and nakshatra readings for each planet
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {planets.map((name, idx) => {
                              const interp = interpretations[name];
                              return (
                                <div key={name}>
                                  {idx > 0 && <Separator className="mb-6" />}
                                  <h4 className="text-sm font-semibold text-foreground mb-3">
                                    {name}
                                  </h4>
                                  {interp.rashi && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                        Rashi
                                      </p>
                                      <p className="text-sm leading-relaxed text-foreground">
                                        {interp.rashi}
                                      </p>
                                    </div>
                                  )}
                                  {interp.nakshatra && (
                                    <div>
                                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                        Nakshatra
                                      </p>
                                      <p className="text-sm leading-relaxed text-foreground">
                                        {interp.nakshatra}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Birth chart data unavailable
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Navamsa Chart Tab */}
            <TabsContent value="navamsa" className="mt-6">
              {result.navamsa ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <BirthChart
                        houses={transformNavamsaToHouses(result.navamsa)}
                        title="Navamsa Chart (D9)"
                      />
                    </CardContent>
                  </Card>

                  {/* Planet Positions */}
                  {(() => {
                    const meta = result.navamsa?.chart?.meta;
                    if (!meta) return null;

                    const order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle>Planet Positions</CardTitle>
                          <CardDescription>
                            Navamsa (D9) sidereal positions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Planet</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Sign</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Degree</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Nakshatra</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Pada</th>
                                  <th className="py-3 text-left font-medium text-muted-foreground">Retro</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order
                                  .filter((name) => meta[name])
                                  .map((name) => {
                                    const planet = meta[name];
                                    const degInSign = planet.longitude % 30;
                                    return (
                                      <tr key={name} className="border-b border-border last:border-0">
                                        <td className="py-3 pr-4 font-medium text-foreground">
                                          {PLANET_ABBR[name] ?? name}
                                          <span className="ml-1.5 text-muted-foreground font-normal">
                                            {name}
                                          </span>
                                        </td>
                                        <td className="py-3 pr-4 text-foreground">{planet.rashi}</td>
                                        <td className="py-3 pr-4 tabular-nums text-foreground">
                                          {degInSign.toFixed(2)}&deg;
                                        </td>
                                        <td className="py-3 pr-4 text-foreground">{planet.nakshatra?.name}</td>
                                        <td className="py-3 pr-4 text-foreground">{planet.nakshatra?.pada}</td>
                                        <td className="py-3">
                                          {planet.isRetrograde ? (
                                            <Badge variant="destructive">R</Badge>
                                          ) : (
                                            <span className="text-muted-foreground">&mdash;</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Vargottama */}
                  {(() => {
                    if (!result.navamsa?.vargottama?.length) return null;
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle>Vargottama Planets</CardTitle>
                          <CardDescription>Same sign in D1 and D9 — exceptionally strong</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {result.navamsa.vargottama.map((planet) => (
                              <Badge key={planet} variant="secondary">
                                {planet}
                              </Badge>
                            ))}
                          </div>
                          {result.navamsa.vargottamaExplanation && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {result.navamsa.vargottamaExplanation}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Navamsa data unavailable
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Varga Tab */}
            <TabsContent value="varga" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Divisional Charts</CardTitle>
                    <CardDescription>
                      Select a varga chart to analyze specific life areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="space-y-2">
                        <Label>Divisional Chart</Label>
                        <Select
                          value={String(selectedDivision)}
                          onValueChange={(val) => setSelectedDivision(Number(val))}
                        >
                          <SelectTrigger className="w-[260px]">
                            <SelectValue placeholder="Select a chart" />
                          </SelectTrigger>
                          <SelectContent>
                            {VARGA_CHARTS.map((v) => (
                              <SelectItem key={v.division} value={String(v.division)}>
                                {v.name} — {v.desc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleLoadVarga} disabled={vargaLoading}>
                        {vargaLoading ? 'Loading...' : 'Load Chart'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {vargaResult && (() => {
                  const chartData = vargaResult.chart;
                  if (!chartData?.meta) return null;

                  const lagnaInfo = chartData.meta['Lagna'] ?? chartData.meta['Ascendant'];
                  const lagnaRashi = lagnaInfo?.rashi ?? 'Aries';
                  const lagnaIndex = RASHI_NAMES.findIndex(
                    (r) => r.toLowerCase() === lagnaRashi.toLowerCase(),
                  );
                  const lagnaIdx = lagnaIndex >= 0 ? lagnaIndex : 0;

                  const houses = SIGN_KEYS.map((key, signIndex) => {
                    const signData = chartData[key] as
                      | { rashi: string; signs: { graha: string }[] }
                      | undefined;

                    const houseNumber = ((signIndex - lagnaIdx + 12) % 12) + 1;
                    const signName = RASHI_NAMES[signIndex];
                    const planets = (signData?.signs ?? [])
                      .map((p) => p.graha)
                      .filter((g) => g !== 'Lagna' && g !== 'Ascendant');

                    return { house: houseNumber, sign: signName, planets };
                  });

                  const selectedChart = VARGA_CHARTS.find((v) => v.division === selectedDivision);
                  const chartTitle = selectedChart ? `${selectedChart.name} — ${selectedChart.desc}` : `D${selectedDivision}`;

                  return (
                    <>
                      <Card>
                        <CardContent className="pt-6">
                          <BirthChart houses={houses} title={chartTitle} />
                        </CardContent>
                      </Card>

                      {/* Planet Positions */}
                      {chartData.meta && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Planet Positions</CardTitle>
                            <CardDescription>
                              {selectedChart ? selectedChart.name : `D${selectedDivision}`} sidereal positions
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Planet</th>
                                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Sign</th>
                                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Degree</th>
                                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Nakshatra</th>
                                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Pada</th>
                                    <th className="py-3 text-left font-medium text-muted-foreground">Retro</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
                                    .filter((name) => chartData.meta[name])
                                    .map((name) => {
                                      const planet = chartData.meta[name];
                                      const degInSign = planet.longitude % 30;
                                      return (
                                        <tr key={name} className="border-b border-border last:border-0">
                                          <td className="py-3 pr-4 font-medium text-foreground">
                                            {PLANET_ABBR[name] ?? name}
                                            <span className="ml-1.5 text-muted-foreground font-normal">{name}</span>
                                          </td>
                                          <td className="py-3 pr-4 text-foreground">{planet.rashi}</td>
                                          <td className="py-3 pr-4 tabular-nums text-foreground">{degInSign.toFixed(2)}&deg;</td>
                                          <td className="py-3 pr-4 text-foreground">{planet.nakshatra?.name}</td>
                                          <td className="py-3 pr-4 text-foreground">{planet.nakshatra?.pada}</td>
                                          <td className="py-3">
                                            {planet.isRetrograde ? (
                                              <Badge variant="destructive">R</Badge>
                                            ) : (
                                              <span className="text-muted-foreground">&mdash;</span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Vargottama for this divisional chart */}
                      {(() => {
                        const vargottama = vargaResult.vargottama;
                        if (!vargottama?.length) return null;
                        return (
                          <Card>
                            <CardHeader>
                              <CardTitle>Vargottama Planets</CardTitle>
                              <CardDescription>Same sign in D1 and D{selectedDivision}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {vargottama.map((planet) => (
                                  <Badge key={planet} variant="secondary">
                                    {planet}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })()}
                    </>
                  );
                })()}
              </div>
            </TabsContent>

            {/* Planets Tab */}
            <TabsContent value="planets" className="mt-6">
              {result.chart ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Planetary Positions</CardTitle>
                    <CardDescription>
                      Sidereal positions with Lahiri ayanamsa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Planet</th>
                            <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Sign</th>
                            <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Degree</th>
                            <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Nakshatra</th>
                            <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Pada</th>
                            <th className="py-3 text-left font-medium text-muted-foreground">Retro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const meta = result.chart?.meta;
                            if (!meta) return null;

                            const order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Lagna'];

                            return order
                              .filter((name) => meta[name])
                              .map((name) => {
                                const planet = meta[name];
                                const degInSign = planet.longitude % 30;

                                return (
                                  <tr key={name} className="border-b border-border last:border-0">
                                    <td className="py-3 pr-4 font-medium text-foreground">
                                      {PLANET_ABBR[name] ?? name}
                                      <span className="ml-1.5 text-muted-foreground font-normal">
                                        {name}
                                      </span>
                                    </td>
                                    <td className="py-3 pr-4 text-foreground">{planet.rashi}</td>
                                    <td className="py-3 pr-4 tabular-nums text-foreground">
                                      {degInSign.toFixed(2)}&deg;
                                    </td>
                                    <td className="py-3 pr-4 text-foreground">{planet.nakshatra.name}</td>
                                    <td className="py-3 pr-4 text-foreground">{planet.nakshatra.pada}</td>
                                    <td className="py-3">
                                      {planet.isRetrograde ? (
                                        <Badge variant="destructive">R</Badge>
                                      ) : (
                                        <span className="text-muted-foreground">&mdash;</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Planet data unavailable
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Dasha Tab */}
            <TabsContent value="dasha" className="mt-6">
              {result.dashas ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Vimshottari Mahadasha</CardTitle>
                    <CardDescription>
                      {(() => {
                        const d = result.dashas;
                        if (!d?.nakshatraName) return '120-year planetary period cycle from birth';
                        return `Moon nakshatra: ${d.nakshatraName}. Balance at birth: ${d.birthDashaBalance?.years}y ${d.birthDashaBalance?.months}m ${d.birthDashaBalance?.days}d`;
                      })()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const d = result.dashas;
                        if (!d?.mahadashas) return null;

                        const now = new Date();

                        return d.mahadashas.map((md) => {
                          const start = new Date(md.startDate);
                          const end = new Date(md.endDate);
                          const isCurrent = now >= start && now <= end;

                          return (
                            <div
                              key={md.planet + md.startDate}
                              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                                isCurrent
                                  ? 'bg-primary/10 ring-1 ring-primary/20'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                  {md.planet}
                                </span>
                                {isCurrent && (
                                  <Badge variant="default">Current</Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className={`text-sm tabular-nums ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                  {formatDate(md.startDate.split('T')[0])} &mdash; {formatDate(md.endDate.split('T')[0])}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDuration(md.durationYears)}
                                </p>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Dasha data unavailable
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Doshas Tab */}
            <TabsContent value="doshas" className="mt-6">
              <div className="space-y-6">
                {/* Manglik Dosha */}
                <DoshaCard
                  title="Manglik Dosha"
                  subtitle="Mars-based affliction for marriage compatibility"
                  data={result.manglik}
                />

                {/* Kalsarpa Dosha */}
                <DoshaCard
                  title="Kalsarpa Dosha"
                  subtitle="Rahu-Ketu axis hemming all planets"
                  data={result.kalsarpa}
                  extraField="type"
                />

                {/* Sadhesati */}
                <DoshaCard
                  title="Sadhesati"
                  subtitle="Saturn transit over natal Moon (7.5 year cycle)"
                  data={result.sadhesati}
                  extraField="type"
                />
              </div>
            </TabsContent>

            {/* Strength Tab */}
            <TabsContent value="strength" className="mt-6">
              <div className="space-y-6">
                {!strengthResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Strength Analysis</CardTitle>
                      <CardDescription>
                        Ashtakavarga benefic points and Shadbala planetary strengths
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={handleLoadStrength} disabled={strengthLoading}>
                        {strengthLoading ? 'Loading...' : 'Load Strength Analysis'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {strengthResult && (
                  <>
                    {/* Ashtakavarga Section */}
                    {strengthResult.ashtakavarga && (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle>Sarvashtakavarga</CardTitle>
                            <CardDescription>
                              Combined benefic points (bindus) per sign from all planets
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Sign</th>
                                    <th className="py-3 text-left font-medium text-muted-foreground">Total Bindus</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    const bindusArr = strengthResult.ashtakavarga?.sarvashtakavarga?.bindus;
                                    if (!bindusArr) return null;

                                    return bindusArr.map((bindus, idx) => (
                                      <tr key={idx} className="border-b border-border last:border-0">
                                        <td className="py-3 pr-4 font-medium text-foreground">{RASHI_NAMES[idx]}</td>
                                        <td className="py-3 tabular-nums text-foreground">
                                          <Badge variant={bindus >= 28 ? 'default' : bindus <= 22 ? 'destructive' : 'secondary'}>
                                            {bindus}
                                          </Badge>
                                        </td>
                                      </tr>
                                    ));
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Bhinnashtakavarga */}
                        {strengthResult.ashtakavarga?.bhinnashtakavarga && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Bhinnashtakavarga</CardTitle>
                              <CardDescription>
                                Individual planet benefic point contributions per sign
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border">
                                      <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Planet</th>
                                      {RASHI_NAMES.map((sign) => (
                                        <th key={sign} className="py-3 px-2 text-center font-medium text-muted-foreground text-xs">
                                          {sign.slice(0, 3)}
                                        </th>
                                      ))}
                                      <th className="py-3 pl-4 text-center font-medium text-muted-foreground">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const bhinna = strengthResult.ashtakavarga?.bhinnashtakavarga;
                                      if (!bhinna) return null;
                                      return bhinna.map((entry) => (
                                        <tr key={entry.planet} className="border-b border-border last:border-0">
                                          <td className="py-3 pr-4 font-medium text-foreground">{entry.planet}</td>
                                          {entry.bindus.map((score, idx) => (
                                            <td key={idx} className="py-3 px-2 text-center tabular-nums text-foreground">
                                              {score}
                                            </td>
                                          ))}
                                          <td className="py-3 pl-4 text-center tabular-nums font-semibold text-foreground">{entry.total}</td>
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}

                    {/* Shadbala Section */}
                    {strengthResult.shadbala && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Shadbala</CardTitle>
                          <CardDescription>
                            Six-fold planetary strength in virupas. Ratio above 1 indicates sufficient strength.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Planet</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Total (virupas)</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Rupas</th>
                                  <th className="py-3 pr-4 text-left font-medium text-muted-foreground">Required</th>
                                  <th className="py-3 text-left font-medium text-muted-foreground">Ratio</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const planets = strengthResult.shadbala?.planets;
                                  if (!planets) return null;

                                  return planets.map((p) => (
                                    <tr key={p.planet} className="border-b border-border last:border-0">
                                      <td className="py-3 pr-4 font-medium text-foreground">{p.planet}</td>
                                      <td className="py-3 pr-4 tabular-nums text-foreground">{p.totalVirupas?.toFixed(2) ?? '—'}</td>
                                      <td className="py-3 pr-4 tabular-nums text-foreground">{p.totalRupas?.toFixed(2) ?? '—'}</td>
                                      <td className="py-3 pr-4 tabular-nums text-foreground">{p.minRequired?.toFixed(2) ?? '—'}</td>
                                      <td className="py-3">
                                        <Badge variant={(p.strengthRatio ?? 0) >= 1 ? 'default' : 'destructive'}>
                                          {p.strengthRatio?.toFixed(2) ?? '—'}
                                        </Badge>
                                      </td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Reload button */}
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={handleLoadStrength} disabled={strengthLoading}>
                        {strengthLoading ? 'Reloading...' : 'Reload Strength Analysis'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
    </div>
  );
}

function DoshaCard({
  title,
  subtitle,
  data,
  extraField,
}: {
  title: string;
  subtitle: string;
  data: DoshaResponse | undefined;
  extraField?: 'type';
}) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{subtitle}</CardDescription>
          </div>
          <Badge variant={data.present ? 'destructive' : 'secondary'}>
            {data.present ? 'Present' : 'Absent'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Severity & Type */}
          {(data.severity || (extraField && 'type' in data && data.type)) && (
            <div className="flex flex-wrap gap-2">
              {data.severity && (
                <Badge variant="outline">{data.severity}</Badge>
              )}
              {extraField && 'type' in data && data.type && (
                <Badge variant="outline">
                  {data.type}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-sm leading-relaxed text-foreground">
            {data.description}
          </p>

          {/* Exceptions (Manglik only) */}
          {'exceptions' in data && data.exceptions && data.exceptions.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Cancellation Factors
                </p>
                <ul className="space-y-1.5">
                  {data.exceptions.map((ex, i) => (
                    <li key={i} className="text-sm text-foreground">
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Remedies */}
          {data.remedies && data.remedies.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Remedies
                </p>
                <ul className="space-y-1.5">
                  {data.remedies.map((remedy, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {remedy}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
