/**
 * 火焰 AI 系统 (Fire Enemy AI System)
 * 策略性火焰蔓延、Boss 级大火、火焰变异、AI 行为可视化
 */
export class FireAISystem {
    constructor(game) {
        this.game = game;
        this.fireEntities = [];
        this.bossFires = [];
        this.windDirection = { x: 1, y: 0 }; // 风向
        this.windStrength = 0.5;
        this.mutatedFires = []; // 变异火焰

        // AI 决策间隔
        this.aiTickInterval = 2000; // ms
        this.lastAiTick = 0;

        // 蔓延路径可视化
        this.spreadPaths = [];
        this.showAIVisualization = true;

        // 火焰变异类型
        this.mutationTypes = {
            poison: {
                name: '毒火',
                icon: '☠️',
                color: '#9b59b6',
                description: '释放有毒烟雾，消防员靠近持续受伤',
                spreadRate: 0.8,
                health: 150,
                weakness: 'foam', // 需要泡沫灭火器
                particleColor: 'rgba(155, 89, 182, ',
                damageType: 'poison',
                requiredAgent: 'foam',
            },
            electric: {
                name: '电火',
                icon: '⚡',
                color: '#f1c40f',
                description: '带电火焰，水会导电造成伤害',
                spreadRate: 1.2,
                health: 120,
                weakness: 'powder', // 需要干粉灭火器
                particleColor: 'rgba(241, 196, 15, ',
                damageType: 'electric',
                requiredAgent: 'powder',
            },
            oil: {
                name: '油火',
                icon: '🛢️',
                color: '#2c3e50',
                description: '油类火灾，用水灭火会爆炸扩散',
                spreadRate: 1.5,
                health: 200,
                weakness: 'foam',
                particleColor: 'rgba(44, 62, 80, ',
                damageType: 'explosion',
                requiredAgent: 'foam',
            },
        };

        // Boss 火焰类型
        this.bossTypes = {
            inferno: {
                name: '炼狱之主',
                icon: '👹',
                color: '#e74c3c',
                size: 80,
                health: 500,
                phases: [
                    { name: '狂暴', spreadRate: 2.0, attacks: ['fireball', 'spread'] },
                    { name: '愤怒', spreadRate: 1.5, attacks: ['fireball', 'spread', 'summon'] },
                    { name: '虚弱', spreadRate: 0.8, attacks: ['fireball'] },
                ],
                rewards: { score: 500, unlockBoss: true },
            },
            phoenix: {
                name: '不死鸟',
                icon: '🔥',
                color: '#e67e22',
                size: 70,
                health: 400,
                phases: [
                    { name: '涅槃', spreadRate: 1.8, attacks: ['fireball', 'regenerate'] },
                    { name: '复苏', spreadRate: 1.2, attacks: ['fireball', 'spread'] },
                    { name: '熄灭', spreadRate: 0.5, attacks: [] },
                ],
                rewards: { score: 400, unlockBoss: true },
                canRegenerate: true,
                regenCount: 0,
                maxRegen: 2,
            },
        };

        // AI 行为可视化数据
        this.visualization = {
            plannedSpread: [],
            threatZones: [],
            behaviorLabels: [],
            debugLog: [],
        };

        this.eventListeners = [];
    }

    // ===== 初始化 =====
    init() {
        this.setupEventListeners();
        this.addDebugLog('🔥 火焰 AI 系统已初始化');
    }

    setupEventListeners() {
        // 监听风向变化
        if (this.game.weatherSystem) {
            const origUpdate = this.game.weatherSystem.update?.bind(this.game.weatherSystem);
            if (origUpdate) {
                this.game.weatherSystem.update = (...args) => {
                    origUpdate(...args);
                    this.syncWindFromWeather();
                };
            }
        }
    }

    syncWindFromWeather() {
        if (this.game.weatherSystem) {
            const ws = this.game.weatherSystem;
            if (ws.windDirection) {
                this.windDirection = { ...ws.windDirection };
            }
            if (ws.windStrength !== undefined) {
                this.windStrength = ws.windStrength;
            }
        }
    }

    // ===== 火焰实体管理 =====
    createFireEntity(x, y, options = {}) {
        const entity = {
            id: `fire_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            x,
            y,
            health: options.health || 100,
            maxHealth: options.health || 100,
            spreadRate: options.spreadRate || 1.0,
            size: options.size || 30,
            mutation: options.mutation || null,
            isBoss: options.isBoss || false,
            bossType: options.bossType || null,
            bossPhase: 0,
            lastSpreadTime: 0,
            spreadCooldown: options.spreadCooldown || 3000,
            // AI 属性
            ai: {
                behavior: 'spread', // spread, hunt, defend, retreat
                target: null,
                pathHistory: [],
                decisionCooldown: 0,
                strategy: 'aggressive', // aggressive, cautious, flanking
            },
            // 可视化
            visualization: {
                showPath: true,
                plannedMoves: [],
                threatRadius: 60,
            },
            // 状态
            alive: true,
            burningIntensity: 1.0,
            flickerTimer: 0,
            particles: [],
        };

        // 应用变异
        if (options.mutation && this.mutationTypes[options.mutation]) {
            const mut = this.mutationTypes[options.mutation];
            entity.health = mut.health;
            entity.maxHealth = mut.health;
            entity.spreadRate = mut.spreadRate;
            entity.mutationData = mut;
            this.addDebugLog(`☣️ 变异火焰生成: ${mut.name} 在 (${Math.round(x)}, ${Math.round(y)})`);
        }

        this.fireEntities.push(entity);

        // Boss 特殊处理
        if (options.isBoss && options.bossType) {
            this.initBossFire(entity, options.bossType);
        }

        return entity;
    }

    // ===== Boss 火焰 =====
    initBossFire(entity, bossType) {
        const bossData = this.bossTypes[bossType];
        if (!bossData) return;

        entity.isBoss = true;
        entity.bossType = bossType;
        entity.bossData = { ...bossData };
        entity.health = bossData.health;
        entity.maxHealth = bossData.health;
        entity.size = bossData.size;
        entity.spreadCooldown = 2000;

        // Boss 专属 AI
        entity.ai.strategy = 'boss';
        entity.ai.bossPhaseIndex = 0;
        entity.ai.specialAttackCooldown = 0;

        // 不死鸟特殊
        if (bossType === 'phoenix') {
            entity.bossData.regenCount = 0;
            entity.bossData.maxRegen = 2;
        }

        this.bossFires.push(entity);
        this.addDebugLog(`👹 Boss 火焰生成: ${bossData.name} (HP: ${bossData.health})`);

        // 触发 Boss 出现事件
        if (this.game.onBossSpawn) {
            this.game.onBossSpawn(entity);
        }
    }

    updateBossAI(entity, dt) {
        if (!entity.isBoss || !entity.alive) return;

        const bossData = entity.bossData;
        const healthPercent = entity.health / entity.maxHealth;

        // 阶段切换
        let phaseIndex;
        if (healthPercent > 0.66) phaseIndex = 0;
        else if (healthPercent > 0.33) phaseIndex = 1;
        else phaseIndex = 2;

        if (phaseIndex !== entity.ai.bossPhaseIndex) {
            entity.ai.bossPhaseIndex = phaseIndex;
            this.addDebugLog(`👹 ${bossData.name} 进入阶段: ${bossData.phases[phaseIndex].name}`);
            if (this.game.onBossPhaseChange) {
                this.game.onBossPhaseChange(entity, phaseIndex);
            }
        }

        const phase = bossData.phases[phaseIndex];
        entity.spreadRate = phase.spreadRate;

        // 特殊攻击
        entity.ai.specialAttackCooldown -= dt;
        if (entity.ai.specialAttackCooldown <= 0) {
            const attack = this.selectBossAttack(phase.attacks);
            if (attack) {
                this.executeBossAttack(entity, attack);
            }
            entity.ai.specialAttackCooldown = 4000 + Math.random() * 3000;
        }

        // 不死鸟再生
        if (bossData.canRegenerate && entity.health <= 0 && bossData.regenCount < bossData.maxRegen) {
            bossData.regenCount++;
            entity.health = entity.maxHealth * 0.5;
            entity.alive = true;
            this.addDebugLog(`🔥 不死鸟涅槃！再生次数: ${bossData.regenCount}/${bossData.maxRegen}`);
            if (this.game.onBossRegenerate) {
                this.game.onBossRegenerate(entity);
            }
        }
    }

    selectBossAttack(availableAttacks) {
        if (!availableAttacks || availableAttacks.length === 0) return null;
        return availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
    }

    executeBossAttack(entity, attackType) {
        switch (attackType) {
            case 'fireball':
                this.bossFireballAttack(entity);
                break;
            case 'spread':
                this.bossSpreadAttack(entity);
                break;
            case 'summon':
                this.bossSummonMinions(entity);
                break;
            case 'regenerate':
                // 不死鸟被动处理
                break;
        }
    }

    bossFireballAttack(boss) {
        // 向随机方向发射火球
        const targets = this.findNearbyFlammable(boss.x, boss.y, 200);
        if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            this.addDebugLog(`🔥 Boss 发射火球 → (${Math.round(target.x)}, ${Math.round(target.y)})`);
            // 创建小火焰在目标位置
            this.createFireEntity(target.x, target.y, {
                health: 50,
                size: 20,
                spreadRate: 0.8,
                spreadCooldown: 4000,
            });
        }
    }

    bossSpreadAttack(boss) {
        // 八方向蔓延
        this.addDebugLog(`🌊 Boss 大范围蔓延！`);
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const dist = 60 + Math.random() * 40;
            const nx = boss.x + Math.cos(angle) * dist;
            const ny = boss.y + Math.sin(angle) * dist;
            this.createFireEntity(nx, ny, {
                health: 40,
                size: 18,
                spreadCooldown: 5000,
            });
        }
    }

    bossSummonMinions(boss) {
        // 召唤变异小火焰
        this.addDebugLog(`👾 Boss 召唤变异仆从！`);
        const mutationKeys = Object.keys(this.mutationTypes);
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 40;
            const nx = boss.x + Math.cos(angle) * dist;
            const ny = boss.y + Math.sin(angle) * dist;
            this.createFireEntity(nx, ny, {
                health: 60,
                size: 22,
                mutation: mutationKeys[Math.floor(Math.random() * mutationKeys.length)],
                spreadCooldown: 4000,
            });
        }
    }

    // ===== 普通火焰 AI =====
    updateFireAI(entity, dt, now) {
        if (!entity.alive) return;

        // 闪烁效果
        entity.flickerTimer += dt;
        entity.burningIntensity = 0.8 + Math.sin(entity.flickerTimer * 0.005) * 0.2;

        // AI 决策冷却
        entity.ai.decisionCooldown -= dt;
        if (entity.ai.decisionCooldown <= 0) {
            this.makeAIDecision(entity, now);
            entity.ai.decisionCooldown = this.aiTickInterval * (0.8 + Math.random() * 0.4);
        }

        // 蔓延
        entity.lastSpreadTime += dt;
        if (entity.lastSpreadTime >= entity.spreadCooldown / entity.spreadRate) {
            this.trySpread(entity, now);
            entity.lastSpreadTime = 0;
        }

        // 更新路径历史
        entity.ai.pathHistory.push({ x: entity.x, y: entity.y, t: Date.now() });
        if (entity.ai.pathHistory.length > 20) entity.ai.pathHistory.shift();

        // 更新可视化
        this.updateVisualization(entity);

        // 变异特效
        if (entity.mutation) {
            this.updateMutationEffects(entity, dt);
        }
    }

    makeAIDecision(entity, now) {
        // 策略选择
        const nearbyFlammable = this.findNearbyFlammable(entity.x, entity.y, 120);
        const nearbyFires = this.countNearbyFires(entity.x, entity.y, 150);
        const playerDist = this.distanceToPlayer(entity);

        if (playerDist < 80) {
            // 玩家靠近 - 防御或逃跑
            entity.ai.behavior = Math.random() > 0.5 ? 'defend' : 'retreat';
            entity.ai.strategy = 'defensive';
        } else if (nearbyFlammable.length > 3) {
            // 很多可燃物 - 积极蔓延
            entity.ai.behavior = 'spread';
            entity.ai.strategy = 'aggressive';
        } else if (nearbyFires < 2) {
            // 孤立 - 寻找目标
            entity.ai.behavior = 'hunt';
            entity.ai.strategy = 'flanking';
        } else {
            entity.ai.behavior = 'spread';
        }

        // 计算蔓延计划
        this.calculateSpreadPlan(entity);
    }

    calculateSpreadPlan(entity) {
        entity.visualization.plannedMoves = [];
        const spreadDirections = this.getWeightedSpreadDirections(entity);

        for (const dir of spreadDirections.slice(0, 3)) {
            const targetX = entity.x + dir.dx * 60;
            const targetY = entity.y + dir.dy * 60;
            entity.visualization.plannedMoves.push({
                x: targetX,
                y: targetY,
                weight: dir.weight,
                reason: dir.reason,
            });
        }
    }

    getWeightedSpreadDirections(entity) {
        const directions = [];
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            let weight = 1.0;
            let reason = '随机蔓延';

            // 顺风加成
            const windDot = dx * this.windDirection.x + dy * this.windDirection.y;
            weight += windDot * this.windStrength * 2;
            if (windDot > 0.3) reason = '顺风蔓延';

            // 寻找易燃物
            const nx = entity.x + dx * 80;
            const ny = entity.y + dy * 80;
            const flammable = this.findNearbyFlammable(nx, ny, 50);
            if (flammable.length > 0) {
                weight += 1.5;
                reason = '寻找易燃物';
            }

            // 避开水源/已灭火区域
            if (this.isWaterZone(nx, ny)) {
                weight *= 0.2;
                reason = '避开水源';
            }

            // 远离其他火焰（避免重叠）
            const nearbyFires = this.countNearbyFires(nx, ny, 40);
            if (nearbyFires > 2) {
                weight *= 0.5;
                reason = '避免拥挤';
            }

            // 向玩家方向（攻击性）
            if (entity.ai.strategy === 'aggressive') {
                const playerDir = this.getDirectionToPlayer(entity);
                const playerDot = dx * playerDir.x + dy * playerDir.y;
                weight += playerDot * 0.5;
                if (playerDot > 0.3) reason = '追击玩家';
            }

            directions.push({ dx, dy, weight: Math.max(0.1, weight), reason });
        }

        return directions.sort((a, b) => b.weight - a.weight);
    }

    trySpread(entity, now) {
        const directions = this.getWeightedSpreadDirections(entity);
        const bestDir = directions[0];

        if (bestDir && bestDir.weight > 1.0 && Math.random() < 0.6) {
            const spreadDist = 50 + Math.random() * 30;
            const nx = entity.x + bestDir.dx * spreadDist;
            const ny = entity.y + bestDir.dy * spreadDist;

            // 边界检查
            if (this.isValidPosition(nx, ny)) {
                const newFire = this.createFireEntity(nx, ny, {
                    health: entity.health * 0.5,
                    size: entity.size * 0.8,
                    spreadRate: entity.spreadRate * 0.9,
                    mutation: entity.mutation, // 变异可遗传
                    spreadCooldown: entity.spreadCooldown * 1.2,
                });

                this.addDebugLog(`🔥 蔓延: ${bestDir.reason} → (${Math.round(nx)}, ${Math.round(ny)})`);
            }
        }
    }

    // ===== 变异特效 =====
    updateMutationEffects(entity, dt) {
        if (!entity.mutationData) return;

        switch (entity.mutationData.damageType) {
            case 'poison':
                // 毒火持续释放烟雾
                this.emitPoisonSmoke(entity);
                break;
            case 'electric':
                // 电火偶尔放电
                if (Math.random() < 0.02) {
                    this.electricDischarge(entity);
                }
                break;
            case 'explosion':
                // 油火偶尔溅射
                if (Math.random() < 0.01) {
                    this.oilSplash(entity);
                }
                break;
        }
    }

    emitPoisonSmoke(entity) {
        // 添加毒雾粒子到可视化
        entity.particles.push({
            type: 'poison_smoke',
            x: entity.x + (Math.random() - 0.5) * entity.size,
            y: entity.y + (Math.random() - 0.5) * entity.size,
            life: 2000,
            maxLife: 2000,
            radius: 15 + Math.random() * 10,
            alpha: 0.3,
        });
    }

    electricDischarge(entity) {
        const targets = this.findNearbyFlammable(entity.x, entity.y, 100);
        if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            this.addDebugLog(`⚡ 电火放电 → (${Math.round(target.x)}, ${Math.round(target.y)})`);
            this.createFireEntity(target.x, target.y, { health: 30, size: 15 });
        }
    }

    oilSplash(entity) {
        this.addDebugLog(`🛢️ 油火溅射！`);
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 30;
            this.createFireEntity(
                entity.x + Math.cos(angle) * dist,
                entity.y + Math.sin(angle) * dist,
                { health: 20, size: 12, mutation: 'oil' }
            );
        }
    }

    // ===== 灭火处理 =====
    extinguishFire(entity, agent = 'water') {
        if (!entity.alive) return;

        // 检查是否使用了正确的灭火剂
        if (entity.mutationData) {
            if (entity.mutationData.requiredAgent !== agent) {
                // 错误的灭火剂 - 可能造成负面效果
                this.wrongAgentEffect(entity, agent);
                return false;
            }
        }

        entity.health -= this.getExtinguishDamage(agent);

        if (entity.health <= 0) {
            entity.alive = false;
            this.addDebugLog(`✅ 火焰已熄灭: ${entity.id}`);

            // Boss 死亡
            if (entity.isBoss) {
                this.onBossDefeated(entity);
            }

            // 清除
            this.fireEntities = this.fireEntities.filter(f => f.alive);
            this.bossFires = this.bossFires.filter(f => f.alive);
            return true;
        }

        return false;
    }

    getExtinguishDamage(agent) {
        const damages = {
            water: 30,
            foam: 25,
            powder: 20,
        };
        return damages[agent] || 25;
    }

    wrongAgentEffect(entity, agent) {
        if (agent === 'water') {
            if (entity.mutationData?.damageType === 'electric') {
                // 水导电 - 玩家受伤
                this.addDebugLog(`⚡ 水导电！电火对玩家造成伤害`);
                if (this.game.onPlayerDamage) {
                    this.game.onPlayerDamage(20, 'electric_shock');
                }
            }
            if (entity.mutationData?.damageType === 'explosion') {
                // 水遇到油火 - 爆炸
                this.addDebugLog(`💥 水遇到油火爆炸！`);
                this.oilSplash(entity);
                this.oilSplash(entity);
            }
        }
    }

    onBossDefeated(boss) {
        const bossData = boss.bossData;
        this.addDebugLog(`🎉 Boss 已击败: ${bossData.name}！`);

        // 不死鸟再生检查
        if (bossData.canRegenerate && bossData.regenCount < bossData.maxRegen) {
            return; // 会在 updateBossAI 中处理再生
        }

        // 奖励
        if (this.game.addScore) {
            this.game.addScore(bossData.rewards.score);
        }

        if (this.game.onBossDefeated) {
            this.game.onBossDefeated(boss);
        }
    }

    // ===== 可视化系统 =====
    updateVisualization(entity) {
        if (!this.showAIVisualization) return;

        // 更新威胁区域
        this.visualization.threatZones = this.visualization.threatZones.filter(
            z => z.entityId !== entity.id
        );

        this.visualization.threatZones.push({
            entityId: entity.id,
            x: entity.x,
            y: entity.y,
            radius: entity.visualization.threatRadius,
            behavior: entity.ai.behavior,
            strategy: entity.ai.strategy,
        });
    }

    renderVisualization(ctx) {
        if (!this.showAIVisualization) return;

        for (const entity of this.fireEntities) {
            if (!entity.alive) continue;

            // 威胁区域
            ctx.save();
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, entity.visualization.threatRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 100, 50, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.restore();

            // 计划蔓延路径
            for (const move of entity.visualization.plannedMoves) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(entity.x, entity.y);
                ctx.lineTo(move.x, move.y);
                ctx.strokeStyle = `rgba(255, 150, 50, ${Math.min(0.6, move.weight * 0.2)})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 3]);
                ctx.stroke();

                // 目标点
                ctx.beginPath();
                ctx.arc(move.x, move.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 100, 50, 0.6)';
                ctx.fill();
                ctx.restore();
            }

            // 行为标签
            const label = this.getBehaviorLabel(entity);
            if (label) {
                ctx.save();
                ctx.font = '10px monospace';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.textAlign = 'center';
                ctx.fillText(label, entity.x, entity.y - entity.size - 8);
                ctx.restore();
            }

            // 变异标识
            if (entity.mutationData) {
                ctx.save();
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(entity.mutationData.icon, entity.x, entity.y - entity.size - 20);
                ctx.restore();
            }

            // Boss 血条
            if (entity.isBoss && entity.bossData) {
                this.renderBossHealthBar(ctx, entity);
            }
        }

        // 调试日志
        this.renderDebugLog(ctx);
    }

    getBehaviorLabel(entity) {
        const labels = {
            spread: '蔓延',
            hunt: '追踪',
            defend: '防御',
            retreat: '撤退',
        };
        const behavior = labels[entity.ai.behavior] || '';
        const strategy = entity.ai.strategy === 'aggressive' ? '⚠️' : 
                        entity.ai.strategy === 'defensive' ? '🛡️' : 
                        entity.ai.strategy === 'flanking' ? '↗️' : '';
        return `${strategy}${behavior}`;
    }

    renderBossHealthBar(ctx, entity) {
        const barWidth = 120;
        const barHeight = 8;
        const x = entity.x - barWidth / 2;
        const y = entity.y - entity.size - 35;
        const healthPercent = entity.health / entity.maxHealth;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        // 血条
        const color = healthPercent > 0.5 ? '#e74c3c' : healthPercent > 0.25 ? '#e67e22' : '#f39c12';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

        // Boss 名称
        ctx.save();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`${entity.bossData.icon} ${entity.bossData.name}`, entity.x, y - 6);

        // 阶段
        const phase = entity.bossData.phases[entity.ai.bossPhaseIndex];
        if (phase) {
            ctx.font = '9px sans-serif';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(`[${phase.name}]`, entity.x, y + barHeight + 12);
        }
        ctx.restore();
    }

    renderDebugLog(ctx) {
        const logs = this.visualization.debugLog.slice(-5);
        ctx.save();
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        logs.forEach((log, i) => {
            ctx.fillText(log.text, 10, 20 + i * 14);
        });
        ctx.restore();
    }

    addDebugLog(text) {
        this.visualization.debugLog.push({
            text,
            time: Date.now(),
        });
        // 限制日志长度
        if (this.visualization.debugLog.length > 50) {
            this.visualization.debugLog.shift();
        }
    }

    // ===== 渲染火焰 =====
    render(ctx) {
        for (const entity of this.fireEntities) {
            if (!entity.alive) continue;
            this.renderFireEntity(ctx, entity);
        }

        // AI 可视化层
        this.renderVisualization(ctx);
    }

    renderFireEntity(ctx, entity) {
        const { x, y, size, burningIntensity, mutation, mutationData, particles } = entity;
        const baseColor = mutationData ? mutationData.color : '#ff4500';
        const alpha = burningIntensity;

        ctx.save();

        // 光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
        gradient.addColorStop(0, `rgba(255, 200, 50, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 20, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // 火焰主体
        ctx.fillStyle = baseColor;
        ctx.globalAlpha = alpha;
        for (let i = 0; i < 5; i++) {
            const flickerX = x + (Math.random() - 0.5) * size * 0.4;
            const flickerY = y - Math.random() * size * 0.3;
            const flameSize = size * (0.3 + Math.random() * 0.4);
            ctx.beginPath();
            ctx.arc(flickerX, flickerY, flameSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // 变异粒子
        for (const p of particles) {
            const pAlpha = (p.life / p.maxLife) * p.alpha;
            ctx.globalAlpha = pAlpha;
            ctx.fillStyle = mutationData ? mutationData.particleColor + pAlpha + ')' : 'rgba(200, 200, 200, ' + pAlpha + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * (1 - p.life / p.maxLife), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // ===== 工具方法 =====
    findNearbyFlammable(x, y, radius) {
        const results = [];
        // 检查游戏中的可燃物（建筑物等）
        if (this.game.buildings) {
            for (const b of this.game.buildings) {
                const dist = Math.hypot(b.x - x, b.y - y);
                if (dist < radius && !b.destroyed) {
                    results.push(b);
                }
            }
        }
        return results;
    }

    countNearbyFires(x, y, radius) {
        return this.fireEntities.filter(f => {
            if (!f.alive) return false;
            return Math.hypot(f.x - x, f.y - y) < radius;
        }).length;
    }

    distanceToPlayer(entity) {
        if (!this.game.player) return Infinity;
        return Math.hypot(entity.x - this.game.player.x, entity.y - this.game.player.y);
    }

    getDirectionToPlayer(entity) {
        if (!this.game.player) return { x: 0, y: 0 };
        const dx = this.game.player.x - entity.x;
        const dy = this.game.player.y - entity.y;
        const dist = Math.hypot(dx, dy) || 1;
        return { x: dx / dist, y: dy / dist };
    }

    isWaterZone(x, y) {
        // 检查是否是水源/已灭火区域
        if (this.game.waterZones) {
            return this.game.waterZones.some(z =>
                Math.hypot(z.x - x, z.y - y) < z.radius
            );
        }
        return false;
    }

    isValidPosition(x, y) {
        const canvas = this.game.canvas;
        if (!canvas) return true;
        return x > 0 && x < canvas.width && y > 0 && y < canvas.height;
    }

    // ===== 主更新循环 =====
    update(dt) {
        const now = Date.now();

        // 同步风向
        this.syncWindFromWeather();

        // 更新所有火焰实体
        for (const entity of this.fireEntities) {
            if (!entity.alive) continue;

            // 更新粒子
            entity.particles = entity.particles.filter(p => {
                p.life -= dt;
                p.y -= 0.3; // 粒子上浮
                return p.life > 0;
            });

            this.updateFireAI(entity, dt, now);
        }

        // 更新 Boss
        for (const boss of this.bossFires) {
            if (boss.alive) {
                this.updateBossAI(boss, dt);
            }
        }

        // 清理死亡实体
        this.fireEntities = this.fireEntities.filter(f => f.alive);
        this.bossFires = this.bossFires.filter(f => f.alive);

        // 清理过期可视化
        this.visualization.threatZones = this.visualization.threatZones.filter(z => {
            return this.fireEntities.some(f => f.id === z.entityId);
        });
    }

    // ===== 生成波次 =====
    spawnWave(waveNumber) {
        const baseCount = 3 + waveNumber * 2;
        const hasMutation = waveNumber >= 3;
        const hasBoss = waveNumber % 5 === 0 && waveNumber > 0;

        const canvas = this.game.canvas;
        const margin = 50;

        for (let i = 0; i < baseCount; i++) {
            const x = margin + Math.random() * ((canvas?.width || 800) - margin * 2);
            const y = margin + Math.random() * ((canvas?.height || 600) - margin * 2);

            const options = {
                health: 80 + waveNumber * 10,
                size: 25 + Math.random() * 10,
                spreadRate: 0.8 + waveNumber * 0.1,
                spreadCooldown: Math.max(1500, 4000 - waveNumber * 200),
            };

            // 变异概率
            if (hasMutation && Math.random() < 0.3) {
                const mutations = Object.keys(this.mutationTypes);
                options.mutation = mutations[Math.floor(Math.random() * mutations.length)];
            }

            this.createFireEntity(x, y, options);
        }

        // Boss
        if (hasBoss) {
            const bossTypes = Object.keys(this.bossTypes);
            const selectedBoss = bossTypes[Math.floor(Math.random() * bossTypes.length)];
            const x = (canvas?.width || 800) / 2;
            const y = (canvas?.height || 600) / 2;
            this.createFireEntity(x, y, {
                isBoss: true,
                bossType: selectedBoss,
            });
        }

        this.addDebugLog(`🌊 第 ${waveNumber} 波火焰生成: ${baseCount} 个${hasBoss ? ' + Boss' : ''}`);
    }

    // ===== 序列化 =====
    serialize() {
        return {
            fireEntities: this.fireEntities.map(f => ({
                id: f.id,
                x: f.x,
                y: f.y,
                health: f.health,
                maxHealth: f.maxHealth,
                mutation: f.mutation,
                isBoss: f.isBoss,
                bossType: f.bossType,
                spreadRate: f.spreadRate,
            })),
            bossFires: this.bossFires.map(b => b.id),
            windDirection: this.windDirection,
            windStrength: this.windStrength,
        };
    }

    deserialize(data) {
        this.fireEntities = [];
        this.bossFires = [];

        if (data.windDirection) this.windDirection = data.windDirection;
        if (data.windStrength) this.windStrength = data.windStrength;

        for (const f of data.fireEntities || []) {
            const entity = this.createFireEntity(f.x, f.y, {
                health: f.health,
                mutation: f.mutation,
                isBoss: f.isBoss,
                bossType: f.bossType,
                spreadRate: f.spreadRate,
            });
            entity.maxHealth = f.maxHealth;
        }
    }

    toggleVisualization() {
        this.showAIVisualization = !this.showAIVisualization;
        return this.showAIVisualization;
    }
}
