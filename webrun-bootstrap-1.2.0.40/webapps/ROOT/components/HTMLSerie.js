/**
 * Método construtor do HTMLSerie. Representa cada série de um componente Gráfico (HTMLChart).
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - ALtura do componente. 
 * @param alt - hint/title da imagem do grafico.
 * @param value 
 **/
function HTMLSerie(sys, formID, code, posX, posY, width, height, alt, value) {
  this.create(sys, formID, code, posX, posY, width, height, '', value);  
}

/**
 * Propriedades do HTMLSerie.
 **/
HTMLSerie.inherits(HTMLElementBase);
HTMLSerie.prototype.name = 'HTMLSerie';
HTMLSerie.prototype.tabable = false;
HTMLSerie.prototype.zindex = 0;

HTMLSerie.prototype.designComponent = function(doc) {
   
}

HTMLSerie.prototype.toPermissionMode = function() {
  
}