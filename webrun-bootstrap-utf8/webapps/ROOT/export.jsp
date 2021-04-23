<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true" showLoadTime="false">
<%@ page import="wfr.com.*" %>
<%@ page import="wfr.util.Functions" %>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.sql.*" %>
<%
  String sys = request.getParameter("sys");
  HTMLInterface wi = (HTMLInterface) request.getSession().getAttribute("WFR"+sys);

  String formID = Functions.fromISOtoBASE(request.getParameter("formID"));
  String type = request.getParameter("type");
  WFRForm form = wi.getSystem().getForm(formID, wi.getData().connection());
  List<WFRMetaData> grid = wi.getUserInfo().getGridFields(form.getGuid(), form.getGridFields());

  WFRExport export = new WFRExport(form.getConnection(wi.getData().connection()), out);
  ResultSet rs = wi.getData().getFormResultSet(formID);

  if (type.equals("TXT")) export.exportToText(form, rs, grid);
  if (type.equals("HTML")) export.exportSimpleHtml(form, rs, grid);
  if (type.equals("XML")) export.exportToXml(form, rs, grid);
  if (type.equals("LST")) export.exportToHtml(form, rs, grid, wi.getData());
%>
</webrun:controller>
