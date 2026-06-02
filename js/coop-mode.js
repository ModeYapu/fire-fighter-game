/**
 * 合作模式系统 (Co-op Mode)
 * 本地双人合作模式
 * 玩家1：控制水枪（WASD + 空格发射）
 * 玩家2：控制设施放置（方向键 + 回车确认）
 */
export class CoopModeSystem {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.mode = 'split'; // 'split' 分屏 | 'shared' 同屏

        // 玩家数据
        this.player1 = {
            id: 1,
            name: '玩家1',
            role: 'shooter', // 水枪操作员
            color: '#3498db',
            controls: {
                up: 'KeyW',
                down: 'KeyS',
                left: 'KeyA',
                right: 'KeyD',
                shoot: 'Space',
            },
            angle: 45,
            power: 50,
            score: 0,
            waterUsed: 0,
            shotsHit: 0,
        };

        this.player2 = {
            id: 2,
            name: '玩家2',
            role: 'builder', // 设施建造师
            color: '#e74c3c',
            controls: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                confirm: 'Enter',
                cancel: 'Escape',
            },
            selectedFacility: null,
            cursor: { x: 400, y: 300 },
            facilitiesPlaced: 0,
        };

        // 合作评分
        this.coopScore = 0;
        this.teamBonus = 0;
        this.syncBonus = 0;

        // 输入状态
        this.keys = {};

        this.setupInputHandlers();
    }

    // 设置输入处理器
    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });

        document.addEventListener('keyup', (e) => {
            if (!this.isActive) return;
            this.keys[e.code] = false;
        });

        // 鼠标控制（玩家2设施放置）
        document.addEventListener('mousemove', (e) => {
            if (!this.isActive || this.mode !== 'shared') return;

            const canvas = this.game.canvas;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            this.player2.cursor.x = (e.clientX - rect.left) * scaleX;
            this.player2.cursor.y = (e.clientY - rect.top) * scaleY;
        });

        document.addEventListener('click', (e) => {
            if (!this.isActive || this.mode !== 'shared') return;
            if (this.player2.selectedFacility) {
                this.placeFacilityP2();
            }
        });
    }

    // 处理按键
    handleKeyPress(e) {
        // 玩家1 - 水枪控制
        if (e.code === this.player1.controls.up) {
            this.player1.angle = Math.min(80, this.player1.angle + 2);
        }
        if (e.code === this.player1.controls.down) {
            this.player1.angle = Math.max(0, this.player1.angle - 2);
        }
        if (e.code === this.player1.controls.left) {
            this.player1.power = Math.max(10, this.player1.power - 2);
        }
        if (e.code === this.player1.controls.right) {
            this.player1.power = Math.min(100, this.player1.power + 2);
        }
        if (e.code === this.player1.controls.shoot) {
            this.shootP1();
        }

        // 玩家2 - 设施控制
        if (e.code === this.player2.controls.up) {
            this.player2.cursor.y = Math.max(50, this.player2.cursor.y - 10);
        }
        if (e.code === this.player2.controls.down) {
            this.player2.cursor.y = Math.min(550, this.player2.cursor.y + 10);
        }
        if (e.code === this.player2.controls.left) {
            this.player2.cursor.x = Math.max(50, this.player2.cursor.x - 10);
        }
        if (e.code === this.player2.controls.right) {
            this.player2.cursor.x = Math.min(750, this.player2.cursor.x + 10);
        }
        if (e.code === this.player2.controls.confirm) {
            this.placeFacilityP2();
        }
        if (e.code === this.player2.controls.cancel) {
            this.player2.selectedFacility = null;
        }

        // 切换设施（数字键1-4，玩家2）
        if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
            const facilities = ['HYDRANT', 'FIRE_WALL', 'FIGHTER', 'WATCH_TOWER'];
            const index = parseInt(e.code.replace('Digit', '')) - 1;
            if (index < facilities.length) {
                this.player2.selectedFacility = facilities[index];
            }
        }
    }

    // 玩家1发射
    shootP1() {
        if (this.game.water <= 0) return;

        this.game.shootWater(this.player1.angle, this.player1.power);
        this.player1.waterUsed += 2;
        this.player1.score += 10;

        // 检查同步奖励（两人同时行动）
        this.checkSyncBonus();
    }

    // 玩家2放置设施
    placeFacilityP2() {
        if (!this.player2.selectedFacility) return;

        const success = this.game.placeFacility(
            this.player2.selectedFacility,
            this.player2.cursor.x,
            this.player2.cursor.y
        );

        if (success) {
            this.player2.facilitiesPlaced++;
            this.player2.score += 50;

            // 检查同步奖励
            this.checkSyncBonus();
        }
    }

    // 检查同步奖励（两人合作）
    checkSyncBonus() {
        const now = Date.now();
        if (!this.lastActionTime) {
            this.lastActionTime = now;
            return;
        }

        const timeDiff = now - this.lastActionTime;
        if (timeDiff < 2000) {
            // 2秒内两人都有行动，获得同步奖励
            this.syncBonus += 10;
            this.showSyncBonus();
        }

        this.lastActionTime = now;
    }

    // 显示同步奖励
    showSyncBonus() {
        const notification = document.createElement('div');
        notification.className = 'coop-sync-bonus';
        notification.textContent = '🤝 配合默契！+10分';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #9b59b6, #8e44ad);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            animation: coopBonus 1s ease-out forwards;
        `;

        document.getElementById('game-container').appendChild(notification);

        setTimeout(() => notification.remove(), 1000);
    }

    // 更新
    update(deltaTime) {
        if (!this.isActive) return;

        // 更新游戏输入
        this.game.inputManager.angle = this.player1.angle;
        this.game.inputManager.power = this.player1.power;

        // 更新玩家1统计
        if (this.game.waterDroplets.length > 0) {
            this.player1.shotsHit = this.game.stats.shotsHit;
        }
    }

    // 渲染
    render(ctx) {
        if (!this.isActive) return;

        if (this.mode === 'split') {
            this.renderSplitScreen(ctx);
        } else {
            this.renderSharedScreen(ctx);
        }

        // 渲染玩家2光标
        this.renderCursorP2(ctx);
    }

    // 分屏模式渲染
    renderSplitScreen(ctx) {
        const halfWidth = 400;

        // 分割线
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(halfWidth, 0);
        ctx.lineTo(halfWidth, 600);
        ctx.stroke();

        // 玩家1区域（左）
        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
        ctx.fillRect(0, 0, halfWidth, 600);

        // 玩家2区域（右）
        ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
        ctx.fillRect(halfWidth, 0, halfWidth, 600);

        // 玩家标签
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = this.player1.color;
        ctx.fillText('玩家1 - 水枪', 10, 25);

        ctx.fillStyle = this.player2.color;
        ctx.fillText('玩家2 - 设施', halfWidth + 10, 25);
    }

    // 同屏模式渲染
    renderSharedScreen(ctx) {
        // 显示玩家信息在角落
        const margin = 10;

        // 玩家1信息
        ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
        ctx.fillRect(margin, margin, 150, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('玩家1 - WASD', margin + 10, margin + 20);
        ctx.font = '12px Arial';
        ctx.fillText(`角度: ${this.player1.angle}° 力度: ${this.player1.power}%`, margin + 10, margin + 40);

        // 玩家2信息
        ctx.fillStyle = 'rgba(231, 76, 60, 0.8)';
        ctx.fillRect(800 - margin - 150, margin, 150, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('玩家2 - 方向键', 800 - margin - 140, margin + 20);
        ctx.font = '12px Arial';
        ctx.fillText(`设施: ${this.player2.selectedFacility || '未选择'}`, 800 - margin - 140, margin + 40);

        // 合作分数
        ctx.fillStyle = 'rgba(155, 89, 182, 0.8)';
        ctx.fillRect(800 / 2 - 75, margin, 150, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`合作分: ${this.coopScore}`, 800 / 2, margin + 20);
        ctx.textAlign = 'left';
    }

    // 渲染玩家2光标
    renderCursorP2(ctx) {
        const { x, y } = this.player2.cursor;

        // 光标外圈
        ctx.strokeStyle = this.player2.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.stroke();

        // 光标内圈
        ctx.fillStyle = this.player2.color + '40';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        // 选中设施预览
        if (this.player2.selectedFacility) {
            const facilityIcons = {
                HYDRANT: '💧',
                FIRE_WALL: '🧱',
                FIGHTER: '👨‍🚒',
                WATCH_TOWER: '🗼',
            };

            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(facilityIcons[this.player2.selectedFacility] || '?', x, y + 8);
            ctx.textAlign = 'left';
        }
    }

    // 开始合作模式
    startCoopMode(mode = 'shared', levelData = null) {
        this.isActive = true;
        this.mode = mode;

        // 重置玩家数据
        this.player1.angle = 45;
        this.player1.power = 50;
        this.player1.score = 0;
        this.player1.waterUsed = 0;
        this.player1.shotsHit = 0;

        this.player2.selectedFacility = null;
        this.player2.cursor = { x: 400, y: 300 };
        this.player2.facilitiesPlaced = 0;

        this.coopScore = 0;
        this.teamBonus = 0;
        this.syncBonus = 0;

        // 启动关卡
        if (levelData) {
            this.game.startLevelWithCustomData(levelData);
        }

        this.showCoopInstructions();
    }

    // 结束合作模式
    endCoopMode() {
        this.isActive = false;
        this.showCoopResults();
    }

    // 显示合作模式说明
    showCoopInstructions() {
        const modal = document.createElement('div');
        modal.className = 'coop-instructions-modal';
        modal.innerHTML = `
            <div class="coop-instructions-content">
                <h2>🤝 合作模式</h2>
                <div class="coop-players-info">
                    <div class="player-info p1">
                        <h3>玩家1</h3>
                        <p>角色：水枪操作员</p>
                        <div class="controls-info">
                            <span class="key">W</span>
                            <span class="key">S</span>
                            <span class="key">A</span>
                            <span class="key">D</span>
                            <span>调整角度力度</span>
                        </div>
                        <div class="controls-info">
                            <span class="key">空格</span>
                            <span>发射水柱</span>
                        </div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="player-info p2">
                        <h3>玩家2</h3>
                        <p>角色：设施建造师</p>
                        <div class="controls-info">
                            <span class="key">↑</span>
                            <span class="key">↓</span>
                            <span class="key">←</span>
                            <span class="key">→</span>
                            <span>移动光标</span>
                        </div>
                        <div class="controls-info">
                            <span class="key">1-4</span>
                            <span>选择设施</span>
                            <span class="key">Enter</span>
                            <span>放置</span>
                        </div>
                    </div>
                </div>
                <div class="coop-tips">
                    <h4>💡 合作提示</h4>
                    <ul>
                        <li>同步行动可获得配合奖励</li>
                        <li>玩家2的设施可以有效辅助灭火</li>
                        <li>合理分配资源和任务</li>
                    </ul>
                </div>
                <button class="coop-start-btn">开始合作！</button>
            </div>
        `;

        document.getElementById('game-container').appendChild(modal);

        modal.querySelector('.coop-start-btn').addEventListener('click', () => {
            modal.remove();
        });
    }

    // 显示合作结果
    showCoopResults() {
        const totalScore = this.player1.score + this.player2.score + this.coopScore + this.syncBonus;

        const modal = document.createElement('div');
        modal.className = 'coop-results-modal';
        modal.innerHTML = `
            <div class="coop-results-content">
                <h2>🏆 合作完成！</h2>
                <div class="coop-scores">
                    <div class="player-score p1">
                        <h3>玩家1</h3>
                        <div class="score-breakdown">
                            <p>基础分: ${this.player1.score}</p>
                            <p>命中数: ${this.player1.shotsHit}</p>
                        </div>
                        <div class="score-total">${this.player1.score}分</div>
                    </div>
                    <div class="player-score p2">
                        <h3>玩家2</h3>
                        <div class="score-breakdown">
                            <p>基础分: ${this.player2.score}</p>
                            <p>设施数: ${this.player2.facilitiesPlaced}</p>
                        </div>
                        <div class="score-total">${this.player2.score}分</div>
                    </div>
                </div>
                <div class="coop-bonuses">
                    <div class="bonus-item">
                        <span>🤝 配合奖励</span>
                        <span>+${this.syncBonus}</span>
                    </div>
                    <div class="bonus-item">
                        <span>⭐ 队伍总分</span>
                        <span>+${totalScore}</span>
                    </div>
                </div>
                <div class="coop-rating">
                    <h3>合作评级</h3>
                    <div class="rating-stars">${this.getCoopRating()}</div>
                </div>
                <button class="coop-retry-btn">再次挑战</button>
                <button class="coop-menu-btn">返回主菜单</button>
            </div>
        `;

        document.getElementById('game-container').appendChild(modal);

        modal.querySelector('.coop-retry-btn').addEventListener('click', () => {
            modal.remove();
            this.startCoopMode(this.mode);
        });

        modal.querySelector('.coop-menu-btn').addEventListener('click', () => {
            modal.remove();
            this.game.ui.showMainMenu();
        });
    }

    // 获取合作评级
    getCoopRating() {
        const totalActions = this.player1.waterUsed / 2 + this.player2.facilitiesPlaced;
        const syncRatio = this.syncBonus / Math.max(totalActions, 1);

        if (syncRatio > 0.3) {
            return '⭐⭐⭐ 完美配合！';
        } else if (syncRatio > 0.15) {
            return '⭐⭐ 良好合作';
        } else {
            return '⭐ 需要加强配合';
        }
    }

    // 计算合作分数
    calculateCoopScore() {
        // 基于两人的表现和同步度
        const individualScore = this.player1.score + this.player2.score;
        const teamBonus = Math.floor(individualScore * 0.2); // 20%队伍加成
        const syncBonus = this.syncBonus;

        this.coopScore = individualScore + teamBonus + syncBonus;
        return this.coopScore;
    }

    // 保存合作记录
    saveCoopRecord() {
        const record = {
            date: new Date().toISOString(),
            mode: this.mode,
            player1Score: this.player1.score,
            player2Score: this.player2.score,
            syncBonus: this.syncBonus,
            totalScore: this.coopScore,
            level: this.game.currentLevel,
        };

        const records = JSON.parse(localStorage.getItem('coopRecords') || '[]');
        records.push(record);
        localStorage.setItem('coopRecords', JSON.stringify(records.slice(0, 100))); // 保留最近100条
    }

    // 获取合作排行榜
    getCoopLeaderboard() {
        return JSON.parse(localStorage.getItem('coopRecords') || '[]')
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);
    }
}

// 显示合作模式菜单
export function showCoopMenu(game) {
    const container = document.getElementById('coop-menu');
    if (!container) {
        createCoopMenu();
        return showCoopMenu(game);
    }

    container.style.display = 'flex';
    document.getElementById('main-menu').style.display = 'none';

    // 渲染排行榜
    const leaderboard = game.coopMode?.getCoopLeaderboard() || [];
    const leaderboardHTML = leaderboard.length > 0
        ? leaderboard.map((record, index) => `
            <div class="coop-leaderboard-item">
                <span class="rank">${index + 1}</span>
                <span class="score">${record.totalScore}分</span>
                <span class="mode">${record.mode === 'split' ? '分屏' : '同屏'}</span>
                <span class="date">${new Date(record.date).toLocaleDateString()}</span>
            </div>
        `).join('')
        : '<p class="no-records">暂无记录</p>';

    container.innerHTML = `
        <div class="coop-menu-content">
            <h2>🤝 合作模式</h2>
            <p class="coop-subtitle">本地双人合作灭火</p>

            <div class="coop-mode-selection">
                <button class="coop-mode-btn" data-mode="shared">
                    <div class="mode-icon">🎮</div>
                    <h3>同屏模式</h3>
                    <p>两人共享同一屏幕</p>
                    <div class="mode-controls">
                        <span class="p1-controls">P1: WASD + 空格</span>
                        <span class="p2-controls">P2: 方向键 + Enter</span>
                    </div>
                </button>

                <button class="coop-mode-btn" data-mode="split">
                    <div class="mode-icon">📺</div>
                    <h3>分屏模式</h3>
                    <p>屏幕分成两部分</p>
                    <div class="mode-controls">
                        <span class="p1-controls">P1: WASD + 空格</span>
                        <span class="p2-controls">P2: 方向键 + Enter</span>
                    </div>
                </button>
            </div>

            <div class="coop-leaderboard">
                <h3>🏆 合作排行榜</h3>
                <div class="leaderboard-list">${leaderboardHTML}</div>
            </div>

            <button class="coop-back-btn">← 返回</button>
        </div>
    `;

    // 绑定事件
    container.querySelectorAll('.coop-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            container.style.display = 'none';
            game.coopMode?.startCoopMode(mode);
        });
    });

    container.querySelector('.coop-back-btn').addEventListener('click', () => {
        container.style.display = 'none';
        game.ui.showMainMenu();
    });
}

// 创建合作模式菜单
function createCoopMenu() {
    const container = document.createElement('div');
    container.id = 'coop-menu';
    container.className = 'menu-overlay';
    container.style.display = 'none';
    document.getElementById('game-container').appendChild(container);
}
