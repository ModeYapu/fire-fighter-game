/**
 * 火焰系统测试
 */

describe('FireSystem', () => {
  let Fire, FireSystem;
  let fire;
  let mockGame;
  let mockBuilding;

  beforeAll(() => {
    const fs = require('fs');
    const path = require('path');
    
    const fireCode = fs.readFileSync(path.join(__dirname, '../js/fire.js'), 'utf8');
    eval(fireCode);
    
    Fire = global.Fire;
    FireSystem = global.FireSystem;
  });

  beforeEach(() => {
    fire = new FireSystem();
    
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
      fires: [],
      ctx: {
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        createRadialGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        }))
      }
    };
    
    // Mock particles
    global.particles = {
      createFire: jest.fn(),
      createSmoke: jest.fn()
    };
  });

  test('应该正确初始化', () => {
    expect(fire.fires.length).toBe(0);
  });

  test('应该正确点燃建筑', () => {
    const newFire = fire.ignite(mockGame, mockBuilding);
    
    expect(fire.fires.length).toBe(1);
    expect(newFire.building).toBe(mockBuilding);
    expect(newFire.intensity).toBe(1);
  });

  test('重复点燃应该增加强度', () => {
    fire.ignite(mockGame, mockBuilding);
    fire.ignite(mockGame, mockBuilding);
    fire.ignite(mockGame, mockBuilding);
    
    const existingFire = fire.fires[0];
    expect(existingFire.intensity).toBe(3);
  });

  test('强度不应该超过最大值', () => {
    for (let i = 0; i < 10; i++) {
      fire.ignite(mockGame, mockBuilding);
    }
    
    const existingFire = fire.fires[0];
    expect(existingFire.intensity).toBe(FIRE_CONFIG.MAX_INTENSITY);
  });

  test('火焰应该对建筑造成伤害', () => {
    const newFire = fire.ignite(mockGame, mockBuilding);
    newFire.update(mockGame);
    
    expect(mockBuilding.health).toBeLessThan(100);
  });

  test('灭火应该降低强度', () => {
    const newFire = fire.ignite(mockGame, mockBuilding);
    newFire.extinguish(0.5);
    
    expect(newFire.intensity).toBe(0.5);
  });

  test('强度不应该低于0', () => {
    const newFire = fire.ignite(mockGame, mockBuilding);
    newFire.extinguish(10);
    
    expect(newFire.intensity).toBe(0);
  });

  test('应该生成火焰粒子', () => {
    const newFire = fire.ignite(mockGame, mockBuilding);
    newFire.update(mockGame);
    
    expect(particles.createFire).toHaveBeenCalled();
  });

  test('建筑损毁后火焰应该被移除', () => {
    fire.ignite(mockGame, mockBuilding);
    
    // 让建筑损毁
    mockBuilding.health = 0;
    
    fire.update(mockGame);
    
    expect(fire.fires.length).toBe(0);
  });

  test('应该正确计算火焰位置', () => {
    const newFire = fire.ignite(mockGame, mockBuilding);
    
    // 火焰应该在建筑中心
    expect(newFire.x).toBe(mockBuilding.x + mockBuilding.width / 2);
    expect(newFire.y).toBe(mockBuilding.y + mockBuilding.height / 2);
  });

  test('应该正确更新火焰半径', () => {
    const newFire = fire.ignite(mockGame, mockBuilding);
    newFire.intensity = 3;
    newFire.update(mockGame);
    
    const expectedRadius = 20 + 3 * 10;
    expect(newFire.radius).toBe(expectedRadius);
  });
});
