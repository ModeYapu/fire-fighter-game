class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.state = GAME_STATE.MENU;
        this.currentLevel = 0;
        this.score = 0;
        this.water = RESOURCE_CONFIG.INITIAL_WATER;
        this.time = 0;
        this.buildings = [];
        this.fires = [];
        this.facilities = [];
        this.waterDroplets = [];
        this.particles = [];
        
        // 策略系统
        this.prepareTime = GAME_CONFIG.PREPARE_TIME;
        this.selectedFacility = null;
        
        // 帧率独立计时
        this.lastTime = 0;
    }
    
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化UI
        ui.init(this);
        
        // 初始化输入
        input.init(this);
        
        // 启动游戏循环
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    gameLoop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // 限制deltaTime防止长时间暂停后的跳跃
        const cappedDelta = Math.min(deltaTime, 0.1);
        
        this.update(cappedDelta);
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(deltaTime) {
        switch(this.state) {
            case GAME_STATE.PREPARE:
                this.updatePrepare(deltaTime);
                break;
            case GAME_STATE.BATTLE:
                this.updateBattle(deltaTime);
                break;
        }
    }
    
    updatePrepare(deltaTime) {
        // 准备阶段倒计时（帧率独立）
        this.prepareTime -= deltaTime;
        if (this.prepareTime <= 0) {
            this.startBattle();
        }
        ui.updatePrepareTimer(this.prepareTime);
        
        // 更新输入
        input.update();
    }
    
    updateBattle(deltaTime) {
        // 更新输入
        input.update();
        
        // 更新物理
        physics.update(this);
        
        // 更新水柱
        water.update(this);
        
        // 更新火焰
        fire.update(this);
        
        // 更新建筑
        building.update(this);
        
        // 更新设施
        facility.update(this);
        
        // 更新粒子
        particles.update(this);
        
        // 更新时间
        this.time -= deltaTime;
        
        // 检查胜负
        this.checkWinLose();
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.renderBackground();
        
        // 绘制建筑
        building.render(this);
        
        // 绘制设施
        facility.render(this);
        
        // 绘制火焰
        fire.render(this);
        
        // 绘制水柱
        water.render(this);
        
        // 绘制粒子
        particles.render(this);
    }
    
    renderBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.7, '#16213e');
        gradient.addColorStop(1, '#2d3436');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 地面
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
    }
    
    startLevel(levelIndex) {
        // 验证关卡索引
        if (levelIndex < 0 || levelIndex >= LEVEL_DATA.length) {
            console.error('Invalid level index:', levelIndex);
            return;
        }
        
        this.currentLevel = levelIndex;
        const levelData = LEVEL_DATA[levelIndex];
        
        // 重置游戏状态
        this.score = 0;
        this.water = levelData.initialWater;
        this.time = levelData.time;
        this.prepareTime = GAME_CONFIG.PREPARE_TIME;
        this.waterDroplets = [];
        this.particles = [];
        
        // 清空并重建建筑（修复重复添加Bug）
        building.buildings = [];
        this.buildings = building.buildings;  // 使用同一个数组引用
        
        levelData.buildings.forEach(b => {
            building.create(b.type, b.x, b.y);
        });
        
        // 清空其他系统
        fire.fires = [];
        this.fires = fire.fires;
        
        facility.facilities = [];
        this.facilities = facility.facilities;
        
        // 切换到准备阶段
        this.state = GAME_STATE.PREPARE;
        ui.showGameUI();
    }
    
    startBattle() {
        this.state = GAME_STATE.BATTLE;
        
        // 点燃初始建筑
        LEVEL_DATA[this.currentLevel].initialFires.forEach(idx => {
            if (idx >= 0 && idx < this.buildings.length) {
                fire.ignite(this, this.buildings[idx]);
            }
        });
    }
    
    checkWinLose() {
        // 检查是否所有火都熄灭
        const hasFire = this.fires.some(f => f.intensity > 0);
        
        // 检查是否所有建筑都损毁
        const hasBuilding = this.buildings.some(b => b.health > 0);
        
        // 检查时间是否耗尽
        const timeUp = this.time <= 0;
        
        if (!hasFire) {
            this.win();
        } else if (!hasBuilding || this.water <= 0 || timeUp) {
            this.lose();
        }
    }
    
    win() {
        this.state = GAME_STATE.WIN;
        ui.showResult(true, this.score, this.water, this.buildings.filter(b => b.health > 0).length);
    }
    
    lose() {
        this.state = GAME_STATE.LOSE;
        ui.showResult(false, this.score, this.water, this.buildings.filter(b => b.health > 0).length);
    }
}

// 全局变量
let game;
let ui;
let input;
let physics;
let water;
let fire;
let building;
let facility;
let particles;
let levels;
