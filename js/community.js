/**
 * 社区系统 (Community System)
 * 消防站建设、消防员招募、资源管理
 */
export class CommunitySystem {
    constructor(game) {
        this.game = game;
        this.resources = this.loadResources();
        this.buildings = this.loadBuildings();
        this.firefighters = this.loadFirefighters();

        // 建筑数据
        this.buildingData = {
            fireStation: {
                id: 'fireStation',
                name: '消防站',
                icon: '🏢',
                description: '消防指挥中心，可招募更多消防员',
                levels: [
                    {
                        level: 1,
                        name: '初级消防站',
                        cost: { gold: 0, materials: 0 },
                        effect: { maxFirefighters: 2 },
                        description: '可招募2名消防员'
                    },
                    {
                        level: 2,
                        name: '中级消防站',
                        cost: { gold: 1000, materials: 100 },
                        effect: { maxFirefighters: 4 },
                        description: '可招募4名消防员'
                    },
                    {
                        level: 3,
                        name: '高级消防站',
                        cost: { gold: 3000, materials: 300 },
                        effect: { maxFirefighters: 6 },
                        description: '可招募6名消防员'
                    },
                    {
                        level: 4,
                        name: '特级消防站',
                        cost: { gold: 8000, materials: 800 },
                        effect: { maxFirefighters: 10 },
                        description: '可招募10名消防员，每日科技点+10'
                    },
                    {
                        level: 5,
                        name: '消防总部',
                        cost: { gold: 20000, materials: 2000 },
                        effect: { maxFirefighters: 15, techBonus: 20 },
                        description: '可招募15名消防员，每日科技点+20'
                    }
                ]
            },
            trainingCenter: {
                id: 'trainingCenter',
                name: '训练中心',
                icon: '🏋️',
                description: '提升消防员能力上限',
                levels: [
                    {
                        level: 1,
                        name: '基础训练场',
                        cost: { gold: 500, materials: 50 },
                        effect: { maxSkillLevel: 3 },
                        description: '消防员技能上限3级'
                    },
                    {
                        level: 2,
                        name: '进阶训练中心',
                        cost: { gold: 2000, materials: 200 },
                        effect: { maxSkillLevel: 5 },
                        description: '消防员技能上限5级'
                    },
                    {
                        level: 3,
                        name: '专业培训学院',
                        cost: { gold: 5000, materials: 500 },
                        effect: { maxSkillLevel: 8 },
                        description: '消防员技能上限8级'
                    },
                    {
                        level: 4,
                        name: '消防研究院',
                        cost: { gold: 12000, materials: 1200 },
                        effect: { maxSkillLevel: 10 },
                        description: '消防员技能上限10级'
                    }
                ]
            },
            warehouse: {
                id: 'warehouse',
                name: '物资仓库',
                icon: '📦',
                description: '增加资源存储上限',
                levels: [
                    {
                        level: 1,
                        name: '小型仓库',
                        cost: { gold: 300, materials: 30 },
                        effect: { resourceBonus: 0.1 },
                        description: '资源产量+10%'
                    },
                    {
                        level: 2,
                        name: '中型仓库',
                        cost: { gold: 1500, materials: 150 },
                        effect: { resourceBonus: 0.25 },
                        description: '资源产量+25%'
                    },
                    {
                        level: 3,
                        name: '大型仓库',
                        cost: { gold: 4000, materials: 400 },
                        effect: { resourceBonus: 0.5 },
                        description: '资源产量+50%'
                    },
                    {
                        level: 4,
                        name: '中央仓库',
                        cost: { gold: 10000, materials: 1000 },
                        effect: { resourceBonus: 1 },
                        description: '资源产量+100%'
                    }
                ]
            },
            garage: {
                id: 'garage',
                name: '装备车库',
                icon: '🔧',
                description: '解锁高级消防装备',
                levels: [
                    {
                        level: 1,
                        name: '基础车库',
                        cost: { gold: 800, materials: 80 },
                        effect: { equipmentTier: 1 },
                        description: '解锁基础装备'
                    },
                    {
                        level: 2,
                        name: '装备车库',
                        cost: { gold: 2500, materials: 250 },
                        effect: { equipmentTier: 2 },
                        description: '解锁中级装备'
                    },
                    {
                        level: 3,
                        name: '特种车库',
                        cost: { gold: 6000, materials: 600 },
                        effect: { equipmentTier: 3 },
                        description: '解锁高级装备'
                    },
                    {
                        level: 4,
                        name: '装备研发中心',
                        cost: { gold: 15000, materials: 1500 },
                        effect: { equipmentTier: 4 },
                        description: '解锁特种装备'
                    }
                ]
            }
        };

        // 消防员候选人池
        this.firefighterCandidates = this.generateCandidates();

        // 资源产量加成
        this.resourceBonus = this.calculateResourceBonus();
    }

    // 加载资源
    loadResources() {
        try {
            return JSON.parse(localStorage.getItem('communityResources') || JSON.stringify({
                gold: 1000,
                materials: 100,
                reputation: 0
            }));
        } catch (e) {
            return { gold: 1000, materials: 100, reputation: 0 };
        }
    }

    // 保存资源
    saveResources() {
        localStorage.setItem('communityResources', JSON.stringify(this.resources));
    }

    // 加载建筑
    loadBuildings() {
        try {
            return JSON.parse(localStorage.getItem('communityBuildings') || JSON.stringify({
                fireStation: 1,
                trainingCenter: 0,
                warehouse: 0,
                garage: 0
            }));
        } catch (e) {
            return { fireStation: 1, trainingCenter: 0, warehouse: 0, garage: 0 };
        }
    }

    // 保存建筑
    saveBuildings() {
        localStorage.setItem('communityBuildings', JSON.stringify(this.buildings));
    }

    // 加载消防员
    loadFirefighters() {
        try {
            return JSON.parse(localStorage.getItem('communityFirefighters') || '[]');
        } catch (e) {
            return [];
        }
    }

    // 保存消防员
    saveFirefighters() {
        localStorage.setItem('communityFirefighters', JSON.stringify(this.firefighters));
    }

    // 计算资源加成
    calculateResourceBonus() {
        let bonus = 0;
        const warehouseLevel = this.buildings.warehouse || 0;
        if (warehouseLevel > 0) {
            bonus = this.buildingData.warehouse.levels[warehouseLevel - 1].effect.resourceBonus;
        }
        return bonus;
    }

    // 生成候选人
    generateCandidates() {
        const names = ['李强', '王明', '张伟', '刘洋', '陈勇', '赵军', '孙磊', '周杰', '吴涛', '郑浩', '冯超', '袁波'];
        const traits = [
            { name: '勇敢', effect: 'courage', bonus: 10 },
            { name: '经验丰富', effect: 'experience', bonus: 15 },
            { name: '敏捷', effect: 'agility', bonus: 12 },
            { name: '智慧', effect: 'wisdom', bonus: 8 },
            { name: '强壮', effect: 'strength', bonus: 14 }
        ];

        return names.map(name => {
            const trait = traits[Math.floor(Math.random() * traits.length)];
            return {
                id: `candidate_${name}`,
                name: name,
                level: 1,
                experience: 0,
                stats: {
                    courage: Math.floor(Math.random() * 30) + 40,
                    agility: Math.floor(Math.random() * 30) + 40,
                    strength: Math.floor(Math.random() * 30) + 40,
                    wisdom: Math.floor(Math.random() * 30) + 40
                },
                trait: trait,
                cost: Math.floor(Math.random() * 500) + 200,
                status: 'available'
            };
        });
    }

    // 招募消防员
    recruitFirefighter(candidateId) {
        const candidate = this.firefighterCandidates.find(c => c.id === candidateId);
        if (!candidate || candidate.status !== 'available') return false;

        const maxFirefighters = this.getMaxFirefighters();
        if (this.firefighters.length >= maxFirefighters) return false;

        if (this.resources.gold < candidate.cost) return false;

        this.resources.gold -= candidate.cost;
        candidate.status = 'recruited';

        const newFirefighter = { ...candidate, id: `fighter_${Date.now()}` };
        this.firefighters.push(newFirefighter);

        this.saveResources();
        this.saveFirefighters();

        return newFirefighter;
    }

    // 获取最大消防员数量
    getMaxFirefighters() {
        const stationLevel = this.buildings.fireStation || 1;
        return this.buildingData.fireStation.levels[stationLevel - 1].effect.maxFirefighters;
    }

    // 获取最大技能等级
    getMaxSkillLevel() {
        const trainingLevel = this.buildings.trainingCenter || 0;
        if (trainingLevel === 0) return 1;
        return this.buildingData.trainingCenter.levels[trainingLevel - 1].effect.maxSkillLevel;
    }

    // 升级建筑
    upgradeBuilding(buildingId) {
        const building = this.buildingData[buildingId];
        const currentLevel = this.buildings[buildingId] || 0;

        if (currentLevel >= building.levels.length) return false;

        const nextLevel = building.levels[currentLevel];
        if (!nextLevel) return false;

        if (this.resources.gold < nextLevel.cost.gold ||
            this.resources.materials < nextLevel.cost.materials) {
            return false;
        }

        this.resources.gold -= nextLevel.cost.gold;
        this.resources.materials -= nextLevel.cost.materials;
        this.buildings[buildingId] = currentLevel + 1;

        this.resourceBonus = this.calculateResourceBonus();

        this.saveResources();
        this.saveBuildings();

        return true;
    }

    // 获取建筑当前等级信息
    getBuildingInfo(buildingId) {
        const building = this.buildingData[buildingId];
        const currentLevel = this.buildings[buildingId] || 0;

        return {
            ...building,
            currentLevel,
            currentData: currentLevel > 0 ? building.levels[currentLevel - 1] : null,
            nextLevel: currentLevel < building.levels.length ? building.levels[currentLevel] : null,
            isMaxLevel: currentLevel >= building.levels.length
        };
    }

    // 渲染社区UI
    renderCommunityUI(container) {
        container.innerHTML = '';

        // 资源显示
        const resourcesDiv = document.createElement('div');
        resourcesDiv.className = 'community-resources';
        resourcesDiv.innerHTML = `
            <div class="resource-item gold">
                <span class="resource-icon">💰</span>
                <span>金币:</span>
                <span class="resource-value">${this.resources.gold}</span>
            </div>
            <div class="resource-item materials">
                <span class="resource-icon">🧱</span>
                <span>建材:</span>
                <span class="resource-value">${this.resources.materials}</span>
            </div>
            <div class="resource-item reputation">
                <span class="resource-icon">⭐</span>
                <span>声望:</span>
                <span class="resource-value">${this.resources.reputation}</span>
            </div>
        `;
        container.appendChild(resourcesDiv);

        // 标签页
        const tabsDiv = document.createElement('div');
        tabsDiv.className = 'community-tabs';
        tabsDiv.innerHTML = `
            <button class="community-tab active" data-tab="buildings">🏢 建筑</button>
            <button class="community-tab" data-tab="firefighters">👨‍🚒 消防员</button>
            <button class="community-tab" data-tab="resources">📦 资源</button>
        `;
        container.appendChild(tabsDiv);

        // 内容区域
        const contentDiv = document.createElement('div');
        contentDiv.id = 'community-tab-content';
        container.appendChild(contentDiv);

        // 绑定标签事件
        tabsDiv.querySelectorAll('.community-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabsDiv.querySelectorAll('.community-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderTabContent(e.target.dataset.tab, contentDiv);
            });
        });

        // 显示默认内容
        this.renderTabContent('buildings', contentDiv);
    }

    // 渲染标签内容
    renderTabContent(tab, container) {
        container.innerHTML = '';

        switch (tab) {
            case 'buildings':
                this.renderBuildingsTab(container);
                break;
            case 'firefighters':
                this.renderFirefightersTab(container);
                break;
            case 'resources':
                this.renderResourcesTab(container);
                break;
        }
    }

    // 渲染建筑标签
    renderBuildingsTab(container) {
        Object.entries(this.buildingData).forEach(([id, building]) => {
            const info = this.getBuildingInfo(id);
            const canAfford = info.nextLevel &&
                this.resources.gold >= info.nextLevel.cost.gold &&
                this.resources.materials >= info.nextLevel.cost.materials;

            const buildingCard = document.createElement('div');
            buildingCard.className = `building-card ${info.currentLevel > 0 ? 'owned' : ''} ${canAfford ? 'can-upgrade' : ''}`;

            buildingCard.innerHTML = `
                <div class="building-header">
                    <span class="building-icon">${building.icon}</span>
                    <div class="building-info">
                        <h3>${building.name}</h3>
                        <p>${building.description}</p>
                    </div>
                    <div class="building-level">Lv.${info.currentLevel}/${building.levels.length}</div>
                </div>
                ${info.currentData ? `
                    <div class="building-current">
                        <span>当前: ${info.currentData.name}</span>
                        <span>${info.currentData.description}</span>
                    </div>
                ` : '<div class="building-status">未建造</div>'}
                ${info.nextLevel ? `
                    <div class="building-next">
                        <div class="next-info">
                            <span>下一级: ${info.nextLevel.name}</span>
                            <span>${info.nextLevel.description}</span>
                        </div>
                        <div class="upgrade-cost">
                            <span>💰 ${info.nextLevel.cost.gold}</span>
                            <span>🧱 ${info.nextLevel.cost.materials}</span>
                        </div>
                    </div>
                    ${canAfford ? `<button class="upgrade-btn" data-building="${id}">升级</button>` : ''}
                ` : '<div class="building-max">已达到最高等级</div>'}
            `;

            // 绑定升级事件
            const upgradeBtn = buildingCard.querySelector('.upgrade-btn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    if (this.upgradeBuilding(id)) {
                        this.renderCommunityUI(document.getElementById('community-content'));
                    }
                });
            }

            container.appendChild(buildingCard);
        });
    }

    // 渲染消防员标签
    renderFirefightersTab(container) {
        const maxFirefighters = this.getMaxFirefighters();
        const currentCount = this.firefighters.length;

        // 统计信息
        const statsDiv = document.createElement('div');
        statsDiv.className = 'firefighter-stats';
        statsDiv.innerHTML = `
            <div class="stat-item">
                <span>消防员:</span>
                <span>${currentCount}/${maxFirefighters}</span>
            </div>
        `;
        container.appendChild(statsDiv);

        // 已招募消防员
        const recruitedDiv = document.createElement('div');
        recruitedDiv.className = 'firefighter-section';
        recruitedDiv.innerHTML = '<h3>已招募</h3>';

        if (this.firefighters.length === 0) {
            recruitedDiv.innerHTML += '<p class="empty-message">暂无消防员</p>';
        } else {
            this.firefighters.forEach(fighter => {
                const fighterCard = this.createFirefighterCard(fighter, true);
                recruitedDiv.appendChild(fighterCard);
            });
        }
        container.appendChild(recruitedDiv);

        // 候选人
        const candidatesDiv = document.createElement('div');
        candidatesDiv.className = 'firefighter-section';
        candidatesDiv.innerHTML = '<h3>可招募</h3>';

        const availableCandidates = this.firefighterCandidates.filter(c => c.status === 'available');
        if (availableCandidates.length === 0) {
            candidatesDiv.innerHTML += '<p class="empty-message">暂无可用候选人</p>';
        } else {
            availableCandidates.forEach(candidate => {
                const candidateCard = this.createFirefighterCard(candidate, false);
                candidatesDiv.appendChild(candidateCard);
            });
        }
        container.appendChild(candidatesDiv);
    }

    // 创建消防员卡片
    createFirefighterCard(fighter, isRecruited) {
        const card = document.createElement('div');
        card.className = `firefighter-card ${isRecruited ? 'recruited' : 'candidate'}`;

        const maxSkill = this.getMaxSkillLevel();

        card.innerHTML = `
            <div class="fighter-header">
                <span class="fighter-avatar">${isRecruited ? '👨‍🚒' : '👤'}</span>
                <div class="fighter-info">
                    <h4>${fighter.name}</h4>
                    <span class="fighter-level">Lv.${fighter.level}/${maxSkill}</span>
                </div>
                ${!isRecruited ? `<span class="fighter-cost">💰 ${fighter.cost}</span>` : ''}
            </div>
            <div class="fighter-stats">
                <div class="stat-bar">
                    <span>勇敢</span>
                    <div class="stat-bar-fill">
                        <div class="stat-fill" style="width: ${fighter.stats.courage}%"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <span>敏捷</span>
                    <div class="stat-bar-fill">
                        <div class="stat-fill" style="width: ${fighter.stats.agility}%"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <span>力量</span>
                    <div class="stat-bar-fill">
                        <div class="stat-fill" style="width: ${fighter.stats.strength}%"></div>
                    </div>
                </div>
                <div class="stat-bar">
                    <span>智慧</span>
                    <div class="stat-bar-fill">
                        <div class="stat-fill" style="width: ${fighter.stats.wisdom}%"></div>
                    </div>
                </div>
            </div>
            <div class="fighter-trait">
                <span class="trait-badge">${fighter.trait.name}</span>
                <span class="trait-effect">${fighter.trait.effect}: +${fighter.trait.bonus}</span>
            </div>
            ${!isRecruited ? `<button class="recruit-btn" data-id="${fighter.id}">招募</button>` : ''}
        `;

        // 绑定招募事件
        const recruitBtn = card.querySelector('.recruit-btn');
        if (recruitBtn) {
            recruitBtn.addEventListener('click', () => {
                if (this.recruitFirefighter(fighter.id)) {
                    this.renderCommunityUI(document.getElementById('community-content'));
                }
            });
        }

        return card;
    }

    // 渲染资源标签
    renderResourcesTab(container) {
        const resourceInfo = [
            {
                icon: '💰',
                name: '金币',
                description: '用于升级建筑和招募消防员',
                sources: ['完成任务获得', '每日奖励', '声望兑换']
            },
            {
                icon: '🧱',
                name: '建材',
                description: '用于升级建筑设施',
                sources: ['完成任务获得', '每日奖励', '商城兑换']
            },
            {
                icon: '⭐',
                name: '声望',
                description: '解锁特殊功能和奖励',
                sources: ['完成任务', '救援人员', '保护建筑']
            }
        ];

        resourceInfo.forEach(resource => {
            const resourceCard = document.createElement('div');
            resourceCard.className = 'resource-info-card';
            resourceCard.innerHTML = `
                <div class="resource-info-header">
                    <span class="resource-info-icon">${resource.icon}</span>
                    <h3>${resource.name}</h3>
                </div>
                <p>${resource.description}</p>
                <div class="resource-sources">
                    <strong>获取方式:</strong>
                    <ul>
                        ${resource.sources.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            `;
            container.appendChild(resourceCard);
        });

        // 每日资源产出
        const productionDiv = document.createElement('div');
        productionDiv.className = 'daily-production';
        productionDiv.innerHTML = `
            <h3>📅 每日产出</h3>
            <p>根据建筑等级每日自动产出资源</p>
            <div class="production-list">
                <div class="production-item">
                    <span>金币:</span>
                    <span>+${this.calculateDailyProduction('gold')} 🔥</span>
                </div>
                <div class="production-item">
                    <span>建材:</span>
                    <span>+${this.calculateDailyProduction('materials')} 🔥</span>
                </div>
            </div>
            <button class="collect-btn" id="collect-daily">收集今日资源</button>
        `;

        const collectBtn = productionDiv.querySelector('#collect-daily');
        collectBtn.addEventListener('click', () => {
            this.collectDailyResources();
            this.renderCommunityUI(document.getElementById('community-content'));
        });

        container.appendChild(productionDiv);
    }

    // 计算每日产出
    calculateDailyProduction(resourceType) {
        let base = 0;

        if (resourceType === 'gold') {
            base = 50 + (this.buildings.fireStation || 1) * 20;
        } else if (resourceType === 'materials') {
            base = 10 + (this.buildings.warehouse || 0) * 15;
        }

        const bonus = Math.floor(base * this.resourceBonus);
        return base + bonus;
    }

    // 收集每日资源
    collectDailyResources() {
        const lastCollect = localStorage.getItem('lastResourceCollect');
        const today = new Date().toDateString();

        if (lastCollect === today) {
            alert('今日已收集，请明天再来！');
            return;
        }

        this.resources.gold += this.calculateDailyProduction('gold');
        this.resources.materials += this.calculateDailyProduction('materials');

        localStorage.setItem('lastResourceCollect', today);
        this.saveResources();

        alert(`收集成功！获得 ${this.calculateDailyProduction('gold')} 金币和 ${this.calculateDailyProduction('materials')} 建材`);
    }

    // 添加资源
    addResource(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;
            this.saveResources();
        }
    }

    // 添加声望
    addReputation(amount) {
        this.resources.reputation += amount;
        this.saveResources();
    }
}
