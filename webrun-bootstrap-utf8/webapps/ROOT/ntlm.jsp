<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%

  HTMLInterface htmlInterface = HTMLInterface.getInstance(request);

  if (htmlInterface.getSystem().getAdvancedProperty("AutenticacaoIntegrada").equals("true")) {

	  String password = wfr.util.RandomGUID.newGUID();
	
	  request.setAttribute("NTLM_USER", request.getRemoteUser());
	  request.setAttribute("NTLM_PASSWORD", password);
	  request.getRequestDispatcher("logon.do?sys="+request.getParameter("sys")).forward(request, response);
	  
  } else {
    wfr.util.Resources resources = wfr.util.Resources.getInstance(request);
    response.sendError(HttpServletResponse.SC_FORBIDDEN, resources.getString(wfr.exceptions.ExceptionMessage.INFO_FORBIDDEN_ACCESS));
  }
%>
