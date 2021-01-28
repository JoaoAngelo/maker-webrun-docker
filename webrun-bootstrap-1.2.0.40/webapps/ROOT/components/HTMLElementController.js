function HTMLElementController() {
  this.elems = new Array();
  this.elemsNotTabable = new Array();
  this.elemsByField = new Array();
  this.elemsById = new Array();
  this.formsByGUID = new Array();
  this.idx = -1;
  this.inc = 0;
  this.sorted = false;
  this.maxtab = 0;
  this.formLoaded = false;
}

HTMLElementController.inherits(HTMLObject);

HTMLElementController.prototype.checkRequireds = function() {
  var allElements = this.getAllElements();
  for (var i=0;i<allElements.length;i++) {
    if (allElements[i].required && allElements[i].visible && allElements[i].hasEmptyValue()) {
      if(trim(allElements[i].getDescription()) != ''){
        interactionError(getLocaleMessage("ERROR.REQUIRED_FIELD", allElements[i].getDescription()), function(e) { e.getFocus(true); }, [allElements[i]]);
        return false;
      }
      interactionError(getLocaleMessage("ERROR.REQUIRED_BLANK_FIELD"), function(e) { e.getFocus(true); }, [allElements[i]]);
      return false;
    }
    if (allElements[i].cpf && allElements[i].visible && !CPF(allElements[i].getValue())) {
      interactionError(getLocaleMessage("ERROR.INVALID_CPF_FIELD", allElements[i].getDescription()), function(e) { e.getFocus(true); }, [allElements[i]]);
      return false;
    }
    if (allElements[i].cnpj && allElements[i].visible && !CNPJ(allElements[i].getValue())) {
      interactionError(getLocaleMessage("ERROR.INVALID_CNPJ_FIELD", allElements[i].getDescription()), function(e) { e.getFocus(true); }, [allElements[i]]);
      return false;
    }
    if (allElements[i].validateDataType && !allElements[i].validateDataType(true))
      return false;

    if (allElements[i].checkPost && !allElements[i].checkPost())
      return false;

    if (allElements[i].canCheckRegularExpression && !isNullable(allElements[i].regularExpression) && allElements[i].visible && !testRegularExpression(allElements[i].getValue(), allElements[i].regularExpression)) {
      interactionError(getLocaleMessage("ERROR.INVALID_FIELD_CONTENT", allElements[i].getDescription()), function(e) { e.getFocus(true); }, [allElements[i]]);
      return false;
    }

  }
  return true;
}

HTMLElementController.prototype.doInvisibleComponents = function() {
  var invisibleFields = $mainform().d.WFRForm.invisibleFields.value;
  var flag = false;
  for (var i = 0; i < this.elems.length; i++) {
     if(!this.elems[i].visible && this.elems[i].code != -1 && (invisibleFields.indexOf(this.elems[i].code) == -1)) {
         invisibleFields = invisibleFields + this.elems[i].code + ",";
         flag = true;
      }
  }

  // Remove a vÃ­rgula do fim do campo
  if(flag) {
    invisibleFields = invisibleFields.substr(0,invisibleFields.length - 1);
  }

  $mainform().d.WFRForm.invisibleFields.value = invisibleFields;
}

HTMLElementController.prototype.checkPost = function() {
  for (var i=0;i<this.elems.length;i++) {
    if (!this.elems[i].checkPost())
      return false;
  }
  return true;
}

HTMLElementController.prototype.addForm = function(formCode, GUID) {
  this.formsByGUID[GUID] = formCode;
}

HTMLElementController.prototype.addFormInfo = function(name, code, GUID, loadTime) {
  if (this.formsLoadTime == null)
    this.formsLoadTime = new Array();

  var o = {name: name, code: code, loadTime: loadTime, GUID: GUID}
  this.formsLoadTime.push(o);
}

HTMLElementController.prototype.addNotTabable = function(o) {
  this.elemsNotTabable.push(o);
  if (o.id)
    this.elemsById[o.id] = o;
  if (o.field) {
    if (!this.elemsByField[o.field]) this.elemsByField[o.field] = new Array();
    this.elemsByField[o.field].push(o);
  }
}

HTMLElementController.prototype.addTabable = function(o) {
  this.idx = this.idx + 1;
  this.elems.push(o);
  o.indexArray = this.idx;

  if(o instanceof HTMLNavigationButton){
    orderTab.push(o);
  }

  if (o.tabindex > 0)
    o.tabindex = o.tabindex + (this.inc/1000);
  else
    o.tabindex = this.inc;

  this.inc = this.inc + 1;
  this.sorted = false;
  if (o.field) {
    if (!this.elemsByField[o.field]) this.elemsByField[o.field] = new Array();
    this.elemsByField[o.field].push(o);
  }
  if (o.id)
    this.elemsById[o.id] = o;
  }

HTMLElementController.prototype.getElements = function(attribute, value) {
  if (!attribute) return this.getAllElements();

  var all = this.getAllElements();
  var elems = new Array();
  for (var i in all) {
    if (typeof(all[i]) == 'function') continue;
    if (all[i] && all[i][attribute] == value)
      elems.push(all[i]);
  }
  return elems;

}

HTMLElementController.prototype.getElementsByField = function(field) {
  return this.elemsByField[field];
}

HTMLElementController.prototype.getElementById = function(id, formID) {
  if (!formID) {
    return this.elemsById[id];
  } else {
    var elems = this.getElementsByForm(formID);
    for (var i in elems) {
      if (typeof(elems[i]) == 'function') continue;
      if (elems[i] && elems[i].id == id)
        return elems[i];
    }
  }

  interactionError(getLocaleMessage("ERROR.COMPONENT_FIELD_NOT_FOUND", id));
}

HTMLElementController.prototype.getElementByCode = function(code) {
  var all = this.getAllElements();
  for (var i in all) {
    if (typeof(all[i]) == 'function') continue;
    if (all[i] && all[i].code == code)
      return all[i];
  }
}

HTMLElementController.prototype.getElementsByTab = function(tab) {
  return this.getElementsByDiv(tab.div);
}

HTMLElementController.prototype.getElementByTab = function(tab, name) {
  var elems = this.getElementsByTab(tab);
  for (var index in elems) {
    var elem = elems[index];
    if (elem && elem.getId && (elem.getId() == name)) {
      return elem;
    }
  }

  return null;
}

HTMLElementController.prototype.getElementsByDiv = function(div) {
  var all = this.getAllElements();
  var elems = new Array();
  for (var i in all) {
    if (typeof(all[i]) == 'function') continue;
    if (all[i] && all[i].doc == div) elems.push(all[i]);
  }

  return elems;
}

HTMLElementController.prototype.getElementsByForm = function(formID) {
  if (!isNumeric(formID)) formID = this.formsByGUID[formID];
  var elems = new Array();
  if (formID) {
    var all = this.getAllElements();
    for (var i in all) {
      if (typeof(all[i]) == 'function') continue;
      if (all[i] && all[i].formID == formID)
        elems.push(all[i]);
    }
  }
  return elems;
}

HTMLElementController.prototype.verifyComponent = function(obj) {
  if (typeof obj == "string") {
    return this.elemsById[obj];
  } else {
    return obj;
  }
}

HTMLElementController.prototype.showLoadTime = function() {
  var r = '';

  if (this.formsLoadTime) {
    for (var i = 0; i < this.formsLoadTime.length; i++) {
      var form = this.formsLoadTime[i];
      var showLoadTime = form.loadTime;
      if (parseInt(form.loadTime) > 50)
        showLoadTime = '<font color=#FF0000><b>'+showLoadTime+'ms</b></font>';
      else
        showLoadTime += 'ms';
      r += '<b><font color=#0000FF> '+getLocaleMessage("LABEL.FORM")+form.name+'</font></b>' + ': ' + showLoadTime + '\n';
    }
  }

  var all = this.getAllElements();
  for (var i = 0; i < all.length; i++) {
    var element = all[i];
    if (isNullable(element.getCode()) || element.getCode() <= 0) {
      continue;
    }

    var description = element.getDescription();

    if (!description || description.length == 0) {
      description = (getLocaleMessage("LABEL.COMPONENT") + " " + element.getCode());
    }

    var loadTime;
    if (!isNumeric(element.loadComponentTime)) {
      loadTime = 'NÃ£o Informado';
    } else {
      loadTime = element.loadComponentTime;
      if (parseInt(loadTime) > 50) {
        loadTime = '<font color=#FF0000><b>'+loadTime+'ms</b></font>';
      } else {
        loadTime = loadTime+'ms';
      }
    }

    r += ('<b>'+description+'</b>' + ': ' + loadTime + '\n');
  }

  interactionMessage(r);
}


HTMLElementController.prototype.getAllElements = function() {
  var allElements = new Array();
  allElements = allElements.concat(this.elems);
  allElements = allElements.concat(this.elemsNotTabable);
  return allElements;
}

HTMLElementController.prototype.getTabableElements = function() {
  return this.elems;
}

HTMLElementController.prototype.getNotTabableElements = function() {
  return this.elemsNotTabable;
}

HTMLElementController.prototype.getTabElements = function(tabController) {
  var all = this.getAllElements();
  var formElems = new Array();
  for (var i=0;i<all.length;i++)
    if (all[i] && !all[i].ignore && tabController.getTabByDiv(all[i].doc) != null)
      formElems.push(all[i]);
  return formElems;
}

HTMLElementController.prototype.getFormElements = function() {
  return this.getDBAwareElements()
}

HTMLElementController.prototype.getDBAwareElements = function() {
  var all = this.getAllElements();
  var formElems = new Array();
  for (var i = 0;i < all.length; i++)
    if (all[i] && all[i].field)
      formElems.push(all[i]);
  return formElems;
}

HTMLElementController.prototype.remove = function(o) {
  arrayRemove(this.elems, o);
  arrayRemove(orderTab, o);
  arrayRemove(this.elemsNotTabable, o);

  var arr = this.elemsByField[o.field];
  if (o.field && arr) arrayRemove(arr, o);
  if (o.id) delete this.elemsById[o.id];
}

HTMLElementController.prototype.focusFirst = function() {
  if (!this.sorted) {
    this.elems.sort(this.sortFn);
    this.sorted = true;
  }

  this.next(this.elems[this.elems.length-1], false);
}

HTMLElementController.prototype.focusTabFirst = function() {
  if (!this.sorted) {
    this.elems.sort(this.sortFn);
    this.sorted = true;
  }

  for (var i = 0; i < this.elems.length; i++) {
    var elem = this.elems[i];
    if (elem.focus()) {
      break;
    }
  }
}

HTMLElementController.prototype.focusXY = function(mx, my, offset) {
  function isInArea(elem, mx, my, offset) {
    var isIn = false;

    var x = elem.posX;
    var y = elem.posY + offset;
    var w = elem.width;
    var h = elem.height;

    if (elem.labelDivHeight) {
      y += elem.labelDivHeight;
    }

    if ((mx >= x && mx <= (x+w)) && (my >= y && my <= (y+h))) {
      isIn = true;
    }

    return isIn;
  }

  if (!this.sorted) {
    this.elems.sort(this.sortFn);
    this.sorted = true;
  }

  var found = false;
  for (var i in this.elems) {
    if (typeof(this.elems[i]) == 'function') continue;
    var elem = this.elems[i];
    if (isInArea(elem, mx, my, offset) && elem.focus()) {
      found = true;
      break;
    }
  }

  if (!found) this.focusTabFirst();
}


HTMLElementController.prototype.next = function(o, invert) {
  var controle;

  if (!$mainform().orderTab) {
    orderTab  = this.elems;
    this.sorted = true;
  }

  if (!this.sorted) {
    this.sortOrderTab();
    this.sorted = true;
  }

  if (!invert) {
    controle = arrayIndexOf(orderTab, o) + 1;
  } else{
    controle = arrayIndexOf(orderTab, o) - 1;
  }

  window.setTimeout(function() { tabAsync(orderTab, controle, invert); }, 2);
};

HTMLElementController.prototype.sortOrderTab = function(){
  for (var i = orderTab.length - 1; i >= 0; i--) {
    var t;
    if (typeof orderTab[i] === 'number') {
      t = eval('d.c_' + orderTab[i]);
    } else {
      t = orderTab[i];
    }

    if (arrayIndexOf(this.elems, t) != -1) {
      if (arrayIndexOf(orderTab, t.code) != -1) {
        orderTab.splice(arrayIndexOf(orderTab, t.code), 1, t);
      }
    } else {
      if (arrayIndexOf(orderTab, t) != -1)
        orderTab.splice(arrayIndexOf(orderTab, t), 1);
      else
        orderTab.splice(arrayIndexOf(orderTab, t.code), 1);
    }
  }

  var keys = detailPanelComponentsTab.getKeys();
  var values = detailPanelComponentsTab.getValues();
  for (var i = keys.length; i > 0; i--) {
    if (this.elems.indexOf(keys[i]) != -1) {
      orderTab.splice(arrayIndexOf(orderTab, values[i]) + 1, 0 , keys[i]);
    }
  }
};

HTMLElementController.prototype.sortFn = function(a,b) {
  if (parseFloat(a.tabindex) < parseFloat(b.tabindex)) return -1;
  if (parseFloat(a.tabindex) > parseFloat(b.tabindex)) return 1;
  if (parseFloat(a.tabindex) == parseFloat(b.tabindex)) return 0;
};

HTMLElementController.prototype.removeNavigator = function() {
  document.n.setVisible(false);
  document.n.freeButtons();
  if (document.n.alertController) {
    document.n.alertController.free(true);
    document.n.alertController = null;
  }

  for (var i = 0; i < document.body.childNodes.length; i++) {
    var tagName = document.body.childNodes[i].tagName;
    if (tagName && tagName.toUpperCase() == "TABLE") {
      document.body.removeChild(document.body.childNodes[i]);
      break;
    }
  }

  document.t.div.style.top = "1px";
};

HTMLElementController.prototype.flush = function() {
  var allElements = this.getAllElements();

  for (var i = 0; i < allElements.length; i++) {
    if (allElements[i].flush) allElements[i].flush();
    try { eval('document.c_' + allElements[i].code + ' = null;'); } catch(e) { }
  }

  if (debugManager) {
    debugManager.flush();
  }
}

HTMLElementController.prototype.getSelectedComponent = function() {
  return this.selectedComponent;
}

HTMLElementController.prototype.setSelectedComponent = function(selectedComponent) {
  this.selectedComponent = selectedComponent;
}

HTMLElementController.prototype.hasSelectedComponent = function() {
  return this.selectedComponent != null;
}

HTMLElementController.prototype.onComponentSelectionChangeAction = function(lastSelectedComponent, currentSelectedComponent) {
  if (this.oncomponentselectionchange) this.oncomponentselectionchange(lastSelectedComponent, currentSelectedComponent);
}

HTMLElementController.prototype.setComponentSelectionChangeAction = function(func) {
  if (typeof func == "string") {
    this.oncomponentselectionchange = new Function(func);
  } else {
    this.oncomponentselectionchange = func;
  }
}

HTMLElementController.prototype.onRightClickAction = function(e, component) {
  if (this.onrightclick) this.onrightclick(e, component);
}

HTMLElementController.prototype.setRightClickAction = function(func) {
  if (typeof func == "string") {
    this.onrightclick = new Function(func);
  } else {
    this.onrightclick = func;
  }
}

HTMLElementController.prototype.onFormLoadAction = function() {
  this.formLoaded = true;

  for (var i = 0; i < this.elems.length; i++) {
    if (this.elems[i].onFormLoadAction) {
      this.elems[i].onFormLoadAction();
    }
  }

  for (var i = 0; i < this.elemsNotTabable.length; i++) {
    if (this.elemsNotTabable[i].onFormLoadAction) {
      this.elemsNotTabable[i].onFormLoadAction();
    }
  }
}

HTMLElementController.prototype.beforeSubmit = function() {
  var elems = this.getFormElements();
  for (var i = 0; i < elems.length; i++) {
    if (elems[i] && elems[i].beforeSubmit) {
      elems[i].beforeSubmit();
    }
  }
}

HTMLElementController.prototype.afterSubmit = function() {
  var elems = this.getFormElements();
  for (var i = 0; i < elems.length; i++) {
    if (elems[i] && elems[i].afterSubmit) {
      elems[i].afterSubmit();
    }
  }
}

var controller = new HTMLElementController();