/**
 * 建筑系统测试
 */
import { Building, BuildingSystem } from '../src/core/Building.js';

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  BUILDING_TYPES: {
    WOOD: {
      name: '木屋',
      width: 80,
      height: 60,
      health: 100,
      fireResistance: 0.5,
      color: '#8B4513'
    },
    BRICK: {
      name: '砖房',
      width: 100,
      height: 80,
      health: 150,
      fireResistance: 0.7,
      color: '#B22222'
    },
    HIGH_RISE: {
      name: '高楼',
      width: 120,
      height: 120,
      health: 200,
      fireResistance: 0.3,
      color: '#4682B4'
    }
  }
}));

describe('BuildingSystem', () => {
  let buildingSystem;
  let mockGame;

  beforeEach(() => {
    buildingSystem = new BuildingSystem();
    
    mockGame = {
      ctx: {
        save: jest.fn(),
        restore: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        arc: jest.fn(),
        fillText: jest.fn(),
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        })),
        globalAlpha: 1.0,
        lineWidth: 2,
        strokeStyle: '#000000',
        fillStyle: '#000000',
        textAlign: 'center',
        font: '12px Arial'
      }
    };
  });

  test('应该正确初始化', () => {
    expect(buildingSystem.buildings.length).toBe(0);
    expect(buildingSystem.needSort).toBe(false);
  });

  test('应该正确创建建筑', () => {
    const bld = buildingSystem.create('WOOD', 100, 200);
    
    expect(buildingSystem.buildings.length).toBe(1);
    expect(bld.type).toBe('WOOD');
    expect(bld.x).toBe(100);
    expect(bld.y).toBe(200);
    expect(bld.health).toBe(100); // from mock
  });

  test('创建建筑应该标记需要排序', () => {
    buildingSystem.create('WOOD', 100, 200);
    
    expect(buildingSystem.needSort).toBe(true);
  });

  test('应该正确更新建筑', () => {
    const bld = buildingSystem.create('WOOD', 100, 200);
    bld.health = 50;
    
    buildingSystem.update(mockGame);
    
    expect(bld.health).toBe(50);
  });

  test('不同类型建筑应该有不同属性', () => {
    const wood = buildingSystem.create('WOOD', 100, 200);
    const brick = buildingSystem.create('BRICK', 200, 200);
    const highRise = buildingSystem.create('HIGH_RISE', 300, 200);
    
    expect(wood.fireResistance).toBe(0.5);
    expect(brick.fireResistance).toBe(0.7);
    expect(highRise.fireResistance).toBe(0.3);
    
    expect(wood.health).toBeLessThan(brick.health);
    expect(brick.health).toBeLessThan(highRise.health);
  });

  test('应该只在需要时排序', () => {
    buildingSystem.create('WOOD', 100, 300);
    buildingSystem.create('BRICK', 200, 200);
    
    // 第一次渲染应该排序
    buildingSystem.render(mockGame.ctx);
    expect(buildingSystem.needSort).toBe(false);
    
    // 第二次渲染不应该排序
    const sortedBuildings = [...buildingSystem.buildings];
    buildingSystem.render(mockGame.ctx);
    expect(buildingSystem.buildings).toEqual(sortedBuildings);
  });

  test('建筑应该按y坐标排序（远处的先绘制）', () => {
    buildingSystem.create('WOOD', 100, 300);  // y=300
    buildingSystem.create('BRICK', 200, 200); // y=200
    buildingSystem.create('HIGH_RISE', 300, 250); // y=250
    
    buildingSystem.render(mockGame.ctx);
    
    // 验证排序后的顺序
    expect(buildingSystem.buildings[0].y).toBe(200);
    expect(buildingSystem.buildings[1].y).toBe(250);
    expect(buildingSystem.buildings[2].y).toBe(300);
  });
});

describe('Building', () => {
  test('应该正确初始化建筑', () => {
    const building = new Building('WOOD', 100, 200);
    
    expect(building.type).toBe('WOOD');
    expect(building.x).toBe(100);
    expect(building.y).toBe(200);
    expect(building.health).toBe(100);
    expect(building.width).toBe(80);
    expect(building.height).toBe(60);
  });

  test('update 应该正确更新建筑状态', () => {
    const building = new Building('WOOD', 100, 200);
    const mockGame = {};
    
    building.health = 50;
    building.update(mockGame);
    
    expect(building.health).toBe(50);
  });
});
