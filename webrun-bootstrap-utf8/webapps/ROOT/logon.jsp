<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLImage" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.exceptions.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="wfr.com.WFRSystem" %>
<%@ page import="net.tanesha.recaptcha.ReCaptcha" %>
<%@ page import="net.tanesha.recaptcha.ReCaptchaFactory" %>
<%@ page import="wfr.sys.HTMLInterface.ComponentProperty" %>
<%@ page import="wfr.com.ImageType" %>
<%@ page import="java.util.Locale" %>
<%@ page import="java.util.Collection" %>
<%@ page import="java.util.*" %>
<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.WFRLoader" %>

<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%
  Logger logger = Logger.getLogger(this.getClass());
  Resources resources = Resources.getInstance(request);

  String sys = request.getParameter("sys");
  String user = Functions.stringToHTMLString(Functions.fromISOtoBASE(request.getParameter("user")));
  if (user == null) user = "";

  Functions.setWebrunSelectedSystemCookie(response, sys);

  if (request.getParameter("sys") != null && request.getParameter("action") != null &&
    request.getParameter("action").compareTo("logout") == 0) {
    request.getSession().removeAttribute("WFR" + request.getParameter("sys"));
  }

  HTMLInterface wfr = null;
  try {
    wfr = HTMLInterface.getInstance(request);

    if ((request.getParameter("msgKey") == null || request.getParameter("msgKey").length() == 0) && (request.getParameter("action") == null || request.getParameter("action").length() == 0)) {  
      if (wfr.getSystem().getAdvancedProperty("AutenticacaoIntegrada").equals("true")) {
        out.println(HTMLConstants.OPEN_TAG_SCRIPT);
        out.println("window.location = 'ntlm.jsp?sys=" + sys + "';");
        out.println(HTMLConstants.CLOSE_TAG_SCRIPT);
        return;
      }
    }
  } catch (WFRSystemExpired e) {
    logger.error(user, sys, e);
    out.println(HTMLConstants.OPEN_TAG_SCRIPT);
    out.println("window.location = 'serial.jsp?sys=" + sys + "&msgKey=" + WFRLoader.errorMessagesManager.put(e.getShowMessage(resources)) + "&entityName=" + Functions.stringToJs(e.getEntityName()) + "';");
    out.println(HTMLConstants.CLOSE_TAG_SCRIPT);
    return;
  } catch (WFRUserNotLogged e) {

  } catch (Exception e) {
    logger.error(user != null ? user : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    Functions.showException(out, e, resources, null);
    return;
  }
%>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <%= Functions.legacyMessage() %> 
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/sweetalert/sweetalert.min.js"/>    
    <webrun:import src="components/HTMLMessage.js"/>
    <webrun:import src="<%=resources.getI18NFilePath()%>"/>
  </head>
  <body>
<webrun:errorMessage focusElement="user" forceMethodCall="parent.interactionError"/>
  </body>
</html>
