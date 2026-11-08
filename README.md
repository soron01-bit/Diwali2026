# 🪔 Virtual Diwali 2026 Celebration

A modern, high-performance, and immersive Virtual Diwali Celebration web app built with **HTML5 Canvas, Additive Particle Pooling, Web Audio API, and Personalized Greeting Generators**.

---

## ✨ Features

1. **Countless Glowing Diyas:**
   - Click or tap anywhere to place and light authentic terracotta & brass oil lamps.
   - Organic multi-harmonic flickering flame with real-time breeze physics (flames tilt away when the cursor moves nearby).
   - Warm golden ground illumination using additive lighting.

2. **Interactive Eco-Friendly Fireworks ("Green Diwali"):**
   - 🪔 **Diya Mode:** Place traditional oil lamps with birth spark flare.
   - ✨ **Sparkler Mode (Phooljhadi):** Cursor/touch emits glittering golden sparks that crackle as you move.
   - 🌀 **Chakri Mode (Ground Spinner):** Fast spinning ground wheel spitting rotating spirals of sparks.
   - 🌋 **Anaar Mode (Flowerpot):** Towering volcanic fountain of thousands of shimmering sparks.
   - 🎆 **Sky Rocket Mode:** Ascending rockets bursting into peonies, willows, and chrysanthemums.
   - 🏮 **Sky Lantern Mode:** Graceful floating lanterns carrying blessings up into the starry sky.
   - 🎇 **Grand Fireworks Finale:** 7 synchronized multi-colored rockets + 5 sky lanterns launched simultaneously.

3. **Web Audio API Procedural Soundscape (100% Offline & Reliable):**
   - No external audio files needed! Zero 404 errors, instant loading.
   - Authentic match strikes & crystal-clear sacred bell chimes.
   - Granular sparkler crackles, rocket launch whistles, and deep sub-bass firework explosions.
   - Peaceful ambient Indian classical drone (Tanpura harmonics in D-major).
   - Audio ON/OFF toggle with visual status indicator.

4. **Personalized Greetings & Social Sharing:**
   - Custom greeting card generator with Sender Name, Recipient Name, and personal blessing.
   - **Zero-backend Shareable Link:** Dynamic URL parameters (`?to=Priya&from=Aarav&msg=...`) generate unique links.
   - **Ceremonial Dedication Greeting:** When recipients open your link, a glowing greeting card opens automatically and lights a ceremonial center diya.
   - **One-Click WhatsApp Sharing:** Pre-formatted festive message with your custom link.
   - **Download High-Res Greeting Card (PNG):** Instant composite export of the canvas and golden card for Instagram stories & WhatsApp status.

5. **Milestone Celebrations:**
   - Live counter tracking lit diyas.
   - Celebratory toasts and fireworks triggered at 5, 10, 25, and 50 diyas.

---

## 🚀 How to Run

Because this project is built using native ES modules and standard web standards, you can run it immediately with **zero npm dependencies required**:

### Option 1: Run with Node.js
```bash
npm start
# or
node dev-server.js
```
Then open: **`http://localhost:3000`** in your browser.

### Option 2: Run with any static server
You can also open with **VS Code Live Server**, Python (`python -m http.server 3000`), or deploy directly to **Vercel, Netlify, or GitHub Pages** with zero build configuration!

---

## 📁 Architecture

```text
Diwali2026/
├── index.html            # Main HTML structure, modals & toolbars
├── server.js             # Zero-dependency local Node.js static server
├── package.json          # Project metadata & start scripts
├── README.md             # Documentation
└── src/
    ├── style.css         # Glassmorphic UI & gold gradients
    ├── main.js           # App initialization & ceremonial setup
    ├── engine/
    │   ├── canvas.js     # Master render loop, starfield & viewport management
    │   ├── diya.js       # Clay diya geometry & organic flame math
    │   ├── particles.js  # Object pool particle engine (fireworks, chakri, anaar)
    │   └── audio.js      # Procedural Web Audio API sound synthesizer
    └── ui/
        ├── controls.js   # Tool selector & milestone trackers
        └── greeting.js   # URL parameter parser, WhatsApp share & PNG card export
```

