'use strict'

var path = require('path');
var course = require('course'); //permite crear rutas dinamicas, si hay una peticion este busca si hay un archivo con esa ruta
var st = require('st'); // para brindar todo el public directory, manejo de archivos estaticos
var jsonbody = require('body/json'); //
var helper = require('../helper');

var router = course();
var mount = st({
	path: path.join(__dirname, '..', 'public'),
	index: 'index.html',
	passthrough: true //si no hay  un archivo statico continua la ejecucion
});

router.post('/process', function(req, res) { //recibe las imagenes
	jsonbody(req, res, { // veirfica los archivos decibidos
		limit: 3 * 1024 * 1024 //size of files
	}, function(err, body) {
		if (err) return fail(err, res);

		if (Array.isArray(body.images)) {
			var converter = helper.convertVideo(body.images);
			
			converter.on('log', function(msg) {
				console.log(msg)
			})

			converter.on('video', function(video) {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({
					video: video
				}));
			})

		} else {
			res.statusCode = 500
			res.end(JSON.stringify({
				error: 'parameter `images` is required'
			}))
		}
	});
});

function onRequest(req, res) {
	mount(req, res, function(err) {
		if (err) return fail(err, res);

		router(req, res, function(err) {
			if (err) return fail(err, res);

			res.statusCode = 404;
			res.end('404 Not Found:' + req.url);
		});
	});

}

function fail(err, res) {
	res.statusCode = 500;
	res.setHeader('Content-Type', 'text/plain');
	res.end(err.message);
}

module.exports = onRequest