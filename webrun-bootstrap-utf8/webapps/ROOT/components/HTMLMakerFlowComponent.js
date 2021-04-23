/**
 * MÃ©todo construtor do HTMLMakerFlowComponent. ResponsÃ¡vel por criar o componente a partir do fluxo.
 * @param sys - Indica o cÃ³digo do sistema.
 * @param formID - Indica o cÃ³digo do formulÃ¡rio.
 * @param posX - PosiÃ§Ã£o do componente na tela em relaÃ§Ã£o ao eixo X.
 * @param posY - PosiÃ§Ã£o do componente na tela em relaÃ§Ã£o ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - ALtura do componente.
 * @param description - Descricao do componente.
 * @param img - imagem do button.
 **/
function HTMLMakerFlowComponent(sys, formID, code, posX, posY, width, height, description) {
  this.sys = sys;
  this.formID = formID;
  this.code = code;
  this.posX = parseFloat(posX);
  this.posY = parseFloat(posY);
  this.width = parseFloat(width);
  this.height = parseFloat(height);
  this.description = description;
}

/**
 * HeranÃ§a do objeto.
 **/
HTMLMakerFlowComponent.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLMakerFlowComponent.prototype.name = 'HTMLMakerFlowComponent';
HTMLMakerFlowComponent.prototype.tabKeys = [9];
HTMLMakerFlowComponent.prototype.tabable = true;
HTMLMakerFlowComponent.prototype.zindex = 100000;
HTMLMakerFlowComponent.prototype.isBinary = true;

var makerFlowComponentsDesign = [];

HTMLMakerFlowComponent.prototype.design = function(ruleName, componentParameters) {
  this.init();
  makerFlowComponentsDesign.push(function design() {
    executeRuleFromJS(ruleName, componentParameters);
  });

  if (this.field) {
    let id = this.id;
    let code = this.code;
    let component = this;
    setTimeout(function() {
      let elem = mainform.document.getElementById(id);
      if (elem) {
        let input = mainform.document.createElement('input');
        input.type = "hidden";
        input.name = "WFRInput" + code;
        input.id = "WFRInput" + code;
        elem.appendChild(input);
        component.input = input;
      }
    }, 100);
  }
};

HTMLMakerFlowComponent.prototype.inner = function(ruleName, componentParameters, action) {
  var reducedName = reduceVariable(ruleName);
  if (typeof window[reducedName] === "function") {
    setTimeout(function inner() {
      try {
        executeRuleFromJS(ruleName, componentParameters, action);
      } catch (e) {
        interactionError(e.toString());
      }
    }, 0);
  }
};

HTMLMakerFlowComponent.prototype.init = function() {
  controller.addNotTabable(this);
}

HTMLMakerFlowComponent.prototype.free = function() {
  var element = $mainform().document.getElementById(this.id);
  if (element) {
    element.parentElement.removeChild(element);
    controller.remove(this);
  }
};

HTMLMakerFlowComponent.prototype.setVisible = function(v) {
  this.visible = parseBoolean(v);
  var element = $mainform().document.getElementById(this.id);
  if (element) {
    element.style.display = this.visible ? "block" : "none";
    element.style.visibility = this.visible ? "visible" : "hidden";
  }
};

HTMLMakerFlowComponent.prototype.setEnabled = function(v) {
  this.enabled = parseBoolean(v);
  var element = $mainform().document.getElementById(this.id);
  if (element) element.style.pointerEvents = this.enabled ? "all" : "none";
};

HTMLMakerFlowComponent.prototype.getVisible = function() {
  var element = $mainform().document.getElementById(this.id);
  var display = window.getComputedStyle(element).display === 'block' ? true : false;
  var visible = window.getComputedStyle(element).visibility === 'visible' ? true : false;
  return (display && visible);
};

HTMLMakerFlowComponent.prototype.setX = function(x) {
  var element = $mainform().document.getElementById(this.id);
  if (element) element.style.left = x + 'px';
};

HTMLMakerFlowComponent.prototype.setY = function(y) {
  var element = $mainform().document.getElementById(this.id);
  if (element) element.style.top = y + 'px';
};

HTMLMakerFlowComponent.prototype.getHeight = function() {
  var element = $mainform().document.getElementById(this.id);
  if (element) return parseInt(window.getComputedStyle(element).height);
};

HTMLMakerFlowComponent.prototype.getWidth = function() {
  var element = $mainform().document.getElementById(this.id);
  if (element) return parseInt(window.getComputedStyle(element).width);
};

HTMLMakerFlowComponent.prototype.getX = function() {
  var element = $mainform().document.getElementById(this.id);
  if (element) return parseInt(window.getComputedStyle(element).left);
};

HTMLMakerFlowComponent.prototype.getY = function() {
  var element = $mainform().document.getElementById(this.id);
  if (element) return parseInt(window.getComputedStyle(element).top);
};

HTMLMakerFlowComponent.prototype.setValue = function(value, checkDependences) {
  value = normalizeRuleParam(value, true);
  var temp = this.getValue();
  this.value = value;
  if (this.input) this.input.value = value;
  if (trim(this.value) != trim(temp)) this.changeAction(null, this, !checkDependences);
  return false;
};