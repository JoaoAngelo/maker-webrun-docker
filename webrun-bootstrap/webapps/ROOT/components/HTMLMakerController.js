/**
 * HTMLMakerController
 **/
function HTMLMakerController(sys, formID) {
  this.create(sys, formID);
}

HTMLMakerController.prototype.name = 'HTMLMakerController';

HTMLMakerController.prototype.toString = function() {
  return '[HTMLMakerController: ' + this.sys + '->' + this.formID + ']';
};

HTMLMakerController.prototype.create = function(sys, formID) {
  this.formID = formID;
  this.sys = sys;
  this.propCount = 0;
  this.events = new Array();
  this.props = new Object();
  this.propsNames = new Array();
  this.cachedProps = new Array();
  this.fullPropList = new Array();
};

HTMLMakerController.prototype.editMode = function() {
  this.loadFromDatabase();
  executeJSRule(this.sys, this.formID, ebfUtilReduceVariable('MK3-Ativar edição', true), []);
  this.showInspector();
};

HTMLMakerController.prototype.cancelChanges = function() {
  if (this.inspector) this.inspector.close();
  parent.location.href = parent.location.href.replace('&mode=99', '&mode=0');
};

HTMLMakerController.prototype.saveToDatabase = function() {
  // Salva as alterações no BD
  executeJSRule(this.sys, this.formID, ebfUtilReduceVariable('MK3-Salvar formulário', true), []);
};

HTMLMakerController.prototype.loadFromDatabase = function() {
  // Carrega as propriedade do formulário e dos componentes do banco de dados
  executeSyncJavaRule(this.sys, this.formID, 'MK3-Inicializar propriedades dos componentes', this.formID);
};

HTMLMakerController.prototype.showInspector = function(component) {
  var FormInspetorID = executeSyncJavaRule(this.sys, this.formID, 'MK3-Obter código do formulário pelo GUID', "{8F8B4E5F-AD79-4611-BB45-7AF0B2226566}"); //6328;//ID do inspetor
  if (this.inspector && this.inspector.closed) return;
  if (!(this.inspector && this.inspector.mainform)) {
    this.inspector = openWFRFilterFormXY(this.sys, FormInspetorID, 300, 700, '', 2, 10);
  } else {
    var lkp = this.inspector.mainform.controller.getElementById('cmbComponentes');
    if (lkp) lkp.setValue(component ? component.getCode() : 0, true);
  }
};

/**
  Obtem uma propriedades do formulário
**/
HTMLMakerController.prototype.getProp = function(name) {
  return this.props[name];
};

/**
  Define uma propriedades do formulário
**/
HTMLMakerController.prototype.setProp = function(name, value) {
  if (typeof(this.props[name]) == "undefined") {
    this.propsNames[this.propsNames.length] = name;
    this.propCount++;
  }

  this.props[name] = value;
};

HTMLMakerController.prototype.getPropCount = function() {
  return this.propCount;
};

// Eventos
HTMLMakerController.prototype.setEvent = function(moment, value) {
  this.events[moment] = value;
};

HTMLMakerController.prototype.getEvent = function(moment) {
  return this.events[moment];
};

HTMLMakerController.prototype.applyUpdates = function() {
  document.title = this.props["Descricao"];
  parent.changeTitle(document.title);
};

HTMLMakerController.prototype.hasComponent = function(comName) {
  return controller.elemsById[comName] != null;
};

/**
  Retorna uma Array com a lista de propriedades definidas para um tipo de controle especifico
**/
HTMLMakerController.prototype.getEventsFromType = function(comType) {
  var events = new Array();
  var list = this.cachedProps[comType];
  for (var i = 0; i < list.length; i++) {
    if (list[i].event) {
      events.push(list[i]);
    }
  }
  return events;
};

/**
  Retorna uma Array com a lista de propriedades definidas para um tipo de controle especifico
**/
HTMLMakerController.prototype.getPropsFromType = function(comType) {
  var props = new Array();
  var list = this.cachedProps[comType];
  for (var i = 0; i < list.length; i++) {
    if (!list[i].event) {
      props.push(list[i]);
    }
  }

  return props;
};

function inArray(list, item) {
  for (var i = 0; i < list.length; i++)
    if (list[i] == item) return true;
  return false;
};

/**
  Retorna o valor default de uma propriedade
**/
HTMLMakerController.prototype.getDefaultValue = function(comType, propName) {
  var props = this.cachedProps[comType];
  for (var i = 0; i < props.length; i++) {
    if (props[i].name == propName) return props[i].defaultValue;
  }
};

/**
  Define as propriedades de cada tipo de componente
**/
HTMLMakerController.prototype.addPropToType = function(comType, propName, propDesc, isEvent, defValue) {
  var prop = new Object();
  prop.name = propName;
  prop.description = propDesc;
  prop.event = isEvent;
  prop.defaultValue = defValue;
  if (typeof this.cachedProps[comType] == "undefined")
    this.cachedProps[comType] = new Array();
  this.cachedProps[comType].push(prop);
  if (!inArray(this.fullPropList, propName))
    this.fullPropList.push(propName);
};

/**
  Retorna a lista completa de propriedades dos compoentes
**/
HTMLMakerController.prototype.getFullPropList = function() {
  return this.fullPropList;
};

HTMLMakerController.prototype.getNextComponentCode = function() {
  var components = controller.getTabElements(d.t);
  var max = 0;
  for (var i = 0; i < components.length; i++) {
    max = Math.max(max, components[i].getCode());
  }

  return max + 1;
};

HTMLMakerController.prototype.newHTMLEdit = function(code) {
  var posX = 20;
  var posY = 20;
  var width = 100;
  var height = 21;
  var description = 'Novo editor';
  var value = '';
  if (!code) code = this.getNextComponentCode();
  var componente = new HTMLEdit(this.sys, this.formID, code, posX, posY, width, height, description, value);
  componente.maxlength = 50;
  componente.zindex = 1;
  componente.field = 'PALAVRA';
  componente.id = 'MakerEdit' + code;
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLButton = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 125;
  var height = 25;
  var name = 'NovoBotao' + code;
  var label = 'Novo botão';
  var componente = new HTMLButton(this.sys, this.formID, code, posX, posY, width, height, name, label);
  componente.id = name;
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLRadioGroup = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 200;
  var height = 150;
  var name = 'NovoRadio' + code;
  var label = 'Novo seletor';
  var componente = new HTMLRadioGroup(this.sys, this.formID, code, posX, posY, width, height, name, label, [], []);
  componente.columns = 1;
  componente.id = name;
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLLabel = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 80;
  var height = 25;
  var name = 'Novo' + code;
  var label = 'Novo';
  var componente = new HTMLLabel(this.sys, this.formID, code, posX, posY, width, height, label);
  componente.id = name;
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLCheckbox = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 80;
  var height = 25;
  var name = 'Novo' + code;
  var label = 'Novo';
  var componente = new HTMLCheckbox(this.sys, this.formID, code, posX, posY, width, height, name, label, 'Verdadeiro', 'Falso');
  componente.id = name;
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLLookup = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 200;
  var height = 25;
  var name = 'Novo' + code;
  var label = 'Novo';
  var componente = new HTMLLookup(this.sys, this.formID, code, posX, posY, width, height, name, label, '');
  componente.id = name;
  componente.style = 0;
  componente.dependent = true;
  componente.field = 'CAMPO';
  componente.bgColor = '#FFFFFF';
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLImage = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 200;
  var height = 150;
  var name = 'Novo' + code;
  var label = 'Novo';
  var componente = new HTMLImage(this.sys, this.formID, code, posX, posY, width, height, name, label, 'CAMPO', 1, false);
  componente.id = name;
  componente.style = 0;
  componente.dependent = true;
  componente.field = 'CAMPO';
  componente.hasImage = false;
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLComboBox = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 200;
  var height = 25;
  var name = 'Novo' + code;
  var label = 'Novo';
  var componente = new HTMLComboBox(this.sys, this.formID, code, posX, posY, width, height, name, label, '');
  componente.id = name;
  componente.dependent = true;
  componente.field = 'CAMPO';
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLMemo = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 200;
  var height = 75;
  var name = 'Novo' + code;
  var label = 'Novo';
  var componente = new HTMLMemo(this.sys, this.formID, code, posX, posY, width, height, name, label);
  componente.id = name;
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLGroupBox = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 200;
  var height = 150;
  var name = 'Novo' + code;
  var label = 'Novo';
  var componente = new HTMLGroupBox(this.sys, this.formID, code, posX, posY, width, height, name, label);
  componente.style = 0;
  componente.id = name;
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLDetailPanel = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 200;
  var height = 150;
  var name = 'Novo' + code;
  var label = 'Novo';
  var componente = new HTMLDetailPanel(this.sys, this.formID, code, posX, posY, width, height, name, label);
  componente.design(d.t.getSelectedTab().div, true);
  document['c_' + code] = componente;
  return componente;
};

HTMLMakerController.prototype.newHTMLGrid = function(code) {
  if (!code) code = this.getNextComponentCode();
  var posX = 20;
  var posY = 20;
  var width = 200;
  var height = 150;
  var name = 'Novo' + code;
  var label = 'Novo';
  var formID = 6341;
  var componente = new HTMLGrid(this.sys, this.formID, code, posX, posY, width, height, formID);
  componente.formWidth = 569;
  componente.formHeight = 446;
  componente.editable = false;
  componente.callForm = false;
  componente.setMainImages(1, 1, 1, 1);
  componente.setEditImages(1, 1);
  componente.setIncludeImages(1, 1, 1);
  componente.gridini = 0;
  componente.parentHasData = true;
  componente.hasdata = false;
  componente.gridend = 0;
  componente.setData([]);
  componente.setColumns(['PARAMETRO', 'VALOR'], [233, 289], [40169, 40170]);
  componente.dependent = true;
  componente.id = name;
  componente.design(d.t.getSelectedTab().div, true);
  componente.enableNavigation(false, false, false, false);
  document['c_' + code] = componente;
  return componente;
};

/**
 * HTMLMakerForm
 **/
function HTMLMakerForm(maker) {
  this.create(maker);
}

HTMLMakerForm.prototype.name = 'HTMLMakerForm';

HTMLMakerForm.prototype.create = function(maker) {
  this.fmaker = maker;
};

HTMLMakerForm.prototype.getMaker = function() {
  if (!this.maker) {
    this.maker = new HTMLMakerInfo(this);
    this.maker.events = this.fmaker.events;
  }

  return this.maker;
};

/**
 * HTMLMakerInfo
 **/

function HTMLMakerInfo(component) {
  this.create(component);
}

HTMLMakerInfo.prototype.name = 'HTMLMakerInfo';

HTMLMakerInfo.prototype.create = function(component) {
  this.component = component;
  this.modified = false;
  this.inserted = false;
  this.props = new Object();
  this.propsNames = new Array();
  this.events = new Array();
};

HTMLMakerInfo.prototype.getComponentType = function() {
  var cname = this.component.name;
  if (cname == 'HTMLButton') return 'B';
  if (cname == 'HTMLImage') return 'I';
  if (cname == 'HTMLRadioGroup') return 'R';
  if (cname == 'HTMLEdit') return 'E';
  if (cname == 'HTMLMemo') return 'M';
  if (cname == 'HTMLLabel') return 'L';
  if (cname == 'HTMLLookup') return 'K';
  if (cname == 'HTMLComboBox') return 'C';
  if (cname == 'HTMLCheckBox') return 'H';
  if (cname == 'HTMLGrid') return 'G';
  if (cname == 'HTMLDetailPanel') return 'D';
  if (cname == 'HTMLGroupBox') return 'V'; // Moldura
  if (cname == 'HTMLMakerForm') return 'F';
  alert("Tipo desconhecido: " + cname + ' ' + this.component);
};

HTMLMakerInfo.prototype.showInspector = function() {
  d.n.getMaker().showInspector(this.component);
};

HTMLMakerInfo.prototype.setProp = function(name, value) {
  if (typeof(this.props[name]) == "undefined")
    this.propsNames[this.propsNames.length] = name;
  this.props[name] = value;
  this.modified = true;
};

HTMLMakerInfo.prototype.getProp = function(name) {
  if (name == 'PosicaoX') return this.component.getX();
  if (name == 'PosicaoY') return this.component.getY();
  if (name == 'Altura') return this.component.getHeight();
  if (name == 'Tamanho') return this.component.getWidth();
  //if (name == 'Campo') alert('Campo: ' + this.props[name]);      
  return this.props[name];
};

HTMLMakerInfo.prototype.toString = function() {
  return '[HTMLMakerInfo: ' + this.component + ']';
};

HTMLMakerInfo.prototype.getPropCount = function() {
  return this.propsNames ? this.propsNames.length : 0;
};

HTMLMakerInfo.prototype.getPropName = function(index) {
  return this.propsNames[index];
};

HTMLMakerInfo.prototype.getTabName = function() {
  tabIndex = d.t.tabs.indexOf(d.t.getTabByName(this.component.getTabName())) + 1;
  tabIndex = (tabIndex < 10) ? '0' + tabIndex : tabIndex;
  return tabIndex + '-' + this.component.getTabName();
};

HTMLMakerInfo.prototype.applyUpdates = function() {
  // Aplica as alterações da propriedades ao componente
  this.component.updateComponent({
    x: this.props["PosicaoX"],
    y: this.props["PosicaoY"],
    width: this.props["Tamanho"],
    height: this.props["Altura"],
    description: this.props["Descricao"]
  });

  if ((typeof this.props["Cor"] != "undefined") && (trim(this.props["Cor"]) != '')) {
    this.component.setBGColor(ebfDelphiColorToRGB(this.props["Cor"]));
  }
};

// Eventos
HTMLMakerInfo.prototype.setEvent = function(moment, value) {
  this.events[moment] = value;
  this.modified = true;
};

HTMLMakerInfo.prototype.getEvent = function(moment) {
  return this.events[moment];
};

HTMLMakerInfo.prototype.getEventCount = function() {
  return this.events ? this.events.length : 0;
};