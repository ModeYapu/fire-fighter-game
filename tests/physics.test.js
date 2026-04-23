/**
 * 物理引擎测试
 */
import { PhysicsEngine } from '../src/systems/PhysicsEngine.js';

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  PHYSICS: {
    GRAVITY: 9.8,
    PIXELS_PER_METER: 20,
    AIR_RESISTANCE: 0.99,
    WIND_VARIATION: 0.1
  },
  GAME_STATE: {
    MENU: 'MENU',
    PREPARE: 'PREPARE',
    BATTLE: 'BATTLE',
    WIN: 'WIN',
    LOSE: 'LOSE'
  },
  LEVEL_DATA: [
    {
      name: '教学关卡',
      buildings: [{ type: 'WOOD', x: 300, y: 450 }],
      wind: 0
    }
  ]
}));

describe('PhysicsEngine', () => {
  let physics;

  beforeEach(() => {
    physics = new PhysicsEngine();
  });

  test('应该正确初始化', () => {
    expect(physics.gravity).toBe(9.8);
    expect(physics.wind).toBe(0);
  });

  test('应该正确计算抛物线轨迹', () => {
    const x0 = 100;
    const y0 = 500;
    const angle = 45;
    const power = 50;
    const time = 1;

    const result = physics.calculateTrajectory(x0, y0, angle, power, time);

    // 验证x方向运动
    expect(result.x).toBeGreaterThan(x0);
    
    // 验证y方向受重力影响
    expect(result.y).toBeGreaterThan(y0);
    
    // 验证速度分量
    expect(result.vx).toBeDefined();
    expect(result.vy).toBeDefined();
  });

  test('应该正确检测点在矩形内', () => {
    // 点在矩形内
    expect(physics.pointInRect(150, 150, 100, 100, 100, 100)).toBe(true);
    
    // 点在矩形外
    expect(physics.pointInRect(50, 50, 100, 100, 100, 100)).toBe(false);
    
    // 点在边界上
    expect(physics.pointInRect(100, 100, 100, 100, 100, 100)).toBe(true);
  });

  test('应该正确检测圆形与矩形碰撞', () => {
    // 圆形完全在矩形内
    expect(physics.circleRectCollision(150, 150, 10, 100, 100, 100, 100)).toBe(true);
    
    // 圆形完全在矩形外
    expect(physics.circleRectCollision(50, 50, 10, 100, 100, 100, 100)).toBe(false);
    
    // 圆形与矩形边缘相切
    expect(physics.circleRectCollision(95, 150, 10, 100, 100, 100, 100)).toBe(true);
  });

  test('应该正确检测水滴与建筑碰撞', () => {
    const droplet = {
      x: 150,
      y: 150,
      size: 5
    };
    
    const building = {
      x: 100,
      y: 100,
      width: 100,
      height: 100
    };
    
    expect(physics.checkWaterBuildingCollision(droplet, building)).toBe(true);
  });

  test('应该正确检测水滴与火焰碰撞', () => {
    const droplet = {
      x: 150,
      y: 150,
      size: 5
    };
    
    const fire = {
      x: 150,
      y: 150,
      radius: 30
    };
    
    expect(physics.checkWaterFireCollision(droplet, fire)).toBe(true);
  });

  test('应该正确更新风力', () => {
    const mockGame = {
      state: 'BATTLE',
      currentLevel: 0
    };
    
    physics.update(mockGame);
    
    // 风力应该根据关卡配置变化
    expect(typeof physics.wind).toBe('number');
  });
});
