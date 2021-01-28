/**
 * Método construtor do HTMLSlider. Responsável por criar o componente Slider.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente. 
 **/
function HTMLSlider(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
}

/**
 * Herança do objeto.
 **/
HTMLSlider.inherits(HTMLLabeledComponent);

/**
 * Setando propriedades do componente.
 **/
HTMLSlider.prototype.name = 'HTMLSlider';
HTMLSlider.prototype.tabable = true;

/**
 * Responsável por desenhar o input do slider.
 * @param doc - documento onde o componente será inserido.
 * @param name - nome do input.
 * @param value - valor do input.
 **/
HTMLSlider.prototype.designInput = function(doc, name, value) {
  // Criar o elemento input do slider.
  this.input = document.createElement("input");
  this.input.type = "range";
  this.input.className = "custom-range"; // Bootstrap
  this.input.id = name ? name :  'WFRInput' + this.code;
  this.input.disabled = !this.enabled;
  this.input.readOnly = this.readonly;

  // Valor Início (valor mínimo do range)
  if (this.ValorInicio) {
    var min = parseFloat(this.ValorInicio);
    this.input.min = min;
    this.input.setAttribute("min", min);
  }

  // Valor Final (valor máximo do range)
  if (this.ValorFim) {
    var max = parseFloat(this.ValorFim);
    this.input.max = max;
    this.input.setAttribute("max", max);
  }

  // Casas Decimais
  if (this.Precisao) {
    var precisao = parseFloat(this.Precisao);
    if (precisao > 0) {
      this.input.step = precisao;
      this.input.setAttribute("step", precisao);
    }
  }

  // Valor Inicial do Marcador
  if (this.ValorInicialMarcador || this.ValorInicialMarcador == 0) {
    this.input.value = parseFloat(this.ValorInicialMarcador);
  } else if (value) {
    this.input.value = parseFloat(value);
  }

  this.context.appendChild(this.input);

  // Associar eventos do input
  this.attachEvent(this.input, 'change', this.changeAction); // Ocorre ao finalizar o movimento
  this.attachEvent(this.input, 'input', this.inputAction); // Ocorre durante o movimento

  // Span de numeração
  if (this.ExibirNumeracao == "1") {
    this.numberSpan = document.createElement("span");
    this.numberSpan.className = "ml-3 text-muted"; // Bootstrap
    this.numberSpan.innerHTML = this.input.value;
    this.context.appendChild(this.numberSpan);
  }
};

/**
 * Responsável por desenhar o HTML do componente slider. 
 * @param doc - documento onde o componente será inserido.
 **/
HTMLSlider.prototype.designComponent = function(doc) {
  // Testa se é relatório
  if (this.report) {
    this.designReport();
    return "";
  }

  // Definir classes de layout na div principal do componente.
  this.div.className += " d-flex align-items-center"; // Bootstrap
  this.divClass = this.div.className;

  // Desenhar o input do slider
  this.designInput(doc);
};

/**
 * Atualiza o span de numeração do slider.
 **/
HTMLSlider.prototype.updateSpan = function() {
  if (this.numberSpan) {
    this.numberSpan.innerHTML = this.input.value;
  }
};

/**
 * Ocorre durante a movimentação do slider.
 **/
HTMLSlider.prototype.inputAction = function(e, o) {
  this.updateSpan();
};

/**
 * Ocorre após a finalização da movimentação do slider.
 **/
HTMLSlider.prototype.changeAction = function(e, o) {
  this.updateSpan();

  // Verificar pelo evento "AoFinalizarMovimentacao".
  if (this.AoFinalizarMovimentacao) {
    return this.AoFinalizarMovimentacao.call(this, this.input.value);
  }
};

/**
 * Método utilizado para retornar o valor do slider;
 */
HTMLSlider.prototype.getValue = function() {
  return this.input.value;
};
