<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%
  HTMLInterface wfr = HTMLInterface.getInstance(request);
%>
<%@page import="wfr.util.Functions"%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
<title><webrun:message key="LABEL.PROGRESS"/></title>
<webrun:import src="wfr.js"/>

<link rel="stylesheet" href="<%=wfr.getSkin().getCss()%>">
<script language="JavaScript" type="text/JavaScript">
<!--

function setText(text) {
  MM_findObj('Message').innerHTML = text;
}

function setPercent(v) {
  MM_findObj('PercentText').innerHTML = v+'%';
  if (v == '0')
    MM_findObj('Bar').width = '1';
  else
    MM_findObj('Bar').width = v * 2.45;

  if (v >= 100) { // Ativa o botão fechar
        MM_findObj('exit').style.display = "block";
  }
}

//-->
</script>
<style type="text/css">
<!--
.style1 {
        font-family: Verdana, Arial, Helvetica, sans-serif;
        font-size: 10px;
        font-weight: bold;
}
-->
</style>
</head>

<body><br>

<div id="Message" align="center">
<%=Functions.fromISOtoBASE(request.getParameter("text"))%>
</div>
<br>
<table width="250"  border="0" align="center" cellpadding="2" cellspacing="1" bgcolor="#000000">
    <tr>
      <td bgcolor="#FFFFFF"><table id="Bar" width="0"  border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td bgcolor="#FFFFFF"><img src="<%=wfr.getSkin().getDir()%>progress.gif" name="Bar" width="0" height="10" id="Bar"></td>
        </tr>
      </table></td>
    </tr>
</table>
  <table width="250" border="0" align="center" cellpadding="0" cellspacing="0">
    <tr>
      <td height="40" align="left" valign="top"><div class="style1" id="PercentText">0%</div></td>
      <td align="right" valign="middle"><a href="javascript:window.close();" style="display:none" id="exit"><img src="Skins/Default/button_exit.gif" width="52" height="23" border="0"></a></td>
    </tr>
  </table>
</body></html>