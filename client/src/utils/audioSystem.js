/**
 * SPACE SHOOTER ODYSSEY — High-Tech Web Audio Synthesizer
 * Provides pure Web Audio synthesized sound effects and ambient sci-fi music
 * with volume controls, muting, and preference persistence.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.sfxVolume = parseFloat(localStorage.getItem('odyssey_sfx_vol') || '0.7');
    this.musicVolume = parseFloat(localStorage.getItem('odyssey_music_vol') || '0.5');
    this.muted = localStorage.getItem('odyssey_muted') === 'true';
    this.musicNode = null;
    this.musicGain = null;
    this.isMusicPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    localStorage.setItem('odyssey_sfx_vol', this.sfxVolume.toString());
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    localStorage.setItem('odyssey_music_vol', this.musicVolume.toString());
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * 0.3, this.ctx?.currentTime || 0);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('odyssey_muted', this.muted.toString());
    if (this.musicGain) {
      this.musicGain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * 0.3, this.ctx?.currentTime || 0);
    }
    return this.muted;
  }

  playLaser(type = 'player') {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    if (type === 'player') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);
    }

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  playExplosion(intensity = 'medium') {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const duration = intensity === 'boss' ? 0.8 : intensity === 'large' ? 0.5 : 0.28;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(intensity === 'boss' ? 250 : 450, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * (intensity === 'boss' ? 0.6 : 0.35), this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playPickup(kind = 'credit') {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (kind === 'powerup') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
    } else {
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    }

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'powerup' ? 0.36 : 0.2));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (kind === 'powerup' ? 0.36 : 0.2));
  }

  playPowerupActivate() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playUiClick() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playVictory() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  playDefeat() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const notes = [350, 280, 210, 140];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.16;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  startAmbientMusic() {
    if (this.isMusicPlaying) return;
    this.init();
    if (!this.ctx) return;

    try {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * 0.2, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);

      // Low frequency ambient cosmic drone
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 note

      osc1.connect(this.musicGain);
      osc2.connect(this.musicGain);

      osc1.start();
      osc2.start();

      this.musicOscs = [osc1, osc2];
      this.isMusicPlaying = true;
    } catch (e) {
      console.warn('Could not start ambient music:', e);
    }
  }

  stopAmbientMusic() {
    if (this.musicOscs) {
      this.musicOscs.forEach(o => {
        try { o.stop(); } catch (_) {}
      });
      this.musicOscs = null;
    }
    this.isMusicPlaying = false;
  }
}

export const soundSystem = new SoundSystem();
