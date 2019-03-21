'use-strict';

module.exports = function(Pixelate) {
  Pixelate.pixelate = function (image, next) {
    next();
  }

  Pixelate.remoteMethod("pixelate", {
      accepts: [
          { arg: 'image', type: 'string' }
      ],
      http: {
          path: '/pixelate',
          verb: 'post'
      },
      description: "Pixelates an image",
      returns: {}
  });
};
