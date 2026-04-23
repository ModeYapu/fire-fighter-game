/**
 * main.js - 消防灭火游戏入口文件（集成版本 v1.3.0）
 * 使用ES Modules初始化游戏，集成所有新系统
 */
import { Game } from './core/Game.js';

// 全局游戏实例
let gameInstance = null;

// 游戏入口
function initGame() {
    console.log('🚀 开始初始化游戏 v1.3.0...');
    
    gameInstance = new Game();
    gameInstance.init();
    
    // 暴露跳过准备阶段函数到全局
    window.skipPrepare = function() {
        if (gameInstance && gameInstance.state === 'prepare') {
            gameInstance.startBattle();
        }
    };
    
    // 暴露游戏实例到全局（供调试和新系统使用）
    window.game = gameInstance;
    
    console.log('✅ 游戏初始化完成');
    
    return gameInstance;
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// 导出游戏实例供调试使用
export { initGame, gameInstance };
