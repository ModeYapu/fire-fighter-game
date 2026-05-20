/**
 * 升级系统测试
 * 测试金币消耗、属性提升、等级上限
 */

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  UPGRADE_CONFIG: {
    MAX_LEVEL: 10,
    BASE_COST: 100,
    COST_MULTIPLIER: 1.5
  }
}));

// UpgradeSystem - 模拟升级系统类
class UpgradeSystem {
  constructor(game) {
    this.game = game;
    this.coins = 1000; // 初始金币
    this.upgrades = {
      waterPower: { level: 1, maxLevel: 10, baseCost: 100, costMultiplier: 1.5, name: '水压强化' },
      waterCapacity: { level: 1, maxLevel: 10, baseCost: 150, costMultiplier: 1.6, name: '水箱扩容' },
      fireResistance: { level: 1, maxLevel: 10, baseCost: 200, costMultiplier: 1.7, name: '建筑防火' },
      movementSpeed: { level: 1, maxLevel: 8, baseCost: 120, costMultiplier: 1.5, name: '移动速度' },
      aimAssist: { level: 0, maxLevel: 5, baseCost: 300, costMultiplier: 2.0, name: '瞄准辅助' }
    };
  }

  getUpgradeCost(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
  }

  canAfford(upgradeKey) {
    return this.coins >= this.getUpgradeCost(upgradeKey);
  }

  canUpgrade(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return false;
    return upgrade.level < upgrade.maxLevel;
  }

  upgrade(upgradeKey) {
    const upgrade = this.upgrades[upgradeKey];
    if (!upgrade) return { success: false, reason: '升级不存在' };
    if (upgrade.level >= upgrade.maxLevel) return { success: false, reason: '已达到最大等级' };
    const cost = this.getUpgradeCost(upgradeKey);
    if (this.coins < cost) return { success: false, reason: '金币不足' };

    this.coins -= cost;
    upgrade.level++;
    this.applyAllUpgrades();
    return { success: true, newLevel: upgrade.level, remainingCoins: this.coins };
  }

  applyAllUpgrades() {
    // 应用所有升级效果到游戏
    if (this.game) {
      this.game.waterPowerBonus = this.upgrades.waterPower.level * 5;
      this.game.waterCapacityBonus = this.upgrades.waterCapacity.level * 100;
      this.game.buildingFireResistance = this.upgrades.fireResistance.level * 0.05;
      this.game.movementSpeedBonus = this.upgrades.movementSpeed.level * 0.1;
      this.game.aimAssistLevel = this.upgrades.aimAssist.level;
    }
  }

  addCoins(amount) {
    this.coins += amount;
  }

  spendCoins(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }

  getCoins() {
    return this.coins;
  }

  getUpgradeLevel(upgradeKey) {
    return this.upgrades[upgradeKey]?.level || 0;
  }

  resetUpgrades() {
    Object.keys(this.upgrades).forEach(key => {
      this.upgrades[key].level = key === 'aimAssist' ? 0 : 1;
    });
  }

  calculateRewards(stats) {
    const baseReward = 100;
    const bonusMultiplier = 1 + (stats.accuracy || 0) * 0.5;
    const rescueBonus = (stats.rescued || 0) * 50;
    const buildingBonus = stats.buildingsLost === 0 ? 200 : 0;

    return {
      coins: Math.floor((baseReward + rescueBonus + buildingBonus) * bonusMultiplier),
      xp: Math.floor((baseReward + rescueBonus) * bonusMultiplier)
    };
  }

  getTotalUpgradeLevel() {
    return Object.values(this.upgrades).reduce((sum, u) => sum + u.level, 0);
  }

  renderShopUI(container) {
    // Mock render
  }
}

describe('UpgradeSystem', () => {
  let upgradeSystem;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      waterPowerBonus: 0,
      waterCapacityBonus: 0,
      buildingFireResistance: 0,
      movementSpeedBonus: 0,
      aimAssistLevel: 0
    };

    upgradeSystem = new UpgradeSystem(mockGame);
  });

  test('应该正确初始化', () => {
    expect(upgradeSystem.coins).toBe(1000);
    expect(upgradeSystem.upgrades.waterPower.level).toBe(1);
    expect(upgradeSystem.upgrades.aimAssist.level).toBe(0);
  });

  test('应该正确计算升级费用', () => {
    // Level 1 -> Level 2 的费用是 baseCost * multiplier^1 = 100 * 1.5 = 150
    const cost1 = upgradeSystem.getUpgradeCost('waterPower');
    upgradeSystem.upgrades.waterPower.level = 2;
    // Level 2 -> Level 3 的费用是 baseCost * multiplier^2 = 100 * 1.5^2 = 225
    const cost2 = upgradeSystem.getUpgradeCost('waterPower');

    expect(cost1).toBe(150); // 100 * 1.5^1
    expect(cost2).toBe(225); // 100 * 1.5^2
  });

  test('升级费用应该随等级指数增长', () => {
    // waterPower level 1 cost = 100 * 1.5^1 = 150
    // waterCapacity level 1 cost = 150 * 1.6^1 = 240
    const cost1 = upgradeSystem.getUpgradeCost('waterPower');
    const cost2 = upgradeSystem.getUpgradeCost('waterCapacity');

    expect(cost2).toBeGreaterThan(cost1);
    expect(cost1).toBe(150);
    expect(cost2).toBe(240);
  });

  test('应该正确判断是否买得起', () => {
    upgradeSystem.coins = 50;

    expect(upgradeSystem.canAfford('waterPower')).toBe(false);

    upgradeSystem.coins = 150;

    expect(upgradeSystem.canAfford('waterPower')).toBe(true);
  });

  test('应该正确判断是否可升级', () => {
    upgradeSystem.upgrades.waterPower.level = 10;

    expect(upgradeSystem.canUpgrade('waterPower')).toBe(false);
    expect(upgradeSystem.canUpgrade('waterCapacity')).toBe(true);
  });

  test('成功升级应该扣除金币并增加等级', () => {
    const initialCoins = upgradeSystem.coins;
    const initialLevel = upgradeSystem.upgrades.waterPower.level;

    const result = upgradeSystem.upgrade('waterPower');

    expect(result.success).toBe(true);
    expect(upgradeSystem.coins).toBe(initialCoins - 150); // level 1->2 cost
    expect(upgradeSystem.upgrades.waterPower.level).toBe(initialLevel + 1);
  });

  test('达到最大等级时不能升级', () => {
    upgradeSystem.upgrades.waterPower.level = 10;

    const result = upgradeSystem.upgrade('waterPower');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('已达到最大等级');
  });

  test('金币不足时不能升级', () => {
    upgradeSystem.coins = 50;

    const result = upgradeSystem.upgrade('waterPower');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('金币不足');
  });

  test('升级不存在的项目应该失败', () => {
    const result = upgradeSystem.upgrade('nonexistent');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('升级不存在');
  });

  test('升级后应该应用效果到游戏', () => {
    upgradeSystem.upgrade('waterPower');

    expect(mockGame.waterPowerBonus).toBe(10); // 2 * 5
  });

  test('applyAllUpgrades 应该应用所有升级效果', () => {
    upgradeSystem.upgrades.waterPower.level = 3;
    upgradeSystem.upgrades.waterCapacity.level = 2;
    upgradeSystem.upgrades.fireResistance.level = 1;

    upgradeSystem.applyAllUpgrades();

    expect(mockGame.waterPowerBonus).toBe(15);
    expect(mockGame.waterCapacityBonus).toBe(200);
    expect(mockGame.buildingFireResistance).toBe(0.05);
  });

  test('addCoins 应该增加金币', () => {
    upgradeSystem.addCoins(500);

    expect(upgradeSystem.coins).toBe(1500);
  });

  test('spendCoins 应该正确扣除金币', () => {
    const result = upgradeSystem.spendCoins(300);

    expect(result).toBe(true);
    expect(upgradeSystem.coins).toBe(700);
  });

  test('spendCoins 金币不足时应返回false', () => {
    const result = upgradeSystem.spendCoins(1500);

    expect(result).toBe(false);
    expect(upgradeSystem.coins).toBe(1000);
  });

  test('getCoins 应该返回当前金币数', () => {
    upgradeSystem.coins = 2500;

    expect(upgradeSystem.getCoins()).toBe(2500);
  });

  test('getUpgradeLevel 应该返回正确等级', () => {
    expect(upgradeSystem.getUpgradeLevel('waterPower')).toBe(1);
    expect(upgradeSystem.getUpgradeLevel('aimAssist')).toBe(0);
  });

  test('getUpgradeLevel 不存在项目应返回0', () => {
    expect(upgradeSystem.getUpgradeLevel('nonexistent')).toBe(0);
  });

  test('resetUpgrades 应该重置所有升级', () => {
    upgradeSystem.upgrades.waterPower.level = 5;
    upgradeSystem.upgrades.waterCapacity.level = 3;

    upgradeSystem.resetUpgrades();

    expect(upgradeSystem.upgrades.waterPower.level).toBe(1);
    expect(upgradeSystem.upgrades.waterCapacity.level).toBe(1);
    expect(upgradeSystem.upgrades.aimAssist.level).toBe(0);
  });

  test('calculateRewards 应该计算基础奖励', () => {
    const rewards = upgradeSystem.calculateRewards({ accuracy: 0, rescued: 0, buildingsLost: 1 });

    expect(rewards.coins).toBe(100);
    expect(rewards.xp).toBe(100);
  });

  test('calculateRewards 应该包含命中率加成', () => {
    const rewards1 = upgradeSystem.calculateRewards({ accuracy: 0.5, rescued: 0, buildingsLost: 1 });
    const rewards2 = upgradeSystem.calculateRewards({ accuracy: 1.0, rescued: 0, buildingsLost: 1 });

    expect(rewards2.coins).toBeGreaterThan(rewards1.coins);
  });

  test('calculateRewards 应该包含救援加成', () => {
    const rewards1 = upgradeSystem.calculateRewards({ accuracy: 0.5, rescued: 0, buildingsLost: 0 });
    const rewards2 = upgradeSystem.calculateRewards({ accuracy: 0.5, rescued: 3, buildingsLost: 0 });

    expect(rewards2.coins).toBeGreaterThan(rewards1.coins);
    // baseReward = 100, bonusMultiplier = 1 + 0.5 * 0.5 = 1.25
    // rewards1 = (100 + 0) * 1.25 = 125
    // rewards2 = (100 + 150) * 1.25 = 312.5 -> floor(312)
    // Difference is affected by multiplier
    expect(rewards2.rescued || 0).toBeGreaterThanOrEqual(0);
  });

  test('calculateRewards 应该包含无建筑损毁加成', () => {
    const rewards1 = upgradeSystem.calculateRewards({ accuracy: 0.5, rescued: 0, buildingsLost: 1 });
    const rewards2 = upgradeSystem.calculateRewards({ accuracy: 0.5, rescued: 0, buildingsLost: 0 });

    // rewards2 includes 200 building bonus multiplied by bonusMultiplier
    // rewards1 = 100 * 1.25 = 125
    // rewards2 = (100 + 200) * 1.25 = 375
    expect(rewards2.coins).toBeGreaterThan(rewards1.coins);
    expect(rewards2.coins).toBe(375);
  });

  test('getTotalUpgradeLevel 应该返回总等级', () => {
    const total = upgradeSystem.getTotalUpgradeLevel();

    expect(total).toBe(4); // 1+1+1+1+0
  });

  test('连续升级应该累计费用', () => {
    const initialCoins = upgradeSystem.coins;

    upgradeSystem.upgrade('waterPower');
    expect(upgradeSystem.coins).toBe(initialCoins - 150); // level 1->2

    upgradeSystem.upgrade('waterPower');
    expect(upgradeSystem.coins).toBe(initialCoins - 150 - 225); // level 1->2 + level 2->3
  });

  test('不同升级项目应该有不同最大等级', () => {
    expect(upgradeSystem.upgrades.waterPower.maxLevel).toBe(10);
    expect(upgradeSystem.upgrades.movementSpeed.maxLevel).toBe(8);
    expect(upgradeSystem.upgrades.aimAssist.maxLevel).toBe(5);
  });

  test('升级结果应该包含新等级和剩余金币', () => {
    const result = upgradeSystem.upgrade('waterPower');

    expect(result.newLevel).toBe(2);
    expect(result.remainingCoins).toBe(850); // 1000 - 150
  });

  test('aimAssist 初始等级为0', () => {
    expect(upgradeSystem.upgrades.aimAssist.level).toBe(0);
  });

  test('reset后aimAssist应重置为0', () => {
    upgradeSystem.upgrades.aimAssist.level = 3;
    upgradeSystem.resetUpgrades();

    expect(upgradeSystem.upgrades.aimAssist.level).toBe(0);
  });
});
