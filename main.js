/*
 * ImageInfo 0.1.2 - A Node Module for reading image metadata.
 *   Based on the JavaScript library from Jacon Seidelin
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * Copyright (c) 2012 Bart Riemens, briemens@crafity.com, http://crafity.com/
 * Copyright (c) 2012 Galina Slavova, galina@crafity.com, http://crafity.com/
 * MIT License [http://www.nihilogic.dk/licenses/mit-license.txt]
 */

/**
 * Module dependencies.
 */
var ImageInfo = exports
	, fs = require('fs')
	, EXIF = require('./lib/exif')
	;

/**
 * Framework name.
 */
exports.fullname = 'crafity.imageinfo';

/**
 * Framework version.
 */
exports.version = '0.0.1';

/**
 * Initialize module
 */

function DataReader(fd) {
	var BUFFER_INCREMENT = 4096;
	var _readBuffer = new Buffer(BUFFER_INCREMENT);
	var _readBytes = 0;
	var _fileStats = fs.fstatSync(fd);

	/**
	 * Read bytes from file descriptor until we may return data
	 * from requested index.
	 *
	 * @param index Index where from data is going to be read.
	 * @param length Number of bytes that are required after index.
	 */
	function fetchDataIfNeeded(index, length) {
		if (_fileStats.size < index + length) {
			throw new Error("Unexpected end of file.");
		}
		while (index + length > _readBytes) {
			// grow buffer if needed
			if (_readBytes === _readBuffer.length) {
				_readBuffer = Buffer.concat(
					[_readBuffer, new Buffer(0)],
					_readBuffer.length + BUFFER_INCREMENT);
			}
			_readBytes += fs.readSync(
				fd, _readBuffer, _readBytes,
				_readBuffer.length - _readBytes);
		}
	}

	this.getByteAt = function (index) {
		fetchDataIfNeeded(index, 1);
		return _readBuffer[index];
	};

	this.getBytesAt = function (iOffset, iLength) {
		fetchDataIfNeeded(iOffset, iLength);
		return _readBuffer.slice(iOffset, iOffset + iLength);
	};

	this.getLength = function () {
		return _fileStats.size;
	};

	this.getShortAt = function (iOffset, bBigEndian) {
		var iShort = bBigEndian ?
			(this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
			: (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset)
		if (iShort < 0) iShort += 65536;
		return iShort;
	};

	this.getLongAt = function (iOffset, bBigEndian) {
		var iByte1 = this.getByteAt(iOffset),
			iByte2 = this.getByteAt(iOffset + 1),
			iByte3 = this.getByteAt(iOffset + 2),
			iByte4 = this.getByteAt(iOffset + 3);

		var iLong = bBigEndian ?
			(((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
			: (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
		if (iLong < 0) iLong += 4294967296;
		return iLong;
	};

	this.getSLongAt = function (iOffset, bBigEndian) {
		var iULong = this.getLongAt(iOffset, bBigEndian);
		if (iULong > 2147483647)
			return iULong - 4294967296;
		else
			return iULong;
	};

	this.getStringAt = function (iOffset, iLength) {

		var aStr = [];

		var aBytes = this.getBytesAt(iOffset, iLength);
		for (var j = 0; j < iLength; j++) {
			aStr[j] = String.fromCharCode(aBytes[j]);
		}
		return aStr.join("");
	};
}

function readInfoFromData(data) {

	var offset = 0;

	if (data.getByteAt(0) == 0xFF && data.getByteAt(1) == 0xD8) {
		return readJPEGInfo(data);
	}
	if (data.getByteAt(0) == 0x89 && data.getStringAt(1, 3) == "PNG") {
		return readPNGInfo(data);
	}
	if (data.getStringAt(0, 3) == "GIF") {
		return readGIFInfo(data);
	}
	if (data.getByteAt(0) == 0x42 && data.getByteAt(1) == 0x4D) {
		return readBMPInfo(data);
	}
	if (data.getByteAt(0) == 0x00 && data.getByteAt(1) == 0x00) {
		return readICOInfo(data);
	}

	return {
		format: "UNKNOWN"
	};
}

function readPNGInfo(data) {
	var w = data.getLongAt(16, true);
	var h = data.getLongAt(20, true);

	var bpc = data.getByteAt(24);
	var ct = data.getByteAt(25);

	var bpp = bpc;
	if (ct == 4) bpp *= 2;
	if (ct == 2) bpp *= 3;
	if (ct == 6) bpp *= 4;

	var alpha = data.getByteAt(25) >= 4;

	return {
		format: "PNG",
		version: "",
		width: w,
		height: h,
		bpp: bpp,
		alpha: alpha,
		exif: {}
	}
}

function readGIFInfo(data) {
	var version = data.getStringAt(3, 3);
	var w = data.getShortAt(6);
	var h = data.getShortAt(8);

	var bpp = ((data.getByteAt(10) >> 4) & 7) + 1;

	return {
		format: "GIF",
		version: version,
		width: w,
		height: h,
		bpp: bpp,
		alpha: false,
		exif: {}
	}
}

function readJPEGInfo(data) {

	var w = 0;
	var h = 0;
	var comps = 0;
	var len = data.getLength();
	var offset = 2;
	while (offset < len) {
		var marker = data.getShortAt(offset, true);
		offset += 2;
		if (marker == 0xFFC0 || marker == 0xFFC2) {
			h = data.getShortAt(offset + 3, true);
			w = data.getShortAt(offset + 5, true);
			comps = data.getByteAt(offset + 7, true);
			break;
		} else {
			offset += data.getShortAt(offset, true);
		}
	}

	var exif = {};

	if (typeof EXIF != "undefined" && EXIF.readFromBinaryFile) {
		exif = EXIF.readFromBinaryFile(data);
	}

	return {
		format: "JPEG",
		version: "",
		width: w,
		height: h,
		bpp: comps * 8,
		alpha: false,
		exif: exif
	};
}

function readBMPInfo(data) {

	var w = data.getLongAt(18);
	var h = data.getLongAt(22);
	var bpp = data.getShortAt(28);
	return {
		format: "BMP",
		version: "",
		width: w,
		height: h,
		bpp: bpp,
		alpha: false,
		exif: {}
	};
}

ImageInfo.readInfoFromFile = function (path, callback) {
	console.log("path", path);
	fs.open(path, 'r', null, function (err, fd) {
		if (err) { return callback(err); }
		var result;
		try {
			result = readInfoFromData(new DataReader(fd));
		} catch (err) {
			return callback(err)
		}
		fs.close(fd, function (err) {
			if (err) console.log("Closing file failed for:", path);
		});
		return callback(null, result);
	});
};
