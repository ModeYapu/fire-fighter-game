// ==================== 排行榜系统 ====================

class LeaderboardSystem {
    constructor(game) {
        this.game = game;
        this.leaderboard = {};
        this.loadLeaderboard();
    }

    loadLeaderboard() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
            if (saved) {
                this.leaderboard = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load leaderboard:', e);
            this.leaderboard = {};
        }
    }

    saveLeaderboard() {
        try {
            localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(this.leaderboard));
        } catch (e) {
            console.error('Failed to save leaderboard:', e);
        }
    }

    recordScore(levelId, stats) {
        const key = `level_${levelId}`;
        
        if (!this.leaderboard[key]) {
            this.leaderboard[key] = {
                bestScore: 0,
                bestTime: null,
                leastWater: null,
                highestAccuracy: 0,
                attempts: 0,
                victories: 0,
            };
        }

        const record = this.leaderboard[key];
        record.attempts++;
        
        if (stats.victory) {
            record.victories++;
            
            // 更新最佳分数
            if (stats.score > record.bestScore) {
                record.bestScore = stats.score;
            }
            
            // 更新最佳时间
            if (!record.bestTime || stats.timeUsed < record.bestTime) {
                record.bestTime = stats.timeUsed;
            }
            
            // 更新最少用水
            if (!record.leastWater || stats.waterUsed < record.leastWater) {
                record.leastWater = stats.waterUsed;
            }
            
            // 更新最高命中率
            const accuracy = stats.shotsFired > 0 ? stats.shotsHit / stats.shotsFired : 0;
            if (accuracy > record.highestAccuracy) {
                record.highestAccuracy = accuracy;
            }
        }
        
        this.saveLeaderboard();
        
        return this.getLevelRank(levelId, stats);
    }

    getLevelRank(levelId, stats) {
        const key = `level_${levelId}`;
        const record = this.leaderboard[key];
        
        if (!record || !stats.victory) return null;
        
        // 根据分数计算星级
        const score = stats.score;
        const targetScore = LEVEL_DATA[levelId - 1]?.targetScore || 1000;
        
        let stars = 1;
        if (score >= targetScore * 2) stars = 3;
        else if (score >= targetScore * 1.5) stars = 2;
        
        return {
            stars,
            isNewRecord: score === record.bestScore,
            isBestTime: stats.timeUsed === record.bestTime,
            isLeastWater: stats.waterUsed === record.leastWater,
        };
    }

    getLevelRecord(levelId) {
        const key = `level_${levelId}`;
        return this.leaderboard[key] || null;
    }

    getAllRecords() {
        return this.leaderboard;
    }

    getTotalStats() {
        let totalAttempts = 0;
        let totalVictories = 0;
        let totalScore = 0;
        let totalFires = 0;
        
        Object.values(this.leaderboard).forEach(record => {
            totalAttempts += record.attempts;
            totalVictories += record.victories;
            totalScore += record.bestScore;
        });
        
        // 从成就系统获取总火焰数
        const saved = localStorage.getItem('fireFighterStats');
        if (saved) {
            const stats = JSON.parse(saved);
            totalFires = stats.totalFires || 0;
        }
        
        return {
            attempts: totalAttempts,
            victories: totalVictories,
            totalScore,
            totalFires,
            winRate: totalAttempts > 0 ? (totalVictories / totalAttempts * 100).toFixed(1) : 0,
        };
    }

    updateTotalFires(count) {
        try {
            let stats = { totalFires: 0 };
            const saved = localStorage.getItem('fireFighterStats');
            if (saved) {
                stats = JSON.parse(saved);
            }
            
            stats.totalFires += count;
            localStorage.setItem('fireFighterStats', JSON.stringify(stats));
        } catch (e) {
            console.error('Failed to update total fires:', e);
        }
    }

    updateTotalWaterSaved(amount) {
        try {
            let stats = { totalWaterSaved: 0 };
            const saved = localStorage.getItem('fireFighterStats');
            if (saved) {
                stats = JSON.parse(saved);
            }
            
            stats.totalWaterSaved += amount;
            localStorage.setItem('fireFighterStats', JSON.stringify(stats));
        } catch (e) {
            console.error('Failed to update total water saved:', e);
        }
    }

    getTotalWaterSaved() {
        try {
            const saved = localStorage.getItem('fireFighterStats');
            if (saved) {
                const stats = JSON.parse(saved);
                return stats.totalWaterSaved || 0;
            }
        } catch (e) {
            console.error('Failed to get total water saved:', e);
        }
        return 0;
    }

    renderLeaderboardUI(ctx, levelId) {
        const record = this.getLevelRecord(levelId);
        if (!record) return;
        
        const x = GAME_CONFIG.CANVAS_WIDTH - 200;
        const y = 150;
        const width = 190;
        const height = 140;
        
        ctx.save();
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = COLORS.INFO;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // 标题
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = COLORS.TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.fillText('📊 最佳记录', x + width / 2, y + 25);
        
        // 分数
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`🏆 最高分: ${record.bestScore}`, x + 15, y + 50);
        
        // 时间
        ctx.fillStyle = '#3498db';
        ctx.fillText(`⏱️ 最快: ${record.bestTime?.toFixed(1) || '--'}s`, x + 15, y + 75);
        
        // 用水
        ctx.fillStyle = '#2ecc71';
        ctx.fillText(`💧 最少: ${record.leastWater || '--'}`, x + 15, y + 100);
        
        // 命中率
        const accuracy = (record.highestAccuracy * 100).toFixed(1);
        ctx.fillStyle = '#e67e22';
        ctx.fillText(`🎯 最高命中率: ${accuracy}%`, x + 15, y + 125);
        
        ctx.restore();
    }

    renderTotalStatsUI(ctx) {
        const stats = this.getTotalStats();
        
        const x = 10;
        const y = GAME_CONFIG.CANVAS_HEIGHT - 120;
        const width = 200;
        const height = 110;
        
        ctx.save();
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = COLORS.WARNING;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // 标题
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = COLORS.TEXT_COLOR;
        ctx.textAlign = 'left';
        ctx.fillText('📈 总体统计', x + 15, y + 25);
        
        // 统计数据
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`游戏次数: ${stats.attempts}`, x + 15, y + 50);
        ctx.fillText(`胜利次数: ${stats.victories}`, x + 15, y + 70);
        ctx.fillText(`胜率: ${stats.winRate}%`, x + 15, y + 90);
        ctx.fillText(`总分数: ${stats.totalScore}`, x + 15, y + 110);
        
        ctx.restore();
    }
}

// 导出
window.LeaderboardSystem = LeaderboardSystem;
