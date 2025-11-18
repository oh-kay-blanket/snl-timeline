export interface CastMember {
  name: string;
  status: string;
  url: string;
  season: number;
  season_start: number;
  gender?: 'male' | 'female';
  total_seasons: number;
  cat: string;
  period: number;
  color: string;
  bio?: string;
}

export interface SeasonData {
  season: number;
  year: string;
  cast: string;
  anchors: string;
  summary: string;
  hosts: string;
  music: string;
  sketches: string;
}

export interface SpriteCoordinates {
  [key: string]: [number, number, number, number]; // [x, y, width, height]
}

export interface SeasonWithCast {
  season: number;
  year: string;
  yearStart: number;
  yearEnd: number;
  cast: CastMember[];
  newCast: CastMember[];
  departingCast: CastMember[];
  continuingCast: CastMember[];
  anchors: string;
  summary: string;
  hosts: string;
  music: string;
  sketches: string;
}

export type Timespan = [number, number];
