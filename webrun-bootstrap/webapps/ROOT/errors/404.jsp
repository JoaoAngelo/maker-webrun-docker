<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>


<html>
  <head>
    <title><webrun:message key="ERROR.PAGE_NOT_FOUND"/></title>
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
        /*cursor: pointer;*/
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
  </head>
  
  <body marginheight="0" marginwidth="0" bottommargin="0" leftmargin="0" topmargin="0" rightmargin="0">

    <div id="topbar"></div>
    
    <div class="erro">
      <span class="codeError">404</span>
      <span class="errorMessage"><webrun:message key="ERROR.PAGE_NOT_FOUND"/></span>
    </div> 

  </body>
</html>