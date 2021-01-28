<%@ page import="java.io.*,wfr.sys.HTMLInterface.*"%>
<%@ page import="wfr.com.WFRSystem" %>
<%@ page import="wfr.util.Logger" %>
<%
  Logger logger = Logger.getLogger(this.getClass());
  response.setContentType("application/x-binary-stream");

  String file = HTMLDownload.getRequest(request.getParameter("id"));
  File f = new File (file);

  if (request.getParameter("returnFile") != null && request.getParameter("returnFile").equals("true")) {
    response.setHeader("Content-Disposition", "attachment; filename=\"" + f.getName() + "\"");
  } else {
    response.setHeader("Content-Disposition", "attachment; filename=\"exportacao." + request.getParameter("ext") + "\"");
  }

  String name = f.getName().substring(f.getName().lastIndexOf("/") + 1, f.getName().length());
  InputStream in = new FileInputStream(f);
  ServletOutputStream outs = response.getOutputStream();
  byte[] read = new byte[1024];
  int total = 0;
  int i = 0;

  try {
    while ((total = in.read(read)) >= 0) {
      outs.write(read, 0, total);
    }
  } catch (IOException ioe) {
    logger.error(WFRSystem.DEFAULT_USER, WFRSystem.DEFAULT_SYSTEM, ioe);
  }

  outs.flush();
  in.close();
%>
