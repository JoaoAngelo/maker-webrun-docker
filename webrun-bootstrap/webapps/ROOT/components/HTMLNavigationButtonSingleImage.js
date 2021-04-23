/**
 * Classe respons�vel pelos bot�es da barra de navega��o de um formul�rio
 */
function HTMLNavigationButtonSingleImage(sys, formID, code, posX, posY, width, height, description, src, additionalClassName) {
  this.create(sys, formID, code, posX, posY, width, height, description, src);
  if (src) {
    this.src = index != -1 ? src.substring(0, index) : src;  
    var index = src.lastIndexOf(".gif");
    this.src = index != -1 ? src.substring(0, index) : src;
  } else {
    this.src = "";
  }
  this.hint = "";
}

HTMLNavigationButtonSingleImage.inherits(HTMLImageButton);

HTMLNavigationButtonSingleImage.prototype.name = "HTMLNavigationButton";

/**
 * � necess�rio a cria��o da div principal de forma diferente da HTMLElementBase.
 */
HTMLNavigationButtonSingleImage.prototype.design = function(doc, tabControl) {
  this.doc = doc;
  this.div = document.createElement("div");
  this.div.name = "WFRComponent" + this.code;
  this.div.zIndex = this.zindex;
  this.div.className = this.className + " ";
  this.div.className += this.className + "-" + resources_locale + " ";
  this.div.className += this.className + "-" + this.additionalClassName;
  this.context = this.div;
  this.designComponent(doc, tabControl);
  doc.appendChild(this.div);
  this.init(tabControl);
}

HTMLNavigationButtonSingleImage.prototype.designComponent = function(doc) {
  //Prealod Images
  if (!this.hideImage) {
    preload(this.src + ".gif?locale="+resources_locale);
  }

  this.img = document.createElement("img");
  this.img.setAttribute('border', '0');
  this.img.alt = this.description;
  this.img.title = this.description;

  this.img.src = this.src + ".gif?locale="+resources_locale;

  this.attachEvent(this.img, 'mouseover', this.onmouseover);
  this.attachEvent(this.img, 'mouseout', this.onmouseout);

  this.img.style.height = this.height;
  this.img.style.width = this.width;

  this.input = document.createElement("a");
  this.input.href = "javascript:;";

  this.onclickCatch = this.onclick;
  this.onclick = this.onclickActionWrapper;

  this.input.appendChild(this.img);
  this.context.appendChild(this.input);
}

HTMLNavigationButtonSingleImage.prototype.onmouseover = function(e) {
  if (!this.hideImage) {
    if (this.canFocus()) {
      this.div.className = this.className + " ";
      this.div.className += this.className + "-" + resources_locale + " ";
      this.div.className += this.className + "-" + this.additionalClassName + "-Over";
    }
  }
}

HTMLNavigationButtonSingleImage.prototype.onmouseout = function() {
  if (!this.hideImage) {
    if (this.canFocus()) {
      this.div.className = this.className + " ";
      this.div.className += this.className + "-" + resources_locale + " ";
      this.div.className += this.className + "-" + this.additionalClassName;
    }
  }
}

/**
 * Necess�ria sobrecarga para que os bot�es fiquem alinhados.
 */
HTMLNavigationButtonSingleImage.prototype.setVisible = function(v) {
  this.visible = v;
  if (v) {
    this.div.style.display = "inline-block";
  } else {
    this.div.className = this.className + " ";
    this.div.className += this.className + "-" + resources_locale + " ";
    this.div.className += this.className + "-" + this.additionalClassName;
    this.div.style.display = "none";
  }
}

HTMLNavigationButtonSingleImage.prototype.setEnabled = function(v) {
  this.enabled = v;
  if (this.img) {
    this.img.disabled = !v;

    if (!this.hideImage) {
      if (this.enabled && this.input) {
        this.div.className = this.className + " ";
        this.div.className += this.className + "-" + resources_locale + " ";
        this.div.className += this.className + "-" + this.additionalClassName;
        this.input.setAttribute("href", "javascript:;");
      } else {
        this.div.className = this.className + " ";
        this.div.className += this.className + "-" + resources_locale + " ";
        this.div.className += this.className + "-" + this.additionalClassName + "-Des";
        this.input.removeAttribute("href");
      }
    }
  }
}