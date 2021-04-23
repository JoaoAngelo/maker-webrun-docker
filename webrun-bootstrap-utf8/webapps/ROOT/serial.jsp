<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ page import="wfr.com.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%
  Logger logger = Logger.getLogger(this.getClass());

  String sys = request.getParameter("sys");

  HTMLInterface wfr = null;
  try {
    wfr = HTMLInterface.getInstance(request);
  } catch (Exception e) {
    logger.error(wfr != null ? wfr.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    return;
  }
  
  String entityName = request.getParameter("entityName");
  if (entityName != null && entityName.trim().length() == 0) {
    entityName = wfr.getSystem().getEntityName(wfr.getData());
  }
%>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
<link rel="stylesheet" href="classes.css">
<webrun:import src="wfr.js"/>
<style type="text/css">
<!--
.style1 {font-family: Verdana, Arial, Helvetica, sans-serif;
        font-size: 10px;
        font-weight: bold;
}
.style2 {font-family: Verdana, Arial, Helvetica, sans-serif;
        font-size: 10;
}
-->
</style>
<script type="text/JavaScript">
<!--
function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

function serial() {
  var s = prompt('<webrun:message key="INFO.TYPE_THE_SERIAL" js="true"/>:', "");
  
  var charactersToRemove = /[\-\t\s]/g;
  s = s.replace(charactersToRemove, "");
  
  if (s.length != 25) {
    interactionError('<webrun:message key="ERROR.INVALID_SERIAL" js="true"/>');
    return;
  }
  
  var ser = new Array(5);
  
  for (i=0;i<=4;i++) {
    ser[i] = s.substring(i*5,(i*5)+5);
  }
  
  MM_findObj('s1').value = ser[0];
  MM_findObj('s2').value = ser[1];
  MM_findObj('s3').value = ser[2];
  MM_findObj('s4').value = ser[3];
  MM_findObj('s5').value = ser[4];
}
//-->
</script>
</head>

<body leftmargin=0 topmargin=0 marginwidth=0 marginheight=0 onLoad="MM_preloadImages('Resource/button_systems_over.gif','Resource/button_acess_over.gif');">

<%
  String backgroundImage = "Resource/" + WFRSystem.WEBRUN_TYPE.toLowerCase() + ".jpg?" + WFRSystem.WEBRUN_VERSION;

  String confImage = WFRConfig.config().get("Skin", "BackgroundImageOutApp");
  if (confImage.trim().length() > 0) {
    backgroundImage = confImage.trim();
  }
%>

<div style="width: 100%; height: 100%; z-index: 0; position: absolute">
  <img src="<%=backgroundImage%>" width="100%" height="100%"/>
</div>

<div style="width: 100%; height: 100%; z-index: 1; position: absolute">
<table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" valign="middle">
        <iframe style="display: none; left: 0px; position: absolute; top: 0px; width: 0; height: 0;" allowtransparency="true" name="WFRFormComands" src="nothing.html" width="0" height="0" frameborder=yes" border=0 marginwidth=0 marginheight=0 scrolling=no></iframe>
        <form name="WFRLogon" method="post" action="serial.do" target="WFRFormComands">
          <table width="374" height="243" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td height="25"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="10" height="25"><img src="Resource/top_left.gif" width="10" height="25"></td>
                    <td background="Resource/bg_top.gif"><table width="100%"  border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td><span class="style1"><webrun:message key="INFO.SYSTEM_REGISTER"/> - <%=wfr.getSystem().getRealCode()%></span></td>
                          <td width="13"><a href="<c:url value="/"/>"><img src="Resource/bt_close.gif" width="13" height="13" border="0"></a></td>
                        </tr>
                    </table></td>
                    <td width="10" height="25"><img src="Resource/top_rigth.gif" width="10" height="25"></td>
                  </tr>
              </table></td>
            </tr>
            <tr>
              <td height="69" align="center" valign="middle" bgcolor="#737373"><table width="372" height="69" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td bgcolor="#FFFFFF"><img src="Resource/banner.jpg" width="372" height="69"></td>
                  </tr>
              </table></td>
            </tr>
            <tr>
              <td align="center" valign="top" bgcolor="#737373"><table width="372" height="141" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td background="Resource/bg_center.gif"><table width="100%" height="140"  border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" valign="middle"><table width="97%" border="0" align="center" cellpadding="3" cellspacing="2">
                            <tr>
                              <td width="16%" align="left"><span class="style2"><font size="2" face="Arial, Helvetica, sans-serif">  <webrun:message key="LABEL.CLIENT"/>:  </font></span> </td>
                              <td width="84%" align="left"><table width="100%"  border="0" cellspacing="1" cellpadding="0">
                                  <tr>
                                    <td><input name="entity" type="text" class="editLogon" id="entity" style="height: 17px; width: 262px;" tabindex="1" value="<%=Functions.stringToHTMLString(Functions.fromISOtoBASE(entityName))%>"></td>
                                  </tr>
                              </table></td>
                            </tr>
                            <tr>
                              <td align="left"> <span class="style2"> <font size="2" face="Arial, Helvetica, sans-serif"><webrun:message key="LABEL.SERIAL"/>:</font></span>  </td>
                              <td align="left"><table width="100%"  border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td width="81%"><table  border="0" cellspacing="1" cellpadding="0">
                                        <tr align="center">
                                          <td width="20%"><input name="s1" type="text" class="editLogon" id="s1" style="height: 17px; width: 50px;" maxlength="5"></td>
                                          <td width="20%"><input name="s2" type="text" class="editLogon" id="s2" style="height: 17px; width: 50px;" maxlength="5"></td>
                                          <td width="20%"><input name="s3" type="text" class="editLogon" id="s3" style="height: 17px; width: 50px;" maxlength="5"></td>
                                          <td width="20%"><input name="s4" type="text" class="editLogon" id="s4" style="height: 17px; width: 50px;" maxlength="5"></td>
                                          <td width="20%"><input name="s5" type="text" class="editLogon" id="s5" style="height: 17px; width: 50px;" maxlength="5"></td>
                                        </tr>
                                    </table></td>
                                    <td width="19%"><a href="javascript:serial();"><img src="Resource/select.gif" width="14" height="14" border="0"></a></td>
                                  </tr>
                              </table></td>
                            </tr>
                          </table></td>
                        </tr>
                        <tr>
                          <td height="1" align="center" valign="middle"><img src="Resource/separator.gif" width="352" height="2"></td>
                        </tr>
                        <tr>
                          <td height="45"><table width="360"  border="0" align="center" cellpadding="0" cellspacing="0">
                              <tr>
                                <td width="180" align="left" valign="middle"><a href="<c:url value="/"/>"><img src="Resource/button_systems.gif" name="Systems" width="57" height="45" border="0"></a></td>
                                <td width="180" align="right" valign="middle">
                                  <input type="image" name="imageField2" src="Resource/button_modify.gif">
                                    <input name="sys" type="hidden" id="sys" value="<%=sys%>">
                                <input name="action" type="hidden" id="action" value="serial"></td>
                              </tr>
                          </table></td>
                        </tr>
                    </table></td>
                  </tr>
              </table></td>
            </tr>
            <tr>
              <td height="10"><table width="374" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="10" height="10"><img src="Resource/base_left.gif" width="10" height="10"></td>
                    <td height="10" background="Resource/bg_base.gif"><img src="Resource/bg_base.gif" width="1" height="10"></td>
                    <td width="10" height="10"><img src="Resource/base_rigth.gif" width="10" height="10"></td>
                  </tr>
              </table></td>
            </tr>
          </table>
        </form></td>
  </tr>
</table>
</div>
</body>
</html>

<webrun:errorMessage/>