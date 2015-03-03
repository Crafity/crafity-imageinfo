/*!
 * crafity.filesystem.test - Filesystem tests
 * Copyright(c) 2011 Crafity
 * Copyright(c) 2012 Galina Slavova
 * Copyright(c) 2012 Bart Riemens
 * MIT Licensed
 */

/**
 * Test dependencies.
 */
var jstest = require('crafity-jstest')
	, assert = jstest.assert
	, context = jstest.createContext()
	, fs = require('crafity-filesystem')
	, main = require('../main.js')
	;

// Print out the name of the test module
console.log("Testing 'main.js' in crafity-imageinfo... ");
console.log("main", main);

/**
 * The tests
 */
var tests = {

	'crafity.imageinfo must be the same as the default fs module': function () {

		assert.isDefined(main, "Expected main to be defined");
		assert.areEqual(require('../main.js'), main.__proto__, "Expected main to be the standard module");
	},

	'crafity.imageinfo must be the fullname of this module': function () {

		assert.areEqual("crafity.imageinfo", main.fullname, "Expected module name is crafity.imageinfo!");
	},

	'crafity.imageinfo must have package.json file': function () {

		fs.readFile("./package.json", function (err, data) {
			assert.isDefined(data, "Expected package.json defined");
		});
	},

	'crafity.imageinfo must have the same version as quoted in package.json': function () {

		fs.readFile("./package.json", function (err, data) {
			var json = JSON.parse(data.toString());
			console.log("package.version =", json.version);

			assert.isDefined(json.version, "Expected fs to be defined");
			assert.areEqual(main.version, json.version, "Expected the same module version!");
		});
	},

	'crafity.imageinfo must read crafity image of type png': function () {

		main.readInfoFromFile("./test/data/crafity.png", function (err, data) {
			if (err) { return console.error(err); }

//			console.log(data);
//			console.log("data.toString()", data.toString());

			assert.isDefined(data, "Expected data to be defined");
			assert.areEqual(data.format.toUpperCase(), "png".toUpperCase(), "Expected PNG format!");
		});
	},

	'crafity.imageinfo must be able to read images larger than 2MB': function () {

		main.readInfoFromFile("./test/data/lisbon.jpg", function (err, data) {
			if (err) { return console.error(err); }

			assert.isDefined(data, "Expected data to be defined");
			assert.areEqual(data.format.toUpperCase(), "JPEG".toUpperCase(), "Expected JPEsG format!");
		});
	},

	'crafity.imageinfo must read github_logo image of type jpg': function () {

		main.readInfoFromFile("./test/data/github_logo.jpg", function (err, data) {
			if (err) { return console.error(err); }

//			console.log(data);
//			console.log("data.toString()", data.toString());

			assert.isDefined(data, "Expected data to be defined");
			assert.areEqual(data.format.toUpperCase(), "jpeg".toUpperCase(), "Expected PNG format!");
		});
	},

	'crafity.imageinfo must be able to read EXIF data from lisbon.jpg': function () {
		var expectedResult = {
			format: 'JPEG',
			version: '',
			width: 2592,
			height: 1936,
			bpp: 24,
			alpha: false,
			exif: {
				Make: 'Apple',
				Model: 'iPhone 4',
				Orientation: 1,
				XResolution: 72,
				YResolution: 72,
				ResolutionUnit: 2,
				Software: '6.0',
				DateTime: '2012:09:26 20:16:53',
				YCbCrPositioning: 1,
				ExifIFDPointer: 198,
				GPSInfoIFDPointer: 588,
				ExposureTime: 0.030303030303030304,
				FNumber: 2.8,
				ExposureProgram: 'Normal program',
				ISOSpeedRatings: 80,
				ExifVersion: '0221',
				DateTimeOriginal: '2012:09:26 20:16:53',
				DateTimeDigitized: '2012:09:26 20:16:53',
				ComponentsConfiguration: 'YCbCr',
				ShutterSpeedValue: 5.060407569141193,
				ApertureValue: 2.970853573907009,
				BrightnessValue: 3.750871755133669,
				MeteringMode: 'Pattern',
				Flash: 'Flash did not fire, compulsory flash mode',
				FocalLength: 3.85,
				SubjectArea: [1295, 967, 699, 696],
				FlashpixVersion: '0100',
				ColorSpace: 1,
				PixelXDimension: 2592,
				PixelYDimension: 1936,
				SensingMethod: 'One-chip color area sensor',
				ExposureMode: 0,
				WhiteBalance: 'Auto white balance',
				FocalLengthIn35mmFilm: 35,
				SceneCaptureType: 'Standard',
				GPSLatitudeRef: 'N',
				GPSLatitude: [38, 46.29, 0],
				GPSLongitudeRef: 'W',
				GPSLongitude: [9, 6.89, 0],
				GPSAltitudeRef: 0,
				GPSAltitude: 113.04854368932038,
				GPSTimeStamp: [19, 15, 57.01],
				GPSImgDirectionRef: 'T',
				GPSImgDirection: 23.50473186119874
			}
		};

		main.readInfoFromFile("./test/data/lisbon.jpg", function (err, data) {
			if (err) { return console.error(err); }

			//console.log(data);
			//console.log("data.toString()", data.toString());

			assert.isDefined(data, "Expected data to be defined");
			assert.areEqual(data, expectedResult, "Expected EXIF data");
		});

	}

};

/**
 * Run the tests
 */
context.run(tests);
