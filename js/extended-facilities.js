// ==================== 扩展设施系统 ====================

// 扩展设施类型配置
const EXTENDED_FACILITY_TYPES = {
    // 基础设施（已有）
    HYDRANT: {
        name: '消防栓',
        cost: 50,
        range: 100,
        icon: '💧',
        color: '#4169E1',
        description: '自动回水，放置在火源附近',
        category: 'basic',
        unlockLevel: 1,
    },
    FIRE_WALL: {
        name: '防火墙',
        cost: 80,
        range: 50,
        icon: '🧱',
        color: '#8B0000',
        description: '阻止火势蔓延',
        category: 'basic',
        unlockLevel: 1,
    },
    FIGHTER: {
        name: '消防员',
        cost: 100,
        range: 80,
        icon: '👨‍🚒',
        color: '#FF6600',
        description: '自动灭火',
        category: 'basic',
        unlockLevel: 1,
    },

    // 高级设施（新增）
    WATER_TOWER: {
        name: '水塔',
        cost: 150,
        range: 200,
        icon: '🗼',
        color: '#1E90FF',
        description: '大范围自动喷水灭火',
        category: 'advanced',
        unlockLevel: 2,
        sprayRate: 0.03,
        waterConsumption: 2,
    },
    HELIPAD: {
        name: '直升机坪',
        cost: 300,
        range: 300,
        icon: '🚁',
        color: '#32CD32',
        description: '召唤直升机空中支援',
        category: 'advanced',
        unlockLevel: 3,
        cooldown: 60000,
        duration: 8000,
    },
    FIRE_STATION: {
        name: '消防站',
        cost: 250,
        range: 150,
        icon: '🏢',
        color: '#DC143C',
        description: '部署多个消防员，效率提升',
        category: 'advanced',
        unlockLevel: 3,
        fighterCount: 3,
        efficiencyBoost: 1.5,
    },
    FOAM_STATION: {
        name: '泡沫站',
        cost: 180,
        range: 120,
        icon: '🧴',
        color: '#FF69B4',
        description: '喷射泡沫，灭火效率+50%',
        category: 'advanced',
        unlockLevel: 2,
        foamMultiplier: 1.5,
    },
    EXTINGUISHER_DEPOT: {
        name: '灭火器站',
        cost: 120,
        range: 60,
        icon: '🧯',
        color: '#FF4500',
        description: '提供便携灭火器，快速灭火',
        category: 'advanced',
        unlockLevel: 2,
        extinguishPower: 0.15,
        cooldown: 5000,
    },

    // 特殊设施（新增）
    SMOKE_DETECTOR: {
        name: '烟雾探测器',
        cost: 60,
        range: 180,
        icon: '📡',
        color: '#FFD700',
        description: '提前预警，显示火势蔓延方向',
        category: 'special',
        unlockLevel: 2,
        warningTime: 5000,
    },
    EVACUATION_ROUTE: {
        name: '疏散通道',
        cost: 90,
        range: 100,
        icon: '🚪',
        color: '#00CED1',
        description: '加速幸存者救援速度+100%',
        category: 'special',
        unlockLevel: 2,
        rescueSpeedBoost: 2.0,
    },
    MEDICAL_TENT: {
        name: '医疗帐篷',
        cost: 200,
        range: 80,
        icon: '🏥',
        color: '#FFFFFF',
        description: '提升幸存者存活率，恢复生命',
        category: 'special',
        unlockLevel: 3,
        healRate: 5,
    },
    FIRE_RETARDANT: {
        name: '防火涂料',
        cost: 140,
        range: 0,
        icon: '🎨',
        color: '#8B4513',
        description: '涂抹建筑，提升耐火性+50%',
        category: 'special',
        unlockLevel: 2,
        resistanceBoost: 1.5,
    },
    WATER_CURTAIN: {
        name: '水幕系统',
        cost: 220,
        range: 150,
        icon: '🌊',
        color: '#00BFFF',
        description: '创建水幕屏障，阻止火势蔓延',
        category: 'special',
        unlockLevel: 3,
        barrierWidth: 150,
        waterConsumption: 5,
    },

    // 辅助设施（新增）
    AIM_ASSIST: {
        name: '瞄准辅助',
        cost: 160,
        range: 200,
        icon: '🎯',
        color: '#FF1493',
        description: '显示弹道预测线，提升精准度',
        category: 'support',
        unlockLevel: 2,
        accuracyBoost: 0.15,
    },
    SPOTLIGHT: {
        name: '探照灯',
        cost: 80,
        range: 250,
        icon: '🔦',
        color: '#FFFF00',
        description: '夜间模式照亮区域，提升视野',
        category: 'support',
        unlockLevel: 2,
        visibilityBoost: 1.5,
    },
    VENTILATION: {
        name: '通风系统',
        cost: 130,
        range: 180,
        icon: '💨',
        color: '#87CEEB',
        description: '减少烟雾影响，降低火势蔓延',
        category: 'support',
        unlockLevel: 2,
        spreadReduction: 0.7,
    },
    SUPPLY_CRATE: {
        name: '补给箱',
        cost: 110,
        range: 50,
        icon: '📦',
        color: '#DAA520',
        description: '存储水资源，紧急时使用',
        category: 'support',
        unlockLevel: 1,
        waterStorage: 300,
    },
    FIRE_BREAK: {
        name: '防火带',
        cost: 70,
        range: 0,
        icon: '🛑',
        color: '#8B0000',
        description: '创建防火隔离带，阻止蔓延',
        category: 'support',
        unlockLevel: 1,
        barrierLength: 200,
    },
};

// ==================== 扩展设施类 ====================

class ExtendedFacility extends Facility {
    constructor(type, x, y) {
        super(type, x, y);
        
        const config = EXTENDED_FACILITY_TYPES[type.toUpperCase()];
        this.config = { ...config };
        this.category = config.category;
        this.active = true;
        this.specialTimer = 0;
        this.particles = [];
        
        // 特殊属性
        this.setupSpecialProperties(type);
    }

    setupSpecialProperties(type) {
        switch (type.toUpperCase()) {
            case 'WATER_TOWER':
                this.sprayAngle = 0;
                this.sprayRate = this.config.sprayRate || 0.03;
                break;
            case 'HELIPAD':
                this.helicopterActive = false;
                this.cooldown = 0;
                break;
            case 'FIRE_STATION':
                this.deployedFighters = [];
                break;
            case 'MEDICAL_TENT':
                this.healingSurvivors = [];
                break;
            case 'SMOKE_DETECTOR':
                this.detectedFires = [];
                break;
        }
    }

    update(game, deltaTime) {
        if (this.cooldown > 0) {
            this.cooldown -= deltaTime * 1000;
        }

        if (!this.active) return;

        switch (this.type.toUpperCase()) {
            case 'WATER_TOWER':
                this.updateWaterTower(game, deltaTime);
                break;
            case 'HELIPAD':
                this.updateHelipad(game, deltaTime);
                break;
            case 'FIRE_STATION':
                this.updateFireStation(game, deltaTime);
                break;
            case 'FOAM_STATION':
                this.updateFoamStation(game, deltaTime);
                break;
            case 'EXTINGUISHER_DEPOT':
                this.updateExtinguisherDepot(game, deltaTime);
                break;
            case 'MEDICAL_TENT':
                this.updateMedicalTent(game, deltaTime);
                break;
            case 'SMOKE_DETECTOR':
                this.updateSmokeDetector(game, deltaTime);
                break;
            case 'WATER_CURTAIN':
                this.updateWaterCurtain(game, deltaTime);
                break;
            case 'VENTILATION':
                this.updateVentilation(game, deltaTime);
                break;
            case 'SUPPLY_CRATE':
                this.updateSupplyCrate(game, deltaTime);
                break;
            default:
                // 基础设施行为
                super.update(game);
        }
    }

    // 水塔 - 旋转喷水
    updateWaterTower(game, deltaTime) {
        this.sprayAngle += deltaTime * 2;
        
        // 消耗水
        if (game.water > 0) {
            game.water -= this.config.waterConsumption * deltaTime;
            
            // 寻找范围内的火并灭火
            game.fires?.forEach(fire => {
                const distance = Math.sqrt(
                    Math.pow(fire.x - this.x, 2) + Math.pow(fire.y - this.y, 2)
                );
                
                if (distance < this.range) {
                    fire.intensity -= this.sprayRate * deltaTime;
                    if (fire.intensity <= 0) {
                        fire.extinguished = true;
                    }
                }
            });
        }
    }

    // 直升机坪 - 召唤直升机
    updateHelipad(game, deltaTime) {
        if (this.helicopterActive) {
            this.specialTimer += deltaTime * 1000;
            
            // 直升机空中洒水
            game.buildings?.forEach(building => {
                if (building.state === 'burning') {
                    const distance = Math.sqrt(
                        Math.pow(building.x + building.width/2 - this.x, 2) +
                        Math.pow(building.y + building.height/2 - this.y, 2)
                    );
                    
                    if (distance < this.range && Math.random() < 0.1) {
                        building.fireIntensity -= 0.1 * deltaTime;
                    }
                }
            });
            
            // 持续时间结束
            if (this.specialTimer >= this.config.duration) {
                this.helicopterActive = false;
                this.specialTimer = 0;
                this.cooldown = this.config.cooldown;
            }
        }
    }

    // 消防站 - 部署多个消防员
    updateFireStation(game, deltaTime) {
        // 自动生成消防员
        if (this.deployedFighters.length < this.config.efficiencyBoost) {
            const angle = (this.deployedFighters.length / this.config.efficiencyBoost) * Math.PI * 2;
            const radius = 30;
            
            this.deployedFighters.push({
                x: this.x + Math.cos(angle) * radius,
                y: this.y + Math.sin(angle) * radius,
                targetFire: null,
            });
        }

        // 每个消防员自动灭火
        this.deployedFighters.forEach(fighter => {
            game.fires?.forEach(fire => {
                const distance = Math.sqrt(
                    Math.pow(fire.x - fighter.x, 2) + Math.pow(fire.y - fighter.y, 2)
                );
                
                if (distance < this.range / this.config.efficiencyBoost) {
                    fire.intensity -= 0.05 * this.config.efficiencyBoost * deltaTime;
                }
            });
        });
    }

    // 泡沫站 - 增强灭火
    updateFoamStation(game, deltaTime) {
        game.fires?.forEach(fire => {
            const distance = Math.sqrt(
                Math.pow(fire.x - this.x, 2) + Math.pow(fire.y - this.y, 2)
            );
            
            if (distance < this.range) {
                fire.intensity -= 0.08 * this.config.foamMultiplier * deltaTime;
            }
        });
    }

    // 灭火器站 - 快速灭火
    updateExtinguisherDepot(game, deltaTime) {
        if (this.cooldown <= 0) {
            // 寻找最近的火
            let nearestFire = null;
            let nearestDistance = Infinity;
            
            game.fires?.forEach(fire => {
                const distance = Math.sqrt(
                    Math.pow(fire.x - this.x, 2) + Math.pow(fire.y - this.y, 2)
                );
                
                if (distance < this.range && distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestFire = fire;
                }
            });
            
            if (nearestFire) {
                nearestFire.intensity -= this.config.extinguishPower;
                this.cooldown = this.config.cooldown;
            }
        }
    }

    // 医疗帐篷 - 治疗幸存者
    updateMedicalTent(game, deltaTime) {
        if (game.rescueSystem?.survivors) {
            game.rescueSystem.survivors.forEach(survivor => {
                const distance = Math.sqrt(
                    Math.pow(survivor.x - this.x, 2) + Math.pow(survivor.y - this.y, 2)
                );
                
                if (distance < this.range && survivor.health < survivor.maxHealth) {
                    survivor.health += this.config.healRate * deltaTime;
                    survivor.health = Math.min(survivor.health, survivor.maxHealth);
                }
            });
        }
    }

    // 烟雾探测器 - 预警系统
    updateSmokeDetector(game, deltaTime) {
        // 检测新的火势
        game.fires?.forEach(fire => {
            const distance = Math.sqrt(
                Math.pow(fire.x - this.x, 2) + Math.pow(fire.y - this.y, 2)
            );
            
            if (distance < this.range && !this.detectedFires.includes(fire.id)) {
                this.detectedFires.push(fire.id);
                
                // 显示预警
                game.showMessage?.(`⚠️ 检测到火势！距离: ${Math.round(distance)}`, 2000);
            }
        });
    }

    // 水幕系统 - 创建屏障
    updateWaterCurtain(game, deltaTime) {
        if (game.water > 0) {
            game.water -= this.config.waterConsumption * deltaTime;
            
            // 阻止火势蔓延
            game.fires?.forEach(fire => {
                const distance = Math.sqrt(
                    Math.pow(fire.x - this.x, 2) + Math.pow(fire.y - this.y, 2)
                );
                
                if (distance < this.config.barrierWidth) {
                    fire.spreadChance = 0; // 阻止蔓延
                }
            });
        }
    }

    // 通风系统 - 减少烟雾
    updateVentilation(game, deltaTime) {
        if (game.fireSystem) {
            game.fireSystem.spreadMultiplier *= this.config.spreadReduction;
        }
    }

    // 补给箱 - 紧急供水
    updateSupplyCrate(game, deltaTime) {
        // 低水量时自动补充
        if (game.water < 200 && this.config.waterStorage > 0) {
            const supply = Math.min(50, this.config.waterStorage);
            game.water += supply;
            this.config.waterStorage -= supply;
            
            if (supply > 0) {
                game.showMessage?.('📦 补给箱自动供水 +50', 1500);
            }
        }
    }

    // 激活特殊功能
    activate() {
        if (this.type.toUpperCase() === 'HELIPAD' && this.cooldown <= 0) {
            this.helicopterActive = true;
            this.specialTimer = 0;
            return true;
        }
        return false;
    }

    // 渲染设施
    render(ctx) {
        // 绘制范围圈
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // 特殊渲染
        switch (this.type.toUpperCase()) {
            case 'WATER_TOWER':
                this.renderWaterTower(ctx);
                break;
            case 'HELIPAD':
                this.renderHelipad(ctx);
                break;
            case 'FIRE_STATION':
                this.renderFireStation(ctx);
                break;
            case 'WATER_CURTAIN':
                this.renderWaterCurtain(ctx);
                break;
            default:
                // 默认渲染
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.icon, this.x, this.y);
        }

        // 绘制冷却指示器
        if (this.cooldown > 0) {
            const cooldownPercent = this.cooldown / (this.config.cooldown || 60000);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20, 0, Math.PI * 2 * cooldownPercent);
            ctx.fill();
        }
    }

    renderWaterTower(ctx) {
        // 绘制旋转喷水效果
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.sprayAngle);
        
        // 水柱
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();
        
        // 图标
        ctx.rotate(-this.sprayAngle);
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        ctx.restore();
    }

    renderHelipad(ctx) {
        // 绘制直升机坪
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        // H标志
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', this.x, this.y);
        
        // 直升机动画
        if (this.helicopterActive) {
            ctx.font = '30px Arial';
            ctx.fillText('🚁', this.x + Math.sin(Date.now() / 200) * 10, this.y - 30);
        }
    }

    renderFireStation(ctx) {
        // 绘制消防站
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y);
        
        // 绘制部署的消防员
        this.deployedFighters.forEach(fighter => {
            ctx.font = '16px Arial';
            ctx.fillText('👨‍🚒', fighter.x, fighter.y);
        });
    }

    renderWaterCurtain(ctx) {
        // 绘制水幕效果
        ctx.save();
        ctx.globalAlpha = 0.5;
        
        for (let i = 0; i < 10; i++) {
            const x = this.x - this.config.barrierWidth / 2 + (i * this.config.barrierWidth / 10);
            const y = this.y + Math.sin(Date.now() / 200 + i) * 5;
            
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x - 2, y - 20, 4, 40);
        }
        
        ctx.globalAlpha = 1;
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.icon, this.x, this.y);
        ctx.restore();
    }
}

// ==================== 扩展设施系统 ====================

class ExtendedFacilitySystem extends FacilitySystem {
    constructor() {
        super();
        this.categories = {
            basic: { name: '基础', icon: '🔧', unlocked: true },
            advanced: { name: '高级', icon: '⭐', unlocked: false },
            special: { name: '特殊', icon: '🌟', unlocked: false },
            support: { name: '辅助', icon: '🎯', unlocked: false },
        };
        this.unlockProgress = this.loadUnlockProgress();
    }

    loadUnlockProgress() {
        const saved = localStorage.getItem('firefighter_facility_unlocks');
        return saved ? JSON.parse(saved) : {
            basic: true,
            advanced: false,
            special: false,
            support: false,
        };
    }

    saveUnlockProgress() {
        localStorage.setItem('firefighter_facility_unlocks', JSON.stringify(this.unlockProgress));
    }

    // 解锁设施类别
    unlockCategory(category) {
        if (this.categories[category]) {
            this.categories[category].unlocked = true;
            this.unlockProgress[category] = true;
            this.saveUnlockProgress();
        }
    }

    // 检查设施是否可用
    isFacilityAvailable(type) {
        const config = EXTENDED_FACILITY_TYPES[type.toUpperCase()];
        if (!config) return false;
        
        // 检查类别是否解锁
        if (!this.unlockProgress[config.category]) return false;
        
        // 检查关卡解锁条件
        // 这里可以添加关卡检查逻辑
        
        return true;
    }

    // 放置设施
    place(game, type, x, y) {
        if (!this.isFacilityAvailable(type)) {
            game.showMessage?.('❌ 该设施尚未解锁！', 2000);
            return false;
        }

        const config = EXTENDED_FACILITY_TYPES[type.toUpperCase()];
        if (!config) return false;

        // 检查分数是否足够
        if (game.score < config.cost) {
            game.showMessage?.('❌ 分数不足！', 2000);
            return false;
        }

        // 检查是否可以放置
        if (!strategy.canPlaceFacility(game, type, x, y)) {
            return false;
        }

        // 扣除分数
        game.score -= config.cost;

        // 创建设施
        const facility = new ExtendedFacility(type, x, y);
        game.facilities.push(facility);

        // 播放音效
        if (game.audio) {
            game.audio.play('place');
        }

        return true;
    }

    // 更新所有设施
    update(game, deltaTime) {
        game.facilities.forEach(facility => {
            if (facility instanceof ExtendedFacility) {
                facility.update(game, deltaTime);
            } else {
                facility.update(game);
            }
        });
    }

    // 渲染所有设施
    render(game) {
        game.facilities.forEach(facility => {
            if (facility instanceof ExtendedFacility) {
                facility.render(game.ctx);
            } else {
                facility.render(game);
            }
        });
    }

    // 获取可用设施列表
    getAvailableFacilities() {
        return Object.keys(EXTENDED_FACILITY_TYPES).filter(type => 
            this.isFacilityAvailable(type)
        ).map(type => ({
            type: type,
            ...EXTENDED_FACILITY_TYPES[type],
        }));
    }

    // 获取设施分类
    getFacilitiesByCategory() {
        const categorized = {};
        
        Object.keys(EXTENDED_FACILITY_TYPES).forEach(type => {
            const config = EXTENDED_FACILITY_TYPES[type];
            if (!categorized[config.category]) {
                categorized[config.category] = [];
            }
            categorized[config.category].push({
                type: type,
                ...config,
            });
        });
        
        return categorized;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EXTENDED_FACILITY_TYPES, ExtendedFacility, ExtendedFacilitySystem };
}
