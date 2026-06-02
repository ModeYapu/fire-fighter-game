/**
 * 社交系统测试
 */
describe('SocialSystem', () => {
  let socialSystem;
  let mockGame;
  let mockCanvas;
  beforeEach(() => {
    // 创建 mock canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    // 创建 mock game
    mockGame = {
      canvas: mockCanvas,
      onDailyChallengeStart: jest.fn()
    };
    const { SocialSystem } = require('../js/social.js');
    socialSystem = new SocialSystem(mockGame);

    // 清除 localStorage
    localStorage.clear();

    // 清空排行榜和其他数组
    socialSystem.leaderboard = [];
    socialSystem.friends = [];
    socialSystem.friendLeaderboard = [];
    socialSystem.shareHistory = [];
    socialSystem.unlockedAchievements = [];
    socialSystem.playerStats = {
      totalGames: 0,
      totalScore: 0,
      totalFiresExtinguished: 0,
      bestScore: 0,
      averageScore: 0,
      gamesWon: 0,
      winRate: 0
    };
  });

  // ===== 每日挑战测试 =====
  describe('每日挑战', () => {
    test('应该获取每日挑战', () => {
      const challenge = socialSystem.getDailyChallenge();
      expect(challenge).toBeDefined();
      expect(challenge.date).toBeDefined();
      expect(challenge.seed).toBeDefined();
      expect(challenge.config).toBeDefined();
      expect(challenge.globalStats).toBeDefined();
      expect(challenge.rewards).toBeDefined();
    });
    test('同一天的挑战应该是相同的', () => {
      const challenge1 = socialSystem.getDailyChallenge();
      const challenge2 = socialSystem.getDailyChallenge();
      expect(challenge1.date).toBe(challenge2.date);
      expect(challenge1.seed).toBe(challenge2.seed);
      expect(challenge1.config).toEqual(challenge2.config);
    });
    test('应该包含随机配置', () => {
      const challenge = socialSystem.getDailyChallenge();
      expect(challenge.config.fireCount).toBeGreaterThanOrEqual(8);
      expect(challenge.config.fireCount).toBeLessThan(20);
      expect(challenge.config.buildingCount).toBeGreaterThanOrEqual(5);
      expect(challenge.config.buildingCount).toBeLessThan(11);
      expect(challenge.config.timeLimit).toBeGreaterThanOrEqual(90);
      expect(challenge.config.timeLimit).toBeLessThan(150);
    });
    test('应该包含全球统计', () => {
      const challenge = socialSystem.getDailyChallenge();
      expect(challenge.globalStats.totalAttempts).toBeGreaterThan(0);
      expect(challenge.globalStats.completedCount).toBeGreaterThan(0);
      expect(challenge.globalStats.averageScore).toBeGreaterThan(0);
      expect(challenge.globalStats.topScore).toBeGreaterThanOrEqual(challenge.globalStats.averageScore);
    });
    test('应该开始每日挑战', () => {
      const challenge = socialSystem.startDailyChallenge();
      expect(challenge).toBeDefined();
      expect(mockGame.onDailyChallengeStart).toHaveBeenCalledWith(challenge);
    });
    test('应该完成每日挑战', () => {
      socialSystem.getDailyChallenge();
      const result = socialSystem.completeDailyChallenge(1500, 75);
      expect(result).toBeDefined();
      expect(result.score).toBe(1500);
      expect(result.time).toBe(75);
      expect(result.globalRank).toBeDefined();
      expect(result.percentile).toBeGreaterThan(0);
      expect(result.percentile).toBeLessThanOrEqual(100);
    });
    test('完成挑战应该保存最佳成绩', () => {
      socialSystem.getDailyChallenge();
      socialSystem.completeDailyChallenge(1000, 60);
      const result2 = socialSystem.completeDailyChallenge(1500, 50);
      expect(socialSystem.dailyChallengeBest.score).toBe(1500);
      expect(socialSystem.dailyChallengeBest).toBe(result2);
    });
    test('较低分数不应该覆盖最佳成绩', () => {
      socialSystem.getDailyChallenge();
      socialSystem.completeDailyChallenge(1500, 50);
      socialSystem.completeDailyChallenge(1000, 60);
      expect(socialSystem.dailyChallengeBest.score).toBe(1500);
    });
    test('应该估算全球排名', () => {
      const challenge = socialSystem.getDailyChallenge();
      const rank = socialSystem.estimateGlobalRank(1500, challenge);
      expect(rank.rank).toBeGreaterThan(0);
      expect(rank.total).toBeGreaterThan(0);
      expect(rank.percentile).toBeGreaterThan(0);
      expect(rank.percentile).toBeLessThanOrEqual(100);
    });
    test('较高分数应该有更好的排名', () => {
      const challenge = socialSystem.getDailyChallenge();
      const rank1 = socialSystem.estimateGlobalRank(1000, challenge);
      const rank2 = socialSystem.estimateGlobalRank(2000, challenge);
      expect(rank2.percentile).toBeLessThan(rank1.percentile); // 更小的百分位数表示更好的排名
    });
  });

  // ===== 排行榜测试 =====
  describe('排行榜', () => {
    test('应该添加记录到排行榜', () => {
      const entry = {
        score: 1000,
        level: 1,
        time: 60,
        firesExtinguished: 10
      };
      const rank = socialSystem.addToLeaderboard(entry);
      expect(socialSystem.leaderboard.length).toBe(1);
      expect(rank).toBe(1); // 第一名
      expect(socialSystem.leaderboard[0].score).toBe(1000);
    });
    test('排行榜应该按分数排序', () => {
      socialSystem.addToLeaderboard({
        score: 1000,
        level: 1,
        time: 60
      });
      socialSystem.addToLeaderboard({
        score: 1500,
        level: 2,
        time: 90
      });
      socialSystem.addToLeaderboard({
        score: 800,
        level: 1,
        time: 45
      });
      expect(socialSystem.leaderboard[0].score).toBe(1500);
      expect(socialSystem.leaderboard[1].score).toBe(1000);
      expect(socialSystem.leaderboard[2].score).toBe(800);
    });
    test('应该限制排行榜条目数', () => {
      socialSystem.maxLeaderboardEntries = 3;
      for (let i = 0; i < 10; i++) {
        socialSystem.addToLeaderboard({
          score: i * 100,
          level: 1,
          time: 60
        });
      }
      expect(socialSystem.leaderboard.length).toBe(3);
      // 应该保留分数最高的
      expect(socialSystem.leaderboard[0].score).toBe(900);
    });
    test('应该获取分页数据', () => {
      for (let i = 0; i < 25; i++) {
        socialSystem.addToLeaderboard({
          score: i * 100,
          level: 1,
          time: 60
        });
      }
      const page0 = socialSystem.getLeaderboardPage(0, 10);
      expect(page0.entries.length).toBe(10);
      expect(page0.total).toBe(25);
      expect(page0.page).toBe(0);
      const page2 = socialSystem.getLeaderboardPage(2, 10);
      expect(page2.entries.length).toBe(5);
      expect(page2.page).toBe(2);
    });
    test('应该获取前N名玩家', () => {
      for (let i = 0; i < 15; i++) {
        socialSystem.addToLeaderboard({
          score: i * 100,
          level: 1,
          time: 60
        });
      }
      const top5 = socialSystem.getTopPlayers(5);
      expect(top5.length).toBe(5);
      expect(top5[0].score).toBe(1400); // 分数最高
    });
    test('应该获取玩家排名', () => {
      socialSystem.addToLeaderboard({
        score: 1000,
        level: 1,
        time: 60
      });
      socialSystem.addToLeaderboard({
        score: 1500,
        level: 2,
        time: 90
      });
      const entryId = socialSystem.leaderboard[0].id;
      const rank = socialSystem.getPlayerRank(entryId);
      expect(rank).toBe(1);
    });
    test('不存在的记录应该返回 -1', () => {
      const rank = socialSystem.getPlayerRank('nonexistent');
      expect(rank).toBe(-1);
    });
  });

  // ===== 好友系统测试 =====
  describe('好友系统', () => {
    test('应该添加好友', () => {
      const friendCode = 'ABC12345';
      const friend = socialSystem.addFriend(friendCode);
      expect(friend).toBeDefined();
      expect(friend.code).toBe(friendCode);
      expect(friend.name).toContain('消防员');
      expect(friend.avatar).toBeDefined();
    });
    test('好友应该有头像', () => {
      const avatar = socialSystem.randomAvatar();
      expect(avatar).toBeDefined();
      expect(avatar.length).toBeGreaterThan(0);
    });
    test('应该生成好友码', () => {
      const code = socialSystem.generateFriendCode();
      expect(code).toBeDefined();
      expect(code.length).toBe(8);
      expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
    });
    test('好友码应该包含8个字符', () => {
      for (let i = 0; i < 10; i++) {
        const code = socialSystem.generateFriendCode();
        expect(code.length).toBe(8);
      }
    });
    test('应该获取玩家好友码', () => {
      const code1 = socialSystem.getPlayerFriendCode();
      const code2 = socialSystem.getPlayerFriendCode();
      expect(code1).toBe(code2); // 同一次会话应该相同
      expect(code1.length).toBe(8);
    });
    test('应该生成好友分数', () => {
      const friend = socialSystem.addFriend('TEST123');
      const friendLeaderboardBefore = socialSystem.friendLeaderboard.length;
      socialSystem.generateFriendScore(friend);
      expect(socialSystem.friendLeaderboard.length).toBe(friendLeaderboardBefore + 1);
      expect(socialSystem.friendLeaderboard[friendLeaderboardBefore].playerName).toBe(friend.name);
      expect(socialSystem.friendLeaderboard[friendLeaderboardBefore].isFriend).toBe(true);
    });
    test('应该获取好友排行榜', () => {
      socialSystem.addFriend('FRIEND1');
      socialSystem.addFriend('FRIEND2');

      // 添加自己的分数
      socialSystem.addToLeaderboard({
        score: 1000,
        level: 1,
        time: 60
      });
      const friendLeaderboard = socialSystem.getFriendLeaderboard();
      expect(friendLeaderboard.length).toBeGreaterThan(0);
      // 应该包含自己
      expect(friendLeaderboard.some(e => e.isMe)).toBe(true);
    });
    test('好友排行榜应该包含好友', () => {
      const friend = socialSystem.addFriend('FRIEND1');
      socialSystem.generateFriendScore(friend);
      const friendLeaderboard = socialSystem.getFriendLeaderboard();
      expect(friendLeaderboard.some(e => e.playerName === friend.name)).toBe(true);
    });
  });

  // ===== 分享功能测试 =====
  describe('分享功能', () => {
    test('应该生成分享卡片', () => {
      // 创建 mock canvas
      const mockCardCanvas = {
        width: 600,
        height: 400,
        getContext: jest.fn(() => ({
          font: '',
          textAlign: '',
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
          save: jest.fn(),
          restore: jest.fn(),
          beginPath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          stroke: jest.fn(),
          strokeRect: jest.fn(),
          fillRect: jest.fn(),
          createLinearGradient: jest.fn(() => ({
            addColorStop: jest.fn()
          })),
          arc: jest.fn(),
          fill: jest.fn(),
          fillText: jest.fn(),
          globalAlpha: 1
        })),
        toDataURL: jest.fn(() => 'data:image/png;base64,mockdata')
      };

      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tag) => {
        if (tag === 'canvas') return mockCardCanvas;
        return originalCreateElement.call(document, tag);
      });

      const gameResult = {
        levelName: '测试关卡',
        score: 1500,
        time: 75000,
        firesExtinguished: 15,
        result: 'completed',
        globalRank: {
          rank: 100,
          percentile: 15
        }
      };
      const imageData = socialSystem.generateShareCard(gameResult);

      document.createElement = originalCreateElement;

      expect(imageData).toBeDefined();
      expect(imageData).toContain('data:image/png');
      expect(imageData).toContain('base64');
    });
    test('shareHistory 应该存在', () => {
      expect(socialSystem.shareHistory).toBeDefined();
      expect(Array.isArray(socialSystem.shareHistory)).toBe(true);
    });
    test('应该有保存分享历史的方法', () => {
      expect(typeof socialSystem.saveShareHistory).toBe('function');
    });
  });

  // ===== 成就系统测试 =====
  describe('成就系统', () => {
    test('unlockedAchievements 应该存在', () => {
      expect(socialSystem.unlockedAchievements).toBeDefined();
      expect(Array.isArray(socialSystem.unlockedAchievements)).toBe(true);
    });
  });

  // ===== 统计数据测试 =====
  describe('统计数据', () => {
    test('playerProfile 应该存在', () => {
      expect(socialSystem.playerProfile).toBeDefined();
    });
    test('应该能够更新玩家资料', () => {
      expect(typeof socialSystem.updateProfile).toBe('function');
      socialSystem.updateProfile({
        played: true,
        completed: true
      });
      expect(socialSystem.playerProfile.totalGames).toBe(1);
      expect(socialSystem.playerProfile.completedGames).toBe(1);
    });
  });

  // ===== 数据持久化测试 =====
  describe('数据持久化', () => {
    test('saveShareHistory 方法应该存在', () => {
      expect(typeof socialSystem.saveShareHistory).toBe('function');
    });
    test('saveShareHistory 应该不抛出错误', () => {
      expect(() => socialSystem.saveShareHistory()).not.toThrow();
    });
  });
});
