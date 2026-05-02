const tg = window.Telegram.WebApp;

// Инициализация Web App
tg.expand();
tg.ready();

// Получаем элементы
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const payBtn = document.getElementById('pay-btn');
const tariffCards = document.querySelectorAll('.tariff-card');

let selectedTariff = null;
let selectedPrice = 0;

// Устанавливаем данные пользователя из Telegram
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    userNameEl.textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    
    // В Telegram WebApp нет прямой ссылки на аватар, поэтому мы можем использовать UI Avatars
    userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=5865F2&color=fff&size=128`;
}

// Запрашиваем актуальный статус у бота (для этого можно передавать параметры в URL WebApp, 
// но для простоты мы здесь просто показываем демо, а реальный статус бот пришлет в чат).
// Альтернативно: использовать tg.sendData() при загрузке.

// Логика выбора тарифа
tariffCards.forEach(card => {
    card.addEventListener('click', () => {
        // Убираем активный класс у всех
        tariffCards.forEach(c => c.classList.remove('active'));
        // Добавляем текущему
        card.classList.add('active');
        
        selectedTariff = card.getAttribute('data-tariff');
        selectedPrice = card.getAttribute('data-price');
        
        // Обновляем кнопку
        payBtn.disabled = false;
        payBtn.textContent = `Оплатить ${selectedPrice} ₽`;
        
        // Тактильная отдача (если поддерживается устройством)
        tg.HapticFeedback.selectionChanged();
    });
});

// Логика кнопки оплаты
payBtn.addEventListener('click', () => {
    if (!selectedTariff) return;
    
    // Формируем данные для отправки боту
    const data = JSON.stringify({
        action: 'buy',
        tariff: selectedTariff,
        price: selectedPrice
    });

    // Отправляем данные в бота и закрываем WebApp
    tg.sendData(data);
    tg.close();
});

// Цвета темы (адаптация под тему Telegram)
if (tg.themeParams) {
    if (tg.themeParams.button_color) {
        document.documentElement.style.setProperty('--primary', tg.themeParams.button_color);
    }
}
