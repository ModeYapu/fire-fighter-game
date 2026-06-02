/**
 * 战役模式测试
 * 测试章节/关卡/剧情系统
 */

// CampaignSystem - 战役模式系统类
class CampaignSystem {
  constructor(game) {
    this.game = game;
    this.currentChapter = 0;
    this.currentLevel = 0;
    this.unlockedChapters = [0];
    this.completedLevels = {};
    this.activeLevelId = null;

    this.chapters = [
      {
        id: 0,
        name: '第一章：居民区危机',
        icon: '🏘️',
        unlockCondition: null,
        levels: [
          { id: 'c1-1', name: '紧急出动', targetScore: 500 },
          { id: 'c1-2', name: '邻里互助', targetScore: 1200 },
          { id: 'c1-3', name: '社区大撤离', targetScore: 2000 },
        ],
      },
      {
        id: 1,
        name: '第二章：化工厂险情',
        icon: '🏭',
        unlockCondition: { chapter: 0, stars: 5 },
        levels: [
          { id: 'c2-1', name: '化学品泄漏', targetScore: 800 },
          { id: 'c2-2', name: '爆炸边缘', targetScore: 1500 },
          { id: 'c2-3', name: '全面封锁', targetScore: 2500 },
        ],
      },
      {
        id: 2,
        name: '第三章：森林大火',
        icon: '🌲',
        unlockCondition: { chapter: 1, stars: 7 },
        levels: [
          { id: 'c3-1', name: '林火初现', targetScore: 1000 },
          { id: 'c3-2', name: '火线推进', targetScore: 1800 },
          { id: 'c3-3', name: '生态救援', targetScore: 3000 },
        ],
      },
    ];
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('campaignProgress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveProgress(levelId, stars, score) {
    if (!this.completedLevels[levelId] || this.completedLevels[levelId].stars < stars) {
      this.completedLevels[levelId] = { stars, score, completed: true };
      localStorage.setItem('campaignProgress', JSON.stringify(this.completedLevels));
      this.checkChapterUnlocks();
    }
  }

  checkChapterUnlocks() {
    for (let i = 1; i < this.chapters.length; i++) {
      if (!this.unlockedChapters.includes(i)) {
        const chapter = this.chapters[i];
        if (this.meetsUnlockCondition(chapter.unlockCondition)) {
          this.unlockedChapters.push(i);
        }
      }
    }
  }

  meetsUnlockCondition(condition) {
    if (!condition) return true;

    let totalStars = 0;
    const prevChapter = this.chapters[condition.chapter];

    prevChapter.levels.forEach(level => {
      const progress = this.completedLevels[level.id];
      if (progress) totalStars += progress.stars;
    });

    return totalStars >= condition.stars;
  }

  getChapterStars(chapterIndex) {
    const chapter = this.chapters[chapterIndex];
    let total = 0;
    chapter.levels.forEach(level => {
      const progress = this.completedLevels[level.id];
      if (progress) total += progress.stars;
    });
    return total;
  }

  setActiveLevel(levelId) {
    this.activeLevelId = levelId;
  }

  onLevelComplete(stars, score) {
    if (this.activeLevelId) {
      this.saveProgress(this.activeLevelId, stars, score);
    }
  }

  isChapterUnlocked(chapterIndex) {
    return this.unlockedChapters.includes(chapterIndex);
  }

  isLevelUnlocked(chapterIndex, levelIndex) {
    const chapter = this.chapters[chapterIndex];
    if (!chapter) return false;
    if (levelIndex === 0) return this.isChapterUnlocked(chapterIndex);
    const prevLevel = chapter.levels[levelIndex - 1];
    return this.completedLevels[prevLevel.id]?.completed || false;
  }

  getLevelProgress(levelId) {
    return this.completedLevels[levelId] || null;
  }

  getTotalStars() {
    let total = 0;
    this.chapters.forEach(chapter => {
      chapter.levels.forEach(level => {
        const progress = this.completedLevels[level.id];
        if (progress) total += progress.stars;
      });
    });
    return total;
  }

  getCurrentLevel() {
    const chapter = this.chapters[this.currentChapter];
    return chapter ? chapter.levels[this.currentLevel] : null;
  }

  resetProgress() {
    this.completedLevels = {};
    this.unlockedChapters = [0];
    this.currentChapter = 0;
    this.currentLevel = 0;
    localStorage.removeItem('campaignProgress');
  }
}

describe('CampaignSystem', () => {
  let campaignSystem;
  let mockGame;

  beforeEach(() => {
    mockGame = {};
    campaignSystem = new CampaignSystem(mockGame);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('初始化', () => {
    test('应该正确初始化', () => {
      expect(campaignSystem.chapters.length).toBe(3);
      expect(campaignSystem.currentChapter).toBe(0);
      expect(campaignSystem.currentLevel).toBe(0);
    });

    test('第一章应该默认解锁', () => {
      expect(campaignSystem.isChapterUnlocked(0)).toBe(true);
    });

    test('其他章节应该默认锁定', () => {
      expect(campaignSystem.isChapterUnlocked(1)).toBe(false);
      expect(campaignSystem.isChapterUnlocked(2)).toBe(false);
    });
  });

  describe('关卡进度', () => {
    test('应该保存关卡进度', () => {
      campaignSystem.saveProgress('c1-1', 3, 1500);

      expect(campaignSystem.completedLevels['c1-1']).toEqual({
        stars: 3,
        score: 1500,
        completed: true,
      });
    });

    test('应该保存更高的星星数', () => {
      campaignSystem.saveProgress('c1-1', 2, 1000);
      campaignSystem.saveProgress('c1-1', 3, 1500);

      expect(campaignSystem.completedLevels['c1-1'].stars).toBe(3);
      expect(campaignSystem.completedLevels['c1-1'].score).toBe(1500);
    });

    test('不应该保存更低的星星数', () => {
      campaignSystem.saveProgress('c1-1', 3, 1500);
      campaignSystem.saveProgress('c1-1', 1, 800);

      expect(campaignSystem.completedLevels['c1-1'].stars).toBe(3);
      expect(campaignSystem.completedLevels['c1-1'].score).toBe(1500);
    });

    test('应该正确获取章节星星数', () => {
      campaignSystem.saveProgress('c1-1', 3, 1500);
      campaignSystem.saveProgress('c1-2', 2, 1200);
      campaignSystem.saveProgress('c1-3', 1, 1000);

      expect(campaignSystem.getChapterStars(0)).toBe(6);
    });

    test('应该正确计算总星星数', () => {
      campaignSystem.saveProgress('c1-1', 3, 1500);
      campaignSystem.saveProgress('c1-2', 2, 1200);
      campaignSystem.saveProgress('c2-1', 1, 800);

      expect(campaignSystem.getTotalStars()).toBe(6);
    });
  });

  describe('章节解锁', () => {
    test('有条件时第二章应该锁定', () => {
      expect(campaignSystem.isChapterUnlocked(1)).toBe(false);
    });

    test('获得足够星星后第二章应该解锁', () => {
      campaignSystem.saveProgress('c1-1', 2, 1000);
      campaignSystem.saveProgress('c1-2', 2, 1200);
      campaignSystem.saveProgress('c1-3', 1, 1000);

      campaignSystem.checkChapterUnlocks();

      expect(campaignSystem.isChapterUnlocked(1)).toBe(true);
    });

    test('星星不足时第二章不应解锁', () => {
      campaignSystem.saveProgress('c1-1', 1, 500);
      campaignSystem.saveProgress('c1-2', 1, 600);
      campaignSystem.saveProgress('c1-3', 1, 800);

      campaignSystem.checkChapterUnlocks();

      expect(campaignSystem.isChapterUnlocked(1)).toBe(false);
    });

    test('第三章解锁条件应该更高', () => {
      campaignSystem.saveProgress('c1-1', 3, 1500);
      campaignSystem.saveProgress('c1-2', 3, 1500);
      campaignSystem.saveProgress('c1-3', 3, 2500);

      campaignSystem.checkChapterUnlocks();

      expect(campaignSystem.isChapterUnlocked(1)).toBe(true);
      expect(campaignSystem.isChapterUnlocked(2)).toBe(false);
    });
  });

  describe('关卡解锁', () => {
    test('第一章第一关应该解锁', () => {
      expect(campaignSystem.isLevelUnlocked(0, 0)).toBe(true);
    });

    test('未完成前一关时下一关应该锁定', () => {
      expect(campaignSystem.isLevelUnlocked(0, 1)).toBe(false);
    });

    test('完成前一关后下一关应该解锁', () => {
      campaignSystem.saveProgress('c1-1', 1, 500);

      expect(campaignSystem.isLevelUnlocked(0, 1)).toBe(true);
    });

    test('章节锁定时关卡应该锁定', () => {
      expect(campaignSystem.isLevelUnlocked(1, 0)).toBe(false);
    });
  });

  describe('活动关卡', () => {
    test('应该设置活动关卡', () => {
      campaignSystem.setActiveLevel('c1-1');

      expect(campaignSystem.activeLevelId).toBe('c1-1');
    });

    test('完成活动关卡应该保存进度', () => {
      campaignSystem.setActiveLevel('c1-2');
      campaignSystem.onLevelComplete(2, 1200);

      expect(campaignSystem.completedLevels['c1-2']).toEqual({
        stars: 2,
        score: 1200,
        completed: true,
      });
    });

    test('获取当前关卡应该返回正确的关卡数据', () => {
      campaignSystem.currentChapter = 0;
      campaignSystem.currentLevel = 1;

      const level = campaignSystem.getCurrentLevel();

      expect(level).toEqual({
        id: 'c1-2',
        name: '邻里互助',
        targetScore: 1200,
      });
    });
  });

  describe('关卡进度查询', () => {
    test('未完成关卡应该返回null', () => {
      expect(campaignSystem.getLevelProgress('c1-1')).toBeNull();
    });

    test('已完成关卡应该返回进度数据', () => {
      campaignSystem.saveProgress('c1-1', 2, 1000);

      const progress = campaignSystem.getLevelProgress('c1-1');

      expect(progress).toEqual({
        stars: 2,
        score: 1000,
        completed: true,
      });
    });
  });

  describe('重置进度', () => {
    test('重置应该清除所有进度', () => {
      campaignSystem.saveProgress('c1-1', 3, 1500);
      campaignSystem.saveProgress('c1-2', 2, 1200);

      campaignSystem.resetProgress();

      expect(campaignSystem.completedLevels).toEqual({});
      expect(campaignSystem.unlockedChapters).toEqual([0]);
      expect(campaignSystem.currentChapter).toBe(0);
      expect(campaignSystem.currentLevel).toBe(0);
    });

    test('重置应该重新锁定所有章节', () => {
      campaignSystem.saveProgress('c1-1', 3, 1500);
      campaignSystem.saveProgress('c1-2', 3, 1500);
      campaignSystem.saveProgress('c1-3', 2, 1500);

      campaignSystem.checkChapterUnlocks();
      expect(campaignSystem.isChapterUnlocked(1)).toBe(true);

      campaignSystem.resetProgress();
      expect(campaignSystem.isChapterUnlocked(1)).toBe(false);
    });
  });

  describe('章节数据', () => {
    test('应该有正确数量的章节', () => {
      expect(campaignSystem.chapters.length).toBe(3);
    });

    test('每章应该有3关', () => {
      campaignSystem.chapters.forEach(chapter => {
        expect(chapter.levels.length).toBe(3);
      });
    });

    test('每关应该有唯一ID', () => {
      const levelIds = new Set();
      campaignSystem.chapters.forEach(chapter => {
        chapter.levels.forEach(level => {
          levelIds.add(level.id);
        });
      });

      expect(levelIds.size).toBe(9);
    });
  });

  describe('解锁条件', () => {
    test('无条件的章节应该总是满足', () => {
      const condition = null;
      expect(campaignSystem.meetsUnlockCondition(condition)).toBe(true);
    });

    test('正确检查星星条件', () => {
      const condition = { chapter: 0, stars: 5 };

      expect(campaignSystem.meetsUnlockCondition(condition)).toBe(false);

      campaignSystem.saveProgress('c1-1', 2, 1000);
      campaignSystem.saveProgress('c1-2', 2, 1200);
      campaignSystem.saveProgress('c1-3', 1, 1000);

      expect(campaignSystem.meetsUnlockCondition(condition)).toBe(true);
    });
  });

  describe('本地存储', () => {
    test('保存进度应该写入localStorage', () => {
      campaignSystem.saveProgress('c1-1', 3, 1500);

      const saved = localStorage.getItem('campaignProgress');
      expect(saved).toBeDefined();

      const parsed = JSON.parse(saved);
      expect(parsed['c1-1']).toEqual({
        stars: 3,
        score: 1500,
        completed: true,
      });
    });

    test('localStorage损坏时应该返回空对象', () => {
      localStorage.setItem('campaignProgress', 'invalid-json');

      const newSystem = new CampaignSystem(mockGame);
      expect(newSystem.completedLevels).toEqual({});
    });
  });
});
