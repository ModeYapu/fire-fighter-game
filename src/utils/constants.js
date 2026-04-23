// ==================== 游戏参数 ====================
export const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    PREPARE_TIME: 10, // 准备阶段时间(秒) - 缩短到10秒
};

// ==================== 物理常量 ====================
export const PHYSICS = {
    GRAVITY: 9.8,
    PIXELS_PER_METER: 20,
    AIR_RESISTANCE: 0.99,
    WIND_VARIATION: 0.1,
};

// ==================== 水柱配置 ====================
export const WATER_CONFIG = {
    MAX_POWER: 100,
    MIN_POWER: 10,
    MAX_ANGLE: 80,
    MIN_ANGLE: 0,
    DROPLET_SIZE: 6,  // 增大水滴
    STREAM_DENSITY: 8, // 每帧发射水滴数 - 更密集
    PARTICLE_POOL_SIZE: 500,
};

// ==================== 火焰配置 ====================
export const FIRE_CONFIG = {
    MAX_INTENSITY: 5,
    MIN_INTENSITY: 1,
    SPREAD_INTERVAL: 90,        // 蔓延检查间隔（帧数）- 降低蔓延速度
    SPREAD_PROBABILITY: 0.01,   // 基础蔓延概率 - 降低
    DAMAGE_RATE: 0.008,         // 降低伤害
    EXTINGUISH_RATE: 0.15,      // 增加灭火效果
    PARTICLE_POOL_SIZE: 300,
};

// ==================== 建筑配置 ====================
export const BUILDING_TYPES = {
    WOOD: {
        name: '木屋',
        width: 160,
        height: 130,
        health: 100,
        fireResistance: 0.5,
        color: '#D2691E',
        roofColor: '#8B4513',
    },
    BRICK: {
        name: '砖房',
        width: 180,
        height: 150,
        health: 150,
        fireResistance: 0.7,
        color: '#CD5C5C',
        roofColor: '#8B0000',
    },
    HIGH_RISE: {
        name: '高楼',
        width: 140,
        height: 220,
        health: 200,
        fireResistance: 0.3,
        color: '#4682B4',
        roofColor: '#2F4F4F',
    },
};

// ==================== 设施配置 ====================
export const FACILITY_TYPES = {
    HYDRANT: {
        name: '消防栓',
        cost: 50,
        range: 100,
        icon: '💧',
        color: '#4169E1',
    },
    FIRE_WALL: {
        name: '防火墙',
        cost: 80,
        range: 50,
        icon: '🧱',
        color: '#8B0000',
    },
    FIGHTER: {
        name: '消防员',
        cost: 100,
        range: 80,
        icon: '👨‍🚒',
        color: '#FF6600',
    },
};

// ==================== 资源配置 ====================
export const RESOURCE_CONFIG = {
    INITIAL_WATER: 1000,
    MAX_WATER: 2000,
    REFILL_RATE: 10,
    WATER_PER_SHOT: 2,
    SCORE_PER_FIRE: 100,
    SCORE_PER_BUILDING_SAVED: 500,
};

// ==================== 颜色配置 ====================
export const COLORS = {
    // 背景渐变
    SKY_TOP: '#1a1a2e',
    SKY_BOTTOM: '#16213e',
    GROUND: '#2d3436',

    // UI颜色
    HUD_BG: 'rgba(0, 0, 0, 0.7)',
    HUD_BORDER: '#3498db',
    TEXT_COLOR: '#ffffff',

    // 游戏元素
    WATER: '#3498db',
    FIRE: '#e74c3c',
    FIRE_GLOW: 'rgba(231, 76, 60, 0.3)',
    SMOKE: '#95a5a6',

    // 状态颜色
    SUCCESS: '#27ae60',
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    INFO: '#3498db',
};

// ==================== 游戏状态 ====================
export const GAME_STATE = {
    MENU: 'menu',
    PREPARE: 'prepare',
    BATTLE: 'battle',
    PAUSE: 'pause',
    WIN: 'win',
    LOSE: 'lose',
    LEVEL_SELECT: 'levelSelect',
};

// ==================== 建筑状态 ====================
export const BUILDING_STATE = {
    NORMAL: 'normal',
    BURNING: 'burning',
    DAMAGED: 'damaged',
    DESTROYED: 'destroyed',
};

// ==================== 按键配置 ====================
export const KEYS = {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ENTER: 'Enter',

    // WASD
    W: 'KeyW',
    A: 'KeyA',
    S: 'KeyS',
    D: 'KeyD',
};

// ==================== 关卡结构 ====================
export const LEVEL_DATA = [
    {
        id: 1,
        name: '教学关卡',
        description: '学习灭火操作',
        buildings: [
            { type: 'WOOD', x: 300, y: 400, initialFire: true },
        ],
        initialFires: [0],
        initialWater: 1000,
        time: 45,
        targetScore: 500,
        wind: 0,
    },
    {
        id: 2,
        name: '双建筑',
        description: '扑灭2栋建筑的火灾',
        buildings: [
            { type: 'WOOD', x: 120, y: 400, initialFire: true },
            { type: 'BRICK', x: 450, y: 380, initialFire: true },
        ],
        initialFires: [0, 1],
        initialWater: 1500,
        time: 60,
        targetScore: 1000,
        wind: 0,
    },
    {
        id: 3,
        name: '高楼救援',
        description: '拯救高楼火灾',
        buildings: [
            { type: 'WOOD', x: 100, y: 400, initialFire: true },
            { type: 'HIGH_RISE', x: 320, y: 330, initialFire: true },
            { type: 'WOOD', x: 550, y: 400, initialFire: false },
        ],
        initialFires: [0, 1],
        initialWater: 2000,
        time: 90,
        targetScore: 1500,
        wind: 0,
    },
    {
        id: 4,
        name: '风力挑战',
        description: '有风情况下灭火',
        buildings: [
            { type: 'BRICK', x: 150, y: 390, initialFire: true },
            { type: 'HIGH_RISE', x: 380, y: 330, initialFire: false },
            { type: 'BRICK', x: 550, y: 390, initialFire: true },
        ],
        initialFires: [0, 2],
        initialWater: 2000,
        time: 90,
        targetScore: 2000,
        wind: 3,
    },
    {
        id: 5,
        name: '终极挑战',
        description: '扑灭所有火灾',
        buildings: [
            { type: 'WOOD', x: 50, y: 400, initialFire: true },
            { type: 'BRICK', x: 240, y: 390, initialFire: true },
            { type: 'HIGH_RISE', x: 450, y: 330, initialFire: true },
            { type: 'WOOD', x: 620, y: 400, initialFire: false },
        ],
        initialFires: [0, 1, 2],
        initialWater: 2500,
        time: 120,
        targetScore: 3000,
        wind: 5,
    },
];

// ==================== 本地存储键 ====================
export const STORAGE_KEYS = {
    PROGRESS: 'fireFighterProgress',
    SETTINGS: 'fireFighterSettings',
    HIGH_SCORES: 'fireFighterHighScores',
};
