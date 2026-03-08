/**
 * InputManager - 输入管理系统
 * 处理键盘、鼠标、触摸事件
 */
import { GAME_STATE, KEYS, WATER_CONFIG } from '../utils/constants.js';

export class InputManager {
    constructor() {
        this.angle = 45;
        this.power = 50;
        this.isShooting = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.keys = {};

        this.game = null;
        this.canvas = null;
    }

    init(game) {
        this.game = game;
        this.canvas = game.canvas;

        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));

        // 设施放置
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;

        if (this.game.state !== GAME_STATE.BATTLE) return;

        // 角度控制
        if (e.key === KEYS.UP || e.key === 'ArrowUp') {
            this.angle = Math.min(this.angle + 2, WATER_CONFIG.MAX_ANGLE);
        } else if (e.key === KEYS.DOWN || e.key === 'ArrowDown') {
            this.angle = Math.max(this.angle - 2, WATER_CONFIG.MIN_ANGLE);
        }

        // 力度控制
        if (e.key === KEYS.LEFT || e.key === 'ArrowLeft') {
            this.power = Math.max(this.power - 2, WATER_CONFIG.MIN_POWER);
        } else if (e.key === KEYS.RIGHT || e.key === 'ArrowRight') {
            this.power = Math.min(this.power + 2, WATER_CONFIG.MAX_POWER);
        }

        // 发射
        if (e.key === KEYS.SPACE) {
            this.isShooting = true;
        }

        // 暂停
        if (e.key === KEYS.ESC) {
            // TODO: 暂停功能
        }
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;

        if (e.key === KEYS.SPACE) {
            this.isShooting = false;
        }
    }

    handleMouseDown(e) {
        if (this.game.state === GAME_STATE.BATTLE) {
            this.isShooting = true;
        }
    }

    handleMouseUp(e) {
        this.isShooting = false;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        // 在战斗阶段，鼠标位置影响角度和力度
        if (this.game.state === GAME_STATE.BATTLE) {
            this.calculateAngleFromMouse();
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseDown(touch);
        this.handleMouseMove(touch);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp(e);
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove(touch);
    }

    handleCanvasClick(e) {
        // 在准备阶段，点击放置设施
        if (this.game.state === GAME_STATE.PREPARE && this.game.selectedFacility) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.game.placeFacility(this.game.selectedFacility, x, y);
        }
    }

    calculateAngleFromMouse() {
        // 基于鼠标位置计算角度和力度
        const dx = this.mouseX - 100; // 发射点x坐标
        const dy = this.canvas.height - 50 - this.mouseY; // 发射点y坐标

        this.angle = Math.min(Math.max(Math.atan2(dy, dx) * 180 / Math.PI, 0), WATER_CONFIG.MAX_ANGLE);
        this.power = Math.min(Math.max(Math.sqrt(dx * dx + dy * dy) / 3, WATER_CONFIG.MIN_POWER), WATER_CONFIG.MAX_POWER);
    }

    update() {
        // 持续按键处理
        if (this.game.state === GAME_STATE.BATTLE && this.isShooting) {
            this.game.shootWater(this.angle, this.power);
        }

        // 更新UI
        this.game.ui.updateHUD(
            this.game.time,
            this.game.water,
            this.game.score,
            Math.round(this.angle),
            Math.round(this.power)
        );
    }
}
