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
    <link rel="stylesheet" type="text/css" href="assets/pages/camera.css">
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

      function streamHandler(stream) {
        streamObject = stream;
        if (video.hasOwnProperty("srcObject") || 'srcObject' in video) {
          video.srcObject = stream;
          video.play();
        } else if (video.hasOwnProperty("mozSrcObject") || 'mozSrcObject' in video) {
          video.mozSrcObject = stream;
          video.play();
        } else {
          if (window.URL) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
          } else if (window.webkitURL) {
            video.src = window.webkitURL.createObjectURL(stream);
            video.play();
          }
        }
      }

      function showError(origin, title, message, details) {
        var errorContainer = document.getElementById("error");
        var messageError = document.getElementById("message-error");
        var noCamera = document.getElementById("no-camera");

        var errorTitle = document.getElementById("errorTitle");
        var errorContent = document.getElementById("errorContent");
        var errorDetails = document.getElementById("errorDetails");

        if (origin == 1) {
          if (messageError) messageError.style.setProperty("display", "none", "important");
          if (noCamera) noCamera.style.setProperty("display", "block", "important");
          if (errorContainer) errorContainer.style.setProperty("display", "block", "important");
        } else {
          if (messageError) messageError.style.setProperty("display", "block", "important");
          if (noCamera) noCamera.style.setProperty("display", "none", "important");

          if (errorTitle) errorTitle.innerText = (title && title.length > 0) ? title : "<webrun:message key="LABEL.ERROR" js="true"/>!";
          if (errorContent) errorContent.innerText = (message && message.length > 0) ? message : "<webrun:message key="ERROR.SERVER_INTERNAL_ERROR" js="true"/>!";
          if (errorContainer) errorContainer.style.setProperty("display", "block", "important");
          if (errorDetails) {
            if (details && details.length > 0) {
              errorDetails.value = details;
              errorDetails.style.setProperty("display", "block", "important");
            } else {
              errorDetails.value = "";
              errorDetails.style.setProperty("display", "none", "important");
            }
          }
        }

        stopStreaming();

        if (photoPreview) {
          if (photoPreview.remove) photoPreview.remove();
          else photoPreview.parentNode.removeChild(photoPreview);
          photoPreview = null;
          chooseButton = null;
          cancelButton = null;
        }

        if (photoEffect) {
          if (photoEffect.remove) photoEffect.remove();
          else photoEffect.parentNode.removeChild(photoEffect);
          photoEffect = null;
        }
      }

      function stopStreaming() {
        if (streamObject) {
          if (streamObject.stop) {
            streamObject.stop();
          } else {
            streamObject.getTracks().forEach(function(track) {
              track.stop();
            });
          }

          streamObject = null;
        }

        streaming = false;

        if (video) {
          if (video.remove) video.remove();
          else video.parentNode.removeChild(video);
          video = null;
        }

        if (captureButton) {
          if (captureButton.remove) captureButton.remove();
          else captureButton.parentNode.removeChild(captureButton);
          captureButton = null;
        }
      }

      function startup() {
        video = document.getElementById('video');
        captureButton = document.getElementById('captureButton');

        photoEffect = document.getElementById("photoEffect");
        photoPreview = document.getElementById("photoPreview");

        chooseButton = document.getElementById("chooseButton");
        cancelButton = document.getElementById("cancelButton");

        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
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
              }, streamHandler, function(error) {
                showError((error && (error.name == "NotFoundError" || error.name == "NotAllowedError")) ? 1 : 0, null,
                  (error && error.message) ? error.message : "<webrun:message key="ERROR.CAPTURE_DEVICE_INIT_FAILED" js="true"/>");
              });
            } else {
              showError(1, null, "<webrun:message key="ERROR.CAPTURE_DEVICE_INIT_FAILED" js="true"/>");
            }
          } else {
            navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            }).then(streamHandler).catch(function(error) {
              showError((error && (error.name == "NotFoundError" || error.name == "NotAllowedError")) ? 1 : 0, null,
                (error && error.message) ? error.message : "<webrun:message key="ERROR.CAPTURE_DEVICE_INIT_FAILED" js="true"/>");
            });
          }
        } catch(e) { showError(1, null, e.toString()); }

        video.addEventListener("canplay", function(e) {
          if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);
            if (isNaN(height)) height = width / (4 / 3);
            if (captureButton) captureButton.style.setProperty("display", "block", "important");
            if (photoEffect) {
              photoEffect.className = "";
              photoEffect.style.setProperty("display", "none", "important");
            }

            streaming = true;
          }
        }, false);

        captureButton.addEventListener("click", function(e) {
          e.preventDefault();
          takePicture();
        }, false);

        cancelButton.addEventListener("click", function(e) {
          e.preventDefault();
          capturedPhoto = null;
          if (photoEffect) photoEffect.style.setProperty("display", "none", "important");
          if (photoPreview) {
            photoPreview.style.backgroundImage = "none";
            photoPreview.style.setProperty("display", "none", "important");
          }
        }, false);

        chooseButton.addEventListener("click", function(e) {
          e.preventDefault();
          if (capturedPhoto) {
            sendPicture(capturedPhoto);
          }
        }, false);
      }

      function takePicture() {
        if (!streaming) return;
        if (width && height) {
          var canvas = document.getElementById("canvas");
          if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "canvas";
            document.body.appendChild(canvas);
          }

          var context = canvas.getContext("2d");
          canvas.width = width;
          canvas.height = height;
          context.drawImage(video, 0, 0, width, height);

          capturedPhoto = canvas.toDataURL("image/png");

          photoEffect.className = "";
          photoEffect.style.setProperty("display", "block", "important");
          photoPreview.style.setProperty("display", "none", "important");

          $("#photoEffect").fadeIn(500, function() {
            photoPreview.style.backgroundImage = "url('" + capturedPhoto + "')";
            photoPreview.style.setProperty("display", "block", "important");

            $("#photoEffect").fadeOut(500, function() {
              photoEffect.style.setProperty("display", "none", "important");
            });
          });
        }
      }

      function sendPicture(data) {
        photoEffect.className = "loader";
        photoEffect.style.setProperty("display", "block", "important");

        $("#photoEffect").fadeIn(1000, function() {
          var formData = new FormData();
          formData.append("photo", data.replace("data:image/png;base64,", ""));

          var xhr = new XMLHttpRequest();
          xhr.open("POST", "FileUpload.do?sys=<%=request.getParameter("sys")%>&formID=<%=Functions.fromISOtoBASE(request.getParameter("formID"))%>&comID=<%=request.getParameter("comID")%>&type=webcam", true);

          xhr.addEventListener("load", function(e) {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status <= 299) {
                if (xhr.responseText && xhr.responseText.indexOf("closeWindow();") !== -1) {
                  setTimeout(function() {
                    eval(xhr.responseText);
                  }, 1500);
                } else {
                  showError(0, null, null, xhr.responseText);
                }
              } else if (xhr.status === 400) {
                try {
                  let res = JSON.parse(xhr.responseText);
                  showError(0, null, res.title, (res.stack ? res.stack : null));
                } catch (e) { console.error(e); }
              }
            }
          });

          xhr.addEventListener("error", function(e) {
            showError(0, null, xhr.statusText);
          });

          xhr.send(formData);
        });
      }

      function resize4_3(w, h) {
        if (w / 4 > h / 3) h = Math.round(w / 4 * 3);
        else w = Math.round(h / 3 * 4);
        resizeTo(w, h);
      }

      function closeWindow() {
        if (window.frameElement && window.frameElement.close) {
          window.frameElement.close();
        } else if (window.close) {
          window.close();
        }
      }

      resize4_3(600, 310);
      window.addEventListener("load", startup, false);
    </script>
  </head>
  <body class="overflow-hidden vw-100 vh-100" style="background-color: #000;">
    <form name="WFRUPLOAD" class="vw-100 vh-100" id="WFRUPLOAD" method="post" action="" enctype="multipart/form-data">
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

      <div id="error" class="d-flex align-items-center justify-content-center p-3 p-sm-4 p-md-5" style="display: none !important;">
        <img class="no-camera" id="no-camera" src="assets/icons/pages/no-camera.svg" width="128" height="128">
        <div class="container" id="message-error">
          <div class="media">
            <i class="fas fa-times mr-4 text-danger" style="font-size: 3rem;"></i>
            <div class="media-body">
              <h5 id="errorTitle" class="font-weight-bold my-0"></h5>
              <p id="errorContent" class="mb-0 text-muted"></p>
              <textarea id="errorDetails" class="form-control mt-3 mb-0" readonly></textarea>
            </div>
          </div>
        </div>
      </div>
    </form>
  </body>
</html>