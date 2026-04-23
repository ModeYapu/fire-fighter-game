// ==================== 特殊事件系统 ====================

class SpecialEventSystem {
    constructor(game) {
        this.game = game;
        this.events = [];
        this.eventConfig = this.getEventConfig();
        this.activeEffects = [];
    }

    // 获取事件配置
    getEventConfig() {
        return {
            // 爆炸桶
            explosiveBarrel: {
                name: '爆炸桶',
                icon: '💣',
                type: 'hazard',
                spawnChance: 0.15,
                dangerLevel: 'high',
                radius: 120,
                damage: 50,
                chainReaction: true,
                description: '受热后会爆炸，波及周围建筑',
            },

            // 危险化学品
            chemical: {
                name: '危险化学品',
                icon: '☣️',
                type: 'hazard',
                spawnChance: 0.1,
                dangerLevel: 'extreme',
                toxicRadius: 150,
                explosionChance: 0.3,
                description: '泄漏后产生有毒区域',
            },

            // 燃气罐
            gasCanister: {
                name: '燃气罐',
                icon: '🔥',
                type: 'hazard',
                spawnChance: 0.2,
                dangerLevel: 'medium',
                explosionRadius: 80,
                fireSpread: true,
                description: '爆炸后会引燃周围区域',
            },

            // 救援物资箱
            supplyCrate: {
                name: '救援物资',
                icon: '📦',
                type: 'bonus',
                spawnChance: 0.1,
                reward: {
                    water: 200,
                    score: 100,
                    coins: 50,
                },
                description: '扑灭后获得奖励',
            },

            // 时间加速器
            timeBooster: {
                name: '时间加速',
                icon: '⏰',
                type: 'bonus',
                spawnChance: 0.05,
                effect: 'time_slow',
                duration: 5000,
                description: '减慢火势蔓延速度',
            },

            // 水力增强器
            waterBooster: {
                name: '水力增强',
                icon: '💪',
                type: 'bonus',
                spawnChance: 0.08,
                effect: 'water_boost',
                duration: 10000,
                powerMultiplier: 2,
                description: '水枪威力翻倍',
            },
        };
    }

    // 生成事件
    spawnEvents(buildings) {
        this.events = [];
        
        buildings.forEach(building => {
            Object.keys(this.eventConfig).forEach(eventType => {
                const config = this.eventConfig[eventType];
                if (Math.random() < config.spawnChance) {
                    const event = this.createEvent(eventType, building);
                    this.events.push(event);
                }
            });
        });
    }

    // 创建事件
    createEvent(type, building) {
        const config = this.eventConfig[type];
        return {
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            x: building.x + Math.random() * building.width,
            y: building.y - 10,
            buildingId: building.id,
            state: 'active', // active, triggered, resolved
            health: 100,
            maxHealth: 100,
            timer: 0,
            triggered: false,
            config: config,
        };
    }

    // 更新事件
    update(deltaTime) {
        this.events.forEach(event => {
            if (event.state !== 'active') return;

            const building = this.game.buildings?.find(b => b.id === event.buildingId);
            if (!building) return;

            // 危险事件在燃烧建筑中触发
            if (event.config.type === 'hazard' && building.state === 'burning') {
                event.timer += deltaTime;
                
                // 根据危险等级设置触发时间
                const triggerTime = {
                    low: 10000,
                    medium: 7000,
                    high: 5000,
                    extreme: 3000,
                }[event.config.dangerLevel] || 5000;
                
                if (event.timer >= triggerTime && !event.triggered) {
                    this.triggerEvent(event);
                }
            }

            // 奖励事件被水击中时
            if (event.config.type === 'bonus') {
                // 检查是否被水击中
                if (this.isHitByWater(event)) {
                    event.health -= 2;
                    if (event.health <= 0) {
                        this.resolveEvent(event);
                    }
                }
            }
        });

        // 更新激活效果
        this.updateActiveEffects(deltaTime);
    }

    // 触发事件
    triggerEvent(event) {
        event.triggered = true;
        event.state = 'triggered';

        switch (event.type) {
            case 'explosiveBarrel':
                this.triggerExplosion(event);
                break;
            case 'chemical':
                this.triggerChemicalLeak(event);
                break;
            case 'gasCanister':
                this.triggerGasExplosion(event);
                break;
        }

        // 显示警告消息
        this.game.showMessage(`⚠️ ${event.config.name}已触发！`, 2000);
    }

    // 爆炸事件
    triggerExplosion(event) {
        const config = event.config;
        
        // 对周围建筑造成伤害
        this.game.buildings?.forEach(building => {
            const distance = Math.sqrt(
                Math.pow(building.x + building.width / 2 - event.x, 2) +
                Math.pow(building.y + building.height / 2 - event.y, 2)
            );
            
            if (distance <= config.radius) {
                const damage = config.damage * (1 - distance / config.radius);
                building.health -= damage;
                
                // 可能引发火灾
                if (Math.random() < 0.5 && building.state !== 'burning') {
                    building.state = 'burning';
                    building.fireIntensity = 3;
                }
            }
        });

        // 连锁反应
        if (config.chainReaction) {
            this.events.forEach(otherEvent => {
                if (otherEvent.type === 'explosiveBarrel' && otherEvent.id !== event.id) {
                    const distance = Math.sqrt(
                        Math.pow(otherEvent.x - event.x, 2) +
                        Math.pow(otherEvent.y - event.y, 2)
                    );
                    if (distance <= config.radius) {
                        otherEvent.timer = otherEvent.config.dangerLevel === 'high' ? 4500 : 6500;
                    }
                }
            });
        }

        // 创建爆炸效果
        this.createExplosionEffect(event.x, event.y, config.radius);
        
        // 播放音效
        if (this.game.audio) {
            this.game.audio.play('explosion');
        }
    }

    // 化学品泄漏
    triggerChemicalLeak(event) {
        const config = event.config;
        
        // 创建有毒区域
        this.activeEffects.push({
            type: 'toxic_cloud',
            x: event.x,
            y: event.y,
            radius: config.toxicRadius,
            duration: 15000,
            elapsed: 0,
            damage: 0.5,
        });

        // 可能爆炸
        if (Math.random() < config.explosionChance) {
            this.triggerExplosion(event);
        }
    }

    // 燃气爆炸
    triggerGasExplosion(event) {
        const config = event.config;
        
        // 爆炸
        this.createExplosionEffect(event.x, event.y, config.explosionRadius);
        
        // 引燃周围区域
        if (config.fireSpread) {
            this.game.buildings?.forEach(building => {
                const distance = Math.sqrt(
                    Math.pow(building.x + building.width / 2 - event.x, 2) +
                    Math.pow(building.y + building.height / 2 - event.y, 2)
                );
                
                if (distance <= config.explosionRadius * 1.5 && building.state !== 'burning') {
                    building.state = 'burning';
                    building.fireIntensity = 2;
                }
            });
        }
    }

    // 解决事件（奖励）
    resolveEvent(event) {
        event.state = 'resolved';
        
        const config = event.config;
        
        switch (event.type) {
            case 'supplyCrate':
                if (config.reward) {
                    this.game.resourceSystem?.addWater(config.reward.water || 0);
                    this.game.addScore(config.reward.score || 0);
                    this.game.upgradeSystem?.addCoins(config.reward.coins || 0);
                    this.game.showMessage(`📦 获得物资！水+${config.reward.water} 分数+${config.reward.score} 金币+${config.reward.coins}`, 3000);
                }
                break;
                
            case 'timeBooster':
                this.activeEffects.push({
                    type: 'time_slow',
                    duration: config.duration,
                    elapsed: 0,
                    multiplier: 0.5,
                });
                this.game.showMessage('⏰ 时间减慢！火势蔓延速度降低50%', 3000);
                break;
                
            case 'waterBooster':
                this.activeEffects.push({
                    type: 'water_boost',
                    duration: config.duration,
                    elapsed: 0,
                    powerMultiplier: config.powerMultiplier,
                });
                this.game.showMessage('💪 水力增强！水枪威力翻倍', 3000);
                break;
        }

        // 播放音效
        if (this.game.audio) {
            this.game.audio.play('powerup');
        }
    }

    // 创建爆炸效果
    createExplosionEffect(x, y, radius) {
        // 添加粒子效果
        if (this.game.particleSystem) {
            for (let i = 0; i < 30; i++) {
                const angle = (Math.PI * 2 / 30) * i;
                const speed = 3 + Math.random() * 5;
                this.game.particleSystem.createParticle({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    type: 'explosion',
                    color: ['#FF4500', '#FF6347', '#FFD700'][Math.floor(Math.random() * 3)],
                    life: 60,
                    size: 5 + Math.random() * 5,
                });
            }
        }
    }

    // 更新激活效果
    updateActiveEffects(deltaTime) {
        this.activeEffects = this.activeEffects.filter(effect => {
            effect.elapsed += deltaTime;
            
            if (effect.elapsed >= effect.duration) {
                return false;
            }

            // 应用效果
            switch (effect.type) {
                case 'toxic_cloud':
                    // 有毒区域伤害
                    this.applyToxicDamage(effect, deltaTime);
                    break;
                case 'time_slow':
                    // 时间减慢效果
                    this.game.fireSystem?.setSpreadMultiplier(effect.multiplier);
                    break;
                case 'water_boost':
                    // 水力增强效果
                    this.game.waterSystem?.setPowerMultiplier(effect.powerMultiplier);
                    break;
            }

            return true;
        });

        // 清除已结束的效果
        if (!this.activeEffects.find(e => e.type === 'time_slow')) {
            this.game.fireSystem?.setSpreadMultiplier(1);
        }
        if (!this.activeEffects.find(e => e.type === 'water_boost')) {
            this.game.waterSystem?.setPowerMultiplier(1);
        }
    }

    // 应用有毒伤害
    applyToxicDamage(effect, deltaTime) {
        // 对建筑造成伤害
        this.game.buildings?.forEach(building => {
            const distance = Math.sqrt(
                Math.pow(building.x + building.width / 2 - effect.x, 2) +
                Math.pow(building.y + building.height / 2 - effect.y, 2)
            );
            
            if (distance <= effect.radius) {
                building.health -= effect.damage * deltaTime / 1000;
            }
        });

        // 对幸存者造成伤害
        this.game.rescueSystem?.survivors.forEach(survivor => {
            const distance = Math.sqrt(
                Math.pow(survivor.x - effect.x, 2) +
                Math.pow(survivor.y - effect.y, 2)
            );
            
            if (distance <= effect.radius) {
                survivor.health -= effect.damage * 2 * deltaTime / 1000;
            }
        });
    }

    // 检查是否被水击中
    isHitByWater(event) {
        if (!this.game.waterSystem) return false;
        
        // 检查水滴是否击中事件位置
        return this.game.waterSystem.droplets.some(droplet => {
            const distance = Math.sqrt(
                Math.pow(droplet.x - event.x, 2) +
                Math.pow(droplet.y - event.y, 2)
            );
            return distance < 20;
        });
    }

    // 渲染事件
    render(ctx) {
        this.events.forEach(event => {
            if (event.state === 'triggered') return;
            
            const config = event.config;
            ctx.save();
            
            // 绘制事件图标
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(config.icon, event.x, event.y);
            
            // 绘制状态指示器
            if (config.type === 'hazard' && event.timer > 0) {
                const progress = event.timer / (
                    event.config.dangerLevel === 'high' ? 5000 :
                    event.config.dangerLevel === 'extreme' ? 3000 : 7000
                );
                
                // 危险进度条
                const barWidth = 30;
                const barHeight = 4;
                
                ctx.fillStyle = '#333';
                ctx.fillRect(event.x - barWidth / 2, event.y + 10, barWidth, barHeight);
                
                ctx.fillStyle = progress > 0.7 ? '#e74c3c' : '#f39c12';
                ctx.fillRect(event.x - barWidth / 2, event.y + 10, barWidth * progress, barHeight);
                
                // 警告标识
                if (progress > 0.5) {
                    ctx.fillStyle = '#FF0000';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText('⚠️', event.x, event.y - 20);
                }
            }
            
            // 绘制奖励事件血条
            if (config.type === 'bonus') {
                const barWidth = 30;
                const barHeight = 4;
                const healthPercent = event.health / event.maxHealth;
                
                ctx.fillStyle = '#333';
                ctx.fillRect(event.x - barWidth / 2, event.y + 10, barWidth, barHeight);
                
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(event.x - barWidth / 2, event.y + 10, barWidth * healthPercent, barHeight);
            }
            
            ctx.restore();
        });

        // 渲染激活效果
        this.renderActiveEffects(ctx);
    }

    // 渲染激活效果
    renderActiveEffects(ctx) {
        this.activeEffects.forEach(effect => {
            ctx.save();
            
            switch (effect.type) {
                case 'toxic_cloud':
                    // 有毒云团
                    const alpha = 0.3 * (1 - effect.elapsed / effect.duration);
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = '#00FF00';
                    ctx.beginPath();
                    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // 毒气标识
                    ctx.globalAlpha = 0.8;
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('☣️', effect.x, effect.y);
                    break;
                    
                case 'time_slow':
                case 'water_boost':
                    // 效果持续时间条
                    const progress = 1 - effect.elapsed / effect.duration;
                    const barWidth = 60;
                    const barHeight = 6;
                    
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(400 - barWidth / 2, 10, barWidth, barHeight);
                    
                    ctx.fillStyle = effect.type === 'time_slow' ? '#3498db' : '#e74c3c';
                    ctx.fillRect(400 - barWidth / 2, 10, barWidth * progress, barHeight);
                    
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        effect.type === 'time_slow' ? '⏰ 时间减慢' : '💪 水力增强',
                        400,
                        30
                    );
                    break;
            }
            
            ctx.restore();
        });
    }

    // 重置
    reset() {
        this.events = [];
        this.activeEffects = [];
    }

    // 获取统计信息
    getStats() {
        return {
            total: this.events.length,
            hazards: this.events.filter(e => e.config.type === 'hazard').length,
            bonuses: this.events.filter(e => e.config.type === 'bonus').length,
            triggered: this.events.filter(e => e.triggered).length,
            resolved: this.events.filter(e => e.state === 'resolved').length,
        };
    }
}

export { SpecialEventSystem };
