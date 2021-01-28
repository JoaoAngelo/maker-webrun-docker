<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="java.util.*" %>
<%@ page import="wfr.exceptions.ExceptionMessage" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>

<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/xml" prefix="x" %>

<%
  if (!Functions.checkJSPAccess(request, out)) return;
  List<WFREFile> systems = WFRLoader.systemsList();
  String u = request.getContextPath() + "/admin.jsp?sys=";
  String sys = request.getParameter("sys");
  if (sys != null && request.getParameter("action") != null &&
      request.getParameter("action").compareTo("logout") == 0) {
      request.getSession().removeAttribute("WFR" + sys);
  }

  String status = request.getParameter("status");
  String msgKey = (request.getParameter("message") == null) ? null :
    WFRLoader.errorMessagesManager.get(request.getParameter("message"));

  pageContext.setAttribute("systems", WFRLoader.systemsList());

  Resources resources = Resources.getInstance(request);
  String i18nPath = resources.getI18NFilePath();

  String userAgent = request.getHeader("user-agent");
  boolean isInternetExplorer = (userAgent != null && (userAgent.contains("rv:11.0") || userAgent.contains("Trident")));
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="INFO.WEBRUN_SETUP"/></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <link rel="stylesheet" type="text/css" href="assets/pages/systems.css">
    <% if (!i18nPath.isEmpty()) { %><script type="text/javascript" src="<%= i18nPath %>"></script><% } %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLObject.js"/>
    <webrun:import src="components/HTMLElementBase.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <% if (msgKey != null && status != null && (status.equals("2") || status.equals("3") || status.equals("4"))) { %>
    <webrun:import src="components/HTMLAlert.js"/>
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
    function configureAction() {
      var sys = document.getElementById("inputsyscode").value;
      if (!sys || sys.length == 0) {
        sys = getSysCode();
        if (!sys || sys.length == 0) {
          alert("<webrun:message key="ERROR.SYSTEM_NOT_FOUND" js="true"/>");
          return false;
        }
      }

      openManageSystem(sys);
    }

    function switchCard(currentCard, targetCard) {
      currentCard.removeClass("d-none");
      currentCard.addClass("d-inline-flex");
      currentCard.addClass("animated");
      currentCard.addClass("slideOutLeft");

      setTimeout(function() {
        currentCard.addClass("d-none");
        currentCard.removeClass("d-inline-flex");
        currentCard.removeClass("animated");
        currentCard.removeClass("slideOutLeft");

        targetCard.removeClass("d-none");
        targetCard.addClass("d-inline-flex");
        targetCard.addClass("animated");
        targetCard.addClass("slideInRight");
      }, 400);
    }

    function submitSystemForm(url, msg) {
      if (!msg || window.confirm(msg)) {
        var systemsCardBody = document.getElementById("systems-card-body");
        var systemsCardBodyClass = systemsCardBody.className;
        systemsCardBody.className = "card-body d-flex align-items-center justify-content-center p-5";

        var systemsCardForm = document.getElementById("systems-card-form");
        systemsCardForm.className = "d-none";

        var systemsCardPreloader = document.getElementById("systems-card-preloader");
        systemsCardPreloader.className = "spinner-border text-dark";

        systemsCardForm.action = url;
        systemsCardForm.submit();
      }
    }

    function openUploadWfre(url) {
      var wfreUpload = document.getElementById("wfre-upload");
      wfreUpload.onchange = function(e) {
        if (this.files && this.files.length > 0) {
          submitSystemForm(url);
        }
      };

      wfreUpload.click();
    }

    function openManageSystem(sys) {
      var systemCardBody = document.getElementById("system-card-body");
      var systemCardBodyClass = systemCardBody.className;
      systemCardBody.className = "card-body d-flex align-items-center justify-content-center p-5";

      var systemCardForm = document.getElementById("system-card-form");
      systemCardForm.className = "d-none";

      var systemCardPreloader = document.getElementById("system-card-preloader");
      systemCardPreloader.className = "spinner-border text-dark";

      var advancedSettingsButton = document.getElementById("advanced-setup-button");
      advancedSettingsButton.onclick = function() {
        openAdvancedSettings(sys);
      };

      var mainCard = $("#main-card");
      var systemCard = $("#system-card");
      switchCard(mainCard, systemCard);

      $.get(getAbsolutContextPath() + "admincore?sys=" + URLEncode(sys, 'GET') + "&action=getSystemConfigs",
        function(response) {
          if (response) {
            systemCardPreloader.className = "d-none";
            systemCardBody.className = systemCardBodyClass;
            systemCardForm.className = "d-block";

            var systemCardTitle = document.getElementById("system-card-title");
            systemCardTitle.innerHTML = '<webrun:message key="INFO.SYSTEM_SETUP"/> - ' + sys;

            if (response.instance) {
              var systemCardInstance = document.getElementById("system-card-instance");
              systemCardInstance.value = response.instance;
            }

            if (response.server) {
              var systemCardServer = document.getElementById("system-card-server");
              systemCardServer.value = response.server;
            }

            var systemCardDatabase = document.getElementById("system-card-database");
            if (response.database) {
              systemCardDatabase.disabled = false;
              systemCardDatabase.value = response.database;
            } else {
              systemCardDatabase.disabled = true;
            }

            if (response.user) {
              var systemCardUser = document.getElementById("system-card-user");
              systemCardUser.value = response.user;
            }

            var systemCardPassword = document.getElementById("system-card-password");
            systemCardPassword.value = "$password$";

            var systemCardInitial = document.getElementById("system-card-initial");
            systemCardInitial.value = sys;
          } else {
            switchCard(systemCard, mainCard);
          }
        }).fail(function() {
          switchCard(systemCard, mainCard);
        });
    }

    <webrun:message var="explanation" key="INFO.EXPORT_CODE_EXPLANATION" js="true">
      <webrun:messageParam>SYS</webrun:messageParam>
    </webrun:message>

    var selectedSystem = null;
    var exportationType = null;
    var isCompiling = false;

    function openExportSystem(sys, type) {
      selectedSystem = sys;
      if (type) exportationType = type;
      isCompiling = false;

      var jarExportTab = document.getElementById("jar-export");
      jarExportTab.innerHTML = "<c:out value="${pageScope.explanation}" escapeXml="false"/>".replace(new RegExp("SYS", "g"), sys);

      var exportBody1 = document.getElementById("system-export-body-1");
      var exportBody2 = document.getElementById("system-export-body-2");
      var exportBody3 = document.getElementById("system-export-body-3");
      var exportBody4 = document.getElementById("system-export-body-4");
      var exportBody5 = document.getElementById("system-export-body-5");

      exportBody1.className = "d-block"; <%-- Bootstrap --%>
      exportBody2.className = "d-none"; <%-- Bootstrap --%>
      exportBody3.className = "d-none"; <%-- Bootstrap --%>
      exportBody4.className = "d-none"; <%-- Bootstrap --%>
      exportBody5.className = "d-none"; <%-- Bootstrap --%>

      var compileExportButton = document.getElementById("system-export-button");
      var compileUndoButton = document.getElementById("system-export-undo");

      compileExportButton.className = "btn btn-primary"; <%-- Bootstrap --%>
      compileUndoButton.className = "d-none"; <%-- Bootstrap --%>

      var compileProgressBar = document.getElementById("system-export-progress");
      var compileDescription = document.getElementById("system-export-label");
      var compileDetails = document.getElementById("system-export-details");

      compileDescription.innerHTML = "<webrun:message key="LABEL.LOADING" js="true"/>...";
      compileProgressBar.setAttribute("aria-valuenow", "0"); <%-- Accessibility --%>
      compileProgressBar.style.width = "0%";
      compileDetails.value = "";

      $("#system-export-modal").modal("show");
      $("#jar-export-tab").tab("show");
    }

    $(document).ready(function() {
      <%-- Inicalizar tooltips do Bootstrap --%>
      bootstrapInitTooltip('[data-toggle="tooltip"]');

      var exportReportsCheck = $("#checkGenerateReportsBase");
      var exportRulesCheck = $("#checkGenerateAllRulesBase");
      var compileCheck = $("#checkCompileBase");

      var compileExportButton = document.getElementById("system-export-button");
      var compileUndoButton = document.getElementById("system-export-undo");

      var selectedTab = 0;

      $("#jar-export-tab").on("shown.bs.tab", function(e) {
        if (exportReportsCheck.hasClass("d-none")) { <%-- Bootstrap --%>
          exportReportsCheck.removeClass("d-none"); <%-- Bootstrap --%>
          exportReportsCheck.addClass("d-block"); <%-- Bootstrap --%>
        }

        if (exportRulesCheck.hasClass("d-none")) { <%-- Bootstrap --%>
          exportRulesCheck.removeClass("d-none"); <%-- Bootstrap --%>
          exportRulesCheck.addClass("d-block"); <%-- Bootstrap --%>
        }

        if (compileCheck.hasClass("d-none")) { <%-- Bootstrap --%>
          compileCheck.removeClass("d-none"); <%-- Bootstrap --%>
          compileCheck.addClass("d-block"); <%-- Bootstrap --%>
        }

        compileUndoButton.className = "d-none"; <%-- Bootstrap --%>
        compileExportButton.className = "btn btn-primary"; <%-- Bootstrap --%>

        selectedTab = 0;
      });

      $("#war-export-tab").on("shown.bs.tab", function(e) {
        if (exportReportsCheck.hasClass("d-none")) { <%-- Bootstrap --%>
          exportReportsCheck.removeClass("d-none"); <%-- Bootstrap --%>
          exportReportsCheck.addClass("d-block"); <%-- Bootstrap --%>
        }

        if (exportRulesCheck.hasClass("d-none")) { <%-- Bootstrap --%>
          exportRulesCheck.removeClass("d-none"); <%-- Bootstrap --%>
          exportRulesCheck.addClass("d-block"); <%-- Bootstrap --%>
        }

        if (compileCheck.hasClass("d-block")) { <%-- Bootstrap --%>
          compileCheck.removeClass("d-block"); <%-- Bootstrap --%>
          compileCheck.addClass("d-none"); <%-- Bootstrap --%>
        }

        compileUndoButton.className = "d-none"; <%-- Bootstrap --%>
        compileExportButton.className = "btn btn-primary"; <%-- Bootstrap --%>

        selectedTab = 1;
      });

      $("#undo-exportation-tab").on("shown.bs.tab", function(e) {
        if (exportReportsCheck.hasClass("d-block")) { <%-- Bootstrap --%>
          exportReportsCheck.removeClass("d-block"); <%-- Bootstrap --%>
          exportReportsCheck.addClass("d-none"); <%-- Bootstrap --%>
        }

        if (exportRulesCheck.hasClass("d-block")) { <%-- Bootstrap --%>
          exportRulesCheck.removeClass("d-block"); <%-- Bootstrap --%>
          exportRulesCheck.addClass("d-none"); <%-- Bootstrap --%>
        }

        if (compileCheck.hasClass("d-block")) { <%-- Bootstrap --%>
          compileCheck.removeClass("d-block"); <%-- Bootstrap --%>
          compileCheck.addClass("d-none"); <%-- Bootstrap --%>
        }

        compileExportButton.className = "d-none"; <%-- Bootstrap --%>
        compileUndoButton.className = "btn btn-danger"; <%-- Bootstrap --%>

        selectedTab = 2;
      });

      $("#system-export-button").click(function() {
        <% if (WFRSystem.isStudio()) { %>
        switch (selectedTab) {
          case 0: {
            exportationType = "jar";
            compileSystem(selectedSystem);
            break;
          } case 1: {
            exportationType = "war";
            if (isCompiling) deploySystem(selectedSystem);
            else compileSystem(selectedSystem);
            break;
          }
        }
        <% } else { %>
        new HTMLMessage().showErrorMessage('<%= resources.getString(ExceptionMessage.ERROR_INVALID_VERSION_FOR_RESOURCE, WFRSystem.WEBRUN_VERSION) %>');
        <% } %>
      });

      $("#system-export-undo").click(function() {
        undoExportSystem(selectedSystem);
      });
    });

    <% if (WFRSystem.isStudio()) { %>
    function undoExportSystem(sys) {
      if (isCompiling) return;
      exportationType = "undo";
      isCompiling = false;
      compileSystem(sys); <%-- Exibir carregando --%>

      var exportBody1 = document.getElementById("system-export-body-1");
      var exportBody2 = document.getElementById("system-export-body-2");
      var exportBody3 = document.getElementById("system-export-body-3");
      var exportBody4 = document.getElementById("system-export-body-4");
      var exportBody5 = document.getElementById("system-export-body-5");

      var compileUndoButton = document.getElementById("system-export-undo");
      compileUndoButton.className = "d-none"; <%-- Bootstrap --%>

      $.get('admincore?sys=' + URLEncode(sys, 'GET') + '&action=removeCompiledSystem',
        function(response) {
          isCompiling = false;

          if (response === "1") {
            var compileCheckmark = document.getElementById("system-export-checkmark");
            var compileSuccessMsg = document.getElementById("system-export-success-msg");

            compileCheckmark.className = "success-checkmark d-block";
            compileSuccessMsg.innerHTML = "<webrun:message key="INFO.REMOVED_CODE_GENERATOR" js="true"/>";

            exportBody1.className = "d-none"; <%-- Bootstrap --%>
            exportBody2.className = "d-none"; <%-- Bootstrap --%>
            exportBody3.className = "d-none"; <%-- Bootstrap --%>
            exportBody4.className = "d-block px-4 py-4"; <%-- Bootstrap --%>
            exportBody5.className = "d-none"; <%-- Bootstrap --%>
          } else if (response === "0") {
            var compileCheckmark = document.getElementById("system-export-checkmark");
            var compileSuccessMsg = document.getElementById("system-export-success-msg");

            compileCheckmark.className = "d-none";
            compileSuccessMsg.innerHTML = "<webrun:message key="ERROR.ERROR_NOT_SPECIFIED" js="true"/>";

            exportBody1.className = "d-none"; <%-- Bootstrap --%>
            exportBody2.className = "d-none"; <%-- Bootstrap --%>
            exportBody3.className = "d-none"; <%-- Bootstrap --%>
            exportBody4.className = "d-block px-4 py-4"; <%-- Bootstrap --%>
            exportBody5.className = "d-none"; <%-- Bootstrap --%>
          } else {
            exportBody1.className = "d-none"; <%-- Bootstrap --%>
            exportBody2.className = "d-none"; <%-- Bootstrap --%>
            exportBody3.className = "d-block px-4 pb-4"; <%-- Bootstrap --%>
            exportBody4.className = "d-none"; <%-- Bootstrap --%>
            exportBody5.className = "d-none"; <%-- Bootstrap --%>

            var compileDetails = document.getElementById("system-export-details");
            compileDetails.value = response;
          }
        }).fail(function() {
          isCompiling = false;

          var compileCheckmark = document.getElementById("system-export-checkmark");
          var compileSuccessMsg = document.getElementById("system-export-success-msg");

          compileCheckmark.className = "d-none";
          compileSuccessMsg.innerHTML = "<webrun:message key="ERROR.ERROR_NOT_SPECIFIED" js="true"/>";

          exportBody1.className = "d-none"; <%-- Bootstrap --%>
          exportBody2.className = "d-none"; <%-- Bootstrap --%>
          exportBody3.className = "d-none"; <%-- Bootstrap --%>
          exportBody4.className = "d-block px-4 py-4"; <%-- Bootstrap --%>
          exportBody5.className = "d-none"; <%-- Bootstrap --%>
        });
    }

    function compileSystem(sys) {
      if (isCompiling) return;

      var exportBody1 = document.getElementById("system-export-body-1");
      var exportBody2 = document.getElementById("system-export-body-2");
      var exportBody3 = document.getElementById("system-export-body-3");
      var exportBody4 = document.getElementById("system-export-body-4");
      var exportBody5 = document.getElementById("system-export-body-5");

      exportBody1.className = "d-none"; <%-- Bootstrap --%>
      exportBody2.className = "d-block px-4 pb-4"; <%-- Bootstrap --%>
      exportBody3.className = "d-none"; <%-- Bootstrap --%>
      exportBody4.className = "d-none"; <%-- Bootstrap --%>
      exportBody5.className = "d-none"; <%-- Bootstrap --%>

      var compileCloseButton = document.getElementById("system-export-close");
      var compileCloseButtonClass = compileCloseButton.className;
      var compileModalCloseButton = document.getElementById("system-export-modal-close");
      var compileModalCloseButtonClass = compileModalCloseButton.className;
      var compileExportButton = document.getElementById("system-export-button");
      var compileExportButtonClass = compileExportButton.className;

      if (exportationType == "jar") {
        compileCloseButton.className = "d-none"; <%-- Bootstrap --%>
        compileModalCloseButton.className = "d-none"; <%-- Bootstrap --%>
        compileExportButton.className = "d-none"; <%-- Bootstrap --%>
        compileModalCloseButton.disabled = true;
      }

      var compileProgressBar = document.getElementById("system-export-progress");
      var compileDescription = document.getElementById("system-export-label");
      var compileDetails = document.getElementById("system-export-details");

      isCompiling = true;

      document.pb = {
        setDescription: function(description) {
          compileDescription.innerHTML = description + "...";
        },

        setPercent: function(percent) {
          compileProgressBar.setAttribute("aria-valuenow", percent); <%-- Accessibility --%>
          compileProgressBar.style.width = percent + "%";
        },

        error: function(message) {
          exportBody1.className = "d-none"; <%-- Bootstrap --%>
          exportBody2.className = "d-none"; <%-- Bootstrap --%>
          exportBody3.className = "d-block px-4 pb-4"; <%-- Bootstrap --%>
          exportBody4.className = "d-none"; <%-- Bootstrap --%>
          exportBody5.className = "d-none"; <%-- Bootstrap --%>

          compileDetails.value = message;
          isCompiling = false;

          compileCloseButton.className = compileCloseButtonClass;
          compileModalCloseButton.className = compileModalCloseButtonClass;
          compileExportButton.className = compileExportButtonClass;
          compileModalCloseButton.disabled = false;
        },

        close: function(url, download) {
          isCompiling = false;

          compileCloseButton.className = compileCloseButtonClass;
          compileModalCloseButton.className = compileModalCloseButtonClass;
          compileModalCloseButton.disabled = false;

          var compileCheckmark = document.getElementById("system-export-checkmark");
          var compileSuccessMsg = document.getElementById("system-export-success-msg");

          compileCheckmark.className = "success-checkmark d-block";
          compileSuccessMsg.innerHTML = "<webrun:message key="LABEL.EXPORT_COMPLETE" js="true"/>";

          exportBody1.className = "d-none"; <%-- Bootstrap --%>
          exportBody2.className = "d-none"; <%-- Bootstrap --%>
          exportBody3.className = "d-none"; <%-- Bootstrap --%>
          exportBody4.className = "d-block px-4 py-4"; <%-- Bootstrap --%>
          exportBody5.className = "d-none"; <%-- Bootstrap --%>

          if (download) {
            setTimeout(function() {
              IframeTransporter(url);
              setTimeout(function() {
                $("#system-export-modal").modal("hide");
              }, 1000);
            }, 1200);
          } else {
            compileExportButton.className = compileExportButtonClass;
          }
        }
      };

      if (exportationType == "jar") {
        IframeTransporter('admincore?sys=' + URLEncode(sys, 'GET') + '&action=compile&compileClasses=' + document.getElementById("checkCompile").checked + '&generateReports='+ document.getElementById("checkGenerateReports").checked + '&generateAllRules=' + document.getElementById("checkGenerateAllRules").checked + '&downloadFiles=true', window);
      } else if (exportationType == "war") {
        deploySystem(sys);
      }
    }

    function deploySystem(sys) {
      var exportBody1 = document.getElementById("system-export-body-1");
      var exportBody2 = document.getElementById("system-export-body-2");
      var exportBody3 = document.getElementById("system-export-body-3");
      var exportBody4 = document.getElementById("system-export-body-4");
      var exportBody5 = document.getElementById("system-export-body-5");

      exportBody1.className = "d-none"; <%-- Bootstrap --%>
      exportBody2.className = "d-block px-4 pb-4"; <%-- Bootstrap --%>
      exportBody3.className = "d-none"; <%-- Bootstrap --%>
      exportBody4.className = "d-none"; <%-- Bootstrap --%>
      exportBody5.className = "d-none"; <%-- Bootstrap --%>

      var compileCloseButton = document.getElementById("system-export-close");
      var compileCloseButtonClass = compileCloseButton.className;
      var compileModalCloseButton = document.getElementById("system-export-modal-close");
      var compileModalCloseButtonClass = compileModalCloseButton.className;
      var compileExportButton = document.getElementById("system-export-button");
      var compileExportButtonClass = compileExportButton.className;

      compileCloseButton.className = "d-none"; <%-- Bootstrap --%>
      compileModalCloseButton.className = "d-none"; <%-- Bootstrap --%>
      compileExportButton.className = "d-none"; <%-- Bootstrap --%>
      compileModalCloseButton.disabled = true;

      var url = 'admincore?sys=' + URLEncode(sys, 'GET') + '&GUID=<%= RandomGUID.newGUID() %>&action=deploy&generateEnvironment=true&generateReports=' + document.getElementById("checkGenerateReports").checked + '&generateAllRules=' + document.getElementById("checkGenerateAllRules").checked;
        var inputs = document.getElementById("war-dependences").getElementsByTagName("input");
      for (var i = 0; i < inputs.length; i++) {
          var obj = inputs[i];
        if (obj.type == "checkbox" && !obj.checked) {
          url += ("&" + obj.name + "=0");
        }
      }

      IframeTransporter(url);
    }
    <% } %>

    function openAdvancedSettings(sys) {
      var advancedSettingsFrame = document.getElementById("system-settings-iframe");
      advancedSettingsFrame.src = "advancedAdmin.jsp?sys=" + URLEncode(sys, 'GET');
      $("#system-settings-modal").modal("show");
    }

    function saveAdvancedSettings() {
      var advancedSettingsFrame = document.getElementById("system-settings-iframe");
      if (advancedSettingsFrame.contentWindow && advancedSettingsFrame.contentWindow.executeAction)
        advancedSettingsFrame.contentWindow.executeAction('configChangeAll');
      $("#system-settings-modal").modal("hide");
    }

    function collapseAll() {
      $(".collapse").collapse('hide');
    }

    function highlightText(value, query) {
      var queryIndex = value.toLowerCase().indexOf(query.toLowerCase());
      return value.substring(0, queryIndex) + "<b>" + value.substring(queryIndex, queryIndex + query.length) + "</b>" + value.substring(queryIndex + query.length, value.length);
    }

    function searchSystems() {
      var searchInput = document.getElementById("systems-search-input");
      var contentBody = document.getElementById("systems-list");
      var searchBody = document.getElementById("systems-search-result");
      searchBody.innerHTML = "";

      if (searchInput && searchInput.value.trim().length > 0) {
        searchBody.className = "list-group";
        contentBody.className = "d-none";

        var searchValue = searchInput.value.trim().toLowerCase();
        var foundSections = 0;

        var systemItems = contentBody.getElementsByClassName("system-item");
        for (var j = 0; j < systemItems.length; j++) {
          var systemCode = systemItems[j].getElementsByClassName("system-code")[0];
          var systemName = systemItems[j].getElementsByClassName("system-name")[0];

          var systemCodeContains = systemCode.innerHTML.trim().toLowerCase().indexOf(searchValue) != -1;
          var systemNameContains = systemName.innerHTML.trim().toLowerCase().indexOf(searchValue) != -1;

          if (systemCodeContains || systemNameContains) {
            var sectionClone = systemItems[j].cloneNode(true);

            if (systemCodeContains) {
              systemCode = sectionClone.getElementsByClassName("system-code")[0];
              systemCode.innerHTML = highlightText(systemCode.innerHTML, searchValue);
            }

            if (systemNameContains) {
              systemName = sectionClone.getElementsByClassName("system-name")[0];
              systemName.innerHTML = highlightText(systemName.innerHTML, searchValue);
            }

            searchBody.appendChild(sectionClone);
            foundSections++;
          }
        }

        if (foundSections == 0) {
          var noResultsText = document.createElement("p");
          noResultsText.className = "text-muted w-100 flex-fill p-4 mb-0 border-bottom";
          noResultsText.innerHTML = "<webrun:message key="JS.LABEL.CHAT_SEARCH_NO_RESULTS"/>";
          searchBody.appendChild(noResultsText);
        }
      } else {
        contentBody.className = "list-group";
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
    <div class="container px-md-0 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-sm-12<% if (isInternetExplorer) { %> h-100<% } %> d-flex justify-content-center align-items-center flex-column flex-nowrap position-relative">
          <div class="card bg-white position-relative w-100 shadow" id="main-card" style="max-width: 40rem;">
            <div class="card-body">
              <h5 class="card-title mb-0"><webrun:message key="INFO.SCREEN_SETUP"/></h5>
            </div>

            <div class="list-group list-group-flush">
              <a href="#" onclick="collapseAll(); $('#change-password-collapse').collapse('toggle');" class="list-group-item px-4 py-3 list-group-item-action d-flex align-items-center border-top"><i class="fas fa-lock mr-3" style="width: 1.25rem; font-size: 1.25rem;"></i><webrun:message key="LABEL.CHANGE_PASSWORD"/></a>
              <div class="collapse<% if (msgKey != null && status != null && status.equals("1")) { %> show<% } %>" id="change-password-collapse">
                <div class="bg-light border-bottom p-3">
                  <form name="ChangePasswordForm" id="ChangePasswordForm" class="needs-validation" method="post" action="admincore">
                    <input name="action" type="hidden" id="action" value="changeAdminPassword">
                    <% if (msgKey != null && status != null && status.equals("1")) { %>
                    <div class="alert alert-danger mb-4" role="alert"><%= msgKey %></div>
                    <% } %>
                    <div class="form-group mb-3 row no-gutters position-relative">
                      <label for="input-user" class="col-sm-4 col-form-label"><webrun:message key="LABEL.USER"/></label>
                      <div class="col-sm-8">
                        <input type="text" name="user" id="user" class="form-control" id="input-user" placeholder="<webrun:message key="LABEL.USER"/>" autofocus required>
                      </div>
                    </div>
                    <div class="form-group mb-3 row no-gutters position-relative">
                      <label for="input-password" class="col-sm-4 col-form-label"><webrun:message key="LABEL.PASSWORD"/></label>
                      <div class="col-sm-8">
                        <input type="password" name="password" id="password" class="form-control" id="input-password" placeholder="<webrun:message key="LABEL.PASSWORD"/>" required>
                      </div>
                    </div>
                    <div class="form-group mb-3 row no-gutters position-relative">
                      <label for="input-password" class="col-sm-4 col-form-label"><webrun:message key="LABEL.NEW_PASSWORD"/></label>
                      <div class="col-sm-8">
                        <input type="password" name="newPassword" id="newPassword" class="form-control" id="input-password" placeholder="<webrun:message key="LABEL.NEW_PASSWORD"/>" required>
                      </div>
                    </div>
                    <div class="d-flex w-100 align-items-end justify-content-end">
                      <button type="submit" class="btn btn-secondary float-right"><webrun:message key="LABEL.CHANGE"/></button>
                    </div>
                  </form>
                </div>
              </div>
              <a href="#" onclick="collapseAll(); $('#systems-collapse').collapse('toggle');" class="list-group-item px-4 py-3 list-group-item-action d-flex align-items-center border-top-0"><i class="fas fa-infinity mr-3" style="width: 1.25rem; font-size: 1.25rem;"></i><webrun:message key="LABEL.MANAGE_SYSTEMS"/></a>
              <div class="collapse" id="systems-collapse">
                <div class="bg-light" id="systems-card-body">
                  <form name="adminForm" method="post" action="" enctype="multipart/form-data" id="systems-card-form">
                    <div class="bg-light border-bottom d-flex flex-row flex-nowrap align-items-center px-3 py-1" id="search-header">
                      <i class="fas fa-search text-muted mr-3"></i>
                      <div class="flex-fill">
                        <input type="text" id="systems-search-input" class="form-control-plaintext" style="outline: 0;" placeholder="<webrun:message key="JS.LABEL.CHAT_SEARCH"/>..." oninput="searchSystems();" onchange="searchSystems();" onkeydown="handleInputKeys(event, this, searchSystems);">
                      </div>
                    </div>
                    <div class="list-group" id="systems-list">
                      <c:forEach items="${pageScope.systems}" var="wfre" varStatus="loop">
                        <c:url value="/admincore" var="wfreRemoveFile">
                          <c:param name="action" value="wfreRemoveFile"/>
                          <c:param name="sys"><c:out value="${wfre.code}"/></c:param>
                        </c:url>

                        <webrun:message var="confirm_remove" key="INFO.CONFIRM_REMOVE_SYSTEM" js="true">
                          <webrun:messageParam>${wfre.jsName}</webrun:messageParam>
                        </webrun:message>

                        <div class="list-group-item system-item px-4 py-2 d-flex align-items-center justify-content-center<c:if test="${loop.index % 2 == 1}"> bg-light</c:if>">
                          <div class="row no-gutters w-100">
                            <div class="col-sm-8 d-flex align-items-center flex-row-reverse flex-sm-row flex-wrap">
                              <span class="badge badge-secondary mr-0 mr-sm-2 ml-2 ml-sm-0 system-code"><c:out value="${wfre.code}"/></span>
                              <span class="flex-fill system-name"><c:out value="${wfre.name}"/></span>
                            </div>
                            <div class="col-sm-4 mt-2 mt-sm-0 d-flex align-items-center justify-content-end">
                              <button type="button" class="btn btn-danger py-1" title="<webrun:message key="LABEL.DELETE"/>" data-toggle="tooltip" onclick="submitSystemForm('<c:out value="${wfreRemoveFile}"/>', '<c:out value="${pageScope.confirm_remove}"/>');">
                                <i class="fas fa-trash-alt"></i>
                              </button>
                              <div class="dropdown">
                                <button type="button" class="btn btn-secondary py-1 dropdown-toggle ml-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                  <i class="fas fa-cog"></i>
                                </button>
                                <div class="dropdown-menu" aria-labelledby="dropdown-menu-<c:out value="${wfre.code}"/>">
                                  <a class="dropdown-item" href="admincore?sys=<c:out value="${wfre.code}"/>&action=reset"><webrun:message key="LABEL.RESTART"/></a>
                                  <a class="dropdown-item" href="#" onclick="openExportSystem('<c:out value="${wfre.code}"/>');"><webrun:message key="LABEL.EXPORT"/></a>
                                  <a class="dropdown-item" href="#" onclick="openManageSystem('<c:out value="${wfre.code}"/>');"><webrun:message key="LABEL.SETTINGS"/></a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </c:forEach>

                      <c:url value="/admincore" var="wfreAddFile">
                        <c:param name="action" value="wfreAddFile"/>
                      </c:url>

                      <a href="#" class="list-group-item px-4 py-2 list-group-item-action bg-light d-flex align-items-center justify-content-center border-top-0" onclick="openUploadWfre('<c:out value="${wfreAddFile}"/>');">
                        <input type="file" name="newWfre" class="d-none" id="wfre-upload">
                        <span><webrun:message key="LABEL.ADD_SYSTEM"/>...</span>
                      </a>
                    </div>
                    <div class="d-none" id="systems-search-result"></div>
                  </form>
                  <div class="d-none" role="status" id="systems-card-preloader">
                    <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
                  </div>
                </div>
              </div>
              <a href="admincore?action=hotdeploy" class="list-group-item px-4 py-3 list-group-item-action d-flex align-items-center border-top-0"><i class="fas fa-sync-alt mr-3" style="font-size: 1.25rem;"></i><webrun:message key="INFO.SYSTEMS_RELOAD"/></a>
              <a href="<c:url value="/configManager.jsp"/>" class="list-group-item px-4 py-3 list-group-item-action d-flex align-items-center border-top-0"><i class="fas fa-cogs mr-3" style="width: 1.25rem; font-size: 1.25rem;"></i><webrun:message key="LABEL.CONFIG_PARAMS"/></a>
              <a href="<c:url value="/webservices"/>" class="list-group-item px-4 py-3 list-group-item-action d-flex align-items-center border-0"><i class="fas fa-globe mr-3" style="width: 1.25rem; font-size: 1.25rem;"></i>Web Services</a>
            </div>

            <div class="card-footer bg-white border-top px-md-4 py-md-3 d-flex justify-content-end">
              <a href="<c:url value="/"/>" role="button" class="btn btn-primary"><webrun:message key="LABEL.SYSTEMS"/></a>
            </div>
          </div>

          <div class="card d-none bg-white position-relative w-100 shadow" id="system-card" style="max-width: 25rem;">
            <div class="card-body" id="system-card-body">
              <form name="WFRLogon" method="post" action="admincore" id="system-card-form">
                <h5 class="card-title mb-4" id="system-card-title"><webrun:message key="INFO.SYSTEM_SETUP"/></h5>

                <div class="form-group mb-3 row no-gutters position-relative">
                  <label for="system-card-instance" class="col-sm-3 col-form-label"><webrun:message key="LABEL.INSTANCE"/></label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" name="instance" id="system-card-instance" placeholder="<webrun:message key="LABEL.INSTANCE"/>">
                  </div>
                </div>

                <div class="form-group mb-3 row no-gutters position-relative">
                  <label for="system-card-server" class="col-sm-3 col-form-label"><webrun:message key="LABEL.SERVER"/></label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" name="server" id="system-card-server" placeholder="<webrun:message key="LABEL.SERVER"/>">
                  </div>
                </div>

                <div class="form-group mb-3 row no-gutters position-relative">
                  <label for="system-card-database" class="col-sm-3 col-form-label"><webrun:message key="LABEL.SHORT_DATABASE"/></label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" name="database" id="system-card-database" placeholder="<webrun:message key="LABEL.SHORT_DATABASE"/>">
                  </div>
                </div>

                <div class="form-group mb-3 row no-gutters position-relative">
                  <label for="system-card-user" class="col-sm-3 col-form-label"><webrun:message key="LABEL.USER"/></label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" name="user" id="system-card-user" placeholder="<webrun:message key="LABEL.USER"/>">
                  </div>
                </div>

                <div class="form-group mb-2 row no-gutters position-relative">
                  <label for="system-card-password" class="col-sm-3 col-form-label"><webrun:message key="LABEL.PASSWORD"/></label>
                  <div class="col-sm-9">
                    <input type="password" class="form-control" name="password" id="system-card-password" placeholder="<webrun:message key="LABEL.PASSWORD"/>">
                  </div>
                </div>

                <div class="form-group mb-2 position-relative d-flex justify-content-end mb-0">
                  <button type="button" class="btn btn-link" id="advanced-setup-button"><webrun:message key="LABEL.ADVANCED_SETUP"/></button>
                </div>

                <input name="sys" id="system-card-initial" type="hidden" value="">
                <input name="action" type="hidden" value="change">
              </form>

              <div class="d-none" role="status" id="system-card-preloader">
                <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
              </div>
            </div>

            <div class="card-footer bg-white border-top px-md-4 py-md-3 d-flex justify-content-end">
              <button type="button" class="btn btn-secondary" onclick="switchCard($('#system-card'), $('#main-card'));"><webrun:message key="LABEL.BACK"/></button>
              <button type="button" class="btn btn-primary ml-2" onclick="document.getElementById('system-card-form').submit();"><webrun:message key="LABEL.SAVE"/></button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="modal fade" id="system-export-modal" tabindex="-1" role="dialog" aria-labelledby="system-export-modal-title" aria-hidden="true" data-backdrop="static" data-keyboard="false">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header bg-white border-bottom-0">
            <h5 class="modal-title" id="system-export-modal-title"><webrun:message key="INFO.EXPORT_CODE_GENERATION"/></h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="<webrun:message key="LABEL.CLOSE"/>" id="system-export-modal-close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body p-0" id="system-export-modal-body">
            <div class="d-block" id="system-export-body-1">
              <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item">
                  <a class="nav-link active" id="jar-export-tab" data-toggle="tab" href="#jar-export" role="tab" aria-controls="jar-export" aria-selected="true"><webrun:message key="INFO.EXPORT_CODE_JAR_EXPORT"/></a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" id="war-export-tab" data-toggle="tab" href="#war-export" role="tab" aria-controls="war-export" aria-selected="false"><webrun:message key="INFO.EXPORT_CODE_WAR_PUBLISH"/></a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" id="undo-exportation-tab" data-toggle="tab" href="#undo-exportation" role="tab" aria-controls="undo-exportation" aria-selected="false"><webrun:message key="LABEL.EXPORT_CODE_UNDO"/></a>
                </li>
              </ul>
              <div class="tab-content" id="myTabContent">
                <div class="tab-pane p-3 show active" id="jar-export" role="tabpanel" aria-labelledby="jar-export-tab"></div>
                <div class="tab-pane p-3" id="war-export" role="tabpanel" aria-labelledby="war-export-tab"><webrun:message key="INFO.EXPORT_CODE_DEPENDENCES"/></div>
                <div class="tab-pane p-3" id="undo-exportation" role="tabpanel" aria-labelledby="undo-exportation-tab"><webrun:message key="INFO.EXPORT_CODE_REMOVE_EXPORTED_CLASSES"/></div>
              </div>
              <div class="px-3 pt-1 pb-3">
                <div class="custom-control custom-checkbox d-block" id="checkGenerateReportsBase">
                  <input type="checkbox" class="custom-control-input" id="checkGenerateReports" checked="checked">
                  <label class="custom-control-label" for="checkGenerateReports"><webrun:message key="INFO.EXPORT_REPORTS"/></label>
                </div>
                <div class="custom-control custom-checkbox mt-2 d-block" id="checkGenerateAllRulesBase">
                  <input type="checkbox" class="custom-control-input" id="checkGenerateAllRules">
                  <label class="custom-control-label" for="checkGenerateAllRules"><webrun:message key="INFO.EXPORT_ALL_RULES"/></label>
                </div>
                <div class="custom-control custom-checkbox mt-2 d-block" id="checkCompileBase">
                  <input type="checkbox" class="custom-control-input" id="checkCompile" checked="checked">
                  <label class="custom-control-label" for="checkCompile"><webrun:message key="LABEL.EXPORT_CODE_COMPILE"/></label>
                </div>
              </div>
            </div>

            <div class="d-none" id="system-export-body-2">
              <label class="mb-3 w-100" id="system-export-label"></label>
              <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%" id="system-export-progress"></div>
              </div>
            </div>

            <div class="d-none" id="system-export-body-3">
              <div class="media">
                <span class="fas fa-times text-danger align-self-start ml-2 mr-4" style="font-size: 3rem;"></span>
                <div class="media-body">
                  <p><webrun:message key="ERROR.ERROR_NOT_SPECIFIED"/></p>
                  <textarea class="form-control" id="system-export-details" style="font-size: 0.8rem; height: 137px;" readonly="readonly"></textarea>
                </div>
              </div>
            </div>

            <div class="d-none" id="system-export-body-4">
              <div id="system-export-checkmark">
                <div class="check-icon">
                  <span class="icon-line line-tip"></span>
                  <span class="icon-line line-long"></span>
                </div>
              </div>
              <label class="w-100 mt-3 text-center text-success" style="font-size: 1.2rem;" id="system-export-success-msg"></label>
            </div>

            <div class="d-none" id="system-export-body-5">
              <p class="mb-3"><webrun:message key="INFO.SEND_CONFIGURATION_FILES"/></p>

              <div class="custom-control custom-radio custom-control-inline">
                <input type="radio" id="war-include-configs-yes" name="war-include-configs" class="custom-control-input" value="true">
                <label class="custom-control-label" for="war-include-configs-yes"><webrun:message key="LABEL.YES"/></label>
              </div>

              <div class="custom-control custom-radio custom-control-inline">
                <input type="radio" id="war-include-configs-no" name="war-include-configs" class="custom-control-input" checked="checked" value="false">
                <label class="custom-control-label" for="war-include-configs-no"><webrun:message key="LABEL.NO"/></label>
              </div>

              <div class="d-none" id="war-dependences">
                <p class="mb-3"><webrun:message key="LABEL.DEPENDENCES_SELECT"/>:</p>
                <c:import url="/webrun/dependences.xml" var="xmlFile" charEncoding="${webrun:charset()}"/>
                <x:parse varDom="dom" xml="${xmlFile}"/>
                <x:forEach var="group" select="$dom/dependences/group">
                  <c:set var="inputStatus" value="checked"/>
                  <c:if test="<%=WFRSystem.isProfessionalType()%>">
                    <x:if select="$group/@name='Conector DB2'">
                      <c:set var="inputStatus" value="disabled"/>
                    </x:if>
                  </c:if>
                  <c:if test="<%=WFRSystem.isStandardType()%>">
                    <x:if select="$group/@name='Conector DB2'">
                      <c:set var="inputStatus" value="disabled"/>
                    </x:if>
                    <x:if select="$group/@name='Conector SQL Server'">
                      <c:set var="inputStatus" value="disabled"/>
                    </x:if>
                  </c:if>
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="war-dependence-<x:out select="$group/@name"/>" name="Dependence_<x:out select="$group/@name"/>" ${inputStatus}>
                    <label class="custom-control-label" for="war-dependence-<x:out select="$group/@name"/>"><x:out select="$group/@name"/></label>
                  </div>
                </x:forEach>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal" id="system-export-close"><webrun:message key="LABEL.CLOSE"/></button>
            <button type="button" class="btn btn-primary" id="system-export-button"><webrun:message key="LABEL.EXPORT"/></button>
            <button type="button" class="d-none" id="system-export-undo"><webrun:message key="LABEL.EXPORT_CODE_UNDO"/></button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="system-settings-modal" tabindex="-1" role="dialog" aria-labelledby="system-settings-modal-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header bg-white">
            <h5 class="modal-title" id="system-settings-modal-title"><webrun:message key="LABEL.ADVANCED_SETUP"/></h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="<webrun:message key="LABEL.CLOSE"/>">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body p-0">
            <iframe class="w-100 h-100 m-0 p-0 border-0" src="" id="system-settings-iframe" style="outline: 0; min-height: 70vh;"></iframe>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal"><webrun:message key="LABEL.CLOSE"/></button>
            <button type="button" class="btn btn-primary" onclick="saveAdvancedSettings();"><webrun:message key="LABEL.SAVE"/></button>
          </div>
        </div>
      </div>
    </div>

    <div class="copyright">Powered by Softwell Maker | Webrun <%= WFRSystem.WEBRUN_VERSION %></div>
  </body>
</html>
