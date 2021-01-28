function HTMLPage(sys, formID, code, posX, posY, width, height, nav, scrolling) {
  this.create(sys, formID, code, posX, posY, width, height, '', '');
  this.nav = nav;
  this.loaded = false;
  this.scrolling = scrolling;
}

HTMLPage.inherits(HTMLElementBase);
HTMLPage.prototype.name = 'HTMLPage';
HTMLPage.prototype.ignore = true;

HTMLPage.prototype.designComponent = function(doc) {
  this.div.style.height = null;
  this.div.style.minHeight = null;
  this.doc.style.minHeight = null;

  this.div.className = "position-relative w-100 h-100 border-0 outline-0"; // Bootstrap
  this.divClass = this.div.className;

  this.page = document.createElement("iframe");
  this.page.className = "w-100 h-100 border-0 outline-0 overflow-auto"; // Bootstrap
  this.page.style.top = "0px";
  this.page.style.bottom = "0px";
  this.page.style.left = "0px";
  this.page.style.right = "0px";

  // NOTA: Os atributos abaixo foram removidos do HTML5
  //       Veja mais em: https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/iframe
  //       Deixei descomentado para manter compatibilidade com navegadores mais antigos que
  //       sÃ³ suportam HTML 4
  this.page.setAttribute("frameborder", "no");
  this.page.setAttribute("border", "0");
  this.page.setAttribute("marginwidth", "0");
  this.page.setAttribute("marginheight", "0");
  this.page.setAttribute("scrolling", "yes");

  // Para contornar estes atributos, definimos tambÃ©m no CSS (HTML 5)
  this.page.style.margin = "0";
  this.page.style.border = "0";
  this.page.style.outline = "0";

  this.context.appendChild(this.page);
};

HTMLPage.prototype.load = function(e) {
  if (!this.loaded) {
    this.page.src = 'javascript:false';
    this.page.src = 'basic_query' + PAGES_EXTENSION + '?sys=' + this.sys + '&formID=' + this.formID;

    if (frameElement && frameElement.assignEventsHierarchy) {
      var object = this;
      this.page.assignEventsHierarchy = frameElement.assignEventsHierarchy;
      this.page.onload = function() {
        try {
          frameElement.assignEventsHierarchy(object.page.contentWindow.document);
        } catch (e) { }
      };
    }

    this.loaded = true;
  }

  this.nav.query();
};

HTMLPage.prototype.focus = function() { return false; };
HTMLPage.prototype.blur = function() { return false; };
