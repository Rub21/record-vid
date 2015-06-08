'use strict'

var os = require('os');
var fs = require('fs');
var path = require('path');
var async = require('async');
var dataURIBuffer = require('data-uri-to-buffer');
var uuid = require('uuid'); //para dar una identificacion unica a los archivos
var EventEmitter = require('events').EventEmitter;
var listFiles = require('./list');
var concat = require('concat-stream');
var ffmpeg = require('./ffmpeg');

module.exports = function(images) {

	var events = new EventEmitter();
	var count = 0;
	var baseName = uuid.v4();
	var tmpDir = os.tmpDir();
	var video;

	async.series([decodeImages, createVideo, encodeVideo], convertFinished); //cada uno se ejecuta en form secuencial

	// Decode images to files
	function decodeImages(done) { //done=callback
		async.eachSeries(images, decodeImage, done); //each para el procesamiento de las imagenes
	}

	function decodeImage(image, done) {
		var fileName = baseName + '-' + (count++) + '.png';
		fileName = fileName.toString();
		var buffer = dataURIBuffer(image);
		var ws = fs.createWriteStream(path.join(tmpDir, fileName));

		ws.on('error', done)
			.end(buffer, done);
		events.emit('log', 'Converting : ' + fileName);
	}
	// Create video from images with ffmpeg
	function createVideo(done) {
		events.emit('log', 'Creating video');
		ffmpeg({
			baseName: baseName,
			folder: tmpDir
		}, done);
	}

	// Encode video
	function encodeVideo(done) {
		var fileName = baseName + '.webm';
		var rs = fs.createReadStream(path.join(tmpDir, fileName));

		events.emit('log', 'Encoding video' + fileName);

		rs.pipe(concat(function(videoBuffer) {
			video = 'data:video/webm;base64,' + videoBuffer.toString('base64');
			done()
		}))

		rs.on('error', done)
	}

	// Cleanup temp folder
	function cleanup(done) {
		events.emit('log', 'Cleaning up');

		listFiles(tmpDir, baseName, function(err, files) {
			if (err) return done(err)

			// delete files
			deleteFiles(files, done);
		});
	}
	// Delete all files
	function deleteFiles(files, done) {
		async.each(files, deleteFile, done);

	}


	// Delete one file
	function deleteFile(file, done) {
		events.emit('log', 'Deleting : ' + file);

		fs.unlink(path.join(tmpDir, file), function(err) {
			// ignore error
			done();
		});
	}

	// Convertion finished
	function convertFinished(err) {
		if (err) return events.emit('error', err);
		events.emit('video', video);
	}

	return events;
}