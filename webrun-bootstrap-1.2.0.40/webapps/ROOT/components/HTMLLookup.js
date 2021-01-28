var lookupCanBlur = true;

function HTMLLookup(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.type = 1;
  this.openSubForm = false;
  this.style = 0;
  this.showValue = showValue;
  this.expand = true;
  this.report = false;
  this.initialType = 2;
  this.filterOnKeyPress = false;
  this.placeholder = "";
  this.lastTime = null;
  this.mobile = isMobile();
  this.isAboveOverlay = false;
}

HTMLLookup.inherits(HTMLEdit);
HTMLLookup.prototype.name = 'HTMLLookup';
HTMLLookup.prototype.tabable = true;
HTMLLookup.prototype.tagName = 'lookup';
HTMLLookup.prototype.canSelectOnFocus = false;
HTMLLookup.prototype.defaultArrowWidth = 17;
HTMLLookup.prototype.defaultComponentHeight = 21;

HTMLLookup.prototype.lookupInit = function() {
  this.dependent = true;
};

HTMLLookup.prototype.lookupEndInit = function() { };

HTMLLookup.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  if (!this.visible) this.removeLookup(true);
};

HTMLLookup.prototype.validateDataType = function() {
  return true;
};

HTMLLookup.prototype.setValue = function(value, checkDependences, ignoreShowValue) {
  value = normalizeRuleParam(value, true);
  var oldValue = this.getValue();

  this.value = value;
  this.hidden.setValue(value);
  if (this.mobileInput) {
    for (var opt, j = 0; opt = this.mobileInput[j]; j++) {
      if (opt.value == value) {
        opt.setAttribute("selected", "selected");
        this.mobileInput.selectedIndex = j;
        break;
      } else if (opt.value == oldValue) {
        opt.removeAttribute("selected");
      }
    }
  }

  if (trim(this.value) != trim(oldValue)) {
    if (this.field == null || this.field.length == 0) {
      if (!ignoreShowValue) {
        var url = "lookupShowValue.do?sys=" + this.sys + "&formID=" + this.formID + "&comID=" + this.code + "&value=" + URLEncode(value, "GET");

        if (d.t && d.t.dependences) {
          var components = d.t.dependences[this.code];
          if (components && components.length > 0) {
            for (var code in components) {
              if (isNumeric(code)) {
                var component = eval("$mainform().d.c_" + components[code]);
                if (component) url += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), "GET"));
              }
            }
          }
        }

        var show = getContent(url);
        this.setShowValue(show);
      }
    }

    this.changeAction(null, this, !checkDependences);
  }
};

HTMLLookup.prototype.setShowValue = function(value) {
  this.showValue = value;
  if (this.input) this.input.value = value;
  if (this.mobileInput && (!this.mobileInput.options || this.mobileInput.options.length == 0)) {
    var dummyOption = document.createElement("option");
    dummyOption.innerHTML = replaceAll(replaceAll(value, '>', '&gt;'), '<', '&lt;');
    dummyOption.selected = true;
    dummyOption.hidden = true;
    this.mobileInput.appendChild(dummyOption);
  }
};

HTMLLookup.prototype.getValue = function() {
  return this.hidden.value;
};

HTMLLookup.prototype.getShowValue = function() {
  return this.input.value;
};

HTMLLookup.prototype.designEditInput = function(doc, name, value) {
  // Cria o input do lookup
  this.input = document.createElement("input");
  this.input.className = "form-control"; // Bootstrap
  this.input.id = 'WFRInput' + this.code;
  this.input.parent = this;

  if (!name) this.input.name = 'WFRInput' + this.code;
  else this.input.name = name;

  // Propriedade placeholder do input (texto quando nulo)
  if (this.placeholder) this.input.placeholder = this.placeholder;

  // Propriedade somente leitura do input
  this.input.readOnly = (this.style == 1);

  // Propriedade autocomplete do input (histÃ³rico)
  // Para nÃ£o aparecer outra lista no lookup, essa
  // propriedade deve estar sempre desativada (off).
  this.input.autocomplete = "off";

  // Propriedade de limite de caracteres do input
  if (this.maxlength) this.input.maxLength = this.maxlength;

  // Alinhamento do texto do input
  if (this.align) this.input.style.textAlign = this.align;

  // Definir o valor inicial do input
  if (value) this.input.value = value;

  // Layout do input
  this.input.style.height = (this.style == 0 ? (this.height - 2) : this.height) + "px";

  // Eventos do input
  this.input.addEventListener('input', this.inputSearchTimer);
};

HTMLLookup.prototype.designInput = function(doc) {
  if (this.style == 0 || this.style == 1 || this.style == 2) {
    this.designEditInput(doc, 'WFRInput' + this.code + 'Show', this.showValue);
  }
};

HTMLLookup.prototype.designComponentReport = function() {
  var labelReport = new HTMLLabel(this.sys, this.formID, this.code, 0, 0, this.width, this.height, this.showValue);
  labelReport.id = "reportLabelLookup" + this.code;
  labelReport.design(this.context, false);
};

HTMLLookup.prototype.designComponent = function(doc) {
  this.divClass = this.div.className;

  if (!this.filterOnKeyPress) {
    this.tabKeys = arrayIndexRemove(this.tabKeys, 2);
  }

  this.lookupInit();
  this.url = 'search.do?inputRetornoName=WFRInput' + this.code + 'Show&sys=' + this.sys + '&action=search&formID=' + this.formID + '&componentID=' + this.code + '&xml=true';

  if (this.report) {
    this.designComponentReport();
    return "";
  }

  this.onkeydown = this.checkKey;

  var parentDiv = this.div;
  var object = this;

  if (this.style == 0 && !this.toGrid) {
    // Verificar se o lookup tem um sub formulÃ¡rio associado
    if (this.openSubForm && this.subFormCode && parseInt(this.subFormCode) > 0) {
      // Criar uma nova div para colocar o botÃ£o do lado
      parentDiv = document.createElement("div");
      parentDiv.className = "d-flex flex-row-reverse"; // Bootstrap
      this.div.appendChild(parentDiv);

      // Criar o botÃ£o para abrir o sub formulÃ¡rio
      this.sfdiv = document.createElement("div");
      this.sfdiv.id = "lookupSubform" + this.code;
      this.sfdiv.className = "d-flex flex-column align-items-center justify-content-center px-2"; // Bootstrap

      // Criar o Ã­cone do botÃ£o
      var sfdivIcon = document.createElement("span");
      sfdivIcon.className = "generic-btn fas fa-window-maximize"; // Custom - Font Awesome
      this.sfdiv.appendChild(sfdivIcon);

      // Evento de clique do botÃ£o
      var sfdivEvent = this.getAction('openForm');
      if (sfdivEvent) this.attachEvent(this.sfdiv, 'click', sfdivEvent);

      // Adicionar o botÃ£o ao formulÃ¡rio
      parentDiv.appendChild(this.sfdiv);
    }
  }

  // Associar o botÃ£o F5 a aÃ§Ã£o de abrir o sub formulÃ¡rio do lookup
  if (this.openSubForm && this.subFormCode && parseInt(this.subFormCode) > 0 && this.style == 0) {
    this.onF5press = this.getAction('openForm');
  }

  // Cria o elemento hidden pra obter o valor atravÃ©s do POST (importante)
  this.hidden = new HTMLHidden(this.sys, this.formID, this.code, this.value);
  this.hidden.design(this.context);

  if (!this.mobile && this.style == 0) {
    // Ã‰ necessÃ¡rio criar outro div para colocar os elementos do Lookup
    this.context = this.getBaseDiv();
    this.context.className = "input-group lookup lookup-styled"; // Bootstrap
    this.context.style.height = this.div.style.height;
    this.contextClass = this.context.className;
    if (!this.enabled || this.readonly) this.context.className += " disabled";
    parentDiv.appendChild(this.context);
  }

  // Cria o elemento input (herdado pelo elemento HTMLEdit)
  this.callMethod(HTMLEdit, 'designComponent', [doc]);
  if (!this.contextClass) this.contextClass = this.context.className;

  if (!this.mobile && this.style == 0) {
    // Cria o botÃ£o do lado para abrir o menu de seleÃ§Ã£o
    this.button = document.createElement("button");
    this.button.className = "input-group-append"; // Bootstrap
    this.button.type = "button";
    this.button.onclick = function(e) {
      if (object.readonly) return false; // NÃ£o fazer nada quando o elemento estÃ¡ somente leitura
      return object.openDetails();
    };

    // Adiciona o botÃ£o ao elemento
    this.context.appendChild(this.button);

    // Desativa o botÃ£o quando o elemento estÃ¡ somente leitura ou desativado
    if (this.readonly || !this.enabled) {
      this.button.className += " disabled";
      this.button.setAttribute("aria-disabled", "true");
    }
  }

  this.onblur_catch = this.onblur;
  this.onblur = this.doOnBlur;
  this.lookupEndInit();

  if (this.mobile) {
    // Esconder o input original
    this.input.readOnly = true;
    this.input.style.display = "none";

    // Quando estamos em um celular, a melhor opÃ§Ã£o Ã© criar um elemento SELECT para
    // tratar da entrada de dados (assim fica melhor para o usuÃ¡rio selecionar os dados)
    this.mobileInput = document.createElement("select");
    this.mobileInput.className = "custom-select"; // Bootstrap
    this.mobileInput.name = "HTMLSelectMobile" + this.code;
    if (this.readonly || !this.enabled) this.mobileInput.setAttribute("disabled", "disabled");

    // Layout do select mobile
    this.mobileInput.style.left = "0";
    this.mobileInput.style.width = "100%";
    this.mobileInput.style.height = this.div.style.height;

    // VariÃ¡veis do select mobile
    this.mobileInput.url = this.url;
    this.mobileInput.lookup = this;

    // Eventos do select mobile
    this.attachEvent(this.mobileInput, 'change', this.lookupChangeSelectValue, this, this.mobileInput);
    this.attachEvent(this.mobileInput, 'touchstart', this.showLookupResults, this, this.mobileInput);

    // Verificar se o lookup tem um sub formulÃ¡rio associado
    if (this.openSubForm && parentDiv && this.subFormCode && parseInt(this.subFormCode) > 0) {
      // Adicionar o select mobile ao elemento
      parentDiv.appendChild(this.mobileInput);
    } else {
      // Adicionar o select mobile ao elemento
      this.div.appendChild(this.mobileInput);
    }

    // Verificar se possui valor inicial
    if (this.value && this.value.length > 0 && this.showValue && this.showValue.length > 0) {
      var initialOption = document.createElement("option");
      initialOption.selected = true;
      initialOption.value = this.value;
      initialOption.innerHTML = stringToHTMLString(this.showValue);
      this.mobileInput.appendChild(initialOption);
    }
  }
}

HTMLLookup.prototype.focusDoc = function(e) {
  var src = e.srcElement || e.target;
  parent.changeTitle(src.name);
};

HTMLLookup.prototype.setReadOnly = function(v) {
  this.readonly = v;

  // Configurar o div principal do lookup
  if (this.div) {
    if (this.readonly || !this.enabled) this.context.className = this.contextClass + " disabled";
    else this.context.className = this.contextClass;
  }

  // Configurar o input do lookup
  if (this.input) this.input.readOnly = (this.readonly || !this.enabled);

  // Configurar o botÃ£o do lookup
  if (this.button) {
    if (this.readonly || !this.enabled) {
      this.button.className = "input-group-append disabled"; // Bootstrap
      this.button.setAttribute("aria-disabled", "true"); // Accessibility
    } else {
      this.button.className = "input-group-append"; // Bootstrap
      this.button.removeAttribute("aria-disabled"); // Accessibility
    }
  }

  // Configurar o input mobile do lookup (se existir)
  if (this.mobileInput) {
    if (this.readonly || !this.enabled) {
      this.mobileInput.setAttribute("disabled", "disabled");
    } else {
      this.mobileInput.removeAttribute("disabled");
    }
  }
};

HTMLLookup.prototype.setEnabled = function(v) {
  this.enabled = v;

  // Configurar o input do lookup
  if (this.input) this.input.disabled = !this.enabled;

  // Configurar o button do lookup
  if (this.button) this.button.style.pointerEvents = this.enabled ? null : "none";

  // Configurar o botÃ£o do lookup
  if (this.button) {
    if (this.readonly || !this.enabled) {
      this.button.className = "input-group-append disabled";
      this.button.setAttribute("aria-disabled", "true");
    } else {
      this.button.className = "input-group-append";
      this.button.removeAttribute("aria-disabled");
    }
  }

  // Configurar o input mobile do lookup (se existir)
  if (this.mobileInput) {
    if (this.readonly || !this.enabled) {
      this.mobileInput.setAttribute("disabled", "disabled");
    } else {
      this.mobileInput.removeAttribute("disabled");
    }
  }
};

HTMLLookup.prototype.setColor = function(color) {
  this.callMethod(HTMLEdit, 'setColor', [color]);
  if (this.button) this.button.style.setProperty("color", color, "important");
  if (this.input) this.input.style.setProperty("color", color, "important");
  if (this.mobileInput) this.mobileInput.style.setProperty("color", color, "important");
};

HTMLLookup.prototype.setBGColor = function(color) {
  this.callMethod(HTMLEdit, 'setBGColor', [color]);
  if (this.button) this.button.style.setProperty("background-color", color, "important");
  if (this.input) this.input.style.setProperty("background-color", color, "important");
  if (this.mobileInput) this.mobileInput.style.setProperty("background-color", color, "important");
};

HTMLLookup.prototype.doOnBlur = function(evt) {
  if (this.input.value == "" && this.hidden.value != "") {
    this.hidden.value = "";
    this.hidden.hidden.value = "";
  }

  if (controller.activeElement == this) {
    controller.activeElement = null;
  }

  this.timeout(this.doOnBlurTO, 100);
};

HTMLLookup.prototype.doOnBlurTO = function(evt) {
  if (controller.activeElement != this && controller.activeElement != this.button && this.onblur_catch && !this.lookup) {
    this.onblur_catch.call(this, evt);
  }
};

HTMLLookup.prototype.checkKey = function(evt) {
  if (!evt) evt = event;
  var keyCode = evt.keyCode || evt.which;
  var r = true;

  if (keyCode == 113) {
    this.button.click();
    r = true;
  }

  if (evt.ctrlKey) {
    if (keyCode == 32) {
      this.changeLookupType(this, this.id);
      r = false;
    }
  }

  if (evt.ctrlKey) {
    if (keyCode == 116) {
      location.reload();
      r = false;
    }

    if (keyCode == 86) {
      this.keyOn = true;
      r = true;
    }
  }

  if (keyCode == 40 || keyCode == 38) {
    if (!this.lookupInput && keyCode == 40) {
      this.openDetails();
      this.timeout(function() {
        this.lookupInput.focus();
      }, 100);
    } else {
      this.lookupInput.focus();
    }
    r = false;
  }

  if (keyCode == 27) {
    if (!(this.lookup)) {
      document.disableEvents = false;
      return true;
    }
    this.closeCurrentLookup(evt);
    this.keyOn = false;
    r = false;
  }

  if (evt.shiftKey) {
    if (keyCode == 13) {
      controller.next(this, true);
    }
  }

  if (keyCode == 13) {
    if (!this.filterOnKeyPress) {
      if ((this.keyControllerOn && this.keyOn) || this.keyOn) {
        this.lastTime = this.inputSearch();
      } else {
        if (!evt.shiftKey) {
          controller.next(this, false);
        }
      }
    } else {
      if (this.lookupInput) {
        this.lookupChangeSelectValue(evt, this.lookupInput);
      }
    }
    r = false;
  } else {
    if (!(keyCode == 27) && !(keyCode == 16) && !(keyCode == 18) && !(keyCode == 9) && !evt.ctrlKey) {
      this.keyControllerOn = false;
      this.keyOn = true;
    } else {
      this.keyControllerOn = true;
    }
  }

  if (!r) {
    document.disableEvents = true;
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      evt.keyCode = 0;
      evt.returnValue = false;
    }

    return false;
  } else {
    return true;
  }
};

HTMLLookup.prototype.expandLookup = function() {
  if (this.lookupInput) {
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('mousedown', true, true, window);
    this.lookupInput.dispatchEvent(event);
  }
};

HTMLLookup.prototype.openDetails = function() {
  if (!this.enabled || this.readonly) return false;
  if (this.lookup) {
    this.removeLookup();
  } else {
    this.getDivDetails();

    var editedURL = this.url;
    if (d.t && d.t.dependences) {
      var components = d.t.dependences[this.code];
      if (components && components.length > 0) {
        for (var code in components) {
          if (isNumeric(code)) {
            var component = eval("$mainform().d.c_" + components[code]);
            if (component) {
              editedURL += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), "GET"));
            }
          }
        }
      }
    }

    this.timeout(this.showLookupResults, 0, [editedURL + '&type=1&q=']);
  }
};

HTMLLookup.prototype.getDivDetails = function() {
  controller.activeElement = this;
  lookupCanBlur = false;

  // Se existir a lista do lookup, devemos deletÃ¡-la
  if (this.lookup) this.removeLookup();

  // Criar a lista do lookup.
  this.lookup = document.createElement("div");
  this.lookup.className = "position-absolute card"; // Bootstrap
  this.lookup.id = "lookupDetails" + this.code;
  this.lookup.name = "lookupLayer";
  this.lookup.style.visibility = "visible";
  this.lookup.style.zIndex = "1000001";

  // FunÃ§Ã£o para atualizar layout da lista do lookup.
  var object = this;
  var updateDetailsLayout = function() {
    if (!object || !object.lookup) return;
    var lookupSelectElem = object.mobile ? object.mobileInput : object.context;

    if (document.n && document.n.responsive && lookupSelectElem && !object.toGrid) {
      if (object.larguraExibicao === "0" || object.larguraExibicao === undefined) {
        if (object.styleCss && object.styleCss.length > 0) {
          object.lookup.style.width = parseInt(window.getComputedStyle(document.getElementById(object.id)).width) + "px";
        } else {
          object.lookup.style.width = lookupSelectElem.offsetWidth + "px";
        }
      } else {
        var pscreen = parseInt(document.getElementById("lay").style.width, 10);
        object.lookup.style.width = ((object.larguraExibicao * 100) / pscreen) + "%";
      }

      object.lookup.style.left = findPosX(lookupSelectElem) + "px";
    } else {
      if (object.larguraExibicao === "0" || object.larguraExibicao === undefined) {
        if (object.styleCss && object.styleCss.length > 0) {
          object.lookup.style.width = parseInt(window.getComputedStyle(document.getElementById(object.id)).width) + "px";
        } else {
          object.lookup.style.width = lookupSelectElem.offsetWidth + "px";
        }
      } else {
        object.lookup.style.width = object.larguraExibicao + "px";
      }

      object.lookup.style.left = findPosX(lookupSelectElem) + "px";
    }

    // Tamanho do input do lookup.
    var lookupComponentHeight = lookupSelectElem.offsetHeight;
    var lookupComponentPosY = findPosY(lookupSelectElem);

    // Tamanho da lista do lookup.
    var lookupListHeight = object.lookup.offsetHeight;
    var lookupListPosY = parseInt(lookupComponentPosY + lookupComponentHeight);

    // Tamanho mÃ­nimo para a lista.
    var lookupMinListHeight = 100; // px

    // Obter o tamanho da barra de navegaÃ§Ã£o da lista do lookup.
    var lookupListNavigationHeight = object.lookupNavigationBar &&
      object.lookupNavigationBar.offsetHeight > 0 ? object.lookupNavigationBar.offsetHeight : 33;

    // Obter o tamanho da janela.
    var windowScrollY = window.scrollY;
    var windowHeight = window.innerHeight;
    var windowHeightWithScroll = windowHeight + windowScrollY;

    // Obter o tamanho dos itens na lista do lookup.
    var itemHeight = object.lookupInput && object.lookupInput.firstChild &&
      object.lookupInput.firstChild.offsetHeight > 0 ? object.lookupInput.firstChild.offsetHeight : 29;

    // Verificar se a quantidade de itens foi definida e Ã© maior que zero.
    if (object.lookupDataLength && object.lookupDataLength > 0) {
      // Calcular o tamanho da lista de itens baseado na quantidade.
      var size = (object.lookupDataLength * itemHeight) + 6;
      var maxListSize = (14 * 14) + 6; // LÃ³gica do Webrun antigo.
      if (size > maxListSize) size = maxListSize;
      size = (size - (size % itemHeight)) + 6;

      // Definir a altura do lookup para o tamanho da lista calculado
      // baseado na quantidade de itens e somar com a altura da barra
      // de navegaÃ§Ã£o.
      lookupListHeight = size + lookupListNavigationHeight;
    }

    // Verificar se o tamanho e a posiÃ§Ã£o da lista do lookup excedem o tamanho da janela.
    if (lookupListHeight > 0 && lookupListPosY + Math.max(lookupListHeight, lookupMinListHeight) > windowHeightWithScroll) {
      // Verificar se a lista do lookup cabe em cima do componente.
      if (lookupComponentPosY - lookupListHeight > windowScrollY) {
        if (lookupComponentPosY - lookupListHeight - windowScrollY < 0) {
          // Reduzir o tamanho da lista do lookup.
          lookupListHeight = Math.max(lookupMinListHeight, lookupComponentPosY - windowScrollY);
        }

        // Colocar o lookup na parte superior do componente.
        lookupListPosY = parseInt(lookupComponentPosY - lookupListHeight);

      // Verificar se a posiÃ§Ã£o do componente + sua altura excedem o tamanho da janela.
      } else if (lookupComponentPosY + lookupComponentHeight + lookupMinListHeight > windowHeightWithScroll) {
        // Neste ponto, o lookup nÃ£o cabe na posiÃ§Ã£o inferior do componente.

        // Reduzir o tamanho da lista do lookup.
        lookupListHeight = Math.max(lookupMinListHeight, (windowHeight - (windowHeight - lookupComponentPosY)) - windowScrollY);

        // Colocar o lookup na parte superior do componente.
        lookupListPosY = parseInt(lookupComponentPosY - lookupListHeight);
      } else {
        // Reduzir o tamanho da lista do lookup.
        lookupListHeight = Math.max(lookupMinListHeight, windowHeightWithScroll - lookupListPosY);
      }
    }

    if (lookupListHeight > 0) object.lookup.style.height = lookupListHeight + "px";
    object.lookup.style.top = lookupListPosY + "px";
  };

  // Definir funÃ§Ã£o de atualizar layout da lista no DOM do elemento.
  this.lookup.updateDetailsLayout = updateDetailsLayout;

  // Associar funÃ§Ã£o de atualizar layout da lista aos eventos resize e scroll da janela.
  window.addEventListener("resize", updateDetailsLayout);
  window.addEventListener("scroll", updateDetailsLayout);

  // Adicionar a lista Ã  pÃ¡gina.
  document.body.appendChild(this.lookup);

  // Chamar funÃ§Ã£o de atualizar layout da lista.
  updateDetailsLayout();

  // Cria o spinner de carregando
  this.lookupLoading = bootstrapCreateSpinner(this.lookup, "text-secondary", true)[0];
}

HTMLLookup.prototype.getSearchLabel = function(type) {
  var typeValue = (type || this.initialType);
  try {
    typeValue = parseInt(typeValue);
    if (!(/[1-4]/.test(typeValue))) typeValue = 3;
  } catch (e) { }

  switch (typeValue) {
    case 1: return getLocaleMessage("LABEL.EQUAL");
    case 2: return getLocaleMessage("LABEL.CONTAINING");
    case 4: return getLocaleMessage("LABEL.ENDING_WITH");
    default: return getLocaleMessage("LABEL.STARTING_WITH");
  }
};

HTMLLookup.prototype.getXMLDataOK = function(response, args) {
  if (this.mobile) return getXMLContent(response);
  else args[0].showDataLookupResults(response.responseXML);
};

HTMLLookup.prototype.getXMLDataError = function(response, args) {
  args[0].showDataLookupResults(null);
};

HTMLLookup.prototype.showLookupResultsAction = function(obj, url) {
  // Esconder todos os tooltips dos botÃµes da barra de navegaÃ§Ã£o.
  if (this.haveTooltips) {
    try { $(".lookup-nav-tooltip").tooltip("hide"); } catch (e) { }
  }

  // Refazer a lista de opÃ§Ãµes
  this.showLookupResults(url);
};

HTMLLookup.prototype.showLookupResults = function(url, type, query) {
  if (this.mobile) this.showDataLookupResults(this.url);
  else getAsyncXMLContent(url, this.getXMLDataOK, this.getXMLDataError, [this]);
};

HTMLLookup.prototype.showDataLookupResults = function(xmldoc) {
  if (this.mobile) {
    if (this.mobileInput) {
      // Montar a URL do pedido pro backend
      var url = this.url;
      if (d.t && d.t.dependences) {
        var components = d.t.dependences[this.code];
        if (components && components.length > 0) {
          for (var code in components) {
            if (isNumeric(code)) {
              var component = eval("$mainform().d.c_" + components[code]);
              if (component) url += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), "GET"));
            }
          }
        }
      }

      url += '&type=1&q=';
      xmldoc = this.getXMLDataOK([url]);

      if (xmldoc !== null) {
        var root = xmldoc.getElementsByTagName('r').item(0);
        if (!root) {
          var ex = xmldoc.children[0].children[0].getAttribute("message");
          handleException(new Error(ex));
          return;
        }

        var data = root.getElementsByTagName('d');
        if (data !== null) {
          // Limpar todas as opÃ§Ãµes do input do mobile
          // O melhor jeito para deletar todos os elementos filhos Ã© da forma descrita abaixo
          // Veja mais em: https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
          while (this.mobileInput.firstChild) {
            this.mobileInput.removeChild(this.mobileInput.firstChild);
          }

          // Adicionar as opÃ§Ãµes obtidas no input do mobile
          for (var nodeID = 0; nodeID < data.length; nodeID++) {
            // Cria o elemento da opÃ§Ã£o
            var option = document.createElement("option");

            // Obter o "galho" do dado atual
            var node = data.item(nodeID);
            var text = '&nbsp;';

            // Definir o valor da opÃ§Ã£o (importante)
            option.value = node.getAttribute('v');

            // Obter o texto/descriÃ§Ã£o do dado e colocÃ¡-lo no elemento
            if (node && node.firstChild && node.firstChild.nodeValue && trim(node.firstChild.nodeValue) != '')
              text = node.firstChild.nodeValue;
            option.innerHTML = replaceAll(replaceAll(text, '>', '&gt;'), '<', '&lt;');

            // Verifica se um valor atual foi definido e se ele Ã© o mesmo valor da opÃ§Ã£o
            if (this.value && option.value == this.value) {
              // Marcar a opÃ§Ã£o como selecionada
              option.selected = true;
            }

            // Adicionar o elemento ao input do mobile
            this.mobileInput.appendChild(option);
          }
        }
      }
    }
  } else {
    if (this.lookup) {
      this.getDivDetails();

      if (xmldoc != null) {
        var root = xmldoc.getElementsByTagName('r').item(0);
        if (!root) {
          var ex = xmldoc.children[0].children[0].getAttribute("message");
          handleException(new Error(ex));
          return;
        }

        var data = root.getElementsByTagName('d');
        this.lookupDataLength = data.length;

        // Criar o elemento da lista de opÃ§Ãµes
        this.lookupInput = document.createElement("select");
        this.lookupInput.id = "lookupInput";
        this.lookupInput.className = "form-control p-0 w-100 h-100 rounded-0 border-0"; // Bootstrap
        this.lookupInput.size = "4";

        // Adicionar o elemento Ã  pÃ¡gina
        this.lookup.appendChild(this.lookupInput);

        // Adicionar as opÃ§Ãµes obtidas na lista
        for (var nodeID = 0; nodeID < data.length; nodeID++) {
          // Cria o elemento da opÃ§Ã£o
          var option = document.createElement("option");
          option.className = "px-2 py-1"; // Bootstrap

          // Obter o "galho" do dado atual
          var node = data.item(nodeID);
          var text = '&nbsp;';

          // Definir o valor da opÃ§Ã£o (importante)
          option.value = node.getAttribute('v');

          // Obter o texto/descriÃ§Ã£o do dado e colocÃ¡-lo no elemento
          if (node && node.firstChild && node.firstChild.nodeValue && trim(node.firstChild.nodeValue) != '')
            text = node.firstChild.nodeValue;
          option.innerHTML = replaceAll(replaceAll(text, '>', '&gt;'), '<', '&lt;');

          // Adicionar o elemento na lista
          this.lookupInput.appendChild(option);
        }

        // Selecionar o primeiro item (sem ser o vazio)
        this.lookupInput.selectedIndex = 1;

        // Associar eventos Ã  lista de opÃ§Ãµes
        this.attachEvent(this.lookupInput, 'click', this.lookupChangeSelectValue, this, [this.lookupInput]);
        this.attachEvent(this.lookupInput, 'change', this.lookupHandleChange, this, []);

        var nav = root.getElementsByTagName('navigation').item(0);

        // Criar a barra de navegaÃ§Ã£o da lista de opÃ§Ãµes
        this.lookupNavigationBar = document.createElement('div');
        this.lookupNavigationBar.className = "card-footer d-flex flex-row-reverse p-2"; // Bootstrap
        if (this.div.offsetWidth > 0 && this.div.offsetWidth < 162) this.lookupNavigationBar.className += " justify-content-center"; // Bootstrap

        // VariÃ¡vel usada para saber se os tooltips foram usados
        this.haveTooltips = false;

        // Criar os botÃµes da barra de navegaÃ§Ã£o
        for (var nodeID = nav.childNodes.length - 1; nodeID >= 0; nodeID--) {
          // Cria o elemento do botÃ£o da barra de navegaÃ§Ã£o
          var navItem = document.createElement("div");
          navItem.className = "generic-btn float-right d-flex align-items-center justify-content-center px-1"; // Custom - Bootstrap

          // Obter o "galho" do dado atual
          var node = nav.childNodes.item(nodeID);

          // Verificar se o botÃ£o deverÃ¡ estar ativado ou desativado
          if (node.getAttribute("enabled").toLowerCase() == "true") {
            // Adicionar o evento de clique no item
            this.attachEvent(navItem, 'click', this.showLookupResultsAction, this, [node.firstChild.nodeValue]);
          } else {
            // Adicionar a classe "disabled"
            navItem.className += " disabled";
          }

          // Obter a tag do dado atual
          var nodeTag = node.tagName.toLowerCase();

          // Criar o elemento do Ã­cone do botÃ£o
          var navItemIcon = document.createElement("span");
          navItemIcon.id = "lookupNavigation" + capitalizeFirstLetter(nodeTag) + this.code;
          if (this.div.offsetWidth > 0 && this.div.offsetWidth >= 162) navItemIcon.className = "px-2"; // Bootstrap

          // Obter o Ã­cone para cada botÃ£o
          if (nodeTag == "last") {
            navItemIcon.className = (navItemIcon.className + " fas fa-angle-double-right").trim(); // Font Awesome

            // Tooltip do botÃ£o
            var tooltip = getLocaleMessage('LABEL.LAST_RECORD');
            if (tooltip) {
              navItem.className += " lookup-nav-tooltip"; // Custom
              navItem.title = tooltip;
              navItem.setAttribute("data-toggle", "tooltip"); // Bootstrap Tooltip
              this.haveTooltips = true;
            }
          } else if (nodeTag == "next") {
            navItemIcon.className = (navItemIcon.className + " fas fa-chevron-right").trim(); // Font Awesome

            // Tooltip do botÃ£o
            var tooltip = getLocaleMessage('LABEL.NEXT_RECORD');
            if (tooltip) {
              navItem.className += " lookup-nav-tooltip"; // Custom
              navItem.title = tooltip;
              navItem.setAttribute("data-toggle", "tooltip"); // Bootstrap Tooltip
              this.haveTooltips = true;
            }
          } else if (nodeTag == "previous") {
            navItemIcon.className = (navItemIcon.className + " fas fa-chevron-left").trim(); // Font Awesome

            // Tooltip do botÃ£o
            var tooltip = getLocaleMessage('LABEL.PREVIOUS_RECORD');
            if (tooltip) {
              navItem.className += " lookup-nav-tooltip"; // Custom
              navItem.title = tooltip;
              navItem.setAttribute("data-toggle", "tooltip"); // Bootstrap Tooltip
              this.haveTooltips = true;
            }
          } else if (nodeTag == "first") {
            navItemIcon.className = (navItemIcon.className + " fas fa-angle-double-left").trim(); // Font Awesome

            // Tooltip do botÃ£o
            var tooltip = getLocaleMessage('LABEL.FIRST_RECORD');
            if (tooltip) {
              navItem.className += " lookup-nav-tooltip"; // Custom
              navItem.title = tooltip;
              navItem.setAttribute("data-toggle", "tooltip"); // Bootstrap Tooltip
              this.haveTooltips = true;
            }
          }

          // Adicionar o Ã­cone ao botÃ£o
          navItem.appendChild(navItemIcon);

          // Adicionar o botÃ£o Ã  barra de navegaÃ§Ã£o
          this.lookupNavigationBar.appendChild(navItem);
        }

        // Adicionar a barra de navegaÃ§Ã£o Ã  lista
        this.lookup.appendChild(this.lookupNavigationBar);

        // Atualizar layout do lookup.
        if (this.lookup.updateDetailsLayout) {
          this.lookup.updateDetailsLayout();
        }

        // Evento de keydown no input do lookup.
        this.attachEvent(this.lookupInput, "keydown", this.lookupSelectPress);
      }

      // Evento de clique na pÃ¡gina (para fechar o lookup).
      this.attachEvent(document, "click", this.closeCurrentLookup);

      // Inicializar tooltips, se foram usados.
      if (this.haveTooltips) {
        bootstrapInitTooltip(".lookup-nav-tooltip");
        $(".lookup-nav-tooltip").on("show.bs.tooltip", function() {
            // Somente um tooltip deve ser exibido por vez.
            $(".lookup-nav-tooltip").not(this).tooltip("hide");
        });
      }

      // Deletar o spinner de carregando
      if (this.lookupLoading) {
        if (this.lookupLoading.remove) {
          this.lookupLoading.remove();
        } else this.lookup.removeChild(this.lookupLoading); // IE
        this.lookupLoading = null;
      }
    } else this.removeLookup();
  }
};

HTMLLookup.prototype.openForm = function() {
  eval(this.subFormOpenCommand);
};

HTMLLookup.prototype.openFormKeyboard = function() {
  eval(this.subFormOpenCommand);
};

HTMLLookup.prototype.changeLookupType = function(o, id) {
  var object = this;
  var alt = '';

  var lookupTypeIconDiv = document.createElement("div");
  lookupTypeIconDiv.className = "position-absolute d-flex align-items-center justify-content-center h-100 px-2"; // Bootstrap
  lookupTypeIconDiv.style.width = "2rem";
  lookupTypeIconDiv.style.top = "0px";
  lookupTypeIconDiv.style.bottom = "0px";
  lookupTypeIconDiv.style.zIndex = "10";
  lookupTypeIconDiv.style.right = this.button ? this.button.offsetWidth + "px" : "0px";
  this.div.appendChild(lookupTypeIconDiv);

  var lookupTypeIcon = document.createElement("i");
  lookupTypeIconDiv.appendChild(lookupTypeIcon);

  if (this.initialType == '3') {
    this.initialType = '1';
    lookupTypeIcon.className = "fas fa-equals"; // Font Awesome
    alt = getLocaleMessage("LABEL.EQUAL");
  } else if (this.initialType == '4') {
    this.initialType = '2';
    lookupTypeIcon.className = "fas fa-file-alt"; // Font Awesome
    alt = getLocaleMessage("LABEL.CONTAINING");
  } else if (this.initialType == '2') {
    this.initialType = '3';
    lookupTypeIcon.className = "fas fa-caret-left"; // Font Awesome
    alt = getLocaleMessage("LABEL.STARTING_WITH");
  } else if (this.initialType == '1') {
    this.initialType = '4';
    lookupTypeIcon.className = "fas fa-caret-right"; // Font Awesome
    alt = getLocaleMessage("LABEL.ENDING_WITH");
  }

  var accessibilitySpan = document.createElement("span");
  accessibilitySpan.className = "sr-only"; // Bootstrap
  accessibilitySpan.innerHTML = alt;
  lookupTypeIconDiv.appendChild(accessibilitySpan);

  $(lookupTypeIconDiv).fadeIn(1000, function() {
    $(lookupTypeIconDiv).fadeOut(1000, function() {
      if (object && object.div) object.div.removeChild(lookupTypeIconDiv);
    });
  });

  if (this.lookupInput) {
    this.inputSearch();
  }
};

HTMLLookup.prototype.closeCurrentLookup = function(evt) {
  // Esconder todos os tooltips dos botÃµes da barra de navegaÃ§Ã£o.
  if (this.haveTooltips) {
    try { $(".lookup-nav-tooltip").tooltip("hide"); } catch (e) { }
  }

  var target = evt.target || evt.srcElement;
  if (this.lookup && (!this.button || target != this.button.btdiv)) {
    if (!target.id || target.id.indexOf('lookup') != 0) {
      if (!(target.parentNode && target.parentNode.id && target.parentNode.id.indexOf('lookup') == 0)) this.removeLookup();
    }
  }

  this.isTyping = false;
};

HTMLLookup.prototype.lookupChangeSelectValue = function(e, sel) {
  if (this.mobile) {
    if (sel.options[sel.selectedIndex] && sel.options[sel.selectedIndex].value != 0) {
      this.lookupChangeValue(sel.options[sel.selectedIndex].value, sel.options[sel.selectedIndex].text);
    } else {
      this.lookupChangeValue("", "");
    }
  } else {
    if (sel.options[sel.selectedIndex]) {
      this.lookupChangeValue(sel.options[sel.selectedIndex].value, sel.options[sel.selectedIndex].text);
    } else {
      this.lookupChangeValue("", "");
    }

    this.keyOn = false;
  }
};

HTMLLookup.prototype.lookupChangeValue = function(v, t) {
  this.setValue(v, true, true);
  this.setShowValue(t);
  this.timeout(this.removeLookup, 0);
};

HTMLLookup.prototype.lookupHandleChange = function(e) {
  try {
    // CorreÃ§Ã£o para o navegador Firefox.
    if (isFirefox && this.lookupInput && this.lookupInput.selectedIndex >= 0) {
      // Obter a opÃ§Ã£o selecionada.
      var optionElem = this.lookupInput.options[this.lookupInput.selectedIndex];
      var optionOffsetTop = optionElem.offsetTop;
      var optionOffsetHeight = optionElem.offsetHeight;

      // Verificar se o elemento estÃ¡ fora da Ã¡rea de visÃ£o da lista.
      if (optionOffsetTop + optionOffsetHeight >= this.lookupInput.scrollTop + this.lookupInput.offsetHeight ||
          optionOffsetTop <= this.lookupInput.scrollTop) {
        // Atualizar scroll do select do lookup para o item selecionado.
        this.lookupInput.scrollTo(0, optionOffsetTop);
      }
    }
  } catch (e) { }
};

HTMLLookup.prototype.removeLookup = function(nofocus) {
  if (this.lookup && this.lookup.parentNode) {
    // Verificar se a funÃ§Ã£o de atualizar layout foi definida no DOM da lista do lookup.
    if (this.lookup.updateDetailsLayout) {
      try {
        // Remover eventos da janela.
        window.removeEventListener("resize", this.lookup.updateDetailsLayout);
        window.removeEventListener("scroll", this.lookup.updateDetailsLayout);
      } catch (e) { }
      this.lookup.updateDetailsLayout = null;
    }

    // Fechar todas as tooltips da lista do lookup.
    if (this.haveTooltips) {
      try { $(".lookup-nav-tooltip").tooltip("hide"); } catch (e) { }
      this.haveTooltips = false;
    }

    // Remover lista do lookup da tela.
    this.lookup.parentNode.removeChild(this.lookup);

    // Restaurar classe da div do componente.
    this.div.className = this.divClass;

    // Remover evento de clique.
    this.removeEvent(document, "click");

    // Dar foco no componente.
    if (!nofocus) this.focus();

    // Limpar variÃ¡veis.
    this.lookup = null;
    this.lookupInput = null;
    this.lookupNavigationBar = null;
    this.lookupDataLength = null;
  }

  lookupCanBlur = true;
};

HTMLLookup.prototype.lookupSelectPress = function(evt) {
  var alt = evt.altKey;
  var ctrl = evt.ctrlKey;
  var sel = this.lookupInput;
  var r = true;

  if (evt.keyCode == 33) {
    var x = sel.selectedIndex - 10;
    if (x < 0) x = -1;
    sel.selectedIndex = x;
    r = false;
  } else if (evt.keyCode == 34) {
    var x = sel.selectedIndex + 10;
    if (x > sel.length - 1) x = sel.length - 1;
    sel.selectedIndex = x;
    r = false;
  } else if (evt.keyCode == 27) {
    this.removeLookup();
    r = false;
  } else if (evt.keyCode == 10 || evt.keyCode == 13) {
    this.lookupChangeSelectValue(evt, sel);
    r = false;
  } else if (evt.keyCode == 38 && sel.selectedIndex == 0) {
    sel.options[0].selected = false;
  } else if (evt.keyCode == 9) {
    r = false;
  } else if (!alt && !ctrl && (evt.keyCode == 39 || evt.keyCode == 37)) {
    var idx = sel.selectedIndex;

    if (evt.keyCode == 39) {
      var nav = MM_findObj('lookupNavigationNext' + this.code);
      nav.click();
    }

    if (evt.keyCode == 37) {
      var nav = MM_findObj('lookupNavigationPrevious' + this.code);
      nav.click();
    }

    sel.selectedIndex = idx;
    sel.focus();
  }

  if (!r) {
    document.disableEvents = true;
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      evt.keyCode = 0;
      evt.returnValue = false;
    }

    return false;
  } else return true;
};

HTMLLookup.prototype.lookupKeyPress = function(evt) {
  var ctrl = evt.ctrlKey;
  var chr = String.fromCharCode(evt.keyCode).toUpperCase();
  var r = true;

  if (evt.keyCode == 40) {
    this.lookupInput.focus();
    r = false;
  } else if (evt.keyCode == 9) {
    r = false;
  } else if (evt.keyCode == 10 || evt.keyCode == 13) {
    this.lookupDoSearch();
  } else if (evt.keyCode == 38) {
    this.removeLookup();
  } else if (evt.keyCode == 27) {
    this.removeLookup();
    r = false;
  } else if (ctrl && chr == ' ') {
    MM_findObj('lookupImgType').onclick();
    r = false;
  } else if (this.filterOnKeyPress) {
    this.timeout(this.lookupDoSearch, 0);
  }

  if (!r) {
    document.disableEvents = true;
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      evt.keyCode = 0;
      evt.returnValue = false;
    }

    return false;
  } else return true;
};

HTMLLookup.prototype.lookupDoSearch = function() {
  var editedURL = this.url;
  if (d.t && d.t.dependences) {
    var components = d.t.dependences[this.code];
    if (components && components.length > 0) {
      for (var code in components) {
        if (isNumeric(code)) {
          var component = eval("$mainform().d.c_" + components[code]);
          if (component) {
            editedURL += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), "GET"));
          }
        }
      }
    }
  }

  this.showLookupResults(editedURL + '&type=' + this.initialType + '&q=' + URLEncode(this.input.value, "GET"), this.initialType, this.input.value);
};

HTMLLookup.prototype.freeComponent = function() {
  if (this.sfdiv) this.doc.removeChild(this.sfdiv);
};

HTMLLookup.prototype.setHint = function(hint) {
  this.callMethod(HTMLElementBase, "setHint", [hint]);

  if (this.context) {
    this.context.alt = hint;
    this.context.title = hint;
  }

  if (this.img != null) {
    this.img.alt = hint;
    this.img.title = hint;
  }
};

HTMLLookup.prototype.hasEmptyValue = function() {
  return (this.getValue() == this.emptyKeyValue);
};

HTMLLookup.prototype.inputSearch = function() {
  this.getDivDetails();
  this.lookupDoSearch();
  this.isTyping = true;
};

HTMLLookup.prototype.inputSearchTimer = function() {
  if (this.parent.filterOnKeyPress) {
    if (this.parent.lastTime) {
      clearTimeout(this.parent.lastTime);
      this.parent.lastTime = this.parent.timeout(this.parent.inputSearch, 300);
    } else {
      this.parent.lastTime = this.parent.timeout(this.parent.inputSearch, 300);
    }
  }
};

/**
 * Ocorre quando o formulÃ¡rio entra em modo de ediÃ§Ã£o.
 */
HTMLLookup.prototype.onFormEditMode = function() {
  if (this.isAboveOverlay && this.div && this.div.style.zIndex == 100000 && d.n.visible) {
    // Verificar se tem subformulÃ¡rio.
    if (this.openSubForm && this.subFormCode && parseInt(this.subFormCode) > 0 && this.style == 0) {
      // Restaurar z-index da div do componente.
      this.div.style.zIndex = this.zindex;

      // Verificar se o overlay do input foi criado.
      if (this.inputOverlay) {
        // Remover overlay do input.
        this.context.removeChild(this.inputOverlay);
        this.inputOverlay = null;

        if (this.label) {
          // Remover eventos da label do componente.
          if (this.labelPreventEvt) this.label.removeEventListener("click", this.labelPreventEvt);
          if (this.inputOverlayEvt) this.label.removeEventListener("dblclick", this.inputOverlayEvt);
          this.labelPreventEvt = null;
        }

        // Deletar evento de duplo clique.
        this.inputOverlayEvt = null;
      }

      this.isAboveOverlay = false;
    }
  }
};

/**
 * Ocorre quando o formulÃ¡rio entra em modo de visualizaÃ§Ã£o.
 */
HTMLLookup.prototype.onFormViewMode = function() {
  if (!this.isAboveOverlay && this.div && this.div.style.zIndex != 100000 && d.n.visible) {
    // Verificar se tem subformulÃ¡rio.
    if (this.openSubForm && this.subFormCode && parseInt(this.subFormCode) > 0 && this.style == 0) {
      // Trazer div do componente pra frente do form-overlay.
      this.div.style.zIndex = 100000;

      // Verificar se o overlay do input nÃ£o foi criado.
      if (!this.inputOverlay) {
        // Criar overlay do input.
        this.inputOverlay = document.createElement("div");
        this.inputOverlay.style.position = "absolute";
        this.inputOverlay.style.top = "0px";
        this.inputOverlay.style.left = "0px";
        this.inputOverlay.style.right = "0px";
        this.inputOverlay.style.bottom = "0px";
        this.inputOverlay.style.zIndex = 10;
        this.context.appendChild(this.inputOverlay);

        // Declarar evento de duplo clique pra possibilitar entrar em
        // modo de ediÃ§Ã£o com o duplo clique em cima do componente.
        var object = this;
        this.inputOverlayEvt = function() {
          if (object && object.tab && object.tab.dblClickAction && object.tab.parent && object.tab.parent.editWithDoubleClick) {
            object.tab.dblClickAction();
          }
        };

        this.inputOverlay.addEventListener("dblclick", this.inputOverlayEvt);

        if (!this.labelPreventEvt && this.label) {
          // Adicionar eventos na label do componente.
          this.labelPreventEvt = function(e) { e.preventDefault(); };
          this.label.addEventListener("click", this.labelPreventEvt);
          this.label.addEventListener("dblclick", this.inputOverlayEvt);
        }
      }

      this.isAboveOverlay = true;
    }
  }
};
