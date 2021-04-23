function HTMLNavigationGrid(sys, formID, posX, posY) {
  this.create(sys, formID, posX, posY, 40, 20);
  this.onEditing = false;
  this.visible = true;
  this.enabled = true;
  this.buttons = [];
  this.bgColor = {
    "add": "btn-success", // Bootstrap
    "edit": "btn-primary", // Bootstrap
    "remove": "btn-outline-secondary", // Bootstrap
    "refresh": "btn-outline-secondary", // Bootstrap
    "save": "btn-danger", // Bootstrap
    "cancel": "btn-outline-secondary" // Bootstrap
  };
}

HTMLNavigationGrid.inherits(HTMLNavigation);
HTMLNavigationGrid.prototype.name = 'HTMLNavigationGrid';

HTMLNavigationGrid.prototype.createButton = function (param, description, hint, onclick, icon) {
  // Cria botão padrão bootstrap para navegação do componente Grade.
  var bt = mainSystemFrame.document.createElement("i");
  bt.className = "px-2 mr-2 d-flex align-items-center justify-content-center rounded-top btn " + this.bgColor[param]; // Bootstrap
  bt.id = param + "Button";
  bt.style.cursor = "pointer";
  bt.style.fontStyle = "normal";
  bt.href = "#";
  bt.setAttribute("role", "button");
  bt.addEventListener("click", onclick, false);

  if (hint) {
    bt.title = hint;
    bt.setAttribute("data-toggle","tooltip");
  }

  // Cria ícone do botão
  var btIcon = document.createElement("i");
  btIcon.className = "fas fa-" + icon; // Material Design Icons
  if (param === "remove") btIcon.className += " text-danger"; // Bootstrap
  btIcon.style.fontSize = "1rem";
  bt.appendChild(btIcon);

  this.buttons.push({
    button: bt,
    class: bt.className,
    visible: true
  });

  return bt;
};

HTMLNavigationGrid.prototype.setReadOnly = function(v) {
  this.readonly = v;
  this.updateLayout();
};

HTMLNavigationGrid.prototype.setEnabled = function(v) {
  this.enabled = v;
  this.updateLayout();
};

HTMLNavigationGrid.prototype.updateLayout = function() {
  for (var i = 0; i < this.buttons.length; i++) {
    if (this.buttons[i].button.id != "saveButton" && this.buttons[i].button.id != "cancelButton") {
      this.buttons[i].button.disabled = !this.enabled || this.readonly;

      if (this.enabled && !this.readonly) {
        if (this.buttons[i].button.classList.contains("disabled"))
          this.buttons[i].button.classList.remove("disabled");
        if (this.buttons[i].class.indexOf(" disabled") != -1)
          this.buttons[i].class = this.buttons[i].class.replace(" disabled", "");
        this.buttons[i].button.style.pointerEvents = "all";
      } else {
        if (!this.buttons[i].button.classList.contains("disabled"))
          this.buttons[i].button.classList.add("disabled");
        if (this.buttons[i].class.indexOf(" disabled") == -1)
          this.buttons[i].class += " disabled";
        this.buttons[i].button.style.pointerEvents = "none";
      }
    }
  }
};

HTMLNavigationGrid.prototype.showNav = function(show) {
  if (this.enabled) {
    if (show) {
      this.visible = true;
      if (this.onEditing) {
        for (var i = 0; i < this.buttons.length; i++) {
          if (this.buttons[i].button.id == "saveButton" || this.buttons[i].button.id == "cancelButton") {
            this.buttons[i].button.className = this.buttons[i].class;
            this.buttons[i].visible = true;
          }
        }
      } else {
        for (var i = 0; i < this.buttons.length; i++) {
          if (this.buttons[i].button.id == "addButton" || this.buttons[i].button.id == "editButton" || this.buttons[i].button.id == "removeButton" || this.buttons[i].button.id == "refreshButton") {
            this.buttons[i].button.className = this.buttons[i].class;
            this.buttons[i].visible = true;
          }
        }
      }
    } else {
      this.visible = false;
      for (var i = 0; i < this.buttons.length; i++) {
        this.buttons[i].button.className = "d-none"; // Bootstrap
        this.buttons[i].visible = false;
      }
    }
  }
};

HTMLNavigationGrid.prototype.setMainImages = function (imgInclude, imgEdit, imgDelete, imgRefresh, imgFields) {
  if (imgInclude != -1) this.btInclude = this.createButton("add", 'Novo', getLocaleMessage('LABEL.INCLUDE') + ' (Ctrl+Insert)', function () {
    if (this.disabled) return false;
    this.parentElement.grid.include();
  }, "plus");
  if (imgEdit != -1) this.btEdit = this.createButton("edit", 'Editar', getLocaleMessage('INFO.FORM_EDIT'), function () {
    if (this.disabled) return false;
    this.parentElement.grid.edit();
  }, "edit");
  if (imgDelete != -1) this.btDelete = this.createButton("remove", 'Excluir', getLocaleMessage('LABEL.REMOVE_RECORD') + ' (Ctrl+Del/Ctrl+D)', function () {
    if (this.disabled) return false;
    this.parentElement.grid.deleteRow();
  }, "trash-alt");
  if (imgRefresh != -1) this.btRefresh = this.createButton("refresh", 'Atualizar', getLocaleMessage('LABEL.REFRESH') + '', function () {
    if (this.disabled) return false;
    this.parentElement.grid.refresh(false, true);
  }, "redo");
};

HTMLNavigationGrid.prototype.setEditImages = function (imgSave, imgCancel) {
  if (imgSave != -1) this.btEditSave = this.createButton("save", 'Gravar', getLocaleMessage('LABEL.SAVE_RECORD') + ' (Ctrl+G)', function () {
    if (this.disabled) return false;
    this.parentElement.grid.post();
  }, "save");
  if (imgCancel != -1) this.btEditCancel = this.createButton("cancel", 'Cancelar', getLocaleMessage('LABEL.CANCEL') + ' (ESC)', function () {
    if (this.disabled) return false;
    this.parentElement.grid.cancel();
  }, "ban");
};

/**
 * Método responsável por criar elementos para o componente.
 * @author Janpier
 * @param p JSON com as propriedades do elemento
 */
HTMLNavigationGrid.prototype.createElement = function (p) {
  if (p) {
    let elem = document.createElement(p.element);
    elem.id = p.id ? p.id : this.name + '_' + (Math.floor(Math.random() * 10009)+1) + "_" + p.element;
    elem.className = p.class ? p.class : "";
    elem.style = p.style ? p.style : "";
    if (p.position && p.position > 0)
      p.parent.insertBefore(elem, p.parent.childNodes[p.position]);
    else
      p.parent.appendChild(elem);
    if (p.hint) {
      elem.title = p.hint;
      elem.alt = p.hint;
      elem.setAttribute("data-toggle", "tooltip");
    }
    return elem;
  }
};

HTMLNavigationGrid.prototype.setVisibleSeparator = function (v) {
  let separator = document.getElementById(this.parent.id + "_separator_paging");
  let grid = this.parent;
  if (separator) {
    if (v) {
      if(separator.classList.contains("d-none")) {
        separator.classList.add("d-inline-flex");
        separator.classList.remove("d-none");
      }
    } else {
      if(separator.classList.contains("d-inline-flex")) {
        separator.classList.add("d-none");
        separator.classList.remove("d-inline-flex");
      }
    }
  } else if (grid.hasPagination && grid.enableSimpleFilter) {
    this.createElement({
      parent:grid.bar,
      element: "span",
      class: "mt-10 mb-0 mr-2 ml-2 d-inline-flex align-items-center justify-content-center border",
      style: "width: 1px;",
      id: grid.id + "_separator_paging",
      position: grid.bar.childNodes.length - 1
    });
  }
};

HTMLNavigationGrid.prototype.actInclude = function() {
  if (!this.enabled || this.readonly) return;
  this.parent.include();
};

HTMLNavigationGrid.prototype.actEdit = function() {
  if (!this.enabled || this.readonly) return;
  this.parent.edit();
};

HTMLNavigationGrid.prototype.actDelete = function() {
  if (!this.enabled || this.readonly) return;
  this.parent.deleteRow(this);
};

HTMLNavigationGrid.prototype.actRefresh = function() {
  this.parent.refresh(true);
};

HTMLNavigationGrid.prototype.actFields = function() {
  this.parent.openGridManager();
};

HTMLNavigationGrid.prototype.actEditSave = function() {
  this.parent.post();
};

HTMLNavigationGrid.prototype.actEditCancel = function() {
  this.parent.cancelEdit();
};

HTMLNavigationGrid.prototype.actIncludeSave = function() {
  if (!this.enabled || this.readonly) return;
  this.parent.post();
};

HTMLNavigationGrid.prototype.actIncludeCancel = function() {
  this.parent.cancelInclude();
};

HTMLNavigationGrid.prototype.ensureVisibility = function() { };

HTMLNavigationGrid.prototype.toggleButtons = function (b) {
  if (this.enabled && this.visible) {
    if (this.onEditing) {
      for (var i = 0; i < this.buttons.length; i++) {
        if (this.buttons[i].button.id == "saveButton" || this.buttons[i].button.id == "cancelButton") {
          this.buttons[i].button.className = this.buttons[i].class;
          this.buttons[i].visible = true;
        } else {
          this.buttons[i].button.className = "d-none"; // Bootstrap
          this.buttons[i].visible = false;
        }
      }
    } else {
      for (var i = 0; i < this.buttons.length; i++) {
        if (this.buttons[i].button.id == "saveButton" || this.buttons[i].button.id == "cancelButton") {
          this.buttons[i].button.className = "d-none"; // Bootstrap
          this.buttons[i].visible = false;
        } else {
          this.buttons[i].button.className = this.buttons[i].class;
          this.buttons[i].visible = true;
        }
      }
    }
  }
};

HTMLNavigationGrid.prototype.enableButtons = function(enable) {
  if (this.visible) {
    if (enable) {
      for (var i = 0; i < 3; i++) {
        this.buttons[i].button.className = this.buttons[i].class;
        this.buttons[i].visible = true;
      }
    } else {
      for (var i = 0; i < 3; i++) {
        this.buttons[i].button.className = "d-none"; // Bootstrap
        this.buttons[i].visible = false;
      }
    }
  }
};

HTMLNavigationGrid.prototype.checkButtons = function() {
  var buttonEnable = false;
  for (var i = 0; i < this.buttons.length; i++) {
    if (this.buttons[i].visible) buttonEnable = true;
  }

  this.enabled = buttonEnable;
};
