import { PHYSICS, LEVEL_DATA, GAME_STATE } from '../utils/constants.js';

export class PhysicsEngine {
    constructor() {
        this.gravity = PHYSICS.GRAVITY;
        this.wind = 0;
    }

    update(game) {
        // 更新风力
        if (game.state === GAME_STATE.BATTLE) {
            const levelData = LEVEL_DATA[game.currentLevel];
            this.wind = levelData.wind * (1 + Math.sin(Date.now() / 1000) * PHYSICS.WIND_VARIATION);
        }
    }

    // 计算抛物线轨迹
    calculateTrajectory(x0, y0, angle, power, time) {
        const angleRad = angle * Math.PI / 180;
        const vx = power * Math.cos(angleRad);
        const vy = -power * Math.sin(angleRad);

        const x = x0 + vx * time + 0.5 * this.wind * time * time;
        const y = y0 + vy * time + 0.5 * this.gravity * PHYSICS.PIXELS_PER_METER * time * time;

        return { x, y, vx, vy };
    }

    // 碰撞检测：点与矩形
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    // 碰撞检测：圆形与矩形
    circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
        const closestX = Math.max(rx, Math.min(cx, rx + rw));
        const closestY = Math.max(ry, Math.min(cy, ry + rh));

        const dx = cx - closestX;
        const dy = cy - closestY;

        return (dx * dx + dy * dy) < (cr * cr);
    }

    // 检测水滴与建筑的碰撞
    checkWaterBuildingCollision(droplet, building) {
        return this.circleRectCollision(
            droplet.x, droplet.y, droplet.size,
            building.x, building.y, building.width, building.height
        );
    }

    // 检测水滴与火焰的碰撞
    checkWaterFireCollision(droplet, fire) {
        const dx = droplet.x - fire.x;
        const dy = droplet.y - fire.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (droplet.size + fire.radius);
    }
}
