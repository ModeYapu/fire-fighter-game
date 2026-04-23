class ResourceSystem {
    constructor() {
        this.water = RESOURCE_CONFIG.INITIAL_WATER;
        this.score = 0;
    }
    
    update(game) {
        // 自动回水（如果有消防栓）
        game.facilities.forEach(f => {
            if (f.type === 'HYDRANT') {
                this.water = Math.min(this.water + RESOURCE_CONFIG.REFILL_RATE / 60, RESOURCE_CONFIG.MAX_WATER);
            }
        });
    }
    
    addScore(amount) {
        this.score += amount;
    }
    
    useWater(amount) {
        if (this.water >= amount) {
            this.water -= amount;
            return true;
        }
        return false;
    }
}

// 创建全局实例
const resources = new ResourceSystem();
