<%@page import="wfr.database.DBConnection"%>
<%@page import="java.util.Map"%>
<%@page import="wfr.com.WFREFile"%>
<%@page import="wfr.com.WFRSystem"%>
<%@page import="wfr.sys.HTMLInterface.HTMLConstants"%>
<%@page import="wfr.sys.HTMLInterface.HTMLInterface"%>
<%@page import="wfr.sys.HTMLInterface.HTMLAdminInterface"%>
<%@page import="wfr.sys.WFRLoader"%>
<%@page import="wfr.util.Functions"%>
<%@page import="wfr.util.Logger"%>
<%@page import="wfr.util.Resources"%>
<%@page import="wfr.util.WFRConfig"%>
<%@page import="wfr.exceptions.ExceptionMessage"%>
<%@page import="wfr.exceptions.WFRAccessDenied"%>
<%@taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
  Logger logger = Logger.getLogger(this.getClass());
  String sys = request.getParameter("sys");
  Integer conCode;
  try {
    conCode = new Integer(request.getParameter("conCode"));
  } catch (NumberFormatException e) {
    conCode = new Integer(0);
  }

  Boolean isSubconnections = (request.getParameter("type") != null && request.getParameter("type").equalsIgnoreCase("subconnections"));

  Functions.setWebrunSelectedSystemCookie(response, sys);
  Resources resources = Resources.getInstance(request);
  HTMLAdminInterface wfr = null;

  try {
    if (isSubconnections) {
      HTMLInterface htmlInterface = (HTMLInterface)request.getSession().getAttribute("WFR" + sys);
      if (htmlInterface == null || htmlInterface.getSystem() == null) {
        htmlInterface = HTMLInterface.getInstance(request);
        htmlInterface.setRemoteAddress(request.getRemoteAddr());
        htmlInterface.setRemoteHost(request.getRemoteHost());
      }

      if (htmlInterface == null || !htmlInterface.isManager()) {
        throw new WFRAccessDenied(ExceptionMessage.ERROR_DENIED_ACCESS);
      }
    } else {
      wfr = (HTMLAdminInterface) request.getSession().getAttribute("WFRAdmin");
      if (wfr == null) {
        wfr = new HTMLAdminInterface(resources);
        request.getSession().setAttribute("WFRAdmin", wfr);
      }

      wfr.checkJSPAccess(out);
    }
  } catch (Exception e) {
    logger.error(WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    return;
  }

  pageContext.setAttribute("conCode", conCode);

  String passwordField;
  if (isSubconnections) {
    passwordField = request.getAttribute("passwordField") == null ? "" : request.getAttribute("passwordField").toString();
    pageContext.setAttribute("wfre", request.getAttribute("wfre"));
  } else {
    Map<Integer, WFREFile> mapa = (Map<Integer, WFREFile>)request.getSession().getAttribute(sys + "_connections");
    WFREFile wfre;
    if (mapa != null) {
      wfre = mapa.get(conCode);
      request.setAttribute("connections", mapa);
    } else {
      wfre = WFRLoader.getWFREFile(sys);
    }

    if (wfre.getDBType().equals("ADO")) {
      wfre = DBConnection.convert(wfre);
    }

    pageContext.setAttribute("wfre", wfre);
  	passwordField = WFRConfig.database().get(wfre.getDBType(), "PasswordField");
  }

  pageContext.setAttribute("passwordField", passwordField);
  pageContext.setAttribute("passwordFieldLower", passwordField.toLowerCase());
  pageContext.setAttribute("passwordFieldUpper", passwordField.toUpperCase());

  String status = request.getParameter("status");
  String msgKey = (request.getParameter("message") == null) ? null :
    WFRLoader.errorMessagesManager.get(request.getParameter("message"));

  String i18nPath = resources.getI18NFilePath();
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <% if (isSubconnections) { %>
    <title><webrun:message key="LABEL.CONFIGURE_SUBCONNECTIONS"/> - <%=sys%></title>
    <% } else { %>
    <title><webrun:message key="LABEL.SYSTEM_CONFIGURATION"/> - <%=sys%></title>
    <% } %>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <link rel="stylesheet" type="text/css" href="assets/pages/systems.css">
    <% if (!i18nPath.isEmpty()) { %><script type="text/javascript" src="<%= i18nPath %>"></script><% } %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <% if (msgKey != null && status != null && (status.equals("2") || status.equals("3") || status.equals("4"))) { %>
    <script type="text/javascript">
      <% if (status.equals("2")) { %>
      new HTMLMessage().showSuccessMessage('<%= msgKey %>', null, null, null, 'DB', true);
      <% } else if (status.equals("4")) { %>
      new HTMLMessage().showInfoMessage('<%= msgKey %>', null, null, 'DB', true);
      <% } else { %>
      new HTMLMessage().showErrorMessage('<%= msgKey %>', null, null, null, 'DB', true);
      <% } %>
    </script>
    <% } %>
    <script type="text/javascript">
      function loadAllConnections() {
        document.body.style.cursor = "wait";
        var link = document.getElementById("load-connections");
        if (link) link.style.cursor = "wait";
        executeAction("loadAllConnections");
      }

      function newParam() {
        var newParameter = window.prompt('<webrun:message key="LABEL.PARAMETER_NAME" js="true"/>', '');
        if (newParameter == null) return false;
        if (trim(newParameter) != "") {
          document.adminForm.elements["parameter"].value = newParameter;
          executeAction("configNewParameter");
        } else {
          alert('<webrun:message key="LABEL.UNDEFINED_PARAMETER" js="true"/>');
        }
      }

      function removeParam(param, msg) {
        if (param != null && trim(param) != "") {
          if (window.confirm(msg)) {
            document.adminForm.elements["parameter"].value = param;
            executeAction("configRemoveParameter");
          }
        } else {
          alert('<webrun:message key="LABEL.UNDEFINED_PARAMETER" js="true"/>');
        }
      }

      function executeAction(action) {
        <% if (isSubconnections) { %>
        document.adminForm.elements["action"].value = "ConfigureSubconnections";
        document.adminForm.elements["subconnectionsAction"].value = action;
        <% } else { %>
        document.adminForm.elements["action"].value = action;
        document.adminForm.elements["subconnectionsAction"].value = "";
        <% } %>
        document.adminForm.submit();
      }
    </script>
  </head>
  <body class="w-100 h-100">
    <div class="d-flex justify-content-center w-100">
      <% if (isSubconnections) { %>
      <form name="adminForm" action="configureSubconnections.do" class="flex-fill" style="max-width: 35rem;">
      <% } else { %>
      <form name="adminForm" action="admincore" method="post" class="flex-fill" style="max-width: 35rem;">
      <% } %>
        <input name="action" type="hidden" value=""/>
        <input name="subconnectionsAction" type="hidden" value=""/>
        <input name="parameter" type="hidden" value=""/>
        <input name="sys" type="hidden" value="<%=sys%>"/>
        <input name="activeCon" type="hidden" value="${conCode}"/>
        <input name="withSubconections" type="hidden" value="${not empty connections}"/>
  
        <div class="list-group list-group-flush">
          <div class="list-group-item bg-light p-3 d-flex align-items-center">
            <b class="text-muted flex-fill"><webrun:message key="LABEL.ADVANCED_SETUP"/></b>
            <button type="button" class="btn btn-secondary" onclick="newParam();"><webrun:message key="LABEL.NEW_PARAMETER"/></button>
          </div>
  
          <div class="list-group-item">
            <h5 class="mb-2"><webrun:message key="LABEL.CONNECTIONS"/></h5>
  
            <c:choose>
              <c:when test="${not empty connections}">
                <% if (isSubconnections) { %>
                <select name="conCode" class="custom-select" onchange="executeAction('');">
                <% } else { %>
                <select name="conCode" class="custom-select" onchange="executeAction('changeActiveConnection');">
                <% } %>
  
                <c:forEach items="${connections}" var="item">
                  <c:choose>
                    <c:when test="${conCode eq item.key}">
                      <c:set var="connectionSelected" value="selected"/>
                    </c:when>
                    <c:otherwise>
                      <c:set var="connectionSelected" value=""/>
                    </c:otherwise>
                  </c:choose>
                  <option ${connectionSelected} value="${item.key}">${item.value.name}</option>
                </c:forEach>
                </select>
              </c:when>
              <c:otherwise>
                <a href="#" id="load-connections" onclick="loadAllConnections();"><webrun:message key="LABEL.CONFIGURE_SUBCONNECTIONS"/></a>
              </c:otherwise>
            </c:choose>
          </div>
  
          <c:forEach items="${pageScope.wfre.parameters}" var="item">
            <c:choose>
              <c:when test="${(item.key eq passwordField) or (item.key eq passwordFieldUpper) or (item.key eq passwordFieldLower)}">
                <c:set var="inputType" value="password"/>
                <c:set var="inputValue" value="$password$"/>
              </c:when>
              <c:otherwise>
                <c:set var="inputType" value="text"/>
                <c:set var="inputValue" value="${item.value}"/>
              </c:otherwise>
            </c:choose>
  
            <webrun:message var="confirm_remove" key="INFO.CONFIRM_REMOVE_PARAMETER" js="true">
              <webrun:messageParam>${item.key}</webrun:messageParam>
            </webrun:message>
  
            <div class="list-group-item">
              <h5 class="mb-2"><c:out value="${item.key}"/></h5>
              <div class="input-group">
                <input class="form-control" type="<c:out value="${inputType}"/>" name="CONF_<c:out value="${item.key}"/>" value="<c:out value="${inputValue}"/>"/>
                <div class="input-group-append">
                  <button type="button" class="btn btn-danger px-2 py-0" onclick="removeParam('<c:out value="${item.key}"/>', '<c:out value="${pageScope.confirm_remove}"/>')">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </c:forEach>
        </div>
      </form>
    </div>
    <script type="text/javascript">
      function showMsg() {
        <c:if test="${not empty param.msg}">
          alert('<%=Functions.stringToJs(Functions.fromISOtoBASE(request.getParameter("msg")))%>');
        </c:if>
        <c:if test="${not empty param.last}">
          document.adminForm.elements['CONF_<c:out value="${param.last}"/>'].focus();
        </c:if>
      }
    </script>
  </body>
</html>