<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<!DOCTYPE html>
<html class="h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="LABEL.DATA_IMPORT"/></title>
    <link rel="shortcut icon" href="webrun.ico" type="image/x-icon">
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.FORM_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <script type="text/javascript">
      function openFileImport() {
        document.getElementById("file-import").click();
      }

      function selectFile(input) {
        if (input && input.files && input.files.length > 0) {
          document.getElementById("file-import-dir").value = input.value;
          document.getElementById("file-import-form").submit();
        }
      }

      function closeWindow() {
        if (window.frameElement && window.frameElement.close) {
          window.frameElement.close();
        } else if (window.close) {
          window.close();
        }
      }
    </script>
  </head>
  <body class="h-100 d-flex flex-column">
    <nav class="navbar sticky-top navbar-light bg-light border-bottom mb-0">
      <span class="navbar-brand mb-0 h2 d-flex align-items-center"><i class="fas fa-file-import mr-2" style="font-size: 1.5rem;"></i><webrun:message key="LABEL.DATA_IMPORT"/></span>
      <form class="form-inline ml-auto">
        <button class="btn btn-outline-primary" type="button" onclick="openFileImport();"><webrun:message key="LABEL.FILE_IMPORT"/></button>
      </form>
    </nav>
    <form method="POST" action="NewFileUpload" enctype="multipart/form-data" id="file-import-form">
      <input type="hidden" name="formID" value="<c:out value="${param.formID}"/>">
      <input type="hidden" name="sys" value="<c:out value="${param.sys}"/>">
      <input type="hidden" name="diretorio" id="file-import-dir">
      <input type="file" class="d-none" value="<webrun:message key="LABEL.FILE_IMPORT"/>" onchange="selectFile(this);" name="arquivo" id="file-import">
    </form>
    <form method="POST" action="InsertDataFileImport">
      <input type="hidden" name="fileDirectroy" value="<c:out value="${diretorio}"/>">
      <input type="hidden" name="tableName" value="<c:out value="${tableName}"/>">
      <input type="hidden" name="sys" value="<c:out value="${sys}"/>">
      <input type="hidden" name="formID" value="<c:out value="${formID}"/>">
      <input type="hidden" name="fileName" value="<c:out value="${fileName}"/>">
      <input type="hidden" name="formID" value="<c:out value="${param.formID}"/>">
      <input type="hidden" name="sys" value="<c:out value="${param.sys}"/>">

      <div class="w-100 px-3 py-2 bg-light border-bottom text-center text-muted font-weight-bold"><webrun:message key="LABEL.ORIGIN_FILE"/></div>
      <textarea name="arquivo" class="form-control-plaintext w-100"><c:out value="${textFile}"/></textarea>

      <div class="w-100 px-3 py-2 bg-light border-bottom text-center text-muted font-weight-bold"><webrun:message key="LABEL.MAPPING"/></div>
      <div class="p-3">
        <c:forEach var="campo" items="${campos}"> 
          <div class="form-group position-relative">
            <label for="name"><webrun:message key="LABEL.NAME"/></label>
            <input type="text" class="form-control" id="name" name="name" readonly="readonly" value="<c:out value="${campo.name}"/>">
          </div>
          <div class="form-group position-relative">
            <label for="posicaoInicial"><webrun:message key="LABEL.INITIAL_POSITION"/></label>
            <input type="text" class="form-control" id="posicaoInicial" name="posicaoInicial" value="<c:if test="${campo.inicio != 0}"><c:out value="${campo.inicio}"/></c:if>">
          </div>
          <div class="form-group position-relative">
            <label for="posicaoFinal"><webrun:message key="LABEL.FINAL_POSITION"/></label>
            <input type="text" class="form-control" id="posicaoFinal" name="posicaoFinal" value="<c:if test="${campo.fim != 0}"><c:out value="${campo.fim}"/></c:if>">
          </div>
          <div class="form-group position-relative">
            <label for="mascara"><webrun:message key="LABEL.MASK"/></label>
            <input type="text" class="form-control" id="name" name="mascara" value="<c:out value="${campo.mascara}"/>">
          </div>
          <div class="form-group position-relative">
            <label for="tipo"><webrun:message key="LABEL.TYPE"/></label>
            <input type="text" class="form-control" id="name" name="tipo" readonly="readonly" value="<c:out value="${campo.tipo}"/>">
          </div>
          <hr>
        </c:forEach>
        <c:if test="${not empty campos}">
          <div class="form-group position-relative mb-0 d-flex justify-content-end alignt-items-center">
            <button type="button" class="btn btn-secondary mr-2" onclick="closeWindow();"><webrun:message key="LABEL.CANCEL"/></button>
            <button type="submit" class="btn btn-primary"><webrun:message key="LABEL.OK"/></button>
          </div>
        </c:if>
      </div>

      <div class="w-100 px-3 py-2 bg-light border-bottom text-center text-muted font-weight-bold"><webrun:message key="LABEL.LOG_LABEL"/></div>
      <textarea name="arquivo" class="form-control-plaintext w-100"><c:out value="${log}"/></textarea>
    </form>
  </body>
</html>