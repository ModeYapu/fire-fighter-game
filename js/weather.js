// ==================== 天气系统 ====================

class WeatherSystem {
    constructor(game) {
        this.game = game;
        this.currentWeather = WEATHER_TYPES.CLEAR;
        this.weatherParticles = [];
        this.completedWeathers = new Set();
        
        this.initParticles();
    }

    initParticles() {
        // 初始化天气粒子池
        for (let i = 0; i < 200; i++) {
            this.weatherParticles.push({
                x: Math.random() * GAME_CONFIG.CANVAS_WIDTH,
                y: Math.random() * GAME_CONFIG.CANVAS_HEIGHT,
                speed: 0,
                size: 0,
                active: false,
            });
        }
    }

    setWeather(weatherType) {
        this.currentWeather = WEATHER_TYPES[weatherType] || WEATHER_TYPES.CLEAR;
        
        // 重置粒子
        this.weatherParticles.forEach(p => {
            p.active = false;
        });
        
        // 根据天气类型初始化粒子
        this.initWeatherParticles();
        
        // 应用天气效果
        this.applyWeatherEffects();
        
        console.log(`天气变化: ${this.currentWeather.icon} ${this.currentWeather.name}`);
    }

    initWeatherParticles() {
        switch (this.currentWeather) {
            case WEATHER_TYPES.RAIN:
                // 雨滴
                this.weatherParticles.forEach(p => {
                    p.active = true;
                    p.speed = 8 + Math.random() * 4;
                    p.size = 2 + Math.random() * 2;
                    p.length = 10 + Math.random() * 10;
                });
                break;
                
            case WEATHER_TYPES.WIND:
                // 风中的落叶/灰尘
                this.weatherParticles.forEach(p => {
                    p.active = Math.random() > 0.7; // 只有部分粒子活跃
                    p.speed = 3 + Math.random() * 2;
                    p.size = 2 + Math.random() * 3;
                    p.angle = Math.random() * Math.PI * 2;
                });
                break;
                
            case WEATHER_TYPES.NIGHT:
                // 夜间没有特殊粒子，只是光照变化
                break;
                
            case WEATHER_TYPES.DROUGHT:
                // 干旱的热浪
                this.weatherParticles.forEach(p => {
                    p.active = Math.random() > 0.5;
                    p.speed = 0.5 + Math.random() * 0.5;
                    p.size = 20 + Math.random() * 30;
                    p.alpha = 0.1 + Math.random() * 0.1;
                });
                break;
        }
    }

    applyWeatherEffects() {
        const weather = this.currentWeather;
        
        // 重置所有效果
        this.game.waterRefillRate = RESOURCE_CONFIG.REFILL_RATE;
        this.game.fireSpreadMultiplier = 1.0;
        this.game.waterDrift = 0;
        
        // 应用天气效果
        if (weather === WEATHER_TYPES.RAIN) {
            // 雨天：自动灭火
            this.rainExtinguishTimer = 0;
        }
        
        if (weather === WEATHER_TYPES.WIND) {
            // 大风：影响水柱和火势
            this.game.fireSpreadMultiplier = weather.spreadMultiplier;
            this.game.waterDrift = weather.waterDrift;
        }
        
        if (weather === WEATHER_TYPES.DROUGHT) {
            // 干旱：减少水资源，增强火焰
            this.game.water *= weather.waterReduction;
            this.game.fireIntensityMultiplier = weather.fireIntensityMultiplier;
        }
    }

    update(deltaTime) {
        if (this.currentWeather === WEATHER_TYPES.CLEAR) return;
        
        // 更新天气粒子
        this.updateParticles(deltaTime);
        
        // 应用天气效果
        this.applyWeatherUpdate(deltaTime);
    }

    updateParticles(deltaTime) {
        this.weatherParticles.forEach(p => {
            if (!p.active) return;
            
            switch (this.currentWeather) {
                case WEATHER_TYPES.RAIN:
                    // 雨滴下落
                    p.y += p.speed;
                    p.x += Math.random() * 2 - 1; // 轻微水平漂移
                    
                    // 重置到顶部
                    if (p.y > GAME_CONFIG.CANVAS_HEIGHT) {
                        p.y = -p.length;
                        p.x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
                    }
                    break;
                    
                case WEATHER_TYPES.WIND:
                    // 风中的物体
                    p.x += p.speed;
                    p.y += Math.sin(p.angle) * 0.5;
                    p.angle += 0.02;
                    
                    // 重置
                    if (p.x > GAME_CONFIG.CANVAS_WIDTH) {
                        p.x = -10;
                        p.y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
                    }
                    break;
                    
                case WEATHER_TYPES.DROUGHT:
                    // 热浪上升
                    p.y -= p.speed;
                    p.x += Math.sin(Date.now() / 500 + p.x) * 0.5;
                    
                    // 重置
                    if (p.y < -p.size) {
                        p.y = GAME_CONFIG.CANVAS_HEIGHT + p.size;
                        p.x = Math.random() * GAME_CONFIG.CANVAS_WIDTH;
                    }
                    break;
            }
        });
    }

    applyWeatherUpdate(deltaTime) {
        switch (this.currentWeather) {
            case WEATHER_TYPES.RAIN:
                // 雨天自动灭火
                this.rainExtinguishTimer = (this.rainExtinguishTimer || 0) + deltaTime;
                
                if (this.rainExtinguishTimer >= 1) { // 每秒
                    this.game.fires.forEach(fire => {
                        if (!fire.extinguished) {
                            fire.intensity *= (1 - this.currentWeather.fireReduceRate);
                            if (fire.intensity < 0.1) {
                                fire.extinguished = true;
                            }
                        }
                    });
                    this.rainExtinguishTimer = 0;
                }
                break;
        }
    }

    render(ctx) {
        if (this.currentWeather === WEATHER_TYPES.CLEAR) return;
        
        // 应用天气视觉效果
        this.applyWeatherVisuals(ctx);
        
        // 渲染天气粒子
        this.renderParticles(ctx);
        
        // 渲染天气UI
        this.renderWeatherUI(ctx);
    }

    applyWeatherVisuals(ctx) {
        const weather = this.currentWeather;
        
        // 雨天：降低能见度
        if (weather === WEATHER_TYPES.RAIN) {
            ctx.save();
            ctx.fillStyle = `rgba(100, 100, 120, ${1 - weather.visibility})`;
            ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
            ctx.restore();
        }
        
        // 夜间：黑暗效果
        if (weather === WEATHER_TYPES.NIGHT) {
            // 应用黑暗遮罩
            ctx.save();
            
            // 创建径向渐变（探照灯效果）
            const cannonX = this.game.waterCannon?.x || GAME_CONFIG.CANVAS_WIDTH / 2;
            const cannonY = this.game.waterCannon?.y || GAME_CONFIG.CANVAS_HEIGHT - 50;
            const radius = weather.visibilityRadius;
            
            const gradient = ctx.createRadialGradient(
                cannonX, cannonY, 0,
                cannonX, cannonY, radius
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
            
            ctx.restore();
        }
    }

    renderParticles(ctx) {
        ctx.save();
        
        this.weatherParticles.forEach(p => {
            if (!p.active) return;
            
            switch (this.currentWeather) {
                case WEATHER_TYPES.RAIN:
                    // 雨滴
                    ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
                    ctx.lineWidth = p.size / 2;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, p.y + p.length);
                    ctx.stroke();
                    break;
                    
                case WEATHER_TYPES.WIND:
                    // 风中的物体（灰尘/树叶）
                    ctx.fillStyle = 'rgba(139, 119, 101, 0.5)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case WEATHER_TYPES.DROUGHT:
                    // 热浪
                    ctx.fillStyle = `rgba(255, 100, 0, ${p.alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        });
        
        ctx.restore();
    }

    renderWeatherUI(ctx) {
        const weather = this.currentWeather;
        
        ctx.save();
        
        // 天气图标和说明
        const x = GAME_CONFIG.CANVAS_WIDTH / 2;
        const y = 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 100, y - 5, 200, 35);
        
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`${weather.icon} ${weather.name}`, x, y + 15);
        
        ctx.font = '10px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(weather.description, x, y + 28);
        
        ctx.restore();
    }

    markWeatherCompleted() {
        if (this.currentWeather !== WEATHER_TYPES.CLEAR) {
            const weatherName = Object.keys(WEATHER_TYPES).find(
                key => WEATHER_TYPES[key] === this.currentWeather
            );
            this.completedWeathers.add(weatherName);
            this.saveCompletedWeathers();
        }
    }

    saveCompletedWeathers() {
        try {
            const data = {
                completedWeathers: Array.from(this.completedWeathers),
            };
            localStorage.setItem('fireFighterWeathers', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save weather progress:', e);
        }
    }

    loadCompletedWeathers() {
        try {
            const saved = localStorage.getItem('fireFighterWeathers');
            if (saved) {
                const data = JSON.parse(saved);
                this.completedWeathers = new Set(data.completedWeathers || []);
            }
        } catch (e) {
            console.error('Failed to load weather progress:', e);
        }
    }

    hasCompletedAllWeathers() {
        const allWeathers = Object.keys(WEATHER_TYPES).filter(w => w !== 'CLEAR');
        return allWeathers.every(w => this.completedWeathers.has(w));
    }
}

// 导出
window.WeatherSystem = WeatherSystem;
