import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine';
import { GameState } from './game/types';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { SunsetLetterModal } from './components/SunsetLetterModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>(GameState.TITLE_SCREEN);
  const [hudState, setHudState] = useState({
    playerHp: 6,
    maxHp: 6,
    bossHp: 100,
    bossName: 'SHADOW TITAN',
    showBossBar: false,
    interactPrompt: null as string | null
  });

  const [dialogueState, setDialogueState] = useState({
    visible: false,
    speaker: '',
    text: ''
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI or standard canvas resolution
    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Set engine camera zoom based on screen size for ideal retro pixel density
      if (engineRef.current) {
        const isMobile = rect.width < 768;
        engineRef.current.cameraZoom = isMobile ? 1.4 * dpr : 1.8 * dpr;
      }
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Initialize Game Engine
    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    (window as unknown as { __gameEngine?: GameEngine }).__gameEngine = engine;

    // Subscribe to engine events
    engine.onStateChange = (state) => {
      setGameState(state);
    };

    engine.onHudUpdate = (playerHp, bossHp, bossName, showBossBar, interactPrompt) => {
      setHudState({
        playerHp,
        maxHp: 6,
        bossHp,
        bossName,
        showBossBar,
        interactPrompt
      });
    };

    engine.onDialogueUpdate = (visible, speaker, text) => {
      setDialogueState({ visible, speaker, text });
    };

    engine.start();

    // Check ?autostart=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      engine.setState(GameState.OPENING_CINEMATIC);
    }

    // Global Key Listener for Title Screen Start (Enter/Space)
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (engine.state === GameState.TITLE_SCREEN && (e.code === 'Enter' || e.code === 'Space')) {
        engine.setState(GameState.OPENING_CINEMATIC);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);

    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      resizeObserver.disconnect();
      engine.stop();
    };
  }, []);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.setState(GameState.OPENING_CINEMATIC);
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleRestartCheckpoint = () => {
    if (engineRef.current) {
      engineRef.current.restartFromCheckpoint();
    }
  };

  const handleMainMenu = () => {
    if (engineRef.current) {
      engineRef.current.resetToMainMenu();
    }
  };

  const handleAdvanceDialogue = () => {
    if (engineRef.current) {
      engineRef.current.advanceDialogue();
    }
  };

  const handleVirtualMove = (x: number, y: number) => {
    if (engineRef.current) {
      engineRef.current.virtualJoystick = { x, y };
    }
  };

  const handleVirtualAction = (action: 'attack' | 'dodge' | 'interact') => {
    if (engineRef.current) {
      engineRef.current.virtualButtons[action] = true;
    }
  };

  return (
    <div onContextMenu={(event) => event.preventDefault()} className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* Isolated Canvas Container */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          data-testid="game-canvas"
          className="w-full h-full block bg-[#1c2e22]"
        />
      </div>

      {/* Title Screen Overlay */}
      {gameState === GameState.TITLE_SCREEN && (
        <TitleScreen onStart={handleStartGame} />
      )}

      {/* In-Game HUD & Dialogue Overlay */}
      {gameState !== GameState.TITLE_SCREEN && gameState !== GameState.SUNSET_ENDING && (
        <GameHUD
          playerHp={hudState.playerHp}
          maxHp={hudState.maxHp}
          bossHp={hudState.bossHp}
          bossName={hudState.bossName}
          showBossBar={hudState.showBossBar}
          interactPrompt={hudState.interactPrompt}
          dialogueVisible={dialogueState.visible}
          speaker={dialogueState.speaker}
          dialogueText={dialogueState.text}
          onAdvanceDialogue={handleAdvanceDialogue}
          onPause={handlePause}
          onVirtualMove={handleVirtualMove}
          onVirtualAction={handleVirtualAction}
        />
      )}

      {/* Pause Modal */}
      {gameState === GameState.PAUSED && (
        <PauseModal
          onResume={handleResume}
          onRestartCheckpoint={handleRestartCheckpoint}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Game Over Modal */}
      {gameState === GameState.GAME_OVER && (
        <GameOverModal
          onRetry={handleRestartCheckpoint}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Sunset Ending Letter Overlay */}
      {gameState === GameState.SUNSET_ENDING && (
        <SunsetLetterModal
          onReplay={handleRestartCheckpoint}
          onMainMenu={handleMainMenu}
        />
      )}
    </div>
  );
}
