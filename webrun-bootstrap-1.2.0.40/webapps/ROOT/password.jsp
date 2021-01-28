<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%@ page import="wfr.com.WFRSystem" %>
<%@ page import="wfr.util.*" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%
  Logger logger = Logger.getLogger(this.getClass());
  Resources resources = Resources.getInstance(request);

  String sys = request.getParameter("sys");
  HTMLInterface wfr = null;
  try {
    wfr = HTMLInterface.getInstance(request);
    wfr.checkJSPAccess(out, false);
  } catch (Exception e) {
    logger.error(wfr != null ? wfr.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    return;
  }
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="INFO.PASSWORD_CHANGE"/></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <webrun:import src="<%=resources.getI18NFilePath()%>"/>
    <script type="text/javascript">
      function showError(message) {
        var msg = new HTMLMessage();
        msg.showErrorMessage(null, message);
      }

      function showSuccess(message) {
        var msg = new HTMLMessage();
        msg.showSuccessMessage(null, message);
        clearForm();
      }

      function updateLayout() {
        var passField = document.getElementById("pass");
        var newpassField = document.getElementById("newpass");
        var newpass2Field = document.getElementById("newpass2");
        document.getElementById("submit-button").disabled =
          (passField.value == null || passField.value.trim().length == 0) ||
          (newpassField.value == null || newpassField.value.trim().length == 0) ||
          (newpass2Field.value == null || newpass2Field.value.trim().length == 0);
      }

      function clearForm() {
        var passField = document.getElementById("pass");
        var newpassField = document.getElementById("newpass");
        var newpass2Field = document.getElementById("newpass2");
        passField.value = null;
        newpassField.value = null;
        newpass2Field.value = null;
        updateLayout();
      }

      function closeWindow() {
        if (window.frameElement && window.frameElement.close) {
          window.frameElement.close();
        } else if (window.close) {
          window.close();
        }
      }
    </script>
  </head>
  <body class="w-100 h-100">
    <div class="d-flex justify-content-center w-100">
      <iframe class="d-none" name="WFRFormComands" src="javascript:false" width="0" height="0"></iframe>
      <form name="frmPassword" method="post" action="changepassword.do" target="WFRFormComands" class="w-100 h-100 m-0 p-3" style="max-width: 35rem;">
        <input name="sys" type="hidden" value="<%= request.getParameter("sys") %>">
        <input name="action" type="hidden" value="changepassword">
        <h5 class="mb-3"><webrun:message key="LABEL.CHANGE_PASSWORD"/></h5>
        <div class="form-group position-relative">
          <label for="pass"><webrun:message key="LABEL.CURRENT_PASSWORD"/>:</label>
          <input name="pass" type="password" id="pass" class="form-control" oninput="updateLayout();">
        </div>
        <div class="form-group position-relative">
          <label for="newpass"><webrun:message key="LABEL.NEW_PASSWORD"/>:</label>
          <input name="newpass" type="password" id="newpass" class="form-control" oninput="updateLayout();">
        </div>
        <div class="form-group position-relative">
          <label for="newpass2"><webrun:message key="LABEL.CONFIRM_NEW_PASSWORD"/>:</label>
          <input name="newpass2" type="password" id="newpass2" class="form-control" oninput="updateLayout();">
        </div>
        <div class="d-flex justify-content-end w-100">
          <button type="button" class="btn btn-secondary mr-2" onclick="closeWindow();"><webrun:message key="LABEL.CLOSE"/></button>
          <button type="submit" class="btn btn-primary" id="submit-button" disabled="disabled"><webrun:message key="LABEL.CHANGE"/></button>
        </div>
      </form>
    </div>
<webrun:errorMessage forceMethodCall="interactionError"/>
  </body>
</html>
