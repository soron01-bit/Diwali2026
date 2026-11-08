/**
 * Toolbar & Interactive Controls Manager
 */

import { audio } from '../engine/audio.js';

export class ControlsManager {
  constructor(canvasApp) {
    this.canvasApp = canvasApp;
    this.diyaCounterBadge = document.getElementById('diyaCounter');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.soundIcon = document.getElementById('soundIcon');
    this.grandCelebrationBtn = document.getElementById('grandCelebrationBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.rangoliToggleBtn = document.getElementById('rangoliToggleBtn');
    this.modeButtons = document.querySelectorAll('.mode-btn:not(#rangoliToggleBtn)');

    this.diyaCount = 0;
    this.celebratedMilestones = new Set();

    this.init();
  }

  init() {
    this.bindModeButtons();
    this.bindSoundToggle();
    this.bindActionButtons();
    this.bindCanvasStats();
    this.bindExtraFeatures();
  }

  bindModeButtons() {
    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.canvasApp.setMode(mode);
        audio.resume();
      });
    });
  }

  bindSoundToggle() {
    this.soundToggleBtn?.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      this.updateSoundIcon(isMuted);
    });
  }

  updateSoundIcon(isMuted) {
    if (this.soundIcon) {
      this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    }
    if (this.soundToggleBtn) {
      this.soundToggleBtn.classList.toggle('sound-active', !isMuted);
    }
  }

  bindActionButtons() {
    this.grandCelebrationBtn?.addEventListener('click', () => {
      this.canvasApp.triggerGrandCelebration();
      this.showToast('🎆 Grand Fireworks Finale launched! Shubh Deepavali!');
    });

    this.clearBtn?.addEventListener('click', () => {
      this.canvasApp.clearDiyas();
      this.celebratedMilestones.clear();
      this.showToast('Courtyard cleared. Light new diyas!');
    });

    // Fullscreen toggle
    this.fullscreenBtn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Sky Theme Cycle
    this.themeToggleBtn?.addEventListener('click', () => {
      const theme = this.canvasApp.cycleSkyTheme();
      const themeNames = {
        midnight: '🌌 Midnight Indigo Sky',
        twilight: '🌅 Saffron Twilight Sky',
        crimson: '🎆 Crimson Festival Sky'
      };
      this.showToast(themeNames[theme] || 'Sky Theme Changed');
    });

    // Rangoli Guide Toggle
    this.rangoliToggleBtn?.addEventListener('click', () => {
      const active = this.canvasApp.toggleRangoliGuide();
      this.rangoliToggleBtn.classList.toggle('active', active);
      if (active) {
        this.showToast('🪷 Sacred Rangoli Guide on! Place diyas on the golden points.');
      } else {
        this.showToast('Rangoli Guide hidden.');
      }
    });
  }

  bindExtraFeatures() {
    this.canvasApp.onRangoliProgress = (lit, total) => {
      if (this.canvasApp.rangoliGuideActive) {
        this.showToast(`🪷 Rangoli Mandala: ${lit} / ${total} Diyas Lit`);
      }
    };

    this.canvasApp.onRangoliComplete = () => {
      this.showToast('🎉 Sacred Rangoli Completed! May Divine Radiance Fill Your Home! ✨');
    };
  }

  bindCanvasStats() {
    this.canvasApp.onDiyaCountChange = (count) => {
      this.diyaCount = count;
      if (this.diyaCounterBadge) {
        this.diyaCounterBadge.textContent = `${count} Diya${count === 1 ? '' : 's'} Lit`;
      }
      this.checkMilestones(count);
    };
  }

  checkMilestones(count) {
    const milestones = [
      { count: 5, msg: '✨ 5 Diyas! The courtyard begins to sparkle with light!' },
      { count: 10, msg: '🪔 10 Diyas! May your days ahead shine with joy and success!' },
      { count: 25, msg: '🌟 25 Diyas! A dazzling sea of golden Diwali lights!' },
      { count: 50, msg: '👑 50 Diyas! Shubh Deepavali! An ocean of radiance!' }
    ];

    for (const m of milestones) {
      if (count >= m.count && !this.celebratedMilestones.has(m.count)) {
        this.celebratedMilestones.add(m.count);
        this.showToast(m.msg);
        this.canvasApp.launchFirework(
          window.innerWidth * (0.3 + Math.random() * 0.4),
          window.innerHeight * 0.25
        );
        break;
      }
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.classList.add('hidden'), 400);
    }, 3200);
  }
}
