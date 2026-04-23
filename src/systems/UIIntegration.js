/**
 * UI集成代码 - 用于绑定所有新系统的UI事件
 * 在UIManager.js中使用
 */

// 绑定新系统UI事件
function bindNewSystemUIEvents(game) {
    console.log('🎨 开始绑定UI事件...');
    
    // ========== 升级中心 ==========
    const upgradeBtn = document.getElementById('btn-upgrade');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            showUpgradeMenu(game);
        });
        console.log('✅ 升级中心按钮绑定成功');
    }
    
    const backUpgradeBtn = document.getElementById('btn-back-upgrade');
    if (backUpgradeBtn) {
        backUpgradeBtn.addEventListener('click', () => {
            hideUpgradeMenu();
        });
    }
    
    // ========== 消防车库 ==========
    const vehicleBtn = document.getElementById('btn-vehicle');
    if (vehicleBtn) {
        vehicleBtn.addEventListener('click', () => {
            showVehicleMenu(game);
        });
        console.log('✅ 消防车库按钮绑定成功');
    }
    
    const backVehicleBtn = document.getElementById('btn-back-vehicle');
    if (backVehicleBtn) {
        backVehicleBtn.addEventListener('click', () => {
            hideVehicleMenu();
        });
    }
    
    // ========== 设置菜单 ==========
    const settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showSettingsMenu(game);
        });
        console.log('✅ 设置按钮绑定成功');
    }
    
    const backSettingsBtn = document.getElementById('btn-back-settings');
    if (backSettingsBtn) {
        backSettingsBtn.addEventListener('click', () => {
            hideSettingsMenu();
        });
    }
    
    // ========== 每日挑战 ==========
    const dailyBtn = document.getElementById('btn-daily');
    if (dailyBtn) {
        dailyBtn.addEventListener('click', () => {
            showDailyChallengeMenu(game);
        });
        console.log('✅ 每日挑战按钮绑定成功');
    }
    
    const backDailyBtn = document.getElementById('btn-back-daily');
    if (backDailyBtn) {
        backDailyBtn.addEventListener('click', () => {
            hideDailyChallengeMenu();
        });
    }
    
    // ========== 设施分类标签 ==========
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            filterFacilitiesByCategory(category, game);
        });
    });
    console.log('✅ 设施分类标签绑定成功');
    
    console.log('🎉 UI事件绑定完成');
}

// ========== 显示菜单函数 ==========

function showUpgradeMenu(game) {
    const upgradeMenu = document.getElementById('upgrade-menu');
    const upgradeList = document.getElementById('upgrade-list');
    const mainMenu = document.getElementById('main-menu');
    
    if (upgradeMenu && upgradeList) {
        mainMenu.style.display = 'none';
        upgradeMenu.style.display = 'flex';
        
        if (game.upgradeSystem) {
            game.upgradeSystem.renderShopUI(upgradeList);
        } else {
            upgradeList.innerHTML = '<p style="color: #fff; text-align: center; padding: 20px;">升级系统未加载</p>';
        }
    }
}

function hideUpgradeMenu() {
    document.getElementById('upgrade-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

function showVehicleMenu(game) {
    const vehicleMenu = document.getElementById('vehicle-menu');
    const vehicleList = document.getElementById('vehicle-list');
    const mainMenu = document.getElementById('main-menu');
    
    if (vehicleMenu && vehicleList) {
        mainMenu.style.display = 'none';
        vehicleMenu.style.display = 'flex';
        
        if (game.vehicleSystem) {
            game.vehicleSystem.renderGarageUI(vehicleList);
        } else {
            vehicleList.innerHTML = '<p style="color: #fff; text-align: center; padding: 20px;">车辆系统未加载</p>';
        }
    }
}

function hideVehicleMenu() {
    document.getElementById('vehicle-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

function showSettingsMenu(game) {
    const settingsMenu = document.getElementById('settings-menu');
    const settingsList = document.getElementById('settings-list');
    const mainMenu = document.getElementById('main-menu');
    
    if (settingsMenu && settingsList) {
        mainMenu.style.display = 'none';
        settingsMenu.style.display = 'flex';
        
        if (game.settingsSystem) {
            game.settingsSystem.renderSettingsUI(settingsList);
        } else {
            settingsList.innerHTML = '<p style="color: #fff; text-align: center; padding: 20px;">设置系统未加载</p>';
        }
    }
}

function hideSettingsMenu() {
    document.getElementById('settings-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

function showDailyChallengeMenu(game) {
    const dailyMenu = document.getElementById('daily-menu');
    const dailyContent = document.getElementById('daily-content');
    const mainMenu = document.getElementById('main-menu');
    
    if (dailyMenu && dailyContent) {
        mainMenu.style.display = 'none';
        dailyMenu.style.display = 'flex';
        
        if (game.dailyChallenge) {
            game.renderDailyChallengeUI(dailyContent);
        } else {
            dailyContent.innerHTML = '<p style="color: #fff; text-align: center; padding: 20px;">每日挑战系统未加载</p>';
        }
    }
}

function hideDailyChallengeMenu() {
    document.getElementById('daily-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

// ========== 设施过滤 ==========

function filterFacilitiesByCategory(category, game) {
    // 更新标签状态
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.category-tab[data-category="${category}"]`).classList.add('active');
    
    // 更新设施显示
    document.querySelectorAll('.facility-btn').forEach(btn => {
        if (category === 'all' || btn.dataset.category === category) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
}

// ========== 消息显示 ==========

function showMessage(message, duration = 2000) {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = 'game-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: #fff;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        animation: fadeInOut ${duration}ms ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // 自动移除
    setTimeout(() => {
        messageEl.remove();
    }, duration);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { bindNewSystemUIEvents, showMessage };
}
