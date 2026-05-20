/**
 * 合作模式系统测试
 * 测试双人合作/分屏逻辑
 */

// CoopModeSystem - 合作模式系统类
class CoopModeSystem {
  constructor(game) {
    this.game = game;
    this.isActive = false;
    this.mode = 'split';

    this.player1 = {
      id: 1,
      name: '玩家1',
      role: 'shooter',
      color: '#3498db',
      angle: 45,
      power: 50,
      score: 0,
      waterUsed: 0,
      shotsHit: 0,
    };

    this.player2 = {
      id: 2,
      name: '玩家2',
      role: 'builder',
      color: '#e74c3c',
      selectedFacility: null,
      cursor: { x: 400, y: 300 },
      facilitiesPlaced: 0,
      score: 0,
    };

    this.coopScore = 0;
    this.teamBonus = 0;
    this.syncBonus = 0;
    this.lastActionTime = null;
    this.keys = {};
  }

  startCoopMode(mode = 'shared', levelData = null) {
    this.isActive = true;
    this.mode = mode;

    this.player1.angle = 45;
    this.player1.power = 50;
    this.player1.score = 0;
    this.player1.waterUsed = 0;
    this.player1.shotsHit = 0;

    this.player2.selectedFacility = null;
    this.player2.cursor = { x: 400, y: 300 };
    this.player2.facilitiesPlaced = 0;
    this.player2.score = 0;

    this.coopScore = 0;
    this.teamBonus = 0;
    this.syncBonus = 0;
    this.lastActionTime = null;
  }

  endCoopMode() {
    this.isActive = false;
  }

  shootP1() {
    if (this.game.water <= 0) return false;

    this.game.shootWater?.(this.player1.angle, this.player1.power);
    this.player1.waterUsed += 2;
    this.player1.score += 10;

    this.checkSyncBonus();
    return true;
  }

  placeFacilityP2() {
    if (!this.player2.selectedFacility) return false;

    const success = this.game.placeFacility?.(
      this.player2.selectedFacility,
      this.player2.cursor.x,
      this.player2.cursor.y
    );

    if (success) {
      this.player2.facilitiesPlaced++;
      this.player2.score += 50;
      this.checkSyncBonus();
    }
    return success;
  }

  checkSyncBonus() {
    const now = Date.now();
    if (!this.lastActionTime) {
      this.lastActionTime = now;
      return;
    }

    const timeDiff = now - this.lastActionTime;
    if (timeDiff < 2000) {
      this.syncBonus += 10;
    }

    this.lastActionTime = now;
  }

  updatePlayer1Angle(angle) {
    this.player1.angle = Math.max(0, Math.min(80, angle));
  }

  updatePlayer1Power(power) {
    this.player1.power = Math.max(10, Math.min(100, power));
  }

  updatePlayer2Cursor(x, y) {
    this.player2.cursor.x = Math.max(0, Math.min(800, x));
    this.player2.cursor.y = Math.max(0, Math.min(600, y));
  }

  selectFacilityP2(facility) {
    const facilities = ['HYDRANT', 'FIRE_WALL', 'FIGHTER', 'WATCH_TOWER'];
    if (facilities.includes(facility)) {
      this.player2.selectedFacility = facility;
      return true;
    }
    return false;
  }

  calculateCoopScore() {
    const individualScore = this.player1.score + this.player2.score;
    const teamBonus = Math.floor(individualScore * 0.2);
    const syncBonus = this.syncBonus;

    this.coopScore = individualScore + teamBonus + syncBonus;
    return this.coopScore;
  }

  getCoopRating() {
    const totalActions = this.player1.waterUsed / 2 + this.player2.facilitiesPlaced;
    const syncRatio = this.syncBonus / Math.max(totalActions, 1);

    if (syncRatio > 0.3) {
      return '⭐⭐⭐ 完美配合！';
    } else if (syncRatio > 0.15) {
      return '⭐⭐ 良好合作';
    } else {
      return '⭐ 需要加强配合';
    }
  }

  getPlayer1Stats() {
    return {
      score: this.player1.score,
      waterUsed: this.player1.waterUsed,
      shotsHit: this.player1.shotsHit,
      accuracy: this.player1.waterUsed > 0 ? this.player1.shotsHit / (this.player1.waterUsed / 2) : 0,
    };
  }

  getPlayer2Stats() {
    return {
      score: this.player2.score,
      facilitiesPlaced: this.player2.facilitiesPlaced,
      selectedFacility: this.player2.selectedFacility,
    };
  }

  getTotalScore() {
    return this.player1.score + this.player2.score + this.syncBonus;
  }

  isSplitMode() {
    return this.mode === 'split';
  }

  isSharedMode() {
    return this.mode === 'shared';
  }
}

describe('CoopModeSystem', () => {
  let coopSystem;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      water: 1000,
      stats: { shotsHit: 0 },
      inputManager: { angle: 45, power: 50 },
      shootWater: jest.fn(),
      placeFacility: jest.fn(),
      startLevelWithCustomData: jest.fn(),
    };
    coopSystem = new CoopModeSystem(mockGame);
  });

  describe('初始化', () => {
    test('应该正确初始化', () => {
      expect(coopSystem.isActive).toBe(false);
      expect(coopSystem.mode).toBe('split');
    });

    test('玩家1应该有正确的初始值', () => {
      expect(coopSystem.player1.id).toBe(1);
      expect(coopSystem.player1.role).toBe('shooter');
      expect(coopSystem.player1.angle).toBe(45);
      expect(coopSystem.player1.power).toBe(50);
    });

    test('玩家2应该有正确的初始值', () => {
      expect(coopSystem.player2.id).toBe(2);
      expect(coopSystem.player2.role).toBe('builder');
      expect(coopSystem.player2.cursor.x).toBe(400);
      expect(coopSystem.player2.cursor.y).toBe(300);
    });
  });

  describe('启动和结束', () => {
    test('启动合作模式应该激活系统', () => {
      coopSystem.startCoopMode('shared');

      expect(coopSystem.isActive).toBe(true);
      expect(coopSystem.mode).toBe('shared');
    });

    test('启动分屏模式应该设置正确模式', () => {
      coopSystem.startCoopMode('split');

      expect(coopSystem.mode).toBe('split');
      expect(coopSystem.isSplitMode()).toBe(true);
      expect(coopSystem.isSharedMode()).toBe(false);
    });

    test('启动同屏模式应该设置正确模式', () => {
      coopSystem.startCoopMode('shared');

      expect(coopSystem.mode).toBe('shared');
      expect(coopSystem.isSharedMode()).toBe(true);
      expect(coopSystem.isSplitMode()).toBe(false);
    });

    test('启动应该重置玩家数据', () => {
      coopSystem.player1.score = 1000;
      coopSystem.player2.facilitiesPlaced = 5;

      coopSystem.startCoopMode('shared');

      expect(coopSystem.player1.score).toBe(0);
      expect(coopSystem.player2.facilitiesPlaced).toBe(0);
    });

    test('结束合作模式应该停用系统', () => {
      coopSystem.startCoopMode('shared');
      coopSystem.endCoopMode();

      expect(coopSystem.isActive).toBe(false);
    });
  });

  describe('玩家1操作', () => {
    beforeEach(() => {
      coopSystem.startCoopMode('shared');
    });

    test('发射水柱应该消耗水并增加分数', () => {
      const initialWater = mockGame.water;
      const initialScore = coopSystem.player1.score;

      coopSystem.shootP1();

      expect(coopSystem.player1.waterUsed).toBe(2);
      expect(coopSystem.player1.score).toBe(initialScore + 10);
      expect(mockGame.shootWater).toHaveBeenCalledWith(45, 50);
    });

    test('发射水柱应该记录动作时间', () => {
      coopSystem.shootP1();

      expect(coopSystem.lastActionTime).not.toBeNull();
    });

    test('水量不足时不能发射', () => {
      mockGame.water = 0;

      const result = coopSystem.shootP1();

      expect(result).toBe(false);
      expect(mockGame.shootWater).not.toHaveBeenCalled();
    });

    test('角度更新应该在范围内', () => {
      coopSystem.updatePlayer1Angle(90);

      expect(coopSystem.player1.angle).toBe(80);

      coopSystem.updatePlayer1Angle(-10);

      expect(coopSystem.player1.angle).toBe(0);
    });

    test('力度更新应该在范围内', () => {
      coopSystem.updatePlayer1Power(150);

      expect(coopSystem.player1.power).toBe(100);

      coopSystem.updatePlayer1Power(5);

      expect(coopSystem.player1.power).toBe(10);
    });
  });

  describe('玩家2操作', () => {
    beforeEach(() => {
      coopSystem.startCoopMode('shared');
    });

    test('选择设施应该成功', () => {
      const result = coopSystem.selectFacilityP2('HYDRANT');

      expect(result).toBe(true);
      expect(coopSystem.player2.selectedFacility).toBe('HYDRANT');
    });

    test('选择无效设施应该失败', () => {
      const result = coopSystem.selectFacilityP2('INVALID');

      expect(result).toBe(false);
      expect(coopSystem.player2.selectedFacility).toBeNull();
    });

    test('放置设施应该增加分数', () => {
      mockGame.placeFacility.mockReturnValue(true);
      coopSystem.selectFacilityP2('FIRE_WALL');

      coopSystem.placeFacilityP2();

      expect(coopSystem.player2.facilitiesPlaced).toBe(1);
      expect(coopSystem.player2.score).toBeGreaterThanOrEqual(50);
      expect(mockGame.placeFacility).toHaveBeenCalledWith('FIRE_WALL', 400, 300);
    });

    test('放置失败不应增加分数', () => {
      mockGame.placeFacility.mockReturnValue(false);
      coopSystem.selectFacilityP2('HYDRANT');
      const initialScore = coopSystem.player2.score;

      coopSystem.placeFacilityP2();

      expect(coopSystem.player2.facilitiesPlaced).toBe(0);
      expect(coopSystem.player2.score).toBe(initialScore);
    });

    test('未选择设施时不能放置', () => {
      mockGame.placeFacility.mockReturnValue(true);

      const result = coopSystem.placeFacilityP2();

      expect(result).toBe(false);
    });

    test('光标更新应该在范围内', () => {
      coopSystem.updatePlayer2Cursor(900, 700);

      expect(coopSystem.player2.cursor.x).toBe(800);
      expect(coopSystem.player2.cursor.y).toBe(600);

      coopSystem.updatePlayer2Cursor(-50, -100);

      expect(coopSystem.player2.cursor.x).toBe(0);
      expect(coopSystem.player2.cursor.y).toBe(0);
    });
  });

  describe('同步奖励', () => {
    beforeEach(() => {
      coopSystem.startCoopMode('shared');
    });

    test('首次动作不触发奖励', () => {
      coopSystem.shootP1();

      expect(coopSystem.syncBonus).toBe(0);
    });

    test('2秒内连续动作应该触发奖励', () => {
      coopSystem.shootP1();
      const initialBonus = coopSystem.syncBonus;

      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);

      coopSystem.selectFacilityP2('HYDRANT');
      mockGame.placeFacility.mockReturnValue(true);
      coopSystem.placeFacilityP2();

      expect(coopSystem.syncBonus).toBeGreaterThan(initialBonus);
    });

    test('超过2秒的动作不应触发奖励', () => {
      coopSystem.shootP1();

      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 3000);

      coopSystem.selectFacilityP2('HYDRANT');
      mockGame.placeFacility.mockReturnValue(true);
      coopSystem.placeFacilityP2();

      expect(coopSystem.syncBonus).toBe(0);
    });
  });

  describe('分数计算', () => {
    beforeEach(() => {
      coopSystem.startCoopMode('shared');
    });

    test('计算合作分数应该包含队伍加成', () => {
      coopSystem.player1.score = 500;
      coopSystem.player2.score = 300;

      const totalScore = coopSystem.calculateCoopScore();

      expect(totalScore).toBe(800 + 160); // 800 + 20%队伍加成
    });

    test('计算合作分数应该包含同步奖励', () => {
      coopSystem.player1.score = 500;
      coopSystem.player2.score = 300;
      coopSystem.syncBonus = 50;

      const totalScore = coopSystem.calculateCoopScore();

      expect(totalScore).toBe(800 + 160 + 50);
    });

    test('获取总分应该包含所有分数', () => {
      coopSystem.player1.score = 200;
      coopSystem.player2.score = 300;
      coopSystem.syncBonus = 50;

      expect(coopSystem.getTotalScore()).toBe(550);
    });
  });

  describe('合作评级', () => {
    beforeEach(() => {
      coopSystem.startCoopMode('shared');
    });

    test('高同步率应该获得完美评级', () => {
      coopSystem.player1.waterUsed = 20;
      coopSystem.player2.facilitiesPlaced = 2;
      coopSystem.syncBonus = 10;

      expect(coopSystem.getCoopRating()).toBe('⭐⭐⭐ 完美配合！');
    });

    test('中等同步率应该获得良好评级', () => {
      coopSystem.player1.waterUsed = 40;
      coopSystem.player2.facilitiesPlaced = 4;
      coopSystem.syncBonus = 5;

      expect(coopSystem.getCoopRating()).toBe('⭐⭐ 良好合作');
    });

    test('低同步率应该获得需要加强评级', () => {
      coopSystem.player1.waterUsed = 40;
      coopSystem.player2.facilitiesPlaced = 4;
      coopSystem.syncBonus = 2;

      expect(coopSystem.getCoopRating()).toBe('⭐ 需要加强配合');
    });
  });

  describe('玩家统计', () => {
    beforeEach(() => {
      coopSystem.startCoopMode('shared');
    });

    test('获取玩家1统计', () => {
      coopSystem.player1.score = 500;
      coopSystem.player1.waterUsed = 100;
      coopSystem.player1.shotsHit = 30;

      const stats = coopSystem.getPlayer1Stats();

      expect(stats.score).toBe(500);
      expect(stats.waterUsed).toBe(100);
      expect(stats.shotsHit).toBe(30);
      expect(stats.accuracy).toBe(30 / 50);
    });

    test('获取玩家2统计', () => {
      coopSystem.player2.score = 300;
      coopSystem.player2.facilitiesPlaced = 5;
      coopSystem.player2.selectedFacility = 'HYDRANT';

      const stats = coopSystem.getPlayer2Stats();

      expect(stats.score).toBe(300);
      expect(stats.facilitiesPlaced).toBe(5);
      expect(stats.selectedFacility).toBe('HYDRANT');
    });
  });

  describe('设施选择', () => {
    test('应该能选择所有有效设施', () => {
      const facilities = ['HYDRANT', 'FIRE_WALL', 'FIGHTER', 'WATCH_TOWER'];

      facilities.forEach(facility => {
        expect(coopSystem.selectFacilityP2(facility)).toBe(true);
      });
    });
  });

  describe('游戏模式', () => {
    test('默认模式应该是分屏', () => {
      expect(coopSystem.mode).toBe('split');
    });

    test('可以切换到同屏模式', () => {
      coopSystem.startCoopMode('shared');

      expect(coopSystem.mode).toBe('shared');
    });
  });
});
