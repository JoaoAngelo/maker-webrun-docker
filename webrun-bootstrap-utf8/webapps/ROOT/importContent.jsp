<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<webrun:controller requiresManagerUser="true">

<%
String sysCode = request.getParameter("sys");
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}" />
<title>Import</title>
<style type="text/css">
<!--
body {
	margin-left: 0px;
	margin-top: 0px;
	margin-right: 0px;
	margin-bottom: 0px;
	background-color: #eaebfb;
}
#Layer1 {
	position:absolute;
	left:0px;
	top:3px;
	width:485px;
	height:59px;
	z-index:1;
}
.style3 {font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10px; }
.style4 {
	color: #0000FF;
	font-weight: bold;
}
.disabled{
	font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 10px;
	color: #333333;
	font-weight: normal;
}

#Layer2 {
	position:absolute;
	left:2px;
	top:60px;
	width:481px;
	height:200px;
	z-index:2;
}
#botoes {
	position:absolute;
	left:400px;
	top:265px;
	width:73px;
	height:31px;
	z-index:3;
}
#Layer4 {
	position:absolute;
	left:1px;
	top:41px;
	width:67px;
	height:20px;
	z-index:4;
}
.loginCampo {
	font-family:Verdana, Arial, Helvetica, sans-serif;
	font-size:10px;
	font-style:normal;
	font-weight:normal;
	color:#0F2A6e;
	background-color:#FFFFFF;
	border: 1px solid;
}
#markAllReports {
	position:absolute;
	left:4px;
	top:263px;
	width:341px;
	height:20px;
	z-index:5;
}
-->
</style>
<webrun:import src="wfr.js"/>
<script language="javascript">
document.processing = false;
<!--
	function hideButtons() {
		document.getElementById('botoes').style.display = "none";
	}
	
	function showTreeMenu() {
		window.open('showImportTree.jsp?sys=<%=sysCode%>','TreeMenu','width=300, height=300, statusbar=no, menubar=no, scrollbars=yes');
	}
	
	function submitReports() {
		if(!document.processing) {
			if(document.position) {

				strURL = "InsertImport?sys=<%=sysCode%>&data=" + URLEncode(document.date) + "&parent=" + document.parent + "&position=" + document.position; 
				
				k = 0;
				for(i = 1; i <= document.size; i++) {
					if(MM_findObj("index"+i).checked == true) {
						k++;
						strURL += "&report" + k + "=" + URLEncode(MM_findObj("index"+i).value);
					}
				}
				
				if (k == 0) {
					alert('<webrun:message key="INFO.SELECT_OPTION" js="true"/>!');
					return false;
				}
				
				// Mensagem de aguarde
				top.mainFrame.document.getElementById('contentReport').innerHTML = "<br><br><br><img src='Skins/Default/import_wait.gif' border='0'/>"
				document.processing = true;
				
				// Inserir antes ou depois
				strURL += "&order=" + MM_findObj("ordem").value;
				
				// Quantos relatórios foram selecionados
				strURL += "&size=" + k;
				
				getAndEval2(strURL);	
			} else {
				if(confirm('<webrun:message key="INFO.CHOOSE_MENU_POSITION" js="true"/>')) {
					showTreeMenu();
				}
				return false;
			}
		} else {
			alert('<webrun:message key="LABEL.WAIT" js="true"/>')
		}
	}
	
	function markAll() {
		objCheck = MM_findObj("selectAll");
		for(i = 1; i <= document.size; i++) {
			MM_findObj("index"+i).checked = objCheck.checked;
		}
	}
//-->
</script>
</head>

<body onload="hideButtons();">
<div id="markAllReports"></div>
<form action="" name="formImport" onsubmit="submitReports()">
<div id="Layer1">
<table width="100%" height="100%" border="0" cellpadding="0"
	cellspacing="0">
	<tr>
		<td valign="top" background="Skins/Default/nav_degrade.gif">
		<table width="98%" border="0" align="center" cellpadding="0"
			cellspacing="0">
			<tr>
				<td width="50%" height="20">
				<div id="system" class="disabled"></div>
				</td>
				<td width="50%" height="20">
				<div align="right" id="dataCriate" class="disabled"></div>
				</td>
			</tr>
			<tr>
				<td height="20" colspan="2">
				<table width="100%" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td>
						<div align="right" id="sysPosition" class="disabled"></div>
						</td>
						<td width="30" align="center" valign="middle">
						<div align="center" id="sysPositionFolder" style="display:none"><a
							href='javascript:;' onclick='showTreeMenu()'><img
							src='Skins/Default/ftv2folderclosed.gif' border="0"></a></div>
						</td>
					</tr>
				</table>
				</td>
			</tr>
		</table>
		</td>
	</tr>
</table>
</div>
<div id="Layer2">
<table width="481" height="200" border="0" align="center"
	cellpadding="0" cellspacing="0">
	<tr>
		<td align="center" valign="middle" bgcolor="#919b9c">
		<table width="479" height="198" border="0" align="center"
			cellpadding="0" cellspacing="5" bgcolor="#FFFFFF">
			<tr>
				<td align="center" valign="middle">
				<div id="contentReport"
					style="width:468px; height:187px; overflow:auto"></div>
				</td>
			</tr>
		</table>
		</td>
	</tr>
</table>
</div>
<div id="botoes"><a
	href="javascript:;" onclick="submitReports()"><img src="Skins/Default/button_import.gif"
	name="imageField" border="0" id="imageField" /></a></div>
<div id="Layer4"><img src="Skins/Default/import_flip.gif"
	width="67" height="20" /></div>
</body>
</html>

</webrun:controller>