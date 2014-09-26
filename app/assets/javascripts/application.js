//= require jquery
//= require jquery_ujs
//= require websocket_rails/main
//= require_tree ./lib
//= require_tree .


/*=== Application
==============================================================================================*/
window.App = (function () {

  var SOCKET_ENDPOINT = window.location.host + '/websocket';

  var App = function () {
    // do nothing (defer initialization)
  };

  var $$ = App.prototype;

  $$.run = function () {
    this.dispatcher = new WebSocketRails(SOCKET_ENDPOINT);
    this.broadChannel = this.dispatcher.subscribe('broad');

    this.$debug = $('<span style="font-size: 40px;" />').appendTo('body');

    this._events();
  };

  $$._events = function () {
    // Register remote logger
    this.broadChannel.bind('console.log', function (data) {
      console.log.call(console, data);
    });
  };

  $$.log = function () {
    this.broadChannel.trigger('console.log', arguments);
  };

  $$.debug = function () {
    this.$debug.text(Array.apply(null, arguments).join(', '));
  };

  return new App();

})();



/*=== Hist buffer
==============================================================================================*/
window.HistBuffer = (function () {

  var HistBuffer = function (num) {
    this._hasData = false;

    this.num = num;
    this.buffer = Array.apply(null, Array(this.num));
  };

  var $$ = HistBuffer.prototype;

  $$.reset = function(data) {
    if (data == null) {
      data = 0;
    }

    this.buffer = this.buffer.map(function () { return data });
  };

  $$.getAverage = function (ary) {
    var sum = this.buffer.reduce(function (a, b) { return a + b });

    return sum / this.num;
  };

  $$.add = function (data) {
    if (this._hasData) {
      this.buffer.unshift(data);
      this.buffer.length = this.num;
    } else {
      this.reset(data);
      this._hasData = true;
    }
  }

  return HistBuffer;

})();


/*=== Konashi
==============================================================================================*/
window.Konashi = (function () {

  var NUM_HIST = 4;
  var PIN_MODE = parseInt('11111110', 2);

  var Konashi = function (id) {
    this.id = id;
    this.k = window.k;
    this.timer = null;
    this.signalHist = new HistBuffer(NUM_HIST);
    this.isNear = false;

    this._events();

    this.k.findWithName(this.id);
  };

  var $$ = Konashi.prototype;

  $$._events = function () {
    this.k.connected(this.connected.bind(this));
    this.k.disconnected(this.disconnected.bind(this));
    this.k.ready(this.ready.bind(this));
    this.k.updateSignalStrength(this.updateSignalStrength.bind(this));
    this.k.updatePioInput(this.updatePioInput.bind(this));
  };

  $$.connected = function () {
    App.log('connected!');
  };

  $$.disconnected = function () {
    clearInterval(this.timer);
  };

  $$.ready = function () {
    this.k.pinModeAll(PIN_MODE);
    // this.k.pinMode(this.k.PIO0, this.k.INPUT);
    // this.k.pinMode(this.k.PIO2, this.k.OUTPUT);

    this.timer = setInterval(this._tick.bind(this), 500);
  };

  $$._tick = function () {
    this.k.digitalWrite(this.k.PIO2, this.k.HIGHT);
    this.k.signalStrengthReadRequest();
    // this.k.analogReadRequest(this.k.AIO0);
  };

  $$.updatePioInput = function (data) {
    App.log(data);
  };

  $$.updateSignalStrength = function (data) {
    data *= -1;

    this.signalHist.add(data);

    var avg = this.signalHist.getAverage() | 0;
    var isNear = avg < 70;

    App.debug(data, avg);

    if (isNear != this.isNear) {
      this.isNear = isNear;
      App.log(this.isNear ? 'near' : 'far');
    }
  };

  return Konashi;

})();


/*=== Main
==============================================================================================*/
$(function () {

  App.run();
  new Konashi('konashi#4-1591');

});
