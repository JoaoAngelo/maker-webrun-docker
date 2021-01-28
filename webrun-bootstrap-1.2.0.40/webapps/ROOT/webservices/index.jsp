<%@page import="wfr.rules.WebServiceExporter"%>
<%@page import="java.util.List"%>
<%@taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%
  String userAgent = request.getHeader("user-agent");
  boolean isInternetExplorer = (userAgent != null && (userAgent.contains("rv:11.0") || userAgent.contains("Trident")));
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <title><webrun:message key="LABEL.WEBSERVICES_LIST"/></title>
    <link rel="stylesheet" type="text/css" href="../assets/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="../assets/pages/systems.css">
  </head>
  <body class="w-100 h-100 bg-light">
    <div class="container py-5 px-md-0 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-sm-12<% if (isInternetExplorer) { %> h-100<% } %> d-flex justify-content-center align-items-center flex-column flex-nowrap position-relative">
          <div class="card bg-white position-relative w-100 shadow d-inline-flex" id="main-card" style="max-width: 40rem;">
            <div class="card-body">
              <h5 class="card-title mb-0"><webrun:message key="LABEL.WEBSERVICES_LIST"/></h5>
            </div>
            <div class="list-group list-group-flush">
              <%
                int i = 0;
                List<WebServiceExporter.WebServiceDefinition> list = WebServiceExporter.getListOfWebServices();
                for (WebServiceExporter.WebServiceDefinition def : list) {
                  i++;
              %>
                <a href="<%=def.file%>?wsdl" class="list-group-item list-group-item-action">
                  <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1"><b><%=i%>.</b>&nbsp;&nbsp;<webrun:message key="LABEL.SERVICES_OF"/> <%=def.name%></h6>
                    <small></small>
                  </div>
                  <% if (def.operations != null && def.operations.size() > 0) { %>
                    <% for (String operation : def.operations) { %>
                      <p class="mb-1" style="font-size: 0.95rem;"><i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<%=operation%>()</i></p>
                    <% } %>
                  <% } %>
                </a>
              <% } %>
            </div>
            <div class="card-footer bg-white border-top px-md-4 py-md-3"></div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
