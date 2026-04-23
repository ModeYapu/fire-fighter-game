/**
 * main.js - 消防灭火游戏入口文件
 * 使用ES Modules初始化游戏
 */
import { Game } from './core/Game.js';

// 全局游戏实例
let gameInstance = null;

// 游戏入口
function initGame() {
    gameInstance = new Game();
    gameInstance.init();
    
    // 暴露跳过准备阶段函数到全局
    window.skipPrepare = function() {
        if (gameInstance && gameInstance.state === 'prepare') {
            gameInstance.startBattle();
        }
    };
    
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
