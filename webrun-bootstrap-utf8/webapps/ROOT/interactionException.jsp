<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>

<html>
<style type="text/css">
<!--
body {
	margin-left: 0px;
	margin-top: 0px;
	margin-right: 0px;
	margin-bottom: 0px;
}
#content {
  position: absolute;
  left: 15px;
  top: 29px;
  width: 471px;
  height: 294px;
  z-index: 1;
  background-color: #FFFFFF;
  overflow: auto;
  font-family: Verdana, Arial, Helvetica, sans-serif;
  color: #333333;
  font-size: 10px;
}

.botao {
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 10px;
  color: #333333;
  text-decoration: none;
  width: 91px;
  height: 25px;
  background: #ffffff;
  background: -moz-linear-gradient(-45deg, #ffffff 0%, #f3f3f3 50%, #ededed 51%, #ffffff 100%);
  background: -webkit-linear-gradient(-45deg, #ffffff 0%,#f3f3f3 50%,#ededed 51%,#ffffff 100%);
  background: linear-gradient(135deg, #ffffff 0%,#f3f3f3 50%,#ededed 51%,#ffffff 100%);
  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#ffffff',GradientType=1 );
  text-align: center;
  border: 1px solid #C1C1C1;
}

#btOk{
  text-decoration: none;
  color: #888888;
  font-size: 12px;
  outline: none;
}

.title {
  font-family:Verdana, Arial, Helvetica, sans-serif;
  font-size:10px;
  color:#224bdd;
  font-weight: bold;
}
-->
</style>
<script>
/* - - JGQueryString
   - Version 0.1
   - Copyright (c) 2003 - 2006 Júlio Greff de Oliveira
   - http://juliogreff.wordpress.com/
*/
JGQueryString = {
	getVars: function() {
		var queryString = window.location.search.substring(1,window.location.search.length);
		var queryStrings = new Array();
		var tempArray = queryString.split("&");
		for(var i = 0; i < tempArray.length; i++) {
			tempArray[i] = tempArray[i].split("=");
			queryStrings[tempArray[i][0]] = tempArray[i][1];
		}
		return queryStrings;
	},
	getVar: function(varName) {
		return this.getVars()[varName];
	}
}
</script>
<body onload="document.getElementById('btOk').focus();">
<div id="content"><script>document.write(opener.getInteractionException(parseInt(JGQueryString.getVar("id"))));</script></div>
<table width="500" height="370" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td><table width="500" height="370" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td height="18">
        <table>
          <tr>
            <td width="20"><img></td>
            <td class="title"><webrun:message key="LABEL.GENERATED_EXCEPTION" /></td>
          </tr>
        </table>
        </td>
      </tr>
      <tr>
        <td align="center" valign="middle"><table width="473" height="296" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" valign="middle" style="border: 1px solid #ccc;">&nbsp;</td>
          </tr>
        </table></td>
      </tr>
      <tr>
        <td height="35"><table width="500" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>&nbsp;</td>
            <td width="143" height="35" align="center" valign="middle">
            <table width="61%" height="21" border="0" align="right" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" valign="middle">
                <table style="cursor: pointer;" onclick="window.close();" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="2" height="2"><img width="2" height="2" alt=""></td>
                    <td></td>
                    <td width="2" height="2"><img width="2" height="2" alt=""></td>
                  </tr>
                  <tr>
                    <td width="2"></td>
                    <td>
                      <table>
                        <tr>
                          <td width="5"></td>
                          <td class="botao">
                            <a id="btOk" href="#"><webrun:message key="LABEL.OK" /></a>
                          </td>
                          <td width="5"></td> 
                        </tr>
                      </table>
                    </td>
                    <td width="2"></td>
                  </tr>
                  <tr>
                    <td width="2" height="2"><img width="2" height="2" alt=""></td>
                    <td></td>
                    <td width="2" height="2"><img width="2" height="2" alt=""></td>
                  </tr>
                </table>
                </td>
              </tr>
            </table></td>
          </tr>
        </table></td>
      </tr>
    </table></td>
  </tr>
</table>
</body>
</html>