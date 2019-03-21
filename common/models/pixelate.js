'use-strict';
var Jimp = require('jimp');

module.exports = function(Pixelate) {
  Pixelate.pixelate = function (image64, next) {
    Jimp.read(Buffer.from(image64, 'base64')).then((imageReadError, image) => {
      if(imageReadError) return next(imageReadError);
      image.getBase64Async(mime).then((imageBase64Error, newImage64) => {
        if(imageBase64Error) return next(imageBase64Error);
        next(null, newImage64);
      })
    });
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
