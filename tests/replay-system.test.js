/**
 * 回放系统测试
 */
describe('ReplaySystem', () => {
  let replaySystem;
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
      player: {
        x: 400,
        y: 300,
        health: 100,
        water: 1000,
        currentAction: 'idle',
        direction: 'right'
      },
      score: 0,
      timeRemaining: 60,
      inputKeys: {
        left: false,
        right: false,
        shoot: false
      },
      fireAISystem: {
        fireEntities: [],
        serialize: jest.fn(() => ({
          entities: []
        })),
        deserialize: jest.fn()
      }
    };
    const { ReplaySystem } = require('../js/replay-system.js');
    replaySystem = new ReplaySystem(mockGame);

    // 清除 localStorage 和 savedReplays
    localStorage.clear();
    replaySystem.savedReplays = [];
  });

  // ===== 录制测试 =====
  describe('录制功能', () => {
    test('应该开始录制', () => {
      replaySystem.startRecording({
        level: 'test-level',
        levelName: '测试关卡'
      });
      expect(replaySystem.isRecording).toBe(true);
      expect(replaySystem.currentReplay).toBeDefined();
      expect(replaySystem.currentReplay.levelName).toBe('测试关卡');
      expect(replaySystem.currentReplay.frames).toEqual([]);
      expect(replaySystem.frameIndex).toBe(0);
    });
    test('录制应该记录玩家初始状态', () => {
      replaySystem.startRecording({
        level: 'test'
      });
      expect(replaySystem.currentReplay.initialState.player.x).toBe(400);
      expect(replaySystem.currentReplay.initialState.player.health).toBe(100);
    });
    test('应该停止录制', () => {
      replaySystem.startRecording({
        level: 'test'
      });
      const replay = replaySystem.stopRecording('completed');
      expect(replaySystem.isRecording).toBe(false);
      expect(replay).toBeDefined();
      expect(replay.stats.result).toBe('completed');
      expect(replay.stats.duration).toBe(0);
    });
    test('录制时应该记录关键时刻 - 开始', () => {
      replaySystem.startRecording({
        level: 'test'
      });
      expect(replaySystem.currentReplay.keyMoments.length).toBe(1);
      expect(replaySystem.currentReplay.keyMoments[0].type).toBe('start');
      expect(replaySystem.currentReplay.keyMoments[0].label).toContain('游戏开始');
    });
    test('停止录制时应该记录关键时刻 - 结束', () => {
      replaySystem.startRecording({
        level: 'test'
      });
      replaySystem.stopRecording('completed');
      expect(replaySystem.currentReplay.keyMoments.length).toBe(2);
      expect(replaySystem.currentReplay.keyMoments[1].type).toBe('end');
      expect(replaySystem.currentReplay.keyMoments[1].label).toContain('游戏结束');
    });
    test('应该按间隔记录帧', () => {
      replaySystem.startRecording({
        level: 'test'
      });

      // 第一次调用应该记录
      replaySystem.recordFrame();
      expect(replaySystem.currentReplay.frames.length).toBe(1);
      expect(replaySystem.frameIndex).toBe(1);

      // 立即调用不应该记录（未到间隔）
      replaySystem.recordFrame();
      expect(replaySystem.currentReplay.frames.length).toBe(1);

      // 等待间隔后应该记录
      replaySystem.lastRecordTime = Date.now() - replaySystem.recordInterval - 10;
      replaySystem.recordFrame();
      expect(replaySystem.currentReplay.frames.length).toBe(2);
    });
    test('未录制时不应该记录帧', () => {
      replaySystem.recordFrame();
      expect(replaySystem.currentReplay).toBeNull();
    });
    test('帧应该包含玩家输入', () => {
      replaySystem.startRecording({
        level: 'test'
      });
      replaySystem.recordFrame();
      const frame = replaySystem.currentReplay.frames[0];
      expect(frame.player.x).toBe(400);
      expect(frame.player.y).toBe(300);
      expect(frame.player.action).toBe('idle');
      expect(frame.player.keys).toBeDefined();
    });
    test('帧应该包含状态变化', () => {
      mockGame.score = 500;
      replaySystem.startRecording({
        level: 'test'
      });
      replaySystem.recordFrame();
      const frame = replaySystem.currentReplay.frames[0];
      expect(frame.stateDelta.score).toBe(500);
    });
  });

  // ===== 关键时刻测试 =====
  describe('关键时刻', () => {
    test('应该手动添加关键时刻', () => {
      replaySystem.startRecording({
        level: 'test'
      });
      replaySystem.addKeyMoment('action', '🧯 灭火成功！', {
        fires: 5
      });
      expect(replaySystem.currentReplay.keyMoments.length).toBe(2); // start + action
      expect(replaySystem.currentReplay.keyMoments[1].type).toBe('action');
      expect(replaySystem.currentReplay.keyMoments[1].label).toBe('🧯 灭火成功！');
      expect(replaySystem.currentReplay.keyMoments[1].data.fires).toBe(5);
    });
    test('应该自动标记火势失控', () => {
      replaySystem.startRecording({
        level: 'test'
      });

      // 模拟帧数据
      const frame = {
        stateDelta: {
          fireCount: 15
        }
      };
      replaySystem.checkAutoKeyMoments(frame);
      expect(replaySystem.currentReplay.keyMoments.length).toBe(2);
      expect(replaySystem.currentReplay.keyMoments[1].type).toBe('danger');
      expect(replaySystem.currentReplay.keyMoments[1].label).toContain('火势失控');
    });
    test('应该自动标记分数里程碑', () => {
      replaySystem.startRecording({
        level: 'test'
      });

      // 模拟帧数据
      const frame = {
        stateDelta: {
          score: 500
        }
      };
      replaySystem.checkAutoKeyMoments(frame);
      expect(replaySystem.currentReplay.keyMoments.length).toBe(2);
      expect(replaySystem.currentReplay.keyMoments[1].type).toBe('milestone');
      expect(replaySystem.currentReplay.keyMoments[1].label).toContain('得分达到');
    });
  });

  // ===== 回放播放测试 =====
  describe('回放播放', () => {
    test('应该开始回放', () => {
      // 首先保存一个回放
      const replay = {
        id: 'test-replay-1',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: {
          duration: 10000,
          score: 0,
          result: 'completed'
        },
        initialState: {
          player: { x: 400, y: 300, health: 100 }
        },
        frames: [
          { index: 0, time: 0, player: { x: 400, y: 300 } },
          { index: 1, time: 100, player: { x: 410, y: 300 } }
        ],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.savedReplays.push(replay);

      const success = replaySystem.startReplay('test-replay-1');

      expect(success).toBe(true);
      expect(replaySystem.isReplaying).toBe(true);
      expect(replaySystem.replayPaused).toBe(false);
      expect(replaySystem.replaySpeed).toBe(1.0);
    });
    test('回放应该恢复初始状态', () => {
      // 首先保存一个回放
      const replay = {
        id: 'test-replay-2',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: {
          duration: 10000,
          score: 100,
          result: 'completed'
        },
        initialState: {
          player: { x: 200, y: 200, health: 50, water: 500 },
          score: 100,
          timeRemaining: 30
        },
        frames: [],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.savedReplays.push(replay);

      replaySystem.startReplay('test-replay-2');

      expect(mockGame.player.x).toBe(200);
      expect(mockGame.player.y).toBe(200);
      expect(mockGame.player.health).toBe(50);
      expect(mockGame.score).toBe(100);
    });
    test('回放应该更新进度', () => {
      // 首先保存一个回放
      const replay = {
        id: 'test-replay-3',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: { duration: 10000, score: 0, result: 'completed' },
        initialState: { player: { x: 400, y: 300, health: 100 } },
        frames: [
          { index: 0, time: 0, player: { x: 400, y: 300 } },
          { index: 1, time: 100, player: { x: 410, y: 300 } }
        ],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.savedReplays.push(replay);

      replaySystem.startReplay('test-replay-3');
      replaySystem.updateReplay(16); // 1s @ 60fps

      expect(replaySystem.replayProgress).toBeGreaterThan(0);
      expect(replaySystem.replayProgress).toBeLessThan(20);
    });
    test('回放结束应该停止', () => {
      // 首先保存一个回放
      const replay = {
        id: 'test-replay-4',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: { duration: 10000, score: 0, result: 'completed' },
        initialState: { player: { x: 400, y: 300, health: 100 } },
        frames: [
          { index: 0, time: 0, player: { x: 400, y: 300 } }
        ],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.savedReplays.push(replay);
      replaySystem.onReplayEnd = jest.fn();

      replaySystem.startReplay('test-replay-4');
      replaySystem.updateReplay(1000); // 超过帧数

      expect(replaySystem.isReplaying).toBe(false);
    });
    test('应该能够暂停回放', () => {
      const replay = {
        id: 'test-replay-5',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: { duration: 10000, score: 0, result: 'completed' },
        initialState: { player: { x: 400, y: 300, health: 100 } },
        frames: [{ index: 0, time: 0, player: { x: 400, y: 300 } }],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.savedReplays.push(replay);

      replaySystem.startReplay('test-replay-5');
      replaySystem.pauseReplay();
      expect(replaySystem.replayPaused).toBe(true);

      replaySystem.resumeReplay();
      expect(replaySystem.replayPaused).toBe(false);
    });
    test('应该能够调整回放速度', () => {
      const replay = {
        id: 'test-replay-6',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: { duration: 10000, score: 0, result: 'completed' },
        initialState: { player: { x: 400, y: 300, health: 100 } },
        frames: [{ index: 0, time: 0, player: { x: 400, y: 300 } }],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.savedReplays.push(replay);

      replaySystem.startReplay('test-replay-6');

      replaySystem.setSpeed(2.0);
      expect(replaySystem.replaySpeed).toBe(2.0);

      replaySystem.setSpeed(5.0); // 应该限制在最大值
      expect(replaySystem.replaySpeed).toBe(4.0);

      replaySystem.setSpeed(0.1); // 应该限制在最小值
      expect(replaySystem.replaySpeed).toBe(0.25);
    });
  });

  // ===== 存储测试 =====
  describe('存储功能', () => {
    test('应该保存回放', () => {
      const replay = {
        id: 'test-replay-7',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: { duration: 10000, score: 100, result: 'completed' },
        initialState: {},
        frames: [],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.saveReplay(replay);

      expect(replaySystem.savedReplays.length).toBe(1);
      expect(replaySystem.savedReplays[0].id).toBe('test-replay-7');
    });
    test('应该限制保存数量', () => {
      // 保存超过限制数量的回放
      for (let i = 0; i < 60; i++) {
        replaySystem.saveReplay({
          id: `replay-${i}`,
          levelName: `关卡${i}`,
          playerName: '消防员',
          timestamp: Date.now() + i,
          stats: { duration: 10000, score: i, result: 'completed' },
          initialState: {},
          frames: [],
          keyMoments: [],
          metadata: {}
        });
      }

      expect(replaySystem.savedReplays.length).toBe(50); // maxSavedReplays
    });
    test('应该删除指定回放', () => {
      const replay1 = {
        id: 'replay-1',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: { duration: 10000, score: 0, result: 'completed' },
        initialState: {},
        frames: [],
        keyMoments: [],
        metadata: {}
      };
      const replay2 = {
        id: 'replay-2',
        levelName: '关卡2',
        playerName: '消防员',
        timestamp: Date.now() + 1,
        stats: { duration: 10000, score: 0, result: 'completed' },
        initialState: {},
        frames: [],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.saveReplay(replay1);
      replaySystem.saveReplay(replay2);

      expect(replaySystem.savedReplays.length).toBe(2);

      replaySystem.deleteReplay('replay-1');

      expect(replaySystem.savedReplays.length).toBe(1);
      expect(replaySystem.savedReplays[0].id).toBe('replay-2');
    });
    test('应该获取回放列表', () => {
      const replay1 = {
        id: 'replay-1',
        levelName: '关卡1',
        playerName: '玩家1',
        timestamp: Date.now(),
        stats: { duration: 10000, score: 500, result: 'completed' },
        initialState: {},
        frames: [],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.saveReplay(replay1);

      const list = replaySystem.getReplayList();

      expect(list.length).toBe(1);
      expect(list[0].id).toBe('replay-1');
      expect(list[0].levelName).toBe('关卡1');
      expect(list[0].score).toBe(500);
      expect(list[0].result).toBe('completed');
    });
  });

  // ===== 导出测试 =====
  describe('导出功能', () => {
    test('应该导出为文本格式', () => {
      const replay = {
        id: 'test-export',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: {
          duration: 30000,
          score: 1000,
          result: 'completed',
          firesExtinguished: 5,
          waterUsed: 500
        },
        initialState: {},
        frames: [
          { index: 0, time: 0, player: { x: 100, y: 200, action: 'move' } },
          { index: 1, time: 100, player: { x: 110, y: 210, action: 'shoot' } }
        ],
        keyMoments: [
          { index: 0, time: 0, type: 'start', label: '游戏开始', timestamp: Date.now() }
        ],
        metadata: {
          gameVersion: '4.0',
          seed: 12345
        }
      };

      const text = replaySystem.exportReplayAsText('test-export');
      replaySystem.savedReplays.push(replay);

      const exportedText = replaySystem.exportReplayAsText('test-export');

      expect(exportedText).toBeDefined();
      expect(exportedText).toContain('关卡: 关卡1');
      expect(exportedText).toContain('玩家: 消防员');
      expect(exportedText).toContain('得分: 1000');
      expect(exportedText).toContain('✅ 通关');
      expect(exportedText).toContain('游戏开始');
      expect(exportedText).toContain('ID: test-export');
    });
    test('压缩帧数据应该正确格式化', () => {
      const frames = [
        { index: 0, time: 0, player: { x: 100, y: 200, action: 'move' } },
        { index: 5, time: 500, player: { x: 150, y: 250, action: 'shoot' } },
        { index: 10, time: 1000, player: { x: 200, y: 300, action: 'idle' } },
        { index: 15, time: 1500, player: { x: 250, y: 350, action: 'move' } },
        { index: 20, time: 2000, player: { x: 300, y: 400, action: 'shoot' } },
        { index: 25, time: 2500, player: { x: 350, y: 450, action: 'idle' } }
      ];

      const compressed = replaySystem.compressFrames(frames);

      // 压缩格式应该是 "index:x,y:action|index:x,y:action"
      expect(compressed).toContain('0:100,200:move');
      expect(compressed).toContain('|');
    });
    test('导出图片应该返回 data URL', () => {
      // 创建 mock canvas with proper context
      const mockCardCanvas = {
        width: 400,
        height: 300,
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
        toDataURL: jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
      };

      const replay = {
        id: 'test-img',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: {
          duration: 30000,
          score: 1000,
          result: 'completed',
          firesExtinguished: 5,
          waterUsed: 500
        },
        initialState: {},
        frames: [],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.savedReplays.push(replay);
      replaySystem.currentReplay = replay;

      // Mock document.createElement to return our mock canvas
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tag) => {
        if (tag === 'canvas') return mockCardCanvas;
        return originalCreateElement.call(document, tag);
      });

      const dataUrl = replaySystem.exportReplayImage();

      document.createElement = originalCreateElement;

      expect(dataUrl).toBeDefined();
      expect(dataUrl).toContain('data:image/png;base64,');
      expect(mockCardCanvas.getContext).toHaveBeenCalledWith('2d');
    });
  });

  // ===== UI 交互测试 =====
  describe('UI 交互', () => {
    test('应该渲染录制指示器', () => {
      // 创建 mock context with all required methods
      const mockCtx = {
        canvas: mockCanvas,
        save: jest.fn(),
        restore: jest.fn(),
        fillStyle: '',
        fillRect: jest.fn(),
        fillText: jest.fn(),
        font: '',
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn()
      };

      replaySystem.startRecording({ level: 'test' });
      replaySystem.render(mockCtx);

      // 验证渲染方法被调用
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
    test('回放时应该渲染 UI', () => {
      const mockCtx = {
        canvas: mockCanvas,
        save: jest.fn(),
        restore: jest.fn(),
        fillStyle: '',
        fillRect: jest.fn(),
        fillText: jest.fn(),
        font: '',
        textAlign: '',
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        strokeRect: jest.fn(),
        strokeStyle: '',
        lineWidth: 0
      };
      const replay = {
        id: 'test-ui',
        levelName: '关卡1',
        playerName: '消防员',
        timestamp: Date.now(),
        stats: { duration: 10000, score: 0, result: 'completed' },
        initialState: { player: { x: 400, y: 300, health: 100 } },
        frames: [{ index: 0, time: 0, player: { x: 400, y: 300 } }],
        keyMoments: [],
        metadata: {}
      };
      replaySystem.savedReplays.push(replay);

      replaySystem.startReplay('test-ui');
      replaySystem.render(mockCtx);

      // 验证渲染方法被调用
      expect(mockCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
    });
  });

  // ===== 工具方法测试 =====
  describe('工具方法', () => {
    test('应该正确格式化时间', () => {
      expect(replaySystem.formatTime(0)).toBe('00:00');
      expect(replaySystem.formatTime(59000)).toBe('00:59');
      expect(replaySystem.formatTime(60000)).toBe('01:00');
      expect(replaySystem.formatTime(125000)).toBe('02:05');
    });
    test('应该更新统计', () => {
      replaySystem.startRecording({ level: 'test' });
      replaySystem.updateStats({
        score: 500,
        firesExtinguished: 3
      });

      expect(replaySystem.currentReplay.stats.score).toBe(500);
      expect(replaySystem.currentReplay.stats.firesExtinguished).toBe(3);
    });
    test('应该记录灭火事件', () => {
      replaySystem.startRecording({ level: 'test' });
      replaySystem.recordExtinguish();

      expect(replaySystem.currentReplay.stats.firesExtinguished).toBe(1);
      expect(replaySystem.currentReplay.keyMoments.length).toBe(2); // start + extinguish
    });
    test('应该记录用水量', () => {
      replaySystem.startRecording({ level: 'test' });
      replaySystem.recordWaterUse(50);
      replaySystem.recordWaterUse(30);

      expect(replaySystem.currentReplay.stats.waterUsed).toBe(80);
    });
  });
});
