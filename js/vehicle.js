// ==================== 消防车系统 ====================

class VehicleSystem {
    constructor(game) {
        this.game = game;
        this.vehicles = this.getVehicleConfig();
        this.currentVehicle = this.loadCurrentVehicle();
        this.unlockedVehicles = this.loadUnlockedVehicles();
        this.activeVehicle = null;
    }

    // 获取消防车配置
    getVehicleConfig() {
        return {
            // 基础消防车
            basic: {
                id: 'basic',
                name: '基础消防车',
                icon: '🚒',
                description: '标准的消防车，性能均衡',
                unlockCost: 0,
                unlocked: true,
                stats: {
                    waterCapacity: 1000,
                    waterRegen: 10,
                    power: 100,
                    range: 300,
                    speed: 1.0,
                    accuracy: 0.7,
                },
                special: null,
            },

            // 高压消防车
            highPressure: {
                id: 'highPressure',
                name: '高压消防车',
                icon: '🚒💨',
                description: '配备高压水枪，射程远',
                unlockCost: 1000,
                unlocked: false,
                stats: {
                    waterCapacity: 800,
                    waterRegen: 8,
                    power: 150,
                    range: 450,
                    speed: 0.8,
                    accuracy: 0.75,
                },
                special: {
                    name: '高压喷射',
                    description: '水枪威力+50%',
                    cooldown: 30000,
                    duration: 5000,
                    active: false,
                },
            },

            // 云梯消防车
            ladder: {
                id: 'ladder',
                name: '云梯消防车',
                icon: '🚒🪜',
                description: '可以到达高处，救援能力强',
                unlockCost: 1500,
                unlocked: false,
                stats: {
                    waterCapacity: 1200,
                    waterRegen: 12,
                    power: 80,
                    range: 350,
                    speed: 0.7,
                    accuracy: 0.65,
                },
                special: {
                    name: '高空救援',
                    description: '救援速度+100%',
                    cooldown: 20000,
                    duration: 8000,
                    active: false,
                },
            },

            // 泡沫消防车
            foam: {
                id: 'foam',
                name: '泡沫消防车',
                icon: '🚒🧴',
                description: '使用泡沫灭火，效果显著',
                unlockCost: 2000,
                unlocked: false,
                stats: {
                    waterCapacity: 600,
                    waterRegen: 6,
                    power: 120,
                    range: 280,
                    speed: 1.0,
                    accuracy: 0.8,
                },
                special: {
                    name: '泡沫覆盖',
                    description: '灭火效率+100%',
                    cooldown: 25000,
                    duration: 6000,
                    active: false,
                },
            },

            // 多功能消防车
            multiPurpose: {
                id: 'multiPurpose',
                name: '多功能消防车',
                icon: '🚒⚡',
                description: '全能型消防车，适应性强',
                unlockCost: 3000,
                unlocked: false,
                stats: {
                    waterCapacity: 1500,
                    waterRegen: 15,
                    power: 110,
                    range: 380,
                    speed: 0.9,
                    accuracy: 0.72,
                },
                special: {
                    name: '多功能模式',
                    description: '所有属性+20%',
                    cooldown: 40000,
                    duration: 10000,
                    active: false,
                },
            },

            // 直升机
            helicopter: {
                id: 'helicopter',
                name: '消防直升机',
                icon: '🚁',
                description: '空中灭火，覆盖范围广',
                unlockCost: 5000,
                unlocked: false,
                stats: {
                    waterCapacity: 2000,
                    waterRegen: 20,
                    power: 90,
                    range: 500,
                    speed: 1.5,
                    accuracy: 0.6,
                },
                special: {
                    name: '空中洒水',
                    description: '大范围灭火',
                    cooldown: 60000,
                    duration: 8000,
                    active: false,
                },
            },
        };
    }

    // 加载当前选择的车辆
    loadCurrentVehicle() {
        return localStorage.getItem('firefighter_current_vehicle') || 'basic';
    }

    // 保存当前车辆
    saveCurrentVehicle() {
        localStorage.setItem('firefighter_current_vehicle', this.currentVehicle);
    }

    // 加载已解锁车辆
    loadUnlockedVehicles() {
        const saved = localStorage.getItem('firefighter_unlocked_vehicles');
        return saved ? JSON.parse(saved) : ['basic'];
    }

    // 保存已解锁车辆
    saveUnlockedVehicles() {
        localStorage.setItem('firefighter_unlocked_vehicles', JSON.stringify(this.unlockedVehicles));
    }

    // 获取当前车辆配置
    getCurrentVehicle() {
        return this.vehicles[this.currentVehicle];
    }

    // 获取车辆属性
    getVehicleStats(vehicleId) {
        const vehicle = this.vehicles[vehicleId || this.currentVehicle];
        return vehicle?.stats || this.vehicles.basic.stats;
    }

    // 选择车辆
    selectVehicle(vehicleId) {
        if (!this.unlockedVehicles.includes(vehicleId)) {
            return false;
        }
        
        this.currentVehicle = vehicleId;
        this.saveCurrentVehicle();
        this.applyVehicleStats();
        
        return true;
    }

    // 解锁车辆
    unlockVehicle(vehicleId) {
        const vehicle = this.vehicles[vehicleId];
        if (!vehicle || this.unlockedVehicles.includes(vehicleId)) {
            return false;
        }
        
        const coins = this.game.upgradeSystem?.coins || 0;
        if (coins < vehicle.unlockCost) {
            this.game.showMessage(`💰 金币不足！需要 ${vehicle.unlockCost} 金币`, 2000);
            return false;
        }
        
        this.game.upgradeSystem.addCoins(-vehicle.unlockCost);
        this.unlockedVehicles.push(vehicleId);
        this.saveUnlockedVehicles();
        
        this.game.showMessage(`🎉 解锁 ${vehicle.name}！`, 2000);
        
        if (this.game.audio) {
            this.game.audio.play('unlock');
        }
        
        return true;
    }

    // 应用车辆属性
    applyVehicleStats() {
        const stats = this.getVehicleStats();
        
        if (this.game.waterSystem) {
            this.game.waterSystem.maxPower = stats.power;
            this.game.waterSystem.range = stats.range;
            this.game.waterSystem.accuracy = stats.accuracy;
        }
        
        if (this.game.resourceSystem) {
            this.game.resourceSystem.maxWater = stats.waterCapacity;
            this.game.resourceSystem.refillRate = stats.waterRegen;
        }
    }

    // 激活特殊技能
    activateSpecial() {
        const vehicle = this.getCurrentVehicle();
        if (!vehicle.special) return false;
        
        if (vehicle.special.active) {
            this.game.showMessage('⏳ 技能冷却中...', 1500);
            return false;
        }
        
        vehicle.special.active = true;
        
        // 应用特殊效果
        this.applySpecialEffect(vehicle);
        
        // 设置持续时间
        setTimeout(() => {
            this.deactivateSpecial(vehicle);
        }, vehicle.special.duration);
        
        // 设置冷却时间
        setTimeout(() => {
            vehicle.special.active = false;
        }, vehicle.special.cooldown);
        
        this.game.showMessage(`🎯 ${vehicle.special.name} 已激活！`, 2000);
        
        if (this.game.audio) {
            this.game.audio.play('special');
        }
        
        return true;
    }

    // 应用特殊效果
    applySpecialEffect(vehicle) {
        const special = vehicle.special;
        
        switch (vehicle.id) {
            case 'highPressure':
                // 高压喷射
                if (this.game.waterSystem) {
                    this.game.waterSystem.powerMultiplier = 1.5;
                }
                break;
                
            case 'ladder':
                // 高空救援
                if (this.game.rescueSystem) {
                    this.game.rescueSystem.rescueTime /= 2;
                }
                break;
                
            case 'foam':
                // 泡沫覆盖
                if (this.game.fireSystem) {
                    this.game.fireSystem.extinguishMultiplier = 2;
                }
                break;
                
            case 'multiPurpose':
                // 多功能模式
                if (this.game.waterSystem) {
                    this.game.waterSystem.powerMultiplier = 1.2;
                    this.game.waterSystem.accuracy = Math.min(1, this.game.waterSystem.accuracy * 1.2);
                }
                if (this.game.resourceSystem) {
                    this.game.resourceSystem.refillRate *= 1.2;
                }
                break;
                
            case 'helicopter':
                // 空中洒水
                this.startAerialWaterDrop();
                break;
        }
    }

    // 取消特殊效果
    deactivateSpecial(vehicle) {
        switch (vehicle.id) {
            case 'highPressure':
                if (this.game.waterSystem) {
                    this.game.waterSystem.powerMultiplier = 1;
                }
                break;
                
            case 'ladder':
                if (this.game.rescueSystem) {
                    this.game.rescueSystem.rescueTime *= 2;
                }
                break;
                
            case 'foam':
                if (this.game.fireSystem) {
                    this.game.fireSystem.extinguishMultiplier = 1;
                }
                break;
                
            case 'multiPurpose':
                if (this.game.waterSystem) {
                    this.game.waterSystem.powerMultiplier = 1;
                    this.game.waterSystem.accuracy = this.getVehicleStats().accuracy;
                }
                if (this.game.resourceSystem) {
                    this.game.resourceSystem.refillRate = this.getVehicleStats().waterRegen;
                }
                break;
                
            case 'helicopter':
                this.stopAerialWaterDrop();
                break;
        }
        
        this.game.showMessage(`⏰ ${vehicle.special.name} 效果结束`, 1500);
    }

    // 开始空中洒水
    startAerialWaterDrop() {
        this.aerialWaterDropActive = true;
        this.aerialWaterDropInterval = setInterval(() => {
            if (!this.aerialWaterDropActive) return;
            
            // 在燃烧的建筑上空洒水
            this.game.buildings?.forEach(building => {
                if (building.state === 'burning' && Math.random() < 0.3) {
                    if (this.game.particleSystem) {
                        for (let i = 0; i < 10; i++) {
                            this.game.particleSystem.createParticle({
                                x: building.x + Math.random() * building.width,
                                y: 50,
                                vx: 0,
                                vy: 5,
                                type: 'water',
                                color: '#3498db',
                                life: 40,
                                size: 4,
                            });
                        }
                    }
                }
            });
        }, 500);
    }

    // 停止空中洒水
    stopAerialWaterDrop() {
        this.aerialWaterDropActive = false;
        if (this.aerialWaterDropInterval) {
            clearInterval(this.aerialWaterDropInterval);
        }
    }

    // 渲染车库UI
    renderGarageUI(container) {
        container.innerHTML = '';
        
        // 标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'garage-title';
        titleDiv.innerHTML = '🚒 消防车库';
        container.appendChild(titleDiv);
        
        // 当前金币
        const coins = this.game.upgradeSystem?.coins || 0;
        const coinsDiv = document.createElement('div');
        coinsDiv.className = 'garage-coins';
        coinsDiv.innerHTML = `💰 当前金币: <span>${coins}</span>`;
        container.appendChild(coinsDiv);
        
        // 车辆列表
        Object.keys(this.vehicles).forEach(vehicleId => {
            const vehicle = this.vehicles[vehicleId];
            const isUnlocked = this.unlockedVehicles.includes(vehicleId);
            const isSelected = this.currentVehicle === vehicleId;
            
            const vehicleDiv = document.createElement('div');
            vehicleDiv.className = `vehicle-card ${isSelected ? 'selected' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            vehicleDiv.innerHTML = `
                <div class="vehicle-header">
                    <span class="vehicle-icon">${vehicle.icon}</span>
                    <span class="vehicle-name">${vehicle.name}</span>
                    ${isSelected ? '<span class="selected-badge">✓ 使用中</span>' : ''}
                </div>
                <div class="vehicle-description">${vehicle.description}</div>
                <div class="vehicle-stats">
                    <div class="stat-item">
                        <span class="stat-label">💧 水容量:</span>
                        <span class="stat-value">${vehicle.stats.waterCapacity}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">💪 威力:</span>
                        <span class="stat-value">${vehicle.stats.power}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">📏 射程:</span>
                        <span class="stat-value">${vehicle.stats.range}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">🎯 精准度:</span>
                        <span class="stat-value">${Math.round(vehicle.stats.accuracy * 100)}%</span>
                    </div>
                </div>
                ${vehicle.special ? `
                    <div class="vehicle-special">
                        <div class="special-name">${vehicle.special.name}</div>
                        <div class="special-desc">${vehicle.special.description}</div>
                    </div>
                ` : ''}
                <div class="vehicle-actions">
                    ${isUnlocked ? (
                        isSelected ? 
                        '<button class="vehicle-btn disabled" disabled>使用中</button>' :
                        `<button class="vehicle-btn select-btn">选择</button>`
                    ) : `
                        <button class="vehicle-btn unlock-btn" ${coins >= vehicle.unlockCost ? '' : 'disabled'}>
                            🔓 解锁 (${vehicle.unlockCost} 💰)
                        </button>
                    `}
                </div>
            `;
            
            // 绑定事件
            if (isUnlocked && !isSelected) {
                const selectBtn = vehicleDiv.querySelector('.select-btn');
                selectBtn?.addEventListener('click', () => {
                    if (this.selectVehicle(vehicleId)) {
                        this.renderGarageUI(container);
                        this.game.showMessage(`🚒 已选择 ${vehicle.name}`, 2000);
                    }
                });
            } else if (!isUnlocked) {
                const unlockBtn = vehicleDiv.querySelector('.unlock-btn');
                unlockBtn?.addEventListener('click', () => {
                    if (this.unlockVehicle(vehicleId)) {
                        this.renderGarageUI(container);
                    }
                });
            }
            
            container.appendChild(vehicleDiv);
        });
    }

    // 渲染车辆选择界面
    renderVehicleSelection(ctx, x, y) {
        const vehicle = this.getCurrentVehicle();
        
        ctx.save();
        
        // 车辆图标
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(vehicle.icon, x, y);
        
        // 车辆名称
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(vehicle.name, x, y + 20);
        
        // 特殊技能冷却
        if (vehicle.special) {
            const cooldownPercent = vehicle.special.active ? 1 : 0;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(x - 25, y + 25, 50, 4);
            ctx.fillStyle = vehicle.special.active ? '#27ae60' : '#95a5a6';
            ctx.fillRect(x - 25, y + 25, 50 * cooldownPercent, 4);
        }
        
        ctx.restore();
    }

    // 重置
    reset() {
        this.aerialWaterDropActive = false;
        if (this.aerialWaterDropInterval) {
            clearInterval(this.aerialWaterDropInterval);
        }
    }
}

export { VehicleSystem };
