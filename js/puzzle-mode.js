/**
 * 谜题模式系统 (Puzzle Mode)
 * 20个预设谜题（固定火场布局+限制条件）
 * 评分系统（S/A/B/C）
 * 谜题编辑器（自定义谜题保存到 localStorage）
 * 谜题选择面板 UI
 */
export class PuzzleModeSystem {
    constructor(game) {
        this.game = game;
        this.currentPuzzle = null;
        this.customPuzzles = this.loadCustomPuzzles();
        this.completedPuzzles = this.loadCompleted();
        this.editorState = null; // 编辑器状态
    }

    // ==================== 预设谜题数据 ====================
    getPuzzles() {
        return [
            // ──────── 入门（5题）────────
            {
                id: 'p1', name: '初学者之火', difficulty: 'beginner', stars: 1,
                description: '一栋木屋着火，水量充足，练习基本操作。',
                buildings: [
                    { type: 'WOOD', x: 350, y: 400, initialFire: true },
                ],
                initialFires: [0],
                initialWater: 1200, time: 60, wind: 0,
                // 评分阈值（剩余水量百分比，剩余时间百分比）
                gradeThresholds: { S: 0.8, A: 0.5, B: 0.25, C: 0 },
            },
            {
                id: 'p2', name: '双生火焰', difficulty: 'beginner', stars: 1,
                description: '两栋木屋同时燃烧，时间充裕。',
                buildings: [
                    { type: 'WOOD', x: 200, y: 400, initialFire: true },
                    { type: 'WOOD', x: 500, y: 400, initialFire: true },
                ],
                initialFires: [0, 1],
                initialWater: 1800, time: 70, wind: 0,
                gradeThresholds: { S: 0.75, A: 0.45, B: 0.2, C: 0 },
            },
            {
                id: 'p3', name: '砖墙之困', difficulty: 'beginner', stars: 1,
                description: '一栋砖房着火，砖房耐火但需要更多水。',
                buildings: [
                    { type: 'BRICK', x: 350, y: 380, initialFire: true },
                ],
                initialFires: [0],
                initialWater: 1500, time: 60, wind: 0,
                gradeThresholds: { S: 0.7, A: 0.4, B: 0.2, C: 0 },
            },
            {
                id: 'p4', name: '邻居危机', difficulty: 'beginner', stars: 1,
                description: '木屋和砖房并排着火，先救哪一个？',
                buildings: [
                    { type: 'WOOD', x: 200, y: 400, initialFire: true },
                    { type: 'BRICK', x: 420, y: 380, initialFire: true },
                ],
                initialFires: [0, 1],
                initialWater: 2000, time: 75, wind: 0,
                gradeThresholds: { S: 0.7, A: 0.45, B: 0.2, C: 0 },
            },
            {
                id: 'p5', name: '小试牛刀', difficulty: 'beginner', stars: 2,
                description: '三栋建筑，两栋着火，试试你的多目标管理。',
                buildings: [
                    { type: 'WOOD', x: 120, y: 400, initialFire: true },
                    { type: 'BRICK', x: 340, y: 385, initialFire: false },
                    { type: 'WOOD', x: 560, y: 400, initialFire: true },
                ],
                initialFires: [0, 2],
                initialWater: 2500, time: 80, wind: 0,
                gradeThresholds: { S: 0.65, A: 0.4, B: 0.15, C: 0 },
            },

            // ──────── 进阶（10题）────────
            {
                id: 'p6', name: '风口浪尖', difficulty: 'intermediate', stars: 2,
                description: '微风让火势蔓延加快，注意风向。',
                buildings: [
                    { type: 'WOOD', x: 180, y: 400, initialFire: true },
                    { type: 'WOOD', x: 400, y: 400, initialFire: false },
                    { type: 'BRICK', x: 600, y: 385, initialFire: true },
                ],
                initialFires: [0, 2],
                initialWater: 2200, time: 70, wind: 2,
                gradeThresholds: { S: 0.65, A: 0.4, B: 0.15, C: 0 },
            },
            {
                id: 'p7', name: '高楼危情', difficulty: 'intermediate', stars: 2,
                description: '高楼着火，血量高但火力猛。',
                buildings: [
                    { type: 'HIGH_RISE', x: 300, y: 320, initialFire: true },
                    { type: 'WOOD', x: 550, y: 400, initialFire: false },
                ],
                initialFires: [0],
                initialWater: 2000, time: 75, wind: 1,
                gradeThresholds: { S: 0.6, A: 0.35, B: 0.15, C: 0 },
            },
            {
                id: 'p8', name: '连环火场', difficulty: 'intermediate', stars: 2,
                description: '四栋紧密排列的建筑，三栋已着火。',
                buildings: [
                    { type: 'WOOD', x: 100, y: 400, initialFire: true },
                    { type: 'WOOD', x: 260, y: 400, initialFire: true },
                    { type: 'BRICK', x: 420, y: 385, initialFire: true },
                    { type: 'WOOD', x: 580, y: 400, initialFire: false },
                ],
                initialFires: [0, 1, 2],
                initialWater: 2800, time: 90, wind: 1,
                gradeThresholds: { S: 0.6, A: 0.35, B: 0.12, C: 0 },
            },
            {
                id: 'p9', name: '逆风而行', difficulty: 'intermediate', stars: 3,
                description: '强风环境，水量有限。',
                buildings: [
                    { type: 'BRICK', x: 200, y: 385, initialFire: true },
                    { type: 'BRICK', x: 450, y: 385, initialFire: true },
                ],
                initialFires: [0, 1],
                initialWater: 1600, time: 65, wind: 4,
                gradeThresholds: { S: 0.55, A: 0.3, B: 0.1, C: 0 },
            },
            {
                id: 'p10', name: '城中之城', difficulty: 'intermediate', stars: 3,
                description: '混合建筑群，火势复杂。',
                buildings: [
                    { type: 'WOOD', x: 80, y: 400, initialFire: true },
                    { type: 'HIGH_RISE', x: 250, y: 320, initialFire: true },
                    { type: 'BRICK', x: 450, y: 385, initialFire: false },
                    { type: 'WOOD', x: 620, y: 400, initialFire: true },
                ],
                initialFires: [0, 1, 3],
                initialWater: 3000, time: 100, wind: 2,
                gradeThresholds: { S: 0.6, A: 0.35, B: 0.12, C: 0 },
            },
            {
                id: 'p11', name: '生死时速', difficulty: 'intermediate', stars: 3,
                description: '时间紧迫，只有45秒。',
                buildings: [
                    { type: 'WOOD', x: 200, y: 400, initialFire: true },
                    { type: 'BRICK', x: 450, y: 385, initialFire: true },
                    { type: 'WOOD', x: 620, y: 400, initialFire: true },
                ],
                initialFires: [0, 1, 2],
                initialWater: 2500, time: 45, wind: 1,
                gradeThresholds: { S: 0.55, A: 0.3, B: 0.1, C: 0 },
            },
            {
                id: 'p12', name: '双塔奇谋', difficulty: 'intermediate', stars: 3,
                description: '两栋高楼同时燃烧，分配水量是关键。',
                buildings: [
                    { type: 'HIGH_RISE', x: 180, y: 320, initialFire: true },
                    { type: 'HIGH_RISE', x: 480, y: 320, initialFire: true },
                ],
                initialFires: [0, 1],
                initialWater: 2500, time: 80, wind: 1,
                gradeThresholds: { S: 0.55, A: 0.3, B: 0.12, C: 0 },
            },
            {
                id: 'p13', name: '贫水困局', difficulty: 'intermediate', stars: 3,
                description: '水量极少，每一滴水都珍贵。',
                buildings: [
                    { type: 'BRICK', x: 300, y: 385, initialFire: true },
                    { type: 'WOOD', x: 520, y: 400, initialFire: true },
                ],
                initialFires: [0, 1],
                initialWater: 900, time: 70, wind: 1,
                gradeThresholds: { S: 0.5, A: 0.25, B: 0.1, C: 0 },
            },
            {
                id: 'p14', name: '街区烈焰', difficulty: 'intermediate', stars: 3,
                description: '密集街区，火势会迅速蔓延。',
                buildings: [
                    { type: 'WOOD', x: 60, y: 400, initialFire: true },
                    { type: 'WOOD', x: 200, y: 400, initialFire: false },
                    { type: 'BRICK', x: 340, y: 385, initialFire: true },
                    { type: 'WOOD', x: 480, y: 400, initialFire: false },
                    { type: 'WOOD', x: 620, y: 400, initialFire: true },
                ],
                initialFires: [0, 2, 4],
                initialWater: 3200, time: 100, wind: 2,
                gradeThresholds: { S: 0.6, A: 0.35, B: 0.12, C: 0 },
            },
            {
                id: 'p15', name: '风暴前夕', difficulty: 'intermediate', stars: 3,
                description: '强风+紧凑布局，火势极易蔓延。',
                buildings: [
                    { type: 'WOOD', x: 150, y: 400, initialFire: true },
                    { type: 'BRICK', x: 320, y: 385, initialFire: true },
                    { type: 'WOOD', x: 490, y: 400, initialFire: false },
                    { type: 'HIGH_RISE', x: 620, y: 320, initialFire: true },
                ],
                initialFires: [0, 1, 3],
                initialWater: 2800, time: 85, wind: 4,
                gradeThresholds: { S: 0.55, A: 0.3, B: 0.1, C: 0 },
            },

            // ──────── 大师（5题）────────
            {
                id: 'p16', name: '炼狱之门', difficulty: 'master', stars: 4,
                description: '六栋建筑全部着火，水量有限，需要极限操作。',
                buildings: [
                    { type: 'WOOD', x: 50, y: 400, initialFire: true },
                    { type: 'BRICK', x: 180, y: 385, initialFire: true },
                    { type: 'WOOD', x: 310, y: 400, initialFire: true },
                    { type: 'HIGH_RISE', x: 420, y: 320, initialFire: true },
                    { type: 'BRICK', x: 560, y: 385, initialFire: true },
                    { type: 'WOOD', x: 680, y: 400, initialFire: true },
                ],
                initialFires: [0, 1, 2, 3, 4, 5],
                initialWater: 3500, time: 120, wind: 3,
                gradeThresholds: { S: 0.5, A: 0.25, B: 0.08, C: 0 },
            },
            {
                id: 'p17', name: '滴水成冰', difficulty: 'master', stars: 4,
                description: '极低水量挑战，精准是唯一出路。',
                buildings: [
                    { type: 'BRICK', x: 250, y: 385, initialFire: true },
                    { type: 'BRICK', x: 480, y: 385, initialFire: true },
                    { type: 'WOOD', x: 650, y: 400, initialFire: true },
                ],
                initialFires: [0, 1, 2],
                initialWater: 700, time: 60, wind: 2,
                gradeThresholds: { S: 0.45, A: 0.2, B: 0.08, C: 0 },
            },
            {
                id: 'p18', name: '烈风之城', difficulty: 'master', stars: 5,
                description: '飓风级风力，火势疯狂蔓延。',
                buildings: [
                    { type: 'WOOD', x: 100, y: 400, initialFire: true },
                    { type: 'WOOD', x: 230, y: 400, initialFire: false },
                    { type: 'HIGH_RISE', x: 370, y: 320, initialFire: true },
                    { type: 'BRICK', x: 530, y: 385, initialFire: true },
                    { type: 'WOOD', x: 670, y: 400, initialFire: false },
                ],
                initialFires: [0, 2, 3],
                initialWater: 2800, time: 90, wind: 6,
                gradeThresholds: { S: 0.45, A: 0.2, B: 0.08, C: 0 },
            },
            {
                id: 'p19', name: '末日审判', difficulty: 'master', stars: 5,
                description: '建筑密集+强风+限时，真正的终极考验。',
                buildings: [
                    { type: 'WOOD', x: 50, y: 400, initialFire: true },
                    { type: 'HIGH_RISE', x: 170, y: 320, initialFire: true },
                    { type: 'BRICK', x: 300, y: 385, initialFire: true },
                    { type: 'WOOD', x: 430, y: 400, initialFire: false },
                    { type: 'HIGH_RISE', x: 530, y: 320, initialFire: true },
                    { type: 'WOOD', x: 670, y: 400, initialFire: true },
                ],
                initialFires: [0, 1, 2, 4, 5],
                initialWater: 3200, time: 80, wind: 5,
                gradeThresholds: { S: 0.4, A: 0.2, B: 0.06, C: 0 },
            },
            {
                id: 'p20', name: '涅槃重生', difficulty: 'master', stars: 5,
                description: '所有建筑全部着火、极低水量、强风、短时间。传说级挑战。',
                buildings: [
                    { type: 'HIGH_RISE', x: 80, y: 320, initialFire: true },
                    { type: 'BRICK', x: 210, y: 385, initialFire: true },
                    { type: 'WOOD', x: 340, y: 400, initialFire: true },
                    { type: 'HIGH_RISE', x: 440, y: 320, initialFire: true },
                    { type: 'BRICK', x: 570, y: 385, initialFire: true },
                    { type: 'WOOD', x: 690, y: 400, initialFire: true },
                ],
                initialFires: [0, 1, 2, 3, 4, 5],
                initialWater: 2000, time: 70, wind: 5,
                gradeThresholds: { S: 0.35, A: 0.15, B: 0.05, C: 0 },
            },
        ];
    }

    // ==================== 评分系统 ====================
    calculateGrade(puzzle, waterRemaining, timeRemaining) {
        const waterPercent = waterRemaining / puzzle.initialWater;
        const timePercent = timeRemaining / puzzle.time;
        const combined = (waterPercent + timePercent) / 2;
        const t = puzzle.gradeThresholds;

        if (combined >= t.S) return 'S';
        if (combined >= t.A) return 'A';
        if (combined >= t.B) return 'B';
        return 'C';
    }

    getGradeEmoji(grade) {
        const map = { S: '🌟', A: '⭐', B: '✅', C: '🔲' };
        return map[grade] || '🔲';
    }

    getGradeColor(grade) {
        const map = { S: '#FFD700', A: '#FF6B35', B: '#4CAF50', C: '#9E9E9E' };
        return map[grade] || '#9E9E9E';
    }

    // ==================== 持久化 ====================
    loadCompleted() {
        try {
            const data = localStorage.getItem('puzzle_completed');
            return data ? JSON.parse(data) : {};
        } catch { return {}; }
    }

    saveCompleted() {
        localStorage.setItem('puzzle_completed', JSON.stringify(this.completedPuzzles));
    }

    loadCustomPuzzles() {
        try {
            const data = localStorage.getItem('puzzle_custom');
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    }

    saveCustomPuzzles() {
        localStorage.setItem('puzzle_custom', JSON.stringify(this.customPuzzles));
    }

    recordResult(puzzleId, grade, waterRemaining, timeRemaining) {
        const existing = this.completedPuzzles[puzzleId];
        const gradeOrder = { S: 4, A: 3, B: 2, C: 1 };
        if (!existing || gradeOrder[grade] > gradeOrder[existing.grade]) {
            this.completedPuzzles[puzzleId] = {
                grade,
                waterRemaining,
                timeRemaining,
                timestamp: Date.now(),
            };
            this.saveCompleted();
        }
    }

    // ==================== 谜题编辑器 ====================
    createEditorState() {
        return {
            name: '',
            description: '',
            buildings: [],
            initialFires: [],
            initialWater: 2000,
            time: 60,
            wind: 0,
        };
    }

    addBuildingToEditor(state, type, x, y) {
        const idx = state.buildings.length;
        state.buildings.push({ type, x, y, initialFire: false });
        return idx;
    }

    removeBuildingFromEditor(state, idx) {
        state.buildings.splice(idx, 1);
        state.initialFires = state.initialFires
            .filter(i => i !== idx)
            .map(i => i > idx ? i - 1 : i);
        // update initialFire flags
        state.buildings.forEach((b, i) => { b.initialFire = state.initialFires.includes(i); });
    }

    toggleFireInEditor(state, idx) {
        if (state.initialFires.includes(idx)) {
            state.initialFires = state.initialFires.filter(i => i !== idx);
        } else {
            state.initialFires.push(idx);
        }
        state.buildings.forEach((b, i) => { b.initialFire = state.initialFires.includes(i); });
    }

    saveCustomPuzzle(state) {
        if (!state.name || state.buildings.length === 0 || state.initialFires.length === 0) {
            return false;
        }
        const puzzle = {
            id: 'custom_' + Date.now(),
            name: state.name,
            description: state.description || '自定义谜题',
            difficulty: 'custom',
            stars: 1,
            buildings: [...state.buildings],
            initialFires: [...state.initialFires],
            initialWater: state.initialWater,
            time: state.time,
            wind: state.wind,
            gradeThresholds: { S: 0.6, A: 0.35, B: 0.12, C: 0 },
            isCustom: true,
        };
        this.customPuzzles.push(puzzle);
        this.saveCustomPuzzles();
        return true;
    }

    deleteCustomPuzzle(puzzleId) {
        this.customPuzzles = this.customPuzzles.filter(p => p.id !== puzzleId);
        this.saveCustomPuzzles();
    }

    // ==================== 启动谜题关卡 ====================
    startPuzzle(puzzleData) {
        this.currentPuzzle = puzzleData;
        const game = this.game;

        // Build level-like data for Game.startLevel
        game.currentLevel = -1; // sentinel for puzzle mode
        game.score = 0;
        game.water = puzzleData.initialWater;
        game.time = puzzleData.time;
        game.prepareTime = 5; // short prepare time for puzzles
        game.selectedFacility = null;
        game.facilities = [];

        // Rebuild buildings
        game.buildingSystem.buildings = [];
        game.buildings = game.buildingSystem.buildings;

        puzzleData.buildings.forEach(b => {
            game.buildingSystem.create(b.type, b.x, b.y);
        });

        // Clear systems
        game.fireSystem.clear();
        game.fires = game.fireSystem.fires;
        game.waterSystem.clear();
        game.waterDroplets = game.waterSystem.droplets;
        game.particleSystem.clear();

        if (game.extendedFacilitySystem) {
            game.extendedFacilitySystem.facilities = [];
        }

        // Reset subsystems
        game.rescueSystem?.reset();
        game.specialEventSystem?.reset();
        game.visualEffects?.clear();

        // Start in prepare state
        game.state = 'prepare';
        game.ui.showGameUI();

        // Store puzzle fires to ignite on battle start
        this._pendingFires = puzzleData.initialFires;
    }

    ignitePuzzleFires() {
        if (!this._pendingFires) return;
        const game = this.game;
        this._pendingFires.forEach(idx => {
            if (idx >= 0 && idx < game.buildings.length) {
                game.fireSystem.ignite(game.buildings[idx]);
            }
        });
        this._pendingFires = null;
    }

    // ==================== UI 渲染 ====================
    renderPuzzleSelectUI(container) {
        container.innerHTML = '';

        const allPuzzles = [...this.getPuzzles(), ...this.customPuzzles];
        const difficulties = [
            { key: 'beginner', label: '🌱 入门', color: '#4CAF50' },
            { key: 'intermediate', label: '🔥 进阶', color: '#FF9800' },
            { key: 'master', label: '💀 大师', color: '#E91E63' },
            { key: 'custom', label: '✏️ 自定义', color: '#9C27B0' },
        ];

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width:100%;';

        // Stats bar
        const completedCount = Object.keys(this.completedPuzzles).length;
        const statsBar = document.createElement('div');
        statsBar.style.cssText = 'color:#fff;text-align:center;margin-bottom:15px;font-size:14px;';
        statsBar.textContent = `✅ 已通关: ${completedCount} / ${allPuzzles.length}`;
        wrapper.appendChild(statsBar);

        difficulties.forEach(diff => {
            const puzzles = allPuzzles.filter(p => p.difficulty === diff.key);
            if (puzzles.length === 0) return;

            const section = document.createElement('div');
            section.style.cssText = 'margin-bottom:20px;';

            const header = document.createElement('div');
            header.style.cssText = `color:${diff.color};font-size:16px;font-weight:bold;margin-bottom:10px;border-bottom:1px solid ${diff.color}40;padding-bottom:5px;`;
            header.textContent = diff.label;
            section.appendChild(header);

            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;';

            puzzles.forEach(puzzle => {
                const card = document.createElement('div');
                card.className = 'puzzle-card';
                const result = this.completedPuzzles[puzzle.id];
                const grade = result ? result.grade : null;
                const gradeColor = grade ? this.getGradeColor(grade) : '#555';

                card.style.cssText = `
                    background:rgba(255,255,255,0.05);
                    border:1px solid ${grade ? gradeColor + '60' : 'rgba(255,255,255,0.1)'};
                    border-radius:10px;padding:12px;cursor:pointer;
                    transition:all 0.2s;text-align:center;
                `;

                const nameEl = document.createElement('div');
                nameEl.style.cssText = 'color:#fff;font-size:13px;font-weight:600;margin-bottom:6px;';
                nameEl.textContent = puzzle.name;

                const starsEl = document.createElement('div');
                starsEl.style.cssText = 'font-size:12px;margin-bottom:4px;';
                starsEl.textContent = '⭐'.repeat(puzzle.stars || 1);

                const gradeEl = document.createElement('div');
                gradeEl.style.cssText = `font-size:18px;font-weight:bold;color:${gradeColor};`;
                gradeEl.textContent = grade ? `${this.getGradeEmoji(grade)} ${grade}` : '—';

                const descEl = document.createElement('div');
                descEl.style.cssText = 'color:#aaa;font-size:11px;margin-top:4px;';
                descEl.textContent = puzzle.description.length > 25
                    ? puzzle.description.substring(0, 25) + '…'
                    : puzzle.description;

                card.appendChild(nameEl);
                card.appendChild(starsEl);
                card.appendChild(gradeEl);
                card.appendChild(descEl);

                // Custom puzzle delete button
                if (puzzle.isCustom) {
                    const delBtn = document.createElement('button');
                    delBtn.textContent = '🗑️';
                    delBtn.style.cssText = `
                        background:rgba(255,0,0,0.2);border:none;border-radius:4px;
                        padding:2px 6px;cursor:pointer;font-size:11px;margin-top:6px;color:#ff6b6b;
                    `;
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('确定删除这个自定义谜题？')) {
                            this.deleteCustomPuzzle(puzzle.id);
                            this.renderPuzzleSelectUI(container);
                        }
                    });
                    card.appendChild(delBtn);
                }

                card.addEventListener('mouseenter', () => {
                    card.style.background = 'rgba(255,255,255,0.12)';
                    card.style.transform = 'scale(1.03)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.background = 'rgba(255,255,255,0.05)';
                    card.style.transform = 'scale(1)';
                });

                card.addEventListener('click', () => {
                    this.startPuzzle(puzzle);
                    document.getElementById('puzzle-menu').style.display = 'none';
                });

                grid.appendChild(card);
            });

            section.appendChild(grid);
            wrapper.appendChild(section);
        });

        container.appendChild(wrapper);
    }

    renderPuzzleEditorUI(container) {
        if (!this.editorState) {
            this.editorState = this.createEditorState();
        }
        const state = this.editorState;

        container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width:100%;color:#fff;';

        // Name input
        wrapper.appendChild(this._createField('谜题名称', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = state.name;
            input.placeholder = '输入谜题名称';
            input.style.cssText = 'width:100%;padding:8px;border-radius:6px;border:1px solid #444;background:#222;color:#fff;font-size:14px;';
            input.addEventListener('input', () => { state.name = input.value; });
            return input;
        }));

        // Description input
        wrapper.appendChild(this._createField('描述', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = state.description;
            input.placeholder = '简短描述';
            input.style.cssText = 'width:100%;padding:8px;border-radius:6px;border:1px solid #444;background:#222;color:#fff;font-size:14px;';
            input.addEventListener('input', () => { state.description = input.value; });
            return input;
        }));

        // Water / Time / Wind sliders
        wrapper.appendChild(this._createSlider('💧 水量', state.initialWater, 300, 5000, 100, v => {
            state.initialWater = v;
        }));
        wrapper.appendChild(this._createSlider('⏱️ 时间(秒)', state.time, 20, 180, 5, v => {
            state.time = v;
        }));
        wrapper.appendChild(this._createSlider('🌬️ 风力', state.wind, 0, 8, 1, v => {
            state.wind = v;
        }));

        // Building placement
        const buildingSection = document.createElement('div');
        buildingSection.style.cssText = 'margin:15px 0;';

        const bTitle = document.createElement('div');
        bTitle.style.cssText = 'font-weight:bold;margin-bottom:8px;';
        bTitle.textContent = '🏗️ 建筑布局';
        buildingSection.appendChild(bTitle);

        const addRow = document.createElement('div');
        addRow.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;';

        const types = [
            { type: 'WOOD', label: '🪵 木屋', x: 300, y: 400 },
            { type: 'BRICK', label: '🧱 砖房', x: 300, y: 385 },
            { type: 'HIGH_RISE', label: '🏢 高楼', x: 300, y: 320 },
        ];

        types.forEach(t => {
            const btn = document.createElement('button');
            btn.textContent = t.label;
            btn.style.cssText = `
                padding:6px 12px;border-radius:6px;border:1px solid #555;
                background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;font-size:13px;
            `;
            btn.addEventListener('click', () => {
                // Auto-arrange: spread horizontally
                const offset = state.buildings.length * 140;
                const x = Math.min(50 + offset, 680);
                this.addBuildingToEditor(state, t.type, x, t.y);
                this.renderPuzzleEditorUI(container);
            });
            addRow.appendChild(btn);
        });

        buildingSection.appendChild(addRow);

        // List current buildings
        state.buildings.forEach((b, i) => {
            const row = document.createElement('div');
            row.style.cssText = `
                display:flex;align-items:center;gap:8px;margin:4px 0;padding:6px 10px;
                background:rgba(255,255,255,0.05);border-radius:6px;font-size:13px;
            `;

            const typeLabel = { WOOD: '🪵', BRICK: '🧱', HIGH_RISE: '🏢' }[b.type] || '🏠';
            const info = document.createElement('span');
            info.textContent = `${typeLabel} ${b.type} (${b.x}, ${b.y})`;
            info.style.cssText = 'flex:1;';

            const fireToggle = document.createElement('button');
            const isOnFire = state.initialFires.includes(i);
            fireToggle.textContent = isOnFire ? '🔥 着火' : '✅ 安全';
            fireToggle.style.cssText = `
                padding:4px 8px;border-radius:4px;border:none;cursor:pointer;font-size:12px;
                background:${isOnFire ? 'rgba(255,80,0,0.3)' : 'rgba(80,200,80,0.2)'};
                color:${isOnFire ? '#ff6b6b' : '#6bdb6b'};
            `;
            fireToggle.addEventListener('click', () => {
                this.toggleFireInEditor(state, i);
                this.renderPuzzleEditorUI(container);
            });

            const delBtn = document.createElement('button');
            delBtn.textContent = '✖';
            delBtn.style.cssText = `
                background:rgba(255,0,0,0.2);border:none;border-radius:4px;
                padding:4px 8px;cursor:pointer;color:#ff6b6b;font-size:12px;
            `;
            delBtn.addEventListener('click', () => {
                this.removeBuildingFromEditor(state, i);
                this.renderPuzzleEditorUI(container);
            });

            row.appendChild(info);
            row.appendChild(fireToggle);
            row.appendChild(delBtn);
            buildingSection.appendChild(row);
        });

        if (state.buildings.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'color:#888;font-size:13px;text-align:center;padding:10px;';
            empty.textContent = '点击上方按钮添加建筑';
            buildingSection.appendChild(empty);
        }

        wrapper.appendChild(buildingSection);

        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 保存自定义谜题';
        saveBtn.style.cssText = `
            width:100%;padding:12px;border-radius:8px;border:none;cursor:pointer;
            background:linear-gradient(135deg,#6C63FF,#48C6EF);color:#fff;font-size:15px;
            font-weight:600;margin-top:10px;
        `;
        saveBtn.addEventListener('click', () => {
            const ok = this.saveCustomPuzzle(state);
            if (ok) {
                this.editorState = this.createEditorState();
                alert('✅ 谜题已保存！');
                this.renderPuzzleEditorUI(container);
            } else {
                alert('❌ 请填写名称、至少添加1栋建筑并标记着火建筑');
            }
        });
        wrapper.appendChild(saveBtn);

        container.appendChild(wrapper);
    }

    // Helpers
    _createField(label, inputFactory) {
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom:12px;';
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:13px;color:#aaa;margin-bottom:4px;';
        lbl.textContent = label;
        div.appendChild(lbl);
        div.appendChild(inputFactory());
        return div;
    }

    _createSlider(label, value, min, max, step, onChange) {
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom:12px;';

        const top = document.createElement('div');
        top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;';

        const lbl = document.createElement('span');
        lbl.style.cssText = 'font-size:13px;color:#aaa;';
        lbl.textContent = label;

        const val = document.createElement('span');
        val.style.cssText = 'font-size:14px;color:#fff;font-weight:600;';
        val.textContent = value;

        top.appendChild(lbl);
        top.appendChild(val);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value;
        slider.style.cssText = 'width:100%;accent-color:#6C63FF;';

        slider.addEventListener('input', () => {
            val.textContent = slider.value;
            onChange(Number(slider.value));
        });

        div.appendChild(top);
        div.appendChild(slider);
        return div;
    }
}
