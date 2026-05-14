const tg = window.Telegram.WebApp;

tg.expand();
tg.ready();

// База данных приложений для устройств
const appsData = {
    ios: [
        { id: "vultr", name: "Vultr", tag: "РЕКОМЕНДУЕТСЯ", link: "https://apps.apple.com/us/app/vultr/id6450284451" },
        { id: "foxray", name: "Foxray", tag: "АЛЬТЕРНАТИВА", link: "https://apps.apple.com/us/app/foxray/id6448898396" }
    ],
    android: [
        { id: "v2rayng", name: "v2rayNG", tag: "РЕКОМЕНДУЕТСЯ", link: "https://play.google.com/store/apps/details?id=com.v2ray.ang" },
        { id: "hiddify", name: "Hiddify", tag: "ПРОСТОЕ", link: "https://play.google.com/store/apps/details?id=app.hiddify.com" }
    ],
    windows: [
        { id: "v2rayn", name: "v2rayN", tag: "РЕКОМЕНДУЕТСЯ", link: "https://github.com/2dust/v2rayN/releases" },
        { id: "hiddify-win", name: "Hiddify", tag: "УДОБНОЕ", link: "https://github.com/hiddify/hiddify-next/releases" }
    ]
};

// Элементы
const vpnKeyEl = document.getElementById('vpn-key');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const step1Title = document.getElementById('step1-title');
const step3Desc = document.getElementById('step3-desc');
const appSelectionGrid = document.getElementById('app-selection-grid');
const deviceCards = document.querySelectorAll('.device-card');

let currentDevice = 'ios';
let currentApp = appsData.ios[0];
let userVpnKey = "";

// Инициализация
function init() {
    // Пытаемся достать ключ, если мы передали его из бота через initData
    // В реальном боте лучше получать по API, но для демо ставим заглушку
    userVpnKey = "vless://заглушка_пока_нет_подписки@server.com:443?type=tcp&security=none";
    vpnKeyEl.textContent = userVpnKey;

    renderApps(currentDevice);
}

// Рендер приложений под устройство
function renderApps(device) {
    appSelectionGrid.innerHTML = '';
    const apps = appsData[device] || appsData.ios;
    
    apps.forEach((app, index) => {
        const div = document.createElement('div');
        div.className = `app-card ${index === 0 ? 'active' : ''}`;
        div.innerHTML = `<h4>${app.name}</h4><p>${app.tag}</p>`;
        
        div.addEventListener('click', () => {
            tg.HapticFeedback.selectionChanged();
            document.querySelectorAll('.app-card').forEach(c => c.classList.remove('active'));
            div.classList.add('active');
            currentApp = app;
            updateSteps();
        });
        
        appSelectionGrid.appendChild(div);
    });
    
    currentApp = apps[0];
    updateSteps();
}

// Обновление шагов под приложение
function updateSteps() {
    step1Title.innerHTML = `Установите <span style="color: var(--cyan)">${currentApp.name}</span>`;
    downloadBtn.href = currentApp.link;
    
    if (currentDevice === 'ios' || currentDevice === 'android') {
        step3Desc.textContent = 'Откройте приложение, нажмите "+" (Добавить) и выберите "Import from Clipboard" (Импорт из буфера).';
    } else {
        step3Desc.textContent = 'В приложении нажмите "Servers" -> "Import from Clipboard". Затем включите System Proxy.';
    }
}

// Клики по устройствам
deviceCards.forEach(card => {
    card.addEventListener('click', () => {
        tg.HapticFeedback.selectionChanged();
        deviceCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentDevice = card.getAttribute('data-device');
        renderApps(currentDevice);
    });
});

// Копирование ключа
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(userVpnKey).then(() => {
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert('Ключ скопирован!');
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="20 6 9 17 4 12"></polyline></svg> Скопировано';
        setTimeout(() => {
            copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> Скопировать ключ';
        }, 3000);
    });
});

// Навигация (SPA Вкладки)
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        tg.HapticFeedback.selectionChanged();
        
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        
        const targetId = item.getAttribute('data-target');
        pages.forEach(p => {
            p.style.display = p.id === targetId ? 'block' : 'none';
        });
    });
});

// Оплата
let selectedTariff = '3_months';
let selectedPrice = '400';
const tariffItems = document.querySelectorAll('.tariff-item');
const payBtnMain = document.getElementById('pay-btn');

tariffItems.forEach(item => {
    item.addEventListener('click', () => {
        tg.HapticFeedback.selectionChanged();
        tariffItems.forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        selectedTariff = item.getAttribute('data-tariff');
        selectedPrice = item.getAttribute('data-price');
        payBtnMain.textContent = `Оплатить ${selectedPrice} ₽`;
    });
});

payBtnMain.addEventListener('click', () => {
    tg.HapticFeedback.impactOccurred('heavy');
    payBtnMain.textContent = 'Обработка...';
    
    const data = JSON.stringify({
        action: 'buy',
        tariff: selectedTariff,
        price: selectedPrice
    });

    setTimeout(() => {
        tg.sendData(data);
        tg.close();
    }, 400);
});

// Модалка QR Кода
const qrBtn = document.getElementById('qr-btn');
const qrModal = document.getElementById('qr-modal');
const closeQrBtn = document.getElementById('close-qr');
const qrImage = document.getElementById('qr-image');
const qrLoading = document.getElementById('qr-loading');

qrBtn.addEventListener('click', () => {
    tg.HapticFeedback.impactOccurred('light');
    qrModal.classList.add('active');
    
    // Генерация QR через API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(userVpnKey)}&bgcolor=ffffff`;
    qrImage.src = qrUrl;
    qrImage.onload = () => {
        qrLoading.style.display = 'none';
        qrImage.style.display = 'block';
    };
});

closeQrBtn.addEventListener('click', () => {
    qrModal.classList.remove('active');
});

init();
