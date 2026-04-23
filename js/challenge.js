// ==================== 挑战模式系统 ====================

class ChallengeSystem {
    constructor(game) {
        this.game = game;
        this.currentChallenge = null;
        this.challenges = this.initChallenges();
        this.completedChallenges = this.loadCompletedChallenges();
    }

    initChallenges() {
        const challenges = [];
        
        // 为每个关卡创建4种挑战
        LEVEL_DATA.forEach((level, levelIndex) => {
            Object.keys(CHALLENGE_TYPES).forEach(challengeType => {
                challenges.push({
                    id: `${levelIndex}_${challengeType}`,
                    levelIndex: levelIndex,
                    type: challengeType,
                    config: CHALLENGE_TYPES[challengeType],
                    levelData: { ...level },
                    completed: false,
                    bestTime: null,
                    bestScore: 0,
                });
            });
        });

        return challenges;
    }

    loadCompletedChallenges() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
            return saved ? JSON.parse(saved).challenges || {} : {};
        } catch (e) {
            return {};
        }
    }

    saveCompletedChallenges() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}';
            const data = JSON.parse(saved);
            data.challenges = this.completedChallenges;
            localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save challenges:', e);
        }
    }

    startChallenge(levelIndex, challengeType) {
        const challenge = this.challenges.find(
            c => c.levelIndex === levelIndex && c.type === challengeType
        );

        if (!challenge) {
            console.error('Challenge not found');
            return;
        }

        this.currentChallenge = challenge;
        
        // 根据挑战类型修改关卡参数
        const modifiedLevel = { ...challenge.levelData };
        
        switch (challengeType) {
            case 'TIME_LIMIT':
                modifiedLevel.time = CHALLENGE_TYPES.TIME_LIMIT.timeLimit;
                modifiedLevel.scoreMultiplier = CHALLENGE_TYPES.TIME_LIMIT.scoreMultiplier;
                break;
                
            case 'WATER_SAVE':
                modifiedLevel.water = CHALLENGE_TYPES.WATER_SAVE.maxWater;
                modifiedLevel.scoreMultiplier = CHALLENGE_TYPES.WATER_SAVE.scoreMultiplier;
                break;
                
            case 'ACCURACY':
                modifiedLevel.scoreMultiplier = CHALLENGE_TYPES.ACCURACY.scoreMultiplier;
                modifiedLevel.trackAccuracy = true;
                break;
                
            case 'SPEED_RUN':
                modifiedLevel.scoreMultiplier = CHALLENGE_TYPES.SPEED_RUN.scoreMultiplier;
                modifiedLevel.trackTime = true;
                break;
        }

        this.game.loadLevel(levelIndex, modifiedLevel);
    }

    updateChallengeStats(stats) {
        if (!this.currentChallenge) return;

        const challengeType = this.currentChallenge.type;
        
        // 检查挑战是否完成
        let completed = false;
        let reason = '';

        switch (challengeType) {
            case 'TIME_LIMIT':
                completed = stats.victory && stats.timeUsed <= CHALLENGE_TYPES.TIME_LIMIT.timeLimit;
                reason = completed ? '' : '时间超限';
                break;
                
            case 'WATER_SAVE':
                completed = stats.victory && stats.waterUsed <= CHALLENGE_TYPES.WATER_SAVE.maxWater;
                reason = completed ? '' : '用水超限';
                break;
                
            case 'ACCURACY':
                const accuracy = stats.shotsHit / stats.shotsFired;
                completed = stats.victory && accuracy >= CHALLENGE_TYPES.ACCURACY.minAccuracy;
                reason = completed ? '' : `命中率不足 (${(accuracy * 100).toFixed(1)}%)`;
                break;
                
            case 'SPEED_RUN':
                completed = stats.victory;
                // 速通挑战只要通关就算完成，但记录最佳时间
                break;
        }

        if (completed) {
            this.completeChallenge(stats);
        } else if (!stats.victory) {
            // 显示失败原因
            console.log('Challenge failed:', reason);
        }

        return { completed, reason };
    }

    completeChallenge(stats) {
        const challengeId = this.currentChallenge.id;
        
        if (!this.completedChallenges[challengeId]) {
            this.completedChallenges[challengeId] = {
                completed: true,
                bestTime: stats.timeUsed,
                bestScore: stats.score,
                completedAt: Date.now(),
            };
        } else {
            // 更新最佳记录
            const existing = this.completedChallenges[challengeId];
            existing.bestTime = Math.min(existing.bestTime, stats.timeUsed);
            existing.bestScore = Math.max(existing.bestScore, stats.score);
        }

        this.saveCompletedChallenges();
        
        // 检查是否解锁成就
        this.checkAchievements();
    }

    checkAchievements() {
        const completedCount = Object.keys(this.completedChallenges).length;
        const totalChallenges = this.challenges.length;

        // 检查是否完成所有挑战
        if (completedCount === totalChallenges) {
            // 触发成就：挑战大师
            this.game.achievementSystem?.unlock('challenge_master');
        }
    }

    getChallengesForLevel(levelIndex) {
        return this.challenges.filter(c => c.levelIndex === levelIndex);
    }

    isChallengeCompleted(challengeId) {
        return this.completedChallenges[challengeId]?.completed || false;
    }

    getChallengeProgress() {
        const completed = Object.keys(this.completedChallenges).length;
        const total = this.challenges.length;
        return {
            completed,
            total,
            percentage: (completed / total * 100).toFixed(1),
        };
    }

    renderChallengeUI(ctx, x, y) {
        if (!this.currentChallenge) return;

        const config = this.currentChallenge.config;
        
        // 绘制挑战标识
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 200, 60);
        
        ctx.strokeStyle = COLORS.WARNING;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 200, 60);

        ctx.fillStyle = COLORS.TEXT_COLOR;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${config.icon} ${config.name}`, x + 10, y + 25);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(config.description, x + 10, y + 45);

        ctx.restore();
    }
}

// 导出
window.ChallengeSystem = ChallengeSystem;
