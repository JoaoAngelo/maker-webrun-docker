function HTMLImage(sys, formID, code, posX, posY, width, height, description, value, type, criptografado, magnifier) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.report = false;
  this.viewMode = "Estender";
  this.type = type ? parseInt(type) : 1; // Type = 1 (Upload) / Type = 2 (Digital Capture) / Type = 3 (URL)
  this.criptografado = criptografado;
  this.url = value ? value.trim().replace("{", "%7b").replace("}", "%7d") : "";
  this.urlIsBase64 = false;
  this.hasImage = (this.url && this.url.length > 0 && this.url != "null");
  this.magnifier = magnifier;
  this.shouldHideMagnifier = false;
  this.isMagnifierVisible = false;
  this.staticImage = false;
  this.hovered = false;

  this.footerVisible = true;
  this.noImageVisible = false;
  this.imgVisible = true;
}

HTMLImage.inherits(HTMLElementBase);
HTMLImage.prototype.name = 'HTMLImage';
HTMLImage.prototype.tabable = false;
HTMLImage.prototype.isBinary = true;

/**
 * Sobrescreve o mÃ©todo do HTMLElementBase devido a sua estruturaÃ§Ã£o.
 * @param v Valor lÃ³gico para habilitar/desabilitar o componente.
 */
HTMLImage.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  this.updateLayout();
};

/**
 * Sobrescreve o mÃ©todo do HTMLElementBase devido a sua estruturaÃ§Ã£o.
 * @param v Valor lÃ³gico para mostrar/ocultar o componente.
 */
HTMLImage.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  this.updateLayout();
};

/**
 * Sobrescreve o mÃ©todo do HTMLElementBase devido a sua estruturaÃ§Ã£o.
 * @param v Valor lÃ³gico para ativar/desativar o modo somente leitura
 */
HTMLImage.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);
  this.updateLayout();
};

HTMLImage.prototype.getGridShowValue = function(grid, row, column, oldContent, newDataArray) {
  var componentProperties;
  var gridCode;

  if (newDataArray[column] != '' && newDataArray[column] != '&nbsp;') {
    componentProperties = {
      enabled: this.enabled,
      readonly: this.readonly,
      hint: this.hint
    };

    gridCode = 0;
    if (isTypeOf(grid, "HTMLGrid")) gridCode = grid.getCode();
    return gridImage(this.url, this.width, this.height, componentProperties, gridCode);
  } else return "";
};

HTMLImage.prototype.setValue = function(value, checkDependences) {
  this.callMethod(HTMLElementBase, "setValue", [value, checkDependences]);
  this.setImage(value.trim().replace("{", "%7b").replace("}", "%7d"), false);
};

HTMLImage.prototype.hasEmptyValue = function() {
  return isNullable(this.md5);
};

HTMLImage.prototype.setDescription = function(v) {
  var table;
  if (this.img) {
    if (!this.divText) {
      if (v && v.length > 0) {
        this.divText = this.getDiv('', 0, 0, this.width, this.height, 6, true);
        this.divText.style.cursor = 'pointer';

        table = getTable(1, 1, '100%', '100%');
        this.label = getLabel(v, true);
        table[CELLS][0][0].setAttribute('align', 'center');
        table[CELLS][0][0].setAttribute('valign', 'middle');
        table[CELLS][0][0].appendChild(this.label);
        this.divText.appendChild(table[TABLE]);

        this.context.appendChild(this.divText);

        this.label.onmousedown = function() { return false; };
        this.label.onselectstart = function() { return false; };

        this.attachEvent(this.divText, 'click', this.doOnClick);
        this.attachEvent(this.divText, 'mouseover', this.mouseOverAction);
        this.attachEvent(this.divText, 'mouseout', this.mouseOutAction);
      }
    } else {
      if (v && v.length > 0) {
        this.label.innerHTML = v;
      } else {
        this.context.removeChild(this.divText);
        this.divText = null;
        this.label = null;
      }
    }
  }
};

HTMLImage.prototype.designComponent = function() {
  // VariÃ¡vel usada em eventos.
  var object = this;

  // Testa se Ã© relatÃ³rio
  if (this.report) this.enabled = false;

  // Criar o div que Ã© exibido quando nÃ£o tiver nenhuma imagem.
  this.noImage = document.createElement("div");
  this.noImageClass = "w-100 h-100 flex-fill text-muted align-items-center justify-content-center"; // Bootstrap
  this.noImage.className = this.noImageClass;
  this.context.appendChild(this.noImage);

  // Criar o texto do div de sem imagem.
  var noImageDesc = document.createElement("span");
  noImageDesc.innerHTML = (this.type == 1) ?
    this.decorateRequired("(" + getLocaleMessage("LABEL.IMAGE") + ")", this.required) :
    this.decorateRequired("(" + getLocaleMessage("LABEL.DIGITAL_PRINTING") + ")", this.required);
  this.noImage.appendChild(noImageDesc);

  // Recriar div para ajustar layout.
  this.context = this.getBaseDiv(false);
  this.contextClass = "w-100 mw-100 mh-100 overflow-hidden d-flex align-items-center justify-content-center"; // Bootstrap
  this.context.className = this.contextClass;
  this.context.style.height = this.height + "px";
  this.div.appendChild(this.context);

  // Criar o elemento da imagem.
  if (this.getViewMode() == "stretch") {
    this.img = document.createElement("img");
    this.imgClass = "border-0 outline-0 overflow-hidden img-fluid"; // Bootstrap
  } else {
    // Criar o elemento imagem.
    this.img = document.createElement("div");
    this.img.style.height = this.height + "px";
    this.imgClass = "w-100 overflow-hidden"; // Bootstrap
  }

  // Atribuir a classe do elemento imagem.
  this.img.className = this.imgClass;

  // Layout do elemento da imagem.
  this.img.style.width = this.width + "px";

  // Adicionar a imagem ao elemento.
  this.context.appendChild(this.img);

  // Verificar se a imagem deve ter lente de aumento (magnifier).
  if (this.magnifier) {
    // Definir o nÃ­vel de zoom
    this.zoomLevel = 2;
    this.zoomType = 0;

    // Cria div que para exibir o zoom.
    this.magnifierDiv = document.createElement("div");

    // Quando o usuÃ¡rio definiu o tamanho da Ã¡rea do zoom,
    // o magnifier deve estar do lado externo do HTMLImage.
    //
    // Quando o usuÃ¡rio nÃ£o definiu o tamanho da Ã¡rea do zoom,
    // o magnifier deve estar dentro do HTMLImage e o tamanho dele
    // Ã© calculado automaticamente.
    if (this.zoomWidth > 0 && this.zoomHeight > 0) {
      // O magnifier deverÃ¡ ficar fora do HTMLImage.
      this.magnifierDiv.className = "imagebox-magnifier pointer";
      this.context.appendChild(this.magnifierDiv);
      this.zoomType = 1;

      this.magnifierOutsideDiv = document.createElement("div");
      this.magnifierOutsideDiv.className = "imagebox-magnifier outside";
      this.magnifierOutsideDiv.style.width = this.zoomWidth + "px";
      this.magnifierOutsideDiv.style.height = this.zoomHeight + "px";
      this.doc.appendChild(this.magnifierOutsideDiv);
    } else {
      // O magnifier deverÃ¡ ficar dentro do HTMLImage.
      this.magnifierDiv.className = "imagebox-magnifier inside bg-light";
      this.doc.appendChild(this.magnifierDiv);
      this.zoomType = 0;
    }

    /**
     * Atualiza o magnifier.
     */
    var updateMagnifierAction = function(e) {
      if (object.hasImage && object.url && object.url.length > 0 && object.url != "null") {
        object.updateMagnifier(e);
      }
    };

    // Adicionar eventos ao div do HTMLImage.
    this.div.addEventListener("mouseover", function() {
      object.mouseOver = true;
      object.showMagnifier();
    }, false);

    this.div.addEventListener("mouseout", function() {
      object.mouseOver = false;
      object.hideMagnifier();
    }, false);

    this.div.addEventListener("mousemove", updateMagnifierAction, false);
    this.div.addEventListener("touchmove", updateMagnifierAction, false);

    // Evento para aumentar o nÃ­vel de zoom do magnifier (roda do mouse).
    this.div.addEventListener("wheel", function(e) {
      if (object.isMagnifierVisible && object.zoomType == 0) {
        e = window.event || e;
        var delta = -Math.sign(e.deltaY);

        // Alternar o nÃ­vel de zoom
        object.zoomLevel += delta;
        if (object.zoomLevel < 2) object.zoomLevel = 2;
        else if (object.zoomLevel > 6) object.zoomLevel = 6;

        // Atualizar o magnifier
        object.updateMagnifier(e);
      }
    }, false);

    // Evento que ocorre depois de carregar a imagem.
    if (this.getViewMode() == "stretch") {
      this.img.addEventListener("load", function() {
        object.imgRealWidth = object.img.naturalWidth;
        object.imgRealHeight = object.img.naturalHeight;

        // Atualizar o magnifier
        object.updateMagnifier();
      }, false);
    }
  }

  if (this.canUpload()) {
    // Criar o elemento do footer.
    this.footerDiv = document.createElement("div");
    this.footerDivClass = "card-footer bg-light flex-row flex-wrap align-items-center justify-content-center text-center p-2 w-100"; // Bootstrap
    this.footerDiv.className = this.footerDivClass;
    this.footerDiv.style.bottom = "0px";
    this.footerDiv.style.left = "0px";
    this.footerDiv.style.right = "0px";
    this.footerDiv.style.zIndex = "100";
    this.div.appendChild(this.footerDiv);

    // AtÃ© entÃ£o nÃ£o tem nenhum tooltip nesse elemento.
    this.haveTooltips = false;

    // Criar o botÃ£o de upload.
    this.divUpload = document.createElement("div");
    this.divUpload.name = "WFRUpload";
    this.divUpload.id = "imageboxButtonUpload" + this.code;
    this.divUpload.className = "generic-btn flex-fill"; // Custom - Bootstrap

    // Criar o Ã­cone do botÃ£o de upload.
    this.divUploadIcon = document.createElement("i");
    this.divUploadIcon.className = "fas fa-upload"; // Font Awesome
    this.divUploadIcon.style.fontSize = "1.25rem";

    // Obter a descriÃ§Ã£o do botÃ£o de upload e definir no botÃ£o.
    var uploadDescription = getLocaleMessage("LABEL.UPLOAD");
    if (uploadDescription) {
      this.divUploadIcon.alt = uploadDescription;
      this.divUpload.title = uploadDescription;
      this.divUpload.setAttribute("data-toggle", "tooltip"); // Bootstrap
      this.divUpload.setAttribute("data-placement", "right"); // Bootstrap
      this.haveTooltips = true;
    }

    // Eventos do botÃ£o de upload.
    this.attachEvent(this.divUpload, "touchstart", this.uploadClickAction);
    this.attachEvent(this.divUpload, "click", this.uploadClickAction);

    // Adicionar o botÃ£o de webcam ao elemento.
    this.divUpload.appendChild(this.divUploadIcon);
    this.footerDiv.appendChild(this.divUpload);

    // Criar o botÃ£o de webcam.
    this.divWebcam = document.createElement("div");
    this.divWebcam.name = "WFRWebcam";
    this.divWebcam.id = "imageboxButtonWebcam" + this.code;
    this.divWebcam.className = "generic-btn flex-fill"; // Custom - Bootstrap

    // Criar o Ã­cone do botÃ£o de webcam.
    this.divWebcamIcon = document.createElement("i");
    this.divWebcamIcon.className = "fas fa-camera"; // Font Awesome
    this.divWebcamIcon.style.fontSize = "1.25rem";

    // Obter a descriÃ§Ã£o do botÃ£o de webcam e definir no botÃ£o.
    var webcamDescription = getLocaleMessage("LABEL.WEBCAM");
    if (webcamDescription) {
      this.divWebcam.title = webcamDescription;
      this.divWebcam.setAttribute("data-toggle", "tooltip"); // Bootstrap
      this.divWebcam.setAttribute("data-placement", "right"); // Bootstrap
      this.haveTooltips = true;
    }

    // Eventos do botÃ£o de webcam.
    this.attachEvent(this.divWebcam, "touchstart", this.captureClickAction);
    this.attachEvent(this.divWebcam, "click", this.captureClickAction);

    // Adicionar o botÃ£o de webcam ao elemento.
    this.divWebcam.appendChild(this.divWebcamIcon);
    this.footerDiv.appendChild(this.divWebcam);


    // Criar o botÃ£o de zoom.
    this.divZoom = document.createElement("div");
    this.divZoom.name = "WFRZoom";
    this.divZoom.id = "imageboxButtonZoom" + this.code;
    this.divZoom.className = "generic-btn flex-fill"; // Custom

    // Criar o Ã­cone do botÃ£o de zoom.
    this.divZoomIcon = document.createElement("i");
    this.divZoomIcon.className = "fas fa-expand"; // Font Awesome
    this.divZoomIcon.style.fontSize = "1.25rem";

    // Obter a descriÃ§Ã£o do botÃ£o de zoom e definir no botÃ£o.
    var zoomDescription = getLocaleMessage("LABEL.ZOOM_IMAGE");
    if (zoomDescription) {
      this.divZoomIcon.alt = zoomDescription;
      this.divZoom.title = zoomDescription;
      this.divZoom.setAttribute("data-toggle", "tooltip"); // Bootstrap Tooltip
      this.divZoom.setAttribute("data-placement", "right"); // Bootstrap Tooltip
      this.haveTooltips = true;
    }

    // Associar evento de clique ao botÃ£o de zoom.
    this.attachEvent(this.divZoom, "touchstart", this.zoomClickAction);
    this.attachEvent(this.divZoom, "click", this.zoomClickAction);

    // Adicionar o botÃ£o de zoom ao elemento
    this.divZoom.appendChild(this.divZoomIcon);
    this.footerDiv.appendChild(this.divZoom);
  }

  // Associar eventos aos elementos do componente
  this.attachEvent(this.div, "touchstart", this.clickAction);
  this.attachEvent(this.div, "touchend", this.touchEndAction);
  this.attachEvent(this.div, "mouseenter", this.mouseEnterAction);
  this.attachEvent(this.div, "mouseleave", this.mouseLeaveAction);
  this.attachEvent(this.noImage, "click", this.clickAction);
  this.attachEvent(this.div, "click", this.clickAction);

  this.attachEvent(this.img, "touchstart", this.clickAction);
  this.attachEvent(this.img, "touchend", this.touchEndAction);
  this.attachEvent(this.img, "click", this.clickAction);

  // Definir a classe da div principal.
  this.divClass = "form-group fixed-height card text-center align-items-center"; // Bootstrap
  this.div.className = this.divClass;

  // Definir imagem do componente.
  this.setImage(this.hasImage ? this.url : null, this.urlIsBase64);
};

/**
 * Atualiza o layout do magnifier.
 */
HTMLImage.prototype.updateMagnifier = function(e) {
  var imgWidth = (this.img.offsetWidth > 0) ? this.img.offsetWidth : this.width;
  var imgHeight = (this.img.offsetHeight > 0) ? this.img.offsetHeight : this.height;

  var imgNatWidth = (this.imgRealWidth !== undefined && this.imgRealWidth > 0) ? this.imgRealWidth : imgWidth;
  var imgNatHeight = (this.imgRealHeight !== undefined && this.imgRealHeight > 0) ? this.imgRealHeight : imgHeight;

  if (this.getViewMode() == "stretch") {
    imgNatWidth = imgWidth;
    imgNatHeight = imgHeight;
  }

  var divPosX = this.div.offsetLeft;
  var divWidth = this.div.offsetWidth;
  var divPosY = this.div.offsetTop;

  switch (this.zoomType) {
    case 0: // Magnifier dentro do HTMLImage
      // Calcular o tamanho do magnifier (32%).
      var dimensionPercentage = Math.ceil(Math.max(imgWidth, imgHeight) * 0.32);

      // Atualizar o layout do magnifier.
      this.magnifierDiv.style.width = dimensionPercentage + "px";
      this.magnifierDiv.style.height = dimensionPercentage + "px";

      this.magnifierDiv.middleX = dimensionPercentage / 2;
      this.magnifierDiv.middleY = dimensionPercentage / 2;

      // Atualizar o tamanho da imagem no magnifier.
      this.magnifierDiv.style.backgroundSize =
        Math.ceil(imgNatWidth * this.zoomLevel) + "px " +
        Math.ceil(imgNatHeight * this.zoomLevel) + "px";

      break;
    case 1: // Magnifier fora do HTMLImage
      // Calcular o tamanho do ponteiro do magnifier.
      var magWidth = Math.max(imgWidth / 6, Math.min(imgWidth,
        ((imgWidth * this.zoomWidth) / imgNatWidth) / this.zoomLevel));
      var magHeight = Math.max(imgHeight / 6, Math.min(imgHeight,
        ((imgHeight * this.zoomHeight) / imgNatHeight) / this.zoomLevel));

      // Atualizar o layout do ponteiro do magnifier.
      this.magnifierDiv.style.width = Math.ceil(magWidth) + "px";
      this.magnifierDiv.style.height = Math.ceil(magHeight) + "px";

      this.magnifierDiv.middleX = magWidth / 2;
      this.magnifierDiv.middleY = magHeight / 2;

      // Atualizar o tamanho da imagem no magnifier.
      this.magnifierOutsideDiv.style.backgroundSize =
        Math.ceil(imgNatWidth * (this.zoomWidth / magWidth)) + "px " +
        Math.ceil(imgNatHeight * (this.zoomHeight / magHeight)) + "px";

      // Calcular a posiÃ§Ã£o do magnifier de fora.
      this.magnifierOutsideDiv.style.left = "calc(" + (divPosX + divWidth) + "px + 0.5rem)";
      this.magnifierOutsideDiv.style.top = (divPosY - 3) + "px";

      break;
  }

  // Atualizar a posiÃ§Ã£o do magnifier.
  this.moveMagnifier(e);
};

/**
 * Atualiza a posiÃ§Ã£o do magnifier.
 */
HTMLImage.prototype.moveMagnifier = function(e) {
  if (e) e.preventDefault();
  var event = e || window.event;

  if (event) {
    // Calcular a posiÃ§Ã£o do mouse em relaÃ§Ã£o Ã  imagem.
    var a = this.img.getBoundingClientRect();
    var x = (event.touches && event.touches.length > 0 ? event.touches[0].pageX : event.pageX) - a.left + this.img.offsetLeft - window.pageXOffset;
    var y = (event.touches && event.touches.length > 0 ? event.touches[0].pageY : event.pageY) - a.top + this.img.offsetTop - window.pageYOffset;

    // Obter o tamanho a imagem em tela e o tamanho real da imagem.
    var imgWidth = (this.img.offsetWidth > 0) ? this.img.offsetWidth : this.width;
    var imgHeight = (this.img.offsetHeight > 0) ? this.img.offsetHeight : this.height;

    var imgNatWidth = (this.imgRealWidth !== undefined && this.imgRealWidth > 0) ? this.imgRealWidth : imgWidth;
    var imgNatHeight = (this.imgRealHeight !== undefined && this.imgRealHeight > 0) ? this.imgRealHeight : imgHeight;

    if (this.getViewMode() == "stretch") {
      imgNatWidth = imgWidth;
      imgNatHeight = imgHeight;
    }

    var divPosX = this.div.offsetLeft;
    var divPosY = this.div.offsetTop;

    var imgOffsetX = 0;
    var imgOffsetY = 0;

    // Calcular o offset da imagem a depender do seu modo de visualizaÃ§Ã£o.
    if (this.viewMode && this.viewMode.toLowerCase() == "centralizado") {
      imgOffsetX = this.context.offsetWidth - imgWidth;
      imgOffsetY = this.context.offsetHeight - imgHeight;

      imgOffsetX += (imgNatWidth / 2) - (imgWidth / 2);
      imgOffsetY += (imgNatHeight / 2) - (imgHeight / 2);
    }

    // Atualizar o layout do ponteiro do magnifier
    this.magnifierDiv.middleX = this.magnifierDiv.offsetWidth / 2;
    this.magnifierDiv.middleY = this.magnifierDiv.offsetHeight / 2;

    if (this.zoomType == 0) { // Magnifier dentro do HTMLImage
      // NÃ£o permitir que o ponteiro do magnifier ultrapasse a Ã¡rea da imagem.
      if (x > imgWidth + (this.magnifierDiv.middleX / this.zoomLevel) + this.img.offsetLeft) {
        x = imgWidth + (this.magnifierDiv.middleX / this.zoomLevel) + this.img.offsetLeft;
      } else if (x < -(this.magnifierDiv.middleX / this.zoomLevel) + this.img.offsetLeft) {
        x = -(this.magnifierDiv.middleX / this.zoomLevel) + this.img.offsetLeft;
      }

      if (y > imgHeight + (this.magnifierDiv.middleY / this.zoomLevel) + this.img.offsetTop) {
        y = imgHeight + (this.magnifierDiv.middleY / this.zoomLevel) + this.img.offsetTop;
      } else if (y < -(this.magnifierDiv.middleY / this.zoomLevel) + this.img.offsetTop) {
        y = -(this.magnifierDiv.middleY / this.zoomLevel) + this.img.offsetTop;
      }

      x -= this.magnifierDiv.middleX;
      y -= this.magnifierDiv.middleY;

      // Atualizar a posiÃ§Ã£o do magnifier.
      this.magnifierDiv.style.left = (divPosX + x) + "px";
      this.magnifierDiv.style.top = (divPosY + y) + "px";

      x += this.magnifierDiv.middleX / 2;
      y += this.magnifierDiv.middleY / 2;

      // Atualizar a posiÃ§Ã£o da imagem no magnifier.
      this.magnifierDiv.style.backgroundPosition =
        (-Math.floor((x - this.img.offsetLeft + imgOffsetX) * this.zoomLevel)) + "px " +
        (-Math.floor((y - this.img.offsetTop + imgOffsetY) * this.zoomLevel)) + "px";

    } else if (this.zoomType == 1) { // Magnifier fora do HTMLImage
      x -= this.magnifierDiv.middleX;
      y -= this.magnifierDiv.middleY;

      // NÃ£o permitir que o ponteiro do magnifier ultrapasse a Ã¡rea da imagem.
      if (x > imgWidth - this.magnifierDiv.offsetWidth + this.img.offsetLeft)
        x = imgWidth - this.magnifierDiv.offsetWidth + this.img.offsetLeft;
      else if (x < this.img.offsetLeft) x = this.img.offsetLeft;

      if (y > imgHeight - this.magnifierDiv.offsetHeight + this.img.offsetTop)
        y = imgHeight - this.magnifierDiv.offsetHeight + this.img.offsetTop;
      else if (y < this.img.offsetTop) y = this.img.offsetTop;

      // Atualizar a posiÃ§Ã£o do magnifier.
      this.magnifierDiv.style.left = x + "px";
      this.magnifierDiv.style.top = y + "px";

      // Atualizar a posiÃ§Ã£o da imagem no magnifier.
      this.magnifierOutsideDiv.style.backgroundPosition =
        (-Math.floor((x - this.img.offsetLeft + imgOffsetX) * (this.zoomWidth / this.magnifierDiv.offsetWidth))) + "px " +
        (-Math.floor((y - this.img.offsetTop + imgOffsetY) * (this.zoomHeight / this.magnifierDiv.offsetHeight))) + "px";
    }
  }
};

/**
 * Sobrescreve o mÃ©todo do HTMLElementBase devido a sua estruturaÃ§Ã£o.
 * @param width Largura do componente.
 */
HTMLImage.prototype.setWidth = function(width) {
  this.callMethod(HTMLElementBase, "setWidth", [width]);

  // Ajustar a largura dos elementos.
  if (this.img) this.img.style.width = this.width + "px";
  if (this.divText) this.divText.style.width = this.width + "px";
};

/**
 * Sobrescreve o mÃ©todo do HTMLElementBase devido a sua estruturaÃ§Ã£o.
 * @param height Altura do componente.
 */
HTMLImage.prototype.setHeight = function(height) {
  this.callMethod(HTMLElementBase, "setHeight", [height]);

  // Ajustar a altura dos elementos.
  if (this.context) this.context.style.height = this.height + "px";
  if (this.getViewMode() != "stretch" && this.img) this.img.style.height = this.height + "px";
  if (this.divText) this.divText.style.height = this.height + "px";
};

/**
 * Ocorre ao clicar no botÃ£o de zoom no footer.
 */
HTMLImage.prototype.zoomClickAction = function(e) {
  e.stopPropagation();
  this.setFooterVisible(false);
  if (this.hasImage && this.url && this.url.length > 0 && this.url != "null") {
    var imgWidth = (this.img.offsetWidth > 0) ? this.img.offsetWidth : this.width;
    var imgHeight = (this.img.offsetHeight > 0) ? this.img.offsetHeight : this.height;
    var formZoom = WFRZoomImg(this.urlIsBase64 ? "" : this.url, imgWidth, imgHeight);
    if (this.urlIsBase64 && formZoom) {
      var iframes = formZoom.getElementsByTagName("iframe");
      if (iframes && iframes.length > 0) iframes[0].urlImageZoom = this.url;
    }
  }
};

/**
 * Ocorre ao clicar no botÃ£o de upload no footer.
 */
HTMLImage.prototype.uploadClickAction = function(e) {
  e.stopPropagation();
  this.setFooterVisible(false);
  if (this.readonly || !this.enabled) return;
  this.uploadWindow = openUpload(this.sys, this.formID, this.code, this.getCriptografado(), true);
};

/**
 * Ocorre ao clicar no botÃ£o de webcam no footer.
 */
HTMLImage.prototype.captureClickAction = function(e) {
  e.stopPropagation();
  this.setFooterVisible(false);
  if (this.readonly || !this.enabled) return;
  this.captureWindow = openCapture(this.sys, this.formID, this.code);
};

/**
 * Atualiza o layout do componente.
 */
HTMLImage.prototype.updateLayout = function() {
  // Verificar se o componente possui imagem.
  var compHasImage = (this.hasImage && this.url && this.url.length > 0 && this.url != "null");

  if (this.canUpload()) {
    // Se a imagem puder realizar upload, o footer deverÃ¡ ser exibido.
    this.setFooterVisible(this.enabled && !this.readonly && (!this.hasImage || (this.hovered && !this.magnifier)));

    // Definir cursores dos elementos.
    this.div.style.cursor = this.enabled && !this.readonly ? "pointer" : null;
    this.noImage.style.cursor = this.div.style.cursor;
    this.img.style.cursor = this.div.style.cursor;

    // Remover estilo da borda da div.
    this.div.style.borderStyle = null;
  } else {
    // Se a imagem nÃ£o puder realizar upload, o footer deverÃ¡ ser ocultado.
    this.setFooterVisible(false);

    // Resetar cursores dos elementos.
    this.div.style.cursor = null;
    this.noImage.style.cursor = null;
    this.img.style.cursor = null;

    // Verificar se possui imagem.
    if (compHasImage) {
      // Remover classe de card.
      if (this.div && this.div.classList.contains("card")) { // Bootstrap
        this.div.classList.remove("card"); // Bootstrap
      }

      // Remover estilo da borda da div.
      this.div.style.borderStyle = null;
    } else {
      // Adicionar classe de card.
      if (this.div && !this.div.classList.contains("card")) { // Bootstrap
        this.div.classList.add("card"); // Bootstrap
      }

      // Definir estilo da borda da div.
      this.div.style.borderStyle = "dashed";
    }
  }

  // Verificar se o componente possui imagem.
  if (compHasImage) {
    // Ajustar visibilidade da imagem e dos elementos.
    this.setImageVisible(true);
    if (this.divZoom && this.divZoom.classList.contains("disabled")) // Bootstrap
      this.divZoom.classList.remove("disabled"); // Bootstrap
    if (this.divText) visibleDiv(this.divText, true);
  } else {
    // Ajustar visibilidade da imagem e dos elementos.
    this.setImageVisible(false);
    if (this.divZoom && !this.divZoom.classList.contains("disabled")) // Bootstrap
      this.divZoom.classList.add("disabled"); // Bootstrap
    if (this.divText) visibleDiv(this.divText, false);
  }

  if (this.getViewMode() != "stretch") {
    // Definir posicionamento da imagem.
    if (this.viewMode && this.viewMode.toLowerCase() == "centralizado") {
      this.img.style.backgroundPosition = "center center";
    } else {
      this.img.style.backgroundPosition = null;
    }

    // Definir modo de repetiÃ§Ã£o da imagem.
    this.img.style.backgroundRepeat = this.getViewMode();

    // Verificar se possui magnifier para atualizÃ¡-lo
    if (this.magnifier) {
      // Atualizar imagens do magnifier.
      if (this.zoomType == 1 && this.magnifierOutsideDiv) {
        this.magnifierOutsideDiv.style.backgroundRepeat = this.img.style.backgroundRepeat;
      } else if (this.zoomType == 0 && this.magnifierDiv) {
        this.magnifierDiv.style.backgroundRepeat = this.img.style.backgroundRepeat;
      }
    }
  }
};

/**
 * Atualiza a imagem do componente.
 * @param hasImage Valor lÃ³gico indicando se terÃ¡ imagem (false para remover a imagem atual).
 * @param fileName Nome do arquivo.
 * @param fileMD5 MD5 do arquivo.
 */
HTMLImage.prototype.refresh = function(hasImage, fileName, fileMD5) {
  // Verificar se a imagem foi alterada.
  var changed = this.md5 != fileMD5;

  // Ajustar propriedades do componente.
  this.md5 = fileMD5;
  this.hasImage = hasImage;

  // Atualizar imagem do componente.
  this.setImage(this.hasImage ? this.url : null, false);

  try {
    // Fechar janela de upload.
    if (this.uploadWindow && typeof this.uploadWindow.close === 'function') {
      this.uploadWindow.close();
      this.uploadWindow = null;
    }
  } catch (e) { }

  try {
    // Fechar janela de webcam.
    if (this.captureWindow && typeof this.captureWindow.close === 'function') {
      this.captureWindow.close();
      this.captureWindow = null;
    }
  } catch (e) { }

  // Se a imagem foi alterada, chamar o evento onchange.
  if (this.onchange && changed) {
    this.onchange.call(this);
  }
};

/**
 * Define o tipo da imagem exibida.
 * - 1: Upload
 * - 2: Digital
 * - 3: URL
 * @param type - Novo tipo da imagem.
 */
HTMLImage.prototype.setType = function(type) {
  this.type = type;
};

/**
 * Ocorre apÃ³s a finalizaÃ§Ã£o do touch
 */
HTMLImage.prototype.touchEndAction = function(e, o) {
  e.preventDefault();
};


/**
 * Exibe o magnifier.
 */
HTMLImage.prototype.showMagnifier = function() {
  if (!this.shouldHideMagnifier && this.hasImage && this.url && this.url.length > 0 && this.url != "null") {
    // Mostrar o magnifier quando o mouse entrar no elemento.
    if (this.magnifierDiv) this.magnifierDiv.style.display = "block";
    if (this.zoomType == 1 && this.magnifierOutsideDiv) {
      this.magnifierOutsideDiv.style.display = "block";
    }

    this.isMagnifierVisible = true;
  } else {
    this.hideMagnifier();
  }
};

/**
 * Esconde o magnifier.
 */
HTMLImage.prototype.hideMagnifier = function() {
  // Esconder o magnifier quando o mouse sair do elemento.
  if (this.magnifierDiv) this.magnifierDiv.style.display = "none";
  if (this.zoomType == 1 && this.magnifierOutsideDiv) {
    this.magnifierOutsideDiv.style.display = "none";
  }

  this.isMagnifierVisible = false;
};

/**
 * Alterna a exibiÃ§Ã£o do zoom (magnifier) e do footer do componente.
 */
HTMLImage.prototype.toggleMagnifier = function() {
  this.setFooterVisible(this.enabled && !this.readonly && !this.isFooterVisible());
  this.shouldHideMagnifier = this.isFooterVisible();
  if (this.mouseOver) {
    if (this.shouldHideMagnifier) this.hideMagnifier();
    else this.showMagnifier();
    this.updateMagnifier();
  }
};

/**
 * Ocorre ao clicar no componente.
 */
HTMLImage.prototype.clickAction = function(e, o) {
  e.stopPropagation();

  // Tipo de ExibiÃ§Ã£o:
  // [0] Desktop -> Clica na miniatura do zoom para abrÃ­-la maior. Faz tambÃ©m upload da imagem.
  // [1] Galeria -> Clica na imagem para abrÃ­-la maior.
  // [2] Nenhum -> Clique inativo. A nÃ£o ser que o evento "Ao Clicar" esteja ativo.

  if (this.enabled && !this.readonly) {
    if (e.touches && e.touches.length > 0) {
      if (this.magnifier && this.hasImage && !this.isMagnifierVisible && !this.isFooterVisible()) {
        this.showMagnifier();
        this.updateMagnifier();
      } else {
        if (this.canUpload() && this.hasImage) {
          this.setFooterVisible(!this.isFooterVisible());
          if (!this.isFooterVisible()) e.preventDefault();
        }

        this.hideMagnifier();
      }

      if (this.onclick) this.onclick.call(this);
      return;
    }

    if (this.onclick) {
      this.onclick.call(this);
    } else if (this.magnifier && this.hasImage && this.canUpload()) {
      this.toggleMagnifier();
    } else if (this.exhibitionType == 1) {
      this.zoomClickAction(e, o);
    } else if (this.canUpload()) {
      switch (this.type) {
        case 1: {
          this.uploadWindow = openUpload(this.sys, this.formID, this.code, this.getCriptografado(), this.hasImage, this.hasImage);
          break;
        } case 2: {
          this.captureWindow = openDigitalCapture(this.sys, this.formID, this.code, this.getCriptografado());
          break;
        }
      }
    }
  }
};

/**
 * Ocorre quando o mouse entra no componente.
 */
HTMLImage.prototype.mouseEnterAction = function(e) {
  this.hovered = true;
  this.updateLayout();
};

/**
 * Ocorre quando o mouse sai no componente.
 */
HTMLImage.prototype.mouseLeaveAction = function(e) {
  this.hovered = false;
  this.updateLayout();
};

/**
 * ObtÃ©m um boolean indicando se esse componente pode realizar upload.
 */
HTMLImage.prototype.canUpload = function() {
  return (this.exhibitionType == 0 && !this.staticImage && !this.readonly);
};

/**
 * ObtÃ©m um valor lÃ³gico indicando a visibilidade do footer do componente.
 */
HTMLImage.prototype.isFooterVisible = function() {
  return this.footerVisible;
};

/**
 * Define a visibilidade do footer do componente.
 * @param visible Visibilidade do footer.
 */
HTMLImage.prototype.setFooterVisible = function(visible) {
  this.footerVisible = visible;
  if (!this.footerVisible) this.shouldHideMagnifier = false;
  if (this.footerDiv) this.footerDiv.className = this.footerDivClass +
    (visible ? " d-flex" : " d-none") + // Bootstrap
    (this.noImageVisible ? "" : " position-absolute"); // Bootstrap
};

/**
 * Define a visibilidade do texto de sem imagem do componente.
 * @param visible Visibilidade do texto de sem imagem.
 */
HTMLImage.prototype.setNoImageVisible = function(visible) {
  this.noImageVisible = visible;
  if (this.noImage) this.noImage.className = this.noImageClass + (visible ? " d-flex" : " d-none"); // Bootstrap
  this.setFooterVisible(this.footerVisible);
};

/**
 * Define a visibilidade da imagem do componente.
 * @param visible Visibilidade da imagem.
 */
HTMLImage.prototype.setImageVisible = function(visible) {
  this.imgVisible = visible;
  if (this.context) this.context.className = (visible ? this.contextClass : "d-none"); // Bootstrap
  else if (this.img) this.img.className = this.imgClass + (visible ? " d-inline-block" : " d-none"); // Bootstrap
  this.setNoImageVisible(!visible);
};

HTMLImage.prototype.getCriptografado = function() {
  return this.criptografado ? "1" : "0";
};

HTMLImage.prototype.setCriptografado = function(criptografado) {
  this.criptografado = criptografado;
};

/**
 * ObtÃ©m o modo de repetiÃ§Ã£o do componente.
 */
HTMLImage.prototype.getViewMode = function() {
  if (this.viewMode == "Estender") return "stretch";
  if (this.viewMode == "Centralizado") return "no-repeat";
  if (this.viewMode == "Repetir") return "repeat";
  if (this.viewMode == "Repetir na Horizontal") return "repeat-x";
  if (this.viewMode == "Repetir na Vertical") return "repeat-y";
  return "stretch"; // Estendido ou em Branco
};

/**
 * Define a imagem do componente.
 * @param imageUrl URL da imagem.
 * @param isBase64 Valor lÃ³gico indicando se a URL Ã© um Base64.
 */
HTMLImage.prototype.setImage = function(imageUrl, isBase64) {
  var object = this;

  // Atualizar propriedade que indica se a imagem Ã© um base64.
  this.urlIsBase64 = isBase64;

  // Verificar se a URL foi definida.
  if (imageUrl && imageUrl.length > 0 && imageUrl != "null") {
    // Atualizar as propriedades.
    this.url = imageUrl;
    this.hasImage = true;

    // Verificar se nÃ£o Ã© base64 e nÃ£o possui o atributo de datetime.
    if (!isBase64 && imageUrl.toLowerCase().indexOf("datetime=") < 0) {
      // Adicionar o atributo de datetime.
      imageUrl = (imageUrl.indexOf("?") < 0 ? imageUrl + "?datetime=" : imageUrl + "&datetime=") +
        new Date().getTime();
    }

    // Remover estilo da borda customizado.
    if (this.div) this.div.style.borderStyle = null;

    if (this.getViewMode() == "stretch") {
      // O elemento Ã© da tag "img", devemos atualizar seu src.
      if (this.img) this.img.src = imageUrl;
    } else {
      // O elemento nÃ£o Ã© um elemento da tag "img", portanto devemos atualizar o fundo.
      if (this.img) this.img.style.backgroundImage = "url('" + imageUrl + "')";
    }

    // Verificar se possui magnifier para atualizÃ¡-lo.
    if (this.magnifier) {
      // Atualizar imagens do magnifier.
      if (this.zoomType == 1 && this.magnifierOutsideDiv) {
        this.magnifierOutsideDiv.style.backgroundImage = "url('" + imageUrl + "')";
      } else if (this.zoomType == 0 && this.magnifierDiv) {
        this.magnifierDiv.style.backgroundImage = "url('" + imageUrl + "')";
      }
    }

    if (this.getViewMode() != "stretch") {
      try {
        // Criar um elemento img para obter o tamanho real da imagem.
        var wrapperImg = new Image();
        wrapperImg.addEventListener("load", function() {
          object.imgRealWidth = wrapperImg.naturalWidth;
          object.imgRealHeight = wrapperImg.naturalHeight;

          // Atualizar layout do magnifier.
          object.updateMagnifier();
        });
        wrapperImg.src = imageUrl;
      } catch (e) {
        // Atualizar layout do magnifier.
        this.updateMagnifier();
      }
    }
  } else {
    // Atualizar as propriedades.
    this.hasImage = false;

    // Resetar variÃ¡veis.
    this.imgRealWidth = 0;
    this.imgRealHeight = 0;

    // Remover referÃªncias da imagem.
    if (this.getViewMode() == "stretch") {
      if (this.img) this.img.src = "";
    } else {
      if (this.img) this.img.style.backgroundImage = null;
    }

    // Verificar se possui magnifier para atualizÃ¡-lo.
    if (this.magnifier) {
      // Atualizar imagens do magnifier.
      if (this.zoomType == 1 && this.magnifierOutsideDiv) {
        this.magnifierOutsideDiv.style.backgroundImage = null;
      } else if (this.zoomType == 0 && this.magnifierDiv) {
        this.magnifierDiv.style.backgroundImage = null;
      }

      // Atualizar layout do magnifier.
      this.updateMagnifier();
    }
  }

  // Atualizar layout.
  this.updateLayout();
};

/**
 * Definir a imagem do componente para uma imagem codificada em Base64.
 * @param imageData Os dados da imagem codificados em Base64.
 */
HTMLImage.prototype.setImageBase64 = function(imageData) {
  if (imageData) {
    // Verificar se nÃ£o possui "data:". Por padrÃ£o a funÃ§Ã£o de alterar imagem nÃ£o define um "data:",
    // mas com essa verificaÃ§Ã£o possibilitamos a definiÃ§Ã£o de diferentes tipos de imagem e nÃ£o limitamos
    // a somente o tipo padrÃ£o definido pelo Webrun.
    if (!imageData.startsWith("data:")) imageData = "data:image/jpeg;base64," + imageData;

    // Atualizar imagem.
    this.setImage(imageData, true);
  }
};

HTMLImage.prototype.flush = function() {
  this.divText = null;
  this.label = null;
  this.noImage = null;
  this.img = null;
  this.divUpload = null;
  this.divUploadIcon = null;
  this.divWebcam = null;
  this.divWebcamIcon = null;
  this.divZoom = null;
  this.divZoomIcon = null;
  this.callMethod(HTMLElementBase, "flush");
};
