function HTMLImageButton(sys, formID, code, posX, posY, width, height, description, src) {
  this.create(sys, formID, code, posX, posY, width, height, description, '');
  if (src) {
    this.src = index != -1 ? src.substring(0, index) : src;
    var index = src.lastIndexOf(".gif");
    this.src = index != -1 ? src.substring(0, index) : src;
  } else this.src = "";
  this.hint = "";
}

HTMLImageButton.inherits(HTMLElementBase);

HTMLImageButton.prototype.name = "HTMLImageButton";
HTMLImageButton.prototype.tabable = true;
HTMLImageButton.prototype.zindex = 11;
HTMLImageButton.prototype.tabKeys = [9];
HTMLImageButton.prototype.tagName = 'a';

HTMLImageButton.prototype.setImage = function(img) {
  var index = src.lastIndexOf(".gif");
  this.src = index != -1 ? src.substring(0, index) : src;
}

HTMLImageButton.prototype.setOnClick = function(onclick) {
  this.onclick = onclick;
  this.setEnabled(this.enabled);
}

HTMLImageButton.prototype.setEnabled = function(v) {
  this.enabled = v;
  if (this.img) {
    this.img.disabled = !v;

    if (!this.hideImage) {
      if (this.enabled && this.input) {
        this.img.src = this.src + ".gif?locale="+resources_locale;
        this.input.setAttribute("href", "javascript:;");
      } else {
        this.img.src = this.src + "_des.gif?locale="+resources_locale;
        this.input.removeAttribute("href");
      }
    }
  }
}

HTMLImageButton.prototype.setReadOnly = function(v) {
  this.setEnabled(!v);
}

HTMLImageButton.prototype.designComponent = function(doc) {
  //Prealod Images
  if (!this.hideImage) {
    preload(this.src + ".gif?locale="+resources_locale);
    preload(this.src + "_des.gif?locale="+resources_locale);
    preload(this.src + "_over.gif?locale="+resources_locale);
  }  

  this.img = document.createElement("img");
  this.img.setAttribute('border', '0');
  this.img.alt = this.description;
  this.img.title = this.description;

  if (!this.hideImage) {
    if (this.enabled)
      this.img.src = this.src + ".gif?locale="+resources_locale;
    else
      this.img.src = this.src + "_des.gif?locale="+resources_locale;
  }    

  this.attachEvent(this.img, 'mouseover', this.onmouseover);
  this.attachEvent(this.img, 'mouseout', this.onmouseout);

  this.img.style.height = this.height + "px";
  this.img.style.width = this.width + "px";

  this.input = document.createElement("a");
  this.input.href = "javascript:;";

  this.onclickCatch = this.onclick;
  this.onclick = this.onclickActionWrapper;

  this.input.appendChild(this.img);
  this.context.appendChild(this.input);
}

HTMLImageButton.prototype.onmouseover = function(e) {
  if (!this.hideImage) {
    if (this.canFocus()) {
      this.img.src = this.src + "_over.gif?locale="+resources_locale;
    }
  }
}

HTMLImageButton.prototype.onmouseout = function() {
  if (!this.hideImage) {
    if (this.canFocus()) {
      this.img.src = this.src + ".gif?locale="+resources_locale;
    }
  }
}

HTMLImageButton.prototype.canFocus = function() {
  return this.enabled && this.visible;
}

HTMLImageButton.prototype.focus = function() {
  var canFocus = this.canFocus();
  if (canFocus) {
    this.input.focus();
    if (window.event) {
      if (window.event.preventDefault) {
        window.event.preventDefault();
        window.event.stopPropagation();
      } else {
        try { window.event.keyCode = 0; } catch(e) {}
        window.event.returnValue = false;
      }
    }
  }
  return canFocus;
}

HTMLImageButton.prototype.click = function(e) {
  if (this.enabled && this.visible && !this.readonly) {
    if (this.onclick)
      this.onclick.call(this, e);
  }
}

HTMLImageButton.prototype.onclickActionWrapper = function(e) {
  if (!this.hideImage) {
    if (this.onclickCatch) {
      this.img.src = this.src + ".gif?locale="+resources_locale;
      this.onclickCatch.call(this, e);
    }
  }
}