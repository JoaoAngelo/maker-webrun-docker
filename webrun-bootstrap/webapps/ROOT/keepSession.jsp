<%@page import="wfr.util.Functions"%>

<%
  Cookie cookie = new Cookie("JSESSIONID", request.getParameter("session"));
  cookie.setComment("JSESSIONID");
  cookie.setMaxAge(20*60);
  response.addCookie(cookie);
  
  response.sendRedirect("open.do?sys=" + request.getParameter("sys"));
%>