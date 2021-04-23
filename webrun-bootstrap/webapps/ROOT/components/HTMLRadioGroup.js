function HTMLRadioGroup(sys, formID, code, posX, posY, width, height, description, value, labels, values, fontDecoration) {
  this.fontDescStyle = fontDecoration;
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.labels = labels;
  this.values = values;
  if (!this.values) this.values = this.labels;
  this.columns = 1;
  this.options = new Array();
  this.inputname = 'WFRInput' + this.code;
  this.style = 1;
}

HTMLRadioGroup.inherits(HTMLGroupBox);
HTMLRadioGroup.prototype.name = 'HTMLRadioGroup';
HTMLRadioGroup.prototype.tabable = true;

HTMLRadioGroup.prototype.setFont = function(f) {
  this.font = f;
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setFont(f);
  }
};

HTMLRadioGroup.prototype.setWeight = function(weight) {
  this.weight = weight;
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setWeight(weight);
  }
};

HTMLRadioGroup.prototype.setItalic = function(italic) {
  this.italic = italic;
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setItalic(italic);
  }
};

HTMLRadioGroup.prototype.setTextDecoration = function() {
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setTextDecoration();
  }
};

HTMLRadioGroup.prototype.setSize = function(s) {
  if (s.indexOf("pt") == -1) s += "pt";
  this.size = s;
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setSize(s);
  }
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para habilitar/desabilitar o componente.
 */
HTMLRadioGroup.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setEnabled(this.enabled);
  }
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para mostrar/ocultar o componente.
 */
HTMLRadioGroup.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setVisible(this.visible);
  }
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para ativar/desativar o modo somente leitura
 */
HTMLRadioGroup.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setReadOnly(this.readonly);
  }
};

HTMLRadioGroup.prototype.setColor = function(color) {
  this.color = color;
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].setColor(color);
  }
};

HTMLRadioGroup.prototype.setColumns = function(c) {
  this.columns = c;
  this.reDesign();
};

HTMLRadioGroup.prototype.focus = function() { return false; };
HTMLRadioGroup.prototype.blur = function() { return false; };

HTMLRadioGroup.prototype.designOptions = function(root, tabControl) {
  var rows = Math.ceil(this.labels.length / this.columns);
  var idx = 0, cell = 0;

  var container = document.createElement("div");
  container.className = "card-body my-auto px-3 py-2"; // Bootstrap
  container.style.flex = "0 0 auto"; // Correção para o IE e Safari

  // Verificar se o formulário é responsivo.
  var isResponsive = (d && d.n && d.n.responsive);

  // Calcular o tamanho da coluna no grid layout (1 - 12).
  var colSize = (this.columns <= 0) ? 12 : (this.columns >= 12) ? 1 : Math.ceil(12 / this.columns);
  var colClass = isResponsive ? (colSize > 0) ? "col-sm-" + colSize : "col-sm" : // Bootstrap
    (colSize > 0) ? "col-" + colSize : "col"; // Bootstrap

  for (var i = 0; i < rows; i++) {
    if (rows != this.labels.length) cell = i;
    var rowDiv = document.createElement("div");
    rowDiv.className = "row no-gutters w-100"; // Bootstrap

    for (var j = 0; j < this.columns; j++) {
      if (idx <= this.values.length) {
        if (cell !== this.labels.length && cell < this.labels.length && idx < this.labels.length) {
          var o = (rows != this.labels.length) ?
            new HTMLRadioGroupOption(this, this.sys, this.formID, this.code, this.labels[cell], this.values[cell], idx + cell) :
            new HTMLRadioGroupOption(this, this.sys, this.formID, this.code, this.labels[idx], this.values[idx], idx + cell);
          o.index = idx;
          o.tabindex = this.tabindex;
          o.color = this.color;
          o.dependent = this.dependent;

          if (tabControl != undefined) {
            o.design(rowDiv, tabControl);
          } else {
            o.design(rowDiv, true);
          }

          o.div.className += " " + colClass + " pl-4 pr-2"; // Bootstrap
          o.divClass += " " + colClass + " pl-4 pr-2"; // Bootstrap

          this.options.push(o);
          rowDiv.appendChild(o.div);

          orderTab.splice(arrayIndexOf(orderTab, this.code), 0, o);
          if (rows < this.values.length) cell += rows;
          idx++;
        }
      }
    }

    container.appendChild(rowDiv);
  }

  root.appendChild(container);
};

HTMLRadioGroup.prototype.getValue = function() {
  return this.hidden.value;
};

HTMLRadioGroup.prototype.getShowValue = function() {
  for (i = 0; i < this.options.length; i++) {
    if (this.options[i].isChecked())
      return this.options[i].getShowValue();
  }

  return '';
};

HTMLRadioGroup.prototype.setValue = function(value) {
  value = normalizeRuleParam(value, true);
  var temp = this.value;
  this.hidden.setValue(value);
  this.value = value;

  for (var i = 0; i < this.options.length; i++) {
    if (this.options[i].value == this.value)
      this.options[i].setChecked(true);
    else this.options[i].setChecked(false);
  }

  if (this.value != temp) {
    this.changeAction(null, this);
  }
};

HTMLRadioGroup.prototype.designComponent = function(doc, tabControl) {
  this.div.className += " overflow-auto fixed-height"; // Bootstrap - Custom
  this.divClass = this.div.className;

  // Cria o elemento base (Group Box)
  this.designGroupBox(doc);

  // Cria o elemento hidden para obter o valor (importante para o POST)
  this.hidden = new HTMLHidden(this.sys, this.formID, this.code, this.value);
  this.hidden.name = this.name;
  this.hidden.design(this.context);

  // Cria as opções.
  this.designOptions(this.context, tabControl);

  for (var i = 0; i < this.options.length; i++) {
    if (this.options[i].value == this.value)
      this.options[i].setChecked(true);
    else this.options[i].setChecked(false);
  }
};

HTMLRadioGroup.prototype.reDesign = function(tabControl) {
  this.free();
  this.options = new Array();
  this.design(this.doc, tabControl);
};

HTMLRadioGroup.prototype.freeComponent = function() {
  for (var i = 0; i < this.options.length; i++) {
    this.options[i].free(true);
  }
  this.hidden.free();
};

HTMLRadioGroup.prototype.add = function(value, label) {
  this.labels = this.labels.concat([label]);
  this.values = this.values.concat([value]);
  this.reDesign();
};

HTMLRadioGroup.prototype.removeByIndex = function(idx) {
  this.labels.splice(idx, 1);
  this.values.splice(idx, 1);
  this.reDesign();
};

HTMLRadioGroup.prototype.removeByKey = function(key) {
  var idx = arrayIndexOf(this.values, key);
  if (idx != -1) {
    this.values.splice(idx, 1);
    this.labels.splice(idx, 1);
    this.reDesign();
  } else interactionError(getLocaleMessage("INFO.KEY_ELEMENT_DOES_NOT_EXIST", key));
};

HTMLRadioGroup.prototype.focusNext = function(current) {
  if (current >= this.options.length - 1) this.options[0].focus();
  else this.options[current + 1].focus();
};

HTMLRadioGroup.prototype.focusPrevious = function(current) {
  if (current <= 0) this.options[this.options.length - 1].focus();
  else this.options[current - 1].focus();
};

HTMLRadioGroup.prototype.setHint = function(hint) {
  this.callMethod(HTMLElementBase, "setHint", [hint]);

  if (this.div) {
    let init = this.div.hint ? false : true;
    if (this.div.getAttribute("data-original-title")) {
      this.div.setAttribute("data-original-title", hint.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    } else {
      this.div.setAttribute("data-toggle", "tooltip"); // Bootstrap
      this.div.setAttribute("data-html", "true"); // Bootstrap
      this.div.hint = hint;
      this.div.title = hint.replace(/(?:\r\n|\r|\n)/g, '<br />');
      if (init) bootstrapInitTooltip(this.div);
    }
  }
};


/**********************
 * OP�?�?ES DO RADIOGROUP
 **********************/

function HTMLRadioGroupOption(group, sys, formID, code, description, value, index) {
  this.create(sys, formID, code, null, null, null, null, description, value);
  this.group = group;
  this.checked = false;
  this.index = index;

  // Relativo a font da opção
  if (group.size) this.size = group.size;
}

HTMLRadioGroupOption.inherits(HTMLElementBase);
HTMLRadioGroupOption.prototype.name = 'HTMLRadioGroupOption';
HTMLRadioGroupOption.prototype.ignore = true;
HTMLRadioGroupOption.prototype.tabable = true;

HTMLRadioGroupOption.prototype.setWidth = function(width) { };
HTMLRadioGroupOption.prototype.setHeight = function(height) { };

HTMLRadioGroupOption.prototype.updateImage = function() {
  if (this.checked) this.input.checked = true;
  else this.input.checked = false;

  if (this.readonly || !this.enabled) {
    this.onkeydown = null;
    this.removeEvent(this.input, 'click');
    if (this.label) this.removeEvent(this.label, 'click');
    if (!this.enabled) this.input.disabled = true;
    this.div.className = this.divClass + " disabled";
  } else {
    this.attachEvent(this.input, 'click', this.click);
    if (this.label) this.attachEvent(this.label, 'click', this.click);
    this.onkeydown = this.keyPressedAction;
    if (this.enabled) this.input.disabled = false;
    this.div.className = this.divClass;
  }
};

HTMLRadioGroupOption.prototype.designComponent = function(doc) {
  // Div
  this.div.className = "custom-control custom-radio"; // Bootstrap
  this.divClass = this.div.className;

  this.div.onmousedown = function() { return false; };
  this.div.onselectstart = function() { return false; };

  // Bootstrap radio handler
  this.input = document.createElement("input");
  this.input.type = "radio";
  this.input.id = "option" + this.code + "-" + this.index;
  this.input.className = "custom-control-input"; // Bootstrap
  this.div.appendChild(this.input);

  // Bootstrap checkbox visual
  this.radio = document.createElement("div");
  this.radio.className = "custom-control-label"; // Bootstrap
  this.radio.style.lineHeight = "100%";
  this.radio.style.height = "100%";
  this.div.appendChild(this.radio);

  // Radio label
  if (this.description != null && this.description.length > 0) {
    this.label = document.createElement("label");
    this.label.setAttribute("for", "option" + this.code + "-" + this.index);
    this.label.innerHTML = this.description;
    this.radio.appendChild(this.label);
  }

  // Evento de clique do radio
  if (this.click) this.attachEvent(this.div, 'click', this.click);

  // Adicionando no documento
  doc.appendChild(this.div);
  this.updateImage();
};

HTMLRadioGroupOption.prototype.getFocus = function(fromKeyBoard) {
  try {
    if (this.tabable && this.enabled && this.visible && !this.readonly && !this.resizable && !this.draggable) {
      if (this.group.doc && this.group.doc.focus && this.group.doc.canFocus != null && !this.group.doc.canFocus.call(this)) return false;
      this.fromKeyBoard = fromKeyBoard;
      try {
        if (!this.group.doc.focus.isHTMLAction) this.group.doc.focus();
        else this.group.doc.focus.call(this);
      } catch (e) { }
      return this.focus();
    } else return false;
  } catch (e) {
    return false;
  }
};

HTMLRadioGroupOption.prototype.keyPressedAction = function(e) {
  var key = getKey(e);
  if (key == 32) this.click(); // Tecla de espaço
  else if (key == 40) this.group.focusNext(this.index); // Seta pra baixo
  else if (key == 38) this.group.focusPrevious(this.index); // Seta pra cima
};

HTMLRadioGroupOption.prototype.setReadOnly = function(v) {
  this.readonly = v;
  this.updateImage();
};

HTMLRadioGroupOption.prototype.setEnabled = function(v) {
  this.enabled = v;
  this.updateImage();
};

HTMLRadioGroupOption.prototype.setColor = function(color) {
  this.color = color;
  this.label.style.color = color;
};

HTMLRadioGroupOption.prototype.setChecked = function(checked) {
  this.checked = checked;
  this.updateImage();
};

HTMLRadioGroupOption.prototype.isChecked = function() { return this.checked; };
HTMLRadioGroupOption.prototype.getValue = function() { return this.value; };
HTMLRadioGroupOption.prototype.getShowValue = function() { return this.description; };
HTMLRadioGroupOption.prototype.setVisible = function(v) { this.visible = v; };

HTMLRadioGroupOption.prototype.click = function(e) {
  this.input.focus();
  this.group.clickAction(e);
  this.group.setValue(this.value);
};

HTMLRadioGroupOption.prototype.designDragComponent = function() { };
HTMLRadioGroupOption.prototype.setDraggable = function(draggable) { };
HTMLRadioGroupOption.prototype.setResizable = function(resizable) { };

HTMLRadioGroupOption.prototype.flush = function() {
  if (this.label) {
    if (this.label.onmousedown) this.label.onmousedown = null;
    if (this.label.onselectstart) this.label.onselectstart = null;
    this.label = null;
  }

  if (this.div) {
    if (this.div.onmousedown) this.div.onmousedown = null;
    if (this.div.onselectstart) this.div.onselectstart = null;
    this.div = null;
  }

  this.img = null;
  this.callMethod(HTMLElementBase, "flush");
};
