/**
 * Método construtor do HTMLChat. Responsável por criar o componente Chat.
 * @param sys Indica o código do sistema.
 * @param formID Indica o código do formulário.
 * @param posX Posição do componente na tela em relação ao eixo X.
 * @param posY Posição do componente na tela em relação ao eixo Y.
 * @param width Largura do componente.
 * @param heigth Altura do componente.
 * @param description Descricao do componente.
 * @param value Valor do componente.
 **/
function HTMLChat(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);

  this.cachedContainers = [];
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

  // Configurar o JQuery para mandar os cookies nas requisições AJAX.
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

// Tipo do formato padrão de imagem.
HTMLChat.prototype.imageMimeType = "image/png";
HTMLChat.prototype.imageFileExtension = ".png";

// Tipo do formato padrão de áudio.
HTMLChat.prototype.audioMimeType = "audio/webm";
HTMLChat.prototype.audioFileExtension = ".webm";

// Se estiver em um ambiente HTPPS deve usar WSS.
HTMLChat.prototype.protocol = getAbsolutContextPath().startsWith("https://") ? "wss://" : "ws://";

// Tempo em milissegundos para um item na lista de usuários/grupos
// ser clicado quando está com algum arquivo sendo arrastado em cima.
HTMLChat.prototype.dragItemActionInterval = 250;

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
 * @param doc Documento onde o componente será inserido.
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

  if (this.ExibirNotificacoesAreaDeTrabalho && this.ExibirNotificacoesAreaDeTrabalho.length) {
    this.showDesktopNotifications = (this.ExibirNotificacoesAreaDeTrabalho.toLowerCase() == "true");
    this.ExibirNotificacoesAreaDeTrabalho = null;
  } else this.showDesktopNotifications = true;

  this.showSendToEveryone = (this.EnviarTodos && this.EnviarTodos.length && this.EnviarTodos.toLowerCase() == "true");
  this.fullscreen = (this.TelaCheia && this.TelaCheia.length && this.TelaCheia.toLowerCase() == "true");
  this.allowExport = (this.PermitirExportacao && this.PermitirExportacao.length && this.PermitirExportacao.toLowerCase() == "true");
  this.allowSendMedia = (this.PermitirEnvioDeMidias && this.PermitirEnvioDeMidias.length && this.PermitirEnvioDeMidias.toLowerCase() == "true");
  this.allowCreateGroups = (this.PermitirCriacaoDeGrupos && this.PermitirCriacaoDeGrupos.length && this.PermitirCriacaoDeGrupos.toLowerCase() == "true");

  this.EnviarTodos = null;
  this.TelaCheia = null;
  this.PermitirExportacao = null;
  this.PermitirEnvioDeMidias = null;
  this.PermitirCriacaoDeGrupos = null;

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

  // Preparar o locale do moment.
  var definedLocale = resources_locale.toLowerCase();
  if (definedLocale == 'en_us') this.locale = 'en';
  else if (definedLocale == 'pt_br') this.locale = 'pt-br';
  else if (definedLocale == 'es_es') this.locale = 'es';
  else if (definedLocale == 'fr_fr') this.locale = 'fr';
  else this.locale = 'en';

  // Definir o locale do Moment
  moment.locale(this.locale);

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
    this.divClass = "chat-layout chat-layout-fullscreen position-relative d-flex w-100 h-100 mb-0"; // Bootstrap
    this.div.className = this.divClass;
    this.div.style.left = null;
    this.div.style.top = null;
  } else {
    this.divClass += " chat-layout card overflow-hidden d-flex"; // Bootstrap
    this.div.className = this.divClass;
  }

  // Criar a div row do chat.
  this.contentDiv = document.createElement("div");
  this.contentDivClass = "chat-layout-content row no-gutters w-100 mh-100 flex-fill m-0"; // Bootstrap
  this.contentDiv.className = this.contentDivClass;
  this.contentDivClass = this.contentDiv.className;
  this.div.appendChild(this.contentDiv);

  // Criar a coluna da esquerda na row.
  this.leftColumn = document.createElement("div");
  this.leftColumnClass = "chat-layout-left-col col-sm-5 col-md-4 col-lg-3 p-0 d-flex flex-column h-100 border-right"; // Bootstrap
  this.leftColumn.className = this.leftColumnClass;
  this.contentDiv.appendChild(this.leftColumn);

  // Criar a navbar da esquerda do chat.
  this.leftNavbar = document.createElement("nav");
  this.leftNavbar.className = "chat-layout-left-nav navbar navbar-light bg-white mb-0 flex-nowrap"; // Bootstrap
  if (!this.showSearch) this.leftNavbar.className += " border-bottom"; // Bootstrap
  this.leftColumn.appendChild(this.leftNavbar);

  // Criar div do usuário na navbar.
  var userDiv = document.createElement("div");
  userDiv.className = "d-flex flex-row align-items-center mr-auto text-truncate"; // Bootstrap
  this.leftNavbar.appendChild(userDiv);

  if (this.ImagemSemFoto && this.ImagemSemFoto.length > 0) {
    this.userPicture = document.createElement("img");
    this.userPicture.className = "rounded-circle bg-light"; // Bootstrap
    this.userPicture.width = this.photoSize;
    this.userPicture.height = this.photoSize;
    this.userPicture.style.minWidth = this.photoSize + "px";
    this.userPicture.setAttribute("alt", "");

    // Verificar se as fotos expandem ao serem clicadas.
    if (this.expandOnClick) {
      // Criar elemento A para o fancybox.
      this.userPictureLink = document.createElement("a");
      this.userPictureLink.href = "#";
      this.userPictureLink.appendChild(this.userPicture);
      userDiv.appendChild(this.userPictureLink);

      try {
        // Inicializar Fancybox no elemento.
        $(this.userPictureLink).fancybox({
          closeExisting: true,
          keyboard: true,
          arrows: true,
          protect: true
        });
      } catch (e) { }
    } else {
      userDiv.appendChild(this.userPicture);
    }
  } else {
    this.userPicture = document.createElement("div");
    this.userPicture.className = "rounded-circle bg-light border d-flex align-items-center justify-content-center"; // Bootstrap
    this.userPicture.style.width = this.photoSize + "px";
    this.userPicture.style.minWidth = this.photoSize + "px";
    this.userPicture.style.height = this.photoSize + "px";
    userDiv.appendChild(this.userPicture);

    var userPictureIcon = document.createElement("i");
    userPictureIcon.className = "fas fa-user text-dark"; // Font Awesome
    userPictureIcon.style.opacity = "0.5";
    userPictureIcon.style.fontSize = "1.25rem";
    this.userPicture.appendChild(userPictureIcon);
  }

  this.userName = document.createElement("h6");
  this.userName.className = "text-center mb-0 ml-3 text-truncate"; // Bootstrap
  userDiv.appendChild(this.userName);

  var leftDropdownArea = document.createElement("div");
  leftDropdownArea.className = "dropdown"; // Bootstrap
  this.leftNavbar.appendChild(leftDropdownArea);

  // Criar botão de opções.
  this.leftOptionsButton = document.createElement("button");
  this.leftOptionsButton.type = "button";
  this.leftOptionsButton.id = "chat-options-left-" + this.code;
  this.leftOptionsButton.className = "btn btn-link text-muted"; // Custom
  this.leftOptionsButton.setAttribute("data-toggle", "dropdown"); // Bootstrap
  this.leftOptionsButton.setAttribute("aria-haspopup", "true"); // Accessibility
  this.leftOptionsButton.setAttribute("aria-expanded", "false"); // Accessibility
  leftDropdownArea.appendChild(this.leftOptionsButton);

  var leftOptionsButtonIcon = document.createElement("span");
  leftOptionsButtonIcon.className = "fas fa-ellipsis-v"; // Font Awesome
  this.leftOptionsButton.appendChild(leftOptionsButtonIcon);

  // Criar menu de contexto do usuário.
  this.leftDropdownMenu = document.createElement("div");
  this.leftDropdownMenu.className = "dropdown-menu dropdown-menu-right mt-2"; // Bootstrap
  this.leftDropdownMenu.style.zIndex = "20000000";
  this.leftDropdownMenu.setAttribute("aria-labelledby", this.leftOptionsButton.id); // Accessibility
  leftDropdownArea.appendChild(this.leftDropdownMenu);

  // Criar botão de atualizar chat.
  var refreshChat = document.createElement("a");
  refreshChat.href = "#";
  refreshChat.className = "dropdown-item d-flex align-items-center"; // Bootstrap
  this.leftDropdownMenu.appendChild(refreshChat);

  // Criar ícone do botão de atualizar chat.
  var refreshChatIcon = document.createElement("span");
  refreshChatIcon.className = "fas fa-sync-alt mr-3"; // Font Awesome - Bootstrap
  refreshChat.appendChild(refreshChatIcon);

  // Criar texto do botão de atualizar chat.
  var refreshChatText = document.createElement("span");
  refreshChatText.innerText = getLocaleMessage("LABEL.REFRESH");
  refreshChat.appendChild(refreshChatText);

  // Associar eventos ao botão de atualizar chat.
  this.attachEvent(refreshChat, "click", function() {
    object.updateData();
  });

  // Verificar se possui criação de grupos.
  if (this.allowCreateGroups) {
    // Criar botão de criar grupo.
    var createGroup = document.createElement("a");
    createGroup.href = "#";
    createGroup.className = "dropdown-item d-flex align-items-center"; // Bootstrap
    this.leftDropdownMenu.appendChild(createGroup);

    // Criar ícone do botão de criar grupo.
    var createGroupIcon = document.createElement("span");
    createGroupIcon.className = "fas fa-user-plus mr-3"; // Font Awesome - Bootstrap
    createGroup.appendChild(createGroupIcon);

    // Criar texto do botão de criar grupo.
    var createGroupText = document.createElement("span");
    createGroupText.innerText = getLocaleMessage("LABEL.CHAT_CREATE_GROUP");
    createGroup.appendChild(createGroupText);

    // Associar eventos ao botão de criar grupo.
    this.attachEvent(createGroup, "click", function() {
      object.openGroupModal();
    });
  }

  // Criar div de mensagem do chat.
  this.chatMessageDiv = document.createElement("div");
  this.chatMessageDivClass = "chat-layout-alert d-flex flex-row align-items-center w-100 bg-light py-3"; // Bootstrap
  if (!this.showSearch) this.chatMessageDivClass += " border-bottom"; // Bootstrap
  else this.chatMessageDivClass += " border-top"; // Bootstrap
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
    this.sendToEveryoneButton.className = "chat-container-everyone-item list-group-item list-group-item-action d-flex flex-row align-items-center h-auto"; // Bootstrap
    this.sendToEveryoneButton.style.outline = "0";
    topList.appendChild(this.sendToEveryoneButton);

    var sendToEveryoneButtonText = document.createElement("h6");
    sendToEveryoneButtonText.className = "mb-0 w-100 text-center"; // Bootstrap
    sendToEveryoneButtonText.innerText = getLocaleMessage("LABEL.CHAT_SEND_TO_EVERYONE");
    this.sendToEveryoneButton.appendChild(sendToEveryoneButtonText);

    // Associar eventos ao botão de enviar mensagem para todos..
    this.attachEvent(this.sendToEveryoneButton, 'click', this.sendMessageToEveryoneAction);
  }

  // Verificar se o chat tem search.
  if (this.showSearch) {
    // Criar a div de pesquisa.
    this.searchDiv = document.createElement("div");
    this.searchDiv.className = "chat-search d-flex flex-row w-100 bg-light border-top border-bottom overflow-hidden"; // Bootstrap
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
    this.attachEvent(this.searchInput, 'input', function() {
      object.searchAction(object.searchInput, object.usersList, object.searchResults, object.usersListClass, null);
    });

    // Associa o evento para evitar que post do formulário não seja realizado ao pressionar enter.
    this.searchInput.addEventListener('keydown', function(event) {
      if (event.keyCode === 13 || event.which === 13 || event.key === 'Enter') {
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
  this.rightColumnClass = "chat-layout-right-col col-sm-7 col-md-8 col-lg-9 p-0 d-flex flex-column h-100 border-0"; // Bootstrap
  this.contentDiv.appendChild(this.rightColumn);

  // Criar a navbar da direita do chat.
  this.rightNavbar = document.createElement("nav");
  this.rightNavbar.className = "chat-layout-right-nav navbar navbar-light bg-white border-bottom mb-0 flex-nowrap"; // Bootstrap
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
  this.activeConvUserDiv.className = "d-flex flex-row flex-fill align-items-center mr-auto text-truncate"; // Bootstrap
  this.rightNavbar.appendChild(this.activeConvUserDiv);

  this.activeConvUserPicture = document.createElement("img");
  this.activeConvUserPicture.className = "rounded-circle"; // Bootstrap
  this.activeConvUserPicture.width = this.photoSize;
  this.activeConvUserPicture.height = this.photoSize;
  this.activeConvUserPicture.style.minWidth = this.photoSize + "px";
  this.activeConvUserPicture.src = "";

  // Verificar se as fotos expandem ao serem clicadas.
  if (this.expandOnClick) {
    // Criar elemento A para o fancybox.
    this.activeConvUserPictureLink = document.createElement("a");
    this.activeConvUserPictureLink.href = this.activeConvUserPicture.src;
    this.activeConvUserDiv.appendChild(this.activeConvUserPictureLink);
    this.activeConvUserPictureLink.appendChild(this.activeConvUserPicture);

    try {
      // Inicializar fancybox no elemento.
      $(this.activeConvUserPictureLink).fancybox({
        closeExisting: true,
        keyboard: true,
        arrows: true,
        protect: true
      });
    } catch (e) { }
  } else {
    this.activeConvUserDiv.appendChild(this.activeConvUserPicture);
  }

  // Verificar se a imagem sem foto não foi definida.
  if ((!this.ImagemGrupoSemFoto || this.ImagemGrupoSemFoto.length == 0) ||
      (!this.ImagemSemFoto || this.ImagemSemFoto.length == 0)) {

    // Criar um ícone para substituir a foto.
    this.activeConvUserPictureDefault = document.createElement("div");
    this.activeConvUserPictureDefault.className = "d-none"; // Bootstrap
    this.activeConvUserPictureDefaultClass = "rounded-circle bg-light border d-flex align-items-center justify-content-center"; // Bootstrap
    this.activeConvUserPictureDefault.style.width = this.photoSize + "px";
    this.activeConvUserPictureDefault.style.height = this.photoSize + "px";
    this.activeConvUserPictureDefault.style.minWidth = this.photoSize + "px";
    this.activeConvUserDiv.appendChild(this.activeConvUserPictureDefault);

    this.activeConvUserPictureIcon = document.createElement("i");
    this.activeConvUserPictureIcon.className = "fas fa-user text-dark"; // Font Awesome - Bootstrap
    this.activeConvUserPictureIcon.style.opacity = "0.5";
    this.activeConvUserPictureIcon.style.fontSize = "1.25rem";
    this.activeConvUserPictureDefault.appendChild(this.activeConvUserPictureIcon);
  }

  // Criar a div para suportar a foto, o nome e o status do container ativo no chat.
  this.activeConvUserWrapper = document.createElement("div");
  this.activeConvUserWrapper.className = "d-flex flex-fill flex-column justify-content-center ml-3 overflow-hidden"; // Bootstrap
  this.activeConvUserWrapper.style.cursor = "pointer";
  this.activeConvUserDiv.appendChild(this.activeConvUserWrapper);

  // Associar evento de clique a div de suporte.
  this.activeConvUserWrapper.addEventListener("click", function() {
    if (object.activeContainer) object.activeContainer.toggleDetails();
  });

  // Criar elemento do nome do container ativo.
  this.activeConvUserName = document.createElement("h6");
  this.activeConvUserName.className = "mb-0 text-truncate"; // Bootstrap
  this.activeConvUserWrapper.appendChild(this.activeConvUserName);

  // Criar elemento do estado do container ativo.
  this.activeConvUserState = document.createElement("p");
  this.activeConvUserState.className = "text-muted text-truncate mb-0"; // Bootstrap
  this.activeConvUserWrapper.appendChild(this.activeConvUserState);

  // Criar div de detalhes do container ativo.
  this.activeDetailsDiv = document.createElement("div");
  this.activeDetailsDiv.className = "chat-layout-view-details position-relative bg-light w-100 h-100 overflow-auto"; // Bootstrap
  this.activeDetailsDiv.style.setProperty("display", "none", "important");
  this.rightColumn.appendChild(this.activeDetailsDiv);

  // Criar div da conversa ativa.
  this.activeConvDiv = document.createElement("div");
  this.activeConvDiv.className = "chat-layout-view-container position-relative bg-light w-100 h-100 p-3 overflow-auto flex-fill"; // Bootstrap
  this.rightColumn.appendChild(this.activeConvDiv);

  // Criar div de digitação.
  this.activeConvBottomDiv = document.createElement("div");
  this.activeConvBottomDiv.className = "d-flex align-items-end bg-white w-100 px-3 py-2 border-top"; // Bootstrap
  this.rightColumn.appendChild(this.activeConvBottomDiv);

  // Criar grupo do input.
  this.inputGroup = document.createElement("div");
  this.inputGroup.className = "chat-message-input input-group"; // Bootstrap
  this.activeConvBottomDiv.appendChild(this.inputGroup);

  // Criar input da conversa do chat.
  this.input = document.createElement("textarea");
  this.input.className = "form-control"; // Bootstrap
  this.input.style.minHeight = "2.5rem";
  this.input.style.height = "2.5rem";
  this.input.style.outline = "0";
  this.input.style.resize = "none";
  this.inputGroup.appendChild(this.input);

  // Associar eventos ao input.
  this.attachEvent(this.input, 'input', this.updateInputLayout);
  this.attachEvent(this.input, 'change', this.updateInputLayout);

  this.input.addEventListener("keydown", function(e) {
    if (object.authError === true) return false;
    if (e.keyCode === 13 || e.which === 13 || e.key === 'Enter') {
      e.preventDefault();
      //Para a propagação do demais eventos associados ao elemento pai.
      e.stopImmediatePropagation();

      // Não enviar quando o SHIFT estiver pressionado,
      // assim o usuário poderá pular linha.
      if (e.shiftKey) object.input.value += "\n";
      else object.sendButton.click();
    }
  });

  // Verificar se possui envio de mídias.
  if (this.allowSendMedia) {
    // Criar o formulário para possibilitar o envio de arquivos.
    this.mediaForm = document.createElement("form");
    this.mediaForm.className = "d-none"; // Bootstrap
    this.mediaForm.method = "post";
    this.mediaForm.action = "";
    this.div.appendChild(this.mediaForm);

    this.createMediaFileInput = function(acceptTypes) {
      // Remover o input anterior.
      if (object.mediaFilesInput) {
        object.mediaForm.removeChild(object.mediaFilesInput);
      }

      // Criar o input de arquivos.
      object.mediaFilesInput = document.createElement("input");
      object.mediaFilesInput.type = "file";
      object.mediaFilesInput.name = "files" + object.code;
      object.mediaFilesInput.id = "chat-files-" + object.code;
      object.mediaFilesInput.multiple = true;
      if (acceptTypes) object.mediaFilesInput.accept = acceptTypes;
      object.mediaForm.appendChild(object.mediaFilesInput);

      // Associar evento de change.
      object.mediaFilesInput.addEventListener("change", function() {
        if (object.activeContainer) object.activeContainer.enqueueFiles(object.mediaFilesInput.files);
      });

      return object.mediaFilesInput;
    };

    // Verificar se a gravação de áudios é suportada.
    if (this.isRecordingSupported()) {
      // Criar botão de gravar áudio.
      this.recordAudioButton = document.createElement("button");
      this.recordAudioButton.type = "button";
      this.recordAudioButton.className = "chat-nav-button chat-nav-button-record btn btn-light rounded ml-3 d-flex align-items-center justify-content-center"; // Bootstrap
      this.activeConvBottomDiv.appendChild(this.recordAudioButton);

      var recordAudioButtonIcon = document.createElement("span");
      recordAudioButtonIcon.className = "fas fa-microphone my-1"; // Font Awesome
      this.recordAudioButton.appendChild(recordAudioButtonIcon);

      // Associar evento de clique ao botão de gravar áudio.
      this.attachEvent(this.recordAudioButton, 'click', this.recordAudioAction);
    }

    var mediaButtonDropdownDiv = document.createElement("div");
    mediaButtonDropdownDiv.className = "btn-group dropup"; // Bootstrap
    this.activeConvBottomDiv.appendChild(mediaButtonDropdownDiv);

    // Criar botão de enviar mídia.
    this.mediaButton = document.createElement("button");
    this.mediaButton.type = "button";
    this.mediaButton.id = "chat-media-" + this.code;
    this.mediaButton.className = "chat-nav-button chat-nav-button-media btn btn-light rounded ml-3 d-flex align-items-center justify-content-center"; // Bootstrap
    this.mediaButton.setAttribute("data-toggle", "dropdown"); // Bootstrap
    this.mediaButton.setAttribute("aria-haspopup", "true"); // Bootstrap
    this.mediaButton.setAttribute("aria-expanded", "false"); // Bootstrap
    mediaButtonDropdownDiv.appendChild(this.mediaButton);

    var mediaButtonIcon = document.createElement("span");
    mediaButtonIcon.className = "fas fa-paperclip my-1"; // Font Awesome
    this.mediaButton.appendChild(mediaButtonIcon);

    // Criar a div do dropdown.
    var mediaDropdownDiv = document.createElement("div");
    mediaDropdownDiv.className = "dropdown-menu dropdown-menu-right p-0"; // Bootstrap
    mediaDropdownDiv.style.minWidth = "15rem";
    mediaDropdownDiv.style.zIndex = "10000000";
    mediaDropdownDiv.setAttribute("aria-labelledby", this.mediaButton.id);
    mediaButtonDropdownDiv.appendChild(mediaDropdownDiv);

    var mediaDropdownWrapperDiv = document.createElement("div");
    mediaDropdownWrapperDiv.className = "row no-gutters"; // Bootstrap
    mediaDropdownDiv.appendChild(mediaDropdownWrapperDiv);

    /**
     * Desenha um botão de mídia.
     * @param icon Ícone do botão.
     * @param text Descrição do botão.
     * @param action Ação do botão.
     */
    var designMediaButton = function(icon, text, action) {
      var mediaButtonCol = document.createElement("div");
      mediaButtonCol.className = "col-4"; // Bootstrap
      mediaDropdownWrapperDiv.appendChild(mediaButtonCol);

      // Criar botão de enviar mídia.
      var sendMediaButton = document.createElement("a");
      sendMediaButton.href = "#";
      sendMediaButton.className = "dropdown-item w-auto d-flex flex-column align-items-center justify-content-center p-3"; // Bootstrap
      mediaButtonCol.appendChild(sendMediaButton);

      // Criar ícone do botão.
      var sendMediaButtonIcon = document.createElement("i");
      sendMediaButtonIcon.className = icon + " mb-2";
      sendMediaButtonIcon.style.fontSize = "2rem";
      sendMediaButton.appendChild(sendMediaButtonIcon);

      // Criar texto do botão.
      var sendMediaButtonText = document.createElement("span");
      sendMediaButtonText.innerText = text;
      sendMediaButton.appendChild(sendMediaButtonText);

      // Associar evento de clique ao botão.
      if (action) sendMediaButton.addEventListener("click", action);

      // Retornar elemento do botão.
      return sendMediaButton;
    }

    // Criar item de enviar arquivo.
    designMediaButton("fas fa-file", getLocaleMessage("LABEL.FILE"), function() {
      var fileInput = object.createMediaFileInput("*");
      fileInput.click();
    });

    // Criar item de enviar imagem.
    designMediaButton("fas fa-image", getLocaleMessage("LABEL.IMAGE"), function() {
      var fileInput = object.createMediaFileInput("image/*");
      fileInput.click();
    });

    // Criar item de abrir câmera.
    var webcamElement = designMediaButton("fas fa-camera", getLocaleMessage("LABEL.CAMERA"), function() {
      object.takePhotoAction();
    });

    // Verificar se possui webcam.
    this.isWebcamSupported().then(function(result) {
      if (result === false) webcamElement.className += " disabled"; // Bootstrap
    });

    // Criar item de enviar vídeo.
    designMediaButton("fas fa-film", getLocaleMessage("LABEL.VIDEO"), function() {
      var fileInput = object.createMediaFileInput("video/*");
      fileInput.click();
    });

    // Criar item de enviar áudio.
    designMediaButton("fas fa-volume-up", getLocaleMessage("LABEL.AUDIO"), function() {
      var fileInput = object.createMediaFileInput("audio/*");
      fileInput.click();
    });
  }

  // Criar botão de enviar mensagem.
  this.sendButton = document.createElement("button");
  this.sendButton.type = "button";
  this.sendButton.disabled = true;
  this.sendButton.className = "chat-nav-button chat-nav-button-send btn btn-light rounded ml-3 d-flex align-items-center justify-content-center"; // Bootstrap
  this.sendButton.title = getLocaleMessage("LABEL.SEND");
  this.sendButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  this.activeConvBottomDiv.appendChild(this.sendButton);

  var sendButtonIcon = document.createElement("span");
  sendButtonIcon.className = "fas fa-paper-plane my-1"; // Font Awesome
  this.sendButton.appendChild(sendButtonIcon);

  // Associar eventos ao botão de enviar mensagem.
  this.attachEvent(this.sendButton, "click", this.sendMessageAction);

  // Verificar se possui exportação.
  if (this.allowExport || this.allowCreateGroups) {
    this.rightDropdownArea = document.createElement("div");
    this.rightDropdownArea.className = "dropdown"; // Bootstrap
    this.rightNavbar.appendChild(this.rightDropdownArea);

    // Criar botão de opções.
    this.rightOptionsButton = document.createElement("button");
    this.rightOptionsButton.type = "button";
    this.rightOptionsButton.id = "chat-options-" + this.code;
    this.rightOptionsButton.className = "btn btn-link text-muted"; // Custom
    this.rightOptionsButton.setAttribute("data-toggle", "dropdown"); // Bootstrap
    this.rightOptionsButton.setAttribute("aria-haspopup", "true"); // Accessibility
    this.rightOptionsButton.setAttribute("aria-expanded", "false"); // Accessibility
    this.rightDropdownArea.appendChild(this.rightOptionsButton);

    var rightOptionsButtonIcon = document.createElement("span");
    rightOptionsButtonIcon.className = "fas fa-ellipsis-v"; // Font Awesome
    this.rightOptionsButton.appendChild(rightOptionsButtonIcon);

    // Criar menu de contexto da conversa.
    this.rightDropdownMenu = document.createElement("div");
    this.rightDropdownMenu.className = "dropdown-menu dropdown-menu-right mt-2"; // Bootstrap
    this.rightDropdownMenu.style.zIndex = "20000000";
    this.rightDropdownMenu.setAttribute("aria-labelledby", this.rightOptionsButton.id); // Accessibility
    this.rightDropdownArea.appendChild(this.rightDropdownMenu);

    if (this.allowCreateGroups) {
      // Criar botão de editar grupo.
      this.editGroupButton = document.createElement("a");
      this.editGroupButton.href = "#";
      this.editGroupButton.className = "dropdown-item d-flex align-items-center"; // Bootstrap
      this.editGroupButton.style.setProperty("display", "none", "important");
      this.rightDropdownMenu.appendChild(this.editGroupButton);

      // Criar ícone do botão de editar grupo.
      var editGroupButtonIcon = document.createElement("span");
      editGroupButtonIcon.className = "fas fa-pencil-alt mr-3"; // Font Awesome - Bootstrap
      this.editGroupButton.appendChild(editGroupButtonIcon);

      // Criar texto do botão de editar grupo.
      var editGroupButtonText = document.createElement("span");
      editGroupButtonText.innerText = getLocaleMessage("LABEL.CHAT_EDIT_GROUP");
      this.editGroupButton.appendChild(editGroupButtonText);

      // Associar eventos ao botão de editar grupo.
      this.attachEvent(this.editGroupButton, "click", function() {
        if (object.activeContainer && object.activeContainer.isGroup()) {
          object.openGroupModal(object.activeContainer.data, 0);
        }
      });

      // Criar botão de deletar grupo.
      this.deleteGroupButton = document.createElement("a");
      this.deleteGroupButton.href = "#";
      this.deleteGroupButton.className = "dropdown-item d-flex align-items-center"; // Bootstrap
      this.deleteGroupButton.style.setProperty("display", "none", "important");
      this.rightDropdownMenu.appendChild(this.deleteGroupButton);

      // Criar ícone do botão de editar grupo.
      var deleteGroupButtonIcon = document.createElement("span");
      deleteGroupButtonIcon.className = "fas fa-trash-alt mr-3"; // Font Awesome - Bootstrap
      this.deleteGroupButton.appendChild(deleteGroupButtonIcon);

      // Criar texto do botão de editar grupo.
      var deleteGroupButtonText = document.createElement("span");
      deleteGroupButtonText.innerText = getLocaleMessage("LABEL.CHAT_DELETE_GROUP");
      this.deleteGroupButton.appendChild(deleteGroupButtonText);

      // Verificar se possui formulário de grupos.
      if (this.hasGroupsForm()) {
        // Desabilitar botão.
        this.deleteGroupButton.className += " disabled"; // Bootstrap
      } else {
        // Associar eventos ao botão de deletar grupo.
        this.attachEvent(this.deleteGroupButton, "click", function() {
          if (object.activeContainer && object.activeContainer.isGroup()) {
            object.activeContainer.groupDelete();
          }
        });
      }

      if (this.allowExport) {
        // Criar separador no menu dropdown.
        this.groupDropdownDivider = document.createElement("div");
        this.groupDropdownDivider.className = "dropdown-divider"; // Bootstrap
        this.groupDropdownDivider.style.display = "none";
        this.rightDropdownMenu.appendChild(this.groupDropdownDivider);
      }
    }

    if (this.allowExport) {
      // Criar botão de exportar conversa.
      var exportConversation = document.createElement("a");
      exportConversation.href = "#";
      exportConversation.className = "dropdown-item d-flex align-items-center" + (!this.canExport ? " disabled" : ""); // Bootstrap
      this.rightDropdownMenu.appendChild(exportConversation);

      // Criar ícone do botão de editar grupo.
      var exportConversationIcon = document.createElement("span");
      exportConversationIcon.className = "fas fa-comments mr-3"; // Font Awesome - Bootstrap
      exportConversation.appendChild(exportConversationIcon);

      // Criar texto do botão de editar grupo.
      var exportConversationText = document.createElement("span");
      exportConversationText.innerText = getLocaleMessage("LABEL.CHAT_EXPORT_CONVERSATION");
      exportConversation.appendChild(exportConversationText);

      // Associar eventos ao botão de exportar conversa.
      this.attachEvent(exportConversation, "click", this.openExportModal);
    }
  }

  // Criar o loader do chat.
  this.preloader = document.createElement("div");
  this.preloader.className = "d-none"; // Bootstrap
  this.preloaderClass = "spinner-border text-primary"; // Bootstrap
  this.preloader.setAttribute("role", "status");
  this.div.appendChild(this.preloader);

  var preloaderSpan = document.createElement("span");
  preloaderSpan.className = "sr-only"; // Bootstrap
  preloaderSpan.innerText = getLocaleMessage("LABEL.LOADING") + "...";
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
        if (object) {
          object.pageVisible = !document[docHiddenProp];

          // Verificar se deve enviar confirmações de leitura.
          if (object.shouldSendReadConfirmations()) {
            // Enviar todas as confirmações de leitura pendentes.
            object.sendAllPendingReadConfirmations();
          }
        }
      }, false);
    }

    // Associar eventos de exibição da página na instância da janela.
    window.addEventListener('pageshow', function() {
      if (object) {
        object.pageVisible = !document[docHiddenProp];

        // Verificar se deve enviar confirmações de leitura.
        if (object.shouldSendReadConfirmations()) {
          // Enviar todas as confirmações de leitura pendentes.
          object.sendAllPendingReadConfirmations();
        }
      }
    }, false);

    window.addEventListener('pagehide', function() {
      if (object) {
        object.pageVisible = false;

        // Verificar se deve enviar confirmações de leitura.
        if (object.shouldSendReadConfirmations()) {
          // Enviar todas as confirmações de leitura pendentes.
          object.sendAllPendingReadConfirmations();
        }
      }
    }, false);
  } catch (e) { }

  // Associar evento de resize na instância da janela.
  window.addEventListener("resize", function() {
    if (object.authError === true) return false;
    if (object) object.updateLayout();
  });

  // Associar eventos de drag and drop.
  this.div.addEventListener("dragover", function(e) {
    // Impedir o evento de arrastar padrão do navegador.
    e.preventDefault();
  });

  this.div.addEventListener("drop", function(e) {
    // Impedir o comportamento padrão (impedir que o arquivo seja aberto).
    e.preventDefault();

    // Verificar se está com algum container aberto.
    if (object.activeContainer != null && object.activeContainer.active) {
      var files = [];

      if (e.dataTransfer.items) {
        // Use a interface DataTransferItemList para acessar o (s) arquivo (s).
        for (var i = 0; i < e.dataTransfer.items.length; i++) {
          // Se os itens soltos não forem arquivos, rejeite-os.
          if (e.dataTransfer.items[i].kind === 'file') {
            files.push(e.dataTransfer.items[i].getAsFile());
          }
        }
      } else {
        // Use a interface DataTransfer para acessar o (s) arquivo (s).
        for (var i = 0; i < e.dataTransfer.files.length; i++) {
          files.push(e.dataTransfer.files[i]);
        }
      }

      if (files.length > 0) {
        // Adicionar arquivos à lista de arquivos anexados.
        object.activeContainer.enqueueFiles(files);
      }
    }
  });

  // Atualizar layout.
  this.updateLayout();

  // Exibir preloader.
  this.showPreloader();
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 */
HTMLChat.prototype.afterInit = function() {
  this.callMethod(HTMLElementBase, "afterInit", []);
  var object = this;

  // Verificar se possui folha de estilo e se é visualização desktop.
  if ((this.EstiloCss && this.EstiloCss.length > 0) && ((this.viewMode == 1 && !isMobile()) || (this.viewMode === 2))) {
    if (this.styleElem) {
      this.styleElem.innerHTML = this.EstiloCss;
    } else {
      this.styleElem = document.createElement("style");
      this.styleElem.innerHTML = this.EstiloCss;
      document.body.appendChild(this.styleElem);
    }

  // Verificar se possui folha de estilo mobile e se é visualização mobile.
  } else if ((this.EstiloMobileCss && this.EstiloMobileCss.length > 0) && ((this.viewMode == 1 && isMobile()) || (this.viewMode === 3))) {
    if (this.styleElem) {
      this.styleElem.innerHTML = this.EstiloMobileCss;
    } else {
      this.styleElem = document.createElement("style");
      this.styleElem.innerHTML = this.EstiloMobileCss;
      document.body.appendChild(this.styleElem);
    }
  }

  // Obter a aba relacionada a esse componente.
  if (this.tab) {
    // Adicionar callback a aba.
    this.tab.addShownListener(function(tabPane) {
      // Atualizar layout do componente.
      object.updateLayout();
    });
  }
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

  return "componentData.do?action=componentData&sys=" + URLEncode(this.sys, 'GET') +
    "&formID=" + URLEncode(this.formID, 'GET') + "&comID=" + URLEncode(this.code, 'GET') + params;
};

/**
 * Obtém a URL de envio de arquivos.
 **/
HTMLChat.prototype.getFileUploadURL = function() {
  return "UploadFile.do?action=UploadFile&sys=" + URLEncode(this.sys, "GET") +
    "&formID=" + URLEncode(this.formID, "GET") + "&comID=" + URLEncode(this.code, "GET");
};

/**
 * Atualiza os dados do chat.
 * @param silent (Opcional) Valor lógico indicando se o chat deve ser atualizado silenciosamente.
 **/
HTMLChat.prototype.updateData = function(silent) {
  var object = this;

  var previousActiveContainerId = this.activeContainer && this.activeContainer.data ? this.activeContainer.data.id : null;
  var previousActiveContainerType = this.activeContainer && this.activeContainer.data ? this.activeContainer.data.type : null;

  if (!silent) {
    // Verificar se possui container ativo.
    if (this.activeContainer) {
      // Desabilitar container.
      this.activeContainer.setActive(false);
      this.activeContainer = null;

      // Atualizar layout do componente.
      this.updateLayout();
    }

    // Exibir preloader.
    this.showPreloader();
  }

  // Esconder mensagem de alerta, se existir.
  this.hideChatMessage();

  // Mandar pedido para o servidor para obter os dados do chat.
  var baseURL = this.getRequestURL();
  $.get(baseURL + "&type=l", // Listagem dos dados.
    function(response) {
      if (response) {
        // Verificar se é erro de autenticação.
        if (response === undefined || response === null ||
           (typeof response === 'string' && response.length == 0) ||
           (typeof response === 'object' && !response.success)) {

          // Esconder preloader.
          object.hidePreloader();

          if (!silent) {
            // Limpar usuários/grupos na memória.
            object.clearCachedContainers();

            if (response && response.status === -59207) { // Erro de Autenticação.
              // Desenhar mensagem de erro de autenticação.
              object.designAuthError();
            } else { // Erro Desconhecido.
              // Desenhar mensagem de erro desconhecido.
              object.designUnknownError();
            }

            // Verificar se possui detalhes do erro.
            if (response && response.details && response.details.length > 0) {
              // Exibir mensagem de erro.
              new HTMLMessage().showErrorMessage(getLocaleMessage("ERROR.OPERATION_ERROR"), null, null, response.details);
            }
          }
        } else {
          // Limpar usuários/grupos na memória.
          object.clearCachedContainers();

          // Salvar se o chat salva o histório.
          object.saveHistory = response.saveHistory;

          // Verificar se a resposta tem usuários/grupos.
          if (response.containers && response.containers.length && response.containers.length > 0) {
            try {
              // Organizar os containers pela data da última mensagem.
              response.containers = response.containers.sort(function(a, b) {
                var aHasMessageTime = (a.lastMessage && a.lastMessage.time);
                var bHasMessageTime = (b.lastMessage && b.lastMessage.time);
                if (!aHasMessageTime && !bHasMessageTime) return 0;
                else if (aHasMessageTime && !bHasMessageTime) return -1;
                else if (!aHasMessageTime && bHasMessageTime) return 1;
                return moment(b.lastMessage.time).local().diff(moment(a.lastMessage.time).local());
              });
            } catch (e) { }

            for (var i = 0; i < response.containers.length; i++) {
              var container = response.containers[i];

              // Verificar se o container atual é o usuário logado.
              if (container.type == 0 && container.id == response.userCode) {
                object.userName.innerText = object.formatName(container.name);
                object.userPicture.src = (container.photo === "false") ?
                  object.getImageSourceURL(object.ImagemSemFoto) :
                  baseURL + "&type=p&req=" + URLEncode(container.id, 'GET') +
                  "&reqType=" + URLEncode(container.type, 'GET');
                if (object.userPictureLink) object.userPictureLink.href = object.userPicture.src;

                // Criar o container do usuário.
                object.user = new HTMLChatContainer(object, i, container,
                  null, object.userPicture, object.userName, null);

                // Adicionar usuário na cache.
                object.cachedContainers.push(object.user);
              } else {
                // Desenhar o item do container na lista.
                var items = object.designContainerItem(object.usersList, container, i);

                // Criar a instância do container.
                var containerInstance = new HTMLChatContainer(object, i, container,
                  items[0], items[1], items[2], items[3], items[4]);

                // Verificar se a última mensagem foi definida.
                if (container.lastMessage) containerInstance.setLastMessageContent(container.lastMessage);

                // Adicionar container na cache.
                object.cachedContainers.push(containerInstance);

                // Verificar se tem mensagens não lidas.
                if (container.unreadMessages) containerInstance.setTotalUnreadMessages(container.unreadMessages);
              }
            }

            if (object.showSendToEveryone) {
              // Adicionar sessão de enviar para todos ao chat.
              object.sendToEveryoneContainer = new HTMLChatContainer(object);
              object.sendToEveryoneContainer.isSendToEveryone = true;
              object.cachedContainers.push(object.sendToEveryoneContainer);
            }
          }

          // Conectar no endpoint.
          if (response.endpoint && response.endpoint.length && response.endpoint.length > 0) {
            // Adicionado para que a conexão no socket só seja feita se o usuário atual estiver presente na lista de usuários.
            if (response.containers.filter(function(container) {
                return container.type === 0 && container.id === response.userCode;
              }).length > 0) object.connect(response.endpoint);
          }

          // Importante: Atualizar a última mensagem novamente.
          for (var i = 0; i < object.cachedContainers.length; i++) {
            var container = object.cachedContainers[i];
            if (container.data && container.data.lastMessage) {
              container.setLastMessageContent(container.data.lastMessage);
            }
          }

          // Esconder preloader.
          object.hidePreloader();

          // Verificar se foi modo silencioso e se possuia container ativo.
          if (silent && previousActiveContainerId !== null && previousActiveContainerType !== null) {
            // Verificar se era um grupo.
            if (previousActiveContainerType == 1) {
              // Habilitar container do grupo.
              var groupContainer = object.getGroupById(previousActiveContainerId);
              if (groupContainer) groupContainer.setActive(true);
              else {
                // Container não foi encontrado, provavelmente foi deletado.
                // Resetar container ativo e atualizar layout do chat.
                object.activeContainer = null;
                object.updateLayout();
              }
            } else {
              // Habilitar container do usuário.
              var userContainer = object.getUserById(previousActiveContainerId);
              if (userContainer) userContainer.setActive(true);
              else {
                // Container não foi encontrado, provavelmente foi deletado.
                // Resetar container ativo e atualizar layout do chat.
                object.activeContainer = null;
                object.updateLayout();
              }
            }

            previousActiveContainerId = null;
            previousActiveContainerType = null;
          }
        }
      } else {
        // Esconder preloader.
        object.hidePreloader();
      }
    }).fail(function() {
      // Esconder preloader.
      object.hidePreloader();

      if (!silent) {
        // Limpar usuários/grupos na memória.
        object.clearCachedContainers();

        // Desenhar mensagem de erro de autenticação.
        object.designAuthError();
      }
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
      this.divClass = "chat-layout chat-layout-fullscreen position-relative w-100 vh-100"; // Bootstrap
      this.div.className = this.divClass;
      this.div.style.minHeight = null;
    }

    // Criar div de erro de autenticação.
    this.authErrorDiv = document.createElement("div");
    this.authErrorDiv.className = "chat-layout-error d-flex flex-column align-items-center justify-content-center w-100 h-100 text-center text-muted"; // Bootstrap
    this.div.appendChild(this.authErrorDiv);

    var authErrorIcon = document.createElement("i");
    authErrorIcon.className = "fas fa-lock"; // Font Awesome
    authErrorIcon.style.fontSize = "4rem";
    this.authErrorDiv.appendChild(authErrorIcon);

    var authErrorMessage = document.createElement("span");
    authErrorMessage.className = "my-4"; // Bootstrap
    authErrorMessage.style.maxWidth = "17rem";
    authErrorMessage.innerText = getLocaleMessage("INFO.CHAT_AUTHENTICATION_ERROR");
    this.authErrorDiv.appendChild(authErrorMessage);
  }
};

/**
 * Desenha mensagem de erro desconhecido.
 **/
HTMLChat.prototype.designUnknownError = function() {
  var fullscreen = this.fullscreen;

  this.unknownError = true;
  this.flush();

  if (!this.unknownErrorDiv) {
    if (fullscreen) {
      this.divClass = "chat-layout chat-layout-fullscreen position-relative w-100 vh-100"; // Bootstrap
      this.div.className = this.divClass;
      this.div.style.minHeight = null;
    }

    // Criar div de erro de autenticação.
    this.unknownErrorDiv = document.createElement("div");
    this.unknownErrorDiv.className = "chat-layout-error d-flex flex-column align-items-center justify-content-center w-100 h-100 text-center text-muted"; // Bootstrap
    this.div.appendChild(this.unknownErrorDiv);

    var unknownErrorIcon = document.createElement("i");
    unknownErrorIcon.className = "fas fa-exclamation-triangle"; // Font Awesome
    unknownErrorIcon.style.fontSize = "4rem";
    this.unknownErrorDiv.appendChild(unknownErrorIcon);

    var unknownErrorMessage = document.createElement("span");
    unknownErrorMessage.className = "my-4"; // Bootstrap
    unknownErrorMessage.style.maxWidth = "17rem";
    unknownErrorMessage.innerText = getLocaleMessage("ERROR.OPERATION_ERROR");
    this.unknownErrorDiv.appendChild(unknownErrorMessage);
  }
};

/**
 * Limpa a lista de usuários/grupos em cache.
 **/
HTMLChat.prototype.clearCachedContainers = function() {
  // Verificar se possui container ativo.
  if (this.activeContainer != null) {
    // Desabilitar container ativo.
    this.activeContainer.setActive(false);
    this.activeContainer = null;
  }

  // Limpar elementos.
  if (this.usersList) this.usersList.innerHTML = "";
  if (this.searchInput) this.searchInput.value = "";
  if (this.searchResults) this.searchResults.innerHTML = "";
  if (this.input) this.input.value = "";

  // Recriar array de containers.
  this.cachedContainers = [];
};

/**
 * Desenha o item de abertura de um HTMLChatContainer numa lista.
 * @param doc O elemento da lista que irá receber o elemento do item do container.
 * @param container O JSON enviado pelo servidor contento as informações do container.
 * @param index O índice do item na lista principal.
 * @param query (Opcional) A query da pesquisa para destacar os nomes.
 * @param action (Opcional) A ação que irá ser executada ao clicar no item do container.
 **/
HTMLChat.prototype.designContainerItem = function(doc, container, index, query, action) {
  var object = this;

  // Verificar se o container é um grupo.
  var isGroup = (container.type === 1);

  // Criar item do usuário/grupo na lista.
  var containerItem = document.createElement("button");
  containerItem.type = "button";
  containerItem.className = "chat-container-item " + (isGroup ? "chat-container-item-group" : "chat-container-item-user") +
    " list-group-item list-group-item-action d-flex flex-row align-items-center h-auto"; // Bootstrap
  containerItem.style.outline = "0";
  containerItem.style.flex = "0 0 auto"; // Correção para IE e Safari
  doc.appendChild(containerItem);

  // Criar imagem do usuário/grupo na lista.
  if ((!container.photo || container.photo === "false" || container.photo.length == 0) && (
      (isGroup && (!this.ImagemGrupoSemFoto || this.ImagemGrupoSemFoto.length == 0)) ||
      (!isGroup && (!this.ImagemSemFoto || this.ImagemSemFoto.length == 0)))) {

    var containerPicture = document.createElement("div");
    containerPicture.className = "rounded-circle bg-light border d-flex align-items-center justify-content-center"; // Bootstrap
    containerPicture.style.width = this.photoSize + "px";
    containerPicture.style.height = this.photoSize + "px";
    containerPicture.style.flex = "0 0 auto"; // Correção para IE e Safari
    containerItem.appendChild(containerPicture);

    var containerPictureIcon = document.createElement("i");
    containerPictureIcon.className = "fas fa-" + (isGroup ? "users" : "user") + " text-dark"; // Font Awesome
    containerPictureIcon.style.opacity = "0.5";
    containerPictureIcon.style.fontSize = "1.25rem";
    containerPicture.appendChild(containerPictureIcon);
  } else {
    var containerPicture = document.createElement("img");
    containerPicture.className = "rounded-circle bg-light"; // Bootstrap
    containerPicture.width = this.photoSize;
    containerPicture.height = this.photoSize;
    containerPicture.setAttribute("alt", "");
    containerPicture.src = (!container.photo || container.photo === "false" || container.photo.length == 0) ?
      this.getImageSourceURL(isGroup ? this.ImagemGrupoSemFoto : this.ImagemSemFoto) :
      this.getRequestURL() + "&type=p" + // Foto do Container
        "&req=" + URLEncode(container.id, "GET") +
        "&reqType=" + URLEncode(container.type, "GET");

    // Verificar se as fotos expandem ao serem clicadas.
    if (this.expandOnClick && (action === undefined || action === null)) {
      // Criar elemento para o fancybox.
      var containerPictureLink = document.createElement("a");
      containerPictureLink.href = containerPicture.src;
      containerItem.appendChild(containerPictureLink);
      containerPictureLink.appendChild(containerPicture);

      // Associar evento de clique para parar propagação.
      containerPictureLink.addEventListener("click", function(e) {
        e.stopPropagation();
      });

      try {
        // Inicializar fancybox no elemento.
        $(containerPictureLink).fancybox({
          closeExisting: true,
          keyboard: true,
          arrows: true,
          protect: true
        });
      } catch (e) { }
    } else {
      containerItem.appendChild(containerPicture);
    }
  }

  var itemWrapper = document.createElement("div");
  itemWrapper.className = "d-flex flex-fill flex-column justify-content-center ml-3 overflow-hidden"; // Bootstrap
  containerItem.appendChild(itemWrapper);

  // Criar o elemento do nome do usuário na lista.
  var itemNameElem = document.createElement("h6");
  itemNameElem.className = "mb-0 text-truncate"; // Bootstrap
  itemNameElem.style.fontWeight = "600";
  itemWrapper.appendChild(itemNameElem);

  // Verificar se possui pesquisa.
  if (query && query.length > 0) {
    // Destacar a pesquisa no nome do usuário.
    var name = (container.type == 1) ? container.name : this.formatName(container.name);
    var lowerCaseName = name.toLowerCase();
    var queryIndex = lowerCaseName.indexOf(query);
    itemNameElem.innerHTML = name.substring(0, queryIndex) + "<b>" + name.substring(queryIndex, queryIndex + query.length) + "</b>" +
      name.substring(queryIndex + query.length, name.length);
  } else {
    // Exibir o nome do usuário normalmente.
    itemNameElem.innerText = (container.type == 1) ? container.name : this.formatName(container.name);
  }

  // Criar o elemento da última mensagem do usuário na lista.
  var userLastMessage = document.createElement("p");
  userLastMessage.className = "position-relative w-100 d-flex align-items-center mb-0"; // Bootstrap
  itemWrapper.appendChild(userLastMessage);

  var userLastMessageBadge = document.createElement("span");
  userLastMessageBadge.className = "badge bg-dark d-inline-flex align-items-center text-white my-1 mr-2"; // Bootstrap
  userLastMessageBadge.style.setProperty("display", "none", "important");
  userLastMessage.appendChild(userLastMessageBadge);

  var userLastMessageContent = document.createElement("span");
  userLastMessageContent.className = "d-inline-block text-truncate text-muted mb-0"; // Bootstrap
  userLastMessage.appendChild(userLastMessageContent);

  // Associar eventos aos elementos.
  if (action !== undefined && action !== null) {
    if (action !== false) {
      // Se possuir ação, utilizar a ação definida.
      containerItem.addEventListener("click", action);
    }
  } else {
    var isDragging = false;
    var dragTimerStarted = false;

    // Se não possuir ação, utilizar a padrão.
    action = function() {
      // Abrir conversa com o usuário.
      if (!object.activeContainer || object.activeContainer.index != index) {
        object.openConversation(index);
      }

      // Limpar pesquisa atual.
      if (object.showSearch) {
        object.searchInput.value = "";
        object.searchAction(object.searchInput, object.usersList, object.searchResults, object.usersListClass, null);
      }
    };

    // Associar evento de clique ao item.
    containerItem.addEventListener("click", action);

    // Associar evento de dragleave ao item.
    containerItem.addEventListener("dragleave", function() {
      isDragging = false;
    });

    // Associar evento de dragover ao item.
    containerItem.addEventListener("dragover", function() {
      isDragging = true;

      // Verificar se o timer não foi iniciado.
      if (!dragTimerStarted) {
        dragTimerStarted = true;

        // Iniciar timer com o intervalo.
        setTimeout(function() {
          dragTimerStarted = false;

          // Verificar se ainda está em cima do item.
          if (isDragging) {
            // Chamar a ação.
            if (action) action();
          }
        }, object.dragItemActionInterval);
      }
    });
  }

  return [containerItem, containerPicture, itemNameElem, userLastMessageContent, userLastMessageBadge];
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
 * @param title Título da mensagem.
 * @param message Conteúdo da mensagem.
 * @param icon Ícone da mensagem.
 **/
HTMLChat.prototype.showChatMessage = function(title, message, icon) {
  if (this.chatMessageDiv) {
    this.chatMessageTitle.innerText = title;
    this.chatMessageContent.innerText = message;
    this.chatMessageIcon.className = (icon ? icon : "fas fa-exclamation-circle") + " pt-1"; // Font Awesome
    this.chatMessageDiv.className = this.chatMessageDivClass;
    this.chatMessageDiv.onclick = null;
  }
};

/**
 * Esconde a mensagem do chat na lista lateral.
 **/
HTMLChat.prototype.hideChatMessage = function() {
  if (this.chatMessageDiv) {
    // Verificar se suporta notificações da área de trabalho e se ainda não foram habilitadas nem bloqueadas.
    if (this.showDesktopNotifications && this.supportsDesktopNotifications() &&
       !this.isDesktopNotificationsGranted() && !this.isDesktopNotificationsDenied()) {

      // Exibir mensagem de habilitar notificações na área de trabalho.
      this.showChatMessage(
        getLocaleMessage("INFO.CHAT_NOTIFICATIONS_NOTICE"),
        getLocaleMessage("INFO.CHAT_ENABLE_NOTIFICATIONS"),
        "fas fa-bell"); // Font Awesome

      // Ajustar classe da mensagem.
      this.chatMessageDiv.className = "chat-layout-alert btn btn-light rounded-0 text-left d-flex flex-row align-items-center w-100 border-top py-3"; // Bootstrap

      // Definir evento de clique da mensagem.
      var object = this;
      this.chatMessageDiv.onclick = function() {
        Notification.requestPermission().then(function(permission) {
          if (permission === 'granted') object.hideChatMessage();
        });
      };
    } else {
      // Ocultar elemento da mensagem.
      this.chatMessageDiv.className = "d-none"; // Bootstrap

      // Desassociar evento de clique.
      this.chatMessageDiv.onclick = null;

      // Limpar título e conteúdo da mensagem.
      this.chatMessageTitle.innerHTML = "";
      this.chatMessageContent.innerHTML = "";
    }
  }
};

/**
 * Abre um painel de conversa pelo índice.
 * @param index Índice do container para ser aberto.
 **/
HTMLChat.prototype.openConversation = function(index) {
  this.cachedContainers[index].setActive(true);
};

/**
 * Obtém um usuário na cache pelo seu identificador.
 * @param id Identificador do usuário para obter o seu container.
 **/
HTMLChat.prototype.getUserById = function(id) {
  for (var i = 0; i < this.cachedContainers.length; i++) {
    if (this.cachedContainers[i].isUser() && this.cachedContainers[i].data && this.cachedContainers[i].data.id == id) {
      return this.cachedContainers[i];
    }
  }
};

/**
 * Obtém um grupo na cache pelo seu identificador.
 * @param id Identificador do grupo para obter o seu container.
 **/
HTMLChat.prototype.getGroupById = function(id) {
  for (var i = 0; i < this.cachedContainers.length; i++) {
    if (this.cachedContainers[i].isGroup() && this.cachedContainers[i].data && this.cachedContainers[i].data.id == id) {
      return this.cachedContainers[i];
    }
  }
};

/**
 * Cria e conecta o WebSocket no endpoint especificado.
 * @param endpoint Endpoint para se conectar.
 **/
HTMLChat.prototype.connect = function(endpoint) {
  if (this.authError === true || this.socketEndpoint === endpoint) return;

  this.socketEndpoint = endpoint;
  var object = this;

  // Obter os parâmetros da URL.
  var indice = location.pathname.lastIndexOf('/');
  var path = location.pathname.substring(0, indice + 1);

  // Verificar se ja possui websocket.
  if (this.socket) {
    try {
      // Desassociar eventos do websocket.
      this.socket.removeEventListener("open", this.onConnectedEvent);
      this.socket.removeEventListener("close", this.onDisconnectedEvent);
      this.socket.removeEventListener("message", this.onMessageReceivedEvent);
      this.socket.removeEventListener("error", this.onErrorThrownEvent);
    } catch (e) { }

    try {
      // Desconectar websocket.
      this.socket.close();
    } catch (e) { }
  }

  // Criar o websocket no endpoint recebido pelo servidor.
  this.socket = new WebSocket(this.protocol + location.host + path + endpoint);

  // Associar evento de conectado ao websocket.
  this.onConnectedEvent = function() { object.onConnected.apply(object, arguments); };
  this.socket.addEventListener("open", this.onConnectedEvent);

  // Associar evento de desconectado ao websocket.
  this.onDisconnectedEvent = function() { object.onDisconnected.apply(object, arguments); };
  this.socket.addEventListener("close", this.onDisconnectedEvent);

  // Associar evento de mensagem ao websocket.
  this.onMessageReceivedEvent = function() { object.onMessageReceived.apply(object, arguments); };
  this.socket.addEventListener("message", this.onMessageReceivedEvent);

  // Associar evento de erro ao websocket.
  this.onErrorThrownEvent = function() { object.onErrorThrown.apply(object, arguments); };
  this.socket.addEventListener("error", this.onErrorThrownEvent);
};

/**
 * Ocorre quando o socket conecta com o servidor.
 **/
HTMLChat.prototype.onConnected = function(e) {
  if (this.connectionError) {
    this.hideChatMessage();
    this.connectionError = false;
  }

  if (!this.aliveRoutineSet) {
    this.aliveRoutine(this);
  }

  // Verificar se o evento de Ao Conectar foi definido.
  if (this.AoConectar && this.user && this.user.data) this.AoConectar.call($mainform(), this.user.data.id);
};

/**
 * Ocorre quando o socket desconecta com o servidor.
 **/
HTMLChat.prototype.onDisconnected = function(e) {
  this.connectionError = true;

  // Exibir mensagem de erro de conexão.
  this.showChatMessage(
    getLocaleMessage("ERROR.CONNECTION_FAIL"),
    getLocaleMessage("INFO.CONNECTION_RETRY") + "...");
  this.updateLayout();

  // Verificar se o evento de Ao Desconectar foi definido.
  if (this.AoDesconectar && this.user && this.user.data) this.AoDesconectar.call($mainform(), this.user.data.id);

  // Reconectar com o endpoint.
  var endpoint = this.socketEndpoint;
  this.sockedEndPoint = null;
  this.connect(endpoint);
};

/**
 * Ocorre quando o socket recebe uma mensagem do servidor.
 **/
HTMLChat.prototype.onMessageReceived = function(e) {
  try {
    // Verificar se a mensagem não está vazia.
    if (e && e.data && e.data.length > 0) {
      var message = JSON.parse(e.data);

      // Verificar o tipo da mensagem.
      if (message.type == "message") { // Mensagem.
        // Verificar se é de um grupo.
        if (message.group) {
          var group = this.getGroupById(message.group);
          if (group) group.handleMessage(message);
        } else {
          var user = this.getUserById(message.from);
          if (user) {
            user.handleMessage(message);
            if (message.time) user.setState(null, message.time);
          }
        }

        // Verificar se o evento de Ao Receber Mensagem foi definido.
        if (this.AoReceberMensagem) this.AoReceberMensagem.call($mainform(), message.id, message.from, message.group ?
          message.group : message.destination, message.group ? true : false, message.message);
      } else if (message.type == "received") { // Servidor recebeu a mensagem.
        // Verificar se é de um grupo.
        if (message.group) {
          var group = this.getGroupById(message.group);
          if (group) group.setMessageStatus(message.messageId, 1);
        } else {
          var user = this.getUserById(message.destination);
          if (user) user.setMessageStatus(message.messageId, 1);
        }
      } else if (message.type == "userreceived") { // Cliente recebeu a mensagem.
        // Verificar se é de um grupo.
        if (message.group) {
          var group = this.getGroupById(message.group);
          if (group) group.setMessageStatus(message.messageId, 2);
        } else {
          var user = this.getUserById(message.messageDestination);
          if (user) {
            user.setMessageStatus(message.messageId, 2);
            user.setState(1);
          }
        }
      } else if (message.type == "read") { // Cliente leu a mensagem.
        if (this.showReadConfirmation) {
          // Verificar se é de um grupo.
          if (message.group) {
            var group = this.getGroupById(message.group);
            if (group) group.setMessageStatus(message.messageId, 3);
          } else {
            var user = this.getUserById(message.from);
            if (user) user.setMessageStatus(message.messageId, 3);
          }
        }
      } else if (message.type == "connected") { // Cliente conectado.
        if (this.showUserStates) {
          var user = this.getUserById(message.from);
          if (user) user.setState(1);
        }

        // Verificar se o evento de Ao Conectar foi definido.
        if (this.AoConectar) this.AoConectar.call($mainform(), message.from);
      } else if (message.type == "disconnected") { // Cliente desconectado.
        if (this.showUserStates) {
          var user = this.getUserById(message.from);
          if (user) user.setState(2, message.lastSeen);
        }

        // Verificar se o evento de Ao Desconectar foi definido.
        if (this.AoDesconectar) this.AoDesconectar.call($mainform(), message.from);
      } else if (message.type == "action") { // Ação.
        if (message.action == "update") { // Atualizar chat.
          this.updateData(true);
        }
      }

      // Verificar se possui ID.
      if (message.id) {
        // Enviar a mensagem para o servidor informando que recebeu a mensagem.
        this.socket.send(JSON.stringify({
          type: "received",
          id: message.id,
          from: message.from,
          destination: message.destination
        }));
      }
    }
  } catch (e) { }
};

/**
 * Ocorre quando o socket falha ao se conectar com o servidor.
 **/
HTMLChat.prototype.onErrorThrown = function(e) {
  this.connectionError = true;

  // Exibir mensagem de erro de conexão.
  this.showChatMessage(
    getLocaleMessage("ERROR.CONNECTION_FAIL"),
    getLocaleMessage("INFO.CONNECTION_RETRY") + "...");
  this.updateLayout();

  // Reconectar com o endpoint.
  var endpoint = this.socketEndpoint;
  this.sockedEndPoint = null;
  this.connect(endpoint);
};

/**
 * Ocorre ao usuário clicar no botão de voltar.
 **/
HTMLChat.prototype.backScreenAction = function() {
  // Verificar se a tela de detalhes do container está aberta.
  if (this.activeContainer && this.activeContainer.isDetailsOpen) {
    // Fechar tela de detalhes.
    this.activeContainer.toggleDetails();
  } else {
    // Tela de detalhes não está aberta.
    // Fechar container ativo.
    this.activeScreen = 0;
    if (this.activeContainer) {
      this.activeContainer.setActive(false);
    }
  }

  // Atualizar layout.
  this.updateLayout();
};

/**
 * Ocorre ao usuário clicar no botão de enviar mensagem.
 **/
HTMLChat.prototype.sendMessageAction = function() {
  // Fechar tooltip do bootstrap.
  bootstrapCloseTooltip(this.sendButton);

  // Verificar se o input está vazio.
  if (!this.activeContainer || this.input.value === undefined || this.input.value === null ||
       this.input.value.length == 0 || this.input.value.trim().length == 0) {

    this.sendButton.disabled = true;
    return false;
  }

  // Obter o conteúdo da mensagem a ser enviada.
  var messageContent = this.input.value.trim();

  // Resetar input e desativar o botão de enviar.
  this.input.value = "";
  this.input.style.height = "2.5rem";
  this.sendButton.disabled = true;

  // Verificar se é o container de enviar mensagem para todos.
  if (this.activeContainer.isSendToEveryone) {
    // Enviar mensagem para todo mundo.
    for (var i = 0; i < this.cachedContainers.length; i++) {
      var currentContainer = this.cachedContainers[i];

      // Verificar se é um usuário, não é o container de Enviar para Todos e se não é o usuário atual.
      if (currentContainer.isUser() && !currentContainer.isSendToEveryone && currentContainer.data && currentContainer.data.id != this.user.data.id) {
        this.sendMessage(currentContainer.data.id, false, messageContent);
      }
    }

    if (this.sendToEveryoneContainer) {
      // Adicionar mensagem ao container do enviar mensagem para todos.
      this.sendToEveryoneContainer.handleMessage({
        type: "message",
        id: this.getUniqueId() + "-g",
        from: this.user.data.id,
        destination: this.user.data.id,
        time: moment().utc().toISOString(),
        message: messageContent,
        everyone: true
      }, false);

      // Rolar a barra para baixo.
      this.sendToEveryoneContainer.scrollToBottom();
    }
  } else {
    // Enviar a mensagem.
    this.sendMessage(this.activeContainer.data.id, this.activeContainer.isGroup(), messageContent);
  }
};

/**
 * Enviar uma mensagem para um usuário/grupo.
 * @param entityId Identificador do container.
 * @param entityIsGroup O container é um grupo?
 * @param messageContent Conteúdo da mensagem.
 **/
HTMLChat.prototype.sendMessage = function(entityId, entityIsGroup, messageContent) {
  var entityInstance = null;

  // Criar o objeto da mensagem.
  var messageData = {
    // Tipo da requisição
    type: "message",

    // Id da mensagem
    id: this.getUniqueId(),

    // Dados da mensagem
    from: this.user.data.id,
    time: moment().utc().toISOString(),
    message: messageContent
  };

  // Verificar se o container é um grupo.
  if (entityIsGroup) {
    // Definir grupo destinatário da mensagem.
    messageData.group = entityId;

    // Obter a instância do container.
    entityInstance = this.getGroupById(entityId);
  } else {
    // Definir usuário destinatário da mensagem.
    messageData.destination = entityId;

    // Obter a instância do container.
    entityInstance = this.getUserById(entityId);
  }

  if (entityInstance) {
    // Adicionar mensagem ao container do usuário destino
    entityInstance.handleMessage(messageData);

    // Verificar se o container está ativo.
    if (entityInstance.active) {
      // Rolar a barra para baixo.
      entityInstance.scrollToBottom();
    }
  }

  // Enviar a mensagem para o servidor.
  this.socket.send(JSON.stringify(messageData));

  // Verificar se o evento de Ao Enviar Mensagem foi definido.
  if (this.AoEnviarMensagem) this.AoEnviarMensagem.call($mainform(), messageData.id, messageData.from,
    entityIsGroup ? messageData.group : messageData.destination, entityIsGroup, messageContent);

  // Retornar objeto da mensagem.
  return messageData;
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
    this.searchAction(this.searchInput, this.usersList, this.searchResults, this.usersListClass, null);
  }
};

/**
 * Realiza uma busca numa lista de usuários.
 * @param searchInput Elemento de input da pesquisa.
 * @param usersList Elemento da lista de usuários.
 * @param resultsList Elemento da lista de resultados da pesquisa.
 * @param usersListClass Classes CSS do elemento da lista de usuários.
 * @param listItemAction (Opcional) Ação de clique do item da lista de usuários.
 * @param wrapperList (Opcional) Lista de containers que será realizada a busca (por padrão ele irá buscar no "cachedContainers").
 **/
HTMLChat.prototype.searchAction = function(searchInput, usersList, resultsList, usersListClass, listItemAction, wrapperList) {
  var list = wrapperList ? wrapperList : this.cachedContainers;
  var items = [];

  if (searchInput.value == null || searchInput.value.length == 0) {
    resultsList.className = "chat-search-results d-none"; // Bootstrap
    resultsList.innerHTML = "";
    usersList.className = usersListClass;
  } else {
    resultsList.className = "chat-search-results " + usersListClass;
    resultsList.innerHTML = "";
    usersList.className = "d-none"; // Bootstrap

    // Procurar pelo usuário na lista de usuários cacheados.
    for (var i = 0; i < list.length; i++) {
      var userContainer = list[i];

      // Verificar se o id do usuário atual não é igual ao do usuário logado.
      if (!userContainer.isSendToEveryone && userContainer.data && userContainer.data.id != this.user.data.id) {
        var lowerCaseQuery = searchInput.value.toLowerCase().trim();
        var lowerCaseName = userContainer.data.name.toLowerCase().trim();

        // Verificar se o nome é igual ou contém partes.
        if (lowerCaseName == lowerCaseQuery || lowerCaseName.indexOf(lowerCaseQuery) >= 0) {
          // Desenhar o item do usuário na lista de resultados.
          var containerItem = this.designContainerItem(resultsList, userContainer.data, userContainer.index, lowerCaseQuery, listItemAction);

          // Adicionar a lista.
          items.push({
            id: userContainer.data.id,
            element: containerItem[0]
          });
        }
      }
    }

    // Verificar se nenhum resultado foi encontrado.
    if (items.length == 0) {
      // Adicionar borda no topo da lista.
      resultsList.className = "chat-search-results " + usersListClass + " border-top"; // Bootstrap

      // Criar um span para informar que nenhum resultado foi encontrado.
      var noResultsText = document.createElement("span");
      noResultsText.className = "text-muted text-center w-100 h-auto p-4"; // Bootstrap
      noResultsText.innerText = getLocaleMessage("LABEL.CHAT_SEARCH_NO_RESULTS");
      resultsList.appendChild(noResultsText);
    }
  }

  return items;
};

/**
 * Obtém o ID da instância desse chat.
 **/
HTMLChat.prototype.getInstanceId = function() {
  return this.sys + "$" + this.formID + "$" + this.code;
};

/**
 * Rotina de estado online deste cliente.
 * @param context Referência para a instância do chat.
 **/
HTMLChat.prototype.aliveRoutine = function(context) {
  // Enviar para o servidor a mensagem "alive", se o socket estiver conectado.
  if (context.socket && context.socket.readyState == 1) {
    context.socket.send(JSON.stringify({
      type: "alive",
      chatInstance: this.getInstanceId(),
      from: context.user.data.id
    }));
  }

  // Executar essa função novamente depois de 5 segundos.
  setTimeout(function() {
    context.aliveRoutine(context);
  }, 5000);

  // Definir flag para não chamar a função novamente.
  this.aliveRoutineSet = true;
};

/**
 * Obtém um valor lógico indicando se o usuário pode interagir com o chat.
 **/
HTMLChat.prototype.canChat = function() {
  return (this.enabled && !this.connectionError && !this.unknownError && !this.authError);
};

/**
 * Obtém um valor lógico indicando se o navegador suporta notificações na área de trabalho.
 **/
HTMLChat.prototype.supportsDesktopNotifications = function() {
  return typeof Notification !== "undefined" && typeof Notification.requestPermission === "function";
};

/**
 * Obtém um valor lógico indicando se o usuário permitiu notificações na área de trabalho.
 **/
HTMLChat.prototype.isDesktopNotificationsGranted = function() {
  return this.supportsDesktopNotifications() && Notification.permission === "granted";
};

/**
 * Obtém um valor lógico indicando se o usuário bloqueou notificações na área de trabalho.
 **/
HTMLChat.prototype.isDesktopNotificationsDenied = function() {
  return !this.supportsDesktopNotifications() || Notification.permission === "denied";
};

/**
 * Obtém um valor lógico indicando se o chat deve exibir notificações na área de trabalho.
 **/
HTMLChat.prototype.shouldShowDesktopNotifications = function() {
  return (this.showDesktopNotifications && !this.pageVisible && this.supportsDesktopNotifications() && this.isDesktopNotificationsGranted());
};

/**
 * Exibe uma notificação na área de trabalho.
 * @param title Título da notificação.
 * @param icon Ícone da notificação.
 * @param image Imagem da notificação.
 * @param body Conteúdo da notificação.
 * @param time Horário da notificação.
 **/
HTMLChat.prototype.showDesktopNotification = function(title, icon, image, body, time) {
  return new Notification(title, {
    icon: icon,
    image: image,
    body: body,
    timestamp: time
  });
};

/**
 * Atualiza o layout do input da mensagem.
 */
HTMLChat.prototype.updateInputLayout = function() {
  if (this.authError === true) return false;

  // Atualizar o estado do botão de enviar.
  if (this.sendButton) this.sendButton.disabled = !this.allowEmptyMessages && (!this.input ||
    this.input.value === undefined || this.input.value === null || this.input.value.trim().length == 0);

  // Atualizar a altura da caixa de texto.
  if (this.sendButton && !this.sendButton.disabled) {
    if (this.rightColumn && this.rightColumn.offsetHeight > 0 && this.input) {
      this.input.style.height = null;
      var targetHeight = this.input.scrollHeight;
      this.input.style.height = Math.min(Math.max(targetHeight,
        this.rightColumn.offsetHeight * 0.50), 0) + "px";
    }
  } else {
    if (this.input) this.input.style.height = this.input.style.minHeight;
  }
};

/**
 * Atualiza o layout do chat.
 **/
HTMLChat.prototype.updateLayout = function() {
  if (!this.canChat()) {
    // Se o usuário não pode enviar mensagens, desativar entrada.
    if (this.sendButton) this.sendButton.disabled = true;
    if (this.mediaButton) this.mediaButton.disabled = true;
    if (this.recordAudioButton) this.recordAudioButton.disabled = true;
    if (this.input) {
      this.input.disabled = true;
      this.input.value = "";
    }
  } else {
    // Ativar entrada e botão de enviar.
    if (this.sendButton) this.sendButton.disabled = (!this.input.value || this.input.value.length == 0);
    if (this.mediaButton) this.mediaButton.disabled = false;
    if (this.recordAudioButton) this.recordAudioButton.disabled = false;
    if (this.input) this.input.disabled = false;
  }

  if (this.fullscreen && this.tab) {
    var distanceFromTop = this.tab.getDistanceFromTop();
    var targetHeight = (distanceFromTop > 0) ? "calc(100vh - " + distanceFromTop + "px)" : "100vh";
    if (this.tab.div) this.tab.div.style.setProperty("min-height", targetHeight, "important");

    if (this.div) {
      this.div.style.setProperty("min-height", targetHeight, "important");
      this.div.style.maxHeight = targetHeight;
    }

    if (this.leftColumn) this.leftColumn.style.maxHeight = this.div.style.maxHeight;
    if (this.rightColumn) this.rightColumn.style.maxHeight = this.div.style.maxHeight;
  }

  // Ajeitar layout da tela dependendo do seu tamanho.
  if (this.viewMode == 3 || (this.viewMode == 1 && this.div.offsetWidth <= 576)) {
    if (this.backButton) this.backButton.className = this.backButtonClass;

    if (this.contentDiv) {
      this.contentDiv.className = this.contentDivClass;
      this.contentDiv.style.height = null;
    }

    switch (this.activeScreen) {
      case 0:
        if (this.leftColumn) this.leftColumn.className = "chat-layout-left-col chat-layout-active col-12 p-0 d-flex flex-column flex-fill"; // Bootstrap
        if (this.rightColumn) this.rightColumn.className = "chat-layout-right-col chat-layout-inactive d-none"; // Bootstrap
        break;
      case 1:
        if (this.leftColumn) this.leftColumn.className = "chat-layout-left-col chat-layout-inactive d-none"; // Bootstrap
        if (this.rightColumn) this.rightColumn.className = "chat-layout-right-col chat-layout-active col-12 p-0 d-flex flex-column flex-fill"; // Bootstrap
        break;
    }

    if (this.activeContainer) {
      if (this.activeContainer.item) this.activeContainer.item.className = this.activeContainer.itemClass;
      if (this.activeContainer.itemLast) this.activeContainer.itemLast.className = "d-inline-block text-truncate text-muted mb-0"; // Bootstrap
      if (this.activeContainer.itemLastBadge) this.activeContainer.itemLastBadge.className = "d-none"; // Bootstrap
    }
  } else {
    if (this.backButton) {
      if (this.activeContainer && this.activeContainer.isDetailsOpen) {
        this.backButton.className = this.backButtonClass;
      } else {
        this.backButton.className = "d-none"; // Bootstrap
      }
    }

    if (this.leftColumn) {
      this.leftColumn.className = this.leftColumnClass;
      this.leftColumn.style.cssText = null;
    }

    if (this.rightColumn) this.rightColumn.style.cssText = null;

    if (this.activeContainer) {
      if (this.rightColumn) this.rightColumn.className = this.rightColumnClass;
      if (this.activeContainer.item) this.activeContainer.item.className = this.activeContainer.itemClass + " active"; // Bootstrap
      if (this.activeContainer.itemLast) this.activeContainer.itemLast.className = "d-inline-block text-truncate text-white mb-0"; // Bootstrap
      if (this.activeContainer.itemLastBadge) this.activeContainer.itemLastBadge.className = "d-none"; // Bootstrap
    } else {
      if (this.rightColumn) this.rightColumn.className = "d-none"; // Bootstrap
    }
  }

  // Atualizar o layout do input.
  this.updateInputLayout();
};

/**
 * Formatar a string de exibição do horário de visto por último de um usuário.
 * @param lastSeen Visto por útimo do usuário em moment().
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
 * @param name Nome para formatar.
 **/
HTMLChat.prototype.formatName = function(name) {
  // NOTA: Essa função é importante pois se o sistema cadastrou o nome
  //       completo do usuário, ele irá exibir somente o Nome + Sobrenome.

  // Verificar se o nome possui espaço.
  if (name && name.indexOf(" ") != -1) {
    // Separar as partes do nome.
    var names = name.split(" ");

    // Obter Nome + Sobrenome (ex: João Augusto) ou Nome + Conector + Sobrenome (ex: Maria das Flores).
    return ((names.length > 1) ? names[0] + " " + (names.length > 2 && names[1].length <= 3 ?
      names[1] + " " + names[2] : names[1]) : names[0]).trim();
  }

  return name;
};

/**
 * Abrir o modal de exportação da conversa.
 **/
HTMLChat.prototype.openExportModal = function() {
  if (!this.allowExport || !this.canExport || !this.enabled || this.activeContainer == null) return false;
  var object = this;

  // Criar o modal de exportação de conversa.
  var modal = ebfBootstrapCreateModal(getLocaleMessage("LABEL.CHAT_EXPORT_CONVERSATION"),
    true, null, null, null, document.body);

  // Obter elementos do modal.
  var modalDiv = modal[0];
  var modalBody = modal[2];
  var modalFooter = modal[3];

  // Ajustar classe do modal.
  modalDiv.className = "chat-modal " + modalDiv.className;

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
  dateStartLabel.innerText = getLocaleMessage("LABEL.CALENDAR_DATE_START");
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
  dateEndLabel.innerText = getLocaleMessage("LABEL.CALENDAR_DATE_END");
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
  messagesOrderLabel.innerText = getLocaleMessage("LABEL.CHAT_ORDER");
  messagesOrderDiv.appendChild(messagesOrderLabel);

  var messagesOrderSelect = document.createElement("select");
  messagesOrderSelect.id = modalDiv.id + "-order";
  messagesOrderSelect.className = "custom-select"; // Bootstrap
  messagesOrderDiv.appendChild(messagesOrderSelect);

  var olderToNewer = document.createElement("option");
  olderToNewer.value = "0";
  olderToNewer.innerText = getLocaleMessage("LABEL.CHAT_ORDER_OLDER_TO_NEWER");
  olderToNewer.setAttribute("selected", "selected");
  messagesOrderSelect.appendChild(olderToNewer);

  var newerToOlder = document.createElement("option");
  newerToOlder.value = "1";
  newerToOlder.innerText = getLocaleMessage("LABEL.CHAT_ORDER_NEWER_TO_OLDER");
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
  pageLayoutLabel.innerText = getLocaleMessage("LABEL.PAGE_DIMENSIONS");
  optionsRowCol1.appendChild(pageLayoutLabel);

  var pageLayoutSelect = document.createElement("select");
  pageLayoutSelect.id = modalDiv.id + "-page-layout";
  pageLayoutSelect.className = "custom-select"; // Bootstrap
  optionsRowCol1.appendChild(pageLayoutSelect);

  // Criar opções de layout de páginas.
  for (var i = 1; i <= 6; i++) { // A1 até A6
    var pageLayoutAi = document.createElement("option");
    pageLayoutAi.value = i.toString();
    pageLayoutAi.innerText = "A" + i;
    if (i == 4) pageLayoutAi.setAttribute("selected", "selected"); // A4 selecionado padrão
    pageLayoutSelect.appendChild(pageLayoutAi);
  }

  // Criar opção de estilo da página.
  var pageStyleLabel = document.createElement("label");
  pageStyleLabel.setAttribute("for", modalDiv.id + "-page-style");
  pageStyleLabel.innerText = getLocaleMessage("LABEL.STYLE");
  optionsRowCol2.appendChild(pageStyleLabel);

  var pageStyleSelect = document.createElement("select");
  pageStyleSelect.id = modalDiv.id + "-page-style";
  pageStyleSelect.className = "custom-select"; // Bootstrap
  optionsRowCol2.appendChild(pageStyleSelect);

  var pageStyleSimple = document.createElement("option");
  pageStyleSimple.value = "0";
  pageStyleSimple.innerText = getLocaleMessage("LABEL.SIMPLE");
  pageStyleSelect.appendChild(pageStyleSimple);

  var pageStyleDark = document.createElement("option");
  pageStyleDark.value = "1";
  pageStyleDark.setAttribute("selected", "selected");
  pageStyleDark.innerText = getLocaleMessage("LABEL.DARK");
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
  rotatedLabel.innerText = getLocaleMessage("LABEL.ROTATE_PAGE");
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
  bordersLabel.innerText = getLocaleMessage("LABEL.BORDERED_TABLE");
  bordersLabel.style.overflow = "visible";
  bordersCheckboxDiv.appendChild(bordersLabel);

  // Criar botões do modal.
  var cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "btn btn-secondary float-right"; // Bootstrap
  cancelButton.innerText = this.editable ? getLocaleMessage("LABEL.CANCEL") : getLocaleMessage("LABEL.CLOSE");
  cancelButton.setAttribute("data-dismiss", "modal"); // Bootstrap
  modalFooter.appendChild(cancelButton);

  var exportButton = document.createElement("button");
  exportButton.type = "button";
  exportButton.className = "btn btn-primary float-right mr-2"; // Bootstrap
  exportButton.innerText = getLocaleMessage("LABEL.EXPORT");
  modalFooter.appendChild(exportButton);

  // Associar evento de clique ao botão.
  exportButton.addEventListener("click", function() {
    var dateStartValue = $(dateStartInput).datetimepicker('date');
    var dateEndValue = $(dateEndInput).datetimepicker('date');

    object.exportConversation(
      /* Container ID: */ object.activeContainer.data.id,
      /* Container Type: */ object.activeContainer.data.type,
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
  });

  // Associar eventos aos elementos do modal.
  dateStartCheckboxInput.addEventListener("change", function() {
    dateStartInput.readOnly = !dateStartCheckboxInput.checked;
  });

  dateEndCheckboxInput.addEventListener("change", function() {
    dateEndInput.readOnly = !dateEndCheckboxInput.checked;
  });
};

/**
 * Abrir o modal de criação/edição de grupo.
 * @param group (Opcional) Dados do grupo para edição.
 * @param mode (Opcional) Modo de abertura do modal.
 *   - 0: Padrão.
 *   - 1: Adicionar usuário.
 **/
HTMLChat.prototype.openGroupModal = function(group, mode) {
  if (!this.allowCreateGroups || !this.cachedContainers) return false;

  // Verificar se possui formulário de grupos.
  if (this.hasGroupsForm()) {
    // Mandar requisição para o servidor para retornar o formulário de grupos.
    $.post(this.getRequestURL() + "&type=g" + (group ? "&req=" + URLEncode(group.id, "GET") +
      "&reqType=" + URLEncode(group.type, "GET") + "&typeAction=edit" : ""), { }, function(response) {
        if (response && response.success && response.command && response.command.length > 0) {
          // Abrir formulário de grupos.
          eval(response.command);
        } else {
          // Exibir mensagem de erro.
          new HTMLMessage().showErrorMessage(getLocaleMessage("ERROR.OPERATION_ERROR"), null, null, response.details);

          // Chamar callback de erro.
          failCallback();
        }
      });
  } else {
    var object = this;

    var wrapperUsersList = [];
    var selectedUsers = group && group.users ? group.users : [];
    var groupImageFile = null;
    var groupImageFileName = null;

    // Criar o modal de criação de grupos.
    var modal = ebfBootstrapCreateModal(group ? (mode === 1) ?
      getLocaleMessage("LABEL.CHAT_ADD_USERS") :
      getLocaleMessage("LABEL.CHAT_EDIT_GROUP") :
      getLocaleMessage("LABEL.CHAT_CREATE_GROUP"),
      true, null, null, null, document.body);

    // Obter elementos do modal.
    var modalDiv = modal[0];
    var modalBody = modal[2];
    var modalFooter = modal[3];
    var modalDialog = modal[4];

    // Ajustar classe do modal.
    modalDiv.className = "chat-modal " + modalDiv.className;

    // Ajustar layout do modal.
    if (mode !== 1) modalBody.className += " p-sm-4"; // Bootstrap
    else modalBody.className += " p-0"; // Bootstrap
    modalDialog.className += " modal-dialog-scrollable"; // Bootstrap

    // Criar formulário do grupo.
    var groupForm = document.createElement("form");
    groupForm.className = "d-flex flex-column flex-fill"; // Bootstrap
    groupForm.method = "post";
    groupForm.action = "";
    modalBody.appendChild(groupForm);

    if (mode !== 1) {
      // Criar form-group para suportar o input do nome.
      var nameFormGroup = document.createElement("div");
      nameFormGroup.className = "form-group row position-relative mt-0 mb-3"; // Bootstrap
      groupForm.appendChild(nameFormGroup);

      var imageColDiv = document.createElement("div");
      imageColDiv.className = "col-2 d-flex flex-column align-items-center justify-content-center"; // Bootstrap
      nameFormGroup.appendChild(imageColDiv);

      var nameColDiv = document.createElement("div");
      nameColDiv.className = "col-10 d-flex flex-column justify-content-center"; // Bootstrap
      nameFormGroup.appendChild(nameColDiv);

      // Criar imagem do grupo.
      var imageDiv = document.createElement("div");
      imageDiv.className = "d-flex align-items-center justify-content-center rounded-circle border bg-light text-muted overflow-hidden"; // Bootstrap
      imageDiv.style.width = "3rem";
      imageDiv.style.height = "3rem";
      imageDiv.style.cursor = "pointer";
      imageDiv.style.backgroundPosition = "center center";
      imageDiv.style.backgroundRepeat = "no-repeat";
      imageDiv.style.backgroundSize = "cover";
      imageColDiv.appendChild(imageDiv);

      var imageIconDiv = document.createElement("i");
      imageIconDiv.className = "fas fa-camera"; // Font Awesome
      imageDiv.appendChild(imageIconDiv);

      // Criar link para remover a imagem.
      var imageRemoveLink = document.createElement("a");
      imageRemoveLink.href = "#";
      imageRemoveLink.className = "text-muted text-decoration-none mt-2 mb-0"; // Bootstrap
      imageRemoveLink.style.fontSize = "0.8rem";
      imageRemoveLink.innerText = getLocaleMessage("LABEL.REMOVE");
      imageColDiv.appendChild(imageRemoveLink);

      /**
       * Define a imagem do grupo.
       * @param url URL da imagem.
       */
      var setGroupImage = function(url) {
        if (url && url.length > 0) {
          imageIconDiv.style.display = "none";
          imageDiv.style.backgroundImage = "url('" + url + "')";
          imageDiv.style.width = "3rem";
          imageDiv.style.height = "3rem";
          imageRemoveLink.style.display = null;
        } else {
          imageIconDiv.style.display = null;
          imageDiv.style.backgroundImage = null;
          imageDiv.style.width = "3.5rem";
          imageDiv.style.height = "3.5rem";
          imageRemoveLink.style.display = "none";
        }
      };

      var fileInput = null;

      // Associar evento de clique a div de imagem.
      imageDiv.addEventListener("click", function() {
        // Cria o input de arquivos.
        createFileInput();

        // Abrir seleção de arquivos.
        fileInput.click();
      });

      /**
       * Cria o input de arquivos no formulário para seleção de imagens.
       */
      var createFileInput = function() {
        // Remover input anterior.
        if (fileInput) imageColDiv.removeChild(fileInput);

        // Criar input de arquivos.
        fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.multiple = false;
        fileInput.accept = "image/*"; // Somente aceitar imagens
        fileInput.name = "image";
        fileInput.className = "d-none"; // Bootstrap
        imageColDiv.appendChild(fileInput);

        // Associar evento de mudança ao input de arquivos.
        fileInput.addEventListener("change", function() {
          if (fileInput.files && fileInput.files.length > 0) {
            groupImageFile = fileInput.files[0];
            setGroupImage(window.URL.createObjectURL(groupImageFile));
          }
        });
      };

      // Associar evento no link de remover imagem do grupo.
      imageRemoveLink.addEventListener("click", function(e) {
        e.preventDefault();
        groupImageFile = null;
        groupImageFileName = "false";
        setGroupImage(null);
      });

      setGroupImage(null);

      // Criar label do input do nome do grupo.
      var nameInputId = "group-name-" + this.code;
      var nameLabel = document.createElement("label");
      nameLabel.className = "mb-2"; // Bootstrap
      nameLabel.innerText = getLocaleMessage("LABEL.CHAT_GROUP_NAME");
      nameLabel.setAttribute("for", nameInputId);
      nameColDiv.appendChild(nameLabel);

      // Criar o input do nome do grupo.
      var nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.id = nameInputId;
      nameInput.className = "form-control"; // Bootstrap
      if (group) nameInput.value = group.name;
      nameColDiv.appendChild(nameInput);

      // Verificar se o grupo possui foto.
      if (group && group.photo && group.photo.length > 0 && group.photo !== false && group.photo !== "false") {
        // Definir a foto do grupo.
        setGroupImage(this.getRequestURL() +
          "&type=p" + // Foto do Container
          "&req=" + URLEncode(group.id, "GET") +
          "&reqType=" + URLEncode(group.type, "GET"));
      }
    }

    // Criar botão de cancelar.
    var cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "btn btn-secondary"; // Bootstrap
    cancelButton.innerText = getLocaleMessage("LABEL.CANCEL");
    cancelButton.setAttribute("data-dismiss", "modal");
    modalFooter.appendChild(cancelButton);

    // Criar botão de criar grupo.
    var createGroupButton = document.createElement("button");
    createGroupButton.type = "button";
    createGroupButton.className = "btn btn-primary"; // Bootstrap
    createGroupButton.innerText = group ? (mode === 1) ?
      getLocaleMessage("LABEL.ADD") :
      getLocaleMessage("LABEL.SAVE") :
      getLocaleMessage("LABEL.CHAT_CREATE_GROUP");
    modalFooter.appendChild(createGroupButton);

    if (!group || mode === 1) {
      // Criar form-group para suportar a lista de usuários.
      var usersListGroup = document.createElement("div");
      usersListGroup.className = "form-group position-relative d-flex flex-column flex-fill"; // Bootstrap
      groupForm.appendChild(usersListGroup);

      if (mode !== 1) {
        // Criar label da lista de usuários.
        var usersListLabel = document.createElement("label");
        usersListLabel.className = "mb-2"; // Bootstrap
        usersListLabel.innerText = getLocaleMessage("LABEL.USERS");
        usersListLabel.setAttribute("for", "");
        usersListLabel.style.flex = "0 0 auto"; // Correção para IE e Safari
        usersListGroup.appendChild(usersListLabel);
      }

      var usersListCard = document.createElement("div");
      if (mode !== 1) usersListCard.className = "card d-flex flex-column flex-fill p-0 overflow-hidden"; // Bootstrap
      else usersListCard.className = "d-flex flex-column flex-fill p-0"; // Bootstrap
      usersListGroup.appendChild(usersListCard);

      // Criar input de pesquisa da lista de usuários.
      var usersListSearchDiv = document.createElement("div");
      usersListSearchDiv.className = "d-flex flex-row w-100 bg-light border-bottom overflow-hidden" + (mode === 1 ? " sticky-top" : ""); // Bootstrap
      usersListSearchDiv.style.flex = "0 0 auto"; // Correção para IE e Safari
      usersListCard.appendChild(usersListSearchDiv);

      // Criar a div base do ícone da pesquisa.
      var searchIconBase = document.createElement("div");
      searchIconBase.className = "px-3 py-2"; // Bootstrap
      usersListSearchDiv.appendChild(searchIconBase);

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
      var usersListSearchInput = document.createElement("input");
      usersListSearchInput.type = "text";
      usersListSearchInput.className = "form-control-plaintext";
      usersListSearchInput.placeholder = getLocaleMessage("LABEL.CHAT_SEARCH") + "...";
      usersListSearchInput.style.outline = "0";
      usersListSearchDiv.appendChild(usersListSearchInput);

      // Criar lista de resultados da pesquisa.
      var usersListSearchResults = document.createElement("div");
      usersListSearchResults.className = "d-none"; // Bootstrap
      usersListCard.appendChild(usersListSearchResults);

      // Criar lista de usuários.
      var usersList = document.createElement("div");
      var usersListClass = "list-group list-group-flush d-flex flex-column flex-fill"; // Bootstrap
      usersList.className = usersListClass;
      usersListCard.appendChild(usersList);

      /**
       * Atualiza o layout do modal de grupo.
       */
      var updateModalLayout = function() {
        createGroupButton.disabled = ((mode !== 1 && (nameInput.value.length == 0 ||
          nameInput.value.trim().length == 0)) || ((!group || mode === 1) && (!selectedUsers ||
          selectedUsers.length == 0)) || (mode === 1 && wrapperUsersList.length == 0));
      };

      /**
       * Executa a ação de seleção em um item de um usuário.
       * @param userId Identificador do usuário.
       * @param userItem Item do usuário na lista.
       */
      var executeUserAction = function(userId, userItem) {
        var selectedUserIndex = selectedUsers.indexOf(userId);

        // Verificar se o usuário já está selecionado.
        if (selectedUserIndex >= 0) {
          // Remover da lista de usuários selecionados.
          selectedUsers.splice(selectedUserIndex, 1);

          // Remover classe de seleção.
          if (userItem.classList.contains("active")) { // Bootstrap
            userItem.classList.remove("active"); // Bootstrap
          }
        } else {
          // Adicionar usuário a lista de usuários selecionados.
          selectedUsers.push(userId);

          // Adicionar classe de seleção.
          if (!userItem.classList.contains("active")) { // Bootstrap
            userItem.classList.add("active"); // Bootstrap
          }
        }

        try {
          // Atualizar layout do modal.
          updateModalLayout();
        } catch (e) { }
      };

      /**
       * Redesenha a lista de usuários.
       */
      var redrawUsersList = function() {
        // Recriar lista de pesquisa.
        wrapperUsersList = [];

        // Limpar lista.
        usersList.innerHTML = "";

        // Preencher a lista de usuários.
        for (var i = 0; i < object.cachedContainers.length; i++) {
          // Verificar se é modo de edição e se o container atual já está no grupo.
          if (mode === 1 && group && group.users && group.users.length > 0 && object.cachedContainers[i].data && group.users.indexOf(object.cachedContainers[i].data.id) >= 0) {

          // Verificar se o container atual é um usuário e possui identificador.
          } else if (object.cachedContainers[i].isUser() && object.cachedContainers[i].data && object.cachedContainers[i].data.id != object.user.data.id) {
            wrapperUsersList.push(object.cachedContainers[i]);

            (function(index, userData, userItem) {
              // Criar o item do usuário na lista.
              userItem = object.designContainerItem(usersList, userData, index, null, function(e) {
                e.stopPropagation();
                e.preventDefault();
                executeUserAction(userData.id, userItem[0]);
              });

              // Verificar se o usuário está selecionado.
              if (selectedUsers.indexOf(userData.id) >= 0) {
                // Adicionar classe de seleção.
                if (!userItem[0].classList.contains("active")) {
                  userItem[0].classList.add("active");
                }
              } else {
                // Remover classe de seleção.
                if (userItem[0].classList.contains("active")) {
                  userItem[0].classList.remove("active");
                }
              }
            })(i, object.cachedContainers[i].data);
          }
        }

        // Verificar se não possui usuários para exibir.
        if (wrapperUsersList.length == 0) {
          var infoSpan = document.createElement("span");
          infoSpan.className = "text-muted text-center flex-fill p-4"; // Bootstrap
          infoSpan.innerText = getLocaleMessage("INFO.CHAT_NO_USERS_AVAILABLE_ADD");
          usersList.appendChild(infoSpan);
        }

        try {
          // Atualizar layout do modal.
          updateModalLayout();
        } catch (e) { }
      };

      redrawUsersList();

      /**
       * Buscar por usuários na lista.
       */
      var searchForUsers = function() {
        // Executar ação de pesquisa.
        var results = object.searchAction(usersListSearchInput, usersList, usersListSearchResults, usersListClass, false, wrapperUsersList);

        // Verificar por usuários selecionados.
        if (results && results.length > 0) {
          for (var i = 0; i < results.length; i++) {
            // Associar evento de clique.
            (function(resultItem) {
              resultItem.element.addEventListener("click", function(e) {
                e.stopPropagation();
                e.preventDefault();
                executeUserAction(resultItem.id, resultItem.element);
                redrawUsersList();
              });

              // Verificar se o usuário está selecionado.
              if (selectedUsers.indexOf(resultItem.id) >= 0) {
                // Adicionar classe de seleção.
                if (!resultItem.element.classList.contains("active")) {
                  resultItem.element.classList.add("active");
                }
              } else {
                // Remover classe de seleção.
                if (resultItem.element.classList.contains("active")) {
                  resultItem.element.classList.remove("active");
                }
              }
            })(results[i]);
          }
        }
      };

      // Associar evento de busca.
      usersListSearchInput.addEventListener("input", searchForUsers);
      usersListSearchInput.addEventListener("change", searchForUsers);
    }

    // Associar evento de clique ao botão de criar/salvar.
    createGroupButton.addEventListener("click", function() {
      // Esconder botões do rodapé do modal.
      cancelButton.style.setProperty("display", "none", "important");
      createGroupButton.style.setProperty("display", "none", "important");

      // Limpar corpo do modal.
      modalBody.innerHTML = "";

      // Ajustar layout do modal
      modalBody.className = "modal-body d-flex flex-column align-items-center justify-content-center p-5"; // Bootstrap

      // Criar spinner de carregamento.
      var spinner = bootstrapCreateSpinner(modalBody, "text-secondary", false); // Bootstrap
      spinner[0].style.fontSize = "1rem";
      spinner[0].style.width = "1.7rem";
      spinner[0].style.height = "1.7rem";

      /**
       * Callback de erro.
       */
      var failCallback = function() {
        // Remover spinner de carregamento.
        if (spinner) {
          modalBody.removeChild(spinner[0]);
          spinner = null;
        }

        // Criar texto informando que a conexão falhou.
        var iconSpan = document.createElement("span");
        iconSpan.className = "fas fa-exclamation-triangle text-secondary mb-3"; // Font Awesome - Bootstrap
        iconSpan.style.fontSize = "3rem";
        modalBody.appendChild(iconSpan);

        var infoSpan = document.createElement("span");
        infoSpan.className = "text-muted mb-2"; // Bootstrap
        infoSpan.innerText = getLocaleMessage("ERROR.CONNECTION_FAIL");
        modalBody.appendChild(infoSpan);

        // Criar botão de tentar novamente.
        var retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.className = "btn btn-secondary"; // Bootstrap
        retryButton.innerText = getLocaleMessage("LABEL.TRY_AGAIN");
        modalFooter.appendChild(retryButton);

        // Associar evento de clique ao botão de tentar novamente.
        retryButton.addEventListener("click", function() {
          modalFooter.removeChild(retryButton);
          createGroupButton.click();
        });
      };

      /**
       * Envia a requisição para o servidor para criar/editar o grupo.
       */
      var postCallback = function() {
        $.post(object.getRequestURL() + "&type=g" + (group ? "&req=" + URLEncode(group.id, "GET") +
          "&reqType=" + URLEncode(group.type, "GET") + (mode === 1 ? "&typeAction=add" : "&typeAction=edit") : ""), {

          name: nameInput ? nameInput.value.trim() : null,
          users: selectedUsers,
          photo: groupImageFileName

        }, function(response) {
          if (response && response.success) {
            if (group && mode === 1) {
              // Procurar pelo container do grupo.
              var groupContainer = object.getGroupById(group.id);
              if (groupContainer) {
                if (groupContainer.isDetailsOpen) {
                  // Recriar interface de detalhes do container.
                  object.activeContainer.isDetailsOpen = false;
                  object.activeContainer.toggleDetails();
                }

                // Atualizar label contendo o nome dos usuários.
                groupContainer.setState(null, null);
              } else {
                // Atualizar chat.
                object.updateData(true);
              }
            } else {
              // Atualizar chat.
              object.updateData(true);
            }

            // Fechar modal.
            bootstrapCloseModal(modal[0]);
          } else {
            // Exibir mensagem de erro.
            new HTMLMessage().showErrorMessage(getLocaleMessage("ERROR.OPERATION_ERROR"), null, null, response.details);

            // Chamar callback de erro.
            failCallback();
          }
        }).fail(failCallback);
      };

      if (mode !== 1 && groupImageFile) {
        var formData = new FormData();
        formData.append("upload", fileInput.files[0]);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", object.getFileUploadURL(), true);
        xhr.addEventListener("load", function() {
          try {
            if ((xhr.readyState === 4 || xhr.status === 200) && xhr.responseText && xhr.responseText.length > 0) {
              if (xhr.responseText.indexOf("Exception:") >= 0) {
                // Exibir mensagem de erro.
                new HTMLMessage().showErrorMessage(getLocaleMessage("ERROR.OPERATION_ERROR"), null, null, xhr.responseText);

                // Chamar callback de erro.
                failCallback();
              } else {
                // Dar parse no JSON da resposta do servidor.
                var responseJson = JSON.parse(xhr.responseText.trim());

                // Verificar se o nome do arquivo foi definido na resposta.
                if (responseJson && responseJson.name && responseJson.name.length > 0) {
                  // Definir nome do arquivo.
                  groupImageFileName = responseJson.name;

                  // Chamar callback de sucesso.
                  postCallback();
                } else {
                  // Chamar callback de erro.
                  failCallback();
                }
              }
            } else {
              failCallback();
            }
          } catch (e) {
            failCallback(e);
          }
        });

        xhr.addEventListener("error", failCallback);
        xhr.send(formData);
      } else {
        postCallback();
      }
    });

    if (nameInput) {
      // Associar eventos ao input do nome do grupo.
      nameInput.addEventListener("input", updateModalLayout);
      nameInput.addEventListener("change", updateModalLayout);
    }

    try {
      // Atualizar layout do modal.
      updateModalLayout();
    } catch (e) { }
  }
};

/**
 * Exportar uma conversa.
 * @param entityId Identificador do container para exportar a conversa.
 * @param entityType Tipo da container para exportar a conversa.
 * @param format Formato da exportação (pode ser: PDF).
 * @param order Ordem das mensagens na tabela (0: antigas para novas, 1: novas para antigas).
 * @param layout Layout da página (de 1 a 6, onde 1 é A1 e 6 é A6).
 * @param rotated Rotacionar página?
 * @param style Estilo da tabela (0: simples, 1: escuro).
 * @param borders Bordas na tabela?
 * @param dateStart Data inicial da query (pode ser nulo).
 * @param dateEnd Data final da query (pode ser nulo).
 **/
HTMLChat.prototype.exportConversation = function(entityId, entityType, format, order, layout, rotated, style, borders, dateStart, dateEnd) {
  if (!this.allowExport) return false;

  // Criar iframe para baixar o documento.
  if (!this.requestFrame) {
    this.requestFrame = document.createElement("iframe");
    this.requestFrame.className = "d-none"; // Bootstrap
    this.div.appendChild(this.requestFrame);
  }

  // Definir URL do iframe com os parâmetros.
  this.requestFrame.src = "WFRChatExport?sys=" + URLEncode(this.sys, "GET") +
    "&formID=" + URLEncode(this.formID, "GET") +
    "&comID=" + URLEncode(this.code, "GET") +
    "&type=" + format +
    "&req=" + URLEncode(entityId, "GET") +
    "&reqType=" + URLEncode(entityType, "GET") +
    (order && order.length > 0 ? "&order=" + order : "") +
    (layout && layout.length > 0 ? "&layout=" + layout : "") +
    (rotated === true ? "&rotated=1" : "&rotated=0") +
    (style && style.length > 0 ? "&style=" + style : "") +
    (borders === true ? "&borders=1" : "&borders=0") +
    (dateStart && dateStart.length > 0 ? "&from=" + URLEncode(dateStart, "GET") : "") +
    (dateEnd && dateEnd.length > 0 ? "&to=" + URLEncode(dateEnd, "GET") : "");
};

/**
 * Obtém streams de mídia do usuário (webcam e/ou microfone).
 * @param audio Valor lógico indicando se a stream deve ter uma trilha de áudio (microfone).
 * @param video Valor lógico indicando se a stream deve ter uma trilha de vídeo (webcam).
 * @param successCallback Callback de sucesso. Recebe como parâmetro a stream de mídia.
 * @param errorCallback Callback de erro. Recebe como parâmetro o erro ocorrido.
 */
HTMLChat.prototype.getUserMedia = function(audio, video, successCallback, errorCallback) {
  // A função navigator.getUserMedia() está obsoleta e está marcada como não
  // aconselhável a usar. Para contornar isso, primeiro iremos verificar se o método
  // novo (navigator.mediaDevices.getUserMedia) existe. Se não existir, tentaremos
  // utilizar o método antigo. Mais informações:
  //  - https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia
  //  - https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  //  - https://stackoverflow.com/questions/28991835/firefox-navigator-getusermedia-is-not-a-function

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Se o método novo não existir, devemos utilizar o metódo antigo
      // Para utilizar o método antigo: cada navegador implementa sua própria função que
      // tem nome diferente dos outros navegadores. Para contornar isso verificamos qual
      // função que existe e utilizamos ela.
      var getUserMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      );

      if (getUserMedia) {
        getUserMedia({
          video: true,
          audio: false
        }, successCallback, errorCallback);
      } else {
        // Quando nenhuma das duas funções exite, quer dizer que o
        // dispositivo não tem nenhuma webcam disponível ou o navegador
        // não tem suporte ou o navegador bloqueou a página a acessar
        // os dispositivos de mídia.
        errorCallback();
      }
    } else {
      // Utilizar o método novo
      navigator.mediaDevices.getUserMedia({
        video: video,
        audio: audio
      }).then(successCallback).catch(errorCallback);
    }
  } catch (e) {
    errorCallback(e);
  }
};

/**
 * Obtém um valor lógico indicando se o navegador atual possui a inteface de obtenção de mídias.
 */
HTMLChat.prototype.hasMediaInterface = function() {
  return ((navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
};

/**
 * Obtém uma Promise com um valor lógico indicando se o usuário possui webcam.
 */
HTMLChat.prototype.isWebcamSupported = function() {
  return new Promise(function(resolve, reject) {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(function(devices) {
        var result = false;
        for (var i = 0; i < devices.length; i++) {
          if (devices[i].kind === 'videoinput') result = true;
        }

        resolve(result);
      })
    }

    resolve(true);
  });
};

/**
 * Obtém um valor lógico indicando se a gravação de áudios é suportada.
 */
HTMLChat.prototype.isRecordingSupported = function() {
  return this.hasMediaInterface() && typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(this.audioMimeType);
};

/**
 * Inicia a captura de foto.
 */
HTMLChat.prototype.takePhotoAction = function() {
  // Abrir captura de fotos do Webrun.
  openCapture(this.sys, this.formID, this.code);
};

/**
 * Ocorre quando o componente sofre alguma atualização externa.
 * @param hasImage Valor lógico indicando se possui imagem.
 * @param hash Hash do arquivo.
 */
HTMLChat.prototype.refresh = function(hasImage, hash) {
  // Verificar se é imagem.
  if (hasImage === true && hash && hash.length > 0) { // O chat recebeu uma captura de foto do camera.jsp.
    // Enviar a captura de foto para o usuário ativo.
    if (this.activeContainer) this.activeContainer.enqueueMedia({
      // Definir o nome da mídia.
      name: hash + this.imageFileExtension,
      serverName: hash + this.imageFileExtension,

      // Definir o tipo como imagem.
      type: "image",

      // Por padrão, o camera.jsp cria a imagem como PNG.
      // Se no futuro isso for alterado, deverá ser alterado aqui também.
      mimeType: this.imageMimeType,

      // Definir a URL da mídia.
      url: "chat/upload/" + hash + this.imageFileExtension,

      // Sem descrição no momento.
      description: ""
    });
  } else { // Ocorre quando algum componente que é dependência desse muda de valor.
    // Atualizar os dados do componente.
    this.updateData();

    // Atualizar layout.
    this.updateLayout();
  }
};

/**
 * Inicia a gravação de áudio.
 */
HTMLChat.prototype.recordAudioAction = function() {
  var object = this;

  // Obter a MediaStream de áudio do usuário.
  this.getUserMedia(true, false,
    function(stream) {
      var startTime = null;
      var timerInterval = null;

      var recordDiv = null;
      var recordLabel = null;
      var inputGroupAppend = null;
      var sendButton = null;
      var cancelSendButton = null;

      // Criar MediaRecorder.
      var recordedChunks = [];
      var mediaRecorder = new MediaRecorder(stream, { mimeType: object.audioMimeType });

      // Associar evento de ao começar gravação.
      mediaRecorder.addEventListener("start", function() {
        // Definir o tempo inicial.
        startTime = moment();

        // Desabilitar caixa de texto.
        object.input.disabled = true;

        // Esconder botões da barra inferior.
        if (object.sendButton) object.sendButton.style.setProperty("display", "none", "important");
        if (object.mediaButton) object.mediaButton.style.setProperty("display", "none", "important");
        if (object.recordAudioButton) object.recordAudioButton.style.setProperty("display", "none", "important");

        // Criar interface de gravação.
        recordDiv = document.createElement("div");
        recordDiv.className = "d-flex flex-row flex-nowrap align-items-center h-100 pl-3"; // Bootstrap
        object.activeConvBottomDiv.appendChild(recordDiv);

        var recordIcon = document.createElement("i");
        recordIcon.className = "chat-nav-label chat-nav-label-record-icon fas fa-circle text-danger mr-2"; // Font Awesome - Bootstrap
        recordDiv.appendChild(recordIcon);

        recordLabel = document.createElement("span");
        recordLabel.className = "chat-nav-label chat-nav-label-record-time font-weight-bold mr-3"; // Bootstrap
        recordLabel.innerHTML = moment.utc(moment().diff(startTime)).format("mm:ss");
        recordDiv.appendChild(recordLabel);

        timerInterval = setInterval(function() {
          // Atualizar label de tempo.
          if (recordLabel) recordLabel.innerText = moment.utc(moment().diff(startTime)).format("mm:ss");
        }, 500);

        // Criar botão de enviar gravação.
        var confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.className = "chat-nav-button chat-nav-button-record-confirm btn btn-success d-flex align-items-center justify-content-center rounded-circle p-2 ml-2"; // Bootstrap
        confirmButton.style.width = "2rem";
        confirmButton.style.height = "2rem";
        confirmButton.style.fontSize = "0.85rem";
        confirmButton.title = getLocaleMessage("LABEL.OK");
        confirmButton.setAttribute("data-toggle", "tooltip");
        recordDiv.appendChild(confirmButton);

        var confirmButtonIcon = document.createElement("i");
        confirmButtonIcon.className = "fas fa-check"; // Font Awesome
        confirmButton.appendChild(confirmButtonIcon);

        // Inicializar tooltip do Bootstrap no botão.
        bootstrapInitTooltip(confirmButton);

        // Criar botão de cancelar gravação.
        var cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "chat-nav-button chat-nav-button-record-cancel btn btn-outline-danger d-flex align-items-center justify-content-center rounded-circle p-2 ml-2"; // Bootstrap
        cancelButton.style.width = "2rem";
        cancelButton.style.height = "2rem";
        cancelButton.style.fontSize = "0.85rem";
        cancelButton.title = getLocaleMessage("LABEL.CANCEL");
        cancelButton.setAttribute("data-toggle", "tooltip");
        recordDiv.appendChild(cancelButton);

        var cancelButtonIcon = document.createElement("i");
        cancelButtonIcon.className = "fas fa-times"; // Font Awesome
        cancelButton.appendChild(cancelButtonIcon);

        // Inicializar tooltip do Bootstrap no botão.
        bootstrapInitTooltip(cancelButton);

        // Associar evento de clique ao botão de cancelar gravação.
        cancelButton.addEventListener("click", function() {
          // Fechar tooltip.
          bootstrapCloseTooltip(cancelButton);

          // Habilitar caixa de texto.
          object.input.disabled = false;

          // Parar MediaRecorder.
          if (mediaRecorder && mediaRecorder.state != "inactive") {
            mediaRecorder.stop();
          }

          // Limpar dados gravados.
          recordedChunks = [];

          // Remover div de gravação.
          if (recordDiv) {
            object.activeConvBottomDiv.removeChild(recordDiv);
            recordDiv = null;
          }

          // Remover botões.
          if (sendButton) {
            object.activeConvBottomDiv.removeChild(sendButton);
            sendButton = null;
          }

          if (cancelSendButton) {
            object.activeConvBottomDiv.removeChild(cancelSendButton);
            cancelSendButton = null;
          }

          // Remover addon do input group.
          if (inputGroupAppend) {
            object.inputGroup.removeChild(inputGroupAppend);
            inputGroupAppend = null;
          }

          // Exibir botões da barra inferior.
          if (object.sendButton) object.sendButton.style.display = null;
          if (object.mediaButton) object.mediaButton.style.display = null;
          if (object.recordAudioButton) object.recordAudioButton.style.display = null;

          // Limpar variáveis.
          recordDiv = null;
          recordLabel = null;
          startTime = null;
        });

        // Associar evento de clique ao botão de confirmar gravação.
        confirmButton.addEventListener("click", function() {
          // Fechar tooltip.
          bootstrapCloseTooltip(confirmButton);

          // Habilitar caixa de texto.
          object.input.disabled = false;

          // Parar MediaRecorder.
          if (mediaRecorder && mediaRecorder.state != "inactive") {
            mediaRecorder.stop();
          }

          // Criar addon na textarea do chat.
          inputGroupAppend = document.createElement("div");
          inputGroupAppend.className = "input-group-append"; // Bootstrap
          object.inputGroup.appendChild(inputGroupAppend);

          var inputGroupText = document.createElement("span");
          inputGroupText.className = "input-group-text"; // Bootstrap
          inputGroupAppend.appendChild(inputGroupText);

          var audioFileIcon = document.createElement("span");
          audioFileIcon.className = "fas fa-volume-up mr-2"; // Font Awesome - Bootstrap
          inputGroupText.appendChild(audioFileIcon);

          var audioFileName = document.createElement("span");
          audioFileName.innerText = getLocaleMessage("LABEL.AUDIO");
          inputGroupText.appendChild(audioFileName);

          // Esconder div de gravação.
          if (recordDiv) recordDiv.style.setProperty("display", "none", "important");

          var previousSendButton = object.sendButton;

          // Criar botão de cancelar envio.
          cancelSendButton = document.createElement("button");
          cancelSendButton.type = "button";
          cancelSendButton.className = "chat-nav-button chat-nav-button-record-delete btn btn-light ml-3 d-flex align-items-center justify-content-center"; // Bootstrap
          cancelSendButton.title = getLocaleMessage("LABEL.CANCEL");
          cancelSendButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
          object.activeConvBottomDiv.appendChild(cancelSendButton);

          var cancelSendButtonIcon = document.createElement("span");
          cancelSendButtonIcon.className = "fas fa-times my-1"; // Font Awesome
          cancelSendButton.appendChild(cancelSendButtonIcon);

          // Associar evento de clique ao botão de cancelar envio.
          cancelSendButton.addEventListener("click", function() {
            // Fechar tooltip.
            bootstrapCloseTooltip(cancelSendButton);

            // Restaurar botão de envio.
            if (previousSendButton) {
              object.sendButton = previousSendButton;
              object.allowEmptyMessages = false;
              previousSendButton = null;
            }

            // Clicar no outro botão de cancelar.
            cancelButton.click();
          });

          // Inicializar tooltip do Bootstrap no botão.
          bootstrapInitTooltip(cancelSendButton);

          // Criar botão de enviar mensagem.
          sendButton = document.createElement("button");
          sendButton.type = "button";
          sendButton.className = "chat-nav-button chat-nav-button-record-send btn btn-light ml-3 d-flex align-items-center justify-content-center"; // Bootstrap
          sendButton.title = getLocaleMessage("LABEL.SEND");
          sendButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
          object.activeConvBottomDiv.appendChild(sendButton);

          var sendButtonIcon = document.createElement("span");
          sendButtonIcon.className = "fas fa-paper-plane my-1"; // Font Awesome
          sendButton.appendChild(sendButtonIcon);

          // Inicializar tooltip do Bootstrap no botão.
          bootstrapInitTooltip(sendButton);

          // Substituir botão de envio.
          object.sendButton = sendButton;
          object.allowEmptyMessages = true;

          // Associar evento de clique ao botão de enviar.
          sendButton.addEventListener("click", function() {
            // Fechar tooltip.
            bootstrapCloseTooltip(sendButton);

            // Restaurar botão de envio.
            if (previousSendButton) {
              object.sendButton = previousSendButton;
              object.allowEmptyMessages = false;
              previousSendButton = null;
            }

            // Criar o arquivo do áudio gravado.
            var audioFile = new File([new Blob(recordedChunks, { type: object.audioMimeType }) ],
              ebfGenerateGUID() + object.audioFileExtension, { type: object.audioMimeType, lastModified: new Date() });

            // Enviar arquivo.
            object.activeContainer.sendFile({
              url: window.URL.createObjectURL(audioFile),
              description: object.input.value,
              file: audioFile
            });

            // Limpar input.
            object.input.value = "";

            // Clicar no outro botão de cancelar.
            cancelButton.click();
          });
        });
      });

      // Associar evento de recebimento de dados.
      mediaRecorder.addEventListener("dataavailable", function(e) {
        // Adicionar dados ao chunk.
        if (e.data.size > 0) recordedChunks.push(e.data);
      });

      var stopHandler = function() {
        // Limpar o intervalo.
        if (timerInterval !== null) {
          clearInterval(timerInterval);
          timerInterval = null;
        }

        // Parar MediaStream.
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
          tracks[i].stop();
        }
      };

      // Associar evento de ao parar gravação.
      mediaRecorder.addEventListener("stop", stopHandler);

      // Associar evento de ao ocorrer erro.
      mediaRecorder.addEventListener("error", stopHandler);

      // Iniciar gravação.
      mediaRecorder.start();
    },

    function(error) {

    });
};

/**
 * Obtém um identificador único.
 **/
HTMLChat.prototype.getUniqueId = function() {
  //return ebfGenerateGUID();
  return moment().format("x") + "-" + (Math.floor(Math.random() * 1000000) + 1).toString();
};

/**
 * Obtém um valor lógico indicando se esse chat possui um formulário de grupos.
 **/
HTMLChat.prototype.hasGroupsForm = function() {
  return this.FormularioDeGrupos !== undefined && this.FormularioDeGrupos !== null &&
         this.FormularioDeGrupos.length > 0 && this.FormularioDeGrupos != "0";
};

/**
 * Obtém um valor lógico indicando se o chat deve enviar as confirmações de leitura.
 **/
HTMLChat.prototype.shouldSendReadConfirmations = function() {
  return this.showReadConfirmation && !this.authError && this.socket && this.pageVisible;
};

/**
 * Envia todas as confirmações de leitura pendentes.
 */
HTMLChat.prototype.sendAllPendingReadConfirmations = function() {
  if (this.cachedContainers && this.cachedContainers.length > 0) {
    for (var i = 0; i < this.cachedContainers.length; i++) {
      if (!this.cachedContainers[i].isSendToEveryone) {
        this.cachedContainers[i].sendPendingReadConfirmations();
      }
    }
  }
};

/**
 * Limpa todos os dados deste componente.
 **/
HTMLChat.prototype.flush = function() {
  // Resetar variáveis
  this.activeConvBottomDiv = null;
  this.activeConvDiv = null;
  this.activeConvUserDiv = null;
  this.activeConvUserWrapper = null;
  this.activeConvUserName = null;
  this.activeConvUserPicture = null;
  this.activeConvUserPictureDefault = null;
  this.activeConvUserPictureDefaultClass = null;
  this.activeConvUserPictureIcon = null;
  this.activeConvUserPictureLink = null;
  this.activeConvUserState = null;
  this.activeScreen = null;
  this.activeContainer = null;
  this.allowExport = null;
  this.backButton = null;
  this.backButtonClass = null;
  this.cachedContainers = null;
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
 * @param chat Referência para a instância do chat.
 * @param data Dados do container.
 * @param item Referência para a div do item do container.
 * @param itemPicture Referência para o elemento da imagem do item do container.
 * @param itemName Referência para o elemento do nome do item do container.
 * @param itemLast Referência para o elemento da última mensagem do item do container.
 * @param itemLastBadge Referência para a quantidade de mensagens não lidas.
 **/
function HTMLChatContainer(chat, index, data, item, itemPicture, itemName, itemLast, itemLastBadge) {
  this.chat = chat;
  this.index = index;
  this.data = data;

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
  this.waitingMessages = [];

  this.isDetailsOpen = false;
  this.isMediaViewOpen = false;

  this.historyRequested = false;
  this.historyHasReachedEnd = false;
}

/**
 * Setando propriedades do componente.
 **/
HTMLChatContainer.prototype.name = 'HTMLChatContainer';

/**
 * Raio de intensidade, em pixels, do efeito de desfoque das mídias.
 */
HTMLChatContainer.prototype.BLUR_RADIUS = 5;

/**
 * Altera o estado de ativo deste usuário.
 **/
HTMLChatContainer.prototype.setActive = function(active) {
  // Definir estado de ativo deste usuário.
  this.active = active;

  // Desmarcar usuário ativo.
  if (this.chat.activeContainer && (!active || this.chat.activeContainer != this)) {
    // Resetar estado de ativo do usuário anterior.
    this.chat.activeContainer.active = false;


    // Ocultar botão de editar grupo.
    if (this.chat.editGroupButton) this.chat.editGroupButton.style.setProperty("display", "none", "important");

    // Ocultar botão de deletar grupo.
    if (this.chat.deleteGroupButton) this.chat.deleteGroupButton.style.setProperty("display", "none", "important");

    // Ocultar separador do menu dropdown.
    if (this.chat.groupDropdownDivider) this.chat.groupDropdownDivider.style.setProperty("display", "none", "important");


    // Resetar estilo do item do usuário na lista de usuários.
    if (this.chat.activeContainer.item) this.chat.activeContainer.item.className = this.chat.activeContainer.itemClass;
    if (this.chat.activeContainer.itemLast) this.chat.activeContainer.itemLast.className = "d-inline-block text-truncate text-muted mb-0"; // Bootstrap

    // Se for enviar mensagem para todos, remover o ícone da barra superior.
    if (this.chat.sendToEveryoneIconDiv !== undefined && this.chat.sendToEveryoneIconDiv !== null) {
      this.chat.activeConvUserDiv.removeChild(this.chat.sendToEveryoneIconDiv);
      this.chat.sendToEveryoneIconDiv = null;
    }

    // Resetar imagem de exibição do usuário.
    if (this.chat.activeConvUserPicture) {
      this.chat.activeConvUserPicture.src = "";
      this.chat.activeConvUserPicture.alt = "";
    }

    // Resetar elementos de nome e estado do usuário.
    if (this.chat.activeConvUserName) this.chat.activeConvUserName.innerHTML = "";
    if (this.chat.activeConvUserState) this.chat.activeConvUserState.innerHTML = "";


    // Guardar scroll antigo.
    this.chat.activeContainer.scroll = this.chat.activeConvDiv.scrollTop;

    // Remover spinner de carregamento antigo.
    this.chat.activeContainer.removePreloader();

    // Destruir a view de mídia.
    this.chat.activeContainer.destroyMediaView();

    // Verificar se os detalhes estavam abertos.
    if (this.chat.activeContainer.isDetailsOpen) {
      // Fechar detalhes do container.
      this.chat.activeContainer.toggleDetails();
    }

    // Resetar variável.
    this.chat.activeContainer = null;
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
    this.chat.activeContainer = this;
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
    } else if (this.isSendToEveryone) {
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
      if ((this.isGroup() && (!this.ImagemGrupoSemFoto || this.ImagemGrupoSemFoto.length == 0)) ||
          (!this.isGroup() && (!this.ImagemSemFoto || this.ImagemSemFoto.length == 0))) {

        // Ajustar ícone de sem foto.
        if (this.chat.activeConvUserPictureIcon) this.chat.activeConvUserPictureIcon.className = "fas " + (this.isGroup() ? "fa-users" : "fa-user") + " text-dark"; // Font Awesome - Bootstrap

        // Ocultar a imagem sem foto e exibir o ícone de sem foto.
        if (this.chat.activeConvUserPicture) this.chat.activeConvUserPicture.className = "d-none"; // Bootstrap
        if (this.chat.activeConvUserPictureDefault) this.chat.activeConvUserPictureDefault.className = this.chat.activeConvUserPictureDefaultClass;
      } else {
        if (this.chat.activeConvUserPicture) {
          // Verificar se é grupo.
          if (this.isGroup()) {
            // Atualizar a imagem do grupo para a imagem sem foto.
            this.chat.activeConvUserPicture.className = "rounded-circle"; // Bootstrap
            this.chat.activeConvUserPicture.src = this.getImageSourceURL(this.ImagemGrupoSemFoto);
          } else {
            // Atualizar a imagem do usuário para a imagem sem foto.
            this.chat.activeConvUserPicture.className = "rounded-circle"; // Bootstrap
            this.chat.activeConvUserPicture.src = this.getImageSourceURL(this.ImagemSemFoto);
          }
        }

        // Ajustar href do link para o FancyBox.
        if (this.chat.activeConvUserPictureLink) this.chat.activeConvUserPictureLink.href = this.chat.activeConvUserPicture.src;
      }
    }

    // Atualizar o nome do usuário.
    if (this.itemName) this.chat.activeConvUserName.innerHTML = this.itemName.innerHTML;
    else if (this.isSendToEveryone) this.chat.activeConvUserName.innerText = getLocaleMessage("LABEL.CHAT_SEND_TO_EVERYONE");
    else this.chat.activeConvUserName.innerHTML = "";

    // Verificar se é um grupo.
    if (this.isGroup()) {
      // Verificar se o usuário atual é administrador.
      if (this.groupIsCurrentUserAdmin()) {
        // Exibir botão de editar grupo.
        if (this.chat.editGroupButton) this.chat.editGroupButton.style.display = null;

        // Exibir botão de deletar grupo.
        if (this.chat.deleteGroupButton) this.chat.deleteGroupButton.style.display = null;

        // Exibir separador do menu dropdown.
        if (this.chat.groupDropdownDivider) this.chat.groupDropdownDivider.style.display = null;
      }

      // Verificar se não possui exportação.
      if (!this.chat.allowExport && this.chat.rightDropdownArea) {
        this.chat.rightDropdownArea.style.display = null;
      }
    } else {
      // Verificar se não possui exportação.
      if (!this.chat.allowExport && this.chat.rightDropdownArea) {
        this.chat.rightDropdownArea.style.setProperty("display", "none", "important");
      }
    }

    // Associar evento scroll para obter histórico.
    var object = this;
    this.chat.activeConvDiv.onscroll = function() {
      if (object.chat && object.chat.activeContainer) {
        // Salvar posição do scroll.
        object.chat.activeContainer.scroll = object.chat.activeConvDiv.scrollTop;

        // Verificar se possui scroll e se está no topo e obter o histórico de mensagens.
        if (object.chat.activeConvDiv.clientHeight < object.chat.activeConvDiv.scrollHeight &&
            object.chat.activeConvDiv.scrollTop <= 0 && !object.loadHistoryButton) {

          // Obter o histórico de mensagens.
          object.chat.activeContainer.getHistoryMessages();
        }
      }
    };

    // Atualizar layout do chat.
    this.chat.updateLayout();

    // Exibir o estado do usuário.
    this.setState(null, null);

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
              this.setLastMessageContent(message);
              this.newerMessage = message;
              lastChanged = true;

            // Verificar se a primeira mensagem do chat.
            } else if (i == 0 && j == 0) {
              this.olderMessage = message;
            }

            var internalMessage = (message.from === this.chat.user.data.id);
            if (!internalMessage && this.isUser() && !message.sentConfirmation) {
              // Montar o objeto da confirmação de leitura da mensagem.
              var readConfirmationMsg = {
                type: "read",
                id: message.id + "-r",
                messageId: message.id,
                from: this.chat.user.data.id,
                destination: message.from
              };

              // Verificar se deve enviar a confirmação de leitura.
              if (this.chat.shouldSendReadConfirmations()) {
                // Enviar a mensagem para o servidor informando que leu a mensagem.
                this.chat.socket.send(JSON.stringify(readConfirmationMsg));
              } else {
                // Adicionar na lista de confirmações de leitura pendentes.
                if (!this.pendingReadConfirmations) this.pendingReadConfirmations = [];
                this.pendingReadConfirmations.push(readConfirmationMsg);
              }

              // Salvar que a confirmação de leitura da mensagem já foi enviada.
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

    // Desenhar a view de arquivo selecionados.
    this.designMediaView();

    if (!this.historyRequested) {
      // Obter mensagens do histórico.
      this.getHistoryMessages(true);
    } else if (this.hasLoadHistoryButton) {
      // Criar botão de carregar histórico.
      this.loadHistoryButton = null;
      this.createLoadHistoryButton();
    }

    // Verificar se não é o enviar mensagem para todos.
    if (!this.isSendToEveryone) {
      // Verificar se o evento de Ao Abrir Conversa foi definido.
      if (this.chat.AoAbrirConversa) this.chat.AoAbrirConversa.call($mainform(), this.data.id, this.isGroup());
    }
  } else {
    // Resetar elementos.
    this.chat.activeConvUserState.innerHTML = "";
    this.chat.activeConvUserName.innerHTML = "";

    // Resetar evento.
    this.chat.activeConvDiv.onscroll = null;

    // Resetar imagem de exibição do usuário.
    if (this.chat.activeConvUserPicture) {
      this.chat.activeConvUserPicture.className = "d-none"; // Bootstrap
      this.chat.activeConvUserPicture.src = "";
      this.chat.activeConvUserPicture.alt = "";
    }

    if (this.chat.activeConvUserPictureLink) this.chat.activeConvUserPictureLink.href = "#";
    if (this.chat.activeConvUserPictureDefault) this.chat.activeConvUserPictureDefault.className = "d-none"; // Bootstrap

    // Definir este container como inativo.
    this.chat.activeContainer = null;
    this.chat.activeScreen = 0;

    // Atualizar layout do chat.
    this.chat.updateLayout();
  }
};

/**
 * Alterna a visualização dos detalhes desse container.
 */
HTMLChatContainer.prototype.toggleDetails = function(recreate) {
  var object = this;

  // Verificar se é pra recriar a div de detalhes do container.
  if (recreate && !this.isMediaViewOpen) {
    this.isDetailsOpen = false;
  }

  if (this.isDetailsOpen || this.isMediaViewOpen || this.isSendToEveryone) {
    if (this.chat.activeDetailsDiv) {
      // Limpar a div de detalhes do container.
      this.chat.activeDetailsDiv.innerHTML = "";

      // Ocultar a div de detalhes do container.
      this.chat.activeDetailsDiv.style.setProperty("display", "none", "important");
    }

    // Verificar se a view de mídia não está aberta.
    if (!this.isMediaViewOpen) {
      if (this.chat.activeConvUserWrapper) {
        // Exibir a div com informações do usuário/grupo.
        this.chat.activeConvUserWrapper.style.display = null;
      }

      if (this.chat.activeConvBottomDiv) {
        // Exibir barra inferior da conversa ativa.
        this.chat.activeConvBottomDiv.style.display = null;
      }

      if (this.chat.activeConvUserWrapper) {
        // Exibir a div com a foto do usuário/grupo.
        if (this.chat.expandOnClick) {
          this.chat.activeConvUserPicture.parentElement.style.visibility = null;
          this.chat.activeConvUserPicture.parentElement.style.pointerEvents = null;
        } else {
          this.chat.activeConvUserPicture.style.visibility = null;
          this.chat.activeConvUserPicture.style.pointerEvents = null;
        }
      }

      if (this.chat.activeConvDiv) {
        // Exibir a div da conversa.
        this.chat.activeConvDiv.style.display = null;
      }
    }

    this.isDetailsOpen = false;
  } else {
    // Salvar scroll atual da div de detalhes do container.
    var oldScrollTop = this.chat.activeDetailsDiv.scrollTop;

    // Limpar a div de detalhes do container.
    this.chat.activeDetailsDiv.innerHTML = "";

    if (this.chat.activeConvUserWrapper) {
      // Ocultar a div com informações do usuário/grupo.
      this.chat.activeConvUserWrapper.style.setProperty("display", "none", "important");
    }

    if (this.chat.activeConvBottomDiv) {
      // Ocultar barra inferior da conversa ativa.
      this.chat.activeConvBottomDiv.style.setProperty("display", "none", "important");
    }

    if (this.chat.activeConvUserPicture) {
      // Ocultar a div com a foto do usuário/grupo.
      if (this.chat.expandOnClick) {
        this.chat.activeConvUserPicture.parentElement.style.setProperty("visibility", "hidden", "important");
        this.chat.activeConvUserPicture.parentElement.style.pointerEvents = "none";
      } else {
        this.chat.activeConvUserPicture.style.setProperty("visibility", "hidden", "important");
        this.chat.activeConvUserPicture.style.pointerEvents = "none";
      }
    }

    // Criar div para suportar a foto e o nome do container.
    var infoWrapperDiv = document.createElement("div");
    infoWrapperDiv.className = "d-flex flex-column align-items-center justify-content-center p-3 p-sm-4 border-bottom"; // Bootstrap
    this.chat.activeDetailsDiv.appendChild(infoWrapperDiv);

    // Criar o elemento da foto do container.
    var containerPhotoElem = document.createElement("div");
    containerPhotoElem.className = "d-flex align-items-center justify-content-center vw-100 vh-100 bg-light text-muted border rounded-circle"; // Bootstrap
    containerPhotoElem.style.backgroundRepeat = "no-repeat";
    containerPhotoElem.style.backgroundSize = "cover";
    containerPhotoElem.style.backgroundPosition = "center center";
    containerPhotoElem.style.maxWidth = "10rem";
    containerPhotoElem.style.maxHeight = "10rem";

    // Verificar se o container possui foto.
    if (this.itemPicture && this.itemPicture.src && this.itemPicture.src.length > 0) {
      if (this.chat.expandOnClick) {
        var containerPhotoElemLink = document.createElement("a");
        containerPhotoElemLink.href = this.itemPicture.src;
        containerPhotoElemLink.appendChild(containerPhotoElem);
        infoWrapperDiv.appendChild(containerPhotoElemLink);
      } else {
        infoWrapperDiv.appendChild(containerPhotoElem);
      }

      // Definir foto como fundo do elemento.
      containerPhotoElem.style.backgroundImage = "url('" + this.itemPicture.src + "')";

      if (this.chat.expandOnClick) {
        try {
          // Inicializar Fancybox no elemento.
          $(containerPhotoElemLink).fancybox({
            closeExisting: true,
            keyboard: true,
            arrows: true,
            protect: true
          });
        } catch (e) { }
      }
    } else {
      infoWrapperDiv.appendChild(containerPhotoElem);

      // Definir nenhum fundo.
      containerPhotoElem.style.backgroundImage = null;

      // Criar ícone do container.
      var containerIconElem = document.createElement("i");
      containerIconElem.className = "fas fa-" + (this.isGroup() ? "users" : "user"); // Font Awesome
      containerIconElem.style.fontSize = "2rem";
      containerPhotoElem.appendChild(containerIconElem);
    }

    // Criar elemento do nome do container.
    var containerNameElem = document.createElement("h5");
    containerNameElem.className = "mt-4 mb-0"; // Bootstrap
    containerNameElem.innerText = this.data ? this.data.name : "";
    infoWrapperDiv.appendChild(containerNameElem);

    // Verificar se é um grupo.
    if (this.isGroup()) {
      var groupIsCurrentUserAdminVal = this.groupIsCurrentUserAdmin();

      // Criar lista de usuários do grupo.
      var usersList = document.createElement("div");
      usersList.className = "list-group list-group-flush w-100 border-0"; // Bootstrap
      this.chat.activeDetailsDiv.appendChild(usersList);

      // Verificar se possui usuários na cache do grupo.
      if (this.data && this.data.users && this.data.users.length > 0) {
        for (var i = 0; i < this.data.users.length; i++) {
          (function(userId) {
            // Procurar pelo usuário na cache do chat.
            var user = object.chat.getUserById(userId);

            if (user && user.data) {
              // Desenhar item do usuário na lista.
              var userItem = object.chat.designContainerItem(usersList, user.data, i, null,
                object.chat.allowCreateGroups && groupIsCurrentUserAdminVal ? false : null);
              var userItemDiv = userItem[0];

              // Ajustar layout do item.
              userItemDiv.style.overflow = "visible";

              // Verificar se o usuário é administrador.
              if (object.groupIsUserAdmin(userId)) {
                // Desenhar a badge de administrador.
                var adminBadge = document.createElement("div");
                adminBadge.className = "badge badge-secondary ml-2"; // Bootstrap
                adminBadge.innerText = getLocaleMessage("LABEL.CHAT_ADMINISTRATOR");
                userItemDiv.appendChild(adminBadge);
              }

              // Verificar se pode criar/editar grupos e se o usuário atual é administrador.
              if (object.chat.allowCreateGroups && groupIsCurrentUserAdminVal) {
                // Criar div do dropdown.
                var dropdownDiv = document.createElement("div");
                dropdownDiv.className = "dropdown"; // Bootstrap
                userItemDiv.appendChild(dropdownDiv);

                // Criar botão de edição.
                var editUserButton = document.createElement("button");
                editUserButton.type = "button";
                editUserButton.id = "chat-" + object.chat.code + "-group-user-" + i;
                editUserButton.className = "btn btn-secondary dropdown-toggle ml-3"; // Bootstrap
                editUserButton.setAttribute("data-toggle", "dropdown");
                editUserButton.setAttribute("aria-haspopup", "true");
                editUserButton.setAttribute("aria-expanded", "false");
                dropdownDiv.appendChild(editUserButton);

                // Criar ícone do botão de edição.
                var editUserButtonIcon = document.createElement("i");
                editUserButtonIcon.className = "fas fa-pencil-alt"; // Font Awesome
                editUserButton.appendChild(editUserButtonIcon);

                // Criar menu dropdown de edição.
                var editDropdownMenu = document.createElement("div");
                editDropdownMenu.className = "dropdown-menu dropdown-menu-right"; // Bootstrap
                editDropdownMenu.setAttribute("aria-labelledby", editUserButton.id);
                dropdownDiv.appendChild(editDropdownMenu);

                // Verificar se o usuário não é o usuário logado.
                if (user.data.id != object.chat.user.data.id) {
                  // Criar item de remover usuário.
                  var removeUserItem = document.createElement("a");
                  removeUserItem.href = "#";
                  removeUserItem.className = "dropdown-item d-flex align-items-center"; // Bootstrap
                  editDropdownMenu.appendChild(removeUserItem);

                  // Criar ícone do item de remover usuário.
                  var removeUserItemIcon = document.createElement("span");
                  removeUserItemIcon.className = "fas fa-user-times mr-3"; // Font Awesome - Bootstrap
                  removeUserItem.appendChild(removeUserItemIcon);

                  // Criar texto do item de remover usuário.
                  var removeUserItemText = document.createElement("span");
                  removeUserItemText.innerText = getLocaleMessage("LABEL.CHAT_REMOVE_USER");
                  removeUserItem.appendChild(removeUserItemText);

                  // Associar evento de clique ao botão de remover usuário.
                  removeUserItem.addEventListener("click", function() {
                    object.groupRemoveUsers([userId]);
                  });
                } else {
                  // Criar item de sair do grupo.
                  var exitGroupItem = document.createElement("a");
                  exitGroupItem.href = "#";
                  exitGroupItem.className = "dropdown-item d-flex align-items-center"; // Bootstrap
                  editDropdownMenu.appendChild(exitGroupItem);

                  // Criar ícone do item de sair do grupo.
                  var exitGroupItemIcon = document.createElement("span");
                  exitGroupItemIcon.className = "fas fa-sign-out-alt mr-3"; // Font Awesome - Bootstrap
                  exitGroupItem.appendChild(exitGroupItemIcon);

                  // Criar texto do item de sair do grupo.
                  var exitGroupItemText = document.createElement("span");
                  exitGroupItemText.innerText = getLocaleMessage("LABEL.CHAT_EXIT_GROUP");
                  exitGroupItem.appendChild(exitGroupItemText);

                  // Associar evento de clique ao botão de sair do grupo.
                  exitGroupItem.addEventListener("click", function() {
                    object.groupExit();
                  });
                }

                // Criar item de tornar/desfazer usuário administrador.
                var toggleAdminUserItem = document.createElement("a");
                toggleAdminUserItem.href = "#";
                toggleAdminUserItem.className = "dropdown-item d-flex align-items-center"; // Bootstrap
                editDropdownMenu.appendChild(toggleAdminUserItem);

                // Criar ícone do item de tornar/desfazer usuário administrador.
                var toggleAdminUserItemIcon = document.createElement("span");
                toggleAdminUserItemIcon.className = "fas fa-user-shield mr-3"; // Font Awesome - Bootstrap
                toggleAdminUserItem.appendChild(toggleAdminUserItemIcon);

                // Criar texto do item de tornar/desfazer usuário administrador.
                var toggleAdminUserItemText = document.createElement("span");
                toggleAdminUserItemText.innerText = object.groupIsUserAdmin(userId) ?
                  getLocaleMessage("LABEL.CHAT_GROUP_UNSET_ADMIN") :
                  getLocaleMessage("LABEL.CHAT_GROUP_SET_ADMIN");
                toggleAdminUserItem.appendChild(toggleAdminUserItemText);

                // Associar evento de clique ao botão de tornar/desfazer usuário administrador.
                toggleAdminUserItem.addEventListener("click", function() {
                  // Verificar se o usuário é administrador do grupo.
                  if (object.groupIsUserAdmin(userId)) {
                    // Desfazer administrador.
                    object.groupUnsetAdmin([userId]);
                  } else {
                    // Tornar administrador.
                    object.groupSetAdmin([userId]);
                  }
                });
              }
            }
          })(this.data.users[i]);
        }
      }

      // Verificar se pode criar/editar grupos.
      if (this.chat.allowCreateGroups) {
        // Verificar se o usuário atual é administrador.
        if (groupIsCurrentUserAdminVal) {
          // Criar botão de adicionar novo usuário.
          var addUserButton = document.createElement("button");
          addUserButton.type = "button";
          addUserButton.className = "list-group-item btn btn-light d-flex align-items-center justify-content-center text-center text-muted border-top-0 border-bottom border-left-0 border-right-0 p-3 mb-4"; // Bootstrap
          addUserButton.innerText = getLocaleMessage("LABEL.CHAT_ADD_USERS");
          usersList.appendChild(addUserButton);

          // Associar evento de clique ao botão de adicionar novo usuário.
          addUserButton.addEventListener("click", function() {
            object.chat.openGroupModal(object.data, 1);
          });

          // Criar botão de editar grupo.
          var editGroupButton = document.createElement("button");
          editGroupButton.type = "button";
          editGroupButton.className = "list-group-item btn btn-light d-flex align-items-center justify-content-center text-center text-muted border-top border-bottom border-left-0 border-right-0 p-3"; // Bootstrap
          editGroupButton.innerText = getLocaleMessage("LABEL.CHAT_EDIT_GROUP");
          usersList.appendChild(editGroupButton);

          // Associar evento de clique ao botão de editar grupo.
          editGroupButton.addEventListener("click", function() {
            object.chat.openGroupModal(object.data, 0);
          });

          // Criar botão de deletar grupo.
          var deleteGroupButton = document.createElement("button");
          deleteGroupButton.type = "button";
          deleteGroupButton.className = "list-group-item btn btn-light d-flex align-items-center justify-content-center text-center text-muted border-top-0 border-bottom border-left-0 border-right-0 p-3 mb-4"; // Bootstrap
          deleteGroupButton.innerText = getLocaleMessage("LABEL.CHAT_DELETE_GROUP");
          usersList.appendChild(deleteGroupButton);

          // Associar evento de clique ao botão de deletar grupo.
          deleteGroupButton.addEventListener("click", function() {
            object.groupDelete();
          });
        }

        // Criar botão de sair do grupo.
        var exitGroupButton = document.createElement("button");
        exitGroupButton.type = "button";
        exitGroupButton.className = "list-group-item btn btn-light d-flex align-items-center justify-content-center text-center text-muted border-top border-bottom border-left-0 border-right-0 p-3 my-4"; // Bootstrap
        exitGroupButton.innerText = getLocaleMessage("LABEL.CHAT_EXIT_GROUP");
        usersList.appendChild(exitGroupButton);

        // Associar evento de clique ao botão de editar grupo.
        exitGroupButton.addEventListener("click", function() {
          object.groupExit();
        });
      }

    // Verificar se é um usuário.
    } else if (this.isUser()) {
      // Criar lista de informações do usuário.
      var userInfoList = document.createElement("div");
      userInfoList.className = "list-group list-group-flush w-100 border-bottom"; // Bootstrap
      this.chat.activeDetailsDiv.appendChild(userInfoList);

      /**
       * Desenha um item de informação do usuário na lista.
       * @param icon (Opcional) Ícone do item.
       * @param title Título do item.
       * @param content Conteúdo do item.
       */
      var designUserInfoItem = function(icon, title, content) {
        // Criar div base do item.
        var userInfoItemDiv = document.createElement("div");
        userInfoItemDiv.className = "list-group-item list-group-item-action d-flex flex-row flex-nowrap align-items-center"; // Bootstrap
        userInfoList.appendChild(userInfoItemDiv);

        // Verificar se possui ícone.
        if (icon && icon.length > 0) {
          // Criar o ícone do item.
          var userInfoIcon = document.createElement("i");
          userInfoIcon.className = icon + " mr-3"; // Bootstrap
          userInfoIcon.style.fontSize = "1.5rem";
          userInfoItemDiv.appendChild(userInfoIcon);
        }

        // Criar div para suportar o título e o conteúdo.
        var userInfoItemWrapperDiv = document.createElement("div");
        userInfoItemWrapperDiv.className = "d-flex flex-column justify-content-center"; // Bootstrap
        userInfoItemDiv.appendChild(userInfoItemWrapperDiv);

        // Criar elemento do título do item.
        var userInfoTitleElem = document.createElement("h6");
        userInfoTitleElem.className = "font-weight-bold mb-0"; // Bootstrap
        userInfoTitleElem.innerText = title;
        userInfoItemWrapperDiv.appendChild(userInfoTitleElem);

        // Criar elemento do conteúdo do item.
        var userInfoContentElem = document.createElement("p");
        userInfoContentElem.className = "text-muted mb-0"; // Bootstrap
        userInfoContentElem.innerText = content;
        userInfoItemWrapperDiv.appendChild(userInfoContentElem);
      };

      if (this.data) {
        // Criar item do nome do usuário.
        if (this.data.name && this.data.name.length > 0) designUserInfoItem("fas fa-user", getLocaleMessage("LABEL.NAME"), this.data.name);

        // Verificar se o chat mostra os estados dos usuários.
        if (this.chat.showUserStates && this.data.state) {
          // Verificar o estado do container.
          switch (this.data.state) {
            // Criar item do visto por último do usuário.
            case 1: designUserInfoItem("fas fa-clock", getLocaleMessage("LABEL.CHAT_LAST_SEEN"), getLocaleMessage("LABEL.CHAT_ONLINE")); break;
            case 2: designUserInfoItem("fas fa-clock", getLocaleMessage("LABEL.CHAT_LAST_SEEN"), this.chat.formatLastSeen(
              this.chat.showLastSeen && this.data.lastSeen ? moment(this.data.lastSeen).local() : null)); break;
            default: designUserInfoItem("fas fa-clock", getLocaleMessage("LABEL.CHAT_LAST_SEEN"), getLocaleMessage("LABEL.CHAT_OFFLINE")); break;
          }
        }
      }
    }

    // Exibir a div de detalhes do container.
    if (this.chat.activeDetailsDiv) this.chat.activeDetailsDiv.style.display = null;

    // Ocultar a div da conversa.
    if (this.chat.activeConvDiv) this.chat.activeConvDiv.style.setProperty("display", "none", "important");

    // Verificar se é uma recriação da div de detalhes do container.
    if (recreate) {
      // Retornar valor antigo do scroll.
      if (this.chat.activeDetailsDiv) this.chat.activeDetailsDiv.scrollTop = oldScrollTop;
    }

    this.isDetailsOpen = true;
  }

  // Atualizar layout do chat.
  this.chat.updateLayout();
};

/**
 * Remove usuários desse grupo (se esse container for um grupo).
 * @param users Array com os códigos dos usuários.
 */
HTMLChatContainer.prototype.groupRemoveUsers = function(users) {
  if (!this.isGroup() || !this.groupIsCurrentUserAdmin() || !users || users.length == 0) return false;
  var object = this;
  this.requestAction("&type=g&typeAction=remove", { users: users }, function() {
    for (var i = 0; i < users.length; i++) {
      if (object.data && object.data.users && object.data.users.length > 0) {
        // Remover usuários da lista de usuários na cache do container.
        var userIndex = object.data.users.indexOf(users[i]);
        if (userIndex >= 0) object.data.users.splice(userIndex, 1);
      }

      if (object.data && object.data.admins && object.data.admins.length > 0) {
        // Remover usuários da lista de administradores na cache do container.
        var adminIndex = object.data.admins.indexOf(users[i]);
        if (adminIndex >= 0) object.data.admins.splice(adminIndex, 1);
      }
    }
  }, true);
};

/**
 * Adiciona usuários à grupo (se esse container for um grupo).
 * @param users Array com os códigos dos usuários.
 */
HTMLChatContainer.prototype.groupAddUsers = function(users) {
  if (!this.isGroup() || !this.groupIsCurrentUserAdmin() || !users || users.length == 0) return false;
  var object = this;
  this.requestAction("&type=g&typeAction=add", { users: users }, function() {
    if (object.data && object.data.users) {
      for (var i = 0; i < users.length; i++) {
        // Adicionar usuários à lista de usuários na cache do container.
        object.data.users.push(users[i]);
      }
    }
  }, true);
};

/**
 * Definir usuários desse grupo como administradores (se esse container for um grupo).
 * @param users Array com os códigos dos usuários.
 */
HTMLChatContainer.prototype.groupSetAdmin = function(users) {
  if (!this.isGroup() || !this.groupIsCurrentUserAdmin() || !users || users.length == 0) return false;
  var object = this;
  this.requestAction("&type=g&typeAction=setAdmin", { users: users }, function() {
    if (object.data) {
      if (!object.data.admins) object.data.admins = [];

      // Adicionar usuários da lista de administradores na cache do container.
      for (var i = 0; i < users.length; i++) {
        var adminIndex = object.data.admins.indexOf(users[i]);
        if (adminIndex < 0) object.data.admins.push(users[i]);
      }
    }
  }, true);
};

/**
 * Remove usuários desse grupo da lista de administradores (se esse container for um grupo).
 * @param users Array com os códigos dos usuários.
 */
HTMLChatContainer.prototype.groupUnsetAdmin = function(users) {
  if (!this.isGroup() || !this.groupIsCurrentUserAdmin() || !users || users.length == 0) return false;
  var object = this;
  this.requestAction("&type=g&typeAction=unsetAdmin", { users: users }, function() {
    if (object.data && object.data.admins && object.data.admins.length > 0) {
      // Remover usuários da lista de administradores na cache do container.
      for (var i = 0; i < users.length; i++) {
        var adminIndex = object.data.admins.indexOf(users[i]);
        if (adminIndex >= 0) object.data.admins.splice(adminIndex, 1);
      }
    }
  }, true);
};

/**
 * Deleta esse grupo.
 */
HTMLChatContainer.prototype.groupDelete = function() {
  if (!this.isGroup() || !this.groupIsCurrentUserAdmin()) return false;

  var object = this;
  var confirmModal = bootstrapCreateModal(getLocaleMessage("INFO.CHAT_DELETE_GROUP_TITLE"), true,
    "<p class=\"mb-0\">" + getLocaleMessage("INFO.CHAT_DELETE_GROUP_NOTICE") + "</p>", null);

  // Ajustar classe do modal.
  confirmModal[0].className = "chat-modal " + confirmModal[0].className;

  // Ajustar layout do modal.
  confirmModal[3].className += " d-flex align-items-center justify-content-end"; // Bootstrap

  // Criar botão de cancelar.
  var cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "btn btn-secondary ml-2"; // Bootstrap
  cancelButton.innerText = getLocaleMessage("LABEL.CANCEL");
  cancelButton.setAttribute("data-dismiss", "modal");
  confirmModal[3].appendChild(cancelButton);

  // Criar botão de confirmar.
  var confirmButton = document.createElement("button");
  confirmButton.type = "button";
  confirmButton.className = "btn btn-danger ml-2"; // Bootstrap
  confirmButton.innerText = getLocaleMessage("LABEL.DELETE");
  confirmModal[3].appendChild(confirmButton);

  // Associar evento de clique ao botão de confirmar.
  confirmButton.addEventListener("click", function() {
    // Fechar modal.
    bootstrapCloseModal(confirmModal[0]);
    confirmModal = null;

    // Enviar requisição para o servidor.
    object.requestAction("&type=g&typeAction=delete", { }, function() {
      // Verificar se a div de detalhes do container está aberta.
      if (object.isDetailsOpen) {
        // Fechar a div de detalhes do container.
        object.toggleDetails();
      }

      // Atualizar dados do chat.
      object.chat.updateData();
    }, false);
  });
};

/**
 * Sair desse grupo.
 */
HTMLChatContainer.prototype.groupExit = function() {
  if (!this.isGroup()) return false;
  var object = this;

  // Enviar requisição para o servidor.
  this.requestAction("&type=g&typeAction=exit", { }, function() {
    // Verificar se a div de detalhes do container está aberta.
    if (object.isDetailsOpen) {
      // Fechar a div de detalhes do container.
      object.toggleDetails();
    }

    // Atualizar dados do chat.
    object.chat.updateData();
  }, false);
};

/**
 * Enviar uma requisição para o servidor relacionado à esse container.
 * @param urlParams Parâmetros para serem passados na URL.
 * @param bodyParams Parâmetros para serem passados no POST.
 * @param successCallback (Opcional) Callback de sucesso.
 * @param failCallback (Opcional) Callback de falha.
 * @param shouldRefresh (Opcional) Valor lógico indicando se o container deve ser atualizado.
 */
HTMLChatContainer.prototype.requestAction = function(urlParams, bodyParams, successCallback, failCallback, shouldRefresh) {
  var object = this;

  // Enviar requisição para o servidor.
  $.post(this.chat.getRequestURL() +
    "&req=" + URLEncode(this.data.id, "GET") +
    "&reqType=" + URLEncode(this.data.type, "GET") + urlParams,
    bodyParams, function(response) {

    if (response && response.success) {
      // Chamar callback de sucesso.
      if (successCallback && typeof successCallback === 'function') {
        successCallback(response);
      }

      if (shouldRefresh !== false) {
        // Verificar se a div de detalhes do container está aberta.
        if (object.isDetailsOpen) {
          // Recriar interface de detalhes do container.
          object.toggleDetails(true);
        }

        // Atualizar label contendo o nome dos usuários.
        object.setState(null, null);
      }
    } else {
      // Chamar callback de falha.
      if (failCallback && typeof failCallback === 'function') {
        failCallback(response);
      }

      // Servidor não retornou sucesso.
      new HTMLMessage().showErrorMessage(getLocaleMessage("ERROR.OPERATION_ERROR"), null, null, response.details);
    }
  }).fail(function(e) {
    // Chamar callback de falha.
    if (failCallback && typeof failCallback === 'function') {
      failCallback(e);
    }

    // Falha na conexão com o servidor.
    new HTMLMessage().showErrorMessage(getLocaleMessage("ERROR.CONNECTION_FAIL"));
  });
};

/**
 * Define o estado deste container.
 * @param state Estado do container.
 * @param lastSeen Visto por último.
 */
HTMLChatContainer.prototype.setState = function(state, lastSeen) {
  // Verificar se é usuário.
  if (this.isUser()) {
    if (this.data && state !== undefined && state !== null) this.data.state = state;
    if (this.data && lastSeen !== undefined && lastSeen !== null) this.data.lastSeen = lastSeen;

    // Verificar se o container está ativo.
    if (this.active) {
      // Verificar se os estados devem ser exibidos e se esse container possui um.
      if (this.chat.showUserStates && this.data && this.data.state) {
        // Verificar o estado do container.
        switch (this.data.state) {
          case 1: this.chat.activeConvUserState.innerText = getLocaleMessage("LABEL.CHAT_ONLINE"); break;
          case 2: this.chat.activeConvUserState.innerText = this.chat.formatLastSeen(
            this.chat.showLastSeen && this.data.lastSeen ? moment(this.data.lastSeen).local() : null); break;
          default: this.chat.activeConvUserState.innerText = getLocaleMessage("LABEL.CHAT_OFFLINE"); break;
        }
      } else {
        this.chat.activeConvUserState.innerHTML = "";
      }
    }

  // Verificar se é grupo.
  } else if (this.isGroup()) {
    // Verificar se o container está ativo.
    if (this.active) {
      // Verificar se esse grupo possui integrantes.
      if (this.data && this.data.users && this.data.users.length > 0) {
        var labelContent = "";

        // Procurar pelos usuários do grupo.
        for (var i = 0; i < this.data.users.length; i++) {
          // Obter o nome do usuário do grupo.
          var user = this.chat.getUserById(this.data.users[i]);

          // Verificar se foi encontrado.
          if (user && user.data && user.data.name) {
            // Concatenar nome.
            labelContent += (user.data.name.indexOf(" ") >= 0 ?
              user.data.name.split(" ")[0] : user.data.name) +
              (i < this.data.users.length - 1 ? ", " : "");
          }
        }

        // Verificar se termina com a vírgula.
        if (labelContent.endsWith(", ")) {
          // Remover a vírgula do final.
          labelContent = labelContent.substring(0, labelContent.length - 2);
        }

        // Definir conteúdo da label.
        this.chat.activeConvUserState.innerText = labelContent.trim();
      } else {
        this.chat.activeConvUserState.innerHTML = "";
      }
    }
  }
};

/**
 * Obtém o estado do usuário (inteiro).
 *
 * - 0: Estado desconhecido.
 * - 1: Usuário conectado.
 * - 2: Usuário desconectado.
 * - 3: Falha na conexão.
 */
HTMLChatContainer.prototype.getState = function() {
  return (this.data && this.data.state !== undefined && this.data.state !== null ? this.data.state : 0);
};

/**
 * Obtém um valor lógico indicando se o usuário está online.
 */
HTMLChatContainer.prototype.isOnline = function() {
  return this.getState() == 1;
};

/**
 * Criar o spinner de carregamento.
 **/
HTMLChatContainer.prototype.createPreloader = function() {
  try {
    if (!this.preloader) {
      // Criar a div base da seção do preloader.
      this.preloader = document.createElement("div");
      this.preloader.className = "chat-container-preloader d-flex align-items-center justify-content-center py-3"; // Bootstrap

      // Criar o spinner na div base.
      var spinner = bootstrapCreateSpinner(this.preloader, "text-secondary", false); // Bootstrap
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
 * Criar o botão de carregar mais mensagens.
 **/
HTMLChatContainer.prototype.createLoadHistoryButton = function() {
  this.hasLoadHistoryButton = true;

  try {
    if (!this.loadHistoryButton) {
      // Criar a div base da seção do preloader.
      this.loadHistoryButton = document.createElement("div");
      this.loadHistoryButton.className = "chat-container-history-button d-flex align-items-center justify-content-center py-3"; // Bootstrap

      // Criar o botão de carregar o histórico.
      var loadHistoryButtonElem = document.createElement("button");
      loadHistoryButtonElem.type = "button";
      loadHistoryButtonElem.className = "btn btn-outline-secondary btn-sm";
      loadHistoryButtonElem.innerText = getLocaleMessage("LABEL.CHAT_LOAD_MORE") + "...";
      this.loadHistoryButton.appendChild(loadHistoryButtonElem);

      // Associar evento de clique ao botão de carregar histórico.
      var object = this;
      loadHistoryButtonElem.addEventListener("click", function() {
        object.getHistoryMessages();
      });

      // Adicionar a div base na conversa.
      if (this.chat.activeConvDiv.childElementCount > 0) {
        this.chat.activeConvDiv.insertBefore(this.loadHistoryButton, this.chat.activeConvDiv.firstChild);
      } else {
        this.chat.activeConvDiv.appendChild(this.loadHistoryButton);
      }
    }
  } catch (e) { }
};

/**
 * Remove o botão de carregar histórico.
 **/
HTMLChatContainer.prototype.removeLoadHistoryButton = function() {
  this.hasLoadHistoryButton = false;

  try {
    if (this.loadHistoryButton) {
        this.chat.activeConvDiv.removeChild(this.loadHistoryButton);
        this.loadHistoryButton = null;
    }
  } catch (e) { }
};

/**
 * Define a última mensagem enviada relacionada a este usuário.
 * @param msg Conteúdo da última mensagem enviada.
 **/
HTMLChatContainer.prototype.setLastMessageContent = function(msg) {
  var messageContent = null;

  // Definir nos dados do container.
  if (this.data) this.data.lastMessage = msg;

  // Verificar se o elemento existe.
  if (this.itemLast) {
    // Verificar se mensagem não é nula.
    if (msg !== null && msg !== undefined) {
      // Limpar conteúdo da prévia da mensagem anterior.
      this.itemLast.innerHTML = "";

      // Verificar se é o objeto da mensagem.
      if (typeof msg === "object") {
        // Verificar se a mensagem tem arquivo anexado.
        if (msg.attachment) {
          // Criar o ícone do arquivo.
          var fileIcon = document.createElement("i");
          fileIcon.className = "d-inline-block mr-2 " + this.getFileIcon(msg.attachment.mimeType); // Bootstrap
          this.itemLast.appendChild(fileIcon);

          // Criar o elemento da mensagem.
          var messageContentElem = document.createElement("span");
          messageContentElem.className = "d-inline-block"; // Bootstrap
          this.itemLast.appendChild(messageContentElem);

          // Verificar se o arquivo possui legenda.
          if (msg.message && msg.message.length > 0) {
            // Remover caracteres de nova linha e substituir por espaços.
            messageContent = msg.message.replace(/\r?\n|\r/g, " ");
          } else {
            // Obter a inicial do tipo do arquivo.
            var attachmentType = msg.attachment.mimeType.toLowerCase().split('/')[0];
            if (attachmentType == "image") messageContent = getLocaleMessage("LABEL.IMAGE");
            else if (attachmentType == "video") messageContent = getLocaleMessage("LABEL.VIDEO");
            else if (attachmentType == "audio") messageContent = getLocaleMessage("LABEL.AUDIO");
            else messageContent = getLocaleMessage("LABEL.FILE");
          }

          // Verificar se é grupo e a mensagem não é do próprio usuário.
          if (this.isGroup() && this.chat.user && this.chat.user.data && msg.from != this.chat.user.data.id) {
            // Procurar pelo usuário remetente.
            var user = this.chat.getUserById(msg.from);
            if (user && user.data && user.data.name) {
              // Colocar o primeiro nome do usuário na prévia da mensagem.
              var firstName = user.data.name.indexOf(" ") >= 0 ?
                user.data.name.split(" ")[0] : user.data.name;
              messageContent = firstName + ": " + messageContent;
            }
          }

          // Definir o texto no elemento.
          messageContentElem.innerText = (messageContent.length > 25) ?
            messageContent.substring(0, 25) + "..." : messageContent;
          messageContent = null;
        } else {
          messageContent = msg.message;
        }
      } else if (typeof msg === "string") {
        messageContent = msg;
      }

      if (messageContent) {
        // Verificar se é grupo e a mensagem não é do próprio usuário.
        if (this.isGroup() && this.chat.user && this.chat.user.data && msg.from != this.chat.user.data.id) {
          // Procurar pelo usuário remetente.
          var user = this.chat.getUserById(msg.from);
          if (user && user.data && user.data.name) {
            // Colocar o primeiro nome do usuário na prévia da mensagem.
            var firstName = user.data.name.indexOf(" ") >= 0 ?
              user.data.name.split(" ")[0] : user.data.name;
            messageContent = firstName + ": " + messageContent;
          }
        }

        // Remover caracteres de nova linha e substituir por espaços.
        messageContent = messageContent.replace(/\r?\n|\r/g, " ");

        // Definir o texto no elemento.
        this.itemLast.innerText = (messageContent.length > 25) ?
          messageContent.substring(0, 25) + "..." : messageContent;
      }
    }
  }
};

/**
 * Envia as confirmações de leitura pendentes.
 */
HTMLChatContainer.prototype.sendPendingReadConfirmations = function() {
  // Verificar se possui confirmações de leitura pendentes.
  if (this.pendingReadConfirmations && this.pendingReadConfirmations.length > 0) {
    for (var i = 0; i < this.pendingReadConfirmations.length; i++) {
      // Enviar a confirmação de leitura.
      this.chat.socket.send(JSON.stringify(this.pendingReadConfirmations[i]));

      // Diminuir contador de mensagens não lidas.
      if (this.unreadMessages > 0) this.setTotalUnreadMessages(this.unreadMessages - 1);
    }

    // Limpar a lista de confirmações de leitura pendentes.
    this.pendingReadConfirmations = [];
  }
};

/**
 * Trata uma mensagem destinada a este usuário.
 * @param msg Um objeto contendo os dados da mensagem enviada/recebida.
 **/
HTMLChatContainer.prototype.handleMessage = function(msg, top) {
  var object = this;

  // Não tratar a mensagem se ela já foi tratada.
  if (this.getMessageById(msg.id)) return false;

  /**
   * Enviar a mensagem para o servidor informando que recebeu a mensagem.
   */
  var messageSendReceived = function() {
    if ((!msg.status || msg.status < 2)) {
      object.chat.socket.send(JSON.stringify({
        type: "received",
        id: msg.id,
        from: msg.from,
        destination: msg.destination
      }));
    }
  };

  // Variável de retorno.
  var messageElem = null;

  // Obter a data da mensagem e se ela é interna.
  var date = moment(msg.time).local();
  var internalMessage = (msg.from === this.chat.user.data.id);

  // Verificar se chat salva histório e se o histório não foi requisitado.
  if (msg.wasHold && !internalMessage && this.chat.saveHistory && !this.historyRequested) {
    // Enviar mensagem pro servidor informando que a mensagem foi recebida.
    messageSendReceived();

    // Não lidar com a mensagem.
    return;
  }

  // Mover item do usuário pro topo da lista.
  if (!this.isSendToEveryone && !msg.everyone && !top) this.moveToTop();

  // Verificar se a data da mensagem é mais antiga que a mensagem mais antiga atual.
  if (!this.olderMessage || date.isBefore(moment(this.olderMessage.time).local())) {
    this.olderMessage = msg;
  }

  // Verificar se a data da mensagem é mais nova que a mensagem mais nova atual.
  if (!this.newerMessage || date.isAfter(moment(this.newerMessage.time).local())) {
    this.newerMessage = msg;
    this.setLastMessageContent(msg);
  }

  // Obter a sessão destinada a mensagem.
  var section = this.createSection(date, top);

  // Verificar se a conversa está ativa.
  if (this.active) {
    // Verificar se a barra de rolagem está na parte inferior.
    var onBottom = (this.chat.activeConvDiv.scrollTop >=
      this.chat.activeConvDiv.scrollHeight -
      this.chat.activeConvDiv.clientHeight);

    // Se estiver ativo, desenhar a mensagem.
    messageElem = this.designMessage(msg, section, top);

    // Rolar para baixo se a barra de rolagem já estava na parte inferior.
    if (onBottom) this.scrollToBottom();

    // Verificar se esta não é uma mensagem interna.
    if (!internalMessage && !msg.sentConfirmation && (!msg.status || msg.status < 3)) {
      // Enviar mensagem pro servidor informando que a mensagem foi recebida.
      messageSendReceived();

      // Montar o objeto da confirmação de leitura da mensagem.
      var readConfirmationMsg = {
        type: "read",
        id: msg.id + "-r",
        messageId: msg.id,
        from: this.chat.user.data.id,
        destination: msg.from
      };

      // Verificar se deve enviar a confirmação de leitura.
      if (this.chat.shouldSendReadConfirmations()) {
        // Enviar a mensagem para o servidor informando que leu a mensagem.
        this.chat.socket.send(JSON.stringify(readConfirmationMsg));

        // Diminuir contador de mensagens não lidas.
        if (this.unreadMessages > 0) this.setTotalUnreadMessages(this.unreadMessages - 1);
      } else {
        // Adicionar na lista de confirmações de leitura pendentes.
        if (!this.pendingReadConfirmations) this.pendingReadConfirmations = [];
        this.pendingReadConfirmations.push(readConfirmationMsg);
      }

      // Salvar que a confirmação de leitura da mensagem já foi enviada.
      msg.sentConfirmation = true;
    }
  } else if (!internalMessage) {
    // Enviar mensagem pro servidor informando que a mensagem foi recebida.
    messageSendReceived();

    // A conversa não está ativa, incrementar contador.
    this.setTotalUnreadMessages(this.unreadMessages + 1);
  }

  // Adicionar a lista de mensagens da sessão.
  if (top) section.messages.unshift(msg);
  else section.messages.push(msg);

  // Verificar se deve exibir a notificação na área de trabalho.
  if (!this.isSendToEveryone && !internalMessage && !top && this.chat.shouldShowDesktopNotifications()) {
    // Obter a URL do arquivo.
    var attachmentUrl = msg.attachment && msg.attachment.url ? msg.attachment.url :
      msg.attachment && msg.attachment.serverName ? this.chat.getRequestURL() +
      "&type=a&req=" + URLEncode(msg.attachment.serverName, "GET") : null;

    // Exibir notificação na área de trabalho.
    this.chat.showDesktopNotification(this.data.name, this.itemPicture.src,
      (attachmentUrl ? attachmentUrl : null),
      msg.message, date.unix());
  }

  return messageElem;
};

/**
 * Rola a barra de rolagem para o final.
 **/
HTMLChatContainer.prototype.scrollToBottom = function() {
  this.chat.activeConvDiv.scrollTop = this.chat.activeConvDiv.scrollHeight - this.chat.activeConvDiv.clientHeight;
  this.scroll = this.chat.activeConvDiv.scrollTop;
};

/**
 * Move o item deste usuário para o topo da lista de usuários.
 **/
HTMLChatContainer.prototype.moveToTop = function() {
  if (!this.isSendToEveryone && this.item) this.chat.usersList.insertBefore(this.item, this.chat.usersList.firstChild);
};

/**
 * Responsável por desenhar os elementos das sessões.
 **/
HTMLChatContainer.prototype.designSection = function(date, top) {
  // Obter o dia atual pelo moment.
  var today = moment();

  // Criar a div base da seção.
  var sectionDiv = document.createElement("div");
  sectionDiv.className = "chat-message-section d-flex align-items-center justify-content-center my-3"; // Bootstrap

  // Criar a div da data da seção.
  var sectionDateDiv = document.createElement("div");
  sectionDateDiv.className = "bg-secondary text-white my-1 px-3 py-1 rounded"; // Bootstrap
  sectionDateDiv.innerText =
    date.isSame(today, "day") ? getLocaleMessage("LABEL.TODAY") : // Hoje
    date.isSame(today.subtract(1, "days"), "day") ? getLocaleMessage("LABEL.YESTERDAY") : // Ontem
    date.format(this.chat.dateFormat);
  sectionDiv.appendChild(sectionDateDiv);

  if (top && this.chat.activeConvDiv.childElementCount > 0)
    this.chat.activeConvDiv.insertBefore(sectionDiv, this.chat.activeConvDiv.firstChild);
  else this.chat.activeConvDiv.appendChild(sectionDiv);
  return sectionDiv;
};

/**
 * Responsável por desenhar os elementos das mensagens.
 * @param msg Um objeto contendo os dados da mensagem enviada/recebida.
 * @param section Sessão da mensagem.
 **/
HTMLChatContainer.prototype.designMessage = function(msg, section, top) {
  var object = this;

  // Verificar se é uma mensagem do próprio usuário.
  var internalMessage = (msg.from === this.chat.user.data.id);

  // Declarar alguns elementos da mensagem.
  var messageStatusDiv = null;
  var messageFromElem = null;

  // Criar div base da mensagem.
  var messageRowDiv = document.createElement("div");
  messageRowDiv.className = "w-100 d-flex flex-column " + // Bootstrap
    (internalMessage ? "align-items-end" : "align-items-start"); // Bootstrap

  // Criar div do balão da mensagem.
  var messageDiv = document.createElement("div");
  messageDiv.className = internalMessage ?
    "chat-message chat-message-same-origin position-relative d-flex flex-column w-auto h-auto overflow-hidden my-1 bg-white text-dark border rounded shadow-sm mw-sm-50" : // Bootstrap
    "chat-message chat-message-external-origin position-relative d-flex flex-column w-auto h-auto overflow-hidden my-1 bg-dark text-white rounded shadow-sm mw-sm-50"; // Bootstrap
  messageDiv.style.maxWidth = "75%";
  messageRowDiv.appendChild(messageDiv);

  // Verificar se é um grupo e não é uma mensagem do usuário.
  if (!internalMessage && this.isGroup()) {
    // Obter o usuário que enviou a mensagem.
    var senderUser = this.chat.getUserById(msg.from);

    // Criar elemento para exibir o nome do usuário que mandou a mensagem.
    messageFromElem = document.createElement("a");
    messageFromElem.href = "#";
    messageFromElem.className = "chat-message-from font-weight-bold text-truncate mw-100 overflow-hidden pt-2 px-3" + // Bootstrap
      (internalMessage ? " text-dark" : " text-white"); // Bootstrap

    // Definir o nome do usuário no elemento.
    if (senderUser && senderUser.data && senderUser.data.name) {
      messageFromElem.innerText = this.chat.formatName(senderUser.data.name);

      // Verificar se o usuário não faz mais parte do grupo.
      if (!this.groupContainsUser(msg.from)) {
        messageFromElem.style.textDecoration = "line-through";
        messageFromElem.style.opacity = "0.7";
      /*} else {
        messageFromElem.style.textDecoration = "none";*/
      }
    } else {
      messageFromElem.innerText = "(" + getLocaleMessage("LABEL.UNKNOWN") + ")";
      messageFromElem.style.textDecoration = "italic";
    }

    // Adicionar elemento do nome ao elemento da mensagem.
    messageDiv.appendChild(messageFromElem);

    // Associar evento de clique ao elemento do nome do usuário.
    messageFromElem.addEventListener("click", function(e) {
      e.preventDefault();
      if (senderUser) senderUser.setActive(true);
    });
  }

  // Verificar se a mensagem tem um arquivo em anexo.
  if (msg.attachment && msg.attachment.mimeType) {
    // Obter a URL do arquivo.
    var attachmentUrl = msg.attachment.url ? msg.attachment.url :
      msg.attachment.serverName ? this.chat.getRequestURL() + "&type=a&req=" +
      URLEncode(msg.attachment.serverName, "GET") : "";

    // Obter o tipo do arquivo.
    var attachmentType = msg.attachment.mimeType.toLowerCase().split('/')[0];

    // Flag que indica se o arquivo é uma mídia visual.
    var isVisualMedia = false;
    var visualMediaElem = null;

    // Criar a div que irá suportar o conteúdo da mídia.
    var attachmentDiv = null;
    if (attachmentType == "image" || attachmentType == "video") {
      attachmentDiv = document.createElement("a");
      attachmentDiv.href = attachmentUrl;
      attachmentDiv.className = "chat-message-attachment position-relative overflow-hidden text-decoration-none"; // Bootstrap
      attachmentDiv.isAttachmentLink = true;
      messageDiv.appendChild(attachmentDiv);
    } else {
      attachmentDiv = document.createElement("div");
      attachmentDiv.className = "chat-message-attachment position-relative overflow-hidden"; // Bootstrap
      messageDiv.appendChild(attachmentDiv);
    }

    /**
     * Inicializa o Fancybox no elemento da mídia.
     */
    var initFancybox = function() {
      if (isVisualMedia) {
        try {
          $(attachmentDiv).fancybox({
            closeExisting: true,
            keyboard: true,
            arrows: true,
            protect: true
          });
        } catch (e) { }
      }
    };

    // Verificar se o evento "Ao Carregar Mídia" foi associado.
    if (this.chat.AoCarregarMidia !== undefined && this.chat.AoCarregarMidia !== null) {
      /**
       * Remove a extensão de um nome de um arquivo.
       * @param filename Nome do arquivo para remover a extensão.
       */
      var removeExtension = function(filename) {
        try {
          var lastDotPosition = filename.lastIndexOf(".");
          if (lastDotPosition === -1) return filename;
          return filename.substr(0, lastDotPosition);
        } catch (e) { }
        return filename;
      };

      // Chamar evento "Ao Carregar Mídia".
      var result = this.chat.AoCarregarMidia.call($mainform(),
        removeExtension(msg.attachment.serverName),
        msg.attachment.mimeType,
        msg.attachment.name);

      // Verificar se possui retorno.
      if (result !== undefined && result !== null) {
        attachmentUrl = result;
      }
    }

    // Verificar se é imagem.
    if (attachmentType == "image") {
      // Criar o elemento para visualizar a mídia.
      var mediaImg = document.createElement("img");
      if (this.BLUR_RADIUS <= 0) mediaImg.className = "w-100"; // Bootstrap
      else mediaImg.className = "img-fluid w-100"; // Bootstrap
      mediaImg.src = attachmentUrl;
      attachmentDiv.appendChild(mediaImg);

      // Indicar que é mídia visual.
      isVisualMedia = true;
      visualMediaElem = mediaImg;

      // Ajustar layout do elemento do nome.
      if (messageFromElem) messageFromElem.className += " pb-2"; // Bootstrap

    // Verificar se é vídeo.
    } else if (attachmentType == "video") {
      // Criar o elemento para visualizar a mídia.
      var mediaVideo = document.createElement("video");
      if (this.BLUR_RADIUS <= 0) mediaVideo.className = "w-100"; // Bootstrap
      else mediaVideo.className = "img-fluid w-100"; // Bootstrap
      mediaVideo.style.pointerEvents = "none";
      mediaVideo.controls = false;
      mediaVideo.autoplay = false;
      mediaVideo.muted = true;
      mediaVideo.src = attachmentUrl;
      attachmentDiv.appendChild(mediaVideo);

      // Indicar que é mídia visual.
      isVisualMedia = true;
      visualMediaElem = mediaVideo;

      // Ajustar layout do elemento do nome.
      if (messageFromElem) messageFromElem.className += " pb-2"; // Bootstrap

      // Criar div de overlay do spinner.
      var videoOverlayDiv = document.createElement("div");
      videoOverlayDiv.className = "position-absolute w-100 h-100 d-flex align-items-center justify-content-center"; // Bootstrap
      videoOverlayDiv.style.top = "0px";
      videoOverlayDiv.style.bottom = "0px";
      videoOverlayDiv.style.left = "0px";
      videoOverlayDiv.style.right = "0px";
      videoOverlayDiv.style.pointerEvents = "none";
      videoOverlayDiv.style.zIndex = "10000000";
      attachmentDiv.appendChild(videoOverlayDiv);

      // Criar botão de play.
      var playButton = document.createElement("button");
      playButton.type = "button";
      playButton.style.pointerEvents = "all";
      playButton.className = "btn btn-light btn-lg rounded-circle shadow px-3 py-2"; // Bootstrap
      playButton.style.width = "3.5rem";
      playButton.style.height = "3.5rem";
      videoOverlayDiv.appendChild(playButton);

      var playButtonIcon = document.createElement("i");
      playButtonIcon.className = "fas fa-play my-2"; // Font Awesome
      playButton.appendChild(playButtonIcon);

    // Verificar se é áudio.
    } else if (attachmentType == "audio") {
      var isPlaying = false;

      // Criar a div base para visualizar a mídia.
      var mediaDiv = document.createElement("div");
      mediaDiv.className = "d-flex flex-row flex-nowrap align-items-center w-100 pt-2 pl-3 pr-3"; // Bootstrap
      attachmentDiv.appendChild(mediaDiv);

      // Criar elemento do audio para reprodução.
      var mediaAudio = document.createElement("audio");
      mediaAudio.className = "d-none"; // Bootstrap
      mediaAudio.controls = false;
      mediaAudio.autoplay = false;
      mediaAudio.src = attachmentUrl;
      mediaDiv.appendChild(mediaAudio);

      // Criar botão de play.
      var playButton = document.createElement("button");
      playButton.type = "button";
      playButton.className = "btn btn-link btn-lg rounded-circle px-2 py-1 mr-3" + // Bootstrap
        (internalMessage ? " text-dark" : " text-white"); // Bootstrap
      playButton.style.overflow = "visible";
      mediaDiv.appendChild(playButton);

      var playButtonIcon = document.createElement("i");
      playButtonIcon.className = "fas fa-play"; // Font Awesome
      playButton.appendChild(playButtonIcon);

      // Criar slider de tempo.
      var timeSlider = document.createElement("input");
      timeSlider.type = "range";
      timeSlider.className = "custom-range flex-fill"; // Bootstrap
      timeSlider.min = "0";
      timeSlider.value = "0";
      timeSlider.step = "500";
      mediaDiv.appendChild(timeSlider);

      // Criar label de tempo.
      var timeLabel = document.createElement("span");
      timeLabel.className = "ml-3"; // Bootstrap
      mediaDiv.appendChild(timeLabel);

      // Criar spinner do Bootstrap na label de tempo.
      var timeSpinner = bootstrapCreateSpinner(timeLabel, "text-dark", false); // Bootstrap
      timeSpinner[0].style.width = "1.25rem";
      timeSpinner[0].style.height = "1.25rem";
      timeSpinner[0].style.fontSize = "0.9rem";

      // Indicar que não é mídia visual.
      isVisualMedia = false;
      visualMediaElem = mediaDiv;

      var updateDuration = function() {
        // Calcular a duração em milisegundos.
        var audioDurationMs = isNaN(mediaAudio.duration) || !isFinite(mediaAudio.duration) ? 0 : mediaAudio.duration * 1000;
        var audioPositionMs = mediaAudio.currentTime * 1000;

        // Definir duração do áudio.
        if (isPlaying) timeLabel.innerText = moment.utc(audioPositionMs).format("mm:ss");
        else timeLabel.innerText = moment.utc(audioDurationMs).format("mm:ss");

        timeSlider.max = audioDurationMs.toString();
        timeSlider.value = audioPositionMs.toString();
      };

      // Associar eventos ao elemento audio.
      mediaAudio.addEventListener("loadedmetadata", updateDuration);
      mediaAudio.addEventListener("durationchange", updateDuration);
      mediaAudio.addEventListener("timeupdate", updateDuration);

      mediaAudio.addEventListener("playing", function() {
        // Definir flag.
        isPlaying = true;

        // Ajustar ícone do botão.
        playButtonIcon.className = "fas fa-pause"; // Font Awesome
      });

      mediaAudio.addEventListener("paused", function() {
        // Definir flag.
        isPlaying = false;

        // Ajustar ícone do botão.
        playButtonIcon.className = "fas fa-play"; // Font Awesome
      });

      mediaAudio.addEventListener("ended", function() {
        // Definir flag.
        isPlaying = false;

        // Ajustar ícone do botão.
        playButtonIcon.className = "fas fa-play"; // Font Awesome

        // Voltar para o começo.
        mediaAudio.currentTime = 0;

        // Atualizar interface.
        updateDuration();
      });

      // Associar evento de clique no botão de play.
      playButton.addEventListener("click", function() {
        if (isPlaying) {
          // Pausar reprodução.
          mediaAudio.pause();

          // Definir flag.
          isPlaying = false;

          // Ajustar ícone do botão.
          playButtonIcon.className = "fas fa-play"; // Font Awesome
        } else {
          // Iniciar reprodução.
          mediaAudio.play();
        }
      });

      var changeTime = function() {
        var isPaused = false;

        // Pausar reprodução se estiver tocando.
        if (isPlaying) {
          mediaAudio.pause();
          isPaused = true;
        }

        // Alterar tempo atual.
        mediaAudio.currentTime = parseInt(timeSlider.value) / 1000;

        // Retomar reprodução se foi pausado.
        if (isPaused) mediaAudio.play();
      };

      // Associar evento de mudança no slider.
      if (isIE || isIE11) timeSlider.addEventListener("change", changeTime);
      else timeSlider.addEventListener("input", changeTime);

    // Tipo desconhecido.
    } else {
      // Criar a div base para visualizar a mídia.
      var mediaDiv = document.createElement("div");
      mediaDiv.className = "w-100 pt-2 pl-2 pr-2"; // Bootstrap
      attachmentDiv.appendChild(mediaDiv);

      // Criar a div de destaque do arquivo.
      var mediaWrapperDiv = document.createElement("a");
      mediaWrapperDiv.className = "d-flex flex-row flex-nowrap align-items-center px-3 py-2 rounded text-decoration-none" + // Bootstrap
        (internalMessage ? " text-muted" : " text-white"); // Bootstrap
      mediaWrapperDiv.href = attachmentUrl;
      mediaWrapperDiv.setAttribute("download", msg.attachment.name);
      mediaDiv.appendChild(mediaWrapperDiv);

      // Ajustar estilo da div de destaque.
      if (internalMessage) {
        mediaWrapperDiv.className += " bg-light border"; // Bootstrap
      } else {
        mediaWrapperDiv.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
      }

      // Criar o elemento de ícone do arquivo.
      var mediaFileIcon = document.createElement("i");
      mediaFileIcon.className = "mr-2 " + this.getFileIcon(msg.attachment.mimeType); // Bootstrap
      mediaFileIcon.style.fontSize = "1.5rem";
      mediaWrapperDiv.appendChild(mediaFileIcon);

      // Criar o elemento de nome do arquivo.
      var mediaFileName = document.createElement("span");
      mediaFileName.className = "text-truncate font-weight-bold"; // Bootstrap
      mediaFileIcon.style.fontSize = "1.15rem";
      mediaFileName.innerText = msg.attachment.name;
      mediaWrapperDiv.appendChild(mediaFileName);

      // Indicar que não é mídia visual.
      isVisualMedia = false;
      visualMediaElem = mediaWrapperDiv;
    }

    // Verificar se está em progresso de envio.
    if (msg.attachment.inProgress) {
      var spinner = null;
      var spinnerInner = null;
      var spinnerElem = null;
      var percentLabel = null;
      var failStatusElem = null;

      // Restringir clique no elemento.
      attachmentDiv.style.pointerEvents = "none";

      if (isVisualMedia && visualMediaElem) {
        // Verificar se deve ter desfoque.
        if (this.BLUR_RADIUS > 0) {
          // Aplicar efeito de desfoque e ajustar layout da imagem.
          visualMediaElem.style.filter = "blur(" + this.BLUR_RADIUS + "px)";
          visualMediaElem.style.marginLeft = "-" + this.BLUR_RADIUS + "px";
          visualMediaElem.style.marginTop = "-" + this.BLUR_RADIUS + "px";
          visualMediaElem.style.marginBottom = "-" + this.BLUR_RADIUS + "px";
          visualMediaElem.style.width = "calc(100% + " + (this.BLUR_RADIUS * 2) + "px)";
        }

        // Criar div de overlay do spinner.
        spinner = document.createElement("div");
        spinner.className = "position-absolute w-100 h-100 d-flex align-items-center justify-content-center"; // Bootstrap
        spinner.style.top = "0px";
        spinner.style.bottom = "0px";
        spinner.style.left = "0px";
        spinner.style.right = "0px";
        spinner.style.zIndex = "10000000";
        attachmentDiv.appendChild(spinner);

        // Criar div do conteúdo do spinner.
        spinnerInner = document.createElement("div");
        spinnerInner.className = "bg-light rounded-circle shadow p-2"; // Bootstrap
        spinner.appendChild(spinnerInner);

        // Criar spinner de carregamento.
        spinnerElem = bootstrapCreateSpinner(spinnerInner, "text-dark", false)[0]; // Bootstrap
        spinnerElem.className += " d-flex align-items-center justify-content-center"; // Bootstrap
        spinnerElem.style.width = "3rem";
        spinnerElem.style.height = "3rem";

        // Criar label de porcentagem.
        percentLabel = document.createElement("small");
        percentLabel.className = "position-absolute d-flex flex-fill align-items-center justify-content-center text-center text-dark"; // Bootstrap
        percentLabel.style.top = "0px";
        percentLabel.style.left = "0px";
        percentLabel.style.right = "0px";
        percentLabel.style.bottom = "0px";
        spinner.appendChild(percentLabel);
      }

      // Definir rotina de alteração do progresso.
      messageRowDiv.setProgress = function(percent) {
        // Definir progresso na mensagem.
        msg.attachment.progress = percent;

        if (percentLabel) {
          if (percent < 0) {
            // Progresso inconclusivo.
            percentLabel.innerHTML = "";
          } else {
            // Definir conteúdo da label de progresso.
            percentLabel.innerText = percent + "%";
          }
        }
      };

      // Definir rotina de alteração de status.
      messageRowDiv.setStatus = function(status) {
        // Definir status na mensagem.
        msg.attachment.status = status;

        if (messageStatusDiv) {
          // Definir o ícone de status da mensagem.
          if (status == 0 || status == 1) { // Enviando ou enviado
            messageStatusDiv.className = "align-self-end ml-1 far fa-clock"; // Bootstrap - Font Awesome
          } else if (status == -1) { // Falha no envio
            messageStatusDiv.className = "align-self-end ml-1 text-danger fas fa-exclamation-triangle"; // Bootstrap - Font Awesome
          }
        }

        // Ajustar layout.
        if (status == 0 || status == 1) { // Enviando ou enviado
          if (spinner) spinner.style.display = null;
          if (spinnerElem) spinnerElem.style.display = null;
          if (percentLabel) percentLabel.style.display = null;

          if (failStatusElem) {
            // Remover a div de falha de envio.
            if (isVisualMedia) attachmentDiv.removeChild(failStatusElem);
            else visualMediaElem.removeChild(failStatusElem);
            failStatusElem = null;
          }

          if (status === 1) { // Enviado
            // Permitir clique no elemento.
            attachmentDiv.style.pointerEvents = null;

            // Verificar se tem desfoque.
            if (object.BLUR_RADIUS > 0 && isVisualMedia && visualMediaElem) {
              // Remover efeito de desfoque e ajustar layout da imagem.
              visualMediaElem.style.filter = null;
              visualMediaElem.style.marginLeft = null;
              visualMediaElem.style.marginTop = null;
              visualMediaElem.style.marginBottom = null;
              visualMediaElem.style.width = null;
            }

            if (spinner) {
              // Remover spinner de carregamento.
              attachmentDiv.removeChild(spinner);
              spinner = null;
            }

            // Inicializar Fancybox.
            initFancybox();

            // Remover da lista de mensagens esperando.
            if (object.waitingMessages[msg.id]) {
              object.waitingMessages = object.waitingMessages.filter(function(item) {
                return item.id != msg.id;
              });
            }

            // Limpar variáveis.
            spinner = null;
            percentLabel = null;

            messageRowDiv.setProgress = null;
            messageRowDiv.setStatus = null;
          } else {
            // Restringir clique no elemento.
            attachmentDiv.style.pointerEvents = "none";
          }
        } else if (status == -1) { // Falha no envio
          // Restringir clique no elemento.
          attachmentDiv.style.pointerEvents = "none";

          if (spinner) spinner.style.setProperty("display", "none", "important");
          if (spinnerElem) spinnerElem.style.setProperty("display", "none", "important");
          if (percentLabel) percentLabel.style.setProperty("display", "none", "important");

          if (!failStatusElem) {
            // Criar a div de falha de envio.
            if (isVisualMedia) {
              failStatusElem = document.createElement("span");
              failStatusElem.className = "position-absolute d-flex flex-fill align-items-center justify-content-center text-center text-secondary"; // Bootstrap
              failStatusElem.style.top = "0px";
              failStatusElem.style.left = "0px";
              failStatusElem.style.right = "0px";
              failStatusElem.style.bottom = "0px";
              failStatusElem.style.zIndex = "100";
              attachmentDiv.appendChild(failStatusElem);
            } else {
              failStatusElem = document.createElement("div");
              visualMediaElem.appendChild(failStatusElem);
            }

            // Criar botão de tentar novamente.
            var retryButton = document.createElement("button");
            retryButton.type = "button";
            retryButton.style.pointerEvents = "all";

            var retryButtonIcon = document.createElement("i");
            retryButtonIcon.className = "fas fa-redo-alt my-2"; // Font Awesome
            retryButton.appendChild(retryButtonIcon);

            if (isVisualMedia) {
              retryButton.className = "btn btn-light btn-lg rounded-circle shadow px-3 py-2"; // Bootstrap
              retryButton.style.width = "3.5rem";
              retryButton.style.height = "3.5rem";
            } else {
              retryButton.className = "btn btn-light rounded-circle shadow-sm border p-0 ml-3"; // Bootstrap
              retryButtonIcon.style.fontSize = "0.85rem";
              retryButton.style.width = "1.75rem";
              retryButton.style.height = "1.75rem";
            }

            failStatusElem.appendChild(retryButton);

            // Associar evento de clique ao botão de tentar novamente.
            retryButton.addEventListener("click", function(e) {
              e.preventDefault();
              e.stopPropagation();

              // Definir status de enviando.
              messageRowDiv.setProgress(0);
              messageRowDiv.setStatus(0);

              setTimeout(function() {
                // Re-enviar mensagem.
                if (msg && msg.attachment && msg.attachment.retry) {
                  msg.attachment.retry();
                }
              }, 1000);
            });
          }
        }
      };

      // Verificar se o objeto da mensagem já possui progresso e status definido.
      // Isso ocorre quando o elemento da mensagem é recriado mas o objeto da mensagem
      // permanece sempre em memória, assim podemos retomar a exibição do progresso.
      if (msg.attachment.progress !== undefined && msg.attachment.progress !== null) messageRowDiv.setProgress(msg.attachment.progress);
      if (msg.attachment.status !== undefined && msg.attachment.status !== null) messageRowDiv.setStatus(msg.attachment.status);
    } else {
      // Inicializar Fancybox.
      initFancybox();
    }
  }

  // Criar div para suportar o conteúdo da mensagem.
  var messageWrapperDiv = document.createElement("div");
  messageWrapperDiv.className = "d-flex flex-row px-3 py-2"; // Bootstrap
  messageDiv.appendChild(messageWrapperDiv);

  // Criar span do conteúdo da mensagem.
  var messageContentDiv = document.createElement("span");
  messageContentDiv.className = "chat-message-content w-100 h-auto"; // Bootstrap
  messageContentDiv.style.wordBreak = "break-word";
  messageContentDiv.innerText = msg.message;
  messageWrapperDiv.appendChild(messageContentDiv);

  try {
    // Tratar URL nas mensagens.
    messageContentDiv.innerHTML = messageContentDiv.innerHTML.replace(/((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi, function(url) {
      // Substituir a URL por um elemento <a> com link absoluto (//).
      return '<a href="' + (url.indexOf("//") < 0 ? "//" + url : url) + '" target="_blank">' + url + '</a>';
    });
  } catch (e) { }

  // Criar span do tempo da mensagem.
  var messageTimeDiv = document.createElement("span");
  messageTimeDiv.className = "chat-message-time align-self-end ml-3"; // Bootstrap
  messageTimeDiv.style.fontSize = "0.75rem";
  messageTimeDiv.style.opacity = "0.5";
  messageTimeDiv.innerText = moment(msg.time).local().format("LT"); // LT - Horário (ex 09:00)
  messageWrapperDiv.appendChild(messageTimeDiv);

  // Criar span do tempo da mensagem.
  if (internalMessage) {
    messageStatusDiv = document.createElement("i");
    messageStatusDiv.className = "align-self-end ml-1" + // Bootstrap
      (msg.everyone ? " fas fa-globe" : msg.status ? // Font Awesome
        ((msg.status == 1) ? " fas fa-check" : // Font Awesome
        (msg.status == 2) ? " fas fa-check-double pb-1" : // Font Awesome
        (msg.status == 3) ? " fas fa-check-double pb-1 text-primary": "") : // Font Awesome - Bootstrap
      " far fa-clock"); // Font Awesome
    messageStatusDiv.style.fontSize = "0.75rem";
    messageStatusDiv.style.opacity = (msg.status && msg.status == 3) ? "1.0" : "0.5";
    messageWrapperDiv.appendChild(messageStatusDiv);
    msg.itemStatus = messageStatusDiv;
  }

  // Adicionar o elemento da mensagem no chat.
  if (top && section.div) $(messageRowDiv).insertAfter(section.div);
  else this.chat.activeConvDiv.appendChild(messageRowDiv);

  // Verificar se a mensagem está na lista de mensagens sendo enviadas.
  if (this.waitingMessages[msg.id]) {
    // Atualizar elemento da mensagem.
    this.waitingMessages[msg.id].element = messageRowDiv;
  }

  // Retornar elemento.
  return messageRowDiv;
};

/**
 * Cria uma sessão neste container.
 * @param date A data da sessão.
 * @param top Valor lógico indicando se a sessão será criada no topo da conversa (true) ou no fim (false).
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
 * @param date A data da sessão.
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
 * @param id identificador da mensagem.
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
 * @param id O identificador da mensagem.
 * @param status Status da mensagem (1: Recebida pelo servidor; 2: Recebida pelo destinatário; 3: Destinatário leu).
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
      if (topMessage == null || moment(topSection.messages[j].time).local().isBefore(moment(topMessage.time).local())) {
        topMessage = topSection.messages[j];
      }
    }
  }

  return topMessage;
};

/**
 * Obtém o histórico de mensagens do chat.
 * @param force Forçar o carregamento de mensagens.
 * @param handler (Opcional) Função que irá lidar com as mensagens.
 **/
HTMLChatContainer.prototype.getHistoryMessages = function(force, handler) {
  var hasHandler = (handler && typeof handler === "function");

  if (!hasHandler) {
    // Verificar se a seção é a de enviar mensagem para todos ou se está em requisição.
    if (this.isSendToEveryone || this.inRequest) {
      if (!this.inRequest) {
        // Remover preloader.
        this.removePreloader();
      }

      return;
    }

    // Verifica se o histórico foi requisitado.
    this.historyRequested = true;
  }

  // Obter o total de mensagens na memória.
  var totalMessages = this.getTotalMessages();

  // Verificar se o chat deve carregar mais mensagens.
  // Condições: A barra de rolagem no topo ou quantidade total de mensagens
  //            menor que a quantidade de mensagens que devem ser carregadas.
  if (force || !this.historyHasReachedEnd && (this.chat.activeConvDiv.scrollTop == 0 || totalMessages < this.chat.loadedMessagesAmount)) {
    // Montar a URL do pedido.
    var baseURL = this.chat.getRequestURL() + "&type=m&req=" + URLEncode(this.data.id, 'GET') + "&reqType=" + URLEncode(this.data.type, 'GET');
    if (totalMessages > 0 && this.olderMessage) baseURL += "&message=" + URLEncode(this.olderMessage.id, 'GET') + "&direction=0";

    if (!hasHandler) {
      // Definir variável.
      this.inRequest = true;

      // Criar preloader.
      this.createPreloader();

      // Remover botão de carregar histórico.
      this.removeLoadHistoryButton();
    }

    // Obter o histórico de mensagens do servidor.
    var object = this;
    $.get(baseURL, function(response) {
      // Verificar se a resposta tem mensagens.
      if (response && response.messages && Array.isArray(response.messages) && response.messages.length > 0) {
        if (hasHandler) {
          // Chamar a função pra lidar com as mensagens.
          handler(response.messages);
        } else {
          var oldScrollHeight = object.chat.activeConvDiv.scrollHeight;
          var isScrollOnBottom = (object.chat.activeConvDiv.scrollHeight -
            object.chat.activeConvDiv.scrollTop) <= 10;

          // Dar loop nas mensagens antigas.
          for (var i = 0; i < response.messages.length; i++) {
            // Lidar com a mensagem e adicionar ao container no topo.
            object.handleMessage(response.messages[i], true);
          }

          // Verificar se o container ainda está ativo.
          if (object.active) {
            // Se não tinha nenhuma mensagem antes, rolar a barra para baixo.
            if (totalMessages == 0 || isScrollOnBottom) object.scrollToBottom();

            // Se tinha mensagem, calcular a diferença.
            else {
              object.setActive(true);
              object.chat.activeConvDiv.scrollTop = object.chat.activeConvDiv.scrollHeight - oldScrollHeight;
            }

            // Verificar se não possui scroll.
            if (object.chat.activeConvDiv.clientHeight >= object.chat.activeConvDiv.scrollHeight) {
              // Verificar se possui mais mensagens no histórico.
              object.getHistoryMessages(true, function(messages) {
                if (messages && messages.length > 0) {
                  // Criar botão de carregar histórico.
                  object.createLoadHistoryButton();
                }
              });
            }
          }
        }
      } else if (!hasHandler) {
        // Histórico chegou ao final.
        this.historyHasReachedEnd = true;
      }

      if (!hasHandler) {
        // Resetar variável.
        object.inRequest = false;

        // Remover preloader.
        object.removePreloader();
      }
    }).fail(function() {
      if (!hasHandler) {
        // Resetar variável.
        object.inRequest = false;

        // Remover preloader.
        object.removePreloader();
      }
    });
  } else if (!hasHandler) {
    // Remover preloader.
    this.removePreloader();
  }
};

/**
 * Define o total de mensagens não lidas com o usuário.
 * @param total Total de mensagens não lidas.
 **/
HTMLChatContainer.prototype.setTotalUnreadMessages = function(total) {
  this.unreadMessages = (total <= 0) ? 0 : total;
  this.hasUnreadMessages = (total > 0);

  if (this.itemLastBadge) {
    this.itemLastBadge.innerText = (total > 0) ? total.toString() : "";
    this.itemLastBadge.className = (total > 0) ? this.itemLastBadgeClass : "d-none"; // Bootstrap
    if (total > 0) this.itemLastBadge.style.display = null;
  }
};

/**
 * Obtém um valor lógico indicando se esse container é um usuário.
 */
HTMLChatContainer.prototype.isUser = function() {
  return this.data && this.data.type == 0;
};

/**
 * Obtém um valor lógico indicando se esse container é um grupo.
 */
HTMLChatContainer.prototype.isGroup = function() {
  return this.data && this.data.type == 1;
};

/**
 * Obtém um valor lógico indicando se um usuário faz parte do grupo.
 * @param userId Identificador do usuário para verificar.
 */
HTMLChatContainer.prototype.groupContainsUser = function(userId) {
  return this.data && this.data.users && this.data.users.length > 0 && this.data.users.indexOf(userId) >= 0;
};

/**
 * Obtém um valor lógico indicando se um usuário é administrador do grupo.
 * @param userId Identificador do usuário para verificar.
 */
HTMLChatContainer.prototype.groupIsUserAdmin = function(userId) {
  return this.data && this.data.admins && this.data.admins.length > 0 && this.data.admins.indexOf(userId) >= 0;
};

/**
 * Obtém um valor lógico indicando se o usuário atual é administrador do grupo.
 */
HTMLChatContainer.prototype.groupIsCurrentUserAdmin = function() {
  return this.chat && this.chat.user && this.chat.user.data && this.groupIsUserAdmin(this.chat.user.data.id);
};

/**
 * Adiciona arquivos à lista de arquivos selecionados.
 * @param files Array de arquivos.
 */
HTMLChatContainer.prototype.enqueueFiles = function(files) {
  // Se não permitir enviar arquivos, não fazer nada.
  if (!this.chat || !this.chat.allowSendMedia) return false;

  // Verificar se possui arquivos.
  if (files && files.length > 0) {
    // Se o array não existir, devemos instanciá-lo.
    if (!this.selectedMedias) this.selectedMedias = [];

    // Adiciona uma mídia à lista de mídias selecionadas.
    for (var i = 0; i < files.length; i++) {
      this.enqueueMedia({
        file: files[i],
        description: ""
      }, false); // Importante: não atualizar interface, devemos atualizar depois por causa de performance.
    }

    // Atualizar interface.
    this.designMediaView();
  }
};

/**
 * Adiciona uma mídia à lista de mídias selecionadas.
 * @param media Mídia a ser adicionada.
 * @param design Valor lógico indicando se a interface deve ser atualizada.
 */
HTMLChatContainer.prototype.enqueueMedia = function(media, design) {
  // Se não permitir enviar arquivos, não fazer nada.
  if (!this.chat || !this.chat.allowSendMedia) return false;

  // Verificar se a mídia foi definida.
  if (media) {
    // Se o array não existir, devemos instanciá-lo.
    if (!this.selectedMedias) this.selectedMedias = [];

    // Adicionar mídia ao array.
    this.selectedMedias.push(media);

    // Verificar se a interface deve ser atualizada e atualizá-la.
    if (design !== false) this.designMediaView();
  }
};

/**
 * Remove um arquivo da lista de arquivos selecionados.
 * @param file Arquivo para ser removido.
 */
HTMLChatContainer.prototype.dequeueFile = function(file) {
  if (this.selectedMedias && this.selectedMedias.length > 0)
    this.selectedMedias.splice(this.selectedMedias.indexOf(file), 1);
  if (this.selectedPreviewMedia && this.selectedPreviewMedia == file) {
    this.selectedPreviewMedia = null;
    this.selectedPreviewMediaElem = null;
  }

  this.designMediaView();
};

/**
 * Envia os arquivos selecionados para envio.
 */
HTMLChatContainer.prototype.sendEnqueuedFiles = function() {
  if (this.selectedMedias && this.selectedMedias.length > 0) {
    for (var i = 0; i < this.selectedMedias.length; i++) {
      this.sendFile(this.selectedMedias[i]);
    }
  }

  // Limpa os arquivos selecionados para envio.
  this.clearEnqueuedFiles();
};

/**
 * Envia um arquivo.
 * @param media Arquivo a ser enviado.
 */
HTMLChatContainer.prototype.sendFile = function(media) {
  var object = this;
  var message = media.id ? this.waitingMessages[media.id] ?
    this.waitingMessages[media.id] : null : null;

  if (!message) {
    // Verificar se não possui um id associado.
    if (!media.id) media.id = this.chat.getUniqueId();

    // Criar dados da mensagem.
    message = { };

    // Montar o corpo da mensagem.
    message.body = {
      // Tipo da requesição
      type: "message",

      // Dados da mensagem
      id: media.id,
      message: media.description,
      from: this.chat.user.data.id,
      time: moment.utc().toISOString(),

      // Arquivo anexado
      attachment: {
        url: media.url,

        name: media.file ? media.file.name : media.name,
        size: media.file ? media.file.size : null,
        mimeType: media.file ? media.file.type : media.mimeType,

        inProgress: media.file ? true : false,
        retry: media.file ? function() {
          // Definir status de enviando.
          if (message.element) {
            message.element.setProgress(0);
            message.element.setStatus(0);
          }

          // Enviar arquivo novamente.
          object.sendFile(media);
        } : null
      }
    };

    // Verificar se já possui arquivo no servidor.
    if (media.serverName) {
      message.body.attachment.serverName = media.serverName;
    }

    // Verificar se é um grupo.
    if (this.isGroup()) message.body.group = this.data.id;
    else message.body.destination = this.data.id;

    // Criar a mensagem que irá conter a mídia.
    message.element = this.handleMessage(message.body, false);
  }

  // Verificar se possui arquivo associado e não foi enviado.
  if (media.file && (!message.body.attachment.serverName || message.body.attachment.serverName.length === 0)) {
    // Criar o FormData para enviar o arquivo.
    message.formData = new FormData();
    message.formData.append("upload", media.file);

    // Enviar o arquivo selecionado manualmente.
    message.xhr = new XMLHttpRequest();
    message.xhr.open("POST", this.chat.getFileUploadURL(), true);

    // Associar eventos ao XMLHttpRequest.
    message.xhr.addEventListener("load", function(e) {
      try {
        // Verificar se foi enviado.
        if (message.xhr && (message.xhr.readyState === 4 || message.xhr.status === 200) && message.xhr.responseText && message.xhr.responseText.length > 0) {
          // Verificar se deu erro na action.
          if (message.xhr.responseText.indexOf("Exception:") >= 0) {
            // Exibir mensagem de erro.
            new HTMLMessage().showErrorMessage(getLocaleMessage("ERROR.OPERATION_ERROR"), null, null, message.xhr.responseText);

            // Chamar callback de erro.
            failCallback();
          } else {
            // Dar parse no JSON da resposta do servidor.
            var responseJson = JSON.parse(message.xhr.responseText.trim());

            // Verificar se o nome do arquivo foi definido na resposta.
            if (responseJson && responseJson.name && responseJson.name.length > 0) {
              // Verificar se o evento "Ao Enviar Mídia" foi associado.
              if (object.chat && object.chat.AoEnviarMidia !== undefined && object.chat.AoEnviarMidia !== null) {
                /**
                 * Remove a extensão de um nome de um arquivo.
                 * @param filename Nome do arquivo para remover a extensão.
                 */
                var removeExtension = function(filename) {
                  try {
                    var lastDotPosition = filename.lastIndexOf(".");
                    if (lastDotPosition === -1) return filename;
                    return filename.substr(0, lastDotPosition);
                  } catch (e) { }
                  return filename;
                };

                // Chamar evento "Ao Enviar Mídia".
                object.chat.AoEnviarMidia.call($mainform(),
                  responseJson.path,
                  removeExtension(responseJson.name),
                  media.file.type,
                  media.file.name);
              }

              // Definir nome do arquivo no servidor.
              message.body.attachment.serverName = responseJson.name;

              // Arquivo enviado com sucesso.
              if (message.element) message.element.setStatus(1);

              // Ajustar corpo da mensagem.
              message.body.attachment.url = null;
              message.body.attachment.retry = null;
              message.body.attachment.inProgress = false;

              // Verificar se é vídeo ou imagem e se a mensagem possui elemento.
              if (media && (media.type == "video" || media.type == "image") && message.element) {
                // Montar nova URL.
                var url = "chat/upload/" + responseJson.name;

                if (media.type == "video") {
                  // Obter o elemento de video.
                  var videoElement = message.element.getElementsByTagName("video");
                  if (videoElement && videoElement.length > 0) {
                    // Ajustar URL do elemento.
                    videoElement[0].src = url;
                  }
                } else if (media.type == "image") {
                  // Obter o elemento de imagem.
                  var imageElement = message.element.getElementsByTagName("img");
                  if (imageElement && imageElement.length > 0) {
                    // Ajustar URL do elemento.
                    imageElement[0].src = url;
                  }
                }

                // Obter os links da mídia.
                var linkElements = message.element.getElementsByTagName("a");
                if (linkElements && linkElements.length > 0) {
                  for (var i = 0; i < linkElements.length; i++) {
                    // Verificar se é o link do anexo.
                    if (linkElements[i].isAttachmentLink) {
                      // Ajustar URL do elemento.
                      linkElements[i].href = url;

                      try {
                        // Reinicializar o fancybox.
                        $(linkElements[i]).unbind("click.fb");
                        $(linkElements[i]).unbind("click.fb-start");
                        $(linkElements[i]).fancybox({
                          closeExisting: true,
                          keyboard: true,
                          arrows: true,
                          protect: true
                        });
                      } catch (e) { }
                    }
                  }
                }
              }

              // Enviar a mensagem.
              object.chat.socket.send(JSON.stringify(message.body));
              return;
            }
          }
        }
      } catch (e) { }

      // Falha ao enviar o arquivo.
      if (message.element) message.element.setStatus(-1);
    });

    if (message.xhr.upload) {
      // Evento para atualizar a barra de progresso.
      message.xhr.upload.addEventListener("progress", function(e) {
        if (e.lengthComputable) {
          // Definir progresso.
          if (message.element) message.element.setProgress(Math.floor((e.loaded / e.total) * 100));
        } else {
          // Definir progresso inconclusivo.
          if (message.element) message.element.setProgress(-1);
        }
      }, false);
    } else {
      // Definir progresso inconclusivo.
      if (message.element) message.element.setProgress(-1);
    }

    message.xhr.addEventListener("error", function() {
      // Falha ao enviar o arquivo.
      if (message.element) message.element.setStatus(-1);
    });

    // Definir status de enviando.
    message.element.setProgress(0);
    message.element.setStatus(0);

    // Enviar arquivo para o servidor.
    message.xhr.send(message.formData);

    // Adicionar mensagem a lista.
    this.waitingMessages[media.id] = message;
  } else {
    // Enviar a mensagem.
    this.chat.socket.send(JSON.stringify(message.body));
  }
};

/**
 * Limpa os arquivos selecionados para envio.
 */
HTMLChatContainer.prototype.clearEnqueuedFiles = function() {
  // Limpar variáveis.
  this.selectedMedias = null;
  this.selectedPreviewMedia = null;
  this.selectedPreviewMediaElem = null;

  // Destruir view.
  this.destroyMediaView();
};

/**
 * Desenha a view de mídia pra envio.
 */
HTMLChatContainer.prototype.designMediaView = function() {
  var object = this;

  // Verificar se possui arquivos na fila.
  if (this.selectedMedias && this.selectedMedias.length > 0) {
    // Verificar se a tela de detalhes está aberta.
    if (this.isDetailsOpen) {
      // Fechar tela de detalhes.
      this.toggleDetails();
    }

    // Verificar se a div não existe.
    if (!this.mediaViewDiv) {
      // Criar a div principal da view.
      this.mediaViewDiv = document.createElement("div");
      this.mediaViewDiv.className = "chat-layout-view-media position-relative w-100 bg-white d-flex flex-fill flex-column overflow-hidden"; // Bootstrap
      this.chat.rightColumn.appendChild(this.mediaViewDiv);

      // Criar o cabeçalho da view.
      var mediaViewHeaderDiv = document.createElement("div");
      mediaViewHeaderDiv.className = "chat-view-header d-flex flex-row flex-nowrap w-100 bg-light border-bottom"; // Bootstrap
      this.mediaViewDiv.appendChild(mediaViewHeaderDiv);

      // Criar título do cabeçalho da view.
      var mediaViewTitle = document.createElement("h6");
      mediaViewTitle.className = "chat-view-title mb-0 flex-fill p-3"; // Bootstrap
      mediaViewTitle.innerText = getLocaleMessage("LABEL.SEND_FILES");
      mediaViewHeaderDiv.appendChild(mediaViewTitle);

      // Criar o botão de fechar a view.
      var closeMediaViewButton = document.createElement("button");
      closeMediaViewButton.type = "button";
      closeMediaViewButton.className = "chat-view-close btn btn-light rounded-0 d-flex align-items-center justify-content-center px-3 border-left"; // Bootstrap
      closeMediaViewButton.title = getLocaleMessage("LABEL.CANCEL");
      closeMediaViewButton.setAttribute("data-toggle", "tooltip");
      mediaViewHeaderDiv.appendChild(closeMediaViewButton);

      // Criar o ícone do botão de fechar a view.
      var closeMediaViewButtonIcon = document.createElement("i");
      closeMediaViewButtonIcon.className = "fas fa-times"; // Font Awesome
      closeMediaViewButton.appendChild(closeMediaViewButtonIcon);

      // Inicializar tooltip no botão.
      bootstrapInitTooltip(closeMediaViewButton);

      // Associar evento de clique ao botão de fechar a view.
      closeMediaViewButton.addEventListener("click", function() {
        // Fechar tooltip.
        bootstrapCloseTooltip(closeMediaViewButton);

        // Limpa os arquivos na fila.
        object.clearEnqueuedFiles();
      });

      // Criar a div de visualização do arquivo.
      this.mediaViewTopDiv = document.createElement("div");
      this.mediaViewTopDiv.className = "position-relative d-flex flex-fill bg-white overflow-hidden"; // Bootstrap
      this.mediaViewDiv.appendChild(this.mediaViewTopDiv);

      // Criar a div para suportar a caixa de texto.
      this.mediaViewTextDiv = document.createElement("div");
      this.mediaViewTextDiv.className = "position-relative d-flex bg-light border-top"; // Bootstrap
      this.mediaViewDiv.appendChild(this.mediaViewTextDiv);

      // Criar a caixa de texto.
      this.mediaViewTextInput = document.createElement("textarea");
      this.mediaViewTextInput.className = "chat-view-input form-control-plaintext px-3 py-2"; // Bootstrap
      this.mediaViewTextInput.placeholder = getLocaleMessage("INFO.CHAT_TYPE_MEDIA_DESCRIPTION") + "...";
      this.mediaViewTextInput.style.outline = "0";
      this.mediaViewTextDiv.appendChild(this.mediaViewTextInput);

      // Associar evento de mudança na caixa de texto.
      this.mediaViewTextInput.addEventListener("input", function() {
        if (object.selectedPreviewMedia) {
          object.selectedPreviewMedia.description = object.mediaViewTextInput.value;
        }
      });

      this.mediaViewTextInput.addEventListener("change", function() {
        if (object.selectedPreviewMedia) {
          object.selectedPreviewMedia.description = object.mediaViewTextInput.value;
        }
      });

      // Criar a div inferior da visualização.
      this.mediaViewBottomDiv = document.createElement("div");
      this.mediaViewBottomDiv.className = "position-relative d-flex flex-row flex-nowrap align-items-center px-3 py-2 bg-light border-top"; // Bootstrap
      this.mediaViewDiv.appendChild(this.mediaViewBottomDiv);

      // Criar a div da lista de arquivos.
      this.mediaViewListDiv = document.createElement("div");
      this.mediaViewListDiv.className = "d-flex flex-row flex-fill flex-nowrap overflow-auto mr-2 border-right"; // Bootstrap
      this.mediaViewBottomDiv.appendChild(this.mediaViewListDiv);

      // Criar botão de enviar arquivos.
      this.mediaViewSendButton = document.createElement("button");
      this.mediaViewSendButton.type = "button";
      this.mediaViewSendButton.className = "chat-view-send btn btn-light btn-lg rounded-circle shadow m-3 d-flex align-items-center justify-content-center"; // Bootstrap
      this.mediaViewSendButton.style.width = "3.5rem";
      this.mediaViewSendButton.style.height = "3.5rem";
      this.mediaViewSendButton.title = getLocaleMessage("LABEL.SEND");
      this.mediaViewSendButton.setAttribute("data-toggle", "tooltip");
      this.mediaViewBottomDiv.appendChild(this.mediaViewSendButton);

      var mediaViewSendButtonIcon = document.createElement("i");
      mediaViewSendButtonIcon.className = "fas fa-paper-plane my-1 my-sm-2"; // Font Awesome
      this.mediaViewSendButton.appendChild(mediaViewSendButtonIcon);

      // Associar evento de clique ao botão de enviar.
      this.mediaViewSendButton.addEventListener("click", function() {
        // Fechar tooltip.
        bootstrapCloseTooltip(object.mediaViewSendButton);

        // Envia os arquivos na fila.
        object.sendEnqueuedFiles();
      });
    } else {
      // Limpar as divs.
      if (!this.selectedPreviewMedia)
        this.mediaViewTopDiv.innerHTML = "";
      this.mediaViewListDiv.innerHTML = "";
    }

    // Definir quee a view de mídias está aberta.
    var lastIsMediaViewOpen = this.isMediaViewOpen;
    this.isMediaViewOpen = true;

    /**
     * Seleciona uma mídia marcada pra envio para ser visualizada.
     * @param media Mídia marcada para envio.
     * @param mediaElement Elemento da mídia na lista.
     */
    var selectMediaItem = function(media, mediaElement) {
      // Não fazer nada se já é a mídia selecionada.
      if (object.selectedPreviewMedia == media) return;

      // Limpar a div de visualização da mídia.
      object.mediaViewTopDiv.innerHTML = "";

      // Remover seleção da mídia anterior.
      if (object.selectedPreviewMedia && object.selectedPreviewMediaElem) {
        // Remover classe de seleção do elemento.
        if (object.selectedPreviewMediaElem.classList.contains("border")) {
          object.selectedPreviewMediaElem.classList.remove("border");
        }
      }

      // Definir mídia selecionada.
      object.selectedPreviewMedia = media;
      object.selectedPreviewMediaElem = mediaElement;

      // Adicionar classe de seleção no elemento.
      if (!mediaElement.classList.contains("border")) {
        mediaElement.classList.add("border");
      }

      // Definir o texto da legenda.
      object.mediaViewTextInput.value = media.description;

      // Criar div para ajustar o layout da visualização.
      var wrapperDiv = document.createElement("div");
      wrapperDiv.className = "d-flex flex-fill align-items-center justify-content-center"; // Bootstrap
      object.mediaViewTopDiv.appendChild(wrapperDiv);

      // Verificar se é imagem.
      if (media.type == "image") {
        // Criar elemento de imagem.
        wrapperDiv.style.backgroundImage = "url('" + media.url + "')";
        wrapperDiv.style.backgroundRepeat = "no-repeat";
        wrapperDiv.style.backgroundSize = "auto 100%";
        wrapperDiv.style.backgroundPosition = "center center";

      // Verificar se é vídeo.
      } else if (media.type == "video") {
        // Criar um elemento video para suportar o arquivo.
        var video = document.createElement("video");
        video.className = "flex-fill mw-100 mh-100"; // Bootstrap
        video.autoplay = true;
        video.muted = false;
        video.controls = true;
        video.src = media.url;
        video.type = media.file.type;
        video.style.outline = "0";
        wrapperDiv.appendChild(video);

      // Tipo desconhecido.
      } else {
        // Criar um elemento para tentar criar uma visualização.
        var objectElem = document.createElement("object");
        objectElem.className = "w-100 h-100"; // Bootstrap
        objectElem.type = media.file.type;
        objectElem.data = media.url;
        wrapperDiv.appendChild(objectElem);
      }
    };

    /**
     * Desenha o item de uma mídia na lista de itens a serem enviados.
     * @param media Mídia a ser enviada.
     */
    var designMediaItem = function(media) {
      // Criar o elemento do item.
      var mediaItemLink = document.createElement("a");
      mediaItemLink.href = "#";
      mediaItemLink.className = "chat-view-media-item position-relative d-flex align-items-center text-decoration-none p-2 rounded"; // Bootstrap
      object.mediaViewListDiv.appendChild(mediaItemLink);

      // Verificar se é o item selecionado.
      if (object.selectedPreviewMedia == media) {
        // Adicionar classe de seleção.
        mediaItemLink.classList.add("border");

        // Atualizar elemento da mídia selecionada.
        object.selectedPreviewMediaElem = mediaItemLink;
      }

      // Criar a div para suportar os botões.
      var buttonWrapperDiv = document.createElement("div");
      buttonWrapperDiv.className = "position-absolute d-flex justify-content-end p-2"; // Bootstrap
      buttonWrapperDiv.style.top = "0px";
      buttonWrapperDiv.style.left = "0px";
      buttonWrapperDiv.style.right = "0px";
      buttonWrapperDiv.style.zIndex = "10";
      buttonWrapperDiv.style.pointerEvents = "none";
      mediaItemLink.appendChild(buttonWrapperDiv);

      // Criar o botão de remover item.
      var removeItemButton = document.createElement("button");
      removeItemButton.type = "button";
      removeItemButton.className = "chat-view-media-remove btn btn-light p-1 m-1 d-flex align-items-center justify-content-center"; // Bootstrap
      removeItemButton.title = getLocaleMessage("LABEL.REMOVE");
      removeItemButton.setAttribute("data-toggle", "tooltip");
      buttonWrapperDiv.appendChild(removeItemButton);

      var removeItemButtonIcon = document.createElement("i");
      removeItemButtonIcon.className = "fas fa-times"; // Font Awesome
      removeItemButtonIcon.style.pointerEvents = "all";
      removeItemButtonIcon.style.fontSize = "0.8rem";
      removeItemButtonIcon.style.lineHeight = "0.7rem";
      removeItemButton.appendChild(removeItemButtonIcon);

      // Inicializar tooltip no botão.
      bootstrapInitTooltip(removeItemButton);

      // Associar evento de clique ao botão de remover item.
      removeItemButton.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Fechar tooltip.
        bootstrapCloseTooltip(removeItemButton);

        // Remover mídia.
        object.dequeueFile(media);
      });

      // Verificar se possui arquivo associado.
      if (media.file) {
        // Definir o nome da mídia.
        if (!media.name) media.name = media.file.name;

        // Obter o tipo do arquivo.
        if (!media.mimeType) media.mimeType = media.file.type;
        if (!media.type) media.type = media.file.type.toLowerCase().split('/')[0];

        // Criar uma URL para poder visualizar o arquivo.
        if (!media.url) media.url = window.URL.createObjectURL(media.file);
      }

      // Verificar se é imagem.
      if (media.type == "image") {
        // Criar elemento de imagem.
        var img = document.createElement("img");
        img.className = "rounded overflow-hidden"; // Bootstrap
        img.src = media.url;
        img.alt = media.name;
        img.style.maxHeight = "4rem";
        img.style.maxWidth = "4rem";
        img.style.minWidth = "4rem";
        mediaItemLink.appendChild(img);

      // Verificar se é vídeo.
      } else if (media.type == "video") {
        // Criar um elemento video para suportar o arquivo.
        var video = document.createElement("video");
        video.autoplay = true;
        video.muted = true;
        video.controls = false;
        video.src = media.url;
        video.type = media.mimeType;

        // Adicionar evento de carregamento ao elemento de video.
        video.addEventListener("loadeddata", function() {
          // Criar um elemento canvas para desenhar a thumbnail do video.
          var canvas = document.createElement("canvas");
          var canvasContext = canvas.getContext("2d");
          canvasContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

          // Criar elemento de imagem para exibir a thumbnail do video.
          var img = document.createElement("img");
          img.className = "rounded overflow-hidden"; // Bootstrap
          img.src = canvas.toDataURL("image/png");
          img.alt = media.name;
          img.style.maxHeight = "4rem";
          img.style.maxWidth = "4rem";
          img.style.minWidth = "4rem";
          mediaItemLink.appendChild(img);
        });

      // Tipo desconhecido.
      } else {
        // Criar uma div wrapper para suportar o ícone e o nome do arquivo.
        var mediaWrapperDiv = document.createElement("div");
        mediaWrapperDiv.className = "d-flex flex-column align-items-center justify-content-center p-2 bg-light text-muted border rounded"; // Bootstrap
        mediaWrapperDiv.style.width = "4rem";
        mediaWrapperDiv.style.height = "4rem";
        mediaItemLink.appendChild(mediaWrapperDiv);

        // Criar o ícone do arquivo.
        var mediaFileIcon = document.createElement("i");
        mediaFileIcon.style.fontSize = "1.5rem";
        mediaFileIcon.className = "mb-1 " + object.getFileIcon(media.mimeType); // Bootstrap
        mediaWrapperDiv.appendChild(mediaFileIcon);

        // Criar o texto do nome do arquivo.
        var mediaFileText = document.createElement("span");
        mediaFileText.className = "text-truncate text-center mw-100"; // Bootstrap
        mediaFileText.innerText = media.name;
        mediaWrapperDiv.appendChild(mediaFileText);
      }

      // Associar evento de clique ao item.
      mediaItemLink.addEventListener("click", function(e) {
        e.preventDefault();
        selectMediaItem(media, mediaItemLink);
      });

      return mediaItemLink;
    };

    // Atualizar a lista de arquivos.
    for (var i = 0; i < this.selectedMedias.length; i++) {
      // Desenhar a mídia na lista.
      var element = designMediaItem(this.selectedMedias[i]);

      // Se for a mídia selecionada no preview ou o primeiro item, fazer seleção.
      if ((!this.selectedPreviewMedia && (!lastIsMediaViewOpen && i == 0 || lastIsMediaViewOpen && i >= this.selectedMedias.length - 1)) ||
          (this.selectedPreviewMedia == this.selectedMedias[i])) {

        this.selectedPreviewMedia = null;
        selectMediaItem(this.selectedMedias[i], element);
      }
    }

    // Criar botão de adicionar nova mídia.
    var addNewItemLink = document.createElement("a");
    addNewItemLink.href = "#";
    addNewItemLink.className = "chat-view-media-add-item position-relative d-flex align-items-center text-decoration-none p-2 rounded"; // Bootstrap
    this.mediaViewListDiv.appendChild(addNewItemLink);

    var addNewItemWrapperDiv = document.createElement("div");
    addNewItemWrapperDiv.className = "d-flex flex-column align-items-center justify-content-center p-2 bg-light text-muted border rounded"; // Bootstrap
    addNewItemWrapperDiv.style.width = "4rem";
    addNewItemWrapperDiv.style.height = "4rem";
    addNewItemWrapperDiv.style.setProperty("border-style", "dashed", "important");
    addNewItemLink.appendChild(addNewItemWrapperDiv);

    var addNewItemIcon = document.createElement("i");
    addNewItemIcon.className = "fas fa-plus"; // Font Awesome
    addNewItemIcon.style.fontSize = "1.5rem";
    addNewItemWrapperDiv.appendChild(addNewItemIcon);

    // Associar evento de clique ao botão de adicionar nova mídia.
    addNewItemLink.addEventListener("click", function() {
      var fileInput = object.chat.createMediaFileInput("*");
      fileInput.click();
    });

    // Esconder a div inferior e a div de conversa.
    this.chat.activeConvDiv.style.setProperty("display", "none", "important");
    this.chat.activeConvBottomDiv.style.setProperty("display", "none", "important");
  } else {
    // Se não possuir arquivos, destruir a view de mídias.
    this.destroyMediaView();
  }
};

/**
 * Obtém o ícone de um arquivo pelo seu MIME type.
 * @param mimeType MIME type do arquivo.
 */
HTMLChatContainer.prototype.getFileIcon = function(mimeType) {
  if (mimeType == "application/pdf") {
    return "fas fa-file-pdf"; // Font Awesome
  } else if (mimeType == "text/html" ||
             mimeType == "text/css" ||
             mimeType == "application/json" ||
             mimeType == "application/xml" ||
             mimeType == "application/javascript" ||
             mimeType == "application/typescript") {
    return "fas fa-file-code"; // Font Awesome
  } else if (mimeType == "text/csv") {
    return "fas fa-file-csv"; // Font Awesome
  } else if (mimeType == "application/msword") {
    return "fas fa-file-word"; // Font Awesome
  } else if (mimeType == "application/vnd.ms-powerpoint") {
    return "fas fa-file-powerpoint"; // Font Awesome
  } else if (mimeType == "application/zip" ||
             mimeType == "application/x-rar-compressed" ||
             mimeType == "application/x-7z-compressed") {
    return "fas fa-file-archive"; // Font Awesome
  } else {
    // Obter a inicial do tipo do arquivo.
    var attachmentType = mimeType.toLowerCase().split('/')[0];
    if (attachmentType == "image") return "fas fa-image"; // Font Awesome
    else if (attachmentType == "video") return "fas fa-video"; // Font Awesome
    else if (attachmentType == "audio") return "fas fa-volume-up"; // Font Awesome
  }

  return "fas fa-file"; // Font Awesome
};

/**
 * Destroi a view de mídia pra envio.
 */
HTMLChatContainer.prototype.destroyMediaView = function() {
  // Verificar se a div existe.
  if (this.mediaViewDiv) {
    // Remover a div.
    this.chat.rightColumn.removeChild(this.mediaViewDiv);

    // Limpar as variáveis.
    this.mediaViewDiv = null;
    this.mediaViewTopDiv = null;
    this.mediaViewBottomDiv = null;
    this.mediaViewListDiv = null;
    this.mediaViewSendButton = null;
    this.mediaViewTextDiv = null;
    this.mediaViewTextInput = null;
  }

  // Exibir a div inferior e a div de conversa.
  this.chat.activeConvDiv.style.display = null;
  this.chat.activeConvBottomDiv.style.display = null;

  // Definir que a view de mídias está fechada.
  this.isMediaViewOpen = false;
};
