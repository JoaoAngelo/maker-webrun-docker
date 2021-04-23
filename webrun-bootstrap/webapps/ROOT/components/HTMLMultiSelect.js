/**
 * Método construtor do HTMLMultiSelect. Responsável por criar o componente MultiSelect.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente.
 **/
function HTMLMultiSelect(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);

  this.values = [];
  this.keys = [];

  this.selected = [];
  this.options = [];

  this.isDropdownOpen = false;
}

/**
 * Herança do objeto.
 **/
HTMLMultiSelect.inherits(HTMLComboBox);

/**
 * Setando propriedades do componente.
 **/
HTMLMultiSelect.prototype.name = 'HTMLMultiSelect';
HTMLMultiSelect.prototype.tabable = true;

/**
 * Muda o item selecionado da lista.
 * @param value - Texto exibido pelo item.
 **/
HTMLMultiSelect.prototype.setValue = function(value, checkDependences) {
  // Tratar valor
  if (value !== undefined && value !== null && typeof value === 'string') value = value.trim();
  if (value && value.length > 0) {
    if (value.indexOf(",") != -1) {
      // Resetar variável de itens selecionados.
      this.selected = [];

      // O valor possui mais de um item selecionado.
      var items = value.split(",");
      for (var i = 0; i < items.length; i++) {
        this.selected.push(items[i].trim());
      }
    } else {
      // O valor possui somente um item selecionado.
      this.selected = [value.trim()];
    }
  } else {
    // Nenhum item selecionado.
    this.selected = [];
  }

  // Atualizar valor do campo.
  this.hidden.setValue(value);

  // Atualizar input e chamar eventos.
  this.updateLayout();
};

/**
 * Responsável por desenhar o HTML do componente MultiSelect.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLMultiSelect.prototype.designComponent = function(doc) {
  // Definir a classe dropdown na div principal do componente.
  this.div.className += " dropdown"; // Bootstrap
  this.divClass = this.div.className;

  // Obter as propriedades do elemento.
  if (this.Lista && this.Lista.length && this.Lista.length > 0) {
    var rawValues = this.Lista.trim();
    if (rawValues.indexOf("\n") != -1) {
      // Resetar variável de valores.
      this.values = [];

      // A lista possui mais de uma opção, devemos dar split.
      var tvalues = rawValues.split("\n");
      for (var i = 0; i < tvalues.length; i++) {
        this.values.push(tvalues[i].trim());
      }
    } else {
      // A lista possui somente uma opção.
      this.values = [rawValues];
    }
  }

  if (this.Valores && this.Valores.length && this.Valores.length > 0) {
    var rawKeys = this.Valores.trim();
    if (rawKeys.indexOf("\n") != -1) {
      // Resetar variável de chaves.
      this.keys = [];

      // A lista possui mais de uma opção, devemos dar split.
      var tkeys = rawKeys.split("\n");
      for (var i = 0; i < tkeys.length; i++) {
        this.keys.push(tkeys[i].trim());
      }
    } else {
      // A lista possui somente uma opção.
      this.keys = [rawKeys];
    }
  }

  // Desenhar a combo box.
  this.callMethod(HTMLComboBox, "designComponent", [doc]);

  // Definir a opção que receberá o valor.
  if (this.placeholderOption) {
    this.placeholderOption.setAttribute("hidden", "hidden");
    this.valueOption = document.createElement("option");
    this.valueOption.value = this.value ? this.value : "";
    this.input.insertBefore(this.valueOption, this.placeholderOption);
  } else {
    this.valueOption = this.emptyOption;
    this.valueOption.value = this.value ? this.value : "";
  }

  // Criar menu dropdown da lista.
  this.dropdownMenu = document.createElement("div");
  this.dropdownMenu.className = "dropdown-menu"; // Bootstrap
  this.dropdownMenu.style.zIndex = this.div.style.zIndex;
  this.dropdownMenuClass = this.dropdownMenu.className;
  this.div.appendChild(this.dropdownMenu);

  // Adicionar as opções ao dropdown.
  if (this.keys && this.keys.length > 0) {
    for (var i = 0; i < this.keys.length; i++) {
      this.designDropdownItem(i, this.keys[i], this.values[i]);
    }
  }

  // Definir toggle dropdown no input e ajeitar ids.
  if (!this.input.id || this.input.id.length == 0) this.input.id = "multiselect-" + this.code;
  if (!this.div.id || this.div.id.length == 0) this.div.id = this.id;
  this.dropdownMenu.setAttribute("aria-labelledby", this.input.id);
  this.input.setAttribute("data-toggle", "dropdown"); // Bootstrap
  this.input.setAttribute("aria-haspopup", "true"); // Accessibility
  this.input.setAttribute("aria-expanded", "false"); // Accessibility

  // Remover aparência do input.
  this.input.style.setProperty("-webkit-appearance", "none");
  this.input.style.setProperty("-moz-appearance", "none");
  this.input.style.setProperty("appearance", "none");

  // Associar eventos ao input.
  this.attachEvent(this.input, 'mousedown', this.mouseDownAction);

  // Associar evento de tecla ao div.
  this.attachEvent(this.div, 'keydown', this.keydownAction);

  // Associar eventos ao dropdown.
  var object = this;

  $(this.div).on('show.bs.dropdown', function() {
    object.dropdownMenu.style.width = object.div.offsetWidth + "px";
    object.isDropdownOpen = true;
    object.div.style.setProperty("z-index", 999991);
  });

  $(this.div).on('hide.bs.dropdown', function() {
    object.dropdownMenu.style.width = object.div.offsetWidth + "px";
    object.isDropdownOpen = false;
    object.lastFocusedOption = null;
    object.div.style.setProperty("z-index", object.zIndex ? object.zIndex : 2);
  });
};

/**
 * Responsável por desenhar o HTML da opção no menu dropdown.
 * @param i - Índice da opção.
 * @param key - Valor da opção.
 * @param value - Texto que será exibido.
 **/
HTMLMultiSelect.prototype.designDropdownItem = function(i, key, value) {
  // Criar a div do item no menu dropdown.
  var dropdownMenuItem = document.createElement("div");
  dropdownMenuItem.className = "dropdown-item"; // Bootstrap
  dropdownMenuItem.setAttribute("data-value", key); // Custom
  this.dropdownMenu.appendChild(dropdownMenuItem);

  // Criar div base da checkbox do Bootstrap.
  var checkboxId = "option-check" + this.code + "-" + i;
  var itemCheckbox = document.createElement("div");
  itemCheckbox.className = "custom-control custom-checkbox w-100"; // Bootstrap
  dropdownMenuItem.appendChild(itemCheckbox);

  // Criar o input da checkbox do item.
  var itemCheckboxInput = document.createElement("input");
  itemCheckboxInput.type = "checkbox";
  itemCheckboxInput.className = "custom-control-input"; // Bootstrap
  itemCheckboxInput.id = checkboxId;
  itemCheckbox.appendChild(itemCheckboxInput);

  // Associar evento de tecla ao checkbox do item do menu dropdown.
  this.attachEvent(itemCheckboxInput, 'keydown', this.keydownAction);

  // Criar a label da checkbox do item.
  var itemCheckboxLabel = document.createElement("label");
  itemCheckboxLabel.className = "custom-control-label w-100"; // Bootstrap
  itemCheckboxLabel.setAttribute("for", checkboxId);
  itemCheckboxLabel.style.overflow = "visible";
  itemCheckboxLabel.innerHTML = replaceAll(replaceAll(value, '>', '&gt;'), '<', '&lt;');
  itemCheckbox.appendChild(itemCheckboxLabel);

  // Associar eventos a checkbox.
  var object = this;
  dropdownMenuItem.onclick = function(e) {
    e.stopPropagation();
    e.preventDefault();
    itemCheckboxInput.click();
  };

  itemCheckboxLabel.onclick = function(e) { e.stopPropagation(); };
  itemCheckbox.onclick = function(e) { e.stopPropagation(); };
  itemCheckboxInput.onchange = function(e) {
    if (e.target.checked) object.selectOption(key);
    else object.unselectOption(key);
  };

  itemCheckboxInput.onfocus = function() {
    object.lastFocusedOption = i;
  };

  // Adicionar item a lista de opções.
  this.options.push({
    key: key,
    checkbox: itemCheckboxInput
  });
};

/**
 * Executa o evento onclick do componente.
 **/
HTMLMultiSelect.prototype.click = function() {
  if (this.div.onclick) this.div.onclick.call(this);
};

/**
 * Ocorre ao clicar numa tecla no elemento.
 **/
HTMLMultiSelect.prototype.keydownAction = function(e) {
  e.preventDefault();
  e.stopPropagation();

  this.callMethod(HTMLElementBase, "keydownAction", [e]);

  // Ao clicar a tecla espaço o menu de opções do próprio select é aberto.
  // Devemos impedir que esse menu seja aberto e abrir o personalizado.
  if (e.which === 32 || e.code === "Space") {
    if (isFirefox) {
      var object = this;
      this.input.disabled = true;
      setTimeout(function() {
        object.input.disabled = false;
        object.input.click();
      }, 0);
    } else {
      this.input.click();
    }
  } else if (e.which === 40 || e.code === "ArrowDown" ||
             e.which === 39 || e.code === "ArrowRight" ||
             e.which === 34 || e.code === "PageDown") {
    if (isFirefox) {
      var object = this;
      this.input.disabled = true;
      setTimeout(function() {
        object.input.disabled = false;
        object.focusNextOption();
      }, 0);
    } else {
      this.focusNextOption();
    }
  } else if (e.which === 37 || e.code === "ArrowLeft" ||
             e.which === 38 || e.code === "ArrowUp" ||
             e.which === 33 || e.code === "PageUp") {
    if (isFirefox) {
      var object = this;
      this.input.disabled = true;
      setTimeout(function() {
        object.input.disabled = false;
        object.focusPreviousOption();
      }, 0);
    } else {
      this.focusPreviousOption();
    }
  } else if (e.which === 36 || e.code === "Home") {
    this.focusFirstOption();
  } else if (e.which === 35 || e.code === "End") {
    this.focusLastOption();
  } else if (e.which === 13 || e.code === "Enter") {
    if (this.isDropdownOpen) {
      if (e.shiftKey) {
        this.toggleAllOptions();
      } else {
        this.toggleFocusedOption();
      }
    } else {
      this.openDropdown();
    }
  } else if (e.which === 27 || e.code === "Escape") {
    this.closeDropdown();
  }
};

/**
 * Foca na próxima opção da lista.
 **/
HTMLMultiSelect.prototype.focusNextOption = function() {
  if (this.options == null || this.options.length == 0) return false;
  this.openDropdown();

  if (this.lastFocusedOption === undefined || this.lastFocusedOption === null ||
      this.lastFocusedOption >= this.options.length - 1) {
    this.lastFocusedOption = 0;
  } else {
    this.lastFocusedOption++;
  }

  try {
    this.options[this.lastFocusedOption].checkbox.focus();
  } catch (e) { }
};

/**
 * Foca na opção anterior da lista.
 **/
HTMLMultiSelect.prototype.focusPreviousOption = function() {
  if (this.options == null || this.options.length == 0) return false;
  this.openDropdown();

  if (this.lastFocusedOption === undefined || this.lastFocusedOption === null ||
      this.lastFocusedOption <= 0) {
    this.lastFocusedOption = this.options.length - 1;
  } else {
    this.lastFocusedOption--;
  }

  try {
    this.options[this.lastFocusedOption].checkbox.focus();
  } catch (e) { }
};

/**
 * Foca na primeira opção da lista.
 **/
HTMLMultiSelect.prototype.focusFirstOption = function() {
  if (this.options == null || this.options.length == 0) return false;
  this.openDropdown();
  this.lastFocusedOption = 0;

  try {
    if (this.lastFocusedOption !== undefined && this.lastFocusedOption !== null) {
      this.options[this.lastFocusedOption].checkbox.focus();
    }
  } catch (e) { }
};

/**
 * Foca na última opção da lista.
 **/
HTMLMultiSelect.prototype.focusLastOption = function() {
  if (this.options == null || this.options.length == 0) return false;
  this.openDropdown();
  this.lastFocusedOption = this.options.length - 1;

  try {
    this.options[this.lastFocusedOption].checkbox.focus();
  } catch (e) { }
};

/**
 * Clica na opção em foco da lista.
 **/
HTMLMultiSelect.prototype.toggleFocusedOption = function() {
  if (this.options == null || this.options.length == 0) return false;
  try {
    this.options[this.lastFocusedOption].checkbox.click();
  } catch (e) { }
};

/**
 * Clica em todas opções da lista.
 **/
HTMLMultiSelect.prototype.toggleAllOptions = function() {
  if (this.options == null || this.options.length == 0) return false;
  try {
    for (var i = 0; i < this.options.length; i++) {
      this.options[i].checkbox.click();
    }
  } catch (e) { }
};

/**
 * Abre o dropdown do componente.
 **/
HTMLMultiSelect.prototype.openDropdown = function() {
  if (this.input) bootstrapOpenDropdown(this.input);
};

/**
 * Fecha o dropdown do componente.
 **/
HTMLMultiSelect.prototype.closeDropdown = function() {
  if (this.input) bootstrapCloseDropdown(this.input);
};

/**
 * Ocorre ao clicar no elemento.
 **/
HTMLMultiSelect.prototype.mouseDownAction = function(e, o) {
  e.preventDefault();
};

/**
 * Ocorre quando o valor da ComboBox é alterado.
 * Como a alteração de valores é lidado de forma diferente para esse componente,
 * a alteração de valores através da ComboBox é desnecessária e pode causar bugs.
 **/
HTMLMultiSelect.prototype.changeAction = function(e, o, dontCheckDependences) {
  if (e) e.preventDefault();
};

/**
 * Ocorre quando um item é adicionado a lista.
 * @param key - Valor da opção.
 * @param value - Texto que será exibido.
 **/
HTMLMultiSelect.prototype.itemAddedAction = function(key, value) {
  this.callMethod(HTMLComboBox, "itemAddedAction", [key, value]);
};

/**
 * Ocorre quando um item é removido da lista.
 * @param key - Valor da opção.
 * @param value - Texto que será exibido.
 **/
HTMLMultiSelect.prototype.itemRemovedAction = function(key, value) {
  this.callMethod(HTMLComboBox, "itemRemovedAction", [key, value]);
};

/**
 * Atualiza o layout do MultiSelect.
 **/
HTMLMultiSelect.prototype.updateLayout = function() {
  if (this.selected.length > 0) {
    // Montar a tag value da option e o seu conteúdo.
    var value = "", text = "";
    for (var i = 0; i < this.selected.length; i++) {
      value += this.selected[i];
      if (i < this.selected.length - 1) value += ",";

      // Procurar pela descrição da opção.
      for (var j = 0; j < this.keys.length; j++) {
        if (this.keys[j] == this.selected[i]) {
          text += this.values[j];
          if (i < this.selected.length - 1) text += ", ";
          break;
        }
      }
    }

    // Definir as propriedades.
    this.valueOption.value = value;
    this.valueOption.innerHTML = text;
    this.valueOption.selected = true;

    // Verificar valor atual e se necessário chamar o event onchange.
    if (this.value != value) {
      this.value = value;
      this.hidden.setValue(value);
      this.changeAction(null, this, true);
    }

    if (this.options && this.options.length > 0) {
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i].checkbox) this.options[i].checkbox.checked = (this.selected.indexOf(this.options[i].key) != -1);
      }
    }
  } else {
    // Nenhuma opção selecionada, limpar tudo.
    if (this.valueOption) {
      this.valueOption.value = "";
      this.valueOption.innerHTML = "";
    }

    // Verificar valor atual e se necessário chamar o event onchange.
    if (this.value != "") {
      this.value = "";
      this.hidden.setValue("");
      this.changeAction(null, this, true);
    }

    // Selecionar a opção vazia ou placeholder.
    if (this.placeholderOption) {
      this.placeholderOption.selected = true;
    } else if (this.emptyOption) {
      this.emptyOption.selected = true;
    } else {
      this.input.value = "";
    }

    if (this.options && this.options.length > 0) {
      for (var i = 0; i < this.options.length; i++) {
        if (this.options[i].checkbox) this.options[i].checkbox.checked = false;
      }
    }
  }
};

/**
 * Marca uma opção como selecionada.
 * @param key - Valor da opção.
 **/
HTMLMultiSelect.prototype.selectOption = function(key) {
  if (this.selected.indexOf(key) == -1)
    this.selected.push(key);
  this.updateLayout();

  // Chamar o evento "Ao Selecionar".
  if (this.AoSelecionar) this.AoSelecionar.call(this, key);
};

/**
 * Desmarca uma opção como selecionada.
 * @param key - Valor da opção.
 **/
HTMLMultiSelect.prototype.unselectOption = function(key) {
  if (this.selected.indexOf(key) != -1)
    this.selected.remove(key);
  this.updateLayout();

  // Chamar o evento "Ao Remover".
  if (this.AoRemover) this.AoRemover.call(this, key);
};
