// ==================== 救援系统 ====================

class RescueSystem {
    constructor(game) {
        this.game = game;
        this.survivors = [];
        this.rescuedCount = 0;
        this.totalRescued = 0;
        this.rescuePoints = 200; // 每救援一人获得分数
    }

    // 生成幸存者
    spawnSurvivors(buildings) {
        this.survivors = [];
        buildings.forEach((building, index) => {
            // 每个燃烧的建筑有30%概率有幸存者
            if (building.state === 'burning' && Math.random() < 0.3) {
                const survivor = this.createSurvivor(building);
                this.survivors.push(survivor);
            }
        });
    }

    // 创建幸存者
    createSurvivor(building) {
        return {
            id: Math.random().toString(36).substr(2, 9),
            x: building.x + building.width / 2,
            y: building.y - 20,
            buildingId: building.id,
            health: 100,
            maxHealth: 100,
            state: 'trapped', // trapped, rescued, dead
            rescueProgress: 0,
            rescueTime: 3000, // 需要浇灭3秒才能救援
            panicLevel: 0, // 恐慌值，影响移动
            waveTimer: 0,
            waveInterval: 2000, // 挥手间隔
        };
    }

    // 更新幸存者状态
    update(deltaTime) {
        this.survivors.forEach(survivor => {
            if (survivor.state !== 'trapped') return;

            // 更新挥手动画
            survivor.waveTimer += deltaTime;
            if (survivor.waveTimer >= survivor.waveInterval) {
                survivor.waveTimer = 0;
            }

            // 如果所在建筑还在燃烧，健康值下降
            const building = this.game.buildings.find(b => b.id === survivor.buildingId);
            if (building && building.state === 'burning') {
                survivor.health -= 0.5 * deltaTime / 1000;
                survivor.panicLevel = Math.min(100, survivor.panicLevel + 1);

                if (survivor.health <= 0) {
                    survivor.state = 'dead';
                    this.game.showMessage('😢 救援失败...', 2000);
                }
            } else if (building && building.state !== 'burning') {
                // 建筑已灭火，救援进度增加
                survivor.rescueProgress += deltaTime;
                
                if (survivor.rescueProgress >= survivor.rescueTime) {
                    this.rescueSurvivor(survivor);
                }
            }

            // 恐慌时随机移动
            if (survivor.panicLevel > 50) {
                survivor.x += (Math.random() - 0.5) * 2;
            }
        });
    }

    // 救援成功
    rescueSurvivor(survivor) {
        survivor.state = 'rescued';
        this.rescuedCount++;
        this.totalRescued++;
        
        // 增加分数
        this.game.addScore(this.rescuePoints);
        
        // 显示救援成功消息
        this.game.showMessage('🎉 救援成功！+200分', 2000);
        
        // 播放音效
        if (this.game.audio) {
            this.game.audio.play('rescue');
        }

        // 触发成就检查
        this.checkAchievements();
    }

    // 检查成就
    checkAchievements() {
        if (this.totalRescued >= 10) {
            this.game.achievementSystem?.unlock('rescuer_10');
        }
        if (this.totalRescued >= 50) {
            this.game.achievementSystem?.unlock('rescuer_50');
        }
        if (this.rescuedCount >= 3 && this.game.state === 'battle') {
            this.game.achievementSystem?.unlock('rescue_master');
        }
    }

    // 渲染幸存者
    render(ctx) {
        this.survivors.forEach(survivor => {
            if (survivor.state === 'dead') return;
            
            const x = survivor.x;
            const y = survivor.y;
            
            ctx.save();
            
            if (survivor.state === 'trapped') {
                // 绘制被困者
                this.drawTrappedSurvivor(ctx, survivor, x, y);
            } else if (survivor.state === 'rescued') {
                // 绘制救援动画
                this.drawRescuedSurvivor(ctx, survivor, x, y);
            }
            
            ctx.restore();
        });
    }

    // 绘制被困者
    drawTrappedSurvivor(ctx, survivor, x, y) {
        // 恐慌时抖动效果
        const shake = survivor.panicLevel > 50 ? (Math.random() - 0.5) * 4 : 0;
        
        // 身体
        ctx.fillStyle = survivor.health > 50 ? '#FFE4C4' : '#FFA07A';
        ctx.beginPath();
        ctx.arc(x + shake, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 头部
        ctx.fillStyle = '#FFE4C4';
        ctx.beginPath();
        ctx.arc(x + shake, y - 12, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 挥手动画
        const waveProgress = survivor.waveTimer / survivor.waveInterval;
        const waveAngle = Math.sin(waveProgress * Math.PI * 2) * 0.5;
        
        ctx.strokeStyle = '#FFE4C4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + shake, y - 5);
        ctx.lineTo(x + 12 + shake, y - 10 + Math.sin(waveAngle) * 5);
        ctx.stroke();
        
        // 求助标识
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HELP!', x + shake, y - 25);
        
        // 健康条
        const healthBarWidth = 20;
        const healthBarHeight = 3;
        const healthPercent = survivor.health / survivor.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(x - healthBarWidth / 2, y - 35, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#27ae60' : (healthPercent > 0.25 ? '#f39c12' : '#e74c3c');
        ctx.fillRect(x - healthBarWidth / 2, y - 35, healthBarWidth * healthPercent, healthBarHeight);
        
        // 救援进度条
        if (survivor.rescueProgress > 0) {
            const progressPercent = survivor.rescueProgress / survivor.rescueTime;
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x - healthBarWidth / 2, y + 15, healthBarWidth * progressPercent, healthBarHeight);
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText('救援中...', x, y + 25);
        }
    }

    // 绘制救援成功的幸存者
    drawRescuedSurvivor(ctx, survivor, x, y) {
        // 救援成功动画（向上飘）
        const alpha = Math.max(0, 1 - survivor.rescueProgress / 2000);
        const offsetY = survivor.rescueProgress / 10;
        
        ctx.globalAlpha = alpha;
        
        // 快乐的表情
        ctx.fillStyle = '#FFE4C4';
        ctx.beginPath();
        ctx.arc(x, y - offsetY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y - 12 - offsetY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 笑脸
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - 2, y - 14 - offsetY, 1, 0, Math.PI * 2);
        ctx.arc(x + 2, y - 14 - offsetY, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y - 10 - offsetY, 3, 0, Math.PI);
        ctx.stroke();
        
        // 星星效果
        for (let i = 0; i < 3; i++) {
            const starX = x + Math.cos(Date.now() / 500 + i * 2) * 20;
            const starY = y - offsetY + Math.sin(Date.now() / 500 + i * 2) * 10;
            ctx.fillStyle = '#FFD700';
            ctx.font = '16px Arial';
            ctx.fillText('⭐', starX, starY);
        }
        
        survivor.rescueProgress += 16;
    }

    // 重置
    reset() {
        this.survivors = [];
        this.rescuedCount = 0;
    }

    // 获取统计信息
    getStats() {
        return {
            total: this.survivors.length,
            rescued: this.rescuedCount,
            dead: this.survivors.filter(s => s.state === 'dead').length,
            trapped: this.survivors.filter(s => s.state === 'trapped').length,
        };
    }
}

export { RescueSystem };
