var WIDTH_WINDOW = getWindowDimensions().width;
var DIMENSION_LAY = true;
var LIST_RESIZE_TABLE = [];

Function.prototype.method = function(name, func) {
  this.prototype[name] = func;
  return this;
};

Function.method('inherits', function(parent) {
  var sc = parent;
  var d = 0, p = (this.prototype = new parent());
  this.method('callMethod', function importMethod(sc, name) {
    if (arguments.length > 2) {
      return sc.prototype[name].apply(this, arguments[2]);
    } else {
      return sc.prototype[name].apply(this, []);
    }
  });

  this.method('superclass', function superclass(name) {
    var f, r, t = d,
      v = parent.prototype;
    if (t) {
      while (t) {
        v = v.constructor.prototype;
        t -= 1;
      }

      f = v[name];
    } else {
      f = p[name];
      if (f == this[name]) {
        f = v[name];
      }
    }

    d += 1;
    r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
    d -= 1;
    return r;
  });

  return this;
});

Function.method('swiss', function(parent) {
  for (var i = 1; i < arguments.length; i += 1) {
    var name = arguments[i];
    this.prototype[name] = parent.prototype[name];
  }

  return this;
});

String.prototype.trim = function() {
  return this.replace(/^\s*/, "").replace(/\s*$/, "");
};


function HTMLAction(func, owner, params) {
  this.func = func;
  this.owner = owner;
  this.params = params;
  this.isHTMLAction = true;
  if (!this.params) this.params = new Array();
}

HTMLAction.prototype.isEvent = function() { return true; };
HTMLAction.prototype.getFunction = function() { return this.func; };
HTMLAction.prototype.getOwner = function() { return this.owner; };
HTMLAction.prototype.getParams = function() { return this.params; };

HTMLAction.prototype.callAction = function() {
  this.func.apply(this.owner, Array.prototype.slice.apply(arguments, [1]));
};

HTMLAction.prototype.call = function() {
  var args = arrayConcat(arguments, this.params);
  return this.func.apply(this.owner, args);
};

HTMLAction.prototype.apply = function(o, p) {
  var args = arrayConcat(arrayConcat([o], p), this.params);
  return this.func.apply(this.owner, args);
};

HTMLAction.prototype.toString = function() {
  return '[HTMLAction]';
};

HTMLObject.prototype.getMaker = function() {
  return this.maker ? this.maker : this.maker = new HTMLMakerInfo(this);
};

function HTMLObject(sys, formID, code) {
  this.sys = sys;
  this.formID = formID;
  this.code = code;
}

HTMLObject.prototype.isObject = true;
HTMLObject.prototype.getSystem = function() { return this.sys; };
HTMLObject.prototype.getForm = function() { return this.formID; };
HTMLObject.prototype.getCode = function() { return this.code; };

HTMLObject.prototype.attachEvent = function(obj, type, fn, owner, params) {
  if (type.length > 2 && type.substring(0, 2) == 'on')
    type = type.substring(2, type.length);

  if (fn.isHTMLAction) {
    owner = fn.getOwner();
    if (fn.getParams().length > 0)
      params = fn.getParams();
    fn = fn.getFunction();
  }

  obj['event_on' + type] = fn;
  if (owner && owner.isRule) obj['on' + type] = associateRuleWithEvent(obj, 'event_on' + type, owner ? owner : this);
  else obj['on' + type] = associateObjWithEvent(obj, 'event_on' + type, owner ? owner : this, params);

  EventCache.add(obj, type, fn);
};

HTMLObject.prototype.removeEvent = function(obj, type) {
  obj['event_' + type] = null;
  obj['on' + type] = null;
};

HTMLObject.prototype.toString = function() {
  return '[HTMLObject]';
};

HTMLObject.prototype.checkPost = function() {
  return true;
};

HTMLObject.prototype.timeout = function(handler, delay, fparams) {
  var self = this;
  var params = fparams;
  var wrapper = function() {
    if (params) handler.apply(self, params);
    else handler.apply(self);
  };

  return window.setTimeout(wrapper, delay ? delay : 0);
};

HTMLObject.prototype.getAction = function(fun, params) {
  var f = typeof(fun) == "string" ? this[fun] : fun;
  return new HTMLAction(f, this, params);
};

HTMLObject.prototype.getActionFunction = function(fun, params) {
  var context = params;
  var owner = this;
  return function(e) {
    var paramscopy = new Array();
    paramscopy.push(e);
    if (params) paramscopy = paramscopy.concat(params);
    return fun.apply(owner, paramscopy);
  }
};

HTMLObject.prototype.flush = function() {
  this.doc = null;
  this.div = null;
};

HTMLObject.prototype.free = function() {
  if (this.doc && this.div)
    this.doc.removeChild(this.div);
  return this;
};

HTMLObject.prototype.loadScripts = function() {
  // Deve ser sobrecarregado
};

function getKey(evt) {
  if (!evt) evt = event;
  return evt.keyCode;
}

function checkKey(evt, o, keys) {
  if (!evt) evt = event;
  var altKey = false;
  var ctrlKey = false;
  var shiftKey = false;
  var target = evt.target || evt.srcElement;
  var r = true;

  if (w3c) {
    if (document.layers) {
      altKey = ((evt.modifiers & Event.ALT_MASK) > 0);
      ctrlKey = ((evt.modifiers & Event.CONTROL_MASK) > 0);
      shiftKey = ((evt.modifiers & Event.SHIFT_MASK) > 0);
    } else {
      altKey = evt.altKey;
      ctrlKey = evt.ctrlKey;
      shiftKey = evt.shiftKey;
    }
  } else {
    altKey = evt.altKey;
    ctrlKey = evt.ctrlKey;
    shiftKey = evt.shiftKey;
  }

  if (!altKey && !ctrlKey && o.enabled && !o.readonly && o.visible && evt.keyCode == 116) {
    if (o.onF5press) o.onF5press.call(o, evt);
    r = false;
  }

  if (!keys) keys = [13, 10, 9];

  if (!ctrlKey && !altKey && arrayIndexOf(keys, evt.keyCode) != -1) {
    if (!shiftKey) controller.next(o);
    else controller.next(o, true);
    r = false;
  } else {
    if (ctrlKey && (evt.keyCode == 10 || evt.keyCode == 13) && o.name == 'HTMLMemo') {
      o.input.value += '\n';
    }
  }

  if (!r) {
    if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
    } else {
      evt.keyCode = 0;
      evt.returnValue = false;
      evt.cancelBubble = true;
    }
    return false;
  } else return true;
}

function markField(obj, type, canSelectOnFocus) {
  if (obj && obj.style && type != 'a') {
    backaux = obj.style.backgroundColor;
    obj.style.backgroundColor = "";
    if (obj.select && canSelectOnFocus) obj.select();
  }
}

function unmarkField(obj, type, canSelectOnFocus) {
  if (obj && obj.style && type != 'a') {
    if (backaux != "") obj.style.backgroundColor = backaux;
    if (obj.unselect && canSelectOnFocus) obj.unselect();
  }
}

function findNode(node, name) {
  var r = null;
  var id = node.id || node.name;
  if (id == name) r = node;
  if (!r) {
    for (var i = 0; i < node.childNodes.length; i++) {
      r = findNode(node.childNodes.item(i), name);
      if (r) break;
    }
  }

  return r;
}

var TABLE = 0;
var CELLS = 1;
var ROWS = 2;

function getTable(rows, cols, width, height) {
  var start = new Date().getTime();
  var lines = new Array(rows);
  var cells = new Array(rows);
  var table = document.createElement("table");
  var tbody = document.createElement("tbody");

  table.appendChild(tbody);
  table.setAttribute('border', 0);
  table.setAttribute('cellSpacing', 0);
  table.setAttribute('cellPadding', 0);

  if (width) table.setAttribute('width', width);
  if (height) table.setAttribute('height', height);

  for (var i = 0; i < rows; i++) {
    cells[i] = new Array(cols);
    var tr = document.createElement("tr");
    tbody.appendChild(tr);
    lines[i] = tr;
    for (var j = 0; j < cols; j++) {
      cells[i][j] = document.createElement("td");
      tr.appendChild(cells[i][j]);
    }
  }

  return [table, cells, lines];
}

function getInnerTable(rows, cols, width, height) {
  var store = new Array();

  store.push('<table border=0 cellspacing=0 cellpadding=0');
  if (width) store.push(' width=' + width);
  if (height) store.push(' height=' + height);

  store.push('>');
  for (var i = 0; i < 50; i++) {
    store.push('<tr>');
    for (var j = 0; j < 50; j++) {
      store.push('<td>');
      store.push('</td>');
    }
    store.push('</tr>');
  }

  store.push('</table>');
  return store.join('');
}

function getSetTable(e1, e2, width, height) {
  var table = getTable(1, 2, width, height);
  table[CELLS][0][0].appendChild(e1);
  table[CELLS][0][1].appendChild(e2);
  return table[TABLE];
}

function getLabel(description, wordWrap) {
  var label = document.createElement("label");
  label.className = 'label';
  label.innerHTML = !wordWrap ? description.replace(/\s/g, '&nbsp;') : description;
  return label;
}

function pt(v) {
  if (isNumeric(v))
    return v;
  else {
    var r = parseInt(v.replace('px', '').replace('pt', ''));
    if (isNaN(r))
      return document.body.scrollHeight;
    else
      return r;
  }
}

function getDiv(id, x, y, width, height, zindex, visibility) {
  var div = document.createElement("div");

  if (x !== null && x !== undefined) div.style.left = x + "px";
  if (y !== null && y !== undefined) div.style.top = y + "px";
  if (width !== null && width !== undefined) div.style.width = parseInt(width) + "px";
  if (height !== null && height !== undefined) {
    div.style.height = parseInt(height) + "px";
    div.style.minHeight = div.style.height;
  }

  if (zindex !== null && zindex !== undefined) div.style.zIndex = zindex;
  if (id) div.name = id;

  if (visibility) {
    if (visibility == false || visibility == 'hide' || visibility == 'none') {
      div.style.display = 'none';
    } else {
      div.style.display = 'block';
    }
  }

  return div;
}

function visibleDiv(div, v) {
  if (div) {
    if (v) {
      div.style.display = 'block';
    } else {
      div.style.display = 'none';
    }
  }
}

function visibilityDiv(div, v) {
  if (div) {
    if (v) {
      div.style.visibility = 'visible';
    } else {
      div.style.visibility = 'hidden';
    }
  }
}

function isVisibleDiv(div) {
  return div && !!(div.offsetWidth || div.offsetHeight || div.getClientRects().length);
}

function findPosX(obj) {
  var curleft = 0;
  if (obj.offsetParent) {
    while (obj.offsetParent) {
      curleft += obj.offsetLeft - obj.scrollLeft;
      obj = obj.offsetParent;
    }
  } else if (obj.x) curleft += obj.x;
  return curleft;
}

function findPosY(obj) {
  var curtop = 0;
  if (obj.offsetParent) {
    while (obj.offsetParent) {
      curtop += obj.offsetTop - obj.scrollTop;
      obj = obj.offsetParent;
    }
  } else if (obj.y)
    curtop += obj.y;
  return curtop;
}

var preloaded = new Array();

function preload(url) {
  if (url && url.length > 0 && !preloaded[url]) {
    var img = new Image(100, 100);
    img.src = url;
    preloaded[url] = img;
  }
}

var preloadedscripts;

function loadScript(url, withAjax) {
  if (!preloadedscripts)
    preloadedscripts = new Array();
  if (url && url.length > 0 && !preloadedscripts[url]) {
    if (!withAjax) doLoadScript(url);
    else doLoadScriptAjax(url);
    preloadedscripts[url] = true;
  }
}

function loadDojo(url) {
  if (!preloadedscripts) preloadedscripts = new Array();
  if (url && url.length > 0 && !preloadedscripts[url]) {
    try { dojo.require(url); } catch (e) { }
    preloadedscripts[url] = true;
  }
}

function doLoadScript(url) {
  var oScript = document.createElement('script');
  oScript.setAttribute("type", 'text/javascript');
  oScript.setAttribute("language", 'JavaScript1.2');
  oScript.setAttribute("src", url);
  document.getElementsByTagName('head')[0].appendChild(oScript);

}

var wfr_global = this;

function wfr_eval(/*String*/scriptFragment) {
  return wfr_global.eval ? wfr_global.eval(scriptFragment) : eval(scriptFragment); // mixed
}

function doLoadScriptAjax(u) {
  var content = getContent(u);
  lastReceivedContent = content;
  wfr_eval(content);
}

function getTextDiv(text, x, y, color, bgColor, wordWrap) {
  var divText = this.getDiv('', x, y, 0, 0, 6, true);
  divText.style.cursor = 'pointer';
  divText.style.backgroundColor = bgColor;

  var table = getTable(1, 1, '0', '0');
  var label = getLabel(text, wordWrap);
  label.style.color = color;
  table[CELLS][0][0].setAttribute('align', 'center');
  table[CELLS][0][0].setAttribute('valign', 'middle');
  table[CELLS][0][0].appendChild(label);
  divText.appendChild(table[TABLE]);

  return divText;
}

function detectIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');

    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // Edge (IE 12+) => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function cumulativeOffset(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

function isNumeric(sText) {
  if (typeof sText == 'number') return true;

  sText = "" + sText;
  var ValidChars = "0123456789.";
  var IsNumber = true;
  var Char;

  for (i = 0; i < sText.length && IsNumber == true; i++) {
    Char = sText.charAt(i);
    if (ValidChars.indexOf(Char) == -1) {
      IsNumber = false;
    }
  }

  return IsNumber;
}

function isMobile() {
  if (navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/IEMobile/i) ||
      navigator.userAgent.match(/WPDesktop/i) ||
      navigator.userAgent.match(/Windows Phone/i)) return true;
  return false;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function arrayConcat(arr1, arr2) {
  var r = new Array();
  if (arr1) {
    for (var i = 0; i < arr1.length; i++)
      r.push(arr1[i]);
  }

  if (arr2) {
    for (var i = 0; i < arr2.length; i++)
      r.push(arr2[i]);
  }

  return r;
}

(function() {
  function ScrollBar(barParent, viewport, totalSize, rowHeight, position, nameTable) {
    var bar;
    var fluxo;
    var formCode = (window.$mainform().d.WFRForm ? window.$mainform().d.WFRForm.formID.value : null);
    var getRowNumber = function() { return 0; };
    var mouseDrag = false;
    var originalOffset;
    var params = [];
    var positionSize;
    var positionXY;
    var scroll = 0;
    var scrollIntervalID;
    var sysCode = (window.$mainform().d.WFRForm ? window.$mainform().d.WFRForm.sys.value : window.$mainform().sysCode);
    var thumb;
    var thumbRange = 0;
    var viewportSize = 0;
    nomeTabela = nameTable;

    if (position === "top") {
      positionSize = "height";
      positionXY = "Y";
    } else {
      positionSize = "width";
      positionXY = "X";
    }

    bar = document.createElement("div");
    bar.object = this;
    bar.className = "HTMLScrollBar";
    barParent.appendChild(bar);
    thumb = document.createElement("div");
    thumb.className = "HTMLScrollThumb" + positionXY;
    thumb.style[position] = "0px";
    bar.appendChild(thumb);

    if (position === "top") {
      getRowNumber = function() {
        var linha = scroll / thumbRange * (totalSize - viewportSize) / rowHeight;
        linha = Math.round(linha * 10) / 10;
        return linha;
      };

      this.setVerticalScroll = function(pixels) {
        scroll = Math.min(Math.max(pixels, 0), thumbRange);
        thumb.style.top = scroll + "px";
        if (fluxo !== undefined) {
          window.executeJSRuleNoField(sysCode, formCode, fluxo,
            [getRowNumber()].concat(params), true);
        }
      };

      this.setNewSQL = function(pixels, SQL) {
        params[3] = SQL;
      };

      this.moveVerticalScroll = function(pixels) {
        var novaposition = thumbRange / ((totalSize - viewportSize) / pixels) + scroll;
        scroll = Math.min(Math.max(novaposition, 0), thumbRange);
        thumb.style.top = scroll + "px";
        if (fluxo !== undefined) {
          window.executeJSRuleNoField(sysCode, formCode, fluxo,
            [getRowNumber()].concat(params), true);
        }
      };
    }

    this.reloadThumb = function() {
      var thumbSize;
      viewportSize = parseFloat(window.getComputedStyle(viewport)[positionSize]);
      thumbSize = parseFloat(window.getComputedStyle(barParent)[positionSize]) *
        viewportSize / totalSize;
      thumb.style[positionSize] = Math.min(thumbSize, parseFloat(window
          .getComputedStyle(barParent)[positionSize])) + "px";
      thumbRange = parseFloat(window.getComputedStyle(barParent)[positionSize]) -
        parseFloat(window.getComputedStyle(thumb)[positionSize]);
      if (position === "left") {
        thumb.style.left = (viewport.scrollLeft * thumbRange / (totalSize - viewportSize)) + "px";
      }
    };

    this.reloadThumb();

    this.getTotalSize = function() {
      return totalSize;
    };

    this.setTotalSize = function(pixels) {
      if (totalSize !== pixels) {
        totalSize = pixels;
        this.reloadThumb();
      }
    };

    this.getTotalRows = function() {
      return totalSize / rowHeight;
    };

    this.setMoveFlow = function(pFluxo, pParams) {
      fluxo = pFluxo;
      if (pParams instanceof Array) {
        params = pParams;
      }
    };

    this.runMoveFlow = function() {
      if (typeof fluxo === "string") {
        window.executeJSRuleNoField(sysCode, formCode, fluxo,
          [getRowNumber()].concat(params), true);
      }
    };

    var fmousemove = function(event) {

      var e = event || window.event;
      if (mouseDrag) {
        var novoValorPosition = e["client" + positionXY] - bar.getBoundingClientRect()[position] - originalOffset;
        thumb.style[position] = Math.min(Math.max(novoValorPosition, 0), thumbRange) + "px";
        scroll = parseFloat(thumb.style[position]);
        if (position === "top") {
          if (fluxo !== undefined) {
            window.executeJSRuleNoField(sysCode, formCode, fluxo,
              [getRowNumber()].concat(params), true);
          }
        } else {
          viewport.scrollLeft = (totalSize - parseFloat(window
              .getComputedStyle(viewport)[positionSize])) *
            parseFloat(thumb.style[position]) / thumbRange;
        }
      } else if (e["offset" + positionXY] !== undefined ||
        typeof e.target.getBoundingClientRect === "function") {
        originalOffset = e["offset" + positionXY] || e["page" + positionXY] - e.target.getBoundingClientRect()[position];
      }
    };

    var fmousedown = function(event) {
      var e = event || window.event;
      if (e.which === 1) {
        originalOffset = e["offset" + positionXY] || e["page" + positionXY] - e.target.getBoundingClientRect()[position];
        if (e.target === thumb) {
          document.body.style.webkitUserSelect = "none";
          document.body.style.MozUserSelect = "none";
          document.body.style.msUserSelect = "none";
          document.body.style.userSelect = "none";
          mouseDrag = true;
        } else if (e.target === bar) {
          var acima = (originalOffset < parseFloat(thumb.style[position])) ? -1 : 1;
          scrollIntervalID = window.setInterval(
            function() {
              if ((acima < 0 && originalOffset > parseFloat(thumb.style[position])) ||
                (acima > 0 && originalOffset < (parseFloat(thumb.style[position]) +
                    parseFloat(window.getComputedStyle(thumb)[positionSize])))) {
                window.clearInterval(scrollIntervalID);
              } else if (position === "top") {
                bar.object.moveVerticalScroll(acima * parseFloat(window.getComputedStyle(viewport)[positionSize]));
              } else {
                viewport.scrollLeft += acima * parseFloat(window.getComputedStyle(viewport)[positionSize]);
                thumb.style[position] = viewport.scrollLeft *
                  (parseFloat(window.getComputedStyle(barParent)[positionSize]) - parseFloat(window.getComputedStyle(thumb)[positionSize])) /
                  (totalSize - parseFloat(window.getComputedStyle(viewport)[positionSize])) + "px";
              }
            }, 50);
        }
      }
    };

    var fmouseup = function() {
      document.body.style.removeProperty("-webkit-user-select");
      document.body.style.removeProperty("-moz-user-select");
      document.body.style.removeProperty("-ms-user-select");
      document.body.style.removeProperty("user-select");
      window.clearInterval(scrollIntervalID);
      mouseDrag = false;
    };

    document.addEventListener("mousemove", fmousemove, false);
    bar.addEventListener("mousedown", fmousedown, false);
    document.addEventListener("mouseup", fmouseup, false);

    var touchStartBarY = 0;
    bar.addEventListener("touchstart", function(e) {
      if (e.touches && e.touches.length > 0) {
        touchStartBarY = e.touches[0].screenY;
      }
    }, false);

    bar.addEventListener("touchmove",  function(e) {
      if (e.touches && e.touches.length > 0) {
        if(Math.abs(e.touches[0].screenY - touchStartY) >= 20){
          if(e.cancelable)
            e.preventDefault();
        }
        fwheel({
          deltaY: (touchStartBarY - e.touches[0].screenY) * -0.06
        });
      }
    }, false);


    if (position === "top") {
      var fwheel = function(event) {
        var e = event || window.event, deltaY;
        if (e.deltaMode === e.DOM_DELTA_PIXEL) {
          deltaY = e.deltaY;
        } else if (e.deltaMode === e.DOM_DELTA_LINE) {
          deltaY = e.deltaY * rowHeight;
        } else {
          deltaY = e.deltaY * parseFloat(window.getComputedStyle(viewport).height);
        }

        bar.object.moveVerticalScroll(deltaY);
        if(e && e.preventDefault)
          e.preventDefault();
      };

      viewport.addEventListener("wheel", fwheel, false);

      var touchStartY = 0;
      viewport.addEventListener("touchstart", function(e) {
        if (e.touches && e.touches.length > 0) {
          touchStartY = e.touches[0].screenY;
        }
      }, false);

      viewport.addEventListener("touchmove", function(e) {
        if (e.touches && e.touches.length > 0) {
          if(Math.abs(e.touches[0].screenY - touchStartY) >= 20){
            if(e.cancelable)
              e.preventDefault();
          }
          fwheel({
            deltaY: (touchStartY - e.touches[0].screenY) * 0.06
          });
        }
      }, false);
    } else {
      var fscroll = function() {
        thumb.style.left = thumbRange * viewport.scrollLeft / (totalSize - parseFloat(window.getComputedStyle(viewport).width)) + "px";
      };

      viewport.addEventListener("scroll", fscroll, false);
    }
  }

  window.$mainform().newScrollBar = function(barParent, viewport, totalSize, rowHeight, position, nameTable) {
    return new ScrollBar(barParent, viewport, totalSize, rowHeight, position, nameTable);
  };
}());

function resizeComponentTable() {
  if (typeof d.n === "object" && d.n.responsive) {
    var activeSearchTab = true;
    var winDocument = window.$mainform().document;
    var newWidthIntermediateTwo = 0;
    var newWidthColHeader = 0;
    var currentComponent = [];

    var currentWindowWidth = window.innerWidth;
    var searchTab = window.parent.parent.document.getElementsByClassName('HTMLPage');
    if (searchTab.length > 0) {
      var i = 1;
      while (i <= searchTab.length) {
        if (searchTab[i - 1].src) {
          activeSearchTab = searchTab[i - 1].src.indexOf('basic_query') >= 0 ? true : false;
          i = searchTab.length;
        }
        i++;
      }
    } else {
      activeSearchTab = false;
    }

    if (!activeSearchTab)
      getWidthLay();
    var percentResize = (currentWindowWidth * 100 / WIDTH_WINDOW) / 100;
    var widthHeaderCellSeparador = 0;

    WIDTH_WINDOW = currentWindowWidth;

    if (LIST_RESIZE_TABLE.length > 0) {
      for (t = 0; t < LIST_RESIZE_TABLE.length; t++) {
        var componentList = winDocument.getElementById(LIST_RESIZE_TABLE[t]);
        if (componentList) {
          currentComponent.push(componentList);
        }
      }
    } else {
      currentComponent = winDocument.getElementsByClassName('HTMLTable');
    }

    for (i = 0; i < currentComponent.length; i++) {
      currentComponent[i].style.width = Math.round(parseInt(currentComponent[i].style.width) * percentResize) + 'px';
      var headerTable = winDocument.getElementById(currentComponent[i].id + '_cabecalho');
      var tableIntermediateTwo = winDocument.getElementById(currentComponent[i].id + '_intermediaria_2');
      var headerCells = headerTable.getElementsByClassName("HTMLTableHeaderCell");
      var headerCellSeparator = headerTable.getElementsByClassName("HTMLTableHeaderCellSeparator");
      for (j = 0; j < headerCells.length; j++) {
        if (headerCells[j].style.width) {
          newWidthColHeader = Math.round(parseInt(window.getComputedStyle(headerCells[j]).width) * percentResize);
          widthHeaderCellSeparador = parseInt(window.getComputedStyle(headerCellSeparator[j]).width);
          newWidthIntermediateTwo = newWidthIntermediateTwo + newWidthColHeader + widthHeaderCellSeparador;
          var sheetStyle = '#' + headerCells[j].id + ', #' + currentComponent[i].id + ' .HTMLTableBodyCell:nth-child(' + (j + 1) + '), #' + currentComponent[i].id + ' .HTMLTableHeaderSearch [webrun-type="HTMLEdit"]:nth-child(' + (j + 1) + '), .HTMLTableHeaderSearch [webrun-type="HTMLEdit"]:nth-child(' + (j + 1) + ') > input, .HTMLTableHeaderSearch [webrun-type="HTMLEdit"]:nth-child(' + (j + 1) + ') > .input-group, .HTMLTableHeaderSearch [webrun-type="HTMLEdit"]:nth-child(' + (j + 1) + ') > .input-group > input, #' + currentComponent[i].id + ' .HTMLTableBodyCell:nth-child(' + (j + 1) + ') [webrun-type="HTMLLookup"], #' + currentComponent[i].id + ' .HTMLTableBodyCell:nth-child(' + (j + 1) + ') [webrun-type="HTMLComboBox"], .HTMLTableBodyCell:nth-child(' + (j + 1) + ') [webrun-type="HTMLEdit"] { width:' + newWidthColHeader + 'px !important; height: 100% !important; padding: 0; border-radius: 0; }';
          var resizeColHeader = winDocument.getElementById(currentComponent[i].id + "RedimensionarLarguraColuna" + (j + 1));
          if (resizeColHeader) {
            resizeColHeader.innerHTML = sheetStyle;
          } else {
            var elementStyle = winDocument.createElement('style');
            elementStyle.id = currentComponent[i].id + "RedimensionarLarguraColuna" + (j + 1);
            elementStyle.innerHTML = sheetStyle;
            winDocument.head.appendChild(elementStyle);
          }
        }
      }

      tableIntermediateTwo.style.width = newWidthIntermediateTwo + 'px';
      newWidthIntermediateTwo = 0;
      if (window.$mainform().__storage[currentComponent[i].id + 'autoajuste_conteudo']) {
        var objectVerticalScroll = winDocument.getElementById(currentComponent[i].id + '_rolagem_vertical')
          .childNodes[0].object;
        var heightBodyTwo = parseInt(window.getComputedStyle(winDocument.getElementById(currentComponent[i].id + '_corpo_2')).height);
        objectVerticalScroll.setVerticalScroll(0);
        objectVerticalScroll.setTotalSize(heightBodyTwo);
      }
    }

    LIST_RESIZE_TABLE = [];
  }
}

function getWidthLay() {
  if (DIMENSION_LAY) {
    var widthLay = parseInt(document.getElementById("lay").style.width);
    if (widthLay !== WIDTH_WINDOW) WIDTH_WINDOW = widthLay;
    DIMENSION_LAY = false;
  }
}

function clearStyleTable(){
  /*Modificação para salvar as larguras das colunas*/
};

/**
 *
 * Método receptor de uma mensagem enviada para um formulário via Broadcast.
 * Para mais informações sobre BroadcastChannel consultar: https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
 *
 * Observações:
 * 1. event.data (JSON de propiedades):
 *  1.1 Chaves obrigatórias:
  *  1.1.1 formGUID --> identificador do formulário que irá receptar a mensagem.
  *  1.1.2 formTarget --> identificador (formGUID) do formulário remetente da mensagem.
 * 2. event.action:
 *  2.1 wef --> webrunExecuteFlow
 *  2.2 wcc --> webrunChangeComponent
 *  2.3 wrc --> webrunRefreshComponent
 *  2.4 wgc --> webrunGetComponentValue
 *  2.5 wex --> levanta uma exceção.
 *  2.6 wea --> webrunExecuteAction
 * @author Janpier
 */
function webrunLoadOnmessage () {
  if(webrunBroadcast) {
    webrunBroadcast.onmessage = function (event) {
      if(mainform && event.data && (decodeURI(mainform.formGUID) === event.data.formGUID) && event.data.action) {
        switch (event.data.action.toLowerCase()) {
          case 'wef' :
            webrunExecuteFlow(event);
            break;
          case 'wcc' :
            webrunChangeComponent(event);
            break;
          case 'wrc' :
            webrunRefreshComponent(event);
            break;
          case 'wgc' :
            webrunGetComponentValue(event);
            break;
          case 'wea' :
            webrunExecuteAction(event);
            break;
          case 'wex' :
            handleException(event.data.msg);
            break;
        }
      }
    }
  }
};

/**
 *
 * Método responsável por finalizar a conexão com o broadcats.
 * Esse método só deve ser chamado quando o formulário for fechado.
 * @author Janpier
 */
function webrunCloseChannel () {
  if (webrunBroadcast) webrunBroadcast.close();
};

/**
 *
 * Método reponsável por executar um fluxo enviado via postMessage.
 * Se exitir uma regra de callback definida a mesma será executada.
 * @author Janpier
 * @param {*} event
 */
function webrunExecuteFlow (event) {
  let flow = event.data.flow;
  if (flow) {
    let params = event.data.params ? event.data.params : new Array();
    let response = executeJSRuleNoField(mainform.sysCode, mainform.idForm, flow, params);
    if (event.data.callback) {
      let jsonResponse = webrunGetJSONCallback(event, response);
      webrunBroadcast.postMessage(jsonResponse);
    }
  }
};

/**
 * Método responsável por alterar o valor de um componente no formulário.
 * @author Janpier
 * @param {*} event
 */
function webrunChangeComponent(event) {
  let comp = $c(event.data.component);
  if (comp) comp.setValue(event.data.value);
  else {
    let msg = getLocaleMessage('ERROR.COMPONENT_FIELD_NOT_FOUND', event.data.component);
    let jsonResponse = webrunGetJSONException(event.data.formTarget, msg);
    webrunBroadcast.postMessage(jsonResponse);
  }
};

/**
 * Método responsável por obter o valor de um componente no formulário.
 * Esse método retorna a mensagem para a execução de fluxo de callback;
 * @author Janpier
 * @param {*} event
 */
function webrunGetComponentValue(event) {
  let comp = $c(event.data.component);
  if (comp) {
    if (event.data.callback) {
      let response = comp.getValue();
      let jsonResponse = webrunGetJSONCallback(event, response);
      webrunBroadcast.postMessage(jsonResponse);
    }
  } else {
    let msg = getLocaleMessage('ERROR.COMPONENT_FIELD_NOT_FOUND', event.data.component);
    let jsonResponse = webrunGetJSONException(event.data.formTarget, msg);
    webrunBroadcast.postMessage(jsonResponse);
  }
};

/**
 * Método responsável por atualizar um componente em um formulário.
 * @author Janpier
 * @param {*} event
 */
function webrunRefreshComponent(event) {
  let comp = $c(event.data.component);
  if (comp) comp.refresh();
  else {
    let msg = getLocaleMessage('ERROR.COMPONENT_FIELD_NOT_FOUND', event.data.component);
    let jsonResponse = webrunGetJSONException(event.data.formTarget, msg);
    webrunBroadcast.postMessage(jsonResponse);
  }
};

/**
 * Método responsável por retornar um JSON com as devidas propriedades de uma exceção caso ocorra para o formulário remetente
 * da mensagem.
 * @author Janpier
 * @param {*} event
 * @returns
 */
function webrunGetJSONException (form, msg) {
  let jsonException = {};
  jsonException.formGUID = form;
  jsonException.action = "wex";
  jsonException.msg = msg;

  return jsonException;
};
/**
 * Método responsável por executar qualquer método do componente.
 * da mensagem.
 * @author Janpier
 * @param {*} event
 * @returns
 */
function webrunExecuteAction (event) {
  try {  
    let comp = $c(event.data.component);
    let method = event.data.method;
    if (comp && method) {
      let params = event.data.params ? event.data.params : new Array();
      comp.callMethod(comp.instance, method, params);
    }
  } catch (e) {console.error("WebrunBroadcast: uma exceção ocorreu ao executar a ação.\nDetalhes:" + e)}
};

/**
 * Método responsável por retornar um JSON com as devidas propriedades para execução de uma regra de callback para o formulário
 * rementente da mensagem.
 * @author Janpier
 * @param {*} event
 * @param {*} response
 * @returns
 */
function webrunGetJSONCallback (event, response) {
  let params = event.data.callbackParams ? event.data.callbackParams : new Array();
  params[0] = response;
  let jsonCallback = {};
  jsonCallback.formGUID = event.data.formTarget;
  jsonCallback.action = "wef";
  jsonCallback.flow = event.data.callback;
  jsonCallback.params = params;

  return jsonCallback;
}
