/**
 * Main Canvas Engine for Virtual Diwali Celebration
 * Handles starfield, ground perspective, diya list, rendering loop & pointer interaction.
 */

import { Diya } from './diya.js';
import { ParticleEngine, FESTIVE_PALETTES } from './particles.js';
import { audio } from './audio.js';

export class DiwaliCanvasApp {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.diyas = [];
    this.particles = new ParticleEngine(3000);

    // Stars background
    this.stars = [];
    this.numStars = 140;

    // Viewport & Scaling
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Mode: 'diya' | 'sparkler' | 'chakri' | 'anaar' | 'rocket' | 'lantern'
    this.activeMode = 'diya';

    // Pointer state
    this.mouseX = null;
    this.mouseY = null;
    this.isPointerDown = false;
    this.lastSparklerEmit = 0;

    // Stats / callbacks
    this.onDiyaCountChange = null;

    this.init();
  }

  init() {
    this.resize();
    this.generateStars();
    this.bindEvents();
    this.startLoop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  generateStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.72), // Upper 70% of sky
        radius: Math.random() * 1.5 + 0.5,
        twinkleSpeed: 0.002 + Math.random() * 0.005,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 0.3 + Math.random() * 0.6
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.generateStars();
    });

    const updateCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.mouseX = clientX - rect.left;
      this.mouseY = clientY - rect.top;
    };

    const handlePointerStart = (e) => {
      // Audio unlock on user interaction
      audio.resume();

      updateCoords(e);
      this.isPointerDown = true;
      this.triggerInteraction(this.mouseX, this.mouseY);
    };

    const handlePointerMove = (e) => {
      updateCoords(e);
      // Sparkler trail follows cursor if sparkler mode or pointer dragged
      const now = performance.now();
      if ((this.activeMode === 'sparkler' || this.isPointerDown) && now - this.lastSparklerEmit > 30) {
        this.particles.emitSparkler(this.mouseX, this.mouseY, 4);
        audio.playSparklerCrackle();
        this.lastSparklerEmit = now;
      }
    };

    const handlePointerEnd = () => {
      this.isPointerDown = false;
    };

    this.canvas.addEventListener('mousedown', handlePointerStart);
    this.canvas.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerEnd);

    this.canvas.addEventListener('touchstart', handlePointerStart, { passive: true });
    this.canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerEnd);

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = null;
      this.mouseY = null;
    });
  }

  setMode(mode) {
    this.activeMode = mode;
  }

  triggerInteraction(x, y) {
    switch (this.activeMode) {
      case 'diya':
        this.addDiya(x, y);
        break;
      case 'sparkler':
        this.particles.emitSparkler(x, y, 16);
        audio.playSparklerCrackle();
        break;
      case 'chakri':
        this.particles.addChakri(x, y, () => audio.playChakriWhir());
        break;
      case 'anaar':
        this.particles.addAnaar(x, y, () => audio.playAnaarSizzle());
        break;
      case 'rocket':
        this.launchFirework(x, y);
        break;
      case 'lantern':
        this.particles.addLantern(x, y);
        audio.playDiyaChime();
        break;
      default:
        this.addDiya(x, y);
    }
  }

  addDiya(x, y, scale = 1.0) {
    // Dynamic scale based on perspective (lower down = closer & slightly larger)
    const perspectiveScale = scale * (0.8 + (y / this.height) * 0.45);
    const diya = new Diya(x, y, perspectiveScale);
    this.diyas.push(diya);

    // Play chime sound
    audio.playDiyaChime();

    // Small burst of birth embers
    this.particles.emitSparkler(x, y - 10, 8);

    if (this.onDiyaCountChange) {
      this.onDiyaCountChange(this.diyas.length);
    }
  }

  launchFirework(targetX, targetY) {
    const startX = targetX + (Math.random() - 0.5) * 80;
    const startY = this.height + 20;

    audio.playRocketLaunch();

    this.particles.launchRocket(startX, startY, targetX, targetY, (x, y) => {
      audio.playFireworkExplosion();
      const types = ['peony', 'willow', 'chrysanthemum'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      this.particles.explodeFirework(x, y, null, chosenType);
    });
  }

  // Grand Finale celebration
  triggerGrandCelebration() {
    audio.resume();

    // 1. Launch a burst of 7 synchronized fireworks across the sky
    const numRockets = 7;
    for (let i = 0; i < numRockets; i++) {
      setTimeout(() => {
        const targetX = (this.width * 0.15) + (i / (numRockets - 1)) * (this.width * 0.7) + (Math.random() - 0.5) * 60;
        const targetY = (this.height * 0.18) + Math.random() * (this.height * 0.35);
        this.launchFirework(targetX, targetY);
      }, i * 280);
    }

    // 2. Release 5 floating sky lanterns
    for (let j = 0; j < 5; j++) {
      setTimeout(() => {
        this.particles.addLantern(
          (this.width * 0.2) + Math.random() * (this.width * 0.6),
          this.height * 0.8
        );
      }, j * 400);
    }
  }

  clearDiyas() {
    this.diyas = [];
    this.particles.clear();
    if (this.onDiyaCountChange) {
      this.onDiyaCountChange(0);
    }
  }

  drawSkyAndFloor(now) {
    const ctx = this.ctx;

    // 1. Celestial Night Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#04020a');    // Deep cosmic void
    skyGrad.addColorStop(0.5, '#0b041a');  // Deep Midnight Indigo
    skyGrad.addColorStop(0.78, '#1b0833'); // Twilight Saffron Aura
    skyGrad.addColorStop(1, '#0c0517');    // Courtyard floor base

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Stars
    ctx.save();
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const twinkle = Math.sin((now * s.twinkleSpeed) + s.phase);
      const alpha = Math.max(0.1, s.baseAlpha + twinkle * 0.3);

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 250, 230, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();

    // 3. Courtyard Ground Horizon with Subtle Golden Rangoli Halo
    const groundY = this.height * 0.72;
    const floorGrad = ctx.createLinearGradient(0, groundY, 0, this.height);
    floorGrad.addColorStop(0, 'rgba(40, 15, 60, 0.45)');
    floorGrad.addColorStop(0.5, 'rgba(25, 10, 40, 0.75)');
    floorGrad.addColorStop(1, 'rgba(10, 4, 18, 0.95)');

    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundY, this.width, this.height - groundY);

    // Soft decorative ground horizon glow line
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(this.width, groundY);
    ctx.strokeStyle = 'rgba(255, 180, 50, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rangoli floor mandala watermark at the center
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    const cx = this.width * 0.5;
    const cy = this.height * 0.86;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 220, 75, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, 140, 48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, 60, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  startLoop() {
    const loop = (now) => {
      // 1. Draw Environment
      this.drawSkyAndFloor(now);

      // 2. Update & Draw Diyas (sorted by Y for correct isometric depth)
      this.diyas.sort((a, b) => a.y - b.y);
      for (let i = 0; i < this.diyas.length; i++) {
        const d = this.diyas[i];
        d.update(now, this.mouseX, this.mouseY);
        d.draw(this.ctx, now);
      }

      // 3. Update & Draw Particles, Fireworks, Ground Crackers & Lanterns
      this.particles.updateAndDraw(this.ctx, now);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

