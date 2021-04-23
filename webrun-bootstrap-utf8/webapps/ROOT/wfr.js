var isEditable = false;

var VERSION = "Edição Bootstrap - 1.2.0.74";
var ENCODING = "UTF-8";
var PAGES_EXTENSION = ".jsp";//PAGES@";

if (Array.prototype.push == null) {
  Array.prototype.push = function() {
    for (var i = 0; i < arguments.length; i++)
      this[this.length] = arguments[i];
    return this.length;
  };
};

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(obj, start) {
    for (var i = (start || 0), j = this.length; i < j; i++) {
      if (this[i] === obj) return i;
    }
    return -1;
  };
}

if (!Array.prototype.remByVal) {
  Array.prototype.remByVal = function(val) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] === val) {
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  };
}

var EventCache = function() {
  var listEvents = [];
  return {
    listEvents: listEvents,

    add: function(node, sEventName, fHandler, bCapture) {
      listEvents.push(arguments);
    },

    flush2: function() {
      var i, item;
      for (i = listEvents.length - 1; i >= 0; i = i - 1) {
        item = listEvents[i];
        removeEvent(item[0], item[1], item[2]);
      }
    },

    flush: function() {
      var i, item;
      for (i = listEvents.length - 1; i >= 0; i = i - 1) {
        item = listEvents[i];
        if (item[0].removeEventListener) {
          item[0].removeEventListener(item[1], item[2], item[3]);
        }

        item[0][item[1]] = null;
        if (item[1].substring(0, 2) != "on") {
          item[1] = "on" + item[1];
        }

        if (item[0].detachEvent) {
          item[0].detachEvent(item[1], item[2]);
        }

        item[0][item[1]] = null;
        item[0]['event_' + item[1]] = null;
      }
    }
  };
}();

var iniprofile;

function changeTitle(v) {
  //Faz nada
}

function fix(v) {
  return v < 10 ? '0' + v : v;
}

function getDateTime() {
  var d = new Date();
  return fix(d.getDate()) + "/" + fix(d.getMonth() + 1) + "/" + d.getFullYear();
}

function tabAsync(elem, i, invert) {
  var validation = false;
  if (i < 0) i = elem.length - 1;

  if (elem.length === i) i = 0;

  if (typeof elem[i] === 'object') {
    validation = elem[i].getFocus(true);
  } else {
    validation = false;
  }

  if (!validation) {
    if (invert) {
      window.setTimeout(tabAsync(elem, i - 1, invert), 2);
    } else {
      window.setTimeout(tabAsync(elem, i + 1, invert), 2);
    }
  }
}

var backaux = "";

var IE = document.all ? true : false;
var isIE = IE;
var ie = document.all;
var w3c = document.getElementById && !document.all;
var isChrome = navigator.userAgent.indexOf('Chrome') != -1;
var isSafari = navigator.userAgent.indexOf('Safari') != -1 && !isChrome /* No Chrome aparece a palavra Safari */;
var isIE11 = navigator.userAgent.indexOf('Trident') != -1 && navigator.userAgent.indexOf('rv:11.0') != -1;

var isFirefox = false;
var isFirefoxVersionAbove3 = false;
var isFirefoxVersionAbove20 = false;
var firefoxRegExp = new RegExp("firefox/(\\d+)", "i");
var firefoxRegExpResult = firefoxRegExp.exec(navigator.userAgent);
if (firefoxRegExpResult != null && firefoxRegExpResult.length > 1) {
  isFirefox = true;
  try {
    var version = parseInt(firefoxRegExpResult[1]);
    if (version > 2) isFirefoxVersionAbove3 = true;
    if (version >= 20) isFirefoxVersionAbove20 = true;
  } catch (e) { }
}

var postForceUTF8 = true;

function associateObjWithEvent(obj, methodName, owner, params) {
  return (function(evt) {
    evt = evt || window.event;
    if (evt) evt.isEvent = true;
    if (params) {
      var paramscopy = new Array();
      paramscopy.push(evt);
      paramscopy = paramscopy.concat(params);
      return obj[methodName].apply(owner, !owner.isRule ? paramscopy : params);
    } else
      return obj[methodName].call(owner, evt, !owner.isRule ? this : null);
  });
}

function associateRuleWithEvent(obj, methodName, owner) {
  return (function() {
    return obj[methodName].apply(owner, arguments);
  });
}

function addEvent(obj, evType, fn, useCapture) {
  if (obj.addEventListener) {
    obj.addEventListener(evType, fn, useCapture);
    return true;
  } else if (obj.attachEvent) {
    var r = obj.attachEvent("on" + evType, fn);
    EventCache.add(obj, evType, fn, useCapture);
    return r;
  } else {
    alert("Handler could not be attached");
  }
}

function removeEvent(obj, evType, fn, useCapture) {
  if (obj.removeEventListener) {
    obj.removeEventListener(evType, fn, useCapture);
    return true;
  } else if (obj.detachEvent) {
    return obj.detachEvent("on" + evType, fn);
  } else {
    alert("Handler could not be removed");
  }
}

addEvent(document, 'mousemove', getMouseXY);

function isEvent(object) {
  var isEvent = false;
  try {
    if (!isNullable(object)) {
      if (object.isEvent) {
        isEvent = true;
      } else {
        try {
          isEvent = (typeof object.preventDefault != "undefined");
        } catch (e) { }

        try {
          isEvent = (isEvent || typeof object.cancelBubble != "undefined");
        } catch (e) { }

        try {
          isEvent = (isEvent || typeof object.stopPropagation != "undefined");
        } catch (e) { }
      }
    }
  } catch (e) { }
  return isEvent;
}

var tempX = 0
var tempY = 0
var mX = 0
var mY = 0

function getMouseXY(e) {
  try {
    if (IE) {
      tempX = event.clientX + document.body.scrollLeft;
      tempY = event.clientY + document.body.scrollTop;
    } else {
      tempX = e.pageX;
      tempY = e.pageY;
    }

    if (tempX < 0) tempX = 0;
    if (tempY < 0) tempY = 0;

    mX = tempX;
    mY = tempY;

    if (IE) {
      tempX = tempX + window.screenLeft;
      tempY = tempY + window.screenTop;
    } else {
      tempX = tempX + window.screenX;
      tempY = tempY + window.screenY;
    }
  } catch (e) { }
  return true;
}

function addKeyEvent() {
  addEvent(document, 'keydown', keyEventHandler, false);
}

var clavier_un = -1;
var clavier_deux = -1;

function codeTouche(e) {
  var cret;
  if (window.event) {
    if (parseInt(clavier_deux) > 0) cret = clavier_deux;
    else cret = window.event.keyCode;
    if (window.event.type == "keypress") clavier_deux = window.event.keyCode;
    if (window.event.type == "keydown") clavier_deux = -1;
  } else {
    if (parseInt(clavier_deux) > 0) cret = clavier_deux;
    else if ((parseInt(clavier_un) > 0) && (e.which < 1)) cret = clavier_un;
    else cret = e.which;
    if (e.type == "keydown") {
      clavier_un = e.which;
      clavier_deux = -1;
    }
    if (e.type == "keypress") clavier_deux = e.which;
  }
  return (parseInt(cret));
}

var currentBrowser = {
  SpecialKeys: {
    27: 'esc',
    9: 'tab',
    32: 'space',
    13: 'return',
    8: 'backspace',
    145: 'scroll',
    20: 'capslock',
    144: 'numlock',
    19: 'pause',
    45: 'insert',
    36: 'home',
    46: 'del',
    35: 'end',
    33: 'pageup',
    34: 'pagedown',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    112: 'f1',
    113: 'f2',
    114: 'f3',
    115: 'f4',
    116: 'f5',
    117: 'f6',
    118: 'f7',
    119: 'f8',
    120: 'f9',
    121: 'f10',
    122: 'f11',
    123: 'f12'
  }
};

function keyEventHandler(evt) {
  var altKey, chr, ctrlKey, edit, eventReturn, insert, keyCode, nav, r, shiftKey, target;

  if (document.disableEvents) {
    document.disableEvents = false;
    return true;
  }

  altKey = false;
  ctrlKey = false;
  shiftKey = false;
  target = evt.target || evt.srcElement;
  keyCode = evt.keyCode || evt.which;
  chr = String.fromCharCode(keyCode).toUpperCase();

  if (w3c && document.layers) {
    altKey = ((evt.modifiers & Event.ALT_MASK) > 0);
    ctrlKey = ((evt.modifiers & Event.CONTROL_MASK) > 0);
    shiftKey = ((evt.modifiers & Event.SHIFT_MASK) > 0);
  } else {
    altKey = evt.altKey;
    ctrlKey = evt.ctrlKey;
    shiftKey = evt.shiftKey;
  }

  ctrlKey = navigator.platform.indexOf("Mac") !== -1 && evt.metaKey || ctrlKey; // Usa tecla comando para Mac e Ctrl para outros

  r = true;
  nav = mainform.document.n;
  insert = nav ? nav.insertMode : false;
  edit = nav ? nav.editMode : false;

  if (window.onkeyprezz) {
    // Verifica se alguma tecla F* foi pressionada para um tratamento diferenciado
    if (currentBrowser.SpecialKeys[keyCode]) {
      chr = currentBrowser.SpecialKeys[keyCode].toUpperCase();
    }

    eventReturn = window.onkeyprezz(altKey, ctrlKey, shiftKey, keyCode, chr);
    if (eventReturn === "CANCELEVENT") {
      if (evt.preventDefault) {
        evt.preventDefault();
        evt.stopPropagation();
      } else {
        window.onhelp = function() {
          event.returnValue = false;
        };

        evt.returnValue = false;
        evt.cancelBubble = true;
      }
      return false;
    }
  }

  if (!altKey && !ctrlKey && !shiftKey) { // Sem teclas modificadoras
    if (keyCode === 46) { // (Delete)
      try {
        if (controller && controller.getSelectedComponent()) {
          controller.getSelectedComponent().free();
        }
      } catch (e) {
        //não faz nada. Se tiver d problema ao pressionar del em telas que nao tem controller.
      }
    } else if (keyCode === 112) { // (F1)
      if (target && target.hint != null && !isNullable(target.hint)) {
        interactionInfo(target.hint, function() {
          try {
            target.focus();
          } catch (ex) {}
        });
      }
      r = false;
    } else if (keyCode === 113) { // (F2)
      try {
        if (controller && controller.getSelectedComponent() && controller.getSelectedComponent().onf2press) {
          controller.getSelectedComponent().onf2press(controller.getSelectedComponent(), evt);
        }
      } catch (e) {
        handleException(e);
      }
    } else if (keyCode === 116) { // (F5) Cadastro origem
      r = false;
    } else if (keyCode === 123) { // (F12) Teclas de operação
      if (nav.btHelp && nav.btHelp.click) {
        nav.btHelp.click();
      }
      r = false;
    } else if (keyCode === 27) { // (ESC) Cancelar operação
      if (insert) {
        if (nav.btIncludeCancel && nav.btIncludeCancel.click) {
          nav.btIncludeCancel.click();
        }
      } else if (edit) {
        if (nav.btEditCancel && nav.btEditCancel.click) {
          nav.btEditCancel.click();
        }
      }
      r = false;
      if (controller.activeElement) {
        controller.activeElement.blur();
      }
    } else if (keyCode === 33 && !insert && !edit) { // (Page Up) Próximo registro
      if (nav.btPrevious && nav.btPrevious.click) {
        nav.btPrevious.click();
      }
      r = false;
    } else if (keyCode === 34 && !insert && !edit) { // (Page Down) Registro Anterior
      if (nav.btNext && nav.btNext.click) {
        nav.btNext.click();
      }
      r = false;
    } else if (keyCode === 9 && !nav.editMode && !nav.insertMode) { // (Tab)
      r = false;
    }
  } else if (!altKey && ctrlKey && !shiftKey) { // Somente Ctrl pressionado
    if (chr === 'E') { // (Ctrl + E) Editar Registro
      if (!insert && !edit) {
        if (nav.btEdit && nav.btEdit.click) {
          nav.btEdit.click();
        }
      }
      r = false;
    } else if (keyCode === 45 || chr === 'I') { // (Ctrl + Insert ou Ctrl + I) Incluir Registro
      if (!insert && !edit) {
        if (nav.btInclude && nav.btInclude.click) {
          nav.btInclude.click();
        }
      }
      r = false;
    } else if (String.fromCharCode(keyCode) === 'S') { // (Ctrl + S) Gravar registro
      if (insert || edit) {
        mainform.parent.focus();
        mainform.focus();
        if (insert) {
          if (nav.btIncludeSave && nav.btIncludeSave.click) {
            nav.btIncludeSave.click();
          }
        }
        if (edit) {
          if (nav.btEditSave && nav.btEditSave.click) {
            nav.btEditSave.click();
          }
        }
        removeLookup(true);
      }
      r = false;
    } else if (String.fromCharCode(evt.keyCode) === 'G') { // (Ctrl + G) Gravar+
      if (insert || edit) {
        mainform.parent.focus();
        mainform.focus();
        if (insert) {
          controller.focusFirst();
          if (nav.btIncludeSaveMore && nav.btIncludeSaveMore.click) {
            nav.btIncludeSaveMore.click();
          }
        }
        if (edit) {
          if (nav.btEditSave && nav.btEditSave.click) {
            nav.btEditSave.click();
          }
        }
        removeLookup(true);
      }
      r = false;
    } else if ((keyCode === 46 || chr === 'D') && !insert && !edit) { // (Ctrl + Delete ou Ctrl + D) Excluir Registro
      if (nav.btDelete && nav.btDelete.click) {
        nav.btDelete.click();
      }
      r = false;
    } else if (chr === 'F' || chr === 'L') { // (Ctrl + F ou Ctrl + L) Consultar cadastro
      if (!insert && !edit && nav.tabController) {
        nav.tabController.openSearchTab();
      }
      r = false;
    } else if (chr === 'K') { // (Ctrl + K) Primeira Aba
      if (!insert && !edit) {
        if (nav.tabController && nav.tabController.tabs[0] && nav.tabController.tabs[0].clickAction) {
          nav.tabController.tabs[0].clickAction();
        }
      }
      r = false;
    } else if (chr === 'P') { // (Ctrl + P) Imprimir
      if (nav.btPrint && nav.btPrint.click) {
        nav.btPrint.click();
      }
      r = false;
    } else if (keyCode === 36 && !insert && !edit) { // (Ctrl + Home) Primeiro registro
      if (nav.btFirst && nav.btFirst.click) {
        nav.btFirst.click();
      }
      r = false;
    } else if (keyCode === 35 && !insert && !edit) { // (Ctrl + End)último registro
      if (nav.btLast && nav.btLast.click) {
        nav.btLast.click();
      }
      r = false;
    } else if (chr === 'M') { // (Ctrl + M) Ajax: último codigo recebido
      if (d.n.developmentMode) { // caso em desenvolvimento mostra o ultimo codigo recebido
        interactionInfo('<textarea style="width:400px;height:150px">' + lastReceivedContent + '</textarea>');
      }

      r = false;
    } else if (chr === 'J') { // (Ctrl + J) Ajax: último tempo carregando
      if (d.n.developmentMode) { // caso em desenvolvimento mostra o tempo para carregar
        controller.showLoadTime();
      }

      r = false;
    }
  } else if (!altKey && ctrlKey && shiftKey) { // Ctrl + Shift pressionados
    if (chr === 'C' && nav.btDefaultValues && nav.btDefaultValues.click) { // (Ctrl + C)
      nav.btDefaultValues.click();
    }

    r = false;
  } else if (altKey && !ctrlKey && !shiftKey) { // Somente Alt pressionado
    if (chr === 'A') { // (Alt + A) Atualizar registros
      if (nav.btRefresh && nav.btRefresh.click) {
        nav.btRefresh.click();
      }

      r = false;
      removeLookup(true);
    }
  }

  if (!r) {
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      window.onhelp = function() {
        event.returnValue = false;
      };

      try { evt.keyCode = 0; } catch (e) { }
      evt.returnValue = false;
      evt.cancelBubble = true;
    }

    return false;
  } else {
    return true;
  }
}

function removeLookup(v) {
  try { HTMLLookup.prototype.removeLookup(v); } catch (e) { }
}

function openFormulaEditor(theURL) {
  var width = (4 * screen.width) / 5;
  var height = screen.height;
  var left = (screen.width - width) / 2;

  MM_openBrWindow(theURL, 'FormulaEditor', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=' + width + ',height=' + height + ',left=' + left + ',top=0');
}

function openProfile(theURL) {
  openFullScreen(theURL, 'Profile');
}

function openFullScreen(theURL, winName) {
  MM_openBrWindow(theURL, winName, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=' + screen.width + ',height=' + screen.height + ', left=0,top=0');
}

function openWindow(theURL, winName) { // v2.0
  l = (2 * screen.width) / 3;
  t = screen.height;
  MM_openBrWindow(theURL, winName, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=' + l + ',height=' + t);
}

function MM_setTextOfLayer(objName, x, newText) { // v4.01
  if ((obj = MM_findObj(objName)) != null) with(obj)
  if (document.layers) {
    document.write(unescape(newText));
    document.close();
  } else innerHTML = unescape(newText);
}

function getOpenerWindow(pWindow) {
  var openerWindow;
  if (pWindow && (pWindow.isPopup || pWindow.$mainform().isPopup)) {
    try {
      if (pWindow.dialogArguments) {
        var values = pWindow.dialogArguments;
        openerWindow = values.parentWindow;
        if (openerWindow) {
          return openerWindow;
        }
      }

      if (pWindow.parent && pWindow.parent.opener) {
        openerWindow = pWindow.parent.opener;
      } else {
        openerWindow = pWindow.opener;
      }

      if (openerWindow && openerWindow.parent) {
        openerWindow = openerWindow.parent;
      }

      return openerWindow;
    } catch (e) { }
  } else {
    try { return getFloatingFormWindowParentById(pWindow.idForm); } catch (e) { }
  }

  return null;
}

function arrayRemove(array, value) {
  var i = arrayIndexOf(array, value);
  if (i != -1) array.splice(i, 1);
}

function arrayIndexOf(array, value, type) {
  var isNumber = type == 'number' || type == 'double' || type == "integer" || type == "float";
  if (isNumber) {
    try { value = parseFloat(value); }
    catch (e) { isNumber = false; }
  }

  var found = false;
  var index = 0;
  while (!found && array && index < array.length) {
    var v2 = array[index];
    if (isNumber) { try { v2 = parseFloat(v2); } catch (e) { } }
    if (value == v2) found = true;
    else index++;
  }

  return (found) ? index : -1;
}

if (!window.windowOpenFunction) {
  window.windowOpenFunction = window.open;
  window.open = function(theURL, winName, features) {
    if (theURL && theURL.toLowerCase().indexOf("form" + PAGES_EXTENSION.toLowerCase()) >= 0) {
      theURL += "&popup=true";
    }

    var p;
    var w = window.windowOpenFunction(theURL, winName, features);
    if (!w) {
      try {
        throw new Error(getLocaleMessage("ERROR.BLOCKED_POPUP"));
      } catch (e) {
        var msg = new mainform.HTMLMessage();
        msg.showErrorMessage("", mainform.getLocaleMessage("ERROR.BLOCKED_POPUP"), 5, null);
        return;
      }
    }

    w.isPopup = true;
    if (window.isPrincipal) {
      w.principal = $mainform().principal;
    } else if (top.principal) {
      w.principal = top.principal;
    } else {
      w.principal = parent.principal;
    }

    p = getOpenerWindow(w);
    if ($mainform().disableCloseChildren) return w;
    if (p && location.href.indexOf("comaccess" + PAGES_EXTENSION) === -1) {
      if (!p.children) p.children = [];
      try { p.children.push(w); } catch (e) { }
    }

    return w;
  };
}

if (frameElement !== null && frameElement.name === "mainform") {
  window.closeChildrenForms = true;
}

function closeParents() {
  var i, p;
  if (window.children && mainform.closeChildrenForms === true) {
    for (i = 0; i < window.children.length; i++) {
      try { window.children[i].close(); } catch (e) { }
      try {
        p = getOpenerWindow(window);
        if (p && p.children) arrayRemove(window.children, window);
      } catch (e) { }
      if (!window.children) break;
    }
  }
}

window.closeFormAndChildren = function() {
  window.closeParents();
  window.removeCurrentWindowFromOpener();
};

window.removeChild = function(windowReference) {
  arrayRemove(window.children, windowReference);
};

if (!window.onUnloadWrapped) {
  window.onUnloadWrapped = true;
  if (window.onunload) window.windowOnUnload = window.onunload;
  window.onunload = function(e) {
    window.closeParents();
    if (window.windowOnUnload) {
      window.windowOnUnload(e);
    }
  }
}

window.removeCurrentWindowFromOpener = function() {
  try {
    var p = getOpenerWindow(window);
    if (p && p.children) {
      arrayRemove(p.children, window);
      for (var i = 0; i < p.children.length; i++) {
        if (p.children[i].location == null) {
          arrayRemove(p.children, p.children[i]);
        }
      }

      if (p.children.length == 0) p.children = null;
    }
  } catch (e) { }
};

/**
 * Obtém um Código aleatório.
 * Método utilizado principalmente nas funções de criação dos elementos do Bootstrap.
 * @author Danilo Gadêlha.
 */
function getRandomCode() {
  return Math.floor(Math.random() * 1000000) + 1
}

/**
 * Cria um modal do Bootstrap.
 * @author Danilo Gadêlha.
 * @param title - (Opcional) Título do modal.
 * @param closeable - (Opcional) Valor lógico indicando se o modal é fechável.
 * @param bodyContent - (Opcional) conteúdo HTML do corpo do modal.
 * @param footerContent - (Opcional) conteúdo HTML do rodapé do modal.
 * @param attributes - (Opcional) Array de atributos para serem adicionados a div principal do modal.
 * @param parent - (Opcional) Elemento onde o modal será inserido.
 * @param autoShow - (Opcional) Valor lógico indicando se o modal deve ser exibido logo após a sua criação.
 * @param autoDispose - (Opcional) Valor lógico indicando se o modal é deletado automaticamente ao fechar.
 * @return Retorna um array com os elementos: Modal (0), Cabeçalho (1), Corpo (2), Rodapé (3), Diálogo (4) e Código (5).
 */
function bootstrapCreateModal(title, closeable, bodyContent, footerContent, attributes, parent, autoShow, autoDispose) {
  var modalCode = getRandomCode();

  // Criar elemento base do modal do Bootstrap.
  var modal = document.createElement("div");
  modal.className = "modal fade"; // Bootstrap
  modal.id = "modal" + modalCode;
  modal.tabIndex = "-1";
  modal.setAttribute("role", "dialog");

  var modalDialog = document.createElement("div");
  modalDialog.className = "modal-dialog modal-dialog-centered"; // Bootstrap
  modalDialog.setAttribute("role", "document");
  modal.appendChild(modalDialog);

  var modalContent = document.createElement("div");
  modalContent.className = "modal-content"; // Bootstrap
  modalContent.setAttribute("role", "document");
  modalDialog.appendChild(modalContent);

  // Criar cabeçalho do modal.
  var modalHeader = document.createElement("div");
  modalHeader.className = "modal-header"; // Bootstrap
  modalContent.appendChild(modalHeader);

  // Verificar se o modal possui título.
  if (title && title.length && title.length > 0) {
    // Criar elemento do título do modal.
    var modalTitle = document.createElement("h5");
    modalTitle.className = "modal-title"; // Bootstrap
    modalTitle.innerHTML = title;
    modalHeader.appendChild(modalTitle);
  }

  // Verificar se o modal é fechável.
  if (closeable === true || closeable === "true") {
    // Obter o texto de fechar modal.
    var closeText;
    try { closeText = safeGetLocaleMessage("LABEL.CLOSE"); }
    catch(e) { closeText = "Fechar"; }

    // Criar botão de fechar o modal.
    var modalClose = document.createElement("button");
    modalClose.type = "button";
    modalClose.className = "close"; // Bootstrap
    modalClose.setAttribute("data-dismiss", "modal"); // Bootstrap
    modalClose.setAttribute("aria-label", closeText); // Accessibility
    modalHeader.appendChild(modalClose);

    var modalCloseSpan = document.createElement("span");
    modalCloseSpan.setAttribute("aria-hidden", "true"); // Accessibility
    modalCloseSpan.innerHTML = "&times;";
    modalClose.appendChild(modalCloseSpan);
  }

  // Criar corpo do modal.
  var modalBody = document.createElement("div");
  modalBody.className = "modal-body"; // Bootstrap
  if (bodyContent) modalBody.innerHTML = bodyContent;
  modalContent.appendChild(modalBody);

  // Criar rodapé do modal.
  var modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer"; // Bootstrap
  if (footerContent) modalFooter.innerHTML = footerContent;
  modalContent.appendChild(modalFooter);

  if (attributes) {
    for (var i = 0; i < attributes.length; i++) {
      var currentAttribute = attributes[i];
      modal.setAttribute(currentAttribute[0], currentAttribute[1]);
    }
  }

  if (parent) parent.appendChild(modal);
  else document.body.appendChild(modal);

  if (autoDispose !== false && autoDispose !== "false") {
    $(modal).on("hidden.bs.modal", function (e) {
      $(this).modal("dispose");
      $(this).remove();
    });
  }

  if (autoShow !== false && autoShow !== "false") {
    bootstrapShowModal(modal);
  }

  return [modal, modalHeader, modalBody, modalFooter, modalDialog, modalCode];
}

/**
 * Abre um modal do Bootstrap.
 * @author Danilo Gadêlha.
 * @param modal - Referência para o elemento principal do modal.
 */
function bootstrapShowModal(modal) {
  try {
    if (modal) $(modal).modal('show');
  } catch (e) { }
}

/**
 * Fecha um modal do Bootstrap.
 * @author Danilo Gadêlha.
 * @param modal - Referência para o elemento principal do modal.
 */
function bootstrapCloseModal(modal) {
  try {
    if (modal) $(modal).modal('hide');
  } catch (e) { }
}

/**
 * Cria um spinner do Bootstrap.
 * @author Danilo Gadêlha.
 * @param parent - (Opcional) Elemento onde o spinner será inserido.
 * @param additionalClass - (Opcional) Classes adicionais para serem inseridas no elemento do spinner.
 * @param overlay - (Opcional) Boolean indicando se o spinner deve ser criado como overlay.
 * @return Retorna um array com os elementos: Spinner (0) e Código (1).
 */
function bootstrapCreateSpinner(parent, additionalClass, overlay, props) {
  var parentElement = parent;
  var spinnerCode = getRandomCode();

  // Verificar se o spinner é overlay.
  if (overlay) {
    // Criar div de overlay.
    var overlayDiv = document.createElement("div");
    overlayDiv.className =
      (props && props.position == "fixed" ? "position-fixed" : "position-absolute") + " " + // Bootstrap
      (props && props.useViewportWidth ? "vw-100" : "w-100") + " " + // Bootstrap
      (props && props.useViewportHeight ? "vh-100" : "h-100") + // Bootstrap
      " d-flex align-items-center justify-content-center"; // Bootstrap
    overlayDiv.id = "spinner" + spinnerCode;
    overlayDiv.style.top = "0px";
    overlayDiv.style.bottom = "0px";
    overlayDiv.style.left = "0px";
    overlayDiv.style.right = "0px";
    overlayDiv.style.zIndex = 10000000;
    if (parent) parent.appendChild(overlayDiv);
    parentElement = overlayDiv;
  }

  // Criar div do spinner do Bootstrap.
  var spinnerDiv = document.createElement("div");
  spinnerDiv.className = "spinner-border"; // Bootstrap
  if (!overlay) spinnerDiv.id = "spinner" + spinnerCode;
  if (additionalClass && additionalClass.length > 0)
    spinnerDiv.className += " " + additionalClass;
  spinnerDiv.setAttribute("role", "status");
  if (parentElement) parentElement.appendChild(spinnerDiv);

  // Obter o texto de carregando.
  var loadingText;
  try { loadingText = $mainform().getLocaleMessage("LABEL.LOADING") + "..."; }
  catch(e) { loadingText = "..."; }

  // Criar span de acessibilidade do spinner.
  var spinnerSpan = document.createElement("span");
  spinnerSpan.className = "sr-only"; // Bootstrap
  spinnerSpan.innerHTML = loadingText;
  spinnerDiv.appendChild(spinnerSpan);

  // Definir elemento raiz.
  var rootElement = overlay ? parentElement : spinnerDiv;

  // Verificar por anima??o.
  if (props && props.animation) {
    switch (props.animation.toLowerCase()) {
      case "fade": {
        $(rootElement).hide();
        if (props.animationDuration) $(rootElement).fadeIn(props.animationDuration);
        else $(rootElement).fadeIn();
        break;
      }
    }
  }

  return [rootElement, spinnerCode];
}

/**
 * Retorna um valor lógico indicando se é um dispositivo com tela muito pequena.
 * O critério utilizado é o do Bootstrap (https://getbootstrap.com/docs/4.3/layout/overview/).
 * @author Danilo Gadêlha.
 */
function bootstrapIsExtraSmallDevice(w) {
  // Extra small devices (portrait phones, less than 576px)
  return (w ? w : window).matchMedia("(max-width: 575.98px)").matches;
}

/**
 * Retorna um valor lógico indicando se é um dispositivo com tela pequena.
 * O critério utilizado é o do Bootstrap (https://getbootstrap.com/docs/4.3/layout/overview/).
 * @author Danilo Gadêlha.
 */
function bootstrapIsSmallDevice(w) {
  // Small devices (landscape phones, less than 768px)
  return (w ? w : window).matchMedia("(max-width: 767.98px)").matches;
}

/**
 * Retorna um valor lógico indicando se é um dispositivo com tela de tamanho médio.
 * O critério utilizado é o do Bootstrap (https://getbootstrap.com/docs/4.3/layout/overview/).
 * @author Danilo Gadêlha.
 */
function bootstrapIsMediumDevice(w) {
  // Medium devices (tablets, less than 992px)
  return (w ? w : window).matchMedia("(max-width: 991.98px)").matches;
}

/**
 * Retorna um valor lógico indicando se é um dispositivo com tela grande.
 * O critério utilizado é o do Bootstrap (https://getbootstrap.com/docs/4.3/layout/overview/).
 * @author Danilo Gadêlha.
 */
function bootstrapIsLargeDevice(w) {
  // Large devices (desktops, less than 1200px)
  return (w ? w : window).matchMedia("(max-width: 1199.98px)").matches;
}

/**
 * Inicializa um tooltip do Bootstrap.
 * @param element Referência para o elemento ou uma HTML query string para localizá-lo (ex: #MakerButton1).
 * @param triggerMode (Opcional) Modo de trigger do tooltip.
 * @param showDelay (Opcional) Delay de exibição do tooltip, em milissegundos (padrão: 500).
 * @param hideDelay (Opcional) Delay de ocultação do tooltip, em milissegundos (padrão: 0).
 * @author Danilo Gadêlha.
 */
function bootstrapInitTooltip(element, triggerMode, showDelay, hideDelay) {
  try {
    $(element).tooltip({
      delay: {
        "show": showDelay ? showDelay : 500,
        "hide": hideDelay ? hideDelay : 0
      },

      trigger: triggerMode ? triggerMode : "hover"
    });
  } catch (e) { }
}

/**
 * Fecha um tooltip do Bootstrap.
 * @param element Referência para o elemento ou uma HTML query string para localizá-lo (ex: #MakerButton1).
 * @author Danilo Gadêlha.
 */
function bootstrapCloseTooltip(element) {
  try {
    $(element).tooltip("hide");
  } catch (e) { }
}

/**
 * Abre um dropdown do Bootstrap.
 * @param element Referência para o elemento ou uma HTML query string para localizá-lo (ex: #MakerButton1).
 * @author Danilo Gadêlha.
 */
function bootstrapOpenDropdown(element) {
  try {
    $(element).dropdown("show");
  } catch (e) { }
}

/**
 * Fecha um dropdown do Bootstrap.
 * @param element Referência para o elemento ou uma HTML query string para localizá-lo (ex: #MakerButton1).
 * @author Danilo Gadêlha.
 */
function bootstrapCloseDropdown(element) {
  try {
    $(element).dropdown("hide");
  } catch (e) { }
}

/**
 * Exibe o modal de sessão perdida.
 * @author Danilo Gadêlha.
 */
function showSessionLostModal(message, showLoginButton) {
  if (document.getElementById("modal-session-expired")) return;

  // Verificar se o documento possui corpo.
  if (!document.body) {
    document.writeln("<body></body>");
  }

  // Criar elemento base do modal do Bootstrap.
  var modal = document.createElement("div");
  modal.className = "modal fade"; // Bootstrap
  modal.id = "modal-session-expired";
  modal.tabIndex = "-1";
  modal.setAttribute("role", "dialog");
  document.body.appendChild(modal);

  var modalDialog = document.createElement("div");
  modalDialog.className = "modal-dialog modal-dialog-centered"; // Bootstrap
  modalDialog.setAttribute("role", "document");
  modal.appendChild(modalDialog);

  var modalContent = document.createElement("div");
  modalContent.className = "modal-content bg-dark shadow"; // Bootstrap
  modalContent.setAttribute("role", "document");
  modalDialog.appendChild(modalContent);

  // Criar corpo do modal.
  var modalBody = document.createElement("div");
  modalBody.className = "modal-body"; // Bootstrap
  modalContent.appendChild(modalBody);

  var contentDiv = document.createElement("div");
  contentDiv.className = "d-flex flex-column align-items-center justify-content-center text-center p-4"; // Bootstrap
  modalBody.appendChild(contentDiv);

  // Criar ícone do modal.
  var modalIcon = document.createElement("i");
  modalIcon.className = "fas fa-lock text-light"; // Font Awesome - Bootstrap
  modalIcon.style.fontSize = "4rem";
  contentDiv.appendChild(modalIcon);

  // Criar título do modal.
  var modalTitle = document.createElement("h5");
  modalTitle.className = "mw-100 text-wrap break-word mt-4 mb-3 text-light"; // Bootstrap
  modalTitle.innerHTML = message;
  contentDiv.appendChild(modalTitle);

  // Verificar se a função de alterar usuário está definida no escopo da página.
  var sys = null;
  if (!window.ebfSystemChangeUser) {
    // Verificar se o código do sistema está definido no escopo da página.
    if (window.sysCode) {
      // Tentar obter o código do sistema.
      try { sys = window.sysCode.trim().toUpperCase(); }
      catch (e) { sys = null; }
    }

    if (!sys || sys.length == 0) {
      try {
        // Tentar obter o código do sistema através da URL.
        var urlParams = getAllUrlParams();
        if (urlParams && urlParams.sys) sys = urlParams.sys.trim().toUpperCase();
      } catch (e) { sys = null; }
    }
  }

  if (showLoginButton !== false && (window.ebfSystemChangeUser || (sys && sys.length > 0))) {
    // Obter o texto de fechar modal.
    var backToLoginText;
    try { backToLoginText = $mainform().getLocaleMessage("INFO.BACK_TO_LOGIN"); }
    catch(e) { backToLoginText = "Voltar para a tela de login"; }

    // Criar botão de voltar para a tela de login.
    var loginButton = document.createElement("button");
    loginButton.type = "button";
    loginButton.className = "btn btn-light mt-2"; // Bootstrap
    loginButton.innerHTML = backToLoginText;
    contentDiv.appendChild(loginButton);

    loginButton.onclick = function() {
      if (window.ebfSystemChangeUser) {
        window.ebfSystemChangeUser();
      } else if (sys && sys.length > 0) {
        var win = top;
        if (parent.opener) {
          win = parent.opener.top;
        } else if (getOpenerWindow(top)) {
          win = getOpenerWindow(top).top;
        }

        win.document.location.href = "open.do?sys=" + sys.toUpperCase();
      }
    };
  }

  try {
    // Inicializar o modal do Bootstrap.
    $(modal).modal({
      // Exibir o modal após a inicialização.
      show: true,

      // Focar o modal após a inicialização.
      focus: true,

      // Desativar teclas de atalho para não permitir o modal de fechar.
      keyboard: showLoginButton === false,

      // Definir backdrop como estático para não fechar o modal ao clicar.
      backdrop: showLoginButton === false ? true : "static"
    });
  } catch (e) { }
}

/**
 * Obter os parâmetros de uma URL.
 * @param url (Opcional) URL para obter os parâmetros.
 */
function getAllUrlParams(url) {
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  var obj = { };
  if (queryString) {
    queryString = queryString.split('#')[0];
    var arr = queryString.split('&');
    for (var i = 0; i < arr.length; i++) {
      var a = arr[i].split('=');
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
      if (paramName.match(/\[(\d+)?\]$/)) {
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];
        if (paramName.match(/\[\d+\]$/)) {
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          obj[key].push(paramValue);
        }
      } else {
        if (!obj[paramName]) {
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}

function MM_openBrWindow(theURL,winName,features) { //v2.0
  if (winName) winName = winName.toString().replace(/\(|\)/g, "_");
  var w = window.open(theURL, winName ? winName : "", features);
  try {
    if (w) {
      if (w.setFocus) w.setFocus();
      else w.focus();
    }
  } catch (ex) { }
  return w;
}

function isWindow(obj) {
  if (typeof(window.constructor) === 'undefined') {
    return obj instanceof window.constructor;
  } else {
    return obj.window === obj;
  }
}

function MM_findObj(n, d) { // v4.01
  var p, i, x;
  if (!d) d = document;

  if ((p = n.indexOf("?")) > 0 && parent.frames.length) {
    d = parent.frames[n.substring(p + 1)].document;
    n = n.substring(0, p);
  }

  if (!(x = d[n]) && d.all) x = d.all[n];

  for (i = 0; !x && i < d.forms.length; i++)
    x = d.forms[i][n];

  for (i = 0; !x && d.layers && i < d.layers.length; i++)
    x = MM_findObj(n, d.layers[i].document);

  if (!x && d.getElementById) x = d.getElementById(n);

  return x;
}

function MM_showHideLayers() { //v6.0
  var i, p, v, obj, args = MM_showHideLayers.arguments;
  for (i = 0; i < (args.length - 2); i += 3) {
    if ((obj = MM_findObj(args[i])) != null) {
      v = args[i + 2];
      if (obj.style) {
        obj = obj.style;
        v = (v == 'show') ? 'visible' : (v == 'hide') ? 'hidden' : v;
      }

      obj.visibility = v;
    }
  }
}

function visibility(obj, v) {
  if (obj.style) {
    obj = obj.style;
    v = (v == 'show') ? 'visible' : (v == 'hide') ? 'hidden' : v;
  }

  obj.visibility = v;
}


function MM_changeProp(objName, x, theProp, theValue) { //v6.0
  var obj = MM_findObj(objName);
  if (obj && (theProp.indexOf("style.") == -1 || obj.style)) {
    if (theValue == true || theValue == false)
      eval("obj." + theProp + "=" + theValue);
    else eval("obj." + theProp + "='" + theValue + "'");
  }
}

function ruleOpenForm(id, frm, w, h, mode) {
  var left = (parent.screen.width - w) / 2;
  var top = (parent.screen.height - h - 60) / 2;
  var win = MM_openBrWindow('form' + PAGES_EXTENSION + '?sys=' + id + '&action=openform&formID=' + URLEncode(frm, "GET") + '&align=0&goto=-1&filter=&mode=' + mode, frm, 'toolbar=no,location=no,status=yes,menubar=no,scrollbars=no,resizable=no,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
  win.doOnLoad = true;
  win.focus();
}

function showFormHelp(id, frm) {
  openFloatingUrl("helpform" + PAGES_EXTENSION +
    "?sys=" + id +
    "&formID=" + URLEncode(frm, "GET"),
    "WFRHELPFORM", safeGetLocaleMessage("LABEL.HELP"), 300, 360, null, false, true);
}

function getPath(url) {
  var regexS = "(.*/).*\\?.*";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  if (results == null) return "";
  else return results[1];
}

var mainSystemFrame;
try {
  mainSystemFrame = top.frames["mainsystem"];
  mainSystemFrame = (mainSystemFrame === undefined) ? top : mainSystemFrame;
} catch (e) { }

var closeFloatingFormById, closeFormHierarchy;
closeFloatingFormById = closeFormHierarchy = function(formId) {
  var mainSystemFrame = window.mainSystemFrame || top;

  // Verificar se o ID não possui o prefixo "WFRIframeForm".
  if (formId && formId.toString().indexOf("WFRIframeForm") !== 0) {
    formId = "WFRIframeForm" + formId;
  }

  // Procurar pelos elementos do backdrop do formulário flutuante.
  try {
    var modalDiv = mainSystemFrame.document.getElementById("WFRModalDiv" + formId.substring(13));
    if (modalDiv) modalDiv.parentNode.removeChild(modalDiv);
  } catch (e) { }

  // Procurar pelos elementos do backdrop dos modals relacionados ao formulário flutuante.
  var formHierarchy = mainSystemFrame.formHierarchy;
  if (formHierarchy && formHierarchy[formId]) {
    for (var i = 0; i < formHierarchy[formId].length; i++) {
      var divChild = formHierarchy[formId][i];
      modalDiv = mainSystemFrame.document.getElementById("WFRModalDiv" + divChild.substring(13));
      if (modalDiv) modalDiv.parentNode.removeChild(modalDiv);
    }
  }

  // Procurar pelo elemento do formulário flutuante.
  var formDiv = mainSystemFrame.document.getElementById(formId);

  // Procurar pelo mainform do formulário.
  var mainform = null;
  if (formDiv) {
    var formDivFrames = formDiv.getElementsByTagName("iframe");
    if (formDivFrames.length > 0 && formDiv.hasAttribute("webrun-floating-type") && formDiv.getAttribute("webrun-floating-type").toLowerCase() == "form") {
      mainform = formDivFrames[0].contentWindow.mainform;
    }
  }

  if (!mainform) mainform = $mainform().mainform;

  // Obter a div de formulários minimizados.
  var minimizedDivs = mainSystemFrame.document.getElementById("minimizedFloatingDivs");

  try {
    // Verificar se a hierarquia de formulários associada ao formulário deve ser fechada.
    if (mainform.closeChildrenForms === true) {
      // Fechar formulários filhos.
      closeFloatingFormChilds(formId);
    }

    // Remover formulário da hierarquia de formulários.
    removeFormFromHierarchy(formId);
  } catch (e) { }

  if (formDiv) {
    // Chamar método de antes de fechar formulário flutuante.
    if (formDiv.beforeClose) formDiv.beforeClose();

    // Procurar pelo elemento do formulário minimizado.
    var minimizedDiv = mainSystemFrame.document.getElementById("Min" + formDiv.id);
    if (minimizedDiv) {
      if (minimizedDivs) minimizedDivs.removeChild(minimizedDiv);
      else minimizedDiv.parentElement.removeChild(minimizedDiv);
      minimizedDiv = null;
    }

    // Remover o formulário flutuante da página.
    formDiv.parentNode.removeChild(formDiv);

    // Chamar método de finalização do formulário flutuante.
    if (formDiv.finalizeClose) formDiv.finalizeClose();
  }

  try {
    // Remover formulário da lista de formulários flutuantes.
    mainSystemFrame.floatingForms.remByVal(formId);
  } catch (e) { }
};

function closeFloatingFormChilds(formParent) {
  // Verificar se o ID não possui o prefixo "WFRIframeForm".
  if (formParent && formParent.toString().indexOf("WFRIframeForm") !== 0) {
    formParent = "WFRIframeForm" + formParent;
  }

  if (mainSystemFrame && mainSystemFrame.formHierarchy &&
      mainSystemFrame.formHierarchy.hasOwnProperty(formParent)) {

    var children = mainSystemFrame.formHierarchy[formParent];
    if (children && children.length > 0) {
      for (var i = 0; i < children.length; i++) {
        // Fechar hierarquia de formulários.
        closeFormHierarchy(children[i]);
      }
    }

    try {
      // Deletar referência do formulário da hierarquia.
      delete mainSystemFrame.formHierarchy[formParent];
    } catch (e) { }
  }
}

function getFloatingFormDivById(formId) {
  // Verificar se o ID não possui o prefixo "WFRIframeForm".
  if (formId && formId.toString().indexOf("WFRIframeForm") !== 0) {
    formId = "WFRIframeForm" + formId;
  }

  return mainSystemFrame.document.getElementById(formId);
}

function getFloatingFormDocumentById(formId) {
  return getFloatingFormDivById(formId).getElementsByTagName("iframe")[0].contentDocument;
}

function getFloatingFormWindowById(formId) {
  return getFloatingFormDivById(formId).getElementsByTagName("iframe")[0].contentWindow;
}

function getFloatingFormWindowParentById(formId) {
  if (formId == null) return null;
  for (var i = 0; i < mainSystemFrame.floatingForms.length; i++) {
    var children = mainSystemFrame.formHierarchy[mainSystemFrame.floatingForms[i]];
    if (children) {
      for (var j = 0; j < children.length; j++) {
        if (children[j] == "WFRIframeForm" + formId) {
          return getFloatingFormWindowById(mainSystemFrame.floatingForms[i]).mainform;
        }
      }
    }
  }

  return mainSystemFrame;
}

function openFloatingUrl(url, divName, divDescription, width, height, divClass, modal, resizable, maximizable, iconHeader) {
  return openFloatingForm({
    url: url,
    form: (divName ? divName : "Floating") + "-" + getRandomCode(),
    width: width,
    height: height,
    modal: modal,
    resizable: resizable,
    maximizable: maximizable,
    description: divDescription ? encodeURIComponent(divDescription) : "",
    customClass: divClass && divClass.length > 0 ? divClass : null,
    iconHeader: iconHeader
  });
}

function openFloatingForm(properties) {
  var isForm = false;
  var isMinimized = false;
  var isClosed = false;

  const onClose = properties.advancedProps ? Boolean(properties.advancedProps.onClose) : null;
  if (onClose) {
    properties.onClose = onClose;
    properties.jsonProperties = JSON.stringify(properties.advancedProps.jsonProperties);
  }

  if (!properties.url) {
    properties.url = 'form' + PAGES_EXTENSION + '?sys=' + properties.sys + '&action=openform&formID=' + properties.form 
          + '&align=0' + (!isNullable(properties.mode) ? '&mode=' + properties.mode : '') 
          + '&goto=' + (!isNullable(properties.gotoRow) ? properties.gotoRow : -1) 
          + '&filter=' + (!isNullable(properties.filter) ? properties.filter : '') 
          + '&scrolling=' + (properties.scrollbars ? 'yes' : 'no') 
          + (!isNullable(properties.onClose) ? '&onClose=' + properties.onClose : '') 
          + (!isNullable(properties.jsonProperties) ? '&jsonProperties=' + URLEncode(properties.jsonProperties, 'GET') : '');
    isForm = true;
  }

  // Incializar variáveis para gerenciamento das janelas flutuantes.
  if (mainSystemFrame) {
    if (!mainSystemFrame.floatingForms) mainSystemFrame.floatingForms = [ ];
    if (!mainSystemFrame.formHierarchy) mainSystemFrame.formHierarchy = { };
    if (!mainSystemFrame.lastFormZindex) mainSystemFrame.lastFormZindex = 100001;
  }

  // Verificar se está no modo desenvolvedor.
  var isDevelopmentMode = false;
  if (typeof d !== "undefined") {
    isDevelopmentMode = d.n.developmentMode;
  } else if (typeof principal !== "undefined" && principal && principal.d) {
    isDevelopmentMode = principal.d.n.developmentMode;
  } else if ($mainform() && $mainform().principal) {
    isDevelopmentMode = $mainform().principal.d.n.developmentMode;
  } else if ($mainform()) {
    isDevelopmentMode = $mainform().d
      ? ($mainform().d.n ? $mainform().d.n.developmentMode : false)
      : ($mainform().mainform && $mainform().mainform.d && $mainform().mainform.d.n) ? $mainform().mainform.d.n.developmentMode : false;
  }

  // Remover classe de janela ativa caso algum elemento possua.
  var activeForms = mainSystemFrame.document.getElementsByClassName("WFRIframeForm-Active");
  if (activeForms.length > 0) activeForms[0].className = activeForms[0].className.replace(" WFRIframeForm-Active", "");

  // Criar div principal da janela flutuante.
  var formDiv = mainSystemFrame.document.createElement("div");
  formDiv.id = "WFRIframeForm" + properties.form;
  formDiv.modal = properties.modal;
  formDiv.className = "card shadow border position-absolute WFRIframeForm WFRIframeForm-Active"; // Bootstrap
  if (properties.customClass) formDiv.className += " " + properties.customClass.trim();
  formDiv.setAttribute("webrun-floating-type", isForm ? "form" : "url");

  // Evento para remover as classes das janelas flutuantes selecionadas ao clicar no fundo da página.
  if (!$mainform().document.mousedownfloating) {
    $mainform().document.mousedownfloating = true;
    $mainform().document.addEventListener("mousedown", function() {
      var activeForms = mainSystemFrame.document.getElementsByClassName("WFRIframeForm-Active");
      if (activeForms.length > 0) activeForms[0].className = activeForms[0].className.replace(" WFRIframeForm-Active", "");
    }, true);
  }

  // Função para verificar se a janela está ativa.
  var isFormActive = function() {
    return formDiv && formDiv.className.indexOf("WFRIframeForm-Active") != -1;
  };

  // Evento para adicionar uma classe que destacará a janela flutuante selecionada.
  var focusDiv = function() {
    if (!isClosed && !isFormActive()) {
      // Incrementar z-index do formulário flutuante.
      formDiv.style.zIndex = ++mainSystemFrame.lastFormZindex;

      // Procurar por formulários ativos no contexto.
      var activeForms = mainSystemFrame.document.getElementsByClassName("WFRIframeForm-Active");
      if (activeForms.length > 0) {
        for (var i = 0; i < activeForms.length; i++) {
          // Remover classe de formulário ativo.
          try { activeForms[i].getElementsByTagName("iframe")[0].contentWindow.document.getElementsByTagName("iframe")[0].contentWindow.document.activeElement.blur(); } catch (e) { }
          try { activeForms[i].className = activeForms[i].className.replace(" WFRIframeForm-Active", ""); } catch (e) { }
        }
      }

      // Adicionar classe de formulário ativo.
      formDiv.className += " WFRIframeForm-Active";
    }
  };

  // Criar div do cabeçalho da janela.
  var formHeaderDiv = mainSystemFrame.document.createElement("div");
  formHeaderDiv.className = "card-header bg-light p-0 d-flex flex-row"; // Bootstrap
  formHeaderDiv.targetAction = "move";

  // Criar div do título/descrição da janela.
  var title = mainSystemFrame.document.createElement("h6");
  title.className = "d-flex align-items-center my-0 mr-auto overflow-hidden"; // Bootstrap
  title.style.setProperty("user-select", "none");
  title.style.setProperty("-moz-user-select", "none");
  title.style.setProperty("-webkit-user-select", "none");
  title.style.setProperty("-ms-user-select", "none");
  title.targetAction = "move";
  formHeaderDiv.appendChild(title);

  // Verificar se o formulário flutuante possui ícone.
  var iconHeader = null;
  if (properties.iconHeader || (properties.advancedProps && properties.advancedProps.icon)) {
    // Obter a classe do ícone.
    var iconClass = properties.iconHeader ? properties.iconHeader : properties.advancedProps.icon;

    // Criar o ícone do formulário flutuante.
    iconHeader = mainSystemFrame.document.createElement("i");
    iconHeader.className = ("p-2 " + iconClass).trim(); // Bootstrap
    iconHeader.style.fontSize = "1.5rem";
    if (properties.advancedProps && properties.advancedProps.iconColor && properties.advancedProps.iconColor.length > 0)
      iconHeader.style.color = properties.advancedProps.iconColor;
    iconHeader.targetAction = "move";
    title.appendChild(iconHeader);
  }

  // Criar span para definir o título do formulário flutuante.
  var titleSpan = mainSystemFrame.document.createElement("span");
  titleSpan.className = "flex-fill mw-100 text-nowrap overflow-hidden" + // Bootstrap
    (iconHeader ? " py-2" : " p-2"); // Bootstrap
  titleSpan.innerHTML = decodeURIComponent(properties.description);
  titleSpan.style.setProperty("text-overflow", "ellipsis");
  titleSpan.targetAction = "move";
  title.appendChild(titleSpan);

  // Criar div dos botões da janela.
  var options = mainSystemFrame.document.createElement("div");
  options.className = "d-flex flex-row"; // Bootstrap
  formHeaderDiv.appendChild(options);

  // Div onde ficarão as janelas minimizadas.
  var minimizedDivs = mainSystemFrame.document.getElementById("minimizedFloatingDivs");
  if (minimizedDivs === null) {
    minimizedDivs = mainSystemFrame.document.createElement("div");
    minimizedDivs.className = "row no-gutters position-absolute w-100 h-auto"; // Bootstrap
    minimizedDivs.style.bottom = "0px";
    minimizedDivs.id = "minimizedFloatingDivs";
    mainSystemFrame.document.body.appendChild(minimizedDivs);
  }

  // Função usada para fechar o formulário flutuante.
  var closeFloatingForm = function() {
    // Fechar formulário obedecendo hierarquia, remover do documento e tirar da lista de forms.
    mainSystemFrame.closeFormHierarchy(formDiv.id);
  };

  // Classe dos botões da janela flutuante.
  var buttonsClass = "d-flex align-items-center justify-content-center bg-light border-left p-2"; // Bootstrap

  if (!properties.modal) {
    // Criar botão de minimizar.
    var minimizeButton = mainSystemFrame.document.createElement("a");
    minimizeButton.className = buttonsClass + " OptionMinimize";
    minimizeButton.style.cursor = "pointer";
    minimizeButton.setAttribute("role", "button");

    var minimizeButtonIcon = mainSystemFrame.document.createElement("span");
    minimizeButtonIcon.className = "py-1 fas fa-window-minimize"; // Bootstrap - Font Awesome
    minimizeButtonIcon.style.fontSize = "0.7rem";
    minimizeButton.appendChild(minimizeButtonIcon);

    // Associar evento de clique ao botão de minimizar.
    minimizeButton.addEventListener("click", function() {
      // Verificar se não existe nenhuma div dessa janela na div de janelas minimizadas.
      if (mainSystemFrame.document.getElementById("Min" + formDiv.id) === null) {
        // Remover classe de janela ativa, caso possua.
        if (isFormActive()) formDiv.className = formDiv.className.replace(" WFRIframeForm-Active", "");

        // Adicionar classe de janela minimizada.
        formDiv.className += " WFRIframeForm-Minimized";
        formDiv.style.display = "none";

        // Cria a coluna na linha de formulários minimizados.
        var formColDiv = mainSystemFrame.document.createElement("div");
        formColDiv.className = "col-sm-3 bg-light border rounded shadow-sm overflow-hidden"; // Bootstrap
        if (properties.customClass) formColDiv.className += " " + properties.customClass.trim();
        formColDiv.id = "Min" + formDiv.id;

        // Copia o nó da barra de status da janela flutuante e coloca na parte inferior
        // como se estivesse minimizado e oculta a janela flutuante.
        var formHeaderDivCopy = formDiv.getElementsByClassName("card-header")[0].cloneNode(true);
        formHeaderDivCopy.className += " h-100"; // Bootstrap
        formColDiv.appendChild(formHeaderDivCopy);

        // O nó clonado não possui nenhum evento do nó original, precisando adicionar os eventos novamente
        formColDiv.getElementsByClassName("OptionMinimize")[0].addEventListener("click", function() {
          // Remover cópia do header da div de janelas minimizadas.
          minimizedDivs.removeChild(formColDiv);

          // Remover classe de janela minimizada.
          formDiv.className = formDiv.className.replace(" WFRIframeForm-Minimized", "");

          // Resetar display do formulário flutuante.
          formDiv.style.display = null;

          // Resetar flag de minimizado.
          isMinimized = false;
        }, false);
        formColDiv.getElementsByClassName("OptionMinimize")[0].addEventListener("click", focusDiv, false);
        formColDiv.getElementsByClassName("OptionClose")[0].addEventListener("click", function() {
          closeFloatingForm();
          isMinimized = false;
        }, false);

        minimizedDivs.insertBefore(formColDiv, minimizedDivs.firstChild);

        // Trocar ícone de minimizar para maximizar.
        divCloseButtonCopy = formColDiv.getElementsByClassName("OptionMinimize")[0].children[0];
        divCloseButtonCopy.classList.remove("fa-window-minimize"); // Font Awesome
        divCloseButtonCopy.classList.add("fa-window-maximize"); // Font Awesome
        isMinimized = true;
      }
    }, false);
    options.appendChild(minimizeButton);
  }

  // Div do botão de refresh, caso esteja em modo de desenvolvimento.
  if (isDevelopmentMode) {
    var refreshButton = mainSystemFrame.document.createElement("a");
    refreshButton.className = buttonsClass + " OptionRefresh";
    refreshButton.style.cursor = "pointer";
    refreshButton.setAttribute("role", "button");
    refreshButton.addEventListener("click", function() {
      let win = formDiv.getElementsByTagName("iframe")[0].contentWindow;
      if (win) {
        //Devido a requisições async no evento onunload, deve ser chamado direto a ação para garantir a sincronia de execução no servidor.
        if(win.formOnUnLoadAction) win.formOnUnLoadAction();
        win.location.reload();
      }
    }, false);
    options.appendChild(refreshButton);

    var refreshButtonIcon = document.createElement("span");
    refreshButtonIcon.className = "py-1 fas fa-redo"; // Bootstrap - Font Awesome
    refreshButtonIcon.style.fontSize = "0.8rem";
    refreshButton.appendChild(refreshButtonIcon);
  }

  // Criar botão de fechar
  var closeButton = mainSystemFrame.document.createElement("a");
  closeButton.className = buttonsClass + " OptionClose";
  closeButton.style.cursor = "pointer";
  closeButton.setAttribute("role", "button");
  closeButton.addEventListener("click", closeFloatingForm, false);
  options.appendChild(closeButton);

  var closeButtonIcon = document.createElement("span");
  closeButtonIcon.className = "py-1 fas fa-times"; // Bootstrap - Font Awesome
  closeButtonIcon.style.fontSize = "0.8rem";
  closeButton.appendChild(closeButtonIcon);

  // Criar a div do corpo da janela.
  var formBodyDiv = mainSystemFrame.document.createElement("div");
  formBodyDiv.className = "card-body d-flex p-0 overflow-hidden"; // Bootstrap

  // Criar div vazia para manter compatibilidade com funções
  var nullDiv = mainSystemFrame.document.createElement("div");
  nullDiv.className = "d-none"; // Bootstrap
  formBodyDiv.appendChild(nullDiv);

  // Iframe / Form
  var iframe = mainSystemFrame.document.createElement("iframe");
  iframe.className = "d-block w-100 flex-fill border-0 m-0 p-0"; // Bootstrap
  if (isIE || isIE11) iframe.className += " h-100"; // Bootstrap
  iframe.src = properties.url;

  // Definir o contexto no elemento do iframe.
  iframe.targetContext = properties.context ? properties.context : $mainform();

  formBodyDiv.appendChild(iframe);
  formDiv.appendChild(formHeaderDiv);
  formDiv.appendChild(formBodyDiv);
  mainSystemFrame.document.body.appendChild(formDiv);

  // Adicionar formulário à hierarquia de formulários.
  addFormToHierarchy(properties.context && properties.context && properties.context.idForm ?
    properties.context.idForm : window.idForm ? window.idForm : parent.formId, formDiv.id);

  // Declarar variáveis usadas pra movimentação e redimensionamento.
  var posX = 0, posY = 0;
  var sizeW = 0, sizeH = 0;
  var mouseOriginX = 0, mouseOriginY = 0;
  var isMouseDown = false;
  var hasMove = false, hasResized = false, hasInitialized = false;
  var targetAction = null;

  // Calcular o incremento da div do formulário.
  var borderIncrease = 2;  // + 2 de borda (1 da direita e 1 da esquerda para o eixo X ou 1 acima e 1 abaixo para o eixo Y)
  var widthIncrease = borderIncrease;
  var heightIncrease = formHeaderDiv.offsetHeight + borderIncrease;

  // Distância do formulário em relação aos limites da tela.
  var screenMargin = 32;

  // Obter a referência da janela.
  var win = mainSystemFrame ? mainSystemFrame : window;

  // Verificar se as propriedades de tamanho excedem o tamanho da tela.
  if (properties.width > win.innerWidth - widthIncrease - screenMargin)
    properties.width = win.innerWidth - widthIncrease - screenMargin;
  if (properties.height > win.innerHeight - heightIncrease - screenMargin)
    properties.height = win.innerHeight - heightIncrease - screenMargin;

  formDiv.style.width = (properties.width + widthIncrease) + "px";
  formDiv.style.height = (properties.height + heightIncrease) + "px";

  formDiv.style.minWidth = "320px";
  formDiv.style.minHeight = "320px";

  var topDocument = top.document;

  var setFormWindowWidth = function(width, props) {
    if (isClosed) return false;

    // Verificar se a propriedade excede o tamanho da tela.
    var distanceFromLeft = !hasMove && !hasResized ? 0 : formDiv.offsetLeft;
    var formWidthIncrease = props && props.withWidthIncrease ? 0 : widthIncrease;
    if (width > win.innerWidth - formWidthIncrease - distanceFromLeft - screenMargin)
      width = win.innerWidth - formWidthIncrease - distanceFromLeft - screenMargin;
    formDiv.style.width = width + "px";

    // Centraliza a div da janela na tela se a janela não foi movida ou redimensionada.
    if (!hasMove && !hasResized) centerDiv(topDocument, formDiv);
  };

  var setFormWindowHeight = function(height, props) {
    if (isClosed) return false;

    // Verificar se a propriedade excede o tamanho da tela.
    var distanceFromTop = !hasMove && !hasResized ? 0 : formDiv.offsetTop;
    var formHeightIncrease = props && props.withHeightIncrease ? 0 : heightIncrease;
    if (height > win.innerHeight - formHeightIncrease - distanceFromTop - screenMargin)
      height = win.innerHeight - formHeightIncrease - distanceFromTop - screenMargin;
    formDiv.style.height = height + "px";

    // Centraliza a div da janela na tela se a janela não foi movida ou redimensionada.
    if (!hasMove && !hasResized) centerDiv(topDocument, formDiv);
  };

  // Define funções no elemento do iframe.
  // Essas funções são acessíveis de dentro do iframe e certas páginas como
  // upload a utilizam esporadicamente para redimensionar ou fechar a janela.
  iframe.setWidth = setFormWindowWidth;
  iframe.setHeight = setFormWindowHeight;
  iframe.close = closeFloatingForm;

  // Centraliza a div da janela na tela.
  centerDiv(topDocument, formDiv);

  // Declarar funções de eventos utilizados na movimentação e redimensionamento.
  var evtMouseDown = function(e, inside) {
    e.stopPropagation();

    // Verificar se a janela está ativa.
    if (isFormActive()) {
      // Somente lidar com eventos de redimensionamento/movimentação quando
      // não estiver em uma tela pequena, pois em telas pequenas a janela
      // ocupa a página toda.
      if (!bootstrapIsExtraSmallDevice(mainSystemFrame) && formDiv) {
        e.preventDefault();

        posX = formDiv.offsetLeft;
        posY = formDiv.offsetTop;

        sizeW = formDiv.offsetWidth;
        sizeH = formDiv.offsetHeight;

        // Verificar se é evento de touch.
        if (e.touches && e.touches.length > 0) {
          // Obter a posição do primeiro touch em relação a tela.
          mouseOriginX = e.touches[0].screenX;
          mouseOriginY = e.touches[0].screenY;
        } else {
          // Obter a posição do primeiro touch em relação a tela.
          mouseOriginX = e.screenX;
          mouseOriginY = e.screenY;
        }

        isMouseDown = true;
        targetAction = e.target.targetAction ? e.target.targetAction : null;

        formDiv.style.zIndex = ++mainSystemFrame.lastFormZindex;
      }
    } else if (!inside) {
      // Se a janela não está ativa, devemos passar o evento para outra janela.
      // Assim, os eventos de outras janelas funcionam na própria janela atual.
      var activeForms = mainSystemFrame.document.getElementsByClassName("WFRIframeForm-Active");
      if (activeForms.length > 0 && activeForms[0].evtMouseDown) activeForms[0].evtMouseDown(e, true);
    }
  };

  var evtMouseMove = function(e, inside) {
    e.stopPropagation();

    // Verificar se a janela está ativa.
    if (isFormActive()) {
      // Somente lidar com eventos de redimensionamento/movimentação quando
      // não estiver em uma tela pequena, pois em telas pequenas a janela
      // ocupa a página toda.
      if (!bootstrapIsExtraSmallDevice(mainSystemFrame) && formDiv && isMouseDown) {
        e.preventDefault();

        var screenX, screenY;

        // Verificar se é evento de touch.
        if (e.touches && e.touches.length > 0) {
          // Obter a posição do primeiro touch em relação a tela.
          screenX = e.touches[0].screenX;
          screenY = e.touches[0].screenY;
        } else {
          // Obter a posição do primeiro touch em relação a tela.
          screenX = e.screenX;
          screenY = e.screenY;
        }

        if (targetAction === "move") {
          var targetTop = posY + screenY - mouseOriginY;
          var targetLeft = posX + screenX - mouseOriginX;

          var formHalfWidth = Math.floor(formDiv.offsetWidth / 4);
          var formHalfHeight = Math.floor(formDiv.offsetHeight / 4);

          // Limitar a posição para não permitir que o formulário suma completamente da tela.
          if (targetLeft > mainSystemFrame.innerWidth - formHalfWidth)
            targetLeft = mainSystemFrame.innerWidth - formHalfWidth;
          if (targetLeft < -(formDiv.offsetWidth - formHalfWidth)) targetLeft = -(formDiv.offsetWidth - formHalfWidth);

          if (targetTop > mainSystemFrame.innerHeight - formHalfHeight)
            targetTop = mainSystemFrame.innerHeight - formHalfHeight;
          if (targetTop < 0) targetTop = 0;

          formDiv.style.top = targetTop + "px";
          formDiv.style.left = targetLeft + "px";

          hasMove = true;
        }

        if (targetAction === "resize" || targetAction === "resize-x") {
          formDiv.style.width = (sizeW + screenX - mouseOriginX) + "px";
          hasResized = true;
        }

        if (targetAction === "resize" || targetAction === "resize-y") {
          formDiv.style.height = (sizeH + screenY - mouseOriginY) + "px";
          hasResized = true;
        }
      }
    } else if (!inside) {
      // Se a janela não está ativa, devemos passar o evento para outra janela.
      // Assim, os eventos de outras janelas funcionam na própria janela atual.
      var activeForms = mainSystemFrame.document.getElementsByClassName("WFRIframeForm-Active");
      if (activeForms.length > 0 && activeForms[0].evtMouseMove) activeForms[0].evtMouseMove(e, true);
    }
  };

  var evtMouseUp = function(e, inside) {
    e.stopPropagation();
    isMouseDown = false;
    targetAction = null;

    if (!inside) {
      var activeForms = mainSystemFrame.document.getElementsByClassName("WFRIframeForm-Active");
      if (activeForms.length > 0 && activeForms[0].evtMouseUp) activeForms[0].evtMouseUp(e, true);
    }
  };

  // Definir eventos no DOM do form div para que outras janelas possam utilizar também.
  formDiv.evtMouseDown = evtMouseDown;
  formDiv.evtMouseMove = evtMouseMove;
  formDiv.evtMouseUp = evtMouseUp;

  // Insere evento para trazer janela do formulário flutuante a frente.
  formHeaderDiv.addEventListener("touchstart", focusDiv, false);
  formHeaderDiv.addEventListener("mousedown", focusDiv, false);

  // Associar eventos do touch para a movimentação e redimensionamento da janela.
  formHeaderDiv.addEventListener("touchstart", evtMouseDown, false);
  formHeaderDiv.addEventListener("touchend", evtMouseUp, false);
  formHeaderDiv.addEventListener("touchmove", evtMouseMove, false);

  // Associar eventos do mouse para a movimentação e redimensionamento da janela.
  formHeaderDiv.addEventListener("mousedown", evtMouseDown, false);
  formHeaderDiv.addEventListener("mousemove", evtMouseMove, false);
  formHeaderDiv.addEventListener("mouseup", evtMouseUp, false);

  // Insere evento para trazer janela do formulário flutuante a frente.
  title.addEventListener("touchstart", focusDiv, false);
  title.addEventListener("mousedown", focusDiv, false);

  // Associar eventos do touch para a movimentação e redimensionamento da janela.
  title.addEventListener("touchstart", evtMouseDown, false);
  title.addEventListener("touchcancel", evtMouseUp, false);
  title.addEventListener("touchmove", evtMouseMove, false);

  // Associar eventos do mouse para a movimentação e redimensionamento da janela.
  title.addEventListener("mousedown", evtMouseDown, false);
  title.addEventListener("mousemove", evtMouseMove, false);
  title.addEventListener("mouseup", evtMouseUp, false);

  // Insere evento para trazer janela do formulário flutuante a frente.
  titleSpan.addEventListener("touchstart", focusDiv, false);
  titleSpan.addEventListener("mousedown", focusDiv, false);

  // Associar eventos do touch para a movimentação e redimensionamento da janela.
  titleSpan.addEventListener("touchstart", evtMouseDown, false);
  titleSpan.addEventListener("touchend", evtMouseUp, false);
  titleSpan.addEventListener("touchmove", evtMouseMove, false);

  // Associar eventos do mouse para a movimentação e redimensionamento da janela.
  titleSpan.addEventListener("mousedown", evtMouseDown, false);
  titleSpan.addEventListener("mousemove", evtMouseMove, false);
  titleSpan.addEventListener("mouseup", evtMouseUp, false);

  if (iconHeader) {
    // Insere evento para trazer janela do formulário flutuante a frente.
    iconHeader.addEventListener("touchstart", focusDiv, false);
    iconHeader.addEventListener("mousedown", focusDiv, false);

    // Associar eventos do touch para a movimentação e redimensionamento da janela.
    iconHeader.addEventListener("touchstart", evtMouseDown, false);
    iconHeader.addEventListener("touchend", evtMouseUp, false);
    iconHeader.addEventListener("touchmove", evtMouseMove, false);

    // Associar eventos do mouse para a movimentação e redimensionamento da janela.
    iconHeader.addEventListener("mousedown", evtMouseDown, false);
    iconHeader.addEventListener("mousemove", evtMouseMove, false);
    iconHeader.addEventListener("mouseup", evtMouseUp, false);
  }

  // Associar eventos do touch para a movimentação e redimensionamento da janela.
  formDiv.addEventListener("touchstart", evtMouseDown, false);
  formDiv.addEventListener("touchend", evtMouseUp, false);
  formDiv.addEventListener("touchmove", evtMouseMove, false);

  // Insere evento para trazer janela do formulário flutuante a frente.
  formDiv.addEventListener("touchstart", focusDiv, false);
  formDiv.addEventListener("mousedown", focusDiv, false);

  // Associar eventos do mouse para a movimentação e redimensionamento da janela.
  formDiv.addEventListener("mousedown", evtMouseDown, false);
  formDiv.addEventListener("mousemove", evtMouseMove, false);
  formDiv.addEventListener("mouseup", evtMouseUp, false);

  // Associar eventos do touch para a movimentação e redimensionamento da janela.
  document.addEventListener("touchstart", evtMouseDown, false);
  document.addEventListener("touchend", evtMouseUp, false);
  document.addEventListener("touchmove", evtMouseMove, false);

  // Associar eventos do mouse para a movimentação e redimensionamento da janela.
  document.addEventListener("mousemove", evtMouseMove, false);
  document.addEventListener("mouseup", evtMouseUp, false);

  // Função para associar a hierarquia de eventos do formulário flutuante.
  var assignEventsHierarchy = function(root, focus) {
    if (isClosed || !root) return false;

    try {
      // Insere evento para trazer janela do formulário flutuante a frente.
      if (focus) {
        root.addEventListener("touchstart", focusDiv, false);
        root.addEventListener("mousedown", focusDiv, false);
      }

      // Associar eventos do touch para a movimentação e redimensionamento da janela.
      root.addEventListener("touchstart", evtMouseDown, false);
      root.addEventListener("touchend", evtMouseUp, false);
      root.addEventListener("touchmove", evtMouseMove, false);

      // Insere evento de movimentação do mouse para lidar com o redimensionamento e movimentação do formulário flutante.
      root.addEventListener("mousemove", evtMouseMove, false);
      root.addEventListener("mouseup", evtMouseUp, false);

      var iframes = null;
      if (root.tagName && root.tagName.toUpperCase() == "IFRAME") {
        if (root.contentWindow && root.contentWindow.document)
          iframes = root.contentWindow.document.getElementsByTagName("iframe");
        root.addEventListener("load", function() {
          if (root.contentWindow && root.contentWindow.document) {
            assignEventsHierarchy(root.contentWindow.document, focus);
          }
        }, false);
      } else if (root instanceof Document) {
        iframes = root.getElementsByTagName("iframe");
        root.addEventListener("load", function() {
          assignEventsHierarchy(root, focus);
        }, false);
      } else {
        iframes = root.getElementsByTagName("iframe");
      }

      if (iframes && iframes.length > 0) {
        for (var i = 0; i < iframes.length; i++) {
          try {
            assignEventsHierarchy(iframes[i].contentWindow.document, focus);
          } catch (e) { }
        }
      }
    } catch (e) { }
  };

  iframe.assignEventsHierarchy = assignEventsHierarchy;
  iframe.addEventListener("load", function() {
    try {
      // Insere evento para trazer janela a frente no document interno do formulário flutuante.
      iframe.contentWindow.document.addEventListener("touchstart", focusDiv, false);
      iframe.contentWindow.document.addEventListener("mousedown", focusDiv, false);

      // Associar eventos do touch para a movimentação e redimensionamento da janela.
      iframe.contentWindow.document.addEventListener("touchstart", evtMouseDown, false);
      iframe.contentWindow.document.addEventListener("touchend", evtMouseUp, false);
      iframe.contentWindow.document.addEventListener("touchmove", evtMouseMove, false);

      // Insere evento de movimentação do mouse para lidar com o redimensionamento e movimentação do formulário flutante.
      iframe.contentWindow.document.addEventListener("mousemove", evtMouseMove, false);
      iframe.contentWindow.document.addEventListener("mouseup", evtMouseUp, false);
    } catch (e) { }

    try {
      var iframes = iframe.contentWindow.document.getElementsByTagName("iframe");

      if (!hasInitialized) {
        var plusWidthIncrease = widthIncrease;
        var plusHeightIncrease = heightIncrease;
        var changedWidth = false, changedHeight = false;

        for (var i = 0; i < iframes.length; i++) {
          // Verificar se o formulário possui abas e/ou barra de navegação.
          if (i == 0 && (properties.hasTabs || properties.hasNavigation)) {
            var innerFrameWindow = iframes[i].contentWindow;
            if (innerFrameWindow && innerFrameWindow.d && innerFrameWindow.d.t) {
              var distanceFromTop = innerFrameWindow.d.t.getDistanceFromTop();
              if (distanceFromTop > 0) {
                plusHeightIncrease += distanceFromTop;
                changedHeight = true;
              }
            }
          }
        }

        // Verificar se o incremento mudou e ajustar o tamanho.
        if (changedWidth) iframe.setWidth(properties.width + plusWidthIncrease, { withWidthIncrease: true });
        if (changedHeight) iframe.setHeight(properties.innerHeight + plusHeightIncrease, { withHeightIncrease: true });

        hasInitialized = true;
      }

      // Associar eventos aos iframes.
      for (var i = 0; i < iframes.length; i++) {
        iframes[i].assignEventsHierarchy = assignEventsHierarchy;
        assignEventsHierarchy(iframes[i].contentWindow.document, true);
      }
    } catch (e) { }
  }, false);

  // Associar eventos aos iframes.
  assignEventsHierarchy(mainSystemFrame.document, false);

  // Evento de redimensionar janela.
  var evtResizeWindow = function() {
    if (!isClosed && formDiv) {
      if (!bootstrapIsExtraSmallDevice(mainSystemFrame)) {
        var changedPosition = false;

        var targetTop = parseInt(formDiv.style.top);
        var targetLeft = parseInt(formDiv.style.left);

        var formHalfWidth = Math.floor(formDiv.offsetWidth / 4);
        var formHalfHeight = Math.floor(formDiv.offsetHeight / 4);

        // Limitar a posição para não permitir que o formulário suma completamente da tela.
        if (targetLeft > mainSystemFrame.innerWidth - formHalfWidth) {
          targetLeft = mainSystemFrame.innerWidth - formHalfWidth;
          changedPosition = true;
        }

        if (targetLeft < -(formDiv.offsetWidth - formHalfWidth)) {
          targetLeft = -(formDiv.offsetWidth - formHalfWidth);
          changedPosition = true;
        }

        if (targetTop > mainSystemFrame.innerHeight - formHalfHeight) {
          targetTop = mainSystemFrame.innerHeight - formHalfHeight;
          changedPosition = true;
        }

        if (targetTop < 0) {
          targetTop = 0;
          changedPosition = true;
        }

        // Atualizar posição do formulário se foi alterada.
        if (changedPosition) {
          formDiv.style.top = targetTop + "px";
          formDiv.style.left = targetLeft + "px";
        }
      } else if (!properties.preLoad && formDiv.style.zIndex != "-1") {
        if (!isMinimized && !isFormActive() && minimizeButton) {
          minimizeButton.click();
        }

        isMouseDown = false;
        targetAction = null;
      }
    }
  };

  // Define funções no elemento do formulário.
  formDiv.close = closeFloatingForm;
  formDiv.finalizeClose = function() {
    try {
      // Remover eventos relacionados ao formulário flutuante do documento.
      document.removeEventListener("mousemove", evtMouseMove);
      document.removeEventListener("mouseup", evtMouseMove);
      mainSystemFrame.window.removeEventListener("resize", evtResizeWindow);
    } catch (e) { }

    // Verificar se o formulário possui carga antecipada.
    if (properties.preLoad) {

      // Reabrir o formulário.
      var _properties = properties;
      mainSystemFrame.setTimeout(function() {
        _properties.isReopen = true;
        mainSystemFrame.openForm(_properties);
      }, 0);
    }

    // Atualizar variáveis.
    isMinimized = false;
    isClosed = true;
  };

  formDiv.beforeClose = function() {
    try {
      // Verificar se existe callback de antes de fechar.
      if (formDiv.onbeforeclose && typeof formDiv.onbeforeclose === "function") {
        formDiv.onbeforeclose.apply(formDiv, arguments);
      }
    } catch (e) { }
  };

  formDiv.resetMinimizedState = function() {
    isMinimized = false;
  };

  // Verificar se a janela é redimensionável.
  if ((isForm && properties.responsive) || properties.resizable) {
    // Tamanho das divs de redimensionamento, em pixels.
    var resizeThreshold = 7;

    // Criar a div de redimensionamento do lado esquerdo.
    var rightResizer = mainSystemFrame.document.createElement("div");
    rightResizer.targetAction = "resize-x";
    rightResizer.className = "position-absolute h-100"; // Bootstrap
    rightResizer.style.width = resizeThreshold + "px";
    rightResizer.style.right = "0";
    rightResizer.style.bottom = "0";
    rightResizer.style.cursor = "e-resize";
    rightResizer.style.zIndex = "10";
    formBodyDiv.appendChild(rightResizer);

    // Insere evento para trazer janela do formulário flutuante a frente.
    rightResizer.addEventListener("touchstart", focusDiv, false);
    rightResizer.addEventListener("mousedown", focusDiv, false);

    // Associar evento a div de redimensionamento do lado esquerdo.
    rightResizer.addEventListener("mousedown", evtMouseDown, false);
    rightResizer.addEventListener("mousemove", evtMouseMove, false);
    rightResizer.addEventListener("mouseup", evtMouseUp, false);

    rightResizer.addEventListener("touchstart", evtMouseDown, false);
    rightResizer.addEventListener("touchend", evtMouseUp, false);
    rightResizer.addEventListener("touchmove", evtMouseMove, false);

    // Criar a div de redimensionamento da parte inferior.
    var bottomResizer = mainSystemFrame.document.createElement("div");
    bottomResizer.targetAction = "resize-y";
    bottomResizer.className = "position-absolute w-100"; // Bootstrap
    bottomResizer.style.height = resizeThreshold + "px";
    bottomResizer.style.right = "0";
    bottomResizer.style.bottom = "0";
    bottomResizer.style.cursor = "n-resize";
    bottomResizer.style.zIndex = "10";
    formBodyDiv.appendChild(bottomResizer);

    // Insere evento para trazer janela do formulário flutuante a frente.
    bottomResizer.addEventListener("touchstart", focusDiv, false);
    bottomResizer.addEventListener("mousedown", focusDiv, false);

    // Associar evento a div de redimensionamento da parte inferior.
    bottomResizer.addEventListener("mousedown", evtMouseDown, false);
    bottomResizer.addEventListener("mousemove", evtMouseMove, false);
    bottomResizer.addEventListener("mouseup", evtMouseUp, false);

    bottomResizer.addEventListener("touchstart", evtMouseDown, false);
    bottomResizer.addEventListener("touchend", evtMouseUp, false);
    bottomResizer.addEventListener("touchmove", evtMouseMove, false);

    // Criar a div de redimensionamento do canto inferior-esquerdo.
    var bothResizer = mainSystemFrame.document.createElement("div");
    bothResizer.targetAction = "resize";
    bothResizer.className = "position-absolute"; // Bootstrap
    bothResizer.style.width = resizeThreshold + "px";
    bothResizer.style.height = resizeThreshold + "px";
    bothResizer.style.right = "0";
    bothResizer.style.bottom = "0";
    bothResizer.style.cursor = "nw-resize";
    bothResizer.style.zIndex = "15";
    formBodyDiv.appendChild(bothResizer);

    // Insere evento para trazer janela do formulário flutuante a frente.
    bothResizer.addEventListener("touchstart", focusDiv, false);
    bothResizer.addEventListener("mousedown", focusDiv, false);

    // Associar evento a div de redimensionamento do canto inferior-esquerdo.
    bothResizer.addEventListener("mousedown", evtMouseDown, false);
    bothResizer.addEventListener("mousemove", evtMouseMove, false);
    bothResizer.addEventListener("mouseup", evtMouseUp, false);

    bothResizer.addEventListener("touchstart", evtMouseDown, false);
    bothResizer.addEventListener("touchend", evtMouseUp, false);
    bothResizer.addEventListener("touchmove", evtMouseMove, false);
  }

  // Verificar se a janela é um modal.
  if (properties.modal) {
    // Criar o overlay escuro do modal.
    var modalBackdropDiv = mainSystemFrame.document.createElement("div");
    modalBackdropDiv.id = "WFRModalDiv" + properties.form;
    modalBackdropDiv.className = "modal-backdrop fade show"; // Bootstrap
    mainSystemFrame.document.body.appendChild(modalBackdropDiv);

    // Insere evento para trazer janela a frente no document interno do formulário flutuante.
    modalBackdropDiv.addEventListener("touchstart", focusDiv, false);
    modalBackdropDiv.addEventListener("mousedown", focusDiv, false);

    // Associar eventos do mouse para a movimentação e redimensionamento da janela.
    modalBackdropDiv.addEventListener("mousedown", evtMouseDown, false);
    modalBackdropDiv.addEventListener("mousemove", evtMouseMove, false);
    modalBackdropDiv.addEventListener("mouseup", evtMouseUp, false);

    // Associar eventos do touch para a movimentação e redimensionamento da janela.
    modalBackdropDiv.addEventListener("touchstart", evtMouseDown, false);
    modalBackdropDiv.addEventListener("touchend", evtMouseUp, false);
    modalBackdropDiv.addEventListener("touchmove", evtMouseMove, false);

    // Definir z-index do overlay.
    mainSystemFrame.lastFormZindex++;
    modalBackdropDiv.style.zIndex = (properties.preLoad && (!win || !win.isPopup)) ||
      properties.isReopen ? "-1" : mainSystemFrame.lastFormZindex;
  }

  // Definir z-index da janela do formulário.
  mainSystemFrame.lastFormZindex++;
  formDiv.style.zIndex = (properties.preLoad && (!win || !win.isPopup)) ||
    properties.isReopen ? "-1" : ++mainSystemFrame.lastFormZindex;

  // Adiciona o formulário aberto na lista de forms.
  mainSystemFrame.floatingForms.push(formDiv.id);

  // Definir o foco no formulário aberto.
  if (!properties.preLoad || (win && win.isPopup && !properties.isReopen)) focusDiv();

  // Adicionar evento de resize na janela para minimizar os formulários que não estiverem ativos.
  mainSystemFrame.window.addEventListener("resize", evtResizeWindow, false);

  try {
    // Definir propriedades na window do iframe.
    iframe.contentWindow.principal = (typeof(isPrincipal) != "undefined" && isPrincipal) ? principal : $mainform().parent.principal;
    iframe.contentWindow.opener = window;
    iframe.contentWindow.divName = properties.form;
    iframe.contentWindow.modal = properties.modal;
  } catch (e) { }

  // Definir variável "isFloatingForm" na div da janela flutuante para
  // ajudar na detecção de formulários flutuantes.
  // Utilizado em componentes como o Calendário.
  formDiv.isFloatingForm = true;

  // Retornar a div da janela flutuante.
  return formDiv;
}

/**
 * Adiciona um formulário à hierarquia de formulários.
 * @param parentFormId ID do formulário pai.
 * @param formId ID do formulário filho.
 */
function addFormToHierarchy(parentFormId, childFormId) {
  // Verificar se o ID não possui o prefixo "WFRIframeForm".
  if (childFormId && childFormId.toString().indexOf("WFRIframeForm") !== 0)
    childFormId = "WFRIframeForm" + childFormId;
  if (parentFormId && parentFormId.toString().indexOf("WFRIframeForm") !== 0)
    parentFormId = "WFRIframeForm" + parentFormId;

  if (mainSystemFrame) {
    if (!mainSystemFrame.floatingForms) mainSystemFrame.floatingForms = [ ];
    if (!mainSystemFrame.formHierarchy) mainSystemFrame.formHierarchy = { };

    if (window.mainwindow) {
      if (!mainSystemFrame.formHierarchy["mainwindow"])
        mainSystemFrame.formHierarchy["mainwindow"] = [];
      mainSystemFrame.formHierarchy["mainwindow"].push(childFormId);
    } else {
      if (!mainSystemFrame.formHierarchy[parentFormId]) {
        mainSystemFrame.formHierarchy[parentFormId] = [];
      }

      try {
        mainSystemFrame.formHierarchy[parentFormId].push(childFormId);
      } catch (e) {
        // IE
        mainSystemFrame.formHierarchy[parentFormId] = [];
        mainSystemFrame.formHierarchy[parentFormId].push(childFormId);
      }
    }
  }
}

/**
 * Remove um formulário da hierarquia de formulários.
 * @param formId ID do formulário que deverá ser removido.
 */
function removeFormFromHierarchy(formId) {
  // Verificar se o ID não possui o prefixo "WFRIframeForm".
  if (formId && formId.toString().indexOf("WFRIframeForm") !== 0) {
    formId = "WFRIframeForm" + formId;
  }

  // Verificar se a hierarquia e formulários foi montada.
  if (mainSystemFrame && mainSystemFrame.formHierarchy) {
    // Verificar se o formulário possui filhos na hierarquia.
    if (mainSystemFrame.formHierarchy.hasOwnProperty(formId)) {
      // Deletar referências dos formulários da hierarquia.
      delete mainSystemFrame.formHierarchy[formId];
    }

    // Procurar por referências ao formulário em outros formulários.
    for (var parentId in mainSystemFrame.formHierarchy) {
      // Verificar se o formulário está associado ao formulário atual.
      if (mainSystemFrame.formHierarchy.hasOwnProperty(parentId)) {
        var formChildren = mainSystemFrame.formHierarchy[parentId];

        // Se só houver o formulário que foi especificado associado, então devemos deletar o item todo.
        if (formChildren.length == 1 && formChildren.indexOf(formId) >= 0) {
          delete mainSystemFrame.formHierarchy[parentId];
        } else {
          // Se houver outros formulários, devemos remover somente o formulário especificado.
          mainSystemFrame.formHierarchy[parentId] = formChildren.filter(function(val) {
            return val !== formId;
          });
        }
      }
    }
  }
}

/**
 * Verificar se o formulário está aberto numa moldura.
 * @param formWindowContext (Opcional) Contexto/Window do formulário no openform.do.
 */
function isFormOpenInGroupBox(formWindowContext) {
  try {
    if (!formWindowContext) formWindowContext = window;
    return formWindowContext.parent && formWindowContext.parent.parent &&
      formWindowContext.parent.frameElement &&
      formWindowContext.parent.frameElement.componentName;
  } catch (e) { }
  return false;
}

/**
 * Verificar se o formulário está aberto num componente Aba.
 * @param formWindowContext (Opcional) Contexto/Window do formulário no openform.do.
 */
function isFormOpenInTabComponent(formWindowContext) {
  try {
    if (!formWindowContext) formWindowContext = window;
    if (isFormOpenInGroupBox(formWindowContext)) {
      var parentGroupBox = getFormParentGroupBox(formWindowContext);
      var parentGroupBoxDiv = parentGroupBox.div ? parentGroupBox.div : parentGroupBox.context;
      return parentGroupBoxDiv.hasAttribute("webrun-tab-component");
    }
  } catch (e) { }
  return false;
}

/**
 * Obtém a referência do componente moldura para um formulário que está aberto dentro dela.
 * Essa função não verifica se o formulário está aberto na moldura ou não, deve ser chamada
 * a função "isFormOpenInGroupBox" para isso.
 * @param formWindowContext (Opcional) Contexto/Window do formulário no openform.do.
 */
function getFormParentGroupBox(formWindowContext) {
  try {
    if (!formWindowContext) formWindowContext = window;
    return formWindowContext.parent.parent.$c(window.parent.frameElement.componentName);
  } catch (e) { }
  return null;
}

/**
 * Obtém a referência do componente Aba para um formulário que está aberto dentro dela.
 * @param formWindowContext (Opcional) Contexto/Window do formulário no openform.do.
 */
function getFormParentTabComponent(formWindowContext) {
  try {
    if (!formWindowContext) formWindowContext = window;
    if (isFormOpenInTabComponent(formWindowContext)) {
      var parentGroupBox = getFormParentGroupBox(formWindowContext);
      var parentGroupBoxDiv = parentGroupBox.div ? parentGroupBox.div : parentGroupBox.context;
      return formWindowContext.parent.parent.$c(parentGroupBoxDiv.getAttribute("webrun-tab-component"));
    }
  } catch (e) { }
  return null;
}

/**
 * Obtém a referência da LI da aba de um formulário que está aberto no componente Aba.
 * Essa função não verifica se o formulário está aberto na Aba ou não, deve ser chamada
 * a função "isFormOpenInTabComponent" para isso.
 * @param formWindowContext (Opcional) Contexto/Window do formulário no openform.do.
 */
function getFormParentTabComponentTab(formWindowContext) {
  try {
    if (!formWindowContext) formWindowContext = window;
    var parentGroupBox = getFormParentGroupBox(formWindowContext);
    var parentGroupBoxDiv = parentGroupBox.div ? parentGroupBox.div : parentGroupBox.context;
    var targetDocument = formWindowContext.parent.parent.document;
    var tabDiv = targetDocument.getElementById(parentGroupBoxDiv.getAttribute("webrun-tab-component"));
    if (tabDiv) return tabDiv.querySelector('li[webrun-tab-container="' + parentGroupBoxDiv.id + '"]');
  } catch (e) { }
  return null;
}

/**
 * Fecha um formulário que está aberto num componente Aba através do seu contexto.
 * Essa função não verifica se o formulário está aberto na Aba ou não, deve ser chamada
 * a função "isFormOpenInTabComponent" para isso.
 * @param formWindowContext (Opcional) Contexto/Window do formulário no openform.do.
 */
function closeFormInTabComponent(formWindowContext) {
  try {
    if (!formWindowContext) formWindowContext = window;
    var parentTabLi = getFormParentTabComponentTab();
    if (parentTabLi) {
      var closeButton = parentTabLi.getElementsByClassName("tab-close-button");
      if (closeButton && closeButton.length > 0) closeButton[0].click();
    }
  } catch (e) { }
}

function defineBlockDivForAll() {
  for (var i = 0; i < mainSystemFrame.floatingForms.length; i++) {
    if ($mainform()) {
      var currentFloatingForm = mainSystemFrame.document.getElementById($mainform().mainSystemFrame.floatingForms[i]);
      if (currentFloatingForm) {
        currentFloatingForm.children[1].firstChild.style.display = "block";
        currentFloatingForm.children[1].firstChild.onclick = function() {
          defineBlockDivForAll();
          this.style.display = "none";
          mainSystemFrame.lastFormZindex++;
          this.parentElement.parentElement.style.zIndex = mainSystemFrame.lastFormZindex;
        };
      }
    }
  }
}

function openPopupForm(properties) {
  var left = (screen.width - properties.width) / 2;
  var top = (screen.height - properties.height) / 2;

  const onClose = properties.advancedProps ? Boolean(properties.advancedProps.onClose) : null;
  if (onClose) {
    properties.onClose = onClose;
    properties.jsonProperties = JSON.stringify(properties.advancedProps.jsonProperties);
  }

  var url = getAbsolutContextPath() + 'form' + PAGES_EXTENSION + '?sys=' + properties.sys + '&action=openform&formID=' + properties.form 
          + '&align=0' + (!isNullable(properties.mode) ? '&mode=' + properties.mode : '') 
          + '&goto=' + (!isNullable(properties.gotoRow) ? properties.gotoRow : -1) 
          + '&filter=' + (!isNullable(properties.filter) ? properties.filter : '') 
          + '&scrolling=' + (properties.scrollbars ? 'yes' : 'no') 
          + (!isNullable(properties.onClose) ? '&onClose=' + properties.onClose : '')
          + (!isNullable(properties.jsonProperties) ? '&jsonProperties=' + URLEncode(properties.jsonProperties, 'GET') : '');
  
  if (!properties.centralized) {
    left = properties.posX ? properties.posX : 0;
    top = properties.posY ? properties.posY : 0;
  }

  var toolbar = properties.toolbar ? 'yes' : 'no';
  var location = properties.location ? 'yes' : 'no';
  var status = properties.status ? 'yes' : 'no';
  var menubar = properties.menubar ? 'yes' : 'no';
  var scrollbars = properties.scrollbars ? 'yes' : 'no';
  var resizable = properties.resizable ? 'yes' : 'no';

  var target = !isNullable(properties.target) ? properties.target : '';
  var params = 'toolbar=' + toolbar + ',location=' + location + ',status=' + status + ',menubar=' + menubar + ',scrollbars=' + scrollbars + ',resizable=' + resizable + ',width=' + properties.width + ',height=' + properties.height + ',left=' + left + ',top=' + top;

  if (properties.modal && window.showModalDialog) {
    var realHeight = parseInt(properties.height);
    var realWidth = parseInt(properties.width);

    var values = new Object();
    values.parentWindow = window;

    var px = IE ? "px" : "";

    // Necessário pois o IE8 não necessita do cálculo abaixo, entretanto as versões anteriores precisam
    var IE8 = (navigator.userAgent.indexOf("MSIE 8") > -1);

    if (IE && !IE8) {
      var diffHeight = screen.Height - screen.availHeight;
      var diffWidth = screen.Width - screen.availWidth;

      // Verificação necessária, pois o IE8+, quando em modo de compatibilidade, torna-se IE7
      if (!(isNullable(diffHeight) || isNullable(diffWidth))) {
        realHeight += diffHeight;
        realWidth += diffWidth;
      }
    }

    window.showModalDialog(url, values, "dialogHeight:" + realHeight + px + ";dialogWidth:" + realWidth + px + ";dialogleft:" + left + px + ";dialogtop:" + top + px + ";center=yes;resizable:" + resizable + ";status:" + status);
  } else if (properties.newWindow) {
    var w = MM_openBrWindow(url, target, params);
    if (properties.returnWindow) {
      return w;
    }
  } else {
    window.location = url;
    if (properties.returnWindow) {
      return window;
    }
  }
}

function openForm(properties) {
  // Obter a div do formulário flutuante.
  var formDiv = mainSystemFrame ? getFloatingFormDivById(properties.form) : null;

  // Verificar se o formulário é carga antecipada e se ele já está aberto no contexto.
  if (properties.preLoad && formDiv) {
    // Obter a referência da janela do formulário flutuante.
    var formWindow = getFloatingFormWindowById(properties.form);

    // Atualizar formulário.
    if (formWindow && formWindow.mainform && formWindow.mainform.d && formWindow.mainform.d.n && formWindow.mainform.d.n.visible) {
      if (properties.filter != null && properties.filter != "" && properties.filter != "undefined") {
        if (properties.mode != null && properties.mode != "" && properties.mode != "undefined" && properties.mode != "-1") {
          if (properties.mode == "2") formWindow.mainform.d.n.execAjaxEval("refreshAllEdit", null, properties.filter);
          else if (properties.mode == "1") formWindow.mainform.d.n.execAjaxEval("refreshAllInclude", null, properties.filter);
        } else {
          formWindow.mainform.d.n.execAjaxEval("refreshAllShow", null, properties.filter);
        }
      } else formWindow.mainform.d.n.execAjaxEval("refreshAll");
    }

    // Verificar se o formulário é modal.
    if (properties.modal) {
      // Procurar pelo backdrop do formulário flutuante.
      var modalDiv = mainSystemFrame.document.getElementById("WFRModalDiv" + properties.form);
      if (modalDiv) {
        // Exibir backdrop do formulário.
        modalDiv.style.display = "block";

        // Incrementar z-index do backdrop.
        modalDiv.style.zIndex = ++mainSystemFrame.lastFormZindex;
      }
    }

    // Incrementar z-index do formulário flutuante.
    if (formDiv) formDiv.style.zIndex = ++mainSystemFrame.lastFormZindex;
  } else if (properties.newWindow) {
    return openPopupForm(properties);
  } else if (properties.form && !properties.preLoad && formDiv) {
    // Obter o iframe do formulário.
    var iframes = formDiv.getElementsByTagName("iframe");
    if (iframes && iframes.length > 0) {
      // Montar a URL do formulário.
      var url = 'form' + PAGES_EXTENSION + '?sys=' + properties.sys + '&action=openform&formID=' + properties.form + '&align=0' + (!isNullable(properties.mode) ? '&mode=' + properties.mode : '') + '&goto=' + (!isNullable(properties.gotoRow) ? properties.gotoRow : -1) + '&filter=' + (!isNullable(properties.filter) ? properties.filter : '') + '&scrolling=' + (properties.scrollbars ? 'yes' : 'no') + (!isNullable(properties.onClose) ? '&onClose=' + properties.onClose : '');

      // Verificar se a URL é diferente da aberta no iframe.
      if (iframes[0].src != url && iframes[0].src != getAbsolutContextPath() + url) {
        // Alterar a URL do iframe.
        iframes[0].src = url;
      }
    }
  }

  if ($mainform().isLoginForm || mainSystemFrame) {
    if ($mainform().isLoginForm && !mainSystemFrame) mainSystemFrame = top;
    if (!mainSystemFrame.floatingForms) mainSystemFrame.floatingForms = [];
    if (!mainSystemFrame.formHierarchy) mainSystemFrame.formHierarchy = {};

    if (mainSystemFrame.floatingForms.indexOf("WFRIframeForm" + properties.form) == -1) {
      properties.context = window;
      mainSystemFrame.openFloatingForm(properties);
    } else if (formDiv) {
      if (formDiv.className.indexOf("WFRIframeForm-Active") === -1) {
        formDiv.style.zIndex = ++mainSystemFrame.lastFormZindex;

        var activeForms = mainSystemFrame.document.getElementsByClassName("WFRIframeForm-Active");
        if (activeForms.length > 0) {
          try { activeForms[0].getElementsByTagName("iframe")[0].contentWindow.document.getElementsByTagName("iframe")[0].contentWindow.document.activeElement.blur(); } catch (e) { }
          activeForms[0].className = activeForms[0].className.replace(" WFRIframeForm-Active", "");
        }

        formDiv.className += " WFRIframeForm-Active";
      }

      // Obter a div de formulários minimizados.
      var minimizedDivs = mainSystemFrame.document.getElementById("minimizedFloatingDivs");

      // Obter a div de minimizado do formulário flutuante alvo.
      var minimizedDiv = mainSystemFrame.document.getElementById("Min" + formDiv.id);
      if (minimizedDivs && minimizedDiv) {
        // Deletar div de minimizado do formulário flutuante.
        minimizedDivs.removeChild(minimizedDiv);
        minimizedDiv = null;

        // Remover classe de janela minimizada.
        if (formDiv.className.indexOf(" WFRIframeForm-Minimized") != -1) {
          formDiv.className = formDiv.className.replace(" WFRIframeForm-Minimized", "");
        }

        // Resetar display do formulário flutuante.
        formDiv.style.display = null;

        // Resetar estado de minimizado.
        if (formDiv.resetMinimizedState) {
          formDiv.resetMinimizedState();
        }
      }
    }
  } else {
    interactionError(safeGetLocaleMessage("ERROR.FLOATING_FORM_FROM_WINDOW"));
  }

  return formDiv;
}

function safeGetLocaleMessage(key) {
  return getLocaleMessage ? getLocaleMessage(key) :
    $mainform() && $mainform().getLocaleMessage ? $mainform().getLocaleMessage(key) :
    $mainform() && $mainform().opener && $mainform().opener.getLocaleMessage ?
      $mainform().opener.getLocaleMessage(key) : null;
}

function openWFRForm(id, frm, w, h, mode, codigo, codFormComp, formDescription) {
  var janela;
  if (typeof(codigo) != "undefined") {
    janela = openWFRFilterForm2(id, frm, w, h, '', mode, codigo, codFormComp);
  } else {
    janela = openWFRFilterForm(id, frm, w, h, '', mode);
  }
}

function openWFRFilterForm2(id, frm, w, h, filter, mode, codigo, codFormComp) {
  var smode = '';
  if (typeof(mode) != "undefined") smode = '&mode=' + mode;
  var left = (screen.width - w) / 2;
  var top = (screen.height - h - 60) / 2;
  var janela = MM_openBrWindow('form' + PAGES_EXTENSION + '?codFormComp=' + codFormComp + '&codigo=' + codigo + '&sys=' + id + '&action=openform&formID=' + URLEncode(frm, "GET") + '&align=0&goto=-1&filter=' + filter + smode, frm, 'toolbar=no,location=no,status=yes,menubar=no,scrollbars=no,resizable=no,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
  janela.doOnLoad = true;
  return janela;
}

function openWFRFilterForm(id, frm, w, h, filter, mode) {
  if (w && h) {
    var smode = '';
    if (typeof(mode) != "undefined") smode = '&mode=' + mode;
    var left = (screen.width - w) / 2;
    var top = (screen.height - h - 60) / 2;
    var janela = MM_openBrWindow('form' + PAGES_EXTENSION + '?sys=' + id + '&action=openform&formID=' + URLEncode(frm, "GET") + '&align=0&goto=-1&filter=' + filter + smode, frm, 'toolbar=no,location=no,status=yes,menubar=no,scrollbars=no,resizable=no,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
    janela.doOnLoad = true;
  } else {
    var smode = '';
    if (typeof(mode) != "undefined") smode = '&mode=' + mode;
    var janela = MM_openBrWindow('form' + PAGES_EXTENSION + '?sys=' + id + '&action=openform&formID=' + URLEncode(frm, "GET") + '&align=0&goto=-1&filter=' + filter + smode, frm, 'toolbar=no,location=no,status=yes,menubar=no,scrollbars=no,resizable=no');
    janela.doOnLoad = true;
  }

  return janela;
}

function openWFRFilterFormXY(id, frm, w, h, filter, mode, x, y) {
  var smode = '';
  if (typeof(mode) != "undefined") smode = '&mode=' + mode;
  var left = x ? x : (screen.width - w) / 2;
  var top = y ? y : (screen.height - h - 60) / 2;
  var janela = MM_openBrWindow('form' + PAGES_EXTENSION + '?sys=' + id + '&action=openform&formID=' + URLEncode(frm, "GET") + '&align=0&goto=-1&filter=' + filter + smode, frm, 'toolbar=no,location=no,status=yes,menubar=no,scrollbars=no,resizable=no,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
  janela.doOnLoad = true;
  return janela;
}

function openSystemCheck(sys) {
  return openFloatingUrl("systemCheck" + PAGES_EXTENSION + "?sys=" + sys,
    "SystemCheck" + sys, null, 685, 500, null, false, true, true);
}

function openUpload(id, frm, c, crip, showRemove, haveImage) {
  return openFloatingUrl("upload" + PAGES_EXTENSION +
    "?sys=" + id +
    "&formID=" + URLEncode(frm, "GET") +
    "&comID=" + c +
    (showRemove ?  "&showRemove=true" : "") +
    (haveImage ?  "&image=true" : ""),
    "UPLOAD" + frm, null, 600, 225, null, false, true);
}

function openRuleUpload(sys, formId, ruleName, url, params, ruleValidation, multiple) {
  return openFloatingUrl(getAbsolutContextPath() +
    "upload" + PAGES_EXTENSION +
    "?sys=" + sys +
    "&formID=" + formId +
    "&ruleName=" + URLEncode(ruleName, "GET") +
    "&url=" + URLEncode(url, "GET") + params +
    "&ruleValidation=" + URLEncode(ruleValidation, "GET") +
    "&ruleUpload=true" +
    "&multiple=" + multiple,
    "RuleUpload" + formId, null, 600, 225, null, false, true);
}

function openCapture(id, frm, c) {
  var w = Math.max($controller().getElementByCode(c).width, 600);
  var h = Math.max($controller().getElementByCode(c).height, 310);

  // Manter proporção 4:3 se baseando no maior lado e redimensionando o menor
  if (w / 4 > h / 3) h = Math.round(w / 4 * 3);
  else w = Math.round(h / 3 * 4);

  var left = (screen.width - w) / 2;
  var top = (screen.height - h) / 2;

  if (isIE || isIE11) return MM_openBrWindow('camera_legacy' + PAGES_EXTENSION + '?detectflash=false&sys=' + id + '&formID=' + URLEncode(frm, "GET") + '&comID=' + c + '&width=' + w + '&height=' + h, 'UPLOAD' + frm, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
  else return MM_openBrWindow('camera' + PAGES_EXTENSION + '?detectflash=false&sys=' + id + '&formID=' + URLEncode(frm, "GET") + '&comID=' + c + '&width=' + w + '&height=' + h, 'UPLOAD' + frm, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
}

function openDigitalCapture(id, frm, c, crip) {
  return openFloatingUrl("digitalcapture" + PAGES_EXTENSION +
    "?sys=" + id +
    "&formID=" + URLEncode(frm, "GET") +
    "&comID=" + c +
    "&crip=" + crip,
    "DigitalCapture", null, 350, 250, null, true, false);
}

function openQueryDigitalCapture(id, field) {
  return openFloatingUrl("digitalcapture" + PAGES_EXTENSION +
    "?sys=" + id +
    "&field=" + field +
    "&for=query",
    "DigitalCapture", null, 350, 250, null, true, false);
}

function openLogonDigitalCapture(id, dataConnection) {
  return openFloatingUrl("digitalcapture" + PAGES_EXTENSION +
    "?sys=" + id +
    "&dataConnection=" + dataConnection +
    "&for=logon",
    "DigitalCapture", null, 350, 250, null, true, false);
}

function openActionDigitalCapture(id, p, type, to, sw, msg) {
  return openFloatingUrl("digitalcapture" + PAGES_EXTENSION +
    "?sys=" + id +
    "&procedure=" + p +
    "&type=" + type +
    "&timeout=" + to +
    "&showwindow=" + sw +
    "&message=" + msg +
    "&for=action",
    "DigitalCapture", null, 350, 250, null, true, false);
}

function openRuleDigitalCapture(sys, formId, ruleName, type) {
  return openFloatingUrl("digitalcapture" + PAGES_EXTENSION +
    "?sys=" + sys +
    "&formID=" + URLEncode(formId, "GET") +
    "&ruleName=" + URLEncode(ruleName, "GET") +
    "&for=rule" +
    (type ? "&type=" + type : ""),
    "DigitalCapture", null, 350, 250, null, true, false);
}

function WFRZoomImg(url, w, h) {
  return openFloatingUrl("zoom" + PAGES_EXTENSION +
    "?" + url, "WFRZOOM", null, w + 45, h + 45, null, false, true, true);
}

function customZoomImage(url, width, height) {
  var left = (screen.width - width) / 2;
  var top = (screen.height - height) / 2;
  return MM_openBrWindow('customZoom' + PAGES_EXTENSION + '?' + url, 'CustomZoom', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=' + width + ',height=' + height + ',left=' + left + ',top=' + top);
}

function openFormAccess(sys, frm, name) {
  return openFloatingUrl("comaccess" + PAGES_EXTENSION +
    "?type=F&sys=" + sys +
    "&form=" + URLEncode(frm, "GET") +
    "&name=" + URLEncode(name, "GET"),
    "DigitalCapture", null, 865, 450, null, false, true);
}

function openComAccess(sys, frm, com, name, comName) {
  return openFloatingUrl("comaccess" + PAGES_EXTENSION +
    "?type=C&sys=" + sys +
    "&form=" + URLEncode(frm, "GET") +
    "&com=" + com +
    "&name=" + URLEncode(name, "GET") +
    "&comName=" + URLEncode(comName, "GET"),
    "COMACCESS", null, 865, 450, null, false, true);
}

function openReportAccess(sys, report, name) {
  return openFloatingUrl("comaccess" + PAGES_EXTENSION +
    "?type=R&sys=" + sys +
    "&report=" + report +
    "&name=" + URLEncode(name, "GET"),
    "COMACCESS", null, 865, 450, null, false, true);
}

function openMenuAccess(sys, menu, form, name, report) {
  return openFloatingUrl("comaccess" + PAGES_EXTENSION +
    "?type=M&sys=" + sys +
    "&menu=" + menu +
    "&name=" + URLEncode(name, "GET") +
    "&menuForm=" + URLEncode(frm, "GET") +
    "&menuReport=" + (report ? report : ""),
    "COMACCESS", null, 865, 450, null, false, true);
}

function openWFRPassword(sys) {
  return openFloatingUrl("password" + PAGES_EXTENSION + "?sys=" + sys,
    "WFRPassword", null, 410, 380, null, false, false);
}

function openWFRPassword2(sys, msgKey) {
  return openFloatingUrl("password" + PAGES_EXTENSION +
    "?sys=" + sys + "&msgKey=" + URLEncode(msgKey, "GET"),
    "WFRPassword", null, 410, 380, null, false, false);
}

function pt(v) {
  var r = parseInt(v.replace('px', '').replace('pt', ''));
  if (isNaN(r)) return document.body.clientHeight;
  else return r;
}

function openWFRProgressbar(sys, text) {
  var left = (parent.screen.width - 300) / 2;
  var top = (parent.screen.height - 120) / 2;
  return MM_openBrWindow('progressbar' + PAGES_EXTENSION + '?sys=' + sys + '&text=' + text, 'WFRProgressbar' + sys, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=300,height=120,left=' + left + ',top=' + top);
}

function openWFRReport(sys, rid, title, ptf) {
  return openFloatingUrl("report" + PAGES_EXTENSION +
    "?sys=" + sys +
    "&reportID=" + rid +
    "&title=" + URLEncode(title, "GET") +
    "&ptf=" + ptf,
    isNaN(rid) ? "WFRReport" + sys : "WFRReport" + rid, title, 440, 440, null, false, true);
}

function openWFRReport2(sys, rid, fid, title, useFormFields, filter) {
  return openFloatingUrl("report" + PAGES_EXTENSION +
    "?sys=" + sys +
    "&reportID=" + URLEncode(rid, "GET") +
    "&formID=" + URLEncode(fid, "GET") +
    "&title=" + URLEncode(title, "GET") +
    "&useFormFields=" + useFormFields +
    "&filter=" + filter,
    isNaN(rid) ? "WFRReport" + sys : "WFRReport" + rid, title, 600, 450, null, false, true, false, "fas fa-chart-line mr-2");
}

function openWFRReportFinal(rid, file, type, nopopup) {
  var scroll = "yes";
  var menu = "yes";
  if (type == 'PDF') {
    scroll = "no";
    menu = "no";
  }

  if (type == 'REM' || type == 'TXT' || type == 'XLS' || type == 'RTF') {
    window.location = file;
  } else {
    var win = window;
    if (!document.body) {
      document.writeln("<body></body>");
    }

    // #### Caso a largura da tela seja 0 e exista parent, então obtém-se o window deste
    if (document.body.clientWidth == 0 && window.parent) {
      win = window.parent;
    }

    var w, h;
    if (parent && parent.screen) {
      w = parent.screen.availWidth;
      h = parent.screen.availHeight;
    } else {
      w = screen.availWidth;
      h = screen.availHeight;
    }

    if (win.parent) {
      win = win.parent;
    }

    return MM_openBrWindow(file, 'WFRReportOpen' + rid, 'toolbar=no,location=no,status=no,menubar=' + menu + ',scrollbars=' + scroll + ',resizable=no,width=' + w + ',height=' + h + ',left=0,top=0');
  }
}

function openWFRHTML(u) {
  return MM_openBrWindow(u, 'WFRReportOpen', 'toolbar=no,location=no,status=no,menubar=yes,scrollbars=yes,resizable=no,width=' + screen.availWidth + ',height=' + screen.availHeight + ',left=0,top=0');
}

function openWFRLocalReport(u) {
  window.location = u;
}

function openWFRExport(sys, f, type) {
  if (!document.navAction) MM_openBrWindow('export' + PAGES_EXTENSION + '?sys=' + sys + '&formID=' + URLEncode(f, "GET") + '&type=' + type, 'WFRExport', 'toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width=' + screen.availWidth + ',height=' + screen.availHeight + ',left=0,top=0');
}

function openDefaultValues(sys, fId) {
  return openFloatingUrl("defaultValues" + PAGES_EXTENSION +
    "?sys=" + sys + "&formID=" + URLEncode(fId, "GET"),
    "WFRDefaultValues", safeGetLocaleMessage("LABEL.DEFAULT_VALUES"), 400, 400, null, false, true, false);
}

function openWFRImport(sys) {
  var left = (screen.width - 395) / 2;
  var top = (screen.height - 295) / 2;
  return MM_openBrWindow('import' + PAGES_EXTENSION + '?sys=' + sys, 'WFRImport', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=485,height=350,left=' + left + ',top=' + top);
}

function openWFRHelp(sys, file) {
  return parent.MM_openBrWindow(file, 'WFRHelp' + sys, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=' + screen.availWidth + ',height=' + screen.availHeight + ',left=0,top=0');
}

function openWFRSQLScriptExecute(sys) {
  return openFloatingUrl("ExecuteScript" + PAGES_EXTENSION + "?sys=" + sys,
    "WFRSQLScriptExecute" + sys, null, 790, 450, null, false, true);
}

function openWFRConfigureSubconnections(sys) {
  return parent.openFloatingUrl("configureSubconnections.do?sys=" + sys,
    "WFRConfigureSubconnections" + sys, null, 500, 430, null, false, true);
}

function openWFRDataImport(sys, formID) {
  return openFloatingUrl("importadorDados" + PAGES_EXTENSION +
    "?sys=" + sys +
    "&formID=" + URLEncode(formID, "GET"),
    "FileImport", null, 700, 600, null, false, true);
}

function openFormQuery(t, sys, fid, tit, w, h) {
  if (!edit && !insert) {
    u = 'basic_query' + PAGES_EXTENSION + '?sys=' + sys + '&formID=' + URLEncode(fid, "GET") + '&title=' + tit + '&width=' + (w - 10) + '&height=' + (h - 100);
    MM_setTextOfLayer(t, '', '<iframe name=WFRFormQuery src=\"' + u + '\" width=' + w + ' height=' + h + ' frameborder=no border=0 marginwidth=0 marginheight=0 scrolling=no></iframe>');
  } else if (insert) {
    interactionInfo(safeGetLocaleMessage("INFO.INCLUDE_MODE_EXIT"));
    queryMode = false;
  } else if (edit) {
    interactionInfo(safeGetLocaleMessage("INFO.EDIT_MODE_EXIT"));
    queryMode = false;
  }
}

function $w(n, d) {
  return MM_findObj(n, d);
}

function $mainform() {
  try {
    if (parent && parent.mainsystem) {
      return parent.mainsystem;
    } else if (parent && parent.mainform) {
      return parent.mainform;
    } else {
      return window;
    }
  } catch (e) {
    return window;
  }
}

function $mainframe() {
  try {
    if (parent && parent.mainframe) {
      return parent.mainframe;
    } else {
      return window;
    }
  } catch (e) {
    return window;
  }
}

function $controller() {
  return $mainform().controller;
}

function $c(component, formID) {
  return $controller().getElementById(component, formID);
}

function openFormLog(sys, fid, tit, pkeys, tipoLog) {
  return openFloatingUrl("log" + PAGES_EXTENSION +
    "?sys=" + sys +
    "&formID=" + URLEncode(fid, "GET") +
    "&title=" + tit +
    "&pkeys=" + pkeys +
    "&tipoLog=" + (tipoLog ? tipoLog : "2"),
    "Log", null, mainSystemFrame.innerWidth, mainSystemFrame.innerHeight, null, false, true);
}

function setNavText(tx, bc, tc) {
  MM_setTextOfLayer('WFRNavMsg', '', '<table width=100% height=100% border=0 cellpadding=0 cellspacing=0 bgcolor=' + bc + '><tr><td><center><font color=' + tc + '><b>' + tx + '</b></font></center></td></tr></table>');
}

function trim(str) {
  var result = "";
  if (str) {
    result = str.toString().replace(/^\s+|\s+$/g, '');
  }
  return result;
}

function executeStoredProcedure(id, frm, name, params) {
  u = 'storedprocedure.do?sys=' + id + '&action=storedprocedure&formID=' + URLEncode(frm) + '&name=' + name + '&params=' + params;
  WFRFormComands.location = u;
}

function executeStoredProcedureRT(id, frm, name, obj) {
  params = '';
  for (j = 0; j < obj.length; j++) {
    o = MM_findObj(obj[j]);
    if (params != '') params = params + '$;$';
    params = params + o.value;

  }

  u = 'storedprocedure.do?sys=' + id + '&action=storedprocedure&formID=' + URLEncode(frm, "GET") + '&name=' + name + '&params=' + params;
  WFRFormComands.location = u;
}

function executeStoredProcedureAfterSubmit(id, frm, name, params) {
  if (controller.checkRequireds()) {
    MM_findObj('storedProcedureName').value = name;
    MM_findObj('storedProcedureParams').value = params;

    MM_findObj('param').value = 'post';
    MM_findObj('goto').value = formrow;
    MM_findObj('WFRForm').submit();

    MM_findObj('storedProcedureName').value = '';
    MM_findObj('storedProcedureParams').value = '';
  }
}

function validate_CPF(s) {
  if (isNaN(s) || (s.length < 11) || (s === "00000000000") || (s === "11111111111") || (s === "22222222222") || (s === "33333333333") || (s === "44444444444") || (s === "55555555555") || (s === "66666666666") || (s === "77777777777") || (s === "88888888888") || (s === "99999999999")) {
    return false;
  }
  var i;
  var c = s.substr(0, 9);
  var dv = s.substr(9, 2);
  var d1 = 0;
  for (i = 0; i < 9; i++) {
    d1 += c.charAt(i) * (10 - i);
  }
  if (d1 == 0) return false;
  d1 = 11 - (d1 % 11);
  if (d1 > 9) d1 = 0;
  if (dv.charAt(0) != d1)  return false;
  d1 *= 2;
  for (i = 0; i < 9; i++) {
    d1 += c.charAt(i) * (11 - i);
  }
  d1 = 11 - (d1 % 11);
  if (d1 > 9) d1 = 0;
  if (dv.charAt(1) != d1) return false;
  return true;
}

function validate_CGC(s) {
  if (isNaN(s)) return false;
  var i;
  var c = s.substr(0, 12);
  var dv = s.substr(12, 2);
  var d1 = 0;
  for (i = 0; i < 12; i++) {
    d1 += c.charAt(11 - i) * (2 + (i % 8));
  }
  if (d1 == 0) return false;
  d1 = 11 - (d1 % 11);
  if (d1 > 9) d1 = 0;
  if (dv.charAt(0) != d1) return false;
  d1 *= 2;
  for (i = 0; i < 12; i++) {
    d1 += c.charAt(11 - i) * (2 + ((i + 1) % 8));
  }
  d1 = 11 - (d1 % 11);
  if (d1 > 9) d1 = 0;
  if (dv.charAt(1) != d1) return false;
  return true;
}

function CPF(v) {
  if (v == '') return true;
  v = v.replace('.', '').replace('.', '');;
  v = v.replace('-', '');
  return validate_CPF(v);
}

function CNPJ(v) {
  if (v == '') return true;
  v = v.replace('.', '').replace('.', '');
  v = v.replace('-', '');
  v = v.replace('/', '');
  return validate_CGC(v);
}


function getHTTPObject() {
  return new XMLHttpRequest();
}

function getHTTPObjectXML() {
  var httpRequest = getHTTPObject();
  if (httpRequest.overrideMimeType) {
    httpRequest.overrideMimeType('text/xml');
  }
  return httpRequest;
}


function fixXMLDocument(doc) {
  if (!IE) fixXMLNode(doc.documentElement);
}

function fixXMLNode(node) {
  var children = node.childNodes;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if ((trim(child.nodeValue) == '') && (!child.tagName)) {
      child.parentNode.removeChild(child);
    } else fixXMLNode(child);
  }
}

function loadXML(xml) {
  // code for IE
  if (window.ActiveXObject) {
    var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(xml);
    return xmlDoc;
  }
  // code for Mozilla, Firefox, Opera, etc.
  else if (document.implementation && document.implementation.createDocument) {
    return (new DOMParser()).parseFromString(xml, "text/xml");;
  } else {
    alert('Your browser cannot handle this script');
  }
}

var httpprocessing = false;

function evalResponse() {}

function doEval(s) {
  lastReceivedCommand = s;
  eval(s);
}

function replaceAll(str, from, to) {
  str = str.toString();
  var idx = (str).indexOf(from);
  while (idx > -1) {
    str = str.replace(from, to);
    idx = str.indexOf(from);
  }
  return str;
}

function convertNonUnicodeChars(value) {
  if (IE && !isNullable(value) && value.length > 0) {
    return value.replace(/\x80/g, String.fromCharCode(8364));
  }
  return value;
}

var lastReceivedContent = "";

function getAndEvalReturn(http) {
  if (http.readyState == 4) {
    iniprofile = (new Date()).getTime();
    try {
      var content = convertNonUnicodeChars(http.responseText);
      lastReceivedContent = content;
      eval(content);
    } catch (e) {
      if (e) interactionError(e.toString());
    } finally {
      hideWait();
      httpPool.leave(http);
    }
    window.status = 'Processado em ' + ((new Date()).getTime() - iniprofile) + 'ms';
    httpprocessing = false;
  }
}

function getAndEval(url) {
  if (httpprocessing) {} else {
    httpprocessing = true;
    showWait();
    timeout(getAndEval2, 0, [url]);
  }
}

function getAndEval2(url, throwsException) {
  showWait();
  var http = httpPool.get();
  try {
    http.open('GET', url, true);
    http.onreadystatechange = function() {
      var httpObject = http;
      getAndEvalReturn(httpObject);
    };
    http.send(null);
    httpPool.leave(http);
  } catch (e) {
    if (throwsException) {
      throw e;
    } else {
      getAndEval2(url, true);
    }
  }
}

function getAndEvalSync(url) {
  if (httpprocessing) {} else {
    httpprocessing = true;
    showWait();
    timeout(getAndEvalSync2, 0, [url]);
  }
}


function getAndEvalSync2(url, throwsException) {
  showWait();
  var http = httpPool.get();
  try {
    http.open('GET', url, false);
    http.send(null);
    var content = convertNonUnicodeChars(http.responseText);
    httpPool.leave(http);
    throwsException = true;
    hideWait();
    httpprocessing = false;
    lastReceivedContent = content;
    return eval(content);
  } catch (e) {
    if (throwsException) throw e;
    else return getAndEvalSync2(url, true);
  }
}

function get(url, throwsException, child) {
  let async = throwsException;
  try {
    try {mainform} catch (e) {mainform = top.$mainform().mainform;}
    if (!child && (mainform.isPrincipal || mainform.isLoginForm || e_access)) async =
      !(isFirefox && url && url.toLowerCase().indexOf("closesystem.do") >= 0);
    var http = httpPool.get();
    http.open('GET', url, async);
    http.send(null);
    httpPool.leave(http);
  } catch (e) {
    if (throwsException) throw e;
    else get(url, true);
  }
}

function getURL(url, throwsException) {
  return get(url, throwsException);
}

/**
 * Método responsável por realizar um post do formulário em uma determinada URL.
 * @param {*} url
 * @param {*} throwsException
 * @param {*} child
 * @param {*} formData
 */
function postForm(url, throwsException, child, formData) {
  let async = throwsException;
  try {
    try {mainform} catch (e) {mainform = top.$mainform().mainform;}
    if (!child && (mainform.isPrincipal || mainform.isLoginForm || e_access)) async = true;
    let contentType = "application/x-www-form-urlencoded";
    if (isSafari) contentType += ";charset=UTF-8";
    var http = httpPool.get();
    http.open('POST', url, async);
    http.setRequestHeader("Accept", "application/javascript,*/*;q=0.9");
    http.setRequestHeader("Content-Type", contentType);
    http.send(formData);
    httpPool.leave(http);
  } catch (e) {
    if (throwsException) throw e;
    else postForm(url, true, false, formData);
  }
}

function getAbsolutContextPath() {
  var indice = location.pathname.lastIndexOf('/');
  var path = location.pathname.substring(0, indice + 1);
  var url = location.protocol + "//" + location.host + path;
  return url;
}

function timeout(handler, delay, fparams) {
  var self = this;
  var params = fparams;
  var wrapper = function() {
    if (params) handler.apply(self, params);
    else handler.apply(self);
  };
  return window.setTimeout(wrapper, delay ? delay : 0);
}

function getXMLContent(url) {
  if (!httpprocessing) {
    var http = getHTTPObjectXML();
    try {
      httpprocessing = true;
      http.open('GET', url, false);
      http.send(null);
      httpprocessing = false;

      var xmldoc = http.responseXML;

      if (xmldoc) {
        var node = xmldoc.getElementsByTagName('root');
        if (node) {
          node = node.item(0);
          if (node) {
            var node = node.getElementsByTagName('error');
            if (node && node.item(0)) {
              node = node.item(0);
              timeout(interactionError, 0, [node.getAttribute('message'), null, null, null, node.firstChild.nodeValue]);
              return null;
            }
          }
        }
      }
      return xmldoc;
    } catch (e) {
      httpprocessing = false;
      interactionError(getLocaleMessage("ERROR.GET_XML_DATA_FAILED") + "<br>" + e.toString());
    }
  } else {
    return null;
  }

}

function getAsyncXMLContent(url, fCallbackOK, fCallbackError, params) {
  var http = getHTTPObjectXML();
  try {
    http.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        fCallbackOK(this, params);
      }
    }
    http.onerror = fCallbackError;
    http.open('GET', url, true);
    http.send(null);
  } catch (e) {}
}

function getContent(url, throwsException, dontConvertUnicodeChars, aSync) {
  var http = httpPool.get();
  try {
    http.open('GET', url, aSync ? true : false);
    http.send(null);
    var content = http.responseText;
    if (!dontConvertUnicodeChars) content = convertNonUnicodeChars(content);
    httpPool.leave(http);
    return content;
  } catch (e) {
    if (throwsException) throw e;
    else return getContent(url, true, dontConvertUnicodeChars);
  }
}

function hideMainMessage() {
  if (document.messageDIV) {
    document.body.removeChild(document.messageDIV);
    document.messageDIV = null;
  }
}

function showWait() {
  httpprocessing = true;
  try {
    if (mainform.document.ac) mainform.document.ac.showProcessing(true);
  } catch (e) {}
}

function hideWait() {
  httpprocessing = false;
  try {
    if (mainform.document.ac) mainform.document.ac.showProcessing(false);
  } catch (e) {}
}

function setFocus() {
  try {
    if (IE && document.body)
      document.body.focus();
    else
      window.focus();
  } catch (e) {
    try {
      window.focus();
    } catch (e2) {}
  }
}

function getWindowHeight() {
  var dimensions = getWindowDimensions();
  return dimensions.height;
}

function getWindowWidth() {
  var dimensions = getWindowDimensions();
  return dimensions.width;
}

function getWindowDimensions() {
  var myWidth = 0,
    myHeight = 0;

  if (typeof(window.innerWidth) == 'number') {
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if (document.documentElement &&
    (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }

  return {
    width: myWidth,
    height: myHeight
  };
}

function getDocumentWidth(doc) {
  var dimensions = getDocumentDimensions(doc);
  return dimensions.width;
}

function getDocumentHeight(doc) {
  var dimensions = getDocumentDimensions(doc);
  return dimensions.height;
}

function getDocumentDimensions(doc) {
  var myHeight = Math.max(
    doc.body.scrollHeight, doc.documentElement.scrollHeight,
    doc.body.offsetHeight, doc.documentElement.offsetHeight,
    doc.body.clientHeight, doc.documentElement.clientHeight);
  var myWidth = Math.max(
    doc.body.scrollWidth, doc.documentElement.scrollWidth,
    doc.body.offsetWidth, doc.documentElement.offsetWidth,
    doc.body.clientWidth, doc.documentElement.clientWidth);
  return {
    width: myWidth,
    height: myHeight
  };
}

/**
 * Exibe uma mensagem de espera para o usuário
 * @param msg Mensagem a ser exibida
 * @param context Mensagem a ser exibida
 */
function showMainMessage(msg, context) {
  var win = context ? context : $mainform();

  if (msg && msg.length > 0) {
    var div = document.createElement("div");
    div.id = "WFRReportMessageWait";
    div.name = "WFRReportMessageWait";
    div.className = "position-absolute w-100 h-100 p-3 d-flex align-items-center justify-content-center"; // Bootstrap
    div.style.top = "0px";
    div.style.bottom = "0px";
    div.style.left = "0px";
    div.style.right = "0px";
    div.style.zIndex = "100001";
    div.style.pointerEvents = "none";

    var alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-warning text-wrap break-word";
    alertDiv.style.maxWidth = "30rem";
    alertDiv.style.wordBreak = "break-word";
    alertDiv.style.pointerEvents = "all";
    alertDiv.textContent = msg;
    div.appendChild(alertDiv);

    win.document.messageDIV = div;
    win.document.body.appendChild(div);

    if (win.parent) {
      win.parent.hideMainMessage = function() {
        win.hideMainMessage();
      }
    }
  } else {
    win.hideMainMessage();
  }
}

function so_clearInnerHTML(obj) {}

function doEnter(evt, func, nextInput) {
  if (evt.keyCode == 13 || evt.keyCode == 10) {
    func();
    return false;
  } else if (evt.keyCode == 9) {
    if (nextInput && $w(nextInput)) {
      $w(nextInput).focus();
      return false;
    }
  } else if (evt.keyCode == 34) {
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      evt.keyCode = 0;
      evt.returnValue = false;
    }

    var grid = WFRQueryResults.obj;
    if (grid) {
      grid.setProperty("selection/index", 0);
      grid.element().focus();
    }

    return false;
  }
  return true;
}

function isDescendant(parent, child) {
  if (!parent || !child) return false;
  var node = child.parentNode;
  while (node != null) {
    if (node == parent) return true;
    node = node.parentNode;
  }
  return false;
}


/**
 *
 *  URL encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var Url = {
  // public method for url encoding
  encode: function(string) {
    return escape(this._utf8_encode(string)).replace(/\+/g, "%2B");
  },

  // public method for url decoding
  decode: function(string) {
    return this._utf8_decode(unescape(string));
  },

  // private method for UTF-8 encoding
  _utf8_encode: function(string) {

    //Correção para ultima versão do firefox.
    //ao aplicar o replece sobre um campo undefined gerava um bug.
    if (string == undefined)
      string = '';

    string = string.toString().replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }

    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode: function(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while (i < utftext.length) {

      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }

    }

    return string;
  }

}

function URLEncode(plaintext, forceUTF8) {
  if (opener && !(opener.isDotNET) || !($mainform().isDotNET)) {
    if (opener && !(opener.isTomcat7) || !($mainform().isTomcat7)) {
      if (ENCODING === "UTF-8" || arguments[1] !== undefined && arguments[1].toString().toUpperCase() === "GET") {
        return Url.encode(plaintext);
      } else {
        return URLEncode2(plaintext);
      }
    } else {
      if (ENCODING == "UTF-8" && !(arguments[1] !== undefined && arguments[1].toString().toUpperCase() === "GET")) {
        return Url.encode(plaintext);
      } else {
        return URLEncode2(plaintext);
      }
    }
  } else {
    if (ENCODING == "UTF-8") {
      return Url.encode(plaintext);
    } else {
      return URLEncode2(plaintext);
    }
  }
}


function URLEncode2(plaintext) {
  if (plaintext == null || typeof(plaintext) == 'undefined' || plaintext === '' || plaintext.toString() == 'NaN') {
    return "";
  }
  plaintext = plaintext.toString();

  // The Javascript escape and unescape functions do not correspond
  // with what browsers actually do...
  var SAFECHARS = "0123456789" + // Numeric
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + // Alphabetic
    "abcdefghijklmnopqrstuvwxyz" +
    "-_.!~*'()?"; // RFC2396 Mark characters
  var HEX = "0123456789ABCDEF";

  var encoded = "";
  for (var i = 0; i < plaintext.length; i++) {
    var ch = plaintext.charAt(i);
    if (ch == " ") {
      encoded += "+"; // x-www-urlencoded, rather than %20
    } else if (SAFECHARS.indexOf(ch) != -1) {
      encoded += ch;
    } else {
      var charCode = ch.charCodeAt(0);
      if (charCode > 255) {
        encoded += "+";
      } else {
        encoded += "%";
        encoded += HEX.charAt((charCode >> 4) & 0xF);
        encoded += HEX.charAt(charCode & 0xF);
      }
    }
  }

  return encoded;
}

function stringToHTMLString(value) {
  var formated = "";

  if (value) {
    for (var i = 0; i < value.length; i++) {
      var c = value.charAt(i);
      if (c == " ") {
        formated += "&nbsp;";
      } else {
        if (c == "\"") {
          formated += "&quot;";
        } else if (c == "&") {
          formated += "&amp;";
        } else if (c == "<") {
          formated += "&lt;";
        } else if (c == ">") {
          formated += "&gt;";
        } else if (c == "\n") {
          formated += "<br/>";
        } else {
          var ci = 0xffff & c.charCodeAt(0);
          if (ci < 160) {
            formated += c;
          } else {
            formated += "&#";
            formated += parseInt(ci);
            formated += ";";
          }
        }
      }
    }
  }

  return formated;
}

/**
 * Método que escapa tags especiais do XML.
 * @author Janpier.
 * @param {} xml
 * @returns xml escape.
 */
function stringToXMLString (xml) {
  if(xml) {
    return xml.replace(/[<>&'"]/g, function (c) {
            switch (c) {
              case '<' : return '&lt;';
              case '>' : return '&gt;';
              case '&' : return '&amp;';
              case '\'': return '&apos;';
              case '"' : return '&quot;';
            }
          });
  }
  return xml;
};

function stringToJs(value) {
  var formated = "";

  if (!isNullable(value)) {
    value = value.toString();
    for (var i = 0; i < value.length; i++) {
      var c = value.charAt(i);
      if (c == "\\") {
        formated += "\\\\";
      } else if (c == "'") {
        formated += "\\'";
      } else if (c == "\"") {
        formated += "\\\"";
      } else if (c == "\n") {
        formated += "\\n";
      } else if (c == "\r") {} else {
        formated += c;
      }
    }
  }

  return formated;
}

function isTypeOf(obj, clazz) {
  var classCompare = false;
  try {
    classCompare = (classCompare || (obj instanceof eval(clazz)));
    classCompare = (classCompare || (obj.constructor === eval(clazz)));
  } catch (e) {}
  return (typeof obj == clazz || classCompare) || (obj.constructor && obj.constructor.toString && obj.constructor.toString().indexOf('function ' + clazz) != -1);
}

function ArrayInstance(obj) {
  return obj;
}

function JSONInstance(obj) {
  return obj;
}

function JSONInstanceJS(obj) {
  return obj;
}

function serialize(_obj, useQuot, recursive, emptyIfNull) {
  if (isNullable(_obj)) {
    return (emptyIfNull ? '' : 'null');
  }

  var quot = '';
  if (useQuot) {
    quot = '\'';
  }

  switch (typeof _obj) {
    case 'boolean':
    case 'number':
      return _obj;
      break;

    case 'string':
      return quot + stringToJs(_obj) + quot;
      break;

    case 'object':
      var str = '';
      if (isTypeOf(_obj, 'Array')) {
        if (!recursive) {
          str = 'ArrayInstance(';
        }
        str += '[';
        var i, len = _obj.length;
        for (i = 0; i < len - 1; i++) {
          str += serialize(_obj[i], true, true) + ',';
        }
        /* Implementação para corrigir o problema da passagem de uma lista vazia da camada cliente
         * para a camada servidor.
         * Obs.: Foi removida essa solução pois a equipe de teste identificou um impacto. A mesma voltar?
         * para o desenvolvimento.
        str += serialize(_obj[i], true, true, emptyIfNull);
        */
        str += serialize(_obj[i], true, true);
        str += ']';
        if (!recursive) {
          str += ')';
        }
      } else if (isTypeOf(_obj, 'Map')) {
        if (!recursive) {
          str = 'JSONInstance(';
        }
        str += _obj.toStringSerialized(true);
        if (!recursive) {
          str += ')';
        }
      } else if (isTypeOf(_obj, 'Date')) {
        str = quot + 'new Date(' + _obj.getTime() + ')' + quot;
      } else if (isTypeOf(_obj, 'Times')) {
        str = quot + 'new Date(' + _obj.getDate().getTime() + ')' + quot;
      } else if (isTypeOf(_obj, 'Object')) {
        if (!recursive) {
          str = 'JSONInstanceJS(';
        }
        str += '{';
        var key;
        for (key in _obj) {
          if (typeof _obj != 'function') {
            str += '"' + key + '"' + ':' + serialize(_obj[key], true, true) + ',';
          }
        }
        str += 'JSONInstanceJS' + ':' + true + ',';
        str = str.replace(/\,$/, '');
        str += "}";
        if (!recursive) {
          str += ")";
        }
      } else {
        if (!recursive) {
          str = 'JSONInstance(';
        }
        str += '{';
        var key;
        for (key in _obj) {
          if (typeof _obj != 'function') {
            str += key + ':' + serialize(_obj[key], true, true) + ',';
          }
        }
        str = str.replace(/\,$/, '');
        str += "}";
        if (!recursive) {
          str += ")";
        }
      }
      return str;
      break;

    default:
      return (emptyIfNull ? '' : 'null');
      break;
  }
}

function executeRule(sysId, formId, ruleName, params, fields, extraParams) {
  window.setTimeout(function() {
    document.hasRuleErrors = false;
    var id = 'RULE' + parseInt((Math.random() * 9999999));

    var iframe;
    iframe = document.createElement("iframe");
    iframe.name = id;
    iframe.id = id;
    iframe.frameBorder = 0;
    iframe.setAttribute("frameborder", "no");
    iframe.setAttribute("border", 0);
    iframe.setAttribute("marginwidth", 0);
    iframe.setAttribute("marginheight", 0);
    iframe.width = 0;
    iframe.height = 0;
    iframe.style.display = "none";

    if (IE && location.protocol == "https:") {
      iframe.src = "#";
    } else {
      iframe.src = "";
    }

    document.body.appendChild(iframe);

    var frm = document.createElement("form");
    frm.target = id;
    frm.method = "POST";
    frm.action = "executeRule.do";
    document.body.appendChild(frm);

    var hidden;
    hidden = createHiddenForRule("iframeId", id);
    frm.appendChild(hidden);

    hidden = createHiddenForRule("sys", sysId);
    frm.appendChild(hidden);

    /*
     * O ID do formulário pode vir nulo quando executando uma regra ao abrir ou fechar sistema.
     * Momento este que não possui formulário, apenas o sistema
     */
    if (formId != null) {
      hidden = createHiddenForRule("formID", formId);
      frm.appendChild(hidden);
    }

    hidden = createHiddenForRule("action", "executeRule");
    frm.appendChild(hidden);

    hidden = createHiddenForRule("ruleName", ruleName);
    frm.appendChild(hidden);

    if (ENCODING == "UTF-8") {
      hidden = createHiddenForRule("formRulePost", "true");
      frm.appendChild(hidden);
    }

    for (var i = 0; i < params.length; i++) {
      var value = params[i];
      var isObject = (typeof value == 'object');

      if (isObject) {
        if (value) {
          value = value.value;
        }
      }

      var isLiteral = (typeof value == 'string');

      if (!isLiteral) {
        if (value) {
          try {
            value = eval("document.c_" + value + ".getValue()");
          } catch (e) {
            value = "";
          }
        } else {
          value = "";
        }
      }

      hidden = createHiddenForRule("P_" + i, value);
      frm.appendChild(hidden);
      frm["P_" + i] = hidden;

    }

    var position = -1;
    if (extraParams && extraParams.length > 0) {
      for (var i = 0; i < extraParams.length; i++) {
        var param = extraParams[i];
        if (!isNullable(param, true) && !isEvent(param)) {
          position++;
          var hidden = frm["P_" + position];
          if (!hidden) {
            hidden = createHiddenForRule("P_" + position, normalizeRuleParam(param));
            frm.appendChild(hidden);
          } else {
            hidden.value = normalizeRuleParam(param);
          }
        }
      }
    }

    for (var i = 0; i < fields.length; i++) {

      if (!eval("document.c_" + fields[i] + " instanceof HTMLImage")) {
        var value = fields[i];
        var code = fields[i];

        var isObject = (typeof value == 'object');

        if (isObject) {
          code = value.code;
          value = value.value;
        }

        var isLiteral = (typeof value == 'string');

        if (!isLiteral) {
          if (value) {
            try {
              value = eval("document.c_" + value + ".getValue()");
            } catch (e) {
              value = "";
            }

          } else {
            value = "";
          }
        }

        hidden = createHiddenForRule("F_" + i + "_" + code, value);
        frm.appendChild(hidden);
      }
    }

    frm.submit();
  }, 0);
}

function isNullable(value, dontCheckEmpty) {
  return (value == null || typeof value == 'undefined' || (!dontCheckEmpty && value === '') || (value.toString && value.toString() == 'NaN'));
}

function parseBoolean(value) {
  if (value == null || typeof value == "undefined") {
    return false;
  }

  if (typeof value == "boolean") {
    return value;
  }

  if (!value.toString) {
    return false;
  }

  value = trim(value.toString().toUpperCase());

  return value == "1" || value == "S" || value == "V" || value == "T" || value == "Y" || value == "TRUE" || value == "VERDADE" || value == "VERDADEIRO" || value == "YES" || value == "SIM";
}

function parseNumeric(value) {
  if (isNullable(value)) {
    return 0.0;
  }

  if (typeof value == "number") {
    return parseFloat(value);
  }

  if (typeof value == "boolean") {
    if (value) {
      return 1.0;
    } else {
      return 0.0;
    }
  }

  if (!value.toString) {
    return 0.0;
  }

  var groupingPointRegExp = new RegExp(("\\" + GROUPING_POINT), "g");
  value = new String(value).replace(groupingPointRegExp, "").replace(DECIMAL_POINT, ".");

  return parseFloat(value);
}

function normalizeRuleParam(value, dontSerialize) {
  if (value == null || typeof value == "undefined") {
    return "";
  }

  if (typeof value == "number") {
    return value.toString().replace(".", DECIMAL_POINT);
  }

  if (value.maskFormat) { // Date
    var dateFormat;
    if (parent.$mainform().DATE_PATTERN) {
      dateFormat = parent.$mainform().DATE_PATTERN.toLowerCase();
    } else {
      dateFormat = DATE_PATTERN.toLowerCase();
    }
    return value.maskFormat(dateFormat + " HH:MM:ss");
  }

  if (isTypeOf(value, "Times")) {
    return (value.getDate().maskFormat("HH:MM:ss") + "." + value.getDate().getMilliseconds());
  }

  if (!dontSerialize && !isTypeOf(value, "String") && (typeof value == "object")) {
    return serialize(value, false, false, true);
  }

  return value;
}

function executeSyncRule(sysId, formId, ruleName, params, fields) {
  var ruleParams = new Array();
  for (var i = 0; i < params.length; i++) {
    var value = params[i];
    var isObject = (typeof value == 'object');

    if (isObject) {
      if (value) {
        value = value.value;
      }
    }

    var isLiteral = (typeof value == 'string');

    if (!isLiteral) {
      if (value) {
        value = eval("document.c_" + value + ".getValue()");
      } else {
        value = "";
      }
    }

    ruleParams.push(value);
  }

  executeSyncJavaRule(sysId, formId, ruleName, ruleParams);
}

function executeSyncJavaRule(sysId, formId, ruleName) {
  var content;
  var field;
  var fields;
  var i;
  var url = "action=executeRule&pType=2&";
  var value;

  document.hasRuleErrors = false;
  url += "ruleName=" + URLEncode(ruleName, postForceUTF8) + "&";
  url += "sys=" + sysId + "&";
  url += "formID=" + URLEncode((formId ? formId : "")) + "&";
  url += "parentRID=" + (this && this.getRID ? this.getRID() : "");
  if (ENCODING == "UTF-8") {
    url += "&decodedParams=true";
  }

  // Caso existam parâmetros de entrada para a regra
  if (arguments.length > 3) {
    if (arguments[3] instanceof Array) {
      for (i = 0; i < arguments[3].length; i++) {
        value = normalizeRuleParam(arguments[3][i]);

        // Ex.: &P_0=valor
        url += "&P_" + i + "=" + URLEncode(value, postForceUTF8);
      }
    } else {
      for (i = arguments.length - 1; i >= 3; i--) {
        value = normalizeRuleParam(arguments[i]);

        // Ex.: &P_0=valor
        url += "&P_" + (i - 3) + "=" + URLEncode(value, postForceUTF8);
      }
    }
  }

  // Fields da tela Ex.: &F_1_1234=valor
  fields = null;
  try {
    fields = controller ? controller.getAllElements() : [];
    for (i = 0; i < fields.length; i++) {
      field = fields[i];
      if (!(field instanceof HTMLRadioGroupOption) && !(field instanceof HTMLGroupBox) && !(field instanceof HTMLPage)) {
        if (parseInt(field.getCode()) != -1 && field.getCode() !== undefined && field.getCode() !== "undefined") {
          if (field instanceof HTMLRadioGroup) {
            url += "&F_" + i + "_" + field.getCode() + "=" + URLEncode(field.hidden.value, postForceUTF8);
          } else if (field.doc !== undefined) {
            if (field.doc.lastChild.id !== "HTMLRadioGroupOptions") {
              url += "&F_" + i + "_" + field.getCode() + "=" + URLEncode(field.getValue(), postForceUTF8);
            }
          } else {
            url += "&F_" + i + "_" + field.getCode() + "=" + URLEncode(field.getValue(), postForceUTF8);
          }
        }
      }
    }
  } catch (e) {
    //Controller não existe
  }

  content = postURL("executeRule.do", url);
  $mainform().document._ruleReturn = null;
  doEval(content);

  if (document.hasRuleErrors) {
    throw StopRuleExecution();
  }

  return $mainform().document._ruleReturn;
}

function postURL(url, postData) {
  var contentType;
  var content;
  var http = httpPool.get();
  contentType = "application/x-www-form-urlencoded";
  if (isSafari) contentType += ";charset=UTF-8";
  http.open("POST", url, false);
  http.setRequestHeader("Accept", "application/javascript,*/*;q=0.9");
  http.setRequestHeader("Content-Type", contentType);
  http.send(postData);
  content = convertNonUnicodeChars(http.responseText);
  httpPool.leave(http);
  return content;
}

function postURLAsync(url, postData, throwsException, ruleCallback, ruleCallbackError) {
  var http = httpPool.get();
  try {
    var contentType = "application/x-www-form-urlencoded";
    if (isSafari) contentType += ";charset=UTF-8";

    http.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if (ruleCallback) {
          var content = convertNonUnicodeChars(this.responseText);
          executeRuleFromJS(ruleCallback, [content]);
        }
        httpPool.leave(this);
      } else if ((this.status != 200) && (this.readyState == 4)) {
        if (ruleCallbackError) {
          var content = convertNonUnicodeChars('Error ' + this.status);
          executeRuleFromJS(ruleCallbackError, [content]);
        }
        httpPool.leave(this);
      }
    };

    http.open("POST", url, true);
    http.setRequestHeader("Content-Type", contentType);
    http.send(postData);
  } catch (e) {
    if (throwsException) throw e;
    else return postURLAsync(url, postData, true, ruleCallback);
  }
}

function postURLAsyncJs(url, postData, throwsException, callBack) {
  var http = httpPool.get();
  try {
    var contentType = "application/x-www-form-urlencoded";
    if (isSafari) contentType += ";charset=UTF-8";

    http.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if (callBack) {
          callBack(convertNonUnicodeChars(this.responseText));
        }
        httpPool.leave(this);
      }
    };

    http.open("POST", url, true);
    http.setRequestHeader("Content-Type", contentType);
    http.send(postData);
  } catch (e) {
    if (throwsException) throw e;
    else return postURLAsync(url, postData, true, ruleCallback);
  }
}

function createHiddenForRule(name, value) {
  var hidden = document.createElement("input");
  hidden.name = name;
  hidden.type = "hidden";
  hidden.value = value;
  return hidden;
}

function retirarZerosIniciais(value) {
  if (value != null && (typeof value != "undefined")) {
    while (value.charAt(0) == "0" && value.length > 1) {
      value = value.substring(1);
    }
  }
  return value;
}

function firstToUpper(texto) {
  if (texto) {
    if (texto.length == 1) {
      return texto.toUpperCase();
    } else if (texto.length > 1) {
      return texto.substring(0, 1).toUpperCase() + texto.substring(1).toLowerCase();
    } else {
      return "";
    }
  }
}

function executeRuleFromJS(ruleName, params) {
  var reducedName = reduceVariable(ruleName);
  var sysCode = d.WFRForm.sys.value;
  var formCode = d.WFRForm.formID.value;

  var isJava = false;
  var ruleFunction;
  try { ruleFunction = window.eval(reducedName); }
  catch (ex) { isJava = true; }

  var value = null;
  if (isJava) {
    if (params && params instanceof Array && params.length > 0) {
      value = executeSyncJavaRule(sysCode, formCode, ruleName, params);
    } else {
      value = executeSyncJavaRule(sysCode, formCode, ruleName);
    }
  } else {
    var ruleInstance = new ruleFunction(null, sysCode, formCode);
    if (ruleInstance && ruleInstance.run) { // ? JS
      value = executeJSRule(sysCode, formCode, reducedName, params, true);
    }
  }

  return value;
}

function executeJSRule(sysId, formId, funcao, params, throwErrors, extraParams) {
  if (!throwErrors) document.hasRuleErrors = false;
  var paramQryStr = new Array();

  if (params instanceof Array && params.length > 0) {
    for (var position = 0; position < params.length; position++) {
      if (params[position]) {
        var value = params[position];
        var isObject = (typeof value == 'object');
        if (isObject && value && value.value) value = value.value;
        var isLiteral = (typeof value == 'string');

        if (!isLiteral && !isObject) {
          if (value) {
            try { value = document["c_" + value].getValue(); } catch (e) { }
          }
        }

        paramQryStr.push(value);
      } else {
        paramQryStr.push(null);
      }
    }
  }

  if (params instanceof Map) {
    paramQryStr.push(params);
  }

  if (extraParams && extraParams.length > 0) {
    for (var i = 0; i < extraParams.length; i++) {
      var param = extraParams[i];
      if (!isNullable(param, true) && !isEvent(param)) {
        paramQryStr.splice(i, 1, param);
      }
    }
  }

  var func = window.eval(funcao);
  var ruleInstance = new func(null, sysId, formId);

  if (throwErrors) {
    return ruleInstance.run.apply(ruleInstance, paramQryStr);
  } else {
    try {
      /*
       * Meio alternativo de sobrepor um problema no firefox.
       * Ele estava perdendo a referência de parent.mainform quando cliente chamava java.
       */
      parent.mainform;
      return ruleInstance.run.apply(ruleInstance, paramQryStr);
    } catch (ex) {
      handleException(ex);
    }
  }
}

function executeJSRuleNoField(sysId, formId, funcao, params, throwErrors) {
  var paramQryStr = new Array(params.length);
  for (var i = 0; i < params.length; i++) {
    if (params[i]) {
      paramQryStr[i] = params[i];
    } else {
      paramQryStr[i] = null;
    }
  }

  var func;
  try {
    func = eval(funcao);
  } catch (e) {
    func = eval(reduceVariable(funcao));
  }
  var ruleInstance = new func(null, sysId, formId);

  if (throwErrors) {
    return ruleInstance.run.apply(ruleInstance, paramQryStr);
  } else {
    try {
      return ruleInstance.run.apply(ruleInstance, paramQryStr);
    } catch (ex) {
      handleException(ex);
    }
  }
}

function getFormFieldValue(f) {
  var coms = controller.getElementsByField(f);
  var value = "";
  if (coms && coms.length > 0)
    value = coms[0].getValue();
  return value;
}

function changeFormFieldValue(f, v) {
  var coms = controller.getElementsByField(f);
  if (coms) {
    v = normalizeRuleParam(v);
    for (var i = 0; i < coms.length; i++) {
      coms[i].setValue(v, true);
    }
  }
}

function getRuntimeContent(sql, param) {
  return getContent("runtimeContent.do?action=runtimeContent&sys=" + sysCode + "&formID=" + URLEncode(idForm, "GET") + "&sql=" + URLEncode(sql, "GET") + "&param=" + param);
}

function interactionKeydown(evt, code, obj, countOptions) {
  var r = true;
  var TAB = 9;
  var ESC = 27;
  var LEFT = 37;
  var UP = 38;
  var RIGHT = 39;
  var DOWN = 40;
  var SPACE = 32;

  document.disableEvents = true;

  var keyCode = evt.keyCode || evt.which;
  if (keyCode == TAB || keyCode == LEFT || keyCode == RIGHT) {
    var divInteraction = MM_findObj("modal" + code);
    if (divInteraction) findNode(divInteraction, obj).focus();
    r = false;
  } else if (keyCode == ESC) {
    interactionCancel(code);
    r = false;
  } else if (keyCode == SPACE) {
    interactionCancel(code);
    r = false;
  } else if (keyCode == DOWN) {
    if (countOptions && countOptions != 0) {
      var divInteraction = MM_findObj("modal" + code);

      var checkedIndex = -1;
      for (var i = 0; i < countOptions; i++) {
        var interactionChosen = findNode(MM_findObj("modal" + code), "options" + code + "-" + i);
        if (interactionChosen.firstChild.checked) {
          checkedIndex = i;
          break;
        }
      }

      var newIndex = checkedIndex + 1;
      if (newIndex == countOptions) {
        newIndex = 0;
      }

      divInteraction.selectedValue = newIndex;
      var inputToSelect = findNode(divInteraction, "options" + code + "-" + newIndex);
      inputToSelect.firstChild.checked = true;

      r = false;
    }
  } else if (keyCode == UP) {
    if (countOptions && countOptions != 0) {
      var divInteraction = MM_findObj("modal" + code);

      var checkedIndex = -1;
      for (var i = 0; i < countOptions; i++) {
        var interactionChosen = findNode(divInteraction, "options" + code + "-" + i);
        if (interactionChosen.firstChild.checked) {
          checkedIndex = i;
          break;
        }
      }

      var newIndex = checkedIndex - 1;
      if (newIndex == -1) {
        newIndex = countOptions - 1;
      }

      divInteraction.selectedValue = newIndex;
      var inputToSelect = findNode(divInteraction, "options" + code + "-" + newIndex);
      inputToSelect.firstChild.checked = true;

      r = false;
    }
  }

  if (!r) {
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
}

function interactionConfirmWithEvents(msg, f, fParams, fParent, cancelFunction, cancelParams, cancelTarget) {
  interaction(msg, [], [f], [fParams], [fParent], true, cancelFunction, cancelParams, cancelTarget);
}

function interaction(text, radioValues, functions, params, targets, interactionConfirm, cancelFunction, cancelParams, cancelTarget) {
  var btcontentCancel, btcontentOk;

  // Procurar pelo texto do botão "Cancelar" nos locales.
  try { btcontentCancel = $mainform().getLocaleMessage("LABEL.CANCEL"); }
  catch (e) { btcontentCancel = "Cancel"; }

  // Procurar pelo texto do botão "Ok" nos locales.
  try { btcontentOk = $mainform().getLocaleMessage("LABEL.OK"); }
  catch (f) { btcontentOk = "Ok"; }

  // Criar o modal do Bootstrap.
  var modal = bootstrapCreateModal();
  var modalDiv = modal[0];
  var modalHeader = modal[1];
  var modalFooter = modal[3];
  var modalCode = modal[5];

  // Definir a cor do cabeçalho.
  modalHeader.className += " bg-primary text-white"; // Bootstrap

  // Parâmetros/variáveis do Maker para interação
  modalDiv.functions = functions;
  modalDiv.params = params;
  modalDiv.targets = targets;
  modalDiv.cancelFunction = cancelFunction;
  modalDiv.cancelParams = cancelParams;
  modalDiv.cancelTarget = cancelTarget;
  modalDiv.selectedValue = 0;

  // Criar elemento media no corpo do modal.
  var mediaDiv = document.createElement("div");
  mediaDiv.className = "media";
  modal[2].appendChild(mediaDiv);

  // Criar ícone do modal.
  var iconSpan = document.createElement("span");
  iconSpan.className = "fas fa-question-circle align-self-start ml-2 mr-4 text-primary"; // Font Awesome - Bootstrap
  iconSpan.style.fontSize = "3rem";
  mediaDiv.appendChild(iconSpan);

  // Criar corpo do elemento media.
  var mediaBody = document.createElement("div");
  mediaBody.className = "media-body"; // Bootstrap
  mediaDiv.appendChild(mediaBody);

  // Criar título do modal.
  var modalTitle = document.createElement("h5");
  modalTitle.className = "mt-0"; // Bootstrap
  modalTitle.innerHTML = text;
  mediaBody.appendChild(modalTitle);

  // Cria as opções do modal
  for (var i = 0; i < radioValues.length; i++) {
    // Cria o div base do radio box
    var radioDiv = document.createElement("div");
    radioDiv.className = "custom-control custom-radio"; // Bootstrap
    mediaBody.appendChild(radioDiv);

    // Cria o input[type=radio] do radio box
    var radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "option" + modalCode;
    radioInput.id = "option" + modalCode + "-" + i;
    radioInput.className = "custom-control-input"; // Bootstrap
    radioInput.value = i;
    radioInput.style.display = "none";

    // Evento de valor alterado do radio box
    radioInput.addEventListener('change', function() {
      modalDiv.selectedValue = radioInput.value;
    });

    // O primeiro radio deve estar marcado
    if (i == 0) radioInput.checked = true;
    else radioInput.checked = false;

    // Adicionar o input do radio ao seu div
    radioDiv.appendChild(radioInput);

    // Criar o label do radio box
    var radioLabelDiv = document.createElement("div");
    radioLabelDiv.className = "custom-control-label"; // Bootstrap
    radioLabelDiv.style.lineHeight = "100%";
    radioDiv.appendChild(radioLabelDiv);

    var radioLabel = document.createElement("label");
    radioLabel.setAttribute("for", "option" + modalCode + "-" + i);
    radioLabel.innerHTML = radioValues[i];
    radioLabelDiv.appendChild(radioLabel);
  }

  // Criar botão de cancelar.
  var cancelButtonDiv = document.createElement("button");
  cancelButtonDiv.className = "btn btn-secondary"; // Bootstrap
  cancelButtonDiv.type = "button";
  cancelButtonDiv.innerHTML = btcontentCancel;
  modalFooter.appendChild(cancelButtonDiv);

  // Associar eventos ao botão cancelar.
  cancelButtonDiv.onkeydown = function(event) {
    return interactionKeydown(event, modalCode, 'btnCancel', radioValues.length);
  };

  cancelButtonDiv.onclick = function() {
    return interactionCancel(modalCode);
  };

  // Criar botão de cancelar.
  var confirmButtonDiv = document.createElement("button");
  confirmButtonDiv.className = "btn btn-primary"; // Bootstrap
  confirmButtonDiv.type = "button";
  confirmButtonDiv.innerHTML = btcontentOk;
  modalFooter.appendChild(confirmButtonDiv);

  // Associar eventos ao botão confirmar.
  confirmButtonDiv.onkeydown = function(event) {
    return interactionKeydown(event, modalCode, 'btnOk', radioValues.length);
  };

  confirmButtonDiv.onclick = function() {
    interactionOk(modalCode);
  };
}

function interactionOk(code) {
  document.disableEvents = false;

  var modalDiv = document.getElementById('modal' + code);
  if (modalDiv) {
    var functions = modalDiv.functions;
    var params = modalDiv.params;
    var targets = modalDiv.targets;
    var selectedValue = modalDiv.selectedValue;

    if (functions && functions.length > selectedValue && functions[selectedValue]) {
      var functionToCall = functions[selectedValue];
      var hasParams = params && params.length > selectedValue && params[selectedValue];
      var target = this;

      if (targets && targets.length > selectedValue && targets[selectedValue]) {
        target = targets[selectedValue];
      }

      if (hasParams) functionToCall.apply(target, params[selectedValue]);
      else functionToCall.call(target);
    }
  }

  removeInteraction(code);
  return false;
}

function interactionCancel(code) {
  document.disableEvents = false;

  var modalDiv = document.getElementById('modal' + code);
  if (modalDiv) {
    var functionToCall = modalDiv.cancelFunction;
    var params = modalDiv.cancelParams;
    var target = modalDiv.cancelTarget;

    if (functionToCall) {
      if (!target) target = this;
      var hasParams = (params && params.length > 0);
      if (hasParams) functionToCall.apply(target, params);
      else functionToCall.call(target);
    }
  }

  removeInteraction(code);
  return false;
}

function removeInteraction(code) {
  var modalDiv = document.getElementById('modal' + code);
  if (modalDiv) {
    var execFunction = modalDiv.execFunction;
    if (execFunction) {
      var execParams = modalDiv.execParams;
      var execTarget = modalDiv.execTarget ? modalDiv.execTarget : this;
      if (execParams) execFunction.apply(execTarget, execParams);
      else execFunction.call(execTarget);
    }

    bootstrapCloseModal(modalDiv);
  }
}

function alertText(text, execFunction, execParams, execTarget) {
  alert(text);
  if (execFunction) {
    var target = (execTarget ? execTarget : this);
    var hasParams = (execParams && execParams.length > 0);
    if (hasParams) {
      execFunction.apply(target, execParams);
    } else {
      execFunction.call(target);
    }
  }
}

function interactionInfo(text, execFunction, execParams, execTarget) {
  var varExists = false;
  try {
    messagesAsAlert;
    varExists = true;
  } catch (e) { }

  if (varExists && messagesAsAlert) {
    alertText(text, execFunction, execParams, execTarget);
  } else {
    interactionMessage(text, 0, execFunction, execParams, execTarget);
  }
}

function interactionErrorOld(text, execFunction, execParams, execTarget, excecao) {
  document.hasRuleErrors = true;
  document.hasRuleException = true;
  document.ruleErrorMessage = text;

  var varExists = false;
  try {
    messagesAsAlert;
    varExists = true;
  } catch (e) { }

  if (varExists && messagesAsAlert) {
    alertText(text, execFunction, execParams, execTarget);
  } else {
    interactionMessage(text, 1, execFunction, execParams, execTarget, excecao);
  }
}

function interactionError(text, execFunction, execParams, execTarget, excecao) {
  document.hasRuleErrors = true;
  document.hasRuleException = true;
  document.ruleErrorMessage = text;

  var varExists = false;
  try {
    messagesAsAlert;
    varExists = true;
  } catch (e) { }

  if (varExists && messagesAsAlert) {
    alertText(text, execFunction, execParams, execTarget);
  } else {
    var error;
    try { error = new HTMLMessage(); }
    catch (e) { error = new parent.mainform.HTMLMessage(); }
    error.callFunctionComponent = execFunction;
    error.callFunctionComponentParams = execParams;
    throw error.showErrorMessage(null, text, null, excecao, null);
  }
}

function interactionShowException(num) {
  var top = (screen.height - 370) / 2;
  var left = (screen.width - 500) / 2;
  var w = MM_openBrWindow('interactionException' + PAGES_EXTENSION + '?id=' + num, 'interactionException', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=500,height=370,left=' + left + ',top=' + top);
}

function getInteractionException(num) {
  var interactionException = window.mainform && mainform.document.interactionException ||
    document.interactionException ||
    window.$mainform() && $mainform().document.interactionException ||
    top.document.interactionException;
  if (interactionException && typeof interactionException === "object") {
    return interactionException[num];
  }
  throw new Error("não foi possível obter a mensagem de erro do servidor");
}

// Type = 0 -> Info
// Type = 1 -> Error
function interactionMessage(text, type, execFunction, execParams, execTarget, excecao) {
  var message;
  try { message = new HTMLMessage();}
  catch (e) { message = new parent.mainform.HTMLMessage(); }
  message.callFunctionComponent = execFunction;
  message.callFunctionComponentParams = execParams;
  if (type == 0) { // Info
    message.showInfoMessage("", text);
  } else if (type == 1) {// Error
    throw message.showErrorMessage("", text, null, excecao);
  }
}

function findNode(node, name) {
  var r = null;
  var id = node.id || node.name;
  if (id == name) r = node;
  if (!r) {
    for (var i = 0; i < node.childNodes.length; i++) {
      r = findNode(node.childNodes.item(i), name);
      if (r) break;
    }
  }
  return r;
}

function centerInteractionMsg(doc, divInteraction) {
  var height = divInteraction.offsetHeight;

  var interactionTable = divInteraction;
  if (interactionTable) {
    var tableHeight = interactionTable.offsetHeight;
    height = Math.max(height, tableHeight);
  }
  var divCenterWidth = (doc.body.clientWidth - divInteraction.offsetWidth) / 2;
  var divCenterHeight = (parseInt(window.innerHeight) - 170) / 2;
  var newLeft = (doc.body.scrollLeft + divCenterWidth);
  var newTop = (doc.body.scrollTop + divCenterHeight);
  if (newLeft < 0)
    newLeft = 0;
  if (newTop < 0)
    newTop = 0;
  divInteraction.style.left = newLeft + "px";
  divInteraction.style.top = newTop + "px";
}

function centerDiv(doc, divInteraction) {
  var height = divInteraction.offsetHeight;

  var interactionTable = divInteraction;
  if (interactionTable) {
    var tableHeight = interactionTable.offsetHeight;
    height = Math.max(height, tableHeight);
  }
  var divCenterWidth = (doc.body.clientWidth - divInteraction.offsetWidth) / 2;
  if (parseInt(top.innerHeight) > divInteraction.offsetHeight) {
    var divCenterHeight = (parseInt(top.innerHeight) - divInteraction.offsetHeight) / 2;
  } else {
    var divCenterHeight = (parseInt(doc.body.clientHeight) - divInteraction.offsetHeight) / 2;
  }
  var newLeft = (doc.body.scrollLeft + divCenterWidth);
  var newTop = (doc.body.scrollTop + divCenterHeight);
  if (newLeft < 0)
    newLeft = 0;
  if (newTop < 0)
    newTop = 0;
  divInteraction.style.left = newLeft + "px";
  divInteraction.style.top = newTop + "px";
}

function interactionConfirm(msg, f, fParams, fParent) {
  interaction(msg, [], [f], [fParams], [fParent], true);
}

function openWFRGridSort(sys, f) {
  var left = (screen.width - 300) / 2;
  var top = (screen.height - 300) / 2;
  MM_openBrWindow('grid_sort' + PAGES_EXTENSION + '?sys=' + sys + '&formID=' + URLEncode(f, "GET"), 'WFRGridSort', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=300,height=300,left=' + left + ',top=' + top);
}

function removeEvents(obj) {
  try {
    obj.onclick = null;
    obj.onmouseover = null;
    obj.onmouseout = null;
    obj.onmousemove = null;
    obj.onmousedown = null;
    obj.onmouseup = null;
    obj.onkeypress = null;
    obj.onkeydown = null;
    obj.onkeyup = null;
    obj.onfocus = null;
    obj.onblur = null;
    obj.onchange = null;
    obj.parent = null;
    obj.parentClass = null;
  } catch (e) {}
}

function flushDocument() {
  var pfstart = new Date().getTime();
  for (var i in document) {
    try {
      if (document[i]) {
        removeEvents(document[i]);
        try {
          if (document[i].flush) document[i].flush();
        } catch (e) {}
        try {
          document[i] = null;
        } catch (e) {}
      }
    } catch (e) {}
  }
  alert('Flush Document em ' + (new Date().getTime() - pfstart) + 'ms');
}

// Testa o tipo de arquvo
function checkTypeOfFile(fileObj, extensions) {
  indice = fileObj.value.lastIndexOf(".");
  tipo = fileObj.value.substr(indice + 1);
  if (extensions.indexOf(tipo.toUpperCase()) != -1)
    return true;
  return false;
}

/*
 * Cria um Cookie
 * name - Nome do Cookie
 * value - Valor do Cookie
 * [expires] - Data de expiração do Cookie
 *   (padr?o finalizar junto com a sessão corrente)
 * [path] - path v?lida para armazenar o Cookie
 *   (padr?o pasta do cliente do navegador)
 * [domain] - dominio onde será armazenado o Cookie
 *   (padr?o dom?nio de onde o documento foi chamado)
 * [secure] - Booleano indicando se o Cookie requer uma transmissão segura
 */

function setCookie(name, value, expires, path, domain, secure) {
  var curCookie = name + "=" + escape(value) +
    ((expires) ? "; expires=" + expires.toGMTString() : "") +
    ((path) ? "; path=" + path : "") +
    ((domain) ? "; domain=" + domain : "") +
    ((secure) ? "; secure" : "");
  document.cookie = curCookie;
}

/*
  name - nome do Cookie definido
  retorna uma string contendo o valor do Cookie ou null
  se o Cookie não existe
*/

function getCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  } else
    begin += 2;
  var end = document.cookie.indexOf(";", begin);
  if (end == -1)
    end = dc.length;
  return unescape(dc.substring(begin + prefix.length, end));
}

/*
   name - nome do Cookie
   [path] - path do Cookie (usada somente se o cookie foi criado em um path diferente)
   [domain] - domínio do cookie (mesmo domínio onde foi definido na função setCookie)
*/

function deleteCookie(name, path, domain) {
  if (getCookie(name)) {
    document.cookie = name + "=" +
      ((path) ? "; path=" + path : "") +
      ((domain) ? "; domain=" + domain : "") +
      "; expires=Thu, 01-Jan-70 00:00:01 GMT";
  }
}

// date - qualquer instância do Date object
function fixDate(date) {
  var base = new Date(0);
  var skew = base.getTime();
  if (skew > 0) date.setTime(date.getTime() - skew);
}

function delphiStringToJavaStringSingleLine(str) {
  var quoted = false;

  if (str == null || typeof str == "undefined" || str == '\'\'') {
    return "";
  }

  for (var i = 0; i < str.length; i++) {
    if (str.charAt(i) == '\'') {
      quoted = !quoted;
    }

    if (!quoted) {
      if (str.charAt(i) == '#') {
        var j = i + 1;
        var code = '';

        while (j < str.length && str.charAt(j) != ' ' && !isNaN(str.charAt(j))) {
          code = code + str.charAt(j);
          j++;
        }

        if (code.length > 0) {
          str = str.substring(0, i) + String.fromCharCode(code) + str.substring(j, str.length);
        }
      }
    }
  }

  str = str.replace(/''/g, "#@#@#");
  str = str.replace(/'/g, "");
  str = str.replace(/#@#@#/g, "'");

  return str;
}

function delphiStringToJavaString(str) {
  var result = "";

  var lines = str.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = trim(lines[i]);
    line = line.replace(/\r/g, "").replace(/'?\s*\+$/, "");
    line = delphiStringToJavaStringSingleLine(line);

    result += line;
  }

  return result;
}

var webrun = new function() {
  function mknamespace(module) {
    var path = '';
    var rest = new String(module);
    var name = '';
    var temp = window;
    var i = rest.indexOf('.');
    while (i != -1) {
      name = rest.substring(0, i);
      path += name + '/';
      if (!temp[name]) {
        temp[name] = {};
      }
      temp = temp[name];
      rest = rest.substring(i + 1);
      i = rest.indexOf('.');
    }
    path += rest + '.js';
    return {
      parent: temp,
      name: rest,
      path: path
    }
  }

  this.included = new Array();

  this.include = function(url) {
    if (!this.included[url]) {
      var content = getContent(url, false, true);
      window_eval(content);
      this.included[url] = url;
    }

    return this.included[url];
  }

  this.construct = function(className, params) {
    var clazz = null;

    try {
      clazz = eval(className);
    } catch (e) {}
    if (!clazz) {
      alert(mknamespace(className).path)
      this.include(mknamespace(className).path);
      clazz = eval(className);
    }

    if (clazz) {
      return this.create(clazz, Array.prototype.slice.apply(arguments, [1]));
    } else {
      throw 'Class not found';
    }
  }

  this.create = function() {
    return this.newClass.apply(this, arguments);
  }

  this.newClass = function(constructor, arguments) {
    for (var i = 0, j = (arguments ? arguments.length : 0),
         Instance = new Array(j); i < j; i++) Instance[i] = "arguments[".concat(i, "]");
    return new Function("constructor, arguments",
      "return new constructor(".concat(Instance.join(","), ")")
    )(constructor, arguments);
  }
}

function window_eval(code) {
  if (window.execScript) {
    window.execScript(code);
    return null;
  }

  return (this.eval ? this.eval(code) : eval(code));
}

function IframeTransporter(url) {
  var id = 'IFRAME' + parseInt((Math.random() * 9999999));
  var iframe = $mainform().document.createElement("iframe");
  iframe.name = id;
  iframe.id = id;
  iframe.frameBorder = 0;
  iframe.setAttribute("frameborder", "no");
  iframe.setAttribute("border", 0);
  iframe.setAttribute("marginwidth", 0);
  iframe.setAttribute("marginheight", 0);
  iframe.style.display = "none";
  iframe.width = 0;
  iframe.height = 0;
  iframe.src = url;
  $mainform().document.body.appendChild(iframe);
}



function arrayIndexRemove(arr, idx) {
  var newArray = new Array();
  for (var i = 0; i < arr.length; i++) {
    if (i != idx)
      newArray.push(arr[i]);
  }
  return newArray;
}

Map.prototype.getInstance = function(json) {
  var newMap = new Map();
  for (var key in json) {
    if (typeof key == "function") {
      continue;
    }
    newMap.add(key, json[key]);
  }
  return newMap;
}

Map.prototype.getKeys = function() {
  var keys = new Array();

  function interate(value, key, map) {
    keys.push(key);
  }
  this.forEach(interate)
  return keys;
}

Map.prototype.getValues = function() {
  var values = new Array();

  function interate(value, key, map) {
    values.push(value);
  }
  this.forEach(interate)
  return values;
}

Map.prototype.add = function(key, value) {
  if (this.validateKey(key)) {
    this.set(key, value);
  }
  return this;
}

Map.prototype.remove = function(key) {
  if (this.validateKey(key)) {
    return this.delete(key)
  }

  return false;
}

Map.prototype.findKey = function(key) {
  if (this.validateKey(key)) {
    return this.has(key) ? true : -1;
  }
}

Map.prototype.validateKey = function(key) {
  return (key != null && typeof key != "undefined");
}

Map.prototype.flush = function(execFunction) {
  if (this.size > 0) {
    if (execFunction) {
      var keys = this.getKeys();
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = this.get(key);
        execFunction(key, value);
      }
    }
    this.clear();
  }
}

Map.prototype.toString = function() {
  var result = "{";
  if (this.size > 0) {
    var keys = this.getKeys();
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!isNullable(key)) {
        var value = this.get(key);
        result += ((i > 0 ? ", " : "") + key.toString() + "=" + (isNullable(value) ? "" : value.toString()));
      }
    }
  }
  result += "}";
  return result;
}

Map.prototype.toStringSerialized = function(recursive) {
  var result = "{";
  if (this.size > 0) {
    var keys = this.getKeys();
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!isNullable(key)) {
        var value = this.get(key);
        result += ((i > 0 ? ", " : "") + serialize(key, true, recursive) + ": " + serialize(value, true, recursive));
      }
    }
  }
  result += "}";
  return result;
}

function HTTPPool() {}

HTTPPool.prototype.get = function() {
  return getHTTPObject();
};

HTTPPool.prototype.leave = function(http) {
  if (http != null) {
    try {
      window.lastReceivedContent = convertNonUnicodeChars(http.responseText);
    } catch (e) {}
  }
};

HTTPPool.prototype.processAsyncGet = function(url) {
  var http = httpPool.get();
  var pool = this;
  http.open('GET', url, true);
  http.send(null);

  http.onreadystatechange = function() {
    if (http.readyState == 4) {
      pool.leave(http);
    }
  }
};

HTTPPool.prototype.free = function() {
  // TODO Remover função não mais usada
};

var httpPool = new HTTPPool();

function getInstalledWebrunReports(version) {
  try {
    var control = new ActiveXObject('WebrunReports.WebrunReportsX');
    var controlVersion = '1,0,0,14';
    try {
      controlVersion = control.version;
    } catch (e) {}
    if (controlVersion != version)
      return null;
    else
      return control;
  } catch (e) {}
  return null;
}

var _session_variables = new Map();

function addComponentDependences(code, value) {
  var dep = d.t.dependences;
  var depExist = dep[code];
  if (!depExist) dep[code] = new Array();
  dep[code].push(value);
}

function defineComponentDependences() {
  var dep = d.t.dependences;

  for (var componentUpdateCode in dep) {
    if (typeof componentUpdateCode == "function") {
      continue;
    }

    var componentUpdate = eval("$mainform().d.c_" + componentUpdateCode);
    if ((componentUpdate == null) || (typeof componentUpdate == "undefined")) {
      continue;
    }

    for (var index in dep[componentUpdateCode]) {
      if (typeof index == "function") {
        continue;
      }

      var componentCode = dep[componentUpdateCode][index];
      if (isNumeric(componentCode)) {
        var component = eval("$mainform().d.c_" + componentCode);

        if ((component == null) || (typeof component == "undefined")) {
          continue;
        }

        component.addComponentDependence(componentUpdate);
      }
    }
  }
}

function shortcutReloadSystem(sys) {
  if (sys != null && typeof sys != "undefined" && trim(sys) != "" && confirm(getLocaleMessage("INFO.CONFIRM_RELOAD_SYSTEM"))) {
    var spinner = bootstrapCreateSpinner(top.document.body, "spinner-border text-primary", true);
    spinner[0].id = "loading";
    parent.window.reloadSystem = true;
    parent.window.location.href = "reloadSystem.do?sys=" + sys;
  } else {
    return false;
  }
}

function setFocusFormOnLoad() {
  var lMainForm = $mainform();
  if (lMainForm && lMainForm.focus) {
    lMainForm.focus();
  }
  return true;
}

function formatText(text) {
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      var param = arguments[i];
      if (param != null && typeof param != "undefined") {
        var regexp = new RegExp("\\{" + (i - 1) + "\\}", "g");
        text = text.replace(regexp, param);
      }
    }
  }
  return text;
}

function testRegularExpression(value, regularExpression) {
  if (isNullable(value)) {
    return true;
  }
  return (value.search(regularExpression) == 0);
}

function processFilter(allFilters) {
  var result = allFilters;

  var filters = allFilters.split(";");
  if (filters.length > 0) {
    var objRegExp = /^\(\{.+?\}\)$/;
    result = "";

    for (var i = 0; i < filters.length; i++) {
      var filter = filters[i];
      var filterValues = filter.split("=");

      var key = filterValues[0];
      var filterValue = filter;
      if (filterValues.length > 1) {
        var strValue = filterValues[1];

        if (objRegExp.test(strValue)) {
          var objValue = eval(strValue);
          if (objValue && objValue.name) {
            var component = eval("$c('" + objValue.name + "', '" + objValue.guid + "')");
            filterValue = (key + "=" + component.getValue());
            if (objValue.type && objValue.type.length > 0) {
              filterValue += ("@" + objValue.type);
            }
          }
        }
      }

      if (result.length > 0) {
        result += ";";
      }

      result += filterValue;
    }
  }

  return result;
}

function recursiveFlush(obj, depth, parent) {
  try {
    if (!depth)
      depth = 1;

    if ((typeof(obj) != 'string' && typeof(obj) != 'number' && depth <= 3) || obj.isObject) {

      var aux;
      for (var i in obj) {
        if (obj[i]) {
          aux = obj[i];
          obj[i] = null;
          recursiveFlush(aux, depth + 1, obj);
        }
      }
    }
  } catch (e) {
    //Abafa
  }
}

function clearReferences(o) {
  if (o.childNodes != undefined) {
    for (var i = o.childNodes.length - 1; i >= 0; i--) {
      if (o.childNodes[i].contentDocument) clearReferences(o.childNodes[i].contentDocument);
      clearReferences(o.childNodes[i]);
    }
  }
  if (o.onload) o.onload = null;
  if (o.onunload) o.onunload = null;
  if (o.onclick) o.onclick = null;
  if (o.ondblclick) o.ondblclick = null;
  if (o.onmousedown) o.onmousedown = null;
  if (o.onmouseup) o.onmouseup = null;
  if (o.onmouseover) o.onmouseover = null;
  if (o.onmousemove) o.onmousemove = null;
  if (o.onmouseout) o.onmouseout = null;
  if (o.onfocus) o.onfocus = null;
  if (o.onblur) o.onblur = null;
  if (o.onkeypress) o.onkeypress = null;
  if (o.onkeydown) o.onkeydown = null;
  if (o.onkeyup) o.onkeyup = null;
  if (o.onsubmit) o.onsubmit = null;
  if (o.onreset) o.onreset = null;
  if (o.onselect) o.onselect = null;
  if (o.onchange) o.onchange = null;

  o = null;
}

function generateContainerDiv() {
  var doc;
  try {
    doc = mainform.document;
  } catch (e) {
    doc = document;
  }

  if (!doc.body) {
    doc.writeln("<body></body>");
  }

  if (!doc.zoomCount) doc.zoomCount = 10000;
  if (!doc.divCount) doc.divCount = 1;

  doc.zoomCount = doc.zoomCount - 2;
  doc.divCount++;

  var divBckInteraction = doc.createElement("div");
  divBckInteraction.id = "HTMLProgressBarBack" + doc.divCount;
  divBckInteraction.style.left = doc.body.scrollLeft + "px";
  divBckInteraction.style.top = doc.body.scrollTop + "px";
  divBckInteraction.style.zIndex = doc.zoomCount;

  doc.body.appendChild(divBckInteraction);

  var divInteraction = doc.createElement("div");
  divInteraction.id = "HTMLProgressBar" + doc.divCount;
  divInteraction.style.zIndex = doc.zoomCount + 1;
  divInteraction.style.left = doc.body.scrollLeft + "px";
  divInteraction.style.top = doc.body.scrollTop + "px";
  divInteraction.backDiv = divBckInteraction;

  doc.body.appendChild(divInteraction);

  return divInteraction;
}

function removeContainerDiv(div) {
  var doc;
  try {
    doc = mainform.document;
  } catch (e) {
    doc = document;
  }

  if (!doc.body) {
    doc.writeln("<body></body>");
  }

  if (div.backDiv) {
    div.backDiv.parentNode.removeChild(div.backDiv);
    div.backDiv = null;
  }

  div.parentNode.removeChild(div);
}

function containsNode(element, node) {
  if (element && element.childNodes) {
    for (var i = 0; i < element.childNodes.length; i++) {
      if (element.childNodes[i] == node) {
        return true;
      }
    }
  }
  return false;
}

// Chamada devido o HTMLMemo.js
function tabAsyncMemo(o, invert) {
  try { controller.next(o, invert); } catch (e) {  }
}

Date.$VERSION = 1.02;
Date.LZ = function(x) {
  return (x < 0 || x > 9 ? "" : "0") + x
};

Date.monthNames = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
Date.monthAbbreviations = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
Date.dayNames = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
Date.dayAbbreviations = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
Date.preferAmericanFormat = true;

if (!Date.prototype.getFullYear) {
  Date.prototype.getFullYear = function() {
    var yy = this.getYear();
    return (yy < 1900 ? yy + 1900 : yy);
  }
}

Date.parseString = function(val, format) {
  if (typeof(format) == "undefined" || format == null || format == "") {
    var generalFormats = new Array('y-M-d', 'MMM d, y', 'MMM d,y', 'y-MMM-d', 'd-MMM-y', 'MMM d', 'MMM-d', 'd-MMM');
    var monthFirst = new Array('M/d/y', 'M-d-y', 'M.d.y', 'M/d', 'M-d');
    var dateFirst = new Array('d/M/y', 'd-M-y', 'd.M.y', 'd/M', 'd-M');
    var checkList = new Array(generalFormats, Date.preferAmericanFormat ? monthFirst : dateFirst, Date.preferAmericanFormat ? dateFirst : monthFirst);
    for (var i = 0; i < checkList.length; i++) {
      var l = checkList[i];
      for (var j = 0; j < l.length; j++) {
        var d = Date.parseString(val, l[j]);
        if (d != null) {
          return d;
        }
      }
    }
    return null;
  }
  this.isInteger = function(val) {
    for (var i = 0; i < val.length; i++) {
      if ("1234567890".indexOf(val.charAt(i)) == -1) {
        return false;
      }
    }
    return true;
  };
  this.getInt = function(str, i, minlength, maxlength) {
    for (var x = maxlength; x >= minlength; x--) {
      var token = str.substring(i, i + x);
      if (token.length < minlength) {
        return null;
      }
      if (this.isInteger(token)) {
        return token;
      }
    }
    return null;
  };
  val = val + "";
  format = format + "";
  var i_val = 0;
  var i_format = 0;
  var c = "";
  var token = "";
  var token2 = "";
  var x, y;
  var year = new Date().getFullYear();
  var month = 1;
  var date = 1;
  var hh = 0;
  var mm = 0;
  var ss = 0;
  var ampm = "";
  while (i_format < format.length) {
    c = format.charAt(i_format);
    token = "";
    while ((format.charAt(i_format) == c) && (i_format < format.length)) {
      token += format.charAt(i_format++);
    }
    if (token == "yyyy" || token == "yy" || token == "y") {
      if (token == "yyyy") {
        x = 4;
        y = 4;
      }
      if (token == "yy") {
        x = 2;
        y = 2;
      }
      if (token == "y") {
        x = 2;
        y = 4;
      }
      year = this.getInt(val, i_val, x, y);
      if (year == null) {
        return null;
      }
      i_val += year.length;
      if (year.length == 2) {
        if (year > 70) {
          year = 1900 + (year - 0);
        } else {
          year = 2000 + (year - 0);
        }
      }
    } else if (token == "MMM" || token == "NNN") {
      month = 0;
      var names = (token == "MMM" ? (Date.monthNames.concat(Date.monthAbbreviations)) : Date.monthAbbreviations);
      for (var i = 0; i < names.length; i++) {
        var month_name = names[i];
        if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
          month = (i % 12) + 1;
          i_val += month_name.length;
          break;
        }
      }
      if ((month < 1) || (month > 12)) {
        return null;
      }
    } else if (token == "EE" || token == "E") {
      var names = (token == "EE" ? Date.dayNames : Date.dayAbbreviations);
      for (var i = 0; i < names.length; i++) {
        var day_name = names[i];
        if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
          i_val += day_name.length;
          break;
        }
      }
    } else if (token == "MM" || token == "M") {
      month = this.getInt(val, i_val, token.length, 2);
      if (month == null || (month < 1) || (month > 12)) {
        return null;
      }
      i_val += month.length;
    } else if (token == "dd" || token == "d") {
      date = this.getInt(val, i_val, token.length, 2);
      if (date == null || (date < 1) || (date > 31)) {
        return null;
      }
      i_val += date.length;
    } else if (token == "hh" || token == "h") {
      hh = this.getInt(val, i_val, token.length, 2);
      if (hh == null || (hh < 1) || (hh > 12)) {
        return null;
      }
      i_val += hh.length;
    } else if (token == "HH" || token == "H") {
      hh = this.getInt(val, i_val, token.length, 2);
      if (hh == null || (hh < 0) || (hh > 23)) {
        return null;
      }
      i_val += hh.length;
    } else if (token == "KK" || token == "K") {
      hh = this.getInt(val, i_val, token.length, 2);
      if (hh == null || (hh < 0) || (hh > 11)) {
        return null;
      }
      i_val += hh.length;
      hh++;
    } else if (token == "kk" || token == "k") {
      hh = this.getInt(val, i_val, token.length, 2);
      if (hh == null || (hh < 1) || (hh > 24)) {
        return null;
      }
      i_val += hh.length;
      hh--;
    } else if (token == "mm" || token == "m") {
      mm = this.getInt(val, i_val, token.length, 2);
      if (mm == null || (mm < 0) || (mm > 59)) {
        return null;
      }
      i_val += mm.length;
    } else if (token == "ss" || token == "s") {
      ss = this.getInt(val, i_val, token.length, 2);
      if (ss == null || (ss < 0) || (ss > 59)) {
        return null;
      }
      i_val += ss.length;
    } else if (token == "a") {
      if (val.substring(i_val, i_val + 2).toLowerCase() == "am") {
        ampm = "AM";
      } else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm") {
        ampm = "PM";
      } else {
        return null;
      }
      i_val += 2;
    } else {
      if (val.substring(i_val, i_val + token.length) != token) {
        return null;
      } else {
        i_val += token.length;
      }
    }
  }

  if (i_val != val.length) {
    return null;
  }

  if (month == 2) {
    if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
      if (date > 29) return null;
    } else {
      if (date > 28) return null;
    }
  }

  if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
    if (date > 30) return null;
  }

  if (hh < 12 && ampm == "PM") {
    hh = hh - 0 + 12;
  } else if (hh > 11 && ampm == "AM") {
    hh -= 12;
  }

  return new Date(year, month - 1, date, hh, mm, ss);
};

Date.isValid = function(val, format) {
  return (Date.parseString(val, format) != null);
};

Date.prototype.isBefore = function(date2) {
  if (date2 == null) return false;
  return (this.getTime() < date2.getTime());
};

Date.prototype.isAfter = function(date2) {
  if (date2 == null) return false;
  return (this.getTime() > date2.getTime());
};

Date.prototype.equals = function(date2) {
  if (date2 == null) return false;
  return (this.getTime() == date2.getTime());
};

Date.prototype.equalsIgnoreTime = function(date2) {
  if (date2 == null) {
    return false;
  }
  var d1 = new Date(this.getTime()).clearTime();
  var d2 = new Date(date2.getTime()).clearTime();
  return (d1.getTime() == d2.getTime());
};

Date.prototype.format = function(format) {
  format = format + "";
  var result = "";
  var i_format = 0;
  var c = "";
  var token = "";
  var y = this.getYear() + "";
  var M = this.getMonth() + 1;
  var d = this.getDate();
  var E = this.getDay();
  var H = this.getHours();
  var m = this.getMinutes();
  var s = this.getSeconds();
  var yyyy, yy, MMM, MM, dd, hh, h, mm, ss, ampm, HH, H, KK, K, kk, k;
  var value = new Object();

  if (y.length < 4) {
    y = "" + (+y + 1900);
  }

  value["y"] = "" + y;
  value["yyyy"] = y;
  value["yy"] = y.substring(2, 4);
  value["M"] = M;
  value["MM"] = Date.LZ(M);
  value["MMM"] = Date.monthNames[M - 1];
  value["NNN"] = Date.monthAbbreviations[M - 1];
  value["d"] = d;
  value["dd"] = Date.LZ(d);
  value["E"] = Date.dayAbbreviations[E];
  value["EE"] = Date.dayNames[E];
  value["H"] = H;
  value["HH"] = Date.LZ(H);

  if (H == 0) {
    value["h"] = 12;
  } else if (H > 12) {
    value["h"] = H - 12;
  } else {
    value["h"] = H;
  }

  value["hh"] = Date.LZ(value["h"]);
  value["K"] = value["h"] - 1;
  value["k"] = value["H"] + 1;
  value["KK"] = Date.LZ(value["K"]);
  value["kk"] = Date.LZ(value["k"]);

  if (H > 11) {
    value["a"] = "PM";
  } else {
    value["a"] = "AM";
  }

  value["m"] = m;
  value["mm"] = Date.LZ(m);
  value["s"] = s;
  value["ss"] = Date.LZ(s);

  while (i_format < format.length) {
    c = format.charAt(i_format);
    token = "";
    while ((format.charAt(i_format) == c) && (i_format < format.length)) {
      token += format.charAt(i_format++);
    }

    if (typeof(value[token]) != "undefined") {
      result = result + value[token];
    } else {
      result = result + token;
    }
  }

  return result;
};

Date.prototype.getDayName = function() {
  return Date.dayNames[this.getDay()];
};

Date.prototype.getDayAbbreviation = function() {
  return Date.dayAbbreviations[this.getDay()];
};

Date.prototype.getMonthName = function() {
  return Date.monthNames[this.getMonth()];
};

Date.prototype.getMonthAbbreviation = function() {
  return Date.monthAbbreviations[this.getMonth()];
};

Date.prototype.clearTime = function() {
  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
  this.setMilliseconds(0);
  return this;
};

Date.prototype.add = function(interval, number) {
  if (typeof(interval) == "undefined" || interval == null || typeof(number) == "undefined" || number == null) {
    return this;
  }

  number = +number;
  if (interval == 'y') {
    this.setFullYear(this.getFullYear() + number);
  } else if (interval == 'M') {
    this.setMonth(this.getMonth() + number);
  } else if (interval == 'd') {
    this.setDate(this.getDate() + number);
  } else if (interval == 'w') {
    var step = (number > 0) ? 1 : -1;
    while (number != 0) {
      this.add('d', step);
      while (this.getDay() == 0 || this.getDay() == 6) {
        this.add('d', step);
      }

      number -= step;
    }
  } else if (interval == 'h') {
    this.setHours(this.getHours() + number);
  } else if (interval == 'm') {
    this.setMinutes(this.getMinutes() + number);
  } else if (interval == 's') {
    this.setSeconds(this.getSeconds() + number);
  }

  return this;
};

function loadAsyncWfr(src, callback, position) {
  position ? position : position = 0;
  const element = src[position];
  var script = document.createElement('script');
  script.src = element;
  script.type = 'text/javascript';
  script.async = true;
  if (callback != null) {
    if (script.readyState) {
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          if (position + 1 == src.length) callback();
          else loadAsyncWfr(src, callback, position + 1);
        }
      };
    } else {
      script.onload = function() {
        if (position + 1 == src.length) callback();
        else loadAsyncWfr(src, callback, position + 1);
      };
    }
  }

  document.head.appendChild(script);
}

/**PolyFill assign para suporte ao navegador Internet Explorer*/
if (typeof Object.assign != 'function') {
  Object.assign = function(target, varArgs) {
    'use strict';
    if (target == null) throw new TypeError('Cannot convert undefined or null to object');
    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];
      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }

    return to;
  };
}

/**Polyfill forEach para suporte ao navegador Internet Explorer */
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function(callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

/**
 * Polyfill para compatibilização com  Internet Explorer.
 * Referências:
 * https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart *
*/
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
      targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
      padString = String(typeof padString !== 'undefined' ? padString : ' ');
      if (this.length >= targetLength) {
          return String(this);
      } else {
          targetLength = targetLength - this.length;
          if (targetLength > padString.length) {
              padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
          }
          return padString.slice(0, targetLength) + String(this);
      }
  };
}

/**
 * Polyfill para compatibilização com o Internet Explorer.
 * Referências:
 * https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
 */
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd(targetLength,padString) {
      targetLength = targetLength>>0; //floor if number or convert non-number to 0;
      padString = String((typeof padString !== 'undefined' ? padString : ' '));
      if (this.length > targetLength) {
          return String(this);
      }
      else {
          targetLength = targetLength-this.length;
          if (targetLength > padString.length) {
              padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
          }
          return String(this) + padString.slice(0,targetLength);
      }
  };
}

/**Responsavel por obter o tamanho correto do componente quando o formulario e responsivo e esta aberto na moldura e com a propriedade display none.*/
function getWidthInFrame (comp, floatingForms) {
  let frames= new Array();
  try{
    let groupBox = top.$mainform().mainform.document.querySelectorAll('[webrun-type="HTMLGroupBox"]');
    groupBox.forEach(function(item){
      frames.push(item);
    });

    frames = frames.concat(floatingForms);

    let size = frames.length;
    let find = false;
    let width = 0;
    let none = false;
    let frame = null;
    let parentFrame = null;
    if(size === 0) return;
    for(let i = 0; i < size; i++){
      frame = frames[i];
      let iframes = frame.getElementsByTagName("IFRAME");
      let size = iframes.length;
      if(size === 0) continue;
      else{
        for(let j=0; j < size; j++){
          let iframe = iframes[j];
          let cW = iframe.contentWindow;
          if(cW.mainform.$c(comp.id) && cW.mainform.idForm == comp.formID){
            find =true;
            break;
          }
        }
      }
      let parentFloating = false;
      if (find && $c(frame.id) && $c(frame.id).doc.style.display === 'none') {
        parentFloating = true;
        parentFrame = $c(frame.id).doc;
      }
      else if (find && parent && parent.$mainform() && parent.$mainform().$c(frame.id)
        && parent.$mainform().$c(frame.id).doc.style.display === 'none') {
          parentFloating = true;
          parentFrame = parent.$mainform().$c(frame.id).doc;
      }

      if(find && frame.style.display === 'none' || parentFloating){
        none = frame.style.display === 'none' ? true : false;
        if (parentFloating) {
          parent.$mainform().$c(frame.id).doc.style.visibility = 'hidden';
          parent.$mainform().$c(frame.id).doc.style.display = 'block';
        }
        if (frame.style.display === 'none') {
          frame.style.visibility = "hidden";
          frame.style.display = "block";
        }
        width = frame.clientWidth;
        if (parentFloating) {
          parent.$mainform().$c(frame.id).doc.style.display = 'none';
          parent.$mainform().$c(frame.id).doc.style.removeProperty('visibility');
        }
        break;
      }
    }
    return {frame:frame, width:width, find:find, none:none, parentFrame:parentFrame};
  } catch(e){}
};

/**Obtem as molduras em formularios flutuantes */
function getFrameInFloatingForms() {
  var openFloatingForms = mainSystemFrame.document.getElementsByClassName("WFRIframeForm");
  let frames = new Array();
  if (openFloatingForms) {
    let size = openFloatingForms.length;
    for (let i = 0; i < size; i++) {
      let iframes = openFloatingForms[i].getElementsByTagName("iframe");
      let size = iframes.length;
      if (size === 0) continue;
      for (let j = 0; j < size; j++) {
        if (iframes[j].contentWindow.mainform) {
          let elems = iframes[j].contentWindow.mainform.document.querySelectorAll('[webrun-type="HTMLGroupBox"]');
          let length = elems.length;
          if (length > 0) {
            for (let l = 0; l < length; l++) {
              frames.push(elems[j]);
            }
          }
        }
      }
    }
  }
  return frames;
};

/**Função para obter o Nome do Skin corrente */
function getCurrentSkinName() {
  var pos = skin.indexOf("Skins/") + 6;
  return skin.slice(pos, -1);
};

/**Função responsável por redirecionar o usuário para o formulário de login após a sessão expirar ao exceder as tentativas de modificação da senha.
 * @author Janpier
*/
function renewSession () {
  if (parent.parent.top.opener && parent.parent.top.opener.isPrincipal) {
    parent.parent.top.opener.ebfSystemChangeUser();
  } else if(parent && parent.parent //Floating Form
      && parent.parent.$mainform && parent.parent.$mainform().mainform.isPrincipal) {
        parent.parent.$mainform().mainform.ebfSystemChangeUser();
  } else {
    try{top.opener.ebfSystemChangeUser()} catch (e){}
  }
};

/*Necessário para compatibilização de sistemas legados*/
function setMetaTagFirstHead() { }
function addEventSubMenu() { }
function specificMetroEventsFunctions() { }
