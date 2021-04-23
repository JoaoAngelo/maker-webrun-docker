function HTMLNavigationForm(sys, formID, posX, posY) {
  this.create(sys, formID, posX, posY, 24, 24);
}

HTMLNavigationForm.inherits(HTMLNavigation);
HTMLNavigationForm.prototype.name = 'HTMLNavigationForm';

// Tamanho dos ícones na barra de navegação
HTMLNavigationForm.prototype.iconsSize = 28;

HTMLNavigationForm.prototype.setMainImages = function(imgInclude, imgEdit, imgFirst,
  imgPrevious, imgNext, imgLast, imgDelete, imgRefresh, imgLog, imgDefaultValues,
  imgPrint, imgHelp, imgExit) {

  if (imgInclude != -1) {
    this.btInclude = this.addMainButton('fas fa-plus-circle', getLocaleMessage('LABEL.INCLUDE') + ' (Ctrl+Ins/Ctrl+I)', this.getAction('actInclude'), this.iconsSize, '');
    this.canInclude = true;
  } else this.canInclude = false;

  if (imgEdit != -1) {
    this.btEdit = this.addMainButton('fas fa-pencil-alt', getLocaleMessage('LABEL.RECORD_EDIT') + ' (Ctrl+E)', this.getAction('actEdit'), this.iconsSize, '');
    this.canEdit = true;
  } else this.canEdit = false;

  if (imgFirst != -1) this.btFirst = this.addMainButton('fas fa-angle-double-left', getLocaleMessage('LABEL.FIRST_RECORD') + ' (Ctrl+Home)', this.getAction('actFirst'), this.iconsSize, '');
  if (imgPrevious != -1) this.btPrevious = this.addMainButton('fas fa-chevron-left', getLocaleMessage('LABEL.PREVIOUS_RECORD') + ' (PgUp)', this.getAction('actPrevious'), this.iconsSize, '');
  if (imgNext != -1) this.btNext = this.addMainButton('fas fa-chevron-right', getLocaleMessage('LABEL.NEXT_RECORD') + ' (PgDown)', this.getAction('actNext'), this.iconsSize, '', 'Next');
  if (imgLast != -1) this.btLast = this.addMainButton('fas fa-angle-double-right', getLocaleMessage('LABEL.LAST_RECORD') + ' (Ctrl+End)', this.getAction('actLast'), this.iconsSize, '', 'Last');
  if (imgDelete != -1) this.btDelete = this.addMainButton('fas fa-trash-alt', getLocaleMessage('LABEL.REMOVE_RECORD') + ' (Ctrl+Del/Ctrl+D)', this.getAction('actDelete'), this.iconsSize, '');
  if (imgRefresh != -1) this.btRefresh = this.addMainButton('fas fa-redo', getLocaleMessage('LABEL.REFRESH') + ' (Alt+A)', this.getAction('actRefresh'), this.iconsSize, '');
  if (imgPrint != -1) this.btPrint = this.addMainButton('fas fa-print', getLocaleMessage('LABEL.PRINT') + ' (Ctrl+P)', this.getAction('actPrint'), this.iconsSize, '');
  if (imgLog != -1) this.btLog = this.addMainButton('fas fa-search', getLocaleMessage('LABEL.LOG_LABEL'), this.getAction('actLog'), this.iconsSize, '', 'Log');
  if (imgDefaultValues != -1) this.btDefaultValues = this.addMainButton('fas fa-stream', getLocaleMessage('LABEL.DEFAULT_VALUES') + ' (Ctrl+Shift+C)', this.getAction('actDefaultValues'), this.iconsSize, '');
  if (imgHelp != -1) {
    this.btHelp = this.addMainButton('far fa-question-circle', getLocaleMessage('LABEL.HELP') + ' (F12)', this.getAction('actHelp'), this.iconsSize, '', 'Help');
    this.btHelp.div.className += " self-enabled";
  }

  if (this.isEditable) {
    this.btDesign = this.addMainButton('eye', getLocaleMessage('INFO.FORM_EDIT'), this.getAction('actDesign'), this.iconsSize);
    this.btDesignCancel = this.addDesignButton('far fa-times-circle', '', getLocaleMessage('LABEL.CANCEL') + ' (Esc)', this.getAction('actDesignCancel'), true, this.iconsSize, '');
    this.btDesignSave = this.addDesignButton('fas fa-save', '', getLocaleMessage('LABEL.SAVE_RECORD') + ' (Ctrl+G)', this.getAction('actDesignSave'), true, this.iconsSize, '');
  }

  if (imgExit != -1) {
    this.btExit = this.addMainButton('fas fa-sign-out-alt', getLocaleMessage('LABEL.EXIT') + ' (Alt+F4)', this.getAction('actExit'), this.iconsSize, '');
    this.btExit.div.className += " self-enabled";
  }
};

HTMLNavigationForm.prototype.design = function(doc, tabControl) {
  // Cria o div principal da barra de navegação
  this.div = document.createElement("nav");
  this.div.name = "WFRComponent" + this.code;
  this.div.className = "navbar navbar-expand-sm navbar-light mb-3 mb-sm-0"; // Bootstrap

  this.div.style.flex = "0 0 auto"; // Correção para o Safari
  this.divClass = this.div.className;
  if (!this.enabled) this.div.className += " disabled";
  this.div.id = "formNavbar";
  this.div.zIndex = this.zindex;

  // Cria o botão de collapse da navbar (responsividade)
  var navbarToggler = document.createElement("button");
  navbarToggler.className = "navbar-toggler mr-3 outline-0"; // Bootstrap

  // Atributos do Bootstrap
  navbarToggler.setAttribute("type", "button");
  navbarToggler.setAttribute("data-toggle", "collapse");
  navbarToggler.setAttribute("data-target", "#navbarMenu");
  navbarToggler.setAttribute("aria-controls", "navbarMenu");
  navbarToggler.setAttribute("aria-expanded", "false");
  navbarToggler.setAttribute("aria-label", "...");

  // �?cone do botão de collapse
  navbarToggler.innerHTML = '<span class="navbar-toggler-icon"></span>';

  // Adicionar o botão à navbar
  this.div.appendChild(navbarToggler);

  // Criar os elementos base de navegação da navbar
  var navbarNavCollapse = document.createElement("div");
  navbarNavCollapse.className = "collapse navbar-collapse"; // Bootstrap
  navbarNavCollapse.id = "navbarMenu";
  this.div.appendChild(navbarNavCollapse);

  var navbarNav = document.createElement("ul");
  navbarNav.className = "navbar-nav flex-row flex-wrap"; // Bootstrap
  navbarNavCollapse.appendChild(navbarNav);

  // Define as variáveis de contexto
  this.doc = doc;
  this.context = navbarNav;

  // Desenha o componente (com os botões)
  this.designComponent(navbarNav, tabControl);

  // Verificar se possui navegação fixa.
  if (navigationFixed && d && d.formNavDiv) {
    d.formNavDiv.appendChild(this.div);
  } else {
    // Adiciona a barra de navegação à página
    doc.appendChild(this.div);
  }

  // Eventos da barra de navegação
  var object = this;
  $('#navbarMenu').on('show.bs.collapse', function() {
    var nav = $(".navbar");
        if (!nav.hasClass("navbar-bg")) {
          nav.addClass("navbar-bg");
            object.divClassBase = object.divClass;
          object.divClass += " navbar-bg";
        }
    });

    $('#navbarMenu').on('hide.bs.collapse', function() {
      var nav = $(".navbar");
        if (nav.hasClass("navbar-bg")) {
            nav.removeClass("navbar-bg");
          object.divClass = object.divClassBase;
            object.divClassBase = null;
        }
    });

  this.init(tabControl);
};

HTMLNavigationForm.prototype.freeButtons = function() {
  if (this.btInclude) this.btInclude = null;
  if (this.btEdit) this.btEdit = null;
  if (this.btFirst) this.btFirst = null;
  if (this.btPrevious) this.btPrevious = null;
  if (this.btNext) this.btNext = null;
  if (this.btLast) this.btLast = null;
  if (this.btDelete) this.btDelete = null;
  if (this.btRefresh) this.btRefresh = null;
  if (this.btPrint) this.btPrint = null;
  if (this.btLog) this.btLog = null;
  if (this.btDefaultValues) this.btDefaultValues = null;
  if (this.btHelp) this.btHelp = null;
  if (this.btDesign) this.btDesign = null;
  if (this.btDesignCancel) this.btDesignCancel = null;
  if (this.btDesignSave) this.btDesignSave = null;
  if (this.btExit) this.btExit = null;
  if (this.btEditSave) this.btEditSave = null;
  if (this.btEditCancel) this.btEditCancel = null;
  if (this.btIncludeSaveMore) this.btIncludeSaveMore = null;
  if (this.btIncludeSave) this.btIncludeSave = null;
  if (this.btIncludeCancel) this.btIncludeCancel = null;
};

HTMLNavigationForm.prototype.setEditImages = function(imgSave, imgCancel) {
  if (imgSave != -1) this.btEditSave = this.addEditButton('fas fa-save', '', getLocaleMessage("LABEL.SAVE_RECORD") + ' (Ctrl+S)', this.getAction('actEditSave'), true, this.iconsSize, 'EditSave');
  if (imgCancel != -1) this.btEditCancel = this.addEditButton('far fa-times-circle', '', getLocaleMessage("LABEL.CANCEL") + ' (Esc)', this.getAction('actEditCancel'), true, this.iconsSize, 'EditCancel');
};

HTMLNavigationForm.prototype.setIncludeImages = function(imgSave, imgCancel, imgSaveMore) {
  if (imgSaveMore != -1) this.btIncludeSaveMore = this.addIncludeButton('fas fa-save', getLocaleMessage("LABEL.SAVE_RECORD") + ' +', getLocaleMessage("LABEL.SAVE_RECORD") + ' (Ctrl+G)', this.getAction('actIncludeSaveMore'), true, this.iconsSize, 'IncludeSaveMore');
  if (imgSave != -1) this.btIncludeSave = this.addIncludeButton('far fa-save', getLocaleMessage("LABEL.SAVE_RECORD"), getLocaleMessage("LABEL.SAVE_RECORD") + ' (Ctrl+S)', this.getAction('actIncludeSave'), true, this.iconsSize, 'IncludeSave');
  if (imgCancel != -1) this.btIncludeCancel = this.addIncludeButton('far fa-times-circle', getLocaleMessage("LABEL.CANCEL"), getLocaleMessage("LABEL.CANCEL") + ' (Esc)', this.getAction('actIncludeCancel'), true, this.iconsSize, 'IncludeCancel');
};

HTMLNavigationForm.prototype.execAjaxEval = function(param) {
  var paramsName = arguments[1];
  var paramsValue = arguments[2];
  var url = "";

  if (param == "refreshAllEdit" && paramsValue != null && paramsValue.length != 0) {
    url = 'sys=' + this.sys + '&formID=' + this.formID + '&param=edit&align=0&filter=' + paramsValue + '&goto=' + formrow;
  } else if (param == "refreshAllInclude" && paramsValue != null && paramsValue.length != 0) {
    url = 'sys=' + this.sys + '&formID=' + this.formID + '&param=include&align=0&filter=' + paramsValue + '&goto=' + formrow;
  } else if (param == "refreshAllShow" && paramsValue != null && paramsValue.length != 0) {
    url = 'sys=' + this.sys + '&formID=' + this.formID + '&param=refreshAll&align=0&filter=' + paramsValue + '&goto=' + formrow;
  } else if (param === "refresh" && typeof paramsValue === "string") {
    url = 'sys=' + this.sys + '&formID=' + this.formID + '&param=' + param + '&filter=' + paramsValue + '&align=0&filter=&goto=' + formrow;
  } else {
    url = 'sys=' + this.sys + '&formID=' + this.formID + '&param=' + param + '&align=0&filter=&goto=' + formrow;
  }

  if (mainform.WEBRUN_CSRFTOKEN) url += "&WEBRUN-CSRFTOKEN=" + mainform.WEBRUN_CSRFTOKEN;
  url+= "&forceGetResponse=true"

  if (paramsName != null && paramsName.length != 0) {
    for (var i = 0; i < paramsName.length; i++) {
      var param = paramsName[i];
      if (param != "") url += ('&' + param + '=' + paramsValue[i]);
    }
  }

  if (document.t) {
    var dep = document.t.dependences;
    for (var componentUpdateCode in dep) {
      if (typeof componentUpdateCode == "function") continue;
      for (var index in dep[componentUpdateCode]) {
        if (typeof index == "function") continue;
        var componentCode = dep[componentUpdateCode][index];
        if (isNumeric(componentCode)) {
          var component = eval("$mainform().d.c_" + componentCode);
          if ((component == null) || (typeof component == "undefined")) continue;
          url += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue()));
        }
      }
    }
  }

  postURLAsyncJs('form.do', url, false, function(response) {
    if(response) eval(response);
  });
};

HTMLNavigationForm.prototype.execAjaxEvalSync = function(param) {
  var url = 'sys=' + this.sys + '&formID=' + this.formID + '&param=' + param + '&align=0&filter=&goto=' + formrow;
  var paramsName = arguments[1];
  var paramsValue = arguments[2];

  if (paramsName != null && paramsName.length != 0) {
    for (var i = 0; i < paramsName.length; i++) {
      var param = paramsName[i];
      if (param != "") url += ('&' + param + '=' + paramsValue[i]);
    }
  }

  url += "&forceGetResponse=true";
  if (mainform.WEBRUN_CSRFTOKEN) url += "&WEBRUN-CSRFTOKEN=" + mainform.WEBRUN_CSRFTOKEN;

  if (document.t) {
    var dep = document.t.dependences;
    for (var componentUpdateCode in dep) {
      if (typeof componentUpdateCode == "function") continue;
      for (var index in dep[componentUpdateCode]) {
        if (typeof index == "function") continue;
        var componentCode = dep[componentUpdateCode][index];
        if (isNumeric(componentCode)) {
          var component = eval("$mainform().d.c_" + componentCode);
          if ((component == null) || (typeof component == "undefined")) continue;
          url += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), postForceUTF8));
        }
      }
    }
  }

  eval(postURL("form.do", url));
};

HTMLNavigationForm.prototype.actInclude = function() {
  // Não executar ação se a navegação estiver desabilitada.
  if (!this.enabled) return;

  // Verificar se está na aba localizar.
  if (this.queryMode && document.t) {
    // Definir post action.
    this.postAction = "include";

    // Focar na primeira aba visível.
    document.t.openFirstTab();
  } else {
    this.execAjaxEval('include');
  }
};

HTMLNavigationForm.prototype.actIncludeSync = function() {
  // Não executar ação se a navegação estiver desabilitada.
  if (!this.enabled) return;

  // Verificar se está na aba localizar.
  if (this.queryMode && document.t) {
    // Definir post action.
    this.postAction = "include";

    // Focar na primeira aba visível.
    document.t.openFirstTab();
  } else {
    this.execAjaxEvalSync('include');
  }
};

HTMLNavigationForm.prototype.actEdit = function() {
  // Não executar ação se a navegação estiver desabilitada.
  if (!this.enabled) return;

  // Verificar se está na aba localizar.
  if (this.queryMode && document.t) {
    if (hasdata) {
      // Definir post action.
      this.postAction = "edit";
    }

    // Focar na primeira aba visível.
    document.t.openFirstTab();
  } else if (hasdata) {
    this.execAjaxEval('edit');
  }

  if (!hasdata) {
    if (this.btInclude != null && this.btInclude.enabled) this.actInclude();
    else interactionInfo(getLocaleMessage("INFO.CANNOT_INSERT_FORM"));
  }
};

HTMLNavigationForm.prototype.actEditSync = function() {
  // Não executar ação se a navegação estiver desabilitada.
  if (!this.enabled) return;

  // Verificar se está na aba localizar.
  if (this.queryMode && document.t) {
    // Definir post action.
    this.postAction = "edit";

    // Focar na primeira aba visível.
    document.t.openFirstTab();
  } else if (hasdata) {
    this.execAjaxEvalSync('edit');
  }

  if (!hasdata) {
    if (this.btInclude != null && this.btInclude.enabled) this.actInclude(true);
    else interactionInfo(getLocaleMessage("INFO.CANNOT_INSERT_FORM"));
  }
};

HTMLNavigationForm.prototype.actFirst = function() {
  if (!this.enabled) return;
  this.execAjaxEval('first');
};

HTMLNavigationForm.prototype.actFirstSync = function() {
  if (!this.enabled) return;
  this.execAjaxEvalSync('first');
};

HTMLNavigationForm.prototype.actPrevious = function() {
  if (!this.enabled) return;
  if (this.btPrevious != null && this.btPrevious.enabled) {
    this.execAjaxEval('previous');
  }
};

HTMLNavigationForm.prototype.actPreviousSync = function() {
  if (!this.enabled) return;
  if (this.btPrevious != null && this.btPrevious.enabled) {
    this.execAjaxEvalSync('previous');
  }
};

HTMLNavigationForm.prototype.actNext = function() {
  if (!this.enabled) return;
  if (this.btNext != null && this.btNext.enabled) {
    this.execAjaxEval('next');
  }
};

HTMLNavigationForm.prototype.actNextSync = function() {
  if (!this.enabled) return;
  if (this.btNext != null && this.btNext.enabled) {
    this.execAjaxEvalSync('next');
  }
};

HTMLNavigationForm.prototype.actLast = function() {
  if (!this.enabled) return;
  this.execAjaxEval('last');
};

HTMLNavigationForm.prototype.actLastSync = function() {
  if (!this.enabled) return;
  this.execAjaxEvalSync('last');
};

HTMLNavigationForm.prototype.actGoto = function(row) {
  if (!this.enabled) return;
  if (hasdata) {
    formrow = row;
    this.execAjaxEval('goto');
  }
};

HTMLNavigationForm.prototype.actGotoSync = function(row) {
  if (!this.enabled) return;
  if (hasdata) {
    formrow = row;
    this.execAjaxEvalSync('goto');
  }
};

HTMLNavigationForm.prototype.actDelete = function() {
  // Não executar ação se a navegação estiver desabilitada.
  if (!this.enabled) return;

  // Verificar se está na aba localizar.
  if (this.queryMode && document.t) {
    // Definir post action.
    this.postAction = "delete";

    // Focar na primeira aba visível.
    document.t.openFirstTab();
  } else if (hasdata) {
    var interaction = new parent.mainform.HTMLMessage();
    interaction.showInteractionConfirmMessage($mainform().getLocaleMessage("LABEL.REMOVE_RECORD"),
      $mainform().getLocaleMessage("INFO.REMOVE_CONFIRM"),
      function(boolTest, sys, formID) {
        try {
          formBeforeDelete();
          /**
            Implementação para que subformulários executem uma chamada cliente.
          **/
          var elems = controller.elems;
          for (i = 0; i < elems.length; i++) {
            if (elems[i] instanceof HTMLDetailPanel) {
              try { elems[i].beforeDelete(); } catch (e) { }
            }
          }

          var actRequest = 'sys=' + sys + '&formID=' + formID + '&action=form&param=delete&forceGetResponse=true&filter=&pType=1&goto=' + formrow;
          if (mainform.WEBRUN_CSRFTOKEN) actRequest += "&WEBRUN-CSRFTOKEN=" + mainform.WEBRUN_CSRFTOKEN;
          eval(postURL('form.do', actRequest));
          try { d.p.loaded = false; } catch (e) { }
        } catch (ex) {
          handleException(ex);
        }
      }, [null, this.sys, this.formID], null, null, null, $mainform().getLocaleMessage("LABEL.YES"), $mainform().getLocaleMessage("LABEL.NO"));
  }
};

HTMLNavigationForm.prototype.actRefresh = function() {
  // Não executar ação se a navegação estiver desabilitada.
  if (!this.enabled) return;

  // Verificar se está na aba localizar.
  if (this.queryMode && document.t) {
    // Definir post action.
    this.postAction = "refresh";

    // Focar na primeira aba visível.
    document.t.openFirstTab();
  } else {
    var refreshAction = function() {
      if (!isPopup) {
        closeFloatingFormChilds(idForm);
        if (isFormOpenInGroupBox()) {
          removeFormFromHierarchy(idForm);
        }
      }
      //Devido a requisições async no evento onunload, deve ser chamado direto a ação para garantir a sincronia de execução no servidor.
      if (parent.formOnUnLoadAction) parent.formOnUnLoadAction();
      parent.location = parent.location.toString();
    };

    if (this.developmentMode) {
      /* Verifica se o formulário é modal e avisa que
        o formulário deve ser fechado e aberto novamente */
      if (this.isModal && IE) {
        if (parent.formOnUnLoadAction) {
          // Limpa o Dataset
          parent.formOnUnLoadAction();
        }

        // Avisa o usuário que ele deve fechar e abrir novamente o form
        alert("Você deverá fechar e abrir novamente o formulário modal para visualizar alterações.");
      } else refreshAction();
    } else {
      interaction(getLocaleMessage("INFO.UPDATE_WANT"),
        [getLocaleMessage("INFO.UPDATE_CURRENT_RECORD"), getLocaleMessage("INFO.UPDATE_ALL_FORM")],
        [this.execAjaxEval, refreshAction],
        [["refresh"]],
        [this]
      );
    }
  }
};

HTMLNavigationForm.prototype.actHelp = function() {
  showFormHelp(this.sys, this.formID);
};

HTMLNavigationForm.prototype.actPrint = function() {
  if (!this.enabled) return;
  if (this.reportCode) openWFRReport2(this.sys, this.reportCode, this.formID, this.reportDescription);
};

HTMLNavigationForm.prototype.actExit = function() {
  // Verificar se o formulário está aberto num componente Aba.
  if (isFormOpenInTabComponent()) {
    // Fechar aba do formulário.
    closeFormInTabComponent();

  // Verificar se o formulário está aberto numa moldura.
  } else if (isFormOpenInGroupBox()) {
    try {
      // Chamar a função de fechar formulário numa moldura no contexto do formulário da moldura.
      window.parent.parent.ebfFrameCloseForm(null,
        window.parent.frameElement.componentName);
    } catch (e) { }

  // Verificar se o formulário é popup.
  } else if (isPopup || mainSystemFrame == null) {
    parent.close();

  // �?ltimo caso: formulário é flutuante.
  } else closeFloatingFormById(idForm);
};

HTMLNavigationForm.prototype.actDesign = function() {
  if (!this.enabled) return;
  if (this.btDesign != null && this.btDesign.enabled) {
    this.formDesign();
    makercontroller.editMode();
  }
};

HTMLNavigationForm.prototype.actDesignSave = function() {
  if (!this.enabled) return;
  if (this.btDesignSave != null && this.btDesignSave.enabled) {
    makercontroller.saveToDatabase();
  }
};

HTMLNavigationForm.prototype.actDesignCancel = function() {
  if (!this.enabled) return;
  if (this.btDesignCancel != null && this.btDesignCancel.enabled) {
    makercontroller.cancelChanges();
  }
};

HTMLNavigationForm.prototype.getMaker = function() {
  return makercontroller;
};

HTMLNavigationForm.prototype.actEditSave = function() {
  if (!this.enabled) return;
  try {
    if (controller.checkRequireds() && !httpprocessing) {
      controller.doInvisibleComponents();
      formBeforeUpdate();

      /**
        Implementação para que subformulários executem uma chamada cliente servidor.
      **/
      var elems = controller.elems;
      for (i = 0; i < elems.length; i++) {
        if (elems[i] instanceof HTMLDetailPanel) {
          try { elems[i].beforeUpdate(); } catch (e) {};
        }
      }

      MM_findObj('goto').value = formrow;
      MM_findObj('param').value = 'postcancel';
      showWait();
      controller.beforeSubmit();
      WFRForm.submit();
      controller.afterSubmit();
      try { d.p.loaded = false; } catch (e) { }
    }
  } catch (ex) {
    handleException(ex);
  }
};

HTMLNavigationForm.prototype.actEditSaveSync = function() {
  if (!this.enabled) return;
  try {
    if (controller.checkRequireds() && !httpprocessing) {
      controller.doInvisibleComponents();
      formBeforeUpdate();

      /**
        Implementação para que subformulários executem uma chamada cliente servidor.
      **/
      var elems = controller.elems;
      for (i = 0; i < elems.length; i++) {
        if (elems[i] instanceof HTMLDetailPanel) {
          try { elems[i].beforeUpdate(); } catch (e) { };
        }
      }

      showWait();
      controller.beforeSubmit();
      this.postAndEvalSync("postcancel", formrow);
      controller.afterSubmit();
      hideWait();
      try { d.p.loaded = false; } catch (e) { }
    }
  } catch (ex) {
    handleException(ex);
  }
};

HTMLNavigationForm.prototype.postAndEvalSync = function(param, formrow) {
  var url = 'sys=' + this.sys + '&formID=' + this.formID + '&param=' + param + '&filter=&pType=1&goto=' + formrow;

  var elems = controller.getFormElements();
  for (i = 0; i < elems.length; i++) {
    url += "&WFRInput" + elems[i].getCode() + "=" + URLEncode(elems[i].getValue(), postForceUTF8);
  }

  var all = controller.getAllElements();
  for (var i = 0; i < all.length; i++) {
    var elem = all[i];
    if (elem && isTypeOf(elem, "HTMLDualList")) {
      url += "&WFRInputDelete" + elem.getCode() + "=" + URLEncode(elem.inputDelete.value, postForceUTF8);
      url += "&WFRInputInclude" + elem.getCode() + "=" + URLEncode(elem.inputInclude.value, postForceUTF8);
    }
  }

  if (mainform.WEBRUN_CSRFTOKEN) url += "&WEBRUN-CSRFTOKEN=" + mainform.WEBRUN_CSRFTOKEN;
  url += "&forceGetResponse=true";

  if (document.t) {
    var dep = document.t.dependences;
    for (var componentUpdateCode in dep) {
      if (typeof componentUpdateCode == "function") continue;
      for (var index in dep[componentUpdateCode]) {
        if (typeof index == "function") continue;
        var componentCode = dep[componentUpdateCode][index];
        if (isNumeric(componentCode)) {
          var component = eval("$mainform().d.c_" + componentCode);
          if ((component == null) || (typeof component == "undefined")) continue;
          url += ("&WFRInput" + component.getCode() + "=" + URLEncode(component.getValue(), postForceUTF8));
        }
      }
    }
  }

  eval(postURL("form.do", url));
};

HTMLNavigationForm.prototype.actEditCancel = function() {
  if (!this.enabled) return;
  this.editCancel = true;
  this.execAjaxEval('cancel');
  removeLookup(true);
};

HTMLNavigationForm.prototype.actEditCancelSync = function() {
  if (!this.enabled) return;
  this.editCancel = true;
  this.execAjaxEvalSync('cancel');
  removeLookup(true);
};

HTMLNavigationForm.prototype.actIncludeSave = function() {
  if (!this.enabled) return;
  try {
    if (controller.checkRequireds() && !httpprocessing) {
      controller.doInvisibleComponents();
      formBeforeInsert();

      /**
        Implementação para que subformulários executem uma chamada cliente servidor.
      **/
      var elems = controller.elems;
      for (i = 0; i < elems.length; i++) {
        if (elems[i] instanceof HTMLDetailPanel) {
          try { elems[i].beforeInsert(); } catch (e) { }
        }
      }

      MM_findObj('goto').value = formrow;
      MM_findObj('param').value = 'postcancel';
      showWait();
      controller.beforeSubmit();
      WFRForm.submit();
      controller.afterSubmit();
      try { d.p.loaded = false; } catch (e) { }
    }
  } catch (ex) {
    handleException(ex);
  }
};

HTMLNavigationForm.prototype.actIncludeSaveSync = function() {
  if (!this.enabled) return;
  try {
    if (controller.checkRequireds() && !httpprocessing) {
      controller.doInvisibleComponents();
      formBeforeInsert();

      /**
        Implementção para que subformulários executem uma chamada cliente servidor.
      **/
      var elems = controller.elems;
      for (i = 0; i < elems.length; i++) {
        if (elems[i] instanceof HTMLDetailPanel) {
          try { elems[i].beforeInsert(); } catch (e) { }
        }
      }

      showWait();
      controller.beforeSubmit();
      this.postAndEvalSync("postcancel", formrow);
      controller.afterSubmit();
      hideWait();
      try { d.p.loaded = false; } catch (e) { }
    }
  } catch (ex) {
    handleException(ex);
  }
};

HTMLNavigationForm.prototype.actIncludeSaveMore = function() {
  if (!this.enabled) return;
  try {
    if (controller.checkRequireds() && !httpprocessing) {
      controller.doInvisibleComponents();
      formBeforeInsert();

      /**
        Implementação para que subformulários executem uma chamada cliente servidor.
      **/
      var elems = controller.elems;
      for (i = 0; i < elems.length; i++) {
        if (elems[i] instanceof HTMLDetailPanel) {
          try { elems[i].beforeInsert(); } catch (e) { }
        }
      }

      MM_findObj('goto').value = formrow;
      MM_findObj('param').value = 'post';
      showWait();
      controller.beforeSubmit();
      WFRForm.submit();
      controller.afterSubmit();
      controller.focusFirst();
      try { d.p.loaded = false; } catch (e) { }
    }
  } catch (ex) {
    handleException(ex);
  }
};

HTMLNavigationForm.prototype.actIncludeSaveMoreSync = function() {
  if (!this.enabled) return;
  try {
    if (controller.checkRequireds() && !httpprocessing) {
      controller.doInvisibleComponents();
      formBeforeInsert();

      /**
        Implementação para que subformulários executem uma chamada cliente servidor.
      **/
      var elems = controller.elems;
      for (i = 0; i < elems.length; i++) {
        if (elems[i] instanceof HTMLDetailPanel) {
          try { elems[i].beforeInsert(); } catch (e) { }
        }
      }

      showWait();
      controller.beforeSubmit();
      this.postAndEvalSync("post", formrow);
      controller.afterSubmit();
      controller.focusFirst();
      try { d.p.loaded = false; } catch (e) { }
    }
  } catch (ex) {
    handleException(ex);
  }
};

HTMLNavigationForm.prototype.actIncludeCancel = function() {
  if (!this.enabled) return;
  this.execAjaxEval('cancel');
  removeLookup(true);
};

HTMLNavigationForm.prototype.actIncludeCancelSync = function() {
  if (!this.enabled) return;
  this.execAjaxEvalSync('cancel');
  removeLookup(true);
};

HTMLNavigationForm.prototype.actLog = function() {
  // Não executar ação se a navegação estiver desabilitada.
  if (!this.enabled) return;

  // Verificar se está na aba localizar.
  if (this.queryMode && document.t) {
    // Definir post action.
    this.postAction = "log";

    // Focar na primeira aba visível.
    document.t.openFirstTab();
  } else {
    // Abrir tela de log.
    openFormLog(this.sys, this.formID, 'Log', pkeys, '1');
  }
};

HTMLNavigationForm.prototype.actDefaultValues = function() {
  // Não executar ação se a navegação estiver desabilitada.
  if (!this.enabled) return;

  // Verificar se está na aba localizar.
  if (this.queryMode && document.t) {
    // Definir post action.
    this.postAction = "defaultValues";

    // Focar na primeira aba visível.
    document.t.openFirstTab();
  } else {
    // Abrir tela de valores padrão.
    openDefaultValues(this.sys, this.formID);
  }
};

HTMLNavigationForm.prototype.setEnabled = function(v) {
  this.enabled = v;
  if (this.div) {
    this.div.className = (this.enabled) ? this.divClass : this.divClass + " disabled";
  }
};

HTMLNavigationForm.prototype.checkForPostActions = function() {
  var object = this;
  setTimeout(function() {
    if (object.postAction) {
      if (object.postAction == "refresh") object.actRefresh();
      else if (object.postAction == "delete") object.actDelete();
      else if (object.postAction == "log") object.actLog();
      else if (object.postAction == "defaultValues") object.actDefaultValues();
      else object.execAjaxEval(object.postAction);
      object.postAction = null;
    }
  }, 0);
};
