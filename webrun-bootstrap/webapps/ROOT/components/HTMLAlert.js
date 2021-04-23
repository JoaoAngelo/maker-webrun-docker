/**
 * Método construtor do HTMLAlert.
 **/
function HTMLAlert() {
  this.visible = true;
  this.locked = false;
  this.activeFilter = false;
  this.waiting = false;
  this.includeMode = false;
  this.alterMode = false;
  this.hideImages = false;
  this.status = new Array();
}

/**
 * Herança do objeto.
 **/
HTMLAlert.inherits(HTMLElementBase);
HTMLAlert.prototype.name = 'HTMLAlert';

/**
 * Exibe no formulário a imagem de filtro ativo.
 * @param v  
 **/
HTMLAlert.prototype.showFilter = function(v) {
  if (!this.hideImages) {
    if (v && this.locked) v = !v;
    if (!this.filterDiv && v) this.filterDiv = this.createAlert('FILTER', null, 1, 100, getLocaleMessage("LABEL.ACTIVE_FILTER"), true);
    if (v && this.filterDiv.startTime) this.filterDiv.resetTimestamp();
    if (this.filterDiv) this.setToastVisible(this.filterDiv, v && this.visible);
    this.setStatus("filter", v);
  }
};

/**
 * Exibe no formulário a imagem de Inserção.
 * @param v 
 **/
HTMLAlert.prototype.showInclude = function(v) {
  if (!this.hideImages) {
    if (!this.includeDiv && v) this.includeDiv = this.createAlert('INCLUSION', null, 1, 200, getLocaleMessage("LABEL.INCLUSION"), true);
    if (v && this.includeDiv.startTime) this.includeDiv.resetTimestamp();
    if (this.includeDiv) this.setToastVisible(this.includeDiv, v && this.visible);
    if (v) this.lock();
    this.setStatus('include', v);
  }
};

/**
 * Exibe no formulário a imagem de Alteração.
 * @param v 
 **/
HTMLAlert.prototype.showEdit = function(v) {
  if (!this.hideImages) {
    if (!this.editDiv && v) this.editDiv = this.createAlert('EDIT', null, 1, 200, getLocaleMessage("LABEL.ALTERATION"), true);
    if (v && this.editDiv.startTime) this.editDiv.resetTimestamp();
    if (this.editDiv) this.setToastVisible(this.editDiv, v && this.visible);
    if (v) this.lock();
    this.setStatus('edit', v);
  }
};

/**
 * Exibe no formulário a imagem de sinalizando Aguardando.
 * @param v 
 **/
HTMLAlert.prototype.showProcessing = function(v) {
  if (!this.hideImages) {
    if (v) {
      if (this.filterDiv) this.setToastVisible(this.filterDiv, false);
      if (this.includeDiv) this.setToastVisible(this.includeDiv, false);
      if (this.editDiv) this.setToastVisible(this.editDiv, false);
      if (this.errorDiv) this.setToastVisible(this.errorDiv, false);
    }

    if (!this.processDiv && v) this.processDiv = this.createAlert('WAIT', null, 1, 300, getLocaleMessage("LABEL.WAIT"), false);
    if (v && this.processDiv.startTime) this.processDiv.resetTimestamp();
    if (this.processDiv) this.setToastVisible(this.processDiv, v && this.visible);

    if (!v) this.recall();
    this.setStatus('waiting', v);
  }
};

/**
 * Exibe no formulário a imagem de Erro.
 * @param v 
 **/
HTMLAlert.prototype.showError = function(v) {
  if (!this.hideImages) {
    if (v && this.locked) v = !v;
    if (!this.errorDiv && v) this.errorDiv = this.createAlert('ERROR', showErrors, 1, 301, getLocaleMessage("LABEL.ERROR"), true);
    if (v && this.errorDiv.startTime) this.errorDiv.resetTimestamp();
    if (this.errorDiv) this.setToastVisible(this.errorDiv, v);
    this.setStatus('error', v);
  }
};

/**
 * Seta o Status/Ação atual do formulário. 
 * @param status - Indica o indice do status no array.
 * @param v - Indica o status atual. 
 **/
HTMLAlert.prototype.setStatus = function(status, v) {
  this.status[status] = v;
};

/**
 * Bloqueia.
 **/
HTMLAlert.prototype.lock = function () {
  this.locked = true;
};

/**
 * Desbloqueia.
 **/
HTMLAlert.prototype.unLock = function () {
  this.locked = false;
};

HTMLAlert.prototype.recall = function () {
  this.showFilter(this.status["filter"]);
  this.showInclude(this.status["include"]);
  this.showEdit(this.status["edit"]);
  this.showError(this.status["error"]);
};

HTMLAlert.prototype.design = function (doc) {
  // Obter o documento do formulário
  var doc;
  try { doc = mainform.document; }
  catch (e) { doc = document; }
  this.doc = doc;

  // Por razões de integridade e segurança, verificar se
  // o documento tem um corpo e se não tiver, criar um.
  if (!doc.body) { doc.writeln("<body></body>"); }

  // Verifica se o container de toasts na posição Top Right (TR) existe
  this.div = doc.getElementById("toast-container-tr");
  if (!this.div) {
    // Se não existir, criar o container de toasts
    this.div = document.createElement("div");
    this.div.id = "toast-container-tr";
    this.div.className = "toast-container position-fixed mt-3 mr-3";
    this.div.style.pointerEvents = "none";
    this.div.style.top = "0px";
    this.div.style.right = "0px";
  }

  // Adiciona o container de toasts na página
  doc.body.appendChild(this.div);
};

HTMLAlert.prototype.setColor = function(color) { this.color = color; };
HTMLAlert.prototype.setBGColor = function(color) { this.bgColor = color; };
HTMLAlert.prototype.setVisible = function(v) { this.visible = v; };
HTMLAlert.prototype.setFont = function(f) { };

/**
 * @param src - Endereço da Imagem.
 * @param oc - Evento onclick.
 * @param zindex - �?ndice na posição Z.
 * @param descricao - Descrição da imagem. 
 * @param closeable - Fechável?
 **/
HTMLAlert.prototype.createAlert = function(src, oc, place, zindex, description, closeable) {
  var object = this;

  // Gera um código aleatório para identificar o toast
  var code = Math.floor(Math.random() * 1000000) + 1;

  // Cria o elemento base do toast
  var toastDiv = document.createElement("div");
  toastDiv.className = "toast"; // Bootstrap
  toastDiv.id = "toast" + code;
  toastDiv.setAttribute("role", "alert");
  toastDiv.setAttribute("data-autohide", "false");
  toastDiv.setAttribute("data-delay", "1000");
  toastDiv.zIndex = zindex;

  // Cria o elemento da header do toast.
  var toastHeader = document.createElement("div");
  toastHeader.className = "toast-header"; // Bootstrap
  toastDiv.appendChild(toastHeader);

  // Estilização dos elementos
  if (this.color) {
    toastDiv.style.color = this.color;
    toastHeader.style.color = this.color;
  }

  if (this.bgColor) {
    toastDiv.style.backgroundColor = this.bgColor;
    toastHeader.style.backgroundColor = this.bgColor;
  }

  // Cria o ícone do toast, se tiver
  if (src) {
    var toastIcon, srcUpper = src.toUpperCase();
    if (srcUpper == "ERROR") {
      // Cria um ícone pré-definido de erro do formulário
      toastIcon = document.createElement("i");
      toastIcon.className = "fas fa-exclamation-triangle mr-2"; // Font Awesome
    } else if (srcUpper == "EDIT") {
      // Cria um ícone pré-definido de editar do formulário
      toastIcon = document.createElement("i");
      toastIcon.className = "fas fa-pencil-alt mr-2"; // Font Awesome
    } else if (srcUpper == "INCLUSION") {
      // Cria um ícone pré-definido de adicionar do formulário
      toastIcon = document.createElement("i");
      toastIcon.className = "fas fa-plus mr-2"; // Font Awesome
    } else if (srcUpper == "FILTER") {
      // Cria um ícone pré-definido de filtro do formulário
      toastIcon = document.createElement("i");
      toastIcon.className = "fas fa-filter mr-2"; // Font Awesome
    } else if (srcUpper == "WAIT") {
      // Cria um elemento Spinner do Bootstrap
      toastIcon = document.createElement("div");
      toastIcon.className = "spinner-border text-secondary mr-2"; // Bootstrap
      toastIcon.setAttribute("role", "status");
      toastIcon.style.width = "20px";
      toastIcon.style.height = "20px";
      toastIcon.innerHTML = '<span class="sr-only">...</span>';
      toastDiv.className += " toast-wait";
    } else {
      // Utiliza o src como imagem
      toastIcon = document.createElement("img");
      toastIcon.className = "mr-2"; // Bootstrap
      toastIcon.id = "toastIcon" + code;
      toastIcon.src = src;
      toastIcon.width = 20;
      toastIcon.height = 20;
      if (description) toastIcon.alt = description;
    }

    toastHeader.appendChild(toastIcon);
  }

  // Cria o título do toast, se tiver
  if (description) {
    var toastTitle = document.createElement("strong");
    toastTitle.className = "mr-auto"; // Bootstrap
    toastTitle.id = "toastTitle" + code;
    toastTitle.innerHTML = description;
    toastHeader.appendChild(toastTitle);
  }

  try {
    // Importar o moment.js
    webrun.include("assets/moment.min.js");

    // Define o idioma do moment
    var lang = resources_locale.replace("_", "-");
    if (lang.indexOf("en") != -1) lang = "en";
    else if (lang.indexOf("es") != -1) lang = "es";
    else if (lang.indexOf("fr") != -1) lang = "fr";
    moment.locale(lang);

    // Obter o horário de exibição do toast
    toastDiv.startTime = moment();

    // Cria o label de tempo do toast
    var toastTimestamp = document.createElement("small");
    toastTimestamp.className = "ml-2"; // Bootstrap
    toastTimestamp.innerHTML = moment(toastDiv.startTime).fromNow();
    toastHeader.appendChild(toastTimestamp);

    toastDiv.updateTimestamp = function () {
      if (toastDiv && toastTimestamp) {
        toastTimestamp.innerHTML = moment(toastDiv.startTime).fromNow();
      }
    };

    toastDiv.resetTimestamp = function () {
      if (toastDiv) {
        toastDiv.startTime = moment();
        toastDiv.updateTimestamp();
      }
    };

    // Cria o timer do label de tempo
    toastTimer = setInterval(function () {
      if (toastDiv) toastDiv.updateTimestamp();
    }, 10000); // A cada 10s
  } catch (e) { }

  // Criar o botão de fechar do toast
  if (closeable) {
    var toastClose = document.createElement("button");
    toastClose.type = "button";
    toastClose.id = "toastButton" + code;
    toastClose.className = "ml-2 mb-1 close"; // Bootstrap
    toastClose.setAttribute("aria-label", getLocaleMessage("LABEL.CLOSE")); // Accessibility
    toastClose.style.outline = "0";
    toastClose.style.zIndex = "1";
    toastClose.innerHTML = '<span aria-hidden="true">&times;</span>';
    toastHeader.appendChild(toastClose);

    // Evento de clique do botão de fechar
    toastClose.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      object.setToastVisible(toastDiv, false);
      return false;
    };
  }

  // Evento de clique do toast
  if (oc) {
    var clickFunction = function (e) {
      e.stopPropagation();
      oc();
      return true;
    };

    toastDiv.onclick = clickFunction;
    if (toastTitle) toastTitle.onclick = clickFunction;
    if (toastIcon) toastIcon.onclick = clickFunction;
    if (toastTimestamp) toastTimestamp.onclick = clickFunction;
    toastDiv.style.cursor = "pointer";
  }

  // Adiciona o toast à página
  this.div.appendChild(toastDiv);

  // Exibir o toast
  this.setToastVisible(toastDiv, true);

  // Retornar a instância do toast
  return toastDiv;
};

/**
 * Exibe / oculta um toast.
 * @param toast - Referência para o elemento do toast.
 * @param visible - true para exibir o toast; false para ocultá-lo.
 **/
HTMLAlert.prototype.setToastVisible = function(toast, visible) {
  if (visible) $(toast).toast("show");
  else $(toast).toast("hide");
  visibleDiv(toast, visible);
};

HTMLAlert.prototype.flush = function () {
  this.div = null;
  this.filterDiv = null;
  this.includeDiv = null;
  this.editDiv = null;

  if (this.errorDiv) {
    if (this.errorDiv.onclick) this.errorDiv.onclick = null;
    this.errorDiv = null;
  }

  this.processDiv = null;
  this.status = null;

  this.callMethod(HTMLElementBase, "flush");
};
