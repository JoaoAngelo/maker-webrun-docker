<%@ page import="wfr.util.Functions" %>
<script>

function callback() {
  var applet = document.getElementById('webrun_applet');

  if (<%=request.getParameter("callback")!=null%>) {
	  parent['<%=Functions.fromISOtoBASE(request.getParameter("callback"))%>'].call(parent, applet);
  }	  	
}
</script>

<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" onload="callback()">

<APPLET ID="webrun_applet" NAME="webrun_applet" CODEBASE="."
      CODE="<%=request.getParameter("code")%>"
      ARCHIVE="<%=request.getParameter("archive")%>"
      WIDTH=0
      HEIGHT=0 MAYSCRIPT>
</applet>

</body>
</html>