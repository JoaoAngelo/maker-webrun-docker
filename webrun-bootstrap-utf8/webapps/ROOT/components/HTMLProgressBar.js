function HTMLProgressBar(sys, code, description) {
  this.create(sys, null, code, null, null, null, null, description, null);
  this.percent = 0;
  this.closeable = true;
  this.closed = false;
}

HTMLProgressBar.inherits(HTMLElementBase);
HTMLProgressBar.prototype.name = 'HTMLProgressBar';

HTMLProgressBar.prototype.minValue = 0;
HTMLProgressBar.prototype.maxValue = 100;

HTMLProgressBar.prototype.design = function(doc) {
  // Criar modal do Bootstrap.
  this.modal = bootstrapCreateModal(this.getDescription(), this.closeable);

  // Associar evento de show do modal.
  var object = this;
  $(this.modal[0]).on('shown.bs.modal', function (e) {
    if (object.closed) object.close();
  });

  // Personalizar o modal para a barra de progresso.
  this.modal[1].className += " px-2 pt-1 pb-2"; // Bootstrap
  this.modal[2].className += " p-3"; // Bootstrap
  this.modal[3].className += " d-none"; // Bootstrap
  this.modal[4].className += " modal-sm"; // Bootstrap

  // Procurar pelo elemento do tÃ­tulo do modal.
  this.modalTitle = this.modal[0].getElementsByClassName("modal-title");
  if (this.modalTitle.length > 0) this.modalTitle = this.modalTitle[0];
  else this.modalTitle = null;
  if (this.modalTitle) this.modalTitle.className += " mt-1 h6"; // Bootstrap

  // Obter o valor inicial da barra de progresso.
  var initialValue = this.percent ? Math.min(Math.max(this.percent, this.minValue), this.maxValue) : this.minValue;

  // Criar a barra de progresso no corpo do modal.
  this.progressBar = document.createElement("div");
  this.progressBar.className = "progress"; // Bootstrap
  this.progressBar.style.height = "1.5rem";
  this.modal[2].appendChild(this.progressBar);

  this.progressBarInner = document.createElement("div");
  this.progressBarInner.className = "progress-bar progress-bar-striped progress-bar-animated"; // Bootstrap
  this.progressBarInner.setAttribute("role", "progressbar");
  this.progressBarInner.setAttribute("aria-valuenow", initialValue);
  this.progressBarInner.setAttribute("aria-valuemin", this.minValue);
  this.progressBarInner.setAttribute("aria-valuemax", this.maxValue);
  this.progressBarInner.style.width = initialValue + "%";
  this.progressBarInner.innerHTML = initialValue + "%";
  this.progressBar.appendChild(this.progressBarInner);
};

HTMLProgressBar.prototype.setPercent = function(percent) {
  this.percent = Math.min(Math.max(percent, this.minValue), this.maxValue);
  if (this.progressBarInner) {
    this.progressBarInner.setAttribute("aria-valuenow", this.percent);
    this.progressBarInner.innerHTML = this.percent + "%";
    this.progressBarInner.style.width = this.percent + "%";
  }
};

HTMLProgressBar.prototype.getPercent = function() {
  return this.percent;
};

HTMLProgressBar.prototype.setDescription = function(description) {
  this.description = description;
  if (this.modalTitle) this.modalTitle.innerHTML = description;
};

HTMLProgressBar.prototype.getDescription = function() {
  return this.description;
};

HTMLProgressBar.prototype.getForm = function() {
  return this.form;
};

HTMLProgressBar.prototype.close = function() {
  this.closed = true;
  if (this.modal) bootstrapCloseModal(this.modal[0]);
};
