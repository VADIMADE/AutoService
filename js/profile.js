// profile.js
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Страница профиля загружена');
  
  // Проверяем авторизацию
  const user = await checkAuth();
  if (!user) return;
  
  // Загружаем и отображаем данные пользователя
  await loadAndDisplayUserData(user);
  
  // Загружаем записи пользователя
  await loadUserBookings(user.id);
});

// Проверка авторизации
async function checkAuth() {
  try {
    // Пробуем получить пользователя из localStorage
    const userData = localStorage.getItem('currentUser');
    
    if (!userData) {
      console.log('Пользователь не авторизован, перенаправляем на главную');
      window.location.href = '../index.html';
      return null;
    }
    
    const user = JSON.parse(userData);
    console.log('Текущий пользователь:', user);
    
    // Дополнительная проверка с сервера
    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`);
      if (!response.ok) {
        throw new Error('Пользователь не найден на сервере');
      }
      return await response.json();
    } catch (error) {
      console.warn('Ошибка проверки на сервере, используем локальные данные:', error);
      return user; // Возвращаем локальные данные если сервер недоступен
    }
    
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
    return null;
  }
}

// Загрузка и отображение данных пользователя
async function loadAndDisplayUserData(user) {
  console.log('Отображаем данные пользователя:', user);
  
  const profileInfo = document.getElementById('profileInfo');
  if (!profileInfo) return;
  
  // Формируем HTML для отображения данных
  profileInfo.innerHTML = `
    <div class="user-info-grid">
      <div class="info-item">
        <span class="info-label">Имя</span>
        <span class="info-value">${user.firstName || 'Не указано'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Фамилия</span>
        <span class="info-value">${user.lastName || 'Не указано'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email</span>
        <span class="info-value">${user.email || 'Не указано'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Телефон</span>
        <span class="info-value">${user.phone || 'Не указано'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Роль</span>
        <span class="info-value">${user.role === 'admin' ? 'Администратор' : 'Клиент'}</span>
      </div>
      ${user.registrationDate ? `
        <div class="info-item">
          <span class="info-label">Дата регистрации</span>
          <span class="info-value">${new Date(user.registrationDate).toLocaleDateString('ru-RU')}</span>
        </div>
      ` : ''}
    </div>
  `;
  
  // Показываем админ-панель если пользователь админ
  if (user.role === 'admin') {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
      adminPanel.style.display = 'block';
    }
  }
}

// Загрузка записей пользователя
async function loadUserBookings(userId) {
  console.log('Загружаем записи для пользователя:', userId);
  
  try {
    // Получаем все записи
    const response = await fetch(`${API_BASE}/bookings`);
    if (!response.ok) {
      throw new Error('Ошибка загрузки записей');
    }
    
    let allBookings = await response.json();
    console.log('Все записи с сервера:', allBookings);
    
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
    const servicesResponse = await fetch(`${API_BASE}/services`);
    const services = servicesResponse.ok ? await servicesResponse.json() : [];
    
    // Отображаем записи
    displayBookings(userBookings, services);
    
  } catch (error) {
    console.error('Ошибка загрузки записей:', error);
    showNoBookings();
  }
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
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
  }
}

// Глобальная функция
window.logout = logout;