'use strict';

const jimp = require('jimp');
const path = require('path');
const log = require('fancy-log');

const { SCALE_INFO } = require('@zebrajaeger/gulp-scale-images');
const PLUGIN_NAME = "gulp-scale-images-sharp";


const resizeJimp = (file, cfg, cb) => {
	let targetExtension = cfg.format || path.extname(file.path);

	// no parameters -> no resize
	if (!cfg.maxWidth && !cfg.maxHeight) {
		cb(null, file);
		return;
	}
	jimp.read(file.contents, (err, image) => {
		if (err) {
			cb(err, null);
			return;
		}

		// check upscale
		if ((cfg.maxWidth && cfg.width > image.bitmap.width) || (cfg.height && cfg.height > image.bitmap.height)) {
			if (cfg.allowEnlargement === false) {
				cb(null, file);
				return;
			} else {
				log(PLUGIN_NAME, 'You are resizing an image to a larger size than the original:' + file.path);
			}
		}

		// resize
		let width = jimp.AUTO;
		let height = jimp.AUTO;
		let quality = cfg.quality || 90;

		if (cfg.maxWidth) {
			width = cfg.maxWidth;
		}

		if (cfg.maxHeight) {
			height = cfg.maxHeight;
		}

		image.resize(width, height).quality(quality);

		// resolve mime
		let mime;
		let format;
		switch (targetExtension.toLowerCase()) {
			case 'jpg':
			case 'jpeg':
			case 'jpe':
				mime = jimp.MIME_JPEG;
				format = 'jpg';
				break;
			case 'png':
				mime = jimp.MIME_PNG;
				format = 'png';
				break;
			case 'bmp':
			case 'dib':
				mime = jimp.MIME_BMP;
				format = 'bmp';
				break;
			case 'gif':
				mime = jimp.MIME_GIF;
				format = 'gif';
				break;
			default:
				cb('unknown extension: ' + targetExtension, null);
				return;
		}

		// create image
		image.getBuffer(mime, function (err, buffer) {
			if (err) {
				cb(err, null);
				return;
			}

			const newFile = file.clone({contents: false});
			newFile.contents = buffer;
			Object.defineProperty(newFile, SCALE_INFO, {
				value: {
					format: format,
					mime: mime,
					width: image.bitmap.width,
					height: image.bitmap.height,
					size: buffer.length
				}
			});
			cb(null, newFile);
		});
	});
};

module.exports = resizeJimp;
