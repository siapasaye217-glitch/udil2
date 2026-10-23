/**
 * Pure combat rules, damage calculation, phase management, and toss counter verification
 */

export interface CombatState {
  playerHp: number;
  playerMaxHp: number;
  bossHp: number;
  bossMaxHp: number;
  bossPhase: 1 | 2 | 3;
  hasTriggeredHandBite: boolean;
  tossCount: number;
}

export function determineBossPhase(currentHp: number, maxHp: number): 1 | 2 | 3 {
  const ratio = currentHp / maxHp;
  if (ratio > 0.65) {
    return 1;
  } else if (ratio > 0.30) {
    return 2;
  } else {
    return 3;
  }
}

export function calculatePlayerDamage(
  currentHp: number,
  incomingDamage: number,
  isDodging: boolean,
  isInvulnerable: boolean
): { newHp: number; wasDamaged: boolean } {
  if (isDodging || isInvulnerable) {
    return { newHp: currentHp, wasDamaged: false };
  }
  const newHp = Math.max(0, currentHp - incomingDamage);
  return { newHp, wasDamaged: true };
}

export function calculateBossDamage(
  bossHp: number,
  playerAttackPower: number,
  bossIsStaggered: boolean
): { newHp: number; newPhase: 1 | 2 | 3; wasDamaged: boolean } {
  if (bossHp <= 0) {
    return { newHp: 0, newPhase: 3, wasDamaged: false };
  }
  const multiplier = bossIsStaggered ? 1.5 : 1.0;
  const damage = Math.round(playerAttackPower * multiplier);
  const newHp = Math.max(0, bossHp - damage);
  const newPhase = determineBossPhase(newHp, 100);
  return { newHp, newPhase, wasDamaged: true };
}

export function canTriggerHandBite(
  bossHp: number,
  bossMaxHp: number,
  hasTriggered: boolean
): boolean {
  // Trigger comedic hand bite when boss HP is around 50% or lower and hasn't been triggered yet
  return !hasTriggered && bossHp <= bossMaxHp * 0.55 && bossHp > 0;
}

export function advanceToss(currentTosses: number): { nextToss: number; isCelebrationDone: boolean } {
  if (currentTosses >= 3) {
    return { nextToss: 3, isCelebrationDone: true };
  }
  const nextToss = currentTosses + 1;
  return { nextToss, isCelebrationDone: nextToss === 3 };
}

export function getTossQuote(tossNumber: number): string {
  switch (tossNumber) {
    case 1:
      return 'WHOA!';
    case 2:
      return 'OKAY, THAT\'S ONE TOO MANY!';
    case 3:
      return 'YOU BETTER NOT MAKE THIS A TRADITION!';
    default:
      return '';
  }
}
