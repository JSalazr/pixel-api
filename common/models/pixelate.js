'use-strict';
var Jimp = require('jimp');

module.exports = function(Pixelate) {
  Pixelate.pixelate = function (image64, next) {
    Jimp.read(Buffer.from(image64, 'base64')).then((image) => {
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
