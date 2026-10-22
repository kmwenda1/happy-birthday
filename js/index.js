/**
 * HAPPY 20TH BIRTHDAY UMEIMA - INTERACTIVE SCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. WEB AUDIO API - MUSIC BOX & SOUND EFFECTS
  // ==========================================
  let audioCtx = null;
  let isMusicPlaying = false;
  let musicTimeout = null;
  let currentNoteIndex = 0;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play a music box bell tone
  function playBellTone(freq, time, duration = 0.55, gainLevel = 0.18) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Bell/chime harmonics: fundamental sine + 2nd harmonic sine
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);

    // Exponential decay like a music box tine
    gainNode.gain.setValueAtTime(gainLevel, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + duration);
    osc2.stop(time + duration);
  }

  // "Happy Birthday to You" Melody Notes & Durations
  const NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99
  };

  const melody = [
    { note: NOTES.G4, dur: 0.35 },
    { note: NOTES.G4, dur: 0.25 },
    { note: NOTES.A4, dur: 0.6 },
    { note: NOTES.G4, dur: 0.6 },
    { note: NOTES.C5, dur: 0.6 },
    { note: NOTES.B4, dur: 1.1 },

    { note: NOTES.G4, dur: 0.35 },
    { note: NOTES.G4, dur: 0.25 },
    { note: NOTES.A4, dur: 0.6 },
    { note: NOTES.G4, dur: 0.6 },
    { note: NOTES.D5, dur: 0.6 },
    { note: NOTES.C5, dur: 1.1 },

    { note: NOTES.G4, dur: 0.35 },
    { note: NOTES.G4, dur: 0.25 },
    { note: NOTES.G5, dur: 0.6 },
    { note: NOTES.E5, dur: 0.6 },
    { note: NOTES.C5, dur: 0.6 },
    { note: NOTES.B4, dur: 0.6 },
    { note: NOTES.A4, dur: 0.9 },

    { note: NOTES.F5, dur: 0.35 },
    { note: NOTES.F5, dur: 0.25 },
    { note: NOTES.E5, dur: 0.6 },
    { note: NOTES.C5, dur: 0.6 },
    { note: NOTES.D5, dur: 0.6 },
    { note: NOTES.C5, dur: 1.3 }
  ];

  function playNextMelodyNote() {
    if (!isMusicPlaying) return;

    const item = melody[currentNoteIndex];
    const now = audioCtx.currentTime;
    playBellTone(item.note, now, item.dur * 1.2, 0.15);

    currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    const intervalMs = (item.dur + 0.08) * 1000;
    musicTimeout = setTimeout(playNextMelodyNote, intervalMs);
  }

  function toggleMusic() {
    initAudio();
    isMusicPlaying = !isMusicPlaying;

    const musicBtn = document.getElementById('music-toggle-btn');
    const label = musicBtn.querySelector('.music-label');

    if (isMusicPlaying) {
      musicBtn.classList.add('playing');
      label.textContent = 'Pause Music';
      playNextMelodyNote();
    } else {
      musicBtn.classList.remove('playing');
      label.textContent = 'Play Music';
      clearTimeout(musicTimeout);
    }
  }

  // Play playful sound effects
  function playPopSound() {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  function playChimeSound() {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    playBellTone(NOTES.C5, now, 0.5, 0.15);
    playBellTone(NOTES.E5, now + 0.1, 0.6, 0.15);
    playBellTone(NOTES.G5, now + 0.2, 0.8, 0.18);
  }

  const musicToggleBtn = document.getElementById('music-toggle-btn');
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMusic);
  }


  // ==========================================
  // 2. BACKGROUND FLOATING PARTICLES CANVAS
  // ==========================================
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');
  let bgParticles = [];

  function resizeBgCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeBgCanvas);
  resizeBgCanvas();

  class BgParticle {
    constructor() {
      this.reset();
      this.y = Math.random() * bgCanvas.height;
    }
    reset() {
      this.x = Math.random() * bgCanvas.width;
      this.y = bgCanvas.height + 10;
      this.size = Math.random() * 2.2 + 0.8;
      this.speedY = Math.random() * 0.4 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.hue = Math.random() > 0.4 ? 340 : 45; // Pink or warm gold
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -10) this.reset();
    }
    draw() {
      bgCtx.beginPath();
      bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      bgCtx.fillStyle = `hsla(${this.hue}, 85%, 75%, ${this.alpha})`;
      bgCtx.shadowBlur = 8;
      bgCtx.shadowColor = `hsla(${this.hue}, 90%, 70%, 0.8)`;
      bgCtx.fill();
    }
  }

  for (let i = 0; i < 40; i++) {
    bgParticles.push(new BgParticle());
  }

  function animateBg() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgParticles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateBg);
  }
  animateBg();


  // ==========================================
  // 3. CANVAS CONFETTI ENGINE
  // ==========================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confCtx = confettiCanvas.getContext('2d');
  let confettiPieces = [];

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  const CONFETTI_COLORS = [
    '#ff6584', '#f72585', '#ffb3c6', '#ffd166',
    '#ffffff', '#f3c4fb', '#ff758c', '#a855f7'
  ];

  class ConfettiPiece {
    constructor(x, y) {
      this.x = x !== undefined ? x : Math.random() * confettiCanvas.width;
      this.y = y !== undefined ? y : -10;
      this.size = Math.random() * 8 + 6;
      this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      this.speedY = Math.random() * 4 + 2.5;
      this.speedX = (Math.random() - 0.5) * 6;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.isHeart = Math.random() > 0.7;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      this.speedX *= 0.99;
    }
    draw() {
      confCtx.save();
      confCtx.translate(this.x, this.y);
      confCtx.rotate((this.rotation * Math.PI) / 180);
      confCtx.fillStyle = this.color;

      if (this.isHeart) {
        // Draw heart
        confCtx.beginPath();
        const s = this.size * 0.6;
        confCtx.moveTo(0, s * 0.3);
        confCtx.bezierCurveTo(-s, -s * 0.5, -s * 0.5, -s, 0, -s * 0.4);
        confCtx.bezierCurveTo(s * 0.5, -s, s, -s * 0.5, 0, s * 0.3);
        confCtx.fill();
      } else {
        // Draw ribbon rectangle
        confCtx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      }
      confCtx.restore();
    }
  }

  function fireConfettiBurst(count = 75, originX = window.innerWidth / 2, originY = window.innerHeight * 0.4) {
    for (let i = 0; i < count; i++) {
      const p = new ConfettiPiece(originX, originY);
      p.speedY = (Math.random() - 0.75) * 9;
      p.speedX = (Math.random() - 0.5) * 12;
      confettiPieces.push(p);
    }
  }

  function renderConfetti() {
    confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let i = confettiPieces.length - 1; i >= 0; i--) {
      const p = confettiPieces[i];
      p.update();
      p.draw();
      if (p.y > confettiCanvas.height + 20) {
        confettiPieces.splice(i, 1);
      }
    }
    requestAnimationFrame(renderConfetti);
  }
  renderConfetti();


  // ==========================================
  // 4. ACTIVITY 1: BLOWING CANDLES & WISH
  // ==========================================
  const blowBtn = document.getElementById('blow-candles-btn');
  const flame1 = document.getElementById('flame-1');
  const flame2 = document.getElementById('flame-2');
  const smoke1 = document.getElementById('smoke-1');
  const smoke2 = document.getElementById('smoke-2');
  const wishBanner = document.getElementById('wish-banner');
  let areCandlesBlown = false;

  if (blowBtn) {
    blowBtn.addEventListener('click', () => {
      initAudio();

      if (!areCandlesBlown) {
        // Blow out candles
        areCandlesBlown = true;
        flame1.classList.add('blown-out');
        flame2.classList.add('blown-out');

        smoke1.classList.add('active');
        smoke2.classList.add('active');

        playPopSound();
        playChimeSound();

        // Fire festive confetti burst
        const cakeRect = blowBtn.getBoundingClientRect();
        fireConfettiBurst(120, cakeRect.left + cakeRect.width / 2, cakeRect.top);

        // Show banner
        wishBanner.classList.remove('hidden');

        blowBtn.innerHTML = '<span>✨ Wish Made! (Tap to Relight)</span>';

        // Auto start gentle background music if not playing yet
        if (!isMusicPlaying) {
          toggleMusic();
        }
      } else {
        // Relight candles
        areCandlesBlown = false;
        flame1.classList.remove('blown-out');
        flame2.classList.remove('blown-out');
        smoke1.classList.remove('active');
        smoke2.classList.remove('active');
        wishBanner.classList.add('hidden');
        blowBtn.innerHTML = '<span>🕯️ Make a Wish & Blow Candles</span>';
      }
    });
  }


  // ==========================================
  // 5. ACTIVITY 2: 20 WISHES FOR CHAPTER 20
  // ==========================================
  const wishesList = [
    { text: "Chapter 20: Main character energy only. The spotlight is yours!", emoji: "👑" },
    { text: "Your smile has an effortless way of lighting up everyone’s day.", emoji: "✨" },
    { text: "May your coffee be strong, your peace be untouched, and your skin glowing.", emoji: "☕" },
    { text: "Leaving the teenage years behind with unmatched grace, beauty, and style.", emoji: "🌸" },
    { text: "More spontaneous late-night adventures, zero overthinking.", emoji: "🌙" },
    { text: "You deserve the absolute best that life has to offer, today and always.", emoji: "💖" },
    { text: "Entering your twenties with the warmest, kindest heart.", emoji: "🌷" },
    { text: "May every goal and quiet ambition you hold turn into a massive win.", emoji: "🎯" },
    { text: "Surround yourself only with people who match your radiant energy.", emoji: "💫" },
    { text: "May you always know just how deeply loved and appreciated you are.", emoji: "💌" },
    { text: "To laughter so hard your stomach aches and your cheeks hurt.", emoji: "😂" },
    { text: "Never doubt your strength or intuition—you are capable of remarkable things.", emoji: "🌟" },
    { text: "Flawless memories, great playlists, and unforgettable road trips ahead.", emoji: "🎶" },
    { text: "May peace of mind and genuine joy follow you wherever you go.", emoji: "🕊️" },
    { text: "Always stay unapologetically you—radiant, witty, and real.", emoji: "💎" },
    { text: "To friendships that feel like family and moments that feel like movies.", emoji: "🎬" },
    { text: "May the universe shower your 20s with sweet, unexpected blessings.", emoji: "🍀" },
    { text: "Every room is a little brighter whenever you walk in.", emoji: "☀️" },
    { text: "Celebrate yourself today—you’ve grown into such an incredible woman.", emoji: "🥂" },
    { text: "Happy 20th, Umeima. The best chapters of your life begin right now!", emoji: "🎉" }
  ];

  let currentWish = 0;
  const wishBadge = document.getElementById('wish-badge');
  const wishText = document.getElementById('wish-text');
  const wishEmoji = document.getElementById('wish-emoji');
  const wishCounter = document.getElementById('wish-counter');
  const wishFill = document.getElementById('wish-progress-fill');
  const wishCard = document.getElementById('wish-card');

  function updateWishDisplay() {
    wishCard.classList.remove('animate-flip');
    void wishCard.offsetWidth; // Trigger reflow
    wishCard.classList.add('animate-flip');

    const item = wishesList[currentWish];
    wishBadge.textContent = `#${currentWish + 1}`;
    wishText.textContent = item.text;
    wishEmoji.textContent = item.emoji;

    wishCounter.textContent = `Wish ${currentWish + 1} of ${wishesList.length}`;
    const percent = ((currentWish + 1) / wishesList.length) * 100;
    wishFill.style.width = `${percent}%`;

    playPopSound();
  }

  const prevWishBtn = document.getElementById('prev-wish-btn');
  const nextWishBtn = document.getElementById('next-wish-btn');
  const shuffleWishBtn = document.getElementById('shuffle-wish-btn');

  if (nextWishBtn) {
    nextWishBtn.addEventListener('click', () => {
      currentWish = (currentWish + 1) % wishesList.length;
      updateWishDisplay();
    });
  }

  if (prevWishBtn) {
    prevWishBtn.addEventListener('click', () => {
      currentWish = (currentWish - 1 + wishesList.length) % wishesList.length;
      updateWishDisplay();
    });
  }

  if (shuffleWishBtn) {
    shuffleWishBtn.addEventListener('click', () => {
      let rand = Math.floor(Math.random() * wishesList.length);
      if (rand === currentWish) rand = (rand + 1) % wishesList.length;
      currentWish = rand;
      updateWishDisplay();
    });
  }


  // ==========================================
  // 6. ACTIVITY 3: BALLOON POPPING MINI GAME
  // ==========================================
  const balloonItems = document.querySelectorAll('.balloon-item');
  const poppedCountEl = document.getElementById('popped-count');
  const allPoppedBanner = document.getElementById('balloon-all-popped');
  let poppedCount = 0;

  balloonItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('popped')) return;

      item.classList.add('popped');
      poppedCount++;
      poppedCountEl.textContent = poppedCount;

      playPopSound();

      // Show hidden message
      const msgEl = item.querySelector('.balloon-msg');
      const text = item.getAttribute('data-msg');
      const emoji = item.getAttribute('data-emoji');
      msgEl.innerHTML = `${emoji}<br>${text}`;
      msgEl.classList.remove('hidden');

      // Mini confetti burst at balloon position
      const rect = item.getBoundingClientRect();
      fireConfettiBurst(25, rect.left + rect.width / 2, rect.top + rect.height / 3);

      if (poppedCount === balloonItems.length) {
        playChimeSound();
        allPoppedBanner.classList.remove('hidden');
        fireConfettiBurst(100, window.innerWidth / 2, window.innerHeight * 0.5);
      }
    });
  });


  // ==========================================
  // 7. ACTIVITY 4: ENVELOPE & LETTER
  // ==========================================
  const envelope = document.getElementById('envelope-trigger');
  const letterSheet = document.getElementById('letter-sheet');
  const closeLetterBtn = document.getElementById('close-letter-btn');

  if (envelope) {
    envelope.addEventListener('click', () => {
      playChimeSound();
      envelope.classList.add('hidden');
      letterSheet.classList.remove('hidden');

      const rect = letterSheet.getBoundingClientRect();
      fireConfettiBurst(40, rect.left + rect.width / 2, rect.top + 50);
    });
  }

  if (closeLetterBtn) {
    closeLetterBtn.addEventListener('click', () => {
      playPopSound();
      letterSheet.classList.add('hidden');
      envelope.classList.remove('hidden');
    });
  }

});
