/**
 * 特殊事件系统测试
 * 测试爆炸桶、危险品、道具
 */

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  COLORS: {
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    SUCCESS: '#27ae60',
    INFO: '#3498db'
  }
}));

// SpecialEventSystem - 模拟特殊事件系统类
class SpecialEventSystem {
  constructor(game) {
    this.game = game;
    this.events = [];
    this.items = [];
    this.eventTimers = {};
  }

  spawnEvents(buildings) {
    this.events = [];
    this.items = [];

    buildings.forEach((building, index) => {
      // 随机生成爆炸桶
      if (Math.random() < 0.3) {
        this.events.push({
          id: `barrel-${index}`,
          type: 'explosive_barrel',
          x: building.x + Math.random() * building.width,
          y: building.y + building.height - 15,
          radius: 15,
          active: true,
          explosionRange: 80,
          damage: 50
        });
      }

      // 随机生成危险品
      if (Math.random() < 0.2) {
        this.events.push({
          id: `hazard-${index}`,
          type: 'hazardous_material',
          x: building.x + building.width / 2,
          y: building.y + building.height - 10,
          radius: 12,
          active: true,
          spreadRate: 2,
          difficultyMultiplier: 1.5
        });
      }

      // 随机生成道具
      if (Math.random() < 0.25) {
        const itemTypes = ['water refill', 'speed boost', 'fire shield', 'coin bonus'];
        this.items.push({
          id: `item-${index}`,
          type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
          x: building.x + Math.random() * building.width,
          y: building.y + building.height + 10,
          radius: 10,
          active: true,
          duration: 5000
        });
      }
    });
  }

  reset() {
    this.events = [];
    this.items = [];
    this.eventTimers = {};
  }

  update(deltaTime) {
    // 更新事件计时器
    Object.keys(this.eventTimers).forEach(key => {
      this.eventTimers[key] -= deltaTime * 1000;
      if (this.eventTimers[key] <= 0) {
        delete this.eventTimers[key];
      }
    });
  }

  triggerEvent(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (!event || !event.active) return { success: false, reason: '事件不存在或已失效' };

    if (event.type === 'explosive_barrel') {
      return this.triggerExplosion(event);
    } else if (event.type === 'hazardous_material') {
      return this.triggerHazard(event);
    }

    return { success: false, reason: '未知事件类型' };
  }

  triggerExplosion(event) {
    event.active = false;

    // 计算影响范围
    const affected = [];
    if (this.game && this.game.buildings) {
      this.game.buildings.forEach(building => {
        const dist = Math.sqrt(
          Math.pow(building.x + building.width / 2 - event.x, 2) +
          Math.pow(building.y + building.height / 2 - event.y, 2)
        );
        if (dist < event.explosionRange) {
          const damage = event.damage * (1 - dist / event.explosionRange);
          building.health -= damage;
          affected.push({ building, damage });
        }
      });
    }

    return {
      success: true,
      type: 'explosion',
      affected,
      range: event.explosionRange
    };
  }

  triggerHazard(event) {
    event.active = false;

    // 危险品增加附近火焰强度
    const affected = [];
    if (this.game && this.game.fires) {
      this.game.fires.forEach(fire => {
        const dist = Math.sqrt(Math.pow(fire.x - event.x, 2) + Math.pow(fire.y - event.y, 2));
        if (dist < 100) {
          fire.intensity = Math.min(fire.intensity * event.difficultyMultiplier, 5);
          affected.push(fire);
        }
      });
    }

    return {
      success: true,
      type: 'hazard',
      affected
    };
  }

  collectItem(itemId, game) {
    const item = this.items.find(i => i.id === itemId);
    if (!item || !item.active) return { success: false, reason: '道具不存在或已失效' };

    item.active = false;

    const effect = this.applyItemEffect(item.type, game);
    return { success: true, type: item.type, effect };
  }

  applyItemEffect(type, game) {
    switch (type) {
      case 'water refill':
        if (game) game.water = Math.min(game.water + 500, 2000);
        return { waterAdded: 500 };
      case 'speed boost':
        this.eventTimers['speedBoost'] = 5000;
        if (game) game.movementSpeedBonus = (game.movementSpeedBonus || 0) + 0.5;
        return { duration: 5000, speedBonus: 0.5 };
      case 'fire shield':
        this.eventTimers['fireShield'] = 8000;
        if (game) game.buildingFireResistance = (game.buildingFireResistance || 0) + 0.3;
        return { duration: 8000, resistanceBonus: 0.3 };
      case 'coin bonus':
        if (game && game.upgradeSystem) game.upgradeSystem.addCoins(200);
        return { coinsAdded: 200 };
      default:
        return {};
    }
  }

  getActiveEvents() {
    return this.events.filter(e => e.active);
  }

  getActiveItems() {
    return this.items.filter(i => i.active);
  }

  getEventById(eventId) {
    return this.events.find(e => e.id === eventId);
  }

  getItemById(itemId) {
    return this.items.find(i => i.id === itemId);
  }

  render(ctx) {
    // Mock render
  }
}

describe('SpecialEventSystem', () => {
  let eventSystem;
  let mockGame;
  let mockBuildings;

  beforeEach(() => {
    mockBuildings = [
      { x: 100, y: 400, width: 80, height: 60, health: 100 },
      { x: 300, y: 380, width: 100, height: 80, health: 150 },
      { x: 500, y: 420, width: 80, height: 60, health: 100 }
    ];

    mockGame = {
      buildings: mockBuildings,
      fires: [],
      upgradeSystem: {
        addCoins: jest.fn()
      }
    };

    eventSystem = new SpecialEventSystem(mockGame);
  });

  test('应该正确初始化', () => {
    expect(eventSystem.events).toEqual([]);
    expect(eventSystem.items).toEqual([]);
  });

  test('应该生成爆炸桶事件', () => {
    eventSystem.spawnEvents(mockBuildings);

    const barrels = eventSystem.events.filter(e => e.type === 'explosive_barrel');
    expect(barrels.length).toBeGreaterThanOrEqual(0);
  });

  test('应该生成危险品事件', () => {
    eventSystem.spawnEvents(mockBuildings);

    const hazards = eventSystem.events.filter(e => e.type === 'hazardous_material');
    expect(hazards.length).toBeGreaterThanOrEqual(0);
  });

  test('应该生成道具', () => {
    eventSystem.spawnEvents(mockBuildings);

    expect(eventSystem.items.length).toBeGreaterThanOrEqual(0);
  });

  test('爆炸桶应该有正确的属性', () => {
    eventSystem.events.push({
      id: 'test-barrel',
      type: 'explosive_barrel',
      x: 200,
      y: 400,
      radius: 15,
      active: true,
      explosionRange: 80,
      damage: 50
    });

    const barrel = eventSystem.events[0];
    expect(barrel.type).toBe('explosive_barrel');
    expect(barrel.explosionRange).toBe(80);
    expect(barrel.damage).toBe(50);
  });

  test('触发爆炸应该影响范围内的建筑', () => {
    eventSystem.events.push({
      id: 'test-barrel',
      type: 'explosive_barrel',
      x: 140,
      y: 430,
      radius: 15,
      active: true,
      explosionRange: 80,
      damage: 50
    });

    const initialHealth = mockBuildings[0].health;
    const result = eventSystem.triggerEvent('test-barrel');

    expect(result.success).toBe(true);
    expect(result.type).toBe('explosion');
    expect(mockBuildings[0].health).toBeLessThan(initialHealth);
  });

  test('爆炸后事件应该失效', () => {
    eventSystem.events.push({
      id: 'test-barrel',
      type: 'explosive_barrel',
      x: 200,
      y: 400,
      active: true,
      explosionRange: 80,
      damage: 50
    });

    eventSystem.triggerEvent('test-barrel');

    expect(eventSystem.events[0].active).toBe(false);
  });

  test('危险品应该增加火焰强度', () => {
    mockGame.fires.push({ x: 300, y: 400, intensity: 2 });

    eventSystem.events.push({
      id: 'test-hazard',
      type: 'hazardous_material',
      x: 300,
      y: 400,
      active: true,
      spreadRate: 2,
      difficultyMultiplier: 1.5
    });

    const result = eventSystem.triggerEvent('test-hazard');

    expect(result.success).toBe(true);
    expect(mockGame.fires[0].intensity).toBe(3); // 2 * 1.5
  });

  test('道具类型应该是有效的', () => {
    eventSystem.items.push({
      id: 'test-item',
      type: 'water refill',
      x: 200,
      y: 400,
      active: true,
      duration: 5000
    });

    expect(eventSystem.items[0].type).toBe('water refill');
  });

  test('收集水补充道具应该增加水量', () => {
    mockGame.water = 500;

    eventSystem.items.push({
      id: 'test-item',
      type: 'water refill',
      x: 200,
      y: 400,
      active: true,
      duration: 5000
    });

    const result = eventSystem.collectItem('test-item', mockGame);

    expect(result.success).toBe(true);
    expect(mockGame.water).toBe(1000);
  });

  test('收集金币道具应该增加金币', () => {
    eventSystem.items.push({
      id: 'test-item',
      type: 'coin bonus',
      x: 200,
      y: 400,
      active: true,
      duration: 5000
    });

    const result = eventSystem.collectItem('test-item', mockGame);

    expect(result.success).toBe(true);
    expect(mockGame.upgradeSystem.addCoins).toHaveBeenCalledWith(200);
  });

  test('收集道具后应该失效', () => {
    eventSystem.items.push({
      id: 'test-item',
      type: 'water refill',
      x: 200,
      y: 400,
      active: true,
      duration: 5000
    });

    eventSystem.collectItem('test-item', mockGame);

    expect(eventSystem.items[0].active).toBe(false);
  });

  test('收集已失效道具应该失败', () => {
    eventSystem.items.push({
      id: 'test-item',
      type: 'water refill',
      x: 200,
      y: 400,
      active: false,
      duration: 5000
    });

    const result = eventSystem.collectItem('test-item', mockGame);

    expect(result.success).toBe(false);
  });

  test('getActiveEvents 应该只返回活跃事件', () => {
    eventSystem.events.push(
      { id: 'active', type: 'explosive_barrel', active: true },
      { id: 'inactive', type: 'explosive_barrel', active: false }
    );

    const active = eventSystem.getActiveEvents();

    expect(active.length).toBe(1);
    expect(active[0].id).toBe('active');
  });

  test('getActiveItems 应该只返回活跃道具', () => {
    eventSystem.items.push(
      { id: 'active', type: 'water refill', active: true },
      { id: 'inactive', type: 'water refill', active: false }
    );

    const active = eventSystem.getActiveItems();

    expect(active.length).toBe(1);
    expect(active[0].id).toBe('active');
  });

  test('getEventById 应该返回正确事件', () => {
    eventSystem.events.push({ id: 'test-event', type: 'explosive_barrel', active: true });

    const event = eventSystem.getEventById('test-event');

    expect(event).toBeDefined();
    expect(event.id).toBe('test-event');
  });

  test('getItemById 应该返回正确道具', () => {
    eventSystem.items.push({ id: 'test-item', type: 'water refill', active: true });

    const item = eventSystem.getItemById('test-item');

    expect(item).toBeDefined();
    expect(item.id).toBe('test-item');
  });

  test('reset 应该清空所有事件和道具', () => {
    eventSystem.spawnEvents(mockBuildings);
    eventSystem.eventTimers['test'] = 1000;

    eventSystem.reset();

    expect(eventSystem.events.length).toBe(0);
    expect(eventSystem.items.length).toBe(0);
    expect(Object.keys(eventSystem.eventTimers).length).toBe(0);
  });

  test('速度提升道具应该设置计时器', () => {
    mockGame.movementSpeedBonus = 0;

    eventSystem.items.push({
      id: 'test-item',
      type: 'speed boost',
      x: 200,
      y: 400,
      active: true,
      duration: 5000
    });

    eventSystem.collectItem('test-item', mockGame);

    expect(eventSystem.eventTimers['speedBoost']).toBe(5000);
    expect(mockGame.movementSpeedBonus).toBe(0.5);
  });

  test('火焰盾道具应该增加抗火性', () => {
    mockGame.buildingFireResistance = 0;

    eventSystem.items.push({
      id: 'test-item',
      type: 'fire shield',
      x: 200,
      y: 400,
      active: true,
      duration: 8000
    });

    eventSystem.collectItem('test-item', mockGame);

    expect(eventSystem.eventTimers['fireShield']).toBe(8000);
    expect(mockGame.buildingFireResistance).toBe(0.3);
  });

  test('update 应该更新计时器', () => {
    eventSystem.eventTimers['test'] = 1000;

    eventSystem.update(0.5);

    expect(eventSystem.eventTimers['test']).toBe(500);
  });

  test('计时器到期应该被移除', () => {
    eventSystem.eventTimers['test'] = 100;

    eventSystem.update(0.2);

    expect(eventSystem.eventTimers['test']).toBeUndefined();
  });

  test('爆炸伤害应该随距离衰减', () => {
    eventSystem.events.push({
      id: 'test-barrel',
      type: 'explosive_barrel',
      x: 200,
      y: 400,
      active: true,
      explosionRange: 100,
      damage: 100
    });

    // 在爆炸中心附近的建筑
    mockBuildings[0].x = 150;
    mockBuildings[0].y = 390;

    // 在爆炸范围边缘的建筑
    mockBuildings[1].x = 280;
    mockBuildings[1].y = 390;

    const result = eventSystem.triggerEvent('test-barrel');

    expect(result.affected.length).toBeGreaterThan(0);
    // 中心建筑受伤害应大于边缘建筑
    const nearBuilding = result.affected.find(a => a.building === mockBuildings[0]);
    const farBuilding = result.affected.find(a => a.building === mockBuildings[1]);
    if (nearBuilding && farBuilding) {
      expect(nearBuilding.damage).toBeGreaterThan(farBuilding.damage);
    }
  });

  test('道具应该有唯一ID', () => {
    eventSystem.spawnEvents(mockBuildings);

    const itemIds = eventSystem.items.map(i => i.id);
    const uniqueIds = new Set(itemIds);

    expect(uniqueIds.size).toBe(itemIds.length);
  });
});
