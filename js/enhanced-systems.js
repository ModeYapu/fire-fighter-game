// ==================== 增强音效系统 ====================

class EnhancedAudioSystem {
    constructor() {
        this.enabled = true;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        
        this.context = null;
        this.sounds = {};
        this.music = null;
        this.currentMusic = null;
        
        // 音效池
        this.soundPool = {};
        this.maxPoolSize = 10;
        
        // 3D音效
        this.listenerPosition = { x: 400, y: 300 };
    }

    async init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            await this.createSounds();
            console.log('🔊 音效系统初始化成功');
        } catch (e) {
            console.log('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    async createSounds() {
        // 水枪音效
        this.sounds.waterShoot = this.createNoiseSound(0.1, 'brown', 800);
        
        // 水滴击中音效
        this.sounds.waterHit = this.createTone(600, 0.08, 'sine');
        
        // 火焰燃烧音效（循环）
        this.sounds.fireCrackle = this.createNoiseSound(0.5, 'pink', 200);
        
        // 火焰熄灭音效
        this.sounds.fireExtinguish = this.createNoiseSound(0.3, 'white', 1000);
        
        // 爆炸音效
        this.sounds.explosion = this.createExplosionSound(0.5);
        
        // 救援成功音效
        this.sounds.rescueSuccess = this.createMelody([523, 659, 784], 0.15);
        
        // 警告音效
        this.sounds.warning = this.createTone(800, 0.2, 'square');
        
        // 胜利音效
        this.sounds.victory = this.createMelody([523, 659, 784, 1047], 0.2);
        
        // 失败音效
        this.sounds.defeat = this.createMelody([392, 349, 330, 294], 0.25);
        
        // 升级音效
        this.sounds.upgrade = this.createMelody([440, 554, 659, 880], 0.1);
        
        // 获得金币音效
        this.sounds.coin = this.createTone(1200, 0.1, 'sine');
        
        // 按钮点击音效
        this.sounds.click = this.createTone(1000, 0.05, 'sine');
        
        // 车辆技能激活音效
        this.sounds.skillActivate = this.createMelody([440, 880, 1320], 0.15);
        
        // 有毒云团音效
        this.sounds.toxic = this.createNoiseSound(0.3, 'pink', 150);
        
        // 道具获得音效
        this.sounds.powerup = this.createMelody([659, 784, 988, 1175], 0.12);
    }

    // 创建音调
    createTone(frequency, duration, type = 'sine') {
        return { frequency, duration, type, isTone: true };
    }

    // 创建噪音
    createNoiseSound(duration, type, frequency) {
        return { duration, type: 'noise', noiseType: type, frequency, isNoise: true };
    }

    // 创建爆炸音效
    createExplosionSound(duration) {
        return { duration, type: 'explosion', isExplosion: true };
    }

    // 创建旋律
    createMelody(frequencies, noteDuration) {
        return { frequencies, noteDuration, isMelody: true };
    }

    // 播放音效
    play(soundName, position = null) {
        if (!this.enabled || !this.sfxEnabled || !this.context || !this.sounds[soundName]) return;

        try {
            const sound = this.sounds[soundName];
            
            if (sound.isTone) {
                this.playTone(sound, position);
            } else if (sound.isNoise) {
                this.playNoise(sound, position);
            } else if (sound.isExplosion) {
                this.playExplosion(sound, position);
            } else if (sound.isMelody) {
                this.playMelody(sound);
            }
        } catch (e) {
            console.log('Audio play error:', e);
        }
    }

    // 播放音调
    playTone(sound, position) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = sound.frequency;
        oscillator.type = sound.type;
        
        // 3D音效（距离衰减）
        let volume = this.sfxVolume * this.masterVolume;
        if (position) {
            const distance = Math.sqrt(
                Math.pow(position.x - this.listenerPosition.x, 2) +
                Math.pow(position.y - this.listenerPosition.y, 2)
            );
            volume *= Math.max(0.2, 1 - distance / 1000);
        }
        
        gainNode.gain.value = volume;
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.duration);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + sound.duration);
    }

    // 播放噪音
    playNoise(sound, position) {
        const bufferSize = this.context.sampleRate * sound.duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        // 生成噪音
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.context.createBufferSource();
        const filter = this.context.createBiquadFilter();
        const gainNode = this.context.createGain();
        
        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = sound.frequency;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        let volume = this.sfxVolume * this.masterVolume * 0.3;
        if (position) {
            const distance = Math.sqrt(
                Math.pow(position.x - this.listenerPosition.x, 2) +
                Math.pow(position.y - this.listenerPosition.y, 2)
            );
            volume *= Math.max(0.2, 1 - distance / 800);
        }
        
        gainNode.gain.value = volume;
        
        source.start();
    }

    // 播放爆炸音效
    playExplosion(sound, position) {
        // 低频轰鸣
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = 80;
        oscillator.type = 'sawtooth';
        
        let volume = this.sfxVolume * this.masterVolume * 0.5;
        if (position) {
            const distance = Math.sqrt(
                Math.pow(position.x - this.listenerPosition.x, 2) +
                Math.pow(position.y - this.listenerPosition.y, 2)
            );
            volume *= Math.max(0.3, 1 - distance / 600);
        }
        
        gainNode.gain.value = volume;
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.duration);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + sound.duration);
        
        // 添加噪音
        this.playNoise({ duration: sound.duration * 0.5, frequency: 2000 }, position);
    }

    // 播放旋律
    playMelody(sound) {
        sound.frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone({
                    frequency: freq,
                    duration: sound.noteDuration,
                    type: 'sine'
                });
            }, index * sound.noteDuration * 1000);
        });
    }

    // 设置监听者位置
    setListenerPosition(x, y) {
        this.listenerPosition = { x, y };
    }

    // 切换音效
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    // 切换音乐
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled && this.currentMusic) {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    // 停止音乐
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    // 设置主音量
    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
    }

    // 设置音效音量
    setSFXVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
    }

    // 设置音乐音量
    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
    }
}

// ==================== 视觉效果增强系统 ====================

class VisualEffectsSystem {
    constructor(game) {
        this.game = game;
        this.effects = [];
        this.screenShake = { intensity: 0, duration: 0 };
        this.flashEffect = { color: '#fff', alpha: 0, duration: 0 };
        this.slowMotion = { active: false, multiplier: 1, duration: 0 };
    }

    // 添加屏幕震动
    addScreenShake(intensity, duration) {
        this.screenShake = { intensity, duration };
    }

    // 添加闪光效果
    addFlashEffect(color, alpha, duration) {
        this.flashEffect = { color, alpha, duration };
    }

    // 添加慢动作效果
    addSlowMotion(multiplier, duration) {
        this.slowMotion = { active: true, multiplier, duration };
    }

    // 添加粒子爆发效果
    addParticleBurst(x, y, color, count = 20) {
        if (!this.game.particleSystem) return;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2 + Math.random() * 4;
            
            this.game.particleSystem.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                type: 'burst',
                color: color,
                life: 40 + Math.random() * 20,
                size: 3 + Math.random() * 3,
            });
        }
    }

    // 添加涟漪效果
    addRipple(x, y, color = '#3498db') {
        this.effects.push({
            type: 'ripple',
            x: x,
            y: y,
            radius: 0,
            maxRadius: 100,
            alpha: 1,
            color: color,
            speed: 3,
        });
    }

    // 添加发光效果
    addGlow(x, y, color, duration = 1000) {
        this.effects.push({
            type: 'glow',
            x: x,
            y: y,
            color: color,
            radius: 50,
            alpha: 0.8,
            duration: duration,
            elapsed: 0,
        });
    }

    // 添加文字浮动效果
    addFloatingText(x, y, text, color = '#fff') {
        this.effects.push({
            type: 'floatingText',
            x: x,
            y: y,
            text: text,
            color: color,
            alpha: 1,
            offsetY: 0,
            speed: 1,
        });
    }

    // 添加轨迹效果
    addTrail(x, y, color) {
        this.effects.push({
            type: 'trail',
            x: x,
            y: y,
            color: color,
            alpha: 0.5,
            life: 20,
        });
    }

    // 更新效果
    update(deltaTime) {
        // 更新屏幕震动
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime * 1000;
        }

        // 更新闪光效果
        if (this.flashEffect.duration > 0) {
            this.flashEffect.duration -= deltaTime * 1000;
            this.flashEffect.alpha *= 0.9;
        }

        // 更新慢动作
        if (this.slowMotion.active) {
            this.slowMotion.duration -= deltaTime * 1000;
            if (this.slowMotion.duration <= 0) {
                this.slowMotion.active = false;
                this.slowMotion.multiplier = 1;
            }
        }

        // 更新视觉效果
        this.effects = this.effects.filter(effect => {
            switch (effect.type) {
                case 'ripple':
                    effect.radius += effect.speed;
                    effect.alpha -= 0.02;
                    return effect.radius < effect.maxRadius && effect.alpha > 0;

                case 'glow':
                    effect.elapsed += deltaTime * 1000;
                    effect.alpha = 0.8 * (1 - effect.elapsed / effect.duration);
                    return effect.elapsed < effect.duration;

                case 'floatingText':
                    effect.offsetY -= effect.speed;
                    effect.alpha -= 0.02;
                    return effect.alpha > 0;

                case 'trail':
                    effect.life -= 1;
                    effect.alpha *= 0.9;
                    return effect.life > 0;

                default:
                    return false;
            }
        });
    }

    // 渲染效果
    render(ctx) {
        // 应用屏幕震动
        if (this.screenShake.duration > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
            const shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
            ctx.translate(shakeX, shakeY);
        }

        // 渲染视觉效果
        this.effects.forEach(effect => {
            ctx.save();

            switch (effect.type) {
                case 'ripple':
                    ctx.globalAlpha = effect.alpha;
                    ctx.strokeStyle = effect.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                    ctx.stroke();
                    break;

                case 'glow':
                    ctx.globalAlpha = effect.alpha;
                    const gradient = ctx.createRadialGradient(
                        effect.x, effect.y, 0,
                        effect.x, effect.y, effect.radius
                    );
                    gradient.addColorStop(0, effect.color);
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'floatingText':
                    ctx.globalAlpha = effect.alpha;
                    ctx.fillStyle = effect.color;
                    ctx.font = 'bold 18px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(effect.text, effect.x, effect.y + effect.offsetY);
                    break;

                case 'trail':
                    ctx.globalAlpha = effect.alpha;
                    ctx.fillStyle = effect.color;
                    ctx.beginPath();
                    ctx.arc(effect.x, effect.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }

            ctx.restore();
        });

        // 渲染闪光效果
        if (this.flashEffect.duration > 0 && this.flashEffect.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.flashEffect.alpha;
            ctx.fillStyle = this.flashEffect.color;
            ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            ctx.restore();
        }
    }

    // 获取时间缩放
    getTimeScale() {
        return this.slowMotion.active ? this.slowMotion.multiplier : 1;
    }

    // 清除所有效果
    clear() {
        this.effects = [];
        this.screenShake = { intensity: 0, duration: 0 };
        this.flashEffect = { color: '#fff', alpha: 0, duration: 0 };
        this.slowMotion = { active: false, multiplier: 1, duration: 0 };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedAudioSystem, VisualEffectsSystem };
}
