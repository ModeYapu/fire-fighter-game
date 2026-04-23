# 消防灭火策略游戏开发任务

## 项目概述
开发一个消防灭火策略游戏，结合物理喷射和策略布局两种核心玩法。

## 技术栈
- Canvas 2D (主渲染)
- 原生 JavaScript (游戏逻辑)
- 粒子系统 (水柱、火焰、烟雾)
- 简单物理引擎 (抛物线，自实现)

## 完整开发计划

### 阶段一：核心框架（1h）
创建基础游戏结构：

1. **index.html** - 游戏主页面
   - Canvas 画布 (800x600)
   - 引入所有JS文件
   - 响应式布局
   - 基础样式

2. **js/game.js** - 主游戏逻辑
   - 游戏状态管理 (MENU, PREPARE, BATTLE, PAUSE, WIN, LOSE)
   - 游戏循环 (update + render)
   - 场景切换系统
   - 主入口函数

3. **js/ui.js** - UI管理
   - 顶部HUD：时间、水量、得分
   - 底部控制条：角度、力度
   - 侧边栏：设施选择
   - 按钮系统

4. **js/constants.js** - 常量配置
   - 游戏参数
   - 物理常量
   - 颜色配置
   - 关卡数据结构

### 阶段二：物理系统（1.5h）
实现水柱喷射物理：

1. **js/physics.js** - 物理引擎
   - 抛物线轨迹计算
   - 重力系统 (g = 9.8)
   - 风力系统
   - 碰撞检测

2. **js/water.js** - 水柱系统
   - WaterDroplet 类 (单个水滴)
   - WaterStream 类 (水柱流管理)
   - 发射控制 (角度、力度)
   - 蓄力系统
   - 粒子池优化

3. **js/input.js** - 输入控制
   - 键盘控制
   - 鼠标/触摸控制
   - UI交互

### 阶段三：火焰与建筑（1.5h）
实现火势蔓延系统：

1. **js/building.js** - 建筑系统
   - Building 类
   - 多种建筑类型 (木屋、砖房、高楼)
   - 建筑状态 (正常、燃烧、损坏)
   - 渲染和碰撞

2. **js/fire.js** - 火焰系统
   - Fire 类
   - 火焰强度 (1-5级)
   - 蔓延算法
   - 粒子效果

3. **js/particles.js** - 粒子系统
   - Particle 基类
   - FireParticle
   - SmokeParticle
   - WaterSplashParticle
   - 粒子池管理

### 阶段四：策略系统（1h）
加入布局和资源管理：

1. **js/strategy.js** - 策略系统
   - 准备阶段 (30秒)
   - 设施放置系统
   - 消防栓 (增加射程)
   - 防火墙 (阻止蔓延)
   - 消防员 (自动灭火)

2. **js/resources.js** - 资源系统
   - 水量管理
   - 补水点
   - 得分系统

3. **js/facility.js** - 设施系统
   - Facility 基类
   - FireHydrant
   - FireWall
   - FireFighter
   - 渲染和交互

### 阶段五：关卡与UI（1h）
完善游戏体验：

1. **js/levels.js** - 关卡系统
   - Level 类
   - 5个关卡：
     * Level 1: 单栋木屋（教学）
     * Level 2: 3栋建筑（简单）
     * Level 3: 5栋建筑+风力（中等）
     * Level 4: 8栋建筑（困难）
     * Level 5: 12栋建筑（Boss）
   - 关卡解锁
   - 星级评分

2. 完善 **js/ui.js**
   - 主菜单
   - 关卡选择
   - 游戏内HUD
   - 暂停菜单
   - 结算界面

3. **js/audio.js** - 音效系统
   - 水流声
   - 火焰声
   - 建筑倒塌
   - 背景音乐

### 阶段六：优化与完善（0.5h）
性能和体验优化：

1. 性能优化
   - 粒子池化
   - 离屏Canvas
   - 脏矩形渲染
   - 帧率优化

2. 视觉优化
   - 渐变背景
   - 阴影效果
   - 屏幕震动

3. 游戏平衡
   - 调整参数
   - 测试关卡

4. 创建 **start.sh**
   - 启动脚本

5. 创建 **README.md**
   - 项目文档

## 核心机制

### 双阶段玩法
准备阶段 (30秒) → 战斗阶段 (实时) → 结算

### 资源循环
水量 → 喷射 → 熄灭火焰 → 得分 → 补水

## 文件结构
```
fire-fighter-game/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── constants.js
│   ├── game.js
│   ├── physics.js
│   ├── water.js
│   ├── building.js
│   ├── fire.js
│   ├── particles.js
│   ├── strategy.js
│   ├── resources.js
│   ├── facility.js
│   ├── levels.js
│   ├── ui.js
│   ├── input.js
│   └── audio.js
├── start.sh
└── README.md
```

## 视觉风格
- 卡通风格
- 鲜艳色彩
- 清晰UI

## 要求
1. 按阶段顺序开发
2. 每阶段测试
3. 所有5个关卡可玩
4. 代码注释清晰
5. 响应式设计
6. 本地存储
7. 性能优化60fps

## 完成后
运行通知命令：
```bash
openclaw system event --text '✅ 消防灭火游戏开发完成！' --mode now
```
