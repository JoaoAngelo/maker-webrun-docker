<%@page import="wfr.com.WFRImage"%>
<%@page import="wfr.com.WFRSystem"%>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true">
<%@ page import="wfr.util.Functions" %>
<%@ page import="wfr.util.Resources" %>
<%@ page import="wfr.exceptions.ExceptionMessage"%>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLInterface"%>
<%@ page import="org.owasp.encoder.Encode"%>
<%
  Resources resources = Resources.getInstance(request);
  String form = Encode.forJavaScript(Functions.fromISOtoBASE(request.getParameter("formID")));
  String msgKey = Encode.forJavaScript(request.getParameter("msgKey"));
  Boolean sessionLost = request.getParameter("sessionLost") != null && request.getParameter("sessionLost").equals("true");
  String message = (msgKey != null && msgKey.length() > 0) ? wfr.sys.WFRLoader.errorMessagesManager.get(msgKey) : null;

  HTMLInterface htmlInterface = (HTMLInterface) request.getAttribute("htmlInterface");
  WFRSystem system = htmlInterface.getSystem();

  if (form == null || form.length() == 0 || (Functions.isNumeric(form) && Integer.parseInt(form) <= 0)) {
    Functions.showException(out, new Exception(resources.getString(ExceptionMessage.INFO_FORM_WRONG_CODE)), resources, null, system.getApplicationResources());
    return;
  }

  Boolean scrolling = request.getParameter("scrolling") != null ? Boolean.getBoolean(request.getParameter("scrolling")) : false;
  String overflow = scrolling ? "auto" : "hidden";
  String scrollingStr = scrolling ? "yes" : "no";

  boolean externalAccess = (request.getAttribute("externalAccess") != null && (Boolean)request.getAttribute("externalAccess")) || "true".equals(request.getParameter("remainSession"));

  String iconApp = "webrun.ico";

  if (system.getIconImage() != null && system.getIconImage().getCode() > 0) {
    iconApp = WFRImage.getImagePath(system.getCode(), String.valueOf(system.getIconImage().getCode()));
  }

  boolean isLoginForm = system.getProperty(wfr.sys.HTMLInterface.ComponentProperty.FORMULARIO_DE_LOGIN).equals(form);
  if (isLoginForm) {
    if (htmlInterface.getSystem().getAdvancedProperty("AutenticacaoIntegrada").equals("true")) {
      out.println("<script type=\"text/javascript\">window.location = 'ntlm.jsp?sys=" + system.getCode() + "';</script>");
      return;
    }
  }
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, user-scalable=yes">
    <link rel="shortcut icon" href="<%=iconApp%>" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="wfr_masks.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <script type="text/javascript">
      function formOnLoadAction() {
        <%-- Adiciona as janelas modais como filhas da janela chamadora, pois a chamada não é a window.open() --%>
        if (window.dialogArguments && window.dialogArguments.parentWindow) {
          var openerWindow = window.dialogArguments.parentWindow;
          if (!openerWindow.children) openerWindow.children = new Array();
          try { openerWindow.children.push(window); } catch (e) { }
        }

        if (top.opener) {
          if (top.opener.children) {
            if (top.opener.children.indexOf(window) == -1) top.opener.children.push(window);
          } else {
            if (!top.opener.parent.children) top.opener.parent.children = new Array();
            if (top.opener.parent.children.indexOf(window) == -1) top.opener.parent.children.push(window);
          }
        } else if (mainform.isPopup && !mainform.isPrincipal && !mainform.isLoginForm) {
          if (!top.$mainform().children) top.$mainform().children = new Array();
          if (top.$mainform().children.indexOf(window) == -1) top.$mainform().children.push(window);
        }
      }

      var isformcontainer = true;
      var mainframe = null;

      if (opener != null) {
        try {
          mainframe = opener.mainframe;
        } catch (e) {
          <%-- Só ocorre no Mozilla 2 --%>
        }
      }

      try {
        if (opener.closewindow)
          opener.close();
      } catch (e) { }

      var sys = '<%=Encode.forJavaScript(request.getParameter("sys"))%>';
      var isDotNET = <%=Functions.isDotNetPlatform()%>;
      var isTomcat7 = <%=Functions.isTomcat7()%>;
      var formId = $mainform().URLEncode('<%=Encode.forJavaScript(Functions.fromISOtoBASE(request.getParameter("formID")))%>');
      var codigo = '<%=Encode.forJavaScript(request.getParameter("codigo"))%>';
      var codFormComp = '<%=Encode.forJavaScript(request.getParameter("codFormComp"))%>';
      var lastFormZindex = 1000;
      var unloaded = false;
      var e_access = <%=externalAccess%>;

      function formOnUnLoadAction() {
        if (!unloaded) {
          unloaded = true;
          try {
            if (mainform.formOnUnLoadAction) {
              mainform.disableCloseChildren = true;
              mainform.formOnUnLoadAction();
            }
          } catch(e) { }

          try {
            if (mainform.onunload) {
              let road = "";
              if(mainSystemFrame.reloadSystem || mainSystemFrame.changeMode) road = 'form.do?sys=<%=request.getParameter("sys")%>&param=cancel&formID='+ formId;
              else road = 'form.do?sys=<%=request.getParameter("sys")%>&param=cancel&onunload=' + mainform.isPrincipal + '&formID='+ formId;
              if (!mainform.isPrincipal && !mainform.isLoginForm) {
                if (mainform.isPopup && window.opener) window.opener.get(road, false, true);
                else  mainform.parent.parent.get(road, false, true);
              } else {
                get(road);
              }
              mainform.onunload();
            }
          } catch(e) { }

          try {
            <%if (request.getParameter("onClose") == null) {%>
              let road = 'closeform.do?sys=<%=request.getParameter("sys")%>&action=closeform&formID='+ formId;
              if (!mainform.isPrincipal && !mainform.isLoginForm) {
                if(mainform.isPopup && window.opener)
                  window.opener.get(road, false, true);
                else
                  mainform.parent.parent.get(road, false, true);
              } else {
                get(road);
              }
            <%} else {%>
              <%=Functions.fromISOtoBASE(request.getParameter("onClose"))%>
            <%}%>
          } catch (e) { }

          if (mainform.isPrincipal) closeFormHierarchy(formId);
          if (closeFormAndChildren) closeFormAndChildren();
          try { removeChild(mainform); } catch (e) { }

          if (opener) {
            try { opener.removeChild(window); } catch (e) { }
            try { opener.removeChild(mainform); } catch (e) { }
          }

          if (parent) {
            try { parent.removeChild(window); } catch (e) { }
            try { parent.removeChild(mainform); } catch (e) { }
          }

          window.mainframe = null;

          if (httpPool) {
            httpPool.free();
            httpPool = null;
          }
        }
      }

      addKeyEvent();

      function changeTitle(t) {
        if (parent && parent.changeTitle && parent != window) parent.changeTitle(t);
        else document.title = t;
      }

      <%
        if (externalAccess) {
          int sessionTime = (htmlInterface.getSessionTime() / 2) * 1000;
          if (!isLoginForm) {
      %>
      function remainSession() {
        try { httpPool.processAsyncGet('remainSession.do?sys=<%=request.getParameter("sys")%>&datetime=' + new Date().getMilliseconds()); } catch(e) { }
        setTimeout(remainSession, <%=sessionTime%>);
      }

      setTimeout(remainSession, <%=sessionTime%>);
      <%
          }
        }
      %>

      function removeLoadingSpinner() {
        document.getElementById("loading").style.display = 'none';
      }
    </script>
  </head>
  <body class="w-100 h-100" onload="formOnLoadAction()" onunload="formOnUnLoadAction()" onbeforeunload="formOnUnLoadAction()">
    <div id="WFRIframeBlockMainForm"></div>
    <div id="loading" style="display: block;"><div class="spinner-border text-primary" role="status"><span class="sr-only">...</span></div></div>
    <iframe onload="removeLoadingSpinner()" src="<%="openform.do?" + request.getQueryString()%>" name="mainform" class="position-absolute border-0 w-100 h-100 m-0 overflow-auto" scrolling="yes"></iframe>
    <% if (message != null) { %><script type="text/javascript"><%= sessionLost ? "showSessionLostModal(\"" + Encode.forJavaScript(message) + "\", false);" : Functions.getInteractionErrorMessage(message) + ";" %></script><% } %>
  </body>
</html>
</webrun:controller>