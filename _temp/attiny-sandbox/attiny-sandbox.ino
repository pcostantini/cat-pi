
#define SWITCH 3
#define LED 4

int brightness = 0;    // how bright the LED is
int fadeAmount = 3;    // how many points to fade the LED by

int oneSec = 1000;
unsigned long last;
unsigned int lup;

//
// the setup routine runs once when you press reset:
void setup() {
  // initialize the LED pin as an output.
  pinMode(LED, OUTPUT);
  // initialize the SWITCH pin as an input.
  pinMode(SWITCH, INPUT);
  // ...with a pullup
  digitalWrite(SWITCH, HIGH);

  reset();
}

int state = LOW;
bool ping() {
  // TODO: Debounce
  bool newState = !digitalRead(SWITCH);
  bool ping = (state != newState && newState == HIGH);
  state = newState;
  return ping;
}

void loop() {
  if (ping()) {
    // !!!
    lup++;
    brightness = 255;
  }

  if ( (millis() - last) > oneSec) {
    // every one sec, update value and send it!
    updateAndSend();
    reset();
  }

  if (brightness > 0) {
    // reduce pulse
    brightness = brightness - fadeAmount;
  }

  analogWrite(LED, brightness);

  delay(1);
}

void updateAndSend() {
  // todo:
}

void reset() {
  last = millis();
}

