/**
 * FighterSystem - 消防员角色系统
 * 管理2个消防员角色（队长/队员）切换和不同能力
 */
import { FIGHTER_TYPES } from '../utils/constants.js';

export class Fighter {
    constructor(type) {
        const config = FIGHTER_TYPES[type];
        this.type = type;
        this.name = config.name;
        this.icon = config.icon;
        this.waterBonus = config.waterBonus;
        this.speedBonus = config.speedBonus;
        this.cooldownReduction = config.cooldownReduction;
        this.ability = config.ability;
        this.abilityDesc = config.abilityDesc;
        this.alive = true;
        this.health = 100;
    }

    getEffectiveWater(baseAmount) {
        return baseAmount * this.waterBonus;
    }

    getEffectiveCooldown(baseCooldown) {
        return baseCooldown * this.cooldownReduction;
    }
}

export class FighterSystem {
    constructor() {
        this.fighters = [
            new Fighter('CAPTAIN'),
            new Fighter('MEMBER')
        ];
        this.activeFighterIndex = 0;
        this.switchCooldown = 0;
        this.SWITCH_COOLDOWN_TIME = 3000; // 3秒切换冷却
    }

    get activeFighter() {
        return this.fighters[this.activeFighterIndex];
    }

    switchFighter() {
        const now = Date.now();
        if (now - this.switchCooldown < this.SWITCH_COOLDOWN_TIME) {
            return false; // 冷却中
        }

        // 切换到存活的消防员
        const oldIndex = this.activeFighterIndex;
        this.activeFighterIndex = (this.activeFighterIndex + 1) % this.fighters.length;

        // 如果目标消防员已死亡，跳过
        if (!this.fighters[this.activeFighterIndex].alive) {
            this.activeFighterIndex = (this.activeFighterIndex + 1) % this.fighters.length;
        }

        // 如果所有消防员都死亡，不允许切换
        if (!this.fighters[this.activeFighterIndex].alive) {
            this.activeFighterIndex = oldIndex;
            return false;
        }

        this.switchCooldown = now;
        return true;
    }

    killFighter(index) {
        if (index >= 0 && index < this.fighters.length) {
            this.fighters[index].alive = false;
            this.fighters[index].health = 0;

            // 如果当前消防员死亡，自动切换到存活的
            if (index === this.activeFighterIndex) {
                const aliveIndex = this.fighters.findIndex((f, i) => f.alive && i !== index);
                if (aliveIndex !== -1) {
                    this.activeFighterIndex = aliveIndex;
                }
            }
        }
    }

    getAliveCount() {
        return this.fighters.filter(f => f.alive).length;
    }

    getRemainingCooldown() {
        const elapsed = Date.now() - this.switchCooldown;
        return Math.max(0, this.SWITCH_COOLDOWN_TIME - elapsed);
    }

    reset() {
        this.fighters = [
            new Fighter('CAPTAIN'),
            new Fighter('MEMBER')
        ];
        this.activeFighterIndex = 0;
        this.switchCooldown = 0;
    }

    renderUI(ctx, x, y) {
        // 绘制消防员状态面板
        const panelWidth = 200;
        const panelHeight = 80;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, panelWidth, panelHeight);

        // 标题
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('消防员', x + panelWidth / 2, y + 20);

        // 消防员列表
        const fighterY = y + 35;
        const fighterSpacing = 50;

        this.fighters.forEach((fighter, index) => {
            const fx = x + 30 + index * fighterSpacing;
            const isActive = index === this.activeFighterIndex;

            // 背景高亮
            if (isActive) {
                ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
                ctx.fillRect(fx - 25, fighterY - 15, 45, 50);
            }

            // 图标
            ctx.font = '24px Arial';
            if (fighter.alive) {
                ctx.fillText(fighter.icon, fx, fighterY + 5);
            } else {
                ctx.fillStyle = '#7f8c8d';
                ctx.fillText('💀', fx, fighterY + 5);
                ctx.fillStyle = '#fff';
            }

            // 名称
            ctx.font = '10px Arial';
            ctx.fillText(fighter.name, fx, fighterY + 20);

            // 状态指示
            if (isActive) {
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.arc(fx + 15, fighterY - 10, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
            }
        });

        // 切换冷却
        const cooldown = this.getRemainingCooldown();
        if (cooldown > 0) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#f39c12';
            ctx.textAlign = 'center';
            ctx.fillText(`冷却: ${(cooldown / 1000).toFixed(1)}s`, x + panelWidth / 2, y + panelHeight - 5);
        } else {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#2ecc71';
            ctx.textAlign = 'center';
            ctx.fillText('[Tab] 切换', x + panelWidth / 2, y + panelHeight - 5);
        }
    }
}
