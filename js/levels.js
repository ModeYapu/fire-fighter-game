class LevelSystem {
    constructor() {
        this.currentLevel = 0;
    }
    
    startLevel(game, levelIndex) {
        game.currentLevel = levelIndex;
        const levelData = LEVEL_DATA[levelIndex];
        
        // 重置游戏状态
        game.score = 0;
        game.water = levelData.initialWater;
        game.time = levelData.time;
        game.buildings = [];
        game.fires = [];
        game.facilities = [];
        
        // 创建建筑
        levelData.buildings.forEach(b => {
            building.create(b.type, b.x, b.y);
        });
        
        // 切换到准备阶段
        game.state = GAME_STATE.PREPARE;
        game.prepareTime = GAME_CONFIG.PREPARE_TIME;
        
        ui.showGameUI();
    }
}

// 创建全局实例
const levels = new LevelSystem();
