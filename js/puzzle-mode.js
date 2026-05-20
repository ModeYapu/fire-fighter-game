/**
 * 谜题模式系统 (Puzzle Mode)
 * 20个预设谜题 + 评分系统 + 谜题编辑器
 * 考验玩家在有限资源下的策略思维
 */
export class PuzzleMode {
    constructor(game) {
        this.game = game;
        this.currentPuzzleIndex = 0;
        this.completedPuzzles = this.loadProgress();
        this.puzzles = this.initPuzzles();
        this.editor = new PuzzleEditor(this);
        this.scorer = new PuzzleScorer();
        this.activePuzzle = null;
        this.puzzleState = null;
        this.startTime = 0;
    }

    /**
     * 初始化20个预设谜题
     * 分为4个难度等级，每个5关
     */
    initPuzzles() {
        return [
            // ===== 入门级 (Easy) =====
            {
                id: 'p01',
                name: '初试身手',
                description: '扑灭一栋燃烧的建筑。水很充足，不用担心。',
                difficulty: 'easy',
                icon: '🔥',
                buildings: [
                    { type: 'WOOD', x: 400, y: 400, width: 60, height: 80, initialFire: true, hp: 100 },
                ],
                availableWater: 2000,
                timeLimit: 60,
                maxMoves: 0, // 0 = 不限步数
                target: { minBuildingsSaved: 1, minScore: 300 },
                stars: { one: 300, two: 500, three: 700 },
                hints: ['直接瞄准起火建筑喷水即可'],
                unlocked: true,
                reward: { coins: 50, exp: 20 },
            },
            {
                id: 'p02',
                name: '左右为难',
                description: '两栋建筑同时起火！水有限，必须做出取舍。',
                difficulty: 'easy',
                icon: '🏘️',
                buildings: [
                    { type: 'WOOD', x: 200, y: 400, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'WOOD', x: 600, y: 400, width: 60, height: 80, initialFire: true, hp: 100 },
                ],
                availableWater: 1500,
                timeLimit: 45,
                maxMoves: 0,
                target: { minBuildingsSaved: 1, minScore: 400 },
                stars: { one: 400, two: 600, three: 800 },
                hints: ['先扑灭较近的建筑，节省水量'],
                unlocked: false,
                reward: { coins: 60, exp: 25 },
            },
            {
                id: 'p03',
                name: '风力助阵',
                description: '风向有利，利用它来阻止火势蔓延！',
                difficulty: 'easy',
                icon: '💨',
                buildings: [
                    { type: 'WOOD', x: 300, y: 400, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'BRICK', x: 550, y: 380, width: 70, height: 90, initialFire: false, hp: 150 },
                ],
                availableWater: 1200,
                timeLimit: 50,
                maxMoves: 0,
                target: { minBuildingsSaved: 2, minScore: 500 },
                stars: { one: 500, two: 700, three: 900 },
                hints: ['风向会把火推向右侧砖房，先救左侧木房'],
                unlocked: false,
                wind: { direction: 90, speed: 2 },
                reward: { coins: 70, exp: 30 },
            },
            {
                id: 'p04',
                name: '水塔救援',
                description: '保护中央水塔不被烧毁，它是唯一的水源补给点。',
                difficulty: 'easy',
                icon: '🗼',
                buildings: [
                    { type: 'WOOD', x: 150, y: 400, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'STEEL', x: 400, y: 350, width: 40, height: 100, initialFire: false, hp: 200, isWaterTower: true },
                    { type: 'WOOD', x: 650, y: 400, width: 50, height: 70, initialFire: true, hp: 80 },
                ],
                availableWater: 1000,
                timeLimit: 55,
                maxMoves: 0,
                target: { minBuildingsSaved: 2, minScore: 600 },
                stars: { one: 600, two: 800, three: 1000 },
                hints: ['保护水塔可以持续补水'],
                unlocked: false,
                reward: { coins: 80, exp: 35 },
            },
            {
                id: 'p05',
                name: '连锁反应',
                description: '火势在相邻建筑间快速传播，截断传播链！',
                difficulty: 'easy',
                icon: '⛓️',
                buildings: [
                    { type: 'WOOD', x: 100, y: 400, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 200, y: 400, width: 50, height: 70, initialFire: false, hp: 80 },
                    { type: 'WOOD', x: 300, y: 400, width: 50, height: 70, initialFire: false, hp: 80 },
                    { type: 'WOOD', x: 400, y: 400, width: 50, height: 70, initialFire: false, hp: 80 },
                    { type: 'BRICK', x: 500, y: 390, width: 60, height: 80, initialFire: false, hp: 120 },
                ],
                availableWater: 1800,
                timeLimit: 60,
                maxMoves: 0,
                target: { minBuildingsSaved: 3, minScore: 700 },
                stars: { one: 700, two: 1000, three: 1300 },
                hints: ['在中间截断火势传播，保护右侧建筑'],
                unlocked: false,
                wind: { direction: 0, speed: 1 },
                reward: { coins: 90, exp: 40 },
            },

            // ===== 中级 (Medium) =====
            {
                id: 'p06',
                name: '化工厂危机',
                description: '化学品仓库起火，必须阻止爆炸！只有很少的水。',
                difficulty: 'medium',
                icon: '☣️',
                buildings: [
                    { type: 'STEEL', x: 400, y: 350, width: 80, height: 100, initialFire: true, hp: 200, isChemical: true },
                    { type: 'WOOD', x: 200, y: 400, width: 60, height: 80, initialFire: false, hp: 100 },
                    { type: 'WOOD', x: 600, y: 400, width: 60, height: 80, initialFire: false, hp: 100 },
                ],
                availableWater: 800,
                timeLimit: 40,
                maxMoves: 15,
                target: { minBuildingsSaved: 2, minScore: 800 },
                stars: { one: 800, two: 1100, three: 1400 },
                hints: ['化学品建筑必须优先扑灭，否则爆炸会引燃周边'],
                unlocked: false,
                reward: { coins: 100, exp: 50 },
            },
            {
                id: 'p07',
                name: '迷宫巷道',
                description: '狭窄的巷道中多栋建筑密集排列，火势极易蔓延。',
                difficulty: 'medium',
                icon: '🏗️',
                buildings: [
                    { type: 'WOOD', x: 100, y: 350, width: 40, height: 60, initialFire: true, hp: 70 },
                    { type: 'BRICK', x: 170, y: 350, width: 40, height: 60, initialFire: false, hp: 100 },
                    { type: 'WOOD', x: 240, y: 350, width: 40, height: 60, initialFire: true, hp: 70 },
                    { type: 'WOOD', x: 310, y: 350, width: 40, height: 60, initialFire: false, hp: 70 },
                    { type: 'WOOD', x: 380, y: 350, width: 40, height: 60, initialFire: false, hp: 70 },
                    { type: 'BRICK', x: 450, y: 350, width: 40, height: 60, initialFire: true, hp: 100 },
                    { type: 'WOOD', x: 520, y: 350, width: 40, height: 60, initialFire: false, hp: 70 },
                ],
                availableWater: 1200,
                timeLimit: 50,
                maxMoves: 20,
                target: { minBuildingsSaved: 4, minScore: 900 },
                stars: { one: 900, two: 1200, three: 1500 },
                hints: ['先扑灭砖房之间的火源，利用砖房做防火隔离'],
                unlocked: false,
                reward: { coins: 110, exp: 55 },
            },
            {
                id: 'p08',
                name: '逆向操作',
                description: '只有有限步数，每一步都必须精准！',
                difficulty: 'medium',
                icon: '🎯',
                buildings: [
                    { type: 'BRICK', x: 200, y: 400, width: 60, height: 80, initialFire: true, hp: 120 },
                    { type: 'BRICK', x: 400, y: 400, width: 60, height: 80, initialFire: true, hp: 120 },
                    { type: 'BRICK', x: 600, y: 400, width: 60, height: 80, initialFire: false, hp: 120 },
                ],
                availableWater: 2000,
                timeLimit: 90,
                maxMoves: 8,
                target: { minBuildingsSaved: 2, minScore: 800 },
                stars: { one: 800, two: 1000, three: 1300 },
                hints: ['8步以内扑灭两栋建筑，合理分配每步的水量'],
                unlocked: false,
                reward: { coins: 120, exp: 60 },
            },
            {
                id: 'p09',
                name: '水源枯竭',
                description: '水源有限且无法补充，珍惜每一滴水！',
                difficulty: 'medium',
                icon: '💧',
                buildings: [
                    { type: 'WOOD', x: 150, y: 400, width: 50, height: 70, initialFire: true, hp: 90 },
                    { type: 'WOOD', x: 300, y: 400, width: 50, height: 70, initialFire: true, hp: 90 },
                    { type: 'BRICK', x: 500, y: 390, width: 60, height: 80, initialFire: false, hp: 110 },
                    { type: 'WOOD', x: 650, y: 400, width: 50, height: 70, initialFire: true, hp: 90 },
                ],
                availableWater: 600,
                timeLimit: 45,
                maxMoves: 10,
                target: { minBuildingsSaved: 2, minScore: 700 },
                stars: { one: 700, two: 900, three: 1200 },
                hints: ['水非常少，放弃距离远的，集中扑灭近处建筑'],
                unlocked: false,
                reward: { coins: 130, exp: 65 },
            },
            {
                id: 'p10',
                name: '双线作战',
                description: '两个独立的火场需要同时处理，分散你的资源！',
                difficulty: 'medium',
                icon: '⚔️',
                buildings: [
                    { type: 'WOOD', x: 100, y: 300, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 200, y: 300, width: 50, height: 70, initialFire: false, hp: 80 },
                    { type: 'WOOD', x: 500, y: 450, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 600, y: 450, width: 50, height: 70, initialFire: false, hp: 80 },
                ],
                availableWater: 1500,
                timeLimit: 50,
                maxMoves: 12,
                target: { minBuildingsSaved: 3, minScore: 1000 },
                stars: { one: 1000, two: 1300, three: 1600 },
                hints: ['在两个火场间分配行动次数，不能只顾一边'],
                unlocked: false,
                wind: { direction: 0, speed: 1 },
                reward: { coins: 140, exp: 70 },
            },

            // ===== 高级 (Hard) =====
            {
                id: 'p11',
                name: '烈风之城',
                description: '强风不断改变方向，火势不可预测！',
                difficulty: 'hard',
                icon: '🌪️',
                buildings: [
                    { type: 'WOOD', x: 150, y: 400, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 300, y: 350, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'BRICK', x: 450, y: 380, width: 60, height: 80, initialFire: false, hp: 110 },
                    { type: 'WOOD', x: 600, y: 400, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 700, y: 350, width: 50, height: 70, initialFire: false, hp: 80 },
                ],
                availableWater: 1000,
                timeLimit: 50,
                maxMoves: 12,
                target: { minBuildingsSaved: 3, minScore: 1100 },
                stars: { one: 1100, two: 1400, three: 1800 },
                hints: ['注意风向变化，及时调整策略'],
                unlocked: false,
                wind: { direction: 'variable', speed: 3, changeInterval: 10 },
                reward: { coins: 150, exp: 80 },
            },
            {
                id: 'p12',
                name: '爆炸连锁',
                description: '多栋化学品建筑，一个爆炸就会引发连锁反应！',
                difficulty: 'hard',
                icon: '💥',
                buildings: [
                    { type: 'STEEL', x: 200, y: 380, width: 50, height: 70, initialFire: true, hp: 150, isChemical: true },
                    { type: 'WOOD', x: 320, y: 400, width: 50, height: 70, initialFire: false, hp: 80 },
                    { type: 'STEEL', x: 440, y: 380, width: 50, height: 70, initialFire: false, hp: 150, isChemical: true },
                    { type: 'WOOD', x: 560, y: 400, width: 50, height: 70, initialFire: false, hp: 80 },
                    { type: 'STEEL', x: 680, y: 380, width: 50, height: 70, initialFire: true, hp: 150, isChemical: true },
                ],
                availableWater: 1200,
                timeLimit: 55,
                maxMoves: 15,
                target: { minBuildingsSaved: 3, minScore: 1200 },
                stars: { one: 1200, two: 1600, three: 2000 },
                hints: ['化学品间距较近，爆炸会波及邻居。先扑灭已着火的化学仓库'],
                unlocked: false,
                reward: { coins: 160, exp: 85 },
            },
            {
                id: 'p13',
                name: '时间竞赛',
                description: '极度有限的时间，快速决策是关键！',
                difficulty: 'hard',
                icon: '⏱️',
                buildings: [
                    { type: 'WOOD', x: 200, y: 400, width: 50, height: 70, initialFire: true, hp: 70 },
                    { type: 'WOOD', x: 350, y: 400, width: 50, height: 70, initialFire: true, hp: 70 },
                    { type: 'BRICK', x: 500, y: 390, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'WOOD', x: 650, y: 400, width: 50, height: 70, initialFire: false, hp: 70 },
                ],
                availableWater: 2000,
                timeLimit: 25,
                maxMoves: 0,
                target: { minBuildingsSaved: 3, minScore: 1000 },
                stars: { one: 1000, two: 1400, three: 1800 },
                hints: ['只有25秒！别犹豫，快速连续喷水'],
                unlocked: false,
                reward: { coins: 170, exp: 90 },
            },
            {
                id: 'p14',
                name: '孤岛求生',
                description: '一座医院被大火包围，从四个方向同时进攻！',
                difficulty: 'hard',
                icon: '🏥',
                buildings: [
                    { type: 'WOOD', x: 400, y: 200, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 200, y: 350, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'CONCRETE', x: 400, y: 350, width: 80, height: 100, initialFire: false, hp: 200, isHospital: true },
                    { type: 'WOOD', x: 600, y: 350, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 400, y: 500, width: 50, height: 70, initialFire: true, hp: 80 },
                ],
                availableWater: 1500,
                timeLimit: 60,
                maxMoves: 18,
                target: { minBuildingsSaved: 2, minScore: 1300 },
                stars: { one: 1300, two: 1700, three: 2100 },
                hints: ['医院不可失守！先清除靠近医院的火源'],
                unlocked: false,
                reward: { coins: 180, exp: 95 },
            },
            {
                id: 'p15',
                name: '资源调度',
                description: '多个水栓，需要在正确的时机切换使用。',
                difficulty: 'hard',
                icon: '🔄',
                buildings: [
                    { type: 'WOOD', x: 100, y: 300, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 250, y: 350, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'BRICK', x: 400, y: 300, width: 60, height: 80, initialFire: false, hp: 100 },
                    { type: 'WOOD', x: 550, y: 350, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'WOOD', x: 700, y: 300, width: 50, height: 70, initialFire: false, hp: 80 },
                ],
                availableWater: 900,
                timeLimit: 50,
                maxMoves: 10,
                target: { minBuildingsSaved: 3, minScore: 1200 },
                stars: { one: 1200, two: 1500, three: 1900 },
                hints: ['水量极少，让砖房做天然防火墙，集中处理一侧'],
                unlocked: false,
                wind: { direction: 270, speed: 2 },
                reward: { coins: 190, exp: 100 },
            },

            // ===== 大师级 (Master) =====
            {
                id: 'p16',
                name: '末日狂潮',
                description: '全城火海，在混乱中拯救关键建筑！',
                difficulty: 'master',
                icon: '🌋',
                buildings: [
                    { type: 'WOOD', x: 80, y: 300, width: 50, height: 70, initialFire: true, hp: 70 },
                    { type: 'WOOD', x: 180, y: 350, width: 50, height: 70, initialFire: true, hp: 70 },
                    { type: 'BRICK', x: 280, y: 300, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'CONCRETE', x: 380, y: 350, width: 70, height: 90, initialFire: false, hp: 150, isKey: true },
                    { type: 'BRICK', x: 480, y: 300, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'WOOD', x: 580, y: 350, width: 50, height: 70, initialFire: true, hp: 70 },
                    { type: 'WOOD', x: 680, y: 300, width: 50, height: 70, initialFire: true, hp: 70 },
                ],
                availableWater: 1200,
                timeLimit: 60,
                maxMoves: 15,
                target: { minBuildingsSaved: 3, minScore: 1500 },
                stars: { one: 1500, two: 2000, three: 2500 },
                hints: ['关键建筑周围建立防线，放弃边远木房'],
                unlocked: false,
                wind: { direction: 'variable', speed: 2, changeInterval: 15 },
                reward: { coins: 200, exp: 120 },
            },
            {
                id: 'p17',
                name: '一步之差',
                description: '极度有限的行动次数，每一步都是生死抉择。',
                difficulty: 'master',
                icon: '♟️',
                buildings: [
                    { type: 'BRICK', x: 200, y: 350, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'STEEL', x: 350, y: 350, width: 50, height: 70, initialFire: true, hp: 130 },
                    { type: 'BRICK', x: 500, y: 350, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'BRICK', x: 350, y: 200, width: 60, height: 80, initialFire: false, hp: 100 },
                ],
                availableWater: 2000,
                timeLimit: 90,
                maxMoves: 5,
                target: { minBuildingsSaved: 3, minScore: 1400 },
                stars: { one: 1400, two: 1800, three: 2200 },
                hints: ['只有5步！考虑每步的最大覆盖范围'],
                unlocked: false,
                reward: { coins: 220, exp: 130 },
            },
            {
                id: 'p18',
                name: '化学风暴',
                description: '化学品仓库群连环爆炸，控制住局势！',
                difficulty: 'master',
                icon: '☢️',
                buildings: [
                    { type: 'STEEL', x: 150, y: 350, width: 50, height: 70, initialFire: true, hp: 120, isChemical: true },
                    { type: 'WOOD', x: 250, y: 400, width: 50, height: 70, initialFire: false, hp: 70 },
                    { type: 'STEEL', x: 350, y: 350, width: 50, height: 70, initialFire: true, hp: 120, isChemical: true },
                    { type: 'STEEL', x: 450, y: 350, width: 50, height: 70, initialFire: false, hp: 120, isChemical: true },
                    { type: 'WOOD', x: 550, y: 400, width: 50, height: 70, initialFire: false, hp: 70 },
                    { type: 'STEEL', x: 650, y: 350, width: 50, height: 70, initialFire: true, hp: 120, isChemical: true },
                ],
                availableWater: 800,
                timeLimit: 40,
                maxMoves: 8,
                target: { minBuildingsSaved: 3, minScore: 1600 },
                stars: { one: 1600, two: 2000, three: 2500 },
                hints: ['化学品间距近，一个爆炸全完。快速扑灭，来不及就放弃远处'],
                unlocked: false,
                reward: { coins: 250, exp: 140 },
            },
            {
                id: 'p19',
                name: '终极救援',
                description: '学校、医院、养老院同时受威胁，全部都要救！',
                difficulty: 'master',
                icon: '🎓',
                buildings: [
                    { type: 'CONCRETE', x: 150, y: 300, width: 80, height: 100, initialFire: false, hp: 180, isSchool: true },
                    { type: 'WOOD', x: 100, y: 400, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'CONCRETE', x: 400, y: 300, width: 80, height: 100, initialFire: false, hp: 180, isHospital: true },
                    { type: 'WOOD', x: 350, y: 420, width: 50, height: 70, initialFire: true, hp: 80 },
                    { type: 'CONCRETE', x: 650, y: 300, width: 80, height: 100, initialFire: false, hp: 180, isElderly: true },
                    { type: 'WOOD', x: 600, y: 420, width: 50, height: 70, initialFire: true, hp: 80 },
                ],
                availableWater: 1000,
                timeLimit: 60,
                maxMoves: 12,
                target: { minBuildingsSaved: 4, minScore: 1800 },
                stars: { one: 1800, two: 2300, three: 2800 },
                hints: ['所有公共建筑都必须存活。先扑灭靠近它们的火源'],
                unlocked: false,
                wind: { direction: 'variable', speed: 2, changeInterval: 12 },
                reward: { coins: 300, exp: 160 },
            },
            {
                id: 'p20',
                name: '烈焰终章',
                description: '最终考验！全城终极火海，证明你是传奇消防员！',
                difficulty: 'master',
                icon: '🏆',
                buildings: [
                    { type: 'WOOD', x: 80, y: 250, width: 50, height: 70, initialFire: true, hp: 70 },
                    { type: 'STEEL', x: 180, y: 300, width: 50, height: 70, initialFire: true, hp: 130, isChemical: true },
                    { type: 'BRICK', x: 280, y: 250, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'CONCRETE', x: 380, y: 300, width: 70, height: 90, initialFire: false, hp: 160, isHospital: true },
                    { type: 'WOOD', x: 480, y: 250, width: 50, height: 70, initialFire: true, hp: 70 },
                    { type: 'STEEL', x: 580, y: 300, width: 50, height: 70, initialFire: true, hp: 130, isChemical: true },
                    { type: 'BRICK', x: 680, y: 250, width: 60, height: 80, initialFire: true, hp: 100 },
                    { type: 'WOOD', x: 350, y: 420, width: 50, height: 70, initialFire: true, hp: 70 },
                ],
                availableWater: 1000,
                timeLimit: 55,
                maxMoves: 10,
                target: { minBuildingsSaved: 4, minScore: 2000 },
                stars: { one: 2000, two: 2600, three: 3200 },
                hints: ['这是最终挑战。先控制化学品，保护医院，利用一切条件'],
                unlocked: false,
                wind: { direction: 'variable', speed: 3, changeInterval: 8 },
                reward: { coins: 500, exp: 200 },
            },
        ];
    }

    /**
     * 加载谜题进度
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('puzzleProgress');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    /**
     * 保存谜题进度
     */
    saveProgress(puzzleId, stars, score) {
        if (!this.completedPuzzles[puzzleId] || this.completedPuzzles[puzzleId].stars < stars) {
            this.completedPuzzles[puzzleId] = { stars, score, completedAt: Date.now() };
            localStorage.setItem('puzzleProgress', JSON.stringify(this.completedPuzzles));
            this.checkUnlocks();
        }
    }

    /**
     * 检查并解锁新谜题
     */
    checkUnlocks() {
        const difficultyOrder = ['easy', 'medium', 'hard', 'master'];
        for (let i = 0; i < this.puzzles.length; i++) {
            if (!this.puzzles[i].unlocked) {
                // 解锁规则：前一关至少获得1星即可解锁下一关
                if (i > 0) {
                    const prevPuzzle = this.puzzles[i - 1];
                    const prevProgress = this.completedPuzzles[prevPuzzle.id];
                    if (prevProgress && prevProgress.stars >= 1) {
                        this.puzzles[i].unlocked = true;
                    }
                }
            }
        }
    }

    /**
     * 开始一个谜题
     */
    startPuzzle(puzzleId) {
        const puzzle = this.puzzles.find(p => p.id === puzzleId);
        if (!puzzle) {
            throw new Error(`Puzzle not found: ${puzzleId}`);
        }
        if (!puzzle.unlocked) {
            throw new Error(`Puzzle locked: ${puzzleId}`);
        }

        this.activePuzzle = JSON.parse(JSON.stringify(puzzle));
        this.puzzleState = {
            buildingsSaved: 0,
            buildingsLost: 0,
            waterUsed: 0,
            movesUsed: 0,
            timeElapsed: 0,
            hintsUsed: 0,
            maxHints: puzzle.hints.length,
            isCompleted: false,
            isFailed: false,
        };
        this.startTime = Date.now();
        return this.activePuzzle;
    }

    /**
     * 使用一步
     */
    useMove() {
        if (!this.activePuzzle) return false;
        if (this.activePuzzle.maxMoves > 0 && this.puzzleState.movesUsed >= this.activePuzzle.maxMoves) {
            return false;
        }
        this.puzzleState.movesUsed++;
        return true;
    }

    /**
     * 使用水量
     */
    useWater(amount) {
        if (!this.activePuzzle) return false;
        const remaining = this.activePuzzle.availableWater - this.puzzleState.waterUsed;
        if (amount > remaining) return false;
        this.puzzleState.waterUsed += amount;
        return true;
    }

    /**
     * 记录建筑被拯救
     */
    recordBuildingSaved() {
        if (!this.puzzleState) return;
        this.puzzleState.buildingsSaved++;
    }

    /**
     * 记录建筑被烧毁
     */
    recordBuildingLost() {
        if (!this.puzzleState) return;
        this.puzzleState.buildingsLost++;
    }

    /**
     * 显示提示
     */
    showHint() {
        if (!this.activePuzzle || !this.puzzleState) return null;
        if (this.puzzleState.hintsUsed >= this.puzzleState.maxHints) return null;
        const hint = this.activePuzzle.hints[this.puzzleState.hintsUsed];
        this.puzzleState.hintsUsed++;
        return hint;
    }

    /**
     * 完成谜题并评分
     */
    completePuzzle() {
        if (!this.activePuzzle || !this.puzzleState) return null;

        this.puzzleState.timeElapsed = (Date.now() - this.startTime) / 1000;
        this.puzzleState.isCompleted = true;

        const result = this.scorer.calculateScore(this.activePuzzle, this.puzzleState);
        const stars = this.scorer.calculateStars(this.activePuzzle, result.totalScore);

        // 检查是否达标
        const target = this.activePuzzle.target;
        const meetsTarget = result.totalScore >= target.minScore &&
            this.puzzleState.buildingsSaved >= target.minBuildingsSaved;

        if (meetsTarget) {
            this.saveProgress(this.activePuzzle.id, stars, result.totalScore);
        }

        return {
            puzzleId: this.activePuzzle.id,
            score: result.totalScore,
            stars: meetsTarget ? stars : 0,
            buildingsSaved: this.puzzleState.buildingsSaved,
            buildingsLost: this.puzzleState.buildingsLost,
            waterUsed: this.puzzleState.waterUsed,
            movesUsed: this.puzzleState.movesUsed,
            timeElapsed: this.puzzleState.timeElapsed,
            hintsUsed: this.puzzleState.hintsUsed,
            meetsTarget,
            breakdown: result.breakdown,
        };
    }

    /**
     * 获取谜题状态
     */
    getState() {
        return this.puzzleState;
    }

    /**
     * 获取所有谜题（含进度）
     */
    getAllPuzzles() {
        return this.puzzles.map(p => ({
            ...p,
            progress: this.completedPuzzles[p.id] || null,
        }));
    }

    /**
     * 按难度筛选谜题
     */
    getPuzzlesByDifficulty(difficulty) {
        return this.puzzles.filter(p => p.difficulty === difficulty);
    }

    /**
     * 获取总星星数
     */
    getTotalStars() {
        return Object.values(this.completedPuzzles).reduce((sum, p) => sum + p.stars, 0);
    }

    /**
     * 获取已完成谜题数
     */
    getCompletedCount() {
        return Object.keys(this.completedPuzzles).length;
    }

    /**
     * 重置所有进度
     */
    resetProgress() {
        this.completedPuzzles = {};
        localStorage.removeItem('puzzleProgress');
        this.puzzles[0].unlocked = true;
        for (let i = 1; i < this.puzzles.length; i++) {
            this.puzzles[i].unlocked = false;
        }
    }
}

/**
 * 谜题评分系统
 */
export class PuzzleScorer {
    /**
     * 计算谜题得分
     */
    calculateScore(puzzle, state) {
        const breakdown = {};

        // 基础分：每栋拯救的建筑得分
        const buildingScore = state.buildingsSaved * 200;
        breakdown.buildingScore = buildingScore;

        // 水效率分：剩余水越多分越高
        const waterRemaining = puzzle.availableWater - state.waterUsed;
        const waterEfficiency = Math.floor(waterRemaining * 0.5);
        breakdown.waterEfficiency = waterEfficiency;

        // 时间奖励：越快完成越高
        const timeRemaining = Math.max(0, puzzle.timeLimit - state.timeElapsed);
        const timeBonus = Math.floor(timeRemaining * 10);
        breakdown.timeBonus = timeBonus;

        // 步数奖励：限制步数关卡中，剩余步数加分
        let moveBonus = 0;
        if (puzzle.maxMoves > 0) {
            const movesRemaining = puzzle.maxMoves - state.movesUsed;
            moveBonus = movesRemaining * 50;
        }
        breakdown.moveBonus = moveBonus;

        // 提示惩罚：每用一次提示扣50分
        const hintPenalty = state.hintsUsed * 50;
        breakdown.hintPenalty = hintPenalty;

        // 建筑存活奖励：无损失额外加分
        const perfectBonus = state.buildingsLost === 0 ? 300 : 0;
        breakdown.perfectBonus = perfectBonus;

        // 难度乘数
        const difficultyMultiplier = {
            easy: 1.0,
            medium: 1.5,
            hard: 2.0,
            master: 3.0,
        };
        const multiplier = difficultyMultiplier[puzzle.difficulty] || 1.0;
        breakdown.difficultyMultiplier = multiplier;

        const rawScore = buildingScore + waterEfficiency + timeBonus + moveBonus + perfectBonus - hintPenalty;
        const totalScore = Math.floor(rawScore * multiplier);

        return { totalScore, breakdown };
    }

    /**
     * 计算星级
     */
    calculateStars(puzzle, score) {
        if (score >= puzzle.stars.three) return 3;
        if (score >= puzzle.stars.two) return 2;
        if (score >= puzzle.stars.one) return 1;
        return 0;
    }
}

/**
 * 谜题编辑器
 * 允许玩家创建自定义谜题
 */
export class PuzzleEditor {
    constructor(puzzleMode) {
        this.puzzleMode = puzzleMode;
        this.customPuzzles = this.loadCustomPuzzles();
        this.editingPuzzle = null;
        this.nextCustomId = this.calculateNextId();
    }

    /**
     * 计算下一个自定义谜题ID
     */
    calculateNextId() {
        const ids = this.customPuzzles.map(p => parseInt(p.id.replace('custom-', ''), 10));
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    /**
     * 创建新谜题模板
     */
    createNew() {
        this.editingPuzzle = {
            id: `custom-${this.nextCustomId}`,
            name: '自定义谜题',
            description: '玩家创建的自定义谜题',
            difficulty: 'easy',
            icon: '✏️',
            buildings: [],
            availableWater: 1000,
            timeLimit: 60,
            maxMoves: 0,
            target: { minBuildingsSaved: 1, minScore: 300 },
            stars: { one: 300, two: 500, three: 700 },
            hints: [],
            unlocked: true,
            reward: { coins: 50, exp: 20 },
            isCustom: true,
            createdAt: Date.now(),
        };
        return this.editingPuzzle;
    }

    /**
     * 设置谜题属性
     */
    setProperty(prop, value) {
        if (!this.editingPuzzle) return false;
        this.editingPuzzle[prop] = value;
        return true;
    }

    /**
     * 添加建筑
     */
    addBuilding(building) {
        if (!this.editingPuzzle) return false;
        const newBuilding = {
            type: building.type || 'WOOD',
            x: building.x || 400,
            y: building.y || 400,
            width: building.width || 60,
            height: building.height || 80,
            initialFire: building.initialFire !== undefined ? building.initialFire : false,
            hp: building.hp || 100,
            ...building,
        };
        this.editingPuzzle.buildings.push(newBuilding);
        return true;
    }

    /**
     * 移除建筑
     */
    removeBuilding(index) {
        if (!this.editingPuzzle) return false;
        if (index < 0 || index >= this.editingPuzzle.buildings.length) return false;
        this.editingPuzzle.buildings.splice(index, 1);
        return true;
    }

    /**
     * 更新建筑属性
     */
    updateBuilding(index, updates) {
        if (!this.editingPuzzle) return false;
        if (index < 0 || index >= this.editingPuzzle.buildings.length) return false;
        Object.assign(this.editingPuzzle.buildings[index], updates);
        return true;
    }

    /**
     * 添加提示
     */
    addHint(hintText) {
        if (!this.editingPuzzle) return false;
        this.editingPuzzle.hints.push(hintText);
        return true;
    }

    /**
     * 移除提示
     */
    removeHint(index) {
        if (!this.editingPuzzle) return false;
        if (index < 0 || index >= this.editingPuzzle.hints.length) return false;
        this.editingPuzzle.hints.splice(index, 1);
        return true;
    }

    /**
     * 设置星级门槛
     */
    setStarThresholds(one, two, three) {
        if (!this.editingPuzzle) return false;
        this.editingPuzzle.stars = { one, two, three };
        return true;
    }

    /**
     * 设置过关条件
     */
    setTarget(minBuildingsSaved, minScore) {
        if (!this.editingPuzzle) return false;
        this.editingPuzzle.target = { minBuildingsSaved, minScore };
        return true;
    }

    /**
     * 验证谜题数据是否完整有效
     */
    validate() {
        if (!this.editingPuzzle) {
            return { valid: false, errors: ['没有正在编辑的谜题'] };
        }
        const errors = [];
        const p = this.editingPuzzle;

        if (!p.name || p.name.trim() === '') {
            errors.push('谜题名称不能为空');
        }
        if (!p.buildings || p.buildings.length === 0) {
            errors.push('至少需要一栋建筑');
        }
        const hasInitialFire = p.buildings.some(b => b.initialFire);
        if (!hasInitialFire) {
            errors.push('至少需要一栋建筑起火');
        }
        if (p.availableWater <= 0) {
            errors.push('水量必须大于0');
        }
        if (p.timeLimit <= 0) {
            errors.push('时间限制必须大于0');
        }
        if (p.stars.one >= p.stars.two || p.stars.two >= p.stars.three) {
            errors.push('星级门槛必须递增: 一星 < 二星 < 三星');
        }
        if (p.target.minBuildingsSaved > p.buildings.length) {
            errors.push('过关所需拯救建筑数不能超过总建筑数');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * 保存自定义谜题
     */
    save() {
        const validation = this.validate();
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        const existingIdx = this.customPuzzles.findIndex(p => p.id === this.editingPuzzle.id);
        if (existingIdx >= 0) {
            this.customPuzzles[existingIdx] = { ...this.editingPuzzle, updatedAt: Date.now() };
        } else {
            this.customPuzzles.push({ ...this.editingPuzzle });
            this.nextCustomId++;
        }

        localStorage.setItem('customPuzzles', JSON.stringify(this.customPuzzles));
        return { success: true, puzzleId: this.editingPuzzle.id };
    }

    /**
     * 加载自定义谜题列表
     */
    loadCustomPuzzles() {
        try {
            const saved = localStorage.getItem('customPuzzles');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    /**
     * 删除自定义谜题
     */
    deleteCustom(puzzleId) {
        const idx = this.customPuzzles.findIndex(p => p.id === puzzleId);
        if (idx < 0) return false;
        this.customPuzzles.splice(idx, 1);
        localStorage.setItem('customPuzzles', JSON.stringify(this.customPuzzles));
        return true;
    }

    /**
     * 编辑已有自定义谜题
     */
    editExisting(puzzleId) {
        const puzzle = this.customPuzzles.find(p => p.id === puzzleId);
        if (!puzzle) return null;
        this.editingPuzzle = JSON.parse(JSON.stringify(puzzle));
        return this.editingPuzzle;
    }

    /**
     * 获取所有自定义谜题
     */
    getCustomPuzzles() {
        return [...this.customPuzzles];
    }

    /**
     * 取消编辑
     */
    cancelEdit() {
        this.editingPuzzle = null;
    }
}
