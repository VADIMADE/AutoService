// js/auth.js

const DATA_FILE = '../json/data.json'; // Файл с данными
const CURRENT_USER_KEY = 'autoservice_currentUser';
const LOCAL_USERS_KEY = 'autoservice_local_users'; // Для новых пользователей

let currentUser = null;
let usersDatabase = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('auth.js загружен');
    
    try {
        // Загружаем данные пользователей
        await loadUsersDatabase();
        console.log('База данных загружена:', usersDatabase.length, 'пользователей');
        
        // Загружаем текущего пользователя
        loadCurrentUser();
        
        // Настраиваем кнопки
        setupHeaderButtons();
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showMessage('Ошибка загрузки данных', 'error');
    }
});

// Загрузка базы данных пользователей
async function loadUsersDatabase() {
    try {
        console.log('Загрузка данных из', DATA_FILE);
        const response = await fetch(DATA_FILE);
        
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Получаем пользователей из data.json
        const jsonUsers = data.users || data;
        
        // Получаем локальных пользователей (новые регистрации)
        const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
        
        // Объединяем базы
        usersDatabase = [...jsonUsers, ...localUsers];
        
        console.log(`Загружено: ${jsonUsers.length} из JSON, ${localUsers.length} локальных`);
        
    } catch (error) {
        console.error('Ошибка загрузки data.json:', error);
        
        // Создаем тестовую базу
        usersDatabase = [
            {
                id: '1',
                firstName: 'Вадим',
                lastName: 'Лаврук',
                email: 'vadimlavruk4@gmail.com',
                phone: '+79991234567',
                password: 'password123',
                role: 'client',
                registrationDate: '2024-01-15',
                cars: []
            }
        ];
        console.log('Используется тестовая база');
    }
}

// Загрузка текущего пользователя
function loadCurrentUser() {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('Текущий пользователь:', currentUser.firstName);
            updateHeaderButtons();
        } catch (error) {
            console.error('Ошибка парсинга:', error);
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    }
}

// Сохранение текущего пользователя
function saveCurrentUser(user) {
    currentUser = { ...user };
    delete currentUser.password; // Не храним пароль в сессии
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    updateHeaderButtons();
}

// Настройка кнопок в хедере
function setupHeaderButtons() {
    const loginBtn = document.querySelector('.header-btn2');
    const registerBtn = document.querySelector('.header-btn1');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openSigninModal();
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openSignupModal();
        });
    }
}

// Обновление кнопок
function updateHeaderButtons() {
    const loginBtn = document.querySelector('.header-btn2');
    const registerBtn = document.querySelector('.header-btn1');
    
    if (!loginBtn || !registerBtn) return;
    
    if (currentUser) {
        // Авторизован
        loginBtn.textContent = 'Выйти';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        
        registerBtn.textContent = 'Профиль';
        registerBtn.onclick = (e) => {
            e.preventDefault();
            openProfileModal();
        };
    } else {
        // Не авторизован
        loginBtn.textContent = 'Войти';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            openSigninModal();
        };
        
        registerBtn.textContent = 'Регистрация';
        registerBtn.onclick = (e) => {
            e.preventDefault();
            openSignupModal();
        };
    }
}

// Открытие модального окна входа
function openSigninModal() {
    if (document.querySelector('.auth-modal')) return;
    
    const modal = createModal(`
        <button class="close-modal">&times;</button>
        <h2>Вход в аккаунт</h2>
        <form id="signinForm">
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="signinEmail" required 
                       placeholder="Email" 
                       value="vadimlavruk4@gmail.com">
            </div>
            <div class="form-group">
                <label>Пароль</label>
                <input type="password" id="signinPassword" required 
                       placeholder="Введите пароль" 
                       value="password123">
            </div>
            <button type="submit" class="btn-primary">Войти</button>
        </form>
        <div class="auth-switch">
            <p>Нет аккаунта? 
                <a href="#" class="switch-link" data-to="signup">Зарегистрироваться</a>
            </p>
        </div>
    `);
    
    // Обработчики
    modal.querySelector('#signinForm').addEventListener('submit', handleSignin);
    modal.querySelector('.switch-link').addEventListener('click', (e) => {
        e.preventDefault();
        closeCurrentModal();
        setTimeout(openSignupModal, 10);
    });
    
    setupModalClose(modal);
    setTimeout(() => modal.querySelector('#signinEmail').focus(), 100);
}

// Открытие модального окна регистрации
function openSignupModal() {
    if (document.querySelector('.auth-modal')) return;
    
    const modal = createModal(`
        <button class="close-modal">&times;</button>
        <h2>Регистрация</h2>
        <form id="signupForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Имя</label>
                    <input type="text" id="signupFirstName" required placeholder="Имя">
                </div>
                <div class="form-group">
                    <label>Фамилия</label>
                    <input type="text" id="signupLastName" required placeholder="Фамилия">
                </div>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="signupEmail" required placeholder="Email">
            </div>
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="signupPhone" required placeholder="Телефон">
            </div>
            <div class="form-group">
                <label>Пароль</label>
                <input type="password" id="signupPassword" required 
                       placeholder="Не менее 6 символов">
            </div>
            <button type="submit" class="btn-primary">Зарегистрироваться</button>
        </form>
        <div class="auth-switch">
            <p>Уже есть аккаунт? 
                <a href="#" class="switch-link" data-to="signin">Войти</a>
            </p>
        </div>
    `);
    
    // Обработчики
    modal.querySelector('#signupForm').addEventListener('submit', handleSignup);
    modal.querySelector('.switch-link').addEventListener('click', (e) => {
        e.preventDefault();
        closeCurrentModal();
        setTimeout(openSigninModal, 10);
    });
    
    setupModalClose(modal);
    setTimeout(() => modal.querySelector('#signupFirstName').focus(), 100);
}

// Обработка входа
function handleSignin(e) {
    e.preventDefault();
    
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value.trim();
    
    if (!email || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    // Ищем пользователя в объединенной базе
    const user = usersDatabase.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
    );
    
    if (!user) {
        showMessage('Неверный email или пароль', 'error');
        return;
    }
    
    // Вход успешен
    saveCurrentUser(user);
    closeCurrentModal();
    showMessage(`Добро пожаловать, ${user.firstName}!`, 'success');
    
    // Проверяем редирект на запись
    checkBookingRedirect();
}

// Обработка регистрации
function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    
    // Валидация
    if (!firstName || !lastName || !email || !phone || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Введите корректный email', 'error');
        return;
    }
    
    // Проверяем существование пользователя
    const existingUser = usersDatabase.find(u => 
        u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
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
        password,
        role: 'client',
        registrationDate: new Date().toISOString().split('T')[0],
        cars: []
    };
    
    // Сохраняем в локальное хранилище
    const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    localUsers.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
    
    // Добавляем в текущую базу
    usersDatabase.push(newUser);
    
    // Авторизуем пользователя
    saveCurrentUser(newUser);
    closeCurrentModal();
    showMessage(`Регистрация успешна! Добро пожаловать, ${firstName}!`, 'success');
    
    // Проверяем редирект
    checkBookingRedirect();
}

// Проверка редиректа на запись
function checkBookingRedirect() {
    const bookingRedirect = localStorage.getItem('bookingRedirect');
    
    if (bookingRedirect) {
        try {
            const data = JSON.parse(bookingRedirect);
            localStorage.removeItem('bookingRedirect');
            
            setTimeout(() => {
                if (typeof window.openBookingForService === 'function') {
                    window.openBookingForService(data.serviceId, data.serviceTitle, data.servicePrice);
                } else if (currentUser) {
                    alert(`Вы записывались на: ${data.serviceTitle}`);
                }
            }, 1000);
            
        } catch (error) {
            localStorage.removeItem('bookingRedirect');
        }
    }
}

// Открытие профиля
function openProfileModal() {
    if (document.querySelector('.auth-modal')) return;
    
    // Находим полные данные (из базы или localStorage)
    const fullUserData = usersDatabase.find(u => u.id === currentUser.id) || currentUser;
    
    const modal = createModal(`
        <button class="close-modal">&times;</button>
        <h2>Профиль пользователя</h2>
        <div class="profile-info">
            <div class="profile-field">
                <strong>Имя:</strong> ${fullUserData.firstName} ${fullUserData.lastName}
            </div>
            <div class="profile-field">
                <strong>Email:</strong> ${fullUserData.email}
            </div>
            <div class="profile-field">
                <strong>Телефон:</strong> ${fullUserData.phone}
            </div>
            <div class="profile-field">
                <strong>Дата регистрации:</strong> ${fullUserData.registrationDate}
            </div>
            <div class="profile-field">
                <strong>Роль:</strong> ${fullUserData.role === 'client' ? 'Клиент' : fullUserData.role}
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button class="btn-secondary" onclick="logout()" style="flex: 1;">Выйти</button>
            <button class="btn-secondary" onclick="closeCurrentModal()" style="flex: 1;">Закрыть</button>
        </div>
    `);
    
    setupModalClose(modal);
}

// Выход
function logout() {
    if (confirm('Выйти из аккаунта?')) {
        currentUser = null;
        localStorage.removeItem(CURRENT_USER_KEY);
        updateHeaderButtons();
        closeCurrentModal();
        showMessage('Вы успешно вышли', 'success');
    }
}

// Вспомогательные функции
function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function setupModalClose(modal) {
    // Кнопка закрытия
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Клик на оверлей
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            document.body.removeChild(modal);
        }
    });
    
    // ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeCurrentModal() {
    const modal = document.querySelector('.auth-modal');
    if (modal) document.body.removeChild(modal);
}

function showMessage(text, type = 'info') {
    // Удаляем старое
    const old = document.querySelector('.auth-message');
    if (old) old.remove();
    
    // Создаем новое
    const message = document.createElement('div');
    message.className = `auth-message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    // Автоудаление
    setTimeout(() => {
        if (message.parentNode === document.body) {
            message.remove();
        }
    }, 3000);
}

// Глобальные функции
window.switchToSignin = openSigninModal;
window.switchToSignup = openSignupModal;
window.checkAuth = () => currentUser !== null;
window.getCurrentUser = () => currentUser;
window.openSigninModal = openSigninModal;
window.openProfileModal = openProfileModal;
window.logout = logout;

// Добавляем стили
const style = document.createElement('style');
style.textContent = `
    .auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        font-family: Arial, sans-serif;
    }
    
    .modal-overlay {
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        position: relative;
        animation: slideUp 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .close-modal {
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
        transition: color 0.3s;
    }
    
    .close-modal:hover {
        color: #CC7000;
    }
    
    .modal-content h2 {
        color: #333;
        margin-bottom: 25px;
        text-align: center;
        font-size: 24px;
        font-weight: 600;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-row {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .form-row .form-group {
        flex: 1;
        margin-bottom: 0;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        color: #333;
        font-weight: 500;
        font-size: 14px;
    }
    
    input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 16px;
        box-sizing: border-box;
        transition: border-color 0.3s, box-shadow 0.3s;
    }
    
    input:focus {
        outline: none;
        border-color: #CC7000;
        box-shadow: 0 0 0 2px rgba(204, 112, 0, 0.2);
    }
    
    .btn-primary {
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
        transition: background-color 0.3s;
    }
    
    .btn-primary:hover {
        background-color: #b36200;
    }
    
    .btn-secondary {
        padding: 12px 20px;
        background-color: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .btn-secondary:hover {
        background-color: #e5e5e5;
        border-color: #ccc;
    }
    
    .auth-switch {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #eee;
        margin-top: 20px;
    }
    
    .auth-switch p {
        color: #666;
        margin-bottom: 0;
        font-size: 14px;
    }
    
    .auth-switch a {
        color: #CC7000;
        font-weight: bold;
        text-decoration: none;
        transition: color 0.3s;
    }
    
    .auth-switch a:hover {
        color: #b36200;
        text-decoration: underline;
    }
    
    .profile-info {
        margin: 20px 0;
    }
    
    .profile-field {
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        color: #333;
    }
    
    .profile-field:last-child {
        border-bottom: none;
    }
    
    .auth-message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10001;
        animation: slideIn 0.3s ease;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        color: white;
    }
    
    .auth-message.success {
        background-color: #4CAF50;
    }
    
    .auth-message.error {
        background-color: #f44336;
    }
    
    .auth-message.info {
        background-color: #CC7000;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
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
`;

document.head.appendChild(style);

