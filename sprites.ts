/**
 * Pixel art rendering system for characters, boss, scenery, and FX
 */

import { Direction } from './types';

export class PixelRenderer {
  /**
   * Helper to draw a pixel block
   */
  public static drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = 2) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }

  /**
   * Draws Ain: adventurer birthday girl
   */
  public static drawAin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: Direction,
    walkFrame: number,
    isAttacking: boolean = false,
    isDodging: boolean = false,
    pose: 'normal' | 'falling' | 'tossed' | 'sitting' | 'biting' = 'normal',
    alpha: number = 1.0
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const px = Math.floor(x);
    const py = Math.floor(y);

    if (isDodging) {
      // Rolling dodge animation
      ctx.translate(px, py - 12);
      ctx.rotate((walkFrame * 2) % (Math.PI * 2));
      // Smoke puff / streak
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-8, -8, 16, 16);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6, -6, 12, 12);
      ctx.restore();
      return;
    }

    if (pose === 'tossed') {
      // Airborne celebration pose with limbs out
      const bob = Math.sin(walkFrame * 5) * 3;
      // Shadow on ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(px, py + 20, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body in air
      const ay = py - 20 + bob;
      // Dress / Tunic
      ctx.fillStyle = '#e11d48'; // Birthday rose tunic
      ctx.fillRect(px - 6, ay - 6, 12, 14);
      // Head
      ctx.fillStyle = '#fed7aa'; // Skin
      ctx.fillRect(px - 5, ay - 16, 10, 10);
      // Dark brown hair fluttering
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px - 7, ay - 20, 14, 6);
      ctx.fillRect(px - 8, ay - 16, 4, 12);
      ctx.fillRect(px + 4, ay - 16, 4, 12);
      // Birthday Crown / Ribbon
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px - 5, ay - 22, 10, 3);
      // Surprised eyes & open mouth
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 3, ay - 13, 2, 2);
      ctx.fillRect(px + 1, ay - 13, 2, 2);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(px - 1, ay - 9, 3, 3);
      // Arms up in excitement
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(px - 10, ay - 14, 4, 4);
      ctx.fillRect(px + 7, ay - 14, 4, 4);
      // Boots
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px - 6, ay + 8, 4, 4);
      ctx.fillRect(px + 2, ay + 8, 4, 4);
      ctx.restore();
      return;
    }

    if (pose === 'falling') {
      // Falling from the sky (Opening cinematic)
      const bob = Math.sin(walkFrame * 8) * 2;
      const ay = py + bob;
      // Tunic
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(px - 6, ay - 6, 12, 14);
      // Skin
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(px - 5, ay - 16, 10, 10);
      // Hair billowing upwards
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px - 7, ay - 24, 14, 10);
      // Headband / Ribbon
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px - 6, ay - 16, 12, 2);
      // Wide eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 3, ay - 12, 2, 2);
      ctx.fillRect(px + 1, ay - 12, 2, 2);
      // Arms flailing
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(px - 10, ay - 10, 4, 4);
      ctx.fillRect(px + 7, ay - 10, 4, 4);
      // Legs
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px - 5, ay + 8, 3, 5);
      ctx.fillRect(px + 2, ay + 8, 3, 5);
      ctx.restore();
      return;
    }

    if (pose === 'sitting') {
      // Sitting peacefully on grass/bench
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(px, py + 4, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tunic
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(px - 6, py - 8, 12, 10);
      // Skin
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(px - 5, py - 18, 10, 10);
      // Hair
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px - 7, py - 20, 14, 6);
      ctx.fillRect(px - 8, py - 14, 3, 10);
      ctx.fillRect(px + 5, py - 14, 3, 10);
      // Ribbon
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px - 5, py - 20, 10, 2);
      // Side profile eyes looking peaceful
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 1, py - 14, 2, 2);
      // Boots tucked
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px - 4, py + 2, 8, 3);
      ctx.restore();
      return;
    }

    // Normal top-down exploration / combat
    const bob = isAttacking ? 0 : Math.sin(walkFrame * 6) * 1.5;
    const legOffset = Math.sin(walkFrame * 6) * 3;

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + 1, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const ay = py + bob;

    // Legs / Boots
    ctx.fillStyle = '#78350f';
    if (facing === 'down' || facing === 'up') {
      ctx.fillRect(px - 5, ay - 4 + legOffset, 3, 5);
      ctx.fillRect(px + 2, ay - 4 - legOffset, 3, 5);
    } else if (facing === 'left') {
      ctx.fillRect(px - 3 + legOffset, ay - 4, 3, 5);
      ctx.fillRect(px + 1 - legOffset, ay - 4, 3, 5);
    } else {
      ctx.fillRect(px - 2 + legOffset, ay - 4, 3, 5);
      ctx.fillRect(px + 2 - legOffset, ay - 4, 3, 5);
    }

    // Tunic (Red / Pink Adventurer Birthday Outfit)
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(px - 6, ay - 14, 12, 11);
    ctx.fillStyle = '#be123c';
    ctx.fillRect(px - 5, ay - 8, 10, 5);
    // Gold Belt
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px - 6, ay - 6, 12, 2);

    // Head / Face
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px - 5, ay - 24, 10, 10);

    // Hair & Headband
    ctx.fillStyle = '#451a03'; // Brown hair
    ctx.fillRect(px - 7, ay - 27, 14, 6);
    if (facing === 'up') {
      ctx.fillRect(px - 6, ay - 25, 12, 10); // Back of head hair
    } else if (facing === 'down') {
      ctx.fillRect(px - 7, ay - 22, 3, 8);
      ctx.fillRect(px + 4, ay - 22, 3, 8);
      // Headband
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px - 5, ay - 25, 10, 2);
      // Cute eyes & smile
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 3, ay - 20, 2, 2);
      ctx.fillRect(px + 1, ay - 20, 2, 2);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(px - 1, ay - 17, 2, 1);
    } else if (facing === 'left') {
      ctx.fillRect(px + 1, ay - 25, 5, 9);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px - 4, ay - 25, 3, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 4, ay - 20, 2, 2);
    } else {
      ctx.fillRect(px - 6, ay - 25, 5, 9);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px + 1, ay - 25, 3, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 2, ay - 20, 2, 2);
    }

    // Sword / Attack Slash
    if (isAttacking) {
      ctx.fillStyle = '#fde047';
      const slashAngle = facing === 'right' ? 0 : facing === 'down' ? Math.PI / 2 : facing === 'left' ? Math.PI : -Math.PI / 2;
      ctx.save();
      ctx.translate(px, ay - 10);
      ctx.rotate(slashAngle);
      // Sword blade & sparkle arc
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(4, -2, 14, 4);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(10, -1, 10, 2);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(8, 0, 16, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draws Aidil: relaxed friend holding present, cake, or sitting
   */
  public static drawAidil(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: Direction,
    walkFrame: number,
    hasGift: boolean = false,
    hasCake: boolean = false,
    isExhausted: boolean = false,
    isSitting: boolean = false
  ) {
    ctx.save();
    const px = Math.floor(x);
    const py = Math.floor(y);

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + 1, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isSitting) {
      // Sitting next to Ain for cake/sunset
      ctx.fillStyle = '#0284c7'; // Blue/teal shirt
      ctx.fillRect(px - 6, py - 9, 12, 10);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(px - 5, py - 19, 10, 10);
      ctx.fillStyle = '#1e1b4b'; // Dark wavy hair
      ctx.fillRect(px - 7, py - 22, 14, 6);
      ctx.fillRect(px - 8, py - 16, 3, 8);
      ctx.fillRect(px + 5, py - 16, 3, 8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 1, py - 15, 2, 2);
      // Jeans
      ctx.fillStyle = '#334155';
      ctx.fillRect(px - 4, py + 1, 8, 4);
      ctx.restore();
      return;
    }

    if (isExhausted) {
      // Fallen to knees, brushing off purple dust
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(px - 7, py - 6, 14, 8);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(px - 4, py - 14, 8, 8);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(px - 5, py - 16, 10, 4);
      // Dazed spiral eyes
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px - 2, py - 11, 2, 2);
      ctx.fillRect(px + 1, py - 11, 2, 2);
      ctx.fillStyle = '#334155';
      ctx.fillRect(px - 6, py + 2, 12, 3);
      ctx.restore();
      return;
    }

    const bob = Math.sin(walkFrame * 6) * 1.5;
    const ay = py + bob;

    // Pants & Shoes
    ctx.fillStyle = '#334155';
    ctx.fillRect(px - 5, ay - 4, 3, 5);
    ctx.fillRect(px + 2, ay - 4, 3, 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px - 6, ay, 4, 2);
    ctx.fillRect(px + 2, ay, 4, 2);

    // Shirt & Vest (Teal / Blue)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(px - 6, ay - 14, 12, 11);
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(px - 5, ay - 14, 4, 10);
    ctx.fillRect(px + 1, ay - 14, 4, 10);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px - 5, ay - 24, 10, 10);

    // Hair
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(px - 7, ay - 27, 14, 6);
    ctx.fillRect(px - 7, ay - 22, 3, 6);
    ctx.fillRect(px + 4, ay - 22, 3, 6);

    // Face
    if (facing !== 'up') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 3, ay - 20, 2, 2);
      ctx.fillRect(px + 1, ay - 20, 2, 2);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px - 1, ay - 17, 3, 1);
    }

    // Holding wrapped birthday gift
    if (hasGift) {
      // Golden wrapped box with red ribbon
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 4, ay - 12, 8, 8);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px + 7, ay - 12, 2, 8);
      ctx.fillRect(px + 4, ay - 9, 8, 2);
      // Bow
      ctx.fillRect(px + 6, ay - 14, 4, 2);
    }

    // Holding Birthday Cake
    if (hasCake) {
      // Cake plate & base
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(px - 9, ay - 10, 18, 3);
      // Sponge cake & frosting
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px - 7, ay - 17, 14, 7);
      ctx.fillStyle = '#f472b6'; // Strawberry frosting
      ctx.fillRect(px - 8, ay - 18, 16, 3);
      // Candles
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px - 4, ay - 22, 2, 4);
      ctx.fillRect(px, ay - 23, 2, 5);
      ctx.fillRect(px + 4, ay - 22, 2, 4);
      // Candle flame sparkles
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 4, ay - 25, 2, 3);
      ctx.fillRect(px, ay - 26, 2, 3);
      ctx.fillRect(px + 4, ay - 25, 2, 3);
    }

    ctx.restore();
  }

  /**
   * Draws the 3 Angels in the sky
   */
  public static drawAngel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: 1 | 2 | 3,
    frame: number
  ) {
    ctx.save();
    const px = Math.floor(x);
    const py = Math.floor(y + Math.sin(frame * 6 + type) * 4);

    // Glowing halo
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(px - 5, py - 20, 10, 2);
    ctx.fillRect(px - 6, py - 19, 2, 1);
    ctx.fillRect(px + 4, py - 19, 2, 1);

    // White feathered fluttering wings
    const wingFlap = Math.sin(frame * 12 + type) * 6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px - 4, py - 8);
    ctx.lineTo(px - 16, py - 14 + wingFlap);
    ctx.lineTo(px - 14, py - 2 + wingFlap);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px + 4, py - 8);
    ctx.lineTo(px + 16, py - 14 + wingFlap);
    ctx.lineTo(px + 14, py - 2 + wingFlap);
    ctx.closePath();
    ctx.fill();

    // Robe
    ctx.fillStyle = type === 1 ? '#e0f2fe' : type === 2 ? '#ffedd5' : '#fce7f3';
    ctx.fillRect(px - 5, py - 10, 10, 14);

    // Face
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px - 4, py - 17, 8, 8);

    // Distinct comedic expressions
    ctx.fillStyle = '#0f172a';
    if (type === 1) {
      // Angel 1: calm composed
      ctx.fillRect(px - 3, py - 14, 2, 1);
      ctx.fillRect(px + 1, py - 14, 2, 1);
      ctx.fillRect(px - 1, py - 11, 2, 1);
    } else if (type === 2) {
      // Angel 2: panicking! Wide eyes and screaming mouth
      ctx.fillRect(px - 3, py - 15, 2, 2);
      ctx.fillRect(px + 1, py - 15, 2, 2);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px - 2, py - 12, 4, 3);
    } else {
      // Angel 3: cheerful winking, pointing down
      ctx.fillRect(px - 3, py - 14, 2, 2);
      ctx.fillRect(px + 1, py - 14, 2, 1);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(px - 1, py - 11, 2, 1);
    }

    ctx.restore();
  }

  /**
   * Draws Villagers (innocent townspeople with distinct colors)
   */
  public static drawVillager(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    npc: {
      colorTheme: string;
      hairColor: string;
      isGuard?: boolean;
      isShopkeeper?: boolean;
      hasApples?: boolean;
      facing: Direction;
    },
    frame: number,
    isCheering: boolean = false,
    isPanicking: boolean = false
  ) {
    ctx.save();
    const px = Math.floor(x);
    const py = Math.floor(y);

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + 1, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = isPanicking ? Math.sin(frame * 16) * 2 : Math.sin(frame * 4) * 1;
    const ay = py + bob;

    // Body Outfit
    ctx.fillStyle = npc.colorTheme;
    ctx.fillRect(px - 5, ay - 13, 10, 10);

    // Pants / Shoes
    ctx.fillStyle = '#475569';
    ctx.fillRect(px - 4, ay - 3, 3, 4);
    ctx.fillRect(px + 1, ay - 3, 3, 4);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px - 4, ay - 21, 8, 8);

    if (npc.isGuard) {
      // Guard iron helmet
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px - 5, ay - 24, 10, 6);
      ctx.fillRect(px - 5, ay - 18, 2, 4);
      ctx.fillRect(px + 3, ay - 18, 2, 4);
      ctx.fillStyle = '#dc2626'; // Red plume
      ctx.fillRect(px - 1, ay - 27, 2, 4);
    } else {
      // Hair
      ctx.fillStyle = npc.hairColor;
      ctx.fillRect(px - 5, ay - 24, 10, 4);
      ctx.fillRect(px - 5, ay - 20, 2, 5);
      ctx.fillRect(px + 3, ay - 20, 2, 5);
    }

    // Eyes
    ctx.fillStyle = '#0f172a';
    if (isPanicking) {
      // Wide startled eyes
      ctx.fillRect(px - 3, ay - 18, 2, 2);
      ctx.fillRect(px + 1, ay - 18, 2, 2);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(px - 1, ay - 15, 2, 2);
    } else {
      ctx.fillRect(px - 3, ay - 17, 2, 1);
      ctx.fillRect(px + 1, ay - 17, 2, 1);
    }

    // Cheering arms
    if (isCheering) {
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(px - 8, ay - 18, 3, 4);
      ctx.fillRect(px + 5, ay - 18, 3, 4);
    }

    // Shopkeeper Apron / Apple basket
    if (npc.isShopkeeper) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 4, ay - 10, 8, 6);
    }
    if (npc.hasApples && !isPanicking) {
      ctx.fillStyle = '#78350f'; // Basket
      ctx.fillRect(px + 4, ay - 10, 5, 5);
      ctx.fillStyle = '#ef4444'; // Red apples
      ctx.fillRect(px + 5, ay - 12, 3, 3);
    }

    ctx.restore();
  }

  /**
   * Draws the gigantic Shadow Titan (Aidil transformed!)
   */
  public static drawShadowTitan(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    frame: number,
    attack: string,
    attackProgress: number,
    isStaggered: boolean = false,
    auraIntensity: number = 1.0,
    isDefeatedFinisher: boolean = false
  ) {
    ctx.save();
    const px = Math.floor(x);
    const py = Math.floor(y);

    // Titan is huge: ~100x120px bounding box
    const breathe = isDefeatedFinisher ? Math.sin(frame * 2) * 1 : Math.sin(frame * 4) * 3;
    const ty = py + breathe;

    // Giant Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(px, py + 12, 45, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Purple Dark Energy Aura
    if (!isDefeatedFinisher) {
      const gradient = ctx.createRadialGradient(px, ty - 50, 20, px, ty - 50, 75 * auraIntensity);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      gradient.addColorStop(0.5, 'rgba(126, 34, 206, 0.25)');
      gradient.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, ty - 50, 75 * auraIntensity, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isDefeatedFinisher) {
      // Collapsed to one knee, aura flickering
      ctx.fillStyle = '#3b0764'; // Dark obsidian/purple armor
      ctx.fillRect(px - 30, ty - 45, 60, 45);
      // Head lowered
      ctx.fillStyle = '#581c87';
      ctx.fillRect(px - 18, ty - 60, 36, 24);
      // Horns
      ctx.fillStyle = '#2e1065';
      ctx.fillRect(px - 24, ty - 70, 8, 14);
      ctx.fillRect(px + 16, ty - 70, 8, 14);
      // Flickering dimmed eyes
      ctx.fillStyle = Math.sin(frame * 10) > 0 ? '#c084fc' : '#581c87';
      ctx.fillRect(px - 10, ty - 52, 6, 3);
      ctx.fillRect(px + 4, ty - 52, 6, 3);
      ctx.restore();
      return;
    }

    // Heavy Stomping Feet & Legs
    ctx.fillStyle = '#2e1065';
    const stompOffset = attack === 'stomp' ? Math.sin(attackProgress * Math.PI) * 16 : 0;
    ctx.fillRect(px - 26, ty - 20 - stompOffset, 20, 26 + stompOffset);
    ctx.fillRect(px + 6, ty - 20, 20, 26);

    // Claws on feet
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(px - 28, ty + 2 - stompOffset, 24, 6);
    ctx.fillRect(px + 4, ty + 2, 24, 6);

    // Torso / Dark Armor Plates
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(px - 34, ty - 70, 68, 55);
    // Chest Carapace & Glowing Purple Core
    ctx.fillStyle = '#581c87';
    ctx.fillRect(px - 24, ty - 65, 48, 42);
    ctx.fillStyle = '#a855f7'; // Glowing chest rune
    ctx.fillRect(px - 8, ty - 54, 16, 16);
    ctx.fillStyle = '#f3e8ff';
    ctx.fillRect(px - 4, ty - 50, 8, 8);

    // Giant Shoulders
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(px - 46, ty - 76, 20, 22);
    ctx.fillRect(px + 26, ty - 76, 20, 22);
    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(px - 44, ty - 80, 16, 6);
    ctx.fillRect(px + 28, ty - 80, 16, 6);

    // Massive Arms
    const sweepOffset = attack === 'arm_sweep' ? Math.sin(attackProgress * Math.PI) * 35 : 0;
    const grabOffset = attack === 'grab' ? 20 : 0;
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(px - 44 - sweepOffset, ty - 56, 16, 42);
    ctx.fillRect(px + 28 + sweepOffset + grabOffset, ty - 56, 16, 42);

    // Heavy Claws
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(px - 46 - sweepOffset, ty - 16, 18, 12);
    ctx.fillRect(px + 28 + sweepOffset + grabOffset, ty - 16, 18, 12);

    // Head
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(px - 20, ty - 96, 40, 30);
    // Dark Crown / Horn Spikes
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(px - 26, ty - 110, 10, 18);
    ctx.fillRect(px + 16, ty - 110, 10, 18);
    ctx.fillRect(px - 6, ty - 104, 12, 10);

    // Glowing Eyes
    if (isStaggered) {
      // Recoil & pain after Ain bites hand!
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px - 14, ty - 86, 8, 4);
      ctx.fillRect(px + 6, ty - 86, 8, 4);
      // Clutched offended hand shaking!
      ctx.strokeStyle = '#fde047';
      ctx.strokeRect(px + 24, ty - 30, 22, 22);
    } else {
      ctx.fillStyle = '#fbbf24'; // Glowing golden-purple titan eyes
      ctx.fillRect(px - 14, ty - 86, 8, 5);
      ctx.fillRect(px + 6, ty - 86, 8, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 11, ty - 84, 3, 3);
      ctx.fillRect(px + 9, ty - 84, 3, 3);
    }

    // Roaring Mouth
    if (attack === 'roar' || attack === 'energy_beam') {
      ctx.fillStyle = '#7e22ce';
      ctx.fillRect(px - 12, ty - 76, 24, 10);
      ctx.fillStyle = '#f3e8ff';
      // Sharp teeth
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px - 10 + i * 5, ty - 76, 2, 3);
        ctx.fillRect(px - 10 + i * 5, ty - 69, 2, 3);
      }
    }

    ctx.restore();
  }
}
