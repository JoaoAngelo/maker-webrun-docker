/**
 * Método construtor do HTMLQuery. Responsável por criar o componente Consulta.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente. 
 **/
function HTMLQuery(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);

  this.offset = 0;
  this.reachEnd = false;
  this.connectionError = true;
  this.searched = false;
  this.columns = [];
}

/**
 * Herança do objeto.
 **/
HTMLQuery.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLQuery.prototype.name = 'HTMLQuery';
HTMLQuery.prototype.tabable = true;

/**
 * Seta a propriedade Enable do componente.
 * @param v - FALSE desabilita o botão.
 **/
HTMLQuery.prototype.setEnabled = function(v) {
  this.enabled = v;
  if (this.div && this.divClass) {
    this.div.className = v ? this.divClass : this.divClass + " disabled";
  }
};

/**
 * Obtém a URL base dos pedidos do Consulta.
 **/
HTMLQuery.prototype.getRequestURL = function() {
  return getAbsolutContextPath() + "componentData.do?action=componentData&sys=" + URLEncode(this.sys, 'GET') +
    "&formID=" + URLEncode(this.formID, 'GET') + "&comID=" + URLEncode(this.code, 'GET');
};

/**
 * Formata o valor exibido em uma linha da tabela.
 * @param value Valor exibido na linha da tabela.
 * @param row Referência para a linha da tabela.
 **/
HTMLQuery.prototype.formatColumn = function(value, row) {
  if (value === undefined || value === null || value.length == 0) return "-";
  if (!row.context) return value;
  value = stringToHTMLString(value);
  var searchLowerCase = row.context.searchInput.value.toLowerCase();
  var valueLowerCase = value.toLowerCase();
  var searchIndex = valueLowerCase.indexOf(searchLowerCase);
  return searchIndex != -1 ? value.substring(0, searchIndex) + "<b>" +
    value.substring(searchIndex, searchIndex + searchLowerCase.length) + "</b>" +
    value.substring(searchIndex + searchLowerCase.length, valueLowerCase.length) : value;
};

/**
 * Responsável por desenhar o HTML do componente Consulta. 
 * @param doc Documento onde o componente será inserido.
 **/
HTMLQuery.prototype.designComponent = function(doc) {
  var object = this;
  this.divClass = this.div.className;

  // Obter propriedades do componente e dar parse nelas.
  this.limit = (this.LimiteRegistros && this.LimiteRegistros.length && this.LimiteRegistros.length > 0) ? parseInt(this.LimiteRegistros) : 10;

  // Importar o CSS do Jquery Resizable Columns.
  if (!document.getElementById("jquery-resizableColumns-css")) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'assets/jquery.resizableColumns.min.css';
    link.id = 'jquery-resizableColumns-css';
    head.appendChild(link);
  }

  // Importar o script do Jquery Resizable Columns.
  webrun.include("assets/jquery.resizableColumns.min.js");

  // Importar o CSS do Bootstrap Table.
  if (!document.getElementById("bstrap-table-css")) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'components/grid/bootstrap-table.min.css';
    link.id = 'bstrap-table-css';
    head.appendChild(link);
  }

  // Importar os scripts do Bootstrap Table.
  webrun.include("components/grid/bootstrap-table.min.js");
  webrun.include("components/grid/bootstrap-table-locale-all.min.js");

  // Importar o CSS da extensão Sitcky Header do Bootstrap Table.
  if (!document.getElementById("bstrap-table-sticky-css")) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'components/grid/extensions/sticky-header/bootstrap-table-sticky-header.css';
    link.id = 'bstrap-table-sticky-css';
    head.appendChild(link);
  }

  // Importar os scripts das extensões do Bootstrap Table.
  webrun.include("components/grid/extensions/resizable/bootstrap-table-resizable.min.js");
  webrun.include("components/grid/extensions/sticky-header/bootstrap-table-sticky-header.min.js");

  this.contentDiv = document.createElement("div");
  this.contentDivClass = "position-relative w-100 h-100"; // Bootstrap
  this.contentDiv.className = "d-none"; // Bootstrap
  this.div.appendChild(this.contentDiv);

  // Criar o loader do Consulta.
  this.preloader = document.createElement("div");
  this.preloader.className = "d-none"; // Bootstrap
  this.preloaderClass = "spinner-border text-primary"; // Bootstrap
  this.preloader.setAttribute("role", "status");
  this.div.appendChild(this.preloader);

  var preloaderSpan = document.createElement("span");
  preloaderSpan.className = "sr-only"; // Bootstrap
  preloaderSpan.innerHTML = getLocaleMessage("LABEL.LOADING") + "...";
  this.preloader.appendChild(preloaderSpan);

  // Criar toolbar da tabela.
  this.inlineForm = document.createElement("div");
  this.inlineForm.className = "form-inline"; // Bootstrap
  this.contentDiv.appendChild(this.inlineForm);

  // Criar grupo dos elementos de pesquisa.
  this.searchInputGroup = document.createElement("div");
  this.searchInputGroup.className = "input-group mb-2 mr-sm-3";
  this.inlineForm.appendChild(this.searchInputGroup);

  // Criar input de pesquisa.
  this.searchInput = document.createElement("input");
  this.searchInput.className = "form-control"; // Bootstrap
  this.searchInput.type = "text";
  this.searchInput.placeholder = getLocaleMessage('LABEL.CHAT_SEARCH');
  this.searchInputGroup.appendChild(this.searchInput);

  this.searchInput.onkeydown = function(e) {
    if (e.key === 'Enter' || e.which === 13) {
      e.preventDefault();
      object.searchAction();
    }
  };

  // Criar botão de pesquisar.
  this.searchButtonDiv = document.createElement("div");
  this.searchButtonDiv.className = "input-group-append"; // Bootstrap
  this.searchInputGroup.appendChild(this.searchButtonDiv);

  this.searchButton = document.createElement("button");
  this.searchButton.type = "button";
  this.searchButton.className = "btn btn-secondary"; // Bootstrap
  this.searchButton.title = getLocaleMessage('LABEL.SEARCH');
  this.searchButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  this.searchButtonDiv.appendChild(this.searchButton);

  var searchButtonIcon = document.createElement("i");
  searchButtonIcon.className = "fas fa-search"; // Font Awesome
  this.searchButton.appendChild(searchButtonIcon);

  // Associar eventos ao botão de pesquisar.
  this.attachEvent(this.searchButton, "click", this.searchAction);

  // Criar grupo dos elementos de paginação.
  var pageButtonsGroup = document.createElement("div");
  pageButtonsGroup.className = "btn-group mb-2 mr-3"; // Bootstrap
  pageButtonsGroup.setAttribute("role", "group");
  this.inlineForm.appendChild(pageButtonsGroup);

  // Criar botão de primeira página.
  this.firstPageButton = document.createElement("button");
  this.firstPageButton.type = "button";
  this.firstPageButton.className = "btn btn-secondary"; // Bootstrap
  this.firstPageButton.title = getLocaleMessage('LABEL.FIRST_RECORD');
  this.firstPageButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  pageButtonsGroup.appendChild(this.firstPageButton);

  var firstPageButtonIcon = document.createElement("i");
  firstPageButtonIcon.className = "fas fa-angle-double-left"; // Font Awesome
  this.firstPageButton.appendChild(firstPageButtonIcon);

  // Associar eventos ao botão de primeira página.
  this.attachEvent(this.firstPageButton, "click", this.firstPageAction);

  // Criar botão de voltar página.
  this.previousPageButton = document.createElement("button");
  this.previousPageButton.type = "button";
  this.previousPageButton.className = "btn btn-secondary"; // Bootstrap
  this.previousPageButton.title = getLocaleMessage('LABEL.PREVIOUS_RECORD');
  this.previousPageButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  pageButtonsGroup.appendChild(this.previousPageButton);

  var previousPageButtonIcon = document.createElement("i");
  previousPageButtonIcon.className = "fas fa-chevron-left"; // Font Awesome
  this.previousPageButton.appendChild(previousPageButtonIcon);

  // Associar eventos ao botão de voltar página.
  this.attachEvent(this.previousPageButton, "click", this.previousPageAction);

  // Criar botão de avançar página.
  this.nextPageButton = document.createElement("button");
  this.nextPageButton.type = "button";
  this.nextPageButton.className = "btn btn-secondary"; // Bootstrap
  this.nextPageButton.title = getLocaleMessage('LABEL.NEXT_RECORD');
  this.nextPageButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  pageButtonsGroup.appendChild(this.nextPageButton);

  var nextPageButtonIcon = document.createElement("i");
  nextPageButtonIcon.className = "fas fa-chevron-right"; // Font Awesome
  this.nextPageButton.appendChild(nextPageButtonIcon);

  // Associar eventos ao botão de avançar página.
  this.attachEvent(this.nextPageButton, "click", this.nextPageAction);

  // Criar botão de última página.
  this.lastPageButton = document.createElement("button");
  this.lastPageButton.type = "button";
  this.lastPageButton.className = "btn btn-secondary"; // Bootstrap
  this.lastPageButton.title = getLocaleMessage('LABEL.LAST_RECORD');
  this.lastPageButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  pageButtonsGroup.appendChild(this.lastPageButton);

  var lastPageButtonIcon = document.createElement("i");
  lastPageButtonIcon.className = "fas fa-angle-double-right"; // Font Awesome
  this.lastPageButton.appendChild(lastPageButtonIcon);

  // Criar botão de atualizar.
  this.refreshButton = document.createElement("button");
  this.refreshButton.type = "button";
  this.refreshButtonClass = "btn btn-secondary mb-2"; // Bootstrap
  this.refreshButton.className = "d-none"; // Bootstrap
  this.refreshButton.title = getLocaleMessage('LABEL.REFRESH');
  this.refreshButton.setAttribute("data-toggle", "tooltip"); // Bootstrap
  this.inlineForm.appendChild(this.refreshButton);

  var refreshButtonIcon = document.createElement("i");
  refreshButtonIcon.className = "fas fa-sync-all"; // Font Awesome
  this.refreshButton.appendChild(refreshButtonIcon);

  // Associar eventos ao botão de atualizar.
  this.attachEvent(this.refreshButton, "click", this.refreshAction);

  // Carrega os dados do componente.
  this.updateData();
};

/**
 * Exibe o preloader do consulta.
 **/
HTMLQuery.prototype.showPreloader = function() {
  if (this.contentDiv) this.contentDiv.className = "d-none"; // Bootstrap
  if (this.preloader) this.preloader.className = this.preloaderClass;
  if (this.div) this.div.className = this.divClass + " d-flex align-items-center justify-content-center"; // Bootstrap
};

/**
 * Oculta o preloader do consulta.
 **/
HTMLQuery.prototype.hidePreloader = function() {
  if (this.contentDiv) this.contentDiv.className = this.contentDivClass;
  if (this.preloader) this.preloader.className = "d-none"; // Bootstrap
  if (this.div) this.div.className = this.divClass;
};

/**
 * Verificar a resposta do servidor.
 * @param response Resposta do servidor.
 **/
HTMLQuery.prototype.checkServerResponse = function(response) {
  // Verificar se a operação falhou.
  if (response && response.success === "0") {
    // Exibir uma mensagem de erro.
    interactionError(safeGetLocaleMessage("ERROR.OPERATION_ERROR"), null, null, null, response.details ? response.details : null);
    return false;
  }

  return true;
};

/**
 * Atualiza os dados do componente.
 **/
HTMLQuery.prototype.updateData = function() {
  // Verificar se a tabela já existe.
  if (this.tableBase) {
    // Destroi o Bootstrap Table.
    $(this.tableBase).bootstrapTable("destroy");

    // Remover tabela.
    this.contentDiv.removeChild(this.tableBase);
    this.tableBase = null;
  }

  // Resetar variáveis.
  this.offset = 0;

  // Enviar requisição para o servidor.
  var object = this;
  this.sendRequest("params", null,
    function(response) {
      // Verificar se possui resposta.
      if (response && response.length > 0) {
        // Dar parse no JSON da resposta.
        response = JSON.parse(response);

        // Verificar por erros no servidor.
        if (object.checkServerResponse(response)) {
          // Criar tabela dos resultados.
          object.tableBase = document.createElement("table");
          object.tableBase.className = "table table-bordered table-hover"; // Bootstrap
          object.contentDiv.appendChild(object.tableBase);

          // Criar cabeçalho da tabela.
          var tableHeader = document.createElement("thead");
          object.tableBase.appendChild(tableHeader);

          var tableHeaderTr = document.createElement("tr");
          tableHeader.appendChild(tableHeaderTr);

          // Criar as colunas no cabeçalho.
          if (response.fields) {
            object.columns = response.fields;
            for (var i = 0; i < response.fields.length; i++) {
              // Criar coluna na tabela.
              var tableColumn = document.createElement("th");
              tableColumn.innerHTML = stringToHTMLString(response.fields[i]);
              tableColumn.setAttribute("data-formatter", "d.c_" + object.code + ".formatColumn")
              tableHeaderTr.appendChild(tableColumn);
            }
          } else {
            // Resetar array de colunas.
            object.columns = [];
          }

          // Inicializar o Bootstrap Table na tabela.
          $(object.tableBase).bootstrapTable({
            resizable: true, // Resizable Plugin
            stickyHeader: true, // Sticky Header Plugin
            locale: resources_locale,
            search: false,
            sortable: false,
            showColumns: false,
            showToggle: false,
            showRefresh: false,
            showFullscreen: false,
            virtualScroll: true,
            pageSize: object.limit,

            onPreBody: function(data) {
              for (var i = 0; i < data.length; i++) {
                data[i].context = object;
              }
            },

            onClickRow: function(row) {
              if (object.columns && object.columns.length > 0) {
                // Montar JSON com os valores.
                var json = { };
                for (var i = 0; i < object.columns.length; i++) {
                  json[object.columns[i]] = row[i];
                }

                // Abrir formulário filtrado.
                object.filterForm(row.form, json);
              }
            }
          });
        }
      }

      // Atualizar layout do componente.
      object.connectionError = false;
      object.updateLayout();
    }, function() {
      // Resetar array de colunas.
      object.columns = [];

      // Atualizar layout do componente.
      object.connectionError = true;
      object.updateLayout();
    });
};

/**
 * Atualiza o layout do componente.
 **/
HTMLQuery.prototype.updateLayout = function() {
  // Atualizar estados dos botões do componente.
  this.searchInput.disabled = this.connectionError;
  this.searchButton.disabled = this.connectionError;
  this.firstPageButton.disabled = !this.searched || this.connectionError || (this.offset == 0);
  this.previousPageButton.disabled = !this.searched || this.connectionError || (this.offset == 0);
  this.nextPageButton.disabled = !this.searched || this.connectionError || this.reachEnd;
  this.lastPageButton.disabled = true;
  this.refreshButton.className = this.connectionError ? this.refreshButtonClass : "d-none"; // Bootstrap
  this.refreshButton.disabled = !this.connectionError;

  // Fechar tooltips do Bootstrap se o botão foi desativado.
  if (this.searchButton.disabled) bootstrapCloseTooltip(this.searchButton);
  if (this.firstPageButton.disabled) bootstrapCloseTooltip(this.firstPageButton);
  if (this.previousPageButton.disabled) bootstrapCloseTooltip(this.previousPageButton);
  if (this.nextPageButton.disabled) bootstrapCloseTooltip(this.nextPageButton);
  if (this.lastPageButton.disabled) bootstrapCloseTooltip(this.lastPageButton);
  if (this.refreshButton.disabled) bootstrapCloseTooltip(this.refreshButton);
};

/**
 * Atualiza o registro de pesquisas.
 **/
HTMLQuery.prototype.searchAction = function() {
  var object = this;

  // Fechar tooltip do botão.
  bootstrapCloseTooltip(this.searchButton);

  // Resetar estado de procurado.
  this.searched = false;

  // Verificar se a busca foi alterada.
  if (this.lastSearch != this.searchInput.value) {
    // Salvar a busca.
    this.lastSearch = this.searchInput.value;

    // Redefinir offset.
    this.offset = 0;
  }

  // Enviar requisição para o servidor.
  this.sendRequest("", {
    query: this.searchInput.value,
    order: "asc",
    limit: this.limit,
    offset: this.offset
  }, function(response) {
    var hasResults = false;

    // Verificar se possui resposta.
    if (response && response.length > 0) {
      try {
        // Dar parse no JSON da resposta.
        response = JSON.parse(response);

        // Verificar por erros no servidor e se a consulta possui resultados.
        if (object.checkServerResponse(response) && response.data && response.hasResults) {
          hasResults = true;
          object.searched = true;
          object.reachEnd = (response.data.length < object.limit);
          $(object.tableBase).bootstrapTable("load", response.data);
        }
      } catch (e) { }
    }

    if (!hasResults) {
      // Se a consulta não possuir resultados, devemos limpar a tabela.
      $(object.tableBase).bootstrapTable("removeAll");

      // Redefinir variáveis.
      object.reachEnd = true;
      object.offset = 0;
    }

    // Atualizar layout do componente.
    object.updateLayout();
  }, function() {
    // Atualizar layout do componente.
    object.connectionError = true;
    object.updateLayout();
  });
};

/**
 * Abre o formulário da linha filtrado.
 * @param form Código do formulário a ser filtrado
 * @param filters Array com os filtros do formulário.
 **/
HTMLQuery.prototype.filterForm = function(form, filters) {
  var object = this;

  // Enviar requisição para o servidor.
  this.sendRequest("filter", {
    target: form,
    filters: JSON.stringify(filters)
  }, function(response) {
    // Verificar se possui resposta.
    if (response && response.length > 0) {
      try {
        // Verificar se é o JSON de status.
        if (response.indexOf('"success"') !== -1) {
          // Dar parse no JSON da resposta.
          response = JSON.parse(response);

          // Verificar por erros no servidor.
          object.checkServerResponse(response);
        }
      } catch (e) { }

      try {
        if (response.toLowerCase().indexOf("openform") != -1) {
          // Executar comando de abrir formulário filtrado retornado pelo servidor.
          eval(response);
        }
      } catch (e) { }
    }

    // Atualizar layout do componente.
    object.updateLayout();
  }, function() {
    // Atualizar layout do componente.
    object.updateLayout();
  });
};

/**
 * Avança para a próxima página de registros.
 **/
HTMLQuery.prototype.nextPageAction = function() {
  bootstrapCloseTooltip(this.nextPageButton);
  this.offset += this.limit;
  this.searchAction();
};

/**
 * Volta para a página anterior de registros.
 **/
HTMLQuery.prototype.previousPageAction = function() {
  bootstrapCloseTooltip(this.previousPageButton);
  this.offset -= this.limit;
  this.searchAction();
};

/**
 * Volta para a primeira página de registros.
 **/
HTMLQuery.prototype.firstPageAction = function() {
  bootstrapCloseTooltip(this.firstPageButton);
  this.offset = 0;
  this.searchAction();
};

/**
 * Atualiza os dados do componente.
 **/
HTMLQuery.prototype.refreshAction = function() {
  bootstrapCloseTooltip(this.refreshButton);
  if (!this.connectionError) return false;
  this.updateData();
};

/**
 * Função responsável por realizar as requisições para o servidor.
 * @param type Tipo da requisição:
 *   - Vazio para pesquisar por registros.
 *   - "params" para obter os nomes dos formulários e das colunas.
 *   - "filter" para abrir um formulário filtrado.
 * @param params Parâmetros adicionais do pedido.
 * @param cbSuccess Callback de sucesso.
 * @param cbError Callback de erro.
 */
HTMLQuery.prototype.sendRequest = function(type, params, cbSuccess, cbError) {
  var object = this;

  // Exibi preloader.
  this.showPreloader();

  // Criar XHR para enviar a requisição.
  var xhr = new XMLHttpRequest();

  // Definir tipo e URL da conexão.
  xhr.open("POST", "componentData.do?action=componentData&sys=" + URLEncode(this.sys, 'GET') +
    "&formID=" + URLEncode(this.formID, 'GET') +
    "&comID=" + URLEncode(this.code, 'GET') +
    "&type=" + type, true);

  // Definir Content-Type do pedido.
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  // Associar evento de sucesso.
  xhr.onload = function(e) {
    // Esconder preloader.
    object.hidePreloader();

    if (xhr.readyState === 4 || xhr.status === 200) {
      // Chamar callback de sucesso.
      if (cbSuccess) cbSuccess(xhr.responseText);
    }
  };

  // Associar evento de erro.
  xhr.onerror = function(e) {
    // Esconder preloader.
    object.hidePreloader();

    // Chamar callback de erro.
    if (cbError) cbError(e);

    // Exibir mensagem de falha de conexão.
    interactionError(safeGetLocaleMessage("ERROR.CONNECTION_FAIL"));
  };

  var data = null;

  // Verificar se possui parâmetros adicionais.
  if (params) {
    data = "";
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
      data += keys[i] + "=" + URLEncode(params[keys[i]]);
      if (i < keys.length) data += "&";
    }
  }

  // Mandar requisição para o servidor.
  xhr.send(data);
};
