var Webrtc2Images = require('webrtc2images'); //para gravar imagenes
var xhr = require('xhr');
var rtc = new Webrtc2Images({
  width: 200,
  height: 200,
  frames: 10,
  type: 'images/jpeg',
  quality: 0.4,
  interval: 200
});

rtc.startVideo(function(err) {
  if (err) return logError(err)
}); //inicia la camara

var record = document.querySelector('#record');

record.addEventListener('click', function(e) { //click en record
  e.preventDefault();

  rtc.recordVideo(function(err, frames) {
    if (err) return logError(err);
    console.log(frames);
    //envia mediante post las imagenes
    xhr({
      uri: '/process',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        images: frames
      })
    }, function(err, res, body) {
      if (err) logError(err);
      console.log(JSON.parse(body));
    });

  }); //start to record

}, false);

function logError(err) {
  console.error(err);
}