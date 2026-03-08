// ==================== 游戏参数 ====================
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TARGET_FPS: 60,
    PREPARE_TIME: 30, // 准备阶段时间(秒)
};

// ==================== 物理常量 ====================
const PHYSICS = {
    GRAVITY: 9.8,
    PIXELS_PER_METER: 20,
    AIR_RESISTANCE: 0.99,
    WIND_VARIATION: 0.1,
};

// ==================== 水柱配置 ====================
const WATER_CONFIG = {
    MAX_POWER: 100,
    MIN_POWER: 10,
    MAX_ANGLE: 80,
    MIN_ANGLE: 0,
    DROPLET_SIZE: 3,
    STREAM_DENSITY: 5, // 每帧发射水滴数
    PARTICLE_POOL_SIZE: 500,
};

// ==================== 火焰配置 ====================
const FIRE_CONFIG = {
    MAX_INTENSITY: 5,
    MIN_INTENSITY: 1,
    SPREAD_INTERVAL: 60,        // 蔓延检查间隔（帧数，60帧=1秒）
    SPREAD_PROBABILITY: 0.02,   // 基础蔓延概率（2%）
    DAMAGE_RATE: 0.01,
    EXTINGUISH_RATE: 0.1,
    PARTICLE_POOL_SIZE: 300,
};

// ==================== 建筑配置 ====================
const BUILDING_TYPES = {
    WOOD: {
        name: '木屋',
        width: 80,
        height: 60,
        health: 100,
        fireResistance: 0.5,
        color: '#8B4513',
    },
    BRICK: {
        name: '砖房',
        width: 100,
        height: 80,
        health: 150,
        fireResistance: 0.7,
        color: '#B22222',
    },
    HIGH_RISE: {
        name: '高楼',
        width: 120,
        height: 120,
        health: 200,
        fireResistance: 0.3,
        color: '#4682B4',
    },
};

// ==================== 设施配置 ====================
const FACILITY_TYPES = {
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
const RESOURCE_CONFIG = {
    INITIAL_WATER: 1000,
    MAX_WATER: 2000,
    REFILL_RATE: 10,
    WATER_PER_SHOT: 2,
    SCORE_PER_FIRE: 100,
    SCORE_PER_BUILDING_SAVED: 500,
};

// ==================== 颜色配置 ====================
const COLORS = {
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
    SMOKE: '#95a5a6',

    // 状态颜色
    SUCCESS: '#27ae60',
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    INFO: '#3498db',
};

// ==================== 游戏状态 ====================
const GAME_STATE = {
    MENU: 'menu',
    PREPARE: 'prepare',
    BATTLE: 'battle',
    PAUSE: 'pause',
    WIN: 'win',
    LOSE: 'lose',
    LEVEL_SELECT: 'levelSelect',
};

// ==================== 建筑状态 ====================
const BUILDING_STATE = {
    NORMAL: 'normal',
    BURNING: 'burning',
    DAMAGED: 'damaged',
    DESTROYED: 'destroyed',
};

// ==================== 按键配置 ====================
const KEYS = {
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
const LEVEL_DATA = [
    {
        id: 1,
        name: '教学关卡',
        description: '学习基本的灭火操作',
        buildings: [
            { type: 'WOOD', x: 350, y: 450, initialFire: true },
        ],
        wind: 0,
        water: 1000,
        time: 60,
        targetScore: 500,
    },
    {
        id: 2,
        name: '小区火灾',
        description: '扑灭3栋建筑的火灾',
        buildings: [
            { type: 'WOOD', x: 200, y: 450, initialFire: true },
            { type: 'BRICK', x: 350, y: 430, initialFire: false },
            { type: 'WOOD', x: 500, y: 450, initialFire: true },
        ],
        wind: 0,
        water: 1200,
        time: 90,
        targetScore: 1000,
    },
    {
        id: 3,
        name: '风力挑战',
        description: '在有风的情况下灭火',
        buildings: [
            { type: 'WOOD', x: 150, y: 450, initialFire: true },
            { type: 'WOOD', x: 280, y: 450, initialFire: true },
            { type: 'BRICK', x: 410, y: 430, initialFire: false },
            { type: 'WOOD', x: 540, y: 450, initialFire: true },
            { type: 'WOOD', x: 670, y: 450, initialFire: false },
        ],
        wind: 5,
        water: 1500,
        time: 120,
        targetScore: 1500,
    },
    {
        id: 4,
        name: '城市大火',
        description: '扑灭8栋建筑的火灾',
        buildings: [
            { type: 'WOOD', x: 80, y: 450, initialFire: true },
            { type: 'BRICK', x: 180, y: 430, initialFire: true },
            { type: 'HIGH_RISE', x: 300, y: 400, initialFire: false },
            { type: 'WOOD', x: 430, y: 450, initialFire: true },
            { type: 'BRICK', x: 530, y: 430, initialFire: false },
            { type: 'WOOD', x: 640, y: 450, initialFire: true },
            { type: 'BRICK', x: 740, y: 430, initialFire: false },
            { type: 'HIGH_RISE', x: 400, y: 450, initialFire: false },
        ],
        wind: 3,
        water: 2000,
        time: 150,
        targetScore: 2500,
    },
    {
        id: 5,
        name: '终极挑战',
        description: '扑灭12栋建筑的火灾',
        buildings: [
            { type: 'WOOD', x: 50, y: 450, initialFire: true },
            { type: 'WOOD', x: 140, y: 450, initialFire: true },
            { type: 'BRICK', x: 230, y: 430, initialFire: true },
            { type: 'BRICK', x: 330, y: 430, initialFire: false },
            { type: 'HIGH_RISE', x: 430, y: 400, initialFire: true },
            { type: 'HIGH_RISE', x: 550, y: 400, initialFire: false },
            { type: 'BRICK', x: 670, y: 430, initialFire: true },
            { type: 'WOOD', x: 500, y: 450, initialFire: true },
            { type: 'WOOD', x: 600, y: 450, initialFire: true },
            { type: 'BRICK', x: 700, y: 430, initialFire: true },
            { type: 'WOOD', x: 100, y: 450, initialFire: false },
            { type: 'HIGH_RISE', x: 250, y: 400, initialFire: true },
        ],
        wind: 7,
        water: 2500,
        time: 180,
        targetScore: 4000,
    },
];

// ==================== 本地存储键 ====================
const STORAGE_KEYS = {
    PROGRESS: 'fireFighterProgress',
    SETTINGS: 'fireFighterSettings',
    HIGH_SCORES: 'fireFighterHighScores',
};
