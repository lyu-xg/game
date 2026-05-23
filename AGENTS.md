# Agent Guidelines

## Role

You are helping a parent and their 9-year-old kid build a 2D platformer game together. The parent codes; the kid designs (characters, levels, colors, story).

## Key constraints

- **No complexity creep.** No build tools, no npm, no bundlers, no TypeScript, no frameworks. Vanilla HTML + JS only.
- **No classes or modules.** Keep everything in flat functions and plain data (objects, arrays). A 9-year-old should be able to look at the code and roughly follow it.
- **Kid-editable data.** Platform layouts, coin positions, colors, and enemy placements must stay as simple literal arrays at the top of `game.js` so the kid can change numbers and see results.
- **One feature at a time.** When adding something new, get it working in the simplest possible way first. Don't anticipate future needs.
- **Don't refactor what works.** If the user asks for enemies, add enemies. Don't reorganize the file, extract helpers, or "improve" unrelated code.
- **Preserve the fun.** The character has personality (eyes that follow movement, smile on coin collect). Keep and build on these details — they matter to a kid.

## Code style

- All game code lives in `game.js`. Don't split into multiple files unless the user asks.
- Game data (platforms, coins, enemies) as arrays of plain values at the top of the file, clearly commented.
- Drawing code uses Canvas 2D API directly (fillRect, arc, fillText). No sprite sheets yet.
- Game loop is a single `update()` function using `requestAnimationFrame`.

## When adding features

1. Add the data array at the top of `game.js` with a comment like `// Kid: design your enemies!`
2. Add update logic in the game loop
3. Add draw logic in the render section
4. Keep collision detection as simple AABB checks

## Testing

No test framework. Open `index.html` in a browser and play. Verify:
- Character moves and jumps
- Can't walk off screen edges
- Falls reset to start position
- New feature works as expected
