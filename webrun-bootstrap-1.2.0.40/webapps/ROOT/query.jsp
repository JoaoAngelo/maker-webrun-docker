<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true">

<%@ page import="wfr.com.*" %>
<%@ page import="wfr.sys.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="java.util.*" %>
<%
  Logger logger = Logger.getLogger(this.getClass());

  String sys = request.getParameter("sys");

  HTMLInterface wi = (HTMLInterface) request.getAttribute("htmlInterface");
  
  WFRForm form = wi.getSystem().getForm(Functions.fromISOtoBASE(request.getParameter("formID")), wi.getData().connection());
  
  List grid = form.getSearchFields();

  long real_width = form.getWidth();

  long width = form.getWidth();

  width = width-130;

  long c_width = 0;
  for (int i=0;i<grid.size();i++) {
    width = width - 4;
    c_width = c_width + ((WFRMetaData) grid.get(i)).getGridWidth();
    if (((WFRMetaData) grid.get(i)).getDataField().getDataType().isDate())
      c_width = c_width + 24;
  }

  double excess = 0;

  if (c_width > width)
   excess = (double)(c_width-width) / (double)c_width;

  String field = "";
  String names = "";
%>
<html>
<head>
<title>
<%=form.getDescription()%>
</title>
</head>
<body leftmargin=2 topmargin=2 marginwidth=2 marginheight=2>
<script language="JavaScript" type="text/JavaScript">
<!--
function checkNulls(frm) {
  var r = true;
<%
  for (int i=0;i<grid.size();i++) {
    WFRMetaData c = (WFRMetaData) grid.get(i);
%>
  if (document.WFRQueryForm.q$<%=i%>.value == '') { r = false; }
<%
  }
%>
  if (!r)
	  alert('<webrun:message key="INFO.ALL_FIELDS_REQUIRED" js="true"/>!');
  else {
    var l = (screen.width-<%=form.getWidth()%>)/2;
    var t = (screen.height-<%=form.getHeight()%>)/2;
    window.open('', frm.target, 'scrollbars=no,resizable=no,width=<%=form.getWidth()%>, height=<%=form.getHeight()%>, top='+t+', left='+l);

  }
  return r;
}

//-->
</script>

<table height="80"  border="0" cellpadding="2" cellspacing="0" align="center">
  <tr>
    <td>
      <form name="WFRQueryForm" method="GET" action="<%=Functions.getURL(request)%>searchnavigate.do" target="WFRQueryResults" onSubmit="parent.searched = true; return checkNulls(this);">
      <table border="0" align="center" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="bottom">
            <table border="0" cellpadding="0" cellspacing="0">
            <tr valign="bottom">
<%
for (int i=0;i<grid.size();i++) {
  WFRMetaData c = (WFRMetaData) grid.get(i);

  long w = c.getGridWidth();
  w = (w - Math.round(w*excess));

  if (w < 79) w  = 79;

  if (field.length() > 0) field = field + ";";
  if (names.length() > 0) names = names + ";";
  field = field + c.getRealField();
  names = names + c.getField();

  int tv = 1;
  if (c.isString())
    tv = 1;
  if (c.isNumeric())
    tv = 5;
  if (c.isDate())
    tv = 10;
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
                            <td><input name="type$<%=i%>" type="hidden" value="<%=tv%>"><input name="q$<%=i%>" type="text" class="edit" style="width: <%=w%>px;"></td>
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
%>
              </tr>
          </table>            </td>
          <td align="right" valign="bottom">


            <%if (grid.size() > 0) {%>
            <input type="submit" name="Submit" value="<webrun:message key="LABEL.SEARCH"/>" class="button">
            <%}%>
            </td>
        </tr>
      </table>
      <input name="sys" type="hidden" value="<%=request.getParameter("sys")%>">
      <input name="action" type="hidden" value="searchnavigate">
      <input name="formID" type="hidden" value="<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>">
      <input name="componentID" type="hidden" value="-1">
      <input name="field" type="hidden" value="<%=field%>">
      <input name="showAll" type="hidden" value="false">
      <input name="names" type="hidden" value="<%=names%>">
      </form></td>
  </tr>

</table>
</body>
</html>
</webrun:controller>
