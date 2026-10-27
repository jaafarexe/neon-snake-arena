import { GameTheme, ThemeId } from '../types.ts';

export const GRID_SIZE = 22; // 22x22 cells
export const INITIAL_SPEED_MS = 135;
export const MIN_SPEED_MS = 55;
export const SPEED_STEP_MS = 2.5;

export const REGULAR_FOOD_POINTS = 10;
export const GOLDEN_FOOD_POINTS = 30;
export const GOLDEN_FOOD_CHANCE = 0.22; // 22% chance to spawn golden food alongside regular
export const GOLDEN_FOOD_DURATION_MS = 7500; // 7.5 seconds before golden pulse vanishes

export const INITIAL_SNAKE = [
  { x: 11, y: 11 },
  { x: 11, y: 12 },
  { x: 11, y: 13 },
];

export const INITIAL_DIRECTION = 'UP' as const;

export const THEMES: Record<ThemeId, GameTheme> = {
  emerald: {
    id: 'emerald',
    name: 'Matrix Emerald',
    head: '#34d399',
    body: '#10b981',
    tail: '#059669',
    glow: 'rgba(52, 211, 153, 0.75)',
    food: '#f43f5e',
    foodGlow: 'rgba(244, 63, 94, 0.8)',
    goldenFood: '#fbbf24',
    goldenFoodGlow: 'rgba(251, 191, 36, 0.9)',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/30',
    arenaBorder: '#10b981',
    gridLine: 'rgba(16, 185, 129, 0.05)',
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    head: '#38bdf8',
    body: '#06b6d4',
    tail: '#0891b2',
    glow: 'rgba(56, 189, 248, 0.75)',
    food: '#f97316',
    foodGlow: 'rgba(249, 115, 22, 0.8)',
    goldenFood: '#facc15',
    goldenFoodGlow: 'rgba(250, 204, 21, 0.9)',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500/15',
    accentBorder: 'border-cyan-500/30',
    arenaBorder: '#06b6d4',
    gridLine: 'rgba(6, 182, 212, 0.05)',
  },
  magenta: {
    id: 'magenta',
    name: 'Synth Magenta',
    head: '#f472b6',
    body: '#ec4899',
    tail: '#db2777',
    glow: 'rgba(244, 114, 182, 0.75)',
    food: '#22d3ee',
    foodGlow: 'rgba(34, 211, 238, 0.8)',
    goldenFood: '#fbbf24',
    goldenFoodGlow: 'rgba(251, 191, 36, 0.9)',
    accentText: 'text-pink-400',
    accentBg: 'bg-pink-500/15',
    accentBorder: 'border-pink-500/30',
    arenaBorder: '#ec4899',
    gridLine: 'rgba(236, 72, 153, 0.05)',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    head: '#fbbf24',
    body: '#f59e0b',
    tail: '#d97706',
    glow: 'rgba(251, 191, 36, 0.75)',
    food: '#a855f7',
    foodGlow: 'rgba(168, 85, 247, 0.8)',
    goldenFood: '#38bdf8',
    goldenFoodGlow: 'rgba(56, 189, 248, 0.9)',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/15',
    accentBorder: 'border-amber-500/30',
    arenaBorder: '#f59e0b',
    gridLine: 'rgba(245, 158, 11, 0.05)',
  },
};
