function HTMLTreeViewLevel(sys, formID, code, posX, posY, width, height, value) {
  this.create(sys, formID, code, posX, posY, width, height, '', value);
  this.type = 1;
  this.autoCollapse = false;
  this.check = false;
  this.radio = false;
  this.maxCode = 0;
  this.id = value;
  this.color = "";
  this.border = false;
  this.selectedColor = "";
}

HTMLTreeViewLevel.inherits(HTMLElementBase);
HTMLTreeViewLevel.prototype.name = 'HTMLTreeViewLevel';
HTMLTreeViewLevel.prototype.tabable = false;
HTMLTreeViewLevel.prototype.zindex = 99999;

HTMLTreeViewLevel.prototype.designComponent = function(doc) { };