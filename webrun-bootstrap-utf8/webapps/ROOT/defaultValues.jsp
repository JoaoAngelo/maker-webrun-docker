<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true">

<%@ page import="java.util.*, java.sql.ResultSet, java.text.SimpleDateFormat" %>
<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="wfr.util.*"%>
<%
  HTMLInterface htmlInterface = (HTMLInterface) request.getAttribute("htmlInterface");
  pageContext.setAttribute("interface", htmlInterface);
  Logger logger = Logger.getLogger(this.getClass());

  String sys = request.getParameter("sys");
  pageContext.setAttribute("sys", sys);

  String formID = Functions.fromISOtoBASE(request.getParameter("formID"));
  pageContext.setAttribute("formID", formID);

  // Obtém o form
  WFRForm form = htmlInterface.getSystem().getForm(formID, htmlInterface.getData().connection());
  pageContext.setAttribute("form", form);

  // Preenche a lista a ser mostrada na tela
  Iterator<WFRComponent> componentsIt = form.getScreenEditableAllFormsComponents().iterator();
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <title><webrun:message key="INFO.DEFAULT_VALUE_FIELDS"/></title>
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <webrun:import src="wfr.js"/>
    <script type="text/javascript">
      function updateXML(formId, rowId, fieldName) {
        var check = document.getElementById("field-default-" + rowId);
        if (check.checked) {
          var fieldValue = document.getElementById("field-value-" + rowId).value;
          if (!fieldValue || fieldValue.length == 0) {
            interactionError("Campo Valor é requerido.");
            check.checked = false;
            return false;
          } else {
            var content = getContent("saveFieldDefaultValue.do?sys=<%=sys%>&formID=" + formId + "&fieldName=" + URLEncode(fieldName, "GET") + "&fieldValue=" + URLEncode(fieldValue, "GET"));
            try { eval(content); } catch (e) { }
          }
        } else {
          var content = getContent("removeFieldDefaultValue.do?sys=<%=sys%>&formID=" + formId + "&fieldName=" + URLEncode(fieldName, "GET"));
          try { eval(content); } catch (e) { }
        }
      }

      function updateTabableXML(formId, rowId) {
        var check = document.getElementById("field-tabable-" + rowId);
        var content = getContent("fieldTabeable.do?actionType=" + (check.checked ? "1" : "0") + "&sys=<%=sys%>&formID=" + formId + "&componentCode=" + check.value);
        try { eval(content); } catch (e) { }
      }

      function closeWindow() {
        if (window.frameElement && window.frameElement.close) {
          window.frameElement.close();
        } else if (window.close) {
          window.close();
        }
      }

      function reloadOpenerForm() {
        try {
          var formWindow = parent.getFloatingFormWindowById("<%=formID%>");
          if (formWindow) formWindow.location.reload();
        } catch (e) { }
        closeWindow();
      }
    </script>
  </head>
  <body class="w-100 h-100">
    <form name="WFRForm" class="w-100 h-100">
      <div class="d-flex flex-column w-100 h-100">
        <div class="table-responsive w-100 flex-fill">
          <table class="table table-striped table-hover border-0 mb-0">
            <thead>
              <tr>
                <th scope="col" class="sticky-top bg-white border-0 p-0"><div class="w-100 h-100 px-3 py-2 d-flex align-items-center border-bottom"><webrun:message key="LABEL.DEFAULT"/></div></th>
                <th scope="col" class="sticky-top bg-white border-0 p-0"><div class="w-100 h-100 px-3 py-2 d-flex align-items-center border-bottom"><webrun:message key="LABEL.FIELD"/></div></th>
                <th scope="col" class="sticky-top bg-white border-0 p-0"><div class="w-100 h-100 px-3 py-2 d-flex align-items-center border-bottom"><webrun:message key="LABEL.VALUE"/></div></th>
                <th scope="col" class="sticky-top bg-white border-0 p-0"><div class="w-100 h-100 px-3 py-2 d-flex align-items-center border-bottom"><webrun:message key="LABEL.TABABLE"/></div></th>
              </tr>
            </thead>
            <tbody>
            <%
              int cont = 0; 
              List <WFRMetaData> listPKeys = form.getPrimaryKeys();   
              while (componentsIt.hasNext()) {
                WFRComponent component = componentsIt.next();
                boolean verify = false;
                for (int i = 0; i < listPKeys.size(); i++) {
                  if (component.getField().equalsIgnoreCase(listPKeys.get(i).getDescription())) {
                    verify = true;
                    break;
                  }
                }

                if (!verify) {
                  if ((htmlInterface.getSystem().isSecurityVersion1() || Functions.stringToBoolean(htmlInterface.getSystem().getAdvancedProperty("Seguranca:ValorPadrao"))) && (component.isReadOnly() || !component.isEnabled())) continue;
                  ResultSet rSet = htmlInterface.getData().getFormResultSet(component.getForm().getCodeStr());
                  WFRFieldDefaultValue fieldDefaultValue = htmlInterface.getFieldDefaultValue(component.getForm(), component.getField());
                  boolean check = fieldDefaultValue != null && fieldDefaultValue.getFieldValue() != null;
                  String field = component.getDescription() != null && !component.getDescription().isEmpty() ? component.getDescription() : component.getField();
              %>
              <tr>
                <td>
                  <div class="custom-control custom-checkbox" onclick="event.stopPropagation(); updateXML('<%=component.getForm().getCodeStr()%>', '<%=cont%>', '<%=component.getField()%>');">
                    <input type="checkbox" name="fieldName" id="field-default-<%=cont%>" class="custom-control-input"<% if (check) { %> checked<% } %>>
                    <label class="custom-control-label" for="field-default-<%=cont%>"></label>
                  </div>
                </td>

                <td>
                  <input type="hidden" name="<%=component.getField()%>" id="field-value-<%=cont%>" value="<%=field%>">
                  <span><%=field%></span>
                </td>

                <td><%= check ? component.getDataField().getDataType().getMaskedValue(fieldDefaultValue.getFieldValue()) : component.getDataField().getDataType().getMaskedValue(rSet.getObject(component.getField())) %></td>

                <td>
                  <div class="custom-control custom-checkbox" onclick="event.stopPropagation(); updateTabableXML('<%=component.getForm().getCodeStr()%>', '<%=cont%>');">
                    <input type="checkbox" name="componentCode" id="field-tabable-<%=cont%>" class="custom-control-input"<% if (component.isTabable(htmlInterface)) { %> checked<% } %>>
                    <label class="custom-control-label" for="field-tabable-<%=cont%>"></label>
                  </div>
                </td>
              </tr>
            <%
                  cont++;
                }
              }
            %>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-end bg-light border-top w-100 p-3">
          <button type="button" class="btn btn-primary" onclick="reloadOpenerForm();"><webrun:message key="LABEL.OK"/></button>
        </div>
      </div>
    </form>
  </body>
</html>
</webrun:controller>