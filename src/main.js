/**
 * main.js - 消防灭火游戏入口文件
 * 使用ES Modules初始化游戏
 */
import { Game } from './core/Game.js';

// 游戏入口
function initGame() {
    const game = new Game();
    game.init();
    return game;
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// 导出游戏实例供调试使用
export { initGame };
