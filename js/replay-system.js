/**
 * 回放系统 (Replay System)
 * 记录每局操作序列、回放播放器、关键时刻标记、回放分享
 */
export class ReplaySystem {
    constructor(game) {
        this.game = game;

        // 录制
        this.isRecording = false;
        this.currentReplay = null;
        this.frameIndex = 0;
        this.recordInterval = 100; // 每100ms记录一帧
        this.lastRecordTime = 0;

        // 回放
        this.isReplaying = false;
        this.replaySpeed = 1.0;
        this.replayPaused = false;
        this.replayProgress = 0;
        this.replayStartTime = 0;

        // 关键时刻
        this.keyMoments = [];
        this.autoMarkEnabled = true;

        // 回放列表
        this.savedReplays = this.loadReplays();
        this.maxSavedReplays = 50;

        // 回放 UI
        this.showReplayUI = false;
        this.timelineWidth = 600;
        this.timelineHeight = 30;
    }

    // ===== 录制 =====
    startRecording(levelInfo = {}) {
        this.isRecording = true;
        this.frameIndex = 0;
        this.keyMoments = [];

        this.currentReplay = {
            id: `replay_${Date.now()}`,
            version: 1,
            timestamp: Date.now(),
            level: levelInfo.level || 'unknown',
            levelName: levelInfo.levelName || '未知关卡',
            playerName: levelInfo.playerName || '消防员',
            // 初始状态快照
            initialState: this.captureState(),
            // 操作帧
            frames: [],
            // 关键时刻
            keyMoments: [],
            // 统计
            stats: {
                duration: 0,
                firesExtinguished: 0,
                waterUsed: 0,
                score: 0,
                result: 'in_progress',
            },
            // 元数据
            metadata: {
                gameVersion: '4.0',
                seed: levelInfo.seed || Math.floor(Math.random() * 999999),
            },
        };

        this.addKeyMoment('start', '🎮 游戏开始');
    }

    stopRecording(result = 'completed') {
        if (!this.isRecording) return;

        this.isRecording = false;
        this.addKeyMoment('end', `${result === 'completed' ? '🎉' : '💀'} 游戏结束`);

        this.currentReplay.stats.duration = this.frameIndex * this.recordInterval;
        this.currentReplay.stats.result = result;

        // 捕获最终状态
        this.currentReplay.finalState = this.captureState();

        // 保存
        this.saveReplay(this.currentReplay);
        return this.currentReplay;
    }

    recordFrame() {
        if (!this.isRecording || !this.currentReplay) return;

        const now = Date.now();
        if (now - this.lastRecordTime < this.recordInterval) return;
        this.lastRecordTime = now;

        const frame = {
            index: this.frameIndex,
            time: this.frameIndex * this.recordInterval,
            // 玩家输入
            player: this.capturePlayerInput(),
            // 游戏状态变化（增量）
            stateDelta: this.captureStateDelta(),
        };

        this.currentReplay.frames.push(frame);
        this.frameIndex++;

        // 自动标记关键时刻
        if (this.autoMarkEnabled) {
            this.checkAutoKeyMoments(frame);
        }
    }

    captureState() {
        const state = {};

        if (this.game.player) {
            state.player = {
                x: this.game.player.x,
                y: this.game.player.y,
                health: this.game.player.health,
                water: this.game.player.water,
            };
        }

        if (this.game.fireAISystem) {
            state.fires = this.game.fireAISystem.serialize();
        }

        state.score = this.game.score || 0;
        state.timeRemaining = this.game.timeRemaining || 0;

        return state;
    }

    capturePlayerInput() {
        if (!this.game.player) return {};

        return {
            x: this.game.player.x,
            y: this.game.player.y,
            action: this.game.player.currentAction || 'idle',
            direction: this.game.player.direction || 'right',
            // 输入状态
            keys: this.game.inputKeys ? { ...this.game.inputKeys } : {},
        };
    }

    captureStateDelta() {
        const delta = {};

        // 只记录变化的部分
        if (this.game.player) {
            delta.score = this.game.score || 0;
            delta.timeRemaining = this.game.timeRemaining || 0;
        }

        if (this.game.fireAISystem) {
            const fireCount = this.game.fireAISystem.fireEntities.filter(f => f.alive).length;
            delta.fireCount = fireCount;
        }

        return delta;
    }

    // ===== 关键时刻 =====
    addKeyMoment(type, label, data = {}) {
        if (!this.currentReplay) return;

        const moment = {
            index: this.frameIndex,
            time: this.frameIndex * this.recordInterval,
            type,
            label,
            data,
            timestamp: Date.now(),
        };

        this.keyMoments.push(moment);
        this.currentReplay.keyMoments.push(moment);
    }

    checkAutoKeyMoments(frame) {
        // 检查是否有关键事件
        if (!frame.stateDelta) return;

        // 大量火焰出现
        if (frame.stateDelta.fireCount !== undefined) {
            if (frame.stateDelta.fireCount > 10 && !this._fireWarningMarked) {
                this.addKeyMoment('danger', `⚠️ 火势失控! ${frame.stateDelta.fireCount} 处火灾`);
                this._fireWarningMarked = true;
            }
            if (frame.stateDelta.fireCount <= 3) {
                this._fireWarningMarked = false;
            }
        }

        // 分数里程碑
        const score = frame.stateDelta.score;
        if (score && score > 0 && score % 500 < 10 && !this[`_scoreMark${Math.floor(score / 500)}`]) {
            this[`_scoreMark${Math.floor(score / 500)}`] = true;
            this.addKeyMoment('milestone', `🏆 得分达到 ${Math.floor(score / 500) * 500}!`);
        }
    }

    // ===== 回放播放 =====
    startReplay(replayId) {
        const replay = this.savedReplays.find(r => r.id === replayId);
        if (!replay) {
            console.warn('回放未找到:', replayId);
            return false;
        }

        this.isReplaying = true;
        this.replayPaused = false;
        this.replaySpeed = 1.0;
        this.replayProgress = 0;
        this.replayStartTime = Date.now();
        this.currentReplay = replay;

        // 恢复初始状态
        if (replay.initialState) {
            this.restoreState(replay.initialState);
        }

        this.showReplayUI = true;
        return true;
    }

    stopReplay() {
        this.isReplaying = false;
        this.replayPaused = false;
        this.showReplayUI = false;
        this.currentReplay = null;

        if (this.game.onReplayEnd) {
            this.game.onReplayEnd();
        }
    }

    updateReplay(dt) {
        if (!this.isReplaying || this.replayPaused || !this.currentReplay) return;

        const replay = this.currentReplay;
        const frameIndex = Math.floor(this.replayProgress);
        const adjustedDt = dt * this.replaySpeed;
        const frameAdvance = adjustedDt / this.recordInterval;

        this.replayProgress += frameAdvance;

        if (this.replayProgress >= replay.frames.length) {
            this.stopReplay();
            return;
        }

        // 应用帧
        const targetFrame = replay.frames[Math.floor(this.replayProgress)];
        if (targetFrame) {
            this.applyFrame(targetFrame);
        }
    }

    applyFrame(frame) {
        // 应用玩家位置
        if (frame.player && this.game.player) {
            this.game.player.x = frame.player.x;
            this.game.player.y = frame.player.y;
            this.game.player.direction = frame.player.direction || 'right';
        }

        // 应用状态
        if (frame.stateDelta) {
            if (frame.stateDelta.score !== undefined) {
                this.game.score = frame.stateDelta.score;
            }
            if (frame.stateDelta.timeRemaining !== undefined) {
                this.game.timeRemaining = frame.stateDelta.timeRemaining;
            }
        }
    }

    restoreState(state) {
        if (state.player && this.game.player) {
            Object.assign(this.game.player, state.player);
        }
        if (state.score !== undefined) {
            this.game.score = state.score;
        }
        if (state.timeRemaining !== undefined) {
            this.game.timeRemaining = state.timeRemaining;
        }
        if (state.fires && this.game.fireAISystem) {
            this.game.fireAISystem.deserialize(state.fires);
        }
    }

    // ===== 回放控制 =====
    pauseReplay() {
        this.replayPaused = true;
    }

    resumeReplay() {
        this.replayPaused = false;
    }

    togglePause() {
        this.replayPaused = !this.replayPaused;
    }

    setSpeed(speed) {
        this.replaySpeed = Math.max(0.25, Math.min(4.0, speed));
    }

    seekTo(progress) {
        if (!this.currentReplay) return;
        this.replayProgress = Math.max(0, Math.min(progress, this.currentReplay.frames.length - 1));

        // 恢复到最近的关键帧
        const frameIndex = Math.floor(this.replayProgress);
        if (this.currentReplay.frames[frameIndex]) {
            this.applyFrame(this.currentReplay.frames[frameIndex]);
        }
    }

    seekToKeyMoment(momentIndex) {
        if (!this.currentReplay || !this.currentReplay.keyMoments[momentIndex]) return;
        const moment = this.currentReplay.keyMoments[momentIndex];
        this.seekTo(moment.index);
    }

    // ===== 回放 UI 渲染 =====
    renderReplayUI(ctx) {
        if (!this.showReplayUI || !this.currentReplay) return;

        const canvas = ctx.canvas;
        const uiY = canvas.height - 80;
        const uiWidth = Math.min(this.timelineWidth, canvas.width - 40);
        const uiX = (canvas.width - uiWidth) / 2;

        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(uiX - 10, uiY - 30, uiWidth + 20, 100);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(uiX - 10, uiY - 30, uiWidth + 20, 100);

        // 标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`📹 回放: ${this.currentReplay.levelName}`, uiX, uiY - 15);

        // 速度
        ctx.textAlign = 'right';
        ctx.fillText(`速度: ${this.replaySpeed}x`, uiX + uiWidth, uiY - 15);

        // 时间轴
        this.renderTimeline(ctx, uiX, uiY, uiWidth);

        // 控制按钮
        this.renderControls(ctx, uiX, uiY + 35, uiWidth);

        // 关键时刻列表
        this.renderKeyMoments(ctx, uiX, uiY + 55, uiWidth);
    }

    renderTimeline(ctx, x, y, width) {
        const totalFrames = this.currentReplay.frames.length || 1;
        const progress = this.replayProgress / totalFrames;

        // 时间轴背景
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.fillRect(x, y, width, 8);

        // 进度条
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x, y, width * progress, 8);

        // 关键时刻标记
        for (const moment of this.currentReplay.keyMoments) {
            const momentProgress = moment.index / totalFrames;
            const mx = x + width * momentProgress;
            const color = moment.type === 'danger' ? '#e74c3c' :
                         moment.type === 'milestone' ? '#f1c40f' :
                         moment.type === 'start' ? '#2ecc71' :
                         '#95a5a6';
            ctx.fillStyle = color;
            ctx.fillRect(mx - 1, y - 4, 2, 16);
        }

        // 播放头
        const headX = x + width * progress;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(headX, y + 4, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    renderControls(ctx, x, y, width) {
        const controls = [
            { icon: '⏪', action: 'slow', x: x + width * 0.2 },
            { icon: this.replayPaused ? '▶️' : '⏸️', action: 'toggle', x: x + width * 0.35 },
            { icon: '⏩', action: 'fast', x: x + width * 0.5 },
            { icon: '⏹️', action: 'stop', x: x + width * 0.65 },
            { icon: '📷', action: 'screenshot', x: x + width * 0.8 },
        ];

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';

        for (const ctrl of controls) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(ctrl.icon, ctrl.x, y + 8);
        }
    }

    renderKeyMoments(ctx, x, y, width) {
        const moments = this.currentReplay.keyMoments.slice(-5);
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'left';

        moments.forEach((moment, i) => {
            const timeStr = this.formatTime(moment.time);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(`${timeStr} ${moment.label}`, x + i * (width / 5), y + 8);
        });
    }

    // 点击检测（用于时间轴和按钮交互）
    handleClick(mx, my) {
        if (!this.showReplayUI || !this.currentReplay) return false;

        const canvas = this.game.canvas;
        const uiY = canvas.height - 80;
        const uiWidth = Math.min(this.timelineWidth, canvas.width - 40);
        const uiX = (canvas.width - uiWidth) / 2;

        // 时间轴点击
        if (my >= uiY - 5 && my <= uiY + 15 && mx >= uiX && mx <= uiX + uiWidth) {
            const progress = (mx - uiX) / uiWidth;
            const totalFrames = this.currentReplay.frames.length || 1;
            this.seekTo(progress * totalFrames);
            return true;
        }

        // 关键时刻点击
        if (my >= uiY - 30 && my <= uiY + 15) {
            const totalFrames = this.currentReplay.frames.length || 1;
            for (const moment of this.currentReplay.keyMoments) {
                const momentProgress = moment.index / totalFrames;
                const momentX = uiX + uiWidth * momentProgress;
                if (Math.abs(mx - momentX) < 8) {
                    this.seekTo(moment.index);
                    return true;
                }
            }
        }

        // 控制按钮点击
        if (my >= uiY + 25 && my <= uiY + 50) {
            const controls = [
                { action: 'slow', x: uiX + uiWidth * 0.2 },
                { action: 'toggle', x: uiX + uiWidth * 0.35 },
                { action: 'fast', x: uiX + uiWidth * 0.5 },
                { action: 'stop', x: uiX + uiWidth * 0.65 },
                { action: 'screenshot', x: uiX + uiWidth * 0.8 },
            ];

            for (const ctrl of controls) {
                if (Math.abs(mx - ctrl.x) < 20) {
                    this.handleControlAction(ctrl.action);
                    return true;
                }
            }
        }

        return false;
    }

    handleControlAction(action) {
        switch (action) {
            case 'slow':
                this.setSpeed(this.replaySpeed / 2);
                break;
            case 'toggle':
                this.togglePause();
                break;
            case 'fast':
                this.setSpeed(this.replaySpeed * 2);
                break;
            case 'stop':
                this.stopReplay();
                break;
            case 'screenshot':
                this.exportReplayImage();
                break;
        }
    }

    // ===== 导出分享 =====
    exportReplayAsText(replayId) {
        const replay = replayId
            ? this.savedReplays.find(r => r.id === replayId)
            : this.currentReplay;

        if (!replay) return null;

        const lines = [];
        lines.push('='.repeat(50));
        lines.push(`🔥 消防灭火游戏 - 回放记录`);
        lines.push('='.repeat(50));
        lines.push(`关卡: ${replay.levelName}`);
        lines.push(`玩家: ${replay.playerName}`);
        lines.push(`日期: ${new Date(replay.timestamp).toLocaleString('zh-CN')}`);
        lines.push(`时长: ${this.formatTime(replay.stats.duration)}`);
        lines.push(`得分: ${replay.stats.score}`);
        lines.push(`结果: ${replay.stats.result === 'completed' ? '✅ 通关' : '❌ 失败'}`);
        lines.push('');

        lines.push('--- 关键时刻 ---');
        for (const moment of replay.keyMoments) {
            lines.push(`[${this.formatTime(moment.time)}] ${moment.label}`);
        }

        lines.push('');
        lines.push(`--- 统计 ---`);
        lines.push(`灭火次数: ${replay.stats.firesExtinguished}`);
        lines.push(`用水量: ${replay.stats.waterUsed}`);
        lines.push(`操作帧数: ${replay.frames.length}`);

        lines.push('');
        lines.push('--- 回放数据 ---');
        lines.push(`ID: ${replay.id}`);
        lines.push(`种子: ${replay.metadata.seed}`);
        lines.push(`版本: ${replay.metadata.gameVersion}`);

        // 压缩的操作序列
        lines.push('');
        lines.push('--- 操作序列 (压缩) ---');
        const compressedActions = this.compressFrames(replay.frames);
        lines.push(compressedActions);

        return lines.join('\n');
    }

    compressFrames(frames) {
        // 将帧序列压缩为紧凑格式
        return frames
            .filter((f, i) => i % 5 === 0) // 每5帧取1帧
            .map(f => {
                const p = f.player;
                return `${f.index}:${Math.round(p?.x || 0)},${Math.round(p?.y || 0)}:${p?.action || 'idle'}`;
            })
            .join('|');
    }

    importReplayFromText(text) {
        try {
            // 解析文本格式
            const data = {};
            const lines = text.split('\n');

            for (const line of lines) {
                if (line.startsWith('关卡:')) data.levelName = line.replace('关卡:', '').trim();
                if (line.startsWith('玩家:')) data.playerName = line.replace('玩家:', '').trim();
                if (line.startsWith('得分:')) data.score = parseInt(line.replace('得分:', '').trim());
                if (line.startsWith('ID:')) data.id = line.replace('ID:', '').trim();
                if (line.startsWith('种子:')) data.seed = parseInt(line.replace('种子:', '').trim());
            }

            return data;
        } catch (e) {
            console.error('导入回放失败:', e);
            return null;
        }
    }

    exportReplayImage() {
        if (!this.game.canvas) return null;

        // 创建战绩卡片 Canvas
        const cardWidth = 400;
        const cardHeight = 300;
        const cardCanvas = document.createElement('canvas');
        cardCanvas.width = cardWidth;
        cardCanvas.height = cardHeight;
        const cardCtx = cardCanvas.getContext('2d');

        const replay = this.currentReplay;

        // 背景
        const gradient = cardCtx.createLinearGradient(0, 0, cardWidth, cardHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        cardCtx.fillStyle = gradient;
        cardCtx.fillRect(0, 0, cardWidth, cardHeight);

        // 装饰边框
        cardCtx.strokeStyle = '#e74c3c';
        cardCtx.lineWidth = 3;
        cardCtx.strokeRect(10, 10, cardWidth - 20, cardHeight - 20);

        // 标题
        cardCtx.fillStyle = '#fff';
        cardCtx.font = 'bold 20px sans-serif';
        cardCtx.textAlign = 'center';
        cardCtx.fillText('🔥 消防灭火战报 🔥', cardWidth / 2, 45);

        // 分割线
        cardCtx.beginPath();
        cardCtx.moveTo(40, 60);
        cardCtx.lineTo(cardWidth - 40, 60);
        cardCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        cardCtx.lineWidth = 1;
        cardCtx.stroke();

        // 内容
        cardCtx.font = '14px sans-serif';
        cardCtx.textAlign = 'left';
        cardCtx.fillStyle = '#ecf0f1';

        const stats = replay ? replay.stats : {};
        const y = 85;
        const lineHeight = 28;

        cardCtx.fillText(`关卡: ${replay?.levelName || '未知'}`, 40, y);
        cardCtx.fillText(`玩家: ${replay?.playerName || '消防员'}`, 40, y + lineHeight);
        cardCtx.fillText(`时长: ${this.formatTime(stats.duration || 0)}`, 40, y + lineHeight * 2);
        cardCtx.fillText(`得分: ${stats.score || 0}`, 40, y + lineHeight * 3);
        cardCtx.fillText(`灭火: ${stats.firesExtinguished || 0} 处`, 40, y + lineHeight * 4);

        // 结果
        cardCtx.font = 'bold 18px sans-serif';
        cardCtx.textAlign = 'center';
        cardCtx.fillStyle = stats.result === 'completed' ? '#2ecc71' : '#e74c3c';
        cardCtx.fillText(
            stats.result === 'completed' ? '✅ 通关成功！' : '❌ 任务失败',
            cardWidth / 2,
            cardHeight - 35
        );

        // 日期
        cardCtx.font = '10px sans-serif';
        cardCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        cardCtx.fillText(
            new Date(replay?.timestamp || Date.now()).toLocaleString('zh-CN'),
            cardWidth / 2,
            cardHeight - 15
        );

        return cardCanvas.toDataURL('image/png');
    }

    // ===== 存储 =====
    saveReplay(replay) {
        this.savedReplays.push(replay);

        // 限制保存数量
        if (this.savedReplays.length > this.maxSavedReplays) {
            this.savedReplays = this.savedReplays.slice(-this.maxSavedReplays);
        }

        // 持久化
        try {
            localStorage.setItem('firefighter_replays', JSON.stringify(this.savedReplays));
        } catch (e) {
            console.warn('保存回放失败:', e);
        }
    }

    loadReplays() {
        try {
            const data = localStorage.getItem('firefighter_replays');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    deleteReplay(replayId) {
        this.savedReplays = this.savedReplays.filter(r => r.id !== replayId);
        try {
            localStorage.setItem('firefighter_replays', JSON.stringify(this.savedReplays));
        } catch {}
    }

    getReplayList() {
        return this.savedReplays.map(r => ({
            id: r.id,
            levelName: r.levelName,
            playerName: r.playerName,
            timestamp: r.timestamp,
            duration: r.stats.duration,
            score: r.stats.score,
            result: r.stats.result,
            keyMoments: r.keyMoments.length,
        }));
    }

    // ===== 更新统计 =====
    updateStats(stats) {
        if (!this.currentReplay) return;
        Object.assign(this.currentReplay.stats, stats);
    }

    recordExtinguish() {
        if (this.currentReplay) {
            this.currentReplay.stats.firesExtinguished++;
            this.addKeyMoment('action', '🧯 灭火成功！');
        }
    }

    recordWaterUse(amount) {
        if (this.currentReplay) {
            this.currentReplay.stats.waterUsed += amount;
        }
    }

    // ===== 工具方法 =====
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // ===== 主更新 =====
    update(dt) {
        if (this.isRecording) {
            this.recordFrame();
        }

        if (this.isReplaying) {
            this.updateReplay(dt);
        }
    }

    render(ctx) {
        if (this.isReplaying && this.showReplayUI) {
            this.renderReplayUI(ctx);
        }

        // 录制指示器
        if (this.isRecording) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(ctx.canvas.width - 120, 10, 110, 24);
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(ctx.canvas.width - 110, 22, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('REC', ctx.canvas.width - 100, 26);
            ctx.restore();
        }
    }
}
