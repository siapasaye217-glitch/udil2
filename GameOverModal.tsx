import React from 'react';

interface GameOverModalProps {
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRetry, onMainMenu }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 pointer-events-auto">
      <div className="w-full max-w-sm bg-[#1e1014] text-rose-200 p-6 border-4 border-rose-900 shadow-[0_0_30px_rgba(225,29,72,0.4)] flex flex-col items-center">
        <h2 className="text-2xl text-center text-rose-500 mb-3 font-bold tracking-widest">
          DEFEAT
        </h2>
        <p className="text-xs text-rose-300/80 text-center mb-6 leading-relaxed">
          The Shadow Titan was too overwhelming! Don't give up on Aidil.
        </p>

        <div className="w-full space-y-3">
          <button
            data-start="true"
            onClick={onRetry}
            className="w-full retro-border-gold bg-[#b45309] hover:bg-[#d97706] text-amber-100 font-bold py-3 text-xs tracking-wider cursor-pointer active:translate-y-0.5"
          >
            TRY AGAIN
          </button>

          <button
            onClick={onMainMenu}
            className="w-full retro-button text-stone-300 font-bold py-2.5 text-xs tracking-wider cursor-pointer"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
