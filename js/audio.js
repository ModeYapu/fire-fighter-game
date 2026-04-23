// 音效系统（简化版 - 使用Web Audio API）

class AudioSystem {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.context = null;
        this.sounds = {};
    }
    
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    createSounds() {
        // 水柱声
        this.sounds.water = this.createTone(800, 0.1);
        
        // 火焰声
        this.sounds.fire = this.createTone(200, 0.2);
        
        // 熄灭声
        this.sounds.extinguish = this.createTone(1000, 0.15);
        
        // 胜利声
        this.sounds.win = this.createTone(1200, 0.3);
        
        // 失败声
        this.sounds.lose = this.createTone(300, 0.3);
    }
    
    createTone(frequency, duration) {
        return {
            frequency: frequency,
            duration: duration
        };
    }
    
    play(soundName) {
        if (!this.enabled || !this.context || !this.sounds[soundName]) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.frequency.value = this.sounds[soundName].frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.value = this.volume;
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + this.sounds[soundName].duration);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + this.sounds[soundName].duration);
        } catch (e) {
            console.log('Audio play error:', e);
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }
}

// 创建全局实例
const audio = new AudioSystem();
