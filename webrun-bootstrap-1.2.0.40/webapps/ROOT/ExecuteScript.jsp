<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="wfr.util.Logger" %>
<%@ page import="wfr.util.Resources" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller requiresManagerUser="true">
<%
  Logger logger = Logger.getLogger(this.getClass());
  String sys = request.getParameter("sys").toString();
  HTMLInterface wi = null;

  try {
    wi = HTMLInterface.getInstance(request);
    wi.checkJSPAccess(out, true);
  } catch (Exception ex) {
    logger.error(wi != null ? wi.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, ex);
    return;
  }

  Resources resources = Resources.getInstance(request);
  String i18nPath = resources.getI18NFilePath();
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="LABEL.EXECUTE_SCRIPT"/></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <% if (!i18nPath.isEmpty()) { %><script type="text/javascript" src="<%= i18nPath %>"></script><% } %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <link rel="stylesheet" type="text/css" href="components/codemirror/lib/codemirror.css">
    <script type="text/javascript" src="components/codemirror/lib/codemirror.js"></script>
    <script type="text/javascript" src="components/codemirror/addon/display/placeholder.js"></script>
    <script type="text/javascript" src="components/codemirror/addon/edit/matchbrackets.js"></script>
    <script type="text/javascript" src="components/codemirror/mode/sql/sql.js"></script>
    <link rel="stylesheet" type="text/css" href="components/codemirror/addon/hint/show-hint.css">
    <script type="text/javascript" src="components/codemirror/addon/hint/show-hint.js"></script>
    <script type="text/javascript" src="components/codemirror/addon/hint/sql-hint.js"></script>
    <style>
      .overlay {
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        opacity: 0.5;
        z-index: 10;
      }

      .CodeMirror {
        -ms-flex: 1 1 auto !important;
        flex: 1 1 auto !important;
        height: 100%;
      }

      .tab-content >.active {
        display: flex !important;
      }
    </style>
    <script type="text/javascript">
      function openScriptUpload() {
        var scriptUpload = document.getElementById("script-upload");
        scriptUpload.onchange = function(e) {
          if (this.files && this.files.length > 0) {
            var reader = new FileReader();
            reader.readAsText(this.files[0], "UTF-8");
            reader.onload = function (evt) {
                window.editor.setValue(evt.target.result);
            };

            reader.onerror = function (evt) {
              new HTMLMessage().showErrorMessage("<webrun:message key="ERROR.FILE_CONTENT_READ_FAILED" js="true"/>", null, null, null, 'DB', true);
            };
          }
        };

        scriptUpload.click();
      }

      function updateLayout() {
        var executeButton = document.getElementById("execute-button");
        executeButton.disabled = window.editor.getValue().length == 0;
      }

      window.onload = function() {
        window.editor = CodeMirror.fromTextArea(document.getElementById("script-content"), {
          placeholder: "<webrun:message key="INFO.TYPE_THE_SCRIPT" js="true"/>...",
          mode: 'text/x-sql',
          indentWithTabs: true,
          smartIndent: true,
          lineNumbers: true,
          matchBrackets : true,
          autofocus: true,
          extraKeys: { "Ctrl-Space": "autocomplete" }
        });

        window.editor.on("change", function() {
          updateLayout();
        });

        updateLayout();
      }

      function executeScript() {
        $("#nav-results-tab").tab("show");

        var preloader = document.getElementById("page-preloader");
        preloader.className = "position-absolute d-flex align-items-center justify-content-center bg-white overlay";

        var queryResults = document.getElementById("query-results");
        queryResults.innerHTML = "";

        var scriptLog = document.getElementById("script-log");
        scriptLog.value = "";

        $.post(getAbsolutContextPath() + "executeSql.do?action=executeSql&sys=<%=sys%>", {
          script: window.editor.getValue()
        }, function(response) {
          if (response.results) {
            for (var i = 0; i < response.results.length; i++) {
              designTable(queryResults, i, response.results.length, response.results[i]);
            }
          }

          if (response.output) {
            scriptLog.value = response.output;
          }

          if (response.success === true) {
            new HTMLMessage().showSuccessMessage("<webrun:message key="INFO.SCRIPT_EXECUTE_SUCCESS" js="true"/>", null, null, null, 'DB', true);
          } else if (response.success === false) {
            new HTMLMessage().showErrorMessage("<webrun:message key="ERROR.SCRIPT_EXECUTE_ERROR" js="true"/>", null, null, null, 'DB', true);
          }

          preloader.className = "d-none";
        }).fail(function() {
          $("#nav-script-tab").tab("show");
          preloader.className = "d-none";
          new HTMLMessage().showErrorMessage("<webrun:message key="ERROR.CONNECTION_FAILED" js="true"/>", null, null, null, 'DB', true);
        });
      }

      function collapseAll() {
        $(".collapse").collapse('hide');
      }

      function designTable(div, index, total, tableResults) {
        var tableTargetDiv;
        if (total > 1) {
          var tableIndexHeader = document.createElement("div");
          tableIndexHeader.className = "sticky-top bg-white border-top border-bottom w-100 px-3 py-2 text-dark font-weight-bold";
          tableIndexHeader.innerHTML = (tableResults.sql && tableResults.sql.length > 0) ?
            tableResults.sql : "<webrun:message key="LABEL.QUERY" js="true"/> #" + (index + 1);
          tableIndexHeader.style.cursor = "pointer";
          div.appendChild(tableIndexHeader);

          var tableCollapse = document.createElement("div");
          tableCollapse.className = "collapse";
          div.appendChild(tableCollapse);

          tableTargetDiv = document.createElement("div");
          tableTargetDiv.className = "overflow-auto";
          tableTargetDiv.style.maxHeight = "50vh";
          tableCollapse.appendChild(tableTargetDiv);

          $(tableCollapse).collapse({
            toggle: (index == 0)
          });

          tableIndexHeader.onclick = function() {
            collapseAll();
            $(tableCollapse).collapse("toggle");
          };
        } else {
          tableTargetDiv = document.createElement("div");
          tableTargetDiv.className = "overflow-auto";
          tableTargetDiv.style.maxHeight = "50vh";
          div.appendChild(tableTargetDiv);
        }

        var table = document.createElement("table");
        table.className = "table table-striped mb-0";
        tableTargetDiv.appendChild(table);

        var tableHead = document.createElement("thead");
        tableHead.className = "bg-white border-bottom sticky-top";
        table.appendChild(tableHead);

        var tableHeadTr = document.createElement("tr");
        tableHead.appendChild(tableHeadTr);

        if (tableResults.columns) {
          for (var i = 0; i < tableResults.columns.length; i++) {
            var tableColumn = document.createElement("th");
            tableColumn.innerHTML = tableResults.columns[i];
            tableColumn.setAttribute("scope", "col");
            tableHeadTr.appendChild(tableColumn);
          }
        }

        var tableBody = document.createElement("tbody");
        table.appendChild(tableBody);

        if (tableResults.rows) {
          for (var i = 0; i < tableResults.rows.length; i++) {
            var row = tableResults.rows[i];
            var tableRowTr = document.createElement("tr");
            tableBody.appendChild(tableRowTr);

            for (var j = 0; j < row.length; j++) {
              var tableRowTd = document.createElement("td");
              tableRowTd.innerHTML = row[j];
              tableRowTr.appendChild(tableRowTd);
            }
          }
        } else {
          var noResultsSpan = document.createElement("span");
          noResultsSpan.className = "d-flex align-items-center justify-content-center text-center text-muted w-100 h-100 px-3 py-4";
          noResultsSpan.innerHTML = "<webrun:message key="JS.LABEL.CHAT_SEARCH_NO_RESULTS" js="true"/>";
          tableTargetDiv.appendChild(noResultsSpan);
        }
      }
    </script>
  </head>
  <body class="w-100 h-100 d-flex flex-column">
    <nav class="navbar navbar-light bg-light mb-0">
      <span class="navbar-brand mb-0 h2 d-flex align-items-center"><i class="fas fa-database mr-2" style="font-size: 1.5rem;"></i><webrun:message key="LABEL.EXECUTE_SQL_QUERY"/></span>
    </nav>
    <nav>
      <div class="nav nav-tabs bg-light" id="nav-tab" role="tablist">
        <a class="nav-item nav-link active" id="nav-script-tab" data-toggle="tab" href="#nav-script" role="tab" aria-controls="nav-script" aria-selected="true">Script</a>
        <a class="nav-item nav-link" id="nav-results-tab" data-toggle="tab" href="#nav-results" role="tab" aria-controls="nav-results" aria-selected="false"><webrun:message key="LABEL.RESULTS"/></a>
      </div>
    </nav>
    <div class="tab-content d-flex flex-fill" id="nav-tabContent">
      <div class="tab-pane flex-fill flex-column p-0 show active" id="nav-script" role="tabpanel" aria-labelledby="nav-script-tab">
        <div class="d-flex flex-column h-100">
          <textarea class="form-control-plaintext w-100 p-3" id="script-content" placeholder="<webrun:message key="INFO.TYPE_THE_SCRIPT"/>..."></textarea>
          <div class="d-flex justify-content-end align-items-center border-top w-100 p-3">
            <input type="file" class="d-none" id="script-upload">
            <button type="button" class="btn btn-secondary mr-2" onclick="openScriptUpload();"><webrun:message key="LABEL.IMPORT"/></button>
            <button type="button" class="btn btn-primary" id="execute-button" onclick="executeScript();" disabled="disabled"><webrun:message key="LABEL.EXECUTE"/></button>
          </div>
        </div>
      </div>
      <div class="tab-pane flex-fill flex-column p-0" id="nav-results" role="tabpanel" aria-labelledby="nav-results-tab">
        <div class="d-flex align-items-center bg-light border-bottom w-100 px-3 py-2 text-muted">
          <i class="fas fa-table mr-2" style="font-size: 1.5rem;"></i>
          <span class="font-weight-bold"><webrun:message key="LABEL.RESULTS"/></span>
        </div>
        <div class="w-100" id="query-results"></div>
        <div class="d-flex align-items-center bg-light border-top border-bottom w-100 px-3 py-2 text-muted">
          <i class="fas fa-terminal mr-2" style="font-size: 1.5rem;"></i>
          <span class="font-weight-bold"><webrun:message key="LABEL.LOG_LABEL"/></span>
        </div>
        <textarea class="form-control-plaintext bg-light flex-fill p-3 w-100" id="script-log" readonly="readonly" style="min-height: 10rem;"></textarea>
      </div>
    </div>
    <div class="d-none" id="page-preloader">
      <div class="spinner-border text-primary" role="status" style="width: 2rem; height: 2rem;">
        <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
      </div>
    </div>
  </body>
</html>
</webrun:controller>
