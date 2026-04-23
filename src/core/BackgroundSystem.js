/**
 * BackgroundSystem - 动态背景系统
 * 实现云朵飘动、星星闪烁、渐变天空等效果
 */

export class BackgroundSystem {
    constructor() {
        this.clouds = [];
        this.stars = [];
        this.timeOfDay = 0; // 0-1, 0=白天, 0.5=黄昏, 1=夜晚
        this.animationTimer = 0;

        // 初始化云朵
        for (let i = 0; i < 5; i++) {
            this.clouds.push(this.createCloud());
        }

        // 初始化星星
        for (let i = 0; i < 50; i++) {
            this.stars.push(this.createStar());
        }
    }

    createCloud() {
        return {
            x: Math.random() * 800,
            y: 50 + Math.random() * 150,
            width: 60 + Math.random() * 80,
            height: 25 + Math.random() * 20,
            speed: 0.2 + Math.random() * 0.3,
            opacity: 0.3 + Math.random() * 0.3,
            puffCount: 3 + Math.floor(Math.random() * 3)
        };
    }

    createStar() {
        return {
            x: Math.random() * 800,
            y: Math.random() * 300,
            size: 1 + Math.random() * 2,
            twinkleSpeed: 0.02 + Math.random() * 0.03,
            twinkleOffset: Math.random() * Math.PI * 2,
            baseOpacity: 0.3 + Math.random() * 0.5
        };
    }

    update(deltaTime) {
        this.animationTimer += deltaTime;

        // 更新云朵位置
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > 850) {
                cloud.x = -cloud.width;
            }
        });

        // 星星闪烁效果通过在render中计算实现
    }

    render(ctx, canvasWidth, canvasHeight) {
        this.renderSky(ctx, canvasWidth, canvasHeight);
        this.renderStars(ctx);
        this.renderClouds(ctx);
        this.renderMoon(ctx);
        this.renderGround(ctx, canvasWidth, canvasHeight);
    }

    renderSky(ctx, width, height) {
        const time = this.animationTimer;

        // 动态天空渐变（随时间变化）
        const gradient = ctx.createLinearGradient(0, 0, 0, height);

        // 根据动画时间调整天空颜色
        const dayNightCycle = (Math.sin(time * 0.1) + 1) / 2; // 0-1 循环

        if (dayNightCycle < 0.3) {
            // 夜晚
            gradient.addColorStop(0, '#0a0a1a');
            gradient.addColorStop(0.5, '#1a1a3e');
            gradient.addColorStop(1, '#2a2a4e');
        } else if (dayNightCycle < 0.6) {
            // 黄昏
            gradient.addColorStop(0, '#1a1a3e');
            gradient.addColorStop(0.5, '#4a3050');
            gradient.addColorStop(1, '#6a4050');
        } else {
            // 白天（带烟雾）
            gradient.addColorStop(0, '#2a3a4a');
            gradient.addColorStop(0.5, '#3a4a5a');
            gradient.addColorStop(1, '#4a5a6a');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    renderStars(ctx) {
        const time = this.animationTimer;

        this.stars.forEach(star => {
            const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset);
            const opacity = star.baseOpacity * (0.5 + twinkle * 0.5);

            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
    }

    renderClouds(ctx) {
        this.clouds.forEach(cloud => {
            ctx.globalAlpha = cloud.opacity;
            ctx.fillStyle = '#ffffff';

            // 绘制云朵（由多个圆组成）
            for (let i = 0; i < cloud.puffCount; i++) {
                const puffX = cloud.x + (i * cloud.width / cloud.puffCount);
                const puffY = cloud.y + Math.sin(i) * 10;
                const puffSize = cloud.height * (0.8 + Math.sin(i * 0.5) * 0.2);

                ctx.beginPath();
                ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.globalAlpha = 1;
    }

    renderMoon(ctx) {
        const time = this.animationTimer;
        const dayNightCycle = (Math.sin(time * 0.1) + 1) / 2;

        // 只在夜晚显示月亮
        if (dayNightCycle < 0.4) {
            const moonX = 700;
            const moonY = 80;
            const moonRadius = 30;

            // 月亮光晕
            const glowGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 2);
            glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
            glowGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
            ctx.fill();

            // 月亮本体
            ctx.fillStyle = '#ffffd0';
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderGround(ctx, width, height) {
        const groundY = height - 50;

        // 地面渐变
        const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
        groundGradient.addColorStop(0, '#3d4a5a');
        groundGradient.addColorStop(1, '#2a3a4a');

        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, groundY, width, 50);

        // 地面纹理线
        ctx.strokeStyle = '#4d5a6a';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, groundY);
            ctx.lineTo(i + 20, height);
            ctx.stroke();
        }
    }

    clear() {
        // 背景系统不需要清理
    }
}
