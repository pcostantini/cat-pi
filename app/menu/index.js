var exec = require('child_process').exec;
var _ = require('lodash');

var menu = [
  {
    name: 'kill_leds',
    type: 'bash',
    data: 'sudo echo 0 >/sys/class/leds/led0/brightness\n' +
          'sudo echo 0 >/sys/class/leds/led1/brightness'
  }, {
    name: 'wifi_reset',
    type: 'bash',
    data: 'sudo ifdown wlan0\n' +
          'sudo ifup wlan0' 
  }, {
    name: 'tetris',
    type: 'module',
    data: 'tetris'
  }, {
    name: 'shutdown',
    type: 'bash',
    data: 'sudo shutdown -h -H -t 0 0'
  }, {
    name: 'reboot',
    type: 'bash',
    data: 'sudo reboot'
  }
];

menu = menu.map(m => _.extend(
  {
    run: () => executeItem(m)
  }, m));

module.exports = menu;

function executeItem(menuItem) {
  console.log('running menuItem', menuItem);

  var menuFunc = getExecFunc(menuItem);
  var runResult = menuFunc();// TOD: pass context, state? or stream
}

function getExecFunc(menuItem) {
  switch(menuItem.type) {

    case 'bash':
      return function() {
        exec(
          menuItem.data,
          function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
            }
        });
      }

    default:
      // unhandled!
      return function() {
        console.log('UNRECOGNIZED.MENU_TYPE:' + menuItem.type, menuItem.data);
      }
  } 
}