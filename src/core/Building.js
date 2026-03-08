import { BUILDING_TYPES } from '../utils/constants.js';

export class Building {
    constructor(type, x, y) {
        const config = BUILDING_TYPES[type];

        this.type = type;
        this.name = config.name;
        this.x = x;
        this.y = y;
        this.width = config.width;
        this.height = config.height;
        this.health = config.health;
        this.maxHealth = config.health;
        this.fireResistance = config.fireResistance;
        this.color = config.color;
    }

    update(game) {
        // 建筑被完全烧毁
        if (this.health <= 0) {
            this.health = 0;
        }
    }

    render(ctx) {
        if (this.health <= 0) {
            // 绘制废墟
            ctx.fillStyle = '#555';
            ctx.fillRect(this.x, this.y + this.height * 0.7, this.width, this.height * 0.3);
            return;
        }

        // 绘制建筑主体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制窗户
        ctx.fillStyle = '#FFE4B5';
        const windowSize = 15;
        const windowGap = 20;
        const windowsPerRow = Math.floor(this.width / windowGap);
        const rows = Math.floor(this.height / windowGap);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < windowsPerRow; col++) {
                const wx = this.x + 10 + col * windowGap;
                const wy = this.y + 10 + row * windowGap;
                ctx.fillRect(wx, wy, windowSize, windowSize);
            }
        }

        // 绘制屋顶
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - 20);
        ctx.lineTo(this.x + this.width + 5, this.y);
        ctx.closePath();
        ctx.fill();

        // 绘制血条
        const healthPercent = this.health / this.maxHealth;
        const barWidth = this.width;
        const barHeight = 5;

        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);

        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(this.x, this.y - 10, barWidth * healthPercent, barHeight);
    }
}

export class BuildingSystem {
    constructor() {
        this.buildings = [];
        this.needSort = false;
    }

    create(type, x, y) {
        const building = new Building(type, x, y);
        this.buildings.push(building);
        this.needSort = true;
        return building;
    }

    update(game) {
        this.buildings.forEach(building => building.update(game));
    }

    render(ctx) {
        // 优化：只在需要时排序
        if (this.needSort) {
            this.buildings.sort((a, b) => a.y - b.y);
            this.needSort = false;
        }

        this.buildings.forEach(building => building.render(ctx));
    }
}
