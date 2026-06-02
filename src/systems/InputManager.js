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

        // 存储事件监听器引用，用于清理
        this.eventHandlers = [];
        this.mobileControlHandlers = [];
    }

    init(game) {
        this.game = game;
        this.canvas = game.canvas;

        // 清理旧的事件监听器（如果存在）
        this.cleanup();

        // 键盘事件 - 存储处理器引用
        const keyDownHandler = (e) => this.handleKeyDown(e);
        const keyUpHandler = (e) => this.handleKeyUp(e);
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        this.eventHandlers.push({ element: document, type: 'keydown', handler: keyDownHandler });
        this.eventHandlers.push({ element: document, type: 'keyup', handler: keyUpHandler });

        // 鼠标事件
        const mouseDownHandler = (e) => this.handleMouseDown(e);
        const mouseUpHandler = (e) => this.handleMouseUp(e);
        const mouseMoveHandler = (e) => this.handleMouseMove(e);
        this.canvas.addEventListener('mousedown', mouseDownHandler);
        this.canvas.addEventListener('mouseup', mouseUpHandler);
        this.canvas.addEventListener('mousemove', mouseMoveHandler);
        this.eventHandlers.push({ element: this.canvas, type: 'mousedown', handler: mouseDownHandler });
        this.eventHandlers.push({ element: this.canvas, type: 'mouseup', handler: mouseUpHandler });
        this.eventHandlers.push({ element: this.canvas, type: 'mousemove', handler: mouseMoveHandler });

        // 触摸事件
        const touchStartHandler = (e) => this.handleTouchStart(e);
        const touchEndHandler = (e) => this.handleTouchEnd(e);
        const touchMoveHandler = (e) => this.handleTouchMove(e);
        this.canvas.addEventListener('touchstart', touchStartHandler);
        this.canvas.addEventListener('touchend', touchEndHandler);
        this.canvas.addEventListener('touchmove', touchMoveHandler);
        this.eventHandlers.push({ element: this.canvas, type: 'touchstart', handler: touchStartHandler });
        this.eventHandlers.push({ element: this.canvas, type: 'touchend', handler: touchEndHandler });
        this.eventHandlers.push({ element: this.canvas, type: 'touchmove', handler: touchMoveHandler });

        // 设施放置
        const clickHandler = (e) => this.handleCanvasClick(e);
        this.canvas.addEventListener('click', clickHandler);
        this.eventHandlers.push({ element: this.canvas, type: 'click', handler: clickHandler });

        // 移动端控制按钮
        this.setupMobileControls();
    }

    setupMobileControls() {
        const mobileControls = document.getElementById('mobile-controls');
        if (!mobileControls) return;

        // 移动设备检测 - 与 UIManager 保持一致
        const isMobile = this.isMobileDevice();

        // 注意：不在这里设置 display，由 UIManager.showGameUI() 统一控制
        // 这里只设置事件监听器

        // 角度控制
        const btnUp = document.getElementById('btn-up');
        const btnDown = document.getElementById('btn-down');
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        const btnFire = document.getElementById('btn-fire');

        // 触摸开始
        const addTouchStart = (btn, key) => {
            if (!btn) return;
            const handler = (e) => {
                e.preventDefault();
                this.keys[key] = true;
            };
            btn.addEventListener('touchstart', handler);
            this.mobileControlHandlers.push({ element: btn, type: 'touchstart', handler });
        };

        const addTouchEnd = (btn, key) => {
            if (!btn) return;
            const handler = (e) => {
                e.preventDefault();
                this.keys[key] = false;
            };
            btn.addEventListener('touchend', handler);
            this.mobileControlHandlers.push({ element: btn, type: 'touchend', handler });
        };

        addTouchStart(btnUp, 'ArrowUp');
        addTouchStart(btnDown, 'ArrowDown');
        addTouchStart(btnLeft, 'ArrowLeft');
        addTouchStart(btnRight, 'ArrowRight');

        // 按钮触摸结束
        addTouchEnd(btnUp, 'ArrowUp');
        addTouchEnd(btnDown, 'ArrowDown');
        addTouchEnd(btnLeft, 'ArrowLeft');
        addTouchEnd(btnRight, 'ArrowRight');

        // 发射按钮特殊处理
        if (btnFire) {
            const fireTouchStart = (e) => {
                e.preventDefault();
                this.isShooting = true;
            };
            const fireTouchEnd = (e) => {
                e.preventDefault();
                this.isShooting = false;
            };
            btnFire.addEventListener('touchstart', fireTouchStart);
            btnFire.addEventListener('touchend', fireTouchEnd);
            this.mobileControlHandlers.push({ element: btnFire, type: 'touchstart', handler: fireTouchStart });
            this.mobileControlHandlers.push({ element: btnFire, type: 'touchend', handler: fireTouchEnd });
        }

        // 鼠标点击（桌面端调试用）
        const addMouseEvents = (btn, key) => {
            if (!btn) return;
            const mouseDown = () => this.keys[key] = true;
            const mouseUp = () => this.keys[key] = false;
            const mouseLeave = () => this.keys[key] = false;

            btn.addEventListener('mousedown', mouseDown);
            btn.addEventListener('mouseup', mouseUp);
            btn.addEventListener('mouseleave', mouseLeave);

            this.mobileControlHandlers.push({ element: btn, type: 'mousedown', handler: mouseDown });
            this.mobileControlHandlers.push({ element: btn, type: 'mouseup', handler: mouseUp });
            this.mobileControlHandlers.push({ element: btn, type: 'mouseleave', handler: mouseLeave });
        };

        addMouseEvents(btnUp, 'ArrowUp');
        addMouseEvents(btnDown, 'ArrowDown');
        addMouseEvents(btnLeft, 'ArrowLeft');
        addMouseEvents(btnRight, 'ArrowRight');

        // 发射按钮鼠标事件
        if (btnFire) {
            const fireMouseDown = () => this.isShooting = true;
            const fireMouseUp = () => this.isShooting = false;
            const fireMouseLeave = () => this.isShooting = false;

            btnFire.addEventListener('mousedown', fireMouseDown);
            btnFire.addEventListener('mouseup', fireMouseUp);
            btnFire.addEventListener('mouseleave', fireMouseLeave);

            this.mobileControlHandlers.push({ element: btnFire, type: 'mousedown', handler: fireMouseDown });
            this.mobileControlHandlers.push({ element: btnFire, type: 'mouseup', handler: fireMouseUp });
            this.mobileControlHandlers.push({ element: btnFire, type: 'mouseleave', handler: fireMouseLeave });
        }
    }

    isMobileDevice() {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0)
        );
    }

    handleKeyDown(e) {
        // 安全检查
        if (!e || !e.key) return;

        this.keys[e.key] = true;

        if (!this.game) return;

        // Round 4: 关卡编辑器按键
        if (this.game.levelEditorSystem?.isActive) {
            if (this.game.levelEditorSystem.handleKeyPress(e.code)) {
                return;
            }
        }

        // Round 4: 消防员切换 (Tab键)
        if (e.key === 'Tab' && (this.game.state === GAME_STATE.BATTLE || this.game.state === GAME_STATE.PREPARE)) {
            e.preventDefault();
            this.game.fighterSystem?.switchFighter();
            return;
        }

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
        if (e.key === KEYS.SPACE || e.key === ' ') {
            this.isShooting = true;
        }

        // 暂停
        if (e.key === KEYS.ESC || e.key === 'Escape') {
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
        // 持续按键处理 - 角度和力度
        if (this.game.state === GAME_STATE.BATTLE) {
            if (this.keys['ArrowUp']) {
                this.angle = Math.min(this.angle + 1.5, WATER_CONFIG.MAX_ANGLE);
            }
            if (this.keys['ArrowDown']) {
                this.angle = Math.max(this.angle - 1.5, WATER_CONFIG.MIN_ANGLE);
            }
            if (this.keys['ArrowLeft']) {
                this.power = Math.max(this.power - 1.5, WATER_CONFIG.MIN_POWER);
            }
            if (this.keys['ArrowRight']) {
                this.power = Math.min(this.power + 1.5, WATER_CONFIG.MAX_POWER);
            }
        }

        // 发射水柱
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

    /**
     * 清理所有事件监听器，防止内存泄漏
     */
    cleanup() {
        // 清理主要事件监听器
        this.eventHandlers.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventHandlers = [];

        // 清理移动端控制按钮事件监听器
        this.mobileControlHandlers.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.mobileControlHandlers = [];

        // 重置状态
        this.keys = {};
        this.isShooting = false;
    }

    /**
     * 销毁实例，释放所有资源
     */
    destroy() {
        this.cleanup();
        this.game = null;
        this.canvas = null;
    }
}
