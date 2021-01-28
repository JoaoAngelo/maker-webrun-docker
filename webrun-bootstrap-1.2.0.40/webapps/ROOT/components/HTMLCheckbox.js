function HTMLCheckbox(sys, formID, code, posX, posY, width, height, description, value, valueCheck, valueUnCheck) {
  this.create(sys, formID, code, posX, posY, width, height, description, '');
  this.style = 1;
  this.nodesc = false;
  this.value = value;
  this.valueCheck = valueCheck;
  this.valueUnCheck = valueUnCheck;
  this.inputname = 'WFRInput' + this.code;
}

HTMLCheckbox.inherits(HTMLElementBase);
HTMLCheckbox.prototype.name = 'HTMLCheckBox';
HTMLCheckbox.prototype.tabable = true;

HTMLCheckbox.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  this.updateLayout();
};

HTMLCheckbox.prototype.setHint = function(hint) {
  let init = this.hint ? false : true;
  this.hint = hint;
  if (this.label.getAttribute("data-original-title")) {
    this.label.setAttribute("data-original-title", hint.replace(/(?:\r\n|\r|\n)/g, '<br />'));
  } else {
    this.label.setAttribute("data-toggle", "tooltip"); // Bootstrap
    this.label.setAttribute("data-html", "true"); // Bootstrap
    this.label.hint = hint;
    this.label.title = hint.replace(/(?:\r\n|\r|\n)/g, '<br />');
    if (init) bootstrapInitTooltip(this.label);
  }
};

HTMLCheckbox.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);
  if (this.context) {
    if (!this.readonly)
      this.context.style.removeProperty("pointer-events");
    else
      this.context.style.setProperty("pointer-events", "none");
  }
  this.updateLayout();
};

HTMLCheckbox.prototype.setColor = function(color) {
  this.color = color;
  if (this.label) this.label.style.color = color;
};

HTMLCheckbox.prototype.setBGColor = function(color) {
  this.bgColor = color;
  if (this.div) this.div.style.backgroundColor = color;
};

HTMLCheckbox.prototype.getGridShowValue = function(grid, row, column, oldContent, newDataArray) {
  var eventCmd = ("d.c_" + grid.code + ".checkCmd(" + this.code + ", " + (row - 1) + ", " + column + ")");
  return grid.gridCheckBox(this.status, this.valueCheck, this.valueUnCheck, this.code, row, {
    enabled: this.getEnabled(),
    readonly: this.getReadOnly(),
    hint: this.hint
  }, eventCmd);
};

HTMLCheckbox.prototype.getValue = function() {
  return this.hidden.getValue();
};

HTMLCheckbox.prototype.updateLayout = function() {
  if (this.valueCheck == this.value) {
    this.status = 1;
    this.input.checked = true;
  } else if (this.valueUnCheck == this.value) {
    this.status = 0;
    this.input.checked = false;
  } else {
    this.status = 2;
    this.input.checked = false;
  }
};

/**
 * ResponsÃ¡vel por desenhar o HTML do componente Check.
 * @param doc - documento onde o componente serÃ¡ inserido.
 **/
HTMLCheckbox.prototype.designComponent = function(doc) {
  this.hidden = new HTMLHidden(this.sys, this.formID, this.code, this.value);
  this.hidden.inputname = this.inputname;
  this.hidden.design(this.div);

  // Ã‰ necessÃ¡rio a criaÃ§Ã£o de outro contexto.
  this.context = this.getBaseDiv(false);
  this.context.className = "custom-control custom-checkbox"; // Bootstrap
  this.div.appendChild(this.context);

  // Criar input da checkbox.
  this.input = document.createElement("input");
  this.input.id = this.id + "-checkbox";
  this.input.type = "checkbox";
  this.input.className = "custom-control-input"; // Bootstrap
  this.context.appendChild(this.input);

  // Associar evento de clique ao input.
  this.attachEvent(this.input, "click", this.clickAction);

  // Criar label da checkbox.
  this.label = document.createElement("label");
  this.label.className = "custom-control-label h-100"; // Bootstrap
  this.label.style.overflow = "visible";
  this.label.style.lineHeight = this.height + "px";
  this.label.setAttribute("for", this.input.id);
  this.label.innerHTML = !this.wordWrap ? this.description.replace(/\s/g, '&nbsp;') : this.description;
  this.context.appendChild(this.label);

  // Atualizar layout.
  this.updateLayout();
};

HTMLCheckbox.prototype.keyPressedAction = function(evt) {
  var key = getKey(evt);
  var r = true;
  if (key == 32 && !isFirefox) {
    this.click();
    r = false;
  }

  if (!r) {
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

HTMLCheckbox.prototype.getChecked = function(e) {
  return this.input ? this.input.checked : this.valueCheck == this.value;
};

HTMLCheckbox.prototype.clickAction = function(e, o) {
  if (!this.readonly && this.enabled) {
    this.setValue(this.input.checked ? this.valueCheck : this.valueUnCheck);
    this.callMethod(HTMLElementBase, "clickAction", [e, o]);
  }
};

HTMLCheckbox.prototype.setValue = function(value) {
  value = normalizeRuleParam(value, true);
  var temp = this.value;
  this.value = value.toString();
  this.hidden.setValue(this.value);
  this.updateLayout();
  if (temp != value) this.changeAction(null, this);
};

HTMLCheckbox.prototype.getValueByStatus = function(status) {
  switch (status.toString()) {
    case "0": return this.valueUnCheck;
    case "1": return this.valueCheck;
    default: return "";
  }
};

/**
 * Caso o componente seja HTMLCheckbox, obtem-se o status a partir de seu valor (HTML).
 * A partir do status, eh possivel obter seu valor no componente.
 *
 * @param value valor vindo da grid com todo o conteudo HTML.
 */
HTMLCheckbox.prototype.setGridValue = function(value) {
  var statusRegExp = /state="(\d)"/;
  var result = statusRegExp.exec(value);
  if (result != null && result.length > 1) {
    var status = result[1];
    this.value = this.getValueByStatus(status);
  } else {
    this.value = value;
  }
};

HTMLCheckbox.prototype.flush = function() {
  if (this.label) {
    if (this.label.onmousedown) this.label.onmousedown = null;
    if (this.label.onselectstart) this.label.onselectstart = null;
    this.label = null;
  }

  this.hidden = null;
  this.callMethod(HTMLElementBase, "flush");
};
