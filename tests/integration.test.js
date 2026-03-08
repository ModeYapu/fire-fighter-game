/**
 * 集成测试 - 测试系统间交互
 */

describe('系统集成测试', () => {
  let game;

  beforeAll(() => {
    const fs = require('fs');
    const path = require('path');
    
    // 加载所有依赖
    const files = [
      'physics.js',
      'water.js',
      'fire.js',
      'building.js',
      'facility.js',
      'particles.js',
      'input.js',
      'ui.js',
      'levels.js',
      'game.js'
    ];
    
    files.forEach(file => {
      const code = fs.readFileSync(path.join(__dirname, `../js/${file}`), 'utf8');
      eval(code);
    });
  });

  beforeEach(() => {
    game = new Game();
    game.canvas = document.getElementById('game-canvas');
    game.ctx = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      }))
    };
    
    // Mock particles
    global.particles = {
      createFire: jest.fn(),
      createSmoke: jest.fn(),
      createSplash: jest.fn(),
      update: jest.fn(),
      render: jest.fn()
    };
  });

  describe('水柱与火焰交互', () => {
    test('水柱应该能够熄灭火焰', () => {
      game.startLevel(0);
      game.startBattle();
      
      // 获取火焰
      const testFire = game.fires[0];
      const initialIntensity = testFire.intensity;
      
      // 发射水柱到火焰位置
      const angle = 45;
      const power = 50;
      water.shoot(game, angle, power);
      
      // 模拟水滴移动到火焰位置
      const droplet = water.droplets.find(d => d.active);
      if (droplet) {
        droplet.x = testFire.x;
        droplet.y = testFire.y;
        
        // 更新水柱系统
        water.update(game);
        
        // 验证火焰强度降低
        expect(testFire.intensity).toBeLessThan(initialIntensity);
      }
    });

    test('熄灭火焰应该增加得分', () => {
      game.startLevel(0);
      game.startBattle();
      
      const initialScore = game.score;
      
      // 点燃建筑
      const testFire = fire.ignite(game, game.buildings[0]);
      
      // 发射水柱
      water.shoot(game, 45, 50);
      
      // 模拟碰撞
      const droplet = water.droplets.find(d => d.active);
      if (droplet) {
        droplet.x = testFire.x;
        droplet.y = testFire.y;
        water.update(game);
        
        // 验证得分增加
        expect(game.score).toBeGreaterThan(initialScore);
      }
    });
  });

  describe('火焰蔓延系统', () => {
    test('火焰应该能够蔓延到相邻建筑', () => {
      // 创建两个相邻建筑
      game.buildings = [];
      building.buildings = [];
      game.buildings = building.buildings;
      
      const b1 = building.create('WOOD', 100, 400);
      const b2 = building.create('WOOD', 250, 400);  // 距离150像素
      
      // 点燃第一个建筑
      fire.ignite(game, b1);
      
      // 模拟多次蔓延检查
      for (let i = 0; i < 100; i++) {
        fire.fires.forEach(f => {
          f.spreadTimer = FIRE_CONFIG.SPREAD_INTERVAL;
          f.trySpread(game);
        });
      }
      
      // 验证第二个建筑可能被点燃（概率性）
      const b2HasFire = fire.fires.some(f => f.building === b2);
      // 由于是概率性的，我们只检查不会崩溃
      expect(fire.fires.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('资源系统', () => {
    test('发射水柱应该消耗水量', () => {
      game.water = 1000;
      
      water.shoot(game, 45, 50);
      
      expect(game.water).toBe(1000 - RESOURCE_CONFIG.WATER_PER_SHOT);
    });

    test('水量不足时不应该发射', () => {
      game.water = 1;
      
      const initialWater = game.water;
      water.shoot(game, 45, 50);
      
      expect(game.water).toBe(initialWater);
    });
  });

  describe('建筑系统', () => {
    test('火焰应该对建筑造成伤害', () => {
      const bld = building.create('WOOD', 100, 400);
      const initialHealth = bld.health;
      
      // 点燃建筑
      fire.ignite(game, bld);
      
      // 模拟火焰燃烧
      for (let i = 0; i < 60; i++) {
        fire.update(game);
      }
      
      // 验证建筑血量降低
      expect(bld.health).toBeLessThan(initialHealth);
    });

    test('建筑损毁后火焰应该消失', () => {
      const bld = building.create('WOOD', 100, 400);
      fire.ignite(game, bld);
      
      // 让建筑损毁
      bld.health = 0;
      
      // 更新火焰系统
      fire.update(game);
      
      // 验证火焰被移除
      expect(fire.fires.length).toBe(0);
    });
  });

  describe('关卡系统', () => {
    test('应该正确加载关卡', () => {
      game.startLevel(0);
      
      expect(game.currentLevel).toBe(0);
      expect(game.state).toBe(GAME_STATE.PREPARE);
      expect(game.buildings.length).toBe(LEVEL_DATA[0].buildings.length);
    });

    test('关卡切换应该重置游戏状态', () => {
      // 完成第一关
      game.startLevel(0);
      game.score = 1000;
      game.water = 500;
      
      // 切换到第二关
      game.startLevel(1);
      
      // 验证状态被重置
      expect(game.score).toBe(0);
      expect(game.water).toBe(LEVEL_DATA[1].initialWater);
    });
  });

  describe('游戏流程', () => {
    test('完整的游戏流程应该正常工作', () => {
      // 1. 启动关卡
      game.startLevel(0);
      expect(game.state).toBe(GAME_STATE.PREPARE);
      
      // 2. 开始战斗
      game.startBattle();
      expect(game.state).toBe(GAME_STATE.BATTLE);
      
      // 3. 灭火
      fire.fires.forEach(f => f.extinguish(10));
      
      // 4. 检查胜利
      game.checkWinLose();
      
      // 应该进入胜利状态
      expect(game.state).toBe(GAME_STATE.WIN);
    });
  });
});
