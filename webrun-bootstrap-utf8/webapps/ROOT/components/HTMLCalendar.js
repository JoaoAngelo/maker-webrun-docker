/**
 * Método construtor do HTMLCalendar. Responsável por criar o componente Calendário.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente.
 **/
function HTMLCalendar(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);

  this.selectedDate = null;
  this.selectedTime = null;

  this.hoveredDate = null;
  this.hoveredTime = null;

  this.selectedDateTime = null;

  // Verificar se é mobile.
  this.mobile = isMobile();

  // Obter o formato da data do formulário.
  if (mainform && mainform.DATE_PATTERN) {
    this.dateTimeFormat = mainform.DATE_PATTERN.toUpperCase() + " " + mainform.TIME_PATTERN;
    this.dateFormat = mainform.DATE_PATTERN.toUpperCase();
    this.timeFormat = mainform.TIME_PATTERN;
  } else {
    // Não encontrado, utilizar o formato UTC.
    this.dateTimeFormat = utcDateFormat + " " + utcTimeFormat;
    this.dateFormat = utcDateFormat;
    this.timeFormat = utcTimeFormat;
  }
}

/**
 * Herança do objeto.
 **/
HTMLCalendar.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLCalendar.prototype.name = 'HTMLCalendar';
HTMLCalendar.prototype.tabable = true;

HTMLCalendar.prototype.instance = HTMLCalendar;

HTMLCalendar.prototype.utcDateFormat = 'YYYY-MM-DD';
HTMLCalendar.prototype.utcTimeFormat = 'HH:mm:ss';

HTMLCalendar.prototype.requestDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';

/**
 * Responsável por desenhar o HTML do componente Calendário.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLCalendar.prototype.designComponent = function(doc) {
  // Obter propriedades do componente e dar parse nelas.
  if (this.Navegacao && this.Navegacao.length) {
    this.navigation = (this.Navegacao.toLowerCase() == "true");
  } else this.navigation = true;

  if (this.Editavel && this.Editavel.length) {
    this.editable = (this.Editavel.toLowerCase() == "true");
  } else this.editable = true;

  if (this.ExibirNumerosDosDias && this.ExibirNumerosDosDias.length) {
    this.weekNumbers = (this.ExibirNumerosDosDias.toLowerCase() == "true");
  } else this.weekNumbers = true;

  if (this.ExibirBotaoHoje && this.ExibirBotaoHoje.length) {
    this.showTodayButton = (this.ExibirBotaoHoje.toLowerCase() == "true");
  } else this.showTodayButton = true;

  if (this.ExibirTitulo && this.ExibirTitulo.length) {
    this.showCalendarTitle = (this.ExibirTitulo.toLowerCase() == "true");
  } else this.showCalendarTitle = true;

  if (this.DestacarHorarioComercial && this.DestacarHorarioComercial.length) {
    this.businessHours = (this.DestacarHorarioComercial.toLowerCase() == "true");
  } else this.businessHours = true;

  if (this.DestacarDiaAtual && this.DestacarDiaAtual.length) {
    this.nowIndicator = (this.DestacarDiaAtual.toLowerCase() == "true");
  } else this.nowIndicator = true;

  if (this.PermitirAlterarModoDeVisualizacao && this.PermitirAlterarModoDeVisualizacao.length) {
    this.canChangeViewMode = (this.PermitirAlterarModoDeVisualizacao.toLowerCase() == "true");
  } else this.canChangeViewMode = true;

  if (this.MenuDeContexto && this.MenuDeContexto.length) {
    this.hasDropdownMenu = (this.MenuDeContexto.toLowerCase() == "true");
  } else this.hasDropdownMenu = true;

  if (this.ModoDeVisualizacao && this.ModoDeVisualizacao.length) {
    switch (this.ModoDeVisualizacao) {
      case "1": this.defaultView = "dayGridMonth"; break;
      case "2": this.defaultView = "timeGridWeek"; break;
      case "3": this.defaultView = "timeGridDay"; break;
      default: this.defaultView = "dayGridMonth"; break;
    }
  } else this.defaultView = "dayGridMonth";

  // Criar a div do calendário
  this.calendarDiv = document.createElement("div");
  this.context.appendChild(this.calendarDiv);

  // Importar o moment.js
  webrun.include("assets/moment.min.js");

  // Importar o CSS do Bootstrap Datetimepicker
  if (!document.getElementById("datetimepicker-css")) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'assets/bootstrap-datetimepicker.min.css';
    link.id = 'datetimepicker-css';
    head.appendChild(link);
  }

  // Importar o script do Bootstrap Datetimepicker
  webrun.include("assets/bootstrap-datetimepicker.min.js");

  // Importar o CSS do FullCalendar
  if (!document.getElementById("fullcalendar-css")) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'components/fullcalendar/core/main.min.css';
    link.id = 'fullcalendar-css';
    head.appendChild(link);
  }

  if (!document.getElementById("fullcalendar-bootstrap-css")) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'components/fullcalendar/bootstrap/main.min.css';
    link.id = 'fullcalendar-bootstrap-css';
    head.appendChild(link);
  }

  if (!document.getElementById("fullcalendar-daygrid-css")) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'components/fullcalendar/daygrid/main.min.css';
    link.id = 'fullcalendar-daygrid-css';
    head.appendChild(link);
  }

  if (!document.getElementById("fullcalendar-timegrid-css")) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'components/fullcalendar/timegrid/main.min.css';
    link.id = 'fullcalendar-timegrid-css';
    head.appendChild(link);
  }

  // Importar o script do FullCalendar
  webrun.include("components/fullcalendar/core/main.min.js");
  webrun.include("components/fullcalendar/core/locales-all.min.js");

  // Plugins do Bootstrap e de interação
  webrun.include("components/fullcalendar/bootstrap/main.min.js");
  webrun.include("components/fullcalendar/interaction/main.min.js");

  // Plugins de views
  webrun.include("components/fullcalendar/daygrid/main.min.js");
  webrun.include("components/fullcalendar/timegrid/main.min.js");

  // Preparar o locale do calendário
  var definedLocale = resources_locale.toLowerCase();
  if (definedLocale == 'en_us') this.locale = 'en';
  else if (definedLocale == 'pt_br') this.locale = 'pt-br';
  else if (definedLocale == 'es_es') this.locale = 'es';
  else if (definedLocale == 'fr_fr') this.locale = 'fr';
  else this.locale = 'en';

  // Definir o locale do Moment
  moment.locale(this.locale);

  // Criar a instância do FullCalendar
  this.calendar = new FullCalendar.Calendar(this.calendarDiv, {
    // Definir os plugins
    plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'bootstrap' ],

    // Tema do Bootstrap
    themeSystem: 'bootstrap',

    // Visualização de dia e mês
    defaultView: this.defaultView,

    // Propriedades
    editable: this.canEdit(),
    eventLimit: true,
    eventResizableFromStart: this.canEditResizing(),
    eventStartEditable: this.canEditDragging(),
    eventDurationEditable: this.canEditResizing(),
    droppable: this.canEditDragging(),
    nowIndicator: this.nowIndicator,
    selectable: true,
    weekNumbers: this.weekNumbers,
    navLinks: this.canChangeViewMode ? true : false,
    businessHours: this.businessHours,
    height: this.height,
    titleRangeSeparator: " - ",

    // Propriedades da Toolbar
    header: (this.navigation ? {
      left: this.showTodayButton ? 'prev,next today' : 'prev,next',
      center: this.showCalendarTitle ? 'title' : '',
      right: this.canChangeViewMode ? 'dayGridMonth,timeGridWeek,timeGridDay' : ''
    } : false),

    // Definir o idioma
    locale: this.locale
  });

  // Associar eventos ao FullCalendar
  var object = this;
  this.calendar.on("select", function(info) { // Ocorre ao selecionar uma data
    object.selectDateAction(info);
  });

  this.calendar.on("dateClick", function(info) { // Ocorre ao clicar numa data
    // Verificar se o calendário possui o evento "Ao Clicar No Dia".
    if (object.AoClicarNoDia) {
      // Chamar o evento "Ao Clicar No Dia".
      object.AoClicarNoDia.call(this, moment(info.date).format(object.dateFormat));
    } else if (object.mobile) {
      object.addEventAction();
    }
  });

  this.calendar.on("datesRender", function(info) { // Ocorre ao atualizar/renderizar o calendário
    object.hoveredDate = null;
    object.hoveredTime = null;

    // Obter a data que está sendo exibida na view.
    var previousDate = object.currentDate, dateChanged = false;
    object.currentDate = info.view.props.dateProfile.currentRange.end;

    // Verificar se o ano atual no calendário mudou.
    if (previousDate && object.currentDate.getFullYear() != previousDate.getFullYear()) {
      dateChanged = true;

      // Verificar se o calendário possui o evento "Ao Modificar Ano".
      if (object.AoModificarAno) {
        object.AoModificarAno.call(object, object.currentDate.getFullYear());
      }
    }

    // Verificar se o mês atual no calendário mudou
    if (previousDate && object.currentDate.getMonth() != previousDate.getMonth()) {
      dateChanged = true;

      // Verificar se o calendário possui o evento "Ao Modificar Mês".
      if (object.AoModificarMes) {
        object.AoModificarMes.call(object, (object.currentDate.getMonth() + 1));
      }
    }

    // Verificar se o ano ou o mês atual no calendário mudou
    if (dateChanged) {
      object.updateData(); // Atualizar dados
    }

    // Associar eventos nas células dos dias.
    if (info.view.dayGrid) {
      var dayCells = info.el.querySelectorAll("td.fc-day, td.fc-day-top");
      for (var i = 0; i < dayCells.length; i++) {
        var dayCell = dayCells[i];

        // Adicionar evento de mouse enter/leave na célula do dia para guardar a data que o mouse está em cima.
        if (dayCell) {
          dayCell.onmouseenter = function(e) { // Ocorre quando o mouse entra na célula do dia.
            // Definir "hoveredDate" para a data desta célula.
            var date = e.target.getAttribute("data-date");
            if (date != null) object.hoveredDate = date;
          };

          dayCell.onmouseleave = function(e) { // Ocorre quando o mouse sai na célula do dia.
            var date = e.target.getAttribute("data-date");
            if (date != null && date == object.hoveredDate) object.hoveredDate = null;
          };
        }
      }
    }

    // Associar eventos nas células das horas.
    if (info.view.timeGrid) {
      var timeCells = info.view.timeGrid.slatEls;
      for (var i = 0; i < timeCells.length; i++) {
        var timeCell = timeCells[i];

        // Adicionar evento de mouse enter/leave na célula da hora para guardar o horário que o mouse está em cima.
        if (timeCell) {
          timeCell.onmouseenter = function(e) { // Ocorre quando o mouse entra na célula da hora
            // Definir "hoveredTime" para a data desta célula.
            var time = e.target.getAttribute("data-time");
            if (time != null) object.hoveredTime = time;
          };

          timeCell.onmouseleave = function(e) { // Ocorre quando o mouse sai na célula da hora
            var time = e.target.getAttribute("data-time");
            if (time != null && time == object.hoveredTime) object.hoveredTime = null;
          };
        }
      }
    }

    // Remover eventos do mouse no overlay
    var bgEvents = info.el.getElementsByClassName("fc-bgevent-skeleton");
    for (var i = 0; i < bgEvents.length; i++) {
      var bgEvent = bgEvents[i];
      if (bgEvent) bgEvent.style.pointerEvents = "none";
    }

    // Atualizar o tamanho do calendário.
    setTimeout(function() {
      object.calendar.updateSize();
    }, 500);

    // Atualizar o layout do calendário.
    object.updateLayout();
  });

  this.calendar.on("eventRender", function(info) { // Ocorre ao renderizar um evento
    info.el.onmouseenter = function(e) { // Ocorre quando o mouse entra na célula do evento
      // Definir "hoveredEvent" para o evento desta célula.
      object.hoveredEvent = info.event;
      object.lastHoveredEvent = object.hoveredEvent;
    };

    info.el.onmouseleave = function(e) { // Ocorre quando o mouse sai na célula do evento
      if (info.event == object.hoveredEvent) object.hoveredEvent = null;
    };

    // Verificar se o calendário possui ações nos eventos.
    if (object.hasActionInEvents()) {
      // Definir cursor ao evento.
      info.el.style.cursor = "pointer";
    }
  });

  this.calendar.on("eventDrop", function(info) { // Ocorre ao quando um evento é movido
    // Verificar se o calendário pode editar eventos movendo.
    if (object.canEditDragging()) {
      // Verificar se o calendário possui o evento "Ao Mover Evento".
      if (object.AoMoverEvento) {
        // Chamar o evento "Ao Mover Evento".
        object.AoMoverEvento.call(object, info.event);
      } else {
        // Editar evento.
        object.editEvent(info.event, info.event.title, info.event.start, info.event.end, 2);
      }
    }
  });

  this.calendar.on("eventResize", function(info) { // Ocorre ao quando um evento é redimensionado
    // Verificar se o calendário pode editar eventos redimensionando.
    if (object.canEditResizing()) {
      // Verificar se o calendário possui o evento "Ao Redimensionar Evento".
      if (object.AoRedimensionarEvento) {
        // Chamar o evento "Ao Mover Evento".
        object.AoRedimensionarEvento.call(object, info.event);
      } else {
        // Editar evento.
        object.editEvent(info.event, info.event.title, info.event.start, info.event.end, 2);
      }
    }
  });

  this.calendar.on("eventClick", function(info) { // Ocorre ao clicar no evento
    // Verificar se o calendário possui o evento "Ao Clicar no Evento".
    if (object.AoClicarNoEvento) {
      // Chamar o evento "Ao Clicar no Evento".
      object.AoClicarNoEvento.call(object, info.event);
    } else {
      // Criar o modal de editar evento.
      object.createEventModal(1, info.event.start, info.event.end, info.event.allDay, info.event);
    }
  });

  if (this.hasDropdownMenu) {
    // Criar menu dropdown do calendário.
    this.dropdownMenu = document.createElement("div");
    this.dropdownMenu.className = "dropdown-menu"; // Bootstrap
    this.dropdownMenu.id = "dropdown" + this.code + "-1";
    this.dropdownMenuClass = this.dropdownMenu.className;
    document.body.appendChild(this.dropdownMenu);

    // Criar título do dropdown do calendário.
    this.dropdownHeader = document.createElement("h6");
    this.dropdownHeader.className = "dropdown-header"; // Bootstrap
    this.dropdownHeader.innerHTML = getLocaleMessage("LABEL.CALENDAR");
    this.dropdownMenu.appendChild(this.dropdownHeader);

    // Criar item de atualizar calendário.
    this.dropdownRefresh = document.createElement("a");
    this.dropdownRefresh.href = "#";
    this.dropdownRefresh.className = "dropdown-item"; // Bootstrap
    this.dropdownRefresh.innerHTML = getLocaleMessage("LABEL.CALENDAR_UPDATE");
    this.dropdownMenu.appendChild(this.dropdownRefresh);
    this.attachEvent(this.dropdownRefresh, 'click', this.updateCalendarAction);

    // Criar item de ver eventos.
    this.dropdownViewEvents = document.createElement("a");
    this.dropdownViewEvents.href = "#";
    this.dropdownViewEvents.className = "dropdown-item"; // Bootstrap
    this.dropdownViewEvents.innerHTML = getLocaleMessage("LABEL.CALENDAR_VIEW_EVENTS");
    this.dropdownMenu.appendChild(this.dropdownViewEvents);
    this.attachEvent(this.dropdownViewEvents, 'click', this.viewEventsAction);

    if (this.editable) {
      // Criar item de adicionar evento.
      this.dropdownAddEvent = document.createElement("a");
      this.dropdownAddEvent.href = "#";
      this.dropdownAddEvent.className = "dropdown-item"; // Bootstrap
      this.dropdownAddEvent.innerHTML = getLocaleMessage("LABEL.CALENDAR_ADD_EVENT");
      this.dropdownMenu.appendChild(this.dropdownAddEvent);
      this.attachEvent(this.dropdownAddEvent, 'click', this.addEventAction);


      // Criar menu dropdown dos eventos.
      this.eventDropdownMenu = document.createElement("div");
      this.eventDropdownMenu.className = "dropdown-menu"; // Bootstrap
      this.eventDropdownMenu.id = "dropdown" + this.code + "-2";
      this.eventDropdownMenuClass = this.eventDropdownMenu.className;
      document.body.appendChild(this.eventDropdownMenu);

      // Criar título do dropdown dos eventos.
      this.eventDropdownHeader = document.createElement("h6");
      this.eventDropdownHeader.className = "dropdown-header"; // Bootstrap
      this.eventDropdownHeader.innerHTML = getLocaleMessage("LABEL.CALENDAR_EVENT");
      this.eventDropdownTimeSpan = document.createElement("span");
      this.eventDropdownTimeSpan.className = "badge badge-light";
      this.eventDropdownHeader.appendChild(this.eventDropdownTimeSpan);
      this.eventDropdownMenu.appendChild(this.eventDropdownHeader);

      // Criar item de editar evento.
      this.dropdownEditEvent = document.createElement("a");
      this.dropdownEditEvent.href = "#";
      this.dropdownEditEvent.className = "dropdown-item"; // Bootstrap
      this.dropdownEditEvent.innerHTML = getLocaleMessage("LABEL.CALENDAR_EDIT_EVENT");
      this.eventDropdownMenu.appendChild(this.dropdownEditEvent);
      this.attachEvent(this.dropdownEditEvent, 'click', this.editEventAction);

      // Criar item de deletar evento.
      this.dropdownDeleteEvent = document.createElement("a");
      this.dropdownDeleteEvent.href = "#";
      this.dropdownDeleteEvent.className = "dropdown-item"; // Bootstrap
      this.dropdownDeleteEvent.innerHTML = getLocaleMessage("LABEL.CALENDAR_DELETE_EVENT");
      this.eventDropdownMenu.appendChild(this.dropdownDeleteEvent);
      this.attachEvent(this.dropdownDeleteEvent, 'click', this.removeEventAction);
    }
  }

  // Criar o loader do calendário.
  this.preloaderDiv = document.createElement("div");
  this.preloaderDiv.className = "d-none"; // Bootstrap
  this.preloaderDivClass = "position-absolute w-100 h-100 d-flex align-items-center justify-content-center text-center"; // Bootstrap
  this.preloaderDiv.style.top = "0";
  this.preloaderDiv.style.zIndex = "2";
  this.div.appendChild(this.preloaderDiv);

  this.preloader = document.createElement("div");
  this.preloader.className = "spinner-border text-primary"; // Bootstrap
  this.preloader.setAttribute("role", "status");
  this.preloaderDiv.appendChild(this.preloader);

  var preloaderSpan = document.createElement("span");
  preloaderSpan.className = "sr-only"; // Bootstrap
  preloaderSpan.innerHTML = getLocaleMessage("LABEL.LOADING") + "...";
  this.preloader.appendChild(preloaderSpan);

  // Associar eventos ao div do calendário.
  this.attachEvent(this.div, 'contextmenu', this.contextMenuAction);
  this.attachEvent(this.calendarDiv, 'contextmenu', this.contextMenuAction);

  // Associar evento ao corpo da página.
  this.attachEvent(document.body, 'click', function() {
    if (object) object.closeDropdownMenu();
  });

  // Associar evento a div do calendário.
  this.attachEvent(this.div, 'click', function() {
    if (object) object.closeDropdownMenu();
  });

  // Associar evento de redimensionamento.
  this.attachEvent(window, 'resize', function() {
    if (object) object.updateLayout();
  });
};

/*
 * Ocorre quando o formulário termina de carregar.
 */
HTMLCalendar.prototype.onFormLoadAction = function() {
  // Atualiza o calendário
  if(!this.loaded)
    this.updateCalendarAction();

  this.loaded = true;
};

/*
 * Ocorre após a inicialização do componente.
 */
HTMLCalendar.prototype.afterInit = function() {
  this.callMethod(HTMLElementBase, "afterInit", []);

  // NOTA: O FullCalendar precisa que a div pai esteja visível para
  //       que ele seja renderizado. Portanto, devemos obter a aba
  //       do componente e registrar o evento "onshown".

  // Obter a aba relacionada a esse componente.
  if (this.tab) {
    var object = this;
    var shownCallback = function(tabPane) {
      // Desenhar o FullCalendar no formulário
      object.calendar.render();

      // Remover evento da aba, o FullCalendar não precisa ser mais renderizado.
      object.tab.removeShownListener(shownCallback);
    };

    // Adicionar callback a aba.
    this.tab.addShownListener(shownCallback);
  }

  // Aba não encontrada, desenhar o FullCalendar mesmo assim.
  this.calendar.render();
};

/*
 * Atualiza o layout no calendário.
 */
HTMLCalendar.prototype.updateLayout = function() {
  if (this.div.offsetWidth == 0) return false;
  try {
    // Obter elementos do calendário.
    var toolbarDiv = this.div.getElementsByClassName("fc-toolbar")[0];
    var toolbarRightDiv = toolbarDiv.getElementsByClassName("fc-right")[0];
    var calendarTitle = toolbarDiv.getElementsByTagName("h2")[0];
    var todayButton = toolbarDiv.getElementsByClassName("fc-today-button")[0];

    if (this.div.offsetWidth <= 330) calendarTitle.style.fontSize = "1.25rem";
    else if (this.div.offsetWidth <= 620) calendarTitle.style.fontSize = "1.5rem";
    else calendarTitle.style.fontSize = null;

    if (this.div.offsetWidth <= 300) calendarTitle.style.padding = "0.5rem";
    else calendarTitle.style.padding = null;

    if (this.div.offsetWidth <= 576) todayButton.style.display = "none";
    else todayButton.style.display = null;

    if (this.div.offsetWidth <= 520) toolbarRightDiv.style.display = "none";
    else toolbarRightDiv.style.display = null;
  } catch (e) { }
};

/*
 * Atualiza os dados no calendário.
 */
HTMLCalendar.prototype.updateData = function() {
  var object = this;
  var params = "";

  // Exibir preloader.
  this.showPreloader();

  // Obtem primeiro dia do mês corrente e último dia do mês corrente
  var y = this.calendar.view.currentStart.getFullYear();
  var m = this.calendar.view.currentStart.getMonth();
  var firstDay = new Date(y, m, 1, 0, 0, 0).toISOString();
  m = this.calendar.view.type == "timeGridWeek" ? this.calendar.view.currentEnd.getMonth() : m;
  var lastDay = new Date(y, m + 1, 0, 23, 59, 59).toISOString();

  if (d.t && d.t.dependences) {
    var components = d.t.dependences[this.code];
    if (components && components.length > 0) {
      for (var code in components) {
        if (isNumeric(code)) {
          var component = eval("$mainform().d.c_" + components[code]);
          if (component) {
            params += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), "GET"));
          }
        }
      }
    }
  }

  // Mandar pedido para o servidor para obter os dados do calendário no ano e mês atual.
  $.get(getAbsolutContextPath() + "componentData.do?action=componentData&sys=" + URLEncode(this.sys, 'GET') + "&formID=" + URLEncode(this.formID, 'GET') + "&comID=" + URLEncode(this.code, 'GET') +
    "&start=" + URLEncode(firstDay, "GET") +
    "&end=" + URLEncode(lastDay, "GET") + params,
    function(response) {
      // Utilizar função batchRendering para evitar que o calendário
      // seja renderizado novamente a cada operação de inserção.
      object.calendar.batchRendering(function() {
        // Limpar eventos na memória.
        object.clearEvents();

        // Verificar se possui eventos na resposta.
        if (response && response.events) {
          for (var i = 0; i < response.events.length; i++) {
            var event = response.events[i];
            object.addEvent(event.title, event.start, event.end, event.id, false, event.eventColor, event.textColor);
          }
        }

        // Verificar se possui feriados na resposta.
        if (response && response.holidays) {
          for (var i = 0; i < response.holidays.length; i++) {
            var holiday = response.holidays[i];
            var holidayDate = moment(holiday.date);

            // Adicionar evento ao calendário.
            object.calendar.addEvent({
              title: holiday.title,
              start: holidayDate.toISOString(),
              end: holidayDate.toISOString(),
              allDay: true,
              overlap: false,
              rendering: 'background',
              color: '#ff9f89'
            });
          }
        }
      });

      // Verificar se o evento "Ao Atualizar" foi associado.
      if (object.AoAtualizar !== undefined && object.AoAtualizar !== null) {
        // Chamar evento "Ao Atualizar".
        object.AoAtualizar.call(object);
      }

      // Esconder preloader.
      object.hidePreloader();
    }).fail(function() {
      // Esconder preloader.
      object.hidePreloader();
    });
};

/**
 * Obtém um valor lógico indicando se esse calendário possui um formulário de edição.
 **/
HTMLCalendar.prototype.hasEditForm = function() {
  return this.FormularioDeEdicao !== undefined && this.FormularioDeEdicao !== null && this.FormularioDeEdicao.length > 0;
};

/**
 * Obtém um valor lógico indicando se o calendário pode deletar eventos.
 **/
HTMLCalendar.prototype.canDelete = function() {
  return this.canEdit() && !this.hasEditForm();
};

/**
 * Obtém um valor lógico indicando se o calendário pode adicionar eventos.
 **/
HTMLCalendar.prototype.isEditViable = function() {
  return (!this.hasMoreTables && !this.hasEditForm()) ||
         (this.hasMoreTables && this.hasEditForm()) ||
         (!this.hasMoreTables && this.hasEditForm());
};

/**
 * Obtém um valor lógico indicando se o calendário pode adicionar eventos.
 **/
HTMLCalendar.prototype.canAdd = function() {
  return (this.editable && this.enabled && !this.readonly) && (
    (!this.hasMoreTables && !this.hasEditForm()) ||
    (this.hasMoreTables && this.hasEditForm()) ||
    (!this.hasMoreTables && this.hasEditForm())
  );
};

/**
 * Obtém um valor lógico indicando se o calendário pode editar eventos.
 **/
HTMLCalendar.prototype.canEdit = function() {
  return this.hasEventsIds && (this.editable && this.enabled && !this.readonly) && (
    (!this.hasMoreTables && !this.hasEditForm()) ||
    (this.hasMoreTables && this.hasEditForm()) ||
    (!this.hasMoreTables && this.hasEditForm())
  );
};

/**
 * Obtém um valor lógico indicando se o calendário pode editar eventos através do modal de edição.
 **/
HTMLCalendar.prototype.canEditViaModal = function() {
  return this.canEdit() && !this.hasMoreTables && !this.hasEditForm();
};

/**
 * Obtém um valor lógico indicando se o calendário pode editar eventos através da funcionalidade de arrastar e soltar.
 **/
HTMLCalendar.prototype.canEditDragging = function() {
  return this.canEditViaModal() || (this.AoMoverEvento !== undefined && this.AoMoverEvento !== null);
};

/**
 * Obtém um valor lógico indicando se o calendário pode editar eventos através da funcionalidade de redimensionar.
 **/
HTMLCalendar.prototype.canEditResizing = function() {
  return this.canEditViaModal() || (this.AoRedimensionarEvento !== undefined && this.AoRedimensionarEvento !== null);
};

/**
 * Obtém um valor lógico indicando se o calendário possui alguma ação nos eventos.
 **/
HTMLCalendar.prototype.hasActionInEvents = function() {
  return this.editable || (this.AoClicarNoEvento !== undefined && this.AoClicarNoEvento !== null);
};

/**
 * Limpa todos os eventos na memória do calendário.
 **/
HTMLCalendar.prototype.clearEvents = function() {
  var events = this.calendar.getEvents();
  if (events && events.length > 0) {
    for (var i = 0; i < events.length; i++) {
      events[i].remove();
    }
  }
};

/**
 * Executa o evento onclick do componente.
 **/
HTMLCalendar.prototype.click = function() {
  if (this.div.onclick) this.div.onclick.call(this);
};

/**
 * Ocorre quando o utilizador clica na div.
 **/
HTMLCalendar.prototype.clickAction = function(e) {
  // Fechar menu dropdown.
  this.closeDropdownMenu();
};

/**
 * Ocorre quando o utilizador seleciona uma data.
 * @param e - Objeto contendo as informações da data relacionada ao evento.
 **/
HTMLCalendar.prototype.selectDateAction = function(e) {
  var dateMoment = moment(e.start);
  var dateStr = dateMoment.format(this.utcDateFormat);
  var timeStr = dateMoment.format(this.utcTimeFormat);

  this.hoveredDate = dateStr;
  this.selectedDate = dateStr;

  this.hoveredTime = timeStr;
  this.selectedTime = timeStr;

  this.selectedDateTime = e.start;

  // Fechar menu dropdown.
  this.closeDropdownMenu();
};

/**
 * Ocorre quando o utilizador clica com o botão direito no calendário.
 **/
HTMLCalendar.prototype.contextMenuAction = function(e) {
  // Verificar se o calendário possui menu de contexto.
  if (this.hasDropdownMenu) {
    // Não abrir o menu de contexto do navegador.
    e.preventDefault();
    e.stopPropagation();
  }

  if (this.calendar) {
    // Selecionar a data da célula que o mouse está em cima.
    var targetDateTime = "";

    if (this.hoveredDate !== null) {
      targetDateTime += this.hoveredDate;
      this.selectedDate = this.hoveredDate;
    } else if (this.selectedDate !== null) {
      targetDateTime += this.selectedDate;
    }

    if (this.hoveredTime !== null) {
      targetDateTime += 'T' + this.hoveredTime;
      this.selectedTime = this.hoveredTime;
    } else if (this.selectedTime !== null) {
      targetDateTime += 'T' + this.selectedTime;
    }

    // Selecionar a data com foco.
    this.calendar.select(targetDateTime, targetDateTime);

    // Exibir menu dropdown específico ao item com foco.
    if (!this.editable || this.hoveredEvent == null) {
      // Exibir menu dropdown do calendário.
      this.openDropdownMenu(0, e.pageX, e.pageY);
    } else {
      // Definir evento selecionado.
      this.selectedEvent = this.hoveredEvent;

      // Exibir menu dropdown dos eventos
      this.openDropdownMenu(1, e.pageX, e.pageY);
    }
  }
};

/**
 * Abre o menu dropdown.
 * @param type Tipo do menu dropdown.
 * @param x Posição X para abrir o menu dropdown.
 * @param y Posição Y para abrir o menu dropdown.
 **/
HTMLCalendar.prototype.openDropdownMenu = function(type, x, y) {
  // Verificar se o calendário possui menu de contexto ativado.
  if (!this.hasDropdownMenu) return false;

  // Verificar se o calendário possui o evento "Ao Abrir Menu de Contexto".
  if (this.AoAbrirMenuDeContexto !== undefined && this.AoAbrirMenuDeContexto !== null) {
    return this.AoAbrirMenuDeContexto.call(this, type, x, y);
  }

  if (this.editable && type == 1) {
    if (this.eventDropdownMenu) {
      this.eventDropdownMenu.style.top = y + "px";
      this.eventDropdownMenu.style.left = x + "px";
      this.eventDropdownMenu.style.zIndex = 100001;
      this.eventDropdownMenu.className = this.eventDropdownMenuClass + " show";

      // Atualizar o span de data do evento.
      this.eventDropdownTimeSpan.innerHTML = this.selectedEvent ?
        moment(this.selectedEvent.start).format('L') : "(...)";

      // Verificar por estados do calendário e atualizar os itens.
      if (this.dropdownEditEvent) this.dropdownEditEvent.className =
        (!this.canEdit() || this.hoveredEvent == null) ?
        "dropdown-item disabled" : "dropdown-item"; // Bootstrap
      if (this.dropdownDeleteEvent) this.dropdownDeleteEvent.className =
        (!this.canDelete() || this.hoveredEvent == null) ?
        "dropdown-item disabled" : "dropdown-item"; // Bootstrap
    }
  } else {
    if (this.dropdownMenu) {
      this.dropdownMenu.style.top = y + "px";
      this.dropdownMenu.style.left = x + "px";
      this.dropdownMenu.style.zIndex = 100001;
      this.dropdownMenu.className = this.dropdownMenuClass + " show";

      // Verificar por estados do calendário e atualizar os itens.
      if (this.dropdownViewEvents) this.dropdownViewEvents.className =
        this.isTimeline() ? "dropdown-item disabled" : "dropdown-item"; // Bootstrap
      if (this.dropdownAddEvent) this.dropdownAddEvent.className =
        !this.canAdd() ? "dropdown-item disabled" : "dropdown-item"; // Bootstrap
    }
  }
};

/**
 * Fecha o menu dropdown.
 **/
HTMLCalendar.prototype.closeDropdownMenu = function() {
  if (!this.hasDropdownMenu) return false;

  // Verificar se o calendário possui o evento "Ao Fechar Menu de Contexto".
  if (this.AoFecharMenuDeContexto !== undefined && this.AoFecharMenuDeContexto !== null) {
    return this.AoFecharMenuDeContexto.call(this);
  }

  if (this.dropdownMenu) {
    this.dropdownMenu.style = "";
    this.dropdownMenu.className = this.dropdownMenuClass;
  }

  if (this.eventDropdownMenu) {
    this.eventDropdownMenu.style = "";
    this.eventDropdownMenu.className = this.eventDropdownMenuClass;
  }
};

/**
 * Exibe o preloader do calendário.
 **/
HTMLCalendar.prototype.showPreloader = function() {
  if (this.preloaderDiv) this.preloaderDiv.className = this.preloaderDivClass;
};

/**
 * Oculta o preloader do calendário.
 **/
HTMLCalendar.prototype.hidePreloader = function() {
  if (this.preloaderDiv) this.preloaderDiv.className = "d-none";
};

/**
 * Retorna um boolean indicando se a view atual é a de linha do tempo.
 **/
HTMLCalendar.prototype.isTimeline = function() {
  return this.calendar && this.calendar.view && this.calendar.view.type == "timeGridDay";
};

/**
 * Abrir a view linha do tempo.
 * @param date A data para abrir a linha do tempo. Se for nula, irá utilizar a data selecionada.
 **/
HTMLCalendar.prototype.openTimeline = function(date) {
  if (this.calendar) this.calendar.changeView("timeGridDay", date ? date : this.selectedDate);
  this.closeDropdownMenu();
};

/*
 * Ocorre quando algum componente que é dependência desse muda de valor
 */
HTMLCalendar.prototype.refresh = function() {
  this.updateCalendarAction();
};

/**
 * Ocorre ao clicar no item de atualizar calendário.
 **/
HTMLCalendar.prototype.updateCalendarAction = function() {
  this.updateData();
  this.closeDropdownMenu();
};

/**
 * Ocorre ao clicar no item de ver compromissos.
 **/
HTMLCalendar.prototype.viewEventsAction = function() {
  this.openTimeline();
};

/**
 * Verificar a resposta do servidor.
 * @param response Resposta do servidor.
 **/
HTMLCalendar.prototype.checkServerResponse = function(response) {
  try {
    if (response && response.length > 0) {
      // Dar parse no JSON retornado pelo servidor.
      response = JSON.parse(response);

      // Verificar se a operação falhou.
      if (response.success === "0") {
        // Exibir uma mensagem de erro.
        interactionError(safeGetLocaleMessage("ERROR.OPERATION_ERROR"), null, null, null, response.details ? response.details : null);
        return false;
      }
    }
  } catch (e) { }
  return true;
};

/**
 * Adiciona um evento ao calendário.
 * @param title Título/Descrição do evento.
 * @param start Data inicial do evento.
 * @param end Data final do evento.
 * @param save Salvar no banco de dados.
 **/
HTMLCalendar.prototype.addEvent = function(title, start, end, id, save, color, textColor) {
  var object = this;
  var eventStart = moment(start);
  var eventEnd = end ? moment(end) : null;
  var allDay = (end === undefined || end === null ||
    (eventStart.hour() == 0 && eventStart.minute() == 0 && eventStart.second() == 0 &&
     eventEnd.hour() == 0 && eventEnd.minute() == 0 && eventEnd.second() == 0));

  // Adicionar evento ao calendário.
  this.calendar.addEvent({
    id: id,
    title: title,
    start: eventStart.toISOString(),
    end: eventEnd ? eventEnd.toISOString() : eventStart.toISOString(),
    allDay: allDay,
    backgroundColor : color,
    textColor: textColor
  });

  if (save && this.editable) {
    // Exibir preloader.
    this.showPreloader();

    // Enviar pedido para o servidor para adicionar o evento.
    this.sendRequest("a", null, {
      title: title,
      start: eventStart.toDate().format(this.requestDateTimeFormat),
      end: (eventEnd === undefined || eventEnd === null) ?
        eventStart.toDate().format(this.requestDateTimeFormat) :
        eventEnd.toDate().format(this.requestDateTimeFormat),
      allDay: allDay
    }, function(response) {
      // Verificar a resposta do servidor.
      object.checkServerResponse(response);

      // Atualizar dados do calendário.
      object.updateData();
    }, function() {
      // Esconder preloader.
      object.hidePreloader();
    });
  }
};

/**
 * Edita um evento do calendário.
 * @param event Instância do evento.
 * @param title Título/Descrição do evento.
 * @param start Data inicial do evento.
 * @param end Data final do evento.
 **/
HTMLCalendar.prototype.editEvent = function(event, title, start, end, save) {
  var object = this;

  var eventStart = moment(start);
  var eventEnd = end ? moment(end) : null;
  var allDay = (end === undefined || end === null ||
    (eventStart.hour() == 0 && eventStart.minute() == 0 && eventStart.second() == 0 &&
     eventEnd.hour() == 0 && eventEnd.minute() == 0 && eventEnd.second() == 0));

  if (save != 2) {
    event.setStart(start);
    event.setEnd(end);
    event.setAllDay(allDay);
    event.setProp('title', title);
  }

  if (save >= 1 && this.editable) {
    // Exibir preloader.
    this.showPreloader();

    // Enviar pedido ao servidor para editar o evento no banco de dados.
    this.sendRequest("e", null, {
      id: event.id,
      title: title,
      start: eventStart.toDate().format(this.requestDateTimeFormat),
      end: (eventEnd === undefined || eventEnd === null) ?
        eventStart.toDate().format(this.requestDateTimeFormat) :
        eventEnd.toDate().format(this.requestDateTimeFormat),
      allDay: allDay
    }, function(response) {
      // Verificar a resposta do servidor.
      object.checkServerResponse(response);

      // Atualizar dados do calendário.
      object.updateData();
    }, function() {
      // Esconder preloader.
      object.hidePreloader();
    });
  }
};

/**
 * Deleta um evento do calendário.
 * @param event Instância do evento.
 **/
HTMLCalendar.prototype.removeEvent = function(event) {
  var object = this;

  if (this.editable) {
    // Enviar pedido ao servidor para remover o evento do banco de dados.
    this.sendRequest("d", null, {
      id: event.id,
      title: event.title
    }, function(response) {
      // Verificar a resposta do servidor.
      object.checkServerResponse(response);

      // Atualizar dados do calendário.
      object.updateData();
    }, function() {
      // Esconder preloader.
      object.hidePreloader();
    });
  } else {
    // Remover evento.
    event.remove();
  }
};

/**
 * Ocorre ao clicar no item de adicionar evento.
 **/
HTMLCalendar.prototype.addEventAction = function() {
  // Fechar menu dropdown.
  this.closeDropdownMenu();
  if (!this.editable) return;

  // Criar o modal de adicionar evento.
  this.createEventModal(0, this.selectedDateTime, this.isTimeline() ? this.selectedDateTime : null);
};

/**
 * Ocorre ao clicar no item de editar evento.
 **/
HTMLCalendar.prototype.editEventAction = function() {
  // Fechar menu dropdown.
  this.closeDropdownMenu();
  if (!this.editable) return false;

  // Criar o modal de editar evento.
  this.createEventModal(1, this.lastHoveredEvent.start, this.lastHoveredEvent.end, this.lastHoveredEvent.allDay, this.lastHoveredEvent);
};

/**
 * Cria um modal para adicionar/editar eventos.
 **/
HTMLCalendar.prototype.createEventModal = function(type, startDate, endDate, allDay, event) {
  var object = this;

  // Verificar se o calendário possui formulário de edição.
  if (this.hasEditForm()) {
    let url = getAbsolutContextPath() 
        + "componentData.do?action=componentData&sys=" + URLEncode(this.sys, 'GET') 
        + "&formID=" + URLEncode(this.formID, 'GET') 
        + "&comID=" + URLEncode(this.code, 'GET');

    if (type == 0) url+= "&type=a"// Adicionar Evento
    else if (type == 1) url+= "&req=" + URLEncode(event.id, 'GET') + "&type=e"// Editar evento

    getAndEvalSync2(url);
  } else if (this.canEditViaModal()) {
    // Criar o modal de adicionar evento.
    var modal = ebfBootstrapCreateModal(
      !this.editable ? getLocaleMessage("LABEL.CALENDAR_EVENT") :
      type == 0 ? getLocaleMessage("LABEL.CALENDAR_ADD_EVENT") :
      getLocaleMessage("LABEL.CALENDAR_EDIT_EVENT"),
      true, null, null, null, document.body);

    // Obter elementos do modal.
    var modalDiv = modal[0];
    var modalBody = modal[2];
    var modalFooter = modal[3];

    // Criar row de data do evento.
    var dateRow = document.createElement("div");
    dateRow.className = "form-row"; // Bootstrap
    modalBody.appendChild(dateRow);

    var dateRowCol1 = document.createElement("div");
    dateRowCol1.className = "col-6"; // Bootstrap
    dateRow.appendChild(dateRowCol1);

    var dateRowCol2 = document.createElement("div");
    dateRowCol2.className = "col-6"; // Bootstrap
    dateRow.appendChild(dateRowCol2);

    // Criar input da data inicial.
    var dateStartLabel = document.createElement("label");
    dateStartLabel.setAttribute("for", modalDiv.id + "-date-start");
    dateStartLabel.innerHTML = getLocaleMessage("LABEL.CALENDAR_DATE_START");
    dateRowCol1.appendChild(dateStartLabel);

    var dateStartInput = document.createElement("input");
    dateStartInput.type = "text";
    dateStartInput.className = "form-control"; // Bootstrap
    dateStartInput.id = modalDiv.id + "-date-start";
    dateStartInput.setAttribute("placeholder", getLocaleMessage("LABEL.CALENDAR_DATE_START"));
    dateStartInput.readOnly = !this.editable;
    dateRowCol1.appendChild(dateStartInput);

    // Criar checkbox da data final.
    var dateEndCheckboxDiv = document.createElement("div");
    dateEndCheckboxDiv.className = "custom-control custom-checkbox mb-2"; // Bootstrap
    dateRowCol2.appendChild(dateEndCheckboxDiv);

    var dateEndCheckboxInput = document.createElement("input");
    dateEndCheckboxInput.type = "checkbox";
    dateEndCheckboxInput.className = "custom-control-input"; // Bootstrap
    dateEndCheckboxInput.id = modalDiv.id + "-date-end-checkbox";
    dateEndCheckboxInput.checked = (startDate != endDate && (endDate != null || allDay === false));
    dateEndCheckboxInput.disabled = !this.editable;
    dateEndCheckboxDiv.appendChild(dateEndCheckboxInput);

    var dateEndLabel = document.createElement("label");
    dateEndLabel.className = "custom-control-label"; // Bootstrap
    dateEndLabel.setAttribute("for", modalDiv.id + "-date-end-checkbox");
    dateEndLabel.innerHTML = getLocaleMessage("LABEL.CALENDAR_DATE_END");
    dateEndLabel.style.overflow = "visible";
    dateEndCheckboxDiv.appendChild(dateEndLabel);

    // Criar input da data final.
    var dateEndInput = document.createElement("input");
    dateEndInput.type = "text";
    dateEndInput.className = "form-control"; // Bootstrap
    dateEndInput.id = modalDiv.id + "-date-end";
    dateEndInput.setAttribute("placeholder", getLocaleMessage("LABEL.CALENDAR_DATE_END"));
    dateEndInput.readOnly = !this.editable || !dateEndCheckboxInput.checked;
    dateRowCol2.appendChild(dateEndInput);

    if (this.editable) {
      // Inicializar o datetimepicker
      var datetimepickerprops = {
        // Definir a data inicial
        date: moment(startDate),

        // Idioma do datetimepicker
        locale: this.locale,

        // Formato da data
        format: this.dateTimeFormat,

        // Não exibir o datetimepicker quando o input for somente leitura
        ignoreReadonly: false,

        // Exibir o botão para definir a data para o dia atual
        showTodayButton: true,

        // Exibir o datetimepicker quando o input receber foco
        allowInputToggle: true
      };

      $(dateStartInput).datetimepicker(datetimepickerprops);

      if (endDate != null) datetimepickerprops.date = moment(endDate);
      $(dateEndInput).datetimepicker(datetimepickerprops);
    } else {
      dateStartInput.value = moment(startDate).format(dateTimeFormat);
      dateEndInput.value = endDate == null ? dateStartInput.value : moment(endDate).format(dateTimeFormat);
    }

    // Criar input de descrição do evento.
    var descriptionFormGroup = document.createElement("div");
    descriptionFormGroup.className = "mt-3"; // Bootstrap
    modalBody.appendChild(descriptionFormGroup);

    var descriptionLabel = document.createElement("label");
    descriptionLabel.setAttribute("for", modalDiv.id + "-description");
    descriptionLabel.innerHTML = getLocaleMessage("LABEL.DESCRIPTION") + ":";
    descriptionFormGroup.appendChild(descriptionLabel);

    var descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.className = "form-control"; // Bootstrap
    descriptionInput.id = modalDiv.id + "-description";
    if (event && event.title) descriptionInput.value = event.title;
    descriptionInput.setAttribute("placeholder", getLocaleMessage("LABEL.DESCRIPTION"));
    descriptionInput.readOnly = !this.editable;
    descriptionFormGroup.appendChild(descriptionInput);


    // Criar botões do modal.
    var cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "btn btn-secondary float-right"; // Bootstrap
    cancelButton.innerHTML = this.editable ? getLocaleMessage("LABEL.CANCEL") : getLocaleMessage("LABEL.CLOSE");
    cancelButton.setAttribute("data-dismiss", "modal"); // Bootstrap
    modalFooter.appendChild(cancelButton);

    if (this.editable) {
      if (type == 1) {
        var removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "btn btn-danger float-right"; // Bootstrap
        removeButton.innerHTML = getLocaleMessage("LABEL.DELETE");
        modalFooter.appendChild(removeButton);

        // Associar evento de clique ao botão.
        removeButton.onclick = function() {
          object.removeEvent(event);
          cancelButton.click();
        };
      }

      var addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "btn btn-primary float-right mr-2"; // Bootstrap
      if (!event || event.title.length == 0) addButton.setAttribute("disabled", "disabled");
      addButton.innerHTML = type == 0 ? getLocaleMessage("LABEL.ADD") : getLocaleMessage("LABEL.EDIT");
      modalFooter.appendChild(addButton);

      // Associar evento de clique ao botão.
      addButton.onclick = function() {
        if (type == 0) { // Adicionar evento.
          object.addEvent(descriptionInput.value,
            $(dateStartInput).datetimepicker('viewDate').format(object.utcDateFormat + " " + object.utcTimeFormat),
            $(dateEndInput).datetimepicker('viewDate').format(object.utcDateFormat + " " + object.utcTimeFormat), null, true);
        } else if (type == 1) { // Editar evento.
          object.editEvent(event, descriptionInput.value,
            $(dateStartInput).datetimepicker('viewDate').format(object.utcDateFormat + " " + object.utcTimeFormat),
            $(dateEndInput).datetimepicker('viewDate').format(object.utcDateFormat + " " + object.utcTimeFormat), 1);
        }

        // Fechar o modal.
        ebfBootstrapCloseModal(modalDiv);
      };

      // Associar evento para teclas de atalho.
      var shortcutKeysEvent = function(e) {
        if (e.key === 'Enter' || e.which === 13) addButton.click();
        else if (e.key === 'Escape' || e.which === 27) cancelButton.click();
      };

      dateStartInput.onkeydown = shortcutKeysEvent;
      dateEndInput.onkeydown = shortcutKeysEvent;
      descriptionInput.onkeydown = shortcutKeysEvent;
    }

    // Associar eventos aos elementos do modal.
    dateEndCheckboxInput.onchange = function() {
      dateEndInput.readOnly = !dateEndCheckboxInput.checked;
      if (!dateEndCheckboxInput.checked) {
        dateEndInput.value = dateStartInput.value;
        $(dateEndInput).datetimepicker("date", $(dateStartInput).datetimepicker("date"));
      }
    };

    descriptionInput.oninput = function() {
      if (this.value == null || this.value.length == 0) {
        var disabledAttr = addButton.getAttribute("disabled");
        if (disabledAttr == null || disabledAttr != "disabled") {
          addButton.setAttribute("disabled", "disabled");
        }
      } else {
        var disabledAttr = addButton.getAttribute("disabled");
        if (disabledAttr != null && disabledAttr.length > 0) {
          addButton.removeAttribute("disabled");
        }
      }
    };
  }
};

/**
 * Ocorre ao clicar no item de remover evento.
 **/
HTMLCalendar.prototype.removeEventAction = function() {
  // Fechar menu dropdown.
  this.closeDropdownMenu();
  if (!this.editable) return false;

  // Remover evento.
  this.removeEvent(this.selectedEvent);
  this.selectedEvent = null;
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para habilitar/desabilitar o componente.
 */
HTMLCalendar.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  this.updateCalendarEditable();
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para mostrar/ocultar o componente.
 */
HTMLCalendar.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  this.updateCalendarEditable();
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para ativar/desativar o modo somente leitura
 */
HTMLCalendar.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);
  this.updateCalendarEditable();
};

/**
 * Atualiza o estado de editável do calendário.
 */
HTMLCalendar.prototype.updateCalendarEditable = function() {
  if (this.calendar) {
    this.calendar.setOption("editable", this.editable && this.enabled && !this.readonly);
    this.calendar.setOption("eventStartEditable", this.editable && this.enabled && !this.readonly);
    this.calendar.setOption("eventDurationEditable", this.editable && this.enabled && !this.readonly);
  }
};

/**
 * Função responsável por retornar o Ano em que componente se encontra.
 * @returns Ano corrente.
 */
HTMLCalendar.prototype.getYear = function() {
  if (this.calendar) return this.calendar.getDate().getFullYear();
  return null;
};

/**
 * Função responsável por retornar o Mês em que componente se encontra.
 * @param monthName Mês por extenso?
 * @returns Mês corrente.
 */
HTMLCalendar.prototype.getMonth = function(monthName) {
  if (this.calendar) {
    if (parseBoolean(monthName)) return this.calendar.getDate().getMonthName();
    return (this.calendar.getDate().getMonth()+1); //Segue o padrão de [0-11];
  }

  return null;
};

/**
 * Função responsável por voltar o calendário para a data atual.
 */
HTMLCalendar.prototype.goToday = function() {
  if (this.calendar) this.calendar.today();
};

/**
 * Função responsável por incrementar um mês no calendário para a data atual.
 */
HTMLCalendar.prototype.nextMonth = function() {
  if (this.calendar) this.calendar.next();
};

/**
 * Função responsável por decrementar um mês no calendário para a data atual.
 */
HTMLCalendar.prototype.prevMonth = function() {
  if (this.calendar) this.calendar.prev();
};

/**
 * Essa função vai para o mês e ano informado por parâmetro.
 * @param month mês.
 * @param year ano.
 */
HTMLCalendar.prototype.goToMonth = function(month, year) {
  if (this.calendar) {
    let nDate = new Date();
    nDate.setDate(1);
    nDate.setMonth(month-1);
    nDate.setYear(year);
    nDate.setHours(0);
    nDate.setMinutes(0);
    nDate.setSeconds(0);
    nDate.setMilliseconds(0);
    this.calendar.gotoDate(nDate);
  }
};

/**
 * Função responsável por incrementar um ano no calendário para a data atual.
 */
HTMLCalendar.prototype.nextYear = function() {
  if (this.calendar) this.calendar.nextYear();
};

/**
 * Função responsável por decrementar um ano no calendário para a data atual.
 */
HTMLCalendar.prototype.prevYear = function() {
  if (this.calendar) this.calendar.prevYear();
};

/**
 * Função responsável por realizar as requisições para o servidor.
 * @param type Tipo da requisição:
 *   - Vazio para consultar eventos;
 *   - "a" para adicionar um evento;
 *   - "e" para editar um evento;
 *   - "d" para deletar um evento;
 * @param req ID do evento relacionado.
 * @param params Parâmetros adicionais do pedido.
 * @param cbSuccess Callback de sucesso.
 * @param cbError Callback de erro.
 */
HTMLCalendar.prototype.sendRequest = function(type, req, params, cbSuccess, cbError) {
  // Criar XHR para enviar a requisição.
  var xhr = new XMLHttpRequest();

  // Definir tipo e URL da conexão.
  xhr.open("POST", "componentData.do?action=componentData&sys=" + URLEncode(this.sys, 'GET') +
    "&formID=" + URLEncode(this.formID, 'GET') +
    "&comID=" + URLEncode(this.code, 'GET') +
    "&type=" + type +
    (req ? "&req=" + URLEncode(req, 'GET') : ""), true);

  // Definir Content-Type do pedido.
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  // Associar evento de sucesso.
  xhr.onload = function(e) {
    if (xhr.readyState === 4 || xhr.status === 200) {
      // Chamar callback de sucesso.
      if (cbSuccess) cbSuccess(xhr.responseText);
    }
  };

  // Associar evento de erro.
  xhr.onerror = function(e) {
    // Chamar callback de erro.
    if (cbError) cbError(e);

    // Exibir mensagem de falha de conexão.
    interactionError(safeGetLocaleMessage("ERROR.CONNECTION_FAIL"));
  };

  var data = null;

  // Verificar se possui parâmetros adicionais.
  if (params) {
    data = "";
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
      data += keys[i] + "=" + URLEncode(params[keys[i]]);
      if (i < keys.length) data += "&";
    }
  }

  // Mandar requisição para o servidor.
  xhr.send(data);
};
