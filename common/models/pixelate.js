'use-strict';
var Jimp = require('jimp');

module.exports = function(Pixelate) {
  Pixelate.pixelate = function (image64, next) {
    Jimp.read(Buffer.from(image64, 'base64')).then((image) => {
      let width = image.bitmap.width;
      let height = image.bitmap.height;
      for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
          let rgb = Jimp.intToRGBA(image.getPixelColor(x, y));
          let grayscale = (rgb.r + rgb.g + rgb.b) / 3;
          image.setPixelColor(Jimp.rgbaToInt(grayscale, grayscale, grayscale, rgb.a), x, y);
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
