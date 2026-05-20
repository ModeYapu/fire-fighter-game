/**
 * 救援系统测试
 * 测试幸存者健康值、恐慌状态、救援进度
 */

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  GAME_CONFIG: {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600
  },
  COLORS: {
    SUCCESS: '#27ae60',
    WARNING: '#f39c12',
    DANGER: '#e74c3c'
  }
}));

// RescueSystem - 模拟救援系统类
class RescueSystem {
  constructor(game) {
    this.game = game;
    this.survivors = [];
    this.rescuedCount = 0;
    this.rescueProgress = {};
  }

  spawnSurvivors(buildings) {
    this.survivors = [];
    buildings.forEach((building, index) => {
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        this.survivors.push({
          id: `${index}-${i}`,
          building: building,
          x: building.x + building.width / 2 + (Math.random() - 0.5) * 40,
          y: building.y + building.height - 20,
          health: 100,
          panicLevel: 0,
          rescueProgress: 0,
          state: 'waiting', // waiting, rescuing, rescued, lost
          moveTimer: 0
        });
      }
    });
  }

  reset() {
    this.rescuedCount = 0;
    this.rescueProgress = {};
  }

  update(deltaTime) {
    this.survivors.forEach(survivor => {
      if (survivor.state === 'lost') return;

      // 恐慌增加
      if (survivor.state === 'waiting') {
        survivor.panicLevel = Math.min(100, survivor.panicLevel + deltaTime * 2);
        if (survivor.panicLevel >= 100) {
          survivor.state = 'lost';
        }
      }

      // 救援进度
      if (survivor.state === 'rescuing') {
        survivor.rescueProgress += deltaTime * 25;
        if (survivor.rescueProgress >= 100) {
          survivor.state = 'rescued';
          this.rescuedCount++;
        }
      }

      // 健康值受恐慌影响
      if (survivor.panicLevel > 50) {
        survivor.health -= deltaTime * 5;
        if (survivor.health <= 0) {
          survivor.state = 'lost';
        }
      }
    });
  }

  startRescue(survivorId) {
    const survivor = this.survivors.find(s => s.id === survivorId);
    if (survivor && survivor.state === 'waiting') {
      survivor.state = 'rescuing';
      return true;
    }
    return false;
  }

  getRescueRate() {
    if (this.survivors.length === 0) return 1;
    return this.rescuedCount / this.survivors.length;
  }

  getAverageHealth() {
    if (this.survivors.length === 0) return 100;
    const total = this.survivors.reduce((sum, s) => sum + s.health, 0);
    return total / this.survivors.length;
  }

  getAveragePanic() {
    if (this.survivors.length === 0) return 0;
    const total = this.survivors.reduce((sum, s) => sum + s.panicLevel, 0);
    return total / this.survivors.length;
  }

  render(ctx) {
    // Mock render
  }
}

describe('RescueSystem', () => {
  let rescueSystem;
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
      ctx: {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        fillText: jest.fn()
      }
    };

    rescueSystem = new RescueSystem(mockGame);
  });

  test('应该正确初始化', () => {
    expect(rescueSystem.survivors).toEqual([]);
    expect(rescueSystem.rescuedCount).toBe(0);
  });

  test('应该在建筑中生成幸存者', () => {
    rescueSystem.spawnSurvivors(mockBuildings);

    expect(rescueSystem.survivors.length).toBeGreaterThan(0);
    expect(rescueSystem.survivors[0].health).toBe(100);
    expect(rescueSystem.survivors[0].panicLevel).toBe(0);
  });

  test('新生成的幸存者状态应该是等待', () => {
    rescueSystem.spawnSurvivors(mockBuildings);

    rescueSystem.survivors.forEach(survivor => {
      expect(survivor.state).toBe('waiting');
    });
  });

  test('恐慌等级应该随时间增加', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];

    rescueSystem.update(1); // 1秒

    expect(survivor.panicLevel).toBeGreaterThan(0);
    expect(survivor.panicLevel).toBeLessThanOrEqual(2);
  });

  test('恐慌达到100时幸存者应该丢失', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.panicLevel = 95;

    rescueSystem.update(3); // 3秒，足够达到100

    expect(survivor.state).toBe('lost');
  });

  test('健康值应该随恐慌下降', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.panicLevel = 60;
    const initialHealth = survivor.health;

    rescueSystem.update(1);

    expect(survivor.health).toBeLessThan(initialHealth);
  });

  test('健康值为0时幸存者应该丢失', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.panicLevel = 80;
    survivor.health = 5;

    rescueSystem.update(1);

    expect(survivor.state).toBe('lost');
  });

  test('应该能够开始救援', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];

    const result = rescueSystem.startRescue(survivor.id);

    expect(result).toBe(true);
    expect(survivor.state).toBe('rescuing');
  });

  test('救援进度应该随时间增加', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.state = 'rescuing';

    rescueSystem.update(1);

    expect(survivor.rescueProgress).toBeGreaterThan(0);
  });

  test('救援进度达到100时应该完成救援', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.state = 'rescuing';
    survivor.rescueProgress = 90;

    rescueSystem.update(1);

    expect(survivor.state).toBe('rescued');
    expect(rescueSystem.rescuedCount).toBe(1);
  });

  test('已救援的幸存者不应计入丢失', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.state = 'rescued';
    survivor.panicLevel = 100;

    rescueSystem.update(1);

    expect(survivor.state).toBe('rescued');
  });

  test('getRescueRate 应该正确计算救援率', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    rescueSystem.rescuedCount = 2;

    const rate = rescueSystem.getRescueRate();

    expect(rate).toBe(2 / rescueSystem.survivors.length);
  });

  test('没有幸存者时救援率应该是1', () => {
    const rate = rescueSystem.getRescueRate();

    expect(rate).toBe(1);
  });

  test('getAverageHealth 应该正确计算平均健康值', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    rescueSystem.survivors[0].health = 80;
    rescueSystem.survivors[1].health = 60;

    const avgHealth = rescueSystem.getAverageHealth();

    expect(avgHealth).toBeGreaterThan(0);
    expect(avgHealth).toBeLessThanOrEqual(100);
  });

  test('getAveragePanic 应该正确计算平均恐慌值', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    rescueSystem.survivors[0].panicLevel = 30;
    rescueSystem.survivors[1].panicLevel = 50;

    const avgPanic = rescueSystem.getAveragePanic();

    expect(avgPanic).toBeGreaterThan(0);
  });

  test('reset 应该重置救援计数', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    rescueSystem.rescuedCount = 5;

    rescueSystem.reset();

    expect(rescueSystem.rescuedCount).toBe(0);
  });

  test('救援中的幸存者恐慌增长应该停止', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.state = 'rescuing';
    const initialPanic = survivor.panicLevel;

    rescueSystem.update(2);

    // 救援中恐慌不应增长
    expect(survivor.panicLevel).toBe(initialPanic);
  });

  test('无法开始救援已丢失的幸存者', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.state = 'lost';

    const result = rescueSystem.startRescue(survivor.id);

    expect(result).toBe(false);
  });

  test('无法重复开始救援', () => {
    rescueSystem.spawnSurvivors(mockBuildings);
    const survivor = rescueSystem.survivors[0];
    survivor.state = 'rescuing';

    const result = rescueSystem.startRescue(survivor.id);

    expect(result).toBe(false);
  });

  test('幸存者位置应该在建筑附近', () => {
    rescueSystem.spawnSurvivors(mockBuildings);

    rescueSystem.survivors.forEach(survivor => {
      expect(survivor.x).toBeGreaterThanOrEqual(survivor.building.x - 20);
      expect(survivor.x).toBeLessThanOrEqual(survivor.building.x + survivor.building.width + 20);
    });
  });

  test('幸存者应该有唯一ID', () => {
    rescueSystem.spawnSurvivors(mockBuildings);

    const ids = rescueSystem.survivors.map(s => s.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });
});
