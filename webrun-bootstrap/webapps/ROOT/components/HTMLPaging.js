function HTMLPaging(sys, formID, code, posX, posY, width, height) {
  this.sys = sys;
  this.code = code;
  this.formID = formID;
  this.posX = posX;
  this.posY = posY;
  this.width = width;
  this.height = height;
  this.space = 0;
  this.buttons = new Array();
  this.gt = -1;

  this.defaultPadding = "1rem";
  this.smallPadding = "0.75rem";
}

HTMLPaging.inherits(HTMLElementBase);
HTMLPaging.prototype.name = 'HTMLPaging';

HTMLPaging.prototype.navigationAction = function(e, obj, param, sync) {
  if (this.onnavigate) this.onnavigate.call(param);
  var resultContentURL = getContent('navigate.do?sys=' + this.sys + '&formID=' + this.formID + '&componentID=' + this.code + '&action=navigate&param=' + param + '&inner=true&gt=' + this.gt);
  eval(resultContentURL);
};

HTMLPaging.prototype.setGoto = function(gt) {
  this.gt = gt;
};

HTMLPaging.prototype.setReadOnly = function(v) { };

HTMLPaging.prototype.setEnabled = function(v) {
  var object = this;
  this.buttons.forEach(function(elem) {
    object.setDisabled(elem, !v);
  });
};

HTMLPaging.prototype.createButton = function(param, hint, icon) {
  // Cria elemento da paginação.
  var li = document.createElement("li");
  li.className = "page-item h-100";
  li.disabled = false;
  li.visible = true;

  if (hint) {
    li.title = hint;
    li.setAttribute("data-toggle", "tooltip");// Bootstrap
  } 

  this.ulPagination.appendChild(li);

  // Cria botão da paginação.
  var bt = document.createElement("a");
  bt.className = "page-link py-1 h-100 d-flex align-items-center justify-content-center"; // Bootstrap
  bt.style.paddingLeft = this.defaultPadding;
  bt.style.paddingRight = this.defaultPadding;
  bt.id = param + "Button";
  bt.href = "#";
  li.appendChild(bt);

  // Associar eventos ao clique do botão.
  var object = this;
  bt.addEventListener("click", function() {
    object.grid.setActionFlag(false, true, false, false, false);
    if (object.onnavigate) object.onnavigate.call(param);
    eval(getContent('navigate.do?sys=' + object.sys + '&formID=' + object.formID + '&componentID=' + object.code + '&action=navigate&param=' + param + '&inner=true&gt=' + object.gt));
  }, false);

  // Variável utilizada em eventos.
  li.action = bt;

  // Criar ícone do botão de paginação.
  var btIcon = document.createElement("i");
  btIcon.className = "fas fa-" + icon; // Font Awesome
  btIcon.style.fontSize = "1rem";
  bt.appendChild(btIcon);

  return li;
};

HTMLPaging.prototype.createSameImageButton = function(param, hint, img, additionalClassName) { };

HTMLPaging.prototype.design = function(grid) {
  this.grid = grid;
  this.doc = grid.bar;

  // Cria div para alinhar os botões no lado direito da grade.
  this.div = document.createElement("div");
  this.div.className = "d-flex h-100 justify-content-end align-middle"; // Bootstrap

  // Criar UL onde serão colocados os botões.
  this.ulPagination = document.createElement("ul");
  this.ulPagination.className = "pagination h-100 mb-0"; // Bootstrap
  this.div.appendChild(this.ulPagination);

  // Cria os botões de paginação.
  this.buttons.push(this.btFirst = this.createButton("first", getLocaleMessage('LABEL.FIRST_PAGE'), "angle-double-left"));
  this.buttons.push(this.btPrevious = this.createButton("previous", getLocaleMessage('LABEL.PREVIOUS_PAGE'), "chevron-left"));
  this.buttons.push(this.btNext = this.createButton("next", getLocaleMessage('LABEL.NEXT_PAGE'), "chevron-right"));
  this.buttons.push(this.btLast = this.createButton("last", getLocaleMessage('LABEL.LAST_PAGE'), "angle-double-right"));

  // Adiciona a barra de paginação à grade.
  this.doc.appendChild(this.div);
};

HTMLPaging.prototype.enableButtons = function(f, p, n, l) {
  this.setDisabled(this.btFirst, !f);
  this.setDisabled(this.btPrevious, !p);
  this.setDisabled(this.btNext, !n);
  this.setDisabled(this.btLast, !l);
  this.setVisible(f || p || n || l);
};

HTMLPaging.prototype.setDisabled = function(elem, v) {
  v = parseBoolean(v);
  elem.disabled = v;

  if (v) {
    if (!elem.classList.contains("disabled")) {
      elem.classList.add("disabled");
    }
  } else {
    if (elem.classList.contains("disabled")) {
      elem.classList.remove("disabled");
    }
  }
};

HTMLPaging.prototype.setEnabled = function(elem) {
  if (elem.disabled) this.setDisabled(elem, false);
  else this.setDisabled(elem, true);
};

HTMLPaging.prototype.setNumPages = function(num) {
  this.numPages = num;
};

HTMLPaging.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  this.grid.nav.setVisibleSeparator(v);
  this.buttons.forEach(function(elem) {
    elem.visible = v;
  });
};

HTMLPaging.prototype.toString = function() {
  return '[object ' + this.name + ']';
};

HTMLPaging.prototype.flush = function() { };
