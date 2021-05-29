var Rx = require('rxjs');
var gpsDistance = require('gps-distance');
var utils = require('../utils');

var minDistance = 0.025;
const constants = {
    START_GPS_REQUEST: 'Intervals.GpsStartRequest',
    START_DIST_REQUEST: 'Intervals.DistanceLapRequest',
    CLEAR: 'Intervals.Clear'
};

var reset = false;

// vars for gps anchor laps
var lastKnownGps = null;
var anchorGps = null;

// vars for distance laps
var lap = false;
var anchorDistance = null;
var currentDistance = null;
var distance = 0;

// Start GPS
global.globalEvents
    .filter(t => t.name === constants.START_GPS_REQUEST)
    .subscribe(t => {
        console.log('Starting intervals @ ', lastKnownGps);
        if (!lastKnownGps) return;
        anchorGps = [lastKnownGps.latitude, lastKnownGps.longitude]
    });

// Start Distance
global.globalEvents
    .filter(t => t.name === constants.START_DIST_REQUEST)
    .subscribe((t) => {
        console.log('START_DIST_REQUEST!', [anchorDistance, currentDistance]);
        if (anchorDistance) {
            distance = currentDistance.value - anchorDistance.value;
            console.log('\t...new distance!', distance);
            lap = true;
        }

        if(!anchorDistance) {
            anchorDistance = currentDistance;
        }
    });

// Clear
global.globalEvents
    .filter(t => t.name === constants.CLEAR)
    .subscribe(() => {
        anchorGps = null;
        lastKnownGps = null;
        distanceStart = { value: 0 };
        anchorDistance = null;
        distance = 0;
        // distances = [];
        reset = true;
        console.log('Intervals.CLEAR!')
    });

function IntervalsFromDistance(events) {
    return events
        .filter(o => o.name === 'Distance')
        .map((d) => {
            currentDistance = {
                value: d.value,
                time: Date.now()
            };

            var detection = null;
            if (anchorDistance) {
                var diff = currentDistance.value - anchorDistance.value;
                console.log('...', JSON.stringify({ 
                    diff: diff,
                    time: (currentDistance.time - anchorDistance.time) / 1000,
                }));
                if(lap || (distance && diff >= distance)) {
                    lap = false;
                    // ...
                    detection = {
                        name: 'Interval',
                        value: {
                            distance: distance,
                            totalDistance: d.value * 1000,
                            time: (currentDistance.time - anchorDistance.time) / 1000,
                            timestamp: currentDistance.time
                        }
                    };

                    anchorDistance = currentDistance;

                    // console.log('!', detection);
                    // ...
                }
            }

            // nothing detected
            return detection;
        })
        .filter(o => !!o)
        .do(console.log)
        .share();
}

// Gps Lap Detector
function IntervalsFromGps(gpsEvents) {
    return gpsEvents
        .do(gps => lastKnownGps = gps)
        .filter(o => anchorGps != null)
        // distance to anchor point
        .map(gps => [
            gps,
            gpsDistance(anchorGps[0], anchorGps[1], gps.latitude, gps.longitude)
        ])
        // get distasnce between last gps - dist
        // what is closer? - desc
        // last gps - last
        // previous gps - prev
        // lap indicates the anchor was JUST passed
        .startWith({ desc: false, distance: Number.MAX_VALUE })
        .scan((acc, o) => {
            // compare distances:
            var gps = o[0];
            var dist = o[1];
            var nowDesc = dist < acc.dist
            if (acc.desc && !nowDesc && dist < minDistance) {
                acc.lap = true
            } else {
                acc.lap = false;
            }

            acc.prev = acc.last;
            acc.last = gps;
            acc.desc = nowDesc;
            acc.dist = dist;

            return acc;
        })
        // filter laps only
        .filter(s => s.lap)
        // accumulate to get lap time
        .map(s => s.prev.timestamp)
        .startWith([])
        .scan((acc, ts) => {
            if (acc.length === 2) {
                return [acc[1], ts];
            }

            acc.push(ts);
            return acc;
        })
        .filter(acc => acc.length === 2)
        // done, map time
        .map(acc => acc[1] - acc[0])
        // .do(ts => console.log(toHHMMSS(ts)))
        .map(t => ({
            name: 'Interval',
            value: {
                anchor: anchorGps,
                time: t,
                timestamp: Date.now()
            }
        }))
        .share();
}

module.exports = function (all, gpsEvents) {
    var intervalStream = Rx.Observable.merge(
        IntervalsFromGps(gpsEvents),
        IntervalsFromDistance(all))

    var clearIntervals = global.globalEvents
        .filter(t => t.name === constants.CLEAR)
        .delay(333)
        .map(() => ({
            name: 'Intervals',
            value: []
        }));

    return Rx.Observable.merge(
        intervalStream,
        clearIntervals,
        intervalStream
            .startWith([])
            .scan((acc, o) => {
                if (reset) {
                    acc = [];
                    reset = false;
                };
                acc = acc.concat(o.value);
                return acc;
            })
            .map(o => ({
                name: 'Intervals',
                value: o
            }))
    ).share();

}

module.exports.constants = constants;