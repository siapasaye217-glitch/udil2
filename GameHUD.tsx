import React, { useState, useEffect } from 'react';
import { soundManager } from '../game/audio';

interface GameHUDProps {
  playerHp: number;
  maxHp: number;
  bossHp: number;
  bossName: string;
  showBossBar: boolean;
  interactPrompt: string | null;
  dialogueVisible: boolean;
  speaker: string;
  dialogueText: string;
  onAdvanceDialogue: () => void;
  onPause: () => void;
  onVirtualMove: (x: number, y: number) => void;
  onVirtualAction: (action: 'attack' | 'dodge' | 'interact') => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerHp,
  maxHp,
  bossHp,
  bossName,
  showBossBar,
  interactPrompt,
  dialogueVisible,
  speaker,
  dialogueText,
  onAdvanceDialogue,
  onPause,
  onVirtualMove,
  onVirtualAction
}) => {
  const [soundOn, setSoundOn] = useState(() => soundManager.getSoundEnabled());
  // Touch pad visible by default, with easy toggle
  const [showTouchPad, setShowTouchPad] = useState<boolean>(true);

  useEffect(() => {
    const handleResize = () => {
      // Auto-enable for touch or screens <= 1024px unless user toggled
      const isMobile = window.innerWidth <= 1024 || window.matchMedia('(pointer: coarse)').matches;
      if (isMobile) {
        setShowTouchPad(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSound = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    const next = soundManager.toggleMute();
    setSoundOn(next);
  };

  const handleToggleTouchPad = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setShowTouchPad(prev => !prev);
  };

  // Render health hearts/pips
  const hearts = [];
  for (let i = 0; i < maxHp; i++) {
    const isFull = i < playerHp;
    hearts.push(
      <span
        key={i}
        className={`inline-block text-base md:text-lg transition-transform ${isFull ? 'text-rose-500 scale-100' : 'text-stone-700 scale-90'}`}
      >
        {isFull ? '❤️' : '🖤'}
      </span>
    );
  }

  // Directional handlers for virtual D-pad
  const handleDirPress = (x: number, y: number) => {
    onVirtualMove(x, y);
  };

  const handleDirRelease = () => {
    onVirtualMove(0, 0);
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none select-none flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* Top HUD Cluster */}
      <div className="flex justify-between items-start w-full">
        {/* Ain Health Pips */}
        <div className="bg-[#241710]/95 p-2 md:p-3 retro-border flex flex-col gap-1 pointer-events-auto shadow-xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] md:text-xs text-amber-300 font-bold tracking-wider">AIN</span>
            <span className="text-[10px] text-stone-400 font-mono tabular-nums">{playerHp}/{maxHp} HP</span>
          </div>
          <div className="flex space-x-1">{hearts}</div>
        </div>

        {/* Boss Health Bar (Top Center) */}
        {showBossBar && (
          <div className="flex-1 max-w-md mx-2 md:mx-4 bg-[#1f1224]/95 p-2 md:p-3 border-2 border-[#a855f7] shadow-[0_4px_16px_rgba(168,85,247,0.4)] pointer-events-auto">
            <div className="flex justify-between items-center text-[10px] md:text-xs text-purple-300 font-bold mb-1">
              <span>{bossName}</span>
              <span className="tabular-nums font-mono">{Math.max(0, bossHp)}%</span>
            </div>
            {/* Health Bar Meter with trailing ghost fill */}
            <div className="w-full h-3 md:h-4 bg-purple-950/80 border border-purple-800 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-rose-500 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, bossHp))}%` }}
              />
            </div>
          </div>
        )}

        {/* Top-Right Utility Buttons */}
        <div className="flex items-center space-x-1.5 md:space-x-2 pointer-events-auto">
          {/* Toggle Touch Pad button */}
          <button
            onClick={handleToggleTouchPad}
            tabIndex={-1}
            className={`retro-button px-2 md:px-2.5 py-1.5 text-[10px] md:text-xs font-bold cursor-pointer flex items-center space-x-1 ${showTouchPad ? 'text-amber-300' : 'text-stone-400'}`}
            title="Toggle Touch Pad (D-pad & Buttons)"
          >
            <span>🎮</span>
            <span className="hidden sm:inline">{showTouchPad ? 'PAD: ON' : 'PAD: OFF'}</span>
          </button>
          <button
            onClick={handleToggleSound}
            tabIndex={-1}
            className="retro-button px-2 md:px-2.5 py-1.5 text-xs text-amber-200 font-bold cursor-pointer flex items-center space-x-1"
            title="Toggle Sound (M)"
          >
            <span>{soundOn ? '🔊' : '🔇'}</span>
          </button>
          <button
            onClick={onPause}
            tabIndex={-1}
            className="retro-button px-2 md:px-2.5 py-1.5 text-xs text-amber-200 font-bold cursor-pointer"
            title="Pause Game (Esc)"
          >
            ⏸️
          </button>
        </div>
      </div>

      {/* Center Interactive Prompt */}
      {interactPrompt && !dialogueVisible && (
        <div className="self-center mb-4 pointer-events-auto">
          <div className="bg-[#241710]/95 px-4 py-2 retro-border text-amber-200 text-xs md:text-sm font-bold tracking-wider animate-bounce shadow-2xl">
            {interactPrompt}
          </div>
        </div>
      )}

      {/* Bottom Area: Dialogue Box & Large Touch Gamepad */}
      <div className="w-full flex flex-col items-center">
        {/* Dialogue Box */}
        {dialogueVisible && (
          <div
            onClick={onAdvanceDialogue}
            className="w-full max-w-2xl bg-[#1c120c]/95 p-3.5 md:p-5 retro-border mb-2.5 cursor-pointer pointer-events-auto shadow-2xl transition-all"
          >
            {/* Speaker Name Banner */}
            <div className="flex justify-between items-center mb-1.5 border-b-2 border-[#8e623c] pb-1">
              <span className="text-sm md:text-base font-bold text-[#fbbf24] tracking-wider uppercase">
                {speaker}
              </span>
              <span className="text-[10px] text-amber-300/70 font-mono tracking-wide">
                [SPACE / TAP TO CONTINUE]
              </span>
            </div>

            {/* Dialogue Text */}
            <p className="dialogue-font text-base md:text-xl text-stone-100 leading-snug tracking-wide min-h-[2.8rem]">
              "{dialogueText}"
            </p>

            {/* Pulsating Next Indicator */}
            <div className="text-right mt-1">
              <span className="inline-block text-amber-400 animate-pulse text-xs">▼</span>
            </div>
          </div>
        )}

        {/* Large, Ergonomic Virtual Touchpad & Action Cluster */}
        {showTouchPad && (
          <div className="w-full flex justify-between items-end pb-1 md:pb-2 px-1 md:px-4 pointer-events-auto touch-none select-none">
            {/* Large Virtual D-Pad (Upgraded: 150px on phone, 200px on tablet/desktop) */}
            <div
              className="relative w-38 h-38 sm:w-48 sm:h-48 md:w-52 md:h-52 bg-[#1b120c]/95 rounded-2xl border-4 border-[#8e623c] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.85)] flex items-center justify-center shrink-0"
              style={{ touchAction: 'none' }}
            >
              {/* Center decorative compass hub */}
              <div className="absolute w-10 h-10 sm:w-14 sm:h-14 bg-[#311f14] rounded-full border-2 border-[#b37e29] flex items-center justify-center text-amber-400/80 text-xs font-mono shadow-inner">
                ✦
              </div>

              {/* UP Button */}
              <button
                onTouchStart={() => handleDirPress(0, -1)}
                onTouchEnd={handleDirRelease}
                onTouchCancel={handleDirRelease}
                onMouseDown={() => handleDirPress(0, -1)}
                onMouseUp={handleDirRelease}
                onMouseLeave={handleDirRelease}
                className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-[#3b281c] active:bg-[#eab308] text-amber-200 active:text-black font-black text-xl sm:text-3xl rounded-t-xl border-2 border-[#b37e29] flex items-center justify-center cursor-pointer shadow-md active:translate-y-0.5 transition-all"
                aria-label="Move Up"
              >
                ▲
              </button>

              {/* DOWN Button */}
              <button
                onTouchStart={() => handleDirPress(0, 1)}
                onTouchEnd={handleDirRelease}
                onTouchCancel={handleDirRelease}
                onMouseDown={() => handleDirPress(0, 1)}
                onMouseUp={handleDirRelease}
                onMouseLeave={handleDirRelease}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-[#3b281c] active:bg-[#eab308] text-amber-200 active:text-black font-black text-xl sm:text-3xl rounded-b-xl border-2 border-[#b37e29] flex items-center justify-center cursor-pointer shadow-md active:translate-y-0.5 transition-all"
                aria-label="Move Down"
              >
                ▼
              </button>

              {/* LEFT Button */}
              <button
                onTouchStart={() => handleDirPress(-1, 0)}
                onTouchEnd={handleDirRelease}
                onTouchCancel={handleDirRelease}
                onMouseDown={() => handleDirPress(-1, 0)}
                onMouseUp={handleDirRelease}
                onMouseLeave={handleDirRelease}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-[#3b281c] active:bg-[#eab308] text-amber-200 active:text-black font-black text-xl sm:text-3xl rounded-l-xl border-2 border-[#b37e29] flex items-center justify-center cursor-pointer shadow-md active:translate-y-0.5 transition-all"
                aria-label="Move Left"
              >
                ◀
              </button>

              {/* RIGHT Button */}
              <button
                onTouchStart={() => handleDirPress(1, 0)}
                onTouchEnd={handleDirRelease}
                onTouchCancel={handleDirRelease}
                onMouseDown={() => handleDirPress(1, 0)}
                onMouseUp={handleDirRelease}
                onMouseLeave={handleDirRelease}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-[#3b281c] active:bg-[#eab308] text-amber-200 active:text-black font-black text-xl sm:text-3xl rounded-r-xl border-2 border-[#b37e29] flex items-center justify-center cursor-pointer shadow-md active:translate-y-0.5 transition-all"
                aria-label="Move Right"
              >
                ▶
              </button>
            </div>

            {/* Action Buttons Cluster (Generous Hit Targets: DODGE, TALK, ATTACK) */}
            <div className="flex items-center space-x-2 sm:space-x-3.5 mb-1 shrink-0">
              {/* DODGE Button */}
              <button
                onTouchStart={() => onVirtualAction('dodge')}
                onMouseDown={() => onVirtualAction('dodge')}
                className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-blue-900/95 border-3 border-blue-400 active:bg-blue-600 text-blue-100 font-bold flex flex-col items-center justify-center shadow-[0_6px_16px_rgba(30,58,138,0.7)] active:scale-95 cursor-pointer transition-transform"
                aria-label="Dodge Roll"
              >
                <span className="text-lg sm:text-2xl">💨</span>
                <span className="text-[8px] sm:text-[10px] tracking-wider mt-0.5 font-bold">DODGE</span>
              </button>

              {/* TALK / INTERACT Button */}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onVirtualAction('interact');
                }}
                onContextMenu={(event) => event.preventDefault()}
                className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-emerald-900/95 border-3 border-emerald-400 active:bg-emerald-600 text-emerald-100 font-bold flex flex-col items-center justify-center shadow-[0_6px_16px_rgba(6,78,59,0.7)] active:scale-95 cursor-pointer transition-transform select-none [touch-action:manipulation]"
                aria-label="Talk or Interact"
              >
                <span className="text-lg sm:text-2xl">💬</span>
                <span className="text-[8px] sm:text-[10px] tracking-wider mt-0.5 font-bold">TALK</span>
              </button>

              {/* Extra-Large ATTACK Button (Easy to mash in combat!) */}
              <button
                onTouchStart={() => onVirtualAction('attack')}
                onMouseDown={() => onVirtualAction('attack')}
                className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-rose-900/95 border-4 border-rose-400 active:bg-rose-600 text-rose-100 font-bold flex flex-col items-center justify-center shadow-[0_8px_24px_rgba(159,18,57,0.85)] active:scale-95 cursor-pointer transition-transform"
                aria-label="Attack"
              >
                <span className="text-2xl sm:text-3xl">⚔️</span>
                <span className="text-[9px] sm:text-xs tracking-wider mt-0.5 font-black">ATTACK</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
