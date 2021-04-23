<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<%@ page import="java.util.*,java.io.*" %>
<%@ page isErrorPage="true" %>



<html>
  <head>
    <title><webrun:message key="ERROR.SERVER_INTERNAL_ERROR"/></title>

    <style>
      
      @font-face {
        font-family: quicksand;
        src: url(fonts/Quicksand_Book.otf);
      }

      *{
        font-family: roboto;
      }

      #topbar{
        top: 0;
        width: 100%;
        height: 50px;
        position: absolute;
        z-index: 999;
        background-color: dodgerblue;
      }


      /*headers*/

      h2{
        color: #1968b2;
        margin: auto;
        font-size: 19px;
        font-family: quicksand;
      }


      /*CSS do corpo*/
      body{
        padding: 0px; 
        margin: 0px;
        
      }

      /* Page ERROR */

      .codeError{
        font-size: 200;
        display: block;
        color: #d6d6d6;
        font-weight: 600;
      }
      .errorMessage{
        font-size: 40;
        display: block;
        color: #d6d6d6;
        cursor: pointer;
      }

      .erro{
        text-align: center;
        height: 280px;
        top: 50%;
        margin-top: -160px;
        position: relative;
        transition: all .2s;
      }
      
      .details{
        top: 20px;
        opacity: 0;
        height: 0px;
        transition: all .2s;
        overflow: auto;
        width: 462px;
        left: calc(50% - 231px);
        position: relative;
        text-align: left;
        white-space: nowrap;
      }
      
      .openDetails{
      opacity: 1;
      height: 250px;
      }
      
      .openTop{
        top: 30%;
      }
    
 </style>
 
 <script type="text/javascript">
 
  function eventClick(){
	  var element = document.getElementById("erro");
	  var elementD = document.getElementById("details");
	  elementD.setAttribute("class", "details openDetails");
	  element.setAttribute("class", "erro openTop");
 }
 </script>
  </head>
  
  <body marginheight="0" marginwidth="0" bottommargin="0" leftmargin="0" topmargin="0" rightmargin="0">

    <div id="topbar"></div>
    
    <div id="erro" class="erro">
      <span class="codeError">500</span>
      <span id="errorMessage" onClick="eventClick()" class="errorMessage"><webrun:message key="ERROR.SERVER_INTERNAL_ERROR"/></span>
      
         <%
           java.lang.String sStackTrace = "";
           if(exception != null && wfr.util.Functions.isDebugMode()){
             StringWriter sw = new StringWriter();
             PrintWriter pw = new PrintWriter(sw);
             exception.printStackTrace(pw);
             sStackTrace = sw.toString().replaceAll("\n", "").replaceAll("\t", "").replaceAll("\r", "<br/>");
           }
         %>
         <div id="details" class="details"><%=sStackTrace%></div>

    </div> 

  </body>
</html>