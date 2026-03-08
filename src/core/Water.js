import { WATER_CONFIG, PHYSICS, FIRE_CONFIG, RESOURCE_CONFIG, COLORS } from '../utils/constants.js';

export class WaterDroplet {
    constructor(x, y, vx, vy, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.active = true;
        this.life = 1.0;
    }

    update(wind) {
        // 应用重力
        this.vy += PHYSICS.GRAVITY * PHYSICS.PIXELS_PER_METER / 60;

        // 应用风力
        this.vx += wind / 60;

        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 检查是否出界
        if (this.y > 600 || this.x < 0 || this.x > 800) {
            this.active = false;
        }
    }
}

export class WaterSystem {
    constructor() {
        this.droplets = [];
        this.poolSize = WATER_CONFIG.PARTICLE_POOL_SIZE;

        // 初始化粒子池
        for (let i = 0; i < this.poolSize; i++) {
            this.droplets.push(new WaterDroplet(0, 0, 0, 0, 0));
        }
    }

    shoot(game, angle, power) {
        if (game.water < RESOURCE_CONFIG.WATER_PER_SHOT) return;

        // 消耗水量
        game.water -= RESOURCE_CONFIG.WATER_PER_SHOT;

        // 发射多个水滴
        for (let i = 0; i < WATER_CONFIG.STREAM_DENSITY; i++) {
            const droplet = this.getDroplet();
            if (!droplet) continue;

            const angleRad = (angle + (Math.random() - 0.5) * 10) * Math.PI / 180;
            const speed = power * (0.8 + Math.random() * 0.4);

            droplet.x = 100;
            droplet.y = game.canvas.height - 50;
            droplet.vx = speed * Math.cos(angleRad);
            droplet.vy = -speed * Math.sin(angleRad);
            droplet.size = WATER_CONFIG.DROPLET_SIZE * (0.8 + Math.random() * 0.4);
            droplet.active = true;
            droplet.life = 1.0;
        }
    }

    getDroplet() {
        for (let i = 0; i < this.droplets.length; i++) {
            if (!this.droplets[i].active) {
                return this.droplets[i];
            }
        }
        return null;
    }

    update(game) {
        this.droplets.forEach(droplet => {
            if (!droplet.active) return;

            droplet.update(game.physicsEngine.wind);

            // 检查是否仍然活跃
            if (!droplet.active) return;

            // 检测与火焰的碰撞（优先级高于建筑）
            for (let fire of game.fires) {
                if (fire.intensity > 0 && game.physicsEngine.checkWaterFireCollision(droplet, fire)) {
                    droplet.active = false;
                    fire.extinguish(FIRE_CONFIG.EXTINGUISH_RATE);

                    // 增加得分
                    game.score += RESOURCE_CONFIG.SCORE_PER_FIRE * FIRE_CONFIG.EXTINGUISH_RATE;

                    // 创建水花粒子
                    game.particles.createSplash(droplet.x, droplet.y);

                    return;
                }
            }

            // 检测与建筑的碰撞
            for (let building of game.buildings) {
                if (building.health > 0 && game.physicsEngine.checkWaterBuildingCollision(droplet, building)) {
                    droplet.active = false;

                    // 创建水花粒子
                    game.particles.createSplash(droplet.x, droplet.y);

                    return;
                }
            }
        });
    }

    render(game) {
        const ctx = game.ctx;

        this.droplets.forEach(droplet => {
            if (!droplet.active) return;

            ctx.beginPath();
            ctx.arc(droplet.x, droplet.y, droplet.size, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.WATER;
            ctx.fill();
        });
    }

    clear() {
        this.droplets.forEach(droplet => {
            droplet.active = false;
        });
    }
}
