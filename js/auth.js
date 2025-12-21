// js/auth.js

const API_URL = 'http://localhost:3000';
let currentUser = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('auth.js загружен');
    
    // Загружаем пользователя из localStorage
    loadUserFromStorage();
    
    // Настраиваем обработчики кнопок в хедере
    setupHeaderButtons();
});

// Загрузка пользователя из localStorage
function loadUserFromStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('Пользователь загружен:', currentUser.firstName);
            
            // Обновляем кнопки в хедере
            updateHeaderButtons();
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
            localStorage.removeItem('currentUser');
        }
    }
}

// Сохранение пользователя
function saveUserToStorage(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateHeaderButtons();
}

// Настройка обработчиков кнопок в хедере
function setupHeaderButtons() {
    // Находим кнопки в хедере
    const loginBtn = document.querySelector('.header-btn2');
    const registerBtn = document.querySelector('.header-btn1');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openSigninModal();
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openSignupModal();
        });
    }
}

// Обновление кнопок в хедере (если пользователь авторизован)
function updateHeaderButtons() {
    const loginBtn = document.querySelector('.header-btn2');
    const registerBtn = document.querySelector('.header-btn1');
    
    if (currentUser) {
        // Пользователь авторизован - меняем кнопки
        if (loginBtn) {
            loginBtn.textContent = 'Выйти';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
        
        if (registerBtn) {
            registerBtn.textContent = currentUser.firstName;
            registerBtn.style.cursor = 'default';
            registerBtn.onclick = function(e) {
                e.preventDefault();
                alert(`Вы вошли как: ${currentUser.firstName} ${currentUser.lastName}\nEmail: ${currentUser.email}`);
            };
        }
    } else {
        // Пользователь не авторизован - стандартные кнопки
        if (loginBtn) {
            loginBtn.textContent = 'Войти';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                openSigninModal();
            };
        }
        
        if (registerBtn) {
            registerBtn.textContent = 'Регистрация';
            registerBtn.style.cursor = 'pointer';
            registerBtn.onclick = function(e) {
                e.preventDefault();
                openSignupModal();
            };
        }
    }
}

// Выход из системы
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateHeaderButtons();
        showMessage('Вы успешно вышли из системы', 'success');
    }
}

// Открытие модального окна входа
function openSigninModal() {
    // Проверяем, нет ли уже открытого модального окна
    if (document.querySelector('.auth-modal')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            position: relative;
        ">
            <button class="close-modal" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                line-height: 30px;
                text-align: center;
            ">&times;</button>
            
            <h2 style="color: #333; margin-bottom: 25px; text-align: center; font-size: 24px;">Вход в аккаунт</h2>
            
            <form id="signinForm">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Email</label>
                    <input type="email" id="signinEmail" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 16px;
                        box-sizing: border-box;
                    " placeholder="Email" value="vadimlavruk4@gmail.com">
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Пароль</label>
                    <input type="password" id="signinPassword" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 16px;
                        box-sizing: border-box;
                    " placeholder="Введите пароль" value="password123">
                </div>
                
                <button type="submit" style="
                    width: 100%;
                    padding: 14px;
                    background-color: #CC7000;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 20px;
                ">
                    Войти
                </button>
            </form>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; margin-bottom: 0; font-size: 14px;">
                    Нет аккаунта? 
                    <a href="#" onclick="switchToSignup()" style="color: #CC7000; font-weight: bold; text-decoration: none;">
                        Зарегистрироваться
                    </a>
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработка закрытия
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие при клике на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Обработка формы
    const form = modal.querySelector('#signinForm');
    form.addEventListener('submit', handleSignin);
    
    // Фокус на поле email
    setTimeout(() => {
        modal.querySelector('#signinEmail').focus();
    }, 100);
}

// Открытие модального окна регистрации
function openSignupModal() {
    // Проверяем, нет ли уже открытого модального окна
    if (document.querySelector('.auth-modal')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            position: relative;
        ">
            <button class="close-modal" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                line-height: 30px;
                text-align: center;
            ">&times;</button>
            
            <h2 style="color: #333; margin-bottom: 25px; text-align: center; font-size: 24px;">Регистрация</h2>
            
            <form id="signupForm">
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Имя</label>
                        <input type="text" id="signupFirstName" required style="
                            width: 100%;
                            padding: 12px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 16px;
                            box-sizing: border-box;
                        " placeholder="Имя">
                    </div>
                    
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Фамилия</label>
                        <input type="text" id="signupLastName" required style="
                            width: 100%;
                            padding: 12px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 16px;
                            box-sizing: border-box;
                        " placeholder="Фамилия">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Email</label>
                    <input type="email" id="signupEmail" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 16px;
                        box-sizing: border-box;
                    " placeholder="Email">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Телефон</label>
                    <input type="tel" id="signupPhone" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 16px;
                        box-sizing: border-box;
                    " placeholder="Телефон">
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Пароль</label>
                    <input type="password" id="signupPassword" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 16px;
                        box-sizing: border-box;
                    " placeholder="Не менее 6 символов">
                </div>
                
                <button type="submit" style="
                    width: 100%;
                    padding: 14px;
                    background-color: #CC7000;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 20px;
                ">
                    Зарегистрироваться
                </button>
            </form>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; margin-bottom: 0; font-size: 14px;">
                    Уже есть аккаунт? 
                    <a href="#" onclick="switchToSignin()" style="color: #CC7000; font-weight: bold; text-decoration: none;">
                        Войти
                    </a>
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработка закрытия
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Закрытие при клике на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Обработка формы
    const form = modal.querySelector('#signupForm');
    form.addEventListener('submit', handleSignup);
    
    // Фокус на поле имени
    setTimeout(() => {
        modal.querySelector('#signupFirstName').focus();
    }, 100);
}

// Обработка входа
async function handleSignin(e) {
    e.preventDefault();
    
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value.trim();
    
    if (!email || !password) {
        showMessage('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    try {
        // Ищем пользователя в базе данных
        const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
        
        const users = await response.json();
        
        if (users.length === 0) {
            showMessage('Неверный email или пароль', 'error');
            return;
        }
        
        const user = users[0];
        
        // Сохраняем пользователя
        saveUserToStorage(user);
        
        // Закрываем модальное окно
        closeCurrentModal();
        
        // Показываем сообщение об успехе
        showMessage(`Добро пожаловать, ${user.firstName}!`, 'success');
        
        // Проверяем, есть ли редирект на запись
        checkBookingRedirect();
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        showMessage('Ошибка сервера. Проверьте подключение к JSON Server.', 'error');
    }
}

// Обработка регистрации
async function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    
    // Валидация
    if (!firstName || !lastName || !email || !phone || !password) {
        showMessage('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Введите корректный email', 'error');
        return;
    }
    
    try {
        // Проверяем, нет ли пользователя с таким email
        const checkResponse = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}`);
        
        if (!checkResponse.ok) {
            throw new Error('Ошибка проверки email');
        }
        
        const existingUsers = await checkResponse.json();
        
        if (existingUsers.length > 0) {
            showMessage('Пользователь с таким email уже существует', 'error');
            return;
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            phone,
            password, // Внимание: в реальном проекте пароли нужно хэшировать!
            role: 'client',
            registrationDate: new Date().toISOString().split('T')[0],
            cars: []
        };
        
        // Сохраняем пользователя на сервере
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при регистрации');
        }
        
        const createdUser = await response.json();
        
        // Сохраняем пользователя
        saveUserToStorage(createdUser);
        
        // Закрываем модальное окно
        closeCurrentModal();
        
        // Показываем сообщение об успехе
        showMessage(`Регистрация успешна! Добро пожаловать, ${firstName}!`, 'success');
        
        // Проверяем редирект на запись
        checkBookingRedirect();
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showMessage('Ошибка при регистрации. Проверьте подключение к JSON Server.', 'error');
    }
}

// Проверка редиректа на запись
function checkBookingRedirect() {
    const bookingRedirect = localStorage.getItem('bookingRedirect');
    
    if (bookingRedirect) {
        try {
            const data = JSON.parse(bookingRedirect);
            
            // Удаляем данные редиректа
            localStorage.removeItem('bookingRedirect');
            
            // Показываем сообщение о выбранной услуге
            setTimeout(() => {
                alert(`Вы выбрали услугу: ${data.serviceTitle}\n\nТеперь вы можете записаться на нее.`);
                
                // Если на странице есть функция для открытия записи, вызываем ее
                if (typeof window.openBookingForService === 'function') {
                    window.openBookingForService(data.serviceId, data.serviceTitle, data.servicePrice);
                }
            }, 1000);
            
        } catch (error) {
            console.error('Ошибка:', error);
            localStorage.removeItem('bookingRedirect');
        }
    }
}

// Вспомогательные функции
function closeCurrentModal() {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function showMessage(text, type = 'info') {
    // Удаляем старое сообщение если есть
    const oldMessage = document.querySelector('.auth-message');
    if (oldMessage) {
        document.body.removeChild(oldMessage);
    }
    
    // Создаем новое сообщение
    const message = document.createElement('div');
    message.className = 'auth-message';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#CC7000'};
        color: white;
        border-radius: 5px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    message.textContent = text;
    document.body.appendChild(message);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        if (message.parentNode === document.body) {
            document.body.removeChild(message);
        }
    }, 3000);
}

// Глобальные функции для переключения между окнами
window.switchToSignin = function() {
    closeCurrentModal();
    setTimeout(() => openSigninModal(), 10);
};

window.switchToSignup = function() {
    closeCurrentModal();
    setTimeout(() => openSignupModal(), 10);
};

// Проверка авторизации (для использования в других файлах)
window.checkAuth = function() {
    return currentUser !== null;
};

window.getCurrentUser = function() {
    return currentUser;
};

// Добавляем стили для анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes modalAppear {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .auth-modal .modal-content {
        animation: modalAppear 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .auth-modal input:focus {
        outline: none;
        border-color: #CC7000 !important;
        box-shadow: 0 0 0 2px rgba(204, 112, 0, 0.2);
    }
    
    .auth-modal a:hover {
        text-decoration: underline;
    }
`;

// Обновление кнопок в хедере (добавьте в конец auth.js)
function updateHeaderButtons() {
    const loginBtn = document.querySelector('.header-btn2');
    const registerBtn = document.querySelector('.header-btn1');
    
    if (currentUser) {
        // Пользователь авторизован
        if (loginBtn) {
            loginBtn.textContent = 'Выйти';
            loginBtn.style.cursor = 'pointer';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
        
        if (registerBtn) {
            // Показываем "Профиль" для всех авторизованных
            registerBtn.textContent = 'Профиль';
            registerBtn.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'profile.html';
            };
            registerBtn.style.cursor = 'pointer';
        }
    } else {
        // Пользователь не авторизован
        if (loginBtn) {
            loginBtn.textContent = 'Войти';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                openSigninModal();
            };
        }
        
        if (registerBtn) {
            registerBtn.textContent = 'Регистрация';
            registerBtn.onclick = function(e) {
                e.preventDefault();
                openSignupModal();
            };
        }
    }
}

// Выход из системы (добавьте в auth.js)
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateHeaderButtons();
        alert('Вы успешно вышли из системы');
    }
}

document.head.appendChild(style);