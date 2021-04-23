<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <title><webrun:message key="LABEL.ZOOM_IMAGE"/></title>
    <meta name="viewport" content="width=device-width, user-scalable=yes">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <webrun:import src="wfr.js"/>
    <script type="text/javascript">
      window.onresize = resizeImage;

      function resizeImage() {
        var dimensions = getWindowDimensions();
        var image = document.getElementById("zoom-image");
        image.height = dimensions.height;
        image.width = dimensions.width;
      }

      function adjustWindowSize() {
        var image = document.getElementById("zoom-image");

        var realImageWidth = (image.offsetWidth ? image.offsetWidth : image.width);
        var realImageHeight = (image.offsetHeight ? image.offsetHeight : image.height);
        var widthGreaterThanHeight = (realImageWidth > realImageHeight);

        // Baseia-se na maior dimensão e ajusta para não perder a razão da foto original.
        var dimensions = getWindowDimensions();
        var updatedWidth, updatedHeight;
        if (widthGreaterThanHeight) {
          var fraction = (realImageWidth / realImageHeight);
          updatedWidth = dimensions.width;
          updatedHeight = parseInt(updatedWidth / fraction);
        } else {
          var fraction = (realImageHeight / realImageWidth);
          updatedHeight = dimensions.height;
          updatedWidth = parseInt(updatedHeight / fraction);
        }

        window.resizeTo(updatedWidth, updatedHeight);

        var left = (screen.width - updatedWidth) / 2;
        var top = (screen.height - updatedHeight) / 2;
        window.moveTo(left, top);
      }

      function getWindowDimensions() {
        var browserWidth, browserHeight;
        if (typeof(window.innerWidth) == "number") {
          browserWidth = window.innerWidth;
          browserHeight = window.innerHeight;
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
          browserWidth = document.documentElement.clientWidth;
          browserHeight = document.documentElement.clientHeight;
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
          browserWidth = document.body.clientWidth;
          browserHeight = document.body.clientHeight;
        }

        return {
          width: browserWidth,
          height: browserHeight
        };
      }
    </script>
  </head>
  <body class="w-100 h-100 overflow-hidden" onload="window.setTimeout(adjustWindowSize, 0);">
    <img id="zoom-image" src="<%=request.getQueryString()%>">
  </body>
</html>
