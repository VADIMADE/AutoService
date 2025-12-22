// pages/admin.js - УПРОЩЕННЫЙ ВАРИАНТ

document.addEventListener('DOMContentLoaded', function () {
    console.log('Админ панель загружена');

    // Проверяем админа
    if (!checkIfAdmin()) {
        alert('Только для администраторов');
        window.location.href = 'profile.html';
        return;
    }

    // Загружаем услуги
    loadServices();

    // Настраиваем обработчики
    setupForm();
});

// Проверка админа
function checkIfAdmin() {
    const user = JSON.parse(localStorage.getItem('autoservice_currentUser') || '{}');
    return user && user.role === 'admin';
}

// Загрузка услуг
function loadServices() {
    const container = document.getElementById('servicesList');
    container.innerHTML = '<div class="loading">Загрузка услуг...</div>';

    try {
        const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
        displayServices(services);
    } catch (error) {
        showError('Ошибка загрузки услуг');
    }
}

// Показать услуги
function displayServices(services) {
    const container = document.getElementById('servicesList');

    if (!services || services.length === 0) {
        container.innerHTML = '<div class="no-services">Нет услуг</div>';
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="service-card">
            <h3>${service.title}</h3>
            <p><strong>Цена:</strong> ${service.price}</p>
            <p>${service.description}</p>
            <div class="service-actions">
                <button onclick="editService('${service.id}')" class="btn-edit">✏️ Изменить</button>
                <button onclick="deleteService('${service.id}')" class="btn-delete">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
}

// Настройка формы
function setupForm() {
    const form = document.getElementById('serviceForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        saveService();
    });
}

// Редактировать услугу
function editService(id) {
    const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
    const service = services.find(s => s.id === id);
    
    if (!service) return;
    
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceTitle').value = service.title || '';
    document.getElementById('servicePrice').value = service.price || '';
    document.getElementById('serviceDescription').value = service.description || '';
    document.getElementById('serviceImage').value = service.image || '';
    
    if (service.items) {
        document.getElementById('serviceItems').value = service.items.join('\n');
    }
    
    document.getElementById('addService').style.display = 'none';
    document.getElementById('updateService').style.display = 'inline-block';
}

// Сохранить услугу
function saveService() {
    const id = document.getElementById('serviceId').value;
    const title = document.getElementById('serviceTitle').value.trim();
    const price = document.getElementById('servicePrice').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const image = document.getElementById('serviceImage').value.trim();
    const itemsText = document.getElementById('serviceItems').value.trim();

    if (!title || !price || !description) {
        alert('Заполните обязательные поля');
        return;
    }

    const items = itemsText ? itemsText.split('\n').map(item => item.trim()).filter(item => item) : [];

    const serviceData = {
        title,
        price,
        description,
        image: image || '../img/card1-img.png',
        items
    };

    try {
        if (id) {
            // Обновить
            const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
            const index = services.findIndex(s => s.id === id);
            if (index !== -1) {
                services[index] = { id, ...serviceData };
                localStorage.setItem('autoservice_services', JSON.stringify(services));
                alert('Услуга обновлена');
            }
        } else {
            // Добавить новую
            const newService = {
                id: Date.now().toString(),
                ...serviceData
            };
            const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
            services.push(newService);
            localStorage.setItem('autoservice_services', JSON.stringify(services));
            alert('Услуга добавлена');
        }

        resetForm();
        loadServices();

    } catch (error) {
        alert('Ошибка сохранения');
    }
}

// Обновить услугу
function updateService() {
    document.getElementById('serviceForm').requestSubmit();
}

// Удалить услугу
function deleteService(id) {
    if (!confirm('Удалить эту услугу?')) return;
    
    const services = JSON.parse(localStorage.getItem('autoservice_services') || '[]');
    const filtered = services.filter(s => s.id !== id);
    localStorage.setItem('autoservice_services', JSON.stringify(filtered));
    
    const currentId = document.getElementById('serviceId').value;
    if (currentId === id) {
        resetForm();
    }
    
    loadServices();
    alert('Услуга удалена');
}

// Сброс формы
function resetForm() {
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('addService').style.display = 'inline-block';
    document.getElementById('updateService').style.display = 'none';
}

// Выход
function logout() {
    if (confirm('Выйти из админ панели?')) {
        window.location.href = 'profile.html';
    }
}

// Обратно в профиль
function backToProfile() {
    window.location.href = 'profile.html';
}

// Глобальные функции
window.loadServices = loadServices;
window.editService = editService;
window.deleteService = deleteService;
window.updateService = updateService;
window.logout = logout;
window.backToProfile = backToProfile;
