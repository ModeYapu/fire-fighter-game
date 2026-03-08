/**
 * 建筑系统测试
 */

describe('BuildingSystem', () => {
  let Building, BuildingSystem;
  let building;
  let mockGame;

  beforeAll(() => {
    const fs = require('fs');
    const path = require('path');
    
    const buildingCode = fs.readFileSync(path.join(__dirname, '../js/building.js'), 'utf8');
    eval(buildingCode);
    
    Building = global.Building;
    BuildingSystem = global.BuildingSystem;
  });

  beforeEach(() => {
    building = new BuildingSystem();
    
    mockGame = {
      ctx: {
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn()
      }
    };
  });

  test('应该正确初始化', () => {
    expect(building.buildings.length).toBe(0);
    expect(building.needSort).toBe(false);
  });

  test('应该正确创建建筑', () => {
    const bld = building.create('WOOD', 100, 200);
    
    expect(building.buildings.length).toBe(1);
    expect(bld.type).toBe('WOOD');
    expect(bld.x).toBe(100);
    expect(bld.y).toBe(200);
    expect(bld.health).toBe(BUILDING_TYPES.WOOD.health);
  });

  test('创建建筑应该标记需要排序', () => {
    building.create('WOOD', 100, 200);
    
    expect(building.needSort).toBe(true);
  });

  test('应该正确更新建筑', () => {
    const bld = building.create('WOOD', 100, 200);
    bld.health = 50;
    
    building.update(mockGame);
    
    expect(bld.health).toBe(50);
  });

  test('建筑血量不应该低于0', () => {
    const bld = building.create('WOOD', 100, 200);
    bld.health = -10;
    
    bld.update(mockGame);
    
    expect(bld.health).toBe(0);
  });

  test('不同类型建筑应该有不同属性', () => {
    const wood = building.create('WOOD', 100, 200);
    const brick = building.create('BRICK', 200, 200);
    const highRise = building.create('HIGH_RISE', 300, 200);
    
    expect(wood.fireResistance).toBe(0.5);
    expect(brick.fireResistance).toBe(0.7);
    expect(highRise.fireResistance).toBe(0.3);
    
    expect(wood.health).toBeLessThan(brick.health);
    expect(brick.health).toBeLessThan(highRise.health);
  });

  test('应该只在需要时排序', () => {
    building.create('WOOD', 100, 300);
    building.create('BRICK', 200, 200);
    
    // 第一次渲染应该排序
    building.render(mockGame);
    expect(building.needSort).toBe(false);
    
    // 第二次渲染不应该排序
    const sortedBuildings = [...building.buildings];
    building.render(mockGame);
    expect(building.buildings).toEqual(sortedBuildings);
  });

  test('建筑应该按y坐标排序（远处的先绘制）', () => {
    building.create('WOOD', 100, 300);  // y=300
    building.create('BRICK', 200, 200); // y=200
    building.create('HIGH_RISE', 300, 250); // y=250
    
    building.render(mockGame);
    
    // 验证排序后的顺序
    expect(building.buildings[0].y).toBe(200);
    expect(building.buildings[1].y).toBe(250);
    expect(building.buildings[2].y).toBe(300);
  });
});
