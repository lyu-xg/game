// === THE GAME ===
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// === PLAYER ===
const player = {
  x: 30,
  y: 420,
  width: 32,
  height: 40,
  speedX: 0,
  speedY: 0,
  jumpPower: -14,
  speed: 4,
  onGround: false,
  color: "#FF6B6B",     // Kid: pick your color!
  eyeColor: "#FFFFFF",
  score: 0,
};

// === CONTROLS ===
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  // DEV: press 1, 2, 3... to jump straight to that level (handy for testing).
  if (/^[1-9]$/.test(e.key)) {
    const idx = parseInt(e.key, 10) - 1;
    if (idx < levels.length) {
      gameWon = false;
      levelClearAt = 0;
      loadLevel(idx);
    }
  }
});
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

// === GRAVITY ===
const gravity = 0.6;

// === LEVELS ===
// Each level holds all of its own platforms, coins, enemies, cannons, hazards,
// ramps, springs, and flag. Kid: design new levels by adding more entries here.
//
// Formats:
//   platform: [x, y, width, height, color]
//   coin:     [x, y]
//   enemy:    [x, y, leftBound, rightBound, color, hp, kind]
//             kind ∈ "walker" | "boss-toxic" | "boss-spiky"
//   cannon:   [x, y, fireRateFrames, color]
//   hazard:   [x, y, width, height, kind]    kind ∈ "electric"  (instant death)
//   ramp:     [x, y, width, height, slideDir]   slideDir ∈ "right" | "left"
//   spring:   [x, y, width, jumpPower]        — sits on top of a platform
//   water:    { y, height, color }            — region where the player swims
//   flag:     { x, y, width, height }
const levels = [
  // -------- LEVEL 1 (the kid's first notebook sketch) --------
  {
    name: "Level 1",
    skyColor: "#87CEEB",
    playerStart: { x: 30, y: 420 },
    platforms: [
      [0, 460, 800, 40, "#4A752C"],     // ground
      [60, 400, 110, 14, "#8B5E3C"],    // bottom-left ledge
      [150, 300, 130, 14, "#8B5E3C"],   // left raised — CANNON sits here
      [330, 330, 90, 14, "#8B5E3C"],    // middle small
      [440, 270, 110, 14, "#8B5E3C"],   // middle higher
      [560, 380, 220, 14, "#8B5E3C"],   // right boss platform
      [520, 210, 260, 14, "#8B5E3C"],   // top-right long (3 coins + flag)
    ],
    coins: [
      [105, 372], [370, 302], [485, 242],
      [560, 182], [620, 182], [680, 182],
    ],
    enemies: [
      // BOSS — green blob, toxic-waste bucket on head, spits acid LEFT.
      [660, 330, 560, 780, "#2EA34F", 2, "boss-toxic"],
    ],
    cannons: [
      [200, 270, 160, "#555"],
    ],
    hazards: [],
    ramps: [],
    springs: [],
    flag: { x: 758, y: 162, width: 6, height: 48 },
  },

  // -------- LEVEL 2 (robot lair — second sketch) --------
  {
    name: "Level 2",
    skyColor: "#2E2A4A",              // dark sci-fi blue
    playerStart: { x: 30, y: 420 },
    platforms: [
      [0, 460, 800, 40, "#3A3A48"],   // metal ground
      [40, 140, 130, 14, "#6A6A78"],  // top-left platform (1 coin)
      [80, 320, 200, 14, "#6A6A78"],  // left MECH platform (cannon sits here)
      [220, 420, 110, 14, "#6A6A78"], // lower-left ledge (next to ramp)
      [380, 420, 110, 14, "#6A6A78"], // bottom-middle (SPRING sits here)
      [490, 420, 310, 14, "#6A6A78"], // bottom-right boss platform
      [340, 340, 150, 14, "#6A6A78"], // middle long platform (2 coins)
      [520, 340, 100, 14, "#6A6A78"], // middle right (1 coin)
      [600, 270, 120, 14, "#6A6A78"], // right middle (1 coin)
      [680, 180, 120, 14, "#6A6A78"], // top-right (1 coin + flag)
    ],
    coins: [
      [85, 112],     // top-left platform
      [380, 312],    // middle long, coin 1
      [450, 312],    // middle long, coin 2
      [555, 312],    // middle right
      [635, 242],    // right middle
      [720, 152],    // top-right
      [255, 392],    // lower-left ledge (next to ramp)
      [415, 80],     // HIGH — only reachable by bouncing on the spring
      [560, 392],    // on the boss platform
    ],
    enemies: [
      // SPIKY BOSS — horned creature on the bottom-right platform
      [680, 372, 490, 800, "#8E5BD1", 2, "boss-spiky"],
    ],
    cannons: [
      // Left mech-robot: fires a bit faster than level 1's cannon
      [180, 290, 120, "#888"],
    ],
    hazards: [
      // Electric ceiling — don't jump too high or you'll get zapped!
      [180, 0, 540, 28, "electric"],
    ],
    ramps: [
      // Slide-down ramp on the ground, slope going down to the right
      [165, 432, 50, 28, "right"],
    ],
    springs: [
      // Bouncy pad on a low platform — launches you way up
      [410, 416, 30, -22],
    ],
    flag: { x: 778, y: 132, width: 6, height: 48 },
  },

  // -------- LEVEL 3 (lava cave — third sketch) --------
  {
    name: "Level 3",
    skyColor: "#241015",              // dark cave
    playerStart: { x: 30, y: 420 },
    platforms: [
      [0, 460, 800, 40, "#3A1F1F"],   // dark red ground
      [60, 420, 90, 14, "#4A3A3A"],   // bottom-left small
      [180, 380, 60, 14, "#4A3A3A"],  // step up
      [260, 430, 170, 14, "#4A3A3A"], // SNAKE platform
      [330, 360, 50, 14, "#4A3A3A"],  // left column mid
      [330, 290, 50, 14, "#4A3A3A"],  // left column high
      [410, 320, 50, 14, "#4A3A3A"],  // right column mid
      [410, 240, 50, 14, "#4A3A3A"],  // right column high
      [500, 280, 60, 14, "#4A3A3A"],  // right-middle
      [580, 220, 60, 14, "#4A3A3A"],  // higher-right
      [360, 140, 130, 14, "#4A3A3A"], // top-middle (under the 2 coins)
      [700, 430, 80, 14, "#4A3A3A"],  // bottom-right (FLAG)
    ],
    coins: [
      [85, 392],     // bottom-left small
      [195, 352],    // step
      [345, 332],    // left column mid
      [345, 262],    // left column high
      [425, 292],    // right column mid
      [425, 212],    // right column high
      [520, 252],    // right-middle
      [600, 192],    // higher-right
      [385, 112],    // top-middle coin 1
      [445, 112],    // top-middle coin 2
      [720, 402],    // bottom-right
      [495, 432],    // floating on ground (between snake and spikes)
    ],
    enemies: [
      // SNAKE — chomps; eating the player sends all collected coins back to
      // their original positions. Stompable (1 hp).
      [320, 388, 290, 410, "#7BA847", 1, "snake"],
      // Walker on the right-column mid platform (next to the coin)
      [420, 292, 410, 460, "#E07533", 1, "walker"],
    ],
    cannons: [],
    hazards: [
      // Right-side spike wall (stairs going down)
      [720, 280, 60, 80, "spike"],
      [620, 360, 90, 60, "spike"],
    ],
    ramps: [],
    springs: [],
    fireSpawners: [
      // Falling fireballs from the top-left side
      [80, 130, "#FF5522"],
      [140, 170, "#FF5522"],
      [200, 110, "#FF5522"],
    ],
    icicles: [
      // Hanging from the ceiling. Drop when the player passes underneath.
      [380, 0, 18, 28],
      [470, 0, 18, 28],
      [560, 0, 18, 28],
      [650, 0, 18, 28],
    ],
    flag: { x: 758, y: 412, width: 6, height: 48 },
  },

  // -------- LEVEL 4 (space / alien boss — fourth sketch) --------
  // Skeleton pass — boss + swim + crocodile + electric orb get added next.
  {
    name: "Level 4",
    skyColor: "#000000",
    showClouds: false,
    platformGrass: false,
    playerStart: { x: 30, y: 330 },
    platforms: [
      [0, 460, 800, 40, "#0A0A1A"],   // ocean floor (mostly hidden by water)
      [10, 370, 110, 14, "#6A6A78"],  // player start platform
      [20, 110, 300, 14, "#6A6A78"],  // BOSS platform (top-left)
      [220, 395, 130, 14, "#6A6A78"], // RESCUE platform just above water — climb out here
      [380, 290, 90, 14, "#6A6A78"],  // middle jumping platform
      [500, 230, 90, 14, "#6A6A78"],  // higher
      [640, 170, 100, 14, "#6A6A78"], // upper-right
    ],
    coins: [],
    enemies: [
      // BIG BOSS — purple alien with yellow arms, holds a pink ball + grey
      // cannon. Patrols the top platform, shoots pink energy balls.
      [80, 42, 20, 320, "#D32EBB", 7, "boss-alien"],
      // CROCODILE — patrols in the water. Body bites, back spikes also kill;
      // cannot be stomped. Unkillable hazard, like the snake.
      [400, 400, 180, 760, "#2A5840", 99, "crocodile"],
    ],
    cannons: [],
    hazards: [
      // Electric orb (yellow ball + spinning purple spikes). Touch = death.
      [560, 240, 60, 60, "electric-orb"],
    ],
    ramps: [],
    springs: [],
    fireSpawners: [],
    icicles: [],
    water: { y: 400, height: 100, color: "rgba(40, 90, 200, 0.55)" },
    // EGG — touch it and wait 3 seconds; it hatches into a pet that helps you
    // fight the boss. If the pet dies it respawns next to you. (Kid: move x/y!)
    egg: { x: 405, y: 256 },
    flag: { x: 758, y: 122, width: 6, height: 48 },
    winCondition: "kill-boss",
  },
  {
    name: "Level 5",
    skyColor: "#000000",
    showClouds: false,
    platformGrass: false,
    playerStart: { x: 45, y: 286 },
    platforms: [
      [0, 460, 800, 40, "#B5824A"],    // brown ground
      [30, 330, 140, 14, "#6A6A78"],   // start platform (left)
      [200, 300, 120, 14, "#6A6A78"],  // step up toward the boss
      [330, 200, 180, 14, "#6A6A78"],  // BOSS platform (center-top)
      [560, 250, 150, 14, "#6A6A78"],  // RED EGG platform (right)
      [600, 360, 150, 14, "#6A6A78"],  // lower-right platform
    ],
    coins: [],
    enemies: [
      // SKELETON-BIRD boss — patrols the top platform, throws spinning bones.
      [380, 136, 330, 510, "#B8B8C0", 7, "boss-skeleton"],
      // Grey CROCODILE patrols the left ground (unkillable hazard, like lvl 4).
      [80, 420, 40, 300, "#5A5A66", 99, "crocodile"],
      // CENTIPEDE crawls the right ground — stompable (2 hits).
      [420, 432, 360, 770, "#6E6E7A", 2, "centipede"],
    ],
    cannons: [],
    hazards: [],
    ramps: [],
    springs: [],
    fireSpawners: [],
    icicles: [],
    // RED egg → hatches the grey VOLCANO pet that erupts lava (kid's drawing).
    egg: {
      x: 612, y: 216,
      color: "#D8362A", edgeColor: "#8A2418", spotColor: "#9A9AA2",
      petKind: "volcano", petBeam: "#FF5522",
    },
    flag: { x: 740, y: 402, width: 6, height: 48 },
    winCondition: "kill-boss",
  },
];

// === ACTIVE LEVEL STATE ===
// These get reassigned by loadLevel(); the main loop reads from them.
let currentLevel = 0;
let platforms, coins, enemies, cannons, hazards, ramps, springs, fireSpawners, icicles, flag, playerStart;
// coinState mirrors `coins` per level but is mutable — snake can scatter them around.
let coinState = [];
const collectedCoins = new Set();
const bullets = [];
const acidBalls = [];
const fireballs = [];
// EGG + PETS: touching an egg (after 3s) hatches a helper pet that shoots the
// boss. Pets you've hatched FOLLOW YOU into later levels — but you can only ever
// have MAX_PETS at once.
// egg: null when the level has no egg, else { x, y, state, touchedAt }.
//   state: "idle" → "hatching" (3s timer) → "hatched".
// pets: array of { x, y, hp, maxHp, alive, deadAt, fireCd, kind, ... }.
const MAX_PETS = 3;
let egg = null;
let pets = [];
const petBeams = [];
let frameCount = 0;

// Tuning constants (shared across levels)
const enemySpeed = 1.4;
const bulletSpeed = 4;
const bossFireRate = 110;        // frames between boss acid spits

// === CLOUDS (decoration, shared) ===
const clouds = [
  [100, 50, 80, 30],
  [350, 30, 100, 35],
  [600, 60, 70, 25],
];

// "won" is the level/game finished state:
//   levelClearAt > 0  → showing "Level Clear" banner until auto-advance
//   gameWon === true  → all levels done, show YOU WIN forever
let levelClearAt = 0;
let gameWon = false;
const levelClearMs = 1800;

// === LOAD A LEVEL ===
function loadLevel(n) {
  currentLevel = n;
  const lvl = levels[n];
  platforms = lvl.platforms;
  coins = lvl.coins;
  enemies = lvl.enemies;
  cannons = lvl.cannons;
  hazards = lvl.hazards || [];
  ramps = lvl.ramps || [];
  springs = lvl.springs || [];
  fireSpawners = lvl.fireSpawners || [];
  // Icicles: clone each so the per-icicle runtime state (falling, y position)
  // doesn't leak back into the level's literal data when we reset.
  icicles = (lvl.icicles || []).map(i => ({
    x: i[0], y0: i[1], w: i[2], h: i[3],
    y: i[1], state: "idle",   // "idle" | "falling" | "broken"
  }));
  flag = lvl.flag;
  playerStart = lvl.playerStart;

  // Re-init enemy runtime fields (idempotent — works on first load AND reloads)
  for (const e of enemies) {
    if (e.length > 7) e.length = 7;
    e.push(e[5]);   // [7] initialHp
    e.push(1);      // [8] direction
    e.push(true);   // [9] alive
  }

  // Fresh mutable copy of coin positions
  coinState = coins.map(c => [c[0], c[1]]);

  // Egg resets each level; PETS carry over (they follow you to the next level).
  egg = lvl.egg ? { ...lvl.egg, state: "idle", touchedAt: 0 } : null;
  petBeams.length = 0;
  // Bring carried-over pets back to life and snap them next to the new start.
  for (const p of pets) {
    p.alive = true;
    p.hp = p.maxHp;
    p.x = lvl.playerStart.x - 30;
    p.y = lvl.playerStart.y - 22;
    p.fireCd = 30;
  }

  collectedCoins.clear();
  bullets.length = 0;
  acidBalls.length = 0;
  fireballs.length = 0;
  player.x = playerStart.x;
  player.y = playerStart.y;
  player.speedX = 0;
  player.speedY = 0;
}

// Honor ?level=N in the URL so screenshots/links can jump straight into a level.
const _initialLevel = (() => {
  const m = location.search.match(/[?&]level=(\d+)/);
  if (!m) return 0;
  const idx = parseInt(m[1], 10) - 1;
  return idx >= 0 && idx < levels.length ? idx : 0;
})();
loadLevel(_initialLevel);

// === DRAW THE PLAYER ===
function drawPlayer() {
  const p = player;

  ctx.fillStyle = p.color;
  ctx.fillRect(p.x, p.y, p.width, p.height);

  ctx.fillStyle = p.eyeColor;
  const eyeDir = p.speedX > 0 ? 4 : p.speedX < 0 ? -2 : 2;
  ctx.fillRect(p.x + 8 + eyeDir, p.y + 8, 6, 6);
  ctx.fillRect(p.x + 18 + eyeDir, p.y + 8, 6, 6);

  ctx.fillStyle = "#222";
  ctx.fillRect(p.x + 10 + eyeDir, p.y + 10, 3, 3);
  ctx.fillRect(p.x + 20 + eyeDir, p.y + 10, 3, 3);

  ctx.fillStyle = "#222";
  if (player.score > 0) {
    ctx.fillRect(p.x + 10, p.y + 24, 12, 2);
    ctx.fillRect(p.x + 8, p.y + 22, 2, 2);
    ctx.fillRect(p.x + 22, p.y + 22, 2, 2);
  } else {
    ctx.fillRect(p.x + 10, p.y + 22, 12, 2);
  }
}

// === DRAW AN ENEMY ===
function drawEnemy(e) {
  const [x, y, lb, rb, color, hp, kind, initHp, dir, alive] = e;
  if (!alive) return;

  if (kind === "boss-toxic") { drawBoss(e); return; }
  if (kind === "boss-spiky") { drawBossSpiky(e); return; }
  if (kind === "boss-alien") { drawBossAlien(e); return; }
  if (kind === "boss-skeleton") { drawSkeletonBird(e); return; }
  if (kind === "snake") { drawSnake(e); return; }
  if (kind === "crocodile") { drawCrocodile(e); return; }
  if (kind === "centipede") { drawCentipede(e); return; }

  const w = 32, h = 28;

  // Body
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  // Spiky top
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(x + i * 8, y);
    ctx.lineTo(x + i * 8 + 4, y - 6);
    ctx.lineTo(x + i * 8 + 8, y);
  }
  ctx.fill();

  // Eyes
  const eyeShift = dir > 0 ? 3 : -1;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x + 6 + eyeShift, y + 8, 7, 7);
  ctx.fillRect(x + 18 + eyeShift, y + 8, 7, 7);
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 8 + eyeShift, y + 10, 4, 4);
  ctx.fillRect(x + 20 + eyeShift, y + 10, 4, 4);

  // Mouth
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 8, y + 20, 16, 2);
  ctx.fillRect(x + 8, y + 22, 2, 2);
  ctx.fillRect(x + 22, y + 22, 2, 2);

  // Feet
  const footWiggle = Math.floor(Date.now() / 150) % 2 === 0 ? 0 : 2;
  ctx.fillRect(x + 4, y + h, 8, 3 + footWiggle);
  ctx.fillRect(x + w - 12, y + h, 8, 3 + (2 - footWiggle));
}

// === DRAW THE BOSS ===
// Green blob with sharp teeth. An UPSIDE-DOWN bucket of toxic waste sits on its
// head — the waste drips down into the body, glows through the skin, and
// eventually gets spat out the mouth as acid balls.
function drawBoss(e) {
  const x = e[0], y = e[1], hp = e[5];
  const w = 64, h = 50;

  // --- Body (round green blob, slightly glowing from the toxic waste) ---
  // outer glow
  ctx.fillStyle = "rgba(184, 230, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 14, w / 2 + 2, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  ctx.fillStyle = "#5DBE5C";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 14, w / 2 - 2, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2E7B40";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Toxic waste sloshing inside the belly (visible through the skin)
  const slosh = Math.sin(Date.now() / 400) * 2;
  ctx.fillStyle = "rgba(184, 230, 0, 0.55)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 10 + slosh, w / 2 - 8, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // a couple of bubbles inside the belly
  ctx.fillStyle = "rgba(230, 255, 128, 0.7)";
  ctx.beginPath();
  ctx.arc(x + w / 2 - 8, y + h - 14 + slosh, 1.8, 0, Math.PI * 2);
  ctx.arc(x + w / 2 + 6, y + h - 16 + slosh, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // --- Sharp teeth (mouth on the LEFT side, since it spits left) ---
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#2E7B40";
  ctx.lineWidth = 1.5;
  const teethY = y + h - 10;
  ctx.beginPath();
  ctx.moveTo(x + 4, teethY - 2);
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(x + 4 + i * 5 + 2.5, teethY + 7);
    ctx.lineTo(x + 4 + (i + 1) * 5, teethY - 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing eye (single big eye, like the sketch)
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(x + w / 2 - 4, y + h - 26, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#B8E600";
  ctx.beginPath();
  ctx.arc(x + w / 2 - 6, y + h - 26, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x + w / 2 - 7, y + h - 26, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // --- UPSIDE-DOWN bucket on top of head (opening pointing down) ---
  ctx.save();
  ctx.translate(x + w / 2 + 4, y + 12);
  ctx.rotate(-0.12);

  // Bucket body — inverted trapezoid: narrow top (closed bottom of bucket),
  // wide bottom (the opening, facing down into the head)
  ctx.fillStyle = "#2BC4D6";
  ctx.beginPath();
  ctx.moveTo(-13, -14);   // top-left (closed bottom of bucket)
  ctx.lineTo(13, -14);    // top-right
  ctx.lineTo(16, 12);     // bottom-right (rim of opening)
  ctx.lineTo(-16, 12);    // bottom-left (rim of opening)
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1A6A77";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Metal bands
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-14, -4); ctx.lineTo(14, -4);
  ctx.moveTo(-15, 6); ctx.lineTo(15, 6);
  ctx.stroke();

  // Dark rim of the (now downward-facing) opening
  ctx.strokeStyle = "#0E4750";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, 12); ctx.lineTo(16, 12);
  ctx.stroke();

  // Toxic waste DRIPPING out the bottom into the head
  ctx.fillStyle = "#B8E600";
  ctx.beginPath();
  ctx.ellipse(0, 13, 12, 3, 0, 0, Math.PI);
  ctx.fill();
  // Animated drips falling into the head
  const dripT = (Date.now() / 80) % 30;
  ctx.fillStyle = "#B8E600";
  ctx.beginPath();
  ctx.arc(-6, 14 + dripT * 0.4, 2, 0, Math.PI * 2);
  ctx.arc(5, 14 + ((dripT + 15) % 30) * 0.4, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Bucket handle (curving over the now-closed top)
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -14, 17, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Biohazard badge on the side
  ctx.fillStyle = "#B8E600";
  ctx.beginPath();
  ctx.arc(0, -2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1A6A77";
  ctx.font = "bold 9px monospace";
  ctx.fillText("☢", -3.5, 1);

  ctx.restore();

  // --- Damage crack on the bucket if half-stomped ---
  if (hp === 1) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + 2, y);
    ctx.lineTo(x + w / 2 - 3, y + 6);
    ctx.lineTo(x + w / 2 + 1, y + 12);
    ctx.lineTo(x + w / 2 - 2, y + 20);
    ctx.stroke();
  }
}

// === DRAW AN ACID / SPIKE / PINK BALL ===
function drawAcidBall(a) {
  if (a.pink) {
    // Pink energy ball (alien boss weapon)
    ctx.fillStyle = "rgba(255, 64, 208, 0.45)";
    ctx.beginPath();
    ctx.arc(a.x, a.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF40D0";
    ctx.beginPath();
    ctx.arc(a.x, a.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFCCEE";
    ctx.beginPath();
    ctx.arc(a.x - 2, a.y - 2, 2.4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (a.spiky) {
    // Spike ball — purple core with radiating spikes (boss-spiky's weapon)
    const spin = (Date.now() / 50) % 360;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate((spin * Math.PI) / 180);
    ctx.fillStyle = "#8E5BD1";
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(11, -2);
      ctx.lineTo(11, 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#5C3A8C";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (a.bone) {
    // Spinning bone — the skeleton boss's throw (level 5)
    const spin = (Date.now() / 90) % (Math.PI * 2);
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(spin);
    ctx.strokeStyle = "#EDE8DC";
    ctx.fillStyle = "#EDE8DC";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    for (const [ex, ey] of [[-6, -3], [-6, 3], [6, -3], [6, 3]]) {
      ctx.beginPath();
      ctx.arc(ex, ey, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  // Default toxic acid ball — green blob
  ctx.fillStyle = "rgba(184, 230, 0, 0.4)";
  ctx.beginPath();
  ctx.arc(a.x, a.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#B8E600";
  ctx.beginPath();
  ctx.arc(a.x, a.y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#E6FF80";
  ctx.beginPath();
  ctx.arc(a.x - 2.5, a.y - 2.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(123, 160, 0, 0.5)";
  ctx.beginPath();
  ctx.arc(a.x + 6, a.y - 1, 2, 0, Math.PI * 2);
  ctx.fill();
}

// === DRAW THE SPIKY BOSS ===
// Purple horned creature with antennae — second-level boss from the sketch.
function drawBossSpiky(e) {
  const x = e[0], y = e[1], hp = e[5];
  const w = 64, h = 50;

  // Body (rounded rectangle, dark purple)
  ctx.fillStyle = e[4] || "#8E5BD1";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2 + 6, w / 2 - 2, h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4F2C7B";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cross-hatch texture on body
  ctx.strokeStyle = "rgba(79, 44, 123, 0.6)";
  ctx.lineWidth = 1;
  for (let i = -2; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 8 + i * 8, y + h - 4);
    ctx.lineTo(x + 8 + i * 8 + 14, y + 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 8 + i * 8 + 14, y + h - 4);
    ctx.lineTo(x + 8 + i * 8, y + 20);
    ctx.stroke();
  }

  // Horns on top (4 spikes)
  ctx.fillStyle = "#5C3A8C";
  for (let i = 0; i < 4; i++) {
    const hx = x + 10 + i * 14;
    ctx.beginPath();
    ctx.moveTo(hx, y + 12);
    ctx.lineTo(hx + 5, y - 14);
    ctx.lineTo(hx + 10, y + 12);
    ctx.closePath();
    ctx.fill();
  }

  // Antennae (two waving)
  const wig = Math.sin(Date.now() / 250) * 4;
  ctx.strokeStyle = "#5C3A8C";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 10, y - 4);
  ctx.lineTo(x + 4 + wig, y - 18);
  ctx.moveTo(x + w - 10, y - 4);
  ctx.lineTo(x + w - 4 - wig, y - 18);
  ctx.stroke();
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(x + 4 + wig, y - 18, 2.5, 0, Math.PI * 2);
  ctx.arc(x + w - 4 - wig, y - 18, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyes — wide, angry
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x + 14, y + 18, 10, 9);
  ctx.fillRect(x + w - 24, y + 18, 10, 9);
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 16, y + 22, 4, 4);
  ctx.fillRect(x + w - 22, y + 22, 4, 4);

  // Toothy grin
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#4F2C7B";
  ctx.lineWidth = 1;
  const mouthY = y + h - 6;
  ctx.beginPath();
  ctx.moveTo(x + 14, mouthY - 2);
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(x + 14 + i * 6 + 3, mouthY + 5);
    ctx.lineTo(x + 14 + (i + 1) * 6, mouthY - 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Whip-arm extending left (drawn behind, simple line + claw)
  ctx.strokeStyle = "#5C3A8C";
  ctx.lineWidth = 3;
  const armSwing = Math.sin(Date.now() / 400) * 6;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 30);
  ctx.lineTo(x - 22, y + 34 + armSwing);
  ctx.lineTo(x - 36, y + 28 + armSwing);
  ctx.stroke();
  // claw
  ctx.fillStyle = "#5C3A8C";
  ctx.beginPath();
  ctx.moveTo(x - 36, y + 28 + armSwing);
  ctx.lineTo(x - 44, y + 24 + armSwing);
  ctx.lineTo(x - 40, y + 32 + armSwing);
  ctx.closePath();
  ctx.fill();

  // Damage indicator
  if (hp === 1) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 14);
    ctx.lineTo(x + w / 2 - 4, y + 26);
    ctx.lineTo(x + w / 2 + 2, y + 36);
    ctx.stroke();
  }
}

// === DRAW THE ALIEN BOSS ===
// Big magenta blob with grey spots, white head with two purple eyes, two yellow
// arms — one holding a pink energy ball, one holding a grey cannon.
function drawBossAlien(e) {
  const x = e[0], y = e[1], hp = e[5], dir = e[8] || 1;
  const w = 70, h = 70;
  const t = Date.now();
  const breath = Math.sin(t / 600) * 1.5;
  const wave = Math.sin(t / 220) * 3;

  // Body — magenta blob
  ctx.fillStyle = "#D32EBB";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.62 + breath, w / 2 - 4, h * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7A0A6E";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Grey spots scattered on body
  ctx.fillStyle = "#888892";
  const spots = [[16, 50, 6], [40, 56, 5], [28, 44, 4], [50, 50, 5], [22, 60, 3], [44, 64, 4]];
  for (const [sx, sy, sr] of spots) {
    ctx.beginPath();
    ctx.arc(x + sx, y + sy + breath, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head — pale, sits on top of body
  ctx.fillStyle = "#F0E8D8";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 18, w / 2 - 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8A7A6A";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Two purple eyes (track player direction)
  const eyeShift = dir > 0 ? 1 : -1;
  ctx.fillStyle = "#D32EBB";
  ctx.beginPath();
  ctx.arc(x + w / 2 - 9 + eyeShift, y + 16, 4, 0, Math.PI * 2);
  ctx.arc(x + w / 2 + 7 + eyeShift, y + 16, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x + w / 2 - 9 + eyeShift, y + 16, 1.8, 0, Math.PI * 2);
  ctx.arc(x + w / 2 + 7 + eyeShift, y + 16, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Frowny mouth
  ctx.strokeStyle = "#5A3848";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 30, 4, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // --- Arms: yellow, swing while walking ---
  ctx.lineCap = "round";
  ctx.strokeStyle = "#FFE040";
  ctx.lineWidth = 6;

  // Ball-holding arm (always on the LEFT visually)
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 40);
  ctx.lineTo(x - 4, y + 50 + wave);
  ctx.stroke();
  // Pink energy ball in hand
  ctx.fillStyle = "rgba(255, 64, 208, 0.5)";
  ctx.beginPath();
  ctx.arc(x - 8, y + 54 + wave, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FF40D0";
  ctx.beginPath();
  ctx.arc(x - 8, y + 54 + wave, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFCCEE";
  ctx.beginPath();
  ctx.arc(x - 10, y + 52 + wave, 2, 0, Math.PI * 2);
  ctx.fill();

  // Cannon arm (always on the RIGHT visually)
  ctx.strokeStyle = "#FFE040";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + w - 16, y + 40);
  ctx.lineTo(x + w + 4, y + 44 - wave);
  ctx.stroke();
  // Cannon barrel (grey)
  ctx.fillStyle = "#555";
  ctx.fillRect(x + w, y + 36 - wave, 20, 14);
  ctx.fillStyle = "#888";
  ctx.fillRect(x + w + 2, y + 38 - wave, 16, 4);   // highlight
  ctx.fillStyle = "#222";
  ctx.fillRect(x + w + 18, y + 39 - wave, 4, 8);   // dark muzzle

  // Damage cracks
  if (hp <= 2) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + 6, y + 34);
    ctx.lineTo(x + w / 2 - 2, y + 46);
    ctx.lineTo(x + w / 2 + 4, y + 58);
    ctx.stroke();
  }
  if (hp <= 1) {
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 18, y + 40);
    ctx.lineTo(x + w / 2 - 10, y + 52);
    ctx.lineTo(x + w / 2 - 18, y + 64);
    ctx.stroke();
  }
}

// === DRAW A HAZARD ===
function drawHazard(h) {
  const [x, y, w, height, kind] = h;

  if (kind === "electric-orb") {
    // Spinning purple spike crown around a yellow electric ball
    const cx = x + w / 2, cy = y + height / 2;
    const r = Math.min(w, height) / 2 - 4;
    const t = Date.now() / 70;

    // Spike crown
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.03);
    ctx.fillStyle = "#A040D0";
    ctx.strokeStyle = "#5A1A88";
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.rotate((Math.PI * 2) / 10);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r + 14, -3);
      ctx.lineTo(r + 14, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Outer glow
    ctx.fillStyle = "rgba(255, 220, 0, 0.4)";
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fill();

    // Yellow ball
    ctx.fillStyle = "#FFEC00";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#B8A800";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Electric arcs inside
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a1 = ((Math.PI * 2) / 6) * i + t * 0.04;
      const a2 = a1 + Math.PI * 0.4;
      const r1 = r * 0.3;
      const r2 = r * 0.85;
      ctx.moveTo(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1);
      ctx.lineTo(cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2);
    }
    ctx.stroke();

    // Bright center
    ctx.fillStyle = "#FFFFCC";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (kind === "spike") {
    // Static spike wall (right-side stairs in level 3)
    ctx.fillStyle = "#888892";
    ctx.fillRect(x, y, w, height);
    ctx.fillStyle = "#C0C0CC";
    ctx.strokeStyle = "#2A2A36";
    ctx.lineWidth = 1;
    const tooth = 12;
    // tooth pattern on each visible edge — top, bottom, left, right
    const drawTeeth = (count, fn) => {
      ctx.beginPath();
      for (let i = 0; i < count; i++) fn(i);
      ctx.fill();
      ctx.stroke();
    };
    const cTop = Math.max(1, Math.floor(w / tooth));
    const stepTop = w / cTop;
    drawTeeth(cTop, (i) => {
      const tx = x + i * stepTop;
      ctx.moveTo(tx, y);
      ctx.lineTo(tx + stepTop / 2, y - tooth);
      ctx.lineTo(tx + stepTop, y);
    });
    const cLeft = Math.max(1, Math.floor(height / tooth));
    const stepLeft = height / cLeft;
    drawTeeth(cLeft, (i) => {
      const ty = y + i * stepLeft;
      ctx.moveTo(x, ty);
      ctx.lineTo(x - tooth, ty + stepLeft / 2);
      ctx.lineTo(x, ty + stepLeft);
    });
    return;
  }

  if (kind !== "electric") return;

  // Dark cloud backdrop
  ctx.fillStyle = "rgba(80, 60, 130, 0.5)";
  ctx.fillRect(x, y, w, height);

  // Animated zigzag lightning bolts
  const t = Date.now() / 80;
  ctx.strokeStyle = "#FFFF66";
  ctx.lineWidth = 2;
  ctx.beginPath();
  const seg = 24;
  for (let bx = x; bx < x + w; bx += seg) {
    const offset = Math.sin(t + bx * 0.04) * (height * 0.4);
    ctx.moveTo(bx, y + height * 0.2 + offset);
    ctx.lineTo(bx + seg / 2, y + height - 4);
    ctx.lineTo(bx + seg, y + height * 0.2 + offset);
  }
  ctx.stroke();

  // Spark dots flickering
  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < 6; i++) {
    const sx = x + ((i * 73 + Math.floor(t)) % w);
    const sy = y + ((i * 11 + Math.floor(t * 2)) % (height - 4)) + 2;
    ctx.fillRect(sx, sy, 2, 2);
  }
}

// === DRAW A RAMP ===
function drawRamp(r) {
  const [x, y, w, h, dir] = r;
  ctx.fillStyle = "#5C7A8C";
  ctx.strokeStyle = "#2A3A48";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (dir === "right") {
    // Tall on left, slope down to right
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y + h);
  } else {
    // Tall on right, slope down to left
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Slide arrow
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 14px monospace";
  ctx.fillText(dir === "right" ? "→" : "←", x + w / 2 - 6, y + h - 6);
}

// === DRAW THE SNAKE ===
// Coiled green serpent with an animated mouth that opens and closes.
function drawSnake(e) {
  const x = e[0], y = e[1];
  const w = 56, h = 36;
  const t = Date.now() / 400;
  const chomp = (Math.sin(t) + 1) / 2;   // 0..1 open amount

  // Coiled body (two big circles forming a coil)
  ctx.fillStyle = e[4] || "#7BA847";
  ctx.beginPath();
  ctx.arc(x + 24, y + 26, 18, 0, Math.PI * 2);
  ctx.arc(x + 36, y + 22, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3F5F2B";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pattern stripes on the body
  ctx.strokeStyle = "rgba(63, 95, 43, 0.6)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x + 24, y + 26, 10 + i * 2, Math.PI * 0.2, Math.PI * 0.7);
    ctx.stroke();
  }

  // Head — to the left of the body, raised
  const hx = x + 4;
  const hy = y + 8;
  ctx.fillStyle = e[4] || "#7BA847";
  ctx.beginPath();
  ctx.ellipse(hx + 10, hy + 8, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3F5F2B";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eye
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(hx + 6, hy + 5, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(hx + 5, hy + 5, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Open mouth — animated
  const openY = chomp * 6;
  ctx.fillStyle = "#3F1A1A";
  ctx.beginPath();
  ctx.moveTo(hx, hy + 8);
  ctx.lineTo(hx - 8, hy + 4 - openY);
  ctx.lineTo(hx - 10, hy + 8);
  ctx.lineTo(hx - 8, hy + 12 + openY);
  ctx.closePath();
  ctx.fill();

  // Fangs
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(hx - 4, hy + 4 - openY * 0.4);
  ctx.lineTo(hx - 6, hy + 8);
  ctx.lineTo(hx - 2, hy + 7);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx - 4, hy + 12 + openY * 0.4);
  ctx.lineTo(hx - 6, hy + 8);
  ctx.lineTo(hx - 2, hy + 9);
  ctx.closePath();
  ctx.fill();

  // Forked tongue (only when mouth is open enough)
  if (chomp > 0.5) {
    ctx.strokeStyle = "#E63";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx - 10, hy + 8);
    ctx.lineTo(hx - 18, hy + 8);
    ctx.moveTo(hx - 18, hy + 8);
    ctx.lineTo(hx - 22, hy + 4);
    ctx.moveTo(hx - 18, hy + 8);
    ctx.lineTo(hx - 22, hy + 12);
    ctx.stroke();
  }
}

// === DRAW THE CROCODILE ===
// Long dark-green body with a saw-tooth spiky back. Mouth at the leading edge
// opens and snaps shut. Drawn flipped based on patrol direction.
function drawCrocodile(e) {
  const x = e[0], y = e[1], dir = e[8];
  const w = 80, h = 40;
  const t = Date.now();
  const chomp = (Math.sin(t / 350) + 1) / 2;   // 0..1 mouth-open factor

  ctx.save();
  // Default the head points LEFT. Flip horizontally when patrolling right.
  if (dir > 0) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, y);
  }

  // Body (lower 2/3 of bounding box)
  const bodyTop = h * 0.28;
  ctx.fillStyle = e[4] || "#2A5840";
  ctx.beginPath();
  ctx.ellipse(w / 2, bodyTop + 14, w / 2 - 4, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#11261A";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Spiky back (saw-tooth pointing UP, in the top 1/3)
  ctx.fillStyle = "#1A3826";
  ctx.strokeStyle = "#0E2418";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const sx = 16 + i * 7;
    ctx.moveTo(sx, bodyTop + 4);
    ctx.lineTo(sx + 3.5, bodyTop - 8);
    ctx.lineTo(sx + 7, bodyTop + 4);
  }
  ctx.fill();
  ctx.stroke();

  // Tail (right side narrows)
  ctx.fillStyle = e[4] || "#2A5840";
  ctx.beginPath();
  ctx.moveTo(w - 8, bodyTop + 10);
  ctx.lineTo(w + 4, bodyTop + 14);
  ctx.lineTo(w - 8, bodyTop + 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#11261A";
  ctx.stroke();

  // Snout — extends LEFT, opens with chomp
  const openY = chomp * 7;
  ctx.fillStyle = e[4] || "#2A5840";
  // upper jaw
  ctx.beginPath();
  ctx.moveTo(2, bodyTop + 12 - openY);
  ctx.lineTo(20, bodyTop + 8);
  ctx.lineTo(20, bodyTop + 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // lower jaw
  ctx.beginPath();
  ctx.moveTo(2, bodyTop + 14 + openY);
  ctx.lineTo(20, bodyTop + 18);
  ctx.lineTo(20, bodyTop + 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mouth interior (when open)
  if (chomp > 0.3) {
    ctx.fillStyle = "#3F1A1A";
    ctx.beginPath();
    ctx.moveTo(2, bodyTop + 12 - openY);
    ctx.lineTo(20, bodyTop + 14);
    ctx.lineTo(2, bodyTop + 14 + openY);
    ctx.closePath();
    ctx.fill();
  }

  // Teeth (white triangles, top + bottom)
  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < 5; i++) {
    const tx = 4 + i * 3;
    ctx.beginPath();
    ctx.moveTo(tx, bodyTop + 12 - openY * 0.6);
    ctx.lineTo(tx + 1.5, bodyTop + 14);
    ctx.lineTo(tx + 3, bodyTop + 12 - openY * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tx, bodyTop + 14 + openY * 0.6);
    ctx.lineTo(tx + 1.5, bodyTop + 14);
    ctx.lineTo(tx + 3, bodyTop + 14 + openY * 0.6);
    ctx.closePath();
    ctx.fill();
  }

  // Eye on top of body
  ctx.fillStyle = "#FFEE60";
  ctx.beginPath();
  ctx.arc(28, bodyTop + 6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(28, bodyTop + 6, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// === DRAW THE SKELETON-BIRD BOSS === (level 5, grey bone bird with red crest)
function drawSkeletonBird(e) {
  const x = e[0], y = e[1], hp = e[5], dir = e[8] || 1;
  const w = 56, h = 64;
  const t = Date.now();
  const flap = Math.sin(t / 180) * 6;     // wing flap
  const cx = x + w / 2;

  const bone = "#B8B8C0", boneDark = "#7C7C86";

  // --- Wings (two grey fan shapes, flapping) ---
  ctx.fillStyle = bone;
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 1.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * 6, y + 24);
    ctx.lineTo(cx + side * 26, y + 18 - flap);
    ctx.lineTo(cx + side * 24, y + 30 - flap * 0.5);
    ctx.lineTo(cx + side * 22, y + 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // wing bone ribs
    ctx.beginPath();
    ctx.moveTo(cx + side * 6, y + 24);
    ctx.lineTo(cx + side * 24, y + 24 - flap * 0.6);
    ctx.stroke();
  }

  // --- Spine + ribcage ---
  ctx.strokeStyle = bone;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, y + 18);
  ctx.lineTo(cx, y + 48);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) {
    const ry = y + 24 + i * 6;
    ctx.beginPath();
    ctx.arc(cx, ry, 7 - i, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, ry, 7 - i, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // --- Legs (thin, two-jointed) ---
  ctx.strokeStyle = bone;
  ctx.lineWidth = 2.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx, y + 48);
    ctx.lineTo(cx + side * 8, y + 56);
    ctx.lineTo(cx + side * 6, y + h);
    ctx.stroke();
    // foot claws
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + side * 6, y + h);
    ctx.lineTo(cx + side * 11, y + h + 2);
    ctx.moveTo(cx + side * 6, y + h);
    ctx.lineTo(cx + side * 2, y + h + 2);
    ctx.stroke();
    ctx.lineWidth = 2.5;
  }

  // --- Skull ---
  ctx.fillStyle = bone;
  ctx.strokeStyle = boneDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, y + 12, 12, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // beak
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.moveTo(cx + dir * 10, y + 12);
  ctx.lineTo(cx + dir * 20, y + 14);
  ctx.lineTo(cx + dir * 10, y + 17);
  ctx.closePath();
  ctx.fill();
  // eye sockets (dark, glowing red dot looking at player dir)
  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.arc(cx - 4, y + 11, 3, 0, Math.PI * 2);
  ctx.arc(cx + 4, y + 11, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FF3030";
  ctx.beginPath();
  ctx.arc(cx - 4 + dir, y + 11, 1.3, 0, Math.PI * 2);
  ctx.arc(cx + 4 + dir, y + 11, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // --- Red crest (the brain-like mark on the head) ---
  ctx.fillStyle = "#D8362A";
  ctx.beginPath();
  ctx.arc(cx - 2, y + 2, 3, 0, Math.PI * 2);
  ctx.arc(cx + 2, y + 2, 3, 0, Math.PI * 2);
  ctx.arc(cx, y - 1, 3, 0, Math.PI * 2);
  ctx.fill();

  // Damage cracks on the skull
  if (hp <= 2) {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 2, y + 5);
    ctx.lineTo(cx - 2, y + 11);
    ctx.lineTo(cx + 3, y + 16);
    ctx.stroke();
  }
}

// === DRAW A CENTIPEDE === (level 5, segmented ground crawler)
function drawCentipede(e) {
  const x = e[0], y = e[1], dir = e[8] || 1;
  const segs = 6, r = 9, step = 11;
  const t = Date.now();

  // Legs first (behind body)
  ctx.strokeStyle = "#5A5A66";
  ctx.lineWidth = 2;
  for (let i = 0; i < segs; i++) {
    const sx = x + 10 + i * step;
    const wig = Math.sin(t / 120 + i) * 3;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx, y + r);
      ctx.lineTo(sx + side * 4, y + r + 8 + wig * side);
      ctx.stroke();
    }
  }

  // Body segments
  for (let i = 0; i < segs; i++) {
    const sx = x + 10 + i * step;
    const bob = Math.sin(t / 120 + i) * 2;
    ctx.fillStyle = i % 2 === 0 ? "#6E6E7A" : "#585866";
    ctx.beginPath();
    ctx.arc(sx, y + r + bob, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3C3C46";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Head (leading segment in patrol direction)
  const hx = dir > 0 ? x + 10 + (segs - 1) * step : x + 10;
  ctx.fillStyle = "#7A7A88";
  ctx.beginPath();
  ctx.arc(hx, y + r, r + 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3C3C46";
  ctx.stroke();
  // red eye + little mandibles
  ctx.fillStyle = "#E0332A";
  ctx.beginPath();
  ctx.arc(hx + dir * 3, y + r - 2, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2A2A30";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hx + dir * (r - 1), y + r + 2);
  ctx.lineTo(hx + dir * (r + 5), y + r);
  ctx.moveTo(hx + dir * (r - 1), y + r + 5);
  ctx.lineTo(hx + dir * (r + 5), y + r + 6);
  ctx.stroke();
}

// === DRAW A FALLING FIREBALL ===
function drawFireball(f) {
  // Outer flame glow
  ctx.fillStyle = "rgba(255, 100, 0, 0.4)";
  ctx.beginPath();
  ctx.arc(f.x, f.y, 12, 0, Math.PI * 2);
  ctx.fill();
  // Body
  ctx.fillStyle = "#FF5522";
  ctx.beginPath();
  ctx.arc(f.x, f.y, 8, 0, Math.PI * 2);
  ctx.fill();
  // Inner hot core
  ctx.fillStyle = "#FFC130";
  ctx.beginPath();
  ctx.arc(f.x - 1, f.y - 2, 4, 0, Math.PI * 2);
  ctx.fill();
  // Trailing flame above (since it's falling)
  ctx.fillStyle = "rgba(255, 200, 60, 0.5)";
  ctx.beginPath();
  ctx.moveTo(f.x - 5, f.y - 4);
  ctx.lineTo(f.x, f.y - 18);
  ctx.lineTo(f.x + 5, f.y - 4);
  ctx.closePath();
  ctx.fill();
}

// === DRAW A FIRE SPAWNER (small glow at the top to hint where fire drops) ===
function drawFireSpawner(s) {
  const [x, y, , color] = s;
  ctx.fillStyle = "rgba(255, 100, 0, 0.35)";
  ctx.beginPath();
  ctx.arc(x, 6, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color || "#FF5522";
  ctx.beginPath();
  ctx.arc(x, 4, 5, 0, Math.PI * 2);
  ctx.fill();
}

// === DRAW AN ICICLE ===
function drawIcicle(ic) {
  if (ic.state === "broken") return;
  const wobble = ic.state === "idle"
    ? Math.sin(Date.now() / 600 + ic.x) * 0.5
    : 0;
  // Body — narrowing triangle pointing down
  ctx.fillStyle = "#B8E6FF";
  ctx.strokeStyle = "#3A7080";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ic.x + wobble, ic.y);
  ctx.lineTo(ic.x + ic.w + wobble, ic.y);
  ctx.lineTo(ic.x + ic.w / 2 + wobble, ic.y + ic.h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Highlight stripe
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ic.x + 4 + wobble, ic.y + 4);
  ctx.lineTo(ic.x + ic.w / 2 - 1 + wobble, ic.y + ic.h - 4);
  ctx.stroke();
}

// === DRAW A SPRING ===
function drawSpring(s) {
  const [x, y, w] = s;
  // Black-and-white striped pad
  const stripeW = 6;
  for (let i = 0; i < Math.ceil(w / stripeW); i++) {
    ctx.fillStyle = i % 2 === 0 ? "#222" : "#EEE";
    ctx.fillRect(x + i * stripeW, y, Math.min(stripeW, w - i * stripeW), 4);
  }
  // Coil body underneath
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  const coilT = Math.floor(Date.now() / 200) % 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 4 + i * (coilT ? 3 : 2), w / 3, 1.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// === DRAW A CANNON ===
function drawCannon(c) {
  const [x, y] = c;
  // Base
  ctx.fillStyle = "#333";
  ctx.fillRect(x - 14, y + 10, 28, 20);
  // Wheels
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(x - 10, y + 30, 6, 0, Math.PI * 2);
  ctx.arc(x + 10, y + 30, 6, 0, Math.PI * 2);
  ctx.fill();
  // Barrel (points right)
  ctx.fillStyle = "#555";
  ctx.fillRect(x, y + 4, 26, 12);
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 22, y + 6, 4, 8);
}

// === DRAW A BULLET ===
function drawBullet(b) {
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
  ctx.fill();
  // Little spark trail
  ctx.fillStyle = "rgba(255, 180, 60, 0.7)";
  ctx.beginPath();
  ctx.arc(b.x - 8, b.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

// === DRAW THE FLAG ===
function drawFlag() {
  // Pole
  ctx.fillStyle = "#888";
  ctx.fillRect(flag.x, flag.y, flag.width, flag.height);
  // Flag fabric — wave with time
  const wave = Math.sin(Date.now() / 200) * 3;
  ctx.fillStyle = collectedCoins.size === coins.length ? "#FFD700" : "#FF3D3D";
  ctx.beginPath();
  ctx.moveTo(flag.x + flag.width, flag.y + 2);
  ctx.lineTo(flag.x + flag.width + 28 + wave, flag.y + 10);
  ctx.lineTo(flag.x + flag.width, flag.y + 18);
  ctx.fill();
}

// === DRAW A COIN ===
function drawCoin(x, y, index) {
  if (collectedCoins.has(index)) return;

  const bob = Math.sin(Date.now() / 300 + index) * 3;

  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(x + 10, y + 10 + bob, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFA500";
  ctx.beginPath();
  ctx.arc(x + 10, y + 10 + bob, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 12px monospace";
  ctx.fillText("$", x + 6, y + 14 + bob);
}

// === DRAW THE EGG ===
// Yellow speckled egg. Wiggles and cracks more the closer it is to hatching.
function drawEgg(eg) {
  const t = Date.now();
  let shake = 0, prog = 0;
  if (eg.state === "hatching") {
    prog = Math.min(1, (t - eg.touchedAt) / 3000);   // 0 → 1
    shake = Math.sin(t / 40) * (1 + prog * 4);
  }
  const cx = eg.x + 13 + shake;
  const cy = eg.y + 17;

  // Shell (color can be set per level — e.g. the red egg in level 5)
  ctx.fillStyle = eg.color || "#F4E04A";
  ctx.beginPath();
  ctx.ellipse(cx, cy, 13, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = eg.edgeColor || "#C9A227";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Speckles
  ctx.fillStyle = eg.spotColor || "#7A6A22";
  for (const [sx, sy, sr] of [[-5, -7, 2.5], [4, -3, 2], [-2, 4, 3], [6, 6, 2], [-7, 1, 1.8]]) {
    ctx.beginPath();
    ctx.arc(cx + sx, cy + sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crack across the middle, growing as it hatches
  if (prog > 0) {
    ctx.strokeStyle = "#5A4A14";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const span = 11 * prog;
    ctx.moveTo(cx - span, cy - 2);
    ctx.lineTo(cx - span / 2, cy + 3);
    ctx.lineTo(cx, cy - 2);
    ctx.lineTo(cx + span / 2, cy + 3);
    ctx.lineTo(cx + span, cy - 2);
    ctx.stroke();
  }
}

// === DRAW THE PET === (dispatch by kind; default is the cracked-egg robot)
function drawPet(p) {
  if (!p.alive) return;        // hidden while waiting to respawn
  if (p.kind === "volcano") { drawPetVolcano(p); return; }
  const t = Date.now();
  const x = p.x, y = p.y + Math.sin(t / 300) * 1.5;
  const cx = x + 14;

  // --- Spring antennae (blue + red balls) ---
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1.5;
  for (const [ax, ball] of [[-5, "#3A6FD8"], [5, "#E03A2F"]]) {
    const tipx = cx + ax + Math.sin(t / 180 + ax) * 1.5;
    const tipy = y - 9;
    ctx.beginPath();
    ctx.moveTo(cx + ax, y + 2);
    ctx.lineTo(tipx - 1, y - 2);
    ctx.lineTo(tipx + 1, y - 5);
    ctx.lineTo(tipx, tipy);
    ctx.stroke();
    ctx.fillStyle = ball;
    ctx.beginPath();
    ctx.arc(tipx, tipy - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Three little legs ---
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  for (const lx of [-7, 0, 7]) {
    ctx.beginPath();
    ctx.moveTo(cx + lx, y + 22);
    ctx.lineTo(cx + lx, y + 27);
    ctx.stroke();
    ctx.fillStyle = lx < 0 ? "#3A6FD8" : "#E03A2F";
    ctx.fillRect(cx + lx - 2, y + 26, 4, 2);
  }

  // --- Body: two egg-shell halves with jagged teeth between ---
  const body = p.body || "#F4E04A";
  const edge = p.edge || "#B58A3C";
  ctx.fillStyle = body;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  // top half
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 11);
  ctx.quadraticCurveTo(cx, y - 2, x + 26, y + 11);
  ctx.lineTo(x + 2, y + 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // bottom half
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 13);
  ctx.lineTo(x + 27, y + 13);
  ctx.quadraticCurveTo(x + 27, y + 24, cx, y + 23);
  ctx.quadraticCurveTo(x + 1, y + 24, x + 1, y + 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // jagged teeth on the gap
  ctx.fillStyle = body;
  ctx.strokeStyle = edge;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const tx = x + 3 + i * 3.6;
    ctx.lineTo(tx, y + 11 + (i % 2 === 0 ? 0 : 3));
  }
  ctx.stroke();

  // --- Eyes ---
  ctx.fillStyle = "#FFF";
  ctx.beginPath();
  ctx.arc(cx - 5, y + 6, 2.6, 0, Math.PI * 2);
  ctx.arc(cx + 5, y + 6, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx - 5, y + 6, 1.1, 0, Math.PI * 2);
  ctx.arc(cx + 5, y + 6, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // --- Blaster arm (grey, points right) ---
  ctx.fillStyle = "#777";
  ctx.fillRect(x + 26, y + 14, 9, 5);
  ctx.fillStyle = "#BBB";
  ctx.fillRect(x + 26, y + 14, 9, 1.5);
  ctx.fillStyle = "#444";
  ctx.fillRect(x + 34, y + 15, 2, 3);

  // --- HP pips above the head (only shown once the pet has taken a hit) ---
  if (p.hp < p.maxHp) {
    const startX = cx - (p.maxHp * 7 - 2) / 2;
    for (let i = 0; i < p.maxHp; i++) {
      ctx.fillStyle = i < p.hp ? "#3DDC5A" : "#444";
      ctx.fillRect(startX + i * 7, y - 17, 5, 3);
    }
  }
}

// === DRAW THE VOLCANO PET === (level 5 red egg — grey volcano erupting lava)
function drawPetVolcano(p) {
  const t = Date.now();
  const x = p.x, y = p.y + Math.sin(t / 300) * 1.5;
  const cx = x + 14;
  const grey = "#7C7C86", greyDark = "#5A5A64", lava = "#D8362A", lavaHot = "#FF7A33";

  // --- Red lava base it stands on ---
  ctx.fillStyle = lava;
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 28);
  ctx.lineTo(cx, y + 21);
  ctx.lineTo(x + 32, y + 28);
  ctx.lineTo(cx, y + 30);
  ctx.closePath();
  ctx.fill();

  // --- Arms: grey fists with red flame fingers, raised on each side ---
  for (const side of [-1, 1]) {
    const ax = cx + side * 15, ay = y + 13;
    ctx.strokeStyle = greyDark;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx + side * 8, y + 14);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    // flame fingers
    ctx.fillStyle = lava;
    for (let f = -1; f <= 2; f++) {
      const fa = side * 0.6 - 1.4 + f * 0.5;
      const flick = 3 + Math.sin(t / 90 + f + side) * 1.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + Math.cos(fa) * (4 + flick), ay + Math.sin(fa) * (4 + flick));
      ctx.lineTo(ax + Math.cos(fa + 0.4) * 3, ay + Math.sin(fa + 0.4) * 3);
      ctx.closePath();
      ctx.fill();
    }
    // grey fist
    ctx.fillStyle = grey;
    ctx.beginPath();
    ctx.arc(ax, ay, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Erupting lava out of the crater (flickering red/orange flames) ---
  for (let i = -1; i <= 1; i++) {
    const fh = 9 + Math.sin(t / 110 + i * 2) * 4;
    ctx.fillStyle = i === 0 ? lavaHot : lava;
    ctx.beginPath();
    ctx.moveTo(cx + i * 5 - 3, y + 4);
    ctx.lineTo(cx + i * 5, y + 4 - fh);
    ctx.lineTo(cx + i * 5 + 3, y + 4);
    ctx.closePath();
    ctx.fill();
  }

  // --- Grey volcano cone (wide bottom, narrow crater on top) ---
  ctx.fillStyle = grey;
  ctx.strokeStyle = greyDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 23);
  ctx.lineTo(x + 9, y + 4);
  ctx.lineTo(x + 19, y + 4);
  ctx.lineTo(x + 27, y + 23);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // --- Red lava spots running down the cone ---
  ctx.fillStyle = lava;
  for (const [sx, sy, sr] of [[14, 9, 2.6], [10, 16, 2], [18, 15, 2], [14, 21, 2.2]]) {
    ctx.beginPath();
    ctx.arc(x + sx, y + sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Little eyes so it reads as a creature ---
  ctx.fillStyle = "#1A1A1A";
  ctx.beginPath();
  ctx.arc(cx - 3, y + 13, 1.6, 0, Math.PI * 2);
  ctx.arc(cx + 3, y + 13, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // --- HP pips above the head (only once hurt) ---
  if (p.hp < p.maxHp) {
    const startX = cx - (p.maxHp * 7 - 2) / 2;
    for (let i = 0; i < p.maxHp; i++) {
      ctx.fillStyle = i < p.hp ? "#3DDC5A" : "#444";
      ctx.fillRect(startX + i * 7, y - 12, 5, 3);
    }
  }
}

// === DRAW A PET BEAM === (lightning bolt; color set by the pet)
function drawPetBeam(b) {
  const ang = Math.atan2(b.vy, b.vx);
  const nx = Math.cos(ang), ny = Math.sin(ang);
  const px = -ny, py = nx;        // perpendicular, for the zigzag
  ctx.strokeStyle = b.color || "#FFE800";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const along = (i - 2) * 5;
    const side = (i % 2 === 0 ? -1 : 1) * 3;
    const sx = b.x + nx * along + px * side;
    const sy = b.y + ny * along + py * side;
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
}

// === RESPAWN PLAYER (within current level) ===
function respawn() {
  player.x = playerStart.x;
  player.y = playerStart.y;
  player.speedX = 0;
  player.speedY = 0;
  for (const e of enemies) {
    e[5] = e[7];     // restore hp from initialHp
    e[9] = true;     // alive
  }
  bullets.length = 0;
  acidBalls.length = 0;
  fireballs.length = 0;
  for (const ic of icicles) {
    ic.y = ic.y0;
    ic.state = "idle";
  }
}

// === SNAKE EATS PLAYER — all collected coins go back to their original spots ===
function snakeEat() {
  for (const idx of collectedCoins) {
    coinState[idx][0] = coins[idx][0];
    coinState[idx][1] = coins[idx][1];
  }
  player.score -= collectedCoins.size;
  collectedCoins.clear();
  respawn();
}

// === MAIN GAME LOOP ===
function update() {
  frameCount++;

  // -- Level transition timer --
  if (levelClearAt && Date.now() - levelClearAt > levelClearMs) {
    if (currentLevel + 1 < levels.length) {
      loadLevel(currentLevel + 1);
      levelClearAt = 0;
    } else {
      gameWon = true;
      levelClearAt = 0;
    }
  }

  if (!levelClearAt && !gameWon) {
    // -- Are we in water? --
    const water = levels[currentLevel].water;
    const inWater = !!water && (player.y + player.height > water.y + 4);

    // -- Move left/right --
    const hSpeed = inWater ? player.speed * 0.75 : player.speed;
    if (keys["ArrowLeft"] || keys["a"]) {
      player.speedX = -hSpeed;
    } else if (keys["ArrowRight"] || keys["d"]) {
      player.speedX = hSpeed;
    } else {
      player.speedX = 0;
    }

    // -- Jump / swim up --
    const upHeld = keys["ArrowUp"] || keys["w"] || keys[" "];
    if (inWater) {
      // Swim: holding up gives steady upward push (no need to be on ground)
      if (upHeld) player.speedY = -3.5;
    } else if (upHeld && player.onGround) {
      player.speedY = player.jumpPower;
      player.onGround = false;
    }

    // -- Gravity / buoyancy --
    if (inWater) {
      player.speedY *= 0.86;          // drag
      player.speedY += 0.18;          // mild sink
    } else {
      player.speedY += gravity;
    }
    player.x += player.speedX;
    player.y += player.speedY;

    // -- Platform collision --
    // Holding down (ArrowDown / s) lets the player drop through small ledges.
    // The ground platform (height 40) is always solid, so you never fall off-world.
    const dropDown = keys["ArrowDown"] || keys["s"];
    player.onGround = false;
    for (const [px, py, pw, ph] of platforms) {
      if (dropDown && ph < 20) continue;
      if (
        player.x + player.width > px &&
        player.x < px + pw &&
        player.y + player.height > py &&
        player.y + player.height < py + ph + 10 &&
        player.speedY >= 0
      ) {
        player.y = py - player.height;
        player.speedY = 0;
        player.onGround = true;
      }
    }

    // -- Coin collection --
    for (let i = 0; i < coins.length; i++) {
      if (collectedCoins.has(i)) continue;
      const [cx, cy] = coinState[i];
      if (
        player.x + player.width > cx &&
        player.x < cx + 20 &&
        player.y + player.height > cy &&
        player.y < cy + 20
      ) {
        collectedCoins.add(i);
        player.score += 1;
      }
    }

    // -- Screen edges --
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // -- Enemy patrol + collision --
    for (const e of enemies) {
      if (!e[9]) continue;
      const kind = e[6];
      const isBoss = typeof kind === "string" && kind.startsWith("boss");
      const isAlien = kind === "boss-alien";
      const isSkeleton = kind === "boss-skeleton";
      const isSnake = kind === "snake";
      const isCroc = kind === "crocodile";
      const isCentipede = kind === "centipede";
      const ew = isAlien ? 70 : isSkeleton ? 56 : isBoss ? 64 : isCroc ? 80 : isCentipede ? 74 : isSnake ? 56 : 32;
      const eh = isAlien ? 70 : isSkeleton ? 64 : isBoss ? 50 : isCroc ? 40 : isCentipede ? 22 : isSnake ? 36 : 28;

      if (isAlien || isSkeleton) {
        // Flying bosses patrol their platform like a walker, just slower.
        e[0] += 1.2 * e[8];
        if (e[0] < e[2]) { e[0] = e[2]; e[8] = 1; }
        if (e[0] + ew > e[3]) { e[0] = e[3] - ew; e[8] = -1; }
      } else if (isCroc) {
        // Crocodile patrols in the water.
        e[0] += 1.0 * e[8];
        if (e[0] < e[2]) { e[0] = e[2]; e[8] = 1; }
        if (e[0] + ew > e[3]) { e[0] = e[3] - ew; e[8] = -1; }
      } else if (isBoss || isSnake) {
        // Other bosses and snakes stand still.
        e[8] = -1;
      } else {
        // Walkers patrol
        e[0] += enemySpeed * e[8];
        if (e[0] < e[2]) { e[0] = e[2]; e[8] = 1; }
        if (e[0] + ew > e[3]) { e[0] = e[3] - ew; e[8] = -1; }
      }

      // Toxic boss spits acid balls horizontally out of its mouth
      if (kind === "boss-toxic" && frameCount % bossFireRate === 30) {
        acidBalls.push({
          x: e[0] + 4,
          y: e[1] + eh - 14,
          vx: -3.5,
          vy: 0,
        });
      }

      // Spiky boss launches arcing spike balls
      if (kind === "boss-spiky" && frameCount % (bossFireRate + 30) === 50) {
        acidBalls.push({
          x: e[0] + 4,
          y: e[1] + 12,
          vx: -3.5,
          vy: -3.5,
          spiky: true,         // drawn differently
          gravity: 0.18,
        });
      }

      // Alien boss keeps firing pink energy balls AIMED at the player, so
      // there's real pressure to keep moving (and the pet can intercept).
      if (isAlien && frameCount % 60 === 0) {
        const bx = e[0] + ew / 2;
        const by = e[1] + 42;
        const dx = (player.x + player.width / 2) - bx;
        const dy = (player.y + player.height / 2) - by;
        const d = Math.hypot(dx, dy) || 1;
        const sp = 3.6;
        acidBalls.push({
          x: bx,
          y: by,
          vx: dx / d * sp,
          vy: dy / d * sp,
          pink: true,
        });
      }

      // Skeleton boss throws spinning bones aimed at the player (slower cadence)
      if (isSkeleton && frameCount % 100 === 0) {
        const bx = e[0] + ew / 2;
        const by = e[1] + 14;
        const dx = (player.x + player.width / 2) - bx;
        const dy = (player.y + player.height / 2) - by;
        const d = Math.hypot(dx, dy) || 1;
        const sp = 3.2;
        acidBalls.push({
          x: bx,
          y: by,
          vx: dx / d * sp,
          vy: dy / d * sp,
          bone: true,
        });
      }

      // Hit test against player
      const hit =
        player.x + player.width > e[0] &&
        player.x < e[0] + ew &&
        player.y + player.height > e[1] &&
        player.y < e[1] + eh;

      if (hit) {
        if (isCroc) {
          // Crocodile cannot be stomped — back is spiky, mouth bites.
          respawn();
          break;
        }
        const stomp = player.speedY > 0 && player.y + player.height < e[1] + 16;
        if (stomp) {
          e[5] -= 1;
          player.speedY = -10;
          if (e[5] <= 0) {
            e[9] = false;
            player.score += isBoss ? 10 : isSnake ? 5 : 2;
          }
        } else if (isSnake) {
          snakeEat();     // chomped from the side — coins go back, respawn
          break;
        } else {
          respawn();
          break;          // respawn() reset enemy state — stop iterating safely
        }
      }
    }

    // -- Acid / spike balls fly and hurt the player --
    for (let i = acidBalls.length - 1; i >= 0; i--) {
      const a = acidBalls[i];
      if (a.gravity) a.vy += a.gravity;
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < -20 || a.x > canvas.width + 20 || a.y > canvas.height + 20) {
        acidBalls.splice(i, 1);
        continue;
      }
      // Hit a pet first (they shield the player by taking the bolt)
      let hitPet = false;
      for (const pet of pets) {
        if (
          pet.alive &&
          a.x + 7 > pet.x && a.x - 7 < pet.x + 28 &&
          a.y + 7 > pet.y && a.y - 7 < pet.y + 28
        ) {
          pet.hp -= 1;
          if (pet.hp <= 0) { pet.alive = false; pet.deadAt = Date.now(); }
          hitPet = true;
          break;
        }
      }
      if (hitPet) { acidBalls.splice(i, 1); continue; }
      if (
        a.x + 7 > player.x && a.x - 7 < player.x + player.width &&
        a.y + 7 > player.y && a.y - 7 < player.y + player.height
      ) {
        acidBalls.splice(i, 1);
        respawn();
        break;
      }
    }

    // -- EGG hatch + PET behaviour --
    if (egg && egg.state !== "hatched") {
      if (egg.state === "idle") {
        // Touch the egg to start the 3-second hatch timer
        if (
          player.x + player.width > egg.x && player.x < egg.x + 26 &&
          player.y + player.height > egg.y && player.y < egg.y + 34
        ) {
          egg.state = "hatching";
          egg.touchedAt = Date.now();
        }
      } else if (egg.state === "hatching" && Date.now() - egg.touchedAt > 3000) {
        egg.state = "hatched";
        // Hatch a new pet — but only up to MAX_PETS at once.
        if (pets.length < MAX_PETS) {
          pets.push({ x: egg.x, y: egg.y - 6, hp: 3, maxHp: 3, alive: true, deadAt: 0, fireCd: 30,
                      kind: egg.petKind, body: egg.petBody, edge: egg.petEdge, beamColor: egg.petBeam });
        }
      }
    }

    // Each pet hovers in its own slot around the player so they don't stack.
    const petSlots = [
      [-30, -22],                              // left, above
      [player.width + 6, -22],                 // right, above
      [player.width / 2 - 14, -42],            // center, higher
    ];
    for (let pi = 0; pi < pets.length; pi++) {
      const pet = pets[pi];
      if (!pet.alive) {
        // Respawn next to the player 3 seconds after dying
        if (Date.now() - pet.deadAt > 3000) {
          pet.x = player.x - 36;
          pet.y = player.y - 12;
          pet.hp = pet.maxHp;
          pet.alive = true;
          pet.fireCd = 30;
        }
        continue;
      }
      // Hover in this pet's slot, with a gentle (phase-offset) bob
      const [ox, oy] = petSlots[pi] || petSlots[0];
      const targetX = player.x + ox;
      const targetY = player.y + oy + Math.sin(Date.now() / 300 + pi * 2) * 4;
      pet.x += (targetX - pet.x) * 0.08;
      pet.y += (targetY - pet.y) * 0.08;

      // Fire a beam at the nearest living boss
      pet.fireCd -= 1;
      if (pet.fireCd <= 0) {
        const target = enemies.find(
          en => en[9] && typeof en[6] === "string" && en[6].startsWith("boss")
        );
        if (target) {
          const tw = target[6] === "boss-alien" ? 70 : 64;
          const px = pet.x + 26, py = pet.y + 14;
          const dx = (target[0] + tw / 2) - px;
          const dy = (target[1] + 35) - py;
          const d = Math.hypot(dx, dy) || 1;
          petBeams.push({ x: px, y: py, vx: dx / d * 6, vy: dy / d * 6, color: pet.beamColor });
          pet.fireCd = 55;
        }
      }
    }

    // -- Pet beams fly and damage the boss --
    for (let i = petBeams.length - 1; i >= 0; i--) {
      const b = petBeams[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -20 || b.x > canvas.width + 20 || b.y < -20 || b.y > canvas.height + 20) {
        petBeams.splice(i, 1);
        continue;
      }
      let hit = false;
      for (const en of enemies) {
        if (!en[9]) continue;
        const k = en[6];
        if (!(typeof k === "string" && k.startsWith("boss"))) continue;
        const bw = k === "boss-alien" ? 70 : k === "boss-skeleton" ? 56 : 64;
        const bh = k === "boss-alien" ? 70 : k === "boss-skeleton" ? 64 : 50;
        if (b.x > en[0] && b.x < en[0] + bw && b.y > en[1] && b.y < en[1] + bh) {
          en[5] -= 1;
          if (en[5] <= 0) { en[9] = false; player.score += 10; }
          hit = true;
          break;
        }
      }
      if (hit) petBeams.splice(i, 1);
    }

    // -- Hazards (electric ceiling etc.): touch = instant respawn --
    for (const [hx, hy, hw, hh] of hazards) {
      if (
        player.x + player.width > hx &&
        player.x < hx + hw &&
        player.y + player.height > hy &&
        player.y < hy + hh
      ) {
        respawn();
        break;
      }
    }

    // -- Ramps: standing on / touching one slides the player horizontally --
    for (const [rx, ry, rw, rh, dir] of ramps) {
      if (
        player.x + player.width > rx &&
        player.x < rx + rw &&
        player.y + player.height > ry &&
        player.y < ry + rh + 4
      ) {
        const slide = dir === "left" ? -3.5 : 3.5;
        player.x += slide;
      }
    }

    // -- Springs: stepping on top launches the player upward --
    for (const [sx, sy, sw, jump] of springs) {
      if (
        player.x + player.width > sx &&
        player.x < sx + sw &&
        player.y + player.height >= sy &&
        player.y + player.height <= sy + 10 &&
        player.speedY >= 0
      ) {
        player.y = sy - player.height;
        player.speedY = jump;       // big upward kick
      }
    }

    // -- Cannons fire bullets --
    for (const c of cannons) {
      const [cx, cy, rate] = c;
      if (frameCount % rate === 0) {
        bullets.push({ x: cx + 26, y: cy + 10, vx: bulletSpeed, vy: 0 });
      }
    }

    // -- Bullets move + collide --
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      // Off-screen
      if (b.x < -20 || b.x > canvas.width + 20) {
        bullets.splice(i, 1);
        continue;
      }
      // Hit player
      if (
        b.x > player.x && b.x < player.x + player.width &&
        b.y > player.y && b.y < player.y + player.height
      ) {
        bullets.splice(i, 1);
        respawn();
        break;            // respawn() cleared bullets — bail out of this loop
      }
    }

    // -- Fire spawners drop fireballs from the sky --
    for (const [fx, , rate] of fireSpawners) {
      if (frameCount % rate === Math.floor(rate / 2)) {
        fireballs.push({ x: fx, y: -10, vy: 3 });
      }
    }

    // -- Fireballs fall + hurt the player --
    for (let i = fireballs.length - 1; i >= 0; i--) {
      const f = fireballs[i];
      f.vy += 0.08;            // gentle acceleration
      f.y += f.vy;
      if (f.y > canvas.height + 20) {
        fireballs.splice(i, 1);
        continue;
      }
      if (
        f.x + 8 > player.x && f.x - 8 < player.x + player.width &&
        f.y + 10 > player.y && f.y - 10 < player.y + player.height
      ) {
        fireballs.splice(i, 1);
        respawn();
        break;
      }
    }

    // -- Icicles: trigger when player walks under, then fall and hurt --
    for (const ic of icicles) {
      if (ic.state === "broken") continue;

      if (ic.state === "idle") {
        // Trigger if the player is roughly under the icicle
        if (
          player.x + player.width > ic.x - 6 &&
          player.x < ic.x + ic.w + 6 &&
          player.y > ic.y + ic.h
        ) {
          ic.state = "falling";
          ic.vy = 0;
        }
      } else if (ic.state === "falling") {
        ic.vy = (ic.vy || 0) + 0.5;
        ic.y += ic.vy;
        // Collision with player
        if (
          player.x + player.width > ic.x &&
          player.x < ic.x + ic.w &&
          player.y + player.height > ic.y &&
          player.y < ic.y + ic.h
        ) {
          ic.state = "broken";
          respawn();
          break;
        }
        // Shatter on ground / off-screen
        if (ic.y > canvas.height - 40) {
          ic.state = "broken";
        }
      }
    }

    // -- Win check --
    const winMode = levels[currentLevel].winCondition || "flag";
    if (winMode === "kill-boss") {
      // Cleared when all bosses are dead.
      const alive = enemies.some(en => {
        const k = en[6];
        return typeof k === "string" && k.startsWith("boss") && en[9];
      });
      if (!alive) levelClearAt = Date.now();
    } else if (
      collectedCoins.size === coins.length &&
      player.x + player.width > flag.x &&
      player.x < flag.x + flag.width + 20 &&
      player.y + player.height > flag.y &&
      player.y < flag.y + flag.height
    ) {
      levelClearAt = Date.now();
    }

    // -- Fall off bottom: reset --
    if (player.y > canvas.height + 50) {
      respawn();
    }
  }

  // === DRAW EVERYTHING ===

  // Sky (per-level color)
  ctx.fillStyle = levels[currentLevel].skyColor || "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds (skip for dark/space levels)
  const lvlObj = levels[currentLevel];
  const showClouds = lvlObj.showClouds !== false;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  if (showClouds) for (const [cx, cy, cw, ch] of clouds) {
    const drift = (Date.now() / 50 + cx) % (canvas.width + 200) - 100;
    ctx.beginPath();
    ctx.arc(drift, cy, cw / 2, 0, Math.PI * 2);
    ctx.arc(drift + 30, cy - 10, cw / 3, 0, Math.PI * 2);
    ctx.arc(drift + 50, cy, cw / 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Platforms (grass-top only if the level wants it)
  const grassTop = lvlObj.platformGrass !== false;
  for (const [px, py, pw, ph, pcolor] of platforms) {
    ctx.fillStyle = pcolor;
    ctx.fillRect(px, py, pw, ph);
    if (ph < 20 && grassTop) {
      ctx.fillStyle = "#6DBE45";
      ctx.fillRect(px, py, pw, 4);
    }
  }

  // Grass on ground (only level 1 — other levels have their own ground color)
  if (currentLevel === 0) {
    ctx.fillStyle = "#6DBE45";
    ctx.fillRect(0, 460, 800, 6);
  }

  // Ramps (drawn after platforms so they sit on top visually)
  for (const r of ramps) drawRamp(r);

  // Springs
  for (const s of springs) drawSpring(s);

  // Hazards (electric, spike walls, etc.)
  for (const h of hazards) drawHazard(h);

  // Fire spawners (glowing dots at the top of the screen)
  for (const s of fireSpawners) drawFireSpawner(s);

  // Icicles
  for (const ic of icicles) drawIcicle(ic);

  // Falling fireballs
  for (const f of fireballs) drawFireball(f);

  // Flag (not shown when the win condition is killing the boss)
  if ((lvlObj.winCondition || "flag") !== "kill-boss") drawFlag();

  // Coins
  for (let i = 0; i < coins.length; i++) {
    drawCoin(coinState[i][0], coinState[i][1], i);
  }

  // Egg (until it hatches)
  if (egg && egg.state !== "hatched") drawEgg(egg);

  // Cannons
  for (const c of cannons) drawCannon(c);

  // Enemies
  for (const e of enemies) drawEnemy(e);

  // Boss health bars (bosses now take several hits — show progress)
  for (const e of enemies) {
    const k = e[6];
    if (!(e[9] && typeof k === "string" && k.startsWith("boss"))) continue;
    const bw = k === "boss-alien" ? 70 : k === "boss-skeleton" ? 56 : 64;
    const frac = Math.max(0, e[5] / e[7]);
    const barW = 60, bx = e[0] + bw / 2 - barW / 2, by = e[1] - 12;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(bx - 1, by - 1, barW + 2, 6);
    ctx.fillStyle = frac > 0.5 ? "#3DDC5A" : frac > 0.25 ? "#FFD23D" : "#FF3D3D";
    ctx.fillRect(bx, by, barW * frac, 4);
  }

  // Bullets
  for (const b of bullets) drawBullet(b);

  // Acid balls (toxic waste spat by the boss)
  for (const a of acidBalls) drawAcidBall(a);

  // Pet beams + pets (helpers hatched from eggs, carried across levels)
  for (const b of petBeams) drawPetBeam(b);
  for (const p of pets) drawPet(p);

  // Player
  drawPlayer();

  // Water overlay (after player so player gets the underwater tint)
  const water = lvlObj.water;
  if (water) {
    ctx.fillStyle = water.color || "rgba(40, 90, 200, 0.55)";
    ctx.fillRect(0, water.y, canvas.width, water.height);
    // Animated surface ripples
    ctx.strokeStyle = "rgba(180, 220, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let wx = 0; wx < canvas.width; wx += 12) {
      const dy = Math.sin(Date.now() / 300 + wx * 0.07) * 2;
      if (wx === 0) ctx.moveTo(wx, water.y + dy);
      else ctx.lineTo(wx, water.y + dy);
    }
    ctx.stroke();
  }

  // HUD
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.font = "bold 22px monospace";
  const hud = "Coins: " + collectedCoins.size + " / " + coins.length + "   Score: " + player.score;
  ctx.strokeText(hud, 16, 30);
  ctx.fillText(hud, 16, 30);

  // Level name (right side)
  ctx.font = "bold 18px monospace";
  const lvlText = levels[currentLevel].name;
  const lvlWidth = ctx.measureText(lvlText).width;
  ctx.strokeText(lvlText, canvas.width - lvlWidth - 16, 28);
  ctx.fillText(lvlText, canvas.width - lvlWidth - 16, 28);

  // Pet counter (right side, under the level name) — shows the 3-pet cap
  if (pets.length > 0) {
    ctx.font = "bold 16px monospace";
    const petText = "Pets: " + pets.length + "/" + MAX_PETS;
    const pw = ctx.measureText(petText).width;
    ctx.fillStyle = "#9BE0FF";
    ctx.strokeText(petText, canvas.width - pw - 16, 50);
    ctx.fillText(petText, canvas.width - pw - 16, 50);
    ctx.fillStyle = "#FFFFFF";
  }

  // Hint: changes based on win mode
  if (!levelClearAt && !gameWon) {
    const winMode2 = lvlObj.winCondition || "flag";
    let tip = "";
    if (winMode2 === "kill-boss") tip = "→ Defeat the boss!";
    else if (collectedCoins.size === coins.length) tip = "→ Reach the flag!";
    if (tip) {
      ctx.fillStyle = "#FFFF66";
      ctx.font = "bold 16px monospace";
      ctx.strokeText(tip, 16, 54);
      ctx.fillText(tip, 16, 54);
    }
  }

  // Per-level clear banner
  if (levelClearAt) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.font = "bold 40px monospace";
    const t = levels[currentLevel].name + " CLEAR!";
    const tw = ctx.measureText(t).width;
    ctx.strokeText(t, (canvas.width - tw) / 2, canvas.height / 2);
    ctx.fillText(t, (canvas.width - tw) / 2, canvas.height / 2);
  }

  // Final win screen — all levels done
  if (gameWon) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.font = "bold 48px monospace";
    const winText = "YOU WIN!";
    const tw = ctx.measureText(winText).width;
    ctx.strokeText(winText, (canvas.width - tw) / 2, canvas.height / 2 - 20);
    ctx.fillText(winText, (canvas.width - tw) / 2, canvas.height / 2 - 20);
    ctx.font = "bold 20px monospace";
    const sub = "Final score: " + player.score;
    const sw = ctx.measureText(sub).width;
    ctx.strokeText(sub, (canvas.width - sw) / 2, canvas.height / 2 + 24);
    ctx.fillText(sub, (canvas.width - sw) / 2, canvas.height / 2 + 24);
  }

  requestAnimationFrame(update);
}

update();
