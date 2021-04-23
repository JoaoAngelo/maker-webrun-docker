<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true">
<%@ page import="wfr.com.*"%>
<%@ page import="wfr.util.*"%>
<%@ page import="wfr.sys.*"%>
<%@ page import="wfr.sys.HTMLInterface.*"%>
<%@ page import="java.util.*"%>
<%@ page import="java.lang.*"%>
<%@ page import="wfr.util.Logger"%>
<%!
  public boolean listContainsField(List fields, WFRMetaData data) {
    for (int i = 0; i < fields.size(); i++) {
      if (((WFRMetaData)fields.get(i)).getRealField().equals(data.getRealField())) return true;
    }

    return false;
  }
%>
<%
  String sys = request.getParameter("sys");
  HTMLInterface wi = (HTMLInterface)request.getSession().getAttribute("WFR" + sys);
  WFRForm form = wi.getSystem().getForm(Functions.fromISOtoBASE(request.getParameter("formID")), wi.getData().connection());
  Resources resources = Resources.getInstance(request);

  String lForm = "";
  if (form.getProperty(ComponentProperty.FORMULARIO_LOCALIZAR) != null && (!form.getProperty(ComponentProperty.FORMULARIO_LOCALIZAR).equals("") && !form.getProperty(ComponentProperty.FORMULARIO_LOCALIZAR).equals("0"))) {
    lForm = form.getProperty(ComponentProperty.FORMULARIO_LOCALIZAR);
  } else if (!wi.getSystem().getProperty(ComponentProperty.FORMULARIO_LOCALIZAR).toString().equals("")) {
    lForm = wi.getSystem().getProperty(ComponentProperty.FORMULARIO_LOCALIZAR);
  }

  if (!lForm.equals("") && !lForm.equals("0")) {
%>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <script type="text/javascript">document.location = "form.jsp?sys=" + <%= "\"" + request.getParameter("sys") + "&action=openform&formID=" + lForm + "&formBase=" +  request.getParameter("formID") + "\"" %></script>
  </head>
  <body>
  </body>
</html>
<%
  } else {
    Logger logger = Logger.getLogger(this.getClass());
    List<WFRMetaData> grid = wi.getUserInfo().getGridFields(form.getGuid(), form.getGridFields());
    List<WFRMetaData> gridSearchFields = form.getSearchFields();

    ArrayList<WFRMetaData> intersectSearchFields = new ArrayList<WFRMetaData>();
    ArrayList<WFRMetaData> aloneSearchFields = new ArrayList<WFRMetaData>();

    int totalTableWidth = 0;

    for (int i = 0; i < grid.size(); i++) {
      WFRMetaData c = (WFRMetaData)grid.get(i);
      if (c.getGridShow()) {
        if (listContainsField(gridSearchFields, c)) intersectSearchFields.add(c);
        totalTableWidth += Math.max(c.getGridWidth(), 100);
      } else if (listContainsField(gridSearchFields, c)) {
        aloneSearchFields.add(c);
      }
    }

    for (int i = 0; i < gridSearchFields.size(); i++) {
      WFRMetaData c = (WFRMetaData)gridSearchFields.get(i);
      if (!listContainsField(grid, c)) aloneSearchFields.add(c);
    }

    String field = "";
    String names = "";

    String ua = request.getHeader("user-agent");
    Boolean isIE = (ua != null && (ua.contains("rv:11.0") || ua.contains("Trident")));
%>
<!DOCTYPE html>
<html class="w-100 h-100 overflow-hidden">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="LABEL.ADVANCED_QUERY"/> - <%=Functions.fromISOtoBASE(request.getParameter("title"))%></title>

    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.BOOTSTRAP_DATETIMEPICKER_CSS %>
    <%= HTMLConstants.BOOTSTRAP_SWITCH_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <%= HTMLConstants.MOMENT_JS %>
    <%= HTMLConstants.BOOTSTRAP_DATETIMEPICKER_JS %>
    <%= HTMLConstants.BOOTSTRAP_SWITCH_JS %>

    <%
      String skinName = wi.getSystem().getProperty(ComponentProperty.SKIN);
      if (skinName != null && !skinName.trim().isEmpty()) {
    %>
    <link rel="stylesheet" type="text/css" href="assets/skins/<%=skinName%>.css">
    <% } %>

    <webrun:import src="assets/colResizable.min.js"/>
    <webrun:import src="assets/dragndrop.table.columns.min.js"/>

    <webrun:import src="<%=resources.getI18NFilePath()%>"/>
    <webrun:import src="wfr.js"/>
    <webrun:import src="wfr_masks.js"/>

    <webrun:import src="components/HTMLObject.js"/>
    <webrun:import src="components/HTMLNavigationQuery.js"/>

    <script type="text/javascript">
      var mainform = parent;

      var locale = mainform.resources_locale.trim().toLowerCase();
      if (locale == "en_us") locale = "en";
      else if (locale == "pt_br") locale = "pt-br";
      else if (locale == "es_es") locale = "es";
      else if (locale == "fr_fr") locale = "fr";
      moment.locale(locale);

      function doSubmit(showMessage) {
        if (atLeastOneSelected(showMessage) && !parent.httpprocessing) {
          parent.searched = true;
          parent.showWait();

          if (nav && nav.showTableContent) {
            nav.showTableContent();
          }

          document.WFRQueryForm.acceptCharset = getCharset();
          document.WFRQueryForm.submit();
        }
      }

      function getCharset() {
        if (mainform.isTomcat7) {
          return "ISO-8859-1";
        } else if (mainform.isDotNET) {
          return mainform.ENCODING;
        } else {
          return "UTF-8";
        }
      }

      function clearFields() {
      <%
        for (int i = 0; i < gridSearchFields.size(); i++) {
          out.println("  document.WFRQueryForm.q$" + i + ".value = '';");
        }
      %>
      }

      function atLeastOneSelected(showMessage) {
        var inputs = $('input[data-date="true"]');

        for (var i = 0; i < inputs.length; i++) {
          if (!isDateTime(inputs[i].value, mainform.DATE_PATTERN)) {
            interactionError(getLocaleMessage("ERROR.INVALID_FIELD_DATE_FORMAT", inputs[i].getAttribute("description-field")), (function(e) {
              inputs[i].focus();
            }), null);

            event.preventDefault();
            return false;
          }
        }

        var r = !<%=form.getProperty(ComponentProperty.ENTRAR_COMO_PESQUISA).equalsIgnoreCase("true")%>;
      <%
        if (grid != null && form.getProperty(ComponentProperty.ENTRAR_COMO_PESQUISA).equalsIgnoreCase("true")) {
          for (int i = 0; i < gridSearchFields.size(); i++) {
            WFRMetaData c = (WFRMetaData)gridSearchFields.get(i);
      %>
            if (document.WFRQueryForm.q$<%=i%>.value == '') r = false; 
            else return true;
      <%
          }
      %>
          if (!r) {
            if (showMessage) alert($mainform().getLocaleMessage("INFO.SEARCH_EMPTY"));
            return false;
          }
      <%
        }
      %>
        return r;
      }

      function initDateField(input, button, type) {
        var closeDateTimePicker = function() {
          if (button.dtpInitialized) {
            $(input).datetimepicker("destroy");
            button.dtpInitialized = false;

            // Desassociar evento de clique a janela.
            document.removeEventListener("click", closeDateTimePicker);
          }
        };

        $(input).attr('data-date', true);

        // Obter o pattern do formulário
        var dateFormat = mainform.DATE_PATTERN.toUpperCase();

        // Criar máscara no campo
        var inputMask = new Mask(dateFormat.toLowerCase(), "date");
        inputMask.attach(input);

        // Associar evento de clique ao ícone de calendário do campo.
        button.addEventListener("click", function(e) {
          e.stopPropagation();

          if (button.dtpInitialized) {
            closeDateTimePicker();
          } else {
            // Inicializar o DateTimePicker
            $(input).datetimepicker({
              // Idioma do DateTimePicker
              locale: locale,

              // Formato da data
              format: dateFormat,

              // Não exibir o datetimepicker quando o input for somente leitura
              ignoreReadonly: false,

              // Exibir o botão para definir a data para o dia atual
              showTodayButton: true,

              // Não exibir o datetimepicker quando o input receber foco
              allowInputToggle: false,

              // Não utilizar a data atual
              useCurrent: false,

              // Ajeitar ícone de tempo
              icons: {
                time: "fas fa-clock" // Font Awesome
              },

              // Não exibir ao focar no input
              focusOnShow: false
            });

            // Marcar o DateTimePicker como inicializado
            button.dtpInitialized = true;

            // Associar evento de ao fechar do DateTimePicker
            $(input).on("dp.hide", function() {
              closeDateTimePicker();
            });

            // Associar evento de clique a janela.
            document.addEventListener("click", closeDateTimePicker);

            // Exibir o DateTimePicker
            $(input).datetimepicker("show");
          }
        });
      }

      addKeyEvent();
    </script>

    <style>
      .table {
        table-layout: fixed;
        width: calc(100% - 20px) !important;
      }

      .table > tbody > tr td,
      .table > thead > tr th:not(.query-th),
      .table > thead > tr th:not(.query-th) span {
        overflow: hidden;
        white-space: nowrap;
        -moz-text-overflow: ellipsis;
        -ms-text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
      }

      .table-over {
        background-color: var(--dark) !important;
        color: var(--light);
      }

      .bootstrap-datetimepicker-widget {
        z-index: 4000;
      }

      .JCLRgrips {
        z-index: 3000;
      }

      .JCLRgrips .grip {
        width: 1rem;
        height: 1rem;
        margin-top: -0.25rem;
        margin-left: -5px;
        cursor: e-resize;
      }

      .JCLRgrip.JCLRLastGrip {
        background: var(--light);
        border: 1px solid #dee2e6 !important;
        margin-left: -2px !important;
        width: 20px !important;
        position: relative;
      }

      .JCLRgrip.JCLRLastGrip::before {
        content: "\f7a5";
        font-family: "Font Awesome 5 Free";
        font-weight: 900;
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        display: inline-block;
        font-style: normal;
        font-variant: normal;
        text-rendering: auto;
        line-height: 1;
        opacity: 0.25;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .JCLRgrip.JCLRLastGrip .JColResizer {
        width: 20px !important;
      }

      .JColResizer > tbody > tr > td,
      .JColResizer > tbody > tr > th {
        padding-left: .75rem !important;
        padding-right: .75rem !important;
      }

      .bootstrap-datetimepicker-widget table,
      .bootstrap-datetimepicker-widget table * {
        border: 0 !important;
      }

      .bootstrap-datetimepicker-widget tbody tr:hover {
        background-color: transparent !important;
      }

      .table-responsive .bootstrap-switch {
        border: none !important;
        border-radius: 0 !important;
      }
    </style>

    <% if (isIE) { %>
    <webrun:import src="assets/css-vars-ponyfill.min.js"/>
    <script type="text/javascript">cssVars({ });</script>
    <% } %>
  </head>
  <body class="position-relative w-100 h-100">
    <div id="pageloader" class="position-absolute w-100 h-100 bg-white d-flex align-items-center justify-content-center" style="top: 0; left: 0; bottom: 0; right: 0; z-index: 100000;">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only"><webrun:message key="JS.LABEL.LOADING"/>...</span>
      </div>
    </div>

    <form name="WFRQueryForm" method="get" action="search.do" target="WFRQueryResults" onsubmit="return atLeastOneSelected(true);" class="w-100 h-100 d-flex flex-column">
      <div id="query-nav" class="w-100 bg-white" style="z-index: 10200; flex: 0 0 auto;" data-hascollapsed="<% if (aloneSearchFields.size() > 0) { %>true<% } else { %>false<% } %>"></div>
      <% if (aloneSearchFields.size() > 0) { %>
      <div class="collapse border-top mh-100 flex-fill" id="collapsed-fields">
        <div class="p-3">
          <h5 class="font-weight-light mb-0">+ <webrun:message key="LABEL.SEARCH_PARAMS"/></h5>
          <div class="row">
            <%
              for (int i = 0; i < aloneSearchFields.size(); i++) {
                WFRMetaData c = (WFRMetaData)aloneSearchFields.get(i);

                if (field.length() > 0) field += ";";
                if (names.length() > 0) names += ";";

                field += c.getRealField();
                names += c.getField();
            %>
            <div class="col-sm-4">
              <label class="mt-2 mb-1" for="type-<%=i%>"><%=Functions.stringToHTMLString(Functions.translate(c.getDescription(), form, wi.getSystem().getApplicationResources()))%></label>
              <select name="type$<%=i%>" id="type-<%=i%>" class="custom-select" onkeydown="return doEnter(event, function() { if (nav && nav.search) nav.search(); }, 'q$<%=i%>');">
                <% if (c.isString()) { %>
                <option value="2"><webrun:message key="LABEL.CONTAINING"/></option>
                <option value="3" selected><webrun:message key="LABEL.STARTING_WITH"/></option>
                <option value="4"><webrun:message key="LABEL.ENDING_WITH"/></option>
                <option value="1">=</option>
                <% } if (c.isNumeric()) { %>
                <option value="17" selected>=</option>
                <option value="18">&gt;</option>
                <option value="19">&lt;</option>
                <option value="20">&gt;=</option>
                <option value="21">&lt;=</option>
                <option value="3"><webrun:message key="LABEL.STARTING_WITH"/></option>
                <% } if (c.isDate()) { %>
                <option value="10" selected>=</option>
                <option value="11">&gt;</option>
                <option value="12">&lt;</option>
                <option value="13">&gt;=</option>
                <option value="14">&lt;=</option>
                <% } if (c.isBooolean()) { %>
                <option value="28" selected>=</option>
                <% } %>
              </select>

              <% if (c.getDataField().getDataType().isTime() || c.getDataField().getDataType().isTimestamp() || c.getDataField().getDataType().isDate()) { %>
              <div class="input-group mt-2 h-auto">
                <input type="text" id="q-<%=i%>" name="q$<%=i%>" class="form-control query-input" onKeyDown="return doEnter(event, function() { if (nav && nav.search) nav.search(); }, 'type$<%=(grid.size()-1==i)?0:i+1%>');" onchange="nav ? nav.updateFieldsLayout() : null" oninput="nav ? nav.updateFieldsLayout() : null">
                <div class="input-group-append date" id="calendar-<%=i%>" role="button" style="height: auto; cursor: pointer;">
                  <i class="input-group-text far fa-calendar"></i>
                </div>
              </div>
              <script type="text/javascript">
                <% if (c.getDataField().getDataType().isTime()) { %>
                  initDateField(document.WFRQueryForm.q$<%=i%>, document.getElementById("calendar-<%=i%>"), 1);
                <% } else if (c.getDataField().getDataType().isTimestamp()) { %>
                  initDateField(document.WFRQueryForm.q$<%=i%>, document.getElementById("calendar-<%=i%>"), 2);
                <% } else if (c.getDataField().getDataType().isDate()) { %>
                  initDateField(document.WFRQueryForm.q$<%=i%>, document.getElementById("calendar-<%=i%>"), 0);
                <% } %>
              </script>
              <% } else if (c.getDataField().getDataType().getType().equals("IMPRESSAO_DIGITAL")) { %>
              <div class="input-group mt-2 h-auto">
                <input type="text" id="q-<%=i%>" name="q$<%=i%>" class="form-control query-input" onKeyDown="return doEnter(event, function() { if (nav && nav.search) nav.search(); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');" onchange="nav ? nav.updateFieldsLayout() : null" oninput="nav ? nav.updateFieldsLayout() : null">
                <div class="input-group-append" id="fingerprint-<%=i%>" role="button" style="height: auto; cursor: pointer;" onclick="openQueryDigitalCapture('<%=sys%>', 'q$<%=i%>');">
                  <i class="input-group-text fas fa-fingerprint"></i>
                </div>
              </div>
              <% } else if (c.getDataField().getDataType().isDouble()) { %>
              <input type="text" id="q-<%=i%>" name="q$<%=i%>" class="form-control query-input mt-2" onKeyDown="return doEnter(event, function() { if (nav && nav.search) nav.search(); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');" onchange="nav ? nav.updateFieldsLayout() : null" oninput="nav ? nav.updateFieldsLayout() : null">
              <script type="text/javascript">new Mask("#.####", "number").attach(document.WFRQueryForm.q$<%=i%>);</script>
              <% } else if (c.getDataField().getDataType().isInteger()) { %>
              <input type="text" id="q-<%=i%>" name="q$<%=i%>" class="form-control query-input mt-2" onKeyDown="return doEnter(event, function() { if (nav && nav.search) nav.search(); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');" onchange="nav ? nav.updateFieldsLayout() : null" oninput="nav ? nav.updateFieldsLayout() : null">
              <script type="text/javascript">new Mask("#", "number").attach(document.WFRQueryForm.q$<%=i%>);</script>
              <% } else if (c.getDataField().getDataType().isBoolean()) { %>
              <input name="q$<%=i%>" id="q-<%=i%>" type="text" class="d-none">
              <div class="w-100 d-flex align-items-center mb-0">
                <input id="q-<%=i%>-checkbox" type="checkbox" onKeyDown="return doEnter(event, function() { doSubmit(true); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');" onchange="document.WFRQueryForm.q$<%=i%>.value = document.getElementById('q-<%=i%>-checkbox').checked.toString();">
              </div>
              <script type="text/javascript">
                var q<%=i%>checkbox = document.getElementById("q-<%=i%>-checkbox");
                $(q<%=i%>checkbox).bootstrapSwitch({ onText: "<webrun:message key="JS.LABEL.YES" js="true"/>", offText: "<webrun:message key="JS.LABEL.NO" js="true"/>" });
                document.WFRQueryForm.q$<%=i%>.value = q<%=i%>checkbox.checked.toString();
              </script>
              <% } else { %>
              <input type="text" id="q-<%=i%>" name="q$<%=i%>" class="form-control query-input mt-2" onKeyDown="return doEnter(event, function() { if (nav && nav.search) nav.search(); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');" onchange="nav ? nav.updateFieldsLayout() : null" oninput="nav ? nav.updateFieldsLayout() : null">
              <% } %>
            </div>
            <% } %>
          </div>
        </div>
      </div>
      <% } %>
      <div class="table-responsive w-100 mh-100 flex-fill overflow-auto collapse show" id="table-context">
        <table class="table table-bordered table-hover border-0 m-0 position-relative" id="results-table"<% if (totalTableWidth > 0) { %>style="min-width: <%=totalTableWidth%>px;"<% } %>>
          <thead>
            <tr class="dnd-moved">
              <%
                int totalHeaderFields = grid.size();
                int searchFieldIndex = aloneSearchFields.size();
                int scopeIndex = 0;

                for (int i = 0; i < totalHeaderFields; i++) {
                  WFRMetaData c = (WFRMetaData)grid.get(i);
                  if (!c.getGridShow()) continue;

                  if (listContainsField(intersectSearchFields, c)) {
                    if (field.length() > 0) field += ";";
                    if (names.length() > 0) names += ";";

                    field += c.getRealField();
                    names += c.getField();
              %>
              <th scope="col" id="field-query-<%=searchFieldIndex%>" class="query-th p-0 m-0 align-middle <% if (isIE) { %>position-relative<% } else { %>sticky-top<% } %> bg-light border-0" data-field-index="<%=i%>" data-scope-index="<%=scopeIndex%>" style="width: <%=Math.max(c.getGridWidth(), c.isBooolean() ? 150 : 100)%>px; z-index: 2000; min-width: <% if (c.isBooolean()) { %>150<% } else { %>100<% } %>px;">
                <div class="input-group h-100<% if (i < totalHeaderFields - 1) { %> border-right<% } %> border-top border-bottom flex-nowrap"<% if (c.isBooolean()) { %> style="min-width: 150px;"<% } %>>
                  <div class="input-group-prepend dropdown">
                    <input type="hidden" name="type$<%=searchFieldIndex%>" id="type-<%=searchFieldIndex%>" class="d-none" value="<% if (c.isString()) { %>3<% } else if (c.isNumeric()) { %>17<% } else if (c.isDate()) { %>10<% } else if (c.isBooolean()) { %>28<% } %>">
                    <button type="button" class="btn btn-light border-right dropdown-toggle rounded-0" id="dropdown-button-<%=searchFieldIndex%>" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"<% if (c.isBooolean()) { %> style="cursor: default;" disabled<% } %>><% if (c.isString()) { %><i class="text-dark fas fa-align-left"></i><% } else { %><i class="text-dark fas fa-equals"></i><% } %></button>
                    <div class="dropdown-menu field-type-dropdown" id="dropdown-menu-<%=searchFieldIndex%>" aria-labelledby="dropdown-button-<%=searchFieldIndex%>" data-field="<%=searchFieldIndex%>">
                      <% if (c.isString()) { %>
                      <a class="dropdown-item" href="#" data-value="2"><i class="fas fa-align-justify"></i><span class="ml-3"><webrun:message key="LABEL.CONTAINING"/></span></a>
                      <a class="dropdown-item active" href="#" data-value="3"><i class="fas fa-align-left"></i><span class="ml-3"><webrun:message key="LABEL.STARTING_WITH"/></span></a>
                      <a class="dropdown-item" href="#" data-value="4"><i class="fas fa-align-right"></i><span class="ml-3"><webrun:message key="LABEL.ENDING_WITH"/></span></a>
                      <a class="dropdown-item" href="#" data-value="1"><i class="fas fa-equals"></i><span class="ml-3"><webrun:message key="JS.LABEL.EQUAL"/></span></a>
                      <% } else if (c.isNumeric()) { %>
                      <a class="dropdown-item active" href="#" data-value="17"><i class="fas fa-equals"></i><span class="ml-3"><webrun:message key="JS.LABEL.EQUAL"/></span></a>
                      <a class="dropdown-item" href="#" data-value="18"><i class="fas fa-greater-than"></i><span class="ml-3"><webrun:message key="LABEL.GREATER_THAN"/></span></a>
                      <a class="dropdown-item" href="#" data-value="19"><i class="fas fa-less-than"></i><span class="ml-3"><webrun:message key="LABEL.LESS_THAN"/></span></a>
                      <a class="dropdown-item" href="#" data-value="20"><i class="fas fa-greater-than-equal"></i><span class="ml-3"><webrun:message key="LABEL.GREATER_THAN_EQUAL_TO"/></span></a>
                      <a class="dropdown-item" href="#" data-value="21"><i class="fas fa-less-than-equal"></i><span class="ml-3"><webrun:message key="LABEL.LESS_THAN_EQUAL_TO"/></span></a>
                      <a class="dropdown-item" href="#" data-value="3"><i class="fas fa-align-left"></i><span class="ml-3"><webrun:message key="LABEL.STARTING_WITH"/></span></a>
                      <% } else if (c.isDate()) { %>
                      <a class="dropdown-item active" href="#" data-value="10"><i class="fas fa-equals"></i><span class="ml-3"><webrun:message key="JS.LABEL.EQUAL"/></span></a>
                      <a class="dropdown-item" href="#" data-value="11"><i class="fas fa-greater-than"></i><span class="ml-3"><webrun:message key="LABEL.GREATER_THAN"/></span></a>
                      <a class="dropdown-item" href="#" data-value="12"><i class="fas fa-less-than"></i><span class="ml-3"><webrun:message key="LABEL.LESS_THAN"/></span></a>
                      <a class="dropdown-item" href="#" data-value="13"><i class="fas fa-greater-than-equal"></i><span class="ml-3"><webrun:message key="LABEL.GREATER_THAN_EQUAL_TO"/></span></a>
                      <a class="dropdown-item" href="#" data-value="14"><i class="fas fa-less-than-equal"></i><span class="ml-3"><webrun:message key="LABEL.LESS_THAN_EQUAL_TO"/></span></a>
                      <% } else if (c.isBooolean()) { %>
                      <a class="dropdown-item active" href="#" data-value="28"><i class="fas fa-equals"></i><span class="ml-3"><webrun:message key="JS.LABEL.EQUAL"/></span></a>
                      <% } %>
                    </div>
                  </div>

                  <input type="text" class="form-control-plaintext query-input p-2" style="outline: 0;" placeholder="<webrun:message key="JS.LABEL.CHAT_SEARCH"/>..." id="q-<%=searchFieldIndex%>" description-field="<%=c.getDescription()%>" name="q$<%=searchFieldIndex%>" autocomplete="off" onKeyDown="nav.handleShortcutKeys(event); return doEnter(event, function() { if (nav && nav.search) nav.search(); }, 'type$<%=(grid.size() - 1 == i) ? 0 : i + 1%>');" onchange="nav ? nav.updateFieldsLayout() : null" oninput="nav ? nav.updateFieldsLayout() : null">

                  <% if (c.getDataField().getDataType().isTime() || c.getDataField().getDataType().isTimestamp() || c.getDataField().getDataType().isDate()) { %>
                  <div class="input-group-append" id="calendar-<%=searchFieldIndex%>" role="button" style="height: auto; cursor: pointer;">
                    <i class="input-group-text border-top-0 border-bottom-0 border-right-0 d-flex align-items-center far fa-calendar"></i>
                  </div>
                  <script type="text/javascript">
                    <% if (c.getDataField().getDataType().isTime()) { %>
                      initDateField(document.WFRQueryForm.q$<%=searchFieldIndex%>, document.getElementById("calendar-<%=searchFieldIndex%>"), 1);
                    <% } else if (c.getDataField().getDataType().isTimestamp()) { %>
                      initDateField(document.WFRQueryForm.q$<%=searchFieldIndex%>, document.getElementById("calendar-<%=searchFieldIndex%>"), 2);
                    <% } else if (c.getDataField().getDataType().isDate()) { %>
                      initDateField(document.WFRQueryForm.q$<%=searchFieldIndex%>, document.getElementById("calendar-<%=searchFieldIndex%>"), 0);
                    <% } %>
                  </script>
                  <% } else if (c.getDataField().getDataType().getType().equals("IMPRESSAO_DIGITAL")) { %>
                  <div class="input-group-append" id="fingerprint-<%=i%>" role="button" style="height: auto; cursor: pointer;" onclick="openQueryDigitalCapture('<%=sys%>', 'q$<%=i%>');">
                    <i class="input-group-text border-top-0 border-bottom-0 border-right-0 d-flex align-items-center fas fa-fingerprint"></i>
                  </div>
                  <% } else if (c.getDataField().getDataType().isDouble()) { %>
                  <script type="text/javascript">new Mask("#.####", "number").attach(document.WFRQueryForm.q$<%=searchFieldIndex%>);</script>
                  <% } else if (c.getDataField().getDataType().isInteger()) { %>
                  <script type="text/javascript">new Mask("#", "number").attach(document.WFRQueryForm.q$<%=searchFieldIndex%>);</script>
                  <% } else if (c.getDataField().getDataType().isBoolean()) { %>
                  <div class="w-100 d-flex align-items-center justify-content-center mb-0" style="padding: 0.2rem;">
                    <input id="q-<%=i%>-checkbox" type="checkbox" onchange="document.WFRQueryForm.q$<%=i%>.value = document.getElementById('q-<%=i%>-checkbox').checked.toString(); if (nav && nav.search) nav.search();">
                  </div>
                  <script type="text/javascript">
                    var q<%=i%>checkbox = document.getElementById("q-<%=i%>-checkbox");
                    $(q<%=i%>checkbox).bootstrapSwitch({ onText: "<webrun:message key="JS.LABEL.YES" js="true"/>", offText: "<webrun:message key="JS.LABEL.NO" js="true"/>" });
                    document.WFRQueryForm.q$<%=i%>.style.setProperty("display", "none", "important");
                    document.WFRQueryForm.q$<%=i%>.value = q<%=i%>checkbox.checked.toString();
                  </script>
                  <% } %>
                </div>
              </th>
              <%
                    searchFieldIndex++;
                  } else {
              %>
              <th scope="col" class="p-0 m-0 align-middle <% if (isIE) { %>position-relative<% } else { %>sticky-top<% } %> bg-light border-0" data-field-index="<%=i%>" data-scope-index="<%=scopeIndex%>" style="z-index: 2000;">
                <div class="position-absolute w-100 h-100<% if (i < totalHeaderFields - 1) { %> border-right<% } %> border-top border-bottom flex-nowrap" style="top: 0; left: 0; right: 0; bottom: 0;<% if (isIE) { %> padding-top: 100%;<% } %>"></div>
              </th>
              <%
                  }

                  scopeIndex++;
                }
              %>
            </tr>
            <tr class="dnd-moved">
              <%
                for (int i = 0; i < totalHeaderFields; i++) {
                  WFRMetaData c = (WFRMetaData)grid.get(i);
                  if (!c.getGridShow()) continue;
              %>
              <th scope="col" id="field-<%=i%>" class="text-nowrap <% if (isIE) { %>position-relative<% } else { %>sticky-top<% } %> bg-light p-0 border-0">
                <div class="d-flex align-items-center w-100 h-100<% if (i < totalHeaderFields - 1) { %> border-right<% } %> border-bottom p-2">
                  <span class="mr-auto"><%=Functions.stringToHTMLString(Functions.translate(c.getDescription(), form, wi.getSystem().getApplicationResources()))%></span>
                  <span id="field-sort-<%=i%>" class="generic-btn d-flex align-items-center justify-content-center ml-2">
                    <i class="fas fa-sort" id="field-sort-icon-<%=i%>"></i>
                  </span>
                </div>
              </th>
              <% } %>
            </tr>
          </thead>
          <tbody class="position-relative"></tbody>
        </table>
      </div>

      <div class="mt-auto collapse" id="search-footer">
        <div class="d-flex align-items-center justify-content-end bg-light border-top p-2">
          <button type="button" class="btn btn-secondary m-1" onclick="nav && nav.clearFilters ? nav.clearFilters() : null"><webrun:message key="JS.INFO.GRID_ADVANCED_FILTER_CLEAR"/></button>
          <button type="button" class="btn btn-primary m-1" onclick="nav && nav.search ? nav.search() : null"><webrun:message key="JS.INFO.GRID_ADVANCED_FILTER_APPLY"/></button>
        </div>
      </div>

      <input name="fieldNum" type="hidden" value="0">
      <input name="type" type="hidden" id="type" value="3">
      <input name="sys" type="hidden" value="<%=request.getParameter("sys")%>">
      <input name="action" type="hidden" value="search">
      <input name="formID" type="hidden" value="<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>">
      <input name="componentID" type="hidden" value="-1">
      <input name="field" type="hidden" value="<%=field%>">
      <input name="names" type="hidden" value="<%=names%>">
      <input name="advancedQuery" type="hidden" value="false">
      <input name="showResults" type="hidden" value="true">

      <iframe name="WFRQueryResults" id="WFRQueryResults" src="navigate.do?sys=<%=request.getParameter("sys")%>&action=navigate&formID=<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>&componentID=-1&type=1&showResults=true&q=" scrolling="yes" class="d-none border-0 outline-0"></iframe>
    </form>

    <div class="modal fade" id="advanced-query-modal" tabindex="-1" role="dialog" aria-labelledby="advanced-query-modal-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
        <div class="modal-content" style="min-height: 85vh;">
          <div class="modal-header">
            <h5 class="modal-title" id="advanced-query-modal-title"><webrun:message key="LABEL.ADVANCED_QUERY"/></h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="<webrun:message key="LABEL.CLOSE"/>">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body p-0">
            <iframe src="advanced_query.jsp?<%=request.getQueryString()%>" class="w-100 p-0 m-0 border-0 outline-0" id="advanced-query-frame" style="height: 55vh;"></iframe>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="clear-advanced-query" onclick="clearAdvancedQuery();"><webrun:message key="JS.INFO.GRID_ADVANCED_FILTER_CLEAR"/></button>
            <button type="button" class="btn btn-primary" onclick="applyAdvancedQuery();"><webrun:message key="JS.INFO.GRID_ADVANCED_FILTER_APPLY"/></button>
          </div>
          <script type="text/javascript">
            var advQueryFrame = document.getElementById("advanced-query-frame");
            advQueryFrame.setClearState = function(state) {
              var clearButton = document.getElementById("clear-advanced-query");
              if (clearButton) clearButton.disabled = !state;
            };

            advQueryFrame.requireUpdate = function() {
              nav.updateGrid();
              bootstrapCloseModal("#advanced-query-modal");
            };

            function clearAdvancedQuery() {
              advQueryFrame.contentWindow.clean('<%=sys%>', <%=form.getCode()%>);
            }

            function applyAdvancedQuery() {
              advQueryFrame.contentWindow.doSubmit(true);
            }
          </script>
        </div>
      </div>
    </div>
  </body>
</html>
<% } %>
</webrun:controller>
