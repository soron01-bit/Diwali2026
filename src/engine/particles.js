/**
 * High Performance Particle Engine & Fireworks Systems for Virtual Diwali
 * Built with Object Pooling & Additive Blending for 60-120 FPS.
 */

// Helper random functions
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Festive Diwali Palettes
export const FESTIVE_PALETTES = [
  ['#ffd700', '#ff9900', '#ff3300', '#fff3a8'], // Royal Gold & Saffron
  ['#00ffcc', '#00bfff', '#ff00ff', '#ffffff'], // Neon Mystique
  ['#ff1493', '#ff69b4', '#ffd700', '#fff0f5'], // Lotus Pink & Gold
  ['#00ff88', '#adff2f', '#ffd700', '#ffffff'], // Emerald Radiance
  ['#ff4500', '#ffa500', '#ffff00', '#ffffff'], // Sunfire
  ['#ba55d3', '#9370db', '#00ffff', '#ffffff']  // Celestial Violet
];

// Single Particle with recycled memory
class Particle {
  constructor() {
    this.alive = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.color = '#ffd700';
    this.size = 2;
    this.baseSize = 2;
    this.life = 0;
    this.maxLife = 60;
    this.gravity = 0.05;
    this.drag = 0.98;
    this.flicker = true;
    this.trail = false;
    this.history = [];
  }

  spawn(x, y, vx, vy, color, size, maxLife, gravity = 0.05, drag = 0.98, flicker = true, trail = false) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.baseSize = size;
    this.life = 0;
    this.maxLife = maxLife;
    this.gravity = gravity;
    this.drag = drag;
    this.flicker = flicker;
    this.trail = trail;
    this.history.length = 0;
  }

  update() {
    if (!this.alive) return false;

    if (this.trail && this.life % 2 === 0) {
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > 4) this.history.shift();
    }

    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    this.life++;
    if (this.life >= this.maxLife) {
      this.alive = false;
      return false;
    }
    return true;
  }

  draw(ctx) {
    if (!this.alive) return;
    const progress = this.life / this.maxLife;
    let alpha = 1 - progress;

    if (this.flicker && Math.random() < 0.25) {
      alpha *= 0.35; // Sparkle flicker
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Optional motion trail for willow/palm fireworks
    if (this.trail && this.history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 1; i < this.history.length; i++) {
        ctx.lineTo(this.history[i].x, this.history[i].y);
      }
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size * 0.7;
      ctx.stroke();
    }

    // Spark dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * (1 - progress * 0.4), 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  }
}

// Particle Pool Manager
export class ParticleEngine {
  constructor(maxParticles = 2500) {
    this.pool = Array.from({ length: maxParticles }, () => new Particle());
    this.activeCount = 0;
    this.floatingLanterns = [];
    this.groundCrackers = []; // Chakris & Anaars
    this.rockets = [];
  }

  acquire(x, y, vx, vy, color, size, maxLife, gravity, drag, flicker, trail) {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].alive) {
        this.pool[i].spawn(x, y, vx, vy, color, size, maxLife, gravity, drag, flicker, trail);
        return this.pool[i];
      }
    }
    return null;
  }

  // 1. Phooljhadi (Sparkler) Cursor Trail
  emitSparkler(x, y, count = 4) {
    const colors = ['#fff8cc', '#ffd700', '#ffa500', '#ff5500', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(1.5, 6.5);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.acquire(
        x + rand(-3, 3),
        y + rand(-3, 3),
        vx,
        vy,
        pick(colors),
        rand(1.2, 2.8),
        Math.floor(rand(20, 45)),
        0.08,
        0.96,
        true,
        false
      );
    }
  }

  // 2. Firework Rocket Launch
  launchRocket(startX, startY, targetX, targetY, onExplode) {
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const dist = Math.hypot(targetX - startX, targetY - startY);
    const speed = rand(11, 15);
    const totalFrames = Math.max(25, Math.floor(dist / speed));

    this.rockets.push({
      x: startX,
      y: startY,
      vx: (targetX - startX) / totalFrames,
      vy: (targetY - startY) / totalFrames,
      targetX,
      targetY,
      framesLeft: totalFrames,
      color: pick(pick(FESTIVE_PALETTES)),
      onExplode
    });
  }

  // 3. Firework Explosion Bursts (Peony, Willow, Chrysanthemum)
  explodeFirework(x, y, palette = null, type = 'peony') {
    const colors = palette || pick(FESTIVE_PALETTES);
    const count = type === 'willow' ? 140 : 180;
    const isWillow = type === 'willow';

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isWillow ? rand(2, 6.5) : rand(1.5, 9.5);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = pick(colors);

      this.acquire(
        x,
        y,
        vx,
        vy,
        color,
        isWillow ? rand(1.5, 2.5) : rand(1.8, 3.2),
        isWillow ? Math.floor(rand(60, 95)) : Math.floor(rand(40, 75)),
        isWillow ? 0.045 : 0.065,
        isWillow ? 0.975 : 0.955,
        true,
        isWillow // trails for willow
      );
    }

    // Inner core flash
    for (let j = 0; j < 25; j++) {
      const speed = rand(0.5, 2.5);
      const angle = Math.random() * Math.PI * 2;
      this.acquire(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        '#ffffff',
        rand(2, 4),
        Math.floor(rand(15, 30)),
        0.02,
        0.94,
        true,
        false
      );
    }
  }

  // 4. Chakri (Ground Spinner)
  addChakri(x, y, onSound) {
    this.groundCrackers.push({
      type: 'chakri',
      x,
      y,
      angle: 0,
      spinSpeed: 0.35,
      life: 0,
      maxLife: 280, // ~4.5 seconds
      radius: 20,
      onSound
    });
  }

  // 5. Anaar (Flowerpot Fountain)
  addAnaar(x, y, onSound) {
    this.groundCrackers.push({
      type: 'anaar',
      x,
      y,
      life: 0,
      maxLife: 320, // ~5.3 seconds
      intensity: 0,
      onSound
    });
  }

  // 6. Floating Sky Lanterns (Kandils)
  addLantern(x, y, message = '') {
    this.floatingLanterns.push({
      x,
      y,
      vx: rand(-0.25, 0.25),
      vy: rand(-0.45, -0.85), // ascends gracefully
      scale: rand(0.7, 1.2),
      swaySeed: Math.random() * 100,
      alpha: 0,
      maxAlpha: rand(0.75, 0.95),
      message
    });
  }

  updateAndDraw(ctx, now) {
    // Enable Additive Blending for celestial fiery light
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // A. Update & Draw Active Rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.framesLeft--;

      // Rocket flame head
      ctx.beginPath();
      ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Golden smoke & spark wake
      this.acquire(
        r.x + rand(-1.5, 1.5),
        r.y + rand(-1.5, 1.5),
        -r.vx * 0.15 + rand(-0.5, 0.5),
        -r.vy * 0.15 + rand(-0.5, 0.5),
        '#ffd700',
        rand(1.2, 2.2),
        15,
        0.02,
        0.95,
        true,
        false
      );

      if (r.framesLeft <= 0) {
        if (r.onExplode) r.onExplode(r.x, r.y);
        this.rockets.splice(i, 1);
      }
    }

    // B. Update & Draw Ground Crackers (Chakri & Anaar)
    for (let i = this.groundCrackers.length - 1; i >= 0; i--) {
      const gc = this.groundCrackers[i];
      gc.life++;

      if (gc.type === 'chakri') {
        gc.angle += gc.spinSpeed;
        if (gc.life % 4 === 0 && gc.onSound) gc.onSound();

        // Emit spiral sparks from 2-4 points on perimeter
        const numJets = 3;
        for (let j = 0; j < numJets; j++) {
          const jetAngle = gc.angle + (j * (Math.PI * 2 / numJets));
          const jetX = gc.x + Math.cos(jetAngle) * gc.radius;
          const jetY = gc.y + Math.sin(jetAngle) * (gc.radius * 0.45); // isometric tilt

          // Tangential ejection
          const tanAngle = jetAngle + Math.PI * 0.5;
          const speed = rand(3.5, 7.5);
          const vx = Math.cos(tanAngle) * speed + rand(-1, 1);
          const vy = (Math.sin(tanAngle) * speed * 0.45) - rand(0.5, 2.0);

          this.acquire(
            jetX,
            jetY,
            vx,
            vy,
            pick(['#ffffff', '#ffd700', '#ff8800', '#ff0055']),
            rand(1.5, 2.8),
            Math.floor(rand(18, 35)),
            0.08,
            0.96,
            true,
            false
          );
        }

        // Draw glowing spinning center disc
        ctx.beginPath();
        ctx.ellipse(gc.x, gc.y, 14, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 220, 100, 0.8)';
        ctx.fill();

        if (gc.life >= gc.maxLife) {
          this.groundCrackers.splice(i, 1);
        }
      } else if (gc.type === 'anaar') {
        if (gc.life % 5 === 0 && gc.onSound) gc.onSound();

        // Fountain progress curve: builds up, roars, then dies down
        const p = gc.life / gc.maxLife;
        let power = Math.sin(p * Math.PI);
        const sparkCount = Math.floor(power * 14) + 2;

        for (let k = 0; k < sparkCount; k++) {
          const spreadAngle = -Math.PI * 0.5 + rand(-0.35, 0.35);
          const speed = rand(6, 17) * power;
          const vx = Math.cos(spreadAngle) * speed;
          const vy = Math.sin(spreadAngle) * speed;

          this.acquire(
            gc.x + rand(-4, 4),
            gc.y - 6,
            vx,
            vy,
            pick(['#fff9db', '#ffd700', '#ffaa00', '#ff3300', '#00ffcc']),
            rand(1.6, 3.2),
            Math.floor(rand(35, 65)),
            0.22, // Heavy gravity pulls fountain back down
            0.97,
            true,
            false
          );
        }

        // Cone body representation
        ctx.beginPath();
        ctx.moveTo(gc.x, gc.y - 14);
        ctx.lineTo(gc.x - 10, gc.y);
        ctx.lineTo(gc.x + 10, gc.y);
        ctx.closePath();
        ctx.fillStyle = '#ffaa33';
        ctx.fill();

        if (gc.life >= gc.maxLife) {
          this.groundCrackers.splice(i, 1);
        }
      }
    }

    // C. Update & Draw Particles from pool
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (p.alive) {
        if (p.update()) {
          p.draw(ctx);
        }
      }
    }

    ctx.restore();

    // D. Update & Draw Floating Sky Lanterns (Gentle & Serene)
    for (let i = this.floatingLanterns.length - 1; i >= 0; i--) {
      const l = this.floatingLanterns[i];
      l.x += l.vx + Math.sin((now * 0.0015) + l.swaySeed) * 0.35;
      l.y += l.vy;
      if (l.alpha < l.maxAlpha) l.alpha += 0.02;

      ctx.save();
      ctx.globalAlpha = l.alpha;
      ctx.translate(l.x, l.y);
      ctx.scale(l.scale, l.scale);

      // Lantern Glow
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 35);
      glow.addColorStop(0, 'rgba(255, 180, 50, 0.6)');
      glow.addColorStop(0.5, 'rgba(255, 100, 10, 0.2)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.fill();

      // Paper Lantern Body
      ctx.fillStyle = 'rgba(255, 140, 20, 0.85)';
      ctx.strokeStyle = 'rgba(255, 230, 150, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-12, -18, 24, 30, [4, 4, 2, 2]);
      ctx.fill();
      ctx.stroke();

      // Inner flame core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 4, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Remove when drifted far above the screen
      if (l.y < -100) {
        this.floatingLanterns.splice(i, 1);
      }
    }
  }

  clear() {
    this.pool.forEach(p => p.alive = false);
    this.rockets.length = 0;
    this.groundCrackers.length = 0;
  }
}

