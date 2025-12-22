const STORAGE_KEYS = {
    CURRENT_USER: 'autoservice_currentUser',
    USERS: 'autoservice_users',
    BOOKINGS: 'autoservice_bookings',
    SERVICES: 'autoservice_services'
};

let currentUser = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('auth.js загружен');
    initializeDefaultData();
    loadCurrentUser();
    setupHeaderButtons();
});

// Инициализация данных по умолчанию
function initializeDefaultData() {
    // Проверяем, есть ли данные пользователей
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    if (users.length === 0) {
        users = [
            {
                id: '1',
                firstName: 'Вадим',
                lastName: 'Лаврук',
                email: 'vadimlavruk4@gmail.com',
                phone: '+375336518780',
                password: 'password123',
                role: 'admin',
                registrationDate: '2024-01-15'
            },
            {
                id: '2',
                firstName: 'Анна',
                lastName: 'Иванова',
                email: 'annaivanova@gmail.com',
                phone: '+375291234567',
                password: 'password456',
                role: 'client',
                registrationDate: '2024-02-20'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        console.log('Созданы пользователи по умолчанию');
    }
    
    // Инициализируем услуги
    let services = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
    
    if (services.length === 0) {
        services = [
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
            },
            {
                id: '4',
                title: 'ТОРМОЗНАЯ СИСТЕМА',
                price: 'от 120 бел. руб.',
                description: 'Замена колодок, дисков и тормозной жидкости. Вернем уверенность в торможении',
                image: '../img/card4-img.png',
                items: [
                    'Диагностика износа тормозных механизмов',
                    'Замена тормозных колодок (передних/задних)',
                    'Замена тормозных дисков или барабанов',
                    'Замена/прокачка тормозной жидкости',
                    'Чистка и смазка суппортов'
                ]
            },
            {
                id: '5',
                title: 'КУЗОВНЫЕ РАБОТЫ',
                price: 'от 450 бел. руб.',
                description: 'Устранение вмятин, царапин, последствий ДТП. Качественная покраска элементов кузова с подбором цвета',
                image: '../img/card5-img.png',
                items: [
                    'Рихтовка и вытягивание вмятин (без покраски)',
                    'Локальная покраска деталей',
                    'Полная покраска автомобиля',
                    'Полировка кузова (защитная, восстановительная)',
                    'Антикоррозийная обработка'
                ]
            },
            {
                id: '6',
                title: 'ОБСЛУЖИВАНИЕ',
                price: 'от 80 бел. руб.',
                description: 'Своевременная замена всех рабочих жидкостей — залог долгой службы агрегатов. Используем только качественные материалы',
                image: '../img/card6-img.png',
                items: [
                    'Замена масла в АКПП / МКПП',
                    'Замена масла в редукторе',
                    'Замена жидкости ГУР',
                    'Замена охлаждающей жидкости (антифриза)',
                    'Промывка систем перед заменой'
                ]
            }
        ];
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
        console.log('Созданы услуги по умолчанию');
    }
    
    // Инициализируем бронирования
    let bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    if (bookings.length === 0) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
    }
}

// Загрузка текущего пользователя
function loadCurrentUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            console.log('Текущий пользователь:', currentUser.firstName);
            updateHeaderButtons();
        } catch (error) {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    }
}

// Сохранение пользователя
function saveCurrentUser(user) {
    currentUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    updateHeaderButtons();
}

// Настройка кнопок
function setupHeaderButtons() {
    const loginBtn = document.querySelector('.header-btn2');
    const registerBtn = document.querySelector('.header-btn1');
    
    if (loginBtn) {
        loginBtn.onclick = (e) => {
            e.preventDefault();
            openSigninModal();
        };
    }
    
    if (registerBtn) {
        registerBtn.onclick = (e) => {
            e.preventDefault();
            if (currentUser) {
                // ВАЖНО: Определяем правильный путь
                const profilePath = getProfilePagePath();
                window.location.href = profilePath;
            } else {
                openSignupModal();
            }
        };
    }
    updateHeaderButtons();
}

// Функция для определения правильного пути к профилю
function getProfilePagePath() {
    // Получаем текущий URL
    const currentPath = window.location.pathname;
    console.log('Текущий путь:', currentPath);
    
    // Проверяем, где мы находимся
    if (currentPath.includes('/pages/')) {
        // Если уже в папке pages
        return 'profile.html';
    } else if (currentPath.includes('/docs/')) {
        // Если в папке docs
        return 'pages/profile.html';
    } else {
        // По умолчанию (для главной страницы)
        return 'pages/profile.html';
    }
}

// Обновление кнопок
function updateHeaderButtons() {
    const loginBtn = document.querySelector('.header-btn2');
    const registerBtn = document.querySelector('.header-btn1');
    
    if (!loginBtn || !registerBtn) return;
    
    if (currentUser) {
        loginBtn.textContent = 'Выйти';
        loginBtn.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        
        registerBtn.textContent = currentUser.firstName;
        registerBtn.onclick = (e) => {
            e.preventDefault();
            const profilePath = getProfilePagePath();
            window.location.href = profilePath;
        };
    } else {
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
    
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <h2>Вход в аккаунт</h2>
                <form id="signinForm">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="signinEmail" required placeholder="Email" value="vadimlavruk4@gmail.com">
                    </div>
                    <div class="form-group">
                        <label>Пароль</label>
                        <input type="password" id="signinPassword" required placeholder="Пароль" value="password123">
                    </div>
                    <button type="submit" class="btn-primary">Войти</button>
                </form>
                <div class="auth-switch">
                    <p>Нет аккаунта? <a href="#" class="switch-to-signup">Зарегистрироваться</a></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.querySelector('.modal-overlay').onclick = (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) modal.remove();
    };
    
    modal.querySelector('.switch-to-signup').onclick = (e) => {
        e.preventDefault();
        modal.remove();
        setTimeout(openSignupModal, 10);
    };
    
    modal.querySelector('#signinForm').onsubmit = handleSignin;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.remove();
    });
}

// Открытие модального окна регистрации
function openSignupModal() {
    if (document.querySelector('.auth-modal')) return;
    
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
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
                        <input type="password" id="signupPassword" required placeholder="Не менее 6 символов">
                    </div>
                    <button type="submit" class="btn-primary">Зарегистрироваться</button>
                </form>
                <div class="auth-switch">
                    <p>Уже есть аккаунт? <a href="#" class="switch-to-signin">Войти</a></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.querySelector('.modal-overlay').onclick = (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) modal.remove();
    };
    
    modal.querySelector('.switch-to-signin').onclick = (e) => {
        e.preventDefault();
        modal.remove();
        setTimeout(openSigninModal, 10);
    };
    
    modal.querySelector('#signupForm').onsubmit = handleSignup;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') modal.remove();
    });
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
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showMessage('Неверный email или пароль', 'error');
        return;
    }
    
    saveCurrentUser(user);
    document.querySelector('.auth-modal')?.remove();
    showMessage(`Добро пожаловать, ${user.firstName}!`, 'success');
    
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
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.some(u => u.email === email)) {
        showMessage('Пользователь с таким email уже существует', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        phone,
        password,
        role: 'client',
        registrationDate: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    saveCurrentUser(newUser);
    document.querySelector('.auth-modal')?.remove();
    showMessage(`Регистрация успешна! Добро пожаловать, ${firstName}!`, 'success');
    
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
                }
            }, 1000);
        } catch (error) {
            localStorage.removeItem('bookingRedirect');
        }
    }
}

// Выход
function logout() {
    if (confirm('Выйти из аккаунта?')) {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        updateHeaderButtons();
        showMessage('Вы успешно вышли', 'success');
    }
}

// Показать сообщение
function showMessage(text, type = 'info') {
    const oldMessage = document.querySelector('.auth-message');
    if (oldMessage) oldMessage.remove();
    
    const message = document.createElement('div');
    message.className = `auth-message ${type}`;
    message.textContent = text;
    message.style.cssText = `
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
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#CC7000'};
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode === document.body) {
            message.remove();
        }
    }, 3000);
}

// Глобальные функции
window.getCurrentUser = () => currentUser;
window.checkAuth = () => currentUser !== null;
window.logout = logout;
window.openSigninModal = openSigninModal;
window.getUsersFromStorage = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
window.getServicesFromStorage = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
window.getBookingsFromStorage = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
window.saveBookingToStorage = (booking) => {
    const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    bookings.push(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return booking;
};
window.saveServiceToStorage = (service) => {
    const services = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
    services.push(service);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return service;
};
window.updateServiceInStorage = (id, updatedService) => {
    const services = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
    const index = services.findIndex(s => s.id === id);
    if (index !== -1) {
        services[index] = { ...services[index], ...updatedService };
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
        return services[index];
    }
    return null;
};
window.deleteServiceFromStorage = (id) => {
    const services = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
    const filtered = services.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
    return filtered;
};

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
    }
    
    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        position: relative;
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
    }
    
    .modal-content h2 {
        color: #333;
        margin-bottom: 25px;
        text-align: center;
        font-size: 24px;
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
    }
    
    input:focus {
        outline: none;
        border-color: #CC7000;
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
