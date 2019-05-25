var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));

var demoFile = argv.demoFile;
var demoMode = argv.demo || argv.d || !!demoFile;
var persist = !demoMode;
var displaySize = { width: 128, height: 64 };

if (!demoFile) {
  // https://www.strava.com/activities/508017565
  demoFile = './data/sensors-1456895867978-TestRideParqueSarmiento.sqlite3'
}

var config = {
  displaySize: displaySize,
  demoMode: demoMode,
  persist: persist,
  persistBuffer: 0,
  inputDrivers: [
    './inputs_gpio',
    './inputs_console'
  ],
  displayDrivers: [
    './display/drivers/oled',
    './display/drivers/web'
  ],
  dbFile:
  demoMode ? demoFile
    : `./data/session-${Date.now()}.sqlite3`,
  sensors: {
    // refresh times
    // indiscreet: {
    //   wifi: 5000
    // },
    lsm303: {
      acceleration: 0,
      axes: 0,
      heading: 1000,
      temp: 3000
    },
    cpu: 3000,
    // temperature: 3000,
    memory: 10000
  },
};

module.exports = config;
