/**
 * Método construtor do HTMLTimer. Responsável por criar o componente Timer.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente.
 **/
function HTMLTimer(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);

  // Flags que indicam o estado do temporizador
  this.STOPPED = 1;
  this.STARTED = 2;
  this.PAUSED = 3;

  this.status = this.STOPPED;
  this.time = 0;
}

/**
 * Herança do objeto.
 **/
HTMLTimer.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLTimer.prototype.name = 'HTMLTimer';
HTMLTimer.prototype.tabable = true;

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para habilitar/desabilitar o componente.
 */
HTMLTimer.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  this.updateLayout();
};

/**
 * Responsável por desenhar o HTML do componente Timer.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLTimer.prototype.designComponent = function(doc) {
  this.div.className += " fixed-height"; // Custom
  this.divClass = this.div.className;

  // Verificar o tipo do timer.
  if (this.tipoTimer && this.tipoTimer.length) {
    switch (this.tipoTimer.toLowerCase()) {
      case "p": // Progressivo
        this.tipoTimer = 0;
        break;
      case "r": // Regressivo
        this.tipoTimer = 1;
        break;
      default:
        this.tipoTimer = 0;
        break;
    }
  } else this.tipoTimer = 0;

  // Verificar continuidade do timer.
  if (this.continuo && this.continuo.length) {
    this.continuo = (this.continuo.toLowerCase() === "true");
  } else this.continuo = false;

  // Verificar propriedade de auto reset.
  if (this.voltarValor && this.voltarValor.length) {
    this.voltarValor = (this.voltarValor.toLowerCase() === "true");
  } else this.voltarValor = false;

  // Verificar se o formato foi definido.
  if (this.formatoTimer && this.formatoTimer.length > 0) {
    this.timeFormat = this.formatoTimer;
  } else if (mainform && mainform.TIME_PATTERN) {
    // Obter o formato da horário do formulário.
    this.timeFormat = mainform.TIME_PATTERN;
  } else this.timeFormat = "HH:mm:ss";

  // Importar o moment.js
  webrun.include("assets/moment.min.js");

  // Preparar o locale do Moment
  var definedLocale = resources_locale.toLowerCase();
  if (definedLocale == 'en_us') this.locale = 'en';
  else if (definedLocale == 'pt_br') this.locale = 'pt-br';
  else if (definedLocale == 'es_es') this.locale = 'es';
  else if (definedLocale == 'fr_fr') this.locale = 'fr';
  else this.locale = 'en';

  // Definir o locale do Moment
  moment.locale(this.locale);

  // Criar div da card.
  this.cardDiv = document.createElement("div");
  this.cardDiv.className = "card bg-light overflow-auto w-100 h-100"; // Bootstrap
  this.div.appendChild(this.cardDiv);

  // Criar label do tempo.
  this.label = document.createElement("div");
  this.label.className = "w-100 h-100 font-weight-bold d-flex align-items-center justify-content-center"; // Bootstrap
  this.label.style.fontSize = "2rem";
  this.cardDiv.appendChild(this.label);

  // Verificar se os botões do timer devem ser criados.
  var createStartButton = (this.mostrarIniciar && this.mostrarIniciar.length && this.mostrarIniciar.toLowerCase() == "true");
  var createPauseButton = (this.mostrarPausar && this.mostrarPausar.length && this.mostrarPausar.toLowerCase() == "true");
  var createStopButton = (this.mostrarParar && this.mostrarParar.length && this.mostrarParar.toLowerCase() == "true");
  var createResetButton = (this.mostrarReiniciar && this.mostrarReiniciar.length && this.mostrarReiniciar.toLowerCase() === "true");

  // Verificar se algum botão do timer é exibido.
  if (createStartButton || createPauseButton || createStopButton || createResetButton) {
    // Criar grupo dos botões do timer.
    this.buttonGroup = document.createElement("div");
    this.buttonGroup.className = "btn-group"; // Bootstrap
    this.buttonGroup.style.flex = "0 0 auto"; // Correção para o Safari
    this.buttonGroup.setAttribute("role", "group");
    this.cardDiv.appendChild(this.buttonGroup);

    // Definir classe dos botões.
    this.buttonClass = "btn btn-light"; // Bootstrap
  }

  if (createStartButton) {
    // Criar botão de iniciar timer.
    this.startButton = document.createElement("button");
    this.startButton.type = "button";
    this.startButton.className = this.buttonClass;
    this.buttonGroup.appendChild(this.startButton);

    // Criar ícone do botão de iniciar timer.
    var startButtonIcon = document.createElement("i");
    startButtonIcon.className = "fas fa-play"; // Font Awesome
    this.startButton.appendChild(startButtonIcon);

    // Associar evento ao botão.
    this.attachEvent(this.startButton, "click", this.start);
  }

  if (createPauseButton) {
    // Criar botão de pausar timer.
    this.pauseButton = document.createElement("button");
    this.pauseButton.type = "button";
    this.pauseButton.className = this.buttonClass;
    this.buttonGroup.appendChild(this.pauseButton);

    // Criar ícone do botão de pausar timer.
    var pauseButtonIcon = document.createElement("i");
    pauseButtonIcon.className = "fas fa-pause"; // Font Awesome
    this.pauseButton.appendChild(pauseButtonIcon);

    // Associar evento ao botão.
    this.attachEvent(this.pauseButton, "click", this.pause);
  }

  if (createStopButton) {
    // Criar botão de parar timer.
    this.stopButton = document.createElement("button");
    this.stopButton.type = "button";
    this.stopButton.className = this.buttonClass;
    this.buttonGroup.appendChild(this.stopButton);

    // Criar ícone do botão de parar timer.
    var stopButtonIcon = document.createElement("i");
    stopButtonIcon.className = "fas fa-stop"; // Font Awesome
    this.stopButton.appendChild(stopButtonIcon);

    // Associar evento ao botão.
    this.attachEvent(this.stopButton, "click", this.stop);
  }

  if (createResetButton) {
    // Criar botão de parar timer.
    this.resetButton = document.createElement("button");
    this.resetButton.type = "button";
    this.resetButton.className = this.buttonClass;
    this.buttonGroup.appendChild(this.resetButton);

    // Criar ícone do botão de parar timer.
    var resetButtonIcon = document.createElement("i");
    resetButtonIcon.className = "fas fa-redo"; // Font Awesome
    this.resetButton.appendChild(resetButtonIcon);

    // Associar evento ao botão.
    this.attachEvent(this.resetButton, "click", this.reset);
  }

  // Verificar se o timer deve iniciar automaticamente.
  if (this.autoIniciar && this.autoIniciar.length && this.autoIniciar.toLowerCase() === "true") {
    this.start(); // Iniciar timer
  } else {
    // Definir tempo inicial do timer.
    this.setStartTime();

    // Definir o valor inicial.
    this.setValue(this.getTimerString());

    // Atualizar layout.
    this.updateLayout();
  }
};

HTMLTimer.prototype.setWeight = function(w) {
  this.weight = w;
  if (this.label) {
    if (w) {
      if (this.label.classList.contains("font-weight-normal")) // Bootstrap
        this.label.classList.remove("font-weight-normal"); // Bootstrap
      if (!this.label.classList.contains("font-weight-bold")) // Bootstrap
        this.label.classList.add("font-weight-bold"); // Bootstrap
    } else {
      if (this.label.classList.contains("font-weight-bold")) // Bootstrap
        this.label.classList.remove("font-weight-bold"); // Bootstrap
      if (!this.label.classList.contains("font-weight-normal")) // Bootstrap
        this.label.classList.add("font-weight-normal"); // Bootstrap
    }
  }
};

/**
 * Obtém o valor número do tempo do timer.
 **/
HTMLTimer.prototype.getTimerNumeric = function() {
  return (this.tipoTimer == 1) ?
    this.startTime.diff(moment()) : // Regressivo
    moment().diff(this.startTime); // Progressivo
};

/**
 * Obtém uma instância do momentjs com o tempo do timer.
 **/
HTMLTimer.prototype.getTimerMoment = function() {
  return (this.tipoTimer == 1) ?
    moment.utc(this.overridenStartTime ? this.overridenStartTime : this.startTime.diff(moment())) : // Regressivo
    moment.parseZone(this.overridenStartTime ? this.overridenStartTime : moment().diff(this.startTime)); // Progressivo
};

/**
 * Obtém o texto formatado do timer (ex "00:00:10" = 10 segundos).
 **/
HTMLTimer.prototype.getTimerString = function() {
  return this.getTimerMoment().format(this.timeFormat);
};

/**
 * Define o tempo inicial do componente.
 **/
HTMLTimer.prototype.setStartTime = function() {
  var startOffset = (this.status == this.PAUSED) ? this.pausedTime : this.valorInicial;

  // Definir a data inicial do timer.
  if (startOffset && startOffset.length) {
    try {
      if (this.tipoTimer == 1) { // Regressivo
        // Tentar interpretar o valor inicial definido e adicionar da data atual.
        this.startTime = moment().add(moment.duration(startOffset));
      } else { // Progressivo
        // Tentar interpretar o valor inicial definido e subtrair da data atual.
        this.startTime = moment.parseZone(moment().diff(moment(startOffset, this.timeFormat)));
      }
    } catch (e) {
      // Falha ao interpretar, usar a data atual.
      this.startTime = moment();
    }
  } else {
    // Valor inicial não definido, usar a data atual.
    this.startTime = moment();
  }
};

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 */
HTMLTimer.prototype.setValue = function(value, checkDependences) {
  this.callMethod(HTMLElementBase, "setValue", [value, checkDependences]);

  // Atualizar valor da label.
  if (this.label) this.label.innerText = value;

  // Verificar se possui uma caixa de texto pai.
  if (this.parent && this.parent.setValue) {
    this.parent.setValue(value);
  }
};

/**
 * Inicia o contador do timer.
 **/
HTMLTimer.prototype.start = function() {
  if (this.isStarted()) return;
  this.setStartTime();
  this.overridenStartTime = null;
  this.status = this.STARTED;
  this.updateLayout();

  var object = this;
  this.updateTimer = setInterval(function() {
    // Verificar se é regressivo e se não é contínuo.
    if (object.tipoTimer == 1 && !object.continuo && object.getTimerNumeric() <= 0) {
      if (object.voltarValor) {
        // Reiniciar timer.
        object.status = object.STOPPED; // Truque para reiniciar
        object.start();
      } else {
        // Se não for regressivo e não é contínuo ele deve parar o timer quando chegar em 0.
        object.overridenStartTime = 100;
        object.stop();
      }
    }

    // Obter o novo valor do timer.
    var newValue = object.getTimerString();

    // Verificar se o valor foi alterado.
    if (object.getValue() != newValue) {
      object.setValue(newValue);
    }
  }, 100);

  // Chamar evento "Ao Iniciar".
  if (this.AoIniciar) this.AoIniciar.call(this);
};

/**
 * Obtém um valor lógico indicando se o timer está parado.
 **/
HTMLTimer.prototype.isStopped = function() {
  return (this.status == this.STOPPED);
};

/**
 * Obtém um valor lógico indicando se o timer está pausado.
 **/
HTMLTimer.prototype.isPaused = function() {
  return (this.status == this.PAUSED);
};

/**
 * Obtém um valor lógico indicando se o timer está rodando.
 **/
HTMLTimer.prototype.isStarted = function() {
  return (this.status == this.STARTED);
};

/**
 * Inicia o contador do timer.
 **/
HTMLTimer.prototype.pause = function() {
  if (this.isPaused()) {
    this.start();
  } else {
    this.status = this.PAUSED;
    this.updateLayout();
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    this.pausedTime = this.getTimerString();

    // Chamar evento "Ao Pausar".
    if (this.AoPausar) this.AoPausar.call(this);
  }
};

/**
 * Inicia o contador do timer.
 **/
HTMLTimer.prototype.stop = function() {
  if (this.isStopped()) return;
  this.status = this.STOPPED;
  this.updateLayout();
  if (this.updateTimer) {
    clearInterval(this.updateTimer);
    this.updateTimer = null;
  }

  // Chamar evento "Ao Parar".
  if (this.AoParar) this.AoParar.call(this);
};

/**
 * Reseta o contador do timer.
 **/
HTMLTimer.prototype.reset = function() {
  this.status = this.STOPPED;
  this.updateLayout();
  if (this.updateTimer) {
    clearInterval(this.updateTimer);
    this.updateTimer = null;
  }

  this.setValue(this.valorInicial);
};

/**
 * Atualiza o layout do timer.
 **/
HTMLTimer.prototype.updateLayout = function() {
  if (this.startButton) this.startButton.disabled = !this.enabled || (this.status == this.STARTED);
  if (this.pauseButton) this.pauseButton.disabled = !this.enabled || (this.status == this.PAUSED || this.status == this.STOPPED);
  if (this.stopButton) this.stopButton.disabled = !this.enabled || (this.status == this.STOPPED || this.status == this.PAUSED);
  if (this.resetButton) this.resetButton.disabled = !this.enabled || (this.status == this.STARTED);
};
