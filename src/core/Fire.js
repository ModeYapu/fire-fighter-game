import { FIRE_CONFIG, LEVEL_DATA, COLORS } from '../utils/constants.js';

export class Fire {
    constructor(building) {
        this.building = building;
        this.x = building.x + building.width / 2;
        this.y = building.y + building.height / 2;
        this.intensity = 1;
        this.radius = 30;
        this.spreadTimer = 0;
    }

    update(game) {
        if (this.intensity <= 0) return;

        // 更新半径
        this.radius = 20 + this.intensity * 10;

        // 对建筑造成伤害
        this.building.health -= FIRE_CONFIG.DAMAGE_RATE * this.intensity;

        // 火焰蔓延逻辑
        this.spreadTimer++;
        if (this.spreadTimer >= FIRE_CONFIG.SPREAD_INTERVAL) {
            this.spreadTimer = 0;
            this.trySpread(game);
        }

        // 生成火焰粒子
        for (let i = 0; i < this.intensity; i++) {
            game.particles.createFire(this.x, this.y, this.intensity);
        }

        // 生成烟雾粒子
        if (Math.random() < 0.3) {
            game.particles.createSmoke(this.x, this.y - 20);
        }
    }

    trySpread(game) {
        // 检查相邻建筑
        game.buildings.forEach(building => {
            if (building === this.building) return;
            if (building.health <= 0) return;

            // 检查是否已经有火
            const hasFire = game.fires.some(f => f.building === building && f.intensity > 0);
            if (hasFire) return;

            // 计算距离
            const dx = building.x - this.building.x;
            const dy = building.y - this.building.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 如果距离足够近，有概率点燃
            if (distance < this.radius + 50) {
                const probability = FIRE_CONFIG.SPREAD_PROBABILITY * this.intensity * (1 - building.fireResistance);

                if (Math.random() < probability) {
                    game.fireSystem.ignite(building);
                }
            }
        });
    }

    extinguish(amount) {
        this.intensity -= amount;
        if (this.intensity <= 0) {
            this.intensity = 0;
        }
    }
}

export class FireSystem {
    constructor() {
        this.fires = [];
    }

    ignite(building) {
        // 检查是否已经有火
        const existingFire = this.fires.find(f => f.building === building);
        if (existingFire) {
            existingFire.intensity = Math.min(existingFire.intensity + 1, FIRE_CONFIG.MAX_INTENSITY);
            return existingFire;
        }

        // 创建新的火
        const newFire = new Fire(building);
        this.fires.push(newFire);
        return newFire;
    }

    update(game) {
        this.fires.forEach(fire => {
            if (fire.intensity > 0) {
                fire.update(game);
            }
        });

        // 移除已熄灭的火（保留建筑还活着的火）
        this.fires = this.fires.filter(f => f.building.health > 0);
    }

    render(game) {
        const ctx = game.ctx;

        this.fires.forEach(fire => {
            if (fire.intensity <= 0) return;

            // 绘制火焰光晕
            const gradient = ctx.createRadialGradient(
                fire.x, fire.y, 0,
                fire.x, fire.y, fire.radius
            );
            gradient.addColorStop(0, COLORS.FIRE_GLOW);
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });
    }

    clear() {
        this.fires = [];
    }
}
