/**
 * Fire - 火焰系统
 * 管理火焰的创建、蔓延和渲染
 */
import { FIRE_CONFIG, COLORS } from '../utils/constants.js';

export class Fire {
    constructor(building) {
        this.building = building;
        this.x = building.x + building.width / 2;
        this.y = building.y + building.height / 3; // 火焰在建筑顶部
        this.intensity = 1;
        this.radius = 40;
        this.spreadTimer = 0;
        this.flickerOffset = 0;
    }

    update(game) {
        if (this.intensity <= 0) return;

        // 更新半径（更大更明显）
        this.radius = 35 + this.intensity * 15;

        // 对建筑造成伤害
        this.building.health -= FIRE_CONFIG.DAMAGE_RATE * this.intensity;
        this.building.burning = true;

        // 火焰蔓延逻辑
        this.spreadTimer++;
        if (this.spreadTimer >= FIRE_CONFIG.SPREAD_INTERVAL) {
            this.spreadTimer = 0;
            this.trySpread(game);
        }

        // 生成更多火焰粒子
        for (let i = 0; i < this.intensity * 2; i++) {
            game.particles.createFire(this.x, this.y, this.intensity);
        }

        // 生成烟雾粒子
        if (Math.random() < 0.5) {
            game.particles.createSmoke(this.x, this.y - 30);
        }

        // 火焰闪烁效果
        this.flickerOffset = Math.random() * 5;
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
            if (distance < this.radius + 80) {
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
            this.building.burning = false;
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

            const x = fire.x;
            const y = fire.y;
            const r = fire.radius + fire.flickerOffset;

            // 绘制火焰外层光晕（更大范围）
            const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
            outerGlow.addColorStop(0, 'rgba(255, 100, 0, 0.5)');
            outerGlow.addColorStop(0.5, 'rgba(255, 50, 0, 0.3)');
            outerGlow.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(x, y, r * 2, 0, Math.PI * 2);
            ctx.fillStyle = outerGlow;
            ctx.fill();

            // 绘制火焰主体光晕
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 1.2);
            gradient.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
            gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.7)');
            gradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.4)');
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(x, y, r * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // 绘制火焰核心（更亮）
            const coreGradient = ctx.createRadialGradient(x, y - 15, 0, x, y - 15, r * 0.6);
            coreGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
            coreGradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.7)');
            coreGradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(x, y - 15, r * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = coreGradient;
            ctx.fill();

            // 绘制火焰图标（醒目）- 更大
            ctx.font = `${50 + fire.intensity * 8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔥', x, y);
        });
    }

    clear() {
        this.fires = [];
    }
}
