/**
 * 社交系统 (Social System)
 * 每日挑战、分享战绩卡片、好友排行榜
 */
export class SocialSystem {
    constructor(game) {
        this.game = game;

        // 每日挑战
        this.dailyChallenge = null;
        this.dailyChallengeCompleted = false;
        this.dailyChallengeBest = null;

        // 排行榜
        this.leaderboard = this.loadLeaderboard();
        this.friendLeaderboard = this.loadFriendLeaderboard();
        this.maxLeaderboardEntries = 100;

        // 玩家资料
        this.playerProfile = this.loadPlayerProfile();

        // 社交 UI
        this.showSocialUI = false;
        this.activeTab = 'daily'; // daily, leaderboard, share, profile

        // 分享
        this.shareCardData = null;
        this.shareHistory = this.loadShareHistory();
    }

    // ===== 每日挑战 =====
    getDailyChallenge() {
        const today = this.getTodayString();

        if (this.dailyChallenge && this.dailyChallenge.date === today) {
            return this.dailyChallenge;
        }

        // 基于日期生成种子
        const seed = this.dateToSeed(today);
        const rng = this.seededRandom(seed);

        const challenge = {
            date: today,
            seed: seed,
            // 随机关卡配置
            config: {
                fireCount: 8 + Math.floor(rng() * 12),
                buildingCount: 5 + Math.floor(rng() * 6),
                hasBoss: rng() > 0.6,
                hasMutation: rng() > 0.4,
                weatherType: this.pickWeather(rng),
                windStrength: 0.3 + rng() * 0.7,
                timeLimit: 90 + Math.floor(rng() * 60),
                difficulty: this.calculateDifficulty(rng),
                // 建筑布局种子
                layoutSeed: Math.floor(rng() * 999999),
                // 火焰分布种子
                fireSeed: Math.floor(rng() * 999999),
            },
            // 全球统计
            globalStats: {
                totalAttempts: this.generateFakeGlobalStat(rng, 1000, 50000),
                completedCount: this.generateFakeGlobalStat(rng, 200, 20000),
                averageScore: Math.floor(500 + rng() * 1500),
                averageTime: Math.floor(60 + rng() * 120),
                topScore: Math.floor(2000 + rng() * 3000),
            },
            // 奖励
            rewards: {
                completion: 200,
                top10Percent: 500,
                top1Percent: 1000,
            },
        };

        this.dailyChallenge = challenge;
        return challenge;
    }

    startDailyChallenge() {
        const challenge = this.getDailyChallenge();

        // 应用挑战配置到游戏
        if (this.game.onDailyChallengeStart) {
            this.game.onDailyChallengeStart(challenge);
        }

        return challenge;
    }

    completeDailyChallenge(score, time) {
        if (!this.dailyChallenge) return;

        this.dailyChallengeCompleted = true;
        const result = {
            date: this.dailyChallenge.date,
            score: score,
            time: time,
            seed: this.dailyChallenge.seed,
            timestamp: Date.now(),
        };

        // 检查是否是最佳成绩
        if (!this.dailyChallengeBest || score > this.dailyChallengeBest.score) {
            this.dailyChallengeBest = result;
        }

        // 计算全球排名
        const globalRank = this.estimateGlobalRank(score, this.dailyChallenge);
        result.globalRank = globalRank;
        result.percentile = Math.max(1, Math.floor(100 - globalRank.percentile));

        // 保存
        this.saveDailyChallengeResult(result);

        return result;
    }

    estimateGlobalRank(score, challenge) {
        // 基于全球统计估算排名
        const { averageScore, topScore, completedCount } = challenge.globalStats;
        const normalizedScore = (score - averageScore) / (topScore - averageScore);
        const percentile = Math.min(99, Math.max(1, Math.floor((1 - normalizedScore) * 50 + 10)));
        const rank = Math.max(1, Math.floor(completedCount * (percentile / 100)));

        return {
            rank: rank,
            total: completedCount,
            percentile: percentile,
        };
    }

    // ===== 排行榜 =====
    addToLeaderboard(entry) {
        const record = {
            id: `lb_${Date.now()}`,
            playerName: this.playerProfile.name,
            avatar: this.playerProfile.avatar,
            score: entry.score,
            level: entry.level,
            time: entry.time,
            firesExtinguished: entry.firesExtinguished || 0,
            date: Date.now(),
            isFriend: false,
        };

        this.leaderboard.push(record);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, this.maxLeaderboardEntries);

        this.saveLeaderboard();
        return this.getPlayerRank(record.id);
    }

    getPlayerRank(entryId) {
        const index = this.leaderboard.findIndex(e => e.id === entryId);
        return index >= 0 ? index + 1 : -1;
    }

    getLeaderboardPage(page = 0, pageSize = 10) {
        const start = page * pageSize;
        return {
            entries: this.leaderboard.slice(start, start + pageSize),
            total: this.leaderboard.length,
            page: page,
            pageSize: pageSize,
        };
    }

    getTopPlayers(count = 10) {
        return this.leaderboard.slice(0, count);
    }

    // ===== 好友排行榜 =====
    addFriend(friendCode) {
        // 模拟好友添加（实际应用中需要后端）
        const friend = {
            id: `friend_${Date.now()}`,
            code: friendCode,
            name: `消防员${Math.floor(Math.random() * 9000 + 1000)}`,
            avatar: this.randomAvatar(),
            addedAt: Date.now(),
            bestScore: Math.floor(Math.random() * 2000 + 500),
            lastPlayed: Date.now() - Math.floor(Math.random() * 86400000),
        };

        this.playerProfile.friends = this.playerProfile.friends || [];
        this.playerProfile.friends.push(friend);
        this.savePlayerProfile();

        // 生成模拟好友分数到排行榜
        this.generateFriendScore(friend);

        return friend;
    }

    generateFriendScore(friend) {
        const entry = {
            id: `friend_score_${friend.id}`,
            playerName: friend.name,
            avatar: friend.avatar,
            score: friend.bestScore,
            level: Math.floor(Math.random() * 15) + 1,
            time: Math.floor(Math.random() * 180 + 60) * 1000,
            firesExtinguished: Math.floor(Math.random() * 20 + 5),
            date: friend.lastPlayed,
            isFriend: true,
        };

        this.friendLeaderboard.push(entry);
        this.friendLeaderboard.sort((a, b) => b.score - a.score);
        this.saveFriendLeaderboard();
    }

    getFriendLeaderboard() {
        // 合并好友和自己的分数
        const combined = [...this.friendLeaderboard];
        const myScores = this.leaderboard
            .filter(e => e.playerName === this.playerProfile.name)
            .map(e => ({ ...e, isMe: true }));

        combined.push(...myScores);
        combined.sort((a, b) => b.score - a.score);

        return combined;
    }

    getPlayerFriendCode() {
        if (!this.playerProfile.friendCode) {
            this.playerProfile.friendCode = this.generateFriendCode();
            this.savePlayerProfile();
        }
        return this.playerProfile.friendCode;
    }

    generateFriendCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    // ===== 分享战绩卡片 =====
    generateShareCard(gameResult) {
        const cardCanvas = document.createElement('canvas');
        const cardWidth = 500;
        const cardHeight = 400;
        cardCanvas.width = cardWidth;
        cardCanvas.height = cardHeight;
        const ctx = cardCanvas.getContext('2d');

        // 背景渐变
        const bgGrad = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
        bgGrad.addColorStop(0, '#0f0c29');
        bgGrad.addColorStop(0.5, '#302b63');
        bgGrad.addColorStop(1, '#24243e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, cardWidth, cardHeight);

        // 装饰元素 - 火焰粒子
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            const px = Math.random() * cardWidth;
            const py = Math.random() * cardHeight;
            const pr = Math.random() * 3 + 1;
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 100 + 50)}, 0, ${Math.random() * 0.3})`;
            ctx.fill();
        }

        // 外边框
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, cardWidth - 16, cardHeight - 16);

        // 内边框
        ctx.strokeStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(15, 15, cardWidth - 30, cardHeight - 30);

        // 标题区
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 消防灭火战报 🔥', cardWidth / 2, 55);

        // 分割线
        ctx.beginPath();
        ctx.moveTo(50, 70);
        ctx.lineTo(cardWidth - 50, 70);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 玩家信息
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#ecf0f1';
        ctx.fillText(`${this.playerProfile.avatar} ${this.playerProfile.name}`, cardWidth / 2, 95);

        // 关卡
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#bdc3c7';
        ctx.fillText(`关卡: ${gameResult.levelName || '未知'}`, cardWidth / 2, 120);

        // 主要数据区域
        const statsY = 155;
        const statsGap = 65;

        // 得分
        this.drawStatBlock(ctx, cardWidth / 2 - 100, statsY, '🏆 得分', String(gameResult.score || 0), '#f1c40f');

        // 用时
        this.drawStatBlock(ctx, cardWidth / 2, statsY, '⏱️ 用时', this.formatTime(gameResult.time || 0), '#3498db');

        // 灭火
        this.drawStatBlock(ctx, cardWidth / 2 + 100, statsY, '🧯 灭火', `${gameResult.firesExtinguished || 0} 处`, '#e67e22');

        // 全球对比条
        if (gameResult.globalRank) {
            const barY = statsY + 75;
            const barWidth = cardWidth - 120;
            const barX = 60;

            ctx.font = '11px sans-serif';
            ctx.fillStyle = '#95a5a6';
            ctx.textAlign = 'center';
            ctx.fillText(`全球排名: #${gameResult.globalRank.rank} (前 ${gameResult.percentile}%)`, cardWidth / 2, barY);

            // 排名条
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(barX, barY + 8, barWidth, 10);

            const percentFill = (100 - (gameResult.percentile || 50)) / 100;
            const grad = ctx.createLinearGradient(barX, 0, barX + barWidth * percentFill, 0);
            grad.addColorStop(0, '#e74c3c');
            grad.addColorStop(1, '#f39c12');
            ctx.fillStyle = grad;
            ctx.fillRect(barX, barY + 8, barWidth * percentFill, 10);

            // 你在这里标记
            const markerX = barX + barWidth * percentFill;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(markerX, barY + 13, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 结果
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        const isSuccess = gameResult.result === 'completed' || gameResult.result === 'victory';
        ctx.fillStyle = isSuccess ? '#2ecc71' : '#e74c3c';
        ctx.fillText(isSuccess ? '✅ 任务成功！' : '❌ 任务失败', cardWidth / 2, cardHeight - 80);

        // 日期
        ctx.font = '10px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText(new Date().toLocaleString('zh-CN'), cardWidth / 2, cardHeight - 55);

        // 好友码
        ctx.fillText(`好友码: ${this.getPlayerFriendCode()}`, cardWidth / 2, cardHeight - 38);

        // 底部
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = '9px sans-serif';
        ctx.fillText('🔥 消防灭火策略游戏 v4.0', cardWidth / 2, cardHeight - 22);

        const imageData = cardCanvas.toDataURL('image/png');
        this.shareCardData = imageData;

        // 保存分享历史
        this.shareHistory.push({
            imageData,
            timestamp: Date.now(),
            result: gameResult,
        });
        if (this.shareHistory.length > 20) this.shareHistory.shift();
        this.saveShareHistory();

        return imageData;
    }

    drawStatBlock(ctx, x, y, label, value, color) {
        ctx.save();
        ctx.textAlign = 'center';

        // 标签
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#95a5a6';
        ctx.fillText(label, x, y);

        // 数值
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(value, x, y + 25);

        ctx.restore();
    }

    shareToClipboard() {
        if (!this.shareCardData) return false;

        // 尝试复制到剪贴板
        if (navigator.clipboard) {
            // 将 base64 转为 Blob
            const byteString = atob(this.shareCardData.split(',')[1]);
            const mimeString = this.shareCardData.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });

            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
                console.log('战绩卡片已复制到剪贴板');
                return true;
            }).catch(() => {
                // 降级方案
                this.downloadShareCard();
                return false;
            });
        }

        return false;
    }

    downloadShareCard() {
        if (!this.shareCardData) return;

        const link = document.createElement('a');
        link.download = `firefighter_score_${Date.now()}.png`;
        link.href = this.shareCardData;
        link.click();
    }

    // ===== 社交 UI 渲染 =====
    renderSocialUI(ctx) {
        if (!this.showSocialUI) return;

        const canvas = ctx.canvas;
        const panelWidth = 400;
        const panelHeight = 500;
        const x = (canvas.width - panelWidth) / 2;
        const y = (canvas.height - panelHeight) / 2;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(x, y, panelWidth, panelHeight);

        // 边框
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, panelWidth, panelHeight);

        // 标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌐 社交中心', x + panelWidth / 2, y + 30);

        // 标签页
        this.renderTabs(ctx, x + 20, y + 45, panelWidth - 40);

        // 内容
        switch (this.activeTab) {
            case 'daily':
                this.renderDailyTab(ctx, x + 20, y + 85, panelWidth - 40, panelHeight - 120);
                break;
            case 'leaderboard':
                this.renderLeaderboardTab(ctx, x + 20, y + 85, panelWidth - 40, panelHeight - 120);
                break;
            case 'share':
                this.renderShareTab(ctx, x + 20, y + 85, panelWidth - 40, panelHeight - 120);
                break;
            case 'profile':
                this.renderProfileTab(ctx, x + 20, y + 85, panelWidth - 40, panelHeight - 120);
                break;
        }

        // 关闭按钮
        ctx.fillStyle = '#e74c3c';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✕', x + panelWidth - 20, y + 25);
    }

    renderTabs(ctx, x, y, width) {
        const tabs = [
            { id: 'daily', label: '📅 每日' },
            { id: 'leaderboard', label: '🏆 排行' },
            { id: 'share', label: '📤 分享' },
            { id: 'profile', label: '👤 我的' },
        ];

        const tabWidth = width / tabs.length;

        tabs.forEach((tab, i) => {
            const tabX = x + i * tabWidth;
            const isActive = this.activeTab === tab.id;

            ctx.fillStyle = isActive ? 'rgba(231, 76, 60, 0.3)' : 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(tabX, y, tabWidth, 30);

            if (isActive) {
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(tabX, y + 28, tabWidth, 2);
            }

            ctx.fillStyle = isActive ? '#fff' : '#95a5a6';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(tab.label, tabX + tabWidth / 2, y + 20);
        });
    }

    renderDailyTab(ctx, x, y, width, height) {
        const challenge = this.getDailyChallenge();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`📅 ${challenge.date} 每日挑战`, x + width / 2, y + 20);

        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#bdc3c7';
        ctx.textAlign = 'left';

        const config = challenge.config;
        const lines = [
            `🔥 火焰数量: ${config.fireCount}`,
            `🏘️ 建筑数量: ${config.buildingCount}`,
            `⏱️ 时间限制: ${config.timeLimit}秒`,
            `🌤️ 天气: ${this.getWeatherName(config.weatherType)}`,
            `💨 风力: ${'▮'.repeat(Math.ceil(config.windStrength * 5))}`,
            `📊 难度: ${'⭐'.repeat(config.difficulty)}`,
            `${config.hasBoss ? '👹 包含 Boss' : ''}`,
            `${config.hasMutation ? '☣️ 包含变异火焰' : ''}`,
        ].filter(l => l);

        lines.forEach((line, i) => {
            ctx.fillText(line, x + 10, y + 45 + i * 22);
        });

        // 全球统计
        const statsY = y + 45 + lines.length * 22 + 15;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🌍 全球数据', x + width / 2, statsY);

        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#95a5a6';
        const statsLines = [
            `总尝试次数: ${challenge.globalStats.totalAttempts.toLocaleString()}`,
            `通关人数: ${challenge.globalStats.completedCount.toLocaleString()}`,
            `平均得分: ${challenge.globalStats.averageScore}`,
            `最高分: ${challenge.globalStats.topScore}`,
        ];
        statsLines.forEach((line, i) => {
            ctx.fillText(line, x + 10, statsY + 20 + i * 18);
        });

        // 开始按钮
        if (!this.dailyChallengeCompleted) {
            const btnY = y + height - 40;
            ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
            ctx.fillRect(x + width / 2 - 60, btnY, 120, 30);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('开始挑战', x + width / 2, btnY + 20);
        } else {
            ctx.fillStyle = '#2ecc71';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✅ 今日已完成', x + width / 2, y + height - 20);
        }
    }

    renderLeaderboardTab(ctx, x, y, width, height) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 全球排行榜', x + width / 2, y + 20);

        const entries = this.leaderboard.slice(0, 10);
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';

        entries.forEach((entry, i) => {
            const entryY = y + 45 + i * 24;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

            ctx.fillStyle = i < 3 ? '#f1c40f' : '#ecf0f1';
            ctx.fillText(`${medal} ${entry.playerName}`, x + 10, entryY);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#e74c3c';
            ctx.fillText(`${entry.score}`, x + width - 10, entryY);
            ctx.textAlign = 'left';
        });

        // 好友排行切换
        const btnY = y + height - 40;
        ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.fillRect(x + width / 2 - 70, btnY, 140, 25);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👥 查看好友排行', x + width / 2, btnY + 17);
    }

    renderShareTab(ctx, x, y, width, height) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📤 分享战绩', x + width / 2, y + 20);

        // 生成按钮
        const btnY = y + 50;
        ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
        ctx.fillRect(x + width / 2 - 80, btnY, 160, 35);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('🎨 生成战绩卡片', x + width / 2, btnY + 22);

        // 分享卡片预览
        if (this.shareCardData) {
            ctx.fillStyle = '#2ecc71';
            ctx.font = '12px sans-serif';
            ctx.fillText('✅ 卡片已生成', x + width / 2, btnY + 55);

            // 操作按钮
            const ops = ['📋 复制', '💾 下载', '🔗 分享链接'];
            ops.forEach((op, i) => {
                const opX = x + 30 + i * 120;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(opX, btnY + 70, 100, 25);
                ctx.fillStyle = '#ecf0f1';
                ctx.font = '11px sans-serif';
                ctx.fillText(op, opX + 50, btnY + 87);
            });
        }

        // 好友码
        const codeY = y + height - 80;
        ctx.fillStyle = '#95a5a6';
        ctx.font = '12px sans-serif';
        ctx.fillText(`你的好友码: ${this.getPlayerFriendCode()}`, x + width / 2, codeY);

        // 添加好友
        ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.fillRect(x + width / 2 - 60, codeY + 15, 120, 25);
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText('+ 添加好友', x + width / 2, codeY + 32);
    }

    renderProfileTab(ctx, x, y, width, height) {
        const profile = this.playerProfile;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👤 个人资料', x + width / 2, y + 20);

        // 头像和名称
        ctx.font = '36px sans-serif';
        ctx.fillText(profile.avatar || '🧑‍🚒', x + width / 2, y + 65);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(profile.name || '消防员', x + width / 2, y + 90);

        // 好友码
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#95a5a6';
        ctx.fillText(`好友码: ${this.getPlayerFriendCode()}`, x + width / 2, y + 110);

        // 统计
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#bdc3c7';
        ctx.textAlign = 'left';

        const stats = [
            `🎮 总游戏次数: ${profile.totalGames || 0}`,
            `✅ 通关次数: ${profile.completedGames || 0}`,
            `🏆 最高分: ${profile.highScore || 0}`,
            `🧯 总灭火数: ${profile.totalFiresExtinguished || 0}`,
            `⏱️ 总游戏时间: ${this.formatTime((profile.totalPlayTime || 0) * 1000)}`,
            `📅 连续天数: ${profile.streakDays || 0} 天`,
            `👥 好友数: ${(profile.friends || []).length}`,
        ];

        stats.forEach((stat, i) => {
            ctx.fillText(stat, x + 20, y + 140 + i * 22);
        });
    }

    // ===== 点击处理 =====
    handleClick(mx, my) {
        if (!this.showSocialUI) return false;

        const canvas = this.game.canvas;
        const panelWidth = 400;
        const panelHeight = 500;
        const x = (canvas.width - panelWidth) / 2;
        const y = (canvas.height - panelHeight) / 2;

        // 关闭按钮
        if (mx > x + panelWidth - 35 && mx < x + panelWidth - 5 && my > y + 10 && my < y + 35) {
            this.showSocialUI = false;
            return true;
        }

        // 标签页
        if (my >= y + 45 && my <= y + 75) {
            const tabs = ['daily', 'leaderboard', 'share', 'profile'];
            const tabWidth = (panelWidth - 40) / tabs.length;
            const tabIndex = Math.floor((mx - (x + 20)) / tabWidth);
            if (tabIndex >= 0 && tabIndex < tabs.length) {
                this.activeTab = tabs[tabIndex];
                return true;
            }
        }

        return true; // 消费点击，防止穿透
    }

    // ===== 玩家资料 =====
    updateProfile(stats) {
        const profile = this.playerProfile;

        if (stats.played) profile.totalGames = (profile.totalGames || 0) + 1;
        if (stats.completed) profile.completedGames = (profile.completedGames || 0) + 1;
        if (stats.score > (profile.highScore || 0)) profile.highScore = stats.score;
        if (stats.firesExtinguished) profile.totalFiresExtinguished = (profile.totalFiresExtinguished || 0) + stats.firesExtinguished;
        if (stats.playTime) profile.totalPlayTime = (profile.totalPlayTime || 0) + stats.playTime;

        // 连续天数
        const today = this.getTodayString();
        if (profile.lastPlayDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);

            if (profile.lastPlayDate === yesterdayStr) {
                profile.streakDays = (profile.streakDays || 0) + 1;
            } else {
                profile.streakDays = 1;
            }
            profile.lastPlayDate = today;
        }

        this.savePlayerProfile();
    }

    setPlayerName(name) {
        this.playerProfile.name = name;
        this.savePlayerProfile();
    }

    setPlayerAvatar(avatar) {
        this.playerProfile.avatar = avatar;
        this.savePlayerProfile();
    }

    // ===== 存储 =====
    loadPlayerProfile() {
        try {
            const data = localStorage.getItem('firefighter_profile');
            return data ? JSON.parse(data) : this.createDefaultProfile();
        } catch {
            return this.createDefaultProfile();
        }
    }

    createDefaultProfile() {
        return {
            name: '消防员',
            avatar: '🧑‍🚒',
            friendCode: this.generateFriendCode(),
            totalGames: 0,
            completedGames: 0,
            highScore: 0,
            totalFiresExtinguished: 0,
            totalPlayTime: 0,
            streakDays: 0,
            lastPlayDate: null,
            friends: [],
            createdAt: Date.now(),
        };
    }

    savePlayerProfile() {
        try {
            localStorage.setItem('firefighter_profile', JSON.stringify(this.playerProfile));
        } catch {}
    }

    loadLeaderboard() {
        try {
            const data = localStorage.getItem('firefighter_leaderboard');
            return data ? JSON.parse(data) : this.generateDefaultLeaderboard();
        } catch {
            return this.generateDefaultLeaderboard();
        }
    }

    generateDefaultLeaderboard() {
        // 生成一些模拟数据
        const entries = [];
        const names = [
            '灭火英雄', '烈焰战士', '消防精英', '火焰克星', '救援先锋',
            '铁血消防', '逆行者', '水枪大师', '防火墙', '安全卫士',
            '烈火金刚', '消防侠客', '灭火达人', '急先锋', '守护者',
        ];
        const avatars = ['🧑‍🚒', '👨‍🚒', '👩‍🚒', '🦸', '🦹', '🧙', '🥷', '🤖', '👾', '🦊'];

        for (let i = 0; i < 15; i++) {
            entries.push({
                id: `default_${i}`,
                playerName: names[i],
                avatar: avatars[i % avatars.length],
                score: Math.floor(3000 - i * 150 + Math.random() * 100),
                level: Math.max(1, 15 - i),
                time: Math.floor(60 + Math.random() * 120) * 1000,
                firesExtinguished: Math.floor(20 - i + Math.random() * 5),
                date: Date.now() - Math.floor(Math.random() * 86400000 * 7),
                isFriend: false,
            });
        }

        entries.sort((a, b) => b.score - a.score);
        return entries;
    }

    saveLeaderboard() {
        try {
            localStorage.setItem('firefighter_leaderboard', JSON.stringify(this.leaderboard));
        } catch {}
    }

    loadFriendLeaderboard() {
        try {
            const data = localStorage.getItem('firefighter_friend_leaderboard');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    saveFriendLeaderboard() {
        try {
            localStorage.setItem('firefighter_friend_leaderboard', JSON.stringify(this.friendLeaderboard));
        } catch {}
    }

    loadShareHistory() {
        try {
            const data = localStorage.getItem('firefighter_share_history');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    saveShareHistory() {
        try {
            // 不保存图片数据到 localStorage，太大了
            const light = this.shareHistory.map(s => ({
                timestamp: s.timestamp,
                result: s.result,
            }));
            localStorage.setItem('firefighter_share_history', JSON.stringify(light));
        } catch {}
    }

    saveDailyChallengeResult(result) {
        try {
            localStorage.setItem('firefighter_daily_result', JSON.stringify(result));
        } catch {}
    }

    // ===== 工具方法 =====
    getTodayString() {
        return new Date().toISOString().slice(0, 10);
    }

    dateToSeed(dateStr) {
        let seed = 0;
        for (const char of dateStr) {
            seed = ((seed << 5) - seed) + char.charCodeAt(0);
            seed = seed & seed;
        }
        return Math.abs(seed);
    }

    seededRandom(seed) {
        let s = seed;
        return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    pickWeather(rng) {
        const types = ['sunny', 'cloudy', 'rainy', 'windy', 'storm'];
        return types[Math.floor(rng() * types.length)];
    }

    getWeatherName(type) {
        const names = {
            sunny: '☀️ 晴天',
            cloudy: '⛅ 多云',
            rainy: '🌧️ 雨天',
            windy: '💨 大风',
            storm: '⛈️ 暴风',
            snow: '❄️ 暴雪',
        };
        return names[type] || type;
    }

    calculateDifficulty(rng) {
        const val = rng();
        if (val > 0.7) return 4;
        if (val > 0.4) return 3;
        if (val > 0.15) return 2;
        return 1;
    }

    generateFakeGlobalStat(rng, min, max) {
        return Math.floor(min + rng() * (max - min));
    }

    randomAvatar() {
        const avatars = ['🧑‍🚒', '👨‍🚒', '👩‍🚒', '🦸', '🦹', '🧙', '🥷', '🤖', '👾', '🦊'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // ===== 主更新 =====
    update(dt) {
        // 社交系统不需要持续更新，按需渲染
    }

    render(ctx) {
        this.renderSocialUI(ctx);
    }
}
