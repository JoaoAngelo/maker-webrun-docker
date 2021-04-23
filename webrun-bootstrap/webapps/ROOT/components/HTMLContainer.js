function HTMLContainer(sys, formID, code, posX, posY, width, height, description, value) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
}

HTMLContainer.inherits(HTMLElementBase);
HTMLContainer.prototype.zindex = 0;
HTMLContainer.prototype.name = 'HTMLContainer';
HTMLContainer.prototype.tabable = false;

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para habilitar/desabilitar o componente.
 */
HTMLContainer.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  if (this.onclick && this.div) this.div.style.cursor = this.enabled ? "pointer" : "default";
};

HTMLContainer.prototype.focus = function() { return false; };
HTMLContainer.prototype.blur = function() { return false; };
HTMLContainer.prototype.toPermissionMode = function() { };

HTMLContainer.prototype.designComponent = function(doc) {
  if (this.onclick) {
    this.div.onclick = this.onclick;
    this.div.onmouseover = "pointer";
    this.div.style.cursor = "pointer";
  }

  // Verificar se o componente possui classe customizada definida
  if (this.classCss && this.classCss.trim().length > 0) {
    this.div.buttonGroup = (this.classCss.toLowerCase().indexOf("btn-group") != -1); // Bootstrap
  } else if (this.name == "HTMLContainer") {
    this.div.className += " p-3"; // Bootstrap
  }

  this.div.id = this.id;
  this.divClass = this.div.className;

  if (this.maxWidth) {
    this.div.style.maxWidth = this.maxWidth + "px"; 
  }
};

HTMLContainer.prototype.afterInit = function() {
  this.callMethod(HTMLElementBase, "afterInit", []);
  if (this.tab) this.div.tab = this.tab;
};
