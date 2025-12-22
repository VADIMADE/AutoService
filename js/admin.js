// js/admin.js
const STORAGE_KEY = 'autoservice_services';
const USERS_KEY = 'autoservice_users';

// Основная загрузка
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Админ панель загружена');
    
    // Проверяем админа
    if (!checkIfAdmin()) {
        alert('❌ Только для администраторов');
        window.location.href = 'profile.html';
        return;
    }
    
    // Инициализируем хранилище (создаем если нет)
    initStorage();
    
    // Загружаем услуги
    loadServices();
    
    // Настраиваем обработчики формы
    setupForm();
});

// ========== ИНИЦИАЛИЗАЦИЯ ХРАНИЛИЩА ==========
function initStorage() {
    // Проверяем, есть ли услуги в localStorage
    if (!localStorage.getItem(STORAGE_KEY)) {
        console.log('📝 Инициализирую хранилище услуг');
        
        // Начальные услуги (можно взять из вашего JSON)
        const initialServices = [
            {
                id: '1',
                title: 'ПЛАНОВОЕ ТО',
                price: 'от 250 бел. руб.',
                description: 'Комплексная диагностика и замена расходников по регламенту. Сохраните здоровье и ценность вашего автомобиля',
                image: '../img/card1-img.png',
                items: [
                    'Замена моторного масла и фильтра',
                    'Замена воздушного фильтра',
                    'Замена салонного фильтра',
                    'Диагностика систем двигателя',
                    'Проверка уровня всех технических жидкостей'
                ]
            },
            {
                id: '2',
                title: 'СРОЧНЫЙ РЕМОНТ',
                price: 'от 200 бел. руб.',
                description: 'Устраним любую неисправность двигателя, ходовой, электроники. Четкий диагноз и фиксированная цена',
                image: '../img/card2-img.png',
                items: [
                    'Диагностика неисправностей',
                    'Ремонт двигателя',
                    'Ремонт ходовой части',
                    'Устранение проблем с электроникой',
                    'Замена датчиков, ремней ГРМ, помп'
                ]
            },
            {
                id: '3',
                title: 'ШИНОМОНТАЖ',
                price: 'от 150 бел. руб.',
                description: 'Быстрая замена и балансировка колес. Предлагаем услуги сезонного хранения вашей резины',
                image: '../img/card3-img.png',
                items: [
                    'Демонтаж/монтаж шин',
                    'Компьютерная балансировка',
                    'Ремонт проколов',
                    'Замена вентилей',
                    'Хранение сезонной резины'
                ]
            }
        ];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialServices));
    }
}

// ========== ПОЛУЧИТЬ УСЛУГИ ИЗ LOCALSTORAGE ==========
function getServicesFromStorage() {
    try {
        const servicesJson = localStorage.getItem(STORAGE_KEY);
        return servicesJson ? JSON.parse(servicesJson) : [];
    } catch (error) {
        console.error('❌ Ошибка чтения услуг из localStorage:', error);
        return [];
    }
}

// ========== СОХРАНИТЬ УСЛУГИ В LOCALSTORAGE ==========
function saveServicesToStorage(services) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
        console.log('💾 Услуги сохранены в localStorage, количество:', services.length);
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения услуг в localStorage:', error);
        return false;
    }
}

// ========== ПОЛУЧИТЬ ПОСЛЕДНИЙ ID ==========
function getNextServiceId() {
    const services = getServicesFromStorage();
    if (services.length === 0) return '1';
    
    // Ищем максимальный числовой ID
    const numericIds = services
        .map(service => parseInt(service.id))
        .filter(id => !isNaN(id));
    
    if (numericIds.length > 0) {
        const maxId = Math.max(...numericIds);
        return (maxId + 1).toString();
    }
    
    // Если все ID не числовые, генерируем новый
    return Date.now().toString();
}

// ========== ПРОВЕРКА АДМИНА ==========
function checkIfAdmin() {
    try {
        const userStr = localStorage.getItem('autoservice_currentUser');
        if (!userStr) {
            console.log('👤 Пользователь не найден в localStorage');
            return false;
        }
        
        const user = JSON.parse(userStr);
        console.log('👤 Текущий пользователь:', user);
        return user && user.role === 'admin';
    } catch (error) {
        console.error('❌ Ошибка проверки пользователя:', error);
        return false;
    }
}

// ========== ЗАГРУЗКА УСЛУГ ==========
function loadServices() {
    console.log('📥 Загружаю услуги из localStorage...');
    
    const container = document.getElementById('servicesList');
    if (!container) {
        console.error('❌ Контейнер servicesList не найден!');
        return;
    }
    
    container.innerHTML = '<div class="loading">⏳ Загрузка услуг...</div>';
    
    try {
        const services = getServicesFromStorage();
        console.log(`✅ Загружено услуг: ${services.length}`);
        
        displayServices(services);
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        showError(`Не удалось загрузить услуги: ${error.message}`);
    }
}

// ========== ПОКАЗАТЬ УСЛУГИ ==========
function displayServices(services) {
    const container = document.getElementById('servicesList');
    
    if (!services || services.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>📭 Нет услуг</p>
                <p>Добавьте первую услугу через форму выше</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = services.map(service => `
        <div class="service-card" data-id="${service.id}">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #333;">${service.title || 'Без названия'}</h3>
                    <div style="color: #CC7000; font-weight: bold; font-size: 18px;">${service.price || 'Цена не указана'}</div>
                </div>
                <div style="background: #f0f0f0; padding: 2px 8px; border-radius: 10px; font-size: 12px;">
                    ID: ${service.id}
                </div>
            </div>
            
            <p style="color: #666; margin-bottom: 15px;">${service.description || 'Нет описания'}</p>
            
            ${service.image ? `
                <div style="margin-bottom: 10px; font-size: 12px; color: #888;">
                    🖼️ Изображение: ${service.image}
                </div>
            ` : ''}
            
            ${service.items && service.items.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <strong style="font-size: 14px;">Что входит:</strong>
                    <ul style="margin: 5px 0 0 20px; font-size: 14px; color: #555;">
                        ${service.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="editService('${service.id}')" 
                        class="btn-edit">
                    ✏️ Изменить
                </button>
                <button onclick="deleteService('${service.id}')" 
                        class="btn-delete">
                    🗑️ Удалить
                </button>
            </div>
        </div>
    `).join('');
    
    // Добавляем стили если их нет
    if (!document.querySelector('#admin-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-styles';
        style.textContent = `
            .service-card {
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
                transition: all 0.3s;
            }
            .service-card:hover {
                border-color: #CC7000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .loading {
                text-align: center;
                padding: 40px;
                color: #666;
            }
            .btn-edit {
                padding: 8px 16px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.3s;
            }
            .btn-edit:hover {
                background: #45a049;
            }
            .btn-delete {
                padding: 8px 16px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.3s;
            }
            .btn-delete:hover {
                background: #d32f2f;
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== НАСТРОЙКА ФОРМЫ ==========
function setupForm() {
    const form = document.getElementById('serviceForm');
    
    if (!form) {
        console.error('❌ Форма serviceForm не найдена!');
        return;
    }
    
    // Обработчик отправки формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        saveService();
    });
    
    // Кнопка очистки
    const clearBtn = document.getElementById('clearForm');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            resetForm();
            showMessage('Форма очищена', 'info');
        });
    }
    
    // Кнопка отмены
    const cancelBtn = document.getElementById('cancelEdit');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            resetForm();
            showMessage('Редактирование отменено', 'info');
        });
    }
    
    // Кнопка обновления
    const updateBtn = document.getElementById('updateService');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            handleUpdate();
        });
    }
}

// ========== ОБРАБОТЧИК КНОПКИ ОБНОВИТЬ ==========
function handleUpdate() {
    console.log('🔄 Нажата кнопка "Обновить услугу"');
    
    // Проверяем ID
    const id = document.getElementById('serviceId').value;
    if (!id) {
        showMessage('Сначала выберите услугу для редактирования', 'error');
        return;
    }
    
    // Вызываем saveService
    saveService();
}

// ========== РЕДАКТИРОВАТЬ УСЛУГУ ==========
function editService(id) {
    console.log('🔄 Редактируем услугу ID:', id);
    
    try {
        // Получаем услугу из localStorage
        const services = getServicesFromStorage();
        const service = services.find(s => s.id === id);
        
        if (!service) {
            throw new Error(`Услуга с ID ${id} не найдена`);
        }
        
        console.log('📋 Загружена услуга:', service.title);
        
        // Заполняем форму
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceTitle').value = service.title || '';
        document.getElementById('servicePrice').value = service.price || '';
        document.getElementById('serviceDescription').value = service.description || '';
        document.getElementById('serviceImage').value = service.image || '';
        
        // Создаем или находим поле для items
        let itemsField = document.getElementById('serviceItems');
        if (!itemsField) {
            createItemsField();
            itemsField = document.getElementById('serviceItems');
        }
        
        // Заполняем пункты
        if (service.items && Array.isArray(service.items)) {
            itemsField.value = service.items.join('\n');
        } else {
            itemsField.value = '';
        }
        
        // Переключаем кнопки
        toggleFormButtons(true);
        
        // Прокручиваем к форме
        document.getElementById('serviceForm').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        showMessage(`Загружена услуга: "${service.title}"`, 'success');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        showMessage(`Ошибка загрузки услуги: ${error.message}`, 'error');
    }
}

// ========== СОЗДАНИЕ ПОЛЯ ДЛЯ ITEMS ==========
function createItemsField() {
    const form = document.getElementById('serviceForm');
    const imageField = document.getElementById('serviceImage');
    
    if (!form || !imageField) return;
    
    // Создаем контейнер для поля items
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'input-box';
    itemsContainer.innerHTML = `
        <label for="serviceItems">Что входит (каждый пункт с новой строки)</label>
        <textarea id="serviceItems" 
                  placeholder="Пункт 1&#10;Пункт 2&#10;Пункт 3" 
                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; min-height: 100px;"></textarea>
    `;
    
    // Вставляем после поля изображения
    const imageContainer = imageField.closest('.input-box');
    if (imageContainer && imageContainer.parentNode) {
        imageContainer.parentNode.insertBefore(itemsContainer, imageContainer.nextSibling);
    }
}

// ========== СОХРАНИТЬ/ОБНОВИТЬ УСЛУГУ ==========
function saveService() {
    const id = document.getElementById('serviceId').value;
    const title = document.getElementById('serviceTitle').value.trim();
    const price = document.getElementById('servicePrice').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const image = document.getElementById('serviceImage').value.trim();
    
    // Получаем пункты
    const itemsField = document.getElementById('serviceItems');
    const itemsText = itemsField ? itemsField.value.trim() : '';
    const items = itemsText ? itemsText.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0) : [];
    
    // Валидация
    if (!title) {
        showMessage('Введите название услуги', 'error');
        document.getElementById('serviceTitle').focus();
        return;
    }
    if (!price) {
        showMessage('Введите цену услуги', 'error');
        document.getElementById('servicePrice').focus();
        return;
    }
    if (!description) {
        showMessage('Введите описание услуги', 'error');
        document.getElementById('serviceDescription').focus();
        return;
    }
    
    const serviceData = {
        title,
        price,
        description,
        image: image || `../img/card${Math.floor(Math.random() * 6) + 1}-img.png`,
        items
    };
    
    console.log('💾 Сохранение данных. Режим:', id ? 'UPDATE' : 'CREATE', 'ID:', id || 'new');
    
    try {
        // Получаем все услуги
        const services = getServicesFromStorage();
        
        if (id) {
            // Обновляем существующую услугу
            const index = services.findIndex(s => s.id === id);
            if (index !== -1) {
                // Сохраняем ID
                serviceData.id = id;
                services[index] = serviceData;
            } else {
                throw new Error(`Услуга с ID ${id} не найдена`);
            }
        } else {
            // Добавляем новую услугу
            serviceData.id = getNextServiceId();
            services.push(serviceData);
        }
        
        // Сохраняем обратно в localStorage
        if (saveServicesToStorage(services)) {
            showMessage(id ? '✅ Услуга обновлена!' : '✅ Услуга добавлена!', 'success');
            
            resetForm();
            loadServices();
        } else {
            throw new Error('Не удалось сохранить услугу в localStorage');
        }
        
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        showMessage(`Ошибка при сохранении: ${error.message}`, 'error');
    }
}

// ========== УДАЛИТЬ УСЛУГУ ==========
function deleteService(id) {
    if (!id) {
        showMessage('ID услуги не указан', 'error');
        return;
    }
    
    if (!confirm(`Вы уверены, что хотите удалить услугу с ID: ${id}?`)) {
        return;
    }
    
    try {
        // Получаем все услуги
        const services = getServicesFromStorage();
        
        // Фильтруем удаляемую услугу
        const filteredServices = services.filter(s => s.id !== id);
        
        if (services.length === filteredServices.length) {
            throw new Error(`Услуга с ID ${id} не найдена`);
        }
        
        // Сохраняем обратно в localStorage
        if (saveServicesToStorage(filteredServices)) {
            showMessage('✅ Услуга удалена', 'success');
            
            // Если удаляем текущую редактируемую услугу
            const currentId = document.getElementById('serviceId').value;
            if (currentId == id) {
                resetForm();
            }
            
            loadServices();
        } else {
            throw new Error('Не удалось сохранить изменения в localStorage');
        }
        
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showMessage(`Ошибка при удалении: ${error.message}`, 'error');
    }
}

// ========== ПЕРЕКЛЮЧЕНИЕ КНОПОК ФОРМЫ ==========
function toggleFormButtons(isEditMode) {
    const addBtn = document.getElementById('addService');
    const updateBtn = document.getElementById('updateService');
    const cancelBtn = document.getElementById('cancelEdit');
    
    if (addBtn) addBtn.style.display = isEditMode ? 'none' : 'inline-block';
    if (updateBtn) updateBtn.style.display = isEditMode ? 'inline-block' : 'none';
    if (cancelBtn) cancelBtn.style.display = isEditMode ? 'inline-block' : 'none';
}

// ========== СБРОС ФОРМЫ ==========
function resetForm() {
    const form = document.getElementById('serviceForm');
    if (form) {
        form.reset();
        document.getElementById('serviceId').value = '';
        
        // Удаляем поле items если оно было создано динамически
        const itemsField = document.getElementById('serviceItems');
        if (itemsField && itemsField.parentNode) {
            itemsField.parentNode.removeChild(itemsField);
        }
        
        // Возвращаем кнопки в исходное состояние
        toggleFormButtons(false);
    }
}

// ========== ПОКАЗАТЬ СООБЩЕНИЕ ==========
function showMessage(text, type = 'info') {
    // Удаляем старое сообщение
    const oldMsg = document.getElementById('statusMessage');
    if (oldMsg) oldMsg.remove();
    
    // Создаем новое
    const message = document.createElement('div');
    message.id = 'statusMessage';
    message.textContent = text;
    
    // Стили
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '5px',
        zIndex: '10000',
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'fadeIn 0.3s',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };
    
    if (type === 'success') {
        Object.assign(styles, {
            background: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb'
        });
        message.innerHTML = '✅ ' + text;
    } else if (type === 'error') {
        Object.assign(styles, {
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb'
        });
        message.innerHTML = '❌ ' + text;
    } else {
        Object.assign(styles, {
            background: '#d1ecf1',
            color: '#0c5460',
            border: '1px solid #bee5eb'
        });
        message.innerHTML = 'ℹ️ ' + text;
    }
    
    Object.assign(message.style, styles);
    document.body.appendChild(message);
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        if (message.parentNode) {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.5s';
            setTimeout(() => message.remove(), 500);
        }
    }, 5000);
}

// ========== ПОКАЗАТЬ ОШИБКУ ==========
function showError(text) {
    const container = document.getElementById('servicesList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-container">
            <h3>⚠️ Ошибка загрузки</h3>
            <p>${text}</p>
            
            <div class="error-help">
                <strong>Проверьте:</strong>
                <ol>
                    <li>Проверьте консоль браузера для подробностей</li>
                    <li>Попробуйте очистить кеш браузера</li>
                    <li>Если проблема persists, обновите страницу</li>
                </ol>
            </div>
            
            <div class="error-buttons">
                <button onclick="loadServices()" class="btn-retry">🔄 Попробовать снова</button>
                <button onclick="window.location.reload()" class="btn-reload">🔃 Обновить страницу</button>
            </div>
        </div>
    `;
    
    // Добавляем стили для ошибки
    if (!document.querySelector('#error-styles')) {
        const errorStyle = document.createElement('style');
        errorStyle.id = 'error-styles';
        errorStyle.textContent = `
            .error-container {
                background: #fff;
                border: 2px solid #dc3545;
                border-radius: 8px;
                padding: 30px;
                margin: 20px 0;
                text-align: center;
            }
            .error-container h3 {
                color: #dc3545;
                margin-bottom: 15px;
            }
            .error-help {
                margin: 20px 0;
                text-align: left;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
            }
            .error-buttons {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-top: 20px;
            }
            .btn-retry {
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .btn-reload {
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(errorStyle);
    }
}

// ========== ВЫХОД ==========
function logout() {
    if (confirm('Выйти из админ панели?')) {
        localStorage.removeItem('autoservice_currentUser');
        window.location.href = '../index.html';
    }
}

// ========== ЭКСПОРТ ФУНКЦИЙ ДЛЯ ДРУГИХ СТРАНИЦ ==========
// Функция для получения услуг (для services.js)
window.getServicesFromStorage = function() {
    return getServicesFromStorage();
};

// Функция для получения текущего пользователя (совместимость)
window.getCurrentUser = function() {
    try {
        const userData = localStorage.getItem('autoservice_currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        return null;
    }
};

// Функция для открытия бронирования (совместимость)
window.openBookingForService = function(serviceId, serviceTitle, servicePrice) {
    const user = window.getCurrentUser();
    if (user) {
        // Здесь можно вызвать модальное окно бронирования
        alert(`Запись на услугу: ${serviceTitle}\nЦена: ${servicePrice}\nКлиент: ${user.firstName} ${user.lastName}`);
    }
};

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========
window.loadServices = loadServices;
window.editService = editService;
window.deleteService = deleteService;
window.updateService = handleUpdate;
window.logout = logout;

// Добавляем анимацию для сообщений
if (!document.querySelector('#animation-styles')) {
    const animationStyle = document.createElement('style');
    animationStyle.id = 'animation-styles';
    animationStyle.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
        #statusMessage {
            animation: fadeIn 0.3s ease-out;
        }
    `;
    document.head.appendChild(animationStyle);
}

console.log('✅ admin.js с localStorage загружен и готов к работе');
