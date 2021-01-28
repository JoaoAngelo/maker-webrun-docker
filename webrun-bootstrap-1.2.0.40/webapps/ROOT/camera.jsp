<%@ taglib uri="/WEB-INF/tlds/webrun.tld" prefix="webrun" %>
<webrun:controller allowsExternalAccess="true" checkFormAuthorization="true" />
<% String params = "formID=" + request.getParameter("formID") + "&comID=" + request.getParameter("comID") + "&sys=" + request.getParameter("sys"); %>
<%@ page import="wfr.util.Functions" %>
<%@ page import="wfr.sys.HTMLInterface.HTMLConstants" %>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="${webrun:charset()}">
    <meta name="viewport" content="width=device-width, user-scalable=false">
    <title>Webrun Digital Capture</title>
    <%= HTMLConstants.BOOTSTRAP_CSS %>
    <%= HTMLConstants.ICONS_CSS %>
    <%= HTMLConstants.JQUERY_JS %>
    <%= HTMLConstants.BOOTSTRAP_JS %>
    <link rel="stylesheet" type="text/css" href="assets/pages/camera.css"><%-- Camera Page CSS --%>
    <script type="text/javascript">
      var width = 550;
      var height = 0;

      var streaming = false;
      var streamObject = null;
      var capturedPhoto = null;

      var video = null;
      var captureButton = null;
      var photoEffect = null;
      var photoPreview = null;
      var chooseButton = null;
      var cancelButton = null;

      <%-- Função para tratar a inicialização do streaming da webcam --%>
      function streamHandler(stream) {
        streamObject = stream;
        if (video.hasOwnProperty('srcObject') || 'srcObject' in video) { <%-- Geral --%>
          video.srcObject = stream;
          video.play();
        } else if (video.hasOwnProperty('mozSrcObject') || 'mozSrcObject' in video) { <%-- Firefox Nightly 18.0 --%>
          video.mozSrcObject = stream;
          video.play();
        } else { <%-- Opera 12 / Chrome 22 --%>
          if (window.URL) { <%-- Opera 12 --%>
            video.src = window.URL.createObjectURL(stream);
            video.play();
          } else if (window.webkitURL) { <%-- Chrome 22 --%>
            video.src = window.webkitURL.createObjectURL(stream);
            video.play();
          }
        }
      }

      <%-- Função para tratar os erros --%>
      function errorHandler(error, origin) {
        if (origin == 1 || (error && error.name && (
            error.name == 'NotFoundError' ||
            error.name == 'NotAllowedError'))) {
          var errorContainer = document.getElementById("error");
          var messageError = document.getElementById("message-error");
          var noCamera = document.getElementById("no-camera");

          if (messageError) messageError.style.display = "none";
          if (noCamera) noCamera.style.display = "block";
          if (errorContainer) errorContainer.style.display = "block";
        } else {
          console.log(error);
          var errorMessage = '<webrun:message key="ERROR.CAPTURE_DEVICE_INIT_FAILED" js="true"/>';
          if (typeof error == 'string' && error.length > 0) errorMessage = error;
          else if (error && error.message) errorMessage = error.message;

          var errorContainer = document.getElementById("error");
          var errorContent = document.getElementById("errorContent");

          var messageError = document.getElementById("message-error");
          var noCamera = document.getElementById("no-camera");

          if (messageError) messageError.style.display = "block";
          if (noCamera) noCamera.style.display = "none";

          if (errorContent) errorContent.innerHTML = errorMessage;
          if (errorContainer) errorContainer.style.display = "block";
        }

        stopStreaming();

        if (photoPreview) {
          if (photoPreview.remove) photoPreview.remove();
          else photoPreview.parentNode.removeChild(photoPreview); // IE
          photoPreview = null;
          chooseButton = null;
          cancelButton = null;
        }

        if (photoEffect) {
          if (photoEffect.remove) photoEffect.remove();
          else photoEffect.parentNode.removeChild(photoEffect); // IE
          photoEffect = null;
        }
      }

      <%-- Função de parar o streaming da webcam e deletar os elementos da página --%>
      function stopStreaming() {
        if (streamObject) {
          if (streamObject.stop) {
            <%-- Método antigo para parar o streaming da webcam --%>
            streamObject.stop();
          } else {
            <%-- Método novo para parar o streaming da webcam --%>
            streamObject.getTracks().forEach(function(track) {
              track.stop();
            });
          }

          streamObject = null;
        }

        streaming = false;

        if (video) {
          if (video.remove) video.remove();
          else video.parentNode.removeChild(video); // IE
          video = null;
        }

        if (captureButton) {
          if (captureButton.remove) captureButton.remove();
          else captureButton.parentNode.removeChild(captureButton); // IE
          captureButton = null;
        }
      }

      <%-- Função executada ao carregar a página --%>
      function startup() {
        <%-- Obter os elementos da página --%>
        video = document.getElementById('video');
        captureButton = document.getElementById('captureButton');

        photoEffect = document.getElementById("photoEffect");
        photoPreview = document.getElementById("photoPreview");

        chooseButton = document.getElementById("chooseButton");
        cancelButton = document.getElementById("cancelButton");

        <%-- A função navigator.getUserMedia() está obsoleta e está marcada como não
           aconselhável a usar. Para contornar isso, primeiro iremos verificar se o método
           novo (navigator.mediaDevices.getUserMedia) existe. Se não existir, tentaremos
           utilizar o método antigo. Mais informações:
               - https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia
               - https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
               - https://stackoverflow.com/questions/28991835/firefox-navigator-getusermedia-is-not-a-function --%>

        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            <%-- Se o método novo não existir, devemos utilizar o metódo antigo --%>
              <%-- Para utilizar o método antigo: cada navegador implementa sua própria função que
                tem nome diferente dos outros navegadores. Para contornar isso verificamos qual
                função que existe e utilizamos ela. --%>
            var getUserMedia = (
              navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.msGetUserMedia
            );

            if (getUserMedia) {
              getUserMedia({
                video: true,
                audio: false
              }, streamHandler, errorHandler);
            } else {
              <%-- Quando nenhuma das duas funções exite, quer dizer que o
                 dispositivo não tem nenhuma webcam disponível ou o navegador
                 não tem suporte ou o navegador bloqueou a página a acessar
                 os dispositivos de mídia. --%>
              errorHandler(null, 1);
            }
          } else {
            <%-- Utilizar o método novo --%>
              navigator.mediaDevices.getUserMedia({
                video: true,
                  audio: false
              }).then(streamHandler).catch(errorHandler);
          }
        } catch(e) { errorHandler(e, 1); }

        <%-- Adicionar eventos aos elementos --%>
        video.addEventListener('canplay', function(e) {
          if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);
            if (isNaN(height)) height = width / (4 / 3);
            if (captureButton) captureButton.style.display = "block";
            if (photoEffect) {
              photoEffect.className = "";
              photoEffect.style.display = "none";
            }

            streaming = true;
          }
        }, false);

        <%-- Evento de clique do botão de tirar foto --%>
        captureButton.addEventListener('click', function(e) {
          e.preventDefault();
          takePicture();
        }, false);

        <%-- Evento de clique do botão de cancelar/tirar outra foto --%>
        cancelButton.addEventListener('click', function(e) {
          e.preventDefault();
          capturedPhoto = null;
          if (photoEffect) photoEffect.style.display = "none";
          if (photoPreview) {
            photoPreview.style.backgroundImage = "none";
            photoPreview.style.display = "none";
          }
        }, false);

        <%-- Evento de clique do botão de confirmar a foto --%>
        chooseButton.addEventListener('click', function(e) {
          e.preventDefault();
          if (capturedPhoto) {
            sendPicture(capturedPhoto);
          }
        }, false);
      }

      <%-- Função de tirar foto --%>
      function takePicture() {
        if (!streaming) return;
        if (width && height) {
          <%-- Obter/criar um canvas --%>
          var canvas = document.getElementById('canvas');
          if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = "canvas";
            document.body.appendChild(canvas);
          }

          <%-- Desenhar a foto no canvas --%>
          var context = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;
          context.drawImage(video, 0, 0, width, height);

          <%-- Obter a saída do canvas em imagem --%>
          capturedPhoto = canvas.toDataURL('image/png');

          <%-- Antes de enviar a foto, perguntamos ao usuário se ele deseja
             escolher a foto que ele acabou de tirar ou se deseja tirar outra.
             Para isso, exibimos uma pequena animação de foto tirada e exibimos
             o div de visualização da foto pedindo a confirmação. --%>
          photoEffect.className = "";
          photoEffect.style.display = "block";
          photoPreview.style.display = "none";

          $("#photoEffect").fadeIn(500, function() {
            photoPreview.style.backgroundImage = "url('" + capturedPhoto + "')";
            photoPreview.style.display = "block";

            $("#photoEffect").fadeOut(500, function() {
              photoEffect.style.display = "none";
            });
          });
        }
      }

      <%-- Função de enviar a foto para o servidor --%>
      function sendPicture(data) {
        photoEffect.className = "loader";
        photoEffect.style.display = "block";

        $("#photoEffect").fadeIn(1000, function() {
          var guid = generateUUID();
          var formData = new FormData();
          formData.append('photo', data.replace('data:image/png;base64,', ''));
          formData.append('namefile', guid + ".png");

          var server = "WebcamCapture.do?sys=<%=request.getParameter("sys")%>&formID=<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>&comID=<%=request.getParameter("comID")%>";
          var xhr = new XMLHttpRequest();
          xhr.open("POST", server, true);
          xhr.onload = function(e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
              updateComponent(guid);
            }
          };

          xhr.onerror = function(e) { errorHandler(xhr.statusText); };
          xhr.send(formData);
        });
      }

      <%-- Função executada após o envio da foto --%>
      function updateComponent(hash) {
        var baseURL = '<%= Functions.stringToJs(getServletConfig().getServletContext().getRealPath("")) %>';
        if (baseURL.indexOf("\\") !== -1) {
          if (baseURL.endsWith("\\")) baseURL += "Upload\\";
          else baseURL += "\\Upload\\";
        } else if (baseURL.indexOf("/") !== -1) {
          if (baseURL.endsWith("/")) baseURL += "Upload/";
          else baseURL += "/Upload/";
        }

        window.opener.d.c_<%= request.getParameter("comID") %>.refresh(true, baseURL + hash + '.png', hash);
        window.close();
      }

      <%-- Função de gerar um identificador único --%>
      function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      <%-- Função de redimensionar a janela na proporção 4:3 --%>
      function resize4_3(w, h) {
        <%-- Manter proporção 4:3 se baseando no maior lado e redimensionando o menor --%>
        if (w / 4 > h / 3) h = Math.round(w / 4 * 3);
        else w = Math.round(h / 3 * 4);
        resizeTo(w, h);
      }

      resize4_3(600, 310); <%-- Redimensionar a janela --%>
      window.addEventListener('load', startup, false);
    </script>
  </head>
  <body class="overflow-hidden w-100 h-100" style="background-color: #000;">
    <form name="WFRUPLOAD" class="w-100 h-100" id="WFRUPLOAD" method="post" action="" enctype="multipart/form-data">
      <video id="video"></video>
      <button type="button" id="captureButton"></button>

      <div id="photoPreview">
        <div class="footer">
          <button id="chooseButton" type="button" class="btn btn-primary"><webrun:message key="LABEL.SEND"/></button>
          <button id="cancelButton" type="button" class="btn btn-danger"><webrun:message key="LABEL.TAKE_ANOTHER"/></button>
        </div>
      </div>

      <div id="photoEffect" class="loader">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only"><webrun:message key="LABEL.LOADING"/>...</span>
        </div>
      </div>

      <div id="error">
        <img class="no-camera" id="no-camera" src="assets/icons/pages/no-camera.svg" width="128" height="128">
        <div class="container" id="message-error">
          <div class="media">
            <img src="assets/icons/modal/error.svg" class="mr-3">
            <div class="media-body">
              <h5 class="mt-0"><webrun:message key="LABEL.ERROR"/>!</h5>
              <p id="errorContent"></p>
            </div>
          </div>
        </div>
      </div>
    </form>
  </body>
</html>