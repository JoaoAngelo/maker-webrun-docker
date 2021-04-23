<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <title><webrun:message key="LABEL.ZOOM_IMAGE"/></title>
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <webrun:import src="wfr.js"/>
    <script type="text/javascript">
      window.onresize = resizeimg;

      function resizeimg() {
        var dimensions = getWindowDimensions();
        var image = document.getElementById("zoom-image");
        image.height = dimensions.height;
        image.width = dimensions.width;
        
        if(window.frameElement.urlImageZoom){
          document.body.querySelector('img').src = window.frameElement.urlImageZoom;
        }
      }

      function getWindowDimensions() {
        var browseWidth, browseHeight;

        if (!IE) {
          browseWidth = window.innerWidth;
          browseHeight = window.innerHeight;
        } else {
          browseWidth = document.documentElement.clientWidth;
          browseHeight = document.documentElement.clientHeight;
        }

        return {
          width: browseWidth,
          height: browseHeight
        };
      }
    </script>
  </head>
  <body class="w-100 h-100 overflow-hidden" onload="resizeimg()">
    <img id="zoom-image" src="<%= request.getQueryString() %>">
  </body>
</html>