// =========================
// Barbie land app.js (clean + moving/bumping songs)
// =========================

// ---- Customize here ----
const SETTINGS = {
  toName: "Pono",
  fromName: "Sol",

  passcode: "0813",
  startDate: "2023-08-13T19:42:00",

  letter:
    "Hi Pono, I hope you know how grateful I am for you, your kindness, your humor, and your love. " +
    "Thank you for being the best person anyone could ever ask for, I love you so much. " +
    "Happy Valentine’s Day, my stinky. 💖",

  photos: [
    { src: "images/V_1.jpg", cap: "One of our first pictures !" },
    { src: "images/V_2.jpg", cap: "A personal fav teehee" },
    { src: "images/V_3.jpg", cap: "Joji Concert !!!" },
    { src: "images/V_4.jpg", cap: "My FIRST concert ever ^^" },
    { src: "images/V_5.jpg", cap: "We're so CYUTTE" },
    { src: "images/V_6.jpg", cap: "We look so swaggylicious" },
    { src: "images/V_7.jpg", cap: "You look so yummy mwahaha" },
    { src: "images/V_8.jpg", cap: "Zoo date !!!" },
    { src: "images/V_9.jpg", cap: "I stare at this one every night" },
    { src: "images/V_15.jpg", cap: "How did this end up in my camera roll...?" },
    { src: "images/V_11.jpg", cap: "You look so cuteeee ^^*" },
    { src: "images/V_12.jpg", cap: "Adorable Borpfran" },
    { src: "images/V_13.jpg", cap: "This one is so silly I love" },
    { src: "images/V_14.jpg", cap: "Blehhh" },
    { src: "images/V_10.jpg", cap: "Adorable" },
  ],

  songs: [
    { title: "Ai To U", artist: "Mega Shinnosuke", appleMusicUrl: "https://music.apple.com/us/album/ai-to-u-single/1840121844", art: "images/M_1.png" },
    { title: "LOVE YOU LESS", artist: "Joji", appleMusicUrl: "https://music.apple.com/us/song/love-you-less/1876695424", art: "images/M_2.png" },
    { title: "Chilled Chinese Noodles with Green Onion", artist: "Cody Lee", appleMusicUrl: "https://music.apple.com/us/song/chilled-chinese-noodles-with-green-onion/1621976204", art: "images/M_3.png" },
    { title: "Love Shine", artist: "LEEHEESANG", appleMusicUrl: "https://music.apple.com/us/song/love-shine/1600850477", art: "images/M_4.png" },
    { title: "Peach eyes", artist: "wave to earth", appleMusicUrl: "https://music.apple.com/us/song/peach-eyes/1770274119", art: "images/M_5.png" },
    { title: "Stand By Me", artist: "Oasis", appleMusicUrl: "https://music.apple.com/us/song/stand-by-me/1517475374", art: "images/M_6.png" },
  ],
};

// ---- Helpers ----
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// ---- DOM ----
const $ = (id) => document.getElementById(id);

const unlockSound = document.getElementById("unlockSound");
const tapSound = document.getElementById("tapSound");
const bgMusic = document.getElementById("bgMusic");

let audioUnlocked = false; // iPhone requires a gesture before audio will play


const lockscreen = $("lockscreen");
const lockCenter = $("lockCenter");
const dotsEl = $("dots");
const hintEl = $("lockHint");
const keypad = $("keypad");
const main = $("main");
const unlockAudio = $("unlockAudio");

const toNameEl = $("toName");
const fromNameEl = $("fromName");
const letterTextEl = $("letterText");

const dEl = $("d");
const hEl = $("h");
const mEl = $("m");
const sEl = $("s");

const photoEl = $("photo");
const photoCapEl = $("photoCap");

const songsStage = $("songsStage");
const envelopeEl = $("envelope");

const pages = ["hub","photos","letter","songs"];

window.addEventListener("pointerdown", primeAudioOnce, { once: true });

// ---- State ----
let entered = "";
let unlocked = false;
let photoIndex = 0;

let currentPage = "hub";

// ===== Songs physics =====
let bodies = []; // {el,x,y,w,h,vx,vy,dragging,moved,offX,offY}
let raf = null;
let songsBuilt = false;

// =========================
// Init
// =========================
document.addEventListener("DOMContentLoaded", () => {
  applySettings();
  buildLockUI();
  bindNavigation();
  bindFeatures();
  document.addEventListener("pointerdown", () => {
  // first interaction arms audio + starts bg music
  Sounds.armOnce();
}, { once: true });
document.addEventListener("click", (e) => {
  const isButton =
    e.target.closest("button") ||
    e.target.closest(".key") ||
    e.target.closest(".iconBtn") ||
    e.target.closest(".back") ||
    e.target.closest(".arrow");

  if (isButton) {
    Sounds.armOnce();
    Sounds.playTap();
  }
});


});

// =========================
// Apply settings
// =========================
function applySettings(){
  toNameEl.textContent = SETTINGS.toName;
  fromNameEl.textContent = SETTINGS.fromName;
  letterTextEl.textContent = SETTINGS.letter;
  document.title = "For Pono 💗";

  // reset
  main.classList.remove("show");
  unlocked = false;
  entered = "";

  lockscreen.classList.remove("unlocked");
  lockscreen.style.display = "grid";
  lockscreen.style.pointerEvents = "auto";
}

// =========================
// Lock screen
// =========================
function buildLockUI(){
  renderDots();
  buildKeypad();

  $("cancelBtn").addEventListener("click", () => {
    clearHint();
    resetEntry();
  });

  $("emergencyBtn").addEventListener("click", () => {
    showHint("Emergency ! I miss you :(");
    setTimeout(clearHint, 1200);
  });
}

function renderDots(){
  dotsEl.innerHTML = "";
  for(let i=0; i<4; i++){
    const d = document.createElement("div");
    d.className = "dot" + (i < entered.length ? " filled" : "");
    dotsEl.appendChild(d);
  }
}

function showHint(msg){
  hintEl.textContent = msg;
  hintEl.classList.add("show");
}
function clearHint(){
  hintEl.textContent = "";
  hintEl.classList.remove("show");
}
function resetEntry(){
  entered = "";
  renderDots();
}

function buildKeypad(){
  keypad.innerHTML = "";

  const KEYS = [
    { n:"1", l:"" },
    { n:"2", l:"ABC" },
    { n:"3", l:"DEF" },
    { n:"4", l:"GHI" },
    { n:"5", l:"JKL" },
    { n:"6", l:"MNO" },
    { n:"7", l:"PQRS" },
    { n:"8", l:"TUV" },
    { n:"9", l:"WXYZ" },
    { n:"", l:"" }, // spacer
    { n:"0", l:"" },
    { n:"⌫", l:"" },
  ];

  KEYS.forEach((k)=>{
    if(!k.n && !k.l){
      const spacer = document.createElement("div");
      spacer.style.width = "92px";
      spacer.style.height = "92px";
      keypad.appendChild(spacer);
      return;
    }

    const btn = document.createElement("div");
    btn.className = "key" + (k.n === "⌫" ? " dark" : "");
    btn.innerHTML = `
      <div>${escapeHtml(k.n)}</div>
      ${k.l ? `<div class="letters">${escapeHtml(k.l)}</div>` : ""}
    `;

    btn.addEventListener("pointerup", () => onKeyPress(k.n));
    keypad.appendChild(btn);
  });
}

function onKeyPress(key){
    
  if(unlocked) return;

  if(key === "⌫"){
    entered = entered.slice(0,-1);
    renderDots();
    return;
  }

  if(entered.length < 4){
    entered += key;
    renderDots();
  }

  if(entered.length === 4){
    if(entered === SETTINGS.passcode){
      doUnlock();
    } else {
      doWrong();
    }
  }
}

function doWrong(){
  lockCenter.classList.remove("shake");
  void lockCenter.offsetWidth;
  lockCenter.classList.add("shake");

  showHint("Try Again Stinky !");
  setTimeout(clearHint, 1200);

  resetEntry();
}

// **Unstickable unlock**: removes lockscreen node every time
function doUnlock(){
  unlocked = true;

  main.classList.add("show");
  lockscreen.style.pointerEvents = "none";

  primeAudioOnce();
playUnlock();
startBgMusic();

  try{
    unlockAudio.currentTime = 0;
    unlockAudio.play();
  }catch(e){}

  lockscreen.classList.add("unlocked");

  setTimeout(() => {
    if (lockscreen && lockscreen.parentNode) {
      lockscreen.parentNode.removeChild(lockscreen);
    }
  }, 150);
  
}

// =========================
// Navigation
// =========================
function showPage(id){
  pages.forEach(p => $(p).classList.remove("active"));
  $(id).classList.add("active");

  currentPage = id;

  if (id === "songs") {
    if (!songsBuilt) {
      buildSongBubbles();
      songsBuilt = true;
    }
    startSongPhysicsSafe();
  } else {
    stopSongPhysics();
  }
}

function bindNavigation(){
document.querySelectorAll("[data-go]").forEach(btn=>{
  btn.addEventListener("pointerup", ()=>{
    primeAudioOnce();
    playTap();
    showPage(btn.dataset.go);
  });
});

document.querySelectorAll("[data-back]").forEach(btn=>{
  btn.addEventListener("pointerup", ()=>{
    primeAudioOnce();
    playTap();
    showPage(btn.dataset.back);
  });
});

}

// =========================
// Features
// =========================
function bindFeatures(){
  startTimer();
  initPhotos();
  initLetter();

  // build once (physics only runs on songs page)
  buildSongBubbles();
  songsBuilt = true;
}

function primeAudioOnce(){
  if (audioUnlocked) return;
  audioUnlocked = true;

  // "prime" audio with a user gesture so future plays work on iPhone
  [unlockSound, tapSound, bgMusic].forEach(a => {
    if (!a) return;
    try {
      a.muted = true;
      a.play().then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      }).catch(()=>{ a.muted = false; });
    } catch(e){}
  });
}

function playTap(){
  if (!tapSound) return;
  try {
    tapSound.currentTime = 0;
    tapSound.play();
  } catch(e){}
}

function playUnlock(){
  if (!unlockSound) return;
  try {
    unlockSound.currentTime = 0;
    unlockSound.play();
  } catch(e){}
}

function startBgMusic(){
  if (!bgMusic) return;
  try{
    bgMusic.volume = 0.35; // adjust
    bgMusic.play();
  }catch(e){}
}


function startTimer(){
  const start = new Date(SETTINGS.startDate).getTime();

  function tick(){
    const now = Date.now();
    let diff = Math.max(0, now - start);

    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days*(1000*60*60*24);
    const hrs = Math.floor(diff / (1000*60*60));
    diff -= hrs*(1000*60*60);
    const mins = Math.floor(diff / (1000*60));
    diff -= mins*(1000*60);
    const secs = Math.floor(diff / 1000);

    dEl.textContent = days;
    hEl.textContent = String(hrs).padStart(2,"0");
    mEl.textContent = String(mins).padStart(2,"0");
    sEl.textContent = String(secs).padStart(2,"0");
  }

  tick();
  setInterval(tick, 1000);
}


function initPhotos(){
  function renderPhoto(){
    const item = SETTINGS.photos[photoIndex];
    photoEl.src = item.src;
    photoCapEl.textContent = item.cap || "";
  }

  $("prevPhoto").addEventListener("click", ()=>{
    photoIndex = (photoIndex - 1 + SETTINGS.photos.length) % SETTINGS.photos.length;
    renderPhoto();
    document.getElementById("prevPhoto").addEventListener("pointerup", ()=>{
  primeAudioOnce();
  playTap();
  // ...existing prev logic...
});
  });

  $("nextPhoto").addEventListener("click", ()=>{
    photoIndex = (photoIndex + 1) % SETTINGS.photos.length;
    renderPhoto();
    document.getElementById("nextPhoto").addEventListener("pointerup", ()=>{
  primeAudioOnce();
  playTap();
  // ...existing next logic...
});
  });

  renderPhoto();
  
}


function initLetter(){
  envelopeEl.addEventListener("pointerup", () => {
    envelopeEl.classList.toggle("open");
  });
}

// =========================
// Songs: build bubbles
// =========================
function buildSongBubbles(){
  songsStage.innerHTML = "";
  SETTINGS.songs.forEach((song, i) => songsStage.appendChild(makeBubble(song, i)));
}

function makeBubble(song, i){
  const el = document.createElement("div");
  el.className = "songBubble";
  el.dataset.url = song.appleMusicUrl || "";

  el.innerHTML = `
    <div class="songArt">
      <img src="${song.art || ("https://picsum.photos/200?random=" + (80+i))}" alt="">
    </div>
    <div class="songMeta">
      <div class="songTitle">${escapeHtml(song.title)}</div>
      <div class="songArtist">${escapeHtml(song.artist || "")}</div>
    </div>
  `;

  const cols = [0.08, 0.42, 0.18, 0.48, 0.10, 0.36, 0.22];
  const xFrac = cols[i % cols.length];
  // random starting position (so they don't spawn as a list)
const st = songsStage.getBoundingClientRect();
const W = Math.max(320, st.width);    // fallback if not measured yet
const H = Math.max(520, st.height);

const w = 270; // approximate pill width (doesn't need to be perfect)
const h = 78;  // approximate pill height

const x = 10 + Math.random() * Math.max(10, (W - w - 20));
const y = 10 + Math.random() * Math.max(10, (H - h - 20));

el.style.left = x + "px";
el.style.top  = y + "px";

  el.style.zIndex = String(10 + i);

  // your existing drag + tap open
  let startX=0, startY=0, originLeft=0, originTop=0;
  let moved=false, pointerId=null;

  el.addEventListener("pointerdown", (e)=>{
    pointerId = e.pointerId;
    el.setPointerCapture(pointerId);
    moved = false;

    el.style.zIndex = String(1000 + i + Math.floor(Math.random()*1000));

    const elRect = el.getBoundingClientRect();
    const stRect = songsStage.getBoundingClientRect();
    originLeft = elRect.left - stRect.left;
    originTop  = elRect.top  - stRect.top;

    startX = e.clientX;
    startY = e.clientY;

    // mark body dragging if physics exists
    const b = bodies.find(x => x.el === el);
    if (b) { b.dragging = true; b.vx = 0; b.vy = 0; }
  });

  el.addEventListener("pointermove", (e)=>{
    if(pointerId === null) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if(Math.abs(dx) + Math.abs(dy) > 6) moved = true;

    const stRect = songsStage.getBoundingClientRect();
    const maxLeft = stRect.width - el.offsetWidth;
    const maxTop  = stRect.height - el.offsetHeight;

    const nextLeft = clamp(originLeft + dx, 6, Math.max(6, maxLeft - 6));
    const nextTop  = clamp(originTop  + dy, 6, Math.max(6, maxTop - 6));

    el.style.left = nextLeft + "px";
    el.style.top  = nextTop + "px";

    // sync physics body while dragging
    const b = bodies.find(x => x.el === el);
    if (b) { b.x = nextLeft; b.y = nextTop; b.moved = moved; }
  });

  el.addEventListener("pointerup", ()=>{
    const b = bodies.find(x => x.el === el);
    if (b) {
      b.dragging = false;
      if (b.moved) {
        b.vx = (Math.random()*1.2 - 0.6);
        b.vy = (Math.random()*1.2 - 0.6);
      }
    }

    if(!moved){
      const url = el.dataset.url;
      if(url) window.location.href = url;
    }
    pointerId = null;
  });

  el.addEventListener("pointercancel", ()=>{
    const b = bodies.find(x => x.el === el);
    if (b) b.dragging = false;
    pointerId = null;
  });

  return el;
}

// =========================
// Songs physics (global, actually runs)
// =========================
function stopSongPhysics(){
  if (raf) cancelAnimationFrame(raf);
  raf = null;
}

function startSongPhysicsSafe(){
  stopSongPhysics();
  try {
    startSongPhysics();
  } catch (e) {
    console.error("Song physics failed:", e);
    stopSongPhysics();
  }
}

function startSongPhysics(){
  // stage must be visible or width/height becomes tiny
  const st = songsStage.getBoundingClientRect();
  if (st.width < 20 || st.height < 20) {
    raf = requestAnimationFrame(startSongPhysicsSafe);
    return;
  }

  // build bodies from real pixel positions
  const stageRect = songsStage.getBoundingClientRect();
  bodies = Array.from(songsStage.querySelectorAll(".songBubble")).map((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left - stageRect.left;
    const y = r.top  - stageRect.top;

    // force px positioning so animation works reliably
    el.style.left = x + "px";
    el.style.top  = y + "px";

    return {
      el,
      x, y,
      w: el.offsetWidth,
      h: el.offsetHeight,
      vx: (Math.random() * 0.15 + 0.04) * (Math.random() < 0.5 ? -1 : 1),
      vy: (Math.random() * 0.15 + 0.04) * (Math.random() < 0.5 ? -1 : 1),
      dragging: false,
      moved: false,
    };
  });

  const pad = 8;

  function step(){
    if (currentPage !== "songs") { stopSongPhysics(); return; }

    const sr = songsStage.getBoundingClientRect();
    const W = sr.width;
    const H = sr.height;

    // drift + walls
    for (const b of bodies){
      if (b.dragging) continue;

      

      b.vx = clamp(b.vx, -0.3, 0.3);
      b.vy = clamp(b.vy, -0.3, 0.3);

      b.x += b.vx;
      b.y += b.vy;

      const maxX = W - b.w - pad;
      const maxY = H - b.h - pad;

      if (b.x < pad){ b.x = pad; b.vx *= -0.75; }
      if (b.x > maxX){ b.x = maxX; b.vx *= -0.75; }
      if (b.y < pad){ b.y = pad; b.vy *= -0.75; }
      if (b.y > maxY){ b.y = maxY; b.vy *= -0.75; }
    }


    // apply
    for (const b of bodies){
      b.el.style.left = b.x + "px";
      b.el.style.top  = b.y + "px";
    }

    raf = requestAnimationFrame(step);
  }

  raf = requestAnimationFrame(step);
}

window.addEventListener("resize", () => {
  if (currentPage === "songs") startSongPhysicsSafe();
});
