/**
 * Diya (Traditional Oil Lamp) Simulation
 * Multi-layer organic flickering flame, clay body, brass accents & ground illumination.
 */

export class Diya {
  constructor(x, y, scale = 1.0) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.baseWidth = 54 * scale;
    this.baseHeight = 24 * scale;

    // Organic flicker properties
    this.flickerSeed = Math.random() * 1000;
    this.flameHeight = 36 * scale;
    this.flameWidth = 16 * scale;
    this.birthTime = performance.now();
    this.bornDuration = 450; // ms to fully flare up

    // Flame physics
    this.tilt = 0;
    this.targetTilt = 0;

    // Smoke / micro-ember spawn rate
    this.lastEmberSpawn = 0;
  }

  update(now, mouseX, mouseY) {
    // Breeze reaction: if cursor is near, tilt flame away
    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX;
      const dy = (this.y - 15) - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 5) {
        this.targetTilt = (dx / dist) * Math.max(0, 1 - dist / 120) * 0.45;
      } else {
        this.targetTilt = 0;
      }
    } else {
      this.targetTilt = 0;
    }

    // Smooth tilt interpolation
    this.tilt += (this.targetTilt - this.tilt) * 0.1;
  }

  draw(ctx, now) {
    const age = now - this.birthTime;
    const birthProgress = Math.min(1, age / this.bornDuration);
    // Ease out bounce/elastic entry
    const entryScale = 1 + Math.sin(birthProgress * Math.PI * 0.5) * 0.05;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Multi-octave organic flicker calculation
    const t = (now * 0.004) + this.flickerSeed;
    const flicker1 = Math.sin(t * 2.3);
    const flicker2 = Math.cos(t * 4.7);
    const flicker3 = Math.sin(t * 8.1);
    const flicker = 1 + (flicker1 * 0.08 + flicker2 * 0.05 + flicker3 * 0.03);

    const flameH = this.flameHeight * flicker * birthProgress * entryScale;
    const flameW = this.flameWidth * (1 + flicker1 * 0.05) * birthProgress;

    // 1. Warm Ground Illumination Glow (Additive Blending)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const groundGlowRadius = 95 * this.scale * (1 + flicker * 0.12) * birthProgress;
    const groundGlow = ctx.createRadialGradient(0, 6, 5, 0, 6, groundGlowRadius);
    groundGlow.addColorStop(0, 'rgba(255, 175, 45, 0.45)');
    groundGlow.addColorStop(0.35, 'rgba(255, 115, 15, 0.22)');
    groundGlow.addColorStop(0.7, 'rgba(180, 50, 5, 0.08)');
    groundGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = groundGlow;
    ctx.beginPath();
    ctx.ellipse(0, 6, groundGlowRadius, groundGlowRadius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Terracotta Clay Lamp Base (Earthen Diya with decorative brass rim)
    ctx.save();

    // Diya Bowl Shadow
    ctx.beginPath();
    ctx.ellipse(0, 8 * this.scale, this.baseWidth * 0.55, this.baseHeight * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 4, 2, 0.6)';
    ctx.fill();

    // Terracotta Body Gradient
    const clayGrad = ctx.createLinearGradient(0, -5, 0, this.baseHeight * 0.8);
    clayGrad.addColorStop(0, '#d97438');
    clayGrad.addColorStop(0.3, '#b84d1a');
    clayGrad.addColorStop(0.7, '#7a2d0b');
    clayGrad.addColorStop(1, '#481704');

    // Clay Bowl Shape
    ctx.beginPath();
    ctx.moveTo(-this.baseWidth * 0.5, 0);
    ctx.bezierCurveTo(
      -this.baseWidth * 0.45, this.baseHeight * 0.9,
      this.baseWidth * 0.45, this.baseHeight * 0.9,
      this.baseWidth * 0.5, 0
    );
    ctx.bezierCurveTo(
      this.baseWidth * 0.3, -this.baseHeight * 0.25,
      -this.baseWidth * 0.3, -this.baseHeight * 0.25,
      -this.baseWidth * 0.5, 0
    );
    ctx.closePath();
    ctx.fillStyle = clayGrad;
    ctx.fill();

    // Golden / Brass Lip Accent
    ctx.beginPath();
    ctx.ellipse(0, -this.baseHeight * 0.1, this.baseWidth * 0.48, this.baseHeight * 0.26, 0, 0, Math.PI * 2);
    ctx.lineWidth = 2.2 * this.scale;
    const goldGrad = ctx.createLinearGradient(-this.baseWidth * 0.5, 0, this.baseWidth * 0.5, 0);
    goldGrad.addColorStop(0, '#ffd700');
    goldGrad.addColorStop(0.3, '#fff2a3');
    goldGrad.addColorStop(0.5, '#d4af37');
    goldGrad.addColorStop(0.8, '#fff3a8');
    goldGrad.addColorStop(1, '#ffd700');
    ctx.strokeStyle = goldGrad;
    ctx.stroke();

    // Inner Oil Pool (glistening ghee/oil)
    ctx.beginPath();
    ctx.ellipse(0, -this.baseHeight * 0.08, this.baseWidth * 0.42, this.baseHeight * 0.18, 0, 0, Math.PI * 2);
    const oilGrad = ctx.createRadialGradient(0, -this.baseHeight * 0.08, 2, 0, -this.baseHeight * 0.08, this.baseWidth * 0.4);
    oilGrad.addColorStop(0, '#ffc252');
    oilGrad.addColorStop(0.5, '#b0590e');
    oilGrad.addColorStop(1, '#451703');
    ctx.fillStyle = oilGrad;
    ctx.fill();

    // Cotton Wick (Baati)
    ctx.beginPath();
    ctx.moveTo(0, -this.baseHeight * 0.05);
    ctx.quadraticCurveTo(this.tilt * 5, -8 * this.scale, this.tilt * 8, -12 * this.scale);
    ctx.lineWidth = 2.5 * this.scale;
    ctx.strokeStyle = '#2b1408';
    ctx.stroke();

    ctx.restore();

    // 3. Multi-layer Vibrant Flickering Flame
    if (birthProgress > 0.05) {
      ctx.save();
      ctx.translate(this.tilt * 10, -12 * this.scale);

      // Flame rotation from breeze tilt
      ctx.rotate(this.tilt * 0.35);

      // 3A. Outer Radiant Flame Halo (Screen / Additive)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const haloRadius = flameH * 1.5;
      const haloGrad = ctx.createRadialGradient(0, -flameH * 0.4, 2, 0, -flameH * 0.4, haloRadius);
      haloGrad.addColorStop(0, 'rgba(255, 200, 80, 0.5)');
      haloGrad.addColorStop(0.3, 'rgba(255, 110, 20, 0.25)');
      haloGrad.addColorStop(0.7, 'rgba(255, 40, 0, 0.08)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, -flameH * 0.4, haloRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3B. Outer Orange Teardrop
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(
        -flameW * 0.9, -flameH * 0.25,
        -flameW * 0.7, -flameH * 0.75,
        0 + Math.sin(t * 3) * 2.5, -flameH
      );
      ctx.bezierCurveTo(
        flameW * 0.7, -flameH * 0.75,
        flameW * 0.9, -flameH * 0.25,
        0, 2
      );
      ctx.fillStyle = 'rgba(255, 95, 10, 0.85)';
      ctx.fill();

      // 3C. Middle Radiant Golden Body
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.bezierCurveTo(
        -flameW * 0.6, -flameH * 0.3,
        -flameW * 0.45, -flameH * 0.7,
        0 + Math.sin(t * 3) * 1.5, -flameH * 0.88
      );
      ctx.bezierCurveTo(
        flameW * 0.45, -flameH * 0.7,
        flameW * 0.6, -flameH * 0.3,
        0, 1
      );
      ctx.fillStyle = '#ffcc00';
      ctx.fill();

      // 3D. Inner White-Hot Teardrop Core
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -flameW * 0.28, -flameH * 0.25,
        -flameW * 0.2, -flameH * 0.55,
        0, -flameH * 0.65
      );
      ctx.bezierCurveTo(
        flameW * 0.2, -flameH * 0.55,
        flameW * 0.28, -flameH * 0.25,
        0, 0
      );
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // 3E. Subtle Blue Flame Base (pure hydrocarbon combustion)
      ctx.beginPath();
      ctx.ellipse(0, 0, flameW * 0.28, flameH * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(60, 140, 255, 0.45)';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }
}

