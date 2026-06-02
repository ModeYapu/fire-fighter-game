/**
 * LeaderboardSystem - 排行榜系统
 * 保存和管理每关最佳成绩
 */
import { STORAGE_KEYS } from '../utils/constants.js';

export class LeaderboardSystem {
    constructor() {
        this.storageKey = STORAGE_KEYS.HIGH_SCORES;
        this.scores = this.loadScores();
    }

    loadScores() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.warn('Failed to load scores:', e);
            return {};
        }
    }

    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (e) {
            console.warn('Failed to save scores:', e);
        }
    }

    // 记录关卡成绩
    recordScore(levelId, score, waterLeft, buildingsSaved, timeUsed) {
        if (!this.scores[levelId]) {
            this.scores[levelId] = [];
        }

        const entry = {
            score,
            waterLeft,
            buildingsSaved,
            timeUsed,
            date: new Date().toISOString(),
        };

        this.scores[levelId].push(entry);

        // 按分数排序，只保留前10名
        this.scores[levelId].sort((a, b) => b.score - a.score);
        this.scores[levelId] = this.scores[levelId].slice(0, 10);

        this.saveScores();

        return this.getRank(levelId, score);
    }

    // 获取关卡排行榜
    getLeaderboard(levelId) {
        return this.scores[levelId] || [];
    }

    // 获取关卡最高分
    getHighScore(levelId) {
        const leaderboard = this.scores[levelId];
        return leaderboard && leaderboard.length > 0 ? leaderboard[0].score : 0;
    }

    // 获取排名
    getRank(levelId, score) {
        const leaderboard = this.scores[levelId] || [];
        const rank = leaderboard.findIndex(e => e.score === score) + 1;
        return rank > 0 ? rank : null;
    }

    // 检查是否是新纪录
    isNewRecord(levelId, score) {
        const highScore = this.getHighScore(levelId);
        return score > highScore;
    }

    // 获取所有关卡最高分
    getAllHighScores() {
        const result = {};
        Object.keys(this.scores).forEach(levelId => {
            result[levelId] = this.getHighScore(levelId);
        });
        return result;
    }

    // 清空所有记录
    clearAll() {
        this.scores = {};
        this.saveScores();
    }
}
