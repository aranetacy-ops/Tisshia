// ✏️ Passwords (MMDDYYYY or DDMMYYYY)
const PASSWORDS = ["11042004", "04112004"]; // Nov 4, 2004

// ---------- Photos ----------
// 📷 Put your pictures in a "photos" folder next to this file and list them here.
const PHOTOS = [
  { src: "1.jpg", caption: "" },
  { src: "2.jpg", caption: "" },
  { src: "3.jpg", caption: "" },
  { src: "4.jpg", caption: "" }
];

function addPhoto(src, caption, i) {
  const f = document.createElement('figure');
  f.className = 'photo';
  f.style.setProperty('--r', ((i % 2 ? 1 : -1) * (1 + Math.random() * 2)).toFixed(1) + 'deg');
  
  const box = document.createElement('div');
  box.className = 'img';
  
  const img = new Image();
  img.alt = caption || '';
  img.loading = 'lazy';
  img.onerror = () => {
    if (!img.src.includes('photos/')) {
      img.src = 'photos/' + src;
    } else {
      box.textContent = '🌸';
    }
  };
  img.src = src;
  box.appendChild(img);
  
  const c = document.createElement('figcaption');
  c.textContent = caption || '';
  
  f.tabIndex = 0;
  f.setAttribute('role', 'button');
  
  const open = () => {
    if (img.complete && img.naturalWidth) openLB(img.src, caption);
  };
  
  f.onclick = open;
  f.onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };
  
  f.append(box, c);
  $('gallery').appendChild(f);
}

function renderGallery() {
  PHOTOS.forEach((p, i) => addPhoto(p.src, p.caption, i));
  if (location.hash === '#edit') {
    // owner mode: open the page with #edit at the end of the URL
    $('addBtn').hidden = false;
    $('addBtn').onclick = () => $('file').click();
    $('musicPick').hidden = false;
    $('musicPick').onclick = () => $('mfile').click();
    $('mfile').onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      audio.src = URL.createObjectURL(f);
      musicOK = true;
      startMusic();
    };
    $('file').onchange = e => [...e.target.files].forEach((f, i) => {
      const r = new FileReader();
      r.onload = () => addPhoto(r.result, f.name.replace(/\.\w+$/, ''), i);
      r.readAsDataURL(f);
    });
  }
}

// ---------- Login ----------
const $ = id => document.getElementById(id);

// ---------- Music ----------
const audio = $('music'), mbtn = $('musicBtn');
let musicOK = true;

const SONG_SOURCES = [
  "birthday song.mp3",
  "birthday-song.mp3",
  encodeURI("birthday song.mp3")
];
let songIdx = 0;

function loadSong(index) {
  if (index < SONG_SOURCES.length) {
    audio.src = SONG_SOURCES[index];
  } else {
    musicOK = false;
    mbtn.hidden = true;
  }
}

// Ensure the button is visible and ready
mbtn.hidden = false;
loadSong(0);

audio.loop = true;
audio.volume = 0.6;

// Guarantee continuous looping across all browsers
audio.addEventListener('ended', () => {
  audio.currentTime = 0;
  audio.play().catch(() => {});
});

audio.addEventListener('canplay', () => {
  musicOK = true;
  mbtn.hidden = false;
});

audio.onerror = () => {
  songIdx++;
  loadSong(songIdx);
};

const musicUI = () => mbtn.classList.toggle('on', !audio.paused);
audio.addEventListener('play', musicUI);
audio.addEventListener('pause', musicUI);
mbtn.onclick = () => {
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
};

function startMusic() {
  if (!musicOK) return;
  mbtn.hidden = false;
  audio.play().catch(() => {
    // Browser may block unprompted autoplay until first interaction
  });
}

// Start audio when opening the page (or on first click/tap/keypress if blocked by browser policy)
function setupAudioOnOpen() {
  startMusic();

  const unlockAudio = () => {
    if (audio.paused) {
      startMusic();
    }
    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
      window.removeEventListener(evt, unlockAudio);
    });
  };

  ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });
}

setupAudioOnOpen();

// ---------- Lightbox (full-size photo on the same page) ----------
const lb = $('lb');

function openLB(src, cap) {
  $('lbimg').src = src;
  $('lbcap').textContent = cap || '';
  lb.classList.add('open');
  requestAnimationFrame(() => lb.classList.add('vis'));
}

function closeLB() {
  lb.classList.remove('vis');
  setTimeout(() => lb.classList.remove('open'), 300);
}

lb.onclick = e => {
  if (e.target !== $('lbimg')) closeLB();
};

addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLB();
});

// ---------- Interactive Question Card ----------
function showQuestionStep(step) {
  const qCard = $('qCard');
  const qEmoji = $('qEmoji');
  const qTitle = $('qTitle');
  const qSubtitle = $('qSubtitle');
  const qBoxes = $('qBoxes');
  
  qBoxes.innerHTML = '';

  function createOption(label, onSelect) {
    const labelEl = document.createElement('label');
    labelEl.className = 'check-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    
    const span = document.createElement('span');
    span.textContent = label;

    labelEl.append(cb, span);

    let triggered = false;
    labelEl.addEventListener('click', (e) => {
      e.preventDefault();
      if (triggered) return;
      triggered = true;
      cb.checked = true;
      labelEl.classList.add('checked');
      qBoxes.querySelectorAll('input').forEach(i => i.disabled = true);
      setTimeout(onSelect, 280);
    });

    qBoxes.appendChild(labelEl);
  }

  function shakeAndAdvance(nextStep) {
    qCard.classList.remove('shake');
    void qCard.offsetWidth;
    qCard.classList.add('shake');
    setTimeout(() => {
      showQuestionStep(nextStep);
    }, 250);
  }

  if (step === 1) {
    qEmoji.textContent = '';
    qTitle.textContent = 'mag pa pickleball ka?';
    qSubtitle.textContent = 'Check your answer:';
    
    // Choose Yes first time -> proceed to letter & images
    createOption('Yes', () => {
      showFinalContent();
    });

    // Choose No -> ask "are you sure?"
    createOption('No', () => {
      shakeAndAdvance(2);
    });

  } else if (step === 2) {
    qEmoji.textContent = '🥺';
    qTitle.textContent = 'are you sure?';
    qSubtitle.textContent = 'Sure na sure na jud? 💭';

    // Yes -> proceed to Question 3
    createOption('Yes', () => {
      shakeAndAdvance(3);
    });

    // No (changed mind / gives in) -> proceed to letter & images
    createOption('No', () => {
      showFinalContent();
    });

  } else if (step === 3) {
    qEmoji.textContent = '🤔';
    qTitle.textContent = 'Di na jud ma usab imong huna huna?';
    qSubtitle.textContent = 'Paghuna-huna sa ug taas HAHAHA... 💭';

    // Yes -> proceed to Question 4
    createOption('Yes', () => {
      shakeAndAdvance(4);
    });

    // No (mind changed) -> proceed to letter & images
    createOption('No', () => {
      showFinalContent();
    });

  } else if (step === 4) {
    qEmoji.textContent = '😔';
    qTitle.textContent = 'wala na jud pag asa?';
    qSubtitle.textContent = 'Bisan gamay lang gud? 🥺';

    // Yes -> proceed to Question 5 (No option only yes)
    createOption('Yes', () => {
      shakeAndAdvance(5);
    });

    // No (may pag-asa pa) -> proceed to letter & images
    createOption('No', () => {
      showFinalContent();
    });

  } else if (step === 5) {
    qEmoji.textContent = '✨';
    qTitle.textContent = 'Wala na laing Choice';
    qSubtitle.textContent = 'Mag pa-pickle na jud ka! 😌';

    // Only Yes option available (No option removed)
    createOption('Yes', () => {
      showFinalContent();
    });
  }
}

function showFinalContent() {
  const qCard = $('qCard');
  qCard.classList.add('hide');
  setTimeout(() => {
    qCard.style.display = 'none';
    renderGallery();
    const l = $('letter');
    l.style.display = 'block';
    requestAnimationFrame(() => requestAnimationFrame(() => l.classList.add('show')));
  }, 600);
}

function tryLogin() {
  const v = $('pw').value.replace(/\D/g, '');
  if (PASSWORDS.includes(v)) {
    startMusic();
    $('login').classList.add('hide');
    setTimeout(() => {
      $('login').style.display = 'none';
      showQuestionStep(1);
      const qCard = $('qCard');
      qCard.style.display = 'block';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          qCard.classList.remove('hide');
        });
      });
    }, 600);
  } else {
    $('err').textContent = "Not quite — try again 💜";
    const c = $('login');
    c.classList.remove('shake');
    void c.offsetWidth;
    c.classList.add('shake');
  }
}

$('go').onclick = tryLogin;
$('pw').addEventListener('keydown', e => {
  if (e.key === 'Enter') tryLogin();
});

// ---------- Background animation ----------
const cv = $('bg'), ctx = cv.getContext('2d');
let W, H, DPR, flowers = [], butterflies = [];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd = (a, b) => a + Math.random() * (b - a);
const FL = [
  '#6d28d9', // Deep royal amethyst
  '#8b5cf6', // Electric violet
  '#a855f7', // Vivid orchid purple
  '#c026d3', // Magenta-purple
  '#c084fc', // Bright lilac
  '#d8b4fe', // Light pastel lavender
  '#701a75', // Velvet mulberry
  '#c4b5fd', // Soft wisteria
  '#e9d5ff'  // Delicate pale lavender
];
const BF = [
  ['#8338ec', '#e0aaff'], // Electric violet to soft lavender
  ['#7209b7', '#f72585'], // Royal purple to vibrant magenta-violet
  ['#4a0e4e', '#c77dff'], // Deep cosmic plum to radiant lilac
  ['#9d4edd', '#e9d5ff'], // Vivid orchid to pale wisteria
  ['#5b21b6', '#a78bfa'], // Imperial amethyst to periwinkle violet
  ['#b5179e', '#f472b6'], // Magenta-purple to fairy blush
  ['#3c096c', '#b39ddb'], // Velvet midnight purple to misty mauve
  ['#6a0dad', '#d8b4fe'], // Classic royal purple to pastel lavender
  ['#7c3aed', '#c4b5fd'], // Deep violet to lavender glow
  ['#4c1d95', '#ddd6fe']  // Twilight indigo-purple to crystal lilac
];

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth;
  H = innerHeight;
  cv.width = W * DPR;
  cv.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const small = W < 700;
  flowers = Array.from({ length: small ? 18 : 30 }, () => newFlower(true));
  
  // Create butterflies with some larger ones that bounce back and forth
  const totalB = small ? 15 : 26;
  const bounceCount = small ? 4 : 7;
  butterflies = Array.from({ length: totalB }, (_, i) => {
    const isBig = i < bounceCount;
    return newButterfly(true, isBig, small);
  });
}

function newFlower(init) {
  return {
    x: init ? rnd(0, W) : -40,
    y: rnd(0, H),
    r: rnd(8, 18),
    a: rnd(0, 6.28),
    va: rnd(-0.01, 0.01),
    vx: rnd(0.25, 0.7),
    ph: rnd(0, 6.28),
    amp: rnd(10, 35),
    c: FL[Math.random() * FL.length | 0]
  };
}

function newButterfly(init, isBig = false, small = W < 700) {
  const bounce = isBig;
  // Sized to be prominent without covering cards on phone screens
  const s = isBig 
    ? (small ? rnd(0.48, 0.65) : rnd(0.65, 0.88))
    : (small ? rnd(0.22, 0.38) : rnd(0.26, 0.45));
  
  const vxSign = bounce ? (Math.random() < 0.5 ? 1 : -1) : 1;
  const vx = vxSign * (isBig ? rnd(0.8, 1.5) : rnd(0.7, 1.6));
  const vy = bounce ? (Math.random() < 0.5 ? 1 : -1) * rnd(0.35, 0.8) : 0;

  return {
    x: init ? rnd(40, W - 40) : (vx > 0 ? -60 : W + 60),
    y: rnd(40, H - 40),
    s,
    isBig,
    bounce,
    vx,
    vy,
    ph: rnd(0, 6.28),
    fl: isBig ? rnd(0.09, 0.16) : rnd(0.12, 0.22),
    amp: isBig ? rnd(20, 48) : rnd(25, 70),
    t: rnd(0, 100),
    c: BF[Math.random() * BF.length | 0]
  };
}

function drawFlower(f) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.a);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = f.c;
  for (let i = 0; i < 5; i++) {
    ctx.rotate(6.283 / 5);
    ctx.beginPath();
    ctx.ellipse(0, -f.r * 0.6, f.r * 0.38, f.r * 0.65, 0, 0, 6.283);
    ctx.fill();
  }
  ctx.fillStyle = '#fde047'; // Warm golden stamen center that compliments purple petals
  ctx.beginPath();
  ctx.arc(0, 0, f.r * 0.25, 0, 6.283);
  ctx.fill();
  ctx.restore();
}

function drawButterfly(b) {
  const flap = 0.25 + 0.75 * Math.abs(Math.sin(b.t));
  const dir = b.vx >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate((Math.cos(b.ph) * 0.2) * dir);
  // Scale with dir to face the flying direction
  ctx.scale(dir * b.s * 2, b.s * 2);
  for (const side of [1, -1]) {
    ctx.save();
    ctx.scale(side * flap, 1);
    const g = ctx.createLinearGradient(0, -50, 50, 30);
    g.addColorStop(0, b.c[0]);
    g.addColorStop(1, b.c[1]);
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(10, -45, 50, -55, 55, -25);
    ctx.bezierCurveTo(58, -5, 25, 5, 0, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(30, 5, 45, 25, 30, 40);
    ctx.bezierCurveTo(15, 50, 3, 25, 0, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(35, -28, 5, 0, 6.283);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#3b0764'; // Deep rich purple body
  ctx.beginPath();
  ctx.ellipse(0, 5, 3, 18, 0, 0, 6.283);
  ctx.fill();
  ctx.strokeStyle = '#3b0764'; // Deep purple antennae
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.quadraticCurveTo(-8, -26, -12, -28);
  ctx.moveTo(0, -12);
  ctx.quadraticCurveTo(8, -26, 12, -28);
  ctx.stroke();
  ctx.restore();
}

function frame() {
  ctx.clearRect(0, 0, W, H);
  for (const f of flowers) {
    f.x += f.vx;
    f.ph += 0.01;
    f.y += Math.sin(f.ph) * 0.35;
    f.a += f.va;
    if (f.x > W + 40) Object.assign(f, newFlower(false));
    drawFlower(f);
  }
  for (const b of butterflies) {
    b.x += b.vx;
    b.ph += 0.02;
    b.t += b.fl;
    
    if (b.bounce) {
      b.y += b.vy + Math.sin(b.ph) * 0.45;
      
      // Bounce horizontally off the left and right screen edges
      const padX = b.s * 50;
      if (b.x > W - padX) {
        b.x = W - padX;
        b.vx = -Math.abs(b.vx);
      } else if (b.x < padX) {
        b.x = padX;
        b.vx = Math.abs(b.vx);
      }
      
      // Bounce vertically off the top and bottom screen edges
      const padY = b.s * 40;
      if (b.y > H - padY) {
        b.y = H - padY;
        b.vy = -Math.abs(b.vy);
      } else if (b.y < padY) {
        b.y = padY;
        b.vy = Math.abs(b.vy);
      }
    } else {
      b.y += Math.sin(b.ph) * b.amp * 0.02;
      if (b.y < 30) b.y = 30;
      if (b.y > H - 30) b.y = H - 30;
      if (b.x > W + 80) Object.assign(b, newButterfly(false, false, W < 700));
    }
    
    drawButterfly(b);
  }
  if (!reduce) requestAnimationFrame(frame);
}

addEventListener('resize', resize);
resize();
frame();
if (reduce) {
  frame();
}
