'use strict'

var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn; //modulos por defecto , para ejecutar
//ejecutar el comando y entrega ellos codigos de satiscfactorio y error.

module.exports = function(options, callback) {
  if (!options.baseName) return callback(new TypeError('You must specify a baseName'));

  var folder = options.folder || os.tmpDir();
  var baseName = options.baseName;
  var fileSrc = path.join(folder, baseName + '-%d.png');
  var fileDest = path.join(folder, baseName + '.webm');

  //rub21
  //mogrify -format png /tmp/*.jpg

  // ffmpeg -i images-%d.png -filter:v "setpts=2.5*PTS" -vcodec libvpx -an video.webm
  var ffmpeg = spawn('ffmpeg', [
    '-i',
    fileSrc,
    '-filter:v',
    'setpts=2.5*PTS',
    '-vcodec',
    'libvpx',
    '-an',
    fileDest
  ]);


  ffmpeg.stdout.on('close', function(code) { //tiene los ouput de salida, 
    //el codigo de ejecucion es =0 , es porque el comando se ejecuto bien 
    ////si termina con otro numero el comando se ejecuto con error
    if (!code) return callback(null); //code = 0, y en javascrpit 0=false !false=true

    callback(new Error('ffmpeg exited with code ' + code));
  })
}