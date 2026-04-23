// ==================== 游戏优化系统 ====================

class GameOptimizer {
    constructor(game) {
        this.game = game;
        this.performance = {
            fps: 60,
            frameTime: 0,
            updateTime: 0,
            renderTime: 0,
            particles: 0,
            objects: 0,
        };
        this.qualityLevel = 'high'; // low, medium, high
        this.adaptiveQuality = true;
        this.lastOptimizeTime = 0;
        this.optimizeInterval = 2000; // 每2秒优化一次
    }

    // 自适应质量调整
    adjustQuality() {
        if (!this.adaptiveQuality) return;

        const now = Date.now();
        if (now - this.lastOptimizeTime < this.optimizeInterval) return;
        this.lastOptimizeTime = now;

        // 根据FPS调整质量
        if (this.performance.fps < 30) {
            this.setQuality('low');
        } else if (this.performance.fps < 45) {
            this.setQuality('medium');
        } else {
            this.setQuality('high');
        }
    }

    // 设置质量等级
    setQuality(level) {
        if (this.qualityLevel === level) return;
        this.qualityLevel = level;

        switch (level) {
            case 'low':
                // 减少粒子数量
                if (this.game.particleSystem) {
                    this.game.particleSystem.maxParticles = 200;
                }
                // 降低火焰细节
                if (this.game.fireSystem) {
                    this.game.fireSystem.detailLevel = 1;
                }
                break;

            case 'medium':
                if (this.game.particleSystem) {
                    this.game.particleSystem.maxParticles = 400;
                }
                if (this.game.fireSystem) {
                    this.game.fireSystem.detailLevel = 2;
                }
                break;

            case 'high':
                if (this.game.particleSystem) {
                    this.game.particleSystem.maxParticles = 800;
                }
                if (this.game.fireSystem) {
                    this.game.fireSystem.detailLevel = 3;
                }
                break;
        }

        console.log(`🎨 质量调整为: ${level}`);
    }

    // 性能监控
    monitorPerformance(deltaTime) {
        this.performance.frameTime = deltaTime * 1000;
        this.performance.fps = Math.round(1000 / (deltaTime * 1000));
        
        if (this.game.particleSystem) {
            this.performance.particles = this.game.particleSystem.particleCount || 0;
        }
        
        this.performance.objects = 
            (this.game.buildings?.length || 0) +
            (this.game.fires?.length || 0) +
            (this.game.waterDroplets?.length || 0);
    }

    // 获取性能报告
    getPerformanceReport() {
        return {
            ...this.performance,
            quality: this.qualityLevel,
            recommendation: this.getRecommendation(),
        };
    }

    // 获取优化建议
    getRecommendation() {
        if (this.performance.fps < 30) {
            return '建议降低画质或关闭部分特效';
        } else if (this.performance.particles > 500) {
            return '粒子数量较多，可能影响性能';
        }
        return '性能良好';
    }

    // 渲染性能面板（调试用）
    renderPerformancePanel(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 100);

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        const report = this.getPerformanceReport();
        ctx.fillText(`FPS: ${report.fps}`, 20, 30);
        ctx.fillText(`质量: ${report.quality}`, 20, 50);
        ctx.fillText(`粒子: ${report.particles}`, 20, 70);
        ctx.fillText(`对象: ${report.objects}`, 20, 90);

        ctx.restore();
    }
}

// ==================== 智能提示系统 ====================

class HintSystem {
    constructor(game) {
        this.game = game;
        this.hints = [];
        this.activeHints = [];
        this.hintQueue = [];
        this.hintDelay = 3000; // 提示显示时间
        this.lastHintTime = 0;
        this.hintsEnabled = true;
        this.tutorialComplete = this.loadTutorialState();
    }

    // 加载教程状态
    loadTutorialState() {
        const saved = localStorage.getItem('firefighter_tutorial');
        return saved ? JSON.parse(saved) : {
            basicControls: false,
            facilityPlacement: false,
            rescueSystem: false,
            specialEvents: false,
            vehicleSkills: false,
            upgrades: false,
        };
    }

    // 保存教程状态
    saveTutorialState() {
        localStorage.setItem('firefighter_tutorial', JSON.stringify(this.tutorialComplete));
    }

    // 初始化提示库
    initHints() {
        this.hints = [
            // 基础操作提示
            {
                id: 'basic_controls',
                condition: () => !this.tutorialComplete.basicControls && this.game.state === 'battle',
                message: '💡 使用 ↑↓ 调整角度，←→ 调整力度，空格发射水柱',
                priority: 10,
                tutorial: 'basicControls',
            },
            {
                id: 'water_management',
                condition: () => this.game.water < 200 && this.game.state === 'battle',
                message: '💧 水量不足！注意节约用水或放置消防栓',
                priority: 8,
            },
            {
                id: 'time_warning',
                condition: () => this.game.time < 10 && this.game.state === 'battle',
                message: '⏰ 时间紧迫！加快灭火速度！',
                priority: 9,
            },

            // 设施提示
            {
                id: 'facility_hydrant',
                condition: () => !this.tutorialComplete.facilityPlacement && this.game.state === 'prepare',
                message: '💧 消防栓可以自动回水，建议放置在火源附近',
                priority: 7,
                tutorial: 'facilityPlacement',
            },
            {
                id: 'facility_firewall',
                condition: () => this.game.buildings?.filter(b => b.state === 'burning').length > 3,
                message: '🧱 火势较大！考虑使用防火墙阻止蔓延',
                priority: 6,
            },
            {
                id: 'facility_fighter',
                condition: () => this.game.buildings?.some(b => b.state === 'burning' && b.fireIntensity > 3),
                message: '👨‍🚒 高强度火焰！放置消防员可自动灭火',
                priority: 7,
            },

            // 救援提示
            {
                id: 'rescue_available',
                condition: () => this.game.rescueSystem?.survivors?.some(s => s.state === 'trapped'),
                message: '🆘 有幸存者被困！优先救援建筑',
                priority: 9,
                tutorial: 'rescueSystem',
            },
            {
                id: 'rescue_health_low',
                condition: () => this.game.rescueSystem?.survivors?.some(s => s.health < 30),
                message: '⚠️ 幸存者生命垂危！立即救援！',
                priority: 10,
            },

            // 特殊事件提示
            {
                id: 'explosive_nearby',
                condition: () => this.game.specialEventSystem?.events?.some(e => 
                    e.type === 'explosiveBarrel' && e.timer > 3000
                ),
                message: '💣 爆炸桶即将爆炸！立即扑灭周围火焰！',
                priority: 10,
                tutorial: 'specialEvents',
            },
            {
                id: 'chemical_leak',
                condition: () => this.game.specialEventSystem?.activeEffects?.some(e => e.type === 'toxic_cloud'),
                message: '☣️ 有毒云团扩散！远离该区域！',
                priority: 9,
            },
            {
                id: 'powerup_available',
                condition: () => this.game.specialEventSystem?.events?.some(e => 
                    e.config.type === 'bonus' && e.state === 'active'
                ),
                message: '📦 发现奖励道具！用水击破获得奖励',
                priority: 6,
            },

            // 车辆技能提示
            {
                id: 'vehicle_skill_ready',
                condition: () => {
                    const vehicle = this.game.vehicleSystem?.getCurrentVehicle();
                    return vehicle?.special && !vehicle.special.active && this.game.state === 'battle';
                },
                message: '⚡ 车辆技能就绪！按 [S] 激活',
                priority: 5,
                tutorial: 'vehicleSkills',
            },

            // 升级提示
            {
                id: 'upgrade_available',
                condition: () => this.game.upgradeSystem?.canUpgrade('waterGun'),
                message: '⬆️ 有可用升级！前往升级中心提升能力',
                priority: 4,
                tutorial: 'upgrades',
            },
            {
                id: 'coins_available',
                condition: () => (this.game.upgradeSystem?.coins || 0) > 500,
                message: '💰 金币充足！可以解锁新车辆或升级装备',
                priority: 4,
            },

            // 策略提示
            {
                id: 'wind_strategy',
                condition: () => this.game.wind > 3 && this.game.state === 'battle',
                message: '🌬️ 风力较大！调整角度补偿风向影响',
                priority: 5,
            },
            {
                id: 'building_priority',
                condition: () => this.game.buildings?.filter(b => 
                    b.state === 'burning' && b.fireResistance < 0.6
                ).length > 0,
                message: '🏠 优先保护耐火性差的木屋！',
                priority: 6,
            },
        ];
    }

    // 更新提示
    update() {
        if (!this.hintsEnabled) return;

        const now = Date.now();
        
        // 移除过期的提示
        this.activeHints = this.activeHints.filter(hint => 
            now - hint.showTime < this.hintDelay
        );

        // 检查新提示
        this.hints.forEach(hint => {
            if (hint.condition() && !this.activeHints.find(h => h.id === hint.id)) {
                this.showHint(hint);
            }
        });

        // 自适应提示频率
        if (this.activeHints.length === 0 && this.hintQueue.length > 0) {
            const nextHint = this.hintQueue.shift();
            this.displayHint(nextHint);
        }
    }

    // 显示提示
    showHint(hint) {
        // 标记教程为完成
        if (hint.tutorial) {
            this.tutorialComplete[hint.tutorial] = true;
            this.saveTutorialState();
        }

        // 添加到队列
        this.hintQueue.push(hint);
    }

    // 显示提示（实际渲染）
    displayHint(hint) {
        this.activeHints.push({
            ...hint,
            showTime: Date.now(),
        });

        // 显示游戏内消息
        if (this.game.showMessage) {
            this.game.showMessage(hint.message, this.hintDelay);
        }
    }

    // 渲染提示面板
    render(ctx) {
        if (this.activeHints.length === 0) return;

        ctx.save();
        
        const panelHeight = 40;
        const startY = this.game.canvas.height - panelHeight - 80;

        this.activeHints.forEach((hint, index) => {
            const y = startY + (index * 45);
            const alpha = Math.min(1, (Date.now() - hint.showTime) / 500);

            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(52, 152, 219, 0.9)';
            ctx.fillRect(10, y, this.game.canvas.width - 20, 40);

            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(hint.message, this.game.canvas.width / 2, y + 25);
        });

        ctx.restore();
    }

    // 切换提示开关
    toggle() {
        this.hintsEnabled = !this.hintsEnabled;
        return this.hintsEnabled;
    }

    // 重置教程
    resetTutorial() {
        this.tutorialComplete = {
            basicControls: false,
            facilityPlacement: false,
            rescueSystem: false,
            specialEvents: false,
            vehicleSkills: false,
            upgrades: false,
        };
        this.saveTutorialState();
    }
}

// ==================== 自动存档系统 ====================

class AutoSaveSystem {
    constructor(game) {
        this.game = game;
        this.autoSaveInterval = 30000; // 30秒自动存档
        this.lastSaveTime = 0;
        this.saveSlots = 3;
        this.currentSlot = 0;
    }

    // 自动存档
    autoSave() {
        const now = Date.now();
        if (now - this.lastSaveTime < this.autoSaveInterval) return;

        this.save(this.currentSlot);
        this.lastSaveTime = now;
    }

    // 存档
    save(slot) {
        const saveData = {
            timestamp: Date.now(),
            level: this.game.currentLevel,
            score: this.game.score,
            stats: this.game.stats,
            upgrades: this.game.upgradeSystem?.upgrades,
            coins: this.game.upgradeSystem?.coins,
            vehicle: this.game.vehicleSystem?.currentVehicle,
            achievements: this.game.achievementSystem?.unlockedAchievements,
        };

        localStorage.setItem(`firefighter_save_${slot}`, JSON.stringify(saveData));
        console.log(`💾 游戏已存档 (槽位 ${slot})`);
    }

    // 读档
    load(slot) {
        const saved = localStorage.getItem(`firefighter_save_${slot}`);
        if (!saved) return false;

        try {
            const saveData = JSON.parse(saved);
            
            // 恢复数据
            if (this.game.upgradeSystem && saveData.upgrades) {
                this.game.upgradeSystem.upgrades = saveData.upgrades;
                this.game.upgradeSystem.coins = saveData.coins || 0;
                this.game.upgradeSystem.saveUpgrades();
                this.game.upgradeSystem.saveCoins();
            }

            if (this.game.vehicleSystem && saveData.vehicle) {
                this.game.vehicleSystem.currentVehicle = saveData.vehicle;
                this.game.vehicleSystem.saveCurrentVehicle();
            }

            if (this.game.achievementSystem && saveData.achievements) {
                this.game.achievementSystem.unlockedAchievements = saveData.achievements;
            }

            console.log(`📂 存档已加载 (槽位 ${slot})`);
            return true;
        } catch (error) {
            console.error('存档加载失败:', error);
            return false;
        }
    }

    // 获取存档信息
    getSaveInfo(slot) {
        const saved = localStorage.getItem(`firefighter_save_${slot}`);
        if (!saved) return null;

        try {
            const saveData = JSON.parse(saved);
            return {
                timestamp: saveData.timestamp,
                level: saveData.level,
                score: saveData.score,
                date: new Date(saveData.timestamp).toLocaleString(),
            };
        } catch (error) {
            return null;
        }
    }

    // 删除存档
    deleteSave(slot) {
        localStorage.removeItem(`firefighter_save_${slot}`);
        console.log(`🗑️ 存档已删除 (槽位 ${slot})`);
    }
}

// ==================== 游戏平衡系统 ====================

class BalanceSystem {
    constructor(game) {
        this.game = game;
        this.difficulty = 'normal'; // easy, normal, hard
        this.difficultyModifiers = this.getDifficultyModifiers();
    }

    // 获取难度修正值
    getDifficultyModifiers() {
        return {
            easy: {
                fireSpreadRate: 0.5,
                waterConsumption: 0.7,
                scoreMultiplier: 0.8,
                coinMultiplier: 0.8,
                timeBonus: 1.2,
                rescueTime: 0.7,
            },
            normal: {
                fireSpreadRate: 1.0,
                waterConsumption: 1.0,
                scoreMultiplier: 1.0,
                coinMultiplier: 1.0,
                timeBonus: 1.0,
                rescueTime: 1.0,
            },
            hard: {
                fireSpreadRate: 1.5,
                waterConsumption: 1.3,
                scoreMultiplier: 1.5,
                coinMultiplier: 1.5,
                timeBonus: 0.8,
                rescueTime: 1.3,
            },
        };
    }

    // 设置难度
    setDifficulty(difficulty) {
        if (this.difficultyModifiers[difficulty]) {
            this.difficulty = difficulty;
            this.applyDifficulty();
            console.log(`🎮 难度设置为: ${difficulty}`);
        }
    }

    // 应用难度
    applyDifficulty() {
        const modifiers = this.difficultyModifiers[this.difficulty];

        // 应用火焰蔓延速度
        if (this.game.fireSystem) {
            this.game.fireSystem.spreadMultiplier = modifiers.fireSpreadRate;
        }

        // 应用水消耗
        if (this.game.waterSystem) {
            this.game.waterSystem.consumptionMultiplier = modifiers.waterConsumption;
        }

        // 应用救援时间
        if (this.game.rescueSystem) {
            this.game.rescueSystem.timeMultiplier = modifiers.rescueTime;
        }
    }

    // 获取修正后的分数
    getModifiedScore(baseScore) {
        return Math.round(baseScore * this.difficultyModifiers[this.difficulty].scoreMultiplier);
    }

    // 获取修正后的金币
    getModifiedCoins(baseCoins) {
        return Math.round(baseCoins * this.difficultyModifiers[this.difficulty].coinMultiplier);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameOptimizer, HintSystem, AutoSaveSystem, BalanceSystem };
}
