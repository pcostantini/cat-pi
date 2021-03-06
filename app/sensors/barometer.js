var Rx = require('rxjs');
var BMP085 = require('bmp085');

function Barometer(delay) {
  if(!delay) delay = 5000;

  return Rx.Observable.create(function (observer) {
    function read(sensor) {
      sensor.read(function (data) {
        // TODO: circuit braker on error threshold reached
        setTimeout(() => read(sensor), delay);
        observer.next({ name: 'Barometer', value: data });
      });
    }

    var sensor = new BMP085();
    read(sensor);
  });
}

module.exports = Barometer;
