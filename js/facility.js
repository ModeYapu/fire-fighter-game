class Facility {
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
    }
    
    update(game) {
        if (this.cooldown > 0) {
            this.cooldown--;
        }
        
        // 消防员自动灭火
        if (this.type === 'FIGHTER' && this.cooldown === 0) {
            this.autoFirefight(game);
        }
    }
    
    autoFirefight(game) {
        // 寻找范围内的火
        for (let fire of game.fires) {
            const dx = fire.x - this.x;
            const dy = fire.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.range) {
                fire.extinguish(0.05);
                this.cooldown = 30;
                break;
            }
        }
    }
    
    render(game) {
        const ctx = game.ctx;
        
        // 绘制范围圈
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 绘制设施图标
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y);
    }
}

class FacilitySystem {
    constructor() {
        this.facilities = [];
    }
    
    place(game, type, x, y) {
        if (!strategy.canPlaceFacility(game, type, x, y)) {
            return false;
        }
        
        const config = FACILITY_TYPES[type.toUpperCase()];
        
        // 扣除得分
        game.score -= config.cost;
        
        // 创建设施
        const facility = new Facility(type, x, y);
        game.facilities.push(facility);
        
        return true;
    }
    
    update(game) {
        game.facilities.forEach(facility => facility.update(game));
    }
    
    render(game) {
        game.facilities.forEach(facility => facility.render(game));
    }
}

// 创建全局实例
const facility = new FacilitySystem();
