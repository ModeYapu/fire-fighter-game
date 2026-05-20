/**
 * 战役模式系统 (Campaign Mode)
 * 5个章节，每章3关，共15关
 * 包含剧情对话系统、章节解锁条件
 */
export class CampaignSystem {
    constructor(game) {
        this.game = game;
        this.currentChapter = 0;
        this.currentLevel = 0;
        this.unlockedChapters = [0]; // 第一章默认解锁
        this.completedLevels = this.loadProgress();

        // 章节数据
        this.chapters = [
            {
                id: 0,
                name: '第一章：居民区危机',
                subtitle: 'Residential District Crisis',
                icon: '🏘️',
                description: '老旧的居民区突发火灾，多栋建筑受到威胁。作为新晋消防队长，你需要在火势蔓延前拯救更多建筑！',
                unlockCondition: null,
                levels: [
                    {
                        id: 'c1-1',
                        name: '紧急出动',
                        description: '居民区首次报告火情，立即响应！',
                        buildings: [
                            { type: 'WOOD', x: 300, y: 400, initialFire: true },
                        ],
                        initialFires: [0],
                        initialWater: 1000,
                        time: 45,
                        targetScore: 500,
                        wind: 0,
                        scene: 'residential',
                    },
                    {
                        id: 'c1-2',
                        name: '邻里互助',
                        description: '火势开始蔓延，保护相邻建筑！',
                        buildings: [
                            { type: 'WOOD', x: 150, y: 400, initialFire: true },
                            { type: 'WOOD', x: 350, y: 400, initialFire: false },
                            { type: 'BRICK', x: 550, y: 380, initialFire: true },
                        ],
                        initialFires: [0, 2],
                        initialWater: 1500,
                        time: 60,
                        targetScore: 1200,
                        wind: 1,
                        scene: 'residential',
                    },
                    {
                        id: 'c1-3',
                        name: '社区大撤离',
                        description: '整个社区陷入火海，完成最终救援！',
                        buildings: [
                            { type: 'WOOD', x: 80, y: 400, initialFire: true },
                            { type: 'BRICK', x: 250, y: 390, initialFire: true },
                            { type: 'WOOD', x: 420, y: 400, initialFire: true },
                            { type: 'BRICK', x: 590, y: 380, initialFire: false },
                        ],
                        initialFires: [0, 1, 2],
                        initialWater: 2000,
                        time: 90,
                        targetScore: 2000,
                        wind: 2,
                        scene: 'residential',
                    },
                ],
                dialogues: {
                    start: [
                        { speaker: '指挥中心', text: '紧急情况！居民区发生火灾，请立即出动！' },
                        { speaker: '队长', text: '收到！全体队员，准备出发！' },
                    ],
                    complete: [
                        { speaker: '指挥中心', text: '出色完成！居民区安全了。' },
                        { speaker: '队长', text: '这是我们应该做的。' },
                    ],
                },
            },
            {
                id: 1,
                name: '第二章：化工厂险情',
                subtitle: 'Chemical Plant Danger',
                icon: '🏭',
                description: '化工厂发生泄漏并引发火灾，有毒气体扩散风险极高。必须谨慎操作，避免爆炸！',
                unlockCondition: { chapter: 0, stars: 5 }, // 需要第一章获得5星以上
                levels: [
                    {
                        id: 'c2-1',
                        name: '化学品泄漏',
                        description: '储罐区发现泄漏，火势正在逼近！',
                        buildings: [
                            { type: 'HIGH_RISE', x: 200, y: 350, initialFire: true },
                            { type: 'HIGH_RISE', x: 450, y: 350, initialFire: false },
                        ],
                        initialFires: [0],
                        initialWater: 1200,
                        time: 50,
                        targetScore: 800,
                        wind: 0,
                        scene: 'chemical',
                        hazards: ['chemical_leak'],
                    },
                    {
                        id: 'c2-2',
                        name: '爆炸边缘',
                        description: '多个储罐起火，防止连锁爆炸！',
                        buildings: [
                            { type: 'HIGH_RISE', x: 120, y: 340, initialFire: true },
                            { type: 'HIGH_RISE', x: 300, y: 350, initialFire: true },
                            { type: 'HIGH_RISE', x: 480, y: 340, initialFire: false },
                        ],
                        initialFires: [0, 1],
                        initialWater: 1800,
                        time: 70,
                        targetScore: 1500,
                        wind: 3,
                        scene: 'chemical',
                        hazards: ['explosion_risk'],
                    },
                    {
                        id: 'c2-3',
                        name: '全面封锁',
                        description: '化工厂全面起火，这是最后的防线！',
                        buildings: [
                            { type: 'BRICK', x: 60, y: 380, initialFire: true },
                            { type: 'HIGH_RISE', x: 230, y: 330, initialFire: true },
                            { type: 'HIGH_RISE', x: 400, y: 340, initialFire: true },
                            { type: 'BRICK', x: 570, y: 380, initialFire: true },
                        ],
                        initialFires: [0, 1, 2, 3],
                        initialWater: 2500,
                        time: 100,
                        targetScore: 2500,
                        wind: 4,
                        scene: 'chemical',
                        hazards: ['explosion_risk', 'toxic_gas'],
                    },
                ],
                dialogues: {
                    start: [
                        { speaker: '指挥中心', text: '化工厂报警！可能有有毒化学品泄漏！' },
                        { speaker: '专家', text: '建议使用泡沫灭火器，小心爆炸！' },
                        { speaker: '队长', text: '了解！全员穿戴防护装备！' },
                    ],
                    complete: [
                        { speaker: '指挥中心', text: '危机解除！你们的处置非常专业！' },
                        { speaker: '专家', text: '没有发生爆炸，真是万幸。' },
                    ],
                },
            },
            {
                id: 2,
                name: '第三章：森林大火',
                subtitle: 'Forest Fire',
                icon: '🌲',
                description: '干旱季节，森林火灾迅速蔓延。需要在有限资源下控制火势，保护野生动物栖息地！',
                unlockCondition: { chapter: 1, stars: 7 },
                levels: [
                    {
                        id: 'c3-1',
                        name: '林火初现',
                        description: '森林边缘发现火情，立即扑灭！',
                        buildings: [
                            { type: 'WOOD', x: 200, y: 400, initialFire: true },
                            { type: 'WOOD', x: 400, y: 400, initialFire: true },
                        ],
                        initialFires: [0, 1],
                        initialWater: 1500,
                        time: 55,
                        targetScore: 1000,
                        wind: 2,
                        scene: 'forest',
                        hazards: ['fast_spread'],
                    },
                    {
                        id: 'c3-2',
                        name: '火线推进',
                        description: '火势在大风下迅速推进，建立防火墙！',
                        buildings: [
                            { type: 'WOOD', x: 100, y: 400, initialFire: true },
                            { type: 'WOOD', x: 280, y: 400, initialFire: true },
                            { type: 'WOOD', x: 460, y: 400, initialFire: true },
                            { type: 'WOOD', x: 640, y: 400, initialFire: false },
                        ],
                        initialFires: [0, 1, 2],
                        initialWater: 2000,
                        time: 80,
                        targetScore: 1800,
                        wind: 5,
                        scene: 'forest',
                        hazards: ['fast_spread', 'wind_change'],
                    },
                    {
                        id: 'c3-3',
                        name: '生态救援',
                        description: '保护森林深处的野生动物栖息地！',
                        buildings: [
                            { type: 'BRICK', x: 50, y: 380, initialFire: true },
                            { type: 'WOOD', x: 200, y: 400, initialFire: true },
                            { type: 'HIGH_RISE', x: 370, y: 320, initialFire: false },
                            { type: 'WOOD', x: 520, y: 400, initialFire: true },
                            { type: 'BRICK', x: 670, y: 380, initialFire: true },
                        ],
                        initialFires: [0, 1, 3, 4],
                        initialWater: 2800,
                        time: 120,
                        targetScore: 3000,
                        wind: 6,
                        scene: 'forest',
                        hazards: ['fast_spread', 'wind_change', 'animals'],
                    },
                ],
                dialogues: {
                    start: [
                        { speaker: '护林员', text: '森林里发现多处起火点！风势正在增强！' },
                        { speaker: '队长', text: '这可能威胁到野生动物栖息地，必须阻止！' },
                    ],
                    complete: [
                        { speaker: '护林员', text: '感谢你们！森林保住了！' },
                        { speaker: '队长', text: '大自然是我们的朋友，保护它是我们的职责。' },
                    ],
                },
            },
            {
                id: 3,
                name: '第四章：摩天大楼',
                subtitle: 'Skyscraper Rescue',
                icon: '🏢',
                description: '市中心高层建筑发生火灾，数百人被困。需要精准的高空灭火作业！',
                unlockCondition: { chapter: 2, stars: 9 },
                levels: [
                    {
                        id: 'c4-1',
                        name: '低层疏散',
                        description: '大楼低层起火，协助疏散人群！',
                        buildings: [
                            { type: 'HIGH_RISE', x: 300, y: 300, initialFire: true },
                            { type: 'HIGH_RISE', x: 500, y: 300, initialFire: false },
                        ],
                        initialFires: [0],
                        initialWater: 1200,
                        time: 50,
                        targetScore: 900,
                        wind: 0,
                        scene: 'skyscraper',
                    },
                    {
                        id: 'c4-2',
                        name: '高空救援',
                        description: '火势向上蔓延，使用云梯设备！',
                        buildings: [
                            { type: 'HIGH_RISE', x: 200, y: 280, initialFire: true },
                            { type: 'HIGH_RISE', x: 380, y: 260, initialFire: true },
                            { type: 'HIGH_RISE', x: 560, y: 280, initialFire: false },
                        ],
                        initialFires: [0, 1],
                        initialWater: 2000,
                        time: 80,
                        targetScore: 1800,
                        wind: 2,
                        scene: 'skyscraper',
                    },
                    {
                        id: 'c4-3',
                        name: '顶楼决战',
                        description: '整栋大楼陷入火海，这是最后的救援机会！',
                        buildings: [
                            { type: 'HIGH_RISE', x: 100, y: 260, initialFire: true },
                            { type: 'HIGH_RISE', x: 260, y: 240, initialFire: true },
                            { type: 'HIGH_RISE', x: 420, y: 220, initialFire: true },
                            { type: 'HIGH_RISE', x: 580, y: 240, initialFire: true },
                        ],
                        initialFires: [0, 1, 2, 3],
                        initialWater: 3000,
                        time: 120,
                        targetScore: 3500,
                        wind: 3,
                        scene: 'skyscraper',
                    },
                ],
                dialogues: {
                    start: [
                        { speaker: '调度员', text: '市中心的摩天大楼起火！有多人被困！' },
                        { speaker: '队长', text: '立即调派云梯车和高空设备！' },
                        { speaker: '调度员', text: '收到，已经在路上了！' },
                    ],
                    complete: [
                        { speaker: '调度员', text: '所有人员已安全撤离！' },
                        { speaker: '队长', text: '干得好，队员们！' },
                    ],
                },
            },
            {
                id: 4,
                name: '第五章：地铁危机',
                subtitle: 'Subway Crisis',
                icon: '🚇',
                description: '地铁线路发生火灾，浓烟在隧道中扩散。这是最终的考验，真正的英雄时刻！',
                unlockCondition: { chapter: 3, stars: 11 },
                levels: [
                    {
                        id: 'c5-1',
                        name: '站台起火',
                        description: '地铁站台发现火情，乘客正在疏散！',
                        buildings: [
                            { type: 'BRICK', x: 150, y: 400, initialFire: true },
                            { type: 'HIGH_RISE', x: 350, y: 350, initialFire: true },
                            { type: 'BRICK', x: 550, y: 400, initialFire: false },
                        ],
                        initialFires: [0, 1],
                        initialWater: 1500,
                        time: 60,
                        targetScore: 1200,
                        wind: 1,
                        scene: 'subway',
                        hazards: ['smoke', 'low_visibility'],
                    },
                    {
                        id: 'c5-2',
                        name: '隧道烟雾',
                        description: '浓烟在隧道中扩散，能见度极低！',
                        buildings: [
                            { type: 'BRICK', x: 80, y: 380, initialFire: true },
                            { type: 'HIGH_RISE', x: 250, y: 340, initialFire: true },
                            { type: 'HIGH_RISE', x: 420, y: 340, initialFire: true },
                            { type: 'BRICK', x: 590, y: 380, initialFire: true },
                        ],
                        initialFires: [0, 1, 2, 3],
                        initialWater: 2200,
                        time: 90,
                        targetScore: 2200,
                        wind: 2,
                        scene: 'subway',
                        hazards: ['smoke', 'low_visibility', 'electricity'],
                    },
                    {
                        id: 'c5-3',
                        name: '最终决战',
                        description: '整个地铁系统陷入危机，全力以赴！',
                        buildings: [
                            { type: 'WOOD', x: 40, y: 400, initialFire: true },
                            { type: 'BRICK', x: 190, y: 370, initialFire: true },
                            { type: 'HIGH_RISE', x: 340, y: 310, initialFire: true },
                            { type: 'HIGH_RISE', x: 490, y: 310, initialFire: true },
                            { type: 'BRICK', x: 640, y: 370, initialFire: true },
                        ],
                        initialFires: [0, 1, 2, 3, 4],
                        initialWater: 3500,
                        time: 150,
                        targetScore: 4000,
                        wind: 4,
                        scene: 'subway',
                        hazards: ['smoke', 'low_visibility', 'electricity', 'explosion_risk'],
                    },
                ],
                dialogues: {
                    start: [
                        { speaker: '调度员', text: '紧急情况！地铁多站发生火灾！' },
                        { speaker: '队长', text: '这是最大的危机，启动紧急预案！' },
                        { speaker: '队员', text: '无论如何，我们一定要成功！' },
                    ],
                    mid: [
                        { speaker: '队员', text: '队长，情况越来越危险了！' },
                        { speaker: '队长', text: '坚持住，我们快成功了！' },
                    ],
                    complete: [
                        { speaker: '调度员', text: '地铁系统已恢复安全！你们做到了！' },
                        { speaker: '市长', text: '全市人民感谢你们的英勇表现！' },
                        { speaker: '队长', text: '这是我们消防员的使命。' },
                    ],
                },
            },
        ];
    }

    // 加载进度
    loadProgress() {
        try {
            const saved = localStorage.getItem('campaignProgress');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    // 保存进度
    saveProgress(levelId, stars, score) {
        if (!this.completedLevels[levelId] || this.completedLevels[levelId].stars < stars) {
            this.completedLevels[levelId] = { stars, score, completed: true };
            localStorage.setItem('campaignProgress', JSON.stringify(this.completedLevels));
            this.checkChapterUnlocks();
        }
    }

    // 检查章节解锁
    checkChapterUnlocks() {
        for (let i = 1; i < this.chapters.length; i++) {
            if (!this.unlockedChapters.includes(i)) {
                const chapter = this.chapters[i];
                if (this.meetsUnlockCondition(chapter.unlockCondition)) {
                    this.unlockedChapters.push(i);
                }
            }
        }
    }

    // 检查是否满足解锁条件
    meetsUnlockCondition(condition) {
        if (!condition) return true;

        let totalStars = 0;
        const prevChapter = this.chapters[condition.chapter];

        prevChapter.levels.forEach(level => {
            const progress = this.completedLevels[level.id];
            if (progress) totalStars += progress.stars;
        });

        return totalStars >= condition.stars;
    }

    // 获取章节总星数
    getChapterStars(chapterIndex) {
        const chapter = this.chapters[chapterIndex];
        let total = 0;
        chapter.levels.forEach(level => {
            const progress = this.completedLevels[level.id];
            if (progress) total += progress.stars;
        });
        return total;
    }

    // 显示战役菜单
    showCampaignMenu() {
        const container = document.getElementById('campaign-menu');
        const content = document.getElementById('campaign-content');
        if (!container || !content) return;

        content.innerHTML = '';
        container.style.display = 'flex';
        document.getElementById('main-menu').style.display = 'none';

        this.chapters.forEach((chapter, index) => {
            const isUnlocked = this.unlockedChapters.includes(index);
            const stars = this.getChapterStars(index);
            const maxStars = chapter.levels.length * 3;

            const chapterCard = document.createElement('div');
            chapterCard.className = `campaign-chapter ${isUnlocked ? '' : 'locked'}`;

            chapterCard.innerHTML = `
                <div class="chapter-header">
                    <span class="chapter-icon">${chapter.icon}</span>
                    <div class="chapter-info">
                        <h3>${chapter.name}</h3>
                        <p class="chapter-subtitle">${chapter.subtitle}</p>
                    </div>
                    ${isUnlocked ? `<div class="chapter-stars">⭐ ${stars}/${maxStars}</div>` : '<div class="chapter-lock">🔒</div>'}
                </div>
                <p class="chapter-desc">${chapter.description}</p>
                ${isUnlocked ? `<button class="chapter-select-btn" data-chapter="${index}">选择章节</button>` : ''}
            `;

            content.appendChild(chapterCard);
        });

        // 绑定事件
        content.querySelectorAll('.chapter-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chapterIndex = parseInt(e.target.dataset.chapter);
                this.showChapterLevelSelect(chapterIndex);
            });
        });
    }

    // 显示章节关卡选择
    showChapterLevelSelect(chapterIndex) {
        const chapter = this.chapters[chapterIndex];
        const container = document.getElementById('campaign-level-menu');
        const content = document.getElementById('campaign-level-content');
        if (!container || !content) return;

        content.innerHTML = '';
        container.style.display = 'flex';
        document.getElementById('campaign-menu').style.display = 'none';

        // 章节标题
        const header = document.createElement('div');
        header.className = 'chapter-level-header';
        header.innerHTML = `
            <button class="back-chapter-btn">← 返回章节</button>
            <h2>${chapter.icon} ${chapter.name}</h2>
        `;
        content.appendChild(header);

        // 关卡列表
        const levelList = document.createElement('div');
        levelList.className = 'campaign-level-list';

        chapter.levels.forEach((level, index) => {
            const progress = this.completedLevels[level.id];
            const isUnlocked = index === 0 || this.completedLevels[chapter.levels[index - 1].id]?.completed;

            const levelCard = document.createElement('div');
            levelCard.className = `campaign-level-card ${isUnlocked ? '' : 'locked'}`;

            levelCard.innerHTML = `
                <div class="level-number">${index + 1}</div>
                <div class="level-info">
                    <h4>${level.name}</h4>
                    <p>${level.description}</p>
                </div>
                ${progress ? `<div class="level-stars">${'⭐'.repeat(progress.stars)}${'☆'.repeat(3 - progress.stars)}</div>` : ''}
                ${isUnlocked ? `<button class="level-play-btn" data-level="${level.id}" data-index="${chapterIndex}-${index}">开始</button>` : '<div class="level-lock">🔒</div>'}
            `;

            levelList.appendChild(levelCard);
        });

        content.appendChild(levelList);

        // 绑定事件
        header.querySelector('.back-chapter-btn').addEventListener('click', () => {
            container.style.display = 'none';
            this.showCampaignMenu();
        });

        content.querySelectorAll('.level-play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const [chapterIdx, levelIdx] = e.target.dataset.index.split('-').map(Number);
                this.startCampaignLevel(chapterIdx, levelIdx);
            });
        });
    }

    // 开始战役关卡
    startCampaignLevel(chapterIndex, levelIndex) {
        const chapter = this.chapters[chapterIndex];
        const level = chapter.levels[levelIndex];

        this.currentChapter = chapterIndex;
        this.currentLevel = levelIndex;

        // 显示开始对话
        this.showDialogue(chapter.dialogues.start, () => {
            // 启动关卡
            document.getElementById('campaign-level-menu').style.display = 'none';
            this.startLevel(level);
        });
    }

    // 启动关卡
    startLevel(levelData) {
        // 临时添加到全局关卡数据
        const originalIndex = window.game?.currentLevel || 0;

        // 创建临时关卡数据
        const tempLevelData = {
            ...levelData,
            buildings: levelData.buildings.map(b => ({
                type: b.type,
                x: b.x,
                y: b.y,
                initialFire: b.initialFire
            }))
        };

        // 设置场景
        if (window.game?.weatherSystem) {
            window.game.weatherSystem.setScene(levelData.scene);
        }

        // 开始游戏
        window.game?.startLevelWithCustomData(tempLevelData);
        window.game?.campaignSystem?.setActiveLevel(levelData.id);
    }

    // 设置当前活动关卡
    setActiveLevel(levelId) {
        this.activeLevelId = levelId;
    }

    // 显示对话
    showDialogue(dialogues, callback) {
        const container = document.getElementById('dialogue-container');
        if (!container) {
            this.createDialogueContainer();
            return this.showDialogue(dialogues, callback);
        }

        container.style.display = 'flex';
        let index = 0;

        const showDialogueItem = () => {
            if (index >= dialogues.length) {
                container.style.display = 'none';
                if (callback) callback();
                return;
            }

            const dialogue = dialogues[index];
            container.innerHTML = `
                <div class="dialogue-box">
                    <div class="dialogue-speaker">${dialogue.speaker}</div>
                    <div class="dialogue-text">${dialogue.text}</div>
                    <button class="dialogue-next">继续 ▶</button>
                    <div class="dialogue-progress">${index + 1}/${dialogues.length}</div>
                </div>
            `;

            container.querySelector('.dialogue-next').addEventListener('click', () => {
                index++;
                showDialogueItem();
            });
        };

        showDialogueItem();
    }

    // 创建对话容器
    createDialogueContainer() {
        const container = document.createElement('div');
        container.id = 'dialogue-container';
        container.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        document.getElementById('game-container').appendChild(container);
    }

    // 关卡完成
    onLevelComplete(stars, score) {
        if (this.activeLevelId) {
            this.saveProgress(this.activeLevelId, stars, score);

            const chapter = this.chapters[this.currentChapter];

            // 显示完成对话
            setTimeout(() => {
                this.showDialogue(chapter.dialogues.complete, () => {
                    // 检查是否有下一关
                    if (this.currentLevel < chapter.levels.length - 1) {
                        this.showChapterLevelSelect(this.currentChapter);
                    } else {
                        // 章节完成
                        this.showChapterComplete(chapter);
                    }
                });
            }, 1000);
        }
    }

    // 显示章节完成
    showChapterComplete(chapter) {
        const container = document.getElementById('chapter-complete-modal');
        if (!container) {
            this.createChapterCompleteModal();
            return this.showChapterComplete(chapter);
        }

        const stars = this.getChapterStars(this.currentChapter);
        const maxStars = chapter.levels.length * 3;

        container.innerHTML = `
            <div class="chapter-complete-content">
                <div class="complete-icon">🎉</div>
                <h2>章节完成！</h2>
                <h3>${chapter.name}</h3>
                <div class="complete-stars">${'⭐'.repeat(Math.floor(stars / 3))}${'☆'.repeat(Math.floor((maxStars - stars) / 3))}</div>
                <p class="complete-message">恭喜你完成了这一章节！</p>
                <div class="complete-buttons">
                    <button class="complete-back-btn">返回章节选择</button>
                    ${this.currentChapter < this.chapters.length - 1 ? '<button class="complete-next-btn">下一章节</button>' : ''}
                </div>
            </div>
        `;

        container.style.display = 'flex';

        container.querySelector('.complete-back-btn').addEventListener('click', () => {
            container.style.display = 'none';
            this.showCampaignMenu();
        });

        const nextBtn = container.querySelector('.complete-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                container.style.display = 'none';
                this.showChapterLevelSelect(this.currentChapter + 1);
            });
        }
    }

    // 创建章节完成弹窗
    createChapterCompleteModal() {
        const container = document.createElement('div');
        container.id = 'chapter-complete-modal';
        container.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            justify-content: center;
            align-items: center;
            z-index: 1001;
        `;

        document.getElementById('game-container').appendChild(container);
    }

    // 获取场景样式
    getSceneStyles(scene) {
        const sceneStyles = {
            residential: {
                bgTop: '#1a1a2e',
                bgBottom: '#16213e',
                ground: '#2d3436',
            },
            chemical: {
                bgTop: '#1a1a1a',
                bgBottom: '#2d2d2d',
                ground: '#3d3d3d',
            },
            forest: {
                bgTop: '#0a2a1a',
                bgBottom: '#1a3a2a',
                ground: '#2a4a3a',
            },
            skyscraper: {
                bgTop: '#0a1a3a',
                bgBottom: '#1a2a4a',
                ground: '#3a4a6a',
            },
            subway: {
                bgTop: '#1a1a1a',
                bgBottom: '#0a0a0a',
                ground: '#2a2a2a',
            },
        };

        return sceneStyles[scene] || sceneStyles.residential;
    }
}
