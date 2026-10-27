import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Keyboard, Smartphone, Sparkles, Zap, ShieldAlert } from 'lucide-react';

export const HowToPlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="w-full max-w-[540px] mx-auto mt-6 mb-8 text-slate-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">How to Play</span>
          <span className="text-xs text-slate-500 font-mono">· Rules &amp; Controls</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-slate-900/80 border border-slate-800/80 rounded-xl text-xs space-y-3.5 backdrop-blur-md">
          {/* Rules breakdown */}
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Grow &amp; Accelerate:</span>{' '}
                Eat regular neon orbs to grow the snake by 1 segment and score <strong className="text-emerald-400">+10 points</strong>. Snake velocity gradually increases as you grow!
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Golden Bonus Pulses:</span>{' '}
                Rare golden pulses appear with a cooldown gauge. Grab them before they vanish for <strong className="text-amber-400">+30 bonus points</strong>!
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Avoid Collisions:</span>{' '}
                Crashing into the boundary perimeter or your own glowing tail will immediately end the run.
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-800/80" />

          {/* Controls list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                <li><span className="text-slate-200">Arrows / W A S D</span> : Navigate</li>
                <li><span className="text-slate-200">Spacebar</span> : Start / Pause</li>
                <li><span className="text-slate-200">R</span> : Restart arena</li>
              </ul>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1.5">
                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                <span>Mobile &amp; Touch</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>Tap the tactile on-screen D-Pad buttons</li>
                <li>Or swipe directly across the arena canvas</li>
                <li>Tap canvas to start or pause</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
