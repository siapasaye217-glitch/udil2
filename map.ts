/**
 * Map generation, terrain tiles, scenery objects, destructibles, and collision detection
 */

import { DestructibleObject, InteractiveObject, VillagerNPC } from './types';
import { MAP_WIDTH, MAP_HEIGHT } from './constants';

export interface SceneryEntity {
  type: 'tree' | 'house' | 'fountain' | 'bench' | 'flower_bed' | 'lantern' | 'castle_gate' | 'castle_tower' | 'table';
  x: number;
  y: number;
  width: number;
  height: number;
  solid: boolean;
}

export class GameMap {
  public width = MAP_WIDTH;
  public height = MAP_HEIGHT;

  public scenery: SceneryEntity[] = [];
  public destructibles: DestructibleObject[] = [];
  public interactives: InteractiveObject[] = [];
  public npcs: VillagerNPC[] = [];

  constructor() {
    this.initScenery();
    this.initDestructibles();
    this.initInteractives();
    this.initNpcs();
  }

  private initScenery() {
    // Castle Courtyard & Walls in the North (Y: 40 - 180)
    this.scenery.push(
      { type: 'castle_tower', x: 200, y: 50, width: 90, height: 110, solid: true },
      { type: 'castle_gate', x: 500, y: 40, width: 200, height: 120, solid: true },
      { type: 'castle_tower', x: 910, y: 50, width: 90, height: 110, solid: true }
    );

    // Residential Houses
    this.scenery.push(
      { type: 'house', x: 120, y: 260, width: 120, height: 100, solid: true },
      { type: 'house', x: 120, y: 440, width: 120, height: 100, solid: true },
      { type: 'house', x: 940, y: 260, width: 130, height: 100, solid: true },
      { type: 'house', x: 940, y: 440, width: 130, height: 100, solid: true },
      { type: 'house', x: 800, y: 720, width: 120, height: 100, solid: true }
    );

    // Central Square Fountain (Center at ~600, 480)
    this.scenery.push(
      { type: 'fountain', x: 560, y: 440, width: 80, height: 70, solid: true }
    );

    // Flower Garden Starting Area (Southwest: X: 150 - 450, Y: 720 - 920)
    this.scenery.push(
      { type: 'flower_bed', x: 220, y: 760, width: 60, height: 35, solid: false },
      { type: 'flower_bed', x: 340, y: 760, width: 60, height: 35, solid: false },
      { type: 'flower_bed', x: 280, y: 840, width: 70, height: 35, solid: false },
      { type: 'bench', x: 380, y: 830, width: 45, height: 25, solid: false }
    );

    // Celebration Area / Picnic Tables (Southeast of square)
    this.scenery.push(
      { type: 'table', x: 740, y: 460, width: 60, height: 35, solid: false },
      { type: 'bench', x: 740, y: 505, width: 60, height: 20, solid: false }
    );

    // Decorative Trees along paths and borders
    const treePositions = [
      { x: 40, y: 150 }, { x: 40, y: 320 }, { x: 40, y: 560 }, { x: 40, y: 780 },
      { x: 1120, y: 150 }, { x: 1120, y: 350 }, { x: 1120, y: 580 }, { x: 1120, y: 780 },
      { x: 320, y: 240 }, { x: 840, y: 240 }, { x: 450, y: 650 }, { x: 750, y: 650 },
      { x: 150, y: 880 }, { x: 480, y: 880 }, { x: 650, y: 880 }
    ];
    treePositions.forEach(pos => {
      this.scenery.push({
        type: 'tree',
        x: pos.x,
        y: pos.y,
        width: 50,
        height: 65,
        solid: true
      });
    });

    // Street Lanterns
    const lanternPositions = [
      { x: 480, y: 360 }, { x: 720, y: 360 },
      { x: 480, y: 580 }, { x: 720, y: 580 },
      { x: 450, y: 740 }, { x: 750, y: 740 }
    ];
    lanternPositions.forEach(pos => {
      this.scenery.push({
        type: 'lantern',
        x: pos.x,
        y: pos.y,
        width: 16,
        height: 28,
        solid: true
      });
    });
  }

  private initDestructibles() {
    // Fences and market stalls that the Shadow Titan breaks during rampage
    this.destructibles = [
      // Market stalls near square
      { id: 'stall_1', type: 'stall', x: 420, y: 430, width: 60, height: 40, destroyed: false, restoreProgress: 0 },
      { id: 'stall_2', type: 'stall', x: 420, y: 510, width: 60, height: 40, destroyed: false, restoreProgress: 0 },
      // Barrels & crates
      { id: 'barrel_1', type: 'barrel', x: 500, y: 440, width: 24, height: 26, destroyed: false, restoreProgress: 0 },
      { id: 'barrel_2', type: 'barrel', x: 700, y: 430, width: 24, height: 26, destroyed: false, restoreProgress: 0 },
      { id: 'crates_1', type: 'crates', x: 510, y: 530, width: 28, height: 24, destroyed: false, restoreProgress: 0 },
      // Wooden fences
      { id: 'fence_1', type: 'fence', x: 420, y: 340, width: 70, height: 18, destroyed: false, restoreProgress: 0 },
      { id: 'fence_2', type: 'fence', x: 710, y: 340, width: 70, height: 18, destroyed: false, restoreProgress: 0 },
      // Cracked cobblestone markings
      { id: 'crack_1', type: 'crack', x: 580, y: 400, width: 40, height: 30, destroyed: false, restoreProgress: 0 }
    ];
  }

  private initInteractives() {
    this.interactives = [
      {
        id: 'fountain_insp',
        x: 570,
        y: 450,
        width: 60,
        height: 50,
        name: 'Grand Fountain',
        prompt: 'Inspect Fountain',
        dialogue: [
          { speaker: 'Ain', text: 'Crystal clear water! Someone tossed in a shiny coin with a birthday wish.', emotion: 'happy' }
        ]
      },
      {
        id: 'flower_insp',
        x: 230,
        y: 770,
        width: 40,
        height: 25,
        name: 'Flower Patch',
        prompt: 'Inspect Flowers',
        dialogue: [
          { speaker: 'Ain', text: 'Golden buttercups and sweet jasmine. Five-star landing zone indeed!', emotion: 'cheerful' }
        ]
      },
      {
        id: 'bday_banner',
        x: 670,
        y: 450,
        width: 60,
        height: 30,
        name: 'Birthday Table',
        prompt: 'Inspect Party Table',
        dialogue: [
          { speaker: 'Ain', text: 'Colorful party ribbons and wooden benches. Someone is planning a feast!', emotion: 'happy' }
        ]
      }
    ];
  }

  private initNpcs() {
    this.npcs = [
      {
        id: 'villager_guard',
        name: 'Sir Brawn',
        x: 480,
        y: 200,
        startX: 480,
        startY: 200,
        fleeTargetX: 180,
        fleeTargetY: 280,
        facing: 'down',
        walkTimer: 0,
        speed: 1.2,
        colorTheme: '#64748b',
        hairColor: '#000000',
        isGuard: true,
        dialogue: [
          { speaker: 'Sir Brawn', text: "Happy Birthday, Lady Ain! The perimeter is secure. Or at least... I hope it is.", emotion: 'cheerful' }
        ]
      },
      {
        id: 'villager_baker',
        name: 'Baker Tilly',
        x: 400,
        y: 410,
        startX: 400,
        startY: 410,
        fleeTargetX: 980,
        fleeTargetY: 280,
        facing: 'right',
        walkTimer: 0,
        speed: 1.0,
        colorTheme: '#ca8a04',
        hairColor: '#f59e0b',
        isShopkeeper: true,
        hasApples: true,
        dialogue: [
          { speaker: 'Baker Tilly', text: "Ain! Fresh honey-glazed strawberry tarts today in honor of your special day!", emotion: 'happy' }
        ]
      },
      {
        id: 'villager_elder',
        name: 'Elder Rowan',
        x: 740,
        y: 420,
        startX: 740,
        startY: 420,
        fleeTargetX: 840,
        fleeTargetY: 740,
        facing: 'left',
        walkTimer: 0,
        speed: 0.8,
        colorTheme: '#15803d',
        hairColor: '#e2e8f0',
        dialogue: [
          { speaker: 'Elder Rowan', text: "Aidil has been fidgeting by the central square with a wrapped present all morning. You should go see him!", emotion: 'cheerful' }
        ]
      },
      {
        id: 'villager_child',
        name: 'Pip',
        x: 320,
        y: 800,
        startX: 320,
        startY: 800,
        fleeTargetX: 160,
        fleeTargetY: 460,
        facing: 'up',
        walkTimer: 0,
        speed: 1.1,
        colorTheme: '#0284c7',
        hairColor: '#b45309',
        dialogue: [
          { speaker: 'Pip', text: "I saw three angels flying in the sky earlier! Did they bring you birthday superpowers?", emotion: 'happy' }
        ]
      }
    ];
  }

  /**
   * Check collision against world boundaries, scenery objects, and intact destructibles
   */
  public checkCollision(x: number, y: number, radius: number = 8): boolean {
    // Map Boundaries
    if (x - radius < 60 || x + radius > this.width - 60 || y - radius < 60 || y + radius > this.height - 60) {
      return true;
    }

    // Scenery collision (solid bounding boxes)
    for (const s of this.scenery) {
      if (!s.solid) continue;
      // Truncate bottom/footprint for trees/houses so players can walk slightly in front
      const collisionY = s.type === 'tree' ? s.y + s.height * 0.5 : s.type === 'house' ? s.y + s.height * 0.35 : s.y;
      const collisionH = s.type === 'tree' ? s.height * 0.5 : s.type === 'house' ? s.height * 0.65 : s.height;

      if (
        x + radius > s.x &&
        x - radius < s.x + s.width &&
        y + radius > collisionY &&
        y - radius < collisionY + collisionH
      ) {
        return true;
      }
    }

    // Intact destructible objects (stalls, barrels, fences)
    for (const d of this.destructibles) {
      if (d.destroyed) continue;
      if (
        x + radius > d.x &&
        x - radius < d.x + d.width &&
        y + radius > d.y &&
        y - radius < d.y + d.height
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Render the top-down RPG map terrain, cobblestone paths, flowers, and buildings
   */
  public renderTerrain(ctx: CanvasRenderingContext2D, viewX: number, viewY: number, viewW: number, viewH: number) {
    // Base lush green textured grass
    ctx.fillStyle = '#22543d'; // Rich forest green
    ctx.fillRect(viewX, viewY, viewW, viewH);

    // Subtle grass texture patches
    ctx.fillStyle = '#1c4935';
    for (let gx = Math.floor(viewX / 64) * 64; gx < viewX + viewW; gx += 64) {
      for (let gy = Math.floor(viewY / 64) * 64; gy < viewY + viewH; gy += 64) {
        ctx.fillRect(gx + 8, gy + 12, 18, 14);
        ctx.fillRect(gx + 36, gy + 38, 22, 16);
      }
    }

    // Scattered tiny wildflowers across grass
    ctx.fillStyle = '#fde047'; // Yellow buttercups
    for (let fx = Math.floor(viewX / 80) * 80; fx < viewX + viewW; fx += 80) {
      for (let fy = Math.floor(viewY / 80) * 80; fy < viewY + viewH; fy += 80) {
        ctx.fillRect(fx + 15, fy + 20, 3, 3);
        ctx.fillRect(fx + 55, fy + 45, 3, 3);
      }
    }
    ctx.fillStyle = '#f472b6'; // Pink flowers
    for (let fx = Math.floor(viewX / 90) * 90; fx < viewX + viewW; fx += 90) {
      for (let fy = Math.floor(viewY / 90) * 90; fy < viewY + viewH; fy += 90) {
        ctx.fillRect(fx + 30, fy + 60, 3, 3);
      }
    }

    // Cobblestone Pathways connecting areas
    // Central Square: 480 to 720 X, 360 to 600 Y
    this.renderCobblestoneRect(ctx, 460, 340, 280, 280);
    // North Road to Castle
    this.renderCobblestoneRect(ctx, 560, 160, 80, 180);
    // South Road to Garden
    this.renderCobblestoneRect(ctx, 560, 620, 80, 240);
    // West Road
    this.renderCobblestoneRect(ctx, 240, 460, 220, 80);
    // East Road
    this.renderCobblestoneRect(ctx, 740, 460, 200, 80);
    // Southwest path to flower garden
    this.renderCobblestoneRect(ctx, 260, 720, 300, 60);

    // Render Scenery objects
    for (const s of this.scenery) {
      this.renderSceneryItem(ctx, s);
    }

    // Render Destructible objects
    for (const d of this.destructibles) {
      this.renderDestructibleItem(ctx, d);
    }
  }

  private renderCobblestoneRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Base stone grey
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#475569';
    // Cobblestone stone grid pattern
    for (let cx = x; cx < x + w; cx += 16) {
      for (let cy = y; cy < y + h; cy += 12) {
        const offset = ((cy / 12) % 2) * 8;
        ctx.fillRect(cx + offset, cy, 14, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx + offset + 1, cy + 1, 4, 3);
        ctx.fillStyle = '#475569';
      }
    }
  }

  private renderSceneryItem(ctx: CanvasRenderingContext2D, s: SceneryEntity) {
    if (s.type === 'tree') {
      // Tree trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(s.x + 18, s.y + 35, 14, 28);
      // Layered leafy green canopy
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(s.x + 25, s.y + 26, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(s.x + 23, s.y + 22, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(s.x + 20, s.y + 16, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.type === 'house') {
      // Medieval stone/timber house with red clay roof
      // Walls
      ctx.fillStyle = '#d4d4d8';
      ctx.fillRect(s.x, s.y + 35, s.width, s.height - 35);
      // Timber beams
      ctx.fillStyle = '#78350f';
      ctx.fillRect(s.x, s.y + 35, 6, s.height - 35);
      ctx.fillRect(s.x + s.width - 6, s.y + 35, 6, s.height - 35);
      ctx.fillRect(s.x + s.width / 2 - 3, s.y + 35, 6, s.height - 35);
      // Door
      ctx.fillStyle = '#92400e';
      ctx.fillRect(s.x + s.width / 2 - 12, s.y + s.height - 28, 24, 28);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(s.x + s.width / 2 + 5, s.y + s.height - 15, 3, 3); // Doorknob
      // Windows
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(s.x + 16, s.y + 48, 16, 16);
      ctx.fillRect(s.x + s.width - 32, s.y + 48, 16, 16);
      // Roof
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(s.x - 8, s.y + 38);
      ctx.lineTo(s.x + s.width / 2, s.y);
      ctx.lineTo(s.x + s.width + 8, s.y + 38);
      ctx.closePath();
      ctx.fill();
      // Chimney
      ctx.fillStyle = '#57534e';
      ctx.fillRect(s.x + 18, s.y + 6, 12, 18);
    } else if (s.type === 'fountain') {
      // Stone basin
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(s.x + s.width / 2, s.y + s.height / 2, s.width / 2, s.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Water
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(s.x + s.width / 2, s.y + s.height / 2, s.width / 2 - 6, s.height / 2 - 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Center pedestal & jet
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(s.x + s.width / 2 - 6, s.y + s.height / 2 - 14, 12, 14);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(s.x + s.width / 2 - 2, s.y + s.height / 2 - 22, 4, 8);
    } else if (s.type === 'castle_gate') {
      // Grand stone castle gate
      ctx.fillStyle = '#475569';
      ctx.fillRect(s.x, s.y, s.width, s.height);
      // Battlements
      ctx.fillStyle = '#334155';
      for (let i = 0; i < s.width; i += 24) {
        ctx.fillRect(s.x + i, s.y - 12, 14, 12);
      }
      // Archway
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(s.x + s.width / 2 - 36, s.y + 30, 72, s.height - 30);
      // Iron portcullis bars
      ctx.fillStyle = '#94a3b8';
      for (let j = 0; j < 6; j++) {
        ctx.fillRect(s.x + s.width / 2 - 32 + j * 12, s.y + 30, 3, s.height - 30);
      }
    } else if (s.type === 'castle_tower') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(s.x, s.y, s.width, s.height);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(s.x - 6, s.y - 14, s.width + 12, 14);
      // Banner
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(s.x + s.width / 2 - 8, s.y + 20, 16, 32);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(s.x + s.width / 2 - 4, s.y + 28, 8, 8);
    } else if (s.type === 'lantern') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(s.x + 6, s.y + 10, 4, 18);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(s.x + 3, s.y, 10, 10);
    } else if (s.type === 'bench') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(s.x, s.y + 6, s.width, 10);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(s.x + 4, s.y + 16, 4, 8);
      ctx.fillRect(s.x + s.width - 8, s.y + 16, 4, 8);
    } else if (s.type === 'table') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(s.x, s.y, s.width, s.height - 10);
      // Party tablecloth
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(s.x + 4, s.y + 2, s.width - 8, s.height - 14);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(s.x + 6, s.y + s.height - 10, 6, 10);
      ctx.fillRect(s.x + s.width - 12, s.y + s.height - 10, 6, 10);
    }
  }

  private renderDestructibleItem(ctx: CanvasRenderingContext2D, d: DestructibleObject) {
    if (d.destroyed) {
      // Render debris, splintered wood, scattered fruit/rubble
      ctx.save();
      if (d.type === 'stall') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(d.x, d.y + 20, 24, 6);
        ctx.fillRect(d.x + 30, d.y + 12, 28, 6);
        // Scattered fruit
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(d.x + 10, d.y + 8, 4, 4);
        ctx.fillRect(d.x + 22, d.y + 24, 4, 4);
        ctx.fillRect(d.x + 45, d.y + 18, 4, 4);
      } else if (d.type === 'barrel') {
        // Rolled on side
        ctx.fillStyle = '#78350f';
        ctx.fillRect(d.x - 4, d.y + 10, 28, 12);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(d.x + 2, d.y + 10, 3, 12);
        ctx.fillRect(d.x + 18, d.y + 10, 3, 12);
      } else if (d.type === 'fence') {
        // Broken broken fence planks
        ctx.fillStyle = '#92400e';
        ctx.fillRect(d.x, d.y + 8, 18, 4);
        ctx.fillRect(d.x + 24, d.y + 12, 16, 4);
        ctx.fillRect(d.x + 46, d.y + 6, 20, 4);
      } else if (d.type === 'crack') {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + 18, d.y + 14);
        ctx.lineTo(d.x + 12, d.y + 24);
        ctx.lineTo(d.x + 32, d.y + 28);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // Intact items
    if (d.type === 'stall') {
      // Wooden stall with striped awning
      ctx.fillStyle = '#78350f';
      ctx.fillRect(d.x, d.y + 14, d.width, d.height - 14);
      // Awning
      for (let i = 0; i < d.width; i += 12) {
        ctx.fillStyle = (i / 12) % 2 === 0 ? '#ef4444' : '#ffffff';
        ctx.fillRect(d.x + i, d.y, 12, 14);
      }
      // Wares on counter
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(d.x + 8, d.y + 12, 10, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(d.x + 26, d.y + 12, 8, 4);
    } else if (d.type === 'barrel') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(d.x, d.y, d.width, d.height);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(d.x, d.y + 4, d.width, 3);
      ctx.fillRect(d.x, d.y + d.height - 7, d.width, 3);
    } else if (d.type === 'fence') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(d.x, d.y + 4, d.width, 4);
      ctx.fillRect(d.x, d.y + 12, d.width, 4);
      for (let fx = d.x; fx <= d.x + d.width - 6; fx += 16) {
        ctx.fillRect(fx, d.y, 6, d.height);
      }
    } else if (d.type === 'crates') {
      ctx.fillStyle = '#a16207';
      ctx.fillRect(d.x, d.y, d.width, d.height);
      ctx.strokeStyle = '#713f12';
      ctx.strokeRect(d.x + 1, d.y + 1, d.width - 2, d.height - 2);
    }
  }
}
