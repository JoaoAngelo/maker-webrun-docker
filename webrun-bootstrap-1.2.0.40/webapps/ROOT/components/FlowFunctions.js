function FlowFunctions() {

  this.code;
  this.name;
  this.description;
  this.realName;
  this.resum;
  this.params = new Array;
  this.returnValue;
  this.type;
  
}

FlowFunctions.prototype.name = '';

// GETERS
FlowFunctions.prototype.getCode = function() {
  return this.code;
}

FlowFunctions.prototype.getResum = function() {
  return this.resum;
}

FlowFunctions.prototype.getName = function() {
  return this.name;
}

FlowFunctions.prototype.getDescription = function() {
  return this.description;
}

FlowFunctions.prototype.getRealName = function() {
  return this.realName;
}

FlowFunctions.prototype.getReturnValue = function() {
  return this.returnValue;
}

FlowFunctions.prototype.getType = function() {
  return this.type;
}


// SETERS
FlowFunctions.prototype.setCode = function(codeValue) {
  this.code = codeValue;
}

FlowFunctions.prototype.setName = function(nameValue) {
  this.name = nameValue;
}

FlowFunctions.prototype.setDescription = function(descriptionValue) {
  this.description = descriptionValue;
}

FlowFunctions.prototype.setRealName = function(realNameValue) {
  this.realName = realNameValue;
}

FlowFunctions.prototype.setResum = function(resumValue) {
	this.resum = resumValue;
}

FlowFunctions.prototype.setReturnValue = function(returnValue) {
  this.returnValue = returnValue;
}

FlowFunctions.prototype.setType = function(typeValue) {
  this.type = typeValue;
}

// MÉTODOS
FlowFunctions.prototype.addParam = function(param) {
  this.params.push(param);
}

FlowFunctions.prototype.getParam = function(index) {
  return this.params[index];
}


