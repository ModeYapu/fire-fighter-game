/**
 * AudioSystem - 基于 Web Audio API 的音效系统
 * 程序化生成灭火声、火焰声、警报声等音效
 */
export class AudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.enabled = true;
        this.initialized = false;
        this.activeNodes = new Set();
        this.ambientNodes = [];
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.7;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available:', e);
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMasterVolume(v) {
        if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
    }

    setSFXVolume(v) {
        if (this.sfxGain) this.sfxGain.gain.value = Math.max(0, Math.min(1, v));
    }

    setMusicVolume(v) {
        if (this.musicGain) this.musicGain.gain.value = Math.max(0, Math.min(1, v));
    }

    // ============ 灭火声 ============
    playExtinguish() {
        if (!this.enabled || !this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;

        // 白噪声缓冲
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // 带通滤波器模拟水声
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.8;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        source.start(now);
        source.stop(now + 0.4);
    }

    // ============ 火焰声（循环） ============
    startFireAmbient() {
        if (!this.enabled || !this.initialized) return;
        this.stopFireAmbient();
        this.resume();

        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 1;

        // LFO for crackling
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 8;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 100;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gain = this.ctx.createGain();
        gain.gain.value = 0.15;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        source.start();
        lfo.start();

        this.ambientNodes.push({ source, lfo, gain, filter });
    }

    stopFireAmbient() {
        this.ambientNodes.forEach(n => {
            try { n.source.stop(); } catch (e) {}
            try { n.lfo.stop(); } catch (e) {}
        });
        this.ambientNodes = [];
    }

    // ============ 警报声 ============
    playAlarm() {
        if (!this.enabled || !this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.3);
        osc.frequency.linearRampToValueAtTime(600, now + 0.6);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0.2, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.7);
    }

    // ============ 水柱发射声 ============
    playWaterShoot() {
        if (!this.enabled || !this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        source.start(now);
        source.stop(now + 0.15);
    }

    // ============ 爆炸声（化工厂关卡） ============
    playExplosion() {
        if (!this.enabled || !this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 1.0;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.08));
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        source.start(now);
        source.stop(now + 1.0);
    }

    // ============ 胜利音效 ============
    playVictory() {
        if (!this.enabled || !this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;
        const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const gain = this.ctx.createGain();
            const t = now + i * 0.15;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.4);
        });
    }

    // ============ 失败音效 ============
    playDefeat() {
        if (!this.enabled || !this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;
        const notes = [392, 349, 311, 262]; // G4 F4 Eb4 C4

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;

            const gain = this.ctx.createGain();
            const t = now + i * 0.25;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.5);
        });
    }

    // ============ 成就解锁音效 ============
    playAchievement() {
        if (!this.enabled || !this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;
        const notes = [659, 784, 988, 1319]; // E5 G5 B5 E6

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const gain = this.ctx.createGain();
            const t = now + i * 0.1;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.3);
        });
    }

    // ============ 建筑坍塌音效 ============
    playCollapse() {
        if (!this.enabled || !this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        source.start(now);
        source.stop(now + 0.8);
    }

    // 便捷方法 - 兼容旧接口
    play(name) {
        if (!this.enabled || !this.initialized) return;
        switch (name) {
            case 'waterShoot': this.playWaterShoot(); break;
            case 'extinguish': this.playExtinguish(); break;
            case 'alarm': this.playAlarm(); break;
            case 'explosion': this.playExplosion(); break;
            case 'victory': this.playVictory(); break;
            case 'defeat': this.playDefeat(); break;
            case 'achievement': this.playAchievement(); break;
            case 'collapse': this.playCollapse(); break;
            case 'click': this.playWaterShoot(); break; // fallback
        }
    }

    destroy() {
        this.stopFireAmbient();
        if (this.ctx) {
            this.ctx.close();
        }
    }
}
