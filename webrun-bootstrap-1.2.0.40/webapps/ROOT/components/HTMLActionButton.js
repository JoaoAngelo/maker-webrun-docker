/**
 * Método construtor do HTMLActionButton. Responsável por criar o componente Ação.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente.
 **/
function HTMLActionButton(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.mouseOver = false;
}

/**
 * Herança do objeto.
 **/
HTMLActionButton.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLActionButton.prototype.name = 'HTMLActionButton';
HTMLActionButton.prototype.tabable = true;

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para habilitar/desabilitar o componente.
 */
HTMLActionButton.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);

  // Alterar o estilo do cursor.
  if (this.div) this.div.style.cursor = this.enabled ? "pointer" : "default";

  // Definir a opacidade da imagem.
  if (this.img) this.img.style.opacity = this.enabled ? "1" : "0.5";

  // Atualizar a imagem.
  this.updateImage();
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para mostrar/ocultar o componente.
 */
HTMLActionButton.prototype.setVisible = function(v) {
  this.visible = parseBoolean(v);
  if (this.visible) {
    this.div.classList.remove("d-none"); // Bootstrap
    this.div.classList.add("d-inline-flex"); // Bootstrap
  } else {
    this.div.classList.remove("d-inline-flex"); // Bootstrap
    this.div.classList.add("d-none"); // Bootstrap
  }
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Altura do componente.
 */
HTMLActionButton.prototype.setHeight = function(height) {
  this.callMethod(HTMLElementBase, "setHeight", [height]);
  if (this.ImageViewMode != "1") this.img.style.maxHeight = this.div.style.height;
};

/**
 * Responsável por desenhar o HTML do componente button.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLActionButton.prototype.designComponent = function(doc) {
  this.div.className = "form-action d-inline-flex align-items-center justify-content-center ml-1 mr-1"; // Bootstrap
  this.divClass = this.div.className;

  if (this.beforeComponentDesign) {
    this.beforeComponentDesign(doc);
  }

  // Criar elemento imagem.
  this.img = document.createElement("img");
  this.img.alt = "";

  if (this.ImageViewMode != "1") {
    this.img.className = "img-fluid"; // Bootstrap
    this.img.style.maxHeight = this.div.style.height;
  }

  this.div.appendChild(this.img);

  if (this.Image && this.Image.length > 0) {
    this.img.src = this.getImageSourceURL(this.Image);
  } else if (this.URLImage && this.URLImage.length > 0) {
    this.img.src = this.URLImage;
  }

  // Definir propriedades.
  if (this.hint) this.setHint(this.hint);
  this.setEnabled(this.enabled);

  // Associar eventos ao botão.
  this.attachEvent(this.div, 'click', this.clickAction);
  this.attachEvent(this.div, 'mousedown', this.mouseDownAction);
  this.attachEvent(this.div, 'mouseup', this.mouseUpAction);
  this.attachEvent(this.div, 'mouseenter', this.mouseEnterAction);
  this.attachEvent(this.div, 'mouseleave', this.mouseLeaveAction);

  // Tornar componente acessível.
  if (this.Acessivel == 1 || this.Acessivel == '1') {
    this.zindex = 1000000;
    this.div.style.zIndex = this.zindex;
  }

  if (this.afterComponentDesign) {
    this.afterComponentDesign(doc);
  }
};

/**
 * Executa o evento onclick do componente.
 **/
HTMLActionButton.prototype.click = function() {
  if (!this.enabled) return false;
  if (this.div.onclick) return this.div.onclick.call(this);
};

HTMLActionButton.prototype.mouseDownAction = function(e, o) {
  if (!this.enabled) return false;
  this.mouseDown = true;
  this.updateImage();
};

HTMLActionButton.prototype.mouseUpAction = function(e, o) {
  this.mouseDown = false;
  this.updateImage();
};

/**
 * Ocorre ao clicar no elemento.
 **/
HTMLActionButton.prototype.clickAction = function(e, o) {
  if (!this.enabled) return false;
  if (this.callMethod(HTMLElementBase, "clickAction", [e, o]) === false) return false;

  // Verificar se uma ação foi definida.
  if (this.AcoesPreDefinida && this.AcoesPreDefinida.length && this.AcoesPreDefinida.length > 0) {
    // Executar a ação.
    ebfActionExecute(this.AcoesPreDefinida);
  }
};

/**
 * Ocorre quando o cursor entra do elemento.
 **/
HTMLActionButton.prototype.mouseEnterAction = function(e, o) {
  if (!this.enabled) return false;
  this.mouseOver = true;
  this.updateImage();
};

/**
 * Ocorre quando o cursor sai do elemento.
 **/
HTMLActionButton.prototype.mouseLeaveAction = function(e, o) {
  this.mouseOver = false;
  this.updateImage();
};

/**
 * Define as imagens do botão.
 * @param img - GUID da imagem normal.
 * @param imgOver - GUID da imagem quando o mouse está em cima do componente.
 * @param imgOnClick - GUID da imagem quando o botão é pressionado.
 * @param imgURL - URL da imagem normal.
 * @param imgOverURL - URL da imagem quando o mouse está em cima do componente.
 * @param imgOnClickURL - URL da imagem quando o botão é pressionado.
 */
HTMLActionButton.prototype.setImages = function(img, imgOver, imgOnClick, imgURL, imgOverURL, imgOnClickURL) {
  this.Image = img;
  this.ImageMouseOver = imgOver;
  this.ImageOnClick = imgOnClick;
  this.URLImage = imgURL;
  this.URLImageMouseOver = imgOverURL;
  this.URLImageOnClick = imgOnClickURL;
  this.updateImage();
};

/**
 * Atualiza a exibição da imagem do componente.
 **/
HTMLActionButton.prototype.updateImage = function() {
  if (this.img) {
    if (this.mouseDown) {
      if (this.ImageOnClick || this.URLImageOnClick) {
        if (this.ImageOnClick && this.ImageOnClick.length > 0) {
          this.img.src = this.getImageSourceURL(this.ImageOnClick);
        } else {
          this.img.src = this.URLImageOnClick;
        }
      }
    } else if (this.mouseOver) {
      if (this.ImageMouseOver || this.URLImageMouseOver) {
        if (this.ImageMouseOver && this.ImageMouseOver.length > 0) {
          this.img.src = this.getImageSourceURL(this.ImageMouseOver);
        } else {
          this.img.src = this.URLImageMouseOver;
        }
      }
    } else {
      if (this.Image || this.URLImage) {
        if (this.Image && this.Image.length > 0) {
          this.img.src = this.getImageSourceURL(this.Image);
        } else {
          this.img.src = this.URLImage;
        }
      } else {
        this.img.src = "";
      }
    }
  }
};

/**
 * Seta a propriedade Hint do HTMLActionButton.
 * @param hint - valor da propriedade 'Dica' do componente no MAKER.
 **/
HTMLActionButton.prototype.setHint = function(hint) {
  this.hint = hint;
  if (this.img) {
    this.img.title = hint;
    this.img.setAttribute("data-toggle", "tooltip"); // Bootstrap
  }
};

/**
 * Substituir o modo de edição de permissões do HTMLElementBase.
 * O componente ação deve ter sua ação mantida quando em modo gerente,
 * mas ao mesmo tempo possibilitar a edição de permissões.
 **/
HTMLActionButton.prototype.toPermissionMode = function() {
  this.callMethod(HTMLElementBase, "toPermissionMode", []);
  this.divPermission.className = "d-none"; // Bootstrap

  // Criar o botão de editar permissões.
  this.editPermissionsButton = document.createElement("button");
  this.editPermissionsButton.type = "button";
  this.editPermissionsButton.className = "btn btn-secondary d-flex align-items-center justify-content-center p-1 position-absolute"; // Bootstrap
  this.editPermissionsButton.style.bottom = "0px";
  this.editPermissionsButton.style.right = "0px";
  this.editPermissionsButton.zIndex = "10";
  this.editPermissionsButton.setAttribute("data-toggle", "popover");
  this.editPermissionsButton.setAttribute("title", this.name);
  this.editPermissionsButton.setAttribute("data-content", this.divPermission.getAttribute("data-content"));
  this.div.appendChild(this.editPermissionsButton);

  var editPermissionsButtonIcon = document.createElement("i");
  editPermissionsButtonIcon.className = "fas fa-key"; // Font Awesome
  editPermissionsButtonIcon.style.fontSize = "0.7rem";
  this.editPermissionsButton.appendChild(editPermissionsButtonIcon);

  // Inicializar o popover do Bootstrap.
  $(this.editPermissionsButton).popover({
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body p-0"></div></div>',
    html: true,
    trigger: "hover",
    delay: 200
  });

  // Associar evento de clique ao botão de editar permissões.
  this.editPermissionsButton.onclick = function(e) { e.stopPropagation(); };
  this.attachEvent(this.editPermissionsButton, 'click', this.permissionClick);
};
