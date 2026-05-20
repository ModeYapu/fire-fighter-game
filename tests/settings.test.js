/**
 * 设置系统测试
 * 测试难度切换、音量控制、画质选择
 */

// Mock constants
jest.mock('../src/utils/constants.js', () => ({
  STORAGE_KEYS: {
    SETTINGS: 'fireFighterSettings'
  }
}));

// SettingsSystem - 模拟设置系统类
class SettingsSystem {
  constructor(game) {
    this.game = game;
    this.settings = {
      // 游戏设置
      difficulty: 'normal',
      language: 'zh-CN',

      // 音频设置
      masterVolume: 80,
      musicVolume: 60,
      sfxVolume: 80,
      voiceVolume: 70,

      // 视觉设置
      quality: 'high',
      showFPS: false,
      showParticles: true,
      screenShake: true,
      animations: true,

      // 控制设置
      aimAssist: false,
      autoFire: false,
      mobileControls: true,

      // 辅助功能
      tutorial: true,
      hints: true,
      colorBlindMode: 'none'
    };

    this.difficultyPresets = {
      easy: {
        name: '简单',
        description: '适合新手玩家',
        modifiers: {
          fireSpreadRate: 0.5,
          damageRate: 0.5,
          waterRefillRate: 1.5,
          timeBonus: 1.5
        }
      },
      normal: {
        name: '正常',
        description: '标准游戏体验',
        modifiers: {
          fireSpreadRate: 1.0,
          damageRate: 1.0,
          waterRefillRate: 1.0,
          timeBonus: 1.0
        }
      },
      hard: {
        name: '困难',
        description: '给高手准备的挑战',
        modifiers: {
          fireSpreadRate: 1.5,
          damageRate: 1.3,
          waterRefillRate: 0.8,
          timeBonus: 0.8
        }
      },
      extreme: {
        name: '极限',
        description: '终极挑战',
        modifiers: {
          fireSpreadRate: 2.0,
          damageRate: 1.5,
          waterRefillRate: 0.5,
          timeBonus: 0.5
        }
      }
    };

    this.qualityPresets = {
      low: {
        name: '低',
        description: '最佳性能',
        particleCount: 0.3,
        shadowQuality: 0,
        effectQuality: 0.5
      },
      medium: {
        name: '中',
        description: '平衡模式',
        particleCount: 0.6,
        shadowQuality: 0.5,
        effectQuality: 0.7
      },
      high: {
        name: '高',
        description: '推荐设置',
        particleCount: 1.0,
        shadowQuality: 0.8,
        effectQuality: 1.0
      },
      ultra: {
        name: '超高',
        description: '最佳画质',
        particleCount: 1.5,
        shadowQuality: 1.0,
        effectQuality: 1.2
      }
    };
  }

  getSetting(key) {
    return this.settings[key];
  }

  setSetting(key, value) {
    const oldValue = this.settings[key];
    this.settings[key] = value;
    this.applySettings();
    return { success: true, oldValue, newValue: value };
  }

  setDifficulty(difficulty) {
    if (!this.difficultyPresets[difficulty]) {
      return { success: false, reason: '无效的难度设置' };
    }

    const oldDifficulty = this.settings.difficulty;
    this.settings.difficulty = difficulty;
    this.applyDifficulty();
    this.saveSettings();
    return { success: true, oldDifficulty, newDifficulty: difficulty };
  }

  getDifficulty() {
    return this.settings.difficulty;
  }

  getDifficultyPreset(difficulty) {
    return this.difficultyPresets[difficulty] || this.difficultyPresets.normal;
  }

  applyDifficulty() {
    if (!this.game) return;

    const preset = this.getDifficultyPreset(this.settings.difficulty);
    const modifiers = preset.modifiers;

    this.game.difficultyModifiers = modifiers;
    this.game.currentDifficulty = this.settings.difficulty;
  }

  setVolume(type, value) {
    if (value < 0 || value > 100) {
      return { success: false, reason: '音量值必须在0-100之间' };
    }

    const validTypes = ['master', 'music', 'sfx', 'voice'];
    if (!validTypes.includes(type)) {
      return { success: false, reason: '无效的音量类型' };
    }

    const key = `${type}Volume`;
    const oldValue = this.settings[key];
    this.settings[key] = value;
    this.applyAudioSettings();
    this.saveSettings();
    return { success: true, oldValue, newValue: value };
  }

  getVolume(type) {
    return this.settings[`${type}Volume`] || 0;
  }

  applyAudioSettings() {
    if (this.game && this.game.enhancedAudio) {
      this.game.enhancedAudio.setVolume('master', this.settings.masterVolume / 100);
      this.game.enhancedAudio.setVolume('music', this.settings.musicVolume / 100);
      this.game.enhancedAudio.setVolume('sfx', this.settings.sfxVolume / 100);
    }
  }

  setQuality(quality) {
    if (!this.qualityPresets[quality]) {
      return { success: false, reason: '无效的画质设置' };
    }

    const oldQuality = this.settings.quality;
    this.settings.quality = quality;
    this.applyQuality();
    this.saveSettings();
    return { success: true, oldQuality, newQuality: quality };
  }

  getQuality() {
    return this.settings.quality;
  }

  getQualityPreset(quality) {
    return this.qualityPresets[quality] || this.qualityPresets.high;
  }

  applyQuality() {
    if (!this.game) return;

    const preset = this.getQualityPreset(this.settings.quality);

    this.game.qualitySettings = {
      particleCount: preset.particleCount,
      shadowQuality: preset.shadowQuality,
      effectQuality: preset.effectQuality
    };

    if (this.game.optimizer) {
      this.game.optimizer.setQuality(preset);
    }
  }

  toggleSetting(key) {
    if (typeof this.settings[key] !== 'boolean') {
      return { success: false, reason: '该设置不是开关类型' };
    }

    const oldValue = this.settings[key];
    this.settings[key] = !oldValue;
    this.applySettings();
    return { success: true, oldValue, newValue: this.settings[key] };
  }

  resetToDefaults() {
    const defaults = {
      difficulty: 'normal',
      language: 'zh-CN',
      masterVolume: 80,
      musicVolume: 60,
      sfxVolume: 80,
      voiceVolume: 70,
      quality: 'high',
      showFPS: false,
      showParticles: true,
      screenShake: true,
      animations: true,
      aimAssist: false,
      autoFire: false,
      mobileControls: true,
      tutorial: true,
      hints: true,
      colorBlindMode: 'none'
    };

    this.settings = { ...defaults };
    this.applySettings();
    this.saveSettings();
    return { success: true };
  }

  applySettings() {
    this.applyDifficulty();
    this.applyAudioSettings();
    this.applyQuality();
  }

  saveSettings() {
    // Mock save
  }

  loadSettings() {
    // Mock load
  }

  getAllSettings() {
    return { ...this.settings };
  }

  renderSettingsUI(container) {
    // Mock render
  }

  exportSettings() {
    return JSON.stringify(this.settings);
  }

  importSettings(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.settings = { ...this.settings, ...imported };
      this.applySettings();
      return { success: true };
    } catch (e) {
      return { success: false, reason: '无效的设置数据' };
    }
  }
}

describe('SettingsSystem', () => {
  let settingsSystem;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      difficultyModifiers: {},
      currentDifficulty: 'normal',
      qualitySettings: {},
      optimizer: {
        setQuality: jest.fn()
      },
      enhancedAudio: {
        setVolume: jest.fn()
      }
    };

    settingsSystem = new SettingsSystem(mockGame);
  });

  test('应该正确初始化', () => {
    expect(settingsSystem.settings.difficulty).toBe('normal');
    expect(settingsSystem.settings.quality).toBe('high');
    expect(settingsSystem.settings.masterVolume).toBe(80);
  });

  test('getSetting 应该返回正确值', () => {
    expect(settingsSystem.getSetting('difficulty')).toBe('normal');
    expect(settingsSystem.getSetting('masterVolume')).toBe(80);
  });

  test('setSetting 应该更新设置值', () => {
    const result = settingsSystem.setSetting('masterVolume', 50);

    expect(result.success).toBe(true);
    expect(settingsSystem.settings.masterVolume).toBe(50);
  });

  test('setSetting 应该返回旧值和新值', () => {
    const result = settingsSystem.setSetting('quality', 'ultra');

    expect(result.oldValue).toBe('high');
    expect(result.newValue).toBe('ultra');
  });

  test('应该有4种难度选项', () => {
    const difficulties = Object.keys(settingsSystem.difficultyPresets);
    expect(difficulties).toContain('easy');
    expect(difficulties).toContain('normal');
    expect(difficulties).toContain('hard');
    expect(difficulties).toContain('extreme');
    expect(difficulties.length).toBe(4);
  });

  test('setDifficulty 应该正确切换难度', () => {
    const result = settingsSystem.setDifficulty('hard');

    expect(result.success).toBe(true);
    expect(settingsSystem.settings.difficulty).toBe('hard');
  });

  test('setDifficulty 无效难度应该失败', () => {
    const result = settingsSystem.setDifficulty('invalid');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('无效的难度设置');
  });

  test('getDifficulty 应该返回当前难度', () => {
    settingsSystem.setDifficulty('easy');

    expect(settingsSystem.getDifficulty()).toBe('easy');
  });

  test('getDifficultyPreset 应该返回难度预设', () => {
    const preset = settingsSystem.getDifficultyPreset('hard');

    expect(preset.name).toBe('困难');
    expect(preset.modifiers.fireSpreadRate).toBe(1.5);
  });

  test('applyDifficulty 应该应用到游戏', () => {
    settingsSystem.setDifficulty('extreme');

    expect(mockGame.difficultyModifiers.fireSpreadRate).toBe(2.0);
    expect(mockGame.currentDifficulty).toBe('extreme');
  });

  test('应该有4种画质选项', () => {
    const qualities = Object.keys(settingsSystem.qualityPresets);
    expect(qualities).toContain('low');
    expect(qualities).toContain('medium');
    expect(qualities).toContain('high');
    expect(qualities).toContain('ultra');
    expect(qualities.length).toBe(4);
  });

  test('setQuality 应该正确切换画质', () => {
    const result = settingsSystem.setQuality('medium');

    expect(result.success).toBe(true);
    expect(settingsSystem.settings.quality).toBe('medium');
  });

  test('setQuality 无效画质应该失败', () => {
    const result = settingsSystem.setQuality('invalid');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('无效的画质设置');
  });

  test('getQuality 应该返回当前画质', () => {
    settingsSystem.setQuality('ultra');

    expect(settingsSystem.getQuality()).toBe('ultra');
  });

  test('getQualityPreset 应该返回画质预设', () => {
    const preset = settingsSystem.getQualityPreset('ultra');

    expect(preset.name).toBe('超高');
    expect(preset.particleCount).toBe(1.5);
  });

  test('applyQuality 应该应用到游戏', () => {
    settingsSystem.setQuality('low');

    expect(mockGame.qualitySettings.particleCount).toBe(0.3);
    expect(mockGame.optimizer.setQuality).toHaveBeenCalled();
  });

  test('setVolume 应该正确设置音量', () => {
    const result = settingsSystem.setVolume('master', 100);

    expect(result.success).toBe(true);
    expect(settingsSystem.settings.masterVolume).toBe(100);
  });

  test('setVolume 超出范围应该失败', () => {
    const result1 = settingsSystem.setVolume('master', -1);
    const result2 = settingsSystem.setVolume('master', 101);

    expect(result1.success).toBe(false);
    expect(result2.success).toBe(false);
  });

  test('setVolume 无效类型应该失败', () => {
    const result = settingsSystem.setVolume('invalid', 50);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('无效的音量类型');
  });

  test('getVolume 应该返回正确音量', () => {
    expect(settingsSystem.getVolume('master')).toBe(80);
    expect(settingsSystem.getVolume('music')).toBe(60);
  });

  test('toggleSetting 应该切换布尔值设置', () => {
    const result = settingsSystem.toggleSetting('showFPS');

    expect(result.success).toBe(true);
    expect(settingsSystem.settings.showFPS).toBe(true);
  });

  test('toggleSetting 非布尔值应该失败', () => {
    const result = settingsSystem.toggleSetting('difficulty');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('该设置不是开关类型');
  });

  test('toggleSetting 再次切换应该复原', () => {
    settingsSystem.toggleSetting('showFPS');
    settingsSystem.toggleSetting('showFPS');

    expect(settingsSystem.settings.showFPS).toBe(false);
  });

  test('resetToDefaults 应该重置所有设置', () => {
    settingsSystem.setSetting('difficulty', 'extreme');
    settingsSystem.setSetting('masterVolume', 100);
    settingsSystem.toggleSetting('showFPS');

    settingsSystem.resetToDefaults();

    expect(settingsSystem.settings.difficulty).toBe('normal');
    expect(settingsSystem.settings.masterVolume).toBe(80);
    expect(settingsSystem.settings.showFPS).toBe(false);
  });

  test('getAllSettings 应该返回所有设置的副本', () => {
    const allSettings = settingsSystem.getAllSettings();

    expect(allSettings.difficulty).toBe('normal');
    allSettings.difficulty = 'modified';

    expect(settingsSystem.settings.difficulty).toBe('normal');
  });

  test('exportSettings 应该返回JSON字符串', () => {
    const exported = settingsSystem.exportSettings();

    expect(typeof exported).toBe('string');

    const parsed = JSON.parse(exported);
    expect(parsed.difficulty).toBe('normal');
  });

  test('importSettings 应该正确导入设置', () => {
    const json = JSON.stringify({
      difficulty: 'hard',
      masterVolume: 100,
      quality: 'ultra'
    });

    const result = settingsSystem.importSettings(json);

    expect(result.success).toBe(true);
    expect(settingsSystem.settings.difficulty).toBe('hard');
    expect(settingsSystem.settings.masterVolume).toBe(100);
    expect(settingsSystem.settings.quality).toBe('ultra');
  });

  test('importSettings 无效JSON应该失败', () => {
    const result = settingsSystem.importSettings('invalid json');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('无效的设置数据');
  });

  test('困难难度应该增加火焰蔓延率', () => {
    const easy = settingsSystem.getDifficultyPreset('easy');
    const hard = settingsSystem.getDifficultyPreset('hard');

    expect(hard.modifiers.fireSpreadRate).toBeGreaterThan(easy.modifiers.fireSpreadRate);
  });

  test('极限难度应该有最高的火焰蔓延率', () => {
    const extreme = settingsSystem.getDifficultyPreset('extreme');

    expect(extreme.modifiers.fireSpreadRate).toBe(2.0);
  });

  test('简单难度应该增加补水速率', () => {
    const preset = settingsSystem.getDifficultyPreset('easy');

    expect(preset.modifiers.waterRefillRate).toBe(1.5);
  });

  test('极限难度应该降低补水速率', () => {
    const preset = settingsSystem.getDifficultyPreset('extreme');

    expect(preset.modifiers.waterRefillRate).toBe(0.5);
  });

  test('超高画质应该增加粒子数量', () => {
    const low = settingsSystem.getQualityPreset('low');
    const ultra = settingsSystem.getQualityPreset('ultra');

    expect(ultra.particleCount).toBeGreaterThan(low.particleCount);
  });

  test('低画质应该关闭阴影', () => {
    const preset = settingsSystem.getQualityPreset('low');

    expect(preset.shadowQuality).toBe(0);
  });

  test('超高画质应该有完整阴影', () => {
    const preset = settingsSystem.getQualityPreset('ultra');

    expect(preset.shadowQuality).toBe(1.0);
  });

  test('applyAudioSettings 应该调用音频系统', () => {
    settingsSystem.setVolume('music', 75);

    expect(mockGame.enhancedAudio.setVolume).toHaveBeenCalledWith('music', 0.75);
  });

  test('应该支持4种音量类型', () => {
    expect(settingsSystem.getVolume('master')).toBeDefined();
    expect(settingsSystem.getVolume('music')).toBeDefined();
    expect(settingsSystem.getVolume('sfx')).toBeDefined();
    expect(settingsSystem.getVolume('voice')).toBeDefined();
  });

  test('默认语言应该是中文', () => {
    expect(settingsSystem.settings.language).toBe('zh-CN');
  });

  test('默认应该启用教程和提示', () => {
    expect(settingsSystem.settings.tutorial).toBe(true);
    expect(settingsSystem.settings.hints).toBe(true);
  });

  test('默认应该启用粒子效果', () => {
    expect(settingsSystem.settings.showParticles).toBe(true);
  });

  test('默认应该启用屏幕震动', () => {
    expect(settingsSystem.settings.screenShake).toBe(true);
  });

  test('色盲模式默认应该是关闭', () => {
    expect(settingsSystem.settings.colorBlindMode).toBe('none');
  });
});
