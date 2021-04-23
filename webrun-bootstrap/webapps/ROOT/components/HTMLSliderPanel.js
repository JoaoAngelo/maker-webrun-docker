/**
 * Método construtor do HTMLSliderPanel. Responsável por criar o componente Slider Panel.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente. 
 **/
function HTMLSliderPanel(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
}

/**
 * Herança do objeto.
 **/
HTMLSliderPanel.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLSliderPanel.prototype.name = 'HTMLSliderPanel';
HTMLSliderPanel.prototype.tabable = true;

/**
 * Responsável por desenhar o HTML do componente slider panel. 
 * @param doc - documento onde o componente será inserido.
 **/
HTMLSliderPanel.prototype.designComponent = function(doc) {
  this.updateProperties();

  // Definir propriedades do div.
  this.div.className += " d-flex carousel slide"; // Bootstrap
  this.divClass = this.div.className;
  this.div.setAttribute("data-ride", "carousel"); // Bootstrap
  this.div.id = this.id ? this.id : "carousel" + this.code;

  // Definir eventos.
  this.attachEvent(this.div, 'click', this.clickAction);

  // Obter os dados do componente.
  if (this.TabelaImagem && this.TabelaImagem.length && this.TabelaImagem.length > 0) {
    this.carouselData = this.parseData(this.TabelaImagem);
  } else this.carouselData = null;

  // Verificar se a propriedade de cor do indicador ativo foi definida.
  if (this.CorRodapeAtivo && this.CorRodapeAtivo.length && this.CorRodapeAtivo.length > 0) {
    // Verificar palavras-chave do Bootstrap.
    var lowerCaseColor = this.CorRodapeAtivo.trim().toLowerCase();
    if (lowerCaseColor == 'primary') this.CorRodapeAtivo = "var(--primary)";
    else if (lowerCaseColor == 'secondary') this.CorRodapeAtivo = "var(--secondary)";

    // Definir estilo personalizado para o indicador ativo.
    this.carouselStyle = document.createElement("style");
    this.carouselStyle.innerHTML = ".carousel-indicators li.active { background-color: " + this.CorRodapeAtivo + "; }";
    this.div.appendChild(this.carouselStyle);
  }

  if (this.carouselData != null && this.carouselData.size > 0) {
    // Criar os indicadores do Carousel.
    this.carouselIndicators = document.createElement("ol");
    this.carouselIndicators.className = "carousel-indicators"; // Bootstrap
    this.div.appendChild(this.carouselIndicators);

    for (var i = 0; i < this.carouselData.size; i++) {
      var slideIndicator = document.createElement("li");
      slideIndicator.setAttribute("data-target", "#" + this.div.id); // Bootstrap
      slideIndicator.setAttribute("data-slide-to", i.toString()); // Bootstrap
      if (i == 0) slideIndicator.className = "active"; // Bootstrap
      this.carouselIndicators.appendChild(slideIndicator);
    }

    // Criar o conteúdo do Carousel.
    this.carouselInner = document.createElement("div");
    this.carouselInner.className = "carousel-inner"; // Bootstrap
    this.div.appendChild(this.carouselInner);

    // Criar os slides do Carousel.
    for (var i = 0; i < this.carouselData.size; i++) {
      var item = this.carouselData.get((i + 1).toString());
      var slideDiv = document.createElement("div");
      slideDiv.className = (i == 0) ? "carousel-item active" : "carousel-item"; // Bootstrap
      this.carouselInner.appendChild(slideDiv);

      // Criar o elemento img do slide
      var slideImg = document.createElement("img");
      slideImg.src = item.get("path");
      slideImg.className = "d-block w-100"; // Bootstrap
      slideImg.alt = item.get("description");
      slideImg.height = this.height;
      slideDiv.appendChild(slideImg);

      // Criar div para adicionar os textos do slide.
      var slideCaption = document.createElement("div");
      slideCaption.className = "carousel-caption d-none d-md-block"; // Bootstrap
      slideDiv.appendChild(slideCaption);

      // NOTA: Não implementado no Maker ainda, mas poderá ser implementado.
      if (item.has("title") && item.get("title").length > 0) {
        // Criar o elemento do título do slide.
        var slideTitle = document.createElement("h5");
        slideTitle.innerHTML = item.get("title");
        slideCaption.appendChild(slideTitle);
      }

      // Se o link for definido, devemos criar um A, e se não for, um P.
      var slideDescription;
      if (item.has("link") && item.get("link").length > 0) {
        // Criar link do slide.
        slideDescription = document.createElement("a");
        slideDescription.href = item.get("link");
        slideDescription.innerHTML = item.get("description");
      } else {
        // Criar parágrafo do slide.
        slideDescription = document.createElement("p");
        slideDescription.innerHTML = item.get("description");
      }

      slideCaption.appendChild(slideDescription);

      // Verificar se a propriedade de cor do texto foi definida.
      if (this.CorFonteTexto && this.CorFonteTexto.length && this.CorFonteTexto.length > 0) {
        slideDescription.style.color = this.CorFonteTexto;
      }

      // Verificar se a propriedade de tamanho da fonte foi definida.
      if (this.TamanhoFonte && this.TamanhoFonte.length && this.TamanhoFonte.length > 0) {
        // Como o campo não possui tipo definido, o desenvolvedor tem a possibilidade de especificar
        // a unidade do tamanho da fonte se ele quiser.
        slideDescription.style.fontSize =
          (this.TamanhoFonte.indexOf("px") != -1 ||
           this.TamanhoFonte.indexOf("pt") != -1 ||
           this.TamanhoFonte.indexOf("em") != -1 ||
           this.TamanhoFonte.indexOf("rem") != -1) ?
             this.TamanhoFonte : this.TamanhoFonte + "px";
      }
    }

    // Criar botão de slide anterior
    this.carouselPrev = document.createElement("a");
    this.carouselPrev.className = "carousel-control-prev"; // Bootstrap
    this.carouselPrev.href = "#" + this.div.id;
    this.carouselPrev.setAttribute("role", "button");
    this.carouselPrev.setAttribute("data-slide", "prev"); // Bootstrap
    this.div.appendChild(this.carouselPrev)

    this.carouselPrevIcon = document.createElement("span");
    this.carouselPrevIcon.className = "carousel-control-prev-icon"; // Bootstrap
    this.carouselPrevIcon.setAttribute("aria-hidden", "true");
    this.carouselPrev.appendChild(this.carouselPrevIcon);

    this.carouselPrevText = document.createElement("span");
    this.carouselPrevText.className = "sr-only"; // Bootstrap
    this.carouselPrevText.innerHTML = getMessage("LABEL.PREVIOUS_PAGE");
    this.carouselPrev.appendChild(this.carouselPrevText);

    // Criar botão de próximo slide
    this.carouselNext = document.createElement("a");
    this.carouselNext.className = "carousel-control-next"; // Bootstrap
    this.carouselNext.href = "#" + this.div.id;
    this.carouselNext.setAttribute("role", "button");
    this.carouselNext.setAttribute("data-slide", "next"); // Bootstrap
    this.div.appendChild(this.carouselNext)

    this.carouselNextIcon = document.createElement("span");
    this.carouselNextIcon.className = "carousel-control-next-icon"; // Bootstrap
    this.carouselNextIcon.setAttribute("aria-hidden", "true");
    this.carouselNext.appendChild(this.carouselNextIcon);

    this.carouselNextText = document.createElement("span");
    this.carouselNextText.className = "sr-only"; // Bootstrap
    this.carouselNextText.innerHTML = getMessage("LABEL.NEXT_PAGE");
    this.carouselNext.appendChild(this.carouselNextText);
  }
};

/**
 * Interpreta os dados do slider panel.
 **/
HTMLSliderPanel.prototype.parseData = function(data) {
  if (typeof data === 'string') {
    data = data.replace(/\+/g, ' ').replace(/(\r\n|\n|\r)/gm, ''); // Ajeitar espaços e remover quebras de linha
    data = ebfURLDecoder(data); // Decodificar texto URL
    data = ebfConvertJSONToVariant(data); // Obter mapa
    if (data.has("sliderpanel")) return data.get("sliderpanel");
  }

  return null;
};

/* Atualiza as propriedades do componente de as propriedades do XML */
HTMLSliderPanel.prototype.updateProperties = function() {
  this.enabled = parseBoolean(this.Habilitado);
  this.visible = parseBoolean(this.Visivel);
};
