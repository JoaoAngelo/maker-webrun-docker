function HTMLDetailPanel(sys, formID, code, posX, posY, width, height, description, value) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.components = new Array();
  this.wasVisible = new Array();
  this.wasEnabled = new Array();
  this.wasNotReadOnly = new Array();
}

HTMLDetailPanel.inherits(HTMLGroupBox);
HTMLDetailPanel.prototype.name = 'HTMLDetailPanel';

/**
 * ResponsÃ¡vel por desenhar o HTML do componente. 
 * @param doc - documento onde o componente serÃ¡ inserido.
 **/
HTMLDetailPanel.prototype.designComponent = function(doc) {
  this.callMethod(HTMLGroupBox, 'designComponent', [doc]);
  this.div.className += " p-3"; // Bootstrap
  this.divClass = this.div.className;

  this.hidden = document.createElement("input");
  this.hidden.name = "WFRDetailPanelVisible" + this.code;
  this.hidden.type = "hidden";
  this.hidden.value = this.visible.toString();

  this.context.appendChild(this.hidden);
};

/**
 * Adiciona um componente do subformulÃ¡rio.
 * @param comp ReferÃªncia para a instÃ¢ncia do componente.
 **/
HTMLDetailPanel.prototype.add = function(comp) {
  this.components.push(comp);
  if (arrayIndexOf(orderTab, this.code) != -1) {
    orderTab.splice(arrayIndexOf(orderTab, this.code), 0, comp.code);
  } else {
    detailPanelComponentsTab.add(comp, this);
  }

  comp.parentPanelCode = this.getCode();
  comp.designDragComponent = function() { };
  comp.setDraggable = function() { };
  comp.setResizable = function() { };
};

/**
 * ObtÃ©m a div que os componentes do subformulÃ¡rio serÃ£o inseridos.
 **/
HTMLDetailPanel.prototype.getComponentsDiv = function() {
  return this.context;
};

HTMLDetailPanel.prototype.setVisible = function(visible, force) {
  if (visible == this.visible && !force) return;
  this.callMethod(HTMLGroupBox, 'setVisible', [visible]);

  if (!visible) {
    this.wasVisible = new Array();
    for (var i = 0; i < this.components.length; i++) {
      if (this.components[i]) {
        if (this.components[i].getVisible())
          this.wasVisible.push(this.components[i]);
        this.components[i].setVisible(false);
      }
    }
  } else {
    for (var i = 0; i < this.wasVisible.length; i++) {
      this.wasVisible[i].setVisible(true);
    }
  }

  this.hidden.value = this.visible.toString();
};

HTMLDetailPanel.prototype.setEnabled = function(enabled, force) {
  if (enabled == this.enabled && !force) return;
  this.callMethod(HTMLGroupBox, 'setEnabled', [enabled]);

  if (!enabled) {
    this.wasEnabled = new Array();
    for (var i = 0; i < this.components.length; i++) {
      if (this.components[i]) {
        if (this.components[i].getEnabled())
          this.wasEnabled.push(this.components[i]);
        this.components[i].setEnabled(false);
      }
    }
  } else {
    for (var i = 0; i < this.wasEnabled.length; i++) {
      this.wasEnabled[i].setEnabled(true);
    }
  }
};

HTMLDetailPanel.prototype.setReadOnly = function(readonly, force) {
  if (readonly == this.readonly && !force) return;
  this.readonly = readonly;

  if (readonly) {
    this.wasNotReadOnly = new Array();
    for (var i = 0; i < this.components.length; i++) {
      if (this.components[i]) {
        if (!this.components[i].getReadOnly())
          this.wasNotReadOnly.push(this.components[i]);
        this.components[i].setReadOnly(true);
      }
    }
  } else {
    for (var i = 0; i < this.wasNotReadOnly.length; i++) {
      this.wasNotReadOnly[i].setReadOnly(false);
    }
  }
};

HTMLDetailPanel.prototype.freeComponent = function() {
  for (var i = 0; i < this.components.length; i++) {
    if (this.components[i]) this.components[i].free();
  }
};
