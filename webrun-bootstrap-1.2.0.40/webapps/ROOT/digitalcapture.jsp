<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller>

<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%@ page import="wfr.com.WFRSystem" %>
<%@ page import="wfr.util.*" %>

<%
  Logger logger = Logger.getLogger(this.getClass());
  String sys = request.getParameter("sys");
  String formID = Functions.fromISOtoBASE(request.getParameter("formID"));
  String realRuleName = request.getParameter("ruleName");
  String forParam = request.getParameter("for");
  if (forParam == null) forParam = "";
  String type = request.getParameter("type");
  HTMLInterface htmli = null;

  int actionCaptureType = 0;

  if (forParam.equalsIgnoreCase("action") || forParam.equalsIgnoreCase("query")) {
    try {
      htmli = HTMLInterface.getInstance(request);
      htmli.checkJSPAccess(out, true);
    } catch (Exception e) {
      logger.error(htmli != null ? htmli.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    }

    if (forParam.equalsIgnoreCase("action")) {
      actionCaptureType = Integer.parseInt(request.getParameter("type"));
    }
  } else if (forParam.equalsIgnoreCase("rule")) {
    try {
      htmli = HTMLInterface.getInstance(request);
    } catch (Exception e) {
      logger.error(htmli != null ? htmli.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    }
  }

  int porta = wfr.util.WFRConfig.config().getInt("ServicoDigital", "Porta");
%>

<!DOCTYPE html>
<html class="h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="LABEL.FINGERPRINT_CAPTURE"/></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <script type="text/javascript">
      function setImgBase64(v) {
        var img64Field = document.getElementById("field-img64");
        if (img64Field) img64Field.value = v;
      }

      function setFir(fir) {
        var firField = document.getElementById("field-fir");
        if (firField) firField.value = fir;
        <% if (forParam.equalsIgnoreCase("rule")) { %>
          <% if (type != null && type.equalsIgnoreCase("string")) { %>
          var value = fir;
          <% } else { %>
          var value = parseInt(trim(getContent("digitalCaptureQuery.do?sys=<%=sys%>&formID=<%=formID%>&fir=" + fir)));
          <% } %>

          try {
            <% if (htmli.getSystem().getJSManager().isJSRule(realRuleName)) { %>
            var params = new Array();
            params.push(value);
            $mainform().executeJSRuleNoField("<%=sys%>", <%=formID%>, "<%=realRuleName%>", params, false);
            <% } else { %>
            $mainform().executeSyncJavaRule("<%=sys%>", <%=formID%>, "<%=realRuleName%>", value);
            <% } %>
          } catch (e) {
            $mainform().interactionError(e.toString());
          }

          removeWindow();
        <% } %>
      }

      function getFir() {
        var firField = document.getElementById("field-fir");
        return firField ? firField.value : "";
      }

      function error() {
        <% if (!forParam.equalsIgnoreCase("action") || actionCaptureType == 2) { %>
        window.location.reload();
        <% } %>
      }

      function cancel() {
        window.close();
      }

      function timeout() {
        <% if (!forParam.equalsIgnoreCase("action") || actionCaptureType == 2) { %>
        window.location.reload();
        <% } %>
      }

      function finalize() {
        <% if (!forParam.equalsIgnoreCase("rule")) { %>
        setTimeout(function() {
          var fingerprintIcon = document.getElementById("fingerprint-icon");
          var fingerprintText = document.getElementById("fingerprint-text");
          var actionButtons = document.getElementById("action-buttons");
          var preloader = document.getElementById("preloader");

          fingerprintIcon.className = "d-none";
          fingerprintText.className = "d-none";
          actionButtons.className = "d-none";
          preloader.className = "spinner-border text-primary";

          document.getElementById("fingerprint-form").submit();
        }, 0);
        <% } %>
      }

      function showError() {
        var fingerprintIcon = document.getElementById("fingerprint-icon");
        var fingerprintText = document.getElementById("fingerprint-text");
        var actionButtons = document.getElementById("action-buttons");
        var preloader = document.getElementById("preloader");

        fingerprintIcon.className = "fas fa-exclamation-triangle mb-4";
        fingerprintText.innerHTML = "<webrun:message key="ERROR.FINGERPRINT_CATCH_FAILED" js="true"/>";
        actionButtons.className = "mt-3";
        preloader.className = "d-none";
      }

      function loadFingerprint() {
        var fingerprintIcon = document.getElementById("fingerprint-icon");
        var fingerprintText = document.getElementById("fingerprint-text");
        var actionButtons = document.getElementById("action-buttons");
        var preloader = document.getElementById("preloader");

        fingerprintIcon.className = "fas fa-fingerprint mb-4";
        fingerprintText.innerHTML = "<webrun:message key="LABEL.WAITING_DIGITAL_PRINTING" js="true"/>...";
        actionButtons.className = "d-none";
        preloader.className = "d-none";

        setImgBase64("");
        setFir("");

        try {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", "http://localhost:" + <%=porta%> + "/api/public/v1/captura/Capturar/1", true);
          xhr.onload = function(e) {
            if (xhr.readyState === 4 && xhr.status == 200) {
              var resposta = xhr.responseText;
              resposta = resposta.replace("\"","");
              resposta = resposta.replace("\"","");
              if (resposta != "522") {
                setFir(resposta);
                <% if (forParam == null || forParam.isEmpty()) { %>
                loadFingerprintBase64();
                <% } else { %>
                finalize();
                <% } %>
              } else {
                showError();
              }
            } else {
              showError();
            }
          };

          xhr.onerror = function(e) {
            showError();
          };

          xhr.send();
        } catch (e) {
          showError();
        }  
      }

      <% if (forParam == null || forParam.isEmpty()) { %>
      function loadFingerprintBase64() {
        try {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", "http://localhost:" + <%=porta%> + "/api/public/v1/captura/ImgBase64/1", true);
          xhr.addEventListener("load", function() {
            if (xhr.status == 200) {
              var resposta = xhr.responseText;
              resposta = resposta.replace("\"","");
              resposta = resposta.replace("\"","");
              setImgBase64(resposta);
              finalize();
            } else {
              showError();
            }
          });

          xhr.onerror = function(e) {
            showError();
          };

          xhr.send();
        } catch (e) {
          showError();
        }
      }
      <% } %>

      function removeWindow() {
        if (window.frameElement && window.frameElement.close) {
          window.frameElement.close();
        } else if (window.close) {
          window.close();
        }
      }

      window.onload = function() {
        loadFingerprint();
      };
    </script>
  </head>
  <body class="h-100">
    <div class="d-flex flex-column w-100 h-100 align-items-center justify-content-center p-3">
      <div class="d-none" role="status" id="preloader">
        <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
      </div>

      <i class="fas fa-fingerprint mb-4" style="font-size: 6rem;" id="fingerprint-icon"></i>
      <h5 class="text-center mb-0" id="fingerprint-text"><webrun:message key="LABEL.LOADING_DEVICE"/>...</h5>
      <div class="d-none" id="action-buttons">
        <button type="button" class="btn btn-secondary mr-2" onclick="removeWindow();"><webrun:message key="LABEL.CANCEL"/></button>
        <button type="button" class="btn btn-primary" onclick="loadFingerprint();"><webrun:message key="LABEL.TRY_AGAIN"/></button>
      </div>
    </div>

    <% if (forParam != null && forParam.equalsIgnoreCase("logon")) { %>
    <form id="fingerprint-form" method="post" action="logondigitalcapture.do">
      <input type="hidden" name="sys" value="<%= wfr.util.Functions.stringToHTMLString(wfr.util.Functions.fromISOtoBASE(request.getParameter("sys"))) %>"/>
      <input type="hidden" name="dataConnection" value="<%= wfr.util.Functions.stringToHTMLString(wfr.util.Functions.fromISOtoBASE(request.getParameter("dataConnection"))) %>"/>
      <input type="hidden" name="fir"/>
      <input type="hidden" name="action" value="logondigitalcapture"/>
    </form>
    <% } else if (forParam != null && forParam.equalsIgnoreCase("action")) { %>
    <form id="fingerprint-form" method="post" action="actiondigitalcapture.do">
      <input type="hidden" name="sys" value="<%=request.getParameter("sys")%>"/>
      <input type="hidden" name="procedure" value="<%=request.getParameter("procedure")%>"/>
      <input type="hidden" name="type" value="<%=request.getParameter("type")%>"/>
      <input type="hidden" name="message" value="<%=Functions.fromISOtoBASE(request.getParameter("message"))%>"/>
      <input type="hidden" name="showwindow" value="<%=request.getParameter("showwindow")%>"/>
      <input type="hidden" name="timeout" value="<%=request.getParameter("timeout")%>"/>
      <input type="hidden" name="fir"/>
      <input type="hidden" name="action" value="actiondigitalcapture"/>
    </form>
    <% } else if (forParam != null && forParam.equalsIgnoreCase("query")) { %>
    <form id="WFRUPLOAD" method="post" action="querydigitalcapture.do">
      <input type="hidden" name="sys" value="<%=request.getParameter("sys")%>"/>
      <input type="hidden" name="field" value="<%=request.getParameter("field")%>"/>
      <input type="hidden" name="fir"/>
      <input type="hidden" name="action" value="querydigitalcapture"/>
    </form>
    <% } else if (forParam != null && forParam.equalsIgnoreCase("rule")) { %>

    <% } else { %>
    <form id="fingerprint-form" method="post" action="fileupload?sys=<%= request.getParameter("sys") %>&formID=<%= wfr.util.Functions.fromISOtoBASE(request.getParameter("formID")) %>&comID=<%= request.getParameter("comID") %>&type=D&crip=<%= request.getParameter("crip") %>&status=OK">
      <input type="hidden" name="img64" id="field-img64">
      <input type="hidden" name="fir" id="field-fir">
    </form>
    <% } %>
  </body>
</html>
</webrun:controller>
