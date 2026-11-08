/**
 * Personalized Diwali Greeting Card, Link Generator & PNG Snapshot Export
 */

export class GreetingManager {
  constructor(canvasApp) {
    this.canvasApp = canvasApp;
    this.modal = document.getElementById('greetingModal');
    this.welcomeBanner = document.getElementById('welcomeBanner');
    this.fromInput = document.getElementById('fromInput');
    this.toInput = document.getElementById('toInput');
    this.msgInput = document.getElementById('msgInput');
    this.shareLinkInput = document.getElementById('shareLinkInput');

    this.init();
  }

  init() {
    this.parseUrlParams();
    this.bindEvents();
  }

  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    const from = params.get('from');
    const msg = params.get('msg');

    if (to || from) {
      this.showWelcomeBanner(to || 'Beloved Friend', from || 'A Well-Wisher', msg);
    }
  }

  showWelcomeBanner(to, from, customMsg) {
    const defaultMsg = 'May the divine light of Diwali illuminate your life with infinite joy, peace, wealth, and vibrant health.';
    const message = customMsg || defaultMsg;

    const bannerHtml = `
      <div class="welcome-card">
        <div class="card-ornament top-ornament">✧ 🪔 ✧</div>
        <h2 class="welcome-heading">Happy Diwali 2026</h2>
        <div class="welcome-to">Dedicated to <span>${this.escapeHtml(to)}</span></div>
        <p class="welcome-message">"${this.escapeHtml(message)}"</p>
        <div class="welcome-from">— With Warmest Wishes, <strong>${this.escapeHtml(from)}</strong></div>
        <div class="welcome-actions">
          <button id="closeBannerBtn" class="festive-btn glow-btn">Join the Celebration ✨</button>
        </div>
      </div>
    `;

    if (this.welcomeBanner) {
      this.welcomeBanner.innerHTML = bannerHtml;
      this.welcomeBanner.classList.remove('hidden');

      // Auto-light a special ceremonial center diya
      setTimeout(() => {
        const cx = window.innerWidth * 0.5;
        const cy = window.innerHeight * 0.82;
        this.canvasApp.addDiya(cx, cy, 1.3);
        this.canvasApp.launchFirework(cx, window.innerHeight * 0.28);
      }, 500);

      document.getElementById('closeBannerBtn')?.addEventListener('click', () => {
        this.welcomeBanner.classList.add('fade-out');
        setTimeout(() => this.welcomeBanner.classList.add('hidden'), 500);
      });
    }
  }

  bindEvents() {
    // Open modal button
    document.getElementById('openGreetingBtn')?.addEventListener('click', () => {
      this.openModal();
    });

    // Close modal
    document.getElementById('closeModalBtn')?.addEventListener('click', () => {
      this.closeModal();
    });

    // Live update of share link
    const updateLink = () => this.generateShareLink();
    this.fromInput?.addEventListener('input', updateLink);
    this.toInput?.addEventListener('input', updateLink);
    this.msgInput?.addEventListener('input', updateLink);

    // Copy link button
    document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
      this.copyShareLink();
    });

    // WhatsApp share button
    document.getElementById('whatsappBtn')?.addEventListener('click', () => {
      this.shareViaWhatsApp();
    });

    // Download PNG Card button
    document.getElementById('downloadCardBtn')?.addEventListener('click', () => {
      this.exportGreetingCardImage();
    });
  }

  openModal() {
    this.generateShareLink();
    this.modal?.classList.remove('hidden');
  }

  closeModal() {
    this.modal?.classList.add('hidden');
  }

  generateShareLink() {
    const from = encodeURIComponent(this.fromInput?.value.trim() || '');
    const to = encodeURIComponent(this.toInput?.value.trim() || '');
    const msg = encodeURIComponent(this.msgInput?.value.trim() || '');

    // Set production shareable URL base
    const baseUrl = 'https://diwali2026-blush.vercel.app/';
    const url = new URL(baseUrl);
    if (to) url.searchParams.set('to', decodeURIComponent(to));
    if (from) url.searchParams.set('from', decodeURIComponent(from));
    if (msg) url.searchParams.set('msg', decodeURIComponent(msg));

    if (this.shareLinkInput) {
      this.shareLinkInput.value = url.toString();
    }
    return url.toString();
  }

  copyShareLink() {
    const link = this.generateShareLink();
    navigator.clipboard.writeText(link).then(() => {
      this.showToast('✨ Shareable Diwali link copied to clipboard!');
    }).catch(() => {
      this.shareLinkInput.select();
      document.execCommand('copy');
      this.showToast('✨ Link copied!');
    });
  }

  shareViaWhatsApp() {
    const link = this.generateShareLink();
    const to = this.toInput?.value.trim() || 'my friend';
    const from = this.fromInput?.value.trim() || 'A friend';
    const text = `🪔 *Happy Diwali 2026!* 🎆\n\nDear ${to},\nI lit a special virtual Diwali Diya for you on this beautiful festival of lights.\n\nOpen your glowing card here:\n${link}\n\n— From ${from}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  // Export full celebratory scene as a high-res greeting card image (PNG)
  exportGreetingCardImage() {
    const sourceCanvas = this.canvasApp.canvas;
    const cardCanvas = document.createElement('canvas');
    const width = 1200;
    const height = 1200; // 1:1 Square Instagram / WhatsApp card
    cardCanvas.width = width;
    cardCanvas.height = height;
    const ctx = cardCanvas.getContext('2d');

    // 1. Draw scaled background from live celebratory canvas
    ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, width, height);

    // 2. Festive Royal Golden Border & Vignette
    ctx.save();
    // Dark radial vignette
    const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(10, 3, 20, 0.75)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    // Golden ornate double frame
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = 'rgba(255, 235, 150, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // Corner Mandala Accents
    const corners = [
      [48, 48],
      [width - 48, 48],
      [48, height - 48],
      [width - 48, height - 48]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.stroke();
    });

    // 3. Elegant Greeting Typography Overlay
    const to = this.toInput?.value.trim() || 'Loved Ones';
    const from = this.fromInput?.value.trim() || 'Your Well-Wisher';
    const msg = this.msgInput?.value.trim() || 'May the sacred divine light bring health, wealth, joy, and peace into your home.';

    ctx.textAlign = 'center';

    // Subtitle
    ctx.font = '28px Georgia, serif';
    ctx.fillStyle = '#ffaa33';
    ctx.fillText('✦ SHUBH DEEPAVALI ✦', width / 2, 160);

    // Main Header
    ctx.font = 'bold 74px Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffbb00';
    ctx.shadowBlur = 18;
    ctx.fillText('Happy Diwali 2026', width / 2, 245);
    ctx.shadowBlur = 0;

    // Dedication
    ctx.font = 'italic 34px Georgia, serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Dedicated to ${to}`, width / 2, 330);

    // Body Message (wrap text)
    ctx.font = '30px Georgia, serif';
    ctx.fillStyle = '#f5e8d0';
    this.wrapText(ctx, `"${msg}"`, width / 2, 430, width - 260, 44);

    // Signature
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillStyle = '#ffaa33';
    ctx.fillText(`— Warmest blessings from ${from}`, width / 2, height - 120);

    ctx.restore();

    // Trigger download
    const link = document.createElement('a');
    link.download = `Diwali2026_Greeting_${to.replace(/\s+/g, '_')}.png`;
    link.href = cardCanvas.toDataURL('image/png');
    link.click();

    this.showToast('📸 High-resolution Diwali Greeting Card downloaded!');
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
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

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

