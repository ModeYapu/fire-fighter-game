/**
 * Game - 游戏主类
 * 整合所有系统，管理游戏循环和状态
 */
import { GAME_CONFIG, GAME_STATE, LEVEL_DATA, RESOURCE_CONFIG } from '../utils/constants.js';
import { BuildingSystem } from './Building.js';
import { FireSystem } from './Fire.js';
import { WaterSystem } from './Water.js';
import { ParticleSystem } from './ParticleSystem.js';
import { FacilitySystem } from './Facility.js';
import { BackgroundSystem } from './BackgroundSystem.js';
import { PhysicsEngine } from '../systems/PhysicsEngine.js';
import { InputManager } from '../systems/InputManager.js';
import { UIManager } from '../systems/UIManager.js';

export class Game {
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
        this.waterDroplets = [];
        this.particles = null;

        // 策略系统
        this.prepareTime = GAME_CONFIG.PREPARE_TIME;
        this.selectedFacility = null;
        this.facilities = [];

        // 系统组件
        this.buildingSystem = new BuildingSystem();
        this.fireSystem = new FireSystem();
        this.waterSystem = new WaterSystem();
        this.particleSystem = new ParticleSystem();
        this.facilitySystem = new FacilitySystem();
        this.backgroundSystem = new BackgroundSystem();
        this.physicsEngine = new PhysicsEngine();
        this.inputManager = new InputManager();
        this.ui = new UIManager();

        // 帧率独立计时
        this.lastTime = 0;

        // 共享引用
        this.buildings = this.buildingSystem.buildings;
        this.fires = this.fireSystem.fires;
        this.waterDroplets = this.waterSystem.droplets;
        this.particles = this.particleSystem;
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 初始化UI
        this.ui.init(this);

        // 初始化输入
        this.inputManager.init(this);

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
        switch (this.state) {
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
        this.ui.updatePrepareTimer(this.prepareTime);

        // 更新输入
        this.inputManager.update();
        
        // 更新设施
        this.facilitySystem.update(this);
    }

    updateBattle(deltaTime) {
        // 更新输入
        this.inputManager.update();

        // 更新物理
        this.physicsEngine.update(this);

        // 更新水柱
        this.waterSystem.update(this);

        // 更新火焰
        this.fireSystem.update(this);

        // 更新建筑
        this.buildingSystem.update(this);

        // 更新粒子
        this.particleSystem.update(this);
        
        // 更新设施
        this.facilitySystem.update(this);
        
        // 更新背景
        this.backgroundSystem.update(deltaTime);

        // 更新时间
        this.time -= deltaTime;

        // 检查胜负
        this.checkWinLose();
    }

    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制动态背景
        this.backgroundSystem.render(this.ctx, this.canvas.width, this.canvas.height);

        // 绘制建筑
        this.buildingSystem.render(this.ctx);
        
        // 绘制设施
        this.facilitySystem.render(this.ctx);

        // 绘制火焰
        this.fireSystem.render(this);

        // 绘制水柱
        this.waterSystem.render(this);

        // 绘制粒子
        this.particleSystem.render(this);
    }

    renderBackground() {
        // 由 backgroundSystem 处理动态背景
        this.backgroundSystem.render(this.ctx, this.canvas.width, this.canvas.height);

        // 绘制发射点（消防车）
        this.renderFireTruck();
    }

    renderFireTruck() {
        // 消防车主体
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(50, this.canvas.height - 70, 80, 20);

        // 消防车轮子
        this.ctx.fillStyle = '#34495e';
        this.ctx.beginPath();
        this.ctx.arc(70, this.canvas.height - 50, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(110, this.canvas.height - 50, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // 水枪
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(100, this.canvas.height - 60, 8, 0, Math.PI * 2);
        this.ctx.fill();
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
        this.selectedFacility = null;
        this.facilities = [];

        // 清空并重建建筑
        this.buildingSystem.buildings = [];
        this.buildings = this.buildingSystem.buildings;

        levelData.buildings.forEach(b => {
            this.buildingSystem.create(b.type, b.x, b.y);
        });

        // 清空其他系统
        this.fireSystem.clear();
        this.fires = this.fireSystem.fires;

        this.waterSystem.clear();
        this.waterDroplets = this.waterSystem.droplets;

        this.particleSystem.clear();

        // 清空设施
        this.facilitySystem.clear();

        // 切换到准备阶段
        this.state = GAME_STATE.PREPARE;
        this.ui.showGameUI();
    }

    startBattle() {
        this.state = GAME_STATE.BATTLE;

        // 点燃初始建筑
        LEVEL_DATA[this.currentLevel].initialFires.forEach(idx => {
            if (idx >= 0 && idx < this.buildings.length) {
                this.fireSystem.ignite(this.buildings[idx]);
            }
        });
    }

    shootWater(angle, power) {
        this.waterSystem.shoot(this, angle, power);
    }

    placeFacility(type, x, y) {
        const result = this.facilitySystem.place(this, type, x, y);
        if (result) {
            console.log(`放置设施成功: ${type} at (${x}, ${y})`);
        } else {
            console.log(`放置设施失败: ${type} at (${x}, ${y})`);
        }
        return result;
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
        const savedBuildings = this.buildings.filter(b => b.health > 0).length;
        this.ui.showResult(true, this.score, this.water, savedBuildings);
    }

    lose() {
        this.state = GAME_STATE.LOSE;
        const savedBuildings = this.buildings.filter(b => b.health > 0).length;
        this.ui.showResult(false, this.score, this.water, savedBuildings);
    }
}
