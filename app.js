const tg = window.Telegram.WebApp;

tg.expand();
tg.ready();

// Элементы
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const avatarSkeleton = document.getElementById('avatar-skeleton');
const statusBadge = document.getElementById('status-badge');
const userStatusEl = document.getElementById('user-status');

const payBtn = document.getElementById('pay-btn');
const bottomBar = document.getElementById('bottom-bar');
const tariffCards = document.querySelectorAll('.tariff-card');

let selectedTariff = null;
let selectedPrice = 0;

// Установка данных пользователя с имитацией загрузки
setTimeout(() => {
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        
        // Убираем скелетон, показываем текст
        userNameEl.innerHTML = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        
        avatarSkeleton.style.display = 'none';
        userAvatarEl.style.display = 'block';
        userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=222&color=fff&size=128&bold=true`;
        
        // В реальном боте здесь должен быть запрос к API за статусом.
        // Для WebApp мы покажем заглушку (как будто подписки нет).
        statusBadge.classList.add('status-inactive');
        userStatusEl.textContent = 'Нет подписки';
    } else {
        userNameEl.innerHTML = 'Гость';
        avatarSkeleton.style.display = 'none';
    }
}, 500); // Небольшая задержка для красоты эффекта загрузки

// Логика выбора тарифа
tariffCards.forEach(card => {
    card.addEventListener('click', () => {
        // Haptic Feedback
        tg.HapticFeedback.selectionChanged();
        tg.HapticFeedback.impactOccurred('light');

        // Убираем активный класс у всех
        tariffCards.forEach(c => c.classList.remove('active'));
        // Добавляем текущему
        card.classList.add('active');
        
        selectedTariff = card.getAttribute('data-tariff');
        selectedPrice = card.getAttribute('data-price');
        
        // Обновляем кнопку
        payBtn.querySelector('span').textContent = `Оплатить ${selectedPrice} ₽`;
        
        // Показываем нижний бар плавно
        if (!bottomBar.classList.contains('visible')) {
            bottomBar.classList.add('visible');
        }
    });
});

// Обработка кнопки оплаты
payBtn.addEventListener('click', () => {
    if (!selectedTariff) return;
    
    // Сильный тактильный отклик перед закрытием
    tg.HapticFeedback.impactOccurred('heavy');
    
    // Изменяем текст на кнопке
    payBtn.querySelector('span').textContent = 'Обработка...';
    
    // Формируем данные
    const data = JSON.stringify({
        action: 'buy',
        tariff: selectedTariff,
        price: selectedPrice
    });

    // Небольшая задержка для эффекта
    setTimeout(() => {
        tg.sendData(data);
        tg.close();
    }, 400);
});

// Клик по ключу (копирование)
document.getElementById('copy-key-btn').addEventListener('click', () => {
    const keyText = document.getElementById('vpn-key').textContent;
    if (keyText && keyText !== 'У вас нет активной подписки') {
        navigator.clipboard.writeText(keyText).then(() => {
            tg.HapticFeedback.notificationOccurred('success');
            tg.showAlert('Ключ скопирован в буфер обмена!');
        });
    } else {
        tg.HapticFeedback.notificationOccurred('error');
    }
});

// Цвета темы
if (tg.themeParams) {
    if (tg.themeParams.button_color) {
        document.documentElement.style.setProperty('--primary', tg.themeParams.button_color);
    }
    if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty('--bg-base', tg.themeParams.bg_color);
    }
}
