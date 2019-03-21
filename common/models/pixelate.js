'use-strict';
var Jimp = require('jimp');

module.exports = function(Pixelate) {
  Pixelate.pixelate = function (image64, next) {
    Jimp.read(Buffer.from(image64, 'base64')).then((image) => {
      let width = image.bitmap.width;
      let height = image.bitmap.height;
      let pixelSize = 20;

      for(let x = 0; x < width; x += pixelSize){
        for(let y = 0; y < height; y += pixelSize){
          let averageRGB = getAverageRGB(x, y, pixelSize, image);
          setAverageRGB(x, y, pixelSize, averageRGB, image);
        }
      }
      
      image.getBase64Async(Jimp.MIME_JPEG).then((newImage64) => {
        next(null, newImage64);
      }).catch(imageBase64Error => next(imageBase64Error));
    }).catch(imageReadError => next(imageReadError));
  }

  Pixelate.remoteMethod("pixelate", {
      accepts: [
          { arg: 'image64', type: 'string' }
      ],
      http: {
          path: '/pixelate',
          verb: 'post'
      },
      description: "Pixelates an image",
      returns: {type: 'string', root: 'true'}
  });
};

function getAverageRGB(startX, startY, pixelSize, image) {
  let averageRGB = {
    r: 0,
    g: 0,
    b: 0,
    a: 0
  };
  let pixelCount = 0;

  for(let x = startX; x < startX + pixelSize; x += pixelSize){
    for(let y = startY; y < startY + pixelSize; y += pixelSize){
      pixelCount++;
      let rgb = Jimp.intToRGBA(image.getPixelColor(x, y));
      averageRGB = {
        r: averageRGB.r + rgb.r,
        g: averageRGB.g + rgb.g,
        b: averageRGB.b + rgb.b,
        a: rgb.a
      };
    }
  }

  averageRGB = {
    r: averageRGB.r / pixelCount,
    g: averageRGB.g / pixelCount,
    b: averageRGB.b / pixelCount,
    a: averageRGB.a
  };

  return averageRGB;
}

function setAverageRGB(startX, startY, pixelSize, rgb, image) {
  for(let x = startX; x < startX + pixelSize; x += pixelSize){
    for(let y = startY; y < startY + pixelSize; y += pixelSize){
      image.setPixelColor(Jimp.rgbaToInt(rgb.r, rgb.g, rgb.b, rgb.a), x, y);
    }
  }
}
