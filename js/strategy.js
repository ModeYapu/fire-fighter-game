class StrategySystem {
    constructor() {
        this.prepareTime = GAME_CONFIG.PREPARE_TIME;
    }
    
    update(game) {
        if (game.state === GAME_STATE.PREPARE) {
            // 准备阶段逻辑
        }
    }
    
    canPlaceFacility(game, type, x, y) {
        const config = FACILITY_TYPES[type.toUpperCase()];
        
        // 检查得分是否足够
        if (game.score < config.cost) {
            return false;
        }
        
        // 检查是否与其他设施重叠
        for (let facility of game.facilities) {
            const dx = facility.x - x;
            const dy = facility.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 50) {
                return false;
            }
        }
        
        // 检查是否在地面以上
        if (y < game.canvas.height - 100) {
            return false;
        }
        
        return true;
    }
}

// 创建全局实例
const strategy = new StrategySystem();
