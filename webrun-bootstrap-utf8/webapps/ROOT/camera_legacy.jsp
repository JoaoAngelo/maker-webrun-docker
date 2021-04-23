<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true" />
<%
  String params = "formID="+ request.getParameter("formID") +"&comID="+ request.getParameter("comID") +"&sys="+request.getParameter("sys");
%>
<%@page import="wfr.util.Functions"%>
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <title>Webrun Digital Capture</title>
    <style>
    body {
      overflow: hidden;
      margin: 0;
      background-color: #999;
    }
    </style>
  </head>
  <body>
    <div id="flashcontent"></div>
    <script src="webcam/swfobject.js"></script>
    <script>
    var swfUrl = "webcam/Camera.swf";
    var id = "flashcontent";
    var width = "<%=request.getParameter("width") %>";
    var height = "<%=request.getParameter("height") %>";
    var version = "10.3";
    var expressInstallSwfurl = "expressinstall.swf";
    var flashvars = {
        "formID": "<%=request.getParameter("formID") %>",
        "comID": "<%=request.getParameter("comID") %>",
        "sys": "<%=request.getParameter("sys") %>",
        "height": height,
        "width": width
    };
    var params = {
        "wmode": "transparent"
    };

    function updateComponent(hash) {
      window.opener.d.c_<%=request.getParameter("comID") %>.refresh(true, '<%=Functions.stringToJs(getServletConfig().getServletContext().getRealPath("") + "/Upload/")%>' + hash + '<%=".jpg"%>', hash);
      window.close();
    }

    function callError() {
      alert('<webrun:message key="ERROR.CAPTURE_DEVICE_INIT_FAILED" js="true"/>');
      window.close();
    }

    resizeTo(+width + outerWidth - innerWidth, +height + outerHeight - innerHeight);

    swfobject.embedSWF(swfUrl, id, width, height, version, expressInstallSwfurl, flashvars, params);
    </script>
  </body>
</html>
