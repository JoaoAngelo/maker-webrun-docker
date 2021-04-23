function HTMLLabeledComponent(sys, formID, code, posX, posY, width, height, description, value) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
}

HTMLLabeledComponent.inherits(HTMLElementBase);
HTMLLabeledComponent.prototype.name = 'HTMLLabeledComponent';
HTMLLabeledComponent.prototype.labelDivHeight = 15;

HTMLLabeledComponent.prototype.createLabelDiv = function() {
  this.label = document.createElement("label");
  this.label.name = "WFRComponentLabel" + this.code;
  this.div.appendChild(this.label);
  return this.label;
};

HTMLLabeledComponent.prototype.design = function(doc, tabControl) {
  this.doc = doc;
  this.div = this.getBaseDiv(true, this.posX, this.posY, this.width, this.height);
  this.context = this.div;

  if (this.description && this.description.length > 0) {
    this.createLabelDiv();
  }

  this.designComponent(doc);
  doc.appendChild(this.div);

  this.updateLabel();
  this.init(tabControl);
};

HTMLLabeledComponent.prototype.setDescription = function(description) {
  this.description = description.toString(); // Força o tipo para String
  if (this.label) this.label.innerHTML = this.decorateRequired(this.description, this.required);
};

HTMLLabeledComponent.prototype.flush = function() {
  if (this.label) {
    if (this.label.onmousedown) this.label.onmousedown = null;
    if (this.label.onselectstart) this.label.onselectstart = null;
    this.label = null;
  }

  this.callMethod(HTMLElementBase, "flush");
};

HTMLLabeledComponent.prototype.setColor = function(color) {
  this.color = color;
};

HTMLLabeledComponent.prototype.setBGColor = function(color) {
  this.bgColor = color;
};

HTMLLabeledComponent.prototype.updateLabel = function() {
  if (this.label) {
    this.label.className = "form-label"; // Custom
    if (this.required) this.label.className += " required";
    if (this.input && this.input.id) this.label.setAttribute("for", this.input.id);
    this.label.innerHTML = this.decorateRequired(this.description, this.required);
    this.label.style.whiteSpace = "pre";
    if (this.description && this.labelPosition) {
      if (this.labelPosition == '1') { // Alinhar abaixo do componente
        this.label.className += " bottom";
        if (this.required) this.label.className += " required";
        if (this.div && this.div.className.indexOf("labeled-bottom") == -1) {
          this.div.className += " labeled-bottom"; // CSS Responsivo
          this.divClass = this.div.className;
        }

        try {
          // Anexar a label após o input.
          if (this.label.parentElement && this.label.parentElement.lastChild != this.label) {
            this.label.parentElement.appendChild(this.label);
          }
        } catch (e) { }
      } else if (this.labelPosition == '2') { // Alinhar a esquerda do componente
        this.label.className += " left";
        if (this.required) this.label.className += " required";
        if (this.div && this.div.className.indexOf("labeled-left") == -1) {
          this.div.className += " labeled-left"; // CSS Responsivo
          this.divClass = this.div.className;
        }
      } else if (this.labelPosition == '3') { // Alinhar a direita do componente
        this.label.className += " right";
        if (this.required) this.label.className += " required";
        if (this.div && this.div.className.indexOf("labeled-right") == -1) {
          this.div.className += " labeled-right"; // CSS Responsivo
          this.divClass = this.div.className;
        }
      } else { // Alinhar acima do componente
        this.label.className += " top";
        if (this.required) this.label.className += " required";
        if (this.div && this.div.className.indexOf("labeled-top") == -1) {
          this.div.className += " labeled-top"; // CSS Responsivo
          this.divClass = this.div.className;
        }
      }
    } else { // Alinhar acima do componente
      this.label.className += " top";
      if (this.required) this.label.className += " required";
      if (this.div && this.div.className.indexOf("labeled-top") == -1) {
        this.div.className += " labeled-top"; // CSS Responsivo
        this.divClass = this.div.className;
      }
    }

    // Verificar se possui estilo personalizado para a descrição.
    if (this.fontDescStyle) {
      // Definir o estilo da descrição.
      this.label.setAttribute("style", this.label.hasAttribute("style") ?
        (this.label.getAttribute("style") + " " + this.fontDescStyle).trim() :
        this.fontDescStyle);
    }

    // Distância das labels em relação ao input.
    var labelDistanceX = "0.4rem";
    var labelDistanceY = "0.25rem";

    if (this.labelPosition == '1') { // Alinhar abaixo do componente
      this.label.style.top = "calc(100% + " + labelDistanceY + ")";
    } else if (this.labelPosition == '2') { // Alinhar a esquerda do componente
      if (isIE || isIE11) { // Correção para funcionar no IE.
        this.label.style.transform = "translateX(-100%)";
        this.label.style.paddingRight = labelDistanceX;
      } else {
        this.label.style.right = "calc(100% + " + labelDistanceX + ")";
      }
    } else if (this.labelPosition == '3') { // Alinhar a direita do componente
      this.label.style.left = "calc(100% + " + labelDistanceX + ")";
    } else { // Alinhar acima do componente
      this.label.style.bottom = "calc(100% + " + labelDistanceY + ")";
    }
  }
};
