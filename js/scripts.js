window.onload = function() {
  //console.log('страница загружена' + JSON.stringify(document.querySelector('.form__button')));
  document.querySelector('.form__button').addEventListener("click", formSubmit);
  widget = document.querySelector('.rts-widget__header') //находим наш виджет
  parentWrapper = widget.parentNode;
  while ((!parentWrapper.classList.contains("cmsmasters_row")) && (parentWrapper.nodeName != 'BODY')) { //находим родительский элемент с классом cmsmasters_row
    parentWrapper = parentWrapper.parentNode;
  }
  if (parentWrapper.nodeName != 'BODY') { // и корректируем ему значение z-index
    parentWrapper.style.zIndex = "1";
  }
  window.addEventListener("resize", pageResize);
  document.addEventListener("click", function() {
    clickDetect(event);
  });
  flatpickr(".form__input_date", {
    "locale": "ru",
    "minDate": "today",
    "maxDate": new Date().fp_incr(45),
    "defaultDate": "today",
    "dateFormat": "d-m-Y",
    "disableMobile": "true"
  });
  pageResize();
}

// autocomplet : this function will be executed every time we change the text
function autocomp(obj) { //Функция для автозаполнения станций
  var min_length = 2; // min caracters to display the autocomplete
  var keyword = obj.value;
  station_list = obj.parentNode.getElementsByTagName("ul")[0]; //находим  список станций ul
  //console.log("next obj" + obj.nextElementSibling);
  if (keyword.length >= min_length) { //если поле не пустое или не собержит только один пробел
    if (keyword != ' ') {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'suggestStations.php', true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      f_keyword = encodeURI(keyword);
      var request_body = "keyword=" + f_keyword;
      xhr.send(request_body);
      xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        // по окончании запроса доступны:
        // status, statusText
        // responseText, responseXML (при content-type: text/xml)
        if (this.status != 200) {
          // обработать ошибку
          alert('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'));
          return;
        }
        if (this.responseText != "") {
          if (!station_list.classList.contains("form__stations-list_active")) { //добавляем флаг вилимости, если не установлен
            station_list.classList.add("form__stations-list_active");
          }
          station_list.innerHTML = this.responseText;
        }
        else {
          if (station_list.classList.contains("form__stations-list_active")) { //убираем флаг видимости, если вбито меньше двух букв
            station_list.classList.remove("form__stations-list_active");
          }
        }
        // console.log("Ответ сервера:" + this.responseText); // получить результат из this.responseText или this.responseXML
      }

    }
    else {
      if (station_list.classList.contains("form__stations-list_active")) { //убираем флаг видимости, если вбито меньше двух букв
        station_list.classList.remove("form__stations-list_active");
      }
    }
  }
}

function set_item(obj, station_id, station_name) {
  inputField = (obj.parentNode).parentNode.getElementsByTagName("input")[0];
  inputField.setAttribute('value', station_name);
  inputField.value = station_name;
  inputField.setAttribute('data-station-id', station_id);
  if (station_list.classList.contains("form__stations-list_active")) { //убираем флаг видимости, если вбито меньше двух букв
    station_list.classList.remove("form__stations-list_active");
  }
}

function pageResize() { //подстраиваем ширину календаря под ширину поля ввода даты при малой ширине экрана
  console.log("__pageResize");
  defaultWidth = 272; // ширина календаря по умолчанию
  pageWidth = document.documentElement.clientWidth; //обновляем значение ширины страницы
  if (pageWidth < 421) {
    dataFieldWidth = document.querySelector('.form__field-wrapper').offsetWidth;
    if (dataFieldWidth > 272) {
      console.log("мобильный режим, ширина:", dataFieldWidth);
      document.querySelector('.flatpickr-calendar').style.width = dataFieldWidth + 'px';
      document.querySelector('.flatpickr-days').style.width = dataFieldWidth + 'px';
      document.querySelector('.dayContainer').style.width = dataFieldWidth + 'px';
      document.querySelector('.dayContainer').style.maxWidth = dataFieldWidth + 'px';
    }
  }
  else {
    document.querySelector('.flatpickr-calendar').style.width = defaultWidth + 'px';
    document.querySelector('.flatpickr-days').style.width = defaultWidth + 'px';
    document.querySelector('.dayContainer').style.width = defaultWidth + 'px';
    document.querySelector('.dayContainer').style.maxWidth = defaultWidth + 'px';
  }
}

function formSubmit() {
  // console.log('__formSubmit:');
  // console.log('кнопка нажата');
  //проверяем заполнена ли форма
  var formInputList = document.getElementsByClassName('form__input'); //получаем список всех inputов формы элементов (будет корректно только при наличии одной формы на странице)
  var mySearchForm = document.forms.searchform;
  var fromField = mySearchForm.elements.startlocation.getAttribute('data-station-id');
  var fromName = mySearchForm.elements.startlocation.value;
  var toField = mySearchForm.elements.endlocation.getAttribute('data-station-id');
  var toName = mySearchForm.elements.endlocation.value;
  var dateField = mySearchForm.elements.jorneydate.value;
  var searchResult = document.querySelector('.search-result');
  formComplited = false;
  if ((fromField !== "") && (toField !== "")) {
    formComplited = true;
    // console.log("так то лучше");
  }

  if (formComplited) {
    console.time("Очищаем search-result за");
    searchResult.innerHTML = ""; //обнуляем прошлые результаты, если есть
    console.timeEnd("Очищаем search-result за");
    //добавляем сообщение о загрузке
    var msgWrapper = document.createElement('div');
    msgWrapper.className = "loading";
    searchResult.appendChild(msgWrapper);
    var msgImg = document.createElement('img');
    msgImg.className = "loading__image";
    msgImg.setAttribute("src", "img/loader.gif");
    msgImg.setAttribute("alt", "Производится поиск поездов...");
    msgWrapper.appendChild(msgImg);
    var msgText = document.createElement('p');
    msgText.className = "loading__text"
    msgText.innerHTML = "Поиск..."
    msgWrapper.appendChild(msgText);
    console.time("Execution time took");
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'metaTimetable.php', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    var request_body = "StartStationId=" + fromField + "&StartStationName=" + fromName + "&EndStationId=" + toField + "&EndStationName=" + toName + "&DateJorney=" + dateField;
    xhr.send(request_body);
    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      // по окончании запроса доступны:
      // status, statusText
      // responseText, responseXML (при content-type: text/xml)
      if (this.status != 200) {
        // обработать ошибку
        alert('ошибка: ' + (this.status ? this.statusText : 'запрос не удался'));
        return;
      }
      searchResult.removeChild(msgWrapper); //убираем сообщение о загрузке
      searchResult.innerHTML = this.responseText;
      console.timeEnd("Execution time took");
    }
  }
  else {
    searchResult.innerHTML = ""; //обнуляем прошлые результаты, если есть
    var msgWrapper = document.createElement('div'); //выводим сообщение об ошибке
    msgWrapper.className = "warning";
    searchResult.appendChild(msgWrapper);
    var msgImg = document.createElement('img');
    msgImg.className = "warning__image";
    msgImg.setAttribute("src", "img/warning-icon.png");
    msgImg.setAttribute("alt", "Ошибка");
    msgWrapper.appendChild(msgImg);
    var msgText = document.createElement('div');
    msgText.className = "warning__message"
    msgText.innerHTML = "По вашему запросу поезда не найдены.</br>Измените название станций или дату, затем повторите поиск."
    msgWrapper.appendChild(msgText);
  }
}

function clickDetect(e) {
  // console.log('кликнули!');
  stationLists = document.getElementsByClassName('form__stations-list');
  for (i = 0; i < stationLists.length; ++i) { //перебераем все меню со списком станций
    if (stationLists[i].classList.contains("form__stations-list_active")) {
      stationLists[i].querySelector('.form__stations-list-item').click();
    }
  }
}

function trainSelect(obj, trainType) {
  var trainCard = obj.closest(".train-card");
  var trainNumber = trainCard.querySelector('.train-card__train-number').innerHTML.split('<')[0]; //обрезаем номер поезда до названия
  var fromName = trainCard.querySelector('.train-card__dep-info').getAttribute('data-name-from');
  var fromId = trainCard.querySelector('.train-card__dep-info').getAttribute('data-id-from');
  var toName = trainCard.querySelector('.train-card__arr-info').getAttribute('data-name-to');
  var toId = trainCard.querySelector('.train-card__arr-info').getAttribute('data-id-to');
  var date = trainCard.querySelector('.train-card__date').getAttribute('data-train-date');
  var fromCode = trainCard.querySelector('.train-card__station').getAttribute('data-code-from');
  var toCode = trainCard.getElementsByClassName('train-card__station')[1].getAttribute('data-code-to');
  var minPrice = trainCard.querySelector('.train-card__min-price').firstElementChild.innerHTML;
  var t = trainCard.getElementsByClassName('train-card__train-type').length;
  var clases = "";
  if (trainType == null) {
    for (var i = 0; i < t; ++i) {
      clases = clases + "&classes%5B" + i + "%5D=" + trainCard.getElementsByClassName('train-card__train-type')[i].getAttribute('data-train-type');
      //  console.log(t+" - "+clases);
    }
  }
  else {
    clases = "&classes%5B0%5D=" + trainType;
  }
  marker = "&scp=60,affiliate,XXXX-XXXXX-X-X"; //взамен XXXX-XXXXX-X-X добавляем свой маркер
  link = "https://www.onetwotrip.com/ru/poezda/train/" + "?fromName=" + fromName + "&toName=" + toName + "&train=" + trainNumber + "&from=" + fromCode + "&to=" + toCode + clases + "&minCost=" + minPrice + "&metaTo=" + toId + "&metaFrom=" + fromId + "&date=" + date + marker;
  window.open(link);
}
