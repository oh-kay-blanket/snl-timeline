import { useMemo } from 'react';
import type { SeasonWithCast } from '../types';
import './RotoscopeBackground.css';

interface RotoscopeBackgroundProps {
  currentSeason: SeasonWithCast | undefined;
  nextSeason: SeasonWithCast | undefined;
  transitionProgress: number;
}

interface ColorSwath {
  path: string;
  color: string;
  opacity: number;
}

export default function RotoscopeBackground({
  currentSeason,
  nextSeason,
  transitionProgress
}: RotoscopeBackgroundProps) {
  // Era-based color palettes (rough rotoscope colors)
  const getEraColors = (seasonNum: number): ColorSwath[] => {
    if (seasonNum <= 5) {
      // 70s: Warm psychedelic oranges, yellows, purples
      return [
        {
          path: 'M0,80 Q50,20 150,60 T300,80 L300,200 Q200,180 100,190 T0,200 Z',
          color: '#ff8c00',
          opacity: 0.25
        },
        {
          path: 'M100,0 Q180,40 250,30 T400,50 L400,120 Q300,140 200,110 T100,100 Z',
          color: '#da70d6',
          opacity: 0.2
        },
        {
          path: 'M200,100 Q280,120 350,140 T500,150 L500,250 Q400,230 300,240 T200,230 Z',
          color: '#ffd700',
          opacity: 0.18
        }
      ];
    } else if (seasonNum <= 10) {
      // Early 80s: Electric blues, hot pinks
      return [
        {
          path: 'M0,50 Q80,30 160,70 T320,60 L320,180 Q240,160 160,170 T0,180 Z',
          color: '#00bfff',
          opacity: 0.22
        },
        {
          path: 'M120,20 Q200,50 280,40 T440,70 L440,150 Q340,170 240,140 T120,140 Z',
          color: '#ff1493',
          opacity: 0.2
        }
      ];
    } else if (seasonNum <= 20) {
      // 80s-90s: Greens, reds
      return [
        {
          path: 'M0,90 Q70,40 180,80 T360,70 L360,200 Q260,180 150,190 T0,210 Z',
          color: '#228b22',
          opacity: 0.2
        },
        {
          path: 'M140,30 Q220,60 300,50 T460,80 L460,170 Q360,190 260,160 T140,170 Z',
          color: '#dc143c',
          opacity: 0.18
        },
        {
          path: 'M80,120 Q160,140 240,130 T400,160 L400,240 Q300,220 200,230 T80,250 Z',
          color: '#4169e1',
          opacity: 0.15
        }
      ];
    } else if (seasonNum <= 30) {
      // 90s-00s: Clean blues, purples
      return [
        {
          path: 'M0,70 Q90,50 190,90 T380,80 L380,190 Q280,170 180,180 T0,200 Z',
          color: '#4169e1',
          opacity: 0.2
        },
        {
          path: 'M110,10 Q190,40 270,30 T430,60 L430,140 Q330,160 230,130 T110,130 Z',
          color: '#8a2be2',
          opacity: 0.18
        }
      ];
    } else {
      // Modern: Contemporary gradient colors
      return [
        {
          path: 'M0,60 Q80,40 170,70 T340,65 L340,175 Q250,160 160,170 T0,185 Z',
          color: '#1e90ff',
          opacity: 0.2
        },
        {
          path: 'M130,25 Q210,55 290,45 T450,75 L450,155 Q350,175 250,145 T130,145 Z',
          color: '#9333ea',
          opacity: 0.17
        }
      ];
    }
  };

  // Get color swaths for current and next season
  const currentSwaths = useMemo(() => {
    if (!currentSeason) return [];
    return getEraColors(currentSeason.season);
  }, [currentSeason]);

  const nextSwaths = useMemo(() => {
    if (!nextSeason) return currentSwaths;
    return getEraColors(nextSeason.season);
  }, [nextSeason, currentSwaths]);

  // Interpolate opacity between current and next swaths
  const currentOpacity = 1 - transitionProgress;
  const nextOpacity = transitionProgress;

  return (
    <div className="rotoscope-background">
      {/* Current season swaths */}
      {currentSwaths.map((swath, index) => (
        <svg
          key={`current-${index}`}
          className="rotoscope-swath"
          viewBox="0 0 500 300"
          preserveAspectRatio="none"
          style={{ opacity: currentOpacity }}
        >
          <path
            d={swath.path}
            fill={swath.color}
            opacity={swath.opacity}
          />
        </svg>
      ))}

      {/* Next season swaths */}
      {nextSeason && currentSeason?.season !== nextSeason.season && nextSwaths.map((swath, index) => (
        <svg
          key={`next-${index}`}
          className="rotoscope-swath"
          viewBox="0 0 500 300"
          preserveAspectRatio="none"
          style={{ opacity: nextOpacity }}
        >
          <path
            d={swath.path}
            fill={swath.color}
            opacity={swath.opacity}
          />
        </svg>
      ))}
    </div>
  );
}
