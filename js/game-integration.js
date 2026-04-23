/**
 * game-integration.js - 新功能集成脚本
 * 将救援、升级、特殊事件、车辆系统集成到游戏中
 */

class GameIntegration {
    constructor(game) {
        this.game = game;
        this.systems = {};
        this.initialized = false;
    }

    // 初始化所有新系统
    init() {
        if (this.initialized) return;

        try {
            // 初始化救援系统
            this.systems.rescue = new RescueSystem(this.game);
            console.log('✅ 救援系统已初始化');

            // 初始化升级系统
            this.systems.upgrade = new UpgradeSystem(this.game);
            console.log('✅ 升级系统已初始化');

            // 初始化特殊事件系统
            this.systems.specialEvents = new SpecialEventSystem(this.game);
            console.log('✅ 特殊事件系统已初始化');

            // 初始化车辆系统
            this.systems.vehicle = new VehicleSystem(this.game);
            console.log('✅ 车辆系统已初始化');

            // 应用所有升级
            this.systems.upgrade.applyAllUpgrades();
            
            // 应用车辆属性
            this.systems.vehicle.applyVehicleStats();

            // 挂载到游戏实例
            this.game.rescueSystem = this.systems.rescue;
            this.game.upgradeSystem = this.systems.upgrade;
            this.game.specialEventSystem = this.systems.specialEvents;
            this.game.vehicleSystem = this.systems.vehicle;

            // 绑定菜单事件
            this.bindMenuEvents();

            this.initialized = true;
            console.log('🎉 所有新系统已成功集成');
        } catch (error) {
            console.error('❌ 系统初始化失败:', error);
        }
    }

    // 绑定菜单事件
    bindMenuEvents() {
        // 升级中心按钮
        const upgradeBtn = document.getElementById('btn-upgrade');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.showUpgradeMenu();
            });
        }

        // 消防车库按钮
        const vehicleBtn = document.getElementById('btn-vehicle');
        if (vehicleBtn) {
            vehicleBtn.addEventListener('click', () => {
                this.showVehicleMenu();
            });
        }

        // 返回按钮
        const backUpgradeBtn = document.getElementById('btn-back-upgrade');
        if (backUpgradeBtn) {
            backUpgradeBtn.addEventListener('click', () => {
                this.hideUpgradeMenu();
            });
        }

        const backVehicleBtn = document.getElementById('btn-back-vehicle');
        if (backVehicleBtn) {
            backVehicleBtn.addEventListener('click', () => {
                this.hideVehicleMenu();
            });
        }
    }

    // 显示升级中心
    showUpgradeMenu() {
        const upgradeMenu = document.getElementById('upgrade-menu');
        const upgradeList = document.getElementById('upgrade-list');
        const mainMenu = document.getElementById('main-menu');

        if (upgradeMenu && upgradeList) {
            mainMenu.style.display = 'none';
            upgradeMenu.style.display = 'flex';
            this.systems.upgrade.renderShopUI(upgradeList);
        }
    }

    // 隐藏升级中心
    hideUpgradeMenu() {
        const upgradeMenu = document.getElementById('upgrade-menu');
        const mainMenu = document.getElementById('main-menu');

        if (upgradeMenu && mainMenu) {
            upgradeMenu.style.display = 'none';
            mainMenu.style.display = 'flex';
        }
    }

    // 显示消防车库
    showVehicleMenu() {
        const vehicleMenu = document.getElementById('vehicle-menu');
        const vehicleList = document.getElementById('vehicle-list');
        const mainMenu = document.getElementById('main-menu');

        if (vehicleMenu && vehicleList) {
            mainMenu.style.display = 'none';
            vehicleMenu.style.display = 'flex';
            this.systems.vehicle.renderGarageUI(vehicleList);
        }
    }

    // 隐藏消防车库
    hideVehicleMenu() {
        const vehicleMenu = document.getElementById('vehicle-menu');
        const mainMenu = document.getElementById('main-menu');

        if (vehicleMenu && mainMenu) {
            vehicleMenu.style.display = 'none';
            mainMenu.style.display = 'flex';
        }
    }

    // 关卡开始时的初始化
    onLevelStart(buildings) {
        // 生成幸存者
        this.systems.rescue.spawnSurvivors(buildings);
        
        // 生成特殊事件
        this.systems.specialEvents.spawnEvents(buildings);
        
        // 应用升级和车辆属性
        this.systems.upgrade.applyAllUpgrades();
        this.systems.vehicle.applyVehicleStats();

        console.log('🎮 关卡系统已初始化', {
            survivors: this.systems.rescue.survivors.length,
            events: this.systems.specialEvents.events.length
        });
    }

    // 更新所有系统
    update(deltaTime) {
        if (!this.initialized) return;

        // 更新救援系统
        this.systems.rescue.update(deltaTime);

        // 更新特殊事件系统
        this.systems.specialEvents.update(deltaTime);
    }

    // 渲染所有系统
    render(ctx) {
        if (!this.initialized) return;

        // 渲染救援系统
        this.systems.rescue.render(ctx);

        // 渲染特殊事件系统
        this.systems.specialEvents.render(ctx);

        // 渲染车辆信息
        this.renderVehicleInfo(ctx);
    }

    // 渲染车辆信息
    renderVehicleInfo(ctx) {
        const vehicle = this.systems.vehicle.getCurrentVehicle();
        
        ctx.save();
        
        // 车辆图标和名称
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(`${vehicle.icon} ${vehicle.name}`, 10, 30);
        
        // 特殊技能状态
        if (vehicle.special) {
            const cooldownText = vehicle.special.active ? '激活中' : '就绪';
            ctx.font = '12px Arial';
            ctx.fillStyle = vehicle.special.active ? '#27ae60' : '#95a5a6';
            ctx.fillText(`⚡ ${vehicle.special.name}: ${cooldownText}`, 10, 50);
            
            // 按提示
            ctx.fillStyle = '#FFD700';
            ctx.fillText('按 [S] 激活技能', 10, 70);
        }
        
        ctx.restore();
    }

    // 关卡结束时的统计
    getLevelStats() {
        return {
            rescue: this.systems.rescue.getStats(),
            events: this.systems.specialEvents.getStats(),
            vehicle: this.systems.vehicle.getCurrentVehicle().name,
        };
    }

    // 重置所有系统
    reset() {
        this.systems.rescue.reset();
        this.systems.specialEvents.reset();
        this.systems.vehicle.reset();
    }

    // 计算奖励
    calculateRewards(levelStats) {
        let coins = 0;
        let bonusScore = 0;

        // 救援奖励
        coins += levelStats.rescue.rescued * 50;
        bonusScore += levelStats.rescue.rescued * 200;

        // 特殊事件奖励
        coins += levelStats.events.resolved * 30;

        // 添加金币到升级系统
        this.systems.upgrade.addCoins(coins);

        return {
            coins,
            bonusScore,
        };
    }

    // 保存游戏进度
    saveProgress() {
        this.systems.upgrade.saveUpgrades();
        this.systems.upgrade.saveCoins();
        this.systems.vehicle.saveCurrentVehicle();
        this.systems.vehicle.saveUnlockedVehicles();
    }

    // 加载游戏进度
    loadProgress() {
        this.systems.upgrade.loadUpgrades();
        this.systems.upgrade.loadCoins();
        this.systems.vehicle.loadCurrentVehicle();
        this.systems.vehicle.loadUnlockedVehicles();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameIntegration };
}
