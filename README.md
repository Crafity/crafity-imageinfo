#ImageInfo

##Sample Code

	var imageinfo = require('imageinfo');
	imageinfo.readInfoFromFile("image.jpg", function (err, data) {
		if (err) { return console.error(err); }
		console.log(data);
	});

##License
ImageInfo 0.1.2 - A Node Module for reading image metadata.
- Based on the JavaScript library from Jacon Seidelin
Copyright (c) 2012 Bart Riemens, briemens@crafity.com, http://crafity.com/

ImageInfo - A JavaScript library for reading image metadata.
Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
MIT License [http://www.nihilogic.dk/licenses/mit-license.txt]
