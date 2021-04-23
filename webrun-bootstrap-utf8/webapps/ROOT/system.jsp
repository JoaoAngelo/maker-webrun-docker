<%@ page import="wfr.com.*, wfr.sys.HTMLInterface.*" %>
<%@ page import="wfr.exceptions.*" %>
<%@ page import="wfr.util.Logger" %>
<%@ page import="wfr.util.Settings" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%
  response.setContentType("text/html; charset=" + Settings.CHARSET);

  Logger logger = Logger.getLogger(this.getClass());
  String sys = request.getParameter("sys");
  HTMLInterface htmlInterface = null;
  WFRSystem system;
  String iconApp = "webrun.ico";
  String url = "";

  try {
    htmlInterface = HTMLInterface.getInstance(request);
    system = htmlInterface.getSystem();

    if (htmlInterface.getSystem().getProperty(ComponentProperty.CODIGO_FORM).length() > 0 && Integer.parseInt(htmlInterface.getSystem().getProperty(ComponentProperty.CODIGO_FORM)) > 0)  {
      WFRForm form = htmlInterface.getSystem().getForm(htmlInterface.getSystem().getProperty(ComponentProperty.CODIGO_FORM), htmlInterface.getData().connection());
      url = "form.jsp?sys=" + sys + "&action=openform&formID=" + form.getCode() + "&align=0&mode=-1&goto=-1&filter=&scrolling=" + form.getProperty(ComponentProperty.BARRA_DE_ROLAGEM) + "&firstLoad=true";
    }

    if (system.getIconImage() != null && system.getIconImage().getCode() > 0) {
      iconApp = WFRImage.getImagePath(system.getCode(), String.valueOf(system.getIconImage().getCode()));
    }
  } catch (WFRUserNotLogged e) {
    out.println("<script type=\"text/javascript\">parent.location = 'logon.jsp?sys=" + sys + "';</script>");
    return;
  } catch (Exception ex) {
    logger.error(htmlInterface != null ? htmlInterface.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, ex.getMessage(), ex);
    return;
  }

  int sessionTime = (wfr.util.WFRConfig.config().getInt("Sessao", "Tempo", 120) / 2) * 1000;
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, user-scalable=yes">
    <link rel="shortcut icon" href="<%=iconApp%>" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="rulesFunctions.js"/>
    <script type="text/javascript">
      function systemOnLoadAction() {
        if (mainsystem.sysOnLoad) {
          mainsystem.sysOnLoad();
        }
      }

      var unloaded = false;
      function systemOnUnLoadAction() {
        if (!unloaded) {
          unloaded = true;
          if (mainsystem.sysOnUnLoad) mainsystem.sysOnUnLoad();
          if (mainsystem.formOnUnLoadAction) mainsystem.formOnUnLoadAction();
          try { get('closesystem.do?sys=<%=request.getParameter("sys")%>'); } catch(e) { }
          closeParents();
        }
      }

      function changeTitle(t) {
        document.title = t;
      }

      function remainSession() {
        try { httpPool.processAsyncGet('remainSession.do?sys=<%=request.getParameter("sys")%>&datetime='+(new Date().getMilliseconds())); } catch(e) { }
        setTimeout(remainSession, <%=sessionTime%>);
      }

      setTimeout(remainSession, <%=sessionTime%>);
    </script>
  </head>
  <body class="w-100 h-100" onload="systemOnLoadAction()" onunload="systemOnUnLoadAction()" onbeforeunload="systemOnUnLoadAction()">
    <iframe src="<%=url%>" name="mainsystem" class="position-absolute border-0 w-100 h-100 m-0 overflow-auto" scrolling="no" noresize></iframe>
  </body>
</html>