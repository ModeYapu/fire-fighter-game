/**
 * Building - 建筑系统
 * 管理建筑的创建、状态和渲染
 */
import { BUILDING_TYPES, COLORS } from '../utils/constants.js';

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
        this.roofColor = config.roofColor || '#8B4513';
        this.burning = false;
        this.damageLevel = 0; // 0-1 损坏程度
    }

    update(game) {
        // 更新损坏程度
        this.damageLevel = 1 - (this.health / this.maxHealth);
        
        // 建筑被完全烧毁
        if (this.health <= 0) {
            this.health = 0;
        }
    }

    render(ctx) {
        if (this.health <= 0) {
            this.renderRuins(ctx);
            return;
        }

        // 保存上下文
        ctx.save();

        // 根据损坏程度调整透明度
        ctx.globalAlpha = 1 - this.damageLevel * 0.3;

        // 绘制阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 8, this.y + 8, this.width, this.height);

        // 绘制建筑主体
        this.renderBuildingBody(ctx);

        // 绘制屋顶
        this.renderRoof(ctx);

        // 绘制窗户
        this.renderWindows(ctx);

        // 绘制门
        this.renderDoor(ctx);

        // 恢复上下文
        ctx.restore();

        // 绘制血条
        this.renderHealthBar(ctx);
        
        // 绘制建筑名称
        this.renderName(ctx);
    }

    renderBuildingBody(ctx) {
        // 建筑主体渐变
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 30));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 建筑边框
        ctx.strokeStyle = this.darkenColor(this.color, 50);
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    renderRoof(ctx) {
        const roofHeight = 35;
        
        ctx.fillStyle = this.roofColor;
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - roofHeight);
        ctx.lineTo(this.x + this.width + 15, this.y);
        ctx.closePath();
        ctx.fill();

        // 屋顶高光
        ctx.fillStyle = this.lightenColor(this.roofColor, 20);
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - roofHeight);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.closePath();
        ctx.fill();
        
        // 屋顶边框
        ctx.strokeStyle = this.darkenColor(this.roofColor, 30);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    renderWindows(ctx) {
        const windowWidth = 24;
        const windowHeight = 32;
        const windowGap = 40;
        const startX = this.x + 20;
        const startY = this.y + 20;

        const cols = Math.floor((this.width - 40) / windowGap);
        const rows = Math.floor((this.height - 60) / windowGap);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const wx = startX + col * windowGap;
                const wy = startY + row * windowGap;

                // 窗户背景
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(wx, wy, windowWidth, windowHeight);

                // 窗户玻璃（带光晕效果）
                const glassGradient = ctx.createLinearGradient(wx, wy, wx, wy + windowHeight);
                glassGradient.addColorStop(0, '#FFE4B5');
                glassGradient.addColorStop(0.5, '#FFD700');
                glassGradient.addColorStop(1, '#FFA500');
                
                ctx.fillStyle = glassGradient;
                ctx.fillRect(wx + 2, wy + 2, windowWidth - 4, windowHeight - 4);

                // 窗框
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(wx, wy, windowWidth, windowHeight);
                
                // 十字窗框
                ctx.beginPath();
                ctx.moveTo(wx + windowWidth / 2, wy);
                ctx.lineTo(wx + windowWidth / 2, wy + windowHeight);
                ctx.moveTo(wx, wy + windowHeight / 2);
                ctx.lineTo(wx + windowWidth, wy + windowHeight / 2);
                ctx.stroke();
            }
        }
    }

    renderDoor(ctx) {
        const doorWidth = 32;
        const doorHeight = 45;
        const doorX = this.x + (this.width - doorWidth) / 2;
        const doorY = this.y + this.height - doorHeight;

        // 门框
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(doorX - 4, doorY - 4, doorWidth + 8, doorHeight + 4);

        // 门
        ctx.fillStyle = '#654321';
        ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

        // 门把手
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(doorX + doorWidth - 8, doorY + doorHeight / 2, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    renderRuins(ctx) {
        // 废墟效果
        ctx.fillStyle = '#3a3a3a';
        
        // 绘制不规则废墟
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + 10, this.y + this.height - 20);
        ctx.lineTo(this.x + 25, this.y + this.height - 35);
        ctx.lineTo(this.x + 40, this.y + this.height - 25);
        ctx.lineTo(this.x + 55, this.y + this.height - 40);
        ctx.lineTo(this.x + 70, this.y + this.height - 20);
        ctx.lineTo(this.x + 85, this.y + this.height - 30);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // 烟雾效果
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height - 30, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 8;
        const barX = this.x;
        const barY = this.y - 35;

        const healthPercent = this.health / this.maxHealth;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // 血条
        let barColor;
        if (healthPercent > 0.6) {
            barColor = '#2ecc71';
        } else if (healthPercent > 0.3) {
            barColor = '#f39c12';
        } else {
            barColor = '#e74c3c';
        }

        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // 边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    renderName(ctx) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width / 2, this.y - 42);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}

export class BuildingSystem {
    constructor() {
        this.buildings = [];
        this.needSort = false;
    }

    create(type, x, y) {
        const config = BUILDING_TYPES[type];
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
