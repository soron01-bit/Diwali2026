/**
 * Web Audio API Procedural Sound Engine for Virtual Diwali Celebration
 * Zero external audio dependencies - 100% offline, zero lag, zero 404s.
 */

class DiwaliAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isInitialized = false;
    this.ambientGain = null;
    this.ambientNodes = [];
    this.sfxGain = null;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master SFX gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.ctx.destination);

      // Ambient BGM gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0;
      this.ambientGain.connect(this.ctx.destination);

      this.setupAmbientDrone();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.resume();
    this.isMuted = !this.isMuted;
    if (!this.ambientGain) return this.isMuted;

    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0, now + 0.5);
    } else {
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0.28, now + 1.2);
    }
    return this.isMuted;
  }

  setMuted(muted) {
    if (this.isMuted === muted) return;
    this.toggleMute();
  }

  // Meditative Indian Classical Drone (Tanpura-style harmonics in D major)
  setupAmbientDrone() {
    if (!this.ctx) return;
    // Base frequencies: D2 (73.42Hz), A2 (110.0Hz), D3 (146.83Hz), F#3 (185.0Hz)
    const baseFreqs = [73.42, 110.0, 146.83, 185.0, 220.0];

    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Filter to create warm wood acoustic texture
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 + idx * 80, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Subtle LFO for natural acoustic breathing
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq * 0.015, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();
      this.ambientNodes.push({ osc, gain, filter, lfo });
    });
  }

  // Diya Ignition: Friction strike + warm sacred bell chime
  playDiyaChime() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;

    // 1. Strike whoosh
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, now);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);

    // 2. Sacred Crystal Bell Chime (Raag pentatonic notes: D5, F#5, A5, B5, D6)
    const notes = [587.33, 739.99, 880.0, 987.77, 1174.66];
    const pitch = notes[Math.floor(Math.random() * notes.length)];

    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(pitch, now);
    chime.frequency.exponentialRampToValueAtTime(pitch * 0.99, now + 1.2);

    chimeGain.gain.setValueAtTime(0.22, now + 0.02);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chime.start(now + 0.02);
    chime.stop(now + 1.5);
  }

  // Sparkler (Phooljhadi) crackle burst
  playSparklerCrackle() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // Granular micro-burst of randomized sparks
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800 + Math.random() * 2400, now);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.06 + Math.random() * 0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Fireworks Launch Whistle
  playRocketLaunch() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1150, now + 0.45);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Fireworks Explosion: Sub-bass punch + sizzle reverb
  playFireworkExplosion() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    // 1. Deep Sub-bass punch
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

    subGain.gain.setValueAtTime(0.45, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // 2. Air burst crackle & rumble
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.65);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(250, now + 0.6);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  // Chakri (Ground Spinner) Whirring Sound
  playChakriWhir() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280 + Math.random() * 100, now);
    osc.frequency.linearRampToValueAtTime(650, now + 0.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Anaar (Flowerpot) Fountain Sizzle
  playAnaarSizzle() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / 10);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }
}

export const audio = new DiwaliAudioEngine();

