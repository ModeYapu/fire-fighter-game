/**
 * storage.js - 安全的本地存储工具
 * 提供数据验证、错误处理和类型安全
 */

export class SecureStorage {
    /**
     * 安全地从localStorage获取数据
     * @param {string} key - 存储键名
     * @param {any} defaultValue - 默认值
     * @param {Function} validator - 数据验证函数
     * @returns {any} 验证后的数据或默认值
     */
    static getItem(key, defaultValue = null, validator = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }

            const parsed = JSON.parse(item);

            // 如果提供了验证器，进行数据验证
            if (validator && !validator(parsed)) {
                console.warn(`存储数据验证失败: ${key}, 使用默认值`);
                return defaultValue;
            }

            return parsed;
        } catch (error) {
            console.error(`读取localStorage失败: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * 安全地向localStorage设置数据
     * @param {string} key - 存储键名
     * @param {any} value - 要存储的值
     * @param {Function} validator - 数据验证函数
     * @returns {boolean} 是否成功
     */
    static setItem(key, value, validator = null) {
        try {
            // 如果提供了验证器，先验证数据
            if (validator && !validator(value)) {
                console.error(`数据验证失败，无法存储: ${key}`);
                return false;
            }

            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error(`写入localStorage失败: ${key}`, error);
            return false;
        }
    }

    /**
     * 移除指定的localStorage项
     * @param {string} key - 存储键名
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`删除localStorage失败: ${key}`, error);
        }
    }

    /**
     * 清空所有游戏相关的localStorage
     * @param {string} prefix - 键名前缀
     */
    static clearGameStorage(prefix = 'firefighter') {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('清空localStorage失败:', error);
        }
    }

    /**
     * 常用数据验证器（增强安全性）
     */
    static validators = {
        // 验证进度数据结构
        progress: (data) => {
            if (!Array.isArray(data) && typeof data !== 'object') return false;
            if (data === null) return false;

            // 检查每个关卡数据
            for (const key in data) {
                const level = data[key];
                if (!level || typeof level !== 'object') return false;

                // 验证必需字段
                if (level.completed !== undefined && typeof level.completed !== 'boolean') return false;
                if (level.stars !== undefined && (typeof level.stars !== 'number' || level.stars < 0 || level.stars > 3)) return false;
                if (level.score !== undefined && (typeof level.score !== 'number' || level.score < 0)) return false;
            }
            return true;
        },

        // 验证成就数据结构
        achievements: (data) => {
            if (typeof data !== 'object' || data === null) return false;
            // 检查是否是纯对象
            return Object.prototype.toString.call(data) === '[object Object]';
        },

        // 验证设置数据结构
        settings: (data) => {
            if (typeof data !== 'object' || data === null) return false;

            // 验证音量设置
            if (data.masterVolume !== undefined && (typeof data.masterVolume !== 'number' || data.masterVolume < 0 || data.masterVolume > 1)) return false;
            if (data.musicVolume !== undefined && (typeof data.musicVolume !== 'number' || data.musicVolume < 0 || data.musicVolume > 1)) return false;
            if (data.sfxVolume !== undefined && (typeof data.sfxVolume !== 'number' || data.sfxVolume < 0 || data.sfxVolume > 1)) return false;

            // 验证布尔设置
            if (data.showFPS !== undefined && typeof data.showFPS !== 'boolean') return false;
            if (data.particleEffects !== undefined && typeof data.particleEffects !== 'boolean') return false;

            return true;
        },

        // 验证数值类型（增强版）
        number: (data) => {
            return typeof data === 'number' && !isNaN(data) && isFinite(data);
        },

        // 验证字符串类型（增强版，防止XSS）
        string: (data) => {
            if (typeof data !== 'string') return false;
            // 检查是否包含潜在的HTML标签
            const htmlTagPattern = /<[^>]*>/;
            return !htmlTagPattern.test(data);
        }
    };
}