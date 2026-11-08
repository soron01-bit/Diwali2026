/**
 * Virtual Diwali 2026 - Main Application Entrypoint
 */

import { DiwaliCanvasApp } from './engine/canvas.js';
import { GreetingManager } from './ui/greeting.js';
import { ControlsManager } from './ui/controls.js';
import { audio } from './engine/audio.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('diwaliCanvas');
  const app = new DiwaliCanvasApp(canvas);

  const greetingMgr = new GreetingManager(app);
  const controlsMgr = new ControlsManager(app);

  // Initial ceremonial diyas if screen is blank
  const placeInitialDiyas = () => {
    const cx = window.innerWidth * 0.5;
    const cy = window.innerHeight * 0.85;

    // Center ornate Diya
    app.addDiya(cx, cy, 1.25);
    // Flanking Diyas
    app.addDiya(cx - 140, cy + 15, 1.05);
    app.addDiya(cx + 140, cy + 15, 1.05);
  };

  setTimeout(placeInitialDiyas, 300);

  // First interaction hint
  const hint = document.getElementById('tapHint');
  const dismissHint = () => {
    if (hint) {
      hint.classList.add('fade-out');
      setTimeout(() => hint.remove(), 600);
    }
    window.removeEventListener('click', dismissHint);
    window.removeEventListener('touchstart', dismissHint);
  };

  window.addEventListener('click', dismissHint, { once: true });
  window.addEventListener('touchstart', dismissHint, { once: true });

  console.log('✨ Virtual Diwali 2026 initialized successfully! Shubh Deepavali! 🪔');
});

