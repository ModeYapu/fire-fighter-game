// Jest 测试环境设置 - ES Modules 版本

// 模拟 DOM 环境
document.body.innerHTML = `
  <canvas id="game-canvas" width="800" height="600"></canvas>
  <div id="main-menu"></div>
  <div id="level-menu"></div>
  <div id="level-grid"></div>
  <div id="top-hud"></div>
  <div id="bottom-hud"></div>
  <div id="sidebar"></div>
  <div id="prepare-message"></div>
  <div id="prepare-timer"></div>
  <div id="result-menu"></div>
  <div id="time-display"></div>
  <div id="water-display"></div>
  <div id="score-display"></div>
  <div id="angle-display"></div>
  <div id="power-display"></div>
  <div id="angle-fill"></div>
  <div id="power-fill"></div>
  <button id="btn-play"></button>
  <button id="btn-levels"></button>
  <button id="btn-back"></button>
  <button id="btn-retry"></button>
  <button id="btn-next"></button>
  <button id="btn-menu"></button>
  <div id="result-title"></div>
  <div id="result-stars"></div>
  <div id="result-score"></div>
  <div id="result-water"></div>
  <div id="result-buildings"></div>
`;

// 模拟 requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

// 模拟 performance.now()
global.performance = {
  now: () => Date.now()
};

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn((key) => {
    const store = {};
    return store[key] || null;
  }),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// 模拟 CanvasRenderingContext2D
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      drawImage: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      textAlign: 'left',
      textBaseline: 'top'
    };
  }
  return null;
});

console.log('✅ Test environment setup complete (ES Modules)');
