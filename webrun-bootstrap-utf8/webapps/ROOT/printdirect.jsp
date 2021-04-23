<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true">
<%@ page import="wfr.util.WFRConfig" %>
<%@ page import="wfr.util.Functions" %>
<%
  int porta = wfr.util.WFRConfig.config().getInt("Impressao", "Porta");
  String texto = request.getParameter("texto");
%>

<html>
  <head>
    <%= Functions.legacyMessage() %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/sweetalert/sweetalert.min.js"/>    
    <webrun:import src="components/HTMLMessage.js"/>
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
  </head>
  <script language="JavaScript">
  var porta = <%=porta%>;
  var tx ="<%=texto%>";

  var webSocket = new WebSocket("ws://localhost:"+ porta +"/imprimir/servidorimpressao");
  
  webSocket.onopen = function(){    
    webSocket.send(tx);
  };
  
  webSocket.onmessage = function(message){    
    try{
      var data = JSON.parse(message.data);
      var msg = new parent.HTMLMessage();
      console.log("Verifique se o usuário do serviço tem acesso à impressora padrão.")

      if(data.error === 100){
        msg.showErrorMessage("", '<webrun:message key="ERROR.SERVICEPRINTER_ERROR_100" js="true"/>');
      }else if(data.error === 500){
        msg.showErrorMessage("", '<webrun:message key="ERROR.SERVICEPRINTER_ERROR_500" js="true"/>');
      }
      console.log(data.stack.replace(/\,,,/g,'\n'));
    }catch{}
    webSocket.close();
  };
  
  webSocket.onerror   = function(){ 
    var msg = new parent.HTMLMessage();
    msg.showErrorMessage("", '<webrun:message key="ERROR.SERVICEPRINTER_CONFIGURATION" js="true"/>');
  };
  </script>
</html>
</webrun:controller>