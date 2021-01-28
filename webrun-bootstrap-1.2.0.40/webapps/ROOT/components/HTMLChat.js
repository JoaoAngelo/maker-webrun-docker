/**
 * Método construtor do HTMLChat. Responsável por criar o componente Chat.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente.
 **/
function HTMLChat(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);

  this.cachedUsers = [];
  this.connectionError = false;
  this.activeScreen = 0;

  // Verificar se é mobile.
  this.mobile = isMobile();

  // Obter o formato da data do formulário.
  if (mainform && mainform.DATE_PATTERN) {
    this.dateTimeFormat = mainform.DATE_PATTERN.toUpperCase() + " " + mainform.TIME_PATTERN;
    this.dateFormat = mainform.DATE_PATTERN.toUpperCase();
    this.timeFormat = mainform.TIME_PATTERN.replace(":ss", ""); // Remover segundos;
  } else {
    // Não encontrado, utilizar o formato UTC.
    this.dateTimeFormat = utcDateFormat + " " + utcTimeFormat;
    this.dateFormat = utcDateFormat;
    this.timeFormat = utcTimeFormat.replace(":ss", ""); // Remover segundos
  }

  // Configurar o JQuery para mandar os cookies nas requesições AJAX.
  // Isso é importante pois o chat requer autenticação e o id da sessão está nos cookies.
  $.ajaxSetup({
    xhrFields: {
      withCredentials: true
    }
  });
}

/**
 * Herança do objeto.
 **/
HTMLChat.inherits(HTMLGroupBox);

/**
 * Setando propriedades do componente.
 **/
HTMLChat.prototype.name = 'HTMLChat';
HTMLChat.prototype.tabable = true;

HTMLChat.prototype.utcDateFormat = 'YYYY-MM-DD';
HTMLChat.prototype.utcTimeFormat = 'HH:mm:ss';
//Se estiver em um ambiente HTPPS deve usar WSS.
HTMLChat.prototype.protocol = getAbsolutContextPath().startsWith("https://") ? "wss://" : "ws://";

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para habilitar/desabilitar o componente.
 */
HTMLChat.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  if ((!this.enabled || this.readonly) && this.selectedImage != null) this.unselectImage();
  this.updateLayout();
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para mostrar/ocultar o componente.
 */
HTMLChat.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  this.updateLayout();
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para ativar/desativar o modo somente leitura
 */
HTMLChat.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);
  if ((!this.enabled || this.readonly) && this.selectedImage != null) this.unselectImage();
  this.updateLayout();
};

/**
 * Responsável por desenhar o HTML do componente Chat.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLChat.prototype.designComponent = function(doc) {
  this.divClass = this.div.className;

  // Obter propriedades do componente e dar parse nelas.
  this.photoSize = (this.TamanhoDasFotos && this.TamanhoDasFotos.length && this.TamanhoDasFotos.length > 0) ? parseInt(this.TamanhoDasFotos) : 48;

  if (this.ConfirmacaoLeitura && this.ConfirmacaoLeitura.length) {
    this.showReadConfirmation = (this.ConfirmacaoLeitura.toLowerCase() == "true");
    this.ConfirmacaoLeitura = null;
  } else this.showReadConfirmation = true;

  if (this.ExibirEstados && this.ExibirEstados.length) {
    this.showUserStates = (this.ExibirEstados.toLowerCase() == "true");
    this.ExibirEstados = null;
  } else this.showUserStates = true;

  if (this.ExibirVistoPorUltimo && this.ExibirVistoPorUltimo.length) {
    this.showLastSeen = (this.ExibirVistoPorUltimo.toLowerCase() == "true");
    this.ExibirVistoPorUltimo = null;
  } else this.showLastSeen = true;

  if (this.ExibirPesquisa && this.ExibirPesquisa.length) {
    this.showSearch = (this.ExibirPesquisa.toLowerCase() == "true");
    this.ExibirPesquisa = null;
  } else this.showSearch = true;

  this.showSendToEveryone = (this.EnviarTodos && this.EnviarTodos.length && this.EnviarTodos.toLowerCase() == "true");
  this.fullscreen = (this.TelaCheia && this.TelaCheia.length && this.TelaCheia.toLowerCase() == "true");
  this.allowExport = (this.PermitirExportacao && this.PermitirExportacao.length && this.PermitirExportacao.toLowerCase() == "true");

  this.EnviarTodos = null;
  this.TelaCheia = null;
  this.PermitirExportacao = null;

  if (this.ExpandirFotoAoClicar && this.ExpandirFotoAoClicar.length) {
    this.expandOnClick = (this.ExpandirFotoAoClicar.toLowerCase() == "true");
    this.ExpandirFotoAoClicar = null;
  } else this.expandOnClick = true;

  if (this.ModoDeVisualizacao === "1" || this.ModoDeVisualizacao === 1) {
    this.viewMode = 1; // Automático
  } else if (this.ModoDeVisualizacao === "2" || this.ModoDeVisualizacao === 2) {
    this.viewMode = 2; // Desktop
  } else if (this.ModoDeVisualizacao === "3" || this.ModoDeVisualizacao === 3) {
    this.viewMode = 3; // Mobile
  } else this.viewMode = 1; // Automático
  this.ModoDeVisualizacao = null;

  if (this.QuantMensagensCarregadas && this.QuantMensagensCarregadas.length) {
    this.loadedMessagesAmount = parseInt(this.QuantMensagensCarregadas);
    this.QuantMensagensCarregadas = null;
  } else this.loadedMessagesAmount = 15;

  // Importar o moment.js
  webrun.include("assets/moment.min.js");

  // Preparar o locale do calendário
  var definedLocale = resources_locale.toLowerCase();
  if (definedLocale == 'en_us') this.locale = 'en';
  else if (definedLocale == 'pt_br') this.locale = 'pt-br';
  else if (definedLocale == 'es_es') this.locale = 'es';
  else if (definedLocale == 'fr_fr') this.locale = 'fr';
  else this.locale = 'en';

  // Definir o locale do Moment
  moment.locale(this.locale);

  if (this.expandOnClick) {
    // Importar o CSS do Fancybox
    if (!document.getElementById("fancybox-css")) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'assets/jquery.fancybox.min.css';
      link.id = 'fancybox-css';
      head.appendChild(link);
    }

    // Importar o script do Fancybox
    webrun.include("assets/jquery.fancybox.min.js");
  }

  if (this.allowExport) {
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
  }

  var object = this;

  // Verificar se o chat é tela cheia.
  if (this.fullscreen) {
    this.divClass = "position-relative d-flex w-100 h-100 mb-0"; // Bootstrap
    this.div.className = this.divClass;
    this.div.style.left = null;
    this.div.style.top = null;
  } else {
    this.divClass += " card overflow-hidden d-flex"; // Bootstrap
    this.div.className = this.divClass;
  }

  // Criar a div row do chat.
  this.contentDiv = document.createElement("div");
  this.contentDivClass = "row no-gutters w-100 mh-100 flex-fill m-0"; // Bootstrap
  this.contentDiv.className = this.contentDivClass;
  this.contentDivClass = this.contentDiv.className;
  this.div.appendChild(this.contentDiv);

  // Criar a coluna da esquerda na row.
  this.leftColumn = document.createElement("div");
  this.leftColumnClass = "col-sm-5 col-md-4 col-lg-3 p-0 d-flex flex-column h-100 border-right"; // Bootstrap
  this.leftColumn.className = this.leftColumnClass;
  this.contentDiv.appendChild(this.leftColumn);

  // Criar a navbar da esquerda do chat.
  this.leftNavbar = document.createElement("nav");
  this.leftNavbar.className = "navbar navbar-light bg-white mb-0"; // Bootstrap
  this.leftColumn.appendChild(this.leftNavbar);

  // Criar div do usuário na navbar.
  var userDiv = document.createElement("div");
  userDiv.className = "d-flex flex-row align-items-center mr-auto"; // Bootstrap
  this.leftNavbar.appendChild(userDiv);

  if (this.ImagemSemFoto && this.ImagemSemFoto.length > 0) {
    this.userPicture = document.createElement("img");
    this.userPicture.className = "rounded-circle bg-light"; // Bootstrap
    this.userPicture.width = this.photoSize;
    this.userPicture.height = this.photoSize;
    this.userPicture.alt = " ";

    // Verificar se as fotos expandem ao serem clicadas.
    if (this.expandOnClick) {
      // Criar elemento A para o fancybox.
      this.userPictureLink = document.createElement("a");
      this.userPictureLink.href = "#";
      this.userPictureLink.appendChild(this.userPicture);
      userDiv.appendChild(this.userPictureLink);

      // Inicializar fancybox no elemento.
      $(this.userPictureLink).fancybox({
        closeExisting: true,
        keyboard: true,
        arrows: true,
        protect: true
      });
    } else {
      userDiv.appendChild(this.userPicture);
    }
  } else {
    this.userPicture = document.createElement("div");
    this.userPicture.className = "rounded-circle bg-light border d-flex align-items-center justify-content-center"; // Bootstrap
    this.userPicture.style.width = this.photoSize + "px";
    this.userPicture.style.height = this.photoSize + "px";
    userDiv.appendChild(this.userPicture);

    var userPictureIcon = document.createElement("i");
    userPictureIcon.className = "fas fa-user text-dark"; // Font Awesome
    userPictureIcon.style.opacity = "0.5";
    userPictureIcon.style.fontSize = "1.25rem";
    this.userPicture.appendChild(userPictureIcon);
  }

  this.userName = document.createElement("h6");
  this.userName.className = "text-center mb-0 ml-3"; // Bootstrap
  userDiv.appendChild(this.userName);

  // Criar div de mensagem do chat.
  this.chatMessageDiv = document.createElement("div");
  this.chatMessageDivClass = "d-flex flex-row align-items-center w-100 bg-light border-top py-3"; // Bootstrap
  this.chatMessageDiv.className = "d-none"; // Bootstrap
  this.leftColumn.appendChild(this.chatMessageDiv);

  var chatMessageIconBase = document.createElement("div");
  chatMessageIconBase.className = "px-3 h-100"; // Bootstrap
  this.chatMessageDiv.appendChild(chatMessageIconBase);

  this.chatMessageIcon = document.createElement("i");
  this.chatMessageIcon.className = "fas fa-exclamation-triangle"; // Bootstrap - Font Awesome
  this.chatMessageIcon.style.fontSize = "1.5rem";
  chatMessageIconBase.appendChild(this.chatMessageIcon);

  var chatMessageContainer = document.createElement("div");
  chatMessageContainer.className = "w-100 h-auto"; // Bootstrap
  this.chatMessageDiv.appendChild(chatMessageContainer);

  this.chatMessageTitle = document.createElement("h6");
  this.chatMessageTitle.className = "w-100 mt-0 mb-0"; // Bootstrap
  this.chatMessageTitle.style.fontWeight = "600";
  chatMessageContainer.appendChild(this.chatMessageTitle);

  this.chatMessageContent = document.createElement("p");
  this.chatMessageContent.className = "w-100 mt-0 mb-0"; // Bootstrap
  chatMessageContainer.appendChild(this.chatMessageContent);

  // Exibir mensagem de notificação, se não foi permitida.
  this.hideChatMessage();

  // Criar a div de scroll das listas do chat.
  this.listScrollDiv = document.createElement("div");
  this.listScrollDiv.className = (this.fullscreen ? "h-auto" : "flex-fill") + " overflow-auto"; // Bootstrap
  this.leftColumn.appendChild(this.listScrollDiv);

  this.usersListClass = "list-group list-group-flush h-auto flex-fill overflow-auto"; // Bootstrap

  // Verificar se o chat tem enviar para todos.
  if (this.showSendToEveryone) {
    // Criar uma lista para o botão de enviar mensagem para todos.
    var topList = document.createElement("ul");
    topList.className = this.usersListClass;
    this.listScrollDiv.appendChild(topList);

    // Criar botão de enviar mensagem para todos.
    this.sendToEveryoneButton = document.createElement("button");
    this.sendToEveryoneButton.type = "button";
    this.sendToEveryoneButton.className = "list-group-item list-group-item-action d-flex flex-row align-items-center h-auto"; // Bootstrap
    this.sendToEveryoneButton.style.outline = "0";
    topList.appendChild(this.sendToEveryoneButton);

    var sendToEveryoneButtonText = document.createElement("h6");
    sendToEveryoneButtonText.className = "mb-0 w-100 text-center"; // Bootstrap
    sendToEveryoneButtonText.innerHTML = getLocaleMessage("LABEL.CHAT_SEND_TO_EVERYONE");
    this.sendToEveryoneButton.appendChild(sendToEveryoneButtonText);

    // Associar eventos ao botão de enviar mensagem para todos..
    this.attachEvent(this.sendToEveryoneButton, 'click', this.sendMessageToEveryoneAction);
  }

  // Verificar se o chat tem search.
  if (this.showSearch) {
    // Criar a div de pesquisa.
    this.searchDiv = document.createElement("div");
    this.searchDiv.className = "d-flex flex-row w-100 bg-light border-top border-bottom overflow-hidden"; // Bootstrap
    this.searchDiv.style.flex = "0 0 auto"; // Correção para IE e Safari
    if (this.showSendToEveryone) this.searchDiv.className += " border-bottom"; // Bootstrap
    this.leftColumn.insertBefore(this.searchDiv, this.listScrollDiv);

    // Criar a div base do ícone da pesquisa.
    var searchIconBase = document.createElement("div");
    searchIconBase.className = "px-3 py-2"; // Bootstrap
    this.searchDiv.appendChild(searchIconBase);

    // Obter o tamanho da linha no corpo da página.
    var lineHeight = "1.5"; // Padrão do Bootstrap
    try {
      var bodyLineHeight = window.getComputedStyle(document.body).lineHeight;
      if (bodyLineHeight !== null && bodyLineHeight.length > 0) {
        lineHeight = bodyLineHeight;
      }
    } catch (e) { }

    // Criar ícone da pesquisa.
    var searchIcon = document.createElement("i");
    searchIcon.className = "fas fa-search text-muted"; // Font Awesome
    searchIcon.style.lineHeight = lineHeight; // Correção para o IE
    searchIconBase.appendChild(searchIcon);

    // Criar input da pesquisa.
    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.className = "form-control-plaintext w-100"; // Bootstrap
    this.searchInput.placeholder = getLocaleMessage("LABEL.CHAT_SEARCH") + "...";
    this.searchInput.style.outline = "0";
    this.searchDiv.appendChild(this.searchInput);

    // Associar eventos ao input da pesquisa.
    this.attachEvent(this.searchInput, 'input', this.searchAction);

    // Associa o evento para evitar que post do formulário não seja realizado ao pressionar enter.
    this.searchInput.addEventListener('keydown', function (event){
      if(event.keyCode === 13 || event.which === 13 || event.key === 'Enter') {
         event.preventDefault();
         event.stopPropagation();
         return false;
       }
       return true;
    }, true);

    // Criar lista de resultados da pesquisa.
    this.searchResults = document.createElement("ul");
    this.searchResults.className = "d-none"; // Bootstrap
    this.listScrollDiv.appendChild(this.searchResults);
  }

  // Criar a lista de usuários do chat.
  this.usersList = document.createElement("ul");
  this.usersList.className = this.usersListClass;
  this.listScrollDiv.appendChild(this.usersList);

  // Criar uma coluna na row.
  this.rightColumn = document.createElement("div");
  this.rightColumn.className = "d-none"; // Bootstrap
  this.rightColumnClass = "col-sm-7 col-md-8 col-lg-9 p-0 d-flex flex-column h-100 border-0"; // Bootstrap
  this.contentDiv.appendChild(this.rightColumn);

  // Criar a navbar da direita do chat.
  this.rightNavbar = document.createElement("nav");
  this.rightNavbar.className = "navbar navbar-light bg-white border-bottom mb-0"; // Bootstrap
  this.rightColumn.appendChild(this.rightNavbar);

  // Criar botão de voltar.
  this.backButton = document.createElement("i");
  this.backButtonClass = "generic-btn fas fa-arrow-left mr-3"; // Custom - Font Awesome - Bootstrap
  this.backButton.className = "d-none"; // Bootstrap
  this.rightNavbar.appendChild(this.backButton);

  // Associar eventos ao botão de voltar.
  this.attachEvent(this.backButton, 'click', this.backScreenAction);

  // Criar div do usuário ativo na navbar.
  this.activeConvUserDiv = document.createElement("div");
  this.activeConvUserDiv.className = "d-flex flex-row align-items-center mr-auto"; // Bootstrap
  this.rightNavbar.appendChild(this.activeConvUserDiv);

  this.activeConvUserPicture = document.createElement("img");
  this.activeConvUserPicture.className = "rounded-circle"; // Bootstrap
  this.activeConvUserPicture.width = this.photoSize;
  this.activeConvUserPicture.height = this.photoSize;
  this.activeConvUserPicture.src = this.getImageSourceURL(this.ImagemSemFoto);

  // Verificar se as fotos expandem ao serem clicadas.
  if (this.expandOnClick) {
    // Criar elemento A para o fancybox.
    this.activeConvUserPictureLink = document.createElement("a");
    this.activeConvUserPictureLink.href = this.activeConvUserPicture.src;
    this.activeConvUserDiv.appendChild(this.activeConvUserPictureLink);
    this.activeConvUserPictureLink.appendChild(this.activeConvUserPicture);

    // Inicializar fancybox no elemento.
    $(this.activeConvUserPictureLink).fancybox({
      closeExisting: true,
      keyboard: true,
      arrows: true,
      protect: true
    });
  } else {
    this.activeConvUserDiv.appendChild(this.activeConvUserPicture);
  }

  if (!this.ImagemSemFoto || this.ImagemSemFoto.length == 0) {
    this.activeConvUserPictureDefault = document.createElement("div");
    this.activeConvUserPictureDefault.className = "d-none"; // Bootstrap
    this.activeConvUserPictureDefaultClass = "rounded-circle bg-light border d-flex align-items-center justify-content-center"; // Bootstrap
    this.activeConvUserPictureDefault.style.width = this.photoSize + "px";
    this.activeConvUserPictureDefault.style.height = this.photoSize + "px";
    this.activeConvUserDiv.appendChild(this.activeConvUserPictureDefault);

    var activeConvUserPictureIcon = document.createElement("i");
    activeConvUserPictureIcon.className = "fas fa-user text-dark"; // Font Awesome
    activeConvUserPictureIcon.style.opacity = "0.5";
    activeConvUserPictureIcon.style.fontSize = "1.25rem";
    this.activeConvUserPictureDefault.appendChild(activeConvUserPictureIcon);
  }

  var activeConvUserWrapper = document.createElement("div");
  activeConvUserWrapper.className = "d-flex flex-fill flex-column justify-content-center ml-3 overflow-hidden"; // Bootstrap
  this.activeConvUserDiv.appendChild(activeConvUserWrapper);

  this.activeConvUserName = document.createElement("h6");
  this.activeConvUserName.className = "mb-0"; // Bootstrap
  activeConvUserWrapper.appendChild(this.activeConvUserName);

  this.activeConvUserState = document.createElement("p");
  this.activeConvUserState.className = "text-muted mb-0"; // Bootstrap
  activeConvUserWrapper.appendChild(this.activeConvUserState);

  // Criar div da conversa ativa.
  this.activeConvDiv = document.createElement("div");
  this.activeConvDiv.className = "bg-light w-100 h-100 p-3 overflow-auto"; // Bootstrap
  this.rightColumn.appendChild(this.activeConvDiv);

  // Criar div de digitação.
  this.activeConvBottomDiv = document.createElement("div");
  this.activeConvBottomDiv.className = "d-flex align-items-end bg-light w-100 px-3 py-2 border-top"; // Bootstrap
  this.activeConvBottomDiv.style.bottom = "0";
  this.activeConvBottomDiv.style.left = "0";
  this.activeConvBottomDiv.style.right = "0";
  this.rightColumn.appendChild(this.activeConvBottomDiv);

  // Criar input da conversa do chat.
  this.input = document.createElement("textarea");
  this.input.className = "form-control"; // Bootstrap
  this.input.style.minHeight = "2.5rem";
  this.input.style.height = "2.5rem";
  this.input.style.outline = "0";
  this.input.style.resize = "none";
  this.activeConvBottomDiv.appendChild(this.input);

  this.updateInputLayout = function() {
    if (object.authError === true) return false;

    // Atualizar o estado do botão de enviar.
    object.sendButton.disabled = (object.input.value === undefined ||
      object.input.value === null || object.input.value.trim().length == 0);

    // Atualizar a altura da caixa de texto.
    if (!object.sendButton.disabled) {
      if (object.rightColumn && object.rightColumn.offsetHeight > 0) {
        var targetHeight = object.input.scrollHeight;
        if (object.input.value.indexOf("\n") == -1 &&
            object.input.value.indexOf("\r") == -1) targetHeight = 0;
        object.input.style.height = Math.max(Math.min(targetHeight,
          object.rightColumn.offsetHeight * 0.50), 0) + "px";
      }
    } else {
      object.input.style.height = object.input.style.minHeight;
    }
  };

  // Associar eventos ao input.
  this.input.addEventListener("input", this.updateInputLayout);
  this.input.addEventListener("change", this.updateInputLayout);

  this.input.addEventListener("keydown", function(e) {
    if (object.authError === true) return false;
    if (e.keyCode === 13) { // ENTER
      e.preventDefault();

      // Não enviar quando o SHIFT estiver pressionado,
      // assim o usuário poderá pular linha.
      if (e.shiftKey) object.input.value += "\n";
      else object.sendButton.click();
    }
  });

  // Criar botão de enviar mensagem.
  this.sendButton = document.createElement("button");
  this.sendButton.type = "button";
  this.sendButton.disabled = true;
  this.sendButton.className = "btn btn-light ml-3 d-flex align-items-center justify-content-center"; // Bootstrap
  this.sendButton.title = getLocaleMessage("LABEL.SEND");
  this.sendButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  this.activeConvBottomDiv.appendChild(this.sendButton);

  var sendButtonIcon = document.createElement("span");
  sendButtonIcon.className = "fas fa-paper-plane my-1"; // Font Awesome
  this.sendButton.appendChild(sendButtonIcon);

  // Associar eventos ao botão de enviar mensagem.
  this.attachEvent(this.sendButton, 'click', this.sendMessageAction);

  if (this.allowExport) {
    var rightDropdownArea = document.createElement("div");
    rightDropdownArea.className = "dropdown dropleft"; // Bootstrap
    this.rightNavbar.appendChild(rightDropdownArea);

    // Criar botão de opções.
    this.rightOptionsButton = document.createElement("button");
    this.rightOptionsButton.type = "button";
    this.rightOptionsButton.id = "chat-options-" + this.code;
    this.rightOptionsButton.className = "btn btn-link text-muted"; // Custom
    this.rightOptionsButton.setAttribute("data-toggle", "dropdown"); // Bootstrap
    this.rightOptionsButton.setAttribute("aria-haspopup", "true"); // Accessibility
    this.rightOptionsButton.setAttribute("aria-expanded", "false"); // Accessibility
    rightDropdownArea.appendChild(this.rightOptionsButton);

    var rightOptionsButtonIcon = document.createElement("span");
    rightOptionsButtonIcon.className = "fas fa-ellipsis-v"; // Font Awesome
    this.rightOptionsButton.appendChild(rightOptionsButtonIcon);

    // Criar menu de contexto da conversa.
    this.rightDropdownMenu = document.createElement("div");
    this.rightDropdownMenu.className = "dropdown-menu mt-2"; // Bootstrap
    this.rightDropdownMenu.setAttribute("aria-labelledby", this.rightOptionsButton.id); // Accessibility
    rightDropdownArea.appendChild(this.rightDropdownMenu);

    // Criar botão de exportar conversa.
    var exportConversation = document.createElement("a");
    exportConversation.href = "#";
    exportConversation.className = "dropdown-item" + (!this.canExport ? " disabled" : ""); // Bootstrap
    exportConversation.innerHTML = getLocaleMessage("LABEL.CHAT_EXPORT_CONVERSATION");
    this.rightDropdownMenu.appendChild(exportConversation);

    // Associar eventos ao botão de exportar conversa.
    this.attachEvent(exportConversation, 'click', this.openExportModal);
  }

  // Criar o loader do chat.
  this.preloader = document.createElement("div");
  this.preloader.className = "d-none"; // Bootstrap
  this.preloaderClass = "spinner-border text-primary"; // Bootstrap
  this.preloader.setAttribute("role", "status");
  this.div.appendChild(this.preloader);

  var preloaderSpan = document.createElement("span");
  preloaderSpan.className = "sr-only"; // Bootstrap
  preloaderSpan.innerHTML = getLocaleMessage("LABEL.LOADING") + "...";
  this.preloader.appendChild(preloaderSpan);

  // Procurar pelo evento de visibilidade da página.
  // (https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
  var docHiddenProp, visibilityChange;
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    docHiddenProp = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    docHiddenProp = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    docHiddenProp = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  // Definir a propriedade de visibilidade da página como true.
  this.pageVisible = true;

  try {
    // Verificar se o evento de mudança de visibilidade existe.
    if (visibilityChange) {
      document.addEventListener(visibilityChange, function() {
        if (object.authError === true) return false;
        object.pageVisible = !document[docHiddenProp];
      }, false);
    }

    // Associar eventos de exibição da página na instância da janela.
    window.addEventListener('pageshow', function() {
      if (object.authError === true) return false;
      if (object) object.pageVisible = !document[docHiddenProp];
    }, false);

    window.addEventListener('pagehide', function() {
      if (object.authError === true) return false;
      if (object) object.pageVisible = false;
    }, false);
  } catch (e) { }

  // Associar evento de resize na instância da janela.
  window.addEventListener("resize", function() {
    if (object.authError === true) return false;
    if (object) object.updateLayout();
  });

  // Atualizar layout.
  this.updateLayout();

  // Exibir preloader.
  this.showPreloader();
};

/*
 * Ocorre quando algum componente que é dependência desse muda de valor
 */
HTMLChat.prototype.refresh = function(){
  // Atualizar os dados do componente.
  this.updateData();

  // Atualizar layout.
  this.updateLayout();
};

/*
 * Ocorre quando o formulário termina de carregar.
 */
HTMLChat.prototype.onFormLoadAction = function() {
  try {
    // Procurar pela barra de navegação.
    if (d && d.n && d.n.div) {
      var navbarCollapse = d.n.div.getElementsByClassName("navbar-collapse");
      if (navbarCollapse && navbarCollapse.length > 0) {
        var object = this;
        var updateLayoutCallback = function() {
          try { if (object) object.updateLayout(); } catch (e) { }
        };

        // Associar eventos ao collapse da navbar.
        $(navbarCollapse).on("show.bs.collapse", updateLayoutCallback);
        $(navbarCollapse).on("shown.bs.collapse", updateLayoutCallback);
        $(navbarCollapse).on("hide.bs.collapse", updateLayoutCallback);
        $(navbarCollapse).on("hidden.bs.collapse", updateLayoutCallback);
      }
    }
  } catch (e) { }

  // Atualizar os dados do componente.
  this.updateData();

  // Atualizar layout.
  this.updateLayout();
};


/**
 * Obtém a URL base dos pedidos do chat.
 **/
HTMLChat.prototype.getRequestURL = function() {

  var params = "";

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

  return getAbsolutContextPath() + "componentData.do?action=componentData&sys=" + URLEncode(this.sys, 'GET') +
    "&formID=" + URLEncode(this.formID, 'GET') + "&comID=" + URLEncode(this.code, 'GET') + params;
};

/**
 * Atualiza os dados do chat.
 **/
HTMLChat.prototype.updateData = function() {
  var object = this;

  // Exibir preloader.
  this.showPreloader();

  // Mandar pedido para o servidor para obter os dados do chat.
  var baseURL = this.getRequestURL();
  $.get(baseURL,
    function(response) {
      if (response) {
        // Limpar usuários na memória.
        object.clearCachedUsers();

        // Se a resposta for 0, quer dizer que é um erro de autenticação.
        if (response === "0" || response === 0) {
          // Esconder preloader.
          object.hidePreloader();

          // Desenhar mensagem de erro de autenticação.
          object.designAuthError();
        } else {
          // Verificar se a resposta tem usuários.
          if (response.users && response.users.length && response.users.length > 0) {
            // Dar loop nos usuários do sistema.
            for (var i = 0; i < response.users.length; i++) {
              var user = response.users[i];

              // Verificar se o usuário atual é o usuário logado.
              if (user.id == response.userCode) {
                object.userName.innerHTML = stringToHTMLString(user.name);
                object.userPicture.src = (user.photo === "false") ?
                  object.getImageSourceURL(object.ImagemSemFoto) :
                  baseURL + "&type=p&req=" + URLEncode(user.id, 'GET');
                if (object.userPictureLink) object.userPictureLink.href = object.userPicture.src;

                // Adicionar usuário na cache.
                object.user = new HTMLChatContainer(object, i, user,
                  null,
                  object.userPicture,
                  object.userName,
                  null);
                object.cachedUsers.push(object.user);
              } else {
                // Desenhar o item do usuário na lista.
                var items = object.designUserItem(object.usersList, user, i);

                // Criar o container do usuário.
                var userContainer = new HTMLChatContainer(object, i, user,
                  items[0], items[1], items[2], items[3], items[4]);

                // Verificar se a última mensagem foi definida.
                if (user.lastMessage && user.lastMessage.length && user.lastMessage.length > 0) {
                  userContainer.setLastMessageContent(user.lastMessage);
                }

                // Adicionar usuário na cache.
                object.cachedUsers.push(userContainer);

                // Verificar se tem mensagens não lidas.
                if (user.unreadMessages) {
                  userContainer.setTotalUnreadMessages(parseInt(user.unreadMessages));
                }
              }
            }

            if (object.showSendToEveryone) {
              // Adicionar sessão de enviar para todos ao chat.
              object.sendToEveryoneContainer = new HTMLChatContainer(object, -1);
              object.cachedUsers.push(object.sendToEveryoneContainer);
            }
          }

          // Conectar no endpoint.
          if (response.endpoint && response.endpoint.length && response.endpoint.length > 0) {
            //Adicionado para que a conexão no socket só seja feita se o usuário atual estiver presente na lista de usuários
            if(response.users.filter(function(item) { return item.id === response.userCode; }).length > 0)
              object.connect(response.endpoint);
          }

          // Esconder preloader.
          object.hidePreloader();
        }
      } else {
        // Esconder preloader.
        object.hidePreloader();
      }
    }).fail(function() {
      // Esconder preloader.
      object.hidePreloader();

      // Desenhar mensagem de erro de autenticação.
      object.designAuthError();
    });
};

/**
 * Desenha mensagem de erro de autenticação.
 **/
HTMLChat.prototype.designAuthError = function() {
  var fullscreen = this.fullscreen;

  this.authError = true;
  this.flush();

  if (!this.authErrorDiv) {
    if (fullscreen) {
      this.divClass = "position-relative w-100 vh-100"; // Bootstrap
      this.div.className = this.divClass;
      this.div.style.minHeight = null;
    }

    // Criar div de erro de autenticação.
    this.authErrorDiv = document.createElement("div");
    this.authErrorDiv.className = "d-flex flex-column align-items-center justify-content-center w-100 h-100 text-center text-muted"; // Bootstrap
    this.div.appendChild(this.authErrorDiv);

    var authErrorIcon = document.createElement("i");
    authErrorIcon.className = "fas fa-lock"; // Material Design Icons
    authErrorIcon.style.fontSize = "4rem";
    this.authErrorDiv.appendChild(authErrorIcon);

    var authErrorMessage = document.createElement("span");
    authErrorMessage.className = "my-4"; // Bootstrap
    authErrorMessage.style.maxWidth = "17rem";
    authErrorMessage.innerHTML = getLocaleMessage("INFO.CHAT_AUTHENTICATION_ERROR");
    this.authErrorDiv.appendChild(authErrorMessage);
  }
};

/**
 * Limpa a lista de usuários.
 **/
HTMLChat.prototype.clearCachedUsers = function() {
  if (this.activeUser != null) {
    this.activeUser.setActive(false);
    this.activeUser = null;
  }

  this.usersList.innerHTML = "";
  if (this.searchResults) this.searchResults.innerHTML = "";
  this.cachedUsers = [];
  this.input.value = "";
};

/**
 * Desenha os elementos HTML de um usuário.
 * @param doc - O elemento que irá receber os elementos do usuário.
 * @param user - O JSON enviado pelo servidor contento as informações do usuário.
 * @param userIndex - O índice do usuário na lista principal.
 * @param query - (Pode ser nulo) A query da pesquisa para destacar os nomes.
 **/
HTMLChat.prototype.designUserItem = function(doc, user, userIndex, query) {
  // Criar item do usuário na lista.
  var userItem = document.createElement("button");
  userItem.type = "button";
  userItem.className = "list-group-item list-group-item-action d-flex flex-row align-items-center h-auto"; // Bootstrap
  userItem.style.outline = "0";
  doc.appendChild(userItem);

  // Criar imagem do usuário na lista.
  if ((!user.photo || user.photo === "false" || user.photo.length == 0) && (!this.ImagemSemFoto || this.ImagemSemFoto.length == 0)) {
    var userPicture = document.createElement("div");
    userPicture.className = "rounded-circle bg-light border d-flex align-items-center justify-content-center"; // Bootstrap
    userPicture.style.width = this.photoSize + "px";
    userPicture.style.height = this.photoSize + "px";
    userPicture.style.flex = "0 0 auto"; // Correção para IE e Safari
    userItem.appendChild(userPicture);

    var userPictureIcon = document.createElement("i");
    userPictureIcon.className = "fas fa-user text-dark"; // Font Awesome
    userPictureIcon.style.opacity = "0.5";
    userPictureIcon.style.fontSize = "1.25rem";
    userPicture.appendChild(userPictureIcon);
  } else {
    var userPicture = document.createElement("img");
    userPicture.className = "rounded-circle bg-light"; // Bootstrap
    userPicture.width = this.photoSize;
    userPicture.height = this.photoSize;
    userPicture.alt = " ";
    userPicture.src = (!user.photo || user.photo === "false" || user.photo.length == 0) ?
      this.getImageSourceURL(this.ImagemSemFoto) :
        getAbsolutContextPath() + "componentData.do?action=componentData&sys=" +
        URLEncode(this.sys, 'GET') + "&formID=" + URLEncode(this.formID, 'GET') +
        "&comID=" + URLEncode(this.code, 'GET') + "&type=p&req=" + URLEncode(user.id, 'GET');

    // Verificar se as fotos expandem ao serem clicadas.
    if (this.expandOnClick) {
      // Criar elemento A para o fancybox.
      var userPictureLink = document.createElement("a");
      userPictureLink.href = userPicture.src;
      userItem.appendChild(userPictureLink);
      userPictureLink.appendChild(userPicture);

      userPictureLink.onclick = function(e) {
        e.stopPropagation();
      };

      // Inicializar fancybox no elemento.
      $(userPictureLink).fancybox({
        closeExisting: true,
        keyboard: true,
        arrows: true,
        protect: true
      });
    } else {
      userItem.appendChild(userPicture);
    }
  }

  var userWrapper = document.createElement("div");
  userWrapper.className = "d-flex flex-fill flex-column justify-content-center ml-3 overflow-hidden"; // Bootstrap
  userItem.appendChild(userWrapper);

  // Criar o elemento do nome do usuário na lista.
  var userName = document.createElement("h6");
  userName.className = "mb-0"; // Bootstrap
  userName.style.fontWeight = "600";
  if (query) {
    var name = this.formatName(user.name);
    var lowerCaseName = name.toLowerCase();
    var queryIndex = lowerCaseName.indexOf(query);
    userName.innerHTML = name.substring(0, queryIndex) + "<b>" + name.substring(queryIndex, queryIndex + query.length) + "</b>" +
      name.substring(queryIndex + query.length, name.length);
  } else userName.innerHTML = this.formatName(user.name);
  userWrapper.appendChild(userName);

  // Criar o elemento da última mensagem do usuário na lista.
  var userLastMessage = document.createElement("p");
  userLastMessage.className = "position-relative w-100 d-flex align-items-center mb-0"; // Bootstrap
  userWrapper.appendChild(userLastMessage);

  var userLastMessageBadge = document.createElement("span");
  userLastMessageBadge.className = "badge bg-dark d-inline-flex align-items-center text-white my-1 mr-2"; // Bootstrap
  userLastMessage.appendChild(userLastMessageBadge);

  var userLastMessageContent = document.createElement("span");
  userLastMessageContent.className = "d-inline-block text-truncate text-muted mb-0"; // Bootstrap
  userLastMessage.appendChild(userLastMessageContent);

  // Associar eventos aos elementos.
  var object = this;
  userItem.onclick = function() {
    // Abrir conversa com o usuário em questão.
    if (!object.activeUser || object.activeUser.index != userIndex) {
      object.openConversation(userIndex);
    }

    // Limpar pesquisa atual.
    if (object.showSearch) {
      object.searchInput.value = "";
      object.searchAction();
    }
  };

  return [userItem, userPicture, userName, userLastMessageContent, userLastMessageBadge];
};

/**
 * Exibe o preloader do chat.
 **/
HTMLChat.prototype.showPreloader = function() {
  if (this.contentDiv) this.contentDiv.className = "d-none"; // Bootstrap
  if (this.preloader) this.preloader.className = this.preloaderClass;
  if (this.div) this.div.className = this.divClass + " d-flex align-items-center justify-content-center"; // Bootstrap
};

/**
 * Oculta o preloader do chat.
 **/
HTMLChat.prototype.hidePreloader = function() {
  if (this.contentDiv) this.contentDiv.className = this.contentDivClass;
  if (this.preloader) this.preloader.className = "d-none"; // Bootstrap
  if (this.div) this.div.className = this.divClass;
};

/**
 * Exibe uma mensagem do chat na lista lateral.
 **/
HTMLChat.prototype.showChatMessage = function(title, message, icon) {
  if (this.chatMessageDiv) {
    this.chatMessageTitle.innerHTML = title;
    this.chatMessageContent.innerHTML = message;
    this.chatMessageIcon.className = (icon ? icon : "fas fa-exclamation-circle") + " pt-1"; // Font Awesome
    this.chatMessageDiv.className = this.chatMessageDivClass;
    this.chatMessageDiv.style.cursor = "default";
    this.chatMessageDiv.onclick = null;
  }
};

/**
 * Esconde a mensagem do chat na lista lateral.
 **/
HTMLChat.prototype.hideChatMessage = function() {
  if (this.chatMessageDiv) {
    if (!this.mobile && typeof Notification !== "undefined" && Notification.permission !== 'granted') {
      this.showChatMessage(
        getLocaleMessage("INFO.CHAT_NOTIFICATIONS_NOTICE"),
        getLocaleMessage("INFO.CHAT_ENABLE_NOTIFICATIONS"),
        "fas fa-bell"); // Font Awesome
      this.chatMessageDiv.style.cursor = "pointer";

      var object = this;
      this.chatMessageDiv.onclick = function(e) {
        Notification.requestPermission().then(function(permission) {
          if (permission === 'granted') object.hideChatMessage();
        });
      };
    } else {
      this.chatMessageDiv.className = "d-none"; // Bootstrap
      this.chatMessageTitle.innerHTML = "";
      this.chatMessageContent.innerHTML = "";
    }
  }
};

/**
 * Abre um painel de conversa pelo índice.
 **/
HTMLChat.prototype.openConversation = function(index) {
  this.cachedUsers[index].setActive(true);
};

/**
 * Obtém um usuário na cache pelo seu identificador.
 **/
HTMLChat.prototype.getUserById = function(id) {
  for (var i = 0; i < this.cachedUsers.length; i++) {
    if (this.cachedUsers[i].index != -1 && this.cachedUsers[i].user && this.cachedUsers[i].user.id == id) {
      return this.cachedUsers[i];
    }
  }
};

/**
 * Cria e conecta o WebSocket no endpoint especificado.
 **/
HTMLChat.prototype.connect = function(endpoint) {
  if (this.authError === true || this.socketEndpoint === endpoint) return;
  this.socketEndpoint = endpoint;

  // Obter os parâmetros da URL.
  var indice = location.pathname.lastIndexOf('/');
  var path = location.pathname.substring(0, indice + 1);

  // Criar o socket no endpoint recebido pelo servidor.
  this.socket = new WebSocket(this.protocol + location.host + path + endpoint);
  this.attachEvent(this.socket, 'open', this.onConnected);
  this.attachEvent(this.socket, 'close', this.onDisconnected);
  this.attachEvent(this.socket, 'message', this.onMessageReceived);
  this.attachEvent(this.socket, 'error', this.onErrorThrown);
};

/**
 * Ocorre quando o socket conecta com o servidor.
 **/
HTMLChat.prototype.onConnected = function(e) {
  if (this.connectionError) {
    this.hideChatMessage();
    this.connectionError = false;
  }

  this.aliveRoutine(this);
};

/**
 * Ocorre quando o socket desconecta com o servidor.
 **/
HTMLChat.prototype.onDisconnected = function(e) {
  this.connectionError = true;
  this.showChatMessage(
    getLocaleMessage("ERROR.CONNECTION_FAIL"),
    getLocaleMessage("INFO.CONNECTION_RETRY") + "...");
  this.updateLayout();

  var endpoint = this.socketEndpoint;
  this.sockedEndPoint = null;
  this.connect(endpoint);
};

/**
 * Ocorre quando o socket recebe uma mensagem do servidor.
 **/
HTMLChat.prototype.onMessageReceived = function(e) {
  // Verificar se a mensagem não está vazia.
  if (e && e.data && e.data.length > 0) {
    var message = JSON.parse(e.data);

    // Verificar o tipo da mensagem.
    if (message.type == "message") { // Mensagem de uma pessoa.
      var user = this.getUserById(message.from);
      if (user) user.handleMessage(message);
    } else if (message.type == "received") { // Servidor recebeu a mensagem.
      var user = this.getUserById(message.destination);
      if (user) user.setMessageStatus(message.messageId, 1);
    } else if (message.type == "userreceived") { // Cliente recebeu a mensagem.
      var user = this.getUserById(message.messageDestination);
      if (user) {
        user.setMessageStatus(message.messageId, 2);
        if (!user.user.state || user.user.state != "1") {
          this.setUserState(user, "1");
        }
      }
    } else if (message.type == "read") { // Cliente leu a mensagem.
      if (this.showReadConfirmation) {
        var user = this.getUserById(message.from);
        if (user) user.setMessageStatus(message.messageId, 3);
      }
    } else if (message.type == "connected") { // Cliente conectado.
      if (this.showUserStates) {
        var user = this.getUserById(message.from);
        if (user) this.setUserState(user, "1");
      }
    } else if (message.type == "disconnected") { // Cliente desconectado.
      if (this.showUserStates) {
        var user = this.getUserById(message.from);
        if (user) this.setUserState(user, "2", message.lastSeen);
      }
    }

    // Enviar a mensagem para o servidor informando que recebeu a mensagem.
    this.socket.send(JSON.stringify({
      type: "received",
      id: message.id,
      from: message.from,
      destination: message.destination
    }));
  }
};

/**
 * Ocorre quando o socket falha ao se conectar com o servidor.
 **/
HTMLChat.prototype.onErrorThrown = function(e) {
  this.connectionError = true;
  this.showChatMessage(
    getLocaleMessage("ERROR.CONNECTION_FAIL"),
    getLocaleMessage("INFO.CONNECTION_RETRY") + "...");
  this.updateLayout();

  var endpoint = this.socketEndpoint;
  this.sockedEndPoint = null;
  this.connect(endpoint);
};

/**
 * Ocorre ao usuário clicar no botão de voltar.
 **/
HTMLChat.prototype.backScreenAction = function() {
  this.activeScreen = 0;
  if (this.activeUser != null)
    this.activeUser.setActive(false);
  this.updateLayout();
};

/**
 * Ocorre ao usuário clicar no botão de enviar mensagem.
 **/
HTMLChat.prototype.sendMessageAction = function() {
  // Fechar tooltip do bootstrap.
  bootstrapCloseTooltip(this.sendButton);

  // Verificar se o input está vazio.
  if (!this.activeUser || this.input.value === undefined || this.input.value === null || this.input.value.length == 0) {
    this.sendButton.disabled = true;
    return false;
  }

  // Obter o horário atual em UTC.
  var messageTime = moment().utc();

  if (this.activeUser.index == -1) {
    // Enviar mensagem para todo mundo.
    for (var i = 0; i < this.cachedUsers.length; i++) {
      var user = this.cachedUsers[i];
      if (user.index != -1 && user.user && user.user.id != this.user.id) {
        var messageData = {
          // Tipo da requesição
          type: "message",

          // Id da mensagem (1410715640579 Unix ms timestamp - Número aleatório)
          id: messageTime.format("x") + "-" + (Math.floor(Math.random() * 1000000) + 1).toString(),

          // Dados da mensagem
          from: this.user.user.id,
          destination: user.user.id,
          time: messageTime.toISOString(),
          message: this.input.value.trim()
        };

        // Adicionar mensagem ao container do usuário.
        user.handleMessage(messageData, false);

        // Enviar a mensagem para o servidor.
        this.socket.send(JSON.stringify(messageData));
      }
    }

    // Adicionar mensagem ao container do enviar mensagem para todos.
    this.sendToEveryoneContainer.handleMessage({
      // Tipo da requesição
      type: "message",

      // Id da mensagem (1410715640579 Unix ms timestamp - Número aleatório)
      id: messageTime.format("x") + "-" + (Math.floor(Math.random() * 1000000) + 1).toString() + "-g",

      // Dados da mensagem
      from: this.user.user.id,
      destination: this.user.user.id,
      time: messageTime.toISOString(),
      message: this.input.value.trim(),
      everyone: true
    }, false);
  } else {
    var messageData = {
      // Tipo da requesição
      type: "message",

      // Id da mensagem (1410715640579 Unix ms timestamp - Número aleatório)
      id: messageTime.format("x") + "-" + (Math.floor(Math.random() * 1000000) + 1).toString(),

      // Dados da mensagem
      from: this.user.user.id,
      destination: this.activeUser.user.id,
      time: messageTime.toISOString(),
      message: this.input.value.trim()
    };

    // Adicionar mensagem ao container do usuário destino
    this.activeUser.handleMessage(messageData);

    // Enviar a mensagem para o servidor.
    this.socket.send(JSON.stringify(messageData));
  }

  // Resetar input e desativar o botão de enviar.
  this.input.value = "";
  this.input.style.height = "2.5rem";
  this.sendButton.disabled = true;
};

/**
 * Ocorre ao usuário clicar no botão de enviar mensagem para todos.
 **/
HTMLChat.prototype.sendMessageToEveryoneAction = function() {
  if (!this.showSendToEveryone || !this.sendToEveryoneContainer) return;

  // Abrir o container de enviar mensagem para todos.
  this.sendToEveryoneContainer.setActive(true);

  // Limpar pesquisa atual.
  if (this.showSearch) {
    this.searchInput.value = "";
    this.searchAction();
  }
};

/**
 * Ocorre ao usuário clicar no botão de enviar mensagem.
 **/
HTMLChat.prototype.searchAction = function() {
  if (this.searchInput.value == null || this.searchInput.value.length == 0) {
    this.searchResults.className = "d-none"; // Bootstrap
    this.searchResults.innerHTML = "";
    this.usersList.className = this.usersListClass;
  } else {
    this.searchResults.className = this.usersListClass;
    this.searchResults.innerHTML = "";
    this.usersList.className = "d-none"; // Bootstrap

    // Procurar pelo usuário na lista de usuários cacheados.
    var totalFound = 0;
    for (var i = 0; i < this.cachedUsers.length; i++) {
      var userContainer = this.cachedUsers[i];

      // Verificar se o id do usuário atual não é igual ao do usuário logado.
      if (userContainer.index != -1 && userContainer.user && userContainer.user.id != this.user.user.id) {
        var lowerCaseQuery = this.searchInput.value.toLowerCase().trim();
        var lowerCaseName = userContainer.user.name.toLowerCase().trim();

        // Verificar se o nome é igual ou contém partes.
        if (lowerCaseName == lowerCaseQuery || lowerCaseName.indexOf(lowerCaseQuery) != -1) {
          // Desenhar o item do usuário na lista de resultados.
          this.designUserItem(this.searchResults, userContainer.user, userContainer.index, lowerCaseQuery);
          totalFound++;
        }
      }
    }

    // Verificar se nenhum resultado foi encontrado.
    if (totalFound == 0) {
      // Adicionar borda no topo da lista.
      this.searchResults.className = this.usersListClass + " border-top"; // Bootstrap

      // Criar um span para informar que nenhum resultado foi encontrado.
      var noResultsText = document.createElement("span");
      noResultsText.className = "text-muted text-center w-100 h-auto p-4"; // Bootstrap
      noResultsText.innerHTML = getLocaleMessage("LABEL.CHAT_SEARCH_NO_RESULTS");
      this.searchResults.appendChild(noResultsText);
    }
  }
};

/**
 * Rotina de estado online deste cliente.
 * @param context - Referência para a instância do chat.
 **/
HTMLChat.prototype.aliveRoutine = function(context) {
  // Cortar a rotina se o socket não estiver conectado ou conectando.
  if (!context.socket || context.socket.readyState > 1) return;

  // Enviar para o servidor a mensagem "alive", se o socket estiver conectado.
  if (context.socket.readyState == 1) {
    context.socket.send(JSON.stringify({
      type: "alive",
      from: context.user.user.id
    }));
  }

  // Executar essa função novamente depois de 5 segundos.
  setTimeout(function() {
    context.aliveRoutine(context);
  }, 5000);
};

/**
 * Retorna um boolean indicando se o usuário pode interagir com o chat.
 **/
HTMLChat.prototype.canChat = function() {
  return (this.enabled && !this.connectionError);
};

/**
 * Retorna um boolean indicando se o chat pode exibir notificações.
 **/
HTMLChat.prototype.canShowDesktopNotifications = function() {
  return (!this.pageVisible && !this.mobile &&
    typeof Notification !== "undefined" &&
    Notification.permission === 'granted');
};

/**
 * Exibe uma notificação na área de trabalho.
 * @param title - Título da notificação.
 * @param icon - Ícone da notificação.
 * @para body - Conteúdo da notificação.
 **/
HTMLChat.prototype.showDesktopNotification = function(title, icon, body) {
  return new Notification(title, {
    icon: icon,
    body: body
  });
};

/**
 * Atualiza o layout do chat.
 **/
HTMLChat.prototype.updateLayout = function() {
  if (!this.canChat()) {
    // Se o usuário não pode enviar mensagens, desativar entrada.
    this.sendButton.disabled = true;
    this.input.disabled = true;
  } else {
    // Ativar entrada e botão de enviar.
    this.sendButton.disabled = (!this.input.value || this.input.value.length == 0);
    this.input.disabled = false;
  }

  if (this.fullscreen && this.tab) {
    var targetHeight = "calc(100vh - " + this.tab.getDistanceFromTop() + "px)";
    if (this.tab.div) this.tab.div.style.setProperty("min-height", targetHeight, "important");
    this.div.style.setProperty("min-height", targetHeight, "important");
    this.div.style.maxHeight = targetHeight;
  }

  // Ajeitar layout da tela dependendo do seu tamanho.
  if (this.viewMode == 3 || (this.viewMode == 1 && this.div.offsetWidth <= 576)) {
    this.backButton.className = this.backButtonClass;
    this.contentDiv.className = this.contentDivClass;
    this.contentDiv.style.height = null;

    if (this.fullscreen) {
      this.leftColumn.style.height = this.height + "px";
      this.rightColumn.style.height = this.height + "px";
    }

    switch (this.activeScreen) {
      case 0:
        this.leftColumn.className = "col-12 h-100 p-0 d-flex flex-column"; // Bootstrap
        this.rightColumn.className = "d-none"; // Bootstrap
        break;
      case 1:
        this.leftColumn.className = "d-none"; // Bootstrap
        this.rightColumn.className = "col-12 h-100 p-0 d-flex flex-column"; // Bootstrap
        break;
    }

    if (this.activeUser != null) {
      if (this.activeUser.item) this.activeUser.item.className = this.activeUser.itemClass;
      if (this.activeUser.itemLast) this.activeUser.itemLast.className = "d-inline-block text-truncate text-muted mb-0"; // Bootstrap
      if (this.activeUser.itemLastBadge) this.activeUser.itemLastBadge.className = "d-none"; // Bootstrap
    }
  } else {
    this.backButton.className = "d-none"; // Bootstrap
    this.leftColumn.className = this.leftColumnClass;
    this.leftColumn.style.cssText = null;
    this.rightColumn.style.cssText = null;

    if (this.activeUser != null) {
      this.rightColumn.className = this.rightColumnClass;
      if (this.activeUser.item) this.activeUser.item.className = this.activeUser.itemClass + " active"; // Bootstrap
      if (this.activeUser.itemLast) this.activeUser.itemLast.className = "d-inline-block text-truncate text-white mb-0"; // Bootstrap
      if (this.activeUser.itemLastBadge) this.activeUser.itemLastBadge.className = "d-none"; // Bootstrap
    }
  }

  // Atualizar o layout do input.
  this.updateInputLayout();
};

/**
 * Define o estado de conexão de um usuário.
 * @param user - Referência para o usuário.
 * @param state - Novo estado de conexão do usuário.
 * @param lastSeen - Visto por útimo do usuário.
 **/
HTMLChat.prototype.setUserState = function(user, state, lastSeen) {
  user.user.state = state;
  if (lastSeen) user.user.lastSeen = lastSeen;

  if (this.showUserStates && this.activeUser != null && this.activeUser.user && this.activeUser.user.id == user.user.id) {
    switch (state) {
      case "1": this.activeConvUserState.innerHTML = getLocaleMessage("LABEL.CHAT_ONLINE"); break;
      case "2": this.activeConvUserState.innerHTML = this.formatLastSeen(
        this.showLastSeen && user.user.lastSeen ? moment(user.user.lastSeen).local() : null); break;
      default: this.chat.activeConvUserState.innerHTML = ""; break;
    }
  } else if (!this.showUserStates) {
    this.chat.activeConvUserState.innerHTML = "";
  }
};

/**
 * Formatar a string de exibição do horário de visto por último de um usuário.
 * @param lastSeen - Visto por útimo do usuário em moment().
 **/
HTMLChat.prototype.formatLastSeen = function(lastSeen) {
  if (!this.showLastSeen || lastSeen === null || lastSeen === undefined)
    return getLocaleMessage("LABEL.CHAT_OFFLINE");

  var now = moment();
  if (lastSeen.date() == now.date() &&
    lastSeen.month() == now.month() &&
    lastSeen.year() == now.year()) {

    // Exibir somente o horário.
    return getLocaleMessage("LABEL.CHAT_LAST_SEEN_TIME") + " " + lastSeen.seconds(0).milliseconds(0).format(this.timeFormat);
  } else {
    // Exibir a data completa.
    return getLocaleMessage("LABEL.CHAT_LAST_SEEN_DATE") + " " + lastSeen.seconds(0).milliseconds(0).format(this.dateTimeFormat);
  }
};

/**
 * Formatar a string de um nome.
 * @param name - Nome para formatar.
 **/
HTMLChat.prototype.formatName = function(name) {
  // NOTA: Essa função é importante pois se o sistema cadastrou o nome
  //       completo do usuário, ele irá exibir somente o Nome + Sobrenome.

  // Verificar pelos nomes.
  if (name && name.indexOf(" ") != -1) {
    var names = name.split(" ");
    return stringToHTMLString((names.length > 1) ? names[0] + " " + names[1] : names[0], true);
  }

  return stringToHTMLString(name, true);
};

/**
 * Abrir o modal de exportação da conversa.
 **/
HTMLChat.prototype.openExportModal = function() {
  if (!this.allowExport || !this.canExport || !this.enabled || this.activeUser == null) return false;
  var object = this;

  // Criar o modal de exportação de conversa.
  var modal = ebfBootstrapCreateModal(getLocaleMessage("LABEL.CHAT_EXPORT_CONVERSATION"),
    true, null, null, null, document.body);

  // Obter elementos do modal.
  var modalDiv = modal[0];
  var modalBody = modal[2];
  var modalFooter = modal[3];

  // Criar row de data da exportação.
  var dateRow = document.createElement("div");
  dateRow.className = "form-row"; // Bootstrap
  modalBody.appendChild(dateRow);

  var dateRowCol1 = document.createElement("div");
  dateRowCol1.className = "col-6"; // Bootstrap
  dateRow.appendChild(dateRowCol1);

  var dateRowCol2 = document.createElement("div");
  dateRowCol2.className = "col-6"; // Bootstrap
  dateRow.appendChild(dateRowCol2);

  // Criar checkbox da data inicial.
  var dateStartCheckboxDiv = document.createElement("div");
  dateStartCheckboxDiv.className = "custom-control custom-checkbox mb-2"; // Bootstrap
  dateRowCol1.appendChild(dateStartCheckboxDiv);

  var dateStartCheckboxInput = document.createElement("input");
  dateStartCheckboxInput.type = "checkbox";
  dateStartCheckboxInput.className = "custom-control-input"; // Bootstrap
  dateStartCheckboxInput.id = modalDiv.id + "-date-start-checkbox";
  dateStartCheckboxDiv.appendChild(dateStartCheckboxInput);

  var dateStartLabel = document.createElement("label");
  dateStartLabel.className = "custom-control-label"; // Bootstrap
  dateStartLabel.setAttribute("for", modalDiv.id + "-date-start-checkbox");
  dateStartLabel.innerHTML = getLocaleMessage("LABEL.CALENDAR_DATE_START");
  dateStartLabel.style.overflow = "visible";
  dateStartCheckboxDiv.appendChild(dateStartLabel);

  // Criar input da data inicial.
  var dateStartInput = document.createElement("input");
  dateStartInput.type = "text";
  dateStartInput.className = "form-control"; // Bootstrap
  dateStartInput.id = modalDiv.id + "-date-start";
  dateStartInput.setAttribute("placeholder", getLocaleMessage("LABEL.CALENDAR_DATE_START"));
  dateStartInput.readOnly = !dateStartCheckboxInput.checked;
  dateRowCol1.appendChild(dateStartInput);

  // Criar checkbox da data final.
  var dateEndCheckboxDiv = document.createElement("div");
  dateEndCheckboxDiv.className = "custom-control custom-checkbox mb-2"; // Bootstrap
  dateRowCol2.appendChild(dateEndCheckboxDiv);

  var dateEndCheckboxInput = document.createElement("input");
  dateEndCheckboxInput.type = "checkbox";
  dateEndCheckboxInput.className = "custom-control-input"; // Bootstrap
  dateEndCheckboxInput.id = modalDiv.id + "-date-end-checkbox";
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
  dateEndInput.readOnly = !dateEndCheckboxInput.checked;
  dateRowCol2.appendChild(dateEndInput);

  // Inicializar o datetimepicker
  var datetimepickerprops = {
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
  $(dateEndInput).datetimepicker(datetimepickerprops);

  // Criar opção de layout da página.
  var messagesOrderDiv = document.createElement("div");
  messagesOrderDiv.className = "mt-3"; // Bootstrap
  modalBody.appendChild(messagesOrderDiv);

  var messagesOrderLabel = document.createElement("label");
  messagesOrderLabel.setAttribute("for", modalDiv.id + "-order");
  messagesOrderLabel.innerHTML = getLocaleMessage("LABEL.CHAT_ORDER");
  messagesOrderDiv.appendChild(messagesOrderLabel);

  var messagesOrderSelect = document.createElement("select");
  messagesOrderSelect.id = modalDiv.id + "-order";
  messagesOrderSelect.className = "custom-select"; // Bootstrap
  messagesOrderDiv.appendChild(messagesOrderSelect);

  var olderToNewer = document.createElement("option");
  olderToNewer.value = "0";
  olderToNewer.innerHTML = getLocaleMessage("LABEL.CHAT_ORDER_OLDER_TO_NEWER");
  olderToNewer.setAttribute("selected", "selected");
  messagesOrderSelect.appendChild(olderToNewer);

  var newerToOlder = document.createElement("option");
  newerToOlder.value = "1";
  newerToOlder.innerHTML = getLocaleMessage("LABEL.CHAT_ORDER_NEWER_TO_OLDER");
  messagesOrderSelect.appendChild(newerToOlder);

  // Criar row de opções da exportação.
  var optionsRow = document.createElement("div");
  optionsRow.className = "form-row mt-3"; // Bootstrap
  modalBody.appendChild(optionsRow);

  var optionsRowCol1 = document.createElement("div");
  optionsRowCol1.className = "col-6"; // Bootstrap
  optionsRow.appendChild(optionsRowCol1);

  var optionsRowCol2 = document.createElement("div");
  optionsRowCol2.className = "col-6"; // Bootstrap
  optionsRow.appendChild(optionsRowCol2);

  // Criar opção de layout da página.
  var pageLayoutLabel = document.createElement("label");
  pageLayoutLabel.setAttribute("for", modalDiv.id + "-page-layout");
  pageLayoutLabel.innerHTML = getLocaleMessage("LABEL.PAGE_DIMENSIONS");
  optionsRowCol1.appendChild(pageLayoutLabel);

  var pageLayoutSelect = document.createElement("select");
  pageLayoutSelect.id = modalDiv.id + "-page-layout";
  pageLayoutSelect.className = "custom-select"; // Bootstrap
  optionsRowCol1.appendChild(pageLayoutSelect);

  // Criar opções de layout de páginas.
  for (var i = 1; i <= 6; i++) { // A1 até A6
    var pageLayoutAi = document.createElement("option");
    pageLayoutAi.value = i.toString();
    pageLayoutAi.innerHTML = "A" + i;
    if (i == 4) pageLayoutAi.setAttribute("selected", "selected"); // A4 selecionado padrão
    pageLayoutSelect.appendChild(pageLayoutAi);
  }

  // Criar opção de estilo da página.
  var pageStyleLabel = document.createElement("label");
  pageStyleLabel.setAttribute("for", modalDiv.id + "-page-style");
  pageStyleLabel.innerHTML = getLocaleMessage("LABEL.STYLE");
  optionsRowCol2.appendChild(pageStyleLabel);

  var pageStyleSelect = document.createElement("select");
  pageStyleSelect.id = modalDiv.id + "-page-style";
  pageStyleSelect.className = "custom-select"; // Bootstrap
  optionsRowCol2.appendChild(pageStyleSelect);

  var pageStyleSimple = document.createElement("option");
  pageStyleSimple.value = "0";
  pageStyleSimple.innerHTML = getLocaleMessage("LABEL.SIMPLE");
  pageStyleSelect.appendChild(pageStyleSimple);

  var pageStyleDark = document.createElement("option");
  pageStyleDark.value = "1";
  pageStyleDark.setAttribute("selected", "selected");
  pageStyleDark.innerHTML = getLocaleMessage("LABEL.DARK");
  pageStyleSelect.appendChild(pageStyleDark);

  // Criar checkbox de rotacionar página.
  var rotatedCheckboxDiv = document.createElement("div");
  rotatedCheckboxDiv.className = "custom-control custom-checkbox mt-3"; // Bootstrap
  modalBody.appendChild(rotatedCheckboxDiv);

  var rotatedCheckboxInput = document.createElement("input");
  rotatedCheckboxInput.type = "checkbox";
  rotatedCheckboxInput.className = "custom-control-input"; // Bootstrap
  rotatedCheckboxInput.id = modalDiv.id + "-rotated-checkbox";
  rotatedCheckboxInput.checked = true;
  rotatedCheckboxDiv.appendChild(rotatedCheckboxInput);

  var rotatedLabel = document.createElement("label");
  rotatedLabel.className = "custom-control-label"; // Bootstrap
  rotatedLabel.setAttribute("for", modalDiv.id + "-rotated-checkbox");
  rotatedLabel.innerHTML = getLocaleMessage("LABEL.ROTATE_PAGE");
  rotatedLabel.style.overflow = "visible";
  rotatedCheckboxDiv.appendChild(rotatedLabel);

  // Criar checkbox de rotacionar página.
  var bordersCheckboxDiv = document.createElement("div");
  bordersCheckboxDiv.className = "custom-control custom-checkbox mt-3"; // Bootstrap
  modalBody.appendChild(bordersCheckboxDiv);

  var bordersCheckboxInput = document.createElement("input");
  bordersCheckboxInput.type = "checkbox";
  bordersCheckboxInput.className = "custom-control-input"; // Bootstrap
  bordersCheckboxInput.id = modalDiv.id + "-borders-checkbox";
  bordersCheckboxInput.checked = false;
  bordersCheckboxDiv.appendChild(bordersCheckboxInput);

  var bordersLabel = document.createElement("label");
  bordersLabel.className = "custom-control-label"; // Bootstrap
  bordersLabel.setAttribute("for", modalDiv.id + "-borders-checkbox");
  bordersLabel.innerHTML = getLocaleMessage("LABEL.BORDERED_TABLE");
  bordersLabel.style.overflow = "visible";
  bordersCheckboxDiv.appendChild(bordersLabel);

  // Criar botões do modal.
  var cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "btn btn-secondary float-right"; // Bootstrap
  cancelButton.innerHTML = this.editable ? getLocaleMessage("LABEL.CANCEL") : getLocaleMessage("LABEL.CLOSE");
  cancelButton.setAttribute("data-dismiss", "modal"); // Bootstrap
  modalFooter.appendChild(cancelButton);

  var exportButton = document.createElement("button");
  exportButton.type = "button";
  exportButton.className = "btn btn-primary float-right mr-2"; // Bootstrap
  exportButton.innerHTML = getLocaleMessage("LABEL.EXPORT");
  modalFooter.appendChild(exportButton);

  // Associar evento de clique ao botão.
  exportButton.onclick = function() {
    var dateStartValue = $(dateStartInput).datetimepicker('date');
    var dateEndValue = $(dateEndInput).datetimepicker('date');

    object.exportConversation(
      /* User: */ object.activeUser.user.id,
      /* Format: */ "PDF",
      /* Order: */ messagesOrderSelect.value,
      /* Layout: */ pageLayoutSelect.value,
      /* Rotated: */ rotatedCheckboxInput.checked,
      /* Style: */ pageStyleSelect.value,
      /* Borders: */ bordersCheckboxInput.checked,
      /* Date Start: */ dateStartCheckboxInput.checked && dateStartValue != null ?
        dateStartValue.utc().toISOString() : null,
      /* Date End: */ dateEndCheckboxInput.checked && dateEndValue != null ?
        dateEndValue.utc().toISOString() : null);

    // Fechar o modal.
    ebfBootstrapCloseModal(modalDiv);
  };

  // Associar eventos aos elementos do modal.
  dateStartCheckboxInput.onchange = function() { dateStartInput.readOnly = !dateStartCheckboxInput.checked; };
  dateEndCheckboxInput.onchange = function() { dateEndInput.readOnly = !dateEndCheckboxInput.checked; };
};

/**
 * Exportar uma conversa.
 * @param user - Identificador do usuário para exportar a conversa.
 * @param format - Formato da exportação (pode ser: PDF).
 * @param order - Ordem das mensagens na tabela (0: antigas para novas, 1: novas para antigas).
 * @param layout - Layout da página (de 1 a 6, onde 1 é A1 e 6 é A6).
 * @param rotated - Rotacionar página?
 * @param style - Estilo da tabela (0: simples, 1: escuro).
 * @param borders - Bordas na tabela?
 * @param dateStart - Data inicial da query (pode ser nulo).
 * @param dateEnd - Data final da query (pode ser nulo).
 **/
HTMLChat.prototype.exportConversation = function(user, format, order, layout, rotated, style, borders, dateStart, dateEnd) {
  if (!this.allowExport) return false;

  // Criar iframe para baixar o documento.
  if (!this.requestFrame) {
    this.requestFrame = document.createElement("iframe");
    this.requestFrame.className = "d-none"; // Bootstrap
    this.div.appendChild(this.requestFrame);
  }

  // Definir URL do iframe com os parâmetros.
  this.requestFrame.src = getAbsolutContextPath() + "WFRChatExport?sys=" + URLEncode(this.sys, "GET") + "&formID=" +
    URLEncode(this.formID, "GET") + "&comID=" + URLEncode(this.code, "GET") +
    "&type=" + format + "&req=" + URLEncode(user, "GET") +
    (order && order.length > 0 ? "&order=" + order : "") +
    (layout && layout.length > 0 ? "&layout=" + layout : "") +
    (rotated === true ? "&rotated=1" : "&rotated=0") +
    (style && style.length > 0 ? "&style=" + style : "") +
    (borders === true ? "&borders=1" : "&borders=0") +
    (dateStart && dateStart.length > 0 ? "&from=" + URLEncode(dateStart, "GET") : "") +
    (dateEnd && dateEnd.length > 0 ? "&to=" + URLEncode(dateEnd, "GET") : "");
};

/**
 * Limpa todos os dados deste componente.
 **/
HTMLChat.prototype.flush = function() {
  // Resetar variáveis
  this.activeConvBottomDiv = null;
  this.activeConvDiv = null;
  this.activeConvUserDiv = null;
  this.activeConvUserName = null;
  this.activeConvUserPicture = null;
  this.activeConvUserPictureDefault = null;
  this.activeConvUserPictureDefaultClass = null;
  this.activeConvUserPictureLink = null;
  this.activeConvUserState = null;
  this.activeScreen = null;
  this.acrtiveUser = null;
  this.allowExport = null;
  this.backButton = null;
  this.backButtonClass = null;
  this.cachedUsers = null;
  this.chatMessageContent = null;
  this.chatMessageDiv = null;
  this.chatMessageDivClass = null;
  this.chatMessageIcon = null;
  this.chatMessageTitle = null;
  this.connectionError = null;
  this.contentDiv = null;
  this.contentDivClass = null;
  this.expandOnClick = null;
  this.fullscreen = null;
  this.leftColumn = null;
  this.leftColumnClass = null;
  this.leftNavbar = null;
  this.listScrollDiv = null;
  this.loadedMessagesAmount = null;
  this.mobile = null;
  this.preloader = null;
  this.preloaderClass = null;
  this.rightColumn = null;
  this.rightColumnClass = null;
  this.rightDropdownMenu = null;
  this.rightNavbar = null;
  this.rightOptionsButton = null;
  this.searchDiv = null;
  this.searchInput = null;
  this.searchResults = null;
  this.sendButton = null;
  this.sendToEveryoneButton = null;
  this.sendToEveryoneContainer = null;
  this.showLastSeen = null;
  this.showReadConfirmation = null;
  this.showSearch = null;
  this.showSendToEveryone = null;
  this.showUserStates = null;
  this.userName = null;
  this.userPicture = null;
  this.userPictureLink = null;
  this.usersList = null;
  this.usersListClass = null;
  this.pageVisible = null;

  // Limpar div principal.
  this.div.innerHTML = "";

  // Fechar conexão com o socket, se existir.
  if (this.socket) {
    try { this.socket.close(); } catch (e) { }
    this.socket = null;
  }

  this.callMethod(HTMLElementBase, "flush", []);
};



/**
 * Método construtor do HTMLChatContainer. Responsável por armazenar os dados de uma conversa.
 * @param chat - A instância do chat.
 * @param user - O usuário relacionado à essa conversa.
 * @param item - Referência para a div do usuário.
 * @param itemPicture - Referência para o elemento da imagem do usuário.
 * @param itemName - Referência para o elemento do nome do usuário.
 * @param itemLast - Referência para o elemento da última mensagem do usuário.
 * @param itemLastBadge - Referência para a quantidade de mensagens não lidas.
 **/
function HTMLChatContainer(chat, index, user, item, itemPicture, itemName, itemLast, itemLastBadge) {
  this.chat = chat;
  this.index = index;
  this.user = user;

  if (item) {
    this.item = item;
    this.itemClass = item.className;
  }

  this.itemPicture = itemPicture;
  this.itemName = itemName;
  this.itemLast = itemLast;

  if (itemLastBadge) {
    this.itemLastBadge = itemLastBadge;
    this.itemLastBadgeClass = itemLastBadge.className;
  }

  this.sections = [];
  this.active = false;
  this.scroll = 0;

  this.hasUnreadMessages = false;
  this.unreadMessages = 0;
}

/**
 * Setando propriedades do componente.
 **/
HTMLChatContainer.prototype.name = 'HTMLChatContainer';

/**
 * Altera o estado de ativo deste usuário.
 **/
HTMLChatContainer.prototype.setActive = function(active) {
  // Definir estado de ativo deste usuário.
  this.active = active;

  // Desmarcar usuário ativo.
  if (this.chat.activeUser && (!active || this.chat.activeUser != this)) {
    // Resetar estado de ativo do usuário anterior.
    this.chat.activeUser.active = false;

    // Resetar estilo do item do usuário na lista de usuários.
    if (this.chat.activeUser.item) this.chat.activeUser.item.className = this.chat.activeUser.itemClass;
    if (this.chat.activeUser.itemLast) this.chat.activeUser.itemLast.className = "d-inline-block text-truncate text-muted mb-0"; // Bootstrap

    // Se for enviar mensagem para todos, remover o ícone da barra superior.
    if (this.chat.sendToEveryoneIconDiv !== undefined && this.chat.sendToEveryoneIconDiv !== null) {
      this.chat.activeConvUserDiv.removeChild(this.chat.sendToEveryoneIconDiv);
      this.chat.sendToEveryoneIconDiv = null;
    }

    // Guardar scroll antigo.
    this.chat.activeUser.scroll = this.chat.activeConvDiv.scrollTop;

    // Remover spinner de carregamento antigo.
    this.chat.activeUser.removePreloader();

    // Resetar variável.
    this.chat.activeUser = null;
  }

  // Limpar container da conversa.
  this.chat.activeConvDiv.innerHTML = "";
  this.chat.activeConvUserState.innerHTML = "";

  var lastChanged = false;

  if (active) {
    // Resetar variáveis de mensagens não lidas.
    this.hasUnreadMessages = false;
    this.unreadMessages = 0;

    // Definir este container como ativo.
    this.chat.activeUser = this;
    this.chat.activeScreen = 1;

    // Atualizar elementos da conversa ativa.
    if (this.itemPicture && this.itemPicture.src && this.itemPicture.src.length > 0) {
      // Habilitar o botão de abrir menu de opções.
      if (this.chat.rightOptionsButton) this.chat.rightOptionsButton.disabled = false;

      // Esconder o ícone de foto padrão.
      if (this.chat.activeConvUserPictureDefault) {
        this.chat.activeConvUserPictureDefault.className = "d-none"; // Bootstrap
      }

      // Atualizar imagem do usuário.
      this.chat.activeConvUserPicture.className = "rounded-circle"; // Bootstrap
      this.chat.activeConvUserPicture.src = this.itemPicture.src;
      if (this.chat.activeConvUserPictureLink) {
        this.chat.activeConvUserPictureLink.href = this.chat.activeConvUserPicture.src;
      }
    } else if (this.index == -1) {
      // Desabilitar o botão de abrir menu de opções.
      if (this.chat.rightOptionsButton) this.chat.rightOptionsButton.disabled = true;

      // Resetar imagem de exibição do usuário.
      this.chat.activeConvUserPicture.className = "d-none"; // Bootstrap
      this.chat.activeConvUserPicture.src = "";
      this.chat.activeConvUserPicture.alt = "";
      this.chat.activeConvUserPictureLink.href = "#";
      if (this.chat.activeConvUserPictureDefault) {
        this.chat.activeConvUserPictureDefault.className = "d-none"; // Bootstrap
      }

      if (this.chat.sendToEveryoneIconDiv === undefined || this.chat.sendToEveryoneIconDiv === null) {
        // Criar o espaçador para manter a proporção da div superior.
        this.chat.sendToEveryoneIconDiv = document.createElement("div");
        this.chat.sendToEveryoneIconDiv.className = "rounded-circle bg-light border d-flex align-items-center justify-content-center"; // Bootstrap
        this.chat.sendToEveryoneIconDiv.style.width = this.chat.photoSize + "px";
        this.chat.sendToEveryoneIconDiv.style.height = this.chat.photoSize + "px";
        this.chat.activeConvUserDiv.insertBefore(this.chat.sendToEveryoneIconDiv, this.chat.activeConvUserDiv.firstChild);

        var sendToEveryoneIcon = document.createElement("i");
        sendToEveryoneIcon.className = "fas fa-globe text-dark"; // Font Awesome
        sendToEveryoneIcon.style.opacity = "0.5";
        sendToEveryoneIcon.style.fontSize = "1.25rem";
        this.chat.sendToEveryoneIconDiv.appendChild(sendToEveryoneIcon);
      }
    } else {
      // Habilitar o botão de abrir menu de opções.
      if (this.chat.rightOptionsButton) this.chat.rightOptionsButton.disabled = false;

      // Verificar se a imagem sem foto não foi definida.
      if ((!this.ImagemSemFoto || this.ImagemSemFoto.length == 0) && this.chat.activeConvUserPictureDefault) {
        // Ocultar a imagem sem foto e exibir o ícone de sem foto.
        this.chat.activeConvUserPicture.className = "d-none"; // Bootstrap
        this.chat.activeConvUserPictureDefault.className = this.chat.activeConvUserPictureDefaultClass;
      } else {
        // Atualizar a imagem do usuário para a imagem sem foto.
        this.chat.activeConvUserPicture.className = "rounded-circle"; // Bootstrap
        this.chat.activeConvUserPicture.src = this.getImageSourceURL(this.ImagemSemFoto);
        if (this.chat.activeConvUserPictureLink) {
          this.chat.activeConvUserPictureLink.href = this.chat.activeConvUserPicture.src;
        }
      }
    }

    if (this.itemName) this.chat.activeConvUserName.innerHTML = this.itemName.innerHTML;
    else if (this.index == -1) this.chat.activeConvUserName.innerHTML = getLocaleMessage("LABEL.CHAT_SEND_TO_EVERYONE");
    else this.chat.activeConvUserName.innerHTML = "";

    // Associar evento scroll para obter histórico.
    var object = this;
    this.chat.activeConvDiv.onscroll = function() {
      if (object.active && object.chat.activeConvDiv.scrollTop == 0) {
        object.getHistoryMessages();
      }
    };

    // Atualizar layout do chat.
    this.chat.updateLayout();

    // Verificar o estado do usuário.
    if (this.chat.showUserStates && this.user && this.user.state) {
      switch (this.user.state) {
        case "1": this.chat.activeConvUserState.innerHTML = getLocaleMessage("LABEL.CHAT_ONLINE"); break;
        case "2": this.chat.activeConvUserState.innerHTML = this.chat.formatLastSeen(
          this.chat.showLastSeen && this.user.lastSeen ? moment(this.user.lastSeen).local() : null); break;
        default: this.chat.activeConvUserState.innerHTML = ""; break;
      }
    } else {
      this.chat.activeConvUserState.innerHTML = "";
    }

    // Resetar variáveis.
    this.olderMessage = null;
    this.newerMessage = null;

    // Verificar se existem mensagens com este usuário.
    if (this.sections && this.sections.length > 0) {
      // Dar loop nas seções dos dias.
      for (var i = 0; i < this.sections.length; i++) {
        var section = this.sections[i];

        // Desenhar div da sessão.
        this.designSection(section.date);

        // Verificar se existem mensagens na seção do dia atual.
        if (section.messages && section.messages.length > 0) {
          // Dar loop nas mensagens da sessão.
          for (var j = 0; j < section.messages.length; j++) {
            var message = section.messages[j];

            // Desenhar a mensagem no container.
            this.designMessage(message, section, false);

            // Verificar se é a ultima mensagem da última sessão.
            if (i == this.sections.length - 1 && j == section.messages.length - 1) {
              this.setLastMessageContent(message.message);
              this.newerMessage = message;
              lastChanged = true;

            // Verificar se a primeira mensagem do chat.
            } else if (i == 0 && j == 0) {
              this.olderMessage = message;
            }

            var internalMessage = (message.from === this.chat.user.user.id);
            if (!internalMessage && !message.sentConfirmation) {
              // Enviar a mensagem para o servidor informando que leu a mensagem.
              this.chat.socket.send(JSON.stringify({
                type: "read",
                id: message.id + "-r",
                messageId: message.id,
                from: this.chat.user.user.id,
                destination: message.from
              }));

              message.sentConfirmation = true;
            }
          }
        }
      }

      // Restaurar posição da barra de rolagem.
      if (this.scroll) this.chat.activeConvDiv.scrollTop = this.scroll;
      else this.scrollToBottom();
    }

    if (!lastChanged && this.itemLast) {
      this.setLastMessageContent(null);
    }

    // Obter mensagens do histórico.
    this.getHistoryMessages();
  }
};

/**
 * Criar o spinner de carregamento.
 **/
HTMLChatContainer.prototype.createPreloader = function() {
  try {
    if (!this.preloader) {
      // Criar a div base da seção do preloader.
      this.preloader = document.createElement("div");
      this.preloader.className = "d-flex align-items-center justify-content-center py-3"; // Bootstrap

      // Criar o spinner na div base.
      var spinner = bootstrapCreateSpinner(this.preloader, "text-primary", false); // Bootstrap
      spinner[0].style.fontSize = "1rem";
      spinner[0].style.width = "1.7rem";
      spinner[0].style.height = "1.7rem";

      // Adicionar a div base na conversa.
      if (this.chat.activeConvDiv.childElementCount > 0) {
        this.chat.activeConvDiv.insertBefore(this.preloader, this.chat.activeConvDiv.firstChild);
      } else {
        this.chat.activeConvDiv.appendChild(this.preloader);
      }

      // Ajustar scroll.
      this.chat.activeConvDiv.scrollTop = 0;
    }
  } catch (e) { }
};

/**
 * Remove o spinner de carregamento.
 **/
HTMLChatContainer.prototype.removePreloader = function() {
  try {
    if (this.preloader) {
        this.chat.activeConvDiv.removeChild(this.preloader);
        this.preloader = null;
    }
  } catch (e) { }
};

/**
 * Define a última mensagem enviada relacionada a este usuário.
 * @param msg - Conteúdo da última mensagem enviada.
 **/
HTMLChatContainer.prototype.setLastMessageContent = function(msg) {
  if (this.itemLast) {
    if (msg === null || msg === undefined || msg.length == 0) {
      this.itemLast.innerHTML = "";
    } else {
      // Remover caracteres de nova linha e substituir por espaços.
      msg = msg.replace(/\r?\n|\r/g, " ");

      // Definir o texto no elemento.
      this.itemLast.innerHTML = stringToHTMLString(
        msg.length > 25 ? msg.substring(0, 25) + "..." : msg);
    }
  }
};

/**
 * Trata uma mensagem destinada a este usuário.
 * @param msg - Um objeto contendo os dados da mensagem enviada/recebida.
 **/
HTMLChatContainer.prototype.handleMessage = function(msg, top) {
  // Não tratar a mensagem se ela já foi tratada.
  if (this.getMessageById(msg.id)) return false;

  // Obter a data da mensagem e se ela é interna.
  var date = moment(msg.time).local();
  var internalMessage = (msg.from === this.chat.user.user.id);

  // Mover item do usuário pro topo da lista.
  if (this.index != -1 && !msg.everyone && !top) this.moveToTop();

  // Verificar se a data da mensagem é mais antiga que a mensagem mais antiga atual.
  if (!this.olderMessage || date.isBefore(moment(this.olderMessage.time).local())) {
    this.olderMessage = msg;
  }

  // Verificar se a data da mensagem é mais nova que a mensagem mais nova atual.
  if (!this.newerMessage || date.isAfter(moment(this.newerMessage.time).local())) {
    this.newerMessage = msg;
    this.setLastMessageContent(msg.message);
  }

  // Obter a sessão destinada a mensagem.
  var section = this.createSection(date, top);

  // Verificar se a conversa está ativa.
  if (this.active) {
    // Verificar se a barra de rolagem está na parte inferior.
    var onBottom = (this.chat.activeConvDiv.scrollTop ==
      this.chat.activeConvDiv.scrollHeight -
      this.chat.activeConvDiv.clientHeight);

    // Se estiver ativo, desenhar a mensagem.
    this.designMessage(msg, section, top);

    // Rolar para baixo se a barra de rolagem já estava na parte inferior.
    if (onBottom) this.scrollToBottom();

    // Verificar se esta não é uma mensagem interna.
    if (!internalMessage && !msg.sentConfirmation && (!msg.status || msg.status < 3)) {
      if ((!msg.status || msg.status < 2)) {
        // Enviar a mensagem para o servidor informando que recebeu a mensagem.
        this.chat.socket.send(JSON.stringify({
          type: "received",
          id: msg.id,
          from: msg.from,
          destination: msg.destination
        }));
      }

      // Enviar a mensagem para o servidor informando que leu a mensagem.
      this.chat.socket.send(JSON.stringify({
        type: "read",
        id: msg.id + "-r",
        messageId: msg.id,
        from: this.chat.user.user.id,
        destination: msg.from
      }));

      // Salvar que a confirmação de leitura da mensagem já foi enviada.
      msg.sentConfirmation = true;
    }
  } else if (!internalMessage) {
    // A conversa não está ativa, incrementar contador.
    this.setTotalUnreadMessages(this.unreadMessages + 1);
  }

  // Adicionar a lista de mensagens da sessão.
  if (top) section.messages.unshift(msg);
  else section.messages.push(msg);

  // Exibir notificação na área de trabalho.
  if (this.index != -1 && !internalMessage && !top && this.chat.canShowDesktopNotifications()) {
    this.chat.showDesktopNotification(this.user.name, this.itemPicture.src, msg.message);
  }
};

/**
 * Rola a barra de rolagem para o final.
 **/
HTMLChatContainer.prototype.scrollToBottom = function() {
  this.chat.activeConvDiv.scrollTop = this.chat.activeConvDiv.scrollHeight - this.chat.activeConvDiv.clientHeight;
};

/**
 * Move o item deste usuário para o topo da lista de usuários.
 **/
HTMLChatContainer.prototype.moveToTop = function() {
  if (this.index != -1 && this.item) this.chat.usersList.insertBefore(this.item, this.chat.usersList.firstChild);
};

/**
 * Responsável por desenhar os elementos das sessões.
 **/
HTMLChatContainer.prototype.designSection = function(date, top) {
  // Obter o dia atual pelo moment.
  var today = moment();

  // Criar a div base da seção.
  var sectionDiv = document.createElement("div");
  sectionDiv.className = "d-flex align-items-center justify-content-center"; // Bootstrap

  // Criar a div da data da seção.
  var sectionDateDiv = document.createElement("div");
  sectionDateDiv.className = "bg-secondary text-white my-1 px-3 py-1 rounded"; // Bootstrap
  sectionDateDiv.innerHTML = stringToHTMLString(
    date.isSame(today, 'day') ? getLocaleMessage("LABEL.TODAY") : // Hoje
    date.isSame(today.subtract(1, 'days'), 'day') ? getLocaleMessage("LABEL.YESTERDAY") : // Ontem
    date.format(this.chat.dateFormat));
  sectionDiv.appendChild(sectionDateDiv);

  if (top && this.chat.activeConvDiv.childElementCount > 0)
    this.chat.activeConvDiv.insertBefore(sectionDiv, this.chat.activeConvDiv.firstChild);
  else this.chat.activeConvDiv.appendChild(sectionDiv);
  return sectionDiv;
};

/**
 * Responsável por desenhar os elementos das mensagens.
 * @param msg - Um objeto contendo os dados da mensagem enviada/recebida.
 * @param section - Sessão da mensagem.
 **/
HTMLChatContainer.prototype.designMessage = function(msg, section, top) {
  var internalMessage = (msg.from === this.chat.user.user.id);

  // Criar div base da mensagem.
  var messageWrapper = document.createElement("div");
  messageWrapper.className = "w-100 d-flex flex-column " + // Bootstrap
    (internalMessage ? "align-items-end" : "align-items-start"); // Bootstrap

  // Criar div do balão da mensagem.
  var messageDiv = document.createElement("div");
  messageDiv.className = internalMessage ?
    "d-flex flex-row w-auto h-auto overflow-hidden px-3 py-2 my-1 bg-white text-dark border rounded shadow-sm" : // Bootstrap
    "d-flex flex-row w-auto h-auto overflow-hidden px-3 py-2 my-1 bg-dark text-white rounded shadow-sm"; // Bootstrap
  messageDiv.style.maxWidth = "65%";
  messageWrapper.appendChild(messageDiv);

  // Criar span do conteúdo da mensagem.
  var messageContentDiv = document.createElement("span");
  messageContentDiv.className = "w-100 h-auto"; // Bootstrap
  messageContentDiv.style.wordBreak = "break-all";
  messageContentDiv.innerHTML = stringToHTMLString(msg.message);
  messageDiv.appendChild(messageContentDiv);

  // Criar span do tempo da mensagem.
  var messageTimeDiv = document.createElement("span");
  messageTimeDiv.className = "align-self-end ml-3"; // Bootstrap
  messageTimeDiv.style.fontSize = "0.75rem";
  messageTimeDiv.style.opacity = "0.5";
  messageTimeDiv.innerHTML = moment(msg.time).local().format("LT"); // LT - Horário (ex 09:00)
  messageDiv.appendChild(messageTimeDiv);

  // Criar span do tempo da mensagem.
  if (internalMessage) {
    var messageStatusDiv = document.createElement("i");
    messageStatusDiv.className = "align-self-end ml-1" + // Bootstrap
      (msg.everyone ? " fas fa-globe" : msg.status ? // Font Awesome
        ((msg.status == 1) ? " fas fa-check" : // Font Awesome
        (msg.status == 2) ? " fas fa-check-double pb-1" : // Font Awesome
        (msg.status == 3) ? " fas fa-check-double pb-1 text-primary": "") : // Font Awesome - Bootstrap
      " far fa-clock"); // Font Awesome
    messageStatusDiv.style.fontSize = "0.75rem";
    messageStatusDiv.style.opacity = (msg.status && msg.status == 3) ? "1.0" : "0.5";
    messageDiv.appendChild(messageStatusDiv);
    msg.itemStatus = messageStatusDiv;
  }

  if (top && section.div) $(messageWrapper).insertAfter(section.div);
  else this.chat.activeConvDiv.appendChild(messageWrapper);
  return messageWrapper;
};

/**
 * Cria uma sessão neste container.
 * @param date - A data da sessão.
 **/
HTMLChatContainer.prototype.createSection = function(date, top) {
  // Verificar se a seção existe.
  var section = this.getSectionByDate(date);
  if (section == null) {
    // Criar a seção.
    section = {
      date: date,
      messages: []
    };

    if (this.active) {
      // Desenhar div da sessão.
      section.div = this.designSection(section.date, top);
    }

    // Adicionar a lista de seções.
    if (top && this.sections.length > 1) this.sections.unshift(section);
    else this.sections.push(section);

    // Organizar as seções.
    this.sections.sort(function(a, b) {
      return a.date.diff(b.date);
    });
  }

  return section;
};

/**
 * Procura uma sessão pela data.
 * @param date - A data da sessão.
 **/
HTMLChatContainer.prototype.getSectionByDate = function(date) {
  // Verificar se este container tem seções de dias.
  if (this.sections && this.sections.length > 0) {
    // Dar loop nas seções de dias neste container.
    for (var i = 0; i < this.sections.length; i++) {
      // Verificar se a data da seção é a mesma que a data especificada.
      if (this.sections[i].date.isSame(date, 'day')) return this.sections[i];
    }
  }

  return null;
};

/**
 * Procura uma mensagem em cache pelo seu identificador.
 * @param id - O identificador da mensagem.
 **/
HTMLChatContainer.prototype.getMessageById = function(id) {
  // Verificar se este container tem seções de dias.
  if (this.sections && this.sections.length > 0) {
    // Dar loop nas seções de dias neste container.
    for (var i = 0; i < this.sections.length; i++) {
      var section = this.sections[i];

      // Verificar se a seção atual tem mensagens.
      if (section.messages && section.messages.length > 0) {
        // Dar loop nas mensagens da seção.
        for (var j = 0; j < section.messages.length; j++) {
          // Verificar se a mensagem possui o identificador especificado.
          if (section.messages[j].id == id) return section.messages[j];
        }
      }
    }
  }

  return null;
};

/**
 * Define o status de uma mensagem enviada.
 * @param id - O identificador da mensagem.
 * @param status - Status da mensagem (1: recebida pelo servidor, 2: recebida pelo destinatário, 3: destinatário leu)
 **/
HTMLChatContainer.prototype.setMessageStatus = function(id, status) {
  var message = this.getMessageById(id);
  if (message) {
    message.status = (!message.status || status > message.status) ? status : message.status;
    if (message.itemStatus) {
      message.itemStatus.className = "align-self-end ml-1" + // Bootstrap
        ((status == 1) ? " fas fa-check" : // Font Awesome
         (status == 2) ? " fas fa-check-double pb-1" : // Font Awesome
         (status == 3) ? " fas fa-check-double pb-1 text-primary": ""); // Font Awesome - Bootstrap
      if (status == 3) message.itemStatus.style.opacity = "1.0";
    }
  }
};

/**
 * Obter o total de mensagens neste container.
 **/
HTMLChatContainer.prototype.getTotalMessages = function() {
  var total = 0;

  // Verificar se este container tem seções de dias.
  if (this.sections && this.sections.length > 0) {
    // Dar loop nas seções de dias neste container.
    for (var i = 0; i < this.sections.length; i++) {
      var section = this.sections[i];

      // Verificar se a seção atual tem mensagens.
      if (section.messages && section.messages.length > 0) {
        total += section.messages.length;
      }
    }
  }

  return total;
};

/**
 * Obter a seção que está no topo do chat (a mais antiga).
 **/
HTMLChatContainer.prototype.getTopSection = function() {
  var topSection = null;

  // Verificar se este container tem seções de dias.
  if (this.sections && this.sections.length > 0) {
    // Dar loop nas seções de dias neste container.
    for (var i = 0; i < this.sections.length; i++) {
      var section = this.sections[i];

      // Verificar se a data da seção é mais antiga.
      if (topSection == null || section.date.isBefore(topSection.date)) {
        topSection = section;
      }
    }
  }

  return topSection;
};

/**
 * Obter a mensagem que está no topo do chat (a mais antiga).
 **/
HTMLChatContainer.prototype.getTopMessage = function() {
  var topMessage = null;

  // Obter a seção mais antiga do chat.
  var topSection = this.getTopSection();

  // Verificar se a seção tem mensagens.
  if (topSection.messages && topSection.messages.length > 0) {
    // Dar loop nas mensagens da seção.
    for (var j = 0; j < topSection.messages.length; j++) {
      // Verificar se a data da mensagem é mais antiga.
      if (topMessage == null || topMessagemoment(topSection.messages[j].time).local().isBefore(moment(topMessage.time).local())) {
        topMessage = topSection.messages[j];
      }
    }
  }

  return topMessage;
};

/**
 * Obtém o histórico de mensagens do chat.
 **/
HTMLChatContainer.prototype.getHistoryMessages = function() {
  // Verificar se a seção é a de enviar mensagem para todos ou se está em requisição.
  if (this.index == -1 || this.inRequest) {
    if (!this.inRequest) {
      // Remover preloader.
      this.removePreloader();
    }

    return;
  }

  // Obter o total de mensagens na memória.
  var totalMessages = this.getTotalMessages();

  // Verificar se o chat deve carregar mais mensagens.
  // Condições: A barra de rolagem no topo ou quantidade total de mensagens
  //            menor que a quantidade de mensagens que devem ser carregadas.
  if (this.chat.activeConvDiv.scrollTop == 0 || totalMessages < this.chat.loadedMessagesAmount) {
    // Montar a URL do pedido.
    var baseURL = this.chat.getRequestURL() + "&type=m&req=" + URLEncode(this.user.id, 'GET');
    if (totalMessages > 0 && this.olderMessage) baseURL += "&message=" + URLEncode(this.olderMessage.id, 'GET') + "&direction=0";

    // Definir variável.
    this.inRequest = true;

    // Criar preloader.
    this.createPreloader();

    // Obter o histórico de mensagens do servidor.
    var object = this;
    $.get(baseURL, function(response) {
      // Verificar se a resposta tem mensagens.
      if (response && response.messages && response.messages != "false") {
        var oldScrollHeight = object.chat.activeConvDiv.scrollHeight;

        // Dar loop nas mensagens antigas.
        for (var i = 0; i < response.messages.length; i++) {
          // Lidar com a mensagem e adicionar ao container no topo.
          object.handleMessage(response.messages[i], true);
        }

        // Verificar se o container ainda está ativo.
        if (object.active) {
          // Se não tinha nenhuma mensagem antes, rolar a barra para baixo.
          if (totalMessages == 0) object.scrollToBottom();

          // Se tinha mensagem, calcular a diferença.
          else {
            object.setActive(true);
            object.chat.activeConvDiv.scrollTop = object.chat.activeConvDiv.scrollHeight - oldScrollHeight;
          }
        }
      }

      // Resetar variável.
      object.inRequest = false;

      // Remover preloader.
      object.removePreloader();
    }).fail(function() {
      // Resetar variável.
      object.inRequest = false;

      // Remover preloader.
      object.removePreloader();
    });
  } else {
    // Remover preloader.
    this.removePreloader();
  }
};

/**
 * Define o total de mensagens não lidas com o usuário.
 * @param total Total de mensagens não lidas.
 **/
HTMLChatContainer.prototype.setTotalUnreadMessages = function(total) {
  this.unreadMessages = total;
  this.hasUnreadMessages = (total > 0);

  if (this.itemLastBadge) {
    this.itemLastBadge.innerHTML = (total > 0) ? total.toString() : "";
    this.itemLastBadge.className = (total > 0) ? this.itemLastBadgeClass : "d-none"; // Bootstrap
  }
};
