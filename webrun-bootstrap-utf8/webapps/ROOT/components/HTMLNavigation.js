function HTMLNavigation(sys, formID, posX, posY, width, height) {
  this.create(sys, formID, posX, posY, width, height);
}

HTMLNavigation.inherits(HTMLElementBase);
HTMLNavigation.prototype.name = 'HTMLNavigation';

HTMLNavigation.prototype.create = function(sys, formID, posX, posY, width, height) {
  this.sys = sys;
  this.formID = formID;
  this.posX = posX;
  this.posY = posY;
  this.width = width;
  this.height = height;
  this.posInsert = 0;
  this.posEdit = 0;
  this.posMain = 0;
  this.posDesign = 0;
  this.queryMode = false;
  this.editMode = false;
  this.insertMode = false;
  this.normalMode = true;
  this.editCancel = false;
  this.buttons = new Array();
  this.edtButtons = new Array();
  this.insButtons = new Array();
  this.manButtons = new Array();
  this.dsgButtons = new Array();
  this.mode = 0;
};

HTMLNavigation.prototype.setReadOnly = function(v) {
  for (i = 0; i < this.buttons.length; i++) this.buttons[i].setReadOnly(v);
};

HTMLNavigation.prototype.setEnabled = function(v) {
  for (i = 0; i < this.buttons.length; i++) this.buttons[i].setEnabled(v);
};

HTMLNavigation.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  if (!this.visible && this.div === "WFRComponentButton") {
    var bar = document.getElementById("WFRComponentButton");
    visibleDiv(bar, v);
  }
};

HTMLNavigation.prototype.createButton = function(img, description, hint, onclick, space, div, width, tab, visible) {
  var bt = new HTMLNavigationButton(this.sys, this.formID, -1, space, 0, width, this.height, hint, img);
  bt.hint = hint;
  bt.hideImage = this.hideButtons;
  bt.onclick = onclick;
  bt.onclickCatch = onclick;
  bt.visible = visible;
  bt.design(div, tab);
  this.buttons.push(bt);
  return bt;
};

HTMLNavigation.prototype.addMainButton = function(img, hint, onclick, width, tab) {
  var bt = this.createButton(img, '', hint, onclick, this.posMain, this.context, width, tab, true);
  this.posMain = this.posMain + width + 1;
  this.manButtons.push(bt);
  return bt;
};

HTMLNavigation.prototype.addEditButton = function(img, description, hint, onclick, tab, width) {
  var bt = this.createButton(img, description, hint, onclick, this.posEdit, this.context, width, tab, false);
  this.posEdit = this.posEdit + width + 1;
  this.edtButtons.push(bt);
  return bt;
};

HTMLNavigation.prototype.addIncludeButton = function(img, description, hint, onclick, tab, width) {
  var bt = this.createButton(img, description, hint, onclick, this.posInsert, this.context, width, tab, false);
  this.posInsert = this.posInsert + width + 1;
  this.insButtons.push(bt);
  return bt;
};

HTMLNavigation.prototype.addDesignButton = function(img, description, hint, onclick, tab, width) {
  var bt = this.createButton(img, description, hint, onclick, this.posDesign, this.context, width, tab, false);
  this.posDesign = this.posDesign + width + 1;
  this.dsgButtons.push(bt);
  return bt;
};

HTMLNavigation.prototype.btVisible = function(arr, v) {
  for (i = 0; i < arr.length; i++) {
    if (arr[i]) arr[i].setVisible(v);
  }
};

HTMLNavigation.prototype.setTabController = function(t) {
  this.tabController = t;
  t.nav = this;
};

HTMLNavigation.prototype.setAlertController = function(a) {
  this.alertController = a;
};

HTMLNavigation.prototype.getMode = function() {
  return this.mode;
};

HTMLNavigation.prototype.edit = function() {
  if (!this.insertMode && !this.editMode) {
    this.mode = 1;
    this.btVisible(this.manButtons, false);
    this.btVisible(this.edtButtons, true);
    this.btVisible(this.insButtons, false);
    this.queryMode = false;
    this.editMode = true;
    this.insertMode = false;
    this.normalMode = false;

    if (this.tabController) {
      this.tabController.edit();
      this.tabController.setSearchTabVisible(false);
      if (!this.focusXY) controller.focusTabFirst();
    }

    if (this.alertController) this.alertController.showEdit(true);

    return true;
  } else return false;
};

HTMLNavigation.prototype.insert = function() {
  if (!this.insertMode && !this.editMode) {
    this.mode = 2;
    this.btVisible(this.manButtons, false);
    this.btVisible(this.edtButtons, false);
    this.btVisible(this.insButtons, true);
    this.queryMode = false;
    this.editMode = false;
    this.insertMode = true;
    this.normalMode = false;

    if (this.tabController) {
      this.tabController.edit();
      this.tabController.setSearchTabVisible(false);
      setTimeout(function() {
        controller.focusFirst();
      }, 0);
    }

    if (this.alertController) this.alertController.showInclude(true);

    return true;
  } else return false;
};

HTMLNavigation.prototype.normal = function() {
  if (!this.normalMode) {
    this.mode = 0;
    this.btVisible(this.manButtons, true);
    this.btVisible(this.edtButtons, false);
    this.btVisible(this.insButtons, false);
    this.queryMode = false;
    this.editMode = false;
    this.insertMode = false;
    this.normalMode = true;

    if (this.tabController) {
      this.tabController.view();
      this.tabController.setSearchTabVisible(true);
    }

    if (this.alertController) {
      this.alertController.showEdit(false);
      this.alertController.showInclude(false);

      this.alertController.unLock();
      this.alertController.recall();
    }

    try {
      mainform.parent.focus();
      mainform.focus();
    } catch (e) { }
  }
};

HTMLNavigation.prototype.formDesign = function() {
  this.btVisible(this.manButtons, false);
  this.btVisible(this.edtButtons, false);
  this.btVisible(this.insButtons, false);
  this.btVisible(this.dsgButtons, true);
  this.queryMode = false;
  this.editMode = false;
  this.insertMode = false;
  this.normalMode = false;

  if (this.tabController) {
    this.tabController.edit();
    this.tabController.setSearchTabVisible(false);
    if (!this.focusXY) controller.focusTabFirst();
  }

  return true;
};

HTMLNavigation.prototype.query = function() {
  this.mode = 3;
  this.queryMode = true;
  this.editMode = false;
  this.insertMode = false;
  this.normalMode = false;
  if (this.tabController) this.tabController.edit();
};

HTMLNavigation.prototype.freeComponent = function() {
  for (var bt in this.edtButtons)
    if (bt.free) bt.free();
  for (var bt in this.insButtons)
    if (bt.free) bt.free();
  for (var bt in this.manButtons)
    if (bt.free) bt.free();
  for (var bt in this.dsgButtons)
    if (bt.free) bt.free();
  this.tabController = null;
  this.alertController = null;
};

HTMLNavigation.prototype.design = function(doc) {
  this.doc = doc;
  this.div = document.createElement("nav");
  this.div.className = "navbar"; // Bootstrap
  doc.appendChild(this.div);
  if (!this.visible) visibleDiv(this.div, false);
};

HTMLNavigation.prototype.getDiv = function(id, x, y, w, h, zindex, display) {
  return getDiv(id, x, y, w, h, zindex, display);
};

HTMLNavigation.prototype.toString = function() {
  return '[object ' + this.name + ']';
};

HTMLNavigation.prototype.flush = function() {
  for (var i in this) {
    if (this[i]) removeEvents(this[i]);
  }
};