function HTMLTreeview(sys, formID, code, posX, posY, width, height, value) {
  this.create(sys, formID, code, posX, posY, width, height, '', value);
  this.type = 1;
  this.maxCode = 0;
  this.id = value;
  this.idCount = 1;
  this.border = true;

  // NOTA: Embora o Bs_Tree tenha sido removido,
  // muitas de suas variáveis são utilizadas por
  // funções do Maker e para não quebrá-las,
  // declaramos algumas importantes.
  this._id = value;
  this._objectId = "Bs_Tree_" + value;
  this.tree = this;
  this._tree = this;
  this.useRadioButton = false;
  this.useFolderIcon = true;
  this.useLeaf = true;
  this.walkTree = true;
  this.useAutoSequence = true;
  this.draggable = false;
  this.imageDir = '';
}

HTMLTreeview.inherits(HTMLElementBase);
HTMLTreeview.prototype.name = 'HTMLTreeview';
HTMLTreeview.prototype.tabable = false;
HTMLTreeview.prototype.zindex = 100000;


// Tamanho dos ícones da Treeview
HTMLTreeview.prototype.imageHeight = 24;

HTMLTreeview.prototype.clean = function() {
  // Deleta todos os nodes
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instância do node
      var node = this.children[i];

      // Deleta o node
      node.deleteSelf();
    }
  }

  // Limpa todos os elementos
  this.nodesDiv.innerHTML = "";

  // Reseta o array de nodes
  this.children = new Array();
  this.length = 0;

  // Fallback para a TreeView antiga.
  this._children = this.children;

  // Limpa a variável de item selecionado
  this.selectedNode = null;

  // Limpa a variável de item com mouse em cima
  this.hoveredNode = null;
};

HTMLTreeview.prototype.filter = function(value) {
  var url = 'treeViewFilter.do?sys=' + this.sys + '&formID=' + this.formID + '&comID=' + this.code + '&filter=' + URLEncode(value, 'GET');
  getAndEvalSync2(url);
  this.refreshURL = url;
};

HTMLTreeview.prototype.attachEvent = function(obj, type, fn, owner, params) {
  this.callMethod(HTMLObject, "attachEvent", [obj, type, fn, owner, params]);
  if (obj == this && this.div) this.callMethod(HTMLObject, "attachEvent", [this.div, type, fn, owner, params]);
  if (obj == this && this.nodesDiv) this.callMethod(HTMLObject, "attachEvent", [this.nodesDiv, type, fn, owner, params]);
};

HTMLTreeview.prototype.designComponent = function(doc) {
  this.status = "closed";

  // Cria o array de nodes do Treeview
  this.children = new Array();
  this.length = 0;

  // Fallback para a TreeView antiga.
  this._children = this.children;

  // Prepara o elemento base da Treeview
  this.div.id = "WFRTree" + this.code;
  this.div.className += " p-0 overflow-auto"; // Bootstrap
  this.divClass = this.div.className;
  this._pseudoElement = this.div; // Bs_Tree Fallback

  // Decoração da Treeview
  if (this.border) this.div.className += " card"; // Bootstrap
  if (this.bgColor) this.div.style.backgroundColor = this.bgColor;
  this.setFontStyle();

  // Cria o elemento base dos nodes da Treeview
  this.nodesDiv = document.createElement("div");
  this.nodesDiv.className = "list-group list-group-flush"; // Bootstrap
  this.div.appendChild(this.nodesDiv);

  // Definir variável para compatibilidade de funções.
  this.otherDiv = this.div;
};

HTMLTreeview.prototype.setColor = function(color) {
  this.callMethod(HTMLElementBase, "setColor", [color]);
  this.setFontStyle();
};

HTMLTreeview.prototype.hideTree = function() {
  this.div.style.display = "none";
};

HTMLTreeview.prototype.showTree = function() {
  this.div.style.display = "block";
};

HTMLTreeview.prototype.setIcon = function(element, iconFile, skin) {
  if (element) element.setIcon(iconFile, skin);
};

HTMLTreeview.prototype.show = function() { };

HTMLTreeview.prototype.getRoot = function() {
  return this;
};

/**
 * Obtém a referência para a árvore.
 * Função mantida para compatibilidade com a árvore antiga.
 */
HTMLTreeview.prototype.getTree = function() {
  return this.tree;
};

HTMLTreeview.prototype.setIconsHeight = function(height) {
  this.imageHeight = height;
};

HTMLTreeview.prototype.setFontStyle = function() {
  if (this.nodesDiv) {
    this.nodesDiv.style.color = this.color ? this.color : null;
    this.nodesDiv.style.fontFamily = this.font ? this.font : null;
    this.nodesDiv.style.fontWeight = this.weight ? "bold" : null;
    this.nodesDiv.style.fontStyle = this.italic ? "italic" : null;
    this.nodesDiv.style.fontSize = this.size ? this.size +
      (this.size.indexOf("pt") == -1 &&
       this.size.indexOf("px") == -1 &&
       this.size.indexOf("em") == -1 &&
       this.size.indexOf("rem") == -1 ? "pt" : "") : null;
    this.nodesDiv.style.textDecoration =
      this.underline && this.strikeout ? "underline line-through" :
      this.underline ? "underline" : this.strikeout ? "line-through" : null;
  }

  if (parseInt(this.size) < 8 || parseInt(this.size) > 12) {
    if (parseInt(this.size) >= 10 && parseInt(this.size) <= 20) {
      this.setIconsHeight((parseInt(this.size) + 10) + 'px');
    } else if (parseInt(this.size) > 20) {
      this.setIconsHeight((parseInt(this.size) + 20) + 'px');
    } else {
      this.setIconsHeight((parseInt(this.size) + 5) + 'px');
    }
  }
};

HTMLTreeview.prototype.setElementDBInfo = function(element, arrInfo) {
  element.dataContainer = arrInfo;
};

HTMLTreeview.prototype.getElementDBInfo = function(element) {
  return element.dataContainer;
};

HTMLTreeview.prototype.setElementDBCodeInfo = function(element, code, codeParent) {
  var arrInfo = new Array();
  arrInfo['code'] = code;
  arrInfo['codeParent'] = codeParent;
  element.dataContainer = arrInfo;
};

HTMLTreeview.prototype.getElementByName = function(caption) {
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instância do filho
      var node = this.children[i];

      // Verifica se o filho tem o id especificado
      if (node && node.caption == caption) return node;

      // Procura nos filhos do filho atual
      var nodeChildren = node.findChildByCaption(caption);
      if (nodeChildren != null) return nodeChildren;
    }
  }

  // Nada encontrado
  return null;
};

/**
 * Obtém o índice de um filho pelo seu identificador.
 */
HTMLTreeview.prototype.getChildIndexById = function(id) {
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instância do filho
      var node = this.children[i];

      // Verifica se o filho tem o id especificado
      if (node && node.id == id) return i;
      else if (node && node.getChildIndexById) {
        var result = node.getChildIndexById(id);
        if (result != -1) return result;
      }
    }
  }

  // Nada encontrado
  return -1;
};

/**
 * Obtém o elemento que o mouse está em cima.
 */
HTMLTreeview.prototype.getHoveredElement = function() {
  return (this.hoveredNode) ? this.hoveredNode : this.selectedNode;
};

/**
 * Obtém o elemento ativo nesta treeview.
 */
HTMLTreeview.prototype.getActiveElement = function() {
  return (this.selectedNode) ? this.selectedNode : this.hoveredNode;
};

/**
 * Define o elemento ativo desta treeview.
 */
HTMLTreeview.prototype.setActiveElement = function(node) {
  if (this.selectedNode && this.selectedNode.div)
    this.selectedNode.div.classList.remove("active");
  this.selectedNode = node;
  if (node && node.div) node.div.classList.add("active");
};

HTMLTreeview.prototype.getElement = function(id) {
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instância do filho
      var node = this.children[i];

      // Verifica se o filho tem o id especificado
      if (node && node.id == id) return node;

      // Procura nos filhos do filho atual
      var nodeChildren = node.findChildById(id);
      if (nodeChildren != null) return nodeChildren;
    }
  }

  // Nada encontrado
  return null;
};

/**
 * Função chamada toda vez que um elemento é adicionado.
 */
HTMLTreeview.prototype.elementAdded = function(node) {
  this.length++;
};

/**
 * Função chamada toda vez que um elemento é removido.
 */
HTMLTreeview.prototype.elementRemoved = function(node) {
  this.length--;
};

HTMLTreeview.prototype.focus = function() { return false; };
HTMLTreeview.prototype.blur = function() { return false; };

HTMLTreeview.prototype.addChild = function(parentElement, caption, link, target, isOpen) {
  if (!this.children) {
    this.children = new Array();
    this.length = 0;
  }

  if (parentElement === null || parentElement === undefined) {
    interactionError(safeGetLocaleMessage("ERROR.TREEVIEW_NULL_PARENT"));
    return null;
  }

  // Se o elemento pai for a própria árvore, significa que é pra ser adicionado na raiz.
  if (parentElement === this) {
    // Cria o node do filho.
    var child = new HTMLTreeviewNode(this.sys, this.formID, this.code, 0, 0, 0, 0, this.idCount++, this, this, caption, link, target, this.length == 0 ? true : isOpen);

    // Adiciona o filho a Treeview.
    this.children.push(child);
    this.elementAdded(child);

    // Fallback para a TreeView antiga.
    this._children = this.children;

    // Inicializa o filho.
    child.design(this.nodesDiv, this.tabControl);

    // Retorna a instância do filho criado.
    return child;
  } else {
    // Cria o node do filho no elemento
    return parentElement.addChild(caption, link, target, isOpen);
  }
};

/**
 * Assocair fluxo ao evento de clique de um elemento da árvore.
 * @param element Referência para o elemento.
 * @param ruleName Nome do fluxo a ser chamado.
 * @param ruleParams Parâmetros do fluxo.
 */
HTMLTreeview.prototype.associateRuleToElement = function(element, ruleName, ruleParams) {
  var _sys = this.sys;
  var _formID = this.formID;
  var _params = ruleParams ? ruleParams : "";
  var _ruleName = ruleName;

  element.onclick = function() {
    executeJSRuleNoField(_sys, _formID, _ruleName, _params);
  };
};

HTMLTreeview.prototype.addChildByElement = function(parentElement, element) {
  var elementParent = (parentElement) ? parentElement : this.getActiveElement();
  return elementParent.addChild(element);
};

HTMLTreeview.prototype.createElement = function(caption, link, target) {
  return this.addChild(null, caption, link, target, false);
};

HTMLTreeview.prototype.getDataContainer = function(element) {
  if (element) return element.dataContainer;
};

HTMLTreeview.prototype.removeElement = function(element) {
  if (this.children && element) {
    for (var i = 0; i < this.children.length; i++) {
      var node = this.children[i];
      if (node && node.id == element.id) {
        node.deleteSelf();
        break;
      }
    }
  }
};

HTMLTreeview.prototype.useRadioControl = function(bool) {
  this.radio = bool;
  if (bool) this.check = false;
};

HTMLTreeview.prototype.useCheckBox = function(bool) {
  this.check = bool;
  if (bool) this.radio = false;
};

HTMLTreeview.prototype.useAutoCollapse = function(bool) {
  this.autoCollapse = bool;
};

/**
 * Deleta todos os filhos da árvore.
 */
HTMLTreeview.prototype.removeAllChilds = function() {
  // Deleta todos os filhos
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instвncia do filho
      var node = this.children[i];

      // Deleta o filho.
      node.deleteSelf();
    }
  }

  // Reseta as variáveis
  this.children = new Array();
  this.length = 0;

  // Fallback para a TreeView antiga.
  this._children = this.children;
};

/**
 * Deleta todos os filhos de um nó da árvore.
 * @param element Referência do da árvore para remover todos os seus filhos.
 */
HTMLTreeview.prototype.removeAllChildsOf = function(element) {
  if (element) element.removeAllChilds();
};

HTMLTreeview.prototype.getMaxCode = function() {
  return this.maxCode = this.findMaxCode(this.getRoot());
};

HTMLTreeview.prototype.findMaxCode = function(element) {
  var maxCode = 0;
  for (var i = 0; i < element.children.length; i++) {
    if (element.children[i].id > maxCode) {
      maxCode = element.children[i].id;
    }

    if (element.children[i].children.length > 0) {
      if (this.findMaxCode(element.children[i]) > maxCode) {
        maxCode = element.children[i].id;
      }
    }
  }

  return maxCode;
};

HTMLTreeview.prototype.addLoadActionEvent = function(element) {
  var key = this.getElementDBInfo(element).chave;
  var id = element.id;
  var idParent = element.parentNode ? element.parentNode.id : this.id;
  var func = this.onbeforeopen;
  element.expandAction = loadActionEventHandle(this.sys, this.formID, this.code, key, id, idParent, func);
};

HTMLTreeview.prototype.addAfterCloseActionEvent = function(element) {
  var key = this.getElementDBInfo(element).chave;
  var id = element.id;
  var idParent = element.parentNode ? element.parentNode.id : this.id;
  var func = this.onafterclose;
  element.collapseAction = unLoadActionEventHandle(this.sys, this.formID, this.code, id, idParent, func);
};

HTMLTreeview.prototype.setOnClickEvt = function(element) {
  if (element && this.onclick) element.onclick = funcHandle(this.onclick, element.dataContainer.chave,
    (element.parentNode && element.parentNode.dataContainer ? element.parentNode.dataContainer.chave : null));
};

HTMLTreeview.prototype.setOnDblClickEvt = function(element) {
  if (element && this.ondblclick) element.ondblclick = funcHandle(this.ondblclick, element.dataContainer.chave,
    (element.parentNode && element.parentNode.dataContainer ? element.parentNode.dataContainer.chave : null));
};

function funcHandle(func, id, parentID) {
  return function() { func(id, parentID); }
};

HTMLTreeview.prototype.setOnBeforeOpenEvt = function(element) {
  if (element && this.onbeforeopen) element.beforeExpandAction = funcHandle(this.onbeforeopen, element.dataContainer.chave,
    (element.parentNode && element.parentNode.dataContainer ? element.parentNode.dataContainer.chave : null));
};

HTMLTreeview.prototype.setOnAfterOpenEvt = function(element) {
  if (element && this.onafteropen) element.afterExpandAction = funcHandle(this.onafteropen, element.dataContainer.chave,
    (element.parentNode && element.parentNode.dataContainer ? element.parentNode.dataContainer.chave : null));
};

HTMLTreeview.prototype.setOnBeforeCloseEvt = function(element) {
  if (element && this.onbeforeclose) element.beforeCollapseAction = funcHandle(this.onbeforeclose, element.dataContainer.chave,
    (element.parentNode && element.parentNode.dataContainer ? element.parentNode.dataContainer.chave : null));
};

HTMLTreeview.prototype.setOnAfterCloseEvt = function(element) {
  if (element && this.onafterclose) element.afterCollapseAction = funcHandle(this.onafterclose, element.dataContainer.chave,
    (element.parentNode && element.parentNode.dataContainer ? element.parentNode.dataContainer.chave : null));
};

HTMLTreeview.prototype.setCaptionBgColor = function(color) {

};

loadActionEventHandle = function(sys, formID, code, key, id, idParent, func) {
  return function() {
    var url = "treeViewLoad.do?sys=" + sys + "&formID=" + formID +
      "&comID=" + code + "&nodeKey=" + key + "&nodeId=" + id;
    getAndEvalSync(url);

    if (func) {
      var nodeSelected = treeView.getElement(id);
      func = funcHandle(func, nodeSelected.dataContainer.chave, (nodeSelected.parentNode && nodeSelected.parentNode.dataContainer ? nodeSelected.parentNode.dataContainer.chave : null)); // Chamada da regra antes de expandir
      func();
    }
  }
};

unLoadActionEventHandle = function(sys, formID, code, id, idParent, func) {
  return function() {
    var treeView = eval("d.c_" + code);
    var nodeSelected = treeView.getElement(id);
    treeView.removeAllChildsOf(nodeSelected);
    var nodeLoading = treeView.addChild(nodeSelected, getLocaleMessage("LABEL.LOADING"));
    treeView.setIcon(nodeLoading, 'loading');

    if (func) {
      func = funcHandle(func, nodeSelected.dataContainer.chave, (nodeSelected.parent && nodeSelected.parent.dataContainer ? nodeSelected.parent.dataContainer.chave : null)); // Chamada da regra antes de expandir
      func();
    }
  }
};

HTMLTreeview.prototype.getPermissionDescription = function() {
  if (!isNullable(this.permissionDescription))
    return this.permissionDescription;
  return this.callMethod(HTMLElementBase, "getPermissionDescription");
};
