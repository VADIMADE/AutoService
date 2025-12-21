// js/services.js

const API_URL = 'http://localhost:3000';

// Основная функция загрузки и отображения услуг
async function loadServices() {
    try {
        console.log('Загрузка услуг с JSON Server...');
        
        // Загружаем услуги с сервера
        const response = await fetch(`${API_URL}/services`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const services = await response.json();
        console.log('Услуги загружены:', services);
        
        // Отображаем услуги на странице
        displayServices(services);
        
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        showErrorMessage('Не удалось загрузить услуги. Проверьте, запущен ли JSON Server.');
    }
}

// Функция для отображения услуг на странице
function displayServices(services) {
    const servicesContainer = document.querySelector('.services-grid');
    
    if (!servicesContainer) {
        console.error('Контейнер для услуг (.services-grid) не найден');
        return;
    }
    
    // Очищаем контейнер
    servicesContainer.innerHTML = '';
    
    // Если услуг нет, показываем сообщение
    if (!services || services.length === 0) {
        servicesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>Услуги временно недоступны</p>
            </div>
        `;
        return;
    }
    
    // Создаем карточки для каждой услуги
    services.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesContainer.appendChild(serviceCard);
    });
    
    // Добавляем обработчики событий для кнопок
    addBookingEventListeners();
}

// Создание HTML карточки для услуги
function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    
    // Создаем список пунктов, если они есть
    let itemsHTML = '';
    if (service.items && Array.isArray(service.items)) {
        itemsHTML = service.items.map(item => `<li>${item}</li>`).join('');
    }
    
    // Используем заглушку для изображения если нет картинки
    const imageUrl = service.image || 'https://via.placeholder.com/150x150/373F43/FFFFFF?text=AutoService';
    
    card.innerHTML = `
        <div class="service-card-content">
            <div class="service-card-header">
                <h3 class="service-card-title">${service.title || 'Услуга'}</h3>
                <span class="service-card-price">${service.price || 'Цена по запросу'}</span>
            </div>
            <div class="service-card-body">
                <div class="service-card-image">
                    <img src="${imageUrl}" alt="${service.title || 'Услуга'}" 
                         onerror="this.src='https://via.placeholder.com/150x150/373F43/FFFFFF?text=${encodeURIComponent(service.title || 'Услуга')}'">
                </div>
                <div class="service-card-info">
                    <p class="service-card-text">${service.description || 'Описание услуги'}</p>
                    ${itemsHTML ? `<ul class="service-card-list">${itemsHTML}</ul>` : ''}
                    <button class="service-card-btn" 
                            data-service-id="${service.id}"
                            data-service-title="${service.title}"
                            data-service-price="${service.price}">
                        Записаться
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Добавление обработчиков для кнопок "Записаться"
function addBookingEventListeners() {
    document.querySelectorAll('.service-card-btn').forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-service-id');
            const serviceTitle = this.getAttribute('data-service-title');
            const servicePrice = this.getAttribute('data-service-price');
            
            // Проверяем авторизацию пользователя
            checkUserAuth(serviceId, serviceTitle, servicePrice);
        });
    });
}

// Проверка авторизации пользователя
function checkUserAuth(serviceId, serviceTitle, servicePrice) {
    // Проверяем, есть ли данные пользователя в localStorage
    const userData = localStorage.getItem('currentUser');
    
    if (!userData) {
        // Пользователь не авторизован - сохраняем данные и предлагаем войти
        localStorage.setItem('bookingRedirect', JSON.stringify({
            serviceId,
            serviceTitle,
            servicePrice
        }));
        
        if (confirm(`Для записи на "${serviceTitle}" необходимо войти в систему.\n\nХотите войти сейчас?`)) {
            // Открываем модальное окно входа
            if (typeof window.openSigninModal === 'function') {
                window.openSigninModal();
            } else {
                alert('Нажмите кнопку "Войти" в шапке сайта');
            }
        }
    } else {
        // Пользователь авторизован
        try {
            const user = JSON.parse(userData);
            showBookingModal(serviceId, serviceTitle, servicePrice, user);
        } catch (error) {
            console.error('Ошибка парсинга данных пользователя:', error);
            localStorage.removeItem('currentUser');
            checkUserAuth(serviceId, serviceTitle, servicePrice);
        }
    }
}

// Модальное окно для записи
function showBookingModal(serviceId, serviceTitle, servicePrice, user) {
    const modal = document.createElement('div');
    modal.className = 'booking-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // Генерируем доступные даты (сегодня + 7 дней)
    const today = new Date();
    const dateOptions = [];
    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const formattedDate = date.toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: 'numeric',
            month: 'long'
        });
        dateOptions.push(`<option value="${dateString}">${formattedDate}</option>`);
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #333;">Запись на услугу</h2>
                <button class="close-modal" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                ">&times;</button>
            </div>
            
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f8f8; border-radius: 5px;">
                <h3 style="color: #CC7000; margin-bottom: 10px;">${serviceTitle}</h3>
                <p style="color: #666; margin-bottom: 5px;"><strong>Цена:</strong> ${servicePrice}</p>
                <p style="color: #666; margin-bottom: 5px;"><strong>Клиент:</strong> ${user.firstName} ${user.lastName}</p>
                <p style="color: #666;"><strong>Email:</strong> ${user.email}</p>
            </div>
            
            <form id="bookingForm">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #333;">Выберите дату</label>
                    <select id="bookingDate" required style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        box-sizing: border-box;
                    ">
                        <option value="">Выберите дату</option>
                        ${dateOptions.join('')}
                    </select>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #333;">Выберите время</label>
                    <select id="bookingTime" required style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        box-sizing: border-box;
                    ">
                        <option value="">Выберите время</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="12:00">12:00</option>
                        <option value="13:00">13:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                        <option value="17:00">17:00</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #333;">Дополнительные пожелания (необязательно)</label>
                    <textarea id="bookingNotes" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        box-sizing: border-box;
                        min-height: 80px;
                        resize: vertical;
                    " placeholder="Например: нужна замена масла на синтетическое..."></textarea>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button type="submit" style="
                        flex: 1;
                        padding: 12px;
                        background-color: #CC7000;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                    ">Подтвердить запись</button>
                    
                    <button type="button" class="cancel-booking" style="
                        flex: 1;
                        padding: 12px;
                        background-color: #f5f5f5;
                        color: #333;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие модального окна
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.cancel-booking').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие при клике на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Обработка формы
    modal.querySelector('#bookingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dateSelect = modal.querySelector('#bookingDate');
        const timeSelect = modal.querySelector('#bookingTime');
        const notesTextarea = modal.querySelector('#bookingNotes');
        
        const bookingData = {
            userId: user.id,
            serviceId: serviceId,
            date: dateSelect.value,
            time: timeSelect.value,
            notes: notesTextarea.value || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        console.log('Данные для записи:', bookingData);
        
        // Отправляем запрос на создание записи
        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
            
            if (response.ok) {
                const newBooking = await response.json();
                
                // Закрываем модальное окно
                document.body.removeChild(modal);
                
                // Простое сообщение об успехе вместо модального окна
                alert(`✅ Запись успешно создана!\n\nУслуга: ${serviceTitle}\nДата: ${dateSelect.options[dateSelect.selectedIndex].text}\nВремя: ${timeSelect.value}\n\nМы свяжемся с вами для подтверждения записи.`);
                
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('Ошибка создания записи:', error);
            alert('Ошибка при создании записи. Попробуйте еще раз.');
        }
    });
}

// Вспомогательные функции
function showErrorMessage(message) {
    const servicesContainer = document.querySelector('.services-grid');
    
    if (servicesContainer) {
        servicesContainer.innerHTML = `
            <div class="error-message" style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: #666;
                background: #f8f8f8;
                border-radius: 10px;
                margin: 20px 0;
            ">
                <p style="margin-bottom: 10px; font-size: 18px;">⚠️ ${message}</p>
                <button onclick="location.reload()" style="
                    padding: 10px 20px;
                    background-color: #CC7000;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    Обновить страницу
                </button>
            </div>
        `;
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadServices);

// Проверяем, есть ли редирект после авторизации
document.addEventListener('DOMContentLoaded', function() {
    const bookingRedirect = localStorage.getItem('bookingRedirect');
    
    if (bookingRedirect) {
        try {
            const data = JSON.parse(bookingRedirect);
            
            // Удаляем данные редиректа
            localStorage.removeItem('bookingRedirect');
            
            // Если пользователь авторизован, открываем окно записи
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    setTimeout(() => {
                        alert(`Добро пожаловать! Вы выбрали услугу: ${data.serviceTitle}`);
                        showBookingModal(data.serviceId, data.serviceTitle, data.servicePrice, user);
                    }, 500);
                } catch (error) {
                    console.error('Ошибка:', error);
                }
            }
            
        } catch (error) {
            console.error('Ошибка парсинга bookingRedirect:', error);
            localStorage.removeItem('bookingRedirect');
        }
    }
});

// Делаем функции доступными для auth.js
window.openBookingForService = function(serviceId, serviceTitle, servicePrice) {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            showBookingModal(serviceId, serviceTitle, servicePrice, user);
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка загрузки данных пользователя');
        }
    }
};

// Функция для проверки авторизации (совместимость с auth.js)
window.getCurrentUser = function() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            return null;
        }
    }
    return null;
};