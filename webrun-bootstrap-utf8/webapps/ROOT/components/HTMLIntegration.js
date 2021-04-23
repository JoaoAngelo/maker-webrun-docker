/**
 * Método construtor do HTMLIntegration. Responsável por criar o componente Integração.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente.
 **/
function HTMLIntegration(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.skipCache = false;
}

/**
 * Herança do objeto.
 **/
HTMLIntegration.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLIntegration.prototype.name = 'HTMLIntegration';
HTMLIntegration.prototype.tabable = false;

/**
 * Responsável por desenhar o HTML do componente Integração.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLIntegration.prototype.designComponent = function(doc) {
  // Verificar posicionamento do componente.
  if (this.Posicionamento) {
    switch (this.Posicionamento) {
      case "A": { // Absoluto
        // Se o posicionamento for absoluto e o alinhamento não for nenhum
        // ou se o formulário não é responsivo, definir explicitamente a posição absoluta.
        if (!d.n.responsive || this.AlinhamentoH && this.AlinhamentoH !== "N" ||
          this.AlinhamentoV && this.AlinhamentoV !== "N") {
          this.divClass = "position-absolute"; // Bootstrap
          this.div.className = this.divClass;
        }

        break;
      }

      case "R": { // Relativo
        this.divClass = "position-relative"; // Bootstrap
        this.div.className = this.divClass;
        this.div.style.left = null;
        this.div.style.top = null;
        break;
      }

      case "C": { // Área
        this.divClass = "position-relative w-100 h-100 mb-0"; // Bootstrap
        this.div.className = this.divClass;
        this.div.style.left = null;
        this.div.style.top = null;
        this.fullscreen = true;
        break;
      }
    }
  }

  // Verificar se o conteúdo do componente deve ser aberto como página.
  if (this.Iframe && this.Iframe.length && this.Iframe.length > 0 && this.Iframe.toLowerCase() === "true") {
    this.pageFrame = document.createElement("iframe");
    this.pageFrame.className = "border-0 w-100 h-100"; // Bootstrap
    this.pageFrame.src = "tmp/" + this.sys + "/" + this.formID + "/" + this.code + ".html" +
      (this.skipCache ? "?hash=" + new Date().getTime() : "");
    this.div.appendChild(this.pageFrame);

    var object = this;
    this.pageFrame.addEventListener("load", function() {
      object.afterLoad();
    });
  } else {
    // Verificar se o componente tem bibliotecas.
    if (this.libraries && this.libraries.length > 0) {
      for (var i = 0; i < this.libraries.length; i++) {
        // Desenhar importação da biblioteca na página.
        this.designLibrary(this.libraries[i]);
      }
    }
  }
};

/**
 * Ocorre após a inicialização do componente.
 **/
HTMLIntegration.prototype.afterInit = function() {
  this.callMethod(HTMLElementBase, "afterInit", []);

  // Verificar se o componente é tela cheia.
  if (this.fullscreen) {
    // Verificar se a aba relacionada a este componente existe.
    if (this.tab && this.tab.div) {
      this.tab.div.style.padding = "0";
      if (this.tab.showTabButtons) this.tab.div.style.minHeight = "calc(100vh - " + this.tab.div.offsetTop + "px)";
      else this.tab.div.style.minHeight = "100vh";
    }
  }

  // Verificar o alinhamento vertical.
  if (this.AlinhamentoV) {
    switch (this.AlinhamentoV) {
      case "N": { // Nenhum
        break;
      }

      case "T": { // Topo
        this.div.style.top = "0px";
        this.div.style.bottom = null;
        break;
      }

      case "C": { // Centro
        var tabHeight = d.t ? d.t.height : this.doc.offsetHeight;
        this.div.style.top = ((((tabHeight / 2) - (this.height / 2)) * 100) / tabHeight) + "%";
        this.div.style.bottom = null;
        break;
      }

      case "R": { // Rodapé
        this.div.style.top = null;
        this.div.style.bottom = "0px";
        break;
      }
    }
  }

  // Verificar o alinhamento horizontal.
  if (this.AlinhamentoH) {
    switch (this.AlinhamentoH) {
      case "N": { // Nenhum
        break;
      }

      case "E": { // Esquerda
        this.div.style.left = "0px";
        break;
      }

      case "C": { // Centro
        var tabWidth = d.t ? d.t.width : this.doc.offsetWidth;
        this.div.style.left = ((((tabWidth / 2) - (this.width / 2)) * 100) / tabWidth) + "%";
        break;
      }

      case "D": { // Direita
        var tabWidth = d.t ? d.t.width : this.doc.offsetWidth;
        var value = tabWidth - this.width;
        var layWidth = parseInt(document.getElementById("lay").style.width);
        if (value > layWidth) value = layWidth;
        var percent = ((value * 100) / layWidth);
        this.div.style.left = percent + "%";

        if (d.n.responsive) {
          this.div.style.width = (100 - percent) + "%";
        }

        break;
      }
    }
  }
};

/**
 * Desenha a importação de uma biblioteca do componente na página.
 * @param lib - documento onde o componente será inserido.
 **/
HTMLIntegration.prototype.designLibrary = function(lib) {
  if (lib != null && lib.length > 0) {
    var lowerCaseLib = lib.toLowerCase().trim();
    if (lowerCaseLib.indexOf(".css") != -1) {
      // Desenhar o CSS da biblioteca na página.
      var head = document.getElementsByTagName("head")[0];
      var link = document.createElement("link");
      link.type = "text/css";
      link.href = lib;
      head.appendChild(link);
    } else {
      // Desenhar o Javascript da biblioteca na página.
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = lib;
      document.body.appendChild(script);
    }
  }
};

/**
 * Define o conteúdo HTML do componente.
 * @param html Conteúdo HTML do componente.
 * @param css Conteúdo CSS do componente.
 * @param js Conteúdo Javascript do componente.
 **/
HTMLIntegration.prototype.inner = function(html, css, js) {
  if (html && html.length > 0 && this.div) {
    this.div.innerHTML = html;
  }

  if (css && css.length > 0) {
    var head = document.getElementsByTagName("head")[0];
    var styleTag = document.createElement("style");
    styleTag.type = "text/css";
    styleTag.innerHTML = css;
    head.appendChild(styleTag);
  }

  if (js && js.length > 0) {
    var scriptTag = document.createElement("script");
    scriptTag.type = "text/javascript";
    scriptTag.innerHTML = js;
    document.body.appendChild(scriptTag);
  }
};

/**
 * Associa os eventos ao componente.
 * @param events - Array de eventos do componente.
 **/
HTMLIntegration.prototype.assignEvents = function(events) {
  if (events && events.length > 0) {
    for (var i = 0; i < events.length; i++) {
      let refEvent = events[i];
      let elem = document.getElementById(refEvent.element);
      if (elem) {
        let params = (refEvent.params && refEvent.params.length && refEvent.params.length > 0) ? refEvent.params : [];
        let flow = refEvent.flow;
        let action = refEvent.event;
        elem.addEventListener(action, function(){
          ebfFlowExecute(flow, params);
        }, false)
      }
    }
  }
};

/**
 * Ocorre após o carregamento do componente.
 **/
HTMLIntegration.prototype.afterLoad = function() {
  if (this.DepoisDeCarregar) this.DepoisDeCarregar.call(this);
};

/**
 * Obtém um elemento do componente.
 * @author Janpier
 * @param id identificador para o elemento.
 * @returns elemento caso exista.
 */
HTMLIntegration.prototype.getElementById = function (id) {
  try {
    if (id) {
      if (this.pageFrame) return this.pageFrame.contentDocument.getElementById(id);
      else return document.getElementById(id);
    }
   return null;
  }catch (e) {
    handleException(getLocaleMessage('ERROR.OPERATION_ERROR'));
    return;
  }
};