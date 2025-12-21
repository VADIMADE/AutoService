// admin.js - УПРОЩЕННАЯ ВЕРСИЯ - ВСЕ НА ОДНОЙ СТРАНИЦЕ

document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Админ панель загружена');

  // Проверяем админа
  if (!checkIfAdmin()) {
    alert('❌ Только для администраторов');
    window.location.href = 'profile.html';
    return;
  }

  // Загружаем услуги сразу
  loadServices();

  // Настраиваем обработчики
  setupForm();
});

// ========== ПРОВЕРКА АДМИНА ==========
function checkIfAdmin() {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  console.log('👤 Текущий пользователь:', user);
  return user && user.role === 'admin';
}

// ========== ЗАГРУЗКА УСЛУГ ==========
async function loadServices() {
  console.log('📥 Загружаю услуги...');

  const container = document.getElementById('servicesList');
  container.innerHTML = '<div class="loading">⏳ Загрузка...</div>';

  try {
    // 1. Проверяем доступность сервера
    const test = await fetch('http://localhost:3000');
    console.log('✅ Сервер доступен');

    // 2. Загружаем услуги
    const response = await fetch('http://localhost:3000/services');

    if (!response.ok) {
      throw new Error(`Сервер вернул ${response.status}`);
    }

    const services = await response.json();
    console.log(`✅ Загружено услуг: ${services.length}`, services);

    // 3. Показываем услуги
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
                <button onclick="editService(${service.id})" 
                        style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ✏️ Изменить
                </button>
                <button onclick="deleteService(${service.id})" 
                        style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🗑️ Удалить
                </button>
            </div>
        </div>
    `).join('');

  // Добавляем стили для карточек
  const style = document.createElement('style');
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
    `;
  document.head.appendChild(style);
}

// ========== НАСТРОЙКА ФОРМЫ ==========
function setupForm() {
  const form = document.getElementById('serviceForm');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    await saveService();
  });

  // Кнопка очистки
  document.getElementById('clearForm').addEventListener('click', function () {
    resetForm();
    showMessage('Форма очищена', 'info');
  });
}

// ========== РЕДАКТИРОВАТЬ УСЛУГУ ==========
async function editService(id) {
  console.log('Редактируем услугу ID:', id);

  try {
    const response = await fetch(`http://localhost:3000/services/${id}`);
    const service = await response.json();

    // Заполняем форму
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceTitle').value = service.title || '';
    document.getElementById('servicePrice').value = service.price || '';
    document.getElementById('serviceDescription').value = service.description || '';
    document.getElementById('serviceImage').value = service.image || '';

    // Пункты
    if (service.items && Array.isArray(service.items)) {
      document.getElementById('serviceItems').value = service.items.join('\n');
    } else {
      document.getElementById('serviceItems').value = '';
    }

    // Показываем кнопки обновления
    document.getElementById('addService').style.display = 'none';
    document.getElementById('updateService').style.display = 'inline-block';
    document.getElementById('deleteServiceBtn').style.display = 'inline-block';

    // Прокручиваем к форме
    document.getElementById('serviceForm').scrollIntoView({ behavior: 'smooth' });

    showMessage(`Загружена услуга: "${service.title}"`, 'info');

  } catch (error) {
    console.error('Ошибка загрузки:', error);
    showMessage('Ошибка загрузки услуги', 'error');
  }
}

// ========== СОХРАНИТЬ/ОБНОВИТЬ ==========
async function saveService() {
  const id = document.getElementById('serviceId').value;
  const title = document.getElementById('serviceTitle').value.trim();
  const price = document.getElementById('servicePrice').value.trim();
  const description = document.getElementById('serviceDescription').value.trim();
  const image = document.getElementById('serviceImage').value.trim();
  const itemsText = document.getElementById('serviceItems').value.trim();

  // Проверка
  if (!title || !price || !description) {
    showMessage('Заполните обязательные поля: название, цена, описание', 'error');
    return;
  }

  // Парсим пункты
  const items = itemsText ? itemsText.split('\n').map(item => item.trim()).filter(item => item) : [];

  const serviceData = {
    title,
    price,
    description,
    image: image || `../img/card${Math.floor(Math.random() * 4) + 1}-img.png`,
    items
  };

  console.log('Сохранение данных:', serviceData);

  try {
    let response;

    if (id) {
      // Обновляем
      response = await fetch(`http://localhost:3000/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
    } else {
      // Добавляем новую
      response = await fetch('http://localhost:3000/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
    }

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Успешно сохранено:', result);

      showMessage(id ? '✅ Услуга обновлена!' : '✅ Услуга добавлена!', 'success');

      resetForm();
      loadServices();

    } else {
      throw new Error('Сервер вернул ошибку');
    }

  } catch (error) {
    console.error('❌ Ошибка сохранения:', error);
    showMessage('Ошибка при сохранении', 'error');
  }
}

// ========== ОБНОВИТЬ УСЛУГУ ==========
function updateService() {
  document.getElementById('serviceForm').requestSubmit();
}

// ========== УДАЛИТЬ УСЛУГУ ==========
async function deleteService(id) {
  if (!confirm('❓ Удалить эту услугу?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/services/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showMessage('✅ Услуга удалена', 'success');

      // Если удаляем текущую редактируемую услугу
      const currentId = document.getElementById('serviceId').value;
      if (currentId == id) {
        resetForm();
      }

      loadServices();
    }

  } catch (error) {
    console.error('Ошибка удаления:', error);
    showMessage('Ошибка при удалении', 'error');
  }
}

// ========== УДАЛИТЬ ТЕКУЩУЮ ==========
function deleteCurrentService() {
  const id = document.getElementById('serviceId').value;
  if (id) {
    deleteService(id);
  }
}

// ========== СООБЩЕНИЯ ==========
function showMessage(text, type) {
  // Удаляем старое сообщение
  const oldMsg = document.getElementById('statusMessage');
  if (oldMsg) oldMsg.remove();

  // Создаем новое
  const message = document.createElement('div');
  message.id = 'statusMessage';
  message.innerHTML = text;

  // Стили
  const styles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '5px',
    zIndex: '1000',
    minWidth: '300px',
    maxWidth: '500px',
    animation: 'fadeIn 0.3s'
  };

  if (type === 'success') {
    Object.assign(styles, {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    });
  } else if (type === 'error') {
    Object.assign(styles, {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    });
  } else {
    Object.assign(styles, {
      background: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb'
    });
  }

  Object.assign(message.style, styles);

  document.body.appendChild(message);

  // Удаляем через 5 секунд
  setTimeout(() => {
    if (message.parentNode) {
      message.style.opacity = '0';
      message.style.transition = 'opacity 0.5s';
      setTimeout(() => message.remove(), 500);
    }
  }, 5000);
}

// ========== ОШИБКА ==========
function showError(text) {
  const container = document.getElementById('servicesList');
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
            
            <div style="margin: 20px 0; text-align: left; background: #f8f9fa; padding: 15px; border-radius: 5px;">
                <strong>Проверьте:</strong>
                <ol style="margin: 10px 0 0 20px;">
                    <li>Запущен ли сервер: <code>json-server --watch db.json --port 3000</code></li>
                    <li>Открыть: <a href="http://localhost:3000/services" target="_blank">http://localhost:3000/services</a></li>
                    <li>Файл db.json в корне проекта</li>
                </ol>
            </div>
            
            <button onclick="loadServices()" 
                    style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                🔄 Попробовать снова
            </button>
            
            <button onclick="window.location.reload()" 
                    style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                🔄 Обновить страницу
            </button>
        </div>
    `;
}

// ========== СБРОС ФОРМЫ ==========
function resetForm() {
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';

  // Показываем кнопку добавления
  document.getElementById('addService').style.display = 'inline-block';
  document.getElementById('updateService').style.display = 'none';
  document.getElementById('deleteServiceBtn').style.display = 'none';
}

// ========== ВЫХОД ==========
function logout() {
  if (confirm('Выйти из админ панели?')) {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
  }
}

// ========== ТЕСТ ==========
function testServer() {
  fetch('http://localhost:3000/services')
    .then(response => response.json())
    .then(data => {
      alert(`✅ Сервер работает! Услуг: ${data.length}\n\nПервая услуга: ${data[0]?.title || 'нет'}`);
    })
    .catch(error => {
      alert(`❌ Ошибка: ${error.message}\n\nЗапустите: json-server --watch db.json --port 3000`);
    });
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========
window.loadServices = loadServices;
window.editService = editService;
window.deleteService = deleteService;
window.updateService = updateService;
window.deleteCurrentService = deleteCurrentService;
window.logout = logout;
window.testServer = testServer;

// Добавляем анимацию для сообщений
const animationStyle = document.createElement('style');
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