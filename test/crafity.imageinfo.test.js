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
			assert.areEqual("png".toUpperCase(), data.format.toUpperCase(), "Expected PNG format!");
			assert.areEqual(398, data.width, "Expected width 320px !");
			assert.areEqual(179, data.height, "Expected height 320px !");
		});
	},

	'crafity.imageinfo must read github_logo image of type jpg': function () {

		main.readInfoFromFile("./test/data/github_logo.jpg", function (err, data) {
			if (err) { return console.error(err); }

//			console.log(data);
//			console.log("data.toString()", data.toString());

			assert.isDefined(data, "Expected data to be defined");
			assert.areEqual("jpeg".toUpperCase(), data.format.toUpperCase(), "Expected PNG format!");
			assert.areEqual(320, data.width, "Expected width 320px !");
			assert.areEqual(320, data.height, "Expected height 320px !");
		});
	}

};

/**
 * Run the tests
 */
context.run(tests);
