import React, { useRef, useEffect } from 'react';
import { Direction, FoodItem, GameStatus, GameTheme, Particle, Point } from '../types.ts';
import { GRID_SIZE } from '../utils/constants.ts';

interface NeonCanvasProps {
  snake: Point[];
  direction: Direction;
  foods: FoodItem[];
  theme: GameTheme;
  particles: Particle[];
  gameStatus: GameStatus;
  onSwipeDirection: (dir: Direction) => void;
  onClickArena: () => void;
}

export const NeonCanvas: React.FC<NeonCanvasProps> = ({
  snake,
  direction,
  foods,
  theme,
  particles,
  gameStatus,
  onSwipeDirection,
  onClickArena,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Render loop using requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background clear
      ctx.fillStyle = '#0b0e14';
      ctx.fillRect(0, 0, width, height);

      const cellSize = width / GRID_SIZE;
      const time = performance.now() / 1000;

      // Draw cyber grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = theme.gridLine;

      for (let i = 0; i <= GRID_SIZE; i++) {
        const pos = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(width, pos);
        ctx.stroke();
      }

      // Draw subtle arena border glow
      ctx.save();
      ctx.strokeStyle = theme.arenaBorder;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      ctx.restore();

      // Draw Food items
      for (const food of foods) {
        const fx = food.x * cellSize + cellSize / 2;
        const fy = food.y * cellSize + cellSize / 2;
        const pulse = Math.sin(time * 6) * 0.15 + 0.85;
        const baseRadius = (cellSize / 2) * 0.72;

        if (food.type === 'golden') {
          // Golden bonus food: glowing pulsar with rotating corona
          const remainingPct = food.durationMs && food.spawnTime
            ? Math.max(0, 1 - (performance.now() - food.spawnTime) / food.durationMs)
            : 1;

          ctx.save();
          ctx.shadowColor = theme.goldenFoodGlow;
          ctx.shadowBlur = 18;

          // Outer timer indicator ring
          ctx.beginPath();
          ctx.arc(fx, fy, cellSize * 0.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remainingPct);
          ctx.strokeStyle = theme.goldenFood;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Outer halo
          ctx.beginPath();
          ctx.arc(fx, fy, baseRadius * 1.35 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(fx, fy, baseRadius * pulse, 0, Math.PI * 2);
          ctx.fillStyle = theme.goldenFood;
          ctx.fill();

          // Center bright spark
          ctx.beginPath();
          ctx.arc(fx, fy, baseRadius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.restore();
        } else {
          // Regular food: glowing energetic pulse
          ctx.save();
          ctx.shadowColor = theme.foodGlow;
          ctx.shadowBlur = 16;

          // Ambient outer ring
          ctx.beginPath();
          ctx.arc(fx, fy, baseRadius * 1.4 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
          ctx.fill();

          // Food core
          ctx.beginPath();
          ctx.arc(fx, fy, baseRadius * pulse, 0, Math.PI * 2);
          ctx.fillStyle = theme.food;
          ctx.fill();

          // Specular highlight
          ctx.beginPath();
          ctx.arc(fx - baseRadius * 0.25, fy - baseRadius * 0.25, baseRadius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();

          ctx.restore();
        }
      }

      // Draw Snake Body (tail to head for correct layering)
      if (snake.length > 0) {
        ctx.save();
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 14;

        for (let i = snake.length - 1; i >= 0; i--) {
          const seg = snake[i];
          const segX = seg.x * cellSize + cellSize / 2;
          const segY = seg.y * cellSize + cellSize / 2;
          const isHead = i === 0;
          const progress = i / Math.max(1, snake.length - 1); // 0 at head, 1 at tail

          const size = isHead ? cellSize * 0.88 : (cellSize * 0.82) * (1 - progress * 0.22);
          const radius = isHead ? size * 0.38 : size * 0.32;

          // Interpolated color or distinct segments
          ctx.fillStyle = isHead ? theme.head : theme.body;

          // Rounded segment
          ctx.beginPath();
          ctx.roundRect(segX - size / 2, segY - size / 2, size, size, radius);
          ctx.fill();

          // Core neon highlight
          ctx.beginPath();
          const coreSize = size * 0.55;
          ctx.roundRect(segX - coreSize / 2, segY - coreSize / 2, coreSize, coreSize, radius * 0.6);
          ctx.fillStyle = isHead ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
          ctx.fill();

          // If Head, draw directional eyes
          if (isHead) {
            ctx.fillStyle = '#0f172a';
            const eyeOffset = size * 0.22;
            const eyeSize = size * 0.16;
            const eyePupil = eyeSize * 0.5;

            let eye1X = segX;
            let eye1Y = segY;
            let eye2X = segX;
            let eye2Y = segY;

            if (direction === 'UP') {
              eye1X = segX - eyeOffset;
              eye1Y = segY - eyeOffset;
              eye2X = segX + eyeOffset;
              eye2Y = segY - eyeOffset;
            } else if (direction === 'DOWN') {
              eye1X = segX - eyeOffset;
              eye1Y = segY + eyeOffset;
              eye2X = segX + eyeOffset;
              eye2Y = segY + eyeOffset;
            } else if (direction === 'LEFT') {
              eye1X = segX - eyeOffset;
              eye1Y = segY - eyeOffset;
              eye2X = segX - eyeOffset;
              eye2Y = segY + eyeOffset;
            } else if (direction === 'RIGHT') {
              eye1X = segX + eyeOffset;
              eye1Y = segY - eyeOffset;
              eye2X = segX + eyeOffset;
              eye2Y = segY + eyeOffset;
            }

            // Eye sockets
            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
            ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
            ctx.fillStyle = '#050810';
            ctx.fill();

            // Pupil glow
            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyePupil, 0, Math.PI * 2);
            ctx.arc(eye2X, eye2Y, eyePupil, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // Draw Particles
      if (particles.length > 0) {
        ctx.save();
        for (const p of particles) {
          if (p.alpha <= 0) continue;
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [snake, direction, foods, theme, particles, gameStatus]);

  // Touch Swipe Handlers for mobile direct screen control
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const minSwipeDistance = 24;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) >= minSwipeDistance) {
        onSwipeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      }
    } else {
      if (Math.abs(dy) >= minSwipeDistance) {
        onSwipeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div
      onClick={onClickArena}
      className="relative w-full max-w-[540px] aspect-square mx-auto cursor-pointer select-none rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800/80 bg-[#0a0c12]"
    >
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full block touch-none"
      />
    </div>
  );
};
