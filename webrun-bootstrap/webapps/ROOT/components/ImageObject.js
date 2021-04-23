function ImageObject() { }

ImageObject.inherits(HTMLObject);
ImageObject.prototype.name = 'Image';

ImageObject.prototype.getImage = function(src, alt, oc, h, w) {
  var img = document.createElement("img");
  img.setAttribute('src', src);
  img.setAttribute('border', '0');

  if (alt) {
    img.setAttribute('alt', alt);
    img.setAttribute('title', alt);
  }

  if (oc) {
    this.attachEvent(img, 'click', oc);
    img.className = 'cur';
  }

  if (h) img.setAttribute('height', h);
  if (w) img.setAttribute('width', w);

  return img;
};

ImageObject.prototype.toString = function() {
  return '[object ' + this.name + ']';
};