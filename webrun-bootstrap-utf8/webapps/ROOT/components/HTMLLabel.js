function HTMLLabel(sys, formID, code, posX, posY, width, height, value) {
  this.create(sys, formID, code, posX, posY, width, height, '', value);
  this.wrap = false;
  this.type = 1;
}

HTMLLabel.inherits(HTMLElementBase);
HTMLLabel.prototype.name = 'HTMLLabel';
HTMLLabel.prototype.tabable = false;

HTMLLabel.prototype.setDescription = function(description) {
  this.value = description;
  this.setValue(description);
};

HTMLLabel.prototype.setValue = function(value) {
  this.callMethod(HTMLElementBase, "setValue", [value]);
  if (!isNullable(this.value)) this.value = this.value.toString();
  if (this.value.indexOf("\\n") != -1) this.value = this.value.replace("\\n", '<br>');
  if (this.wrap) this.label.innerHTML = this.value;
  else this.label.innerHTML = this.value;
  if (this.hidden) this.hidden.setValue(this.value);
};

HTMLLabel.prototype.designComponent = function(doc) {
  this.div.className += " form-label fixed-height"; // Custom
  this.divClass = this.div.className;

  // Criar elemento da label.
  this.label = document.createElement("label");
  this.label.className = "mb-0"; // Bootstrap

  // Verificar se o componente possui classe customizada definida
  if (this.classCss && this.classCss.trim().length > 0) {
    var classCssLowercaseTrim = this.classCss.toLowerCase().trim();
    if (classCssLowercaseTrim.startsWith("text-") && classCssLowercaseTrim.indexOf(" ") == -1) {
      this.label.className += " " + classCssLowercaseTrim; // Bootstrap
      this.label.textMuted = (classCssLowercaseTrim.indexOf("text-muted") != -1); // Bootstrap
      this.classCssDefined = true;
    }
  }

  // Verificar se a label tem conteÃºdo.
  if (this.value) {
    if (this.value.indexOf("\\n") != -1) {
      this.value = this.value.replace("\\n", '<br>');
    }

    if (this.wrap) {
      this.div.style.overflow = "auto";
      this.label.className += " text-break"; // Bootstrap
      this.label.innerHTML = this.value;
    } else {
      this.label.innerHTML = this.value;
    }
  }

  this.label.style.whiteSpace = "pre-wrap";

  // Definir propriedades de layout da fonte da label.
  if (this.font) this.label.style.fontFamily = this.font;
  if (this.size) this.label.style.fontSize = this.size;
  if (this.weight) this.label.className += " font-weight-bold"; // Bootstrap
  if (this.italic) this.label.className += " font-italic"; // Bootstrap

  // Definir estilos e decoraÃ§Ã£o do texto do label.
  var textDecoration = "";
  if (this.underline || this.strikeout) {
    if (this.underline) textDecoration += "underline";
    if (this.strikeout) textDecoration += " line-through";
  } else textDecoration = "none";
  this.label.style.textDecoration = textDecoration;

  // Definir as cores da label.
  if (this.color) this.label.style.color = this.color;
  if (this.bgColor) this.div.style.backgroundColor = this.bgColor;
  else if (doc) this.label.style.backgroundColor = doc.style.backgroundColor;

  // Definir tamanho da div do label.
  if (this.width) this.div.style.width = this.width + "px";
  if (this.height) this.div.style.height = this.height + "px";

  // Verificar alinhamento do texto.
  var flexLayout = "d-flex";
  if (this.horizontalAlignment) { // Alinhamento horizontal do componente label (left, center, right)
    switch (this.horizontalAlignment.toLowerCase()) {
      case "left": flexLayout += " justify-content-start"; break; // Bootstrap
      case "center": flexLayout += " justify-content-center"; break; // Bootstrap
      case "right": flexLayout += " justify-content-end"; break; // Bootstrap
    }
  }

  if (this.verticalAlignment) { // Alinhamento vertical do componente label (top, middle, bottom)
    switch (this.verticalAlignment.toLowerCase()) {
      case "top": flexLayout += " align-items-start"; break; // Bootstrap
      case "middle": flexLayout += " align-items-center"; break; // Bootstrap
      case "bottom": flexLayout += " align-items-end"; break; // Bootstrap
    }
  }

  // Criar div para alinhamento do texto.
  this.contentDiv = document.createElement("div");
  this.contentDiv.className = "w-100 h-100 " + flexLayout; // Bootstrap
  this.div.appendChild(this.contentDiv);

  //Ajeitar a label em resoluÃ§Ãµes de disposivos mÃ³veis.
  this.contentDiv.style.minHeight = this.div.style.minHeight;

  // Adicionar label ao div de alinhamento.
  this.contentDiv.appendChild(this.label);

  if ((this.type == 2) || (!isNullable(this.field) && this.field.length > 0)) {
    this.hidden = new HTMLHidden(this.sys, this.formID, this.code, this.value);
    this.hidden.design(doc);
  }

  // Associar eventos a label.
  if (this.onclick) {
    this.clickAction = this.getAction("doOnClick");
    this.attachEvent(this.div, 'click', this.clickAction);
    this.div.onmouseover = (this.div.style.cursor = "pointer");
    this.label.onmouseover = (this.label.style.cursor = "pointer");
  }
};

HTMLLabel.prototype.doOnClick = function(e) {
  if (parseBoolean(this.enabled) && this.onclick) {
    this.onclick(e);
  }
};

HTMLLabel.prototype.setHint = function(hint) {
  this.callMethod(HTMLElementBase, "setHint", [hint]);

  if (this.label) {
    let init = this.label.hint ? false : true;
    if (this.label.getAttribute("data-original-title")) {
      this.label.setAttribute("data-original-title", hint.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    } else {
      this.label.hint = hint;
      this.label.alt = hint;
      this.label.title = hint.replace(/(?:\r\n|\r|\n)/g, '<br />');
      this.label.setAttribute("data-toggle", "tooltip"); //Bootstrap
      this.label.setAttribute("data-html", "true"); //Bootstrap
      if (init) bootstrapInitTooltip(this.label);
    }
  }
};

HTMLLabel.prototype.focus = function() { return false; };
HTMLLabel.prototype.blur = function() { return false; };

HTMLLabel.prototype.getPermissionDescription = function() {
  if (!isNullable(this.value)) return this.value;
  return this.callMethod(HTMLElementBase, "getPermissionDescription");
};

HTMLLabel.prototype.flush = function() {
  if (this.label) {
    if (this.label.onmousedown) this.label.onmousedown = null;
    if (this.label.onselectstart) this.label.onselectstart = null;
    this.label = null;
  }

  this.hidden = null;
  this.callMethod(HTMLElementBase, "flush");
};

// Definir cor do label.
HTMLLabel.prototype.setColor = function(color) {
  this.color = color;
  this.label.style.setProperty("color", color);
};