<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller allowsExternalAccess="true" checkReportAuthorization="true">

<%@ page import="wfr.com.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="java.util.*" %>
<%

  String reportID = Functions.fromISOtoBASE(request.getParameter("reportID"));

  HTMLInterface wi = (HTMLInterface) request.getAttribute("htmlInterface");
  WFRReport report = null;

  report = wi.getSystem().getReport(reportID, wi.getData().connection());

  WFRForm form = report.getForm();
  
  List<WFRComponent> grid = null;
  List<WFRTab> sortedTabs = form.getSortedtabs();
  if (sortedTabs != null && sortedTabs.size() > 0) {
    grid = ((WFRTab)form.getSortedtabs().get(0)).getComponents();
  }
%>
<html>
<head>
<title>
<%=report.getName()%>
</title>
</head>
<body leftmargin=2 topmargin=2 marginwidth=2 marginheight=2>
<script language="JavaScript" type="text/JavaScript">
<!--
function checkNulls(frm) {
  var r = true;
<%
  if (grid != null && grid.size() > 0) {
    for (WFRComponent c : grid) {
      if (c.isRequired()) {
%>

  if (document.WFRQueryForm.<%=c.getField()%>.value == '') { r = false; }
<%
      }
    }
  }
%>
  if (!r)
	  alert('<webrun:message key="INFO.ALL_FIELDS_REQUIRED" js="true"/>!');
  else {
    window.open('', frm.target, 'scrollbars=no,resizable=no,width='+screen.width+',height='+screen.height+',top=0, left=0');
  }
  return r;
}

//-->
</script>

<table height="80"  border="0" cellpadding="2" cellspacing="0" align="center">
  <tr>
    <td>
      <form name="WFRQueryForm" method="GET" action="<%=Functions.getURL(request)%>reportOpenExternal.do" target="WFRQueryResults"  onsubmit="return checkNulls(this);">
      <table border="0" align="center" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="bottom">
            <table border="0" cellpadding="0" cellspacing="0">
            <tr valign="bottom">
<%
if (grid != null && grid.size() > 0) {
  for (WFRComponent c : grid) {
%>
              <td><table width="100%"  border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="bottom"><%=c.getDescription()%></td>
                  </tr>
                  <tr>
                    <td valign="bottom">
                      <table width="100%"  border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                            <td><input name="<%=c.getField()%>" type="text" class="edit"></td>
                           </tr>
                           </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
              </table></td><td width="4"></td>
<%
  }
}
%>
              </tr>
          </table>
          </td>
          <td align="right" valign="bottom">
            <input type="submit" name="Submit" value="<webrun:message key="LABEL.SEARCH"/>" class="button">
          </td>
        </tr>
      </table>
      <input name="sys" type="hidden" value="<%=request.getParameter("sys")%>">
      <input name="action" type="hidden" value="reportOpenExternal">
      <input name="reportID" type="hidden" value="<%=reportID%>">
      <input name="Order" type="hidden" value="">
      <input name="exptype" type="hidden" value="PDF">
      <input name="localreport" type="hidden" value="">
      <input name="nopopup" type="hidden" value="true">
      </form></td>
  </tr>

</table>
</body>
</html>
</webrun:controller>
