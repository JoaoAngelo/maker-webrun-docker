function fourdigits(number) {
  return (number < 1000) ? number + 1900 : number;
}

function HTMLEdit(sys, formID, code, posX, posY, width, height, description, value) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.type = 1;
  this.month = this.actualMonth + 1;
  this.realMonth = this.actualMonth;
  this.year = this.actualYear;
  this.tabable = true;
  this.maskSuport = true;
  this.report = false;
  this.dtpInitialized = false;
  this.mobile = isMobile();
}

HTMLEdit.inherits(HTMLLabeledComponent);
HTMLEdit.prototype.name = 'HTMLEdit';
HTMLEdit.prototype.tagName = 'edit';
HTMLEdit.prototype.now = new Date();
HTMLEdit.prototype.actualMonth = HTMLEdit.prototype.now.getMonth();
HTMLEdit.prototype.actualYear = fourdigits(HTMLEdit.prototype.now.getYear());
HTMLEdit.prototype.canCheckRegularExpression = true;

HTMLEdit.prototype.getValue = function() {
  var value = this.input.value;
  if (this.textMask) {
    if (this.textMask == "U>") {
      value = value.toUpperCase();
    } else if (this.textMask == "l>") {
      value = value.toLowerCase();
    }
  }

  return value;
};

HTMLEdit.prototype.setHeight = function(height) {
  this.callMethod(HTMLLabeledComponent, 'setHeight', [height]);
  if (this.input) this.input.style.height = this.div.style.height;
};

HTMLEdit.prototype.setType = function(type) {
  this.type = type;
  if (this.btdiv) {
    this.context.removeChild(this.btdiv);
    this.btdiv = null;
    this.img = null;
  }
};

HTMLEdit.prototype.setMonth = function(m) {
  this.month = m + 1;
  this.realMonth = m;
};

HTMLEdit.prototype.setYear = function(y) {
  this.year = y;
};

HTMLEdit.prototype.setFont = function(f) {
  this.font = f;
  if (this.input) this.input.style.fontFamily = f;
};

HTMLEdit.prototype.setSize = function(s) {
  if (s.toString().indexOf("pt") == -1) s += "pt";
  this.size = s;
  if (this.input) this.input.style.fontSize = s;
};

HTMLEdit.prototype.setWeight = function(w) {
  this.weight = w;

  if (this.input) {
    if (w) this.input.style.fontWeight = "bold";
    else this.input.style.fontWeight = "normal";
  }
};

HTMLEdit.prototype.setItalic = function(w) {
  this.italic = w;

  if (this.input) {
    if (w) this.input.style.fontStyle = "italic";
    else this.input.style.fontStyle = "normal";
  }
};

HTMLEdit.prototype.setTextDecoration = function() {
  var textDecoration = "";
  if (this.underline || this.strikeout) {
    if (this.underline) textDecoration += "underline";
    if (this.strikeout) textDecoration += " line-through";
  } else textDecoration = "none";
  if (this.input) this.input.style.textDecoration = textDecoration;
};

HTMLEdit.prototype.designInput = function(doc, name, value) {
  // Cria o elemento input
  this.input = document.createElement("input");
  this.input.className = "form-control"; // Bootstrap

  // Tipo do campo
  if (this.password) this.input.type = "password"; // Senha
  //else if (this.type == 2)  this.input.type = "date"; // Data
  else this.input.type = "text"; // Texto

  // Placeholder do campo
  if (this.placeholder) this.input.placeholder = this.placeholder;

  // Autocomplete (histÃ³rico de valores)
  this.input.autocomplete = (this.autocomplete) ? "on" : "off";

  // Nome do campo (importante para obter o valor no POST)
  if (!name) this.input.name = 'WFRInput' + this.code;
  else this.input.name = name;

  // Id do campo (importante para as labels de descriÃ§Ã£o)
  this.input.id = this.input.name;

  // Quantidade mÃ¡xima de caracteres do campo
  if (this.maxlength) this.input.maxLength = this.maxlength;

  // Propriedades de layout
  this.input.style.height = this.div.style.height;

  // Alinhamento do texto do campo
  if (this.align) this.input.style.textAlign = this.align;

  // Valor inicial do campo
  if (!value) this.input.value = this.value;
  else this.input.value = value;

  this.input.onclick = function (e) {
    e.stopPropagation();
  };

  if (this.datalist) {
    var datalist = document.createElement("datalist");
    datalist.className = "form-control"; // Bootstrap
    datalist.id = "dl" + this.id;

    var options = this.datalist.split("\n");
    for (var i = 0; i < options.length; i++) {
      var option = document.createElement("option");
      option.value = options[i];
      datalist.appendChild(option);
    }

    this.input.setAttribute("list", "dl" + this.id);
    this.div.appendChild(datalist);
  }

  // Obter o formato da data
  this.dateFormat =
    (this.typeNumber == 92) ?
      (mainform && mainform.TIME_PATTERN) ?
        mainform.TIME_PATTERN : TIME_PATTERN ? TIME_PATTERN : null :
    (this.typeNumber == 91) ?
      (mainform && mainform.DATE_PATTERN) ?
        mainform.DATE_PATTERN : DATE_PATTERN ? DATE_PATTERN : null :
    (mainform && mainform.DATE_TIME_PATTERN) ?
      mainform.DATE_TIME_PATTERN : DATE_TIME_PATTERN ? DATE_TIME_PATTERN : null;

  // Ajeitar formato para o DateTimePicker
  if (this.dateFormat && this.dateFormat.indexOf(" ") != -1) {
    var formatParts = this.dateFormat.split(" ");
    if (formatParts.length == 2 && formatParts[0].indexOf("/") != -1) {
      this.dateFormat = formatParts[0].toUpperCase() + " " + formatParts[1];
    } else if (formatParts.length == 2 && formatParts[1].indexOf("/") != -1) {
      this.dateFormat = formatParts[0] + " " + formatParts[1].toUpperCase();
    }
  } else if (this.dateFormat.indexOf("/") != -1) {
    this.dateFormat = this.dateFormat.toUpperCase();
  }
};

HTMLEdit.prototype.designReport = function () {
  var labelReport = new HTMLLabel(this.sys, this.formID, this.code, 0, 0, this.width, this.height, this.value);
  labelReport.id = "ReportLabel" + this.code;
  labelReport.design(this.context, false);
};

HTMLEdit.prototype.designComponent = function (doc) {
  if (this.beforeComponentDesign) {
    this.beforeComponentDesign(doc);
  }

  if (this.type == 2) { // Input de data (calendÃ¡rio)
    // Ã‰ necessÃ¡rio criar outro div para permitir a colocaÃ§Ã£o do botÃ£o
    this.context = this.getBaseDiv(false);
    this.context.className = "input-group"; // Bootstrap

    // Verificar se Ã© modo clÃ¡ssico (parÃ¢metro avanÃ§ado "CaixaDeTexto:Data:ModoClassico").
    if (this.classic) {
      // Verificar se o formulÃ¡rio Ã© responsivo.
      if (d && d.n && d.n.responsive) {
        this.context.className += " input-group-legacy-resp"; // Custom
      } else {
        this.context.className += " input-group-legacy"; // Custom
      }
    }

    this.context.style.height = this.div.style.height;
    this.divClass = this.context.className;
    if (!this.enabled || this.readonly)
      this.context.className += " disabled";
    this.div.appendChild(this.context);

    this.context.onclick = function (e) {
      e.stopPropagation();
    };
  }

  this.designInput(doc);
  this.context.appendChild(this.input);

  if (this.type == 2) { // Input de data (calendÃ¡rio)
    // Criar o botÃ£o de abrir calendÃ¡rio
    this.btdiv = document.createElement("div");
    this.btdiv.className = "input-group-append"; // Bootstrap
    this.btdiv.style.cursor = "pointer";
    this.btdiv.id = "calendarButton" + this.code;

    // Evento de clique do botÃ£o de calendÃ¡rio
    var openDateAction = this.getAction('openDate');
    this.attachEvent(this.btdiv, 'click', openDateAction);
    this.onF5press = openDateAction;

    // Criar o Ã­cone do botÃ£o de calendÃ¡rio
    this.img = document.createElement("i");
    this.img.className = "input-group-text d-flex align-items-center fas fa-calendar h-100"; // Font Awesome - Bootstrap
    this.img.style.pointerEvents = "none";
    this.btdiv.appendChild(this.img);

    // Alterar o layout do input para suportar o botÃ£o de calendÃ¡rio
    this.input.style.setProperty("border-top-left-radius", ".25rem"); // Bootstrap
    this.input.style.setProperty("border-bottom-left-radius", ".25rem"); // Bootstrap

    // Adicionar o botÃ£o de calendÃ¡rio ao elemento contexto
    if (this.enabled && !this.readonly) {
      this.context.appendChild(this.btdiv);
    }

    // Importar o moment.js
    webrun.include("assets/moment.min.js");

    // Preparar o locale do Moment
    var definedLocale = resources_locale.toLowerCase();
    if (definedLocale == 'en_us') this.locale = 'en';
    else if (definedLocale == 'pt_br') this.locale = 'pt-br';
    else if (definedLocale == 'es_es') this.locale = 'es';
    else if (definedLocale == 'fr_fr') this.locale = 'fr';
    else this.locale = 'en';

    moment.locale(this.locale);

    // Importar o CSS do Bootstrap DateTimePicker
    if (!document.getElementById("datetimepicker-css")) {
      var head = document.getElementsByTagName('head')[0];
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'assets/bootstrap-datetimepicker.min.css';
      link.id = 'datetimepicker-css';
      head.appendChild(link);
    }

    // Importar o script do Bootstrap DateTimePicker
    webrun.include("assets/bootstrap-datetimepicker.min.js");

    // Fechar o DateTimePicker ao redimensionar a janela
    var object = this;
    $(window).resize(function(e) {
      object.closeDate();
    });

    // Verificar se Ã© mobile.
    if (this.mobile) {
      // Associar evento de foco para manipulaÃ§Ã£o do DateTimePicker no celular.
      this.input.addEventListener("focusin", function() {
        if (window.dtpComponent && window.dtpComponent.dtpInitialized) {
          // Fechar o DateTimePicker quando o input receber foco.
          window.dtpComponent.closeDate();

          // Ã‰ necessÃ¡rio focar o input novamente.
          setTimeout(function() {
            object.input.focus();
          }, 100);
        }
      });

      document.addEventListener("click", function() {
        if (object) object.closeDate();
      });
    }
  }

  this.setEnabled(this.enabled);

  if (this.afterComponentDesign) {
    this.afterComponentDesign(doc);
  }
};

HTMLEdit.prototype.initDateTimePicker = function() {
  var object = this;

  // Obter o corpo do DateTimePicker
  this.dtpDoc = document.body;

  if (this.dtpInitialized) {
    $(this.input).datetimepicker("destroy");
  }

  // Definir o body como relativo para criar o DateTimePicker
  this.dtpDoc.style.position = "relative";

  // Inicializar o DateTimePicker
  $(this.input).datetimepicker({
    // Idioma do DateTimePicker
    locale: this.locale,

    // Formato da data
    format: this.dateFormat,

    // NÃ£o exibir o datetimepicker quando o input for somente leitura
    ignoreReadonly: false,

    // Exibir o botÃ£o para definir a data para o dia atual
    showTodayButton: true,

    // NÃ£o exibir o datetimepicker quando o input receber foco
    allowInputToggle: false,

    // NÃ£o utilizar a data atual
    useCurrent: false,

    // NÃ£o exibir ao focar no input
    focusOnShow: false,

    // Ajeitar Ã­cone de tempo
    icons: {
      time: "fas fa-clock" // Font Awesome
    },

    // Posicionar elemento na tab atual
    widgetParent: $(this.dtpDoc)
  });

  // Associar evento de ao exibir do DateTimePicker
  $(this.input).on("dp.show", function() {
    object.dateTimePickerPositioning();
    object.attachEvent(document, 'click', object.closeDate);
  });

  // Associar evento de ao fechar do DateTimePicker
  $(this.input).on("dp.hide", function() {
    if (object.dtpInitialized) {
      $(this).datetimepicker("destroy");
      object.dtpInitialized = false;

      try {
        if (!object.report && object.textMask && object.input && object.input.value && object.input.value.length > 0) {
          object.input.value = ebfMaskFormatter_(object.input.value, object.textMask);
        }
      } catch (e) { }
    }
  });

  // Associar evento de ao alterar do DateTimePicker
  $(this.input).on("dp.change", function() {
    try {
      // Verificar se nÃ£o for relatÃ³rio e se possui mÃ¡scara.
      if (!object.report && object.textMask && object.input && object.input.value && object.input.value.length > 0) {
        // Mascarar o valor do campo.
        object.input.value = ebfMaskFormatter_(object.input.value, object.textMask);
      }
    } catch (e) { }

    try {
      // Fechar o DateTimePicker
      object.closeDate();
    } catch (e) { }
  });

  this.dtpInitialized = true;
  window.dtpComponent = this;
};

HTMLEdit.prototype.setValidatedData = function(validated) {
  validated = !!validated;
  this.regularExpressionValidated = validated;
  var value = this.getValue();
  visibleDiv(this.validateDataDiv, (value != null && value.length > 0 && !validated));
};

HTMLEdit.prototype.setReadOnly = function(v) {
  this.callMethod(HTMLElementBase, 'setReadOnly', [v]);
  if (this.btdiv) visibleDiv(this.btdiv, !this.readonly);
  if (v) {
    if (containsNode(this.context, this.btdiv)) {
      this.context.removeChild(this.btdiv);
    }
  } else {
    if (this.type == 2 && !containsNode(this.context, this.btdiv)) {
      this.context.appendChild(this.btdiv);
    }
  }
};

HTMLEdit.prototype.keydownAction = function(e) {
  this.callMethod(HTMLElementBase, 'keydownAction', [e]);

  try {
    if (this.type == 2) { // Input de data (calendÃ¡rio)
      if (e.which == 40 || e.key == 'ArrowDown') {
        // Verificar se o input estÃ¡ vazio.
        if (this.input.value === undefined || this.input.value === null || this.input.value.length == 0) {
          // Definir a data atual.
          this.input.value = moment().format(this.dateFormat);
        } else {
          // Subtrair um dia da data especificada.
          var momentData = moment(this.input.value, this.dateFormat);
          if (momentData.isValid()) this.input.value = momentData.subtract(1, "days").format(this.dateFormat);
        }
      } else if (e.which == 38 || e.key == 'ArrowUp') {
        // Verificar se o input estÃ¡ vazio.
        if (this.input.value === undefined || this.input.value === null || this.input.value.length == 0) {
          // Definir a data atual.
          this.input.value = moment().format(this.dateFormat);
        } else {
          // Somar um dia da data especificada.
          var momentData = moment(this.input.value, this.dateFormat);
          if (momentData.isValid()) this.input.value = momentData.add(1, "days").format(this.dateFormat);
        }
      }
    }
  } catch (e) { }
};

HTMLEdit.prototype.setEnabled = function(v) {
  this.enabled = v;
  if (!this.enabled) {
    if (containsNode(this.context, this.btdiv)) {
      this.context.removeChild(this.btdiv);
    }
  } else {
    if (this.type == 2 && !containsNode(this.context, this.btdiv)) {
      this.context.appendChild(this.btdiv);
    }
  }

  this.input.disabled = !v;
};

HTMLEdit.prototype.setColor = function(color) {
  this.color = color;
  if (this.input) this.input.style.color = color;
};

HTMLEdit.prototype.setBGColor = function(color) {
  this.bgColor = color;
  if (this.input) this.input.style.backgroundColor = color;
};

HTMLEdit.prototype.openDate = function() {
  if (!this.readonly && this.enabled) {
    // Verificar se Ã© mobile.
    if (this.mobile) {
      // Remover o foco do input e depois esperar
      // pra exibir o DateTimePicker.
      this.input.blur();

      var object = this;
      setTimeout(function() {
        // Exibir o DateTimePicker.
        object.initDateTimePicker();

        // Quando for mobile nÃ£o devemos focar o input,
        // mas sim exibir o DateTimePicker diretamente.
        $(object.input).datetimepicker("show");
      }, 200);
    } else {
      // Exibir o DateTimePicker.
      this.initDateTimePicker();

      // Focar o input.
      this.input.focus();
    }
  }
};

HTMLEdit.prototype.closeDate = function() {
  // Esconder o DateTimePicker
  if (this.dtpInitialized) {
    $(this.input).datetimepicker("hide");
    if (window.dtpComponent == this) {
      window.dtpComponent = null;
    }
  }
};

HTMLEdit.prototype.beforeSubmit = function() {
  if (!this.enabled) this.input.disabled = false;
  if (this.textMask && this.input) {
    if (this.textMask == "U>") {
      this.input.value = this.input.value.toUpperCase();
    } else if (this.textMask == "l>") {
      this.input.value = this.input.value.toLowerCase();
    }
  }
};

HTMLEdit.prototype.afterSubmit = function() {
  if (!this.enabled) this.input.disabled = true;
};

HTMLEdit.prototype.dateTimePickerPositioning = function() {
  var dateTimePicker = document.getElementsByClassName("bootstrap-datetimepicker-widget");
  if (dateTimePicker.length > 0) {
    dateTimePicker = dateTimePicker[0];
    dateTimePicker.style.zIndex = 1000000009;
    var divPosX = findPosX(this.div);
    var divPosY = findPosY(this.div);
    var distanceFromTop = 0;
    dateTimePicker.style.left = divPosX + "px";
    if (dateTimePicker.offsetHeight > 0) {
      dateTimePicker.style.minHeight = dateTimePicker.offsetHeight + "px";
    }
    var distanceFromBottom = this.dtpDoc.offsetHeight - ((divPosY - distanceFromTop) + this.div.offsetHeight);
    if (dateTimePicker.classList.contains("top")) {
      dateTimePicker.style.top = (divPosY - dateTimePicker.offsetHeight - distanceFromTop - 10) + "px";
    } else if (dateTimePicker.offsetHeight > distanceFromBottom && !dateTimePicker.classList.contains("top")) {
      dateTimePicker.style.top = 1 + "px";  
     }else {
      dateTimePicker.style.top = (divPosY + this.div.offsetHeight - distanceFromTop) + "px";
    }

    var xLimitScreen = (this.dtpDoc.offsetWidth - divPosX);
    if (dateTimePicker.offsetWidth > xLimitScreen) {
      dateTimePicker.classList.add("pull-right");
      var dateMargin = dateTimePicker.offsetWidth + 50 - xLimitScreen;
      dateTimePicker.style.left = (divPosX - dateMargin) + 'px';
    }
  }
};

