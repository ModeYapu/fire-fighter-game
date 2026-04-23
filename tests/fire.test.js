/**
 * 火焰系统测试
 */
import { Fire, FireSystem } from '../src/core/Fire.js';

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  FIRE_CONFIG: {
    MAX_INTENSITY: 5,
    MIN_INTENSITY: 1,
    SPREAD_INTERVAL: 60,
    SPREAD_PROBABILITY: 0.02,
    DAMAGE_RATE: 0.01,
    EXTINGUISH_RATE: 0.1,
    PARTICLE_POOL_SIZE: 300
  },
  COLORS: {
    FIRE: '#e74c3c',
    FIRE_GLOW: '#ff6b35',
    SMOKE: '#7f8c8d'
  },
  LEVEL_DATA: [
    {
      name: '教学关卡',
      buildings: [{ type: 'WOOD', x: 300, y: 450 }],
      initialFires: [0],
      wind: 0,
      initialWater: 1000,
      time: 30,
      targetScore: 500
    }
  ]
}));

describe('FireSystem', () => {
  let fireSystem;
  let mockGame;
  let mockBuilding;

  beforeEach(() => {
    fireSystem = new FireSystem();
    
    mockBuilding = {
      x: 100,
      y: 100,
      width: 80,
      height: 60,
      health: 100,
      fireResistance: 0.5
    };
    
    mockGame = {
      buildings: [mockBuilding],
      fires: fireSystem.fires,
      ctx: {
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        createRadialGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        }))
      },
      particles: {
        createFire: jest.fn(),
        createSmoke: jest.fn()
      },
      fireSystem: fireSystem
    };
  });

  test('应该正确初始化', () => {
    expect(fireSystem.fires.length).toBe(0);
  });

  test('应该正确点燃建筑', () => {
    const newFire = fireSystem.ignite(mockBuilding);
    
    expect(fireSystem.fires.length).toBe(1);
    expect(newFire.building).toBe(mockBuilding);
    expect(newFire.intensity).toBe(1);
  });

  test('重复点燃应该增加强度', () => {
    fireSystem.ignite(mockBuilding);
    fireSystem.ignite(mockBuilding);
    fireSystem.ignite(mockBuilding);
    
    const existingFire = fireSystem.fires[0];
    expect(existingFire.intensity).toBe(3);
  });

  test('强度不应该超过最大值', () => {
    for (let i = 0; i < 10; i++) {
      fireSystem.ignite(mockBuilding);
    }
    
    const existingFire = fireSystem.fires[0];
    expect(existingFire.intensity).toBe(5); // MAX_INTENSITY
  });

  test('火焰应该对建筑造成伤害', () => {
    const newFire = fireSystem.ignite(mockBuilding);
    newFire.update(mockGame);
    
    expect(mockBuilding.health).toBeLessThan(100);
  });

  test('灭火应该降低强度', () => {
    const newFire = fireSystem.ignite(mockBuilding);
    newFire.extinguish(0.5);
    
    expect(newFire.intensity).toBe(0.5);
  });

  test('强度不应该低于0', () => {
    const newFire = fireSystem.ignite(mockBuilding);
    newFire.extinguish(10);
    
    expect(newFire.intensity).toBe(0);
  });

  test('应该生成火焰粒子', () => {
    const newFire = fireSystem.ignite(mockBuilding);
    newFire.update(mockGame);
    
    expect(mockGame.particles.createFire).toHaveBeenCalled();
  });

  test('建筑损毁后火焰应该被移除', () => {
    fireSystem.ignite(mockBuilding);
    
    // 让建筑损毁
    mockBuilding.health = 0;
    
    fireSystem.update(mockGame);
    
    expect(fireSystem.fires.length).toBe(0);
  });

  test('应该正确计算火焰位置', () => {
    const newFire = fireSystem.ignite(mockBuilding);
    
    // 火焰应该在建筑中心
    expect(newFire.x).toBe(mockBuilding.x + mockBuilding.width / 2);
    expect(newFire.y).toBe(mockBuilding.y + mockBuilding.height / 2);
  });

  test('应该正确更新火焰半径', () => {
    const newFire = fireSystem.ignite(mockBuilding);
    newFire.intensity = 3;
    newFire.update(mockGame);
    
    const expectedRadius = 20 + 3 * 10;
    expect(newFire.radius).toBe(expectedRadius);
  });

  test('clear 应该清空所有火焰', () => {
    fireSystem.ignite(mockBuilding);
    fireSystem.clear();
    
    expect(fireSystem.fires.length).toBe(0);
  });

  test('render 应该绘制火焰光晕', () => {
    fireSystem.ignite(mockBuilding);
    fireSystem.render(mockGame);
    
    expect(mockGame.ctx.createRadialGradient).toHaveBeenCalled();
  });
});
