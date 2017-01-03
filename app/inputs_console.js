var keypress = require('keypress');
var Rx = require('rxjs');

module.exports = function ConsoleInput() {

  var inputBack = new Rx.Subject();
  var inputNext = new Rx.Subject();
  var inputOk = new Rx.Subject();

  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin);

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {

    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
      process.exit();
    }

    if (!key) return;

    switch (key.name) {
      case 'a':
        inputBack.next({ name: 'Input:Back' });
        break;
      case 's':
        inputBack.next({ name: 'Input:Next' });
        break;
      case 'd':
        inputBack.next({ name: 'Input:Ok' });
        break;
      case 'f':
        inputBack.next({ name: 'Input:LongOk' });
      case 'space':
        inputBack.next({ name: 'Input:Shake' });
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  return Rx.Observable.merge(inputBack, inputNext, inputOk)
    .share();
}