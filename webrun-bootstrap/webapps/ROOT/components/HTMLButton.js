/**
 * Método construtor do HTMLButton. Responsável por criar o componente Button.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param img - imagem do button.
 **/
function HTMLButton(sys, formID, code, posX, posY, width, height, description, img) {
  this.create(sys, formID, code, posX, posY, width, height, description, '');
  this.img = img ? img : "";
  this.hint = '';
  this.description = this.description.replace(/\&/g, '');
  this.remainNotDBAwareValue = false;
  this.buttonGroup = false;
}

/**
 * Herança do objeto.
 **/
HTMLButton.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLButton.prototype.name = 'HTMLButton';
HTMLButton.prototype.tabKeys = [9];
HTMLButton.prototype.tabable = true;
HTMLButton.prototype.zindex = 100000;
HTMLButton.prototype.isBinary = true;

/**
 * Seta a descrição do componente button (objeto HTMLButton).
 * @param description - descrição do componente.
 **/
HTMLButton.prototype.setDescription = function(description) {
  this.description = description;

  if(this.buttonSpan)
    this.buttonSpan.parentElement.removeChild(this.buttonSpan);

  this.buttonSpan = document.createElement("span");
  if (this.img && this.img.length > 0)
    this.buttonSpan.className = "ml-2"; // Bootstrap

  this.buttonSpan.innerHTML = this.description;
  this.button.appendChild(this.buttonSpan);
};

/**
 * Seta a cor da fonte da descrição do componente.
 * @param color - cor da fonte.
 **/
HTMLButton.prototype.setColor = function(color) {
  this.color = color;
  this.button.style.color = color;
};

/**
 * Seta a fonte da descrição do componente.
 * @param f - fonte.
 **/
HTMLButton.prototype.setFont = function(f) {
  this.button.style.fontFamily = f;
};

/**
 * Seta o tamanho da fonte da descrição do componente.
 * @param s - size.
 **/
HTMLButton.prototype.setSize = function(s) {
  if (s.indexOf("pt") == -1) s += "pt";
  this.button.style.fontSize = s;
};

/**
 * Seta a largura do button.
 * @param width - largura.
 **/
HTMLButton.prototype.setWidth = function(width) {
  width = parseInt(width);
  this.width = width;
  if (this.buttonGroup) return;
  if (this.div) this.div.style.width = width + "px";
  else if (this.button) this.button.style.width = width + "px";
  if (this.button) this.button.style.width = width + "px";
};

/**
 * Seta a altura do button.
 * @param height - altura.
 **/
HTMLButton.prototype.setHeight = function(height) {
  height = parseInt(height);
  this.height = height;
  if (this.buttonGroup) return;
  if (this.div) this.div.style.height = height + "px";
  else if (this.button) this.button.style.height = height + "px";
  if (this.button) this.button.style.height = height + "px";
};

/**
 * Seta o evento onClick do componente.
 **/
HTMLButton.prototype.setOnClick = function(evt) {
  this.onclick = evt;
  this.setEnabled(true);
};

/**
 *
 **/
HTMLButton.prototype.updateEvent = function(evt) {
  if (evt == 'click') this.setEnabled(this.enabled);
};

/**
 * Seta a propriedade ReadOnly do componente.
 * @param v - TRUE indica que o componente é somente leitura.
 **/
HTMLButton.prototype.setReadOnly = function(v) {
  this.readOnly = v;
  if (this.onclick && this.readOnly) {
    this.setEnabled(!this.readOnly);
  }
};

/**
 * Seta a propriedade Enable do componente.
 * @param v - FALSE desabilita o botão.
 **/
HTMLButton.prototype.setEnabled = function(v) {
  this.button.disabled = (!v || !this.onclick);
  this.enabled = v;

  if (this.image) {
    var img = this.image.src;
    if (!this.enabled || !this.onclick) {
      if (img.indexOf('_des.gif') == -1) this.image.src = img.replace('.gif', '_des.gif');
    } else {
      if (img.indexOf('_des.gif') != -1) this.image.src = img.replace('_des.gif', '.gif');
    }
  }
};

HTMLButton.prototype.design = function(doc, tabControl) {
  if (doc.buttonGroup === true) {
    this.doc = doc;
    this.buttonGroup = true;
    this.posX = null;
    this.posY = null;
    this.width = null;
    this.height = null;
    this.designComponent(doc, tabControl);
    this.init(tabControl);
  } else this.callMethod(HTMLElementBase, "design", [doc, tabControl]);
};

/**
 * Responsável por desenhar o HTML do componente button.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLButton.prototype.designComponent = function(doc) {
  // Definir o z-index do botão.
  if (!this.buttonGroup) this.div.style.zIndex = this.zindex;
  else this.doc.style.zIndex = this.zindex;

  // Garantir texto para foco na tabulação.
  if (!this.img && this.description.length == 0) {
    this.description = "&nbsp";
  }

  // Cria o elemento do botão.
  this.button = document.createElement("button");
  this.button.type = "button";
  this.button.className = "w-100 p-0 align-items-center btn"; // Bootstrap
  if (!this.tabable) this.button.tabIndex = "-1";

  // Verificar se o componente possui classe customizada definida
  if (this.classCss && this.classCss.trim().length > 0) {
    var classCssLowercaseTrim = this.classCss.toLowerCase().trim();
    if (classCssLowercaseTrim.startsWith("btn-") && classCssLowercaseTrim.indexOf(" ") == -1) {
      this.button.className += " " + classCssLowercaseTrim; // Bootstrap
      this.classCssDefined = true;
    }
  } else this.button.className += " btn-primary"; // Bootstrap

  // Layout do botão
  if (!this.buttonGroup) this.button.style.height = this.height + "px";

  // Definir conteúdo do botão.
  if (this.img && this.img.length > 0) {
    this.image = document.createElement("img");
    this.image.src = this.img;
    this.button.appendChild(this.image);
  }

  // Define a descrição do componente.
  if (this.description && this.description.length > 0 ) {
    let span = document.createElement("span");
    if (this.img && this.img.length > 0)
      span.className = "ml-2"; // Bootstrap
    span.innerHTML = this.description;
    span.style.whiteSpace = "pre-wrap";
    this.button.appendChild(span);
    this.buttonSpan = span;
  } else if (!this.img || this.img.length == 0) {
    this.button.innerHTML = "&nbsp;";
  }

  // Adiciona o botão à página.
  if (!this.buttonGroup) {
    this.div.appendChild(this.button);
  } else {
    this.div = this.button;
    this.doc.appendChild(this.button); // Button Group
  }

  // Associar evento de clique ao botão.
  this.clickArea = this.button;
  this.attachEvent(this.button, 'click', this.clickAction);

  this.input = this.clickArea;
  this.onfocus2 = this.onfocus;
  this.onblur2 = this.onblur;
  this.onfocus = this.buttonFocus;
  this.onblur = this.buttonBlur;

  // Verifica se o botão possui um pai e se o mesmo é o componente grade.
  // Caso as condicionais sejam verdadeiras, define que a tecla enter funcionará como tabulação.
  if (this.parent && isTypeOf(this.parent, "HTMLGrid")) {
    this.tabKeys.push(13);
  }
  this.setEnabled(this.enabled);
};

/**
 * Evento onfocus herdado.
 **/
HTMLButton.prototype.focus = function() {
  var r = this.enabled && !this.button.disabled && this.visible && !this.readonly && !this.resizable && !this.draggable;
  if (this.doc) r = r && isVisibleDiv(this.doc);
  if (r && this.clickArea) this.clickArea.focus();
  if (this.button.disabled) this.enabled = false;
  else this.enabled = true;
  return r;
};

/**
 * Evento onblur herdado.
 **/
HTMLButton.prototype.blur = function() {
  var r = this.enabled && this.visible && !this.readonly;
  if (r && this.clickArea) this.clickArea.blur();
  return r;
};

/**
 * Executa o evento onclick do componente.
 **/
HTMLButton.prototype.click = function() {
  if (this.button.onclick) this.button.onclick.call(this);
};

HTMLButton.prototype.finalizeAction = function(filename) {
  if (this.onfinalize) this.onfinalize.call(this, filename);
};

HTMLButton.prototype.refresh = function(arg, filename) {
  if (filename) this.finalizeAction(filename);
  else this.callMethod(HTMLElementBase, 'refresh');
};

HTMLButton.prototype.createUploadAction = function() {
  this.setOnClick(this.getAction(this.openUpload));
};

/**
 * Chama Upload.jsp para realizar Upload de arquivos.
 **/
HTMLButton.prototype.openUpload = function() {
  var w = 250;
  var h = 50;
  var left = (screen.width - w) / 2;
  var top = (screen.height - h) / 2;
  MM_openBrWindow('upload' + PAGES_EXTENSION + '?sys=' + this.sys + '&formID=' + this.formID + '&comID=' + this.code + '&type=R', 'UPLOAD' + this.formID + this.code, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
};

HTMLButton.prototype.getGridShowValue = function(grid, row, column, oldContent, newDataArray) {
  return newDataArray[column];
};

HTMLButton.prototype.clickAction = function(e, o) {
  this.focus();
  this.callMethod(HTMLElementBase, "clickAction", [e, o]);
};

/**
 * Seta a propriedade Src da Imagem do botão.
 * @param img
 */
HTMLButton.prototype.setImage = function(img) {
  this.img = img;

  if (this.img && this.img.length > 0) {
    if (this.image) {
      this.image.src = this.img;
    } else {
      this.image = document.createElement("img");
      this.image.src = this.img;
      this.button.appendChild(this.image);
    }
  } else if (this.image) {
    this.button.removeChild(this.image);
    this.image = null;
  }
};

/**
 * Seta a propriedade Hint do HTMLButton.
 * @param hint - valor da propriedade 'Dica' do componente no MAKER.
 **/
HTMLButton.prototype.setHint = function(hint) {
  this.callMethod(HTMLElementBase, "setHint", [hint]);

  if (this.button) {
    let init = this.button.hint ? false : true;
    if (this.button.getAttribute("data-original-title")) {
      this.button.setAttribute("data-original-title", hint.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    } else {
      this.button.hint = hint;
      this.button.alt = hint;
      this.button.title = hint.replace(/(?:\r\n|\r|\n)/g, '<br />');
      this.button.setAttribute("data-toggle", "tooltip"); //Bootstrap
      this.button.setAttribute("data-html", "true"); //Bootstrap
      if (init) bootstrapInitTooltip(this.button);
    }
  }
};

HTMLButton.prototype.keydownAction = function(e) {
  if (this.enabled && this.visible && !this.readonly) {
    var r = true;
    if (this.parent && isTypeOf(this.parent, 'HTMLGrid')) {
      if (this.tabKeys.indexOf(13) == -1) {
        this.tabKeys.push(13);
      }
    }

    r = checkKey(e, this, this.tabKeys);
    if (this.onkeydown) r = this.onkeydown(e);
    return r;
  } else return true;
};