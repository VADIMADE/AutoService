// js/admin.js
console.log('=== АДМИН ПАНЕЛЬ ЗАГРУЖАЕТСЯ ===');

// Константы
const STORAGE_KEY = 'autoservice_services';

// Проверяем, загрузилась ли страница
if (document.readyState === 'loading') {
    console.log('📄 Страница еще загружается...');
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    console.log('📄 Страница уже загружена');
    initAdmin();
}

// Основная функция инициализации
function initAdmin() {
    console.log('🚀 Инициализация админ панели');
    
    // Шаг 1: Проверяем элементы на странице
    console.log('🔍 Проверяю элементы страницы:');
    console.log('- Форма:', document.getElementById('serviceForm') ? '✅ Найдена' : '❌ Нет');
    console.log('- Контейнер услуг:', document.getElementById('servicesList') ? '✅ Найден' : '❌ Нет');
    console.log('- Кнопка Добавить:', document.getElementById('addService') ? '✅ Найдена' : '❌ Нет');
    console.log('- Кнопка Обновить:', document.getElementById('updateService') ? '✅ Найдена' : '❌ Нет');
    
    // Шаг 2: Проверяем авторизацию (временно отключим)
    // if (!checkAdmin()) {
    //     alert('Только для администраторов!');
    //     window.location.href = 'profile.html';
    //     return;
    // }
    
    // Шаг 3: Создаем начальные данные если их нет
    createInitialData();
    
    // Шаг 4: Загружаем услуги
    loadServices();
    
    // Шаг 5: Настраиваем обработчики
    setupEventListeners();
    
    console.log('✅ Админ панель инициализирована');
}

// Создаем начальные данные
function createInitialData() {
    console.log('📝 Проверяю наличие данных...');
    
    if (!localStorage.getItem(STORAGE_KEY)) {
        console.log('📦 Создаю начальные услуги');
        
        const defaultServices = [
            {
                id: '1',
                title: 'ПЛАНОВОЕ ТО',
                price: 'от 250 бел. руб.',
                description: 'Комплексная диагностика и замена расходников по регламенту',
                image: '../img/card1-img.png'
            },
            {
                id: '2', 
                title: 'СРОЧНЫЙ РЕМОНТ',
                price: 'от 200 бел. руб.',
                description: 'Устраним любую неисправность двигателя, ходовой, электроники',
                image: '../img/card2-img.png'
            },
            {
                id: '3',
                title: 'ШИНОМОНТАЖ', 
                price: 'от 150 бел. руб.',
                description: 'Быстрая замена и балансировка колес',
                image: '../img/card3-img.png'
            }
        ];
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultServices));
        console.log('✅ Создано', defaultServices.length, 'начальных услуг');
    } else {
        console.log('📦 Данные уже существуют');
    }
}

// Проверка админа (упрощенная)
function checkAdmin() {
    try {
        // Проверяем localStorage
        console.log('🔐 Проверяю localStorage...');
        console.log('localStorage доступен?', typeof localStorage !== 'undefined');
        
        // Создаем тестового админа если его нет
        if (!localStorage.getItem('currentUser')) {
            console.log('👤 Создаю тестового администратора');
            const testAdmin = {
                id: '1',
                firstName: 'Админ',
                lastName: 'Тестовый',
                email: 'admin@test.com',
                role: 'admin'
            };
            localStorage.setItem('currentUser', JSON.stringify(testAdmin));
        }
        
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('👤 Текущий пользователь:', user);
        
        return user.role === 'admin';
    } catch (error) {
        console.error('❌ Ошибка проверки админа:', error);
        return false;
    }
}

// Загрузка услуг
function loadServices() {
    console.log('📥 Загружаю услуги...');
    
    const container = document.getElementById('servicesList');
    if (!container) {
        console.error('❌ Контейнер servicesList не найден!');
        alert('Ошибка: контейнер услуг не найден');
        return;
    }
    
    container.innerHTML = '<div style="padding: 20px; text-align: center;">⏳ Загрузка...</div>';
    
    try {
        const servicesJson = localStorage.getItem(STORAGE_KEY);
        console.log('📊 Данные из localStorage:', servicesJson ? 'Есть' : 'Нет');
        
        const services = servicesJson ? JSON.parse(servicesJson) : [];
        console.log('✅ Загружено услуг:', services.length);
        
        displayServices(services);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: red;">
                <h3>❌ Ошибка загрузки</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px;">
                    Обновить страницу
                </button>
            </div>
        `;
    }
}

// Отображение услуг
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
    
    // Создаем HTML для каждой услуги
    let html = '';
    services.forEach(service => {
        html += `
            <div style="
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
            ">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <h3 style="margin: 0 0 5px 0;">${service.title || 'Без названия'}</h3>
                        <div style="color: #CC7000; font-weight: bold; font-size: 18px;">
                            ${service.price || 'Цена не указана'}
                        </div>
                    </div>
                    <div style="background: #f0f0f0; padding: 2px 8px; border-radius: 10px; font-size: 12px;">
                        ID: ${service.id}
                    </div>
                </div>
                
                <p style="color: #666; margin: 10px 0;">${service.description || 'Нет описания'}</p>
                
                ${service.image ? `
                    <div style="font-size: 12px; color: #888; margin-bottom: 10px;">
                        🖼️ ${service.image}
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="editService('${service.id}')" 
                            style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ✏️ Изменить
                    </button>
                    <button onclick="deleteService('${service.id}')" 
                            style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('✅ Услуги отображены');
}

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('🎯 Настраиваю обработчики событий...');
    
    // Форма
    const form = document.getElementById('serviceForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Форма отправлена');
            saveService();
        });
        console.log('✅ Обработчик формы добавлен');
    } else {
        console.error('❌ Форма не найдена!');
    }
    
    // Кнопки
    const clearBtn = document.getElementById('clearForm');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            console.log('🗑️ Очистка формы');
            resetForm();
            showMessage('Форма очищена', 'info');
        });
    }
    
    const cancelBtn = document.getElementById('cancelEdit');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log('❌ Отмена редактирования');
            resetForm();
            showMessage('Редактирование отменено', 'info');
        });
    }
    
    const updateBtn = document.getElementById('updateService');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            console.log('🔄 Нажата кнопка Обновить');
            saveService();
        });
    }
    
    console.log('✅ Все обработчики настроены');
}

// Редактирование услуги
function editService(id) {
    console.log('✏️ Редактирование услуги ID:', id);
    
    try {
        const services = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const service = services.find(s => s.id === id);
        
        if (!service) {
            alert('Услуга не найдена!');
            return;
        }
        
        console.log('📋 Найдена услуга:', service.title);
        
        // Заполняем форму
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceTitle').value = service.title || '';
        document.getElementById('servicePrice').value = service.price || '';
        document.getElementById('serviceDescription').value = service.description || '';
        document.getElementById('serviceImage').value = service.image || '';
        
        // Показываем/скрываем кнопки
        document.getElementById('addService').style.display = 'none';
        document.getElementById('updateService').style.display = 'inline-block';
        document.getElementById('cancelEdit').style.display = 'inline-block';
        
        // Прокрутка к форме
        document.getElementById('serviceForm').scrollIntoView({ behavior: 'smooth' });
        
        showMessage(`Загружена: "${service.title}"`, 'success');
        
    } catch (error) {
        console.error('❌ Ошибка редактирования:', error);
        showMessage('Ошибка загрузки услуги', 'error');
    }
}

// Сохранение услуги
function saveService() {
    console.log('💾 Сохранение услуги...');
    
    // Получаем данные из формы
    const id = document.getElementById('serviceId').value;
    const title = document.getElementById('serviceTitle').value.trim();
    const price = document.getElementById('servicePrice').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const image = document.getElementById('serviceImage').value.trim();
    
    console.log('📝 Данные формы:', { id, title, price, description, image });
    
    // Проверяем обязательные поля
    if (!title || !price || !description) {
        alert('❌ Заполните все обязательные поля!');
        return;
    }
    
    try {
        // Получаем текущие услуги
        const services = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        if (id) {
            // Обновляем существующую услугу
            console.log('🔄 Обновление существующей услуги ID:', id);
            const index = services.findIndex(s => s.id === id);
            if (index !== -1) {
                services[index] = { 
                    id, 
                    title, 
                    price, 
                    description, 
                    image: image || `../img/card${Math.floor(Math.random() * 6) + 1}-img.png`
                };
            } else {
                throw new Error('Услуга для обновления не найдена');
            }
        } else {
            // Добавляем новую услугу
            console.log('➕ Добавление новой услуги');
            const newId = (services.length > 0) 
                ? (Math.max(...services.map(s => parseInt(s.id) || 0)) + 1).toString()
                : '1';
            
            services.push({
                id: newId,
                title,
                price,
                description,
                image: image || `../img/card${Math.floor(Math.random() * 6) + 1}-img.png`
            });
        }
        
        // Сохраняем обратно
        localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
        console.log('✅ Услуга сохранена');
        
        // Показываем сообщение
        showMessage(id ? '✅ Услуга обновлена!' : '✅ Услуга добавлена!', 'success');
        
        // Сбрасываем форму и перезагружаем список
        resetForm();
        loadServices();
        
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        showMessage('Ошибка при сохранении: ' + error.message, 'error');
    }
}

// Удаление услуги
function deleteService(id) {
    console.log('🗑️ Удаление услуги ID:', id);
    
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) {
        return;
    }
    
    try {
        const services = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const filtered = services.filter(s => s.id !== id);
        
        if (services.length === filtered.length) {
            alert('Услуга не найдена!');
            return;
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        console.log('✅ Услуга удалена');
        
        // Если удаляем редактируемую услугу - сбрасываем форму
        const currentId = document.getElementById('serviceId').value;
        if (currentId === id) {
            resetForm();
        }
        
        showMessage('✅ Услуга удалена', 'success');
        loadServices();
        
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showMessage('Ошибка при удалении', 'error');
    }
}

// Сброс формы
function resetForm() {
    console.log('🔄 Сброс формы');
    
    const form = document.getElementById('serviceForm');
    if (form) {
        form.reset();
        document.getElementById('serviceId').value = '';
        
        // Возвращаем кнопки в исходное состояние
        document.getElementById('addService').style.display = 'inline-block';
        document.getElementById('updateService').style.display = 'none';
        document.getElementById('cancelEdit').style.display = 'none';
    }
}

// Показ сообщений
function showMessage(text, type = 'info') {
    console.log('💬 Сообщение:', text, 'Тип:', type);
    
    // Удаляем старое сообщение
    const oldMsg = document.getElementById('statusMessage');
    if (oldMsg) oldMsg.remove();
    
    // Создаем новое
    const message = document.createElement('div');
    message.id = 'statusMessage';
    message.innerHTML = text;
    
    // Стили
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: fadeIn 0.3s;
    `;
    
    if (type === 'success') {
        message.style.background = '#d4edda';
        message.style.color = '#155724';
        message.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
        message.style.background = '#f8d7da';
        message.style.color = '#721c24';
        message.style.border = '1px solid #f5c6cb';
    } else {
        message.style.background = '#d1ecf1';
        message.style.color = '#0c5460';
        message.style.border = '1px solid #bee5eb';
    }
    
    document.body.appendChild(message);
    
    // Автоудаление через 4 секунды
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 4000);
}

// Добавляем анимацию
if (!document.querySelector('#admin-animation')) {
    const style = document.createElement('style');
    style.id = 'admin-animation';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
}

// Экспортируем функции для глобального использования
window.editService = editService;
window.deleteService = deleteService;
window.loadServices = loadServices;
window.resetForm = resetForm;

// Функция для выхода
function logout() {
    if (confirm('Выйти из админ панели?')) {
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }
}
window.logout = logout;

console.log('✅ admin.js загружен и готов к работе');
