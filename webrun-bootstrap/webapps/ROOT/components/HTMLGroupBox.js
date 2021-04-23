function HTMLGroupBox(sys, formID, code, posX, posY, width, height, description, value) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.style = 0;
  this.nodesc = false;
}

HTMLGroupBox.inherits(HTMLContainer);
HTMLGroupBox.prototype.name = 'HTMLGroupBox';

HTMLGroupBox.prototype.setStyle = function(style) {
  this.style = style;
  this.designComponent(this.doc);
};

HTMLContainer.prototype.setNoDescription = function(v) {
  this.nodesc = v;
};

HTMLGroupBox.prototype.setX = function(posX) {
  this.callMethod(HTMLElementBase, "setX", [posX]);
  this.updateLayout();
};

HTMLGroupBox.prototype.setY = function(posY) {
  this.callMethod(HTMLElementBase, "setY", [posY]);
  this.updateLayout();
};

HTMLGroupBox.prototype.setWidth = function(width) {
  this.callMethod(HTMLElementBase, "setWidth", [width]);
  this.updateLayout();
};

HTMLGroupBox.prototype.setHeight = function(height) {
  this.callMethod(HTMLElementBase, "setHeight", [height]);
  this.updateLayout();
};

HTMLGroupBox.prototype.setVisible = function(visible) {
  this.callMethod(HTMLElementBase, "setVisible", [visible]);
  this.updateLayout();
};

HTMLGroupBox.prototype.designGroupBox = function(doc) {
  // Definir borda da group box.
  if (this.style == 0) this.div.className += " border"; // Caixa // Bootstrap
  else if (this.style == 1) this.div.className += " card"; // Moldura // Bootstrap
  else if (this.style == 2) this.div.className += " border-top border-bottom-0 border-left-0 border-right-0"; // Linha Acima // Bootstrap
  else if (this.style == 3) this.div.className += " border-top-0 border-bottom border-left-0 border-right-0"; // Linha Abaixo // Bootstrap
  else if (this.style == 4) this.div.className += " border-top-0 border-bottom-0 border-left border-right-0"; // Linha a Esquerda // Bootstrap
  else if (this.style == 5) this.div.className += " border-top-0 border-bottom-0 border-left-0 border-right"; // Linha a Direita // Bootstrap
  else if (this.style == 6) this.div.className += " border-0"; // Sem Borda // Bootstrap

  if (this.style == 0 || this.style == 1 || this.style == 2 ||
      this.style == 3 || this.style == 4 || this.style == 5) {

    // Definir estilo group box.
    if (this.styleMold == 0) this.div.className += " border-inset"; // Custom
    else if (this.styleMold == 1) this.div.className += " border-outset"; // Custom

    if (this.description && this.description.trim().length > 0 && this.name !== "HTMLDetailPanel") {
      this.header = document.createElement("div");

      this.header.style.flex = "0 0 auto"; // Correção para o Safari e IE
      if(this.classic){
        this.header.className = "position-absolute p-1"; // Bootstrap
        this.header.style.marginTop = "-0.6rem";
        this.header.style.marginLeft = "0.5rem";
        this.header.style.zIndex = this.zindex;
        doc.appendChild(this.header);

        var object = this;
        window.addEventListener("resize", function() {
          if (object) object.updateLayout();
        });
      } else{
        this.header.className = "card-header px-3 py-2"; // Bootstrap
        this.div.appendChild(this.header);
      }     

      this.label = document.createElement("label");
      this.label.className = "d-block mb-0"; // Bootstrap
      this.label.id = "WFRSpanComponent" + this.code;
      this.label.innerHTML = this.description;
      this.header.appendChild(this.label);
    }
  }
};

HTMLGroupBox.prototype.updateLayout = function() {
  if (this.header && this.classic) {
    this.header.style.backgroundColor = this.bgColor ? this.bgColor : window.getComputedStyle(document.body).backgroundColor;
    this.header.style.top = this.div.offsetTop + "px";
    this.header.style.left = this.div.offsetLeft + "px";
    this.header.style.lineHeight = "0.7";

    if (this.visible) this.header.style.display = null;
    else this.header.style.display = "none";
  }
};

HTMLGroupBox.prototype.designComponent = function(doc) {
  this.callMethod(HTMLContainer, "designComponent", [doc]);
  this.designGroupBox(doc);
};

HTMLGroupBox.prototype.afterInit = function() {
  this.callMethod(HTMLContainer, "afterInit", []);
  if (this.codigoForm !== null && this.codigoForm !== undefined && this.codigoForm !== 0) {
    ebfFrameOpenFilteredForm(this.formID, this.id, this.codigoForm, true, this.params, true);
  }

  // O componente deve por padrão ter transparência quando não for setado a cor.
  if (!this.bgColor) this.div.style.backgroundColor = 'transparent';

  if(this.classic){
    if (this.tab) {
      var object = this;
      this.tab.addShownListener(function() {
        if (object) object.updateLayout();
      });
    }
  }

  this.updateLayout();
};

HTMLGroupBox.prototype.flush = function() {
  if (this.label && this.label.flush)
    this.label.flush();
  this.label = null;
  this.description = null;
  this.hidden = null;
  this.callMethod(HTMLElementBase, "flush", []);
};
