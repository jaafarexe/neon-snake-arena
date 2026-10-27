import React from 'react';
import { Direction, GameTheme, ThemeId } from '../types.ts';
import { THEMES } from '../utils/constants.ts';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Palette } from 'lucide-react';

interface ControlsOverlayProps {
  currentDirection: Direction;
  theme: GameTheme;
  onDirectionChange: (dir: Direction) => void;
  onThemeChange: (themeId: ThemeId) => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  currentDirection,
  theme,
  onDirectionChange,
  onThemeChange,
}) => {
  const handleButton = (dir: Direction, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onDirectionChange(dir);
  };

  const dpadButtonClass = (dir: Direction) => {
    const isCurrent = currentDirection === dir;
    return `w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 touch-manipulation select-none ${
      isCurrent
        ? `${theme.accentBg} ${theme.accentText} border-2 ${theme.accentBorder} shadow-lg shadow-black/50`
        : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 border border-slate-700/60 shadow-md'
    }`;
  };

  return (
    <div className="w-full max-w-[540px] mx-auto mt-4 flex flex-col items-center">
      {/* Mobile & Touch On-Screen D-Pad */}
      <div className="flex flex-col items-center justify-center select-none py-1">
        {/* Up */}
        <button
          type="button"
          onClick={(e) => handleButton('UP', e)}
          onTouchStart={(e) => handleButton('UP', e)}
          className={dpadButtonClass('UP')}
          aria-label="Move Up"
        >
          <ArrowUp className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Left, Center Blank / Touch indicator, Right */}
        <div className="flex items-center gap-3 my-2">
          <button
            type="button"
            onClick={(e) => handleButton('LEFT', e)}
            onTouchStart={(e) => handleButton('LEFT', e)}
            className={dpadButtonClass('LEFT')}
            aria-label="Move Left"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] uppercase font-mono text-slate-500">
            D-PAD
          </div>

          <button
            type="button"
            onClick={(e) => handleButton('RIGHT', e)}
            onTouchStart={(e) => handleButton('RIGHT', e)}
            className={dpadButtonClass('RIGHT')}
            aria-label="Move Right"
          >
            <ArrowRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Down */}
        <button
          type="button"
          onClick={(e) => handleButton('DOWN', e)}
          onTouchStart={(e) => handleButton('DOWN', e)}
          className={dpadButtonClass('DOWN')}
          aria-label="Move Down"
        >
          <ArrowDown className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Theme selection bar */}
      <div className="w-full mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Palette className="w-3.5 h-3.5" />
          <span>Neon Theme:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const t = THEMES[id];
            const isSelected = theme.id === id;
            return (
              <button
                key={id}
                onClick={() => onThemeChange(id)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  isSelected
                    ? `${t.accentBg} ${t.accentText} font-semibold ring-1 ring-inset ${t.accentBorder}`
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
                }`}
              >
                {t.name.split(' ')[1] || t.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
