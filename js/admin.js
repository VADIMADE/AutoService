// js/admin.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Админ панель загружена');

    // Проверяем админа
    if (!checkIfAdmin()) {
        alert('❌ Только для администраторов');
        window.location.href = 'profile.html';
        return;
    }

    // Загружаем услуги
    loadServices();

    // Настраиваем обработчики
    setupForm();

    // Обновляем кнопки в хедере
    updateHeaderButtons();
});

// Проверка админа
function checkIfAdmin() {
    try {
        const userData = localStorage.getItem('autoservice_currentUser');
        if (!userData) return false;
        
        const user = JSON.parse(userData);
        console.log('Текущий пользователь:', user);
        return user && user.role === 'admin';
    } catch (error) {
        console.error('Ошибка проверки админа:', error);
        return false;
    }
}

// Обновление кнопок в хедере
function updateHeaderButtons() {
    const userData = localStorage.getItem('autoservice_currentUser');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const loginBtn = document.querySelector('.header-btn2');
    const registerBtn = document.querySelector('.header-btn1');
    
    if (loginBtn) {
        loginBtn.textContent = 'Выйти';
        loginBtn.onclick = function(e) {
            e.preventDefault();
            if (confirm('Выйти из аккаунта?')) {
                localStorage.removeItem('autoservice_currentUser');
                window.location.href = 'profile.html';
            }
        };
    }
    
    if (registerBtn) {
        registerBtn.textContent = user.firstName;
        registerBtn.href = 'profile.html';
    }
}

// Загрузка услуг
function loadServices() {
    console.log('Загружаю услуги...');

    const container = document.getElementById('servicesList');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">⏳ Загрузка...</div>';

    try {
        const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
        console.log(`Загружено услуг: ${services.length}`);
        displayServices(services);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showError('Не удалось загрузить услуги');
    }
}

// Показать услуги
function displayServices(services) {
    const container = document.getElementById('servicesList');
    if (!container) return;

    if (!services || services.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; background: #f8f8f8; border-radius: 8px;">
                <p>📭 Нет услуг</p>
                <p>Добавьте первую услугу через форму выше</p>
            </div>
        `;
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="service-card-admin" style="
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: all 0.3s;
        " data-id="${service.id}">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #333;">${service.title || 'Без названия'}</h3>
                    <div style="color: #CC7000; font-weight: bold; font-size: 18px;">${service.price || 'Цена не указана'}</div>
                </div>
                <div style="background: #f0f0f0; padding: 2px 8px; border-radius: 10px; font-size: 12px; color: #666;">
                    ID: ${service.id}
                </div>
            </div>
            
            <p style="color: #666; margin-bottom: 15px; line-height: 1.5;">${service.description || 'Нет описания'}</p>
            
            ${service.image ? `
                <div style="margin-bottom: 10px; font-size: 12px; color: #888; background: #f9f9f9; padding: 5px; border-radius: 4px;">
                    🖼️ Изображение: ${service.image}
                </div>
            ` : ''}
            
            ${service.items && service.items.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <strong style="font-size: 14px; color: #333;">Что входит:</strong>
                    <ul style="margin: 5px 0 0 20px; padding: 0;">
                        ${service.items.map(item => `<li style="font-size: 14px; color: #555; margin-bottom: 3px;">${item}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <button onclick="editService('${service.id}')" style="
                    padding: 8px 16px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#45a049'" 
                onmouseout="this.style.background='#4CAF50'">
                    ✏️ Изменить
                </button>
                <button onclick="deleteService('${service.id}')" style="
                    padding: 8px 16px;
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#da190b'" 
                onmouseout="this.style.background='#f44336'">
                    🗑️ Удалить
                </button>
            </div>
        </div>
    `).join('');
}

// Настройка формы
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

    // Кнопка отмены редактирования
    const cancelBtn = document.getElementById('cancelEdit');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            resetForm();
        });
    }
}

// Редактировать услугу
function editService(id) {
    console.log('Редактируем услугу ID:', id);

    try {
        const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
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

        // Показываем кнопки редактирования
        document.getElementById('addService').style.display = 'none';
        document.getElementById('updateService').style.display = 'inline-block';
        document.getElementById('cancelEdit').style.display = 'inline-block';

        // Прокручиваем к форме
        document.getElementById('serviceForm').scrollIntoView({ behavior: 'smooth' });

        showMessage(`Загружена услуга: "${service.title}"`, 'info');

    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showMessage('Ошибка загрузки услуги', 'error');
    }
}

// Обновить услугу (кнопка в форме)
function updateService() {
    document.getElementById('serviceForm').requestSubmit();
}

// Сохранить/обновить услугу
function saveService() {
    const id = document.getElementById('serviceId').value;
    const title = document.getElementById('serviceTitle').value.trim();
    const price = document.getElementById('servicePrice').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const image = document.getElementById('serviceImage').value.trim();

    // Проверка
    if (!title || !price || !description) {
        showMessage('Заполните обязательные поля: название, цена, описание', 'error');
        return;
    }

    const serviceData = {
        title,
        price,
        description,
        image: image || `../img/card${Math.floor(Math.random() * 6) + 1}-img.png`,
        items: [] // Можно добавить поле для пунктов если нужно
    };

    console.log('Сохранение данных:', serviceData);

    try {
        const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
        let updatedServices;

        if (id) {
            // Обновляем существующую услугу
            const index = services.findIndex(s => s.id === id);
            
            if (index === -1) {
                showMessage('Услуга не найдена', 'error');
                return;
            }
            
            // Сохраняем существующие пункты если есть
            if (services[index].items) {
                serviceData.items = services[index].items;
            }
            
            services[index] = { id, ...serviceData };
            updatedServices = services;
            
            showMessage('✅ Услуга обновлена!', 'success');
        } else {
            // Добавляем новую услугу
            const newService = {
                id: Date.now().toString(),
                ...serviceData
            };
            
            services.push(newService);
            updatedServices = services;
            
            showMessage('✅ Услуга добавлена!', 'success');
        }

        // Сохраняем в localStorage
        localStorage.setItem('autoservice_services', JSON.stringify(updatedServices));
        
        resetForm();
        loadServices();

    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        showMessage('Ошибка при сохранении', 'error');
    }
}

// Удалить услугу
function deleteService(id) {
    if (!confirm('Удалить эту услугу?')) {
        return;
    }

    try {
        const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
        const filteredServices = services.filter(s => s.id !== id);
        
        localStorage.setItem('autoservice_services', JSON.stringify(filteredServices));
        
        showMessage('✅ Услуга удалена', 'success');

        // Если удаляем текущую редактируемую услугу
        const currentId = document.getElementById('serviceId').value;
        if (currentId == id) {
            resetForm();
        }

        loadServices();
        
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showMessage('Ошибка при удалении', 'error');
    }
}

// Сброс формы
function resetForm() {
    const form = document.getElementById('serviceForm');
    if (form) {
        form.reset();
        document.getElementById('serviceId').value = '';
        
        // Показываем кнопку добавления
        document.getElementById('addService').style.display = 'inline-block';
        document.getElementById('updateService').style.display = 'none';
        document.getElementById('cancelEdit').style.display = 'none';
    }
}

// Показать сообщение
function showMessage(text, type = 'info') {
    // Удаляем старое сообщение
    const oldMsg = document.querySelector('.admin-message');
    if (oldMsg) oldMsg.remove();

    // Создаем новое
    const message = document.createElement('div');
    message.className = 'admin-message';
    message.textContent = text;
    
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '5px',
        zIndex: '1000',
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'fadeIn 0.3s',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        color: 'white'
    };

    if (type === 'success') {
        Object.assign(styles, {
            background: '#4CAF50',
            border: '1px solid #45a049'
        });
    } else if (type === 'error') {
        Object.assign(styles, {
            background: '#f44336',
            border: '1px solid #da190b'
        });
    } else {
        Object.assign(styles, {
            background: '#3498db',
            border: '1px solid #2980b9'
        });
    }

    Object.assign(message.style, styles);

    document.body.appendChild(message);

    // Удаляем через 3 секунды
    setTimeout(() => {
        if (message.parentNode) {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.5s';
            setTimeout(() => message.remove(), 500);
        }
    }, 3000);
}

// Показать ошибку
function showError(text) {
    const container = document.getElementById('servicesList');
    if (!container) return;
    
    container.innerHTML = `
        <div style="
            background: #fff;
            border: 2px solid #dc3545;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
            text-align: center;
        ">
            <h3 style="color: #dc3545; margin-bottom: 15px;">⚠️ Ошибка загрузки</h3>
            <p style="margin-bottom: 10px;">${text}</p>
            
            <div style="margin: 20px 0;">
                <button onclick="loadServices()" style="
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 10px;
                ">
                    🔄 Попробовать снова
                </button>
            </div>
        </div>
    `;
}

// Глобальные функции
window.editService = editService;
window.deleteService = deleteService;
window.updateService = updateService;

// Добавляем анимацию
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { 
            opacity: 0; 
            transform: translateX(100px); 
        }
        to { 
            opacity: 1; 
            transform: translateX(0); 
        }
    }
    
    .service-card-admin:hover {
        border-color: #CC7000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);
