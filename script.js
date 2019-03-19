const input = document.querySelector('.urlInput');
const btn = document.querySelector('.btn');
const form = document.querySelector('form');
const img = document.querySelector('svg image');
const preloader = document.querySelector('.preloader');
const clip = document.querySelector('svg rect');
const clipWidth = +clip.getAttribute('width');
const clipHeight = +clip.getAttribute('height');
const startImgX = +img.getAttribute('x');
const startImgY = +img.getAttribute('y');
const range = document.querySelector('.range-container input');
const rangeMax = +range.getAttribute('max');
let startImgWidth = +img.getAttribute('width');
let startImgHeight = +img.getAttribute('height');
let val = +range.value;
let newImgWidth;
let newImgHeight;
let maxImgWidth;
let maxImgHeight;

// при перезагрузке страницы проверяем localStorage
if (localStorage.length > 0) {
  // скрываем картинку, показываем прелоадер
  img.style.opacity = '0';
  preloader.style.display = 'flex';

  //здесь нам нужно переопределить значения для вывода последнего состояния
  img.onload = () => {
    // скрываем прелоадер, показываем картинку
    preloader.style.display = 'none';
    img.style.opacity = '1';
  };

  // присваиваем переменные из localStorage
  startImgWidth = localStorage.getItem('startImgWidth');
  startImgHeight= localStorage.getItem('startImgHeight');
  maxImgWidth = localStorage.getItem('maxImgWidth');
  maxImgHeight = localStorage.getItem('maxImgHeight');
  newImgWidth = localStorage.getItem('newImgWidth');
  newImgHeight = localStorage.getItem('newImgHeight');
  img.setAttribute('width', localStorage.getItem('imgWidth'));
  img.setAttribute('height', localStorage.getItem('imgHeight'));
  img.setAttribute('x', localStorage.getItem('x'));
  img.setAttribute('y', localStorage.getItem('y'));
  img.setAttribute('xlink:href', localStorage.getItem('xlink'));
  range.value = localStorage.getItem('val');
}

// отменяем сабмит формы
form.addEventListener('submit', e => e.preventDefault());

// вешаем обработчик клика на кнопку
btn.addEventListener('click', () => {

  // если поле ввода пустое, показываем сообщение
  if (input.value === "") {
    alert('Введите url картинки');
    return
  }

  // скрываем картинку, показываем прелоадер
  img.style.opacity = '0';
  preloader.style.display = 'flex';

  // для определения исходных размеров новой картинки создаем вспомогательный helpImg
  let helpImg = new Image();

  // подгружаем картинку, подставляя значение из инпута
  img.setAttribute('xlink:href', input.value);

  // поскольку картинка загружается не сразу, логику вешаем на onload
  helpImg.onload = () => {

    // если ширина новой картики больше высоты — можно перетаскивать по горизонтали
    if (helpImg.width > helpImg.height) {
      // сохраняем пропорции
      startImgWidth = clipWidth * (helpImg.width / helpImg.height);
      img.setAttribute('width', startImgWidth);
    }
    // если наоборот — по вертикали
    else if (helpImg.width < helpImg.height) {
      // сохраняем пропорции
      startImgHeight = clipHeight * (helpImg.height / helpImg.width);
      img.setAttribute('height', startImgHeight);
    }
    // квадртаные картинки помещаются целиком
    // скрываем прелоадер, показываем картинку
    preloader.style.display = 'none';
    img.style.opacity = '1';
  };

  // копируем ссылку во вспомогательный helpImg для определения размеров
  helpImg.src = img.getAttribute('xlink:href');

  // сбрасываем зум и перемещение для отображения новой картинки по умолчанию
  range.value = 1;
  startImgWidth = clipWidth;
  startImgHeight = clipHeight;
  img.setAttribute('width', startImgWidth);
  img.setAttribute('height', startImgHeight);

  // чтобы картинка не уползала, присваиваем ей координаты currMaxX и currMaxY
  zoom();

  // сохраняем переменные в localStorage
  localStorage.setItem('xlink', input.value);
  localStorage.setItem('startImgWidth', startImgWidth);
  localStorage.setItem('startImgHeight', startImgHeight);
});

// функция масштабирования
function zoom() {
  newImgHeight = localStorage.getItem('newImgHeight');
  newImgWidth= localStorage.getItem('newImgWidth');

  // задаём ширину и высоту, умножив исходные на значение инпута range
  val = +range.value;
  newImgWidth = startImgWidth * val;
  newImgHeight = startImgHeight * val;

  // берём координаты
  let x = +img.getAttribute('x');
  let y = +img.getAttribute('y');

  // вычисляем новые границы, за которые нельзя уползать картинке
  let currMaxX = startImgX - (startImgWidth - clipWidth);
  if (val !== 1) currMaxX = startImgX - (newImgWidth - clipWidth);
  let currMaxY = startImgY - (startImgHeight - clipHeight);
  if (val !== 1) currMaxY = startImgY - (newImgHeight - clipHeight);

  // вычисляем максимально возможные габариты и координаты для данной картинки
  maxImgWidth = startImgWidth * rangeMax;
  maxImgHeight = startImgHeight * rangeMax;
  const maxX = startImgX - (maxImgWidth - clipWidth);
  const maxY = startImgX - (maxImgHeight - clipHeight);
  let maxImgOffsetX = maxX + maxImgWidth;
  let maxImgOffsetY = maxY + maxImgHeight;

  // при превышении границ держим картинку в рамках
  if (x + newImgWidth < maxImgOffsetX) img.setAttribute('x', currMaxX);
  if (y + newImgHeight < maxImgOffsetY) img.setAttribute('y', currMaxY);

  // присваиваем новые ширину и высоту
  img.setAttribute('width', newImgWidth);
  img.setAttribute('height', newImgHeight);

  // сохраняем переменные в localStorage
  localStorage.setItem('maxImgOffsetX', maxImgOffsetX);
  localStorage.setItem('maxImgOffsetY', maxImgOffsetY);
  localStorage.setItem('maxImgWidth', maxImgWidth);
  localStorage.setItem('maxImgHeight', maxImgHeight);
  localStorage.setItem('startImgWidth', startImgWidth);
  localStorage.setItem('startImgHeight', startImgHeight);
  localStorage.setItem('imgWidth', newImgWidth);
  localStorage.setItem('imgHeight', newImgHeight);
  localStorage.setItem('val', val);
}
// отслеживаем изменение range и навешиваем функцию zoo
range.oninput = zoom;

// отслеживаем клик по картинке
img.onmousedown = e => {
  // круг вокруг зажатого курсора
  let mouseCircle = document.createElement('div');
  mouseCircle.id = 'mouseCircle';
  mouseCircle.style.top = e.pageY - 20 + 'px';
  mouseCircle.style.left = e.pageX - 20 + 'px';

  // при onmousedown меняем курсор
  document.body.style.cursor = 'move';
  document.body.appendChild(mouseCircle);

  // Если кликнули правой кнопкой - не перетаскиваем
  if (e.which !== 1) return;

  // высчитываем начальные координаты курсора относительно левого верхнего угла картинки
  let coords = getCoords(img);
  let startShiftX = e.pageX - coords.left;
  let startShiftY = e.pageY - coords.top;

  // отслеживаем движение зажатой мыши
  document.onmousemove = e => moveAt(e);

  // отслеживаем момент, когда пользователь отпускает кнопку
  document.onmouseup = () => {
    // при onmouseup меняем курсор на обычный
    document.body.style.cursor = 'auto';
    document.body.removeChild(mouseCircle);

    // обнуляем значения, чтобы при следующем перетаскивании сохранилось текущее положение
    moveAt = null;
    document.onmousemove = null;
    document.onmouseup = null;
  };

  // сама функция drug'n'drop
  function moveAt(e) {
    // с помощью функции zoom, чтобы не дублировать код, сохраняем текущее положение картинки
    if (localStorage.length > 0) zoom();

    // двигаем круг вместе с курсором
    mouseCircle.style.top = e.pageY - mouseCircle.offsetWidth / 2 + 'px';
    mouseCircle.style.left = e.pageX - mouseCircle.offsetHeight / 2 + 'px';

    // высчитываем координаты курсора относительно верхнего левого угла картинки
    let coords = getCoords(img);
    let shiftX = e.pageX - coords.left;
    let shiftY = e.pageY - coords.top;

    // присваиваем атрибуты в переменные
    let x = +img.getAttribute('x');
    let y = +img.getAttribute('y');

    // меняем их относительно начального положения курсора (при mousedown)
    x += shiftX - startShiftX;
    y += shiftY - startShiftY;

    // определяем крайние точки, за которые не может уползать кратинка
    let currMaxX = startImgX - (startImgWidth - clipWidth);
    if (val !== 1) currMaxX = startImgX - (newImgWidth - clipWidth);
    let currMaxY = startImgY - (startImgHeight - clipHeight);
    if (val !== 1) currMaxY = startImgY - (newImgHeight - clipHeight);

    // не даём картинке уползать за границы clipPath
    if (x > startImgX) x = startImgX;
    if (x < currMaxX) x = currMaxX;
    if (y > startImgY) y = startImgY;
    if (y < currMaxY) y = currMaxY;

    // двигаем картинку
    img.setAttribute('x', x);
    img.setAttribute('y', y);

    // сохраняем переменные в localStorage
    localStorage.setItem('x', x);
    localStorage.setItem('y', y);
  }

  // функция поиска координат
  function getCoords(elem) {
    let box = elem.getBoundingClientRect();
    return {
      top: box.top,
      left: box.left,
    };
  }
};
