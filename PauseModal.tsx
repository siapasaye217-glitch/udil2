import React, { useState } from 'react';
import { soundManager } from '../game/audio';
import { ControlsModal } from './ControlsModal';

interface PauseModalProps {
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartCheckpoint,
  onMainMenu
}) => {
  const [showControls, setShowControls] = useState(false);
  const [soundOn, setSoundOn] = useState(() => soundManager.getSoundEnabled());

  const handleToggleSound = () => {
    const next = soundManager.toggleMute();
    setSoundOn(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 pointer-events-auto">
      <div className="w-full max-w-sm bg-[#271810] text-[#fef08a] p-6 retro-border shadow-2xl flex flex-col items-center">
        <h2 className="text-xl md:text-2xl text-center text-[#fbbf24] mb-6 font-bold tracking-wider">
          GAME PAUSED
        </h2>

        <div className="w-full space-y-3">
          <button
            onClick={onResume}
            className="w-full retro-border-gold bg-[#b45309] hover:bg-[#d97706] text-amber-100 font-bold py-3 text-xs tracking-wider cursor-pointer active:translate-y-0.5"
          >
            RESUME
          </button>

          <button
            onClick={() => setShowControls(true)}
            className="w-full retro-button text-amber-200 font-bold py-2.5 text-xs tracking-wider cursor-pointer"
          >
            CONTROLS
          </button>

          <button
            onClick={handleToggleSound}
            className="w-full retro-button text-amber-200 font-bold py-2.5 text-xs tracking-wider cursor-pointer flex justify-center items-center space-x-2"
          >
            <span>SOUND:</span>
            <span className={soundOn ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {soundOn ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={onRestartCheckpoint}
            className="w-full retro-button text-amber-300 font-bold py-2.5 text-xs tracking-wider cursor-pointer"
          >
            RESTART FROM CHECKPOINT
          </button>

          <button
            onClick={onMainMenu}
            className="w-full retro-button text-stone-300 font-bold py-2.5 text-xs tracking-wider cursor-pointer"
          >
            MAIN MENU
          </button>
        </div>
      </div>

      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  );
};
