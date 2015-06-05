'use strict'
var http = require('http');
var fs = require('fs');
var path = require('path');
var port = process.env.PORT || 8080;

var server = http.createServer();

server.on('request', onRequest);
server.on('listening', onListening);

server.listen(port);

function onRequest(req, res) {
	var index = path.join(__dirname, 'public', 'index.html')
	fs.readFile(index, function(err, file) {
		if (err) return res.end(err.message)

		res.setHeader('Content-Type', 'text/html')
		res.end(file)
	})
}

function onListening() {
	console.log('Server running in port ' + port)
}