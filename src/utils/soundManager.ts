type MusicTrack = 'backmusic' | 'boss';

class SoundManager {
  private enabled = true;
  private sfxVolume = 1;
  private musicVolume = 0.22;
  private audioCache: Record<string, HTMLAudioElement> = {};
  private activeSpinAudio: HTMLAudioElement | null = null;
  private musicAudio: HTMLAudioElement | null = null;
  private activeMusicTrack: MusicTrack | null = null;
  private pendingMusicTrack: MusicTrack | null = null;
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public unlockAudio() {
    if (!this.enabled) return;
    this.initCtx();
    if (this.pendingMusicTrack) {
      const track = this.pendingMusicTrack;
      this.pendingMusicTrack = null;
      this.startMusic(track);
      return;
    }
    this.playSafely(this.musicAudio);
  }

  public toggleSound(force?: boolean): boolean {
    this.enabled = force !== undefined ? force : !this.enabled;
    if (!this.enabled) {
      this.pauseMusic();
      this.stopSlotSpinSound();
    } else {
      this.playSafely(this.musicAudio);
    }
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicVolume(volume: number): number {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicAudio) {
      this.musicAudio.volume = this.musicVolume;
    }
    return this.musicVolume;
  }

  public startBackgroundMusic() {
    this.startMusic('backmusic');
  }

  public startBossMusic() {
    this.startMusic('boss');
  }

  public stopMusic() {
    this.pauseMusic();
    this.musicAudio = null;
    this.activeMusicTrack = null;
  }

  private startMusic(track: MusicTrack) {
    if (!this.enabled) {
      return;
    }

    if (this.activeMusicTrack === track && this.musicAudio) {
      this.playSafely(this.musicAudio);
      return;
    }

    this.pauseMusic();
    this.pendingMusicTrack = null;

    const audio = new Audio(track === 'boss' ? '/sounds/boss_bgm_40.mp3' : '/sounds/backmusic.mp3');
    audio.volume = this.musicVolume;
    audio.loop = track === 'backmusic';
    audio.preload = 'auto';

    if (track === 'boss') {
      audio.addEventListener('ended', () => {
        audio.currentTime = 40;
        this.playSafely(audio);
      });
    }

    this.musicAudio = audio;
    this.activeMusicTrack = track;
    this.playSafely(audio);
  }

  private playSafely(audio: HTMLAudioElement | null | undefined, fallbackOscillator?: () => void) {
    if (!audio) {
      return;
    }
    if (this.isTestMediaEnvironment()) {
      return;
    }

    try {
      const result = audio.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          if (this.musicAudio === audio && this.activeMusicTrack) {
            this.pendingMusicTrack = this.activeMusicTrack;
          }
          if (fallbackOscillator) fallbackOscillator();
        });
      }
    } catch {
      if (fallbackOscillator) fallbackOscillator();
    }
  }

  private pauseMusic() {
    if (!this.musicAudio) {
      return;
    }
    if (this.isTestMediaEnvironment()) {
      return;
    }

    try {
      this.musicAudio.pause();
    } catch {}
  }

  private isTestMediaEnvironment(): boolean {
    return typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
  }

  private playAudioFile(fileName: string, volume: number = 0.3, fallbackOscillator?: () => void) {
    if (!this.enabled) return;
    this.initCtx();

    try {
      const path = `/sounds/${fileName}`;
      let audio = this.audioCache[path];
      if (!audio) {
        audio = new Audio(path);
        this.audioCache[path] = audio;
      }
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = Math.max(0, Math.min(1, volume * this.sfxVolume));
      this.playSafely(clone, fallbackOscillator);
    } catch {
      if (fallbackOscillator) fallbackOscillator();
    }
  }

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

  public playLeverPull() {
    if (!this.enabled) return;
    this.initCtx();
    try {
      if (this.activeSpinAudio) {
        this.activeSpinAudio.pause();
        this.activeSpinAudio.currentTime = 0;
      }
      const audio = new Audio('/sounds/slotmachine.mp3');
      audio.preload = 'auto';
      audio.volume = 0.78 * this.sfxVolume;
      this.activeSpinAudio = audio;
      this.playSafely(audio, () => this.playOscillatorLever());
    } catch {
      this.playOscillatorLever();
    }
  }

  public stopSlotSpinSound() {
    if (this.activeSpinAudio) {
      const audioToStop = this.activeSpinAudio;
      this.activeSpinAudio = null;
      try {
        const startVol = audioToStop.volume;
        const steps = 10;
        const intervalTime = 15;
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

  public playReelSpinTick() {
    this.playAudioFile('swish.mp3', 0.42, () => this.playOscillatorTick());
  }

  public playReelLock() {
    this.playAudioFile('defense.mp3', 0.52, () => this.playOscillatorTick());
  }

  public playDefense() {
    this.playAudioFile('defense.mp3', 0.75, () => this.playOscillatorHit());
  }

  public playSlashAttack() {
    this.playAudioFile('slash_attack.mp3', 0.82, () => this.playOscillatorHit());
  }

  public playHitImpact() {
    this.playAudioFile('damage.mp3', 0.72, () => this.playOscillatorHit());
  }

  public playHeavyPunch() {
    this.playAudioFile('heavy_punch.mp3', 0.78, () => this.playOscillatorHit());
  }

  public playBombExplosion() {
    this.playAudioFile('final_attack.mp3', 0.88, () => this.playOscillatorBomb());
  }

  public playJackpotSound() {
    if (!this.enabled) return;
    this.playOscillatorJackpot();
  }

  private playOscillatorBomb() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
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

      gain.gain.setValueAtTime(0.1 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  private playOscillatorTick() {
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(760, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.09 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
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

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
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
        const startAt = this.ctx.currentTime + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);

        gain.gain.setValueAtTime(0.08 * this.sfxVolume, startAt);
        gain.gain.exponentialRampToValueAtTime(0.005, startAt + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + 0.2);
      });
    } catch {}
  }
}

export const soundManager = new SoundManager();
