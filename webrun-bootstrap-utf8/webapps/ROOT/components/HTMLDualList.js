/**
 * MÃ©todo construtor do HTMLDualList. ResponsÃ¡vel por criar o componente Lista Dupla.
 * @param sys - Indica o cÃ³digo do sistema.
 * @param formID - Indica o cÃ³digo do formulÃ¡rio.
 * @param posX - PosiÃ§Ã£o do componente na tela em relaÃ§Ã£o ao eixo X.
 * @param posY - PosiÃ§Ã£o do componente na tela em relaÃ§Ã£o ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - ALtura do componente.
 * @param descriptionLeft - Descricao dos itens do lado esquerdo (PRINCIPAL).
 * @param descriptionRighh - Descricao dos itens do lado direito (SELECIONADOS).
 * @param labels - Array com os valores do campo LISTA do Select PRINCIPAL.
 * @param values - Array com os valores do campo CHAVE do Select PRINCIPAL.
 * @param labelsRIGHT - Array com os valores do campo LISTA do Select SELECIONADOS.
 * @param valuesRIGHT - Array com os valores do campo LISTA do Select SELECIONADOS.
 * @param duploClicar - TRUE se o evento 'Duplo Clicar' serÃ¡ criado.
 * @param btAddItem - TRUE se o evento 'Antes/Depois de Adicionar Item' serÃ¡ criado.
 * @param btAddAll - TRUE se o evento 'Antes/Depois de Adicionar Todos' serÃ¡ criado.
 * @param btRemItem - TRUE se o evento 'Antes/Depois de Remover Item' serÃ¡ criado.
 * @param btRemAll - TRUE se o evento 'Antes/Depois de Remover Todos' serÃ¡ criado.
 **/
function HTMLDualList(sys, formID, code, posX, posY, width, height,
  descriptionLeft, descriptionRight, labels, values, labelsRIGHT,
  valuesRIGHT, duploClicar, btAddItem, btAddAll, btRemItem, btRemAll) {

  this.create(sys, formID, code, posX, posY, width, height, descriptionLeft,
    descriptionRight, labels, values, labelsRIGHT, valuesRIGHT,
    duploClicar, btAddItem, btAddAll, btRemItem, btRemAll);

  this.labels = labels;
  this.values = values;
  if (!this.values) this.values = this.labels;

  this.labelsRIGHT = labelsRIGHT;
  this.valuesRIGHT = valuesRIGHT;
  if (!this.valuesRIGHT) this.valuesRIGHT = this.labelsRIGHT;

  this.descPrincipal = descriptionLeft;
  this.descSelecionados = descriptionRight;
  this.duploClicar = duploClicar;
  this.btAddItem = btAddItem;
  this.btAddAll = btAddAll;
  this.btRemItem = btRemItem;
  this.btRemAll = btRemAll;

  this.search = true;
  this.leftSearching = false;
  this.rightSearching = false;
}

/**
 * Propriedades do componente HTMLDualList.
 **/
HTMLDualList.inherits(HTMLElementBase);
HTMLDualList.prototype.name = 'HTMLDualList';
HTMLDualList.prototype.tabable = true;
HTMLDualList.prototype.tagName = 'duallist';
HTMLDualList.prototype.zIndex = 301;

/**
 * Retorna o Select (objeto HTMLSelect) da Esquerda com seus itens.
 * @return Select (objeto HTMLSelect) da Esquerda.
 **/
HTMLDualList.prototype.fieldsLEFT = function() {
  return this.leftSelect;
};

/**
 * Retorna o Select (objeto HTMLSelect) da Direita com seus itens.
 * @return Select (objeto HTMLSelect) da Direita.
 **/
HTMLDualList.prototype.fieldsRIGHT = function() {
  return this.rightSelect;
};

/**
 * Move todos os itens de um Select (objeto HTMLSelect) da lista dupla para o outro.
 * @param target
 * @param event
 * @param side Indica o lado que os itens estÃ£o.
 * Caso seja LEFT os itens serÃ£o movidos do objeto HTMLSelect do lado LEFT para o lado RIGTH e virse-versa.
 **/
HTMLDualList.prototype.moveAllOptions = function(event, side, param) {
  document.hasRuleException = false;
  if (!this.visible || !this.enabled || this.readonly) return;

  var selectIN = (side == "LEFT") ? this.leftSelect : this.rightSelect;
  var selectOUT = (side == "LEFT") ? this.rightSelect : this.leftSelect;

  var arrElements = [];

  if ((side == "LEFT" && this.leftSearching) || (side == "RIGHT" && this.rightSearching)) {
    var searchSelectIn = (side == "LEFT") ? this.leftSearchSelect : this.rightSearchSelect;
    var queryOptions = [], i = 0;

    for (i = 0; i < searchSelectIn.options.length; i++) {
      queryOptions.push(searchSelectIn.options[i].value);
    }

    if (queryOptions.length > 0) {
      for (i = 0; i < selectIN.options.length; i++) {
        if (queryOptions.indexOf(selectIN.options[i].value) != -1) {
          arrElements.push([i, selectIN.options[i].value, selectIN.options[i].text]);
        }
      }
    }
  } else {
    for (var i = 0; i < selectIN.options.length; i++) {
      arrElements.push([i, selectIN.options[i].value, selectIN.options[i].text]);
    }
  }

  // Como o elemento removido diminui a posiÃ§Ã£o dos segunites a serem removidos,
  // foi criada essa variÃ¡vel para controlar o Ã­ndice.
  var auxiliar = 0;
  if (arrElements.length > 0) {
    var eventException = (side == "LEFT") ?
      !this.invokeEventsBeforeAddAll() :
      !this.invokeEventsBeforeRemAll();
    if (eventException) return;

    for (var i = 0; i <= arrElements.length - 1; i++) {
      var element = arrElements[i];
      var index = element[0];
      var value = element[1];
      var text = element[2];
      if (this.includeOption(selectOUT, value, text, param)) {
        this.deleteOption(selectIN, index - auxiliar);
        auxiliar++;
      }
    }

    eventException = (side == "LEFT") ?
      !this.invokeEventsAfterAddAll() :
      !this.invokeEventsAfterRemAll();
    if (eventException) return;
  }

  // Atualizar lista de pesquisa quando em modo pesquisa.
  this.searchOption("LEFT", this.leftSearchInput.value);
  this.searchOption("RIGHT", this.rightSearchInput.value);
};

/**
 * Move um item (objeto HTMLOption) de um Select (objeto HTMLSelect) da lista dupla para o outro.
 * @param target
 * @param event
 * @param side Indica o lado que os itens estÃ£o.
 * Caso seja LEFT o item serÃ¡ movido do lado LEFT do objeto HTMLSelect para o lado RIGTH e virse-versa.
 **/
HTMLDualList.prototype.moveOption = function(event, side, param) {
  document.hasRuleException = false;
  if (!this.visible || !this.enabled || this.readonly) return;

  var selectIN = (side == "LEFT") ? this.leftSelect : this.rightSelect;
  var selectOUT = (side == "LEFT") ? this.rightSelect : this.leftSelect;

  var arrElements = [];

  if ((side == "LEFT" && this.leftSearching) || (side == "RIGHT" && this.rightSearching)) {
    var searchSelectIn = (side == "LEFT") ? this.leftSearchSelect : this.rightSearchSelect;
    var selectedOptions = [], i = 0;

    for (i = 0; i < searchSelectIn.options.length; i++) {
      if (searchSelectIn.options[i].selected) {
        selectedOptions.push(searchSelectIn.options[i].value);
      }
    }

    if (selectedOptions.length > 0) {
      for (i = 0; i < selectIN.options.length; i++) {
        if (selectedOptions.indexOf(selectIN.options[i].value) != -1) {
          arrElements.push([i, selectIN.options[i].value, selectIN.options[i].text]);
        }
      }
    }
  } else {
    for (var i = 0; i < selectIN.options.length; i++) {
      if (selectIN.options[i].selected) {
        arrElements.push([i, selectIN.options[i].value, selectIN.options[i].text]);
      }
    }
  }

  // Como o elemento removido diminui a posiÃ§Ã£o dos segunites a serem removidos,
  // foi criada essa variÃ¡vel para controlar o Ã­ndice.
  var auxiliar = 0;
  for (var i = 0; i < arrElements.length; i++) {
    var element = arrElements[i];
    var index = element[0];
    var value = element[1];
    var text = element[2];

    var canContinue = this.includeOption(selectOUT, value, text, param);
    if (canContinue) {
      this.deleteOption(selectIN, index - auxiliar);
      auxiliar++;
    }
  }

  // Atualizar lista de pesquisa quando em modo pesquisa.
  this.searchOption("LEFT", this.leftSearchInput.value);
  this.searchOption("RIGHT", this.rightSearchInput.value);
}

/**
 * Retorna LEFT caso seja passado RIGTH como parÃ¢metro ou virse-versa.
 * @param Indica o lado (LEFT ou RIGTH) do objeto HTMLSelect da lista dupla.
 * @return LEFT ou RIGTH dependendo do valor passado como parÃ¢metro.
 **/
HTMLDualList.prototype.invertSide = function(side) {
  return (side == "LEFT") ? "RIGHT" : "LEFT";
};

/**
 * Inclui o item (objeto HTMLOption) passado como parÃ¢metro em um Select (objeto HTMLSelect) da lista dupla.
 * @param select Indica o Select (objeto HTMLSelect) em que o item serÃ¡ incluido.
 * @param value Indica o valor da propriedade VALUE do item que serÃ¡ incluÃ­do.
 * @param text Indica o valor da propriedade TEXT do item que serÃ¡ incluÃ­do.
 * @return status Retorna TRUE se o item for adicionado com sucesso e FALSE se n for possÃ­vel adicionar o item.
 **/
HTMLDualList.prototype.includeOption = function(select, value, text, param) {
  var side = this.invertSide(select.getAttribute("SIDE"));
  var status = false;

  if (param == "double") {
    this.invokeEventsDoubleClick(value, text);
    if (!document.hasRuleException) {
      this.addItem(select, value, text);
      status = true;
    }
  } else if (side == "LEFT") {
    // ADD item.
    this.invokeEventsBeforeAdd(value, text, param);
    if (!document.hasRuleException) {
      this.addItem(select, value, text);
      status = true;
    }
    this.invokeEventsAfterAdd(value, text, param);
  } else {
    // REMOVE item.
    this.invokeEventsBeforeRem(value, text, param);
    if (!document.hasRuleException) {
      this.addItem(select, value, text);
      status = true;
    }
    this.invokeEventsAfterRem(value, text, param);
  }

  return status;
};

/**
 * Cria e adiciona um item (objeto HTMLOption) em um Select (objeto HTMLSelect) da lista dupla.
 * @param select Indica o Select (objeto HTMLSelect) em que o item serÃ¡ incluido.
 * @param value Indica o valor da propriedade VALUE do item que serÃ¡ incluÃ­do.
 * @param text Indica o valor da propriedade TEXT do item que serÃ¡ incluÃ­do.
 **/
HTMLDualList.prototype.addItem = function(select, value, text) {
  var side = select.getAttribute("SIDE");
  var option = this.createOption(value, text, side);
  var length = select.options.length;
  select.options[length] = option;
  this.inputOption(value, this.invertSide(side));
};

/**
 * Recebe como parÃ¢metro um valor e um ARRAY e verifica se no mesmo contÃ©m o valor.
 * @return Retorna TRUE se o array contÃ©m o valor, caso contrÃ¡rio FALSE.
 **/
HTMLDualList.prototype.contains = function(array, value) {
  return arrayIndexOf(array, value) >= 0;
};

HTMLDualList.prototype.getInputValue = function(array) {
  var first = true;
  var inputValue = "";

  if (array != null && array.length > 0) {
    for (index = 0; index < array.length; index++) {
      var value = array[index];
      if (first) {
        inputValue = value;
        first = false;
      } else {
        inputValue += ("|" + value);
      }
    }
  }

  return inputValue;
};

/**
 * Armazena em um dois ARRAYS os itens que serÃ£o INCLUÃ�DOS ou DELETADOS da Lista Dupla.
 * @param value Indica o valor da propriedade VALUE do item (objeto HTMLOption).
 * @param side Caso seja igual a LEFT o VALUE do item (objeto HTMLOption) serÃ¡ adicionado ao ARRAY que armazena os valores que serÃ£o DELETADOS.
 * Caso contrÃ¡rio o VALUE do item serÃ¡ adicionado ao ARRAY que armazena os valores que serÃ£o INCLUÃ�DOS.
 **/
HTMLDualList.prototype.inputOption = function(value, side) {
  // Adicionando
  if (side == "LEFT") {
    if (this.contains(this.elementsToRemove, value)) {
      arrayRemove(this.elementsToRemove, value);
    } else {
      this.elementsToAdd.push(value);
    }
  } else {
    if (this.contains(this.elementsToAdd, value)) {
      arrayRemove(this.elementsToAdd, value);
    } else {
      this.elementsToRemove.push(value);
    }
  }

  this.inputInclude.value = this.getInputValue(this.elementsToAdd);
  this.inputDelete.value = this.getInputValue(this.elementsToRemove);
};

HTMLDualList.prototype.deleteOption = function(select, index) {
  // Remove item.
  if (select.options.length > 0) {
    value = select.options[index].value;
    text = select.options[index].text;
    select.options[index] = null;
  }
};

/**
 * ResponsÃ¡vel por desenhar na tela o HTML do componente Lista Dupla.
 * @param doc - documento onde o componente serÃ¡ inserido.
 **/
HTMLDualList.prototype.designComponent = function(doc) {
  var object = this;

  // Ajustar classe da div principal.
  this.div.className += " card fixed-height p-3"; // Bootstrap
  this.divClass = this.div.className;

  this.elementsToAdd = new Array();
  this.elementsToRemove = new Array();

  // Criar div da linha (row).
  this.rowDiv = document.createElement("div");
  this.rowDiv.className = "row no-gutters w-100 h-100 flex-fill"; // Bootstrap
  this.div.appendChild(this.rowDiv);

  // Criar div da coluna da esquerda.
  this.leftColDiv = document.createElement("div");
  this.leftColDiv.className = "col h-100 d-flex flex-column"; // Bootstrap
  this.rowDiv.appendChild(this.leftColDiv);

  // Criar div da coluna do meio.
  this.middleColDiv = document.createElement("div");
  this.middleColDiv.className = "col h-100 mx-3 d-flex flex-column align-items-center justify-content-center flex-nowrap"; // Bootstrap
  this.middleColDiv.style.maxWidth = "1.5rem";
  this.rowDiv.appendChild(this.middleColDiv);

  // Criar div da coluna da direita.
  this.rightColDiv = document.createElement("div");
  this.rightColDiv.className = "col h-100 d-flex flex-column"; // Bootstrap
  this.rowDiv.appendChild(this.rightColDiv);

  // Criar label de descriÃ§Ã£o principal.
  if (this.descPrincipal && this.descPrincipal.length > 0) {
    this.descPrincipalLabel = document.createElement("label");
    this.descPrincipalLabel.className = "text-break mt-0 mb-2 w-100"; // Bootstrap
    this.descPrincipalLabel.innerHTML = this.descPrincipal;
    this.leftColDiv.appendChild(this.descPrincipalLabel);
  }

  // Criar label de descriÃ§Ã£o dos itens selecionados.
  if (this.descSelecionados && this.descSelecionados.length > 0) {
    this.descSelecionadosLabel = document.createElement("label");
    this.descSelecionadosLabel.className = "text-break mt-0 mb-2 w-100"; // Bootstrap
    this.descSelecionadosLabel.innerHTML = this.descSelecionados;
    this.rightColDiv.appendChild(this.descSelecionadosLabel);
  }

  // Definir classe dos botÃµes.
  this.buttonsClass = "generic-btn mb-2"; // Custom - Bootstrap

  // Verificar se o componente tem botÃ£o de adicionar opÃ§Ã£o habilitado.
  if (this.btAddItem) {
    // Criar botÃ£o de adicionar opÃ§Ã£o.
    this.addOptionButton = document.createElement("div");
    this.addOptionButton.className = this.buttonsClass;
    this.addOptionButton.title = getLocaleMessage("LABEL.ADD_ITEM");
    this.addOptionButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
    this.middleColDiv.appendChild(this.addOptionButton);

    var addOptionButtonIcon = document.createElement("i");
    addOptionButtonIcon.className = "fas fa-chevron-right"; // Font Awesome
    this.addOptionButton.appendChild(addOptionButtonIcon);

    // Associar evento ao botÃ£o de adicionar opÃ§Ã£o.
    this.attachEvent(this.addOptionButton, 'click', this.moveOption, this, ["LEFT", "item"]);
  }

  // Verificar se o componente tem botÃ£o de adicionar todas as opÃ§Ãµes habilitado.
  if (this.btAddAll) {
    // Criar botÃ£o de adicionar todas as opÃ§Ãµes.
    this.addAllOptionsButton = document.createElement("div");
    this.addAllOptionsButton.className = this.buttonsClass;
    this.addAllOptionsButton.title = getLocaleMessage("LABEL.ADD_ALL");
    this.addAllOptionsButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
    this.middleColDiv.appendChild(this.addAllOptionsButton);

    var addAllOptionsButtonIcon = document.createElement("i");
    addAllOptionsButtonIcon.className = "fas fa-angle-double-right"; // Font Awesome
    this.addAllOptionsButton.appendChild(addAllOptionsButtonIcon);

    // Associar evento ao botÃ£o de adicionar todas as opÃ§Ãµes.
    this.attachEvent(this.addAllOptionsButton, 'click', this.moveAllOptions, this, ["LEFT", "all"]);
  }

  // Verificar se o componente tem botÃ£o de remover todas as opÃ§Ãµes habilitado.
  if (this.btRemAll) {
    // Criar botÃ£o de remover todas as opÃ§Ãµes.
    this.removeAllOptionsButton = document.createElement("div");
    this.removeAllOptionsButton.className = this.buttonsClass;
    this.removeAllOptionsButton.title = getLocaleMessage("LABEL.REMOVE_ALL");
    this.removeAllOptionsButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
    this.middleColDiv.appendChild(this.removeAllOptionsButton);

    var removeAllOptionsButtonIcon = document.createElement("i");
    removeAllOptionsButtonIcon.className = "fas fa-angle-double-left"; // Font Awesome
    this.removeAllOptionsButton.appendChild(removeAllOptionsButtonIcon);

    // Associar evento ao botÃ£o de remover todas as opÃ§Ãµes.
    this.attachEvent(this.removeAllOptionsButton, 'click', this.moveAllOptions, this, ["RIGHT", "all"]);
  }

  // Verificar se o componente tem botÃ£o de remover opÃ§Ã£o habilitado.
  if (this.btRemItem) {
    // Criar botÃ£o de remover opÃ§Ã£o.
    this.removeOptionButton = document.createElement("div");
    this.removeOptionButton.className = this.buttonsClass;
    this.removeOptionButton.title = getLocaleMessage("LABEL.REMOVE_ITEM");
    this.removeOptionButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
    this.middleColDiv.appendChild(this.removeOptionButton);

    var removeOptionButtonIcon = document.createElement("i");
    removeOptionButtonIcon.className = "fas fa-chevron-left"; // Font Awesome
    this.removeOptionButton.appendChild(removeOptionButtonIcon);

    // Associar evento ao botÃ£o de remover opÃ§Ã£o.
    this.attachEvent(this.removeOptionButton, 'click', this.moveOption, this, ["RIGHT", "item"]);
  }

  // WFRInput
  this.inputInclude = document.createElement("input");
  this.inputInclude.setAttribute("type", "hidden");
  this.inputInclude.id = "WFRInputInclude" + this.code;
  this.inputInclude.name = "WFRInputInclude" + this.code;
  this.div.appendChild(this.inputInclude);

  this.inputDelete = document.createElement("input");
  this.inputDelete.setAttribute("type", "hidden");
  this.inputDelete.id = "WFRInputDelete" + this.code;
  this.inputDelete.name = "WFRInputDelete" + this.code;
  this.div.appendChild(this.inputDelete);

  // Verificar se o componente tem busca.
  if (this.search) {
    // Criar input de pesquisa do lado esquerdo.
    this.leftSearchInput = document.createElement("input");
    this.leftSearchInput.type = "text";
    this.leftSearchInput.className = "form-control mb-2"; // Bootstrap
    this.leftSearchInput.style.fontSize = "0.8rem";
    this.leftSearchInput.disabled = !this.enabled;
    this.leftSearchInput.readOnly = this.readonly;
    this.leftColDiv.appendChild(this.leftSearchInput);

    // Criar select de resultados da pesquisa do lado esquerdo.
    this.leftSearchSelect = this.createSelect("LEFT" + "Results");
    this.leftSearchSelectClass = this.leftSearchSelect.className;
    this.leftSearchSelect.className = "d-none"; // Bootstrap
    this.leftColDiv.appendChild(this.leftSearchSelect);

    // Criar input de pesquisa do lado direito.
    this.rightSearchInput = document.createElement("input");
    this.rightSearchInput.type = "text";
    this.rightSearchInput.className = "form-control mb-2"; // Bootstrap
    this.rightSearchInput.style.fontSize = "0.8rem";
    this.rightSearchInput.disabled = !this.enabled;
    this.rightSearchInput.readOnly = this.readonly;
    this.rightColDiv.appendChild(this.rightSearchInput);

    // Criar select de resultados da pesquisa do lado direito.
    this.rightSearchSelect = this.createSelect("RIGHT" + "Results");
    this.rightSearchSelectClass = this.rightSearchSelect.className;
    this.rightSearchSelect.className = "d-none"; // Bootstrap
    this.rightColDiv.appendChild(this.rightSearchSelect);

    // Associar eventos aos inputs de pesquisa.
    this.attachEvent(this.leftSearchInput, "input", function() {
      object.searchOption("LEFT", object.leftSearchInput.value);
    });

    this.attachEvent(this.rightSearchInput, "input", function() {
      object.searchOption("RIGHT", object.rightSearchInput.value);
    });
  }

  // Criar select do lado esquerdo.
  this.leftSelect = this.createSelect("LEFT");
  this.leftSelectClass = this.leftSelect.className;
  this.setOptions(this.leftSelect, this.labels, this.values);
  this.leftColDiv.appendChild(this.leftSelect);

  // Criar select do lado direito.
  this.rightSelect = this.createSelect("RIGHT");
  this.rightSelectClass = this.rightSelect.className;
  this.setOptions(this.rightSelect, this.labelsRIGHT, this.valuesRIGHT);
  this.rightColDiv.appendChild(this.rightSelect);
};

/**
 * ResponsÃ¡vel por criar os Select's (objeto HTMLSelect) da lista dupla.
 * @param side Indica o lado do Select. LEFT ou RIGTH.
 * @return select objeto HTMLSelect.
 **/
HTMLDualList.prototype.createSelect = function(side) {
  var select = document.createElement("select");
  var selectId = "WFRInput" + side + this.code;
  select.id = selectId;
  select.name = selectId;
  select.disabled = !this.enabled;
  select.readOnly = this.readonly;
  select.className = "form-control w-100 h-100 flex-fill"; // Bootstrap
  select.setAttribute("side", side);
  select.setAttribute("multiple", "multiple");

  // DecoraÃ§Ã£o
  this.setDecorationObject(select);
  if (this.descPrincipalLabel) this.setDecorationLabelPrincipal(this.descPrincipalLabel);
  if (this.descSelecionadosLabel) this.setDecorationLabelSelecionados(this.descSelecionadosLabel);

  // Eventos
  if (this.duploClicar) this.attachEvent(select, "dblclick", this.doubleClickAction, this, [side]);
  if (this.tabable) this.attachEvent(select, "keypress", this.selectKeyPressAction, this, [side]);

  return select;
};

/**
 * ObtÃ©m dois arrays com os labels e valores do select em um lado da lista dupla.
 * @param side Lado da lista dupla para obter os arrays.
 **/
HTMLDualList.prototype.getOptionsArrays = function(side) {
  var labels = [], values = [];
  var selectElement = (side == "LEFT") ? this.leftSelect : this.rightSelect;

  for (var i = 0; i < selectElement.children.length; i++) {
    var item = selectElement.children[i];
    labels.push(item.innerHTML);
    values.push(item.value);
  }

  return {
    labels: labels,
    values: values
  };
};

/**
 * Procura por um item em um dos lados da lista dupla.
 * @param side Lado da lista dupla para procurar pelo item.
 * @param query DescriÃ§Ã£o do item pra procurar.
 **/
HTMLDualList.prototype.searchOption = function(side, query) {
  // Obter os arrays de labels e valores do select no lado especificado.
  var arrays = this.getOptionsArrays(side);

  if (side == "LEFT") {
    // Limpar lista de resultados.
    this.leftSearchSelect.innerHTML = "";
    this.leftSearching = false;

    if (query && query.trim().length > 0) {
      this.leftSearching = true;

      // Esconder a lista padrÃ£o e mostrar a lista de resultados.
      this.leftSelect.className = "d-none"; // Bootstrap
      this.leftSearchSelect.className = this.leftSearchSelectClass;

      // Exibir opÃ§Ãµes que contenham o texto digitado na lista de resultados.
      this.setOptions(this.leftSearchSelect, arrays.labels, arrays.values, query);
    } else {
      // Esconder a lista de resultados e mostrar a lista padrÃ£o.
      this.leftSelect.className = this.leftSelectClass;
      this.leftSearchSelect.className = "d-none"; // Bootstrap
    }
  } else if (side == "RIGHT") {
    // Limpar lista de resultados.
    this.rightSearchSelect.innerHTML = "";
    this.rightSearching = false;

    if (query && query.trim().length > 0) {
      this.rightSearching = true;

      // Esconder a lista padrÃ£o e mostrar a lista de resultados.
      this.rightSelect.className = "d-none"; // Bootstrap
      this.rightSearchSelect.className = this.rightSearchSelectClass;

      // Exibir opÃ§Ãµes que contenham o texto digitado na lista de resultados.
      this.setOptions(this.rightSearchSelect, arrays.labels, arrays.values, query);
    } else {
      // Esconder a lista de resultados e mostrar a lista padrÃ£o.
      this.rightSelect.className = this.rightSelectClass;
      this.rightSearchSelect.className = "d-none"; // Bootstrap
    }
  }
};

/**
 * Cria os procedimentos para os eventos keypress (TAB, SHIFT+TAB, Ctrl+A e Enter)
 * @param select Indica o objeto HTMLSelect.
 * @param side Indica o lado do Select.
 **/
HTMLDualList.prototype.selectKeyPressAction = function(evt, side) {
  var altKey = false;
  var ctrlKey = false;
  var shiftKey = false;
  var target = evt.target || evt.srcElement;
  var keyCode = evt.keyCode || evt.which;
  var chr = String.fromCharCode(keyCode).toUpperCase();

  if (w3c) {
    if (document.layers) {
      altKey = ((evt.modifiers & Event.ALT_MASK) > 0);
      ctrlKey = ((evt.modifiers & Event.CONTROL_MASK) > 0);
      shiftKey = ((evt.modifiers & Event.SHIFT_MASK) > 0);
    } else {
      altKey = evt.altKey;
      ctrlKey = evt.ctrlKey;
      shiftKey = evt.shiftKey;
    }
  } else {
    altKey = evt.altKey;
    ctrlKey = evt.ctrlKey;
    shiftKey = evt.shiftKey;
  }

  var r = true;
  if (!shiftKey && keyCode == 9) { // TAB
    r = false;
    if (side == "LEFT") {
      this.rightSelect.focus();
    } else {
      controller.next(this);
    }
  } else if (shiftKey && keyCode == 9) { // Shif + TAB
    r = false;
    if (side == "LEFT") {
      controller.focusFirst();
    } else {
      this.leftSelect.focus();
    }
  } else if (!this.readonly && !altKey && ctrlKey && (chr == 'A')) { // Ctrl
    // + A:
    // Selecionar
    // todos.
    r = false;
    this.selectAll(target);
  } else if (!this.readonly && keyCode == 13) { // Enter.
    r = false;
    this.moveOption(target, evt, side, "enter");
  }

  if (!r) {
    document.disableEvents = true;
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      evt.keyCode = 0;
      evt.returnValue = false;
    }
    return false;
  } else return true;
};

/**
 * Seleciona todos os itens que contÃ©m no Select (objeto HTMLSelect) da lista dupla.
 * @param select Indica o Select (objeto HTMLSelect) que terÃ¡ todos os itens selecionados.
 **/
HTMLDualList.prototype.selectAll = function(select) {
  for (var i = 0; i < select.options.length; i++) {
    select.options[i].selected = true;
  }
};

/**
 * Seta o style dos itens do Select.
 * @param obj Indica o objeto HTMLSelect da lista dupla.
 **/
HTMLDualList.prototype.setDecorationObject = function(obj) {
  if (this.font) obj.style.fontFamily = this.font;
  if (this.size) obj.style.fontSize = this.size;
  if (this.weight) obj.style.fontWeight = "bold";
  if (this.italic) obj.style.fontStyle = "italic";

  var textDecoration = "";
  if (this.underline || this.strikeout) {
    if (this.underline) textDecoration += "underline";
    if (this.strikeout) textDecoration += " line-through";
  } else textDecoration = "none";
  obj.style.textDecoration = textDecoration;

  if (this.color) {
    obj.style.color = this.color;
  }
};

/**
 * Seta o style do label Descricao PRINCIPAL.
 * @param obj cÃ©lula <TD>.
 **/
HTMLDualList.prototype.setDecorationLabelPrincipal = function(obj) {
  if (this.fontPrincipal) obj.style.fontFamily = this.fontPrincipal;
  if (this.sizePrincipal) obj.style.fontSize = this.sizePrincipal;
  if (this.weightPrincipal) obj.style.fontWeight = "bold";
  if (this.italicPrincipal) obj.style.fontStyle = "italic";

  var textDecoration = "";
  if (this.underlinePrincipal || this.strikeoutPrincipal) {
    if (this.underlinePrincipal) textDecoration += "underline";
    if (this.strikeoutPrincipal) textDecoration += " line-through";
  } else textDecoration = "none";
  obj.style.textDecoration = textDecoration;

  if (this.colorPrincipal) {
    obj.style.color = this.colorPrincipal;
  }
};

/**
 * Seta o style do label Descricao SELECIONADOS.
 * @param obj cÃ©lula <TD>.
 **/
HTMLDualList.prototype.setDecorationLabelSelecionados = function(obj) {
  if (this.fontSelecionados) obj.style.fontFamily = this.fontSelecionados;
  if (this.sizeSelecionados) obj.style.fontSize = this.sizeSelecionados;
  if (this.weightSelecionados) obj.style.fontWeight = "bold";
  if (this.italicSelecionados) obj.style.fontStyle = "italic";

  var textDecoration = "";
  if (this.underlineSelecionados || this.strikeoutSelecionados) {
    if (this.underlineSelecionados) textDecoration += "underline";
    if (this.strikeoutSelecionados) textDecoration += " line-through";
  } else textDecoration = "none";
  obj.style.textDecoration = textDecoration;

  if (this.colorSelecionados) {
    obj.style.color = this.colorSelecionados;
  }
};

/**
 * Seta as propriedades do style do objeto do label PRINCIPAL (objeto <TD>).
 * @param f Indica o tipo da fonte.
 * @param s Indica o tamanho da fonte.
 * @param w Indica a largura da fonte.
 * @param i Indica se a fonte sera Italico.
 * @param u Indica se a fonte serÃ¡ Sublinhado.
 * @param st Indica se a fonte serÃ¡ Tachado.
 * @param c Indica a cor da fonte.
 **/
HTMLDualList.prototype.setDecorationDescriptionLEFT = function(f, s, w, i, u, st, c) {
  this.fontPrincipal = f;
  this.sizePrincipal = s;
  this.weightPrincipal = w;
  this.italicPrincipal = i;
  this.underlinePrincipal = u;
  this.strikeoutPrincipal = st;
  this.colorPrincipal = c;
};

/**
 * Seta as propriedades do style do label SELECIONADOS (objeto <TD>).
 * @param f Indica o tipo da fonte.
 * @param s Indica o tamanho da fonte.
 * @param w Indica a largura da fonte.
 * @param i Indica se a fonte sera Italico.
 * @param u Indica se a fonte serÃ¡ Sublinhado.
 * @param st Indica se a fonte serÃ¡ Tachado.
 * @param c Indica a cor da fonte.
 **/
HTMLDualList.prototype.setDecorationDescriptionRIGHT = function(f, s, w, i, u, st, c) {
  this.fontSelecionados = f;
  this.sizeSelecionados = s;
  this.weightSelecionados = w;
  this.italicSelecionados = i;
  this.underlineSelecionados = u;
  this.strikeoutSelecionados = st;
  this.colorSelecionados = c;
};

/**
 * Chama a function 'moveOption' quando o evento 'dblClick' for disparado.
 * @param side Indica o lado da lista dupla onde o evento foi disparado.
 **/
HTMLDualList.prototype.doubleClickAction = function(target, side) {
  // Ao duplo clicar
  if (!d.n.visible || edit || insert) {
    this.moveOption(target, side, "double");
  }
};

/**
 * Checa se o Select (objeto HTMLSelect)  nulo ou 'undefined'.
 * @param select Indica o objeto HTMLSelect.
 **/
HTMLDualList.prototype.validateSelect = function(select) {
  if (select == null || (typeof select == "undefined")) {
    throw "Undefined " + this.name + ".";
  }
};

/**
 * Retorna o objeto HTMLOption criado.
 * @param value Indica o valor da propriedade VALUE do objeto.
 * @param text Indica o valor da propriedade TEXT do objeto.
 * @param side Lado da lista dupla que o item serÃ¡ associado.
 * @param query Texto para ser destacado.
 * @return Retorna o HTMLOption.
 **/
HTMLDualList.prototype.createOption = function(value, text, side, query) {
  var formattedText = replaceAll(replaceAll(text, '>', '&gt;'), '<', '&lt;');
  if (query) {
    var queryIndex = text.toLowerCase().indexOf(query);
    formattedText = text.substring(0, queryIndex) + "<b>" + text.substring(queryIndex, queryIndex + query.length) + "</b>" +
      text.substring(queryIndex + query.length, text.length);
  }

  var option = document.createElement("option");
  option.className = "p-1"; // Bootstrap
  option.value = value;
  option.innerHTML = formattedText;
  option.title = text;
  return option;
};

/**
 * Cria e adiciona os itens (objetos HTMLOption) ao Select (objeto HTMLSelect).
 * @param select Objeto Select onde serÃ£o inseridos os Options.
 * @param labels Indica uma lista de valores que representa os valores da propriedade TEXT de cada HTMLOption que serÃ¡ criado.
 * @param values Indica uma lista de valores que represanta os valores da propriedade VALUE de cada HTMLOption que serÃ¡ criado.
 * @param query Texto para ser procurado nos itens (opcional);
 **/
HTMLDualList.prototype.setOptions = function(select, labels, values, query) {
  this.validateSelect(select);
  if (query && query.length > 0) query = query.trim().toLowerCase();
  for (var i = 0; i < values.length; i++) {
    if (!query || query.length == 0 || labels[i].trim().toLowerCase().indexOf(query) != -1) {
      select.appendChild(this.createOption(values[i], labels[i], select.getAttribute("SIDE"), query));
    }
  }
};

/**
 * Seta o ReadOnly do componente.
 * @param v - TRUE indica que o componente serÃ¡ somente leitura e os eventos 'ondblClick' e 'onfocus' sÃ£o removidos.
 **/
HTMLDualList.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);

  if (this.leftSelect) this.leftSelect.readOnly = this.readonly;
  if (this.rightSelect) this.rightSelect.readOnly = this.readonly;

  if (this.leftSearchSelect) this.leftSearchSelect.readOnly = this.readonly;
  if (this.rightSearchSelect) this.rightSearchSelect.readOnly = this.readonly;

  if (this.leftSearchInput) this.leftSearchInput.readOnly = this.readonly;
  if (this.rightSearchInput) this.rightSearchInput.readOnly = this.readonly;
};

/**
 * Seta a propriedade Enabled da lista dupla. Indica se o componente serÃ¡ habilitado ou nÃ£o.
 * @param enable - FALSE desabilita os Select's (objeto HTMLSelect) e os botÃµes. TambÃ©m remove os oventos 'dblclick' e 'onfocus' dos mesmos.
 **/
HTMLDualList.prototype.setEnabled = function(enable) {
  this.callMethod(HTMLElementBase, "setEnabled", [enable]);

  if (this.leftSelect) this.leftSelect.disabled = !this.enabled;
  if (this.rightSelect) this.rightSelect.disabled = !this.enabled;

  if (this.leftSearchSelect) this.leftSearchSelect.disabled = !this.enabled;
  if (this.rightSearchSelect) this.rightSearchSelect.disabled = !this.enabled;

  if (this.leftSearchInput) this.leftSearchInput.disabled = !this.enabled;
  if (this.rightSearchInput) this.rightSearchInput.disabled = !this.enabled;

  if (this.addOptionButton) this.addOptionButton.className = this.buttonsClass + (this.enabled ? "" : " disabled");
  if (this.addAllOptionsButton) this.addAllOptionsButton.className = this.buttonsClass + (this.enabled ? "" : " disabled");
  if (this.removeAllOptionsButton) this.removeAllOptionsButton.className = this.buttonsClass + (this.enabled ? "" : " disabled");
  if (this.removeOptionButton) this.removeOptionButton.className = this.buttonsClass + (this.enabled ? "" : " disabled");
};

/**
 * Evento onFocus do componente.
 **/
HTMLDualList.prototype.focus = function() {
  if (this.enabled && this.visible && (!this.readonly)) {
    if (isVisibleDiv(this.leftSelect)) this.leftSelect.focus();
    return true;
  }

  return false;
}

/**
 * Limpa os objetos (HTMLInput) que armazenam os valores que serÃ£o INCLUÃ�DOS ou EXCLUÃ�DOS a cada navegaÃ§Ã£o da pÃ¡gina.
 **/
HTMLDualList.prototype.clearInput = function() {
  this.elementsToAdd = new Array();
  this.elementsToRemove = new Array();
  if (this.inputInclude) this.inputInclude.value = '';
  if (this.inputDelete) this.inputDelete.value = '';
};

/**
 * Limpa os Select (objetos HTMLSelect), antes de preenchÃª-los, a cada navegaÃ§Ã£o da pÃ¡gina.
 **/
HTMLDualList.prototype.clearBoth = function() {
  this.oldLeftSelect = this.backup(this.leftSelect);
  this.oldRightSelect = this.backup(this.rightSelect);

  this.clear(this.leftSelect);
  this.clear(this.rightSelect);
};

HTMLDualList.prototype.backup = function(select) {
  this.validateSelect(select);
  var selectSaved = new Array();
  for (var i = select.options.length - 1; i >= 0; i--)
    selectSaved.push(select.options[i].value);
  return selectSaved;
};

/**
 * Limpa os Select (objetos HTMLSelect).
 * @param select Indica o objeto HTMLSelect.
 **/
HTMLDualList.prototype.clear = function(select) {
  this.validateSelect(select);
  for (var i = select.options.length - 1; i >= 0; i--) {
    select.options[i] = null;
  }
};

/**
 * Executa o Evento 'Ao Duplo Clicar' do componente.
 * @param value Indica o Campo CHAVE do item (objeto HTMLOption).
 * @param text Indica o Campo LISTA do item (objeto HTMLOption).
 **/
HTMLDualList.prototype.invokeEventsDoubleClick = function(value, text) {
  if (this.ondblclick) this.ondblclick(value, text);
};

/**
 * Executa o Evento 'Antes de Adicionar' do componente.
 * @param value Indica o Campo CHAVE do item (objeto HTMLOption).
 * @param text Indica o Campo LISTA do item (objeto HTMLOption).
 * @param param - 'all' chama o evento 'Antes de Adicionar Todos', caso 'item' executa o evento 'Antes de Adicionar Item'.
 **/
HTMLDualList.prototype.invokeEventsBeforeAdd = function(value, text, param, movingAll) {
  if ((param == "item" || param == "enter") && this.onBeforeAddItem) {
    this.onBeforeAddItem(value, text);
  }
};

HTMLDualList.prototype.invokeEventsBeforeAddAll = function() {
  if (this.onBeforeAddAll) {
    this.onBeforeAddAll();
    return !document.hasRuleException;
  }

  return true;
};

/**
 * Executa o Evento 'Depois de Adicionar' do componente.
 * @param value Indica o Campo CHAVE do item (objeto HTMLOption).
 * @param text Indica o Campo LISTA do item (objeto HTMLOption).
 * @param param - 'all' chama o evento 'Depois de Adicionar Todos', caso 'item' executa o evento 'Depois de Adicionar Item'.
 **/
HTMLDualList.prototype.invokeEventsAfterAdd = function(value, text, param) {
  if ((param == "item" || param == "enter") && this.onAfterAddItem) {
    this.onAfterAddItem(value, text);
  }
};

HTMLDualList.prototype.invokeEventsAfterAddAll = function() {
  if (this.onAfterAddAll) {
    this.onAfterAddAll();
    return !document.hasRuleException;
  }

  return true;
};

/**
 * Executa o Evento 'Antes de Remover' do componente.
 * @param value Indica o Campo CHAVE do item (objeto HTMLOption).
 * @param text Indica o Campo LISTA do item (objeto HTMLOption).
 * @param param - 'all' chama o evento 'Antes de Remover Todos', caso 'item' executa o evento 'Antes de Remover Item'.
 **/
HTMLDualList.prototype.invokeEventsBeforeRem = function(value, text, param) {
  if ((param == "item" || param == "enter") && this.onBeforeRemItem) {
    this.onBeforeRemItem(value, text);
  }
};

HTMLDualList.prototype.invokeEventsBeforeRemAll = function() {
  if (this.onBeforeRemAll) {
    this.onBeforeRemAll();
    return !document.hasRuleException;
  }

  return true;
};

/**
 * Executa o Evento 'Depois de Remover' do componente.
 * @param value Indica o Campo CHAVE do item (objeto HTMLOption).
 * @param text Indica o Campo LISTA do item (objeto HTMLOption).
 * @param param - 'all' chama o evento 'Depois de Remover Todos', caso 'item' executa o evento 'Depois de Remover Item'.
 **/
HTMLDualList.prototype.invokeEventsAfterRem = function(value, text, param) {
  if ((param == "item" || param == "enter") && this.onAfterRemItem) {
    this.onAfterRemItem(value, text);
  }
};

HTMLDualList.prototype.invokeEventsAfterRemAll = function() {
  if (this.onAfterRemAll) {
    this.onAfterRemAll();
    return !document.hasRuleException;
  }

  return true;
};

HTMLDualList.prototype.getPermissionDescription = function() {
  var componentDescription = !isNullable(this.descPrincipal) ? this.descPrincipal : (this.code + " - " + this.id);
  if (!isNullable(this.descSelecionados)) componentDescription += (" / " + this.descSelecionados);
  return componentDescription;
};

HTMLDualList.prototype.flush = function() {
  var i;
  if (this.oldLeftSelect && this.oldLeftSelect.options) {
    for (i = this.oldLeftSelect.options.length - 1; i >= 0; i--) this.oldLeftSelect.options[i] = null;
    this.oldLeftSelect = null;
  }

  if (this.oldRightSelect && this.oldRightSelect.options) {
    for (i = this.oldRightSelect.options.length - 1; i >= 0; i--) this.oldRightSelect.options[i] = null;
    this.oldRightSelect = null;
  }

  if (this.leftSelect && this.leftSelect.options) {
    for (i = this.leftSelect.options.length - 1; i >= 0; i--) this.leftSelect.options[i] = null;
    this.leftSelect = null;
  }

  if (this.rightSelect && this.rightSelect.options) {
    for (i = this.rightSelect.options.length - 1; i >= 0; i--) this.rightSelect.options[i] = null;
    this.rightSelect = null;
  }

  this.img = null;
  this.inputInclude = null;
  this.inputDelete = null;
  this.elementsToAdd = null;
  this.elementsToRemove = null;
  this.duallist = null;
  this.divWFRComponentRIGHT = null;
  this.divWFRComponentLEFT = null;
  this.labels = null;
  this.values = null;
  this.labelsRIGHT = null;
  this.valuesRIGHT = null;
  this.callMethod(HTMLElementBase, "flush");
};
