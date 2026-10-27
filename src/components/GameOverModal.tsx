import React from 'react';
import { GameTheme } from '../types.ts';
import { RotateCcw, Trophy, Award, Ruler } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  length: number;
  deathReason: string;
  theme: GameTheme;
  isNewRecord: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  length,
  deathReason,
  theme,
  isNewRecord,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 bg-[#07090ecf] backdrop-blur-md z-30 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl shadow-black text-center flex flex-col items-center">
        {/* Title */}
        <div className="mb-2">
          <span className="text-xs uppercase tracking-widest font-mono text-red-400 font-bold">
            Arena Collision
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Game Over
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto">
            {deathReason}
          </p>
        </div>

        {/* Score Card */}
        <div className="w-full my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
          {/* Main Score */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Final Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold font-mono tabular-nums ${theme.accentText}`}>
                {score}
              </span>
              {isNewRecord && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  NEW RECORD!
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-800/80 w-full" />

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-left pt-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Best Score</div>
                <div className="text-sm font-bold font-mono text-slate-200 tabular-nums">
                  {bestScore}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Max Length</div>
                <div className="text-sm font-bold font-mono text-slate-200 tabular-nums">
                  {length} segments
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRestart}
          autoFocus
          className="w-full py-3 px-5 rounded-xl text-sm font-bold tracking-wide text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all transform active:scale-98 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Arena</span>
        </button>

        <span className="text-[11px] text-slate-500 mt-3 font-mono">
          Press &apos;R&apos; or Space to restart
        </span>
      </div>
    </div>
  );
};
