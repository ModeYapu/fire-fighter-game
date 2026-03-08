/**
 * 简化版集成测试 - 测试核心游戏逻辑
 */

// 模拟游戏核心逻辑
class SimpleGame {
  constructor() {
    this.water = 1000;
    this.score = 0;
    this.buildings = [];
    this.fires = [];
  }
  
  shootWater(cost = 2) {
    if (this.water >= cost) {
      this.water -= cost;
      return true;
    }
    return false;
  }
  
  addScore(points) {
    this.score += points;
  }
  
  addBuilding(building) {
    this.buildings.push(building);
  }
  
  addFire(fire) {
    this.fires.push(fire);
  }
  
  checkWin() {
    return this.fires.every(f => f.intensity <= 0);
  }
  
  checkLose() {
    const allDestroyed = this.buildings.every(b => b.health <= 0);
    const noWater = this.water <= 0;
    return allDestroyed || noWater;
  }
}

describe('简化版集成测试', () => {
  let game;
  
  beforeEach(() => {
    game = new SimpleGame();
  });
  
  describe('资源管理', () => {
    test('发射水柱应该消耗水量', () => {
      const result = game.shootWater();
      expect(result).toBe(true);
      expect(game.water).toBe(998);
    });
    
    test('水量不足时不应该发射', () => {
      game.water = 1;
      const result = game.shootWater();
      expect(result).toBe(false);
      expect(game.water).toBe(1);
    });
    
    test('应该正确增加得分', () => {
      game.addScore(100);
      expect(game.score).toBe(100);
    });
  });
  
  describe('建筑与火焰', () => {
    test('应该正确添加建筑', () => {
      game.addBuilding({ health: 100 });
      expect(game.buildings.length).toBe(1);
    });
    
    test('应该正确添加火焰', () => {
      game.addFire({ intensity: 3 });
      expect(game.fires.length).toBe(1);
    });
    
    test('应该正确判断胜利', () => {
      game.addFire({ intensity: 0 });
      expect(game.checkWin()).toBe(true);
    });
    
    test('应该正确判断失败（建筑损毁）', () => {
      game.addBuilding({ health: 0 });
      expect(game.checkLose()).toBe(true);
    });
    
    test('应该正确判断失败（水量耗尽）', () => {
      game.water = 0;
      expect(game.checkLose()).toBe(true);
    });
  });
  
  describe('游戏流程', () => {
    test('完整的灭火流程', () => {
      // 1. 添加建筑
      game.addBuilding({ health: 100, fireResistance: 0.5 });
      
      // 2. 点燃建筑
      game.addFire({ intensity: 3 });
      
      // 3. 发射水柱
      game.shootWater();
      
      // 4. 灭火
      game.fires[0].intensity = 0;
      
      // 5. 增加得分
      game.addScore(100);
      
      // 6. 检查胜利
      expect(game.checkWin()).toBe(true);
      expect(game.score).toBe(100);
      expect(game.water).toBe(998);
    });
  });
});
