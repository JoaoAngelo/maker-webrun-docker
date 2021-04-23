function HTMLHidden(sys, formID, code, value) {
  this.sys = sys;
  this.code = code;
  this.value = value;
  this.inputname = 'WFRInput' + this.code;
  this.formID = formID;
}

HTMLHidden.inherits(HTMLElementBase);
HTMLHidden.prototype.name = 'HTMLHidden';

HTMLHidden.prototype.isRequired = function() { return this.required; };
HTMLHidden.prototype.setValue = function(value) {
  value = normalizeRuleParam(value, true);
  this.value = value;
  this.hidden.value = value;
};

HTMLHidden.prototype.getCode = function() { return this.code; };
HTMLHidden.prototype.setDecoration = function() { };
HTMLHidden.prototype.setX = function(posX) { };
HTMLHidden.prototype.setY = function(posY) { };
HTMLHidden.prototype.design = function(doc) {
  this.hidden = document.createElement("input");
  this.hidden.name = this.inputname;
  this.hidden.value = this.value;
  this.hidden.setAttribute('type', 'hidden');
  doc.appendChild(this.hidden);
  this.init(false);
};

HTMLHidden.prototype.focus = function() { return false; };
HTMLHidden.prototype.blur = function() { return false; };
HTMLHidden.prototype.setVisible = function() { return false; };
HTMLHidden.prototype.setReadOnly = function() { return false; };
HTMLHidden.prototype.setEnabled = function() { return false; };
HTMLHidden.prototype.toString = function() { return "[object HTMLHidden]"; };
HTMLHidden.prototype.toPermissionMode = function() { };
