function HTMLPanel(sys, formID, code, posX, posY, width, height, description, value) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.style = 1;
  this.zindex = 1;
  this.nodesc = false;
}

HTMLPanel.inherits(HTMLGroupBox);

HTMLPanel.prototype.name = 'HTMLPanel';
HTMLPanel.prototype.tabable = true;
