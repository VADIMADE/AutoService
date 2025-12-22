// js/admin.js
const STORAGE_KEY = 'autoservice_services';

// Основная загрузка
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Админ панель загружена');
    
    // Проверяем админа
    if (!checkIfAdmin()) {
        alert('❌ Только для администраторов');
        window.location.href = 'profile.html';
        return;
    }
    
    // Инициализируем хранилище
    initStorage();
    
    // Загружаем услуги
    loadServices();
    
    // Настраиваем обработчики формы
    setupForm();
});

// ========== ИНИЦИАЛИЗАЦИЯ ХРАНИЛИЩА ==========
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        console.log('📝 Создаю начальные услуги');
        
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

// ========== ПОЛУЧИТЬ УСЛУГИ ==========
function getServices() {
    try {
        const servicesJson = localStorage.getItem(STORAGE_KEY);
        return servicesJson ? JSON.parse(servicesJson) : [];
    } catch (error) {
        console.error('❌ Ошибка чтения услуг:', error);
        return [];
    }
}

// ========== СОХРАНИТЬ УСЛУГИ ==========
function saveServices(services) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
        console.log('💾 Услуги сохранены:', services.length);
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        return false;
    }
}

// ========== ГЕНЕРАЦИЯ ID ==========
function generateId() {
    const services = getServices();
    if (services.length === 0) return '1';
    
    const numericIds = services.map(s => {
        const idNum = parseInt(s.id);
        return isNaN(idNum) ? 0 : idNum;
    }).filter(id => id > 0);
    
    if (numericIds.length > 0) {
        return (Math.max(...numericIds) + 1).toString();
    }
    
    return Date.now().toString();
}

// ========== ПРОВЕРКА АДМИНА ==========
function checkIfAdmin() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('👤 Пользователь:', user);
        return user && user.role === 'admin';
    } catch (error) {
        console.error('❌ Ошибка проверки:', error);
        return false;
    }
}

// ========== ЗАГРУЗКА УСЛУГ ==========
function loadServices() {
    console.log('📥 Загружаю услуги...');
    
    const container = document.getElementById('servicesList');
    if (!container) {
        console.error('❌ Контейнер не найден');
        return;
    }
    
    container.innerHTML = '<div class="loading">⏳ Загрузка услуг...</div>';
    
    try {
        const services = getServices();
        console.log(`✅ Загружено: ${services.length} услуг`);
        displayServices(services);
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        showMessage('Ошибка загрузки услуг', 'error');
    }
}

// ========== ОТОБРАЖЕНИЕ УСЛУГ ==========
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
                <button onclick="editService('${service.id}')" class="btn-edit">✏️ Изменить</button>
                <button onclick="deleteService('${service.id}')" class="btn-delete">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
    
    // Добавляем стили
    addStyles();
}

// ========== СТИЛИ ==========
function addStyles() {
    if (document.querySelector('#admin-styles')) return;
    
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
        }
        .btn-delete:hover {
            background: #d32f2f;
        }
    `;
    document.head.appendChild(style);
}

// ========== НАСТРОЙКА ФОРМЫ ==========
function setupForm() {
    const form = document.getElementById('serviceForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
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

// ========== ОБНОВИТЬ УСЛУГУ ==========
function handleUpdate() {
    console.log('🔄 Обновление услуги');
    saveService();
}

// ========== РЕДАКТИРОВАТЬ УСЛУГУ ==========
function editService(id) {
    console.log('✏️ Редактируем услугу:', id);
    
    try {
        const services = getServices();
        const service = services.find(s => s.id === id);
        
        if (!service) {
            showMessage('Услуга не найдена', 'error');
            return;
        }
        
        // Заполняем форму
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceTitle').value = service.title || '';
        document.getElementById('servicePrice').value = service.price || '';
        document.getElementById('serviceDescription').value = service.description || '';
        document.getElementById('serviceImage').value = service.image || '';
        
        // Показываем/скрываем кнопки
        toggleButtons(true);
        
        // Прокрутка к форме
        document.getElementById('serviceForm').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
        
        showMessage(`Загружена услуга: "${service.title}"`, 'success');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        showMessage('Ошибка загрузки услуги', 'error');
    }
}

// ========== СОХРАНИТЬ УСЛУГУ ==========
function saveService() {
    const id = document.getElementById('serviceId').value;
    const title = document.getElementById('serviceTitle').value.trim();
    const price = document.getElementById('servicePrice').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const image = document.getElementById('serviceImage').value.trim();
    
    // Валидация
    if (!title) {
        showMessage('Введите название услуги', 'error');
        return;
    }
    if (!price) {
        showMessage('Введите цену услуги', 'error');
        return;
    }
    if (!description) {
        showMessage('Введите описание услуги', 'error');
        return;
    }
    
    const serviceData = {
        title,
        price,
        description,
        image: image || `../img/card${Math.floor(Math.random() * 6) + 1}-img.png`,
        items: []
    };
    
    console.log('💾 Сохранение:', id ? 'Обновление' : 'Добавление');
    
    try {
        const services = getServices();
        
        if (id) {
            // Обновляем существующую
            const index = services.findIndex(s => s.id === id);
            if (index !== -1) {
                serviceData.id = id;
                serviceData.items = services[index].items || []; // Сохраняем старые items
                services[index] = serviceData;
            } else {
                throw new Error('Услуга не найдена');
            }
        } else {
            // Добавляем новую
            serviceData.id = generateId();
            services.push(serviceData);
        }
        
        // Сохраняем
        if (saveServices(services)) {
            showMessage(id ? '✅ Услуга обновлена!' : '✅ Услуга добавлена!', 'success');
            resetForm();
            loadServices();
        }
        
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        showMessage('Ошибка при сохранении', 'error');
    }
}

// ========== УДАЛИТЬ УСЛУГУ ==========
function deleteService(id) {
    if (!confirm('Удалить эту услугу?')) return;
    
    try {
        const services = getServices();
        const filtered = services.filter(s => s.id !== id);
        
        if (services.length === filtered.length) {
            showMessage('Услуга не найдена', 'error');
            return;
        }
        
        if (saveServices(filtered)) {
            showMessage('✅ Услуга удалена', 'success');
            
            // Если удаляем редактируемую услугу
            const currentId = document.getElementById('serviceId').value;
            if (currentId === id) {
                resetForm();
            }
            
            loadServices();
        }
        
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showMessage('Ошибка при удалении', 'error');
    }
}

// ========== ПЕРЕКЛЮЧЕНИЕ КНОПОК ==========
function toggleButtons(isEditMode) {
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
        toggleButtons(false);
    }
}

// ========== СООБЩЕНИЯ ==========
function showMessage(text, type = 'info') {
    // Удаляем старое сообщение
    const oldMsg = document.getElementById('statusMessage');
    if (oldMsg) oldMsg.remove();
    
    // Создаем новое
    const message = document.createElement('div');
    message.id = 'statusMessage';
    
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
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
    
    // Автоудаление
    setTimeout(() => {
        if (message.parentNode) {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.5s';
            setTimeout(() => message.remove(), 500);
        }
    }, 4000);
}

// ========== ВЫХОД ==========
function logout() {
    if (confirm('Выйти из админ панели?')) {
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========
window.loadServices = loadServices;
window.editService = editService;
window.deleteService = deleteService;
window.updateService = handleUpdate;
window.logout = logout;

// Экспортируем функцию для services.js
window.getServicesFromStorage = function() {
    return getServices();
};

// Экспортируем функцию для получения пользователя
window.getCurrentUser = function() {
    try {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (error) {
        return null;
    }
};

// Анимация для сообщений
if (!document.querySelector('#animation-styles')) {
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
        #statusMessage {
            animation: fadeIn 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ admin.js загружен');

