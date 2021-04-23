<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLAdminInterface" %>
<%@ page import="wfr.com.WFRSystem" %>
<%@ page import="wfr.util.Functions" %>
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
    <title>Auto Test</title>
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <%= Functions.legacyMessage() %>
    <link rel="stylesheet" type="text/css" href="assets/pages/systems.css">
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/sweetalert/sweetalert.min.js"/>    
    <webrun:import src="components/HTMLMessage.js"/>
    <style>
      *:not(.section-value) {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .section-value {
        -webkit-touch-callout: default;
        -webkit-user-select: text;
        -khtml-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
        cursor: text;
      }

      .section-item > div {
        word-break: break-word;
      }

      .section-header {
        cursor: pointer;
      }

      .section-collapse {
        flex: 0 0 auto;
      }

      .dropdown-item {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    </style>
    <script type="text/javascript">
      function restartWebrun() {
        document.autoTestForm.action.value = "restart";
        document.autoTestForm.submit();
      }

      <c:if test="${haveFixedSystemDir}">
      function reconfig() {
        document.autoTestForm.action.value = "reconfig";
        document.autoTestForm.submit();
      }
      </c:if>

      function highlightText(value, query) {
        var queryIndex = value.toLowerCase().indexOf(query.toLowerCase());
        return value.substring(0, queryIndex) + "<b>" + value.substring(queryIndex, queryIndex + query.length) + "</b>" + value.substring(queryIndex + query.length, value.length);
      }

      function collapseAll() {
        $(".collapse").collapse('hide'); <%-- Bootstrap --%>
      }

      function search() {
        collapseAll();

        var searchInput = document.getElementById("search-input");
        var contentBody = document.getElementById("content-body");
        var searchBody = document.getElementById("search-body");
        searchBody.innerHTML = "";

        if (searchInput && searchInput.value.trim().length > 0) {
          searchBody.className = "list-group list-group-flush";
          contentBody.className = "d-none";

          var searchValue = searchInput.value.trim().toLowerCase();
          var foundSections = 0;

          var sectionCollapses = contentBody.getElementsByClassName("section-collapse");
          for (var i = 0; i < sectionCollapses.length; i++) {
            var sectionItems = sectionCollapses[i].getElementsByClassName("section-item");
            for (var j = 0; j < sectionItems.length; j++) {
              var sectionKey = sectionItems[j].getElementsByClassName("section-key")[0];
              var sectionValue = sectionItems[j].getElementsByClassName("section-value")[0];

              var sectionKeyContains = sectionKey.innerHTML.trim().toLowerCase().indexOf(searchValue) != -1;
              var sectionValueContains = sectionValue.innerHTML.trim().toLowerCase().indexOf(searchValue) != -1;

              if (sectionKeyContains || sectionValueContains) {
                var sectionClone = sectionItems[j].cloneNode(true);

                sectionKey = sectionClone.getElementsByClassName("section-key")[0];
                sectionKey.className = "section-key";
                if (sectionKeyContains) sectionKey.innerHTML = highlightText(sectionKey.innerHTML, searchValue);

                if (sectionValueContains) {
                  sectionValue = sectionClone.getElementsByClassName("section-value")[0];
                  sectionValue.innerHTML = highlightText(sectionValue.innerHTML, searchValue);
                }

                sectionClone.collapse = sectionCollapses[i];
                sectionClone.onclick = function() {
                  contentBody.className = "list-group list-group-flush";
                  searchBody.className = "d-none";
                  $(this.collapse).collapse("show");
                  searchInput.value = "";
                  searchBody.innerHTML = "";
                };

                searchBody.appendChild(sectionClone);
                foundSections++;
              }
            }
          }

          if (foundSections == 0) {
            var noResultsText = document.createElement("p");
            noResultsText.className = "text-muted w-100 flex-fill p-4 mb-0 border-bottom";
            noResultsText.innerHTML = "<webrun:message key="JS.LABEL.CHAT_SEARCH_NO_RESULTS"/>";
            searchBody.appendChild(noResultsText);
          }
        } else {
          contentBody.className = "list-group list-group-flush";
          searchBody.className = "d-none";
        }
      }

      function handleInputKeys(e, input, callback) {
        if (e.key === "Escape" || e.which === 27) {
          input.value = "";
          if (callback) callback.apply(input);
        }
      }
    </script>
  </head>
  <body class="w-100 h-100 bg-light">
    <form name="autoTestForm" action="autotest" method="post">
      <input type="hidden" name="action" value=""/>
    </form>

    <div class="container py-5 px-md-0 h-100">
      <div class="row justify-content-center align-items-center h-100 mx-0 mx-sm-3 mx-md-5">
        <div class="col-sm-12<% if (isInternetExplorer) { %> h-100<% } %> d-flex justify-content-center align-items-center flex-column flex-nowrap position-relative">
          <div class="card bg-white position-relative w-100 shadow d-inline-flex" id="main-card" style="flex: 0 0 auto;">
            <div class="card-body p-0">
              <nav class="navbar navbar-expand-sm navbar-light">
                <h6 class="navbar-brand mb-0">Auto Test</h6>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#autotest-nav-content" aria-controls="autotest-nav-content" aria-expanded="false">
                  <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse mw-100" id="autotest-nav-content">
                  <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                      <a class="nav-link" href="<c:out value='${pageContext.request.contextPath}'/>"><webrun:message key="LABEL.SYSTEMS"/></a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" href="<c:out value='${pageContext.request.contextPath}'/>/webservices">Web Services</a>
                    </li>
                    <li class="nav-item dropdown">
                      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><webrun:message key="LABEL.ACTIONS"/></a>
                      <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <a class="dropdown-item" href="#" onclick="restartWebrun();"><webrun:message key="LABEL.RESTART_WEBRUN"/></a>
                        <a class="dropdown-item<c:if test="${!haveFixedSystemDir}"> disabled</c:if>" href="#"<c:if test="${haveFixedSystemDir}"> onclick="reconfig();"</c:if>><webrun:message key="LABEL.RELOAD_PUBLISHING_CONFIGURATIONS"/></a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="#" onclick="location.reload();"><webrun:message key="LABEL.REFRESH"/></a>
                      </div>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
            <div class="card-body border-top border-bottom d-flex flex-row flex-nowrap align-items-center px-3 py-1" id="search-header">
              <i class="fas fa-search text-muted mr-3"></i>
              <div class="flex-fill">
                <input type="text" id="search-input" class="form-control-plaintext" style="outline: 0;" placeholder="<webrun:message key="JS.LABEL.CHAT_SEARCH"/>..." oninput="search();" onchange="search();" onkeydown="handleInputKeys(event, this, search);">
              </div>
            </div>
            <div class="list-group list-group-flush" id="content-body">
              <div class="list-group-item list-group-item-action section-header bg-light text-muted border-top-0" data-toggle="collapse" data-target="#webrun-info-collapse" aria-expanded="false" aria-controls="webrun-info-collapse">
                <h6 class="mb-0"><i class="fas fa-globe mr-2"></i>Webrun</h6>
              </div>

              <div class="section-collapse collapse" id="webrun-info-collapse">
                <c:forEach items="${requestScope.webrunInfo.result}" var="result">
                  <div class="section-item list-group-item list-group-item-action d-flex align-items-center">
                    <div class="d-flex flex-column flex-fill text-wrap">
                      <span class="section-key font-weight-bold"><c:out value="${result.value.key}"/></span>
                      <span class="section-value<c:if test="${result.value.error}"> text-danger</c:if>"><c:out value="${result.value.value}"/></span>
                      <small class="text-muted"><c:out value="${result.value.getObs()}" escapeXml="false"/></small>
                    </div>
                    <c:if test="${result.value.error}">
                      <span class="badge badge-danger badge-pill ml-3"><i class="fas fa-exclamation-triangle"></i></span>
                    </c:if>
                  </div>
                </c:forEach>
              </div>

              <div class="list-group-item list-group-item-action section-header bg-light text-muted border-top-0" data-toggle="collapse" data-target="#webrun-home-collapse" aria-expanded="false" aria-controls="webrun-home-collapse">
                <h6 class="mb-0"><i class="fas fa-folder-open mr-2"></i><webrun:message key="LABEL.DIRECTORIES"/></h6>
              </div>

              <div class="section-collapse collapse" id="webrun-home-collapse">
                <c:forEach items="${requestScope.webrunHome.result}" var="result">
                  <div class="section-item list-group-item list-group-item-action d-flex align-items-center">
                    <div class="d-flex flex-column flex-fill text-wrap">
                      <span class="section-key font-weight-bold"><c:out value="${result.value.key}"/></span>
                      <span class="section-value<c:if test="${result.value.error}"> text-danger</c:if>"><c:out value="${result.value.value}"/></span>
                      <small class="text-muted"><c:out value="${result.value.getObs()}" escapeXml="false"/></small>
                    </div>
                    <c:if test="${result.value.error}">
                      <span class="badge badge-danger badge-pill ml-3"><i class="fas fa-exclamation-triangle"></i></span>
                    </c:if>
                  </div>
                </c:forEach>
              </div>

              <div class="list-group-item list-group-item-action section-header bg-light text-muted border-top-0" data-toggle="collapse" data-target="#config-collapse" aria-expanded="false" aria-controls="config-collapse">
                <h6 class="mb-0"><i class="fas fa-cog mr-2"></i><webrun:message key="LABEL.CONFIGURATION_FILES"/></h6>
              </div>

              <div class="section-collapse collapse" id="config-collapse">
                <c:forEach items="${requestScope.configResult.result}" var="result">
                  <div class="section-item list-group-item list-group-item-action d-flex align-items-center">
                    <div class="d-flex flex-column flex-fill text-wrap">
                      <span class="section-key font-weight-bold"><c:out value="${result.value.key}"/></span>
                      <span class="section-value<c:if test="${result.value.error}"> text-danger</c:if>"><c:out value="${result.value.value}"/></span>
                      <small class="text-muted"><c:out value="${result.value.getObs()}" escapeXml="false"/></small>
                    </div>
                    <c:if test="${result.value.error}">
                      <span class="badge badge-danger badge-pill ml-3"><i class="fas fa-exclamation-triangle"></i></span>
                    </c:if>
                  </div>
                </c:forEach>
              </div>

              <div class="list-group-item list-group-item-action section-header bg-light text-muted border-top-0" data-toggle="collapse" data-target="#tests-collapse" aria-expanded="false" aria-controls="tests-collapse">
                <h6 class="mb-0"><i class="fas fa-vial mr-2"></i><webrun:message key="LABEL.TESTS"/></h6>
              </div>

              <div class="section-collapse collapse" id="tests-collapse">
                <c:forEach items="${requestScope.folderWritingResult.result}" var="result">
                  <div class="section-item list-group-item list-group-item-action d-flex align-items-center">
                    <div class="d-flex flex-column flex-fill text-wrap">
                      <span class="section-key font-weight-bold"><c:out value="${result.value.key}"/></span>
                      <span class="section-value<c:if test="${result.value.error}"> text-danger</c:if>"><c:out value="${result.value.value}"/></span>
                      <small class="text-muted"><c:out value="${result.value.getObs()}" escapeXml="false"/></small>
                    </div>
                    <c:if test="${result.value.error}">
                      <span class="badge badge-danger badge-pill ml-3"><i class="fas fa-exclamation-triangle"></i></span>
                    </c:if>
                  </div>
                </c:forEach>
              </div>

              <div class="list-group-item list-group-item-action section-header bg-light text-muted border-top-0" data-toggle="collapse" data-target="#system-info-collapse" aria-expanded="false" aria-controls="system-info-collapse">
                <h6 class="mb-0"><i class="fas fa-info-circle mr-2"></i><webrun:message key="LABEL.SYSTEM_INFO"/></h6>
              </div>

              <div class="section-collapse collapse" id="system-info-collapse">
                <c:forEach items="${requestScope.enviromentVariableResult.result}" var="result">
                  <div class="section-item list-group-item list-group-item-action d-flex align-items-center">
                    <div class="d-flex flex-column flex-fill text-wrap">
                      <span class="section-key font-weight-bold"><c:out value="${result.value.key}"/></span>
                      <span class="section-value<c:if test="${result.value.error}"> text-danger</c:if>"><c:out value="${result.value.value}"/></span>
                      <small class="text-muted"><c:out value="${result.value.getObs()}" escapeXml="false"/></small>
                    </div>
                    <c:if test="${result.value.error}">
                      <span class="badge badge-danger badge-pill ml-3"><i class="fas fa-exclamation-triangle"></i></span>
                    </c:if>
                  </div>
                </c:forEach>
              </div>

              <div class="list-group-item list-group-item-action section-header bg-light text-muted border-top-0" data-toggle="collapse" data-target="#memory-collapse" aria-expanded="false" aria-controls="memory-collapse">
                <h6 class="mb-0"><i class="fas fa-memory mr-2"></i><webrun:message key="LABEL.MEMORY"/></h6>
              </div>

              <div class="section-collapse collapse" id="memory-collapse">
                <c:forEach items="${requestScope.memoryResult.result}" var="result">
                  <div class="section-item list-group-item list-group-item-action d-flex align-items-center">
                    <div class="d-flex flex-column flex-fill text-wrap">
                      <span class="section-key font-weight-bold"><c:out value="${result.value.key}"/></span>
                      <span class="section-value<c:if test="${result.value.error}"> text-danger</c:if>"><c:out value="${result.value.value}"/></span>
                      <small class="text-muted"><c:out value="${result.value.getObs()}" escapeXml="false"/></small>
                    </div>
                    <c:if test="${result.value.error}">
                      <span class="badge badge-danger badge-pill ml-3"><i class="fas fa-exclamation-triangle"></i></span>
                    </c:if>
                  </div>
                </c:forEach>
              </div>
            </div>
            <div class="d-none" id="search-body"></div>
            <div class="card-footer bg-white border-top-0 px-md-4 py-md-3" style="flex: 0 0 auto;"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="copyright">Powered by Softwell Maker | Webrun <%=WFRSystem.WEBRUN_VERSION%></div>
  </body>
</html>
