//Получение DOM элементов
const hamb = document.querySelector("#header-menu-hamb");
const popup = document.querySelector("#popup");
const body = document.body;

//Основная функция обновления меню
function updatePopupMenu() {
  const originalMenu = document.querySelector("#menu");
  const menu = originalMenu.cloneNode(true);
  
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const adminLink = menu.querySelector("#adminPanelLink");
  
  if (user && user.role === 'admin' && adminLink) {
    adminLink.style.display = 'block';
  } else if (adminLink) {
    adminLink.style.display = 'none';
  }
  
  popup.innerHTML = '';
  popup.appendChild(menu);
}

//Обработчик клика по гамбургер-меню
hamb.addEventListener("click", hambHandler);

function hambHandler(e) {
  e.preventDefault();
  popup.classList.toggle("open");
  hamb.classList.toggle("active");
  body.classList.toggle("noscroll");

  if (popup.classList.contains("open")) {
    updatePopupMenu();
  }
}

//Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const adminLink = document.getElementById('adminPanelLink');
  
  if (user && user.role === 'admin' && adminLink) {
    adminLink.style.display = 'block';
  } else if (adminLink) {
    adminLink.style.display = 'none';
  }

  updatePopupMenu();
});