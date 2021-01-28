<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLAdminInterface" %>
<%@ page import="wfr.com.WFRSystem" %>

<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <title>Auto Test</title>
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <link rel="stylesheet" type="text/css" href="assets/pages/systems.css">
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
  </head>
  <body class="w-100 h-100 bg-light">
    <div class="container py-5 px-md-0 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-sm-12 d-flex justify-content-center align-items-center">
          <div class="card bg-white position-relative w-100 shadow d-inline-flex" id="autotest-card" style="max-width: 25rem;">
            <form name="WFRAutoTestLogon" id="WFRAutoTestLogon" class="needs-validation" method="post" action="j_security_check">
              <div class="card-body">
                <h5 class="card-title">Auto Test</h5>
                <p class="card-text text-muted"><webrun:message key="INFO.FILL_NAME_PASSWORD_ACCESS"/></p>
  
                <div class="form-group mb-3 row position-relative">
                  <label for="j_username" class="col-sm-3 col-form-label"><webrun:message key="LABEL.USER"/></label>
                  <div class="col-sm-9">
                    <input type="text" name="j_username" id="j_username" class="form-control" placeholder="<webrun:message key="LABEL.USER"/>" autofocus required>
                  </div>
                </div>
                <div class="form-group mb-0 row position-relative">
                  <label for="j_password" class="col-sm-3 col-form-label"><webrun:message key="LABEL.PASSWORD"/></label>
                  <div class="col-sm-9">
                    <input type="password" name="j_password" id="j_password" class="form-control" placeholder="<webrun:message key="LABEL.PASSWORD"/>" required>
                  </div>
                </div>
              </div>
              <div class="card-footer bg-white border-top px-md-4 py-md-3">
                <button type="submit" class="btn btn-primary mr-2"><webrun:message key="LABEL.SIGN_IN"/></button>
                <a href="<%=request.getContextPath()%>" class="btn btn-secondary" role="button"><webrun:message key="LABEL.SYSTEMS"/></a>
              </div>
              <% if (request.getParameter("error") != null && Boolean.valueOf(request.getParameter("error"))) { %>
              <script type="text/javascript">interactionError('<webrun:message key="ERROR.INVALID_USER_OR_PASSWORD" js="true"/>');</script>
              <% } %>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="copyright">Powered by Softwell Maker | Webrun <%=WFRSystem.WEBRUN_VERSION%></div>
  </body>
</html>
