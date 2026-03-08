class UI {
    constructor() {
        this.elements = {};
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
            levels.startLevel(this.game, 0);
        });
        
        this.elements.btnLevels.addEventListener('click', () => {
            this.showLevelMenu();
        });
        
        this.elements.btnBack.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        this.elements.btnRetry.addEventListener('click', () => {
            this.hideAllMenus();
            levels.startLevel(this.game, this.game.currentLevel);
        });
        
        this.elements.btnNext.addEventListener('click', () => {
            if (this.game.currentLevel < LEVEL_DATA.length - 1) {
                this.hideAllMenus();
                levels.startLevel(this.game, this.game.currentLevel + 1);
            }
        });
        
        this.elements.btnMenu.addEventListener('click', () => {
            this.showMainMenu();
        });
        
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
            card.innerHTML = `
                <div class="level-number">${index + 1}</div>
                <div class="level-name">${level.name}</div>
                <div class="level-desc">${level.description}</div>
                <div class="level-stars">${'⭐'.repeat(this.getLevelStars(index))}</div>
            `;
            
            card.addEventListener('click', () => {
                if (this.isLevelUnlocked(index)) {
                    this.hideAllMenus();
                    levels.startLevel(this.game, index);
                }
            });
            
            this.elements.levelGrid.appendChild(card);
        });
    }
    
    isLevelUnlocked(index) {
        // 第一关始终解锁
        if (index === 0) return true;
        
        // 检查前一关是否通关
        const progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
        return progress[index - 1] && progress[index - 1].completed;
    }
    
    getLevelStars(index) {
        const progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
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
        
        if (this.game.state === GAME_STATE.PREPARE) {
            this.elements.prepareMessage.style.display = 'block';
            this.elements.prepareTimer.style.display = 'block';
        }
    }
    
    hideGameUI() {
        this.elements.topHud.style.display = 'none';
        this.elements.bottomHud.style.display = 'none';
        this.elements.sidebar.style.display = 'none';
        this.elements.prepareMessage.style.display = 'none';
        this.elements.prepareTimer.style.display = 'none';
    }
    
    updateHUD(time, water, score, angle, power) {
        this.elements.timeDisplay.textContent = this.formatTime(time);
        this.elements.waterDisplay.textContent = Math.floor(water);
        this.elements.scoreDisplay.textContent = Math.floor(score);
        this.elements.angleDisplay.textContent = `${angle}°`;
        this.elements.powerDisplay.textContent = `${power}%`;
        
        // 更新进度条
        this.elements.angleFill.style.width = `${(angle / WATER_CONFIG.MAX_ANGLE) * 100}%`;
        this.elements.powerFill.style.width = `${power}%`;
        
        // 水量警告
        if (water < 200) {
            this.elements.waterDisplay.classList.add('danger');
        } else if (water < 500) {
            this.elements.waterDisplay.classList.add('warning');
        } else {
            this.elements.waterDisplay.classList.remove('warning', 'danger');
        }
    }
    
    updatePrepareTimer(time) {
        this.elements.prepareTimer.textContent = Math.ceil(time);
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
        const progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
        
        if (!progress[levelIndex] || progress[levelIndex].stars < stars) {
            progress[levelIndex] = {
                completed: true,
                stars: stars,
                score: score
            };
            localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// 创建全局实例
const ui = new UI();
