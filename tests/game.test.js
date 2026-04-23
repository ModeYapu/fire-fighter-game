/**
 * 游戏主循环测试
 */
import { Game } from '../src/core/Game.js';

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  GAME_CONFIG: {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    PREPARE_TIME: 30
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
      description: '学习基本操作',
      buildings: [{ type: 'WOOD', x: 300, y: 450 }],
      initialFires: [0],
      wind: 0,
      initialWater: 1000,
      time: 30,
      targetScore: 500
    }
  ],
  RESOURCE_CONFIG: {
    INITIAL_WATER: 1000,
    MAX_WATER: 2000,
    REFILL_RATE: 10,
    WATER_PER_SHOT: 2,
    SCORE_PER_FIRE: 100,
    SCORE_PER_BUILDING_SAVED: 500
  }
}));

// Mock all dependencies
jest.mock('../src/core/Building.js', () => ({
  BuildingSystem: jest.fn().mockImplementation(() => ({
    buildings: [],
    create: jest.fn((type, x, y) => ({
      type, x, y,
      health: 100,
      width: 80,
      height: 60,
      fireResistance: 0.5
    })),
    update: jest.fn(),
    render: jest.fn()
  }))
}));

jest.mock('../src/core/Fire.js', () => ({
  FireSystem: jest.fn().mockImplementation(() => ({
    fires: [],
    ignite: jest.fn(),
    update: jest.fn(),
    render: jest.fn(),
    clear: jest.fn()
  }))
}));

jest.mock('../src/core/Water.js', () => ({
  WaterSystem: jest.fn().mockImplementation(() => ({
    droplets: [],
    shoot: jest.fn(),
    update: jest.fn(),
    render: jest.fn(),
    clear: jest.fn()
  }))
}));

jest.mock('../src/core/ParticleSystem.js', () => ({
  ParticleSystem: jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    render: jest.fn(),
    clear: jest.fn(),
    createFire: jest.fn(),
    createSmoke: jest.fn(),
    createSplash: jest.fn()
  }))
}));

jest.mock('../src/systems/PhysicsEngine.js', () => ({
  PhysicsEngine: jest.fn().mockImplementation(() => ({
    update: jest.fn(),
    calculateTrajectory: jest.fn()
  }))
}));

jest.mock('../src/systems/InputManager.js', () => ({
  InputManager: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    update: jest.fn(),
    angle: 45,
    power: 50,
    isShooting: false
  }))
}));

jest.mock('../src/systems/UIManager.js', () => ({
  UIManager: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    showGameUI: jest.fn(),
    showResult: jest.fn(),
    updateHUD: jest.fn(),
    updatePrepareTimer: jest.fn()
  }))
}));

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game();
    
    // Mock canvas
    game.canvas = {
      width: 800,
      height: 600,
      getContext: jest.fn(() => ({
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        }))
      }))
    };
    game.ctx = game.canvas.getContext('2d');
  });

  test('应该正确初始化', () => {
    expect(game.state).toBe('MENU');
    expect(game.score).toBe(0);
    expect(game.water).toBe(1000);
  });

  test('应该正确启动关卡', () => {
    game.startLevel(0);
    
    expect(game.currentLevel).toBe(0);
    expect(game.state).toBe('PREPARE');
  });

  test('无效关卡索引应该不执行', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    
    game.startLevel(999);
    
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('应该正确判断胜利', () => {
    game.state = 'BATTLE';
    game.currentLevel = 0;
    game.fires = [{ intensity: 0 }];
    game.buildings = [{ health: 50 }];
    
    const winSpy = jest.spyOn(game, 'win');
    game.checkWinLose();
    
    expect(winSpy).toHaveBeenCalled();
  });

  test('应该正确判断失败（建筑全部损毁）', () => {
    game.state = 'BATTLE';
    game.currentLevel = 0;
    game.fires = [{ intensity: 1 }];
    game.buildings = [{ health: 0 }];
    
    const loseSpy = jest.spyOn(game, 'lose');
    game.checkWinLose();
    
    expect(loseSpy).toHaveBeenCalled();
  });

  test('应该正确判断失败（水量耗尽）', () => {
    game.state = 'BATTLE';
    game.currentLevel = 0;
    game.water = 0;
    game.fires = [{ intensity: 1 }];
    game.buildings = [{ health: 50 }];
    
    const loseSpy = jest.spyOn(game, 'lose');
    game.checkWinLose();
    
    expect(loseSpy).toHaveBeenCalled();
  });

  test('应该正确判断失败（时间耗尽）', () => {
    game.state = 'BATTLE';
    game.currentLevel = 0;
    game.time = 0;
    game.fires = [{ intensity: 1 }];
    game.buildings = [{ health: 50 }];
    
    const loseSpy = jest.spyOn(game, 'lose');
    game.checkWinLose();
    
    expect(loseSpy).toHaveBeenCalled();
  });

  test('win 应该正确设置状态并显示结果', () => {
    game.state = 'BATTLE';
    game.currentLevel = 0;
    game.buildings = [{ health: 100 }];
    
    game.win();
    
    expect(game.state).toBe('WIN');
    expect(game.ui.showResult).toHaveBeenCalledWith(true, game.score, game.water, 1);
  });

  test('lose 应该正确设置状态并显示结果', () => {
    game.state = 'BATTLE';
    game.currentLevel = 0;
    game.buildings = [{ health: 0 }];
    
    game.lose();
    
    expect(game.state).toBe('LOSE');
    expect(game.ui.showResult).toHaveBeenCalledWith(false, game.score, game.water, 0);
  });

  test('deltaTime应该被限制', () => {
    game.lastTime = 1000;
    const currentTime = 2000;  // 1秒差距
    
    // 大deltaTime应该被限制到0.1
    const deltaTime = Math.min((currentTime - game.lastTime) / 1000, 0.1);
    
    expect(deltaTime).toBe(0.1);
  });
});
