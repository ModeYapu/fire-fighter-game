// ==================== 设置系统 ====================

class SettingsSystem {
    constructor(game) {
        this.game = game;
        this.settings = this.loadSettings();
        this.defaultSettings = {
            // 音频设置
            masterVolume: 0.7,
            musicVolume: 0.5,
            sfxVolume: 0.8,
            musicEnabled: true,
            sfxEnabled: true,

            // 画面设置
            quality: 'high', // low, medium, high
            fullscreen: false,
            showFPS: false,
            particlesQuality: 'high',
            screenShake: true,
            flashEffects: true,

            // 游戏设置
            difficulty: 'normal', // easy, normal, hard
            hintsEnabled: true,
            autoSave: true,
            tutorialComplete: false,
            
            // 控制设置
            controls: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                fire: ' ',
                skill: 'KeyS',
                pause: 'Escape',
            },

            // 辅助功能
            colorBlindMode: false,
            largeText: false,
            reducedMotion: false,
        };
    }

    // 加载设置
    loadSettings() {
        const saved = localStorage.getItem('firefighter_settings');
        return saved ? { ...this.defaultSettings, ...JSON.parse(saved) } : { ...this.defaultSettings };
    }

    // 保存设置
    saveSettings() {
        localStorage.setItem('firefighter_settings', JSON.stringify(this.settings));
    }

    // 重置为默认设置
    resetToDefault() {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applySettings();
    }

    // 应用设置
    applySettings() {
        // 应用音频设置
        if (this.game.audio) {
            this.game.audio.setMasterVolume(this.settings.masterVolume);
            this.game.audio.setMusicVolume(this.settings.musicVolume);
            this.game.audio.setSFXVolume(this.settings.sfxVolume);
            this.game.audio.musicEnabled = this.settings.musicEnabled;
            this.game.audio.sfxEnabled = this.settings.sfxEnabled;
        }

        // 应用画面设置
        if (this.game.optimizer) {
            this.game.optimizer.setQuality(this.settings.quality);
            this.game.optimizer.adaptiveQuality = this.settings.quality === 'auto';
        }

        // 应用游戏设置
        if (this.game.balanceSystem) {
            this.game.balanceSystem.setDifficulty(this.settings.difficulty);
        }

        if (this.game.hintSystem) {
            this.game.hintSystem.hintsEnabled = this.settings.hintsEnabled;
        }

        // 应用辅助功能
        if (this.settings.colorBlindMode) {
            document.body.classList.add('color-blind-mode');
        } else {
            document.body.classList.remove('color-blind-mode');
        }

        if (this.settings.largeText) {
            document.body.classList.add('large-text');
        } else {
            document.body.classList.remove('large-text');
        }
    }

    // 更新设置
    updateSetting(key, value) {
        const keys = key.split('.');
        if (keys.length === 2) {
            this.settings[keys[0]][keys[1]] = value;
        } else {
            this.settings[key] = value;
        }
        this.saveSettings();
        this.applySettings();
    }

    // 获取设置
    getSetting(key) {
        const keys = key.split('.');
        if (keys.length === 2) {
            return this.settings[keys[0]][keys[1]];
        }
        return this.settings[key];
    }

    // 渲染设置UI
    renderSettingsUI(container) {
        container.innerHTML = '';

        // 音频设置
        this.createSection(container, '音频设置', [
            { key: 'masterVolume', label: '主音量', type: 'slider', min: 0, max: 1, step: 0.1 },
            { key: 'musicVolume', label: '音乐音量', type: 'slider', min: 0, max: 1, step: 0.1 },
            { key: 'sfxVolume', label: '音效音量', type: 'slider', min: 0, max: 1, step: 0.1 },
            { key: 'musicEnabled', label: '启用音乐', type: 'toggle' },
            { key: 'sfxEnabled', label: '启用音效', type: 'toggle' },
        ]);

        // 画面设置
        this.createSection(container, '画面设置', [
            { key: 'quality', label: '画质', type: 'select', options: ['low', 'medium', 'high', 'auto'] },
            { key: 'fullscreen', label: '全屏', type: 'toggle' },
            { key: 'showFPS', label: '显示FPS', type: 'toggle' },
            { key: 'screenShake', label: '屏幕震动', type: 'toggle' },
            { key: 'flashEffects', label: '闪光效果', type: 'toggle' },
        ]);

        // 游戏设置
        this.createSection(container, '游戏设置', [
            { key: 'difficulty', label: '难度', type: 'select', options: ['easy', 'normal', 'hard'] },
            { key: 'hintsEnabled', label: '显示提示', type: 'toggle' },
            { key: 'autoSave', label: '自动存档', type: 'toggle' },
        ]);

        // 辅助功能
        this.createSection(container, '辅助功能', [
            { key: 'colorBlindMode', label: '色盲模式', type: 'toggle' },
            { key: 'largeText', label: '大字体', type: 'toggle' },
            { key: 'reducedMotion', label: '减少动画', type: 'toggle' },
        ]);

        // 重置按钮
        const resetBtn = document.createElement('button');
        resetBtn.className = 'settings-btn reset-btn';
        resetBtn.textContent = '重置为默认';
        resetBtn.addEventListener('click', () => {
            this.resetToDefault();
            this.renderSettingsUI(container);
            this.game.showMessage('设置已重置', 2000);
        });
        container.appendChild(resetBtn);
    }

    // 创建设置区块
    createSection(container, title, items) {
        const section = document.createElement('div');
        section.className = 'settings-section';

        const titleEl = document.createElement('h3');
        titleEl.className = 'settings-title';
        titleEl.textContent = title;
        section.appendChild(titleEl);

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'settings-row';

            const label = document.createElement('label');
            label.className = 'settings-label';
            label.textContent = item.label;
            row.appendChild(label);

            const control = this.createControl(item);
            row.appendChild(control);

            section.appendChild(row);
        });

        container.appendChild(section);
    }

    // 创建控制器
    createControl(item) {
        switch (item.type) {
            case 'slider':
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = item.min;
                slider.max = item.max;
                slider.step = item.step;
                slider.value = this.getSetting(item.key);
                slider.className = 'settings-slider';
                
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'settings-value';
                valueDisplay.textContent = Math.round(this.getSetting(item.key) * 100) + '%';
                
                slider.addEventListener('input', (e) => {
                    this.updateSetting(item.key, parseFloat(e.target.value));
                    valueDisplay.textContent = Math.round(e.target.value * 100) + '%';
                });
                
                const container = document.createElement('div');
                container.className = 'slider-container';
                container.appendChild(slider);
                container.appendChild(valueDisplay);
                return container;

            case 'toggle':
                const toggle = document.createElement('label');
                toggle.className = 'toggle-switch';
                
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = this.getSetting(item.key);
                
                const slider_span = document.createElement('span');
                slider_span.className = 'toggle-slider';
                
                input.addEventListener('change', (e) => {
                    this.updateSetting(item.key, e.target.checked);
                });
                
                toggle.appendChild(input);
                toggle.appendChild(slider_span);
                return toggle;

            case 'select':
                const select = document.createElement('select');
                select.className = 'settings-select';
                
                item.options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option;
                    opt.textContent = this.getOptionLabel(option);
                    select.appendChild(opt);
                });
                
                select.value = this.getSetting(item.key);
                select.addEventListener('change', (e) => {
                    this.updateSetting(item.key, e.target.value);
                });
                
                return select;

            default:
                return document.createElement('div');
        }
    }

    // 获取选项标签
    getOptionLabel(option) {
        const labels = {
            low: '低',
            medium: '中',
            high: '高',
            auto: '自动',
            easy: '简单',
            normal: '普通',
            hard: '困难',
        };
        return labels[option] || option;
    }
}

// ==================== 每日挑战系统 ====================

class DailyChallengeSystem {
    constructor(game) {
        this.game = game;
        this.todayChallenge = null;
        this.lastUpdateDate = null;
        this.challengeHistory = [];
    }

    // 生成每日挑战
    generateDailyChallenge() {
        const today = new Date().toDateString();
        
        // 检查是否需要更新
        if (this.lastUpdateDate === today && this.todayChallenge) {
            return this.todayChallenge;
        }

        // 基于日期生成固定的挑战
        const seed = this.hashCode(today);
        const random = this.seededRandom(seed);

        const challenges = [
            {
                type: 'speed',
                name: '速度挑战',
                description: '30秒内完成关卡',
                target: 30,
                reward: { coins: 200, score: 1000 },
                icon: '⚡',
            },
            {
                type: 'water',
                name: '节水挑战',
                description: '用水量不超过500',
                target: 500,
                reward: { coins: 150, score: 800 },
                icon: '💧',
            },
            {
                type: 'rescue',
                name: '救援挑战',
                description: '救援至少3名幸存者',
                target: 3,
                reward: { coins: 250, score: 1200 },
                icon: '🆘',
            },
            {
                type: 'perfect',
                name: '完美挑战',
                description: '不损失任何建筑',
                target: 0,
                reward: { coins: 300, score: 1500 },
                icon: '⭐',
            },
            {
                type: 'accuracy',
                name: '精准挑战',
                description: '命中率达到85%',
                target: 0.85,
                reward: { coins: 180, score: 900 },
                icon: '🎯',
            },
        ];

        // 随机选择挑战
        const challengeIndex = Math.floor(random() * challenges.length);
        const levelIndex = Math.floor(random() * 5) + 1;

        this.todayChallenge = {
            ...challenges[challengeIndex],
            level: levelIndex,
            date: today,
            completed: false,
            progress: 0,
        };

        this.lastUpdateDate = today;
        this.saveDailyChallenge();

        return this.todayChallenge;
    }

    // 检查挑战完成
    checkChallengeCompletion(stats) {
        if (!this.todayChallenge || this.todayChallenge.completed) return false;

        let completed = false;
        let progress = 0;

        switch (this.todayChallenge.type) {
            case 'speed':
                progress = stats.time;
                completed = stats.time <= this.todayChallenge.target;
                break;
            case 'water':
                progress = stats.waterUsed;
                completed = stats.waterUsed <= this.todayChallenge.target;
                break;
            case 'rescue':
                progress = stats.rescued;
                completed = stats.rescued >= this.todayChallenge.target;
                break;
            case 'perfect':
                progress = stats.buildingsLost;
                completed = stats.buildingsLost === this.todayChallenge.target;
                break;
            case 'accuracy':
                progress = stats.accuracy;
                completed = stats.accuracy >= this.todayChallenge.target;
                break;
        }

        this.todayChallenge.progress = progress;

        if (completed) {
            this.todayChallenge.completed = true;
            this.challengeHistory.push({
                ...this.todayChallenge,
                completedAt: Date.now(),
            });
            this.saveDailyChallenge();
            this.grantReward();
            return true;
        }

        return false;
    }

    // 发放奖励
    grantReward() {
        const reward = this.todayChallenge.reward;
        
        if (this.game.upgradeSystem) {
            this.game.upgradeSystem.addCoins(reward.coins);
        }
        
        if (this.game.addScore) {
            this.game.addScore(reward.score);
        }

        this.game.showMessage(
            `🎉 每日挑战完成！获得 ${reward.coins} 金币，${reward.score} 分`,
            3000
        );

        if (this.game.audio) {
            this.game.audio.play('victory');
        }
    }

    // 保存每日挑战
    saveDailyChallenge() {
        localStorage.setItem('firefighter_daily_challenge', JSON.stringify({
            todayChallenge: this.todayChallenge,
            lastUpdateDate: this.lastUpdateDate,
            challengeHistory: this.challengeHistory,
        }));
    }

    // 加载每日挑战
    loadDailyChallenge() {
        const saved = localStorage.getItem('firefighter_daily_challenge');
        if (saved) {
            const data = JSON.parse(saved);
            this.todayChallenge = data.todayChallenge;
            this.lastUpdateDate = data.lastUpdateDate;
            this.challengeHistory = data.challengeHistory || [];
        }
    }

    // 哈希函数
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    // 种子随机数
    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    // 获取挑战进度
    getChallengeProgress() {
        if (!this.todayChallenge) return null;
        return {
            challenge: this.todayChallenge,
            progressText: this.getProgressText(),
            completed: this.todayChallenge.completed,
        };
    }

    // 获取进度文本
    getProgressText() {
        if (!this.todayChallenge) return '';
        
        const challenge = this.todayChallenge;
        switch (challenge.type) {
            case 'speed':
                return `用时: ${challenge.progress}秒 / 目标: ${challenge.target}秒`;
            case 'water':
                return `用水: ${challenge.progress} / 限制: ${challenge.target}`;
            case 'rescue':
                return `救援: ${challenge.progress}人 / 目标: ${challenge.target}人`;
            case 'perfect':
                return `损失建筑: ${challenge.progress} / 目标: ${challenge.target}`;
            case 'accuracy':
                return `命中率: ${Math.round(challenge.progress * 100)}% / 目标: ${Math.round(challenge.target * 100)}%`;
            default:
                return '';
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsSystem, DailyChallengeSystem };
}
