/**
 * UIManager - UI管理系统
 * 管理HUD、菜单、关卡选择、结果显示等所有UI元素
 */
import { GAME_STATE, WATER_CONFIG, STORAGE_KEYS, LEVEL_DATA } from '../utils/constants.js';
import { SecureStorage } from '../utils/storage.js';

export class UIManager {
    constructor() {
        this.elements = {};
        this.game = null;

        // DOM更新优化 - 缓存上次值，避免不必要的DOM操作
        this.lastHUDValues = {
            time: -1,
            water: -1,
            score: -1,
            angle: -1,
            power: -1
        };

        // 更新节流 - 限制每秒更新次数
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // 最少间隔100ms
    }

    init(game) {
        this.game = game;

        // 缓存DOM元素
        this.elements = {
            mainMenu: document.getElementById('main-menu'),
            levelMenu: document.getElementById('level-menu'),
            levelGrid: document.getElementById('level-grid'),
            topHud: document.getElementById('top-hud'),
            bottomHud: document.getElementById('bottom-hud'),
            sidebar: document.getElementById('sidebar'),
            prepareMessage: document.getElementById('prepare-message'),
            prepareTimer: document.getElementById('prepare-timer'),
            resultMenu: document.getElementById('result-menu'),

            // HUD元素
            timeDisplay: document.getElementById('time-display'),
            waterDisplay: document.getElementById('water-display'),
            scoreDisplay: document.getElementById('score-display'),
            angleDisplay: document.getElementById('angle-display'),
            powerDisplay: document.getElementById('power-display'),
            angleFill: document.getElementById('angle-fill'),
            powerFill: document.getElementById('power-fill'),

            // 按钮
            btnPlay: document.getElementById('btn-play'),
            btnLevels: document.getElementById('btn-levels'),
            btnBack: document.getElementById('btn-back'),
            btnRetry: document.getElementById('btn-retry'),
            btnNext: document.getElementById('btn-next'),
            btnMenu: document.getElementById('btn-menu'),
        };

        this.setupEventListeners();
        this.createLevelCards();
    }

    setupEventListeners() {
        // 主菜单按钮
        this.elements.btnPlay.addEventListener('click', () => {
            this.hideAllMenus();
            this.game.startLevel(0);
        });

        this.elements.btnLevels.addEventListener('click', () => {
            this.showLevelMenu();
        });

        this.elements.btnBack.addEventListener('click', () => {
            this.showMainMenu();
        });

        this.elements.btnRetry.addEventListener('click', () => {
            this.hideAllMenus();
            this.game.startLevel(this.game.currentLevel);
        });

        this.elements.btnNext.addEventListener('click', () => {
            if (this.game.currentLevel < LEVEL_DATA.length - 1) {
                this.hideAllMenus();
                this.game.startLevel(this.game.currentLevel + 1);
            }
        });

        this.elements.btnMenu.addEventListener('click', () => {
            this.showMainMenu();
        });

        // 跳过准备阶段按钮
        const btnSkip = document.getElementById('btn-skip');
        if (btnSkip) {
            btnSkip.addEventListener('click', () => {
                if (this.game.state === GAME_STATE.PREPARE) {
                    this.game.startBattle();
                }
            });
        }

        // 设施按钮
        document.querySelectorAll('.facility-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const facilityType = e.currentTarget.dataset.facility;
                this.selectFacility(facilityType);
            });
        });
    }

    createLevelCards() {
        LEVEL_DATA.forEach((level, index) => {
            const card = document.createElement('div');
            card.className = 'level-card';

            // 使用安全的DOM操作防止XSS攻击
            const numberDiv = document.createElement('div');
            numberDiv.className = 'level-number';
            numberDiv.textContent = index + 1;

            const nameDiv = document.createElement('div');
            nameDiv.className = 'level-name';
            nameDiv.textContent = level.name;

            const descDiv = document.createElement('div');
            descDiv.className = 'level-desc';
            descDiv.textContent = level.description;

            const starsDiv = document.createElement('div');
            starsDiv.className = 'level-stars';
            starsDiv.textContent = '⭐'.repeat(this.getLevelStars(index));

            card.appendChild(numberDiv);
            card.appendChild(nameDiv);
            card.appendChild(descDiv);
            card.appendChild(starsDiv);

            card.addEventListener('click', () => {
                if (this.isLevelUnlocked(index)) {
                    this.hideAllMenus();
                    this.game.startLevel(index);
                }
            });

            this.elements.levelGrid.appendChild(card);
        });
    }

    isLevelUnlocked(index) {
        // 第一关始终解锁
        if (index === 0) return true;

        // 使用安全存储工具
        const progress = SecureStorage.getItem(STORAGE_KEYS.PROGRESS, {}, SecureStorage.validators.progress);
        return progress[index - 1] && progress[index - 1].completed;
    }

    getLevelStars(index) {
        const progress = SecureStorage.getItem(STORAGE_KEYS.PROGRESS, {}, SecureStorage.validators.progress);
        return progress[index] ? progress[index].stars : 0;
    }

    selectFacility(type) {
        this.game.selectedFacility = type;

        // 更新UI
        document.querySelectorAll('.facility-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.facility === type) {
                btn.classList.add('selected');
            }
        });
    }

    showMainMenu() {
        this.hideAllMenus();
        this.elements.mainMenu.style.display = 'flex';
        this.game.state = GAME_STATE.MENU;

        // 显示教程（如果未完成）
        if (this.game.tutorialSystem && !this.game.tutorialSystem.completed) {
            // 延迟一点显示，让主菜单先显示
            setTimeout(() => {
                this.game.tutorialSystem.showTutorial();
            }, 300);
        }
    }

    showLevelMenu() {
        this.hideAllMenus();
        this.elements.levelMenu.style.display = 'flex';
    }

    hideAllMenus() {
        this.elements.mainMenu.style.display = 'none';
        this.elements.levelMenu.style.display = 'none';
        this.elements.resultMenu.style.display = 'none';
    }

    showGameUI() {
        this.elements.topHud.style.display = 'flex';
        this.elements.bottomHud.style.display = 'flex';
        this.elements.sidebar.style.display = 'flex';

        // 移动端控制按钮 - 使用更可靠的检测方式
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls && this.isMobileDevice()) {
            mobileControls.style.display = 'flex';
        }

        if (this.game.state === GAME_STATE.PREPARE) {
            this.elements.prepareMessage.style.display = 'block';
            this.elements.prepareTimer.style.display = 'block';
        }
    }

    isMobileDevice() {
        // 检测触摸设备和移动设备
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0)
        );
    }

    hideGameUI() {
        this.elements.topHud.style.display = 'none';
        this.elements.bottomHud.style.display = 'none';
        this.elements.sidebar.style.display = 'none';
        this.elements.prepareMessage.style.display = 'none';
        this.elements.prepareTimer.style.display = 'none';

        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
    }

    updateHUD(time, water, score, angle, power) {
        // 节流检查 - 避免过于频繁的DOM更新
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateInterval) {
            return;
        }
        this.lastUpdateTime = now;

        // 更新风向指示器
        this.updateWindIndicator();

        // 优化：只有当值真正改变时才更新DOM
        const formattedTime = this.formatTime(time);
        if (formattedTime !== this.lastHUDValues.time) {
            this.elements.timeDisplay.textContent = formattedTime;
            this.lastHUDValues.time = formattedTime;
        }

        const floorWater = Math.floor(water);
        if (floorWater !== this.lastHUDValues.water) {
            this.elements.waterDisplay.textContent = floorWater;
            this.lastHUDValues.water = floorWater;

            // 水量警告 - 优化classList操作
            this.updateWaterWarning(water);
        }

        const floorScore = Math.floor(score);
        if (floorScore !== this.lastHUDValues.score) {
            this.elements.scoreDisplay.textContent = floorScore;
            this.lastHUDValues.score = floorScore;
        }

        const angleStr = `${angle}°`;
        if (angleStr !== this.lastHUDValues.angle) {
            this.elements.angleDisplay.textContent = angleStr;
            this.lastHUDValues.angle = angleStr;

            // 更新角度进度条
            this.elements.angleFill.style.width = `${(angle / WATER_CONFIG.MAX_ANGLE) * 100}%`;
        }

        const powerStr = `${power}%`;
        if (powerStr !== this.lastHUDValues.power) {
            this.elements.powerDisplay.textContent = powerStr;
            this.lastHUDValues.power = powerStr;

            // 更新力度进度条
            this.elements.powerFill.style.width = `${power}%`;
        }
    }

    // 优化水量警告更新逻辑
    updateWaterWarning(water) {
        const waterDisplay = this.elements.waterDisplay;
        const hasWarning = waterDisplay.classList.contains('warning');
        const hasDanger = waterDisplay.classList.contains('danger');

        if (water < 200 && !hasDanger) {
            waterDisplay.classList.remove('warning');
            waterDisplay.classList.add('danger');
        } else if (water >= 200 && water < 500 && !hasWarning) {
            waterDisplay.classList.remove('danger');
            waterDisplay.classList.add('warning');
        } else if (water >= 500 && (hasWarning || hasDanger)) {
            waterDisplay.classList.remove('warning', 'danger');
        }
    }

    updatePrepareTimer(time) {
        this.elements.prepareTimer.textContent = Math.ceil(time);
    }

    updateWindIndicator() {
        const windIndicator = document.getElementById('wind-indicator');
        if (!windIndicator || !this.game || !this.game.fireSystem) return;

        const wind = this.game.fireSystem.windDirection || 0;
        const windArrow = windIndicator.querySelector('.wind-arrow');
        const windText = windIndicator.querySelector('.wind-text');

        if (windArrow) {
            const rotation = wind * 15; // 每单位风力旋转15度
            windArrow.style.transform = `rotate(${rotation}deg)`;
        }

        if (windText) {
            const windLevel = Math.abs(wind);
            let windDesc = '无风';
            if (windLevel > 7) windDesc = '强风';
            else if (windLevel > 4) windDesc = '中风';
            else if (windLevel > 1) windDesc = '微风';

            const windDir = wind > 0 ? '→' : wind < 0 ? '←' : '•';
            windText.textContent = `${windDesc} ${windDir}`;
        }
    }

    renderWindArrow(ctx, x, y, wind) {
        // 绘制风向箭头
        ctx.save();
        ctx.translate(x, y);

        const windLevel = Math.abs(wind);
        const arrowLength = 20 + windLevel * 3;
        const rotation = wind * 15;
        ctx.rotate(rotation * Math.PI / 180);

        // 箭头颜色根据风力强度
        const arrowColor = windLevel > 7 ? '#e74c3c' :
                          windLevel > 4 ? '#f39c12' :
                          windLevel > 1 ? '#3498db' : '#95a5a6';

        ctx.fillStyle = arrowColor;
        ctx.beginPath();
        ctx.moveTo(arrowLength, 0);
        ctx.lineTo(-5, -8);
        ctx.lineTo(-5, 8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // 风力文字
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        const windDesc = windLevel > 7 ? '强风' :
                        windLevel > 4 ? '中风' :
                        windLevel > 1 ? '微风' : '无风';
        ctx.fillText(windDesc, x, y + 25);
    }

    showResult(win, score, water, buildings) {
        this.hideGameUI();
        this.elements.resultMenu.style.display = 'flex';

        const title = document.getElementById('result-title');
        title.textContent = win ? '胜利!' : '失败!';
        title.className = `result-title ${win ? 'win' : 'lose'}`;

        document.getElementById('result-score').textContent = score;
        document.getElementById('result-water').textContent = water;
        document.getElementById('result-buildings').textContent = buildings;

        // 计算星级
        const stars = this.calculateStars(score, water, buildings);
        document.getElementById('result-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

        // 保存进度
        if (win) {
            this.saveProgress(this.game.currentLevel, stars, score);
        }
    }

    showResultWithGrade(win, score, water, buildings, scoreDetails) {
        this.hideGameUI();
        this.elements.resultMenu.style.display = 'flex';

        const title = document.getElementById('result-title');
        title.textContent = win ? '胜利!' : '失败!';
        title.className = `result-title ${win ? 'win' : 'lose'}`;

        document.getElementById('result-score').textContent = score;
        document.getElementById('result-water').textContent = water;
        document.getElementById('result-buildings').textContent = buildings;

        // Round 4: 显示评分等级而非星级
        if (scoreDetails && scoreDetails.grade) {
            const gradeElement = document.getElementById('result-stars');
            if (gradeElement) {
                const gradeConfig = this.game.scoringSystem.getGradeConfig(scoreDetails.grade);
                gradeElement.innerHTML = `<span style="color: ${gradeConfig.color}; font-size: 32px;">${gradeConfig.name}</span>`;
            }
        } else {
            // Fallback to stars
            const stars = this.calculateStars(score, water, buildings);
            document.getElementById('result-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        }

        // 保存进度
        if (win) {
            const stars = this.calculateStars(score, water, buildings);
            this.saveProgress(this.game.currentLevel, stars, score);
        }
    }

    calculateStars(score, water, buildings) {
        const levelData = LEVEL_DATA[this.game.currentLevel];
        const targetScore = levelData.targetScore;

        if (score >= targetScore * 1.5 && water > 500 && buildings === this.game.buildings.length) {
            return 3;
        } else if (score >= targetScore) {
            return 2;
        } else {
            return 1;
        }
    }

    saveProgress(levelIndex, stars, score) {
        const progress = SecureStorage.getItem(STORAGE_KEYS.PROGRESS, {}, SecureStorage.validators.progress);

        if (!progress[levelIndex] || progress[levelIndex].stars < stars) {
            progress[levelIndex] = {
                completed: true,
                stars: stars,
                score: score
            };
            SecureStorage.setItem(STORAGE_KEYS.PROGRESS, progress, SecureStorage.validators.progress);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
