<%
  String sys = request.getParameter("sys");
  request.getSession().removeAttribute("WFR" + request.getParameter("sys"));
%>
<script type="text/javascript">window.close();</script>
