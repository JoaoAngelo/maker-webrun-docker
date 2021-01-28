<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ page import="wfr.exceptions.WFRException" %>
<%@ page import="wfr.exceptions.ExceptionMessage" %>
<webrun:controller allowsExternalAccess="true" checkReportAuthorization="true">

<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%@ page import="wfr.com.WFRSystem" %>
<%@ page import="wfr.com.WFRReport" %>
<%@ page import="wfr.com.WFRAccessPermission" %>

<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="java.util.*" %>
<%@ page import="javax.servlet.http.Cookie" %>
<%@ page import="wfr.database.DBConnection" %>

<%
  HTMLInterface htmlInterface = (HTMLInterface) request.getAttribute("htmlInterface");
  Logger logger = Logger.getLogger(this.getClass());
  Resources resources = Resources.getInstance(request);
  String i18nPath = resources.getI18NFilePath();

  String sys = request.getParameter("sys");
  String reportID = null;
  String filter = null;

  if (Settings.CHARSET.equals("UTF-8")) {
    reportID = request.getParameter("reportID");
    filter = request.getParameter("filter");
  } else {
    reportID = Functions.fromISOtoBASE(request.getParameter("reportID"));
    filter = Functions.fromISOtoBASE(request.getParameter("filter"));
  }

  if (filter == null || filter.equalsIgnoreCase("null") || filter.equalsIgnoreCase("undefined")) filter = "";
  String useFormFields = request.getParameter("useFormFields");
  if (useFormFields == null || useFormFields.equalsIgnoreCase("undefined") || useFormFields.equalsIgnoreCase("null")) useFormFields = "true";

  WFRReport report = null;
  java.sql.ResultSet rs = null;
  java.sql.PreparedStatement st = null;
  try {
    if (!Functions.isNumeric(reportID) && !htmlInterface.getSystem().hasEmbeddedReports()) {
      st = htmlInterface.getData().connection().getPreparedStatement("SELECT REL_CODIGO FROM FR_RELATORIO WHERE REL_NOME = ? AND SIS_CODIGO = ?");
      st.setString(1, reportID);
      st.setString(2, htmlInterface.getSystem().getRealCode());
      rs = st.executeQuery();
      if (rs.next()) {
        reportID = rs.getString("REL_CODIGO");
      } else {
        throw new WFRException(ExceptionMessage.ERROR_REPORT_NAME_NOT_FOUND, new Object[] { reportID });
      }
    }

    report = htmlInterface.getSystem().getReport(reportID, htmlInterface.getData().connection());
    WFRAccessPermission perm = htmlInterface.getSystem().getAccess().getReportPermission(htmlInterface.getAcessUser(), report.getID());

    if (!perm.getVisible() || !perm.getEnabled() || perm.getReadOnly()) {
      throw new WFRException(ExceptionMessage.ERROR_DENIED_ACCESS);
    }
  } catch (Exception e) {
    logger.error(htmlInterface != null ? htmlInterface.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    if (htmlInterface != null) Functions.showException(out, e, resources, null, htmlInterface.getSystem().getApplicationResources());
    else Functions.showException(out, e, resources, null);
    return;
  } finally {
    DBConnection.close(rs);
    DBConnection.close(st);
  }

  if (report.isFormReport()) {
    response.sendRedirect("reportBuilder.jsp?sys=" + sys + "&formID=" + report.getFormReportCode());
    return;
  }

  String formID = "";
  if (Functions.fromISOtoBASE(request.getParameter("formID")) != null && Functions.fromISOtoBASE(request.getParameter("formID")).length() > 0) {
    formID = "&formID=" + Functions.fromISOtoBASE(request.getParameter("formID"));
  }

  String psel = "selected";
  String tsel = "";
  String ssel = "";
  String img  = "view";
  boolean localReportSelected = WFRConfig.config().getBoolean("Relatorio", "GeradorLocalPadrao");

  try {
    if (report.printToFile()) {
      psel = "";
      tsel = "selected";
      img  = "save";
    }
  } catch (Exception e) {
    if (htmlInterface != null) Functions.showException(out, e, resources, null, htmlInterface.getSystem().getApplicationResources());
    else Functions.showException(out, e, resources, null);
  }

  if (htmlInterface.isInternal()) {
    Cookie[] c = request.getCookies();
    for (int i = 0; i < c.length; i++) {
      if (c[i].getName().equals("WFRLOCLAREPORT") && c[i].getValue().equals("1")) localReportSelected = true;
    }
  } else localReportSelected = false;

  if (localReportSelected && psel.length() > 0) {
    psel = "";
    tsel = "";
    ssel = "selected";
  }

  Map<String, WFRField> p = report.getOrderFields();
  List<WFRField> m = new ArrayList<WFRField>();
  for (Object obj : p.values()) {
    m.add((WFRField)obj);
  }
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><%=request.getParameter("title")%></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <% if (!i18nPath.isEmpty()) { %><script type="text/javascript" src="<%= i18nPath %>"></script><% } %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <script type="text/javascript">
      var reportOptWindow = true;
      var arrOrder = new Array();
      var canOpen = true;

      function setArrOrder(i, v) {
        arrOrder[i] = v;
      }

      function clearArrOrder(i, v) {
        arrOrder = new Array();
      }

      function doReport() {
        if (!WFRReportOptions.MM_findObj('exptype')) {
          alert('<webrun:message key="INFO.WAIT_PAGE_LOADING" js="true"/>');
        } else {
          canOpen = false;
          var expType = MM_findObj('exptype');
          WFRReportOptions.MM_findObj('exptype').value = expType.options[expType.selectedIndex].value;
          showMainMessage('<webrun:message key="INFO.WAIT_BUILDING_REPORT" js="true"/>', window);
          WFRReportOptions.MM_findObj('WFRForm').submit();
        }
      }

      function designReport() {
        WFRReportOptions.MM_findObj('designreport').value = 'ON';
        WFRReportOptions.MM_findObj('WFRForm').submit();
        WFRReportOptions.MM_findObj('designreport').value = 'OFF';
      }

      function changeButton(v) {
        var doReportItemIcon = document.getElementById("doreport-item-icon");
        var doReportItemText = document.getElementById("doreport-item-text");

        if (v == 'TXT' || v == 'REM' || v == 'XLS' || v == 'RTF') {
          doReportItemIcon.className = "fas fa-save mr-2";
          doReportItemText.innerHTML = "<webrun:message key="LABEL.SAVE" js="true"/>";
        } else {
          doReportItemIcon.className = "fas fa-file-alt mr-2";
          doReportItemText.innerHTML = "<webrun:message key="LABEL.VIEW" js="true"/>";
        }
      }

      function changeCB(o) {
        if (o.value == 1) MM_findObj('exptype').selectedIndex = 0;
        changeButton(MM_findObj('exptype').value);
      }

      function addFileSufix(stringFile,sufix) {
        indiceLast = stringFile.lastIndexOf(".");
        nameOfFile = stringFile.substring(0,indiceLast);
        extension = stringFile.substr(indiceLast);
        stringFile = nameOfFile + sufix + extension;
        return stringFile;
      }

      function reportOnUnLoadAction() {
        try { get('closereport.do?sys=<%=request.getParameter("sys")%>&action=closereport&reportID=<%=reportID%>'); } catch(e) { }
      }

      function recheck(selectObject, optionText, optionValue) {
        var ovalue = optionValue.replace('|1', '').replace('|0', '');
        for (var i = 0; i < selectObject.options.length; i++){
           if (ovalue == selectObject.options[i].value.replace('|1', '').replace('|0', '')) {
              return true;
           }
        }

        return false;
      }

      function addOption(selectObject, optionText, optionValue) {
          if (!recheck(selectObject, optionText, optionValue)) {
            var optionObject = document.createElement("option");
            optionObject.innerHTML = optionText;
            optionObject.value = optionValue;
            optionObject.className = "p-2";
            selectObject.appendChild(optionObject);
            optionObject.ondblclick = function() { removeField(); };
          } else {
              interactionError('<webrun:message key="INFO.FIELD_ALREADY_CHOSEN" js="true"/>');
          }
      }

      function addField() {
        var fl = document.getElementById("order-fields");
        var ol = document.getElementById("order-list");
        if (fl.selectedIndex != -1) {
          var sortMode = document.querySelector('input[name="sortMode"]:checked').value;
          addOption(ol, '[' + sortMode + '] ' + fl.options[fl.selectedIndex].text, fl.options[fl.selectedIndex].value + ((sortMode == 'DES') ? '|0' : '|1'));
        }
      }

      function removeField() {
        var ol = document.getElementById("order-list");
        if (ol.selectedIndex != -1 && ol.options.length > 0) {
        	ol.options[ol.selectedIndex] = null;
        }
      }

      function updateSort() {
        clearArrOrder();

        var ol = document.getElementById("order-list");
        var order = "";

        for (var i = 0; i < ol.options.length; i++) {
          if (order.length > 0) order += ';';
      	  order += ol.options[i].value;
          setArrOrder(i, ol.options[i].value);
        }

        try { WFRReportOptions.MM_findObj('Order').value = order; } catch (e) { }
        $("#order-modal").modal("hide");
      }
    </script>
  </head>
  <body class="w-100 h-100 d-flex flex-column">
    <nav class="navbar navbar-light navbar-expand-sm bg-light border-bottom mb-0">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <% if ((htmlInterface.isManager()) && (htmlInterface.isDevelopmentMode()) && (report.canDesign())) { %>
          <li class="nav-item">
            <a class="nav-link d-flex align-items-center" href="#" onclick="designReport();"><i class="fas fa-edit mr-2" style="font-size: 1.25rem;"></i><span><webrun:message key="LABEL.DESIGN"/></span></a>
          </li>
          <% } %>
          <li class="nav-item">
            <a class="nav-link d-flex align-items-center" href="#" onclick="doReport();" id="doreport-item"><i class="fas fa-file-alt mr-2" id="doreport-item-icon" style="font-size: 1.25rem;"></i><span id="doreport-item-text"><webrun:message key="LABEL.VIEW"/></span></a>
          </li>
          <% if (!htmlInterface.getWebModule()) { %>
          <li class="nav-item">
            <a class="nav-link d-flex align-items-center" href="#" data-toggle="modal" data-target="#order-modal"><i class="fa fa-sort mr-2" style="font-size: 1.25rem;"></i><span><webrun:message key="LABEL.SORT"/></span></a>
          </li>
          <% } %>
          <li class="nav-item">
            <a class="nav-link d-flex align-items-center" href="#" onclick="window.location.reload();"><i class="fas fa-sync-alt mr-2" style="font-size: 1.25rem;"></i><span><webrun:message key="LABEL.REFRESH"/></span></a>
          </li>
        </ul>
      </div>
    </nav>
    <nav class="navbar navbar-light bg-light border-bottom mb-0">
      <form name="frmImg" class="form-inline" method="post" action="">
        <span class="mr-2"><webrun:message key="LABEL.FORMAT"/></span>
        <select name="exptype" class="custom-select" id="exptype" onkeyup="changeButton(this.value)" onchange="changeButton(this.value)">
          <% if (htmlInterface.isInternal()) { %><option value="SCR" <%=ssel%>><webrun:message key="LABEL.SCREEN"/></option><% } %>
          <option value="PDF" <%= psel %>>PDF</option>
          <option value="HTM">HTML</option>
          <option value="JPG"><webrun:message key="LABEL.IMAGE"/></option>
          <option value="XLS">Excel</option>
          <option value="RTF">RTF</option>
          <option value="TXT" <%= tsel %>><webrun:message key="LABEL.TEXT"/></option>
        </select>
      </form>
    </nav>

    <% if (!htmlInterface.getWebModule()) { %>
    <div class="modal fade" id="order-modal" tabindex="-1" role="dialog" aria-labelledby="order-modal-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="order-modal-title"><webrun:message key="LABEL.SORT"/></h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="<webrun:message key="LABEL.CLOSE"/>">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body p-0">
            <div class="row no-gutters justify-content-center">
              <div class="col-sm-5 d-flex flex-column border-left">
                <div class="w-100 bg-light border-bottom px-3 py-2"><span class="text-muted font-weight-bold"><webrun:message key="LABEL.FIELDS"/></span></div>
                <select name="fields" size="6" class="form-control-plaintext flex-fill" id="order-fields">
                  <%
                    for (int i = 0; i < m.size(); i++) {
                      WFRField f = (WFRField)m.get(i);
                  %>
                  <option class="p-2" ondblclick="addField();" value="<%= f.getTable() + "." + f.getField() %>"><%= f.getDescription() %></option>
                  <% } %>
                </select>
                <div class="bg-light border-top px-3 py-2">
                  <div class="custom-control custom-radio custom-control-inline">
                    <input type="radio" id="sort-mode-radio-1" name="sortMode" value="ASC" class="custom-control-input" checked="checked">
                    <label class="custom-control-label" for="sort-mode-radio-1"><webrun:message key="LABEL.ASCENDANT"/></label>
                  </div>
                  <div class="custom-control custom-radio custom-control-inline">
                    <input type="radio" id="sort-mode-radio-2" name="sortMode" value="DESC" class="custom-control-input">
                    <label class="custom-control-label" for="sort-mode-radio-2"><webrun:message key="LABEL.DESCENDANT"/></label>
                  </div>
                </div>
              </div>
              <div class="col-sm-1 bg-light border">
                <div class="d-flex flex-row-reverse flex-sm-column align-items-center justify-content-center p-3 p-sm-0 h-100">
                  <button type="button" class="btn btn-light ml-2 ml-sm-0 d-none d-sm-inline-flex align-items-center justify-content-center p-sm-2" onclick="addField();">
                    <i class="fas fa-angle-double-right" style="font-size: 1.25rem;"></i>
                  </button>
                  <button type="button" class="btn btn-light mr-2 mr-sm-0 d-none d-sm-inline-flex align-items-center justify-content-center p-sm-2" onclick="removeField();">
                    <i class="fas fa-angle-double-left" style="font-size: 1.25rem;"></i>
                  </button>

                  <button type="button" class="btn btn-light ml-2 ml-sm-0 d-inline-block d-sm-none" onclick="removeField();"><i class="fas fa-angle-double-up" style="font-size: 1.5rem;"></i></button>
                  <button type="button" class="btn btn-light mr-2 mr-sm-0 d-inline-block d-sm-none" onclick="addField();"><i class="fas fa-angle-double-down" style="font-size: 1.5rem;"></i></button>
                </div>
              </div>
              <div class="col-sm-6 d-flex flex-column border-right">
                <div class="w-100 bg-light border-bottom px-3 py-2"><span class="text-muted font-weight-bold"><webrun:message key="LABEL.ORDERED_BY"/></span></div>
                <select name="orderList" size="6" class="form-control-plaintext flex-fill" id="order-list"></select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal"><webrun:message key="LABEL.CLOSE"/></button>
            <button type="button" class="btn btn-primary" onclick="updateSort();"><webrun:message key="LABEL.SORT"/></button>
          </div>
        </div>
      </div>
    </div>
    <% } %>

    <iframe name="WFRReportOptions" src="report.do?sys=<%=request.getParameter("sys")%>&action=report&reportID=<%=reportID%>&componentID=<%=request.getParameter("componentID")%>&type=1&q=<%=formID%>&useFormFields=<%=useFormFields%>&filter=<%=filter%>" class="border-0 w-100 flex-fill"></iframe>
  </body>
</html>
</webrun:controller>