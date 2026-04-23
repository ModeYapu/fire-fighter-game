// ==================== 道具系统 ====================

class PowerUpSystem {
    constructor(game) {
        this.game = game;
        this.activePowerups = [];
        this.inventory = {};
        this.spawnTimer = 0;
        this.spawnInterval = 15000; // 15秒生成一个道具
        this.usedPowerupTypes = new Set();
        
        this.initInventory();
    }

    initInventory() {
        // 初始化道具库存
        Object.keys(POWERUP_TYPES).forEach(type => {
            this.inventory[type] = 0;
        });
    }

    update(deltaTime) {
        // 更新活跃的道具效果
        this.activePowerups = this.activePowerups.filter(powerup => {
            powerup.remainingTime -= deltaTime * 1000;
            
            if (powerup.remainingTime <= 0) {
                this.deactivatePowerup(powerup);
                return false;
            }
            
            return true;
        });

        // 随机生成道具
        this.spawnTimer += deltaTime * 1000;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnRandomPowerup();
            this.spawnTimer = 0;
        }

        // 更新道具效果
        this.activePowerups.forEach(powerup => {
            this.applyPowerupEffect(powerup);
        });
    }

    spawnRandomPowerup() {
        const types = Object.keys(POWERUP_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // 在随机位置生成道具
        const x = 100 + Math.random() * (GAME_CONFIG.CANVAS_WIDTH - 200);
        const y = 100 + Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - 200);
        
        const powerup = {
            type: randomType,
            x: x,
            y: y,
            config: POWERUP_TYPES[randomType],
            collected: false,
            spawnTime: Date.now(),
            lifetime: 10000, // 10秒后消失
        };

        // 添加到游戏中的可收集道具列表
        if (!this.game.collectiblePowerups) {
            this.game.collectiblePowerups = [];
        }
        this.game.collectiblePowerups.push(powerup);
    }

    collectPowerup(powerup) {
        if (powerup.collected) return;
        
        powerup.collected = true;
        this.inventory[powerup.type]++;
        
        // 播放拾取音效
        // this.game.audioSystem?.play('collect');
        
        // 显示提示
        console.log(`拾取道具: ${powerup.config.icon} ${powerup.config.name}`);
    }

    usePowerup(type) {
        if (this.inventory[type] <= 0) {
            console.log('道具数量不足');
            return false;
        }

        const config = POWERUP_TYPES[type];
        if (!config) {
            console.log('无效的道具类型');
            return false;
        }

        // 消耗道具
        this.inventory[type]--;
        
        // 记录使用的道具类型（用于成就）
        this.usedPowerupTypes.add(type);

        // 根据道具类型应用效果
        switch (type) {
            case 'HELICOPTER':
                this.activateHelicopter(config);
                break;
            case 'FOAM_BOMB':
                this.activateFoamBomb(config);
                break;
            case 'SMOKE_GRENADE':
                this.activateSmokeGrenade(config);
                break;
            case 'FREEZE_GUN':
                this.activateFreezeGun(config);
                break;
            case 'BUCKET_CHAIN':
                this.activateBucketChain(config);
                break;
        }

        return true;
    }

    activateHelicopter(config) {
        this.activePowerups.push({
            type: 'HELICOPTER',
            config: config,
            remainingTime: config.duration,
            startTime: Date.now(),
        });
        
        // 直升机效果：每帧灭火
        console.log('🚁 直升机已激活！');
    }

    activateFoamBomb(config) {
        // 在水枪位置爆炸
        const x = this.game.waterCannon?.x || GAME_CONFIG.CANVAS_WIDTH / 2;
        const y = this.game.waterCannon?.y || GAME_CONFIG.CANVAS_HEIGHT - 50;
        
        // 灭绝范围内的所有火焰
        this.game.fires.forEach(fire => {
            const distance = Math.sqrt(
                Math.pow(fire.x - x, 2) + Math.pow(fire.y - y, 2)
            );
            
            if (distance <= config.radius) {
                fire.intensity = 0;
                fire.extinguished = true;
            }
        });

        // 添加爆炸特效
        this.game.particles.push({
            type: 'explosion',
            x: x,
            y: y,
            radius: config.radius,
            lifetime: 1000,
            startTime: Date.now(),
        });

        console.log('💣 泡沫弹爆炸！');
    }

    activateSmokeGrenade(config) {
        this.activePowerups.push({
            type: 'SMOKE_GRENADE',
            config: config,
            remainingTime: config.duration,
            slowFactor: config.slowFactor,
            startTime: Date.now(),
        });
        
        console.log('💨 烟雾弹已激活！');
    }

    activateFreezeGun(config) {
        this.activePowerups.push({
            type: 'FREEZE_GUN',
            config: config,
            remainingTime: config.duration,
            startTime: Date.now(),
        });
        
        // 冻结所有火焰
        this.game.fires.forEach(fire => {
            fire.frozen = true;
            fire.frozenUntil = Date.now() + config.duration;
        });
        
        console.log('❄️ 冰冻枪已激活！');
    }

    activateBucketChain(config) {
        this.activePowerups.push({
            type: 'BUCKET_CHAIN',
            config: config,
            remainingTime: config.duration,
            refillMultiplier: config.refillMultiplier,
            startTime: Date.now(),
        });
        
        console.log('🪣 水桶链已激活！');
    }

    applyPowerupEffect(powerup) {
        switch (powerup.type) {
            case 'HELICOPTER':
                // 直升机自动灭火
                this.game.fires.forEach(fire => {
                    if (!fire.extinguished) {
                        fire.intensity -= 0.1; // 每帧减少强度
                        if (fire.intensity <= 0) {
                            fire.extinguished = true;
                        }
                    }
                });
                break;
                
            case 'SMOKE_GRENADE':
                // 烟雾弹减缓火势蔓延（在fire.js中实现）
                break;
                
            case 'FREEZE_GUN':
                // 冰冻枪保持火焰冻结
                this.game.fires.forEach(fire => {
                    fire.frozen = true;
                });
                break;
                
            case 'BUCKET_CHAIN':
                // 水桶链加速回水
                this.game.water += RESOURCE_CONFIG.REFILL_RATE * 
                    (powerup.refillMultiplier - 1) * (1/60);
                break;
        }
    }

    deactivatePowerup(powerup) {
        console.log(`道具效果结束: ${powerup.config.icon} ${powerup.config.name}`);
        
        // 清除特殊效果
        if (powerup.type === 'FREEZE_GUN') {
            this.game.fires.forEach(fire => {
                fire.frozen = false;
            });
        }
    }

    hasActivePowerup(type) {
        return this.activePowerups.some(p => p.type === type);
    }

    getActivePowerup(type) {
        return this.activePowerups.find(p => p.type === type);
    }

    render(ctx) {
        // 渲染可收集的道具
        if (this.game.collectiblePowerups) {
            this.game.collectiblePowerups.forEach(powerup => {
                if (powerup.collected) return;
                
                // 检查是否过期
                if (Date.now() - powerup.spawnTime > powerup.lifetime) {
                    powerup.collected = true;
                    return;
                }
                
                // 绘制道具图标
                ctx.save();
                ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 200) * 0.2;
                
                // 背景圆圈
                ctx.beginPath();
                ctx.arc(powerup.x, powerup.y, 25, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fill();
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 图标
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(powerup.config.icon, powerup.x, powerup.y);
                
                ctx.restore();
            });
        }

        // 渲染道具库存UI
        this.renderInventoryUI(ctx);
        
        // 渲染活跃道具效果UI
        this.renderActivePowerupsUI(ctx);
    }

    renderInventoryUI(ctx) {
        const startX = 10;
        const startY = 80;
        const slotSize = 50;
        const padding = 5;
        
        ctx.save();
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY, slotSize + padding * 2, 
            Object.keys(POWERUP_TYPES).length * (slotSize + padding) + padding);
        
        // 道具槽
        let y = startY + padding;
        Object.keys(POWERUP_TYPES).forEach((type, index) => {
            const config = POWERUP_TYPES[type];
            const count = this.inventory[type];
            
            // 槽位背景
            ctx.fillStyle = count > 0 ? 'rgba(52, 152, 219, 0.3)' : 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(startX + padding, y, slotSize, slotSize);
            
            // 边框
            ctx.strokeStyle = count > 0 ? COLORS.INFO : '#555';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX + padding, y, slotSize, slotSize);
            
            // 图标
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.icon, startX + padding + slotSize / 2, y + slotSize / 2 - 5);
            
            // 数量
            if (count > 0) {
                ctx.font = 'bold 14px Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'right';
                ctx.fillText(count.toString(), startX + padding + slotSize - 5, y + slotSize - 8);
            }
            
            // 快捷键提示
            ctx.font = '10px Arial';
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'left';
            ctx.fillText(`[${index + 1}]`, startX + padding + 3, y + 10);
            
            y += slotSize + padding;
        });
        
        ctx.restore();
    }

    renderActivePowerupsUI(ctx) {
        if (this.activePowerups.length === 0) return;
        
        const startX = GAME_CONFIG.CANVAS_WIDTH - 220;
        const startY = 80;
        
        ctx.save();
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY, 210, this.activePowerups.length * 40 + 10);
        
        // 活跃道具
        let y = startY + 10;
        this.activePowerups.forEach(powerup => {
            const progress = powerup.remainingTime / powerup.config.duration;
            const barWidth = 150;
            
            // 图标和名称
            ctx.font = '14px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(`${powerup.config.icon} ${powerup.config.name}`, startX + 10, y + 12);
            
            // 进度条背景
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(startX + 10, y + 20, barWidth, 8);
            
            // 进度条
            ctx.fillStyle = COLORS.SUCCESS;
            ctx.fillRect(startX + 10, y + 20, barWidth * progress, 8);
            
            // 剩余时间
            ctx.font = '10px Arial';
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'right';
            ctx.fillText(`${(powerup.remainingTime / 1000).toFixed(1)}s`, startX + 200, y + 27);
            
            y += 40;
        });
        
        ctx.restore();
    }
}

// 导出
window.PowerUpSystem = PowerUpSystem;
