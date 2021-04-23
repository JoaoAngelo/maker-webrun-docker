function HTMLMemo(sys, formID, code, posX, posY, width, height, description, value) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.type = 1;
  this.report = false;
  this.wrap = false;
}

HTMLMemo.inherits(HTMLEdit);
HTMLMemo.prototype.name = 'HTMLMemo';
HTMLMemo.prototype.tabable = true;
HTMLMemo.prototype.tagName = 'edit';
HTMLMemo.prototype.tabKeys = [9];

HTMLMemo.prototype.setHeight = function(height) {
  this.callMethod(HTMLLabeledComponent, 'setHeight', [height]);
  if (this.input) {
    this.input.style.height = this.div.style.height;
    this.input.style.minHeight = this.div.style.height;
    this.input.style.maxHeight = this.div.style.height;
  }
};

HTMLMemo.prototype.designReport = function() {
  var div = this.getBaseDiv(false, this.posX, this.posY, this.width + (IE ? 2 : 0), this.height + (IE ? 2 : 0));
  div.id = "ReportMemo" + this.code;
  div.innerHTML = this.value;
  var mainDiv = MM_findObj("lay");
  mainDiv.appendChild(div);
};

HTMLMemo.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLEdit, "setReadOnly", [v]);
  if (this.trumbowyg) {
    if (v) this.trumbowyg.trumbowyg("disable");
    else this.trumbowyg.trumbowyg("enable");
  }
};

HTMLMemo.prototype.hasEmptyValue = function() {
  var currentValue = this.getValue();
  return (currentValue === undefined || currentValue == '');
};

HTMLMemo.prototype.setEnabled = function(v) {
  this.callMethod(HTMLEdit, "setEnabled", [v]);
  if (this.richText) {
    if (!this.enabled) {
      if (this.trumbowygDiv) this.trumbowygDiv.classList.add("disabled");
      if (this.trumbowyg) this.trumbowyg.trumbowyg("disable");
      if (containsNode(this.context, this.btdiv)) this.context.removeChild(this.btdiv);
      if (this.input) this.input.disabled = true;
    } else {
      if (this.trumbowygDiv) this.trumbowygDiv.classList.remove("disabled");
      if (this.trumbowyg) this.trumbowyg.trumbowyg("enable");
      if (this.type == 2 && !containsNode(this.context, this.btdiv)) this.context.appendChild(this.btdiv);
      if (this.input) this.input.disabled = false;
    }
  }
};

HTMLMemo.prototype.designInput = function(doc, name, value) {
  this.input = document.createElement("textarea");
  this.input.className = "form-control w-100" + // Bootstrap
    (this.isRichText() ? " d-none" : ""); // Bootstrap
  this.input.style.height = this.div.style.height;
  this.input.style.minHeight = this.div.style.height;
  this.input.style.maxHeight = this.div.style.height;
  this.input.setAttribute("wrap", this.wrap ? "soft" : "off");
  this.input.name = name ? name : 'WFRInput' + this.code;
  this.input.id = name ? name : 'WFRInput' + this.code;
  if (this.placeholder) this.input.placeholder = this.placeholder;
  if (this.maxlength) this.input.maxLength = this.maxlength;
  this.input.value = value ? value : this.value;

  if (this.isRichText()) {
    // Ajustar classe da div.
    this.div.className += " d-flex flex-column"; // Bootstrap
    this.divClass = this.div.className;

    // Criar o elemento base para o Trumbowyg
    this.trumbowygDiv = document.createElement("div");
    if (this.placeholder) this.trumbowygDiv.setAttribute("placeholder", this.placeholder);
    this.div.appendChild(this.trumbowygDiv);

    // Importar o CSS do Trumbowyg
    if (!document.getElementById("trumbowyg-css")) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'components/trumbowyg/ui/trumbowyg.min.css';
      link.id = 'trumbowyg-css';
      head.appendChild(link);
    }

    // Importar o CSS do Plugin 'Colors' Trumbowyg
    if (!document.getElementById("trumbowyg-colors-css") && this.richText == 2) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'components/trumbowyg/plugins/colors/trumbowyg.colors.min.css';
      link.id = 'trumbowyg-colors-css';
      head.appendChild(link);
    }

    // Importar o script do Trumbowyg
    webrun.include("components/trumbowyg/trumbowyg.min.js");

    if(this.richText == 2){
      webrun.include("components/trumbowyg/plugins/colors/trumbowyg.colors.min.js");
      webrun.include("components/trumbowyg/plugins/fontfamily/trumbowyg.fontfamily.min.js");
    }

    // NOTA: O Trumbowyg jÃ¡ Ã© inglÃªs, nÃ£o existe arquivo de language em inglÃªs pra ele,
    //       portanto, sÃ³ importar quando o idioma nÃ£o for inglÃªs
    if (resources_locale.toLowerCase() != "en_us") {
      webrun.include("components/trumbowyg/langs/" + resources_locale.toLowerCase() + ".min.js");
    }

    // Montar a toolbar do Trumbowyg
    var editorButtons = [];
    if (this.richText == 1) {
      editorButtons = [
        ['viewHTML'],
        ['undo', 'redo'],
        ['formatting'],
        ['strong', 'em', 'del'],
        ['superscript', 'subscript'],
        ['unorderedList', 'orderedList'],
        ['removeformat']
      ];
    } else if (this.richText == 2) {
      editorButtons = [
        ['viewHTML'],
        ['undo', 'redo'],
        ['fontfamily'],
        ['formatting'],
        ['strong', 'em', 'del'],
        ['foreColor', 'backColor'],
        ['superscript', 'subscript'],
        ['link'],
        ['insertImage'],
        ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
        ['unorderedList', 'orderedList'],
        ['horizontalRule'],
        ['removeformat']
      ];
    }

    // Criar uma instÃ¢ncia do Trumbowyg
    this.trumbowyg = $(this.trumbowygDiv);
    this.trumbowyg.trumbowyg({
      // Idioma do Trumbowyg
      lang: resources_locale.toLowerCase(),

      // Pasta com os Ã­cones
      svgPath: 'components/trumbowyg/ui/icons.svg',

      // Desativar o Trumbowyg quando o elemento estiver desativado ou somente leitura
      disabled: !this.enabled || this.readonly,

      // BotÃµes da toolbar
      btns: editorButtons,

      // Ajeita as URLs colocadas pelo usuÃ¡rio nos hyperlinks
      // Por exemplo, example.com vira https://example.com
      urlProtocol: true,

      // Proibir tags de script e CSS
      tagsToRemove: ['script', 'link']
    });

    // Definir o texto inicial
    this.trumbowyg.trumbowyg("html", value ? value : this.value);

    // Definir eventos no Trumbowyg
    var object = this;
    this.trumbowyg.on('tbwfocus', this.onfocus);
    this.trumbowyg.on('tbwblur', this.onblur);
    this.trumbowyg.on('tbwchange', function() {
      if (object.onchange) object.onchange();
      var value = object.getValue();
      var valueSizeLimited = object.defineTextByLength(null, object.maxlength == 0);
      if (value != valueSizeLimited) {
        object.setValue(valueSizeLimited);
      }
    });

    this.trumbowyg.on('click', this.onclick);
    if (this.input) this.trumbowyg.on('keypress', this.input.onkeypress);

    this.trumbowyg.on('tbwinit', function() {
      object.trumbowygDiv.parentNode.style.height = object.height + "px";
    });

    if (this.wrap && this.richText) {
      this.trumbowygDiv.style.wordWrap = "break-word";
    }
  }

  if (!this.selectionEventSet) {
    // Associar evento "onselectionchange" no documento para salvar a Ãºltima posiÃ§Ã£o do cursor.
    // Utilizado nas funÃ§Ãµes "Inserir Texto na PosiÃ§Ã£o do Cursor no Texto Rico" e
    // "Inserir texto na posiÃ§Ã£o do cursor no Memo".
    this.attachEvent(document, "selectionchange", this.handleSelectionChange);
    this.selectionEventSet = true;
  }
};

/**
 * Lida com a mudanÃ§a de seleÃ§Ã£o da pÃ¡gina.
 */
HTMLMemo.prototype.handleSelectionChange = function() {
  try {
    // Obter a seleÃ§Ã£o atual do elemento.
    var selection = this.getSelection();
    if (selection) {
      // Salvar a seleÃ§Ã£o atual e o seu range.
      this.lastSelection = selection;
      this.lastSelectionRange = selection.getRangeAt(0);
      if (this.lastSelectionRange) {
        this.lastSelectionRange = this.lastSelectionRange.cloneRange();
      }

      // Salvar a Ãºltima posiÃ§Ã£o do cursor.
      if (this.input) {
        // VariÃ¡vel "__cursorPos" utilizada na funÃ§Ã£o "Inserir texto na posiÃ§Ã£o do cursor no Memo"
        // herdada da versÃ£o Carbono, mantida para retrocompatibilidade.
        if (typeof this.input.selectionEnd === "number") {
          this.input.__cursorPos = this.input.selectionEnd;
        } else this.input.__cursorPos = selection.focusOffset;
      }
    }
  } catch (e) { }
};

/**
 * ObtÃ©m o range da seleÃ§Ã£o no componente.
 */
HTMLMemo.prototype.getSelection = function() {
  /**
   * Verifica se um elemento Ã© descendente de outro.
   * @param parent Elemento pai.
   * @param child Elemento filho.
   */
  var isDescendant = function(parent, child) {
    if (!child || !parent) return false;
    var node = child.parentNode;
    while (node != null) {
      if (node == parent) return true;
      node = node.parentNode;
    }

    return false;
  };

  // ObtÃ©m a seleÃ§Ã£o da pÃ¡gina.
  var selection = window.getSelection ? window.getSelection() : document.selection;

  // Verifica se o elemento com a seleÃ§Ã£o faz parte do componente.
  if (selection && selection.anchorNode && (
      (this.isRichText() && isDescendant(this.trumbowygDiv ? this.trumbowygDiv : this.div, selection.anchorNode) ||
      !this.isRichText() && ((this.input && selection.anchorNode == this.input) || (this.div && selection.anchorNode == this.div))))
      ) {

    // Retorna o range da seleÃ§Ã£o.
    return selection;
  }

  return null;
};

/**
 * Insere um conteÃºdo HTML na posiÃ§Ã£o do cursor.
 * @param html ConteÃºdo HTML a ser inserido.
 */
HTMLMemo.prototype.insertHtmlAtCaret = function(html) {
  // Verificar se possui seleÃ§Ã£o salva.
  if (this.lastSelection && this.lastSelectionRange) {
    var range = this.lastSelectionRange;
    var expandedSelRange = range.cloneRange();
    range.collapse(false);

    // Criar um elemento HTML para obter os elementos do texto HTML.
    var el = document.createElement("div");
    el.innerHTML = html;

    var frag = document.createDocumentFragment(), node, lastNode;
    while ((node = el.firstChild)) lastNode = frag.appendChild(node);
    range.insertNode(frag);

    // Atualizar a posiÃ§Ã£o da seleÃ§Ã£o.
    if (lastNode) {
      expandedSelRange.setEndAfter(lastNode);
      this.lastSelection.removeAllRanges();
      this.lastSelection.addRange(expandedSelRange);
    }

    // Atualizar valor do componente.
    if (this.trumbowygDiv) this.setValue(this.trumbowygDiv.innerHTML);
  } else {
    // SeleÃ§Ã£o nÃ£o encontrada, inserir no final.
    this.setValue(this.getValue() + html);
  }
};

HTMLMemo.prototype.keyupAction = function(e) {
  var r = this.callMethod(HTMLElementBase, "keyupAction", [e]);
  if (r && this.maxlength) {
    var value = this.getValue();
    var valueSizeLimited = this.defineTextByLength(e);
    if (value != valueSizeLimited) {
      this.setValue(valueSizeLimited);
    }
  }
};

HTMLMemo.prototype.defineTextByLength = function(e, unlimited) {
  var value = this.getValue();
  
  if(unlimited) 
    return value;
  
  if (value.length > this.maxlength)
    value = value.substring(0, this.maxlength);
  return value;
};

HTMLMemo.prototype.validateDataType = function(focus) {
  var r = this.callMethod(HTMLElementBase, "validateDataType", [focus]);
  if (r && this.maxlength) {
    if (this.getValue().length > this.maxlength) {
      interactionError(getLocaleMessage("INFO.MEMO_MAXIMUM_CHARACTERS", (this.description ? this.description : this.id), this.maxlength), focus ? (function(e) {
        e.getFocus(true);
      }) : null, focus ? [this] : null);
      return false;
    }
  }

  return r;
};

HTMLMemo.prototype.focus = function() {
  var r = this.enabled && this.visible && !this.readonly && !this.resizable && !this.draggable;
  if (this.doc) r = r && isVisibleDiv(this.doc);

  if (r) {
    // O memo, quando definido como RichText, tem um comportamento diferente para focar no componente.
    if (this.isRichText()) {
      if (this.trumbowygDiv && this.trumbowygDiv.focus)
        this.trumbowygDiv.focus();
      this.focuzed = true;
    } else if (this.input) {
      this.input.focus();
      this.focuzed = true;
    }
  }

  return r;
};

HTMLMemo.prototype.setValue = function(value, checkDependences) {
  if (this.isRichText()) this.setRichTextValue(value, checkDependences);
  else this.callMethod(HTMLElementBase, "setValue", [value, checkDependences]);
};

HTMLMemo.prototype.setRichTextValue = function(value, checkDependences) {
  if (this.trumbowyg) {
    value = normalizeRuleParam(value, true);
    this.trumbowyg.trumbowyg("html", value);
    if (this.input) this.input.value = value;
    if (this.onchange && (value != this.value)) {
      this.value = value;
      this.onchange();
    }

    this.value = normalizeRuleParam(this.getValue());
  } else {
    this.callMethod(HTMLElementBase, "setValue", [value, checkDependences]);
  }
};

HTMLMemo.prototype.getValue = function() {
  if (this.isRichText()) return this.getRichTextValue();
  else return this.input.value;
};

HTMLMemo.prototype.getRichTextValue = function() {
  if (this.trumbowyg) {
    var content = this.trumbowyg.trumbowyg("html");
    if (this.input) this.input.value = content;
    return content;
  } else return null;
};

HTMLMemo.prototype.isRichText = function() {
  return (this.richText == 1 || this.richText == 2);
};

HTMLMemo.prototype.richTextLoad = function() {
  this.input.parentElement.removeChild(this.input);
  this.designInput(this.doc, this.name, this.getValue());
};

HTMLMemo.prototype.afterInit = function() {
  this.callMethod(HTMLElementBase, "afterInit", []);
  if (!this.bgColor) this.setBGColor('#fff');
};

HTMLMemo.prototype.setBGColor = function(color) {
  this.bgColor = color;
  this.div.style.backgroundColor = color;
};
