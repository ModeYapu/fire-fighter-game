/**
 * LevelEditorSystem - 关卡编辑器
 * 简单的网格编辑器，自定义关卡布局
 */
import { EDITOR_CONFIG, BUILDING_TYPES } from '../utils/constants.js';

export class LevelEditorSystem {
    constructor() {
        this.isActive = false;
        this.grid = [];
        this.buildings = [];
        this.selectedBuildingType = 'WOOD';
        this.selectedTool = 'place'; // place, remove, setFire
        this.gridOffset = { x: 0, y: 0 };

        // 初始化网格
        this.initGrid();
    }

    initGrid() {
        this.grid = [];
        for (let y = 0; y < EDITOR_CONFIG.GRID_ROWS; y++) {
            this.grid[y] = [];
            for (let x = 0; x < EDITOR_CONFIG.GRID_COLS; x++) {
                this.grid[y][x] = null; // null = empty
            }
        }
    }

    activate() {
        this.isActive = true;
        this.initGrid();
        this.buildings = [];
    }

    deactivate() {
        this.isActive = false;
    }

    handleMouseClick(game, mouseX, mouseY) {
        if (!this.isActive) return false;

        // 转换鼠标坐标到网格坐标
        const gridX = Math.floor((mouseX - this.gridOffset.x) / EDITOR_CONFIG.GRID_SIZE);
        const gridY = Math.floor((mouseY - this.gridOffset.y) / EDITOR_CONFIG.GRID_SIZE);

        // 检查边界
        if (gridX < 0 || gridX >= EDITOR_CONFIG.GRID_COLS ||
            gridY < 0 || gridY >= EDITOR_CONFIG.GRID_ROWS) {
            return false;
        }

        // 应用工具
        switch (this.selectedTool) {
            case 'place':
                this.placeBuilding(gridX, gridY);
                break;
            case 'remove':
                this.removeBuilding(gridX, gridY);
                break;
            case 'setFire':
                this.toggleFire(gridX, gridY);
                break;
        }

        return true;
    }

    placeBuilding(gridX, gridY) {
        // 检查是否已有建筑
        if (this.grid[gridY][gridX]) {
            return;
        }

        // 检查建筑数量限制
        if (this.buildings.length >= EDITOR_CONFIG.MAX_BUILDINGS) {
            return;
        }

        // 放置建筑
        const building = {
            type: this.selectedBuildingType,
            gridX: gridX,
            gridY: gridY,
            initialFire: false
        };

        this.grid[gridY][gridX] = building;
        this.buildings.push(building);
    }

    removeBuilding(gridX, gridY) {
        const building = this.grid[gridY][gridX];
        if (building) {
            this.grid[gridY][gridX] = null;
            const index = this.buildings.indexOf(building);
            if (index > -1) {
                this.buildings.splice(index, 1);
            }
        }
    }

    toggleFire(gridX, gridY) {
        const building = this.grid[gridY][gridX];
        if (building) {
            building.initialFire = !building.initialFire;
        }
    }

    setTool(tool) {
        this.selectedTool = tool;
    }

    setBuildingType(type) {
        this.selectedBuildingType = type;
    }

    clearAll() {
        this.initGrid();
        this.buildings = [];
    }

    exportLevel() {
        const level = {
            id: -2, // 自定义关卡ID
            name: '自定义关卡',
            description: '玩家创建的关卡',
            buildings: this.buildings.map(b => ({
                type: b.type,
                x: b.gridX * EDITOR_CONFIG.GRID_SIZE + 100,
                y: b.gridY * EDITOR_CONFIG.GRID_SIZE + 150
            })),
            initialFires: this.buildings
                .map((b, i) => b.initialFire ? i : -1)
                .filter(i => i >= 0),
            initialWater: 1500,
            time: 90,
            targetScore: 1000,
            wind: 0,
            fireSpreadRate: 1.0,
            availableFighters: 2
        };

        return level;
    }

    importLevel(level) {
        this.clearAll();

        level.buildings.forEach((b, index) => {
            const gridX = Math.floor((b.x - 100) / EDITOR_CONFIG.GRID_SIZE);
            const gridY = Math.floor((b.y - 150) / EDITOR_CONFIG.GRID_SIZE);

            if (gridX >= 0 && gridX < EDITOR_CONFIG.GRID_COLS &&
                gridY >= 0 && gridY < EDITOR_CONFIG.GRID_ROWS) {
                const building = {
                    type: b.type,
                    gridX: gridX,
                    gridY: gridY,
                    initialFire: level.initialFires.includes(index)
                };

                this.grid[gridY][gridX] = building;
                this.buildings.push(building);
            }
        });
    }

    render(ctx, canvasWidth, canvasHeight) {
        if (!this.isActive) return;

        // 计算网格偏移使其居中
        const gridPixelWidth = EDITOR_CONFIG.GRID_COLS * EDITOR_CONFIG.GRID_SIZE;
        const gridPixelHeight = EDITOR_CONFIG.GRID_ROWS * EDITOR_CONFIG.GRID_SIZE;
        this.gridOffset.x = Math.max(20, (canvasWidth - gridPixelWidth) / 2);
        this.gridOffset.y = Math.max(80, (canvasHeight - gridPixelHeight) / 2);

        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 标题栏
        ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
        ctx.fillRect(0, 0, canvasWidth, 60);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasWidth, 60);

        // 标题
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('关卡编辑器', canvasWidth / 2, 35);

        // 绘制网格
        this.renderGrid(ctx);

        // 绘制建筑
        this.renderBuildings(ctx);

        // 绘制工具栏
        this.renderToolbar(ctx, canvasWidth, canvasHeight);

        // 绘制信息面板
        this.renderInfoPanel(ctx, canvasWidth, canvasHeight);
    }

    renderGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // 垂直线
        for (let x = 0; x <= EDITOR_CONFIG.GRID_COLS; x++) {
            const px = this.gridOffset.x + x * EDITOR_CONFIG.GRID_SIZE;
            ctx.beginPath();
            ctx.moveTo(px, this.gridOffset.y);
            ctx.lineTo(px, this.gridOffset.y + EDITOR_CONFIG.GRID_ROWS * EDITOR_CONFIG.GRID_SIZE);
            ctx.stroke();
        }

        // 水平线
        for (let y = 0; y <= EDITOR_CONFIG.GRID_ROWS; y++) {
            const py = this.gridOffset.y + y * EDITOR_CONFIG.GRID_SIZE;
            ctx.beginPath();
            ctx.moveTo(this.gridOffset.x, py);
            ctx.lineTo(this.gridOffset.x + EDITOR_CONFIG.GRID_COLS * EDITOR_CONFIG.GRID_SIZE, py);
            ctx.stroke();
        }
    }

    renderBuildings(ctx) {
        this.buildings.forEach(building => {
            const config = BUILDING_TYPES[building.type];
            const x = this.gridOffset.x + building.gridX * EDITOR_CONFIG.GRID_SIZE;
            const y = this.gridOffset.y + building.gridY * EDITOR_CONFIG.GRID_SIZE;
            const size = EDITOR_CONFIG.GRID_SIZE - 2;

            // 建筑背景
            ctx.fillStyle = config.color;
            ctx.fillRect(x + 1, y + 1, size, size);

            // 建筑边框
            ctx.strokeStyle = config.roofColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, size, size);

            // 建筑名称首字
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.name.charAt(0), x + size / 2, y + size / 2);
            ctx.textBaseline = 'alphabetic';

            // 初始火标记
            if (building.initialFire) {
                ctx.font = '14px Arial';
                ctx.fillText('🔥', x + size - 8, y + 12);
            }
        });
    }

    renderToolbar(ctx, canvasWidth, canvasHeight) {
        const toolbarY = canvasHeight - 80;

        // 工具栏背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, toolbarY, canvasWidth, 80);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, toolbarY, canvasWidth, 80);

        // 工具按钮
        const tools = [
            { id: 'place', name: '放置', icon: '🏗️', x: 50 },
            { id: 'remove', name: '删除', icon: '❌', x: 150 },
            { id: 'setFire', name: '起火', icon: '🔥', x: 250 }
        ];

        tools.forEach(tool => {
            const isActive = this.selectedTool === tool.id;
            const tx = tool.x;
            const ty = toolbarY + 15;

            // 按钮
            ctx.fillStyle = isActive ? 'rgba(52, 152, 219, 0.5)' : 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(tx - 35, ty, 70, 50);

            if (isActive) {
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 2;
                ctx.strokeRect(tx - 35, ty, 70, 50);
            }

            // 图标
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tool.icon, tx, ty + 25);

            // 名称
            ctx.font = '12px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(tool.name, tx, ty + 42);
        });

        // 建筑类型选择
        const types = ['WOOD', 'BRICK', 'HIGH_RISE'];
        const typeLabels = { WOOD: '木屋', BRICK: '砖房', HIGH_RISE: '高楼' };

        ctx.font = '12px Arial';
        ctx.fillStyle = '#bdc3c7';
        ctx.textAlign = 'left';
        ctx.fillText('建筑类型:', 350, toolbarY + 25);

        types.forEach((type, index) => {
            const tx = 350 + index * 100;
            const ty = toolbarY + 40;
            const isSelected = this.selectedBuildingType === type;

            ctx.fillStyle = isSelected ? '#3498db' : 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(tx, ty, 80, 25);

            ctx.font = '12px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(typeLabels[type], tx + 40, ty + 17);
        });

        // 操作按钮
        const actions = [
            { name: '清空', key: '[C]', x: canvasWidth - 250 },
            { name: '导出', key: '[E]', x: canvasWidth - 170 },
            { name: '返回', key: '[ESC]', x: canvasWidth - 90 }
        ];

        actions.forEach(action => {
            ctx.font = '11px Arial';
            ctx.fillStyle = '#95a5a6';
            ctx.textAlign = 'center';
            ctx.fillText(`${action.name} ${action.key}`, action.x, toolbarY + 45);
        });
    }

    renderInfoPanel(ctx, canvasWidth, canvasHeight) {
        const infoX = canvasWidth - 180;
        const infoY = 70;

        // 信息面板背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(infoX, infoY, 160, 100);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(infoX, infoY, 160, 100);

        // 信息
        ctx.font = '12px Arial';
        ctx.fillStyle = '#bdc3c7';
        ctx.textAlign = 'left';
        let y = infoY + 20;
        const lineHeight = 18;

        ctx.fillText(`建筑数量: ${this.buildings.length}/${EDITOR_CONFIG.MAX_BUILDINGS}`, infoX + 10, y);
        y += lineHeight;

        const fireCount = this.buildings.filter(b => b.initialFire).length;
        ctx.fillText(`初始火源: ${fireCount}`, infoX + 10, y);
        y += lineHeight;

        ctx.fillText(`网格: ${EDITOR_CONFIG.GRID_COLS}x${EDITOR_CONFIG.GRID_ROWS}`, infoX + 10, y);
        y += lineHeight;

        const typeLabels = { WOOD: '木屋', BRICK: '砖房', HIGH_RISE: '高楼' };
        ctx.fillText(`当前: ${typeLabels[this.selectedBuildingType]}`, infoX + 10, y);
    }

    handleKeyPress(key) {
        if (!this.isActive) return false;

        switch (key) {
            case 'Escape':
                this.deactivate();
                return true;
            case 'KeyC':
                this.clearAll();
                return true;
            case 'KeyE':
                // 导出关卡 - 返回关卡数据
                return true;
            case 'Digit1':
                this.setTool('place');
                return true;
            case 'Digit2':
                this.setTool('remove');
                return true;
            case 'Digit3':
                this.setTool('setFire');
                return true;
            case 'KeyQ':
                this.setBuildingType('WOOD');
                return true;
            case 'KeyW':
                this.setBuildingType('BRICK');
                return true;
            case 'KeyR':
                this.setBuildingType('HIGH_RISE');
                return true;
        }

        return false;
    }

    roundRect(ctx, x, y, width, height, radius) {
        if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, radius);
        } else {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }
    }
}
