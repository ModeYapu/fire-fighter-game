/**
 * 水柱系统测试
 */

describe('WaterSystem', () => {
  let WaterDroplet, WaterSystem;
  let water;
  let mockGame;

  beforeAll(() => {
    // 先加载physics
    const fs = require('fs');
    const path = require('path');
    
    const physicsCode = fs.readFileSync(path.join(__dirname, '../js/physics.js'), 'utf8');
    eval(physicsCode);
    
    // 再加载water
    const waterCode = fs.readFileSync(path.join(__dirname, '../js/water.js'), 'utf8');
    eval(waterCode);
    
    WaterDroplet = global.WaterDroplet;
    WaterSystem = global.WaterSystem;
  });

  beforeEach(() => {
    water = new WaterSystem();
    
    mockGame = {
      water: 1000,
      score: 0,
      canvas: { height: 600 },
      buildings: [],
      fires: [],
      ctx: {
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn()
      }
    };
  });

  test('应该正确初始化粒子池', () => {
    expect(water.droplets.length).toBe(WATER_CONFIG.PARTICLE_POOL_SIZE);
    expect(water.poolSize).toBe(WATER_CONFIG.PARTICLE_POOL_SIZE);
  });

  test('应该正确发射水滴', () => {
    const angle = 45;
    const power = 50;
    
    water.shoot(mockGame, angle, power);
    
    // 验证消耗了水量
    expect(mockGame.water).toBe(1000 - RESOURCE_CONFIG.WATER_PER_SHOT);
    
    // 验证有活跃的水滴
    const activeDroplets = water.droplets.filter(d => d.active);
    expect(activeDroplets.length).toBeGreaterThan(0);
  });

  test('水量不足时不应该发射', () => {
    mockGame.water = 0;
    
    water.shoot(mockGame, 45, 50);
    
    // 验证没有活跃的水滴
    const activeDroplets = water.droplets.filter(d => d.active);
    expect(activeDroplets.length).toBe(0);
  });

  test('水滴应该受重力影响', () => {
    const droplet = new WaterDroplet(100, 100, 10, -10, 5);
    
    const initialVy = droplet.vy;
    droplet.update();
    
    // y方向速度应该增加（向下）
    expect(droplet.vy).toBeGreaterThan(initialVy);
  });

  test('水滴出界应该失效', () => {
    const droplet = new WaterDroplet(100, 100, 10, 10, 5);
    
    // 移到画布外
    droplet.y = 700;
    droplet.update();
    
    expect(droplet.active).toBe(false);
  });

  test('应该正确获取可用粒子', () => {
    const droplet = water.getDroplet();
    
    expect(droplet).toBeDefined();
    expect(droplet.active).toBeFalsy();
  });

  test('粒子池耗尽时应该返回null', () => {
    // 激活所有粒子
    water.droplets.forEach(d => d.active = true);
    
    const droplet = water.getDroplet();
    
    expect(droplet).toBeNull();
  });

  test('水滴与火焰碰撞应该增加得分', () => {
    // 创建一个水滴
    const droplet = water.getDroplet();
    droplet.x = 150;
    droplet.y = 150;
    droplet.active = true;
    
    // 创建一个火焰
    const mockFire = {
      x: 150,
      y: 150,
      radius: 30,
      intensity: 3,
      extinguish: jest.fn()
    };
    mockGame.fires = [mockFire];
    
    water.update(mockGame);
    
    // 验证得分增加
    expect(mockGame.score).toBeGreaterThan(0);
    
    // 验证调用了灭火方法
    expect(mockFire.extinguish).toHaveBeenCalled();
  });

  test('水滴与建筑碰撞应该创建水花', () => {
    // 创建一个水滴
    const droplet = water.getDroplet();
    droplet.x = 150;
    droplet.y = 150;
    droplet.active = true;
    
    // 创建一个建筑
    const mockBuilding = {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      health: 100
    };
    mockGame.buildings = [mockBuilding];
    
    // Mock particles.createSplash
    global.particles = {
      createSplash: jest.fn()
    };
    
    water.update(mockGame);
    
    // 验证水滴失效
    expect(droplet.active).toBe(false);
  });
});
