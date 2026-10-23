/**
 * Game state enums and data interfaces for Ain's Birthday Adventure
 */

export enum GameState {
  TITLE_SCREEN = 'TITLE_SCREEN',
  OPENING_CINEMATIC = 'OPENING_CINEMATIC',
  EXPLORATION = 'EXPLORATION',
  GIFT_SCENE = 'GIFT_SCENE',
  TRANSFORMATION_CINEMATIC = 'TRANSFORMATION_CINEMATIC',
  VILLAGE_RAMPAGE = 'VILLAGE_RAMPAGE',
  BOSS_PHASE_1 = 'BOSS_PHASE_1',
  BOSS_PHASE_2 = 'BOSS_PHASE_2',
  BOSS_PHASE_3 = 'BOSS_PHASE_3',
  HAND_BITE_CINEMATIC = 'HAND_BITE_CINEMATIC',
  FINAL_FINISHER = 'FINAL_FINISHER',
  AIDIL_RESTORED = 'AIDIL_RESTORED',
  VILLAGE_RESTORATION = 'VILLAGE_RESTORATION',
  VILLAGE_CELEBRATION = 'VILLAGE_CELEBRATION',
  CAKE_SCENE = 'CAKE_SCENE',
  SUNSET_ENDING = 'SUNSET_ENDING',
  GAME_COMPLETE = 'GAME_COMPLETE',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export type Direction = 'down' | 'up' | 'left' | 'right';

export interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: 'neutral' | 'panic' | 'calm' | 'cheerful' | 'smug' | 'angry' | 'shock' | 'happy' | 'exhausted';
  onShow?: () => void;
  onComplete?: () => void;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  invincibleTimer: number;
  dodgeCooldown: number;
  attackCooldown: number;
  isDodging: boolean;
  isAttacking: boolean;
  facing: Direction;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface BossStats {
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: Direction;
  attackTimer: number;
  currentAttack: 'idle' | 'stomp' | 'arm_sweep' | 'projectile' | 'energy_beam' | 'charge' | 'roar' | 'grab' | 'staggered';
  attackProgress: number;
  telegraphTimer: number;
  targetX: number;
  targetY: number;
  staggerTimer: number;
  auraIntensity: number;
  hasTriggeredBite: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape?: 'square' | 'circle' | 'sparkle' | 'petal' | 'dust';
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
  fromPlayer: boolean;
  lifetime: number;
}

export interface GroundHazard {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'stomp_telegraph' | 'stomp_blast' | 'beam_telegraph' | 'beam_blast';
  timer: number;
  duration: number;
  width?: number;
  height?: number;
  angle?: number;
  damage: number;
  hasDamaged: boolean;
}

export interface InteractiveObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  prompt: string;
  dialogue?: DialogueLine[];
  isTrigger?: boolean;
}

export interface DestructibleObject {
  id: string;
  type: 'fence' | 'stall' | 'barrel' | 'crates' | 'crack';
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
  restoreProgress: number; // 0 to 1
}

export interface VillagerNPC {
  id: string;
  name: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  fleeTargetX: number;
  fleeTargetY: number;
  facing: Direction;
  walkTimer: number;
  speed: number;
  colorTheme: string;
  hairColor: string;
  hasApples?: boolean;
  isGuard?: boolean;
  isShopkeeper?: boolean;
  dialogue?: DialogueLine[];
}
