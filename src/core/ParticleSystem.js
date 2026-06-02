import { FIRE_CONFIG, WATER_CONFIG, PHYSICS, COLORS } from '../utils/constants.js';

export class Particle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 2;
        this.life = 1.0;
        this.decay = 0.02;
        this.color = '#fff';
        this.active = false;
        this.type = 'base';
    }

    reset(x, y, vx, vy, size, color, decay) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.life = 1.0;
        this.decay = decay || 0.02;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;

        if (this.life <= 0) {
            this.active = false;
        }
    }

    render(ctx) {
        if (!this.active) return;

        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.poolSize = FIRE_CONFIG.PARTICLE_POOL_SIZE + WATER_CONFIG.PARTICLE_POOL_SIZE;

        // 初始化粒子池
        for (let i = 0; i < this.poolSize; i++) {
            this.particles.push(new Particle());
        }
    }

    getParticle() {
        for (let i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].active) {
                return this.particles[i];
            }
        }
        return null;
    }

    // 创建火焰粒子
    createFire(x, y, intensity) {
        const particle = this.getParticle();
        if (!particle) return;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 * intensity;

        particle.reset(
            x + (Math.random() - 0.5) * 20,
            y + (Math.random() - 0.5) * 20,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 2,
            3 + Math.random() * 3 * intensity,
            COLORS.FIRE,
            0.03
        );
        particle.type = 'fire';
    }

    // 创建飘散火星（受风力影响）
    createEmber(x, y, intensity, wind) {
        const particle = this.getParticle();
        if (!particle) return;

        // 火星向上飘，受风力影响
        const windEffect = wind * 2;
        particle.reset(
            x + (Math.random() - 0.5) * 30,
            y - 20,
            (Math.random() - 0.3) * 2 + windEffect,
            -2 - Math.random() * 3,
            1 + Math.random() * 2,
            Math.random() > 0.5 ? '#ff6b35' : '#ffa500',
            0.015
        );
        particle.type = 'ember';
    }

    // 创建烟雾粒子
    createSmoke(x, y) {
        const particle = this.getParticle();
        if (!particle) return;

        particle.reset(
            x + (Math.random() - 0.5) * 15,
            y,
            (Math.random() - 0.5) * 0.5,
            -1 - Math.random(),
            5 + Math.random() * 5,
            COLORS.SMOKE,
            0.01
        );
        particle.type = 'smoke';
    }

    // 创建水花粒子
    createSplash(x, y) {
        for (let i = 0; i < 5; i++) {
            const particle = this.getParticle();
            if (!particle) continue;

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3;

            particle.reset(
                x,
                y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                2 + Math.random() * 2,
                COLORS.WATER,
                0.05
            );
            particle.type = 'splash';
        }
    }

    // 创建碎石粒子（建筑坍塌）
    createDebris(x, y) {
        const particle = this.getParticle();
        if (!particle) return;

        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;

        particle.reset(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed - 2,
            3 + Math.random() * 4,
            Math.random() > 0.5 ? '#5a4a3a' : '#3a3a3a',
            0.025
        );
        particle.type = 'debris';
    }

    update(game) {
        const wind = game.physicsEngine?.wind || 0;

        this.particles.forEach(particle => {
            if (!particle.active) return;

            // 根据类型应用不同的物理
            if (particle.type === 'fire') {
                particle.vy -= 0.1; // 火焰上升
                particle.vx += wind * 0.01; // 受风力影响
            } else if (particle.type === 'ember') {
                particle.vy -= 0.08; // 火星缓慢上升
                particle.vx += wind * 0.03; // 更容易受风力影响
                particle.life -= 0.005; // 火星存在更久
            } else if (particle.type === 'smoke') {
                particle.vy -= 0.05; // 烟雾缓慢上升
                particle.vx += wind * 0.02; // 更容易受风力影响
            } else if (particle.type === 'splash') {
                particle.vy += PHYSICS.GRAVITY * 0.5; // 水花受重力
            } else if (particle.type === 'debris') {
                particle.vy += PHYSICS.GRAVITY * 0.8; // 碎石受重力
                particle.vx *= 0.98; // 空气阻力
            }

            particle.update();
        });
    }

    render(game) {
        const ctx = game.ctx;

        // 按类型排序渲染（烟雾在后面）
        this.particles
            .filter(p => p.active)
            .sort((a, b) => {
                if (a.type === 'smoke' && b.type !== 'smoke') return -1;
                if (b.type === 'smoke' && a.type !== 'smoke') return 1;
                return 0;
            })
            .forEach(particle => particle.render(ctx));
    }

    clear() {
        this.particles.forEach(particle => {
            particle.active = false;
        });
    }
}
