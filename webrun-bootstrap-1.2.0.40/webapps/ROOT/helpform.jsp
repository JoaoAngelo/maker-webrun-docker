<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ page import="wfr.sys.HTMLInterface.*" %>
<%@ page import="wfr.com.*" %>
<%@ page import="wfr.util.*" %>
<%
  Logger logger = Logger.getLogger(this.getClass());
  String sys = request.getParameter("sys");
  HTMLInterface wfr = null;
  try {
    wfr = HTMLInterface.getInstance(request);
  } catch (Exception e) {
    logger.error(wfr != null ? wfr.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
  }
%>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=false">
    <title><webrun:message key="LABEL.OPERATION_KEYS"/></title>
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <style>.fas, .far, .fad, .fab { font-size: 1.5rem; }</style>
  </head>
  <body>
    <table class="table table-striped text-center">
      <thead>
        <tr>
          <th scope="col"><webrun:message key="LABEL.SHORTCUTS"/></th>
          <th scope="col"><webrun:message key="LABEL.ICON"/></th>
          <th scope="col"><webrun:message key="LABEL.DESCRIPTION"/></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="align-middle">Ctrl+Insert<br><small class="text-muted"><webrun:message key="LABEL.OR"/></small> Ctrl+I</td>
          <td class="align-middle"><i class="fas fa-plus-circle text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.INCLUDE_RECORD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Ctrl+E</td>
          <td class="align-middle"><i class="fas fa-pencil-alt text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.EDIT_RECORD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Ctrl+Del<br><small class="text-muted"><webrun:message key="LABEL.OR"/></small> Ctrl+D</td>
          <td class="align-middle"><i class="fas fa-trash-alt text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.EXCLUDE_RECORD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Ctrl+S</td>
          <td class="align-middle"><i class="fas fa-save text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.SAVE_RECORD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Ctrl+F<br><small class="text-muted"><webrun:message key="LABEL.OR"/></small> Ctrl+L</td>
          <td class="align-middle">&nbsp;</td>
          <td class="align-middle"><webrun:message key="LABEL.CONSULT_REGISTER"/></td>
        </tr>
        <tr>
          <td class="align-middle">Ctrl+K</td>
          <td class="align-middle">&nbsp;</td>
          <td class="align-middle"><webrun:message key="LABEL.FIRST_TAB"/></td>
        </tr>
        <tr>
          <td class="align-middle">Ctrl+P</td>
          <td class="align-middle"><i class="fas fa-print text-muted"></i></td>
          <td class="align-middle"><webrun:message key="JS.LABEL.PRINT"/></td>
        </tr>
        <tr>
          <td class="align-middle">Alt+A</td>
          <td class="align-middle"><i class="fas fa-redo text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.REFRESH_RECORDS"/></td>
        </tr>
        <tr>
          <td class="align-middle">Esc</td>
          <td class="align-middle"><i class="far fa-times-circle text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.CANCEL_OPERATION"/></td>
        </tr>
        <tr>
          <td class="align-middle">Ctrl+Home</td>
          <td class="align-middle"><i class="fas fa-angle-double-left text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.FIRST_RECORD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Page Down</td>
          <td class="align-middle"><i class="fas fa-chevron-left text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.PREVIOUS_RECORD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Page Up</td>
          <td class="align-middle"><i class="fas fa-chevron-right text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.NEXT_RECORD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Ctrl+End</td>
          <td class="align-middle"><i class="fas fa-angle-double-right text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.LAST_RECORD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Enter<br><small class="text-muted"><webrun:message key="LABEL.OR"/></small> Tab</td>
          <td class="align-middle">&nbsp;</td>
          <td class="align-middle"><webrun:message key="LABEL.CHANGE_FIELD"/></td>
        </tr>
        <tr>
          <td class="align-middle">Alt+F4</td>
          <td class="align-middle"><i class="fas fa-sign-out-alt text-muted"></i></td>
          <td class="align-middle"><webrun:message key="LABEL.CLOSE"/></td>
        </tr>
        <tr>
          <td class="align-middle"><webrun:message key="LABEL.SPACE_BAR"/></td>
          <td class="align-middle">&nbsp;</td>
          <td class="align-middle"><webrun:message key="LABEL.SHOW_DATA"/></td>
        </tr>
        <tr>
          <td class="align-middle">F5</td>
          <td class="align-middle">&nbsp;</td>
          <td class="align-middle"><webrun:message key="LABEL.ORIGINAL_SCREEN"/></td>
        </tr>
        <tr>
          <td class="align-middle">F12</td>
          <td class="align-middle">&nbsp;</td>
          <td class="align-middle"><webrun:message key="LABEL.OPERATION_KEYS"/></td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
