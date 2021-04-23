function HTMLNavigationQuery(sys, id, first, previous, next, last) {
  this.sys = sys;
  this.id = id;

  this.first = first;
  this.previous = previous;
  this.next = next;
  this.last = last;

  this.gridHeaderFields = [];
  this.gridLength = 0;
  this.gridVisibleFieldsLength = 0;
  this.gridFirstRow = 0;
  this.gridTotalRows = -1;
  this.gridOrdered = false;

  this.initialized = false;
  this.advancedQuery = false;
}

HTMLNavigationQuery.inherits(HTMLObject);
HTMLNavigationQuery.prototype.name = 'HTMLNavigationQuery';

/**
 * Define os estados dos botões de paginação da barra de navegação.
 * @param first Valor lógico indicando se o botão de primeira página está habilitado.
 * @param previous Valor lógico indicando se o botão de página anterior está habilitado.
 * @param next Valor lógico indicando se o botão de próxima página está habilitado.
 * @param last Valor lógico indicando se o botão de última página está habilitado.
 **/
HTMLNavigationQuery.prototype.setPaginationState = function(first, previous, next, last) {
  this.first = first;
  this.previous = previous;
  this.next = next;
  this.last = last;
};

/**
 * Define o documento onde a navegação será inicializada.
 * @param doc Documento onde a navegação será inicializada.
 **/
HTMLNavigationQuery.prototype.setDocument = function(doc) {
  this.doc = doc;

  // Procurar pela grade da aba localizar.
  this.grid = this.doc.getElementById("results-table");
  this.gridHead = this.grid.getElementsByTagName("thead")[0];
  this.gridBody = this.grid.getElementsByTagName("tbody")[0];

  // Procurar pela div responsiva da grade da aba localizar.
  this.gridContext = this.doc.getElementById("table-context");

  // Procurar pela div de campos colapsados.
  this.collapsedFields = this.doc.getElementById("collapsed-fields");

  // Procurar pela div do rodapé.
  this.searchFooter = this.doc.getElementById("search-footer");

  // Procurar pelo iframe de navegação.
  this.navIframe = this.doc.getElementById("WFRQueryResults");

  // Procurar pelo spinner da página.
  this.pageloader = this.doc.getElementById("pageloader");
};

/**
 * Define o índice da primeira linha exibida na tabela.
 * @param firstRow �?ndice da primeira linha exibida na tabela.
 **/
HTMLNavigationQuery.prototype.setGridFirstRow = function(firstRow) {
  this.gridFirstRow = firstRow;
};

/**
 * Obtém o índice da primeira linha exibida na tabela.
 **/
HTMLNavigationQuery.prototype.getGridFirstRow = function() {
  return this.gridFirstRow;
};

/**
 * Define o total de registros da grade.
 * @param totalRows Total de registros da grade.
 **/
HTMLNavigationQuery.prototype.setGridTotalRows = function(totalRows) {
  this.gridTotalRows = totalRows;
};

/**
 * Obtém o total de registros da grade.
 **/
HTMLNavigationQuery.prototype.getGridTotalRows = function() {
  return this.gridTotalRows;
};

/**
 * Define os estados dos botões de ordenação da grade.
 **/
HTMLNavigationQuery.prototype.setOrderState = function() {
  this.gridOrdered = false;

  for (var i = 0; i < arguments.length; i++) {
    // Procurar pelo botão de ordenar da coluna.
    var sortButton = this.doc.getElementById("field-sort-" + i);
    var sortButtonIcon = this.doc.getElementById("field-sort-icon-" + i);

    if (arguments[i] == 1) {
      if (sortButtonIcon) sortButtonIcon.className = "fas fa-sort-down"; // Font Awesome
      if (sortButton) sortButton.style.opacity = "1.0";
      this.gridOrdered = true;
    } else if (arguments[i] == 2) {
      if (sortButtonIcon) sortButtonIcon.className = "fas fa-sort-up"; // Font Awesome
      if (sortButton) sortButton.style.opacity = "1.0";
      this.gridOrdered = true;
    } else {
      if (sortButtonIcon) sortButtonIcon.className = "fas fa-sort"; // Font Awesome
      if (sortButton) sortButton.style.opacity = null;
    }
  }
};

/**
 * Define o valor lógico que indica se o filtro atual é avançado.
 * @param advancedQuery Valor lógico que indica se o filtro atual é avançado.
 **/
HTMLNavigationQuery.prototype.setAdvancedQuery = function(advancedQuery) {
  this.advancedQuery = advancedQuery;
};

/**
 * Obtém um valor lógico que indica se o filtro atual é avançado.
 **/
HTMLNavigationQuery.prototype.isAdvancedQuery = function() {
  return this.advancedQuery;
};

/**
 * Responsável por desenhar o HTML da navegação.
 * @param doc Documento onde a navegação será inicializada.
 **/
HTMLNavigationQuery.prototype.design = function(doc) {
  var object = this;

  // Associar eventos de tecla a página.
  this.onkeydown = function(e) { object.handleShortcutKeys(e); };
  window.addEventListener("keydown", this.onkeydown, false);

  // Obter a div da navbar.
  this.div = this.doc.getElementById("query-nav");

  // Criar a barra de navegação da grade da aba localizar.
  this.nav = this.doc.createElement("nav");
  this.nav.className = "navbar navbar-expand navbar-light mb-0 p-0"; // Bootstrap
  this.nav.style.fontSize = "1.15rem";
  this.div.appendChild(this.nav);

  // Criar div de colapso da barra de navegação.
  this.navCollapse = this.doc.createElement("div");
  this.navCollapse.className = "navbar-collapse"; // Bootstrap
  this.navCollapse.id = "navbar-menu";
  this.nav.appendChild(this.navCollapse);

  // Criar a navegação da direita.
  this.leftNav = this.doc.createElement("ul");
  this.leftNav.className = "navbar-nav flex-row flex-wrap mr-auto"; // Bootstrap
  this.navCollapse.appendChild(this.leftNav);
  this.itemContext = this.leftNav;

  // Criar item de primeira página da navegação da grade.
  this.navItemFirst = this.designItem("first", function() {
    if (object.first) object.navigationAction("navigate", "first");
  }, this.first, "fas fa-angle-double-left", getLocaleMessage("LABEL.FIRST_PAGE")); // Font Awesome

  // Criar item de página anterior da navegação da grade.
  this.navItemPrevious = this.designItem("previous", function() {
    if (object.previous) object.navigationAction("navigate", "previous");
  }, this.previous, "fas fa-chevron-left", getLocaleMessage("LABEL.PREVIOUS_PAGE")); // Font Awesome

  // Criar item de próxima página da navegação da grade.
  this.navItemNext = this.designItem("next", function() {
    if (object.next) object.navigationAction("navigate", "next");
  }, this.next, "fas fa-chevron-right", getLocaleMessage("LABEL.NEXT_PAGE")); // Font Awesome

  // Criar item de última página da navegação da grade.
  this.navItemLast = this.designItem("last", function() {
    if (object.last) object.navigationAction("navigate", "last");
  }, this.last, "fas fa-angle-double-right", getLocaleMessage("LABEL.LAST_PAGE")); // Font Awesome

  // Criar a navegação da esquerda
  this.rightNav = this.doc.createElement("ul");
  this.rightNav.className = "navbar-nav flex-row flex-wrap"; // Bootstrap
  this.navCollapse.appendChild(this.rightNav);

  // Criar item de filtro avançado
  this.designDivider();
  this.navItemAdvQuery = this.designItem("advanced-filter", function() {
    bootstrapShowModal("#advanced-query-modal");
  }, true, "fas fa-filter", getLocaleMessage("INFO.GRID_ADVANCED_FILTER"));

  // Criar segundo ícone para o item de pesquisa avançada
  var navItemAdvSearchIconElem = this.doc.createElement("i");
  navItemAdvSearchIconElem.className = "fas fa-plus ml-1 pt-1"; // Font Awesome - Bootstrap
  navItemAdvSearchIconElem.style.fontSize = "0.8rem";
  this.navItemAdvQuery.itemLink.appendChild(navItemAdvSearchIconElem);

  // Criar item de limpar pesquisa
  this.navItemClearSearch = this.designItem("clear-filter", function() {
    object.clearFilters();
  }, true, "fas fa-filter", getLocaleMessage("INFO.GRID_ADVANCED_FILTER_CLEAR"));

  // Criar segundo ícone para o item de limpar pesquisa
  var navItemClearSearchIconElem = this.doc.createElement("i");
  navItemClearSearchIconElem.className = "fas fa-times ml-1 pt-1"; // Font Awesome - Bootstrap
  navItemClearSearchIconElem.style.fontSize = "0.8rem";
  this.navItemClearSearch.itemLink.appendChild(navItemClearSearchIconElem);

  // Criar item de atualizar registros
  this.designDivider();
  this.navItemUpdateGrid = this.designItem("update-grid", function() {
    object.updateGrid();
  }, true, "fas fa-sync-alt", getLocaleMessage("LABEL.REFRESH"));

  // Associar evento ao collapse dos campos colapsados.
  if (this.collapsedFields) {
    $(this.collapsedFields).on("show.bs.collapse", function() {
      if (object.gridContext) $(object.gridContext).collapse("hide");
      if (object.navItemExpandFields && object.navItemExpandFields.itemLink) {
        var expandFieldsIcon = object.navItemExpandFields.itemLink.getElementsByTagName("i");
        if (expandFieldsIcon.length > 0) expandFieldsIcon[0].className = "fas fa-arrow-up"; // Font Awesome
      }
    });

    $(this.collapsedFields).on("shown.bs.collapse", function() {
      if (!object.collapsedFields.classList.contains("overflow-auto")) { // Bootstrap
        object.collapsedFields.classList.add("overflow-auto"); // Bootstrap
      }
    });

    $(this.collapsedFields).on("hide.bs.collapse", function() {
      if (object.gridContext) $(object.gridContext).collapse("show");
      if (object.navItemExpandFields && object.navItemExpandFields.itemLink) {
        var expandFieldsIcon = object.navItemExpandFields.itemLink.getElementsByTagName("i");
        if (expandFieldsIcon.length > 0) expandFieldsIcon[0].className = "fas fa-cogs"; // Font Awesome
      }

      if (object.collapsedFields.classList.contains("overflow-auto")) { // Bootstrap
        object.collapsedFields.classList.remove("overflow-auto"); // Bootstrap
      }
    });
  }

  // Associar evento ao collapse do contexto da grade.
  if (this.gridContext) {
    $(this.gridContext).on("show.bs.collapse", function() {
      if (!object.gridContext.classList.contains("overflow-auto")) // Bootstrap
        object.gridContext.classList.add("overflow-auto"); // Bootstrap
      if (!object.gridContext.classList.contains("flex-fill")) // Bootstrap
        object.gridContext.classList.add("flex-fill"); // Bootstrap
      if (object.gridContext.classList.contains("mt-auto")) // Bootstrap
        object.gridContext.classList.remove("mt-auto"); // Bootstrap
    });

    $(this.gridContext).on("hide.bs.collapse", function() {
      if (object.gridContext.classList.contains("overflow-auto")) // Bootstrap
        object.gridContext.classList.remove("overflow-auto"); // Bootstrap
      if (object.gridContext.classList.contains("flex-fill")) // Bootstrap
        object.gridContext.classList.remove("flex-fill"); // Bootstrap
      if (!object.gridContext.classList.contains("mt-auto")) // Bootstrap
        object.gridContext.classList.add("mt-auto"); // Bootstrap
    });
  }
};

/**
 * Desenha um divisor na barra de navegação.
 **/
HTMLNavigationQuery.prototype.designDivider = function() {
  var dividerDiv = this.doc.createElement("li");
  dividerDiv.className = "position-relative my-0 mx-2 d-inline-flex align-items-center justify-content-center border-left"; // Bootstrap
  this.itemContext.appendChild(dividerDiv);
  return dividerDiv;
};

/**
 * Desenha um item na barra de navegação.
 * @param id ID do item.
 * @param action Ação de clique do item.
 * @param enabled Valor lógico indicando se o item está ativado.
 * @param icon Classe do ícone do item.
 * @param title Título do item.
 **/
HTMLNavigationQuery.prototype.designItem = function(id, action, enabled, icon, title) {
  // Criar LI do item na barra de navegação.
  var itemDiv = this.doc.createElement("li");
  itemDiv.className = "nav-item position-relative p-1 generic-btn"; // Bootstrap - Custom 
  if (id) itemDiv.id = "nav-item-" + id;

  // Verificar se o item está ativado.
  if (enabled) {
    itemDiv.style.opacity = "1.0";
  } else {
    // Se o item não estiver ativo, não permitir nenhuma ação.
    itemDiv.className += " disabled";
    itemDiv.style.pointerEvents = "none";
    itemDiv.style.cursor = "default";
  }

  // Criar o link do item na barra de navegação.
  var itemLink = this.doc.createElement("a");
  itemLink.className = "nav-link position-relative h-100 d-flex align-items-center"; // Bootstrap
  itemLink.href = "#";
  itemLink.style.textDecoration = "none";
  itemDiv.appendChild(itemLink);

  // Verificar se o item possui título.
  if (title) {
    // Definir hint do item.
    itemLink.title = title;
    itemLink.setAttribute("data-toggle", "tooltip"); // Bootstrap

    // Inicializar tooltip do Bootstrap.
    bootstrapInitTooltip(itemLink);
  }

  // Associar evento de clique ao item.
  if (action) {
    var object = this;
    itemLink.onclick = function() {
      if (title) bootstrapCloseTooltip(itemLink);
      action.apply(object);
    };
  }

  // Verificar se o item possui ícone.
  if (icon) {
    // Desenhar o ícone do item.
    var itemIcon = this.doc.createElement("i");
    itemIcon.className = icon;
    itemLink.appendChild(itemIcon);
  }

  // Adicionar o item na barra de navegação.
  this.itemContext.appendChild(itemDiv);

  return {
    itemDiv: itemDiv,
    itemLink: itemLink
  };
};

/**
 * Desenha um item dropdown na barra de navegação.
 * @param id ID do item.
 * @param action Ação de clique do item.
 * @param enabled Valor lógico indicando se o item está ativado.
 * @param icon Classe do ícone do item.
 * @param title Título do item.
 **/
HTMLNavigationQuery.prototype.designItemDropdown = function(id, action, enabled, icon, title) {
  // Desenhar o item na barra de navegação.
  var item = this.designItem(id, action, enabled, icon, title);

  // Ajeitar estrutura do item para suportar o menu dropdown.
  item.itemDiv.className += " dropdown"; // Bootstrap
  item.itemLink.id = "dropdown-" + getRandomCode();
  item.itemLink.className += " dropdown-toggle"; // Bootstrap
  item.itemLink.setAttribute("data-toggle", "dropdown");
  item.itemLink.setAttribute("aria-haspopup", "true");
  item.itemLink.setAttribute("aria-expanded", "false");

  // Verificar se não possui ação e possui tooltip.
  if (!action && title) {
    // Associar evento de clique para fechar tooltip quando clicar.
    item.itemLink.onclick = function() {
      bootstrapCloseTooltip(item.itemLink);
    };
  }

  // Desenhar a div do menu dropdown.
  var itemDropdown = this.doc.createElement("div");
  itemDropdown.className = "dropdown-menu overflow-auto"; // Bootstrap
  itemDropdown.style.maxHeight = "75vh";
  itemDropdown.setAttribute("aria-labelledby", item.itemLink.id);
  item.itemDiv.appendChild(itemDropdown);
  item.itemDropdown = itemDropdown;

  return item;
};

/**
 * Desenha um título num menu dropdown.
 * @param dropdown Referência para o item que possui o menu dropdown.
 * @param title Título do item.
 **/
HTMLNavigationQuery.prototype.designDropdownTitle = function(dropdown, title) {
  var dropdownTitle = this.doc.createElement("h6");
  dropdownTitle.className = "dropdown-header"; // Bootstrap
  dropdownTitle.innerHTML = title;
  dropdown.itemDropdown.appendChild(dropdownTitle);
};

/**
 * Desenha um divisor num menu dropdown.
 * @param dropdown Referência para o item que possui o menu dropdown.
 **/
HTMLNavigationQuery.prototype.designDropdownDivider = function(dropdown) {
  var dropdownDivider = this.doc.createElement("div");
  dropdownDivider.className = "dropdown-divider"; // Bootstrap
  dropdown.itemDropdown.appendChild(dropdownDivider);
};

/**
 * Desenha um item num menu dropdown.
 * @param dropdown Referência para o item que possui o menu dropdown.
 * @param id ID do item.
 * @param title Título do item.
 * @param action Ação de clique do item.
 **/
HTMLNavigationQuery.prototype.designDropdownItem = function(dropdown, id, title, action) {
  var dropdownItem = this.doc.createElement("a");
  dropdownItem.href = "#";
  dropdownItem.className = "dropdown-item"; // Bootstrap
  if (id) dropdownItem.id = "nav-item-" + id;
  if (title) dropdownItem.innerHTML = title;
  dropdown.itemDropdown.appendChild(dropdownItem);

  // Associar evento de clique ao item.
  if (action) {
    var object = this;
    dropdownItem.onclick = function() {
      action.apply(object);
    };
  }

  return dropdownItem;
};

/**
 * Cria o item no menu dropdown de uma coluna da grade.
 * @param dropdown Referência para o item que possui o menu dropdown.
 * @param index �?ndice da coluna na grade.
 * @param field ID da coluna da grade.
 * @param fieldName Nome da coluna da grade.
 * @param fieldVisible Valor lógico indicando se a coluna está visível.
 * @param fieldSize Tamanho da coluna.
 * @param fieldRealName Nome real da coluna da grade.
 **/
HTMLNavigationQuery.prototype.assignGridField = function(dropdown, index, field, fieldName, fieldVisible, fieldSize, fieldRealName) {
  var object = this;

  // Transformar índice em string.
  index = index.toString();

  // Guardar propriedades da coluna.
  this.gridHeaderFields.push({
    index: index,
    field: field,
    fieldName: fieldName,
    fieldVisible: fieldVisible,
    fieldSize: fieldSize,
    fieldRealName: fieldRealName
  });

  // Definir total de colunas visíveis.
  if (fieldVisible) this.gridVisibleFieldsLength++;

  // Procurar pelo botão de ordenar da coluna.
  var sortButton = this.doc.getElementById("field-sort-" + index);

  // Associar evento de clique ao botão de ordenar coluna.
  if (sortButton) {
    sortButton.onclick = function(e) {
      object.selectGridField(fieldRealName);
    };
  }

  // Verificar se a coluna possui tamanho definido.
  if (fieldSize && fieldSize > 0) {
    // Procurar pelo elemento da coluna.
    var gridColumn = this.doc.querySelector('th[data-field-index="' + index + '"]');
    if (gridColumn) gridColumn.style.width = fieldSize + "px";
  }

  if (dropdown) {
    // Desenhar o item da coluna da grade no menu dropdown.
    var dropdownItem = this.designDropdownItem(dropdown);
    dropdownItem.id = "field-" + index;
    if (!fieldVisible) dropdownItem.className += " hidden-field";

    // Desenhar a div base da checkbox do item.
    var dropdownItemCheckboxBase = this.doc.createElement("div");
    dropdownItemCheckboxBase.className = "custom-control custom-checkbox"; // Bootstrap
    dropdownItem.appendChild(dropdownItemCheckboxBase);

    // Desenhar o input da checkbox do item.
    var dropdownItemCheckboxInput = this.doc.createElement("input");
    dropdownItemCheckboxInput.type = "checkbox";
    dropdownItemCheckboxInput.className = "custom-control-input"; // Bootstrap
    dropdownItemCheckboxInput.id = "field-visibility-" + index;
    if (fieldVisible) dropdownItemCheckboxInput.checked = true;
    dropdownItemCheckboxBase.appendChild(dropdownItemCheckboxInput);

    // Desenhar a label da checkbox do item.
    var dropdownItemCheckboxLabel = this.doc.createElement("label");
    dropdownItemCheckboxLabel.className = "custom-control-label"; // Bootstrap
    dropdownItemCheckboxLabel.innerHTML = stringToHTMLString(fieldName);
    dropdownItemCheckboxInput.setAttribute("for", "field-visibility-" + index);
    dropdownItemCheckboxBase.appendChild(dropdownItemCheckboxLabel);

    // Associar evento de clique ao item.
    dropdownItem.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Verificar se a checkbox não está desabilitada.
      if (!dropdownItemCheckboxInput.disabled) {
        // Alternar estado do checkbox.
        dropdownItemCheckboxInput.checked = !dropdownItemCheckboxInput.checked;

        // Gurdar novo valor da propriedade da coluna.
        object.gridHeaderFields[index].fieldVisible = dropdownItemCheckboxInput.checked;

        // Salvar preferências do usuário no servidor.
        object.saveCustomizations(true);
      }

      return false;
    };
  }
};

/**
 * Finaliza a criação do menu dropdown da grade.
 * @param dropdown Referência para o item que possui o menu dropdown.
 * @param defaultItem Descrição para o item de voltar ao padrão.
 **/
HTMLNavigationQuery.prototype.finishDropdownDesign = function(dropdown, defaultItem) {
  if (dropdown && defaultItem) {
    // Desenhar divisor no menu dropdown.
    this.designDropdownDivider(dropdown);

    // Desenhar o item de voltar ao padrão no menu dropdown.
    var defaultItemElement = this.designDropdownItem(dropdown, "grid-visibility-default", defaultItem);

    // Associar evento de clique ao item.
    var object = this;
    defaultItemElement.onclick = function(e) {
      try {
        if (mainform.insert) {
          mainform.d.n.actIncludeCancel();
        } else if (mainform.edit) {
          mainform.d.n.actEditCancel();
        }
      } catch (e) { }

      object.sendUpdateRequest('revertDefaultGrid.do?sys=' + mainform.sysCode + '&action=revertDefaultGrid&param=cancel&formID=' + URLEncode(mainform.formGUID, 'GET'), true);
    };
  }
};

/**
 * Salva as customizações da grade (tamanho e visibilidade das colunas) do usuário atual.
 **/
HTMLNavigationQuery.prototype.saveCustomizations = function(reload) {
  var hasReordered = false;

  var minIndex = 0;
  var maxIndex = 0;

  // Obter os itens do primeiro <tr> do cabeçalho da grade.
  var firstHead = this.grid.getElementsByTagName("thead")[0];
  var firstHeadTr = firstHead.getElementsByTagName("tr")[0];
  var tableHeadThs = firstHeadTr.getElementsByTagName("th");

  for (var i = 0; i < tableHeadThs.length; i++) {
    if (tableHeadThs[i].hasAttribute("data-scope-index")) {
      // Obter o índice da coluna no escopo da página.
      var index = parseInt(tableHeadThs[i].getAttribute("data-scope-index"));

      // Definir índices mínimos e máximos.
      minIndex = Math.min(minIndex, index);
      maxIndex = Math.max(maxIndex, index);

      // Verificar se os índices estão diferentes.
      if (index != i) {
        // �?ndices não batem, isso significa que as colunas da tabela foram reordenadas.
        hasReordered = true;
      }
    }
  }

  var requestJson = [];

  // Verificar se as colunas foram reordenadas.
  if (hasReordered) {
    // Montar o JSON da requisição usando a ordem definida.
    for (var i = 0; i < tableHeadThs.length; i++) {
      if (tableHeadThs[i].hasAttribute("data-field-index")) {
        // Obter o índice da coluna.
        var fieldIndex = parseInt(tableHeadThs[i].getAttribute("data-field-index"));

        // Adicionar item ao JSON.
        requestJson[i] = {
          "field": this.gridHeaderFields[fieldIndex].field,
          "show": this.gridHeaderFields[fieldIndex].fieldVisible ? "1" : "0",
          "size": this.gridHeaderFields[fieldIndex].fieldSize.toString()
        };
      }
    }

    // Adicionar os itens restantes.
    for (var i = 0; i < this.gridHeaderFields.length; i++) {
      // Verificar se o índice atual está fora do escopo.
      if (i < minIndex || i > maxIndex) {
        requestJson[i] = {
          "field": this.gridHeaderFields[i].field,
          "show": this.gridHeaderFields[i].fieldVisible ? "1" : "0",
          "size": this.gridHeaderFields[i].fieldSize.toString()
        };
      }
    }
  } else {
    // Montar o JSON da requisição usando as colunas já definidas.
    for (var i = 0; i < this.gridHeaderFields.length; i++) {
      requestJson.push({
        "field": this.gridHeaderFields[i].field,
        "show": this.gridHeaderFields[i].fieldVisible ? "1" : "0",
        "size": this.gridHeaderFields[i].fieldSize.toString()
      });
    }
  }

  // Verificar se o JSON possui dados.
  if (requestJson.length > 0) {
    // Mandar requisição para o servidor para atualizar as customizações do usuário.
    this.sendUpdateRequest('upGrid.do?sys=' + mainform.sysCode + '&action=upGrid&formID=' + URLEncode(mainform.formGUID, 'GET') +
      '&columns=' + URLEncode(JSON.stringify(requestJson), 'GET'), reload);
  }
};

/**
 * Navega para um registro da grade.
 * @param gridini �?ndice do primeiro item exibido na grade.
 * @param gridrn �?ndice do ítem do registro.
 **/
HTMLNavigationQuery.prototype.navigateToRegistry = function(gridini, gridrn) {
  var gt = 1 + parseInt(gridrn) + parseInt(gridini);
  let road = 'sys=' + mainform.sysCode + '&action=form&param=goto&formID=' + mainform.idForm + '&align=-1&mode=&goto=' + gt + '&filter=&forceGetResponse=true';
  if (mainform.WEBRUN_CSRFTOKEN) road += '&WEBRUN-CSRFTOKEN=' + mainform.WEBRUN_CSRFTOKEN;
  mainform.eval(mainform.postURL('form.do', road));
  mainform.document.n.normal();
  mainform.document.t.tabs[0].select(); // Seleciona a aba
};

/**
 * Navega através das páginas da grade.
 * @param action Nome da action que irá lidar com a navegação da grade.
 * @param param Tipo da navegação (próxima página, página anterior, etc).
 **/
HTMLNavigationQuery.prototype.navigationAction = function(action, param) {
  if (!action) action = "navigate";
  this.showPreloader();
  this.navIframe.src = action + '.do?sys=' + this.sys + '&formID=' + URLEncode(this.id, "GET") + '&componentID=-1&action=' + action + '&showResults=true&param=' + param;
};

/**
 * Atualiza os registros da grade.
 **/
HTMLNavigationQuery.prototype.updateGrid = function() {
  this.showPreloader();
  this.navIframe.src = 'navigate.do?sys=' + this.sys + '&action=navigate&formID=' + URLEncode(this.id, "GET") + '&componentID=-1&type=1&showResults=true&q=';
};

/**
 * Adiciona uma linha na grade da aba localizar.
 * @param values Vetor com os valores de cada coluna da linha.
 **/
HTMLNavigationQuery.prototype.addGridRow = function(values) {
  if (!values || values.length == 0) return;

  // Criar elemento da linha.
  var rowTr = this.doc.createElement("tr");
  rowTr.className = "dnd-moved"; // Drag & Drop Table Columns

  // Dar loop nos valores da linha.
  for (var i = 0; i < values.length; i++) {
    // Criar elemento para o valor da coluna da linha.
    var rowTd = this.doc.createElement("td");
    if (i == 0) rowTd.className = "border-left-0"; // Bootstrap
    else if (i == values.length - 1) rowTd.className = "border-right-0"; // Bootstrap
    if (this.gridLength == 0) rowTd.className = (rowTd.className + " border-top-0").trim(); // Bootstrap
    rowTd.innerHTML = values[i];
    rowTr.appendChild(rowTd);
  }

  // Adicionar linha a grade.
  this.gridBody.appendChild(rowTr);
  this.gridLength++;

  // Associar evento de clique a linha.
  var object = this;
  rowTr.onclick = function(e) {
    object.selectGridRow(rowTr);
  };

  // Associar evento de duplo clique a linha.
  var index = this.gridLength - 1;
  rowTr.ondblclick = function(e) {
    object.navigateToRegistry(object.getGridFirstRow(), index);
  };
};

/**
 * Limpa o corpo da grade da aba localizar.
 **/
HTMLNavigationQuery.prototype.clearGrid = function() {
  // Limpar corpo da grade.
  this.gridBody.innerHTML = "";

  // Resetar variáveis.
  this.gridLength = 0;
  this.gridTotalRows = -1;
  this.gridFirstRow = 0;

  // Resetar barra de rolagem.
  this.gridContext.scrollTop = 0;
};

/**
 * Limpa os filtros da aba localizar.
 **/
HTMLNavigationQuery.prototype.clearFilters = function() {
  window.clearFields();
  window.doSubmit(false);

  this.lastSearchValue = null;
  this.searchValue = null;
};

/**
 * Aplica os filtros da aba localizar.
 **/
HTMLNavigationQuery.prototype.search = function() {
  window.doSubmit(true);
  this.lastSearchValue = this.searchValue;
};

/**
 * Atualiza o layout da aba localizar.
 **/
HTMLNavigationQuery.prototype.updateLayout = function() {
  // Atualizar botão de primeira página da barra de navegação.
  if (this.navItemFirst) {
    if (this.first) {
      if (this.navItemFirst.itemDiv.classList.contains("disabled"))
        this.navItemFirst.itemDiv.classList.remove("disabled");
      this.navItemFirst.itemDiv.style.opacity = "1.0";
      this.navItemFirst.itemDiv.style.pointerEvents = null;
      this.navItemFirst.itemDiv.style.cursor = "pointer";
    } else {
      if (!this.navItemFirst.itemDiv.classList.contains("disabled"))
        this.navItemFirst.itemDiv.classList.add("disabled");
      this.navItemFirst.itemDiv.style.opacity = null;
      this.navItemFirst.itemDiv.style.pointerEvents = "none";
      this.navItemFirst.itemDiv.style.cursor = "default";
    }
  }

  // Atualizar botão de página anterior da barra de navegação.
  if (this.navItemPrevious) {
    if (this.previous) {
      if (this.navItemPrevious.itemDiv.classList.contains("disabled"))
        this.navItemPrevious.itemDiv.classList.remove("disabled");
      this.navItemPrevious.itemDiv.style.opacity = "1.0";
      this.navItemPrevious.itemDiv.style.pointerEvents = null;
      this.navItemPrevious.itemDiv.style.cursor = "pointer";
    } else {
      if (!this.navItemPrevious.itemDiv.classList.contains("disabled"))
        this.navItemPrevious.itemDiv.classList.add("disabled");
      this.navItemPrevious.itemDiv.style.opacity = null;
      this.navItemPrevious.itemDiv.style.pointerEvents = "none";
      this.navItemPrevious.itemDiv.style.cursor = "default";
    }
  }

  // Atualizar botão de próxima página da barra de navegação.
  if (this.navItemNext) {
    if (this.next) {
      if (this.navItemNext.itemDiv.classList.contains("disabled"))
        this.navItemNext.itemDiv.classList.remove("disabled");
      this.navItemNext.itemDiv.style.opacity = "1.0";
      this.navItemNext.itemDiv.style.pointerEvents = null;
      this.navItemNext.itemDiv.style.cursor = "pointer";
    } else {
      if (!this.navItemNext.itemDiv.classList.contains("disabled"))
        this.navItemNext.itemDiv.classList.add("disabled");
      this.navItemNext.itemDiv.style.opacity = null;
      this.navItemNext.itemDiv.style.pointerEvents = "none";
      this.navItemNext.itemDiv.style.cursor = "default";
    }
  }

  // Atualizar botão de última página da barra de navegação.
  if (this.navItemLast) {
    if (this.last) {
      if (this.navItemLast.itemDiv.classList.contains("disabled"))
        this.navItemLast.itemDiv.classList.remove("disabled");
      this.navItemLast.itemDiv.style.opacity = "1.0";
      this.navItemLast.itemDiv.style.pointerEvents = null;
      this.navItemLast.itemDiv.style.cursor = "pointer";
    } else {
      if (!this.navItemLast.itemDiv.classList.contains("disabled"))
        this.navItemLast.itemDiv.classList.add("disabled");
      this.navItemLast.itemDiv.style.opacity = null;
      this.navItemLast.itemDiv.style.pointerEvents = "none";
      this.navItemLast.itemDiv.style.cursor = "default";
    }
  }

  // Verificar se não é Internet Explorer.
  if (!(navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1)) {
    // Atualizar colunas da grade.
    var thead = this.grid.getElementsByTagName("thead")[0];
    var theadTopAccum = thead.offsetTop;
    var trs = thead.getElementsByTagName("tr");
    for (var i = 0; i < trs.length; i++) {
      var headThs = trs[i].getElementsByTagName("th");
      theadTopAccum += trs[i].offsetTop;
      for (var j = 0; j < headThs.length; j++) {
        headThs[j].style.top = theadTopAccum + "px";
      }
    }
  }

  // Procurar pelos checkbox do menu de contexto de visibilidade de colunas.
  var gridFieldVisibilityItem = this.doc.getElementById("nav-item-grid-visibility");
  if (gridFieldVisibilityItem) {
    var checkboxes = gridFieldVisibilityItem.getElementsByTagName("input");
    for (var i = 0; i < checkboxes.length; i++) {
      // Verificar se a grade possui uma coluna visível.
      if (this.gridVisibleFieldsLength <= 1) {
        // Desabilitar a checkbox para não permitir que a grade seja oculta por completo.
        checkboxes[i].disabled = checkboxes[i].checked;
      } else {
        // Não desabilitar a checkbox.
        checkboxes[i].disabled = false;
      }
    }
  }

  // Obter item de remover ordenação da grade.
  var gridRemOrderItem = this.doc.getElementById("nav-item-grid-order-rem");
  if (gridRemOrderItem) {
    if (this.gridOrdered && gridRemOrderItem.classList.contains("disabled")) {
      gridRemOrderItem.classList.remove("disabled");
    } else if (!this.gridOrdered && !gridRemOrderItem.classList.contains("disabled")) {
      gridRemOrderItem.classList.add("disabled");
    }

    // Obter o nav-link do item de remover ordenação da grade.
    var gridRemOrderItemLink = gridRemOrderItem.getElementsByClassName("nav-link"); // Bootstrap
    if (gridRemOrderItemLink.length > 0) {
      if (this.gridOrdered && gridRemOrderItemLink[0].classList.contains("disabled")) {
        gridRemOrderItemLink[0].classList.remove("disabled");
      } else if (!this.gridOrdered && !gridRemOrderItemLink[0].classList.contains("disabled")) {
        gridRemOrderItemLink[0].classList.add("disabled");
      }

      // Verificar se o segundo ícone ainda não foi criado.
      var gridRemOrderItemIcons = gridRemOrderItemLink[0].getElementsByTagName("i");
      if (gridRemOrderItemIcons.length <= 1) {
        // Criar segundo ícone para o item de remover ordenação da grade.
        var iconElem = this.doc.createElement("i");
        iconElem.className = "fas fa-times ml-1 pt-1"; // Font Awesome - Bootstrap
        iconElem.style.fontSize = "0.8rem";
        gridRemOrderItemLink[0].appendChild(iconElem);
      }
    }
  }

  // Verificar se está em filtro avançado.
  if (this.navItemAdvQuery) {
    if (this.isAdvancedQuery() && !this.navItemAdvQuery.itemLink.classList.contains("text-danger")) { // Bootstrap
      this.navItemAdvQuery.itemLink.classList.add("text-danger"); // Bootstrap
    } else if (!this.isAdvancedQuery() && this.navItemAdvQuery.itemLink.classList.contains("text-danger")) { // Bootstrap
      this.navItemAdvQuery.itemLink.classList.remove("text-danger"); // Bootstrap
    }
  }

  // Procurar pelos resizers da grade.
  var jcolResizers = this.doc.getElementsByClassName("JCLRgrip");
  for (var i = 0; i < jcolResizers.length; i++) {
    // Atualizar o tamanho deles pois as vezes eles mantêm a altura anterior.
    jcolResizers[i].style.height = this.grid.offsetHeight + "px";
  }
};

/**
 * Atualiza o layout dos campos da aba localizar.
 **/
HTMLNavigationQuery.prototype.updateFieldsLayout = function() {
  if (!this.searchFooter) return;

  var isEmpty = true;
  this.searchValue = null;

  if (isEmpty && this.gridHead) {
    // Obter os campos de pesquisa da grade.
    var gridInputs = this.grid.getElementsByClassName("query-input");
    if (gridInputs.length > 0) {
      for (var i = 0; i < gridInputs.length; i++) {
        // Verificar se o campo não está vazio.
        if (gridInputs[i].value != "") {
          isEmpty = false;
          this.searchValue = gridInputs[i].value;
          break;
        }
      }
    }
  }

  if (isEmpty && this.collapsedFields) {
    // Obter os campos de pesquisa da grade.
    var collapsedFieldsInputs = this.collapsedFields.getElementsByClassName("query-input");
    if (collapsedFieldsInputs.length > 0) {
      for (var i = 0; i < collapsedFieldsInputs.length; i++) {
        // Verificar se o campo não está vazio.
        if (collapsedFieldsInputs[i].value != "") {
          isEmpty = false;
          this.searchValue = collapsedFieldsInputs[i].value;
          break;
        }
      }
    }
  }

  if (!isEmpty && this.searchValue != this.lastSearchValue) {
    // Exibir rodapé da aba localizar.
    $(this.searchFooter).collapse("show");
  } else {
    // Esconder rodapé da aba localizar.
    $(this.searchFooter).collapse("hide");
  }
};

/**
 * Finaliza a inicialização da navegação da aba localizar.
 **/
HTMLNavigationQuery.prototype.finishDesign = function() {
  // Procurar pelos menus dropdowns dos tipos dos filtros da pesquisa.
  var filterTypeDropdowns = this.doc.getElementsByClassName("field-type-dropdown");
  for (var i = 0; i < filterTypeDropdowns.length; i++) {
    // Obter o índice da coluna.
    var fieldIndex = filterTypeDropdowns[i].getAttribute("data-field");

    // Obter os itens do menu dropdown atual.
    var dropdownItems = filterTypeDropdowns[i].getElementsByClassName("dropdown-item");

    for (var j = 0; j < dropdownItems.length; j++) {
      (function(context, index, dropdownMenu, dropdownItem) {
        // Associar evento de clique ao item do menu dropdown.
        dropdownItem.onclick = function(e) {
          // Procurar pelo input onde é armazenado o valor atual.
          var queryTypeInput = context.doc.getElementById("type-" + index);

          // Definir o valor do input.
          queryTypeInput.value = dropdownItem.getAttribute("data-value");

          // Procurar pelos itens ativos.
          var activeItems = dropdownMenu.getElementsByClassName("active"); // Bootstrap
          for (var k = 0; k < activeItems.length; k++) {
            activeItems[k].classList.remove("active"); // Bootstrap
          }

          // Definir item como ativo.
          dropdownItem.classList.add("active"); // Bootstrap

          // Procurar pelo botão do campo.
          var dropdownButton = context.doc.getElementById("dropdown-button-" + index);
          if (dropdownButton) {
            // Procurar pelo ícone do item do menu dropdown.
            var dropdownItemIcon = dropdownItem.getElementsByTagName("i")[0];

            // Procurar pelo ícone do botão do campo.
            var dropdownButtonIcon = dropdownButton.getElementsByTagName("i")[0];

            // Definir o ícone do botão do campo.
            dropdownButtonIcon.className = dropdownItemIcon.className;
          }
        };
      })(this, fieldIndex, filterTypeDropdowns[i], dropdownItems[j]);
    }
  }

  // Verificar se a aba possui campos colapsados.
  if (this.div.hasAttribute("data-hascollapsed") && this.div.getAttribute("data-hascollapsed") == "true") {
    // Criar item de expandir itens colapsados.
    this.itemContext = this.rightNav;
    this.navItemExpandFields = this.designItem("expand-fields", function() {
      $("#collapsed-fields").collapse("toggle");
    }, true, "fas fa-cogs"); // Font Awesome
  }

  // Marcar a navegação como inicializada.
  this.initialized = true;
};

/**
 * Retorna um valor lógico indicando se a navegação foi inicializada.
 **/
HTMLNavigationQuery.prototype.isInitialized = function() {
  return this.initialized;
};

/**
 * Seleciona uma linha na grade.
 * @param row Referência para o elemento da linha da grade.
 **/
HTMLNavigationQuery.prototype.selectGridRow = function(row) {
  // Obter os itens da grade.
  var parentChildren = row.parentElement.children;
  for (var i = 0; i < parentChildren.length; i++) {
    // Remover classe highlight dos itens, se tiverem.
    if (parentChildren[i].classList.contains("highlight")) {
      parentChildren[i].classList.remove("highlight");
    }
  }

  // Adicionar classe highlight na linha, se não tiver.
  if (!row.classList.contains("highlight")) {
    row.classList.add("highlight");
  }
};

/**
 * Rola a barra de rolagem para uma linha da grade.
 * @param el Referência para o elemento da linha da grade.
 **/
HTMLNavigationQuery.prototype.scrollToGridRow = function(el) {
  var topOfPage = this.gridContext.scrollTop + this.gridHead.offsetHeight;
  var heightOfPage = this.gridContext.offsetHeight - this.gridHead.offsetHeight;

  var elY = 0, elH = 0;
  if (this.doc.layers) { // NS4
    elY = el.y;
    elH = el.height;
  } else {
    for (var p = el; p && p.tagName.toUpperCase() != 'BODY'; p = p.offsetParent)
      elY += p.offsetTop;
    elH = el.offsetHeight;
  }

  if ((topOfPage + heightOfPage) < (elY + elH)) {
    el.scrollIntoView(false);
  } else if (elY < topOfPage) {
    el.scrollIntoView(true);
    this.gridContext.scrollTop -= this.gridHead.offsetHeight;
  }
};

/**
 * Seleciona uma coluna da grade.
 * @param fieldRealName Nome real da coluna da grade.
 **/
HTMLNavigationQuery.prototype.selectGridField = function(fieldRealName) {
  this.showPreloader();
  this.navIframe.src = "";
  this.navIframe.src = 'order.do?sys=' + mainform.sysCode + '&action=order&formID=' + mainform.idForm + '&field=' + URLEncode(fieldRealName, "GET");
};

/**
 * Exibe um preloader na tela.
 * @param background Valor lógico indicando se o preloader deve ter cor de fundo.
 **/
HTMLNavigationQuery.prototype.showPreloader = function(background) {
  if (!this.preloader) {
    // Criar spinner do Bootstrap.
    this.preloader = bootstrapCreateSpinner(this.gridBody, "text-primary", true, { // Bootstrap
      position: "fixed",
      useViewportWidth: true,
      useViewportHeight: true
    })[1];

    // Verificar se o preloader deve ter cor de fundo.
    if (background) {
      this.preloader[0].style.backgroundColor = window.getComputedStyle(this.doc.body).backgroundColor;
      this.preloader[0].style.opacity = "0.8";
    }
  }
};

/**
 * Esconde o preloader da tela.
 **/
HTMLNavigationQuery.prototype.hidePreloader = function() {
  if (this.preloader) {
    // Procurar pelo elemento do spinner.
    var spinner = this.doc.getElementById("spinner" + this.preloader);
    if (spinner) {
      // Deletar spinner do Bootstrap.
      spinner.parentElement.removeChild(spinner);
      spinner = null;
    }

    this.preloader = null;
  }
};

/**
 * Exibe o preloader da página.
 **/
HTMLNavigationQuery.prototype.showPageloader = function() {
  if (this.pageloader.classList.contains("d-none")) this.pageloader.classList.remove("d-none");
  if (!this.pageloader.classList.contains("d-flex")) this.pageloader.classList.add("d-flex");
};

/**
 * Oculta o preloader da página.
 **/
HTMLNavigationQuery.prototype.hidePageloader = function() {
  if (this.pageloader.classList.contains("d-flex")) this.pageloader.classList.remove("d-flex");
  if (!this.pageloader.classList.contains("d-none")) this.pageloader.classList.add("d-none");
};

/**
 * Ocorre quando o pedido é finalizado.
 **/
HTMLNavigationQuery.prototype.onRequestFinished = function() {
  // Atualizar layout da aba localizar.
  this.updateLayout();

  // Esconder preloaders.
  this.hidePreloader();
  this.hidePageloader();

  // Tornar a grade reodernável e redimensionável.
  this.makeGridDraggable();
  this.makeGridResizable();

  // Clicar no primeiro item da grade.
  try { this.gridBody.getElementsByTagName("tr")[0].click(); } catch (e) { }
};

/**
 * Inicializa o Drag & Drop Table Columns na grade para fazer ela reordenável.
 **/
HTMLNavigationQuery.prototype.makeGridDraggable = function() {
  var object = this;

  // Inicializar o Drag & Drop Table Columns.
  $(this.grid).dragableColumns({
    drag: true,
    dragClass: 'table-drag',
    overClass: 'table-over',
    movedContainerSelector: '.dnd-moved',

    onDragEnd: function(colPositions) {
      // Salvar customizações do usuário.
      object.saveCustomizations(true);
    }
  });

  // Obter os itens do primeiro <tr> do cabeçalho da grade.
  var firstHead = this.grid.getElementsByTagName("thead")[0];
  var firstHeadTr = firstHead.getElementsByTagName("tr")[0];
  var tableHeadThs = firstHeadTr.getElementsByTagName("th");

  for (var i = 0; i < tableHeadThs.length; i++) {
    if (tableHeadThs[i].hasAttribute("draggable")) {
      // Desabilitar a movimentação.
      tableHeadThs[i].setAttribute("draggable", "false");
    }
  }
};

/**
 * Inicializa o colResizable na grade para fazer ela redimensionável.
 **/
HTMLNavigationQuery.prototype.makeGridResizable = function() {
  var object = this;
  $(this.grid).colResizable({
    // resizeMode: [type: string] [default: 'fit'] [version: 1.6] [values: 'fit', 'flex', 'overflow']
    // It is used to set how the resize method works. Those are the possible values:
    // 'fit': this is default resizing model, in which resizing a column does not alter table width,
    // which means that when a column is expanded the next one shrinks.
    // 'flex': in this mode tables can change its width and each column can shrink or expand independently
    // if there is enough space in the parent container. If there is not enough space, columns will share
    // its width as they are resized. Table will never get bigger than its parent.
    // 'overflow': allows to resize columns with overflow of parent container.
    resizeMode: "overflow",

    // liveDrag: [type: boolean] [default: false] [version: 1.0]
    // When set to true the table layout is updated while dragging column anchors.
    // liveDrag enabled is more CPU consuming so it is not recommended for slow computers,
    // specially when dealing with huge or extremely complicated tables.
    liveDrag: true,

    // minWidth: [type: number] [default: 15] [version: 1.1]
    // This value specifies the minimum width (measured in pixels) that is allowed for the columns.
    minWidth: 100,

    /*// innerGripHtml: [type: string] [default: empty string] [version: 1.0]
    // Its purpose is to allow column anchor customization by defining the HTML to be used in the
    // column grips to provide some visual feedback. It can be used in a wide range of ways to obtain
    // very different outputs, and its flexibility can be increased by combining it with the draggingClass attribute.
    gripInnerHtml: "<div class=\"grip position-relative bg-light shadow-sm rounded-circle border d-flex align-items-center justify-content-center overflow-hidden\"></div>", // Bootstrap

    // draggingClass: [type: string] [default: internal css class] [version: 1.0]
    // This attribute is used as the css class assigned to column anchors while being dragged.
    // It can be used for visual feedback purposes.
    draggingClass: "dragging",*/

    // onResize: [type: callback function] [default: null] [version: 1.0]
    // If a callback function is supplied it will be fired when the user has ended dragging a
    // column anchor altering the previous table layout. The callback function can obtain a reference
    // to the updated table through the currentTarget attribute of the event retrieved by parameters.
    onResize: function() {
      object.setGridSizes();
      object.saveCustomizations(false);
    },

    /*// onDrag: [type: callback function] [default: null] [version: 1.1]
    // This event is fired while dragging a column anchor if liveDrag is enabled. It can be useful
    // if the table is being used as a multiple range slider. The callback function can obtain a
    // reference to the updated table through the currentTarget attribute of the event retrieved by
    // parameters.
    onDrag: function() { }*/
  });

  this.setGridSizes();
};

/**
 * Envia um pedido ao servidor e atualiza a grade após a finalização.
 * @param field Referência para o elemento da coluna da grade.
 **/
HTMLNavigationQuery.prototype.sendUpdateRequest = function(url, reload) {
  if (reload) this.showPageloader();

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function(e) {
    if (xhr.readyState === 4 || xhr.status === 200) {
      if (reload) location.reload();
    }
  };

  xhr.onerror = function(e) {

  };

  xhr.send();
};

/**
 * Atualiza a cache de tamanhos das colunas da grade.
 **/
HTMLNavigationQuery.prototype.setGridSizes = function() {
  // Obter os itens do cabeçalho da grade.
  var firstHead = this.grid.getElementsByTagName("thead")[0];
  var firstHeadTr = firstHead.getElementsByTagName("tr")[0];
  var tableHeadThs = firstHeadTr.getElementsByTagName("th");

  // Definir variável de largura total.
  var totalWidth = 0;

  for (var i = 0; i < tableHeadThs.length; i++) {
    if (tableHeadThs[i].hasAttribute("data-field-index")) {
      // Obter o estilo computado do <th> atual.
      var thComputedStyle = window.getComputedStyle(tableHeadThs[i]);

      // Obter a largura atual e a largura mínima.
      var currentWidth = thComputedStyle ? parseInt(thComputedStyle.width) : parseInt(tableHeadThs[i].style.width);
      var minWidth = thComputedStyle && thComputedStyle.minWidth.length > 0 ? parseInt(thComputedStyle.minWidth) : 0;

      // Verificar se a largura não está ultrapassando o limite.
      if (minWidth > 0 && currentWidth < minWidth) {
        // Ajustar largura do <th>.
        tableHeadThs[i].style.width = minWidth + "px";
        currentWidth = minWidth;
      }

      // Salvar largura do <th>.
      this.gridHeaderFields[parseInt(tableHeadThs[i].getAttribute("data-field-index"))].fieldSize = currentWidth;

      // Incrementar largura total.
      totalWidth += currentWidth;
    }
  }

  // Obter o último resizer da grade.
  var lastGrip = document.getElementsByClassName("JCLRLastGrip");
  if (lastGrip && lastGrip.length > 0) {
    // Verificar se a distância é menor que a largura total.
    if (totalWidth > 0 && parseInt(lastGrip[0].style.left) < totalWidth) {
      lastGrip[0].style.left = totalWidth + "px";
    }
  }
};

/**
 * Remove a ordenação da grade.
 **/
HTMLNavigationQuery.prototype.removeGridOrder = function() {
  if (confirm($mainform().mainform.getLocaleMessage("INFO.GRID_REMOVE_GRID_ORDER"))) {
    this.navIframe.src = 'order.do?sys=' + this.sys + '&formID=' + URLEncode(this.id, "GET") + '&action=order&field=$';
  }
};

/**
 * Abre a tela de importação de dados.
 **/
HTMLNavigationQuery.prototype.importGridData = function() {
  openWFRDataImport(this.sys, this.id);
};

/**
 * Exporta os dados da tabela em TXT.
 **/
HTMLNavigationQuery.prototype.exportGridDataTXT = function() {
  openWFRExport(this.sys, this.id, 'TXT');
};

/**
 * Exporta os dados da tabela em XML.
 **/
HTMLNavigationQuery.prototype.exportGridDataXML = function() {
  openWFRExport(this.sys, this.id, 'XML');
};

/**
 * Exporta os dados da tabela em HTML.
 **/
HTMLNavigationQuery.prototype.exportGridDataHTML = function() {
  openWFRExport(this.sys, this.id, 'HTML');
};

/**
 * Exporta os dados da tabela em forma de listagem.
 **/
HTMLNavigationQuery.prototype.exportGridDataLST = function() {
  openWFRExport(this.sys, this.id, 'LST');
};

/**
 * Tratar as teclas de atalho da página.
 **/
HTMLNavigationQuery.prototype.handleShortcutKeys = function(e) {
  e = e || window.event;

  if (e.target.tagName.toUpperCase() == "INPUT") {
    // Obter os campos de pesquisa da grade.
    var gridInputs = this.grid.getElementsByClassName("query-input");
    if (gridInputs.length == 0) return false;

    var inputIndex = 0;

    // Obter o índice do input atual.
    for (var i = 0; i < gridInputs.length; i++) {
      if (gridInputs[i] == e.target) {
        inputIndex = i;
        break;
      }
    }

    // Lidar com as teclas de atalho dos inputs.
    if (e.which === 9 || e.code === "Tab") {
      e.preventDefault();

      if (inputIndex == gridInputs.length - 1) {
        // Voltar para o primeiro input.
        inputIndex = 0;
      } else inputIndex++;

      // Focar o próximo input.
      gridInputs[inputIndex].focus();
    }
  } else {
    // Obter as linhas da grade.
    var gridTrs = this.gridBody.getElementsByTagName("tr");

    // Obter a linha selecionada da grade.
    var highlightedRow = this.grid.getElementsByClassName("highlight");

    // Verificar se a grade possui linha selecionada.
    if (highlightedRow.length == 0) return false;
    highlightedRow = highlightedRow[0];

    var targetRow = null;
    var rowIndex = 0;

    if (highlightedRow) {
      // Procurar pelo índice da linha selecionada.
      for (var i = 0; i < gridTrs.length; i++) {
        if (gridTrs[i] == highlightedRow) {
          rowIndex = i;
          break;
        }
      }
    }

    // Lidar com as teclas de atalho da grade.
    if (e.which === 38 || e.code === "ArrowUp") {
      e.preventDefault();

      // Verificar se a grade possui linha selecionada.
      if (highlightedRow) {
        if (rowIndex - 1 < 0) {
          // Selecionar a última linha da grade.
          targetRow = gridTrs[gridTrs.length - 1];
          rowIndex = gridTrs.length - 1;
        } else {
          // Selecionar a linha anterior da grade.
          targetRow = gridTrs[rowIndex - 1];
          rowIndex--;
        }
      } else {
        // Selecionar o primeiro linha da grade.
        targetRow = gridTrs[0];
        rowIndex = 0;
      }
    } else if (e.which === 40 || e.code === "ArrowDown") {
      e.preventDefault();

      // Verificar se a grade possui linha selecionada.
      if (highlightedRow) {
        if (rowIndex + 1 < gridTrs.length) {
          // Selecionar a próxima linha da grade.
          targetRow = gridTrs[rowIndex + 1];
          rowIndex++;
        } else {
          // Selecionar a primeira linha da grade.
          targetRow = gridTrs[0];
          rowIndex = 0;
        }
      } else {
        // Selecionar a primeira linha da grade.
        targetRow = gridTrs[0];
        rowIndex = 0;
      }
    } else if (e.which === 33 || e.code === "PageUp") {
      e.preventDefault();

      // Clicar no item de página anterior.
      if (this.navItemPrevious && this.navItemPrevious.itemLink) {
        this.navItemPrevious.itemLink.click();
      }
    } else if (e.which === 34 || e.code === "PageDown") {
      e.preventDefault();

      // Clicar no item de próxima página.
      if (this.navItemNext && this.navItemNext.itemLink) {
        this.navItemNext.itemLink.click();
      }
    } else if (e.which === 36 || e.code === "Home") {
      e.preventDefault();

      // Selecionar a primeira linha da grade.
      targetRow = gridTrs[0];
      rowIndex = 0;
    } else if (e.which === 35 || e.code === "End") {
      e.preventDefault();

      // Selecionar a última linha da grade.
      targetRow = gridTrs[gridTrs.length - 1];
      rowIndex = gridTrs.length - 1;
    } else if (e.which === 13 || e.code === "Enter") {
      e.preventDefault();

      // Realizar ação de duplo clique na linha da grade.
      if (highlightedRow && highlightedRow.ondblclick) {
        highlightedRow.ondblclick.apply(highlightedRow);
      }
    } else if (e.which === 9 || e.code === "Tab") {
      e.preventDefault();

      // Obter os campos de pesquisa da grade.
      var gridInputs = this.grid.getElementsByClassName("query-input");
      if (gridInputs.length == 0) return false;

      // Focar o primeiro campo de pesquisa.
      gridInputs[0].focus();
    }

    if (targetRow) {
      // Selecionar a linha da grade.
      this.selectGridRow(targetRow);

      // Rolar a grade para a linha selecionada, se necessário.
      this.scrollToGridRow(targetRow);
    }
  }
};

/**
 * Esconde os collapses e exibe o corpo da grade.
 **/
HTMLNavigationQuery.prototype.showTableContent = function() {
  if (this.searchFooter) $(this.searchFooter).collapse("hide");
  if (this.collapsedFields) $(this.collapsedFields).collapse("hide");
  if (this.gridContext) $(this.gridContext).collapse("show");
};
