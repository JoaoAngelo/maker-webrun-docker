<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun"%>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true">
<%@ page import="wfr.sys.HTMLInterface.HTMLInterface" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<%@ page import="wfr.com.WFRSystem" %>
<%@ page import="wfr.sys.*" %>
<%@ page import="wfr.util.*" %>
<%@ page import="wfr.exceptions.ExceptionMessage" %>
<%@ page import="java.util.ArrayList" %>
<%
  Logger logger = Logger.getLogger(this.getClass());
  String sys = request.getParameter("sys");

  // upload.jsp
  String type = request.getParameter("type");
  String image = request.getParameter("image");
  if (type == null) type = "";

  // ruleUploadFile.jsp
  String formID = request.getParameter("formID");
  String ruleName = request.getParameter("ruleName");
  String ruleValidation = request.getParameter("ruleValidation");
  String multipleParam = request.getParameter("multiple");
  Boolean multiple = multipleParam != null && Boolean.parseBoolean(multipleParam);
  HTMLInterface wfr = null;
  Boolean resizeImage = false;
  int w = 0, h = 0;

  Boolean isRuleUpload = false;
  String ruleUpload = request.getParameter("ruleUpload");
  if (ruleUpload != null && !ruleUpload.isEmpty() && ruleUpload.trim().equalsIgnoreCase("true")) {
    isRuleUpload = true;

    try {
      wfr = HTMLInterface.getInstance(request);
      resizeImage = (wfr.getSystem().getAdvancedProperty("ImagemRedimensionarAoEnviar") != null && wfr.getSystem().getAdvancedProperty("ImagemRedimensionarAoEnviar").toString().length() > 0) ? true : false;

      if (resizeImage) {
        String[] arrText = wfr.getSystem().getAdvancedProperty("ImagemRedimensionarAoEnviar").toString().split(java.util.regex.Pattern.quote(";"), -1);
        ArrayList<String> s = new ArrayList<String>(java.util.Arrays.asList(arrText));
        if (s.size() == 2) {
          w = Integer.valueOf(s.get(0));
          h = Integer.valueOf(s.get(1));
        }
      }
    } catch (Exception e) {
      logger.error(wfr != null ? wfr.getUser() : WFRSystem.DEFAULT_USER, sys != null ? sys : WFRSystem.DEFAULT_SYSTEM, e);
    }

    if (!wfr.isAuthenticated() && !wfr.getSystem().isUploadAllowedOnExternalForm()) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN, wfr.getResources().getString(ExceptionMessage.INFO_FORBIDDEN_ACCESS));
      return;
    }
  } else {
   wfr = (HTMLInterface)request.getSession().getAttribute("WFR" + sys);
  }
%>
<!DOCTYPE html>
<html class="w-100 h-100">
  <head>
    <meta charset="${webrun:charset()}">
    <meta http-equiv="Content-Type" content="text/html; charset=${webrun:charset()}">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title><webrun:message key="LABEL.IMAGE_CHOOSEN"/></title>
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <link rel="stylesheet" type="text/css" href="assets/pages/upload.css">
    <% if (isRuleUpload) { %>
    <webrun:import src="assets/exif.min.js"/>
    <webrun:import src="rulesFunctions.js"/>
    <% } %>
    <webrun:import src="wfr.js"/>
    <webrun:import src="components/HTMLMessage.js"/>
    <script type="text/javascript">
      var selectFileButton;
      var cancelFileButton;
      var backErrorButton;

      var uploadButton;
      var webcamButton;
      var removeButton;

      var fileInput;

      var imagePreview;
      var fileName;
      var fileDetails;
      var previewClose;
      var multipleFiles = <%=multiple%>;

      <% if (resizeImage) { %>
        <% if (multiple) { %>
        var thumb = [];
        var thumbFile = [];
        <% } else { %>
        var thumb;
        var thumbFile;
        <% } %>
      <% } %>

      <%-- Função de formatar bytes --%>
      function bytesToSize(bytes) {
         var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
         if (bytes == 0) return '0 Byte';
         var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
         return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
      }

      <%-- Função de selecionar arquivos --%>
      function selectFiles(files, update) {
        <%-- Verificar se tem algum arquivo selecionado --%>
        if (files && files.length > 0) {
          if (update && fileInput) fileInput.files = files;
          if (uploadButton) uploadButton.className = "btn btn-success";

          <% if (multiple) { %>
          var filesList = document.getElementById("files-list");
          filesList.innerHTML = "";

          <%-- Dar loop em todos os arquivos --%>
          for (var i = 0; i < files.length; i++) {
            var file = files[i];

            <%-- Criar o item do arquivo na lista --%>
            var fileItem = document.createElement("li");
            fileItem.className = "list-group-item d-flex";
            filesList.appendChild(fileItem);

            <%-- Verificar se o arquivo é uma imagem --%>
            if (file.type.match(/image.*/)) {
              fileItem.className += " flex-row";

              <%-- Se for uma imagem, definir ela como ícone para visualização --%>
              var fileImagePreview = document.createElement("img");
              fileImagePreview.className = "mt-2 mr-3";
              fileImagePreview.setAttribute("height", "64");
              fileImagePreview.src = window.URL.createObjectURL(file);
              fileImagePreview.alt = file.name;
              fileItem.appendChild(fileImagePreview);

              var contentDiv = document.createElement("div");
              contentDiv.className = "d-flex flex-column flex-fill";
              fileItem.appendChild(contentDiv);

              fileItem = contentDiv;
            } else {
              fileItem.className += " flex-column";
            }

            var fileItemName = document.createElement("h5");
            fileItemName.className = "mb-0";
            fileItemName.innerHTML = file.name;
            fileItem.appendChild(fileItemName);

            var fileItemDetails = document.createElement("p");
            fileItemDetails.className = "mb-0";
            fileItemDetails.innerHTML =
              '<webrun:message key="LABEL.SIZE" js="true"/>: ' + bytesToSize(file.size) +
              '<br><webrun:message key="LABEL.TYPE" js="true"/>: ' + ((!file.type || file.type == "") ?
              '(<webrun:message key="LABEL.UNKNOWN" js="true"/>)' : file.type);
            fileItem.appendChild(fileItemDetails);

            <% if (resizeImage) { %>
            checkThumbnailGen(file);
            <% } %>
          }

          updateHeight();
          <% } else { %>
          var file = files[0];
          if (imagePreview) {
            <%-- Verificar se o arquivo é uma imagem --%>
            if (file.type.match(/image.*/)) {
              <%-- Se for uma imagem, definir ela como ícone para visualização --%>
              imagePreview.src = window.URL.createObjectURL(file);
              imagePreview.alt = file.name;
            } else {
              <%-- Se não for uma imagem, utilizar um ícone genérico --%>
              imagePreview.src = "";
              imagePreview.alt = "";
            }
          }

          <% if (resizeImage) { %>
          checkThumbnailGen(file);
          <% } %>

          <%-- Definir o conteúdo dos labels para exibir os detalhes do arquivo (tamanho, tipo, etc) --%>
          if (fileName) fileName.innerHTML = file.name;
          if (fileDetails) fileDetails.innerHTML =
            '<webrun:message key="LABEL.SIZE" js="true"/>: ' + bytesToSize(file.size) +
            '<br><webrun:message key="LABEL.TYPE" js="true"/>: ' + ((!file.type || file.type == "") ?
            '(<webrun:message key="LABEL.UNKNOWN" js="true"/>)' : file.type);
          <% } %>

          <%-- Esconder os containers de erro e upload --%>
          $("#error-content").hide();
          $("#upload-progress").hide();
          $("#preview-content").show();

          $("#preview-overlay").removeClass("d-none");
          $("#preview-overlay").addClass("d-flex");
          $("#preview-overlay").fadeIn(500); <%-- Exibir o overlay de visualização do arquivo --%>

          updateHeight();
        } else {
          <%-- Se não tiver nenhum arquivo selecionado, ocultar o overlay se ele estiver visível e
               limpar todo o conteúdo de visualização --%>
          clearPreview(update);
        }
      }

      function clearPreview(update) {
        if (uploadButton) uploadButton.className = "btn btn-success disabled";
        if ($("#preview-overlay").is(":visible")) {
          $("#preview-overlay").fadeOut(500, function() {
            $("#error-content").hide();
            $("#preview-overlay").removeClass("d-flex");
            $("#preview-overlay").addClass("d-none");
            if (imagePreview) {
              imagePreview.src = "";
              imagePreview.alt = "";
            }

            if (fileName) fileName.innerHTML = "";
            if (fileDetails) fileDetails.innerHTML = "";
          });

          <% if (resizeImage) { %>
            <% if (multiple) { %>
            thumb = [];
            thumbFile = [];
            <% } else { %>
            thumb = null;
            thumbFile = null;
            <% } %>
          <% } %>
        }

        if (update) {
          if (fileInput) {
            let parent = fileInput.parentElement;
            let id = fileInput.id;
            let name = fileInput.name;
            parent.removeChild(fileInput);
            fileInput = document.createElement("input");
            fileInput.id = id;
            fileInput.name = name;
            fileInput.type = "file";
            <% if (multiple) { %>fileInput.setAttribute("multiple", "");<% } %>
            parent.appendChild(fileInput);
            fileInput.addEventListener("change", function(e) {
              <% if (isRuleUpload) { %>
              if (validateForm()) {
              <% } %>
              selectFiles(fileInput.files, false);
              <% if (isRuleUpload) { %>
              }
              <% } %>
            }, false);
          }
        }
      }

      <%-- Função executada ao carregar a página --%>
      function startup() {
        <%-- Obter os elementos da página --%>
        selectFileButton = document.getElementById("selectFileButton");
        cancelFileButton = document.getElementById("cancelFileButton");
        backErrorButton = document.getElementById("backErrorButton");

        uploadButton = document.getElementById("uploadButton");
        webcamButton = document.getElementById("webcamButton");
        <% if (!isRuleUpload) { %>removeButton = document.getElementById("removeButton");<% } %>

        fileInput = document.getElementById("file-input");

        imagePreview = document.getElementById("image-preview");
        fileName = document.getElementById("file-name");
        fileDetails = document.getElementById("file-details");
        previewClose = document.getElementById("preview-close");

        <%-- Definir eventos nos elementos da página --%>
        if (fileInput) fileInput.addEventListener("change", function(e) {
          <% if (isRuleUpload) { %>
          if (validateForm()) {
          <% } %>
          selectFiles(fileInput.files, false);
          <% if (isRuleUpload) { %>
          }
          <% } %>
        }, false);

        document.documentElement.addEventListener("dragover", function(e) {
          e.preventDefault();
          document.body.classList.add("dragging");
          return true;
        }, false);

        document.documentElement.addEventListener("dragleave", function() {
          document.body.classList.remove("dragging");
          return true;
        });

        document.documentElement.addEventListener("drop", function(e) {
          e.preventDefault();
          document.body.classList.remove("dragging");
          selectFiles(e.dataTransfer.files, true);
          return true;
        }, false);

        if (selectFileButton) selectFileButton.onclick = function(e) {
          fileInput.click();
        };

        if (cancelFileButton) cancelFileButton.onclick = function(e) {
          selectFiles(null, true);
        };

        if (backErrorButton) backErrorButton.onclick = function(e) {
          selectFiles(null, true);
        };

        if (uploadButton) uploadButton.onclick = function(e) {
          <% if (multiple) { %>
          uploadFile();
          <% } else { %>
          var file = fileInput.files[0];
          if (!file || file.name.replace(/^\s+|\s+$/g, '') == "") clearPreview();
          else uploadFile();
          <% } %>
        };

        <% if (!isRuleUpload) { %>
        if (webcamButton) webcamButton.onclick = function(e) {
          opener.openCapture('<%=request.getParameter("sys")%>', '<%=request.getParameter("formID")%>', '<%=request.getParameter("comID")%>');
        };

        if (removeButton) removeButton.onclick = function(e) {
          $("#preview-close").hide();
          $("#preview-content").hide();
          $("#preview-overlay").removeClass("d-none");
          $("#preview-overlay").addClass("d-flex");
          $("#preview-overlay").fadeIn(250, function() {
            <%-- Resetar a progress bar e os elementos do upload --%>
            var progressBar = document.getElementsByClassName("progress-bar")[0];
            progressBar.setAttribute("aria-valuenow", "0");
            progressBar.setAttribute("aria-valuemax", "100");
            progressBar.style.width = "0%";
            progressBar.innerHTML = "0%";

            var uploadStatusLabel = document.getElementById("upload-status");
            uploadStatusLabel.innerHTML = "";

            <%-- Exibir o container de upload --%>
            $("#upload-progress").hide();
            $(".success-checkmark").hide();
            $("#request-loading").show();
            $("#upload-content").fadeIn(250, function() {
              <%-- Fazer o pedido de remoção do arquivo --%>
              var xhr = new XMLHttpRequest();
              xhr.open("POST", "fileUpload.do?sys=<%=request.getParameter("sys")%>&formID=<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>&comID=<%=request.getParameter("comID")%>&type=remove", true);
              xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

              xhr.onload = function(e) {
                if (xhr.readyState === 4 || xhr.status === 200) {
                  if (xhr.responseText && xhr.responseText.indexOf("Exception:") !== -1) {
                    showError('<webrun:message key="ERROR.SERVER_INTERNAL_ERROR" js="true"/>!', null, xhr.responseText);
                  } else {
                    <%-- Nenhum erro no backend detectado --%>
                    $("#request-loading").hide();
                    $("#upload-progress").hide();
                    $(".success-checkmark").show();

                    if (xhr.responseText && xhr.responseText.indexOf("closeWindow();") !== -1) {
                      <%-- O backend manda um script para ser executado quando a operação foi completada.
                         Então, o script deve ser executado depois de 1500ms para dar tempo da animação
                         do ícone de OK completar. --%>
                      setTimeout(function() {
                        eval(xhr.responseText);
                      }, 1500);
                    }
                  }
                } else {
                  <%-- Falha ao enviar o arquivo --%>
                  showError('<webrun:message key="ERROR.SEND_ERROR" js="true"/>', '<webrun:message key="ERROR.SEND_ERROR_DESC" js="true"/>');
                }
              };

              xhr.onerror = function() {
                showError('<webrun:message key="ERROR.SEND_ERROR" js="true"/>', '<webrun:message key="ERROR.SEND_ERROR_DESC" js="true"/>');
              };

              xhr.send();
            });
          });
        };
        <% } %>

        if (previewClose) previewClose.onclick = function(e) {
          selectFiles(null, true);
        };
      }

      function showError(title, message, details) {
        var errorTitle = document.getElementById("error-title");
        errorTitle.innerHTML = title;

        var errorMessage = document.getElementById("error-message");
        if (message && message.length > 0) {
          errorMessage.innerHTML = message;
          errorMessage.style.display = "block";
        } else {
          errorMessage.style.display = "none";
        }

        var errorDetails = document.getElementById("error-stacktrace");
        if (details && details.length > 0) {
          errorDetails.innerHTML = details;
          errorDetails.style.display = "block";
        } else {
          errorDetails.style.display = "none";
        }

        $("#upload-content").fadeOut(250, function() {
          $("#preview-close").fadeIn(250);
          $("#error-content").fadeIn(250);
        });
      }

      function uploadFile() {
        $("#preview-close").fadeOut(250);
        $("#preview-content").fadeOut(250, function() {
          <%-- Resetar a progress bar e os elementos do upload --%>
          var progressBar = document.getElementsByClassName("progress-bar")[0];
          progressBar.setAttribute("aria-valuenow", "0");
          progressBar.setAttribute("aria-valuemax", "100");
          progressBar.style.width = "0%";
          progressBar.innerHTML = "0%";

          var uploadStatusLabel = document.getElementById("upload-status");
          uploadStatusLabel.innerHTML = "";

          <% if (multiple) { %>
          var filesList = document.getElementById("files-list");
          filesList.innerHTML = "";
          <% } %>

          <%-- Exibir o container de upload --%>
          $("#upload-progress").show();
          $("#request-loading").hide();
          $(".success-checkmark").hide();
          $("#upload-content").fadeIn(250, function() {
            <%-- Enviar o arquivo selecionado manualmente --%>
            var xhr = new XMLHttpRequest();
            xhr.open("POST",
              <% if (multiple) { %> "uploadMultipleFiles.do?<%=request.getQueryString()%>"
              <% } else if (isRuleUpload) { %> "uploadFile.do?<%=request.getQueryString()%>"
              <% } else { %> "fileUpload.do?sys=<%=request.getParameter("sys")%>&formID=<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>&comID=<%=request.getParameter("comID")%>&type=<%=type%>"
              <% } %>, true);

            xhr.onload = function(e) {
              if (xhr.readyState === 4 || xhr.status === 200) {
                <%-- Arquivo enviado com sucesso --%>

                if (xhr.responseText && xhr.responseText.indexOf("Exception:") !== -1) {
                  <%-- Erro no backend --%>
                  showError('<webrun:message key="ERROR.SERVER_INTERNAL_ERROR" js="true"/>!', null, xhr.responseText);
                } else {
                  <%-- Nenhum erro no backend detectado --%>
                  $("#upload-progress").hide();
                  $(".success-checkmark").show();

                  <%-- O backend manda um script para ser executado quando a operação foi completada.
                    Então, o script deve ser executado depois de 1500ms para dar tempo da animação
                    do ícone de OK completar. --%>

                  <% if (isRuleUpload) { %>
                  if (xhr.responseText) {
                    setTimeout(function() {
                      var frame = document.createElement("iframe");
                      frame.className = "d-none border-0 m-0 p-0";
                      frame.style.width = "0px";
                      frame.style.height = "0px";

                      <%-- O IE / Edge não suporta a proprieade srcdoc do iframe. Devemos verificar
                           se for o IE / Edge e fazer de outra maneira. --%>
                      if (/Edge/.test(navigator.userAgent) ||
                          navigator.userAgent.indexOf('MSIE') !== -1 ||
                          navigator.appVersion.indexOf('Trident/') > -1) {
                        document.body.appendChild(frame);
                        var fd = frame.contentDocument;
                        fd.open();
                        fd.write(xhr.responseText);
                        fd.close();
                      } else {
                        frame.srcdoc = xhr.responseText;
                        document.body.appendChild(frame);
                      }
                    }, 1500);
                  }
                  <% } else { %>
                  if (xhr.responseText && xhr.responseText.indexOf("closeWindow();") !== -1) {
                    setTimeout(function() {
                      eval(xhr.responseText);
                    }, 1500);
                  }
                  <% } %>
                }
              } else {
                <%-- Falha ao enviar o arquivo --%>
                showError('<webrun:message key="ERROR.SEND_ERROR" js="true"/>', '<webrun:message key="ERROR.SEND_ERROR_DESC" js="true"/>');
              }
            };

            if (xhr.upload) {
              <%-- Evento para atualizar a barra de progresso --%>
              xhr.upload.addEventListener("progress", function(e) {
                if (e.lengthComputable) {
                  var percent = Math.floor((e.loaded / e.total) * 100).toString() + "%";
                  progressBar.setAttribute("aria-valuenow", e.loaded);
                  progressBar.setAttribute("aria-valuemax", e.total);
                  progressBar.style.width = percent + "%";
                  progressBar.innerHTML = percent + "%";
                  uploadStatusLabel.innerHTML = bytesToSize(e.loaded) + " / " + bytesToSize(e.total);
                } else {
                  <%-- Definir progress bar inconclusiva --%>
                  progressBar.setAttribute("aria-valuenow", "100");
                  progressBar.setAttribute("aria-valuemax", "100");
                  progressBar.style.width = "100%";
                  progressBar.innerHTML = "";
                }
              }, false);
            } else {
              <%-- Definir progress bar inconclusiva --%>
              progressBar.setAttribute("aria-valuenow", "100");
              progressBar.setAttribute("aria-valuemax", "100");
              progressBar.style.width = "100%";
              progressBar.innerHTML = "";
            }

            xhr.onerror = function() {
              <%-- Falha ao enviar o arquivo --%>
              showError('<webrun:message key="ERROR.SEND_ERROR" js="true"/>', '<webrun:message key="ERROR.SEND_ERROR_DESC" js="true"/>');
            };

            xhr.send(
              <% if (resizeImage) { %> getThumbnailFormData()
              <% } else if (isRuleUpload) { %> getFormData()
              <% } else { %>new FormData(document.getElementById("WFRUPLOAD"))<% } %>
            );
          });
        });
      }

      <% if (isRuleUpload) { %>
      function getFormData() {
        var formData = new FormData();
        <% if (multiple) { %>
        for (var i = 0; i < fileInput.files.length; i++) {
          var file = fileInput.files[i];
          formData.append("upload" + (i + 1), file);
        }
        <% } else { %>
        formData.append("upload", fileInput.files[0]);
        <% } %>
        return formData;
      }

      function validateForm() {
        var ruleValidationName = "<%=ruleValidation%>";
        if (ruleValidationName.length > 0 && ruleValidationName != "null" && ruleValidationName != "undefined") {
          <% if (multiple) { %>
          var ruleValidationParameters = new Array();
          for (var i = 0; i < fileInput.files.length; i++) {
            var currentFile = new Array();
            currentFile.push(fileInput.files[i].name);
            currentFile.push(fileInput.files[i].size);
            currentFile.push(fileInput.files[i].type);
            ruleValidationParameters.push(currentFile);
          }
          <% } else { %>
          var currentFile = new Array();
          var ruleValidationParameters = new Array();
          for (var i = 0; i < fileInput.files.length; i++) {
            currentFile.push(fileInput.files[i].name);
            currentFile.push(fileInput.files[i].size);
            currentFile.push(fileInput.files[i].type);
          }

          ruleValidationParameters.push(currentFile);
          <% } %>

          var context = window.frameElement && window.frameElement.targetContext ? window.frameElement.targetContext :
            parent && parent.mainform ? parent.mainform : top && top.mainform ? top.mainform : top;
          if (context.executeJSRuleNoField(context.sysCode, context.idForm, ruleValidationName,
          multipleFiles ? new Array(ruleValidationParameters) : ruleValidationParameters)) return true;

          setTimeout(function() {
            closeWindow();
          }, 100);
          return false;
        }

        return true;
      }
      <% } %>

      <% if (resizeImage) { %>
      function checkThumbnailGen(file) {
        <%-- Verificar se o arquivo é uma imagem --%>
        <% if (multiple) { %>
        if (file.type.match(/image.*/)) {
          generateThumbnail(file);
        }
        <% } else { %>
        if (file.type.match(/image.*/)) {
          generateThumbnail(file);
        } else {
          thumb = null;
          thumbFile = null;
        }
        <% } %>
      }

      function generateThumbnail(file) {
        var maxW = <%= w %> === 0 ? 250 : <%= w %>;
        var maxH = <%= h %> === 0 ? 250 : <%= h %>;

        <% if (multiple) { %>
        thumbFile.push(file);
        <% } else { %>
        thumbFile = file;
        <% } %>

        EXIF.getData(file, function() {
          var ori = EXIF.getTag(this, "Orientation");
          var img = new Image();

          img.onload = function() {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var iw = img.width;
            var ih = img.height;
            var scale = Math.min((maxW / iw), (maxH / ih));
            var iwScaled = iw * scale;
            var ihScaled = ih * scale;

            if (ori === 6) {
              canvas.width = ihScaled;
              canvas.height = iwScaled;
              ctx.rotate(90 / 180 * Math.PI);
              ctx.translate(0, -ihScaled);
            } else {
              canvas.width = iwScaled;
              canvas.height = ihScaled;
            }

            ctx.drawImage(img, 0, 0, iwScaled, ihScaled);

            <% if (multiple) { %>
            thumb.push(canvas.toDataURL());
            <% } else { %>
            thumb = canvas.toDataURL();
            <% } %>
          };

          img.src = URL.createObjectURL(file.target.files[0]);
        });
      }

      function getThumbnailFormData() {
        var formData = new FormData();

        <% if (multiple) { %>
        for (var i = 0; i < thumb.length; i++) {
          var blobBin = atob(thumb[i].split(',')[1]);
          var array = [];
          for (var i = 0; i < blobBin.length; i++) array.push(blobBin.charCodeAt(i));
          formData.append("upload" + (i + 1), new File([new Uint8Array(array)], thumbFile[i].name, { type: thumbFile[i].type }));
        }
        <% } else { %>
        var blobBin = atob(thumb.split(',')[1]);
        var array = [];
        for (var i = 0; i < blobBin.length; i++) array.push(blobBin.charCodeAt(i));
        formData.append("upload", new File([new Uint8Array(array)], thumbFile.name, { type: thumbFile.type }));
        <% } %>

        return formData;
      }
      <% } %>

      function closeWindow() {
        if (window.frameElement && window.frameElement.close) {
          window.frameElement.close();
        } else if (window.close) {
          window.close();
        }
      }

      function updateHeight() {
        if (window.frameElement) {
          if ($("#upload-content").is(":visible")) {
            window.frameElement.setHeight(document.getElementById("upload-content").scrollHeight);
          } else if ($("#preview-overlay").is(":visible")) {
            window.frameElement.setHeight(document.getElementById("preview-overlay").scrollHeight);
          } else {
            window.frameElement.setHeight(document.body.scrollHeight);
          }
        }
      }

      window.addEventListener('load', startup, false);
    </script>
  </head>
  <body class="w-100 h-100">
    <form name="WFRUPLOAD" id="WFRUPLOAD" method="post" action="" enctype="multipart/form-data" class="w-100 h-100 p-2 d-flex flex-wrap justify-content-center align-items-center">
      <input type="file" id="file-input" name="userfile"<% if (multiple) { %> multiple<% } %>>
      <div class="d-flex flex-wrap justify-content-center align-items-center">
        <% if (image != null && Boolean.parseBoolean(image)) { %>
        <h4 class="title"><webrun:message key="LABEL.IMAGE_CHOOSEN"/></h4>
        <% } else { %>
        <h4 class="title"><webrun:message key="LABEL.SEND_FILE"/></h4>
        <% } %>
        <div class="vertical-hr"></div>
        <button type="button" id="selectFileButton">
          <img src="assets/icons/pages/upload-2.svg" class="mb-1" width="56" height="56">
          <span class="mt-2"><webrun:message key="LABEL.UPLOAD"/></span>
        </button>
        <button type="button" id="webcamButton"<% if (isRuleUpload) { %> class="disabled" disabled<% } %>>
          <img src="assets/icons/pages/camera.svg" class="mb-1" width="56" height="56">
          <span class="mt-2"><webrun:message key="LABEL.WEBCAM"/></span>
        </button>
        <%
          String showRemove = request.getParameter("showRemove");
          if (showRemove != null && Boolean.parseBoolean(showRemove)) {
        %>
        <button type="button" id="removeButton"<% if (isRuleUpload) { %> class="disabled" disabled<% } %>>
          <img src="assets/icons/pages/remove.svg" class="mb-1 align-top" width="56" height="56">
          <span class="align-bottom"><webrun:message key="LABEL.REMOVE"/></span>
        </button>
        <% } else { %>
        <button type="button" class="disabled" disabled>
          <img src="assets/icons/pages/remove.svg" class="mb-1 align-top" width="56" height="56">
          <span class="mt-2 align-bottom"><webrun:message key="LABEL.REMOVE"/></span>
        </button>
        <% } %>
      </div>
    </form>

    <div id="preview-overlay" class="d-none flex-wrap align-items-center justify-content-center overflow-auto bg-light text-dark">
      <div class="container" id="preview-content">
        <% if (multiple) { %>
        <ul class="list-group text-dark" id="files-list"></ul>
        <a class="btn btn-danger" href="#" role="button" id="cancelFileButton"><webrun:message key="LABEL.CANCEL"/></a>
        <a class="btn btn-success disabled" href="#" role="button" id="uploadButton"><webrun:message key="LABEL.SEND"/></a>
        <% } else { %>
        <div class="row w-100">
          <div class="col-4">
            <img src="" class="w-100 h-auto" id="image-preview" style="max-height: 60vh;">
          </div>
          <div class="col-8">
            <h5 class="mt-0" id="file-name"></h5>
            <p class="p-0" id="file-details" style="font-size: 1.2rem;"></p>
            <div class="mt-3">
              <a class="btn btn-danger" href="#" role="button" id="cancelFileButton"><webrun:message key="LABEL.CANCEL"/></a>
              <a class="btn btn-success disabled" href="#" role="button" id="uploadButton"><% if (image != null && Boolean.parseBoolean(image)) { %><webrun:message key="LABEL.CHANGE"/><% } else { %><webrun:message key="LABEL.SEND"/><% } %></a>
            </div>
          </div>
        </div>
        <% } %>
      </div>

      <div id="upload-content">
        <div id="upload-progress">
          <h5 class="mt-0 mb-0"><webrun:message key="LABEL.SENDING"/>...</h5>
          <small class="text-muted" id="upload-status"></small>
          <div class="progress mt-1">
            <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>

        <div id="request-loading">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
          </div>
        </div>

        <div class="success-checkmark">
          <div class="check-icon">
            <span class="icon-line line-tip"></span>
            <span class="icon-line line-long"></span>
          </div>
        </div>
      </div>

      <div id="error-content">
        <div class="media">
          <i class="fas fa-times mt-1 mr-3 text-danger" style="font-size: 2.25rem;"></i>
          <div class="media-body">
            <h5 id="error-title"></h5>
            <p id="error-message"></p>
            <textarea class="form-control" id="error-stacktrace" readonly></textarea>
            <div class="d-flex justify-content-end mt-3">
              <a class="btn btn-secondary" href="#" role="button" id="backErrorButton"><webrun:message key="LABEL.BACK"/></a>
            </div>
          </div>
        </div>
      </div>

      <button type="button" class="position-fixed ml-2 mb-1 close" aria-label="<webrun:message key="LABEL.CLOSE"/>" id="preview-close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="upload-overlay">
      <img src="assets/icons/pages/upload.svg">
    </div>
  </body>
</html>
</webrun:controller>