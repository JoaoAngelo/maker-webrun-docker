var EDIT = 0;
var INSERT = 1;
var UNKNOW = -1;
var timeouts;
var lastTap = 0;
var buttonId = 0;
var imageId = 0;
var gridFunctions = {};
var gridChecks = {};
var gridCheckProperties = {};
let firstCheckOnly = true;
let _STARTSCRITERIA = true;

var preset = {
  "sum": false,
  "avg": false,
  "max": false,
  "min": false,
  "multiplier": false,
  "count": false,
  "title": false,
  "first": false,
  "concat": false
};

var presetArray = ["sum", "avg", "max", "min", "multiplier", "count"];

const _jsonOperator = {
  equals: 1,
  iContains: 2,
  iEndsWith: 4,
  iStartsWith: 3,
  greaterThan: 6,
  lessThan: 7,
  greaterOrEqual: 20,
  lessOrEqual: 21,
  notEqual: 25,
  iNotContains: 22,
  iNotStartsWith: 23,
  iNotEndsWith: 24,
  notEqual: 26,
};

const _jsonConverter = {
  double: "@double",
  integer: "@long",
  boolean: "@boolean",
  date: "@date",
  datetime: "@timestamp",
  text:"",
};

let _setOperator = false;

const _textOperators = ["and", "equals", "greaterOrEqual", "greaterThan", "iContains", "iEndsWith", "iNotContains", "iNotEndsWith", "iNotStartsWith", "iStartsWith", "lessOrEqual", "lessThan", "not", "or"];
const _date_and_numberOperators = ["and", "equals", "greaterOrEqual", "greaterThan", "lessOrEqual", "lessThan", "notEqual", "not", "or"];
const _date_client = ["iContains", "iNotContains", "and", "equals", "notEqual", "not", "or"];

var gridFieldsConfig = {};
var iconPathExport = getAbsolutContextPath() + isomorphicDir + "skins/resources/images/";

function HTMLGrid(sys, formID, code, posX, posY, width, height, formCode) {
  this.create(sys, formID, code, posX, posY, width, height, '', '');
  this.type = 1;
  this.callForm = true;
  this.formCode = formCode;
  this.able = true;
  this.gridini = 0;
  this.currentWidth = this.width;
  this.formWidth = this.width;
  this.formHeight = this.height;
  this.tabable = true;
  this.hasdata = false;
  this.editRow = -1;
  this.currentRow = -1;
  this.editComponents = [];
  this.report = false;
  this.currentSelection = -1;
  this.toolbarHeight = 40; //altura da barra de navegaÃ§Ã£o / top do corpo
  this.headerHeight = 38; //altura padrao do cabecalho
  this.cellHeight = 33; //altura padrao da linha
  this.allowsOrder = false;
  this.autoRowSize = true;
  this.isFiltered = false;
  this.isAdvancedFilter = false;
  this.buttonHeight = 12;
  this.buttonWidth = 14;
  this.hasFocus = false;
  this.ActUpGrid = true;
  this.noRefresh = false;
  this.groups = [];
  this.round = 2;
  this.lockEditable = false;
}

HTMLGrid.inherits(HTMLElementBase);
HTMLGrid.prototype.name = 'HTMLGrid';
HTMLGrid.prototype.instance = HTMLGrid;
HTMLGrid.prototype.zindex = 99999;

HTMLGrid.prototype.designComponent = function() {
  isc.Log.WARN = 00100;//Disable WARN
  this.cellHeight = this.rowHeight ? this.rowHeight : this.cellHeight;

  this.div.className += " grid";
  this.div.style.zIndex = this.zindex;
  this.divClass = this.div.className;

  this.nav = new HTMLNavigationGrid(this.sys, this.formCode, 0, 0);
  this.nav.tabindex = this.tabindex;
  this.nav.design(this.context);
  this.nav.parent = this;

  this.grid_height = this.height - (this.toolbarHeight + 1);

  if (this.editable) {
    this.nav.setMainImages(this.imgInclude, this.imgEdit, this.imgDelete, this.imgRefresh, -1);
    this.nav.setEditImages(this.imgPost, this.imgCancel);
    if (this.nav.btEditSave) $(this.nav.btEditSave).hide();
    if (this.nav.btEditCancel) $(this.nav.btEditCancel).hide();
  } else {
    this.nav.setMainImages(-1, -1, -1, -1, -1);
  }

  if (this.readonly) {
    this.nav.setReadOnly(true);
  }

  this.context.style.width = (pt(this.context.style.width) + 2 + (IE ? 2 : 0)) + 'px';
  this.context.style.height = (pt(this.context.style.height) + 2 + (IE ? 2 : 0)) + 'px';

  // Cria barra de navegaÃ§Ã£o do componente.
  this.bar = document.createElement('div');
  this.bar.id = this.id + "bar";
  this.bar.style.height = this.toolbarHeight + "px";
  this.bar.style.zIndex = "200090";
  this.bar.grid = this;
  this.bar.className = "d-flex flex-row w-100 pb-2"; // Bootstrap
  this.bar.visible = true;

  // Adiciona elementos Ã  navegaÃ§Ã£o.
  for (var i = 0; i < this.nav.buttons.length; i++) {
    this.bar.appendChild(this.nav.buttons[i].button);
  }

  // Cria o separador para navegaÃ§Ã£o
  if (this.editable && (this.hasPagination || this.enableSimpleFilter)) {
    this.nav.createElement({
      parent: this.bar,
      element: 'span',
      class: "my-0 mr-2 d-inline-flex align-items-center justify-content-center border-left",
      style: "width: 1px;",
      id: this.id + "_separator_nav"
    });
  }

  // Cria barra de paginaÃ§Ã£o na navegaÃ§Ã£o da grade.
  this.paging = new HTMLPaging(this.sys, this.formID, this.code, this.width - 163, 4, 40, 16);
  this.paging.onnavigate = this.getAction(this.pagingNavigateAction);
  this.paging.design(this);

  if (this.lastNavigation && this.lastNavigation.length >= 4) {
    this.paging.enableButtons(
      this.lastNavigation[0],
      this.lastNavigation[1],
      this.lastNavigation[2],
      this.lastNavigation[3]);
  }

  if (this.enableSimpleFilter) {
    if (this.hasPagination) {
      this.nav.createElement({
        parent:this.bar,
        element: "span",
        class: this.hasPagination
                ? "my-0 mr-2 ml-2 d-inline-flex align-items-center justify-content-center border-left"
                : "my-0 mr-2 d-inline-flex align-items-center justify-content-center border-left",
        style: "width: 1px;",
        id: this.id + "_separator_paging"
      });
    }

    let p = this.nav.createElement({
      parent: this.bar,
      element: "i",
      class: "px-2 mr-2 d-flex align-items-center justify-content-center rounded-top btn btn-outline-secondary",
      hint: getLocaleMessage("INFO.GRID_ADVANCED_FILTER"),
      id: this.id + "_icon_filter",
      style: "cursor: pointer;"
    });

    let g_r = this.id;
    p.addEventListener('click', function(){gridAdvancedFilter(g_r)}, false);
    this.nav.createElement({
      parent: p,
      element: "i",
      class: "fas fa-filter",
      style: "font-size: 1rem;",
      id: this.id + "_icon_c_filter",
    });
  }


  // DECORATION
  var fontStyle = "";
  if (this.font) {
    fontStyle += ("font-family: " + this.font + "!important;");
  }
  if (this.size) {
    fontStyle += ("font-size: " + pt(this.size) + "pt!important;");
    if (this.autoRowSize) {
      var fontSize = Math.round((4 * pt(this.size)) / 3);
      this.rowHeight = fontSize + 9.3;
      if (this.headerWidth == null || this.headerWidth == undefined)
        this.headerWidth = this.rowHeight + (this.rowHeight * 0.3);
    }
  }
  if (this.weight) {
    fontStyle += ("font-weight: bold!important;");
  }
  if (this.italic) {
    fontStyle += ("font-style: italic!important;");
  }

  var textDecoration = "text-decoration:";
  if (this.underline || this.strikeout) {
    if (this.underline) {
      textDecoration += " underline";
    }
    if (this.strikeout) {
      textDecoration += " line-through";
    }
    textDecoration += "!important;";

    fontStyle += textDecoration;
  } else {
    textDecoration += " none!important;";
    fontStyle += textDecoration;
  }

  if (this.color) {
    fontStyle += ("color: " + this.color + "!important;");
  }

  if (this.decorationChanged) {
    this.timeout(
      function () {
        for (var i = 0; i < this.columns.length; i++) {
          this.iscCanvas.setFieldHeaderBaseStyle(this.columns[i].name, '' + this.iscCanvas.headerBaseStyle + ' ' + this.id + 'headerBaseStyle');
        }
        this.iscCanvas.setHeaderHeight(this.headerHeight);
      }, 0);
  }

  if (this.bgColor) {
    fontStyle += ("background-color: " + this.bgColor + "!important;");
  }
  this.fontStyle = fontStyle;

  this.contextMenu = null;

  this.showGridSummary = null;
  this.showGroupSummary = null;
  this.showGroupSummaryInHeader = null;
  this.showCollapsedGroupSummary = null;
  this.multiGroup = null;
  this.animateFolderSpeed = null;

  var summary = this.summaryProperties.summary;
  this.components_to_Grid = ["header", "body"];
  if (this.enableSimpleFilter)
    this.components_to_Grid.splice(0, 0, "filterEditor");

  if (summary) {
    var properties = summary.properties;
    if (properties) {
      this.components_to_Grid.push("summaryRow");
      this.groupBy = properties.groupBy;
      this.showGridSummary = properties.showGridSummary;
      this.showGroupSummary = properties.showGroupSummary;
      this.showGroupSummaryInHeader = properties.showGroupSummaryInHeader;
      this.showCollapsedGroupSummary = properties.showCollapsedGroupSummary;
      this.multiGroup = properties.multiGroup;
      this.animateFolderSpeed = properties.animateFolderSpeed;
      this.groupByMaxRecords = properties.groupByMaxRecords;
    }
  }

  if (this.enableGridExport || this.enableSimpleFilter) {
    let dataExport = [];
    let dataFilter = [];
    let data = null;
    if(this.enableGridExport){
      dataExport = [
          {
            icon: iconPathExport + "excel.png",
            title: "EXCEL",
            click: "gridExportData('" + this.id + "', 'XLS')"
          },
          {
            icon: iconPathExport + "html.png",
            title: "HTML",
            click: "gridExportData('" + this.id + "', 'HTML')"
          },
          {
            icon: iconPathExport + "json.png",
            title: "JSON",
            click: "gridExportData('" + this.id + "', 'JSON')"
          },
          {
            icon: iconPathExport + "list.png",
            title: "LISTAGEM",
            click: "gridExportData('" + this.id + "', 'LST')"
          },
          {
            icon: iconPathExport + "pdf.png",
            title: "PDF",
            click: "gridExportData('" + this.id + "', 'PDF')"
          },
          {
            icon: iconPathExport + "txt.png",
            title: "TEXTO",
            click: "gridExportData('" + this.id + "', 'TXT')"
          },
          {
            icon: iconPathExport + "xml.png",
            title: "XML",
            click: "gridExportData('" + this.id + "', 'XML')"
          },
        ]
    }
    if(this.enableSimpleFilter){
      dataFilter = [
        {
          icon: iconPathExport + "editorfilter.png",
          title: getLocaleMessage("INFO.GRID_ADVANCED_FILTER"),
          click: "gridAdvancedFilter('" + this.id + "')"
        }
      ]
      if (!this.enableGridExport)
        dataFilter.shift();
    }

    data = [{
      icon: iconPathExport + "export.png",
      title: getLocaleMessage("LABEL.GRID_EXPORT_DATA"),
      submenu : dataExport
    }].concat(dataFilter);

    this.contextMenu = isc.Menu.create({
      ID: this.id + "mainMenu",
      width: 150,
      data: data,
    });
  }

  isc.NumberUtil.decimalSymbol = DECIMAL_POINT;

  let dataSource = isc.DataSource.create({
    ID: this.id + "dataSource",
    fields: this.setColumnSize(this.columns),
    clientOnly: true,
    cacheData: this.data,
    allowAdvancedCriteria: true,
  });


  dataSource.setTypeOperators("text", _textOperators);
  dataSource.setTypeOperators("integer", _date_and_numberOperators);
  dataSource.setTypeOperators("double", _date_and_numberOperators);

  /**
   * @author Janpier
   * Essa funcionalidade sobrescreve o valor padrÃ£o da grade, assim a function Ã© executada retornando o quantidade de regristros geral e de cada grupo.
   */
  isc.SimpleType.setDefaultSummaryFunction("integer", function () {
    return arguments[0].length + " " + getLocaleMessage("INFO.GRID_COUNT_RECORDS");
  });

  this.iscCanvas = isc.ListGrid.create({
    showAllColumns: true,
    ID: this.id,
    height: this.grid_height,
    width: this.width,
    top: this.toolbarHeight,
    autoFetchData: true,
    dataSource: this.id + "dataSource",
    dataFetchMode: "local",
    alternateRecordeStyles: true,
    bodyBackgroundColor: null,
    canSort: false,
    bodyBackgroundColor: null,
    selectionType: "single",
    showFilterEditor: this.enableSimpleFilter === undefined ? false : this.enableSimpleFilter,
    filterEditorHeight: 33,
    filterData: function() {
      let grid = $c(this.ID);
      if((!grid.editing && !grid.inserting)){
        let filterButton = document.getElementById(grid.id + "_icon_filter");
        this.deselectAllRecords();
        grid.currentRow = -1;
        grid.currentSelection = grid.currentRow;
        if (grid && !grid.filterMode || grid.filterMode === 0) {
          // Verifica se existe filto preenchido, tanto avanÃ§ado quanto normal.
          let containsFilter = false;
          if (arguments && arguments[0] !== null && !arguments[0]._constructor) containsFilter = true;
          else if (arguments && arguments[0] !== null && arguments[0]._constructor && arguments[0].criteria.length > 0) containsFilter = true;

          if (containsFilter) {
            grid.isFiltered = containsFilter;
            filterButton.setAttribute("data-original-title", getLocaleMessage("INFO.GRID_FILTER_ACTIVE"));
            if (filterButton.classList.contains("btn-outline-secondary"))
              filterButton.classList.remove("btn-outline-secondary");
            if (!filterButton.classList.contains("btn-danger"))
              filterButton.classList.add("btn-danger");
          } else {
            grid.isFiltered = containsFilter;
            filterButton.setAttribute("data-original-title", getLocaleMessage("INFO.GRID_ADVANCED_FILTER"));
            if (filterButton.classList.contains("btn-danger"))
              filterButton.classList.remove("btn-danger");
            if (!filterButton.classList.contains("btn-outline-secondary"))
              filterButton.classList.add("btn-outline-secondary");
          }
          return this.Super("filterData", arguments);
        } else {
          let criteria = null;
          if (arguments && arguments[0]){
            if (arguments[0].criteria)
              if (Object.keys(arguments[0].criteria).length > 0) criteria = arguments[0];
              else criteria = null;
            else if (Object.keys(arguments[0]).length > 0) criteria = arguments[0];
          }

          if (criteria && !grid.validateTypesAndValues(criteria)) return false;
          if (!criteria) {
            if (grid.isFiltered) {
              grid.isFiltered = false;
              filterButton.setAttribute("data-original-title", getLocaleMessage("INFO.GRID_ADVANCED_FILTER"));
              if (filterButton.classList.contains("btn-danger"))
                filterButton.classList.remove("btn-danger");
              if (!filterButton.classList.contains("btn-outline-secondary"))
                filterButton.classList.add("btn-outline-secondary");
              grid.refreshURL = "";
              grid.refresh();
            }
          } else {
            let jCriteria = {
              mainCriteria: criteria.operator ? criteria.operator.toUpperCase() : "AND"
            }
            criteria = grid.parseCriteria(criteria);
            jCriteria.criterias = criteria;
            grid.filter(jCriteria, true);
            grid.isFiltered = true;
            filterButton.setAttribute("data-original-title", getLocaleMessage("INFO.GRID_FILTER_ACTIVE"));
            if (filterButton.classList.contains("btn-outline-secondary"))
              filterButton.classList.remove("btn-outline-secondary");
            if (!filterButton.classList.contains("btn-danger"))
              filterButton.classList.add("btn-danger");
            _STARTSCRITERIA = true;
          }
        }
      }

      if (projectMode === 'N' && grid.isAdvancedFilter) {
        grid.saveAdvancedFilter(arguments[0]);
        grid.isAdvancedFilter = false;
      }
    },
    getFilterOperatorMenuItems: function (field) {
     if(field.realType){
      $c(this.ID).filterMode == 1
      ? this.getDataSource().setTypeOperators("text", _date_and_numberOperators)
      : this.getDataSource().setTypeOperators("text", _date_client);
      _setOperator = true;
     }
     if(!field.realType && _setOperator)
       this.getDataSource().setTypeOperators("text", _textOperators);
      return this.Super("getFilterOperatorMenuItems", arguments);
    },
    wrapCells: false,
    fixedRecordHeights: true,
    cellHeight: this.cellHeight,
    canFreezeFields: true,
    groupByMaxRecords: this.groupByMaxRecords ? this.groupByMaxRecords : 5000,
    showRowNumbers: this.gridColumnNumberWidth === 0 ? false : true,
    showSortArrow: "corner",
    baseStyle: "grid",
    contextMenu: this.contextMenu,
    canGroupBy: this.groupBy === undefined ? false : this.groupBy,
    groupStartOpen: "none",
    groupByField: this.startGroup,
    canMultiGroup: this.multiGroup === undefined ? false : this.multiGroup,
    showGroupSummary: this.showGroupSummary === undefined ? false : this.showGroupSummary,
    showGroupSummaryInHeader: this.showGroupSummaryInHeader === undefined ? false : this.showGroupSummaryInHeader,
    showCollapsedGroupSummary: this.showCollapsedGroupSummary === undefined ? false : this.showCollapsedGroupSummary,
    animateFolderSpeed: this.animateFolderSpeed === undefined ? 3000 : this.animateFolderSpeed,
    //SummaryGrid
    showGridSummary: this.showGridSummary === undefined || this.showGridSummary === null ? false : this.showGridSummary,
    canReorderFields: projectMode === "D" ? false : true,
    gridComponents: this.components_to_Grid,
    showEmptyMessage: true,
    emptyMessage: this.placeholder ? this.placeholder : getLocaleMessage("INFO.GRID_EMPTY_DATA"),
    editorExit: function (e, record, newValue, rowNum, colNum) {
      if (e == "escape") $c(this.ID).cancel();
    },
    editOnF2Keypress: false,
    canAutoFitFields: false,
    canEdit: true,
    editEvent: null,
    recordClick: function () {
      var ref = $c(this.ID);
      ref.onRowClick();
    },
    rowDoubleClick: function (record, row, col) {
      if (!record.isFolder) {
        var ref = $c(this.ID);
        ref.executeRowDoubleClick();
        if (ref.editable) {
          var column = this.showRowNumbers
                          ? ref.showGroupSummaryInHeader
                              ? col - 2
                              : col - 1
                          : col;
          if (column >= 0 && ref.columns[column].type === "boolean") return false;
        }
        ref.colDoubleClicked = column;
        timeout(ref.checkDoubleClick, 300, [ref]);
      }
    },
    cellChanged: function (record, newValue, oldValue, row, col, grid) {
      var ref = $c(this.ID);
      ref.selectRow(row);
      if (typeof newValue === "boolean" && this.fields[col].type === "boolean") {
        if (ref.paging.gt !== -1)
          row = row + ref.gridini;
        if (ref.inserting)
          ref.checkBoxChecked = {
            "row": row,
            "col": col,
          };
        else
          ref.executeCheckCmd(ref, row, col);
      }
    },
    canEditCell: function (rowNum, colNum) {
      var ref = $c(this.ID);
      if (!ref.editable) return false;
      if (colNum === undefined || colNum === null) return true;
      if (this.showRowNumbers && colNum === 0 || ref.inserting) return this.Super("canEditCell", arguments);
      if (!ref.startEditing) {
        var col = ref.getComponentColumnIndexByName(this.fields[colNum].name);
        if (col >= 0 && ref.columns[col].type === "boolean") {
          if (!ref.enabled || ref.readonly)
            return false;
          else if (Object.keys(gridCheckProperties).length > 0) {
            var properties = gridCheckProperties[rowNum + "_" + this.fields[colNum].cod];
            if (properties) {
              if (Object.keys(properties).length > 0) {
                if (!(properties.enabled) || properties.readonly)
                  return false;
                else
                  return true;
              }
            }
          }
        }
      }
      return this.Super("canEditCell", arguments);
    },
    getCellCSSText: function (record, row, column) {
      var styleReturn = "";
      styleReturn = $c(this.ID).setRowColor(record, row, column);
      if (!styleReturn) styleReturn = $c(this.ID).fontStyle;
      else styleReturn += $c(this.ID).fontStyle;

      return styleReturn;
    },
    doubleClick: function () {
      var ref = $c(this.ID);
      if (ref.data.length === 0) ref.checkDoubleClick(ref);
    },
    headerClick: function (fieldNum) {
      var ref = $c(this.ID);
      if (ref.allowsOrder) {
        if (this.inserting || this.editing) return false;

        if (this.showRowNumbers && fieldNum === 0) {
          return false;
        } else {
          var desc = "";
          if (ref.ordered)
            desc = ref.ordered.desc;
          desc = desc === "DESC" ? "ASC" : "DESC";
          ref.order(fieldNum, desc);
        }
      } else { return false; }
    },
    getHeaderContextMenuItems: function (fieldNum) {
      var iscCanvas = this;
      var ref = $c(this.ID);
      var menu = [];
      var submenuCols = [];
      var field = iscCanvas.fields[fieldNum];
      if (field && ref && !ref.editing && !ref.inserting) {
        var minCols = iscCanvas.showRowNumbers ? 2 : 1;
        for (var i = 0; i < ref.columns.length; i++) {
          if (!iscCanvas.isRowNumberField(ref.columns[i])) {
            submenuJson = {
              title: ref.columns[i].title,
              checked: ref.isFieldVisible(ref.columns[i].name),
              click: function (target, item, menu) {
                var field;
                if(this.checked){
                  field = ref.iscCanvas.fields[ref.iscCanvas.fields.findIndex(function(age){return age.name == item.name})];
                  if(!(field.type == 'image')) ref.iscCanvas.fields[ref.iscCanvas.fields.findIndex(function(age){return age.name == item.name})].canGroupBy = !this.checked;
                  ref.setShowColumn(this.title, !this.checked);
                } else{
                    ref.setShowColumn(this.title, !this.checked);
                    field = ref.iscCanvas.fields[ref.iscCanvas.fields.findIndex(function(age){return age.name == item.name})];
                    if(!(field.type == 'image')) ref.iscCanvas.fields[ref.iscCanvas.fields.findIndex(function(age){return age.name == item.name})].canGroupBy = !this.checked;
                  }
              },
              autoDismiss: false,
              name: ref.columns[i].name,
              checkIf: function (target, menu, item) {
                return iscCanvas.fieldIsVisible(this.name);
              },
              visible: ref.columns[i].visible,
              enableIf: function () {
                if (!this.visible)
                  return false;
                if (gridFieldsConfig[ref.id]['frozenFields'][this.name])
                  return false;
                if (iscCanvas.fieldIsVisible(this.name) && iscCanvas.fields.length == minCols)
                  return false;
                return true;
              },
            };
            submenuCols.push(submenuJson);
          }
        }
        if (ref.allowsOrder) {
          menu.push({
            title: getLocaleMessage("LABEL.SORT_ASCENDING"),
            icon: "[SKIN]/sort_ascending.png",
            click: function () {
              ref.order(fieldNum, '');
            }
          });
          menu.push({
            title: getLocaleMessage("LABEL.SORT_DESCENDING"),
            icon: "[SKIN]/sort_descending.png",
            click: function () {
              ref.order(fieldNum, 'DESC');
            }
          });
          menu.push({ isSeparator: true });
        }
        menu.push({
          title: getLocaleMessage("LABEL.COLUMNS"),
          icon: "[SKIN]/column_preferences.png",
          submenu: submenuCols,
        });

        if (ref.groupBy && !(ref.iscCanvas.fields[fieldNum].type == 'image')) {
          menu.push({ isSeparator: true });
          menu.push({
            title: getLocaleMessage("LABEL.GRID_GROUP_BY_COLUMN"),
            icon: "[SKIN]/groupby.png",
            click: function () {
              ref.group(field.title);
            }
          });
          menu.push({
            title: getLocaleMessage("LABEL.GRID_UNGROUP_COLUMN"),
            icon: "[SKIN]/ungroup.png",
            click: function () {
              ref.ungroup(field.title);
            }
          });
          menu.push({
            title: getLocaleMessage("LABEL.GRID_UNGROUP_ALL_COLUMNS"),
            icon: "[SKIN]/ungroup.png",
            click: function () {
              ref.ungroup("");
            }
          });
          if (this.canMultiGroup) {
            menu.push({
              title: getLocaleMessage("LABEL.GRID_OPEN_CONFIGURE_GROUP"),
              icon: "[SKIN]/groupby.png",
              click: function () {
                ref.openGroupConfig();
              }
            });
          }
          menu.push({ isSeparator: true });
        }

        if (ref.canFreezeColumns) {
          if (field.frozen) {
            menu.push({
              title: getLocaleMessage("LABEL.GRID_UNFREEZE_COLUMN"),
              icon: "[SKIN]/unfreeze.png",
              click: function () {
                $c(ref.id).unfreezeColumn(field.title);
              },
            });
          } else {
            menu.push({
              title: getLocaleMessage("LABEL.GRID_FREEZE_COLUMN"),
              icon: "[SKIN]/freezeLeft.png",
              click: function () {
                $c(ref.id).freezeColumn(field.title);
              },
              enableIf: function (target, menu, item) {
                return iscCanvas.fieldIsVisible(target.name ? target.name : target.dragTarget.name);
              }
            });
          }
          if (projectMode === 'N' && !ref.disableUserCustomize && loggedUserWithProfile) {
            menu.push({ isSeparator: true });
            menu.push({
              title: getLocaleMessage("LABEL.BACK_DEFAULT"),
              icon: "[SKIN]/clear_sort.png",
              click: function () {
                ref.defaultGrid();
              }
            });
          }
        }
      }
      return menu;
    },
    saveLocally: true,
    autoFitHeaderHeights: true,
    redrawOnResize: false,
    timeFormatter: "toShort24HourTime",
    resized: function () {
      var ref = $c(this.ID);
      var hscrollbar = (this.getBody()) ? this.getBody().hscrollbar : undefined;
      if (hscrollbar) {
        if (ref && hscrollbar.isVisible() === ref.hscrollbarVisible)
          ref.performFocus();
      }
    }
  });

  var object = this;
  this.iscCanvas.mouseOver = function () { this.setBorder("1px solid " + object.getPrimaryColor()); }
  this.iscCanvas.mouseOut = function () { $c(this.ID).performFocus(); }

  if (!gridFieldsConfig[this.id])
    gridFieldsConfig[this.id] = {
      "frozenFields": {},
      "hiddenFields": this.readingHiddenFields(),
      "removedFields": [],
      "fieldsSizes": null,
      "fieldOrder": this.getFieldsOrder()
    };
  else {
    this.loadConfigs();
  }

  this.iscCanvas.setBorder("0px");

  this.iscCanvas.setHeaderHeight(this.headerHeight);
  if (this.gridColumnNumberWidth > 0) {
    this.iscCanvas.fields[0].align = "center";
    this.iscCanvas.resizeField(0, this.gridColumnNumberWidth);
  }
  var cR = this.iscCanvas.getCanvasName();
  var pC = document.getElementById(cR);
  var body = document.getElementById(this.iscCanvas.getBody().getCanvasName());

  this.iscCanvas.getBody().scrolled = function () {
    var ref = $c(this.creator.ID);
    if (!ref.hasFocus && !ref.inserting && !ref.editing)
      this.creator.focus();
  };

  /**Sobrescreve o mÃ©todo de redraw para Internet Explorer*/
  this.iscCanvas.getBody().$148o = function () { };

  this.hscrollbarVisible = body.hscrollbar && body.hscrollbar.isVisible() ? true : false;
  this.vscrollbarVisible = body.vscrollbar && body.vscrollbar.isVisible() ? true : false;
  this.gridDiv = body;
  this.performFocus();

  //anexa navegaÃ§Ã£o Ã  div principal do componente
  this.div.appendChild(this.bar);
  this.div.appendChild(pC);
  /**Cancela a seleÃ§Ã£o de linha com o clique direito do mouse. */
  this.iscCanvas.body.canSelectOnRightMouse = false;

  //executa mÃ©todos da navegaÃ§Ã£o
  this.nav.checkButtons();
  this.nav.toggleButtons();
  this.checkShowBar();

  if (this.enableSimpleFilter) this.iscCanvas.filterEditor.actionButton.setVisibility(false);
    //this.adjustFilterEditorButton();
};

/**
 * Methods Getters
 */
HTMLGrid.prototype.getPrimaryColor = function() {
  return getComputedStyle(document.body).getPropertyValue('--primary'); // Bootstrap
};

HTMLGrid.prototype.getRecord = function (row) {
  var ref = this.iscCanvas;
  return this.isGrouped()
    ? ref.groupTree.getAllItems()[row]
    : ref.getOriginalData().localData
      ? ref.getOriginalData().localData[row]
      : ref.getDataSource().cacheData[row];
};

HTMLGrid.prototype.getValueData = function (data) {
  if (data) {
    var lValues = [];
    let lKeys = this.iscCanvas.getFields();
    let i = this.iscCanvas.showRowNumbers ? 1 : 0;
    var size = lKeys.length;
    for (i; i < size; i++)
      lValues.push(data[lKeys[i].name]);
    return lValues;
  }
  return data;
};

HTMLGrid.prototype.getCellData = function (i, j) {
  j = this.columns[j].name;
  if (i == -1)
    i = this.getSelectedRow();
  try {
    return this.data[i][j];
  } catch (e) { }
};

HTMLGrid.prototype.getSelectedRow = function (keyPress) {
  var rc, idx = -1;
  rc = this.iscCanvas.getSelectedRecord();
  /*Quando estÃ¡ agrupado a busca irÃ¡ ser realizado  ou no original data ou nos items do agrupamento.*/
  if (this.isGrouped() && !this.editing && !this.inserting) {
    if (!keyPress) {
      idx = rc ? this.getRecordRealIndex(rc) : -1;
      return idx;
    }
  }

  idx = this.iscCanvas.getRecordIndex(rc);
  if (idx == -1) {
    rc = this.iscCanvas.getSelection().length > 1
      ? this.iscCanvas.getSelection()[1]
      : this.iscCanvas.getSelection()[0];
    if (rc)
      idx = this.iscCanvas.getRecordIndex(rc);
  }
  if (idx === -1 && this.currentRow !== -1) {
    return this.currentRow;
  }
  return idx;
};


HTMLGrid.prototype.getRowDBCursor = function (record) {
  const canvas = this.iscCanvas;
  let rec = record ? record : canvas.getSelectedRecord();
  let row = -1;
  if (rec) {
    row = rec.row;
  }
  return row;
};

HTMLGrid.prototype.getSelectedRows = function (id) {
  var rs = [];
  var rows = this.getSelectedRecords(id);
  if (rows.length > 0) {
    for (var i = 0; i < rows.length; i++) {
      var rc = this.iscCanvas.getRecordIndex(rows[i]);
      rs.push(rc);
    }
  }
  return rs;
};

HTMLGrid.prototype.getSelectedRecord = function (id) {
  return this.iscCanvas.getSelectedRecord();
};

HTMLGrid.prototype.getSelectedRecords = function (id) {
  return this.iscCanvas.getSelectedRecords();
};

HTMLGrid.prototype.getRowCount = function (ignoreMode) {
  if(!ignoreMode && this.isFiltered)
    return this.iscCanvas.getOriginalData().localData.length;
  return this.data.length;
};

HTMLGrid.prototype.getRealNameColumn = function (c) {
  var idx = this.findColumn(c);
  if (!(idx === -1)) {
    return this.iscCanvas.getAllFields()[idx].name;
  } else {
    return idx;
  }
};

HTMLGrid.prototype.getColumnTitle = function (realName) {
  for (var i = 0; i < this.iscCanvas.fields.length; i++) {
    if (this.iscCanvas.fields[i].name === realName)
      return this.iscCanvas.fields[i].title;
  }
  return null;
};

HTMLGrid.prototype.getColumnCode = function (column) {
  var cols = this.iscCanvas.getAllFields();
  return cols[this.findColumn(column)].cod;
};

HTMLGrid.prototype.getRowInGroup = function () {
  return this.iscCanvas.getRecordIndex(this.iscCanvas.getSelectedRecord());
};

HTMLGrid.prototype.getFirstRowIgnoreFolder = function () {
  var ref = this.iscCanvas;
  var allRows = ref.groupTree.getAllItems();
  var i = 0, a = -1;
  for (i; i < allRows.length; i++) {
    if (allRows[i].isFolder || allRows[i].isGroupSummary) {
      continue;
    } else {
      a = i;
      break;
    }
  }
  return a;
};

HTMLGrid.prototype.getComponentColumnIndexByName = function (fieldName) {
  for (var i = 0; i < this.columns.length; i++) {
    if (this.columns[i].name === fieldName)
      return i;
  }
  return -1;
}

HTMLGrid.prototype.getRowNo = function (data) {
  this.startedEdition = true;
  var gridrn = this.getRowDBCursor();
  if (gridrn > this.getRowCount(data) - 1)
    gridrn = -2;

  var gt = 1 + parseInt(gridrn) + parseInt(this.gridini);

  return gt;
};

/**
 * MÃ©todo responsÃ¡vel por obter o real index da linha selecionada, ignorando o estado da grade.
 * @author Janpier
 * @returns linha real;
 */
HTMLGrid.prototype.getRowIgnoreState = function () {
  let row = -1;
  if (this.isGrouped()) {
    if (this.inserting)
      row = this.data.length - 1;
    else {
      row = this.getRowDBCursor(this.getRecord(this.editRow));
    }
  } else {
    row = this.getRowDBCursor(this.getRecord(this.editRow)) === -1
            ? this.data.length - 1
            : this.getRowDBCursor(this.getRecord(this.editRow))
  }
  return row;
}

HTMLGrid.prototype.getPermissionDescription = function () {
  if (!isNullable(this.permissionDescription)) {
    return this.permissionDescription;
  }
  return this.callMethod(HTMLElementBase, "getPermissionDescription");
};

/*
* Methods Setters.
*/

HTMLGrid.prototype.setColumn = function (c, nN) {
  var idx = this.findColumn(c, true);
  var jnN = { title: nN };
  this.iscCanvas.setFieldProperties(idx, jnN);
};

HTMLGrid.prototype.setColumns = function (cols, width, components) {
  var summary = this.summaryProperties.summary;
  var summaryFields = summary && summary.fields ? summary.fields : {};
  var field = null;
  var t = this;

  for (var i = 0; i < components.length; i++) {
    cols[i].cod = components[i];

    field = summaryFields[this.findInSummary(cols[i].name, summaryFields)];

    if (field && field.getGridSummary && (preset[field.getGridSummary] == undefined || preset[field.getGridSummary])) {
      field.getGridSummaryFlow = field.getGridSummary;
      field.getGridSummary = function (records, summaryField) {
        return ebfFlowExecute(summaryField.getGridSummaryFlow, [clearRecords(records), summaryField]);
      }
    }

    if (field && field.summaryFunction && (preset[field.summaryFunction] == undefined || preset[field.summaryFunction])) {
      field.summaryFunctionFlow = field.summaryFunction;
      field.summaryFunction = function (records, summaryField) {
        return ebfFlowExecute(summaryField.summaryFunctionFlow, [clearRecords(records), summaryField]);
      }
    }

    if (field && field.summaryFunction && presetArray.includes(field.summaryFunction) && cols[i].type == "double") {
      field.summaryFunctionOperation = field.summaryFunction;
      field.summaryFunction = function (records, summaryField) {
        return t.groupOperation(clearRecords(records), summaryField, summaryField.summaryFunctionOperation);
      }
    }

    cols[i] = Object.assign(cols[i], field);

    if(!(cols[i].type == 'image') && cols[i].showIf == 'false') cols[i].canGroupBy = false;

    if(cols[i].type == 'image') cols[i].canGroupBy = false;

    if (cols[i].type == 'datetime' || cols[i].type == 'date') {
      cols[i].realType = cols[i].type;
      cols[i].type = 'text';

      this.enableSimpleFilter && this.filterMode == 1
      ? cols[i].defaultOperator = 'equals'
      : null;
    }
  }

  if (!objectIsEmpty(summaryFields)) {
    var startGroup = [];
    var startGroupField = summaryFields.filter(function (elem) {
      return elem['startGroup'] === true;
    });
    if (startGroupField) {
      startGroupField.map(function (group) {
        startGroup.push(group.name);
      });
    }

    this.startGroup = startGroup;
  }
  this.columns = cols;
  this.columnsWidth = width;
  this.components = components;
};

/**
 * MÃ©todo responsÃ¡vel pro ajustar as colunas quando o formulÃ¡rio Ã© responsivo, esse mÃ©todo sÃ³ Ã© chamado na criaÃ§Ã£o do componente.
 * @author Janpier
 * @param cols JSON das colunas.
 * @returns JSON das colunas atualizado se responsivo.
 */
HTMLGrid.prototype.setColumnSize = function (cols) {
  if (typeof document.n === "object" && d.n.responsive) {
    if(this.gridColumnNumberWidth && this.gridColumnNumberWidth  > 0){
      let diffSize = this.gridColumnNumberWidth - 28;
      let pscreen = this.width - diffSize;
      let size = cols.length;
      for (var i=0; i < size; i++) {
        cols[i].width = Math.round((((pscreen * parseInt(cols[i].width, 10)) / this.width)) + 1) + "";
      }
    }
  }
  return cols;
};

HTMLGrid.prototype.setData = function (data) {
  if (this.editing)
    this.completeCancelEdit();
  if (this.inserting)
    this.completeCancelInclude();
  this.data = data;
};

HTMLGrid.prototype.setShowColumn = function (c, show) {
  var idxColumn = this.findColumn(c);
  var rn = this.getRealNameColumn(c);
  if (rn != -1) {
    var gridConfig = gridFieldsConfig[this.id];
    if (show) {
      this.iscCanvas.showField(rn);
      gridConfig["hiddenFields"].splice(gridConfig["hiddenFields"].indexOf(rn), 1);
      this.iscCanvas.getAllFields()[idxColumn].showIf = "true";
    }
    else {
      this.iscCanvas.hideField(rn);
      gridConfig["hiddenFields"].push(rn);
      this.iscCanvas.getAllFields()[idxColumn].showIf = "false";
    }
    this.nav.setEnabled(!this.hasFrozenFieldVisible());
    if (this.editing || this.inserting)
      this.cancel();
  }
  var comp = this.iscCanvas.getAllFields()[idxColumn].comp;
  if (comp) {
    var idx = this.iscCanvas.showRowNumbers ? (idxColumn - 1) : idxColumn;
    this.setGrid(idx, show, comp);
  }
  this.performFocus();
};

HTMLGrid.prototype.setSizeColumns = function (lC, lNw) {
  if (lC instanceof Array && lNw instanceof Array) {
    var idx;
    for (var i = 0; i < lC.length; i++) {
      idx = this.findColumn(lC[i], true);
      this.iscCanvas.resizeField(idx, parseInt(lNw[i]));
    }
  }
};

HTMLGrid.prototype.setAllColumns = function (arrJson) {
  var ref = this.iscCanvas;
  ref.setFields(arrJson);
};

HTMLGrid.prototype.setAllRecords = function (data) {
  this.data = data;
  this.refreshData();
};

HTMLGrid.prototype.setCellDataByColumn = function (row, column, value) {
  this.setCellDataByColumnNoRefresh(row, column, value);
  this.refreshData();
};

HTMLGrid.prototype.setCellDataByColumnNoRefresh = function (row, column, value) {
  if (parseInt(row).toString() === "NaN") {
    let error = new Error();
    error.name = getLocaleMessage("ERROR.IMCOMPATIBLE_TYPE");
    error.message = getLocaleMessage("ERROR.NOT_A_NUMBER_VALUE");
    handleException(error);
    return;
  }
  this.data[row][this.getRealNameColumn(column)] = value;
};

/**
 * Sobrescreve o mÃ©todo do HTMLElementBase devido a sua estruturaÃ§Ã£o.
 * @param v Valor lÃ³gico para habilitar/desabilitar o componente.
 */
HTMLGrid.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  if (this.nav) this.nav.setEnabled(this.enabled);
};

/**
 * Sobrescreve o mÃ©todo do HTMLElementBase devido a sua estruturaÃ§Ã£o.
 * @param v Valor lÃ³gico para mostrar/ocultar o componente.
 */
HTMLGrid.prototype.setVisible = function(v) {
  this.callMethod(HTMLElementBase, "setVisible", [v]);
  if (this.nav) this.nav.setVisible(this.visible);
};

/**
 * Sobrescreve o mÃ©todo do HTMLElementBase devido a sua estruturaÃ§Ã£o.
 * @param v Valor lÃ³gico para ativar/desativar o modo somente leitura
 */
HTMLGrid.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, "setReadOnly", [v]);

  // Manter a variÃ¡vel this.readOnly para as funÃ§Ãµes da API.
  this.readOnly = this.readonly;

  // Definir a propriedade somente leitura na barra de navegaÃ§Ã£o da grade.
  if (this.nav) this.nav.setReadOnly(this.readonly);
};

HTMLGrid.prototype.setRowColor = function (record, row, column) {
  if (this.iscCanvas.getEditRow() !== row) {
    var expression = this.conditionExpression;
    var flowCondition = this.conditionExpressionFlow;
    var showRowNumbers = this.iscCanvas.showRowNumbers;
    let canvas = this.iscCanvas;
    let diff = (canvas.getAllFields().length - canvas.fields.length) > 0 ? true : false;
    let grouped = this.isGrouped();
    let paint;
    var colsPaint;
    var expressions;

    if (showRowNumbers && (column === 0) || (record && (record.isFolder || record.isGroupSummary)))
      return;

    if (flowCondition.length > 0) {
      var cfP = null;
      for (var i = 0; i < flowCondition.length; i++) {
        if (grouped) {
          paint = (flowCondition[i].row === record.row);
        } else {
          paint = (flowCondition[i].row === row);
        }
        if (paint)
          cfP = flowCondition[i];
      }
      if (cfP) {
        colsPaint = cfP.colsPaint;
        if (colsPaint && colsPaint.length > 0) {
          if (diff)
            colsPaint = getGridVerifyColumns(this, colsPaint);
          if (colsPaint.contains(column))
            return "background:" + cfP.color + "; border-color:" + cfP.color;
        } else return "background:" + cfP.color + "; border-color:" + cfP.color;
      }
    }

    if (expression.length > 0) {
      expressions = this.getExpressionByRow(expression, record.row);
      for (var j = 0; j < expressions.length; j++) {
        var express = expressions[j];
        var expr = express.expression;
        if (grouped) {
          paint = (expr && record.row === express.row);
        } else {
          paint = expr;
        }
        if (paint) {
          if (showRowNumbers && (column === 0))
            return;
          colsPaint = express.colsPaint;
          if (colsPaint && colsPaint.length > 0) {
            colsPaint = getGridVerifyColumns(this, colsPaint);
            if (colsPaint.contains(column))
              return "background:" + express.color + "; border-color:" + express.color;
          } else return "background:" + express.color + "; border-color:" + express.color;
        }
      }
    }
  }
  return;
};

HTMLGrid.prototype.getExpressionByRow = function (expressions, row) {
  return expressions.filter(
      function(data){ return data.row == row }
  );
}

HTMLGrid.prototype.setGridPageIni = function (v) {
  this.gridini = v;
};

HTMLGrid.prototype.setGridPageEnd = function (v) {
  this.gridend = v;
  if (this.paging)
    this.paging.setGoto(v);
};

HTMLGrid.prototype.setMainImages = function (imgInclude, imgEdit, imgDelete, imgRefresh) {
  this.imgInclude = imgInclude;
  this.imgEdit = imgEdit;
  this.imgDelete = imgDelete;
  this.imgRefresh = imgRefresh;
};

HTMLGrid.prototype.setEditImages = function (imgPost, imgCancel) {
  this.imgPost = imgPost;
  this.imgCancel = imgCancel;
};

HTMLGrid.prototype.setIncludeImages = function (imgPost, imgCancel) {
  this.imgPost = imgPost;
  this.imgCancel = imgCancel;
};

HTMLGrid.prototype.setShowFilter = function (show) {
  var ref = this.iscCavas;
  ref.setShowFilterEditor(show);
};

HTMLGrid.prototype.setHeight = function (height) {
  height = parseInt(height);
  this.callMethod(HTMLElementBase, 'setHeight', [height]);
  this.iscCanvas.setHeight(height);
};

HTMLGrid.prototype.setWidth = function (width) {
  width = parseInt(width);
  this.callMethod(HTMLElementBase, 'setWidth', [width]);
  this.iscCanvas.setWidth(width);
};

HTMLGrid.prototype.setHint = function (hint) {
  this.callMethod(HTMLElementBase, "setHint", [hint]);

  if (this.gridDiv) {
    this.gridDiv.alt = hint;
    this.gridDiv.title = hint;
  }
};

HTMLGrid.prototype.setNumericFormat = function (i) {
  if (!this.numericColumns)
    this.numericColumns = [];
  this.numericColumns[i] = true;
};

HTMLGrid.prototype.setActionFlag = function (detail, page, post, order, refresh) {
  this.actRefresh = refresh;
  this.actPaged = page;
  this.actPost = post;
  this.detailSelectRow = detail;
  this.actOrder = order;
};

/**
 * Methods Commons.
 */
HTMLGrid.prototype.exportData = function (type) {
  var types = ['HTML', 'JSON', 'LST', 'PDF', 'TXT', 'XLS', 'XML'];
  if (types.contains(type.toUpperCase())) {
    var id = this.id + "Loading";
    let _parent = this.div;
    gridLoading(id, _parent);
    var formGuid = this.formGUID + "_" + this.id;
    var url = getAbsolutContextPath() + 'WFRGridExport';
    url += '?sys=' + sysCode + '&formID=' + this.formCode + '&type=' + type + '&formGUID=' + URLEncode(formGuid, 'GET');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          gridDownloadFileData(this.response, type);
          gridRemoveLoading(id, _parent);
        }
      }
    };
    xhr.onerror = function (e) {
      gridRemoveLoading(id, _parent);
      var msg = new HTMLMessage();
      msg.showErrorMessage("", getLocaleMessage("ERROR.GRID_EXPORT_DATA_FAILED"), null, xhr.statusText, null);
    }
    xhr.send(null);

  }
  return false;
};

HTMLGrid.prototype.groupOperation = function (records, summaryField, operation) {
  if (records && operation == "sum" || operation == "avg") {
    var sum = 0;
    for (var i = 0; i < records.length; i++) {
      sum += parseNumeric(records[i][summaryField.name] == "&nbsp;" ? 0 : records[i][summaryField.name]);
    }
    return operation == "avg"
      ? ebfFormatNumber(ebfArredondaDecimal(sum / records.length, this.round), "###,###.00")
      : ebfFormatNumber(ebfArredondaDecimal(sum, this.round), "###,###.00");
  } else if (records && operation == "count") {
    return records.length;
  } else if (records && operation == "multiplier") {
    var sum = 1;
    for (var i = 0; i < records.length; i++) {
      sum *= parseNumeric(records[i][summaryField.name] == "&nbsp;" ? 0 : records[i][summaryField.name]);
    }
    return ebfFormatNumber(ebfArredondaDecimal(sum, this.round), "###,###.00");
  } else if (records && operation == "max") {
    var valor, maximo = 0;
    for (var i = 0; i < records.length; i++) {
      valor = parseNumeric(records[i][summaryField.name] == "&nbsp;" ? 0 : records[i][summaryField.name]);
      if (valor > maximo)
        maximo = valor;
    }
    return ebfFormatNumber(ebfArredondaDecimal(maximo, this.round), "###,###.00");
  } else if (records && operation == "min") {
    var valor, minimo = 0;
    for (var i = 0; i < records.length; i++) {
      valor = parseNumeric(records[i][summaryField.name] == "&nbsp;" ? 0 : records[i][summaryField.name]);
      var valor, minimo = 0;
      if (valor < minimo)
        minimo = valor;
    }
    return ebfFormatNumber(ebfArredondaDecimal(minimo, this.round), "###,###.00");
  }
};

HTMLGrid.prototype.clearSelectedRows = function (rowNum) {
  var ref = this.iscCanvas;
  if (rowNum >= 0)
    ref.deselectRecord(rowNum);
};

HTMLGrid.prototype.showNormalElements = function () {
  if(this.elements_Of_Grid) {
    let size = this.elements_Of_Grid.length;
    for(var i=0; i < size; i++) {
      if(this.elements_Of_Grid[i].style.display && this.elements_Of_Grid[i].style.display === 'none')
        this.elements_Of_Grid[i].style.removeProperty('display');
    }
  }
};

HTMLGrid.prototype.checkShowBar = function () {
  if (!this.nav.enabled && !this.hasPagination) {
    this.bar.style.setProperty("display", "none", "important");
    this.bar.visible = false;
  } else {
    this.bar.style.display = null;
    this.bar.visible = true;
  }
};

HTMLGrid.prototype.cancel = function () {
  this.navigationEndEditing();
  if (this.editing)
    this.cancelEdit();
  else if (this.inserting)
    this.cancelInclude();
};

HTMLGrid.prototype.edit = function () {
  var ref = this.iscCanvas;
  var gridConfig = gridFieldsConfig[this.id];

  if (!this.enabled || this.readonly || !this.editable || (this.nav && !this.nav.btEdit) ||
    (Object.keys(gridConfig["frozenFields"]).length > 0 && this.hasFrozenFieldVisible()))
    return;
  this.navigationStartEditing();
  if (this.data.length == 0) {
    this.include();
  } else {
    if (this.isGrouped())
      row = this.getRowInGroup() == -1 ? this.getFirstRowIgnoreFolder() : this.getRowInGroup();
    else
      row = this.getSelectedRow() == -1 || this.getSelectedRow() > ref.getOriginalData().getAllRows().length - 1 ? 0 : this.getSelectedRow();

    if (row == -1) {
      this.navigationEndEditing();
      return;
    }

    if(this.getSelectedRow() == -1) this.selectRow(0);

    this.currentRow = row;
    this.startEditing = true;
    this.startedEdition = true;
    ref.collapseGroupOnRowClick = false;
    ref.canCollapseGroup = false;


    var gt = this.getRowNo(true);
    if (gt <= 0) {
      this.focusColumn = 0;
      gt = this.gridini + 1;
    }
    getAndEval('gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=edit&formID=' + this.formID + '&comID=' + this.code + '&gridComID=-1&gt=' + gt);
  }
};

HTMLGrid.prototype.cancelEdit = function () {
  getAndEval('gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=canceledit&formID=' + this.formID + '&comID=' + this.code + '&gt=-1');
};

HTMLGrid.prototype.completeEdit = function () {
  this.startEditing = false;
  this.editing = true;
  var ref = this.iscCanvas;
  ref.setCanResizeFields(false);
  this.vScrollSetDisabled(true);

  this.timeout(function () { this.completeEditRow() }, 0);
  this.editCells = [];
  this.navWasVisible = this.paging.getVisible();
  this.paging.setVisible(false);
};

HTMLGrid.prototype.cancelInclude = function () {
  getAndEval('gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=cancelinsert&formID=' + this.formID + '&comID=' + this.code + '&gt=-1');
};

HTMLGrid.prototype.completeCancelInclude = function () {
  this.showNormalElements();
  this.completePost(true);
  this.data.pop();
  this.keys.pop();
  if (this.data.length > 0) {
    this.moveScrollToRow(0);
  }
  this.clearSelectedRows(this.currentRow);
  this.currentRow = this.currentRow -= this.isGrouped() ? (this.showGroupSummaryInHeader && this.showCollapsedGroupSummary ? 0 : (eval(this.iscCanvas.getGroupState()).length)) + 1 : 1;
  this.selectRow(this.currentRow);
  this.selectionChanged();
  this.timeout(this.gridFocus, 100);
};

HTMLGrid.prototype.include = function () {
  if (!this.enabled || this.readonly || !this.editable || this.editing || this.inserting || (this.nav && !this.nav.btInclude))
    return;
  this.navigationStartEditing();
  this.startedEdition = true;
  this.iscCanvas.collapseGroupOnRowClick = false;
  this.iscCanvas.canCollapseGroup = false;
  getAndEval('gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=insert&formID=' + this.formID + '&comID=' + this.code + '&gt=-1');
};

HTMLGrid.prototype.addColumn = function (column) {
  var idx = this.findColumn(column);
  if (idx !== -1) {
    let error = new Error();
    error.name = getLocaleMessage("LABEL.ADD_ITEM");
    error.message = getLocaleMessage("INFO.GRID_ALREADY_CONTAINS_COLUMN", column, this.description);
    handleException(error);
    return;
  }
  var jC = {};
  jC.name = column;
  jC.title = column;
  jC.type = "text";
  jC.width = 50;
  this.iscCanvas.addField(jC);
  if (this.editing || this.inserting)
    this.cancel();
};

HTMLGrid.prototype.findColumn = function (column, rendered) {
  var idx = -1;
  var ref = this.iscCanvas;
  var lC = null;
  if(!rendered) lC =ref.getAllFields();
  else lC = ref.fields;
  if (column) {
    for (var i = 0; i < lC.length; i++) {
      if (lC[i].title === column) {
        idx = i;
        break;
      }
    }
  }
  return idx;
};

HTMLGrid.prototype.findInSummary = function (name, data) {
  var idx = -1;
  var lC = data;
  if (name) {
    for (var i = 0; i < lC.length; i++) {
      if (lC[i].name === name) {
        idx = i;
        break;
      }
    }
  }
  return idx;
};

HTMLGrid.prototype.findVisibleColumn = function (column) {
  var idx = -1;
  var ref = this.iscCanvas;
  var lC = ref.fields;
  if (column) {
    for (var i = 0; i < lC.length; i++) {
      if (lC[i].title === column)
        return i;
    }
  }
  return idx;
};

HTMLGrid.prototype.columnIsVisible = function (columnCode) {
  var ref = this.iscCanvas.fields;
  if (columnCode)
    for (var i = 0; i < ref.length; i++)
      if (ref[i].cod === columnCode)
        return true;
  return false;
};

HTMLGrid.prototype.deleteRow = function () {
  var currentGrid = this;
  var ref = this.iscCanvas;
  var lS = this.getSelectedRow();
  var code = this.code;
  var formId = this.formID;
  var gt = this.getRowNo(true);
  var self = this;
  if (!this.enabled || this.readonly || !this.editable || (this.nav && !this.nav.btDelete))
    return;
  if (lS < 0 || this.getLengthData() < lS) {
    interactionError(getLocaleMessage("INFO.GRID_RECORD_SELECT"));
  } else {
    this.lastSelectionIndex = lS;
    var okFunction = function (boolTest, argumentsArray) {
      try {
        if (currentGrid.beforeDelete)
          currentGrid.beforeDelete();
        //Remove seleÃ§Ã£o atual
        getAndEvalSync('gridEdit.do?sys=' + sysCode + '&action=gridEdit&param=delete&formID=' + formId + '&comID=' + code + '&gridComID=-1&gt=' + gt);
        self.timeout(self.focus, 0);
      } catch (e) {
        handleException(e);
      }
    };

    var cancelFunction = function () {
      self.timeout(self.focus, 0);
    };

    var interaction = new parent.mainform.HTMLMessage();
    interaction.showInteractionConfirmMessage($mainform().getLocaleMessage("LABEL.REMOVE_RECORD"),
      $mainform().getLocaleMessage("INFO.REMOVE_CONFIRM"), okFunction, null, cancelFunction, null, null, $mainform().getLocaleMessage("LABEL.YES"), $mainform().getLocaleMessage("LABEL.NO"));
  }
};

HTMLGrid.prototype.refreshData = function (notFocus) {
  this.resetDataSource();
  if (!notFocus)
    this.gridFocus();
  if (this.nav)
    this.nav.setVisible(this.editable && this.parentHasData);
};

HTMLGrid.prototype.resetDataSource = function () {
  var ref = this.iscCanvas;
  var grid = this;
  var gridConfig = gridFieldsConfig[this.id];
  var fields = ref.fields;

  //save fields sizes
  gridConfig["fieldsSizes"] = {};
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (field.name)
      gridConfig["fieldsSizes"][field.name] = field.width;
  }

  gridConfig["fieldOrder"] = this.getFieldsOrder();

  gridConfig["groupState"] = {};

  if (grid.isGrouped()) {
    gridConfig["groupState"]["openDescendantFolders"] = [];
    var openDescendantFolders = ref.groupTree.getDescendantFolders();
    for (var i = 0, a = 0; i < openDescendantFolders.length; i++) {
      const element = openDescendantFolders[i];
      if (element["_isOpen_" + ref.groupTree.ID]) {
        gridConfig["groupState"]["openDescendantFolders"][a] = [element, i];
        a++;
      }
    }
  }

  var data = this.data;
  ref.getDataSource().setCacheData(data);
  ref.refreshData(function () {
    grid.loadConfigs();
    grid.checkSelectionRow();
  });
};

HTMLGrid.prototype.loadConfigs = function () {
  var gridConfig = gridFieldsConfig[this.id];
  var ref = this.iscCanvas;

  var rowNumbers = ref.showRowNumbers ? 1 : 0;
  var idx = 0;
  for (var i = 0; i < gridConfig.fieldOrder.length; i++) {
    if (ref.fieldIsVisible(gridConfig.fieldOrder[i])) {
      this.ActUpGrid = false;
      ref.reorderField(ref.getFieldNum(gridConfig.fieldOrder[i]), idx + rowNumbers);
      this.ActUpGrid = true;
      idx++;
    }
  }

  if (Object.keys(gridConfig["frozenFields"]).length > 0) {
    this.nav.setEnabled(!this.hasFrozenFieldVisible());

    for (var i = 0; i < Object.keys(gridConfig["frozenFields"]).length; i++) {
      var field = Object.keys(gridConfig["frozenFields"])[i];
      var fieldTitle = this.getColumnTitle(field);
      var idx = this.findColumn(fieldTitle);
      this.ActUpGrid = false;
      ref.reorderField(idx, gridConfig["frozenFields"][field]);
      this.ActUpGrid = true;
      ref.freezeField(field);
    }

  }
  if (gridConfig["hiddenFields"].length > 0)
    for (var i = 0; i < gridConfig["hiddenFields"].length; i++)
      if (projectMode !== "D")
        ref.hideField(gridConfig["hiddenFields"][i]);

  if (gridConfig["removedFields"].length > 0)
    for (var i = 0; i < gridConfig["removedFields"].length; i++)
      ref.removeField(gridConfig["removedFields"][i]);

  if (gridConfig["fieldsSizes"]) {
    for (var i = 0; i < ref.fields.length; i++) {
      var field = ref.fields[i];
      if (gridConfig["fieldsSizes"][field.name]) {
        var fieldIndex = ref.getFieldNum(field.name);
        ref.resizeField(fieldIndex, gridConfig["fieldsSizes"][field.name]);
      }
    }
  }

  if (this.isGrouped()) {this.returnStateGroup()}

  /*if (this.isGrouped()) {
    var folders = gridConfig["groupState"]["openDescendantFolders"];
    var foldersNew = ref.groupTree.getDescendantFolders();
    var paths = this.openFolders(folders, foldersNew, ref)
    ref.groupTree.openFolders(paths);
    this.moveScrollToRow(this.currentRow);
  }*/
};

HTMLGrid.prototype.returnStateGroup = function (arr) {
  var gridConfig = gridFieldsConfig[this.id];
  var ref = this.iscCanvas;
  var oldArr;
  if (this.isGrouped() && gridConfig["groupState"]) {
    var folders = gridConfig["groupState"]["openDescendantFolders"];

    if (!folders)
      return;

    oldArr = gridConfig["groupState"]["oldState"]

    if (!oldArr)
      oldArr = arr;
    else
      oldArr = oldArr;

    if (oldArr === arr) {
      var foldersNew = ref.groupTree.getDescendantFolders();
      var paths = this.openFolders(folders, foldersNew, ref)
      ref.groupTree.openFolders(paths);
      this.moveScrollToRow(this.currentRow);
      this.checkSelectionRow();
    }

    gridConfig["groupState"]["oldState"] = arr;
  }
};

HTMLGrid.prototype.openFolders = function (folders, foldersNew, ref) {
  var paths = [];
  for (var i = 0; i < folders.length; i++) {
    const element = folders[i];
    paths[i] = ref.groupTree.getPath(foldersNew[element[1]]);
  }
  return paths;
};

HTMLGrid.prototype.checkSelectionRow = function () {
  var rowNum = this.getSelectedRow();
  if (this.actRefresh || this.actPost || this.actPaged) {
    if (!this.dependentGrids || this.dependentGrids.length === 0) {
      this.clearSelectedRows(rowNum);
      this.selectRow(this.currentRow);
    } else if (this.actPost || this.gridSelectRowMaster) {
      this.selectRow(rowNum);
    } else {
      this.selectRow(rowNum);
    }
  } else if ((this.detailSelectRow || this.actOrder) || (this.gridMaster && this.currentRow != -1)) {
    this.clearSelectedRows(rowNum);
    this.selectRow(this.currentRow);
  }
};

HTMLGrid.prototype.completeDeleteRow = function () {
  this.actRefresh = true;
  this.startedEdition = false;
  if (this.afterDelete) {
    try {
      this.afterDelete();
    } catch (e) {
      handleException(e);
    }
  }

  if (this.data.length > 0) {
    this.lastSelectionIndex = this.lastSelectionIndex < this.data.length
      ? this.lastSelectionIndex
      : this.lastSelectionIndex - 1;
    this.currentRow = this.lastSelectionIndex
    this.selectRow(this.lastSelectionIndex);
  }
};

HTMLGrid.prototype.removeColumn = function (c) {
  var rNc = this.getRealNameColumn(c);
  if (rNc != -1) {
    var gridConfig = gridFieldsConfig[this.id];
    if (c)
      gridConfig["removedFields"].push(rNc);
    else
      gridConfig["removedFields"].splice(gridConfig["removedFields"].indexOf(rNc), 1);
    this.iscCanvas.removeField(rNc);
    for (var i = 0; i < Object.keys(gridConfig["frozenFields"]).length; i++)
      if (Object.keys(gridConfig["frozenFields"])[i] === rNc)
        delete gridConfig["frozenFields"][rNc];
    if (this.editing || this.inserting)
      this.cancel();
  }
};

HTMLGrid.prototype.removeDataRow = function (r) {
  if (r >= 0) {
    this.data = arrayIndexRemove(this.data, r);
    this.refreshData();
  } else {
    interactionError(getLocaleMessage("INFO.GRID_RECORD_SELECT"));
  }
};

/**
 * @param notRefresh - parÃ¢metros que informa se deverÃ¡ ser realizado refresh do data source.
 */
HTMLGrid.prototype.includeNewRow = function (notRefresh) {
  var jRow = {};
  for (var i = 0; i < this.columns.length; i++) {
    jRow[this.columns[i].name] = '';
  }
  this.data.push(jRow);

  var newKeyData = new Array(this.keysLength);
  // '3' refers to primary keys
  if (this.eventParams.indexOf(3) != -1) {
    for (var i = 0; i < newKeyData.length; i++) {
      newKeyData[i] = '';
    }
  }
  this.keys.push(newKeyData);

  var newQueryValues = new Array(this.queryValuesLength);
  // '5' refers to query values
  if (this.eventParams.indexOf(5) != -1) {
    for (var i = 0; i < newQueryValues.length; i++) {
      newQueryValues[i] = '';
    }
  }
  this.queryValues.push(newQueryValues);

  if (!notRefresh)
    this.refreshData();
};


HTMLGrid.prototype.moveScrollToRow = function (rowIndex) {
  var ref = this.iscCanvas;
  var leftPos = ref.body.getScrollLeft();
  ref.scrollToRow(rowIndex);
  ref.body.scrollTo(leftPos);
};

HTMLGrid.prototype.moveScrollToColumn = function (column) {
  this.iscCanvas.scrollToColumn(this.findColumn(column));
};

HTMLGrid.prototype.selectRow = function (r, increment) {
  var ref = this.iscCanvas;
  if (r >= 0 && r <= ref.getTotalRows() - 1) {
    var record = ref.getRecord(r);
    if (this.isGrouped()) {

      while (record && record.isGroupSummary) {
        this.selectRow(r + 1);
        return;
      }
      while (record && record.isFolder) {
        ref.openGroup(record);
        record = record.groupMembers[0];
      }

    }
    ref.selectRecord(record);
  }
};

HTMLGrid.prototype.refresh = function (updateColumns, keepFocus) {
  gridLoading("_"+this.id+"_refresh", this.div, this.id);
  this.setActionFlag(false, false, false, false, true);
  var url = 'gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=refresh&formID=' + this.formID + '&comID=' + this.code + '&gridComID=-1&gt=-1';
  let first = false;
  let regexp = null;
  let arr = null;
  var components = d.t.dependences[this.code];
  if (components && components.length > 0) {
    let size = components.length;
    for (var i=0; i < size; i++) {
      if (isNumeric(components[i])) {
        var component = eval("$mainform().d.c_" + components[i]);
        if (component && (!this.isFiltered || this.filterMode === 0)) {
          url += ("&WFRInput" + component.code + "=" + URLEncode(component.value, "GET"));
        } else if(this.isFiltered){
          if(this.refreshURL && this.filterMode === 1) {
            if(!first){
              regexp = new RegExp(/[^&?]*?=[^&?]*/g);
              arr = this.refreshURL.match(regexp);
              first = true;
            }
            if(arr){
              let size = arr.length;
              for(var j=0; j < size; j++){
                let oldvalue = arr[j];
                if(oldvalue.indexOf("WFRInput" + component.code + "=") != -1)
                  this.refreshURL = this.refreshURL.replace(oldvalue, ("WFRInput" + component.code + "=" + URLEncode(component.value, "GET")));
              }
            } else {
              this.refreshURL += ("&WFRInput" + component.code + "=" + URLEncode(component.value, "GET"));
            }
          }
        }
      }
    }
  }
  if (this.refreshURL)
    url = this.refreshURL;

  let comp = this;
  updateColumns = updateColumns ? true : false;
  gridSendCommand(url, "_"+this.id+"_refresh", this.div, true, function(resp, grid, updateColumns){
    lastReceivedContent = resp;
    grid.ordered = null;
    eval(resp);
    if (keepFocus) {
      grid.gridFocus();
    }
    if(updateColumns){
       grid.timeout(grid.setAllColumns,0,[grid.columns]);
    }
  }, comp, updateColumns, this.id);
};

HTMLGrid.prototype.filter = function (f, editor) {
  gridLoading("_"+this.id+"_filter", this.div, this.id);
  const param = !editor ? "filter" : "editorfilter";
  f = !editor ? f : JSON.stringify(f);
  var url = 'gridEdit.do?sys=' + this.sys + '&param=' + param + '&formID=' + this.formID + '&comID=' + this.code + '&filter=' + URLEncode(f, "GET");

  var components = d.t.dependences[this.code];
  if (components && components.length > 0) {
    let size = components.length;
    for (var i=0; i < size; i++) {
      if (isNumeric(components[i])) {
        var component = eval("$mainform().d.c_" + components[i]);
        if (component) {
          url += ("&WFRInput" + component.code + "=" + URLEncode(component.value, "GET"));
        }
      }
    }
  }

  gridSendCommand(url, "_"+this.id+"_filter", this.div, true, null, null, null, this.id);
  this.refreshURL = url;
};

HTMLGrid.prototype.updateFilter = function () {
  if(this.isFiltered) {
    this.isFiltered = false;
    this.iscCanvas.clearCriteria();
    if(this.refreshURL)
      this.refreshURL = null;
  }
};

/**MÃ©todo que salva as configuraÃ§Ãµes aplicada pelo usuÃ¡rio no editor de filtro
 * @author Janpier
 * @param criteira aplicada no filtro
 */
HTMLGrid.prototype.saveAdvancedFilter = function (criteria) {
  if (!this.disableUserCustomize && loggedUserWithProfile) {
    if(criteria) {
      var formID = this.formGUID + '_' + this.id;
      gridSendCommand('saveGridFilter.do?sys=' + sysCode + '&action=saveGridFilter&formID=' + encodeURI(formID) + '&jsonFilter=' + URLEncode(JSON.stringify(criteria), 'GET')+ '&formCode=' + this.formCode);
    }
  }
};

/**
 * MÃ©todo responsÃ¡vel pelo parse do critÃ©rio a serem enviados para o servidor.
 * @author Janpier.
 * @param criteria dados inseridos nos campos para filtro.
 */

HTMLGrid.prototype.parseCriteria = function (criteria, main, constructor) {
  let jCriteria = [];
  if(criteria){
    if(!criteria.criteria){
      let cont = 0;
      for(var o = null in criteria){
        let jCols = this.columns.filter(function(v){return v.name === o});
        jCriteria[cont] = {
          field: jCols[0].cod,
          value: this.parseValue(jCols[0].cod, criteria[o], (jCols[0].realType ? jCols[0].realType : jCols[0].type), jCols[0]),
          operator: this.parseOperator("", (jCols[0].realType ? jCols[0].realType : jCols[0].type), true, jCols[0].cod),
        };
        cont++;
      }
      return jCriteria;
    } else {
      let cont = 0;
      criteria = criteria.criteria;
      let size = criteria.length;
      for(var i = 0; i < size; i++){
        if(criteria[i]["_constructor"]){
          let constructor = (_STARTSCRITERIA && i === 0) ? false : true;
          let nCriteria = this.parseCriteria(criteria[i], criteria[i].operator.toUpperCase(), constructor);
          jCriteria = jCriteria.concat(nCriteria);
          _STARTSCRITERIA = false;
          cont = jCriteria.length;
          continue;
        }
        let jCols = this.columns.filter(function(v){return v.name === criteria[i].fieldName});
        jCriteria[cont] =  {
          field: jCols[0].cod,
          value: this.parseValue(jCols[0].cod, criteria[i].value, (jCols[0].realType ? jCols[0].realType : jCols[0].type), jCols[0]),
          operator: this.parseOperator(criteria[i].operator, (jCols[0].realType ? jCols[0].realType : jCols[0].type), false, jCols[0].cod),
         };
        cont ++;
      }
      if(constructor){
        jCriteria = [
          {
            _constructor:{
              mainOperator: main,
              criteria:jCriteria
            }
          }
        ];
      }
      return jCriteria;
    }
  }
  return criteria;
};

/**MÃ©todo responsÃ¡vel por checar se existe somente criterios informado no filtro.
 * @author Janpier
 * @criteira filtro aplicado
 * @returns onlyCriteria valor lÃ³gico informando se o filtro sÃ³ possui criterios
*/
HTMLGrid.prototype.checkIsAdvancedCriteria = function (criteria) {
  let size = criteria.length;
  var onlyCriteria = false
  for(var i=0; i < size; i++){
    if(criteria[i]["_constructor"])
      onlyCriteria = true;
    else
      onlyCriteria = false;
  }
  return onlyCriteria;
}

/**
 * MÃ©todo responsÃ¡vel por realizar o parse do valor informado pelo usuÃ¡rio
 * @author Janpier.
 * @param cod cÃ³digo do componente
 * @param value valor informado no filtro
 * @returns valor
 */
HTMLGrid.prototype.parseValue = function (cod, value, type, col) {
  if(this.bind && this.bind.length > 0){
    let jsValueParse = this.bind.filter(
      function(o) {
        return Object.keys(o)[0] == cod;
      }
    );
    if(jsValueParse && jsValueParse.length > 0)
      return jsValueParse[0][cod][value] ? jsValueParse[0][cod][value] : value;
  }
  if(type === 'datetime' || type === 'date')
    return value + _jsonConverter["date"];
  return value;
};

/**MÃ©todo responsÃ¡vel por validar os valores inseridos para filtro de acordo o tipo do dado
 * @author Janpier
 * @criteira filtro aplicado
 * @returns onlyCriteria valor lÃ³gico informando de o filtro Ã© vÃ¡lido.
*/
HTMLGrid.prototype.validateTypesAndValues = function (criteria) {
  let validated = true;
  if(!criteria.criteria) {
    for(var o = null in criteria){
      let jCols = this.columns.filter(function(v){return v.name === o});
      validated = this.checkTypeValidate(jCols[0].realType ? jCols[0].realType : jCols[0].type, criteria[o], jCols[0].title);
      if(validated) continue;
      else break;
    }
  }
  else {
    criteria = criteria.criteria;
    let size = criteria.length;
    for(var i = 0; i < size; i++){
      if(criteria[i]["_constructor"]){
        let v = this.validateTypesAndValues(criteria[i]);
        if(v) continue;
        else return v;
      }
      let jCols = this.columns.filter(function(v){return v.name === criteria[i].fieldName});
      let rv = this.checkTypeValidate(jCols[0].realType ? jCols[0].realType : jCols[0].type, criteria[i].value, jCols[0].title);
      if(rv) continue;
      else return rv;
    }
  }
  return validated;
};

/** MÃ©todo responsÃ¡vel por checar o valor de acordo o tipo de dado da coluna
 * @author Janpier
 * @param type tipo da coluna.
 * @param value valor da coluna.
 * @param col coluna.
 * @returns validated valor lÃ³gico.
*/
HTMLGrid.prototype.checkTypeValidate = function (type, value, col) {
  let validated = true;
  if(type === 'datetime' || type === 'date'){
    validated = isDateTime(value);
    if(!validated) {
      let error = new Error();
      error.name = getLocaleMessage("ERROR.GET_XML_DATA_FAILED");
      error.message = getLocaleMessage("ERROR.INVALID_FIELD_DATE_FORMAT", col);
      handleException(error);
      return validated;
    }
  }
  else if (type === 'integer' || type === 'numeric' || type === 'double' || type === 'float') {
    if (toDouble(value).toString() === 'NaN')
      validated = false;
    else
      validated = isNumeric(value);
    if(!validated) {
      let error = new Error();
      error.name = getLocaleMessage("ERROR.GET_XML_DATA_FAILED");
      error.message = getLocaleMessage("ERROR.FIELD_NOT_A_NUMBER", value, col)
      handleException(error);
      return validated;
    }
  }
  return validated;
};

/**
 * Retorna o operador de acordo o tipo no banco de dados;
 * @author Janpier.
 * @param operador operador do filtro
 * @param type tipo do campo
 * @param default filtro default
 * @param cod cÃ³digo do componente.
 * @returns operador do servidor.
 */
HTMLGrid.prototype.parseOperator = function (operator, type, def, cod) {
  let equals = false;
  if(this.bind && this.bind.length > 0){
    let jsValueParse = this.bind.filter(
      function(o) {
        return Object.keys(o)[0] == cod;
      }
    );
    if(jsValueParse && jsValueParse.length > 0){
      type = jsValueParse[0][cod]["type"] ? jsValueParse[0][cod]["type"] : type;
      operator = "equals";
      equals = true;
    }
  }
  if(def && !equals){
    if(type === "integer" || type === "double")
      return 17;
    else if (type === "date" || type === "datetime")
      return 10;
    return 2;
  }
  if(!type || type === "text")
    return operator && _jsonOperator[operator] ? _jsonOperator[operator] : 2;
  else{
    if(operator && operator ==="equals" && (type === "integer" || type === "double" || type === "date" || type === "datetime")){
      if(type === "date" || type === "datetime")
        return 10;
      return 17;
    } else if (operator && operator ==="lessThan" && (type === "integer" || type === "double" || type === "date" || type === "datetime")){
      if(type === "date" || type === "datetime")
        return 12;
      return 19;
    } else if (operator && operator ==="greaterThan" && (type === "integer" || type === "double" || type === "date" || type === "datetime")){
      if(type === "date" || type === "datetime")
        return 11;
      return 18;
    } else if (operator && operator ==="notEqual" && (type === "integer" || type === "double" || type === "date" || type === "datetime")){
      if(type === "date" || type === "datetime")
        return 27;
      return 26;
    } else if (operator && operator ==="lessOrEqual" && (type === "integer" || type === "double" || type === "date" || type === "datetime")) {
      if(type === "date" || type === "datetime")
        return 14;
      return 21;
    } else if (operator && operator ==="greaterOrEqual" && (type === "integer" || type === "double" || type === "date" || type === "datetime")) {
      if(type === "date" || type === "datetime")
        return 13;
      return 20;
    }
  }
};

HTMLGrid.prototype.openNormalForm = function (include) {
  if (!this.enabled || this.readonly || !this.parentHasData)
    return;
  var gotoRow = this.getRowNo(true);
  var properties = getContent("gridOpenForm.do?sys=" + this.sys + "&formID=" + this.formCode);
  let jsonPorperties = {};
  jsonPorperties.formGUID = mainform.formGUID;
  jsonPorperties.component = this.id;
  jsonPorperties.method = 'refreshPage';
  jsonPorperties.action = 'wea';
  var otherProperties = (", gotoRow: " + gotoRow + ", onClose: true, jsonProperties:'" + JSON.stringify(jsonPorperties) + "'");
  var content = ("openForm({" + properties + otherProperties + "})");

  if (include == true) {
    content = content.replace('mode: 0', 'mode: 1');
    content = content.replace('mode: -1', 'mode: 1');
  }
  this.actRefresh = true;
  eval(content);
};

HTMLGrid.prototype.refreshPage = function () {
  var url = 'gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=refreshpage&formID=' + this.formID + '&comID=' + this.code + '&gridComID=-1&gt=-1';
  var content = getContent(url);
  lastReceivedContent = content;
  eval(content);
};

HTMLGrid.prototype.gridCheckBox = function (state, valueCheck, valueUnCheck, com, row, componentProperties, checkCmd) {
  this["componentCheck" + com] = { "valueCheck": valueCheck, "valueUnCheck": valueUnCheck };
  if (state == 0) {
    state = false;
  } else if (state == 1) {
    state = true;
  } else {
    state = undefined;
  }
  var canEdit = (this.editable && this.enabled && !this.readonly && (isNullable(componentProperties) || (componentProperties.enabled && !componentProperties.readonly)));
  if (isNullable(checkCmd)) {
    checkCmd = "";
  } else {
    checkCmd += "; ";
  }
  if (canEdit) {
    var stt = state ? 1 : 0;
    var postCmd = "postCheckOption(\'" + this.code + "\','" + com + "'," + "'" + stt + "'," + "'" + valueCheck + "'," + "'" + valueUnCheck + "'," + "'" + row + "'," + '' + ");";
    var cmd = checkCmd + postCmd;
    gridChecks[com + "_" + row] = cmd;
  }
  if (componentProperties)
    gridCheckProperties[(row - 1) + "_" + com] = componentProperties;
  return state;
};

HTMLGrid.prototype.resetRowColor = function () { };
HTMLGrid.prototype.setNumericFormat = function () { };

HTMLGrid.prototype.enableNavigation = function (f, p, n, l) {
  this.lastNavigation = [f, p, n, l];
  this.paging.enableButtons(f, p, n, l);
  if (f || p || n || l) {
    this.hasPagination = true;
  }
};

HTMLGrid.prototype.post = function (includeNew) {
  if (!this.editing && !this.inserting)
    return;
  if (this.checkBoxChecked) {
    var row = this.checkBoxChecked['row'];
    var col = this.checkBoxChecked['col'];
  }

  if (this.checkRequireds()) {
    this.setActionFlag(false, false, true, false, false);
    if (this.checkBoxChecked) {
      this.executeCheckCmd(this, row, col);
    }

    try {
      //Se estiver editando, chama evento de antes de alterar
      if (this.editing && this.beforeUpdate)
        this.beforeUpdate();

      // Se estiver inserindo, chama evento de antes de inserir
      if (this.inserting && this.beforeInsert)
        this.beforeInsert();

      var arr = eval('document.editComponents' + this.code);
      var value, code;

      const line = this.getRowIgnoreState();
      var url = 'gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=post&formID=' + this.formID + '&comID=' + this.code + '&line=' + line + '&gt=-1&gridComID=-1&storedProcedureName=&storedProcedureParams=&align=0';
      if (includeNew) {
        url += '&includeNew=true';
      }
      for (var i = 0; i < arr.length; i++) {
        var editor = arr[i];
        value = editor.value;
        code = editor.getCode();
        url = url + '&WFRInput' + code + '=' + URLEncode(value, "GET");
      }
      getAndEvalSync2(url);
    } catch (e) {
      handleException(e);
    }
  }
  else {
    this.currentRow = this.editRow;
    this.clearSelectedRows(this.getSelectedRow());
  }
  if (this.checkBoxChecked) {
    var ref = this.iscCanvas;
    var fieldName = ref.getField(col).name;
    ref.getRecord(row)[fieldName] = ref.getRecord(row)[fieldName] ? false : true;
    ref.refreshCell(row, col);
    this.checkBoxChecked = undefined;
  }
};

HTMLGrid.prototype.gridButton = function (func, code, img, componentProperties) {
  var icon = iconPathExport + 'grid_button.gif';
  var id = "grid" + this.getCode() + 'button' + buttonId;
  var hint = componentProperties.hint ? componentProperties.hint : "";
  hint = stringToHTMLString(hint);
  if (img)
    icon = getAbsolutContextPath() + img;
  gridFunctions[id] = func;
  buttonId++;
  return { src: icon, width: 14, height: 12, extraStuff: "id=" + id + " onClick=executeGridComponentEvent(id) alt=" + hint + " title=" + hint + " style=cursor:pointer" };
};

function executeGridComponentEvent(componentID) {
  eval(gridFunctions[componentID]);
}

HTMLGrid.prototype.completePost = function (cancel, newDataRow, newKeyData, newQueryValues) {
  try {
    this.navigationEndEditing();
    var ref = this.iscCanvas;
    /* Quando a grade estÃ¡ agrupada a linha que estÃ¡ sendo editada/inserida difere da linha real,
    isso ocorre devido cada linha do grupo/sumÃ¡rio ser considerados.
    **/
    let row = this.getRowIgnoreState();
    var arr = eval('document.editComponents' + this.code);
    if (!arr) {
      this.editRow = -1;
      this.actRefresh = true;
      this.refreshData();
      return false;
    }
    if (row < 0) {
      this.editRow = -1;
      this.editing = false;
      this.inserting = false;
      this.startedEdition = false;
      ref.collapseGroupOnRowClick = true;
      ref.canCollapseGroup = true;
      return;
    }
    if (this.editing || this.inserting) {
      var colNum = ref.showRowNumbers ? 1 : 0;
      var fields = ref.fields;
      var sizeFields = fields.length;
      while (sizeFields > colNum) {
        var fieldCode = fields[colNum].cod;
        var elem = getComponent(arr, fieldCode);
        if (elem) {
          /**(CompatibilizaÃ§Ã£o com a grades legadas) -> ObtÃ©m o valor do componente nÃ£o vinculado DB em tela, atualizando o data*/
          if (!cancel && elem.canRemainNotDBAwareValue() && !(this.passwordFieldHideValue && elem.password)) {
            let value = elem.getValue();
            if (value) newDataRow["field" + fieldCode] =  value;
          }
          if (elem.div && elem.visible)
            elem.div.parentElement.removeChild(elem.div);
        }
        colNum++;
      }
    }

    if ((this.inserting || this.editing) && !cancel) {
      ref.getDataSource().cacheData[row] = newDataRow;
    }

    // Se estiver editando, chama evento de depois de atualizar
    if (this.editing && this.afterUpdate && !cancel)
      this.afterUpdate();


    // Se estiver inserindo, chama evento de depois de inserir
    if (this.inserting && this.afterInsert && !cancel) {
      try {
        this.afterInsert();
      } catch (e) {
        handleException(e);
      }
    }

    // Remove os componentes criados para o modo de inserÃ§Ã£o ou alteraÃ§Ã£o
    for (var i = 0; i < arr.length; i++) {
      var elem = arr[i];
      try {
        elem.free(true);
      } catch (e) {
        alert('erro' + elem);
      }
    }
    eval('document.editComponents' + parseInt(this.code) + '= undefined');
    this.keys[row] = newKeyData;
    this.queryValues[row] = newQueryValues;

    this.editRow = -1;
    this.paging.setVisible(this.navWasVisible);
    this.editing = false;
    this.inserting = false;
    this.startedEdition = false;
    ref.collapseGroupOnRowClick = true;
    ref.canCollapseGroup = true;
    ref.setCanResizeFields(true);
    this.vScrollSetDisabled(false);

    this.timeout(this.gridFocus, 100);
    if (!cancel) $c(ref.ID).refreshData();
    ref.cancelEditing();
  } catch (e) {
    handleException(e);
  }
};


HTMLGrid.prototype.refreshServer = function (focus) {
  //refresh da pÃ¡gina
  var url = 'gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=refresh&formID=' + this.formID + '&comID=' + this.code + '&gridComID=-1&gt=-1';

  var components = d.t.dependences[this.code];
  if (components && components.length > 0) {
    for (var code in components) {
      if (isNumeric(code)) {
        var component = eval("$mainform().d.c_" + components[code]);
        if (component) {
          url += ("&WFRInput" + component.code + "=" + URLEncode(component.value, "GET"));
        }
      }
    }
  }

  if (this.refreshURL)
    url = this.refreshURL;

  var content = getContent(url);
  lastReceivedContent = content;
  this.ordered = null;
  eval(content);

  if (focus) {
    this.gridFocus();
  }
};

HTMLGrid.prototype.gridFocus = function () {
  this.iscCanvas.focus();
  this.performFocus();
};

HTMLGrid.prototype.afterInsert = function () { };
HTMLGrid.prototype.completeNotPost = function () { };

HTMLGrid.prototype.completeInclude = function () {
  var ref = this.iscCanvas;
  this.clearSelectedRows(this.getSelectedRow());
  var editingRow;
  this.inserting = true;
  ref.setCanResizeFields(false);
  this.vScrollSetDisabled(true);
  ref.startEditingNew(null, true);
  editingRow = ref.getEditRow();
  this.moveScrollToRow(editingRow);
  ref.focusInCell(editingRow, 0);
  this.includeNewRow(true);
  this.currentRow = this.isGrouped() || this.isFiltered ? editingRow : this.data.length - 1;
  this.selectRow(this.currentRow);
  this.selectionChanged();
  this.navWasVisible = this.paging.getVisible();
  this.paging.setVisible(false);
  this.timeout(function () { this.completeEditRow(true) }, 0);
};

HTMLGrid.prototype.completeIncludePost = function () {
  if (this.data.length > this.pagingSize) {
    this.refresh();
  } else {
    this.clearSelectedRows(this.currentRow);
    if (this.isGrouped()) {
      this.currentRow = -1;
      this.iscCanvas.deselectAllRecords();
    } else {
      this.currentRow = this.data.length - 1;
      this.selectRow(this.currentRow);
    }
  }
};

HTMLGrid.prototype.completeCancelEdit = function () {
  this.completePost(true);
  this.showNormalElements();
  this.gridFocus();
  this.selectRow(this.currentRow);
};

HTMLGrid.prototype.navigationEndEditing = function () {
  this.nav.onEditing = false;
  if (!this.enabled) {
    this.nav.setEnabled(true);
    this.nav.toggleButtons();
    this.nav.setEnabled(false);
  } else
    this.nav.toggleButtons();
  if (this.showFilter) this.iscCanvas.setShowFilterEditor(true);
}
HTMLGrid.prototype.navigationStartEditing = function () {
  this.nav.onEditing = true;
  this.nav.toggleButtons();
}

HTMLGrid.prototype.pagingNavigateAction = function (param) {
  if (this.execOnChangeOnNavigate && this.onchange) {
    this.onchange.call(this);
  }
};

HTMLGrid.prototype.markFirst = function () {
  if (this.gridMaster) {
    var gm = $c(this.gridMaster);
    if (gm) {
      gm.iscCanvas.recordClick = function () {
        gm.onRowClick();
        gm.selectionChanged();
      }
      if (gm && gm.data.length > 0) {
        gm.timeout(function (row) {
          gm.clearSelectedRows(gm.currentRow);
          gm.currentRow = 0;
          gm.currentSelection = 0;
          gm.moveScrollToRow(0);
          if (!gm.inserting && !gm.editing)
            gm.selectRow(row);
        }, 250, [0]);
      }
    }
  }
};

HTMLGrid.prototype.onFormLoadAction = function () {
  if (!this.masterDefined) {
    this.masterDefined = true;
    this.defineGridMaster();
  }

  if (this.gridMaster) {
    var gm = $c(this.gridMaster);
    if (gm && gm.data.length > 0)
      gm.timeout(gm.selectRow, 250, [0]);
  }
};

HTMLGrid.prototype.defineGridMaster = function () {
  if (this.gridMaster) {
    var gm = $c(this.gridMaster);
    if (gm) {
      gm.addDependentGrid(this.id, this.gridMasterFilter);
    }
  }
};

HTMLGrid.prototype.addDependentGrid = function (gridName, filter) {
  if (!this.dependentGrids)
    this.dependentGrids = [];
  this.dependentGrids.push({ gridName: gridName, filter: filter });
};

HTMLGrid.prototype.selectionChanged = function (e) {
  if (this.canPost()) {
    if (this.disableSelectionRowOnEdit) {
      this.timeout(this.selectRow, 0.5, [this.editRow]);

      return false;
    } else {
      if (controller && controller.activeElement && controller.activeElement.blur) {
        controller.activeElement.blur();
      }
      this.timeout(this.post, 0, []);
    }
  }

  var newSelection = this.getRowDBCursor();
  var newRow = this.getRowNo(true);

  if (this.currentSelection != newSelection && newSelection != -1) {
    if (this.onchange) {
      var realLine = parseInt(this.getSelectedRow());
      if (realLine == -1) {
        this.execEvent(this.onchange, 0, -1, [], [], []);
      } else {
        this.execEvent(this.onchange, newRow, realLine, this.keys[realLine], this.data[realLine], this.queryValues[realLine]);
      }
    }
    if (this.dependentGrids) {
      var gt = newRow;
      if (newSelection == -1)
        gt = 0;
      for (var i = 0; i < this.dependentGrids.length; i++) {
        var gridData = this.dependentGrids[i];
        var url = 'gridEdit.do?sys=' + this.sys + '&param=refreshDependence&formID=' + this.formID + '&comID=' + this.code + '&gt=' + gt + '&dependentGrid=' + gridData.gridName + '&dependentGridFilter=' + URLEncode(gridData.filter, "GET");
        $c(gridData.gridName).setActionFlag(true, false, false, false, false);
        getAndEvalSync2(url);
        $c(gridData.gridName).refreshURL = url;
      }

    }
  }
  this.currentRow = this.getSelectedRow();
  this.currentSelection = this.getRowDBCursor();
};

HTMLGrid.prototype.canPost = function (keyPress) {
  var row = this.currentRow;
  var rowSelected = this.getSelectedRow(keyPress);
  var t = false;
  if (this.dependentGrids)
    t = this.editRow != -1 && rowSelected != this.editRow;
  else
    t = (this.editRow != -1 && row != this.editRow) || (this.editRow != -1 && row != -1 && row != rowSelected);
  return t;
};

function gridImage(u, w, h, componentProperties, gridCode, empty) {
  var id = "grid" + gridCode + "Image" + imageId;
  gridFunctions[id] = componentProperties.onclick;
  imageId++;
  var url = u;
  var hint = componentProperties.hint ? componentProperties.hint : "";
  hint = stringToHTMLString(hint);
  if (url.indexOf("?") != -1) {
    url += "&";
  } else {
    url += "?";
  }
  url += ("dateTime=" + new Date().getTime());

  url += ("&formFilter=" + $mainform().idForm);

  // Fields da tela Ex.: &F_1_1234=valor
  fields = null;
  try {
    fields = controller ? controller.getAllElements() : [];
    for (i = 0; i < fields.length; i++) {
      field = fields[i];
      if(!(field instanceof HTMLRadioGroupOption) && !(field instanceof HTMLGroupBox) && !(field instanceof HTMLPage)){
        if (parseInt(field.getCode()) != -1 && field.getCode() !== undefined && field.getCode() !== "undefined") {
          if(field instanceof HTMLRadioGroup){
            url += "&F_" + i + "_" + field.getCode() + "=" + URLEncode(field.hidden.value, postForceUTF8);
          }else if(field.doc !== undefined){
            if(field.doc.lastChild.id !== "HTMLRadioGroupOptions"){
              url += "&F_" + i + "_" + field.getCode() + "=" + URLEncode(field.getValue(), postForceUTF8);
            }
          }else{
             url += "&F_" + i + "_" + field.getCode() + "=" + URLEncode(field.getValue(), postForceUTF8);
          }
        }
      }
    }
  } catch (e) {
    //Controller nÃ£o existe
  }

  var path = empty ? getAbsolutContextPath() + isomorphicDir : getAbsolutContextPath();
  return { src: path + url, width: 20, height: 18, extraStuff: "id=" + id + " onClick=executeGridComponentEvent(id) alt=" + hint + " title=" + hint + " style=cursor:pointer" };
};

HTMLGrid.prototype.clickGrid = function () {
  if (!this.inserting && !this.editing) {
    controller.activeElement = this;
  }

  if (this.onclick && this.enabled) {
    var relativeRow = this.getSelectedRow();
    var absoluteRow = (this.gridini + relativeRow);
    this.execEvent(this.onclick, absoluteRow, relativeRow, this.keys[relativeRow], this.data[relativeRow], this.queryValues[relativeRow]);
  }
};

HTMLGrid.prototype.executeRowDoubleClick = function () {
  if (!this.ondblclick && !this.editing) {
    controller.activeElement = this;
  }

  if (this.ondblclick && this.enabled) {
    var relativeRow = this.getSelectedRow();
    var absoluteRow = (this.gridini + relativeRow);
    if (this.onclick)
      this.execEvent(this.onclick, absoluteRow, relativeRow, this.keys[relativeRow], this.data[relativeRow], this.queryValues[relativeRow]);
    this.execEvent(this.ondblclick, absoluteRow, relativeRow, this.keys[relativeRow], this.data[relativeRow], this.queryValues[relativeRow]);
  }
}

HTMLGrid.prototype.clickEditableRow = function () {
  this.clickGrid();
};

HTMLGrid.prototype.execEvent = function (func, absoluteRow, relativeRow, keys, data, queryValues) {
  var params = [];

  /**
   * '1' refers to absolute row
   **/
  if (this.eventParams.indexOf(1) != -1) {
    params.push(absoluteRow);
  }

  /**
   * '2' refers to relative row
   */
  if (this.eventParams.indexOf(2) != -1) {
    params.push(relativeRow);
  }

  /**
   * '3' refers to primary keys
   */
  if (this.eventParams.indexOf(3) != -1) {
    params.push(keys);
  }

  /**
   * '4' refers to data values
   */
  if (this.eventParams.indexOf(4) != -1) {
    params.push(this.getValueData(data));
  }

  /**
   * '5' refers to query values
   */
  if (this.eventParams.indexOf(5) != -1) {
    params.push(queryValues);
  }

  func.apply(this, params);
};

HTMLGrid.prototype.showNav = function (show) {
  if (show && !this.bar.visible) {
    this.bar.style.display = null;
    this.bar.visible = true;
  }
}

HTMLGrid.prototype.checkRequireds = function () {
  var arr = eval('document.editComponents' + this.code);
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].required && arr[i].visible && arr[i].input && arr[i].hasEmptyValue()) {
      if (trim(arr[i]._description) != '') {
        interactionError(getLocaleMessage("ERROR.REQUIRED_FIELD", arr[i]._description), function (e) {
          e.getFocus(true);
        }, [arr[i]]);
      } else {
        interactionError(getLocaleMessage("ERROR.REQUIRED_BLANK_FIELD"), function (e) {
          e.getFocus(true);
        }, [arr[i]]);
      }
      this.currentRow = this.editRow;
      return false;
    }

    if (arr[i].cpf && !CPF(arr[i].getValue())) {
      interactionError(getLocaleMessage("ERROR.INVALID_CPF_FIELD", arr[i]._description), function (e) {
        e.getFocus(true);
      }, [arr[i]]);
      return false;
    }
    if (arr[i].cnpj && !CNPJ(arr[i].getValue())) {
      interactionError(getLocaleMessage("ERROR.INVALID_CNPJ_FIELD", arr[i]._description), function (e) {
        e.getFocus(true);
      }, [arr[i]]);
      return false;
    }

    if (arr[i].validateDataType && !arr[i].validateDataType(true))
      return false;

    if (arr[i].canCheckRegularExpression && !isNullable(arr[i].regularExpression) && arr[i].visible && !testRegularExpression(arr[i].getValue(), arr[i].regularExpression)) {
      interactionError(getLocaleMessage("ERROR.INVALID_FIELD_CONTENT", arr[i]._description), function (e) {
        e.getFocus(true);
      }, [arr[i]]);
      return false;
    }
  }
  return true;
};

HTMLGrid.prototype.completeEditRow = function (include) {
  this.editCells = [];
  var editComs = [];
  var ref = this.iscCanvas;
  var tbodies = ref.getBody().getTableElement().getElementsByTagName('tbody');
  var tbody;

  var cont = 0
  while (cont < tbodies.length) {
    tbody = tbodies[cont];
    if (tbody.childElementCount === 0) {
      cont++;
    } else {
      if (tbody.querySelector('[role=listitem]'))
        cont = tbodies.length;
      else
        cont++;
    }
  }

  var rowReference;
  if (include) {
    rowReference = tbody.lastChild;
  } else {
    rowReference = tbody.querySelector('[aria-selected=true]');
  }
  var arr = eval('document.editComponents' + this.code);
  arr = this.reorderComponents(arr);
  //set visible components
  for (var i = 0; i < arr.length; i++) {
    if (!this.columnIsVisible(arr[i].code))
      arr[i].setVisible(false);
  }
  reorderCodeComponents(this, ref.getAllFields());
  createEditComponents(this, arr, rowReference, include, editComs);

  for (var j = this.components.length - 1; j >= 0; j--) {
    orderTab.splice(arrayIndexOf(orderTab, this) + 1, 0, this.components[j]);
  }

  controller.sortOrderTab();
  this.paging.setVisible(false);
  let _colIdx =  (this.editing && this.colDoubleClicked) ? this.colDoubleClicked : undefined;
  this.timeout(this.focusInEdit, 100, [editComs, _colIdx]);
  editComs = null;
};

function createEditComponents(grid, arr, rowReference, include, editComs) {
  var ref = grid.iscCanvas;
  var colNum = ref.showRowNumbers === true ? 1 : 0;
  var count = ref.showRowNumbers ? 1 : 0;
  var fields = ref.fields;
  var allFields = ref.getAllFields();
  let arrElems = new Array();

  for (colNum; colNum < fields.length; colNum++) {
    var elem = getComponent(arr, fields[colNum].cod);
    if (elem) {
      var template = rowReference.children[colNum];
      editComs.push(grid.editCell(template, false, colNum, include));

      var element = template.firstElementChild;
      if (!element) {
        grid.cancel();
        return;
      }

      elem.design(template, true);
      element.style.display = "none";
      arrElems.push(element);

      if (elem instanceof HTMLLookup || elem.typeName === 'datetime' || elem.typeName === 'date' || elem instanceof HTMLImage) {
        elem.div.style.position = "relative";
      } else elem.div.style.position = "inherit";
      if (elem instanceof HTMLCheckbox) {
        elem.divClass = "d-flex align-items-center justify-content-center"; // Bootstrap
        elem.div.className = elem.divClass;
      } else elem.div.style.display = "grid";
    }
  }

  for (count; count < allFields.length; count++) {
    if (!(allFields[count].name == "groupTitle") && !allFields[count].visible || (allFields[count].showIf && !parseBoolean(allFields[count].showIf))) {
      elem = getComponent(arr, allFields[count].cod);
      elem.design(document.body);
    }
  }

  grid.elements_Of_Grid = arrElems;
}

HTMLGrid.prototype.reorderComponents = function (arr) {
  var newOrderElemenst = [];
  var codes = this.components;
  for (i = 0; i < arr.length; i++) {
    var code = codes[i];
    for (j = 0; j < arr.length; j++) {
      if (code == arr[j].getCode()) {
        newOrderElemenst.add(arr[j]);
        break;
      }
    }
  }
  return newOrderElemenst;
};

HTMLGrid.prototype.editCell = function (template, notedit, idx, include) {
  var row = -1;
  if (include)
    row = this.iscCanvas.getEditRow();
  else
    row = this.getSelectedRow();
  if (row == -1) {
    throw getLocaleMessage("INFO.GRID_RECORD_SELECT");
  }

  var x, y, w, h;
  w = template.offsetWidth;
  h = template.offsetHeight;

  var editor = eval('document.c_' + this.iscCanvas.fields[idx].cod);
  editor._row = row;
  editor.height = h;
  editor.width = w;
  editor.posX = x;
  editor.posY = y;
  editor.tabindex = parseFloat(this.tabindex + '.' + decimalFormat(idx, 5));
  editor._description = editor.description;
  editor.description = '';
  editor.template = template;
  editor.grid = this.grid;
  editor.parent = this;
  editor.toGrid = true;
  editor.onfocusGrid = editor.onfocus;
  if (!editor.field && !editor.isBinary) {
    let fields = this.iscCanvas.fields;
    var value = this.data[row][fields[idx].name];
    value = (value != "&nbsp;" ? value : "");
    editor.setGridValue(value);
  }
  if (!notedit && this.nav.getMode() == 0)
    this.nav.edit();
  this.editRow = row;
  return editor;
};

HTMLGrid.prototype.focusElement = function (o, elems) {
  var e = o;
  if (o != null) {
    var i = arrayIndexOf(elems, o);
    while (!e.getFocus(true)) {
      document.fromDblClick = false;
      i++;
      if (i > elems.length - 1)
        i = 0;
      e = elems[i];
      if (o == e) {
        e.getFocus(true);
        break;
      }
    }
  }
};

HTMLGrid.prototype.keydownAction = function (e) {
  var keyCode = e.keyCode || e.which;
  if ((this.editRow != -1) && this.disableSelectionRowOnEdit) {
    if (
      (keyCode == 35 /*END*/) || (keyCode == 36 /*HOME*/) ||
      (keyCode == 38 /*UP*/) || (keyCode == 40 /*DOWN*/) ||
      (keyCode == 33 /*PAGE UP*/) || (keyCode == 34 /*PAGE DOWN*/)
    ) {
      return false;
    }
  } else if (this.editing || this.inserting) {
    if (keyCode === 35 || keyCode === 36)
      return true;
  } else if ((!this.editing || !this.inserting) && this.enableSimpleFilter && keyCode === 13) {
    const canvas = this.iscCanvas;
    canvas.filterData(canvas.getFilterEditorCriteria());
    return false;
  } else if ((!this.editing || !this.inserting) && this.enableSimpleFilter && keyCode === 9) {

    return false;
  }
  this.gridKeyPress(e);
};

HTMLGrid.prototype.getLengthData = function () {
  var sub = !this.showGroupSummary ? 1 : this.showGroupSummaryInHeader && this.showCollapsedGroupSummary ? 1 : 2;
  if (this.isGrouped()) {
    return (this.iscCanvas.groupTree.getAllItems().length - sub) - (this.showGroupSummaryInHeader && this.showCollapsedGroupSummary
      ? 0
      : (eval(this.iscCanvas.getGroupState()).length - 1));
  }else if (this.isFiltered) {
    return this.iscCanvas.getOriginalData().length - 1;
  } else {
    return this.data.length - 1;
  }
};

HTMLGrid.prototype.gridKeyPress = function (evt) {
  var altKey = false;
  var ctrlKey = false;
  var shiftKey = false;
  var target = evt.target || evt.srcElement;
  var keyCode = evt.keyCode || evt.which;
  var targtype = target.type;
  var chr = String.fromCharCode(keyCode).toUpperCase();

  if (w3c) {
    if (document.layers) {
      altKey = ((evt.modifiers & Event.ALT_MASK) > 0);
      ctrlKey = ((evt.modifiers & Event.CONTROL_MASK) > 0);
      shiftKey = ((evt.modifiers & Event.SHIFT_MASK) > 0);
    } else {
      altKey = evt.altKey;
      ctrlKey = evt.ctrlKey;
      shiftKey = evt.shiftKey;
    }
  } else {
    altKey = evt.altKey;
    ctrlKey = evt.ctrlKey;
    shiftKey = evt.shiftKey;
  }

  if (this.canPost(true) && this.disableSelectionRowOnEdit) {
    if ((keyCode == 35 /*END*/) || (keyCode == 36 /*HOME*/) || (keyCode == 38 /*UP*/) || (keyCode == 40 /*DOWN*/)) {
      return false;
    }
  }

  var r = true;

  if (!this.editing && !this.inserting && ((keyCode == 33 /*PAGE UP*/) || (keyCode == 34 /*PAGE DOWN*/))) {
    var increment = keyCode == 33 ? -10 : 10;
    var row = this.getSelectedRow(true) == -1 ? this.currentRow : this.getSelectedRow(true);
    var newSelectRow = row + increment;
    if (keyCode == 33) {
      this.currentRow = newSelectRow < 0
        ? 0
        : newSelectRow;
    } else {
      this.currentRow = newSelectRow > this.data.length - 1
        ? this.data.length - 1
        : newSelectRow;
    }
    this.clearSelectedRows(row);
    this.selectRow(this.currentRow);
    this.moveScrollToRow(this.currentRow);
    this.selectionChanged();
    r = false;
  }

  if (!this.editing && !this.inserting && (keyCode == 35 || keyCode == 36)) {
    var row = this.getSelectedRow(true);
    this.clearSelectedRows(row);
    this.currentRow = keyCode == 35
      ? this.getLengthData()
      : 0;
    this.selectRow(this.currentRow);
    this.moveScrollToRow(this.currentRow);
    this.selectionChanged();
  }

  if (((!altKey && !ctrlKey && keyCode == 27))) { //Cancelar
    this.cancel();
    r = false;
  }

  else if (!altKey && ctrlKey && (keyCode == 45 || chr == 'I')) { //Insert
    if (!this.editable && this.callForm) {
      this.timeout(this.openNormalForm, 0, [true]);
    } else if (Object.keys(gridFieldsConfig[this.id]["frozenFields"]).length > 0) {
      return false;
    } else {
      if (this.editing || this.inserting) {
        if (controller && controller.activeElement) {
          controller.activeElement.blur();
        }
        this.timeout(this.post, 0, [true]);
      } else {
        this.include();
      }
    }
    r = false;
  }

  else if (ctrlKey && keyCode == 116) {
    window.location.reload(true);
  }

  else if (!altKey && ctrlKey && chr == 'E') { //Edit
    if (!this.editable && this.callForm) {
      this.timeout(this.openNormalForm, 0, [this]);
    } else if (Object.keys(gridFieldsConfig[this.id]["frozenFields"]).length > 0) {
      return false;
    }
    else {
      if (this.editing || this.inserting) {
        if (controller && controller.activeElement) {
          controller.activeElement.focus();
        }
      } else {
        this.edit();
      }
    }
    r = false;
  }

  else if (!altKey && ctrlKey && chr == 'S') { //Gravar
    if (this.editing || this.inserting) {
      if (controller && controller.activeElement) {
        controller.activeElement.blur();
      }
      this.timeout(this.post, 0);
      r = false;
    }
  }

  else if (!altKey && ctrlKey && (chr == '+' || chr == '=' || keyCode == 187 || chr == 'G')) { //Gravar +
    if (this.editing || this.inserting) {
      if (controller && controller.activeElement) {
        controller.activeElement.blur();
      }
      this.timeout(this.post, 0);
      r = false;
    }
  }

  else if (!altKey && ctrlKey && (keyCode == 46 || chr == 'D')) { //Delete
    if (Object.keys(gridFieldsConfig[this.id]["frozenFields"]).length > 0) {
      return false;
    }
    if ((!this.editing || (this.editing == undefined)) && (!this.inserting || (this.inserting == undefined))) {
      this.deleteRow();
    }
    r = false;
  }

  else if (keyCode == 40 && (this.getSelectedRow(true) == this.getLengthData())) {
    if (Object.keys(gridFieldsConfig[this.id]["frozenFields"]).length > 0)
      return false;
    if (this.editing || this.inserting) {
      if (controller && controller.activeElement) {
        controller.activeElement.blur();
      }
      this.timeout(this.post, 0, [true]);
    } else {
      this.include();
    }

    r = false;
  }

  else if (keyCode == 40 && this.editing) {
    if (Object.keys(gridFieldsConfig[this.id]["frozenFields"]).length > 0)
      return false;
    if (controller && controller.activeElement) {
      controller.activeElement.blur();
    }
    let line = this.currentRow += 1;
    this.timeout(this.post, 0[false]);
    r = false;
  }

  else if (!altKey && !ctrlKey && keyCode == 39 && (!this.editing && !this.inserting)) { //PrÃ³xima pÃ¡gina
    if (this.paging && this.paging.btNext.visible && !this.paging.btNext.disabled)
      this.paging.btNext.action.click();
    this.timeout(this.gridFocus, 100);
    r = false;
  }

  else if (!altKey && !ctrlKey && keyCode == 37 && (!this.editing && !this.inserting)) { //PÃ¡gina Anterior
    if (this.paging && this.paging.btPrevious.visible && !this.paging.btPrevious.disabled)
      this.paging.btPrevious.action.click();
    this.timeout(this.gridFocus, 100);
    r = false;
  }

  else if (!altKey && ctrlKey && keyCode == 39) { //Ãšltima pÃ¡gina
    if (this.paging && this.paging.btLast.visible && !this.paging.btLast.disabled)
      this.paging.btLast.action.click();
    r = false;
  }

  else if (!altKey && ctrlKey && keyCode == 37) { //Primeira pÃ¡gina
    if (this.paging && this.paging.btFirst.visible && !this.paging.btFirst.disabled)
      this.paging.btFirst.action.click();
    r = false;
  }

  else if (!altKey && !ctrlKey && keyCode == 112) { // F1
    if (target && !isNullable(target.hint)) {
      var func = function () {
        try {
          target.focus();
        } catch (ex) {
        }
      };
      interactionInfo(target.hint, func);
    } else if (!isNullable(this.hint)) {
      interactionInfo(this.hint, this.gridFocus, [evt], this);
    }
    r = false;
  }

  if (r)
    r = checkKey(evt, this, this.tabKeys);

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
  } else
    return true;
};

HTMLGrid.prototype.checkCmd = function (field, row, column) {
  var gridrn = this.getSelectedRow();
  if (gridrn > this.data.length - 1)
    gridrn = -2;

  var gt = this.getRowNo();
  if (gt <= 0) {
    this.focusColumn = 0;
    gt = (this.gridini + 1);
  }
  getAndEvalSync("gridEdit.do?sys=" + this.sys + "&formID=" + this.formID + "&comID=" + this.code + "&param=checkCmd&fieldID=" + field + "&row=" + row + "&column=" + column + "&gt=" + gt);
};

HTMLGrid.prototype.postCheckOption = function (com, state, valueCheck, valueUnCheck, row, img) {
  if (this.editing || this.inserting || !this.enabled || this.readonly)
    return;
  var checked = state == 1;

  var removeRuleErrors = true;
  var gt = this.getRowNo(true);
  var url = 'gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=post&formID=' + this.formID + '&comID=' + this.code + '&gt=' + gt + '&gridComID=-1&storedProcedureName=&storedProcedureParams=&align=0&postSameIfNotPresent=true&checkBoxPost=true';
  url += '&checkCode=' + com + '&WFRInput' + com + '=' + URLEncode(checked ? valueUnCheck : valueCheck, "GET");
  url += '&line=' + this.getRowIgnoreState();

  var gridrn = gt - parseInt(this.gridini) - 1;

  this.completePostCheckOption = this.getAction(this.completePostCheckOptionAction, [com, state, valueCheck, valueUnCheck, row, img, gridrn]);
  this.navWasVisible = this.paging.getVisible();
  getAndEvalSync(url);
};

HTMLGrid.prototype.completePostCheckOptionAction = function (com, state, valueCheck, valueUnCheck, row, img, gridrn) {

  if (parseInt(state) == 0 || parseInt(state) == 2) {
    state = 1;
  } else if (parseInt(state) == 1) {
    state = 0;
  }
  var idx = arrayIndexOf(this.components, com);
  this.data[gridrn]["field" + com] = this.gridCheckBox(state, valueCheck, valueUnCheck, com, row);
};

HTMLGrid.prototype.executeCheckCmd = function (ref, row, col) {
  var fieldTitle = ref.iscCanvas.fields[col].title;
  var col = this.findColumn(fieldTitle);
  col = ref.iscCanvas.showRowNumbers ? col - 1 : col;
  var column = ref.components[col]
  var key = column + "_" + (this.getRowDBCursor() + this.gridini + 1);
  var cmd = gridChecks[key];
  if (cmd)
    eval(cmd);
  return false;
};

HTMLGrid.prototype.onRowClick = function () {
  this.clickEditableRow();
  this.selectionChanged();
};

HTMLGrid.prototype.saveSize = function (colIndex, name) {
  var columns = this.iscCanvas.getAllFields();
  var newSize = this.iscCanvas.getFieldWidth(colIndex);
  colIndex = columns.findIndex(function (c) { return c.name === name });
  colIndex = this.iscCanvas.showRowNumbers ? (colIndex - 1) : colIndex;
  if (!this.disableUserCustomize && loggedUserWithProfile) {
    getAndEvalSync('gridEdit.do?sys=' + this.sys + '&action=gridEdit&param=setsize&formID=' + this.formID + '&comID=' + this.code + '&gt=-1&fieldID=' + this.components[colIndex] + '&size=' + pt(newSize));
  }
};

HTMLGrid.prototype.flush = function () {
  recursiveFlush(this);
};

HTMLGrid.prototype.checkDoubleClick = function (ref) {
  if (!ref.editing && !ref.inserting) {
    controller.activeElement = ref;
    if (ref.ondblclick && ref.enabled && ref.data.length === 0) {
      ref.execEvent(ref.ondblclick, -1, -1, [], [], []);
    }
    if (!ref.ondblclick || !ref.doubleClickOnly) {
      if (ref.editable && (!ref.lockEditable)) {
        if (ref.data.length !== 0)
          ref.edit();
      } else if (ref.callForm) {
        ref.openNormalForm();
      }
    }
  }
};

HTMLGrid.prototype.order = function (field, desc) {
  var idx = field;
  var type = desc;
  this.setActionFlag(false, false, false, true, false);
  if (isNumeric(field)) {
    field = this.iscCanvas.fields[idx].cod;
    this.ordered = { index: idx, desc: desc };
  }
  getAndEvalSync2('gridEdit.do?sys=' + this.sys + '&param=order&formID=' + this.formID + '&comID=' + this.code + '&field=' + field + '&type=' + type);

};

HTMLGrid.prototype.isFieldVisible = function (fieldName) {
  var gridConfig = gridFieldsConfig[this.id];
  for (var i = 0; i < gridConfig["hiddenFields"].length; i++)
    if (gridConfig["hiddenFields"][i] === fieldName)
      return false;
  return true;
};
function postCheckOption(grid, com, state, valueCheck, valueUnCheck, row, img) {
  var obj = controller.getElementByCode(grid);
  obj.timeout(obj.postCheckOption, 0, [com, state, valueCheck, valueUnCheck, row, img]);
};

HTMLGrid.prototype.focusInEdit = function (editComs, idxCol) {
  if (idxCol) {
    if(editComs[idxCol].getFocus())
      return;
    else
      this.focusInEdit(editComs, (idxCol+1 < editComs ? idxCol+1 : editComs.length -1));
  } else {
    const size = editComs.length;
    for (var i=0; i < size; i++) {
      if(editComs[i].getFocus()){
        break;
      }
    }
  }
};

HTMLGrid.prototype.vScrollSetDisabled = function (disable) {
  if (this.iscVScroll === undefined) {
    this.iscVScroll = this.iscCanvas.body.vscrollbar;
    if (this.iscVScroll) this.iscVScroll.autoEnable = false;
  }
  if (this.iscVScroll) {
    this.iscVScroll.setDisabled(disable);
    this.iscVScroll.autoEnable = false;
    this.div.onwheel = function () { return !disable; }
  }
};

HTMLGrid.prototype.hScrollSetDisabled = function (disable) {
  if (this.iscHScroll === undefined) {
    this.iscHScroll = this.iscCanvas.body.hscrollbar;
    if (this.iscHScroll) this.iscHScroll.autoEnable = false;
  }
  if (this.iscHScroll) {
    this.iscHScroll.setDisabled(disable);
    this.iscHScroll.autoEnable = false;
  }
};

HTMLGrid.prototype.hasFrozenFieldVisible = function () {
  var gridConfig = gridFieldsConfig[this.id];
  var keys = Object.keys(gridConfig["frozenFields"]);
  if (gridConfig) {
    if (keys.length <= 0) return false;
    for (var i = 0; i < keys.length; i++)
      if (this.isFieldVisible(keys[i]))
        return true;
  }
  return false;
}

HTMLGrid.prototype.scrollLeft = function (value) {
  this.iscCanvas.body.scrollBy(value, 0);
};

HTMLGrid.prototype.scrollTop = function (value) {
  if (!this.editing && !this.inserting)
    this.iscCanvas.body.scrollBy(0, value);
};

HTMLGrid.prototype.getHorizontalScrollPosition = function () {
  return this.iscCanvas.body.getScrollLeft();
};

HTMLGrid.prototype.getVerticalScrollPosition = function () {
  return this.iscCanvas.body.getScrollTop();
};

HTMLGrid.prototype.readingHiddenFields = function () {
  var i = 0;
  var sc = this.columns.length;
  var hideFields = [];
  while (sc > i) {
    if (this.columns[i].showIf == "false")
      hideFields.push(this.columns[i].name);
    i++;
  }
  return hideFields;
};

HTMLGrid.prototype.focus = function () {
  var r = this.enabled && this.visible && !this.readonly;
  if (this.doc)
    r = r && isVisibleDiv(this.doc);
  if (r) {
    this.hasFocus = true;
    this.gridFocus();
  }
  return r;
};

HTMLGrid.prototype.focusChanged = function (hasFocus) {
  this.hasFocus = hasFocus;
  this.performFocus();
}

HTMLGrid.prototype.performFocus = function () {
  this.iscCanvas.setBorder(this.hasFocus || this.editing || this.inserting ? "1px solid " + this.getPrimaryColor() : "1px solid #ededed");
  if (this.hasFrozenFieldVisible() && this.iscCanvas.frozenBody) {
    this.iscCanvas.frozenBody.getStyleHandle().borderRight = "1px solid #ededed";
  }
}

HTMLGrid.prototype.freezeColumn = function (fieldName) {
  var idx = this.findVisibleColumn(fieldName);
  var ref = this.iscCanvas;
  fieldName = this.getRealNameColumn(fieldName);
  var gridConfig = gridFieldsConfig[this.id];
  gridConfig["frozenFields"][fieldName] = idx;
  ref.freezeField(fieldName);
  this.nav.setEnabled(false);
  this.focus();
  ref.getBody().scrolled = function () {
    var ref = $c(this.creator.ID);
    if (!ref.hasFocus && !ref.inserting && !ref.editing)
      this.creator.focus();
  };
  var frozenFields = Object.keys(gridConfig["frozenFields"]).length - 1;
  var delta = ref.showRowNumbers ? frozenFields - idx + 1 : frozenFields - idx;
  this.adjustFilterEditorButton();
  this.upGrid(idx, delta);
};

HTMLGrid.prototype.unfreezeColumn = function (title) {
  this.performFocus();
  fieldName = this.getRealNameColumn(title);
  var ref = this.iscCanvas;
  var gridConfig = gridFieldsConfig[this.id];
  var fields = ref.fields;
  ref.unfreezeField(fieldName);
  this.adjustFilterEditorButton();
  ref.reorderField(this.findColumn(title), gridConfig["frozenFields"][fieldName]);
  delete gridConfig["frozenFields"][fieldName];
  gridConfig["fieldsSizes"] = {};

  //save fields sizes
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (field.name)
      gridConfig["fieldsSizes"][field.name] = field.width;
  }
  //save field order
  gridConfig["fieldOrder"] = this.getFieldsOrder();

  this.timeout(this.selectRow, 0, [this.currentRow]);
  this.focus();
  if (Object.keys(gridConfig["frozenFields"]).length === 0)
    this.nav.setEnabled(true);
};

HTMLGrid.prototype.checkPost = function () {
  if (this.editing || this.inserting) {
    interactionError(getLocaleMessage("INFO.GRID_EDIT_FINALIZE"), function () {
      arguments[0].getFocus(true);
    }, [this]);
    return false;
  }
  return true;
};

/**
 * MÃ©todo responsÃ¡vel por reordenar uma coluna.
 * @author Janpier
 * @param old posiÃ§Ã£o antiga.
 * @param delta Quantas colunas foram movidas.
 */
HTMLGrid.prototype.upGrid = function (old, delta) {
  if (!this.disableUserCustomize && loggedUserWithProfile) {
    if (delta && delta !== 0 && this.ActUpGrid && !this.noRefresh) {
      var ref = this.iscCanvas;
      var formID = this.formGUID + "_" + this.id;
      var columns = this.columnsUpGrid(ref.getAllFields());
      gridSendCommand('upGrid.do?sys=' + sysCode + '&action=upGrid&formID=' + encodeURI(formID) +
        '&comID=' + this.code + '&columns=' + URLEncode(columns, 'UTF8'));
      reorderCodeComponents(this, ref.getAllFields());
    }
  }
};

/**
 * MÃ©todo responsÃ¡vel por montar o JSON que salva as costumizaÃ§Ãµes do usuÃ¡rio.
 * @author Janpier
 * @param fields colunas da grade.
 * @return texto JSON.
 */
HTMLGrid.prototype.columnsUpGrid = function (fields) {
  var newJsonColumns = [];
  var i = this.iscCanvas.showRowNumbers ? 1 : 0;
  var size = fields.length;
  for (i; i < size; i++) {
    if(!fields[i].comp) continue;
    var pJson = {};
    pJson['field'] = fields[i].comp;
    pJson['show'] = fields[i].showIf === 'true' ? '1' : '0';
    pJson['size'] = "" + fields[i].width;
    newJsonColumns.push(pJson);
  }
  return JSON.stringify(newJsonColumns);
};
/**
 * MÃ©todo responsÃ¡vel por mostrar ou ocultar uma coluna.
 * @author Janpier
 * @param num nÃºmero da coluna
 * @param value 1 ou 0 para mostrar ou nÃ£o a coluna.
 * @param comp componente responsÃ¡vel pela coluna no formulÃ¡rio
 */
HTMLGrid.prototype.setGrid = function (num, value, comp) {
  if (!this.disableUserCustomize && loggedUserWithProfile) {
    var formID = this.formGUID + '_' + this.id;
    gridSendCommand('setGrid.do?sys=' + sysCode + '&action=setGrid&formID=' + encodeURI(formID) + '&num=' + num + '&formCode=' + this.formCode + '&comp=' + comp + '&value=' + value);
  }
};


/**
 * MÃ©todo responsÃ¡vel por fazer com que a grade volte ao estado inicial.
 * @author Janpier
 */
HTMLGrid.prototype.defaultGrid = function () {
  var formID = this.formGUID + "_" + this.id;
  var id = this.id + "Loading";
  var parent = this.div;
  gridLoading(id, parent);
  gridSendCommand('revertDefaultGrid.do?sys=' + sysCode + '&action=revertDefaultGrid&param=cancel&formID=' + encodeURI(formID) + '&formCode=' + URLEncode(this.formID, 'GET') + '&comID=' + this.getCode(),
    id, parent);
  gridUpdateFieldsConfig(this.id);
}


HTMLGrid.prototype.getFieldsOrder = function () {
  var order = [];
  var ref = this.iscCanvas;
  var i = ref.showRowNumbers ? 1 : 0;
  var fields = ref.getAllFields();
  for (var i; i < fields.length; i++) {
    order.push(fields[i].name);
  }
  return order;
};

HTMLGrid.prototype.showGridSummaryRow = function (show) {
  var ref = this.iscCanvas;
  if (show) {
    this.showGridSummary = true;
    ref.showGridSummary = true;
    ref.showSummaryRow();
  } else {
    this.showGridSummary = false;
    ref.showGridSummary = false;
    ref.clearSummaryRow();
  }
};

HTMLGrid.prototype.enableOrDisableGroup = function (enable) {
  var ref = this.iscCanvas;
  if (enable === true) {
    ref.canGroupBy = true;
    this.groupBy = true;
  } else {
    ref.canGroupBy = false;
    this.groupBy = false;
  }
};

HTMLGrid.prototype.getNameGroups = function () {
  var ref = this.iscCanvas;
  if (this.isGrouped()) {
    var arrNames = [];
    ref.data.getFolders().map(function (item) {
      arrNames.add(item.groupValue);
    });
  }
  return arrNames ? arrNames : null;
};

HTMLGrid.prototype.getValueInSummary = function (value) {
  var ref = this.iscCanvas;
  if (ref.showGridSummary) {
    var value = ref.getGridSummaryData()[0][this.getRealNameColumn(value)];
    return value ? value : "";
  }
  return null;
};

HTMLGrid.prototype.getValueInSummaryGroup = function (group, column) {
  var ref = this.iscCanvas;
  if (typeof group === "string") {
    group = this.getSpecificGroup(group);
  }
  var field = ref.fields.find("name", this.getRealNameColumn(column));
  if (group && (field.showGroupSummary || field.showGroupSummary === undefined)) {
    var value = ref.getGroupSummaryData(this.getRecordsInGroup(group))[0][this.getRealNameColumn(column)];
    return value ? value : "";
  }
  return null;
};

HTMLGrid.prototype.getSpecificGroup = function (nameGroup) {
  var ref = this.iscCanvas;
  if (this.isGrouped()) {
    return ref.data.getFolders().find("groupValue", nameGroup);
  }
};

HTMLGrid.prototype.getRecordsInGroup = function (group) {
  var ref = this.iscCanvas;
  if (typeof group === "string") {
    group = this.getSpecificGroup(group);
  }
  if (group && this.isGrouped()) {
    return ref.data.getRecordsInGroup(group);
  }
};

HTMLGrid.prototype.openGroup = function (group) {
  var ref = this.iscCanvas;
  if (group && this.isGrouped()) {
    var it;
    it = typeof group === "string" ? ref.data.getFolders().find("groupValue", group) : group;
    if (it && !ref.data.isOpen(it)) {
      ref.openFolder(it);
    }
  }
};

HTMLGrid.prototype.openAllGroups = function () {
  var ref = this.iscCanvas;
  if (this.isGrouped()) {
    ref.groupTree.openAll();
  }
};

HTMLGrid.prototype.closeGroup = function (group) {
  var ref = this.iscCanvas;
  if (group && this.isGrouped()) {
    var it;
    it = typeof group === "string" ? ref.data.getFolders().find("groupValue", group) : group;
    if (it && ref.data.isOpen(it)) {
      ref.closeFolder(it);
    }
  }
};

HTMLGrid.prototype.pathGetDescendent = function (path, reverse) {
  var ref = this.iscCanvas;
  var oldElem;
  var groups = [];
  var root = ref.data.getFolders().find("groupValue", path[0]);
  for (let index = 0; index < path.length; index++) {
    const group = path[index];
    if (index == 0) {
      it = root;
    } else {
      if (oldElem)
        it = oldElem.groupMembers.find("groupValue", group);
    }
    if (it) {
      groups.add(it);
    }
    oldElem = it;
  }
  return reverse ? groups.slice(0).reverse() : groups;
}

HTMLGrid.prototype.closeAllGroups = function () {
  var ref = this.iscCanvas;
  if (this.isGrouped()) {
    ref.groupTree.closeAll();
  }
};

HTMLGrid.prototype.group = function (colName) {
  var ref = this.iscCanvas;
  if (ref.groupBy && ref.canGroupBy) {
    var realName = this.getRealNameColumn(colName) == -1 ? "" : this.getRealNameColumn(colName);
    var groups = ref.getGroupByFields() ? ref.getGroupByFields() : [];
    if (realName != -1 && !groups.contains(realName)) {
      if (!groups || !ref.canMultiGroup)
        groups = [];
      groups.push(realName);
      ref.groupBy(groups);
      ref.deselectAllRecords();
      this.currentRow = -1;
    }
  }
};

HTMLGrid.prototype.ungroup = function (colName) {
  var ref = this.iscCanvas;
  if (ref.groupBy && ref.canGroupBy) {
    var realName = this.getRealNameColumn(colName);
    var groups = ref.getGroupByFields();
    if (groups && colName) {
      if (groups.indexOf(realName) != -1)
        groups.splice(groups.indexOf(realName), 1);
    } else {
      this.groups = [];
      groups = [];
    }
    ref.groupBy(groups);
  }
};

HTMLGrid.prototype.isGrouped = function () {
  return this.iscCanvas.isGrouped > 0 ? true : false;
};

/**
 * Essa funÃ§Ã£o retorna o real index de um linha na grade dependendo do seu estado atual.
 * @author Janpier
 * @param record linha que estÃ¡ selecionada.
 * @return index da linha.
 */
HTMLGrid.prototype.getRecordRealIndex = function (record) {
  let rows;
  if ((this.startedEdition || this.dependentGrids) && !this.isGrouped())
    rows = this.iscCanvas.getOriginalData().getAllRows();
  else
    rows = this.iscCanvas.groupTree.getAllItems();
  return rows.findIndex(function (elem) { return elem.row === record.row });
};

HTMLGrid.prototype.getAllGroups = function () {
  return this.iscCanvas.groupTree.getChildren();
}

HTMLGrid.prototype.openGroupConfig = function () {
  var ref = this.iscCanvas;
  if (ref.groupBy && ref.canGroupBy && ref.canMultiGroup) {
    this.iscCanvas.configureGrouping();
  }
}

HTMLGrid.prototype.afterInit = function() {
  this.callMethod(HTMLElementBase, "afterInit", []);
  if (d.n && d.n.responsive) {
    this.gridResizeResponsive();
  }
};

HTMLGrid.prototype.gridResizeResponsive = function() {
  var grid = this;
  var docWidth = 0, data = null;
  var frame = null;
  if (this.tab && this.tab.selected) {
    if (this.doc.offsetWidth === 0) {
      let floatingForms = getFrameInFloatingForms(this.formGUID);
      data = getWidthInFrame(this, floatingForms);
      if (data && data.find) {
        docWidth = this.container.length > 0 ? this.doc.clientWidth === 0 ?
          ((parseFloat(this.doc.style.width) / 100) * data.width) : this.doc.clientWidth : data.width;
        frame = data.frame;
      } else if (this.container) {
        docWidth = this.doc.clientWidth;
      }
    } else {
      docWidth = this.doc.offsetWidth;
    }

    this.iscCanvas.setWidth(parseInt(docWidth) * (parseFloat(this.div.style.width) / 100));

    if (data && data.find) {
      if (data.none) frame.style.display = "none"; // Volta o frame ao seu estado anterior;
      frame.style.removeProperty("visibility");
      if (data.window && data.window.mainform) data.window.mainform.addEventListener("resize", function() {
        gridResize(grid);
      }, false);
    }
  }
  if (!this.resizeEventSet) {
    mainform.addEventListener("resize", function() {
      if (grid) gridResize(grid);
    }, false);
    this.resizeEventSet = true;
  }

  if (this.tab) {
    // Adicionar callback na aba quando ela for exibida.
    this.tab.addShownListener(function() {
      this.timeout(function(){gridResize(grid)}, 0);
    });
  }

  if (frame && frame.tab) {
    frame.tab.addShownListener(function() {
      gridResize(grid);
    });
  }

  // Verificar se o formulÃ¡rio estÃ¡ aberto num componente Aba.
  var tabLiElem = getFormParentTabComponentTab();
  if (tabLiElem) {
    var tabAElem = tabLiElem.getElementsByTagName("a");
    if (tabAElem && tabAElem.length > 0) {
      // Associar evento de clique ao botÃ£o da aba do componente Aba.
      tabAElem[0].addEventListener("click", function() {
        // Atualizar layout da grade.
        gridResize(grid);
      });
    }
  }

  window.addEventListener("load", function() {
    gridResize(grid);
  });
};

/**
 * MÃ©todo responsÃ¡vel por realizar o resize das colunas da grade.
 * @author Janpier.
 * @param resizeGrid percentual para resize.
 */
HTMLGrid.prototype.resizeColumns = function(resizeGrid) {
  if (!this.userCustomColumnWidth) {
    if (this.tab && !this.tab.selected) return;
    let gridColumns = this.iscCanvas.getAllFields();
      for (var i = this.iscCanvas.showRowNumbers ? 1 : 0; i < gridColumns.length; i++) {
      gridColumns[i].width = Math.round(gridColumns[i].width * resizeGrid);
    }
    this.iscCanvas.setFields(gridColumns);

  }
};

/**
 * MÃ©todo responsÃ¡vel por realizar o ajuste do botÃ£o de filtro
 * @author Marcos.
 */
HTMLGrid.prototype.adjustFilterEditorButton = function(){
  if(this.iscCanvas.filterEditor){
    this.iscCanvas.filterEditor.actionButton.setStyleName("buttonFilterEditor");
  }
}

function decimalFormat(value, qtt) {
  if (qtt <= 0) {
    return value;
  }

  if (isNullable(value)) {
    value = "";
    while (qtt-- > 0) {
      value += "0";
    }
    return value;
  }

  value = new String(value);

  if (value.length == qtt) {
    return value;
  }

  if (value.length > qtt) {
    return value.substring(0, qtt);
  }

  qtt -= value.length;
  while (qtt-- > 0) {
    value = "0" + value;
  }

  return value;
};


function gridExportData(comp, type) {
  $c(comp).exportData(type);
  return false;
};

function gridLoading(id, parent, child) {
  if (!parent) parent = mainform.document.body;
  var spinner = bootstrapCreateSpinner(parent, null, true);
  spinner[0].id = child ? id : "overlay";
};

function gridRemoveLoading(id, parent, child) {
  if (!parent) parent = mainform.document.body;
  var spinner = mainform.document.getElementById(id);
  if (!spinner) spinner = mainform.document.getElementById("overlay");
  parent.removeChild(spinner);
};

function gridDownloadFileData(response, type) {
  type = type === "LST" ? "html" : type;
  var blob = new Blob([response], { type: 'application/octet-binary' });
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, "result." + type.toLowerCase());
    return false;
  }
  var a = mainform.document.createElement('a');
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = "result." + type.toLowerCase();
  mainform.document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  mainform.document.body.removeChild(a);
};

function reorderCodeComponents(comp, fields) {
  var count = comp.iscCanvas.showRowNumbers ? 1 : 0;
  var codes = [];
  while (count < fields.length) {
    if (fields[count].cod !== undefined)
      codes.add(fields[count].cod);
    count++;
  }
  comp.components = codes;
};

function getComponent(arr, code) {
  var sizeArr = arr.length;
  for (var i = 0; i < sizeArr; i++) {
    if (arr[i].getCode() === code)
      return arr[i];
  }
  return null;
};

function gridShowMessage(type, title, msg, time) {
  var message = new mainform.HTMLMessage();
  if (type.toUpperCase() === 'W')
    message.showWarningMessage(title, msg, time);
  else
    message.showErrorMessage(title, msg, time);
  return false;
};

function gridSendCommand(url, id, parent, notException, callback, grid, updateColumns, child) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (id)
          if(child)
            gridRemoveLoading(id, parent, "_overlay_" + child);
          else
            gridRemoveLoading(id, parent);
        if (this.response !== ''){
          if(callback)
            return callback(this.responseText, grid, updateColumns);
          eval(this.response);
        }
      }
    }
  };
  xhr.onerror = function (e) {
    if (id)
      if(child)
        gridRemoveLoading(id, parent, "_overlay_" + child);
      else
      gridRemoveLoading(id, parent);
    if(!notException){
      var msg = new HTMLMessage();
      msg.showErrorMessage("", getLocaleMessage("ERROR.GRID_EXPORT_DATA_FAILED"), null, this.statusText, null);
    }
  }
  xhr.send(null);
};

function gridUpdateFieldsConfig(id) {
  if (id) {
    var gridConfig = gridFieldsConfig[id];
    gridConfig['hiddenFields'] = [];
    gridConfig['fieldOrder'] = [];
    gridConfig['removedFields'] = [];
    gridConfig['fieldsSizes'] = {};
    gridConfig['frozenFields'] = {};
  }
};

function objectIsEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

function clearRecords(records) {
  var arr = [];
  records.map(function (json) {
    var parcialJson = {};
    for (var key in json) {
      if (key.indexOf("field") != -1) {
        parcialJson[key] = json[key];
      }
    }
    if (!objectIsEmpty(parcialJson)) {
      arr.add(Object.assign(parcialJson, {}));
    }
  });
  return arr;
}

function gridResize(grid) {
  if (grid && getWindowDimensions().width !== 0) {
    let newWidth = 0;
    // Se a grade nÃ£o estÃ¡ visÃ­vel realiza a o cÃ¡lculo pela porcentagem.
    if (!grid.visible) newWidth = getWindowDimensions().width * (parseFloat(grid.div.style.width) / 100);
    else newWidth = grid.div.offsetWidth > 0 ? grid.div.offsetWidth : grid.width;

    //Se a grade nÃ£o sofreu resize nÃ£o Ã© necessÃ¡rio redimensionar.
    if (newWidth === grid.currentWidth) return false;

    if (grid.inserting) {
      grid.completeCancelInclude();
    } else if (grid.editing) {
      grid.cancelEdit();
    }

    if (grid.currentWidth && grid.currentWidth > 0) grid.resizeColumns(newWidth / grid.currentWidth);
    grid.currentWidth = newWidth;
    grid.iscCanvas.setWidth(newWidth);

    try {
      var gridPagingSeparator = document.getElementById(grid.id + "_separator_paging");
      var gridFilterButton = document.getElementById(grid.id + "_icon_filter");

      if (newWidth < 410) {
        if (gridPagingSeparator) gridPagingSeparator.style.setProperty("display", "none", "important");
        if (gridFilterButton) gridFilterButton.style.setProperty("display", "none", "important");
      } else {
        if (gridPagingSeparator) gridPagingSeparator.style.display = null;
        if (gridFilterButton) gridFilterButton.style.display = null;
      }
    } catch (e) { }

    try {
      if (grid.paging && grid.paging.buttons && grid.paging.buttons.length > 0) {
        for (var i = 0; i < grid.paging.buttons.length; i++) {
          var buttonElement = grid.paging.buttons[i].getElementsByTagName("a")[0];
          var iconElement = buttonElement.getElementsByTagName("i")[0];

          if (newWidth < 360) {
            buttonElement.style.paddingLeft = grid.paging.smallPadding;
            buttonElement.style.paddingRight = grid.paging.smallPadding;
            iconElement.style.fontSize = "0.85rem";
          } else {
            buttonElement.style.paddingLeft = grid.paging.defaultPadding;
            buttonElement.style.paddingRight = grid.paging.defaultPadding;
            iconElement.style.fontSize = "1rem";
          }
        }
      }
    } catch (e) { }

    try {
      if (grid.nav && grid.nav.buttons && grid.nav.buttons.length > 0) {
        for (var i = 0; i < grid.nav.buttons.length; i++) {
          var iconElement = grid.nav.buttons[i].button.getElementsByTagName("i")[0];

          if (newWidth < 360) {
            iconElement.style.fontSize = "0.85rem";
          } else {
            iconElement.style.fontSize = "1rem";
          }
        }
      }
    } catch (e) { }
  }

  return false;
};

/**
 * MÃ©todo responsÃ¡vel por realizar a verificaÃ§Ã£o das colunas a serem pintadas quando a grade possuir colunas ocultas.
 * @author Janpier
 * @param grid
 * @param colsPaint
 * @returns lista de colunas a serem pintadas.
 */
function getGridVerifyColumns(grid, colsPaint) {
  let size = colsPaint.length;
  grid = grid.iscCanvas;
  let showColumns = grid.fields;
  let allColumns = grid.getAllFields();
  let nCols = [];
  for (let i = 0; i < size; i++) {
    let field = allColumns[colsPaint[i]];
    let findIndex = showColumns.findIndex(function (e) { return e.name === field.name });
    if (findIndex) nCols[i] = findIndex;
  }
  return nCols.length === colsPaint.length ? nCols : colsPaint;
}

/**
 * MÃ©todo responsÃ¡vel por renderizar o filtro avanÃ§ado da grade.
 * @author Janpier
 * @param grid
 */
function gridAdvancedFilter(grid) {
  grid = $c(grid);
  if (grid) {
    if (!grid.filterModal) {
      // Criar modal do Bootstrap.
      grid.filterModal = bootstrapCreateModal(getLocaleMessage("INFO.GRID_ADVANCED_FILTER") + (grid.description ? " - " + grid.description : ""), true, null, null, null, null, false, false);
      grid.filterModal[2].className += " overflow-auto"; // Bootstrap
      grid.filterModal[4].className += " modal-xl"; // Bootstrap

      // Obter conteÃºdo do modal para limitar a altura.
      if (IE) {
        grid.filterModal[2].style.maxHeight = "65vh";
      } else {
        var modalContent = grid.filterModal[0].getElementsByClassName("modal-content")[0];
        modalContent.style.maxHeight = "90vh";
      }

      grid.advancedFilter = isc.FilterBuilder.create({
        ID: grid.id + "advancedFilter",
        referenceGrid: grid.id,
        dataSource: grid.id + "dataSource",
        criteria: grid.gridSavedConfigFilter ? grid.gridSavedConfigFilter : {
          _constructor: "AdvancedCriteria",
          operator: "and",
          criteria: [],
        },

        getFieldOperators: function() {
          const comp = $c(this.referenceGrid);
          const field = arguments[1];
          if (field.realType) {
            comp.filterMode == 1
            ? this.getDataSource().setTypeOperators("text", _date_and_numberOperators)
            : this.getDataSource().setTypeOperators("text", _date_client);
            _setOperator = true;
          }

          if (!field.realType && _setOperator) this.getDataSource().setTypeOperators("text", _textOperators);
          return this.Super("getFieldOperators", arguments);
        }
      });

      var resetButton = document.createElement("button");
      resetButton.type = "button";
      resetButton.className = "btn btn-secondary"; // Bootstrap
      resetButton.innerHTML = getLocaleMessage("INFO.GRID_ADVANCED_FILTER_CLEAR");
      grid.buttonReset = resetButton;
      grid.filterModal[3].appendChild(resetButton);
      resetButton.onclick = function() {
        grid.advancedFilter.clearCriteria();
      };

      var applyFilterButton = document.createElement("button");
      applyFilterButton.type = "button";
      applyFilterButton.className = "btn btn-primary"; // Bootstrap
      applyFilterButton.innerHTML = getLocaleMessage("INFO.GRID_ADVANCED_FILTER_APPLY");
      grid.buttonFilter = applyFilterButton;
      grid.filterModal[3].appendChild(applyFilterButton);
      applyFilterButton.onclick = function() {
        grid.isAdvancedFilter = true;
        grid.iscCanvas.clearCriteria();
        grid.iscCanvas.filterData(grid.advancedFilter.getCriteria());
        bootstrapCloseModal(grid.filterModal[0]);
      };

      grid.VStack = isc.VStack.create({
        membersMargin:10,
        height: 60,
        left: 5,
        members: [grid.advancedFilter],
        htmlElement: grid.filterModal[2]
      });
    }

    bootstrapShowModal(grid.filterModal[0]);
  }
};
