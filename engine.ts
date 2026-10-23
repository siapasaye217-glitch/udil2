/**
 * Core 60fps Game Engine: Simulation loop, physics, camera, particles, and state orchestrator
 */

import {
  GameState,
  Direction,
  DialogueLine,
  PlayerStats,
  BossStats,
  Particle,
  Projectile,
  GroundHazard
} from './types';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  OPENING_DESCENT_DIALOGUE,
  OPENING_LANDING_DIALOGUE,
  AIDIL_GIFT_DIALOGUE,
  TRANSFORMATION_DIALOGUE,
  CONFRONTATION_DIALOGUE,
  HAND_BITE_DIALOGUE,
  FINISHER_DIALOGUE,
  RESTORATION_DIALOGUE,
  CELEBRATION_DIALOGUE_PART1,
  CELEBRATION_DIALOGUE_AFTER_TOSSES,
  CAKE_DIALOGUE,
  FINAL_LETTER_LINE_1,
  FINAL_LETTER_LINE_2
} from './constants';
import { GameMap } from './map';
import { PixelRenderer } from './sprites';
import { soundManager } from './audio';
import {
  determineBossPhase,
  calculatePlayerDamage,
  calculateBossDamage,
  canTriggerHandBite,
  advanceToss,
  getTossQuote
} from './combatRules';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running: boolean = false;
  private animId: number | null = null;
  private lastTime: number = 0;

  public state: GameState = GameState.TITLE_SCREEN;
  public map: GameMap;

  // Camera
  public cameraX: number = 260;
  public cameraY: number = 740;
  public cameraZoom: number = 1.0;
  public shakeTrauma: number = 0;

  // Player
  public player: PlayerStats = {
    hp: 6,
    maxHp: 6,
    invincibleTimer: 0,
    dodgeCooldown: 0,
    attackCooldown: 0,
    isDodging: false,
    isAttacking: false,
    facing: 'down',
    x: 280,
    y: 780,
    vx: 0,
    vy: 0
  };

  // Aidil NPC position / state
  public aidil = {
    x: 660,
    y: 480,
    facing: 'down' as Direction,
    walkFrame: 0,
    hasGift: true,
    hasCake: false,
    isExhausted: false,
    isSitting: false,
    visible: true
  };

  // Boss
  public boss: BossStats = {
    hp: 100,
    maxHp: 100,
    phase: 1,
    x: 600,
    y: 380,
    vx: 0,
    vy: 0,
    facing: 'down',
    attackTimer: 2.0,
    currentAttack: 'idle',
    attackProgress: 0,
    telegraphTimer: 0,
    targetX: 600,
    targetY: 480,
    staggerTimer: 0,
    auraIntensity: 1.0,
    hasTriggeredBite: false
  };

  // Projectiles & Hazards
  public projectiles: Projectile[] = [];
  public hazards: GroundHazard[] = [];

  // Zero-GC Particle Pool
  private particlePool: Particle[] = [];
  private readonly MAX_PARTICLES = 300;

  // Input
  private keysHeld = new Set<string>();
  private justPressedKeys = new Set<string>();
  public virtualJoystick = { x: 0, y: 0 };
  public virtualButtons = { attack: false, dodge: false, interact: false };

  // Dialogue & Story Scripting
  public currentDialogue: DialogueLine[] = [];
  public dialogueIndex: number = 0;
  public activeSpeaker: string = '';
  public activeDialogueText: string = '';
  public showDialogueBox: boolean = false;
  private onDialogueCompleteCallback: (() => void) | null = null;

  // Cinematics & Sequences
  public cinematicTimer: number = 0;
  public cinematicStage: number = 0;
  public celebrationTossCount: number = 0;
  public tossHeight: number = 0;
  public skyDarkness: number = 0; // 0 to 1
  public sunsetGlow: number = 0; // 0 to 1
  public hitstopTimer: number = 0;
  public walkAnimTimer: number = 0;

  // Callbacks to React UI
  public onStateChange?: (state: GameState) => void;
  public onDialogueUpdate?: (show: boolean, speaker: string, text: string) => void;
  public onHudUpdate?: (playerHp: number, bossHp: number, bossName: string, showBossBar: boolean, interactPrompt: string | null) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D context not supported');
    this.ctx = context;
    this.map = new GameMap();
    this.initParticlePool();
    this.setupListeners();
  }

  private initParticlePool() {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.particlePool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        color: '#ffffff',
        size: 3,
        shape: 'square'
      });
    }
  }

  public spawnParticle(x: number, y: number, vx: number, vy: number, maxLife: number, color: string, size: number = 3, shape: 'square' | 'circle' | 'sparkle' | 'petal' | 'dust' = 'square') {
    // Find dead particle in pool
    for (const p of this.particlePool) {
      if (p.life <= 0) {
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.life = maxLife;
        p.maxLife = maxLife;
        p.color = color;
        p.size = size;
        p.shape = shape;
        break;
      }
    }
  }

  public burstParticles(x: number, y: number, count: number, colors: string[], speed: number = 80, shape: 'square' | 'circle' | 'sparkle' | 'petal' | 'dust' = 'sparkle') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.3 + Math.random() * 0.7) * speed;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.spawnParticle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, 0.4 + Math.random() * 0.5, color, 3 + Math.random() * 3, shape);
    }
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysHeld.add(e.code);
      this.justPressedKeys.add(e.code);

      // Advance dialogue on Space or Enter
      if (this.showDialogueBox && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) {
        this.advanceDialogue();
      }

      // Pause toggle on Escape or P
      if (e.code === 'Escape' || e.code === 'KeyP') {
        this.togglePause();
      }

      // Mute toggle on M
      if (e.code === 'KeyM') {
        soundManager.toggleMute();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keysHeld.clear();
      this.justPressedKeys.clear();
      this.virtualJoystick = { x: 0, y: 0 };
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.keysHeld.clear();
        this.justPressedKeys.clear();
      }
    });
  }

  public start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    soundManager.stopMusic();
  }

  public setState(newState: GameState) {
    this.state = newState;
    this.showDialogueBox = false;
    this.dialogueIndex = 0;
    this.cinematicTimer = 0;
    this.cinematicStage = 0;
    document.body.dataset.state = newState.toLowerCase();
    this.onStateChange?.(newState);

    // Audio cue matching each scene
    if (newState === GameState.TITLE_SCREEN) {
      soundManager.playMusic('title');
    } else if (newState === GameState.OPENING_CINEMATIC) {
      soundManager.playMusic('opening');
    } else if (newState === GameState.EXPLORATION) {
      soundManager.playMusic('village');
    } else if (newState === GameState.GIFT_SCENE) {
      soundManager.playMusic('gift');
    } else if (newState === GameState.TRANSFORMATION_CINEMATIC) {
      soundManager.playMusic('transformation');
    } else if (newState === GameState.VILLAGE_RAMPAGE) {
      soundManager.playMusic('rampage');
    } else if (newState === GameState.BOSS_PHASE_1 || newState === GameState.BOSS_PHASE_2 || newState === GameState.BOSS_PHASE_3) {
      soundManager.playMusic('boss');
    } else if (newState === GameState.VILLAGE_RESTORATION) {
      soundManager.playMusic('restoration');
    } else if (newState === GameState.VILLAGE_CELEBRATION) {
      soundManager.playMusic('celebration');
    } else if (newState === GameState.SUNSET_ENDING) {
      soundManager.playMusic('sunset');
    }
  }

  public togglePause() {
    if (this.state === GameState.PAUSED) {
      // Resume previous state
      const prev = (this as unknown as { _savedState?: GameState })._savedState || GameState.EXPLORATION;
      this.setState(prev);
    } else if (this.state !== GameState.TITLE_SCREEN && this.state !== GameState.GAME_OVER && this.state !== GameState.SUNSET_ENDING) {
      (this as unknown as { _savedState?: GameState })._savedState = this.state;
      this.setState(GameState.PAUSED);
    }
  }

  public startDialogue(lines: DialogueLine[], onComplete?: () => void) {
    this.currentDialogue = lines;
    this.dialogueIndex = 0;
    this.showDialogueBox = true;
    this.onDialogueCompleteCallback = onComplete || null;
    this.showCurrentDialogueLine();
  }

  public advanceDialogue() {
    if (!this.showDialogueBox) return;
    soundManager.playSelect();
    this.dialogueIndex++;
    if (this.dialogueIndex >= this.currentDialogue.length) {
      this.showDialogueBox = false;
      this.onDialogueUpdate?.(false, '', '');
      const cb = this.onDialogueCompleteCallback;
      this.onDialogueCompleteCallback = null;
      cb?.();
    } else {
      this.showCurrentDialogueLine();
    }
  }

  private showCurrentDialogueLine() {
    const line = this.currentDialogue[this.dialogueIndex];
    if (!line) return;
    this.activeSpeaker = line.speaker;
    this.activeDialogueText = line.text;
    this.onDialogueUpdate?.(true, line.speaker, line.text);
    line.onShow?.();
  }

  /**
   * Main game loop running at 60 FPS
   */
  private loop = (timestamp: number) => {
    if (!this.running) return;

    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05); // Clamped dt

    // Simulation updates
    if (this.state !== GameState.PAUSED) {
      this.update(dt);
    }

    // Render viewport
    this.render();

    // Clear edge-triggered keys after frame
    this.justPressedKeys.clear();

    this.animId = requestAnimationFrame(this.loop);
  };

  /**
   * Main simulation state machine update
   */
  private update(dt: number) {
    this.walkAnimTimer += dt;

    // Hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Camera shake decay
    if (this.shakeTrauma > 0) {
      this.shakeTrauma = Math.max(0, this.shakeTrauma - dt * 2.5);
    }

    // Update Particles
    for (const p of this.particlePool) {
      if (p.life > 0) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }

    // Dispatch state update
    switch (this.state) {
      case GameState.TITLE_SCREEN:
        this.updateTitleScreen(dt);
        break;
      case GameState.OPENING_CINEMATIC:
        this.updateOpeningCinematic(dt);
        break;
      case GameState.EXPLORATION:
        this.updateExploration(dt);
        break;
      case GameState.GIFT_SCENE:
        this.updateGiftScene(dt);
        break;
      case GameState.TRANSFORMATION_CINEMATIC:
        this.updateTransformation(dt);
        break;
      case GameState.VILLAGE_RAMPAGE:
        this.updateVillageRampage(dt);
        break;
      case GameState.BOSS_PHASE_1:
      case GameState.BOSS_PHASE_2:
      case GameState.BOSS_PHASE_3:
        this.updateBossBattle(dt);
        break;
      case GameState.HAND_BITE_CINEMATIC:
        this.updateHandBite(dt);
        break;
      case GameState.FINAL_FINISHER:
        this.updateFinalFinisher(dt);
        break;
      case GameState.AIDIL_RESTORED:
        this.updateAidilRestored(dt);
        break;
      case GameState.VILLAGE_RESTORATION:
        this.updateVillageRestoration(dt);
        break;
      case GameState.VILLAGE_CELEBRATION:
        this.updateVillageCelebration(dt);
        break;
      case GameState.CAKE_SCENE:
        this.updateCakeScene(dt);
        break;
      case GameState.SUNSET_ENDING:
        this.updateSunsetEnding(dt);
        break;
    }

    // Update Projectiles & Hazards
    this.updateProjectiles(dt);
    this.updateHazards(dt);

    // Sync HUD status
    const showBossBar = this.state.startsWith('BOSS_') || this.state === GameState.HAND_BITE_CINEMATIC;
    let prompt: string | null = null;
    if (this.state === GameState.EXPLORATION && !this.showDialogueBox) {
      // Find nearby interactive
      for (const obj of this.map.interactives) {
        const dist = Math.hypot(this.player.x - (obj.x + obj.width / 2), this.player.y - (obj.y + obj.height / 2));
        if (dist < 45) {
          prompt = `E: ${obj.prompt}`;
          break;
        }
      }
      if (!prompt) {
        for (const npc of this.map.npcs) {
          const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
          if (dist < 40) {
            prompt = `E: Talk to ${npc.name}`;
            break;
          }
        }
      }
      if (!prompt && Math.hypot(this.player.x - this.aidil.x, this.player.y - this.aidil.y) < 110) {
        prompt = 'E: Talk to Aidil';
      }
    }
    this.onHudUpdate?.(this.player.hp, this.boss.hp, 'SHADOW TITAN', showBossBar, prompt);
  }

  // --- State Updates ---

  private updateTitleScreen(dt: number) {
    // Ambient camera drift over central village square
    this.cameraX = 580 + Math.sin(this.walkAnimTimer * 0.3) * 30;
    this.cameraY = 500 + Math.cos(this.walkAnimTimer * 0.2) * 20;
    // Ambient floating petals
    if (Math.random() < 0.15) {
      this.spawnParticle(
        this.cameraX - 200 + Math.random() * 400,
        this.cameraY - 200,
        -15 + Math.random() * 30,
        25 + Math.random() * 20,
        3.0,
        '#fbcfe8',
        3,
        'petal'
      );
    }
  }

  private updateOpeningCinematic(dt: number) {
    this.cinematicTimer += dt;

    if (this.cinematicStage === 0) {
      // Ain falling from the sky with 3 Angels
      this.player.y += 180 * dt;
      this.cameraX = this.player.x;
      this.cameraY = this.player.y;

      // Cloud particles rushing upward
      if (Math.random() < 0.4) {
        this.spawnParticle(
          this.player.x - 150 + Math.random() * 300,
          this.player.y + 200,
          0,
          -220,
          1.2,
          '#ffffff',
          6 + Math.random() * 10,
          'dust'
        );
      }

      // Start sky dialogue sequence once
      if (this.cinematicTimer > 0.5 && !this.showDialogueBox && this.dialogueIndex === 0) {
        this.startDialogue(OPENING_DESCENT_DIALOGUE, () => {
          // Landing sequence triggers
          this.cinematicStage = 1;
          this.cinematicTimer = 0;
          this.player.y = 800; // Flower garden landing spot
          this.player.x = 280;
          this.cameraX = 280;
          this.cameraY = 800;
          this.shakeTrauma = 0.4;
          soundManager.playCrash();
          // Burst flowers & dust
          this.burstParticles(280, 800, 30, ['#fde047', '#f472b6', '#cbd5e1', '#ffffff'], 90, 'petal');

          // Trigger landing dialogue
          this.startDialogue(OPENING_LANDING_DIALOGUE, () => {
            // Angels fly away, start exploration!
            this.cinematicStage = 2;
            this.setState(GameState.EXPLORATION);
          });
        });
      }
    }
  }

  private updateExploration(dt: number) {
    // Player 4-direction movement
    let moveX = 0;
    let moveY = 0;

    if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft')) moveX -= 1;
    if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight')) moveX += 1;
    if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) moveY -= 1;
    if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) moveY += 1;

    // Add touch joystick input
    if (Math.abs(this.virtualJoystick.x) > 0.1) moveX += this.virtualJoystick.x;
    if (Math.abs(this.virtualJoystick.y) > 0.1) moveY += this.virtualJoystick.y;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;

      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.player.facing = moveX > 0 ? 'right' : 'left';
      } else {
        this.player.facing = moveY > 0 ? 'down' : 'up';
      }

      const speed = 140;
      const targetX = this.player.x + moveX * speed * dt;
      const targetY = this.player.y + moveY * speed * dt;

      // Check collision
      if (!this.map.checkCollision(targetX, this.player.y, 8)) {
        this.player.x = targetX;
      }
      if (!this.map.checkCollision(this.player.x, targetY, 8)) {
        this.player.y = targetY;
      }

      // Footstep sound
      if (Math.floor(this.walkAnimTimer * 5) % 2 === 0 && Math.random() < 0.12) {
        soundManager.playStep();
      }
    }

    // Camera smoothly follows player
    this.cameraX += (this.player.x - this.cameraX) * 0.1;
    this.cameraY += (this.player.y - this.cameraY) * 0.1;
    this.clampCamera();

    // Check interaction button
    if (
      this.justPressedKeys.has('KeyE') ||
      this.justPressedKeys.has('Enter') ||
      this.virtualButtons.interact
    ) {
      this.virtualButtons.interact = false;
      this.handlePlayerInteract();
    }

    // Story trigger: If Ain approaches Aidil near Central Square (within 130px), trigger GIFT_SCENE automatically
    const distToAidil = Math.hypot(this.player.x - this.aidil.x, this.player.y - this.aidil.y);
    if (distToAidil < 130 && !this.showDialogueBox) {
      this.setState(GameState.GIFT_SCENE);
    }
  }

  private handlePlayerInteract() {
    if (this.showDialogueBox) {
      this.advanceDialogue();
      return;
    }

    // Check nearby interactives
    for (const obj of this.map.interactives) {
      const dist = Math.hypot(this.player.x - (obj.x + obj.width / 2), this.player.y - (obj.y + obj.height / 2));
      if (dist < 50 && obj.dialogue) {
        this.startDialogue(obj.dialogue);
        return;
      }
    }

    // Check nearby villagers
    for (const npc of this.map.npcs) {
      const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
      if (dist < 45 && npc.dialogue) {
        this.startDialogue(npc.dialogue);
        return;
      }
    }

    // Check Aidil
    const distToAidil = Math.hypot(this.player.x - this.aidil.x, this.player.y - this.aidil.y);
    if (distToAidil < 130) {
      this.setState(GameState.GIFT_SCENE);
    }
  }

  private updateGiftScene(dt: number) {
    this.cinematicTimer += dt;
    this.cameraX += (580 - this.cameraX) * 0.08;
    this.cameraY += (480 - this.cameraY) * 0.08;

    if (this.cinematicTimer > 0.5 && !this.showDialogueBox && this.dialogueIndex === 0) {
      this.startDialogue(AIDIL_GIFT_DIALOGUE, () => {
        // Gift exchange animation & sparkles
        soundManager.playSparkle();
        this.burstParticles(this.aidil.x - 10, this.aidil.y - 10, 25, ['#fde047', '#ef4444', '#ffffff'], 70, 'sparkle');
        this.aidil.hasGift = false; // Ain now holds the present!

        // Short peaceful pause, then transition into TRANSFORMATION
        setTimeout(() => {
          this.setState(GameState.TRANSFORMATION_CINEMATIC);
          this.cinematicTimer = 0;
          this.cinematicStage = 0;
        }, 1200);
      });
    }
  }

  private updateTransformation(dt: number) {
    this.cinematicTimer += dt;

    // Sky gradually darkens
    this.skyDarkness = Math.min(1.0, this.skyDarkness + dt * 0.4);

    // Purple energy swirls around Aidil
    if (Math.random() < 0.6) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      this.spawnParticle(
        this.aidil.x + Math.cos(angle) * dist,
        this.aidil.y + Math.sin(angle) * dist,
        -Math.cos(angle) * 40,
        -Math.sin(angle) * 40,
        0.8,
        '#a855f7',
        4,
        'sparkle'
      );
    }

    if (this.cinematicStage === 0 && this.cinematicTimer > 0.8 && !this.showDialogueBox) {
      this.startDialogue(TRANSFORMATION_DIALOGUE, () => {
        this.cinematicStage = 1;
        this.cinematicTimer = 0;
        // Monster roar, massive ground rumble and camera pull back!
        soundManager.playRoar();
        this.shakeTrauma = 0.8;
        this.burstParticles(this.aidil.x, this.aidil.y, 45, ['#3b0764', '#a855f7', '#7e22ce', '#ffffff'], 130, 'sparkle');

        setTimeout(() => {
          // Aidil transforms into Shadow Titan!
          this.aidil.visible = false;
          this.boss.x = this.aidil.x;
          this.boss.y = this.aidil.y;
          this.boss.currentAttack = 'roar';

          // Ain: "You think?!"
          this.startDialogue([
            { speaker: 'Ain', text: 'You think?!', emotion: 'angry' }
          ], () => {
            // Rampage begins!
            this.setState(GameState.VILLAGE_RAMPAGE);
            this.cinematicStage = 0;
            this.cinematicTimer = 0;
          });
        }, 1500);
      });
    }
  }

  private updateVillageRampage(dt: number) {
    this.cinematicTimer += dt;

    // Shadow Titan stomps toward market and residential road
    this.boss.y += 35 * dt;
    this.boss.x += Math.sin(this.cinematicTimer * 2) * 40 * dt;

    // Camera tracks the Titan and fleeing villagers
    this.cameraX += (this.boss.x - this.cameraX) * 0.08;
    this.cameraY += (this.boss.y - this.cameraY) * 0.08;

    // Villagers scream and flee along cobblestone paths toward safe areas
    for (const npc of this.map.npcs) {
      const dx = npc.fleeTargetX - npc.x;
      const dy = npc.fleeTargetY - npc.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) {
        npc.x += (dx / dist) * npc.speed * 120 * dt;
        npc.y += (dy / dist) * npc.speed * 120 * dt;
        npc.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
    }

    // Environmental destruction: Titan breaks market stall and knocks over barrels
    for (const d of this.map.destructibles) {
      if (!d.destroyed && Math.hypot(this.boss.x - d.x, this.boss.y - d.y) < 65) {
        d.destroyed = true;
        this.shakeTrauma = 0.4;
        soundManager.playCrash();
        this.burstParticles(d.x + d.width / 2, d.y + d.height / 2, 20, ['#78350f', '#ef4444', '#cbd5e1'], 80, 'dust');
      }
    }

    // After rampaging through market (approx 3.5s), Ain steps forward to confront the Titan
    if (this.cinematicTimer > 3.5 && this.cinematicStage === 0) {
      this.cinematicStage = 1;
      this.player.x = this.boss.x;
      this.player.y = this.boss.y + 110; // Stepping between monster and village
      this.player.facing = 'up';
      this.boss.currentAttack = 'idle';

      this.startDialogue(CONFRONTATION_DIALOGUE, () => {
        // Boss fight begins!
        this.setState(GameState.BOSS_PHASE_1);
      });
    }
  }

  private updateBossBattle(dt: number) {
    // Player controls during combat
    this.updatePlayerCombat(dt);

    // Boss AI and attack patterns
    this.updateBossAI(dt);

    // Check hand bite trigger condition
    if (canTriggerHandBite(this.boss.hp, this.boss.maxHp, this.boss.hasTriggeredBite)) {
      this.boss.hasTriggeredBite = true;
      this.triggerHandBiteCinematic();
      return;
    }

    // Check defeat condition
    if (this.boss.hp <= 0) {
      this.setState(GameState.FINAL_FINISHER);
      this.cinematicTimer = 0;
      this.cinematicStage = 0;
      return;
    }

    // Camera follows midway between Ain and Titan
    const midX = (this.player.x + this.boss.x) / 2;
    const midY = (this.player.y + this.boss.y) / 2;
    this.cameraX += (midX - this.cameraX) * 0.1;
    this.cameraY += (midY - this.cameraY) * 0.1;
    this.clampCamera();
  }

  private updatePlayerCombat(dt: number) {
    // Timers
    if (this.player.invincibleTimer > 0) this.player.invincibleTimer -= dt;
    if (this.player.dodgeCooldown > 0) this.player.dodgeCooldown -= dt;
    if (this.player.attackCooldown > 0) this.player.attackCooldown -= dt;

    if (this.player.isDodging) {
      // Fast dash in current facing direction
      const dodgeSpeed = 260;
      const dirVec = this.player.facing === 'left' ? [-1, 0] : this.player.facing === 'right' ? [1, 0] : this.player.facing === 'up' ? [0, -1] : [0, 1];
      const targetX = this.player.x + dirVec[0] * dodgeSpeed * dt;
      const targetY = this.player.y + dirVec[1] * dodgeSpeed * dt;
      if (!this.map.checkCollision(targetX, this.player.y, 8)) this.player.x = targetX;
      if (!this.map.checkCollision(this.player.x, targetY, 8)) this.player.y = targetY;

      if (this.player.invincibleTimer <= 0.1) {
        this.player.isDodging = false;
      }
      return;
    }

    // Movement
    let moveX = 0;
    let moveY = 0;
    if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft')) moveX -= 1;
    if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight')) moveX += 1;
    if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) moveY -= 1;
    if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) moveY += 1;
    if (Math.abs(this.virtualJoystick.x) > 0.1) moveX += this.virtualJoystick.x;
    if (Math.abs(this.virtualJoystick.y) > 0.1) moveY += this.virtualJoystick.y;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;

      if (Math.abs(moveX) > Math.abs(moveY)) {
        this.player.facing = moveX > 0 ? 'right' : 'left';
      } else {
        this.player.facing = moveY > 0 ? 'down' : 'up';
      }

      const speed = 145;
      const targetX = this.player.x + moveX * speed * dt;
      const targetY = this.player.y + moveY * speed * dt;
      if (!this.map.checkCollision(targetX, this.player.y, 8)) this.player.x = targetX;
      if (!this.map.checkCollision(this.player.x, targetY, 8)) this.player.y = targetY;
    }

    // Dodge Action
    if (
      (this.justPressedKeys.has('ShiftLeft') || this.justPressedKeys.has('ShiftRight') || this.virtualButtons.dodge) &&
      this.player.dodgeCooldown <= 0
    ) {
      this.virtualButtons.dodge = false;
      this.player.isDodging = true;
      this.player.dodgeCooldown = 0.8;
      this.player.invincibleTimer = 0.35;
      soundManager.playDodge();
      this.burstParticles(this.player.x, this.player.y, 8, ['#ffffff', '#fde047'], 50, 'dust');
    }

    // Attack Action
    if (
      (this.justPressedKeys.has('Space') || this.justPressedKeys.has('KeyJ') || this.virtualButtons.attack) &&
      this.player.attackCooldown <= 0
    ) {
      this.virtualButtons.attack = false;
      this.player.isAttacking = true;
      this.player.attackCooldown = 0.35;
      soundManager.playAttackSwing();

      // Check if attack hits Boss
      const attackRange = 55;
      const bossDist = Math.hypot(this.player.x - this.boss.x, this.player.y - (this.boss.y - 40));
      if (bossDist < attackRange + 40) {
        // Hit boss!
        soundManager.playHit();
        this.hitstopTimer = 0.05; // 50ms hitstop
        this.shakeTrauma = 0.25;

        const { newHp, newPhase } = calculateBossDamage(this.boss.hp, 8, this.boss.staggerTimer > 0);
        this.boss.hp = newHp;
        this.boss.phase = newPhase;

        this.burstParticles(this.boss.x, this.boss.y - 40, 16, ['#a855f7', '#fbbf24', '#ffffff'], 90, 'sparkle');

        // Check phase transitions
        if (newPhase === 2 && this.state !== GameState.BOSS_PHASE_2) {
          this.setState(GameState.BOSS_PHASE_2);
        } else if (newPhase === 3 && this.state !== GameState.BOSS_PHASE_3) {
          this.setState(GameState.BOSS_PHASE_3);
        }
      }

      setTimeout(() => {
        this.player.isAttacking = false;
      }, 150);
    }
  }

  private updateBossAI(dt: number) {
    if (this.boss.staggerTimer > 0) {
      this.boss.staggerTimer -= dt;
      return;
    }

    this.boss.attackTimer -= dt;

    // Movement: Titan moves towards player slowly
    const dx = this.player.x - this.boss.x;
    const dy = (this.player.y - 70) - this.boss.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 40 && this.boss.currentAttack === 'idle') {
      const bossSpeed = this.boss.phase === 3 ? 60 : 40;
      this.boss.x += (dx / dist) * bossSpeed * dt;
      this.boss.y += (dy / dist) * bossSpeed * dt;
    }

    // Attacks based on Phase
    if (this.boss.attackTimer <= 0) {
      this.boss.attackTimer = this.boss.phase === 3 ? 2.0 : this.boss.phase === 2 ? 2.8 : 3.4;

      if (this.boss.phase === 1) {
        // Phase 1: Heavy Stomp
        this.executeBossStomp();
      } else if (this.boss.phase === 2) {
        // Phase 2: Purple Projectiles or Ground Beam
        if (Math.random() < 0.5) {
          this.executeBossProjectiles();
        } else {
          this.executeBossBeam();
        }
      } else {
        // Phase 3: Desperate Rampage (Charges & Roars & Stomps)
        const rand = Math.random();
        if (rand < 0.4) {
          this.executeBossStomp();
        } else if (rand < 0.7) {
          this.executeBossProjectiles();
        } else {
          this.executeBossBeam();
        }
      }
    }
  }

  private executeBossStomp() {
    this.boss.currentAttack = 'stomp';
    this.boss.attackProgress = 0;
    // Telegraph red danger circle on ground at player's current spot
    const targetX = this.player.x;
    const targetY = this.player.y;

    this.hazards.push({
      id: Date.now(),
      x: targetX,
      y: targetY,
      radius: 50,
      type: 'stomp_telegraph',
      timer: 0.75, // 0.75s readable telegraph
      duration: 0.75,
      damage: 1,
      hasDamaged: false
    });

    setTimeout(() => {
      this.boss.currentAttack = 'idle';
      soundManager.playStomp();
      this.shakeTrauma = 0.5;
      // Spawn actual shockwave blast
      this.hazards.push({
        id: Date.now() + 1,
        x: targetX,
        y: targetY,
        radius: 60,
        type: 'stomp_blast',
        timer: 0.25,
        duration: 0.25,
        damage: 1,
        hasDamaged: false
      });
      this.burstParticles(targetX, targetY, 20, ['#a855f7', '#7e22ce', '#3b0764'], 80, 'dust');
    }, 750);
  }

  private executeBossProjectiles() {
    this.boss.currentAttack = 'roar';
    soundManager.playAttackSwing();
    // Launch 3 purple energy orbs directed toward player
    const count = this.boss.phase === 3 ? 5 : 3;
    for (let i = 0; i < count; i++) {
      const spread = (i - Math.floor(count / 2)) * 0.25;
      const angle = Math.atan2(this.player.y - this.boss.y, this.player.x - this.boss.x) + spread;
      this.projectiles.push({
        id: Date.now() + i,
        x: this.boss.x,
        y: this.boss.y - 45,
        vx: Math.cos(angle) * 160,
        vy: Math.sin(angle) * 160,
        radius: 8,
        color: '#c084fc',
        damage: 1,
        fromPlayer: false,
        lifetime: 3.5
      });
    }

    setTimeout(() => {
      this.boss.currentAttack = 'idle';
    }, 500);
  }

  private executeBossBeam() {
    this.boss.currentAttack = 'energy_beam';
    // Telegraph line along ground
    const targetX = this.player.x;
    const targetY = this.player.y;
    this.hazards.push({
      id: Date.now(),
      x: this.boss.x,
      y: this.boss.y - 30,
      radius: 20,
      width: 250,
      height: 35,
      angle: Math.atan2(targetY - this.boss.y, targetX - this.boss.x),
      type: 'beam_telegraph',
      timer: 0.7,
      duration: 0.7,
      damage: 1,
      hasDamaged: false
    });

    setTimeout(() => {
      soundManager.playRoar();
      this.shakeTrauma = 0.45;
      this.hazards.push({
        id: Date.now() + 1,
        x: this.boss.x,
        y: this.boss.y - 30,
        radius: 25,
        width: 280,
        height: 45,
        angle: Math.atan2(targetY - this.boss.y, targetX - this.boss.x),
        type: 'beam_blast',
        timer: 0.35,
        duration: 0.35,
        damage: 1,
        hasDamaged: false
      });
      this.boss.currentAttack = 'idle';
    }, 700);
  }

  private triggerHandBiteCinematic() {
    this.setState(GameState.HAND_BITE_CINEMATIC);
    this.cinematicTimer = 0;
    this.cinematicStage = 0;
    this.boss.currentAttack = 'grab';

    // Cinematic: Titan grabs Ain, Ain angrily bites hand!
    this.player.x = this.boss.x + 35;
    this.player.y = this.boss.y - 40;

    this.startDialogue(HAND_BITE_DIALOGUE, () => {
      // Sound effect of bite & monster recoil
      soundManager.playBite();
      this.shakeTrauma = 0.5;
      this.boss.staggerTimer = 2.5; // Stagger Titan!
      this.boss.currentAttack = 'staggered';

      // Ain lands safely on ground
      this.player.x = this.boss.x;
      this.player.y = this.boss.y + 70;
      this.burstParticles(this.player.x, this.player.y, 12, ['#cbd5e1', '#ffffff'], 40, 'dust');

      // Resume combat in appropriate phase
      const currentPhase = determineBossPhase(this.boss.hp, this.boss.maxHp);
      this.setState(
        currentPhase === 1 ? GameState.BOSS_PHASE_1 : currentPhase === 2 ? GameState.BOSS_PHASE_2 : GameState.BOSS_PHASE_3
      );
    });
  }

  private updateHandBite(dt: number) {
    this.cinematicTimer += dt;
    // Camera zooms close on the grapple
    this.cameraX += (this.boss.x - this.cameraX) * 0.1;
    this.cameraY += (this.boss.y - 30 - this.cameraY) * 0.1;
  }

  private updateFinalFinisher(dt: number) {
    this.cinematicTimer += dt;
    this.boss.currentAttack = 'idle';

    // Sky brightens, aura dissolves
    this.skyDarkness = Math.max(0, this.skyDarkness - dt * 0.5);

    if (this.cinematicStage === 0 && this.cinematicTimer > 0.6) {
      this.cinematicStage = 1;
      this.player.x = this.boss.x;
      this.player.y = this.boss.y + 65;
      this.player.facing = 'up';

      this.startDialogue(FINISHER_DIALOGUE, () => {
        // Warm light restoration animation
        soundManager.playSparkle();
        this.burstParticles(this.boss.x, this.boss.y - 40, 60, ['#fde047', '#a855f7', '#ffffff'], 110, 'sparkle');

        setTimeout(() => {
          // Shadow Titan disappears, Aidil returns in exhausted pose
          this.aidil.x = this.boss.x;
          this.aidil.y = this.boss.y;
          this.aidil.visible = true;
          this.aidil.isExhausted = true;
          this.boss.hp = 0;

          this.setState(GameState.AIDIL_RESTORED);
        }, 1200);
      });
    }
  }

  private updateAidilRestored(dt: number) {
    this.cinematicTimer += dt;
    if (this.cinematicTimer > 0.5 && !this.showDialogueBox && this.dialogueIndex === 0) {
      this.startDialogue(RESTORATION_DIALOGUE, () => {
        this.aidil.isExhausted = false;
        // Trigger magical village restoration
        this.setState(GameState.VILLAGE_RESTORATION);
        this.cinematicTimer = 0;
      });
    }
  }

  private updateVillageRestoration(dt: number) {
    this.cinematicTimer += dt;

    // Golden magical particle sweep across village
    if (Math.random() < 0.8) {
      const rx = 300 + Math.random() * 600;
      const ry = 250 + Math.random() * 500;
      this.spawnParticle(rx, ry, -20 + Math.random() * 40, -40 - Math.random() * 40, 1.2, '#fef08a', 4, 'sparkle');
    }

    // Progressively restore damaged objects
    let allRestored = true;
    for (const d of this.map.destructibles) {
      if (d.destroyed) {
        allRestored = false;
        d.destroyed = false; // Restore object!
        soundManager.playSparkle();
        this.burstParticles(d.x + d.width / 2, d.y + d.height / 2, 12, ['#fbbf24', '#ffffff'], 60, 'sparkle');
      }
    }

    // Camera pans to show the restored village
    this.cameraX += (600 - this.cameraX) * 0.05;
    this.cameraY += (480 - this.cameraY) * 0.05;

    if (this.cinematicTimer > 3.0) {
      // Transition to Village Celebration
      this.setState(GameState.VILLAGE_CELEBRATION);
      this.cinematicTimer = 0;
      this.celebrationTossCount = 0;
      this.cinematicStage = 0;
    }
  }

  private updateVillageCelebration(dt: number) {
    this.cinematicTimer += dt;

    // Gather villagers in central square around Ain
    const squareX = 600;
    const squareY = 500;
    this.player.x = squareX;
    this.player.y = squareY;
    this.aidil.x = squareX + 60;
    this.aidil.y = squareY;

    // Cheering particles / Confetti
    if (Math.random() < 0.4) {
      this.spawnParticle(
        squareX - 80 + Math.random() * 160,
        squareY - 60 + Math.random() * 40,
        -15 + Math.random() * 30,
        -30 - Math.random() * 40,
        1.2,
        ['#ef4444', '#3b82f6', '#fbbf24', '#10b981', '#ec4899'][Math.floor(Math.random() * 5)],
        4,
        'petal'
      );
    }

    if (this.cinematicStage === 0 && this.cinematicTimer > 0.5 && !this.showDialogueBox && this.dialogueIndex === 0) {
      this.startDialogue(CELEBRATION_DIALOGUE_PART1, () => {
        // Now perform the THREE TOSSES exactly three times
        this.cinematicStage = 1; // Toss mode
        this.cinematicTimer = 0;
        this.executeTossSequence();
      });
    }
  }

  private executeTossSequence() {
    const { nextToss, isCelebrationDone } = advanceToss(this.celebrationTossCount);
    this.celebrationTossCount = nextToss;

    // Toss Ain in the air
    soundManager.playTossWhoosh();
    const quote = getTossQuote(nextToss);

    this.startDialogue([{ speaker: 'Ain', text: quote, emotion: 'shock' }], () => {
      soundManager.playCheer();
      if (!isCelebrationDone) {
        // Small delay between tosses
        setTimeout(() => {
          this.executeTossSequence();
        }, 600);
      } else {
        // All 3 tosses completed!
        // Ain lands safely, Aidil chuckles nearby
        setTimeout(() => {
          this.startDialogue(CELEBRATION_DIALOGUE_AFTER_TOSSES, () => {
            // Transition to Cake Scene!
            this.setState(GameState.CAKE_SCENE);
            this.cinematicTimer = 0;
            this.cinematicStage = 0;
          });
        }, 600);
      }
    });
  }

  private updateCakeScene(dt: number) {
    this.cinematicTimer += dt;
    this.cameraX += (670 - this.cameraX) * 0.08;
    this.cameraY += (480 - this.cameraY) * 0.08;

    // Aidil holds cake and walks over to the party table
    this.aidil.hasCake = true;
    this.aidil.x = 650;
    this.aidil.y = 470;
    this.player.x = 690;
    this.player.y = 470;

    if (this.cinematicStage === 0 && this.cinematicTimer > 0.8 && !this.showDialogueBox && this.dialogueIndex === 0) {
      this.startDialogue(CAKE_DIALOGUE, () => {
        // Both sit at table together
        this.cinematicStage = 1;
        this.aidil.isSitting = true;
        this.aidil.hasCake = false; // Cake placed on table
        this.cinematicTimer = 0;

        // AIDIL TAKES HIS FIRST BITE
        setTimeout(() => {
          // "At the exact moment Aidil's first bite animation completes, begin playing a cheerful birthday tune."
          soundManager.playBite();
          soundManager.playMusic('birthday_tune', true);
          soundManager.playSparkle();

          // Sparkles around cake
          this.burstParticles(670, 460, 20, ['#fbbf24', '#ec4899', '#ffffff'], 50, 'sparkle');

          // Transition smoothly into sunset
          setTimeout(() => {
            this.setState(GameState.SUNSET_ENDING);
            this.cinematicTimer = 0;
          }, 3500);
        }, 1200);
      });
    }
  }

  private updateSunsetEnding(dt: number) {
    this.cinematicTimer += dt;
    this.sunsetGlow = Math.min(1.0, this.sunsetGlow + dt * 0.3);

    // Camera on grassy hill overlooking village
    this.cameraX = 850;
    this.cameraY = 700;

    // Gentle fireflies drifting across sunset sky
    if (Math.random() < 0.25) {
      this.spawnParticle(
        this.cameraX - 250 + Math.random() * 500,
        this.cameraY - 200 + Math.random() * 300,
        -10 + Math.random() * 20,
        -15 - Math.random() * 20,
        2.5,
        '#fef08a',
        3,
        'sparkle'
      );
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.lifetime -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Check collision with player
      if (!p.fromPlayer) {
        const dist = Math.hypot(this.player.x - p.x, this.player.y - 12 - p.y);
        if (dist < p.radius + 8) {
          const { newHp, wasDamaged } = calculatePlayerDamage(
            this.player.hp,
            p.damage,
            this.player.isDodging,
            this.player.invincibleTimer > 0
          );
          if (wasDamaged) {
            this.player.hp = newHp;
            this.player.invincibleTimer = 0.8;
            this.shakeTrauma = 0.35;
            soundManager.playHit();
            this.burstParticles(this.player.x, this.player.y, 10, ['#ef4444', '#ffffff'], 60, 'dust');

            if (this.player.hp <= 0) {
              this.setState(GameState.GAME_OVER);
            }
          }
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.lifetime <= 0 || this.map.checkCollision(p.x, p.y, 4)) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateHazards(dt: number) {
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.timer -= dt;

      // Active blast damage
      if ((h.type === 'stomp_blast' || h.type === 'beam_blast') && !h.hasDamaged) {
        const dist = Math.hypot(this.player.x - h.x, this.player.y - h.y);
        if (dist < h.radius) {
          h.hasDamaged = true;
          const { newHp, wasDamaged } = calculatePlayerDamage(
            this.player.hp,
            h.damage,
            this.player.isDodging,
            this.player.invincibleTimer > 0
          );
          if (wasDamaged) {
            this.player.hp = newHp;
            this.player.invincibleTimer = 0.8;
            this.shakeTrauma = 0.4;
            soundManager.playHit();
            if (this.player.hp <= 0) {
              this.setState(GameState.GAME_OVER);
            }
          }
        }
      }

      if (h.timer <= 0) {
        this.hazards.splice(i, 1);
      }
    }
  }

  private clampCamera() {
    const halfW = this.canvas.width / (2 * this.cameraZoom);
    const halfH = this.canvas.height / (2 * this.cameraZoom);
    this.cameraX = Math.max(halfW, Math.min(MAP_WIDTH - halfW, this.cameraX));
    this.cameraY = Math.max(halfH, Math.min(MAP_HEIGHT - halfH, this.cameraY));
  }

  /**
   * Main render method
   */
  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Apply Camera Shake
    const shakeAmount = this.shakeTrauma * this.shakeTrauma * 14;
    const shakeX = (Math.random() - 0.5) * shakeAmount;
    const shakeY = (Math.random() - 0.5) * shakeAmount;

    // Camera Transform
    ctx.translate(w / 2 + shakeX, h / 2 + shakeY);
    ctx.scale(this.cameraZoom, this.cameraZoom);
    ctx.translate(-Math.floor(this.cameraX), -Math.floor(this.cameraY));

    // Render world map terrain, cobblestone, scenery, buildings
    const viewW = w / this.cameraZoom + 100;
    const viewH = h / this.cameraZoom + 100;
    const viewX = this.cameraX - viewW / 2;
    const viewY = this.cameraY - viewH / 2;
    this.map.renderTerrain(ctx, viewX, viewY, viewW, viewH);

    // Render Hazards (Telegraph rings and blasts)
    this.renderHazards(ctx);

    // Render Characters and Entities sorted by Y depth
    this.renderEntities(ctx);

    // Render Projectiles
    this.renderProjectiles(ctx);

    // Render Particles
    this.renderParticles(ctx);

    // Sky / Atmosphere Overlay (Darkness during transformation, Sunset glow)
    this.renderAtmosphere(ctx, viewX, viewY, viewW, viewH);

    ctx.restore();
  }

  private renderHazards(ctx: CanvasRenderingContext2D) {
    for (const h of this.hazards) {
      ctx.save();
      if (h.type === 'stomp_telegraph') {
        const pulse = 0.5 + Math.sin(this.walkAnimTimer * 16) * 0.3;
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.4})`;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (h.type === 'stomp_blast') {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'beam_telegraph' && h.angle !== undefined) {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.fillRect(0, -15, h.width || 200, 30);
        ctx.restore();
      } else if (h.type === 'beam_blast' && h.angle !== undefined) {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);
        ctx.fillStyle = 'rgba(192, 132, 252, 0.85)';
        ctx.fillRect(0, -22, h.width || 250, 44);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  private renderEntities(ctx: CanvasRenderingContext2D) {
    // Collect all renderable actors
    interface RenderActor {
      y: number;
      draw: () => void;
    }
    const actors: RenderActor[] = [];

    // Ain
    actors.push({
      y: this.player.y,
      draw: () => {
        let pose: 'normal' | 'falling' | 'tossed' | 'sitting' | 'biting' = 'normal';
        if (this.state === GameState.OPENING_CINEMATIC && this.cinematicStage === 0) pose = 'falling';
        if (this.state === GameState.VILLAGE_CELEBRATION && this.celebrationTossCount > 0 && this.cinematicStage === 1) pose = 'tossed';
        if (this.state === GameState.SUNSET_ENDING || (this.state === GameState.CAKE_SCENE && this.cinematicStage === 1)) pose = 'sitting';

        const alpha = this.player.invincibleTimer > 0 && Math.floor(this.walkAnimTimer * 18) % 2 === 0 ? 0.4 : 1.0;
        PixelRenderer.drawAin(
          ctx,
          this.player.x,
          this.player.y,
          this.player.facing,
          this.walkAnimTimer,
          this.player.isAttacking,
          this.player.isDodging,
          pose,
          alpha
        );
      }
    });

    // Aidil
    if (this.aidil.visible) {
      actors.push({
        y: this.aidil.y,
        draw: () => {
          PixelRenderer.drawAidil(
            ctx,
            this.aidil.x,
            this.aidil.y,
            this.aidil.facing,
            this.walkAnimTimer,
            this.aidil.hasGift,
            this.aidil.hasCake,
            this.aidil.isExhausted,
            this.aidil.isSitting || this.state === GameState.SUNSET_ENDING
          );
        }
      });
    }

    // Villagers
    for (const npc of this.map.npcs) {
      actors.push({
        y: npc.y,
        draw: () => {
          const isPanicking = this.state === GameState.VILLAGE_RAMPAGE;
          const isCheering = this.state === GameState.VILLAGE_CELEBRATION;
          PixelRenderer.drawVillager(ctx, npc.x, npc.y, npc, this.walkAnimTimer, isCheering, isPanicking);
        }
      });
    }

    // Angels (Opening Cinematic)
    if (this.state === GameState.OPENING_CINEMATIC && this.cinematicStage < 2) {
      actors.push({
        y: this.player.y - 10,
        draw: () => {
          PixelRenderer.drawAngel(ctx, this.player.x - 45, this.player.y - 30, 1, this.walkAnimTimer);
          PixelRenderer.drawAngel(ctx, this.player.x + 45, this.player.y - 25, 2, this.walkAnimTimer);
          PixelRenderer.drawAngel(ctx, this.player.x, this.player.y - 55, 3, this.walkAnimTimer);
        }
      });
    }

    // Shadow Titan Boss
    const isBossVisible = this.state.startsWith('BOSS_') ||
      this.state === GameState.VILLAGE_RAMPAGE ||
      this.state === GameState.HAND_BITE_CINEMATIC ||
      this.state === GameState.FINAL_FINISHER;

    if (isBossVisible) {
      actors.push({
        y: this.boss.y,
        draw: () => {
          const isFinisher = this.state === GameState.FINAL_FINISHER;
          PixelRenderer.drawShadowTitan(
            ctx,
            this.boss.x,
            this.boss.y,
            this.walkAnimTimer,
            this.boss.currentAttack,
            this.boss.attackProgress,
            this.boss.staggerTimer > 0,
            this.boss.auraIntensity,
            isFinisher
          );
        }
      });
    }

    // Sort actors by Y coordinate for correct top-down 2D depth
    actors.sort((a, b) => a.y - b.y);
    for (const actor of actors) {
      actor.draw();
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particlePool) {
      if (p.life <= 0) continue;
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'sparkle') {
        ctx.fillRect(p.x - p.size, p.y, p.size * 2, 2);
        ctx.fillRect(p.x, p.y - p.size, 2, p.size * 2);
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
    }
  }

  private renderAtmosphere(ctx: CanvasRenderingContext2D, vx: number, vy: number, vw: number, vh: number) {
    // Darkness during transformation
    if (this.skyDarkness > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(15, 23, 42, ${this.skyDarkness * 0.65})`;
      ctx.fillRect(vx, vy, vw, vh);
      ctx.restore();
    }

    // Warm golden/purple sunset glow
    if (this.sunsetGlow > 0) {
      ctx.save();
      const grad = ctx.createLinearGradient(vx, vy, vx, vy + vh);
      grad.addColorStop(0, `rgba(244, 63, 94, ${this.sunsetGlow * 0.45})`); // Rose pink
      grad.addColorStop(0.5, `rgba(249, 115, 22, ${this.sunsetGlow * 0.35})`); // Sunset orange
      grad.addColorStop(1, `rgba(88, 28, 135, ${this.sunsetGlow * 0.25})`); // Twilight purple
      ctx.fillStyle = grad;
      ctx.fillRect(vx, vy, vw, vh);
      ctx.restore();
    }
  }

  public restartFromCheckpoint() {
    this.player.hp = this.player.maxHp;
    this.boss.hp = this.boss.maxHp;
    this.boss.phase = 1;
    this.hazards = [];
    this.projectiles = [];
    this.setState(GameState.BOSS_PHASE_1);
  }

  public resetToMainMenu() {
    this.stop();
    this.player.hp = this.player.maxHp;
    this.player.x = 280;
    this.player.y = 780;
    this.aidil.x = 660;
    this.aidil.y = 480;
    this.aidil.visible = true;
    this.aidil.hasGift = true;
    this.aidil.hasCake = false;
    this.aidil.isExhausted = false;
    this.aidil.isSitting = false;
    this.boss.hp = 100;
    this.boss.hasTriggeredBite = false;
    this.celebrationTossCount = 0;
    this.skyDarkness = 0;
    this.sunsetGlow = 0;
    this.hazards = [];
    this.projectiles = [];
    for (const d of this.map.destructibles) d.destroyed = false;
    this.setState(GameState.TITLE_SCREEN);
    this.start();
  }
}
