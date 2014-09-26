//= require jquery
//= require jquery_ujs
//= require websocket_rails/main
//= require_tree ./lib
//= require_tree .


/*=== State manager
==============================================================================================*/
window.StateManager = (function () {

  var StateManager = function () {
  };

  var $$ = StateManager.prototype;

  $$.transition = function (from, to) {
  };

  return StateManager;

})();


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
    this.channel = this.dispatcher.subscribe('main');

    this.$debug = $('<div id="debug_console" />').appendTo('body');

    this._events();
  };

  $$._events = function () {
    // Register remote logger
    this.channel.bind('console.log', function (data) {
      console.log.call('console.log', console, data);
    });

    this.channel.bind('deal.request', function (data) {
      console.log('deal.request', data);
    });

    this.channel.bind('deal.accept', function (data) {
      console.log('deal.accept', data);
    });

    this.channel.bind('user.update_color', function (data) {
      console.log('user.update_color', data);
    });

    this.channel.bind('food.update_likes_count', function (data) {
      console.log('food.update_likes_count', data);
    });

    this.channel.bind('food_comment.create', function (data) {
      console.log('food_comment.create', data);
    });
  };

  $$.log = function () {
    this.channel.trigger('console.log', arguments);
  };

  $$.debug = function () {
    this.$debug.html(Array.apply(null, arguments).join('<br>'));
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
  var TICK_INTERVAL = 350;

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
    App.debug('Connected!');
    App.log('connected!');
  };

  $$.disconnected = function () {
    clearInterval(this.timer);
  };

  $$.ready = function () {
    this.k.pinModeAll(PIN_MODE);

    this.timer = setInterval(this._tick.bind(this), TICK_INTERVAL);
  };

  $$._tick = function () {
    this.k.signalStrengthReadRequest();
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

      if (this.isNear) {
        App.log('near');
        this.k.digitalWrite(this.k.PIO1, this.k.HIGH);
      } else {
        App.log('far');
        this.k.digitalWrite(this.k.PIO1, this.k.LOW);
      }
    }
  };

  return Konashi;

})();


/*=== Main
==============================================================================================*/
$(function () {

  App.run();

  $.get('/api/user').done(function (data) {
    console.log(data);
    App.current_user = data.user;
    new Konashi(data.the_other_user.konashi_id);
  });

  $.get('/api/foods').done(function (data) {
    console.log(data);
  });

  $.get('/api/foods/1/food_comments').done(function (data) {
    console.log(data);
  });

  setTimeout(function () {
    $.post('/api/foods/1/like');

    $.post('/api/foods/1/food_comments', {
      food_comment: { body: '美味しかったですー' }
    }).done(function (data) {
      console.log(data);
    });
  }, 2000);

});
