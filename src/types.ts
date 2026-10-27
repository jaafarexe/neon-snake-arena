export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface FoodItem {
  x: number;
  y: number;
  type: 'regular' | 'golden';
  spawnTime: number;
  durationMs?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export type ThemeId = 'emerald' | 'cyan' | 'magenta' | 'amber';

export interface GameTheme {
  id: ThemeId;
  name: string;
  head: string;
  body: string;
  tail: string;
  glow: string;
  food: string;
  foodGlow: string;
  goldenFood: string;
  goldenFoodGlow: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  arenaBorder: string;
  gridLine: string;
}
