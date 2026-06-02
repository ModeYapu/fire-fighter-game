/**
 * ScoringSystem - 评分系统
 * 根据被救建筑HP、用时、消防员存活给评分(S/A/B/C)
 */
import { GRADE_CONFIG } from '../utils/constants.js';

export class ScoringSystem {
    constructor() {
        this.currentGrade = null;
        this.scoreDetails = {};
    }

    calculateScore(game) {
        // 收集数据
        const totalBuildings = game.buildings.length;
        const savedBuildings = game.buildings.filter(b => b.health > 0);
        const savedBuildingCount = savedBuildings.length;

        // 计算被救建筑的平均HP百分比
        const totalHP = game.buildings.reduce((sum, b) => sum + (b.maxHealth || 0), 0);
        const remainingHP = game.buildings.reduce((sum, b) => sum + Math.max(0, b.health), 0);
        const hpPercent = totalHP > 0 ? remainingHP / totalHP : 0;

        // 计算时间奖励（剩余时间越多越好）
        const levelData = game.currentLevel >= 0 ?
            (game.constructor?.LEVEL_DATA || [])[game.currentLevel] : null;
        const initialTime = levelData?.time || 60;
        const timeBonus = game.time > 0 ? game.time / initialTime : 0;

        // 计算消防员存活奖励
        const fighterCount = game.fighterSystem?.getAliveCount() || 1;
        const fighterBonus = fighterCount / 2; // 2个存活=1.0, 1个存活=0.5

        // 计算水量效率（剩余水量越多越好）
        const initialWater = levelData?.initialWater || 1000;
        const waterEfficiency = game.water > 0 ? game.water / initialWater : 0;

        // 综合评分 (0-1)
        const buildingScore = hpPercent * 0.5; // 建筑HP占50%
        const timeScore = timeBonus * 0.2; // 时间占20%
        const fighterScore = fighterBonus * 0.2; // 消防员存活占20%
        const waterScore = waterEfficiency * 0.1; // 水量效率占10%

        const totalScore = buildingScore + timeScore + fighterScore + waterScore;

        // 计算等级
        let grade = 'C';
        for (const [key, config] of Object.entries(GRADE_CONFIG)) {
            if (totalScore >= config.minScore) {
                grade = key;
                break;
            }
        }

        this.currentGrade = grade;
        this.scoreDetails = {
            totalScore: Math.round(totalScore * 100),
            grade: grade,
            buildingScore: Math.round(buildingScore * 100),
            timeScore: Math.round(timeScore * 100),
            fighterScore: Math.round(fighterScore * 100),
            waterScore: Math.round(waterScore * 100),
            savedBuildings: savedBuildingCount,
            totalBuildings: totalBuildings,
            hpPercent: Math.round(hpPercent * 100),
            timeRemaining: Math.max(0, Math.floor(game.time)),
            fightersAlive: fighterCount,
        };

        return this.scoreDetails;
    }

    getGrade() {
        return this.currentGrade;
    }

    getGradeConfig(grade) {
        return GRADE_CONFIG[grade] || GRADE_CONFIG.C;
    }

    renderGradeCard(ctx, x, y, width = 200, height = 250) {
        if (!this.currentGrade || !this.scoreDetails) {
            return;
        }

        const config = this.getGradeConfig(this.currentGrade);

        // 背景卡片
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.roundRect(ctx, x, y, width, height, 10);
        ctx.fill();

        // 边框（根据等级颜色）
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 标题
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('评分', x + width / 2, y + 30);

        // 等级大字
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = config.color;
        ctx.fillText(config.name, x + width / 2, y + 90);

        // 分数
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${this.scoreDetails.totalScore}分`, x + width / 2, y + 120);

        // 分割线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 135);
        ctx.lineTo(x + width - 20, y + 135);
        ctx.stroke();

        // 详细信息
        ctx.font = '12px Arial';
        ctx.fillStyle = '#bdc3c7';
        ctx.textAlign = 'left';
        const lineHeight = 20;
        let currentY = y + 155;

        const details = [
            `建筑保存: ${this.scoreDetails.hpPercent}%`,
            `时间剩余: ${this.scoreDetails.timeRemaining}s`,
            `消防员: ${this.scoreDetails.fightersAlive}/2`,
            `救下建筑: ${this.scoreDetails.savedBuildings}/${this.scoreDetails.totalBuildings}`,
        ];

        details.forEach((detail, index) => {
            ctx.fillText(detail, x + 25, currentY + index * lineHeight);
        });

        // 评价
        ctx.textAlign = 'center';
        ctx.fillStyle = config.color;
        const comments = {
            S: '完美指挥！',
            A: '表现出色！',
            B: '任务完成',
            C: '需要改进'
        };
        ctx.fillText(comments[this.currentGrade], x + width / 2, y + height - 15);
    }

    renderMiniGrade(ctx, x, y) {
        if (!this.currentGrade) return;

        const config = this.getGradeConfig(this.currentGrade);

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.roundRect(ctx, x, y, 50, 50, 5);
        ctx.fill();

        // 等级
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = config.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.name, x + 25, y + 25);
        ctx.textBaseline = 'alphabetic';
    }

    roundRect(ctx, x, y, width, height, radius) {
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, radius);
        } else {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }
    }
}
