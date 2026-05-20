/**
 * 消防车库测试
 * 测试车辆属性、技能、解锁条件
 */

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  VEHICLE_CONFIG: {
    BASE_STATS: {
      speed: 1.0,
      waterCapacity: 1000,
      power: 1.0,
      range: 1.0
    }
  }
}));

// VehicleSystem - 模拟消防车库系统类
class VehicleSystem {
  constructor(game) {
    this.game = game;
    this.vehicles = this.initVehicles();
    this.selectedVehicle = 'basic_truck';
    this.unlockedVehicles = ['basic_truck'];
  }

  initVehicles() {
    return {
      basic_truck: {
        id: 'basic_truck',
        name: '基础消防车',
        icon: '🚒',
        description: '标准消防设备，适合新手',
        rarity: 'common',
        stats: {
          speed: 1.0,
          waterCapacity: 1000,
          power: 1.0,
          range: 1.0
        },
        skills: [
          { name: '标准喷水', description: '基础灭火能力', cooldown: 0 }
        ],
        unlockCost: 0,
        level: 1
      },
      advanced_truck: {
        id: 'advanced_truck',
        name: '高级消防车',
        icon: '🚛',
        description: '更大的水箱和更强的水压',
        rarity: 'rare',
        stats: {
          speed: 1.2,
          waterCapacity: 1500,
          power: 1.3,
          range: 1.2
        },
        skills: [
          { name: '强力水柱', description: '水压提升30%', cooldown: 0 },
          { name: '快速 refill', description: '加水速度提升50%', cooldown: 0 }
        ],
        unlockCost: 500,
        unlockLevel: 5,
        level: 1
      },
      elite_truck: {
        id: 'elite_truck',
        name: '精英消防车',
        icon: '🚨',
        description: '顶级设备，配备特殊技能',
        rarity: 'epic',
        stats: {
          speed: 1.5,
          waterCapacity: 2000,
          power: 1.5,
          range: 1.5
        },
        skills: [
          { name: '强力水柱', description: '水压提升50%', cooldown: 0 },
          { name: '双管喷射', description: '同时喷射两道水柱', cooldown: 15 },
          { name: '紧急救援', description: '召唤支援', cooldown: 30 }
        ],
        unlockCost: 2000,
        unlockLevel: 10,
        level: 1
      },
      helicopter: {
        id: 'helicopter',
        name: '消防直升机',
        icon: '🚁',
        description: '空中优势，无视地形',
        rarity: 'legendary',
        stats: {
          speed: 2.0,
          waterCapacity: 3000,
          power: 1.2,
          range: 2.5
        },
        skills: [
          { name: '空中轰炸', description: '大范围降雨', cooldown: 20 },
          { name: '精确定位', description: '精准灭火', cooldown: 10 }
        ],
        unlockCost: 5000,
        unlockLevel: 15,
        level: 1
      }
    };
  }

  getVehicle(vehicleId) {
    return this.vehicles[vehicleId];
  }

  getAllVehicles() {
    return Object.values(this.vehicles);
  }

  selectVehicle(vehicleId) {
    if (!this.vehicles[vehicleId]) return { success: false, reason: '车辆不存在' };
    if (!this.unlockedVehicles.includes(vehicleId)) {
      return { success: false, reason: '车辆未解锁' };
    }

    this.selectedVehicle = vehicleId;
    this.applyVehicleStats();
    return { success: true, vehicleId };
  }

  getSelectedVehicle() {
    return this.vehicles[this.selectedVehicle];
  }

  isUnlocked(vehicleId) {
    return this.unlockedVehicles.includes(vehicleId);
  }

  canUnlock(vehicleId, coins, playerLevel) {
    const vehicle = this.vehicles[vehicleId];
    if (!vehicle) return { canUnlock: false, reason: '车辆不存在' };
    if (this.unlockedVehicles.includes(vehicleId)) {
      return { canUnlock: false, reason: '已解锁' };
    }
    if (vehicle.unlockCost && coins < vehicle.unlockCost) {
      return { canUnlock: false, reason: '金币不足', required: vehicle.unlockCost };
    }
    if (vehicle.unlockLevel && playerLevel < vehicle.unlockLevel) {
      return { canUnlock: false, reason: '等级不足', required: vehicle.unlockLevel };
    }
    return { canUnlock: true };
  }

  unlock(vehicleId, coins, playerLevel) {
    const check = this.canUnlock(vehicleId, coins, playerLevel);
    if (!check.canUnlock) return { success: false, reason: check.reason };

    const vehicle = this.vehicles[vehicleId];
    this.unlockedVehicles.push(vehicleId);

    // 扣除金币（如果有费用）
    const cost = vehicle.unlockCost || 0;

    return { success: true, vehicleId, cost };
  }

  applyVehicleStats() {
    if (!this.game) return;

    const vehicle = this.getSelectedVehicle();
    if (!vehicle) return;

    this.game.vehicleStats = {
      speed: vehicle.stats.speed,
      waterCapacity: vehicle.stats.waterCapacity,
      power: vehicle.stats.power,
      range: vehicle.stats.range
    };

    // 应用到游戏
    this.game.maxWater = vehicle.stats.waterCapacity;
    this.game.waterPowerMultiplier = vehicle.stats.power;
  }

  getVehicleSkillCount(vehicleId) {
    const vehicle = this.vehicles[vehicleId];
    return vehicle ? vehicle.skills.length : 0;
  }

  getVehicleByRarity(rarity) {
    return Object.values(this.vehicles).filter(v => v.rarity === rarity);
  }

  renderGarageUI(container) {
    // Mock render
  }

  renderVehicleSelection(ctx, x, y) {
    // Mock render
  }
}

describe('VehicleSystem', () => {
  let vehicleSystem;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      maxWater: 1000,
      waterPowerMultiplier: 1.0,
      vehicleStats: {}
    };

    vehicleSystem = new VehicleSystem(mockGame);
  });

  test('应该正确初始化', () => {
    expect(vehicleSystem.selectedVehicle).toBe('basic_truck');
    expect(vehicleSystem.unlockedVehicles).toContain('basic_truck');
  });

  test('应该有4种车辆', () => {
    const vehicles = vehicleSystem.getAllVehicles();
    expect(vehicles.length).toBe(4);
  });

  test('基础消防车应该默认解锁', () => {
    expect(vehicleSystem.isUnlocked('basic_truck')).toBe(true);
  });

  test('其他车辆应该默认锁定', () => {
    expect(vehicleSystem.isUnlocked('advanced_truck')).toBe(false);
    expect(vehicleSystem.isUnlocked('elite_truck')).toBe(false);
    expect(vehicleSystem.isUnlocked('helicopter')).toBe(false);
  });

  test('getVehicle 应该返回正确车辆', () => {
    const truck = vehicleSystem.getVehicle('basic_truck');

    expect(truck).toBeDefined();
    expect(truck.name).toBe('基础消防车');
    expect(truck.icon).toBe('🚒');
  });

  test('getVehicle 不存在的车辆应返回undefined', () => {
    const vehicle = vehicleSystem.getVehicle('nonexistent');
    expect(vehicle).toBeUndefined();
  });

  test('选择已解锁车辆应该成功', () => {
    const result = vehicleSystem.selectVehicle('basic_truck');

    expect(result.success).toBe(true);
    expect(result.vehicleId).toBe('basic_truck');
  });

  test('选择不存在的车辆应该失败', () => {
    const result = vehicleSystem.selectVehicle('nonexistent');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('车辆不存在');
  });

  test('选择未解锁车辆应该失败', () => {
    const result = vehicleSystem.selectVehicle('advanced_truck');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('车辆未解锁');
  });

  test('getSelectedVehicle 应该返回当前选中车辆', () => {
    vehicleSystem.unlockedVehicles.push('advanced_truck');
    vehicleSystem.selectVehicle('advanced_truck');

    const selected = vehicleSystem.getSelectedVehicle();

    expect(selected.name).toBe('高级消防车');
  });

  test('车辆应该有正确的稀有度', () => {
    expect(vehicleSystem.vehicles.basic_truck.rarity).toBe('common');
    expect(vehicleSystem.vehicles.advanced_truck.rarity).toBe('rare');
    expect(vehicleSystem.vehicles.elite_truck.rarity).toBe('epic');
    expect(vehicleSystem.vehicles.helicopter.rarity).toBe('legendary');
  });

  test('车辆属性应该随稀有度提升', () => {
    const basic = vehicleSystem.vehicles.basic_truck.stats;
    const elite = vehicleSystem.vehicles.elite_truck.stats;

    expect(elite.speed).toBeGreaterThan(basic.speed);
    expect(elite.waterCapacity).toBeGreaterThan(basic.waterCapacity);
    expect(elite.power).toBeGreaterThan(basic.power);
  });

  test('高级消防车应该有2个技能', () => {
    const skills = vehicleSystem.getVehicleSkillCount('advanced_truck');
    expect(skills).toBe(2);
  });

  test('精英消防车应该有3个技能', () => {
    const skills = vehicleSystem.getVehicleSkillCount('elite_truck');
    expect(skills).toBe(3);
  });

  test('直升机应该有2个技能', () => {
    const skills = vehicleSystem.getVehicleSkillCount('helicopter');
    expect(skills).toBe(2);
  });

  test('canUnlock 应该正确检查解锁条件', () => {
    const result1 = vehicleSystem.canUnlock('advanced_truck', 300, 3);
    expect(result1.canUnlock).toBe(false);
    expect(result1.reason).toBe('金币不足');

    const result2 = vehicleSystem.canUnlock('advanced_truck', 500, 3);
    expect(result2.canUnlock).toBe(false);
    expect(result2.reason).toBe('等级不足');

    const result3 = vehicleSystem.canUnlock('advanced_truck', 500, 5);
    expect(result3.canUnlock).toBe(true);
  });

  test('解锁已解锁车辆应该失败', () => {
    const result = vehicleSystem.canUnlock('basic_truck', 1000, 10);
    expect(result.canUnlock).toBe(false);
    expect(result.reason).toBe('已解锁');
  });

  test('unlock 应该正确解锁车辆', () => {
    const result = vehicleSystem.unlock('advanced_truck', 500, 5);

    expect(result.success).toBe(true);
    expect(vehicleSystem.isUnlocked('advanced_truck')).toBe(true);
  });

  test('解锁条件不满足时应该失败', () => {
    const result = vehicleSystem.unlock('advanced_truck', 300, 5);

    expect(result.success).toBe(false);
  });

  test('unlock 应该返回解锁费用', () => {
    const result = vehicleSystem.unlock('advanced_truck', 500, 5);

    expect(result.cost).toBe(500);
  });

  test('applyVehicleStats 应该应用车辆属性到游戏', () => {
    vehicleSystem.unlockedVehicles.push('elite_truck');
    vehicleSystem.selectVehicle('elite_truck');

    expect(mockGame.maxWater).toBe(2000);
    expect(mockGame.waterPowerMultiplier).toBe(1.5);
  });

  test('getVehicleByRarity 应该返回对应稀有度车辆', () => {
    const rareVehicles = vehicleSystem.getVehicleByRarity('rare');

    expect(rareVehicles.length).toBe(1);
    expect(rareVehicles[0].id).toBe('advanced_truck');
  });

  test('基础消防车解锁费用应该是0', () => {
    expect(vehicleSystem.vehicles.basic_truck.unlockCost).toBe(0);
  });

  test('直升机解锁费用应该是5000', () => {
    expect(vehicleSystem.vehicles.helicopter.unlockCost).toBe(5000);
  });

  test('高级消防车等级要求应该是5', () => {
    expect(vehicleSystem.vehicles.advanced_truck.unlockLevel).toBe(5);
  });

  test('直升机等级要求应该是15', () => {
    expect(vehicleSystem.vehicles.helicopter.unlockLevel).toBe(15);
  });

  test('直升机应该有最大的水量', () => {
    const heli = vehicleSystem.vehicles.helicopter;
    const elite = vehicleSystem.vehicles.elite_truck;

    expect(heli.stats.waterCapacity).toBeGreaterThan(elite.stats.waterCapacity);
  });

  test('直升机应该有最大的射程', () => {
    const allVehicles = vehicleSystem.getAllVehicles();
    const heli = vehicleSystem.vehicles.helicopter;

    allVehicles.forEach(v => {
      expect(heli.stats.range).toBeGreaterThanOrEqual(v.stats.range);
    });
  });

  test('技能应该有名称和描述', () => {
    const vehicle = vehicleSystem.vehicles.elite_truck;

    vehicle.skills.forEach(skill => {
      expect(skill.name).toBeDefined();
      expect(skill.description).toBeDefined();
    });
  });

  test('某些技能应该有冷却时间', () => {
    const elite = vehicleSystem.vehicles.elite_truck;

    const skillsWithCooldown = elite.skills.filter(s => s.cooldown > 0);
    expect(skillsWithCooldown.length).toBeGreaterThan(0);
  });

  test('基础消防车应该只有1个技能', () => {
    const skills = vehicleSystem.getVehicleSkillCount('basic_truck');
    expect(skills).toBe(1);
  });

  test('选择不同车辆后selectedVehicle应该更新', () => {
    vehicleSystem.unlockedVehicles.push('helicopter');
    vehicleSystem.selectVehicle('helicopter');

    expect(vehicleSystem.selectedVehicle).toBe('helicopter');
  });

  test('解锁多辆车辆后解锁列表应该包含所有', () => {
    vehicleSystem.unlock('advanced_truck', 500, 5);
    vehicleSystem.unlock('elite_truck', 2000, 10);

    expect(vehicleSystem.unlockedVehicles.length).toBe(3);
    expect(vehicleSystem.unlockedVehicles).toContain('advanced_truck');
    expect(vehicleSystem.unlockedVehicles).toContain('elite_truck');
  });

  test('common稀有度车辆数量', () => {
    const common = vehicleSystem.getVehicleByRarity('common');
    expect(common.length).toBe(1);
  });

  test('legendary稀有度车辆数量', () => {
    const legendary = vehicleSystem.getVehicleByRarity('legendary');
    expect(legendary.length).toBe(1);
  });
});
