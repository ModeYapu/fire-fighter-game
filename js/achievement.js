// ==================== 成就系统 ====================

class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = {};
        this.unlockedAchievements = new Set();
        this.notificationQueue = [];
        this.currentNotification = null;
        this.notificationTimer = 0;
        
        this.initAchievements();
        this.loadProgress();
    }

    initAchievements() {
        // 初始化所有成就
        Object.keys(ACHIEVEMENTS).forEach(key => {
            const achievement = ACHIEVEMENTS[key];
            this.achievements[achievement.id] = {
                ...achievement,
                unlocked: false,
                unlockedAt: null,
                progress: 0,
            };
        });
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedAchievements = new Set(data.unlocked || []);
                
                // 更新成就状态
                this.unlockedAchievements.forEach(id => {
                    if (this.achievements[id]) {
                        this.achievements[id].unlocked = true;
                        this.achievements[id].unlockedAt = data.timestamps[id];
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }

    saveProgress() {
        try {
            const data = {
                unlocked: Array.from(this.unlockedAchievements),
                timestamps: {},
            };
            
            this.unlockedAchievements.forEach(id => {
                if (this.achievements[id]) {
                    data.timestamps[id] = this.achievements[id].unlockedAt;
                }
            });
            
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save achievements:', e);
        }
    }

    checkAchievement(achievementId, value) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;
        
        const condition = achievement.condition;
        let unlocked = false;
        
        switch (condition.type) {
            case 'level_complete':
                unlocked = this.checkLevelComplete(condition, value);
                break;
                
            case 'all_levels_complete':
                unlocked = this.checkAllLevelsComplete();
                break;
                
            case 'no_building_lost':
                unlocked = this.checkNoBuildingLost(value);
                break;
                
            case 'water_saved':
                unlocked = this.checkWaterSaved(condition, value);
                break;
                
            case 'total_water_saved':
                unlocked = this.checkTotalWaterSaved(condition, value);
                break;
                
            case 'fast_complete':
                unlocked = this.checkFastComplete(condition, value);
                break;
                
            case 'all_fast_complete':
                unlocked = this.checkAllFastComplete();
                break;
                
            case 'accuracy':
                unlocked = this.checkAccuracy(condition, value);
                break;
                
            case 'all_challenges_complete':
                unlocked = this.checkAllChallengesComplete();
                break;
                
            case 'use_all_powerups':
                unlocked = this.checkUseAllPowerups();
                break;
                
            case 'all_weather_complete':
                unlocked = this.checkAllWeatherComplete();
                break;
                
            case 'streak':
                unlocked = this.checkStreak(condition, value);
                break;
                
            case 'total_fires':
                unlocked = this.checkTotalFires(condition, value);
                break;
                
            case 'score':
                unlocked = this.checkScore(condition, value);
                break;
        }
        
        if (unlocked) {
            this.unlock(achievementId);
        }
    }

    checkLevelComplete(condition, value) {
        return value.levelId === condition.level;
    }

    checkAllLevelsComplete() {
        const progress = this.game.getLevelProgress();
        return progress.completed === LEVEL_DATA.length;
    }

    checkNoBuildingLost(value) {
        return value.buildingsLost === 0;
    }

    checkWaterSaved(condition, value) {
        return value.waterSaved >= condition.amount;
    }

    checkTotalWaterSaved(condition, value) {
        return value.totalWaterSaved >= condition.amount;
    }

    checkFastComplete(condition, value) {
        return value.timeUsed <= condition.time;
    }

    checkAllFastComplete() {
        // 检查是否所有关卡都在60秒内完成
        const progress = this.game.getLevelProgress();
        return progress.levels.every(level => level.bestTime && level.bestTime <= 60);
    }

    checkAccuracy(condition, value) {
        const accuracy = value.shotsHit / value.shotsFired;
        return accuracy >= condition.rate;
    }

    checkAllChallengesComplete() {
        return this.game.challengeSystem?.getChallengeProgress().completed === 
            this.game.challengeSystem?.challenges.length;
    }

    checkUseAllPowerups() {
        return this.game.powerupSystem?.usedPowerupTypes.size === 
            Object.keys(POWERUP_TYPES).length;
    }

    checkAllWeatherComplete() {
        return this.game.weatherSystem?.hasCompletedAllWeathers();
    }

    checkStreak(condition, value) {
        return value.streak >= condition.count;
    }

    checkTotalFires(condition, value) {
        return value.totalFires >= condition.count;
    }

    checkScore(condition, value) {
        return value.score >= condition.amount;
    }

    unlock(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        
        this.unlockedAchievements.add(achievementId);
        this.saveProgress();
        
        // 添加到通知队列
        this.notificationQueue.push(achievement);
        
        console.log(`🏆 成就解锁: ${achievement.icon} ${achievement.name}`);
    }

    update(deltaTime) {
        // 更新通知显示
        if (this.currentNotification) {
            this.notificationTimer += deltaTime * 1000;
            
            if (this.notificationTimer >= 3000) { // 3秒显示时间
                this.currentNotification = null;
                this.notificationTimer = 0;
            }
        } else if (this.notificationQueue.length > 0) {
            // 显示下一个通知
            this.currentNotification = this.notificationQueue.shift();
            this.notificationTimer = 0;
        }
    }

    render(ctx) {
        // 渲染成就通知
        if (this.currentNotification) {
            this.renderNotification(ctx);
        }
    }

    renderNotification(ctx) {
        const achievement = this.currentNotification;
        const x = GAME_CONFIG.CANVAS_WIDTH / 2;
        const y = 100;
        
        // 淡入淡出效果
        let alpha = 1;
        if (this.notificationTimer < 500) {
            alpha = this.notificationTimer / 500;
        } else if (this.notificationTimer > 2500) {
            alpha = (3000 - this.notificationTimer) / 500;
        }
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(x - 150, y - 30, 300, 60);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 150, y - 30, 300, 60);
        
        // 文字
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 成就解锁！', x, y - 5);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${achievement.icon} ${achievement.name}`, x, y + 18);
        
        ctx.restore();
    }

    getUnlockedCount() {
        return this.unlockedAchievements.size;
    }

    getTotalCount() {
        return Object.keys(this.achievements).length;
    }

    getProgress() {
        return {
            unlocked: this.getUnlockedCount(),
            total: this.getTotalCount(),
            percentage: (this.getUnlockedCount() / this.getTotalCount() * 100).toFixed(1),
        };
    }

    getAchievementList() {
        return Object.values(this.achievements);
    }

    isUnlocked(achievementId) {
        return this.unlockedAchievements.has(achievementId);
    }
}

// 导出
window.AchievementSystem = AchievementSystem;
