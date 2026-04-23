/**
 * Facility - 设施系统
 * 管理消防栓、防火墙、消防员等防御设施
 */
import { FACILITY_TYPES, FIRE_CONFIG } from '../utils/constants.js';

export class Facility {
    constructor(type, x, y) {
        const config = FACILITY_TYPES[type.toUpperCase()];
        
        this.type = type.toUpperCase();
        this.name = config.name;
        this.x = x;
        this.y = y;
        this.cost = config.cost;
        this.range = config.range;
        this.icon = config.icon;
        this.color = config.color;
        this.cooldown = 0;
        this.active = true;
    }
    
    update(game) {
        if (!this.active) return;
        
        if (this.cooldown > 0) {
            this.cooldown--;
        }
        
        // 消防员自动灭火
        if (this.type === 'FIGHTER' && this.cooldown === 0) {
            this.autoFirefight(game);
        }
        
        // 消防栓增加水量回复
        if (this.type === 'HYDRANT') {
            this.replenishWater(game);
        }
    }
    
    autoFirefight(game) {
        // 寻找范围内的火
        for (let fire of game.fires) {
            if (fire.intensity <= 0) continue;
            
            const dx = fire.x - this.x;
            const dy = fire.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.range) {
                fire.extinguish(0.05);
                this.cooldown = 30;
                
                // 创建灭火粒子效果
                if (game.particles) {
                    game.particles.createSplash(fire.x, fire.y);
                }
                break;
            }
        }
    }
    
    replenishWater(game) {
        // 每60帧回复一次水量
        if (this.cooldown === 0) {
            game.water = Math.min(game.water + 5, 2000);
            this.cooldown = 60;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        // 绘制范围圈（半透明）
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1;
        
        // 绘制设施图标
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y);
    }
}

export class FacilitySystem {
    constructor() {
        this.facilities = [];
    }
    
    place(game, type, x, y) {
        const config = FACILITY_TYPES[type.toUpperCase()];
        
        // 检查得分是否足够
        if (game.score < config.cost) {
            return false;
        }
        
        // 检查是否与其他设施重叠
        for (let facility of this.facilities) {
            const dx = facility.x - x;
            const dy = facility.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
                return false;
            }
        }
        
        // 检查是否在地面以上
        if (y < game.canvas.height - 100) {
            return false;
        }
        
        // 扣除得分
        game.score -= config.cost;
        
        // 创建设施
        const facility = new Facility(type, x, y);
        this.facilities.push(facility);
        
        return true;
    }
    
    update(game) {
        this.facilities.forEach(facility => facility.update(game));
    }
    
    render(ctx) {
        this.facilities.forEach(facility => facility.render(ctx));
    }
    
    clear() {
        this.facilities = [];
    }
}
