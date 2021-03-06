const firmata = require('firmata');
const j5 = require('johnny-five');

const SERVO_PIN = 3;
const POS_MAX = 240;
const POS_MIN = 0;
let servoPos = 90;

// start the johnny-five connection
const board = new firmata.Board('/dev/ttyACM0', err => {
    err && console.error(err);
});

let moving = false;
function moveServo(pos) {
  if (moving) return;
  moving = true;
  board.servoWrite(SERVO_PIN, pos);
  setTimeout(() => moving = false, 1000);
}
board.on('ready', function(err) {
  console.log('BOARD READY');
  board.servoConfig(SERVO_PIN, POS_MIN, POS_MAX);
  moveServo(servoPos);
});

var pingBoard = new j5.Board({port: '/dev/ttyUSB0', repl: false});

pingBoard.on("ready", function() {
  const sonar = new j5.Proximity({
    controller: 'HCSR04',
    pin: 'A0'
  });

  sonar.on('data', function() {
    if (this.cm < 20 && !moving) {
      if (servoPos === (POS_MAX+POS_MIN)/2) {
        servoPos = POS_MAX;
      } else if (servoPos === POS_MAX) {
        servoPos = POS_MIN;
      } else {
        servoPos = (POS_MAX+POS_MIN)/2;
      }
      console.log(`blocked..moving to ${servoPos}`);
      moveServo(servoPos);
    }
  });
});
