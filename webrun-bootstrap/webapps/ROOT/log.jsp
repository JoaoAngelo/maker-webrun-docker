<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="wfr.database.*" %>
<%@ page import="java.text.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.sql.*" %>
<%@ page import="wfr.exceptions.ExceptionMessage" %>

<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/xml" prefix="x" %>

<webrun:controller requiresManagerUser="true">

<%
  Logger logger = Logger.getLogger(this.getClass());
  String sys = request.getParameter("sys");
  HTMLInterface htmli = null;

  try {
    htmli = HTMLInterface.getInstance(request);
    htmli.checkJSPAccess((javax.servlet.jsp.JspWriter)out, true);
  } catch (Exception e) {
    logger.error(htmli != null ? htmli.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    return;
  }

  pageContext.setAttribute("htmli", htmli);
  String[] formIDValues = request.getParameterValues("formID");
  String formID = formIDValues.length > 1 ? formIDValues[1] : formIDValues[0];
  formID = Functions.fromISOtoBASE(formID);
  WFRForm form = null;
  if (formID != null && !formID.isEmpty()) {
    form = htmli.getSystem().getForm(formID, htmli.getData().connection());
    pageContext.setAttribute("form", form);
  }

  Resources resources = Resources.getInstance(request);
  String i18nPath = resources.getI18NFilePath();
  SimpleDateFormat sd = htmli.getResources().getDateFormat();



  boolean ipColumnExists = htmli.getIpColumnExist();
  String title;
  String tipoLogURL = request.getParameter("tipoLog");
  String[] tipoLogValues = request.getParameterValues("tipoLog");
  String tipoLog = tipoLogValues.length > 1 ? tipoLogValues[1] : tipoLogValues[0];
  if (tipoLog == null || tipoLog.equals("")) tipoLog = "1";
  if (tipoLog.equals("1")) title = resources.getString(ExceptionMessage.LABEL_RECORD_LOG);
  else title = resources.getString(ExceptionMessage.LABEL_GENERAL_LOG);

  // ######## Efetua o filtro

  DBConnection conn = htmli.getSystem().getAccessConnection(htmli.getData().connection());

  String type = request.getParameter("type");
  String pkeys = Functions.fromISOtoBASE(request.getParameter("pkeys"));
  String usuario = Functions.fromISOtoBASE(request.getParameter("usuario"));  
  String componente = request.getParameter("componentID");
  String valor = Functions.fromISOtoBASE(request.getParameter("valor"));

  StringBuilder sql = new StringBuilder();
  sql.append(" SELECT * FROM FR_LOG_EVENT WHERE ");

  // Filtros
  sql.append(" LOG_SISTEMA = ?");
  if (type != null && type.trim().length() > 0) sql.append(" AND LOG_OPERACAO = ? ");
  if (tipoLog.equals("1") && pkeys != null && pkeys.trim().length() > 0) sql.append(" AND LOG_CHAVECONT = ? ");
  if (formID != null && formID.trim().length() > 0) sql.append(" AND LOG_CODFORM = ? ");
  if (usuario != null && usuario.trim().length() > 0) sql.append(" AND LOG_USUARIO = ? ");

  if (componente != null && valor != null && componente.trim().length() > 0 && valor.trim().length() > 0) {
	  String concatedValues = conn.getMetaData().concatValues("?", "?");

    // NomeDoCampo \t ValorDoCampo \t QualquerCoisa
    // NomeDoCampo \t QualquerCoisa \t ValorDoCampo	
  	sql.append(" AND (LOG_CONTEUDO LIKE (").append(concatedValues).append(") OR LOG_CONTEUDO LIKE (").append(concatedValues).append(")) ");
  }

  sql.append(" ORDER BY LOG_DATA DESC, LOG_HORA DESC ");

  // Cria o PreparedStatement limitando para 200 registros a busca
  PreparedStatement pStmt = conn.getPreparedStatement(sql.toString());
  pStmt.setMaxRows(200);

  // Contador para auxiliar no filtro do Statement
  int cont = 1;

  pStmt.setString(cont++, htmli.getSystem().getRealCode());

  if (type != null && type.trim().length() > 0) pStmt.setString(cont++, type.trim());
  if (tipoLog.equals("1") && pkeys != null && pkeys.trim().length() > 0) pStmt.setString(cont++, pkeys.trim());
  if (formID != null && formID.trim().length() > 0) pStmt.setLong(cont++, Long.parseLong(formID.trim()));
  if (usuario != null && usuario.trim().length() > 0) pStmt.setString(cont++, usuario.trim()); 

  if (componente != null && valor != null && componente.trim().length() > 0 && valor.trim().length() > 0) {
	char tabChar = ((char) '\t');
	pStmt.setString(cont++, "%" + componente.trim() + tabChar);
	pStmt.setString(cont++, "%" + valor.trim() + tabChar + "%");
	pStmt.setString(cont++, "%" + componente.trim() + tabChar + "%");
	pStmt.setString(cont++, tabChar + "%" + valor.trim() + "%");
  }

  ResultSet rSet = pStmt.executeQuery();
%>

<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="LABEL.LOG_LABEL"/></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <%= Functions.legacyMessage() %>    
    <% if (!i18nPath.isEmpty()) { %><script type="text/javascript" src="<%= i18nPath %>"></script><% } %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/sweetalert/sweetalert.min.js"/>    
    <webrun:import src="components/HTMLMessage.js"/>
    <script type="text/javascript">
      function updateComponents(obj) {
        var formID = obj.value;
        document.frm.tipoLog[1].checked = "checked";
        getAndEvalSync("logGetFormFields.do?sys=" + document.frm.sys.value + "&formID=" + formID + "&action=logGetFormFields");
        return true;
      }

      function loadOccurrences(logId) {
        document.getElementById("input-log-id").value = logId;
        document.frm.submit();
      }
    </script>
  </head>
  <body class="w-100 h-100 d-flex flex-column">
    <nav class="navbar navbar-light bg-light border-bottom mb-0">
      <span class="navbar-brand mb-0 h2 d-flex align-items-center"><i class="fas fa-file-alt mr-2" style="font-size: 1.5rem;"></i><webrun:message key="LABEL.LOG_LABEL"/></span>
      <form class="form-inline ml-auto">
        <button class="btn btn-outline-primary" type="button" onclick="document.frm.submit();"><webrun:message key="LABEL.SEARCH"/></button>
      </form>
    </nav>
    <div class="row no-gutters h-100 overflow-auto">
      <div class="col-sm-4 col-md-5 border-right">
        <form name="frm" method="post">
          <input type="hidden" name="sys" value="<c:out value="${param.sys}"/>">
          <input type="hidden" name="pkeys" value="<c:out value="${param.pkeys}"/>">
          <input type="hidden" name="logID" value="" id="input-log-id">

          <div class="w-100 px-3 py-2 bg-light border-bottom text-center text-muted font-weight-bold"><webrun:message key="LABEL.SEARCH_CLAUSULES"/></div>

          <div class="btn-group btn-group-toggle w-100 border-bottom" data-toggle="buttons">
            <label for="rd2" class="btn btn-light rounded-0<% if (tipoLog.equals("1")) { %> active<% } %>">
              <input type="radio" name="tipoLog" value="1" id="rd2" autocomplete="off"<% if (tipoLog.equals("1")) { %> checked="checked"<% } else if(tipoLogURL.equals("2")) { %> disabled="disabled"<% } %>> <webrun:message key="LABEL.RECORD_LOG"/>
            </label>
            <label for="rd1" class="btn btn-light rounded-0<% if (tipoLog.equals("2")) { %> active<% } %>">
              <input type="radio" name="tipoLog" value="2" id="rd1" autocomplete="off"<% if (tipoLog.equals("2")) { %> checked="checked"<% } %>> <webrun:message key="LABEL.GENERAL_LOG"/>
            </label>
          </div>

          <div class="form-group position-relative mb-0 p-3 bg-white border-bottom">
            <label for="input-form-id"><webrun:message key="LABEL.FORM"/></label>
            <select name="formID" id="input-form-id" class="custom-select" onchange="return updateComponents(this);">
              <option value="">-- <webrun:message key="LABEL.SELECT"/> --</option>
              <% int i = 0; %>
              <% String color = "bg-white"; %>
              <c:set var="formsCodeDescription" value="${pageScope.htmli.system.formsClone}"/>
              <c:forEach items="${formsCodeDescription}" var="formMap">
                <c:if test="${formMap.value.description ne '$_FORMULARIO_DO_SISTEMA'}">
                  <%
                    i++;
                    if (i % 2 == 0) color = "bg-white";
                    else color = "bg-light";
                  %>
                  <c:if test="${formMap.key eq pageScope.form.code}" var="select"/>
                  <option class="<%=color%> font-weight-bold" value="<c:out value="${formMap.key}"/>" <c:if test="${select}">selected</c:if>>${webrun:toHTML(webrun:translate(formMap.value.description, form, pageScope.htmli.system.applicationResources))}</option>
                  <c:forEach items="${formMap.value.recursiveDistinctGrids}" var="grid">
                    <option class="<%=color%>" value="<c:out value="${grid.code}"/>">&nbsp;&nbsp;>> ${webrun:toHTML(webrun:translate(grid.description, form, pageScope.htmli.system.applicationResources))}</option>
                  </c:forEach>
                </c:if>
              </c:forEach>
            </select>
          </div>

          <div class="form-group position-relative mb-0 p-3 bg-white border-bottom">
            <label for="input-type"><webrun:message key="LABEL.STATUS"/></label>
            <select name="type" id="input-type" class="custom-select">
              <option value="">-- <webrun:message key="LABEL.SELECT"/> --</option>
              <option value="I" <c:if test="${param.type eq 'I'}">selected</c:if>><webrun:message key="LABEL.INCLUSION"/></option>
              <option value="A" <c:if test="${param.type eq 'A'}">selected</c:if>><webrun:message key="LABEL.ALTERATION"/></option>
              <option value="E" <c:if test="${param.type eq 'E'}">selected</c:if>><webrun:message key="LABEL.EXCLUSION"/></option>
            </select>
          </div>

          <div class="form-group position-relative mb-0 p-3 bg-white border-bottom">
            <label for="input-user"><webrun:message key="LABEL.USER"/></label>
            <input type="text" name="usuario" id="input-user" class="form-control" value="<c:out value="${param.usuario}"/>" placeholder="<webrun:message key="LABEL.USER"/>">
          </div>

          <div class="w-100 px-3 py-2 bg-light border-bottom text-center text-muted font-weight-bold"><webrun:message key="LABEL.CLAUSULE"/></div>

          <div class="form-group position-relative mb-0 p-3 bg-white border-bottom">
            <label for="input-field"><webrun:message key="LABEL.FIELD"/></label>
            <select name="componentID" id="input-field" class="custom-select">
              <option value="">-- <webrun:message key="LABEL.SELECT"/> --</option>
              <c:forEach items="${pageScope.form.components}" var="componentMap">
                <c:if test="${not empty componentMap.value.field}">
                  <c:choose>
                    <c:when test="${not empty componentMap.value.description}">
                      <option value="<c:out value="${componentMap.value.description}"/>" <c:if test="${componentMap.value.description eq param.componentID}">selected</c:if>>${webrun:toHTML(webrun:translate(componentMap.value.description, form, pageScope.htmli.system.applicationResources))}</option>
                    </c:when>
                    <c:otherwise>
                      <option value="<c:out value="${componentMap.value.field}"/>" <c:if test="${componentMap.value.field eq param.componentID}">selected</c:if>><c:out value="${componentMap.value.field}"/></option>
                    </c:otherwise>
                  </c:choose>
                </c:if>
              </c:forEach>
              <% if (Functions.stringToBoolean(htmli.getSystem().getAdvancedProperty("AutenticacaoCentralizada"))) { %>
              <option value="Banco de Dados">-- <webrun:message key="LABEL.DATABASE"/> --</option>
              <% } %>
            </select>
          </div>

          <div class="form-group position-relative mb-0 p-3 bg-white border-bottom">
            <label for="input-value"><webrun:message key="LABEL.VALUE"/></label>
            <input type="text" name="valor" id="input-value" class="form-control" value="<c:out value="${param.valor}"/>" placeholder="<webrun:message key="LABEL.VALUE"/>">
          </div>
        </form>
      </div>

      <div class="col-sm-8 col-md-7">
        <div class="w-100 px-3 py-2 bg-light border-bottom text-center text-muted font-weight-bold"><%= title %></div>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col"><webrun:message key="LABEL.DATE"/></th>
                <th scope="col"><webrun:message key="LABEL.HOUR"/></th>
                <th scope="col"><webrun:message key="LABEL.TYPE"/></th>
                <th scope="col"><webrun:message key="LABEL.USER"/></th>
                <% if(ipColumnExists) { %>
                <th scope="col"><webrun:message key="LABEL.IP"/></th>
                <% } %>
              </tr>
            </thead>
            <tbody>
              <%
                i = 0;
                while (rSet.next()) {
                  i++;
                  String mode = "", modeIcon = "";
                  switch (rSet.getString("LOG_OPERACAO").charAt(0)) {
                    case 'I': mode = resources.getString(ExceptionMessage.LABEL_INCLUSION); modeIcon = "plus"; break;
                    case 'A': mode = resources.getString(ExceptionMessage.LABEL_ALTERATION); modeIcon = "pencil-alt"; break;
                    case 'E': mode = resources.getString(ExceptionMessage.LABEL_EXCLUSION); modeIcon = "times"; break;
                  }
              %>
                <tr style="cursor: pointer;" onclick="loadOccurrences('<%= rSet.getString("LOG_ID") %>');">
                  <td class="text-center"><span class="fas fa-<%= modeIcon %>" style="font-size: 1.25rem; line-height: 1rem;"></span></td>
                  <td><%= sd.format(new java.util.Date(rSet.getDate("LOG_DATA").getTime())) %></td>
                  <td><%= rSet.getString("LOG_HORA") %></td>
                  <td><%= mode %></td>
                  <td><%= rSet.getString("LOG_USUARIO") %></td>
                  <% if (ipColumnExists) { %>
                  <td><%= rSet.getString("LOG_IP") != null ? rSet.getString("LOG_IP") : "" %></td>
                  <% } %>
                </tr>
              <% } %>
            </tbody>
          </table>
        </div>
        <% if (i == 0) { %>
        <span class="d-flex align-items-center justify-content-center text-center text-muted w-100 px-3 py-4">
          <webrun:message key="JS.LABEL.CHAT_SEARCH_NO_RESULTS"/>
        </span>
        <% } %>

        <div class="w-100 px-3 py-2 bg-light border-top border-bottom text-center text-muted font-weight-bold"><webrun:message key="LABEL.OCCURRENCES"/></div>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col"><webrun:message key="LABEL.FIELD"/></th>
                <th scope="col"><webrun:message key="LABEL.PREVIOUS_CONTENT"/></th>
                <th scope="col"><webrun:message key="LABEL.CURRENT_CONTENT"/></th>
              </tr>
            </thead>
            <tbody>
              <%
                i = 0;
                if (request.getParameter("logID") != null && !request.getParameter("logID").isEmpty()) {
                  ResultSet rs = htmli.getSystem().getAccessConnection(conn).getResultSet("SELECT * FROM FR_LOG_EVENT WHERE LOG_ID = " + request.getParameter("logID"));
                  if (rs.next()) {
                    String s = rs.getString("LOG_CONTEUDO");
                    if (s == null) s = "";
                    StringTokenizer line = new StringTokenizer(s, "\n");
                    while (line.hasMoreTokens()) {
                      String[] data = line.nextToken().split("\t");
      
                      i++;
                      String f = "", ca = "", cn = "";
                      if (data.length > 0) f = data[0];
                      if (data.length > 1) ca = data[1];
                      if (data.length > 2) cn = data[2];
                  %>
                  <tr>
                    <td></td>
                    <td><%= Functions.stringToHTMLString(Functions.translate(f, (String)null, htmli.getSystem().getApplicationResources())) %></td>
                    <td><%= ca %></td>
                    <td><%= cn %></td>
                  </tr>
                  <%
                    }
                  }
                }
              %>
            </tbody>
          </table>
        </div>
        <% if (i == 0) { %>
        <span class="d-flex align-items-center justify-content-center text-center text-muted w-100 px-3 py-4">
          <webrun:message key="JS.LABEL.CHAT_SEARCH_NO_RESULTS"/>
        </span>
        <% } %>
      </div>
    </div>
  </body>
</html>
</webrun:controller>
