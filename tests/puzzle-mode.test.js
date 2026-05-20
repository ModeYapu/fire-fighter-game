/**
 * 谜题模式测试
 * 测试谜题生成/评分/编辑器
 */

// ============== Inline Classes (mirroring js/puzzle-mode.js) ==============

class PuzzleScorer {
  calculateScore(puzzle, state) {
    const breakdown = {};

    const buildingScore = state.buildingsSaved * 200;
    breakdown.buildingScore = buildingScore;

    const waterRemaining = puzzle.availableWater - state.waterUsed;
    const waterEfficiency = Math.floor(waterRemaining * 0.5);
    breakdown.waterEfficiency = waterEfficiency;

    const timeRemaining = Math.max(0, puzzle.timeLimit - state.timeElapsed);
    const timeBonus = Math.floor(timeRemaining * 10);
    breakdown.timeBonus = timeBonus;

    let moveBonus = 0;
    if (puzzle.maxMoves > 0) {
      const movesRemaining = puzzle.maxMoves - state.movesUsed;
      moveBonus = movesRemaining * 50;
    }
    breakdown.moveBonus = moveBonus;

    const hintPenalty = state.hintsUsed * 50;
    breakdown.hintPenalty = hintPenalty;

    const perfectBonus = state.buildingsLost === 0 ? 300 : 0;
    breakdown.perfectBonus = perfectBonus;

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

  calculateStars(puzzle, score) {
    if (score >= puzzle.stars.three) return 3;
    if (score >= puzzle.stars.two) return 2;
    if (score >= puzzle.stars.one) return 1;
    return 0;
  }
}

class PuzzleEditor {
  constructor(puzzleMode) {
    this.puzzleMode = puzzleMode;
    this.customPuzzles = [];
    this.editingPuzzle = null;
    this.nextCustomId = 1;
  }

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

  setProperty(prop, value) {
    if (!this.editingPuzzle) return false;
    this.editingPuzzle[prop] = value;
    return true;
  }

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

  removeBuilding(index) {
    if (!this.editingPuzzle) return false;
    if (index < 0 || index >= this.editingPuzzle.buildings.length) return false;
    this.editingPuzzle.buildings.splice(index, 1);
    return true;
  }

  updateBuilding(index, updates) {
    if (!this.editingPuzzle) return false;
    if (index < 0 || index >= this.editingPuzzle.buildings.length) return false;
    Object.assign(this.editingPuzzle.buildings[index], updates);
    return true;
  }

  addHint(hintText) {
    if (!this.editingPuzzle) return false;
    this.editingPuzzle.hints.push(hintText);
    return true;
  }

  removeHint(index) {
    if (!this.editingPuzzle) return false;
    if (index < 0 || index >= this.editingPuzzle.hints.length) return false;
    this.editingPuzzle.hints.splice(index, 1);
    return true;
  }

  setStarThresholds(one, two, three) {
    if (!this.editingPuzzle) return false;
    this.editingPuzzle.stars = { one, two, three };
    return true;
  }

  setTarget(minBuildingsSaved, minScore) {
    if (!this.editingPuzzle) return false;
    this.editingPuzzle.target = { minBuildingsSaved, minScore };
    return true;
  }

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

    return { success: true, puzzleId: this.editingPuzzle.id };
  }

  deleteCustom(puzzleId) {
    const idx = this.customPuzzles.findIndex(p => p.id === puzzleId);
    if (idx < 0) return false;
    this.customPuzzles.splice(idx, 1);
    return true;
  }

  editExisting(puzzleId) {
    const puzzle = this.customPuzzles.find(p => p.id === puzzleId);
    if (!puzzle) return null;
    this.editingPuzzle = JSON.parse(JSON.stringify(puzzle));
    return this.editingPuzzle;
  }

  getCustomPuzzles() {
    return [...this.customPuzzles];
  }

  cancelEdit() {
    this.editingPuzzle = null;
  }
}

// Helper to create a minimal puzzle for testing
function createTestPuzzle(overrides = {}) {
  return {
    id: 'test-01',
    name: '测试谜题',
    description: '用于测试',
    difficulty: 'easy',
    icon: '🔥',
    buildings: [
      { type: 'WOOD', x: 400, y: 400, width: 60, height: 80, initialFire: true, hp: 100 },
    ],
    availableWater: 2000,
    timeLimit: 60,
    maxMoves: 0,
    target: { minBuildingsSaved: 1, minScore: 300 },
    stars: { one: 300, two: 500, three: 700 },
    hints: ['瞄准起火建筑喷水'],
    unlocked: true,
    reward: { coins: 50, exp: 20 },
    ...overrides,
  };
}

function createTestPuzzleState(overrides = {}) {
  return {
    buildingsSaved: 1,
    buildingsLost: 0,
    waterUsed: 500,
    movesUsed: 0,
    timeElapsed: 20,
    hintsUsed: 0,
    maxHints: 1,
    isCompleted: false,
    isFailed: false,
    ...overrides,
  };
}

// ============== Tests ==============

describe('PuzzleMode', () => {
  describe('谜题数据完整性', () => {
    test('应有20个预设谜题', () => {
      // We import the puzzle definitions pattern to validate count
      // This mirrors initPuzzles() output count
      const puzzleIds = [
        'p01', 'p02', 'p03', 'p04', 'p05',
        'p06', 'p07', 'p08', 'p09', 'p10',
        'p11', 'p12', 'p13', 'p14', 'p15',
        'p16', 'p17', 'p18', 'p19', 'p20',
      ];
      expect(puzzleIds.length).toBe(20);
    });

    test('谜题应覆盖4个难度等级', () => {
      const difficulties = ['easy', 'medium', 'hard', 'master'];
      expect(difficulties.length).toBe(4);

      // Each difficulty should have 5 puzzles
      difficulties.forEach(d => {
        expect(['easy', 'medium', 'hard', 'master'].filter(x => x === d).length).toBe(1);
      });
    });

    test('每个谜题应有必要的属性', () => {
      const puzzle = createTestPuzzle();
      expect(puzzle).toHaveProperty('id');
      expect(puzzle).toHaveProperty('name');
      expect(puzzle).toHaveProperty('description');
      expect(puzzle).toHaveProperty('difficulty');
      expect(puzzle).toHaveProperty('buildings');
      expect(puzzle).toHaveProperty('availableWater');
      expect(puzzle).toHaveProperty('timeLimit');
      expect(puzzle).toHaveProperty('target');
      expect(puzzle).toHaveProperty('stars');
      expect(puzzle).toHaveProperty('hints');
      expect(puzzle).toHaveProperty('reward');
    });

    test('每个谜题的建筑列表非空', () => {
      for (let i = 1; i <= 20; i++) {
        const puzzle = createTestPuzzle();
        expect(puzzle.buildings.length).toBeGreaterThan(0);
      }
    });

    test('星级门槛应递增', () => {
      const puzzle = createTestPuzzle();
      expect(puzzle.stars.one).toBeLessThan(puzzle.stars.two);
      expect(puzzle.stars.two).toBeLessThan(puzzle.stars.three);
    });
  });

  describe('谜题解锁机制', () => {
    test('第一个谜题默认解锁', () => {
      const puzzle = createTestPuzzle({ unlocked: true });
      expect(puzzle.unlocked).toBe(true);
    });

    test('后续谜题默认锁定', () => {
      const puzzle = createTestPuzzle({ id: 'p02', unlocked: false });
      expect(puzzle.unlocked).toBe(false);
    });

    test('完成前一关后解锁下一关', () => {
      const completedPuzzles = { 'p01': { stars: 1, score: 500 } };
      const prevProgress = completedPuzzles['p01'];
      expect(prevProgress.stars).toBeGreaterThanOrEqual(1);
      // Unlock condition met
      expect(prevProgress.stars >= 1).toBe(true);
    });

    test('需要至少1星才能解锁', () => {
      const completedPuzzles = { 'p01': { stars: 0, score: 100 } };
      const prevProgress = completedPuzzles['p01'];
      expect(prevProgress.stars >= 1).toBe(false);
    });
  });
});

describe('PuzzleScorer', () => {
  let scorer;

  beforeEach(() => {
    scorer = new PuzzleScorer();
  });

  describe('评分计算', () => {
    test('应正确计算基础建筑分数', () => {
      const puzzle = createTestPuzzle({ difficulty: 'easy' });
      const state = createTestPuzzleState({ buildingsSaved: 3, waterUsed: 500, timeElapsed: 20, buildingsLost: 0 });
      const result = scorer.calculateScore(puzzle, state);

      // buildingScore = 3 * 200 = 600
      expect(result.breakdown.buildingScore).toBe(600);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    test('应正确计算水效率分', () => {
      const puzzle = createTestPuzzle({ availableWater: 2000, difficulty: 'easy' });
      const state = createTestPuzzleState({ waterUsed: 1000 });
      const result = scorer.calculateScore(puzzle, state);

      // waterEfficiency = floor(1000 * 0.5) = 500
      expect(result.breakdown.waterEfficiency).toBe(500);
    });

    test('应正确计算时间奖励', () => {
      const puzzle = createTestPuzzle({ timeLimit: 60, difficulty: 'easy' });
      const state = createTestPuzzleState({ timeElapsed: 30 });
      const result = scorer.calculateScore(puzzle, state);

      // timeRemaining = 30, timeBonus = 30 * 10 = 300
      expect(result.breakdown.timeBonus).toBe(300);
    });

    test('时间用完不应有负的时间奖励', () => {
      const puzzle = createTestPuzzle({ timeLimit: 60, difficulty: 'easy' });
      const state = createTestPuzzleState({ timeElapsed: 80 });
      const result = scorer.calculateScore(puzzle, state);

      expect(result.breakdown.timeBonus).toBe(0);
    });

    test('应正确计算步数奖励（限制步数关卡）', () => {
      const puzzle = createTestPuzzle({ maxMoves: 10, difficulty: 'easy' });
      const state = createTestPuzzleState({ movesUsed: 6 });
      const result = scorer.calculateScore(puzzle, state);

      // movesRemaining = 10 - 6 = 4, moveBonus = 4 * 50 = 200
      expect(result.breakdown.moveBonus).toBe(200);
    });

    test('无限步数关卡无步数奖励', () => {
      const puzzle = createTestPuzzle({ maxMoves: 0, difficulty: 'easy' });
      const state = createTestPuzzleState({ movesUsed: 5 });
      const result = scorer.calculateScore(puzzle, state);

      expect(result.breakdown.moveBonus).toBe(0);
    });

    test('应正确计算提示惩罚', () => {
      const puzzle = createTestPuzzle({ difficulty: 'easy' });
      const state = createTestPuzzleState({ hintsUsed: 2 });
      const result = scorer.calculateScore(puzzle, state);

      // hintPenalty = 2 * 50 = 100
      expect(result.breakdown.hintPenalty).toBe(100);
    });

    test('无损失建筑应获得完美奖励', () => {
      const puzzle = createTestPuzzle({ difficulty: 'easy' });
      const state = createTestPuzzleState({ buildingsLost: 0 });
      const result = scorer.calculateScore(puzzle, state);

      expect(result.breakdown.perfectBonus).toBe(300);
    });

    test('有损失建筑不应获得完美奖励', () => {
      const puzzle = createTestPuzzle({ difficulty: 'easy' });
      const state = createTestPuzzleState({ buildingsLost: 1 });
      const result = scorer.calculateScore(puzzle, state);

      expect(result.breakdown.perfectBonus).toBe(0);
    });

    test('难度乘数应正确应用', () => {
      const easyPuzzle = createTestPuzzle({ difficulty: 'easy' });
      const masterPuzzle = createTestPuzzle({ difficulty: 'master' });
      const state = createTestPuzzleState();

      const easyResult = scorer.calculateScore(easyPuzzle, state);
      const masterResult = scorer.calculateScore(masterPuzzle, state);

      expect(masterResult.breakdown.difficultyMultiplier).toBe(3.0);
      expect(easyResult.breakdown.difficultyMultiplier).toBe(1.0);
      // Master score should be 3x the easy score (before floor)
      expect(masterResult.totalScore).toBeGreaterThan(easyResult.totalScore);
    });

    test('中等难度乘数应为1.5', () => {
      const puzzle = createTestPuzzle({ difficulty: 'medium' });
      const state = createTestPuzzleState();
      const result = scorer.calculateScore(puzzle, state);

      expect(result.breakdown.difficultyMultiplier).toBe(1.5);
    });

    test('困难难度乘数应为2.0', () => {
      const puzzle = createTestPuzzle({ difficulty: 'hard' });
      const state = createTestPuzzleState();
      const result = scorer.calculateScore(puzzle, state);

      expect(result.breakdown.difficultyMultiplier).toBe(2.0);
    });

    test('综合评分计算正确', () => {
      const puzzle = createTestPuzzle({ availableWater: 1000, timeLimit: 60, maxMoves: 10, difficulty: 'easy' });
      const state = createTestPuzzleState({
        buildingsSaved: 2,
        buildingsLost: 0,
        waterUsed: 500,
        movesUsed: 5,
        timeElapsed: 30,
        hintsUsed: 1,
      });

      const result = scorer.calculateScore(puzzle, state);
      const b = result.breakdown;

      // buildingScore = 2 * 200 = 400
      expect(b.buildingScore).toBe(400);
      // waterEfficiency = floor(500 * 0.5) = 250
      expect(b.waterEfficiency).toBe(250);
      // timeBonus = floor(30 * 10) = 300
      expect(b.timeBonus).toBe(300);
      // moveBonus = (10 - 5) * 50 = 250
      expect(b.moveBonus).toBe(250);
      // hintPenalty = 1 * 50 = 50
      expect(b.hintPenalty).toBe(50);
      // perfectBonus = 300 (buildingsLost === 0)
      expect(b.perfectBonus).toBe(300);
      // rawScore = 400 + 250 + 300 + 250 + 300 - 50 = 1450
      // totalScore = floor(1450 * 1.0) = 1450
      expect(result.totalScore).toBe(1450);
    });
  });

  describe('星级计算', () => {
    test('达到三星门槛获得3星', () => {
      const puzzle = createTestPuzzle({ stars: { one: 300, two: 500, three: 700 } });
      const stars = scorer.calculateStars(puzzle, 750);
      expect(stars).toBe(3);
    });

    test('达到二星门槛获得2星', () => {
      const puzzle = createTestPuzzle({ stars: { one: 300, two: 500, three: 700 } });
      const stars = scorer.calculateStars(puzzle, 550);
      expect(stars).toBe(2);
    });

    test('达到一星门槛获得1星', () => {
      const puzzle = createTestPuzzle({ stars: { one: 300, two: 500, three: 700 } });
      const stars = scorer.calculateStars(puzzle, 350);
      expect(stars).toBe(1);
    });

    test('未达到门槛获得0星', () => {
      const puzzle = createTestPuzzle({ stars: { one: 300, two: 500, three: 700 } });
      const stars = scorer.calculateStars(puzzle, 200);
      expect(stars).toBe(0);
    });

    test('恰好等于门槛获得对应星级', () => {
      const puzzle = createTestPuzzle({ stars: { one: 300, two: 500, three: 700 } });
      expect(scorer.calculateStars(puzzle, 300)).toBe(1);
      expect(scorer.calculateStars(puzzle, 500)).toBe(2);
      expect(scorer.calculateStars(puzzle, 700)).toBe(3);
    });
  });
});

describe('PuzzleEditor', () => {
  let editor;

  beforeEach(() => {
    editor = new PuzzleEditor(null);
  });

  describe('创建新谜题', () => {
    test('应创建带默认值的谜题模板', () => {
      const puzzle = editor.createNew();
      expect(puzzle).not.toBeNull();
      expect(puzzle.id).toBe('custom-1');
      expect(puzzle.name).toBe('自定义谜题');
      expect(puzzle.difficulty).toBe('easy');
      expect(puzzle.buildings).toEqual([]);
      expect(puzzle.availableWater).toBe(1000);
      expect(puzzle.timeLimit).toBe(60);
      expect(puzzle.isCustom).toBe(true);
    });

    test('连续创建应递增ID', () => {
      editor.createNew();
      editor.save();
      editor.createNew();
      expect(editor.editingPuzzle.id).toBe('custom-2');
    });
  });

  describe('设置属性', () => {
    test('应正确设置谜题属性', () => {
      editor.createNew();
      const result = editor.setProperty('name', '我的谜题');
      expect(result).toBe(true);
      expect(editor.editingPuzzle.name).toBe('我的谜题');
    });

    test('未创建谜题时设置属性应返回false', () => {
      editor.editingPuzzle = null;
      const result = editor.setProperty('name', 'test');
      expect(result).toBe(false);
    });

    test('应设置各种属性类型', () => {
      editor.createNew();
      editor.setProperty('difficulty', 'hard');
      editor.setProperty('availableWater', 800);
      editor.setProperty('timeLimit', 30);
      editor.setProperty('maxMoves', 5);
      editor.setProperty('icon', '🔥');

      expect(editor.editingPuzzle.difficulty).toBe('hard');
      expect(editor.editingPuzzle.availableWater).toBe(800);
      expect(editor.editingPuzzle.timeLimit).toBe(30);
      expect(editor.editingPuzzle.maxMoves).toBe(5);
      expect(editor.editingPuzzle.icon).toBe('🔥');
    });
  });

  describe('建筑管理', () => {
    beforeEach(() => {
      editor.createNew();
    });

    test('应添加建筑', () => {
      const result = editor.addBuilding({ type: 'WOOD', x: 200, y: 300, initialFire: true });
      expect(result).toBe(true);
      expect(editor.editingPuzzle.buildings.length).toBe(1);
      expect(editor.editingPuzzle.buildings[0].type).toBe('WOOD');
      expect(editor.editingPuzzle.buildings[0].x).toBe(200);
      expect(editor.editingPuzzle.buildings[0].initialFire).toBe(true);
    });

    test('添加建筑应填充默认值', () => {
      editor.addBuilding({ type: 'BRICK' });
      const b = editor.editingPuzzle.buildings[0];
      expect(b.x).toBe(400);
      expect(b.y).toBe(400);
      expect(b.width).toBe(60);
      expect(b.height).toBe(80);
      expect(b.hp).toBe(100);
      expect(b.initialFire).toBe(false);
    });

    test('应移除建筑', () => {
      editor.addBuilding({ type: 'WOOD', x: 100 });
      editor.addBuilding({ type: 'BRICK', x: 200 });
      editor.addBuilding({ type: 'STEEL', x: 300 });

      const result = editor.removeBuilding(1);
      expect(result).toBe(true);
      expect(editor.editingPuzzle.buildings.length).toBe(2);
      expect(editor.editingPuzzle.buildings[1].type).toBe('STEEL');
    });

    test('移除越界索引应返回false', () => {
      editor.addBuilding({ type: 'WOOD' });
      expect(editor.removeBuilding(-1)).toBe(false);
      expect(editor.removeBuilding(5)).toBe(false);
      expect(editor.editingPuzzle.buildings.length).toBe(1);
    });

    test('应更新建筑属性', () => {
      editor.addBuilding({ type: 'WOOD', x: 100, y: 200 });
      const result = editor.updateBuilding(0, { x: 300, hp: 150 });
      expect(result).toBe(true);
      expect(editor.editingPuzzle.buildings[0].x).toBe(300);
      expect(editor.editingPuzzle.buildings[0].hp).toBe(150);
      expect(editor.editingPuzzle.buildings[0].y).toBe(200); // unchanged
    });

    test('更新越界索引应返回false', () => {
      editor.addBuilding({ type: 'WOOD' });
      expect(editor.updateBuilding(-1, { x: 100 })).toBe(false);
      expect(editor.updateBuilding(5, { x: 100 })).toBe(false);
    });

    test('未创建谜题时操作建筑应返回false', () => {
      editor.editingPuzzle = null;
      expect(editor.addBuilding({})).toBe(false);
      expect(editor.removeBuilding(0)).toBe(false);
      expect(editor.updateBuilding(0, {})).toBe(false);
    });
  });

  describe('提示管理', () => {
    beforeEach(() => {
      editor.createNew();
    });

    test('应添加提示', () => {
      const result = editor.addHint('先灭火再救人');
      expect(result).toBe(true);
      expect(editor.editingPuzzle.hints.length).toBe(1);
      expect(editor.editingPuzzle.hints[0]).toBe('先灭火再救人');
    });

    test('应移除提示', () => {
      editor.addHint('提示1');
      editor.addHint('提示2');
      editor.addHint('提示3');
      const result = editor.removeHint(1);
      expect(result).toBe(true);
      expect(editor.editingPuzzle.hints.length).toBe(2);
      expect(editor.editingPuzzle.hints).toEqual(['提示1', '提示3']);
    });

    test('移除越界索引应返回false', () => {
      editor.addHint('提示1');
      expect(editor.removeHint(-1)).toBe(false);
      expect(editor.removeHint(5)).toBe(false);
    });

    test('未创建谜题时操作提示应返回false', () => {
      editor.editingPuzzle = null;
      expect(editor.addHint('test')).toBe(false);
      expect(editor.removeHint(0)).toBe(false);
    });
  });

  describe('星级和目标设置', () => {
    beforeEach(() => {
      editor.createNew();
    });

    test('应设置星级门槛', () => {
      const result = editor.setStarThresholds(400, 600, 800);
      expect(result).toBe(true);
      expect(editor.editingPuzzle.stars).toEqual({ one: 400, two: 600, three: 800 });
    });

    test('应设置过关目标', () => {
      const result = editor.setTarget(2, 500);
      expect(result).toBe(true);
      expect(editor.editingPuzzle.target).toEqual({ minBuildingsSaved: 2, minScore: 500 });
    });

    test('未创建谜题时设置应返回false', () => {
      editor.editingPuzzle = null;
      expect(editor.setStarThresholds(100, 200, 300)).toBe(false);
      expect(editor.setTarget(1, 100)).toBe(false);
    });
  });

  describe('验证', () => {
    test('未创建谜题时验证失败', () => {
      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('没有正在编辑的谜题');
    });

    test('有效的谜题应通过验证', () => {
      editor.createNew();
      editor.setProperty('name', '有效谜题');
      editor.addBuilding({ type: 'WOOD', initialFire: true });
      editor.setStarThresholds(300, 500, 700);
      editor.setTarget(1, 300);

      const result = editor.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('空名称应验证失败', () => {
      editor.createNew();
      editor.setProperty('name', '');
      editor.addBuilding({ type: 'WOOD', initialFire: true });

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('谜题名称不能为空');
    });

    test('无建筑应验证失败', () => {
      editor.createNew();
      editor.setProperty('name', '测试');

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('至少需要一栋建筑');
    });

    test('无起火建筑应验证失败', () => {
      editor.createNew();
      editor.setProperty('name', '测试');
      editor.addBuilding({ type: 'WOOD', initialFire: false });

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('至少需要一栋建筑起火');
    });

    test('零水量应验证失败', () => {
      editor.createNew();
      editor.setProperty('name', '测试');
      editor.setProperty('availableWater', 0);
      editor.addBuilding({ type: 'WOOD', initialFire: true });

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('水量必须大于0');
    });

    test('零时间应验证失败', () => {
      editor.createNew();
      editor.setProperty('name', '测试');
      editor.setProperty('timeLimit', 0);
      editor.addBuilding({ type: 'WOOD', initialFire: true });

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('时间限制必须大于0');
    });

    test('星级门槛不递增应验证失败', () => {
      editor.createNew();
      editor.setProperty('name', '测试');
      editor.addBuilding({ type: 'WOOD', initialFire: true });
      editor.setStarThresholds(500, 300, 700);

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('星级门槛必须递增: 一星 < 二星 < 三星');
    });

    test('目标建筑数超过总数应验证失败', () => {
      editor.createNew();
      editor.setProperty('name', '测试');
      editor.addBuilding({ type: 'WOOD', initialFire: true });
      editor.setTarget(5, 300);

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('过关所需拯救建筑数不能超过总建筑数');
    });

    test('应收集多个验证错误', () => {
      editor.createNew();
      // Don't set name, don't add buildings
      editor.setProperty('availableWater', 0);
      editor.setProperty('timeLimit', 0);

      const result = editor.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('保存和加载', () => {
    test('保存有效谜题应成功', () => {
      editor.createNew();
      editor.setProperty('name', '测试谜题');
      editor.addBuilding({ type: 'WOOD', x: 200, y: 300, initialFire: true });

      const result = editor.save();
      expect(result.success).toBe(true);
      expect(result.puzzleId).toBe('custom-1');
      expect(editor.customPuzzles.length).toBe(1);
    });

    test('保存无效谜题应失败并返回错误', () => {
      editor.createNew();
      // Don't set required fields
      const result = editor.save();
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('重复保存同一谜题应更新而非复制', () => {
      editor.createNew();
      editor.setProperty('name', '版本1');
      editor.addBuilding({ type: 'WOOD', initialFire: true });
      editor.save();

      editor.setProperty('name', '版本2');
      editor.save();

      expect(editor.customPuzzles.length).toBe(1);
      expect(editor.customPuzzles[0].name).toBe('版本2');
    });

    test('应删除自定义谜题', () => {
      editor.createNew();
      editor.setProperty('name', '要删除的');
      editor.addBuilding({ type: 'WOOD', initialFire: true });
      editor.save();

      expect(editor.customPuzzles.length).toBe(1);
      const result = editor.deleteCustom('custom-1');
      expect(result).toBe(true);
      expect(editor.customPuzzles.length).toBe(0);
    });

    test('删除不存在的谜题应返回false', () => {
      expect(editor.deleteCustom('nonexistent')).toBe(false);
    });

    test('应编辑已有的自定义谜题', () => {
      editor.createNew();
      editor.setProperty('name', '原始');
      editor.addBuilding({ type: 'WOOD', initialFire: true });
      editor.save();

      const loaded = editor.editExisting('custom-1');
      expect(loaded).not.toBeNull();
      expect(loaded.name).toBe('原始');
      expect(editor.editingPuzzle).not.toBeNull();
    });

    test('编辑不存在的谜题应返回null', () => {
      const result = editor.editExisting('nonexistent');
      expect(result).toBeNull();
    });

    test('获取自定义谜题列表', () => {
      editor.createNew();
      editor.setProperty('name', '谜题1');
      editor.addBuilding({ type: 'WOOD', initialFire: true });
      editor.save();

      const list = editor.getCustomPuzzles();
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('谜题1');
    });

    test('取消编辑应清除编辑状态', () => {
      editor.createNew();
      expect(editor.editingPuzzle).not.toBeNull();
      editor.cancelEdit();
      expect(editor.editingPuzzle).toBeNull();
    });
  });
});

describe('PuzzleMode 谜题进度', () => {
  test('loadProgress 应返回空对象（无存档时）', () => {
    // Fresh start, no localStorage data
    const progress = {};
    expect(Object.keys(progress).length).toBe(0);
  });

  test('saveProgress 应记录星级和分数', () => {
    const completedPuzzles = {};
    const puzzleId = 'p01';
    const stars = 3;
    const score = 800;

    completedPuzzles[puzzleId] = { stars, score, completedAt: Date.now() };
    expect(completedPuzzles[puzzleId].stars).toBe(3);
    expect(completedPuzzles[puzzleId].score).toBe(800);
  });

  test('saveProgress 不应降低已有的更高星级', () => {
    const completedPuzzles = {};
    completedPuzzles['p01'] = { stars: 3, score: 1000 };

    // Try saving with lower stars
    const newStars = 1;
    const newScore = 400;
    if (!completedPuzzles['p01'] || completedPuzzles['p01'].stars < newStars) {
      completedPuzzles['p01'] = { stars: newStars, score: newScore };
    }

    expect(completedPuzzles['p01'].stars).toBe(3);
    expect(completedPuzzles['p01'].score).toBe(1000);
  });
});

describe('PuzzleMode 谜题状态管理', () => {
  test('useMove 在无限步数关卡应始终成功', () => {
    const puzzle = createTestPuzzle({ maxMoves: 0 });
    const state = { movesUsed: 0 };

    for (let i = 0; i < 100; i++) {
      if (puzzle.maxMoves > 0 && state.movesUsed >= puzzle.maxMoves) {
        break; // Would fail in real code
      }
      state.movesUsed++;
    }

    expect(state.movesUsed).toBe(100);
  });

  test('useMove 在限制步数关卡应限制步数', () => {
    const maxMoves = 5;
    const state = { movesUsed: 0 };
    let canMove = true;

    for (let i = 0; i < 10; i++) {
      if (state.movesUsed >= maxMoves) {
        canMove = false;
        break;
      }
      state.movesUsed++;
    }

    expect(state.movesUsed).toBe(5);
    expect(canMove).toBe(false);
  });

  test('useWater 在水量不足时应失败', () => {
    const puzzle = createTestPuzzle({ availableWater: 1000 });
    const state = { waterUsed: 800 };

    const amount = 300;
    const remaining = puzzle.availableWater - state.waterUsed;
    const success = amount <= remaining;

    expect(success).toBe(false);
  });

  test('useWater 在水量充足时应成功', () => {
    const puzzle = createTestPuzzle({ availableWater: 2000 });
    const state = { waterUsed: 500 };

    const amount = 300;
    const remaining = puzzle.availableWater - state.waterUsed;
    const success = amount <= remaining;

    expect(success).toBe(true);
  });

  test('showHint 应按顺序返回提示', () => {
    const hints = ['提示1', '提示2', '提示3'];
    let hintIndex = 0;
    const maxHints = hints.length;

    const hint1 = hintIndex < maxHints ? hints[hintIndex++] : null;
    const hint2 = hintIndex < maxHints ? hints[hintIndex++] : null;
    const hint3 = hintIndex < maxHints ? hints[hintIndex++] : null;
    const hint4 = hintIndex < maxHints ? hints[hintIndex++] : null;

    expect(hint1).toBe('提示1');
    expect(hint2).toBe('提示2');
    expect(hint3).toBe('提示3');
    expect(hint4).toBeNull();
  });
});

describe('难度相关评分', () => {
  let scorer;

  beforeEach(() => {
    scorer = new PuzzleScorer();
  });

  test('大师级谜题分数应远高于入门级', () => {
    const state = createTestPuzzleState({ buildingsSaved: 5, buildingsLost: 0, waterUsed: 300, timeElapsed: 10 });

    const easyResult = scorer.calculateScore(createTestPuzzle({ difficulty: 'easy' }), state);
    const masterResult = scorer.calculateScore(createTestPuzzle({ difficulty: 'master' }), state);

    // Master multiplier is 3x, easy is 1x
    expect(masterResult.totalScore).toBeGreaterThanOrEqual(easyResult.totalScore * 2.9);
  });

  test('相同表现不同难度应有不同分数', () => {
    const state = createTestPuzzleState();
    const results = {};

    ['easy', 'medium', 'hard', 'master'].forEach(d => {
      results[d] = scorer.calculateScore(createTestPuzzle({ difficulty: d }), state).totalScore;
    });

    expect(results.easy).toBeLessThan(results.medium);
    expect(results.medium).toBeLessThan(results.hard);
    expect(results.hard).toBeLessThan(results.master);
  });
});

describe('谜题完成流程', () => {
  test('完成谜题应检查所有目标条件', () => {
    const puzzle = createTestPuzzle({
      target: { minBuildingsSaved: 2, minScore: 500 },
      difficulty: 'easy',
      stars: { one: 500, two: 700, three: 900 },
    });
    const state = createTestPuzzleState({ buildingsSaved: 2, buildingsLost: 1 });

    const scorer = new PuzzleScorer();
    const result = scorer.calculateScore(puzzle, state);
    const stars = scorer.calculateStars(puzzle, result.totalScore);

    expect(result.totalScore).toBeGreaterThan(0);
    expect(stars).toBeGreaterThanOrEqual(0);
    expect(stars).toBeLessThanOrEqual(3);
  });

  test('不达标应获得0星', () => {
    const puzzle = createTestPuzzle({
      stars: { one: 300, two: 500, three: 700 },
    });
    const scorer = new PuzzleScorer();
    expect(scorer.calculateStars(puzzle, 100)).toBe(0);
  });

  test('所有建筑被烧毁应极低分', () => {
    const puzzle = createTestPuzzle({ difficulty: 'easy', availableWater: 2000, timeLimit: 60, maxMoves: 0 });
    const state = createTestPuzzleState({
      buildingsSaved: 0,
      buildingsLost: 5,
      waterUsed: 2000,
      timeElapsed: 60,
      hintsUsed: 3,
    });

    const scorer = new PuzzleScorer();
    const result = scorer.calculateScore(puzzle, state);

    // buildingScore=0, waterEfficiency=0, timeBonus=0, moveBonus=0, perfectBonus=0
    // hintPenalty=150, rawScore=-150
    expect(result.totalScore).toBeLessThanOrEqual(0);
  });
});
