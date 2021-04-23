<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="wfr.util.Logger" %>
<%
  Logger logger = Logger.getLogger(this.getClass());

  String sys = request.getParameter("sys").toString();

  HTMLInterface wi = null;
  try {
    wi = HTMLInterface.getInstance(request);
    wi.checkJSPAccess(out, true);

  }catch(Exception e){
    logger.error(wi != null ? wi.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
  }
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">
<html>
<head>
<title>Untitled Document</title>
<link rel="stylesheet" href="<%=wi.getSkin().getCss()%>">
<meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
</head>

<frameset rows="150,388" cols="*" framespacing="0" frameborder="NO" border="0">
  <frame src="ExecuteScript.jsp?sys=<%=sys%>" name="UpFrame" >
  <frame src="ExecuteScriptResult.jsp?sys=<%=sys%>" name="UnderFrame" id="UnderFrame">
</frameset>
<noframes><body>
</body></noframes>
</html>
