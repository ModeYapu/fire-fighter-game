# 🧪 测试文档

## 测试概述

本项目包含完整的单元测试和集成测试，确保游戏核心功能的稳定性和正确性。

## 测试类型

### 1. 单元测试

测试独立模块的功能：

- **physics.test.js** - 物理引擎测试
  - 抛物线轨迹计算
  - 碰撞检测（点-矩形、圆形-矩形）
  - 风力系统

- **water.test.js** - 水柱系统测试
  - 粒子池管理
  - 水滴发射
  - 碰撞处理
  - 重力影响

- **fire.test.js** - 火焰系统测试
  - 点燃建筑
  - 火焰强度
  - 蔓延算法
  - 灭火逻辑

- **building.test.js** - 建筑系统测试
  - 建筑创建
  - 属性配置
  - 血量管理
  - 排序优化

- **game.test.js** - 游戏主循环测试
  - 状态管理
  - 关卡加载
  - 胜负判断
  - 帧率独立

### 2. 集成测试

测试系统间交互：

- **integration.test.js** - 系统集成测试
  - 水柱与火焰交互
  - 火焰蔓延系统
  - 资源消耗
  - 完整游戏流程

## 运行测试

### 前置要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
npm test
# 或
./run-tests.sh
```

### 运行测试（监视模式）

```bash
npm run test:watch
# 或
./run-tests.sh watch
```

### 生成覆盖率报告

```bash
npm run test:coverage
# 或
./run-tests.sh coverage
```

覆盖率报告会生成在 `coverage/` 目录：
- `coverage/index.html` - HTML报告
- `coverage/lcov-report/` - 详细报告

## 测试覆盖率

目标覆盖率：

- **语句覆盖率**: >= 80%
- **分支覆盖率**: >= 75%
- **函数覆盖率**: >= 85%
- **行覆盖率**: >= 80%

## 测试文件结构

```
fire-fighter-game/
├── tests/
│   ├── setup.js              # 测试环境设置
│   ├── physics.test.js       # 物理引擎测试
│   ├── water.test.js         # 水柱系统测试
│   ├── fire.test.js          # 火焰系统测试
│   ├── building.test.js      # 建筑系统测试
│   ├── game.test.js          # 游戏主循环测试
│   └── integration.test.js   # 集成测试
├── package.json              # 项目配置
├── run-tests.sh              # 测试运行脚本
└── TESTS.md                  # 本文档
```

## 编写新测试

### 测试命名规范

```javascript
describe('模块名称', () => {
  test('应该正确执行某个功能', () => {
    // 测试代码
  });
});
```

### 测试结构

```javascript
describe('MyClass', () => {
  let myClass;
  
  beforeAll(() => {
    // 所有测试前执行一次
  });
  
  beforeEach(() => {
    // 每个测试前执行
    myClass = new MyClass();
  });
  
  afterEach(() => {
    // 每个测试后执行
  });
  
  afterAll(() => {
    // 所有测试后执行一次
  });
  
  test('应该正确初始化', () => {
    expect(myClass.initialized).toBe(true);
  });
});
```

### 常用断言

```javascript
// 相等
expect(value).toBe(expected);
expect(value).toEqual(expected);

// 布尔
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// 数字
expect(value).toBeGreaterThan(min);
expect(value).toBeLessThan(max);

// 数组/字符串
expect(array).toContain(item);
expect(string).toMatch(/regex/);

// 异常
expect(() => fn()).toThrow();

// 调用
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

### Mock 示例

```javascript
// Mock 函数
const mockFn = jest.fn();
mockFn.mockReturnValue(value);
mockFn.mockImplementation(() => customValue);

// Mock 对象
const mockObj = {
  method: jest.fn()
};

// Mock 模块
jest.mock('../module');
```

## 持续集成

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## 最佳实践

1. **测试独立性**: 每个测试应该独立，不依赖其他测试
2. **清晰的命名**: 测试名称应该清楚描述测试内容
3. **单一职责**: 每个测试只测试一个功能点
4. **Mock外部依赖**: 使用Mock隔离外部依赖
5. **测试边界条件**: 不仅测试正常情况，还要测试边界和异常
6. **保持简洁**: 测试代码应该简洁易懂
7. **及时更新**: 代码修改后及时更新测试

## 故障排查

### 测试失败

1. 检查错误信息
2. 查看堆栈跟踪
3. 使用 `console.log` 调试
4. 检查 Mock 是否正确设置

### 覆盖率低

1. 运行 `npm run test:coverage`
2. 查看 `coverage/index.html`
3. 找到未覆盖的代码
4. 补充测试用例

### 测试运行慢

1. 减少不必要的 `beforeEach`
2. 优化 Mock 设置
3. 使用 `test.skip` 跳过慢测试

## 测试报告

测试完成后会生成详细报告：

- **控制台输出**: 实时显示测试进度和结果
- **覆盖率报告**: HTML格式的详细覆盖率报告
- **LCOV报告**: 用于CI工具的标准格式

## 贡献指南

提交代码前请确保：

1. ✅ 所有测试通过
2. ✅ 新功能有对应测试
3. ✅ 覆盖率不低于目标值
4. ✅ 测试命名清晰
5. ✅ 没有跳过的测试（除非必要）

---

**测试是质量保证的重要环节，请认真编写和维护测试！** 🧪✨
