import React from 'react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
      <div className="relative w-full max-w-lg bg-[#271810] text-[#fef08a] p-6 retro-border rounded-none shadow-2xl">
        <h2 className="text-xl md:text-2xl text-center text-[#fbbf24] mb-6 tracking-wider font-bold">
          GAME CONTROLS
        </h2>

        <div className="space-y-4 text-xs md:text-sm">
          <div className="bg-[#1c110b] p-3 border-2 border-[#8e623c]">
            <h3 className="text-[#38bdf8] font-bold mb-2">DESKTOP (KEYBOARD)</h3>
            <ul className="space-y-1.5 text-stone-200">
              <li><span className="text-[#fbbf24] font-bold">WASD / Arrow Keys</span> — Move in 4 directions</li>
              <li><span className="text-[#fbbf24] font-bold">Space / J</span> — Attack sword swing</li>
              <li><span className="text-[#fbbf24] font-bold">Shift</span> — Dodge roll / dash (invincible)</li>
              <li><span className="text-[#fbbf24] font-bold">E / Enter</span> — Interact / Advance dialogue</li>
              <li><span className="text-[#fbbf24] font-bold">Esc / P</span> — Pause menu</li>
              <li><span className="text-[#fbbf24] font-bold">M</span> — Sound ON / OFF toggle</li>
            </ul>
          </div>

          <div className="bg-[#1c110b] p-3 border-2 border-[#8e623c]">
            <h3 className="text-[#a855f7] font-bold mb-2">MOBILE (TOUCH)</h3>
            <ul className="space-y-1.5 text-stone-200">
              <li><span className="text-[#fbbf24] font-bold">Virtual D-Pad</span> — Move hero smoothly</li>
              <li><span className="text-[#fbbf24] font-bold">⚔️ Attack Button</span> — Strike with weapon</li>
              <li><span className="text-[#fbbf24] font-bold">💨 Dodge Button</span> — Evade danger zones</li>
              <li><span className="text-[#fbbf24] font-bold">💬 Talk Button</span> — Converse and interact</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="retro-button px-6 py-2.5 text-sm font-bold text-amber-200 cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
