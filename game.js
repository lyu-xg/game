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
      // Walker patrolling the top-middle long platform
      [380, 112, 360, 490, "#E07533", 1, "walker"],
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

  collectedCoins.clear();
  bullets.length = 0;
  acidBalls.length = 0;
  fireballs.length = 0;
  player.x = playerStart.x;
  player.y = playerStart.y;
  player.speedX = 0;
  player.speedY = 0;
}

loadLevel(0);

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
  if (kind === "snake") { drawSnake(e); return; }

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

// === DRAW AN ACID / SPIKE BALL ===
function drawAcidBall(a) {
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

// === DRAW A HAZARD ===
function drawHazard(h) {
  const [x, y, w, height, kind] = h;

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
    // -- Move left/right --
    if (keys["ArrowLeft"] || keys["a"]) {
      player.speedX = -player.speed;
    } else if (keys["ArrowRight"] || keys["d"]) {
      player.speedX = player.speed;
    } else {
      player.speedX = 0;
    }

    // -- Jump --
    if ((keys["ArrowUp"] || keys["w"] || keys[" "]) && player.onGround) {
      player.speedY = player.jumpPower;
      player.onGround = false;
    }

    // -- Gravity --
    player.speedY += gravity;
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
      const isSnake = kind === "snake";
      const ew = isBoss ? 64 : isSnake ? 56 : 32;
      const eh = isBoss ? 50 : isSnake ? 36 : 28;

      if (isBoss || kind === "snake") {
        // Bosses and snakes stand still.
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

      // Hit test against player
      const hit =
        player.x + player.width > e[0] &&
        player.x < e[0] + ew &&
        player.y + player.height > e[1] &&
        player.y < e[1] + eh;

      if (hit) {
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
      if (
        a.x + 7 > player.x && a.x - 7 < player.x + player.width &&
        a.y + 7 > player.y && a.y - 7 < player.y + player.height
      ) {
        acidBalls.splice(i, 1);
        respawn();
        break;
      }
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

    // -- Flag check --
    if (
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

  // Clouds
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  for (const [cx, cy, cw, ch] of clouds) {
    const drift = (Date.now() / 50 + cx) % (canvas.width + 200) - 100;
    ctx.beginPath();
    ctx.arc(drift, cy, cw / 2, 0, Math.PI * 2);
    ctx.arc(drift + 30, cy - 10, cw / 3, 0, Math.PI * 2);
    ctx.arc(drift + 50, cy, cw / 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Platforms
  for (const [px, py, pw, ph, pcolor] of platforms) {
    ctx.fillStyle = pcolor;
    ctx.fillRect(px, py, pw, ph);
    if (ph < 20) {
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

  // Flag
  drawFlag();

  // Coins
  for (let i = 0; i < coins.length; i++) {
    drawCoin(coinState[i][0], coinState[i][1], i);
  }

  // Cannons
  for (const c of cannons) drawCannon(c);

  // Enemies
  for (const e of enemies) drawEnemy(e);

  // Bullets
  for (const b of bullets) drawBullet(b);

  // Acid balls (toxic waste spat by the boss)
  for (const a of acidBalls) drawAcidBall(a);

  // Player
  drawPlayer();

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

  // Hint when all coins collected
  if (collectedCoins.size === coins.length && !levelClearAt && !gameWon) {
    ctx.fillStyle = "#FFFF66";
    ctx.font = "bold 16px monospace";
    const tip = "→ Reach the flag!";
    ctx.strokeText(tip, 16, 54);
    ctx.fillText(tip, 16, 54);
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
