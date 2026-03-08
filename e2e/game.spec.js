import { test, expect } from '@playwright/test';

test.describe('消防灭火游戏 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('页面应该正确加载', async ({ page }) => {
    // 检查标题
    await expect(page).toHaveTitle(/消防灭火策略游戏/);
    
    // 检查游戏画布存在
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    
    // 检查画布尺寸
    const width = await canvas.evaluate(el => el.width);
    const height = await canvas.evaluate(el => el.height);
    expect(width).toBe(800);
    expect(height).toBe(600);
  });

  test('游戏应该显示主菜单', async ({ page }) => {
    // 检查主菜单容器
    const menuContainer = page.locator('#menu-container');
    await expect(menuContainer).toBeVisible();
    
    // 检查开始按钮
    const startButton = page.locator('#btn-start');
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveText('开始游戏');
  });

  test('点击开始按钮应该开始游戏', async ({ page }) => {
    // 点击开始按钮
    await page.click('#btn-start');
    
    // 等待游戏UI出现
    const gameUI = page.locator('#top-hud');
    await expect(gameUI).toBeVisible({ timeout: 2000 });
    
    // 检查游戏状态显示
    const waterDisplay = page.locator('#water-display');
    await expect(waterDisplay).toBeVisible();
  });

  test('游戏应该显示资源信息', async ({ page }) => {
    await page.click('#btn-start');
    
    // 检查水资源显示
    const waterDisplay = page.locator('#water-display');
    await expect(waterDisplay).toContainText('水');
    
    // 检查分数显示
    const scoreDisplay = page.locator('#score-display');
    await expect(scoreDisplay).toBeVisible();
    
    // 检查时间显示
    const timeDisplay = page.locator('#time-display');
    await expect(timeDisplay).toBeVisible();
  });

  test('游戏画布应该正确渲染', async ({ page }) => {
    await page.click('#btn-start');
    
    // 等待游戏开始
    await page.waitForTimeout(1000);
    
    // 检查画布有内容（非空白）
    const canvas = page.locator('#game-canvas');
    const hasContent = await canvas.evaluate(el => {
      const ctx = el.getContext('2d');
      const imageData = ctx.getImageData(0, 0, el.width, el.height);
      return imageData.data.some(channel => channel !== 0);
    });
    expect(hasContent).toBeTruthy();
  });

  test('鼠标控制应该工作', async ({ page }) => {
    await page.click('#btn-start');
    await page.waitForTimeout(500);
    
    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      // 模拟鼠标移动
      await page.mouse.move(box.x + 200, box.y + 200);
      
      // 模拟鼠标点击（发射水柱）
      await page.mouse.click(box.x + 200, box.y + 200);
      
      // 等待一下看是否有响应
      await page.waitForTimeout(100);
      
      // 检查游戏还在运行（没有崩溃）
      const gameUI = page.locator('#top-hud');
      await expect(gameUI).toBeVisible();
    }
  });

  test('键盘控制应该工作', async ({ page }) => {
    await page.click('#btn-start');
    await page.waitForTimeout(500);
    
    // 测试ESC键（暂停功能，如果实现了）
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    
    // 检查游戏还在运行
    const gameUI = page.locator('#top-hud');
    await expect(gameUI).toBeVisible();
  });

  test('游戏应该有正确的CSS样式', async ({ page }) => {
    // 检查画布样式
    const canvas = page.locator('#game-canvas');
    const border = await canvas.evaluate(el => 
      window.getComputedStyle(el).border
    );
    expect(border).toBeTruthy();
    
    // 检查容器样式
    const container = page.locator('#game-container');
    await expect(container).toBeVisible();
  });

  test('游戏应该响应窗口大小变化', async ({ page }) => {
    // 改变视口大小
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // 检查游戏画布仍然可见
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    
    // 恢复原始大小
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(canvas).toBeVisible();
  });

  test('游戏应该处理快速点击', async ({ page }) => {
    await page.click('#btn-start');
    await page.waitForTimeout(500);
    
    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    
    if (box) {
      // 快速连续点击
      for (let i = 0; i < 5; i++) {
        await page.mouse.click(box.x + 100 + i * 50, box.y + 200);
        await page.waitForTimeout(50);
      }
      
      // 检查游戏没有崩溃
      const gameUI = page.locator('#top-hud');
      await expect(gameUI).toBeVisible();
    }
  });
});

test.describe('游戏性能测试', () => {
  test('游戏加载时间应该合理', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('#game-canvas');
    const loadTime = Date.now() - startTime;
    
    // 页面应该在3秒内加载完成
    expect(loadTime).toBeLessThan(3000);
  });

  test('游戏启动时间应该合理', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.click('#btn-start');
    await page.waitForSelector('#top-hud', { state: 'visible' });
    const startupTime = Date.now() - startTime;
    
    // 游戏应该在2秒内启动
    expect(startupTime).toBeLessThan(2000);
  });

  test('游戏应该保持60FPS', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-start');
    await page.waitForTimeout(1000);
    
    // 测量帧率
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        function countFrames() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frameCount);
          }
        }
        
        requestAnimationFrame(countFrames);
      });
    });
    
    // 应该接近60FPS（允许一定误差）
    expect(fps).toBeGreaterThan(30);
  });
});

test.describe('跨浏览器测试', () => {
  test('Chrome: 游戏功能正常', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome only test');
    
    await page.goto('/');
    await page.click('#btn-start');
    
    const gameUI = page.locator('#top-hud');
    await expect(gameUI).toBeVisible();
  });

  test('Firefox: 游戏功能正常', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox only test');
    
    await page.goto('/');
    await page.click('#btn-start');
    
    const gameUI = page.locator('#top-hud');
    await expect(gameUI).toBeVisible();
  });

  test('Safari: 游戏功能正常', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari only test');
    
    await page.goto('/');
    await page.click('#btn-start');
    
    const gameUI = page.locator('#top-hud');
    await expect(gameUI).toBeVisible();
  });
});

test.describe('无障碍性测试', () => {
  test('页面应该有正确的语言设置', async ({ page }) => {
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBe('zh-CN');
  });

  test('重要元素应该可见', async ({ page }) => {
    await page.goto('/');
    
    // 所有按钮应该可见
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
    }
  });
});
