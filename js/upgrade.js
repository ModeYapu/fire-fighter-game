// ==================== 升级系统 ====================

class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this.coins = this.loadCoins();
        this.upgrades = this.loadUpgrades();
        this.upgradeConfig = this.getUpgradeConfig();
    }

    // 获取升级配置
    getUpgradeConfig() {
        return {
            // 水枪升级
            waterGun: {
                name: '水枪',
                icon: '🔫',
                levels: [
                    {
                        level: 1,
                        name: '基础水枪',
                        stats: { power: 100, range: 300, accuracy: 0.7 },
                        cost: 0,
                    },
                    {
                        level: 2,
                        name: '增强水枪',
                        stats: { power: 120, range: 350, accuracy: 0.75 },
                        cost: 500,
                    },
                    {
                        level: 3,
                        name: '高压水枪',
                        stats: { power: 150, range: 400, accuracy: 0.8 },
                        cost: 1000,
                    },
                    {
                        level: 4,
                        name: '专业水枪',
                        stats: { power: 180, range: 450, accuracy: 0.85 },
                        cost: 2000,
                    },
                    {
                        level: 5,
                        name: '消防水炮',
                        stats: { power: 220, range: 500, accuracy: 0.9 },
                        cost: 5000,
                    },
                ],
            },

            // 水箱升级
            waterTank: {
                name: '水箱',
                icon: '💧',
                levels: [
                    {
                        level: 1,
                        name: '小水箱',
                        stats: { capacity: 1000, refillRate: 10 },
                        cost: 0,
                    },
                    {
                        level: 2,
                        name: '中水箱',
                        stats: { capacity: 1500, refillRate: 15 },
                        cost: 400,
                    },
                    {
                        level: 3,
                        name: '大水箱',
                        stats: { capacity: 2000, refillRate: 20 },
                        cost: 800,
                    },
                    {
                        level: 4,
                        name: '超大水箱',
                        stats: { capacity: 2500, refillRate: 25 },
                        cost: 1500,
                    },
                    {
                        level: 5,
                        name: '消防水库',
                        stats: { capacity: 3000, refillRate: 30 },
                        cost: 3000,
                    },
                ],
            },

            // 消防栓升级
            hydrant: {
                name: '消防栓',
                icon: '🚿',
                levels: [
                    {
                        level: 1,
                        name: '基础消防栓',
                        stats: { range: 100, refillBonus: 10 },
                        cost: 0,
                    },
                    {
                        level: 2,
                        name: '增强消防栓',
                        stats: { range: 120, refillBonus: 15 },
                        cost: 300,
                    },
                    {
                        level: 3,
                        name: '高压消防栓',
                        stats: { range: 150, refillBonus: 20 },
                        cost: 600,
                    },
                    {
                        level: 4,
                        name: '智能消防栓',
                        stats: { range: 180, refillBonus: 25 },
                        cost: 1200,
                    },
                    {
                        level: 5,
                        name: '超级消防栓',
                        stats: { range: 200, refillBonus: 30 },
                        cost: 2500,
                    },
                ],
            },

            // 消防员升级
            firefighter: {
                name: '消防员',
                icon: '👨‍🚒',
                levels: [
                    {
                        level: 1,
                        name: '实习消防员',
                        stats: { extinguishRate: 0.1, moveSpeed: 1 },
                        cost: 0,
                    },
                    {
                        level: 2,
                        name: '消防员',
                        stats: { extinguishRate: 0.15, moveSpeed: 1.2 },
                        cost: 400,
                    },
                    {
                        level: 3,
                        name: '高级消防员',
                        stats: { extinguishRate: 0.2, moveSpeed: 1.4 },
                        cost: 800,
                    },
                    {
                        level: 4,
                        name: '消防队长',
                        stats: { extinguishRate: 0.25, moveSpeed: 1.6 },
                        cost: 1600,
                    },
                    {
                        level: 5,
                        name: '消防专家',
                        stats: { extinguishRate: 0.3, moveSpeed: 2 },
                        cost: 3000,
                    },
                ],
            },

            // 防护装备升级
            protection: {
                name: '防护装备',
                icon: '🛡️',
                levels: [
                    {
                        level: 1,
                        name: '基础装备',
                        stats: { fireResistance: 1.0, health: 100 },
                        cost: 0,
                    },
                    {
                        level: 2,
                        name: '轻型防护服',
                        stats: { fireResistance: 0.9, health: 120 },
                        cost: 350,
                    },
                    {
                        level: 3,
                        name: '标准防护服',
                        stats: { fireResistance: 0.8, health: 150 },
                        cost: 700,
                    },
                    {
                        level: 4,
                        name: '重型防护服',
                        stats: { fireResistance: 0.7, health: 180 },
                        cost: 1400,
                    },
                    {
                        level: 5,
                        name: '高级防护服',
                        stats: { fireResistance: 0.6, health: 200 },
                        cost: 2800,
                    },
                ],
            },
        };
    }

    // 加载金币
    loadCoins() {
        const saved = localStorage.getItem('firefighter_coins');
        return saved ? parseInt(saved) : 0;
    }

    // 保存金币
    saveCoins() {
        localStorage.setItem('firefighter_coins', this.coins.toString());
    }

    // 加载升级状态
    loadUpgrades() {
        const saved = localStorage.getItem('firefighter_upgrades');
        return saved ? JSON.parse(saved) : {
            waterGun: 1,
            waterTank: 1,
            hydrant: 1,
            firefighter: 1,
            protection: 1,
        };
    }

    // 保存升级状态
    saveUpgrades() {
        localStorage.setItem('firefighter_upgrades', JSON.stringify(this.upgrades));
    }

    // 获取当前升级等级
    getUpgradeLevel(type) {
        return this.upgrades[type] || 1;
    }

    // 获取当前升级属性
    getUpgradeStats(type) {
        const level = this.getUpgradeLevel(type);
        const config = this.upgradeConfig[type];
        if (!config) return null;
        
        return config.levels[level - 1]?.stats || config.levels[0].stats;
    }

    // 检查是否可以升级
    canUpgrade(type) {
        const config = this.upgradeConfig[type];
        if (!config) return false;
        
        const currentLevel = this.getUpgradeLevel(type);
        if (currentLevel >= config.levels.length) return false;
        
        const nextLevel = config.levels[currentLevel];
        return this.coins >= nextLevel.cost;
    }

    // 升级
    upgrade(type) {
        if (!this.canUpgrade(type)) return false;
        
        const config = this.upgradeConfig[type];
        const currentLevel = this.getUpgradeLevel(type);
        const nextLevel = config.levels[currentLevel];
        
        this.coins -= nextLevel.cost;
        this.upgrades[type] = currentLevel + 1;
        
        this.saveCoins();
        this.saveUpgrades();
        
        // 应用升级效果
        this.applyUpgrade(type);
        
        // 播放音效
        if (this.game.audio) {
            this.game.audio.play('upgrade');
        }
        
        return true;
    }

    // 应用升级效果
    applyUpgrade(type) {
        const stats = this.getUpgradeStats(type);
        
        switch (type) {
            case 'waterGun':
                // 更新水枪属性
                if (this.game.waterSystem) {
                    this.game.waterSystem.maxPower = stats.power;
                    this.game.waterSystem.range = stats.range;
                    this.game.waterSystem.accuracy = stats.accuracy;
                }
                break;
                
            case 'waterTank':
                // 更新水箱属性
                if (this.game.resourceSystem) {
                    this.game.resourceSystem.maxWater = stats.capacity;
                    this.game.resourceSystem.refillRate = stats.refillRate;
                }
                break;
                
            case 'hydrant':
                // 更新消防栓属性
                if (this.game.facilitySystem) {
                    this.game.facilitySystem.updateHydrantStats(stats);
                }
                break;
                
            case 'firefighter':
                // 更新消防员属性
                if (this.game.facilitySystem) {
                    this.game.facilitySystem.updateFirefighterStats(stats);
                }
                break;
                
            case 'protection':
                // 更新防护装备属性
                if (this.game.facilitySystem) {
                    this.game.facilitySystem.updateProtectionStats(stats);
                }
                break;
        }
    }

    // 应用所有升级
    applyAllUpgrades() {
        Object.keys(this.upgradeConfig).forEach(type => {
            this.applyUpgrade(type);
        });
    }

    // 增加金币
    addCoins(amount) {
        this.coins += amount;
        this.saveCoins();
    }

    // 获取升级费用
    getUpgradeCost(type) {
        const config = this.upgradeConfig[type];
        if (!config) return 0;
        
        const currentLevel = this.getUpgradeLevel(type);
        if (currentLevel >= config.levels.length) return 0;
        
        return config.levels[currentLevel].cost;
    }

    // 获取下一级信息
    getNextLevelInfo(type) {
        const config = this.upgradeConfig[type];
        if (!config) return null;
        
        const currentLevel = this.getUpgradeLevel(type);
        if (currentLevel >= config.levels.length) return null;
        
        return config.levels[currentLevel];
    }

    // 渲染升级商店UI
    renderShopUI(container) {
        container.innerHTML = '';
        
        // 金币显示
        const coinsDiv = document.createElement('div');
        coinsDiv.className = 'upgrade-coins';
        coinsDiv.innerHTML = `💰 金币: <span>${this.coins}</span>`;
        container.appendChild(coinsDiv);
        
        // 升级项目
        Object.keys(this.upgradeConfig).forEach(type => {
            const config = this.upgradeConfig[type];
            const currentLevel = this.getUpgradeLevel(type);
            const nextLevel = this.getNextLevelInfo(type);
            const canUpgrade = this.canUpgrade(type);
            
            const itemDiv = document.createElement('div');
            itemDiv.className = `upgrade-item ${canUpgrade ? 'can-upgrade' : 'max-level'}`;
            
            itemDiv.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-icon">${config.icon}</span>
                    <span class="upgrade-name">${config.name}</span>
                    <span class="upgrade-level">Lv.${currentLevel}${nextLevel ? ` → Lv.${currentLevel + 1}` : ' (MAX)'}</span>
                </div>
                <div class="upgrade-current">
                    当前: ${this.getLevelName(type, currentLevel)}
                </div>
                ${nextLevel ? `
                    <div class="upgrade-next">
                        下一级: ${nextLevel.name}<br>
                        费用: ${nextLevel.cost} 💰
                    </div>
                    <button class="upgrade-btn" ${canUpgrade ? '' : 'disabled'}>
                        ${canUpgrade ? '升级' : '金币不足'}
                    </button>
                ` : ''}
            `;
            
            if (canUpgrade) {
                const btn = itemDiv.querySelector('.upgrade-btn');
                btn.addEventListener('click', () => {
                    if (this.upgrade(type)) {
                        this.renderShopUI(container);
                        this.game.showMessage(`🎉 ${config.name}升级成功！`, 2000);
                    }
                });
            }
            
            container.appendChild(itemDiv);
        });
    }

    // 获取等级名称
    getLevelName(type, level) {
        const config = this.upgradeConfig[type];
        if (!config || level < 1 || level > config.levels.length) return '';
        return config.levels[level - 1].name;
    }

    // 重置所有升级（调试用）
    resetAll() {
        this.coins = 0;
        this.upgrades = {
            waterGun: 1,
            waterTank: 1,
            hydrant: 1,
            firefighter: 1,
            protection: 1,
        };
        this.saveCoins();
        this.saveUpgrades();
    }
}

export { UpgradeSystem };
