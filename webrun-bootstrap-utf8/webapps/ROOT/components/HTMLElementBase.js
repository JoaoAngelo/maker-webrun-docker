document.write("<script type=\"text/javascript\" src=\"wfr_masks.js\"></script>");
let resize_grid, initContainer = false;
var containerComponentsDesign = [];

/**
 * HTMLElementBase
 **/
function HTMLElementBase(sys, formID, code, posX, posY, width, height, description, value) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
}

HTMLElementBase.inherits(HTMLObject);
HTMLElementBase.prototype.name = 'HTMLElementBase';
HTMLElementBase.prototype.tabKeys = [9, 10, 13];
HTMLElementBase.prototype.tabable = true;
HTMLElementBase.prototype.zindex = 1;
HTMLElementBase.prototype.tagName = 'input';
HTMLElementBase.prototype.canSelectOnFocus = true;
HTMLElementBase.prototype.canCheckRegularExpression = false;

HTMLElementBase.prototype.create = function(sys, formID, code, posX, posY, width, height, description, value) {
  this.loadScripts();
  this.sys = sys;
  this.formID = formID;
  this.code = code;
  this.posX = posX;
  this.posY = posY;
  this.width = parseInt(width);
  this.height = parseInt(height);
  this.value = normalizeRuleParam(value, true);
  this.font = null;
  this.size = null;
  this.description = description;
  this.enabled = true;
  this.visible = true;
  this.readonly = false;
  this.required = false;
  this.focuzed = false;
  this.dependent = false;
  this.tabindex = 0;
  this.maskSuport = false;
  this.componentDependences = [];
  this.decorationChanged = false;
  this.remainNotDBAwareValue = true;
};

HTMLElementBase.prototype.getBaseDiv = function(root, x, y, width, height) {
  var div = getDiv("WFRComponent" + this.code, x, y, width, height, this.zindex);
  div.className = "form-group"; // Bootstrap
  if (root) div.setAttribute("webrun-type", this.name);
  return div;
};

HTMLElementBase.prototype.beforeSubmit = function() { };
HTMLElementBase.prototype.afterSubmit = function() { };

HTMLElementBase.prototype.setX = function(posX) {
  this.posX = parseInt(posX);
  if (this.div) this.div.style.left = this.posX + "px";
};

HTMLElementBase.prototype.setY = function(posY) {
  this.posY = parseInt(posY);
  if (this.div) this.div.style.top = this.posY + "px";
};

HTMLElementBase.prototype.setWidth = function(width) {
  this.width = parseInt(width);
  if (this.div) {
    this.div.style.width = this.width + "px";
    if (this.div != this.context) this.context.style.width = this.div.style.width;
    if (this.input) this.input.style.width = this.div.style.width;
  }
};

HTMLElementBase.prototype.setHeight = function(height) {
  this.height = parseInt(height);
  if (this.div) {
    this.div.style.height = this.height + "px";
    if (this.div != this.context) this.context.style.height = this.div.style.height;
    if (this.input) this.input.style.height = this.div.style.height;
  }
};

HTMLElementBase.prototype.setStyleCss = function(styleCss) {
  this.setAttribute("style", styleCss);
};

HTMLElementBase.prototype.setValue = function(value, checkDependences) {
  value = normalizeRuleParam(value, true);
  var temp = this.getValue();
  this.value = value;
  if (this.input) this.input.value = value;
  if (trim(this.value) != trim(temp)) this.changeAction(null, this, !checkDependences);
};

HTMLElementBase.prototype.setDescription = function(description) {
  this.description = description;
  if (this.label && this.label.setDescription) {
    this.label.setDescription(description.replace(/\s/g, '&nbsp;'));
  } else if (this.label) this.label.innerHTML = description.replace(/\s/g, '&nbsp;');
};

HTMLElementBase.prototype.setColor = function(color) {
  this.color = color;
  if (this.div) this.div.style.color = color;
};

HTMLElementBase.prototype.setBGColor = function(color) {
  this.bgColor = color;
  if (this.div) this.div.style.backgroundColor = color;
};

HTMLElementBase.prototype.setEnabled = function(v) {
  this.enabled = parseBoolean(v);
  if (this.input) this.input.disabled = !this.enabled || this.readonly;
  if (this.div) {
    if (this.enabled) this.div.style.removeProperty("pointer-events");
    else this.div.style.setProperty("pointer-events", "none");
  }
};

HTMLElementBase.prototype.setVisible = function(v) {
  this.visible = parseBoolean(v);
  if (this.div) {
    if (this.visible) this.div.style.display = null;
    else this.div.style.setProperty("display", "none", "important");
  }
};

HTMLElementBase.prototype.isTrueVisible = function() {
  return this.div && (this.visible || isVisibleDiv(this.div));
};

HTMLElementBase.prototype.setReadOnly = function(v) {
  this.readonly = parseBoolean(v);
  if (this.input) this.input.readOnly = v;
};

HTMLElementBase.prototype.focus = function() {
  var r = this.tabable && this.enabled && this.isTrueVisible() && !this.readonly && !this.resizable && !this.draggable;
  if (this.doc) r = r && isVisibleDiv(this.doc);
  if (r && this.input) {
    this.input.focus();
    this.focuzed = true;
  }

  return r;
};

HTMLElementBase.prototype.getTabName = function() {
  return this.doc.tabName;
};

HTMLElementBase.prototype.getFocus = function(fromKeyBoard) {
  try {
    if (this.tabable && this.enabled && this.isTrueVisible() && !this.readonly && !this.resizable && !this.draggable) {
      if (this.doc && this.doc.focus && this.doc.canFocus != null && !this.doc.canFocus.call(this)) return false;
      this.fromKeyBoard = fromKeyBoard;
      try {
        if (!this.doc.focus.isHTMLAction) this.doc.focus();
        else this.doc.focus.call(this);
      } catch (e) { }
      return this.focus();
    } else return false;
  } catch (e) {
    return false;
  }
};

HTMLElementBase.prototype.blur = function() {
  var r = this.enabled && this.isTrueVisible() && !this.readonly;
  if (r && this.input) {
    this.input.blur();
    this.focuzed = false;
  }

  return r;
};

HTMLElementBase.prototype.updateLabel = function() { };

HTMLElementBase.prototype.setFont = function(f) {
  this.font = f;

  if (this.input) this.input.style.fontFamily = f;
  if (this.label) {
    if (this.label.setFont) this.label.setFont(f);
    else this.label.style.fontFamily = f;
    this.updateLabel();
  }
};

HTMLElementBase.prototype.setSize = function(s) {
  if (s.toString().indexOf("pt") == -1) s += "pt";
  this.size = s;

  if (this.input) this.input.style.fontSize = s;
  if (this.label) {
    if (this.label.setSize) this.label.setSize(s);
      else this.label.style.fontSize = s;
    this.updateLabel();
  }
};

HTMLElementBase.prototype.setWeight = function(w) {
  this.weight = w;

  if (this.input) {
    if (w) this.input.style.fontWeight = "bold";
    else this.input.style.fontWeight = "normal";
  }

  if (this.label) {
    if (w) this.label.style.fontWeight = "bold";
    else this.label.style.fontWeight = "normal";
  }
};

HTMLElementBase.prototype.setItalic = function(w) {
  this.italic = w;

  if (this.input) {
    if (w) this.input.style.fontStyle = "italic";
    else this.input.style.fontStyle = "normal";
  }

  if (this.label) {
    if (w) this.label.style.fontStyle = "italic";
    else this.label.style.fontStyle = "normal";
  }
};

HTMLElementBase.prototype.setUnderline = function(u) {
  this.underline = u;
  this.setTextDecoration();
};

HTMLElementBase.prototype.setStrikeout = function(st) {
  this.strikeout = st;
  this.setTextDecoration();
};

HTMLElementBase.prototype.setTextDecoration = function() {
  var textDecoration = "";
  if (this.underline || this.strikeout) {
    if (this.underline) textDecoration += "underline";
    if (this.strikeout) textDecoration += " line-through";
  } else textDecoration = "none";
  if (this.input) this.input.style.textDecoration = textDecoration;
  if (this.label) this.label.style.textDecoration = textDecoration;
};

HTMLElementBase.prototype.hasEmptyValue = function() { return (this.getValue() == ''); };

// font, fontSize, fontWeight, italic, underline, strikeout, setBGColor, setColor
HTMLElementBase.prototype.setDecoration = function(f, s, w, i, u, st, bc, c) {
  this.decorationChanged = true;
  this.font = f;
  this.size = s;
  this.weight = w;
  this.italic = i;
  this.underline = u;
  this.strikeout = st;
  this.bgColor = bc;
  this.color = c;
};

HTMLElementBase.prototype.getHint = function() { return this.hint; };
HTMLElementBase.prototype.setHint = function(hint) {
  this.hint = hint;

  if (this.input) {
    let init = this.input.hint ? false : true;
    if (this.input.getAttribute("data-original-title")) {
      this.input.setAttribute("data-original-title", hint.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    } else {
      this.input.setAttribute("data-toggle", "tooltip"); // Bootstrap
      this.input.setAttribute("data-html", "true"); // Bootstrap
      this.input.hint = hint;
      this.input.title = hint.replace(/(?:\r\n|\r|\n)/g, '<br />');
      if (init) bootstrapInitTooltip(this.input);
    }
  }
};

HTMLElementBase.prototype.getSystem = function() { return this.sys; };
HTMLElementBase.prototype.getForm = function() { return this.formID; };
HTMLElementBase.prototype.getCode = function() { return this.code; };
HTMLElementBase.prototype.getX = function() { return this.posX; };
HTMLElementBase.prototype.getY = function() { return this.posY; };
HTMLElementBase.prototype.getWidth = function() { return this.width; };
HTMLElementBase.prototype.getHeight = function() { return this.height; };
HTMLElementBase.prototype.getValue = function() { return this.value; };
HTMLElementBase.prototype.getShowValue = function() { return this.getValue(); };
HTMLElementBase.prototype.getGridShowValue = function(element, row, index, oldValue, dataArray) { return dataArray[index]; };
HTMLElementBase.prototype.getDescription = function() { return this.description; };
HTMLElementBase.prototype.getColor = function() { return this.color ? this.color : ''; };
HTMLElementBase.prototype.getBGColor = function() { return this.bgColor; };
HTMLElementBase.prototype.getStyle = function() { return this.input.style; };
HTMLElementBase.prototype.getFont = function() { return this.font ? this.font : ''; };
HTMLElementBase.prototype.getSize = function() { return this.size; };
HTMLElementBase.prototype.isRequired = function() { return this.required; };
HTMLElementBase.prototype.getVisible = function() { return this.visible; };
HTMLElementBase.prototype.getEnabled = function() { return this.enabled; };
HTMLElementBase.prototype.getReadOnly = function() { return this.readonly; };
HTMLElementBase.prototype.canRemainNotDBAwareValue = function() { return !this.isDBAware() && this.remainNotDBAwareValue; };

HTMLElementBase.prototype.ensureVisibility = function() {
  if (!this.getVisible()) {
    this.setVisible(true);
    this.setVisible(false);
  }
};

HTMLElementBase.prototype.toString = function() {
  if (this.description && this.description.length > 0) return '[object ' + this.name + ': ' + this.description + ']';
  else return '[object ' + this.name + ']';
};

HTMLElementBase.prototype.decorateRequired = function(text, required) {
  if (required) return text + '<span class="text-danger">&nbsp;*</span>'; // Bootstrap
  else return text;
};

HTMLElementBase.prototype.getDiv = function(id, x, y, w, h, zindex, visibility) {
  return getDiv(id, x, y, w, h, zindex, visibility);
};

HTMLElementBase.prototype.setReadOnlyDiv = function(v) {
  if (!this.readOnlyDiv) {
    this.readOnlyDiv = this.getDiv("ReadOnlyDiv" + this.code, 0, 0, "100%", "100%", 100005, true);
    this.readOnlyDiv.style.position = "absolute";
    this.readOnlyDiv.style.top = "0px";
    this.readOnlyDiv.style.left = "0px";
    this.readOnlyDiv.style.right = "0px";
    this.readOnlyDiv.style.bottom = "0px";
  }

  if (!v) {
    if (containsNode(this.div, this.readOnlyDiv)) {
      this.div.removeChild(this.readOnlyDiv);
    }
  } else {
    if (!containsNode(this.div, this.readOnlyDiv)) {
      this.div.appendChild(this.readOnlyDiv);
    }
  }
};

HTMLElementBase.prototype.design = function(doc, tabControl) {
  this.doc = doc;

  this.div = this.getBaseDiv(true, this.posX, this.posY, this.width, this.height);
  this.divClass = this.div.className;

  if(this instanceof HTMLContainer && this.container){
    if(doc){
      doc.appendChild(this.div);
    }else{
      let elem = this;
      initContainer = true;
      containerComponentsDesign.push(function(){
        document.getElementById(elem.container).appendChild(elem.div);
        elem.afterInit();
      });

      doc = d.t.getDiv();

      doc.appendChild(this.div);
    }
  }else {
    doc.appendChild(this.div);
  }
  this.context = this.div;

  this.designComponent(doc, tabControl);
  this.init(tabControl);

  if(initContainer && !(this instanceof HTMLContainer)){
    if (window.containerComponentsDesign) {
      while (containerComponentsDesign.length > 0) {
        containerComponentsDesign.shift()();
      }
    }
    initContainer = false;
  }

};

HTMLElementBase.prototype.getPermissionDescription = function() {
  if (!isNullable(this.description)) return this.description;
  return this.code + " - " + this.id;
};

HTMLElementBase.prototype.toPermissionMode = function() {
  // Criar div overlay das permissÃµes do componente
  this.divPermission = document.createElement("div");
  this.divPermission.className = "position-absolute"; // Bootstrap
  this.divPermission.style.top = this.div.style.top;
  this.divPermission.style.left = this.div.style.left;
  this.divPermission.style.width = this.div.style.width;
  this.divPermission.style.height = this.div.style.height;
  this.divPermission.style.cursor = "pointer";
  this.divPermission.style.zIndex = this.div.style.zIndex ? (parseInt(this.div.style.zIndex) + 1).toString() : "100000";

  // Definir propriedades do popover do Bootstrap.
  this.divPermission.setAttribute("data-toggle", "popover"); // Bootstrap
  this.divPermission.setAttribute("title", this.name); // Bootstrap
  this.divPermission.setAttribute("data-content",
    '<ul class="list-group list-group-flush p-0">' +
      '<li class="list-group-item py-1"><b>' + getLocaleMessage("LABEL.FORM") + ':</b> ' + this.formID + '</li>' +
      '<li class="list-group-item py-1"><b>' + getLocaleMessage("LABEL.CODE") + ':</b> ' + this.code + '</li>' +
      '<li class="list-group-item py-1"><b>ID:</b> ' + this.id + '</li>' +
      '<li class="list-group-item py-1"><b>' + getLocaleMessage("LABEL.DESCRIPTION") + ':</b> ' + this.description + '</li>' +
    '</ul>'); // Bootstrap

  // Adicionar div a pÃ¡gina.
  this.doc.appendChild(this.divPermission);

  // Inicializar o popover do Bootstrap.
  $(this.divPermission).popover({
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body p-0"></div></div>',
    html: true,
    trigger: "hover",
    delay: 200
  });

  // Associar eventos ao div overlay das permissÃµes.
  this.attachEvent(this.divPermission, 'click', this.permissionClick);
};

HTMLElementBase.prototype.permissionClick = function(doc) {
  try { $(this.divPermission).popover("hide"); } catch (e) { }
  openComAccess(this.sys, this.formID, this.code, document.title, this.getPermissionDescription());
};

HTMLElementBase.prototype.designComponent = function(doc) {
  this.context.innerHTML = this.value;
};

HTMLElementBase.prototype.reDesign = function() {
  this.free(true);
  this.div.innerHTML = '';
  this.designComponent(this.doc);
};

HTMLElementBase.prototype.freeComponent = function() {
  // Cada componente implementa o seu
};

HTMLElementBase.prototype.free = function(dontRemoveFromDoc, dontCallEvents) {
  controller.remove(this);
  arrayRemove(orderTab, this);

  if (!dontCallEvents && this.ondelete) {
    this.ondelete.call(this, null);
  }

  this.freeComponent();

  if (!dontRemoveFromDoc && this.doc && this.div) {
    this.doc.removeChild(this.div);
    this.div = null;
  }

  if (this.divDragComponent) {
    this.doc.removeChild(this.divDragComponent);
    this.divDragComponent = null;
  }

  return this;
};

HTMLElementBase.prototype.setEvent = function(evt, func) {
  this[evt.replace('on', '')] = func;
};

HTMLElementBase.prototype.init = function(tabControl) {
  if (this.hint) this.setHint(this.hint);

  // Tornar componente acessÃ­vel.
  if (this.Acessivel == "1") {
    this.zindex = 1000000;
    if (this.div) this.div.style.zIndex = this.zindex;
  }

  if (this.bgColor) this.setBGColor(this.bgColor);
  if (this.color) this.setColor(this.color);
  if (this.font) this.setFont(this.font);
  if (this.size) this.setSize(this.size);
  if (this.weight) this.setWeight(this.weight);
  if (this.italic) this.setItalic(this.italic);

  //if (this.underline) this.setUnderline(this.underline);
  //if (this.strikeout) this.setStrikeout(this.strikeout);
  this.setTextDecoration();

  if (!this.enabled) this.setEnabled(this.enabled, true);
  if (this.readonly) this.setReadOnly(this.readonly, true);
  if (!this.visible) this.setVisible(this.visible, true);

  if (this.designDragComponent && (this.draggable || this.resizable)) {
    this.designDragComponent(this.doc);
  }

  if (this.input) {
    this.attachEvent(this.input, 'focus', this.focusAction);
    this.attachEvent(this.input, 'blur', this.blurAction);
    this.attachEvent(this.input, 'keydown', this.keydownAction);
    this.attachEvent(this.input, 'click', this.clickAction);

    if (!(this instanceof HTMLLookup) && !(this instanceof HTMLCheckbox)) {
      this.attachEvent(this.input, 'change', this.changeAction);
    }

    if (this.onkeypress) {
      var idxEnter = this.tabKeys.indexOf(13);
      if (idxEnter != -1) this.tabKeys = arrayIndexRemove(this.tabKeys, idxEnter);
    }

    this.attachEvent(this.input, 'keypress', this.keypressAction);
    this.attachEvent(this.input, 'keyup', this.keyupAction);
  }

  if (this instanceof HTMLGrid) {
    this.attachEvent(this.div, 'keydown', this.keydownAction);
  }

  if (tabControl) controller.addTabable(this);
  else controller.addNotTabable(this);

  this.designMask();
  if(!(this instanceof HTMLContainer && this.container && this.doc == null)){
    this.afterInit();
  }

  if (this.permissionMode) {
    this.toPermissionMode();
  }
};

HTMLElementBase.prototype.afterInit = function() {
  // Armazenar a instÃ¢ncia da aba relacionada a esse elemento.
  if (!this.tab && this.doc && this.doc.tab) {
    this.tab = this.doc.tab;

    try {
      if (this.onFormEditMode && this.tab.editMode) {
        this.onFormEditMode();
      } else if (this.onFormViewMode && !this.tab.editMode) {
        this.onFormViewMode();
      }
    } catch (e) { }
  }

  // Adicionar o id a div principal do componente.
  if (this.div && this.id != undefined) this.div.id = this.id;

  if (this.div && document.n && document.n.responsive) {
    var isNavigationFormElement = this.name.indexOf("HTMLNavigationForm") !== -1;
    var isPagingElement = this.name.indexOf("HTMLPaging") !== -1;
    var isNavigationGridButton = this.name.indexOf("HTMLNavigationButton") !== -1;
    var isRadioGroupOption = this.name.indexOf("HTMLRadioGroupOption") !== -1;
    var isGridElement = this.name.indexOf("HTMLGrid") !== -1;
    var isGridChild = !isGridElement && (function(elem, grids) {
      for (var cont = 0; cont < grids.length; cont += 1) {
        if (grids[cont].contains(elem)) return true;
      }

      return false;
    }(this.div, document.getElementsByClassName("grid")));

    if (!isNavigationFormElement && !isGridChild && !isPagingElement && !isNavigationGridButton && !isRadioGroupOption && !this.fullscreen) {
      var pscreen = this.container ? parseInt($c(this.container) ? $c(this.container).width : window.getComputedStyle(document.getElementById(this.container)).width) : parseInt(document.getElementById("lay").style.width, 10);
      this.div.style.width = (this.width * 100 / pscreen) + "%";
      this.div.style.left = (this.posX * 100 / pscreen) + "%";
    }
  }

  if (this.styleCss && this.styleCss.length > 0) {
    this.styleCss = this.styleCss.trim();
    if (this.styleCss.indexOf(".") == 0 || this.styleCss.indexOf("#") == 0) {
      var style = document.createElement("style");
      style.innerHTML = this.styleCss;
      document.body.appendChild(style);
    } else {
      this.div.setAttribute("style", this.styleCss);
    }
  }

  // Verificar se o componente possui classe customizada definida
  if (this.classCss && this.classCss.trim().length > 0 && !this.classCssDefined) {
    this.div.className = this.classCss.trim();
    this.divClass = this.div.className;
  }
};

HTMLElementBase.prototype.clickAction = function(e, o) {
  if (this.enabled && this.isTrueVisible()) {
    controller.activeElement = this;
    if (this.onclick) return this.onclick.call(this, e);
  }

  return true;
};

HTMLElementBase.prototype.keydownAction = function(e) {
  if (this.enabled && this.isTrueVisible() && !this.readonly) {
    var r = checkKey(e, this, this.tabKeys);
    if (this.onkeydown) r = this.onkeydown(e);
    return r;
  }

  return true;
};

HTMLElementBase.prototype.keyupAction = function(e) {
  if (this.enabled && this.isTrueVisible() && !this.readonly) {
    var r = true;
    if (this.mask) r = this.mask.getKeyPress(e, this.input, null, this);
    if (this.onkeyup) r = this.onkeyup(e);
    return r;
  } else return true;
};

HTMLElementBase.prototype.keypressAction = function(e) {
  if (this.enabled && this.isTrueVisible() && !this.readonly) {
    var keyCode = e.keyCode || e.which;
    var r = true;

    if (this.onkeypress) {
      var altKey = false;
      var ctrlKey = false;
      var shiftKey = false;
      var target = e.target || e.srcElement;
      var targtype = target.type;
      var chr = String.fromCharCode(keyCode);

      if (w3c) {
        if (document.layers) {
          altKey = ((e.modifiers & Event.ALT_MASK) > 0);
          ctrlKey = ((e.modifiers & Event.CONTROL_MASK) > 0);
          shiftKey = ((e.modifiers & Event.SHIFT_MASK) > 0);
        } else {
          altKey = e.altKey;
          ctrlKey = e.ctrlKey;
          shiftKey = e.shiftKey;
        }
      } else {
        altKey = e.altKey;
        ctrlKey = e.ctrlKey;
        shiftKey = e.shiftKey;
      }

      // Caso Chrome, nÃ£o avalia as teclas F*
      var checkSpecialKey = !(isChrome || IE);

      // Verifica se alguma tecla F* foi pressionada para um tratamento diferenciado
      if (checkSpecialKey && currentBrowser.SpecialKeys[e.keyCode]) {
        chr = currentBrowser.SpecialKeys[e.keyCode].toUpperCase();
      }

      r = this.onkeypress(altKey, ctrlKey, shiftKey, keyCode, chr);

      if ((!isNullable(r) && r.toString && r.toString() == "CANCELEVENT") || (keyCode == 13 && this.name == 'HTMLEdit')) {
        if (e.preventDefault) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          window.onhelp = function() { e.returnValue = false; };
          try { e.keyCode = 0; } catch (e) { }
          e.returnValue = false;
          e.cancelBubble = true;
        }

        return false;
      }
    } else {
      if (!ctrlKey && !altKey && arrayIndexOf(this.tabKeys, keyCode) != -1) {
        if (!e.shiftKey) controller.next(this);
        else controller.next(this, true);
        //r = false;
      }
    }

    return r;
  }

  return true;
};

HTMLElementBase.prototype.focusAction = function(e) {
  if (this.enabled && this.isTrueVisible() && !this.readonly) {
    controller.activeElement = this;
    markField(this.input, this.tagName, this.canSelectOnFocus);
    e.fromKeyBoard = this.fromKeyBoard;
    if (this.onfocus) this.onfocus.call(this, e);
    this.fromKeyBoard = null;
  }
};

HTMLElementBase.prototype.getValidDescription = function() {
  var description = this.getDescription();
  if (!description) description = '';
  if (description.length == 0 && this._description) return this._description;
  else return description;
};

HTMLElementBase.prototype.validateDataType = function(focus) {
  // Valida Data-Hora e Data
  if (!this.ignoreValidate && (this.typeName == 'datetime' || this.typeName == 'date') && !isDateTime(this.getValue())) {
    interactionError(getLocaleMessage("ERROR.INVALID_FIELD_DATE_FORMAT", this.getValidDescription()), focus ? (function(e) {
      e.getFocus(true);
    }) : null, focus ? [this] : null);
    return false;
  }

  // Valida Hora
  else if (this.typeName == 'time' && !isTime(this.getValue())) {
    interactionError(getLocaleMessage("ERROR.INVALID_FIELD_HOUR_FORMAT", this.getValidDescription()), focus ? (function(e) {
      e.getFocus(true);
    }) : null, focus ? [this] : null);
    return false;
  }

  return true;
};

HTMLElementBase.prototype.blurAction = function(e) {
  if (this.enabled && this.isTrueVisible() && !this.readonly) {
    controller.activeElement = null;
    this.focuzed = false;
    if (this.input || this.button) {
      if (this.button) bootstrapCloseTooltip(this.button);
      else bootstrapCloseTooltip(this.input);
    }
    unmarkField(this.input, this.tagName, this.canSelectOnFocus);
    if (this.mask && this.input) {
      this.mask.getOnblur(e, this.input, this);
      if (trim(this.value) != trim(this.getValue()))
        this.changeAction(e, this);
    }

    if (this.onblur) this.onblur(e);
  }
};

HTMLElementBase.prototype.changeAction = function(e, o, dontCheckDependences) {
  //if (this.enabled && !this.readonly) {
  this.value = this.getValue();
  if (this.validateDataType(true)) {
    if (this.dependent && !dontCheckDependences) this.getDependeces();
    if (this.onchange) this.onchange.call(this, e);
    this.refreshComponentDependeces();
  }
  //}
};

HTMLElementBase.prototype.designMask = function() {
  if (this.maskSuport && this.input) {
    if (this.textMask) {
      this.mask = new Mask(this.textMask);
    } else if (this.dateMask) {
      this.mask = new Mask(this.dateMask, 'date');
    } else if (this.numberMask) {
      this.mask = new Mask(this.numberMask, 'number');
    } else if (this.canCheckRegularExpression && !isNullable(this.regularExpression)) {
      this.mask = new Mask("");
      this.mask.regularExpression = this.regularExpression;
    }
  }
};

HTMLElementBase.prototype.designEnableControl = function(v) {
  this.setEnabled(v);
  this.ec = new HTMLCheckbox(this.sys, this.formID, this.code, 0, this.height + 3, this.width, 20, getLocaleMessage("LABEL.ALL"), !v ? 'true' : 'false', 'true', 'false');
  this.ec.inputname = 'WFRInput' + this.code + 'EnableControl';
  this.ec.id = 'WFRInput' + this.code;
  this.ec.onchange = this.getAction(this.clickEnableControlAction);
  this.ec.design(this.div);

  // CorreÃ§Ã£o de layout para o modo mobile
  if (this.ec.div) {
    this.ec.div.className += " mt-2"; // Bootstrap
    this.ec.divClass = this.ec.div.className;
  }
};

HTMLElementBase.prototype.clickEnableControlAction = function(e) {
  this.setEnabled(!this.ec.getChecked());
};

HTMLElementBase.prototype.actionOnFocus = function(e, src) {
  document.write(src);
};

HTMLElementBase.prototype.setOnClick = function(evt) {
  try {
    this.input.onclick = evt;
  } catch (e) {
    // Abafa erro quando tem um botÃ£o oculto em uma grid
  }
};

HTMLElementBase.prototype.setOnKeyPress = function(evt) {
  this.input.onkeypress = evt;
};

HTMLElementBase.prototype.refresh = function() {
  var url = "refresh.do?sys=" + this.sys + "&formID=" + this.formID + "&comID=" + this.code + "&action=refresh&goto=" + formrow + "&value=" + URLEncode(this.getValue(), "GET") + '&toGrid=' + (this.toGrid ? 'true' : 'false');
  if (d.t && d.t.dependences) {
    var components = d.t.dependences[this.code];
    if (components && components.length > 0) {
      for (var code in components) {
        if (isNumeric(code)) {
          var component = eval("$mainform().d.c_" + components[code]);
          if (component) {
            url += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), "GET"));
          }
        }
      }
    }
  }

  eval(getContent(url, false, true));
};

HTMLElementBase.prototype.getDependeces = function(refreshSource) {
  // refreshSource tem que ser true para uso do setValue do lookup que atualiza ele mesmo.
  refreshSource = true;

  var gt = -1;
  try { gt = formrow; } catch (e) { }

  var url = "GetDependences?componentName=WFRInput" + this.code + "&componentValue=" + URLEncode(this.getValue(), "GET") + "&sys=" + this.sys + "&formID=" + this.formID + "&codFormComp=" + this.formID + ("&refreshSource=" + (refreshSource ? "true" : "false") + "&goto=" + gt) + '&toGrid=' + (this.toGrid ? 'true' : 'false');
  if (d.t && d.t.dependences) {
    var components = d.t.dependences[this.code];
    if (components && components.length > 0) {
      for (var code in components) {
        if (isNumeric(code)) {
          var component = eval("$mainform().d.c_" + components[code]);
          if (component) {
            url += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), "GET"));
          }
        }
      }
    }
  }

  this.timeout(function() {
    eval(getContent(url));
  }, 0);
};

HTMLElementBase.prototype.refreshComponentDependeces = function() {
  if (this.componentDependences && this.componentDependences.length > 0) {
    for (var index in this.componentDependences) {
      if (isNumeric(index)) {
        var component = this.componentDependences[index];
        if (component) {
          component.refresh();
        }
      }
    }
  }
};

HTMLElementBase.prototype.setDraggable = function(draggable, elementToAppend) {
  this.draggable = draggable;
  if (this.draggable) {
    if (elementToAppend) {
      this.designDragComponent(elementToAppend);
    } else {
      this.designDragComponent(this.doc);
    }
  } else {
    if (this.divDragComponent) this.doc.removeChild(this.divDragComponent);
  }
};

HTMLElementBase.prototype.setResizable = function(resizable) {
  this.resizable = resizable;
  if (this.resizable) {
    if (!this.divDragComponent || !this.divDragComponent.draggable)
      this.designDragComponent(this.doc);
    this.divDragComponent.resizeComponentsCreated = false;
  }
};

HTMLElementBase.prototype.designDragComponent = function(doc) {
  this.blur();
  var componentId = this.sys + "_DragComponent_" + this.code;
  this.divDragComponent = this.getDiv(componentId, this.posX, this.posY, window.getComputedStyle(this.div).width, this.height, 100001, true);
  this.divDragComponent.style.cursor = "move";
  this.divDragComponent.draggable = true;
  this.divDragComponent.dragActivated = false;
  this.divDragComponent.style.position = "absolute";
  //this.divDragComponent.innerHTML = '<table width=100% height=100%><tr><td>&nbsp;</td></tr></table>';
  doc.appendChild(this.divDragComponent);
  this.attachEvent(this.divDragComponent, 'mousedown', this.dragInitComponent);
};

HTMLElementBase.prototype.removeResizeDivs = function(e, divClicked) {
  if (!controller.hasSelectedComponent()) {
    controller.onComponentSelectionChangeAction(null, this);
    controller.setSelectedComponent(this);
  } else {
    var lastSelectedComponent = controller.getSelectedComponent();
    var lastDivDragComponent = lastSelectedComponent.divDragComponent;
    var clickedObject = window.event ? event.srcElement : e.target;

    var dragComponentRegExp = /^.+_DragComponent_.+$/;
    var isDragComponent = dragComponentRegExp.test(clickedObject.name);

    var resizeComponentRegExp = /^.+_ResizeComponent_.+$/;
    var isResizeComponent = resizeComponentRegExp.test(clickedObject.name);

    // Se o elemento selecionado for diferente do que estava selecionado ou se foi clicado fora de algum objeto da tela,
    // entÃ£o remove-se as DIV's de redimensionamento do objeto que estava clicado.
    if (lastDivDragComponent && lastDivDragComponent.resizeComponentsCreated) {
      if ((this != lastSelectedComponent && isDragComponent) || (!isResizeComponent && !isDragComponent)) {
        // Remove as DIV's do objeto que estava selecionado
        if (lastSelectedComponent.divNWResize) lastDivDragComponent.removeChild(lastSelectedComponent.divNWResize);
        if (lastSelectedComponent.divSWResize) lastDivDragComponent.removeChild(lastSelectedComponent.divSWResize);
        if (lastSelectedComponent.divNEResize) lastDivDragComponent.removeChild(lastSelectedComponent.divNEResize);
        if (lastSelectedComponent.divSEResize) lastDivDragComponent.removeChild(lastSelectedComponent.divSEResize);
        if (lastSelectedComponent.divNResize) lastDivDragComponent.removeChild(lastSelectedComponent.divNResize);
        if (lastSelectedComponent.divSResize) lastDivDragComponent.removeChild(lastSelectedComponent.divSResize);
        if (lastSelectedComponent.divEResize) lastDivDragComponent.removeChild(lastSelectedComponent.divEResize);
        if (lastSelectedComponent.divWResize) lastDivDragComponent.removeChild(lastSelectedComponent.divWResize);

        // DIV's para redimensionamento do componente foram removidas. Por isso a necessidade de atualizar a variÃ¡vel de controle abaixo
        lastDivDragComponent.resizeComponentsCreated = false;

        if (isDragComponent) {
          // Evento chamado ao modificar o componente selecionado
          controller.onComponentSelectionChangeAction(lastSelectedComponent, this);

          // Seta o novo componente selecionado
          controller.setSelectedComponent(this);
        }
      }

      // Caso clique fora de algum objeto, entÃ£o seta o componente selecionado para null
      if (!isResizeComponent && !isDragComponent) {
        controller.onComponentSelectionChangeAction(lastSelectedComponent, null);
        this.removeEvent(document, 'mousedown');
        controller.setSelectedComponent(null);
      }
      // Caso nÃ£o seja resizable, mas seja draggable e foi o Ãºltimo selecionado, entÃ£o o evento abaixo
      // deve ser invocado
    } else if (isDragComponent) {
      controller.onComponentSelectionChangeAction(lastSelectedComponent, this);
      this.removeEvent(document, 'mousedown');
      controller.setSelectedComponent(this);
    }
  }
};

HTMLElementBase.prototype.dragKeyDownComponent = function(e) {
  var code = e.keyCode || e.which;
  switch (code) {
    case 46: { // DEL
      if (this.deletekeydown) {
        return this.deletekeydown(e, this);
      }
    }
  }

  return true;
};

HTMLElementBase.prototype.dragInitComponent = function(e) {
  var evt = window.event ? window.event : e;
  var divDragComponent = this.divDragComponent;
  if (divDragComponent && divDragComponent.draggable && !divDragComponent.dragActivated) {
    this.mouseDiffX = 0;
    this.mouseDiffY = 0;

    divDragComponent.dragMouseMoved = false;
    divDragComponent.dragApproved = true;
    divDragComponent.dragActivated = true;

    if (isNaN(parseInt(divDragComponent.style.left)))
      divDragComponent.style.left = 0;
    if (isNaN(parseInt(divDragComponent.style.top)))
      divDragComponent.style.top = 0;

    divDragComponent.dragOffsetX = parseInt(divDragComponent.style.left);
    divDragComponent.dragOffsetY = parseInt(divDragComponent.style.top);

    if (this.designResizeComponent && this.resizable) {
      if (!divDragComponent.resizeComponentsCreated) {
        this.designResizeComponent(this.doc);
      }
    }

    this.removeEvent(document, 'mousedown');
    this.attachEvent(document, 'mousedown', this.removeResizeDivs, null, this.divDragComponent);

    this.removeEvent(document, 'keydown');
    // this.attachEvent(document, 'keydown', this.dragKeyDownComponent);

    divDragComponent.dragPosX = evt.clientX;
    divDragComponent.dragPosY = evt.clientY;

    if (evt.preventDefault) evt.preventDefault();

    this.attachEvent(this.doc, 'mousemove', this.dragMoveComponent);
    this.attachEvent(this.doc, 'mouseup', this.dragLeaveComponent);

    this.onDragInitComponent(e);

    /* TODO BotÃ£o direito do mouse
    if (evt.button == 2) {
      controller.onRightClickAction(e, this);
    }*/
  }
};

HTMLElementBase.prototype.dragMoveComponent = function(e) {
  var divDragComponent = this.divDragComponent;
  if (divDragComponent && divDragComponent.draggable && divDragComponent.dragApproved && divDragComponent.dragActivated) {
    divDragComponent.dragMouseMoved = true;

    var evt = window.event ? window.event : e;

    this.mouseDiffX = evt.clientX - divDragComponent.dragPosX;
    this.mouseDiffY = evt.clientY - divDragComponent.dragPosY;

    var left = divDragComponent.dragOffsetX + this.mouseDiffX;
    var top = divDragComponent.dragOffsetY + this.mouseDiffY;
    var oldLeft = this.getX();
    var oldTop = this.getY();

    if (top > 0) {
      divDragComponent.style.top = top + "px";
      this.setY(top);
    }

    if (left > 0) {
      divDragComponent.style.left = left + "px";
      this.setX(left);
    }

    this.onDragMoveComponent(e, oldLeft, oldTop, this.mouseDiffX, this.mouseDiffY);
    return true;
  } else {
    return false;
  }
};

HTMLElementBase.prototype.dragLeaveComponent = function(e) {
  var divDragComponent = this.divDragComponent;
  if (divDragComponent && divDragComponent.draggable && divDragComponent.dragApproved) {
    divDragComponent.dragApproved = false;
    divDragComponent.dragActivated = false;
    if (divDragComponent.dragMouseMoved) {
      divDragComponent.dragMouseMoved = false;
    }

    this.removeEvent(this.doc, 'mousemove');
    this.removeEvent(this.doc, 'mouseup');
  }

  this.onDragLeaveComponent(e);
};

/**
 * Evento lanÃ§ado ao clicar em um objeto para movimentÃ¡-lo.<br/>
 * Executa a funÃ§Ã£o ondragini do objeto, caso exista, passando como parÃ¢metros, nesta ordem:<br/>
 *
 * @1 = o prÃ³prio componente<br/>
 * @2 = objeto responsÃ¡vel pela movimentaÃ§Ã£o do objeto<br/>
 *
 * @param e evento
 */
HTMLElementBase.prototype.onDragInitComponent = function(e) {
  if (this.ondragini) this.ondragini(this, this.divDragComponent);
};

/**
 * Evento lanÃ§ado ao movimentar um objeto.<br/>
 * Executa a funÃ§Ã£o ondragdrop do objeto, caso exista, passando como parÃ¢metros, nesta ordem:<br/>
 *
 * @1 = posiÃ§Ã£o X do componente<br/>
 * @2 = posiÃ§Ã£o Y do componente<br/>
 * @3 = antiga posiÃ§Ã£o X do componente<br/>
 * @4 = antiga posiÃ§Ã£o Y do componente<br/>
 * @5 = o prÃ³prio objeto<br/>
 * @6 = quanto andou o mouse na posiÃ§Ã£o X<br/>
 * @7 = quanto andou o mouse na posiÃ§Ã£o Y<br/>
 * @8 = objeto responsÃ¡vel pela movimentaÃ§Ã£o do objeto<br/>
 *
 * @param e evento
 * @param oldX antiga posiÃ§Ã£o X do componente
 * @param oldY antiga posiÃ§Ã£o Y do componente
 * @param mouseDiffX quanto andou o mouse na posiÃ§Ã£o X
 * @param mouseDiffY quanto andou o mouse na posiÃ§Ã£o Y
 */
HTMLElementBase.prototype.onDragMoveComponent = function(e, oldX, oldY, mouseDiffX, mouseDiffY) {
  if (this.ondragdrop) this.ondragdrop(this.getX(), this.getY(), oldX, oldY, this, mouseDiffX, mouseDiffY, this.divDragComponent);
};

/**
 * Evento lanÃ§ado ao liberar o clique em um objeto apÃ³s movimentÃ¡-lo.<br/>
 * Executa a funÃ§Ã£o ondragend do objeto, caso exista, passando como parÃ¢metros, nesta ordem:
 *
 * @1 = o prÃ³prio componente<br/>
 * @2 = objeto responsÃ¡vel pela movimentaÃ§Ã£o do objeto<br/>
 *
 * @param e evento
 */
HTMLElementBase.prototype.onDragLeaveComponent = function(e) {
  if (this.ondragend) this.ondragend(this, this.divDragComponent);
};

HTMLElementBase.prototype.resizeWidth = 5;
HTMLElementBase.prototype.resizeHeight = 5;
HTMLElementBase.prototype.cursorMove = "move";
HTMLElementBase.prototype.cursorNWResize = "nw-resize";
HTMLElementBase.prototype.cursorSWResize = "sw-resize";
HTMLElementBase.prototype.cursorNEResize = "ne-resize";
HTMLElementBase.prototype.cursorSEResize = "se-resize";
HTMLElementBase.prototype.cursorNResize = "n-resize";
HTMLElementBase.prototype.cursorSResize = "s-resize";
HTMLElementBase.prototype.cursorEResize = "e-resize";
HTMLElementBase.prototype.cursorWResize = "w-resize";

HTMLElementBase.prototype.designResizeComponent = function(doc) {
  function setResizeDivDefaultProperties(divResize) {
    divResize.style.backgroundColor = "orange";
    divResize.style.overflow = "hidden";
    divResize.resizable = true;
    divResize.resizeActivated = false;

    return divResize;
  }

  var divDragComponent = this.divDragComponent;
  divDragComponent.resizeComponentsCreated = true;

  // ########## Designs NW Div
  var nwResizeId = this.sys + "_NW_ResizeComponent_" + this.code;

  this.divNWResize = this.getDiv(nwResizeId, 0, 0, this.resizeWidth, this.resizeHeight, 1, true);
  this.divNWResize.style.cursor = this.cursorNWResize;
  setResizeDivDefaultProperties(this.divNWResize);
  divDragComponent.appendChild(this.divNWResize);

  // Adiciona o evento onmousedown a div NW passando o mesmo como parÃ¢metro para a chamada da funÃ§Ã£o
  this.attachEvent(this.divNWResize, 'mousedown', this.resizeInit, null, [this.divNWResize, this.cursorNWResize]);

  // ########## Designs SW Div
  var swResizeId = this.sys + "_SW_ResizeComponent_" + this.code;
  var swPosY = this.getHeight() - this.resizeHeight; // Altura do componente subtraï¿½do da altura da DIV criada

  this.divSWResize = this.getDiv(swResizeId, 0, swPosY, this.resizeWidth, this.resizeHeight, 1, true);
  this.divSWResize.style.cursor = this.cursorSWResize;
  setResizeDivDefaultProperties(this.divSWResize);
  divDragComponent.appendChild(this.divSWResize);

  // Adiciona o evento onmousedown a div SW passando o mesmo como parÃ¢metro para a chamada da funÃ§Ã£o
  this.attachEvent(this.divSWResize, 'mousedown', this.resizeInit, null, [this.divSWResize, this.cursorSWResize]);

  // ########## Designs NE Div
  var neResizeId = this.sys + "_NE_ResizeComponent_" + this.code;
  var nePosX = this.getWidth() - this.resizeWidth; // Largura do componente subtraï¿½do da largura da DIV criada

  this.divNEResize = this.getDiv(neResizeId, nePosX, 0, this.resizeWidth, this.resizeHeight, 1, true);
  this.divNEResize.style.cursor = this.cursorNEResize;
  setResizeDivDefaultProperties(this.divNEResize);
  divDragComponent.appendChild(this.divNEResize);

  // Adiciona o evento onmousedown a div NE passando o mesmo como parÃ¢metro para a chamada da funÃ§Ã£o
  this.attachEvent(this.divNEResize, 'mousedown', this.resizeInit, null, [this.divNEResize, this.cursorNEResize]);

  // ########## Designs SE Div
  var seResizeId = this.sys + "_SE_ResizeComponent_" + this.code;
  var sePosX = this.getWidth() - this.resizeWidth; // Largura do componente subtraÃ­do da largura da DIV criada
  var sePosY = this.getHeight() - this.resizeHeight; // Altura do componente subtraÃ­do da altura da DIV criada

  this.divSEResize = this.getDiv(seResizeId, sePosX, sePosY, this.resizeWidth, this.resizeHeight, 1, true);
  this.divSEResize.style.cursor = this.cursorSEResize;
  setResizeDivDefaultProperties(this.divSEResize);
  divDragComponent.appendChild(this.divSEResize);

  // Adiciona o evento onmousedown a div SE passando o mesmo como parÃ¢metro para a chamada da funÃ§Ã£o
  this.attachEvent(this.divSEResize, 'mousedown', this.resizeInit, null, [this.divSEResize, this.cursorSEResize]);

  if (!this.resizeProportional) {
    // ########## Designs N Div
    var nResizeId = this.sys + "_N_ResizeComponent_" + this.code;
    var nPosX = (this.getWidth() / 2) - (this.resizeWidth / 2);

    this.divNResize = this.getDiv(nResizeId, nPosX, 0, this.resizeHeight, this.resizeWidth, 1, true);
    this.divNResize.style.cursor = this.cursorNResize;
    setResizeDivDefaultProperties(this.divNResize);
    divDragComponent.appendChild(this.divNResize);

    // Adiciona o evento onmousedown a div S passando o mesmo como parÃ¢metro para a chamada da funÃ§Ã£o
    this.attachEvent(this.divNResize, 'mousedown', this.resizeInit, null, [this.divNResize, this.cursorNResize]);

    // ########## Designs S Div
    var sResizeId = this.sys + "_S_ResizeComponent_" + this.code;
    var sPosX = (this.getWidth() / 2) - (this.resizeWidth / 2);
    var sPosY = this.getHeight() - this.resizeHeight;

    this.divSResize = this.getDiv(sResizeId, sPosX, sPosY, this.resizeWidth, this.resizeHeight, 1, true);
    this.divSResize.style.cursor = this.cursorSResize;
    setResizeDivDefaultProperties(this.divSResize);
    divDragComponent.appendChild(this.divSResize);

    // Adiciona o evento onmousedown a div S passando o mesmo como parÃ¢metro para a chamada da funÃ§Ã£oo
    this.attachEvent(this.divSResize, 'mousedown', this.resizeInit, null, [this.divSResize, this.cursorSResize]);

    // ########## Designs E Div
    var eResizeId = this.sys + "_E_ResizeComponent_" + this.code;
    var ePosX = this.getWidth() - this.resizeWidth;
    var ePosY = (this.getHeight() / 2) - (this.resizeHeight / 2);

    this.divEResize = this.getDiv(eResizeId, ePosX, ePosY, this.resizeWidth, this.resizeHeight, 1, true);
    this.divEResize.style.cursor = this.cursorEResize;
    setResizeDivDefaultProperties(this.divEResize);
    divDragComponent.appendChild(this.divEResize);

    // Adiciona o evento onmousedown a div E passando o mesmo como parÃ¢metro para a chamada da funÃ§Ã£o
    this.attachEvent(this.divEResize, 'mousedown', this.resizeInit, null, [this.divEResize, this.cursorEResize]);

    // ########## Designs W Div
    var wResizeId = this.sys + "_W_ResizeComponent_" + this.code;
    var wPosY = (this.getHeight() / 2) - (this.resizeHeight / 2);

    this.divWResize = this.getDiv(wResizeId, 0, wPosY, this.resizeWidth, this.resizeHeight, 1, true);
    this.divWResize.style.cursor = this.cursorWResize;
    setResizeDivDefaultProperties(this.divWResize);
    divDragComponent.appendChild(this.divWResize);

    // Adiciona o evento onmousedown a div W passando o mesmo como parÃ¢metro para a chamada da funÃ§Ã£o
    this.attachEvent(this.divWResize, 'mousedown', this.resizeInit, null, [this.divWResize, this.cursorWResize]);
  }
};

HTMLElementBase.prototype.setResizeProportional = function(resizeProportional) {
  this.resizeProportional = resizeProportional;
};

HTMLElementBase.prototype.resizeInit = function(e, divResize, cursorType) {
  if (divResize.resizable && !divResize.resizeActivated) {
    // Componente nÃ£o pode ser movido, enquanto estiver em modo de redimensionamento
    this.divDragComponent.draggable = false;
    // Ã© alterado o cursor para nÃ£o aparecer o cursor de movimento - move - durante o redimenasionamento
    this.divDragComponent.style.cursor = cursorType;

    // Inicia as variÃ¡veis de controle para o componente poder ser redimensionado
    divResize.resizeMouseMoved = false;
    divResize.resizeApproved = true;
    divResize.resizeActivated = true;

    if (isNaN(parseInt(divResize.style.left))) {
      divResize.style.left = 0;
    }

    if (isNaN(parseInt(divResize.style.top))) {
      divResize.style.top = 0;
    }

    divResize.resizeOffsetX = parseInt(divResize.style.left);
    divResize.resizeOffsetY = parseInt(divResize.style.top);

    var evt = window.event ? window.event : e;

    // Ã© atribuida a variÃ¡vel - divResize.resizePosX - a posiÃ§Ã£o X do mouse
    divResize.resizePosX = evt.clientX;

    // Ã© atribuida a variÃ¡vel - divResize.resizePosY - a posiÃ§Ã£o Y do mouse
    divResize.resizePosY = evt.clientY;

    if (evt.preventDefault) {
      evt.preventDefault();
    }

    // Adiciona os eventos onmousemove e onmouseup ao doc
    this.attachEvent(this.doc, 'mousemove', this.resizeMove, null, [divResize]);
    this.attachEvent(this.doc, 'mouseup', this.resizeLeave, null, [divResize]);

    this.onResizeInit(e, divResize);
  }
};

HTMLElementBase.prototype.resizeMove = function(e, divResize) {
  if (divResize && divResize.resizable && divResize.resizeApproved && divResize.resizeActivated) {
    divResize.resizeMouseMoved = true;

    var evt = window.event ? window.event : e;
    var left, top, width, height;

    // ######## Comentï¿½rio Geral para os if's abaixo
    // evt.clientX = posiÃ§Ã£o X corrente do mouse
    // divResize.resizePosX = posiÃ§Ã£o X antiga do mouse
    // (evt.clientX - divResize.resizePosX) = diferenÃ§a do movimento horizontal

    var horizontalMouseDiff = evt.clientX - divResize.resizePosX;
    var verticalMouseDiff = evt.clientY - divResize.resizePosY;

    // Pode alterar as posiÃ§Ãµes X e Y, e a largura e altura
    var northRexExp = /_N.?_/;
    if (northRexExp.test(divResize.name) && verticalMouseDiff != 0) {
      top = this.getY() + verticalMouseDiff;
      height = this.getHeight() - verticalMouseDiff;
    }

    var southRexExp = /_S.?_/;
    if (southRexExp.test(divResize.name) && verticalMouseDiff != 0) {
      height = this.getHeight() + verticalMouseDiff;
    }

    var eastRexExp = /_.?E_/;
    if (eastRexExp.test(divResize.name) && horizontalMouseDiff != 0) {
      width = this.getWidth() + horizontalMouseDiff;
    }

    var westRexExp = /_.?W_/;
    if (westRexExp.test(divResize.name) && horizontalMouseDiff != 0) {
      left = this.getX() + horizontalMouseDiff;
      width = this.getWidth() - horizontalMouseDiff;
    }

    var oldX = this.getX();
    var oldY = this.getY();
    var oldWidth = this.getWidth();
    var oldHeight = this.getHeight();

    var minHeight;
    if (this.minHeight) {
      minHeight = this.minHeight;
    } else {
      minHeight = 4 * this.resizeHeight;
    }

    var minWidth;
    if (this.minWidth) {
      minWidth = this.minWidth;
    } else {
      minWidth = 4 * this.resizeWidth;
    }

    height = height || this.getHeight();
    width = width || this.getWidth();

    if (height) {
      if (height < minHeight) {
        height = minHeight;
      }
      // Altera a altura do componente
      this.setHeight(height);

      // Altera a altura da DIV responsÃ¡vel pelo redimensionamento
      this.divDragComponent.style.height = height;
    }

    if (width) {
      if (this.resizeProportional) {
        var temp = (height - oldHeight) / oldHeight;
        width = oldWidth + temp * oldWidth;
      }

      if (width < minWidth) {
        width = minWidth;
      }

      // Altera a largura do componente
      this.setWidth(width);

      // Altera a largura da DIV responsÃ¡vel pelo redimensionamento
      this.divDragComponent.style.width = width;
    }

    if (left) {
      if (this.getWidth() > minWidth) {
        // Altera a posiÃ§Ã£o X do componente
        this.setX(left);

        // Altera a posiÃ§Ã£o X da DIV responsÃ¡vel pelo redimensionamento
        this.divDragComponent.style.left = left;
      }
    }

    if (top) {
      if (this.getHeight() > minHeight) {
        // Altera a posiÃ§Ã£o Y do componente
        this.setY(top);

        // Altera a posiÃ§Ã£o Y da DIV responsÃ¡vel pelo redimensionamento
        this.divDragComponent.style.top = top;
      }
    }

    // Atribui a nova posiÃ§Ã£o X do mouse a variÃ¡vel - divResize.resizePosX
    divResize.resizePosX = evt.clientX;

    // Atribui a nova posiÃ§Ã£o Y do mouse a variÃ¡vel - divResize.resizePosY
    divResize.resizePosY = evt.clientY;

    this.setDivsNewPosition();
    this.onResizeMove(e, oldX, oldY, horizontalMouseDiff, verticalMouseDiff, divResize);

    return true;
  } else return false;
};

HTMLElementBase.prototype.resizeLeave = function(e, divResize) {
  if (divResize && divResize.resizable && divResize.resizeApproved) {
    // Reinicia as variÃ¡veis de controle do redimensionamento
    divResize.resizeApproved = false;
    divResize.resizeActivated = false;

    if (divResize.resizeMouseMoved) {
      divResize.resizeMouseMoved = false;
    }

    // Remove os eventos onmousemove e onmouseup ao doc
    this.removeEvent(this.doc, 'mousemove');
    this.removeEvent(this.doc, 'mouseup');

    // Faz o componente voltar a ser alterado de posiÃ§Ã£o
    this.divDragComponent.draggable = true;

    // Muda o cursor para "move" no componente responsÃ¡vel pela alteraÃ§Ã£o de posiÃ§Ã£o
    this.divDragComponent.style.cursor = this.cursorMove;

    this.onResizeLeave(e);
  }
};

HTMLElementBase.prototype.setDivsNewPosition = function(e) {
  var east = this.getWidth() - this.resizeWidth;
  var south = this.getHeight() - this.resizeHeight;
  var middleWidth = (this.getWidth() / 2) - (this.resizeWidth / 2);
  var middleHeight = (this.getHeight() / 2) - (this.resizeHeight / 2);

  if (this.divNWResize) {
    this.divNWResize.style.left = 0;
    this.divNWResize.style.top = 0;
  }

  if (this.divNEResize) {
    this.divNEResize.style.left = east;
    this.divNEResize.style.top = 0;
  }

  if (this.divSWResize) {
    this.divSWResize.style.left = 0;
    this.divSWResize.style.top = south;
  }

  if (this.divSEResize) {
    this.divSEResize.style.left = east;
    this.divSEResize.style.top = south;
  }

  if (this.divNResize) {
    this.divNResize.style.left = middleWidth;
    this.divNResize.style.top = 0;
  }

  if (this.divSResize) {
    this.divSResize.style.left = middleWidth;
    this.divSResize.style.top = south;
  }

  if (this.divEResize) {
    this.divEResize.style.left = east;
    this.divEResize.style.top = middleHeight;
  }

  if (this.divWResize) {
    this.divWResize.style.left = 0;
    this.divWResize.style.top = middleHeight;
  }
};

/**
 * Evento lanÃ§ado ao clicar em um objeto para redimensionÃ¡-lo.<br/>
 * Executa a funÃ§Ã£o onresizeini do objeto, caso exista, passando como parÃ¢metros, nesta ordem:<br/>
 *
 * @1 = o prÃ³prio componente<br/>
 * @2 = o objeto clicado para o redimensionamento<br/>
 *
 * @param e evento
 * @param divResize objeto clicado para o redimensionamento.
 */
HTMLElementBase.prototype.onResizeInit = function(e, divResize) {
  if (this.onresizeini) {
    this.onresizeini(this, divResize);
  }
};

/**
 * Evento lanÃ§ado ao movimentar um objeto.<br/>
 * Executa a funÃ§Ã£o onresize do objeto, caso exista, passando como parÃ¢metros, nesta ordem:<br/>
 *
 * @1 = posiÃ§Ã£o X do componente<br/>
 * @2 = posiÃ§Ã£o Y do componente<br/>
 * @3 = antiga posiÃ§Ã£o X do componente<br/>
 * @4 = antiga posiÃ§Ã£o Y do componente<br/>
 * @5 = o prÃ³prio objeto<br/>
 * @6 = quanto andou o mouse na posiÃ§Ã£o X<br/>
 * @7 = quanto andou o mouse na posiÃ§Ã£o Y<br/>
 * @8 = objeto clicado para o redimensionamento<br/>
 * @9 = objeto responsÃ¡vel pela movimentaï¿½ï¿½o do objeto<br/>
 *
 * @param e evento
 * @param x posiÃ§Ã£o X do componente
 * @param y posiÃ§Ã£o Y do componente
 * @param oldX antiga posiÃ§Ã£o X do componente
 * @param oldY posiÃ§Ã£o X do componente
 * @param mouseDiffX quanto andou o mouse na posiÃ§Ã£o X
 * @param mouseDiffY quanto andou o mouse na posiÃ§Ã£o Y
 */
HTMLElementBase.prototype.onResizeMove = function(e, oldX, oldY, mouseDiffX, mouseDiffY, divResize) {
  if (this.onresize) {
    this.onresize(this.getX(), this.getY(), oldX, oldY, this, mouseDiffX, mouseDiffY, divResize, this.divDragComponent);
  }
};

/**
 * Evento lanÃ§ado ao liberar o clique em um objeto apÃ³s redimensionÃ¡-lo.<br/>
 * Executa a funÃ§Ã£o onresizeend do objeto, caso exista, passando como parÃ¢metros, nesta ordem:<br/>
 *
 * @1 = o prÃ³prio componente<br/>
 * @2 = o objeto clicado para o redimensionamento<br/>
 *
 * @param e evento
 * @param divResize objeto clicado para o redimensionamento.
 */
HTMLElementBase.prototype.onResizeLeave = function(e, divResize) {
  if (this.onresizeend) {
    this.onresizeend(this, divResize);
  }
};

/**
 * Atualiza a altura do componente e caso seja um componente draggable ou resizable, entÃ£o reposiciona-se estes.
 *
 * @param height nova altura do componente
 */
HTMLElementBase.prototype.updateHeight = function(height) {
  this.setHeight(height);
  if (this.divDragComponent) {
    this.divDragComponent.style.height = height;
    this.setDivsNewPosition();
  }
};

/**
 * Atualiza a largura do componente e caso seja um componente draggable ou resizable, entÃ£o reposiciona-se estes.
 *
 * @param width nova largura do componente
 */
HTMLElementBase.prototype.updateWidth = function(width) {
  this.setWidth(width);
  if (this.divDragComponent) {
    this.divDragComponent.style.width = width;
    this.setDivsNewPosition();
  }
};

/**
 * Atualiza a posiÃ§Ã£o X do componente e caso seja um componente draggable ou resizable, entÃ£o reposiciona-se estes.
 *
 * @param x nova posiÃ§Ã£o X do componente
 */
HTMLElementBase.prototype.updateX = function(x) {
  this.setX(x);
  if (this.divDragComponent) {
    this.divDragComponent.style.left = x;
    this.setDivsNewPosition();
  }
};

/**
 * Atualiza a posiÃ§Ã£o Y do componente e caso seja um componente draggable ou resizable, entÃ£o reposiciona-se estes.
 *
 * @param x nova posiÃ§Ã£o Y do componente
 */
HTMLElementBase.prototype.updateY = function(y) {
  this.setY(y);
  if (this.divDragComponent) {
    this.divDragComponent.style.top = y;
    this.setDivsNewPosition();
  }
};

/**
 * Atualiza informaÃ§Ãµes do componente como: posiÃ§Ã£o x, posiÃ§Ã£o y, largura, altura e descriï¿½ï¿½o
 * Apenas serÃ£o setadas as propriedades que tiverem valor
 *
 * @param obj objeto contendo os seguintes atributos: x, y, width, height, description
 */
HTMLElementBase.prototype.updateComponent = function(obj) {
  if (obj.x) this.updateX(obj.x);
  if (obj.y) this.updateY(obj.y);
  if (obj.width) this.updateWidth(obj.width);
  if (obj.height) this.updateHeight(obj.height);
  if (obj.description) this.setDescription(obj.description);
};

HTMLElementBase.prototype.noClickAreaSize = 5;

HTMLElementBase.prototype.isIn = function(x, y, x1, y1, x2, y2) {
  x1--; x2++;
  y1--; y2++;
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
};


HTMLElementBase.prototype.showNoClickArea = function(e) {
  this.timeout(this.showNoClickAreaTO, 0);
};

HTMLElementBase.prototype.showNoClickAreaTO = function(e) {
  if (!this.divNoClick) {
    var mouseX = mX;
    var mouseY = mY;
    var dx = findPosX(this.div);
    var dy = findPosY(this.div);
    var size = this.noClickAreaSize;
    var sX = size;
    var sY = size;
    var a1 = this.isIn(mouseX, mouseY, dx, dy, dx + sX, dy + this.height);
    var a2 = this.isIn(mouseX, mouseY, dx, dy, dx + this.width, dy + sY);
    var a3 = this.isIn(mouseX, mouseY, dx + this.width - sX, dy, dx + this.width, dy + this.height);
    var a4 = this.isIn(mouseX, mouseY, dx, dy + this.height - sY, dx + this.width, dy + this.height);

    if (!a1 && !a2 && !a3 && !a4) {
      if (mX <= dx + (this.width / 2)) a3 = true;
      else a1 = true;
    }

    var x = this.width - size;
    var y = 0;
    var w = size;
    var h = this.height;

    if (a1) {
      x = this.width - size;
      y = 0;
      w = size;
      h = this.height;
    } else if (a3) {
      x = 0;
      y = 0;
      w = size;
      h = this.height;
    } else if (a2) {
      x = 0;
      y = this.height - size;
      w = this.width;
      h = size;
    } else if (a4) {
      x = 0;
      y = 0;
      w = this.width;
      h = size;
    }

    this.divNoClick = this.getDiv('', x, y, w, h, 1000, true);
    this.divNoClick.style.backgroundColor = 'orange';
    this.attachEvent(this.divNoClick, 'mouseover', this.onMouseOverNoClickArea);
    this.attachEvent(this.divNoClick, 'mouseout', this.onMouseOutNoClickArea);
    this.div.appendChild(this.divNoClick);
  }
};

HTMLElementBase.prototype.removeNoClickArea = function() {
  this.timeout(this.removeNoClickAreaTO, 0);
};

HTMLElementBase.prototype.removeNoClickAreaTO = function() {
  if (this.divNoClick) {
    var x = findPosX(this.divNoClick);
    var y = findPosY(this.divNoClick);
    if (!this.isIn(mX, mY, x, y, x + this.divNoClick.offsetWidth, y + this.divNoClick.offsetHeight)) {
      this.div.removeChild(this.divNoClick);
      this.divNoClick = null;
    }
  }
};

HTMLElementBase.prototype.onMouseOverNoClickArea = function() {
  if (this.divNoClick && this.click) this.click();
};

HTMLElementBase.prototype.onMouseOutNoClickArea = function() {
  if (this.divNoClick) {
    this.div.removeChild(this.divNoClick);
    this.divNoClick = null;
  }
};

HTMLElementBase.prototype.addComponentDependence = function(component) {
  if (component) this.componentDependences.push(component);
};

HTMLElementBase.prototype.isDBAware = function() {
  return !isNullable(this.field);
};

HTMLElementBase.prototype.setGridValue = function(value) {
  this.value = value;
};

/**
 * ObtÃ©m a URL para obter a imagem pelo GUID.
 * @param image - GUID da imagem.
 **/
HTMLElementBase.prototype.getImageSourceURL = function(image) {
  return "openImageStreamFromGalery.do?sys=" + URLEncode(this.sys, 'GET') + "&formID=" + URLEncode(this.formID, 'GET') + "&guid=" + URLEncode(image, 'GET');
};

HTMLElementBase.prototype.flush = function() {
  this.divWResize = null;
  this.divEResize = null;
  this.divSResize = null;
  this.divNResize = null;
  this.divSEResize = null;
  this.divNEResize = null;
  this.divSWResize = null;
  this.divNWResize = null;
  this.divDragComponent = null;
  this.divHint = null;
  this.divPermission = null;
  this.input = null;
  this.componentDependences = null;
  this.context = null;
};
