'use strict'
var http = require('http');
var router = require('./router');

var port = process.env.PORT || 3000;
var server = http.createServer();

server.on('request', router);
server.on('listening', onListening);

server.listen(port)

function onListening() {
	console.log('Server running in port' + port);
}