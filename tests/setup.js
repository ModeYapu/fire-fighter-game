// Jest 测试环境设置

// 模拟 DOM 环境
document.body.innerHTML = `
  <canvas id="game-canvas" width="800" height="600"></canvas>
  <div id="main-menu"></div>
  <div id="level-menu"></div>
  <div id="level-grid"></div>
  <div id="top-hud"></div>
  <div id="bottom-hud"></div>
  <div id="sidebar"></div>
  <div id="prepare-message"></div>
  <div id="prepare-timer"></div>
  <div id="result-menu"></div>
  <div id="time-display"></div>
  <div id="water-display"></div>
  <div id="score-display"></div>
  <div id="angle-display"></div>
  <div id="power-display"></div>
  <div id="angle-fill"></div>
  <div id="power-fill"></div>
  <button id="btn-play"></button>
  <button id="btn-levels"></button>
  <button id="btn-back"></button>
  <button id="btn-retry"></button>
  <button id="btn-next"></button>
  <button id="btn-menu"></button>
  <div id="result-title"></div>
  <div id="result-stars"></div>
  <div id="result-score"></div>
  <div id="result-water"></div>
  <div id="result-buildings"></div>
`;

// 模拟 requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

// 模拟 performance.now()
global.performance = {
  now: () => Date.now()
};

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// 全局变量
global.GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  TARGET_FPS: 60,
  PREPARE_TIME: 30
};

global.PHYSICS = {
  GRAVITY: 9.8,
  PIXELS_PER_METER: 20,
  AIR_RESISTANCE: 0.99,
  WIND_VARIATION: 0.1
};

global.WATER_CONFIG = {
  MAX_POWER: 100,
  MIN_POWER: 10,
  MAX_ANGLE: 80,
  MIN_ANGLE: 0,
  DROPLET_SIZE: 3,
  STREAM_DENSITY: 5,
  PARTICLE_POOL_SIZE: 500
};

global.FIRE_CONFIG = {
  MAX_INTENSITY: 5,
  MIN_INTENSITY: 1,
  SPREAD_INTERVAL: 60,
  SPREAD_PROBABILITY: 0.02,
  DAMAGE_RATE: 0.01,
  EXTINGUISH_RATE: 0.1,
  PARTICLE_POOL_SIZE: 300
};

global.BUILDING_TYPES = {
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
};

global.FACILITY_TYPES = {
  HYDRANT: {
    name: '消防栓',
    cost: 50,
    range: 100,
    icon: '💧',
    color: '#4169E1'
  },
  FIRE_WALL: {
    name: '防火墙',
    cost: 80,
    range: 50,
    icon: '🧱',
    color: '#8B0000'
  },
  FIGHTER: {
    name: '消防员',
    cost: 100,
    range: 80,
    icon: '👨‍🚒',
    color: '#FF6600'
  }
};

global.RESOURCE_CONFIG = {
  INITIAL_WATER: 1000,
  MAX_WATER: 2000,
  REFILL_RATE: 10,
  WATER_PER_SHOT: 2,
  SCORE_PER_FIRE: 100,
  SCORE_PER_BUILDING_SAVED: 500
};

global.GAME_STATE = {
  MENU: 'MENU',
  PREPARE: 'PREPARE',
  BATTLE: 'BATTLE',
  WIN: 'WIN',
  LOSE: 'LOSE'
};

global.COLORS = {
  WATER: '#3498db',
  FIRE: '#e74c3c',
  FIRE_GLOW: '#ff6b35',
  SMOKE: '#7f8c8d'
};

global.STORAGE_KEYS = {
  PROGRESS: 'firefighter_progress'
};

global.LEVEL_DATA = [
  {
    name: '教学关卡',
    description: '学习基本操作',
    buildings: [
      { type: 'WOOD', x: 300, y: 450 }
    ],
    initialFires: [0],
    wind: 0,
    initialWater: 1000,
    time: 30,
    targetScore: 500
  }
];

global.KEYS = {
  UP: 'w',
  DOWN: 's',
  LEFT: 'a',
  RIGHT: 'd',
  SPACE: ' ',
  ESC: 'Escape'
};

console.log('✅ Test environment setup complete');
