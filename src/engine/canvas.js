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

    // Sky theme: 'midnight' | 'twilight' | 'crimson'
    this.skyTheme = 'midnight';

    // Rangoli Guide System
    this.rangoliGuideActive = false;
    this.rangoliPoints = [];
    this.rangoliCompleted = false;
    this.onRangoliProgress = null;
    this.onRangoliComplete = null;

    // Pointer state & drag-to-draw
    this.mouseX = null;
    this.mouseY = null;
    this.isPointerDown = false;
    this.lastSparklerEmit = 0;
    this.lastDiyaX = null;
    this.lastDiyaY = null;

    // Stats / callbacks
    this.onDiyaCountChange = null;

    this.init();
  }

  init() {
    this.resize();
    this.generateStars();
    this.generateRangoliPoints();
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
    this.generateRangoliPoints();
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

  generateRangoliPoints() {
    this.rangoliPoints = [];
    const cx = this.width * 0.5;
    const cy = this.height * 0.84;
    const scale = Math.min(this.width / 950, 1.0);

    // 1. Center sacred Diya
    this.rangoliPoints.push({ id: 0, x: cx, y: cy, isLit: false });

    // 2. Inner Ring (6 points)
    const innerR = 56 * scale;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      this.rangoliPoints.push({
        id: this.rangoliPoints.length,
        x: cx + Math.cos(angle) * innerR,
        y: cy + Math.sin(angle) * (innerR * 0.44),
        isLit: false
      });
    }

    // 3. Middle Lotus Petal Ring (12 points)
    const midR = 125 * scale;
    for (let j = 0; j < 12; j++) {
      const angle = (j * Math.PI * 2) / 12;
      this.rangoliPoints.push({
        id: this.rangoliPoints.length,
        x: cx + Math.cos(angle) * midR,
        y: cy + Math.sin(angle) * (midR * 0.44),
        isLit: false
      });
    }

    // 4. Outer Lotus Tips (8 points)
    const outerR = 195 * scale;
    for (let k = 0; k < 8; k++) {
      const angle = (k * Math.PI * 2) / 8 + Math.PI / 8;
      this.rangoliPoints.push({
        id: this.rangoliPoints.length,
        x: cx + Math.cos(angle) * outerR,
        y: cy + Math.sin(angle) * (outerR * 0.44),
        isLit: false
      });
    }
  }

  toggleRangoliGuide() {
    this.rangoliGuideActive = !this.rangoliGuideActive;
    return this.rangoliGuideActive;
  }

  cycleSkyTheme() {
    const themes = ['midnight', 'twilight', 'crimson'];
    const nextIdx = (themes.indexOf(this.skyTheme) + 1) % themes.length;
    this.skyTheme = themes[nextIdx];
    return this.skyTheme;
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
      this.lastDiyaX = this.mouseX;
      this.lastDiyaY = this.mouseY;
      this.triggerInteraction(this.mouseX, this.mouseY);
    };

    const handlePointerMove = (e) => {
      updateCoords(e);
      const now = performance.now();

      // Sparkler trail follows cursor
      if ((this.activeMode === 'sparkler' || this.isPointerDown) && now - this.lastSparklerEmit > 30) {
        this.particles.emitSparkler(this.mouseX, this.mouseY, 4);
        audio.playSparklerCrackle();
        this.lastSparklerEmit = now;
      }

      // Drag-to-draw continuous Diya garland (distance throttled)
      if (this.isPointerDown && this.activeMode === 'diya' && this.mouseY > this.height * 0.65) {
        if (this.lastDiyaX !== null && this.lastDiyaY !== null) {
          const dist = Math.hypot(this.mouseX - this.lastDiyaX, this.mouseY - this.lastDiyaY);
          if (dist >= 52) {
            this.addDiya(this.mouseX, this.mouseY);
            this.lastDiyaX = this.mouseX;
            this.lastDiyaY = this.mouseY;
          }
        } else {
          this.lastDiyaX = this.mouseX;
          this.lastDiyaY = this.mouseY;
        }
      }
    };

    const handlePointerEnd = () => {
      this.isPointerDown = false;
      this.lastDiyaX = null;
      this.lastDiyaY = null;
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
      this.lastDiyaX = null;
      this.lastDiyaY = null;
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
    let targetX = x;
    let targetY = y;

    // Magnetic snapping to Rangoli Guide points
    if (this.rangoliGuideActive) {
      const snapThreshold = 38;
      let closestPt = null;
      let minDist = Infinity;

      for (const pt of this.rangoliPoints) {
        if (!pt.isLit) {
          const d = Math.hypot(x - pt.x, y - pt.y);
          if (d < minDist && d < snapThreshold) {
            minDist = d;
            closestPt = pt;
          }
        }
      }

      if (closestPt) {
        targetX = closestPt.x;
        targetY = closestPt.y;
        closestPt.isLit = true;

        const litCount = this.rangoliPoints.filter(p => p.isLit).length;
        if (this.onRangoliProgress) {
          this.onRangoliProgress(litCount, this.rangoliPoints.length);
        }

        if (litCount === this.rangoliPoints.length && !this.rangoliCompleted) {
          this.rangoliCompleted = true;
          audio.playTempleBells();
          this.triggerGrandCelebration();
          if (this.onRangoliComplete) {
            this.onRangoliComplete();
          }
        }
      }
    }

    // Dynamic scale based on perspective (lower down = closer & slightly larger)
    const perspectiveScale = scale * (0.8 + (targetY / this.height) * 0.45);
    const diya = new Diya(targetX, targetY, perspectiveScale);
    this.diyas.push(diya);

    // Play chime sound
    audio.playDiyaChime();

    // Small burst of birth embers
    this.particles.emitSparkler(targetX, targetY - 10, 8);

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
    this.rangoliPoints.forEach(p => p.isLit = false);
    this.rangoliCompleted = false;
    if (this.onDiyaCountChange) {
      this.onDiyaCountChange(0);
    }
    if (this.onRangoliProgress) {
      this.onRangoliProgress(0, this.rangoliPoints.length);
    }
  }

  drawSkyAndFloor(now) {
    const ctx = this.ctx;

    // 1. Celestial Night Sky Gradient (Dynamic Theme)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (this.skyTheme === 'twilight') {
      skyGrad.addColorStop(0, '#150324');    // Rich violet
      skyGrad.addColorStop(0.45, '#3b0d38'); // Twilight rose
      skyGrad.addColorStop(0.78, '#852d2b'); // Saffron sunset
      skyGrad.addColorStop(1, '#1b0616');    // Courtyard horizon
    } else if (this.skyTheme === 'crimson') {
      skyGrad.addColorStop(0, '#190310');    // Deep ruby
      skyGrad.addColorStop(0.45, '#42081f'); // Crimson festive
      skyGrad.addColorStop(0.78, '#6b1426'); // Vibrant vermilion
      skyGrad.addColorStop(1, '#1f0412');    // Warm stone floor
    } else {
      // Midnight (Default)
      skyGrad.addColorStop(0, '#04020a');    // Deep cosmic void
      skyGrad.addColorStop(0.5, '#0b041a');  // Deep Midnight Indigo
      skyGrad.addColorStop(0.78, '#1b0833'); // Twilight Saffron Aura
      skyGrad.addColorStop(1, '#0c0517');    // Courtyard floor base
    }

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

    // 3. Courtyard Ground Horizon
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

    // 4. Interactive Sacred Rangoli Guide Stencil
    if (this.rangoliGuideActive) {
      ctx.save();
      const cx = this.width * 0.5;
      const cy = this.height * 0.84;
      const scale = Math.min(this.width / 950, 1.0);

      // Sacred mandala concentric rings
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.ellipse(cx, cy, 56 * scale, 25 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(cx, cy, 125 * scale, 55 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(cx, cy, 195 * scale, 86 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Render guide points
      for (const pt of this.rangoliPoints) {
        const pulse = Math.sin(now * 0.005 + pt.id) * 0.3 + 0.7;
        if (!pt.isLit) {
          // Golden target ring
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.45 * pulse})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Target center spark
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 240, 150, ${0.9 * pulse})`;
          ctx.fill();
        } else {
          // Completed point soft aura
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 200, 50, 0.12)';
          ctx.fill();
        }
      }
      ctx.restore();
    } else {
      // Subtle background watermark when guide is inactive
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
