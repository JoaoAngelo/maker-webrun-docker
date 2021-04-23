function HTMLPermissionForm(sys, formID, width, height, formDescription) {
  this.sys = sys;
  this.formID = formID;
  this.width = width;
  this.height = height;
  this.formDescription = formDescription;
}

HTMLPermissionForm.inherits(HTMLObject);
HTMLPermissionForm.prototype.name = "HTMLPermissionForm";
HTMLPermissionForm.prototype.zindex = 1000002;

/**
 * Desenhar o editor de permissões do formulário.
 */
HTMLPermissionForm.prototype.design = function() {
  // Obter a div lay do formulário.
  this.doc = d && d.lay ? d.lay : document.getElementById("lay");

  // Criar a div base do edito de permissões.
  this.div = document.createElement("div");
  this.div.id = "WFRFormPerm" + this.formID;
  this.div.className = "position-fixed d-flex flex-row align-items-stretch justify-content-center w-100 p-3"; // Bootstrap
  this.div.style.bottom = "0px";
  this.div.style.right = "0px";
  this.div.style.zIndex = this.zindex;
  this.div.style.pointerEvents = "none";
  this.doc.appendChild(this.div);

  // Verificar se a lista de formulários foi definida.
  if (this.forms && this.forms.length > 0) {
    // Criar o select da lista de formulários.
    this.formsCombo = document.createElement("select");
    this.formsCombo.className = "form-control w-100 mr-2"; // Bootstrap
    this.formsCombo.style.pointerEvents = "all";
    this.formsCombo.style.maxWidth = "15rem";
    this.formsCombo.parent = this;
    this.div.appendChild(this.formsCombo);

    // Criar opção vazia.
    var emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.selected = true;
    emptyOption.disabled = true;
    emptyOption.innerHTML = "&nbsp;";
    this.formsCombo.appendChild(emptyOption);

    // Criar opções dos formulários.
    for (var i = 0; i < this.forms.length; i++) {
      var formOption = document.createElement("option");
      formOption.value = this.forms[i].guid;
      formOption.innerHTML = stringToHTMLString(this.forms[i].name);
      this.formsCombo.appendChild(formOption);
    }

    // Criar botão de abrir formulário.
    this.openFormButton = document.createElement("button");
    this.openFormButton.type = "button";
    this.openFormButton.className = "btn btn-secondary"; // Bootstrap
    this.openFormButton.title = getLocaleMessage("LABEL.OPEN_FORM");
    this.openFormButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
    this.openFormButton.style.pointerEvents = "all";
    this.openFormButton.disabled = true;
    this.openFormButton.parent = this;
    this.div.appendChild(this.openFormButton);

    var openFormButtonIcon = document.createElement("i");
    openFormButtonIcon.className = "fas fa-external-link-alt"; // Font Awesome
    this.openFormButton.appendChild(openFormButtonIcon);

    // Associar evento de clique ao botão de abrir formulário.
    this.openFormButton.addEventListener("click", function() {
      ebfFormOpenForm(this.parent.formsCombo.options[this.parent.formsCombo.selectedIndex].value);
    });

    // Associar evento de alterar no select de formulários.
    this.formsCombo.addEventListener("change", function() {
      var selectedValue = this.parent.formsCombo.selectedIndex >= 0 ?
        this.parent.formsCombo.options[this.parent.formsCombo.selectedIndex].value : null;
      this.parent.openFormButton.disabled = (selectedValue === null || selectedValue.length == 0);
    });

    // Criar o div do separador.
    var separatorDiv = document.createElement("div");
    separatorDiv.className = "mx-2 border-left"; // Bootstrap
    this.div.appendChild(separatorDiv);
  }

  // Criar botão de editar permissões do formulário.
  this.permissionsButton = document.createElement("div");
  this.permissionsButton.className = "btn btn-secondary px-2"; // Bootstrap
  this.permissionsButton.title = getLocaleMessage("LABEL.EDIT_PERMISSIONS");
  this.permissionsButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  this.permissionsButton.style.pointerEvents = "all";
  this.permissionsButton.parent = this;
  this.div.appendChild(this.permissionsButton);

  var permissionsButtonIcon = document.createElement("i");
  permissionsButtonIcon.className = "fas fa-key"; // Font Awesome
  this.permissionsButton.appendChild(permissionsButtonIcon);

  // Associar evento de clique ao botão de editar permissões do formulário.
  this.permissionsButton.addEventListener("click", function() {
    openFormAccess(this.parent.sys, this.parent.formID, document.title);
  });
};

HTMLPermissionForm.prototype.toString = function() {
  return "[object " + this.name + ": " + this.formDescription + "]";
};
