# 2D Platformer Game

Parent-kid game project. Parent (Luke) codes, 9-year-old kid does design (characters, levels, colors).

## Stack

- Vanilla HTML5 Canvas + JavaScript. No dependencies, no build tools.
- Two files: `index.html` (canvas + style), `game.js` (everything else).
- Open `index.html` in a browser to play. No server needed.

## Architecture

Single game loop via `requestAnimationFrame` in `game.js`:
1. Poll keyboard state (`keys` object filled by keydown/keyup)
2. Apply movement + gravity
3. AABB collision against platforms (one-way — can jump through from below)
4. Coin collection via overlap check
5. Clear canvas and redraw everything (sky, clouds, platforms, coins, player, HUD)

No delta-time, no state machine, no sprite system yet — intentionally minimal.

## Game data

- `platforms` array: `[x, y, width, height, color]` — defines the level layout
- `coins` array: `[x, y]` — collectible positions
- `player` object: position, velocity, color, score

These are designed to be hand-editable by a kid. Keep them as plain arrays/objects.

## Controls

Arrow keys or WASD to move. Space/Up to jump.

## Design principles

- **Keep it simple.** This is a learning project for a 9-year-old. Avoid abstractions, classes, modules, or build tools unless there's a clear need.
- **Placeholder graphics first.** Everything is colored rectangles/circles drawn with Canvas 2D API. Sprites/pixel art will replace them later.
- **Kid-editable data.** Level data (platforms, coins, colors) should stay as obvious literals that a kid can tweak and see results immediately.
- **Incremental complexity.** Add one feature at a time: enemies, sprites, levels, sound — in that order.

## Planned features (not yet implemented)

- Enemies (moving obstacles to avoid)
- Pixel art sprites (replace rectangle placeholders)
- Multiple levels
- Sound effects
