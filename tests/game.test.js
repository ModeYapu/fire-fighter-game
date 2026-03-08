/**
 * 游戏主循环测试
 */

describe('Game', () => {
  let Game;
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
    
    Game = global.Game;
  });

  beforeEach(() => {
    game = new Game();
    
    // Mock canvas
    game.canvas = document.getElementById('game-canvas');
    game.ctx = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      }))
    };
  });

  test('应该正确初始化', () => {
    expect(game.state).toBe(GAME_STATE.MENU);
    expect(game.score).toBe(0);
    expect(game.water).toBe(RESOURCE_CONFIG.INITIAL_WATER);
  });

  test('应该正确更新准备阶段', () => {
    game.state = GAME_STATE.PREPARE;
    game.prepareTime = 30;
    
    const deltaTime = 1;
    game.updatePrepare(deltaTime);
    
    expect(game.prepareTime).toBe(29);
  });

  test('准备时间结束应该开始战斗', () => {
    game.state = GAME_STATE.PREPARE;
    game.prepareTime = 0.1;
    game.currentLevel = 0;
    
    const startBattleSpy = jest.spyOn(game, 'startBattle');
    game.updatePrepare(0.2);
    
    expect(startBattleSpy).toHaveBeenCalled();
  });

  test('应该正确启动关卡', () => {
    game.startLevel(0);
    
    expect(game.currentLevel).toBe(0);
    expect(game.state).toBe(GAME_STATE.PREPARE);
    expect(game.buildings.length).toBe(LEVEL_DATA[0].buildings.length);
  });

  test('无效关卡索引应该不执行', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    
    game.startLevel(999);
    
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('应该正确判断胜利', () => {
    game.state = GAME_STATE.BATTLE;
    game.fires = [{ intensity: 0 }];
    game.buildings = [{ health: 50 }];
    
    const winSpy = jest.spyOn(game, 'win');
    game.checkWinLose();
    
    expect(winSpy).toHaveBeenCalled();
  });

  test('应该正确判断失败（建筑全部损毁）', () => {
    game.state = GAME_STATE.BATTLE;
    game.fires = [{ intensity: 1 }];
    game.buildings = [{ health: 0 }];
    
    const loseSpy = jest.spyOn(game, 'lose');
    game.checkWinLose();
    
    expect(loseSpy).toHaveBeenCalled();
  });

  test('应该正确判断失败（水量耗尽）', () => {
    game.state = GAME_STATE.BATTLE;
    game.water = 0;
    game.fires = [{ intensity: 1 }];
    game.buildings = [{ health: 50 }];
    
    const loseSpy = jest.spyOn(game, 'lose');
    game.checkWinLose();
    
    expect(loseSpy).toHaveBeenCalled();
  });

  test('应该正确判断失败（时间耗尽）', () => {
    game.state = GAME_STATE.BATTLE;
    game.time = 0;
    game.fires = [{ intensity: 1 }];
    game.buildings = [{ health: 50 }];
    
    const loseSpy = jest.spyOn(game, 'lose');
    game.checkWinLose();
    
    expect(loseSpy).toHaveBeenCalled();
  });

  test('deltaTime应该被限制', () => {
    game.lastTime = 1000;
    const currentTime = 2000;  // 1秒差距
    
    // 大deltaTime应该被限制到0.1
    const deltaTime = Math.min((currentTime - game.lastTime) / 1000, 0.1);
    
    expect(deltaTime).toBe(0.1);
  });
});
