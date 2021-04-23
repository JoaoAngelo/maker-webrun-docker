function HTMLShape(sys, formID, code, posX, posY, width, height, type) {
  this.create(sys, formID, code, posX, posY, width, height, '', '');
  this.color = "#000000";
  this.textColor = "#000000";
  this.bgColor = "#FFFF00";
  this.shapes = new Array();
  this.type = type;
  this.stroke = 1;
}

HTMLShape.inherits(HTMLElementBase);

HTMLShape.prototype.loadScripts = function() {
  webrun.include("components/dojo/dojo.js");
  dojo.baseUrl = 'components/dojo/';
  dojo.require('dojox.gfx');
}

HTMLShape.prototype.name = 'HTMLShape';
HTMLShape.prototype.tabable = false;

// Definição do raio do componente balloon
HTMLShape.prototype.BALLOON_RADIX = 30;

// Definição do raio do componente comment
// Raio este definido para a quebra do canto superior esquerdo do componente
HTMLShape.prototype.COMMENT_RADIX = 20;

// Definição do raio da seta
HTMLShape.prototype.ARROW_RADIX = 8;

// Definição de constantes para representar os componentes
HTMLShape.prototype.CIRCLE_TYPE = 1;
HTMLShape.prototype.RECT_TYPE = 2;
HTMLShape.prototype.DIAMOND_TYPE = 3;
HTMLShape.prototype.BALLOON_TYPE = 4;
HTMLShape.prototype.COMMENT_TYPE = 5;
HTMLShape.prototype.SUBRULE_TYPE = 6;
HTMLShape.prototype.ENDCIRCLE_TYPE = 7;

// Seta a descrição que deve aparecer no meio do componente
HTMLShape.prototype.setDescription = function(v) {
  this.description = v;
    if (!this.divText) {
      if (v && v.length > 0) {
        this.divText = this.getDiv('', 0, 0, this.width, this.height, 6, true);
        this.divText.style.cursor = 'pointer';

        var table = getTable(1, 1, '100%', '100%');
        this.label = getLabel(v, true);
        this.label.style.color = this.textColor;
        table[CELLS][0][0].setAttribute('align', 'center');
        table[CELLS][0][0].setAttribute('valign', 'middle');
        table[CELLS][0][0].appendChild(this.label);
        this.divText.appendChild(table[TABLE]);

        this.context.appendChild(this.divText);

        this.label.onmousedown = function() { return false; };
        this.label.onselectstart = function() { return false; };

      }
    } else {
      if (v && v.length > 0) {
        this.label.innerHTML = v;
      } else {
        this.context.removeChild(this.divText);
        this.divText = null;
        this.label = null;
      }
    }
}

HTMLShape.prototype.getDescription = function() {
  return this.description;
}

HTMLShape.prototype.setFont = function(f) {
  if (this.label)
    this.label.style.fontFamily = f;
}

HTMLShape.prototype.setSize = function(s) {
  if (s.indexOf("pt") == -1)
    s += "pt";
  if (this.label)
    this.label.style.fontSize = s;
}

HTMLShape.prototype.setWeight = function(w) {
  if (this.label) {
    if (w) this.label.style.fontWeight = "bold";
    else this.label.style.fontWeight = "normal";
   }
}

HTMLShape.prototype.setItalic = function(w) {
  if (this.label) {
    if (w) this.label.style.fontStyle = "italic";
    else this.label.style.fontStyle = "normal";
   }
}

HTMLShape.prototype.setUnderline = function(u) {
  if (this.label) {
    if (u) this.label.style.textDecoration = "underline";
    else this.label.style.textDecoration = "none";
  }
}

HTMLShape.prototype.setStrikeout = function(st) {
  if (this.label) {
    if (st) this.label.style.textDecoration = "line-through";
    else this.label.style.textDecoration = "none";
  }
}

HTMLShape.prototype.setTextDecoration = function() {
  if (this.label) {
    var textDecoration = "";
    if (this.underline || this.strikeout) {
      if (this.underline) {
        textDecoration += "underline";
      }
      if (this.strikeout) {
        textDecoration += " line-through";
      }
    } else {
      textDecoration = "none";
    }
    this.label.style.textDecoration = textDecoration;
  }
}

HTMLShape.prototype.setColor = function(color) {
  this.color= color;
}

HTMLShape.prototype.setTextColor = function(color) {
  this.textColor= color;
  if (this.label) this.label.style.color = color;
}

HTMLShape.prototype.setBGColor = function(color) {
  this.bgColor= color;
}

HTMLShape.prototype.setWidth = function(w) {
 w = parseInt(w);
 this.callMethod(HTMLElementBase, 'setWidth', [w]);
 for(var id in this.shapes) {
   var shape = this.shapes[id];
   if (shape._resizeWidth)
     shape._resizeWidth.call(this, shape, w, this.height);
 }
 if (this.divText) this.divText.style.width = w + "px";
}

HTMLShape.prototype.setHeight = function(h) {
 h = parseInt(h);
 this.callMethod(HTMLElementBase, 'setHeight', [h]);
 for(var id in this.shapes) {
   var shape = this.shapes[id];
   if (shape._resizeHeight)
     shape._resizeHeight.call(this, shape, this.width, h);
 }
 if (this.divText) this.divText.style.height = h + "px";
}

HTMLShape.prototype.getDefault = function() {
  if (this.useDefaultColors) {
    this.color = this.colorDefault ;
    this.textColor = this.textColorDefault;
    this.bgColor = this.bgColorDefault;
  }
}

// Retorna o código que representa o tipo de componente
HTMLShape.prototype.getCodeType = function() {
  return this.codeType;
}

HTMLShape.prototype.isCircle = function() {
  return this.codeType == this.CIRCLE_TYPE;
}

HTMLShape.prototype.isRect = function() {
  return this.codeType == this.RECT_TYPE;
}

HTMLShape.prototype.isDiamond = function() {
  return this.codeType == this.DIAMOND_TYPE;
}

HTMLShape.prototype.isBalloon = function() {
  return this.codeType == this.BALLOON_TYPE;
}

HTMLShape.prototype.isComment = function() {
  return this.codeType == this.COMMENT_TYPE;
}

HTMLShape.prototype.isSubRule = function() {
  return this.codeType == this.SUBRULE_TYPE;
}

HTMLShape.prototype.isEndCircle = function() {
  return this.codeType == this.ENDCIRCLE_TYPE;
}

HTMLShape.prototype.designComponent = function(doc) {

  this.surface = dojox.gfx.createSurface(this.context, IE?this.width:'100%', IE?this.height:'100%');

  this.surface_size = this.surface.getDimensions();
  this.surface_size.width  = parseInt(this.surface_size.width);
  this.surface_size.height = parseInt(this.surface_size.height);

  var regexp = /^(.+[^\d])\d*$/;
  if (regexp.test(this.type)) {
    this.type = RegExp.$1;
  }

  if (this.type) {
    switch (this.type) {
      case 'CIRCLE':
      case 'FlowStart': {
        this.colorDefault     = '#FFFFFF';
        this.bgColorDefault   = '#000000';
        this.textColorDefault = '#FFFFFF';
        this.getDefault();
        this.timeout(this.drawCircle,0);
        this.resizeProportional = true;
        this.codeType = this.CIRCLE_TYPE;
        break;
      }

      case 'RECT':
      case 'FlowExpression': {
        this.colorDefault     = '#2dc128';
        this.bgColorDefault   = '#dbf7da';
        this.textColorDefault = '#000000';
        this.getDefault();
        this.timeout(this.drawRect,0);
        this.codeType = this.RECT_TYPE;
        break;
      }

      case 'DIAMOND':
      case 'FlowDecision': {
        this.colorDefault     = '#ff0000';
        this.bgColorDefault   = '#ffdede';
        this.textColorDefault = '#000000';
        this.getDefault();
        this.timeout(this.drawDiamond,0);
        this.codeType = this.DIAMOND_TYPE;
        break;
      }

      case 'BALLOON':
      case 'FlowActivity': {
        this.colorDefault     = '#000080';
        this.bgColorDefault   = '#dce6fa';
        this.textColorDefault = '#000000';
        this.getDefault();
        this.minWidth = this.BALLOON_RADIX*2+1;
        this.minHeight = this.BALLOON_RADIX*2+1;
        this.timeout(this.drawBalloon,0);
        this.codeType = this.BALLOON_TYPE;
        break;
      }

      case 'COMMENT':
      case 'FlowRemark': {
        this.colorDefault     = '#800000';
        this.bgColorDefault   = '#eddcdc';
        this.textColorDefault = '#000000';
        this.getDefault();
        this.timeout(this.drawComment,0);
        this.codeType = this.COMMENT_TYPE;
        break;
      }

      case 'SUBRULE':
      case 'FlowSubRoutine': {
        this.colorDefault     = '#ff8000';
        this.bgColorDefault   = '#f8f5cb';
        this.textColorDefault = '#000000';
        this.getDefault();
        this.timeout(this.drawSubRule,0);
        this.codeType = this.SUBRULE_TYPE;
        break;
      }

      case 'ENDCIRCLE':
      case 'FlowEnd': {
        this.colorDefault     = '#000000';
        this.bgColorDefault   = '#000000';
        this.textColorDefault = '#FFFFFF';
        this.getDefault();
        this.timeout(this.drawEndCircle,0);
        this.resizeProportional = true;
        this.codeType = this.ENDCIRCLE_TYPE;
        break;
      }
    }
  }

  this.setDescription(this.description);
}

HTMLShape.prototype.drawRect = function(id) {
  var aShape = this.surface.createRect({x: this.stroke, y: this.stroke, width: (this.width-(this.stroke*2)), height: (this.height-(this.stroke*2))});
  if (this.stroke) aShape.setStroke({color: this.color, width: this.stroke});
  aShape.setFill(this.bgColor);

  var resize = function(shape) {
    shape.setShape({x: this.stroke, y: this.stroke, width: this.width-(this.stroke*2), height: this.height-(this.stroke*2)});
    shape.setFill(this.bgColor);
    };
  aShape._resizeWidth = resize;
  aShape._resizeHeight = resize;

  this.connectEvents();
  this.shapes['Main'] = aShape;
  return aShape;
}

HTMLShape.prototype.drawSubRule = function() {
  var aShape = this.surface.createRect({x: this.stroke, y: this.stroke, width: this.width-(this.stroke*2), height: this.height-(this.stroke*2)});
  if (this.stroke) aShape.setStroke({color: this.color, width: this.stroke});
  aShape.setFill(this.bgColor);

  var l1 = this.surface.createPolyline([{x: 15, y: this.stroke}, {x: 15, y: this.height-this.stroke}]);
  l1.setStroke({color: this.color, width: this.stroke});

  var l2 = this.surface.createPolyline([{x: this.width-15, y: this.stroke}, {x: this.width-15, y: this.height-this.stroke}]);
  l2.setStroke({color: this.color, width: this.stroke});

  aShape._l1 = l1;
  aShape._l2 = l2;

  var resize = function(shape) {
    shape.setShape({x: this.stroke, y: this.stroke, width: this.width-(this.stroke*2), height: this.height-(this.stroke*2)});
    shape._l1.setShape([{x: 15, y: this.stroke}, {x: 15, y: this.height-this.stroke}]);
    shape._l2.setShape([{x: this.width-15, y: this.stroke}, {x: this.width-15, y: this.height-this.stroke}]);
  };
  aShape._resizeWidth = resize;
  aShape._resizeHeight = resize;

  this.connectEvents();
  this.shapes['Main'] = aShape;
  return aShape;
}

HTMLShape.prototype.drawCircle = function() {
  var aShape = this.surface.createEllipse({cx: this.width/2, cy: this.height/2, rx: (this.width/2)-this.stroke, ry: (this.height/2)-this.stroke});
  aShape.setStroke({color: this.color, width: this.stroke});
  aShape.setFill(this.bgColor);

  var resize = function(shape) { shape.setShape({cx: this.width/2, cy: this.height/2, rx: (this.width/2)-this.stroke, ry: (this.height/2)-this.stroke}) };
  aShape._resizeWidth = resize;
  aShape._resizeHeight = resize;

  this.connectEvents();
  this.shapes['Main'] = aShape;

  return aShape;
}

HTMLShape.prototype.drawEndCircle = function() {
  var aShape = this.surface.createEllipse({cx: this.width/2, cy: this.height/2, rx: (this.width/2)-this.stroke, ry: (this.height/2)-this.stroke});
  if (this.stroke) aShape.setStroke({color: this.color, width: this.stroke});

  var innerCircle = this.surface.createEllipse({cx: this.width/2, cy: this.height/2, rx: ((this.width/2)-this.stroke)-5, ry: ((this.height/2)-this.stroke)-5});
  innerCircle.setStroke({color: this.color, width: this.stroke});
  innerCircle.setFill(this.bgColor);

  var resize = function(shape) {
    shape.setShape({cx: this.width/2, cy: this.height/2, rx: (this.width/2)-this.stroke, ry: (this.height/2)-this.stroke})
    shape._innerCircle.setShape({cx: this.width/2, cy: this.height/2, rx: ((this.width/2)-this.stroke)-5, ry: ((this.height/2)-this.stroke)-5});
  };
  aShape._resizeWidth = resize;
  aShape._resizeHeight = resize;
  aShape._innerCircle = innerCircle;

  this.connectEvents();
  this.shapes['Main'] = aShape;

  return aShape;
}

HTMLShape.prototype.drawDiamond = function() {
  var aShape = this.surface.createPolyline([{x: 0, y: parseInt(this.height/2)}, {x: parseInt(this.width/2), y: 0}, {x: this.width, y: parseInt(this.height/2)}, {x: parseInt(this.width/2), y: this.height}, {x: 0, y: parseInt(this.height/2)}]);
  aShape.setStroke({color: this.color, width: this.stroke?this.stroke:1});
  aShape.setFill(this.bgColor);
  aShape._resizeWidth = function(shape) {shape.setShape([{x: 0, y: parseInt(this.height/2)}, {x: parseInt(this.width/2), y: 0}, {x: this.width, y: parseInt(this.height/2)}, {x: parseInt(this.width/2), y: this.height}, {x: 0, y: parseInt(this.height/2)}])}
  aShape._resizeHeight = function(shape) {shape.setShape([{x: 0, y: parseInt(this.height/2)}, {x: parseInt(this.width/2), y: 0}, {x: this.width, y: parseInt(this.height/2)}, {x: parseInt(this.width/2), y: this.height}, {x: 0, y: parseInt(this.height/2)}])}
  this.connectEvents();
  this.shapes['Main'] = aShape;
  return aShape;
}

HTMLShape.prototype.drawComment = function() {
  var aShape = this.surface.createPolyline([{x: this.COMMENT_RADIX, y: this.stroke}, {x: this.width-this.stroke, y: this.stroke}, {x: this.width-this.stroke, y: this.height-this.stroke}, {x: this.stroke, y: this.height-this.stroke},
                {x: this.stroke, y: this.COMMENT_RADIX}, {x: this.COMMENT_RADIX, y: this.stroke+1}, {x: this.COMMENT_RADIX, y:this.COMMENT_RADIX}, {x: this.stroke, y: this.COMMENT_RADIX}]);

  if (this.stroke) aShape.setStroke({color: this.color, width: this.stroke});
  aShape.setFill(this.bgColor);

  var resize = function(shape) { shape.setShape([{x: this.COMMENT_RADIX, y: this.stroke}, {x: this.width-this.stroke, y: this.stroke}, {x: this.width-this.stroke, y: this.height-this.stroke}, {x: this.stroke, y: this.height-this.stroke},
                {x: this.stroke, y: this.COMMENT_RADIX}, {x: this.COMMENT_RADIX, y: this.stroke}, {x: this.COMMENT_RADIX, y:this.COMMENT_RADIX}, {x: this.stroke, y: this.COMMENT_RADIX}]); };
  aShape._resizeWidth = resize;
  aShape._resizeHeight = resize;

  this.connectEvents();
  this.shapes['Main'] = aShape;
  return aShape;
}

HTMLShape.prototype.drawBalloon = function() {
  var aShape = this.surface.createRect({x: this.stroke, y: this.stroke, width: this.width-(this.stroke*2), height: this.height-(this.stroke*2), r: this.BALLOON_RADIX});
  aShape.setStroke({color: this.color, width: this.stroke});
  aShape.setFill(this.bgColor);

  var resize = function(shape) {
    shape.setShape({x: this.stroke, y: this.stroke, width: this.width-(this.stroke*2), height: this.height-(this.stroke*2), r: this.BALLOON_RADIX})
    shape.setFill(this.bgColor);
    };
  aShape._resizeWidth = resize;
  aShape._resizeHeight = resize;

  this.connectEvents();
  this.shapes['Main'] = aShape;
  return aShape;
}

HTMLShape.prototype.drawLine = function(id, x1, y1, x2, y2) {
  var aShape = this.surface.createLine({x1: x1, y1: y1, x2: x2, y2: y2});
  aShape.setStroke({color: this.color, width: this.stroke&&this.stroke>0?this.stroke:2});
  aShape._id = id;
  aShape.isLine = function() { return true; }
  aShape.toString = function() { return '[HTMLShape # Line: '+this._id+']'; }
  this.connectEvents();
  this.shapes[id] = aShape;
  return aShape;
}

HTMLShape.prototype.ARROW_FROM = -1;
HTMLShape.prototype.ARROW_TO = 1;

HTMLShape.prototype.getIntersectionPoint = function(fromShape, toShape, directionType) {
  if (directionType == this.ARROW_FROM) {
    var aux = fromShape;
    fromShape = toShape;
    toShape = aux;
  }

  // Definição do ponto médio do objeto de origem
  var x1 = fromShape.getX() + fromShape.getWidth()/2;
  var y1 = fromShape.getY() + fromShape.getHeight()/2;

  // Definição da largura e altura do objeto de destino
  var w = toShape.getWidth();
  var h = toShape.getHeight();

  // Definição do ponto médio do objeto para onde deve-se apontar
  var x2 = toShape.getX() + w/2;
  var y2 = toShape.getY() + h/2;

  var r = this.ARROW_RADIX;
  var a = 0;
  var b = 0;

  var xt1 = 0;
  var yt1 = 0;
  var xt2 = 0;
  var yt2 = 0;
  var xt3 = 0;
  var yt3 = 0;

  var ms = null;
  var ns = null;
  var mr = null;
  var nr = null;

  if (toShape.isRect() || toShape.isBalloon() || toShape.isSubRule() || toShape.isComment()) {
    // Definição das coordenadas do ponto onde a cabeça da seta estará apontando
    var xa = 0;
    var ya = 0;

    // Definição da coordenada X do segmento esquerdo do retângulo
    var xe = x2 - (w/2);

    // Definição da coordenada X do segmento direito do retângulo
    var xd = x2 + (w/2);

    // Definição da coordenada Y do segmento inferior do retângulo
    var yi = y2 - (h/2);

    // Definição da coordenada Y do segmento superior do retângulo
    var ys = y2 + (h/2);

    // Variável auxiliar que conterá a menor distância encontrada entre as intersecções com a reta principal
    var min = Number.MAX_VALUE;

    // ##### Calcula a distância entre o ponto P0 e a intersecção com o segmento esquerdo do retângulo

    // Definição da coordenada Y do segmento esquerdo do retângulo
    var ye = ((y2-y1)/(x2-x1))*xe + ((x2*y1-x1*y2)/(x2-x1));

    // Definição da variável que conterá o quadrado da distância entre o ponto P1 (vide documentação) da reta principal
    // e o segmento esquerdo do retângulo
    var de2 = null;
    if (ye <= ys && ye >= yi)
      de2 = Math.pow(x1-xe, 2) + Math.pow(y1-ye, 2);

    // Se a distância for menor que a distância mínima, então assume-se como a menor distância (variável min) e
    // atribui-se as coordenadas x e y como coordenadas da ponta da seta
    if (de2 && de2 < min) {
      xa = xe;
      ya = ye;
      min = de2;
    }

    // ##### Calcula a distância entre o ponto P0 e a intersecção com o segmento superior do retângulo

    // Definição da coordenada X do segmento superior do retângulo
    var xs = ((ys*(x2-x1)) + (x1*y2 - x2*y1)) / (y2-y1);

    // Definição da variável que conterá o quadrado da distância entre o ponto P1 (vide documentação) da reta principal
    // e o segmento superior do retângulo
    var ds2 = null;
    if (xs <= xd && xs >= xe)
      ds2 = Math.pow(x1-xs, 2) + Math.pow(y1-ys, 2);

    // Se a distância for menor que a distância mínima, então assume-se como a menor distância (variável min) e
    // atribui-se as coordenadas x e y como coordenadas da ponta da seta
    if (ds2 && ds2 < min) {
      xa = xs;
      ya = ys;
      min = ds2;
    }

    // ##### Calcula a distância entre o ponto P0 e a intersecção com o segmento direito do retângulo

    // Definição da coordenada Y do segmento direito do retângulo
    var yd = (xd*((y2-y1)/(x2-x1))) + ((x2*y1-x1*y2)/(x2-x1))

    // Definição da variável que conterá o quadrado da distância entre o ponto P1 (vide documentação) da reta principal
    // e o segmento direito do retângulo
    var dd2 = null;
    if (yd <= ys && yd >= yi)
      dd2 = Math.pow(x1-xd, 2) + Math.pow(y1-yd, 2);

    // Se a distância for menor que a distância mínima, então assume-se como a menor distância (variável min) e
    // atribui-se as coordenadas x e y como coordenadas da ponta da seta
    if (dd2 && dd2 < min) {
      xa = xd;
      ya = yd;
      min = dd2;
    }

    // ##### Calcula a distância entre o ponto P0 e a intersecção com o segmento inferior do retângulo

    // Definição da coordenada X do segmento inferior do retângulo
    var xi = ((yi*(x2-x1)) + (x1*y2 - x2*y1)) / (y2-y1);

    // Definição da variável que conterá o quadrado da distância entre o ponto P1 (vide documentação) da reta principal
    // e o segmento inferior do retângulo
    var di2 = null;
    if (xi <= xd && xi >= xe)
      di2 = Math.pow(x1-xi, 2) + Math.pow(y1-yi, 2);

    // Se a distância for menor que a distância mínima, então assume-se como a menor distância (variável min) e
    // atribui-se as coordenadas x e y como coordenadas da ponta da seta
    if (di2 && di2 < min) {
      xa = xi;
      ya = yi;
      min = di2;
    }

    // Cálculo do coeficiente angular da reta principal
    var mr = (y2-y1)/(x2-x1);

    // Cálculo do coeficiente linear da reta pricipal
    var nr = ((x2*y1)-(x1*y2))/(x2-x1);

    // Caso o objeto para onde deve-se apontar a seta seja um comentário, então tem-se um tratamento especial
    // A lógica utilizada abaixo é a mesma usada nos cálculos acima
    // Restrição:
    // 1. A posição X da ponta da seta deve ser maior ou igual à posição X do segmento esquerdo do retângulo
    // 2. A posição X da ponta da seta deve ser menor ou igual à posição X do segmento esquerdo do retângulo mais o raio da quina do objeto Comment
    // 3. A posição Y da ponta da seta deve ser maior ou igual à posição Y do segmento inferior do retângulo
    // 4. A posição Y da ponta da seta deve ser menor ou igual à posição Y do segmento inferior do retângulo mais o raio da quina do objeto Comment
    if (toShape.isComment() && xa >= xe && xa <= (xe+this.COMMENT_RADIX) && ya >= yi && ya <= (yi+this.COMMENT_RADIX)) {
      var x = (yi+xe+this.COMMENT_RADIX-nr) / (mr+1);
      var y = (mr*x)+nr;

      var d2 = null;
      if (x >= xe && x <= (xe+this.COMMENT_RADIX) && y >= yi && y <= (yi+this.COMMENT_RADIX))
        d2 = Math.pow(x1-x, 2) + Math.pow(y1-y, 2);

      xa = x;
      ya = y;
      min = d2;
    }

    if (toShape.isBalloon() ) {
      var min = Number.MAX_VALUE;
      var tempX = 0;
      var tempY = 0;
      var radix = this.BALLOON_RADIX;

      var za = 0;
      var zb = 0;
      var zc = 0;
      var zd = 0;

      var bxa = x2-(w/2)+radix;
      var bya = y2+(h/2);
      var bxb = x2+(w/2)-radix;
      var bxc = x2+(w/2);
      var byc = y2+(h/2)-radix;
      var byd = y2-(h/2)+radix;
      var bye = y2-(h/2);
      var bxh = x2-(w/2);

      if (x1 == x2) {
        xt3 = x2;
        yt3 = (y2 >= y1) ? y2-(h/2) : y2+(h/2);

        a = x2;
        b = (y2 >= y1) ? yt3-r : yt3+r;
      } else {
        var mr = (y2-y1)/(x2-x1);
        var nr = ((x2*y1)-(x1*y2))/(x2-x1);

        // Para lambda1 temos:
        za = 1+(mr*mr);
        zb = 2*((mr*nr)-bxa-(byc*mr));
        zc = (bxa*bxa)+(byc*byc)+(nr*nr)-(radix*radix)-(2*byc*nr);
        zd = (zb*zb)-(4*za*zc);

        tempX = (-zb+Math.sqrt(zd))/(2*za);
        tempY = (mr*tempX)+nr;

        var dlambda11 = null;
        if (tempX <= bxa && tempX >= (bxa-radix) && tempY <= bya && tempY >= byc) {
          dlambda11 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
        }

        if (dlambda11 && dlambda11 < min) {
          xa = tempX;
          ya = tempY;
          min = dlambda11;
        }

        tempX = (-zb-Math.sqrt(zd))/(2*za);
        tempY = (mr*tempX)+nr;

        var dlambda12 = null;
        if (tempX <= bxa && tempX >= (bxa-radix) && tempY <= bya && tempY >= byc) {
          dlambda12 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
        }

        if (dlambda12 && dlambda12 < min) {
          xa = tempX;
          ya = tempY;
          min = dlambda12;
        }

        // Para lambda2 temos:
        za = 1+(mr*mr);
        zb = 2*((mr*nr)-bxb-(byc*mr));
        zc = (bxb*bxb)+(byc*byc)+(nr*nr)-(radix*radix)-(2*byc*nr);
        zd = (zb*zb)-(4*za*zc);

        tempX = (-zb+Math.sqrt(zd))/(2*za);
        tempY = (mr*tempX)+nr;

        var dlambda21 = null;
        if (tempX <= bxc && tempX >= bxb && tempY <= bya && tempY >= byc) {
          dlambda21 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
        }

        if (dlambda21 && dlambda21 < min) {
          xa = tempX;
          ya = tempY;
          min = dlambda21;
        }

        tempX = (-zb-Math.sqrt(zd))/(2*za);
        tempY = (mr*tempX)+nr;

        var dlambda22 = null;
        if (tempX <= bxc && tempX >= bxb && tempY <= bya && tempY >= byc) {
          dlambda22 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
        }

        if (dlambda22 && dlambda22 < min) {
          xa = tempX;
          ya = tempY;
          min = dlambda22;
        }

        // Para lambda3 temos:
        za = 1+(mr*mr);
        zb = 2*((mr*nr)-bxb-(byd*mr));
        zc = (bxb*bxb)+(byd*byd)+(nr*nr)-(radix*radix)-(2*byd*nr);
        zd = (zb*zb)-(4*za*zc);

        tempX = (-zb+Math.sqrt(zd))/(2*za);
        tempY = (mr*tempX)+nr;

        var dlambda31 = null;
        if (tempX <= bxc && tempX >= bxb && tempY <= byd && tempY >= bye) {
          dlambda31 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
        }

        if (dlambda31 && dlambda31 < min) {
          xa = tempX;
          ya = tempY;
          min = dlambda31;
        }

        tempX = (-zb-Math.sqrt(zd))/(2*za);
        tempY = (mr*tempX)+nr;

        var dlambda32 = null;
        if (tempX <= bxc && tempX >= bxb && tempY <= byd && tempY >= bye) {
          dlambda32 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
        }

        if (dlambda32 && dlambda32 < min) {
          xa = tempX;
          ya = tempY;
          min = dlambda32;
        }

        // Para lambda4 temos:
        za = 1+(mr*mr);
        zb = 2*((mr*nr)-bxa-(byd*mr));
        zc = (bxa*bxa)+(byd*byd)+(nr*nr)-(radix*radix)-(2*byd*nr);
        zd = (zb*zb)-(4*za*zc);

        tempX = (-zb+Math.sqrt(zd))/(2*za);
        tempY = (mr*tempX)+nr;

        var dlambda41 = null;
        if (tempX <= bxa && tempX >= bxh && tempY <= byd && tempY >= bye) {
          dlambda41 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
        }

        if (dlambda41 && dlambda41 < min) {
          xa = tempX;
          ya = tempY;
          min = dlambda41;
        }

        tempX = (-zb-Math.sqrt(zd))/(2*za);
        tempY = (mr*tempX)+nr;

        var dlambda42 = null;
        if (tempX <= bxa && tempX >= bxh && tempY <= byd && tempY >= bye) {
          dlambda42 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
        }

        if (dlambda42 && dlambda42 < min) {
          xa = tempX;
          ya = tempY;
          min = dlambda42;
        }

        //
        var dp1p2 = Math.abs(Math.sqrt(Math.pow(x1-xa,2)+Math.pow(y1-ya,2)));
        var ni = (r*(xa-x1))/dp1p2;

        a = xa - ni;
        b = (mr*a)+nr;

        xt3 = xa;
        yt3 = ya;

        ns = b + (a/mr);
      }
    }

    var dp1p2 = Math.abs(Math.sqrt(Math.pow(x1-xa,2)+Math.pow(y1-ya,2)));
    var ni = (r*(xa-x1))/dp1p2;

    if (x1 == x2) {
      a = x2;
      b = (y2 >= y1) ? ya-r : ya+r;
    } else {
      a = xa - ni;
      b = (mr*a)+nr;

      xt3 = xa;
      yt3 = ya;

      ns = b + (a/mr);
    }
  } else if (toShape.isCircle() || toShape.isEndCircle()) {
    var min = Number.MAX_VALUE;
    var tempX = 0;
    var tempY = 0;
    var dd2 = 0;
    var radix = w/2;

    if (x1 == x2) {
      xt3 = x2;
      yt3 = (y2 >= y1) ? y2-radix : y2+radix;

      a = x2;
      b = (y2 >= y1) ? yt3-r : yt3+r;
    } else {
      var mr = (y2-y1)/(x2-x1);
      var nr = ((x2*y1)-(x1*y2))/(x2-x1);

      var za = 1+(mr*mr);
      var zb = 2*((mr*nr)-x2-(y2*mr));
      var zc = (x2*x2)+(nr*nr)+(y2*y2)-(radix*radix)-(2*y2*nr);
      var zd = (zb*zb)-(4*za*zc);

      tempX = (-zb+Math.sqrt(zd))/(2*za);
      tempY = (mr*tempX)+nr;

      dd2 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
      if (dd2 && dd2 < min) {
        xa = tempX;
        ya = tempY;
        min = dd2;
      }

      //
      tempX = (-zb-Math.sqrt(zd))/(2*za);
      tempY = (mr*tempX)+nr;

      dd2 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);
      if (dd2 && dd2 < min) {
        xa = tempX;
        ya = tempY;
        min = dd2;
      }

      var dp1p2 = Math.abs(Math.sqrt(Math.pow(x1-xa,2)+Math.pow(y1-ya,2)));
      var ni = (r*(xa-x1))/dp1p2;

      a = xa - ni;
      b = (mr*a)+nr;

      xt3 = xa;
      yt3 = ya;

      ns = b + (a/mr);
    }
  } else if (toShape.isDiamond()) {
    w += 2*this.stroke;
    h += 2*this.stroke;

    var xa = 0;
    var ya = 0;

    // ### Definição das coordenadas das extremidades do loasango ABCD (vide documentação)
    var xpa = x2;
    var ypa = y2 + (h/2);
    var xpb = x2 + (w/2);
    var ypb = y2;
    var xpc = x2;
    var ypc = y2 - (h/2);
    var xpd = x2 - (w/2);
    var ypd = y2;

    var min = Number.MAX_VALUE;
    var tempX = 0;
    var tempY = 0;

    var mr = (y2-y1)/(x2-x1);
    var nr = ((x2*y1)-(x1*y2))/(x2-x1);

    // Cálculo da abscissa da extremidade da seta a partir do segmento DA (vide documentação)
    tempX = (y2+(h/2)-((h*x2)/w)-nr)/(mr-(h/w));

    // Cálculo da ordenada da extremidade da seta a partir do segmento DA (vide documentação)
    tempY = mr*tempX + nr;

    // Cálculo da distância entre P1 (vide documentação) e a extremidade da seta
    var dda2 = null;
    if (tempY <= ypa && tempY >= ypd && tempX <= x2 && tempX >= xpd)
      dda2 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);

    if (dda2 && dda2 < min) {
      xa = tempX;
      ya = tempY;
      min = dda2;
    }

    // Cálculo da abscissa da extremidade da seta a partir do segmento AB (vide documentação)
    tempX = (((h*x2)/w)+y2+(h/2)-nr)/(mr+(h/w));

    // Cálculo da ordenada da extremidade da seta a partir do segmento AB (vide documentação)
    tempY = mr*tempX + nr;

    // Cálculo da distância entre P1 (vide documentação) e a extremidade da seta
    var ddb2 = null;
    if (tempY <= ypa && tempY >= ypb && tempX <= xpb && tempX >= x2)
      ddb2 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);

    if (ddb2 && ddb2 < min) {
      xa = tempX;
      ya = tempY;
      min = ddb2;
    }

    // Cálculo da abscissa da extremidade da seta a partir do segmento BC (vide documentação)
    tempX = (y2-(h/2)-((h*x2)/w)-nr)/(mr-(h/w));

    // Cálculo da ordenada da extremidade da seta a partir do segmento BC (vide documentação)
    tempY = mr*tempX + nr;

    // Cálculo da distância entre P1 (vide documentação) e a extremidade da seta
    var ddc2 = null;
    if (tempY <= ypb && tempY >= ypc && tempX <= xpb && tempX >= x2)
      ddc2 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);

    if (ddc2 && ddc2 < min) {
      xa = tempX;
      ya = tempY;
      min = ddc2;
    }

    // Cálculo da abscissa da extremidade da seta a partir do segmento CD (vide documentação)
    tempX = (((h*x2)/w)+y2-(h/2)-nr)/(mr+(h/w));

    // Cálculo da ordenada da extremidade da seta a partir do segmento CD (vide documentação)
    tempY = mr*tempX + nr;

    // Cálculo da distância entre P1 (vide documentação) e a extremidade da seta
    var ddd2 = null;
    if (tempY <= ypd && tempY >= ypc && tempX <= x2 && tempX >= xpd)
      ddd2 = Math.pow(x1-tempX, 2) + Math.pow(y1-tempY, 2);

    if (ddd2 && ddd2 < min) {
      xa = tempX;
      ya = tempY;
      min = ddd2;
    }

    // Calcula-se a distância entre o ponto P1 e P2 (extremidades do segmento - vide documentação)
    var dp1p2 = Math.abs(Math.sqrt(Math.pow(x1-xa,2)+Math.pow(y1-ya,2)));

    // Define-se o diferencial de abscissa (variação entre a e xa - vide documentação)
    var ni = (r*(xa-x1))/dp1p2;

    if (x1 == x2) {
      xt3 = x2;
      yt3 = (y2 >= y1) ? y2-(h/2) : y2+(h/2);

      a = x2;
      b = (y2 >= y1) ? yt3-r : yt3+r;
    } else {
      a = xa - ni;
      b = (mr*a)+nr;

      xt3 = xa;
      yt3 = ya;

      ns = b + (a/mr);
    }

  } else {
    a = (x1+x2)/2;
    b = (y1+y2)/2;
  }

  // Caso a linha esteja sobre um dos eixos, o tratamento é específico
  if (x1 == x2 || y1 == y2) {

    if (x1 == x2) {

      if (directionType != this.ARROW_FROM) {
        xt1 = (a - r);
        yt1 = b;

        xt2 = a + r;
        yt2 = b;
      }

      xt3 = a;
      yt3 = (y2 >= y1) ? b + r : b - r;

    } else if (y1 == y2) {

      if (directionType != this.ARROW_FROM) {
        xt1 = a;
        yt1 = y1 + r;

        xt2 = a;
        yt2 = b - r;
      }

      xt3 = (x2 >= x1) ? a+r : a-r;
      yt3 = b;

    }

  } else {

    ms = (x2-x1)/(y1-y2);
    if (!ns) ns = ((y1+y2)/2) - ((x1+x2)/2)*((x2-x1)/(y1-y2));
    mr = (y2-y1)/(x2-x1);
    nr = ((x2*y1)-(x1*y2))/(x2-x1);

    var delta1 = Math.pow(((ms*ns)-a-(b*ms)),2);
    var delta2 = (Math.pow(ms,2)+1)*(Math.pow(a,2)+Math.pow(b,2)+Math.pow(ns,2)-(2*b*ns)-Math.pow(r,2));
    var deltaRaiz  = Math.sqrt(delta1-delta2);

    if (directionType != this.ARROW_FROM) {
      xt1 = (a + (ms*(b-ns)) + deltaRaiz) / (Math.pow(ms,2) + 1);
      xt2 = (a + (ms*(b-ns)) - deltaRaiz) / (Math.pow(ms,2) + 1);

      yt1 = (ms*xt1) + ns;
      yt2 = (ms*xt2) + ns;
    }

    delta1 = Math.pow(((mr*nr)-a-(b*mr)),2);
    delta2 = (Math.pow(mr,2)+1)*(Math.pow(a,2)+Math.pow(b,2)+Math.pow(nr,2)-(2*b*nr)-Math.pow(r,2));
    deltaRaiz  = Math.sqrt(delta1-delta2);

    if (!toShape && x2 <= x1) {
      xt3 = (a + (mr*(b-nr)) - deltaRaiz) / (Math.pow(mr,2) + 1);
      yt3 = (mr*xt3) + nr;
    }

    if (!xt3) xt3 = (a + (mr*(b-nr)) + deltaRaiz) / (Math.pow(mr,2) + 1);
    if (!yt3) yt3 = (mr*xt3) + nr;

  }

  return [{x:xt1,y:yt1}, {x:xt2,y:yt2}, {x:xt3,y:yt3}, {x:xt1,y:yt1}];
}

HTMLShape.prototype.getArrowPoints = function(fromShape, toShape) {
  var fromObj = this.getIntersectionPoint(fromShape, toShape, this.ARROW_FROM);
  var toObj = this.getIntersectionPoint(fromShape, toShape, this.ARROW_TO);

  return [fromObj, toObj];
}

HTMLShape.prototype.drawArrowLine = function(id, fromShape, toShape, text) {
  var intersectionPoints = this.getArrowPoints(fromShape, toShape);
  var fromIntersection = intersectionPoints[0];
  var toIntersection = intersectionPoints[1];

  var x1 = fromIntersection[2].x;
  var y1 = fromIntersection[2].y;

  var x2 = toIntersection[2].x;
  var y2 = toIntersection[2].y;

  var aShape = this.surface.createLine({x1: x1, y1: y1, x2: x2, y2: y2});
  aShape.setStroke({color: this.color, width: this.stroke ? this.stroke : 1});
  this.connectEvents();
  this.shapes[id] = aShape;

  var arrow = this.surface.createPolyline(toIntersection);
  if (this.stroke) arrow.setStroke({color: this.color, width: this.stroke});
  arrow.setFill(this.bgColor);

  aShape._id = id;
  aShape.getId = function() { return this._id; }

  aShape.toString = function() { return '[HTMLShape # ArrowLine: '+this._id+']'; }

  aShape.attachEvent = this.attachEvent;

  aShape.arrow = arrow;

  aShape._fromShape = fromShape;
  aShape._toShape = toShape;
  aShape._div = this.div;

  aShape.fromIntersection = fromIntersection;
  aShape.toIntersection = toIntersection;

  aShape.isArrowLine = function() { return true; }

  aShape.setText = function(text) {
    if (text) {
      if (this.textDiv) {
        this._div.removeChild(this.textDiv);
        this.textDiv = null;
      }

      var x1 = fromIntersection[2].x;
      var y1 = fromIntersection[2].y;
      var x2 = toIntersection[2].x;
      var y2 = toIntersection[2].y;

      var cx = (x2 + x1) / 2;
      var cy = (y2 + y1) / 2;

      var textDiv = getTextDiv(text, cx, cy);
      this._div.appendChild(textDiv);
      this.textDiv = textDiv;

      this.moveText = function(x1, y1, x2, y2) {
        var w = this.textDiv.firstChild.offsetWidth;
        var h = this.textDiv.firstChild.offsetHeight;

        var mr = (y2-y1)/(x2-x1);

        var eixoy = parseInt(x1) == parseInt(x2);
        var eixox = parseInt(y1) == parseInt(y2);

        var cx;
        var cy;

        if (eixoy) {
          cx = x1+2;
          cy = ((y1+y2)/2) - (h/2);
          mr = 0;
        } else if (eixox) {
          cx = ((x1+x2)/2) - (w/2);
          cy = y1+2;
        } else {
          if (mr < 0) {
            cx = ((x1+x2)/2);
            cy = ((y1+y2)/2);
          } else if (mr > 0) {
            cy = ((y1+y2)/2) - h;
            cx = ((x1+x2)/2);
          }
        }

        // (+5) Afastamento do texto realtivo à reta r (principal)
        this.textDiv.style.left = cx+'px';
        this.textDiv.style.top = cy+'px';
      }

      this.moveText(x1, y1, x2, y2);

    }
  }

  aShape.setText(text);

  aShape.free = this.getActionFunction(this.freeArrowLineAction, [aShape]);

  dojo.connect(aShape.getEventSource(), "onmouseover", aShape, this.getActionFunction(this.onMouseOverArrowLine, [aShape]));
  dojo.connect(aShape.getEventSource(), "onmouseout", aShape, this.getActionFunction(this.onMouseOutArrowLine, [aShape]));
  dojo.connect(aShape.getEventSource(), "onclick", aShape, this.getActionFunction(this.onClickArrowLine, [aShape]));
  return aShape;
}

HTMLShape.prototype.freeArrowLineAction = function(e, shape) {
  this.clean(shape);
}

HTMLShape.prototype.onMouseOverArrowLine = function(e, shape) {
  shape.setStroke({color: '#FF0000', width: 3});
}

HTMLShape.prototype.onMouseOutArrowLine = function(e, shape) {
  if (this.selectedArrowLine != shape)
    shape.setStroke({color: this.color, width: this.stroke});
}

HTMLShape.prototype.onClickArrowLine = function(e, shape) {
  if (this.selectedArrowLine)
    this.selectedArrowLine.setStroke({color: this.color, width: this.stroke});

  this.selectedArrowLine = shape;
  shape.setStroke({color: '#FF0000', width: 3});

  this.attachEvent(document, 'mousedown', this.unSelectArrowLine, this, [shape]);

  controller.setSelectedComponent(shape);
}

HTMLShape.prototype.unSelectArrowLine = function(e, o, shape) {
  this.removeEvent(document, 'mousedown');
  this.selectedArrowLine.setStroke({color: this.color, width: this.stroke});
  this.selectedArrowLine = null;
  controller.setSelectedComponent(null);
//  alert(shape);
  //this.removeEvent(document, 'mousedown');
}

HTMLShape.prototype.drawPolyline = function(id, shape) {
  var aShape = this.surface.createPolyline(shape);
  if (this.stroke) aShape.setStroke({color: this.color, width: this.stroke});
  aShape.setFill(this.bgColor);
  this.connectEvents();
  this.shapes[id] = aShape;
  return aShape;
}

HTMLShape.prototype.connectEvents = function(aShape) {
  if (aShape) {
    dojo.event.connect(aShape.getEventSource(), "ondblclick", this.getActionFunction(this.ondblclick));
    dojo.event.connect(aShape.getEventSource(), "onclick", this.getActionFunction(this.onclick));
    dojo.event.connect(aShape.getEventSource(), "onmouseover", this.getActionFunction(this.onmouseover));
    dojo.event.connect(aShape.getEventSource(), "onmouseout", this.getActionFunction(this.onmouseout));
  }
}

HTMLShape.prototype.move = function(obj, attributes) {
  var shape;
  if (typeof obj == "string") {
    shape = this.getShape(obj);
  } else {
    shape = obj;
  }

  if (shape) {
    shape.setShape(attributes);
  }

  return shape;
}

HTMLShape.prototype.moveCircle = function(name, x, y) {
  this.move(name, {cx: x, cy: y});
}

HTMLShape.prototype.movePolyline = function(name, shape) {
  this.move(name, shape);
}

HTMLShape.prototype.moveLine = function(name, x1, y1, x2, y2) {
  this.move(name, [{x: x1, y: y1}, {x: x2, y: y2}]);
}

HTMLShape.prototype.moveArrowLine = function(name, fromShape, toShape) {
  var intersectionPoints = this.getArrowPoints(fromShape, toShape);
  var fromIntersection = intersectionPoints[0];
  var toIntersection = intersectionPoints[1];

  var x1 = fromIntersection[2].x;
  var y1 = fromIntersection[2].y;

  var x2 = toIntersection[2].x;
  var y2 = toIntersection[2].y;

  var tempShape = this.move(name, {x1: x1, y1: y1, x2: x2, y2: y2});
  tempShape.arrow.setShape(toIntersection);

  if (tempShape.textDiv)
    tempShape.moveText(x1, y1, x2, y2);
}

HTMLShape.prototype.getSurface = function() {
  return this.surface;
}

HTMLShape.prototype.clean = function(name) {
  var shape = typeof(name)=='string'?this.getShape(name):name;
  if (shape) {
    if (shape.ondelete)
      shape.ondelete.call(this, null);

    this.surface.remove(shape);
    this.shapes[name] = null;
    if (shape.arrow)
      this.surface.remove(shape.arrow);
    if (shape.textDiv)
      shape.textDiv.parentNode.removeChild(shape.textDiv);
  }
}

HTMLShape.prototype.getShape = function(id) {
  return this.shapes[id];
}

HTMLShape.prototype.getId = function() {
  if (this.isArrowLine) {
    return this._id;
  } else {
    return this.id;
  }
}

HTMLShape.prototype.focus = function() { return false; }

HTMLShape.prototype.blur = function() { return false; }
