<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ page import="java.io.*, wfr.util.*" %>
<%
String file = Functions.fromISOtoBASE(request.getParameter("file"));
String url = Functions.fromISOtoBASE(request.getParameter("url"));
String type = request.getParameter("type");
String dst = Functions.fromISOtoBASE(request.getParameter("dst"));
String id = Functions.fromISOtoBASE(request.getParameter("id"));
String name = Functions.fromISOtoBASE(request.getParameter("name"));

request.getSession().setAttribute("downloadFolder", dst);

%>
<!--<%=dst%>-->
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
<title></title>
</head>
<webrun:import src="wfr.js"/>

<body leftmargin=0 topmargin=0 marginwidth=0 marginheight=0 onunload="try { if (opener && opener.parent && opener.parent.parent) opener.parent.parent.finalize(); } catch(e) {}">

<%if (type.equals("PDF")) {%>
<script language="JavaScript">
<!--
try { if (opener.parent.parent) opener.parent.parent.hideMainMessage(); } catch(e) {}
try { if (opener.parent.parent) opener.parent.parent.finalize(); } catch(e) {}
window.location = '<%=url+id+"."+type%>';
//-->
</script>
<%}%>

<%if (type.equals("HTM")) {%>
<script language="JavaScript">
<!--
try { if (opener.parent.parent) opener.parent.parent.hideMainMessage(); } catch(e) {}
try { if (opener.parent.parent) opener.parent.parent.finalize(); } catch(e) {}
window.location = '<%=url+id+"."+type%>';
//-->
</script>
<%}%>

<%
if (type.equals("REM") || type.equals("TXT") || type.equals("XLS") || type.equals("RTF")) {%>
<script language="JavaScript">
<!--
try { if (parent.parent) parent.parent.hideMainMessage(); } catch(e) {}
setFocus();
window.location = 'download?id=<%=id%>&name=<%=name%>.<%=type.toLowerCase()%>';
//-->
</script>
<%}%>
<%
if (type.equals("JPG")) {
  File directory = new File(dst);
  File[] filesInDir = directory.listFiles();

  if (filesInDir != null) {
    int length = filesInDir.length;
    out.println("<script language='JavaScript'>");
    out.println("<!--");
    out.println("try { if (opener.parent.parent) opener.parent.parent.hideMainMessage(); } catch(e) {}");
    out.println("try { if (opener.parent.parent) opener.parent.parent.finalize(); } catch(e) {}");
    out.println("var iDIV = window.document.createElement('DIV');");
    out.println("iDIV.style.width = '100%';");
    out.println("iDIV.style.height = '100%';");
    out.println("iDIV.style.overflow = 'auto';"); 
    
    for (int i = 0; i < length; ++i) {
      File f = filesInDir[i];
      if (f.isFile() && f.getName().startsWith(id)) {
        out.println("var iImg" + i + " = window.document.createElement('IMG');");
        out.println("iImg" + i + ".src = '" + url+f.getName() + "';");
        out.println("iDIV.appendChild(iImg" + i + ");");
        out.println("var ihr" + i + " = window.document.createElement('HR');");
        out.println("ihr" + i + ".width = '97%';");
        out.println("ihr" + i + ".size = 2;");
        out.println("iDIV.appendChild(ihr" + i + ");");
      }
    }
    out.println("window.document.body.appendChild(iDIV);");
    out.println("//-->");
    out.println("</script>");
  }
%>

<script language="JavaScript">
<!--
try { if (opener.parent.parent) opener.parent.parent.hideMainMessage(); } catch(e) {}
//-->
</script>
<%}%>

</body>
</html>
