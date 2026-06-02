/**
 * 科技树系统 (Tech Tree System)
 * 3条路线：水枪技术/防护装备/消防车升级
 * 每条路线5级，通过任务获取科技点数
 */
export class TechTreeSystem {
    constructor(game) {
        this.game = game;
        this.techPoints = this.loadTechPoints();
        this.unlockedTechs = this.loadUnlockedTechs();

        // 科技树数据
        this.techTree = {
            waterGun: {
                name: '水枪技术',
                icon: '💧',
                description: '提升水枪射程、威力和水量效率',
                color: '#3498db',
                levels: [
                    {
                        id: 'water-1',
                        name: '基础喷射',
                        cost: 50,
                        effect: { waterRange: 10 },
                        description: '水枪射程 +10%',
                        requires: null
                    },
                    {
                        id: 'water-2',
                        name: '高压水流',
                        cost: 100,
                        effect: { waterPower: 15 },
                        description: '水流伤害 +15%',
                        requires: 'water-1'
                    },
                    {
                        id: 'water-3',
                        name: '节水喷嘴',
                        cost: 200,
                        effect: { waterEfficiency: 20 },
                        description: '水量消耗 -20%',
                        requires: 'water-2'
                    },
                    {
                        id: 'water-4',
                        name: '双管喷射',
                        cost: 400,
                        effect: { waterRange: 15, waterPower: 10 },
                        description: '射程 +15%, 伤害 +10%',
                        requires: 'water-3'
                    },
                    {
                        id: 'water-5',
                        name: '终极水压',
                        cost: 800,
                        effect: { waterPower: 30, waterEfficiency: 25 },
                        description: '伤害 +30%, 水量效率 +25%',
                        requires: 'water-4'
                    }
                ]
            },
            protective: {
                name: '防护装备',
                icon: '🛡️',
                description: '提升消防员生存能力和工作效率',
                color: '#9b59b6',
                levels: [
                    {
                        id: 'protect-1',
                        name: '基础防护',
                        cost: 50,
                        effect: { firefighterDefense: 5 },
                        description: '消防员防御 +5',
                        requires: null
                    },
                    {
                        id: 'protect-2',
                        name: '耐火装备',
                        cost: 100,
                        effect: { firefighterDefense: 10 },
                        description: '消防员防御 +10',
                        requires: 'protect-1'
                    },
                    {
                        id: 'protect-3',
                        name: '快速响应',
                        cost: 200,
                        effect: { firefighterSpeed: 15 },
                        description: '消防员移动速度 +15%',
                        requires: 'protect-2'
                    },
                    {
                        id: 'protect-4',
                        name: '隔热服',
                        cost: 400,
                        effect: { firefighterDefense: 15, firefighterSpeed: 10 },
                        description: '防御 +15, 速度 +10%',
                        requires: 'protect-3'
                    },
                    {
                        id: 'protect-5',
                        name: '全套装备',
                        cost: 800,
                        effect: { firefighterDefense: 25, firefighterSpeed: 20 },
                        description: '防御 +25, 速度 +20%',
                        requires: 'protect-4'
                    }
                ]
            },
            fireTruck: {
                name: '消防车升级',
                icon: '🚒',
                description: '增强消防车性能和载水量',
                color: '#e74c3c',
                levels: [
                    {
                        id: 'truck-1',
                        name: '强化水箱',
                        cost: 50,
                        effect: { maxWater: 200 },
                        description: '最大水量 +200',
                        requires: null
                    },
                    {
                        id: 'truck-2',
                        name: '增压泵',
                        cost: 100,
                        effect: { waterPower: 10 },
                        description: '水流伤害 +10%',
                        requires: 'truck-1'
                    },
                    {
                        id: 'truck-3',
                        name: '扩展水罐',
                        cost: 200,
                        effect: { maxWater: 400 },
                        description: '最大水量 +400',
                        requires: 'truck-2'
                    },
                    {
                        id: 'truck-4',
                        name: '快速充水',
                        cost: 400,
                        effect: { refillSpeed: 30 },
                        description: '补水速度 +30%',
                        requires: 'truck-3'
                    },
                    {
                        id: 'truck-5',
                        name: '超级消防车',
                        cost: 800,
                        effect: { maxWater: 600, waterPower: 20 },
                        description: '水量 +600, 伤害 +20%',
                        requires: 'truck-4'
                    }
                ]
            }
        };

        // 当前激活的效果
        this.activeEffects = this.calculateActiveEffects();
    }

    // 加载科技点数
    loadTechPoints() {
        try {
            return parseInt(localStorage.getItem('techPoints') || '0');
        } catch (e) {
            return 0;
        }
    }

    // 保存科技点数
    saveTechPoints() {
        localStorage.setItem('techPoints', this.techPoints.toString());
    }

    // 加载已解锁科技
    loadUnlockedTechs() {
        try {
            return JSON.parse(localStorage.getItem('unlockedTechs') || '[]');
        } catch (e) {
            return [];
        }
    }

    // 保存已解锁科技
    saveUnlockedTechs() {
        localStorage.setItem('unlockedTechs', JSON.stringify(this.unlockedTechs));
    }

    // 计算激活效果
    calculateActiveEffects() {
        const effects = {
            waterRange: 0,
            waterPower: 0,
            waterEfficiency: 0,
            firefighterDefense: 0,
            firefighterSpeed: 0,
            maxWater: 0,
            refillSpeed: 0
        };

        Object.values(this.techTree).forEach(route => {
            route.levels.forEach(level => {
                if (this.unlockedTechs.includes(level.id)) {
                    Object.keys(level.effect).forEach(key => {
                        effects[key] += level.effect[key];
                    });
                }
            });
        });

        return effects;
    }

    // 检查是否可以解锁
    canUnlock(techId) {
        if (this.unlockedTechs.includes(techId)) return false;

        for (const route of Object.values(this.techTree)) {
            for (const level of route.levels) {
                if (level.id === techId) {
                    // 检查前置要求
                    if (level.requires) {
                        return this.unlockedTechs.includes(level.requires);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    // 解锁科技
    unlockTech(techId) {
        if (!this.canUnlock(techId)) return false;

        for (const route of Object.values(this.techTree)) {
            for (const level of route.levels) {
                if (level.id === techId) {
                    if (this.techPoints >= level.cost) {
                        this.techPoints -= level.cost;
                        this.unlockedTechs.push(techId);
                        this.activeEffects = this.calculateActiveEffects();
                        this.saveTechPoints();
                        this.saveUnlockedTechs();
                        return true;
                    }
                    break;
                }
            }
        }
        return false;
    }

    // 添加科技点数
    addTechPoints(points) {
        this.techPoints += points;
        this.saveTechPoints();
    }

    // 获取科技点数
    getTechPoints() {
        return this.techPoints;
    }

    // 获取已解锁科技数量
    getUnlockedCount() {
        return this.unlockedTechs.length;
    }

    // 获取总科技数量
    getTotalTechCount() {
        let total = 0;
        Object.values(this.techTree).forEach(route => {
            total += route.levels.length;
        });
        return total;
    }

    // 渲染科技树UI
    renderTechTreeUI(container) {
        container.innerHTML = '';

        // 科技点数显示
        const pointsDisplay = document.createElement('div');
        pointsDisplay.className = 'tech-points-display';
        pointsDisplay.innerHTML = `
            <span class="tech-icon">⚗️</span>
            <span>科技点数:</span>
            <span class="tech-points-value">${this.techPoints}</span>
        `;
        container.appendChild(pointsDisplay);

        // 科技树路线
        Object.entries(this.techTree).forEach(([routeKey, route]) => {
            const routeElement = this.createRouteElement(routeKey, route);
            container.appendChild(routeElement);
        });
    }

    // 创建路线元素
    createRouteElement(routeKey, route) {
        const routeDiv = document.createElement('div');
        routeDiv.className = 'tech-route';
        routeDiv.style.setProperty('--route-color', route.color);

        const header = document.createElement('div');
        header.className = 'tech-route-header';
        header.innerHTML = `
            <span class="route-icon">${route.icon}</span>
            <div class="route-info">
                <h3>${route.name}</h3>
                <p>${route.description}</p>
            </div>
            <div class="route-progress">
                <span>${this.getRouteProgress(route)}</span>
            </div>
        `;

        const levelsContainer = document.createElement('div');
        levelsContainer.className = 'tech-levels-container';

        route.levels.forEach((level, index) => {
            const levelElement = this.createLevelElement(level, index);
            levelsContainer.appendChild(levelElement);
        });

        routeDiv.appendChild(header);
        routeDiv.appendChild(levelsContainer);

        return routeDiv;
    }

    // 创建等级元素
    createLevelElement(level, index) {
        const isUnlocked = this.unlockedTechs.includes(level.id);
        const canUnlock = this.canUnlock(level.id);
        const hasRequirements = level.requires && !this.unlockedTechs.includes(level.requires);

        const levelDiv = document.createElement('div');
        levelDiv.className = `tech-level ${isUnlocked ? 'unlocked' : ''} ${canUnlock ? 'can-unlock' : ''} ${hasRequirements ? 'locked' : ''}`;

        levelDiv.innerHTML = `
            <div class="tech-level-icon">
                ${isUnlocked ? '✅' : canUnlock ? '🔓' : '🔒'}
            </div>
            <div class="tech-level-content">
                <div class="tech-level-header">
                    <span class="tech-level-name">${level.name}</span>
                    <span class="tech-level-cost">${level.cost} ⚗️</span>
                </div>
                <div class="tech-level-effect">${level.description}</div>
                ${hasRequirements ? '<div class="tech-requirement">需要先解锁前置科技</div>' : ''}
            </div>
            ${canUnlock && !isUnlocked ? `<button class="tech-unlock-btn" data-tech="${level.id}">解锁</button>` : ''}
        `;

        // 绑定解锁事件
        const unlockBtn = levelDiv.querySelector('.tech-unlock-btn');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                if (this.unlockTech(level.id)) {
                    this.renderTechTreeUI(document.getElementById('tech-tree-content'));
                }
            });
        }

        return levelDiv;
    }

    // 获取路线进度
    getRouteProgress(route) {
        const unlocked = route.levels.filter(l => this.unlockedTechs.includes(l.id)).length;
        return `${unlocked}/${route.levels.length}`;
    }

    // 应用科技效果到游戏
    applyTechEffects(game) {
        const effects = this.activeEffects;

        // 应用水枪效果
        if (effects.waterRange > 0) {
            game.waterRangeBonus = effects.waterRange;
        }
        if (effects.waterPower > 0) {
            game.waterPowerBonus = effects.waterPower;
        }
        if (effects.waterEfficiency > 0) {
            game.waterEfficiencyBonus = effects.waterEfficiency;
        }

        // 应用水量效果
        if (effects.maxWater > 0) {
            game.maxWaterBonus = effects.maxWater;
        }

        return effects;
    }
}
