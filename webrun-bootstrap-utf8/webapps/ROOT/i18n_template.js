var resources = new Array();
//<%CONTENT%>
function getMessage(key) {
  return (key == null || key == "") ? "Undefined Resource Key" : resources[key];
}

function getLocaleMessage(key) {
  var message = getMessage(key);

  if (message == null || typeof message == "undefined") {
  	message = "[" + resources_locale + "][" + key + "]";
  } else if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      var param = arguments[i];
      if (param != null && typeof param != "undefined") {
        var regexp = new RegExp("\\{" + (i-1) + "\\}", "g");
        message = message.replace(regexp, param);
      }
    }
  }

  return message;
}