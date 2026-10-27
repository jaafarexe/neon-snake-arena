import { useState, useEffect, useRef, useCallback } from 'react';
import { Direction, FoodItem, GameStatus, Particle, Point, ThemeId } from './types.ts';
import {
  GRID_SIZE,
  INITIAL_SNAKE,
  INITIAL_DIRECTION,
  INITIAL_SPEED_MS,
  MIN_SPEED_MS,
  SPEED_STEP_MS,
  REGULAR_FOOD_POINTS,
  GOLDEN_FOOD_POINTS,
  GOLDEN_FOOD_CHANCE,
  GOLDEN_FOOD_DURATION_MS,
  THEMES,
} from './utils/constants.ts';
import { soundFx } from './utils/audio.ts';
import { NeonCanvas } from './components/NeonCanvas.tsx';
import { ScoreBoard } from './components/ScoreBoard.tsx';
import { ControlsOverlay } from './components/ControlsOverlay.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { HowToPlay } from './components/HowToPlay.tsx';
import { Play } from 'lucide-react';

export default function App() {
  // Theme state
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('neon_snake_theme');
    if (saved && saved in THEMES) return saved as ThemeId;
    return 'emerald';
  });

  const theme = THEMES[themeId];

  // Game state
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('neon_snake_best_score');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [speedMs, setSpeedMs] = useState<number>(INITIAL_SPEED_MS);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [deathReason, setDeathReason] = useState<string>('');
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.isMuted());

  // Refs for current mutable state in game loop
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const nextDirectionsRef = useRef<Direction[]>([]);
  const gameStatusRef = useRef<GameStatus>('IDLE');
  const foodsRef = useRef<FoodItem[]>([]);
  const speedMsRef = useRef<number>(INITIAL_SPEED_MS);
  const scoreRef = useRef<number>(0);
  const bestScoreRef = useRef<number>(bestScore);

  // Sync refs with state
  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    foodsRef.current = foods;
  }, [foods]);

  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    bestScoreRef.current = bestScore;
  }, [bestScore]);

  // Spawn random unoccupied coordinate
  const getFreeCell = useCallback((currentSnake: Point[], existingFoods: FoodItem[]): Point => {
    const occupied = new Set<string>();
    currentSnake.forEach((p) => occupied.add(`${p.x},${p.y}`));
    existingFoods.forEach((f) => occupied.add(`${f.x},${f.y}`));

    const available: Point[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!occupied.has(`${x},${y}`)) {
          available.push({ x, y });
        }
      }
    }

    if (available.length === 0) {
      return { x: 0, y: 0 };
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }, []);

  // Spawn foods helper
  const spawnFood = useCallback(
    (currentSnake: Point[], forceRegularOnly: boolean = false): FoodItem[] => {
      const items: FoodItem[] = [];
      const regularCell = getFreeCell(currentSnake, items);
      items.push({
        x: regularCell.x,
        y: regularCell.y,
        type: 'regular',
        spawnTime: performance.now(),
      });

      // Bonus golden pulse chance
      if (!forceRegularOnly && Math.random() < GOLDEN_FOOD_CHANCE) {
        const goldenCell = getFreeCell(currentSnake, items);
        items.push({
          x: goldenCell.x,
          y: goldenCell.y,
          type: 'golden',
          spawnTime: performance.now(),
          durationMs: GOLDEN_FOOD_DURATION_MS,
        });
      }

      return items;
    },
    [getFreeCell]
  );

  // Initialize foods on start
  useEffect(() => {
    if (foods.length === 0) {
      const initialFoods = spawnFood(INITIAL_SNAKE, true);
      setFoods(initialFoods);
      foodsRef.current = initialFoods;
    }
  }, [spawnFood, foods.length]);

  // Create explosion particles
  const createParticles = useCallback(
    (gridX: number, gridY: number, color: string, glowColor: string, count: number = 18) => {
      // In pixel terms, approx 540 max canvas size / GRID_SIZE
      // We pass grid coordinates and NeonCanvas scales them
      const newParticles: Particle[] = [];
      const canvasWidth = 540;
      const cellSize = canvasWidth / GRID_SIZE;
      const originX = gridX * cellSize + cellSize / 2;
      const originY = gridY * cellSize + cellSize / 2;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 4.5;
        const life = 18 + Math.floor(Math.random() * 22);

        newParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.2 + Math.random() * 3.2,
          color,
          glowColor,
          alpha: 1,
          life,
          maxLife: life,
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
    },
    []
  );

  // Change direction with queueing & 180-degree protection
  const requestDirection = useCallback((newDir: Direction) => {
    const queue = nextDirectionsRef.current;
    const lastDir = queue.length > 0 ? queue[queue.length - 1] : directionRef.current;

    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    // Ignore exact same or 180-degree direct reverse
    if (newDir === lastDir || newDir === opposites[lastDir]) {
      return;
    }

    // Limit buffer to 2 steps to ensure ultra-crisp responsive inputs
    if (queue.length < 2) {
      queue.push(newDir);
      soundFx.playTurn();
    }
  }, []);

  // Start / Resume game
  const startGame = useCallback(() => {
    if (gameStatusRef.current === 'IDLE' || gameStatusRef.current === 'PAUSED') {
      soundFx.playTogglePause(false);
      setGameStatus('PLAYING');
    }
  }, []);

  // Pause game
  const pauseGame = useCallback(() => {
    if (gameStatusRef.current === 'PLAYING') {
      soundFx.playTogglePause(true);
      setGameStatus('PAUSED');
    }
  }, []);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (gameStatus === 'PLAYING') {
      pauseGame();
    } else if (gameStatus === 'PAUSED' || gameStatus === 'IDLE') {
      startGame();
    } else if (gameStatus === 'GAME_OVER') {
      restartGame();
    }
  }, [gameStatus, pauseGame, startGame]);

  // Restart game cleanly without page reload
  const restartGame = useCallback(() => {
    const newFoods = spawnFood(INITIAL_SNAKE, true);
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    nextDirectionsRef.current = [];
    setScore(0);
    setSpeedMs(INITIAL_SPEED_MS);
    setFoods(newFoods);
    setParticles([]);
    setDeathReason('');
    setIsNewRecord(false);
    setGameStatus('PLAYING');
    soundFx.playTogglePause(false);
  }, [spawnFood]);

  // Handle Game Over
  const triggerGameOver = useCallback(
    (reason: string) => {
      soundFx.playGameOver();
      setDeathReason(reason);
      setGameStatus('GAME_OVER');

      const currentScore = scoreRef.current;
      const currentBest = bestScoreRef.current;

      if (currentScore > currentBest) {
        setIsNewRecord(true);
        setBestScore(currentScore);
        localStorage.setItem('neon_snake_best_score', currentScore.toString());
      } else {
        setIsNewRecord(false);
      }

      // Shockwave particles at snake head
      if (snakeRef.current.length > 0) {
        const head = snakeRef.current[0];
        createParticles(head.x, head.y, '#ef4444', 'rgba(239, 68, 68, 0.9)', 36);
      }
    },
    [createParticles]
  );

  // Main game tick loop
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const timer = setInterval(() => {
      // 1. Resolve next direction from buffer if available
      if (nextDirectionsRef.current.length > 0) {
        const next = nextDirectionsRef.current.shift()!;
        directionRef.current = next;
        setDirection(next);
      }

      const currentDir = directionRef.current;
      const currentSnake = snakeRef.current;
      const head = currentSnake[0];

      let nextX = head.x;
      let nextY = head.y;

      if (currentDir === 'UP') nextY -= 1;
      else if (currentDir === 'DOWN') nextY += 1;
      else if (currentDir === 'LEFT') nextX -= 1;
      else if (currentDir === 'RIGHT') nextX += 1;

      // Check wall collision
      if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
        triggerGameOver('Crashed into the arena boundary perimeter');
        return;
      }

      // Check self-collision (exclude tail tip since it moves forward unless eating)
      const isSelfCollision = currentSnake.slice(0, -1).some((seg) => seg.x === nextX && seg.y === nextY);
      if (isSelfCollision) {
        triggerGameOver('Collided with your own glowing tail');
        return;
      }

      const newHead = { x: nextX, y: nextY };
      const currentFoods = [...foodsRef.current];
      const now = performance.now();

      // Filter expired golden foods
      const activeFoods = currentFoods.filter((f) => {
        if (f.type === 'golden' && f.durationMs && f.spawnTime) {
          return now - f.spawnTime < f.durationMs;
        }
        return true;
      });

      // Check if food was eaten
      const eatenFoodIndex = activeFoods.findIndex((f) => f.x === nextX && f.y === nextY);

      if (eatenFoodIndex !== -1) {
        const eaten = activeFoods[eatenFoodIndex];
        const isGolden = eaten.type === 'golden';
        const pointsToAdd = isGolden ? GOLDEN_FOOD_POINTS : REGULAR_FOOD_POINTS;

        // Sound effect
        soundFx.playEat(isGolden);

        // Particle sparks
        createParticles(
          nextX,
          nextY,
          isGolden ? theme.goldenFood : theme.food,
          isGolden ? theme.goldenFoodGlow : theme.foodGlow,
          isGolden ? 26 : 18
        );

        // Increase score
        const newScore = scoreRef.current + pointsToAdd;
        setScore(newScore);
        scoreRef.current = newScore;
        if (newScore > bestScoreRef.current) {
          setBestScore(newScore);
          bestScoreRef.current = newScore;
          localStorage.setItem('neon_snake_best_score', newScore.toString());
        }

        // Snake grows: keep all old segments and prepend new head
        const grownSnake = [newHead, ...currentSnake];
        setSnake(grownSnake);
        snakeRef.current = grownSnake;

        // Speed increases gradually
        setSpeedMs((prev) => {
          const nextSpeed = Math.max(MIN_SPEED_MS, prev - SPEED_STEP_MS);
          speedMsRef.current = nextSpeed;
          return nextSpeed;
        });

        // Remove eaten food and spawn replacement if regular food eaten
        const remainingFoods = activeFoods.filter((_, idx) => idx !== eatenFoodIndex);

        if (!isGolden) {
          const freshFoods = spawnFood(grownSnake);
          setFoods(freshFoods);
          foodsRef.current = freshFoods;
        } else {
          setFoods(remainingFoods);
          foodsRef.current = remainingFoods;
        }
      } else {
        // Normal move: advance head and drop tail
        const newSnake = [newHead, ...currentSnake.slice(0, -1)];
        setSnake(newSnake);
        snakeRef.current = newSnake;

        // Update active foods in case golden food expired
        if (activeFoods.length !== currentFoods.length) {
          setFoods(activeFoods);
          foodsRef.current = activeFoods;
        }
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [gameStatus, speedMs, spawnFood, triggerGameOver, createParticles, theme]);

  // Particle update loop
  useEffect(() => {
    let frameId: number;
    const updateParticles = () => {
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.94,
            vy: p.vy * 0.94,
            life: p.life - 1,
            alpha: (p.life - 1) / p.maxLife,
            size: p.size * 0.96,
          }))
          .filter((p) => p.life > 0 && p.alpha > 0.05);
      });
      frameId = requestAnimationFrame(updateParticles);
    };

    frameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Keyboard navigation listeners (WASD, Arrows, Space, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrows and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') {
        if (gameStatusRef.current === 'IDLE') startGame();
        requestDirection('UP');
      } else if (key === 'arrowdown' || key === 's') {
        if (gameStatusRef.current === 'IDLE') startGame();
        requestDirection('DOWN');
      } else if (key === 'arrowleft' || key === 'a') {
        if (gameStatusRef.current === 'IDLE') startGame();
        requestDirection('LEFT');
      } else if (key === 'arrowright' || key === 'd') {
        if (gameStatusRef.current === 'IDLE') startGame();
        requestDirection('RIGHT');
      } else if (e.key === ' ' || key === 'spacebar') {
        togglePlay();
      } else if (key === 'r') {
        restartGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestDirection, startGame, togglePlay, restartGame]);

  // Handle Mute toggle
  const handleToggleMute = useCallback(() => {
    const nextMuted = soundFx.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Handle Theme change
  const handleThemeChange = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    localStorage.setItem('neon_snake_theme', newThemeId);
  };

  // Click on arena behavior (start/pause if playing)
  const handleArenaClick = () => {
    if (gameStatus === 'IDLE') {
      startGame();
    } else if (gameStatus === 'PAUSED') {
      startGame();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 font-sans">
      {/* Universal Top Bar following the Top Bar Contract (1 line brand, nav links, primary action) */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-8 pb-4 mb-3 border-b border-slate-800/80">
        {/* Brand wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
          <h1 className="text-xl font-bold tracking-tight text-white font-mono">
            Neon Snake Arena
          </h1>
        </div>

        {/* Concise links / navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
            Pure Canvas Arcade
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
            Offline Synthesizer
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
            Multi-Touch D-Pad
          </span>
        </nav>

        {/* Primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={restartGame}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-lg hover:border-slate-600 transition-colors whitespace-nowrap shrink-0"
          >
            New Run (R)
          </button>
        </div>
      </header>

      {/* Main Game Container */}
      <main className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* ScoreBoard HUD */}
        <ScoreBoard
          score={score}
          bestScore={bestScore}
          length={snake.length}
          speedMs={speedMs}
          gameStatus={gameStatus}
          theme={theme}
          isMuted={isMuted}
          onTogglePlay={togglePlay}
          onRestart={restartGame}
          onToggleMute={handleToggleMute}
        />

        {/* Canvas Arena Wrapper with Overlays */}
        <div className="relative w-full flex justify-center">
          <NeonCanvas
            snake={snake}
            direction={direction}
            foods={foods}
            theme={theme}
            particles={particles}
            gameStatus={gameStatus}
            onSwipeDirection={requestDirection}
            onClickArena={handleArenaClick}
          />

          {/* Start Screen Prompt Overlay */}
          {gameStatus === 'IDLE' && (
            <div
              onClick={startGame}
              className="absolute inset-0 bg-[#07090ecf] backdrop-blur-[3px] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all z-20"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 animate-pulse">
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                Enter the Arena
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mb-5">
                Guide your neon serpent, devour energy pulses, and test your reaction limits.
              </p>
              <button
                type="button"
                className="py-2.5 px-6 rounded-xl font-bold text-xs tracking-wider uppercase text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/25"
              >
                Press Space or Tap to Play
              </button>
            </div>
          )}

          {/* Pause Screen Overlay */}
          {gameStatus === 'PAUSED' && (
            <div
              onClick={startGame}
              className="absolute inset-0 bg-[#07090eb3] backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all z-20"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                Arena Suspended
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                PAUSED
              </h2>
              <button
                type="button"
                className="py-2 px-5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md"
              >
                Resume Game (Space)
              </button>
            </div>
          )}

          {/* Game Over Modal */}
          {gameStatus === 'GAME_OVER' && (
            <GameOverModal
              score={score}
              bestScore={bestScore}
              length={snake.length}
              deathReason={deathReason}
              theme={theme}
              isNewRecord={isNewRecord}
              onRestart={restartGame}
            />
          )}
        </div>

        {/* Responsive Mobile On-Screen D-Pad & Theme Switcher */}
        <ControlsOverlay
          currentDirection={direction}
          theme={theme}
          onDirectionChange={requestDirection}
          onThemeChange={handleThemeChange}
        />

        {/* How to Play Section */}
        <HowToPlay />
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-xl mx-auto text-center py-4 text-xs text-slate-600 font-mono">
        Neon Snake Arena · 60 FPS Responsive Canvas Engine
      </footer>
    </div>
  );
}
