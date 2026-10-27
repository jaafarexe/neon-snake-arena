import React from 'react';
import { GameStatus, GameTheme } from '../types.ts';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  length: number;
  speedMs: number;
  gameStatus: GameStatus;
  theme: GameTheme;
  isMuted: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  bestScore,
  length,
  speedMs,
  gameStatus,
  theme,
  isMuted,
  onTogglePlay,
  onRestart,
  onToggleMute,
}) => {
  // Speed multiplier indicator (e.g. 1.0x to 2.4x)
  const speedMultiplier = (135 / speedMs).toFixed(1);

  return (
    <div className="w-full max-w-[540px] mx-auto mb-4">
      {/* Top row: Metrics with clean unboxed typographic presentation */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md">
        {/* Score */}
        <div className="flex flex-col items-center justify-center py-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Score
          </span>
          <span
            className={`text-2xl font-bold font-mono tabular-nums transition-colors duration-200 ${theme.accentText}`}
          >
            {score}
          </span>
        </div>

        {/* Best Score */}
        <div className="flex flex-col items-center justify-center py-1 border-x border-slate-800/60">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Best
          </span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-200">
            {bestScore}
          </span>
        </div>

        {/* Length & Speed */}
        <div className="flex flex-col items-center justify-center py-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Length
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-200">
              {length}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              ({speedMultiplier}x)
            </span>
          </div>
        </div>
      </div>

      {/* Control Action Strip */}
      <div className="flex items-center justify-between mt-2.5 px-1">
        {/* Left: Play/Pause button and Restart button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-sm ${
              gameStatus === 'PLAYING'
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
            title="Spacebar to toggle"
          >
            {gameStatus === 'PLAYING' ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{gameStatus === 'PAUSED' ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors flex items-center gap-1.5"
            title="Press 'R' to restart"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>

        {/* Right: Sound Mute Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg text-xs transition-colors border ${
              isMuted
                ? 'bg-slate-800/40 text-slate-500 border-slate-800 hover:text-slate-300'
                : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
