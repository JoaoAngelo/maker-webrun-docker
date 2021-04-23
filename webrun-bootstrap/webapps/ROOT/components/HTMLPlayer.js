/**
 * Método construtor do HTMLPlayer. Responsável por criar o componente Player.
 * @param sys - Indica o código do sistema.
 * @param formID - Indica o código do formulário.
 * @param posX - Posição do componente na tela em relação ao eixo X.
 * @param posY - Posição do componente na tela em relação ao eixo Y.
 * @param width - Largura do componente.
 * @param heigth - Altura do componente.
 * @param description - Descricao do componente.
 * @param value - Valor do componente.
 **/
function HTMLPlayer(sys, formID, code, posX, posY, width, height, description, value, showValue) {
  this.create(sys, formID, code, posX, posY, width, height, description, value);
  this.mediaSources = [];
  this.activeMediaIndex = 0;
}

/**
 * Herança do objeto.
 **/
HTMLPlayer.inherits(HTMLElementBase);

/**
 * Setando propriedades do componente.
 **/
HTMLPlayer.prototype.name = 'HTMLPlayer';
HTMLPlayer.prototype.tabable = true;

/**
 * Sobrescreve o método do HTMLElementBase devido a sua estruturação.
 * @param v Valor lógico para habilitar/desabilitar o componente.
 */
HTMLPlayer.prototype.setEnabled = function(v) {
  this.callMethod(HTMLElementBase, "setEnabled", [v]);
  if (this.mediaElement) {
    if (!this.enabled && !this.mediaElement.paused) this.pause();
    else if (this.enabled && this.mediaElement.paused && this.autoPlay) this.play();
  }
};

/**
 * Retoma/Inicia a reprodução da mídia atual.
 **/
HTMLPlayer.prototype.play = function() {
  if (this.mediaElement) this.mediaElement.play();
};

/**
 * Pausa a reprodução da mídia atual.
 **/
HTMLPlayer.prototype.pause = function() {
  if (this.mediaElement) this.mediaElement.pause();
};

/**
 * Obtém um boolean indicando se o player está reproduzindo alguma mídia atualmente.
 **/
HTMLPlayer.prototype.isPlaying = function() {
  return this.mediaElement && !this.mediaElement.paused;
};

/**
 * Obtém a URL da mídia que está sendo reproduzida atualmente.
 * Se nenhuma mídia está sendo reproduzida, ele retorna null.
 **/
HTMLPlayer.prototype.getPlayingMediaURL = function() {
  return this.isPlaying() ? this.mediaSources[this.activeMediaIndex].url : null;
};

/**
 * Obtém a legenda da mídia que está sendo reproduzida atualmente.
 * Se nenhuma mídia está sendo reproduzida, ele retorna null.
 **/
HTMLPlayer.prototype.getPlayingMediaDescription = function() {
  return this.isPlaying() ? this.mediaSources[this.activeMediaIndex].description : null;
};

/**
 * Obtém a playlist desse player.
 **/
HTMLPlayer.prototype.getPlaylist = function() {
  return this.mediaSources;
};

/**
 * Adiciona uma mídia a playlist desse player.
 * @param url - URL da mídia.
 * @param description - Legenda da mídia.
 **/
HTMLPlayer.prototype.addMediaToPlaylist = function(url, description) {
  var source = {
    url: url,
    description: description
  };

  this.mediaSources.push(source);
  if (this.mediaSources.length == 1) this.setSource(source);
};

/**
 * Limpa a playlist do player.
 **/
HTMLPlayer.prototype.clearPlaylist = function() {
  this.mediaSources = [];
  if (this.mediaElement) {
    this.mediaElement.innerHTML = "";
    this.mediaElement.src = null;
    this.mediaElement.load();
  }
};

/**
 * Responsável por desenhar o HTML do componente Player.
 * @param doc - documento onde o componente será inserido.
 **/
HTMLPlayer.prototype.designComponent = function(doc) {
  // Criar o elemento de mídia do HTML5.
  this.mediaElement = document.createElement("video");
  this.mediaElement.className = "w-100 h-100"; // Bootstrap

  // Definir propriedade de exibir controles.
  this.mediaElement.controls = (this.controles && this.controles.length && this.controles.toLowerCase() === "true");

  // Define se a opção de download deve ser exibida.
  if(!(this.allowDownload.toLowerCase() === "true"))
    this.mediaElement.controlsList = "nodownload";

  // Definir propriedade de reprodução automática.
  this.autoPlay = (this.autoPlay && this.autoPlay.length && this.autoPlay.toLowerCase() === "true");
  this.mediaElement.autoplay = this.autoPlay;

  // Definir propriedade de mudo.
  this.mediaElement.muted = (this.mudo && this.mudo.length && this.mudo.toLowerCase() === "true");
  this.mediaElement.defaultMuted = this.mediaElement.muted;

  // Definir volume.
  if (this.volume && this.volume.length && this.volume.length > 0) {
    this.volume = parseInt(this.volume);
    this.mediaElement.volume = this.volume / 100; // Escala de 0.0 a 1.0, padrão: 1.0
  }

  // Obter a lista de URLs do player.
  if (this.Valores && this.Valores.length && this.Valores.length > 0) {
    if (this.Valores.indexOf("\n")) {
      var urls = this.Valores.split("\n");
      var descriptions = this.Lista.split("\n");
      for (var i = 0; i < urls.length; i++) {
        if (urls[i].length > 0) {
          this.addMediaToPlaylist(urls[i], descriptions[i]);
        }
      }
    } else {
      this.addMediaToPlaylist(this.Valores, this.Lista);
    }
  }

  // Definir velocidade de reprodução.
  if (this.playbackRate && this.playbackRate.length && this.playbackRate.length > 0) {
    this.playbackRate = parseInt(this.playbackRate);
    this.mediaElement.playbackRate = this.playbackRate / 100; // Escala de -n a +n, padrão: 1.0
  }

  // Definir propriedade de loop.
  if (this.loop && this.loop.length && this.loop.toLowerCase() === "true") {
     if (this.mediaSources.length > 1) {
      // Quando tem mais de uma mídia e o loop estiver ativado, o loop será na lista de reprodução.
       this.mediaElement.loop = false;
    } else {
      // Quando tem somente uma mídia, o loop será na mídia.
      this.mediaElement.loop = true;
    }

     this.loop = true;
  } else {
    this.mediaElement.loop = false;
    this.loop = false;
  }

  // Adicionar elemento na div.
  this.div.appendChild(this.mediaElement);

  // Associar eventos ao player.
  this.attachEvent(this.mediaElement, "playing", this.mediaStarted);
  this.attachEvent(this.mediaElement, "ended", this.mediaEnded);
  this.attachEvent(this.mediaElement, "pause", this.mediaPaused);
  this.attachEvent(this.mediaElement, "error", this.mediaError);

  // Definir mídia inicial.
  this.activeMediaIndex = 0;
  if (this.mediaSources && this.mediaSources.length > 0) {
    this.setSource(this.mediaSources[this.activeMediaIndex]);
  }
};

/**
 * Define a mídia para reproduzir no player.
 * @param source - Referência para mídia (contendo a URL e a descrição).
 **/
HTMLPlayer.prototype.setSource = function(source) {
  this.mediaElement.innerHTML = "";

  if (source) {
    if (source.description && source.description.length > 0) {
      var descriptionLowercase = source.description.trim().toLowerCase();
      if (descriptionLowercase.endsWith(".vtt") ||
        descriptionLowercase.endsWith(".srt")) {

        var subtitles = document.createElement("track");
        subtitles.setAttribute("kind", "subtitles");
        subtitles.setAttribute("src", source.description);
        this.mediaElement.appendChild(subtitles);

        this.mediaElement.src = null;
        this.mediaElement.load();
      }
    }

    this.mediaElement.src = source.url;
    if (this.autoPlay && this.enabled) this.mediaElement.play();
    if (this.playbackRate) this.mediaElement.playbackRate = this.playbackRate / 100;
  } else {
    this.mediaElement.src = null;
    this.mediaElement.load();
  }
};

/**
 * Ocorre ao iniciar a reprodução de uma mídia.
 **/
HTMLPlayer.prototype.mediaStarted = function(e) {
  if (this.AoIniciarReproducao) {
    this.AoIniciarReproducao.call(this,
      this.mediaSources[this.activeMediaIndex].url,
      this.mediaSources[this.activeMediaIndex].description);
  }
};

/**
 * Ocorre após a finalização da reprodução da mídia atual.
 **/
HTMLPlayer.prototype.mediaEnded = function(e) {
  if (this.AoFinalizarReproducao) {
    if (this.AoFinalizarReproducao.call(this,
      this.mediaSources[this.activeMediaIndex].url,
      this.mediaSources[this.activeMediaIndex].description) === false) {

      // Quando o fluxo relacionado a este evento retorna o valor lógico false,
      // ele para o avanço automático das mídias na lista de reprodução.
      return;
    }
  }

  if (this.mediaSources && this.mediaSources.length > 1) {
    if (this.loop) {
      // Avançar para o próximo vídeo (loop).
      this.activeMediaIndex = (++this.activeMediaIndex) % this.mediaSources.length;
    } else if (this.activeMediaIndex < this.mediaSources.length - 1) {
      // Avançar para o próximo vídeo.
      this.activeMediaIndex++;
    }

    // Definir a source.
    this.setSource(this.mediaSources[this.activeMediaIndex], true);
  }
};

/**
 * Ocorre ao pausar a reprodução de uma mídia.
 **/
HTMLPlayer.prototype.mediaPaused = function(e) {
  if (this.AoPausar) {
    if (this.AoPausar.call(this,
      this.mediaSources[this.activeMediaIndex].url,
      this.mediaSources[this.activeMediaIndex].description) === false) {

      // Quando o fluxo relacionado a este evento retorna o valor lógico false,
      // ele dá play automaticamente na mídia (cancela o pause).
      this.mediaElement.play();
    }
  }
};

/**
 * Ocorre ao quando um erro relacionado ao player ocorre.
 **/
HTMLPlayer.prototype.mediaError = function(e) {
  if (this.AoOcorrerErro) {
    this.AoOcorrerErro.call(this,
      this.mediaSources[this.activeMediaIndex].url,
      this.mediaSources[this.activeMediaIndex].description);
  }
};
