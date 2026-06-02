/**
 * TutorialSystem - 教程系统
 * 首次进入时显示操作指引
 */
import { GAME_STATE } from '../utils/constants.js';

export class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.currentStep = 0;
        this.steps = [
            {
                title: '欢迎来到消防灭火游戏！',
                content: '拖拽鼠标调整角度和力度，瞄准火焰。',
                position: 'bottom',
                action: 'aim'
            },
            {
                title: '发射水柱',
                content: '松开鼠标发射水柱灭火。',
                position: 'bottom',
                action: 'shoot'
            },
            {
                title: '保护建筑',
                content: '在所有建筑被烧毁前扑灭火焰！',
                position: 'top',
                action: 'protect'
            },
            {
                title: '注意风向',
                content: '火焰会随风蔓延，逆风灭火更困难。',
                position: 'top',
                action: 'wind'
            },
            {
                title: '开始游戏！',
                content: '你已掌握基本操作，祝你好运！',
                position: 'center',
                action: 'start'
            }
        ];
        this.completed = false;
        this.element = null;
        this.storageKey = 'fireFighterTutorialCompleted';
    }

    init() {
        // 检查是否已完成教程
        const saved = localStorage.getItem(this.storageKey);
        this.completed = saved === 'true';

        if (!this.completed) {
            this.showTutorial();
        }
    }

    showTutorial() {
        // 创建教程遮罩层
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.id = 'tutorial-overlay';
            this.element.className = 'tutorial-overlay';
            document.body.appendChild(this.element);
        }

        this.renderStep();
    }

    renderStep() {
        if (this.completed || this.currentStep >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[this.currentStep];
        const element = this.element;

        element.className = `tutorial-overlay step-${this.currentStep}`;

        element.innerHTML = `
            <div class="tutorial-box tutorial-${step.position}">
                <div class="tutorial-title">${step.title}</div>
                <div class="tutorial-content">${step.content}</div>
                <div class="tutorial-progress">
                    <span class="tutorial-dots">
                        ${this.steps.map((_, i) =>
                            `<span class="dot ${i === this.currentStep ? 'active' : ''} ${i < this.currentStep ? 'completed' : ''}"></span>`
                        ).join('')}
                    </span>
                </div>
                <button class="tutorial-btn tutorial-next">下一步</button>
                ${this.currentStep > 0 ? '<button class="tutorial-btn tutorial-prev">上一步</button>' : ''}
                <button class="tutorial-btn tutorial-skip">跳过教程</button>
            </div>
        `;

        // 绑定按钮事件
        element.querySelector('.tutorial-next')?.addEventListener('click', () => this.nextStep());
        element.querySelector('.tutorial-prev')?.addEventListener('click', () => this.prevStep());
        element.querySelector('.tutorial-skip')?.addEventListener('click', () => this.complete());
    }

    nextStep() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.complete();
        } else {
            this.renderStep();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }

    complete() {
        this.completed = true;
        localStorage.setItem(this.storageKey, 'true');
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    reset() {
        this.completed = false;
        this.currentStep = 0;
        localStorage.removeItem(this.storageKey);
    }
}
