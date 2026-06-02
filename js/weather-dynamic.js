/**
 * 动态天气系统 (Dynamic Weather System)
 * 支持晴天、雨天、大风、雷电、暴风雪等多种天气
 * 天气影响火势蔓延速度和水量效率
 */
export class WeatherSystem {
    constructor(game) {
        this.game = game;
        this.currentWeather = 'sunny';
        this.weatherIntensity = 0.5; // 0-1, 天气强度
        this.weatherTimer = 0;
        this.weatherChangeInterval = 60; // 天气变化间隔（秒）
        this.nextWeather = null;
        this.transitionProgress = 0; // 天气过渡进度

        // 天气粒子
        this.raindrops = [];
        this.snowflakes = [];
        this.lightningTimer = 0;
        this.lightningFlash = 0;

        // 天气配置
        this.weatherTypes = {
            sunny: {
                name: '晴天',
                icon: '☀️',
                description: '视野清晰，灭火效果正常',
                fireSpreadMod: 1.0,
                waterEfficiencyMod: 1.0,
                visibilityMod: 1.0,
                windMod: 1.0,
                particles: null,
            },
            cloudy: {
                name: '多云',
                icon: '⛅',
                description: '天气凉爽，火势略微减缓',
                fireSpreadMod: 0.9,
                waterEfficiencyMod: 1.0,
                visibilityMod: 0.95,
                windMod: 0.8,
                particles: null,
            },
            rainy: {
                name: '雨天',
                icon: '🌧️',
                description: '雨水帮助灭火，但能见度降低',
                fireSpreadMod: 0.6,
                waterEfficiencyMod: 0.85, // 雨天水柱效果略微降低
                visibilityMod: 0.8,
                windMod: 1.2,
                particles: 'rain',
            },
            windy: {
                name: '大风',
                icon: '💨',
                description: '强风加速火势蔓延',
                fireSpreadMod: 1.5,
                waterEfficiencyMod: 0.7,
                visibilityMod: 0.9,
                windMod: 2.5,
                particles: 'leaves',
            },
            stormy: {
                name: '雷暴',
                icon: '⛈️',
                description: '雷电可能引发新火情！',
                fireSpreadMod: 1.2,
                waterEfficiencyMod: 0.8,
                visibilityMod: 0.7,
                windMod: 2.0,
                particles: 'rain',
                special: 'lightning',
            },
            snowy: {
                name: '暴风雪',
                icon: '❄️',
                description: '大雪严重降低能见度',
                fireSpreadMod: 0.4,
                waterEfficiencyMod: 0.6,
                visibilityMod: 0.5,
                windMod: 1.8,
                particles: 'snow',
            },
        };

        // 天气预报数据
        this.forecast = [];
        this.generateForecast();

        this.initParticles();
    }

    // 初始化粒子池
    initParticles() {
        for (let i = 0; i < 200; i++) {
            this.raindrops.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                speed: 8 + Math.random() * 4,
                length: 10 + Math.random() * 10,
            });

            this.snowflakes.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                speed: 1 + Math.random() * 2,
                size: 2 + Math.random() * 3,
                wobble: Math.random() * Math.PI * 2,
            });
        }
    }

    // 生成天气预报
    generateForecast() {
        this.forecast = [];
        const weatherTypes = Object.keys(this.weatherTypes);
        let currentWeather = this.currentWeather;

        for (let i = 0; i < 5; i++) {
            // 随机选择天气，但避免连续相同
            let nextWeather;
            do {
                nextWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            } while (nextWeather === currentWeather && Math.random() > 0.3);

            this.forecast.push({
                weather: nextWeather,
                time: `+${(i + 1) * 10}分钟`,
            });

            currentWeather = nextWeather;
        }
    }

    // 更新天气预报（每10秒）
    updateForecast() {
        this.forecast.shift();
        const weatherTypes = Object.keys(this.weatherTypes);
        let nextWeather;

        do {
            nextWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        } while (nextWeather === this.forecast[this.forecast.length - 1]?.weather && Math.random() > 0.3);

        this.forecast.push({
            weather: nextWeather,
            time: '+50分钟',
        });
    }

    // 设置天气
    setWeather(weatherType, instant = false) {
        if (!this.weatherTypes[weatherType]) {
            console.warn(`Unknown weather type: ${weatherType}`);
            return;
        }

        this.nextWeather = weatherType;

        if (instant) {
            this.currentWeather = weatherType;
            this.transitionProgress = 1;
        } else {
            this.transitionProgress = 0;
        }

        // 显示天气变化通知
        this.showWeatherNotification(weatherType);
    }

    // 更新天气
    update(deltaTime) {
        // 天气过渡
        if (this.nextWeather && this.transitionProgress < 1) {
            this.transitionProgress += deltaTime * 0.5; // 2秒过渡
            if (this.transitionProgress >= 1) {
                this.currentWeather = this.nextWeather;
                this.nextWeather = null;
                this.transitionProgress = 1;
            }
        }

        // 更新天气计时器
        this.weatherTimer += deltaTime;
        if (this.weatherTimer >= this.weatherChangeInterval) {
            this.weatherTimer = 0;
            // 天气自动变化
            if (this.forecast.length > 0) {
                this.setWeather(this.forecast[0].weather);
                this.updateForecast();
            }
        }

        // 更新粒子
        this.updateParticles(deltaTime);

        // 雷电效果
        if (this.currentWeather === 'stormy' || (this.nextWeather === 'stormy' && this.transitionProgress > 0.5)) {
            this.updateLightning(deltaTime);
        }

        // 天气对游戏的影响
        this.applyWeatherEffects();
    }

    // 更新粒子
    updateParticles(deltaTime) {
        const weather = this.weatherTypes[this.currentWeather];
        const particles = weather.particles;

        // 雨滴
        if (particles === 'rain') {
            const wind = this.getCurrentWind();
            this.raindrops.forEach(drop => {
                drop.y += drop.speed * (1 + this.transitionProgress * 0.5);
                drop.x += wind * 2;

                if (drop.y > 600) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * 800;
                }
                if (drop.x > 800) drop.x = 0;
                if (drop.x < 0) drop.x = 800;
            });
        }

        // 雪花
        if (particles === 'snow') {
            const wind = this.getCurrentWind();
            this.snowflakes.forEach(flake => {
                flake.y += flake.speed;
                flake.wobble += deltaTime * 2;
                flake.x += Math.sin(flake.wobble) * 0.5 + wind * 0.5;

                if (flake.y > 600) {
                    flake.y = -flake.size;
                    flake.x = Math.random() * 800;
                }
                if (flake.x > 800) flake.x = 0;
                if (flake.x < 0) flake.x = 800;
            });
        }
    }

    // 更新雷电
    updateLightning(deltaTime) {
        this.lightningTimer += deltaTime;

        // 随机闪电
        if (this.lightningTimer > 5 + Math.random() * 10) {
            this.lightningTimer = 0;
            this.lightningFlash = 0.3; // 闪白持续时间

            // 雷电可能引发新火
            if (Math.random() < 0.3 && this.game?.buildings?.length > 0) {
                const randomBuilding = this.game.buildings[Math.floor(Math.random() * this.game.buildings.length)];
                if (randomBuilding && !randomBuilding.isDestroyed()) {
                    this.game.fireSystem?.ignite(randomBuilding);
                    this.showLightningWarning();
                }
            }
        }

        if (this.lightningFlash > 0) {
            this.lightningFlash -= deltaTime;
        }
    }

    // 获取当前风力
    getCurrentWind() {
        const weather = this.weatherTypes[this.currentWeather];
        const baseWind = this.game?.levelData?.wind || 0;
        return baseWind * weather.windMod;
    }

    // 应用天气效果
    applyWeatherEffects() {
        if (!this.game) return;

        const weather = this.weatherTypes[this.currentWeather];

        // 调整火势蔓延速度
        if (this.game.fireSystem) {
            this.game.fireSystem.spreadModifier = weather.fireSpreadMod;
        }

        // 调整水量效率
        if (this.game.waterSystem) {
            this.game.waterSystem.efficiencyModifier = weather.waterEfficiencyMod;
        }
    }

    // 渲染天气
    render(ctx) {
        const weather = this.weatherTypes[this.currentWeather];
        const alpha = this.transitionProgress;

        // 雷电闪白效果
        if (this.lightningFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash})`;
            ctx.fillRect(0, 0, 800, 600);
        }

        // 雨天效果
        if (weather.particles === 'rain' && alpha > 0) {
            ctx.strokeStyle = `rgba(174, 194, 224, ${0.6 * alpha})`;
            ctx.lineWidth = 1;

            this.raindrops.forEach(drop => {
                const wind = this.getCurrentWind();
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + wind * 2, drop.y + drop.length);
                ctx.stroke();
            });
        }

        // 雪天效果
        if (weather.particles === 'snow' && alpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * alpha})`;

            this.snowflakes.forEach(flake => {
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // 多云效果
        if (this.currentWeather === 'cloudy' && alpha > 0) {
            this.renderClouds(ctx, alpha);
        }

        // 能见度降低
        if (weather.visibilityMod < 1) {
            const darkness = (1 - weather.visibilityMod) * 0.3 * alpha;
            ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
            ctx.fillRect(0, 0, 800, 600);
        }

        // 过渡天气效果
        if (this.nextWeather && this.transitionProgress < 1) {
            const nextWeatherData = this.weatherTypes[this.nextWeather];
            const nextAlpha = this.transitionProgress * 0.3;

            if (nextWeatherData.visibilityMod < 1) {
                ctx.fillStyle = `rgba(0, 0, 0, ${nextAlpha})`;
                ctx.fillRect(0, 0, 800, 600);
            }
        }
    }

    // 渲染云朵
    renderClouds(ctx, alpha) {
        ctx.fillStyle = `rgba(200, 200, 200, ${0.3 * alpha})`;

        // 简单的云朵
        const clouds = [
            { x: 100, y: 50, size: 40 },
            { x: 300, y: 80, size: 50 },
            { x: 500, y: 40, size: 45 },
            { x: 700, y: 70, size: 55 },
        ];

        clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.arc(cloud.x + 30, cloud.y - 10, cloud.size * 0.8, 0, Math.PI * 2);
            ctx.arc(cloud.x + 60, cloud.y, cloud.size * 0.9, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 显示天气通知
    showWeatherNotification(weatherType) {
        const weather = this.weatherTypes[weatherType];
        const notification = document.createElement('div');
        notification.className = 'weather-notification';
        notification.innerHTML = `
            <div class="weather-notification-content">
                <span class="weather-icon">${weather.icon}</span>
                <span class="weather-name">${weather.name}</span>
                <span class="weather-desc">${weather.description}</span>
            </div>
        `;

        document.getElementById('game-container').appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 显示雷电警告
    showLightningWarning() {
        const warning = document.createElement('div');
        warning.className = 'lightning-warning';
        warning.textContent = '⚡ 雷击引发新火情！';

        document.getElementById('game-container').appendChild(warning);

        setTimeout(() => {
            warning.classList.add('show');
        }, 100);

        setTimeout(() => {
            warning.classList.remove('show');
            setTimeout(() => warning.remove(), 300);
        }, 2000);
    }

    // 渲染天气UI
    renderWeatherUI(ctx) {
        const weather = this.weatherTypes[this.currentWeather];
        const x = 650;
        const y = 20;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, 130, 60);

        // 天气图标
        ctx.font = '24px Arial';
        ctx.fillText(weather.icon, x + 10, y + 25);

        // 天气名称
        ctx.font = '14px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(weather.name, x + 40, y + 22);

        // 效果描述
        ctx.font = '10px Arial';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(weather.description.substring(0, 10), x + 10, y + 45);
    }

    // 渲染天气预报
    renderForecastUI(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="forecast-header">
                <h3>🌤️ 天气预报</h3>
                <p class="forecast-subtitle">未来天气变化</p>
            </div>
            <div class="forecast-list">
                ${this.forecast.map((item, index) => {
                    const weather = this.weatherTypes[item.weather];
                    return `
                        <div class="forecast-item">
                            <span class="forecast-time">${item.time}</span>
                            <span class="forecast-icon">${weather.icon}</span>
                            <span class="forecast-weather">${weather.name}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="forecast-current">
                <h4>当前天气</h4>
                <div class="current-weather-info">
                    <span class="current-icon">${this.weatherTypes[this.currentWeather].icon}</span>
                    <span class="current-name">${this.weatherTypes[this.currentWeather].name}</span>
                </div>
            </div>
        `;
    }

    // 获取当前天气修正器
    getModifier(type) {
        const weather = this.weatherTypes[this.currentWeather];
        switch (type) {
            case 'fireSpread':
                return weather.fireSpreadMod;
            case 'waterEfficiency':
                return weather.waterEfficiencyMod;
            case 'visibility':
                return weather.visibilityMod;
            case 'wind':
                return weather.windMod;
            default:
                return 1.0;
        }
    }

    // 设置场景（配合战役模式）
    setScene(scene) {
        const sceneWeatherMap = {
            residential: 'sunny',
            chemical: 'cloudy',
            forest: 'sunny',
            skyscraper: 'cloudy',
            subway: 'cloudy',
        };

        this.setWeather(sceneWeatherMap[scene] || 'sunny', true);
    }

    // 重置
    reset() {
        this.currentWeather = 'sunny';
        this.weatherTimer = 0;
        this.lightningTimer = 0;
        this.lightningFlash = 0;
        this.nextWeather = null;
        this.transitionProgress = 1;
        this.generateForecast();
    }
}

// 天气选择菜单
export function showWeatherSelectionMenu(game) {
    const container = document.getElementById('weather-select');
    const grid = document.getElementById('weather-grid');

    if (!container || !grid) return;

    grid.innerHTML = '';

    const weatherTypes = [
        { id: 'sunny', name: '晴天', icon: '☀️', desc: '标准条件' },
        { id: 'rainy', name: '雨天', icon: '🌧️', desc: '火势减缓，能见度降低' },
        { id: 'windy', name: '大风', icon: '💨', desc: '火势加速蔓延' },
        { id: 'stormy', name: '雷暴', icon: '⛈️', desc: '雷电可能引火' },
        { id: 'snowy', name: '暴风雪', icon: '❄️', desc: '极低能见度' },
        { id: 'cloudy', name: '多云', icon: '⛅', desc: '略微减缓火势' },
    ];

    weatherTypes.forEach(weather => {
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.innerHTML = `
            <div class="weather-card-icon">${weather.icon}</div>
            <div class="weather-card-name">${weather.name}</div>
            <div class="weather-card-desc">${weather.desc}</div>
            <button class="weather-select-btn" data-weather="${weather.id}">选择</button>
        `;

        grid.appendChild(card);
    });

    // 绑定事件
    grid.querySelectorAll('.weather-select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const weatherId = e.target.dataset.weather;
            game.weatherSystem?.setWeather(weatherId, true);
            container.style.display = 'none';
        });
    });

    container.style.display = 'flex';
    document.getElementById('main-menu').style.display = 'none';
}
