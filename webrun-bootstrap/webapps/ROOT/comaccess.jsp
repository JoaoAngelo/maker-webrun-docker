<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLForm" %>
<%@ page import="wfr.com.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="java.util.*" %>
<%@ page import="wfr.exceptions.ExceptionMessage"%>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller requiresManagerUser="true">
<%
  Logger logger = Logger.getLogger(this.getClass());
  WFRConfig.setContext(getServletConfig().getServletContext(), request);

  String sys = request.getParameter("sys");
  String formID = request.getParameter("form");
  String comID = request.getParameter("com");
  String repID = request.getParameter("report");
  String mnuID = request.getParameter("menu");
  String name = Functions.fromISOtoBASE(request.getParameter("name"));
  String comName = request.getParameter("comName");
  char type = request.getParameter("type") != null ? request.getParameter("type").charAt(0) : 'M';
  Resources resources = Resources.getInstance(request);

  String title = "";
  switch (type) {
    case 'F': title = resources.getString(ExceptionMessage.LABEL_FORM); break;
    case 'M': title = resources.getString(ExceptionMessage.LABEL_MENU); break;
    case 'R': title = resources.getString(ExceptionMessage.LABEL_REPORT); break;
    case 'C': title = resources.getString(ExceptionMessage.LABEL_FORM); break;
  }

  HTMLInterface wfr = null;
  try {
    wfr = HTMLInterface.getInstance(request);
    wfr.checkJSPAccess(out, true);
  } catch (Exception e) {
    logger.error(wfr != null ? wfr.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    return;
  }

  String formPermID = formID;
  String comPermID = comID;
  String reportPermID = repID;
  String menuPermID = mnuID;

  String rnd = String.valueOf((int)(Math.random() * 9999));

  HashMap groups = wfr.getSystem().getAccess().getGroups();
  List g = new ArrayList(groups.values());
  Collections.sort(g);

  Object[] ag = g.toArray();
  String i18nPath = resources.getI18NFilePath();

  String url = "&form=" + (formPermID == null ? "-1" : formPermID) + "&com=" + (comPermID == null ? "-1" : comPermID) + "&report=" + (reportPermID == null ? "-1" : reportPermID) + "&menu=" + (menuPermID == null ? "-1" : menuPermID);

  String columnClass = "col-sm-4";
  int viewMode = 1;
  boolean listButtons = true;

  try {
    javax.json.JsonObject pageConfigJson = wfr.getUserInfo().getComAccessEditorConfig();
    if (pageConfigJson != null) {
      if (pageConfigJson.containsKey("viewMode")) {
        viewMode = pageConfigJson.getInt("viewMode");
        if (viewMode == 1) columnClass = "col-sm-12";
      }

      if (pageConfigJson.containsKey("listButtons")) {
        listButtons = pageConfigJson.getBoolean("listButtons");
      }
    } 
  } catch (Exception e) {
   e.printStackTrace(); 
  }
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="-1">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="LABEL.ACCESS_PERMITIONS"/></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <%= Functions.legacyMessage() %>    
    <link rel="stylesheet" type="text/css" href="assets/pages/systems.css">
    <% if (!i18nPath.isEmpty()) { %><script type="text/javascript" src="<%= i18nPath %>"></script><% } %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/sweetalert/sweetalert.min.js"/>    
    <webrun:import src="components/HTMLMessage.js"/>
    <style>
      #page-overlay { top: 0; bottom: 0; left: 0; right: 0; z-index: 100; background-color: rgba(255, 255, 255, 0.75); }
    </style>
    <script type="text/javascript">
      var mainframe = opener?opener:$mainform().principal;
      var canPaste = ${(not empty sessionScope['permSavedForm']) or (not empty sessionScope['permSavedCom']) or (not empty sessionScope['permSavedReport']) or (not empty sessionScope['permSavedMenu'])};
      var rnd = '<%=rnd%>';

      function setLog(o) {
        var recursiveApply = confirm('<webrun:message key="INFO.APPLY_OPTIONS_TO_DEPENDENTS"/>');
        showPageOverlay(0);
        getAndEval("setlog.do?sys=<%=sys%>&action=setlog&form=<%=formPermID%>&value=" + (o.checked ? 'true' : 'false') + "&recursiveApply=" + recursiveApply);
      }

      function copyPermissions() {
        getAndEval("copyaccess.do?sys=<%=sys%>&action=copyaccess<%=url%>");
      }

      function onPermissionsCopied() {
        canPaste = true;
        interactionInfo("<webrun:message key="INFO.SUCCESSFULLY_COPYED_PERMISSION" js="true"/>");
      }

      function pastePermissions() {
        if (!canPaste) interactionError("<webrun:message key="INFO.NO_COPYED_PERMISSION" js="true"/>");
        else getAndEval("pasteaccess.do?sys=<%=sys%>&action=pasteaccess<%=url%>");
      }

      function onPermissionsPasted() {
        if (mainframe) mainframe.canRefresh = true;
        onPermissionsUpdated();
      }

      function showPageOverlay(type, content) {
        var pageOverlay = document.getElementById("page-overlay");
        var preloader = document.getElementById("preloader");
        var checkmark = document.getElementById("checkmark");
        var checkmarkLabel = document.getElementById("checkmark-label");
        pageOverlay.className = "d-flex align-items-center justify-content-center position-absolute w-100 h-100";

        if (type == 0) {
          preloader.className = "spinner-border text-primary";
          checkmark.className = "d-none";
          checkmarkLabel.className = "d-none";
          checkmarkLabel.innerHTML = "";
        } else if (type == 1) {
          pageOverlay.className += " flex-column";
          preloader.className = "d-none";
          checkmark.className = "success-checkmark d-block";
          checkmarkLabel.className = "w-100 mt-3 text-center text-success font-weight-bold";
          checkmarkLabel.innerHTML = content;
        }
      }

      function hidePageOverlay() {
        var pageOverlay = document.getElementById("page-overlay");
        pageOverlay.className = "d-none";
      }

      function onPermissionsUpdated() {
        showPageOverlay(1, "<webrun:message key="INFO.SUCCESSFULLY_UPDATED_PERMISSION" js="true"/>");
        setTimeout(function() { window.location.reload(); }, 700);
      }

      function changeAll(tp, value, invert) {
        showPageOverlay(0);
        getAndEval("changeallaccess.do?sys=<%=sys%>&action=changeallaccess<%=url%>&type=" + tp + "&value=" + value + "&invert=" + invert);
      }

      var currentViewMode = <%=viewMode%>;
      function changeView(view) {
        if (view == 0) {
          var cols = $(".col-sm-12");
          cols.removeClass("col-sm-12");
          cols.addClass("col-sm-4");
          $('[data-view-mode="1"]').removeClass("active");
          $('[data-view-mode="0"]').addClass("active");
        } else if (view == 1) {
          var cols = $(".col-sm-4");
          cols.removeClass("col-sm-4");
          cols.addClass("col-sm-12");
          $('[data-view-mode="0"]').removeClass("active");
          $('[data-view-mode="1"]').addClass("active");
        }

        currentViewMode = view;
        saveConfigs();
      }

      var listButtons = <% if (listButtons) { %>true<% } else { %>false<% } %>;
      function toggleListButtons() {
        listButtons = !listButtons;
        if (listButtons) {
          $(".page-list-buttons").removeClass("d-none");
          $('[data-config="listButtons"]').html("<webrun:message key="LABEL.HIDE_LIST_BUTTONS" js="true"/>");
        } else {
          $(".page-list-buttons").addClass("d-none");
          $('[data-config="listButtons"]').html("<webrun:message key="LABEL.SHOW_LIST_BUTTONS" js="true"/>");
        }

        saveConfigs();
      }

      function saveConfigs() {
        get("changeAccessPageConfig.do?sys=<%=sys%>&action=changeAccessPageConfig&viewMode=" + currentViewMode + "&listButtons=" + listButtons);
      }

      function updateGroups() {
        showPageOverlay(0);
        getAndEval("accessUpdateGroups.do?sys=<%=sys%>&action=accessUpdateGroups");
      }

      function onGroupsUpdated() {
        showPageOverlay(1, "<webrun:message key="INFO.SUCCESSFULLY_GROUPS_UPDATED" js="true"/>");
        setTimeout(function() { window.location.reload(); }, 1000);
      }

      function postCommands(o, name, code, check) {
        showPageOverlay(0);
        document.getElementById("param-group").value = code;
        document.getElementById("param-enabled").value = '';
        document.getElementById("param-visible").value = '';
        document.getElementById("param-readonly").value = '';
        document.getElementById("param-include").value = '';
        document.getElementById("param-delete").value = '';
        if (document.getElementById("checkbox-enabled" + rnd + code).checked) document.getElementById("param-enabled").value = 'true';
        if (document.getElementById("checkbox-visible" + rnd + code).checked) document.getElementById("param-visible").value = 'true';
        if (document.getElementById("checkbox-readonly" + rnd + code).checked) document.getElementById("param-readonly").value = 'true';
        if (document.getElementById("checkbox-include" + rnd + code).checked) document.getElementById("param-include").value = 'true';
        if (document.getElementById("checkbox-delete" + rnd + code).checked) document.getElementById("param-delete").value = 'true';
        document.getElementById("frmAccess").submit();
      }

      function onCommandsPosted() {
        hidePageOverlay();
      }

      $(document).ready(function() {
        <%-- Inicalizar tooltips do Bootstrap --%>
        bootstrapInitTooltip('[data-toggle="tooltip"]');
      });
    </script>
  </head>
  <body class="w-100 h-100">
    <div class="d-none" id="page-overlay">
      <div class="spinner-border text-primary" role="status" id="preloader">
        <span class="sr-only"><webrun:message key="LABEL.WAIT"/>...</span>
      </div>
      <div class="d-none" id="checkmark">
        <div class="check-icon">
          <span class="icon-line line-tip"></span>
          <span class="icon-line line-long"></span>
        </div>
      </div>
      <label class="d-none" id="checkmark-label"></label>
    </div>

    <nav class="navbar navbar-light navbar-expand-sm bg-light mb-0">
      <span class="navbar-brand mb-0 h2 d-flex align-items-center"><i class="fas fa-shield-alt mr-2" style="font-size: 1.5rem;"></i><webrun:message key="LABEL.ACCESS_PERMITIONS"/></span>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="editDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><webrun:message key="JS.LABEL.EDIT"/></a>
            <div class="dropdown-menu" aria-labelledby="editDropdown">
              <a class="dropdown-item" href="#" onclick="copyPermissions();"><i class="fas fa-copy mr-2"></i><webrun:message key="LABEL.COPY_PERMISSION"/></a>
              <a class="dropdown-item" href="#" onclick="pastePermissions();"><i class="fas fa-clipboard mr-2"></i><webrun:message key="LABEL.PASTE_PERMISSION"/></a>
            </div>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="viewDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><webrun:message key="LABEL.VIEW"/></a>
            <div class="dropdown-menu" aria-labelledby="viewDropdown">
              <a class="dropdown-item d-none d-sm-block<% if (viewMode == 0) { %> active<% } %>" data-view-mode="0" href="#" onclick="changeView(0);"><i class="fas fa-table mr-2"></i><webrun:message key="LABEL.TABLE"/></a>
              <a class="dropdown-item d-none d-sm-block<% if (viewMode == 1) { %> active<% } %>" data-view-mode="1" href="#" onclick="changeView(1);"><i class="fas fa-list-ul mr-2"></i><webrun:message key="LABEL.LIST"/></a>
              <div class="dropdown-divider d-none d-sm-block"></div>
              <a class="dropdown-item" href="#" data-config="listButtons" onclick="toggleListButtons();"><% if (listButtons) { %><webrun:message key="LABEL.HIDE_LIST_BUTTONS"/><% } else { %><webrun:message key="LABEL.SHOW_LIST_BUTTONS"/><% } %></a>
            </div>
          </li>

          <li class="nav-item" onclick="updateGroups();">
            <a class="nav-link" href="#"><webrun:message key="LABEL.UPDATE_GROUPS"/></a>
          </li>

          <% if (type == 'F') { %>
          <li class="nav-item d-flex align-items-center ml-2">
            <div class="custom-control custom-checkbox">
              <input type="checkbox" class="custom-control-input" id="log-checkbox" <%=wfr.getSystem().getAccess().doHTMLLog(formID)%> onchange="setLog(this);">
              <label class="custom-control-label" for="log-checkbox"><webrun:message key="LABEL.LOG"/></label>
            </div>
          </li>
          <% } %>
        </ul>
      </div>
    </nav>

    <nav aria-label="breadcrumb">
      <ol class="breadcrumb align-items-center rounded-0 mb-0">
        <li class="breadcrumb-item"><%=title%></li>
        <%
          boolean menuForm = request.getParameter("menuForm") != null && request.getParameter("menuForm").length() > 0;
          boolean menuReport = request.getParameter("menuReport") != null && request.getParameter("menuReport").length() > 0;
        %>
        <% if (menuForm || menuReport) { %>
        <li class="breadcrumb-item dropdown">
          <button type="button" class="btn btn-secondary dropdown-toggle" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><%=name%></button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <% if (menuForm) { %>
            <a class="dropdown-item" href="#" onclick="top.$mainform().<%= HTMLForm.getFormOpenCommand(wfr.getSystem().getForm(request.getParameter("menuForm"), wfr.getData().connection()), null, -1) %>; closeFloatingFormById(divName);"><i class="fas fa-file-export mr-2"></i><webrun:message key="LABEL.OPEN_FORM"/></a>
            <% } %>

            <% if (menuReport) { %>
            <a class="dropdown-item" href="#" onclick="openReportAccess('<%= wfr.getSystem().getCode() %>', '<%= request.getParameter("menuReport") %>', '<%= name %>');"><i class="fas fa-lock mr-2"></i><webrun:message key="LABEL.OPEN_REPORT"/></a>
            <% } %>
          </div>
        </li>
        <% } else { %>
        <li class="breadcrumb-item active" aria-current="page"><%=name%></li>
        <% } %>

        <% if (comID != null) { %>
        <li class="breadcrumb-item"><webrun:message key="LABEL.COMPONENT"/></li>
        <li class="breadcrumb-item d-flex align-items-center active" aria-current="page"><%=comName%></li>
        <% } %>
      </ol>
    </nav>

    <iframe name="WFRFormComands" src="nothing.html" width="0" height="0" class="d-none position-absolute m-0 border-0 overflow-hidden"></iframe>
    <form name="frmAccess" id="frmAccess" method="post" action="changeaccess.do" target="WFRFormComands">
      <input name="sys" type="hidden" value="<%=sys%>">
      <input name="action" type="hidden" value="changeaccess">
      <input name="group" type="hidden" value="" id="param-group">
      <input name="form" type="hidden" value="<%= formID == null ? "-1" : formID %>">
      <input name="com" type="hidden" value="<%= comID == null ? "-1" : comID %>">
      <input name="report" type="hidden" value="<%= repID == null ? "-1" : repID %>">
      <input name="menu" type="hidden" value="<%= mnuID == null ? "-1" : mnuID %>">

      <%!
        private String makeSelect(String name, String rnd, int type, HTMLInterface wfr, Object[] ag, JspWriter out, String formPermID, String comPermID, String reportPermID, String menuPermID) throws java.io.IOException {
          StringBuilder builder = new StringBuilder();
          builder.append("<ul class=\"list-group list-group-flush\">");

          for (int i = 0; i < ag.length; i++) {
            WFRAccessGroup g = (WFRAccessGroup)ag[i];
            WFRAccessPermission perm = wfr.getSystem().getAccess().getGroupPermission(g.getCode(), formPermID, comPermID, reportPermID, menuPermID);

            builder.append("<li class=\"list-group-item list-group-item-action\" id=\"tr" + name + g.getCode() + "\" onclick=\"document.getElementById('checkbox" + name + g.getCode() + "').click();\">");
            builder.append("<div class=\"custom-control custom-checkbox\" onclick=\"event.stopPropagation();\">");
            builder.append("<input type=\"checkbox\" class=\"custom-control-input\" name=\"" + name + rnd + g.getCode() + "\" id=\"checkbox-" + name + rnd + g.getCode() + "\"");

            if (type == 1 && perm.getVisible() || 
                type == 2 && perm.getEnabled() ||
                type == 3 && perm.getReadOnly() ||
                type == 4 && perm.getInclude() ||
                type == 5 && perm.getDelete()) {
             builder.append(" checked");
            }

            builder.append(" onchange=\"postCommands(this, '" + name + "', " + g.getCode() + ", true);\">");
            builder.append("<label class=\"custom-control-label\" for=\"checkbox-" + name + rnd + g.getCode() + "\">" + g.getDescription() + "</label>");
            builder.append("</li>");
          }

          builder.append("</ul>");
          return builder.toString();
        }
      %>

      <div class="row no-gutters">

        <div class="<%= columnClass %> border-right border-bottom">
          <div class="d-flex flex-row align-items-center w-100 px-3 py-2 bg-light border-top font-weight-bold text-muted">
            <div class="d-flex flex-fill align-items-center"><webrun:message key="LABEL.VISIBLE"/></div>
            <div class="btn-group page-list-buttons<% if (!listButtons) { %> d-none<% } %>">
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.MARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(2, 'true', 'false');"><i class="fas fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.DESMARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(2, 'false', 'false');"><i class="far fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.INVERT"/>" data-toggle="tooltip" onclick="changeAll(2, 'false', 'true');"><i class="fas fa-undo"></i></button>
            </div>
          </div>
          <input name="visible" type="hidden" value="" id="param-visible">
          <%= makeSelect("visible", rnd, 1, wfr, ag, out, formPermID, comPermID, reportPermID, menuPermID) %>
        </div>

        <div class="<%= columnClass %> border-right border-bottom">
          <div class="d-flex flex-row align-items-center w-100 px-3 py-2 bg-light border-top font-weight-bold text-muted">
            <div class="d-flex flex-fill align-items-center"><webrun:message key="LABEL.ENABLE"/></div>
            <div class="btn-group page-list-buttons<% if (!listButtons) { %> d-none<% } %>">
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.MARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(1, 'true', 'false');"><i class="fas fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.DESMARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(1, 'false', 'false');"><i class="far fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.INVERT"/>" data-toggle="tooltip" onclick="changeAll(1, 'false', 'true');"><i class="fas fa-undo"></i></button>
            </div>
          </div>
          <input name="enabled" type="hidden" value="" id="param-enabled">
          <%= makeSelect("enabled", rnd, 2, wfr, ag, out, formPermID, comPermID, reportPermID, menuPermID) %>
        </div>

        <div class="<%= columnClass %> border-right border-bottom">
          <div class="d-flex flex-row align-items-center w-100 px-3 py-2 bg-light border-top font-weight-bold text-muted">
            <div class="d-flex flex-fill align-items-center"><webrun:message key="LABEL.READONLY"/></div>
            <div class="btn-group page-list-buttons<% if (!listButtons) { %> d-none<% } %>">
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.MARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(3, 'true', 'false');"><i class="fas fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.DESMARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(3, 'false', 'false');"><i class="far fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.INVERT"/>" data-toggle="tooltip" onclick="changeAll(3, 'false', 'true');"><i class="fas fa-undo"></i></button>
            </div>
          </div>
          <input name="readonly" type="hidden" value="" id="param-readonly">
          <%= makeSelect("readonly", rnd, 3, wfr, ag, out, formPermID, comPermID, reportPermID, menuPermID) %>
        </div>

        <div class="<%= columnClass %> border-right border-bottom">
          <div class="d-flex flex-row align-items-center w-100 px-3 py-2 bg-light border-top font-weight-bold text-muted">
            <div class="d-flex flex-fill align-items-center"><webrun:message key="LABEL.INCLUDE"/></div>
            <div class="btn-group page-list-buttons<% if (!listButtons) { %> d-none<% } %>">
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.MARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(4, 'true', 'false');"><i class="fas fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.DESMARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(4, 'false', 'false');"><i class="far fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.INVERT"/>" data-toggle="tooltip" onclick="changeAll(4, 'false', 'true');"><i class="fas fa-undo"></i></button>
            </div>
          </div>
          <input name="include" type="hidden" value="" id="param-include">
          <%= makeSelect("include", rnd, 4, wfr, ag, out, formPermID, comPermID, reportPermID, menuPermID) %>
        </div>

        <div class="<%= columnClass %> border-right border-bottom">
          <div class="d-flex flex-row align-items-center w-100 px-3 py-2 bg-light border-top font-weight-bold text-muted">
            <div class="d-flex flex-fill align-items-center"><webrun:message key="LABEL.EXCLUDE"/></div>
            <div class="btn-group page-list-buttons<% if (!listButtons) { %> d-none<% } %>">
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.MARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(5, 'true', 'false');"><i class="fas fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.DESMARK_ALL"/>" data-toggle="tooltip" onclick="changeAll(5, 'false', 'false');"><i class="far fa-check-square"></i></button>
              <button type="button" class="btn btn-secondary py-1" title="<webrun:message key="LABEL.INVERT"/>" data-toggle="tooltip" onclick="changeAll(5, 'false', 'true');"><i class="fas fa-undo"></i></button>
            </div>
          </div>
          <input name="delete" type="hidden" value="" id="param-delete">
          <%= makeSelect("delete", rnd, 5, wfr, ag, out, formPermID, comPermID, reportPermID, menuPermID) %>
        </div>
      </div>
    </form>
  </body>
</html>
</webrun:controller>
