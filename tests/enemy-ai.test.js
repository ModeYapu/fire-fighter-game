/**
 * 火焰 AI 系统测试
 */
describe('FireAISystem', () => {
  let aiSystem;
  let mockGame;
  beforeEach(() => {
    // 创建 mock game
    mockGame = {
      player: {
        x: 400,
        y: 300,
        health: 100
      },
      buildings: [],
      canvas: {
        width: 800,
        height: 600
      },
      fireSystem: {
        fires: []
      },
      onBossSpawn: jest.fn(),
      onBossPhaseChange: jest.fn(),
      onBossRegenerate: jest.fn()
    };
    const { FireAISystem } = require('../js/enemy-ai.js');
    aiSystem = new FireAISystem(mockGame);
    aiSystem.init();
  });

  // ===== 初始化测试 =====
  describe('初始化', () => {
    test('应该正确初始化', () => {
      expect(aiSystem.fireEntities).toEqual([]);
      expect(aiSystem.bossFires).toEqual([]);
      expect(aiSystem.mutatedFires).toEqual([]);
      expect(aiSystem.windDirection).toBeDefined();
      expect(aiSystem.windStrength).toBe(0.5);
    });
    test('应该记录调试日志', () => {
      expect(aiSystem.visualization.debugLog.length).toBeGreaterThan(0);
      // debugLog 存储对象格式 {text, time}
      const log = aiSystem.visualization.debugLog[0];
      expect(log.text).toContain('火焰 AI 系统已初始化');
    });
    test('应该有变异类型定义', () => {
      expect(aiSystem.mutationTypes.poison).toBeDefined();
      expect(aiSystem.mutationTypes.electric).toBeDefined();
      expect(aiSystem.mutationTypes.oil).toBeDefined();
    });
    test('应该有 Boss 类型定义', () => {
      expect(aiSystem.bossTypes.inferno).toBeDefined();
      expect(aiSystem.bossTypes.phoenix).toBeDefined();
    });
  });

  // ===== 火焰实体创建测试 =====
  describe('火焰实体', () => {
    test('应该创建火焰实体', () => {
      const entity = aiSystem.createFireEntity(100, 200);
      expect(entity).toBeDefined();
      expect(entity.x).toBe(100);
      expect(entity.y).toBe(200);
      expect(entity.health).toBe(100);
      expect(entity.alive).toBe(true);
      expect(entity.ai.behavior).toBe('spread');
      expect(entity.ai.strategy).toBe('aggressive');
    });
    test('火焰应该有唯一 ID', () => {
      const entity1 = aiSystem.createFireEntity(100, 200);
      const entity2 = aiSystem.createFireEntity(150, 250);
      expect(entity1.id).toBeDefined();
      expect(entity2.id).toBeDefined();
      expect(entity1.id).not.toBe(entity2.id);
    });
    test('应该应用变异属性', () => {
      const entity = aiSystem.createFireEntity(100, 200, {
        mutation: 'poison'
      });
      expect(entity.mutation).toBe('poison');
      expect(entity.mutationData).toBeDefined();
      expect(entity.mutationData.name).toBe('毒火');
      expect(entity.health).toBe(150); // 毒火的生命值
    });
    test('应该支持所有变异类型', () => {
      const poison = aiSystem.createFireEntity(100, 200, {
        mutation: 'poison'
      });
      const electric = aiSystem.createFireEntity(150, 250, {
        mutation: 'electric'
      });
      const oil = aiSystem.createFireEntity(200, 300, {
        mutation: 'oil'
      });
      expect(poison.mutationData.damageType).toBe('poison');
      expect(electric.mutationData.damageType).toBe('electric');
      expect(oil.mutationData.damageType).toBe('explosion');
    });
    test('无效变异应该不应用', () => {
      const entity = aiSystem.createFireEntity(100, 200, {
        mutation: 'invalid'
      });
      expect(entity.health).toBe(100); // 默认值
      expect(entity.mutationData).toBeUndefined();
    });
    test('应该创建 Boss 火焰', () => {
      const entity = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });
      expect(entity.isBoss).toBe(true);
      expect(entity.bossType).toBe('inferno');
      expect(entity.health).toBe(500); // Boss 生命值
      expect(entity.size).toBe(80); // Boss 大小
    });
    test('Boss 应该触发事件', () => {
      aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });
      expect(mockGame.onBossSpawn).toHaveBeenCalled();
    });
    test('Boss 应该有阶段数据', () => {
      const entity = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });
      expect(entity.bossData.phases).toBeDefined();
      expect(entity.bossData.phases.length).toBe(3);
      expect(entity.ai.bossPhaseIndex).toBe(0);
    });
    test('不死鸟 Boss 应该有再生属性', () => {
      const entity = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'phoenix'
      });
      expect(entity.bossData.canRegenerate).toBe(true);
      expect(entity.bossData.regenCount).toBe(0);
      expect(entity.bossData.maxRegen).toBe(2);
    });
  });

  // ===== AI 决策测试 =====
  describe('AI 决策', () => {
    test('应该计算蔓延方向权重', () => {
      const entity = aiSystem.createFireEntity(400, 300);
      const directions = aiSystem.getWeightedSpreadDirections(entity);
      expect(directions).toBeDefined();
      expect(directions.length).toBe(8); // 8 个方向
      directions.forEach(dir => {
        expect(dir.dx).toBeDefined();
        expect(dir.dy).toBeDefined();
        expect(dir.weight).toBeGreaterThan(0);
        expect(dir.reason).toBeDefined();
      });
    });
    test('应该按权重排序方向', () => {
      const entity = aiSystem.createFireEntity(400, 300);
      const directions = aiSystem.getWeightedSpreadDirections(entity);
      for (let i = 0; i < directions.length - 1; i++) {
        expect(directions[i].weight).toBeGreaterThanOrEqual(directions[i + 1].weight);
      }
    });
    test('顺风应该有更高权重', () => {
      aiSystem.windDirection = {
        x: 1,
        y: 0
      };
      aiSystem.windStrength = 0.8;
      const entity = aiSystem.createFireEntity(400, 300);
      const directions = aiSystem.getWeightedSpreadDirections(entity);

      // 向右（顺风）的权重应该更高
      const rightDir = directions.find(d => d.dx > 0.5 && d.dy < 0.3);
      const leftDir = directions.find(d => d.dx < -0.5 && d.dy < 0.3);
      expect(rightDir.weight).toBeGreaterThan(leftDir.weight);
    });
    test('应该计算蔓延计划', () => {
      const entity = aiSystem.createFireEntity(400, 300);
      aiSystem.calculateSpreadPlan(entity);
      expect(entity.visualization.plannedMoves).toBeDefined();
      expect(entity.visualization.plannedMoves.length).toBeGreaterThan(0);
      expect(entity.visualization.plannedMoves.length).toBeLessThanOrEqual(3);
    });
    test('蔓延计划应该包含坐标和原因', () => {
      const entity = aiSystem.createFireEntity(400, 300);
      aiSystem.calculateSpreadPlan(entity);
      entity.visualization.plannedMoves.forEach(move => {
        expect(move.x).toBeDefined();
        expect(move.y).toBeDefined();
        expect(move.weight).toBeDefined();
        expect(move.reason).toBeDefined();
      });
    });
    test('应该选择最佳蔓延方向', () => {
      const entity = aiSystem.createFireEntity(400, 300);
      const directions = aiSystem.getWeightedSpreadDirections(entity);
      const best = directions[0];
      expect(best).toBeDefined();
      expect(best.weight).toBeGreaterThanOrEqual(directions[1].weight);
    });
  });

  // ===== 行为策略测试 =====
  describe('行为策略', () => {
    test('玩家靠近时应该选择防御或逃跑', () => {
      mockGame.player.x = 420; // 靠近火焰
      mockGame.player.y = 300;
      const entity = aiSystem.createFireEntity(400, 300);
      aiSystem.makeAIDecision(entity, Date.now());
      expect(['defend', 'retreat']).toContain(entity.ai.behavior);
      expect(entity.ai.strategy).toBe('defensive');
    });
    test('有多处可燃物时应该积极蔓延', () => {
      // 添加建筑作为可燃物
      mockGame.buildings = [{
        x: 350,
        y: 250,
        width: 80,
        height: 60
      }, {
        x: 450,
        y: 350,
        width: 80,
        height: 60
      }, {
        x: 380,
        y: 200,
        width: 80,
        height: 60
      }];
      mockGame.player.x = 700; // 玩家远离
      mockGame.player.y = 500;
      const entity = aiSystem.createFireEntity(400, 300);
      aiSystem.makeAIDecision(entity, Date.now());
      expect(entity.ai.behavior).toBe('spread');
      expect(entity.ai.strategy).toBe('aggressive');
    });
    test('孤立时应该寻找目标', () => {
      mockGame.player.x = 700;
      mockGame.player.y = 500;
      const entity = aiSystem.createFireEntity(400, 300);
      aiSystem.makeAIDecision(entity, Date.now());

      // 在没有其他火焰时
      expect(entity.ai.behavior).toBe('hunt');
      expect(entity.ai.strategy).toBe('flanking');
    });
  });

  // ===== Boss AI 测试 =====
  describe('Boss AI', () => {
    test('应该更新 Boss 阶段', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });

      // 高生命值 - 第一阶段
      aiSystem.updateBossAI(boss, 1000);
      expect(boss.ai.bossPhaseIndex).toBe(0);

      // 低生命值 - 第三阶段
      boss.health = 100;
      aiSystem.updateBossAI(boss, 1000);
      expect(boss.ai.bossPhaseIndex).toBe(2);
    });
    test('阶段改变应该触发事件', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });
      boss.health = 100;
      aiSystem.updateBossAI(boss, 1000);
      expect(mockGame.onBossPhaseChange).toHaveBeenCalledWith(boss, 2);
    });
    test('应该执行 Boss 攻击', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });
      boss.ai.specialAttackCooldown = 0;
      aiSystem.updateBossAI(boss, 1000);

      // 冷却时间应该重置
      expect(boss.ai.specialAttackCooldown).toBeGreaterThan(0);
    });
    test('不死鸟应该能够再生', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'phoenix'
      });
      boss.health = 0;
      boss.alive = false;
      aiSystem.updateBossAI(boss, 1000);
      expect(boss.alive).toBe(true);
      expect(boss.health).toBe(200); // 50% of 400
      expect(boss.bossData.regenCount).toBe(1);
    });
    test('不死鸟再生次数应该有限制', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'phoenix'
      });
      boss.bossData.regenCount = 2; // 已达到上限
      boss.health = 0;
      boss.alive = false;
      aiSystem.updateBossAI(boss, 1000);
      expect(boss.alive).toBe(false);
      expect(boss.bossData.regenCount).toBe(2);
    });
    test('再生应该触发事件', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'phoenix'
      });
      boss.health = 0;
      boss.alive = false;
      aiSystem.updateBossAI(boss, 1000);
      expect(mockGame.onBossRegenerate).toHaveBeenCalledWith(boss);
    });
  });

  // ===== Boss 攻击测试 =====
  describe('Boss 攻击', () => {
    test('应该选择可用的攻击', () => {
      const attacks = ['fireball', 'spread', 'summon'];
      for (let i = 0; i < 20; i++) {
        const attack = aiSystem.selectBossAttack(attacks);
        expect(attacks).toContain(attack);
      }
    });
    test('空攻击列表应该返回 null', () => {
      const attack = aiSystem.selectBossAttack([]);
      expect(attack).toBeNull();
    });
    test('火球攻击应该记录日志', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });

      // 添加可燃物
      mockGame.buildings = [{
        x: 450,
        y: 300,
        width: 60,
        height: 60
      }];
      aiSystem.bossFireballAttack(boss);
      const logs = aiSystem.visualization.debugLog;
      expect(logs.some(log => log.text.includes('Boss 发射火球'))).toBe(true);
    });
    test('蔓延攻击应该创建小火焰', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });
      const initialCount = aiSystem.fireEntities.length;
      aiSystem.bossSpreadAttack(boss);

      // 应该创建 8 个小火焰（不包括 boss）
      expect(aiSystem.fireEntities.length - initialCount).toBe(8);
    });
    test('召唤攻击应该创建变异小火焰', () => {
      const boss = aiSystem.createFireEntity(400, 300, {
        isBoss: true,
        bossType: 'inferno'
      });
      const initialCount = aiSystem.fireEntities.length;
      aiSystem.bossSummonMinions(boss);

      // 应该创建 3 个仆从
      expect(aiSystem.fireEntities.length - initialCount).toBe(3);

      // 检查是否有变异
      const mutations = aiSystem.fireEntities.slice(initialCount).filter(e => e.mutation);
      expect(mutations.length).toBeGreaterThan(0);
    });
  });

  // ===== 变异效果测试 =====
  describe('变异效果', () => {
    test('毒火应该释放烟雾', () => {
      const entity = aiSystem.createFireEntity(400, 300, {
        mutation: 'poison'
      });
      aiSystem.emitPoisonSmoke(entity);
      expect(entity.particles.length).toBeGreaterThan(0);
      expect(entity.particles[0].type).toBe('poison_smoke');
    });
    test('电火应该放电', () => {
      const entity = aiSystem.createFireEntity(400, 300, {
        mutation: 'electric'
      });
      mockGame.buildings = [{
        x: 450,
        y: 300,
        width: 60,
        height: 60
      }];
      const initialCount = aiSystem.fireEntities.length;
      aiSystem.electricDischarge(entity);

      // 应该创建新的火焰
      expect(aiSystem.fireEntities.length).toBeGreaterThan(initialCount);
    });
    test('油火应该溅射', () => {
      const entity = aiSystem.createFireEntity(400, 300, {
        mutation: 'oil'
      });
      const initialCount = aiSystem.fireEntities.length;
      aiSystem.oilSplash(entity);

      // 应该创建新的火焰
      expect(aiSystem.fireEntities.length - initialCount).toBe(3);
    });
    test('变异效果应该有正确的粒子颜色', () => {
      const poison = aiSystem.createFireEntity(100, 200, {
        mutation: 'poison'
      });
      const electric = aiSystem.createFireEntity(150, 250, {
        mutation: 'electric'
      });
      const oil = aiSystem.createFireEntity(200, 300, {
        mutation: 'oil'
      });
      expect(poison.mutationData.particleColor).toContain('155, 89, 182'); // 紫色
      expect(electric.mutationData.particleColor).toContain('241, 196, 15'); // 黄色
      expect(oil.mutationData.particleColor).toContain('44, 62, 80'); // 深色
    });
  });

  // ===== 蔓延测试 =====
  describe('火焰蔓延', () => {
    test('应该尝试蔓延', () => {
      const initialCount = aiSystem.fireEntities.length;
      const entity = aiSystem.createFireEntity(400, 300);
      entity.lastSpreadTime = entity.spreadCooldown + 100;
      aiSystem.trySpread(entity, Date.now());
      expect(aiSystem.fireEntities.length).toBeGreaterThan(initialCount);
    });
    test('蔓延应该在有效位置', () => {
      const initialCount = aiSystem.fireEntities.length;
      const entity = aiSystem.createFireEntity(400, 300);
      entity.lastSpreadTime = entity.spreadCooldown + 100;
      aiSystem.trySpread(entity, Date.now());
      const newFire = aiSystem.fireEntities[initialCount];
      expect(newFire.x).toBeGreaterThan(0);
      expect(newFire.y).toBeGreaterThan(0);
      expect(newFire.x).toBeLessThan(800);
      expect(newFire.y).toBeLessThan(600);
    });
    test('蔓延应该记录原因', () => {
      const entity = aiSystem.createFireEntity(400, 300);
      entity.lastSpreadTime = entity.spreadCooldown + 100;
      aiSystem.trySpread(entity, Date.now());
      const logs = aiSystem.visualization.debugLog;
      expect(logs.some(log => log.text.includes('蔓延') && log.text.includes('→'))).toBe(true);
    });
    test('未到冷却时间不应该蔓延', () => {
      const entity = aiSystem.createFireEntity(400, 300);
      const initialCount = aiSystem.fireEntities.length;
      entity.lastSpreadTime = 0;
      // 使用较小的 dt，不会触发蔓延
      aiSystem.updateFireAI(entity, 100, Date.now());
      expect(aiSystem.fireEntities.length).toBe(initialCount);
    });
  });

  // ===== 可视化测试 =====
  describe('AI 可视化', () => {
    test('应该切换可视化状态', () => {
      const initial = aiSystem.showAIVisualization;
      const newState = aiSystem.toggleVisualization();
      expect(newState).toBe(!initial);
      expect(aiSystem.showAIVisualization).toBe(newState);
    });
    test('应该更新火焰可视化', () => {
      const entity = aiSystem.createFireEntity(400, 300);
      entity.ai.pathHistory = [{
        x: 400,
        y: 300,
        t: Date.now()
      }];
      aiSystem.updateVisualization(entity);
      expect(entity.visualization).toBeDefined();
      expect(entity.visualization.showPath).toBe(true);
      expect(entity.visualization.plannedMoves).toBeDefined();
    });
    test('应该限制路径历史长度', () => {
      const entity = aiSystem.createFireEntity(400, 300);

      // 添加超过限制的历史点
      for (let i = 0; i < 30; i++) {
        entity.ai.pathHistory.push({
          x: 400 + i,
          y: 300,
          t: Date.now()
        });
      }

      // 更新应该限制到 20
      aiSystem.updateFireAI(entity, 1000, Date.now());
      expect(entity.ai.pathHistory.length).toBeLessThanOrEqual(20);
    });
  });

  // ===== 距离计算测试 =====
  describe('距离计算', () => {
    test('应该计算到玩家的距离', () => {
      mockGame.player.x = 500;
      mockGame.player.y = 400;
      const entity = aiSystem.createFireEntity(400, 300);
      const dist = aiSystem.distanceToPlayer(entity);
      expect(dist).toBeGreaterThan(0);
      expect(dist).toBeCloseTo(Math.sqrt(100 * 100 + 100 * 100));
    });
    test('应该计算到玩家的方向', () => {
      mockGame.player.x = 500;
      mockGame.player.y = 300;
      const entity = aiSystem.createFireEntity(400, 300);
      const dir = aiSystem.getDirectionToPlayer(entity);
      expect(dir.x).toBeGreaterThan(0);
      expect(dir.y).toBeCloseTo(0);
    });
    test('应该查找附近的可燃物', () => {
      mockGame.buildings = [{
        x: 350,
        y: 250,
        width: 80,
        height: 60
      }, {
        x: 500,
        y: 300,
        width: 80,
        height: 60
      }, {
        x: 700,
        y: 500,
        width: 80,
        height: 60
      }];
      const entity = aiSystem.createFireEntity(400, 300);
      const flammable = aiSystem.findNearbyFlammable(400, 300, 120);
      expect(flammable.length).toBe(2); // 只有两个在范围内
    });
    test('应该计算附近的火焰数量', () => {
      aiSystem.createFireEntity(400, 300);
      aiSystem.createFireEntity(450, 320);
      aiSystem.createFireEntity(700, 500); // 远离

      const count = aiSystem.countNearbyFires(400, 300, 100);
      expect(count).toBe(2);
    });
  });

  // ===== 序列化测试 =====
  describe('序列化', () => {
    test('应该序列化火焰实体', () => {
      aiSystem.createFireEntity(100, 200, {
        mutation: 'poison'
      });
      aiSystem.createFireEntity(300, 400, {
        isBoss: true,
        bossType: 'inferno'
      });
      const data = aiSystem.serialize();
      expect(data.fireEntities).toBeDefined();
      expect(data.fireEntities.length).toBe(2);
      expect(data.fireEntities[0].mutation).toBe('poison');
      expect(data.fireEntities[1].isBoss).toBe(true);
    });
    test('应该反序列化火焰实体', () => {
      const data = {
        fireEntities: [{
          id: 'test_1',
          x: 100,
          y: 200,
          health: 100,
          maxHealth: 100,
          mutation: 'poison',
          isBoss: false,
          spreadRate: 1.0
        }],
        windDirection: {
          x: 1,
          y: 0
        },
        windStrength: 0.8
      };
      aiSystem.deserialize(data);
      expect(aiSystem.fireEntities.length).toBe(1);
      expect(aiSystem.fireEntities[0].mutation).toBe('poison');
      expect(aiSystem.windDirection.x).toBe(1);
      expect(aiSystem.windStrength).toBe(0.8);
    });
  });

  // ===== 波次生成测试 =====
  describe('波次生成', () => {
    test('应该生成波次火焰', () => {
      const initialCount = aiSystem.fireEntities.length;
      aiSystem.spawnWave(1);
      expect(aiSystem.fireEntities.length - initialCount).toBe(5); // 3 + 2
    });
    test('高波次应该有变异', () => {
      aiSystem.spawnWave(5);
      const mutations = aiSystem.fireEntities.filter(e => e.mutation);
      expect(mutations.length).toBeGreaterThan(0);
    });
    test('每 5 波应该有 Boss', () => {
      aiSystem.spawnWave(5);
      const bosses = aiSystem.fireEntities.filter(e => e.isBoss);
      expect(bosses.length).toBe(1);
    });
  });
});
