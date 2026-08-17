class SoundManager {
  private enabled: boolean = true;
  private audioCache: Record<string, HTMLAudioElement> = {};
  private activeSpinAudio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;

  constructor() {
    // Lazy initialize HTML5 Audio elements
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(force?: boolean): boolean {
    this.enabled = force !== undefined ? force : !this.enabled;
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private playAudioFile(fileName: string, volume: number = 0.3, fallbackOscillator?: () => void) {
    if (!this.enabled) return;

    try {
      const path = `/sounds/${fileName}`;
      let audio = this.audioCache[path];
      if (!audio) {
        audio = new Audio(path);
        this.audioCache[path] = audio;
      }
      const clone = audio.cloneNode() as HTMLAudioElement;
      // Cut volume in half for comfortable pleasant playback
      clone.volume = Math.max(0, Math.min(1, volume * 0.5));
      clone.play().catch(() => {
        if (fallbackOscillator) fallbackOscillator();
      });
    } catch {
      if (fallbackOscillator) fallbackOscillator();
    }
  }

  // 1. Crisp Short Retro 8-Bit Click SFX
  public playClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch {}
  }

  // 2. Slot Machine Lever Pull & Reel Spin SFX (slotmachine.mp3)
  public playLeverPull() {
    if (!this.enabled) return;
    try {
      if (this.activeSpinAudio) {
        this.activeSpinAudio.pause();
        this.activeSpinAudio.currentTime = 0;
      }
      const audio = new Audio('/sounds/slotmachine.mp3');
      audio.volume = 0.12; // Gentle volume for comfortable playback
      this.activeSpinAudio = audio;
      audio.play().catch(() => this.playOscillatorLever());
    } catch {
      this.playOscillatorLever();
    }
  }

  // Smoothly fade out slot spin sound (150ms fade) when reels lock into place so audio never cuts off abruptly
  public stopSlotSpinSound() {
    if (this.activeSpinAudio) {
      const audioToStop = this.activeSpinAudio;
      this.activeSpinAudio = null;
      try {
        const startVol = audioToStop.volume;
        const steps = 10;
        const intervalTime = 15; // 150ms total smooth fade out
        let step = 0;
        const fadeInterval = setInterval(() => {
          step++;
          audioToStop.volume = Math.max(0, startVol * (1 - step / steps));
          if (step >= steps) {
            clearInterval(fadeInterval);
            audioToStop.pause();
            audioToStop.currentTime = 0;
          }
        }, intervalTime);
      } catch {
        try {
          audioToStop.pause();
          audioToStop.currentTime = 0;
        } catch {}
      }
    }
  }

  // 3. Reel Spin Tick SFX
  public playReelSpinTick() {
    this.playAudioFile('swish.mp3', 0.15);
  }

  // 4. Reel Lock & Defense SFX
  public playReelLock() {
    this.playAudioFile('defense.mp3', 0.25);
  }

  public playDefense() {
    this.playAudioFile('defense.mp3', 0.3);
  }

  // 5. Slash Attack / Weapon Damage SFX (slash_attack1.mp3)
  public playSlashAttack() {
    this.playAudioFile('slash_attack.mp3', 0.3);
  }

  // 6. Hit Impact SFX (damage4.mp3)
  public playHitImpact() {
    this.playAudioFile('damage.mp3', 0.3, () => this.playOscillatorHit());
  }

  // 7. Heavy Punch SFX (heavy_punch1.mp3)
  public playHeavyPunch() {
    this.playAudioFile('heavy_punch.mp3', 0.3);
  }

  // 8. Gentle Retro Victory Chime (DO NOT USE final_attack.mp3 per user request)
  public playJackpotSound() {
    if (!this.enabled) return;
    this.playOscillatorJackpot();
  }

  // ---------- Web Audio API Synthesizer Fallbacks ----------
  private playOscillatorClick() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  private playOscillatorLever() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  private playOscillatorHit() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  private playOscillatorJackpot() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
      });
    } catch {}
  }
}

export const soundManager = new SoundManager();
