'use-strict';
var Jimp = require('jimp');

module.exports = function(Pixelate) {
  	Pixelate.pixelate = function (image64, pixelSize, area, next) {
    	Jimp.read(Buffer.from(image64.split(',')[1], 'base64')).then((image) => {
			let width = image.bitmap.width;
			let height = image.bitmap.height;

			if(area != undefined){
				if(area.x + area.xSize > width || area.y + area.ySize > height)
					return next("Selected area out of range.");
			}else{
				area = {
					x: 0,
					y: 0,
					xSize: width,
					ySize: height
				};
			}

			pixelate(area, pixelSize, image);
		
			image.getBase64Async(Jimp.MIME_JPEG).then((newImage64) => {
				next(null, newImage64);
			}).catch(imageBase64Error => next(imageBase64Error));
    	}).catch(imageReadError => next(imageReadError));
  	}

	Pixelate.remoteMethod("pixelate", {
		accepts: [
			{ arg: 'image64', type: 'string' },
			{ arg: 'pixelSize', type: 'number' },
			{ arg: 'area', type: 'object' },
		],
		http: {
			path: '/pixelate',
			verb: 'post'
		},
		description: "Pixelates an image",
		returns: {type: 'string', root: 'true'}
	});
};

function pixelate(area, pixelSize, image) {
	for(let x = area.x; x < area.x + area.xSize; x += pixelSize){
    	for(let y = area.y; y < area.y + area.ySize; y += pixelSize){
      		let averageRGB = getAverageRGB(x, y, area, pixelSize, image);
      		setAverageRGB(x, y, area, pixelSize, averageRGB, image);
		}
  	}
}

function getAverageRGB(startX, startY, area, pixelSize, image) {
	let averageRGB = {r: 0, g: 0, b: 0, a: 0};
	let pixelCount = 0;

	for(let x = startX; checkLimit(x, startX + pixelSize, area.x + area.xSize); x++){
		for(let y = startY; checkLimit(y, startY + pixelSize, area.y + area.ySize); y++){
			pixelCount++;
			let rgb = Jimp.intToRGBA(image.getPixelColor(x, y));
			averageRGB = {r: averageRGB.r + rgb.r, g: averageRGB.g + rgb.g, b: averageRGB.b + rgb.b, a: rgb.a};
		}
	}

  	averageRGB = {r: averageRGB.r / pixelCount, g: averageRGB.g / pixelCount, b: averageRGB.b / pixelCount, a: averageRGB.a};

  	return averageRGB;
}

function setAverageRGB(startX, startY, area, pixelSize, rgb, image) {
	for(let x = startX; checkLimit(x, startX + pixelSize, area.x + area.xSize); x++){
		for(let y = startY; checkLimit(y, startY + pixelSize, area.y + area.ySize); y++){
			image.setPixelColor(Jimp.rgbaToInt(rgb.r, rgb.g, rgb.b, rgb.a), x, y);
		}
	}
}

function checkLimit(pos, pixelLimit, areaLimit){
	return pos < pixelLimit && pos < areaLimit;
}
