/**
 * Classe responsável pelos botões da barra de navegação de um formulário
 */
function HTMLNavigationButton(sys, formID, code, posX, posY, width, height, description, src, additionalClassName) {
  this.create(sys, formID, code, posX, posY, width, height, description, src);
  this.src = src;
  this.hint = "";
  this.tabindex = 90000;
  this.tabKeys = [9];
}

HTMLNavigationButton.inherits(HTMLElementBase);
HTMLNavigationButton.prototype.name = "HTMLNavigationButton";

/**
 * �? necessário a criação da div principal de forma diferente da HTMLElementBase.
 */
HTMLNavigationButton.prototype.design = function(doc, tabControl) {
  // Criar o elemento base do botão
  this.div = document.createElement("li");
  this.div.name = "WFRComponent" + this.code;
  this.divClass = "nav-item"; // Bootstrap
  this.div.className = this.divClass;

  // Definir as variáveis de contexto
  this.doc = doc;
  this.context = this.div;

  // Desenhar o componente
  this.designComponent(doc, tabControl);

  // Adicionar o botão à barra de navegação
  doc.appendChild(this.div);

  this.init(tabControl);
};

HTMLNavigationButton.prototype.designComponent = function(doc) {
  // Verificar se o ícone definido tem elementos de URL
  if (this.src.indexOf("/") !== -1 || this.src.indexOf("\\") !== -1 || this.src.indexOf(".") !== -1) {
    // O ícone é uma url
    // Criar o elemento do ícone
    this.img = document.createElement("img");
    this.imgType = 0; // URL

    // Definir a url do ícone
    this.img.src = this.src;

    // Layout do ícone
    this.img.width = this.width;
    this.img.height = this.height;

    this.img.style.width = this.width;
    this.img.style.height = this.height;
  } else {
    // Criar o elemento do ícone.
    this.img = document.createElement("i");
    this.imgType = 1; // Webfont

    // Definir a classe do ícone (Font Awesome).
    this.img.className = this.src;
    this.img.style.fontSize = "1.5rem";
  }

  // Criar o link do ícone (base)
  this.input = document.createElement("a");
  this.inputClass = "nav-link generic-btn p-3 text-dark outline-0"; // Bootstrap
  this.input.href = "#!";

  // Definir tooltip/texto alternativo do ícone e do botão
  if (this.description) {
    if (this.imgType == 0) this.img.alt = this.description;
    this.inputClass += " nav-tooltip"; // Custom
    this.input.title = this.description;
    this.input.setAttribute("data-toggle", "tooltip"); // Bootstrap Tooltip
    this.haveTooltips = true;
  } else this.haveTooltips = false;

  this.input.className = this.inputClass;

  // Adicionar os elementos à página
  this.input.appendChild(this.img);
  this.context.appendChild(this.input);
};

/**
 * Ocorre ao clicar no elemento.
 */
HTMLNavigationButton.prototype.clickAction = function(e, o) {
  if (this.input) bootstrapCloseTooltip(this.input);
  this.callMethod(HTMLElementBase, "clickAction", [e, o]);
};

/**
 * Função para chamar o evento de clique do botão.
 * Usada pelo WFR.js para as teclas de atalho da navbar.
 */
HTMLNavigationButton.prototype.click = function(e) {
  if (this.input) this.input.click();
};

/**
 * Necessária sobrecarga para que os botões fiquem alinhados.
 */
HTMLNavigationButton.prototype.setVisible = function(v) {
  this.visible = v;
  this.div.style.display = v ? "inline-block" : "none";
};

/**
 * Necessária sobrecarga para que os botões fiquem alinhados.
 */
HTMLNavigationButton.prototype.setEnabled = function(v) {
  this.enabled = v;
  if (this.input) this.input.className = this.inputClass + (v ? "" : " disabled");
  if (this.div) this.div.className = this.divClass + (v ? "" : " disabled");

  if (this.img) {
    this.img.disabled = !v;
    if (!this.hideImage) {
      if (this.enabled && this.input) {
        this.input.setAttribute("href", "#!");
      } else {
        this.input.removeAttribute("href");
      }
    }
  }
};
