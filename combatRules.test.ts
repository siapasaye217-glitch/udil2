import test from 'node:test';
import assert from 'node:assert/strict';
import {
  determineBossPhase,
  calculatePlayerDamage,
  calculateBossDamage,
  canTriggerHandBite,
  advanceToss,
  getTossQuote
} from './combatRules';

test('determineBossPhase correctly transitions across HP thresholds', () => {
  assert.equal(determineBossPhase(100, 100), 1);
  assert.equal(determineBossPhase(70, 100), 1);
  assert.equal(determineBossPhase(65, 100), 2);
  assert.equal(determineBossPhase(45, 100), 2);
  assert.equal(determineBossPhase(30, 100), 3);
  assert.equal(determineBossPhase(10, 100), 3);
});

test('calculatePlayerDamage respects dodge and invulnerability', () => {
  // Dodging prevents damage
  const dodgingResult = calculatePlayerDamage(5, 1, true, false);
  assert.equal(dodgingResult.newHp, 5);
  assert.equal(dodgingResult.wasDamaged, false);

  // Invulnerable prevents damage
  const invulnResult = calculatePlayerDamage(5, 1, false, true);
  assert.equal(invulnResult.newHp, 5);
  assert.equal(invulnResult.wasDamaged, false);

  // Normal hit reduces HP
  const hitResult = calculatePlayerDamage(5, 1, false, false);
  assert.equal(hitResult.newHp, 4);
  assert.equal(hitResult.wasDamaged, true);
});

test('calculateBossDamage applies staggered multiplier and updates phase', () => {
  const normalHit = calculateBossDamage(100, 10, false);
  assert.equal(normalHit.newHp, 90);
  assert.equal(normalHit.newPhase, 1);

  const staggeredHit = calculateBossDamage(50, 10, true);
  assert.equal(staggeredHit.newHp, 35); // 10 * 1.5 = 15 damage
  assert.equal(staggeredHit.newPhase, 2);
});

test('canTriggerHandBite fires at <= 55% boss HP only once', () => {
  assert.equal(canTriggerHandBite(80, 100, false), false);
  assert.equal(canTriggerHandBite(50, 100, false), true);
  assert.equal(canTriggerHandBite(50, 100, true), false); // already triggered
});

test('advanceToss allows exactly 3 tosses and stops at 3', () => {
  const toss1 = advanceToss(0);
  assert.equal(toss1.nextToss, 1);
  assert.equal(toss1.isCelebrationDone, false);
  assert.equal(getTossQuote(1), 'WHOA!');

  const toss2 = advanceToss(toss1.nextToss);
  assert.equal(toss2.nextToss, 2);
  assert.equal(toss2.isCelebrationDone, false);
  assert.equal(getTossQuote(2), "OKAY, THAT'S ONE TOO MANY!");

  const toss3 = advanceToss(toss2.nextToss);
  assert.equal(toss3.nextToss, 3);
  assert.equal(toss3.isCelebrationDone, true);
  assert.equal(getTossQuote(3), 'YOU BETTER NOT MAKE THIS A TRADITION!');

  // Cannot exceed 3
  const extra = advanceToss(3);
  assert.equal(extra.nextToss, 3);
  assert.equal(extra.isCelebrationDone, true);
});
