<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%@ page import="wfr.com.WFRSystem" %>
<%@ page import="wfr.util.*" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>

<%
  Logger logger = Logger.getLogger(this.getClass());

  String sys = request.getParameter("sys");

  HTMLInterface wfr = null;

  try {
    wfr = HTMLInterface.getInstance(request);
    
    //Tirei checagem de acesso para o módulo web
    wfr.checkJSPAccess(out, true, HTMLInterface.ACCESS_TYPE_REPORT);
  } catch (Exception e) {
    logger.error(wfr != null ? wfr.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    return;
  }
%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}" />
<title><%=(request.getParameter("description")!=null?Functions.fromISOtoBASE(request.getParameter("description")):"Relatório")%></title>
<webrun:import src="wfr.js"/>
<style type="text/css">
<!--
body {
        margin-left: 0px;
        margin-top: 0px;
        margin-right: 0px;
        margin-bottom: 0px;
}
-->
</style>
<script type="text/JavaScript">
<!--

function reportOnUnLoadAction() {
  try {
    get('closeform.do?sys=<%=request.getParameter("sys")%>&action=closeform&formID=<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>');
  } catch(e) {
  }
}

function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function doReport() {
        var d 			= WFRReportOptions.document;
        var component 	= null;
        listNodes 		= d.getElementById('divPrincipal').childNodes;
        var filter 		= "";
        var first 		= true;

        for(i = 0; i < listNodes.length; i++) {
                if (listNodes[i].name.substr(0, 12) != "WFRComponent")
                  continue;
                // Pega o código do componente
                codComponent = listNodes[i].name.replace("WFRComponent","");

                // pega o componente
                component = eval("d.c_" + codComponent);

                if(!component.input.disabled && component.input.value.length > 0) {
                        // Testa se é o primeiro
                        if(first) {
                                first = false;
                        } else {
                                filter += ";";
                        }

                        // Testa se o componente é um lookup
                        if(component.name == "HTMLLookup") {
                                filter += component.field + "=" + component.value;
                        } else {
                                filter += component.field + "=" + component.input.value;
                        }
                }
        }

        window.open('openReport.do?sys=<%=sys%>&action=openReport&formID=<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>&align=0&goto=-1&filter=' + filter,'HTMLReport' + <%=Functions.fromISOtoBASE(request.getParameter("formID"))%>,'width='+ screen.width + ',height=' + screen.height + ',left=0,top=0,scrollbars=yes');
}
//-->
</script>
</head>

<body onUnload="reportOnUnLoadAction()">
<table width="440" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td height="65" valign="top" background="<%=wfr.getSkin().getDir()%>nav_degrade.gif"><table width="440" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="83" height="27"><a href="javascript:doReport()"><img src="<%=wfr.getSkin().getDir()%>report_view.gif" name="submitbutton" width="83" height="27" border="0"></a></td>
        <td><a href="javascript:window.location.reload();"><img src="<%=wfr.getSkin().getDir()%>mainnav_reload.gif" name="Image3" width="83" height="27" border="0"></a><a href="javascript:doReport()" onMouseOut="MM_swapImgRestore()" onMouseOver="MM_swapImage('Image7','','<%=wfr.getSkin().getDir()%>mainnav_preview_over.gif',1)"></a></td>
      </tr>
    </table></td>
  </tr>
  <tr>
    <td><iframe name="WFRReportOptions" src="openReportFilter.do?sys=<%=request.getParameter("sys")%>&action=openReportFilter&formID=<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>&align=0&goto=-1&filter=" width="440" height="435" frameborder=no border=0 marginwidth=0 marginheight=0 scrolling=yes></iframe></td>
  </tr>
</table>
</body>
</html>