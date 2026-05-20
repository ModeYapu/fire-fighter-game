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
        // 缓存碰撞边界框，避免重复计算
        this.collisionBounds = null;
    }

    update(wind, canvasWidth, canvasHeight) {
        // 应用重力
        this.vy += PHYSICS.GRAVITY * PHYSICS.PIXELS_PER_METER / 60;

        // 应用风力
        this.vx += wind / 60;

        // 更新位置
        this.x += this.vx;
        this.y += this.vy;

        // 检查是否出界（使用动态画布尺寸）
        if (this.y > canvasHeight || this.x < 0 || this.x > canvasWidth) {
            this.active = false;
        }

        // 重置碰撞边界框缓存
        this.collisionBounds = null;
    }

    // 获取碰撞边界框（缓存结果以避免重复计算）
    getBounds() {
        if (!this.collisionBounds) {
            this.collisionBounds = {
                left: this.x - this.size,
                right: this.x + this.size,
                top: this.y - this.size,
                bottom: this.y + this.size
            };
        }
        return this.collisionBounds;
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
        // 安全检查：验证game对象
        if (!game || !game.canvas || !game.physicsEngine) {
            console.warn('WaterSystem: Invalid game object');
            return;
        }

        // 性能优化：预先过滤活跃的火焰和建筑
        const activeFires = game.fires ? game.fires.filter(fire => fire && fire.intensity > 0) : [];
        const activeBuildings = game.buildings ? game.buildings.filter(building => building && building.health > 0) : [];

        // 如果没有活跃目标，跳过碰撞检测
        if (activeFires.length === 0 && activeBuildings.length === 0) {
            this.droplets.forEach(droplet => {
                if (droplet.active) {
                    droplet.update(game.physicsEngine.wind, game.canvas.width, game.canvas.height);
                }
            });
            return;
        }

        this.droplets.forEach(droplet => {
            if (!droplet.active) return;

            droplet.update(game.physicsEngine.wind, game.canvas.width, game.canvas.height);

            // 检查是否仍然活跃
            if (!droplet.active) return;

            const dropletBounds = droplet.getBounds();

            // 优化：使用早期退出和简化碰撞检测
            let collided = false;

            // 检测与火焰的碰撞（优先级高于建筑）
            for (let i = 0; i < activeFires.length && !collided; i++) {
                const fire = activeFires[i];
                if (this.quickCollisionCheck(dropletBounds, fire)) {
                    // 执行精确碰撞检测
                    if (game.physicsEngine.checkWaterFireCollision(droplet, fire)) {
                        this.handleFireCollision(droplet, fire, game);
                        collided = true;
                    }
                }
            }

            // 如果没有与火焰碰撞，检测与建筑的碰撞
            if (!collided) {
                for (let i = 0; i < activeBuildings.length && !collided; i++) {
                    const building = activeBuildings[i];
                    if (this.quickCollisionCheck(dropletBounds, building)) {
                        // 执行精确碰撞检测
                        if (game.physicsEngine.checkWaterBuildingCollision(droplet, building)) {
                            this.handleBuildingCollision(droplet, game);
                            collided = true;
                        }
                    }
                }
            }
        });
    }

    // 快速碰撞检测（边界框预检查）
    quickCollisionCheck(dropletBounds, target) {
        const targetBounds = target.getBounds ? target.getBounds() : {
            left: target.x - (target.width || 50) / 2,
            right: target.x + (target.width || 50) / 2,
            top: target.y - (target.height || 50) / 2,
            bottom: target.y + (target.height || 50) / 2
        };

        return !(dropletBounds.right < targetBounds.left ||
                 dropletBounds.left > targetBounds.right ||
                 dropletBounds.bottom < targetBounds.top ||
                 dropletBounds.top > targetBounds.bottom);
    }

    // 处理与火焰的碰撞
    handleFireCollision(droplet, fire, game) {
        droplet.active = false;
        fire.extinguish(FIRE_CONFIG.EXTINGUISH_RATE);

        // 增加得分
        game.score += RESOURCE_CONFIG.SCORE_PER_FIRE * FIRE_CONFIG.EXTINGUISH_RATE;

        // 创建水花粒子
        game.particles.createSplash(droplet.x, droplet.y);
    }

    // 处理与建筑的碰撞
    handleBuildingCollision(droplet, game) {
        droplet.active = false;

        // 创建水花粒子
        game.particles.createSplash(droplet.x, droplet.y);
    }

    render(game) {
        const ctx = game.ctx;

        this.droplets.forEach(droplet => {
            if (!droplet.active) return;

            // 绘制水滴光晕
            const gradient = ctx.createRadialGradient(
                droplet.x, droplet.y, 0,
                droplet.x, droplet.y, droplet.size * 2
            );
            gradient.addColorStop(0, 'rgba(52, 152, 219, 0.8)');
            gradient.addColorStop(0.5, 'rgba(52, 152, 219, 0.4)');
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(droplet.x, droplet.y, droplet.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // 绘制水滴主体
            ctx.beginPath();
            ctx.arc(droplet.x, droplet.y, droplet.size, 0, Math.PI * 2);
            ctx.fillStyle = '#3498db';
            ctx.fill();
            
            // 水滴高光
            ctx.beginPath();
            ctx.arc(droplet.x - droplet.size * 0.3, droplet.y - droplet.size * 0.3, droplet.size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
        });
    }

    clear() {
        this.droplets.forEach(droplet => {
            droplet.active = false;
        });
    }
}
