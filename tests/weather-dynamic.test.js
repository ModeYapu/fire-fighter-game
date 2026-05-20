/**
 * 动态天气系统测试
 * 测试天气变化/影响逻辑
 */

// WeatherSystem - 动态天气系统类
class WeatherSystem {
  constructor(game) {
    this.game = game;
    this.currentWeather = 'sunny';
    this.weatherIntensity = 0.5;
    this.weatherTimer = 0;
    this.weatherChangeInterval = 60;
    this.nextWeather = null;
    this.transitionProgress = 0;
    this.lightningTimer = 0;
    this.lightningFlash = 0;
    this.forecast = [];

    this.weatherTypes = {
      sunny: {
        name: '晴天',
        icon: '☀️',
        fireSpreadMod: 1.0,
        waterEfficiencyMod: 1.0,
        visibilityMod: 1.0,
        windMod: 1.0,
        particles: null,
      },
      cloudy: {
        name: '多云',
        icon: '⛅',
        fireSpreadMod: 0.9,
        waterEfficiencyMod: 1.0,
        visibilityMod: 0.95,
        windMod: 0.8,
        particles: null,
      },
      rainy: {
        name: '雨天',
        icon: '🌧️',
        fireSpreadMod: 0.6,
        waterEfficiencyMod: 0.85,
        visibilityMod: 0.8,
        windMod: 1.2,
        particles: 'rain',
      },
      windy: {
        name: '大风',
        icon: '💨',
        fireSpreadMod: 1.5,
        waterEfficiencyMod: 0.7,
        visibilityMod: 0.9,
        windMod: 2.5,
        particles: 'leaves',
      },
      stormy: {
        name: '雷暴',
        icon: '⛈️',
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
        fireSpreadMod: 0.4,
        waterEfficiencyMod: 0.6,
        visibilityMod: 0.5,
        windMod: 1.8,
        particles: 'snow',
      },
    };

    this.generateForecast();
  }

  generateForecast() {
    this.forecast = [];
    const weatherTypes = Object.keys(this.weatherTypes);
    let currentWeather = this.currentWeather;

    for (let i = 0; i < 5; i++) {
      let nextWeather;
      do {
        nextWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      } while (nextWeather === currentWeather && Math.random() > 0.3);

      this.forecast.push({ weather: nextWeather, time: `+${(i + 1) * 10}分钟` });
      currentWeather = nextWeather;
    }
  }

  updateForecast() {
    this.forecast.shift();
    const weatherTypes = Object.keys(this.weatherTypes);
    let nextWeather;

    do {
      nextWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    } while (nextWeather === this.forecast[this.forecast.length - 1]?.weather && Math.random() > 0.3);

    this.forecast.push({ weather: nextWeather, time: '+50分钟' });
  }

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
  }

  update(deltaTime) {
    if (this.nextWeather && this.transitionProgress < 1) {
      this.transitionProgress += deltaTime * 0.5;
      if (this.transitionProgress >= 1) {
        this.currentWeather = this.nextWeather;
        this.nextWeather = null;
        this.transitionProgress = 1;
      }
    }

    this.weatherTimer += deltaTime;
    if (this.weatherTimer >= this.weatherChangeInterval) {
      this.weatherTimer = 0;
      if (this.forecast.length > 0) {
        this.setWeather(this.forecast[0].weather);
        this.updateForecast();
      }
    }

    if (this.currentWeather === 'stormy' || (this.nextWeather === 'stormy' && this.transitionProgress > 0.5)) {
      this.updateLightning(deltaTime);
    }
  }

  updateLightning(deltaTime) {
    this.lightningTimer += deltaTime;

    if (this.lightningTimer > 5 + Math.random() * 10) {
      this.lightningTimer = 0;
      this.lightningFlash = 0.3;
    }

    if (this.lightningFlash > 0) {
      this.lightningFlash -= deltaTime;
    }
  }

  getCurrentWind() {
    const weather = this.weatherTypes[this.currentWeather];
    const baseWind = this.game?.levelData?.wind || 0;
    return baseWind * weather.windMod;
  }

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

  isTransitioning() {
    return this.nextWeather !== null && this.transitionProgress < 1;
  }

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

describe('WeatherSystem', () => {
  let weatherSystem;
  let mockGame;

  beforeEach(() => {
    mockGame = { levelData: { wind: 1 } };
    weatherSystem = new WeatherSystem(mockGame);
  });

  describe('初始化', () => {
    test('应该正确初始化为晴天', () => {
      expect(weatherSystem.currentWeather).toBe('sunny');
    });

    test('应该初始化天气预报', () => {
      expect(weatherSystem.forecast.length).toBe(5);
    });

    test('应该有所有天气类型', () => {
      const weatherTypes = Object.keys(weatherSystem.weatherTypes);
      expect(weatherTypes).toContain('sunny');
      expect(weatherTypes).toContain('rainy');
      expect(weatherTypes).toContain('windy');
      expect(weatherTypes).toContain('stormy');
      expect(weatherTypes).toContain('snowy');
      expect(weatherTypes).toContain('cloudy');
    });
  });

  describe('天气设置', () => {
    test('应该能设置天气', () => {
      weatherSystem.setWeather('rainy', true);

      expect(weatherSystem.currentWeather).toBe('rainy');
    });

    test('立即切换天气应该完成过渡', () => {
      weatherSystem.setWeather('windy', true);

      expect(weatherSystem.transitionProgress).toBe(1);
      expect(weatherSystem.currentWeather).toBe('windy');
    });

    test('渐进切换天气应该开始过渡', () => {
      weatherSystem.setWeather('snowy');

      expect(weatherSystem.nextWeather).toBe('snowy');
      expect(weatherSystem.transitionProgress).toBe(0);
    });

    test('设置未知天气应该失败', () => {
      weatherSystem.setWeather('unknown');

      expect(weatherSystem.currentWeather).toBe('sunny');
    });
  });

  describe('天气过渡', () => {
    test('应该正确更新过渡进度', () => {
      weatherSystem.setWeather('rainy');
      weatherSystem.update(1);

      expect(weatherSystem.transitionProgress).toBe(0.5);
    });

    test('过渡完成应该切换天气', () => {
      weatherSystem.setWeather('windy');
      weatherSystem.update(2.1);

      expect(weatherSystem.currentWeather).toBe('windy');
      expect(weatherSystem.nextWeather).toBeNull();
    });

    test('isTransitioning 应该返回正确的状态', () => {
      expect(weatherSystem.isTransitioning()).toBe(false);

      weatherSystem.setWeather('rainy');
      expect(weatherSystem.isTransitioning()).toBe(true);

      weatherSystem.update(2.1);
      expect(weatherSystem.isTransitioning()).toBe(false);
    });
  });

  describe('天气修正器', () => {
    test('晴天应该有标准修正器', () => {
      weatherSystem.setWeather('sunny', true);

      expect(weatherSystem.getModifier('fireSpread')).toBe(1.0);
      expect(weatherSystem.getModifier('waterEfficiency')).toBe(1.0);
      expect(weatherSystem.getModifier('visibility')).toBe(1.0);
    });

    test('雨天应该降低火势蔓延', () => {
      weatherSystem.setWeather('rainy', true);

      expect(weatherSystem.getModifier('fireSpread')).toBe(0.6);
    });

    test('雨天应该降低水效', () => {
      weatherSystem.setWeather('rainy', true);

      expect(weatherSystem.getModifier('waterEfficiency')).toBe(0.85);
    });

    test('大风应该增加火势蔓延', () => {
      weatherSystem.setWeather('windy', true);

      expect(weatherSystem.getModifier('fireSpread')).toBe(1.5);
    });

    test('大风应该降低水效', () => {
      weatherSystem.setWeather('windy', true);

      expect(weatherSystem.getModifier('waterEfficiency')).toBe(0.7);
    });

    test('暴风雪应该大幅降低能见度', () => {
      weatherSystem.setWeather('snowy', true);

      expect(weatherSystem.getModifier('visibility')).toBe(0.5);
    });

    test('暴风雪应该大幅降低火势', () => {
      weatherSystem.setWeather('snowy', true);

      expect(weatherSystem.getModifier('fireSpread')).toBe(0.4);
    });

    test('雷暴应该有中等火势增加', () => {
      weatherSystem.setWeather('stormy', true);

      expect(weatherSystem.getModifier('fireSpread')).toBe(1.2);
    });
  });

  describe('风力计算', () => {
    test('晴天应该使用基础风力', () => {
      weatherSystem.setWeather('sunny', true);

      expect(weatherSystem.getCurrentWind()).toBe(1);
    });

    test('大风应该增加风力', () => {
      weatherSystem.setWeather('windy', true);

      expect(weatherSystem.getCurrentWind()).toBe(2.5);
    });

    test('无游戏对象时应该返回0', () => {
      weatherSystem.game = null;
      weatherSystem.setWeather('windy', true);

      expect(weatherSystem.getCurrentWind()).toBe(0);
    });
  });

  describe('天气预报', () => {
    test('应该生成5条预报', () => {
      expect(weatherSystem.forecast.length).toBe(5);
    });

    test('更新预报应该移除第一条并添加新条目', () => {
      const firstItem = weatherSystem.forecast[0];
      const originalLength = weatherSystem.forecast.length;

      weatherSystem.updateForecast();

      expect(weatherSystem.forecast.length).toBe(originalLength);
      expect(weatherSystem.forecast[0]).not.toBe(firstItem);
    });

    test('预报应该有天气类型', () => {
      weatherSystem.forecast.forEach(item => {
        expect(item.weather).toBeDefined();
        expect(Object.keys(weatherSystem.weatherTypes)).toContain(item.weather);
      });
    });
  });

  describe('自动天气变化', () => {
    test('达到间隔时间后应该自动变化天气', () => {
      weatherSystem.weatherTimer = 0;
      const forecastWeather = weatherSystem.forecast[0].weather;

      weatherSystem.update(60);

      expect(weatherSystem.nextWeather).toBe(forecastWeather);
    });

    test('变化后应该更新预报', () => {
      weatherSystem.weatherTimer = 0;
      const originalLength = weatherSystem.forecast.length;

      weatherSystem.update(60);

      expect(weatherSystem.forecast.length).toBe(originalLength);
    });
  });

  describe('雷电效果', () => {
    test('雷暴天气应该更新雷电计时器', () => {
      weatherSystem.setWeather('stormy', true);
      const initialTimer = weatherSystem.lightningTimer;

      weatherSystem.update(1);

      expect(weatherSystem.lightningTimer).toBeGreaterThan(initialTimer);
    });

    test('非雷暴天气不应触发雷电', () => {
      weatherSystem.setWeather('sunny', true);
      weatherSystem.lightningTimer = 15;
      weatherSystem.lightningFlash = 0.3;

      weatherSystem.update(1);

      // 非雷暴天气时，update不会调用updateLightning，所以值不变
      expect(weatherSystem.lightningTimer).toBe(15);
    });

    test('雷电闪光应该随时间衰减', () => {
      weatherSystem.lightningFlash = 0.3;

      weatherSystem.updateLightning(0.1);

      expect(weatherSystem.lightningFlash).toBeLessThan(0.3);
    });
  });

  describe('场景设置', () => {
    test('居民区场景应该设置晴天', () => {
      weatherSystem.setScene('residential');

      expect(weatherSystem.currentWeather).toBe('sunny');
    });

    test('化工厂场景应该设置多云', () => {
      weatherSystem.setScene('chemical');

      expect(weatherSystem.currentWeather).toBe('cloudy');
    });

    test('未知场景应该设置晴天', () => {
      weatherSystem.setScene('unknown');

      expect(weatherSystem.currentWeather).toBe('sunny');
    });

    test('场景设置应该立即完成', () => {
      weatherSystem.setScene('forest');

      expect(weatherSystem.transitionProgress).toBe(1);
    });
  });

  describe('重置', () => {
    test('重置应该恢复默认状态', () => {
      weatherSystem.setWeather('rainy');
      weatherSystem.weatherTimer = 30;
      weatherSystem.lightningFlash = 0.2;

      weatherSystem.reset();

      expect(weatherSystem.currentWeather).toBe('sunny');
      expect(weatherSystem.weatherTimer).toBe(0);
      expect(weatherSystem.lightningFlash).toBe(0);
      expect(weatherSystem.nextWeather).toBeNull();
    });

    test('重置应该重新生成预报', () => {
      const originalForecast = weatherSystem.forecast;

      weatherSystem.reset();

      expect(weatherSystem.forecast).toBeDefined();
      expect(weatherSystem.forecast.length).toBe(5);
    });
  });

  describe('天气类型配置', () => {
    test('所有天气应该有必需的属性', () => {
      Object.entries(weatherSystem.weatherTypes).forEach(([key, weather]) => {
        expect(weather.name).toBeDefined();
        expect(weather.icon).toBeDefined();
        expect(weather.fireSpreadMod).toBeDefined();
        expect(weather.waterEfficiencyMod).toBeDefined();
        expect(weather.visibilityMod).toBeDefined();
        expect(weather.windMod).toBeDefined();
      });
    });

    test('修正器应该在合理范围内', () => {
      Object.values(weatherSystem.weatherTypes).forEach(weather => {
        expect(weather.fireSpreadMod).toBeGreaterThan(0);
        expect(weather.waterEfficiencyMod).toBeGreaterThan(0);
        expect(weather.visibilityMod).toBeGreaterThan(0);
        expect(weather.visibilityMod).toBeLessThanOrEqual(1);
        expect(weather.windMod).toBeGreaterThan(0);
      });
    });
  });
});
