/**
 * Classe responsÃ¡vel pelos botÃµes da barra de navegaÃ§Ã£o de um formulÃ¡rio
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
 * Ã‰ necessÃ¡rio a criaÃ§Ã£o da div principal de forma diferente da HTMLElementBase.
 */
HTMLNavigationButton.prototype.design = function(doc, tabControl) {
  // Criar o elemento base do botÃ£o
  this.div = document.createElement("li");
  this.div.name = "WFRComponent" + this.code;
  this.divClass = "nav-item"; // Bootstrap
  this.div.className = this.divClass;

  // Definir as variÃ¡veis de contexto
  this.doc = doc;
  this.context = this.div;

  // Desenhar o componente
  this.designComponent(doc, tabControl);

  // Adicionar o botÃ£o Ã  barra de navegaÃ§Ã£o
  doc.appendChild(this.div);

  this.init(tabControl);
};

HTMLNavigationButton.prototype.designComponent = function(doc) {
  // Verificar se o Ã­cone definido tem elementos de URL
  if (this.src.indexOf("/") !== -1 || this.src.indexOf("\\") !== -1 || this.src.indexOf(".") !== -1) {
    // O Ã­cone Ã© uma url
    // Criar o elemento do Ã­cone
    this.img = document.createElement("img");
    this.imgType = 0; // URL

    // Definir a url do Ã­cone
    this.img.src = this.src;

    // Layout do Ã­cone
    this.img.width = this.width;
    this.img.height = this.height;

    this.img.style.width = this.width;
    this.img.style.height = this.height;
  } else {
    // Criar o elemento do Ã­cone.
    this.img = document.createElement("i");
    this.imgType = 1; // Webfont

    // Definir a classe do Ã­cone (Font Awesome).
    this.img.className = this.src;
    this.img.style.fontSize = "1.5rem";
  }

  // Criar o link do Ã­cone (base)
  this.input = document.createElement("a");
  this.inputClass = "nav-link generic-btn p-3 text-dark outline-0"; // Bootstrap
  this.input.href = "#!";

  // Definir tooltip/texto alternativo do Ã­cone e do botÃ£o
  if (this.description) {
    if (this.imgType == 0) this.img.alt = this.description;
    this.inputClass += " nav-tooltip"; // Custom
    this.input.title = this.description;
    this.input.setAttribute("data-toggle", "tooltip"); // Bootstrap Tooltip
    this.haveTooltips = true;
  } else this.haveTooltips = false;

  this.input.className = this.inputClass;

  // Adicionar os elementos Ã  pÃ¡gina
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
 * FunÃ§Ã£o para chamar o evento de clique do botÃ£o.
 * Usada pelo WFR.js para as teclas de atalho da navbar.
 */
HTMLNavigationButton.prototype.click = function(e) {
  if (this.input) this.input.click();
};

/**
 * NecessÃ¡ria sobrecarga para que os botÃµes fiquem alinhados.
 */
HTMLNavigationButton.prototype.setVisible = function(v) {
  this.visible = v;
  this.div.style.display = v ? "inline-block" : "none";
};

/**
 * NecessÃ¡ria sobrecarga para que os botÃµes fiquem alinhados.
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
