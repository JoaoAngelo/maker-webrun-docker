function HTMLComboBox(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
}

HTMLComboBox.inherits(HTMLLabeledComponent);
HTMLComboBox.prototype.name = 'HTMLComboBox';
HTMLComboBox.prototype.tagName = 'input';

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param color Cor de fundo do componente.
 */
HTMLComboBox.prototype.setBGColor = function(color) {
  this.bgColor = color;
  if (this.input) this.input.style.backgroundColor = color;
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param color Cor do texto do componente.
 */
HTMLComboBox.prototype.setColor = function(color) {
  this.color = color;
  if (this.input) this.input.style.color = color;
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para ativar/desativar o modo somente leitura.
 */
HTMLComboBox.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);
  if (this.input) this.input.disabled = !this.enabled || this.readonly;
};

/**
 * Adiciona uma opção a lista.
 * @param key - Valor da opção.
 * @param value - Texto que será exibido.
 **/
HTMLComboBox.prototype.add = function(key, value) {
  this.values = this.values.concat([value]);
  this.keys = this.keys.concat([key]);
  this.designOption(key, value);
  this.itemAddedAction(key, value);
};

/**
 * Remover uma opção pelo seu índice.
 * @param idx - �?ndice da opção para remover.
 **/
HTMLComboBox.prototype.removeByIndex = function(idx) {
  if (idx >= 0 && idx < this.keys.length) {
    var itemKey = this.values[idx];
    var itemValue = this.values[idx];

    this.keys.splice(idx, 1);
    this.values.splice(idx, 1);
    this.input.options[idx] = null;

    this.itemRemovedAction(itemKey, itemValue);
  } else interactionError(getLocaleMessage("ERROR.INEXISTENT_ELEMENT_KEY"), key);
};

/**
 * Remover uma opção pelo seu valor.
 * @param key - Valor da opção para remover.
 **/
HTMLComboBox.prototype.removeByKey = function(key) {
  var idx = arrayIndexOf(this.keys, key);
  if (idx != -1) {
    var itemValue = this.values[idx];
    this.keys.splice(idx, 1);
    this.values.splice(idx, 1);

    var countItens = this.input.childElementCount;
    for (i = 1; i < countItens; i++) {
      if (this.input.options[i].value === key) {
        this.input.options[i] = null;
        return;
      }
    }

    this.itemRemovedAction(key, itemValue);
  } else interactionError(getLocaleMessage("ERROR.INEXISTENT_ELEMENT_KEY"), key);
};

/**
 * Limpa todas as opções da lista.
 **/
HTMLComboBox.prototype.clean = function() {
  this.keys = new Array();
  this.values = new Array();

  if (this.input) {
    this.input.innerHTML = "";

    // Desenhar a opção vazia.
    this.designPlaceholder();
  }
};

/**
 * Obtém a quantidade de itens da lista.
 **/
HTMLComboBox.prototype.length = function() { return this.keys ? this.keys.length : this.values ? this.values.length : 0; };

/**
 * Muda o item selecionado da lista.
 * @param value - Texto exibido pelo item.
 **/
HTMLComboBox.prototype.setValue = function(value, checkDependences) {
  // Tratar valor
  if (value !== undefined && value !== null && typeof value === 'string')
    value = value.trim();
  value = normalizeRuleParam(value, true);

  // Obter o valor atual.
  var currentValue = this.getValue();
  if (typeof currentValue === 'string') {
    currentValue = currentValue.trim();
  }

  // Obter o índice do valor no select.
  var idx = arrayIndexOf(this.keys, value, this.typeName) + 1;

  // Se o índice não for encontrado, definir o valor como vazio.
  // Se for encontrado, definir o índice atual do select.
  if (idx <= 0) value = "";
  else this.input.selectedIndex = idx;

  // Definir a propriedade de valor.
  this.value = value;
  this.hidden.setValue(value);
  this.input.value = value;

  // Se o valor alterou, chamar o evento "onchange".
  if (this.value != currentValue) {
    this.changeAction(null, this, !checkDependences);
  }
};

/**
 * Obtém o texto que está sendo exibido no input da lista.
 **/
HTMLComboBox.prototype.getShowValue = function() {
  return this.input.options[this.input.selectedIndex].text;
};

/**
 * Obtém o valor do item selecionado na lista.
 **/
HTMLComboBox.prototype.getValue = function() {
  return this.input ? this.input.value : this.value;
};

/**
 * Ocorre quando o item selecionado na lista é alterado.
 **/
HTMLComboBox.prototype.inputChanged = function(e, sel) {
  this.parent.setValue(this.value);
};

/**
 * Responsável por desenhar o HTML do componente Lista.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLComboBox.prototype.designComponent = function(doc) {
  if (this.beforeComponentDesign) {
    this.beforeComponentDesign(doc);
  }

  this.hidden = new HTMLHidden(this.sys, this.formID, this.code, this.value);
  this.hidden.design(this.context);

  if (this.report) {
    this.designComponentReport();
    return "";
  }

  this.onblur_catch = this.onblur;
  this.onkeydown = this.checkKey;

  // Cria o elemento select.
  this.input = document.createElement("select");
  this.input.className = "custom-select d-flex align-self-start"; // Bootstrap
  this.input.style.height = this.div.style.height;
  this.context.appendChild(this.input);

  // Desenhar a opção vazia.
  this.designPlaceholder();

  // Adicionar as opções ao select.
  if (this.keys && this.keys.length > 0) {
    for (var i = 0; i < this.keys.length; i++) {
      this.designOption(this.keys[i], this.values[i]);
    }

    // Definir valor inicial.
    if (this.value) {
      var idx = arrayIndexOf(this.keys, this.value, this.typeName) + 1;
      if (idx > 0) this.input.selectedIndex = idx;
    }
  }

  // Definir hint.
  if (this.hint) this.setHint(this.hint);

  // Associar eventos ao input.
  this.input.parent = this;
  this.input.addEventListener("change", this.inputChanged, false);

  if (this.afterComponentDesign) {
    this.afterComponentDesign(doc);
  }
};

/**
 * Responsável por desenhar a opção vazia na lista.
 **/
HTMLComboBox.prototype.designPlaceholder = function() {
  // Cria uma opção vazia no combo box.
  this.emptyOption = document.createElement("option");
  this.emptyOption.value = "";
  if (this.placeholder) this.emptyOption.innerHTML = replaceAll(replaceAll(this.placeholder, '>', '&gt;'), '<', '&lt;');
  this.emptyOption.setAttribute("selected", "selected");
  this.input.appendChild(this.emptyOption);
};

/**
 * Responsável por desenhar uma opção na lista.
 * @param key - Valor da opção.
 * @param value - Texto que será exibido.
 **/
HTMLComboBox.prototype.designOption = function(key, value) {
  // Cria a opção para o item e adiciona no select.
  var option = document.createElement("option");
  option.value = key;
  if (value) option.innerHTML = replaceAll(replaceAll(value, '>', '&gt;'), '<', '&lt;');
  this.input.appendChild(option);
};

/**
 * Ocorre quando um item é adicionado a lista.
 * @param key - Valor da opção.
 * @param value - Texto que será exibido.
 **/
HTMLComboBox.prototype.itemAddedAction = function(key, value) { };

/**
 * Ocorre quando um item é removido da lista.
 * @param key - Valor da opção.
 * @param value - Texto que será exibido.
 **/
HTMLComboBox.prototype.itemRemovedAction = function(key, value) { };
