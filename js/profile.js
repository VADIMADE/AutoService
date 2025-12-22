document.addEventListener('DOMContentLoaded', async () => {
    console.log('Страница профиля загружена');
    
    // Проверяем авторизацию
    const user = checkAuth();
    if (!user) return;
    
    // Загружаем и отображаем данные пользователя
    loadAndDisplayUserData(user);
    
    // Загружаем записи пользователя
    loadUserBookings(user.id);
});

// Проверка авторизации
function checkAuth() {
    try {
        const userData = localStorage.getItem('autoservice_currentUser');
        
        if (!userData) {
            console.log('Пользователь не авторизован, перенаправляем на главную');
            window.location.href = '../index.html';
            return null;
        }
        
        const user = JSON.parse(userData);
        console.log('Текущий пользователь:', user);
        
        return user;
        
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        localStorage.removeItem('autoservice_currentUser');
        window.location.href = '../index.html';
        return null;
    }
}

// Загрузка и отображение данных пользователя
function loadAndDisplayUserData(user) {
    console.log('Отображаем данные пользователя:', user);
    
    const profileInfo = document.getElementById('profileInfo');
    if (!profileInfo) return;
    
    // Получаем полные данные пользователя
    const users = JSON.parse(localStorage.getItem('autoservice_users') || '[]');
    const fullUser = users.find(u => u.id === user.id) || user;
    
    // Формируем HTML для отображения данных
    profileInfo.innerHTML = `
        <div class="user-info-grid">
            <div class="info-item">
                <span class="info-label">Имя</span>
                <span class="info-value">${fullUser.firstName || 'Не указано'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Фамилия</span>
                <span class="info-value">${fullUser.lastName || 'Не указано'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">${fullUser.email || 'Не указано'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Телефон</span>
                <span class="info-value">${fullUser.phone || 'Не указано'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Роль</span>
                <span class="info-value">${fullUser.role === 'admin' ? 'Администратор' : 'Клиент'}</span>
            </div>
            ${fullUser.registrationDate ? `
                <div class="info-item">
                    <span class="info-label">Дата регистрации</span>
                    <span class="info-value">${new Date(fullUser.registrationDate).toLocaleDateString('ru-RU')}</span>
                </div>
            ` : ''}
        </div>
    `;
    
    // Показываем админ-панель если пользователь админ
    if (fullUser.role === 'admin') {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
            adminPanel.innerHTML = `
                <h3 style="color: #CC7000; margin-bottom: 15px;">Административная панель</h3>
                <div style="margin: 20px 0;">
                    <button onclick="goToAdminPage()" style="
                        padding: 12px 24px;
                        background-color: #CC7000;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        📊 Перейти в админ-панель
                    </button>
                </div>
                <p style="color: #666; font-size: 14px; background: #f8f8f8; padding: 10px; border-radius: 5px;">
                    В админ-панели вы можете добавлять, редактировать и удалять услуги, просматривать все записи.
                </p>
            `;
        }
    }
}

// Функция перехода в админ-панель
function goToAdminPage() {
    // Проверяем, что пользователь админ
    const user = JSON.parse(localStorage.getItem('autoservice_currentUser') || '{}');
    if (user && user.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        alert('У вас нет прав администратора');
    }
}

// Загрузка записей пользователя
function loadUserBookings(userId) {
    console.log('Загружаем записи для пользователя:', userId);
    
    // Получаем все записи
    const allBookings = JSON.parse(localStorage.getItem('autoservice_bookings') || '[]');
    console.log('Все записи:', allBookings);
    
    // Фильтруем записи текущего пользователя
    const userBookings = allBookings.filter(booking => 
        booking.userId == userId || booking.userId === userId
    );
    
    console.log('Записи пользователя:', userBookings);
    
    // Если записей нет, показываем сообщение
    if (!userBookings || userBookings.length === 0) {
        showNoBookings();
        return;
    }
    
    // Загружаем данные об услугах
    const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
    
    // Отображаем записи
    displayBookings(userBookings, services);
}

// Отображение записей
function displayBookings(bookings, services) {
    const bookingsList = document.getElementById('bookingsList');
    const noBookings = document.getElementById('noBookings');
    
    if (!bookingsList) return;
    
    // Скрываем сообщение "нет записей"
    if (noBookings) noBookings.style.display = 'none';
    
    // Сортируем записи по дате (новые сверху)
    bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Создаем HTML для каждой записи
    bookingsList.innerHTML = bookings.map(booking => {
        // Находим услугу
        const service = services.find(s => s.id == booking.serviceId);
        const serviceName = service ? service.title : 'Услуга';
        const servicePrice = service ? service.price : 'Цена не указана';
        
        // Форматируем дату и время
        const date = new Date(booking.date);
        const formattedDate = date.toLocaleDateString('ru-RU');
        const formattedTime = booking.time || '10:00';
        
        // Определяем статус
        const statusInfo = getStatusInfo(booking.status);
        
        return `
            <div class="booking-item">
                <div class="booking-title">${serviceName}</div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <strong>Дата:</strong> ${formattedDate}
                    </div>
                    <div class="booking-detail">
                        <strong>Время:</strong> ${formattedTime}
                    </div>
                    <div class="booking-detail">
                        <strong>Стоимость:</strong> ${servicePrice}
                    </div>
                    ${booking.notes ? `
                        <div class="booking-detail">
                            <strong>Примечание:</strong> ${booking.notes}
                        </div>
                    ` : ''}
                </div>
                <span class="booking-status ${statusInfo.class}">
                    ${statusInfo.text}
                </span>
            </div>
        `;
    }).join('');
}

// Получение информации о статусе
function getStatusInfo(status) {
    const statuses = {
        'pending': { class: 'status-pending', text: 'Ожидает подтверждения' },
        'confirmed': { class: 'status-confirmed', text: 'Подтверждена' },
        'completed': { class: 'status-completed', text: 'Выполнена' },
        'cancelled': { class: 'status-cancelled', text: 'Отменена' }
    };
    
    return statuses[status] || { class: 'status-pending', text: 'Запланирована' };
}

// Показать сообщение "нет записей"
function showNoBookings() {
    const bookingsList = document.getElementById('bookingsList');
    const noBookings = document.getElementById('noBookings');
    
    if (bookingsList) bookingsList.innerHTML = '';
    if (noBookings) noBookings.style.display = 'block';
}

// Выход из системы
function logout() {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
        localStorage.removeItem('autoservice_currentUser');
        window.location.href = '../index.html';
    }
}

// Глобальные функции
window.logout = logout;
window.goToAdminPage = goToAdminPage;
