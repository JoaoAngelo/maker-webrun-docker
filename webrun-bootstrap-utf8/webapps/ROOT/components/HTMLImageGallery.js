/**
 * Método construtor do HTMLImageGallery. Responsável por criar o componente Galeria de Imagens.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente.
 **/
function HTMLImageGallery(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.selectedImage = null;
  this.criptografado = false;
  this.skipContextMenu = false;
  this.mobile = isMobile();
}

/**
 * Herança do objeto.
 **/
HTMLImageGallery.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLImageGallery.prototype.name = 'HTMLImageGallery';
HTMLImageGallery.prototype.tabable = true;

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para habilitar/desabilitar o componente.
 */
HTMLImageGallery.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  if ((!this.enabled || this.readonly) && this.selectedImage != null) this.unselectImage();
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para ativar/desativar o modo somente leitura
 */
HTMLImageGallery.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);
  if ((!this.enabled || this.readonly) && this.selectedImage != null) this.unselectImage();
};

HTMLImageGallery.prototype.getCriptografado = function() {
  return this.criptografado ? "1" : "0";
};

HTMLImageGallery.prototype.setCriptografado = function(criptografado) {
  this.criptografado = criptografado;
};

/**
 * Obtém a div da imagem selecionada.
 **/
HTMLImageGallery.prototype.getSelectedImage = function() {
  return this.selectedImage;
};

/**
 * Obtém a ID da imagem selecionada no banco de dados.
 **/
HTMLImageGallery.prototype.getSelectedImageId = function() {
  return this.selectedImage ? this.selectedImage.serverId : "";
};

/**
 * Obtém a URL da imagem selecionada.
 **/
HTMLImageGallery.prototype.getSelectedImageUrl = function() {
  return this.selectedImage ? this.selectedImage.serverUrl : "";
};

/**
 * Responsável por desenhar o HTML do componente Galeria de Imagens. 
 * @param doc - documento onde o componente será inserido.
 **/
HTMLImageGallery.prototype.designComponent = function(doc) {
  var object = this;

  // Obter propriedades do componente e dar parse nelas.
  this.thumbWidth = (this.TamanhoMiniatura && this.TamanhoMiniatura.length && this.TamanhoMiniatura.length > 0) ? parseInt(this.TamanhoMiniatura) : 0;
  this.thumbHeight = (this.AlturaMiniatura && this.AlturaMiniatura.length && this.AlturaMiniatura.length > 0) ? parseInt(this.AlturaMiniatura) : 0;

  this.borders = (this.Bordas && this.Bordas.length && this.Bordas.toLowerCase() == "true");
  this.expandOnClick = (this.ExpandirAoClicar && this.ExpandirAoClicar.length && this.ExpandirAoClicar.toLowerCase() == "true");
  this.allowDownload = (this.PermitirDownload && this.PermitirDownload.length && this.PermitirDownload.toLowerCase() == "true");
  this.allowUpload = (this.PermitirUpload && this.PermitirUpload.length && this.PermitirUpload.toLowerCase() == "true");
  this.allowDelete = (this.PermitirExclusao && this.PermitirExclusao.length && this.PermitirExclusao.toLowerCase() == "true");

  // Definir propriedades na div principal do componente.
  this.div.className += (this.borders ? " card" : "") + " fixed-height"; // Bootstrap
  this.div.style.overflow = "visible";
  this.divClass = this.div.className;
  this.div.id = this.id ? this.id : "gallery" + this.code;

  // Criar o loader da galeria.
  this.preloader = bootstrapCreateSpinner(this.div, "text-primary", true)[0];
  this.preloader.style.zIndex = "10";
  this.preloaderClass = this.preloader.className;

  // Criar o div para colocar as imagens.
  this.contentDiv = document.createElement("div");
  this.contentDiv.className = "w-100 h-100" + (this.borders ? " p-1" : ""); // Bootstrap
  this.contentDiv.id = this.div.id + "-content";

  // Layout da barra de rolagem.
  if (this.BarraRolagem && this.BarraRolagem.length && this.BarraRolagem.length > 0) {
    switch (this.BarraRolagem) {
      case "H": { // Horizontal
        this.contentDiv.style.maxHeight = this.height + "px";
        this.contentDiv.style.whiteSpace = "nowrap";
        this.contentDiv.className = "w-auto h-100" + (this.borders ? " p-1" : ""); // Bootstrap
        this.contentDivClass = this.contentDiv.className;

        // Criar um div para o overflow horizontal.
        this.overflowDiv = document.createElement("div");
        this.overflowDiv.className = "w-100 h-100"; // Bootstrap
        this.overflowDiv.style.overflowX = "auto";
        this.overflowDiv.style.overflowY = "hidden";
        this.overflowDiv.appendChild(this.contentDiv);
        this.overflowDiv.onscroll = function() { object.unselectImage(); };
        this.div.appendChild(this.overflowDiv);
        break;
      }

      case "V": { // Vertical
        this.contentDiv.style.overflowX = "hidden";
        this.contentDiv.style.overflowY = "auto";
        this.contentDiv.onscroll = function() { object.unselectImage(); };
        this.contentDivClass = this.contentDiv.className;
        this.div.appendChild(this.contentDiv);
        break;
      }

      default: { // Desconhecido
        this.contentDiv.className += " overflow-hidden"; // Bootstrap
        this.contentDivClass = this.contentDiv.className;
        this.div.appendChild(this.contentDiv);
        break;
      }
    }
  } else {
    this.contentDiv.className += " overflow-hidden"; // Bootstrap
    this.contentDivClass = this.contentDiv.className;
    this.div.appendChild(this.contentDiv);
  }

  // Associar eventos ao div de conteúdo.
  this.contentDiv.onclick = function(e) {
    if (object.mobile && (!object.images || object.images.length == 0)) {
      object.uploadAction(e);
    }
  };

  // Criar menu dropdown da lista.
  this.dropdownMenu = document.createElement("div");
  this.dropdownMenu.className = "dropdown-menu ml-2"; // Bootstrap
  this.dropdownMenu.id = "dropdown" + this.code;
  this.dropdownMenuClass = this.dropdownMenu.className;
  document.body.appendChild(this.dropdownMenu);

  this.dropdownHeader = document.createElement("h6");
  this.dropdownHeader.className = "dropdown-header"; // Bootstrap
  this.dropdownHeader.innerHTML = getLocaleMessage("LABEL.ACTIONS");
  this.dropdownMenu.appendChild(this.dropdownHeader);

  var dropdownView = document.createElement("a");
  dropdownView.href = "#";
  dropdownView.className = "dropdown-item"; // Bootstrap
  dropdownView.innerHTML = getLocaleMessage("LABEL.GALLERY_VIEW");
  this.dropdownMenu.appendChild(dropdownView);
  this.dropdownMenu.viewButton = dropdownView;
  this.attachEvent(dropdownView, 'click', this.viewAction);

  if (this.allowDelete) {
    // Criar item de deletar imagem no dropdown.
    var dropdownDelete = document.createElement("a");
    dropdownDelete.href = "#";
    dropdownDelete.className = "dropdown-item"; // Bootstrap
    dropdownDelete.innerHTML = getLocaleMessage("LABEL.GALLERY_DELETE");
    this.dropdownMenu.appendChild(dropdownDelete);
    this.dropdownMenu.deleteButton = dropdownDelete;
    this.attachEvent(dropdownDelete, 'click', this.deleteAction);
  }

  if (this.allowDownload) {
    // Criar item de download no dropdown.
    var dropdownDownload = document.createElement("a");
    dropdownDownload.href = "#";
    dropdownDownload.className = "dropdown-item"; // Bootstrap
    dropdownDownload.innerHTML = getLocaleMessage("LABEL.GALLERY_DOWNLOAD");
    this.dropdownMenu.appendChild(dropdownDownload);
    this.dropdownMenu.downloadButton = dropdownDownload;
    this.attachEvent(dropdownDownload, 'click', this.downloadAction);
  }

  var dropdownDivider = document.createElement("div");
  dropdownDivider.className = "dropdown-divider"; // Bootstrap
  this.dropdownMenu.dropdownDivider = dropdownDivider;
  this.dropdownMenu.appendChild(dropdownDivider);

  // Criar item de atualizar galeria no dropdown.
  var dropdownRefresh = document.createElement("a");
  dropdownRefresh.href = "#";
  dropdownRefresh.className = "dropdown-item"; // Bootstrap
  dropdownRefresh.innerHTML = getLocaleMessage("LABEL.GALLERY_UPDATE");
  this.dropdownMenu.appendChild(dropdownRefresh);
  this.dropdownMenu.refreshButton = dropdownRefresh;
  this.attachEvent(dropdownRefresh, 'click', this.refreshAction);

  if (this.allowUpload) {
    // Criar item de upload no dropdown.
    var dropdownUpload = document.createElement("a");
    dropdownUpload.href = "#";
    dropdownUpload.className = "dropdown-item"; // Bootstrap
    dropdownUpload.innerHTML = getLocaleMessage("LABEL.GALLERY_UPLOAD");
    this.dropdownMenu.appendChild(dropdownUpload);
    this.dropdownMenu.uploadButton = dropdownUpload;
    this.attachEvent(dropdownUpload, 'click', this.uploadAction);
  }

  // Associar eventos a div principal.
  this.attachEvent(this.div, 'click', this.clickAction);
  this.attachEvent(this.div, 'contextmenu', this.contextMenuAction);

  // Associar eventos ao corpo da página.
  this.attachEvent(document.body, 'click', function() {
    if (object) object.closeDropdownMenu();
  });

  // Se a propriedade "Expandir Ao Clicar" estiver ativa, importar o Fancybox.
  if (this.ExpandirAoClicar && this.ExpandirAoClicar.length && this.ExpandirAoClicar.toLowerCase() == "true") {
    // Importar o CSS do Fancybox
    if (!document.getElementById("fancybox-css")) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'assets/jquery.fancybox.min.css';
      link.id = 'fancybox-css';
      head.appendChild(link);
    }

    // Importar o script do Fancybox
    webrun.include("assets/jquery.fancybox.min.js");
  }

  // Exibir preloader.
  this.showPreloader();
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para mostrar/ocultar o componente.
 */
HTMLImageGallery.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  v ? this.div.classList.remove("d-none") : this.div.classList.add("d-none")
};

/*
 * Ocorre quando algum componente que é dependência desse muda de valor
 */
HTMLImageGallery.prototype.refresh = function() {
  this.updateList();
};

/*
 * Ocorre quando o formulário termina de carregar.
 */
HTMLImageGallery.prototype.onFormLoadAction = function() {
  // Atualizar lista de imagens.
  if(!this.loaded)
    this.updateList();

  this.loaded = true;
};

/**
 * Exibe o preloader da galeria.
 **/
HTMLImageGallery.prototype.showPreloader = function() {
  if (this.contentDiv) this.contentDiv.className = "d-none"; // Bootstrap
  if (this.preloader) this.preloader.className = this.preloaderClass;
  if (this.div) this.div.className = this.divClass + " align-items-center justify-content-center" + (!this.visible ? " d-none" : ""); // Bootstrap
};

/**
 * Oculta o preloader da galeria.
 **/
HTMLImageGallery.prototype.hidePreloader = function() {
  if (this.contentDiv) this.contentDiv.className = this.contentDivClass;
  if (this.preloader) this.preloader.className = "d-none"; // Bootstrap
  if (this.div) this.div.className = this.divClass + (!this.visible ? " d-none" : "");
};

/**
 * Obtém a URL base dos pedidos da Galeria de Imagens.
 **/
HTMLImageGallery.prototype.getRequestURL = function() {
  var params = "";

  if (d.t && d.t.dependences) {
    var components = d.t.dependences[this.code];
    if (components && components.length > 0) {
      for (var code in components) {
        if (isNumeric(code)) {
          var component = eval("$mainform().d.c_" + components[code]);
          if (component) {
            params += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), "GET"));
          }
        }
      }
    }
  }

  return getAbsolutContextPath() + "componentData.do?action=componentData&sys=" + URLEncode(this.sys, 'GET') + "&formID=" + URLEncode(this.formID, 'GET') + "&comID=" + URLEncode(this.code, 'GET') + params;
};

/**
 * Atualiza a lista de imagens da galeria.
 **/
HTMLImageGallery.prototype.updateList = function() {
  var object = this;

  // Exibe o preloader.
  this.showPreloader();

  // Reseta a galeria.
  this.images = [];
  this.contentDiv.innerHTML = "";
  this.contentDiv.className = this.contentDivClass;
  this.addButton = null;

  // Fazer pedido ao servidor.
  $.post(this.getRequestURL() + "&type=l", {
  }, function(response) {
      if (response && typeof response === 'object') {
        if (response.success) {
          // Atualizar lista de imagens.
          if (response.data) object.images = response.data;

          if (object.images && object.images.length > 0) {
            for (var i = 0; i < object.images.length; i++) {
              // Não desenhar se o ID estiver nulo ou vazio.
              if (object.images[i] === null || object.images[i].length == 0) continue;

              // Desenhar o item da imagem na galeria.
              object.designItem(i, object.images[i]);
            }
          }

          // Inicializar Fancybox.
          if (object.expandOnClick) {
            $("#" + object.contentDiv.id + " a").fancybox({
              closeExisting: true,
              loop: true,
              keyboard: true,
              arrows: true,
              protect: !object.allowDownload
            });

            object.fancybox = $.fancybox.getInstance();
          }
        } else {
          var error = new HTMLMessage();
          error.showErrorMessage(null, getLocaleMessage("ERROR.OPERATION_ERROR"), null, response.details, null);
        }
      }

      object.postUpdateList();
    }).fail(function() {
      object.postUpdateList();
    });
};

/**
 * Desenha um item na galeria de imagens.
 * @param index - Índice do item.
 * @param id - Identificador da imagem.
 **/
HTMLImageGallery.prototype.designItem = function(index, id) {
  var object = this;
  var url = this.getRequestURL() + "&req=" + URLEncode(id, "GET");

  // Criar div da imagem.
  var imageDiv = document.createElement("img");
  imageDiv.className = "rounded"; // Bootstrap
  imageDiv.src = url + "&type=m"; // Miniatura
  imageDiv.alt = "";

  // Layout da miniatura.
  if (this.thumbWidth && this.thumbWidth > 0)  imageDiv.width = this.thumbWidth;
  if (this.thumbHeight && this.thumbHeight > 0) imageDiv.height = this.thumbHeight;

  // Ação de expandir.
  if (this.expandOnClick) {
    var imageLink = document.createElement("a");
    imageLink.className = "d-inline-block p-1"; // Bootstrap
    imageLink.id = this.div.id + "-image-" + index;
    imageLink.href = url;
    imageLink.setAttribute("rel", "gallery"); // Fancybox
    imageLink.setAttribute("data-fancybox", "gallery"); // Fancybox
    imageLink.style.outline = "0";
    imageLink.appendChild(imageDiv);
    this.contentDiv.appendChild(imageLink);
    imageDiv = imageLink;
  } else {
    imageDiv.className = "d-inline-block p-1"; // Bootstrap
    this.contentDiv.appendChild(imageDiv);
  }

  // Definir propriedades DOM no div.
  imageDiv.defaultClass = imageDiv.className;
  imageDiv.serverId = id;
  imageDiv.serverUrl = url;

  // Associar eventos ao div da imagem.
  if (!this.allowDownload) {
    imageDiv.ondragstart = function() {
      return false;
    };
  }

  imageDiv.onclick = function(e) {
    if (!object.enabled || (!object.skipContextMenu && !object.expandOnClick) || (!object.skipContextMenu && object.mobile)) {
      e.stopPropagation();
      e.preventDefault();
      object.skipContextMenu = false;
      if (object.enabled) object.selectImage(imageDiv, true);
      return false;
    } else {
      object.selectImage(imageDiv, false);
    }
  };

  imageDiv.oncontextmenu = function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (object.enabled) object.selectImage(imageDiv, true);
    return false;
  };
};

/**
 * Ocorre depois da atualização da lista de imagens da galeria.
 **/
HTMLImageGallery.prototype.postUpdateList = function() {
  // Esconder o preloader.
  this.hidePreloader();

  if (this.allowUpload) {
    // Criar item de adicionar nova imagem.
    this.addButton = document.createElement("a");
    this.addButton.className = (!this.images || this.images.length == 0) ? "d-none" : // Bootstrap
      "d-inline-block p-1 text-muted align-middle"; // Bootstrap
    this.addButton.style.textDecoration = "none";
    this.addButton.href = "#";
    this.contentDiv.appendChild(this.addButton);

    var addButtonInner = document.createElement("div");
    addButtonInner.className = "d-flex align-items-center justify-content-center border rounded"; // Bootstrap
    addButtonInner.style.setProperty("border-style", "dashed", "important");
    addButtonInner.style.width = this.thumbWidth + "px";
    addButtonInner.style.height = this.thumbHeight + "px";
    this.addButton.appendChild(addButtonInner);

    var addButtonIcon = document.createElement("i");
    addButtonIcon.className = "fas fa-plus"; // Font Awesome
    addButtonIcon.style.fontSize = "1.5rem";
    addButtonInner.appendChild(addButtonIcon);

    // Associar evento de clique ao botão de nova imagem.
    this.attachEvent(this.addButton, 'click', this.uploadAction);
  }

  if (!this.images || this.images.length == 0) {
    var emptyList = document.createElement("p");
    emptyList.className = "text-muted"; // Bootstrap
    emptyList.innerHTML = getLocaleMessage("LABEL.GALLERY_EMPTY");
    this.contentDiv.appendChild(emptyList);
    this.contentDiv.className = "w-100 h-100 p-4 d-flex align-items-center justify-content-center text-center"; // Bootstrap
  }
};

/**
 * Deseleciona a imagem selecionada.
 **/
HTMLImageGallery.prototype.unselectImage = function() {
  if (this.selectedImage != null) {
    this.selectedImage.className = this.selectedImage.defaultClass;
    this.selectedImage.removeAttribute("data-event", "show");
    this.selectedImage = null;
  }

  // Fechar menu dropdown.
  this.closeDropdownMenu();
};

/**
 * Seleciona uma imagem.
 * @param imageDiv - Elemento da imagem.
 * @param contextMenu - Abrir menu de contexto?
 **/
HTMLImageGallery.prototype.selectImage = function(imageDiv, contextMenu) {
  if (this.selectedImage != null && this.selectedImage != imageDiv) {
    this.unselectImage();
  }

  if (imageDiv) {
    imageDiv.className += " border rounded"; // Bootstrap
    imageDiv.setAttribute("data-event", "show");

    var lastSelectedImage = this.selectedImage;
    this.selectedImage = imageDiv;

    if (contextMenu) {
      // Abrir o menu dropdown.
      this.openDropdownMenu((this.overflowDiv) ?
        (imageDiv.offsetLeft + imageDiv.offsetWidth - this.overflowDiv.scrollLeft + this.div.offsetLeft) :
          (imageDiv.offsetLeft + imageDiv.offsetWidth + this.div.offsetLeft),
        (imageDiv.offsetTop - this.contentDiv.scrollTop + this.div.offsetTop));

      if (this.dropdownHeader) this.dropdownHeader.innerHTML = getLocaleMessage("LABEL.ACTIONS");
      if (this.dropdownMenu.viewButton) this.dropdownMenu.viewButton.className = "dropdown-item"; // Bootstrap
      if (this.dropdownMenu.deleteButton) this.dropdownMenu.deleteButton.className = "dropdown-item"; // Bootstrap
      if (this.dropdownMenu.dropdownDivider) this.dropdownMenu.dropdownDivider.className = "dropdown-divider"; // Bootstrap

      if (this.dropdownMenu.downloadButton) {
        this.dropdownMenu.downloadButton.className = "dropdown-item"; // Bootstrap
        this.dropdownMenu.downloadButton.href = imageDiv.serverUrl;
        this.dropdownMenu.downloadButton.setAttribute("download", "image.png");
      }
    }

    if (this.AoSelecionar && lastSelectedImage != this.selectedImage) {
      return this.AoSelecionar.call(this, this.getSelectedImageId());
    }
  } else this.selectedImage = null;
};

/**
 * Abre o menu dropdown.
 * @param x - Posição X para exibir o menu dropdown.
 * @param y - Posição Y para exibir o menu dropdown.
 **/
HTMLImageGallery.prototype.openDropdownMenu = function(x, y) {
  if (this.dropdownMenu) {
    this.dropdownMenu.style.top = y + "px";
    this.dropdownMenu.style.left = x + "px";
    if (this.zindex) this.dropdownMenu.style.zIndex = this.zindex + 1;
    this.dropdownMenu.className = this.dropdownMenuClass + " show";
  }
};

/**
 * Fecha o menu dropdown.
 **/
HTMLImageGallery.prototype.closeDropdownMenu = function() {
  if (this.dropdownMenu) {
    this.dropdownMenu.style = "";
    this.dropdownMenu.className = this.dropdownMenuClass;
  }
};

/**
 * Executa o evento onclick do componente.
 **/
HTMLImageGallery.prototype.click = function() {
  if (this.div.onclick) this.div.onclick.call(this);
};

/**
 * Ocorre ao clicar no elemento.
 **/
HTMLImageGallery.prototype.clickAction = function(e, o) {
  this.callMethod(HTMLElementBase, "clickAction", [e, o]);
  this.unselectImage();
};

/**
 * Ocorre ao clicar no botão de visualizar.
 **/
HTMLImageGallery.prototype.viewAction = function(e, o) {
  e.preventDefault();
  e.stopPropagation();

  if (!this.enabled) {
    this.unselectImage();
    return false;
  }

  if (this.selectedImage != null) {
    this.skipContextMenu = true;
    this.selectedImage.click();
    this.unselectImage();
  }
};

/**
 * Ocorre ao clicar no botão de download.
 **/
HTMLImageGallery.prototype.downloadAction = function(e, o) {
  if (!this.enabled) {
    e.preventDefault();
    e.stopPropagation();
    this.unselectImage();
    return false;
  }
};

/**
 * Ocorre ao clicar no botão de deletar.
 **/
HTMLImageGallery.prototype.deleteAction = function(e, o) {
  e.preventDefault();
  e.stopPropagation();
  if (!this.enabled) return false;
  if (this.selectedImage != null) {
    var object = this;
    interaction(getLocaleMessage("LABEL.GALLERY_DELETE_CONFIRM"), [], [function() {
      $.post(object.selectedImage.serverUrl + "&type=d", {
      }, function(response) {
        if (response && typeof response === 'object') {
          if (!response.success) {
            var error = new HTMLMessage();
            error.showErrorMessage(null, getLocaleMessage("LABEL.GALLERY_DELETE_ERROR"), null, response.details, null);
          }
        }

        object.unselectImage();
        object.updateList();
      }).fail(function() {
        interactionError(getLocaleMessage("LABEL.GALLERY_DELETE_ERROR"));
        object.unselectImage();
        object.updateList();
      });
    }], [], []);
  }
};

/**
 * Ocorre ao clicar no botão de atualizar lista.
 **/
HTMLImageGallery.prototype.refreshAction = function(e, o) {
  e.preventDefault();
  e.stopPropagation();
  this.unselectImage();
  if (!this.enabled) return false;
  this.updateList();
};

/**
 * Ocorre ao solicitar menu de contexto.
 **/
HTMLImageGallery.prototype.contextMenuAction = function(e, o) {
  e.preventDefault();
  e.stopPropagation();
  this.unselectImage();

  if (!this.enabled) return false;
  if (this.dropdownMenu) {
    // Exibir menu dropdown.
    this.openDropdownMenu(e.pageX, e.pageY);

    if (this.dropdownHeader) this.dropdownHeader.innerHTML = getLocaleMessage("LABEL.GALLERY");
    if (this.dropdownMenu.viewButton) this.dropdownMenu.viewButton.className = "dropdown-item d-none"; // Bootstrap
    if (this.dropdownMenu.deleteButton) this.dropdownMenu.deleteButton.className = "dropdown-item d-none"; // Bootstrap
    if (this.dropdownMenu.dropdownDivider) this.dropdownMenu.dropdownDivider.className = "dropdown-divider d-none"; // Bootstrap

    if (this.dropdownMenu.downloadButton) {
      this.dropdownMenu.downloadButton.className = "dropdown-item d-none"; // Bootstrap
      this.dropdownMenu.downloadButton.href = "#";
      this.dropdownMenu.downloadButton.removeAttribute("download");
    }
  }
};

/**
 * Ocorre ao clicar no botão de fazer upload.
 **/
HTMLImageGallery.prototype.uploadAction = function(e, o) {
  e.preventDefault();
  e.stopPropagation();

  if (!this.enabled || !this.allowUpload) return false;
  this.unselectImage();

  // Abrir a janela de upload.
  this.uploadWindow = openUpload(this.sys, this.formID, this.code, this.getCriptografado(), false, true);
};

/**
 * Ocorre ao finalizar o upload de uma imagem.
 **/
HTMLImageGallery.prototype.refresh = function(hasImage, fileName, fileMD5) {
  try {
    // Fechar a janela de upload.
    if (this.uploadWindow) {
      this.uploadWindow.close();
      this.uploadWindow = null;
    }
  } catch (e) { }

  // Atualizar lista de imagens.
  this.updateList();
};
