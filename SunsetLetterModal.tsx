import React, { useEffect, useState } from 'react';
import { FINAL_LETTER_LINE_1, FINAL_LETTER_LINE_2 } from '../game/constants';

interface SunsetLetterModalProps {
  onReplay: () => void;
  onMainMenu: () => void;
}

export const SunsetLetterModal: React.FC<SunsetLetterModalProps> = ({ onReplay, onMainMenu }) => {
  const [showTheEnd, setShowTheEnd] = useState(false);

  useEffect(() => {
    // Reveal "THE END" and action buttons after the player reads the letter
    const timer = setTimeout(() => {
      setShowTheEnd(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/45 pointer-events-auto select-none backdrop-brightness-75 transition-all duration-1000">
      {/* Letter Card in Parchment Style */}
      <div className="relative w-full max-w-lg bg-[#2d1b11]/90 p-8 retro-border text-center shadow-[0_8px_32px_rgba(0,0,0,0.85)] border-4 border-[#b37e29]">
        {/* Soft Golden Corner Accents */}
        <div className="text-stone-100 py-4 font-mono">
          <p className="text-sm md:text-base leading-relaxed tracking-wide text-amber-100 font-bold">
            {FINAL_LETTER_LINE_1}
          </p>
          <p className="text-sm md:text-base leading-relaxed tracking-wide text-amber-200/90 mt-2 font-bold">
            {FINAL_LETTER_LINE_2}
          </p>
        </div>

        {/* After reading pause, show THE END + Buttons */}
        {showTheEnd && (
          <div className="mt-8 pt-6 border-t-2 border-[#8e623c] flex flex-col items-center space-y-4 animate-fade-in">
            <h3 className="text-xl md:text-2xl text-[#fbbf24] font-black tracking-widest">
              THE END
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center pt-2">
              <button
                data-start="true"
                onClick={onReplay}
                className="retro-border-gold bg-[#b45309] hover:bg-[#d97706] text-amber-100 font-bold py-2.5 px-6 text-xs tracking-wider cursor-pointer active:translate-y-0.5"
              >
                REPLAY
              </button>

              <button
                onClick={onMainMenu}
                className="retro-button text-stone-200 font-bold py-2.5 px-6 text-xs tracking-wider cursor-pointer active:translate-y-0.5"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
