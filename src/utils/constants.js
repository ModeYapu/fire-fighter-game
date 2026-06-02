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
    SPREAD_INTERVAL: 90,        // 蔓延检查间隔（帧数）
    SPREAD_PROBABILITY: 0.012,  // 基础蔓延概率
    DAMAGE_RATE: 0.009,         // 伤害速率
    EXTINGUISH_RATE: 0.15,      // 灭火效果
    PARTICLE_POOL_SIZE: 300,
    // 难度相关配置
    DIFFICULTY_MODIFIERS: [
        { spreadIntervalMult: 1.5, damageMult: 0.7, wind: 0 },      // 关卡1: 简单
        { spreadIntervalMult: 1.2, damageMult: 1.0, wind: 2 },      // 关卡2: 中等
        { spreadIntervalMult: 0.8, damageMult: 1.3, wind: 5 },      // 关卡3: 困难
    ],
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
        name: '居民区灭火',
        description: '扑灭木屋火灾，学习基本操作',
        buildings: [
            { type: 'WOOD', x: 320, y: 400, initialFire: true },
        ],
        initialFires: [0],
        initialWater: 1200,
        time: 60,
        targetScore: 500,
        wind: 0,
        fireSpreadRate: 0.8,  // 慢速蔓延
        availableFighters: 3,
    },
    {
        id: 2,
        name: '仓库火灾',
        description: '多建筑同时起火，注意风向',
        buildings: [
            { type: 'WOOD', x: 100, y: 400, initialFire: true },
            { type: 'BRICK', x: 320, y: 380, initialFire: true },
            { type: 'WOOD', x: 540, y: 400, initialFire: false },
        ],
        initialFires: [0, 1],
        initialWater: 1800,
        time: 75,
        targetScore: 1200,
        wind: 3,  // 中等风力
        fireSpreadRate: 1.0,  // 正常蔓延
        availableFighters: 2,
    },
    {
        id: 3,
        name: '化工厂危机',
        description: '强风+高楼，保护所有建筑',
        buildings: [
            { type: 'WOOD', x: 60, y: 400, initialFire: true },
            { type: 'BRICK', x: 230, y: 390, initialFire: true },
            { type: 'HIGH_RISE', x: 420, y: 310, initialFire: true },
            { type: 'WOOD', x: 600, y: 400, initialFire: false },
        ],
        initialFires: [0, 1, 2],
        initialWater: 2200,
        time: 90,
        targetScore: 2000,
        wind: 6,  // 强风
        fireSpreadRate: 1.3,  // 快速蔓延
        availableFighters: 2,
    },
];

// ==================== 消防员配置 ====================
export const FIGHTER_TYPES = {
    CAPTAIN: {
        name: '队长',
        icon: '👨‍🚒',
        waterBonus: 1.5, // 水量效率加成
        speedBonus: 1.2, // 移动速度加成
        cooldownReduction: 0.8, // 冷却减少
        ability: '强力水柱',
        abilityDesc: '增加50%射程',
    },
    MEMBER: {
        name: '队员',
        icon: '👨',
        waterBonus: 1.0,
        speedBonus: 1.0,
        cooldownReduction: 1.0,
        ability: '快速灭火',
        abilityDesc: '冷却时间减少20%',
    },
};

// ==================== 评分等级 ====================
export const GRADE_CONFIG = {
    S: { minScore: 0.9, color: '#FFD700', name: 'S' },
    A: { minScore: 0.75, color: '#C0C0C0', name: 'A' },
    B: { minScore: 0.6, color: '#CD7F32', name: 'B' },
    C: { minScore: 0, color: '#808080', name: 'C' },
};

// ==================== 关卡编辑器配置 ====================
export const EDITOR_CONFIG = {
    GRID_SIZE: 40,
    GRID_COLS: 20,
    GRID_ROWS: 15,
    MAX_BUILDINGS: 15,
};

// ==================== 本地存储键 ====================
export const STORAGE_KEYS = {
    PROGRESS: 'fireFighterProgress',
    SETTINGS: 'fireFighterSettings',
    HIGH_SCORES: 'fireFighterHighScores',
    CUSTOM_LEVELS: 'fireFighterCustomLevels',
};
