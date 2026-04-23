# Playwright E2E 测试

## 测试内容

### 功能测试
- ✅ 页面加载
- ✅ 主菜单显示
- ✅ 游戏启动
- ✅ 资源显示（水、分数、时间）
- ✅ 游戏画布渲染
- ✅ 鼠标控制
- ✅ 键盘控制
- ✅ CSS样式验证
- ✅ 响应式设计
- ✅ 快速点击处理

### 性能测试
- ✅ 页面加载时间（< 3秒）
- ✅ 游戏启动时间（< 2秒）
- ✅ 帧率测试（> 30 FPS）

### 跨浏览器测试
- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)

### 无障碍性测试
- ✅ 语言设置
- ✅ 元素可见性

## 运行测试

```bash
# 安装浏览器（首次运行）
npx playwright install

# 运行所有测试
npm run test:e2e

# UI模式运行
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 查看测试报告
npm run test:e2e:report
```

## 测试覆盖率

- **功能测试**: 10个测试场景
- **性能测试**: 3个性能指标
- **跨浏览器**: 3种浏览器
- **无障碍性**: 2个检查项

**总计**: 18个测试用例
