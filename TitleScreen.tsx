import React, { useState } from 'react';
import { soundManager } from '../game/audio';
import { ControlsModal } from './ControlsModal';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [showControls, setShowControls] = useState(false);
  const [soundOn, setSoundOn] = useState(() => soundManager.getSoundEnabled());

  const handleToggleSound = () => {
    const next = soundManager.toggleMute();
    setSoundOn(next);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-6 pointer-events-auto select-none bg-gradient-to-b from-slate-950/40 via-transparent to-black/85">
      {/* Top Bar with Sound Toggle */}
      <div className="w-full max-w-4xl flex justify-between items-center pt-2">
        <div className="flex items-center space-x-2 text-xs text-amber-300/80 tracking-widest font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>AIN'S SPECIAL DAY</span>
        </div>

        <button
          onClick={handleToggleSound}
          className="retro-button px-3 py-1.5 text-xs text-amber-200 font-bold cursor-pointer flex items-center space-x-1.5"
          aria-label="Toggle Sound"
        >
          <span>SOUND:</span>
          <span className={soundOn ? 'text-emerald-400' : 'text-rose-400'}>
            {soundOn ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup with negative space */}
      <div className="flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Inline SVG Crest Title Lockup */}
        <div className="mb-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] max-w-lg w-full">
          <svg viewBox="0 0 460 140" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Decorative Crest Shield */}
            <path
              d="M40 30 C120 15, 340 15, 420 30 C410 85, 330 125, 230 135 C130 125, 50 85, 40 30 Z"
              fill="#2b1a10"
              stroke="#b37e29"
              strokeWidth="4"
            />
            <path
              d="M55 38 C130 25, 330 25, 405 38 C395 80, 320 115, 230 124 C140 115, 65 80, 55 38 Z"
              fill="#180e09"
              stroke="#78350f"
              strokeWidth="2"
            />

            {/* Birthday Cake Emblem at Top */}
            <g transform="translate(215, 12)">
              <rect x="0" y="8" width="30" height="12" fill="#fb7185" rx="2" />
              <rect x="3" y="12" width="24" height="4" fill="#fef08a" />
              <rect x="13" y="2" width="4" height="6" fill="#38bdf8" />
              <circle cx="15" cy="1" r="3" fill="#f59e0b" />
            </g>

            {/* Title Text */}
            <text
              x="230"
              y="68"
              textAnchor="middle"
              className="pixel-font font-black tracking-wider"
              fontSize="24"
              fill="#fed7aa"
              stroke="#451a03"
              strokeWidth="3"
              paintOrder="stroke fill"
            >
              AIN'S
            </text>
            <text
              x="230"
              y="100"
              textAnchor="middle"
              className="pixel-font font-black tracking-widest"
              fontSize="19"
              fill="#fbbf24"
              stroke="#451a03"
              strokeWidth="3"
              paintOrder="stroke fill"
            >
              BIRTHDAY ADVENTURE
            </text>
          </svg>
        </div>

        {/* Subtitle Lore Clue */}
        <p className="text-amber-100/90 text-xs md:text-sm tracking-wide mb-8 max-w-md text-center font-bold">
          A wholesome fantasy RPG of friendship, chaos, and heroic celebrations!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xs">
          <button
            data-start="true"
            onClick={onStart}
            className="w-full retro-border-gold bg-[#b45309] hover:bg-[#d97706] text-amber-100 font-bold py-3.5 px-6 text-sm tracking-wider cursor-pointer shadow-lg active:translate-y-0.5 transition-all"
          >
            START ADVENTURE
          </button>

          <button
            onClick={() => setShowControls(true)}
            className="w-full retro-button text-amber-200 font-bold py-3 px-6 text-xs tracking-wider cursor-pointer active:translate-y-0.5"
          >
            CONTROLS
          </button>
        </div>
      </div>

      {/* Clean Control Hint Line in Safe Margin */}
      <div className="w-full text-center pb-2">
        <p className="text-[10px] md:text-xs text-amber-300/75 tracking-wider font-mono">
          WASD Move · Space Action · Shift Dodge · E Interact · Esc Pause
        </p>
      </div>

      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  );
};
