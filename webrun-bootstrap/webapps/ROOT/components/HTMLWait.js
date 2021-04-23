function HTMLWait(sys, formID, code, posX, posY, width, height, value) {
  this.create(sys, formID, code, posX, posY, width, height, '', value);
  this.designComponent();
}

HTMLWait.inherits(HTMLElementBase);
HTMLWait.prototype.name = 'HTMLWait';
HTMLWait.prototype.tabable = false;

HTMLWait.prototype.designComponent = function(doc) {
  (this.posX) ? posX = this.posX: posX = (document.documentElement.offsetWidth - this.width);
  (this.posY) ? posY = this.posY: posY = 0;

  // Cria o elemento do spinner.
  this.div = this.getDiv('WFRWait' + this.code, posX, posY, this.width, this.height, 10, true);

  // Conteúdo do elemento.
  this.div.innerHTML =
    '<div class="spinner-border text-primary center-center" role="status">' +
      '<span class="sr-only">' + this.value + '</span>' +
    '</div>';

  // Adiciona o spinner ao body
  document.body.appendChild(this.div);

  // Exibe o spinner
  this.show();
}

HTMLWait.prototype.show = function() { this.div.style.display = "block"; };
HTMLWait.prototype.hide = function() { this.div.style.display = "none"; };
HTMLWait.prototype.setIcon = function(url) { };