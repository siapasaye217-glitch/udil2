/**
 * Procedural Web Audio API sound synthesizer and retro RPG chiptune sequencer
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentTrack: string | null = null;
  private musicTimer: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
    const saved = localStorage.getItem('ains_sound_enabled');
    if (saved !== null) {
      this.isMuted = saved === 'false';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('ains_sound_enabled', String(!this.isMuted));
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.playMusic(this.currentTrack, true);
    }
    return !this.isMuted;
  }

  public getSoundEnabled(): boolean {
    return !this.isMuted;
  }

  public setSoundEnabled(enabled: boolean) {
    if (this.isMuted === !enabled) return;
    this.toggleMute();
  }

  // --- Sound Effects ---

  public playSelect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playStep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 + Math.random() * 20, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playAttackSwing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playDodge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playStomp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    // Heavy low noise + sub oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  public playRoar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(210, this.ctx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.9);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.9);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.9);
  }

  public playBite() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    // Crunch sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.setValueAtTime(450, this.ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  public playSparkle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);
      gain.gain.setValueAtTime(0.12, this.ctx!.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx!.currentTime + idx * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + idx * 0.06);
      osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.2);
    });
  }

  public playCrash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playCheer() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    // Multi-voice cheerful fanfare
    [440, 554, 659, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.5 + i * 0.1);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start();
      osc.stop(this.ctx!.currentTime + 0.5 + i * 0.1);
    });
  }

  public playTossWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  // --- Chiptune Music Generator ---

  public stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public playMusic(track: string, force: boolean = false) {
    if (this.currentTrack === track && this.musicTimer && !force) return;
    this.currentTrack = track;
    this.stopMusic();
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.musicStep = 0;

    let melody: number[] = [];
    let intervalMs = 240;

    if (track === 'title' || track === 'opening') {
      // Whimsical ascending melodic motif (C major / G major)
      melody = [261.6, 329.6, 392.0, 523.2, 392.0, 329.6, 440.0, 392.0, 349.2, 329.6, 293.7, 329.6, 261.6, 0, 392.0, 523.2];
      intervalMs = 220;
    } else if (track === 'village') {
      // Cozy, lively peaceful village walking theme
      melody = [329.6, 392.0, 440.0, 523.2, 440.0, 392.0, 329.6, 293.7, 329.6, 392.0, 349.2, 329.6, 293.7, 261.6, 293.7, 329.6];
      intervalMs = 240;
    } else if (track === 'gift') {
      // Gentle, friendly motif
      melody = [440, 493.9, 523.3, 587.3, 523.3, 493.9, 440, 392, 440, 523.3, 587.3, 659.3, 587.3, 523.3, 440, 0];
      intervalMs = 260;
    } else if (track === 'transformation') {
      // Dark ominous chromatic descent
      melody = [196.0, 185.0, 174.6, 164.8, 155.6, 146.8, 138.6, 130.8, 123.5, 116.5, 110.0, 98.0, 87.3, 82.4, 73.4, 65.4];
      intervalMs = 200;
    } else if (track === 'rampage') {
      // Urgent, fast, dramatic chase rhythm
      melody = [174.6, 220.0, 261.6, 174.6, 246.9, 220.0, 174.6, 196.0, 174.6, 220.0, 261.6, 293.7, 246.9, 220.0, 196.0, 164.8];
      intervalMs = 150;
    } else if (track === 'boss') {
      // Intense heroic boss theme
      melody = [220, 261.6, 329.6, 220, 349.2, 329.6, 293.7, 261.6, 220, 293.7, 349.2, 440, 392, 349.2, 329.6, 293.7];
      intervalMs = 170;
    } else if (track === 'restoration') {
      // Gentle uplifting magical sparkle
      melody = [523.2, 659.2, 784.0, 987.8, 1046.5, 784.0, 880.0, 1046.5, 659.2, 784.0, 880.0, 987.8, 1046.5, 1174.7, 1318.5, 1046.5];
      intervalMs = 220;
    } else if (track === 'celebration') {
      // Joyful celebratory festival beat
      melody = [523.2, 523.2, 659.2, 784.0, 784.0, 659.2, 880.0, 987.8, 1046.5, 987.8, 880.0, 784.0, 659.2, 587.3, 523.2, 0];
      intervalMs = 200;
    } else if (track === 'birthday_tune') {
      // Cheerful original birthday style melody (celebratory, playful, heartwarming)
      // C C D C F E | C C D C G F | C C C' A F E D | Bb Bb A F G F
      melody = [
        261.6, 261.6, 293.7, 261.6, 349.2, 329.6, 0,
        261.6, 261.6, 293.7, 261.6, 392.0, 349.2, 0,
        261.6, 261.6, 523.2, 440.0, 349.2, 329.6, 293.7, 0,
        466.2, 466.2, 440.0, 349.2, 392.0, 349.2, 0, 0
      ];
      intervalMs = 240;
    } else if (track === 'sunset') {
      // Warm, emotional, tranquil sunset melody
      melody = [392.0, 440.0, 493.9, 587.3, 493.9, 440.0, 392.0, 329.6, 349.2, 392.0, 440.0, 392.0, 329.6, 293.7, 261.6, 0];
      intervalMs = 320;
    }

    const playNextNote = () => {
      if (this.isMuted || !this.ctx) return;
      const freq = melody[this.musicStep % melody.length];
      this.musicStep++;

      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = track === 'boss' || track === 'rampage' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + intervalMs / 1000 * 0.9);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + intervalMs / 1000 * 0.9);
      }
    };

    playNextNote();
    this.musicTimer = window.setInterval(playNextNote, intervalMs);
  }
}

export const soundManager = new SoundManager();
