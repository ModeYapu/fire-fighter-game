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
    ACHIEVEMENTS: 'fireFighterAchievements',
    LEADERBOARD: 'fireFighterLeaderboard',
};

// ==================== 挑战模式配置 ====================
const CHALLENGE_TYPES = {
    TIME_LIMIT: {
        name: '限时挑战',
        description: '30秒内熄灭所有火焰',
        icon: '⏱️',
        timeLimit: 30,
        waterBonus: 1.0,
        scoreMultiplier: 1.5,
    },
    WATER_SAVE: {
        name: '节水挑战',
        description: '用水量不超过500',
        icon: '💧',
        maxWater: 500,
        timeBonus: 1.2,
        scoreMultiplier: 2.0,
    },
    ACCURACY: {
        name: '精准挑战',
        description: '命中率达到80%以上',
        icon: '🎯',
        minAccuracy: 0.8,
        scoreMultiplier: 2.5,
    },
    SPEED_RUN: {
        name: '速通挑战',
        description: '最快时间通关',
        icon: '⚡',
        scoreMultiplier: 3.0,
    },
};

// ==================== 道具配置 ====================
const POWERUP_TYPES = {
    HELICOPTER: {
        name: '直升机',
        icon: '🚁',
        description: '空中洒水，大范围灭火',
        duration: 5000, // 5秒
        cost: 200,
        effect: 'area_extinguish',
        range: 150,
    },
    FOAM_BOMB: {
        name: '泡沫弹',
        icon: '💣',
        description: '爆炸覆盖区域灭火',
        cost: 150,
        effect: 'explosion',
        radius: 100,
    },
    SMOKE_GRENADE: {
        name: '烟雾弹',
        icon: '💨',
        description: '减缓火势蔓延50%',
        duration: 10000, // 10秒
        cost: 100,
        effect: 'slow_spread',
        slowFactor: 0.5,
    },
    FREEZE_GUN: {
        name: '冰冻枪',
        icon: '❄️',
        description: '临时冻结火焰10秒',
        duration: 10000, // 10秒
        cost: 250,
        effect: 'freeze_fire',
    },
    BUCKET_CHAIN: {
        name: '水桶链',
        icon: '🪣',
        description: '自动回水速度提高3倍',
        duration: 15000, // 15秒
        cost: 120,
        effect: 'fast_refill',
        refillMultiplier: 3.0,
    },
};

// ==================== 天气配置 ====================
const WEATHER_TYPES = {
    RAIN: {
        name: '雨天',
        icon: '🌧️',
        description: '自动灭火但视野模糊',
        fireReduceRate: 0.05, // 每秒减少5%
        visibility: 0.7,
        waterRefillBonus: 1.5,
    },
    WIND: {
        name: '大风',
        icon: '🌪️',
        description: '水柱偏移大，火势蔓延快',
        angleOffset: 20, // ±20度
        spreadMultiplier: 1.5,
        waterDrift: 0.3,
    },
    NIGHT: {
        name: '夜间',
        icon: '🌙',
        description: '视野受限，需要探照灯',
        visibilityRadius: 200,
        spotlightEnabled: true,
    },
    DROUGHT: {
        name: '干旱',
        icon: '☀️',
        description: '水资源减少50%，火焰更强',
        waterReduction: 0.5,
        fireIntensityMultiplier: 1.3,
    },
    CLEAR: {
        name: '晴天',
        icon: '☀️',
        description: '正常天气',
    },
};

// ==================== 成就配置 ====================
const ACHIEVEMENTS = {
    // 关卡成就
    FIRST_LEVEL: {
        id: 'first_level',
        name: '消防新手',
        description: '完成第1关',
        icon: '🚒',
        condition: { type: 'level_complete', level: 1 },
    },
    ALL_LEVELS: {
        id: 'all_levels',
        name: '消防英雄',
        description: '完成所有关卡',
        icon: '🏆',
        condition: { type: 'all_levels_complete' },
    },
    PERFECT_LEVEL: {
        id: 'perfect_level',
        name: '完美通关',
        description: '不损失任何建筑通关',
        icon: '⭐',
        condition: { type: 'no_building_lost' },
    },

    // 节水成就
    WATER_SAVER_1000: {
        id: 'water_saver_1000',
        name: '节水达人',
        description: '单关卡节水1000',
        icon: '💧',
        condition: { type: 'water_saved', amount: 1000 },
    },
    WATER_SAVER_10000: {
        id: 'water_saver_10000',
        name: '节水大师',
        description: '累计节水10000',
        icon: '🌊',
        condition: { type: 'total_water_saved', amount: 10000 },
    },

    // 速度成就
    SPEED_DEMON: {
        id: 'speed_demon',
        name: '速度之星',
        description: '30秒内完成任意关卡',
        icon: '⚡',
        condition: { type: 'fast_complete', time: 30 },
    },
    ALL_SPEED: {
        id: 'all_speed',
        name: '闪电消防员',
        description: '所有关卡速通',
        icon: '🌩️',
        condition: { type: 'all_fast_complete', time: 60 },
    },

    // 精准成就
    SHARPSHOOTER: {
        id: 'sharpshooter',
        name: '精准射手',
        description: '命中率达到90%',
        icon: '🎯',
        condition: { type: 'accuracy', rate: 0.9 },
    },

    // 挑战成就
    CHALLENGE_MASTER: {
        id: 'challenge_master',
        name: '挑战大师',
        description: '完成所有挑战模式',
        icon: '🏅',
        condition: { type: 'all_challenges_complete' },
    },

    // 道具成就
    POWERUP_USER: {
        id: 'powerup_user',
        name: '道具专家',
        description: '使用所有类型的道具',
        icon: '🎁',
        condition: { type: 'use_all_powerups' },
    },

    // 天气成就
    WEATHER_MASTER: {
        id: 'weather_master',
        name: '天气大师',
        description: '在所有天气下通关',
        icon: '🌤️',
        condition: { type: 'all_weather_complete' },
    },

    // 连续成就
    STREAK_3: {
        id: 'streak_3',
        name: '三连胜',
        description: '连续3关获得3星',
        icon: '🔥',
        condition: { type: 'streak', count: 3 },
    },
    STREAK_5: {
        id: 'streak_5',
        name: '五连胜',
        description: '连续5关获得3星',
        icon: '💫',
        condition: { type: 'streak', count: 5 },
    },

    // 累计成就
    FIRES_100: {
        id: 'fires_100',
        name: '灭火新手',
        description: '累计熄灭100个火焰',
        icon: '🔥',
        condition: { type: 'total_fires', count: 100 },
    },
    FIRES_500: {
        id: 'fires_500',
        name: '灭火专家',
        description: '累计熄灭500个火焰',
        icon: '💧',
        condition: { type: 'total_fires', count: 500 },
    },

    // 分数成就
    SCORE_10000: {
        id: 'score_10000',
        name: '得分新星',
        description: '单关卡得分超过10000',
        icon: '💫',
        condition: { type: 'score', amount: 10000 },
    },
};
