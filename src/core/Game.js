/**
 * Game - 游戏主类（集成版本 v1.3.0）
 * 整合所有系统，管理游戏循环和状态
 */
import { GAME_CONFIG, GAME_STATE, LEVEL_DATA, RESOURCE_CONFIG } from '../utils/constants.js';
import { BuildingSystem } from './Building.js';
import { FireSystem } from './Fire.js';
import { WaterSystem } from './Water.js';
import { ParticleSystem } from './ParticleSystem.js';
import { BackgroundSystem } from './BackgroundSystem.js';
import { PhysicsEngine } from '../systems/PhysicsEngine.js';
import { InputManager } from '../systems/InputManager.js';
import { UIManager } from '../systems/UIManager.js';

// 导入新系统（从js目录）
// 注意：由于模块路径问题，这些系统将通过全局变量访问
// 在实际运行时，这些系统已经在全局作用域中可用

export class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.state = GAME_STATE.MENU;
        this.currentLevel = 0;
        this.score = 0;
        this.water = RESOURCE_CONFIG.INITIAL_WATER;
        this.time = 0;
        this.buildings = [];
        this.fires = [];
        this.waterDroplets = [];
        this.particles = null;

        // 策略系统
        this.prepareTime = GAME_CONFIG.PREPARE_TIME;
        this.selectedFacility = null;
        this.facilities = [];

        // 基础系统组件
        this.buildingSystem = new BuildingSystem();
        this.fireSystem = new FireSystem();
        this.waterSystem = new WaterSystem();
        this.particleSystem = new ParticleSystem();
        this.backgroundSystem = new BackgroundSystem();
        this.physicsEngine = new PhysicsEngine();
        this.inputManager = new InputManager();
        this.ui = new UIManager();

        // 🔥 新系统（通过全局变量访问）
        this.rescueSystem = null;
        this.upgradeSystem = null;
        this.specialEventSystem = null;
        this.vehicleSystem = null;
        this.optimizer = null;
        this.hintSystem = null;
        this.autoSaveSystem = null;
        this.balanceSystem = null;
        this.enhancedAudio = null;
        this.visualEffects = null;
        this.settingsSystem = null;
        this.dailyChallenge = null;
        this.extendedFacilitySystem = null;

        // 帧率独立计时
        this.lastTime = 0;

        // 共享引用
        this.buildings = this.buildingSystem.buildings;
        this.fires = this.fireSystem.fires;
        this.waterDroplets = this.waterSystem.droplets;
        this.particles = this.particleSystem;

        // 统计数据
        this.stats = {
            shotsFired: 0,
            shotsHit: 0,
            waterUsed: 0,
            firesExtinguished: 0,
            buildingsLost: 0,
            rescued: 0,
            accuracy: 0,
        };
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 初始化基础系统
        this.ui.init(this);
        this.inputManager.init(this);

        // 🚀 初始化新系统
        this.initNewSystems();

        // 绑定新系统UI事件
        this.bindNewSystemEvents();

        // 启动游戏循环
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    // 🚀 初始化所有新系统
    initNewSystems() {
        try {
            // 检查全局系统是否可用
            if (typeof RescueSystem !== 'undefined') {
                this.rescueSystem = new RescueSystem(this);
                console.log('✅ 救援系统已初始化');
            }

            if (typeof UpgradeSystem !== 'undefined') {
                this.upgradeSystem = new UpgradeSystem(this);
                console.log('✅ 升级系统已初始化');
            }

            if (typeof SpecialEventSystem !== 'undefined') {
                this.specialEventSystem = new SpecialEventSystem(this);
                console.log('✅ 特殊事件系统已初始化');
            }

            if (typeof VehicleSystem !== 'undefined') {
                this.vehicleSystem = new VehicleSystem(this);
                console.log('✅ 车辆系统已初始化');
            }

            if (typeof GameOptimizer !== 'undefined') {
                this.optimizer = new GameOptimizer(this);
                console.log('✅ 性能优化器已初始化');
            }

            if (typeof HintSystem !== 'undefined') {
                this.hintSystem = new HintSystem(this);
                this.hintSystem.initHints();
                console.log('✅ 提示系统已初始化');
            }

            if (typeof AutoSaveSystem !== 'undefined') {
                this.autoSaveSystem = new AutoSaveSystem(this);
                console.log('✅ 自动存档系统已初始化');
            }

            if (typeof BalanceSystem !== 'undefined') {
                this.balanceSystem = new BalanceSystem(this);
                console.log('✅ 平衡系统已初始化');
            }

            if (typeof EnhancedAudioSystem !== 'undefined') {
                this.enhancedAudio = new EnhancedAudioSystem();
                this.enhancedAudio.init();
                console.log('✅ 增强音效系统已初始化');
            }

            if (typeof VisualEffectsSystem !== 'undefined') {
                this.visualEffects = new VisualEffectsSystem(this);
                console.log('✅ 视觉效果系统已初始化');
            }

            if (typeof SettingsSystem !== 'undefined') {
                this.settingsSystem = new SettingsSystem(this);
                this.settingsSystem.loadSettings();
                this.settingsSystem.applySettings();
                console.log('✅ 设置系统已初始化');
            }

            if (typeof DailyChallengeSystem !== 'undefined') {
                this.dailyChallenge = new DailyChallengeSystem(this);
                this.dailyChallenge.loadDailyChallenge();
                this.dailyChallenge.generateDailyChallenge();
                console.log('✅ 每日挑战系统已初始化');
            }

            if (typeof ExtendedFacilitySystem !== 'undefined') {
                this.extendedFacilitySystem = new ExtendedFacilitySystem();
                console.log('✅ 扩展设施系统已初始化');
            }

            // 应用所有升级和车辆属性
            this.upgradeSystem?.applyAllUpgrades();
            this.vehicleSystem?.applyVehicleStats();

            console.log('🎉 所有新系统初始化完成');
        } catch (error) {
            console.error('❌ 系统初始化失败:', error);
        }
    }

    // 绑定新系统UI事件
    bindNewSystemEvents() {
        // 升级中心按钮
        const upgradeBtn = document.getElementById('btn-upgrade');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                const upgradeMenu = document.getElementById('upgrade-menu');
                const upgradeList = document.getElementById('upgrade-list');
                const mainMenu = document.getElementById('main-menu');

                if (upgradeMenu && upgradeList && this.upgradeSystem) {
                    mainMenu.style.display = 'none';
                    upgradeMenu.style.display = 'flex';
                    this.upgradeSystem.renderShopUI(upgradeList);
                }
            });
        }

        // 返回按钮
        const backUpgradeBtn = document.getElementById('btn-back-upgrade');
        if (backUpgradeBtn) {
            backUpgradeBtn.addEventListener('click', () => {
                document.getElementById('upgrade-menu').style.display = 'none';
                document.getElementById('main-menu').style.display = 'flex';
            });
        }

        // 消防车库按钮
        const vehicleBtn = document.getElementById('btn-vehicle');
        if (vehicleBtn) {
            vehicleBtn.addEventListener('click', () => {
                const vehicleMenu = document.getElementById('vehicle-menu');
                const vehicleList = document.getElementById('vehicle-list');
                const mainMenu = document.getElementById('main-menu');

                if (vehicleMenu && vehicleList && this.vehicleSystem) {
                    mainMenu.style.display = 'none';
                    vehicleMenu.style.display = 'flex';
                    this.vehicleSystem.renderGarageUI(vehicleList);
                }
            });
        }

        const backVehicleBtn = document.getElementById('btn-back-vehicle');
        if (backVehicleBtn) {
            backVehicleBtn.addEventListener('click', () => {
                document.getElementById('vehicle-menu').style.display = 'none';
                document.getElementById('main-menu').style.display = 'flex';
            });
        }

        // 设置按钮
        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                const settingsMenu = document.getElementById('settings-menu');
                const settingsList = document.getElementById('settings-list');
                const mainMenu = document.getElementById('main-menu');

                if (settingsMenu && settingsList && this.settingsSystem) {
                    mainMenu.style.display = 'none';
                    settingsMenu.style.display = 'flex';
                    this.settingsSystem.renderSettingsUI(settingsList);
                }
            });
        }

        const backSettingsBtn = document.getElementById('btn-back-settings');
        if (backSettingsBtn) {
            backSettingsBtn.addEventListener('click', () => {
                document.getElementById('settings-menu').style.display = 'none';
                document.getElementById('main-menu').style.display = 'flex';
            });
        }

        // 每日挑战按钮
        const dailyBtn = document.getElementById('btn-daily');
        if (dailyBtn) {
            dailyBtn.addEventListener('click', () => {
                const dailyMenu = document.getElementById('daily-menu');
                const dailyContent = document.getElementById('daily-content');
                const mainMenu = document.getElementById('main-menu');

                if (dailyMenu && dailyContent && this.dailyChallenge) {
                    mainMenu.style.display = 'none';
                    dailyMenu.style.display = 'flex';
                    this.renderDailyChallengeUI(dailyContent);
                }
            });
        }

        const backDailyBtn = document.getElementById('btn-back-daily');
        if (backDailyBtn) {
            backDailyBtn.addEventListener('click', () => {
                document.getElementById('daily-menu').style.display = 'none';
                document.getElementById('main-menu').style.display = 'flex';
            });
        }

        console.log('✅ UI事件绑定完成');
    }

    // 渲染每日挑战UI
    renderDailyChallengeUI(container) {
        const challenge = this.dailyChallenge?.getChallengeProgress();
        
        if (!challenge) {
            container.innerHTML = '<p>暂无每日挑战</p>';
            return;
        }

        container.innerHTML = `
            <div class="daily-challenge-card ${challenge.completed ? 'completed' : ''}">
                <div class="challenge-header">
                    <div class="challenge-icon">${challenge.challenge.icon}</div>
                    <div class="challenge-info">
                        <div class="challenge-name">${challenge.challenge.name}</div>
                        <div class="challenge-level">关卡 ${challenge.challenge.level}</div>
                    </div>
                    ${challenge.completed ? '<div class="challenge-complete-badge">✓ 已完成</div>' : ''}
                </div>
                <div class="challenge-description">${challenge.challenge.description}</div>
                <div class="challenge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getChallengeProgressPercent(challenge)}%"></div>
                    </div>
                    <div class="progress-text">${challenge.progressText}</div>
                </div>
                <div class="challenge-reward">
                    <div class="reward-item">
                        <div class="reward-icon">💰</div>
                        <div class="reward-value">${challenge.challenge.reward.coins}</div>
                        <div class="reward-label">金币</div>
                    </div>
                    <div class="reward-item">
                        <div class="reward-icon">🏆</div>
                        <div class="reward-value">${challenge.challenge.reward.score}</div>
                        <div class="reward-label">分数</div>
                    </div>
                </div>
                <div class="challenge-actions">
                    <button class="start-challenge-btn" ${challenge.completed ? 'disabled' : ''} 
                        onclick="window.startDailyChallenge && window.startDailyChallenge()">
                        ${challenge.completed ? '已完成' : '开始挑战'}
                    </button>
                </div>
            </div>
        `;

        // 暴露全局函数
        window.startDailyChallenge = () => {
            this.startLevel(challenge.challenge.level - 1);
        };
    }

    getChallengeProgressPercent(challenge) {
        // 简化的进度计算
        return challenge.completed ? 100 : 50;
    }

    gameLoop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // 限制deltaTime防止长时间暂停后的跳跃
        const cappedDelta = Math.min(deltaTime, 0.1);

        this.update(cappedDelta);
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(deltaTime) {
        // 应用慢动作效果
        const timeScale = this.visualEffects?.getTimeScale() || 1;
        deltaTime *= timeScale;

        switch (this.state) {
            case GAME_STATE.PREPARE:
                this.updatePrepare(deltaTime);
                break;
            case GAME_STATE.BATTLE:
                this.updateBattle(deltaTime);
                break;
        }

        // 更新新系统
        this.updateNewSystems(deltaTime);
    }

    updatePrepare(deltaTime) {
        // 准备阶段倒计时（帧率独立）
        this.prepareTime -= deltaTime;
        if (this.prepareTime <= 0) {
            this.startBattle();
        }
        this.ui.updatePrepareTimer(this.prepareTime);

        // 更新输入
        this.inputManager.update();
        
        // 更新设施（使用扩展系统）
        if (this.extendedFacilitySystem) {
            this.extendedFacilitySystem.update(this, deltaTime);
        } else {
            this.facilitySystem.update(this);
        }
    }

    updateBattle(deltaTime) {
        // 更新输入
        this.inputManager.update();

        // 更新物理
        this.physicsEngine.update(this);

        // 更新水柱
        this.waterSystem.update(this);

        // 更新火焰
        this.fireSystem.update(this);

        // 更新建筑
        this.buildingSystem.update(this);

        // 更新粒子
        this.particleSystem.update(this);
        
        // 更新设施（使用扩展系统）
        if (this.extendedFacilitySystem) {
            this.extendedFacilitySystem.update(this, deltaTime);
        } else {
            this.facilitySystem.update(this);
        }
        
        // 更新背景
        this.backgroundSystem.update(deltaTime);

        // 更新时间
        this.time -= deltaTime;

        // 检查胜负
        this.checkWinLose();
    }

    // 更新所有新系统
    updateNewSystems(deltaTime) {
        // 更新救援系统
        this.rescueSystem?.update(deltaTime);

        // 更新特殊事件系统
        this.specialEventSystem?.update(deltaTime);

        // 更新视觉效果
        this.visualEffects?.update(deltaTime);

        // 更新提示系统
        this.hintSystem?.update();

        // 自动存档
        this.autoSaveSystem?.autoSave();

        // 性能监控
        this.optimizer?.monitorPerformance(deltaTime);
        this.optimizer?.adjustQuality();
    }

    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制动态背景
        this.backgroundSystem.render(this.ctx, this.canvas.width, this.canvas.height);

        // 绘制建筑
        this.buildingSystem.render(this.ctx);
        
        // 绘制设施（使用扩展系统）
        if (this.extendedFacilitySystem) {
            this.extendedFacilitySystem.render(this);
        } else {
            this.facilitySystem.render(this.ctx);
        }

        // 绘制火焰
        this.fireSystem.render(this);

        // 绘制水柱
        this.waterSystem.render(this);

        // 绘制粒子
        this.particleSystem.render(this);

        // 🚀 渲染新系统
        this.renderNewSystems();
    }

    // 渲染所有新系统
    renderNewSystems() {
        // 渲染救援系统
        this.rescueSystem?.render(this.ctx);

        // 渲染特殊事件系统
        this.specialEventSystem?.render(this.ctx);

        // 渲染视觉效果
        this.visualEffects?.render(this.ctx);

        // 渲染车辆信息
        this.vehicleSystem?.renderVehicleSelection(this.ctx, 60, 30);

        // 渲染提示
        this.hintSystem?.render(this.ctx);

        // 渲染性能面板（调试）
        if (this.settingsSystem?.getSetting('showFPS')) {
            this.optimizer?.renderPerformancePanel(this.ctx);
        }
    }

    renderBackground() {
        // 由 backgroundSystem 处理动态背景
        this.backgroundSystem.render(this.ctx, this.canvas.width, this.canvas.height);

        // 绘制发射点（消防车）
        this.renderFireTruck();
    }

    renderFireTruck() {
        // 消防车主体
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(50, this.canvas.height - 70, 80, 20);

        // 消防车轮子
        this.ctx.fillStyle = '#34495e';
        this.ctx.beginPath();
        this.ctx.arc(70, this.canvas.height - 50, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(110, this.canvas.height - 50, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // 水枪
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(100, this.canvas.height - 60, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }

    startLevel(levelIndex) {
        // 验证关卡索引
        if (levelIndex < 0 || levelIndex >= LEVEL_DATA.length) {
            console.error('Invalid level index:', levelIndex);
            return;
        }

        this.currentLevel = levelIndex;
        const levelData = LEVEL_DATA[levelIndex];

        // 重置游戏状态
        this.score = 0;
        this.water = levelData.initialWater;
        this.time = levelData.time;
        this.prepareTime = GAME_CONFIG.PREPARE_TIME;
        this.selectedFacility = null;
        this.facilities = [];

        // 清空并重建建筑
        this.buildingSystem.buildings = [];
        this.buildings = this.buildingSystem.buildings;

        levelData.buildings.forEach(b => {
            this.buildingSystem.create(b.type, b.x, b.y);
        });

        // 清空其他系统
        this.fireSystem.clear();
        this.fires = this.fireSystem.fires;

        this.waterSystem.clear();
        this.waterDroplets = this.waterSystem.droplets;

        this.particleSystem.clear();

        // 清空设施
        this.facilitySystem.clear();
        if (this.extendedFacilitySystem) {
            this.extendedFacilitySystem.facilities = [];
        }

        // 🚀 初始化新系统
        this.rescueSystem?.spawnSurvivors(this.buildings);
        this.specialEventSystem?.spawnEvents(this.buildings);
        this.upgradeSystem?.applyAllUpgrades();
        this.vehicleSystem?.applyVehicleStats();

        // 重置新系统
        this.rescueSystem?.reset();
        this.specialEventSystem?.reset();
        this.visualEffects?.clear();

        // 切换到准备阶段
        this.state = GAME_STATE.PREPARE;
        this.ui.showGameUI();
    }

    startBattle() {
        this.state = GAME_STATE.BATTLE;

        // 点燃初始建筑
        LEVEL_DATA[this.currentLevel].initialFires.forEach(idx => {
            if (idx >= 0 && idx < this.buildings.length) {
                this.fireSystem.ignite(this.buildings[idx]);
            }
        });
    }

    shootWater(angle, power) {
        this.waterSystem.shoot(this, angle, power);
        
        // 播放音效
        this.enhancedAudio?.play('waterShoot');
        
        // 更新统计
        this.stats.shotsFired++;
    }

    placeFacility(type, x, y) {
        let result;
        
        // 使用扩展设施系统
        if (this.extendedFacilitySystem) {
            result = this.extendedFacilitySystem.place(this, type, x, y);
        } else {
            result = this.facilitySystem.place(this, type, x, y);
        }
        
        if (result) {
            console.log(`放置设施成功: ${type} at (${x}, ${y})`);
            this.enhancedAudio?.play('click');
        } else {
            console.log(`放置设施失败: ${type} at (${x}, ${y})`);
        }
        return result;
    }

    checkWinLose() {
        // 检查是否所有火都熄灭
        const hasFire = this.fires.some(f => f.intensity > 0);

        // 检查是否所有建筑都损毁
        const hasBuilding = this.buildings.some(b => b.health > 0);

        // 检查时间是否耗尽
        const timeUp = this.time <= 0;

        if (!hasFire) {
            this.win();
        } else if (!hasBuilding || this.water <= 0 || timeUp) {
            this.lose();
        }
    }

    win() {
        this.state = GAME_STATE.WIN;
        const savedBuildings = this.buildings.filter(b => b.health > 0).length;
        
        // 计算奖励
        const stats = this.getLevelStats();
        const rewards = this.upgradeSystem?.calculateRewards(stats);
        
        // 检查每日挑战
        if (this.dailyChallenge?.checkChallengeCompletion(stats)) {
            // 挑战完成
        }
        
        // 保存进度
        this.autoSaveSystem?.save(0);
        
        // 播放胜利音效
        this.enhancedAudio?.play('victory');
        
        this.ui.showResult(true, this.score, this.water, savedBuildings);
    }

    lose() {
        this.state = GAME_STATE.LOSE;
        const savedBuildings = this.buildings.filter(b => b.health > 0).length;
        
        // 播放失败音效
        this.enhancedAudio?.play('defeat');
        
        this.ui.showResult(false, this.score, this.water, savedBuildings);
    }

    // 显示消息
    showMessage(message, duration = 2000) {
        // 使用UI系统显示消息
        this.ui.showMessage?.(message, duration);
    }

    // 添加分数
    addScore(points) {
        this.score += this.balanceSystem?.getModifiedScore(points) || points;
    }

    // 获取关卡统计
    getLevelStats() {
        return {
            time: this.time,
            waterUsed: this.stats.waterUsed,
            rescued: this.rescueSystem?.rescuedCount || 0,
            buildingsLost: this.stats.buildingsLost,
            accuracy: this.stats.shotsFired > 0 ? this.stats.shotsHit / this.stats.shotsFired : 0,
        };
    }
}
