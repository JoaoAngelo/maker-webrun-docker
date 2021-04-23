function HTMLTreeviewNode(sys, formID, code, posX, posY, width, height, value, parentNode, treeview, caption, link, target, isOpen) {
  this.create(sys, formID, code, posX, posY, width, height, '', value);

  this.treeview = treeview;

  // Fallback para a TreeView antiga.
  this.tree = treeview;
  this._tree = treeview;

  this.parentNode = parentNode;
  this.id = value;
  this.length = 0;

  this.caption = caption;
  this.link = link;
  this.target = target;
  this.isOpen = isOpen;

  this.padding = 3;
}

HTMLTreeviewNode.inherits(HTMLElementBase);
HTMLTreeviewNode.prototype.name = "HTMLTreeviewNode";
HTMLTreeviewNode.prototype.tabable = false;

/**
 * É necessário a criação da div principal de forma diferente da HTMLElementBase.
 */
HTMLTreeviewNode.prototype.design = function(doc, tabControl) {
  // Cria o elemento base do node
  this.div = document.createElement("div");
  this.div.className = "list-group-item py-2 w-100"; // Bootstrap

  // Verificar se o node tem um node pai.
  if (this.parentNode) {
    this.div.className += " rounded-0"; // Bootstrap
    this.div.style.paddingLeft = this.parentNode.padding + "rem";
  }

  doc.appendChild(this.div);

  // Criar a div de conteúdo.
  this.contentDiv = document.createElement("div");
  this.contentDiv.className = "d-flex align-items-center"; // Bootstrap
  this.div.appendChild(this.contentDiv);

  // Definir o id deste node.
  if (this.treeview && this.treeview.draggable) {
    this.div.id = this.treeview._objectId + '_e_' + this.id + '_drag';
  } else if (this.treeview) {
    this.div.id = this.treeview._objectId + '_e_' + this.id;
  }

  // Associar eventos ao node.
  var object = this;
  this.attachEvent(this.div, "contextmenu", this.contextMenuAction)
  this.attachEvent(this.div, "click", this.clickAction);
  this.attachEvent(this.div, "dblclick", this.dblClickAction);
  this.div.addEventListener("mouseover", function(event) {
    if (object.treeview) object.treeview.hoveredElement = this;
  });

  // Verificar se o node tem caption.
  if (this.caption && this.caption.length > 0) {
    // Criar o label do node.
    this.label = document.createElement("label");
    this.label.className = "mb-0"; // Bootstrap
    this.label.innerHTML = stringToHTMLString(this.caption);
    this.contentDiv.appendChild(this.label);
  }

  // Definir as variáveis de contexto
  this.doc = doc;
  this.tabControl = tabControl;
  this.context = this.div;

  // Cria as variáveis do node
  this.children = new Array();
  this.length = 0;

  // Fallback para a TreeView antiga.
  this._children = this.children;

  this.designComponent(doc, tabControl);
  this.init(tabControl);
};

HTMLTreeviewNode.prototype.designComponent = function(doc) { };

HTMLTreeviewNode.prototype.attachEvent = function(obj, type, fn, owner, params) {
  this.callMethod(HTMLObject, "attachEvent", [obj, type, fn, owner, params]);
  if (obj == this && this.div) this.callMethod(HTMLObject, "attachEvent", [this.div, type, fn, owner, params]);
};

/**
 * Obter a raiz deste node.
 */
HTMLTreeviewNode.prototype.getRoot = function() {
  if (!this.parentNode || this.parentNode == this.treeview) return this.treeview.getRoot();
  return this.parentNode;
};

/**
 * Adiciona um filho à esse node.
 */
HTMLTreeviewNode.prototype.addChild = function(caption, link, target, isOpen) {
  // Verifica se o elemento base dos filhos deste node não existe
  if (!this.childrenDiv) {
    // Se não existir, devemos criar
    this.childrenDiv = document.createElement("div");
    this.childrenDiv.className = "list-group list-group-flush border-top"; // Bootstrap

    // Verifica se o node está aberto
    if (this.isOpen) this.childrenDiv.style.display = "block";
    else this.childrenDiv.style.display = "none";

    // Adicionar o elemento após o elemento deste node
    if (this.div.nextSibling) this.doc.insertBefore(this.childrenDiv, this.div.nextSibling);
    else this.doc.appendChild(this.childrenDiv);
  }

  // Verifica se o ícone de expandir não existe
  if (!this.expandIconBaseDiv) {
    this.expandIconBaseDiv = document.createElement("div");
    this.expandIconBaseDiv.className = "d-flex align-items-center justify-content-center mr-1"; // Bootstrap
    this.expandIconBaseDiv.style.width = "1rem";

    // Se não existir, devemos criar
    this.expandIcon = document.createElement("i");
    if (this.isOpen) this.expandIcon.className = "generic-btn mr-2 fas fa-chevron-down"; // Custom - Font Awesome
    else this.expandIcon.className = "generic-btn mr-2 fas fa-chevron-right"; // Custom - Font Awesome
    this.expandIconBaseDiv.appendChild(this.expandIcon);

    // Evento de clique
    this.attachEvent(this.expandIconBaseDiv, 'click', this.toggleExpand);

    // Adiciona o ícone ao node antes do label, se ele existir
    if (this.iconDiv) this.contentDiv.insertBefore(this.expandIconBaseDiv, this.iconDiv);
    else if (this.label) this.contentDiv.insertBefore(this.expandIconBaseDiv, this.label);
    else this.contentDiv.appendChild(this.expandIconBaseDiv);
  }

  // Cria o node do filho
  var child = new HTMLTreeviewNode(this.sys, this.formID, this.code, 0, 0, 0, 0, this.treeview.idCount++, this, this.treeview, caption, link, target, isOpen);
  child.padding = this.padding + 2;

  // Adiciona o filho à esse node
  this.children.push(child);
  if (this.parentNode) this.parentNode.length++;
  else this.treeview.length++;
  this.length++;

  // Inicializa o filho
  child.design(this.childrenDiv, this.tabControl);

  // Retorna a instância do filho
  return child;
};

/**
 * Define o ícone desse node.
 */
HTMLTreeviewNode.prototype.setIcon = function(icon) {
  this.icon = icon;

  if (!icon || icon === undefined || icon === null || icon === "" || (icon.length && icon.length == 0)) { // Ícone em branco
    this.removeIcon(); // Remover o ícone
  } else if (icon.toLowerCase() == "loading") { // Ícone de Carregando
    if (this.iconDiv) this.removeIcon(); // Remover o ícone atual

    // Ícone de carregando, então criar um spinner do Bootstrap
    this.iconDiv = document.createElement("div");
    this.iconDiv.className = "spinner-border text-dark mr-2"; // Bootstrap
    this.iconDiv.innerHTML = '<span class="sr-only">' + getLocaleMessage("LABEL.LOADING") + '...</span>'; // Bootstrap

    // Layout do ícone
    this.iconDiv.style.width = (this.treeview.imageHeight - 4) + "px";
    this.iconDiv.style.height = (this.treeview.imageHeight - 4) + "px";

    // Adicionar o ícone ao node
    if (this.label) this.contentDiv.insertBefore(this.iconDiv, this.label);
    else this.contentDiv.appendChild(this.iconDiv);
  } else if (icon.toLowerCase().indexOf("fa-") != -1) { // Ícone do Font Awesome
    if (this.iconDiv) this.removeIcon(); // Remover o ícone atual

    // Ícone do Font Awesome
    this.iconDiv = document.createElement("i");
    this.iconDiv.className = "mr-2 " + icon; // Bootstrap

    // Layout do ícone
    this.iconDiv.style.fontSize = this.treeview.imageHeight + "px";
    this.iconDiv.style.lineHeight = this.treeview.imageHeight + "px";

    // Adicionar o ícone ao node
    if (this.label) this.contentDiv.insertBefore(this.iconDiv, this.label);
    else this.contentDiv.appendChild(this.iconDiv);
  } else if (icon.indexOf("/") !== -1 || icon.indexOf("\\") !== -1 || icon.indexOf(".") !== -1) { // URL de uma Imagem
    if (this.iconDiv) this.removeIcon(); // Remover o ícone atual

    // O ícone tem elementos de URL, então criar uma img
    this.iconDiv = document.createElement("img");
    this.iconDiv.className = "mr-2"; // Bootstrap
    this.iconDiv.src = icon;

    // Layout do ícone
    this.iconDiv.width = this.treeview.imageHeight;
    this.iconDiv.height = this.treeview.imageHeight;

    this.iconDiv.style.width = this.treeview.imageHeight + "px";
    this.iconDiv.style.height = this.treeview.imageHeight + "px";

    // Adicionar o ícone ao node
    if (this.label) this.contentDiv.insertBefore(this.iconDiv, this.label);
    else this.contentDiv.appendChild(this.iconDiv);
  }
};

/**
 * Remove o ícone do node.
 */
HTMLTreeviewNode.prototype.removeIcon = function() {
  this.icon = null;
  if (this.iconDiv) {
    if (this.iconDiv.remove) this.iconDiv.remove();
    else this.iconDiv.parentElement.removeChild(this.iconDiv); // IE
    this.iconDiv = null;
  }
};

/**
 * Procura um filho pelo seu identificador.
 */
HTMLTreeviewNode.prototype.findChildById = function(id) {
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
 * Procura um filho pelo seu texto.
 */
HTMLTreeviewNode.prototype.findChildByCaption = function(caption) {
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instância do filho
      var node = this.children[i];

      // Verifica se o filho tem o texto especificado
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
HTMLTreeviewNode.prototype.getChildIndexById = function(id) {
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
 * Deleta todos os filhos deste node.
 */
HTMLTreeviewNode.prototype.removeAllChilds = function() {
  // Deleta todos os filhos
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instância do filho
      var node = this.children[i];

      // Deleta o filho.
      node.deleteSelf();
    }
  }

  // Remove o elemento base dos filhos deste node da página
  if (this.childrenDiv) {
    if (this.childrenDiv.remove) {
      this.childrenDiv.remove();
    } else this.childrenDiv.parentElement.removeChild(this.childrenDiv); // IE
  }

  // Remove o elemento do ícone de expandir
  if (this.expandIconBaseDiv) {
    if (this.expandIconBaseDiv.remove) {
      this.expandIconBaseDiv.remove();
    } else this.expandIconBaseDiv.parentElement.removeChild(this.expandIconBaseDiv); // IE
  }

  // Reseta as variáveis
  this.children = new Array();
  this.length = 0;

  this.childrenDiv = null;
  this.expandIconBaseDiv = null;
  this.expandIcon = null;

  // Fallback para a TreeView antiga.
  this._children = this.children;
};

/**
 * Deleta este node da Treeview.
 */
HTMLTreeviewNode.prototype.deleteSelf = function() {
  // Remove este node do seu pai
  if (this.parentNode) {
    if (this.parentNode.name == 'HTMLTreeviewNode') { // O pai é um node
      if (this.parentNode.children && this.parentNode.children.length > 0) {
        // Obter o índice deste filho
        var index = this.parentNode.getChildIndexById(this.id);

        // Deletar este filho do seu pai
        this.parentNode.children.splice(index, 1);
        this.parentNode.elementRemoved(this);
      }
    } else if (this.parentNode.tree) { // O pai é a própria Treeview
      // Obter o índice deste filho
      var index = this.parentNode.getChildIndexById(this.id);

      // Deletar este filho do seu pai
      this.parentNode.children.splice(index, 1);
      this.parentNode.elementRemoved(this);
    }
  }

  // Deleta todos os filhos
  this.removeAllChilds();

  // Deleta o ícone deste node
  this.removeIcon();

  // Remove o elemento base do node da página
  if (this.div) {
    if (this.div.remove) {
      this.div.remove();
    } else this.div.parentElement.removeChild(this.div); // IE
  }

  // Verifica se o node selecionado da Treeview é este node
  if (this.treeview && this.treeview.getActiveElement() == this) {
    this.treeview.setActiveElement(this);
  }

  // Limpa as variáveis
  this.treeview = null;
  this.tree = null;
  this._tree = null;
  this.parentNode = null;
  this.children = null;
  this._children = null;
  this.div = null;

  this.icon = null;
  this.caption = null;
  this.link = null;
  this.target = null;
  this.isOpen = null;
};

/**
 * Define os dados do banco de dados relacionados à esse node.
 */
HTMLTreeviewNode.prototype.setElementDBInfo = function(arrInfo) {
  this.dataContainer = arrInfo;
};

/**
 * Obtém os dados do banco de dados relacionados à esse node.
 */
HTMLTreeviewNode.prototype.getElementDBInfo = function(element) {
  return this.dataContainer;
};

/**
 * Altera o estado de expandido deste node.
 */
HTMLTreeviewNode.prototype.setOpenState = function(isOpen) {
  if (this.isOpen == isOpen) return;
  this.isOpen = isOpen;

  // Chamar o evento
  if (this.isOpen && this.beforeExpandAction) {
    this.beforeExpandAction.call(this);
  } else if (!this.isOpen && this.beforeCollapseAction) {
    this.beforeCollapseAction.call(this);
  }

  // Alterar a visibilidade e estilo de alguns elementos
  if (this.childrenDiv) {
    if (this.isOpen) this.childrenDiv.style.display = "block";
    else this.childrenDiv.style.display = "none";
  }

  if (this.expandIcon) {
    if (this.isOpen) this.expandIcon.className = "generic-btn mr-2 fas fa-chevron-down"; // Custom - Font Awesome
    else this.expandIcon.className = "generic-btn mr-2 fas fa-chevron-right"; // Custom - Font Awesome
  }

  // Chamar o evento
  if (this.isOpen && this.expandAction) {
    this.expandAction.call(this);
  } else if (!this.isOpen && this.collapseAction) {
    this.collapseAction.call(this);
  }

  if (this.isOpen && this.afterExpandAction) {
    this.afterExpandAction.call(this);
  } else if (!this.isOpen && this.afterCollapseAction) {
    this.afterCollapseAction.call(this);
  }
};

/**
 * (Bs_Tree Fallback) Expande todos os elementos deste node.
 */
HTMLTreeviewNode.prototype.open = function() {
  this.expandAll();
};

/**
 * (Bs_Tree Fallback) Colapsa todos os elementos deste node.
 */
HTMLTreeviewNode.prototype.close = function() {
  this.collapseAll();
};

/**
 * Expande todos os elementos deste node.
 */
HTMLTreeviewNode.prototype.expandAll = function() {
  this.setOpenState(true);
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instância do filho
      var node = this.children[i];
      node.setOpenState(true);
    }
  }
};

/**
 * Colapsa todos os elementos deste node.
 */
HTMLTreeviewNode.prototype.collapseAll = function() {
  this.setOpenState(false);
  if (this.children && this.children.length > 0) {
    for (var i = 0; i < this.children.length; i++) {
      // Obter a instância do filho
      var node = this.children[i];
      node.setOpenState(false);
    }
  }
};

/**
 * Alterna o estado de expandido do node.
 */
HTMLTreeviewNode.prototype.toggleExpand = function() {
  this.setOpenState(!this.isOpen);
};

/**
 * Evento de clique do node.
 */
HTMLTreeviewNode.prototype.clickAction = function(e, o) {
  this.callMethod(HTMLElementBase, "clickAction", [e, o]);

  // Define esse node como selecionado na Treeview.
  if (this.enabled && this.treeview) {
    this.treeview.setActiveElement(this);
  }
};

/**
 * Evento de clique duplo do node.
 */
HTMLTreeviewNode.prototype.dblClickAction = function(e, o) {
  if (this.enabled && this.ondblclick) {
    this.ondblclick.call(this, e);
  }
};

/**
 * Evento de botão direito do mouse do node.
 */
HTMLTreeviewNode.prototype.contextMenuAction = function(e) {
  e.preventDefault();

  // Define esse node como selecionado na Treeview.
  if (this.enabled && this.treeview) {
    this.treeview.setActiveElement(this);
  }
};

/**
 * Função chamada toda vez que um elemento é adicionado.
 */
HTMLTreeviewNode.prototype.elementAdded = function(node) {
  if (this.parentNode) this.parentNode.elementAdded(node);
  else if (this.treeview) this.treeview.elementAdded(node);
  this._children = this.children; // Bs_Tree Fallback
  this.length++;
};

/**
 * Função chamada toda vez que um elemento é removido.
 */
HTMLTreeviewNode.prototype.elementRemoved = function(node) {
  if (this.parentNode) this.parentNode.elementRemoved(node);
  else if (this.treeview) this.treeview.elementRemoved(node);
  this._children = this.children; // Bs_Tree Fallback
  this.length--;
};
