module.change_code = 1;

var BaseDisplay = require('./base-display');
var inherits = require('util').inherits;
var tetrisGame = require('tetris/lib/tetris-game');

var width = 64;
var height = 128;

module.exports = TetrisDisplay;

function TetrisDisplay(driver, events) {
    BaseDisplay.call(this, driver, events);
}
inherits(TetrisDisplay, BaseDisplay);

TetrisDisplay.prototype.refreshDisplayDelay = 999999;
TetrisDisplay.prototype.rerouteInput = true;
TetrisDisplay.prototype.init = function (driver) {
    console.log('.TetrisDisplay:init');
    tetrisGame.start();
    tetrisGame.on('board_updated', () => drawBoard(driver, tetrisGame));
    this.pauseReroute = false;
}

TetrisDisplay.prototype.processEvent = function (driver, e) {
    var move = getMovement(e.name);
    if (!move) return;

    if (move === 'Pause') {
        this.pauseReroute = !this.pauseReroute;
        this.rerouteInput = !this.pauseReroute;
        if (this.pauseReroute) {
            console.log('.TetrisDisplay:pause');
            tetrisGame.pause();
        } else {
            tetrisGame.start();
        }
        return;
    }


    if (this.pauseReroute) return;

    var over = tetrisGame.tryMove(move);
    // tetrisGame.unpause();

    if (over || tetrisGame.getState() === tetrisGame.States.OVER) {
        console.log('.TetrisDisplay :(')
        tetrisGame.start();
    }
}

function getMovement(evtName) {
    switch (evtName) {
        case 'Input:A':
            return tetrisGame.Moves.MoveLeft;
        case 'Input:C':
            return tetrisGame.Moves.MoveRight;
        case 'Input:B':
            return tetrisGame.Moves.RotClock;
        case 'Input:LongB'
            return tetrisGame.Moves.Drop;
        default:
            return null;
    }
}

function drawBoard(driver, game) {

    var zoom = 6;
    function drawPixel(x, y, bit) {
        x = x * zoom;
        y = 6 + y * zoom;

        driver.drawRect(x, y, zoom, zoom, bit, true);
        driver.fillRect(x + 2, y + 2, zoom, zoom, bit, false);
    }

    // ...
    var board = game.getBoard();
    for (var y = 0; y < board.length; y++) {
        var row = board[y];
        for (var x = 0; x < row.length; x++) {
            var bit = row[x];
            drawPixel(x, y, bit);
        }
    }

    // update buffer
    driver.display();
};