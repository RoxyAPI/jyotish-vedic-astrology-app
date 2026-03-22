'use client';

import { useEffect, useRef, useState } from 'react';

interface BirthChartProps {
  houses: {
    house: number;
    sign: string;
    planets: string[];
  }[];
  title?: string;
}

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
  Ascendant: 'Asc',
};

const SIGN_ABBR: Record<string, string> = {
  Aries: 'Ar',
  Taurus: 'Ta',
  Gemini: 'Ge',
  Cancer: 'Cn',
  Leo: 'Le',
  Virgo: 'Vi',
  Libra: 'Li',
  Scorpio: 'Sc',
  Sagittarius: 'Sg',
  Capricorn: 'Cp',
  Aquarius: 'Aq',
  Pisces: 'Pi',
};

// Centroids for planet text placement in each house
const HOUSE_CENTERS: Record<number, { x: number; y: number }> = {
  1:  { x: 150, y: 58 },
  2:  { x: 205, y: 52 },
  3:  { x: 253, y: 112 },
  4:  { x: 243, y: 150 },
  5:  { x: 253, y: 188 },
  6:  { x: 205, y: 248 },
  7:  { x: 150, y: 242 },
  8:  { x: 95, y: 248 },
  9:  { x: 47, y: 188 },
  10: { x: 57, y: 150 },
  11: { x: 47, y: 112 },
  12: { x: 95, y: 52 },
};

// Sign abbreviation positions near outer edge
const SIGN_POSITIONS: Record<number, { x: number; y: number }> = {
  1:  { x: 150, y: 35 },
  2:  { x: 222, y: 40 },
  3:  { x: 265, y: 100 },
  4:  { x: 265, y: 150 },
  5:  { x: 265, y: 200 },
  6:  { x: 222, y: 260 },
  7:  { x: 150, y: 265 },
  8:  { x: 78, y: 260 },
  9:  { x: 35, y: 200 },
  10: { x: 35, y: 150 },
  11: { x: 35, y: 100 },
  12: { x: 78, y: 40 },
};

function useResolvedColors() {
  const [colors, setColors] = useState({ line: '#d4d4d8', text: '#09090b', muted: '#a1a1aa' });
  const lineRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const mutedRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const read = () => {
      setColors({
        line: lineRef.current ? getComputedStyle(lineRef.current).borderColor : '#d4d4d8',
        text: textRef.current ? getComputedStyle(textRef.current).color : '#09090b',
        muted: mutedRef.current ? getComputedStyle(mutedRef.current).color : '#a1a1aa',
      });
    };
    read();
    // Re-read when theme changes (class on <html> toggles)
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return { colors, containerRef, lineRef, textRef, mutedRef };
}

export function BirthChart({ houses, title }: BirthChartProps) {
  const houseMap = new Map(houses.map((h) => [h.house, h]));
  const { colors, containerRef, lineRef, textRef, mutedRef } = useResolvedColors();

  return (
    <div ref={containerRef} className="w-full max-w-sm mx-auto">
      {/* Hidden probes to read resolved theme colors */}
      <span ref={lineRef} className="hidden border-border" />
      <span ref={textRef} className="hidden text-foreground" />
      <span ref={mutedRef} className="hidden text-muted-foreground" />
      {title && (
        <p className="text-sm font-medium text-center mb-2 text-foreground">
          {title}
        </p>
      )}
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label={title ? `${title} birth chart` : 'Vedic birth chart'}
      >
        <rect width="300" height="300" fill="transparent" />

        {/* Outer diamond */}
        <polygon
          points="150,10 290,150 150,290 10,150"
          fill="transparent"
          stroke={colors.line}
          strokeWidth="1.5"
        />

        {/* Inner square */}
        <polygon
          points="220,80 220,220 80,220 80,80"
          fill="none"
          stroke={colors.line}
          strokeWidth="1"
        />

        {/* Diagonal lines from corners to inner square */}
        <line x1="150" y1="10" x2="80" y2="80" stroke={colors.line} strokeWidth="1" />
        <line x1="150" y1="10" x2="220" y2="80" stroke={colors.line} strokeWidth="1" />
        <line x1="290" y1="150" x2="220" y2="80" stroke={colors.line} strokeWidth="1" />
        <line x1="290" y1="150" x2="220" y2="220" stroke={colors.line} strokeWidth="1" />
        <line x1="150" y1="290" x2="220" y2="220" stroke={colors.line} strokeWidth="1" />
        <line x1="150" y1="290" x2="80" y2="220" stroke={colors.line} strokeWidth="1" />
        <line x1="10" y1="150" x2="80" y2="220" stroke={colors.line} strokeWidth="1" />
        <line x1="10" y1="150" x2="80" y2="80" stroke={colors.line} strokeWidth="1" />

        {/* Houses: sign abbreviations and planets */}
        {Array.from({ length: 12 }, (_, i) => {
          const houseNum = i + 1;
          const houseData = houseMap.get(houseNum);
          const center = HOUSE_CENTERS[houseNum];
          const signPos = SIGN_POSITIONS[houseNum];
          const planets = houseData?.planets ?? [];
          const sign = houseData?.sign ?? '';
          const signAbbr = SIGN_ABBR[sign] ?? '';

          return (
            <g key={houseNum}>
              {signAbbr && (
                <text
                  x={signPos.x}
                  y={signPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="9"
                  fontWeight="500"
                  fill={colors.muted}
                >
                  {signAbbr}
                </text>
              )}

              {planets.map((planet, j) => {
                const abbr = PLANET_ABBR[planet] ?? planet.slice(0, 2);
                const lineHeight = 13;
                const startY = center.y - ((planets.length - 1) * lineHeight) / 2;
                const yPos = startY + j * lineHeight;

                return (
                  <text
                    key={planet}
                    x={center.x}
                    y={yPos}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11"
                    fontWeight="600"
                    fill={colors.text}
                  >
                    {abbr}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
