/**
 * Método construtor do HTMLTabController.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - ALtura do componente.
 */
function HTMLTabController(sys, formID, posX, posY, width, height, hideTab) {
  this.sys = sys;
  this.formID = formID;
  this.posX = posX;
  this.posY = posY;
  this.width = width;
  this.height = height;
  this.tabs = new Array();
  this.tabsByName = new Array();
  this.showTabButtons = true;
  this.useReadOnlyDiv = true;
  this.hideTab = hideTab;
  this.editWithDoubleClick = true;

  this.searchTab = null; // Aba Localizar
  this.currentTab = null; // Aba selecionada
  this.lastCreatedTab = null; // �?ltima aba criada
}

/**
 * Herança do componente.
 */
HTMLTabController.inherits(HTMLElementBase);
HTMLTabController.prototype.name = 'HTMLTabController';

/**
 * Retorno o name do componente.
 * @return '[object ' concateaado com o name do objeto.
 */
HTMLTabController.prototype.toString = function() {
  return '[object ' + this.name + ']';
};

/**
 * Exibe as abas ao entrar no formulário.
 */
HTMLTabController.prototype.view = function() {
  for (var i = 0; i < this.tabs.length; i++) {
    this.tabs[i].view();
  }
};

/**
 * Exibe as abas no momento em que o formulário esta para inserção/alteração.
 */
HTMLTabController.prototype.edit = function() {
  for (var i = 0; i < this.tabs.length; i++) {
    this.tabs[i].edit();
  }
};

/**
 * Indica se a aba 'Localizar' irá aparecer ou não no formulário.
 * @param visible - TRUE indica que a aba 'Localizar' será visível.
 */
HTMLTabController.prototype.setSearchTabVisible = function(visible) {
  if (this.searchTab) this.searchTab.setVisible(visible);
};

/**
 * Adiciona uma aba ao formulário.
 * @param description - Descrição do Aba.
 * @param onclick - Evento onclick da Aba.
 * @param onexit -
 * @param imgSrc - imagem associada a Aba.
 */
HTMLTabController.prototype.add = function(description, onclick, onexit, imgSrc) {
  return this.addTab(description, onclick, onexit, imgSrc, false);
};

/**
 * Adiciona a aba Localizar ao formulário.
 * @param description - Descrição do aba.
 * @param onclick - Evento onclick da aba.
 * @param onexit - Evento onexit da aba.
 * @param imgSrc - Imagem associada a aba.
 */
HTMLTabController.prototype.addSearchTab = function(description, onclick, onexit, imgSrc) {
  return this.addTab(description, onclick, onexit, imgSrc, true);
};

/**
 * Adiciona as ao formulário.
 * @param description - Descrição do aba.
 * @param onclick - Evento onclick da aba.
 * @param onexit - Evento onexit da aba.
 * @param imgSrc - Imagem associada a aba.
 * @param searchTab - TRUE indica que a aba Localizar será adicionada ao formulário.
 */
HTMLTabController.prototype.addTab = function(description, onclick, onexit, imgSrc, searchTab) {
  // Cria a instância da aba
  var tab = new HTMLTab(this.tabs.length, description, this, onclick, onexit, imgSrc);

  // Variáveis da aba
  tab.searchTab = searchTab;
  tab.showTabButtons = this.showTabButtons;
  tab.color = this.color;

  if (!this.editWithDoubleClick) tab.editWithDoubleClick = false;
  if (searchTab) this.searchTab = tab;

  // Cria os elementos da aba
  tab.design(this.navdiv, this.tabs.length == 0);

  // Adiciona a aba no array de abas
  this.tabs.push(tab);
  this.tabsByName[description] = tab;
  this.lastCreatedTab = tab;

  // Se esse controlador de abas só tiver a aba que acabou
  // de ser criada, devemos marcar ela como selecionada.
  if (this.tabs.length == 1) tab.select(true);

  // Retornar o div com o conteúdo da aba
  return tab.div;
};

/**
 * @deprecated
 */
HTMLTabController.prototype.showTab = function() { };

/**
 * Retorna objeto a partir do name passado como parâmetro.
 * @param name - nome do objeto.
 * @return objeto HTMLTabController.
 */
HTMLTabController.prototype.getTabByName = function(name) {
  try { return this.tabsByName[name]; }
  catch (e) { return null; }
};

HTMLTabController.prototype.getTabByDiv = function(div) {
  for (var i = 0; i < this.tabs.length; i++) {
    if (this.tabs[i].div == div) {
      return this.tabs[i];
    }
  }
};

HTMLTabController.prototype.getDiv = function(name) {
  if (!name) {
    if (this.lastCreatedTab && this.lastCreatedTab.div) {
      return this.lastCreatedTab.div;
    }
  } else {
    var t = this.tabsByName[name];
    if (t) return t.div;
  }

  return this.doc;
};

/**
 * Retorna o indice da aba selecionada no formulario.
 * @return index - indica o indice da aba.
 */
HTMLTabController.prototype.getSelectedTabIndex = function() {
  if (!this.tabs || this.tabs.length == 0) return -1;
  for (var i = 0; i < this.tabs.length; i++)
    if (this.tabs[i].selected) return i;
  return -1;
};

/**
 * Retorna a aba selecionda ou null caso n exista abas no formulário.
 */
HTMLTabController.prototype.getSelectedTab = function() {
  var index = this.getSelectedTabIndex();
  if (index >= 0) return this.tabs[index];
  return null;
};

/**
 * Retorna a aba conforme o indice passado como parametro.
 * @param tab - retorna a aba ou null caso n exista.
 */
HTMLTabController.prototype.openTabByIndex = function(index) {
  var tab = this.tabs[index];
  if (tab && tab.getVisible()) {
    tab.clickAction();
    return tab;
  }

  return null;
};

HTMLTabController.prototype.getTabInterval = function() {
  var firstTabPosition = 0;
  for (var j = 0; j < this.tabs.length; j++) {
    if (this.tabs[j] && this.tabs[j].getVisible()) {
      firstTabPosition = j;
      break;
    }
  }

  var lastTabPosition = this.tabs.length - 1;
  for (var j = (this.tabs.length - 1); j >= 0; j--) {
    if (this.tabs[j] && this.tabs[j].getVisible()) {
      lastTabPosition = j;
      break;
    }
  }

  return {
    first: firstTabPosition,
    last: lastTabPosition
  };
};

/**
 * Retorna a aba ANTERIOR à aba atual.
 * @return NULL caso n exista uma aba anterior.
 */
HTMLTabController.prototype.openPreviousTab = function() {
  var selectedTabIndex = this.getSelectedTabIndex();
  var tabInterval = this.getTabInterval();
  var first = tabInterval.first;
  var last = tabInterval.last;

  if (first < last) {
    if (selectedTabIndex == first) {
      return this.openTabByIndex(last);
    } else if (selectedTabIndex > 0) {
      return this.openTabByIndex(selectedTabIndex - 1);
    }
  }

  return null;
};

/**
 * Retorna a POSTERIOR à aba atual.
 * @return NULL caso n exista uma próxima aba.
 */
HTMLTabController.prototype.openNextTab = function() {
  var selectedTabIndex = this.getSelectedTabIndex();
  var tabInterval = this.getTabInterval();
  var first = tabInterval.first;
  var last = tabInterval.last;

  if (first < last) {
    if (selectedTabIndex == last) {
      return this.openTabByIndex(first);
    } else if (selectedTabIndex >= 0) {
      return this.openTabByIndex(selectedTabIndex + 1);
    }
  }

  return null;
};

/**
 * Retorna a PRIMEIRA aba.
 */
HTMLTabController.prototype.openFirstTab = function() {
  var tabInterval = this.getTabInterval();
  return (tabInterval.first >= 0) ? this.openTabByIndex(tabInterval.first) : null;
};

/**
 * Retorna a �?LTIMA aba.
 */
HTMLTabController.prototype.openLastTab = function() {
  var tabInterval = this.getTabInterval();
  return (tabInterval.last >= 0) ? this.openTabByIndex(tabInterval.last) : null;
};

/**
 * Adiciona as abas ao corpo do formulário.
 * @param doc - documento onde as abas sao inseridas.
 */
HTMLTabController.prototype.design = function(doc) {
  // Se o código não foi definido, gerar um aleatório
  if (!this.code) this.code = getRandomCode();

  // Criar o elemento base dos botões das abas
  this.navdiv = document.createElement("ul");
  this.navdiv.id = "tabsController" + this.code;
  this.navdiv.className = "nav nav-tabs flex-sm-nowrap" + (!this.showTabButtons ? " d-none" : ""); // Bootstrap
  this.navdiv.style.flex = "0 0 auto"; // Correção para o Safari
  this.navdiv.setAttribute("role", "tablist"); // Bootstrap

  // Criar o elemento base dos conteúdos das abas
  this.div = document.createElement("div");
  this.div.className = "tab-content d-flex flex-fill w-100"; // Bootstrap
  this.div.id = "tabsContent" + this.code;

  // Verificar se possui imagem de fundo definida
  if (this.bgImage) this.setBackgroundImage(this.bgImage, this.bgImageMode);

  // Verificar se o formulário está centralizado verticalmente e o formulário não é responsivo.
  if (this.verticalCentered && !this.responsive) {
    this.div.className += " align-items-center"; // Bootstrap
  }

  // Verificar se possui navegação fixa.
  if (navigationFixed && d && d.formNavDiv) {
    d.formNavDiv.appendChild(this.navdiv);
  } else {
    // Adiciona as abas na página
    doc.appendChild(this.navdiv);
  }

  // Adiciona os conteúdos das abas na página
  doc.appendChild(this.div);

  this.doc = doc;
};

/**
 * Obtém a distância do topo do conteúdo das abas.
 * Utilizado para saber o tamanho da barra de navegação e/ou abas.
 */
HTMLTabController.prototype.getDistanceFromTop = function() {
  return this.div ? this.div.offsetTop : 0;
};

/**
 * Define a imagem fundo das abas.
 * @param img URL da imagem.
 * @param viewMode Modo de exibição da imagem.
 */
HTMLTabController.prototype.setBackgroundImage = function(img, viewMode) {
  this.bgImage = img;
  this.bgImageMode = viewMode;

  if (this.div) {
    this.div.style.backgroundImage = "url(" + img + ")";

    if (viewMode) {
      if (viewMode == "no-repeat") {
        this.div.style.backgroundRepeat = viewMode;
        this.div.style.backgroundPosition = "center";
        this.div.style.backgroundSize = null;
        this.div.style.backgroundAttachment = null;
      } else if (viewMode == "stretch") {
        this.div.style.backgroundRepeat = "no-repeat";
        this.div.style.backgroundPosition = "center center";
        this.div.style.backgroundSize = "cover";
        this.div.style.backgroundAttachment = "fixed";
      } else {
        this.div.style.backgroundRepeat = viewMode;
        this.div.style.backgroundPosition = "top left";
        this.div.style.backgroundSize = null;
        this.div.style.backgroundAttachment = null;
      }
    }
  }
};

/**
 * Remove os eventos associados as abas.
 */
HTMLTabController.prototype.flush = function() {
  for (i = 0; i < this.tabs.length; i++)
    this.tabs[i].flush();
  for (var i in this) {
    if (this[i]) {
      removeEvents(this[i]);
      this[i] = null;
    }
  }
};

/**
 * Seta a propriedade Visible de todas as abas do formulário.
 * @param v - TRUE torna visíveis as abas do formulário.
 */
HTMLTabController.prototype.setVisible = function(name, v) {
  var t = this.tabsByName[name];
  if (t) {
    if (!v && t.selected) {
      var foundTabPosition = -1;
      for (var i in this.tabs) {
        if (this.tabs[i] && this.tabs[i].description == name) {
          this.tabs[i].selected = false;
          foundTabPosition = i;
          break;
        }
      }

      var firstTabPosition = 0;
      for (var j = 0; j < this.tabs.length; j++) {
        if (this.tabs[j] && this.tabs[j].getVisible()) {
          firstTabPosition = j;
          break;
        }
      }

      var lastTabPosition = this.tabs.length - 1;
      for (var j = (this.tabs.length - 1); j >= 0; j--) {
        if (this.tabs[j] && this.tabs[j].getVisible()) {
          lastTabPosition = j;
          break;
        }
      }

      if (foundTabPosition == firstTabPosition) {
        var j = foundTabPosition;
        while (++j < this.tabs.length) {
          var temp = this.tabs[j];
          if (temp && temp.getVisible()) {
            this.openTab(temp.description);
            break;
          }
        }
      } else if (foundTabPosition == lastTabPosition) {
        for (var j = lastTabPosition - 1; j >= firstTabPosition; j--) {
          var temp = this.tabs[j];
          if (temp && temp.getVisible()) {
            this.openTab(temp.description);
            break;
          }
        }
      } else {
        var j = foundTabPosition;
        while (--j != foundTabPosition) {
          var temp = this.tabs[j];
          if (temp && temp.getVisible()) {
            this.openTab(temp.description);
            break;
          } else if (j == firstTabPosition) {
            j = this.tabs.length;
          }
        }
      }
    }

    t.setVisible(v);
  }
};

HTMLTabController.prototype.openSearchTab = function() {
  if (this.searchTab) this.searchTab.clickAction();
};

HTMLTabController.prototype.openTab = function(name) {
  var t = this.tabsByName[name];
  if (t) t.clickAction();
  if (this.isCallFunction) this.isCallFunction = false;
};


/**
 * Método construtor do HTMLTab. Cria as abas do formulário.
 * @param index - �?ndice da aba.
 * @param description - Descrição da aba.
 * @param onclick - Evento onclick da aba.
 * @param onexit - Evento onexit da aba.
 * @param imgSrc - Imagem associada a aba.
 */
function HTMLTab(index, description, parent, onclick, onexit, imgSrc) {
  this.index = index;
  this.showTabButtons = true;
  this.sys = parent.sys;
  this.formID = parent.formID;
  this.description = description;
  this.onclick = onclick;
  this.onexit = onexit;
  this.parent = parent;
  this.selected = false;
  this.self = this;
  this.imgSrc = imgSrc;
  this.editMode = false;
  this.useReadOnlyDiv = parent.useReadOnlyDiv;
  this.searchTab = false;

  this.onshown = [];
  this.onhidden = [];
}

HTMLTab.inherits(HTMLObject);
HTMLTab.prototype.name = 'HTMLTab';

/**
 * Responsável por construir o HTML de cada aba do formulário.
 * @param doc - documento onde a aba será inserida.
 * @param select
 */
HTMLTab.prototype.design = function(doc, select) {
  this.selected = select ? true : false;

  if (!this.parent.hideTab && this.showTabButtons) {
    // Cria o botão da aba
    this.tab = document.createElement("li");
    this.tab.className = "nav-item overflow-hidden"; // Bootstrap
    this.tab.style.maxWidth = "max-content";

    // Cria a label da aba
    this.label = document.createElement("a");
    this.label.id = "tabButton" + this.index;
    this.label.href = "#tab" + this.index;
    this.labelClass = "nav-link overflow-hidden w-auto outline-0 px-3 py-1"; // Bootstrap
    this.label.className = this.labelClass + (this.selected ? " active" : ""); // Bootstrap
    this.label.style.fontSize = "0.9rem";
    this.label.style.textOverflow = "ellipsis";
    this.label.title = this.description;
    this.label.setAttribute("role", "tab");
    this.label.setAttribute("data-toggle", "tab"); // Bootstrap
    this.label.setAttribute("aria-controls", "tab" + this.index); // Accessibility
    this.label.setAttribute("aria-selected", (this.selected ? "true" : "false")); // Accessibility

    var labelSpan = document.createElement("span");
    labelSpan.className = "text-truncate"; // Bootstrap
    labelSpan.innerHTML = this.description.replace(/\s/g, "&nbsp;");
    this.label.appendChild(labelSpan);

    // Adiciona a label ao root da aba
    this.tab.appendChild(this.label);

    // Adiciona a aba ao controlador
    doc.appendChild(this.tab);

    // Evento de clique da aba
    this.attachEvent(this.tab, 'click', this.clickAction);
  }

  // Cria o div do conteúdo da aba
  this.div = document.createElement("div");
  this.div.id = "tab" + this.index;
  this.div.setAttribute("webrun-tab-mode", "view");
  this.divClass = "tab-pane position-relative w-100 flex-fill"; // Bootstrap

  // Verificar se é aba localizar
  if (this.searchTab) {
    this.divClass += " overflow-hidden tab-search"; // Bootstrap - Custom
  } else {
    this.divClass += " overflow-visible"; // Bootstrap
    this.div.style.minHeight = this.parent.height + "px";
  }

  this.divClassSelected = this.divClass + " show active"; // Bootstrap
  this.div.className = this.selected ? this.divClassSelected : this.divClass;
  this.div.tab = this;

  // Estilização da aba
  if (this.color) this.div.style.background = this.color;

  // Eventos da aba
  this.div['focus'] = this.getAction('focus');
  EventCache.add(this.div, 'focus', this.div['focus']);

  this.attachEvent(this.div, 'onmousedown', this.cantSelect);
  this.attachEvent(this.div, 'selectstart', this.cantSelect);

  this.div['canFocus'] = this.getAction('canFocus');
  EventCache.add(this.div, 'canFocus', this.div['focus']);

  this.div['tabName'] = this.description;

  // Adiciona o conteúdo da aba no controlador
  this.parent.div.appendChild(this.div);

  // Cria o div que fica pela frente do formulário e que é utilizado
  // para capturar os eventos de clique duplo para edição e bloquear
  // a edição dos dados.
  if (this.parent.useReadOnlyDiv) {
    this.viewDiv = document.createElement("div");
    this.viewDiv.className = "form-overlay";
    if (this.parent.editWithDoubleClick)
      this.attachEvent(this.viewDiv, 'dblclick', this.dblClickAction);
    this.div.appendChild(this.viewDiv);
  }

  // Evento de clique
  this.attachEvent(this.div, 'click', this.clickDivAction);
};

/**
 * Retorna contexto da Aba Localizar.
 * @return aba localizar.
 */
HTMLTab.prototype.isSearchTab = function() {
  return this.searchTab;
};

/**
 * Evento click da aba.
 */
HTMLTab.prototype.clickDivAction = function(e) {
  var target = e.target || e.srcElement;
  if (target == this.div) controller.activeElement = this;
};

HTMLTab.prototype.cantSelect = function(e) {
  var target = e.target || e.srcElement;
  return (target != this.div);
};

/**
 * Evento duplo clique. Muda aba para modo de inserção/alteração.
 */
HTMLTab.prototype.dblClickAction = function() {
  if (this.parent.nav) {
    var nav = this.parent.nav;
    if (nav.canEdit) {
      nav.focusXY = true;
      nav.mX = mX;
      nav.mY = mY;
      if (this.tab) nav.findPosY = findPosY(this.tab);
      nav.actEdit();
    }
  }
};

/**
 * Evento onfocus da aba.
 */
HTMLTab.prototype.canFocus = function() {
  // !this.useReadOnlyDiv - usado para os casos em que não houver navegação, permitindo assim a tabulação
  var r = this.editMode || !this.useReadOnlyDiv;
  if (r && !this.parent.showTabButtons)
    r = r && this == this.parent.selected;
  return r;
};

HTMLTab.prototype.focus = function() {
  return this.select();
};

/**
 * Torna a DIV que a aba esta inserida visível no momento que o formulário esta no modo de visualização.
 */
HTMLTab.prototype.view = function() {
  if (this.parent.useReadOnlyDiv)
    this.viewDiv.className = "form-overlay";
  this.div.setAttribute("webrun-tab-mode", "view");
  this.editMode = false;

  try {
    if (controller && controller.elems && controller.elems.length > 0) {
      for (var i = 0; i < controller.elems.length; i++) {
        if (controller.elems[i] && controller.elems[i].onFormViewMode) {
          controller.elems[i].onFormViewMode();
        }
      }
    }
  } catch (e) { }
};

/**
 * Torna a DIV qua a aba esta inserida visível no momento que o form esta como inserção/alteração.
 */
HTMLTab.prototype.edit = function() {
  if (this.parent.useReadOnlyDiv)
    this.viewDiv.className = "form-overlay disabled";
  this.div.setAttribute("webrun-tab-mode", "edit");
  this.editMode = true;

  try {
    if (controller && controller.elems && controller.elems.length > 0) {
      for (var i = 0; i < controller.elems.length; i++) {
        if (controller.elems[i] && controller.elems[i].onFormEditMode) {
          controller.elems[i].onFormEditMode();
        }
      }
    }
  } catch (e) { }
};

HTMLTab.prototype.blur = function() {
  return true;
};

/**
 * Evento clique da aba.
 */
HTMLTab.prototype.clickAction = function(e) {
  if (this.parent.currentTab && this.parent.currentTab.onexit)
    this.parent.currentTab.onexit();
  this.parent.currentTab = this.self;

  if (this.onclick) {
    if (this.onclick.load) this.onclick.load(e);
    else this.onclick(this.self.description, this.parent.selected.description);
  }

  this.select();
};

/**
 * Seta a visibilidade do botão da aba.
 */
HTMLTab.prototype.setVisible = function(v) {
  if (this.label) this.label.className = v ? this.labelClass : "d-none"; // Bootstrap
};

/**
 * Renomeia a aba
 * @param description - nova descrição da aba.
 */
HTMLTab.prototype.rename = function(description) {
  this.description = description;
  this.div['tabName'] = description;

  var tabsByNameNew = new Array();
  for (var index in this.tabsByName) {
    if (typeof index == 'function') continue;
    if (index == description) {
      tabsByNameNew[index] = this;
    } else {
      tabsByNameNew[index] = this.tabsByName[index];
    }
  }

  this.tabsByName = tabsByNameNew;
  if (this.label) this.label.innerHTML = this.description.toString().replace(/\s/g, "&nbsp;");
};

/**
 * Retorna o name da aba criada.
 */
HTMLTab.prototype.toString = function() {
  return '[object HTMLTab ' + this.description + ']';
};

HTMLTab.prototype.select = function(first) {
  if(!first && !this.getVisible())
    return false;

  if (this.parent.selected != this) {
    if (this.parent.selected) {
      if (this.parent.selected.label) {
        this.parent.selected.label.className = "nav-link"; // Bootstrap
        this.parent.selected.label.setAttribute("aria-selected", "false");
      }

      if (this.label) {
        this.label.setAttribute("aria-selected", "true");
        this.label.className = this.labelClass + " active"; // Bootstrap
      }
    }

    if (this.editMode && controller.activeElement && controller.activeElement.blur) {
      controller.activeElement.blur();
    }

    this.selected = true;
    this.div.className = this.divClassSelected;
    if (this.parent.selected) this.parent.selected.unSelect();
    this.parent.selected = this;
    this.parent.currentTab = this;
    if (this.editMode) controller.focusTabFirst();

    // Chamar o evento de shown, se foi definido.
    if (this.onshown && this.onshown.length > 0) {
      for (var i = 0; i < this.onshown.length; i++) {
        if (this.onshown[i]) this.onshown[i].call(this, this.div);
      }
    }
  }

  return true;
};

/**
 * Checa se o botão da aba esta visível.
 */
HTMLTab.prototype.getVisible = function() {
// this.parent.isCallFunction é setada pelas funções da API: Próxima Guia, Guia Anterior e Ativar Aba.
  if(this.parent.isCallFunction) return true;
  return (this.label && this.label.className.indexOf("d-none") == -1);
};

/**
 * Torna a aba invisível no contexto.
 */
HTMLTab.prototype.unSelect = function() {
  if (this.label) {
    this.label.setAttribute("aria-selected", "false");
    this.label.className = this.labelClass;
  }

  this.selected = false;
  this.div.className = this.divClass; // Botstrap

  // Chamar o evento de hidden, se foi definido.
  if (this.onhidden && this.onhidden.length > 0) {
    for (var i = 0; i < this.onhidden.length; i++) {
      if (this.onhidden[i]) this.onhidden[i].call(this, this.div);
    }
  }

  return true;
};

/**
 * Evento 'onMouseOver' da aba.
 */
HTMLTab.prototype.onMouseOver = function(e, elem) { };

/**
 * Evento 'onMouseOut' da aba.
 */
HTMLTab.prototype.onMouseOut = function(e, elem) { };

/**
 * Remove eventos da aba.
 */
HTMLTab.prototype.flush = function() {
  for (var i in this) {
    if (this[i]) removeEvents(this[i]);
  }
};

/**
 * Remove a aba e a div que a mesma esta inserida.
 */
HTMLTab.prototype.free = function(notRemoveFromDoc) {
  if (this.parent && this.parent.div)
    this.parent.div.removeChild(this.div);
  if (this.tab && this.tab.parentNode)
    this.tab.parentNode.removeChild(this.tab);
  return this;
};

/**
 * Adiciona uma função callback para o evento "onshown".
 */
HTMLTab.prototype.addShownListener = function(func) {
  this.onshown.push(func);
};

/**
 * Remove uma função callback para o evento "onshown".
 */
HTMLTab.prototype.removeShownListener = function(func) {
  var index = this.onshown.indexOf(func);
  if (index !== -1) this.onshown.splice(index, 1);
};

/**
 * Adiciona uma função callback para o evento "onhidden".
 */
HTMLTab.prototype.addHiddenListener = function(func) {
  this.onhidden.push(func);
};

/**
 * Remove uma função callback para o evento "onhidden".
 */
HTMLTab.prototype.removeHiddenListener = function(func) {
  var index = this.onhidden.indexOf(func);
  if (index !== -1) this.onhidden.splice(index, 1);
};

/**
 * Obtém a distância do topo do conteúdo das abas.
 * Utilizado para saber o tamanho da barra de navegação e/ou abas.
 */
HTMLTab.prototype.getDistanceFromTop = function() {
  return this.parent.getDistanceFromTop();
};
