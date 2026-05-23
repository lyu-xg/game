# 2D Platformer Game

亲子合作的小游戏：爸爸写代码，9 岁娃负责设计（角色、关卡、配色、剧情）。

**[在线试玩 →](https://lyu-xg.github.io/game/)**

## 操作

| 动作 | 按键 |
|---|---|
| 左右移动 | `← →` 或 `A D` |
| 跳跃 | `↑` / `W` / `Space` |
| 从小平台上掉下去 | `↓` / `S` |

**过关条件**：收齐当前关所有金币 + 走到右边的旗子。

**怪物互动**：从上方踩下去能消灭，从侧面碰到会死亡重生。Boss 要踩两下。

## 本地运行

零依赖，零构建。直接用浏览器打开 `index.html` 就行：

```bash
open index.html
```

## 关卡编辑（给娃看）

所有关卡数据都在 [`game.js`](game.js) 顶部的 `levels` 数组里。每一关是一个对象：

```js
{
  name: "Level 1",
  skyColor: "#87CEEB",                          // 天空颜色
  playerStart: { x: 30, y: 420 },               // 玩家出生点
  platforms: [
    [0, 460, 800, 40, "#4A752C"],               // [x, y, 宽, 高, 颜色]
    [60, 400, 110, 14, "#8B5E3C"],
    // ...
  ],
  coins: [
    [105, 372],                                 // [x, y]
    // ...
  ],
  enemies: [
    [660, 330, 560, 780, "#2EA34F", 2, true],
    //  x   y  左界 右界  颜色      血量 是否boss
  ],
  cannons: [
    [200, 270, 160, "#555"],                    // [x, y, 发射间隔(帧), 颜色]
  ],
  flag: { x: 758, y: 162, width: 6, height: 48 },
}
```

改完保存文件 → 浏览器刷新页面 → 立刻看到效果。

**坐标系**：屏幕左上角是 (0, 0)，向右 x 增加，向下 y 增加。画布是 800×500。

**加新关卡**：在 `levels` 数组里再加一个对象就行。过完上一关会自动加载下一关。

## 调参（给爸看）

`game.js` 上面的常量：

```js
player.speed       = 4      // 走路速度
player.jumpPower   = -14    // 跳跃力（越负跳越高）
gravity            = 0.6
enemySpeed         = 1.4
bossFireRate       = 110    // boss 吐酸球间隔（帧）
bulletSpeed        = 4
```

## 文件结构

```
index.html   — Canvas + 页面样式
game.js      — 全部游戏逻辑（单文件，单 update 循环）
AGENTS.md    — 项目协作约定
CLAUDE.md    — 项目背景
```
