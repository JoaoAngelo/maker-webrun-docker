
var legendSummary = {
  1 : "left",
  2 : "right",
  3 : "top",
  4 : "bottom"
}

/**
 * Método construtor do HTMLChart. Responsável por criar o componente Gráfico.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - ALtura do componente.
 * @param alt - hint/title da imagem do grafico.
 * @param value
 **/
function HTMLChart(sys, formID, code, posX, posY, width, height, alt, value) {
  this.create(sys, formID, code, posX, posY, width, height, '', value);
  this.report = false;
  this.alt = alt;
  this.viewMode = "Estender";
  this.url="";
  this.hasImage = true;
  this.legendSeries = [];
}

/**
 * Propriedades do Gráfico.
 **/
HTMLChart.inherits(HTMLElementBase);
HTMLChart.prototype.name = 'HTMLChart';
HTMLChart.prototype.tabable = false;
HTMLChart.prototype.zindex = 2;

/**
 * Seta a Url da imagem gerada pra o Gráfico.
 * @param url - endereço da imagem gerada.
 **/
HTMLChart.prototype.setUrl = function(url){
  this.url = url;
  this.context.innerHTML = "";

  var actionClick = null;
  if (this.onclick) {
    actionClick = this.getAction('doOnClick');
  }

  this.img = new ImageObject().getImage(this.url, this.alt, actionClick, this.height, this.width);
  this.context.appendChild(this.img);
}


HTMLChart.prototype.setHint = function(hint) {
    this.callMethod(HTMLElementBase, "setHint", [hint]);

    if (this.img) {
     this.img.alt = hint;
     this.img.title = hint;
    }
}

/**
 * Resposável por criar o HTMLChart onde será renderizado o gráfico.
 * @author Marcos
 **/
HTMLChart.prototype.designComponent = function() {
  this.div.className += ' fixed-height';
  this.divClass = this.div.className;

  var obj = this;

  //Cria div do gráfico
  this.table = document.createElement("div");
  this.table.className = "h-100 w-100";

  //Anexa a div do gráfico ao contexto
  this.context.appendChild(this.table);

  //Inicia plotagem
  this.myChart = echarts.init(this.table);

  //Processa séries
  this.processSeries();

  //Processa e obtém o options
  this.option = this.processOption();

  //Define propriedades do gráfico
  if (this.option && typeof this.option === "object") {
    this.myChart.setOption(this.option, true);
  }

  if(this.onclick){
    this.myChart.on('click', function(){
      var values = arguments[0];
      obj.onclick.apply(obj, [values.seriesName, values.name, values.value]);
    });
  }

  /*Adiciona evento de resize para cada componente independente, caso o elemento em questão não exista
  * o método de resize vai charmar o resize de todos os elementos(HTMLChart) na aba corrente.
  */
  if (!this.resizeEventSet) {
    mainform.addEventListener("resize", function() {
      if (obj) chartResize(obj.div);
    }, false);
    this.resizeEventSet = true;
  }

  if (this.doc.tab) {
    // Adicionar callback na aba quando ela for exibida.
    this.doc.tab.addShownListener(function() {
      chartResize(obj.div);
    });
  }

  /*Torna o processo de resize assíncrono por conta dos formulários que são 
  * abertos em uma Moldura
  */
  setTimeout(chartResize, 1);
  
}

function chartResize(element) {
  let chartsTab = element ? [element] : d.t.getSelectedTab().div.querySelectorAll("[webrun-type='HTMLChart']");
  for (let i = 0; i < chartsTab.length; i++) {
    chart = $c(chartsTab[i].id);
    if (chart === undefined || chart === null) continue;
    chart.myChart.resize();
  }
  return false;
};

HTMLChart.prototype.doOnClick = function() {
  if (this.onclick) {
    this.onclick.call(this);
  }
}

HTMLChart.prototype.getPermissionDescription = function() {
  if (!isNullable(this.permissionDescription)) {
    return this.permissionDescription;
  }
  return this.callMethod(HTMLElementBase, "getPermissionDescription");
}

/**
 * Método responsável por realizar o processamento das séries
 * @author Marcos
 */
HTMLChart.prototype.processSeries = function(){

  for (let index = 0; index < this.series.length; index++) {
    const element = this.series[index];

    element.color = element.randomColor ? null : element.color;
    element.type = element.type.replace("h", "");

    if(element.type === 'area'){
      element.type = element.type.replace("area", "line");
      element.areaStyle = {};
    }

    if(element.disposition){
      element.stack = element.disposition == 2 ? element.type : '';
    }

    if(element.showBrands && !(element.type === 'pie')){
      var tempLabel = element.label.concat();
      element.label = {
        data : tempLabel,
        normal : {
          show: true,
          position: 'inside',
          formatter: function(params) {
            return getLabelTextBrands(params, element);
          }
        }
      };
    }

    if(element.showLegend && !(element.type === 'pie')){
      this.legendSeries.push(element.name);
    }

    if(element.matriz){
      element.data = element.data.sort(function(a, b) {
        return parseFloat(a.value[0]) - parseFloat(b.value[0]);
      });
    }

    this.series[index] = element;
  }

}

/**
 * Método responsável por realizar o processamento do option
 * @author Marcos
 */
HTMLChart.prototype.processOption = function(){
  var option = null;
  var obj = this;
  var serie = this.series[0];

  if(serie.type === 'pie'){
    option = this.getOptionByType(serie.type);

    option.legend.data = serie.label;

    option.legend.formatter = function(name) {
      return getLabelTextLegend(name, serie, obj);
    }

    if(serie.largestSliceDistance && serie.data.length > 0){
      let i = Math.max.apply(Math, serie.data.map(function(o, i) { return i; }));
      serie.data[i].selected = true;
    }

    //Exibe marcas se necessário
    if(serie.showBrands){
      delete serie.label;

      //Formatação das marcas
      serie.label = {};
      serie.label.formatter = function(params) {
        return getLabelTextBrands(params, serie);
      };
    }
  } else {
    option = this.getOptionByType('multi');

    //Define visibilidade da Grade
    option.yAxis.splitLine = {show : this.showGrid};
    option.xAxis.splitLine = {show : this.showGrid};

    //Define visibilidade das legendas das séries
    option.legend.data = this.legendSeries;

    /*Reverva espaço para a renderização da legenda quando a mesma é na esquerda 
    * ou direita do componente
    */
    option.grid.left = this.legendPosition == 1 && this.showLegend 
    && this.legendOrientation.toLowerCase() != 'horizontal' ? '15%' : option.grid.left;
    option.grid.right = this.legendPosition == 2 && this.showLegend 
    && this.legendOrientation.toLowerCase() != 'horizontal' ? '15%' : option.grid.right;
    option.grid.top = (this.legendPosition == 1 || this.legendPosition == 3) && this.showLegend 
    && this.legendOrientation.toLowerCase() == 'horizontal' ? '28%' : '16%';
    option.grid.bottom = (this.legendPosition == 4 && this.showLegend) ? '20%' : '10%';
  }

  //Posição da legenda e visibilidade
  option.legend[legendSummary[this.legendPosition]] = 5;
  option.legend.show = this.showLegend;
  option.legend.orient = this.legendOrientation ? this.legendOrientation.toLowerCase() : 'horizontal';
  option.legend.type = 'scroll';
  option.legend.top = this.legendPosition <= 3 ? '10%' : null;

  //Define propriedade do tooltip
  if(this.groupLegend){
    option.tooltip.trigger = serie.type === 'pie' ? 'item' : 'axis';
  }

  if(!this.showTooltip)
    option.tooltip.show = false;

  //Define título do gráfico
  option.title = {
    text: this.titulo,
    subtext: '',
    left: 'center'
  };

  this.series[0] = serie;

  if(!option.series)
    option.series = this.series;

  return option;
}

/**
 * Método responsável por realizar o processamento dos valores das marcas de acordo
 * com o que
 * foi definido nas séries
 * @param params parâmetros recebidos do componente ECharts
 * @param serie série a ser processada
 * @author Marcos
 */
function getLabelTextBrands(params, serie) {
  let data = serie.data;
  var name = params.name;
  var objSerie = serie;

  /***  Marks Style  ******
  LABEL                = 1;
  LABELPERCENT         = 2;
  LABELPERCENTTOTAL    = 3;
  LABELVALUE           = 4;
  LEGEND               = 5;
  PERCENT              = 6;
  PERCENTTOTAL         = 7;
  VALUE                = 8;
  XVALUE               = 9;
  XY                   = 10;
  *************************/

  var result  = data.find(function (x) {
    return x.name === name;
  }), valueX, valueY;
  if(serie.matriz){
    valueX = result.value[0];
    valueY = result.value[1]
  }else{
    valueX = serie.type === 'pie'
      ? data.findIndex(function (x) {
        return x.name === name;
      })
      : name;
    valueY = result.value;
  }

  if(objSerie.contentBrands == 1){ //Etiqueta
    return name;
  }else if(objSerie.contentBrands == 2){ //Etiqueta + Porcentagem
    return name + " " + getPercentByData(data, name, serie);
  }else if(objSerie.contentBrands == 3){ //Etiqueta + Porcentagem + Total
    return name + " " + getPercentByData(data, name, serie) + " " +
    data.map(function (item) {
      return item.value;
    }).reduce(function (prev, next) {
      return prev + next;
    });
  }else if(objSerie.contentBrands == 4){ //Etiqueta + Valor
    return name + " " + valueY.toFixed(serie.decimalPrecision);
  }else if(objSerie.contentBrands == 5){ //Legenda
    return data.findIndex(function (x) {
      return x.name === name;
    });
  }else if(objSerie.contentBrands == 6){ //Procentagem
    return getPercentByData(data, name, serie);
  }else if(objSerie.contentBrands == 7){ //Procentagem + Total
    return getPercentByData(data, name, serie) + " " +
    data.map(function (item) {
      return item.value;
    }).reduce(function (prev, next) {
      return prev + next;
    });
  }else if(objSerie.contentBrands == 8){ //Valor
    return valueY.toFixed(serie.decimalPrecision);
  }else if(objSerie.contentBrands == 9){ //Valor Eixo X
    return valueX.toFixed(serie.decimalPrecision);
  }else if(objSerie.contentBrands == 10){ //Valor Eixo X + Valor Eixo Y
    return valueX.toFixed(serie.decimalPrecision) + " " + valueY.toFixed(serie.decimalPrecision);
  }else{
    return name;
  }
};

/**
 * Método responsável por realizar o processamento dos valores da legenda de acordo
 * com o que foi definido nas no componente (Funciona apenas para gráfico do tipo Pizza)
 * @param name nome da série
 * @param serie série a ser processada
 * @param obj objeto this
 * @author Marcos
 */
function getLabelTextLegend(name, serie, obj) {
  let data = serie.data;

  /***  Marks Style  ******
  LABEL                = 1;
  LABELPERCENT         = 2;
  LABELPERCENTTOTAL    = 3;
  LABELVALUE           = 4;
  LEGEND               = 5;
  PERCENT              = 6;
  PERCENTTOTAL         = 7;
  VALUE                = 8;
  XVALUE               = 9;
  XY                   = 10;
  *************************/

  var valueX = data.findIndex(function (item) {
    return item.name === name;
  });

  if(obj.styleTextLegend == 1){ //Procentagem + Etiqueta
    return getPercentByData(data, name, serie) + " " + name;
  }else if(obj.styleTextLegend == 2){ //Valor + Etiqueta
    var result = data.filter(function (obj) {
      return obj.name === name ? obj.value : null
    });
    return result.length > 0 ? result[0].value.toFixed(serie.decimalPrecision) + " " + name : "";
  }else if(obj.styleTextLegend == 3){ //Procentagem
    return getPercentByData(data, name, serie);
  }else if(obj.styleTextLegend == 4){ //Etiqueta
    return name;
  }else if(obj.styleTextLegend == 5){ //Etiqueta + Porcentagem
    return name + " " + getPercentByData(data, name, serie);
  }else if(obj.styleTextLegend == 6){ //Etiqueta + Valor
    var result = data.filter(function (obj) {
      return obj.name === name ? obj.value : null
    });
    return result.length > 0 ? name + " " + result[0].value.toFixed(serie.decimalPrecision) : "";
  }else if(obj.styleTextLegend == 7){ //Valor
    var result = data.filter(function (obj) {
      return obj.name === name ? obj.value : null
    });
    return result.length > 0 ? result[0].value.toFixed(serie.decimalPrecision) : "";
  }else if(obj.styleTextLegend == 8){ //Valor Eixo X + Porcentagem

    return valueX + " " + getPercentByData(data, name, serie);
  }else if(obj.styleTextLegend == 9){ //Valor Eixo X + Valor
    var result = data.filter(function (obj) {
      return obj.name === name ? obj.value : null;
    });
    return result.length > 0 ? valueX + " " + result[0].value.toFixed(serie.decimalPrecision) : "";
  }else if(obj.styleTextLegend == 10){ //Valor Eixo X
    return valueX;
  }else{
    return name;
  }
};


/**
 * Método responsável por obter o cálculo de porcentagem baseado no atributo 'data'
 * recebido como parâmetro
 * @param data dados
 * @param name nome da série
 * @param serie objeto série
 * @author Marcos
 */
function getPercentByData(data, name, serie){
  var total = 0;
  var target;

  for (var i = 0, l = data.length; i < l; i++) {
    total += serie.matriz ? data[i].value[1] : data[i].value;
    if (data[i].name == name) {
      target = serie.matriz ? data[i].value[1] : data[i].value;
    }
  }
  var arr = [
    ((target/total)*100).toFixed(2)+'%'
  ]
  return arr.join('\n')
}

/**
 * Obter método de formatação das Axis do gráfico
 * @author Marcos
 */
HTMLChart.prototype.getAxisLabelFormat = function(){
  var element = this.series[0];
  if(element.matriz){
    return {
      formatter: function(value){
        var result = element.data.find(function (objData) {
          return objData.value[0] === value;
        });
        return result.name ? result.name : "" ;
      }
    }
  }else {
    return {}
  }
}

/**
 * Método que retorna a XAxis do gráfico
 * @author Marcos
 */
HTMLChart.prototype.getXAxis = function(){
  var element = this.series[0];
  var xAxis = {};
  if(element){
    if(element.horizontal){
      xAxis = {
        type : 'value',
      };
    } else{
      xAxis = {
        type : 'category',
        data : element.label.data ? element.label.data : element.label,
        axisLabel: this.getAxisLabelFormat()
      };
    }
  }

  if(element.matriz)
    delete xAxis.data;

  return xAxis;
}

/**
 * Método que retorna a YAxis do gráfico
 * @author Marcos
 */
HTMLChart.prototype.getYAxis = function(){
  var element = this.series[0];
  var yAxis;
  if(element){
    if(element.horizontal){
      yAxis = {
        type : 'category',
        data : element.label.data ? element.label.data : element.label,
        axisLabel: this.getAxisLabelFormat()
      };
    } else{
      yAxis = {
        type : 'value',
      };
    }
  }

  if(element.matriz)
    delete yAxis.data;

  return yAxis;
}

/**
 * Método que retorna o option do gráfico de acordo com o tipo
 * @param type {multi, pie}
 * @author Marcos
 */
HTMLChart.prototype.getOptionByType = function(type){
  if(type === 'multi')
    return {
      theme: 'light',
      tooltip : {  //TODO (Criar propriedade para visilidade e personalização do tooltip)
        axisPointer : {
          type : 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      legend: {
        selected: { //Propriedade que define se a série vai ser visível(momento de criação)
          //'Série 1' : false
        }
      },
      xAxis : this.getXAxis(),
      yAxis : this.getYAxis()
    };

    if(type === 'pie')
      return {
        theme: 'dark',
        tooltip : {  //TODO (Criar propriedade para visilidade e personalização do tooltip)
          axisPointer : {
            type : 'shadow'
          }
        },
        legend: {
          //type: 'scroll',
          //orient: 'vertical',
          //right: 10,
          //top: 20,
          //bottom: 20
        }
      };
}

HTMLChart.prototype.refreshChart = function(){
  this.processSeries();

  //Processa e obtém o options
  this.option = this.processOption();

  //Define propriedades do gráfico
  if (this.option && typeof this.option === "object") {
    this.myChart.setOption(this.option, true);
  }
}