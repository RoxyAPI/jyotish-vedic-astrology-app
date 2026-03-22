'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CitySearch, type CityResult } from '@/components/city-search';
import { calculateCompatibility } from './actions';

type CompatibilityResult = {
  total: number;
  maxScore: number;
  percentage: number;
  isCompatible: boolean;
  recommendation: string;
  doshas: string[];
  breakdown: {
    category: string;
    score: number;
    maxScore: number;
    person1: string;
    person2: string;
    description: string;
  }[];
};

function PersonForm({
  label,
  date,
  time,
  defaultCity,
  onCitySelect,
  onDateChange,
  onTimeChange,
}: {
  label: string;
  date: string;
  time: string;
  defaultCity: string;
  onCitySelect: (city: CityResult) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Enter birth details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Birth Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Birth Time</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <CitySearch onSelect={onCitySelect} defaultValue={defaultCity} />
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreRing({ total, maxScore, percentage }: { total: number; maxScore: number; percentage: number }) {
  const circumference = 2 * Math.PI * 54;
  const filled = (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-36">
        <svg className="size-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            className="stroke-muted"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            className="stroke-primary"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference - filled}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">/ {maxScore}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% match</p>
    </div>
  );
}

function KootaCard({
  category,
  score,
  maxScore,
  person1,
  person2,
  description,
}: CompatibilityResult['breakdown'][number]) {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const bgClass =
    ratio === 1
      ? 'bg-primary/10'
      : ratio === 0
        ? 'bg-destructive/10'
        : 'bg-muted';
  const textClass =
    ratio === 1
      ? 'text-primary'
      : ratio === 0
        ? 'text-destructive'
        : 'text-foreground';

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{category}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <Badge
            variant={ratio === 1 ? 'default' : ratio === 0 ? 'destructive' : 'secondary'}
          >
            {score} / {maxScore}
          </Badge>
        </div>
        <Separator className="my-3" />
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-lg px-3 py-2 ${bgClass}`}>
            <p className="text-xs text-muted-foreground">Person 1</p>
            <p className={`text-sm font-medium ${textClass}`}>{person1}</p>
          </div>
          <div className={`rounded-lg px-3 py-2 ${bgClass}`}>
            <p className="text-xs text-muted-foreground">Person 2</p>
            <p className={`text-sm font-medium ${textClass}`}>{person2}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatchingPage() {
  const [person1Date, setPerson1Date] = useState('1990-07-04');
  const [person1Time, setPerson1Time] = useState('10:00');
  const [person1Loc, setPerson1Loc] = useState({ latitude: 19.076, longitude: 72.8777, timezone: 5.5 });
  const [person2Date, setPerson2Date] = useState('1992-03-15');
  const [person2Time, setPerson2Time] = useState('14:30');
  const [person2Loc, setPerson2Loc] = useState({ latitude: 28.6139, longitude: 77.209, timezone: 5.5 });
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const data = await calculateCompatibility({
        person1: {
          date: person1Date,
          time: `${person1Time}:00`,
          latitude: person1Loc.latitude,
          longitude: person1Loc.longitude,
          timezone: person1Loc.timezone,
        },
        person2: {
          date: person2Date,
          time: `${person2Time}:00`,
          latitude: person2Loc.latitude,
          longitude: person2Loc.longitude,
          timezone: person2Loc.timezone,
        },
      });
      setResult(data as CompatibilityResult);
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Kundali Matching
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ashtakoot Gun Milan compatibility analysis
        </p>
      </div>

      {/* Two-person form */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PersonForm
          label="Person 1"
          date={person1Date}
          time={person1Time}
          defaultCity="Mumbai, India"
          onDateChange={setPerson1Date}
          onTimeChange={setPerson1Time}
          onCitySelect={(c) => setPerson1Loc({ latitude: c.latitude, longitude: c.longitude, timezone: c.utcOffset })}
        />
        <PersonForm
          label="Person 2"
          date={person2Date}
          time={person2Time}
          defaultCity="Delhi, India"
          onDateChange={setPerson2Date}
          onTimeChange={setPerson2Time}
          onCitySelect={(c) => setPerson2Loc({ latitude: c.latitude, longitude: c.longitude, timezone: c.utcOffset })}
        />
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Calculating...' : 'Check Compatibility'}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Separator />

          {/* Score display */}
          <div className="flex flex-col items-center gap-4">
            <ScoreRing
              total={result.total}
              maxScore={result.maxScore}
              percentage={result.percentage}
            />
            <Badge
              variant={result.isCompatible ? 'default' : 'destructive'}
              className="text-sm px-4 py-1"
            >
              {result.isCompatible ? 'Compatible' : 'Not Compatible'}
            </Badge>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {result.recommendation}
            </p>
          </div>

          {/* Dosha warnings */}
          {result.doshas.length > 0 && (
            <div className="space-y-3">
              {result.doshas.map((dosha) => (
                <div
                  key={dosha}
                  className="flex items-center gap-3 rounded-lg bg-destructive/10 px-4 py-3"
                >
                  <span className="text-sm font-medium text-destructive">
                    {dosha}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 8 Koota breakdown */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Koota Breakdown
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {result.breakdown.map((koota) => (
                <KootaCard key={koota.category} {...koota} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
